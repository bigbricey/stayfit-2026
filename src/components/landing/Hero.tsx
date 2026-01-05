'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheck, BarChart3, Database, ChevronRight } from 'lucide-react'

export default function Hero() {
    return (
        <div className="relative isolate pt-14 dark:bg-black min-h-screen overflow-hidden">
            {/* Background Gradients */}
            <div
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                aria-hidden="true"
            >
                <div
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#10b981] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>

            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
                    <div className="flex">
                        <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20 glass">
                            <span className="font-semibold text-accent-primary">New Protocol</span>
                            <span className="h-4 w-px bg-white/10" aria-hidden="true" />
                            <a href="#features" className="flex items-center gap-x-1">
                                Explore the Auditor <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                    <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                        THE METABOLIC <span className="gradient-text block">TRUTH ENGINE</span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Stop guessing. Start persisting. A lifetime of biological data—from food logs to blood work—cross-referenced by advanced AI to find the objective truth about your performance.
                    </p>
                    <div className="mt-10 flex items-center gap-x-6">
                        <Link
                            href="/login"
                            className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm hover:bg-gray-200 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            ENTER THE VAULT
                        </Link>
                        <Link href="/login" className="text-sm font-semibold leading-6 text-white group">
                            Member Login <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                </div>

                {/* Visual Elements Group */}
                <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
                    <div className="relative mx-auto w-full max-w-[500px]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
                                <ShieldCheck className="w-8 h-8 text-blue-500" />
                                <h3 className="text-sm font-medium text-white uppercase tracking-wider">Unbiased Audit</h3>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-blue-500 animate-pulse" />
                                </div>
                            </div>
                            <div className="glass p-6 rounded-2xl border-white/5 space-y-4 translate-y-8">
                                <Database className="w-8 h-8 text-emerald-500" />
                                <h3 className="text-sm font-medium text-white uppercase tracking-wider">Eternal Memory</h3>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-full bg-emerald-500/20 rounded-sm" />)}
                                </div>
                            </div>
                            <div className="glass p-6 rounded-2xl border-white/5 space-y-4 col-span-2">
                                <BarChart3 className="w-8 h-8 text-orange-500" />
                                <h3 className="text-sm font-medium text-white uppercase tracking-wider">Correlative Insights</h3>
                                <div className="h-24 flex items-end gap-2">
                                    {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
                                        <div key={i} className="flex-1 bg-orange-500/30 rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
