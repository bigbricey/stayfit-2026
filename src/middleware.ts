import { NextResponse, type NextRequest } from 'next/server';

// AUTH DISABLED FOR PERSONAL USE
// To re-enable: uncomment Supabase imports and auth checks below

export async function middleware(request: NextRequest) {
    // All routes are public for now
    return NextResponse.next();

    /* 
    // PRESERVED FOR FUTURE AUTH RE-ENABLEMENT
    import { createServerClient, type CookieOptions } from '@supabase/ssr';
    
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const protectedPaths = ['/', '/dashboard'];
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith('/dashboard')
    );

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
    */
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

