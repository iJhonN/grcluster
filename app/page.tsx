"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [loginSucesso, setLoginSucesso] = useState(false); // Estado anti-flashbang

  // Estado para controlar a tela de apresentação da logo inicial
  const [introCarregando, setIntroCarregando] = useState(true);
  const [esconderIntro, setEsconderIntro] = useState(false);

  const router = useRouter();

  const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Efeito para segurar a splash screen da logo
  useEffect(() => {
    const timerEsmaecer = setTimeout(() => {
      setEsconderIntro(true); // Inicia a animação de fade-out
    }, 1800);

    const timerRemover = setTimeout(() => {
      setIntroCarregando(false); // Destrói o componente da DOM para liberar memória
    }, 2300);

    return () => {
      clearTimeout(timerEsmaecer);
      clearTimeout(timerRemover);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro('');
    setCarregando(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setMensagemErro(
            authError.message.includes('Invalid login credentials')
                ? 'E-mail ou senha incorretos.'
                : authError.message
        );
        setCarregando(false);
      } else {
        // Dispara a transição suave anti-flashbang antes de redirecionar
        setLoginSucesso(true);

        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 600); // Janela perfeita para a transição do CSS terminar
      }
    } catch (err) {
      console.error(err);
      setMensagemErro('Erro ao conectar com o servidor.');
      setCarregando(false);
    }
  };

  return (
      <main
          className={`relative min-h-screen flex items-center justify-center p-6 font-sans overflow-hidden antialiased w-full transition-all duration-700 ease-out ${
              loginSucesso ? 'bg-[#f5f5f7]' : 'bg-[#030303]'
          }`}
      >

        {/* ── SPALSH SCREEN / TELA DE INTRO CARREGANDO ── */}
        {introCarregando && (
            <div
                className={`absolute inset-0 bg-[#030303] z-50 flex flex-col justify-between items-center p-10 select-none transition-opacity duration-500 ease-in-out ${
                    esconderIntro ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            >
              <div className="w-10 h-10 opacity-0" />

              {/* ELEMENTO CENTRAL: LOGO NOVA */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 animate-pulse">
                  <div className="absolute inset-4 bg-orange-500/20 rounded-full blur-3xl scale-110" />
                  <img
                      src="/grlogo720.png"
                      alt="GR Logo"
                      className="w-full h-full object-contain relative z-10"
                  />
                </div>
                {/* Barra de progresso tecnológica discreta */}
                <div className="w-24 h-[1px] bg-white/[0.04] relative overflow-hidden rounded-full">
                  <div className="absolute inset-y-0 bg-gradient-to-r from-orange-500 to-amber-400 w-1/2 rounded-full animate-[loading_1.5s_infinite_ease-in-out]" style={{
                    animationName: 'loading'
                  }} />
                  <style jsx global>{`
                    @keyframes loading {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(200%); }
                    }
                  `}</style>
                </div>
              </div>

              {/* FOOTER DA SPLASH: CREDITOS ASSINADOS */}
              <div className="text-center space-y-1">
                <p className="text-[9px] text-slate-600 uppercase font-bold tracking-[4px]">
                  GR Cluster Core Operating System
                </p>
                <p className="text-[10px] text-orange-500/80 uppercase font-black tracking-[5px] italic">
                  Desenvolvido por Jhon
                </p>
              </div>
            </div>
        )}

        {/* ── FUNDO TECNOLÓGICO DO LOGIN ── */}
        <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${loginSucesso ? 'opacity-0' : 'opacity-100'}`}>
          <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: `linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
          />
          <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(234,88,12,0.07), transparent)' }}
          />
          <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-orange-600/[0.06] rounded-full blur-[140px]" />
          <div className="absolute -bottom-60 -right-60 w-[400px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[120px]" />
        </div>

        {/* ── CARD DE LOGIN PRINCIPAL ── */}
        <div className={`relative w-full max-w-sm z-10 transition-all duration-500 transform ${loginSucesso ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="absolute -inset-px rounded-[44px] bg-gradient-to-b from-orange-500/10 to-transparent blur-sm" />

          <div className="relative w-full bg-[#09090b]/90 border border-white/[0.06] rounded-[40px] shadow-2xl backdrop-blur-2xl overflow-hidden">
            <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

            <div className="p-10">

              {/* LOGO INTERNA DO CARD */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative mb-4 w-16 h-16">
                  <img
                      src="/grlogo720.png"
                      alt="GR Logo"
                      className="w-full h-full object-contain"
                  />
                </div>

                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none mb-1.5">
                  GR{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                    Cluster
                  </span>
                </h1>
                <p className="text-[9px] text-slate-600 uppercase tracking-[5px] font-bold">
                  Acesso Restrito
                </p>
              </div>

              {/* MENSAGEM DE ERRO */}
              {mensagemErro && (
                  <div className="mb-6 flex items-start gap-2.5 bg-red-500/[0.06] border border-red-500/20 p-3.5 rounded-2xl">
                    <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3M8 11v.5" strokeLinecap="round" />
                    </svg>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide leading-relaxed">
                      {mensagemErro}
                    </p>
                  </div>
              )}

              {/* FORMULÁRIO */}
              <form onSubmit={handleLogin} className="space-y-4">

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase tracking-[3px] text-slate-500 ml-1">
                    E-mail Corporativo
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-500/70 transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="4" width="12" height="9" rx="2" />
                        <path d="M2 6l6 4 6-4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <input
                        type="email"
                        placeholder="nome@empresa.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] focus:border-orange-500/40 focus:bg-black/60 pl-10 pr-4 py-3.5 rounded-2xl outline-none text-white text-sm font-medium transition-all placeholder-slate-700 disabled:opacity-40"
                        required
                        disabled={carregando}
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase tracking-[3px] text-slate-500 ml-1">
                    Chave de Acesso
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-500/70 transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="7" width="10" height="7" rx="2" />
                        <path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <input
                        type={mostrarSenha ? 'text' : 'password'}
                        placeholder="••••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] focus:border-orange-500/40 focus:bg-black/60 pl-10 pr-11 py-3.5 rounded-2xl outline-none text-white text-sm transition-all placeholder-slate-700 disabled:opacity-40"
                        required
                        disabled={carregando}
                    />
                    <button
                        type="button"
                        onClick={() => setMostrarSenha(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                        tabIndex={-1}
                    >
                      {mostrarSenha ? (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
                            <circle cx="8" cy="8" r="1.5" />
                            <path d="M3 3l10 10" strokeLinecap="round" />
                          </svg>
                      ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
                            <circle cx="8" cy="8" r="1.5" />
                          </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Botão de Disparo */}
                <div className="pt-2">
                  <button
                      type="submit"
                      disabled={carregando}
                      className="relative w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[3px] text-black transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden group"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center gap-2">
                      {carregando ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                            Verificando...
                          </>
                      ) : (
                          <>
                            Entrar no Cluster
                            <svg className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 5h6M5 2l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </>
                      )}
                    </div>
                  </button>
                </div>

              </form>

            </div>

            {/* RODAPÉ DO CARD */}
            <div className="border-t border-white/[0.04] px-10 py-4 flex items-center justify-center">
              <p className="text-[8px] uppercase tracking-[3px] text-slate-700 font-bold">
                Sistema Interno · Acesso Restrito
              </p>
            </div>

          </div>
        </div>
      </main>
  );
}