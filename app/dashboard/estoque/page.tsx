"use client";
import Link from 'next/link';

export default function CentralEstoquePage() {
    return (
        <main className="relative min-h-screen bg-[#030303] text-white p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* BACKGROUND LINES */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/[0.03] rounded-full blur-[130px]" />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-10 max-w-[1400px] mx-auto justify-center">

                {/* HEADER */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/[0.04] pb-6 px-2">
                    <div>
                        <Link href="/dashboard" className="text-orange-500 font-black text-[9px] uppercase tracking-[4px] mb-1.5 block hover:opacity-70 transition-all">
                            ← Retornar ao Terminal Geral
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Central de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Estoque & Suprimentos</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5 font-bold">
                            Módulo Integrado de Logística Interna • GR Autopeças
                        </p>
                    </div>
                </header>

                {/* GRID DE NAVEGAÇÃO INTERNA COM AS 3 OPÇÕES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2">

                    {/* 1. MÓDULO DE CONTAGEM DIRETA */}
                    <Link href="/dashboard/estoque/contagem" className="bg-[#09090b]/90 border border-white/[0.06] hover:border-orange-500/50 p-8 rounded-[32px] text-left transition-all active:scale-[0.98] group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[240px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.02] rounded-full blur-2xl group-hover:bg-orange-500/[0.05] transition-all" />
                        <div className="w-12 h-12 bg-orange-500/10 border border-white/[0.04] rounded-xl flex items-center justify-center text-orange-400 text-xl font-black group-hover:bg-orange-600 group-hover:text-black transition-all">
                            📦
                        </div>
                        <div className="mt-6">
                            <h3 className="text-base font-black uppercase italic tracking-tight mb-1 group-hover:text-orange-400 transition-colors">Contagem Direta</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Bipagem rápida, digitação de referências e acúmulo de saldo físico por localização de prateleiras.</p>
                        </div>
                    </Link>

                    {/* 2. MÓDULO DE LISTA E ETIQUETAS */}
                    <Link href="/dashboard/estoque/lista" className="bg-[#09090b]/90 border border-white/[0.06] hover:border-orange-500/50 p-8 rounded-[32px] text-left transition-all active:scale-[0.98] group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[240px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.02] rounded-full blur-2xl group-hover:bg-orange-500/[0.05] transition-all" />
                        <div className="w-12 h-12 bg-orange-500/10 border border-white/[0.04] rounded-xl flex items-center justify-center text-orange-400 text-xl font-black group-hover:bg-orange-600 group-hover:text-black transition-all">
                            📋
                        </div>
                        <div className="mt-6">
                            <h3 className="text-base font-black uppercase italic tracking-tight mb-1 group-hover:text-orange-400 transition-colors">Balanço & Etiquetas</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Auditoria em tempo real das peças coletadas no pátio e controle de liberação de etiquetas físicas.</p>
                        </div>
                    </Link>

                    {/* 3. MÓDULO DE PLANEJAMENTO DE COMPRAS */}
                    <Link href="/dashboard/estoque/compras" className="bg-[#09090b]/90 border border-white/[0.06] hover:border-orange-500/50 p-8 rounded-[32px] text-left transition-all active:scale-[0.98] group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[240px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.02] rounded-full blur-2xl group-hover:bg-orange-500/[0.05] transition-all" />
                        <div className="w-12 h-12 bg-orange-500/10 border border-white/[0.04] rounded-xl flex items-center justify-center text-orange-400 text-xl font-black group-hover:bg-orange-600 group-hover:text-black transition-all">
                            🛒
                        </div>
                        <div className="mt-6">
                            <h3 className="text-base font-black uppercase italic tracking-tight mb-1 group-hover:text-orange-400 transition-colors">Livro de Compras</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Lançamento de demandas de reposição por fornecedor, cotação de valores e planilhas de histórico dos 12 meses.</p>
                        </div>
                    </Link>

                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças & Serviços</div>
                <div className="font-mono text-slate-800">Módulo Control Hub v2.0</div>
            </footer>
        </main>
    );
}