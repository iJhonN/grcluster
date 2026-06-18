"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function CadastroFuncionarioPage() {
    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [cargo, setCargo] = useState('Mecânico');

    const [enviando, setEnviando] = useState(false);
    const [gerandoId, setGerandoId] = useState(true);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Nome em português correto: gerarIdUnico
    async function gerarIdUnico() {
        setGerandoId(true);
        let idGerado = '';
        let idDisponivel = false;

        try {
            while (!idDisponivel) {
                const num = Math.floor(10000 + Math.random() * 90000);
                idGerado = String(num);

                const { data } = await supabase
                    .from('funcionarios')
                    .select('id')
                    .eq('id', idGerado)
                    .maybeSingle();

                if (!data) {
                    idDisponivel = true;
                }
            }
            setId(idGerado);
        } catch (err) {
            console.error("Erro ao gerar ID único:", err);
            setStatusFeed({ tipo: 'erro', texto: 'Falha ao gerar ID óptico automático.' });
        } finally {
            setGerandoId(false);
        }
    }

    // Chamada corrigida com 'c'
    useEffect(() => {
        gerarIdUnico();
    }, []);

    const handleCadastrar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !nome.trim() || !sobrenome.trim()) {
            setStatusFeed({ tipo: 'erro', texto: 'Preencha todos os campos corretamente.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const { error } = await supabase
                .from('funcionarios')
                .insert([{
                    id: id,
                    nome: nome.trim(),
                    sobrenome: sobrenome.trim(),
                    cargo: cargo
                }]);

            if (error) {
                if (error.code === '23505') {
                    throw new Error("Conflito de ID. Tente novamente.");
                }
                throw error;
            }

            setStatusFeed({ tipo: 'sucesso', texto: 'Colaborador cadastrado com sucesso!' });
            setTimeout(() => {
                router.push('/dashboard/funcionarios');
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Falha ao salvar no banco.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-black/5">

            {/* CARD DE CADASTRO CLEAN */}
            <div className="w-full max-w-sm bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_5px_rgba(0,0,0,0.02)] relative overflow-hidden">

                <Link
                    href="/dashboard/funcionarios"
                    className="absolute top-5 left-5 text-[9px] font-bold uppercase text-[#86868b] tracking-wider hover:text-[#1d1d1f] transition-colors z-20"
                >
                    ← Voltar
                </Link>

                <div className="p-6 sm:p-8 pt-12">

                    {/* HEAD */}
                    <div className="text-center mb-6 space-y-1">
                        <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#ff9500] bg-[#ff9500]/5 px-2.5 py-0.5 rounded border border-[#ff9500]/10 select-none">
                            Terminal de Admissão
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f] pt-1">
                            Novo Colaborador
                        </h1>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase">
                            Registro de Matrícula NTI
                        </p>
                    </div>

                    {/* STATUS BANNER */}
                    {statusFeed.texto && (
                        <div className={`mb-5 p-3 rounded-xl text-center text-[11px] font-bold border transition-all ${
                            statusFeed.tipo === 'sucesso'
                                ? 'bg-[#34c759]/5 border-[#34c759]/20 text-[#248a3d]'
                                : 'bg-[#ff3b30]/5 border-[#ff3b30]/20 text-[#ff3b30]'
                        }`}>
                            {statusFeed.texto}
                        </div>
                    )}

                    <form onSubmit={handleCadastrar} className="space-y-4">

                        {/* ID Gerado Automaticamente */}
                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                                ID Óptico Reservado (Automático)
                            </label>
                            <div className="w-full bg-[#f5f5f7] border border-[#e5e5ea] p-3 rounded-lg text-[#ff9500] text-xs font-mono font-bold tracking-widest text-center min-h-[38px] flex items-center justify-center select-none">
                                {gerandoId ? (
                                    <span className="text-[9px] font-sans font-bold text-[#86868b] uppercase tracking-wide animate-pulse">Consultando banco...</span>
                                ) : (
                                    id
                                )}
                            </div>
                        </div>

                        {/* Nome & Sobrenome */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    placeholder="NOME"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase tracking-wide transition-colors placeholder-[#b4b4b9] disabled:opacity-40"
                                    required
                                    disabled={enviando || gerandoId}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                                    Sobrenome
                                </label>
                                <input
                                    type="text"
                                    placeholder="SOBRENOME"
                                    value={sobrenome}
                                    onChange={e => setSobrenome(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase tracking-wide transition-colors placeholder-[#b4b4b9] disabled:opacity-40"
                                    required
                                    disabled={enviando || gerandoId}
                                />
                            </div>
                        </div>

                        {/* Lista de Cargos */}
                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                                Cargo / Atribuição
                            </label>
                            <div className="relative">
                                <select
                                    value={cargo}
                                    onChange={e => setCargo(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer appearance-none disabled:opacity-40"
                                    disabled={enviando || gerandoId}
                                >
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Ajudante">Ajudante</option>
                                    <option value="Balconista">Balconista</option>
                                    <option value="Comprador">Comprador</option>
                                    <option value="Estoque">Estoque</option>
                                    <option value="Gerente">Gerente</option>
                                    <option value="Lojista">Lojista</option>
                                    <option value="Mecânico">Mecânico</option>
                                    <option value="Motoboy">Motoboy</option>
                                    <option value="Pedreiro">Pedreiro</option>
                                    <option value="Técnico de OS">Técnico de OS</option>
                                    <option value="TI">TI</option>
                                    <option value="Vendedor">Vendedor</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Botão de Envio */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={enviando || gerandoId}
                                className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {enviando ? "Gravando no Banco..." : "Confirmar Cadastro"}
                            </button>
                        </div>

                    </form>
                </div>

                <div className="border-t border-[#e5e5ea] py-3 text-center bg-[#f5f5f7] select-none">
                    <p className="text-[8px] uppercase tracking-wider text-[#b4b4b9] font-bold">
                        GR SYSTEM · CONTROL
                    </p>
                </div>
            </div>
        </main>
    );
}