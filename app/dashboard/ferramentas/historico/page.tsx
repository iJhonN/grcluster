"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Movimentacao {
    id: string;
    ferramenta_id: string;
    funcionario_id: string;
    data_retirada: string;
    data_devolucao: string | null;
    status_movimentacao: string;
    ferramentas: { nome: string } | null;
    funcionarios: { nome: string; sobrenome: string } | null;
}

export default function HistoricoFerramentasPage() {
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [filtroMovimentacao, setFiltroMovimentacao] = useState('todos'); // todos, aberto, devolvido

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarHistorico() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('ferramenta_movimentacoes')
                .select('*, ferramentas(nome), funcionarios(nome, sobrenome)')
                .order('data_retirada', { ascending: false });

            if (error) throw error;
            if (data) setMovimentacoes(data as unknown as Movimentacao[]);
        } catch (err) {
            console.error("Erro ao carregar histórico de movimentações:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarHistorico();
    }, []);

    const movimentacoesFiltradas = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        return movimentacoes.filter(m => {
            const nomeFerramenta = m.ferramentas?.nome.toLowerCase() || '';
            const nomeFuncionario = m.funcionarios ? `${m.funcionarios.nome} ${m.funcionarios.sobrenome}`.toLowerCase() : '';

            const batePesquisa =
                nomeFerramenta.includes(termo) ||
                m.ferramenta_id.includes(termo) ||
                m.funcionario_id.includes(termo) ||
                nomeFuncionario.includes(termo);

            const bateStatus = filtroMovimentacao === 'todos' || m.status_movimentacao === filtroMovimentacao;

            return batePesquisa && bateStatus;
        });
    }, [movimentacoes, pesquisa, filtroMovimentacao]);

    const relatorioRapido = useMemo(() => {
        const pendentes = movimentacoes.filter(m => m.status_movimentacao === 'aberto').length;
        const concluidas = movimentacoes.filter(m => m.status_movimentacao === 'devolvido').length;
        return { pendentes, concluidas, total: movimentacoes.length };
    }, [movimentacoes]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col justify-between w-full selection:bg-black/5">

            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 sm:gap-8">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Menu Principal
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Histórico e Auditoria de Cautelas
                        </h1>
                    </div>

                    {/* CONTROLADORES DE BUSCA */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar ferramenta, colaborador ou IDs..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3.5 py-2 rounded-xl text-[#1d1d1f] text-xs font-medium outline-none w-full sm:w-64 uppercase transition-colors placeholder-[#b4b4b9]"
                        />

                        <select
                            value={filtroMovimentacao}
                            onChange={(e) => setFiltroMovimentacao(e.target.value)}
                            className="bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-xl text-xs font-semibold outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                        >
                            <option value="todos">Todas as Cautelas</option>
                            <option value="aberto">Pendente (Em Uso)</option>
                            <option value="devolvido">Concluídas / Entregues</option>
                        </select>
                    </div>
                </header>

                {/* PLACAR ANALÍTICO DE CAUTELAS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#e5e5ea] p-4 rounded-xl text-center shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#86868b]">Fluxo Total de Operações</p>
                        <p className="text-xl font-mono font-black mt-0.5 text-[#1d1d1f]">{relatorioRapido.total}</p>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-4 rounded-xl text-center shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#ff9500]">Ferramentas em Uso</p>
                        <p className="text-xl font-mono font-black mt-0.5 text-[#ff9500]">{relatorioRapido.pendentes}</p>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-4 rounded-xl text-center shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#248a3d]">Devoluções Concluídas</p>
                        <p className="text-xl font-mono font-black mt-0.5 text-[#248a3d]">{relatorioRapido.concluidas}</p>
                    </div>
                </div>

                {/* LISTAGEM DOS REGISTROS */}
                <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] min-h-[400px] overflow-hidden">
                    {carregando ? (
                        <div className="text-center py-24 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Buscando histórico...</span>
                        </div>
                    ) : movimentacoesFiltradas.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhum registro de movimentação encontrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none">
                                    <th className="pb-3 pl-2">Ferramenta</th>
                                    <th className="pb-3">Responsável</th>
                                    <th className="pb-3 text-center">Data Retirada</th>
                                    <th className="pb-3 text-center">Data Devolução</th>
                                    <th className="pb-3 text-right pr-2">Situação</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7]">
                                {movimentacoesFiltradas.map(m => (
                                    <tr key={m.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                                        <td className="py-3.5 pl-2">
                                            <p className="font-bold text-[#1d1d1f] uppercase tracking-tight text-xs leading-none">
                                                {m.ferramentas?.nome || 'Ferramenta Desconhecida'}
                                            </p>
                                            <span className="text-[9px] font-mono font-bold text-[#ff9500] tracking-wider mt-1 block">
                                                ID: {m.ferramenta_id}
                                            </span>
                                        </td>
                                        <td className="py-3.5">
                                            <p className="font-semibold text-[#1d1d1f] uppercase text-[11px] tracking-wide leading-none">
                                                {m.funcionarios ? `${m.funcionarios.nome} ${m.funcionarios.sobrenome}` : 'N/A'}
                                            </p>
                                            <span className="text-[9px] font-mono font-semibold text-[#86868b] mt-1 block">
                                                Registro: {m.funcionario_id}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-center font-mono text-[10px] text-[#86868b] font-semibold">
                                            {new Date(m.data_retirada).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-3.5 text-center font-mono text-[10px] font-semibold">
                                            {m.data_devolucao ? (
                                                <span className="text-[#86868b]">
                                                    {new Date(m.data_devolucao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : (
                                                <span className="text-[#ff3b30] text-[8px] font-bold uppercase tracking-wider animate-pulse bg-[#ff3b30]/5 px-2 py-0.5 rounded border border-[#ff3b30]/10">
                                                    Em Uso
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 text-right pr-2">
                                            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                m.status_movimentacao === 'aberto'
                                                    ? 'bg-[#ff9500]/5 text-[#ff9500] border border-[#ff9500]/10'
                                                    : 'bg-[#34c759]/5 text-[#248a3d] border border-[#34c759]/10'
                                            }`}>
                                                {m.status_movimentacao === 'aberto' ? 'Pendente' : 'Concluído'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* RODAPÉ */}
            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Almoxarifado Central v3.2</div>
            </footer>
        </main>
    );
}