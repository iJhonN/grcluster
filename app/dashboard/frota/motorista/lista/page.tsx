"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Motorista {
    id: string;
    nome_completo: string;
    cpf: string;
    categoria_cnh: string;
    vencimento_cnh: string;
    data_nascimento: string | null;
    contato: string;
    cidade: string;
    data_cadastro: string;
}

export default function ListaMotoristasPage() {
    const [motoristas, setMotoristas] = useState<Motorista[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [filtroCidade, setFiltroCidade] = useState('TODAS');

    // Estados de Modais e Controle Interno
    const [motoristaParaEditar, setMotoristaParaEditar] = useState<Motorista | null>(null);
    const [motoristaParaDeletar, setMotoristaParaDeletar] = useState<Motorista | null>(null);
    const [codigoConfirmacao, setCodigoConfirmacao] = useState('');
    const [salvando, setSalvando] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const cidadesOperacao = [
        "PILAR", "ARAPIRACA", "MACEIÓ", "TAQUARANA", "FEIRA GRANDE",
        "LIMOEIRO", "BANANEIRA", "JUNQUEIRO", "COITÉ", "SÃO MIGUEL",
        "LAGOA DA CANOA"
    ];

    async function carregarMotoristas() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('motoristas')
                .select('*')
                .order('nome_completo', { ascending: true });

            if (error) throw error;
            if (data) setMotoristas(data as Motorista[]);
        } catch (err) {
            console.error("Erro ao consultar motoristas:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarMotoristas();
    }, []);

    // Atualização de registro (Salvar Edição)
    const handleAtualizarMotorista = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!motoristaParaEditar) return;

        setSalvando(true);
        try {
            const { error } = await supabase
                .from('motoristas')
                .update({
                    nome_completo: motoristaParaEditar.nome_completo.trim(),
                    cpf: motoristaParaEditar.cpf.trim(),
                    categoria_cnh: motoristaParaEditar.categoria_cnh.trim().toUpperCase(),
                    vencimento_cnh: motoristaParaEditar.vencimento_cnh,
                    contato: motoristaParaEditar.contato.trim(),
                    cidade: motoristaParaEditar.cidade.trim().toUpperCase(),
                    data_nascimento: motoristaParaEditar.data_nascimento || null
                })
                .eq('id', motoristaParaEditar.id);

            if (error) throw error;

            setMotoristas(prev => prev.map(m => m.id === motoristaParaEditar.id ? motoristaParaEditar : m));
            setMotoristaParaEditar(null);
        } catch (err) {
            console.error("Erro ao atualizar motorista:", err);
            alert("Erro ao gravar as alterações no banco de dados.");
        } finally {
            setSalvando(false);
        }
    };

    // Rotina destrutiva segura com código numérico
    const handleConfirmarExclusao = async () => {
        if (!motoristaParaDeletar || codigoConfirmacao !== '123456') return;

        setSalvando(true);
        try {
            const { error } = await supabase
                .from('motoristas')
                .delete()
                .eq('id', motoristaParaDeletar.id);

            if (error) throw error;

            setMotoristas(prev => prev.filter(m => m.id !== motoristaParaDeletar.id));
            setMotoristaParaDeletar(null);
            setCodigoConfirmacao('');
        } catch (err) {
            console.error("Erro ao remover motorista:", err);
            alert("Falha ao deletar o motorista parceiro.");
        } finally {
            setSalvando(false);
        }
    };

    const motoristasFiltrados = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        return motoristas.filter(m => {
            const bateTexto =
                m.nome_completo.toLowerCase().includes(termo) ||
                m.cpf.includes(termo) ||
                m.cidade.toLowerCase().includes(termo);

            const bateCidade = filtroCidade === 'TODAS' || m.cidade === filtroCidade;

            return bateTexto && bateCidade;
        });
    }, [motoristas, pesquisa, filtroCidade]);

    const analiseCnh = useMemo(() => {
        const hoje = new Date();
        const total = motoristas.length;
        const vencidas = motoristas.filter(m => {
            const dataVencimento = new Date(m.vencimento_cnh);
            return dataVencimento < hoje;
        }).length;

        return { total, vencidas, regulares: total - vencidas };
    }, [motoristas]);

    return (
        <main className="relative min-h-screen bg-[#11141a] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.01]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
                        backgroundSize: '45px 45px',
                    }}
                />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-8 max-w-[1400px] mx-auto">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/[0.05] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/frota" className="text-blue-400 font-bold text-[10px] uppercase tracking-[3px] mb-1.5 block hover:opacity-80 transition-all">
                            ← Menu de Frotas
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none">
                            Cadastro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Motoristas Parceiros</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">
                            Controle de habilitações, contatos e distribuição regional da oficina
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar por nome, CPF ou cidade..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-black border border-white/[0.06] focus:border-blue-500/40 px-4 py-2.5 rounded-xl text-white text-xs font-bold outline-none w-full sm:w-64 uppercase transition-all placeholder-slate-700"
                        />

                        <select
                            value={filtroCidade}
                            onChange={(e) => setFiltroCidade(e.target.value)}
                            className="bg-black border border-white/[0.06] focus:border-blue-500/40 px-4 py-2.5 rounded-xl text-slate-300 text-xs font-bold uppercase cursor-pointer outline-none transition-all"
                        >
                            <option value="TODAS">📍 Todas as Cidades</option>
                            {cidadesOperacao.map((cid, cIdx) => (
                                <option key={cIdx} value={cid} className="bg-[#1a1f29]">{cid}</option>
                            ))}
                        </select>
                    </div>
                </header>

                {/* PLACAR DE AUDITORIA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
                    <div className="bg-[#1a1f29]/60 border border-white/[0.04] p-5 rounded-2xl text-center">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Motoristas Ativos</p>
                        <p className="text-2xl font-mono font-black mt-1 text-slate-300">{analiseCnh.total}</p>
                    </div>
                    <div className="bg-[#1a1f29]/60 border border-white/[0.04] p-5 rounded-2xl text-center">
                        <p className="text-[9px] font-black uppercase tracking-wider text-emerald-500">Habilitações Regulares</p>
                        <p className="text-2xl font-mono font-black mt-1 text-emerald-400">{analiseCnh.regulares}</p>
                    </div>
                    <div className="bg-[#1a1f29]/60 border border-white/[0.04] p-5 rounded-2xl text-center">
                        <p className="text-[9px] font-black uppercase tracking-wider text-red-500">CNH Vencida / Alerta</p>
                        <p className="text-2xl font-mono font-black mt-1 text-red-400">{analiseCnh.vencidas}</p>
                    </div>
                </div>

                {/* LISTAGEM PRINCIPAL */}
                <div className="relative bg-[#1a1f29]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl mx-2 min-h-[400px]">
                    <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                    {carregando ? (
                        <div className="text-center py-32 text-[10px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse">
                            Buscando registros de condutores...
                        </div>
                    ) : motoristasFiltrados.length === 0 ? (
                        <div className="py-32 text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nenhum motorista localizado com os filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-white/[0.04] text-slate-500 uppercase tracking-wider text-[8px] font-black pb-3">
                                    <th className="pb-3 pl-4">Ações</th>
                                    <th className="pb-3">Condutor / Base</th>
                                    <th className="pb-3">Inscrição CPF</th>
                                    <th className="pb-3 text-center">Categoria</th>
                                    <th className="pb-3 text-center">Vencimento CNH</th>
                                    <th className="pb-3 text-right pr-4">Linha de Contato</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.01]">
                                {motoristasFiltrados.map(m => {
                                    const cnhVencida = new Date(m.vencimento_cnh) < new Date();
                                    return (
                                        <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                                            {/* COLUNA DE CONTROLES OPERACIONAIS */}
                                            <td className="py-4Doc pl-4 select-none w-20">
                                                <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setMotoristaParaEditar(m)}
                                                        className="bg-black/40 hover:bg-blue-600 border border-white/[0.08] text-white p-1 rounded-md text-[10px] transition-colors"
                                                        title="Editar Cadastro"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => setMotoristaParaDeletar(m)}
                                                        className="bg-black/40 hover:bg-red-600 border border-white/[0.08] text-white p-1 rounded-md text-[10px] transition-colors"
                                                        title="Excluir Condutor"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="py-4">
                                                <p className="font-black text-slate-200 uppercase tracking-tight text-xs">
                                                    {m.nome_completo}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-slate-800 text-slate-400 border border-white/[0.04] rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide">
                                                        📍 {m.cidade || 'Não Informada'}
                                                    </span>
                                                    {m.data_nascimento && (
                                                        <span className="text-[8px] font-mono text-slate-500">
                                                            Nasc: {new Date(m.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 font-mono text-slate-400 text-xs">
                                                {m.cpf}
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono font-black px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                                    {m.categoria_cnh}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center font-mono text-xs">
                                                <p className={cnhVencida ? "text-red-400 font-bold" : "text-slate-300"}>
                                                    {new Date(m.vencimento_cnh + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                </p>
                                                {cnhVencida && (
                                                    <span className="text-[7px] text-red-500 uppercase font-black tracking-widest block">Regularizar</span>
                                                )}
                                            </td>
                                            <td className="py-4 text-right pr-4 font-mono text-xs font-bold text-slate-300">
                                                {m.contato}
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

            {/* MODAL I: EDIÇÃO DE MOTORISTA */}
            {motoristaParaEditar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleAtualizarMotorista}
                        className="bg-[#1a1f29] border border-white/[0.08] p-6 rounded-[28px] max-w-md w-full space-y-4 shadow-2xl"
                    >
                        <div className="border-b border-white/[0.04] pb-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Editar Motorista</h3>
                            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Código Condutor: {motoristaParaEditar.id}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Nome Completo</label>
                            <input
                                type="text"
                                value={motoristaParaEditar.nome_completo}
                                onChange={e => setMotoristaParaEditar({...motoristaParaEditar, nome_completo: e.target.value})}
                                className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none uppercase"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">CPF</label>
                                <input
                                    type="text"
                                    value={motoristaParaEditar.cpf}
                                    onChange={e => setMotoristaParaEditar({...motoristaParaEditar, cpf: e.target.value})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Contato</label>
                                <input
                                    type="text"
                                    value={motoristaParaEditar.contato}
                                    onChange={e => setMotoristaParaEditar({...motoristaParaEditar, contato: e.target.value})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">CNH Cat.</label>
                                <input
                                    type="text"
                                    value={motoristaParaEditar.categoria_cnh}
                                    onChange={e => setMotoristaParaEditar({...motoristaParaEditar, categoria_cnh: e.target.value})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-black text-center text-white outline-none uppercase"
                                    maxLength={3}
                                    required
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Vencimento CNH</label>
                                <input
                                    type="date"
                                    value={motoristaParaEditar.vencimento_cnh}
                                    onChange={e => setMotoristaParaEditar({...motoristaParaEditar, vencimento_cnh: e.target.value})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Base / Cidade</label>
                                <select
                                    value={motoristaParaEditar.cidade}
                                    onChange={e => setMotoristaParaEditar({...motoristaParaEditar, cidade: e.target.value})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none uppercase cursor-pointer"
                                >
                                    {cidadesOperacao.map((cid, idx) => (
                                        <option key={idx} value={cid}>{cid}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Nascimento</label>
                                <input
                                    type="date"
                                    value={motoristaParaEditar.data_nascimento || ''}
                                    onChange={e => setMotoristaParaEditar({...motoristaParaEditar, data_nascimento: e.target.value || null})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2.5 pt-2 border-t border-white/[0.04] select-none">
                            <button
                                type="button"
                                onClick={() => setMotoristaParaEditar(null)}
                                className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={salvando}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {salvando ? 'Gravando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL II: EXCLUSÃO PROTEGIDA (1 a 6) */}
            {motoristaParaDeletar && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#151922] border border-red-500/20 p-6 rounded-[28px] max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="text-center space-y-1">
                            <span className="text-2xl block select-none">⚠️</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Remover Condutor?</h3>
                            <p className="text-[11px] text-slate-400 leading-normal font-medium">
                                Você está removendo em definitivo <strong className="text-white font-black">{motoristaParaDeletar.nome_completo}</strong> do cadastro do pátio.
                            </p>
                        </div>

                        <div className="space-y-1.5 bg-black/40 border border-white/[0.03] p-3.5 rounded-xl">
                            <label className="text-[9px] font-black uppercase text-red-400 tracking-wider block text-center">
                                Para confirmar, digite de 1 até 6:
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="Digite 123456..."
                                value={codigoConfirmacao}
                                onChange={e => setCodigoConfirmacao(e.target.value)}
                                className="w-full bg-black border border-white/[0.08] focus:border-red-500 px-3 py-2 rounded-lg text-sm font-mono font-black text-center text-white outline-none tracking-[6px]"
                            />
                        </div>

                        <div className="flex gap-2.5 select-none">
                            <button
                                type="button"
                                onClick={() => {
                                    setMotoristaParaDeletar(null);
                                    setCodigoConfirmacao('');
                                }}
                                className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Abortar
                            </button>
                            <button
                                type="button"
                                disabled={codigoConfirmacao !== '123456' || salvando}
                                onClick={handleConfirmarExclusao}
                                className="flex-1 bg-red-600 disabled:bg-red-950/20 hover:bg-red-700 disabled:text-red-400/40 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {salvando ? 'Removendo...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RODAPÉ */}
            <footer className="w-full border-t border-white/[0.02] pt-6 mt-10 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-500 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças &amp; Distribuição</div>
                <div className="font-mono text-slate-600">Fleet Control Unit v1.2</div>
            </footer>
        </main>
    );
}