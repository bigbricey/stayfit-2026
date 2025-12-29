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

        // Detailed value logging to diagnose quote/encoding issues
        if (verifierCookie) {
            const v = verifierCookie.value
            console.log('[AUTH/CALLBACK] Verifier value length:', v.length)
            console.log('[AUTH/CALLBACK] Verifier first char:', v.charAt(0), 'code:', v.charCodeAt(0))
            console.log('[AUTH/CALLBACK] Verifier last char:', v.charAt(v.length - 1), 'code:', v.charCodeAt(v.length - 1))
            console.log('[AUTH/CALLBACK] Starts with quote:', v.startsWith('"'))
            console.log('[AUTH/CALLBACK] Ends with quote:', v.endsWith('"'))
            console.log('[AUTH/CALLBACK] Starts with %22:', v.startsWith('%22'))
            console.log('[AUTH/CALLBACK] Sample value:', v.substring(0, 20) + '...')
        }

        // Create server client for exchange
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        // Strip quotes and decode URL encoding from cookie values
                        // This fixes the "PKCE code verifier not found" issue
                        const processed = cookieStore.getAll().map(cookie => {
                            let value = cookie.value
                            const originalValue = value
                            // Decode URL encoding first
                            try {
                                value = decodeURIComponent(value)
                            } catch {
                                // Value wasn't URL encoded
                            }
                            // Strip leading/trailing quotes
                            value = value.replace(/^"|"$/g, '')

                            if (cookie.name.includes('code-verifier')) {
                                console.log('[AUTH/CALLBACK] getAll processing verifier:')
                                console.log('[AUTH/CALLBACK]   Original:', originalValue.substring(0, 30) + '...')
                                console.log('[AUTH/CALLBACK]   Processed:', value.substring(0, 30) + '...')
                                console.log('[AUTH/CALLBACK]   Still has quotes:', value.startsWith('"'))
                            }
                            return { ...cookie, value }
                        })
                        return processed
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
