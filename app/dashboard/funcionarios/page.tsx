"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
    data_cadastro: string;
}

export default function CentralFuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [erroRequest, setErroRequest] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarFuncionarios() {
        setCarregando(true);
        setErroRequest(null);
        try {
            const { data, error } = await supabase
                .from('funcionarios')
                .select('*')
                .order('nome', { ascending: true });

            if (error) {
                setErroRequest(error.message);
                console.error("Erro Supabase:", error);
                return;
            }

            if (data) {
                setFuncionarios(data as Funcionario[]);
            }
        } catch (err: any) {
            setErroRequest(err?.message || "Falha ao conectar com o banco.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    const filtrados = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        if (!termo) return funcionarios;
        return funcionarios.filter(f => {
            const nomeCompleto = `${f.nome || ''} ${f.sobrenome || ''}`.toLowerCase();
            const idCracha = String(f.id || '').toLowerCase();
            const cargoFunc = String(f.cargo || '').toLowerCase();
            return nomeCompleto.includes(termo) || idCracha.includes(termo) || cargoFunc.includes(termo);
        });
    }, [funcionarios, pesquisa]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">

            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 sm:gap-8">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Módulos Operacionais
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Controle de Equipe
                        </h1>
                    </div>

                    {/* BOTÕES COM DESIGN EXECUTIVO SÓLIDO */}
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button
                            onClick={carregarFuncionarios}
                            className="flex-1 sm:flex-none bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                        >
                            🔄 Sincronizar
                        </button>

                        <Link href="/dashboard/funcionarios/crachas" className="flex-1 sm:flex-none bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.01)] text-center">
                            💳 Crachás
                        </Link>

                        <Link
                            href="/dashboard/funcionarios/cadastro"
                            className="w-full sm:w-auto bg-[#1d1d1f] active:bg-black text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 text-center block"
                        >
                            ➕ Cadastrar Colaborador
                        </Link>
                    </div>
                </header>

                {/* MENSAGEM DE ERRO TRATADA */}
                {erroRequest && (
                    <div className="flex items-start gap-2.5 bg-[#ff3b30]/5 border border-[#ff3b30]/20 p-4 rounded-xl text-xs text-[#ff3b30] font-semibold">
                        <span>⚠️ Falha na sincronização: {erroRequest}</span>
                    </div>
                )}

                {/* BARRA DE PESQUISA APPLE STYLE */}
                <div className="w-full max-w-md">
                    <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                            Filtro de Varredura
                        </label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 14l-3.5-3.5m0 0A5 5 0 104 4a5 5 0 006.5 6.5z" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Filtrar por nome, cargo ou ID do crachá..."
                                value={pesquisa}
                                onChange={e => setPesquisa(e.target.value)}
                                className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] pl-10 pr-4 py-2.5 rounded-xl outline-none text-[#1d1d1f] text-xs font-medium transition-colors placeholder-[#b4b4b9] uppercase shadow-[0_1px_2px_rgba(0,0,0,0.005)]"
                            />
                        </div>
                    </div>
                </div>

                {/* PAINEL / TABELA SÓLIDA */}
                <section className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
                    {carregando ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                                Sincronizando dados...
                            </span>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhum operador localizado na varredura.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none">
                                    <th className="pb-3 pl-1 w-1/4">ID (Crachá)</th>
                                    <th className="pb-3 w-2/4">Colaborador / Operador</th>
                                    <th className="pb-3 w-1/4">Cargo / Função</th>
                                    <th className="pb-3 text-right pr-1">Data Admissão</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7]">
                                {filtrados.map(f => (
                                    <tr key={f.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                                        <td className="py-3.5 font-mono font-bold text-[#ff9500] pl-1 tracking-widest text-xs">
                                            {f.id}
                                        </td>
                                        <td className="py-3.5 font-bold text-[#1d1d1f] uppercase tracking-tight text-xs">
                                            {f.nome} {f.sobrenome}
                                        </td>
                                        <td className="py-3.5 text-[#86868b] font-semibold uppercase text-[10px] tracking-wide">
                                            {f.cargo}
                                        </td>
                                        <td className="py-3.5 text-right pr-1 font-mono text-[#86868b] font-bold text-[11px]">
                                            {f.data_cadastro ? new Date(f.data_cadastro).toLocaleDateString('pt-BR') : '---'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* RODAPÉ */}
            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo de Varredura Operacional v2.5</div>
            </footer>
        </main>
    );
}