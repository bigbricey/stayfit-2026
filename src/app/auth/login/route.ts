import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    console.log('[AUTH/LOGIN] Server-side OAuth initiation starting')

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        console.log('[AUTH/LOGIN] Setting cookie:', name, 'length:', value.length)
                        cookieStore.set(name, value, {
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

    const origin = 'https://stayfitwithai.com'

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

    console.log('[AUTH/LOGIN] Redirecting to Google OAuth')
    return NextResponse.redirect(data.url)
}
