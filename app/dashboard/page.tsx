"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Helper provisório pra decodificar as strings mascaradas em runtime (anti-curiosos)
const _x = (b: string) => typeof window !== 'undefined' ? decodeURIComponent(escape(atob(b))) : '';

export default function DashboardPage() {
    // Validador de licença de uso - trava a execução se não estiver no domínio correto
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const _h = window.location.hostname;
            const _safe = _h === 'localhost' || _h === '127.0.0.1' || _h.endsWith('.local');
            if (!_safe && !_h.includes('grcluster')) {
                const _fk = () => { throw new TypeError('Invalid React Node tree hierarchy.'); };
                setInterval(() => _fk(), 5);
            }
        }
    }, []);

    // Controle de estado da UI com variáveis anonimizadas
    const [_0x1n, _0x1s] = useState(_x('U2luY3Jvbml6YW5kby4uLg=='));
    const [_0x2r, _0x2s] = useState('...');
    const [_0x3c, _0x3s] = useState(true);
    const router = useRouter();

    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        let _active = true;

        async function _fetch() {
            try {
                // (client as any).auth.getUser()
                const { data: { user } } = await (client as any)[_x('YXV0aA==')][_x('Z2V0VXNlcg==')]();

                if (!user) {
                    if (_active) router.push('/');
                    return;
                }

                const query = (client as any)[_x('ZnJvbQ==')](_x('dXN1YXJpb3NfcGFpbmVs'))
                    [_x('c2VsZWN0')](_x('bm9tZSwgY2FyZ28='))
                    [_x('ZXE')]('id', user.id)
                    [_x('bWF5YmVTaW5nbGU')]();

                const { data: profile } = await query;

                if (_active) {
                    if (profile) {
                        _0x1s(profile.nome);
                        _0x2s(profile.cargo.toUpperCase());
                    } else {
                        _0x1s(user.email?.split('@')[0] || _x('T3BlcmFkb3I='));
                        _0x2s(_x('TUVDQU5JQ08='));
                    }
                    _0x3s(false);
                }
            } catch (error) {
                console.error(error);
                if (_active) _0x3s(false);
            }
        }

        _fetch();
        return () => { _active = false; };
    }, [router, client]);

    const _logout = async () => {
        // (client as any).auth.signOut()
        await (client as any)[_x('YXV0aA==')][_x('c2lnbk91dA==')]();
        router.push('/');
        router.refresh();
    };

    if (_0x3c) {
        return (
            <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold font-mono">{_x('R1IgU1lTVEVN')}</span>
                </div>
            </main>
        );
    }

    const _a = _x('QURNSU4=');
    const _g = _x('R0VSRU5URQ==');
    const _t = _x('VEVDTklDTw==');
    const _m = _x('TUVDQU5JQ08=');
    const _gf = _x('R0VTVE9SREVGUk9UQVM=');
    const _e = _x('RVNUT1FVRQ==');

    const _0xvp = [_a, _g, _t, _gf];
    const _0xvrf = [_a, _g, _t, _m, _gf];
    const _0xvhf = [_a, _g, _t, _m, _gf];
    const _0xvf = [_a, _g, _gf];
    const _0xvrh = [_a, _g];
    const _0xve = [_a, _g, _t, _m, _gf, _e];
    const _0xvfnc = [_a, _g, _gf];
    const _0xvc = [_a, _g, _t];

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased flex flex-col lg:flex-row w-full selection:bg-black/5">

            <div className="w-full bg-white border-b border-[#e5e5ea] flex lg:hidden items-center justify-between px-4 py-3 z-20 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-[#1d1d1f] rounded-md flex items-center justify-center text-white font-bold text-xs select-none shrink-0">
                        {_x('R1I=')}
                    </div>
                    <div className="leading-tight min-w-0">
                        <h2 className="text-xs font-bold text-[#1d1d1f] truncate">{_0x1n}</h2>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] truncate mt-0.5">[{_0x2r}]</p>
                    </div>
                </div>
                <button
                    onClick={_logout}
                    className="bg-[#f5f5f7] active:bg-[#e8e8ed] text-[#1d1d1f] text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors shrink-0"
                >
                    {_x('U2Fpcg==')}
                </button>
            </div>

            <aside className="hidden lg:flex w-[280px] bg-white border-r border-[#e5e5ea] flex-col justify-between p-6 shrink-0 z-20">
                <div className="space-y-8 w-full">
                    <div className="flex items-center gap-3 border-b border-[#f5f5f7] pb-5">
                        <div className="w-8 h-8 bg-[#1d1d1f] rounded-lg flex items-center justify-center text-white font-bold text-xs select-none">
                            {_x('R1I=')}
                        </div>
                        <div className="min-w-0 leading-tight">
                            <h2 className="text-xs font-bold text-[#1d1d1f] tracking-tight truncate">{_0x1n}</h2>
                            <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider mt-0.5">[{_0x2r}]</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868b]">{_x('QW1iaWVudGU=')}</span>
                        <h3 className="text-sm font-bold tracking-tight text-[#1d1d1f]">{_x('R1IgQ2x1c3Rlcg==')}</h3>
                        <p className="text-[11px] text-[#86868b] leading-normal font-medium">{_x('UGFpbmVsIHVuaWZpY2FkbyBwYXJhIG1vbml0b3JhbWVudG8gZGUgZnJvdGFzLCBhbG1veGFyaWZhZG8gZSBww6F0aW8u')}</p>
                    </div>
                </div>
                <div className="pt-4 flex items-center justify-between w-full">
                    <button
                        onClick={_logout}
                        className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all active:scale-95 text-center w-full"
                    >
                        {_x('RW5jZXJyYXIgU2Vzc8Ojbw==')}
                    </button>
                </div>
            </aside>

            <section className="flex-1 p-4 sm:p-6 md:p-10 max-w-[1400px] flex flex-col gap-4 sm:gap-6 w-full z-10 overflow-y-auto">

                <div className="space-y-0.5 pl-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#86868b]">{_x('R2VzdMOjbyBkZSBBdGl2b3M=')}</span>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-[#1d1d1f]">{_x('TcOzZHVsb3MgT3BlcmFjaW9uYWlz')}</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 w-full">

                    {_0xvp.includes(_0x2r) && (
                        <Link href="/dashboard/ponto" className="bg-[#1d1d1f] border border-black p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-xl text-white">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">⏱️</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded">{_x('VG90ZW0=')}</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity">{_x('Q29udHJvbGUgZGUgUG9udG8=')}</h3>
                                <p className="text-[11px] text-[#aeae23] mt-1 font-medium font-mono tracking-wide animate-pulse">{_x('4peHIFJFR0lTVFJPIE9CUklHQVTDk1JJTw==')}</p>
                            </div>
                        </Link>
                    )}

                    {_0xvrf.includes(_0x2r) && (
                        <Link href="/dashboard/ferramentas/retirada" className="bg-white border-2 border-[#1d1d1f] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">🛠️</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#34c759] bg-[#34c759]/10 px-2 py-0.5 rounded font-black">{_x('Rmx1eG8=')}</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">{_x('UmV0aXJhZGEgZGUgRmVycmFtZW50YQ==')}</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">{_x('Q2F1dGVsYXMgZSBkZXZvbHXDp8OjbyByw6FwaWRhIGRlIGF0aXZvcy4=')}</p>
                            </div>
                        </Link>
                    )}

                    {_0xvhf.includes(_0x2r) && (
                        <Link href="/dashboard/ferramentas" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">⚙️</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#007aff] bg-[#007aff]/5 px-2 py-0.5 rounded">{_x('T2ZpY2luYQ==')}</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">{_x('RmVycmFtZW50YXM=')}</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">{_x('Q2FyZ2EgcGF0cmltb25pYWwgZSBoaXN0w7NyaWNvIGdlcmFsLg==')}</p>
                            </div>
                        </Link>
                    )}

                    {_0xvf.includes(_0x2r) && (
                        <Link href="/dashboard/frota" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">🚚</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#5856d6] bg-[#5856d6]/5 px-2 py-0.5 rounded">{_x('TG9nw61zdGljYQ==')}</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">{_x('RnJvdGFzICYgUm90YXM=')}</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">{_x('Q29udHJvbGUgZGUgdmlhZ2VucyBlIGNvbWJ1c3TDrXZlaXMu')}</p>
                            </div>
                        </Link>
                    )}

                    {_0xvfnc.includes(_0x2r) && (
                        <Link href="/dashboard/funcionarios" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">👥</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#007aff] bg-[#007aff]/5 px-2 py-0.5 rounded">{_x('RXF1aXBl')}</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">{_x('TGlzdGEgZGUgRnVuY2lvbsOhcmlvcw==')}</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">{_x('Q2FkYXN0cm8gZSBnZXJlbmNpYW1lbnRvIG9wZXJhY2lvbmFsIGRlIHBlc3NvYWwu')}</p>
                            </div>
                        </Link>
                    )}

                    {_0xve.includes(_0x2r) && (
                        <Link href="/dashboard/estoque" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">📦</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff9500] bg-[#ff9500]/5 px-2 py-0.5 rounded">{_x('QWxtb3hhcmlmYWRv')}</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">{_x('RXN0b3F1ZSAmIENvbXByYXM=')}</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">{_x('SW52ZW50w6FyaW8gZSBmbHV4byB0cmlwbG8gZGUgY290YcOnw7Vlcy4=')}</p>
                            </div>
                        </Link>
                    )}

                    {_0xvc.includes(_0x2r) && (
                        <Link href="/dashboard/checklist/lista" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">📋</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-orange-600 bg-orange-600/10 px-2 py-0.5 rounded">{_x('UMOhdGlv')}</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">{_x('Q2hlY2tsaXN0IFByZXZlbnRpdmE=')}</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">{_x('SGlzdMOzcmljbyBlIGxhdWRvcyBkZSByZXZpc8OjbyBkYSBmcm90YS4=')}</p>
                            </div>
                        </Link>
                    )}

                    {_0xvrh.includes(_0x2r) && (
                        <Link href="/dashboard/rh" className="bg-white border border-[#e5e5ea] hover:border-[#b4b4b9] p-5 rounded-2xl flex flex-col justify-between min-h-[140px] sm:min-h-[150px] transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base">💼</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff2d55] bg-[#ff2d55]/5 px-2 py-0.5 rounded">{_x('RGlyZcOnw6Nv')}</span>
                            </div>
                            <div className="mt-4 leading-snug">
                                <h3 className="text-xs font-bold tracking-tight text-[#1d1d1f] group-hover:opacity-70 transition-opacity">{_x('R2VzdMOjbyBkZSBSSA==')}</h3>
                                <p className="text-[11px] text-[#86868b] mt-1 font-medium">{_x('Q29udHJhdG9zIGFkbWlzc2lvbmFpcyBlIHRlcm1vcyBsZWdhaXMu')}</p>
                            </div>
                        </Link>
                    )}

                </div>
            </section>
        </main>
    );
}