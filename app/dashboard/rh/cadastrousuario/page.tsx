"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function CadastroUsuarioPainelPage() {
    const router = useRouter();

    // Controle da Aba Selecionada ('sistema' ou 'pontofuncionario')
    const [abaAtiva, setAbaAtiva] = useState<'sistema' | 'pontofuncionario'>('sistema');

    // Estados Globais / Aba Sistema
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [contato, setContato] = useState('');
    const [cargo, setCargo] = useState('');

    // Estados Específicos da Aba de Consulta do Funcionário
    const [funcionarioId, setFuncionarioId] = useState('');
    const [nomeFuncionario, setNomeFuncionario] = useState('');
    const [senhaFuncionario, setSenhaFuncionario] = useState('');

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

    // SUBMIT 1: Cadastro de Usuário Administrativo do Painel
    const handleCriarUsuarioSistema = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            if (senha.length < 6) throw new Error("A senha de acesso precisa ter no mínimo 6 caracteres.");
            if (contato.length < 14) throw new Error("Formato de contato inválido. Certifique-se de inserir o DDD.");
            if (!cargo) throw new Error("Por favor, selecione um cargo para definir o nível de acesso.");

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password: senha,
                options: { emailRedirectTo: undefined }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Falha ao gerar UID de segurança no Auth.");

            const payload = {
                id: authData.user.id,
                nome: nome.trim().toUpperCase(),
                email: email.trim().toLowerCase(),
                senha: senha,
                contato: contato.trim(),
                cargo: cargo
            };

            const { error: dbError } = await supabase.from('usuarios_painel').insert([payload]);
            if (dbError) throw dbError;

            setStatusFeed({
                tipo: 'sucesso',
                texto: `Credenciais criadas! Operador ${payload.nome} registrado sob o cargo [${payload.cargo}].`
            });

            setNome(''); setEmail(''); setSenha(''); setContato(''); setCargo('');
            setTimeout(() => router.push('/dashboard/rh'), 1500);
        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Falha ao injetar credenciais.' });
        } finally {
            setEnviando(false);
        }
    };

    // SUBMIT 2: Cadastro Protegido de Acesso de Consulta para os Funcionários
    const handleCriarUsuarioPonto = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            if (!funcionarioId.trim()) throw new Error("O ID do crachá do funcionário é obrigatório.");
            if (senhaFuncionario.length < 4) throw new Error("A senha de consulta precisa ter no mínimo 4 dígitos.");

            const payloadPonto = {
                funcionario_id: funcionarioId.trim().toUpperCase(),
                nome: nomeFuncionario.trim().toUpperCase(),
                senha: senhaFuncionario
            };

            const { error: dbError } = await supabase
                .from('usuarios_ponto')
                .insert([payloadPonto]);

            if (dbError) {
                if (dbError.code === '23505') throw new Error("Esse ID de funcionário já possui uma conta de consulta cadastrada.");
                if (dbError.code === '23503') throw new Error("ID de crachá inválido. Este funcionário precisa existir primeiro na listagem principal.");
                throw dbError;
            }

            setStatusFeed({
                tipo: 'sucesso',
                texto: `Acesso liberado! Conta de consulta criada com sucesso para ${payloadPonto.nome} (ID: ${payloadPonto.funcionario_id}).`
            });

            setFuncionarioId('');
            setNomeFuncionario('');
            setSenhaFuncionario('');
            setTimeout(() => router.push('/dashboard/rh'), 1500);
        } catch (err: any) {
            console.error(err);
            setStatusFeed({ tipo: 'erro', texto: err.message || 'Falha ao salvar acesso do colaborador.' });
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

                    {/* SELETOR DE ABAS APPLE STYLE */}
                    <div className="flex bg-[#f5f5f7] p-1 rounded-xl mb-6 select-none border border-[#e5e5ea]">
                        <button
                            type="button"
                            onClick={() => { setAbaAtiva('sistema'); setStatusFeed({ tipo: '', texto: '' }); }}
                            className={`flex-1 text-center py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                abaAtiva === 'sistema'
                                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                            }`}
                        >
                            💼 Acesso ao Sistema
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAbaAtiva('pontofuncionario'); setStatusFeed({ tipo: '', texto: '' }); }}
                            className={`flex-1 text-center py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                abaAtiva === 'pontofuncionario'
                                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                            }`}
                        >
                            ⏱️ Consulta de Ponto (Funcionário)
                        </button>
                    </div>

                    {/* CABEÇALHO INTERNO */}
                    <div className="mb-6 border-b border-[#f5f5f7] pb-4 select-none">
                        <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[#007aff] bg-[#007aff]/5 px-2 py-0.5 rounded mb-1.5">
                            {abaAtiva === 'sistema' ? 'Segurança & RBAC' : 'Portal do Colaborador'}
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-[#1d1d1f]">
                            {abaAtiva === 'sistema' ? 'Provisionar Nova Credencial' : 'Liberar Consulta Individual'}
                        </h1>
                        <p className="text-[9px] font-mono font-bold text-[#86868b] tracking-wider uppercase mt-0.5">
                            {abaAtiva === 'sistema' ? 'Emissão de acessos com atribuição estrita de cargos' : 'Vínculo direto por ID de crachá patrimonial'}
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

                    {/* FORMULÁRIO 1: ACESSO ADMINISTRATIVO AO SISTEMA */}
                    {abaAtiva === 'sistema' && (
                        <form onSubmit={handleCriarUsuarioSistema} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Nome Completo do Funcionário</label>
                                <input
                                    type="text"
                                    placeholder="EX: JOSÉ SILVA"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase placeholder-[#b4b4b9]"
                                    required
                                    disabled={enviando}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">E-mail Corporativo (Login)</label>
                                    <input
                                        type="email"
                                        placeholder="operador@grcorporativo.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9]"
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
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold tracking-wide placeholder-[#b4b4b9] text-center"
                                        required
                                        disabled={enviando}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Senha Provisória de Acesso</label>
                                    <input
                                        type="password"
                                        placeholder="Mínimo 6 dígitos..."
                                        value={senha}
                                        onChange={e => setSenha(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9]"
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
                                            className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] pl-3 pr-8 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase cursor-pointer appearance-none"
                                            required
                                            disabled={enviando}
                                        >
                                            <option value="">-- Escolha o Escopo --</option>
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
                    )}

                    {/* FORMULÁRIO 2: ACESSO DE CONSULTA DE FOLHA DO TRABALHADOR */}
                    {abaAtiva === 'pontofuncionario' && (
                        <form onSubmit={handleCriarUsuarioPonto} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1 sm:col-span-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">ID Interno (Crachá)</label>
                                    <input
                                        type="text"
                                        placeholder="EX: 1024"
                                        value={funcionarioId}
                                        onChange={e => setFuncionarioId(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#ff9500] text-xs font-mono font-black placeholder-[#b4b4b9] text-center"
                                        required
                                        disabled={enviando}
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Nome de Identificação</label>
                                    <input
                                        type="text"
                                        placeholder="EX: CLAUDIO SILVA"
                                        value={nomeFuncionario}
                                        onChange={e => setNomeFuncionario(e.target.value)}
                                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-bold uppercase placeholder-[#b4b4b9]"
                                        required
                                        disabled={enviando}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">Senha Exclusiva de Acesso do Trabalhador</label>
                                <input
                                    type="password"
                                    placeholder="Defina a senha de pátio..."
                                    value={senhaFuncionario}
                                    onChange={e => setSenhaFuncionario(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2.5 rounded-lg outline-none text-[#1d1d1f] text-xs font-mono font-bold placeholder-[#b4b4b9]"
                                    required
                                    disabled={enviando}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 shadow-sm"
                                >
                                    {enviando ? "Gravando Cadastro..." : "Liberar Acesso ao Espelho de Ponto"}
                                </button>
                            </div>
                        </form>
                    )}

                </div>

            </div>

            {/* RODAPÉ */}
            <footer className="w-full max-w-2xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo RBAC Core Security v3.1</div>
            </footer>
        </main>
    );
}