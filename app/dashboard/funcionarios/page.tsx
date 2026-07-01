"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    cargo: string;
    data_cadastro: string;
    matricula_contabil: string | null;
    salario: number | null;
}

export default function CentralFuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [pesquisa, setPesquisa] = useState('');
    const [erroRequest, setErroRequest] = useState<string | null>(null);

    // Estados para o Modal de Edição Privilegiada
    const [funcionarioParaEditar, setFuncionarioParaEditar] = useState<Funcionario | null>(null);
    const [salvando, setSalvando] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Lista oficial de opções idêntica ao banco e ao cadastro para evitar erro de enum
    const listaCargosOficiais = [
        "Administrativo",
        "Ajudante",
        "Balconista",
        "Comprador",
        "Estoque",
        "Gerente",
        "Lojista",
        "Mecânico",
        "Motoboy",
        "Pedreiro",
        "Técnico de OS",
        "TI",
        "Vendedor"
    ];

    async function carregarFuncionarios() {
        setCarregando(true);
        setErroRequest(null);
        try {
            const { data, error } = await supabase
                .from('funcionarios')
                .select('*')
                .order('nome', { ascending: true });

            if (error) {
                setErroRequest(error.message);
                console.error("Erro Supabase:", error);
                return;
            }

            if (data) {
                setFuncionarios(data as Funcionario[]);
            }
        } catch (err: any) {
            setErroRequest(err?.message || "Falha ao conectar com o banco.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    // Rotina de Atualização Cadastral Protegida
    const handleAtualizarFuncionario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funcionarioParaEditar) return;

        setSalvando(true);
        try {
            const { error } = await supabase
                .from('funcionarios')
                .update({
                    nome: funcionarioParaEditar.nome.trim(),
                    sobrenome: funcionarioParaEditar.sobrenome.trim(),
                    cargo: funcionarioParaEditar.cargo, // Enviado exatamente como o Enum espera
                    matricula_contabil: funcionarioParaEditar.matricula_contabil ? String(funcionarioParaEditar.matricula_contabil).trim() : null,
                    salario: funcionarioParaEditar.salario ? Number(funcionarioParaEditar.salario) : null
                })
                .eq('id', funcionarioParaEditar.id);

            if (error) throw error;

            // Atualiza o estado em memória local instantaneamente
            setFuncionarios(prev =>
                prev.map(f => f.id === funcionarioParaEditar.id ? funcionarioParaEditar : f)
            );
            setFuncionarioParaEditar(null);
        } catch (err: any) {
            console.error("Erro ao atualizar colaborador:", err);
            alert("Erro ao gravar modificações: " + (err?.message || "Tente novamente."));
        } finally {
            setSalvando(false);
        }
    };

    const filtrados = useMemo(() => {
        const termo = pesquisa.toLowerCase().trim();
        if (!termo) return funcionarios;
        return funcionarios.filter(f => {
            const nomeCompleto = `${f.nome || ''} ${f.sobrenome || ''}`.toLowerCase();
            const idCracha = String(f.id || '').toLowerCase();
            const cargoFunc = String(f.cargo || '').toLowerCase();
            const matricula = String(f.matricula_contabil || '').toLowerCase();
            return nomeCompleto.includes(termo) || idCracha.includes(termo) || cargoFunc.includes(termo) || matricula.includes(termo);
        });
    }, [funcionarios, pesquisa]);

    // Formatador de Moeda BRL
    const formatarMoeda = (valor: number | null) => {
        if (!valor) return '---';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-black/5 flex flex-col justify-between w-full">

            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 sm:gap-8">

                {/* CABEÇALHO */}
                <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#e5e5ea] pb-6 pl-1">
                    <div className="space-y-1">
                        <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                            ← Módulos Operacionais
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                            Controle de Equipe
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button
                            onClick={carregarFuncionarios}
                            className="flex-1 sm:flex-none bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                        >
                            🔄 Sincronizar
                        </button>

                        <Link href="/dashboard/funcionarios/crachas" className="flex-1 sm:flex-none bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.01)] text-center">
                            💳 Crachás
                        </Link>

                        <Link
                            href="/dashboard/funcionarios/cadastro"
                            className="w-full sm:w-auto bg-[#1d1d1f] active:bg-black text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 text-center block"
                        >
                            ➕ Cadastrar Colaborador
                        </Link>
                    </div>
                </header>

                {erroRequest && (
                    <div className="flex items-start gap-2.5 bg-[#ff3b30]/5 border border-[#ff3b30]/20 p-4 rounded-xl text-xs text-[#ff3b30] font-semibold">
                        <span>⚠️ Falha na sincronização: {erroRequest}</span>
                    </div>
                )}

                {/* BARRA DE PESQUISA APPLE STYLE */}
                <div className="w-full max-w-md">
                    <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#86868b] ml-0.5">
                            Filtro de Varredura
                        </label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 14l-3.5-3.5m0 0A5 5 0 104 4a5 5 0 006.5 6.5z" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Filtrar por nome, cargo ou matrículas..."
                                value={pesquisa}
                                onChange={e => setPesquisa(e.target.value)}
                                className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] pl-10 pr-4 py-2.5 rounded-xl outline-none text-[#1d1d1f] text-xs font-medium transition-colors placeholder-[#b4b4b9] uppercase shadow-[0_1px_2px_rgba(0,0,0,0.005)]"
                            />
                        </div>
                    </div>
                </div>

                {/* PAINEL / TABELA SÓLIDA */}
                <section className="bg-white border border-[#e5e5ea] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
                    {carregando ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center gap-2 text-[#86868b]">
                            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                                Sincronizando dados...
                            </span>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wide">Nenhum operador localizado na varredura.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                                <thead>
                                <tr className="border-b border-[#e5e5ea] text-[#86868b] uppercase tracking-wider text-[8px] font-bold select-none">
                                    <th className="pb-3 pl-1 w-[80px]">Editar</th>
                                    <th className="pb-3 w-[120px]">Crachá (ID)</th>
                                    <th className="pb-3 w-[120px]">Matrícula (RF)</th>
                                    <th className="pb-3 min-w-[200px]">Colaborador / Operador</th>
                                    <th className="pb-3 w-[150px]">Cargo / Função</th>
                                    <th className="pb-3 w-[120px]">Salário Base</th>
                                    <th className="pb-3 text-right pr-1 w-[120px]">Admissão</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7]">
                                {filtrados.map(f => (
                                    <tr key={f.id} className="hover:bg-[#f5f5f7]/50 transition-colors group">
                                        <td className="py-3.5 pl-1 select-none">
                                            <button
                                                onClick={() => setFuncionarioParaEditar(f)}
                                                className="bg-[#f5f5f7] hover:bg-[#e8e8ed] border border-[#e5e5ea] text-[#1d1d1f] px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide opacity-60 group-hover:opacity-100 transition-all active:scale-95"
                                            >
                                                ✏️ Editar
                                            </button>
                                        </td>
                                        <td className="py-3.5 font-mono font-bold text-[#ff9500] tracking-widest text-xs">
                                            {f.id}
                                        </td>
                                        <td className="py-3.5 font-mono font-bold text-[#1d1d1f] tracking-widest text-xs">
                                            {f.matricula_contabil || '---'}
                                        </td>
                                        <td className="py-3.5 font-bold text-[#1d1d1f] uppercase tracking-tight text-xs">
                                            {f.nome} {f.sobrenome}
                                        </td>
                                        <td className="py-3.5 text-[#86868b] font-semibold uppercase text-[10px] tracking-wide">
                                            {f.cargo}
                                        </td>
                                        <td className="py-3.5 font-mono font-bold text-[#34c759] text-[11px]">
                                            {formatarMoeda(f.salario)}
                                        </td>
                                        <td className="py-3.5 text-right pr-1 font-mono text-[#86868b] font-bold text-[11px]">
                                            {f.data_cadastro ? new Date(f.data_cadastro).toLocaleDateString('pt-BR') : '---'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* MODAL APPLE STYLE: ALTERAÇÃO PROTEGIDA DE OPERADOR */}
            {funcionarioParaEditar && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleAtualizarFuncionario}
                        className="bg-white border border-[#e5e5ea] p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-xl"
                    >
                        <div className="border-b border-[#e5e5ea] pb-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1d1f]">Modificar Cadastro</h3>
                            <p className="text-[10px] text-[#86868b] font-medium mt-0.5">As alterações serão gravadas imediatamente no banco de dados.</p>
                        </div>

                        {/* BLOQUEIO ABSOLUTO DE ID */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">ID Interno (Crachá Bloqueado)</label>
                            <div className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2.5 rounded-xl text-xs font-mono font-black text-[#ff9500] select-all cursor-not-allowed">
                                🔒 {funcionarioParaEditar.id}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Primeiro Nome</label>
                                <input
                                    type="text"
                                    value={funcionarioParaEditar.nome}
                                    onChange={e => setFuncionarioParaEditar({...funcionarioParaEditar, nome: e.target.value})}
                                    className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-xl text-xs font-bold text-[#1d1d1f] outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Sobrenome</label>
                                <input
                                    type="text"
                                    value={funcionarioParaEditar.sobrenome}
                                    onChange={e => setFuncionarioParaEditar({...funcionarioParaEditar, sobrenome: e.target.value})}
                                    className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-xl text-xs font-bold text-[#1d1d1f] outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Cargo / Atribuição de Pátio</label>
                            <div className="relative">
                                <select
                                    value={funcionarioParaEditar.cargo}
                                    onChange={e => setFuncionarioParaEditar({...funcionarioParaEditar, cargo: e.target.value})}
                                    className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] pr-8 pl-3 py-2.5 rounded-xl text-xs font-bold text-[#1d1d1f] outline-none cursor-pointer appearance-none transition-colors"
                                    required
                                >
                                    {listaCargosOficiais.map((cargoOpcao, cIdx) => (
                                        <option key={cIdx} value={cargoOpcao}>{cargoOpcao}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* NOVOS CAMPOS: MATRÍCULA E SALÁRIO */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#f5f5f7]">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Matrícula (Contábil RF)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 00006"
                                    value={funcionarioParaEditar.matricula_contabil || ''}
                                    onChange={e => setFuncionarioParaEditar({...funcionarioParaEditar, matricula_contabil: e.target.value || null})}
                                    className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-xl text-xs font-mono font-bold text-[#1d1d1f] outline-none placeholder-[#d1d1d6]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Salário Base Mensal (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Ex: 1621.00"
                                    value={funcionarioParaEditar.salario || ''}
                                    onChange={e => setFuncionarioParaEditar({...funcionarioParaEditar, salario: e.target.value ? Number(e.target.value) : null})}
                                    className="w-full bg-white border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-xl text-xs font-mono font-bold text-[#1d1d1f] outline-none placeholder-[#d1d1d6]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2 border-t border-[#e5e5ea] select-none">
                            <button
                                type="button"
                                onClick={() => setFuncionarioParaEditar(null)}
                                className="flex-1 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={salvando}
                                className="flex-1 bg-[#1d1d1f] active:bg-black text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                            >
                                {salvando ? 'Gravando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* RODAPÉ */}
            <footer className="w-full max-w-7xl mx-auto border-t border-[#e5e5ea] pt-5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-[#86868b] uppercase font-bold tracking-wider gap-4 text-center sm:text-left select-none">
                <div>GR Autopeças &amp; Serviços</div>
                <div className="font-mono text-[#b4b4b9]">Módulo de Varredura Operacional v2.7</div>
            </footer>
        </main>
    );
}