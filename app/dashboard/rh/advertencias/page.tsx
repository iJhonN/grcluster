"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface Funcionario {
    id: number;
    nome: string;
    sobrenome: string;
    cargo: string;
}

interface RegistroDisciplinar {
    id: string;
    funcionario_id: number;
    nome_funcionario: string;
    cargo_funcionario: string;
    tipo: 'AVISO' | 'ADVERTENCIA' | 'SUSPENSAO';
    motivo: TEXT;
    data_aplicacao: string;
    dias_suspensao: number;
    criado_by: string;
}

export default function AdvertenciasPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [registros, setRegistros] = useState<RegistroDisciplinar[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [operador, setOperador] = useState('');

    // Estados do Formulário
    const [idFuncionario, setIdFuncionario] = useState('');
    const [tipoMedida, setTipoMedida] = useState('AVISO');
    const [motivo, setMotivo] = useState('');
    const [diasSuspensao, setDiasSuspensao] = useState('0');
    const [dataAplicacao, setDataAplicacao] = useState(new Date().toISOString().split('T')[0]);
    const [salvando, setSalvando] = useState(false);

    // Filtro da listagem
    const [filtroTipo, setFiltroTipo] = useState('TODOS');

    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function carregarDadosRH() {
            try {
                // Verificar operador logado
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { router.push('/'); return; }

                const { data: perfil } = await supabase
                    .from('usuarios_painel')
                    .select('nome')
                    .eq('id', user.id)
                    .maybeSingle();

                setOperador(perfil?.nome || 'Gestor');

                // Carregar funcionários para o Select
                const { data: listaFunc } = await supabase
                    .from('funcionarios')
                    .select('id, nome, sobrenome, cargo')
                    .order('nome', { ascending: true });

                // Carregar histórico de medidas disciplinares
                const { data: listaMedidas } = await supabase
                    .from('rh_advertencias')
                    .select('*')
                    .order('criado_at', { ascending: false });

                setFuncionarios(listaFunc || []);
                setRegistros(listaMedidas || []);
            } catch (err) {
                console.error(err);
            } finally {
                setCarregando(false);
            }
        }
        carregarDadosRH();
    }, [router, supabase]);

    const handleSalvarMedida = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idFuncionario || !motivo) return alert("Preencha todos os campos obrigatórios.");

        setSalvando(true);
        try {
            const funcSelecionado = funcionarios.find(f => f.id === Number(idFuncionario));
            if (!funcSelecionado) throw new Error("Funcionário não encontrado");

            const novaMedida = {
                funcionario_id: funcSelecionado.id,
                nome_funcionario: `${funcSelecionado.nome} ${funcSelecionado.sobrenome}`,
                cargo_funcionario: funcSelecionado.cargo,
                tipo: tipoMedida,
                motivo: motivo,
                data_aplicacao: dataAplicacao,
                dias_suspensao: tipoMedida === 'SUSPENSAO' ? Number(diasSuspensao) : 0,
                criado_por: operador
            };

            const { data, error } = await supabase
                .from('rh_advertencias')
                .insert([novaMedida])
                .select();

            if (error) throw error;

            // Logar ação automaticamente na central de auditoria externa se houver
            await supabase.from('logs_sistema').insert([{
                nome_usuario: operador,
                cargo_usuario: 'GESTOR_RH',
                acao: `Aplicou ${tipoMedida} para o colaborador ${novaMedida.nome_funcionario}`,
                rota: '/dashboard/rh/advertencias'
            }]);

            // Atualizar UI
            setRegistros([data[0], ...registros]);
            setMotivo('');
            setDiasSuspensao('0');
            setIdFuncionario('');
            alert("Medida disciplinar arquivada com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar no servidor.");
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) {
        return (
            <main className="min-h-screen bg-[#030303] flex items-center justify-center text-white">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    const registrosFiltrados = registros.filter(r => filtroTipo === 'TODOS' || r.tipo === filtroTipo);

    return (
        <main className="min-h-screen bg-[#030303] text-white p-4 sm:p-6 md:p-10 font-sans antialiased w-full max-w-[1600px] mx-auto space-y-10 relative">

            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
            </div>

            {/* HEADER */}
            <header className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-6">
                <div>
                    <Link href="/dashboard/rh" className="text-orange-500 font-bold text-[10px] uppercase tracking-[3px] mb-1.5 block hover:opacity-80">
                        ← Voltar para o RH
                    </Link>
                    <h1 className="text-3xl font-black uppercase italic tracking-tight">
                        Histórico <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Disciplinar da Frota</span>
                    </h1>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 font-bold">
                        Emissão e controle interno de avisos, advertências e suspensões de pátio
                    </p>
                </div>
            </header>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* FORMULÁRIO: LANÇAR NOVA MEDIDA */}
                <section className="bg-[#09090b] border border-white/[0.06] rounded-[28px] p-6 shadow-2xl space-y-6">
                    <div className="border-b border-white/[0.04] pb-3">
                        <h2 className="text-xs font-black uppercase tracking-[2px] text-orange-400">Aplicar Nova Medida</h2>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">O registro é permanente e auditado</p>
                    </div>

                    <form onSubmit={handleSalvarMedida} className="space-y-4">

                        {/* SELECIONAR FUNCIONÁRIO */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Colaborador Afetado *</label>
                            <select
                                value={idFuncionario}
                                onChange={(e) => setIdFuncionario(e.target.value)}
                                className="bg-black border border-white/[0.08] focus:border-orange-500 rounded-xl px-4 py-3 text-xs uppercase font-bold text-white tracking-wide w-full outline-none transition-colors"
                                required
                            >
                                <option value="">-- Selecione o Funcionário --</option>
                                {funcionarios.map(f => (
                                    <option key={f.id} value={f.id}>[{f.id}] {f.nome} {f.sobrenome} ({f.cargo})</option>
                                ))}
                            </select>
                        </div>

                        {/* SELECIONAR TIPO */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tipo de Infração *</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['AVISO', 'ADVERTENCIA', 'SUSPENSAO'].map(tipo => (
                                    <button
                                        key={tipo}
                                        type="button"
                                        onClick={() => setTipoMedida(tipo)}
                                        className={`py-2.5 text-[9px] font-black uppercase rounded-xl border transition-all ${
                                            tipoMedida === tipo
                                                ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                                                : 'bg-black border-white/[0.06] text-slate-400 hover:border-white/[0.15]'
                                        }`}
                                    >
                                        {tipo === 'ADVERTENCIA' ? 'Advertência' : tipo === 'SUSPENSAO' ? 'Suspensão' : 'Aviso'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* DIAS DE SUSPENSÃO (CONDICIONAL) */}
                        {tipoMedida === 'SUSPENSAO' && (
                            <div className="flex flex-col gap-1.5 animate-fade-in">
                                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tempo de Afastamento (Dias) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={diasSuspensao}
                                    onChange={(e) => setDiasSuspensao(e.target.value)}
                                    className="bg-black border border-white/[0.08] focus:border-orange-500 rounded-xl px-4 py-3 text-xs font-mono text-white w-full outline-none transition-colors"
                                    required
                                />
                            </div>
                        )}

                        {/* DATA DA OCORRÊNCIA */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Data de Aplicação *</label>
                            <input
                                type="date"
                                value={dataAplicacao}
                                onChange={(e) => setDataAplicacao(e.target.value)}
                                className="bg-black border border-white/[0.08] focus:border-orange-500 rounded-xl px-4 py-3 text-xs font-mono text-white w-full outline-none transition-colors"
                                required
                            />
                        </div>

                        {/* MOTIVO ESCRITO DETALHADO */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Descrição Detalhada do Motivo *</label>
                            <textarea
                                rows={4}
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Descreva explicitamente o ocorrido (ex: Descumprimento de EPI, falta injustificada, quebra de maquinário por imprudência...)"
                                className="bg-black border border-white/[0.08] focus:border-orange-500 rounded-xl px-4 py-3 text-xs text-slate-300 w-full outline-none transition-colors resize-none placeholder:text-slate-700"
                                required
                            />
                        </div>

                        {/* BOTÃO SUBMIT */}
                        <button
                            type="submit"
                            disabled={salvando}
                            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-black font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2"
                        >
                            {salvando ? 'Salvando Registro...' : '➔ Protocolar Medida Disciplinar'}
                        </button>
                    </form>
                </section>

                {/* HISTÓRICO GLOBAL E FILTROS */}
                <section className="lg:col-span-2 bg-[#09090b] border border-white/[0.06] rounded-[28px] p-6 shadow-2xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[2px] text-slate-300">Histórico de Ocorrências</h2>
                            <p className="text-[9px] text-slate-600 uppercase font-bold">Registros em tempo real armazenados na nuvem</p>
                        </div>

                        {/* FILTROS RÁPIDOS */}
                        <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-white/[0.04]">
                            {['TODOS', 'AVISO', 'ADVERTENCIA', 'SUSPENSAO'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFiltroTipo(t)}
                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wide transition-all ${
                                        filtroTipo === t
                                            ? 'bg-white/[0.08] text-white'
                                            : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LISTAGEM DE ARQUIVOS EM TIME-LINE */}
                    <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
                        {registrosFiltrados.length === 0 ? (
                            <div className="text-center py-24 border border-dashed border-white/[0.03] rounded-2xl">
                                <p className="text-[9px] text-slate-600 uppercase tracking-widest font-black">Nenhuma ocorrência encontrada para este filtro</p>
                            </div>
                        ) : (
                            registrosFiltrados.map((item) => {
                                // Lógica de cálculo de data de retorno
                                const dataInicio = new Date(item.data_application || item.data_aplicacao);
                                if (item.dias_suspensao > 0) {
                                    dataInicio.setDate(dataInicio.getDate() + item.dias_suspensao);
                                }
                                const dataRetornoFormatada = dataInicio.toLocaleDateString('pt-BR');

                                return (
                                    <div key={item.id} className="bg-black/40 border border-white/[0.03] hover:border-white/[0.08] rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between transition-all relative overflow-hidden group">

                                        {/* Indicador de cor lateral baseado no tipo */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                            item.tipo === 'SUSPENSAO' ? 'bg-red-500' : item.tipo === 'ADVERTENCIA' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />

                                        <div className="space-y-2 flex-1 pl-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[9px] font-black text-white uppercase bg-white/[0.05] px-2 py-0.5 rounded tracking-wide">
                                                    {item.nome_funcionario}
                                                </span>
                                                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">
                                                    [{item.cargo_funcionario}]
                                                </span>
                                                <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                                                    item.tipo === 'SUSPENSAO'
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                        : item.tipo === 'ADVERTENCIA'
                                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                }`}>
                                                    {item.tipo} {item.dias_suspensao > 0 && `(${item.dias_suspensao}d)`}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{item.motivo}</p>

                                            {item.tipo === 'SUSPENSAO' && (
                                                <div className="text-[8px] font-black uppercase text-red-400/90 tracking-wider bg-red-500/5 py-1 px-2 rounded border border-red-500/10 inline-block">
                                                    ⚠️ Data estipulada de retorno ao pátio: {dataRetornoFormatada}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-left sm:text-right flex flex-col justify-between shrink-0 pl-2 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.03]">
                                            <div>
                                                <p className="text-[9px] font-mono font-bold text-orange-500/80">
                                                    {new Date(item.data_application || item.data_aplicacao).toLocaleDateString('pt-BR')}
                                                </p>
                                                <p className="text-[7px] text-slate-600 uppercase font-black tracking-widest mt-0.5">Data Lançamento</p>
                                            </div>
                                            <p className="text-[7px] font-mono text-slate-600 mt-2 sm:mt-0">Por: {item.criado_by || item.criado_por}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}