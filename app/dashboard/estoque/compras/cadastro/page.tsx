"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function CadastroItemCompraPage() {
    const router = useRouter();
    const anoAtual = new Date().getFullYear();

    // Campos solicitados
    const [nomePeca, setNomePeca] = useState('');
    const [referencia1, setReferencia1] = useState('');
    const [referencia2, setReferencia2] = useState('');
    const [referencia3, setReferencia3] = useState('');
    const [fornecedor, setFornecedor] = useState('');
    const [valor, setValor] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [prazoEntrega, setPrazoEntrega] = useState('');

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

        // Identifica automaticamente em qual planilha de mês salvar com base na data atual
        const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        const mesAnoChave = `${mesAtual}-${anoAtual}`;

        try {
            const payload = {
                nome_peca: nomePeca.trim().toUpperCase(),
                referencia_1: referencia1.trim().toUpperCase(),
                referencia_2: referencia2.trim().toUpperCase(),
                referencia_3: referencia3.trim().toUpperCase(),
                fornecedor: fornecedor.trim().toUpperCase(),
                valor: parseFloat(valor) || 0,
                quantidade: parseInt(quantidade) || 1,
                prazo_entrega: prazoEntrega,
                status: 'SOLICITADO',
                mes_ano: mesAnoChave,
                criado_em: new Date().toISOString()
            };

            const { error } = await supabase
                .from('estoque_compras')
                .insert([payload]);

            if (error) throw error;

            setStatusFeed({
                tipo: 'sucesso',
                texto: '🛒 Solicitação injetada com sucesso no balanço de compras deste mês!'
            });

            setTimeout(() => {
                router.push('/dashboard/estoque/compras');
            }, 1300);

        } catch (err: any) {
            console.error(err);
            setStatusFeed({
                tipo: 'erro',
                texto: err.message || 'Falha ao processar cadastro de intenção de compra.'
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#030303] text-white p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center max-w-[1400px] mx-auto">
                <div className="w-full max-w-2xl mb-4 text-left px-2">
                    <Link href="/dashboard/estoque/compras" className="text-orange-500 font-bold text-[10px] uppercase tracking-[3px] hover:opacity-80 transition-all">
                        ← Voltar ao Livro de Compras
                    </Link>
                </div>

                <div className="w-full max-w-2xl relative bg-[#09090b]/95 border border-white/[0.06] rounded-[36px] p-8 shadow-2xl backdrop-blur-3xl">
                    <div className="absolute top-0 left-[25%] right-[25%] h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

                    <div className="mb-8">
                        <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                            <span>🛒</span> Cadastrar Demanda de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Compra</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">
                            Módulo do Comprador. Insira os códigos de referência cruzada para a cotação.
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
                        {/* NOME DA PEÇA */}
                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Nome Descritivo da Peça</label>
                            <input
                                type="text"
                                placeholder="EX: KIT EMBREAGEM VOLKSWAGEN DELIVERY"
                                value={nomePeca}
                                onChange={e => setNomePeca(e.target.value)}
                                className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-xs font-bold uppercase placeholder-slate-800"
                                required
                                disabled={enviando}
                            />
                        </div>

                        {/* REFERÊNCIAS 1, 2 E 3 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 1 (Principal)</label>
                                <input
                                    type="text"
                                    placeholder="EX: 10420-A"
                                    value={referencia1}
                                    onChange={e => referencia1 === '' ? setReferencia1('') : setReferencia1(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800 uppercase"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 2</label>
                                <input
                                    type="text"
                                    placeholder="EX: 93201"
                                    value={referencia2}
                                    onChange={e => setReferencia2(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800 uppercase"
                                    disabled={enviando}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Referência 3</label>
                                <input
                                    type="text"
                                    placeholder="Opcional..."
                                    value={referencia3}
                                    onChange={e => setReferencia3(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800 uppercase"
                                    disabled={enviando}
                                />
                            </div>
                        </div>

                        {/* FORNECEDOR E PRAZO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Fornecedor Recomendado / Custo</label>
                                <input
                                    type="text"
                                    placeholder="EX: DISTRIBUIDORA DE AUTOPEÇAS SÃO PAULO"
                                    value={fornecedor}
                                    onChange={e => setFornecedor(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-xs font-bold uppercase placeholder-slate-800"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Prazo de Entrega Estimado</label>
                                <input
                                    type="text"
                                    placeholder="EX: 3 DIAS ÚTEIS / IMEDIATO"
                                    value={prazoEntrega}
                                    onChange={e => setPrazoEntrega(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-xs font-bold uppercase placeholder-slate-800"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                        </div>

                        {/* QUANTIDADE E VALOR */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Quantidade Necessária</label>
                                <input
                                    type="number"
                                    placeholder="1"
                                    value={quantidade}
                                    onChange={e => setQuantidade(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Valor Unitário Estimado (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={valor}
                                    onChange={e => setValor(e.target.value)}
                                    className="w-full bg-black border border-white/[0.06] focus:border-orange-500 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono placeholder-slate-800"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[3px] text-black transition-all active:scale-[0.99] disabled:opacity-40 overflow-hidden relative group mt-2"
                            style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)' }}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {enviando ? "Injetando na planilha mensal..." : "Salvar Solicitação de Compra (Enter)"}
                        </button>
                    </form>
                </div>
            </div>

            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças & Serviços</div>
                <div className="font-mono text-slate-800">Fleet Procurement Unit v1.0</div>
            </footer>
        </main>
    );
}