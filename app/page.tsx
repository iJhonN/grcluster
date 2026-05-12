"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [erro, setErro] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // O segredo está no prefixo NEXT_PUBLIC_ para o navegador conseguir ler
    const validUser = process.env.NEXT_PUBLIC_ADMIN_USER;
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

    if (user === validUser && pass === validPass) {
      router.push('/dashboard');
    } else {
      setErro(true);
    }
  };

  return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 border border-white/5 p-10 rounded-[40px] shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black uppercase italic text-orange-500 tracking-tighter">GR Pontos</h1>
            <p className="text-[8px] text-slate-500 uppercase tracking-[4px] mt-1 font-bold">Acesso Administrativo</p>

            {erro && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 py-2 rounded-xl text-red-500 text-[10px] font-black uppercase italic">
                  Usuário ou Senha Incorretos
                </div>
            )}
          </div>

          <div className="space-y-4">
            <input
                type="text"
                placeholder="Usuário"
                className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 text-white transition-all"
                onChange={e => setUser(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Senha"
                className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 text-white transition-all"
                onChange={e => setPass(e.target.value)}
                required
            />
            <button className="w-full bg-orange-600 py-4 rounded-2xl font-black uppercase tracking-widest text-white hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-orange-900/20">
              Entrar
            </button>
          </div>
        </form>
      </main>
  );
}