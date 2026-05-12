"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ferramenta {
    id: string;
    nome: string;
    status: 'disponivel' | 'em_uso' | 'manutencao';
    dataCadastro: string;
}

export default function ListaFerramentasAdmin() {
    const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [nomeNova, setNomeNova] = useState('');
    const [statusNovo, setStatusNovo] = useState<'disponivel' | 'em_uso'>('disponivel');

    // BUSCA OS DADOS DA VPS
    const carregarFerramentas = async () => {
        setCarregando(true);
        try {
            const response = await fetch('http://76.13.231.158:3000/api/ferramentas');
            if (response.ok) {
                const dados = await response.json();
                setFerramentas(dados);
            }
        } catch (error) {
            console.error("Erro ao buscar ferramentas:", error);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => { carregarFerramentas(); }, []);

    // CADASTRAR NOVA FERRAMENTA NA VPS
    const handleCadastrar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nomeNova) return;

        try {
            const response = await fetch('http://76.13.231.158:3000/api/ferramentas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: nomeNova, status: statusNovo })
            });

            if (response.ok) {
                setNomeNova('');
                carregarFerramentas(); // Recarrega a lista
            }
        } catch (error) {
            alert("Erro ao salvar na VPS");
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white p-8 font-sans">

            <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <Link href="/dashboard/ferramenta" className="text-orange-500 font-black text-[10px] uppercase tracking-[4px] mb-2 block">← Gestão de Ativos</Link>
                    <h1 className="text-4xl font-black uppercase italic leading-none">Inventário de <span className="text-orange-500">Ferramental</span></h1>
                </div>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* COLUNA ESQUERDA: FORMULÁRIO DE CADASTRO */}
                <aside className="lg:col-span-1">
                    <form onSubmit={handleCadastrar} className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] sticky top-8">
                        <h2 className="text-sm font-black uppercase italic mb-6 tracking-widest">Novo Item</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Nome da Ferramenta</label>
                                <input
                                    type="text"
                                    value={nomeNova}
                                    onChange={(e) => setNomeNova(e.target.value)}
                                    placeholder="Ex: Chave de Impacto"
                                    className="w-full bg-black border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm mt-2"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Status Inicial</label>
                                <select
                                    value={statusNovo}
                                    onChange={(e) => setStatusNovo(e.target.value as any)}
                                    className="w-full bg-black border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm mt-2 appearance-none"
                                >
                                    <option value="disponivel">✓ Disponível</option>
                                    <option value="em_uso">⚠ Já em Uso</option>
                                </select>
                            </div>

                            <button className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-900/20">
                                Adicionar ao Estoque
                            </button>
                        </div>
                    </form>
                </aside>

                {/* COLUNA DIREITA: TABELA DE LISTAGEM */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/30 border border-white/5 rounded-[45px] overflow-hidden backdrop-blur-sm">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="bg-white/5">
                                <th className="p-6 text-[10px] font-black uppercase tracking-[3px] text-slate-500">Ferramenta</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[3px] text-slate-500 text-center">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[3px] text-slate-500 text-right">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                            {carregando ? (
                                <tr><td colSpan={3} className="p-20 text-center font-black uppercase text-slate-700 animate-pulse tracking-[8px]">Sincronizando Inventário...</td></tr>
                            ) : ferramentas.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-black uppercase italic text-lg">{item.nome}</span>
                                            <span className="text-[9px] font-mono text-slate-500 uppercase">UID: {item.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                item.status === 'disponivel'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                            }`}>
                                                {item.status === 'disponivel' ? 'No Estoque' : 'Em Uso'}
                                            </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href="/dashboard/ferramenta/etiquetas" className="bg-white/10 hover:bg-white hover:text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all">Etiqueta</Link>
                                            <button className="bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all">Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}