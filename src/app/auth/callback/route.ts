import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Force dynamic to ensure fresh execution on every callback
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // ============= TRACER BULLET =============
  // TEMPORARY: Uncomment to verify this route is being hit
  return NextResponse.redirect('https://stayfitwithai.com/login?tracer=callback_hit')
  // ==========================================

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // INVISIBLE VARIABLE #1 FIX: The Protocol Lie
  // Trust Netlify's forwarded host to ensure we stay on HTTPS
  const forwardedHost = request.headers.get('x-forwarded-host')
  const origin = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin

  if (code) {
    const cookieStore = await cookies()

    // Capture cookies to manually set them on the 200 response
    const cookiesToSet: { name: string; value: string; options: any }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookies: { name: string; value: string; options: any }[]) {
            cookies.forEach(({ name, value, options }) => {
              // 1. Set in internal store (standard)
              cookieStore.set(name, value, options)
              // 2. Capture for the "HTML Bridge" response
              cookiesToSet.push({ name, value, options })
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // DIAGNOSTIC: Log the exchange result
    console.log('[AUTH CALLBACK] Exchange result:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: error?.message
    })

    if (!error && data.session) {
      // INVISIBLE VARIABLE #2 FIX: The Zombie Cache
      // Add a timestamp to the redirect URL. This forces the Next.js Router 
      // to treat this as a NEW navigation, ignoring the cached "Redirect to Login" instruction.
      const targetUrl = `${origin}${next}?t=${Date.now()}`

      // NUCLEAR FIX: Return HTML (200 OK) instead of Redirect (307)
      // This forces the browser to "stop and save cookies" before navigating.
      const response = new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta http-equiv="refresh" content="0;url=${targetUrl}" />
            <title>Redirecting...</title>
          </head>
          <body>
            <script>
              // Hard navigation clears the Router Cache
              window.location.replace("${targetUrl}");
            </script>
          </body>
        </html>
        `,
        {
          status: 200, // <--- CRITICAL: 200 OK ensures Netlify passes headers
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )

      // Manually Apply Cookies to the 200 Response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set({
          name,
          value,
          ...options,
          path: '/',        // Force root path scope
          sameSite: 'lax',  // Force Lax to allow redirection flow
          secure: process.env.NODE_ENV === 'production',
        })
      })

      return response
    }

    // Exchange failed - redirect with error details
    const errorMsg = encodeURIComponent(error?.message || 'exchange_failed_no_session')
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}`)
  }

  // Fallback for errors - include error details
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`)
}

