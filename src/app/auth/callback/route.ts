import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    console.log('[AUTH/CALLBACK] Received callback request')
    console.log('[AUTH/CALLBACK] Code present:', !!code)
    console.log('[AUTH/CALLBACK] Redirect target:', next)

    if (code) {
        const cookieStore = await cookies()

        // Log all cookies for debugging
        const allCookies = cookieStore.getAll()
        console.log('[AUTH/CALLBACK] All cookies:', allCookies.map(c => c.name))

        // Check for code verifier
        const verifierCookie = allCookies.find(c => c.name.includes('code-verifier'))
        console.log('[AUTH/CALLBACK] Code verifier found:', !!verifierCookie)

        // Create server client for exchange
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                console.log('[AUTH/CALLBACK] Setting cookie:', name)
                                cookieStore.set(name, value, options)
                            })
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing user sessions.
                        }
                    },
                },
            }
        )

        // Exchange code for session - this reads the verifier cookie automatically
        console.log('[AUTH/CALLBACK] Exchanging code for session...')
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('[AUTH/CALLBACK] Exchange successful! Redirecting to:', next)
            // Use production URL explicitly
            return NextResponse.redirect(`https://stayfitwithai.com${next}`)
        }

        console.error('[AUTH/CALLBACK] Exchange error:', error.message)
        return NextResponse.redirect(`https://stayfitwithai.com/login?error=${encodeURIComponent(error.message)}`)
    }

    // No code provided
    console.error('[AUTH/CALLBACK] No code in URL')
    return NextResponse.redirect('https://stayfitwithai.com/login?error=no_code')
}
