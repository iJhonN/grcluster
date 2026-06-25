"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

function VisualizarChecklistViewer() {
    const searchParams = useSearchParams();
    const revisaoId = searchParams.get('id');

    const [carregando, setCarregando] = useState(true);
    const [identificacao, setIdentificacao] = useState<any>(null);
    const [statusItens, setStatusItens] = useState<{ [key: string]: string }>({});
    const [obsItens, setObsItens] = useState<{ [key: string]: string }>({});
    const [secaoAtiva, setSecaoAtiva] = useState<number | null>(0);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ESTRUTURA COMPLETA PADRÃO PARA EXIBIÇÃO
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

    useEffect(() => {
        if (!revisaoId) return;

        const carregarDadosRevisao = async () => {
            setCarregando(true);
            try {
                const { data: cabecalho, error: errCabecalho } = await supabase
                    .from('revisoes_frota')
                    .select('*')
                    .eq('id', revisaoId)
                    .single();

                if (errCabecalho) throw errCabecalho;
                setIdentificacao(cabecalho);

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
                console.error("Erro ao carregar auditoria do checklist:", err);
            } finally {
                setCarregando(false);
            }
        };

        carregarDadosRevisao();
    }, [revisaoId]);

    const formatarDataExibicao = (dataStr: string) => {
        if (!dataStr) return '---';
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    if (carregando) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center gap-2 text-[#86868b]">
                <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Buscando Relatório do Pátio...</span>
            </div>
        );
    }

    if (!identificacao) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-6 text-center text-xs font-bold uppercase text-[#86868b]">
                Checklist não localizado ou excluído da base.
                <Link href="/dashboard/checklist/lista" className="mt-4 text-orange-600 font-black">← Voltar à Lista</Link>
            </div>
        );
    }

    return (
        <main
            className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-orange-500/10 print:bg-white print:p-0 print:text-black"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
            <header className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] mb-6 print:border-none print:shadow-none print:p-0 print:mb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                    <div className="space-y-0.5">
                        <Link href="/dashboard/checklist/lista" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                            ← Voltar ao Histórico
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Auditoria de Revisão Geral</h1>
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Modo de Leitura / Histórico do Veículo</p>
                    </div>
                    <button onClick={() => window.print()} className="bg-[#1d1d1f] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">
                        🖨️ Imprimir Laudo
                    </button>
                </div>

                <div className="mt-4 p-3 bg-[#f5f5f7] rounded-xl text-[10px] font-bold uppercase tracking-wide text-[#86868b] flex flex-wrap gap-4 border border-[#e5e5ea] print:bg-white print:p-1 print:mt-1 print:gap-2 print:text-[8px] print:border-gray-300">
                    <span className="text-[#1d1d1f] font-black">Legenda:</span>
                    <span className="text-green-600">🟢 OK = Conforme</span>
                    <span className="text-red-600">🔴 NOK = Não Conforme</span>
                    <span className="text-orange-500">🟠 TRC = Trocado</span>
                    <span className="text-gray-500">⚪ NA = Não se aplica</span>
                </div>
            </header>

            <section className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] mb-6 print:border-gray-300 print:rounded-none print:p-2 print:mb-2">
                <div className="border-b border-[#f5f5f7] pb-3 mb-4 print:border-gray-300 print:pb-1 print:mb-2">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest print:text-[10px]">1. Identificação do Veículo</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold uppercase print:gap-x-2 print:gap-y-1 print:text-[10px]">
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Placa</span>
                        <div className="font-mono text-sm font-black text-orange-600 tracking-wider py-1 print:py-0 print:text-xs">{identificacao.placa}</div>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Frota nº</span>
                        <div className="text-xs font-bold text-[#1d1d1f] py-1 print:py-0">{identificacao.frota_no || '---'}</div>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Marca / Modelo</span>
                        <div className="text-xs font-black text-[#1d1d1f] py-1 print:py-0">{identificacao.marca_modelo}</div>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Ano</span>
                        <div className="text-xs font-medium text-[#1d1d1f] py-1 print:py-0">{identificacao.ano || '---'}</div>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Quilometragem</span>
                        <div className="text-xs font-mono font-bold text-[#1d1d1f] py-1 print:py-0">{identificacao.quilometragem || '---'}</div>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Próx. Revisão (KM)</span>
                        <div className="text-xs font-mono font-bold text-[#1d1d1f] py-1 print:py-0">{identificacao.prox_revisao_km || '---'}</div>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Data Entrada</span>
                        <div className="text-xs font-mono font-bold text-[#1d1d1f] py-1 print:py-0">{formatarDataExibicao(identificacao.data_entrada)}</div>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Hora</span>
                        <div className="text-xs font-mono font-bold text-[#1d1d1f] py-1 print:py-0">{identificacao.hora_entrada || '---'}</div>
                    </div>
                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Mecânico Responsável</span>
                        <div className="text-xs font-bold text-[#1d1d1f] py-1 print:py-0">{identificacao.mecanico_responsavel}</div>
                    </div>
                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                        <span className="text-[9px] text-[#86868b] block print:text-[8px]">Ajudante</span>
                        <div className="text-xs font-bold text-[#1d1d1f] py-1 print:py-0">{identificacao.ajudante || '---'}</div>
                    </div>
                </div>
            </section>

            <section className="max-w-4xl mx-auto space-y-4 print:space-y-2">
                {secoes.map((secao, idxSecao) => (
                    <div key={idxSecao} className="bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden print:border-gray-300 print:rounded-none print:shadow-none print:break-inside-avoid">
                        <button
                            type="button"
                            onClick={() => setSecaoAtiva(secaoAtiva === idxSecao ? null : idxSecao)}
                            className="w-full text-left bg-[#f5f5f7] sm:bg-white px-5 py-4 flex justify-between items-center outline-none select-none border-b border-[#e5e5ea] print:bg-[#f5f5f7] print:border-gray-300 print:px-2 print:py-1"
                        >
                            <div className="leading-tight">
                                <h3 className="text-xs font-black uppercase text-[#1d1d1f] tracking-wider print:text-[9px]">{secao.titulo}</h3>
                                {secao.textosAdicionais && (
                                    <span className="text-[9px] text-orange-600 font-bold uppercase tracking-wide block mt-0.5 print:text-[7px] print:mt-0">{secao.textosAdicionais}</span>
                                )}
                            </div>
                            <span className="text-xs text-[#86868b] font-bold uppercase print:hidden">
                                {secaoAtiva === idxSecao ? "Recolher ▲" : "Expandir ▼"}
                            </span>
                        </button>

                        <div className={`${secaoAtiva === idxSecao ? 'block' : 'hidden'} print:block overflow-x-auto`}>
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="bg-[#f5f5f7]/40 border-b border-[#e5e5ea] text-[9px] font-black uppercase tracking-wider text-[#86868b] select-none print:border-gray-300 print:text-[8px]">
                                    <th className="py-2.5 px-4 print:py-1 print:px-2">Item de Verificação</th>
                                    <th className="py-2.5 px-2 text-center w-12 print:py-1 print:w-8">OK</th>
                                    <th className="py-2.5 px-2 text-center w-12 print:py-1 print:w-8">NOK</th>
                                    <th className="py-2.5 px-2 text-center w-12 print:py-1 print:w-8">TRC</th>
                                    <th className="py-2.5 px-2 text-center w-12 print:py-1 print:w-8">NA</th>
                                    <th className="py-2.5 px-4 w-44 sm:w-56 print:py-1 print:px-2 print:w-36">Observação</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7] print:divide-gray-200">
                                {secao.itens.map((item) => {
                                    const marcado = statusItens[item.id] || '';
                                    return (
                                        <tr key={item.id} className="hover:bg-[#f5f5f7]/20 transition-colors">
                                            <td className="py-2.5 px-4 text-[11px] font-bold text-[#1d1d1f] uppercase leading-tight print:py-0.5 print:px-2 print:text-[9px]">{item.texto}</td>
                                            <td className="py-2.5 px-2 text-center print:py-0.5">
                                                <div className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center font-mono text-[10px] font-black print:w-3.5 print:h-3.5 print:text-[8px] ${marcado === 'OK' ? 'bg-green-500 border-green-600 text-white' : 'border-[#e5e5ea] bg-[#f5f5f7]/40 text-transparent print:border-gray-300 print:bg-[#f5f5f7]'}`}>{marcado === 'OK' ? 'X' : ''}</div>
                                            </td>
                                            <td className="py-2.5 px-2 text-center print:py-0.5">
                                                <div className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center font-mono text-[10px] font-black print:w-3.5 print:h-3.5 print:text-[8px] ${marcado === 'NOK' ? 'bg-red-500 border-red-600 text-white' : 'border-[#e5e5ea] bg-[#f5f5f7]/40 text-transparent print:border-gray-300 print:bg-[#f5f5f7]'}`}>{marcado === 'NOK' ? 'X' : ''}</div>
                                            </td>
                                            <td className="py-2.5 px-2 text-center print:py-0.5">
                                                <div className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center font-mono text-[10px] font-black print:w-3.5 print:h-3.5 print:text-[8px] ${marcado === 'TRC' ? 'bg-orange-500 border-orange-600 text-white' : 'border-[#e5e5ea] bg-[#f5f5f7]/40 text-transparent print:border-gray-300 print:bg-[#f5f5f7]'}`}>{marcado === 'TRC' ? 'X' : ''}</div>
                                            </td>
                                            <td className="py-2.5 px-2 text-center print:py-0.5">
                                                <div className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center font-mono text-[10px] font-black print:w-3.5 print:h-3.5 print:text-[8px] ${marcado === 'NA' ? 'bg-gray-400 border-gray-500 text-white' : 'border-[#e5e5ea] bg-[#f5f5f7]/40 text-transparent print:border-gray-300 print:bg-[#f5f5f7]'}`}>{marcado === 'NA' ? 'X' : ''}</div>
                                            </td>
                                            <td className="py-2.5 px-4 font-mono text-[11px] font-bold text-slate-700 uppercase print:py-0.5 print:px-2 print:text-[8px]">
                                                {obsItens[item.id] || '---'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </section>

            <section className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-4 print:border-gray-300 print:rounded-none print:break-inside-avoid print:p-2 print:mt-2">
                <div className="border-b border-[#f5f5f7] pb-3 mb-3 print:border-gray-300 print:pb-1 print:mb-1">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest print:text-[9px]">16. Observações e Itens fora do Checklist</h2>
                </div>
                <div className="w-full bg-[#f5f5f7] p-3 rounded-xl text-xs font-bold text-[#1d1d1f] uppercase whitespace-pre-wrap min-h-[60px] border border-[#e5e5ea] print:bg-white print:border-gray-300 print:p-1 print:min-h-[40px] print:text-[9px]">
                    {identificacao.observacoes_gerais || "NENHUMA ANOTAÇÃO COMPLEMENTAR REGISTRADA NESTA VISTORIA."}
                </div>
            </section>

            <section className="max-w-4xl mx-auto bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] mt-4 mb-10 print:border-gray-300 print:rounded-none print:break-inside-avoid print:p-2 print:mt-2 print:mb-0">
                <div className="border-b border-[#f5f5f7] pb-3 mb-6 print:border-gray-300 print:pb-1 print:mb-4">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest print:text-[9px]">17. Encerramento e Assinaturas</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-[10px] font-bold uppercase text-[#1d1d1f] pt-4 print:gap-2 print:pt-0 print:text-[8px]">
                    <div className="space-y-4 print:space-y-2"><div className="border-b border-[#1d1d1f] h-6 w-4/5 mx-auto print:border-black print:h-4" /><p className="text-[#86868b] tracking-wider font-mono print:text-black">Mecânico Responsável</p></div>
                    <div className="space-y-4 print:space-y-2"><div className="border-b border-[#1d1d1f] h-6 w-4/5 mx-auto print:border-black print:h-4" /><p className="text-[#86868b] tracking-wider font-mono print:text-black">Gestor da Oficina</p></div>
                    <div className="space-y-4 print:space-y-2"><div className="border-b border-[#1d1d1f] h-6 w-4/5 mx-auto print:border-black print:h-4" /><p className="text-[#86868b] tracking-wider font-mono print:text-black">Motorista (Recebimento)</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-[#f5f5f7] text-xs font-bold uppercase w-full sm:w-1/3 mr-auto print:border-gray-300 print:mt-4 print:pt-1 print:text-[8px]">
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-[#86868b] block print:text-[7px]">Data de Saída</span>
                        <div className="text-xs font-mono font-bold text-[#1d1d1f] py-1 print:py-0 print:text-[8px]">{formatarDataExibicao(identificacao.data_saida)}</div>
                    </div>
                </div>
            </section>
        </main>
    );
}

// === EXPORTAÇÃO ENVOLVIDA NO SUSPENSE PARA RESOLVER O ERRO DA VERCEL ===
export default function VisualizarChecklistPageWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-widest text-[#86868b]">Carregando Laudo...</div>}>
            <VisualizarChecklistViewer />
        </Suspense>
    );
}