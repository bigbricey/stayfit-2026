'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState('Processing authentication...')

    useEffect(() => {
        const handleCallback = async () => {
            // With implicit flow, tokens come in the URL hash fragment
            // The Supabase client automatically detects and handles this
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    auth: {
                        flowType: 'implicit',
                        detectSessionInUrl: true,
                        persistSession: true,
                        autoRefreshToken: true,
                    }
                }
            )

            // Check if we have a hash with tokens
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const accessToken = hashParams.get('access_token')

            console.log('[AUTH CALLBACK] Hash params:', {
                hasAccessToken: !!accessToken,
                hash: window.location.hash.substring(0, 50) + '...'
            })

            if (accessToken) {
                // The Supabase client should automatically detect and set the session
                // Give it a moment to process
                await new Promise(resolve => setTimeout(resolve, 500))

                const { data: { session }, error } = await supabase.auth.getSession()

                if (session) {
                    console.log('[AUTH CALLBACK] Session established!')
                    setStatus('Authentication successful! Redirecting...')
                    router.push('/dashboard')
                    return
                }

                if (error) {
                    console.error('[AUTH CALLBACK] Session error:', error.message)
                    setStatus(`Error: ${error.message}`)
                    setTimeout(() => router.push(`/login?error=${encodeURIComponent(error.message)}`), 2000)
                    return
                }
            }

            // Check for error in hash
            const error = hashParams.get('error')
            const errorDescription = hashParams.get('error_description')
            if (error) {
                console.error('[AUTH CALLBACK] OAuth error:', error, errorDescription)
                setStatus(`Error: ${errorDescription || error}`)
                setTimeout(() => router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`), 2000)
                return
            }

            // Check for code in query params (PKCE fallback)
            const code = new URLSearchParams(window.location.search).get('code')
            if (code) {
                console.log('[AUTH CALLBACK] Got code, but using implicit flow - this should not happen')
                setStatus('Unexpected code parameter. Redirecting...')
                setTimeout(() => router.push('/login?error=unexpected_code'), 2000)
                return
            }

            // No tokens, no error, no code - something's wrong
            setStatus('No authentication data received. Redirecting...')
            setTimeout(() => router.push('/login?error=no_auth_data'), 2000)
        }

        handleCallback()
    }, [router])

    return (
        <div className="flex h-screen items-center justify-center bg-black text-white font-mono">
            <div className="text-center space-y-4">
                <div className="h-8 w-8 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                <p className="text-cyan-400 text-sm tracking-wider">{status}</p>
            </div>
        </div>
    )
}
