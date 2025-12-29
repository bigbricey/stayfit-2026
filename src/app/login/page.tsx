'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleLogin = async () => {
    console.log('[LOGIN] Starting PKCE OAuth flow')

    // Debug: Check localStorage BEFORE
    console.log('[LOGIN] localStorage BEFORE:', Object.keys(localStorage))

    // Use the shared client utility
    const supabase = createClient()

    // Log to confirm client is created
    console.log('[LOGIN] Supabase client created')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://stayfitwithai.com/auth/callback',
        queryParams: {
          prompt: 'select_account'
        },
        // Explicitly skip automatic redirect to check storage first
        skipBrowserRedirect: true,
      }
    })

    if (error) {
      console.error('[LOGIN] OAuth error:', error.message)
      alert('Login failed: ' + error.message)
      return
    }

    // Debug: Check localStorage AFTER signInWithOAuth (before redirect)
    console.log('[LOGIN] localStorage AFTER signInWithOAuth:', Object.keys(localStorage))
    const supabaseKeys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('pkce') || k.includes('code'))
    console.log('[LOGIN] Supabase-related keys:', supabaseKeys)
    supabaseKeys.forEach(key => {
      console.log(`[LOGIN] ${key} = ${localStorage.getItem(key)?.substring(0, 50)}...`)
    })

    console.log('[LOGIN] OAuth initiated, redirecting to:', data?.url)

    // Now manually redirect
    if (data?.url) {
      window.location.href = data.url
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white font-mono selection:bg-cyan-900 selection:text-cyan-100 overflow-hidden">
      {/* Fixed Game Console Container */}
      <div className="relative w-full max-w-2xl h-[600px] border border-cyan-900/50 bg-gray-950/80 shadow-[0_0_50px_-12px_rgba(8,145,178,0.3)] backdrop-blur-md flex flex-col rounded-sm overflow-hidden">

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-cyan-900/50 bg-black/40 px-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-cyan-500/90 uppercase">SYSTEM_LOGIN</span>
          </div>
          <div className="text-[10px] text-cyan-700/70">v18.0.0-VERIFY-STORAGE</div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">

          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-700 drop-shadow-[0_2px_10px_rgba(8,145,178,0.5)]">
                STAY FIT WITH AI
              </h1>
              <p className="text-cyan-500/60 text-sm tracking-widest uppercase">
                Initialize Neural Link
              </p>
            </div>

            <div className="p-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent w-full max-w-xs mx-auto" />

            {/* Client-side OAuth with PKCE (via shared client) */}
            <button
              onClick={handleLogin}
              className="group relative px-8 py-3 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-100 transition-all duration-300 mx-auto block cursor-pointer"
            >
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-3">
                <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                <span className="text-xs tracking-wider font-bold">CONTINUE WITH GOOGLE</span>
              </span>
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-500 opacity-50" />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-cyan-500 opacity-50" />
            </button>
          </div>
        </div>

        {/* Footer Status */}
        <div className="border-t border-cyan-900/30 px-4 py-2 bg-black/20 text-[10px] text-cyan-900/50 flex justify-between">
          <span>SECURE_CONNECTION: ENCRYPTED</span>
          <span>SERVER_STATUS: ONLINE</span>
        </div>
      </div>
    </div>
  )
}