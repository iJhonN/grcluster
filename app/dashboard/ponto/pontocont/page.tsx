"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface ToastMessage {
    id: number;
    tipo: 'sucesso' | 'erro';
    texto: string;
}

export default function TotemPontoPage() {
    // Trava de Segurança de Domínio
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
            if (!isLocal && !hostname.includes('grcluster') && !hostname.includes('grpecas')) {
                throw new TypeError('Falha de inicialização em ambiente não autorizado.');
            }
        }
    }, []);

    const [tagInput, setTagInput] = useState('');
    const [processando, setProcessando] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const cooldownMap = useRef<Map<string, number>>(new Map());
    const TIMEOUT_COOLDOWN = 2 * 60 * 1000; // Trava de 2 minutos contra dupla batida acidental

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const exibirToast = (tipo: 'sucesso' | 'erro', texto: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, tipo, texto }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 4000);
    };

    // Mantém o foco no campo para leitores ópticos/físicos sem interferir na digitação por toque
    useEffect(() => {
        if (inputRef.current && !processando) {
            inputRef.current.focus();
        }
    }, [processando]);

    const limparERefocar = () => {
        setTagInput('');
        setTimeout(() => inputRef.current?.focus(), 10);
    };

    // Funções do Teclado Numérico Touch Screen
    const handleKeyPress = (val: string) => {
        if (processando) return;
        if (tagInput.length < 15) {
            setTagInput(prev => prev + val);
        }
    };

    const handleBackspace = () => {
        if (processando) return;
        setTagInput(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        if (processando) return;
        setTagInput('');
    };

    const processarRegistroPonto = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const tagCracha = tagInput.trim().toUpperCase();
        if (!tagCracha || processando) return;

        // TRAVA DE SEGURANÇA ANTI-DUPLA BATIDA (2 MINUTOS)
        const agora = Date.now();
        const ultimaBatida = cooldownMap.current.get(tagCracha);

        if (ultimaBatida && (agora - ultimaBatida < TIMEOUT_COOLDOWN)) {
            const segundosRestantes = Math.ceil((TIMEOUT_COOLDOWN - (agora - ultimaBatida)) / 1000);
            exibirToast('erro', `Crachá já lido! Aguarde ${segundosRestantes}s para bater novamente.`);
            limparERefocar();
            return;
        }

        setProcessando(true);

        try {
            // Busca colaborador pelo ID do crachá
            const { data: funcionario, error: errFunc } = await supabase
                .from('funcionarios')
                .select('id, nome, sobrenome')
                .eq('id', tagCracha)
                .maybeSingle();

            if (errFunc || !funcionario) {
                exibirToast('erro', 'Crachá inválido ou não encontrado na base.');
                limparERefocar();
                setProcessando(false);
                return;
            }

            // Horário do fuso oficial America/Sao_Paulo
            const dataSP = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const horas = dataSP.getHours().toString().padStart(2, '0');
            const minutos = dataSP.getMinutes().toString().padStart(2, '0');
            const horaFormatada = `${horas}:${minutos}`;

            // Período do dia atual
            const dStart = new Date(dataSP); dStart.setHours(0, 0, 0, 0);
            const dEnd = new Date(dataSP); dEnd.setHours(23, 59, 59, 999);

            const { data: pontosHoje } = await supabase
                .from('pontos')
                .select('id')
                .eq('funcionario_id', funcionario.id)
                .gte('data_registro', dStart.toISOString())
                .lte('data_registro', dEnd.toISOString());

            const totalPontosHoje = pontosHoje ? pontosHoje.length : 0;

            let tipoBatida = 'entrada';
            if (totalPontosHoje === 1) tipoBatida = 'saida_almoco';
            else if (totalPontosHoje === 2) tipoBatida = 'volta_almoco';
            else if (totalPontosHoje === 3) tipoBatida = 'saida_fim';

            let observacao = 'Jornada Normal';
            if (tipoBatida === 'entrada' && horaFormatada > '08:05') {
                observacao = 'Atraso';
            } else if (tipoBatida === 'volta_almoco' && horaFormatada > '14:05') {
                observacao = 'Atraso';
            }

            const pontoPayload = {
                funcionario_id: funcionario.id,
                nome_completo: `${funcionario.nome} ${funcionario.sobrenome}`,
                data_registro: new Date().toISOString(),
                hora_formatada: horaFormatada,
                tipo_batida: tipoBatida,
                observacao: observacao,
                status_auditoria: 'validado',
                dispositivo_origem: 'totem'
            };

            const { error: errInsert } = await supabase
                .from('pontos')
                .insert([pontoPayload]);

            if (errInsert) throw errInsert;

            // Registra horário da batida na trava de segurança
            cooldownMap.current.set(tagCracha, Date.now());
            exibirToast('sucesso', `Ponto registrado! Bom trabalho, ${funcionario.nome}. (${horaFormatada})`);
            limparERefocar();

        } catch (err) {
            console.error(err);
            exibirToast('erro', 'Erro de conexão ao salvar o ponto.');
            limparERefocar();
        } finally {
            setProcessando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 sm:p-6 font-sans antialiased w-full selection:bg-orange-500/30 relative overflow-hidden select-none">

            {/* TOASTS DE FEEDBACK */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border transition-all animate-in slide-in-from-right-8 fade-in duration-300 min-w-[320px] bg-[#18181b] pointer-events-auto ${
                            toast.tipo === 'sucesso' ? 'border-emerald-500/40' : 'border-rose-500/40'
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toast.tipo === 'sucesso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {toast.tipo === 'sucesso' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className={`text-xs font-black uppercase tracking-wider ${toast.tipo === 'sucesso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {toast.tipo === 'sucesso' ? 'Validação Concluída' : 'Acesso Negado'}
                            </h4>
                            <p className="text-xs font-bold text-zinc-200 mt-0.5 leading-tight uppercase">
                                {toast.texto}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CARD TERMINAL PARA TABLET DE PAREDE */}
            <div className="w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden relative">

                {/* CABEÇALHO */}
                <div className="px-8 pt-8 pb-4 text-center relative border-b border-zinc-800/80 bg-zinc-900/40">
                    <Link
                        href="/dashboard"
                        className="absolute top-6 left-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest hover:text-white transition-colors"
                    >
                        ← Voltar
                    </Link>

                    <span className="inline-block text-[9px] font-black uppercase tracking-[2px] text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 mb-2">
                        Terminal Wall Tablet
                    </span>
                    <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
                        Totem de Ponto
                    </h1>
                    <p className="text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase mt-0.5">
                        GR AUTOPEÇAS CORE
                    </p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">

                    {/* VISOR DO CRACHÁ */}
                    <form onSubmit={processarRegistroPonto} className="space-y-2">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                autoComplete="off"
                                placeholder="DIGITE OU ESCANEIE..."
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                className="w-full bg-zinc-900 border-2 border-zinc-700 focus:border-orange-500 text-center px-4 py-4 rounded-2xl text-2xl font-mono tracking-[4px] text-white font-black outline-none placeholder-zinc-600 disabled:opacity-40 uppercase transition-all shadow-inner"
                                disabled={processando}
                            />
                            {processando && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </form>

                    {/* TECLADO NUMÉRICO TOUCH */}
                    <div className="grid grid-cols-3 gap-3">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleKeyPress(num)}
                                disabled={processando}
                                className="h-16 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-orange-600 border border-zinc-800 active:border-orange-500 text-2xl font-black text-white transition-all active:scale-95 shadow-lg flex items-center justify-center disabled:opacity-30"
                            >
                                {num}
                            </button>
                        ))}

                        {/* LIMPAR */}
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={processando || !tagInput}
                            className="h-16 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-600 border border-rose-800/40 text-xs font-black uppercase tracking-wider text-rose-400 transition-all active:scale-95 flex items-center justify-center disabled:opacity-20"
                        >
                            Limpar
                        </button>

                        {/* ZERO */}
                        <button
                            type="button"
                            onClick={() => handleKeyPress('0')}
                            disabled={processando}
                            className="h-16 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-orange-600 border border-zinc-800 active:border-orange-500 text-2xl font-black text-white transition-all active:scale-95 shadow-lg flex items-center justify-center disabled:opacity-30"
                        >
                            0
                        </button>

                        {/* BACKSPACE */}
                        <button
                            type="button"
                            onClick={handleBackspace}
                            disabled={processando || !tagInput}
                            className="h-16 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 text-xl font-black text-zinc-300 transition-all active:scale-95 flex items-center justify-center disabled:opacity-20"
                        >
                            ⌫
                        </button>
                    </div>

                    {/* BOTÃO CONFIRMAR */}
                    <button
                        type="button"
                        onClick={() => processarRegistroPonto()}
                        disabled={processando || !tagInput.trim()}
                        className="w-full h-16 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white rounded-2xl font-black text-sm uppercase tracking-[2px] transition-all shadow-lg active:scale-98 disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                        {processando ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>VALIDANDO...</span>
                            </>
                        ) : (
                            <span>CONFIRMAR PONTO →</span>
                        )}
                    </button>

                </div>

                {/* RODAPÉ */}
                <div className="border-t border-zinc-800/80 px-6 py-3.5 text-center bg-zinc-900/60">
                    <p className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                        CLUSTER TERMINAL V3.2 • TOUCH ENGINE ACTIVE
                    </p>
                </div>

            </div>
        </main>
    );
}