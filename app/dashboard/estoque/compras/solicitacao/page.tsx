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

        const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        const mesAnoChave = `${mesAtual}-${anoAtual}`;

        try {
            const payload = {
                nome_peca: nomePeca.trim().toUpperCase(),
                quantidade: parseInt(quantidade) || 1,
                referencia_1: referencia1.trim().toUpperCase(),
                referencia_2: referencia2.trim() ? referencia2.trim().toUpperCase() : null,
                referencia_3: referencia3.trim() ? referencia3.trim().toUpperCase() : null,
                valor: 0,
                fornecedor: null,
                prazo_entrega: null,
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
                texto: 'Solicitação registrada. A demanda foi enviada para a fila de análise do Comprador 2.'
            });

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
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">

            <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center items-center">

                {/* BOTÃO DE VOLTAR */}
                <div className="w-full mb-3 text-left pl-1">
                    <Link href="/dashboard/estoque/compras" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                        ← Hub de Compras
                    </Link>
                </div>

                {/* FORM CONTAINER CLEAN */}
                <div className="w-full bg-white border border-[#e5e5ea] rounded-2xl p-6 sm:p-8 shadow-[0_1px_5px_rgba(0,0,0,0.02)] relative overflow-hidden">

                    <div className="mb-6 border-b border-[#f5f5f7] pb-4">
                        <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded select-none mb-1.5">
                            Etapa 01 • Comprador 1
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f]">
                            Solicitação de Novas Peças
                        </h1>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase mt-0.5">
                            Necessidades de Reposição &amp; Catálogos
                        </p>
                    </div>

                    {statusFeed.texto && (
                        <div className={`mb-5 p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                            statusFeed.tipo === 'sucesso'
                                ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                                : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                        }`}>
                            {statusFeed.texto}
                        </div>
                    )}

                    <form onSubmit={handleSalvarSolicitacao} className="space-y-4">

                        {/* LINHA 1: PEÇA E QUANTIDADE */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-1 sm:col-span-3">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Descrição / Nome da Peça</label>
                                <input
                                    type="text"
                                    placeholder="EX: TAMPA DO DISTRIBUIDOR VW GOL MOTOR AP"
                                    value={nomePeca}
                                    onChange={e => setNomePeca(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase placeholder-[#b4b4b9] transition-colors"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={quantidade}
                                    onChange={e => setQuantidade(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] transition-colors text-center"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                        </div>

                        {/* SEÇÃO DE COORDENADAS CRUZADAS (REFERÊNCIAS) */}
                        <div className="border-t border-[#e5e5ea] pt-4">
                            <span className="block text-[8px] font-mono font-bold text-[#86868b] uppercase tracking-wider mb-3">Mapeamento de Códigos de Fábrica</span>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 1 (Obrigatória)</label>
                                    <input
                                        type="text"
                                        placeholder="EX: VW 030905207"
                                        value={referencia1}
                                        onChange={e => setReferencia1(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] uppercase transition-colors"
                                        required
                                        disabled={enviando}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 2</label>
                                    <input
                                        type="text"
                                        placeholder="EX: BOSCH 9232081442"
                                        value={referencia2}
                                        onChange={e => setReferencia2(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] uppercase transition-colors"
                                        disabled={enviando}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 3</label>
                                    <input
                                        type="text"
                                        placeholder="EX: MARFLEX T10185"
                                        value={referencia3}
                                        onChange={e => setReferencia3(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] uppercase transition-colors"
                                        disabled={enviando}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* INFORMATIVO OPERACIONAL */}
                        <div className="text-[9px] font-semibold text-[#86868b] bg-[#f5f5f7] border border-[#e5e5ea] p-3 rounded-lg leading-normal">
                            Este registro nascerá com status &quot;PENDENTE&quot; na base central. Caberá ao setor de cotações (Comprador 2) validar fornecedores e aplicar custos de faturamento.
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={enviando}
                                className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {enviando ? "Abrindo Requisição..." : "Enviar para o Setor de Análise"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full max-w-2xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-[#b4b4b9]">Procurement Acquisition Engine v2.0</div>
            </footer>
        </main>
    );
}