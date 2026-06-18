"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface SaidaEmergencia {
    id: string;
    funcionario_id: string;
    justificativa: string;
    horario_saida: string;
    horario_retorno: string | null;
    funcionarios: {
        nome: string;
        sobrenome: string;
        cargo: string;
    } | null;
}

export default function ListaSaidasEmergenciaPage() {
    const [saidas, setSaidas] = useState<SaidaEmergencia[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'rua', 'retornado'

    // Estado para travar a justificativa aberta ao clicar
    const [justificativaFixaId, setJustificativaFixaId] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarSaidas() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('saidas_emergencia')
                .select(`
                    id,
                    funcionario_id,
                    justificativa,
                    horario_saida,
                    horario_retorno,
                    funcionarios (
                        nome,
                        sobrenome,
                        cargo
                    )
                `)
                .order('horario_saida', { ascending: false });

            if (error) throw error;
            if (data) setSaidas(data as unknown as SaidaEmergencia[]);
        } catch (error) {
            console.error("Erro ao carregar lista de saídas:", error);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarSaidas();
    }, []);

    const dadosFiltrados = useMemo(() => {
        return saidas.filter(s => {
            if (filtroStatus === 'rua' && s.horario_retorno !== null) return false;
            if (filtroStatus === 'retornado' && s.horario_retorno === null) return false;

            const termo = pesquisa.toLowerCase().trim();
            if (termo) {
                const nomeCompleto = `${s.funcionarios?.nome || ''} ${s.funcionarios?.sobrenome || ''}`.toLowerCase();
                const just = (s.justificativa || '').toLowerCase();
                const idFunc = (s.funcionario_id || '').toLowerCase();
                return nomeCompleto.includes(termo) || just.includes(termo) || idFunc.includes(termo);
            }

            return true;
        });
    }, [saidas, filtroStatus, pesquisa]);

    const metricas = useMemo(() => {
        let naRua = 0;
        let encerradas = 0;
        saidas.forEach(s => {
            if (s.horario_retorno === null) naRua++;
            else encerradas++;
        });
        return { naRua, encerradas, total: saidas.length };
    }, [saidas]);

    const calcularDuracao = (saida: string, retorno: string | null) => {
        if (!retorno) return '---';
        const inicio = new Date(saida).getTime();
        const fim = new Date(retorno).getTime();
        const diferencaMinutos = Math.floor((fim - inicio) / (1000 * 60));

        if (diferencaMinutos < 60) return `${diferencaMinutos}m`;
        const horas = Math.floor(diferencaMinutos / 60);
        const mins = diferencaMinutos % 60;
        return `${horas}h ${mins.toString().padStart(2, '0')}m`;
    };

    const alternarFixarJustificativa = (id: string) => {
        if (justificativaFixaId === id) {
            setJustificativaFixaId(null);
        } else {
            setJustificativaFixaId(id);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 print:bg-white print:text-black print:p-0">
            <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">

                {/* CABEÇALHO */}
                <header className="space-y-1.5 pl-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                    <div className="space-y-1">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Módulos Operacionais
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Auditoria de Saídas Emergenciais
                        </h1>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={carregarSaidas} className="w-1/2 sm:w-auto bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                            🔄 Sincronizar
                        </button>
                        <button onClick={() => window.print()} className="w-1/2 sm:w-auto bg-[#1d1d1f] active:bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                            🖨️ Imprimir
                        </button>
                    </div>
                </header>

                {/* CARDS INDICADORES */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
                    <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Ausentes Agora (Na Rua)</p>
                        <h3 className={`text-lg sm:text-xl font-black mt-1 ${metricas.naRua > 0 ? 'text-[#ff3b30] animate-pulse' : 'text-[#86868b]'}`}>
                            {metricas.naRua} <span className="text-xs font-bold text-[#86868b]">operadores</span>
                        </h3>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Retornos Confirmados</p>
                        <h3 className="text-lg sm:text-xl font-black text-[#34c759] mt-1">{metricas.encerradas} <span className="text-xs text-[#86868b] font-bold">histórico</span></h3>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Total de Ocorrências</p>
                        <h3 className="text-lg sm:text-xl font-black text-[#1d1d1f] mt-1">{metricas.total} <span className="text-xs text-[#86868b] font-bold">registros</span></h3>
                    </div>
                </section>

                {/* BARRA DE FILTROS */}
                <section className="bg-white border border-[#e5e5ea] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row gap-4 print:hidden">
                    <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Busca Global</label>
                        <input
                            type="text"
                            placeholder="Buscar por colaborador, justificativa ou ID..."
                            value={pesquisa}
                            onChange={e => setPesquisa(e.target.value)}
                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors uppercase placeholder-[#b4b4b9]"
                        />
                    </div>
                    <div className="w-full sm:w-56 space-y-1">
                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Filtrar Situação</label>
                        <select
                            value={filtroStatus}
                            onChange={e => setFiltroStatus(e.target.value)}
                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-semibold outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                        >
                            <option value="todos">Todos os Registros</option>
                            <option value="rua">Apenas Ausentes (Na Rua)</option>
                            <option value="retornado">Apenas Retornados</option>
                        </select>
                    </div>
                </section>

                {/* TABELA PRINCIPAL COM PROTEÇÃO DE TRANSBORDAMENTO */}
                <section className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] print:bg-white print:border-none print:p-0">
                    {carregando ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Construindo Auditoria...</span>
                        </div>
                    ) : dadosFiltrados.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wider">Nenhum afastamento emergencial localizado.</p>
                        </div>
                    ) : (
                        <div className="overflow-visible">
                            <table className="w-full text-left text-xs border-collapse print:text-black">
                                <thead>
                                <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none print:border-black print:text-black">
                                    <th className="pb-3 pl-2 w-32">Data / Saída</th>
                                    <th className="pb-3 w-48">Colaborador</th>
                                    <th className="pb-3 w-32 text-center">Horário Retorno</th>
                                    <th className="pb-3 w-24 text-center">Duração</th>
                                    <th className="pb-3 pl-4 hidden md:table-cell print:table-cell">Justificativa da Emergência</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7] print:divide-black/10">
                                {dadosFiltrados.map((item) => {
                                    const dSaida = new Date(item.horario_saida);
                                    const dRetorno = item.horario_retorno ? new Date(item.horario_retorno) : null;
                                    const chaveUnica = `emergencia-${item.id}`;
                                    const estaFixo = justificativaFixaId === chaveUnica;

                                    return (
                                        <tr key={item.id} className={`hover:bg-[#f5f5f7]/50 transition-colors relative group/row print:hover:bg-transparent ${estaFixo ? 'z-50 bg-[#f5f5f7]/30' : 'hover:z-50'}`}>
                                            <td className="py-4 pl-2 font-mono text-[#86868b] font-bold print:text-black">
                                                {dSaida.toLocaleDateString('pt-BR')}
                                                <span className="text-[10px] font-bold text-[#1d1d1f] block mt-0.5 print:text-black/60">
                                                    {dSaida.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>

                                            {/* Colaborador com o Popover de Justificativa Seguro */}
                                            <td className="py-4 font-bold text-[#1d1d1f] relative overflow-visible print:text-black">
                                                <div
                                                    onClick={() => alternarFixarJustificativa(chaveUnica)}
                                                    className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 select-none print:cursor-default print:hover:opacity-100"
                                                >
                                                    <span className="block leading-tight truncate max-w-[150px] sm:max-w-none">
                                                        {item.funcionarios ? `${item.funcionarios.nome} ${item.funcionarios.sobrenome}` : 'Ex-colaborador'}
                                                    </span>
                                                    <span className="text-[9px] opacity-30 group-hover/row:opacity-100 transition-opacity print:hidden">💬</span>
                                                </div>
                                                <span className="text-[9px] text-[#86868b] font-mono font-medium block mt-0.5">
                                                    ID: {item.funcionario_id}
                                                </span>

                                                {/* POPOVER TIPO COCORA - PROTEÇÃO TOTAL CONTRA CORTES DE OVERFLOW */}
                                                {item.justificativa && (
                                                    <div className={`absolute left-0 top-[85%] w-64 bg-white border border-[#e5e5ea] p-3 rounded-xl shadow-xl z-50 transition-all print:hidden ${
                                                        estaFixo
                                                            ? 'opacity-100 block ring-1 ring-black/5'
                                                            : 'opacity-0 scale-95 pointer-events-none hidden group-hover/row:block group-hover/row:opacity-100 group-hover/row:scale-100 duration-150'
                                                    }`}>
                                                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#86868b] mb-1">
                                                            {estaFixo ? "📌 Ocorrência Fixada" : "💬 Motivo Emergencial"}
                                                        </p>
                                                        <p className="text-[11px] text-slate-600 font-medium normal-case leading-normal whitespace-normal break-words">
                                                            {item.justificativa}
                                                        </p>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Situação / Retorno */}
                                            <td className="py-4 text-center font-mono font-bold">
                                                {dRetorno ? (
                                                    <span className="text-[#248a3d] print:text-black text-xs">
                                                        {dRetorno.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] bg-[#ff3b30]/5 border border-[#ff3b30]/10 text-[#ff3b30] px-2 py-0.5 rounded font-bold uppercase tracking-wider print:border-black print:text-black print:bg-transparent">
                                                        Na Rua
                                                    </span>
                                                )}
                                            </td>

                                            {/* Duração Computada */}
                                            <td className="py-4 text-center font-mono font-bold text-[#1d1d1f] print:text-black">
                                                {calcularDuracao(item.horario_saida, item.horario_retorno)}
                                            </td>

                                            {/* Justificativa Sólida Exibida em Telas Grandes / Impressão */}
                                            <td className="py-4 pl-4 text-[#86868b] font-medium whitespace-pre-wrap max-w-xs md:max-w-sm hidden md:table-cell print:table-cell print:text-black">
                                                {item.justificativa}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}