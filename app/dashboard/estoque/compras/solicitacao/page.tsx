"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function SolicitacaoCompraPage() {
    const router = useRouter();
    const anoAtual = new Date().getFullYear();

    // Campos focados no Comprador 1
    const [nomePeca, setNomePeca] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [referencia1, setReferencia1] = useState('');
    const [referencia2, setReferencia2] = useState('');
    const [referencia3, setReferencia3] = useState('');

    const [enviando, setEnviando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSalvarSolicitacao = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        // Identifica automaticamente o mês e ano do calendário atual para organizar na planilha correta
        const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        const mesAnoChave = `${mesAtual}-${anoAtual}`;

        try {
            const payload = {
                nome_peca: nomePeca.trim().toUpperCase(),
                quantidade: parseInt(quantidade) || 1,
                referencia_1: referencia1.trim().toUpperCase(),
                referencia_2: referencia2.trim() ? referencia2.trim().toUpperCase() : null,
                referencia_3: referencia3.trim() ? referencia3.trim().toUpperCase() : null,

                // Campos nulos/padrão que serão alimentados pelo Comprador 2 na etapa de análise
                valor: 0,
                fornecedor: null,
                prazo_entrega: null,

                // Status inicial obrigatório do fluxo
                status: 'PENDENTE',
                mes_ano: mesAnoChave,
                criado_em: new Date().toISOString()
            };

            const { error } = await supabase
                .from('estoque_compras')
                .insert([payload]);

            if (error) throw error;

            setStatusFeed({
                tipo: 'sucesso',
                texto: '✍️ Solicitação registrada! A demanda foi enviada para a fila de análise do Comprador 2.'
            });

            // Reseta campos
            setNomePeca('');
            setQuantidade('');
            setReferencia1('');
            setReferencia2('');
            setReferencia3('');

            setTimeout(() => {
                router.push('/dashboard/estoque/compras');
            }, 1300);

        } catch (err: any) {
            console.error(err);
            setStatusFeed({
                tipo: 'erro',
                texto: err.message || 'Falha ao processar abertura de solicitação.'
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#030303] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `linear-gradient(to right, #dfbb6c 1px, transparent 1px), linear-gradient(to bottom, #dfbb6c 1px, transparent 1px)`, backgroundSize: '45px 40px' }} />
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#dfbb6c]/[0.01] rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center max-w-[1400px] mx-auto">
                <div className="w-full max-w-2xl mb-4 text-left px-2">
                    <Link href="/dashboard/estoque/compras" className="text-[#dfbb6c] font-black text-[9px] uppercase tracking-[4px] mb-2 block hover:opacity-80 transition-all">
                        ← Retornar ao Hub de Compras
                    </Link>
                </div>

                {/* FORM CONTAINER */}
                <div className="w-full max-w-2xl relative bg-[#09090b]/95 border border-white/[0.06] rounded-[36px] p-8 shadow-2xl backdrop-blur-3xl">
                    <div className="absolute top-0 left-[25%] right-[25%] h-px bg-gradient-to-r from-transparent via-[#dfbb6c]/30 to-transparent" />

                    <div className="mb-8">
                        <span className="text-[7px] font-mono text-[#dfbb6c] border border-[#dfbb6c]/30 px-2 py-0.5 rounded uppercase tracking-widest block w-max mb-2">ETAPA 01 • COMPRADOR 1</span>
                        <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                            <span>✍️</span> Solicitação de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfbb6c] via-[#f7e0a3] to-white">Novas Peças</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold font-mono">
                            Levantamento de Necessidades de Reposição e Código de Peças
                        </p>
                    </div>

                    {statusFeed.texto && (
                        <div className={`mb-6 p-4 rounded-xl border text-[10px] font-black uppercase tracking-wide text-center leading-relaxed ${
                            statusFeed.tipo === 'sucesso' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
                        }`}>
                            {statusFeed.texto}
                        </div>
                    )}

                    <form onSubmit={handleSalvarSolicitacao} className="space-y-5">

                        {/* LINHA 1: PEÇA E QUANTIDADE */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-1.5 sm:col-span-3">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Descrição / Nome da Peça</label>
                                <input
                                    type="text"
                                    placeholder="EX: TAMPA DO DISTRIBUIDOR VW GOL MOTOR AP"
                                    value={nomePeca}
                                    onChange={e => setNomePeca(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-bold uppercase placeholder-slate-800 transition-colors"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                            <div className="space-y-1.5 sm:col-span-1">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={quantidade}
                                    onChange={e => setQuantidade(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800 transition-colors"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                        </div>

                        {/* SEÇÃO DE COORDENADAS CRUZADAS (REFERÊNCIAS) */}
                        <div className="border-t border-white/[0.03] pt-4 mt-2">
                            <span className="block text-[8px] font-mono font-black text-slate-500 uppercase tracking-[2px] mb-4">Mapeamento de Códigos (Catálogos de Fábrica)</span>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 1 (Obrigatória)</label>
                                    <input
                                        type="text"
                                        placeholder="EX: VW 030905207"
                                        value={referencia1}
                                        onChange={e => setReferencia1(e.target.value)}
                                        className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800 uppercase transition-colors"
                                        required
                                        disabled={enviando}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 2</label>
                                    <input
                                        type="text"
                                        placeholder="EX: BOSCH 9232081442"
                                        value={referencia2}
                                        onChange={e => setReferencia2(e.target.value)}
                                        className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800 uppercase transition-colors"
                                        disabled={enviando}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 3</label>
                                    <input
                                        type="text"
                                        placeholder="EX: MARFLEX T10185"
                                        value={referencia3}
                                        onChange={e => setReferencia3(e.target.value)}
                                        className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800 uppercase transition-colors"
                                        disabled={enviando}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* NOTA OPERACIONAL INFORMATIVA */}
                        <div className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-wider bg-black/30 p-3 rounded-xl border border-white/[0.03] leading-normal">
                            ℹ️ Este registro nascerá com status "PENDENTE" na base central da GR Autopeças. Caberá ao setor de cotações (Comprador 2) validar os fornecedores, aplicar os custos de mercado e dar prosseguimento ao faturamento.
                        </div>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[3px] text-black transition-all active:scale-[0.99] disabled:opacity-40 overflow-hidden relative group mt-2"
                            style={{ background: 'linear-gradient(135deg, #f7e0a3, #dfbb6c)' }}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {enviando ? "Abrindo Requisição..." : "Enviar para o Setor de Análise (Enter)"}
                        </button>
                    </form>
                </div>
            </div>

            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-slate-800">PROCUREMENT ACQUISITION ENGINE v2.0</div>
            </footer>
        </main>
    );
}