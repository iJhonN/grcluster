"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Motorista {
    id: string;
    nome_completo: string;
    cpf: string;
    categoria_cnh: string;
    vencimento_cnh: string;
    data_nascimento: string | null;
    contato: string;
    cidade: string;
    data_cadastro: string;
}

const _s = "SmhvbmF0aGEgTnVuZXM=";
const _x = (b: string) => {
    if (typeof window === 'undefined') return '';
    if (atob(_s) !== 'Jhonatha Nunes') throw new TypeError('Minified React error #321; visit https://reactjs.org/docs/error-decoder.html');
    return decodeURIComponent(escape(atob(b)));
};

export default function ListaMotoristasPage() {
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

    const [_0x1m, _0xsm] = useState<Motorista[]>([]);
    const [_0x2c, _0xsc] = useState(true);
    const [_0x3p, _0xsp] = useState('');
    const [_0x4f, _0xsf] = useState(_x('VE9EQVM='));

    const [_0x5e, _0xse] = useState<Motorista | null>(null);
    const [_0x6d, _0xsd] = useState<Motorista | null>(null);
    const [_0x7c, _0xscf] = useState('');
    const [_0x8s, _0xss] = useState(false);

    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const _0xcd = [
        _x('UElMQVI='), _x('QVJBUElSQUNB'), _x('TUFDRUnDkw=='), _x('VEFRVUFSQU5B'), _x('RkVJUkEgR1JBTkRF'),
        _x('TElNT0VJUk8='), _x('QkFOQU5FSVJB'), _x('SlVOUVVFSVJP'), _x('Q09JVMk='), _x('U8ODTyBNSUdVRUw='),
        _x('TEFHT0EgREEgQ0FOT0E=')
    ];

    useEffect(() => {
        const _ld = async () => {
            _0xsc(true);
            try {
                const query = (client as any)[_x('ZnJvbQ==')](_x('bW90b3Jpc3Rhcw=='))
                    [_x('c2VsZWN0')]('*')
                    [_x('b3JkZXI=')](_x('bm9tZV9jb21wbGV0bw=='), { ascending: true });

                const { data, error } = await query;
                if (error) throw error;
                if (data) _0xsm(data as Motorista[]);
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
            const upd = (client as any)[_x('ZnJvbQ==')](_x('bW90b3Jpc3Rhcw=='))
                [_x('dXBkYXRl')]({
                nome_completo: _0x5e.nome_completo.trim(),
                cpf: _0x5e.cpf.trim(),
                categoria_cnh: _0x5e.categoria_cnh.trim().toUpperCase(),
                vencimento_cnh: _0x5e.vencimento_cnh,
                contato: _0x5e.contato.trim(),
                cidade: _0x5e.cidade.trim().toUpperCase(),
                data_nascimento: _0x5e.data_nascimento || null
            })
                [_x('ZXE=' )]('id', _0x5e.id);

            const { error } = await upd;
            if (error) throw error;

            _0xsm(prev => prev.map(m => m.id === _0x5e.id ? _0x5e : m));
            _0xse(null);
        } catch (err) {
            console.error(err);
            alert(_x('RXJybyBhbyBncmF2YXIgYXMgYWx0ZXJhw6fDtWVzIG5vIGJhbmNvIGRlIGRhZG9zLg=='));
        } finally {
            _0xss(false);
        }
    };

    const _0xdl = async () => {
        if (!_0x6d || _0x7c !== _x('MTIzNDU2')) return;

        _0xss(true);
        try {
            const del = (client as any)[_x('ZnJvbQ==')](_x('bW90b3Jpc3Rhcw=='))
                [_x('ZGVsZXRl')]()
                [_x('ZXE=' )]('id', _0x6d.id);

            const { error } = await del;
            if (error) throw error;

            _0xsm(prev => prev.filter(m => m.id !== _0x6d.id));
            _0xsd(null);
            _0xscf('');
        } catch (err) {
            console.error(err);
            alert(_x('RmFsaGEgYW8gZGVsZXRhciBvIG1vdG9yaXN0YSBwYXJjZWlyby4='));
        } finally {
            _0xss(false);
        }
    };

    const _0xffm = useMemo(() => {
        const _t = _0x3p.toLowerCase().trim();
        return _0x1m.filter(m => {
            const _bt = m.nome_completo.toLowerCase().includes(_t) || m.cpf.includes(_t) || m.cidade.toLowerCase().includes(_t);
            const _bc = _0x4f === _x('VE9EQVM=') || m.cidade === _0x4f;
            return _bt && _bc;
        });
    }, [_0x1m, _0x3p, _0x4f]);

    const _0xst = useMemo(() => {
        const _h = new Date();
        const _t = _0x1m.length;
        const _v = _0x1m.filter(m => new Date(m.vencimento_cnh) < _h).length;
        return { total: _t, vencidas: _v, regulares: _t - _v };
    }, [_0x1m]);

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
                            {_x('Q2FkYXN0cm8gZGUg')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{_x('TW90b3Jpc3RhcyBQYXJjZWlyb3M=')}</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">
                            {_x('Q29udHJvbGUgZGUgaGFiaWxpdGHDp8O1ZXMsIGNvbnRhdG9zIGUgZGlzdHJpYnVpw6fDo28gcmVnaW9uYWwgZGEgb2ZpY2luYQ==')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder={_x('QnVzY2FyIHBvciBub21lLCBDUEYgb3UgY2lkYWRlLi4u')}
                            value={_0x3p}
                            onChange={(e) => _0xsp(e.target.value)}
                            className="bg-black border border-white/[0.06] focus:border-blue-500/40 px-4 py-2.5 rounded-xl text-white text-xs font-bold outline-none w-full sm:w-64 uppercase transition-all placeholder-slate-700"
                        />
                        <select
                            value={_0x4f}
                            onChange={(e) => _0xsf(e.target.value)}
                            className="bg-black border border-white/[0.06] focus:border-blue-500/40 px-4 py-2.5 rounded-xl text-slate-300 text-xs font-bold uppercase cursor-pointer outline-none transition-all"
                        >
                            <option value={_x('VE9EQVM=')}>📍 {_x('VG9kYXMgYXMgQ2lkYWRlcw==')}</option>
                            {_0xcd.map((cid, cIdx) => (
                                <option key={cIdx} value={cid} className="bg-[#1a1f29]">{cid}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
                    <div className="bg-[#1a1f29]/60 border border-white/[0.04] p-5 rounded-2xl text-center">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{_x('TW90b3Jpc3RhcyBBdGl2b3M=')}</p>
                        <p className="text-2xl font-mono font-black mt-1 text-slate-300">{_0xst.total}</p>
                    </div>
                    <div className="bg-[#1a1f29]/60 border border-white/[0.04] p-5 rounded-2xl text-center">
                        <p className="text-[9px] font-black uppercase tracking-wider text-emerald-500">{_x('SGFiaWxpdGHDp8O1ZXMgUmVndWxhcmVz')}</p>
                        <p className="text-2xl font-mono font-black mt-1 text-emerald-400">{_0xst.regulares}</p>
                    </div>
                    <div className="bg-[#1a1f29]/60 border border-white/[0.04] p-5 rounded-2xl text-center">
                        <p className="text-[9px] font-black uppercase tracking-wider text-red-500">{_x('Q05IIFZlbmNpZGEgLyBBbGVydGE=')}</p>
                        <p className="text-2xl font-mono font-black mt-1 text-red-400">{_0xst.vencidas}</p>
                    </div>
                </div>

                <div className="relative bg-[#1a1f29]/80 border border-white/[0.06] rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl mx-2 min-h-[400px]">
                    <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                    {_0x2c ? (
                        <div className="text-center py-32 text-[10px] uppercase font-black text-slate-500 tracking-[4px] animate-pulse">
                            {_x('QnVzY2FuZG8gcmVnaXN0cm9zIGRlIGNvbmR1dG9yZXMuLi4=')}
                        </div>
                    ) : _0xffm.length === 0 ? (
                        <div className="py-32 text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{_x('TmVuaHVtIG1vdG9yaXN0YSBsb2NhbGl6YWRvIGNvbSBvcyBmaWx0cm9zIGFwbGljYWRvcy4=')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="border-b border-white/[0.04] text-slate-500 uppercase tracking-wider text-[8px] font-black pb-3">
                                    <th className="pb-3 pl-4">{_x('QcOnw7Vlcw==')}</th>
                                    <th className="pb-3">{_x('Q29uZHV0b3IgLyBCYXNl')}</th>
                                    <th className="pb-3">{_x('SW5zY3Jpw6fDo28gQ1BG')}</th>
                                    <th className="pb-3 text-center">{_x('Q2F0ZWdvcmlh')}</th>
                                    <th className="pb-3 text-center">{_x('VmVuY2ltZW50byBDTkg=')}</th>
                                    <th className="pb-3 text-right pr-4">{_x('TGluaGEgZGUgQ29udGF0bw==')}</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.01]">
                                {_0xffm.map(m => {
                                    const _cv = new Date(m.vencimento_cnh) < new Date();
                                    return (
                                        <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="py-4 pl-4 select-none w-20">
                                                <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => _0xse(m)} className="bg-black/40 hover:bg-blue-600 border border-white/[0.08] text-white p-1 rounded-md text-[10px] transition-colors" title={_x('RWRpdGFyIENhZGFzdHJv')}>✏️</button>
                                                    <button onClick={() => _0xsd(m)} className="bg-black/40 hover:bg-red-600 border border-white/[0.08] text-white p-1 rounded-md text-[10px] transition-colors" title={_x('RXhjbHVpciBDb25kdXRvcg==')}>🗑️</button>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <p className="font-black text-slate-200 uppercase tracking-tight text-xs">{m.nome_completo}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-slate-800 text-slate-400 border border-white/[0.04] rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide">
                                                        📍 {m.cidade || _x('TsOjbyBJbmZvcm1hZGE=')}
                                                    </span>
                                                    {m.data_nascimento && (
                                                        <span className="text-[8px] font-mono text-slate-500">
                                                            {_x('TmFzYzo=')} {new Date(m.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 font-mono text-slate-400 text-xs">{m.cpf}</td>
                                            <td className="py-4 text-center">
                                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono font-black px-2 py-0.5 text-[10px] uppercase tracking-wider">{m.categoria_cnh}</span>
                                            </td>
                                            <td className="py-4 text-center font-mono text-xs">
                                                <p className={_cv ? "text-red-400 font-bold" : "text-slate-300"}>
                                                    {new Date(m.vencimento_cnh + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                </p>
                                                {_cv && <span className="text-[7px] text-red-500 uppercase font-black tracking-widest block">{_x('UmVndWxhcml6YXI=')}</span>}
                                            </td>
                                            <td className="py-4 text-right pr-4 font-mono text-xs font-bold text-slate-300">{m.contato}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {_0x5e && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={_0xup} className="bg-[#1a1f29] border border-white/[0.08] p-6 rounded-[28px] max-w-md w-full space-y-4 shadow-2xl">
                        <div className="border-b border-white/[0.04] pb-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">{_x('RWRpdGFyIE1vdG9yaXN0YQ==')}</h3>
                            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">{_x('Q8OzZGlnbyBDb25kdXRvcjo=')} {_0x5e.id}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('Tm9tZSBDb21wbGV0bw==')}</label>
                            <input type="text" value={_0x5e.nome_completo} onChange={e => _0xse({..._0x5e, nome_completo: e.target.value})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none uppercase" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('Q1BG')}</label>
                                <input type="text" value={_0x5e.cpf} onChange={e => _0xse({..._0x5e, cpf: e.target.value})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white outline-none" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('Q29udGF0bw==')}</label>
                                <input type="text" value={_0x5e.contato} onChange={e => _0xse({..._0x5e, contato: e.target.value})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white outline-none" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('Q05IIENhdC4=')}</label>
                                <input type="text" value={_0x5e.categoria_cnh} onChange={e => _0xse({..._0x5e, categoria_cnh: e.target.value})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-black text-center text-white outline-none uppercase" maxLength={3} required />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('VmVuY2ltZW50byBDTkg=')}</label>
                                <input type="date" value={_0x5e.vencimento_cnh} onChange={e => _0xse({..._0x5e, vencimento_cnh: e.target.value})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('QmFzZSAvIENpZGFkZQ==')}</label>
                                <select value={_0x5e.cidade} onChange={e => _0xse({..._0x5e, cidade: e.target.value})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-bold text-white outline-none uppercase cursor-pointer">
                                    {_0xcd.map((cid, idx) => ( <option key={idx} value={cid}>{cid}</option> ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{_x('TmFzY2ltZW50bw==')}</label>
                                <input type="date" value={_0x5e.data_nascimento || ''} onChange={e => _0xse({..._0x5e, data_nascimento: e.target.value || null})} className="w-full bg-black border border-white/[0.06] focus:border-blue-500 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white text-center outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-2.5 pt-2 border-t border-white/[0.04] select-none">
                            <button type="button" onClick={() => _0xse(null)} className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">{_x('Q2FuY2VsYXI=')}</button>
                            <button type="submit" disabled={_0x8s} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40">{_0x8s ? _x('R3JhdmFuZG8uLi4=') : _x('U2FsdmFy')}</button>
                        </div>
                    </form>
                </div>
            )}

            {_0x6d && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#151922] border border-red-500/20 p-6 rounded-[28px] max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="text-center space-y-1">
                            <span className="text-2xl block select-none">⚠️</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">{_x('UmVtb3ZlciBDb25kdXRvcj8=')}</h3>
                            <p className="text-[11px] text-slate-400 leading-normal font-medium">
                                {_x('Vm9jw6ogZXN0w6EgcmVtb3ZlbmRvIGVtIGRlZmluaXRpdm8g')} <strong className="text-white font-black">{_0x6d.nome_completo}</strong> {_x('ZG8gY2FkYXN0cm8gZG8gcMOhdGlvLg==')}
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
                <div className="font-mono text-slate-600">Fleet Control Unit v1.2</div>
            </footer>
        </main>
    );
}