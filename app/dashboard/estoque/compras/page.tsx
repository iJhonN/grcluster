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
        { id: `01-${anoAtual}`, label: 'Jan' },
        { id: `02-${anoAtual}`, label: 'Fev' },
        { id: `03-${anoAtual}`, label: 'Mar' },
        { id: `04-${anoAtual}`, label: 'Abr' },
        { id: `05-${anoAtual}`, label: 'Mai' },
        { id: `06-${anoAtual}`, label: 'Jun' },
        { id: `07-${anoAtual}`, label: 'Jul' },
        { id: `08-${anoAtual}`, label: 'Ago' },
        { id: `09-${anoAtual}`, label: 'Set' },
        { id: `10-${anoAtual}`, label: 'Out' },
        { id: `11-${anoAtual}`, label: 'Nov' },
        { id: `12-${anoAtual}`, label: 'Dez' },
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
        } declare {
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

    // Cálculos rápidos de sumário para dar inteligência à tela
    const gastoTotal = itens.reduce((acc, item) => acc + (item.valor * item.quantidade), 0);
    const totalPecas = itens.reduce((acc, item) => acc + item.quantidade, 0);

    return (
        <main className="relative min-h-screen bg-[#030303] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* GRID INDUSTRIAL TEXTURIZADO LUXO */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `linear-gradient(to right, #dfbb6c 1px, transparent 1px), linear-gradient(to bottom, #dfbb6c 1px, transparent 1px)`, backgroundSize: '45px 40px' }} />
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#dfbb6c]/[0.02] rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-8 max-w-[1400px] mx-auto">

                {/* HEADER LUXURY STYLE */}
                <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.04] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/estoque" className="text-[#dfbb6c] font-black text-[9px] uppercase tracking-[4px] mb-2 block hover:opacity-80 transition-all">
                            ← Retornar ao Hub de Estoque
                        </Link>
                        <h1 className="text-3xl font-black uppercase italic tracking-tight text-white leading-none">
                            SUPRIMENTOS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfbb6c] via-[#f7e0a3] to-white">PROCURAMENTO</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold font-mono">
                            GESTÃO DE CAPITAL FINANCEIRO • TIMELINE OPERACIONAL DE EXPEDIÇÃO • {anoAtual}
                        </p>
                    </div>

                    <Link href="/dashboard/estoque/compras/cadastro" className="bg-gradient-to-b from-[#f7e0a3] to-[#dfbb6c] text-black text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-xl hover:brightness-110 active:scale-95 shrink-0">
                        ➔ Abrir Ordem de Compra
                    </Link>
                </header>

                {/* KPI INDICADORES DE CUSTO RAPIDOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
                    <div className="bg-[#09090b] border border-white/[0.05] p-5 rounded-2xl flex justify-between items-center relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 text-white/[0.01] font-black text-6xl select-none font-mono">CASH</div>
                        <div>
                            <p className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Investimento Estimado no Mês</p>
                            <p className="text-xl font-mono font-black text-[#dfbb6c] mt-1">
                                {gastoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#09090b] border border-white/[0.05] p-5 rounded-2xl flex justify-between items-center relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 text-white/[0.01] font-black text-6xl select-none font-mono">UN</div>
                        <div>
                            <p className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Volume Total de Itens Solicitados</p>
                            <p className="text-xl font-mono font-black text-white mt-1">
                                {totalPecas} <span className="text-xs text-slate-500 font-sans font-bold uppercase tracking-wider">Unidades</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* SELETOR DE MESES ESTILO TIMELINE */}
                <div className="w-full overflow-x-auto pb-2 border-b border-white/[0.02]">
                    <div className="flex gap-2 min-w-max px-2">
                        {mesesDoAno.map(mes => (
                            <button
                                key={mes.id}
                                onClick={() => setMesSelecionado(mes.id)}
                                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                    mesSelecionado === mes.id
                                        ? 'bg-[#dfbb6c] text-black border-[#dfbb6c] font-black shadow-lg shadow-[#dfbb6c]/10'
                                        : 'bg-[#09090b] border-white/[0.04] text-slate-400 hover:text-white hover:border-white/[0.1]'
                                }`}
                            >
                                {mes.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTAINER DOS ITENS */}
                <div className="space-y-4 px-2 min-h-[400px]">
                    {carregando ? (
                        <div className="text-center py-32 text-[9px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse font-mono">
                            Sincronizando livro de cotações com a nuvem...
                        </div>
                    ) : itens.length === 0 ? (
                        <div className="text-center py-32 border border-dashed border-white/[0.04] rounded-[28px]">
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Nenhuma demanda estruturada para este período.</p>
                        </div>
                    ) : (
                        itens.map((item) => (
                            <div
                                key={item.id}
                                className="bg-[#09090b]/90 border border-white/[0.06] hover:border-[#dfbb6c]/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all relative group overflow-hidden"
                            >
                                {/* Borda esquerda com status color code */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                    item.status === 'CONCLUIDO' ? 'bg-emerald-500' :
                                        item.status === 'EM_TRANSITO' ? 'bg-blue-500' :
                                            item.status === 'COMPRADO' ? 'bg-purple-500' : 'bg-[#dfbb6c]'
                                }`} />

                                {/* Info Peça */}
                                <div className="space-y-1 pl-2">
                                    <h3 className="text-sm font-black uppercase tracking-wide text-white group-hover:text-[#dfbb6c] transition-colors">
                                        {item.nome_peca}
                                    </h3>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono font-bold uppercase">
                                        <span>REF: <span className="text-slate-300">{item.referencia_1}</span></span>
                                        <span>•</span>
                                        <span>Volume: <span className="text-white">{item.quantidade} un</span></span>
                                    </div>
                                </div>

                                {/* Preço e Valor total acumulado */}
                                <div className="md:text-center font-mono">
                                    <p className="text-[8px] text-slate-500 uppercase font-sans font-black tracking-wider">Custo Total Previsto</p>
                                    <p className="text-sm font-black text-white mt-0.5">
                                        {(item.valor * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                    <p className="text-[9px] text-slate-600 mt-0.5">({item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} p/un)</p>
                                </div>

                                {/* Seletor e Badge de Ações */}
                                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/[0.04] pt-3 md:pt-0 shrink-0">
                                    <span className={`text-[8px] font-mono font-black px-2.5 py-1 rounded border uppercase tracking-widest ${
                                        item.status === 'CONCLUIDO' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                                            item.status === 'EM_TRANSITO' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' :
                                                item.status === 'COMPRADO' ? 'bg-purple-500/5 border-purple-500/20 text-purple-400' :
                                                    'bg-[#dfbb6c]/5 border-[#dfbb6c]/20 text-[#dfbb6c]'
                                    }`}>
                                        {item.status === 'CONCLUIDO' ? '📦 Entregue' : item.status === 'EM_TRANSITO' ? '🚚 Em Trânsito' : item.status === 'COMPRADO' ? '💳 Comprado' : '⏳ Aguardando'}
                                    </span>

                                    <select
                                        value={item.status}
                                        onChange={e => handleAlterarStatus(item.id, e.target.value as any)}
                                        className="bg-black border border-white/[0.08] focus:border-[#dfbb6c] text-slate-300 text-[10px] px-3 py-2 rounded-xl font-bold outline-none uppercase cursor-pointer transition-colors"
                                    >
                                        <option value="SOLICITADO">⏳ Solicitado</option>
                                        <option value="COMPRADO">💳 Comprado</option>
                                        <option value="EM_TRANSITO">🚚 Em Trânsito</option>
                                        <option value="CONCLUIDO">📦 Entregue</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* FOOTER GENERAL LUXURY BRAND */}
            <footer className="w-full border-t border-white/[0.02] pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-slate-800">PROCUREMENT LEDGER CORE v2.0</div>
            </footer>
        </main>
    );
}