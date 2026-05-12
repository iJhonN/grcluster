"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Ponto {
    id: string;
    funcionarioId: string;
    data: string;
    horaFormatada: string;
    tipo: 'entrada' | 'saida' | 'alerta' | 'extra';
}

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
}

function ConteudoCalendario() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Estados
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [pontos, setPontos] = useState<Ponto[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Parâmetros da URL
    const funcId = searchParams.get('id') || '';
    const mesUrl = searchParams.get('mes') || '2026-05';

    useEffect(() => {
        const carregarDados = async () => {
            setCarregando(true);
            try {
                const [resFunc, resPontos] = await Promise.all([
                    fetch('http://76.13.231.158:3000/api/funcionarios'),
                    fetch('http://76.13.231.158:3000/api/pontos')
                ]);

                if (resFunc.ok && resPontos.ok) {
                    setFuncionarios(await resFunc.json());
                    const todosPontos = await resPontos.json();

                    // Filtrar pontos do funcionário e do mês selecionado
                    const [ano, mes] = mesUrl.split('-').map(Number);
                    const filtrados = todosPontos.filter((p: Ponto) => {
                        const dt = new Date(p.data);
                        return String(p.funcionarioId) === funcId &&
                            (dt.getMonth() + 1) === mes &&
                            dt.getFullYear() === ano;
                    });
                    setPontos(filtrados);
                }
            } catch (error) { console.error(error); }
            finally { setCarregando(false); }
        };
        carregarDados();
    }, [funcId, mesUrl]);

    // Lógica para gerar os dias do mês
    const [ano, mes] = mesUrl.split('-').map(Number);
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);

    const atualizarBusca = (chave: string, valor: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(chave, valor);
        router.push(`/dashboard/calendario?${params.toString()}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10">
            {/* CONTROLES - OCULTOS NO PRINT */}
            <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 print:hidden">
                <div className="w-full md:w-auto">
                    <Link href="/dashboard" className="text-orange-500 font-black text-[10px] uppercase tracking-[4px] mb-2 block">← Voltar</Link>
                    <h1 className="text-4xl font-black uppercase italic leading-none">Espelho de <span className="text-orange-500">Ponto</span></h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <select
                        value={funcId}
                        onChange={(e) => atualizarBusca('id', e.target.value)}
                        className="bg-slate-900 border border-white/10 p-4 rounded-2xl font-bold text-xs outline-none focus:border-orange-500"
                    >
                        <option value="">Selecionar Funcionário</option>
                        {funcionarios.map(f => (
                            <option key={f.id} value={f.id}>{f.nome} {f.sobrenome}</option>
                        ))}
                    </select>
                    <input
                        type="month"
                        value={mesUrl}
                        onChange={(e) => atualizarBusca('mes', e.target.value)}
                        className="bg-slate-900 border border-white/10 p-4 rounded-2xl font-bold text-xs"
                    />
                </div>
            </header>

            {/* GRADE DO CALENDÁRIO */}
            {!funcId ? (
                <div className="py-40 text-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[50px]">
                    <p className="text-slate-600 font-black uppercase tracking-[5px]">Selecione um colaborador para ver o calendário</p>
                </div>
            ) : (
                <div className="bg-white text-black p-8 rounded-[50px] shadow-2xl print:shadow-none print:p-0 print:rounded-none">
                    <div className="flex justify-between items-center mb-8 border-b-2 border-slate-100 pb-6">
                        <h2 className="text-2xl font-black uppercase italic">
                            {funcionarios.find(f => f.id === funcId)?.nome} {funcionarios.find(f => f.id === funcId)?.sobrenome}
                        </h2>
                        <span className="bg-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">
                            Mês de Referência: {mesUrl.split('-').reverse().join('/')}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {/* Cabeçalho de Dias da Semana (Opcional) */}
                        {diasArray.map(dia => {
                            const pontosDoDia = pontos.filter(p => new Date(p.data).getDate() === dia);

                            return (
                                <div key={dia} className="min-h-[120px] border border-slate-100 p-3 rounded-2xl flex flex-col gap-2 hover:bg-slate-50 transition-all">
                                    <span className="text-lg font-black italic opacity-20">{dia.toString().padStart(2, '0')}</span>
                                    <div className="flex flex-wrap gap-1">
                                        {pontosDoDia.map((p, idx) => (
                                            <div
                                                key={idx}
                                                className={`text-[9px] font-black px-2 py-1 rounded-md uppercase border ${
                                                    p.tipo === 'entrada' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        p.tipo === 'saida' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                                            p.tipo === 'extra' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                'bg-red-100 text-red-700 border-red-200'
                                                }`}
                                            >
                                                {p.horaFormatada}
                                            </div>
                                        ))}
                                    </div>
                                    {pontosDoDia.length === 0 && (
                                        <span className="text-[7px] font-bold text-slate-300 uppercase mt-auto">Sem Registro</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* LEGENDA - APENAS PRINT */}
                    <footer className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-4 gap-4 text-[8px] font-black uppercase tracking-widest opacity-40">
                        <p>🟦 Entrada Regular</p>
                        <p>⬜ Saída Regular</p>
                        <p>🟩 Hora Extra</p>
                        <p>🟥 Alerta/Atraso</p>
                    </footer>
                </div>
            )}
        </div>
    );
}

export default function CalendarioAdmin() {
    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <Suspense fallback={null}>
                <ConteudoCalendario />
            </Suspense>
        </main>
    );
}