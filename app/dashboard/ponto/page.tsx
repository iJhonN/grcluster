"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface ToastMessage {
    id: number;
    tipo: 'sucesso' | 'erro';
    texto: string;
}

export default function TotemPontoPage() {
    const [idCracha, setIdCracha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    // Trava de segurança para evitar batidas duplicadas do mesmo crachá
    const ultimasBatidasRef = useRef<Map<string, number>>(new Map());
    const TEMPO_BLOQUEIO_MS = 2 * 60 * 1000; // 2 minutos em milissegundos

    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Adiciona um popup flutuante que some sozinho após 4 segundos
    const adicionarToast = (tipo: 'sucesso' | 'erro', texto: string) => {
        const novoId = Date.now();
        setToasts(prev => [...prev, { id: novoId, tipo, texto }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== novoId));
        }, 4000);
    };

    // Prende o foco no input para o leitor de código de barras estar sempre pronto
    useEffect(() => {
        if (inputRef.current && !carregando) {
            inputRef.current.focus();
        }
    }, [carregando]);

    // Força o foco de volta se clicarem em qualquer outro lugar da tela
    useEffect(() => {
        const forcarFocoGeral = () => {
            if (inputRef.current && !carregando) {
                inputRef.current.focus();
            }
        };
        window.addEventListener("click", forcarFocoGeral);
        return () => window.removeEventListener("click", forcarFocoGeral);
    }, [carregando]);

    const handleLimpar = () => {
        setIdCracha('');
        setTimeout(() => inputRef.current?.focus(), 10);
    };

    const handleVerificarERegistrarPonto = async (e: React.FormEvent) => {
        e.preventDefault();
        const crachaAtual = idCracha.trim();
        if (!crachaAtual || carregando) return;

        // TRAVA ANTI-DUPLICIDADE DE 2 MINUTOS
        const agora = Date.now();
        const ultimaBatida = ultimasBatidasRef.current.get(crachaAtual);

        if (ultimaBatida && (agora - ultimaBatida < TEMPO_BLOQUEIO_MS)) {
            const segundosFaltantes = Math.ceil((TEMPO_BLOQUEIO_MS - (agora - ultimaBatida)) / 1000);
            adicionarToast('erro', `Crachá já lido! Aguarde ${segundosFaltantes}s para bater novamente.`);
            handleLimpar();
            return;
        }

        setCarregando(true);

        try {
            // 1. Busca funcionário no Supabase para validar a existência
            const { data: func } = await supabase
                .from('funcionarios')
                .select('id, nome, sobrenome')
                .eq('id', crachaAtual)
                .maybeSingle();

            if (!func) {
                adicionarToast('erro', 'Crachá inválido ou não encontrado na base.');
                handleLimpar();
                setCarregando(false);
                return;
            }

            // 2. Calcula os limites do dia atual no fuso de Brasília
            const dataBrasilia = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const hora = dataBrasilia.getHours();
            const minuto = dataBrasilia.getMinutes();
            const horaFormatada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;

            const inicioDia = new Date(dataBrasilia); inicioDia.setHours(0,0,0,0);
            const fimDia = new Date(dataBrasilia); fimDia.setHours(23,59,59,999);

            // 3. Puxa quantas batidas ele já deu hoje para saber o tipo sequencial da próxima
            const { data: pointsHoje } = await supabase
                .from('pontos')
                .select('id')
                .eq('funcionario_id', func.id)
                .gte('data_registro', inicioDia.toISOString())
                .lte('data_registro', fimDia.toISOString());

            const numBatidas = pointsHoje ? pointsHoje.length : 0;

            let tipoBatida = 'entrada';
            if (numBatidas === 1) tipoBatida = 'saida_almoco';
            else if (numBatidas === 2) tipoBatida = 'volta_almoco';
            else if (numBatidas === 3) tipoBatida = 'saida_fim';

            // --- VALIDAÇÃO DE ATRASO BASEADA NOS HORÁRIOS DE FUNCIONAMENTO ---
            let textoObservacao = 'Jornada Normal';

            if (tipoBatida === 'entrada' && horaFormatada > '08:05') {
                textoObservacao = 'Atraso';
            } else if (tipoBatida === 'volta_almoco' && horaFormatada > '14:05') {
                textoObservacao = 'Atraso';
            }

            // 4. Injeta direto na tabela
            const { error: errInsert } = await supabase
                .from('pontos')
                .insert([{
                    funcionario_id: func.id,
                    nome_completo: `${func.nome} ${func.sobrenome}`,
                    data_registro: new Date().toISOString(),
                    hora_formatada: horaFormatada,
                    tipo_batida: tipoBatida,
                    observacao: textoObservacao,
                    status_auditoria: 'validado',
                    dispositivo_origem: 'totem'
                }]);

            if (errInsert) throw errInsert;

            // REGISTRA O HORÁRIO NA MEMÓRIA DO TOTEM PARA BLOQUEAR BATIDAS DUPLAS NOS PRÓXIMOS 2 MINUTOS
            ultimasBatidasRef.current.set(crachaAtual, Date.now());

            // Sucesso! Dispara o toast e limpa a tela instantaneamente para o próximo
            adicionarToast('sucesso', `Ponto registrado! Bom trabalho, ${func.nome}. (${horaFormatada})`);
            handleLimpar();

        } catch (err) {
            console.error(err);
            adicionarToast('erro', 'Erro de conexão ao salvar o ponto.');
            handleLimpar();
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 sm:p-6 font-sans antialiased w-full selection:bg-black/5 relative overflow-hidden">

            {/* CONTAINER DE TOASTS (POP-UPS FLUTUANTES) */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border transition-all animate-in slide-in-from-right-8 fade-in duration-300 min-w-[300px] bg-white pointer-events-auto ${
                            toast.tipo === 'sucesso' ? 'border-green-200' : 'border-red-200'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.tipo === 'sucesso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {toast.tipo === 'sucesso' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className={`text-xs font-black uppercase tracking-wider ${toast.tipo === 'sucesso' ? 'text-green-600' : 'text-red-600'}`}>
                                {toast.tipo === 'sucesso' ? 'Validação Concluída' : 'Acesso Negado'}
                            </h4>
                            <p className="text-[11px] font-bold text-[#1d1d1f] mt-0.5 leading-tight uppercase">
                                {toast.texto}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CARD DO TOTEM PRINCIPAL */}
            <div className="w-full max-w-sm bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_5px_rgba(0,0,0,0.02)] overflow-hidden transition-all relative">

                {/* Botão de Retorno Compacto no Topo */}
                <Link
                    href="/dashboard"
                    className="absolute top-4 left-5 text-[10px] font-bold uppercase text-[#86868b] tracking-wider hover:text-[#1d1d1f] transition-colors z-20"
                >
                    ← Dashboard
                </Link>

                <div className="p-6 sm:p-8 pt-12">

                    {/* CABEÇALHO DO PAINEL */}
                    <div className="text-center mb-6 space-y-1">
                        <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded">
                            Módulo de Validação Óptica
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f] pt-1">
                            Totem de Ponto
                        </h1>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase">
                            GR SYSTEM CORE
                        </p>
                    </div>

                    {/* INTERFACE DO ESCANER INVISÍVEL */}
                    <form onSubmit={handleVerificarERegistrarPonto} className="space-y-4">
                        <div className={`w-full bg-[#f5f5f7] border rounded-xl p-6 text-center relative flex flex-col items-center justify-center gap-3 transition-colors ${carregando ? 'border-orange-500 bg-orange-500/5' : 'border-[#e5e5ea]'}`}>

                            {/* Linha discreta simulando laser óptico fixo */}
                            <div className="absolute inset-x-0 h-px bg-[#1d1d1f]/5 top-1/2 -translate-y-1/2 pointer-events-none" />

                            <div className="relative z-10 w-9 h-9 bg-white border border-[#e5e5ea] rounded-lg flex items-center justify-center text-sm shadow-[0_1px_2px_rgba(0,0,0,0.01)] select-none">
                                {carregando ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : '💳'}
                            </div>

                            <div className="relative z-10 space-y-0.5">
                                <p className={`text-xs font-bold tracking-tight ${carregando ? 'text-orange-600' : 'text-[#1d1d1f]'}`}>
                                    {carregando ? 'Sincronizando Base...' : 'Leitor Óptico Ativo'}
                                </p>
                                <p className="text-[9px] font-medium text-[#86868b]">
                                    Aproxime a tag de barras ou digite o registro
                                </p>
                            </div>

                            {/* Input focado de forma contínua */}
                            <input
                                ref={inputRef}
                                type="text"
                                autoComplete="off"
                                placeholder="Aguardando crachá..."
                                value={idCracha}
                                onChange={e => setIdCracha(e.target.value)}
                                className="relative z-10 w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] text-center px-3 py-2.5 rounded-lg text-xs font-mono tracking-widest text-[#1d1d1f] font-bold outline-none placeholder-[#b4b4b9] disabled:opacity-40 uppercase transition-colors"
                                autoFocus
                                disabled={carregando}
                            />
                        </div>
                    </form>

                </div>

                {/* RODAPÉ DO COMPONENTE */}
                <div className="border-t border-[#e5e5ea] px-6 py-3 flex items-center justify-center bg-[#f5f5f7]/50">
                    <p className="text-[9px] font-mono font-bold tracking-wider text-[#86868b] uppercase">
                        CLUSTER TERMINAL V3.0
                    </p>
                </div>

            </div>
        </main>
    );
}