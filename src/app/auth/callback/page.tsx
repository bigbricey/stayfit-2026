'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState('Processing authentication...')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            console.log('[CALLBACK] Starting callback processing')
            console.log('[CALLBACK] Full URL:', window.location.href)
            console.log('[CALLBACK] Hash:', window.location.hash)
            console.log('[CALLBACK] Search:', window.location.search)

            // Check for implicit flow tokens in hash FIRST
            const hash = window.location.hash.substring(1)
            if (hash) {
                console.log('[CALLBACK] Found hash fragment, parsing tokens')
                const hashParams = new URLSearchParams(hash)
                const accessToken = hashParams.get('access_token')
                const refreshToken = hashParams.get('refresh_token')
                const tokenType = hashParams.get('token_type')

                console.log('[CALLBACK] Token type:', tokenType)
                console.log('[CALLBACK] Access token present:', !!accessToken)
                console.log('[CALLBACK] Refresh token present:', !!refreshToken)

                if (accessToken && refreshToken) {
                    console.log('[CALLBACK] Setting session with tokens')
                    setStatus('Establishing session...')

                    // Use the SSR browser client to set the session (syncs to cookies)
                    const supabase = createBrowserClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    )

                    const { data, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    })

                    if (sessionError) {
                        console.error('[CALLBACK] setSession error:', sessionError.message)
                        setError(sessionError.message)
                        return
                    }

                    if (data.session) {
                        console.log('[CALLBACK] Session established via implicit flow:', data.session.user.email)
                        setStatus('Login successful! Redirecting...')

                        // Clear the hash from URL for cleanliness
                        window.history.replaceState(null, '', '/auth/callback')

                        // Navigate to dashboard
                        setTimeout(() => router.push('/dashboard'), 500)
                        return
                    }
                }
            }

            // Check for PKCE code in query params (fallback)
            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get('code')

            if (code) {
                console.log('[CALLBACK] Found PKCE code, attempting exchange')
                setStatus('Exchanging authorization code...')

                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                )

                const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

                if (exchangeError) {
                    console.error('[CALLBACK] Exchange error:', exchangeError.message)
                    setError(exchangeError.message)
                    return
                }

                if (data.session) {
                    console.log('[CALLBACK] Session established via PKCE:', data.session.user.email)
                    setStatus('Login successful! Redirecting...')
                    setTimeout(() => router.push('/dashboard'), 100)
                    return
                }
            }

            // No auth data found - wait a moment for detectSessionInUrl
            console.log('[CALLBACK] No immediate auth data, waiting for auto-detection...')
            setStatus('Detecting session...')

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    auth: {
                        detectSessionInUrl: true,
                        flowType: 'implicit'
                    }
                }
            )

            // Wait for session detection
            await new Promise(resolve => setTimeout(resolve, 1000))

            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                console.log('[CALLBACK] Session detected via auto-detection:', session.user.email)
                setStatus('Login successful! Redirecting...')
                setTimeout(() => router.push('/dashboard'), 100)
                return
            }

            // Still no auth data
            console.error('[CALLBACK] No authentication data found')
            setError('No authentication data received. Please try logging in again.')
        }

        handleCallback()
    }, [router])

    return (
        <div className="flex h-screen items-center justify-center bg-black text-white font-mono">
            <div className="relative w-full max-w-2xl h-[600px] border border-cyan-900/50 bg-gray-950/80 shadow-[0_0_50px_-12px_rgba(8,145,178,0.3)] backdrop-blur-md flex flex-col rounded-sm overflow-hidden">

                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-cyan-900/50 bg-black/40 px-4 py-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                        <span className="text-xs font-bold tracking-widest text-cyan-500/90 uppercase">AUTHENTICATING</span>
                    </div>
                    <div className="text-[10px] text-cyan-700/70">v11.0.0-IMPLICIT</div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    {error ? (
                        <div className="text-center space-y-4">
                            <div className="text-red-500 text-xl font-bold">Authentication Failed</div>
                            <div className="text-red-400/70 text-sm max-w-md">{error}</div>
                            <button
                                onClick={() => router.push('/login')}
                                className="mt-4 px-6 py-2 bg-cyan-950/30 border border-cyan-500/30 text-cyan-100 hover:bg-cyan-900/40 transition-all"
                            >
                                Return to Login
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <div className="text-cyan-400 text-sm">{status}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
