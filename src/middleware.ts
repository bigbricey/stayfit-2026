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

    // 1. Check Approval Status for Authenticated Users
    let isApproved = false;
    if (user) {
        // Special Case: Admin Bypass (The Boss)
        if (user.email === 'bigbricey@gmail.com') {
            isApproved = true;
        } else {
            const { data: profile } = await supabase
                .from('users_secure')
                .select('is_approved')
                .eq('id', user.id)
                .single();
            isApproved = !!profile?.is_approved;
        }
    }

    // Protect all routes except public ones and Demo Mode
    const isPublic =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/api/chat') ||
        request.nextUrl.pathname.startsWith('/pending') ||
        request.nextUrl.pathname.startsWith('/public');

    // REDIRECT LOGIC
    if (!user && !isPublic) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect unapproved users to /pending
    if (user && !isApproved && !isPublic) {
        return NextResponse.redirect(new URL('/pending', request.url))
    }

    // Redirect authenticated & approved users away from login/pending
    if (user && isApproved && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/pending'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
