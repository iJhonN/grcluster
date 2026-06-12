"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface LogItem {
    id: string;
    nome_usuario: string;
    cargo_usuario: string;
    acao: string;
    rota: string;
    criado_at: string;
}

interface UsuarioAtivo {
    id: string;
    nome: string;
    email: string;
    cargo: string;
    contato: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [usuariosAtivos, setUsuariosAtivos] = useState<UsuarioAtivo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function carregarDadosAuditoria() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { router.push('/'); return; }

                // 1. Puxa os logs de ações recentes
                const { data: dadosLogs } = await supabase
                    .from('logs_sistema')
                    .select('*')
                    .order('criado_at', { ascending: false })
                    .limit(100);

                // 2. Puxa a lista de usuários para monitorar quem está ativo (Baseado no cadastro)
                const { data: dadosUsuarios } = await supabase
                    .from('usuarios_painel')
                    .select('id, nome, email, cargo, contato');

                setLogs(dadosLogs || []);
                setUsuariosAtivos(dadosUsuarios || []);
            } catch (err) {
                console.error(err);
            } finally {
                setCarregando(false);
            }
        }

        carregarDadosAuditoria();
    }, [router, supabase]);

    if (carregando) {
        return (
            <main className="min-h-screen bg-[#030303] flex items-center justify-center text-white">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#030303] text-white p-6 md:p-10 font-sans antialiased w-full max-w-[1600px] mx-auto space-y-10">

            {/* HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-6">
                <div>
                    <Link href="/dashboard/rh" className="text-orange-500 font-bold text-[10px] uppercase tracking-[3px] mb-1.5 block hover:opacity-80">
                        ← Voltar para RH
                    </Link>
                    <h1 className="text-3xl font-black uppercase tracking-tight">
                        Central de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Auditoria & Logs</span>
                    </h1>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 font-bold">
                        Monitoramento de sessões ativas e histórico global de modificações
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* COLUNA 1: QUEM ESTÁ NO SISTEMA (SESSÕES / CONTAS DISPONÍVEIS) */}
                <section className="bg-[#09090b] border border-white/[0.06] rounded-[28px] p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h2 className="text-xs font-black uppercase tracking-[2px] text-slate-300">Painel de Colaboradores</h2>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                        {usuariosAtivos.map((usuario) => (
                            <div key={usuario.id} className="bg-black/40 border border-white/[0.03] rounded-2xl p-4 flex justify-between items-center group hover:border-orange-500/20 transition-all">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white uppercase tracking-wide group-hover:text-orange-400 transition-colors">{usuario.nome}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{usuario.email}</p>
                                    <p className="text-[9px] text-slate-600 font-mono">{usuario.contato}</p>
                                </div>
                                <span className="text-[8px] font-mono font-black px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 uppercase tracking-widest">
                  {usuario.cargo}
                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* COLUNA 2 & 3: HISTÓRICO DE O QUE CADA CONTA FEZ */}
                <section className="lg:col-span-2 bg-[#09090b] border border-white/[0.06] rounded-[28px] p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                        <h2 className="text-xs font-black uppercase tracking-[2px] text-slate-300">Linha do Tempo de Ações</h2>
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Apenas leitura corporativa</span>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                        {logs.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-white/[0.04] rounded-2xl">
                                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Nenhum log registrado até o momento</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="bg-black/30 border border-white/[0.03] hover:border-white/[0.08] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-black text-white uppercase bg-white/[0.05] px-2 py-0.5 rounded">
                        {log.nome_usuario}
                      </span>
                                            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10">
                        {log.cargo_usuario}
                      </span>
                                            <span className="text-[8px] font-mono text-slate-600">
                        {log.rota}
                      </span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-300">{log.acao}</p>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                        <p className="text-[10px] font-mono font-bold text-orange-500/70">
                                            {new Date(log.criado_at).toLocaleTimeString('pt-BR')}
                                        </p>
                                        <p className="text-[8px] font-mono text-slate-600">
                                            {new Date(log.criado_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
}