"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface MaletaItem {
    id: string;
    nome: string;
    quantidade: number;
    status: string;
}

interface Maleta {
    id: string;
    mecanico_id: string;
    identificacao: string;
    observacoes: string | null;
    foto_url: string | null;
    ultima_auditoria: string | null;
    funcionarios: {
        nome: string;
        sobrenome: string;
    };
    maleta_itens: MaletaItem[];
}

export default function ListaMaletasPage() {
    const [maletas, setMaletas] = useState<Maleta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const carregarMaletas = async () => {
            setCarregando(true);
            try {
                const { data, error } = await supabase
                    .from('maletas')
                    .select('*, funcionarios(nome, sobrenome), maleta_itens(*)')
                    .order('data_cadastro', { ascending: false });

                if (error) throw error;
                if (data) setMaletas(data as unknown as Maleta[]);
            } catch (err) {
                console.error("Erro ao carregar maletas:", err);
            } finally {
                setCarregando(false);
            }
        };
        carregarMaletas();
    }, [supabase]);

    const maletasFiltradas = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        if (!termo) return maletas;
        return maletas.filter(m =>
            m.identificacao.toLowerCase().includes(termo) ||
            `${m.funcionarios?.nome} ${m.funcionarios?.sobrenome}`.toLowerCase().includes(termo) ||
            m.maleta_itens?.some(i => i.nome.toLowerCase().includes(termo))
        );
    }, [maletas, pesquisa]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col justify-between w-full">
            <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col gap-8">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard/ferramentas" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Voltar para Ferramentas
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Maletas de Mecânicos
                        </h1>
                        <p className="text-xs text-[#86868b] font-medium">
                            Controle e auditoria de inventário de ferramentas pessoais.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-72">
                            <input
                                type="text"
                                placeholder="Buscar por maleta, mecânico ou ferramenta..."
                                value={pesquisa}
                                onChange={e => setPesquisa(e.target.value)}
                                className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-4 py-2.5 rounded-xl outline-none text-[#1d1d1f] text-xs font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.005)]"
                            />
                        </div>
                        <Link
                            href="/dashboard/ferramentas/maletas/cadastro"
                            className="bg-[#1d1d1f] active:bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 text-center flex items-center justify-center whitespace-nowrap"
                        >
                            ➕ Novo Inventário
                        </Link>
                    </div>
                </header>

                {carregando ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                        <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Carregando Inventários...</span>
                    </div>
                ) : maletasFiltradas.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-[#e5e5ea] shadow-sm">
                        <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhuma maleta localizada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {maletasFiltradas.map(maleta => {
                            const itensAusentes = maleta.maleta_itens?.filter(i => i.status === 'ausente').length || 0;
                            const itensAvariados = maleta.maleta_itens?.filter(i => i.status === 'danificado').length || 0;
                            const possuiAlerta = itensAusentes > 0 || itensAvariados > 0;

                            return (
                                <div key={maleta.id} className="bg-white border border-[#e5e5ea] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col relative">

                                    {/* ALERTA DE PROBLEMAS NA MALETA */}
                                    {possuiAlerta && (
                                        <div className="absolute top-3 right-3 bg-[#ff3b30] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm z-10 animate-pulse">
                                            Atenção Requerida
                                        </div>
                                    )}

                                    {/* Header do Card */}
                                    <div className="flex bg-[#f5f5f7] border-b border-[#e5e5ea]">
                                        <div className="w-28 h-28 shrink-0 border-r border-[#e5e5ea] bg-white flex items-center justify-center relative">
                                            {maleta.foto_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={maleta.foto_url} alt="Foto da Maleta" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl opacity-30">🧰</span>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col justify-center flex-1 min-w-0">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#007aff] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded max-w-max mb-1.5 truncate">
                                                {maleta.funcionarios?.nome} {maleta.funcionarios?.sobrenome}
                                            </span>
                                            <h2 className="text-sm font-black tracking-tight text-[#1d1d1f] leading-snug">{maleta.identificacao}</h2>

                                            <div className="mt-2 text-[9px] font-bold text-[#86868b] uppercase flex items-center gap-1">
                                                <span>⏱️ Ult. Aud:</span>
                                                <span className={maleta.ultima_auditoria ? "text-[#1d1d1f]" : "text-[#ff9500]"}>
                                                    {maleta.ultima_auditoria ? new Date(maleta.ultima_auditoria).toLocaleDateString('pt-BR') : 'Nunca realizada'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Corpo do Card (Resumo) */}
                                    <div className="p-4 flex flex-col flex-1 gap-4">
                                        <div className="grid grid-cols-3 gap-2 text-center bg-[#f5f5f7] p-2 rounded-lg border border-[#e5e5ea]">
                                            <div>
                                                <span className="block text-xs font-black text-[#1d1d1f]">{maleta.maleta_itens?.length || 0}</span>
                                                <span className="text-[8px] font-bold uppercase text-[#86868b] tracking-wider">Total</span>
                                            </div>
                                            <div>
                                                <span className={`block text-xs font-black ${itensAusentes > 0 ? 'text-[#ff3b30]' : 'text-[#1d1d1f]'}`}>{itensAusentes}</span>
                                                <span className="text-[8px] font-bold uppercase text-[#86868b] tracking-wider">Faltas</span>
                                            </div>
                                            <div>
                                                <span className={`block text-xs font-black ${itensAvariados > 0 ? 'text-[#ff9500]' : 'text-[#1d1d1f]'}`}>{itensAvariados}</span>
                                                <span className="text-[8px] font-bold uppercase text-[#86868b] tracking-wider">Avarias</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ação: Botão de Checklist na base */}
                                    <Link
                                        href={`/dashboard/ferramentas/maletas/${maleta.id}`}
                                        className="w-full bg-[#f5f5f7] hover:bg-[#e8e8ed] border-t border-[#e5e5ea] text-[#1d1d1f] py-3 text-xs font-bold uppercase tracking-wider transition-colors text-center flex items-center justify-center gap-2"
                                    >
                                        📋 Abrir Checklist
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}