"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function CadastroFerramentaPage() {
    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [status, setStatus] = useState('disponivel');
    const [enviando, setEnviando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const idInputRef = useRef<HTMLInputElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();

        const codigoLimpo = id.trim();
        const nomeLimpo = nome.trim().toUpperCase();

        if (!codigoLimpo || !nomeLimpo) {
            setStatusFeed({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const { data: existe, error: errCheck } = await supabase
                .from('ferramentas')
                .select('id')
                .eq('id', codigoLimpo)
                .maybeSingle();

            if (existe) {
                throw new Error(`O código [${codigoLimpo}] já está sendo utilizado por outra ferramenta.`);
            }

            const { error: errInsert } = await supabase
                .from('ferramentas')
                .insert([{
                    id: codigoLimpo,
                    nome: nomeLimpo,
                    status: status
                }]);

            if (errInsert) throw errInsert;

            setStatusFeed({
                tipo: 'sucesso',
                texto: `${nomeLimpo} (CÓD: ${codigoLimpo}) cadastrada com sucesso no inventário.`
            });

            setId('');
            setNome('');
            setStatus('disponivel');

            idInputRef.current?.focus();

        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Falha ao registrar ferramenta.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 font-sans antialiased flex flex-col justify-between w-full selection:bg-black/5">

            <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center items-center">

                {/* BOTÃO DE VOLTAR */}
                <div className="w-full mb-3 text-left pl-1">
                    <Link href="/dashboard/ferramentas" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                        ← Menu de Ferramentas
                    </Link>
                </div>

                {/* CARD DE CADASTRO CLEAN */}
                <div className="w-full bg-white border border-[#e5e5ea] rounded-2xl p-6 sm:p-8 shadow-[0_1px_5px_rgba(0,0,0,0.02)] relative overflow-hidden">

                    {/* HEADER INTERNO */}
                    <div className="text-center mb-6 space-y-1">
                        <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#ff9500] bg-[#ff9500]/5 px-2.5 py-0.5 rounded border border-[#ff9500]/10 select-none">
                            Almoxarifado Estático
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f] pt-1">
                            Inclusão de Novos Ativos
                        </h1>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase">
                            GR Autopeças &amp; Serviços
                        </p>
                    </div>

                    {statusFeed.texto && (
                        <div className={`mb-5 p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                            statusFeed.tipo === 'sucesso'
                                ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                                : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                        }`}>
                            {statusFeed.texto}
                        </div>
                    )}

                    <form onSubmit={handleCadastro} className="space-y-4">

                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                                Código Identificador (Código de Barras / 4 Dígitos)
                            </label>
                            <input
                                ref={idInputRef}
                                type="text"
                                placeholder="EX: 8063"
                                value={id}
                                onChange={e => setId(e.target.value)}
                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#ff9500] text-xs font-mono font-bold tracking-wider placeholder-[#b4b4b9] uppercase transition-colors text-center"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                                Descrição / Nome da Ferramenta
                            </label>
                            <input
                                type="text"
                                placeholder="EX: TORQUÍMETRO DE ESTALO 1/2"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase tracking-wide placeholder-[#b4b4b9] transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                                Status Operacional Inicial
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase tracking-wider cursor-pointer appearance-none transition-colors"
                                    required
                                >
                                    <option value="disponivel">● Em Bancada (Disponível)</option>
                                    <option value="ocupado">⚙️ Em Uso (Ocupado)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={enviando}
                                className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {enviando ? "Salvando Ativo..." : "Cadastrar Ferramenta"}
                            </button>
                        </div>
                    </form>
                </div>

            </div>

            {/* LOWER STATS BAR */}
            <footer className="w-full max-w-sm mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo de Inventário Estático v3.2</div>
            </footer>
        </main>
    );
}