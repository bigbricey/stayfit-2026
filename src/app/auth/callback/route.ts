import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // FIX #1: The Protocol Lie (Deep Think 2.0)
  // Trust the 'x-forwarded-host' header from Netlify over request.url to FORCE https://
  const forwardedHost = request.headers.get('x-forwarded-host')
  const origin = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin

  // Default to dashboard if no 'next' param
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    // FIX #3: Deep Think 3.0 "Manual Relay"
    // Create the response object UP FRONT so we can attach cookies to it.
    // We add the timestamp busting here too.
    const forwardedUrl = `${origin}${next}?t=${Date.now()}`
    const response = NextResponse.redirect(forwardedUrl)

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // READ from the incoming request (so Supabase can find the Code Verifier)
          getAll() {
            return cookieStore.getAll()
          },
          // WRITE to the outgoing response (so Browser gets the Session Token)
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }
  }

  // Return the user to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
