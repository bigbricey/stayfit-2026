'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signInWithGoogle() {
    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get('host') || '';

    // Force explicit production URL to rule out 'x-forwarded-host' issues
    const baseUrl = host.includes('localhost')
        ? 'http://localhost:3000'
        : 'https://stayfitwithai.com'; // HARDCODED FIX

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${baseUrl}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) {
        console.error('OAuth error:', error);
        redirect('/login?error=oauth_init_failed');
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function signInWithEmail(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirect') as string || '/dashboard';

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    redirect(redirectTo);
}

export async function signUp(formData: FormData) {
    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get('host') || '';

    // Force explicit production URL to rule out 'x-forwarded-host' issues
    const baseUrl = host.includes('localhost')
        ? 'http://localhost:3000'
        : 'https://stayfitwithai.com'; // HARDCODED FIX

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${baseUrl}/auth/callback`,
        },
    });

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/signup?message=Check your email to confirm your account');
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
