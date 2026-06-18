"use client";
import Link from 'next/link';

export default function CentralEstoquePage() {
    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">

            <div className="w-full flex-1 flex flex-col gap-6 sm:gap-10 max-w-[1400px] mx-auto justify-center">

                {/* CABEÇALHO CLEAN */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Retornar ao Terminal Geral
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Central de Estoque &amp; Suprimentos
                        </h1>
                        <p className="text-[10px] text-[#86868b] font-medium uppercase tracking-wide">
                            Módulo Integrado de Logística Interna • GR Autopeças
                        </p>
                    </div>
                </header>

                {/* GRID DE NAVEGAÇÃO INTERNA COM AS 3 OPÇÕES (APPLE PLATES) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">

                    {/* 1. MÓDULO DE CONTAGEM DIRETA */}
                    <Link href="/dashboard/estoque/contagem" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-6 sm:p-8 rounded-2xl transition-all group flex flex-col justify-between min-h-[220px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <div className="text-xl bg-[#f5f5f7] border border-[#e5e5ea] w-12 h-12 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                            📦
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#86868b] transition-colors">
                                Contagem Directa
                            </h3>
                            <p className="text-[11px] text-[#86868b] font-medium leading-normal">
                                Bipagem rápida, digitação de referências e acúmulo de saldo físico por localização de prateleiras.
                            </p>
                        </div>
                    </Link>

                    {/* 2. MÓDULO DE LISTA E ETIQUETAS */}
                    <Link href="/dashboard/estoque/lista" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-6 sm:p-8 rounded-2xl transition-all group flex flex-col justify-between min-h-[220px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <div className="text-xl bg-[#f5f5f7] border border-[#e5e5ea] w-12 h-12 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                            📋
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#86868b] transition-colors">
                                Balanço &amp; Etiquetas
                            </h3>
                            <p className="text-[11px] text-[#86868b] font-medium leading-normal">
                                Auditoria em tempo real das peças coletadas no pátio e controle de liberação de etiquetas físicas.
                            </p>
                        </div>
                    </Link>

                    {/* 3. MÓDULO DE PLANEJAMENTO DE COMPRAS */}
                    <Link href="/dashboard/estoque/compras" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-6 sm:p-8 rounded-2xl transition-all group flex flex-col justify-between min-h-[220px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <div className="text-xl bg-[#f5f5f7] border border-[#e5e5ea] w-12 h-12 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                            🛒
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#86868b] transition-colors">
                                Livro de Compras
                            </h3>
                            <p className="text-[11px] text-[#86868b] font-medium leading-normal">
                                Lançamento de demandas de reposição por fornecedor, cotação de valores e planilhas de histórico.
                            </p>
                        </div>
                    </Link>

                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full border-t border-[#e5e5ea] pt-5 mt-10 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo Control Hub v2.0</div>
            </footer>
        </main>
    );
}