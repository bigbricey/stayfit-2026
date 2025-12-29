import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                // Use PKCE flow (default)
                flowType: 'pkce',
                // Store session in localStorage
                persistSession: true,
                // Debug mode
                debug: true,
            },
        }
    );
}
