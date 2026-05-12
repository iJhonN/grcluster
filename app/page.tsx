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

    // Puxando as informações direto das Environment Variables que você configurou
    // Nota: Elas precisam estar como NEXT_PUBLIC_ no seu painel da Vercel para o código ler aqui
    const adminUser = process.env.NEXT_PUBLIC_ADMIN_USER;
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

    if (user === adminUser && pass === adminPass) {
      router.push('/dashboard');
    } else {
      setErro(true);
    }
  };

  return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 border border-white/5 p-10 rounded-[40px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black uppercase italic text-orange-500">GR Ponto</h1>
            {erro && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">Acesso negado!</p>}
          </div>

          <div className="space-y-4">
            <input
                type="text"
                placeholder="Usuário"
                className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 text-white"
                onChange={e => setUser(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Senha"
                className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 text-white"
                onChange={e => setPass(e.target.value)}
                required
            />
            <button className="w-full bg-orange-600 py-4 rounded-2xl font-black uppercase tracking-widest text-white hover:bg-orange-500 transition-all">
              Entrar
            </button>
          </div>
        </form>
      </main>
  );
}