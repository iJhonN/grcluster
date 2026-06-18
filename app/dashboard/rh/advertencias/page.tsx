"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

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
    motivo: string;
    data_aplicacao: string;
    dias_suspensao: number;
    criado_por: string;
}

export default function AdvertenciasPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [registros, setRegistros] = useState<RegistroDisciplinar[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [operador, setOperador] = useState('');

    // Estados do Formulário
    const [idFuncionario, setIdFuncionario] = useState('');
    const [tipoMedida, setTipoMedida] = useState<'AVISO' | 'ADVERTENCIA' | 'SUSPENSAO'>('AVISO');
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
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { router.push('/'); return; }

                const { data: perfil } = await supabase
                    .from('usuarios_painel')
                    .select('nome')
                    .eq('id', user.id)
                    .maybeSingle();

                setOperador(perfil?.nome || 'Gestor');

                const { data: listaFunc } = await supabase
                    .from('funcionarios')
                    .select('id, nome, sobrenome, cargo')
                    .order('nome', { ascending: true });

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
        if (!idFuncionario || !motivo.trim()) return alert("Preencha todos os campos obrigatórios.");

        setSalvando(true);
        try {
            const funcSelecionado = funcionarios.find(f => f.id === Number(idFuncionario));
            if (!funcSelecionado) throw new Error("Funcionário não encontrado");

            const novaMedida = {
                funcionario_id: funcSelecionado.id,
                nome_funcionario: `${funcSelecionado.nome} ${funcSelecionado.sobrenome}`,
                cargo_funcionario: funcSelecionado.cargo,
                tipo: tipoMedida,
                motivo: motivo.trim(),
                data_aplicacao: dataAplicacao,
                dias_suspensao: tipoMedida === 'SUSPENSAO' ? Number(diasSuspensao) : 0,
                criado_por: operador
            };

            const { data, error } = await supabase
                .from('rh_advertencias')
                .insert([novaMedida])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                setRegistros([data[0] as RegistroDisciplinar, ...registros]);
            }

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
            <main className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center text-[#86868b] gap-2 font-sans antialiased">
                <div className="w-5 h-5 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Buscando Arquivos...</span>
            </main>
        );
    }

    const registrosFiltrados = registros.filter(r => filtroTipo === 'TODOS' || r.tipo === filtroTipo);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col justify-between w-full selection:bg-[#007aff]/10">
            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">

                {/* HEADER */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard/rh" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#007aff] transition-colors block">
                            ← Dashboard de RH
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Histórico Disciplinar Interno
                        </h1>
                        <p className="text-[10px] text-[#86868b] font-medium uppercase tracking-wide">
                            Emissão, Registro Jurídico e Controle de Avisos, Advertências e Suspensões de Pátio
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">

                    {/* FORMULÁRIO */}
                    <section className="bg-white border border-[#e5e5ea] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                        <div className="border-b border-[#f5f5f7] pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868b]">Aplicar Nova Medida</h2>
                            <p className="text-[9px] font-mono font-bold text-[#b4b4b9] uppercase mt-0.5">Registro Permanente e Auditado</p>
                        </div>

                        <form onSubmit={handleSalvarMedida} className="space-y-4">

                            {/* SELECIONAR FUNCIONÁRIO */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Colaborador Afetado *</label>
                                <div className="relative">
                                    <select
                                        value={idFuncionario}
                                        onChange={(e) => setIdFuncionario(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase cursor-pointer appearance-none transition-colors"
                                        required
                                    >
                                        <option value="" className="text-[#b4b4b9]">-- Selecione o Funcionário --</option>
                                        {funcionarios.map(f => (
                                            <option key={f.id} value={f.id}>[{f.id}] {f.nome} {f.sobrenome} ({f.cargo})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* SELECIONAR TIPO */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Tipo de Infração *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['AVISO', 'ADVERTENCIA', 'SUSPENSAO'] as const).map(tipo => (
                                        <button
                                            key={tipo}
                                            type="button"
                                            onClick={() => setTipoMedida(tipo)}
                                            className={`py-2 text-[9px] font-bold uppercase rounded-lg border transition-colors ${
                                                tipoMedida === tipo
                                                    ? 'bg-[#007aff]/5 border-[#007aff]/30 text-[#007aff]'
                                                    : 'bg-[#f5f5f7] border-[#e5e5ea] text-[#86868b] hover:border-[#b4b4b9]'
                                            }`}
                                        >
                                            {tipo === 'ADVERTENCIA' ? 'Advertência' : tipo === 'SUSPENSAO' ? 'Suspensão' : 'Aviso'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* DIAS DE SUSPENSÃO */}
                            {tipoMedida === 'SUSPENSAO' && (
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Tempo de Afastamento (Dias) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={diasSuspensao}
                                        onChange={(e) => setDiasSuspensao(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold transition-colors text-center"
                                        required
                                    />
                                </div>
                            )}

                            {/* DATA DA OCORRÊNCIA */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Data de Aplicação *</label>
                                <input
                                    type="date"
                                    value={dataAplicacao}
                                    onChange={(e) => setDataAplicacao(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-semibold transition-colors"
                                    required
                                />
                            </div>

                            {/* MOTIVO ESCRITO DETALHADO */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Descrição Detalhada do Motivo *</label>
                                <textarea
                                    rows={4}
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    placeholder="Descreva explicitamente o ocorrido (ex: Descumprimento de EPI, falta injustificada...)"
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-medium transition-colors placeholder-[#b4b4b9] resize-none"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                >
                                    {salvando ? 'Salvando Registro...' : 'Protocolar Medida Disciplinar'}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* HISTÓRICO GLOBAL E FILTROS */}
                    <section className="lg:col-span-2 bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4 flex flex-col h-[600px]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f5f5f7] pb-3 shrink-0">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868b]">Histórico de Ocorrências</h2>
                                <p className="text-[9px] font-mono font-bold text-[#b4b4b9] uppercase mt-0.5">Registros Armazenados em Nuvem</p>
                            </div>

                            {/* FILTROS RÁPIDOS */}
                            <div className="flex items-center bg-[#f5f5f7] border border-[#e5e5ea] p-1 rounded-xl gap-0.5 select-none">
                                {['TODOS', 'AVISO', 'ADVERTENCIA', 'SUSPENSAO'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFiltroTipo(t)}
                                        className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wide transition-colors ${
                                            filtroTipo === t
                                                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#e5e5ea]'
                                                : 'text-[#86868b] hover:text-[#1d1d1f]'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* LISTAGEM EM TIMELINE SCROLL */}
                        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
                            {registrosFiltrados.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-[#e5e5ea] rounded-xl flex items-center justify-center h-full">
                                    <p className="text-[9px] text-[#86868b] uppercase tracking-wider font-bold">Nenhuma ocorrência encontrada para este filtro</p>
                                </div>
                            ) : (
                                registrosFiltrados.map((item) => {
                                    const dataInicio = new Date(item.data_aplicacao + 'T00:00:00');
                                    if (item.dias_suspensao > 0) {
                                        dataInicio.setDate(dataInicio.getDate() + item.dias_suspensao);
                                    }
                                    const dataRetornoFormatada = dataInicio.toLocaleDateString('pt-BR');

                                    return (
                                        <div key={item.id} className="bg-white border border-[#e5e5ea] rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between transition-colors relative overflow-hidden group">

                                            {/* Indicador lateral sutil */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                                item.tipo === 'SUSPENSAO' ? 'bg-[#ff3b30]' : item.tipo === 'ADVERTENCIA' ? 'bg-[#ff9500]' : 'bg-[#007aff]'
                                            }`} />

                                            <div className="space-y-2 flex-1 pl-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[9px] font-bold text-[#1d1d1f] uppercase bg-[#f5f5f7] border border-[#e5e5ea] px-1.5 py-0.5 rounded tracking-wide">
                                                        {item.nome_funcionario}
                                                    </span>
                                                    <span className="text-[9px] font-mono font-bold text-[#86868b] uppercase">
                                                        [{item.cargo_funcionario}]
                                                    </span>
                                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                                        item.tipo === 'SUSPENSAO'
                                                            ? 'bg-[#ff3b30]/5 border-[#ff3b30]/10 text-[#ff3b30]'
                                                            : item.tipo === 'ADVERTENCIA'
                                                                ? 'bg-[#ff9500]/5 border-[#ff9500]/10 text-[#ff9500]'
                                                                : 'bg-[#007aff]/5 border-[#007aff]/10 text-[#007aff]'
                                                    }`}>
                                                        {item.tipo} {item.dias_suspensao > 0 && `(${item.dias_suspensao}d)`}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-[#86868b] font-medium leading-relaxed">{item.motivo}</p>

                                                {item.tipo === 'SUSPENSAO' && (
                                                    <div className="text-[9px] font-bold uppercase text-[#ff3b30] tracking-wide bg-[#ff3b30]/5 py-0.5 px-2 rounded border border-[#ff3b30]/10 inline-block">
                                                        ⚠️ Retorno estipulado ao pátio: {dataRetornoFormatada}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-left sm:text-right flex flex-col justify-between shrink-0 pl-2 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f5f5f7]">
                                                <div>
                                                    <p className="text-[10px] font-mono font-bold text-[#1d1d1f]">
                                                        {new Date(item.data_aplicacao + 'T00:00:00').toLocaleDateString('pt-BR')}
                                                    </p>
                                                    <p className="text-[7px] text-[#86868b] uppercase font-bold tracking-wider mt-0.5">Data Ocorrência</p>
                                                </div>
                                                <p className="text-[8px] font-mono text-[#b4b4b9] font-bold mt-2 sm:mt-0">Por: {item.criado_por}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* RODAPÉ */}
            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo Core Security v3.0</div>
            </footer>
        </main>
    );
}