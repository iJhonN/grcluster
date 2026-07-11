"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
}

interface ItemMaleta {
    nome: string;
    quantidade: number;
}

export default function CadastroMaletaPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

    // Estados do Formulário da Maleta
    const [mecanicoId, setMecanicoId] = useState('');
    const [identificacao, setIdentificacao] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);

    // Estados da Lista de Ferramentas (Inventário da Maleta)
    const [itens, setItens] = useState<ItemMaleta[]>([]);
    const [nomeItemTemp, setNomeItemTemp] = useState('');
    const [qtdItemTemp, setQtdItemTemp] = useState(1);

    const [salvando, setSalvando] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const carregarMecanicos = async () => {
            const { data } = await supabase
                .from('funcionarios')
                .select('id, nome, sobrenome, cargo')
                .order('nome');

            if (data) setFuncionarios(data as Funcionario[]);
        };
        carregarMecanicos();
    }, [supabase]);

    const handleAdicionarItem = () => {
        if (!nomeItemTemp.trim() || qtdItemTemp < 1) return;

        setItens([...itens, { nome: nomeItemTemp.trim(), quantidade: qtdItemTemp }]);
        setNomeItemTemp('');
        setQtdItemTemp(1);
    };

    const handleRemoverItem = (index: number) => {
        const novaLista = [...itens];
        novaLista.splice(index, 1);
        setItens(novaLista);
    };

    const handleSalvarMaleta = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mecanicoId || !identificacao) {
            alert("Preencha a identificação e selecione um mecânico.");
            return;
        }

        setSalvando(true);
        try {
            let foto_url = null;

            // 1. Upload da Foto
            if (fotoArquivo) {
                const extensao = fotoArquivo.name.split('.').pop();
                const nomeArquivo = `${Date.now()}_${Math.floor(Math.random() * 10000)}.${extensao}`;

                const { error: erroUpload } = await supabase.storage
                    .from('maletas')
                    .upload(nomeArquivo, fotoArquivo);

                if (erroUpload) throw new Error("Erro ao enviar a imagem da maleta.");

                const { data: urlData } = supabase.storage.from('maletas').getPublicUrl(nomeArquivo);
                foto_url = urlData.publicUrl;
            }

            // 2. Salva a Maleta e retorna o ID gerado
            const { data: maletaSalva, error: erroInsert } = await supabase
                .from('maletas')
                .insert([{
                    mecanico_id: mecanicoId,
                    identificacao: identificacao.trim(),
                    observacoes: observacoes.trim() || null,
                    foto_url: foto_url
                }])
                .select()
                .single();

            if (erroInsert) throw erroInsert;

            // 3. Salva os Itens (Ferramentas) vinculados à Maleta
            if (itens.length > 0 && maletaSalva) {
                const itensPayload = itens.map(item => ({
                    maleta_id: maletaSalva.id,
                    nome: item.nome,
                    quantidade: item.quantidade
                }));

                const { error: erroItens } = await supabase.from('maleta_itens').insert(itensPayload);
                if (erroItens) throw erroItens;
            }

            alert("Maleta e inventário cadastrados com sucesso!");
            router.push('/dashboard/ferramentas/maletas');

        } catch (error: any) {
            console.error("Erro no cadastro:", error);
            alert(error.message || "Ocorreu um erro ao salvar o registro.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col items-center">

            <div className="w-full max-w-3xl mt-4 sm:mt-10">
                <header className="mb-8">
                    <Link href="/dashboard/ferramentas/maletas" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block mb-1">
                        ← Voltar para Lista
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Cadastrar Nova Maleta
                    </h1>
                </header>

                <div className="bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
                    <form onSubmit={handleSalvarMaleta} className="p-6 sm:p-8 space-y-8">

                        {/* SEÇÃO 1: DADOS GERAIS */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest border-b border-[#f5f5f7] pb-2">1. Dados do Kit</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Mecânico Responsável *</label>
                                    <select
                                        value={mecanicoId}
                                        onChange={e => setMecanicoId(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1d1d1f] outline-none appearance-none"
                                        required
                                    >
                                        <option value="">Selecione um colaborador...</option>
                                        {funcionarios.map(f => (
                                            <option key={f.id} value={f.id}>{f.nome} {f.sobrenome} - {f.cargo}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Identificação da Maleta *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Maleta Linha Leve 01"
                                        value={identificacao}
                                        onChange={e => setIdentificacao(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1d1d1f] outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO 2: INVENTÁRIO (FERRAMENTAS) */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest border-b border-[#f5f5f7] pb-2">2. Inventário da Maleta</h3>

                            <div className="bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-4 space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Ferramenta</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Chave Combinada 10mm"
                                            value={nomeItemTemp}
                                            onChange={e => setNomeItemTemp(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdicionarItem())}
                                            className="w-full bg-white border border-[#e5e5ea] px-3 py-2 rounded-lg text-xs font-bold text-[#1d1d1f] outline-none"
                                        />
                                    </div>
                                    <div className="w-full sm:w-24 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Qtd.</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={qtdItemTemp}
                                            onChange={e => setQtdItemTemp(Number(e.target.value))}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdicionarItem())}
                                            className="w-full bg-white border border-[#e5e5ea] px-3 py-2 rounded-lg text-xs font-mono font-bold text-center text-[#1d1d1f] outline-none"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={handleAdicionarItem}
                                            className="w-full sm:w-auto bg-[#1d1d1f] hover:bg-black text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors h-[34px]"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>

                                {itens.length > 0 && (
                                    <div className="border-t border-[#e5e5ea] pt-3">
                                        <ul className="space-y-2">
                                            {itens.map((item, idx) => (
                                                <li key={idx} className="flex justify-between items-center bg-white border border-[#e5e5ea] px-3 py-2 rounded-lg text-xs">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono font-black text-[#007aff] bg-blue-50 px-1.5 py-0.5 rounded">{item.quantidade}x</span>
                                                        <span className="font-bold text-[#1d1d1f] uppercase">{item.nome}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoverItem(idx)}
                                                        className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase tracking-wider transition-colors"
                                                    >
                                                        Remover
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEÇÃO 3: FOTO E OBSERVAÇÕES */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest border-b border-[#f5f5f7] pb-2">3. Detalhes Adicionais</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Observações Gerais</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Condição da maleta, avarias, etc..."
                                        value={observacoes}
                                        onChange={e => setObservacoes(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-3 rounded-xl text-sm font-medium text-[#1d1d1f] outline-none resize-none leading-relaxed h-[112px]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Anexar Foto da Maleta</label>
                                    <div className="w-full border-2 border-dashed border-[#d1d1d6] bg-[#f5f5f7]/50 rounded-xl flex items-center justify-center text-center hover:bg-[#f5f5f7] transition-colors relative h-[112px]">
                                        <input
                                            type="file" accept="image/*"
                                            onChange={e => setFotoArquivo(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="space-y-1 pointer-events-none px-4">
                                            <span className="text-xl block">📸</span>
                                            {fotoArquivo ? (
                                                <p className="text-[10px] font-bold text-[#34c759] truncate w-full px-2">{fotoArquivo.name}</p>
                                            ) : (
                                                <p className="text-[10px] font-semibold text-[#86868b]">Clique ou arraste uma imagem aqui</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="pt-6 border-t border-[#e5e5ea] flex items-center justify-end gap-3">
                            <Link
                                href="/dashboard/ferramentas/maletas"
                                className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={salvando}
                                className="bg-[#1d1d1f] active:bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
                            >
                                {salvando ? 'Processando...' : 'Salvar Registro Completo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}