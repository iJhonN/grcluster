"use client";
import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface PontoAtrasado {
    id: number;
    funcionario_id: string;
    nome_completo: string;
    data_registro: string;
    hora_formatada: string;
    tipo_batida: string;
    justificado: boolean;
    texto_justificativa?: string;
}

export default function GestaoAtrasosPage() {
    const [pontos, setPontos] = useState<any[]>([]);
    const [justificativas, setJustificativas] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Estados de ação do Gerente
    const [pontoSelecionadoId, setPontoSelecionadoId] = useState<number | null>(null);
    const [textoJustificativa, setTextoJustificativa] = useState('');
    const [processando, setProcessando] = useState(false);

    const formularioRef = useRef<HTMLDivElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function carregarDados() {
        setCarregando(true);
        try {
            const [resPontos, resJust] = await Promise.all([
                supabase.from('pontos').select('*').order('data_registro', { ascending: false }),
                supabase.from('justificativas_atraso').select('*')
            ]);

            if (resPontos.data) setPontos(resPontos.data);
            if (resJust.data) setJustificativas(resJust.data);
        } catch (err) {
            console.error(err);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    // FILTRO EXPANDIDO: Mapeia todos os atrasos, inclusive os já justificados
    const atrasosComputados = useMemo((): PontoAtrasado[] => {
        return pontos.filter(p => {
            const obs = p.observacao ? p.observacao.toLowerCase().trim() : '';
            return obs === 'atraso';
        }).map(p => {
            const jf = justificativas.find(j => Number(j.ponto_id) === Number(p.id));
            return {
                id: p.id,
                funcionario_id: p.funcionario_id,
                nome_completo: p.nome_completo,
                data_registro: p.data_registro,
                hora_formatada: p.hora_formatada,
                tipo_batida: p.tipo_batida,
                justificado: !!jf,
                texto_justificativa: jf?.texto_justificativa
            };
        });
    }, [pontos, justificativas]);

    const handleIniciarAjuste = (id: number) => {
        setPontoSelecionadoId(id);
        const jaJustificado = atrasosComputados.find(a => a.id === id);
        // Se já tiver texto anterior, popula o campo para visualização/edição
        setTextoJustificativa(jaJustificado?.texto_justificativa || '');

        setTimeout(() => {
            formularioRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 50);
    };

    const handleSalvarJustificativa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pontoSelecionadoId || !textoJustificativa.trim()) return;

        setProcessando(true);
        const pontoAlvo = atrasosComputados.find(a => a.id === pontoSelecionadoId);

        try {
            // Se já for justificado, deleta a antiga para inserir a nova atualizada por segurança
            if (pontoAlvo?.justificado) {
                await supabase.from('justificativas_atraso').delete().eq('ponto_id', pontoSelecionadoId);
            }

            const { error } = await supabase
                .from('justificativas_atraso')
                .insert([{
                    ponto_id: pontoSelecionadoId,
                    funcionario_id: pontoAlvo?.funcionario_id,
                    texto_justificativa: textoJustificativa.trim()
                }]);

            if (error) throw error;

            setTextoJustificativa('');
            setPontoSelecionadoId(null);
            carregarDados();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessando(false);
        }
    };

    const handleRemoverAtraso = async () => {
        if (!pontoSelecionadoId) return;
        if (!confirm("Confirmar a alteração deste ponto para Jornada Normal? O destaque de atraso será limpo da folha de fechamento.")) return;

        setProcessando(true);
        try {
            // Remove qualquer justificativa de atraso guardada já que o ponto virou normal
            await supabase.from('justificativas_atraso').delete().eq('ponto_id', pontoSelecionadoId);

            const { error } = await supabase
                .from('pontos')
                .update({ observacao: 'Jornada Normal' })
                .eq('id', pontoSelecionadoId);

            if (error) throw error;

            setPontoSelecionadoId(null);
            setTextoJustificativa('');
            carregarDados();
        } catch (err) {
            console.error("Erro ao alterar status do atraso:", err);
        } finally {
            setProcessando(false);
        }
    };

    const handleExcluirPonto = async () => {
        if (!pontoSelecionadoId) return;
        if (!confirm("AVISO: Tem certeza que deseja EXCLUIR permanentemente esta batida de ponto do banco de dados?")) return;

        setProcessando(true);
        try {
            await supabase.from('justificativas_atraso').delete().eq('ponto_id', pontoSelecionadoId);

            const { error } = await supabase
                .from('pontos')
                .delete()
                .eq('id', pontoSelecionadoId);

            if (error) throw error;

            setPontoSelecionadoId(null);
            setTextoJustificativa('');
            carregarDados();
        } catch (err) {
            console.error("Erro ao deletar registro de ponto:", err);
        } finally {
            setProcessando(false);
        }
    };

    const pontoSelecionadoDados = useMemo(() => {
        return atrasosComputados.find(a => a.id === pontoSelecionadoId);
    }, [pontoSelecionadoId, atrasosComputados]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5">
            <div className="w-full max-w-6xl mx-auto space-y-6">

                {/* HEADER */}
                <header className="space-y-1.5 pl-1">
                    <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                        ← Módulos Operacionais
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Tratamento de Atrasos
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* TABELA DE ATRASOS ENCONTRADOS */}
                    <div className="lg:col-span-2 bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 mb-4">Ocorrências de Atraso Detectadas</h3>

                        {carregando ? (
                            <div className="py-14 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                                <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[9px] font-mono uppercase font-bold tracking-wider">Mapeando Linhas...</span>
                            </div>
                        ) : atrasosComputados.length === 0 ? (
                            <p className="text-xs text-[#86868b] py-14 text-center font-semibold uppercase tracking-wide">Nenhum atraso localizado no ciclo.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                    <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none">
                                        <th className="pb-3 pl-1 w-24">Data</th>
                                        <th className="pb-3">Colaborador</th>
                                        <th className="pb-3 text-center w-20">Horário</th>
                                        <th className="pb-3 text-right pr-1 w-28">Ação / Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f5f7]">
                                    {atrasosComputados.map(atraso => {
                                        const dataF = new Date(atraso.data_registro).toLocaleDateString('pt-BR');
                                        const selecionado = pontoSelecionadoId === atraso.id;
                                        return (
                                            <tr key={atraso.id} className={`transition-colors ${selecionado ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]/50'}`}>
                                                <td className="py-3.5 font-mono font-bold text-[#86868b] pl-1">{dataF}</td>
                                                <td className="py-3.5 font-bold text-[#1d1d1f]">
                                                    {atraso.nome_completo}
                                                    <span className="text-[9px] text-[#86868b] font-mono block font-medium mt-0.5">ID: {atraso.funcionario_id}</span>
                                                </td>
                                                <td className="py-3.5 text-center font-mono font-black text-[#ff3b30]">{atraso.hora_formatada}</td>
                                                <td className="py-3.5 text-right pr-1">
                                                    {atraso.justificado ? (
                                                        <button
                                                            onClick={() => handleIniciarAjuste(atraso.id)}
                                                            className="text-[9px] bg-[#34c759]/10 hover:bg-[#34c759]/20 text-[#248a3d] px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            Justificado
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleIniciarAjuste(atraso.id)}
                                                            className="text-[9px] bg-[#1d1d1f] hover:bg-black text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            Tratar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* CAIXA DINÂMICA DE TRATAMENTO */}
                    <div ref={formularioRef} className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] scroll-mt-6">
                        <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 mb-4">Ações de Ajuste</h3>

                        {pontoSelecionadoId && pontoSelecionadoDados ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl space-y-0.5">
                                    <p className="text-[8px] font-bold uppercase text-[#86868b] tracking-wider">
                                        {pontoSelecionadoDados.justificado ? "📋 Registro Já Justificado" : "📌 Registro Selecionado"}
                                    </p>
                                    <p className="text-xs font-bold text-[#1d1d1f]">
                                        {pontoSelecionadoDados.nome_completo}
                                    </p>
                                    <p className="text-[9px] font-mono font-bold text-[#ff3b30] uppercase tracking-wide">
                                        Atraso registrado às {pontoSelecionadoDados.hora_formatada}
                                    </p>
                                </div>

                                {/* FORMULÁRIO DE JUSTIFICATIVA */}
                                <form onSubmit={handleSalvarJustificativa} className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">
                                            {pontoSelecionadoDados.justificado ? "Modificar Texto da Justificativa" : "Motivo / Justificativa"}
                                        </label>
                                        <textarea
                                            placeholder="Ex: Apresentou atestado médico, problemas mecânicos..."
                                            value={textoJustificativa}
                                            onChange={e => setTextoJustificativa(e.target.value)}
                                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] h-24 resize-none transition-colors placeholder-[#b4b4b9]"
                                            required
                                            disabled={processando}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processando || !textoJustificativa.trim()}
                                        className="w-full bg-[#1d1d1f] active:bg-black text-white py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                    >
                                        {processando ? "Gravando..." : pontoSelecionadoDados.justificado ? "Atualizar Justificativa" : "Gravar Justificativa"}
                                    </button>
                                </form>

                                <div className="border-t border-[#e5e5ea] pt-3 space-y-2">
                                    <p className="text-[8px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Opções Avançadas</p>

                                    {/* SE CLICAR AQUI, DO PONTO JUSTIFICADO OU NÃO, CRIA O STATUS NORMAL NO SUPABASE */}
                                    <button
                                        type="button"
                                        onClick={handleRemoverAtraso}
                                        disabled={processando}
                                        className="w-full bg-[#34c759]/5 border border-[#34c759]/20 text-[#248a3d] hover:bg-[#34c759]/10 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                    >
                                        Definir como Jornada Normal
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleExcluirPonto}
                                        disabled={processando}
                                        className="w-full bg-[#ff3b30]/5 border border-[#ff3b30]/20 text-[#ff3b30] hover:bg-[#ff3b30]/10 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                    >
                                        Excluir Batida do Banco
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { setPontoSelecionadoId(null); setTextoJustificativa(''); }}
                                    className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] pt-1 block"
                                >
                                    Cancelar Operação
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-14 text-[#86868b] text-xs font-semibold uppercase tracking-wide">
                                Selecione uma ocorrência (Tratar ou Justificado) para abrir as ferramentas de ajuste.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}