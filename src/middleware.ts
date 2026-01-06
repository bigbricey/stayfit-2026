import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log('[Middleware] Path:', request.nextUrl.pathname, 'User:', !!user);

    // 1. Check Approval Status for Authenticated Users
    let isApproved = false;
    if (user) {
        // Special Case: Admin Bypass (The Boss)
        if (user.email === 'bigbricey@gmail.com' || user.email === 'tonygarrett@comcast.net') {
            isApproved = true;
        } else {
            const { data: profile } = await supabase
                .from('users_secure')
                .select('is_approved')
                .eq('id', user.id)
                .single();
            isApproved = !!profile?.is_approved;
        }
        console.log('[Middleware] User Approved:', isApproved);
    }

    // Protect all routes except public ones and Demo Mode
    const isPublic =
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/pending') ||
        request.nextUrl.pathname.startsWith('/public');

    // REDIRECT LOGIC
    if (!user && !isPublic) {
        console.log('[Middleware] Redirect to /login (Not Public + No User)');
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect unapproved users to /pending
    if (user && !isApproved && !isPublic) {
        console.log('[Middleware] Redirect to /pending (User + Unapproved)');
        return NextResponse.redirect(new URL('/pending', request.url))
    }

    // Redirect authenticated & approved users away from login/pending/landing
    // IF THEY ARE HITTING THE LANDING PAGE OR LOGIN, SEND THEM TO CHAT
    if (user && isApproved && (
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/pending')
    )) {
        console.log('[Middleware] Redirect to /chat (Approved User on Splash/Login)');
        return NextResponse.redirect(new URL('/chat', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
