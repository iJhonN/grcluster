"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
}

interface Atestado {
    id: string;
    funcionario_id: string;
    data_emissao: string;
    data_inicio: string;
    data_fim: string;
    quantidade_dias: number;
    cid: string | null;
    justificativa: string;
    arquivos: string[] | null; // Agora é um array de strings
    funcionarios: {
        nome: string;
        sobrenome: string;
        cargo: string;
    } | null;
}

export default function ControleAtestadosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [atestados, setAtestados] = useState<Atestado[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    // Estados do Formulário
    const [funcionarioId, setFuncionarioId] = useState('');
    const [dataEmissao, setDataEmissao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [cid, setCid] = useState('');
    const [justificativa, setJustificativa] = useState('');

    // Novo estado para lista de arquivos
    const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);

    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarDados() {
        setCarregando(true);
        try {
            const [resFunc, resAtestados] = await Promise.all([
                supabase.from('funcionarios').select('id, nome, sobrenome, cargo').order('nome'),
                // Seleciona a nova coluna 'arquivos'
                supabase.from('atestados_medicos').select('*, funcionarios(nome, sobrenome, cargo)').order('criado_em', { ascending: false })
            ]);

            if (resFunc.data) setFuncionarios(resFunc.data);
            if (resAtestados.data) setAtestados(resAtestados.data as unknown as Atestado[]);
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => { carregarDados(); }, []);

    // Lógica para adicionar arquivos à lista local
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArquivosSelecionados([...arquivosSelecionados, e.target.files[0]]);
        }
    };

    const removeFile = (index: number) => {
        setArquivosSelecionados(arquivosSelecionados.filter((_, i) => i !== index));
    };

    const handleCadastrarAtestado = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funcionarioId || !dataEmissao || !dataInicio || !dataFim || !justificativa.trim()) {
            setStatusFeed({ tipo: 'erro', texto: 'Preencha os campos obrigatórios.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            const diferencaDias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // Upload de Múltiplos Arquivos
            const paths: string[] = [];
            for (const file of arquivosSelecionados) {
                const nomeArquivo = `${funcionarioId}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('atestados')
                    .upload(nomeArquivo, file);

                if (uploadError) throw uploadError;
                if (uploadData) paths.push(uploadData.path);
            }

            const { error: insertError } = await supabase
                .from('atestados_medicos')
                .insert([{
                    funcionario_id: funcionarioId,
                    data_emissao: dataEmissao,
                    data_inicio: dataInicio,
                    data_fim: dataFim,
                    quantidade_dias: diferencaDias,
                    cid: cid.trim().toUpperCase() || null,
                    justificativa: justificativa.trim(),
                    arquivos: paths // Salva o array de caminhos
                }]);

            if (insertError) throw insertError;

            setStatusFeed({ tipo: 'sucesso', texto: 'Atestado registrado com todos os anexos!' });

            // Reset
            setFuncionarioId(''); setDataEmissao(''); setDataInicio(''); setDataFim(''); setCid(''); setJustificativa(''); setArquivosSelecionados([]);
            carregarDados();

        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: 'Erro ao processar arquivos.' });
        } finally {
            setEnviando(false);
        }
    };

    const visualizarDocumento = async (path: string) => {
        const { data } = await supabase.storage.from('atestados').createSignedUrl(path, 60);
        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    };

    return (
        <main className="relative min-h-screen bg-[#030303] text-white p-4 sm:p-6 md:p-10 font-sans antialiased">
            {/* HEADER MANTIDO IGUAL */}
            <header className="w-full border-b border-white/[0.04] pb-6 mb-8">
                <Link href="/dashboard" className="text-orange-500 font-black text-[9px] uppercase tracking-[4px]">← Painel Principal</Link>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter mt-2">Controle de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Atestados</span></h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORMULÁRIO */}
                <div className="bg-[#09090b]/80 border border-white/[0.06] rounded-[32px] p-6 lg:col-span-1 space-y-4">
                    {/* ... (inputs mantidos iguais: Colaborador, Datas, CID, Justificativa) ... */}

                    {/* INPUT DE MÚLTIPLOS ARQUIVOS ATUALIZADO */}
                    <div className="space-y-2">
                        <label className="block text-[8px] font-black uppercase tracking-[2px] text-slate-500">Documentos Anexos</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {arquivosSelecionados.map((file, idx) => (
                                <div key={idx} className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] px-2 py-1 rounded flex items-center gap-2 font-bold">
                                    {file.name}
                                    <button type="button" onClick={() => removeFile(idx)} className="hover:text-white">✕</button>
                                </div>
                            ))}
                        </div>
                        <label className="cursor-pointer bg-white/[0.03] border border-white/[0.08] p-3 rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-slate-400 hover:border-orange-500/50">
                            + Adicionar Documento
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                    <button onClick={handleCadastrarAtestado} disabled={enviando} className="w-full bg-orange-600 py-3.5 rounded-xl font-black text-[10px] tracking-[2px] uppercase">
                        {enviando ? "Processando..." : "Salvar Atestado Completo"}
                    </button>
                </div>

                {/* TABELA ATUALIZADA */}
                <div className="lg:col-span-2 overflow-x-auto">
                    <table className="w-full">
                        {/* ... (thead mantido igual) ... */}
                        <tbody>
                        {atestados.map(a => (
                            <tr key={a.id} className="border-b border-white/[0.04]">
                                {/* ... (outras colunas) ... */}
                                <td className="py-4 text-right">
                                    {a.arquivos && a.arquivos.length > 0 ? (
                                        <div className="flex flex-col gap-1 items-end">
                                            {a.arquivos.map((path, idx) => (
                                                <button key={idx} onClick={() => visualizarDocumento(path)} className="text-[8px] text-orange-400 hover:text-white underline">
                                                    Doc {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    ) : <span className="text-[8px] text-slate-600">Sem anexos</span>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}