"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function TotemPontoPage() {
    const [idCracha, setIdCracha] = useState('');
    const [statusEnvio, setStatusEnvio] = useState({ tipo: '', texto: '' });
    const [carregando, setCarregando] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Prende o foco no input para o leitor de código de barras estar sempre pronto
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [statusEnvio]);

    // Força o foco de volta se clicarem em qualquer outro lugar da tela
    useEffect(() => {
        const forcarFocoGeral = () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        };
        window.addEventListener("click", forcarFocoGeral);
        return () => window.removeEventListener("click", forcarFocoGeral);
    }, []);

    const handleLimpar = () => {
        setIdCracha('');
        setStatusEnvio({ tipo: '', texto: '' });
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleVerificarERegistrarPonto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idCracha.trim() || carregando) return;

        setCarregando(true);
        setStatusEnvio({ tipo: '', texto: '' });

        try {
            // 1. Busca funcionário no Supabase para validar a existência
            const { data: func } = await supabase
                .from('funcionarios')
                .select('id, nome, sobrenome')
                .eq('id', idCracha.trim())
                .maybeSingle();

            if (!func) {
                setStatusEnvio({ tipo: 'erro', texto: 'Crachá inválido ou não encontrado.' });
                setIdCracha('');
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

            // 4. Injeta direto na tabela com o status de observação correto
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

            setStatusEnvio({
                tipo: 'sucesso',
                texto: `Ponto registrado! Bom trabalho, ${func.nome}. (${horaFormatada})`
            });

            setTimeout(() => {
                handleLimpar();
            }, 3000);

        } catch (err) {
            console.error(err);
            setStatusEnvio({ tipo: 'erro', texto: 'Erro de conexão ao salvar o ponto.' });
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 sm:p-6 font-sans antialiased w-full selection:bg-black/5">

            {/* CARD DO TOTEM - PLACA BRANCA PREMIUM INTEGRADA */}
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

                    {/* FEEDBACK ANALÍTICO DE REQUISIÇÃO */}
                    {statusEnvio.texto && (
                        <div className={`mb-5 flex items-start gap-2.5 p-4 rounded-xl border text-[11px] font-medium leading-normal ${
                            statusEnvio.tipo === 'sucesso'
                                ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                                : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                        }`}>
                            <div className="shrink-0 text-xs">{statusEnvio.tipo === 'sucesso' ? '🔹' : '🔸'}</div>
                            <p className="tracking-tight uppercase text-[10px] font-bold">{statusEnvio.texto}</p>
                        </div>
                    )}

                    {/* INTERFACE DO ESCANER INVISÍVEL */}
                    <form onSubmit={handleVerificarERegistrarPonto} className="space-y-4">
                        <div className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-6 text-center relative flex flex-col items-center justify-center gap-3 transition-colors">

                            {/* Linha discreta simulando laser óptico fixo */}
                            <div className="absolute inset-x-0 h-px bg-[#1d1d1f]/5 top-1/2 -translate-y-1/2 pointer-events-none" />

                            <div className="relative z-10 w-9 h-9 bg-white border border-[#e5e5ea] rounded-lg flex items-center justify-center text-sm shadow-[0_1px_2px_rgba(0,0,0,0.01)] select-none">
                                💳
                            </div>

                            <div className="relative z-10 space-y-0.5">
                                <p className="text-xs font-bold tracking-tight text-[#1d1d1f]">Leitor Óptico Ativo</p>
                                <p className="text-[9px] font-medium text-[#86868b]">Aproxime a tag de barras ou digite o registro</p>
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