"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import Barcode from 'react-barcode';

export const dynamic = 'force-dynamic';

interface Ferramenta {
    id: string;
    nome: string;
    status: string;
    foto_url: string | null;
}

export default function ListaFerramentasPage() {
    const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [modalImagem, setModalImagem] = useState<string | null>(null);

    // Controle de Paginação (15 itens por página)
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 15;

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarInventario() {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('ferramentas')
                .select('id, nome, status, foto_url')
                .order('nome');

            if (error) {
                console.error("Erro Supabase:", error.message, error.details, error.hint);
                throw error;
            }
            if (data) setFerramentas(data as Ferramenta[]);
        } catch (err) {
            console.error("Erro completo ao carregar inventário:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarInventario();
    }, []);

    // Reseta para a primeira página sempre que os filtros mudarem
    useEffect(() => {
        setPaginaAtual(1);
    }, [pesquisa, filtroStatus]);

    // Compressão ultra eficiente focada no tamanho do retângulo (Max 400px de largura)
    const processarEComprimirImagem = (arquivo: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(arquivo);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const TARGET_WIDTH = 400;
                    const TARGET_HEIGHT = 300;

                    canvas.width = TARGET_WIDTH;
                    canvas.height = TARGET_HEIGHT;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const imgRatio = img.width / img.height;
                        const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;
                        let sx = 0, sy = 0, sw = img.width, sh = img.height;

                        if (imgRatio > targetRatio) {
                            sw = img.height * targetRatio;
                            sx = (img.width - sw) / 2;
                        } else {
                            sh = img.width / targetRatio;
                            sy = (img.height - sh) / 2;
                        }

                        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
                    }

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error("Falha na conversão de mídia"));
                        },
                        "image/jpeg",
                        0.55
                    );
                };
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleUploadFoto = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const arquivoOriginal = e.target.files[0];

        setUploadingId(id);
        try {
            const imagemCompactadaBlob = await processarEComprimirImagem(arquivoOriginal);
            const nomeArquivo = `${id}-${Date.now()}.jpg`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('ferramentas')
                .upload(nomeArquivo, imagemCompactadaBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('ferramentas')
                .getPublicUrl(nomeArquivo);

            const { error: dbError } = await supabase
                .from('ferramentas')
                .update({ foto_url: publicUrl })
                .eq('id', id);

            if (dbError) throw dbError;

            setFerramentas(prev => prev.map(f => f.id === id ? { ...f, foto_url: publicUrl } : f));

        } catch (err) {
            console.error("Erro na rotina de mídia:", err);
            alert("Não foi possível salvar a imagem. Verifique a tabela no Supabase.");
        } finally {
            setUploadingId(null);
        }
    };

    // 1. Pesquisa global rodando por trás do inventário inteiro
    const ferramentasFiltradas = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        return ferramentas.filter(f => {
            const batePesquisa = f.nome.toLowerCase().includes(termo) || f.id.includes(termo);
            const bateStatus = filtroStatus === 'todos' || f.status === filtroStatus;
            return batePesquisa && bateStatus;
        });
    }, [ferramentas, pesquisa, filtroStatus]);

    // 2. Paginação em cima das ferramentas já tratadas pelos filtros
    const ferramentasPaginadas = useMemo(() => {
        const indiceInicial = (paginaAtual - 1) * itensPorPagina;
        const indiceFinal = indiceInicial + itensPorPagina;
        return ferramentasFiltradas.slice(indiceInicial, indiceFinal);
    }, [ferramentasFiltradas, paginaAtual]);

    // Cálculo total de páginas disponíveis pós-filtro
    const totalPaginas = useMemo(() => {
        return Math.ceil(ferramentasFiltradas.length / itensPorPagina) || 1;
    }, [ferramentasFiltradas]);

    const metricas = useMemo(() => {
        const total = ferramentas.length;
        const disponiveis = ferramentas.filter(f => f.status === 'disponivel').length;
        const ocupadas = ferramentas.filter(f => f.status === 'ocupado').length;
        return { total, disponiveis, ocupadas };
    }, [ferramentas]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-8 font-sans antialiased flex flex-col justify-between w-full selection:bg-black/5 print:bg-white print:p-0">

            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 print:hidden">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#e5e5ea] pb-5 pl-1">
                    <div className="space-y-0.5">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Menu Principal
                        </Link>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f]">
                            Inventário Geral de Ativos
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar ativo global..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-1.5 rounded-lg text-[#1d1d1f] text-xs font-medium outline-none w-full sm:w-56 uppercase transition-colors placeholder-[#b4b4b9]"
                        />

                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-2 py-1.5 rounded-lg text-xs font-semibold outline-none text-[#1d1d1f] transition-colors cursor-pointer"
                        >
                            <option value="todos">Todos os Status</option>
                            <option value="disponivel">Em Bancada</option>
                            <option value="ocupado">Em Uso</option>
                        </select>

                        <button
                            onClick={() => window.print()}
                            disabled={ferramentasFiltradas.length === 0}
                            className="bg-[#1d1d1f] active:bg-black text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)] text-center disabled:opacity-40"
                        >
                            🖨️ Etiquetas ({ferramentasFiltradas.length})
                        </button>
                    </div>
                </header>

                {/* METRICAS COMPACTAS */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-[#e5e5ea] p-2.5 rounded-xl text-center shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#86868b]">Total</p>
                        <p className="text-base font-mono font-black mt-0.5 text-[#1d1d1f]">{metricas.total}</p>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-2.5 rounded-xl text-center shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#248a3d]">Bancada</p>
                        <p className="text-base font-mono font-black mt-0.5 text-[#248a3d]">{metricas.disponiveis}</p>
                    </div>
                    <div className="bg-white border border-[#e5e5ea] p-2.5 rounded-xl text-center shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#ff9500]">Em Uso</p>
                        <p className="text-base font-mono font-black mt-0.5 text-[#ff9500]">{metricas.ocupadas}</p>
                    </div>
                </div>

                {/* CRIAÇÃO DA GRADE PAGINADA */}
                {carregando ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                        <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[9px] uppercase font-bold tracking-wider font-mono">Processando catálogo denso...</span>
                    </div>
                ) : ferramentasFiltradas.length === 0 ? (
                    <div className="py-24 text-center bg-white border border-[#e5e5ea] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
                        <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhum ativo localizado.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {ferramentasPaginadas.map(f => (
                                <div
                                    key={f.id}
                                    className="bg-white border border-[#e5e5ea] rounded-xl overflow-hidden flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.002)] hover:border-[#b4b4b9] transition-colors"
                                >
                                    {/* REQUADRO FIXO DA FOTO */}
                                    <div
                                        className="relative bg-[#f5f5f7] w-full border-b border-[#e5e5ea] flex items-center justify-center overflow-hidden group/img"
                                        style={{ aspectRatio: '4/3' }}
                                    >
                                        {f.foto_url ? (
                                            <>
                                                <img
                                                    src={f.foto_url}
                                                    alt={f.nome}
                                                    className="w-full h-full object-cover transition-transform duration-200 group-hover/img:scale-105"
                                                />
                                                <div
                                                    onClick={() => setModalImagem(f.foto_url)}
                                                    className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity cursor-zoom-in text-sm select-none"
                                                >
                                                    🔍
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xl opacity-20 select-none">📷</div>
                                        )}

                                        <div className="absolute top-1.5 right-1.5 select-none">
                                            <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm ${
                                                f.status === 'disponivel' ? 'bg-[#34c759] text-white' : 'bg-[#ff9500] text-white'
                                            }`}>
                                                {f.status === 'disponivel' ? 'OK' : 'USO'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* METADADOS */}
                                    <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-mono font-bold text-[#ff9500] tracking-wider uppercase">
                                                #{f.id}
                                            </div>
                                            <h3 className="text-[11px] font-bold text-[#1d1d1f] uppercase tracking-tight line-clamp-2 min-h-[28px] leading-tight" title={f.nome}>
                                                {f.nome}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-1.5 border-t border-[#f5f5f7] pt-2 shrink-0">
                                            <label className={`text-[8px] py-1 rounded font-bold uppercase tracking-wider border cursor-pointer transition-colors text-center select-none ${
                                                uploadingId === f.id
                                                    ? 'bg-[#f5f5f7] text-[#b4b4b9] border-[#e5e5ea] cursor-wait'
                                                    : 'bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f] border-[#e5e5ea]'
                                            }`}>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png"
                                                    className="hidden"
                                                    disabled={uploadingId !== null}
                                                    onChange={(e) => handleUploadFoto(f.id, e)}
                                                />
                                                {uploadingId === f.id ? 'Salva...' : f.foto_url ? 'Mudar' : 'Foto'}
                                            </label>

                                            <button
                                                onClick={() => {
                                                    setPesquisa(f.id);
                                                    setTimeout(() => window.print(), 100);
                                                }}
                                                className="text-[8px] bg-[#1d1d1f] hover:bg-black text-white py-1 rounded font-bold uppercase tracking-wider transition-colors text-center"
                                            >
                                                Etiqueta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* SELETOR DE PÁGINAS MINIMALISTA (SETINHAS) */}
                        <div className="flex items-center justify-center gap-4 border-t border-[#e5e5ea] pt-6 mt-2 select-none">
                            <button
                                onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                                disabled={paginaAtual === 1}
                                className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] disabled:opacity-30 disabled:hover:border-[#e5e5ea] px-3 py-1.5 rounded-lg text-xs font-bold text-[#1d1d1f] transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                ◀ Anterior
                            </button>

                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">
                                Página <strong className="text-[#1d1d1f]">{paginaAtual}</strong> de <strong className="text-[#1d1d1f]">{totalPaginas}</strong>
                            </span>

                            <button
                                onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                                disabled={paginaAtual === totalPaginas}
                                className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] disabled:opacity-30 disabled:hover:border-[#e5e5ea] px-3 py-1.5 rounded-lg text-xs font-bold text-[#1d1d1f] transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                Próxima ▶
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* MODAL LIGHTBOX */}
            {modalImagem && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setModalImagem(null)}
                >
                    <div className="bg-white p-2 rounded-xl max-w-sm w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <img src={modalImagem} alt="Visualização" className="w-full h-auto rounded-lg object-contain max-h-[60vh]" />
                        <button
                            onClick={() => setModalImagem(null)}
                            className="mt-2.5 w-full py-1.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors"
                        >
                            Fechar Visualização
                        </button>
                    </div>
                </div>
            )}

            {/* ÁREA EXCLUSIVA DE IMPRESSÃO (Imprime todos os filtrados na paginação) */}
            <div className="hidden print:block w-full">
                <div className="grid grid-cols-2 gap-6 p-4">
                    {ferramentasFiltradas.map(f => (
                        <div key={f.id} className="border-2 border-black p-4 rounded-xl flex flex-col items-center justify-center text-center bg-white break-inside-avoid" style={{ minHeight: '160px', pageBreakInside: 'avoid' }}>
                            <h2 className="text-xs font-black uppercase text-black tracking-tight mb-2 max-w-[240px] leading-tight break-words">
                                {f.nome}
                            </h2>
                            <div className="flex items-center justify-center">
                                <Barcode value={f.id} format="CODE128" width={2.2} height={55} displayValue={true} font="monospace" fontSize={12} textMargin={4} background="#ffffff" lineColor="#000000" />
                            </div>
                            <p className="text-[7px] font-bold text-black uppercase tracking-widest mt-2">GR ALMOXARIFADO CENTRAL</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between text-[7px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left print:hidden select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Almoxarifado Central v3.2</div>
            </footer>
        </main>
    );
}