"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import Barcode from 'react-barcode'; // <--- Importação correta

export const dynamic = 'force-dynamic';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
}

function ConteudoCrachas() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [carregando, setCarregando] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const carregarDados = async () => {
            setCarregando(true);
            try {
                // Certifique-se que o nome da tabela é 'funcionarios' como definimos no SQL
                const { data, error } = await supabase
                    .from('funcionarios')
                    .select('*')
                    .order('nome', { ascending: true });

                if (error) throw error;
                if (data) setFuncionarios(data as Funcionario[]);
            } catch (error) {
                console.error("Erro ao sincronizar crachás:", error);
            } finally {
                setCarregando(false);
            }
        };
        carregarDados();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white p-8 font-sans print:bg-white print:p-0">
            {/* HEADER WEB */}
            <header className="max-w-5xl mx-auto mb-10 flex justify-between items-end print:hidden">
                <div>
                    <Link href="/dashboard/funcionarios" className="text-orange-500 font-black text-[10px] uppercase tracking-[4px] mb-2 block">← Voltar</Link>
                    <h1 className="text-3xl font-black uppercase italic text-white leading-none">Emissão de <span className="text-orange-500">Crachás</span></h1>
                </div>
                <button onClick={() => window.print()} className="bg-orange-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all">
                    🖨️ Imprimir
                </button>
            </header>

            {/* GRADE DE CRACHÁS */}
            <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 print:grid-cols-2 print:gap-x-10 print:gap-y-16">
                {carregando ? (
                    <div className="col-span-full text-center py-20 animate-pulse font-black uppercase text-slate-800">Sincronizando...</div>
                ) : (
                    funcionarios.map((func) => (
                        <div
                            key={func.id}
                            className="relative mx-auto w-[320px] h-[480px] bg-white text-black border-[3px] border-slate-100 rounded-[30px] overflow-hidden print:border-black print:break-inside-avoid"
                        >
                            {/* Furo Cordão */}
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-slate-50 rounded-full border border-slate-200"></div>

                            {/* Header */}
                            <div className="pt-14 pb-4 text-center">
                                <h2 className="text-2xl font-black uppercase italic text-black">GR <span className="text-orange-600">Autopeças</span></h2>
                            </div>

                            {/* Foto */}
                            <div className="flex justify-center my-4">
                                <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center text-4xl font-black text-slate-400">
                                    {(func.nome || 'G').charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Nomes */}
                            <div className="text-center px-6">
                                <h3 className="text-2xl font-black uppercase italic leading-none">{func.nome}</h3>
                                <h4 className="text-xl font-black uppercase italic text-slate-500 mb-2">{func.sobrenome}</h4>
                                <p className="text-orange-600 text-[10px] font-black uppercase tracking-[3px]">{func.cargo}</p>
                            </div>

                            {/* CÓDIGO DE BARRAS REAL (ESCANEÁVEL) */}
                            <div className="absolute bottom-[60px] left-0 w-full flex justify-center scale-90">
                                <Barcode
                                    value={func.id.toString()}
                                    width={2}
                                    height={50}
                                    fontSize={14}
                                    margin={0}
                                />
                            </div>

                            {/* Base */}
                            <div className="absolute bottom-0 w-full h-10 bg-orange-600 flex items-center justify-center">
                                <p className="text-[8px] font-black text-white uppercase tracking-[4px]">Crachá de Acesso</p>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}

export default function CrachasPage() {
    return (
        <Suspense fallback={null}>
            <ConteudoCrachas />
        </Suspense>
    );
}