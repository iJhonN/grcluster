"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import Barcode from 'react-barcode';

interface Ferramenta {
    id: string;
    nome: string;
    status: string;
}

export default function ListaFerramentasPage() {
    const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, disponivel, ocupado

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarInventario() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('ferramentas')
                .select('id, nome, status')
                .order('nome');

            if (error) throw error;
            if (data) setFerramentas(data as Ferramenta[]);
        } catch (err) {
            console.error("Erro ao carregar inventário de ferramentas:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarInventario();
    }, []);

    const ferramentasFiltradas = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        return ferramentas.filter(f => {
            const batePesquisa = f.nome.toLowerCase().includes(termo) || f.id.includes(termo);
            const bateStatus = filtroStatus === 'todos' || f.status === filtroStatus;
            return batePesquisa && bateStatus;
        });
    }, [ferramentas, pesquisa, filtroStatus]);

    const metricas = useMemo(() => {
        const total = ferramentas.length;
        const disponiveis = ferramentas.filter(f => f.status === 'disponivel').length;
        const ocupadas = ferramentas.filter(f => f.status === 'ocupado').length;
        return { total, disponiveis, ocupadas };
    }, [ferramentas]);

    // Triga a impressão nativa do sistema
    const dispararImpressao = () => {
        window.print();
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col justify-between w-full selection:bg-black/5 print:bg-white print:p-0">

            {/* CONTEÚDO PRINCIPAL (OCULTADO NA IMPRESSÃO SE QUISER FOCAR SÓ NAS ETIQUETAS) */}
            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 sm:gap-8 print:hidden">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Menu Principal
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Inventário Geral de Ativos
                        </h1>
                    </div>

                    {/* BARRA DE PESQUISA, FILTROS E IMPRESSÃO EM LOTE */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar ferramenta ou ID..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3.5 py-2 rounded-xl text-[#1d1d1f] text-xs font-medium outline-none w-full sm:w-64 uppercase transition-colors placeholder-[#b4b4b9]"
                        />

                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-xl text-xs font-semibold outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                        >
                            <option value="todos">Todos os Status</option>
                            <option value="disponivel">Em Bancada</option>
                            <option value="ocupado">Em Uso</option>
                        </select>

                        <button
                            onClick={dispararImpressao}
                            disabled={ferramentasFiltradas.length === 0}
                            className="bg-[#1d1d1f] active:bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)] text-center disabled:opacity-40"
                        >
                            🖨️ Imprimir Etiquetas ({ferramentasFiltradas.length})
                        </button>
                    </div>
                </header>

                {/* METRICAS DO TOPO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#e5e5ea] p-4 rounded-xl text-center shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#86868b]">Total Catalogado</p>
                        <p className="text-xl font-mono font-black mt-0.5 text-[#1d1d1f]">{metricas.total}</p>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-4 rounded-xl text-center shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#248a3d]">Disponível em Bancada</p>
                        <p className="text-xl font-mono font-black mt-0.5 text-[#248a3d]">{metricas.disponiveis}</p>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-4 rounded-xl text-center shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#ff9500]">Retirado / Em Uso</p>
                        <p className="text-xl font-mono font-black mt-0.5 text-[#ff9500]">{metricas.ocupadas}</p>
                    </div>
                </div>

                {/* TABELA ADMINISTRATIVA */}
                <section className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden min-h-[400px]">
                    {carregando ? (
                        <div className="text-center py-24 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Carregando Ativos...</span>
                        </div>
                    ) : ferramentasFiltradas.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhuma ferramenta localizada com os filtros atuais.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none">
                                    <th className="pb-3 pl-2 w-28">ID Código</th>
                                    <th className="pb-3">Descrição da Ferramenta</th>
                                    <th className="pb-3 text-center w-36">Status</th>
                                    <th className="pb-3 text-right pr-2 w-28">Ação</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7]">
                                {ferramentasFiltradas.map(f => (
                                    <tr key={f.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                                        <td className="py-3.5 pl-2 font-mono font-bold text-xs text-[#ff9500] tracking-wider">
                                            {f.id}
                                        </td>
                                        <td className="py-3.5 font-bold text-[#1d1d1f] uppercase tracking-tight text-xs max-w-xs truncate">
                                            {f.nome}
                                        </td>
                                        <td className="py-3.5 text-center">
                                            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block text-center min-w-[90px] ${
                                                f.status === 'disponivel'
                                                    ? 'bg-[#34c759]/5 text-[#248a3d] border border-[#34c759]/10'
                                                    : 'bg-[#ff9500]/5 text-[#ff9500] border border-[#ff9500]/10'
                                            }`}>
                                                {f.status === 'disponivel' ? '● Em Bancada' : '⚙️ Em Uso'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-right pr-2">
                                            <button
                                                onClick={() => {
                                                    // Seta a pesquisa estrita para este item e dispara a janela de impressão
                                                    setPesquisa(f.id);
                                                    setTimeout(() => window.print(), 100);
                                                }}
                                                className="text-[9px] bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] px-2.5 py-1 rounded font-bold uppercase tracking-wider border border-[#e5e5ea] transition-colors"
                                            >
                                                Etiqueta
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* AREA EXCLUSIVA DE IMPRESSÃO: Renderiza uma malha de etiquetas perfeita para o pátio */}
            <div className="hidden print:block w-full">
                <div className="grid grid-cols-2 gap-6 p-4">
                    {ferramentasFiltradas.map(f => (
                        <div
                            key={f.id}
                            className="border-2 border-black p-4 rounded-xl flex flex-col items-center justify-center text-center bg-white break-inside-avoid shadow-none"
                            style={{ minHeight: '160px', pageBreakInside: 'avoid' }}
                        >
                            {/* Nome da ferramenta quebrando linha de forma elegante sem esmagar */}
                            <h2 className="text-xs font-black uppercase text-black tracking-tight mb-2 max-w-[240px] leading-tight break-words">
                                {f.nome}
                            </h2>

                            {/* Componente Barcode configurado com barras espessas para evitar leitura junta */}
                            <div className="flex items-center justify-center overflow-visible">
                                <Barcode
                                    value={f.id}
                                    format="CODE128"
                                    width={2.2}       // Define barras mais grossas e espaçadas
                                    height={55}       // Altura ideal para leitura ágil do laser
                                    displayValue={true} // Exibe o número de 4 dígitos logo abaixo das barras
                                    font="monospace"
                                    fontSize={12}
                                    textMargin={4}
                                    background="#ffffff"
                                    lineColor="#000000"
                                />
                            </div>

                            <p className="text-[7px] font-bold text-black uppercase tracking-widest mt-2">
                                GR ALMOXARIFADO CENTRAL
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* RODAPÉ DO MONITOR */}
            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none print:hidden">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Almoxarifado Central v3.2</div>
            </footer>
        </main>
    );
}