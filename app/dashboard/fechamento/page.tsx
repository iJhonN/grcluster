"use client";
import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Funcionario { id: string; nome: string; sobrenome: string; cargo: string; }
interface RegistroPonto { id: number; funcionario_id: string; data_registro: string; hora_formatada: string; tipo_batida: string; observacao: string; }
interface RegistroPausa { id: number; funcionario_id: string; data: string; minutos_ajuste: number; tipo: string; observacao: string; }
interface SaidaEmergency { id: string; funcionario_id: string; horario_saida: string; horario_retorno: string | null; justificativa: string; }
interface HoraExtraManual { id: number; funcionario_id: string; data_referencia: string; minutos_diurnos: number; minutos_noturnos: number; }
interface BancoHorasMovimentacao { id: number; funcionario_id: string; data_evento: string; minutos_ajuste: number; tipo_hora: 'DIURNA' | 'NOTURNA'; motivo: string; }
interface DiaCompetencia { dia: number; mes: number; ano: number; label: string; diaSemanaLabel: string; isFimDeSemana: boolean; isDomingo: boolean; }

function FechamentoMensal() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [pontos, setPontos] = useState<RegistroPonto[]>([]);
    const [pausas, setPausas] = useState<RegistroPausa[]>([]);
    const [saidasEmergencia, setSaidasEmergencia] = useState<SaidaEmergency[]>([]);
    const [horasExtrasManuais, setHorasExtrasManuais] = useState<HoraExtraManual[]>([]);
    const [movimentacoesBanco, setMovimentacoesBanco] = useState<BancoHorasMovimentacao[]>([]);

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

    useEffect(() => {
        const carregarDadosDoCiclo = async () => {
            setCarregando(true);
            try {
                let mesInicio = mesSelecionado - 1;
                let anoInicio = anoSelecionado;

                if (mesInicio === 0) {
                    mesInicio = 12;
                    anoInicio -= 1;
                }

                const dataInicioFiltro = `${anoInicio}-${String(mesInicio).padStart(2, '0')}-16T00:00:00-03:00`;
                const dataFimFiltro = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}-15T23:59:59-03:00`;

                // MOTOR DE PAGINAÇÃO: Fura o limite de 1000 linhas do Supabase
                const buscarComPaginacao = async (tabela: string, colunas: string, colunaFiltroData: string) => {
                    let todosOsDados: any[] = [];
                    let from = 0;
                    const step = 999;
                    let temMais = true;

                    while (temMais) {
                        const { data, error } = await supabase
                            .from(tabela)
                            .select(colunas)
                            .gte(colunaFiltroData, dataInicioFiltro)
                            .lte(colunaFiltroData, dataFimFiltro)
                            .range(from, from + step);

                        if (error) throw error;

                        if (data && data.length > 0) {
                            todosOsDados = [...todosOsDados, ...data];
                            from += (step + 1);
                            // Se a busca retornar menos linhas que o tamanho do passo, a tabela terminou
                            if (data.length <= step) temMais = false;
                        } else {
                            temMais = false;
                        }
                    }
                    return todosOsDados;
                };

                const [rF, ptsDb, pausasDb, saidasDb, extrasDb, bancoDb] = await Promise.all([
                    supabase.from('funcionarios').select('id, nome, sobrenome, cargo').order('nome'),
                    buscarComPaginacao('pontos', 'id, funcionario_id, data_registro, hora_formatada, tipo_batida, observacao', 'data_registro'),
                    buscarComPaginacao('pausas', 'id, funcionario_id, data, minutos_ajuste, tipo, observacao', 'data'),
                    buscarComPaginacao('saidas_emergencia', 'id, funcionario_id, horario_saida, horario_retorno, justificativa', 'horario_saida'),
                    buscarComPaginacao('horas_extras', 'id, funcionario_id, data_referencia, minutos_diurnos, minutos_noturnos', 'data_referencia'),
                    buscarComPaginacao('banco_horas', 'id, funcionario_id, data_evento, minutos_ajuste, tipo_hora, motivo', 'data_evento')
                ]);

                if (rF.data) setFuncionarios(rF.data as Funcionario[]);

                setPontos(ptsDb as RegistroPonto[]);
                setPausas(pausasDb as unknown as RegistroPausa[]);
                setSaidasEmergencia(saidasDb as unknown as SaidaEmergency[]);
                setHorasExtrasManuais(extrasDb as unknown as HoraExtraManual[]);
                setMovimentacoesBanco(bancoDb as unknown as BancoHorasMovimentacao[]);

            } catch (err) {
                console.error("Erro ao carregar folha:", err);
            } finally {
                setCarregando(false);
            }
        };
        carregarDadosDoCiclo();
    }, [supabase, mesSelecionado, anoSelecionado]);

    const diasDaCompetencia = useMemo((): DiaCompetencia[] => {
        const dias: DiaCompetencia[] = [];
        const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

        let mesAnterior = mesSelecionado - 1;
        let anoAnterior = anoSelecionado;
        if (mesAnterior === 0) {
            mesAnterior = 12;
            anoAnterior -= 1;
        }

        const totalDiasMesAnterior = new Date(anoAnterior, mesAnterior, 0).getDate();

        for (let d = 16; d <= totalDiasMesAnterior; d++) {
            const dataObj = new Date(anoAnterior, mesAnterior - 1, d);
            const diaSemana = dataObj.getDay();
            dias.push({
                dia: d, mes: mesAnterior, ano: anoAnterior,
                label: `${String(d).padStart(2, '0')}/${String(mesAnterior).padStart(2, '0')}`,
                diaSemanaLabel: diasSemana[diaSemana],
                isFimDeSemana: diaSemana === 0 || diaSemana === 6,
                isDomingo: diaSemana === 0
            });
        }

        for (let d = 1; d <= 15; d++) {
            const dataObj = new Date(anoSelecionado, mesSelecionado - 1, d);
            const diaSemana = dataObj.getDay();
            dias.push({
                dia: d, mes: mesSelecionado, ano: anoSelecionado,
                label: `${String(d).padStart(2, '0')}/${String(mesSelecionado).padStart(2, '0')}`,
                diaSemanaLabel: diasSemana[diaSemana],
                isFimDeSemana: diaSemana === 0 || diaSemana === 6,
                isDomingo: diaSemana === 0
            });
        }
        return dias;
    }, [mesSelecionado, anoSelecionado]);

    const mapaGeralDeApontamentos = useMemo(() => {
        const mapa: any = {};

        pontos.forEach(p => {
            if (!p.data_registro) return;
            const dataLocal = new Date(new Date(p.data_registro).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const chave = `${p.funcionario_id}-${dataLocal.getFullYear()}-${dataLocal.getMonth() + 1}-${dataLocal.getDate()}`;

            if (!mapa[chave]) mapa[chave] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };
            mapa[chave].pontos.push(p);

            if (p.observacao === 'Atraso') mapa[chave].temAtraso = true;
        });

        pausas.forEach(p => {
            if (!p.data) return;
            const dataLocal = new Date(new Date(p.data).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const chave = `${p.funcionario_id}-${dataLocal.getFullYear()}-${dataLocal.getMonth() + 1}-${dataLocal.getDate()}`;

            if (!mapa[chave]) mapa[chave] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };

            if (p.tipo === 'pausa') {
                mapa[chave].minutosPausa += Number(p.minutos_ajuste || 0);
            } else if (p.tipo === 'feriado' || p.tipo === 'folga' || p.tipo === 'justificativa') {
                const obsFormatada = String(p.observacao || '').toUpperCase();
                if (mapa[chave].textoAjuste.startsWith('ATESTADO:')) return;

                if (p.tipo === 'justificativa' || obsFormatada.startsWith('ATESTADO:')) {
                    mapa[chave].textoAjuste = obsFormatada;
                } else {
                    mapa[chave].textoAjuste = obsFormatada;
                }
            }
        });

        movimentacoesBanco.forEach(b => {
            if (!b.data_evento) return;
            const [ano, mes, dia] = b.data_evento.split('-').map(Number);
            const chave = `${b.funcionario_id}-${ano}-${mes}-${dia}`;

            if (!mapa[chave]) mapa[chave] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };

            if (!mapa[chave].textoAjuste.startsWith('ATESTADO:')) {
                mapa[chave].textoAjuste = String(b.motivo || '').toUpperCase();
            }

            if (b.tipo_hora === 'DIURNA') mapa[chave].descontoDiurno += Math.abs(b.minutos_ajuste);
            else if (b.tipo_hora === 'NOTURNA') mapa[chave].descontoNoturno += Math.abs(b.minutos_ajuste);
        });

        saidasEmergencia.forEach(s => {
            if (!s.horario_saida) return;
            const dataLocal = new Date(new Date(s.horario_saida).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const chave = `${s.funcionario_id}-${dataLocal.getFullYear()}-${dataLocal.getMonth() + 1}-${dataLocal.getDate()}`;

            if (!mapa[chave]) mapa[chave] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };

            const formatarHora = (iso: string | null) => !iso ? 'Ab.' : new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
            const calcularMinutos = (saida: string, retorno: string | null) => !retorno ? 0 : Math.floor((new Date(retorno).getTime() - new Date(saida).getTime()) / 60000);

            const minutosFora = calcularMinutos(s.horario_saida, s.horario_retorno);
            const horaSaida = formatarHora(s.horario_saida);
            const horaRetorno = formatarHora(s.horario_retorno);
            const duracaoStr = minutosFora > 0 ? `${minutosFora}m` : 'Ab.';

            mapa[chave].emergenciaMinutosTotais += minutosFora;
            mapa[chave].emergenciaSaida = mapa[chave].emergenciaSaida === '---' ? horaSaida : `${mapa[chave].emergenciaSaida}|${horaSaida}`;
            mapa[chave].emergenciaRetorno = mapa[chave].emergenciaRetorno === '---' ? horaRetorno : `${mapa[chave].emergenciaRetorno}|${horaRetorno}`;
            mapa[chave].emergenciaDuracao = mapa[chave].emergenciaDuracao === '---' ? duracaoStr : `${mapa[chave].emergenciaDuracao}|${duracaoStr}`;
            mapa[chave].justificativa = mapa[chave].justificativa === '' ? s.justificativa : `${mapa[chave].justificativa}; ${s.justificativa}`;
        });

        horasExtrasManuais.forEach(m => {
            if (!m.data_referencia) return;
            const [ano, mes, dia] = m.data_referencia.split('-').map(Number);
            const chave = `${m.funcionario_id}-${ano}-${mes}-${dia}`;

            if (!mapa[chave]) mapa[chave] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };

            mapa[chave].extraManualDiurna += Number(m.minutos_diurnos || 0);
            mapa[chave].extraManualNoturna += Number(m.minutos_noturnos || 0);
        });

        Object.keys(mapa).forEach(k => mapa[k].pontos.sort((a: any, b: any) => a.hora_formatada.localeCompare(b.hora_formatada)));
        return mapa;
    }, [pontos, pausas, saidasEmergencia, horasExtrasManuais, movimentacoesBanco]);

    const obterDadosDoDia = (funcionarioId: string, itemDia: DiaCompetencia) => {
        const chave = `${funcionarioId}-${itemDia.ano}-${itemDia.mes}-${itemDia.dia}`;
        const dadosDia = mapaGeralDeApontamentos[chave];

        const resultadoVazio = {
            entrada: '---', saidaAlmoço: '---', voltaAlmoço: '---', saidaFinal: '---',
            totalPausa: '---', emSaida: '---', emRetorno: '---', emDuracao: '---',
            justificativa: '', extraDiurnaMinutos: 0, extraNoturnaMinutos: 0, minutosEmergenciaAcumuladoDia: 0, minutosPausaPurosDia: 0, temAtraso: false,
            textoAjuste: '', descontoDiurno: 0, descontoNoturno: 0
        };

        if (!dadosDia) return resultadoVazio;

        const pts = dadosDia.pontos;
        let extraDiurna = 0;
        let extraNoturna = 0;

        if (pts.length >= 4) {
            const converterParaMinutos = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

            const minEntrada = converterParaMinutos(pts[0].hora_formatada);
            const minSaidaAlmoco = converterParaMinutos(pts[1].hora_formatada);
            const minVoltaAlmoco = converterParaMinutos(pts[2].hora_formatada);
            const minSaidaFinal = converterParaMinutos(pts[3].hora_formatada);

            const tempoTrabalhadoTotal = (minSaidaAlmoco - minEntrada) + (minSaidaFinal - minVoltaAlmoco);
            const jornadaPadrao = 8 * 60; // 8 horas

            if (tempoTrabalhadoTotal > jornadaPadrao) {
                let tempoExtraRestante = tempoTrabalhadoTotal - jornadaPadrao;
                const limiteNoturno = 18 * 60; // 18:00

                if (minSaidaFinal > limiteNoturno) {
                    extraNoturna = Math.min(minSaidaFinal - limiteNoturno, tempoExtraRestante);
                    tempoExtraRestante -= extraNoturna;
                }
                extraDiurna = tempoExtraRestante;
            }
        }

        return {
            entrada: pts[0] ? pts[0].hora_formatada : '---',
            saidaAlmoço: pts[1] ? pts[1].hora_formatada : '---',
            voltaAlmoço: pts[2] ? pts[2].hora_formatada : '---',
            saidaFinal: pts[3] ? pts[3].hora_formatada : '---',
            totalPausa: dadosDia.minutosPausa > 0 ? `${dadosDia.minutosPausa} min` : '---',
            emSaida: dadosDia.emergenciaSaida,
            emRetorno: dadosDia.emergenciaRetorno,
            emDuracao: dadosDia.emergenciaDuracao,
            justificativa: dadosDia.justificativa,
            extraDiurnaMinutos: extraDiurna + dadosDia.extraManualDiurna,
            extraNoturnaMinutos: extraNoturna + dadosDia.extraManualNoturna,
            minutosEmergenciaAcumuladoDia: dadosDia.emergenciaMinutosTotais,
            minutosPausaPurosDia: dadosDia.minutosPausa,
            temAtraso: dadosDia.temAtraso,
            textoAjuste: dadosDia.textoAjuste,
            descontoDiurno: dadosDia.descontoDiurno,
            descontoNoturno: dadosDia.descontoNoturno
        };
    };

    const formatarMinutosParaHoras = (minutosTotal: number) => {
        const isNegativo = minutosTotal < 0;
        const absoluto = Math.abs(minutosTotal);
        const horas = Math.floor(absoluto / 60);
        const minsRestantes = absoluto % 60;
        return `${isNegativo ? '-' : ''}${horas}h ${minsRestantes.toString().padStart(2, '0')}m`;
    };

    const funcionariosFiltrados = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        if (!termo) return funcionarios;
        return funcionarios.filter(f => `${f.nome} ${f.sobrenome}`.toLowerCase().includes(termo) || String(f.id).includes(termo));
    }, [funcionarios, pesquisa]);

    return (
        <main className="min-h-screen bg-black text-white p-4 font-sans print:bg-white print:text-black print:p-0 w-full">
            <header className="max-w-[1400px] mx-auto mb-6 bg-slate-900/40 p-5 rounded-[25px] border border-white/5 print:hidden">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <Link href="/dashboard" className="text-orange-500 font-black text-[10px] uppercase tracking-[4px] mb-1 block hover:opacity-70 transition-all">← Dashboard</Link>
                        <h1 className="text-2xl font-black uppercase italic text-white leading-none">Fechamento <span className="text-orange-500">Mensal</span></h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input type="text" placeholder="Buscar por nome ou ID..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} className="bg-black border border-white/10 px-4 py-2 rounded-xl font-bold text-white text-sm outline-none focus:border-orange-500 w-full sm:w-64" />
                        <select value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))} className="bg-black border border-white/10 px-3 py-2 rounded-xl font-bold text-white text-sm outline-none cursor-pointer">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Ciclo até 15/{String(m).padStart(2, '0')}</option>
                            ))}
                        </select>
                        <button onClick={() => window.print()} className="bg-orange-600 px-5 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all">🖨️ Imprimir</button>
                    </div>
                </div>
            </header>

            <section className="max-w-[1400px] print:max-w-[820px] mx-auto flex flex-col gap-8 print:gap-0 w-full">
                {carregando ? (
                    <div className="text-center py-20 animate-pulse font-black uppercase text-slate-800 tracking-[5px] print:hidden">Sincronizando Banco de Dados...</div>
                ) : (
                    funcionariosFiltrados.map((func) => {
                        let acumuladoDiurna = 0;
                        let acumuladoNoturna = 0;
                        let acumuladoEmergencia = 0;
                        let acumuladoPausas = 0;

                        return (
                            <div key={func.id} className="bg-white text-black p-4 sm:p-6 print:p-4 mb-6 border border-slate-200 rounded-[24px] print:border-slate-300 print:break-inside-avoid print:page-break-after-always shadow-md w-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-black pb-3 mb-4 text-xs w-full">
                                    <div className="space-y-1">
                                        <h2 className="text-base print:text-sm font-black uppercase tracking-tight text-black leading-none">GR AUTOPECAS LTDA</h2>
                                        <p className="text-[10px] print:text-[9px] font-bold text-slate-700 font-mono">CNPJ: 51.415.349/0001-25</p>
                                        <p className="text-[9px] print:text-[8px] text-slate-500 leading-tight">Rua Coronel Vicente Ramos, Nº1552 — Arapiraca - AL</p>
                                    </div>
                                    <div className="text-left sm:text-right space-y-1">
                                        <p className="text-[9px] print:text-[8px] font-black uppercase text-slate-400 tracking-wider leading-none">Colaborador</p>
                                        <h3 className="text-base print:text-sm font-black uppercase italic text-black leading-none">{func.nome} {func.sobrenome}</h3>
                                        <p className="text-[10px] print:text-[9px] font-bold text-orange-600 uppercase tracking-wide leading-none">{func.cargo} • ID: {func.id}</p>
                                        <p className="text-xs print:text-[10px] font-black uppercase tracking-wider text-slate-800">
                                            Período: 16/{String(mesSelecionado === 1 ? 12 : mesSelecionado - 1).padStart(2, '0')} a 15/{String(mesSelecionado).padStart(2, '0')}/{anoSelecionado}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full overflow-x-auto print:overflow-visible">
                                    <table className="w-full text-left text-xs print:text-[9px] border-collapse table-auto print:table-fixed min-w-[950px] print:min-w-0">
                                        <thead>
                                        <tr className="border-b border-slate-300 text-slate-800 uppercase font-black text-[10px] print:text-[7.5px] tracking-wider bg-slate-100">
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 w-[85px] print:w-[58px] min-w-[85px] print:min-w-0">Data</th>
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 text-center w-[60px] print:w-[38px] min-w-[60px] print:min-w-0">Entrada</th>
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 text-center w-[60px] print:w-[38px] min-w-[60px] print:min-w-0">Sai Alm</th>
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 text-center w-[60px] print:w-[38px] min-w-[60px] print:min-w-0">Vol Alm</th>
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 text-center w-[60px] print:w-[38px] min-w-[60px] print:min-w-0">Sai Fim</th>
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 text-center w-[65px] print:w-[42px] min-w-[65px] print:min-w-0 text-red-600 bg-red-500/5 font-black border-l border-slate-200">S. Emerg</th>
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 text-center w-[65px] print:w-[42px] min-w-[65px] print:min-w-0 text-red-600 bg-red-500/5 font-black">V. Emerg</th>
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 text-center w-[60px] print:w-[38px] min-w-[60px] print:min-w-0 text-red-700 bg-red-500/10 font-black border-r border-slate-200">Tempo</th>
                                            <th className="py-2 px-3 print:py-1 print:px-1.5 text-left w-[220px] print:w-[120px] min-w-[200px] print:min-w-0 text-red-700 bg-red-500/5 font-black">Motivo Emergência</th>
                                            <th className="py-2 px-2 print:py-1 print:px-0.5 text-center w-[70px] print:w-[42px] min-w-[70px] print:min-w-0 text-orange-600 border-l border-slate-200">Tot Pausa</th>
                                            <th className="py-2 px-2 print:py-1 print:px-1 text-right min-w-[150px] print:min-w-0 border-l border-dashed border-slate-300">Assinatura / Ajustes</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {diasDaCompetencia.map((itemDia, idx) => {
                                            const diaProcessado = obterDadosDoDia(func.id, itemDia);
                                            acumuladoDiurna += (diaProcessado.extraDiurnaMinutos - diaProcessado.descontoDiurno);
                                            acumuladoNoturna += (diaProcessado.extraNoturnaMinutos - diaProcessado.descontoNoturno);
                                            acumuladoEmergencia += diaProcessado.minutosEmergenciaAcumuladoDia;
                                            acumuladoPausas += diaProcessado.minutosPausaPurosDia;
                                            const temAjusteNaTabela = !!diaProcessado.textoAjuste;

                                            return (
                                                <tr key={idx} className={`border-b border-slate-100 transition-colors text-xs print:text-[9px] print:[color-adjust:exact] [color-adjust:exact] ${diaProcessado.temAtraso ? 'bg-red-50/70 border-l-4 border-l-red-500 font-medium hover:bg-red-100/60 print:bg-red-100/60 print:border-l-0' : temAjusteNaTabela ? 'bg-yellow-50 hover:bg-yellow-100/80 font-semibold print:bg-yellow-100/60' : itemDia.isFimDeSemana ? 'bg-slate-100/70 font-medium hover:bg-slate-200/50 print:bg-slate-100' : 'hover:bg-slate-50'}`}>
                                                    <td className={`py-2 px-2 print:py-0.5 print:px-0.5 font-mono font-black whitespace-nowrap ${diaProcessado.temAtraso ? 'text-red-700 print:text-black print:font-black' : temAjusteNaTabela ? 'text-amber-800' : itemDia.isDomingo ? 'text-blue-700' : itemDia.isFimDeSemana ? 'text-emerald-600' : 'text-black'}`}>
                                                        {itemDia.label} <span className="font-sans font-bold text-[10px] print:text-[8px] opacity-75">[{itemDia.diaSemanaLabel}]</span>
                                                    </td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center text-slate-700">{diaProcessado.entrada}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center text-slate-600">{diaProcessado.saidaAlmoço}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center text-slate-600">{diaProcessado.voltaAlmoço}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center text-slate-700">{diaProcessado.saidaFinal}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center font-black text-red-600 bg-red-500/[0.03] print:bg-red-500/[0.03] border-l border-slate-100">{diaProcessado.emSaida}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center font-black text-red-600 bg-red-500/[0.03] print:bg-red-500/[0.03]">{diaProcessado.emRetorno}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center font-black text-red-700 bg-red-500/[0.07] print:bg-red-500/[0.07] border-r border-slate-100">{diaProcessado.emDuracao}</td>
                                                    <td className="py-2 px-3 print:py-0.5 print:px-1.5 text-left text-xs print:text-[7px] font-black text-red-700 bg-red-500/[0.03] print:bg-red-500/[0.03] italic whitespace-normal break-words print:truncate" title={diaProcessado.justificativa}>{diaProcessado.justificativa || '---'}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center font-black text-orange-600 bg-orange-500/[0.02] print:bg-orange-500/[0.02] border-l border-slate-100">{diaProcessado.totalPausa}</td>
                                                    <td className={`py-2 px-2 print:py-0.5 print:px-1 border-l border-dashed border-slate-200 text-center font-mono font-black text-[8px] uppercase tracking-tight whitespace-nowrap ${diaProcessado.textoAjuste.startsWith('ATESTADO:') ? 'text-red-600 font-extrabold' : temAjusteNaTabela ? 'text-amber-700 font-black' : 'text-[#007aff]'}`}>
                                                        {diaProcessado.textoAjuste || ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2 bg-slate-50 p-4 print:p-2.5 rounded-xl border border-slate-200/80">
                                    <div className="text-center border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-2 lg:pb-0 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-1"><span className="text-xs print:text-[9px]">☀️</span><p className="text-[10px] print:text-[7.5px] font-black text-slate-500 uppercase tracking-wider leading-none">Total Extra Diurna (Líquido)</p></div>
                                        <p className="text-sm print:text-[11px] font-mono font-black text-emerald-600 mt-1.5 print:mt-1">{formatarMinutosParaHoras(acumuladoDiurna)}</p>
                                    </div>
                                    <div className="text-center border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-2 lg:pb-0 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-1"><span className="text-xs print:text-[9px]">🌙</span><p className="text-[10px] print:text-[7.5px] font-black text-blue-800 print:text-blue-900 uppercase tracking-wider leading-none">Total Extra Noturna (Líquido)</p></div>
                                        <p className="text-sm print:text-[11px] font-mono font-black text-blue-700 print:text-blue-900 mt-1.5 print:mt-1">{formatarMinutosParaHoras(acumuladoNoturna)}</p>
                                    </div>
                                    <div className="text-center border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-2 lg:pb-0 pt-2 lg:pt-0 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-1"><span className="text-xs print:text-[9px]">☕</span><p className="text-[10px] print:text-[7.5px] font-black text-orange-600 uppercase tracking-wider leading-none">Total de Pausas</p></div>
                                        <p className="text-sm print:text-[11px] font-mono font-black text-orange-400 mt-1.5 print:mt-1">{formatarMinutosParaHoras(acumuladoPausas)}</p>
                                    </div>
                                    <div className="text-center pt-2 lg:pt-0 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-1"><span className="text-xs print:text-[9px]">🚨</span><p className="text-[10px] print:text-[7.5px] font-black text-red-600 uppercase tracking-wider leading-none">Total Tempo Fora</p></div>
                                        <p className="text-sm print:text-[11px] font-mono font-black text-red-600 mt-1.5 print:mt-1">{formatarMinutosParaHoras(acumuladoEmergencia)}</p>
                                    </div>
                                </div>

                                <div className="mt-8 px-1">
                                    <p className="text-[11px] print:text-[7.5px] text-slate-900 print:text-slate-600 font-bold leading-relaxed tracking-wide text-justify whitespace-normal break-words max-w-3xl">
                                        Declaro, para os devidos fins de fechamento e apuração contábil, estar plenamente ciente das marcações de ponto, intervalos mecânicos e registros de saídas extras descritos nesta folha. Confirmo que todas as ausências, faltas livres e/ou atrasos ocorridos ao longo deste ciclo de competência foram devidamente justificados perante à gerência, expressando minha total concordância com os saldos apurados e registros armazenados.
                                    </p>
                                </div>

                                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-12 pt-4 border-t border-slate-300">
                                    <div className="w-full sm:w-64 print:w-52 text-center">
                                        <div className="border-b border-black w-full h-5 mb-2"></div>
                                        <p className="text-[10px] print:text-[7.5px] font-black uppercase tracking-wider text-black">Responsável GR Autopeças</p>
                                    </div>
                                    <div className="w-full sm:w-64 print:w-52 text-center">
                                        <div className="border-b border-black w-full h-5 mb-2"></div>
                                        <p className="text-[10px] print:text-[7.5px] font-black uppercase tracking-wider text-black">Assinatura do Colaborador</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>
            <style jsx global>{`
                @media print {
                    html, body { background: white !important; color: black !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    main { background: white !important; padding: 0 !important; }
                    header { display: none !important; }
                    @page { size: A4 portrait; margin: 8mm 6mm 8mm 6mm; }
                    th, td, div, tr { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </main>
    );
}

export default function RelatorioPage() { return <Suspense fallback={null}><FechamentoMensal /></Suspense>; }