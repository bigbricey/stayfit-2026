'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

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

            // Create client with detectSessionInUrl to auto-hydrate from hash
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    auth: {
                        detectSessionInUrl: true,
                        flowType: 'implicit',
                        persistSession: true,
                        autoRefreshToken: true
                    }
                }
            )

            // Listen for auth state changes
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('[CALLBACK] Auth state change:', event, session?.user?.email)

                if (event === 'SIGNED_IN' && session) {
                    setStatus('Login successful! Redirecting...')
                    // Clear the hash from URL
                    window.history.replaceState(null, '', '/auth/callback')
                    setTimeout(() => router.push('/dashboard'), 500)
                }
            })

            // Wait a moment for auto-detection to kick in
            setStatus('Detecting session...')
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Check if we have a session now
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
                console.error('[CALLBACK] getSession error:', sessionError.message)
                setError(sessionError.message)
                return
            }

            if (session) {
                console.log('[CALLBACK] Session found:', session.user.email)
                setStatus('Login successful! Redirecting...')
                window.history.replaceState(null, '', '/auth/callback')
                setTimeout(() => router.push('/dashboard'), 500)
                return
            }

            // Check if hash still exists (not processed yet)
            if (window.location.hash.includes('access_token')) {
                console.log('[CALLBACK] Hash still present, waiting more...')
                setStatus('Establishing session...')
                await new Promise(resolve => setTimeout(resolve, 2000))

                // Try one more time
                const { data: { session: retrySession } } = await supabase.auth.getSession()
                if (retrySession) {
                    console.log('[CALLBACK] Session found on retry:', retrySession.user.email)
                    setStatus('Login successful! Redirecting...')
                    window.history.replaceState(null, '', '/auth/callback')
                    setTimeout(() => router.push('/dashboard'), 500)
                    return
                }
            }

            // No auth data found
            console.error('[CALLBACK] No authentication data found after waiting')
            setError('Could not establish session. Please try logging in again.')
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
                    <div className="text-[10px] text-cyan-700/70">v12.0.0-AUTO-DETECT</div>
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
