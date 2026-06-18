"use client";
import Link from 'next/link';

export default function HubFerramentasPage() {
    const modulos = [
        {
            titulo: "Retirada & Devolução",
            descricao: "Terminal operacional para bipagem rápida de código de barras ou crachá.",
            icone: "📡",
            rota: "/dashboard/ferramentas/retirada",
            tag: "Operacional"
        },
        {
            titulo: "Inventário Geral",
            descricao: "Listagem completa e em tempo real dos ativos cadastrados na bancada.",
            icone: "📋",
            rota: "/dashboard/ferramentas/lista",
            tag: "Ativos"
        },
        {
            titulo: "Histórico de Cautelas",
            descricao: "Auditoria detalhada e linha do tempo de quem retirou e devolveu os equipamentos.",
            icone: "⏱️",
            rota: "/dashboard/ferramentas/historico",
            tag: "Auditoria"
        },
        {
            titulo: "Cadastrar Nova Ferramenta",
            descricao: "Inclusão manual e rápida de novos itens coletando apenas ID, Nome e Status.",
            icone: "📥",
            rota: "/dashboard/ferramentas/cadastro",
            tag: "Cadastro"
        }
    ];

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">

            <div className="w-full flex-1 flex flex-col gap-6 sm:gap-10 max-w-[1400px] mx-auto justify-center">

                {/* HEADER CLEAN */}
                <header className="w-full text-center border-b border-[#e5e5ea] pb-6 max-w-2xl mx-auto px-4 space-y-1.5">
                    <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                        ← Módulos Operacionais
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Gestão de Ativos &amp; Ferramental
                    </h1>
                    <p className="text-[10px] text-[#86868b] font-medium leading-relaxed max-w-md mx-auto">
                        Painel centralizado para monitoramento, movimentação e auditoria do pátio e almoxarifado central.
                    </p>
                </header>

                {/* GRID DE BOTÕES NO PADRÃO APPLE PLATES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto px-4">
                    {modulos.map((m, index) => (
                        <Link
                            key={index}
                            href={m.rota}
                            className="group bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex items-start gap-4 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
                        >
                            {/* Conteiner do Ícone Nativo */}
                            <div className="text-lg bg-[#f5f5f7] border border-[#e5e5ea] w-10 h-10 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                                {m.icone}
                            </div>

                            {/* Conteúdo Textual */}
                            <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#86868b] transition-colors truncate">
                                        {m.titulo}
                                    </h2>
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-1.5 py-0.5 rounded select-none shrink-0">
                                        {m.tag}
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#86868b] font-medium leading-normal">
                                    {m.descricao}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* BADGE DE CONTROLE */}
                <div className="text-center max-w-xs mx-auto">
                    <p className="inline-block text-[8px] font-bold text-[#86868b] uppercase tracking-widest bg-white border border-[#e5e5ea] px-4 py-1.5 rounded-full select-none">
                        Acesso Restrito Administrativo
                    </p>
                </div>
            </div>

            {/* LOWER STATS BAR */}
            <footer className="w-full max-w-3xl mx-auto border-t border-[#e5e5ea] pt-5 mt-10 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Almoxarifado Central v3.2</div>
            </footer>
        </main>
    );
}