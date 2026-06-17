"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface ItemCompra {
    id: string;
    nome_peca: string;
    referencia_1: string;
    quantidade: number;
    valor: number;
    status: 'SOLICITADO' | 'COMPRADO' | 'EM_TRANSITO' | 'CONCLUIDO';
    mes_ano: string;
}

export default function PainelComprasMensalPage() {
    const anoAtual = new Date().getFullYear();
    const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        return `${mes}-${anoAtual}`;
    });

    const [itens, setItens] = useState<ItemCompra[]>([]);
    const [carregando, setCarregando] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const mesesDoAno = [
        { id: `01-${anoAtual}`, label: 'Janeiro' },
        { id: `02-${anoAtual}`, label: 'Fevereiro' },
        { id: `03-${anoAtual}`, label: 'Março' },
        { id: `04-${anoAtual}`, label: 'Abril' },
        { id: `05-${anoAtual}`, label: 'Maio' },
        { id: `06-${anoAtual}`, label: 'Junho' },
        { id: `07-${anoAtual}`, label: 'Julho' },
        { id: `08-${anoAtual}`, label: 'Agosto' },
        { id: `09-${anoAtual}`, label: 'Setembro' },
        { id: `10-${anoAtual}`, label: 'Outubro' },
        { id: `11-${anoAtual}`, label: 'Novembro' },
        { id: `12-${anoAtual}`, label: 'Dezembro' },
    ];

    async function carregarComprasDoMes(mesAno: string) {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('estoque_compras')
                .select('id, nome_peca, referencia_1, quantidade, valor, status, mes_ano')
                .eq('mes_ano', mesAno)
                .order('id', { ascending: false });

            if (error) throw error;
            if (data) setItens(data as ItemCompra[]);
        } catch (err) {
            console.error("Erro ao carregar compras mensais:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarComprasDoMes(mesSelecionado);
    }, [mesSelecionado]);

    const handleAlterarStatus = async (id: string, novoStatus: ItemCompra['status']) => {
        try {
            const { error } = await supabase
                .from('estoque_compras')
                .update({ status: novoStatus })
                .eq('id', id);

            if (error) throw error;
            setItens(prev => prev.map(item => item.id === id ? { ...item, status: novoStatus } : item));
        } catch (err) {
            console.error("Falha ao atualizar status da compra:", err);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#030303] text-white p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/[0.02] rounded-full blur-[130px]" />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-6 max-w-[1400px] mx-auto">
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/[0.04] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/estoque" className="text-orange-500 Richmond font-black text-[9px] uppercase tracking-[4px] mb-1.5 block hover:opacity-70 transition-all">
                            ← Menu Principal
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Controle de Suprimentos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">e Compras</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5 font-bold">
                            Planejamento Mensal de Reposição de Peças de Reposição • {anoAtual}
                        </p>
                    </div>
                    <Link href="/dashboard/estoque/compras/cadastro" className="bg-orange-500 text-black text-[10px] font-black uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-orange-400 transition-all shadow-lg active:scale-95">
                        ➕ Nova Solicitação
                    </Link>
                </header>

                {/* ABA DE SELEÇÃO DOS 12 MESES */}
                <div className="w-full overflow-x-auto pb-2 border-b border-white/[0.02]">
                    <div className="flex gap-2 min-w-max px-2">
                        {mesesDoAno.map(mes => (
                            <button
                                key={mes.id}
                                onClick={() => setMesSelecionado(mes.id)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                    mesSelecionado === mes.id
                                        ? 'bg-orange-500 text-black border-orange-500 font-black shadow-lg'
                                        : 'bg-[#09090b] border-white/[0.04] text-slate-400 hover:text-white'
                                }`}
                            >
                                {mes.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* QUADRO DO MÊS ATUAL */}
                <div className="relative bg-[#09090b]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl overflow-hidden min-h-[450px] mx-2">
                    <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

                    {carregando ? (
                        <div className="text-center py-32 text-[9px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse">
                            Buscando registros do livro-caixa de suprimentos...
                        </div>
                    ) : itens.length === 0 ? (
                        <div className="py-32 text-center">
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nenhuma peça agendada para compra neste mês.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-white/[0.04] text-slate-500 uppercase tracking-wider text-[8px] font-black pb-3">
                                    <th className="pb-3 pl-2">Item Solicitado</th>
                                    <th className="pb-3 text-center">Referência Principal</th>
                                    <th className="pb-3 text-center">Qtd.</th>
                                    <th className="pb-3 text-center">Custo Previsto</th>
                                    <th className="pb-3 text-center">Status Operacional</th>
                                    <th className="pb-3 text-right pr-2">Ações de Triagem</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.015]">
                                {itens.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="py-3.5 pl-2 font-bold text-white uppercase text-xs">{item.nome_peca}</td>
                                        <td className="py-3.5 text-center font-mono text-[11px] text-slate-400 tracking-wider uppercase">{item.referencia_1}</td>
                                        <td className="py-3.5 text-center font-mono font-black text-white">{item.quantidade} un</td>
                                        <td className="py-3.5 text-center font-mono font-black text-orange-400">
                                            {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="py-3.5 text-center">
                                                <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                                                    item.status === 'CONCLUIDO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                        item.status === 'EM_TRANSITO' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                            item.status === 'COMPRADO' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                }`}>
                                                    {item.status === 'CONCLUIDO' ? '📦 ENTREGUE' : item.status === 'EM_TRANSITO' ? '🚚 EM TRÂNSITO' : item.status === 'COMPRADO' ? '💳 COMPRADO' : '⏳ AGUARDANDO'}
                                                </span>
                                        </td>
                                        <td className="py-3.5 text-right pr-2">
                                            <select
                                                value={item.status}
                                                onChange={e => handleAlterarStatus(item.id, e.target.value as any)}
                                                className="bg-black border border-white/[0.08] text-slate-300 text-[10px] px-2 py-1 rounded-lg font-bold outline-none uppercase cursor-pointer focus:border-orange-500"
                                            >
                                                <option value="SOLICITADO">⏳ Solicitado</option>
                                                <option value="COMPRADO">💳 Comprado</option>
                                                <option value="EM_TRANSITO">🚚 Em Trânsito</option>
                                                <option value="CONCLUIDO">📦 Entregue</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças & Serviços</div>
                <div className="font-mono text-slate-800">Módulo Compras v1.0</div>
            </footer>
        </main>
    );
}