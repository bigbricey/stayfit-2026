'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState('Processing authentication...')

    useEffect(() => {
        const handleCallback = async () => {
            console.log('[AUTH CALLBACK] Starting - URL:', window.location.href)
            console.log('[AUTH CALLBACK] Hash:', window.location.hash)

            // Create client with detectSessionInUrl - this should auto-parse hash tokens
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

            setStatus('Detecting session from URL...')

            // Give Supabase a moment to detect and parse the session from URL
            await new Promise(resolve => setTimeout(resolve, 500))

            // Now check if session was established
            const { data: { session }, error } = await supabase.auth.getSession()

            console.log('[AUTH CALLBACK] getSession result:', {
                hasSession: !!session,
                user: session?.user?.email,
                error: error?.message
            })

            if (error) {
                console.error('[AUTH CALLBACK] Session error:', error.message)
                setStatus(`Error: ${error.message}`)
                setTimeout(() => router.push(`/login?error=${encodeURIComponent(error.message)}`), 2000)
                return
            }

            if (session) {
                console.log('[AUTH CALLBACK] Session found! Redirecting to dashboard...')
                setStatus('Success! Redirecting to dashboard...')
                router.push('/dashboard')
                return
            }

            // No session detected - check if we have hash params we can use
            const hash = window.location.hash
            if (hash && hash.includes('access_token')) {
                console.log('[AUTH CALLBACK] Hash has tokens but getSession failed. Checking auth state...')
                setStatus('Tokens found, verifying auth state...')

                // Try onAuthStateChange listener approach
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
                    console.log('[AUTH CALLBACK] Auth state change:', event, newSession?.user?.email)
                    if (event === 'SIGNED_IN' && newSession) {
                        setStatus('Signed in! Redirecting...')
                        subscription.unsubscribe()
                        router.push('/dashboard')
                    }
                })

                // Give it a bit more time
                await new Promise(resolve => setTimeout(resolve, 2000))
                subscription.unsubscribe()
            }

            // Still no session
            setStatus(`No session established. Hash: ${hash.substring(0, 50)}...`)
            console.log('[AUTH CALLBACK] No session after all attempts')
            setTimeout(() => router.push('/login?error=no_session'), 2000)
        }

        handleCallback()
    }, [router])

    return (
        <div className="flex h-screen items-center justify-center bg-black text-white font-mono">
            <div className="text-center space-y-4">
                <div className="h-8 w-8 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                <p className="text-cyan-400 text-sm tracking-wider">{status}</p>
                <p className="text-[10px] text-cyan-900">v8.7.0-AUTO-DETECT</p>
            </div>
        </div>
    )
}
