"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface ItemChecklist {
    id: string;
    texto: string;
}

interface SecaoChecklist {
    titulo: string;
    textosAdicionais?: string;
    itens: ItemChecklist[];
}

// 1. O componente principal vira apenas uma função interna
function EditarChecklistForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const revisaoId = searchParams.get('id');

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [statusFeed, setStatusFeed] = useState({ tipo: '', texto: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [identificacao, setIdentificacao] = useState({
        placa: '', frotaNo: '', marcaModelo: '', ano: '',
        quilometragem: '', proxRevisao: '', dataEntrada: '', hora: '',
        mecanico: '', ajudante: '', dataSaida: ''
    });

    const handlePlacaChange = (val: string) => {
        let texto = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (texto.length <= 3) {
            setIdentificacao(prev => ({ ...prev, placa: texto }));
            return;
        }
        texto = texto.substring(0, 7);
        const parteLetras = texto.substring(0, 3).replace(/[^A-Z]/g, '');
        const parteNumeros = texto.substring(3);

        if (parteLetras.length === 3) {
            setIdentificacao(prev => ({ ...prev, placa: `${parteLetras}-${parteNumeros}` }));
        } else {
            setIdentificacao(prev => ({ ...prev, placa: parteLetras }));
        }
    };

    const secoes: SecaoChecklist[] = [
        {
            titulo: "2. Motor e Combustão",
            itens: [
                { id: "m1", texto: "Troca de óleo do motor" },
                { id: "m2", texto: "Troca de filtro de óleo" },
                { id: "m3", texto: "Troca de filtro de ar (elemento principal e secundário)" },
                { id: "m4", texto: "Troca de filtro de combustível" },
                { id: "m5", texto: "Troca de filtro separador de água (Racor)" },
                { id: "m6", texto: "Verificação de coxins do motor" },
                { id: "m7", texto: "Inspeção de correias (poly-V alternador, A/C, direção hidráulica)" },
                { id: "m8", texto: "Inspeção de polias e tensores" },
                { id: "m9", texto: "Verificação de juntas e vazamentos" },
                { id: "m10", texto: "Aperto do coletor de admissão / escape" },
                { id: "m11", texto: "Diagnóstico com scanner - leitura de falhas" },
                { id: "m12", texto: "Verificação da espoleta d'água do cabeçote" },
                { id: "m13", texto: "Verificação dos sensores de óleo, temperatura e fase" }
            ]
        },
        {
            titulo: "3. Sistema de Combustível e Injeção",
            itens: [
                { id: "c1", texto: "Inspeção dos bicos injetores (teste em bancada se necessário)" },
                { id: "c2", texto: "Verificação da bomba de combustível" },
                { id: "c3", texto: "Limpeza do TBI/corpo de borboleta" },
                { id: "c4", texto: "Verificação de Arla 32 e módulo do motor (se aplicável)" },
                { id: "c5", texto: "Inspeção de mangueiras e linhas de combustível" },
                { id: "c6", texto: "Verificação do reservatório / tanque (vedação)" }
            ]
        },
        {
            titulo: "4. Sistema de Arrefecimento",
            itens: [
                { id: "a1", texto: "Limpeza e varetamento do radiador" },
                { id: "a2", texto: "Limpeza do intercooler" },
                { id: "a3", texto: "Troca de paraflu / fluido de arrefecimento" },
                { id: "a4", texto: "Inspeção do mangote superior, inferior e do intercooler" },
                { id: "a5", texto: "Troca da válvula termostática (se necessário)" },
                { id: "a6", texto: "Inspeção do reservatório de expansão e da tampa" },
                { id: "a7", texto: "Teste de pressurização do sistema" },
                { id: "a8", texto: "Verificação da hélice / ventoinha e acoplamento viscoso" },
                { id: "a9", texto: "Verificação da bomba d'água" },
                { id: "a10", texto: "Verificação do sensor de temperatura" }
            ]
        },
        {
            titulo: "5. Sistema de Freios",
            itens: [
                { id: "f1", texto: "Medição das lonas dianteiras (mínimo em mm)" },
                { id: "f2", texto: "Medição das lonas traseiras (mínimo em mm)" },
                { id: "f3", texto: "Substituição de lonas / sapatas (se abaixo do mínimo)" },
                { id: "f4", texto: "Regulagem de catracas (manuais ou automáticas)" },
                { id: "f5", texto: "Inspeção dos diafragmas das cuícas (tipo 16)" },
                { id: "f6", texto: "Inspeção do kit pino de sapata" },
                { id: "f7", texto: "Inspeção das molas de patim" },
                { id: "f8", texto: "Verificação dos rebites das lonas" },
                { id: "f9", texto: "Sangria do sistema e troca do fluido DOT 4" },
                { id: "f10", texto: "Verificação da válvula APU / relê de freio" },
                { id: "f11", texto: "Verificação das válvulas de proteção 4 e 6 vias (Knorr)" },
                { id: "f12", texto: "Teste de pressão de ar (cabine)" },
                { id: "f13", texto: "Teste do freio de mão (válvula DPM)" },
                { id: "f14", texto: "Substituição do cartucho do secador de ar (a cada 18-24 meses)" },
                { id: "f15", texto: "Verificação da válvula de freio motor" }
            ]
        },
        {
            titulo: "6. Sistema Pneumático",
            itens: [
                { id: "p1", texto: "Teste de pressão do compressor de ar" },
                { id: "p2", texto: "Verificação de vazamentos (mangueiras Koraz / Wabco)" },
                { id: "p3", texto: "Inspeção de uniões plásticas" },
                { id: "p4", texto: "Verificação do regulador de pressão" },
                { id: "p5", texto: "Verificação da válvula de nivelamento de suspensão" },
                { id: "p6", texto: "Inspeção dos bolsões / foles de suspensão pneumática" },
                { id: "p7", texto: "Verificação dos manômetros do painel" }
            ]
        },
        {
            titulo: "7. Suspensão e Direção",
            itens: [
                { id: "s1", texto: "Inspeção dos feixes de mola dianteiros (LD e LE)" },
                { id: "s2", texto: "Inspeção dos feixes de mola traseiros (LD e LE)" },
                { id: "s3", texto: "Arqueamento / embuchamento (se necessário)" },
                { id: "s4", texto: "Substituição de buchas, pinos e jumelos" },
                { id: "s5", texto: "Substituição de grampos do feixe de mola" },
                { id: "s6", texto: "Inspeção dos batentes e calços de mola" },
                { id: "s7", texto: "Verificação da barra estabilizadora e bieletas" },
                { id: "s8", texto: "Inspeção da manga de eixo dianteira (LD e LE)" },
                { id: "s9", texto: "Verificação da pista da manga (recalcamento se necessário)" },
                { id: "s10", texto: "Verificação dos pinos da manga" },
                { id: "s11", texto: "Inspeção dos terminais de direção (LD e LE)" },
                { id: "s12", texto: "Verificação da caixa de direção (folgas, vedação)" },
                { id: "s13", texto: "Substituição da coifa da caixa de direção (se necessário)" },
                { id: "s14", texto: "Verificação dos amortecedores" }
            ]
        },
        {
            titulo: "8. Conjunto Roda, Cubo e Eixo",
            itens: [
                { id: "r1", texto: "Reaperto de porcas de roda com torquímetro (M22 / 7/8 UNF)" },
                { id: "r2", texto: "Verificação do cubo dianteiro e traseiro (folga)" },
                { id: "r3", texto: "Substituição de retentores (Sabo) se necessário" },
                { id: "r4", texto: "Verificação dos rolamentos" },
                { id: "r5", texto: "Conferência de contrapinos e cupilhas" },
                { id: "r6", texto: "Verificação dos prisioneiros e parafusos de roda" }
            ]
        },
        {
            titulo: "9. Transmissão, Câmbio e Cardã",
            itens: [
                { id: "t1", texto: "Troca do óleo do câmbio (Maxon Gear 90/140)" },
                { id: "t2", texto: "Troca do óleo do diferencial" },
                { id: "t3", texto: "Inspeção do cardã e cruzeta" },
                { id: "t4", texto: "Verificação do rolamento boiadeiro / mancal do cardã" },
                { id: "t5", texto: "Verificação do trambulador, cabo e bucha" },
                { id: "t6", texto: "Inspeção da embreagem (espessura do disco, servo, cilindro auxiliar)" },
                { id: "t7", texto: "Verificação dos coxins do câmbio (palmatória)" }
            ]
        },
        {
            titulo: "10. Sistema Elétrico",
            itens: [
                { id: "e1", texto: "Teste de carga e densidade da bateria" },
                { id: "e2", texto: "Limpeza e aperto dos terminais de bateria" },
                { id: "e3", texto: "Inspeção dos cabos e chicotes principais" },
                { id: "e4", texto: "Teste do alternador (saída em carga)" },
                { id: "e5", texto: "Inspeção do motor de partida (escovas)" },
                { id: "e6", texto: "Faróis alto e baixo (alinhamento)" },
                { id: "e7", texto: "Lanternas laterais / corujinhas (acende e isenta de água)" },
                { id: "e8", texto: "Pisca, alerta, freio, ré, neblina (testar)" },
                { id: "e9", texto: "Iluminação do salão (todas as luminárias)" },
                { id: "e10", texto: "Iluminação do bagageiro" },
                { id: "e11", texto: "Painel e instrumentos (RPM, temperatura, combustível, pressão)" },
                { id: "e12", texto: "Buzina (sonora normal e a ar)" },
                { id: "e13", texto: "Limpador de para-brisa (motor, palhetas, hastes)" },
                { id: "e14", texto: "Chave de seta, corte de luz, contato de ignição" },
                { id: "e15", texto: "Inspeção de relés e fusíveis" },
                { id: "e16", texto: "Chicotes críticos (porta elétrica, motor do limpador, painel, lanterna traseira)" }
            ]
        },
        {
            titulo: "11. Ar Condicionado",
            itens: [
                { id: "ac1", texto: "Limpeza do filtro e do evaporador" },
                { id: "ac2", texto: "Higienização interna do sistema" },
                { id: "ac3", texto: "Recarga de gás R134a" },
                { id: "ac4", texto: "Troca do óleo do compressor (PAG)" },
                { id: "ac5", texto: "Inspeção do compressor (ruído, vibração)" },
                { id: "ac6", texto: "Inspeção da condensadora (limpeza, aletas)" },
                { id: "ac7", texto: "Verificação da válvula de expansão" },
                { id: "ac8", texto: "Inspeção das mangueiras (vazamento)" },
                { id: "ac9", texto: "Verificação dos drenos de água" },
                { id: "ac10", texto: "Troca da correia do compressor" }
            ]
        },
        {
            titulo: "12. Carroceria e Segurança",
            textosAdicionais: "Essencial em Transporte Escolar",
            itens: [
                { id: "car1", texto: "Inspeção do para-brisa (trincas / lascas)" },
                { id: "car2", texto: "Vidros laterais (trincas, fixação)" },
                { id: "car3", texto: "Borrachas de vedação (portas, vidros, para-brisa)" },
                { id: "car4", texto: "Retrovisores externos e internos (regulagem, vidros)" },
                { id: "car5", texto: "Funcionamento das portas e da automação (porta elétrica)" },
                { id: "car6", texto: "Travamento e fixação dos bancos do salão" },
                { id: "car7", texto: "Cintos de segurança (motorista e passageiros, se aplicável)" },
                { id: "car8", texto: "Marcação de saída de emergência" },
                { id: "car9", texto: "Martelo de emergência (presença e fixação)" },
                { id: "car10", texto: "Extintor (validade, pressão, fixação)" },
                { id: "car11", texto: "Triângulo de sinalização" },
                { id: "car12", texto: "Faixas refletivas laterais e traseiras" },
                { id: "car13", texto: "Bagageiros (fixação, alinhamento)" },
                { id: "car14", texto: "Captação de água no teto (vazamentos)" },
                { id: "car15", texto: "Pintura externa (retoques)" },
                { id: "car16", texto: "Limpeza geral interna e externa" }
            ]
        },
        {
            titulo: "13. Pneus",
            itens: [
                { id: "pn1", texto: "Profundidade dos sulcos (medir em mm)" },
                { id: "pn2", texto: "DOT / idade do pneu" },
                { id: "pn3", texto: "Calibragem (todos os pneus, com tampa)" },
                { id: "pn4", texto: "Alinhamento e balanceamento" },
                { id: "pn5", texto: "Avaliação de carcaças para recapagem" },
                { id: "pn6", texto: "Conferência do estepe" },
                { id: "pn7", texto: "Ferramentas (macaco, chave de roda)" }
            ]
        },
        {
            titulo: "14. Lubrificação e Engraxamento",
            itens: [
                { id: "lub1", texto: "Pinos da manga de eixo (DT e TS)" },
                { id: "lub2", texto: "Cruzeta do cardã" },
                { id: "lub3", texto: "Pinos de mola (graxeiros)" },
                { id: "lub4", texto: "Eixo cardã (luva deslizante)" },
                { id: "lub5", texto: "Articulações da direção" },
                { id: "lub6", texto: "Dobradiças de porta" },
                { id: "lub7", texto: "Cabos do acelerador e do freio de mão" }
            ]
        },
        {
            titulo: "15. Documentação e Legal",
            itens: [
                { id: "doc1", texto: "Vistoria do Detran (validade)" },
                { id: "doc2", texto: "Licenciamento (validade)" },
                { id: "doc3", texto: "Tacógrafo/cronotacógrafo aferido" },
                { id: "doc4", texto: "Documentação do veículo (CRLV)" },
                { id: "doc5", texto: "Sinalização ESCOLAR (frente e traseira)" },
                { id: "doc6", texto: "Itinerário (escolares)" },
                { id: "doc7", texto: "Validade de gás do A/C" },
                { id: "doc8", texto: "AET - Autorização Especial de Trânsito (se houver)" }
            ]
        }
    ];

    const [statusItens, setStatusItens] = useState<{ [key: string]: string }>({});
    const [obsItens, setObsItens] = useState<{ [key: string]: string }>({});
    const [observacoesGerais, setObservacoesGerais] = useState('');
    const [secaoAtiva, setSecaoAtiva] = useState<number | null>(0);

    const handleCheck = (itemId: string, valor: string) => {
        setStatusItens(prev => ({ ...prev, [itemId]: prev[itemId] === valor ? '' : valor }));
    };

    useEffect(() => {
        if (!revisaoId) return;

        const carregarDadosParaEdicao = async () => {
            setCarregando(true);
            try {
                const { data: cabecalho, error: errCabecalho } = await supabase
                    .from('revisoes_frota')
                    .select('*')
                    .eq('id', revisaoId)
                    .single();

                if (errCabecalho) throw errCabecalho;

                setIdentificacao({
                    placa: cabecalho.placa || '',
                    frotaNo: cabecalho.frota_no || '',
                    marcaModelo: cabecalho.marca_modelo || '',
                    ano: cabecalho.ano || '',
                    quilometragem: cabecalho.quilometragem || '',
                    proxRevisao: cabecalho.prox_revisao_km || '',
                    dataEntrada: cabecalho.data_entrada || '',
                    hora: cabecalho.hora_entrada || '',
                    mecanico: cabecalho.mecanico_responsavel || '',
                    ajudante: cabecalho.ajudante || '',
                    dataSaida: cabecalho.data_saida || ''
                });

                if (cabecalho.observacoes_gerais) {
                    setObservacoesGerais(cabecalho.observacoes_gerais);
                }

                const { data: itensSalvos, error: errItens } = await supabase
                    .from('revisoes_frota_itens')
                    .select('item_id, status_verificacao, observacao')
                    .eq('revisao_id', revisaoId);

                if (errItens) throw errItens;

                const mapaStatus: { [key: string]: string } = {};
                const mapaObs: { [key: string]: string } = {};

                itensSalvos?.forEach(i => {
                    mapaStatus[i.item_id] = i.status_verificacao;
                    if (i.observacao) mapaObs[i.item_id] = i.observacao;
                });

                setStatusItens(mapaStatus);
                setObsItens(mapaObs);

            } catch (err) {
                console.error("Erro ao carregar checklist:", err);
            } finally {
                setCarregando(false);
            }
        };

        carregarDadosParaEdicao();
    }, [revisaoId]);

    const handleAtualizarChecklist = async () => {
        setStatusFeed({ tipo: '', texto: '' });

        if (!identificacao.placa || !identificacao.marcaModelo || !identificacao.dataEntrada || !identificacao.mecanico) {
            setStatusFeed({ tipo: 'erro', texto: 'Por favor, preencha Placa, Modelo, Data de Entrada e Mecânico.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSalvando(true);
        const idNumerico = Number(revisaoId);

        try {
            const { error: errorCabecalho } = await supabase
                .from('revisoes_frota')
                .update({
                    placa: identificacao.placa,
                    frota_no: identificacao.frotaNo || null,
                    marca_modelo: identificacao.marcaModelo,
                    ano: identificacao.ano || null,
                    quilometragem: identificacao.quilometragem || null,
                    prox_revisao_km: identificacao.proxRevisao || null,
                    data_entrada: identificacao.dataEntrada,
                    hora_entrada: identificacao.hora || null,
                    data_saida: identificacao.dataSaida || null,
                    mecanico_responsavel: identificacao.mecanico,
                    ajudante: identificacao.ajudante || null,
                    observacoes_gerais: observacoesGerais || null
                })
                .eq('id', idNumerico);

            if (errorCabecalho) throw errorCabecalho;

            const { error: errorDeletar } = await supabase
                .from('revisoes_frota_itens')
                .delete()
                .eq('revisao_id', idNumerico);

            if (errorDeletar) throw errorDeletar;

            const novosItens = secoes.flatMap(secao =>
                secao.itens
                    .filter(item => statusItens[item.id])
                    .map(item => ({
                        revisao_id: idNumerico,
                        item_id: item.id,
                        status_verificacao: statusItens[item.id],
                        observacao: obsItens[item.id] || null
                    }))
            );

            if (novosItens.length > 0) {
                const { error: errorReinserir } = await supabase
                    .from('revisoes_frota_itens')
                    .upsert(novosItens, { onConflict: 'revisao_id, item_id' });

                if (errorReinserir) throw errorReinserir;
            }

            setStatusFeed({ tipo: 'sucesso', texto: 'Modificações sincronizadas com sucesso!' });

            setTimeout(() => {
                router.push('/dashboard/checklist/lista');
            }, 1500);

        } catch (err: any) {
            console.error("❌ ERRO INTEGRAL:", err);
            setStatusFeed({
                tipo: 'erro',
                texto: err?.message || 'Falha ao sincronizar dados. Verifique o terminal.'
            });
            setSalvando(false);
        }
    };

    if (carregando) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center gap-2 text-[#86868b]">
                <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Buscando Registro...</span>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-orange-500/10">
            <header className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-0.5">
                        <Link href="/dashboard/checklist/lista" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                            ← Voltar à Lista
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Editar Checklist Preventiva</h1>
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Atualização de Laudo Operacional</p>
                    </div>
                    <button
                        onClick={handleAtualizarChecklist}
                        disabled={salvando}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-40"
                    >
                        {salvando ? "Salvando..." : "💾 Salvar Alterações"}
                    </button>
                </div>

                {statusFeed.texto && (
                    <div className={`mt-4 p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                        statusFeed.tipo === 'sucesso' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                        {statusFeed.texto}
                    </div>
                )}
            </header>

            <section className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] mb-6">
                <div className="border-b border-[#f5f5f7] pb-3 mb-4">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest">1. Identificação do Veículo</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold uppercase">
                    <div className="space-y-1">
                        <label className="text-[9px] text-[#86868b]">Placa *</label>
                        <input type="text" placeholder="AAA-0000" value={identificacao.placa} onChange={e => handlePlacaChange(e.target.value)} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2 rounded-lg outline-none font-mono text-xs font-black tracking-wider" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-[#86868b]">Frota nº</label>
                        <input type="text" value={identificacao.frotaNo} onChange={e => setIdentificacao({...identificacao, frotaNo: e.target.value.toUpperCase()})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2 rounded-lg outline-none text-xs" />
                    </div>
                    <div className="space-y-1 col-span-2">
                        <label className="text-[9px] text-[#86868b]">Marca / Modelo *</label>
                        <input type="text" value={identificacao.marcaModelo} onChange={e => setIdentificacao({...identificacao, marcaModelo: e.target.value.toUpperCase()})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2 rounded-lg outline-none text-xs" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-[#86868b]">Ano</label>
                        <input type="text" value={identificacao.ano} onChange={e => setIdentificacao({...identificacao, ano: e.target.value})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2 rounded-lg outline-none text-xs" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-[#86868b]">Quilometragem</label>
                        <input type="text" value={identificacao.quilometragem} onChange={e => setIdentificacao({...identificacao, quilometragem: e.target.value})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2 rounded-lg outline-none text-xs" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-[#86868b]">Próx. Revisão (KM)</label>
                        <input type="text" value={identificacao.proxRevisao} onChange={e => setIdentificacao({...identificacao, proxRevisao: e.target.value})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2 rounded-lg outline-none text-xs" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-[#86868b]">Data Entrada *</label>
                        <input type="date" value={identificacao.dataEntrada} onChange={e => setIdentificacao({...identificacao, dataEntrada: e.target.value})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-1.5 rounded-lg outline-none text-xs font-mono font-bold cursor-pointer" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-[#86868b]">Hora</label>
                        <input type="time" value={identificacao.hora} onChange={e => setIdentificacao({...identificacao, hora: e.target.value})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-1.5 rounded-lg outline-none text-xs font-mono font-bold cursor-pointer" />
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                        <label className="text-[9px] text-[#86868b]">Mecânico Responsável *</label>
                        <input type="text" value={identificacao.mecanico} onChange={e => setIdentificacao({...identificacao, mecanico: e.target.value.toUpperCase()})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2 rounded-lg outline-none text-xs" required />
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                        <label className="text-[9px] text-[#86868b]">Ajudante</label>
                        <input type="text" value={identificacao.ajudante} onChange={e => setIdentificacao({...identificacao, ajudante: e.target.value.toUpperCase()})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-2 rounded-lg outline-none text-xs" />
                    </div>
                </div>
            </section>

            <section className="max-w-4xl mx-auto space-y-4">
                {secoes.map((secao, idxSecao) => (
                    <div key={idxSecao} className="bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setSecaoAtiva(secaoAtiva === idxSecao ? null : idxSecao)}
                            className="w-full text-left bg-[#f5f5f7] sm:bg-white px-5 py-4 flex justify-between items-center outline-none select-none border-b border-[#e5e5ea]"
                        >
                            <div className="leading-tight">
                                <h3 className="text-xs font-black uppercase text-[#1d1d1f] tracking-wider">{secao.titulo}</h3>
                                {secao.textosAdicionais && (
                                    <span className="text-[9px] text-orange-600 font-bold uppercase tracking-wide block mt-0.5">{secao.textosAdicionais}</span>
                                )}
                            </div>
                            <span className="text-xs text-[#86868b] font-bold uppercase">
                                {secaoAtiva === idxSecao ? "Recolher ▲" : "Expandir ▼"}
                            </span>
                        </button>

                        <div className={`${secaoAtiva === idxSecao ? 'block' : 'hidden'} overflow-x-auto`}>
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="bg-[#f5f5f7]/40 border-b border-[#e5e5ea] text-[9px] font-black uppercase tracking-wider text-[#86868b] select-none">
                                    <th className="py-2.5 px-4">Item de Verificação</th>
                                    <th className="py-2.5 px-2 text-center w-12">OK</th>
                                    <th className="py-2.5 px-2 text-center w-12">NOK</th>
                                    <th className="py-2.5 px-2 text-center w-12">TRC</th>
                                    <th className="py-2.5 px-2 text-center w-12">NA</th>
                                    <th className="py-2.5 px-4 w-44 sm:w-56">Observação</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7]">
                                {secao.itens.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#f5f5f7]/20 transition-colors">
                                        <td className="py-2.5 px-4 text-[11px] font-bold text-[#1d1d1f] uppercase leading-tight">{item.texto}</td>
                                        <td className="py-2.5 px-2 text-center">
                                            <button type="button" onClick={() => handleCheck(item.id, 'OK')} className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center font-mono text-[10px] font-black transition-all ${statusItens[item.id] === 'OK' ? 'bg-green-500 border-green-600 text-white' : 'border-[#d2d2d7] bg-[#f5f5f7]'}`}>{statusItens[item.id] === 'OK' ? 'X' : ''}</button>
                                        </td>
                                        <td className="py-2.5 px-2 text-center">
                                            <button type="button" onClick={() => handleCheck(item.id, 'NOK')} className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center font-mono text-[10px] font-black transition-all ${statusItens[item.id] === 'NOK' ? 'bg-red-500 border-red-600 text-white' : 'border-[#d2d2d7] bg-[#f5f5f7]'}`}>{statusItens[item.id] === 'NOK' ? 'X' : ''}</button>
                                        </td>
                                        <td className="py-2.5 px-2 text-center">
                                            <button type="button" onClick={() => handleCheck(item.id, 'TRC')} className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center font-mono text-[10px] font-black transition-all ${statusItens[item.id] === 'TRC' ? 'bg-orange-500 border-orange-600 text-white' : 'border-[#d2d2d7] bg-[#f5f5f7]'}`}>{statusItens[item.id] === 'TRC' ? 'X' : ''}</button>
                                        </td>
                                        <td className="py-2.5 px-2 text-center">
                                            <button type="button" onClick={() => handleCheck(item.id, 'NA')} className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center font-mono text-[10px] font-black transition-all ${statusItens[item.id] === 'NA' ? 'bg-gray-400 border-gray-500 text-white' : 'border-[#d2d2d7] bg-[#f5f5f7]'}`}>{statusItens[item.id] === 'NA' ? 'X' : ''}</button>
                                        </td>
                                        <td className="py-2 px-4">
                                            <input type="text" value={obsItens[item.id] || ''} onChange={e => setObsItens({...obsItens, [item.id]: e.target.value.toUpperCase()})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-2 py-1 rounded text-[10px] font-medium outline-none placeholder-[#b4b4b9]" placeholder="..." />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </section>

            <section className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-4">
                <div className="border-b border-[#f5f5f7] pb-3 mb-3">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest">16. Observações e Itens fora do Checklist</h2>
                </div>
                <textarea rows={4} value={observacoesGerais} onChange={e => setObservacoesGerais(e.target.value.toUpperCase())} placeholder="DIGITE AQUI ANOTAÇÕES COMPLEMENTARES CASO OUTROS COMPONENTES ESTEJAM DANIFICADOS..." className="w-full bg-[#f5f5f7] border border-[#e5e5ea] p-3 rounded-xl text-xs font-semibold outline-none resize-none uppercase" />
            </section>

            <section className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-4 mb-4">
                <div className="border-b border-[#f5f5f7] pb-3 mb-6">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest">17. Encerramento e Assinaturas</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs font-bold uppercase w-full sm:w-1/3 mr-auto">
                    <div className="space-y-1">
                        <label className="text-[9px] text-[#86868b]">Data de Saída</label>
                        <input type="date" value={identificacao.dataSaida} onChange={e => setIdentificacao({...identificacao, dataSaida: e.target.value})} className="w-full bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-1.5 rounded-lg outline-none text-xs font-mono font-bold cursor-pointer" />
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex justify-end items-center gap-3">
                <Link href="/dashboard/checklist/lista" className="text-xs font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors px-2">
                    Cancelar
                </Link>
                <button
                    onClick={handleAtualizarChecklist}
                    disabled={salvando}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 min-w-[150px]"
                >
                    {salvando ? "Sincronizando..." : "💾 Salvar Alterações"}
                </button>
            </div>
        </main>
    );
}

// 2. EXPORTAÇÃO ENVOLVIDA NO SUSPENSE PARA RESOLVER O ERRO DA VERCEL
export default function EditarChecklistPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-widest text-[#86868b]">Carregando Laudo...</div>}>
            <EditarChecklistForm />
        </Suspense>
    );
}