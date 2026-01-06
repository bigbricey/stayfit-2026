'use client'

import React from 'react'
import { Camera, Layers, Zap, HeartPulse } from 'lucide-react'

const features = [
    {
        name: 'Multimodal Extraction',
        description: 'Our AI scans meal photos, blood work PDFs, and barcodes to extract 20+ unique data points automatically.',
        icon: Camera,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        name: 'Infinite Lifecycle Persistence',
        description: 'We track your data for decades, not days. See how your metabolic markers evolve across life stages.',
        icon: Layers,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    {
        name: 'Objective Correlation',
        description: 'Stop counting calories. Start finding causes. We cross-reference diet, activity, and biometrics to find what works for you.',
        icon: Zap,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
    },
    {
        name: 'Health Autonomy',
        description: 'We give you the data. You and your medical team bridge the gap. True ownership of your metabolic history.',
        icon: HeartPulse,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10'
    }
]

export default function Features() {
    return (
        <div id="features" className="py-24 sm:py-32 bg-black/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-accent-primary uppercase tracking-widest">The Auditor&apos;s Toolbox</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Everything you need for metabolic transparency.
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Generic trackers look at today. The Truth Engine look at your life. We build a longitudinal vault that turns every meal into a data point for your future.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col glass p-8 rounded-2xl border-white/5 hover:border-white/10 transition-colors">
                                <dt className="text-base font-semibold leading-7 text-white">
                                    <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${feature.bg}`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                                    </div>
                                    {feature.name}
                                </dt>
                                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-400">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    )
}
