import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    console.log('[AUTH/CALLBACK] Received request')
    console.log('[AUTH/CALLBACK] Code present:', !!code)
    console.log('[AUTH/CALLBACK] Error:', error, errorDescription)

    const origin = 'https://stayfitwithai.com'

    if (error) {
        console.error('[AUTH/CALLBACK] OAuth error:', error, errorDescription)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`)
    }

    if (!code) {
        console.error('[AUTH/CALLBACK] No code in callback')
        return NextResponse.redirect(`${origin}/login?error=no_code`)
    }

    const cookieStore = await cookies()

    // Log all cookies for debugging
    const allCookies = cookieStore.getAll()
    console.log('[AUTH/CALLBACK] Cookies received:', allCookies.map(c => c.name))

    // Find the code verifier cookie
    const codeVerifierCookie = allCookies.find(c => c.name.includes('code-verifier'))
    console.log('[AUTH/CALLBACK] Code verifier cookie found:', !!codeVerifierCookie)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        console.log('[AUTH/CALLBACK] Setting cookie:', name)
                        cookieStore.set(name, value, {
                            ...options,
                            path: '/',
                            sameSite: 'lax',
                            secure: true,
                        })
                    })
                }
            }
        }
    )

    console.log('[AUTH/CALLBACK] Exchanging code for session...')

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
        console.error('[AUTH/CALLBACK] Exchange error:', exchangeError.message)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    if (!data.session) {
        console.error('[AUTH/CALLBACK] No session returned from exchange')
        return NextResponse.redirect(`${origin}/login?error=no_session`)
    }

    console.log('[AUTH/CALLBACK] Session established! User:', data.session.user.email)
    console.log('[AUTH/CALLBACK] Redirecting to dashboard')

    return NextResponse.redirect(`${origin}/dashboard`)
}
