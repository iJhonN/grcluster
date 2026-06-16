"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface DataSelect {
    id: string;
    label: string;
}

export default function CadastrarCombustivelPage() {
    const router = useRouter();

    // Estados para carregar as opções relacionais do banco
    const [veiculos, setVeiculos] = useState<DataSelect[]>([]);
    const [motoristas, setMotoristas] = useState<DataSelect[]>([]);

    // NOVOS ESTADOS: Termos de pesquisa para os seletores
    const [buscaVeiculo, setBuscaVeiculo] = useState('');
    const [buscaMotorista, setBuscaMotorista] = useState('');

    // Estados dos campos do formulário de abastecimento
    const [veiculoId, setVeiculoId] = useState('');
    const [motoristaId, setMotoristaId] = useState('');
    const [litros, setLitros] = useState('');
    const [valorTotal, setValorTotal] = useState('');
    const [odometro, setOdometro] = useState('');
    const [dataAbastecimento, setDataAbastecimento] = useState(new Date().toISOString().split('T')[0]);

    const [carregandoListas, setCarregandoListas] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Carrega veículos e motoristas para alimentar o formulário
    async function carregarDadosAbastecimento() {
        setCarregandoListas(true);
        try {
            // 1. Busca veículos da garagem
            const { data: dataV } = await supabase.from('veiculos').select('id, fabricante, modelo, placa, tem_placa').order('modelo');
            if (dataV) {
                setVeiculos(dataV.map(v => ({
                    id: v.id,
                    label: `${v.fabricante} ${v.modelo} ${v.tem_placa ? `[${v.placa}]` : '(⚙️ Maquinário)'}`
                })));
            }

            // 2. Busca motoristas ativos
            const { data: dataM } = await supabase.from('motoristas').select('id, nome_completo').order('nome_completo');
            if (dataM) {
                setMotoristas(dataM.map(m => ({
                    id: m.id,
                    label: m.nome_completo
                })));
            }
        } catch (err) {
            console.error("Erro ao carregar dados de abastecimento:", err);
        } declare {
            setCarregandoListas(false);
    }
    }

    useEffect(() => {
        carregarDadosAbastecimento();
    }, []);

    // FILTRAGEM EM TEMPO REAL (Ignora maiúsculas/minúsculas)
    const veiculosFiltrados = veiculos.filter(v =>
        v.label.toLowerCase().includes(buscaVeiculo.toLowerCase())
    );

    const motoristasFiltrados = motoristas.filter(m =>
        m.label.toLowerCase().includes(buscaMotorista.toLowerCase())
    );

    const handleSalvarAbastecimento = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!veiculoId || !motoristaId || !litros || !valorTotal || !odometro) {
            setStatusFeed({ tipo: 'erro', texto: 'Por favor, preencha todos os campos obrigatórios.' });
            return;
        }

        setEnviando(true);
        setStatusFeed({ tipo: '', texto: '' });

        try {
            const payload = {
                veiculo_id: veiculoId,
                motorista_id: motoristaId,
                litros: Number(litros),
                valor_total: Number(valorTotal),
                odometro: Number(odometro),
                data_abastecimento: dataAbastecimento,
                criado_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('frota_combustivel') // Confirme o nome exato da sua tabela se for diferente
                .insert([payload]);

            if (error) throw error;

            setStatusFeed({
                tipo: 'sucesso',
                texto: '⛽ Sucesso! Registro de abastecimento consolidado no histórico.'
            });

            // Limpa o formulário completo
            setVeiculoId('');
            setMotoristaId('');
            setLitros('');
            setValorTotal('');
            setOdometro('');
            setBuscaVeiculo('');
            setBuscaMotorista('');

            setTimeout(() => {
                router.push('/dashboard/frota');
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setStatusFeed({
                tipo: 'erro',
                texto: err.message || 'Falha ao injetar registro de combustível.'
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#11141a] text-[#f1f3f7] p-4 sm:p-6 md:p-10 font-sans overflow-hidden antialiased flex flex-col justify-between w-full">

            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center max-w-[1400px] mx-auto">

                <div className="w-full max-w-xl mb-4 text-left px-2">
                    <Link href="/dashboard/frota" className="text-blue-400 font-bold text-[10px] uppercase tracking-[3px] hover:opacity-80 transition-all">
                        ← Cancelar e Voltar à Frota
                    </Link>
                </div>

                {/* CONTAINER CARD */}
                <div className="w-full max-w-xl relative bg-[#1a1f29]/95 border border-white/[0.06] rounded-[36px] p-8 shadow-2xl backdrop-blur-3xl">
                    <div className="absolute top-0 left-[25%] right-[25%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

                    <div className="mb-8 text-center sm:text-left">
                        <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                            <span>⛽</span> Lançar Cupom de <span className="text-blue-400">Combustível</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">
                            Controle de litragem, média de consumo e auditoria financeira de bombas
                        </p>
                    </div>

                    {statusFeed.texto && (
                        <div className={`mb-6 p-4 rounded-xl border text-[10px] font-black uppercase tracking-wide text-center leading-relaxed ${
                            statusFeed.tipo === 'sucesso' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
                        }`}>
                            {statusFeed.texto}
                        </div>
                    )}

                    {carregandoListas ? (
                        <div className="text-center py-20 text-[9px] uppercase font-black text-slate-500 tracking-[3px] animate-pulse">
                            Baixando listas de ativos e motoristas parceiros...
                        </div>
                    ) : (
                        <form onSubmit={handleSalvarAbastecimento} className="space-y-5">

                            {/* BUSCA + SELECT VEÍCULO */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">1. Identificação do Veículo</label>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar veículo por placa ou modelo..."
                                        value={buscaVeiculo}
                                        onChange={e => setBuscaVeiculo(e.target.value)}
                                        className="w-full bg-black/30 border border-white/[0.04] focus:border-blue-500/30 px-3 py-1.5 rounded-lg outline-none text-white text-[11px] font-medium placeholder-slate-600 uppercase tracking-wide"
                                        disabled={enviando}
                                    />
                                    <select
                                        value={veiculoId}
                                        onChange={e => setVeiculoId(e.target.value)}
                                        className="w-full bg-black/50 border border-white/[0.06] focus:border-blue-500/50 px-4 py-3 rounded-xl outline-none text-slate-200 text-xs font-bold uppercase tracking-wide cursor-pointer"
                                        required
                                        disabled={enviando}
                                    >
                                        <option value="">-- Selecione o veículo abastecido ({veiculosFiltrados.length}) --</option>
                                        {veiculosFiltrados.map(v => (
                                            <option key={v.id} value={v.id} className="bg-[#1a1f29]">{v.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* BUSCA + SELECT MOTORISTA */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">2. Motorista Responsável</label>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar condutor pelo nome..."
                                        value={buscaMotorista}
                                        onChange={e => setBuscaMotorista(e.target.value)}
                                        className="w-full bg-black/30 border border-white/[0.04] focus:border-blue-500/30 px-3 py-1.5 rounded-lg outline-none text-white text-[11px] font-medium placeholder-slate-600 uppercase tracking-wide"
                                        disabled={enviando}
                                    />
                                    <select
                                        value={motoristaId}
                                        onChange={e => setMotoristaId(e.target.value)}
                                        className="w-full bg-black/50 border border-white/[0.06] focus:border-blue-500/50 px-4 py-3 rounded-xl outline-none text-slate-200 text-xs font-bold uppercase tracking-wide cursor-pointer"
                                        required
                                        disabled={enviando}
                                    >
                                        <option value="">-- Quem realizou o abastecimento? ({motoristasFiltrados.length}) --</option>
                                        {motoristasFiltrados.map(m => (
                                            <option key={m.id} value={m.id} className="bg-[#1a1f29]">{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* GRID DE ENTRADAS NUMÉRICAS (LITROS, VALOR E ODÔMETRO) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Volume (Litros)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={litros}
                                        onChange={e => setLitros(e.target.value)}
                                        className="w-full bg-black/50 border border-white/[0.06] focus:border-blue-500/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono tracking-wider"
                                        required
                                        disabled={enviando}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Valor Total (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={valorTotal}
                                        onChange={e => setValorTotal(e.target.value)}
                                        className="w-full bg-black/50 border border-white/[0.06] focus:border-blue-500/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono tracking-wider"
                                        required
                                        disabled={enviando}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Odômetro Atual</label>
                                    <input
                                        type="number"
                                        placeholder="KM atual..."
                                        value={odometro}
                                        onChange={e => setOdometro(e.target.value)}
                                        className="w-full bg-black/50 border border-white/[0.06] focus:border-blue-500/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono tracking-wider"
                                        required
                                        disabled={enviando}
                                    />
                                </div>
                            </div>

                            {/* DATA DO ABASTECIMENTO */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Data do Abastecimento</label>
                                <input
                                    type="date"
                                    value={dataAbastecimento}
                                    onChange={e => setDataAbastecimento(e.target.value)}
                                    className="w-full bg-black/50 border border-white/[0.06] focus:border-blue-500/50 px-4 py-3 rounded-xl outline-none text-white text-xs font-mono tracking-wider"
                                    required
                                    disabled={enviando}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={enviando}
                                className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[3px] text-black transition-all active:scale-[0.99] disabled:opacity-40 overflow-hidden relative group mt-2"
                                style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {enviando ? "Gravando Cupom Fiscal..." : "Salvar Registro de Abastecimento (Enter)"}
                            </button>
                        </form>
                    )}
                </div>

            </div>

            <footer className="w-full border-t border-white/[0.02] pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[8px] text-slate-500 uppercase font-bold tracking-[3px] gap-4 text-center sm:text-left max-w-[1400px] mx-auto px-2">
                <div>GR Autopeças & Distribuição</div>
                <div className="font-mono text-slate-600">Fleet Control Unit v1.1</div>
            </footer>
        </main>
    );
}