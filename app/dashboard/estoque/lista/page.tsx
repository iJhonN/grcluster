"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface ItemEstoque {
    id: string;
    localizacao: string;
    referencia: string;
    quantidade: number;
    string_completa: string;
    status: 'AGUARDANDO' | 'CONCLUIDO';
    criado_em: string;
}

export default function ListaEstoquePage() {
    const [pecas, setPecas] = useState<ItemEstoque[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [busca, setBusca] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Função interna para buscar a carga inicial do banco
    async function carregarInventario() {
        try {
            const { data, error } = await supabase
                .from('inventario_balanco')
                .select('*')
                .order('criado_em', { ascending: false });

            if (error) throw error;
            if (data) setPecas(data as ItemEstoque[]);
        } catch (err) {
            console.error("Erro ao sincronizar estoque:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarInventario();

        // 🔥 SINCRONIZAÇÃO EM TEMPO REAL CORRIGIDA PARA TYPESCRIPT
        const canalRealtime = supabase
            .channel('mudancas_estoque_gr')
            .on(
                'postgres_changes' as any, // 💡 Força a tipagem livre para aceitar a escuta do Postgres sem quebrar o compilador
                { event: '*', schema: 'public', table: 'inventario_balanco' }, // 💡 Corrigido de 'scheme' para 'schema' conforme padrão Supabase
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        const novoItem = payload.new as ItemEstoque;
                        setPecas(prev => [novoItem, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        const itemAtualizado = payload.new as ItemEstoque;
                        setPecas(prev => prev.map(p => p.id === itemAtualizado.id ? itemAtualizado : p));
                    } else if (payload.eventType === 'DELETE') {
                        const itemRemovido = payload.old as { id: string };
                        setPecas(prev => prev.filter(p => p.id !== itemRemovido.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(canalRealtime);
        };
    }, []);

    // Atualiza o status da peça e da etiqueta diretamente no banco de dados
    const handleAlterarStatus = async (id: string, novoStatus: 'AGUARDANDO' | 'CONCLUIDO') => {
        try {
            const { error } = await supabase
                .from('inventario_balanco')
                .update({ status: novoStatus })
                .eq('id', id);

            if (error) throw error;
            setPecas(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p));
        } catch (err) {
            console.error("Falha ao atualizar status:", err);
            alert("Erro ao salvar alteração no servidor.");
        }
    };

    // Filtros lógicos combinados
    const pecasFiltradas = pecas.filter(p => {
        const matchesStatus = filtroStatus === 'TODOS' || p.status === filtroStatus;
        const matchesBusca = p.referencia.toLowerCase().includes(busca.toLowerCase()) ||
            p.localizacao.toLowerCase().includes(busca.toLowerCase());
        return matchesStatus && matchesBusca;
    });

    return (
        <main className="relative min-h-screen bg-[#030303] text-white p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* BACKGROUND LINES */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/[0.03] rounded-full blur-[130px]" />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-6">

                {/* HEADER */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/[0.04] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/estoque" className="text-orange-500 font-black text-[9px] uppercase tracking-[4px] mb-1.5 block hover:opacity-70 transition-all">
                            ← Voltar para Lançamentos
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Painel de Balanço <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">e Etiquetas</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5 font-bold">
                            Módulo de Auditoria Física de Peças • GR Autopeças
                        </p>
                    </div>
                </header>

                {/* CONTROLES, FILTROS E PESQUISA RÁPIDA */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2 w-full">
                    <input
                        type="text"
                        placeholder="🔍 BUSCAR POR REFERÊNCIA OU ENDEREÇO..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        className="w-full md:max-w-md bg-[#09090b] border border-white/[0.06] focus:border-orange-500 px-4 py-2.5 rounded-xl outline-none text-white font-mono text-xs tracking-wider placeholder-slate-700 uppercase"
                    />

                    <div className="flex items-center gap-2 bg-[#09090b] border border-white/[0.06] p-1 rounded-xl w-full md:w-auto justify-center">
                        {['TODOS', 'AGUARDANDO', 'CONCLUIDO'].map(st => (
                            <button
                                key={st}
                                onClick={() => setFiltroStatus(st)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                    filtroStatus === st
                                        ? 'bg-orange-500 text-black shadow-lg font-black'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {st === 'AGUARDANDO' ? '⏳ Aguardando' : st === 'CONCLUIDO' ? '✅ Concluído' : '📋 Todos'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TABELA DE REGISTROS DO INVENTÁRIO */}
                <div className="relative bg-[#09090b]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl overflow-hidden min-h-[450px] mx-2">
                    <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

                    {carregando ? (
                        <div className="text-center py-32 text-[9px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse">
                            Sincronizando dados com a base central...
                        </div>
                    ) : pecasFiltradas.length === 0 ? (
                        <div className="py-32 text-center">
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nenhum item localizado na contagem.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[600px] pr-1">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-white/[0.04] text-slate-500 uppercase tracking-wider text-[8px] font-black pb-3">
                                    <th className="pb-3 pl-2">Localização Física</th>
                                    <th className="pb-3 text-center">Referência</th>
                                    <th className="pb-3 text-center">Quantidade</th>
                                    <th className="pb-3 text-center">String Pronta (Cópia)</th>
                                    <th className="pb-3 text-center">Status Interno</th>
                                    <th className="pb-3 text-right pr-2">Ações Operacionais</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.015]">
                                {pecasFiltradas.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="py-3.5 pl-2 font-mono text-[11px] text-slate-400">
                                            {item.localizacao}
                                        </td>
                                        <td className="py-3.5 text-center font-black text-white uppercase tracking-widest font-mono text-sm">
                                            {item.referencia}
                                        </td>
                                        <td className="py-3.5 text-center font-black text-orange-400 font-mono text-sm">
                                            {item.quantidade} un
                                        </td>
                                        <td className="py-3.5 text-center font-mono text-[10px] text-slate-600 selection:bg-orange-500/30">
                                            {item.string_completa}
                                        </td>
                                        <td className="py-3.5 text-center">
                                                <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                                                    item.status === 'CONCLUIDO'
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                }`}>
                                                    {item.status === 'CONCLUIDO' ? 'ETIQUETADO' : 'AGUARDANDO'}
                                                </span>
                                        </td>
                                        <td className="py-3.5 text-right pr-2">
                                            <div className="flex gap-1.5 justify-end">
                                                {item.status === 'AGUARDANDO' ? (
                                                    <button
                                                        onClick={() => handleAlterarStatus(item.id, 'CONCLUIDO')}
                                                        className="text-emerald-400 text-[8px] font-black uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all"
                                                    >
                                                        ✓ Concluir / Etiquetar
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAlterarStatus(item.id, 'AGUARDANDO')}
                                                        className="text-slate-500 text-[8px] font-black uppercase tracking-wider bg-white/[0.02] border border-white/[0.05] hover:text-amber-400 px-3 py-1.5 rounded-lg transition-all"
                                                    >
                                                        ✕ Reabrir Fila
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left px-2">
                <div>GR Autopeças & Serviços</div>
                <div className="font-mono text-slate-800">Módulo Balanço Real-Time v1.2</div>
            </footer>
        </main>
    );
}