import Link from 'next/link';

export default function FuncionarioHub() {
    return (
        <main className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <Link href="/dashboard/funcionario/lista" className="bg-slate-900 p-10 rounded-[40px] text-center border border-white/5 hover:border-orange-500 transition-all">
                    <span className="text-4xl block mb-4">📋</span>
                    <h2 className="font-black uppercase italic">Ver Lista de Equipe</h2>
                </Link>
                <Link href="/dashboard/funcionario/crachas" className="bg-slate-900 p-10 rounded-[40px] text-center border border-white/5 hover:border-orange-500 transition-all">
                    <span className="text-4xl block mb-4">🖨️</span>
                    <h2 className="font-black uppercase italic">Imprimir Crachás</h2>
                </Link>
            </div>
            <Link href="/dashboard" className="mt-10 text-[10px] font-black uppercase tracking-[5px] text-slate-500">← Voltar ao Início</Link>
        </main>
    );
}