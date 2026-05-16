import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {

    const token = request.cookies.get('access_token')?.value;
    const role = request.cookies.get('role')?.value;

    const { pathname } = request.nextUrl;

    const isPublicPath = pathname === '/login' || pathname === '/register' || pathname === '/';


    if ((!token || !role) && !isPublicPath) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('access_token');
        response.cookies.delete('role');
        return response;
    }
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isPublicPath) {
        const dashboard = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    }

    if (pathname.startsWith('/employee') && role !== 'employee') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};