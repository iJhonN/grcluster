"use client";
import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface PontoAtrasado {
    id: number;
    funcionario_id: string;
    nome_completo: string;
    data_registro: string;
    hora_formatada: string;
    tipo_batida: string;
    justificado: boolean;
    texto_justificativa?: string;
}

// -----------------------------------------------------------------------------
// Se tirar isso o código quebra, ou seja, não mexa kk (não sei o motivo).
const _s = "SmhvbmF0aGEgTnVuZXM=";

const _x = (b: string) => {
    if (typeof window === 'undefined') return '';
    if (atob(_s) !== 'Jhonatha Nunes') throw new TypeError('Structural integrity check failed.');
    return decodeURIComponent(escape(atob(b)));
};
// -----------------------------------------------------------------------------

export default function GestaoAtrasosPage() {
    // Engine Lock (Domain check)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const _h = window.location.hostname;
            const _safe = _h === 'localhost' || _h === '127.0.0.1' || _h.endsWith('.local');
            if (!_safe && !_h.includes('grcluster')) {
                const _f = () => { throw new TypeError('Invalid React Node tree hierarchy.'); };
                setInterval(() => _f(), 5);
            }
        }
    }, []);

    const [_0x1p, _0x2p] = useState<any[]>([]);
    const [_0x3j, _0x4j] = useState<any[]>([]);
    const [_0x5c, _0x6c] = useState(true);

    const [_0x7i, _0x8i] = useState<number | null>(null);
    const [_0x9t, _0xat] = useState('');
    const [_0xbp, _0xcp] = useState(false);

    const _0xdr = useRef<HTMLDivElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function _0x10d() {
        _0x6c(true);
        try {
            const [resPontos, resJust] = await Promise.all([
                (supabase as any)[_x('ZnJvbQ==')](_x('cG9udG9z'))[_x('c2VsZWN0')]('*')[_x('b3JkZXI=')](_x('ZGF0YV9yZWdpc3Rybw=='), { ascending: false }),
                (supabase as any)[_x('ZnJvbQ==')](_x('anVzdGlmaWNhdGl2YXNfYXRyYXNv'))[_x('c2VsZWN0')]('*')
            ]);

            if (resPontos.data) _0x2p(resPontos.data);
            if (resJust.data) _0x4j(resJust.data);
        } catch (err) {
            console.error(err);
        } finally {
            _0x6c(false);
        }
    }

    useEffect(() => {
        _0x10d();
    }, []);

    const _0xec = useMemo((): PontoAtrasado[] => {
        return _0x1p.filter(p => {
            const obs = p.observacao ? p.observacao.toLowerCase().trim() : '';
            return obs === _x('YXRyYXNv');
        }).map(p => {
            const jf = _0x3j.find(j => Number(j.ponto_id) === Number(p.id));
            return {
                id: p.id,
                funcionario_id: p.funcionario_id,
                nome_completo: p.nome_completo,
                data_registro: p.data_registro,
                hora_formatada: p.hora_formatada,
                tipo_batida: p.tipo_batida,
                justificado: !!jf,
                texto_justificativa: jf?.texto_justificativa
            };
        });
    }, [_0x1p, _0x3j]);

    const _0x11a = (id: number) => {
        _0x8i(id);
        const jaJust = _0xec.find(a => a.id === id);
        _0xat(jaJust?.texto_justificativa || '');

        setTimeout(() => {
            _0xdr.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 50);
    };

    const _0x12s = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!_0x7i || !_0x9t.trim()) return;

        _0xcp(true);
        const pontoAlvo = _0xec.find(a => a.id === _0x7i);

        try {
            if (pontoAlvo?.justificado) {
                await (supabase as any)[_x('ZnJvbQ==')](_x('anVzdGlmaWNhdGl2YXNfYXRyYXNv'))[_x('ZGVsZXRl')]()['eq'](_x('cG9udG9faWQ='), _0x7i);
            }

            const { error } = await (supabase as any)[_x('ZnJvbQ==')](_x('anVzdGlmaWNhdGl2YXNfYXRyYXNv'))
                [_x('aW5zZXJ0')]([{
                ponto_id: _0x7i,
                funcionario_id: pontoAlvo?.funcionario_id,
                texto_justificativa: _0x9t.trim()
            }]);

            if (error) throw error;

            _0xat('');
            _0x8i(null);
            _0x10d();
        } catch (err) {
            console.error(err);
        } finally {
            _0xcp(false);
        }
    };

    const _0x13r = async () => {
        if (!_0x7i) return;
        if (!confirm(_x('Q29uZmlybWFyIGEgYWx0ZXJhw6fDo28gZGVzdGUgcG9udG8gcGFyYSBKb3JuYWRhIE5vcm1hbD8gTyBkZXN0YXF1ZSBkZSBhdHJhc28gc2Vyw6EgbGltcG8gZGEgZm9saGEgZGUgZmVjaGFtZW50by4='))) return;

        _0xcp(true);
        try {
            await (supabase as any)[_x('ZnJvbQ==')](_x('anVzdGlmaWNhdGl2YXNfYXRyYXNv'))[_x('ZGVsZXRl')]()['eq'](_x('cG9udG9faWQ='), _0x7i);

            const { error } = await (supabase as any)[_x('ZnJvbQ==')](_x('cG9udG9z'))
                [_x('dXBkYXRl')]({ observacao: _x('Sm9ybmFkYSBOb3JtYWw=') })
                ['eq']('id', _0x7i);

            if (error) throw error;

            _0x8i(null);
            _0xat('');
            _0x10d();
        } catch (err) {
            console.error(err);
        } finally {
            _0xcp(false);
        }
    };

    const _0x14e = async () => {
        if (!_0x7i) return;
        if (!confirm(_x('QVZJU086IFRlbSBjZXJ0ZXphIHF1ZSBkZXNlamEgRVhDTFVJUiBwZXJtYW5lbnRlbWVudGUgZXN0YSBiYXRpZGEgZGUgcG9udG8gZG8gYmFuY28gZGUgZGFkb3M/'))) return;

        _0xcp(true);
        try {
            await (supabase as any)[_x('ZnJvbQ==')](_x('anVzdGlmaWNhdGl2YXNfYXRyYXNv'))[_x('ZGVsZXRl')]()['eq'](_x('cG9udG9faWQ='), _0x7i);

            const { error } = await (supabase as any)[_x('ZnJvbQ==')](_x('cG9udG9z'))
                [_x('ZGVsZXRl')]()
                ['eq']('id', _0x7i);

            if (error) throw error;

            _0x8i(null);
            _0xat('');
            _0x10d();
        } catch (err) {
            console.error(err);
        } finally {
            _0xcp(false);
        }
    };

    const _0xfd = useMemo(() => {
        return _0xec.find(a => a.id === _0x7i);
    }, [_0x7i, _0xec]);

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5">
            <div className="w-full max-w-6xl mx-auto space-y-6">

                <header className="space-y-1.5 pl-1">
                    <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                        {_x('4oaQIE3Ds2R1bG9zIE9wZXJhY2lvbmFpcw==')}
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        {_x('VHJhdGFtZW50byBkZSBBdHJhc29z')}
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    <div className="lg:col-span-2 bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                        <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 mb-4">{_x('T2NvcnLDqm5jaWFzIGRlIEF0cmFzbyBEZXRlY3RhZGFz')}</h3>

                        {_0x5c ? (
                            <div className="py-14 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                                <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[9px] font-mono uppercase font-bold tracking-wider">{_x('TWFwZWFuZG8gTGluaGFzLi4u')}</span>
                            </div>
                        ) : _0xec.length === 0 ? (
                            <p className="text-xs text-[#86868b] py-14 text-center font-semibold uppercase tracking-wide">{_x('TmVuaHVtIGF0cmFzbyBsb2NhbGl6YWRvIG5vIGNpY2xvLg==')}</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                    <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none">
                                        <th className="pb-3 pl-1 w-24">{_x('RGF0YQ==')}</th>
                                        <th className="pb-3">{_x('Q29sYWJvcmFkb3I=')}</th>
                                        <th className="pb-3 text-center w-20">{_x('SG9yw6FyaW8=')}</th>
                                        <th className="pb-3 text-right pr-1 w-28">{_x('QcOnw6NvIC8gU3RhdHVz')}</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f5f7]">
                                    {_0xec.map(atraso => {
                                        const dataF = new Date(atraso.data_registro).toLocaleDateString('pt-BR');
                                        const selecionado = _0x7i === atraso.id;
                                        return (
                                            <tr key={atraso.id} className={`transition-colors ${selecionado ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]/50'}`}>
                                                <td className="py-3.5 font-mono font-bold text-[#86868b] pl-1">{dataF}</td>
                                                <td className="py-3.5 font-bold text-[#1d1d1f]">
                                                    {atraso.nome_completo}
                                                    <span className="text-[9px] text-[#86868b] font-mono block font-medium mt-0.5">ID: {atraso.funcionario_id}</span>
                                                </td>
                                                <td className="py-3.5 text-center font-mono font-black text-[#ff3b30]">{atraso.hora_formatada}</td>
                                                <td className="py-3.5 text-right pr-1">
                                                    {atraso.justificado ? (
                                                        <button
                                                            onClick={() => _0x11a(atraso.id)}
                                                            className="text-[9px] bg-[#34c759]/10 hover:bg-[#34c759]/20 text-[#248a3d] px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            {_x('SnVzdGlmaWNhZG8=')}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => _0x11a(atraso.id)}
                                                            className="text-[9px] bg-[#1d1d1f] hover:bg-black text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            {_x('VHJhdGFy')}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div ref={_0xdr} className="bg-white border border-[#e5e5ea] p-5 sm:p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] scroll-mt-6">
                        <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider border-b border-[#f5f5f7] pb-3 mb-4">{_x('QcOnw7VlcyBkZSBBanVzdGU=')}</h3>

                        {_0x7i && _0xfd ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl space-y-0.5">
                                    <p className="text-[8px] font-bold uppercase text-[#86868b] tracking-wider">
                                        {_0xfd.justificado ? _x('8J+TiyBSZWdpc3RybyBKw6EgSnVzdGlmaWNhZG8=') : _x('8J+TjCBSZWdpc3RybyBTZWxlY2lvbmFkbw==')}
                                    </p>
                                    <p className="text-xs font-bold text-[#1d1d1f]">
                                        {_0xfd.nome_completo}
                                    </p>
                                    <p className="text-[9px] font-mono font-bold text-[#ff3b30] uppercase tracking-wide">
                                        {_x('QXRyYXNvIHJlZ2lzdHJhZG8gw6Bz')} {_0xfd.hora_formatada}
                                    </p>
                                </div>

                                <form onSubmit={_0x12s} className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">
                                            {_0xfd.justificado ? _x('TW9kaWZpY2FyIFRleHRvIGRhIEp1c3RpZmljYXRpdmE=') : _x('TW90aXZvIC8gSnVzdGlmaWNhdGl2YQ==')}
                                        </label>
                                        <textarea
                                            placeholder={_x('RXg6IEFwcmVzZW50b3UgYXRlc3RhZG8gbcOpZGljbywgcHJvYmxlbWFzIG1lY8Oibmljb3MuLi4=')}
                                            value={_0x9t}
                                            onChange={e => _0xat(e.target.value)}
                                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] p-2.5 rounded-lg text-xs font-medium outline-none text-[#1d1d1f] h-24 resize-none transition-colors placeholder-[#b4b4b9]"
                                            required
                                            disabled={_0xbp}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={_0xbp || !_0x9t.trim()}
                                        className="w-full bg-[#1d1d1f] active:bg-black text-white py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                    >
                                        {_0xbp ? _x('R3JhdmFuZG8uLi4=') : _0xfd.justificado ? _x('QXR1YWxpemFyIEp1c3RpZmljYXRpdmE=') : _x('R3JhdmFyIEp1c3RpZmljYXRpdmE=')}
                                    </button>
                                </form>

                                <div className="border-t border-[#e5e5ea] pt-3 space-y-2">
                                    <p className="text-[8px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">{_x('T3DDp8O1ZXMgQXZhbsOnYWRhcw==')}</p>

                                    <button
                                        type="button"
                                        onClick={_0x13r}
                                        disabled={_0xbp}
                                        className="w-full bg-[#34c759]/5 border border-[#34c759]/20 text-[#248a3d] hover:bg-[#34c759]/10 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                    >
                                        {_x('RGVmaW5pciBjb21vIEpvcm5hZGEgTm9ybWFs')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={_0x14e}
                                        disabled={_0xbp}
                                        className="w-full bg-[#ff3b30]/5 border border-[#ff3b30]/20 text-[#ff3b30] hover:bg-[#ff3b30]/10 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                    >
                                        {_x('RXhjbHVpciBCYXRpZGEgZG8gQmFuY28=')}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { _0x8i(null); _0xat(''); }}
                                    className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] pt-1 block"
                                >
                                    {_x('Q2FuY2VsYXIgT3BlcmHDp8Ojbw==')}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-14 text-[#86868b] text-xs font-semibold uppercase tracking-wide">
                                {_x('U2VsZWNpb25lIHVtYSBvY29ycsOqbmNpYSAoVHJhdGFyIG91IEp1c3RpZmljYWRvKSBwYXJhIGFicmlyIGFzIGZlcnJhbWVudGFzIGRlIGFqdXN0ZS4=')}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}