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
}

interface LancamentoGeral {
    id: number;
    funcionario_id: string;
    nome: string;
    data: string;
    minutos: number;
    tipo: string;
    observacao: string;
}

export default function GestaoLancamentosManuaisPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [historicoRecente, setHistoricoRecente] = useState<LancamentoGeral[]>([]);

    // Estados do Formulário e Busca
    const [buscaFuncionario, setBuscaFuncionario] = useState('');
    const [funcionarioId, setFuncionarioId] = useState('');
    const [minutosAjuste, setMinutosAjuste] = useState('');
    const [tipoLancamento, setTipoLancamento] = useState('pausa'); // 'pausa', 'extra_diurna', 'extra_noturna'
    const [observacao, setObservacao] = useState('');

    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    // Estado para travar a justificativa aberta ao clicar
    const [justificativaFixaId, setJustificativaFixaId] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const converterMinutosParaHoras = (minutosTotais: number): string => {
        const horas = Math.floor(minutosTotais / 60);
        const minutos = minutosTotais % 60;
        if (horas === 0) return `+${minutos}m`;
        return minutos === 0 ? `+${horas}h` : `+${horas}h ${minutos}m`;
    };

    async function carregarDados() {
        try {
            const [resFunc, resPausas, resExtras] = await Promise.all([
                supabase.from('funcionarios').select('id, nome, sobrenome, cargo').order('nome'),
                supabase.from('pausas').select('*').order('criado_em', { ascending: false }).limit(15),
                supabase.from('horas_extras').select('*').order('criado_em', { ascending: false }).limit(15)
            ]);

            if (resFunc.data) {
                setFuncionarios(resFunc.data);
                if (resFunc.data.length > 0 && !funcionarioId) {
                    setFuncionarioId(resFunc.data[0].id);
                }
            }

            const listaUnificada: LancamentoGeral[] = [];

            if (resPausas.data) {
                resPausas.data.forEach((p: any) => {
                    listaUnificada.push({
                        id: p.id,
                        funcionario_id: p.funcionario_id,
                        nome: p.nome,
                        data: p.data,
                        minutos: p.minutos_ajuste,
                        tipo: 'Pausa',
                        observacao: p.observacao
                    });
                });
            }

            if (resExtras.data) {
                resExtras.data.forEach((e: any) => {
                    const min = e.minutos_diurnos > 0 ? e.minutos_diurnos : e.minutos_noturnos;
                    const sufixo = e.minutos_diurnos > 0 ? 'Extra Diurna' : 'Extra Noturna';
                    listaUnificada.push({
                        id: e.id,
                        funcionario_id: e.funcionario_id,
                        nome: e.nome_completo,
                        data: `${e.data_referencia}T12:00:00Z`,
                        minutos: min,
                        tipo: sufixo,
                        observacao: e.observacao
                    });
                });
            }

            listaUnificada.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
            setHistoricoRecente(listaUnificada);

        } catch (err) {
            console.error("Erro ao sincronizar dados de lançamentos:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    // Filtro preditivo de funcionários em tempo real
    const funcionariosFiltrados = useMemo(() => {
        const termo = buscaFuncionario.toLowerCase().trim();
        if (!termo) return funcionarios;
        return funcionarios.filter(f =>
            f.nome.toLowerCase().includes(termo) ||
            f.sobrenome.toLowerCase().includes(termo) ||
            f.cargo.toLowerCase().includes(termo)
        );
    }, [funcionarios, buscaFuncionario]);

    // Atualiza automaticamente a seleção se o funcionário atual sumir do filtro
    useEffect(() => {
        if (funcionariosFiltrados.length > 0) {
            const aindaExiste = funcionariosFiltrados.some(f => f.id === funcionarioId);
            if (!aindaExiste) {
                setFuncionarioId(funcionariosFiltrados[0].id);
            }
        } else {
            setFuncionarioId('');
        }
    }, [funcionariosFiltrados, funcionarioId]);

    const pausasFiltradas = useMemo(() => {
        return historicoRecente.filter(item => item.tipo === 'Pausa').slice(0, 10);
    }, [historicoRecente]);

    const extrasFiltrados = useMemo(() => {
        return historicoRecente.filter(item => item.tipo.includes('Extra')).slice(0, 10);
    }, [historicoRecente]);

    const alternarFixarJustificativa = (chaveUnica: string) => {
        if (justificativaFixaId === chaveUnica) {
            setJustificativaFixaId(null);
        } else {
            setJustificativaFixaId(chaveUnica);
        }
    };

    const handleProcessarLancamento = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funcionarioId || !minutosAjuste || !observacao.trim()) {
            setStatusFeed({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        const funcSelecionado = funcionarios.find(f => f.id === funcionarioId);
        const nomeCompleto = funcSelecionado ? `${funcSelecionado.nome} ${funcSelecionado.sobrenome}` : 'Colaborador';
        const minutesInt = parseInt(minutosAjuste);
        const dataHojeCompleta = new Date().toISOString();
        const dataHojeApenasChave = dataHojeCompleta.split('T')[0];

        try {
            if (tipoLancamento === 'pausa') {
                const { error } = await supabase
                    .from('pausas')
                    .insert([{
                        funcionario_id: funcionarioId,
                        nome: nomeCompleto,
                        data: dataHojeCompleta,
                        minutos_ajuste: minutesInt,
                        tipo: 'pausa',
                        observacao: observacao.trim(),
                        origem: 'admin'
                    }]);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('horas_extras')
                    .insert([{
                        funcionario_id: funcionarioId,
                        nome_completo: nomeCompleto,
                        data_referencia: dataHojeApenasChave,
                        minutos_diurnos: tipoLancamento === 'extra_diurna' ? minutesInt : 0,
                        minutos_noturnos: tipoLancamento === 'extra_noturna' ? minutesInt : 0,
                        observacao: observacao.trim(),
                        origem: 'admin'
                    }]);
                if (error) throw error;
            }

            setStatusFeed({ tipo: 'sucesso', texto: `Lançamento de ${minutosAjuste} min gravado com sucesso para ${nomeCompleto}.` });
            setMinutosAjuste('');
            setObservacao('');
            setBuscaFuncionario('');
            carregarDados();

        } catch (err) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: 'Falha ao salvar o lançamento no banco.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-[#007aff]/10 flex flex-col justify-between w-full">
            <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col gap-6">

                {/* HEADER */}
                <header className="space-y-1.5 pl-1 border-b border-[#e5e5ea] pb-6">
                    <Link href="/dashboard/rh" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#007aff] transition-colors block">
                        ← Dashboard de RH
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Ajustes de Jornada Manual
                    </h1>
                </header>

                {statusFeed.texto && (
                    <div className={`p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                        statusFeed.tipo === 'sucesso'
                            ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                            : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                    }`}>
                        {statusFeed.texto}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">

                    {/* COLUNA 1: FORMULÁRIO */}
                    <form onSubmit={handleProcessarLancamento} className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                        <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 select-none">Novo Registro</h3>

                        {/* BUSCA RÁPIDA E SELEÇÃO */}
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Filtrar Colaborador</label>
                                <input
                                    type="text"
                                    placeholder="Digite o nome ou cargo..."
                                    value={buscaFuncionario}
                                    onChange={e => setBuscaFuncionario(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors placeholder-[#b4b4b9]"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="relative">
                                    <select
                                        value={funcionarioId}
                                        onChange={e => setFuncionarioId(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2.5 rounded-lg text-xs font-bold uppercase outline-none text-[#1d1d1f] cursor-pointer appearance-none transition-colors"
                                        required
                                    >
                                        {/* CORRIGIDO AQUI: Alterado de funcionariosFiltradas para funcionariosFiltrados */}
                                        {funcionariosFiltrados.length === 0 ? (
                                            <option value="">Nenhum resultado encontrado</option>
                                        ) : (
                                            funcionariosFiltrados.map(f => (
                                                <option key={f.id} value={f.id}>{f.nome} {f.sobrenome} ({f.cargo})</option>
                                            ))
                                        )}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Tempo (Minutos)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 90"
                                    value={minutosAjuste}
                                    onChange={e => setMinutosAjuste(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg text-xs font-mono font-bold outline-none text-[#1d1d1f] transition-colors text-center"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Identificador</label>
                                <div className="relative">
                                    <select
                                        value={tipoLancamento}
                                        onChange={e => setTipoLancamento(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2.5 rounded-lg text-xs font-bold uppercase outline-none text-[#1d1d1f] cursor-pointer appearance-none transition-colors"
                                    >
                                        <option value="pausa">Pausa Regulamentar</option>
                                        <option value="extra_diurna">Hora Extra Diurna</option>
                                        <option value="extra_noturna">Hora Extra Noturna</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Justificativa Operacional</label>
                            <textarea
                                placeholder="Descreva os motivos técnicos do ajuste..."
                                value={observacao}
                                onChange={e => setObservacao(e.target.value)}
                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-3 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] h-24 resize-none transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={enviando || funcionariosFiltrados.length === 0}
                            className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                        >
                            {enviando ? "Gravando..." : "Confirmar Lançamento"}
                        </button>
                    </form>

                    {/* COLUNA 2: LISTA DE PAUSAS */}
                    <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] h-[500px] flex flex-col overflow-hidden">
                        <h3 className="text-xs font-bold text-[#ff9500] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 mb-4 shrink-0 select-none">Pausas Regulamentares</h3>

                        {carregando ? (
                            <div className="text-center py-10 flex flex-col items-center justify-center gap-2 text-[#86868b] flex-1">
                                <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Buscando...</span>
                            </div>
                        ) : pausasFiltradas.length === 0 ? (
                            <p className="text-xs text-[#86868b] py-10 text-center font-semibold uppercase tracking-wide flex-1 flex items-center justify-center">Sem pausas recentes.</p>
                        ) : (
                            <div className="overflow-y-auto flex-1 pr-0.5">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                    <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none">
                                        <th className="pb-2 pl-1">Data</th>
                                        <th className="pb-2">Colaborador</th>
                                        <th className="pb-2 text-right pr-1">Minutos</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f5f7]">
                                    {pausasFiltradas.map((item, idx) => {
                                        const chaveUnica = `pausa-${item.id}`;
                                        const estaFixo = justificativaFixaId === chaveUnica;

                                        return (
                                            <tr key={idx} className={`hover:bg-[#f5f5f7]/50 transition-colors relative group/row ${estaFixo ? 'z-50 bg-[#f5f5f7]/30' : 'hover:z-50'}`}>
                                                <td className="py-3.5 font-mono font-bold text-[#86868b] pl-1">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                                                <td className="py-3.5 font-bold text-[#1d1d1f] relative overflow-visible">
                                                    <div
                                                        onClick={() => Math.max(0, alternarFixarJustificativa(chaveUnica))}
                                                        className="cursor-pointer hover:text-[#ff9500] transition-colors flex items-center gap-1 select-none"
                                                    >
                                                        <span>{item.nome}</span>
                                                        <span className="text-[9px] opacity-40 group-hover/row:opacity-100 transition-opacity">💬</span>
                                                    </div>

                                                    {item.observacao && (
                                                        <div className={`absolute left-0 top-[85%] w-64 bg-white border border-[#e5e5ea] p-3 rounded-xl shadow-xl z-50 transition-all ${
                                                            estaFixo
                                                                ? 'opacity-100 block ring-1 ring-[#ff9500]/30'
                                                                : 'opacity-0 scale-95 pointer-events-none hidden group-hover/row:block group-hover/row:opacity-100 group-hover/row:scale-100 duration-150'
                                                        }`}>
                                                            <p className="text-[8px] font-bold uppercase tracking-wider text-[#ff9500] mb-1">
                                                                {estaFixo ? "📌 Justificativa Fixada" : "💬 Justificativa"}
                                                            </p>
                                                            <p className="text-[11px] text-slate-600 font-medium normal-case leading-normal whitespace-normal break-words">
                                                                {item.observacao}
                                                            </p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 text-right font-mono font-black text-[#ff9500] pr-1">+{item.minutos} min</td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* COLUNA 3: LISTA DE HORAS EXTRAS */}
                    <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] h-[500px] flex flex-col overflow-hidden md:col-span-2 lg:col-span-1">
                        <h3 className="text-xs font-bold text-[#007aff] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 mb-4 shrink-0 select-none">Horas Extras Creditadas</h3>

                        {carregando ? (
                            <div className="text-center py-10 flex flex-col items-center justify-center gap-2 text-[#86868b] flex-1">
                                <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Buscando...</span>
                            </div>
                        ) : extrasFiltrados.length === 0 ? (
                            <p className="text-xs text-[#86868b] py-10 text-center font-semibold uppercase tracking-wide flex-1 flex items-center justify-center">Sem horas extras recentes.</p>
                        ) : (
                            <div className="overflow-y-auto flex-1 pr-0.5">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                    <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none">
                                        <th className="pb-2 pl-1">Data</th>
                                        <th className="pb-2">Colaborador</th>
                                        <th className="pb-2 text-center">Tipo</th>
                                        <th className="pb-2 text-right pr-1">Horas</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f5f7]">
                                    {extrasFiltrados.map((item, idx) => {
                                        const chaveUnica = `extra-${item.id}`;
                                        const estaFixo = justificativaFixaId === chaveUnica;

                                        return (
                                            <tr key={idx} className={`hover:bg-[#f5f5f7]/50 transition-colors relative group/row ${estaFixo ? 'z-50 bg-[#f5f5f7]/30' : 'hover:z-50'}`}>
                                                <td className="py-3.5 font-mono font-bold text-[#86868b] pl-1">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                                                <td className="py-3.5 font-bold text-[#1d1d1f] relative overflow-visible">
                                                    <div
                                                        onClick={() => Math.max(0, alternarFixarJustificativa(chaveUnica))}
                                                        className="cursor-pointer hover:text-[#007aff] transition-colors flex items-center gap-1 select-none"
                                                    >
                                                        <span>{item.nome}</span>
                                                        <span className="text-[9px] opacity-40 group-hover/row:opacity-100 transition-opacity">💬</span>
                                                    </div>

                                                    {item.observacao && (
                                                        <div className={`absolute left-0 top-[85%] w-64 bg-white border border-[#e5e5ea] p-3 rounded-xl shadow-xl z-50 transition-all ${
                                                            estaFixo
                                                                ? 'opacity-100 block ring-1 ring-[#007aff]/30'
                                                                : 'opacity-0 scale-95 pointer-events-none hidden group-hover/row:block group-hover/row:opacity-100 group-hover/row:scale-100 duration-150'
                                                        }`}>
                                                            <p className="text-[8px] font-bold uppercase tracking-wider text-[#007aff] mb-1">
                                                                {estaFixo ? "📌 Justificativa Fixada" : "💬 Justificativa"}
                                                            </p>
                                                            <p className="text-[11px] text-slate-600 font-medium normal-case leading-normal whitespace-normal break-words">
                                                                {item.observacao}
                                                            </p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 text-center">
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                                                        item.tipo.includes('Diurna') ? 'bg-[#34c759]/5 text-[#248a3d]' : 'bg-[#007aff]/5 text-[#007aff]'
                                                    }`}>
                                                        {item.tipo.includes('Diurna') ? 'diurna' : 'noturna'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right font-mono font-black text-[#007aff] pr-1">
                                                    {converterMinutosParaHoras(item.minutos)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo Ajustes de Jornada v2.0</div>
            </footer>
        </main>
    );
}