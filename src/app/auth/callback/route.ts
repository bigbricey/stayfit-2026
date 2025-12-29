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

        // Find and FIX the code verifier cookie BEFORE creating Supabase client
        const verifierCookie = allCookies.find(c => c.name.includes('code-verifier'))

        if (verifierCookie) {
            let cleanValue = verifierCookie.value
            console.log('[AUTH/CALLBACK] Original verifier value:', cleanValue.substring(0, 30) + '...')

            // Decode URL encoding first
            try {
                cleanValue = decodeURIComponent(cleanValue)
                console.log('[AUTH/CALLBACK] After URL decode:', cleanValue.substring(0, 30) + '...')
            } catch {
                console.log('[AUTH/CALLBACK] URL decode failed, using original')
            }

            // Strip leading/trailing quotes
            if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                cleanValue = cleanValue.slice(1, -1)
                console.log('[AUTH/CALLBACK] After quote strip:', cleanValue.substring(0, 30) + '...')
            }

            // Overwrite the cookie with the cleaned value directly in the cookie store
            console.log('[AUTH/CALLBACK] Overwriting cookie with cleaned value')
            try {
                cookieStore.set(verifierCookie.name, cleanValue, {
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax'
                })
                console.log('[AUTH/CALLBACK] Cookie overwritten successfully')
            } catch (e) {
                console.error('[AUTH/CALLBACK] Failed to overwrite cookie:', e)
            }
        } else {
            console.log('[AUTH/CALLBACK] No verifier cookie found')
        }

        // Create server client for exchange AFTER fixing the cookie
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        // Return cookies as-is now since we already cleaned the verifier
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
                        }
                    },
                },
            }
        )

        // Exchange code for session
        console.log('[AUTH/CALLBACK] Exchanging code for session...')
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('[AUTH/CALLBACK] Exchange successful! Redirecting to:', next)
            return NextResponse.redirect(`https://stayfitwithai.com${next}`)
        }

        console.error('[AUTH/CALLBACK] Exchange error:', error.message)
        return NextResponse.redirect(`https://stayfitwithai.com/login?error=${encodeURIComponent(error.message)}`)
    }

    // No code provided
    console.error('[AUTH/CALLBACK] No code in URL')
    return NextResponse.redirect('https://stayfitwithai.com/login?error=no_code')
}
