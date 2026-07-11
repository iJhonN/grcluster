"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface MaletaItem {
    id: string;
    nome: string;
    quantidade: number;
    status: string; // 'ok' | 'ausente' | 'danificado'
}

interface Maleta {
    id: string;
    identificacao: string;
    observacoes: string | null;
    ultima_auditoria: string | null;
    foto_url: string | null; // ADICIONADO NO INTERFACE
    funcionarios: {
        nome: string;
        sobrenome: string;
    };
}

export default function MaletaChecklistPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [maleta, setMaleta] = useState<Maleta | null>(null);
    const [itens, setItens] = useState<MaletaItem[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        if (!id) return;
        const carregarDados = async () => {
            try {
                // INCLUÍDO O FOTO_URL NO SELECT ABAIXO
                const { data: maletaData, error: errMaleta } = await supabase
                    .from('maletas')
                    .select('id, identificacao, observacoes, ultima_auditoria, foto_url, funcionarios(nome, sobrenome)')
                    .eq('id', id)
                    .single();

                if (errMaleta) throw errMaleta;
                setMaleta(maletaData as unknown as Maleta);

                const { data: itensData, error: errItens } = await supabase
                    .from('maleta_itens')
                    .select('*')
                    .eq('maleta_id', id)
                    .order('nome');

                if (errItens) throw errItens;
                setItens((itensData as MaletaItem[]).map(i => ({ ...i, status: i.status || 'ok' })));
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                alert("Não foi possível carregar o inventário desta maleta.");
                router.push('/dashboard/ferramentas/maletas');
            } finally {
                setCarregando(false);
            }
        };
        carregarDados();
    }, [id, supabase, router]);

    const handleAlterarStatus = (itemId: string, novoStatus: string) => {
        setItens(prev => prev.map(item =>
            item.id === itemId ? { ...item, status: novoStatus } : item
        ));
    };

    const handleSalvarAuditoria = async () => {
        setSalvando(true);
        try {
            for (const item of itens) {
                const { error } = await supabase
                    .from('maleta_itens')
                    .update({ status: item.status })
                    .eq('id', item.id);
                if (error) throw error;
            }

            const { error: errMaleta } = await supabase
                .from('maletas')
                .update({ ultima_auditoria: new Date().toISOString() })
                .eq('id', id);

            if (errMaleta) throw errMaleta;

            alert("Checklist de auditoria salvo com sucesso!");
            router.push('/dashboard/ferramentas/maletas');
        } catch (error) {
            console.error("Erro ao salvar auditoria:", error);
            alert("Ocorreu um erro ao gravar a auditoria.");
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) {
        return (
            <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-[#86868b] uppercase tracking-widest font-bold">Carregando Checklist...</span>
                </div>
            </main>
        );
    }

    if (!maleta) return null;

    const qtdOk = itens.filter(i => i.status === 'ok').length;
    const qtdFaltando = itens.filter(i => i.status === 'ausente').length;
    const qtdDanificado = itens.filter(i => i.status === 'danificado').length;

    return (
        <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] p-4 sm:p-6 md:p-10 font-sans antialiased flex flex-col items-center">

            <div className="w-full max-w-4xl mt-4 sm:mt-8 flex flex-col gap-6">

                {/* CABEÇALHO COM PREVISUALIZAÇÃO DA FOTO */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-[#e5e5ea] pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 w-full md:w-auto">

                        {/* BOX DA FOTO */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-[#e5e5ea] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            {maleta.foto_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={maleta.foto_url} alt="Foto da Maleta" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl opacity-30 select-none">🧰</span>
                            )}
                        </div>

                        {/* TEXTOS INFORMATIVOS */}
                        <div className="min-w-0">
                            <Link href="/dashboard/ferramentas/maletas" className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] hover:text-[#1d1d1f] transition-colors block mb-1">
                                ← Voltar para Lista
                            </Link>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] leading-tight truncate">
                                Auditoria: {maleta.identificacao}
                            </h1>
                            <p className="text-xs font-bold text-[#007aff] uppercase tracking-wide mt-1">
                                👤 {maleta.funcionarios?.nome} {maleta.funcionarios?.sobrenome}
                            </p>
                        </div>
                    </div>

                    {/* CONTADORES */}
                    <div className="bg-white border border-[#e5e5ea] px-4 py-3 rounded-xl flex gap-6 shadow-[0_1px_2px_rgba(0,0,0,0.01)] w-full md:w-auto shrink-0 justify-around">
                        <div className="text-center">
                            <span className="block text-lg font-black text-[#34c759] leading-none">{qtdOk}</span>
                            <span className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">OK</span>
                        </div>
                        <div className="w-px bg-[#e5e5ea]"></div>
                        <div className="text-center">
                            <span className="block text-lg font-black text-[#ff3b30] leading-none">{qtdFaltando}</span>
                            <span className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Faltas</span>
                        </div>
                        <div className="w-px bg-[#e5e5ea]"></div>
                        <div className="text-center">
                            <span className="block text-lg font-black text-[#ff9500] leading-none">{qtdDanificado}</span>
                            <span className="text-[9px] font-bold uppercase text-[#86868b] tracking-wider">Avarias</span>
                        </div>
                    </div>
                </header>

                {/* LISTA DE CHECKLIST */}
                <div className="bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
                    <div className="p-4 sm:p-6 bg-[#f5f5f7] border-b border-[#e5e5ea] flex justify-between items-center">
                        <h3 className="text-xs font-black text-[#1d1d1f] uppercase tracking-widest">
                            Relação de Ferramentas ({itens.length})
                        </h3>
                    </div>

                    <ul className="divide-y divide-[#f5f5f7]">
                        {itens.length === 0 ? (
                            <li className="p-8 text-center text-xs text-[#86868b] font-medium uppercase tracking-wide">
                                Nenhum item cadastrado nesta maleta.
                            </li>
                        ) : (
                            itens.map((item) => (
                                <li key={item.id} className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#f5f5f7]/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-black text-[#1d1d1f] bg-[#e5e5ea] px-2 py-1 rounded text-xs">
                                            {item.quantidade}x
                                        </span>
                                        <span className="font-bold text-[#1d1d1f] text-sm uppercase">{item.nome}</span>
                                    </div>

                                    {/* CONTROLES DE STATUS */}
                                    <div className="flex bg-[#f5f5f7] p-1 rounded-lg border border-[#e5e5ea] w-full md:w-auto">
                                        <button
                                            onClick={() => handleAlterarStatus(item.id, 'ok')}
                                            className={`flex-1 md:w-24 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                item.status === 'ok'
                                                    ? 'bg-white text-[#34c759] shadow-sm border border-[#e5e5ea]'
                                                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                                            }`}
                                        >
                                            ✅ OK
                                        </button>
                                        <button
                                            onClick={() => handleAlterarStatus(item.id, 'ausente')}
                                            className={`flex-1 md:w-24 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                item.status === 'ausente'
                                                    ? 'bg-white text-[#ff3b30] shadow-sm border border-[#e5e5ea]'
                                                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                                            }`}
                                        >
                                            ❌ Falta
                                        </button>
                                        <button
                                            onClick={() => handleAlterarStatus(item.id, 'danificado')}
                                            className={`flex-1 md:w-24 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                item.status === 'danificado'
                                                    ? 'bg-white text-[#ff9500] shadow-sm border border-[#e5e5ea]'
                                                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                                            }`}
                                        >
                                            ⚠️ Avaria
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex justify-end gap-3 pb-10">
                    <button
                        onClick={handleSalvarAuditoria}
                        disabled={salvando || itens.length === 0}
                        className="w-full sm:w-auto bg-[#1d1d1f] active:bg-black text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 shadow-md flex justify-center"
                    >
                        {salvando ? 'Gravando Auditoria...' : 'Concluir Checklist e Salvar'}
                    </button>
                </div>

            </div>
        </main>
    );
}