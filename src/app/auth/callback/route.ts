import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    
    // We need to capturing the cookies that Supabase wants to set,
    // so we can manually attach them to the Redirect Response.
    // This is critical for Next.js 15 + Netlify to ensure persistence.
    const cookiesToSetOnResponse: { name: string; value: string; options: any }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // 1. Set on the request store (standard)
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
            // 2. Capture for the response (fix)
            cookiesToSet.forEach((c) => cookiesToSetOnResponse.push(c))
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocal = origin.includes('localhost')
      
      let redirectUrl = `${origin}${next}`
      if (!isLocal && forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      }

      // Create the redirect response
      const response = NextResponse.redirect(redirectUrl)

      // CRITICAL FIX: Manually apply the captured cookies to the redirect response
      cookiesToSetOnResponse.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_exchange_error`)
}