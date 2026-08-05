"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Cargos do Sistema
const ROLES = {
    ADMIN: 'ADMIN',
    GERENTE: 'GERENTE',
    TECNICO: 'TECNICO',
    MECANICO: 'MECANICO',
    GESTOR_FROTAS: 'GESTORDEFROTAS',
    ESTOQUE: 'ESTOQUE',
    // Variantes Auxiliar de Gerente
    AUX_GERENTE_1: 'AUX_GERENTE',
    AUX_GERENTE_2: 'AUX GERENTE',
    AUX_GERENTE_3: 'AUXGERENTE',
    // Variantes Supervisor Estoque
    SUPERVISOR_1: 'SUPERVISOR_ESTOQUE',
    SUPERVISOR_2: 'SUPERVISOR ESTOQUE',
    SUPERVISOR_3: 'SUPERVISORESTOQUE',
    SUPERVISOR_4: 'SUPERVISOR',
};

export default function DashboardPage() {
    const [nomeUsuario, setNomeUsuario] = useState('Sincronizando...');
    const [cargoUsuario, setCargoUsuario] = useState('...');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const supabase = useMemo(
        () => createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ),
        []
    );

    useEffect(() => {
        let isSubscribed = true;

        async function loadUserData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    if (isSubscribed) router.push('/');
                    return;
                }

                const { data: profile } = await supabase
                    .from('usuarios_painel')
                    .select('nome, cargo')
                    .eq('id', user.id)
                    .maybeSingle();

                if (isSubscribed) {
                    if (profile) {
                        setNomeUsuario(profile.nome);
                        setCargoUsuario(profile.cargo.toUpperCase());
                    } else {
                        setNomeUsuario(user.email?.split('@')[0] || 'Operador');
                        setCargoUsuario(ROLES.MECANICO);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                if (isSubscribed) setLoading(false);
            }
        }

        loadUserData();
        return () => { isSubscribed = false; };
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    // Matriz de Permissões por Módulo
    const permissoesPonto = [
        ROLES.ADMIN, ROLES.GERENTE, ROLES.TECNICO, ROLES.GESTOR_FROTAS,
        ROLES.AUX_GERENTE_1, ROLES.AUX_GERENTE_2, ROLES.AUX_GERENTE_3,
        ROLES.SUPERVISOR_1, ROLES.SUPERVISOR_2, ROLES.SUPERVISOR_3, ROLES.SUPERVISOR_4
    ];

    const permissoesPontoEmergencia = [
        ROLES.ADMIN, ROLES.GERENTE, ROLES.TECNICO, ROLES.GESTOR_FROTAS,
        ROLES.AUX_GERENTE_1, ROLES.AUX_GERENTE_2, ROLES.AUX_GERENTE_3,
        ROLES.SUPERVISOR_1, ROLES.SUPERVISOR_2, ROLES.SUPERVISOR_3, ROLES.SUPERVISOR_4
    ];

    // TECNICO removido desta lista
    const permissoesPontoPausas = [
        ROLES.ADMIN, ROLES.GERENTE, ROLES.GESTOR_FROTAS,
        ROLES.AUX_GERENTE_1, ROLES.AUX_GERENTE_2, ROLES.AUX_GERENTE_3,
        ROLES.SUPERVISOR_1, ROLES.SUPERVISOR_2, ROLES.SUPERVISOR_3, ROLES.SUPERVISOR_4
    ];

    const permissoesRetiradaFerramentas = [
        ROLES.ADMIN, ROLES.GERENTE, ROLES.TECNICO, ROLES.MECANICO, ROLES.GESTOR_FROTAS,
        ROLES.SUPERVISOR_1, ROLES.SUPERVISOR_2, ROLES.SUPERVISOR_3, ROLES.SUPERVISOR_4
    ];

    const permissoesFerramentas = [
        ROLES.ADMIN, ROLES.GERENTE, ROLES.TECNICO, ROLES.MECANICO, ROLES.GESTOR_FROTAS,
        ROLES.SUPERVISOR_1, ROLES.SUPERVISOR_2, ROLES.SUPERVISOR_3, ROLES.SUPERVISOR_4
    ];

    const permissoesFrota = [ROLES.ADMIN, ROLES.GERENTE, ROLES.GESTOR_FROTAS];

    const permissoesFuncionarios = [
        ROLES.ADMIN, ROLES.GERENTE, ROLES.GESTOR_FROTAS,
        ROLES.AUX_GERENTE_1, ROLES.AUX_GERENTE_2, ROLES.AUX_GERENTE_3
    ];

    const permissoesEstoque = [
        ROLES.ADMIN, ROLES.GERENTE, ROLES.TECNICO, ROLES.MECANICO, ROLES.GESTOR_FROTAS,
        ROLES.ESTOQUE, ROLES.SUPERVISOR_1, ROLES.SUPERVISOR_2, ROLES.SUPERVISOR_3, ROLES.SUPERVISOR_4
    ];

    const permissoesChecklist = [ROLES.ADMIN, ROLES.GERENTE, ROLES.TECNICO];

    const permissoesRH = [
        ROLES.ADMIN, ROLES.GERENTE,
        ROLES.AUX_GERENTE_1, ROLES.AUX_GERENTE_2, ROLES.AUX_GERENTE_3
    ];

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold font-mono">
                        GR SYSTEM
                    </span>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased flex flex-col lg:flex-row w-full selection:bg-black/5">

            {/* Topbar Mobile */}
            <div className="w-full bg-white border-b border-[#e5e5ea] flex lg:hidden items-center justify-between px-4 py-3 z-20 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-[#1d1d1f] rounded-md flex items-center justify-center text-white font-bold text-xs select-none shrink-0">
                        GR
                    </div>
                    <div className="leading-tight min-w-0">
                        <h2 className="text-xs font-bold text-[#1d1d1f] truncate">{nomeUsuario}</h2>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] truncate mt-0.5">[{cargoUsuario}]</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-[#f5f5f7] active:bg-[#e8e8ed] text-[#1d1d1f] text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors shrink-0"
                >
                    Sair
                </button>
            </div>

            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-[280px] bg-white border-r border-[#e5e5ea] flex-col justify-between p-6 shrink-0 z-20">
                <div className="space-y-8 w-full">
                    <div className="flex items-center gap-3 border-b border-[#f5f5f7] pb-5">
                        <div className="w-8 h-8 bg-[#1d1d1f] rounded-lg flex items-center justify-center text-white font-bold text-xs select-none">
                            GR
                        </div>
                        <div className="min-w-0 leading-tight">
                            <h2 className="text-xs font-bold text-[#1d1d1f] tracking-tight truncate">{nomeUsuario}</h2>
                            <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider mt-0.5">[{cargoUsuario}]</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868b]">Ambiente</span>
                        <h3 className="text-sm font-bold tracking-tight text-[#1d1d1f]">GR Cluster</h3>
                        <p className="text-[11px] text-[#86868b] leading-normal font-medium">
                            Painel unificado para monitoramento de frotas, almoxarifado e pátio.
                        </p>
                    </div>
                </div>
                <div className="pt-4 flex items-center justify-between w-full">
                    <button
                        onClick={handleLogout}
                        className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all active:scale-95 text-center w-full"
                    >
                        Encerrar Sessão
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <section className="flex-1 p-4 sm:p-6 md:p-10 max-w-[1400px] flex flex-col gap-4 sm:gap-6 w-full z-10 overflow-y-auto">
                <div className="space-y-0.5 pl-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#86868b]">Gestão de Ativos</span>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-[#1d1d1f]">Módulos Operacionais</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 w-full">

                    {permissoesPonto.includes(cargoUsuario) && (
                        <Link href="/dashboard/ponto" className="bg-[#1d1d1f] border border-black p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-xl text-white">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">⏱️</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded">Totem</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity">Controle de Ponto</h3>
                                <p className="text-[11px] text-[#aeae23] mt-1 font-medium font-mono tracking-wide animate-pulse">❖ REGISTRO OBRIGATÓRIO</p>
                            </div>
                        </Link>
                    )}

                    {permissoesPontoEmergencia.includes(cargoUsuario) && (
                        <Link href="/dashboard/ponto/emergencia" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">🚨</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff3b30] bg-[#ff3b30]/10 px-2 py-0.5 rounded">Exceção</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Ponto Emergência</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Registro manual e exceções de marcação.</p>
                            </div>
                        </Link>
                    )}

                    {permissoesPontoPausas.includes(cargoUsuario) && (
                        <Link href="/dashboard/ponto/pausas" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">☕</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#34c759] bg-[#34c759]/10 px-2 py-0.5 rounded">Intervalo</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Controle de Pausas</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Gestão de intervalos e horários de almoço.</p>
                            </div>
                        </Link>
                    )}

                    {permissoesRetiradaFerramentas.includes(cargoUsuario) && (
                        <Link href="/dashboard/ferramentas/retirada" className="bg-white border-2 border-[#1d1d1f] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">🛠️</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#34c759] bg-[#34c759]/10 px-2 py-0.5 rounded font-black">Fluxo</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Retirada de Ferramenta</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Cautelas e devolução rápida de ativos.</p>
                            </div>
                        </Link>
                    )}

                    {permissoesFerramentas.includes(cargoUsuario) && (
                        <Link href="/dashboard/ferramentas" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">⚙️</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#007aff] bg-[#007aff]/5 px-2 py-0.5 rounded">Oficina</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Ferramentas</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Carga patrimonial e histórico geral.</p>
                            </div>
                        </Link>
                    )}

                    {permissoesFrota.includes(cargoUsuario) && (
                        <Link href="/dashboard/frota" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">🚚</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#5856d6] bg-[#5856d6]/5 px-2 py-0.5 rounded">Logística</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Frotas & Rotas</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Controle de viagens e combustíveis.</p>
                            </div>
                        </Link>
                    )}

                    {permissoesFuncionarios.includes(cargoUsuario) && (
                        <Link href="/dashboard/funcionarios" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">👥</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#007aff] bg-[#007aff]/5 px-2 py-0.5 rounded">Equipe</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Lista de Funcionários</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Cadastro e gerenciamento operacional de pessoal.</p>
                            </div>
                        </Link>
                    )}

                    {permissoesEstoque.includes(cargoUsuario) && (
                        <Link href="/dashboard/estoque" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">📦</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff9500] bg-[#ff9500]/5 px-2 py-0.5 rounded">Almoxarifado</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Estoque & Compras</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Inventário e fluxo triplo de cotações.</p>
                            </div>
                        </Link>
                    )}

                    {permissoesChecklist.includes(cargoUsuario) && (
                        <Link href="/dashboard/checklist/lista" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">📋</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-orange-600 bg-orange-600/10 px-2 py-0.5 rounded">Pátio</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Checklist Preventiva</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Histórico e laudos de revisão da frota.</p>
                            </div>
                        </Link>
                    )}

                    {permissoesRH.includes(cargoUsuario) && (
                        <Link href="/dashboard/rh" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">💼</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff2d55] bg-[#ff2d55]/5 px-2 py-0.5 rounded">Direção</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Gestão de RH</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Controles admissionais e termos legais.</p>
                            </div>
                        </Link>
                    )}

                </div>
            </section>
        </main>
    );
}