"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
}

interface RegistroPonto {
    id: string;
    funcionarioId: string;
    data: string; // Formato ISO vindo do banco da VPS
    acao: 'entrada' | 'saida';
}

function ConteudoRelatorio() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [pontos, setPontos] = useState<RegistroPonto[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Estados para filtro de mês/ano (Padrão: Mês atual)
    const dataAtual = new Date();
    const [mesSelecionado, setMesSelecionado] = useState(dataAtual.getMonth() + 1);
    const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const carregarDados = async () => {
            if (!baseUrl) return;
            setCarregando(true);
            try {
                const [resFunc, resPontos] = await Promise.all([
                    fetch(`${baseUrl}/funcionarios`, { cache: 'no-store' }),
                    fetch(`${baseUrl}/ponto`, { cache: 'no-store' })
                ]);

                if (resFunc.ok) setFuncionarios(await resFunc.json());
                if (resPontos.ok) setPontos(await resPontos.json());
            } catch (error) {
                console.error("Erro ao carregar dados do relatório:", error);
            } finally {
                setCarregando(false);
            }
        };
        carregarDados();
    }, [baseUrl]);

    // CORRIGIDO: Nome da função unificado para evitar erro no TypeScript
    const obterDiasDoMes = () => {
        const qtdDias = new Date(anoSelecionado, mesSelecionado, 0).getDate();
        return Array.from({ length: qtdDias }, (_, i) => i + 1);
    };

    // Filtra e organiza os bipes por dia para cada funcionário
    const obterJornadaDiaria = (funcionarioId: string, dia: number) => {
        const pontosDoDia = pontos.filter(p => {
            const dataPonto = new Date(p.data);
            return (
                String(p.funcionarioId) === String(funcionarioId) &&
                dataPonto.getDate() === dia &&
                (dataPonto.getMonth() + 1) === mesSelecionado &&
                dataPonto.getFullYear() === anoSelecionado
            );
        });

        pontosDoDia.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

        const entrada = pontosDoDia.find(p => p.acao === 'entrada');
        const saida = pontosDoDia.find(p => p.acao === 'saida');

        return {
            entrada: entrada ? new Date(entrada.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---',
            saida: saida ? new Date(saida.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---'
        };
    };

    const diasDoMes = obterDiasDoMes();

    return (
        <main className="min-h-screen bg-black text-white p-8 font-sans print:bg-white print:text-black print:p-0">

            {/* PAINEL DE CONTROLE WEB (OCULTO NA IMPRESSÃO) */}
            <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40 p-6 rounded-[30px] border border-white/5 print:hidden">
                <div>
                    <Link href="/dashboard" className="text-orange-500 font-black text-[10px] uppercase tracking-[4px] mb-2 block hover:opacity-70 transition-all">← Dashboard</Link>
                    <h1 className="text-3xl font-black uppercase italic text-white leading-none">Fechamento <span className="text-orange-500">Mensal</span></h1>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={mesSelecionado}
                        onChange={(e) => setMesSelecionado(Number(e.target.value))}
                        className="bg-black border border-white/10 px-4 py-2 rounded-xl font-bold text-white outline-none focus:border-orange-500 text-sm"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>Mês {String(m).padStart(2, '0')}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => window.print()}
                        className="bg-orange-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20"
                    >
                        🖨️ Imprimir Folhas
                    </button>
                </div>
            </header>

            {/* RELATÓRIOS INDIVIDUAIS EM SÉRIE */}
            <section className="max-w-5xl mx-auto flex flex-col gap-12 print:gap-8">
                {carregando ? (
                    <div className="text-center py-20 animate-pulse font-black uppercase text-slate-800 tracking-[5px] print:hidden">Sincronizando Banco de Dados...</div>
                ) : (
                    funcionarios.map((func) => (
                        <div
                            key={func.id}
                            className="bg-slate-900/20 border border-white/5 rounded-[35px] p-8 print:border-black print:p-6 print:break-inside-avoid print:bg-white text-black bg-white"
                        >
                            {/* CABEÇALHO OFICIAL DA EMPRESA */}
                            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-black pb-4 mb-6 gap-4">
                                <div className="font-sans">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-black leading-none mb-1">GR AUTOPECAS LTDA</h2>
                                    <p className="text-[11px] font-bold text-slate-750 font-mono">CNPJ: 51.415.349/0001-25</p>
                                    <p className="text-[10px] text-slate-600 mt-1 leading-tight">
                                        Rua Coronel Vicente Ramos, Nº1552 — Olho D'água dos Cazuzinhas <br />
                                        Arapiraca - AL
                                    </p>
                                </div>
                                <div className="text-left md:text-right md:self-stretch flex flex-col justify-between">
                                    <span className="bg-black text-white print:bg-slate-100 print:text-black font-black uppercase italic text-[10px] tracking-[2px] px-3 py-1 rounded-md self-start md:self-end">
                                        Espelho de Ponto
                                    </span>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-800 mt-2 md:mt-0">
                                        Competência: {String(mesSelecionado).padStart(2, '0')}/{anoSelecionado}
                                    </p>
                                </div>
                            </div>

                            {/* DADOS DO COLABORADOR */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between gap-2 print:bg-slate-50">
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Colaborador</span>
                                    <span className="text-lg font-black uppercase italic text-black leading-none">{func.nome} {func.sobrenome}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Cargo</span>
                                    <span className="text-sm font-bold uppercase text-slate-700">{func.cargo}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">ID Interno</span>
                                    <span className="text-sm font-mono font-bold text-slate-700">{func.id}</span>
                                </div>
                            </div>

                            {/* TABELA DE BATIDAS */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                    <tr className="border-b-2 border-slate-300 text-slate-800 uppercase font-black text-[10px] tracking-wider bg-slate-100 print:bg-slate-100">
                                        <th className="py-2 px-3 w-24">Data</th>
                                        <th className="py-2 px-3">Entrada</th>
                                        <th className="py-2 px-3">Saída</th>
                                        <th className="py-2 px-3 text-right">Assinatura / Justificativa Diária</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {diasDoMes.map((dia) => {
                                        const jornada = obterJornadaDiaria(func.id, dia);
                                        return (
                                            <tr key={dia} className="border-b border-slate-200 hover:bg-slate-50 transition-colors print:border-slate-300">
                                                <td className="py-2 px-3 font-mono font-bold text-black">
                                                    {String(dia).padStart(2, '0')}/{String(mesSelecionado).padStart(2, '0')}
                                                </td>
                                                <td className={`py-2 px-3 font-mono font-bold ${jornada.entrada !== '---' ? 'text-black' : 'text-slate-400'}`}>
                                                    {jornada.entrada}
                                                </td>
                                                <td className={`py-2 px-3 font-mono font-bold ${jornada.saida !== '---' ? 'text-black' : 'text-slate-400'}`}>
                                                    {jornada.saida}
                                                </td>
                                                <td className="py-2 px-3 border-l border-dashed border-slate-200 w-1/3 print:border-slate-300"></td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            {/* RODAPÉ DE VALIDAÇÃO */}
                            <div className="mt-8 pt-6 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Gerado automaticamente via Felinto Tech</p>
                                <div className="w-64 text-center">
                                    <div className="border-b border-black w-full h-5 mb-2"></div>
                                    <p className="text-[9px] font-black uppercase tracking-wider text-black">Assinatura do Colaborador</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* ESTILOS DE IMPRESSÃO */}
            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 12mm; }
                    header { display: none !important; }
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    main { background: white !important; padding: 0 !important; }
                }
            `}</style>
        </main>
    );
}

export default function RelatorioPage() {
    return (
        <Suspense fallback={null}>
            <ConteudoRelatorio />
        </Suspense>
    );
}