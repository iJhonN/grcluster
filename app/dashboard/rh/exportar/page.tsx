"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ExportacaoContabilPage() {
    // Configurações do arquivo de exportação
    const [codigoEmpresa, setCodigoEmpresa] = useState('11');
    const [tipoProcesso, setTipoProcesso] = useState('11');
    const [competenciaMes, setCompetenciaMes] = useState(new Date().getMonth() + 1);
    const [competenciaAno, setCompetenciaAno] = useState(new Date().getFullYear());

    // Mapeamento "De/Para" dos eventos contábeis
    const [eventos, setEventos] = useState({
        horaExtraDiurna: '37',
        horaExtraNoturna: '38',
        insalubridade: '16',
        periculosidade: '149',
        faltasAtrasos: '200'
    });

    const [gerando, setGerando] = useState(false);

    // Função que formata os dados exatamente no leiaute do PDF da Domínio Sistemas
    const gerarLinhaTxt = (
        codEmpregado: string,
        mes: number,
        ano: number,
        codEvento: string,
        tipoProc: string,
        valor: number,
        empresa: string
    ) => {
        // 1. Código Empregado: 5 posições (ex: "00088")
        const emp = String(codEmpregado).padStart(5, '0').slice(0, 5);

        // 2. Competência: 6 posições "AAAAMM" (ex: "202605")
        const comp = `${ano}${String(mes).padStart(2, '0')}`;

        // 3. Código do Evento: 4 posições (ex: "0037")
        const ev = String(codEvento).padStart(4, '0').slice(0, 4);

        // 4. Tipo do Processo: 2 posições (ex: "11")
        const tp = String(tipoProc).padStart(2, '0').slice(0, 2);

        // 5. Valor: 9 posições, sem vírgula, com 2 casas decimais (ex: 33.33 -> "000003333")
        const valorFormatado = Math.round(valor * 100);
        const val = String(valorFormatado).padStart(9, '0').slice(0, 9);

        // 6. Empresa: 10 posições (ex: "0000000011")
        const empCod = String(empresa).padStart(10, '0').slice(0, 10);

        // Retorna a linha completa (36 caracteres)
        return `${emp}${comp}${ev}${tp}${val}${empCod}`;
    };

    const handleGerarExportacao = async () => {
        setGerando(true);
        try {
            // AQUI ENTRARIA A BUSCA NO SUPABASE:
            // const { data: pontos } = await supabase.from('pontos')...
            // Como exemplo, estou simulando o array que seria gerado após os cálculos do relatório

            const lancamentosSimulados = [
                { codEmpregado: '6', valorExtra: 33.33 }, // José Brito
                { codEmpregado: '12', valorExtra: 15.50 }, // Weliton
                { codEmpregado: '27', valorExtra: 120.00 } // Jose Anderson
            ];

            let conteudoArquivo = '';

            // Varre os funcionários calculados e monta as linhas
            lancamentosSimulados.forEach(lancamento => {
                const linhaHoraExtra = gerarLinhaTxt(
                    lancamento.codEmpregado,
                    competenciaMes,
                    competenciaAno,
                    eventos.horaExtraDiurna,
                    tipoProcesso,
                    lancamento.valorExtra,
                    codigoEmpresa
                );

                conteudoArquivo += linhaHoraExtra + '\n';
            });

            // Cria o arquivo Blob em memória
            const blob = new Blob([conteudoArquivo], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            // Força o download no navegador
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Dominio_Eventos_${competenciaAno}_${String(competenciaMes).padStart(2, '0')}.txt`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Erro ao gerar arquivo:", error);
            alert("Falha ao gerar o arquivo de exportação.");
        } finally {
            setGerando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased">
            <div className="w-full max-w-4xl mx-auto space-y-6">

                {/* CABEÇALHO */}
                <header className="space-y-1.5 pl-1 border-b border-[#e5e5ea] pb-5">
                    <Link href="/dashboard/rh" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block">
                        ← Módulo de RH
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Integração Contábil
                    </h1>
                    <p className="text-xs text-[#86868b] font-medium">
                        Configuração de eventos e geração de leiaute TXT (Domínio Sistemas).
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                    {/* COLUNA 1: DADOS GERAIS */}
                    <div className="bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-5">
                        <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider border-b border-[#f5f5f7] pb-2">
                            Parâmetros do Arquivo
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Mês (Competência)</label>
                                <input
                                    type="number" min="1" max="12"
                                    value={competenciaMes}
                                    onChange={e => setCompetenciaMes(Number(e.target.value))}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg text-sm font-bold text-[#1d1d1f] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Ano (Competência)</label>
                                <input
                                    type="number" min="2020" max="2100"
                                    value={competenciaAno}
                                    onChange={e => setCompetenciaAno(Number(e.target.value))}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg text-sm font-bold text-[#1d1d1f] outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Cód. Empresa</label>
                                <input
                                    type="text"
                                    value={codigoEmpresa}
                                    onChange={e => setCodigoEmpresa(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg text-sm font-bold text-[#1d1d1f] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#86868b] tracking-wider ml-0.5">Tipo Processo</label>
                                <input
                                    type="text"
                                    value={tipoProcesso}
                                    onChange={e => setTipoProcesso(e.target.value)}
                                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] focus:border-[#b4b4b9] px-3 py-2 rounded-lg text-sm font-bold text-[#1d1d1f] outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* COLUNA 2: DE/PARA DE EVENTOS */}
                    <div className="bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-5">
                        <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider border-b border-[#f5f5f7] pb-2">
                            Mapeamento de Eventos (De/Para)
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-semibold text-[#1d1d1f]">Hora Extra (Diurna)</label>
                                <input
                                    type="text" value={eventos.horaExtraDiurna}
                                    onChange={e => setEventos({...eventos, horaExtraDiurna: e.target.value})}
                                    className="w-20 bg-[#f5f5f7] border border-[#e5e5ea] px-2 py-1.5 rounded-md text-xs font-mono font-bold text-center outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-semibold text-[#1d1d1f]">Hora Extra (Noturna)</label>
                                <input
                                    type="text" value={eventos.horaExtraNoturna}
                                    onChange={e => setEventos({...eventos, horaExtraNoturna: e.target.value})}
                                    className="w-20 bg-[#f5f5f7] border border-[#e5e5ea] px-2 py-1.5 rounded-md text-xs font-mono font-bold text-center outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-semibold text-[#1d1d1f]">Desconto (Faltas/Atrasos)</label>
                                <input
                                    type="text" value={eventos.faltasAtrasos}
                                    onChange={e => setEventos({...eventos, faltasAtrasos: e.target.value})}
                                    className="w-20 bg-[#f5f5f7] border border-[#e5e5ea] px-2 py-1.5 rounded-md text-xs font-mono font-bold text-center outline-none text-red-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTÃO DE AÇÃO */}
                <div className="bg-white border border-[#e5e5ea] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] text-[#86868b] font-medium leading-relaxed max-w-md">
                        O arquivo será gerado cruzando os apontamentos do banco de dados com as rubricas configuradas acima. O formato gerado é puramente posicional `.txt`.
                    </p>
                    <button
                        onClick={handleGerarExportacao}
                        disabled={gerando}
                        className="w-full sm:w-auto bg-[#1d1d1f] hover:bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                    >
                        {gerando ? 'Processando Arquivo...' : 'Gerar e Baixar TXT'}
                    </button>
                </div>

            </div>
        </main>
    );
}