import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('redirect') || '/';
    const error = searchParams.get('error');

    if (error) {
        console.error('OAuth provider returned error:', error);
        return NextResponse.redirect(`${origin}/login?error=${error}`);
    }

    if (code) {
        const cookieStore = await cookies();
        // Force Next.js to read cookies (Fix for Next.js 14 lazy cookies / PKCE)
        cookieStore.getAll();

        // PHASE 1: Exchange Code (We collect cookies but will DISCARD them)
        // These cookies contain the massive provider_token that breaks the browser
        const fatCookies: { name: string; value: string; options: CookieOptions }[] = [];

        const supabaseExchange = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        fatCookies.push({ name, value, options });
                    },
                    remove(name: string, options: CookieOptions) {
                        fatCookies.push({ name, value: '', options: { ...options, maxAge: 0 } });
                    },
                },
            }
        );

        const { data, error: sessionError } = await supabaseExchange.auth.exchangeCodeForSession(code);

        console.log('Exchange result:', {
            hasData: !!data,
            hasSession: !!data?.session,
            errorMessage: sessionError?.message,
            errorName: sessionError?.name
        });

        if (!sessionError && data?.session) {
            const session = data.session;

            // PHASE 2: Sanitize Session (Remove the bloat)
            // @ts-ignore
            if (session.provider_token) delete session.provider_token;
            // @ts-ignore
            if (session.provider_refresh_token) delete session.provider_refresh_token;
            // @ts-ignore
            if (session.user?.app_metadata?.provider_token) delete session.user.app_metadata.provider_token;

            console.log('Session sanitized (tokens removed). Fat cookies ignored:', fatCookies.length);

            // PHASE 3: Persist CLEANED Session (Collect THESE cookies)
            const cleanCookies: { name: string; value: string; options: CookieOptions }[] = [];

            const supabasePersist = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        get(name: string) {
                            return cookieStore.get(name)?.value;
                        },
                        set(name: string, value: string, options: CookieOptions) {
                            cleanCookies.push({ name, value, options });
                        },
                        remove(name: string, options: CookieOptions) {
                            cleanCookies.push({ name, value: '', options: { ...options, maxAge: 0 } });
                        },
                    },
                }
            );

            // This triggers setAll with the STRIPPED session
            await supabasePersist.auth.setSession(session);

            console.log('Clean session set. Clean cookies:', cleanCookies.length, 'Redirecting to:', next);

            // PHASE 4: Build Response with ONLY the clean cookies
            const response = NextResponse.redirect(`${origin}${next}`, {
                status: 303,
            });

            for (const { name, value, options } of cleanCookies) {
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

    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
