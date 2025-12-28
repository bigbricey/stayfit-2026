'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cookieInfo, setCookieInfo] = useState<string>('')

  useEffect(() => {
    const checkSession = async () => {
      // 1. Check Cookies
      setCookieInfo(document.cookie)

      // 2. Check Supabase
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabase.auth.getSession()
      setSession({ data, error })
      setLoading(false)
    }

    checkSession()
  }, [])

  return (
    <div className="p-8 bg-black text-white min-h-screen font-mono text-sm">
      <h1 className="text-2xl font-bold text-red-500 mb-4">SYSTEM DIAGNOSTIC PANEL</h1>
      
      <div className="grid gap-8">
        <div className="border border-gray-800 p-4 rounded">
          <h2 className="text-blue-400 font-bold mb-2">BROWSER COOKIES (Raw)</h2>
          <pre className="bg-gray-900 p-2 overflow-x-auto whitespace-pre-wrap text-gray-400">
            {cookieInfo || "NO COOKIES FOUND"}
          </pre>
        </div>

        <div className="border border-gray-800 p-4 rounded">
           <h2 className="text-green-400 font-bold mb-2">SUPABASE SESSION</h2>
           {loading ? 'ANALYZING...' : (
             <pre className="bg-gray-900 p-2 overflow-x-auto text-xs text-green-300">
               {JSON.stringify(session, null, 2)}
             </pre>
           )}
        </div>
        
        <div className="border border-gray-800 p-4 rounded">
           <h2 className="text-orange-400 font-bold mb-2">ACTIONS</h2>
           <button 
             onClick={() => window.location.reload()}
             className="px-4 py-2 bg-gray-800 hover:bg-gray-700 mr-4"
           >
             REFRESH DIAGNOSTICS
           </button>
           <a href="/login" className="px-4 py-2 bg-blue-900 hover:bg-blue-800">
             GOTO LOGIN
           </a>
        </div>
      </div>
    </div>
  )
}