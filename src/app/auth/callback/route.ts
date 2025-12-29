import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// CRITICAL: Force Netlify to run this fresh every time.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    console.log('[AUTH/CALLBACK] ========== SHARED CLIENT VERSION ==========')
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

    // Use the shared server client utility
    const supabase = await createClient()

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
            hint: 'This uses Supabase official exchangeCodeForSession method with shared server client',
        }, { status: 400 })
    }

    console.log('[AUTH/CALLBACK] Session exchange successful!')
    console.log('[AUTH/CALLBACK] User ID:', data.session?.user?.id)
    console.log('[AUTH/CALLBACK] Has access_token:', !!data.session?.access_token)

    // SUCCESS - Redirect to dashboard
    console.log('[AUTH/CALLBACK] Redirecting to:', `${requestUrl.origin}${next}`)
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
