"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
}

export default function GestaoFolgasEFeriadosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    // Estados para Lançamento Individual
    const [tipoIndividual, setTipoIndividual] = useState('folga'); // 'folga', 'justificativa', 'compensacao_diurna', 'compensacao_noturna'
    const [buscaFuncionario, setBuscaFuncionario] = useState('');
    const [funcionarioId, setFuncionarioId] = useState('');
    const [dataIndividual, setDataIndividual] = useState('');
    const [obsIndividual, setObsIndividual] = useState('FOLGA');

    // Minutagem de desconto
    const [minutosCompensacao, setMinutosCompensacao] = useState(60);

    // Estados para Lançamento Coletivo
    const [dataFeriado, setDataFeriado] = useState('');
    const [nomeFeriado, setNomeFeriado] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarFuncionarios() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('funcionarios')
                .select('id, nome, sobrenome, cargo')
                .order('nome');
            if (data) setFuncionarios(data);
        } catch (err) {
            console.error("Erro ao carregar colaboradores:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    // Atualiza o texto padrão dinamicamente
    useEffect(() => {
        if (tipoIndividual === 'folga') {
            setObsIndividual('FOLGA');
        } else if (tipoIndividual === 'justificativa') {
            setObsIndividual('SAIU ÀS 17:00 - ');
        } else if (tipoIndividual === 'compensacao_diurna') {
            setObsIndividual('COMPENSAÇÃO DE HORAS DIURNAS');
        } else if (tipoIndividual === 'compensacao_noturna') {
            setObsIndividual('COMPENSAÇÃO DE HORAS NOTURNAS');
        }
    }, [tipoIndividual]);

    const funcionariosFiltrados = useMemo(() => {
        const termo = buscaFuncionario.toLowerCase().trim();
        if (!termo) return funcionarios;
        return funcionarios.filter(f =>
            f.nome.toLowerCase().includes(termo) ||
            f.sobrenome.toLowerCase().includes(termo) ||
            f.cargo.toLowerCase().includes(termo)
        );
    }, [funcionarios, buscaFuncionario]);

    useEffect(() => {
        if (funcionarioId) {
            const aindaExiste = funcionariosFiltrados.some(f => f.id === funcionarioId);
            if (!aindaExiste) setFuncionarioId('');
        }
    }, [funcionariosFiltrados, funcionarioId]);

    const handleLancarIndividual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funcionarioId || !dataIndividual || !obsIndividual.trim()) {
            setStatusFeed({ tipo: 'erro', texto: 'Preencha o colaborador, a data e a justificativa.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const func = funcionarios.find(f => f.id === funcionarioId);
            const nomeCompleto = func ? `${func.nome} ${func.sobrenome}` : 'Colaborador';

            const isCompensacao = tipoIndividual.startsWith('compensacao');
            const minutosLancamento = isCompensacao ? -Math.abs(minutosCompensacao) : 0;

            const { error } = await supabase
                .from('pausas')
                .insert([{
                    funcionario_id: funcionarioId,
                    nome: nomeCompleto,
                    data: `${dataIndividual}T12:00:00Z`,
                    minutos_ajuste: minutosLancamento, // Injeta o valor negativo para o motor matemático subtrair
                    tipo: tipoIndividual,
                    observacao: obsIndividual.trim().toUpperCase(),
                    origem: 'admin'
                }]);

            if (error) throw error;

            let labelSucesso = 'Folga';
            if (tipoIndividual === 'justificativa') labelSucesso = 'Justificativa';
            if (isCompensacao) labelSucesso = 'Abatimento de Banco de Horas';

            setStatusFeed({ tipo: 'sucesso', texto: `${labelSucesso} registrada com sucesso para ${nomeCompleto}.` });
            setFuncionarioId('');
            setDataIndividual('');
            setBuscaFuncionario('');
        } catch (err) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: 'Falha ao salvar o registro no banco.' });
        } finally {
            setEnviando(false);
        }
    };

    const handleLancarFeriadoColetivo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dataFeriado || !nomeFeriado.trim()) {
            setStatusFeed({ tipo: 'erro', texto: 'Preencha a data e o nome do feriado nacional/local.' });
            return;
        }

        if (funcionarios.length === 0) {
            setStatusFeed({ tipo: 'erro', texto: 'Nenhum funcionário cadastrado.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const feriadosEmLote = funcionarios.map(f => ({
                funcionario_id: f.id,
                nome: `${f.nome} ${f.sobrenome}`,
                data: `${dataFeriado}T12:00:00Z`,
                minutos_ajuste: 0,
                tipo: 'feriado',
                observacao: nomeFeriado.trim().toUpperCase(),
                origem: 'admin'
            }));

            const { error } = await supabase.from('pausas').insert(feriadosEmLote);
            if (error) throw error;

            setStatusFeed({ tipo: 'sucesso', texto: `Feriado "${nomeFeriado.toUpperCase()}" aplicado a todos.` });
            setDataFeriado('');
            setNomeFeriado('');
        } catch (err) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: 'Falha ao processar o feriado global.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col justify-between w-full">
            <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-6">

                <header className="space-y-1.5 pl-1 border-b border-[#e5e5ea] pb-6">
                    <Link href="/dashboard/rh" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#007aff] transition-colors block">
                        ← Dashboard de RH
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Escalonamento de Folgas e Feriados
                    </h1>
                </header>

                {statusFeed.texto && (
                    <div className={`p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                        statusFeed.tipo === 'sucesso' ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]' : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                    }`}>
                        {statusFeed.texto}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">

                    {/* BLOC 1: FERIADO COLETIVO */}
                    <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                        <div className="border-b border-[#f5f5f7] pb-3 select-none">
                            <span className="text-[9px] font-bold uppercase text-blue-600 tracking-wider">Ação Coletiva</span>
                            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mt-0.5">Lançar Feriado Geral</h3>
                        </div>

                        <form onSubmit={handleLancarFeriadoColetivo} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Data do Feriado</label>
                                <input type="date" value={dataFeriado} onChange={e => setDataFeriado(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg text-xs font-bold outline-none text-[#1d1d1f]" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Nome do Feriado</label>
                                <input type="text" placeholder="Ex: CONFRATERNIZAÇÃO UNIVERSAL" value={nomeFeriado} onChange={e => setNomeFeriado(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg text-xs font-bold uppercase outline-none" required />
                            </div>
                            <button type="submit" disabled={enviando || carregando} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider disabled:opacity-40">
                                {enviando ? "Processando..." : `Aplicar a todos (${funcionarios.length})`}
                            </button>
                        </form>
                    </div>

                    {/* BLOCO 2: LANÇAMENTO INDIVIDUAL */}
                    <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                        <div className="border-b border-[#f5f5f7] pb-3 select-none flex justify-between items-center">
                            <div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${tipoIndividual.startsWith('compensacao') ? 'text-red-500' : 'text-[#ff9500]'}`}>
                                    {tipoIndividual.startsWith('compensacao') ? 'Desconto de Banco' : 'Ação Individual'}
                                </span>
                                <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mt-0.5">Exceções de Pátio</h3>
                            </div>

                            <select
                                value={tipoIndividual}
                                onChange={e => setTipoIndividual(e.target.value)}
                                className={`border rounded-lg px-2 py-1 text-[10px] font-bold uppercase outline-none cursor-pointer ${
                                    tipoIndividual.startsWith('compensacao') ? 'bg-red-50 border-red-200 text-red-700 font-black' : 'bg-[#f5f5f7] border-[#e5e5ea]'
                                }`}
                            >
                                <option value="folga">Folga Regular</option>
                                <option value="justificativa">Justificativa Horário</option>
                                <option value="compensacao_diurna">📉 Abater Horas Diurnas</option>
                                <option value="compensacao_noturna">🌙 Abater Horas Noturnas</option>
                            </select>
                        </div>

                        <form onSubmit={handleLancarIndividual} className="space-y-4">
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Filtrar Colaborador</label>
                                    <input type="text" placeholder="Digite o nome ou cargo..." value={buscaFuncionario} onChange={e => setBuscaFuncionario(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg text-xs font-medium outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <select value={funcionarioId} onChange={e => setFuncionarioId(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2.5 rounded-lg text-xs font-bold uppercase outline-none" required>
                                        <option value="">-- SELECIONE O COLABORADOR --</option>
                                        {funcionariosFiltrados.map(f => (
                                            <option key={f.id} value={f.id}>{f.nome} {f.sobrenome} ({f.cargo})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Data do Evento</label>
                                    <input type="date" value={dataIndividual} onChange={e => setDataIndividual(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2.5 rounded-lg text-xs font-bold text-center" required />
                                </div>

                                {tipoIndividual.startsWith('compensacao') ? (
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-red-500 tracking-wider ml-0.5">Tempo a Descontar</label>
                                        <select value={minutosCompensacao} onChange={e => setMinutosCompensacao(Number(e.target.value))} className="w-full bg-red-50/50 border border-red-200 text-red-700 font-black text-xs px-3 py-2.5 rounded-lg outline-none text-center cursor-pointer">
                                            <option value={60}>1h 00m (60 min)</option>
                                            <option value={90}>1h 30m (90 min)</option>
                                            <option value={120}>2h 00m (120 min)</option>
                                            <option value={180}>3h 00m (180 min)</option>
                                            <option value={240}>4h 00m (240 min)</option>
                                            <option value={480}>Dia Inteiro (480 min)</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Texto de Exibição</label>
                                        <input type="text" value={obsIndividual} onChange={e => setObsIndividual(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2.5 rounded-lg text-xs font-bold text-center uppercase" required />
                                    </div>
                                )}
                            </div>

                            {tipoIndividual.startsWith('compensacao') && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Motivo do Abatimento</label>
                                    <input type="text" value={obsIndividual} onChange={e => setObsIndividual(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2.5 rounded-lg text-xs font-bold uppercase" required />
                                </div>
                            )}

                            <button type="submit" disabled={enviando || !funcionarioId} className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 ${tipoIndividual.startsWith('compensacao') ? 'bg-red-600 text-white' : 'bg-[#1d1d1f] text-white'}`}>
                                {enviando ? "Gravando..." : tipoIndividual === 'folga' ? "Confirmar Folga" : tipoIndividual === 'justificativa' ? "Gravar Justificativa" : "Efetivar Subtração de Horas"}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
            <footer className="w-full max-w-6xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 text-[8px] text-[#86868b] uppercase font-bold tracking-wider select-none">
                <div>GR Autopeças &amp; Serviços • v1.3</div>
            </footer>
        </main>
    );
}