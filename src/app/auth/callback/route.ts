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
        cookieStore.getAll();

        // We need to collect cookies that Supabase wants to set
        // and then apply them to the redirect response
        const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // Collect cookies to set on the response
                        cookiesToSet.push({ name, value, options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookiesToSet.push({ name, value: '', options: { ...options, maxAge: 0 } });
                    },
                },
            }
        );

        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (!sessionError) {
            console.log('Session exchange successful, redirecting to:', next);

            // 🚨 CRITICAL FIX: Use status 303 to avoid SameSite=Lax issues on redirect
            const response = NextResponse.redirect(`${origin}${next}`, {
                status: 303,
            });

            // Set all cookies on the redirect response
            // We can trust the store now because we forced it to load early
            // and we collected the Supabase sets
            for (const { name, value, options } of cookiesToSet) {
                // Remove explicit domain to allow browser to handle www/non-www
                const cookieOptions = {
                    ...options,
                    domain: undefined,
                };
                response.cookies.set(name, value, cookieOptions);
            }

            return response;
        }

        console.error('Session exchange error:', sessionError);
    }

    // Return user to login page on error
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
