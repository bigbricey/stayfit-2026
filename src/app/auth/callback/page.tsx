'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
    const [status, setStatus] = useState('Initializing...')
    const [error, setError] = useState<string | null>(null)
    const [debugInfo, setDebugInfo] = useState<string>('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleCallback = async () => {
            console.log('[AUTH/CALLBACK] Starting callback handler')

            // Debug: Check localStorage content
            const storageKeys = Object.keys(localStorage)
            console.log('[AUTH/CALLBACK] localStorage keys:', storageKeys)

            const supabaseKeys = storageKeys.filter(k => k.includes('supabase'))
            console.log('[AUTH/CALLBACK] Supabase-related keys:', supabaseKeys)

            // Log all supabase entries
            supabaseKeys.forEach(key => {
                console.log(`[AUTH/CALLBACK] ${key}:`, localStorage.getItem(key)?.substring(0, 100) + '...')
            })

            setDebugInfo(`Storage keys: ${storageKeys.join(', ') || 'EMPTY'}\nSupabase keys: ${supabaseKeys.join(', ') || 'NONE'}`)

            const code = searchParams.get('code')
            console.log('[AUTH/CALLBACK] Code from URL:', code?.substring(0, 20) + '...')

            if (!code) {
                setError('No authorization code in URL')
                setStatus('Failed - No Code')
                return
            }

            setStatus('Exchanging code for session...')

            // Create supabase client
            const supabase = createClient()

            try {
                console.log('[AUTH/CALLBACK] Calling exchangeCodeForSession...')
                const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

                if (exchangeError) {
                    console.error('[AUTH/CALLBACK] Exchange error:', exchangeError)
                    setError(exchangeError.message)
                    setStatus('Failed - Exchange Error')
                    return
                }

                console.log('[AUTH/CALLBACK] Session exchange successful!')
                console.log('[AUTH/CALLBACK] User ID:', data.session?.user?.id)
                setStatus('Success! Redirecting...')

                setTimeout(() => {
                    router.push('/dashboard')
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
            <div className="text-center space-y-4 p-8 border border-cyan-900/50 bg-gray-950/80 max-w-lg">
                <div className="text-xs text-cyan-700/70 uppercase tracking-widest">v17.0.0-DEBUG-STORAGE</div>
                <h1 className="text-xl text-cyan-400">Authentication</h1>
                <div className="text-cyan-500/80">{status}</div>
                {debugInfo && (
                    <div className="text-xs text-left p-4 bg-gray-900 border border-gray-700 rounded font-mono whitespace-pre-wrap">
                        {debugInfo}
                    </div>
                )}
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
