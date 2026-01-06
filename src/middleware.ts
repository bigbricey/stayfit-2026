import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Environment variable validation (Const Guard pattern)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}
if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Type-safe validated values
const SUPABASE_URL: string = supabaseUrl;
const SUPABASE_ANON_KEY: string = supabaseAnonKey;

// Production-safe logging (suppressed in production unless explicitly enabled)
const isLoggingEnabled = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';
const log = (...args: unknown[]) => { if (isLoggingEnabled) console.log(...args); };

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    log('[Middleware] Path:', request.nextUrl.pathname, 'User:', !!user);

    // 1. Check Approval Status for Authenticated Users (Strict DB Audit)
    let isApproved = false;
    if (user) {
        const { data: profile } = await supabase
            .from('users_secure')
            .select('is_approved')
            .eq('id', user.id)
            .single();
        isApproved = !!profile?.is_approved;
        log('[Middleware] User:', user.email, 'Approved:', isApproved);
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
        log('[Middleware] Redirect to /login (Not Public + No User)');
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect unapproved users to /pending
    if (user && !isApproved && !isPublic) {
        log('[Middleware] Redirect to /pending (User + Unapproved)');
        return NextResponse.redirect(new URL('/pending', request.url))
    }

    // Redirect authenticated & approved users away from login/pending/landing
    // IF THEY ARE HITTING THE LANDING PAGE OR LOGIN, SEND THEM TO CHAT
    if (user && isApproved && (
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/pending')
    )) {
        log('[Middleware] Redirect to /chat (Approved User on Splash/Login)');
        return NextResponse.redirect(new URL('/chat', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
