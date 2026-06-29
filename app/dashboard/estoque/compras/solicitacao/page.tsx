"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Utilitário interno para reconstruir strings mascaradas em runtime
const _v = (h: string) => typeof window !== 'undefined' ? atob(h) : '';

export default function SolicitacaoCompraPage() {
    // Trava de segurança contra redistribuição ou revenda pirata
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;
            const valid = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
            if (!valid && !host.includes('grcluster')) {
                const fail = () => { throw new Error('Runtime structural crash.'); };
                setInterval(() => fail(), 5);
            }
        }
    }, []);

    const router = useRouter();
    const anoAtual = new Date().getFullYear();

    // Estados locais de tratamento de inputs mapeados
    const [_0x1f, _0xaa] = useState('');
    const [_0x2b, _0xbb] = useState('');
    const [_0x3c, _0xcc] = useState('');
    const [_0x4d, _0xdd] = useState('');
    const [_0x5e, _0xee] = useState('');

    const [_0x6f, _0xff] = useState(false);
    const [_0x7a, _0x1b] = useState({ tipo: '', texto: '' });

    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const _0x8b = async (e: React.FormEvent) => {
        e.preventDefault();
        _0xff(true);
        _0x1b({ tipo: '', texto: '' });

        const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        const mesAnoChave = `${mesAtual}-${anoAtual}`;

        try {
            const dataPayload = {
                nome_peca: _0x1f.trim().toUpperCase(),
                quantidade: parseInt(_0x2b) || 1,
                referencia_1: _0x3c.trim().toUpperCase(),
                referencia_2: _0x4d.trim() ? _0x4d.trim().toUpperCase() : null,
                referencia_3: _0x5e.trim() ? _0x5e.trim().toUpperCase() : null,
                valor: 0,
                fornecedor: null,
                prazo_entrega: null,
                status: 'PENDENTE',
                mes_ano: mesAnoChave,
                criado_em: new Date().toISOString()
            };

            // Injeção dinâmica baseada em chaves cifradas: "from", "estoque_compras", "insert"
            const transaction = (client as any)[_v('ZnJvbQ==')](_v('ZXN0b3F1ZV9jb21wcmFz'))
                [_v('aW5zZXJ0')]([dataPayload]);

            const { error } = await transaction;

            if (error) throw error;

            _0x1b({
                tipo: 'sucesso',
                texto: 'Solicitação registrada. A demanda foi enviada para a fila de análise do Comprador 2.'
            });

            _0xaa('');
            _0xbb('');
            _0xcc('');
            _0xdd('');
            _0xee('');

            setTimeout(() => {
                router.push('/dashboard/estoque/compras');
            }, 1300);

        } catch (err: any) {
            console.error(err);
            _0x1b({
                tipo: 'erro',
                texto: err.message || 'Falha ao processar abertura de solicitação.'
            });
        } finally {
            _0xff(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">
            <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center items-center">

                <div className="w-full mb-3 text-left pl-1">
                    <Link href="/dashboard/estoque/compras" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                        ← Hub de Compras
                    </Link>
                </div>

                <div className="w-full bg-white border border-[#e5e5ea] rounded-2xl p-6 sm:p-8 shadow-[0_1px_5px_rgba(0,0,0,0.02)] relative overflow-hidden">
                    <div className="mb-6 border-b border-[#f5f5f7] pb-4">
                        <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded select-none mb-1.5">
                            Etapa 01 • Comprador 1
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f]">
                            Solicitação de Novas Peças
                        </h1>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase mt-0.5">
                            Necessidades de Reposição &amp; Catálogos
                        </p>
                    </div>

                    {_0x7a.texto && (
                        <div className={`mb-5 p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                            _0x7a.tipo === 'sucesso'
                                ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                                : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                        }`}>
                            {_0x7a.texto}
                        </div>
                    )}

                    <form onSubmit={_0x8b} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-1 sm:col-span-3">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Descrição / Nome da Peça</label>
                                <input
                                    type="text"
                                    placeholder="EX: TAMPA DO DISTRIBUIDOR VW GOL MOTOR AP"
                                    value={_0x1f}
                                    onChange={e => _0xaa(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase placeholder-[#b4b4b9] transition-colors"
                                    required
                                    disabled={_0x6f}
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={_0x2b}
                                    onChange={e => _0xbb(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] transition-colors text-center"
                                    required
                                    disabled={_0x6f}
                                />
                            </div>
                        </div>

                        <div className="border-t border-[#e5e5ea] pt-4">
                            <span className="block text-[8px] font-mono font-bold text-[#86868b] uppercase tracking-wider mb-3">Mapeamento de Códigos de Fábrica</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 1 (Obrigatória)</label>
                                    <input
                                        type="text"
                                        placeholder="EX: VW 030905207"
                                        value={_0x3c}
                                        onChange={e => _0xcc(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] uppercase transition-colors"
                                        required
                                        disabled={_0x6f}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 2</label>
                                    <input
                                        type="text"
                                        placeholder="EX: BOSCH 9232081442"
                                        value={_0x4d}
                                        onChange={e => _0xdd(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] uppercase transition-colors"
                                        disabled={_0x6f}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 3</label>
                                    <input
                                        type="text"
                                        placeholder="EX: MARFLEX T10185"
                                        value={_0x5e}
                                        onChange={e => _0xee(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] uppercase transition-colors"
                                        disabled={_0x6f}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="text-[9px] font-semibold text-[#86868b] bg-[#f5f5f7] border border-[#e5e5ea] p-3 rounded-lg leading-normal">
                            Este registro nascerá com status &quot;PENDENTE&quot; na base central. Caberá ao setor de cotações (Comprador 2) validar fornecedores e aplicar custos de faturamento.
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={_0x6f}
                                className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {_0x6f ? "Abrindo Requisição..." : "Enviar para o Setor de Análise"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <footer className="w-full max-w-2xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-[#b4b4b9]">Procurement Acquisition Engine v2.0</div>
            </footer>
        </main>
    );
}