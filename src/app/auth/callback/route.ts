import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// CRITICAL: Force Netlify to run this fresh every time.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    console.log('[AUTH/CALLBACK] ========== DEBUG VERSION ==========')
    console.log('[AUTH/CALLBACK] Full URL:', request.url)
    console.log('[AUTH/CALLBACK] Origin:', requestUrl.origin)
    console.log('[AUTH/CALLBACK] Code present:', !!code)

    if (!code) {
        // THE TRAP: Show error as JSON, don't redirect
        return NextResponse.json({
            message: 'Authentication Failed - No Code',
            error: 'No authorization code in URL',
            url: request.url,
        }, { status: 400 })
    }

    const cookieStore = await cookies()

    // Log all cookies for debugging
    const allCookies = cookieStore.getAll()
    console.log('[AUTH/CALLBACK] All cookies:', allCookies.map(c => c.name))

    // Find the code verifier cookie
    const verifierCookie = allCookies.find(c => c.name.includes('code-verifier'))

    if (!verifierCookie) {
        // THE TRAP: Show error as JSON, don't redirect
        return NextResponse.json({
            message: 'Authentication Failed - No Verifier Cookie',
            error: 'PKCE code verifier cookie not found',
            cookies_found: allCookies.map(c => c.name),
            hint: 'This usually means www vs non-www domain mismatch, or cookies were blocked',
        }, { status: 400 })
    }

    // Clean the verifier value
    let cleanVerifier = verifierCookie.value
    console.log('[AUTH/CALLBACK] Original verifier (first 20):', cleanVerifier.substring(0, 20))

    try {
        cleanVerifier = decodeURIComponent(cleanVerifier)
    } catch {
        // Not URL encoded
    }

    // Strip quotes
    if (cleanVerifier.startsWith('"') && cleanVerifier.endsWith('"')) {
        cleanVerifier = cleanVerifier.slice(1, -1)
    }
    console.log('[AUTH/CALLBACK] Cleaned verifier (first 20):', cleanVerifier.substring(0, 20))

    // MANUAL TOKEN EXCHANGE
    console.log('[AUTH/CALLBACK] Performing MANUAL token exchange')
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

    console.log('[AUTH/CALLBACK] API key length:', apiKey.length)
    console.log('[AUTH/CALLBACK] API key starts:', apiKey.substring(0, 15))
    console.log('[AUTH/CALLBACK] API key ends:', apiKey.substring(apiKey.length - 15))
    console.log('[AUTH/CALLBACK] Supabase URL:', supabaseUrl)

    const tokenBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        code_verifier: cleanVerifier,
    })

    const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': apiKey,
        },
        body: tokenBody.toString(),
    })

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('[AUTH/CALLBACK] Token exchange failed:', tokenResponse.status, errorText)

        // THE TRAP: Show error as JSON, don't redirect
        return NextResponse.json({
            message: 'Authentication Failed - Token Exchange Error',
            status: tokenResponse.status,
            error: errorText,
            hint: 'Check if the code was already used (invalid_grant) or verifier mismatch',
        }, { status: 400 })
    }

    const tokens = await tokenResponse.json()
    console.log('[AUTH/CALLBACK] Token exchange successful!')
    console.log('[AUTH/CALLBACK] Got access_token:', !!tokens.access_token)
    console.log('[AUTH/CALLBACK] Got refresh_token:', !!tokens.refresh_token)

    // Create Supabase client and set the session
    const supabase = createServerClient(
        supabaseUrl,
        apiKey,
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

    // Set the session
    const { error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
    })

    if (error) {
        console.error('[AUTH/CALLBACK] setSession error:', error.message)

        // THE TRAP: Show error as JSON, don't redirect
        return NextResponse.json({
            message: 'Authentication Failed - Session Error',
            error: error.message,
            details: error,
        }, { status: 400 })
    }

    console.log('[AUTH/CALLBACK] Session set successfully!')

    // Delete the verifier cookie
    try {
        cookieStore.delete(verifierCookie.name)
    } catch {
        // Ignore
    }

    // SUCCESS - Use requestUrl.origin to stay on same domain
    console.log('[AUTH/CALLBACK] Redirecting to:', `${requestUrl.origin}${next}`)
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
