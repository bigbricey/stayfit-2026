import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// CRITICAL: Force Netlify to run this fresh every time.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    console.log('[AUTH/CALLBACK] ========== SUPABASE SSR VERSION ==========')
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    console.log('[AUTH/CALLBACK] Supabase URL:', supabaseUrl)
    console.log('[AUTH/CALLBACK] API key length:', supabaseKey?.length)
    console.log('[AUTH/CALLBACK] API key starts:', supabaseKey?.substring(0, 15))

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
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
                        // This can be ignored in Server Components
                    }
                },
            },
        }
    )

    // USE THE OFFICIAL SUPABASE METHOD - this handles PKCE internally
    console.log('[AUTH/CALLBACK] Calling exchangeCodeForSession...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error('[AUTH/CALLBACK] exchangeCodeForSession error:', error.message)
        console.error('[AUTH/CALLBACK] Full error:', JSON.stringify(error, null, 2))

        // THE TRAP: Show error as JSON, don't redirect
        return NextResponse.json({
            message: 'Authentication Failed - Code Exchange Error',
            error: error.message,
            details: error,
            hint: 'This uses Supabase official exchangeCodeForSession method',
        }, { status: 400 })
    }

    console.log('[AUTH/CALLBACK] Session exchange successful!')
    console.log('[AUTH/CALLBACK] User ID:', data.session?.user?.id)
    console.log('[AUTH/CALLBACK] Has access_token:', !!data.session?.access_token)

    // SUCCESS - Redirect to dashboard
    console.log('[AUTH/CALLBACK] Redirecting to:', `${requestUrl.origin}${next}`)
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
