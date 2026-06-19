"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Veiculo {
    id: string;
    tem_placa: boolean;
    placa: string | null;
    chassis: string | null;
    fabricante: string;
    modelo: string;
    ano: number;
    km_litro: number | null;
    km_atual: number | null;
    foto_url: string | null;
    data_cadastro: string;
}

export default function ListaVeiculosPage() {
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, emplacados, maquinario

    // Estados de Modais
    const [veiculoParaEditar, setVeiculoParaEdit] = useState<Veiculo | null>(null);
    const [veiculoParaDeletar, setVeiculoParaDeletar] = useState<Veiculo | null>(null);
    const [codigoConfirmacao, setCodigoConfirmacao] = useState('');
    const [salvando, setSalva] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarFrota() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('veiculos')
                .select('*')
                .order('fabricante', { ascending: true });

            if (error) throw error;
            if (data) setVeiculos(data as Veiculo[]);
        } catch (err) {
            console.error("Erro ao consultar frota de veículos:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarFrota();
    }, []);

    // Atualização de dados (Salvar Edição)
    const handleAtualizarVeiculo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!veiculoParaEditar) return;

        setSalva(true);
        try {
            const { error } = await supabase
                .from('veiculos')
                .update({
                    fabricante: veiculoParaEditar.fabricante.trim(),
                    modelo: veiculoParaEditar.modelo.trim(),
                    ano: Number(veiculoParaEditar.ano),
                    km_litro: veiculoParaEditar.km_litro ? Number(veiculoParaEditar.km_litro) : null,
                    km_atual: veiculoParaEditar.km_atual ? Number(veiculoParaEditar.km_atual) : null,
                    placa: veiculoParaEditar.placa ? veiculoParaEditar.placa.trim().toUpperCase() : null,
                    chassis: veiculoParaEditar.chassis ? veiculoParaEditar.chassis.trim().toUpperCase() : null,
                })
                .eq('id', veiculoParaEditar.id);

            if (error) throw error;

            setVeiculos(prev => prev.map(v => v.id === veiculoParaEditar.id ? veiculoParaEditar : v));
            setVeiculoParaEdit(null);
        } catch (err) {
            console.error("Erro ao atualizar veículo:", err);
            alert("Erro ao salvar as modificações no banco.");
        } finally {
            setSalva(false);
        }
    };

    // Rotina Destrutiva Segura (Apagar Ativo)
    const handleConfirmarExclusao = async () => {
        if (!veiculoParaDeletar || codigoConfirmacao !== '123456') return;

        setSalva(true);
        try {
            const { error } = await supabase
                .from('veiculos')
                .delete()
                .eq('id', veiculoParaDeletar.id);

            if (error) throw error;

            setVeiculos(prev => prev.filter(v => v.id !== veiculoParaDeletar.id));
            setVeiculoParaDeletar(null);
            setCodigoConfirmacao('');
        } catch (err) {
            console.error("Erro ao remover veículo:", err);
            alert("Erro ao excluir veículo do Supabase.");
        } finally {
            setSalva(false);
        }
    };

    const frotaFiltrada = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        return veiculos.filter(v => {
            const batePesquisa =
                v.modelo.toLowerCase().includes(termo) ||
                v.fabricante.toLowerCase().includes(termo) ||
                (v.placa && v.placa.toLowerCase().includes(termo));

            const bateTipo =
                filtroTipo === 'todos' ||
                (filtroTipo === 'emplacados' && v.tem_placa) ||
                (filtroTipo === 'maquinario' && !v.tem_placa);

            return batePesquisa && bateTipo;
        });
    }, [veiculos, pesquisa, filtroTipo]);

    return (
        <main className="relative min-h-screen bg-[#11141a] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* GRID BACKGROUND EFFECT */}
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
                            Controle e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ativos de Frota</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">
                            Monitoramento de rodagem, consumo médio e especificações técnicas
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar por placa, modelo ou fabricante..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-black border border-white/[0.06] focus:border-blue-500/40 px-4 py-2.5 rounded-xl text-white text-xs font-bold outline-none w-full sm:w-72 uppercase transition-all placeholder-slate-700"
                        />

                        <div className="flex items-center bg-black border border-white/[0.06] p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setFiltroTipo('todos')}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                    filtroTipo === 'todos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFiltroTipo('emplacados')}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                    filtroTipo === 'emplacados' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Rodoviários
                            </button>
                            <button
                                onClick={() => setFiltroTipo('maquinario')}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                    filtroTipo === 'maquinario' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Maquinários
                            </button>
                        </div>
                    </div>
                </header>

                {/* GRID DE CARDS DOS VEÍCULOS */}
                {carregando ? (
                    <div className="text-center py-36 text-[10px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse">
                        Sincronizando garagem corporativa...
                    </div>
                ) : frotaFiltrada.length === 0 ? (
                    <div className="py-36 text-center bg-[#1a1f29]/40 rounded-[32px] border border-white/[0.03]">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nenhum veículo localizado com os filtros aplicados.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                        {frotaFiltrada.map(v => (
                            <div
                                key={v.id}
                                className="bg-[#1a1f29] border border-white/[0.05] rounded-[28px] overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                            >
                                {/* ÁREA DA IMAGEM / PREVIEW */}
                                <div className="h-44 w-full bg-[#151922] relative flex items-center justify-center border-b border-white/[0.03]">
                                    {v.foto_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={v.foto_url}
                                            alt={v.modelo}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center space-y-2">
                                            <span className="text-4xl block opacity-40">🚚</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Sem Mídia Cadastrada</span>
                                        </div>
                                    )}

                                    {/* CONTROLES RÁPIDOS NO CARD (EDITAR E APAGAR) */}
                                    <div className="absolute top-4 left-4 flex gap-1.5 select-none">
                                        <button
                                            onClick={() => setVeiculoParaEdit(v)}
                                            className="bg-black/70 hover:bg-blue-600 border border-white/[0.08] text-white p-1.5 rounded-lg text-[10px] transition-colors"
                                            title="Editar Especificações"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => setVeiculoParaDeletar(v)}
                                            className="bg-black/70 hover:bg-red-600 border border-white/[0.08] text-white p-1.5 rounded-lg text-[10px] transition-colors"
                                            title="Remover Ativo"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {/* TAG DE PLACA FLUTUANTE */}
                                    <div className="absolute top-4 right-4">
                                        {v.tem_placa && v.placa ? (
                                            <div className="bg-white text-black border border-blue-900 rounded-md px-2.5 py-1 text-[10px] font-mono font-black tracking-widest shadow-md uppercase">
                                                {v.placa}
                                            </div>
                                        ) : (
                                            <div className="bg-indigo-950/90 text-indigo-400 border border-indigo-500/30 rounded-md px-2.5 py-1 text-[8px] font-black tracking-widest shadow-md uppercase">
                                                ⚙️ Maquinário
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CORPO DAS ESPECIFICAÇÕES */}
                                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                                    <div>
                                        <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest block">
                                            {v.fabricante}
                                        </span>
                                        <h2 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">
                                            {v.modelo}
                                        </h2>
                                        {v.chassis && (
                                            <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">
                                                Chassis: {v.chassis}
                                            </p>
                                        )}
                                    </div>

                                    {/* TABELA DE MÉTRICAS OPERACIONAIS */}
                                    <div className="grid grid-cols-3 gap-2 border-t border-white/[0.04] pt-4 text-center">
                                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.02]">
                                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Ano</p>
                                            <p className="text-xs font-mono font-black text-slate-200 mt-0.5">{v.ano}</p>
                                        </div>
                                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.02]">
                                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Média</p>
                                            <p className="text-xs font-mono font-black text-slate-200 mt-0.5">
                                                {v.km_litro ? `${v.km_litro} km/l` : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.02]">
                                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Odômetro</p>
                                            <p className="text-xs font-mono font-black text-slate-200 mt-0.5">
                                                {v.km_atual ? `${v.km_atual.toLocaleString('pt-BR')} km` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL I: EDIÇÃO DE ESPECIFICAÇÕES DO ATIVO */}
            {veiculoParaEditar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleAtualizarVeiculo}
                        className="bg-[#1a1f29] border border-white/[0.08] p-6 rounded-[28px] max-w-md w-full space-y-4 shadow-2xl"
                    >
                        <div className="border-b border-white/[0.04] pb-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Editar Veículo</h3>
                            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">ID Interno: {veiculoParaEditar.id}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Fabricante</label>
                                <input
                                    type="text"
                                    value={veiculoParaEditar.fabricante}
                                    onChange={e => setVeiculoParaEdit({...veiculoParaEditar, fabricante: e.target.value})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Modelo</label>
                                <input
                                    type="text"
                                    value={veiculoParaEditar.modelo}
                                    onChange={e => setVeiculoParaEdit({...veiculoParaEditar, modelo: e.target.value})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Ano</label>
                                <input
                                    type="number"
                                    value={veiculoParaEditar.ano}
                                    onChange={e => setVeiculoParaEdit({...veiculoParaEditar, ano: Number(e.target.value)})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Km/L</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={veiculoParaEditar.km_litro || ''}
                                    onChange={e => setVeiculoParaEdit({...veiculoParaEditar, km_litro: e.target.value ? Number(e.target.value) : null})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Odômetro</label>
                                <input
                                    type="number"
                                    value={veiculoParaEditar.km_atual || ''}
                                    onChange={e => setVeiculoParaEdit({...veiculoParaEditar, km_atual: e.target.value ? Number(e.target.value) : null})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Placa</label>
                                <input
                                    type="text"
                                    value={veiculoParaEditar.placa || ''}
                                    onChange={e => setVeiculoParaEdit({...veiculoParaEditar, placa: e.target.value || null})}
                                    disabled={!veiculoParaEditar.tem_placa}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white uppercase outline-none disabled:opacity-30"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Chassis</label>
                                <input
                                    type="text"
                                    value={veiculoParaEditar.chassis || ''}
                                    onChange={e => setVeiculoParaEdit({...veiculoParaEditar, chassis: e.target.value || null})}
                                    className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white uppercase outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2.5 pt-2 border-t border-white/[0.04]">
                            <button
                                type="button"
                                onClick={() => setVeiculoParaEdit(null)}
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

            {/* MODAL II: EXCLUSÃO PROTEGIDA COM SENHA MECÂNICA DE CHAVE (1 a 6) */}
            {veiculoParaDeletar && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#151922] border border-red-500/20 p-6 rounded-[28px] max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="text-center space-y-1">
                            <span className="text-2xl block select-none">⚠️</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Remover de Forma Definitiva?</h3>
                            <p className="text-[11px] text-slate-400 leading-normal font-medium">
                                Você está prestes a deletar o ativo <strong className="text-white font-black">{veiculoParaDeletar.fabricante} {veiculoParaDeletar.modelo}</strong> do catálogo de frotas.
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
                                    setVeiculoParaDeletar(null);
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
                <div className="font-mono text-slate-600">Fleet Control Unit v1.0</div>
            </footer>
        </main>
    );
}