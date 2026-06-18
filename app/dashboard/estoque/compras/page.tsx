"use client";
import Link from 'next/link';

export default function HubComprasPage() {
    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">

            <div className="w-full flex-1 flex flex-col gap-6 sm:gap-10 max-w-[1400px] mx-auto justify-center">

                {/* CABEÇALHO CLEAN */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard/estoque" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Retornar ao Hub de Estoque
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Módulo de Suprimentos &amp; Compras
                        </h1>
                        <p className="text-[10px] text-[#86868b] font-medium uppercase tracking-wide">
                            Divisão Operacional de Fluxo de Caixa • GR Autopeças
                        </p>
                    </div>
                </header>

                {/* GRID DE DIRECIONAMENTO (APPLE PLATES) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">

                    {/* COMPRADOR 1 - SOLICITAÇÃO */}
                    <Link href="/dashboard/estoque/compras/solicitacao" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-6 sm:p-8 rounded-2xl transition-all group flex flex-col justify-between min-h-[230px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <div className="text-xl bg-[#f5f5f7] border border-[#e5e5ea] w-12 h-12 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                            ✍️
                        </div>
                        <div className="mt-4 space-y-2">
                            <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded select-none">
                                Etapa 01 • Comprador 1
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#86868b] transition-colors">
                                Solicitação de Peças
                            </h3>
                            <p className="text-[11px] text-[#86868b] font-medium leading-normal">
                                Levantamento primário de demandas, inserção de descrições e códigos de referência para cotação externa.
                            </p>
                        </div>
                    </Link>

                    {/* COMPRADOR 2 - ANÁLISE & COTAÇÃO */}
                    <Link href="/dashboard/estoque/compras/analise" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-6 sm:p-8 rounded-2xl transition-all group flex flex-col justify-between min-h-[230px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <div className="text-xl bg-[#f5f5f7] border border-[#e5e5ea] w-12 h-12 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                            ⚖️
                        </div>
                        <div className="mt-4 space-y-2">
                            <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#ff9500] bg-[#ff9500]/5 px-2 py-0.5 rounded border border-[#ff9500]/10 select-none">
                                Etapa 02 • Comprador 2
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#86868b] transition-colors">
                                Análise de Valores
                            </h3>
                            <p className="text-[11px] text-[#86868b] font-medium leading-normal">
                                Triagem de requisições abertas, definição do valor mais acessível encontrado, prazos e controle de status.
                            </p>
                        </div>
                    </Link>

                    {/* AUDITORIA / LIVRO DE COMPRAS CONSOLIDADO */}
                    <Link href="/dashboard/estoque/compras/lista" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-6 sm:p-8 rounded-2xl transition-all group flex flex-col justify-between min-h-[230px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <div className="text-xl bg-[#f5f5f7] border border-[#e5e5ea] w-12 h-12 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                            📊
                        </div>
                        <div className="mt-4 space-y-2">
                            <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded select-none">
                                Visão Global • Planilha
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#86868b] transition-colors">
                                Histórico &amp; Filtros
                            </h3>
                            <p className="text-[11px] text-[#86868b] font-medium leading-normal">
                                Visualização em formato planilha macro dividida por meses, equipada com filtros avançados de busca por status.
                            </p>
                        </div>
                    </Link>

                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full max-w-[1400px] mx-auto border-t border-[#e5e5ea] pt-5 mt-10 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-[#b4b4b9]">Procurement Control Panel v2.0</div>
            </footer>
        </main>
    );
}