import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Trusted Origin Logic
  const forwardedHost = request.headers.get('x-forwarded-host')
  const origin = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin

  const next = requestUrl.searchParams.get('next') || '/dashboard'

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
      const target = `${origin}${next}?t=${Date.now()}&auth=success`

      // FIX #5: Explicit Cookie Copying
      // Instead of passing headers (which can be flaky with multiple Set-Cookie),
      // we create the response object and manually copy the cookies over.
      const response = NextResponse.redirect(target)

      // Copy all cookies set by Supabase (access_token, refresh_token, etc.)
      dummyResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie)
      })

      return response
    }
  }

  // Return the user to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error_tracer_failed`)
}
