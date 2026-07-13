"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Funcionario { id: string; nome: string; sobrenome: string; cargo: string; }
interface MaletaFoto { id: string; foto_url: string; }
interface MaletaItem { id?: string; nome: string; quantidade: number; status?: string; _deletado?: boolean; }

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
                // 1. Traz funcionários
                const { data: funcs } = await supabase.from('funcionarios').select('id, nome, sobrenome, cargo').order('nome');
                if (funcs) setFuncionarios(funcs as Funcionario[]);

                // 2. Traz a Maleta
                const { data: maleta, error: errMaleta } = await supabase.from('maletas').select('*').eq('id', id).single();
                if (errMaleta) throw errMaleta;

                setMecanicoId(maleta.mecanico_id);
                setIdentificacao(maleta.identificacao);
                setObservacoes(maleta.observacoes || '');
                setFotoPrincipalAtual(maleta.foto_url);

                // 3. Traz os Itens
                const { data: itensDb } = await supabase.from('maleta_itens').select('*').eq('maleta_id', id).order('nome');
                if (itensDb) setItens(itensDb.map(i => ({ id: i.id, nome: i.nome, quantidade: i.quantidade, status: i.status })));

                // 4. Traz as Fotos Extras
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
        setItens([{ nome: nomeItemTemp.trim(), quantidade: qtdItemTemp, status: 'ok' }, ...itens]);
        setNomeItemTemp('');
        setQtdItemTemp(1);
    };

    const handleMarcarRemocaoItem = (index: number) => {
        const novaLista = [...itens];
        if (novaLista[index].id) {
            // Se já existe no banco, marca para deletar no salvamento final
            novaLista[index]._deletado = true;
        } else {
            // Se foi recém adicionado (ainda não salvou), só tira do array
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

    // UPLOAD HELPER
    const fazerUpload = async (arquivo: File) => {
        const extensao = arquivo.name.split('.').pop();
        const nomeArquivo = `${Date.now()}_${Math.floor(Math.random() * 10000)}.${extensao}`;
        const { error } = await supabase.storage.from('maletas').upload(nomeArquivo, arquivo);
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

            // 1. Atualiza foto principal se houver nova
            if (novaFotoPrincipal) {
                urlPrincipalFinal = await fazerUpload(novaFotoPrincipal);
            }

            // 2. Atualiza dados principais da Maleta
            const { error: errMaleta } = await supabase.from('maletas').update({
                mecanico_id: mecanicoId,
                identificacao: identificacao.trim(),
                observacoes: observacoes.trim() || null,
                foto_url: urlPrincipalFinal
            }).eq('id', id);
            if (errMaleta) throw errMaleta;

            // 3. Deleta fotos extras removidas
            if (fotosParaDeletar.length > 0) {
                await supabase.from('maleta_fotos').delete().in('id', fotosParaDeletar);
            }

            // 4. Sobe novas fotos extras
            if (novasFotosExtras.length > 0) {
                for (const foto of novasFotosExtras) {
                    const urlExtra = await fazerUpload(foto);
                    await supabase.from('maleta_fotos').insert([{ maleta_id: id, foto_url: urlExtra }]);
                }
            }

            // 5. Atualiza o Inventário (Itens)
            for (const item of itens) {
                if (item._deletado && item.id) {
                    // Item deletado
                    await supabase.from('maleta_itens').delete().eq('id', item.id);
                } else if (!item.id && !item._deletado) {
                    // Item novo
                    await supabase.from('maleta_itens').insert([{ maleta_id: id, nome: item.nome, quantidade: item.quantidade, status: 'ok' }]);
                } else if (item.id && !item._deletado) {
                    // Atualizar item existente (nome ou quantidade)
                    await supabase.from('maleta_itens').update({ nome: item.nome, quantidade: item.quantidade }).eq('id', item.id);
                }
            }

            alert("Maleta atualizada com sucesso!");
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

                        {/* SEÇÃO 2: INVENTÁRIO (ADICIONAR/REMOVER) */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest border-b border-[#f5f5f7] pb-2">2. Atualizar Inventário ({itensAtivos.length} Itens)</h3>
                            <div className="bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-4 space-y-4">

                                {/* Barra de Adicionar */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Nova Ferramenta</label>
                                        <input type="text" placeholder="Ex: Alicate de Pressão" value={nomeItemTemp} onChange={e => setNomeItemTemp(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdicionarItem())} className="w-full bg-white border border-[#e5e5ea] px-3 py-2 rounded-lg text-xs font-bold text-[#1d1d1f] outline-none" />
                                    </div>
                                    <div className="w-full sm:w-24 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Qtd.</label>
                                        <input type="number" min="1" value={qtdItemTemp} onChange={e => setQtdItemTemp(Number(e.target.value))} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdicionarItem())} className="w-full bg-white border border-[#e5e5ea] px-3 py-2 rounded-lg text-xs font-mono font-bold text-center text-[#1d1d1f] outline-none" />
                                    </div>
                                    <div className="flex items-end">
                                        <button type="button" onClick={handleAdicionarItem} className="w-full sm:w-auto bg-[#1d1d1f] hover:bg-black text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors h-[34px]">Incluir</button>
                                    </div>
                                </div>

                                {/* Lista de Itens Editáveis */}
                                {itensAtivos.length > 0 && (
                                    <div className="border-t border-[#e5e5ea] pt-3">
                                        <ul className="space-y-2">
                                            {itens.map((item, idx) => !item._deletado && (
                                                <li key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white border border-[#e5e5ea] px-4 py-2.5 rounded-lg text-xs">
                                                    <div className="flex-1 font-bold text-[#1d1d1f] uppercase">{item.nome}</div>
                                                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold text-[#86868b] uppercase">Qtd:</span>
                                                            <input type="number" min="1" value={item.quantidade} onChange={(e) => handleAtualizarQtdItem(idx, Number(e.target.value))} className="w-16 bg-[#f5f5f7] border border-[#e5e5ea] text-center py-1 rounded font-mono font-black text-[#007aff] outline-none" />
                                                        </div>
                                                        <button type="button" onClick={() => handleMarcarRemocaoItem(idx)} className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase tracking-wider transition-colors">Remover</button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEÇÃO 3: GALERIA DE FOTOS */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest border-b border-[#f5f5f7] pb-2">3. Galeria e Fotos de Apoio</h3>

                            {/* Trocar Foto Principal */}
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

                            {/* Fotos Adicionais */}
                            <div className="space-y-2 pt-4 border-t border-[#f5f5f7]">
                                <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Fotos Adicionais (Detalhes e Avarias)</label>
                                <input type="file" accept="image/*" multiple onChange={e => setNovasFotosExtras(Array.from(e.target.files || []))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#f5f5f7] file:text-[#1d1d1f] hover:file:bg-[#e8e8ed] cursor-pointer text-[#86868b] font-medium block mb-4" />

                                {/* Grid de Miniaturas Extras (Atuais + Novas) */}
                                <div className="flex flex-wrap gap-4">
                                    {/* Fotos Extras Já Salvas no Banco */}
                                    {fotosExtrasAtuais.filter(f => !fotosParaDeletar.includes(f.id)).map(foto => (
                                        <div key={foto.id} className="relative w-24 h-24 bg-white border border-[#e5e5ea] rounded-xl overflow-hidden group shadow-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={foto.foto_url} alt="Extra" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setFotosParaDeletar([...fotosParaDeletar, foto.id])} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm">Excluir</button>
                                        </div>
                                    ))}

                                    {/* Novas Fotos Selecionadas para Subir */}
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