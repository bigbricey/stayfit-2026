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

        // 1. CLIENT A: THE EXCHANGER (Read-Only)
        // ✅ CRITICAL: Must return actual cookies so it can find the PKCE Code Verifier
        // 🛑 CRITICAL: 'setAll' is empty to stop the massive 'provider_token' from being set early
        const supabaseExchanger = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        // SILENTLY IGNORE: Do not set cookies here.
                        // We block the "fat" session from touching the response.
                    },
                },
            }
        );

        const { data, error: sessionError } = await supabaseExchanger.auth.exchangeCodeForSession(code);

        if (!sessionError && data?.session) {
            const session = data.session;

            // 2. SANITIZE: Strip the massive provider tokens
            // This brings the payload size down from ~4KB+ to ~1KB, fixing the browser drop issue
            // @ts-ignore
            if (session.provider_token) delete session.provider_token;
            // @ts-ignore
            if (session.provider_refresh_token) delete session.provider_refresh_token;
            // @ts-ignore
            if (session.user?.app_metadata?.provider_token) delete session.user.app_metadata.provider_token;

            console.log('Session sanitized (tokens removed). Persisting clean session.');

            // 3. Create Response with 303 Redirect
            // 303 helps with SameSite=Lax issues on redirect
            const response = NextResponse.redirect(`${origin}${next}`, {
                status: 303,
            });

            // 4. CLIENT B: THE PERSISTER (Write-Only)
            // This client will trigger `setAll` using the sanitized session object
            const supabasePersister = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() { return cookieStore.getAll() },
                        setAll(cookiesToSet) {
                            // Now we write the *clean* cookies to the response
                            cookiesToSet.forEach(({ name, value, options }) => {
                                // Defaulting domain to undefined ensures it works on www and non-www
                                const cookieOptions = {
                                    ...options,
                                    domain: undefined,
                                };
                                response.cookies.set(name, value, cookieOptions);
                            });
                        },
                    },
                }
            );

            // 5. Manually set the session
            // This calculates the cookies (handling chunking if needed) and writes them to `response`
            await supabasePersister.auth.setSession(session);

            console.log('Clean session set successfully. Redirecting to:', next);
            return response;
        }

        console.error('Session exchange error:', sessionError);
    }

    // Return user to login page on error
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
