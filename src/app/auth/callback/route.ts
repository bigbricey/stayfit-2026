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
        // Force Next.js to read cookies (Fix for Next.js 14 lazy cookies)
        cookieStore.getAll();

        // 1. Dry Client: Exchange code without persisting cookies yet
        // We do this to get the session object so we can sanitize it
        const supabaseDry = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return []; },
                    setAll() { },
                },
            }
        );

        const { data, error: sessionError } = await supabaseDry.auth.exchangeCodeForSession(code);

        if (!sessionError && data?.session) {
            const session = data.session;

            // 2. Sanitize: Remove massive provider tokens to prevent cookie bloat
            // This manually emulates the "Save provider tokens = OFF" setting
            // @ts-ignore
            delete session.provider_token;
            // @ts-ignore
            delete session.provider_refresh_token;

            console.log('Session sanitized (tokens removed). Persisting clean session.');

            // 3. Real Client: Configured to collect cookies for the response
            // This ensures cookies are set on the redirect response object
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
                            cookiesToSet.push({ name, value, options });
                        },
                        remove(name: string, options: CookieOptions) {
                            cookiesToSet.push({ name, value: '', options: { ...options, maxAge: 0 } });
                        },
                    },
                }
            );

            // 4. Persist the CLEAN session
            await supabase.auth.setSession(session);

            console.log('Session set successfully. Redirecting to:', next);

            // 5. Create Response with 303 Redirect and collected cookies
            // 303 helps with SameSite=Lax issues on redirect
            const response = NextResponse.redirect(`${origin}${next}`, {
                status: 303,
            });

            for (const { name, value, options } of cookiesToSet) {
                // Remove explicit domain to allow browser to handle www/non-www automatically
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
