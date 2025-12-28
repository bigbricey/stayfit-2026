import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    console.log('[AUTH/LOGIN] Server-side OAuth initiation starting')

    const cookieStore = await cookies()
    const origin = 'https://stayfitwithai.com'

    // Create a response object to hold cookies
    const response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        console.log('[AUTH/LOGIN] Setting cookie:', name, 'length:', value.length)
                        // Set on both the cookieStore AND the response object
                        response.cookies.set(name, value, {
                            ...options,
                            path: '/',
                            sameSite: 'lax',
                            secure: true,
                        })
                    })
                }
            }
        }
    )

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        }
    })

    if (error) {
        console.error('[AUTH/LOGIN] signInWithOAuth error:', error.message)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (!data.url) {
        console.error('[AUTH/LOGIN] No OAuth URL returned')
        return NextResponse.redirect(`${origin}/login?error=no_oauth_url`)
    }

    console.log('[AUTH/LOGIN] Cookies to transfer:', response.cookies.getAll().map(c => c.name))

    // CRITICAL: Create redirect response and TRANSFER cookies from the dummy response
    const redirectResponse = NextResponse.redirect(data.url)
    response.cookies.getAll().forEach((cookie) => {
        console.log('[AUTH/LOGIN] Transferring cookie to redirect:', cookie.name)
        redirectResponse.cookies.set(cookie)
    })

    console.log('[AUTH/LOGIN] Redirecting to Google OAuth with transferred cookies')
    return redirectResponse
}
