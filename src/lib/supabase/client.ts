import { createBrowserClient } from '@supabase/ssr'

// Validate environment variables at module load time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
}

// These are now guaranteed to be strings after the check above
const url: string = supabaseUrl
const key: string = supabaseAnonKey

export function createClient() {
    return createBrowserClient(url, key)
}
