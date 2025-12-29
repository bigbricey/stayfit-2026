'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
    const [status, setStatus] = useState('Initializing...')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            console.log('[AUTH/CALLBACK] Implicit flow callback handler starting')
            console.log('[AUTH/CALLBACK] Full URL:', window.location.href)
            console.log('[AUTH/CALLBACK] Hash:', window.location.hash)

            setStatus('Processing authentication...')

            // Create client with implicit flow configuration
            const supabase = createClient()

            // For implicit flow, the session is in the URL hash
            // The supabase client with detectSessionInUrl: true will handle it
            // We just need to get the session

            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
                console.error('[AUTH/CALLBACK] Session error:', sessionError.message)
                setError(sessionError.message)
                setStatus('Failed - Session Error')
                return
            }

            if (session) {
                console.log('[AUTH/CALLBACK] Session found!')
                console.log('[AUTH/CALLBACK] User ID:', session.user?.id)
                setStatus('Success! Redirecting...')

                // Redirect to dashboard
                setTimeout(() => {
                    router.push('/dashboard')
                }, 500)
                return
            }

            // If no session yet, maybe we need to wait for the auth state change
            console.log('[AUTH/CALLBACK] No session found, setting up auth listener')
            setStatus('Waiting for authentication...')

            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
                console.log('[AUTH/CALLBACK] Auth state change:', event)

                if (event === 'SIGNED_IN' && currentSession) {
                    console.log('[AUTH/CALLBACK] Sign in detected!')
                    setStatus('Success! Redirecting...')
                    subscription.unsubscribe()
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 500)
                }
            })

            // Give it 5 seconds before timing out
            setTimeout(() => {
                console.log('[AUTH/CALLBACK] Timeout reached')
                setError('Authentication timed out. Please try again.')
                setStatus('Failed - Timeout')
                subscription.unsubscribe()
            }, 5000)
        }

        handleCallback()
    }, [router])

    return (
        <div className="flex h-screen items-center justify-center bg-black text-white font-mono">
            <div className="text-center space-y-4 p-8 border border-cyan-900/50 bg-gray-950/80 max-w-md">
                <div className="text-xs text-cyan-700/70 uppercase tracking-widest">v16.0.0-IMPLICIT-FLOW</div>
                <h1 className="text-xl text-cyan-400">Authentication</h1>
                <div className="text-cyan-500/80">{status}</div>
                {error && (
                    <div className="text-red-400 text-sm p-4 bg-red-950/30 border border-red-900/50 rounded">
                        <div className="font-bold mb-2">Error:</div>
                        <div>{error}</div>
                    </div>
                )}
            </div>
        </div>
    )
}
