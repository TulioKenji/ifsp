import { NextResponse } from 'next/server';8
import type { NextRequest } from 'next/server';

const authenticatedPaths = [
    '/home',
]

export function proxy(request: NextRequest) {
    const cookies = request.cookies;
    const pathname = request.nextUrl.pathname;
    const authToken = cookies.get('authToken')?.value;

    if(authenticatedPaths.includes(pathname) && (!authToken || authToken === 'undefined')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}


export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}