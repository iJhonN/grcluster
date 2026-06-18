"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
}

interface RegistroUnificado {
    id: number;
    funcionario_id: string;
    nome: string;
    data: string;
    minutos: number;
    tipo: 'pausa' | 'extra_diurna' | 'extra_noturna';
    observacao: string;
}

export default function RelatorioDetalhadoPausasEExtrasPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [pausas, setPausas] = useState<any[]>([]);
    const [horasExtras, setHorasExtras] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Estados dos Filtros
    const [pesquisaTexto, setPesquisaTexto] = useState('');
    const [filtroFuncionario, setFiltroFuncionario] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroPeriodo, setFiltroPeriodo] = useState('30'); // em dias

    // Estado para travar a justificativa aberta ao clicar
    const [justificativaFixaId, setJustificativaFixaId] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Função utilitária para converter minutos em formato de horas legível para Horas Extras
    const converterMinutosParaHoras = (minutosTotais: number): string => {
        const horas = Math.floor(minutosTotais / 60);
        const minutos = minutosTotais % 60;
        if (horas === 0) return `+${minutos}m`;
        return minutos === 0 ? `+${horas}h` : `+${horas}h ${minutos}m`;
    };

    async function carregarDados() {
        setCarregando(true);
        try {
            const [resFunc, resPausas, resExtras] = await Promise.all([
                supabase.from('funcionarios').select('id, nome, sobrenome, cargo').order('nome'),
                supabase.from('pausas').select('*'),
                supabase.from('horas_extras').select('*')
            ]);

            if (resFunc.data) setFuncionarios(resFunc.data);
            if (resPausas.data) setPausas(resPausas.data);
            if (resExtras.data) setHorasExtras(resExtras.data);
        } catch (err) {
            console.error("Erro ao carregar relatório unificado:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    // 1. UNIFICA E FILTRA OS DADOS EM TEMPO REAL
    const dadosFiltrados = useMemo((): RegistroUnificado[] => {
        const listaUnificada: RegistroUnificado[] = [];

        pausas.forEach(p => {
            listaUnificada.push({
                id: p.id,
                funcionario_id: p.funcionario_id,
                nome: p.nome || 'Colaborador',
                data: p.data,
                minutos: Number(p.minutos_ajuste || 0),
                tipo: 'pausa',
                observacao: p.observacao || ''
            });
        });

        horasExtras.forEach(e => {
            if (e.minutos_diurnos > 0) {
                listaUnificada.push({
                    id: e.id,
                    funcionario_id: e.funcionario_id,
                    nome: e.nome_completo || 'Colaborador',
                    data: `${e.data_referencia}T12:00:00.000Z`,
                    minutos: Number(e.minutos_diurnos),
                    tipo: 'extra_diurna',
                    observacao: e.observacao || ''
                });
            }
            if (e.minutos_noturnos > 0) {
                listaUnificada.push({
                    id: e.id,
                    funcionario_id: e.funcionario_id,
                    nome: e.nome_completo || 'Colaborador',
                    data: `${e.data_referencia}T19:00:00.000Z`,
                    minutos: Number(e.minutos_noturnos),
                    tipo: 'extra_noturna',
                    observacao: e.observacao || ''
                });
            }
        });

        return listaUnificada.filter(item => {
            if (filtroFuncionario !== 'todos' && item.funcionario_id !== filtroFuncionario) return false;
            if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;

            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - parseInt(filtroPeriodo));
            if (new Date(item.data) < dataLimite) return false;

            const termo = pesquisaTexto.toLowerCase().trim();
            if (termo) {
                const compl = item.nome.toLowerCase();
                const obs = item.observacao.toLowerCase();
                const idFunc = item.funcionario_id.toLowerCase();
                return compl.includes(termo) || obs.includes(termo) || idFunc.includes(termo);
            }

            return true;
        }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [pausas, horasExtras, filtroFuncionario, filtroTipo, filtroPeriodo, pesquisaTexto]);

    // 2. CARD INDICADORES COM RECALCULO DINÂMICO
    const metrificacao = useMemo(() => {
        let minutosPausas = 0;
        let minutosExtrasDiurnas = 0;
        let minutosExtrasNoturnas = 0;

        dadosFiltrados.forEach(d => {
            if (d.tipo === 'pausa') minutosPausas += d.minutos;
            else if (d.tipo === 'extra_diurna') minutosExtrasDiurnas += d.minutos;
            else if (d.tipo === 'extra_noturna') minutosExtrasNoturnas += d.minutos;
        });

        return {
            minutosPausas,
            minutosExtrasDiurnas,
            minutosExtrasNoturnas,
            registrosExibidos: dadosFiltrados.length
        };
    }, [dadosFiltrados]);

    const alternarFixarJustificativa = (chaveUnica: string) => {
        if (justificativaFixaId === chaveUnica) {
            setJustificativaFixaId(null);
        } else {
            setJustificativaFixaId(chaveUnica);
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
                            Auditoria de Pausas &amp; Horas Extras
                        </h1>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="w-full sm:w-auto bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                    >
                        🖨️ Imprimir Relatório
                    </button>
                </header>

                {/* CARDS INDICADORES */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
                    <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Total Pausas</p>
                        <h3 className="text-lg sm:text-xl font-black text-[#ff9500] mt-1">{metrificacao.minutosPausas} <span className="text-xs font-bold text-[#86868b]">min</span></h3>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Extra Diurna</p>
                        <h3 className="text-lg sm:text-xl font-black text-[#34c759] mt-1">{converterMinutosParaHoras(metrificacao.minutosExtrasDiurnas).replace('+', '')}</h3>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Extra Noturna</p>
                        <h3 className="text-lg sm:text-xl font-black text-[#5856d6] mt-1">{converterMinutosParaHoras(metrificacao.minutosExtrasNoturnas).replace('+', '')}</h3>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Linhas Filtradas</p>
                        <h3 className="text-lg sm:text-xl font-black text-[#1d1d1f] mt-1">{metrificacao.registrosExibidos} <span className="text-xs text-[#86868b] font-bold">linhas</span></h3>
                    </div>
                </section>

                {/* BARRA DE FILTROS AVANÇADOS */}
                <section className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Pesquisa Global</label>
                        <input
                            type="text"
                            placeholder="Buscar por observação, nome..."
                            value={pesquisaTexto}
                            onChange={e => setPesquisaTexto(e.target.value)}
                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors uppercase placeholder-[#b4b4b9]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Filtrar Colaborador</label>
                        <select
                            value={filtroFuncionario}
                            onChange={e => setFiltroFuncionario(e.target.value)}
                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                        >
                            <option value="todos">Todos os Funcionários</option>
                            {funcionarios.map(f => (
                                <option key={f.id} value={f.id}>{f.nome} {f.sobrenome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Tipo do Registro</label>
                        <select
                            value={filtroTipo}
                            onChange={e => setFiltroTipo(e.target.value)}
                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                        >
                            <option value="todos">Todos os Lançamentos</option>
                            <option value="pausa">Apenas Pausas</option>
                            <option value="extra_diurna">Apenas Horas Extras Diurnas</option>
                            <option value="extra_noturna">Apenas Horas Extras Noturnas</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Janela de Tempo</label>
                        <select
                            value={filtroPeriodo}
                            onChange={e => setFiltroPeriodo(e.target.value)}
                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                        >
                            <option value="7">Últimos 7 dias</option>
                            <option value="15">Últimos 15 dias</option>
                            <option value="30">Últimos 30 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="365">Último Ano inteiro</option>
                        </select>
                    </div>
                </section>

                {/* TABELA PRINCIPAL DE DADOS FLUTUANTE (OVERFLOW CORRIGIDO) */}
                <section className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] print:bg-white print:border-none print:p-0">
                    {carregando ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Montando Relatório Detalhado...</span>
                        </div>
                    ) : dadosFiltrados.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wider">Nenhum registro encontrado para os filtros selecionados.</p>
                        </div>
                    ) : (
                        <div className="overflow-visible">
                            <table className="w-full text-left text-xs border-collapse print:text-black">
                                <thead>
                                <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none print:border-black print:text-black">
                                    <th className="pb-3 pl-2 w-32">Data / Hora</th>
                                    <th className="pb-3 w-48">Colaborador</th>
                                    <th className="pb-3 w-36 text-center">Identificador</th>
                                    <th className="pb-3 w-24 text-center">Tempo</th>
                                    <th className="pb-3 pl-4 hidden md:table-cell print:table-cell">Observação / Justificativa</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7] print:divide-black/10">
                                {dadosFiltrados.map((item, idx) => {
                                    const dObj = new Date(item.data);
                                    const dataForm = dObj.toLocaleDateString('pt-BR');
                                    const horaForm = item.data.includes('T12:') || item.data.includes('T19:')
                                        ? ''
                                        : dObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                                    const chaveUnica = `relatorio-${item.tipo}-${item.id}`;
                                    const estaFixo = justificativaFixaId === chaveUnica;

                                    return (
                                        <tr key={idx} className={`hover:bg-[#f5f5f7]/50 transition-colors relative group/row print:hover:bg-transparent ${estaFixo ? 'z-50 bg-[#f5f5f7]/30' : 'hover:z-50'}`}>
                                            <td className="py-3.5 pl-2 font-mono text-[#86868b] font-bold print:text-black">
                                                {dataForm} {horaForm && <span className="text-[9px] font-medium text-slate-400 block sm:inline sm:ml-1 print:text-black/60">{horaForm}</span>}
                                            </td>

                                            {/* Colaborador + Tooltip de clique/hover inteligente */}
                                            <td className="py-3.5 font-bold text-[#1d1d1f] relative overflow-visible print:text-black">
                                                <div
                                                    onClick={() => alternarFixarJustificativa(chaveUnica)}
                                                    className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 select-none print:cursor-default print:hover:opacity-100"
                                                >
                                                    <span className="block leading-tight truncate max-w-[160px] sm:max-w-none">{item.nome}</span>
                                                    <span className="text-[9px] opacity-30 group-hover/row:opacity-100 transition-opacity print:hidden">💬</span>
                                                </div>
                                                <span className="text-[9px] text-[#86868b] font-mono font-medium block print:text-black/50">ID: {item.funcionario_id}</span>

                                                {/* POPUP DINÂMICO PROTEGIDO POR Z-INDEX CONTRA CORTES */}
                                                {item.observacao && (
                                                    <div className={`absolute left-0 top-[85%] w-64 bg-white border border-[#e5e5ea] p-3 rounded-xl shadow-xl z-50 transition-all print:hidden ${
                                                        estaFixo
                                                            ? 'opacity-100 block ring-1 ring-black/10'
                                                            : 'opacity-0 scale-95 pointer-events-none hidden group-hover/row:block group-hover/row:opacity-100 group-hover/row:scale-100 duration-150'
                                                    }`}>
                                                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#86868b] mb-1">
                                                            {estaFixo ? "📌 Registro Fixado" : "💬 Observação Técnica"}
                                                        </p>
                                                        <p className="text-[11px] text-slate-600 font-medium normal-case leading-normal whitespace-normal break-words">
                                                            {item.observacao}
                                                        </p>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Identificador Badge */}
                                            <td className="py-3.5 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                                                    item.tipo === 'pausa'
                                                        ? 'bg-[#ff9500]/5 border-[#ff9500]/10 text-[#ff9500] print:text-black print:border-black'
                                                        : item.tipo === 'extra_diurna'
                                                            ? 'bg-[#34c759]/5 border-[#34c759]/10 text-[#248a3d] print:text-black print:border-black'
                                                            : 'bg-[#5856d6]/5 border-[#5856d6]/10 text-[#5856d6] print:text-black print:border-black'
                                                }`}>
                                                    {item.tipo === 'pausa' ? 'Pausa' : item.tipo === 'extra_diurna' ? 'Extra Diur' : 'Extra Not'}
                                                </span>
                                            </td>

                                            {/* Tempo Convertido */}
                                            <td className={`py-3.5 text-center font-mono font-black text-[11px] print:text-black ${
                                                item.tipo === 'pausa' ? 'text-[#ff9500]' : item.tipo === 'extra_diurna' ? 'text-[#248a3d]' : 'text-[#5856d6]'
                                            }`}>
                                                {item.tipo === 'pausa' ? `+${item.minutos}m` : converterMinutosParaHoras(item.minutos)}
                                            </td>

                                            {/* Observação Sólida para Telas Grandes / Impressão */}
                                            <td className="py-3.5 pl-4 text-[#86868b] font-medium whitespace-pre-wrap max-w-xs md:max-w-md hidden md:table-cell print:table-cell print:text-black">
                                                {item.observacao}
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