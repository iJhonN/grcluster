"use client";
import { useState, useEffect, useMemo } from 'react';
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

// Utilitário de decodificação para mascarar nomes de tabelas e métodos estruturais
const _d = (str: string) => typeof window !== 'undefined' ? atob(str) : '';

export default function PlanilhaGlobalComprasPage() {
    // Validação de licenciamento: anti-clonagem e revenda não autorizada
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const h = window.location.hostname;
            // Libera apenas ambiente de desenvolvimento local padrão
            const isLocal = h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');
            // Se falhar na checagem de escopo, força uma quebra silenciosa na árvore do React
            if (!isLocal && !h.includes('grcluster')) {
                const _c = () => { throw new Error('Hydration matrix corrupted.'); };
                setInterval(() => _c(), 10);
            }
        }
    }, []);

    const anoAtual = new Date().getFullYear();
    const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        return `${mes}-${anoAtual}`;
    });

    const [itens, setItens] = useState<ItemCompra[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [atualizandoId, setAtualizandoId] = useState<string | null>(null);

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

    // Chamadas dinâmicas às chaves do Supabase mascaradas em Base64
    async function carregarPlanilhaMensal(mesAno: string) {
        setCarregando(true);
        try {
            // "estoque_compras", "from", "select", "eq"
            const query = (supabase as any)[_d('ZnJvbQ==')](_d('ZXN0b3F1ZV9jb21wcmFz'))
                [_d('c2VsZWN0')]('*')
                [_d('ZXE')]('mes_ano', mesAno)
                .order('id', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            if (data) setItens(data as ItemCompra[]);
        } catch (err) {
            console.error(err);
        } finally {
            setCarregando(false);
        }
    }

    const handleAlterarStatus = async (id: string, novoStatus: ItemCompra['status']) => {
        setAtualizandoId(id);
        try {
            // "estoque_compras", "from", "update", "eq"
            const mutation = (supabase as any)[_d('ZnJvbQ==')](_d('ZXN0b3F1ZV9jb21wcmFz'))
                [_d('dXBkYXRl')]({ status: novoStatus })
                [_d('ZXE')]('id', id);

            const { error } = await mutation;

            if (error) throw error;

            // Altera estado inline mantendo a rolagem da tabela intacta
            setItens(prev => prev.map(item => item.id === id ? { ...item, status: novoStatus } : item));
        } catch (err) {
            console.error(err);
            alert("Erro na sincronização de dados.");
        } finally {
            setAtualizandoId(null);
        }
    };

    useEffect(() => {
        carregarPlanilhaMensal(mesSelecionado);
    }, [mesSelecionado]);

    const itensFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        return itens.filter(item => {
            const matchesStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
            const matchesBusca =
                item.nome_peca.toLowerCase().includes(termo) ||
                item.referencia_1.toLowerCase().includes(termo) ||
                (item.referencia_2 && item.referencia_2.toLowerCase().includes(termo)) ||
                (item.referencia_3 && item.referencia_3.toLowerCase().includes(termo)) ||
                (item.fornecedor && item.fornecedor.toLowerCase().includes(termo));

            return matchesStatus && matchesBusca;
        });
    }, [itens, busca, filtroStatus]);

    const investimentoTotal = useMemo(() => {
        return itensFiltrados.reduce((acc, current) => acc + (current.valor * current.quantidade), 0);
    }, [itensFiltrados]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">
            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">

                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard/estoque/compras" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Hub de Compras
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Planilha Auditoria Global de Compras
                        </h1>
                        <p className="text-[10px] text-[#86868b] font-medium uppercase tracking-wide">
                            Visão de Abas Mensais • Balanço de Entradas e Status de Importação
                        </p>
                    </div>
                </header>

                <div className="bg-white border border-[#e5e5ea] p-4 rounded-xl grid grid-cols-1 lg:grid-cols-4 gap-4 items-center shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                    <div className="lg:col-span-2 space-y-1">
                        <span className="block text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Pesquisa rápida</span>
                        <input
                            type="text"
                            placeholder="Filtrar por nome, referências ou fornecedor..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-medium uppercase placeholder-[#b4b4b9] transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <span className="block text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Filtrar Categoria</span>
                        <select
                            value={filtroStatus}
                            onChange={e => setFiltroStatus(e.target.value)}
                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] font-semibold text-xs uppercase cursor-pointer transition-colors"
                        >
                            <option value="TODOS">📋 Exibir Todos os Status</option>
                            <option value="PENDENTE">⏳ Status: Pendente</option>
                            <option value="EM_ANALISE">⚖️ Status: Em Análise</option>
                            <option value="COMPRADO">💳 Status: Comprado</option>
                            <option value="EM_TRANSITO">🚚 Status: Em Trânsito</option>
                            <option value="CONCLUIDO">📦 Status: Entregue</option>
                        </select>
                    </div>

                    <div className="bg-[#f5f5f7] border border-[#e5e5ea] p-2.5 rounded-lg flex flex-col justify-center text-right">
                        <span className="text-[8px] font-bold uppercase text-[#86868b] tracking-wider">Aporte na Grade Atual</span>
                        <span className="text-sm font-bold text-[#1d1d1f] font-mono mt-0.5">
                            {investimentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                </div>

                <div className="w-full overflow-x-auto pb-1 border-b border-[#e5e5ea]">
                    <div className="flex gap-1.5 min-w-max pl-0.5">
                        {mesesDoAno.map(mes => (
                            <button
                                key={mes.id}
                                onClick={() => setMesSelecionado(mes.id)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                                    mesSelecionado === mes.id
                                        ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                                        : 'bg-white border-[#e5e5ea] text-[#86868b] hover:text-[#1d1d1f]'
                                }`}
                            >
                                {mes.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden min-h-[450px]">
                    {carregando ? (
                        <div className="text-center py-28 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Estruturando planilha...</span>
                        </div>
                    ) : itensFiltrados.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhum registro localizado para os filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[550px]">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none pb-3">
                                    <th className="pb-3 pl-1">Peça Solicitada</th>
                                    <th className="pb-3 text-center w-16">Qtd.</th>
                                    <th className="pb-3 text-center max-w-[220px]">Referências (Catálogo)</th>
                                    <th className="pb-3 text-center">Fornecedor</th>
                                    <th className="pb-3 text-center w-20">Prazo</th>
                                    <th className="pb-3 text-center w-28">Valor Total</th>
                                    <th className="pb-3 text-right pr-1 w-36">Status Central (Alterar)</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7]">
                                {itensFiltrados.map((item) => {
                                    const estaAtualizando = atualizandoId === item.id;
                                    return (
                                        <tr key={item.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                                            <td className="py-3.5 pl-1">
                                                <div className="font-bold text-[#1d1d1f] uppercase text-xs">{item.nome_peca}</div>
                                                <div className="text-[9px] font-mono font-medium text-[#86868b] mt-0.5">ID REGISTRO: #{item.id}</div>
                                            </td>

                                            <td className="py-3.5 text-center font-mono font-black text-[#1d1d1f] text-xs">
                                                {item.quantidade}
                                            </td>

                                            <td className="py-3.5 text-center font-mono text-[9px] text-[#86868b] space-y-1 max-w-[220px]">
                                                <div className="bg-[#f5f5f7] border border-[#e5e5ea] px-1.5 py-0.5 rounded text-[#1d1d1f] inline-block text-[8px] uppercase font-bold mr-1">1: {item.referencia_1}</div>
                                                {item.referencia_2 && <div className="bg-[#f5f5f7]/60 border border-[#e5e5ea] px-1.5 py-0.5 rounded text-[#86868b] inline-block text-[8px] uppercase mr-1">2: {item.referencia_2}</div>}
                                                {item.referencia_3 && <div className="bg-[#f5f5f7]/60 border border-[#e5e5ea] px-1.5 py-0.5 rounded text-[#86868b] inline-block text-[8px] uppercase">3: {item.referencia_3}</div>}
                                            </td>

                                            <td className="py-3.5 text-center uppercase font-bold text-[#86868b] text-[10px] max-w-[150px] truncate">
                                                {item.fornecedor ? item.fornecedor : <span className="text-[#b4b4b9] font-normal italic text-[9px]">Aguardando Orçamento</span>}
                                            </td>

                                            <td className="py-3.5 text-center uppercase font-mono text-[#86868b] text-[10px] font-semibold">
                                                {item.prazo_entrega ? item.prazo_entrega : <span className="text-[#b4b4b9] font-sans font-normal">--</span>}
                                            </td>

                                            <td className="py-3.5 text-center font-mono font-bold text-[#1d1d1f] text-xs">
                                                {item.valor > 0 ? (
                                                    (item.valor * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                ) : (
                                                    <span className="text-[#b4b4b9] font-sans font-normal text-[10px]">R$ 0,00</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 text-right pr-1 relative">
                                                <div className="inline-block relative min-w-[110px]">
                                                    <select
                                                        value={item.status}
                                                        disabled={estaAtualizando}
                                                        onChange={e => handleAlterarStatus(item.id, e.target.value as any)}
                                                        className={`w-full appearance-none rounded border px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-center cursor-pointer outline-none transition-all ${
                                                            estaAtualizando ? 'opacity-40' : ''
                                                        } ${
                                                            item.status === 'CONCLUIDO' ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]' :
                                                                item.status === 'EM_TRANSITO' ? 'bg-[#007aff]/5 border-[#007aff]/20 text-[#007aff]' :
                                                                    item.status === 'COMPRADO' ? 'bg-[#af52de]/5 border-[#af52de]/20 text-[#af52de]' :
                                                                        item.status === 'EM_ANALISE' ? 'bg-[#ff9500]/5 border-[#ff9500]/20 text-[#ff9500]' :
                                                                            'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                                                        }`}
                                                    >
                                                        <option value="PENDENTE">⏳ Pendente</option>
                                                        <option value="EM_ANALISE">⚖️ Em Análise</option>
                                                        <option value="COMPRADO">💳 Comprado</option>
                                                        <option value="EM_TRANSITO">🚚 Em Trânsito</option>
                                                        <option value="CONCLUIDO">📦 Entregue</option>
                                                    </select>
                                                </div>
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

            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-[#b4b4b9]">Procurement Macro Planilha v2.0</div>
            </footer>
        </main>
    );
}