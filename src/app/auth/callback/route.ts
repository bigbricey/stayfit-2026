import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Trusted Origin Logic
  const forwardedHost = request.headers.get('x-forwarded-host')
  const origin = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin

  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    // FIX #4: Low-Level Redirect + Debugging
    // We use a dummy response to collect cookies via setAll
    let cookieCount = 0;
    const dummyResponse = NextResponse.next()

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieCount++;
              dummyResponse.cookies.set(name, value, {
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
      // DEBUG: Add cookie count to URL params
      const target = `${origin}${next}?t=${Date.now()}&debug_cookies=${cookieCount}`

      // CRITICAL: Pass the headers (containing Set-Cookie) to the redirect response
      return NextResponse.redirect(target, {
        headers: dummyResponse.headers
      })
    }
  }

  // Return the user to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
