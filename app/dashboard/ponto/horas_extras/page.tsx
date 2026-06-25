"use client";
import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
}

interface RegistroPonto {
    id: number;
    funcionario_id: string;
    data_registro: string;
    hora_formatada: string;
    tipo_batida: string;
}

interface HoraExtraManual {
    id: number;
    funcionario_id: string;
    data_referencia: string;
    minutos_diurnos: number;
    minutos_noturnos: number;
    observacao: string;
}

interface DiaCompetencia {
    dia: number;
    mes: number;
    ano: number;
    label: string;
}

function ConteudoHorasExtras() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [pontos, setPontos] = useState<RegistroPonto[]>([]);
    const [extrasManuais, setExtrasManuais] = useState<HoraExtraManual[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');

    const dataAtual = new Date();
    const mesInicial = dataAtual.getDate() > 15 ? dataAtual.getMonth() + 2 : dataAtual.getMonth() + 1;
    const [mesSelecionado, setMesSelecionado] = useState(mesInicial > 12 ? 1 : mesInicial);
    const [anoSelecionado, setAnoSelecionado] = useState(mesInicial > 12 ? dataAtual.getFullYear() + 1 : dataAtual.getFullYear());

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ATUALIZADO: Formata corretamente horas positivas (+) e horas subtraídas (-)
    const formatarMinutosParaHoras = (minutosTotais: number, exibirVazio = false): string => {
        if (minutosTotais === 0) return exibirVazio ? '---' : '0h';

        const isNegativo = minutosTotais < 0;
        const minutosAbsolutos = Math.abs(minutosTotais);

        const hrs = Math.floor(minutosAbsolutos / 60);
        const mnts = minutosAbsolutos % 60;
        const sinal = isNegativo ? '-' : '+';

        if (hrs === 0) return `${sinal}${mnts}m`;
        return mnts === 0 ? `${sinal}${hrs}h` : `${sinal}${hrs}h ${mnts.toString().padStart(2, '0')}m`;
    };

    useEffect(() => {
        const carregarDados = async () => {
            setCarregando(true);
            try {
                const [resFunc, resPontos, resManuais] = await Promise.all([
                    supabase.from('funcionarios').select('id, nome, sobrenome, cargo').order('nome'),
                    supabase.from('pontos').select('id, funcionario_id, data_registro, hora_formatada, tipo_batida'),
                    supabase.from('horas_extras').select('id, funcionario_id, data_referencia, minutes_diurnos, minutes_noturnos, observacao')
                ]);

                if (resFunc.data) setFuncionarios(resFunc.data);
                if (resPontos.data) setPontos(resPontos.data as unknown as RegistroPonto[]);

                // Trata o mapeamento caso o banco possua os campos renomeados/originais de minutos
                if (resManuais.data) {
                    const normais = resManuais.data.map((m: any) => ({
                        id: m.id,
                        funcionario_id: m.funcionario_id,
                        data_referencia: m.data_referencia,
                        minutos_diurnos: m.minutes_diurnos ?? m.minutos_diurnos ?? 0,
                        minutos_noturnos: m.minutes_noturnos ?? m.minutos_noturnos ?? 0,
                        observacao: m.observacao
                    }));
                    setExtrasManuais(normais);
                }
            } catch (error) {
                console.error("Erro ao carregar dados de horas extras:", error);
            } finally {
                setCarregando(false);
            }
        };
        carregarDados();
    }, []);

    const diasDoCiclo = useMemo((): DiaCompetencia[] => {
        const listaDias: DiaCompetencia[] = [];
        let mesAnterior = mesSelecionado - 1;
        let anoAnterior = anoSelecionado;
        if (mesAnterior === 0) { mesAnterior = 12; anoAnterior = anoSelecionado - 1; }

        const totalDiasMesAnterior = new Date(anoAnterior, mesAnterior, 0).getDate();

        for (let d = 16; d <= totalDiasMesAnterior; d++) {
            listaDias.push({ dia: d, mes: mesAnterior, ano: anoAnterior, label: `${String(d).padStart(2, '0')}/${String(mesAnterior).padStart(2, '0')}` });
        }
        for (let d = 1; d <= 15; d++) {
            listaDias.push({ dia: d, mes: mesSelecionado, ano: anoSelecionado, label: `${String(d).padStart(2, '0')}/${String(mesSelecionado).padStart(2, '0')}` });
        }
        return listaDias;
    }, [mesSelecionado, anoSelecionado]);

    const mapaPontos = useMemo(() => {
        const mapa: { [chave: string]: RegistroPonto[] } = {};
        pontos.forEach(p => {
            if (!p.data_registro) return;
            const dLocal = new Date(new Date(p.data_registro).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const chave = `${p.funcionario_id}-${dLocal.getFullYear()}-${dLocal.getMonth() + 1}-${dLocal.getDate()}`;
            if (!mapa[chave]) mapa[chave] = [];
            mapa[chave].push(p);
        });
        Object.keys(mapa).forEach(chave => {
            mapa[chave].sort((a, b) => a.hora_formatada.localeCompare(b.hora_formatada));
        });
        return mapa;
    }, [pontos]);

    const mapaManuais = useMemo(() => {
        const mapa: { [chave: string]: { diurnos: number; noturnos: number } } = {};
        extrasManuais.forEach(m => {
            if (!m.data_referencia) return;
            const [ano, mes, dia] = m.data_referencia.split('-').map(Number);
            const chave = `${m.funcionario_id}-${ano}-${mes}-${dia}`;

            if (!mapa[chave]) mapa[chave] = { diurnos: 0, noturnos: 0 };
            mapa[chave].diurnos += Number(m.minutos_diurnos || 0);
            mapa[chave].noturnos += Number(m.minutos_noturnos || 0);
        });
        return mapa;
    }, [extrasManuais]);

    // ATUALIZADO: Subtrai os minutos lançados (negativos) e impede que o total do dia fique abaixo de zero
    const calcularExtrasTotaisDoDia = (funcionarioId: string, itemDia: DiaCompetencia) => {
        const chave = `${funcionarioId}-${itemDia.ano}-${itemDia.mes}-${itemDia.dia}`;
        const pts = mapaPontos[chave] || [];
        const manualDoDia = mapaManuais[chave];

        let extraDiurnaCalculada = 0;
        let extraNoturnaCalculada = 0;

        if (pts.length >= 4) {
            const converteParaMinutos = (hhmm: string) => {
                const [h, m] = hhmm.split(':').map(Number);
                return h * 60 + m;
            };

            const entrada = converteParaMinutos(pts[0].hora_formatada);
            const saidaAlm = converteParaMinutos(pts[1].hora_formatada);
            const voltaAlm = converteParaMinutos(pts[2].hora_formatada);
            const saidaFim = converteParaMinutos(pts[3].hora_formatada);

            const minutosTrabalhadosManha = saidaAlm - entrada;
            const minutosTrabalhadosTarde = saidaFim - voltaAlm;
            const totalTrabalhadoNoDia = minutosTrabalhadosManha + minutosTrabalhadosTarde;

            const jornadaPadraoMinutos = 8 * 60;

            if (totalTrabalhadoNoDia > jornadaPadraoMinutos) {
                let minutosExtrasRestantes = totalTrabalhadoNoDia - jornadaPadraoMinutos;
                const limiteNoite = 18 * 60;

                if (saidaFim > limiteNoite) {
                    const excedenteNoite = saidaFim - limiteNoite;
                    extraNoturnaCalculada = Math.min(excedenteNoite, minutosExtrasRestantes);
                    minutosExtrasRestantes -= extraNoturnaCalculada;
                }
                extraDiurnaCalculada = minutosExtrasRestantes;
            }
        }

        // Soma o valor calculado do ponto com o manual (se for negativo, a matemática faz a subtração)
        const diurnaFinal = extraDiurnaCalculada + (manualDoDia ? manualDoDia.diurnos : 0);
        const noturnaFinal = extraNoturnaCalculada + (manualDoDia ? manualDoDia.noturnos : 0);

        // Se a subtração manual superou o que o colaborador tinha ganho no dia, limita o dia em 0.
        return {
            diurna: Math.max(0, diurnaFinal),
            noturna: Math.max(0, noturnaFinal),
            // Passamos os manuais puros caso precise auditar se houve desconto
            descontoDiurno: manualDoDia?.diurnos < 0 ? manualDoDia.diurnos : 0,
            descontoNoturno: manualDoDia?.noturnos < 0 ? manualDoDia.noturnos : 0
        };
    };

    const resumoFuncionariosComExtras = useMemo(() => {
        return funcionarios
            .filter(func => {
                const termo = pesquisa.toLowerCase().trim();
                if (!termo) return true;
                const nomeCompleto = `${func.nome} ${func.sobrenome}`.toLowerCase();
                return nomeCompleto.includes(termo) || String(func.id).includes(termo);
            })
            .map(func => {
                let totalDiurna = 0;
                let totalNoturna = 0;

                diasDoCiclo.forEach(itemDia => {
                    const extras = calcularExtrasTotaisDoDia(func.id, itemDia);
                    totalDiurna += extras.diurna;
                    totalNoturna += extras.noturna;
                });

                return {
                    ...func,
                    totalDiurnaMinutos: totalDiurna,
                    totalNoturnaMinutos: totalNoturna,
                    diurnaFormatada: formatarMinutosParaHoras(totalDiurna, true),
                    noturnaFormatada: formatarMinutosParaHoras(totalNoturna, true),
                    temExtras: totalDiurna > 0 || totalNoturna > 0
                };
            })
            .filter(func => func.temExtras);
    }, [funcionarios, diasDoCiclo, mapaPontos, mapaManuais, pesquisa]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 print:bg-white print:text-black print:p-0">

            {/* PAINEL ADMINISTRATIVO */}
            <header className="max-w-5xl mx-auto mb-6 bg-white border border-[#e5e5ea] p-4 sm:p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] print:hidden">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="space-y-1 pl-1">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Módulos Operacionais
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Banco de Horas Extras
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar por colaborador..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3.5 py-2 rounded-lg font-medium text-[#1d1d1f] text-xs outline-none transition-colors w-full sm:w-56 placeholder-[#b4b4b9] uppercase"
                        />
                        <select
                            value={mesSelecionado}
                            onChange={(e) => setMesSelecionado(Number(e.target.value))}
                            className="bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg font-semibold text-[#1d1d1f] text-xs outline-none transition-colors cursor-pointer w-full sm:w-auto"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Ciclo até 15/{String(m).padStart(2, '0')}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => window.print()}
                            className="bg-[#1d1d1f] active:bg-black text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors w-full sm:w-auto"
                        >
                            🖨️ Imprimir
                        </button>
                    </div>
                </div>
            </header>

            {/* LISTAGEM DE ACUMULADOS MENSAL */}
            <section className="max-w-5xl mx-auto flex flex-col gap-6 print:gap-0">
                {carregando ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                        <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Consolidando Auditoria...</span>
                    </div>
                ) : resumoFuncionariosComExtras.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-[#e5e5ea] rounded-2xl text-[#86868b] font-semibold text-xs uppercase tracking-wide">
                        Nenhum colaborador com horas extras neste ciclo.
                    </div>
                ) : (
                    resumoFuncionariosComExtras.map((func, index) => (
                        <div key={func.id}>
                            {index > 0 && (
                                <div className="hidden print:block border-b-2 border-black my-8" />
                            )}

                            <div className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] print:border-none print:shadow-none print:p-0 print:break-inside-avoid">

                                {/* CABEÇALHO INDIVIDUAL */}
                                <div className="flex flex-col sm:flex-row justify-between items-start border-b border-[#f5f5f7] pb-4 mb-4 gap-2 sm:gap-0">
                                    <div className="leading-tight">
                                        <h3 className="text-sm sm:text-base font-bold tracking-tight text-[#1d1d1f] uppercase">{func.nome} {func.sobrenome}</h3>
                                        <p className="text-[10px] font-mono font-bold text-[#86868b] uppercase tracking-wide mt-0.5">{func.cargo} • ID: {func.id}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[9px] font-bold text-[#86868b] uppercase tracking-wider">Período de Competência</p>
                                        <p className="font-mono font-bold text-[#1d1d1f] text-xs mt-0.5">16/{String(mesSelecionado === 1 ? 12 : mesSelecionado - 1).padStart(2, '0')} a 15/{String(mesSelecionado).padStart(2, '0')}/{anoSelecionado}</p>
                                    </div>
                                </div>

                                {/* QUADRO DE RESUMO ACUMULADO COM DESCONTOS EMBUTIDOS */}
                                <div className="grid grid-cols-2 gap-4 mb-5 bg-[#f5f5f7] p-4 rounded-xl print:bg-[#f5f5f7]">
                                    <div className="text-center border-r border-[#e5e5ea]">
                                        <p className="text-[9px] font-bold text-[#86868b] uppercase tracking-wider">Total Extra Diurna</p>
                                        <p className="text-base font-mono font-black text-[#248a3d] mt-0.5">{func.diurnaFormatada}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-[#86868b] uppercase tracking-wider">Total Extra Noturna</p>
                                        <p className="text-base font-mono font-black text-[#5856d6] mt-0.5">{func.noturnaFormatada}</p>
                                    </div>
                                </div>

                                {/* DETALHAMENTO (NÃO MEXAM) */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                        <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase font-bold text-[8px] tracking-wider bg-[#f5f5f7]/50 select-none">
                                            <th className="py-2 px-2 w-16">Data</th>
                                            <th className="py-2 px-2 text-center w-16">Entrada</th>
                                            <th className="py-2 px-2 text-center w-16">Saída</th>
                                            <th className="py-2 px-2 text-center w-16">Volta</th>
                                            <th className="py-2 px-2 text-center w-16">Término</th>
                                            <th className="py-2 px-2 text-center w-24">Extra Diurna</th>
                                            <th className="py-2 px-2 text-center w-24">Extra Noturna</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#f5f5f7]">
                                        {diasDoCiclo.map((itemDia, idx) => {
                                            const extras = calcularExtrasTotaisDoDia(func.id, itemDia);
                                            const chave = `${func.id}-${itemDia.ano}-${itemDia.mes}-${itemDia.dia}`;
                                            const pts = mapaPontos[chave] || [];
                                            const manual = mapaManuais[chave];

                                            // Se o dia não tem batidas e não tem lançamento manual (seja extra ou desconto), pula a linha
                                            if (extras.diurna === 0 && extras.noturna === 0 && !manual) return null;

                                            // Cor de destaque visual se o dia tiver um desconto manual ativo
                                            const possuiDesconto = (manual?.diurnos < 0 || manual?.noturnos < 0);

                                            return (
                                                <tr key={idx} className={`transition-colors ${possuiDesconto ? 'bg-orange-50/40 hover:bg-orange-50/60' : 'hover:bg-f5f5f7/30'}`}>
                                                    <td className="py-2.5 px-2 font-mono font-bold text-[#1d1d1f]">
                                                        {itemDia.label}
                                                        {possuiDesconto && <span className="text-[9px] text-orange-600 block font-sans font-normal print:hidden">Descontado</span>}
                                                    </td>
                                                    <td className="py-2.5 px-2 font-mono text-center text-slate-500">{pts[0]?.hora_formatada || '---'}</td>
                                                    <td className="py-2.5 px-2 font-mono text-center text-slate-500">{pts[1]?.hora_formatada || '---'}</td>
                                                    <td className="py-2.5 px-2 font-mono text-center text-slate-500">{pts[2]?.hora_formatada || '---'}</td>
                                                    <td className="py-2.5 px-2 font-mono text-center text-slate-500">{pts[3]?.hora_formatada || '---'}</td>

                                                    {/* COLUNA DIURNA (Muda a cor para vermelho/laranja se o saldo final ou o lançamento manual do dia for de desconto) */}
                                                    <td className={`py-2.5 px-2 font-mono text-center font-bold ${manual?.diurnos < 0 && extras.diurna === 0 ? 'text-red-500' : 'text-[#248a3d]'}`}>
                                                        {manual?.diurnos < 0 && extras.diurna === 0
                                                            ? formatarMinutosParaHoras(manual.diurnos)
                                                            : extras.diurna > 0 ? formatarMinutosParaHoras(extras.diurna) : '---'
                                                        }
                                                    </td>

                                                    {/* COLUNA NOTURNA */}
                                                    <td className={`py-2.5 px-2 font-mono text-center font-bold ${manual?.noturnos < 0 && extras.noturna === 0 ? 'text-red-500' : 'text-[#5856d6]'}`}>
                                                        {manual?.noturnos < 0 && extras.noturna === 0
                                                            ? formatarMinutosParaHoras(manual.noturnos)
                                                            : extras.noturna > 0 ? formatarMinutosParaHoras(extras.noturna) : '---'
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}

export default function HorasExtrasPage() {
    return (
        <Suspense fallback={null}>
            <ConteudoHorasExtras />
        </Suspense>
    );
}