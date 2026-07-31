import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    let response = NextResponse.next({ request });

    // 1. Instancia o Supabase adequado para ambientes de Edge/Middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        }
    );

    // 2. Recupera a sessão do usuário logado de forma segura
    const { data: { user } } = await supabase.auth.getUser();

    // Se o usuário tentar acessar qualquer painel interno sem estar logado, joga pro login
    if (!user) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Busca o cargo do usuário diretamente na tabela do banco
    const { data: perfil } = await supabase
        .from('usuarios_painel')
        .select('cargo')
        .eq('id', user.id)
        .maybeSingle();

    const cargo = perfil?.cargo?.toUpperCase() || 'MECANICO';

    // ─── REGRA EXCLUSIVA DO ESTOQUE REQUISITADA PELO JHON ───
    // Se for ESTOQUE, barra se tentar acessar qualquer rota que não seja o próprio painel de estoque ou a home do dashboard
    if (cargo === 'ESTOQUE') {
        if (pathname !== '/dashboard' && !pathname.startsWith('/dashboard/estoque')) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // ─── REGRA EXCLUSIVA DO SUPERVISOR DE ESTOQUE ───
    // Libera: /dashboard, /dashboard/estoque (e subrotas), /dashboard/ferramentas/retirada e /dashboard/ponto (inclui pausas e emergência)
    const isSupervisorEstoque = cargo === 'SUPERVISOR_ESTOQUE' || cargo === 'SUPERVISOR ESTOQUE' || cargo === 'SUPERVISORESTOQUE';
    if (isSupervisorEstoque) {
        const rotasPermitidas = [
            '/dashboard',
            '/dashboard/estoque',
            '/dashboard/ferramentas/retirada',
            '/dashboard/ponto',
        ];

        const possuiAcesso = rotasPermitidas.some((rota) =>
            pathname === rota || pathname.startsWith(`${rota}/`)
        );

        if (!possuiAcesso) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // ─── REGRA EXCLUSIVA DO AUX GERENTE ───
    // Aceita 'AUX_GERENTE', 'AUX GERENTE' ou 'AUXGERENTE' para evitar problemas com formatação no banco
    const isAuxGerente = cargo === 'AUX_GERENTE' || cargo === 'AUX GERENTE' || cargo === 'AUXGERENTE';
    if (isAuxGerente) {
        const rotasPermitidas = [
            '/dashboard',
            '/dashboard/funcionarios',
            '/dashboard/rh/atestados',
            '/dashboard/fechamento',
            '/dashboard/ponto/atrasos',
            '/dashboard/ponto/emergencia',
        ];

        const possuiAcesso = rotasPermitidas.some((rota) =>
            pathname === rota || pathname.startsWith(`${rota}/`)
        );

        if (!possuiAcesso) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // ─── MATRIZ DE SEGURANÇA REQUISITADA PELO JHON ───

    // Regra da Central de Auditoria e Logs (Apenas ADMIN)
    if (pathname.startsWith('/dashboard/rh/logs')) {
        const autorizados = ['ADMIN'];
        if (!autorizados.includes(cargo)) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // Regra do RH e Cadastro de Usuários (Admin, Gerente e Auxiliar de Gerente para atestados)
    if (pathname.startsWith('/dashboard/rh')) {
        const autorizados = ['ADMIN', 'GERENTE', 'AUX_GERENTE', 'AUX GERENTE', 'AUXGERENTE'];
        if (!autorizados.includes(cargo)) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // Regra do Fechamento Contábil (Admin, Gerente e Auxiliar de Gerente)
    if (pathname.startsWith('/dashboard/fechamento')) {
        const autorizados = ['ADMIN', 'GERENTE', 'AUX_GERENTE', 'AUX GERENTE', 'AUXGERENTE'];
        if (!autorizados.includes(cargo)) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // Regra de Funcionários (Admin, Gerente, Gestor de Frotas e Auxiliar de Gerente)
    if (pathname.startsWith('/dashboard/funcionarios')) {
        const autorizados = ['ADMIN', 'GERENTE', 'GESTORDEFROTAS', 'AUX_GERENTE', 'AUX GERENTE', 'AUXGERENTE'];
        if (!autorizados.includes(cargo)) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // Regra de Frotas, Combustível, Rotas e Médias (Admin, Gerente e Gestor de Frotas)
    if (pathname.startsWith('/dashboard/frota')) {
        const autorizados = ['ADMIN', 'GERENTE', 'GESTORDEFROTAS'];
        if (!autorizados.includes(cargo)) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // Regra do Ponto Geral e Totem de Ponto (Admin, Gerente, Técnico, Gestor de Frotas, Auxiliar de Gerente e Supervisor de Estoque)
    if (pathname.startsWith('/dashboard/ponto')) {
        const autorizados = [
            'ADMIN', 'GERENTE', 'TECNICO', 'GESTORDEFROTAS',
            'AUX_GERENTE', 'AUX GERENTE', 'AUXGERENTE',
            'SUPERVISOR_ESTOQUE', 'SUPERVISOR ESTOQUE', 'SUPERVISORESTOQUE'
        ];
        if (!autorizados.includes(cargo)) {
            return NextResponse.redirect(new URL('/dashboard?erro=privilegio', request.url));
        }
    }

    // Nota: As rotas de ferramentas (/dashboard/ferramentas) estão liberadas
    // para todos os demais cargos. O Estoque, Supervisor de Estoque e Aux Gerente já foram filtrados no topo do middleware.

    return response;
}

// Configura o filtro de quais caminhos o Next.js deve monitorar
export const config = {
    matcher: [
        '/dashboard/:path*'
    ],
};