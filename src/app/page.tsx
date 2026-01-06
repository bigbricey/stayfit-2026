'use client'

import React, { useEffect } from 'react'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Disclaimer from '@/components/landing/Disclaimer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                console.log('[Landing] User detected, redirecting to /chat')
                router.push('/chat')
            }
        }
        checkAuth()
    }, [supabase, router])

    return (
        <main className="min-h-screen bg-black">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-xl font-bold tracking-tighter text-white">
                        STAY<span className="text-accent-primary">FIT</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-md">
                            Login
                        </Link>
                        <Link href="/login" className="text-sm font-medium bg-white text-black hover:bg-gray-200 transition-all py-2 px-6 rounded-md">
                            Enter Vault
                        </Link>
                    </div>
                </div>
            </nav>

            <Hero />
            <Features />
            <Disclaimer />

            {/* Simple Footer */}
            <footer className="py-12 border-t border-white/5 bg-black/50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-gray-500 text-sm">
                        © 2026 Stay Fit with AI. The Metabolic Truth Engine.
                    </p>
                </div>
            </footer>
        </main>
    )
}
