"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface AvisoAdmin {
    id: number;
    titulo: string;
    conteudo: string;
    importante: boolean;
    criado_em: string;
}

export default function CadastroAvisosPainelPage() {
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [importante, setImportante] = useState(false);

    const [historicoAvisos, setHistoricoAvisos] = useState<AvisoAdmin[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarAvisosEmitidos() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('avisos')
                .select('*')
                .order('criado_em', { ascending: false });

            if (data) setHistoricoAvisos(data as AvisoAdmin[]);
            if (error) throw error;
        } catch (err) {
            console.error("Erro ao carregar histórico de avisos:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarAvisosEmitidos();
    }, []);

    const handleDispararAviso = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo.trim() || !conteudo.trim()) {
            setStatusFeed({ tipo: 'erro', texto: 'Preencha o título e o corpo do comunicado antes de disparar.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const { error } = await supabase
                .from('avisos')
                .insert([{
                    titulo: titulo.trim().toUpperCase(),
                    conteudo: conteudo.trim().toUpperCase(),
                    importante: importante
                }]);

            if (error) throw error;

            setStatusFeed({
                tipo: 'sucesso',
                texto: `Comunicado "${titulo.trim().toUpperCase()}" publicado com sucesso no portal!`
            });

            setTitulo('');
            setConteudo('');
            setImportante(false);

            // Recarrega a listagem de histórico em memória
            carregarAvisosEmitidos();
        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Falha ao salvar comunicado no servidor.' });
        } finally {
            setEnviando(false);
        }
    };

    const handleDeletarAviso = async (id: number) => {
        if (!confirm("Tem certeza que deseja remover este aviso do mural dos funcionários?")) return;

        try {
            const { error } = await supabase
                .from('avisos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setHistoricoAvisos(prev => prev.filter(aviso => aviso.id !== id));
        } catch (err) {
            console.error(err);
            alert("Falha ao remover o comunicado do servidor.");
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col justify-between w-full selection:bg-[#007aff]/10">
            <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-6">

                {/* CABEÇALHO */}
                <header className="space-y-1.5 pl-1 border-b border-[#e5e5ea] pb-6">
                    <Link href="/dashboard/rh" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#007aff] transition-colors block">
                        ← Dashboard de RH
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Central de Comunicados Internos
                    </h1>
                </header>

                {statusFeed.texto && (
                    <div className={`p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                        statusFeed.tipo === 'sucesso' ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]' : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                    }`}>
                        {statusFeed.texto}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start w-full">

                    {/* BLOCO 1: FORMULÁRIO DE LANÇAMENTO */}
                    <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4 md:col-span-1">
                        <div className="border-b border-[#f5f5f7] pb-3 select-none">
                            <span className="text-[9px] font-bold uppercase text-[#007aff] tracking-wider">Novo Alerta</span>
                            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mt-0.5">Criar Comunicado</h3>
                        </div>

                        <form onSubmit={handleDispararAviso} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Título do Aviso</label>
                                <input
                                    type="text"
                                    placeholder="EX: COMUNICADO — SÃO JOÃO"
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg text-xs font-bold uppercase outline-none text-[#1d1d1f]"
                                    required
                                    disabled={enviando}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Conteúdo / Mensagem</label>
                                <textarea
                                    placeholder="INFORME DETALHADAMENTE AS INSTRUÇÕES DE PÁTIO..."
                                    value={conteudo}
                                    onChange={e => setConteudo(e.target.value)}
                                    rows={5}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg text-xs font-bold uppercase outline-none text-[#1d1d1f] resize-none leading-relaxed"
                                    required
                                    disabled={enviando}
                                />
                            </div>

                            {/* FLAG DE RELEVÂNCIA LEGISLATIVA/URGENTE */}
                            <div className="flex items-center gap-2 bg-red-50/40 border border-red-100 p-3 rounded-xl select-none">
                                <input
                                    type="checkbox"
                                    id="marcarImportante"
                                    checked={importante}
                                    onChange={e => setImportante(e.target.checked)}
                                    className="w-3.5 h-3.5 accent-red-600 rounded cursor-pointer"
                                    disabled={enviando}
                                />
                                <label htmlFor="marcarImportante" className="text-[10px] font-bold uppercase tracking-wide text-red-700 cursor-pointer">
                                    🚨 Marcar como Urgente / Crítico
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={enviando}
                                className="w-full bg-[#1d1d1f] hover:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {enviando ? "Publicando no Pátio..." : "Disparar Comunicado"}
                            </button>
                        </form>
                    </div>

                    {/* BLOCO 2: HISTÓRICO DE AVISOS JÁ DISPARADOS */}
                    <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4 md:col-span-2 min-h-[400px]">
                        <div className="border-b border-[#f5f5f7] pb-3 select-none">
                            <span className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Histórico de Atividade</span>
                            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mt-0.5">Mural de Publicações Ativas</h3>
                        </div>

                        {carregando ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                                <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Buscando banco...</span>
                            </div>
                        ) : historicoAvisos.length === 0 ? (
                            <div className="py-20 text-center flex items-center justify-center border border-dashed border-[#e5e5ea] rounded-xl">
                                <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhum aviso ativo lançado por sua conta.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                                {historicoAvisos.map(aviso => (
                                    <div
                                        key={aviso.id}
                                        className={`p-4 border rounded-xl relative group flex justify-between gap-4 transition-all ${
                                            aviso.importante ? 'border-red-200 bg-red-50/[0.1]' : 'border-[#e5e5ea] bg-[#f5f5f7]/30'
                                        }`}
                                    >
                                        <div className="space-y-1.5 w-full">
                                            <div className="flex items-center gap-2">
                                                {aviso.importante && (
                                                    <span className="text-[7.5px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded tracking-wide">URGENTE</span>
                                                )}
                                                <h4 className="text-xs font-black uppercase text-[#1d1d1f] tracking-tight leading-tight">{aviso.titulo}</h4>
                                                <span className="font-mono text-[9px] font-bold text-[#86868b]">
                                                    • {new Date(aviso.criado_em).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-[#424245] font-medium leading-relaxed uppercase whitespace-pre-wrap">{aviso.conteudo}</p>
                                        </div>

                                        <div className="shrink-0 select-none">
                                            <button
                                                onClick={() => handleDeletarAviso(aviso.id)}
                                                className="bg-white border border-[#e5e5ea] hover:bg-red-50 hover:border-red-200 text-[#86868b] hover:text-red-600 p-2 rounded-lg transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                                                title="Remover do mural"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <footer className="w-full max-w-6xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 text-[8px] text-[#86868b] uppercase font-bold tracking-wider select-none">
                <div>GR Autopeças &amp; Serviços • Gerenciador de Mural v3.1</div>
            </footer>
        </main>
    );
}