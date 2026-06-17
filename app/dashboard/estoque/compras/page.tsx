"use client";
import Link from 'next/link';

export default function HubComprasPage() {
    const anoAtual = new Date().getFullYear();

    return (
        <main className="relative min-h-screen bg-[#030303] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* GRID INDUSTRIAL TEXTURIZADO LUXO */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `linear-gradient(to right, #dfbb6c 1px, transparent 1px), linear-gradient(to bottom, #dfbb6c 1px, transparent 1px)`, backgroundSize: '45px 40px' }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#dfbb6c]/[0.02] rounded-full blur-[130px]" />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-10 max-w-[1400px] mx-auto justify-center">

                {/* HEADER */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/[0.04] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/estoque" className="text-[#dfbb6c] font-black text-[9px] uppercase tracking-[4px] mb-1.5 block hover:opacity-70 transition-all">
                            ← Retornar ao Hub de Estoque
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                            MÓDULO DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfbb6c] via-[#f7e0a3] to-white">SUPRIMENTOS & COMPRAS</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5 font-bold font-mono">
                            DIVISÃO OPERACIONAL DE FLUXO DE CAIXA • GR AUTOPEÇAS
                        </p>
                    </div>
                </header>

                {/* GRID DE DIRECIONAMENTO - FLUXO DE COMPRAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2 items-stretch">

                    {/* COMPRADOR 1 - SOLICITAÇÃO */}
                    <Link href="/dashboard/estoque/compras/solicitacao" className="bg-[#09090b]/90 border border-white/[0.06] hover:border-[#dfbb6c]/40 p-8 rounded-[32px] text-left transition-all active:scale-[0.98] group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[250px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfbb6c]/[0.01] rounded-full blur-2xl group-hover:bg-[#dfbb6c]/[0.03] transition-all duration-300" />
                        <div className="w-12 h-12 bg-[#dfbb6c]/10 border border-white/[0.04] rounded-xl flex items-center justify-center text-[#dfbb6c] text-xl font-black group-hover:bg-[#dfbb6c] group-hover:text-black transition-all duration-300">
                            ✍️
                        </div>
                        <div className="mt-6">
                            <span className="text-[8px] font-mono text-[#dfbb6c] border border-[#dfbb6c]/30 px-2 py-0.5 rounded uppercase tracking-widest block w-max mb-2">Etapa 01 • Comprador 1</span>
                            <h3 className="text-base font-black uppercase italic tracking-tight mb-1 group-hover:text-[#dfbb6c] transition-colors duration-300">Solicitação de Peças</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Levantamento primário de demandas, inserção de descrições e códigos de referência tripla para cotação externa.</p>
                        </div>
                    </Link>

                    {/* COMPRADOR 2 - ANÁLISE & COTAÇÃO */}
                    <Link href="/dashboard/estoque/compras/analise" className="bg-[#09090b]/90 border border-white/[0.06] hover:border-[#dfbb6c]/40 p-8 rounded-[32px] text-left transition-all active:scale-[0.98] group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[250px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfbb6c]/[0.01] rounded-full blur-2xl group-hover:bg-[#dfbb6c]/[0.03] transition-all duration-300" />
                        <div className="w-12 h-12 bg-[#dfbb6c]/10 border border-white/[0.04] rounded-xl flex items-center justify-center text-[#dfbb6c] text-xl font-black group-hover:bg-[#dfbb6c] group-hover:text-black transition-all duration-300">
                            ⚖️
                        </div>
                        <div className="mt-6">
                            <span className="text-[8px] font-mono text-amber-300 border border-amber-300/30 px-2 py-0.5 rounded uppercase tracking-widest block w-max mb-2">Etapa 02 • Comprador 2</span>
                            <h3 className="text-base font-black uppercase italic tracking-tight mb-1 group-hover:text-[#dfbb6c] transition-colors duration-300">Análise de Valores</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Triagem de requisições abertas, definição do valor mais acessível encontrado, prazos e controle de status operacional.</p>
                        </div>
                    </Link>

                    {/* AUDITORIA / LIVRO DE COMPRAS CONSOLIDADO */}
                    <Link href="/dashboard/estoque/compras/lista" className="bg-[#09090b]/90 border border-white/[0.06] hover:border-[#dfbb6c]/40 p-8 rounded-[32px] text-left transition-all active:scale-[0.98] group relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[250px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfbb6c]/[0.01] rounded-full blur-2xl group-hover:bg-[#dfbb6c]/[0.03] transition-all duration-300" />
                        <div className="w-12 h-12 bg-[#dfbb6c]/10 border border-white/[0.04] rounded-xl flex items-center justify-center text-[#dfbb6c] text-xl font-black group-hover:bg-[#dfbb6c] group-hover:text-black transition-all duration-300">
                            📊
                        </div>
                        <div className="mt-6">
                            <span className="text-[8px] font-mono text-slate-400 border border-white/[0.1] px-2 py-0.5 rounded uppercase tracking-widest block w-max mb-2">Visão Global • Planilha</span>
                            <h3 className="text-base font-black uppercase italic tracking-tight mb-1 group-hover:text-[#dfbb6c] transition-colors duration-300">Histórico & Filtros</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Visualização em formato planilha macro dividida por meses, equipada com filtros avançados de busca por status e referências.</p>
                        </div>
                    </Link>

                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-slate-800">PROCUREMENT CONTROL PANEL v2.0</div>
            </footer>
        </main>
    );
}