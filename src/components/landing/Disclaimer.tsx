'use client'

import React from 'react'
import { Info } from 'lucide-react'

export default function Disclaimer() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="relative glass p-8 sm:p-12 rounded-3xl overflow-hidden border-white/5">
                    {/* Subtle glow */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />

                    <div className="relative flex flex-col md:flex-row gap-8 items-start">
                        <div className="bg-emerald-500/10 p-3 rounded-xl shrink-0">
                            <Info className="w-8 h-8 text-emerald-500" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">Biological Evidence, Not Medical Advice.</h2>
                            <p className="text-lg text-gray-400 leading-relaxed">
                                Stay Fit with AI is a data-centric persistence layer. We act as your <strong>Biological Auditor</strong>—collecting, storing, and organizing your nutritional and metabolic history. We present the evidence as it is reported and analyzed by AI.
                            </p>
                            <p className="text-md text-gray-500 leading-relaxed max-w-4xl">
                                The insights provided are for informational purposes only and are based on clinical research thresholds and your personal data history. Our role is to provide you with a high-fidelity data vault. All interpretations and medical decisions should be made in direct consultation with your licensed healthcare provider.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
