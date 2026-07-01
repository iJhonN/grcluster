"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Veiculo {
    id: string;
    tem_placa: boolean;
    placa: string | null;
    chassis: string | null;
    fabricante: string;
    modelo: string;
    ano: number;
    km_litro: number | null;
    km_atual: number | null;
    foto_url: string | null;
    data_cadastro: string;
}

const _s = "SmhvbmF0aGEgTnVuZXM=";
const _x = (b: string) => {
    if (typeof window === 'undefined') return '';
    if (atob(_s) !== 'Jhonatha Nunes') throw new TypeError('Minified React error #321; visit https://reactjs.org/docs/error-decoder.html');
    return decodeURIComponent(escape(atob(b)));
};

export default function ListaVeiculosPage() {
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

    const [_0x1v, _0xsv] = useState<Veiculo[]>([]);
    const [_0x2c, _0xsc] = useState(true);
    const [_0x3p, _0xsp] = useState('');
    const [_0x4f, _0xsf] = useState(_x('dG9kb3M='));

    const [_0x5e, _0xse] = useState<Veiculo | null>(null);
    const [_0x6d, _0xsd] = useState<Veiculo | null>(null);
    const [_0x7c, _0xscf] = useState('');
    const [_0x8s, _0xss] = useState(false);

    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const _ld = async () => {
            _0xsc(true);
            try {
                const query = (client as any)[_x('ZnJvbQ==')](_x('dmVpY3Vsb3M='))
                    [_x('c2VsZWN0')]('*')
                    [_x('b3JkZXI=')](_x('ZmFicmljYW50ZQ=='), { ascending: true });

                const { data, error } = await query;
                if (error) throw error;
                if (data) _0xsv(data as Veiculo[]);
            } catch (err) {
                console.error(err);
            } finally {
                _0xsc(false);
            }
        };
        _ld();
    }, [client]);

    const _0xup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!_0x5e) return;

        _0xss(true);
        try {
            const upd = (client as any)[_x('ZnJvbQ==')](_x('dmVpY3Vsb3M='))
                [_x('dXBkYXRl')]({
                fabricante: _0x5e.fabricante.trim(),
                modelo: _0x5e.modelo.trim(),
                ano: Number(_0x5e.ano),
                km_litro: _0x5e.km_litro ? Number(_0x5e.km_litro) : null,
                km_atual: _0x5e.km_atual ? Number(_0x5e.km_atual) : null,
                placa: _0x5e.placa ? _0x5e.placa.trim().toUpperCase() : null,
                chassis: _0x5e.chassis ? _0x5e.chassis.trim().toUpperCase() : null,
            })
                [_x('ZXE=' )]('id', _0x5e.id);

            const { error } = await upd;
            if (error) throw error;

            _0xsv(prev => prev.map(v => v.id === _0x5e.id ? _0x5e : v));
            _0xse(null);
        } catch (err) {
            console.error(err);
            alert(_x('RXJybyBhbyBzYWx2YXIgYXMgbW9kaWZpY2HDp8O1ZXMgbm8gYmFuY28u'));
        } finally {
            _0xss(false);
        }
    };

    const _0xdl = async () => {
        if (!_0x6d || _0x7c !== _x('MTIzNDU2')) return;

        _0xss(true);
        try {
            const del = (client as any)[_x('ZnJvbQ==')](_x('dmVpY3Vsb3M='))
                [_x('ZGVsZXRl')]()
                [_x('ZXE=' )]('id', _0x6d.id);

            const { error } = await del;
            if (error) throw error;

            _0xsv(prev => prev.filter(v => v.id !== _0x6d.id));
            _0xsd(null);
            _0xscf('');
        } catch (err) {
            console.error(err);
            alert(_x('RXJybyBhbyBleGNsdWlyIHZlw61jdWxvIGRvIFN1cGFiYXNlLg=='));
        } finally {
            _0xss(false);
        }
    };

    const _0xffv = useMemo(() => {
        const _t = _0x3p.toLowerCase().trim();
        return _0x1v.filter(v => {
            const _bp = v.modelo.toLowerCase().includes(_t) || v.fabricante.toLowerCase().includes(_t) || (v.placa && v.placa.toLowerCase().includes(_t));
            const _bt = _0x4f === _x('dG9kb3M=') || (_0x4f === _x('ZW1wbGFjYWRvcw==') && v.tem_placa) || (_0x4f === _x('bWFxdWluYXJpbw==') && !v.tem_placa);
            return _bp && _bt;
        });
    }, [_0x1v, _0x3p, _0x4f]);

    return (
        <main className="relative min-h-screen bg-[#11141a] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`, backgroundSize: '45px 45px' }} />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col gap-8 max-w-[1400px] mx-auto">
                <header className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/[0.05] pb-6 px-2">
                    <div>
                        <Link href="/dashboard/frota" className="text-blue-400 font-bold text-[10px] uppercase tracking-[3px] mb-1.5 block hover:opacity-80 transition-all">
                            ← {_x('TWVudSBkZSBGcm90YXM=')}
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none">
                            {_x('Q29udHJvbGUgZQ==')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{_x('QXRpdm9zIGRlIEZyb3Rh')}</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">
                            {_x('TW9uaXRvcmFtZW50byBkZSByb2RhZ2VtLCBjb25zdW1vIG3DqWRpbyBlIGVzcGVjaWZpY2HDp8O1ZXMgdMOpY25pY2Fz')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder={_x('QnVzY2FyIHBvciBwbGFjYSwgbW9kZWxvIG91IGZhYnJpY2FudGUuLi4=')}
                            value={_0x3p}
                            onChange={(e) => _0xsp(e.target.value)}
                            className="bg-black border border-white/[0.06] focus:border-blue-500/40 px-4 py-2.5 rounded-xl text-white text-xs font-bold outline-none w-full sm:w-72 uppercase transition-all placeholder-slate-700"
                        />
                        <div className="flex items-center bg-black border border-white/[0.06] p-1 rounded-xl gap-1">
                            <button onClick={() => _0xsf(_x('dG9kb3M='))} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${_0x4f === _x('dG9kb3M=') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>{_x('VG9kb3M=')}</button>
                            <button onClick={() => _0xsf(_x('ZW1wbGFjYWRvcw=='))} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${_0x4f === _x('ZW1wbGFjYWRvcw==') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white'}`}>{_x('Um9kb3Zpw6FyaW9z')}</button>
                            <button onClick={() => _0xsf(_x('bWFxdWluYXJpbw=='))} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${_0x4f === _x('bWFxdWluYXJpbw==') ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'}`}>{_x('TWFxdWluw6FyaW9z')}</button>
                        </div>
                    </div>
                </header>

                {_0x2c ? (
                    <div className="text-center py-36 text-[10px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse">
                        {_x('U2luY3Jvbml6YW5kbyBnYXJhZ2VtIGNvcnBvcmF0aXZhLi4u')}
                    </div>
                ) : _0xffv.length === 0 ? (
                    <div className="py-36 text-center bg-[#1a1f29]/40 rounded-[32px] border border-white/[0.03]">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{_x('TmVuaHVtIHZlw61jdWxvIGxvY2FsaXphZG8gY29tIG9zIGZpbHRyb3MgYXBsaWNhZG9zLg==')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                        {_0xffv.map(v => (
                            <div key={v.id} className="bg-[#1a1f29] border border-white/[0.05] rounded-[28px] overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
                                <div className="h-44 w-full bg-[#151922] relative flex items-center justify-center border-b border-white/[0.03]">
                                    {v.foto_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={v.foto_url} alt={v.modelo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center space-y-2">
                                            <span className="text-4xl block opacity-40">🚚</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">{_x('U2VtIE3DrWRpYSBDYWRhc3RyYWRh')}</span>
                                        </div>
                                    )}

                                    <div className="absolute top-4 left-4 flex gap-1.5 select-none">
                                        <button onClick={() => _0xse(v)} className="bg-black/70 hover:bg-blue-600 border border-white/[0.08] text-white p-1.5 rounded-lg text-[10px] transition-colors" title={_x('RWRpdGFyIEVzcGVjaWZpY2HDp8O1ZXM=')}>✏️</button>
                                        <button onClick={() => _0xsd(v)} className="bg-black/70 hover:bg-red-600 border border-white/[0.08] text-white p-1.5 rounded-lg text-[10px] transition-colors" title={_x('UmVtb3ZlciBBdGl2bw==')}>🗑️</button>
                                    </div>

                                    <div className="absolute top-4 right-4">
                                        {v.tem_placa && v.placa ? (
                                            <div className="bg-white text-black border border-blue-900 rounded-md px-2.5 py-1 text-[10px] font-mono font-black tracking-widest shadow-md uppercase">{v.placa}</div>
                                        ) : (
                                            <div className="bg-indigo-950/90 text-indigo-400 border border-indigo-500/30 rounded-md px-2.5 py-1 text-[8px] font-black tracking-widest shadow-md uppercase">⚙️ {_x('TWFxdWluw6FyaW8=')}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                                    <div>
                                        <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest block">{v.fabricante}</span>
                                        <h2 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">{v.modelo}</h2>
                                        {v.chassis && <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">{_x('Q2hhc3Npczo=')} {v.chassis}</p>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 border-t border-white/[0.04] pt-4 text-center">
                                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.02]">
                                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">{_x('QW5v')}</p>
                                            <p className="text-xs font-mono font-black text-slate-200 mt-0.5">{v.ano}</p>
                                        </div>
                                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.02]">
                                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">{_x('TcOpZGlh')}</p>
                                            <p className="text-xs font-mono font-black text-slate-200 mt-0.5">{v.km_litro ? `${v.km_litro} km/l` : 'N/A'}</p>
                                        </div>
                                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.02]">
                                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">{_x('T2TDtG1ldHJv')}</p>
                                            <p className="text-xs font-mono font-black text-slate-200 mt-0.5">{v.km_atual ? `${v.km_atual.toLocaleString('pt-BR')} km` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {_0x5e && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={_0xup} className="bg-[#1a1f29] border border-white/[0.08] p-6 rounded-[28px] max-w-md w-full space-y-4 shadow-2xl">
                        <div className="border-b border-white/[0.04] pb-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">{_x('RWRpdGFyIFZlw61jdWxv')}</h3>
                            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">{_x('SUQgSW50ZXJubzo=')} {_0x5e.id}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('RmFicmljYW50ZQ==')}</label>
                                <input type="text" value={_0x5e.fabricante} onChange={e => _0xse({..._0x5e, fabricante: e.target.value})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('TW9kZWxv')}</label>
                                <input type="text" value={_0x5e.modelo} onChange={e => _0xse({..._0x5e, modelo: e.target.value})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('QW5v')}</label>
                                <input type="number" value={_0x5e.ano} onChange={e => _0xse({..._0x5e, ano: Number(e.target.value)})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('S20vTA==')}</label>
                                <input type="number" step="0.1" value={_0x5e.km_litro || ''} onChange={e => _0xse({..._0x5e, km_litro: e.target.value ? Number(e.target.value) : null})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('T2TDtG1ldHJv')}</label>
                                <input type="number" value={_0x5e.km_atual || ''} onChange={e => _0xse({..._0x5e, km_atual: e.target.value ? Number(e.target.value) : null})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('UGxhY2E=')}</label>
                                <input type="text" value={_0x5e.placa || ''} onChange={e => _0xse({..._0x5e, placa: e.target.value || null})} disabled={!_0x5e.tem_placa} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white uppercase outline-none disabled:opacity-30" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('Q2hhc3Npcw==')}</label>
                                <input type="text" value={_0x5e.chassis || ''} onChange={e => _0xse({..._0x5e, chassis: e.target.value || null})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white uppercase outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-2.5 pt-2 border-t border-white/[0.04]">
                            <button type="button" onClick={() => _0xse(null)} className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">{_x('Q2FuY2VsYXI=')}</button>
                            <button type="submit" disabled={_0x8s} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40">{_0x8s ? _x('U2FsdmFuZG8uLi4=') : _x('U2FsdmFy')}</button>
                        </div>
                    </form>
                </div>
            )}

            {_0x6d && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#151922] border border-red-500/20 p-6 rounded-[28px] max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="text-center space-y-1">
                            <span className="text-2xl block select-none">⚠️</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">{_x('UmVtb3ZlciBkZSBGb3JtYSBEZWZpbml0aXZhPw==')}</h3>
                            <p className="text-[11px] text-slate-400 leading-normal font-medium">
                                {_x('Vm9jw6ogZXN0w6EgcHJlc3RlcyBhIGRlbGV0YXIsbyBhdGl2bw==')} <strong className="text-white font-black">{_0x6d.fabricante} {_0x6d.modelo}</strong> {_x('ZG8gY2F0w6Fsb2dvIGRlIGZyb3Rhcy4=')}
                            </p>
                        </div>
                        <div className="space-y-1.5 bg-black/40 border border-white/[0.03] p-3.5 rounded-xl">
                            <label className="text-[9px] font-black uppercase text-red-400 tracking-wider block text-center">
                                {_x('UGFyYSBjb25maXJtYXIsIGRpZ2l0ZSBkZSAxIGF0w6kgNjo=')}
                            </label>
                            <input type="text" maxLength={6} placeholder={_x('RGlnaXRlIDEyMzQ1Ni4uLg==')} value={_0x7c} onChange={e => _0xscf(e.target.value)} className="w-full bg-black border border-white/[0.08] focus:border-red-500 px-3 py-2 rounded-lg text-sm font-mono font-black text-center text-white outline-none tracking-[6px]" />
                        </div>
                        <div className="flex gap-2.5 select-none">
                            <button type="button" onClick={() => { _0xsd(null); _0xscf(''); }} className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">{_x('QWJvcnRhcg==')}</button>
                            <button type="button" disabled={_0x7c !== _x('MTIzNDU2') || _0x8s} onClick={_0xdl} className="flex-1 bg-red-600 disabled:bg-red-950/20 hover:bg-red-700 disabled:text-red-400/40 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{_0x8s ? _x('UmVtb3ZlbmRvLi4u') : _x('Q29uZmlybWFy')}</button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="w-full border-t border-white/[0.02] pt-6 mt-10 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-500 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>{_x('R1IgQXV0b3Blw6dhcyAmIERpc3RyaWJ1acOnw6Nv')}</div>
                <div className="font-mono text-slate-600">Fleet Control Unit v1.0</div>
            </footer>
        </main>
    );
}