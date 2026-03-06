import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
    const isAuthPage = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register';
    const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');

    // Proteção 1: Loggado não pode acessar login ou cadastro
    if (isAuthPage) {
        if (req.auth) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
    }

    // Proteção 2: Não logado não pode acessar dashboard
    if (isDashboardPage && !req.auth) {
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};
