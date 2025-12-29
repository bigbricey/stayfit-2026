'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
    const [status, setStatus] = useState('Initializing...')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleCallback = async () => {
            console.log('[AUTH/CALLBACK] Client-side callback handler starting')

            const code = searchParams.get('code')
            const next = searchParams.get('next') ?? '/dashboard'

            console.log('[AUTH/CALLBACK] Code present:', !!code)
            console.log('[AUTH/CALLBACK] Next:', next)

            if (!code) {
                setError('No authorization code in URL')
                setStatus('Failed - No Code')
                return
            }

            setStatus('Exchanging code for session...')

            // Use the BROWSER client - this CAN read the code verifier from localStorage
            const supabase = createClient()

            try {
                const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

                if (exchangeError) {
                    console.error('[AUTH/CALLBACK] Exchange error:', exchangeError.message)
                    setError(exchangeError.message)
                    setStatus('Failed - Exchange Error')
                    return
                }

                console.log('[AUTH/CALLBACK] Session exchange successful!')
                console.log('[AUTH/CALLBACK] User ID:', data.session?.user?.id)
                setStatus('Success! Redirecting...')

                // Give a moment for the session to be stored, then redirect
                setTimeout(() => {
                    router.push(next)
                }, 500)

            } catch (err: any) {
                console.error('[AUTH/CALLBACK] Unexpected error:', err)
                setError(err.message || 'Unknown error')
                setStatus('Failed - Unexpected Error')
            }
        }

        handleCallback()
    }, [searchParams, router])

    return (
        <div className="flex h-screen items-center justify-center bg-black text-white font-mono">
            <div className="text-center space-y-4 p-8 border border-cyan-900/50 bg-gray-950/80 max-w-md">
                <div className="text-xs text-cyan-700/70 uppercase tracking-widest">v15.0.0-CLIENT-CALLBACK</div>
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
