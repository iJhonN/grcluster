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
    ferramentas: { nome: string; foto_url: string | null } | null;
    funcionarios: { nome: string; sobrenome: string } | null;
}

export default function HistoricoFerramentasPage() {
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [filtroMovimentacao, setFiltroMovimentacao] = useState('todos'); // todos, aberto, devolvido

    // Controle de Paginação Limpa
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 15;

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarHistorico() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('ferramenta_movimentacoes')
                .select('*, ferramentas(nome, foto_url), funcionarios(nome, sobrenome)')
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

    // Joga o operador para a página 1 ao pesquisar ou filtrar
    useEffect(() => {
        setPaginaAtual(1);
    }, [pesquisa, filtroMovimentacao]);

    const formatarData = (dataString: string) => {
        return new Date(dataString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 1. Pesquisa e filtragem global indexada
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

    // 2. Fatiamento dos cards na página correspondente
    const movimentacoesPaginadas = useMemo(() => {
        const indiceInicial = (paginaAtual - 1) * itensPorPagina;
        const indiceFinal = indiceInicial + itensPorPagina;
        return movimentacoesFiltradas.slice(indiceInicial, indiceFinal);
    }, [movimentacoesFiltradas, paginaAtual]);

    const totalPaginas = useMemo(() => {
        return Math.ceil(movimentacoesFiltradas.length / itensPorPagina) || 1;
    }, [movimentacoesFiltradas]);

    const relatorioRapido = useMemo(() => {
        const pendentes = movimentacoes.filter(m => m.status_movimentacao === 'aberto').length;
        const concluidas = movimentacoes.filter(m => m.status_movimentacao === 'devolvido').length;
        return { pendentes, concluidas, total: movimentacoes.length };
    }, [movimentacoes]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-8 font-sans antialiased flex flex-col justify-between w-full selection:bg-black/5">

            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#e5e5ea] pb-5 pl-1">
                    <div className="space-y-0.5">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Menu Principal
                        </Link>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f]">
                            Histórico e Auditoria de Cautelas
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar ferramenta, operador..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-1.5 rounded-lg text-[#1d1d1f] text-xs font-medium outline-none w-full sm:w-64 uppercase transition-colors placeholder-[#b4b4b9]"
                        />

                        <select
                            value={filtroMovimentacao}
                            onChange={(e) => setFiltroMovimentacao(e.target.value)}
                            className="bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-2 py-1.5 rounded-lg text-xs font-semibold outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                        >
                            <option value="todos">Todas as Cautelas</option>
                            <option value="aberto">Pendente (Em Uso)</option>
                            <option value="devolvido">Concluídas / Entregues</option>
                        </select>
                    </div>
                </header>

                {/* PLACAR ANALÍTICO COMPACTO */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-[#e5e5ea] p-2.5 rounded-xl text-center shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#86868b]">Fluxo Total</p>
                        <p className="text-base font-mono font-black mt-0.5 text-[#1d1d1f]">{relatorioRapido.total}</p>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-2.5 rounded-xl text-center shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#ff9500]">Em Uso</p>
                        <p className="text-base font-mono font-black mt-0.5 text-[#ff9500]">{relatorioRapido.pendentes}</p>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-2.5 rounded-xl text-center shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#248a3d]">Devolvidas</p>
                        <p className="text-base font-mono font-black mt-0.5 text-[#248a3d]">{relatorioRapido.concluidas}</p>
                    </div>
                </div>

                {/* LISTAGEM EM PROPORÇÃO DE RETÂNGULOS */}
                {carregando ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                        <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[9px] uppercase font-bold tracking-wider font-mono">Processando auditoria...</span>
                    </div>
                ) : movimentacoesFiltradas.length === 0 ? (
                    <div className="py-24 text-center bg-white border border-[#e5e5ea] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                        <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhuma movimentação localizada.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {movimentacoesPaginadas.map(m => (
                                <div
                                    key={m.id}
                                    className="bg-white border border-[#e5e5ea] rounded-xl overflow-hidden flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.002)] hover:border-[#b4b4b9] transition-all group"
                                >
                                    {/* THUMBNAIL DA FERRAMENTA CAUTELADA */}
                                    <div className="relative bg-[#f5f5f7] w-full border-b border-[#e5e5ea] flex items-center justify-center overflow-hidden" style={{ aspectRatio: '4/3' }}>
                                        {m.ferramentas?.foto_url ? (
                                            <img
                                                src={m.ferramentas.foto_url}
                                                alt={m.ferramentas.nome}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-xl opacity-20 select-none">⚙️</div>
                                        )}

                                        {/* BANNER REATIVO DE STATUS */}
                                        <div className="absolute top-2 right-2 select-none">
                                            <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm ${
                                                m.status_movimentacao === 'aberto' ? 'bg-[#ff9500] text-white' : 'bg-[#34c759] text-white'
                                            }`}>
                                                {m.status_movimentacao === 'aberto' ? 'Pendente' : 'Devolvido'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* CORPO DE METADADOS COMPLETOS */}
                                    <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                                        <div className="space-y-2">
                                            {/* Bloco Ferramenta */}
                                            <div>
                                                <span className="text-[7px] font-mono font-bold text-[#ff9500] tracking-wider block uppercase">
                                                    Ativo #{m.ferramenta_id}
                                                </span>
                                                <h3 className="text-[11px] font-bold text-[#1d1d1f] uppercase tracking-tight line-clamp-1 leading-tight" title={m.ferramentas?.nome}>
                                                    {m.ferramentas?.nome || 'Ferramenta Desconhecida'}
                                                </h3>
                                            </div>

                                            {/* Bloco Operador */}
                                            <div className="bg-[#f5f5f7]/60 border border-[#e5e5ea]/60 p-1.5 rounded-lg space-y-0.5">
                                                <span className="text-[7px] font-bold text-[#86868b] tracking-wider block uppercase">
                                                    Responsável (Matrícula: {m.funcionario_id})
                                                </span>
                                                <p className="text-[10px] font-bold text-[#1d1d1f] uppercase tracking-wide truncate">
                                                    {m.funcionarios ? `${m.funcionarios.nome} ${m.funcionarios.sobrenome}` : 'N/A'}
                                                </p>
                                            </div>

                                            {/* Bloco Cronometragem */}
                                            <div className="space-y-1 text-[9px] font-medium border-t border-[#f5f5f7] pt-2">
                                                <div className="flex justify-between items-center text-[#86868b]">
                                                    <span>🛫 Retirada:</span>
                                                    <span className="font-mono font-bold text-[#1d1d1f]">{formatarData(m.data_retirada)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[#86868b]">
                                                    <span>🛬 Devolução:</span>
                                                    <span className="font-mono font-bold">
                                                        {m.data_devolucao ? (
                                                            <span className="text-[#248a3d]">{formatarData(m.data_devolucao)}</span>
                                                        ) : (
                                                            <span className="text-[#ff3b30] text-[8px] font-black uppercase tracking-wider animate-pulse">Pátio</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* SELETOR DE PÁGINAS (SETINHAS) */}
                        <div className="flex items-center justify-center gap-4 border-t border-[#e5e5ea] pt-5 mt-2 select-none">
                            <button
                                onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                                disabled={paginaAtual === 1}
                                className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] disabled:opacity-30 disabled:hover:border-[#e5e5ea] px-3 py-1.5 rounded-lg text-xs font-bold text-[#1d1d1f] transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                ◀ Anterior
                            </button>

                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">
                                Página <strong className="text-[#1d1d1f]">{paginaAtual}</strong> de <strong className="text-[#1d1d1f]">{totalPaginas}</strong>
                            </span>

                            <button
                                onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                                disabled={paginaAtual === totalPaginas}
                                className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] disabled:opacity-30 disabled:hover:border-[#e5e5ea] px-3 py-1.5 rounded-lg text-xs font-bold text-[#1d1d1f] transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                Próxima ▶
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* FOOTER */}
            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between text-[7px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Almoxarifado Central v3.2</div>
            </footer>
        </main>
    );
}