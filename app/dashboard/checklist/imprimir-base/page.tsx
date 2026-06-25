"use client";
import { useEffect } from 'react';
import Link from 'next/link';

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

export default function ImprimirChecklistBasePage() {
    // Dispara a janela de impressão automaticamente ao carregar
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

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
                { id: "c5", texto: "Inspeção de mangueiras e lines de combustível" },
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

    return (
        <main
            className="min-h-screen bg-white text-black p-4 sm:p-6 md:p-10 font-sans antialiased"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
            {/* BOTÃO DE RETORNO (OCULTO NA IMPRESSÃO) */}
            <div className="max-w-4xl mx-auto mb-4 print:hidden flex justify-between items-center bg-[#f5f5f7] p-4 rounded-xl border border-[#e5e5ea]">
                <span className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wide">Preenchimento Físico Padrão</span>
                <Link href="/dashboard/checklist/lista" className="bg-[#1d1d1f] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                    ← Voltar ao Painel
                </Link>
            </div>

            {/* TOPO / HEADER */}
            <header className="max-w-4xl mx-auto border border-gray-300 p-5 rounded-2xl mb-6 print:border-none print:p-0 print:mb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-0.5">
                        <h1 className="text-xl font-bold tracking-tight text-black">Formulário de Revisão Preventiva Geral</h1>
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Laudo Físico de Inspeção e Campo</p>
                    </div>
                </div>

                {/* LEGENDA */}
                <div className="mt-4 p-3 bg-[#f5f5f7] rounded-xl text-[10px] font-bold uppercase tracking-wide text-gray-500 flex flex-wrap gap-4 border border-gray-300 print:bg-white print:p-1 print:mt-1 print:gap-2 print:text-[8px] print:border-gray-300">
                    <span className="text-black font-black">Mecânico: Marque com um [ X ]</span>
                    <span>🟢 OK = Conforme</span>
                    <span>🔴 NOK = Não Conforme</span>
                    <span>🟠 TRC = Trocado</span>
                    <span>⚪ NA = Não se aplica</span>
                </div>
            </header>

            {/* FORMULÁRIO DE IDENTIFICAÇÃO DO VEÍCULO (LINHAS VAZIAS) */}
            <section className="max-w-4xl mx-auto border border-gray-300 p-6 rounded-2xl mb-6 print:border-gray-300 print:rounded-none print:p-2 print:mb-2">
                <div className="border-b border-gray-300 pb-2 mb-4 print:pb-1 print:mb-2">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest print:text-[10px]">1. Identificação do Veículo</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4 text-xs font-bold uppercase print:gap-x-2 print:gap-y-3 print:text-[10px]">
                    <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Placa:</span>
                        <div className="border-b border-gray-400 h-5 w-full font-mono"></div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Frota nº:</span>
                        <div className="border-b border-gray-400 h-5 w-full"></div>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Marca / Modelo:</span>
                        <div className="border-b border-gray-400 h-5 w-full"></div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Ano:</span>
                        <div className="border-b border-gray-400 h-5 w-full"></div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Quilometragem:</span>
                        <div className="border-b border-gray-400 h-5 w-full"></div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Próx. Revisão (KM):</span>
                        <div className="border-b border-gray-400 h-5 w-full"></div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Data Entrada:</span>
                        <div className="border-b border-gray-400 h-5 w-full font-mono"></div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Hora:</span>
                        <div className="border-b border-gray-400 h-5 w-full font-mono"></div>
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Mecânico Responsável:</span>
                        <div className="border-b border-gray-400 h-5 w-full"></div>
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                        <span className="text-[9px] text-gray-500 block print:text-[8px]">Ajudante:</span>
                        <div className="border-b border-gray-400 h-5 w-full"></div>
                    </div>
                </div>
            </section>

            {/* GRUPO DE TABELAS DO CHECKLIST COMPACTO */}
            <section className="max-w-4xl mx-auto space-y-4 print:space-y-2">
                {secoes.map((secao, idxSecao) => (
                    <div key={idxSecao} className="bg-white border border-gray-300 rounded-2xl overflow-hidden print:border-gray-300 print:rounded-none print:shadow-none print:break-inside-avoid">
                        <div className="w-full bg-gray-100 px-5 py-2 border-b border-gray-300 print:px-2 print:py-1">
                            <h3 className="text-xs font-black uppercase text-black tracking-wider print:text-[9px]">{secao.titulo}</h3>
                            {secao.textosAdicionais && (
                                <span className="text-[9px] text-orange-600 font-bold uppercase tracking-wide block print:text-[7px] print:mt-0">{secao.textosAdicionais}</span>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                <tr className="bg-gray-50 border-b border-gray-300 text-[9px] font-black uppercase tracking-wider text-gray-500 select-none print:border-gray-300 print:text-[8px]">
                                    <th className="py-2 px-4 print:py-1 print:px-2">Item de Verificação</th>
                                    <th className="py-2 px-2 text-center w-12 print:py-1 print:w-8">OK</th>
                                    <th className="py-2 px-2 text-center w-12 print:py-1 print:w-8">NOK</th>
                                    <th className="py-2 px-2 text-center w-12 print:py-1 print:w-8">TRC</th>
                                    <th className="py-2 px-2 text-center w-12 print:py-1 print:w-8">NA</th>
                                    <th className="py-2 px-4 w-44 sm:w-56 print:py-1 print:px-2 print:w-36">Observação</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 print:divide-gray-200">
                                {secao.itens.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 text-[11px] font-bold text-black uppercase leading-tight print:py-0.5 print:px-2 print:text-[9px]">{item.texto}</td>
                                        <td className="py-2 px-2 text-center print:py-0.5">
                                            <div className="w-5 h-5 mx-auto rounded-md border border-gray-400 bg-white print:w-3.5 print:h-3.5" />
                                        </td>
                                        <td className="py-2 px-2 text-center print:py-0.5">
                                            <div className="w-5 h-5 mx-auto rounded-md border border-gray-400 bg-white print:w-3.5 print:h-3.5" />
                                        </td>
                                        <td className="py-2 px-2 text-center print:py-0.5">
                                            <div className="w-5 h-5 mx-auto rounded-md border border-gray-400 bg-white print:w-3.5 print:h-3.5" />
                                        </td>
                                        <td className="py-2 px-2 text-center print:py-0.5">
                                            <div className="w-5 h-5 mx-auto rounded-md border border-gray-400 bg-white print:w-3.5 print:h-3.5" />
                                        </td>
                                        <td className="py-2 px-4 print:py-0.5 print:px-2">
                                            <div className="border-b border-gray-300 h-4 w-full" />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </section>

            {/* SEÇÃO 16: OBSERVAÇÕES GERAIS (LINHAS PARA ESCREVER) */}
            <section className="max-w-4xl mx-auto border border-gray-300 p-6 rounded-2xl mt-4 print:border-gray-300 print:rounded-none print:break-inside-avoid print:p-2 print:mt-2">
                <div className="border-b border-gray-300 pb-2 mb-3 print:pb-1 print:mb-1">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest print:text-[9px]">16. Observações e Itens fora do Checklist</h2>
                </div>
                <div className="space-y-4 pt-2 print:space-y-3 print:pt-1">
                    <div className="border-b border-gray-300 h-5 w-full" />
                    <div className="border-b border-gray-300 h-5 w-full" />
                    <div className="border-b border-gray-300 h-5 w-full" />
                </div>
            </section>

            {/* SEÇÃO 17: ASSINATURAS */}
            <section className="max-w-4xl mx-auto border border-gray-300 p-6 rounded-2xl mt-4 mb-10 print:border-gray-300 print:rounded-none print:break-inside-avoid print:p-2 print:mt-2 print:mb-0">
                <div className="border-b border-gray-300 pb-3 mb-6 print:border-gray-300 print:pb-1 print:mb-4">
                    <h2 className="text-xs font-black uppercase text-orange-600 font-mono tracking-widest print:text-[9px]">17. Encerramento e Assinaturas</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-[10px] font-bold uppercase text-black pt-4 print:gap-2 print:pt-0 print:text-[8px]">
                    <div className="space-y-4 print:space-y-2"><div className="border-b border-black h-6 w-4/5 mx-auto print:h-4" /><p className="text-gray-500 tracking-wider font-mono print:text-black">Mecânico Responsável</p></div>
                    <div className="space-y-4 print:space-y-2"><div className="border-b border-black h-6 w-4/5 mx-auto print:h-4" /><p className="text-gray-500 tracking-wider font-mono print:text-black">Gestor da Oficina</p></div>
                    <div className="space-y-4 print:space-y-2"><div className="border-b border-black h-6 w-4/5 mx-auto print:h-4" /><p className="text-gray-500 tracking-wider font-mono print:text-black">Motorista (Recebimento)</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-gray-200 text-xs font-bold uppercase w-full sm:w-1/3 mr-auto print:border-gray-300 print:mt-4 print:pt-1 print:text-[8px]">
                    <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 block print:text-[7px]">Data de Saída:</span>
                        <div className="border-b border-gray-400 h-4 w-24"></div>
                    </div>
                </div>
            </section>
        </main>
    );
}