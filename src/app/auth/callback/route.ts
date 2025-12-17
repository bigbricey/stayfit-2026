import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// VERSION: 2025-12-17-v2 - Debug build with URL params
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('redirect') ?? '/dashboard';
    const errorParam = searchParams.get('error');

    // If no code, redirect to login with debug info
    if (!code) {
        const reason = errorParam ? `oauth_error_${errorParam}` : 'no_code';
        return NextResponse.redirect(`${origin}/login?error=${reason}&v=2`);
    }

    try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();

        // Check for PKCE code verifier
        const hasCodeVerifier = allCookies.some(c => c.name.includes('code_verifier'));
        const cookieNames = allCookies.map(c => c.name).join(',');

        if (!hasCodeVerifier) {
            // Debug: redirect showing cookie state
            const debugInfo = encodeURIComponent(`no_verifier|cookies:${cookieNames.substring(0, 100)}`);
            return NextResponse.redirect(`${origin}/login?error=missing_verifier&debug=${debugInfo}&v=2`);
        }

        // Create response object first (needed for setting cookies)
        const response = NextResponse.redirect(`${origin}${next}`);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        });
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            // Return error details in URL
            const errorInfo = encodeURIComponent(`${error.message}|${error.status || 'no_status'}`);
            return NextResponse.redirect(`${origin}/login?error=exchange_failed&detail=${errorInfo}&v=2`);
        }

        if (!data?.session) {
            return NextResponse.redirect(`${origin}/login?error=no_session&v=2`);
        }

        // Success! Return with cookies set
        return response;

    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'unknown';
        const errorInfo = encodeURIComponent(errorMsg.substring(0, 100));
        return NextResponse.redirect(`${origin}/login?error=exception&detail=${errorInfo}&v=2`);
    }
}
