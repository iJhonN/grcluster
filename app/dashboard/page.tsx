"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    const [userName, setUserName] = useState('Sincronizando...');
    const [userRole, setUserRole] = useState('...');
    const [carregando, setCarregando] = useState(true);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        let ativo = true;

        async function buscarSessao() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    if (ativo) router.push('/');
                    return;
                }

                const { data: perfil } = await supabase
                    .from('usuarios_painel')
                    .select('nome, cargo')
                    .eq('id', user.id)
                    .maybeSingle();

                if (ativo) {
                    if (perfil) {
                        setUserName(perfil.nome);
                        setUserRole(perfil.cargo.toUpperCase());
                    } else {
                        setUserName(user.email?.split('@')[0] || 'Operador');
                        setUserRole('MECANICO');
                    }
                    setCarregando(false);
                }
            } catch (error) {
                console.error("Erro ao sincronizar sessão:", error);
                if (ativo) setCarregando(false);
            }
        }

        buscarSessao();
        return () => { ativo = false; };
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (carregando) {
        return (
            <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold font-mono">GR SYSTEM</span>
                </div>
            </main>
        );
    }

    const podeVerPonto = ['ADMIN', 'GERENTE', 'TECNICO', 'GESTORDEFROTAS'];
    const podeVerRetiradaFerramentas = ['ADMIN', 'GERENTE', 'TECNICO', 'MECANICO', 'GESTORDEFROTAS'];
    const podeVerHubFerramentas = ['ADMIN', 'GERENTE', 'TECNICO', 'MECANICO', 'GESTORDEFROTAS'];
    const podeVerFrota = ['ADMIN', 'GERENTE', 'GESTORDEFROTAS'];
    const podeVerRH = ['ADMIN', 'GERENTE'];
    const podeVerEstoque = ['ADMIN', 'GERENTE', 'TECNICO', 'MECANICO', 'GESTORDEFROTAS', 'ESTOQUE'];
    const podeVerFuncionarios = ['ADMIN', 'GERENTE', 'GESTORDEFROTAS'];
    const podeVerChecklist = ['ADMIN', 'GERENTE', 'TECNICO']; // Agora Admin e Gerente também veem!

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased flex flex-col lg:flex-row w-full selection:bg-black/5">

            {/* BARRA DE TOPO COMPACTA (MOBILE ONLY) */}
            <div className="w-full bg-white border-b border-[#e5e5ea] flex lg:hidden items-center justify-between px-4 py-3 z-20 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-[#1d1d1f] rounded-md flex items-center justify-center text-white font-bold text-xs select-none shrink-0">
                        GR
                    </div>
                    <div className="leading-tight min-w-0">
                        <h2 className="text-xs font-bold text-[#1d1d1f] truncate">{userName}</h2>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] truncate mt-0.5">[{userRole}]</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-[#f5f5f7] active:bg-[#e8e8ed] text-[#1d1d1f] text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors shrink-0"
                >
                    Sair
                </button>
            </div>

            {/* BARRA LATERAL FIXA DE CONTROLE (DESKTOP MAC ONLY) */}
            <aside className="hidden lg:flex w-[280px] bg-white border-r border-[#e5e5ea] flex-col justify-between p-6 shrink-0 z-20">
                <div className="space-y-8 w-full">
                    <div className="flex items-center gap-3 border-b border-[#f5f5f7] pb-5">
                        <div className="w-8 h-8 bg-[#1d1d1f] rounded-lg flex items-center justify-center text-white font-bold text-xs select-none">
                            GR
                        </div>
                        <div className="min-w-0 leading-tight">
                            <h2 className="text-xs font-bold text-[#1d1d1f] tracking-tight truncate">{userName}</h2>
                            <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider mt-0.5">[{userRole}]</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868b]">Ambiente</span>
                        <h3 className="text-sm font-bold tracking-tight text-[#1d1d1f]">GR Cluster</h3>
                        <p className="text-[11px] text-[#86868b] leading-normal font-medium">Painel unificado para monitoramento de frotas, almoxarifado e pátio.</p>
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

            {/* CONTEÚDO PRINCIPAL */}
            <section className="flex-1 p-4 sm:p-6 md:p-10 max-w-[1400px] flex flex-col gap-4 sm:gap-6 w-full z-10 overflow-y-auto">

                <div className="space-y-0.5 pl-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#86868b]">Gestão de Ativos</span>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-[#1d1d1f]">Módulos Operacionais</h1>
                </div>

                {/* GRID ORDENADO E CORRIGIDO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 w-full">

                    {/* 1. ⏱️ CONTROLE DE PONTO */}
                    {podeVerPonto.includes(userRole) && (
                        <Link href="/dashboard/ponto" className="bg-[#1d1d1f] border border-black p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-xl text-white">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">⏱️</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded">Totem</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity">Controle de Ponto</h3>
                                <p className="text-[11px] text-[#aeae23] mt-1 font-medium font-mono tracking-wide animate-pulse">● REGISTRO OBRIGATÓRIO</p>
                            </div>
                        </Link>
                    )}

                    {/* 2. 🛠️ RETIRADA DE FERRAMENTAS */}
                    {podeVerRetiradaFerramentas.includes(userRole) && (
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

                    {/* 3. ⚙️ INVENTÁRIO GERAL DE FERRAMENTAS */}
                    {podeVerHubFerramentas.includes(userRole) && (
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

                    {/* 4. 🚚 FROTAS & LOGÍSTICA */}
                    {podeVerFrota.includes(userRole) && (
                        <Link href="/dashboard/frota" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">🚚</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#5856d6] bg-[#5856d6]/5 px-2 py-0.5 rounded">Logística</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Frotas &amp; Rotas</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Controle de viagens e combustíveis.</p>
                            </div>
                        </Link>
                    )}

                    {/* NOVO CARD PARA GERENCIAMENTO DE FUNCIONÁRIOS */}
                    {podeVerFuncionarios.includes(userRole) && (
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

                    {/* 5. 📦 ESTOQUE & COMPRAS */}
                    {podeVerEstoque.includes(userRole) && (
                        <Link href="/dashboard/estoque" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">📦</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff9500] bg-[#ff9500]/5 px-2 py-0.5 rounded">Almoxarifado</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Estoque &amp; Compras</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Inventário e fluxo triplo de cotações.</p>
                            </div>
                        </Link>
                    )}

                    {/* 6. 📋 CHECKLIST PREVENTIVA */}
                    {podeVerChecklist.includes(userRole) && (
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

                    {/* 7. 💼 DIRETORIA / RH */}
                    {podeVerRH.includes(userRole) && (
                        <Link href="/dashboard/rh" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">💼</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff2d55] bg-[#ff2d55]/5 px-2 py-0.5 rounded">Direção</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">Gestão de RH</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">Contratos admissionais e termos legais.</p>
                            </div>
                        </Link>
                    )}

                </div>
            </section>
        </main>
    );
}