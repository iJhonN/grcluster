"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function CadastroUsuarioPainelPage() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [contato, setContato] = useState('');
    const [cargo, setCargo] = useState('');

    const [enviando, setEnviando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const cargosDisponiveis = [
        { id: "ADMIN", label: "ADMINISTRADOR (ACESSO TOTAL)" },
        { id: "GERENTE", label: "GERENTE OPERACIONAL" },
        { id: "TECNICO", label: "TÉCNICO DE PÁTIO / ALMOXARIFADO" },
        { id: "MECANICO", label: "MECÂNICO / OPERADOR DE PISTA" },
        { id: "GESTORDEFROTAS", label: "GESTOR DE FROTAS & LOGÍSTICA" },
        { id: "ESTOQUE", label: "AUXILIAR DE ESTOQUE / CONFERENTE" }
    ];

    const handleContatoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d)/, "($1) $2");
        }
        setContato(value);
    };

    const handleCriarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            if (senha.length < 6) {
                throw new Error("A senha de acesso precisa ter no mínimo 6 caracteres.");
            }
            if (contato.length < 14) {
                throw new Error("Formato de contato inválido. Certifique-se de inserir o DDD.");
            }
            if (!cargo) {
                throw new Error("Por favor, selecione um cargo para definir o nível de acesso do usuário.");
            }

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password: senha,
                options: {
                    emailRedirectTo: undefined
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Falha ao gerar UID de segurança no Auth do servidor.");

            const payload = {
                id: authData.user.id,
                nome: nome.trim().toUpperCase(),
                email: email.trim().toLowerCase(),
                senha: senha,
                contato: contato.trim(),
                cargo: cargo
            };

            const { error: dbError } = await supabase
                .from('usuarios_painel')
                .insert([payload]);

            if (dbError) throw dbError;

            setStatusFeed({
                tipo: 'sucesso',
                texto: `Credenciais criadas! Operador ${payload.nome} registrado sob o cargo [${payload.cargo}].`
            });

            setNome('');
            setEmail('');
            setSenha('');
            setContato('');
            setCargo('');

            setTimeout(() => {
                router.push('/dashboard/rh');
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setStatusFeed({
                tipo: 'erro',
                texto: err.message || 'Falha ao injetar credenciais no servidor.'
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-[#007aff]/10 flex flex-col justify-between w-full">

            <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center items-center">

                {/* BOTÃO DE VOLTAR */}
                <div className="w-full mb-3 text-left pl-1">
                    <Link href="/dashboard/rh" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#007aff] transition-colors">
                        ← Dashboard de RH
                    </Link>
                </div>

                {/* CONTAINER DO FORMULÁRIO */}
                <div className="w-full bg-white border border-[#e5e5ea] rounded-2xl p-6 sm:p-8 shadow-[0_1px_5px_rgba(0,0,0,0.02)] relative overflow-hidden">

                    {/* CABEÇALHO INTERNO */}
                    <div className="mb-6 border-b border-[#f5f5f7] pb-4">
                        <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#007aff] bg-[#007aff]/5 px-2 py-0.5 rounded select-none mb-1.5">
                            Segurança &amp; RBAC
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f]">
                            Provisionar Nova Credencial
                        </h1>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase mt-0.5">
                            Emissão de acessos com atribuição estrita de cargos
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

                    <form onSubmit={handleCriarUsuario} className="space-y-4">

                        {/* NOME COMPLETO */}
                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Nome Completo do Funcionário</label>
                            <input
                                type="text"
                                placeholder="EX: JOSÉ SILVA"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase placeholder-[#b4b4b9] transition-colors"
                                required
                                disabled={enviando}
                            />
                        </div>

                        {/* ROW 1: E-MAIL E CONTATO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">E-mail Corporativo (Login)</label>
                                <input
                                    type="email"
                                    placeholder="operador@grcorporativo.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] transition-colors"
                                    required
                                    disabled={enviando}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Linha Telefônica / WhatsApp</label>
                                <input
                                    type="text"
                                    placeholder="(00) 00000-0000"
                                    value={contato}
                                    onChange={handleContatoChange}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold tracking-wide placeholder-[#b4b4b9] transition-colors text-center"
                                    required
                                    disabled={enviando}
                                />
                            </div>
                        </div>

                        {/* ROW 2: SENHA E CARGO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Senha Provisória de Acesso</label>
                                <input
                                    type="password"
                                    placeholder="Mínimo 6 dígitos..."
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9] transition-colors"
                                    required
                                    disabled={enviando}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Nível de Atribuição (Cargo)</label>
                                <div className="relative">
                                    <select
                                        value={cargo}
                                        onChange={e => setCargo(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase cursor-pointer appearance-none transition-colors"
                                        required
                                        disabled={enviando}
                                    >
                                        <option value="" className="text-[#b4b4b9]">-- Escolha o Escopo --</option>
                                        {cargosDisponiveis.map((c, idx) => (
                                            <option key={idx} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={enviando}
                                className="w-full bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {enviando ? "Gravando Autenticação..." : "Consolidar e Ativar Conta"}
                            </button>
                        </div>
                    </form>
                </div>

            </div>

            {/* RODAPÉ */}
            <footer className="w-full max-w-2xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo RBAC Core Security v3.0</div>
            </footer>
        </main>
    );
}