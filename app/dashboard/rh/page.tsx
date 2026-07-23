"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function HubRHPage() {
    const [cargo, setCargo] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Rotas permitidas para o escopo restrito de Auxiliar de Gerente
    const rotasPermitidasAuxGerente = [
        "/dashboard/funcionarios",
        "/dashboard/rh/atestados",
        "/dashboard/fechamento",
        "/dashboard/ponto/atrasos",
        "/dashboard/ponto/emergencia"
    ];

    useEffect(() => {
        async function obterCargoUsuario() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('usuarios_painel')
                        .select('cargo')
                        .eq('id', user.id)
                        .single();

                    if (data?.cargo) {
                        setCargo(data.cargo);
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar permissões do usuário:", err);
            } finally {
                setCarregando(false);
            }
        }

        obterCargoUsuario();
    }, [supabase]);

    // Links focados em gestão direta de pessoal, credenciais e histórico disciplinar
    const acoesDiretas = [
        {
            titulo: "Provisionar Credenciais",
            descricao: "Criar novos usuários de acesso para o painel com definição estrita de cargos (RBAC).",
            icone: "🔐",
            rota: "/dashboard/rh/cadastrousuario"
        },
        {
            titulo: "Lista de Funcionários",
            descricao: "Controle cadastral centralizado da equipe, dados contratuais e crachás ópticos.",
            icone: "👥",
            rota: "/dashboard/funcionarios"
        },
        {
            titulo: "Folgas & Feriados",
            descricao: "Lançamento em massa de feriados no calendário e dispensas/escalas de folga individuais.",
            icone: "📅",
            rota: "/dashboard/rh/folgas"
        },
        {
            titulo: "Controle de Atestados",
            descricao: "Lançamento e auditoria de justificativas médicas, dispensas e afastamentos legais.",
            icone: "📄",
            rota: "/dashboard/rh/atestados"
        },
        {
            titulo: "Mural de Avisos",
            descricao: "Disparar comunicados oficiais e alertas operacionais urgentes direto no portal do colaborador.",
            icone: "📢",
            rota: "/dashboard/rh/avisos"
        },
        {
            titulo: "Histórico Disciplinar",
            descricao: "Aplicação e monitoramento de avisos, advertências e suspensões de pátio com cálculo de retorno.",
            icone: "⚖️",
            rota: "/dashboard/rh/advertencias"
        },
        {
            titulo: "Fechamento Contábil",
            descricao: "Balanço mensal de horas da folha de pátio em formato A4 Retrato para a diretoria.",
            icone: "📊",
            rota: "/dashboard/fechamento"
        }
    ];

    const auditoriaPonto = [
        {
            titulo: "Controle de Pausas",
            descricao: "Monitorar intervalos de almoço e descansos intrajornada da equipe.",
            icone: "☕",
            rota: "/dashboard/ponto/pausas"
        },
        {
            titulo: "Horas Extras",
            descricao: "Auditar minutos e horas que ultrapassaram a escala regular para banco de horas.",
            icone: "⚡",
            rota: "/dashboard/ponto/horas_extras"
        },
        {
            titulo: "Relatório de Atrasos",
            descricao: "Identificar gargalos de pontualidade na entrada dos turnos do pátio.",
            icone: "🚨",
            rota: "/dashboard/ponto/atrasos"
        },
        {
            titulo: "Saídas Emergenciais",
            descricao: "Analisar justificativas obrigatórias de abandono temporário de posto.",
            icone: "🚒",
            rota: "/dashboard/ponto/emergencia"
        }
    ];

    // Aplicação do filtro de segurança baseado no cargo
    const acoesDiretasFiltradas = cargo === 'AUX_GERENTE'
        ? acoesDiretas.filter(item => rotasPermitidasAuxGerente.includes(item.rota))
        : acoesDiretas;

    const auditoriaPontoFiltrada = cargo === 'AUX_GERENTE'
        ? auditoriaPonto.filter(item => rotasPermitidasAuxGerente.includes(item.rota))
        : auditoriaPonto;

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-[#007aff]/10 flex flex-col justify-between w-full">

            <div className="w-full flex-1 flex flex-col gap-8 sm:gap-10 max-w-7xl mx-auto justify-center">

                {/* HEADER SUPERIOR CLEAN */}
                <header className="w-full text-center border-b border-[#e5e5ea] pb-6 px-4 space-y-1.5">
                    <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#007aff] transition-colors block">
                        ← Retornar ao Terminal Geral
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Gestão de Recursos Humanos
                    </h1>
                    <p className="text-[10px] text-[#86868b] font-medium leading-relaxed max-w-md mx-auto">
                        Painel centralizado de governança corporativa, segurança jurídica e controle integrado de jornadas.
                    </p>
                    {cargo === 'AUX_GERENTE' && (
                        <div className="pt-2">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[#ff9500] bg-[#ff9500]/10 border border-[#ff9500]/20 px-2.5 py-1 rounded-full">
                                Visão Restrita: Auxiliar de Gerente
                            </span>
                        </div>
                    )}
                </header>

                {carregando ? (
                    <div className="w-full text-center py-12 text-[#86868b] text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
                        Carregando permissões de acesso...
                    </div>
                ) : (
                    <>
                        {/* SEÇÃO I: DIRETORIA & ADMINISTRAÇÃO */}
                        {acoesDiretasFiltradas.length > 0 && (
                            <div className="w-full px-2 space-y-3">
                                <h2 className="text-[9px] font-bold uppercase tracking-wider text-[#007aff] pl-0.5">
                                    I. Diretoria &amp; Administração
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                                    {acoesDiretasFiltradas.map((o, idx) => (
                                        <Link
                                            key={idx}
                                            href={o.rota}
                                            className="group bg-white border border-[#e5e5ea] hover:border-[#007aff]/50 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all flex flex-col justify-between min-h-[175px]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-lg bg-[#f5f5f7] border border-[#e5e5ea] w-10 h-10 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                                                    {o.icone}
                                                </div>
                                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#007aff] bg-[#007aff]/5 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity select-none">
                                                    Abrir
                                                </span>
                                            </div>
                                            <div className="mt-4 space-y-0.5">
                                                <h3 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#007aff] transition-colors">
                                                    {o.titulo}
                                                </h3>
                                                <p className="text-[11px] text-[#86868b] font-medium leading-normal line-clamp-3">
                                                    {o.descricao}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SEÇÃO II: AUDITORIA DE PÁTIO & JORNADAS */}
                        {auditoriaPontoFiltrada.length > 0 && (
                            <div className="w-full px-2 space-y-3">
                                <h2 className="text-[9px] font-bold uppercase tracking-wider text-[#86868b] pl-0.5">
                                    II. Auditoria de Pátio &amp; Jornadas (Ponto)
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                    {auditoriaPontoFiltrada.map((o, idx) => (
                                        <Link
                                            key={idx}
                                            href={o.rota}
                                            className="group bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all flex flex-col justify-between min-h-[160px]"
                                        >
                                            <div className="text-lg bg-[#f5f5f7] border border-[#e5e5ea] w-10 h-10 rounded-xl flex items-center justify-center shrink-0 select-none group-hover:bg-[#e8e8ed] transition-colors">
                                                {o.icone}
                                            </div>
                                            <div className="mt-4 space-y-0.5">
                                                <h3 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] group-hover:text-[#86868b] transition-colors">
                                                    {o.titulo}
                                                </h3>
                                                <p className="text-[11px] text-[#86868b] font-medium leading-normal">
                                                    {o.descricao}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* RODAPÉ OPERACIONAL */}
            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-10 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo Core Security v3.1</div>
            </footer>
        </main>
    );
}