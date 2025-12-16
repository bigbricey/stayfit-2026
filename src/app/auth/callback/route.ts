import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const redirect = searchParams.get('redirect') || '/';

    // Log incoming request for debugging
    console.log('Auth callback received:', {
        hasCode: !!code,
        error,
        errorDescription,
        origin
    });

    // If OAuth provider returned an error
    if (error) {
        console.error('OAuth provider error:', error, errorDescription);
        return NextResponse.redirect(`${origin}/login?error=${error}`);
    }

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch (e) {
                            console.error('Failed to set cookies:', e);
                        }
                    },
                },
            }
        );

        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (!sessionError) {
            console.log('Session exchange successful, redirecting to:', redirect);
            return NextResponse.redirect(`${origin}${redirect}`);
        }

        console.error('Session exchange error:', sessionError);
    }

    // Return user to login page on error
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
