"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface FuncionarioAtivo {
    id: string;
    nome: string;
    sobrenome: string;
}

export default function RetiradaDevolucaoPage() {
    const [passo, setPasso] = useState<1 | 2>(1); // 1: Funcionario (Crachá), 2: Ferramenta
    const [idDigitado, setIdDigitado] = useState('');
    const [funcionarioAtivo, setFuncionarioAtivo] = useState<FuncionarioAtivo | null>(null);
    const [modoManual, setModoManual] = useState(false);

    const [processando, setProcessando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const inputRef = useRef<HTMLInputElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Mantém o foco no input para receber o laser do leitor de código de barras
    useEffect(() => {
        if (!modoManual) {
            inputRef.current?.focus();
        }
    }, [passo, modoManual]);

    useEffect(() => {
        if (statusFeed.texto && !modoManual) {
            inputRef.current?.focus();
        }
    }, [statusFeed, modoManual]);

    // PASSO 1: Processa o Crachá do Funcionário
    const processarFuncionario = async (codigo: string) => {
        if (!codigo) return;
        setProcessando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const { data: func, error: errFunc } = await supabase
                .from('funcionarios')
                .select('id, nome, sobrenome')
                .eq('id', codigo)
                .single();

            if (errFunc || !func) {
                throw new Error(`Colaborador ID [${codigo}] não localizado na oficina.`);
            }

            setFuncionarioAtivo(func);
            setPasso(2);
            setIdDigitado('');
            setModoManual(false);
        } catch (err: any) {
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Erro ao validar funcionário.' });
            setIdDigitado('');
        } finally {
            setProcessando(false);
        }
    };

    // PASSO 2: Processa o Código da Ferramenta
    const processarFerramenta = async (codigo: string) => {
        if (!codigo || !funcionarioAtivo) return;
        setProcessando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const { data: ferramenta, error: errFerr } = await supabase
                .from('ferramentas')
                .select('*')
                .eq('id', codigo)
                .single();

            if (errFerr || !ferramenta) {
                throw new Error(`Ferramenta código [${codigo}] não cadastrada.`);
            }

            // DEVOLUÇÃO
            if (ferramenta.status === 'ocupado') {
                const { data: movAberta, error: errMov } = await supabase
                    .from('ferramenta_movimentacoes')
                    .select('id, funcionario_id')
                    .eq('ferramenta_id', codigo)
                    .eq('status_movimentacao', 'aberto')
                    .order('data_retirada', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (errMov) throw errMov;

                if (movAberta) {
                    const { error: errUpdateMov } = await supabase
                        .from('ferramenta_movimentacoes')
                        .update({
                            data_devolucao: new Date().toISOString(),
                            status_movimentacao: 'devolvido'
                        })
                        .eq('id', movAberta.id);

                    if (errUpdateMov) throw errUpdateMov;
                }

                const { error: errUpdateFerr } = await supabase
                    .from('ferramentas')
                    .update({ status: 'disponivel' })
                    .eq('id', codigo);

                if (errUpdateFerr) throw errUpdateFerr;

                setStatusFeed({ tipo: 'sucesso', texto: `Devolvida: ${ferramenta.nome} retornou ao estoque.` });
            }
            // RETIRADA
            else {
                const { error: errInsertMov } = await supabase
                    .from('ferramenta_movimentacoes')
                    .insert([{
                        ferramenta_id: codigo,
                        funcionario_id: funcionarioAtivo.id,
                        status_movimentacao: 'aberto'
                    }]);

                if (errInsertMov) throw errInsertMov;

                const { error: errUpdateFerr } = await supabase
                    .from('ferramentas')
                    .update({ status: 'ocupado' })
                    .eq('id', codigo);

                if (errUpdateFerr) throw errUpdateFerr;

                setStatusFeed({ tipo: 'sucesso', texto: `Retirada: ${ferramenta.nome} entregue para ${funcionarioAtivo.nome}.` });
            }

            setPasso(1);
            setFuncionarioAtivo(null);
            setIdDigitado('');
            setModoManual(false);

        } catch (err: any) {
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Erro ao processar movimentação.' });
            setIdDigitado('');
        } finally {
            setProcessando(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = idDigitado.trim();
        if (!valor) return;

        if (passo === 1) {
            processarFuncionario(valor);
        } else {
            processarFerramenta(valor);
        }
    };

    const cancelarOperacao = () => {
        setPasso(1);
        setFuncionarioAtivo(null);
        setIdDigitado('');
        setModoManual(false);
        setStatusFeed({ tipo: '', texto: '' });
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col justify-between w-full selection:bg-black/5">

            <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col justify-center items-center">

                {/* CONTROLES SUPERIORES */}
                <div className="w-full max-w-sm mb-3 flex justify-between items-center px-1">
                    <Link href="/dashboard/ferramentas" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                        ← Menu Anterior
                    </Link>
                    {passo === 2 && (
                        <button onClick={cancelarOperacao} className="text-[#ff3b30] font-bold text-[10px] uppercase tracking-wider hover:opacity-70 transition-opacity">
                            ✕ Cancelar Fluxo
                        </button>
                    )}
                </div>

                {/* CARD DE MOVIMENTAÇÃO */}
                <div className="w-full max-w-sm relative bg-white border border-[#e5e5ea] rounded-2xl p-6 sm:p-8 shadow-[0_1px_5px_rgba(0,0,0,0.02)] overflow-hidden transition-all">

                    {/* DESTAQUE DO MÓDULO FIXO NO TOPOCARD */}
                    <div className="text-center mb-5 border-b border-[#e5e5ea] pb-3">
                        <span className="text-[10px] font-black uppercase tracking-[3px] text-[#1d1d1f]">
                            RETIRADA DE FERRAMENTA
                        </span>
                    </div>

                    {/* BARRA DE PROGRESSO DINÂMICA (VERDE OU LARANJA) */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#f5f5f7]">
                        <div
                            className="h-full transition-all duration-300"
                            style={{
                                width: passo === 1 ? '50%' : '100%',
                                backgroundColor: passo === 1 ? '#34c759' : '#ff9500'
                            }}
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {passo === 1 ? (
                            /* PASSO 1: CRACAHA EM VERDE */
                            <div className="text-center space-y-4">
                                <div className="space-y-1">
                                    <span className="text-2xl block select-none">🪪</span>
                                    <h1 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f]">
                                        Identificação do Operador
                                    </h1>
                                    <p className="text-[10px] text-[#86868b] font-medium">
                                        Aproxime ou bipa o crachá do colaborador
                                    </p>
                                </div>

                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={modoManual ? "DIGITE O ID..." : "AGUARDANDO LEITURA..."}
                                        value={idDigitado}
                                        onChange={e => setIdDigitado(e.target.value)}
                                        className={`w-full bg-[#f5f5f7] border px-3 py-3 rounded-lg outline-none text-center text-xs font-mono tracking-widest uppercase transition-colors ${
                                            modoManual
                                                ? 'border-[#b4b4b9] text-[#1d1d1f]'
                                                : 'border-[#34c759]/30 text-[#34c759] focus:border-[#34c759]/50 caret-transparent'
                                        }`}
                                        disabled={processando}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                        ) : (
                            /* PASSO 2: FERRAMENTA EM LARANJA */
                            <div className="text-center space-y-4">
                                <div className="space-y-1">
                                    <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#ff9500] bg-[#ff9500]/5 px-2.5 py-0.5 rounded border border-[#ff9500]/10 select-none">
                                        👤 {funcionarioAtivo?.nome} {funcionarioAtivo?.sobrenome}
                                    </span>
                                    <h1 className="text-xs font-bold uppercase tracking-wide text-[#1d1d1f] pt-1">
                                        Bipar Código da Ferramenta
                                    </h1>
                                    <p className="text-[10px] text-[#86868b] font-medium">
                                        Passe o leitor no código de barras do ativo
                                    </p>
                                </div>

                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={modoManual ? "DIGITE O CÓDIGO DO ATIVO..." : "AGUARDANDO LEITURA..."}
                                        value={idDigitado}
                                        onChange={e => setIdDigitado(e.target.value)}
                                        className={`w-full bg-[#f5f5f7] border px-3 py-3 rounded-lg outline-none text-center text-xs font-mono tracking-widest uppercase transition-colors ${
                                            modoManual
                                                ? 'border-[#b4b4b9] text-[#1d1d1f]'
                                                : 'border-[#ff9500]/30 text-[#ff9500] focus:border-[#ff9500]/50 caret-transparent'
                                        }`}
                                        disabled={processando}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {statusFeed.texto && (
                            <div className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-tight text-center leading-normal ${
                                statusFeed.tipo === 'sucesso'
                                    ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                                    : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                            }`}>
                                {statusFeed.texto}
                            </div>
                        )}

                        {modoManual && (
                            <button
                                type="submit"
                                disabled={processando}
                                className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {processando ? "PROCESSANDO..." : "CONFIRMAR ENTRADA"}
                            </button>
                        )}
                    </form>

                    <div className="mt-5 border-t border-[#e5e5ea] pt-3.5 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setModoManual(!modoManual);
                                setIdDigitado('');
                            }}
                            className="text-[9px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                        >
                            {modoManual ? "🔌 Alternar para Modo Sensor Laser" : "⌨️ Digitar código manualmente"}
                        </button>
                    </div>
                </div>

            </div>

            <footer className="w-full border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left max-w-[1400px] mx-auto select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Totem Flow Engine v4.1</div>
            </footer>
        </main>
    );
}