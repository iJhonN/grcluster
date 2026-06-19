"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Abastecimento {
    id: string;
    litragem: number;
    km_abastecimento: number;
    valor_total: number;
    posto_combustivel: string;
    data_hora: string;
    veiculos: { fabricante: string; modelo: string; placa: string | null; tem_placa: boolean } | null;
}

export default function ListaAbastecimentosPage() {
    const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');

    // Estados de Modais e Controle Operacional
    const [cupomParaEditar, setCupomParaEditar] = useState<Abastecimento | null>(null);
    const [cupomParaDeletar, setCupomParaDeletar] = useState<Abastecimento | null>(null);
    const [codigoConfirmacao, setCodigoConfirmacao] = useState('');
    const [salvando, setSalvando] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarHistorico() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('abastecimentos')
                .select(`
                    id, litragem, km_abastecimento, valor_total, posto_combustivel, data_hora,
                    veiculos(fabricante, modelo, placa, tem_placa)
                `)
                .order('data_hora', { ascending: false });

            if (error) throw error;
            if (data) setAbastecimentos(data as unknown as Abastecimento[]);
        } catch (err) {
            console.error("Erro ao buscar histórico de abastecimentos:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarHistorico();
    }, []);

    // Atualização de registro (Salvar Edição do Cupom)
    const handleAtualizarAbastecimento = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cupomParaEditar) return;

        setSalvando(true);
        try {
            const { error } = await supabase
                .from('abastecimentos')
                .update({
                    litragem: Number(cupomParaEditar.litragem),
                    km_abastecimento: Number(cupomParaEditar.km_abastecimento),
                    valor_total: Number(cupomParaEditar.valor_total),
                    posto_combustivel: cupomParaEditar.posto_combustivel.trim().toUpperCase(),
                    data_hora: cupomParaEditar.data_hora
                })
                .eq('id', cupomParaEditar.id);

            if (error) throw error;

            setAbastecimentos(prev => prev.map(a => a.id === cupomParaEditar.id ? cupomParaEditar : a));
            setCupomParaEditar(null);
        } catch (err) {
            console.error("Erro ao atualizar abastecimento:", err);
            alert("Erro ao salvar alterações do cupom no banco.");
        } finally {
            setSalvando(false);
        }
    };

    // Rotina destrutiva segura com código numérico
    const handleConfirmarExclusao = async () => {
        if (!cupomParaDeletar || codigoConfirmacao !== '123456') return;

        setSalvando(true);
        try {
            const { error } = await supabase
                .from('abastecimentos')
                .delete()
                .eq('id', cupomParaDeletar.id);

            if (error) throw error;

            setAbastecimentos(prev => prev.filter(a => a.id !== cupomParaDeletar.id));
            setCupomParaDeletar(null);
            setCodigoConfirmacao('');
        } catch (err) {
            console.error("Erro ao remover abastecimento:", err);
            alert("Falha ao deletar o registro de combustível.");
        } finally {
            setSalvando(false);
        }
    };

    // Filtro dinâmico em memória
    const abastecimentosFiltrados = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        return abastecimentos.filter(a => {
            const nomeVeiculo = a.veiculos ? `${a.veiculos.fabricante} ${a.veiculos.modelo}`.toLowerCase() : '';
            const placaVeiculo = a.veiculos?.placa ? a.veiculos.placa.toLowerCase() : '';
            const posto = a.posto_combustivel.toLowerCase();

            return nomeVeiculo.includes(termo) || placaVeiculo.includes(termo) || posto.includes(termo);
        });
    }, [abastecimentos, pesquisa]);

    return (
        <main className="relative min-h-screen bg-[#11141a] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`, backgroundSize: '45px 45px' }} />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-8 max-w-[1400px] mx-auto">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/[0.05] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/frota/combustivel" className="text-blue-400 font-bold text-[10px] uppercase tracking-[3px] mb-1.5 block hover:opacity-80 transition-all">
                            ← Hub de Combustível
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none">
                            Histórico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Abastecimentos</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">
                            Auditoria de notas fiscais, postos credenciados e evolução de odômetros
                        </p>
                    </div>

                    <div className="w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar por veículo, placa ou posto..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-black border border-white/[0.06] focus:border-blue-500/40 px-4 py-2.5 rounded-xl text-white text-xs font-bold outline-none w-full sm:w-72 uppercase transition-all placeholder-slate-700"
                        />
                    </div>
                </header>

                {/* TABELA DE REGISTROS */}
                <div className="relative bg-[#1a1f29]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl mx-2 min-h-[400px]">
                    <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                    {carregando ? (
                        <div className="text-center py-32 text-[10px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse">
                            Buscando registros em bombas...
                        </div>
                    ) : abastecimentosFiltrados.length === 0 ? (
                        <div className="py-32 text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nenhum cupom de combustível localizado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-white/[0.04] text-slate-500 uppercase tracking-wider text-[8px] font-black pb-3">
                                    <th className="pb-3 pl-4 w-20">Ações</th>
                                    <th className="pb-3">Veículo / Equipamento</th>
                                    <th className="pb-3">Posto de Combustível</th>
                                    <th className="pb-3 text-center">Volume (Litros)</th>
                                    <th className="pb-3 text-center">Odômetro (KM)</th>
                                    <th className="pb-3 text-center">Preço por Litro</th>
                                    <th className="pb-3 text-right pr-4">Valor Total</th>
                                    <th className="pb-3 text-right pr-4">Data / Hora</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.01]">
                                {abastecimentosFiltrados.map(a => {
                                    const precoPorLitro = a.litragem > 0 ? a.valor_total / a.litragem : 0;
                                    return (
                                        <tr key={a.id} className="hover:bg-white/[0.01] transition-colors group">
                                            {/* COLUNA DE CONTROLES */}
                                            <td className="py-4 pl-4 select-none">
                                                <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setCupomParaEditar(a)}
                                                        className="bg-black/40 hover:bg-blue-600 border border-white/[0.08] text-white p-1 rounded-md text-[10px] transition-colors"
                                                        title="Editar Abastecimento"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => setCupomParaDeletar(a)}
                                                        className="bg-black/40 hover:bg-red-600 border border-white/[0.08] text-white p-1 rounded-md text-[10px] transition-colors"
                                                        title="Remover Cupom"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                            {/* DADOS VEÍCULO */}
                                            <td className="py-4">
                                                <p className="font-black text-slate-200 uppercase tracking-tight text-xs">
                                                    {a.veiculos ? `${a.veiculos.fabricante} ${a.veiculos.modelo}` : 'N/A'}
                                                </p>
                                                <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider block mt-0.5">
                                                    {a.veiculos?.tem_placa ? `Placa: ${a.veiculos.placa}` : '⚙️ Maquinário'}
                                                </span>
                                            </td>
                                            {/* POSTO */}
                                            <td className="py-4 font-bold text-slate-300 uppercase text-xs">
                                                {a.posto_combustivel}
                                            </td>
                                            {/* LITRAGEM */}
                                            <td className="py-4 text-center font-mono text-xs font-bold text-slate-200">
                                                {Number(a.litragem).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L
                                            </td>
                                            {/* KM DO ATO */}
                                            <td className="py-4 text-center font-mono text-xs font-bold text-slate-400">
                                                {Number(a.km_abastecimento).toLocaleString('pt-BR')} km
                                            </td>
                                            {/* MÉDIA PREÇO/LITRO */}
                                            <td className="py-4 text-center font-mono text-[11px] text-slate-500">
                                                R$ {precoPorLitro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            {/* VALOR PAGO */}
                                            <td className="py-4 text-right pr-4 font-mono text-xs font-black text-blue-400">
                                                R$ {Number(a.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            {/* DATA E HORA */}
                                            <td className="py-4 text-right pr-4 font-mono text-[10px] text-slate-500">
                                                {new Date(a.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

            {/* MODAL I: EDIÇÃO DE CUPOM DE COMBUSTÍVEL */}
            {cupomParaEditar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleAtualizarAbastecimento}
                        className="bg-[#1a1f29] border border-white/[0.08] p-6 rounded-[28px] max-w-md w-full space-y-4 shadow-2xl"
                    >
                        <div className="border-b border-white/[0.04] pb-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Editar Abastecimento</h3>
                            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Ativo: {cupomParaEditar.veiculos ? `${cupomParaEditar.veiculos.fabricante} ${cupomParaEditar.veiculos.modelo}` : 'N/A'}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Posto de Combustível</label>
                            <input
                                type="text"
                                value={cupomParaEditar.posto_combustivel}
                                onChange={e => setCupomParaEditar({...cupomParaEditar, posto_combustivel: e.target.value})}
                                className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none uppercase"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Volume (Litros)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={cupomParaEditar.litragem}
                                    onChange={e => setCupomParaEditar({...cupomParaEditar, litragem: Number(e.target.value)})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Valor Total (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={cupomParaEditar.valor_total}
                                    onChange={e => setCupomParaEditar({...cupomParaEditar, valor_total: Number(e.target.value)})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Odômetro (KM)</label>
                                <input
                                    type="number"
                                    value={cupomParaEditar.km_abastecimento}
                                    onChange={e => setCupomParaEditar({...cupomParaEditar, km_abastecimento: Number(e.target.value)})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Data / Hora</label>
                                <input
                                    type="datetime-local"
                                    value={cupomParaEditar.data_hora.substring(0, 16)}
                                    onChange={e => setCupomParaEditar({...cupomParaEditar, data_hora: e.target.value ? new Date(e.target.value).toISOString() : cupomParaEditar.data_hora})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-2.5 pt-2 border-t border-white/[0.04] select-none">
                            <button
                                type="button"
                                onClick={() => setCupomParaEditar(null)}
                                className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={salvando}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL II: EXCLUSÃO PROTEGIDA COM SENHA MECÂNICA (1 a 6) */}
            {cupomParaDeletar && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#151922] border border-red-500/20 p-6 rounded-[28px] max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="text-center space-y-1">
                            <span className="text-2xl block select-none">⚠️</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Remover Registro de Combustível?</h3>
                            <p className="text-[11px] text-slate-400 leading-normal font-medium">
                                Esta ação irá excluir definitivamente o abastecimento de <strong className="text-white font-black">{cupomParaDeletar.litragem} L</strong> no posto <strong className="text-white font-black">{cupomParaDeletar.posto_combustivel}</strong>.
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
                                    setCupomParaDeletar(null);
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
                <div className="font-mono text-slate-600">Fleet Fuel Intelligence v1.0</div>
            </footer>
        </main>
    );
}