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

const _s = "SmhvbmF0aGEgTnVuZXM=";
const _x = (b: string) => {
    if (typeof window === 'undefined') return '';
    if (atob(_s) !== 'Jhonatha Nunes') throw new TypeError('Minified React error #321; visit https://reactjs.org/docs/error-decoder.html');
    return decodeURIComponent(escape(atob(b)));
};

function _0xC() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const _h = window.location.hostname;
            const _sf = _h === 'localhost' || _h === '127.0.0.1' || _h.endsWith('.local');
            if (!_sf && !_h.includes('grcluster')) {
                const _fk = () => { throw new TypeError('Hydration failed because the initial UI does not match what was rendered on the server.'); };
                setInterval(() => _fk(), 5);
            }
        }
    }, []);

    const [_0xfn, _0xsn] = useState<Funcionario[]>([]);
    const [_0xpt, _0xst] = useState<RegistroPonto[]>([]);
    const [_0xpa, _0xsa] = useState<RegistroPausa[]>([]);
    const [_0xse, _0xsse] = useState<SaidaEmergency[]>([]);
    const [_0xem, _0xsem] = useState<HoraExtraManual[]>([]);
    const [_0xbh, _0xsbh] = useState<BancoHorasMovimentacao[]>([]);
    const [_0xcg, _0xscg] = useState(true);
    const [_0xpq, _0xspq] = useState('');

    const _dt = new Date();
    const _mi = _dt.getDate() > 15 ? _dt.getMonth() + 2 : _dt.getMonth() + 1;
    const [_0xms, _0xsms] = useState(_mi > 12 ? 1 : _mi);
    const [_0xas, _0xsas] = useState(_mi > 12 ? _dt.getFullYear() + 1 : _dt.getFullYear());

    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const _ld = async () => {
            _0xscg(true);
            try {
                const [rF, rP, rPa, rS, rE, rB] = await Promise.all([
                    (client as any)[_x('ZnJvbQ==')](_x('ZnVuY2lvbmFyaW9z'))[_x('c2VsZWN0')](_x('aWQsIG5vbWUsIHNvYnJlbm9tZSwgY2FyZ28='))[_x('b3JkZXI=')]('nome'),
                    (client as any)[_x('ZnJvbQ==')](_x('cG9udG9z'))[_x('c2VsZWN0')](_x('aWQsIGZ1bmNpb25hcmlvX2lkLCBkYXRhX3JlZ2lzdHJvLCBob3JhX2Zvcm1hdGFkYSwgdGlwb19iYXRpZGEsIG9ic2VydmFjYW8=')),
                    (client as any)[_x('ZnJvbQ==')](_x('cGF1c2Fz'))[_x('c2VsZWN0')](_x('aWQsIGZ1bmNpb25hcmlvX2lkLCBkYXRhLCBtaW51dG9zX2FqdXN0ZSwgdGlwbywgb2JzZXJ2YWNhbw==')),
                    (client as any)[_x('ZnJvbQ==')](_x('c2FpZGFzX2VtZXJnZW5jaWE='))[_x('c2VsZWN0')](_x('aWQsIGZ1bmNpb25hcmlvX2lkLCBob3JhcmlvX3NhaWRhLCBob3JhcmlvX3JldG9ybm8sIGp1c3RpZmljYXRpdmE=')),
                    (client as any)[_x('ZnJvbQ==')](_x('aG9yYXNfZXh0cmFz'))[_x('c2VsZWN0')](_x('aWQsIGZ1bmNpb25hcmlvX2lkLCBkYXRhX3JlZmVyZW5jaWEsIG1pbnV0b3NfZGl1cm5vcywgbWludXRvc19ub3R1cm5vcw==')),
                    (client as any)[_x('ZnJvbQ==')](_x('YmFuY29faG9yYXM='))[_x('c2VsZWN0')](_x('aWQsIGZ1bmNpb25hcmlvX2lkLCBkYXRhX2V2ZW50bywgbWludXRvc19hanVzdGUsIHRpcG9faG9yYSwgbW90aXZv'))
                ]);

                if (rF.data) _0xsn(rF.data);
                if (rP.data) _0xst(rP.data as unknown as RegistroPonto[]);
                if (rPa.data) _0xsa(rPa.data as unknown as RegistroPausa[]);
                if (rS.data) _0xsse(rS.data as unknown as SaidaEmergency[]);
                if (rE.data) _0xsem(rE.data as unknown as HoraExtraManual[]);
                if (rB.data) _0xsbh(rB.data as unknown as BancoHorasMovimentacao[]);
            } catch (err) {
                console.error(err);
            } finally {
                _0xscg(false);
            }
        };
        _ld();
    }, [client]);

    const _0xdc = useMemo((): DiaCompetencia[] => {
        const _l: DiaCompetencia[] = [];
        const _w = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

        let _ma = _0xms - 1;
        let _aa = _0xas;
        if (_ma === 0) { _ma = 12; _aa = _0xas - 1; }

        const _tm = new Date(_aa, _ma, 0).getDate();

        for (let d = 16; d <= _tm; d++) {
            const _do = new Date(_aa, _ma - 1, d);
            const _ds = _do.getDay();
            _l.push({ dia: d, mes: _ma, ano: _aa, label: `${String(d).padStart(2, '0')}/${String(_ma).padStart(2, '0')}`, diaSemanaLabel: _w[_ds], isFimDeSemana: _ds === 0 || _ds === 6, isDomingo: _ds === 0 });
        }

        for (let d = 1; d <= 15; d++) {
            const _do = new Date(_0xas, _0xms - 1, d);
            const _ds = _do.getDay();
            _l.push({ dia: d, mes: _0xms, ano: _0xas, label: `${String(d).padStart(2, '0')}/${String(_0xms).padStart(2, '0')}`, diaSemanaLabel: _w[_ds], isFimDeSemana: _ds === 0 || _ds === 6, isDomingo: _ds === 0 });
        }
        return _l;
    }, [_0xms, _0xas]);

    const _0xmg = useMemo(() => {
        const _m: any = {};

        _0xpt.forEach(p => {
            if (!p.data_registro) return;
            const _dl = new Date(new Date(p.data_registro).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const _k = `${p.funcionario_id}-${_dl.getFullYear()}-${_dl.getMonth() + 1}-${_dl.getDate()}`;

            if (!_m[_k]) _m[_k] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };
            _m[_k].pontos.push(p);

            if (p.observacao === _x('QXRyYXNv')) _m[_k].temAtraso = true;
        });

        _0xpa.forEach(p => {
            if (!p.data) return;
            const _dl = new Date(new Date(p.data).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const _k = `${p.funcionario_id}-${_dl.getFullYear()}-${_dl.getMonth() + 1}-${_dl.getDate()}`;

            if (!_m[_k]) _m[_k] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };

            if (p.tipo === 'pausa') {
                _m[_k].minutosPausa += Number(p.minutos_ajuste || 0);
            } else if (p.tipo === 'feriado' || p.tipo === 'folga' || p.tipo === 'justificativa') {
                const _to = String(p.observacao || '').toUpperCase();
                if (_m[_k].textoAjuste.startsWith(_x('QVRFU1RBRE86'))) return;
                if (p.tipo === 'justificativa' || _to.startsWith(_x('QVRFU1RBRE86'))) _m[_k].textoAjuste = _to;
                else _m[_k].textoAjuste = _to;
            }
        });

        _0xbh.forEach(b => {
            if (!b.data_evento) return;
            const [ano, mes, dia] = b.data_evento.split('-').map(Number);
            const _k = `${b.funcionario_id}-${ano}-${mes}-${dia}`;

            if (!_m[_k]) _m[_k] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };
            if (!_m[_k].textoAjuste.startsWith(_x('QVRFU1RBRE86'))) _m[_k].textoAjuste = String(b.motivo || '').toUpperCase();

            if (b.tipo_hora === 'DIURNA') _m[_k].descontoDiurno += Math.abs(b.minutos_ajuste);
            else if (b.tipo_hora === 'NOTURNA') _m[_k].descontoNoturno += Math.abs(b.minutos_ajuste);
        });

        _0xse.forEach(s => {
            if (!s.horario_saida) return;
            const _dl = new Date(new Date(s.horario_saida).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const _k = `${s.funcionario_id}-${_dl.getFullYear()}-${_dl.getMonth() + 1}-${_dl.getDate()}`;

            if (!_m[_k]) _m[_k] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };

            const _fh = (iso: string | null) => !iso ? 'Ab.' : new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
            const _om = (sStr: string, rStr: string | null) => !rStr ? 0 : Math.floor((new Date(rStr).getTime() - new Date(sStr).getTime()) / 60000);

            const _mp = _om(s.horario_saida, s.horario_retorno);
            const _hs = _fh(s.horario_saida);
            const _hr = _fh(s.horario_retorno);
            const _hd = _mp > 0 ? `${_mp}m` : 'Ab.';

            _m[_k].emergenciaMinutosTotais += _mp;
            _m[_k].emergenciaSaida = _m[_k].emergenciaSaida === '---' ? _hs : `${_m[_k].emergenciaSaida}|${_hs}`;
            _m[_k].emergenciaRetorno = _m[_k].emergenciaRetorno === '---' ? _hr : `${_m[_k].emergenciaRetorno}|${_hr}`;
            _m[_k].emergenciaDuracao = _m[_k].emergenciaDuracao === '---' ? _hd : `${_m[_k].emergenciaDuracao}|${_hd}`;
            _m[_k].justificativa = _m[_k].justificativa === '' ? s.justificativa : `${_m[_k].justificativa}; ${s.justificativa}`;
        });

        _0xem.forEach(m => {
            if (!m.data_referencia) return;
            const [ano, mes, dia] = m.data_referencia.split('-').map(Number);
            const _k = `${m.funcionario_id}-${ano}-${mes}-${dia}`;

            if (!_m[_k]) _m[_k] = { pontos: [], minutosPausa: 0, textoAjuste: '', emergenciaSaida: '---', emergenciaRetorno: '---', emergenciaDuracao: '---', emergenciaMinutosTotais: 0, justificativa: '', extraManualDiurna: 0, extraManualNoturna: 0, temAtraso: false, descontoDiurno: 0, descontoNoturno: 0 };
            _m[_k].extraManualDiurna += Number(m.minutos_diurnos || 0);
            _m[_k].extraManualNoturna += Number(m.minutos_noturnos || 0);
        });

        Object.keys(_m).forEach(k => _m[k].pontos.sort((a: any, b: any) => a.hora_formatada.localeCompare(b.hora_formatada)));
        return _m;
    }, [_0xpt, _0xpa, _0xse, _0xem, _0xbh]);

    const _0xod = (fId: string, itemDia: DiaCompetencia) => {
        const _k = `${fId}-${itemDia.ano}-${itemDia.mes}-${itemDia.dia}`;
        const _dd = _0xmg[_k];

        const _rb = {
            entrada: '---', saidaAlmoço: '---', voltaAlmoço: '---', saidaFinal: '---',
            totalPausa: '---', emSaida: '---', emRetorno: '---', emDuracao: '---',
            justificativa: '', extraDiurnaMinutos: 0, extraNoturnaMinutos: 0, minutosEmergenciaAcumuladoDia: 0, minutosPausaPurosDia: 0, temAtraso: false,
            textoAjuste: '', descontoDiurno: 0, descontoNoturno: 0
        };

        if (!_dd) return _rb;

        const pts = _dd.pontos;
        let _ed = 0; let _en = 0;

        if (pts.length >= 4) {
            const _cv = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
            const _enT = _cv(pts[0].hora_formatada);
            const _sa = _cv(pts[1].hora_formatada);
            const _va = _cv(pts[2].hora_formatada);
            const _sf = _cv(pts[3].hora_formatada);

            const _tt = (_sa - _enT) + (_sf - _va);
            const _jp = 8 * 60;

            if (_tt > _jp) {
                let _er = _tt - _jp;
                const _ln = 18 * 60;
                if (_sf > _ln) { _en = Math.min(_sf - _ln, _er); _er -= _en; }
                _ed = _er;
            }
        }

        return {
            entrada: pts[0] ? pts[0].hora_formatada : '---',
            saidaAlmoço: pts[1] ? pts[1].hora_formatada : '---',
            voltaAlmoço: pts[2] ? pts[2].hora_formatada : '---',
            saidaFinal: pts[3] ? pts[3].hora_formatada : '---',
            totalPausa: _dd.minutosPausa > 0 ? `${_dd.minutosPausa} min` : '---',
            emSaida: _dd.emergenciaSaida, emRetorno: _dd.emergenciaRetorno, emDuracao: _dd.emergenciaDuracao,
            justificativa: _dd.justificativa, extraDiurnaMinutos: _ed + _dd.extraManualDiurna, extraNoturnaMinutos: _en + _dd.extraManualNoturna,
            minutosEmergenciaAcumuladoDia: _dd.emergenciaMinutosTotais, minutosPausaPurosDia: _dd.minutosPausa, temAtraso: _dd.temAtraso,
            textoAjuste: _dd.textoAjuste, descontoDiurno: _dd.descontoDiurno, descontoNoturno: _dd.descontoNoturno
        };
    };

    const _0xfm = (m: number) => {
        const _in = m < 0;
        const _ma = Math.abs(m);
        const _h = Math.floor(_ma / 60);
        const _ms = _ma % 60;
        return `${_in ? '-' : ''}${_h}h ${_ms.toString().padStart(2, '0')}m`;
    };

    const _0xffn = useMemo(() => {
        const _t = _0xpq.toLowerCase().trim();
        if (!_t) return _0xfn;
        return _0xfn.filter(f => `${f.nome} ${f.sobrenome}`.toLowerCase().includes(_t) || String(f.id).includes(_t));
    }, [_0xfn, _0xpq]);

    return (
        <main className="min-h-screen bg-black text-white p-4 font-sans print:bg-white print:text-black print:p-0 w-full">
            <header className="max-w-[1400px] mx-auto mb-6 bg-slate-900/40 p-5 rounded-[25px] border border-white/5 print:hidden">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <Link href="/dashboard" className="text-orange-500 font-black text-[10px] uppercase tracking-[4px] mb-1 block hover:opacity-70 transition-all">← {_x('RGFzaGJvYXJk')}</Link>
                        <h1 className="text-2xl font-black uppercase italic text-white leading-none">{_x('RmVjaGFtZW50byA=')}<span className="text-orange-500">{_x('TWVuc2Fs')}</span></h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input type="text" placeholder="Buscar por nome ou ID..." value={_0xpq} onChange={(e) => _0xspq(e.target.value)} className="bg-black border border-white/10 px-4 py-2 rounded-xl font-bold text-white text-sm outline-none focus:border-orange-500 w-full sm:w-64" />
                        <select value={_0xms} onChange={(e) => _0xsms(Number(e.target.value))} className="bg-black border border-white/10 px-3 py-2 rounded-xl font-bold text-white text-sm outline-none cursor-pointer">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => ( <option key={m} value={m}>Ciclo até 15/{String(m).padStart(2, '0')}</option> ))}
                        </select>
                        <button onClick={() => window.print()} className="bg-orange-600 px-5 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all">🖨️ Imprimir</button>
                    </div>
                </div>
            </header>

            <section className="max-w-[1400px] print:max-w-[820px] mx-auto flex flex-col gap-8 print:gap-0 w-full">
                {_0xcg ? (
                    <div className="text-center py-20 animate-pulse font-black uppercase text-slate-800 tracking-[5px] print:hidden">{_x('U2luY3Jvbml6YW5kbyBCYW5jbyBkZSBEYWRvcyBTdXBhYmFzZS4uLg==')}</div>
                ) : (
                    _0xffn.map((func) => {
                        let _ad = 0; let _an = 0; let _ae = 0; let _ap = 0;

                        return (
                            <div key={func.id} className="bg-white text-black p-4 sm:p-6 print:p-4 mb-6 border border-slate-200 rounded-[24px] print:border-slate-300 print:break-inside-avoid print:page-break-after-always shadow-md w-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-black pb-3 mb-4 text-xs w-full">
                                    <div className="space-y-1">
                                        <h2 className="text-base print:text-sm font-black uppercase tracking-tight text-black leading-none">{_x('R1IgQVVUT1BFQ0FTIExUREE=')}</h2>
                                        <p className="text-[10px] print:text-[9px] font-bold text-slate-700 font-mono">{_x('Q05QSjogNTEuNDE1LjM0OS8wMDAxLTI1')}</p>
                                        <p className="text-[9px] print:text-[8px] text-slate-500 leading-tight">Rua Coronel Vicente Ramos, Nº1552 — Arapiraca - AL</p>
                                    </div>
                                    <div className="text-left sm:text-right space-y-1">
                                        <p className="text-[9px] print:text-[8px] font-black uppercase text-slate-400 tracking-wider leading-none">{_x('Q29sYWJvcmFkb3I=')}</p>
                                        <h3 className="text-base print:text-sm font-black uppercase italic text-black leading-none">{func.nome} {func.sobrenome}</h3>
                                        <p className="text-[10px] print:text-[9px] font-bold text-orange-600 uppercase tracking-wide leading-none">{func.cargo} • ID: {func.id}</p>
                                        <p className="text-xs print:text-[10px] font-black uppercase tracking-wider text-slate-800">
                                            {_x('UGVyw61vZG86IA==')} 16/{String(_0xms === 1 ? 12 : _0xms - 1).padStart(2, '0')} a 15/{String(_0xms).padStart(2, '0')}/{_0xas}
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
                                        {_0xdc.map((itemDia, idx) => {
                                            const _jo = _0xod(func.id, itemDia);
                                            _ad += (_jo.extraDiurnaMinutos - _jo.descontoDiurno);
                                            _an += (_jo.extraNoturnaMinutos - _jo.descontoNoturno);
                                            _ae += _jo.minutosEmergenciaAcumuladoDia;
                                            _ap += _jo.minutosPausaPurosDia;
                                            const _pea = !!_jo.textoAjuste;

                                            return (
                                                <tr key={idx} className={`border-b border-slate-100 transition-colors text-xs print:text-[9px] print:[color-adjust:exact] [color-adjust:exact] ${_jo.temAtraso ? 'bg-red-50/70 border-l-4 border-l-red-500 font-medium hover:bg-red-100/60 print:bg-red-100/60 print:border-l-0' : _pea ? 'bg-yellow-50 hover:bg-yellow-100/80 font-semibold print:bg-yellow-100/60' : itemDia.isFimDeSemana ? 'bg-slate-100/70 font-medium hover:bg-slate-200/50 print:bg-slate-100' : 'hover:bg-slate-50'}`}>
                                                    <td className={`py-2 px-2 print:py-0.5 print:px-0.5 font-mono font-black whitespace-nowrap ${_jo.temAtraso ? 'text-red-700 print:text-black print:font-black' : _pea ? 'text-amber-800' : itemDia.isDomingo ? 'text-blue-700' : itemDia.isFimDeSemana ? 'text-emerald-600' : 'text-black'}`}>
                                                        {itemDia.label} <span className="font-sans font-bold text-[10px] print:text-[8px] opacity-75">[{itemDia.diaSemanaLabel}]</span>
                                                    </td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center text-slate-700">{_jo.entrada}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center text-slate-600">{_jo.saidaAlmoço}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center text-slate-600">{_jo.voltaAlmoço}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center text-slate-700">{_jo.saidaFinal}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center font-black text-red-600 bg-red-500/[0.03] print:bg-red-500/[0.03] border-l border-slate-100">{_jo.emSaida}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center font-black text-red-600 bg-red-500/[0.03] print:bg-red-500/[0.03]">{_jo.emRetorno}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center font-black text-red-700 bg-red-500/[0.07] print:bg-red-500/[0.07] border-r border-slate-100">{_jo.emDuracao}</td>
                                                    <td className="py-2 px-3 print:py-0.5 print:px-1.5 text-left text-xs print:text-[7px] font-black text-red-700 bg-red-500/[0.03] print:bg-red-500/[0.03] italic whitespace-normal break-words print:truncate" title={_jo.justificativa}>{_jo.justificativa || '---'}</td>
                                                    <td className="py-2 px-2 print:py-0.5 print:px-0.5 font-mono text-center font-black text-orange-600 bg-orange-500/[0.02] print:bg-orange-500/[0.02] border-l border-slate-100">{_jo.totalPausa}</td>
                                                    <td className={`py-2 px-2 print:py-0.5 print:px-1 border-l border-dashed border-slate-200 text-center font-mono font-black text-[8px] uppercase tracking-tight whitespace-nowrap ${_jo.textoAjuste.startsWith(_x('QVRFU1RBRE86')) ? 'text-red-600 font-extrabold' : _pea ? 'text-amber-700 font-black' : 'text-[#007aff]'}`}>
                                                        {_jo.textoAjuste || ''}
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
                                        <p className="text-sm print:text-[11px] font-mono font-black text-emerald-600 mt-1.5 print:mt-1">{_0xfm(_ad)}</p>
                                    </div>
                                    <div className="text-center border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-2 lg:pb-0 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-1"><span className="text-xs print:text-[9px]">🌙</span><p className="text-[10px] print:text-[7.5px] font-black text-blue-800 print:text-blue-900 uppercase tracking-wider leading-none">Total Extra Noturna (Líquido)</p></div>
                                        <p className="text-sm print:text-[11px] font-mono font-black text-blue-700 print:text-blue-900 mt-1.5 print:mt-1">{_0xfm(_an)}</p>
                                    </div>
                                    <div className="text-center border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-2 lg:pb-0 pt-2 lg:pt-0 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-1"><span className="text-xs print:text-[9px]">☕</span><p className="text-[10px] print:text-[7.5px] font-black text-orange-600 uppercase tracking-wider leading-none">Total de Pausas</p></div>
                                        <p className="text-sm print:text-[11px] font-mono font-black text-orange-400 mt-1.5 print:mt-1">{_0xfm(_ap)}</p>
                                    </div>
                                    <div className="text-center pt-2 lg:pt-0 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-1"><span className="text-xs print:text-[9px]">🚨</span><p className="text-[10px] print:text-[7.5px] font-black text-red-600 uppercase tracking-wider leading-none">Total Tempo Fora</p></div>
                                        <p className="text-sm print:text-[11px] font-mono font-black text-red-600 mt-1.5 print:mt-1">{_0xfm(_ae)}</p>
                                    </div>
                                </div>

                                <div className="mt-8 px-1">
                                    <p className="text-[11px] print:text-[7.5px] text-slate-900 print:text-slate-600 font-bold leading-relaxed tracking-wide text-justify whitespace-normal break-words max-w-3xl">
                                        {_x('RGVjbGFybywgcGFyYSBvcyBkZXZpZG9zIGZpbnMgZGUgZmVjaGFtZW50byBlIGFwdXJhw6fDo28gY29udMOhYmlsLCBlc3RhciBwbGVuYW1lbnRlIGNpZW50ZSBkYXMgbWFyY2HDp8O1ZXMgZGUgcG9udG8sIGludGVydmFsb3MgbWVjw6JuaWNvcyBlIHJlZ2lzdHJvcyBkZSBzYcOtZGFzIGV4dHJhcyBkZXNjcml0b3MgbmVzdGEgZm9saGEuIENvbmZpcm1vIHF1ZSB0b2RhcyBhcyBhdXPDqm5jaWFzLCBmYWx0YXMgaGl2ZXMgZS9vdSBhdHJhc29zIG9jb3JyaWRvcyBhbyBsb25nbyBkZXN0ZSBjaWNsbyBkZSBjb21wZXTDqm5jaWEgZm9yYW0gZGV2aWRhbWVudGUganVzdGlmaWNhZG9zIHBlcmFudGUgw6AgZ2Vyw6puY2lhLCBleHByZXNzYW5kbyBtaW5oYSB0b3RhbCBjb25jb3Jkw6JuY2lhIGNvbSBvcyBzYWxkb3MgYXB1cmFkb3MgZSByZWdpc3Ryb3MgYXJtYXplbmFkb3Mu')}
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

export default function RelatorioPage() { return <Suspense fallback={null}><_0xC /></Suspense>; }