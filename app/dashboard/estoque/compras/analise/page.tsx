"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface Solicitacao {
    id: string;
    nome_peca: string;
    quantidade: number;
    referencia_1: string;
    referencia_2: string | null;
    referencia_3: string | null;
    status: 'PENDENTE' | 'EM_ANALISE' | 'COMPRADO' | 'EM_TRANSITO' | 'CONCLUIDO';
    fornecedor: string | null;
    valor: number | null;
    prazo_entrega: string | null;
    mes_ano: string;
}

export default function AnaliseComprasPage() {
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [itemSelecionado, setItemSelecionado] = useState<Solicitacao | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    // Campos de edição do Comprador 2
    const [fornecedor, setFornecedor] = useState('');
    const [valor, setValor] = useState('');
    const [prazoEntrega, setPrazoEntrega] = useState('');
    const [statusItem, setStatusItem] = useState<'PENDENTE' | 'EM_ANALISE' | 'COMPRADO' | 'EM_TRANSITO' | 'CONCLUIDO'>('EM_ANALISE');
    const [ref1, setRef1] = useState('');
    const [ref2, setRef2] = useState('');
    const [ref3, setRef3] = useState('');

    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Busca apenas itens abertos que precisam de análise ou tratamento de cotação
    async function carregarFilaFaturamento() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('estoque_compras')
                .select('*')
                .in('status', ['PENDENTE', 'EM_ANALISE'])
                .order('id', { ascending: true });

            if (error) throw error;
            if (data) setSolicitacoes(data as Solicitacao[]);
        } catch (err) {
            console.error("Erro ao alimentar fila de cotação:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarFilaFaturamento();
    }, []);

    // Alimenta os inputs do formulário ao clicar em um item da fila lateral
    const handleSelecionarItem = (item: Solicitacao) => {
        setItemSelecionado(item);
        setFornecedor(item.fornecedor || '');
        setValor(item.valor ? String(item.valor) : '');
        setPrazoEntrega(item.prazo_entrega || '');
        setStatusItem(item.status === 'PENDENTE' ? 'EM_ANALISE' : item.status);
        setRef1(item.referencia_1 || '');
        setRef2(item.referencia_2 || '');
        setRef3(item.referencia_3 || '');
        setStatusFeed({ tipo: '', texto: '' });
    };

    const handleSalvarAnalise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemSelecionado) return;

        setSalvando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const payload = {
                fornecedor: fornecedor.trim().toUpperCase(),
                valor: parseFloat(valor) || 0,
                prazo_entrega: prazoEntrega.trim().toUpperCase(),
                status: statusItem,
                referencia_1: ref1.trim().toUpperCase(),
                referencia_2: ref2.trim() ? ref2.trim().toUpperCase() : null,
                referencia_3: ref3.trim() ? ref3.trim().toUpperCase() : null,
            };

            const { error } = await supabase
                .from('estoque_compras')
                .update(payload)
                .eq('id', itemSelecionado.id);

            if (error) throw error;

            setStatusFeed({
                tipo: 'sucesso',
                texto: '⚖️ Cotação e status atualizados com sucesso na base central!'
            });

            // Remove ou atualiza o item local da fila de análise
            if (statusItem === 'COMPRADO' || statusItem === 'EM_TRANSITO' || statusItem === 'CONCLUIDO') {
                setSolicitacoes(prev => prev.filter(s => s.id !== itemSelecionado.id));
                setItemSelecionado(null);
            } else {
                setSolicitacoes(prev => prev.map(s => s.id === itemSelecionado.id ? { ...s, ...payload } : s));
            }

        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Erro ao processar auditoria da cotação.' });
        } finally {
            setSalvando(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#030303] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* BACKGROUND REPLICATOR */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `linear-gradient(to right, #dfbb6c 1px, transparent 1px), linear-gradient(to bottom, #dfbb6c 1px, transparent 1px)`, backgroundSize: '45px 40px' }} />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-6 max-w-[1400px] mx-auto">

                {/* HEADER */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/[0.04] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/estoque/compras" className="text-[#dfbb6c] font-black text-[9px] uppercase tracking-[4px] mb-2 block hover:opacity-80 transition-all">
                            ← Retornar ao Hub de Compras
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white leading-none">
                            ANÁLISE DE MERCADO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfbb6c] via-[#f7e0a3] to-white">&amp; COTAÇÃO</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5 font-bold font-mono">
                            ETAPA 02 • SANEAMENTO DE PREÇOS, FORNECEDORES E DESPACHO DE ENTRADA
                        </p>
                    </div>
                </header>

                {/* AREA DE TRABALHO DUPLA (COLUNAS) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full px-2">

                    {/* COLUNA 1: FILA DE SOLICITAÇÕES EM ABERTO */}
                    <div className="relative bg-[#09090b]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl lg:col-span-1 h-[600px] flex flex-col">
                        <h2 className="text-xs font-black uppercase tracking-[2px] text-[#dfbb6c] mb-4 flex items-center gap-2">
                            <span>⏳</span> Demandas Aguardando Cotação
                        </h2>

                        {carregando ? (
                            <div className="text-center py-20 text-[9px] uppercase font-black text-slate-500 tracking-[3px] animate-pulse">
                                Varrendo solicitações em aberto...
                            </div>
                        ) : solicitacoes.length === 0 ? (
                            <div className="text-center py-20 text-[10px] uppercase font-black text-slate-600 tracking-wider">
                                Fila zerada! Nenhuma solicitação pendente.
                            </div>
                        ) : (
                            <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 selection:bg-transparent">
                                {solicitacoes.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelecionarItem(item)}
                                        className={`w-full p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 group relative overflow-hidden ${
                                            itemSelecionado?.id === item.id
                                                ? 'bg-[#dfbb6c]/10 border-[#dfbb6c] text-white shadow-lg'
                                                : 'bg-black/40 border-white/[0.04] hover:border-white/[0.12] text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start gap-2 w-full">
                                            <h4 className="text-xs font-black uppercase tracking-wide truncate group-hover:text-[#dfbb6c] transition-colors">
                                                {item.nome_peca}
                                            </h4>
                                            <span className="text-[10px] font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded text-white shrink-0">
                                                {item.quantidade}x
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center w-full text-[8px] font-mono uppercase tracking-wider text-slate-500">
                                            <span>REF: {item.referencia_1}</span>
                                            <span className={`px-1.5 py-0.5 rounded border ${
                                                item.status === 'EM_ANALISE' ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' : 'border-slate-700 text-slate-400'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUNA 2 e 3: FORMULÁRIO DE COTAÇÃO FINANCEIRA */}
                    <div className="relative bg-[#09090b]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl lg:col-span-2 min-h-[600px]">
                        <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-[#dfbb6c]/20 to-transparent" />

                        {!itemSelecionado ? (
                            <div className="flex flex-col justify-center items-center h-full text-center py-48 text-[9px] uppercase font-black text-slate-600 tracking-[3px]">
                                ⚖️ Selecione uma solicitação na fila lateral para aplicar a cotação.
                            </div>
                        ) : (
                            <form onSubmit={handleSalvarAnalise} className="space-y-5">
                                <div className="border-b border-white/[0.04] pb-3 mb-2">
                                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Tratando Item ID: #{itemSelecionado.id}</span>
                                    <h3 className="text-base font-black uppercase tracking-wide text-white mt-1">
                                        {itemSelecionado.nome_peca} <span className="text-[#dfbb6c]">({itemSelecionado.quantidade} UNIDADES)</span>
                                    </h3>
                                </div>

                                {statusFeed.texto && (
                                    <div className={`p-3.5 rounded-xl border text-[10px] font-black uppercase tracking-wide ${
                                        statusFeed.tipo === 'sucesso' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
                                    }`}>
                                        {statusFeed.texto}
                                    </div>
                                )}

                                {/* FORNECEDOR E VALOR */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Fornecedor Mais Acessível Encontrado *</label>
                                        <input
                                            type="text"
                                            placeholder="EX: MERCADO DO MOTOR DISTRIBUIDORA"
                                            value={fornecedor}
                                            onChange={e => setFornecedor(e.target.value)}
                                            className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-bold uppercase placeholder-slate-800"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-1">
                                        <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Valor Unitário Cotação (R$) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={valor}
                                            onChange={e => setValor(e.target.value)}
                                            className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* PRAZO E STATUS DO ITEM */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Prazo de Entrega Estimado *</label>
                                        <input
                                            type="text"
                                            placeholder="EX: 4 DIAS ÚTEIS / ENTREGA IMEDIATA"
                                            value={prazoEntrega}
                                            onChange={e => setPrazoEntrega(e.target.value)}
                                            className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-bold uppercase placeholder-slate-800"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Alterar Status Operacional *</label>
                                        <select
                                            value={statusItem}
                                            onChange={e => setStatusItem(e.target.value as any)}
                                            className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-slate-300 text-xs font-bold uppercase cursor-pointer"
                                            required
                                        >
                                            <option value="PENDENTE">⏳ PENDENTE (AGUARDANDO RETORNO)</option>
                                            <option value="EM_ANALISE">⚖️ EM ANÁLISE (ORÇAMENTO ABERTO)</option>
                                            <option value="COMPRADO">💳 COMPRADO (COMPROVANTE EMITIDO)</option>
                                            <option value="EM_TRANSITO">🚚 EM TRÂNSITO (NFE LANÇADA)</option>
                                            <option value="CONCLUIDO">📦 ENTREGUE (NO ESTOQUE/CONCLUÍDO)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* AUDITORIA DE REFERÊNCIAS CRUZADAS */}
                                <div className="border-t border-white/[0.03] pt-4 mt-2">
                                    <span className="block text-[8px] font-mono font-black text-slate-500 uppercase tracking-[2px] mb-4">Auditoria e Refinamento de Códigos (Opcional Alterar)</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 1</label>
                                            <input type="text" value={ref1} onChange={e => setRef1(e.target.value)} className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono uppercase" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 2</label>
                                            <input type="text" value={ref2} onChange={e => setRef2(e.target.value)} className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono uppercase" placeholder="OPCIONAL" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 3</label>
                                            <input type="text" value={ref3} onChange={e => setRef3(e.target.value)} className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono uppercase" placeholder="OPCIONAL" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[3px] text-black transition-all active:scale-[0.99] disabled:opacity-40 overflow-hidden relative group mt-4"
                                    style={{ background: 'linear-gradient(135deg, #f7e0a3, #dfbb6c)' }}
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {salvando ? "Consolidando Auditoria..." : "Salvar e Atualizar Fluxo de Compra (Enter)"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-slate-800">PROCUREMENT PRICING ANALYSIS v2.0</div>
            </footer>
        </main>
    );
}