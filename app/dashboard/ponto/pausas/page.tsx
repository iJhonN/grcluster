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

    // Estados do Formulário
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
        const minutosInt = parseInt(minutosAjuste);
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
                        minutos_ajuste: minutosInt,
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
                        minutos_noturnos: tipoLancamento === 'extra_noturna' ? minutosInt : 0,
                        observacao: observacao.trim(),
                        origem: 'admin'
                    }]);
                if (error) throw error;
            }

            setStatusFeed({ tipo: 'sucesso', texto: `Lançamento de ${minutosAjuste} min gravado com sucesso para ${nomeCompleto}.` });
            setMinutosAjuste('');
            setObservacao('');
            carregarDados();

        } catch (err) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: 'Falha ao salvar o lançamento no banco.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5">
            <div className="w-full max-w-[1600px] mx-auto space-y-6">

                {/* HEADER */}
                <header className="space-y-1.5 pl-1">
                    <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                        ← Módulos Operacionais
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Ajustes de Jornada Manual
                    </h1>
                </header>

                {statusFeed.texto && (
                    <div className={`p-4 rounded-xl text-xs font-semibold border ${
                        statusFeed.tipo === 'sucesso'
                            ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                            : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                    }`}>
                        {statusFeed.texto}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">

                    {/* COLUNA 1: FORMULÁRIO */}
                    <form onSubmit={handleProcessarLancamento} className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4 h-full">
                        <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider border-b border-[#f5f5f7] pb-3">Novo Registro</h3>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Colaborador</label>
                            <select
                                value={funcionarioId}
                                onChange={e => setFuncionarioId(e.target.value)}
                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                            >
                                {funcionarios.map(f => (
                                    <option key={f.id} value={f.id}>{f.nome} {f.sobrenome} ({f.cargo})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Tempo (Em Minutos)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 90"
                                    value={minutosAjuste}
                                    onChange={e => setMinutosAjuste(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Identificador</label>
                                <select
                                    value={tipoLancamento}
                                    onChange={e => setTipoLancamento(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                                >
                                    <option value="pausa">Pausa Regulamentar</option>
                                    <option value="extra_diurna">Hora Extra Diurna</option>
                                    <option value="extra_noturna">Hora Extra Noturna</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Justificativa Operacional</label>
                            <textarea
                                placeholder="Descreva os motivos técnicos..."
                                value={observacao}
                                onChange={e => setObservacao(e.target.value)}
                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-3 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] h-24 resize-none transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                        >
                            {enviando ? "Gravando..." : "Confirmar Lançamento"}
                        </button>
                    </form>

                    {/* COLUNA 2: LISTA DE PAUSAS */}
                    <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] h-full">
                        <h3 className="text-xs font-bold text-[#ff9500] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 mb-4">Pausas Regulamentares</h3>

                        {carregando ? (
                            <div className="py-10 text-center animate-pulse text-[10px] uppercase font-bold text-slate-400 font-mono">Buscando...</div>
                        ) : pausasFiltradas.length === 0 ? (
                            <p className="text-xs text-[#86868b] py-10 text-center font-semibold uppercase tracking-wide">Sem pausas recentes.</p>
                        ) : (
                            <div className="overflow-visible">
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
                                                        onClick={() => alternarFixarJustificativa(chaveUnica)}
                                                        className="cursor-pointer hover:text-[#ff9500] transition-colors flex items-center gap-1 select-none"
                                                    >
                                                        <span>{item.nome}</span>
                                                        <span className="text-[9px] opacity-40 group-hover/row:opacity-100 transition-opacity">💬</span>
                                                    </div>

                                                    {/* POPUP DE JUSTIFICATIVA COM PRIORIDADE DE EMPILHAMENTO CRÍTICA (z-50) */}
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
                    <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] h-full md:col-span-2 lg:col-span-1">
                        <h3 className="text-xs font-bold text-[#5856d6] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 mb-4">Horas Extras Creditadas</h3>

                        {carregando ? (
                            <div className="py-10 text-center animate-pulse text-[10px] uppercase font-bold text-slate-400 font-mono">Buscando...</div>
                        ) : extrasFiltrados.length === 0 ? (
                            <p className="text-xs text-[#86868b] py-10 text-center font-semibold uppercase tracking-wide">Sem horas extras recentes.</p>
                        ) : (
                            <div className="overflow-visible">
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
                                                        onClick={() => alternarFixarJustificativa(chaveUnica)}
                                                        className="cursor-pointer hover:text-[#5856d6] transition-colors flex items-center gap-1 select-none"
                                                    >
                                                        <span>{item.nome}</span>
                                                        <span className="text-[9px] opacity-40 group-hover/row:opacity-100 transition-opacity">💬</span>
                                                    </div>

                                                    {/* POPUP DE JUSTIFICATIVA COM PRIORIDADE DE EMPILHAMENTO CRÍTICA (z-50) */}
                                                    {item.observacao && (
                                                        <div className={`absolute left-0 top-[85%] w-64 bg-white border border-[#e5e5ea] p-3 rounded-xl shadow-xl z-50 transition-all ${
                                                            estaFixo
                                                                ? 'opacity-100 block ring-1 ring-[#5856d6]/30'
                                                                : 'opacity-0 scale-95 pointer-events-none hidden group-hover/row:block group-hover/row:opacity-100 group-hover/row:scale-100 duration-150'
                                                        }`}>
                                                            <p className="text-[8px] font-bold uppercase tracking-wider text-[#5856d6] mb-1">
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
                                                            item.tipo.includes('Diurna') ? 'bg-[#34c759]/5 text-[#248a3d]' : 'bg-[#5856d6]/5 text-[#5856d6]'
                                                        }`}>
                                                            {item.tipo.includes('Diurna') ? 'diurna' : 'noturna'}
                                                        </span>
                                                </td>
                                                <td className="py-3.5 text-right font-mono font-black text-[#5856d6] pr-1">
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
        </main>
    );
}