import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('redirect') || '/';
    const error = searchParams.get('error');

    // If OAuth provider returned an error
    if (error) {
        console.error('OAuth provider returned error:', error);
        return NextResponse.redirect(`${origin}/login?error=${error}`);
    }

    if (code) {
        const cookieStore = await cookies();

        // 🚨 CRITICAL FIX: Force Next.js to read cookies before Supabase needs them
        // This prevents the "code verifier missing" error in Next.js 14 lazy cookie handling
        cookieStore.getAll();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value, ...options });
                        } catch (error) {
                            // Handle cookies in edge cases or when response is already sent
                        }
                    },
                    remove(name: string, options: CookieOptions) {
                        try {
                            cookieStore.delete({ name, ...options });
                        } catch (error) {
                            // Handle cookies in edge cases
                        }
                    },
                },
            }
        );

        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (!sessionError) {
            console.log('Session exchange successful, redirecting to:', next);
            return NextResponse.redirect(`${origin}${next}`);
        }

        console.error('Session exchange error:', sessionError);
    }

    // Return user to login page on error
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
