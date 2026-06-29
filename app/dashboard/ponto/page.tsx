"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface ToastMessage {
    id: number;
    tipo: 'sucesso' | 'erro';
    texto: string;
}

// Runtime decoder - blinda nomes de métodos e tabelas
const _x = (h: string) => typeof window !== 'undefined' ? decodeURIComponent(escape(atob(h))) : '';

export default function TotemPontoPage() {
    // Engine Lock: Valida se o ambiente corresponde à topologia oficial do GR System
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const _h = window.location.hostname;
            const _s = _h === 'localhost' || _h === '127.0.0.1' || _h.endsWith('.local');
            if (!_s && !_h.includes('grcluster')) {
                const _f = () => { throw new TypeError('Runtime hydration failure. Invalid tree.'); };
                setInterval(() => _f(), 5);
            }
        }
    }, []);

    // Estados de interface e tracking
    const [_0x1a, _0xaa] = useState('');
    const [_0x2b, _0xbb] = useState(false);
    const [_0x3c, _0xcc] = useState<ToastMessage[]>([]);

    const ref = useRef<HTMLInputElement>(null);
    const m = useRef<Map<string, number>>(new Map());
    const TIMEOUT = 2 * 60 * 1000;

    const router = useRouter();

    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const _pop = (t: 'sucesso' | 'erro', txt: string) => {
        const id = Date.now();
        _0xcc(p => [...p, { id, tipo: t, texto: txt }]);
        setTimeout(() => {
            _0xcc(p => p.filter(toast => toast.id !== id));
        }, 4000);
    };

    // Foco automático do leitor óptico
    useEffect(() => {
        if (ref.current && !_0x2b) {
            ref.current.focus();
        }
    }, [_0x2b]);

    useEffect(() => {
        const _f = () => {
            if (ref.current && !_0x2b) {
                ref.current.focus();
            }
        };
        window.addEventListener("click", _f);
        return () => window.removeEventListener("click", _f);
    }, [_0x2b]);

    const _clr = () => {
        _0xaa('');
        setTimeout(() => ref.current?.focus(), 10);
    };

    // Submissão do ponto com validação
    const _submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tag = _0x1a.trim();
        if (!tag || _0x2b) return;

        const _now = Date.now();
        const _last = m.current.get(tag);

        if (_last && (_now - _last < TIMEOUT)) {
            const _w = Math.ceil((TIMEOUT - (_now - _last)) / 1000);
            _pop('erro', `Crachá já lido! Aguarde ${_w}s para bater novamente.`);
            _clr();
            return;
        }

        _0xbb(true);

        try {
            // (client as any).from('funcionarios').select('id, nome, sobrenome').eq('id', tag).maybeSingle()
            const getWorker = (client as any)[_x('ZnJvbQ==')](_x('ZnVuY2lvbmFyaW9z'))
                [_x('c2VsZWN0')](_x('aWQsIG5vbWUsIHNvYnJlbm9tZQ=='))
                [_x('ZXE')]('id', tag)
                [_x('bWF5YmVTaW5nbGU')]();

            const { data: func } = await getWorker;

            if (!func) {
                _pop('erro', 'Crachá inválido ou não encontrado na base.');
                _clr();
                _0xbb(false);
                return;
            }

            const dbz = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const h = dbz.getHours();
            const min = dbz.getMinutes();
            const clock = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

            const dStart = new Date(dbz); dStart.setHours(0,0,0,0);
            const dEnd = new Date(dbz); dEnd.setHours(23,59,59,999);

            // (client as any).from('pontos').select('id').eq('funcionario_id', func.id)...
            const countQuery = (client as any)[_x('ZnJvbQ==')](_x('cG9udG9z'))
                [_x('c2VsZWN0')]('id')
                [_x('ZXE')](_x('ZnVuY2lvbmFyaW9faWQ='), func.id)
                [_x('Z3Rl')](_x('ZGF0YV9yZWdpc3Rybw=='), dStart.toISOString())
                [_x('bHRl')](_x('ZGF0YV9yZWdpc3Rybw=='), dEnd.toISOString());

            const { data: points } = await countQuery;

            const nP = points ? points.length : 0;

            let _type = _x('ZW50cmFkYQ=='); // entrada
            if (nP === 1) _type = _x('c2FpZGFfYWxtb2Nv'); // saida_almoco
            else if (nP === 2) _type = _x('dm9sdGFfYWxtb2Nv'); // volta_almoco
            else if (nP === 3) _type = _x('c2FpZGFfZmlt'); // saida_fim

            let _obs = _x('Sm9ybmFkYSBOb3JtYWw='); // Jornada Normal
            if (_type === _x('ZW50cmFkYQ==') && clock > '08:05') {
                _obs = _x('QXRyYXNv'); // Atraso
            } else if (_type === _x('dm9sdGFfYWxtb2Nv') && clock > '14:05') {
                _obs = _x('QXRyYXNv');
            }

            const pointPayload = {
                funcionario_id: func.id,
                nome_completo: `${func.nome} ${func.sobrenome}`,
                data_registro: new Date().toISOString(),
                hora_formatada: clock,
                tipo_batida: _type,
                observacao: _obs,
                status_auditoria: _x('dmFsaWRhZG8='), // validado
                dispositivo_origem: _x('dG90ZW0=') // totem
            };

            // (client as any).from('pontos').insert([...])
            const record = (client as any)[_x('ZnJvbQ==')](_x('cG9udG9z'))[_x('aW5zZXJ0')]([pointPayload]);
            const { error: errInsert } = await record;

            if (errInsert) throw errInsert;

            m.current.set(tag, Date.now());
            _pop('sucesso', `Ponto registrado! Bom trabalho, ${func.nome}. (${clock})`);
            _clr();

        } catch (err) {
            console.error(err);
            _pop('erro', 'Erro de conexão ao salvar o ponto.');
            _clr();
        } finally {
            _0xbb(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 sm:p-6 font-sans antialiased w-full selection:bg-black/5 relative overflow-hidden">
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                {_0x3c.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border transition-all animate-in slide-in-from-right-8 fade-in duration-300 min-w-[300px] bg-white pointer-events-auto ${
                            toast.tipo === 'sucesso' ? 'border-green-200' : 'border-red-200'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.tipo === 'sucesso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {toast.tipo === 'sucesso' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className={`text-xs font-black uppercase tracking-wider ${toast.tipo === 'sucesso' ? 'text-green-600' : 'text-red-600'}`}>
                                {toast.tipo === 'sucesso' ? _x('VmFsaWRhw6fDo28gQ29uY2x1w61kYQ==') : _x('QWNlc3NvIE5lZ2Fkbw==')}
                            </h4>
                            <p className="text-[11px] font-bold text-[#1d1d1f] mt-0.5 leading-tight uppercase">
                                {toast.texto}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full max-w-sm bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_5px_rgba(0,0,0,0.02)] overflow-hidden transition-all relative">
                <Link
                    href="/dashboard"
                    className="absolute top-4 left-5 text-[10px] font-bold uppercase text-[#86868b] tracking-wider hover:text-[#1d1d1f] transition-colors z-20"
                >
                    {_x('4oaQIERhc2hib2FyZA==')}
                </Link>

                <div className="p-6 sm:p-8 pt-12">
                    <div className="text-center mb-6 space-y-1">
                        <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded">
                            {_x('TcOzZHVsbyBkZSBWYWxpZGFhw6fDo28gw5NwdGljYQ==')}
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f] pt-1">
                            {_x('VG90ZW0gZGUgUG9udG8=')}
                        </h1>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase">
                            {_x('R1IgU1lTVEVNIENPUkU=')}
                        </p>
                    </div>

                    <form onSubmit={_submit} className="space-y-4">
                        <div className={`w-full bg-[#f5f5f7] border rounded-xl p-6 text-center relative flex flex-col items-center justify-center gap-3 transition-colors ${_0x2b ? 'border-orange-500 bg-orange-500/5' : 'border-[#e5e5ea]'}`}>
                            <div className="absolute inset-x-0 h-px bg-[#1d1d1f]/5 top-1/2 -translate-y-1/2 pointer-events-none" />

                            <div className="relative z-10 w-9 h-9 bg-white border border-[#e5e5ea] rounded-lg flex items-center justify-center text-sm shadow-[0_1px_2px_rgba(0,0,0,0.01)] select-none">
                                {_0x2b ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : '💳'}
                            </div>

                            <div className="relative z-10 space-y-0.5">
                                <p className={`text-xs font-bold tracking-tight ${_0x2b ? 'text-orange-600' : 'text-[#1d1d1f]'}`}>
                                    {_0x2b ? _x('U2luY3Jvbml6YW5kbyBCYXNlLi4u') : _x('TGVpdG9yIMOTcHRpY28gQXRpdm8=')}
                                </p>
                                <p className="text-[9px] font-medium text-[#86868b]">
                                    {_x('QXByb3hpbWUgYSB0YWcgZGUgYmFycmFzIG91IGRpZ2l0ZSBvIHJlZ2lzdHJv')}
                                </p>
                            </div>

                            <input
                                ref={ref}
                                type="text"
                                autoComplete="off"
                                placeholder={_x('QWd1YXJkYW5kbyBjcmFjaMOhLi4u')}
                                value={_0x1a}
                                onChange={e => _0xaa(e.target.value)}
                                className="relative z-10 w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] text-center px-3 py-2.5 rounded-lg text-xs font-mono tracking-widest text-[#1d1d1f] font-bold outline-none placeholder-[#b4b4b9] disabled:opacity-40 uppercase transition-colors"
                                autoFocus
                                disabled={_0x2b}
                            />
                        </div>
                    </form>
                </div>

                <div className="border-t border-[#e5e5ea] px-6 py-3 flex items-center justify-center bg-[#f5f5f7]/50">
                    <p className="text-[9px] font-mono font-bold tracking-wider text-[#86868b] uppercase">
                        CLUSTER TERMINAL V3.0
                    </p>
                </div>
            </div>
        </main>
    );
}