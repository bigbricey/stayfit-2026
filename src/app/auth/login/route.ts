import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    console.log('[AUTH LOGIN] Server-side OAuth initiation starting')

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
                        console.log('[AUTH LOGIN] Setting cookie:', name)
                        cookieStore.set(name, value, options)
                    })
                }
            }
        }
    )

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://stayfitwithai.com/auth/callback'
        }
    })

    console.log('[AUTH LOGIN] signInWithOAuth result:', {
        hasUrl: !!data?.url,
        error: error?.message
    })

    if (error || !data.url) {
        console.error('[AUTH LOGIN] Failed:', error?.message || 'No URL returned')
        return NextResponse.redirect('https://stayfitwithai.com/login?error=oauth_init_failed')
    }

    console.log('[AUTH LOGIN] Redirecting to Google OAuth')
    return NextResponse.redirect(data.url)
}
