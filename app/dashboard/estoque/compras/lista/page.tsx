"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface ItemCompra {
    id: string;
    nome_peca: string;
    quantidade: number;
    referencia_1: string;
    referencia_2: string | null;
    referencia_3: string | null;
    status: 'PENDENTE' | 'EM_ANALISE' | 'COMPRADO' | 'EM_TRANSITO' | 'CONCLUIDO';
    fornecedor: string | null;
    valor: number;
    prazo_entrega: string | null;
    mes_ano: string;
    criado_em: string;
}

export default function PlanilhaGlobalComprasPage() {
    const anoAtual = new Date().getFullYear();
    const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        return `${mes}-${anoAtual}`;
    });

    const [itens, setItens] = useState<ItemCompra[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');

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

    async function carregarPlanilhaMensal(mesAno: string) {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('estoque_compras')
                .select('*')
                .eq('mes_ano', mesAno)
                .order('id', { ascending: false });

            if (error) throw error;
            if (data) setItens(data as ItemCompra[]);
        } catch (err) {
            console.error("Erro ao sincronizar livro-caixa:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarPlanilhaMensal(mesSelecionado);
    }, [mesSelecionado]);

    // FILTRAGEM COMBINADA (Busca Textual por Nome/Refs + Filtro de Status)
    const itensFiltrados = itens.filter(item => {
        const matchesStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;

        const termo = busca.toLowerCase();
        const matchesBusca =
            item.nome_peca.toLowerCase().includes(termo) ||
            item.referencia_1.toLowerCase().includes(termo) ||
            (item.referencia_2 && item.referencia_2.toLowerCase().includes(termo)) ||
            (item.referencia_3 && item.referencia_3.toLowerCase().includes(termo)) ||
            (item.fornecedor && item.fornecedor.toLowerCase().includes(termo));

        return matchesStatus && matchesBusca;
    });

    // Indicadores financeiros calculados dinamicamente em cima do que foi filtrado na tabela
    const investimentoTotal = itensFiltrados.reduce((acc, current) => acc + (current.valor * current.quantidade), 0);

    return (
        <main className="relative min-h-screen bg-[#030303] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* GRID BACKGROUND METÁLICO LUXO */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `linear-gradient(to right, #dfbb6c 1px, transparent 1px), linear-gradient(to bottom, #dfbb6c 1px, transparent 1px)`, backgroundSize: '45px 40px' }} />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-6 max-w-[1400px] mx-auto">

                {/* HEADER */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/[0.04] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/estoque/compras" className="text-[#dfbb6c] font-black text-[9px] uppercase tracking-[4px] mb-2 block hover:opacity-80 transition-all">
                            ← Retornar ao Hub de Compras
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white leading-none">
                            PLANILHA AUDITORIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfbb6c] via-[#f7e0a3] to-white">GLOBAL DE COMPRAS</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5 font-bold font-mono">
                            VISÃO DE ABAS MENSAIS • BALANÇO DE ENTRADAS E STATUS DE IMPORTAÇÃO
                        </p>
                    </div>
                </header>

                {/* CONTROLES DE FILTRAGEM, BUSCA E SUMMARY DE PREÇOS */}
                <div className="bg-[#09090b]/90 border border-white/[0.06] p-6 rounded-2xl grid grid-cols-1 lg:grid-cols-4 gap-4 items-center mx-2">

                    {/* BUSCA AVANÇADA POR CÓDIGOS OU DESCRITIVO */}
                    <div className="lg:col-span-2 space-y-1">
                        <span className="block text-[8px] font-black uppercase text-slate-500 tracking-wider font-mono">Pesquisa rápida</span>
                        <input
                            type="text"
                            placeholder="🔍 FILTRAR POR NOME, REF 1, REF 2, REF 3 OU FORNECEDOR..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/40 px-4 py-2.5 rounded-xl outline-none text-white font-mono text-xs tracking-wider placeholder-slate-700 uppercase"
                        />
                    </div>

                    {/* FILTRO DE STATUS DA ETAPA */}
                    <div className="space-y-1">
                        <span className="block text-[8px] font-black uppercase text-slate-500 tracking-wider font-mono">Filtrar Categoria</span>
                        <select
                            value={filtroStatus}
                            onChange={e => setFiltroStatus(e.target.value)}
                            className="w-full bg-black border border-white/[0.06] focus:border-[#dfbb6c]/40 px-4 py-2.5 rounded-xl outline-none text-slate-300 font-bold text-xs uppercase cursor-pointer"
                        >
                            <option value="TODOS">📋 EXIBIR TODOS OS STATUS</option>
                            <option value="PENDENTE">⏳ STATUS: PENDENTE</option>
                            <option value="EM_ANALISE">⚖️ STATUS: EM ANÁLISE</option>
                            <option value="COMPRADO">💳 STATUS: COMPRADO</option>
                            <option value="EM_TRANSITO">🚚 STATUS: EM TRÂNSITO</option>
                            <option value="CONCLUIDO">📦 STATUS: ENTREGUE</option>
                        </select>
                    </div>

                    {/* ACUMULADO MONETÁRIO FILTRADO */}
                    <div className="bg-black/40 border border-white/[0.03] p-3.5 rounded-xl flex flex-col justify-center text-right font-mono">
                        <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider font-sans">Aporte Total na Grade Atual</span>
                        <span className="text-sm font-black text-[#dfbb6c] mt-0.5">
                            {investimentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                </div>

                {/* TIMELINE DE ABAS DOS MESES */}
                <div className="w-full overflow-x-auto pb-1 border-b border-white/[0.02]">
                    <div className="flex gap-1.5 min-w-max px-2">
                        {mesesDoAno.map(mes => (
                            <button
                                key={mes.id}
                                onClick={() => setMesSelecionado(mes.id)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                                    mesSelecionado === mes.id
                                        ? 'bg-[#dfbb6c] text-black border-[#dfbb6c] font-black shadow-md'
                                        : 'bg-[#09090b] border-white/[0.04] text-slate-500 hover:text-white'
                                }`}
                            >
                                {mes.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TABELA PLANILHADA MACRO */}
                <div className="relative bg-[#09090b]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl overflow-hidden min-h-[450px] mx-2">
                    <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-[#dfbb6c]/20 to-transparent" />

                    {carregando ? (
                        <div className="text-center py-32 text-[9px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse font-mono">
                            Estruturando planilha analítica de compras...
                        </div>
                    ) : itensFiltrados.length === 0 ? (
                        <div className="py-32 text-center">
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nenhum registro localizado para os filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[550px] pr-1">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-white/[0.04] text-slate-500 uppercase tracking-wider text-[8px] font-black pb-3 select-none">
                                    <th className="pb-3 pl-2">Peça Solicitada</th>
                                    <th className="pb-3 text-center">Qtd.</th>
                                    <th className="pb-3 text-center">Crossover de Referências</th>
                                    <th className="pb-3 text-center">Fornecedor Ganhador</th>
                                    <th className="pb-3 text-center">Prazo Médio</th>
                                    <th className="pb-3 text-center">Valor Total</th>
                                    <th className="pb-3 text-right pr-2">Status Central</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.015]">
                                {itensFiltrados.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">

                                        {/* Descrição Peça */}
                                        <td className="py-4 pl-2">
                                            <div className="font-bold text-white uppercase text-[11px] group-hover:text-[#dfbb6c] transition-colors">{item.nome_peca}</div>
                                            <div className="text-[8px] text-slate-600 uppercase font-mono mt-0.5">Cod. Registro: #{item.id}</div>
                                        </td>

                                        {/* Quantidade */}
                                        <td className="py-4 text-center font-mono font-black text-white text-[11px]">
                                            {item.quantidade} un
                                        </td>

                                        {/* Bloco das 3 referências unificadas na célula */}
                                        <td className="py-4 text-center font-mono text-[9px] text-slate-400 space-y-0.5 max-w-[200px] truncate">
                                            <div className="bg-white/[0.02] border border-white/[0.04] px-1.5 py-0.5 rounded text-slate-200 inline-block text-[8px] mr-1 uppercase">1: {item.referencia_1}</div>
                                            {item.referencia_2 && <div className="bg-white/[0.01] border border-white/[0.02] px-1.5 py-0.5 rounded text-slate-500 inline-block text-[8px] mr-1 uppercase">2: {item.referencia_2}</div>}
                                            {item.referencia_3 && <div className="bg-white/[0.01] border border-white/[0.02] px-1.5 py-0.5 rounded text-slate-500 inline-block text-[8px] uppercase">3: {item.referencia_3}</div>}
                                        </td>

                                        {/* Fornecedor */}
                                        <td className="py-4 text-center uppercase font-bold text-slate-400 text-[10px] max-w-[180px] truncate">
                                            {item.fornecedor ? item.fornecedor : <span className="text-slate-700 italic text-[9px]">Aguardando Orçamento</span>}
                                        </td>

                                        {/* Prazo */}
                                        <td className="py-4 text-center uppercase font-mono text-slate-500 text-[10px]">
                                            {item.prazo_entrega ? item.prazo_entrega : <span className="text-slate-800 font-sans">--</span>}
                                        </td>

                                        {/* Valor Acumulado */}
                                        <td className="py-4 text-center font-mono font-black text-[#dfbb6c] text-[11px]">
                                            {item.valor > 0 ? (
                                                <div>{(item.valor * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                            ) : (
                                                <span className="text-slate-700 font-sans font-bold text-[9px]">R$ 0,00</span>
                                            )}
                                        </td>

                                        {/* Status Unificado Badge */}
                                        <td className="py-4 text-right pr-2">
                                                <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                                                    item.status === 'CONCLUIDO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                        item.status === 'EM_TRANSITO' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                            item.status === 'COMPRADO' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                                item.status === 'EM_ANALISE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                                    'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}>
                                                    {item.status === 'CONCLUIDO' ? '📦 ENTREGUE' :
                                                        item.status === 'EM_TRANSITO' ? '🚚 EM TRÂNSITO' :
                                                            item.status === 'COMPRADO' ? '💳 COMPRADO' :
                                                                item.status === 'EM_ANALISE' ? '⚖️ EM ANÁLISE' : '⏳ PENDENTE'}
                                                </span>
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
            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-700 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-slate-800">PROCUREMENT MACRO PLANILHA v2.0</div>
            </footer>
        </main>
    );
}