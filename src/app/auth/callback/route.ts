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

        // Find and clean the code verifier cookie
        const verifierCookie = allCookies.find(c => c.name.includes('code-verifier'))

        if (!verifierCookie) {
            console.error('[AUTH/CALLBACK] No verifier cookie found!')
            return NextResponse.redirect('https://stayfitwithai.com/login?error=no_verifier_cookie')
        }

        // Clean the verifier value (remove URL encoding and quotes)
        let cleanVerifier = verifierCookie.value
        console.log('[AUTH/CALLBACK] Original verifier:', cleanVerifier.substring(0, 30) + '...')

        try {
            cleanVerifier = decodeURIComponent(cleanVerifier)
        } catch {
            // Not URL encoded
        }

        // Strip quotes
        if (cleanVerifier.startsWith('"') && cleanVerifier.endsWith('"')) {
            cleanVerifier = cleanVerifier.slice(1, -1)
        }
        console.log('[AUTH/CALLBACK] Cleaned verifier:', cleanVerifier.substring(0, 30) + '...')

        // MANUAL TOKEN EXCHANGE - bypass the SDK's broken cookie reading
        console.log('[AUTH/CALLBACK] Performing MANUAL token exchange')

        // Use form-urlencoded as per Supabase Auth API spec
        const tokenBody = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            code_verifier: cleanVerifier,
        })

        const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
            body: tokenBody.toString(),
        })

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text()
            console.error('[AUTH/CALLBACK] Token exchange failed:', tokenResponse.status, errorText)
            return NextResponse.redirect(`https://stayfitwithai.com/login?error=${encodeURIComponent(errorText)}`)
        }

        const tokens = await tokenResponse.json()
        console.log('[AUTH/CALLBACK] Token exchange successful!')
        console.log('[AUTH/CALLBACK] Got access_token:', !!tokens.access_token)
        console.log('[AUTH/CALLBACK] Got refresh_token:', !!tokens.refresh_token)

        // Now create a Supabase client and set the session with the tokens we got
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
                            // Ignore
                        }
                    },
                },
            }
        )

        // Set the session with our manually obtained tokens
        const { error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        })

        if (error) {
            console.error('[AUTH/CALLBACK] setSession error:', error.message)
            return NextResponse.redirect(`https://stayfitwithai.com/login?error=${encodeURIComponent(error.message)}`)
        }

        console.log('[AUTH/CALLBACK] Session set successfully! Redirecting to:', next)

        // Delete the verifier cookie since we're done with it
        try {
            cookieStore.delete(verifierCookie.name)
        } catch {
            // Ignore
        }

        return NextResponse.redirect(`https://stayfitwithai.com${next}`)
    }

    // No code provided
    console.error('[AUTH/CALLBACK] No code in URL')
    return NextResponse.redirect('https://stayfitwithai.com/login?error=no_code')
}
