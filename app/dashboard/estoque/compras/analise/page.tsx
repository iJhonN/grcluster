"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Solicitacao {
    id: string;
    nome_peca: string;
    quantidade: number;
    referencia_1: string;
    referencia_2: string | null;
    referencia_3: string | null;
    status: 'PENDENTE' | 'EM_ANALISE' | 'COMPRADO' | 'EM_TRANSITO' | 'CONCLUIDO';
    fornecedor: string | null;
    valor: number | null;
    prazo_entrega: string | null;
    mes_ano: string;
}

// Dicionário de strings para blindar tabelas e colunas contra rastreio visual direto
const _0xdb = [
    "estoque_compras", // [0]
    "PENDENTE",        // [1]
    "EM_ANALISE",      // [2]
    "COMPRADO",        // [3]
    "EM_TRANSITO",     // [4]
    "CONCLUIDO",       // [5]
    "sucesso",         // [6]
    "erro"             // [7]
];

export default function AnaliseComprasPage() {
    // Gerenciamento de filas e estados da cotação
    const [_0x1a, _0x2b] = useState<Solicitacao[]>([]);
    const [_0x3c, _0x4d] = useState<Solicitacao | null>(null);
    const [_0x5e, _0x6f] = useState(true);
    const [_0x7a, _0x8b] = useState(false);

    // Inputs do formulário de faturamento
    const [_0x9c, _0x1f] = useState('');
    const [_0x2e, _0x3a] = useState('');
    const [_0x4b, _0x5c] = useState('');
    const [_0x6d, _0x7e] = useState<'PENDENTE' | 'EM_ANALISE' | 'COMPRADO' | 'EM_TRANSITO' | 'CONCLUIDO'>(_0xdb[2] as any);
    const [_0x8f, _0x9a] = useState('');
    const [_0x1b, _0x2c] = useState('');
    const [_0x3d, _0x4e] = useState('');

    const [_0x5f, _0x6a] = useState({ tipo: '', texto: '' });

    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Puxa fila de compras pendentes na base central
    async function _0x10f() {
        _0x6f(true);
        try {
            const { data, error } = await client
                .from(_0xdb[0])
                .select('*')
                .in('status', [_0xdb[1], _0xdb[2]])
                .order('id', { ascending: true });

            if (error) throw error;
            if (data) _0x2b(data as Solicitacao[]);
        } catch (err) {
            console.error(err);
        } finally {
            _0x6f(false);
        }
    }

    useEffect(() => {
        _0x10f();
    }, []);

    // Alimenta o painel com o item clicado na lista lateral
    const _0x20a = (item: Solicitacao) => {
        _0x4d(item);
        _0x1f(item.fornecedor || '');
        _0x3a(item.valor ? String(item.valor) : '');
        _0x5c(item.prazo_entrega || '');
        _0x7e(item.status === _0xdb[1] ? (_0xdb[2] as any) : item.status);
        _0x9a(item.referencia_1 || '');
        _0x2c(item.referencia_2 || '');
        _0x4e(item.referencia_3 || '');
        _0x6a({ tipo: '', texto: '' });
    };

    // Submete a atualização e recalcula a fila local
    const _0x30b = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!_0x3c) return;

        _0x8b(true);
        _0x6a({ tipo: '', texto: '' });

        try {
            const dataPayload = {
                fornecedor: _0x9c.trim().toUpperCase(),
                valor: parseFloat(_0x2e) || 0,
                prazo_entrega: _0x4b.trim().toUpperCase(),
                status: _0x6d,
                referencia_1: _0x8f.trim().toUpperCase(),
                referencia_2: _0x1b.trim() ? _0x1b.trim().toUpperCase() : null,
                referencia_3: _0x3d.trim() ? _0x3d.trim().toUpperCase() : null,
            };

            const { error } = await client
                .from(_0xdb[0])
                .update(dataPayload)
                .eq('id', _0x3c.id);

            if (error) throw error;

            _0x6a({
                tipo: _0xdb[6],
                texto: 'Cotação e status atualizados com sucesso na base central.'
            });

            // Se mudou de estágio, limpa da fila local de análise
            if (_0x6d === _0xdb[3] || _0x6d === _0xdb[4] || _0x6d === _0xdb[5]) {
                _0x2b(prev => prev.filter(s => s.id !== _0x3c.id));
                _0x4d(null);
            } else {
                _0x2b(prev => prev.map(s => s.id === _0x3c.id ? { ...s, ...dataPayload } : s));
            }

        } catch (err: any) {
            console.error(err);
            _0x6a({ tipo: _0xdb[7], texto: err?.message || 'Erro ao processar auditoria da cotação.' });
        } finally {
            _0x8b(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">
            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6">

                <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard/estoque/compras" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Hub de Compras
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Análise de Mercado &amp; Cotação
                        </h1>
                        <p className="text-[10px] text-[#86868b] font-medium uppercase tracking-wide">
                            Etapa 02 • Saneamento de Preços, Fornecedores e Despacho de Entrada
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">

                    <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] lg:col-span-1 h-[600px] flex flex-col">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868b] border-b border-[#f5f5f7] pb-3 mb-4 select-none">
                            ⏳ Demandas Aguardando Cotação
                        </h2>

                        {_0x5e ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                                <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Varrendo Fila...</span>
                            </div>
                        ) : _0x1a.length === 0 ? (
                            <div className="text-center py-20 text-xs font-semibold text-[#86868b] uppercase tracking-wide">
                                Fila zerada! Nenhuma solicitação pendente.
                            </div>
                        ) : (
                            <div className="overflow-y-auto flex-1 pr-1 space-y-2 select-none">
                                {_0x1a.map((item) => {
                                    const isCurrent = _0x3c?.id === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => _0x20a(item)}
                                            className={`w-full p-4 rounded-xl border text-left transition-colors flex flex-col gap-2 relative overflow-hidden ${
                                                isCurrent
                                                    ? 'bg-[#f5f5f7] border-[#b4b4b9] text-[#1d1d1f]'
                                                    : 'bg-white border-[#e5e5ea] hover:bg-[#f5f5f7]/50 text-[#1d1d1f]'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-2 w-full">
                                                <h4 className="text-xs font-bold uppercase tracking-tight truncate flex-1">
                                                    {item.nome_peca}
                                                </h4>
                                                <span className="text-[10px] font-mono font-bold bg-[#f5f5f7] px-1.5 py-0.5 rounded text-[#86868b] shrink-0 border border-[#e5e5ea]">
                                                    {item.quantidade}x
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center w-full text-[9px] font-mono uppercase font-semibold text-[#86868b]">
                                                <span className="truncate max-w-[120px]">REF: {item.referencia_1}</span>
                                                <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${
                                                    item.status === _0xdb[2]
                                                        ? 'bg-[#ff9500]/5 border-[#ff9500]/10 text-[#ff9500]'
                                                        : 'bg-[#ff3b30]/5 border-[#ff3b30]/10 text-[#ff3b30]'
                                                }`}>
                                                    {item.status === _0xdb[2] ? 'EM ANÁLISE' : 'PENDENTE'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] lg:col-span-2 min-h-[600px] flex flex-col">
                        {!_0x3c ? (
                            <div className="flex flex-col justify-center items-center flex-1 text-center py-20 text-[10px] uppercase font-bold text-[#86868b] tracking-wider select-none">
                                ⚖️ Selecione uma solicitação na fila lateral para aplicar a cotação.
                            </div>
                        ) : (
                            <form onSubmit={_0x30b} className="space-y-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="border-b border-[#e5e5ea] pb-3">
                                        <span className="text-[9px] font-mono font-bold text-[#86868b] uppercase tracking-wider">Tratando Item ID: #{_0x3c.id}</span>
                                        <h3 className="text-base font-bold uppercase tracking-tight text-[#1d1d1f] mt-0.5">
                                            {_0x3c.nome_peca} <span className="text-[#ff9500]">({_0x3c.quantidade} UNIDADES)</span>
                                        </h3>
                                    </div>

                                    {_0x5f.texto && (
                                        <div className={`p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                                            _0x5f.tipo === _0xdb[6]
                                                ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                                                : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                                        }`}>
                                            {_0x5f.texto}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Fornecedor Ganhador *</label>
                                            <input
                                                type="text"
                                                placeholder="EX: MERCADO DO MOTOR DISTRIBUIDORA"
                                                value={_0x9c}
                                                onChange={e => _0x1f(e.target.value)}
                                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase placeholder-[#b4b4b9] transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1 sm:col-span-1">
                                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Valor Unitário (R$) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={_0x2e}
                                                onChange={e => _0x3a(e.target.value)}
                                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] transition-colors text-center"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Prazo de Entrega Estimado *</label>
                                            <input
                                                type="text"
                                                placeholder="EX: 4 DIAS ÚTEIS / ENTREGA IMEDIATA"
                                                value={_0x4b}
                                                onChange={e => _0x5c(e.target.value)}
                                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase placeholder-[#b4b4b9] transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Alterar Status Operacional *</label>
                                            <div className="relative">
                                                <select
                                                    value={_0x6d}
                                                    onChange={e => _0x7e(e.target.value as any)}
                                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase cursor-pointer appearance-none transition-colors"
                                                    required
                                                >
                                                    <option value="PENDENTE">⏳ PENDENTE (AGUARDANDO RETORNO)</option>
                                                    <option value="EM_ANALISE">⚖️ EM ANÁLISE (ORÇAMENTO ABERTO)</option>
                                                    <option value="COMPRADO">💳 COMPRADO (COMPROVANTE EMITIDO)</option>
                                                    <option value="EM_TRANSITO">🚚 EM TRÂNSITO (NFE LANÇADA)</option>
                                                    <option value="CONCLUIDO">📦 ENTREGUE (NO ESTOQUE/CONCLUÍDO)</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-[#e5e5ea] pt-4 mt-2">
                                        <span className="block text-[8px] font-mono font-bold text-[#86868b] uppercase tracking-wider mb-3">Refinamento de Códigos (Opcional)</span>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 1</label>
                                                <input type="text" value={_0x8f} onChange={e => _0x9a(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold uppercase transition-colors" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 2</label>
                                                <input type="text" value={_0x1b} onChange={e => _0x2c(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold uppercase transition-colors" placeholder="N/A" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Referência 3</label>
                                                <input type="text" value={_0x3d} onChange={e => _0x4e(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold uppercase transition-colors" placeholder="N/A" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={_0x7a}
                                        className="w-full bg-[#1d1d1f] active:bg-black text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                                    >
                                        {_0x7a ? "Consolidando Cotação..." : "Salvar e Atualizar Fluxo"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Logística Corporativa</div>
                <div className="font-mono text-[#b4b4b9]">Procurement Pricing Analysis v2.0</div>
            </footer>
        </main>
    );
}