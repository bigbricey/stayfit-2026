'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user } } = await supabase.auth.getUser()

      // We do NOT redirect here anymore. Middleware handles that.
      // We just set the state.
      if (user) {
        setUser(user)
      }
      setLoading(false)
    }

    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white font-mono">
        <div className="text-cyan-500 animate-pulse">LOADING SYSTEM...</div>
      </div>
    )
  }

  // Optional: Show a "Not Authenticated" state if somehow middleware failed,
  // instead of infinite looping.
  if (!user && !loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white font-mono flex-col gap-4">
        <div className="text-red-500 font-bold text-xl animate-pulse">ACCESS DENIED: SESSION INVALID</div>
        <div className="text-xs text-gray-500 font-mono">
          Diagnostics: <br />
          User: {JSON.stringify(user)} <br />
          Cookies: {typeof document !== 'undefined' ? document.cookie : 'server-side'}
        </div>
        <a href="/login" className="px-4 py-2 border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors mt-4">
          RETURN TO LOGIN
        </a>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white font-mono selection:bg-cyan-900 selection:text-cyan-100 overflow-hidden">
      {/* Fixed Game Console Container */}
      <div className="relative w-full max-w-2xl h-[600px] border border-cyan-900/50 bg-gray-950/80 shadow-[0_0_50px_-12px_rgba(8,145,178,0.3)] backdrop-blur-md flex flex-col rounded-sm overflow-hidden">

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-cyan-900/50 bg-black/40 px-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-cyan-500/90 uppercase">SYSTEM_ONLINE</span>
          </div>
          <div className="text-[10px] text-cyan-700/70">v8.5.2</div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-900/50 scrollbar-track-transparent">
          <h1 className="text-2xl font-bold text-cyan-100">Welcome, Agent {user.email?.split('@')[0]}</h1>
          <div className="p-4 border border-cyan-900/30 bg-cyan-950/10 rounded-sm">
            <h2 className="text-sm font-bold text-cyan-500 mb-2 uppercase tracking-widest">Biometric Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Weight</div>
                <div className="text-xl font-mono text-cyan-300">-- KG</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Sleep</div>
                <div className="text-xl font-mono text-cyan-300">-- HRS</div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-cyan-900/30 bg-cyan-950/10 rounded-sm">
            <h2 className="text-sm font-bold text-cyan-500 mb-2 uppercase tracking-widest">Macro Targets</h2>
            <div className="h-32 flex items-center justify-center text-gray-600 text-xs italic">
              No data logged yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}