import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Use native redirect, which ensures headers are flushed correctly
      // in Next.js 15 App Router
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocal = origin.includes('localhost')
      
      let redirectUrl = `${origin}${next}`
      if (!isLocal && forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      }
      
      redirect(redirectUrl)
    }
  }

  redirect(`${origin}/login?error=auth_error`)
}