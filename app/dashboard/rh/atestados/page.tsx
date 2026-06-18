"use client";
import { useState, useEffect, useMemo } from 'react';
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
    quantidade_dias: number;
    cid: string | null;
    justificativa: string;
    arquivos: string[] | null;
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
    const [pesquisa, setPesquisa] = useState('');

    // Estados do Formulário
    const [funcionarioId, setFuncionarioId] = useState('');
    const [dataEmissao, setDataEmissao] = useState('');
    const [quantidadeDias, setQuantidadeDias] = useState('');
    const [cid, setCid] = useState('');
    const [justificativa, setJustificativa] = useState('');
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

    useEffect(() => {
        carregarDados();
    }, []);

    const calcularDataRetorno = (emissao: string, dias: string) => {
        if (!emissao || !dias || Number(dias) <= 0) return '---';
        const data = new Date(emissao + 'T00:00:00');
        data.setDate(data.getDate() + Number(dias));
        return data.toLocaleDateString('pt-BR');
    };

    // Filtro em tempo real memoizado por funcionário, ID ou CID
    const atestadosFiltrados = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        if (!termo) return atestados;
        return atestados.filter(a => {
            const nomeCompleto = `${a.funcionarios?.nome || ''} ${a.funcionarios?.sobrenome || ''}`.toLowerCase();
            const idFunc = String(a.funcionario_id || '').toLowerCase();
            const cidPeca = String(a.cid || '').toLowerCase();
            return nomeCompleto.includes(termo) || idFunc.includes(termo) || cidPeca.includes(termo);
        });
    }, [atestados, pesquisa]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArquivosSelecionados([...arquivosSelecionados, e.target.files[0]]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setArquivosSelecionados(arquivosSelecionados.filter((_, i) => i !== index));
    };

    const handleCadastrarAtestado = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funcionarioId || !dataEmissao || !quantidadeDias || !justificativa.trim()) {
            setStatusFeed({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios.' });
            return;
        }

        const diasNum = Number(quantidadeDias);
        if (diasNum <= 0) {
            setStatusFeed({ tipo: 'erro', texto: 'A quantidade de dias deve ser maior que zero.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const urlsDocumentos: string[] = [];

            for (const file of arquivosSelecionados) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${funcionarioId}-${Date.now()}-${Math.random()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('atestados')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;
                if (uploadData) urlsDocumentos.push(uploadData.path);
            }

            const { error: insertError } = await supabase
                .from('atestados_medicos')
                .insert([{
                    funcionario_id: funcionarioId,
                    data_emissao: dataEmissao,
                    quantidade_dias: diasNum,
                    cid: cid.trim().toUpperCase() || null,
                    justificativa: justificativa.trim(),
                    arquivos: urlsDocumentos
                }]);

            if (insertError) throw insertError;

            setStatusFeed({ tipo: 'sucesso', texto: 'Atestado e anexos registrados com sucesso!' });

            setFuncionarioId('');
            setDataEmissao('');
            setQuantidadeDias('');
            setCid('');
            setJustificativa('');
            setArquivosSelecionados([]);

            carregarDados();

        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Falha ao processar operação.' });
        } finally {
            setEnviando(false);
        }
    };

    const visualizarDocumento = async (path: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('atestados')
                .createSignedUrl(path, 60);

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (err) {
            console.error("Erro ao gerar link de visualização:", err);
            alert("Não foi possível acessar o arquivo de forma segura.");
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col justify-between w-full selection:bg-[#007aff]/10">

            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard/rh" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#007aff] transition-colors block">
                            ← Dashboard de RH
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Controle de Atestados Médicos
                        </h1>
                        <p className="text-[10px] text-[#86868b] font-medium uppercase tracking-wide">
                            Módulo de Justificativas Legais, Dispensas e Afastamentos Médicos
                        </p>
                    </div>
                </header>

                {/* BARRA DE FILTRAGEM / PESQUISA OPERACIONAL */}
                <div className="w-full max-w-md">
                    <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Filtro de Busca Rápida</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 14l-3.5-3.5m0 0A5 5 0 104 4a5 5 0 006.5 6.5z" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por colaborador, ID ou código CID..."
                                value={pesquisa}
                                onChange={e => setPesquisa(e.target.value)}
                                className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] pl-10 pr-4 py-2.5 rounded-xl outline-none text-[#1d1d1f] text-xs font-medium uppercase placeholder-[#b4b4b9] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.005)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">

                    {/* FORM CARD */}
                    <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] lg:col-span-1">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868b] border-b border-[#f5f5f7] pb-3 mb-4 select-none">
                            🩺 Lançar Novo Afastamento
                        </h2>

                        {statusFeed.texto && (
                            <div className={`mb-4 p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                                statusFeed.tipo === 'sucesso'
                                    ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                                    : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                            }`}>
                                {statusFeed.texto}
                            </div>
                        )}

                        <form onSubmit={handleCadastrarAtestado} className="space-y-4">

                            {/* Colaborador */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Colaborador *</label>
                                <div className="relative">
                                    <select
                                        value={funcionarioId}
                                        onChange={e => setFuncionarioId(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase cursor-pointer appearance-none transition-colors"
                                        required
                                    >
                                        <option value="" className="text-[#b4b4b9]">Selecionar Funcionário...</option>
                                        {funcionarios.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.nome} {f.sobrenome} (ID: {f.id})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Emissão e CID */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Data Emissão *</label>
                                    <input
                                        type="date"
                                        value={dataEmissao}
                                        onChange={e => setDataEmissao(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-medium uppercase transition-colors"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">CID (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="EX: M54.5"
                                        value={cid}
                                        onChange={e => setCid(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#007aff] font-mono text-xs font-bold uppercase placeholder-[#b4b4b9] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Dias e Retorno */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Total de Dias *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Ex: 5"
                                        value={quantidadeDias}
                                        onChange={e => setQuantidadeDias(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold transition-colors text-center"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#007aff] ml-0.5">Data de Retorno</label>
                                    <div className="w-full bg-[#007aff]/5 border border-[#007aff]/10 px-3 py-2 rounded-lg text-[#007aff] text-xs font-mono font-bold tracking-wide flex items-center justify-center h-[34px] select-none">
                                        {calcularDataRetorno(dataEmissao, quantidadeDias)}
                                    </div>
                                </div>
                            </div>

                            {/* Justificativa */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Justificativa / Motivo *</label>
                                <textarea
                                    placeholder="Descreva o motivo do afastamento..."
                                    value={justificativa}
                                    onChange={e => setJustificativa(e.target.value)}
                                    rows={3}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-medium transition-colors placeholder-[#b4b4b9] resize-none"
                                    required
                                />
                            </div>

                            {/* Área de múltiplos anexos */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Anexos Documentais</label>

                                <div className="flex flex-wrap gap-1.5 mb-1">
                                    {arquivosSelecionados.map((file, idx) => (
                                        <div key={idx} className="bg-[#007aff]/5 border border-[#007aff]/10 text-[#007aff] text-[9px] px-2 py-0.5 rounded flex items-center gap-1.5 font-bold uppercase tracking-wide">
                                            <span className="truncate max-w-[100px]">{file.name}</span>
                                            <button type="button" onClick={() => handleRemoveFile(idx)} className="hover:text-[#ff3b30] transition-colors">✕</button>
                                        </div>
                                    ))}
                                </div>

                                <label className="cursor-pointer flex items-center justify-center gap-2 border-dashed border border-[#e5e5ea] hover:border-[#b4b4b9] p-3 rounded-lg text-[10px] uppercase font-bold tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors bg-[#f5f5f7]/50">
                                    <span>➕ Anexar Documento</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,application/pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                >
                                    {enviando ? "Processando..." : "Salvar Atestado Completo"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* TABLE CARD */}
                    <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] lg:col-span-2 min-h-[400px] flex flex-col overflow-hidden">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868b] border-b border-[#f5f5f7] pb-3 mb-4 select-none">
                            📋 Histórico de Afastamentos Cadastrados
                        </h2>

                        {carregando ? (
                            <div className="text-center py-24 flex flex-col items-center justify-center gap-2 text-[#86868b] flex-1">
                                <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Buscando registros...</span>
                            </div>
                        ) : atestadosFiltrados.length === 0 ? (
                            <div className="py-20 text-center flex-1 flex items-center justify-center">
                                <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhum atestado localizado para o filtro atual.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[520px]">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                    <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none pb-3">
                                        <th className="pb-3 pl-1">Funcionário</th>
                                        <th className="pb-3 text-center w-24">Emissão</th>
                                        <th className="pb-3 text-center w-12">Dias</th>
                                        <th className="pb-3 text-center w-24">Retorno</th>
                                        <th className="pb-3 text-center w-16">CID</th>
                                        <th className="pb-3">Justificativa</th>
                                        <th className="pb-3 text-right pr-1 w-24">Arquivos</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f5f7]">
                                    {atestadosFiltrados.map(a => (
                                        <tr key={a.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                                            <td className="py-3.5 pl-1">
                                                <p className="font-bold text-[#1d1d1f] uppercase tracking-tight">
                                                    {a.funcionarios ? `${a.funcionarios.nome} ${a.funcionarios.sobrenome}` : 'N/A'}
                                                </p>
                                                <span className="text-[9px] font-mono font-medium text-[#86868b] mt-0.5 block">ID: {a.funcionario_id}</span>
                                            </td>
                                            <td className="py-3.5 text-center font-mono text-[10px] text-[#86868b] font-semibold">
                                                {new Date(a.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="py-3.5 text-center font-bold text-[#1d1d1f] font-mono text-xs">
                                                {a.quantidade_dias}d
                                            </td>
                                            <td className="py-3.5 text-center font-mono font-bold text-[10px] text-[#248a3d]">
                                                {calcularDataRetorno(a.data_emissao, String(a.quantidade_dias))}
                                            </td>
                                            <td className="py-3.5 text-center font-mono font-bold text-[#007aff] uppercase tracking-wide">
                                                {a.cid || '---'}
                                            </td>
                                            <td className="py-3.5 text-[#86868b] font-medium max-w-[140px] truncate uppercase text-[10px] tracking-wide" title={a.justificativa}>
                                                {a.justificativa}
                                            </td>
                                            <td className="py-3.5 text-right pr-1">
                                                {a.arquivos && a.arquivos.length > 0 ? (
                                                    <div className="flex flex-col gap-1 items-end">
                                                        {a.arquivos.map((path, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => visualizarDocumento(path)}
                                                                className="text-[8px] font-bold uppercase tracking-wider bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] px-2 py-1 rounded border border-[#e5e5ea] transition-colors"
                                                            >
                                                                Doc {idx + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[8px] font-bold text-[#b4b4b9] uppercase tracking-wider mr-1 select-none">Nenhum</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo de Gestão de RH v2.7</div>
            </footer>
        </main>
    );
}