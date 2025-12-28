'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState('Processing authentication...')

    useEffect(() => {
        const handleCallback = async () => {
            // HEAVY DEBUG: Log everything about the URL
            const fullUrl = window.location.href
            const hash = window.location.hash
            const search = window.location.search

            console.log('[AUTH CALLBACK] Full URL:', fullUrl)
            console.log('[AUTH CALLBACK] Hash:', hash)
            console.log('[AUTH CALLBACK] Search:', search)

            // Display for debugging
            setStatus(`DEBUG: URL=${fullUrl.substring(0, 80)}...`)
            await new Promise(resolve => setTimeout(resolve, 3000))  // Wait so we can see it

            // With implicit flow, tokens come in the URL hash fragment
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
            const hashParams = new URLSearchParams(hash.substring(1))
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')

            if (accessToken && refreshToken) {
                console.log('[AUTH CALLBACK] Found tokens in hash, setting session...')
                setStatus('Found tokens! Establishing session...')

                // With implicit flow, we need to manually set the session from hash tokens
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })

                if (error) {
                    console.error('[AUTH CALLBACK] setSession error:', error.message)
                    setStatus(`Session Error: ${error.message}`)
                    setTimeout(() => router.push(`/login?error=${encodeURIComponent(error.message)}`), 2000)
                    return
                }

                if (data.session) {
                    console.log('[AUTH CALLBACK] Session established successfully!')
                    setStatus('Authentication successful! Redirecting to dashboard...')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    router.push('/dashboard')
                    return
                }

                // Fallback if no session returned
                setStatus('Session not established')
                setTimeout(() => router.push('/login?error=session_not_established'), 2000)
                return
            }

            // Check for error in hash
            const hashError = hashParams.get('error')
            const hashErrorDescription = hashParams.get('error_description')
            if (hashError) {
                setStatus(`OAuth Error: ${hashErrorDescription || hashError}`)
                setTimeout(() => router.push(`/login?error=${encodeURIComponent(hashErrorDescription || hashError)}`), 2000)
                return
            }

            // Check for code in query params (PKCE - Supabase ignoring our implicit request?)
            const code = new URLSearchParams(search).get('code')
            if (code) {
                console.log('[AUTH CALLBACK] Got PKCE code - Supabase ignored implicit flow request!')
                setStatus(`Got code param - PKCE still active! code=${code.substring(0, 20)}...`)
                // Try to exchange it anyway using the standard SSR approach
                setTimeout(() => router.push(`/login?error=pkce_code_received`), 3000)
                return
            }

            // No tokens, no error, no code
            setStatus(`No auth data. hash=${hash.substring(0, 30)} search=${search.substring(0, 30)}`)
            setTimeout(() => router.push('/login?error=no_auth_data'), 3000)
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
