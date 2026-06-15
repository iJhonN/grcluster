"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface ItemContado {
    id_temporario: string;
    localizacao: string;
    referencia: string;
    quantidade: number;
}

export default function InventarioRapidoPage() {
    // Estados de localização iniciados COMPLETAMENTE VAZIOS para não induzir a erros
    const [rua, setRua] = useState('');
    const [estante, setEstante] = useState('');
    const [apartamento, setApartamento] = useState('');
    const [nivel, setNivel] = useState('');

    // Estados dos inputs da peça atual
    const [referencia, setReferencia] = useState('');
    const [quantidade, setQuantidade] = useState('');

    // Fila local de itens contados antes de enviar para o banco
    const [filaContagem, setFilaContagem] = useState<ItemContado[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [status, setStatus] = useState({ tipo: '', texto: '' });

    // Ref para jogar o foco de volta ao input de referência automaticamente
    const referenciaInputRef = useRef<HTMLInputElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Adiciona o item atual na lista temporária da tela
    const handleAdicionarItem = (e: React.FormEvent) => {
        e.preventDefault();

        // Validação estrita para impedir o cadastro caso o operador tenha esquecido de preencher o endereço
        if (!rua.trim() || !estante.trim() || !apartamento.trim() || !nivel.trim()) {
            setStatus({ tipo: 'erro', texto: 'Atenção! Preencha todo o endereço de localização (Rua, Estante, Apart. e Nível) antes de incluir a peça.' });
            return;
        }

        if (!referencia.trim() || !quantidade || Number(quantidade) <= 0) {
            setStatus({ tipo: 'erro', texto: 'Informe uma referência válida e a quantidade.' });
            return;
        }

        const localizacaoFormatada = `R:${rua.trim().padStart(2, '0')}-E:${estante.trim().padStart(2, '0')}-AP:${apartamento.trim().padStart(2, '0')}-N:${nivel.trim().padStart(2, '0')}`;

        const novoItem: ItemContado = {
            id_temporario: Math.random().toString(36).substring(2, 9),
            localizacao: localizacaoFormatada,
            referencia: referencia.trim().toUpperCase(),
            quantidade: Number(quantidade)
        };

        setFilaContagem([novoItem, ...filaContagem]);

        // Limpa apenas os campos da peça para manter o endereço fixo enquanto ele trabalha na mesma prateleira
        setReferencia('');
        setQuantidade('');
        setStatus({ tipo: '', texto: '' });

        // Devolve o foco do teclado para a Referência imediatamente
        referenciaInputRef.current?.focus();
    };

    const handleRemoverItemFila = (id: string) => {
        setFilaContagem(filaContagem.filter(item => item.id_temporario !== id));
    };

    const handleGravarNoEstoque = async () => {
        if (filaContagem.length === 0) return;

        setSalvando(true);
        setStatus({ tipo: '', texto: '' });

        try {
            const dadosParaInserir = filaContagem.map(item => ({
                localizacao: item.localizacao,
                referencia: item.referencia,
                quantidade: item.quantidade,
                string_completa: `${item.localizacao}-REF:${item.referencia}-QTD:${item.quantidade}`
            }));

            const { error } = await supabase
                .from('inventario_balanco')
                .insert(dadosParaInserir);

            if (error) throw error;

            setStatus({ tipo: 'sucesso', texto: '🔥 Contagem enviada e salva no banco de dados com sucesso!' });
            setFilaContagem([]);
            referenciaInputRef.current?.focus();
        } catch (err: any) {
            console.error(err);
            setStatus({ tipo: 'erro', texto: err.message || 'Erro ao salvar no servidor.' });
        } finally {
            setSalvando(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#030303] text-white p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* BACKGROUND LINES */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/[0.03] rounded-full blur-[130px]" />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-8">
                {/* HEADER */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/[0.04] pb-6 px-2">
                    <div>
                        <Link href="/dashboard" className="text-orange-500 font-black text-[9px] uppercase tracking-[4px] mb-1.5 block hover:opacity-70 transition-all">
                            ← Painel Principal
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Contagem Direta <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">de Peças</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5 font-bold">
                            Módulo de Inventário em Tempo Real • GR Autopeças
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full px-2">

                    {/* COLUNA 1: ENTRADA DE DADOS DA PEÇA */}
                    <div className="relative bg-[#09090b]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl lg:col-span-1 space-y-5">
                        <h2 className="text-sm font-black uppercase tracking-[2px] text-orange-400 flex items-center gap-2">
                            <span>📦</span> Bipagem / Digitação
                        </h2>

                        {status.texto && (
                            <div className={`p-3.5 rounded-xl border text-[10px] font-black uppercase tracking-wide ${
                                status.tipo === 'sucesso' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
                            }`}>
                                {status.texto}
                            </div>
                        )}

                        {/* COORDENADAS DE LOCALIZAÇÃO OBRIGATÓRIAS */}
                        <div className="bg-black/40 border border-white/[0.03] p-4 rounded-2xl space-y-3">
                            <span className="block text-[8px] font-black uppercase tracking-[2px] text-slate-500">Endereço do Estoque (Fica salvo)</span>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-bold text-slate-600 uppercase">Rua</label>
                                    <input type="text" placeholder="--" value={rua} onChange={e => setRua(e.target.value)} className="w-full bg-black border border-white/[0.06] focus:border-orange-500/40 text-center py-1.5 rounded-lg outline-none font-mono text-xs text-orange-400 font-bold placeholder-slate-800" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-bold text-slate-600 uppercase">Estante</label>
                                    <input type="text" placeholder="--" value={estante} onChange={e => setEstante(e.target.value)} className="w-full bg-black border border-white/[0.06] focus:border-orange-500/40 text-center py-1.5 rounded-lg outline-none font-mono text-xs text-orange-400 font-bold placeholder-slate-800" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-bold text-slate-600 uppercase">Apart.</label>
                                    <input type="text" placeholder="--" value={apartamento} onChange={e => setApartamento(e.target.value)} className="w-full bg-black border border-white/[0.06] focus:border-orange-500/40 text-center py-1.5 rounded-lg outline-none font-mono text-xs text-orange-400 font-bold placeholder-slate-800" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-bold text-slate-600 uppercase">Nível</label>
                                    <input type="text" placeholder="--" value={nivel} onChange={e => setNivel(e.target.value)} className="w-full bg-black border border-white/[0.06] focus:border-orange-500/40 text-center py-1.5 rounded-lg outline-none font-mono text-xs text-orange-400 font-bold placeholder-slate-800" required />
                                </div>
                            </div>
                        </div>

                        {/* ENTRADA DA PEÇA ATUAL */}
                        <form onSubmit={handleAdicionarItem} className="space-y-4 pt-1">
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black uppercase tracking-[2px] text-slate-400">Referência da Peça *</label>
                                <input
                                    ref={referenciaInputRef}
                                    type="text"
                                    placeholder="Ex: NKF8216"
                                    value={referencia}
                                    onChange={e => setReferencia(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-sm font-mono tracking-widest uppercase placeholder-slate-800"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[8px] font-black uppercase tracking-[2px] text-slate-400">Quantidade Encontrada *</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 3"
                                    value={quantidade}
                                    onChange={e => setQuantidade(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-sm font-mono tracking-widest placeholder-slate-800"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]"
                            >
                                ➕ Incluir na Fila (Enter)
                            </button>
                        </form>
                    </div>

                    {/* COLUNA 2 e 3: FILA DE CONTAGEM LOCAL E PRÉ-VISUALIZAÇÃO */}
                    <div className="relative bg-[#09090b]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl lg:col-span-2 min-h-[450px] flex flex-col justify-between">
                        <div className="space-y-4 w-full">
                            <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                                <h2 className="text-xs font-black uppercase tracking-[2px] text-slate-300">
                                    📋 Peças Coletadas para Envio
                                </h2>
                                <span className="text-[9px] bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-md font-black uppercase tracking-wider font-mono">
                                    {filaContagem.length} itens aguardando
                                </span>
                            </div>

                            {filaContagem.length === 0 ? (
                                <div className="py-28 text-center text-[9px] uppercase font-black text-slate-600 tracking-[3px]">
                                    Nenhum item na fila. Insira as peças ao lado.
                                </div>
                            ) : (
                                <div className="overflow-x-auto max-h-[400px] pr-1">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                        <tr className="border-b border-white/[0.04] text-slate-500 uppercase tracking-wider text-[8px] font-black pb-3">
                                            <th className="pb-3 pl-2">Endereço</th>
                                            <th className="pb-3 text-center">Referência</th>
                                            <th className="pb-3 text-center">Quantidade</th>
                                            <th className="pb-3 text-right pr-2">Ação</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.015]">
                                        {filaContagem.map((item) => (
                                            <tr key={item.id_temporario} className="hover:bg-white/[0.01] transition-colors group">
                                                <td className="py-3.5 pl-2 font-mono text-[11px] text-slate-500">
                                                    {item.localizacao}
                                                </td>
                                                <td className="py-3.5 text-center font-black text-white uppercase tracking-widest font-mono text-sm">
                                                    {item.referencia}
                                                </td>
                                                <td className="py-3.5 text-center font-black text-orange-400 font-mono text-sm">
                                                    {item.quantidade} un
                                                </td>
                                                <td className="py-3.5 text-right pr-2">
                                                    <button
                                                        onClick={() => handleRemoverItemFila(item.id_temporario)}
                                                        className="text-red-500/70 hover:text-red-400 font-black uppercase text-[8px] tracking-wider bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all"
                                                    >
                                                        Remover
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {filaContagem.length > 0 && (
                            <button
                                onClick={handleGravarNoEstoque}
                                disabled={salvando}
                                className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[2px] text-black transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden relative mt-6"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                            >
                                {salvando ? "Processando e Salvando..." : "🚀 Descarregar e Gravar Tudo no Estoque"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left px-2">
                <div>GR Autopeças & Serviços</div>
                <div className="font-mono text-slate-800">Módulo Balanço Real-Time v1.1</div>
            </footer>
        </main>
    );
}