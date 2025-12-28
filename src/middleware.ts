import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Initialize the response
  // We use "request.headers" to preserve existing headers
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Refresh session only. DO NOT REDIRECT HERE.
  // This ensures the new session token is passed to the browser/server 
  // without interrupting the request flow and causing a loop.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          // Sync cookies to request (for downstream Server Components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          // Sync cookies to response (for Browser to persist)
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This call refreshes the Auth Token if it is expired.
  // We do NOT check for user existence here anymore.
  await supabase.auth.getUser()

  return response
}

export const config = {
  // Exclude static files and the auth callback from middleware to reduce noise and latency
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}