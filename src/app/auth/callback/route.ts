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
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, {
                  ...options,
                  // FIX #3: Force Cookie Scope (Deep Think 2.0)
                  path: '/',
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production',
                })
              )
            } catch {
              // Ignored
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // FIX #2: The Zombie Router Cache (Deep Think 2.0)
      // Add timestamp to force browser to treat this as a NEW navigation
      const forwardedUrl = `${origin}${next}?t=${Date.now()}`

      return NextResponse.redirect(forwardedUrl)
    }
  }

  // Return the user to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
