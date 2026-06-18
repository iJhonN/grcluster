"use client";
import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function PontoEmergenciaPage() {
    const [funcionarioId, setFuncionarioId] = useState('');
    const [justificativa, setJustificativa] = useState('');
    const [etapa, setEtapa] = useState<'identificacao' | 'justificativa'>('identificacao');
    const [funcionarioDados, setFuncionarioDados] = useState<any>(null);

    const [processando, setProcessando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const verificarFuncionario = async (e: React.FormEvent) => {
        e.preventDefault();
        const idLimpo = funcionarioId.trim().toUpperCase();
        if (!idLimpo) return;

        setProcessando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const { data: func, error: funcErr } = await supabase
                .from('funcionarios')
                .select('id, nome, sobrenome, cargo')
                .eq('id', idLimpo)
                .single();

            if (funcErr || !func) {
                throw new Error("Colaborador não localizado. Verifique o ID do crachá.");
            }

            setFuncionarioDados(func);

            const { data: saidaAberta, error: saidaErr } = await supabase
                .from('saidas_emergencia')
                .select('*')
                .eq('funcionario_id', idLimpo)
                .is('horario_retorno', null)
                .order('horario_saida', { ascending: false })
                .maybeSingle();

            if (saidaAberta) {
                const { error: updateErr } = await supabase
                    .from('saidas_emergencia')
                    .update({ horario_retorno: new Date().toISOString() })
                    .eq('id', saidaAberta.id);

                if (updateErr) throw updateErr;

                setStatusFeed({
                    tipo: 'sucesso',
                    texto: `Retorno registrado! Bom trabalho, ${func.nome}.`
                });
                resetarFormulario();
            } else {
                setEtapa('justificativa');
            }

        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Falha ao processar identificação.' });
        } finally {
            setProcessando(false);
        }
    };

    const confirmarSaida = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!justificativa.trim()) {
            setStatusFeed({ tipo: 'erro', texto: 'Informe o motivo da saída de emergência.' });
            return;
        }

        setProcessando(true);

        try {
            const { error } = await supabase
                .from('saidas_emergencia')
                .insert([{
                    funcionario_id: funcionarioDados.id,
                    justificativa: justificativa.trim(),
                    horario_saida: new Date().toISOString()
                }]);

            if (error) throw error;

            setStatusFeed({
                tipo: 'sucesso',
                texto: `Saída autorizada! Registro concluído para ${funcionarioDados.nome}.`
            });
            resetarFormulario();

        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Erro ao salvar saída emergencial.' });
        } finally {
            setProcessando(false);
        }
    };

    const resetarFormulario = () => {
        setTimeout(() => {
            setFuncionarioId('');
            setJustificativa('');
            setFuncionarioDados(null);
            setEtapa('identificacao');
            setStatusFeed({ tipo: '', texto: '' });
        }, 3000);
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center p-4 font-sans antialiased selection:bg-black/5">

            {/* CARD BRANCO EXECUTIVO INTEGRADO */}
            <div className="w-full max-w-sm bg-white border border-[#e5e5ea] rounded-2xl p-6 sm:p-8 shadow-[0_1px_5px_rgba(0,0,0,0.02)] relative overflow-visible transition-all">

                {/* CABEÇALHO DO PAINEL DE EXCEÇÃO */}
                <div className="text-center mb-6 space-y-1">
                    <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#ff3b30] bg-[#ff3b30]/5 px-2.5 py-0.5 rounded border border-[#ff3b30]/10 select-none">
                        Módulo de Exceção
                    </span>
                    <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f] pt-1">
                        Saída / Retorno Extra
                    </h1>
                    <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase">
                        GR SYSTEM CORE
                    </p>
                </div>

                {/* BANNER DINÂMICO DE FEEDBACK */}
                {statusFeed.texto && (
                    <div className={`mb-5 p-3.5 rounded-xl text-center text-[11px] font-bold border transition-all ${
                        statusFeed.tipo === 'sucesso'
                            ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                            : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                    }`}>
                        {statusFeed.texto}
                    </div>
                )}

                {/* ETAPA 1: LEITURA DO CRACHÁ */}
                {etapa === 'identificacao' && (
                    <form onSubmit={verificarFuncionario} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">
                                Identificação do Colaborador
                            </label>
                            <input
                                type="text"
                                placeholder="Aguardando crachá ou ID..."
                                value={funcionarioId}
                                onChange={e => setFuncionarioId(e.target.value)}
                                disabled={processando}
                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-3 rounded-lg text-xs font-mono font-bold text-center tracking-widest text-[#1d1d1f] outline-none transition-colors uppercase placeholder-[#b4b4b9]"
                                autoFocus
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processando || !funcionarioId.trim()}
                            className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                        >
                            {processando ? "Verificando..." : "Confirmar Identidade →"}
                        </button>
                    </form>
                )}

                {/* ETAPA 2: JUSTIFICATIVA OBRIGATÓRIA */}
                {etapa === 'justificativa' && funcionarioDados && (
                    <form onSubmit={confirmarSaida} className="space-y-4">
                        <div className="bg-[#f5f5f7] border border-[#e5e5ea] p-3.5 rounded-xl space-y-0.5">
                            <p className="text-[9px] font-bold text-[#86868b] uppercase tracking-wider">Colaborador Identificado:</p>
                            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-tight">
                                {funcionarioDados.nome} {funcionarioDados.sobrenome}
                            </h3>
                            <p className="text-[9px] font-mono font-bold text-[#ff9500] uppercase tracking-wide">
                                {funcionarioDados.cargo}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">
                                Motivo / Justificativa da Saída
                            </label>
                            <textarea
                                placeholder="Descreva formalmente o motivo da saída..."
                                value={justificativa}
                                onChange={e => setJustificativa(e.target.value)}
                                disabled={processando}
                                rows={3}
                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-3 rounded-lg text-xs font-medium text-[#1d1d1f] outline-none transition-colors resize-none placeholder-[#b4b4b9]"
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setEtapa('identificacao');
                                    setFuncionarioDados(null);
                                }}
                                className="w-1/3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                type="submit"
                                disabled={processando || !justificativa.trim()}
                                className="w-2/3 bg-[#ff3b30] active:bg-[#d63026] text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {processando ? "Salvando..." : "Registrar Saída"}
                            </button>
                        </div>
                    </form>
                )}

                {/* LINK RETORNO */}
                <div className="mt-6 text-center border-t border-[#e5e5ea] pt-4">
                    <Link href="/dashboard" className="text-[9px] text-[#86868b] font-bold uppercase tracking-wider hover:text-[#1d1d1f] transition-colors">
                        ← Voltar ao Terminal Principal
                    </Link>
                </div>

            </div>
        </main>
    );
}