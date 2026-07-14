"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Funcionario { id: string; nome: string; sobrenome: string; cargo: string; }
interface MaletaFoto { id: string; foto_url: string; }

// Interface atualizada para conter informações da foto da ferramenta
interface MaletaItem {
    id?: string;
    nome: string;
    quantidade: number;
    status?: string;
    foto_url?: string | null;
    fotoArquivo?: File | null; // Caso o usuário escolha uma nova foto
    fotoPreview?: string;      // Pré-visualização local antes de salvar
    _deletado?: boolean;
}

// FUNÇÃO NATIVA PARA COMPRIMIR A IMAGEM NO NAVEGADOR ANTES DO UPLOAD
const comprimirImagem = (file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error('Erro ao gerar blob da imagem comprimida.'));
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export default function EditarMaletaPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

    // Estados do Formulário
    const [mecanicoId, setMecanicoId] = useState('');
    const [identificacao, setIdentificacao] = useState('');
    const [observacoes, setObservacoes] = useState('');

    // Fotos
    const [fotoPrincipalAtual, setFotoPrincipalAtual] = useState<string | null>(null);
    const [novaFotoPrincipal, setNovaFotoPrincipal] = useState<File | null>(null);
    const [fotosExtrasAtuais, setFotosExtrasAtuais] = useState<MaletaFoto[]>([]);
    const [novasFotosExtras, setNovasFotosExtras] = useState<File[]>([]);
    const [fotosParaDeletar, setFotosParaDeletar] = useState<string[]>([]);

    // Inventário
    const [itens, setItens] = useState<MaletaItem[]>([]);
    const [nomeItemTemp, setNomeItemTemp] = useState('');
    const [qtdItemTemp, setQtdItemTemp] = useState(1);
    const [fotoItemTemp, setFotoItemTemp] = useState<File | null>(null); // Foto para o novo item

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // CARREGA OS DADOS DA MALETA E DOS FUNCIONÁRIOS
    useEffect(() => {
        if (!id) return;
        const inicializar = async () => {
            try {
                const { data: funcs } = await supabase.from('funcionarios').select('id, nome, sobrenome, cargo').order('nome');
                if (funcs) setFuncionarios(funcs as Funcionario[]);

                const { data: maleta, error: errMaleta } = await supabase.from('maletas').select('*').eq('id', id).single();
                if (errMaleta) throw errMaleta;

                setMecanicoId(maleta.mecanico_id);
                setIdentificacao(maleta.identificacao);
                setObservacoes(maleta.observacoes || '');
                setFotoPrincipalAtual(maleta.foto_url);

                const { data: itensDb } = await supabase.from('maleta_itens').select('*').eq('maleta_id', id).order('nome');
                if (itensDb) {
                    setItens(itensDb.map(i => ({
                        id: i.id,
                        nome: i.nome,
                        quantidade: i.quantidade,
                        status: i.status,
                        foto_url: i.foto_url
                    })));
                }

                const { data: fotosDb } = await supabase.from('maleta_fotos').select('*').eq('maleta_id', id);
                if (fotosDb) setFotosExtrasAtuais(fotosDb as MaletaFoto[]);

            } catch (error) {
                console.error(error);
                alert("Erro ao carregar dados da maleta.");
                router.push('/dashboard/ferramentas/maletas');
            } finally {
                setCarregando(false);
            }
        };
        inicializar();
    }, [id, supabase, router]);

    // FUNÇÕES DE INVENTÁRIO
    const handleAdicionarItem = () => {
        if (!nomeItemTemp.trim() || qtdItemTemp < 1) return;

        const preview = fotoItemTemp ? URL.createObjectURL(fotoItemTemp) : undefined;

        setItens([
            {
                nome: nomeItemTemp.trim(),
                quantidade: qtdItemTemp,
                status: 'ok',
                fotoArquivo: fotoItemTemp,
                fotoPreview: preview
            },
            ...itens
        ]);

        setNomeItemTemp('');
        setQtdItemTemp(1);
        setFotoItemTemp(null);
    };

    const handleMarcarRemocaoItem = (index: number) => {
        const novaLista = [...itens];
        if (novaLista[index].id) {
            novaLista[index]._deletado = true;
        } else {
            novaLista.splice(index, 1);
        }
        setItens(novaLista);
    };

    const handleAtualizarQtdItem = (index: number, novaQtd: number) => {
        if (novaQtd < 1) return;
        const novaLista = [...itens];
        novaLista[index].quantidade = novaQtd;
        setItens(novaLista);
    };

    // Alterar foto de um item que já existe na lista
    const handleAlterarFotoItemExistente = (index: number, arquivo: File) => {
        const novaLista = [...itens];
        novaLista[index].fotoArquivo = arquivo;
        novaLista[index].fotoPreview = URL.createObjectURL(arquivo);
        setItens(novaLista);
    };

    // UPLOAD HELPER COM COMPRESSÃO INTEGRADA
    const fazerUpload = async (arquivoOriginal: File, prefixo = 'img') => {
        const arquivoComprimido = await comprimirImagem(arquivoOriginal);
        const nomeArquivo = `${prefixo}_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
        const { error } = await supabase.storage.from('maletas').upload(nomeArquivo, arquivoComprimido);
        if (error) throw error;
        const { data } = supabase.storage.from('maletas').getPublicUrl(nomeArquivo);
        return data.publicUrl;
    };

    // SALVAR TUDO
    const handleSalvarEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mecanicoId || !identificacao) return alert("Preencha identificação e mecânico.");

        setSalvando(true);
        try {
            let urlPrincipalFinal = fotoPrincipalAtual;

            if (novaFotoPrincipal) {
                urlPrincipalFinal = await fazerUpload(novaFotoPrincipal, 'capa');
            }

            const { error: errMaleta } = await supabase.from('maletas').update({
                mecanico_id: mecanicoId,
                identificacao: identificacao.trim(),
                observacoes: observacoes.trim() || null,
                foto_url: urlPrincipalFinal
            }).eq('id', id);
            if (errMaleta) throw errMaleta;

            if (fotosParaDeletar.length > 0) {
                await supabase.from('maleta_fotos').delete().in('id', fotosParaDeletar);
            }

            if (novasFotosExtras.length > 0) {
                for (const foto of novasFotosExtras) {
                    const urlExtra = await fazerUpload(foto, 'extra');
                    await supabase.from('maleta_fotos').insert([{ maleta_id: id, foto_url: urlExtra }]);
                }
            }

            // Atualização do Inventário com suporte a uploads individuais por ferramenta
            for (const item of itens) {
                if (item._deletado && item.id) {
                    await supabase.from('maleta_itens').delete().eq('id', item.id);
                } else if (!item.id && !item._deletado) {
                    // Item inteiramente novo
                    let itemFotoUrl = null;
                    if (item.fotoArquivo) {
                        itemFotoUrl = await fazerUpload(item.fotoArquivo, 'item');
                    }
                    await supabase.from('maleta_itens').insert([{
                        maleta_id: id,
                        nome: item.nome,
                        quantidade: item.quantidade,
                        status: 'ok',
                        foto_url: itemFotoUrl
                    }]);
                } else if (item.id && !item._deletado) {
                    // Item existente sendo atualizado (pode conter nova foto ou alteração de texto/quantidade)
                    let itemFotoUrl = item.foto_url;
                    if (item.fotoArquivo) {
                        itemFotoUrl = await fazerUpload(item.fotoArquivo, 'item');
                    }
                    await supabase.from('maleta_itens').update({
                        nome: item.nome,
                        quantidade: item.quantidade,
                        foto_url: itemFotoUrl
                    }).eq('id', item.id);
                }
            }

            alert("Maleta e inventário atualizados com sucesso!");
            router.push(`/dashboard/ferramentas/maletas/${id}`);

        } catch (error: any) {
            console.error(error);
            alert("Erro ao salvar as edições da maleta.");
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) {
        return (
            <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center font-sans">
                <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
            </main>
        );
    }

    const itensAtivos = itens.filter(i => !i._deletado);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col items-center">

            <div className="w-full max-w-4xl mt-4 sm:mt-8">
                <header className="mb-8">
                    <Link href={`/dashboard/ferramentas/maletas/${id}`} className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block mb-1">
                        ← Voltar para Checklist
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Editar Maleta
                    </h1>
                </header>

                <div className="bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
                    <form onSubmit={handleSalvarEdicao} className="p-6 sm:p-8 space-y-10">

                        {/* SEÇÃO 1: DADOS GERAIS */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest border-b border-[#f5f5f7] pb-2">1. Informações Básicas</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Mecânico Responsável</label>
                                    <select value={mecanicoId} onChange={e => setMecanicoId(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1d1d1f] outline-none" required>
                                        <option value="">Selecione...</option>
                                        {funcionarios.map(f => (
                                            <option key={f.id} value={f.id}>{f.nome} {f.sobrenome} - {f.cargo}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Identificação</label>
                                    <input type="text" value={identificacao} onChange={e => setIdentificacao(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1d1d1f] outline-none" required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Observações Gerais</label>
                                <textarea rows={3} value={observacoes} onChange={e => setObservacoes(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-3 rounded-xl text-sm font-medium text-[#1d1d1f] outline-none resize-none" />
                            </div>
                        </div>

                        {/* SEÇÃO 2: INVENTÁRIO COM ADIÇÃO E EDIÇÃO DE FOTO POR ITEM */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest border-b border-[#f5f5f7] pb-2">2. Atualizar Inventário ({itensAtivos.length} Itens)</h3>
                            <div className="bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-4 space-y-4">

                                {/* Barra para criar novo Item com foto */}
                                <div className="flex flex-col sm:flex-row items-end gap-3">
                                    <div className="w-full sm:w-auto">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5 block mb-1">Foto Item</label>
                                        <div className="w-full sm:w-12 h-10 bg-white border border-[#e5e5ea] rounded-lg relative flex items-center justify-center overflow-hidden hover:bg-[#e8e8ed] transition-colors cursor-pointer group shadow-sm">
                                            {fotoItemTemp ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={URL.createObjectURL(fotoItemTemp)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm opacity-60 group-hover:opacity-100">📸</span>
                                            )}
                                            <input type="file" accept="image/*" onChange={e => setFotoItemTemp(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5 block mb-1">Nova Ferramenta</label>
                                        <input type="text" placeholder="Ex: Alicate de Pressão" value={nomeItemTemp} onChange={e => setNomeItemTemp(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdicionarItem())} className="w-full bg-white border border-[#e5e5ea] px-3 h-10 rounded-lg text-xs font-bold text-[#1d1d1f] outline-none shadow-sm" />
                                    </div>
                                    <div className="w-full sm:w-24">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5 block mb-1">Qtd.</label>
                                        <input type="number" min="1" value={qtdItemTemp} onChange={e => setQtdItemTemp(Number(e.target.value))} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdicionarItem())} className="w-full bg-white border border-[#e5e5ea] px-3 h-10 rounded-lg text-xs font-mono font-bold text-center text-[#1d1d1f] outline-none shadow-sm" />
                                    </div>
                                    <button type="button" onClick={handleAdicionarItem} className="w-full sm:w-auto bg-[#1d1d1f] hover:bg-black text-white px-5 h-10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm">Incluir</button>
                                </div>

                                {/* Lista de Ferramentas Ativas para Edição de Quantidade e Imagem */}
                                {itensAtivos.length > 0 && (
                                    <div className="border-t border-[#e5e5ea] pt-3">
                                        <ul className="space-y-2">
                                            {itens.map((item, idx) => !item._deletado && (
                                                <li key={idx} className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white border border-[#e5e5ea] p-2.5 rounded-lg text-xs shadow-sm">

                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        {/* Preview ou alteração da foto individual do item cadastrado */}
                                                        <div className="w-12 h-12 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl overflow-hidden flex items-center justify-center shrink-0 relative hover:opacity-80 transition-opacity cursor-pointer group">
                                                            {item.fotoPreview ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={item.fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                            ) : item.foto_url ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={item.foto_url} alt={item.nome} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs opacity-40 group-hover:hidden">📸</span>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 text-[8px] text-white font-bold opacity-0 group-hover:flex items-center justify-center text-center uppercase p-0.5 leading-tight">Trocar</div>
                                                            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleAlterarFotoItemExistente(idx, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                        </div>
                                                        <div className="font-bold text-[#1d1d1f] uppercase truncate">{item.nome}</div>
                                                    </div>

                                                    <div className="flex items-center gap-4 justify-between md:justify-end shrink-0 w-full md:w-auto border-t md:border-0 pt-2 md:pt-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold text-[#86868b] uppercase">Qtd:</span>
                                                            <input type="number" min="1" value={item.quantidade} onChange={(e) => handleAtualizarQtdItem(idx, Number(e.target.value))} className="w-16 bg-[#f5f5f7] border border-[#e5e5ea] text-center py-1 rounded font-mono font-black text-[#007aff] outline-none" />
                                                        </div>
                                                        <button type="button" onClick={() => handleMarcarRemocaoItem(idx)} className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase tracking-wider transition-colors px-2 py-1">Remover</button>
                                                    </div>

                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEÇÃO 3: GALERIA DE FOTOS EXTERNAS */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest border-b border-[#f5f5f7] pb-2">3. Galeria e Fotos de Apoio (Maleta)</h3>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Substituir Foto Principal (Capa)</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                        {novaFotoPrincipal ? (
                                            <span className="text-[9px] font-bold text-[#34c759] text-center px-1">Nova Capa Pronta</span>
                                        ) : fotoPrincipalAtual ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={fotoPrincipalAtual} alt="Capa" className="w-full h-full object-cover" />
                                        ) : <span className="text-xl opacity-30">🧰</span>}
                                    </div>
                                    <input type="file" accept="image/*" onChange={e => setNovaFotoPrincipal(e.target.files?.[0] || null)} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#1d1d1f] file:text-white hover:file:bg-black cursor-pointer text-[#86868b] font-medium" />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-[#f5f5f7]">
                                <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Fotos Adicionais (Detalhes da Caixa)</label>
                                <input type="file" accept="image/*" multiple onChange={e => setNovasFotosExtras(Array.from(e.target.files || []))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#f5f5f7] file:text-[#1d1d1f] hover:file:bg-[#e8e8ed] cursor-pointer text-[#86868b] font-medium block mb-4" />

                                <div className="flex flex-wrap gap-4">
                                    {fotosExtrasAtuais.filter(f => !fotosParaDeletar.includes(f.id)).map(foto => (
                                        <div key={foto.id} className="relative w-24 h-24 bg-white border border-[#e5e5ea] rounded-xl overflow-hidden group shadow-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={foto.foto_url} alt="Extra" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setFotosParaDeletar([...fotosParaDeletar, foto.id])} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm">Excluir</button>
                                        </div>
                                    ))}

                                    {novasFotosExtras.map((file, idx) => (
                                        <div key={idx} className="relative w-24 h-24 bg-[#34c759]/10 border border-[#34c759]/30 rounded-xl flex flex-col items-center justify-center p-2 text-center shadow-sm">
                                            <span className="text-xl">📸</span>
                                            <span className="text-[8px] font-bold text-[#248a3d] truncate w-full mt-1">A Enviar</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="pt-6 border-t border-[#e5e5ea] flex items-center justify-end gap-3">
                            <Link href={`/dashboard/ferramentas/maletas/${id}`} className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">Cancelar</Link>
                            <button type="submit" disabled={salvando} className="bg-[#1d1d1f] active:bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md">
                                {salvando ? 'Salvando Alterações...' : 'Confirmar Edições'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
    );
}