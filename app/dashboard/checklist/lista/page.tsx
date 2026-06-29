"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface RevisaoFiltro {
    id: string;
    placa: string;
    frota_no: string;
    marca_modelo: string;
    data_entrada: string;
    mecanico_responsavel: string;
}

export default function ListaChecklistsPage() {
    const [checklists, setChecklists] = useState<RevisaoFiltro[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');

    const [ordenarPor, setOrdenarPor] = useState<'placa' | 'data' | 'mecanico'>('data');
    const [ordemCrescente, setOrdemCrescente] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const buscarChecklists = async () => {
            setCarregando(true);
            try {
                const { data, error } = await supabase
                    .from('revisoes_frota')
                    .select('id, placa, frota_no, marca_modelo, data_entrada, mecanico_responsavel');

                if (error) throw error;
                if (data) setChecklists(data as any);
            } catch (err) {
                console.error("Erro ao buscar revisões de frota:", err);
            } finally {
                setCarregando(false);
            }
        };

        buscarChecklists();
    }, []);

    const alterarOrdenacao = (criterio: 'placa' | 'data' | 'mecanico') => {
        if (ordenarPor === criterio) {
            setOrdemCrescente(!ordemCrescente);
        } else {
            setOrdenarPor(criterio);
            setOrdemCrescente(true);
        }
    };

    const checklistsProcessados = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        let resultado = checklists.filter(item => {
            if (!termo) return true;
            return (
                item.placa?.toLowerCase().includes(termo) ||
                item.frota_no?.toLowerCase().includes(termo) ||
                item.marca_modelo?.toLowerCase().includes(termo) ||
                item.mecanico_responsavel?.toLowerCase().includes(termo)
            );
        });

        resultado.sort((a, b) => {
            let valorA = '';
            let valorB = '';

            if (ordenarPor === 'placa') {
                valorA = a.placa || '';
                valorB = b.placa || '';
            } else if (ordenarPor === 'data') {
                valorA = a.data_entrada || '';
                valorB = b.data_entrada || '';
            } else if (ordenarPor === 'mecanico') {
                valorA = a.mecanico_responsavel || '';
                valorB = b.mecanico_responsavel || '';
            }

            if (ordemCrescente) {
                return valorA.localeCompare(valorB);
            } else {
                return valorB.localeCompare(valorA);
            }
        });

        return resultado;
    }, [checklists, pesquisa, ordenarPor, ordemCrescente]);

    const formatarData = (dataSrt: string) => {
        if (!dataSrt) return '---';
        const [ano, mes, dia] = dataSrt.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-orange-500/10">
            <div className="max-w-4xl mx-auto space-y-6">

                <header className="bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-0.5">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Módulos Administrativos
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Histórico de Revisões</h1>
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Gerenciamento e Auditoria de Checklists</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/dashboard/checklist/imprimir-base"
                            className="bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 active:scale-95 shadow-sm"
                        >
                            🖨️ Imprimir Ficha Base
                        </Link>
                        <Link
                            href="/dashboard/checklist"
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 active:scale-95 shadow-sm"
                        >
                            ➕ Nova Checklist
                        </Link>
                    </div>
                </header>

                <div className="bg-white border border-[#e5e5ea] p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                            type="text"
                            placeholder="Buscar por placa, frota, modelo ou mecânico..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3.5 py-2 rounded-lg font-medium text-[#1d1d1f] text-xs outline-none transition-colors w-full placeholder-[#b4b4b9] uppercase"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-bold uppercase tracking-wide text-[#86868b]">
                        <span className="mr-1 select-none text-[#1d1d1f]">Ordenar por:</span>

                        <button
                            onClick={() => alterarOrdenacao('placa')}
                            className={`px-3 py-1.5 rounded-md border transition-all ${ordenarPor === 'placa' ? 'bg-[#1d1d1f] text-white border-black' : 'bg-[#f5f5f7] hover:bg-[#e5e5ea] border-[#e5e5ea] text-[#1d1d1f]'}`}
                        >
                            Placa {ordenarPor === 'placa' ? (ordemCrescente ? '▲' : '▼') : ''}
                        </button>

                        <button
                            onClick={() => alterarOrdenacao('data')}
                            className={`px-3 py-1.5 rounded-md border transition-all ${ordenarPor === 'data' ? 'bg-[#1d1d1f] text-white border-black' : 'bg-[#f5f5f7] hover:bg-[#e5e5ea] border-[#e5e5ea] text-[#1d1d1f]'}`}
                        >
                            Data {ordenarPor === 'data' ? (ordemCrescente ? '▲' : '▼') : ''}
                        </button>

                        <button
                            onClick={() => alterarOrdenacao('mecanico')}
                            className={`px-3 py-1.5 rounded-md border transition-all ${ordenarPor === 'mecanico' ? 'bg-[#1d1d1f] text-white border-black' : 'bg-[#f5f5f7] hover:bg-[#e5e5ea] border-[#e5e5ea] text-[#1d1d1f]'}`}
                        >
                            Mecânico {ordenarPor === 'mecanico' ? (ordemCrescente ? '▲' : '▼') : ''}
                        </button>
                    </div>
                </div>

                <section className="space-y-3">
                    {carregando ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Carregando Inspeções...</span>
                        </div>
                    ) : checklistsProcessados.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-[#e5e5ea] rounded-2xl text-[#86868b] font-semibold text-xs uppercase tracking-wide">
                            Nenhum registro de revisão preventiva encontrado.
                        </div>
                    ) : (
                        <div className="bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                    <tr className="bg-[#f5f5f7]/60 border-b border-[#e5e5ea] text-[8px] font-black uppercase tracking-wider text-[#86868b] select-none">
                                        <th className="py-3 px-4 w-28">Placa</th>
                                        <th className="py-3 px-4 w-20">Frota</th>
                                        <th className="py-3 px-4">Marca / Modelo</th>
                                        <th className="py-3 px-4 w-28">Data Entrada</th>
                                        <th className="py-3 px-4">Mecânico</th>
                                        <th className="py-3 px-4 w-32 text-center">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f5f7]">
                                    {checklistsProcessados.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#f5f5f7]/30 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-orange-600 uppercase">{item.placa}</td>
                                            <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{item.frota_no || '---'}</td>
                                            <td className="py-3.5 px-4 font-bold text-[#1d1d1f] uppercase">{item.marca_modelo}</td>
                                            <td className="py-3.5 px-4 font-mono text-slate-600">{formatarData(item.data_entrada)}</td>
                                            <td className="py-3.5 px-4 font-semibold text-[#1d1d1f] uppercase">{item.mecanico_responsavel}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2 font-black uppercase tracking-tight text-xs">
                                                    <Link
                                                        href={`/dashboard/checklist/visualizar?id=${item.id}`}
                                                        className="text-[#1d1d1f] hover:text-orange-600 transition-colors"
                                                    >
                                                        Abrir
                                                    </Link>
                                                    <span className="text-[#e5e5ea] font-normal select-none">|</span>
                                                    <Link
                                                        href={`/dashboard/checklist/editar?id=${item.id}`}
                                                        className="text-orange-600 hover:text-orange-700 transition-colors"
                                                    >
                                                        Editar
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}