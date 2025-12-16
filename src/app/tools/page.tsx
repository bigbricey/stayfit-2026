import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Free Health Tools | Weight Loss Calculators',
    description: 'Free, science-based weight loss calculators: BMI, calorie needs, timeline forecaster, and more.',
};

const tools = [
    {
        name: 'Timeline Forecaster',
        description: 'See exactly when you\'ll reach your goal weight with our science-based projection.',
        href: '/',
        icon: '📈',
        featured: true,
    },
    {
        name: 'BMI Calculator',
        description: 'Calculate your Body Mass Index and see where you stand on the health scale.',
        href: '/tools/bmi-calculator',
        icon: '⚖️',
    },
    {
        name: 'Calorie Calculator',
        description: 'Find out exactly how many calories you need each day for weight loss.',
        href: '/tools/calorie-calculator',
        icon: '🔥',
    },
    {
        name: 'Macro Calculator',
        description: 'Get your personalized protein, carb, and fat targets.',
        href: '/tools/macro-calculator',
        icon: '🥗',
        comingSoon: true,
    },
    {
        name: 'Body Fat Estimator',
        description: 'Estimate your body fat percentage based on measurements.',
        href: '/tools/body-fat-calculator',
        icon: '📊',
        comingSoon: true,
    },
    {
        name: 'Water Intake Calculator',
        description: 'Calculate your optimal daily water intake for weight loss.',
        href: '/tools/water-calculator',
        icon: '💧',
        comingSoon: true,
    },
];

export default function ToolsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
            {/* Hero */}
            <div className="relative pt-16 pb-12 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Free Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Tools</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto">
                        Science-based calculators to help you reach your health goals.
                    </p>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.name}
                            href={tool.comingSoon ? '#' : tool.href}
                            className={`group relative block ${tool.comingSoon ? 'cursor-not-allowed' : ''}`}
                        >
                            {tool.featured && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                                    Popular
                                </div>
                            )}
                            {tool.comingSoon && (
                                <div className="absolute -top-2 -right-2 bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1 rounded-full z-10">
                                    Coming Soon
                                </div>
                            )}
                            <div className={`relative h-full bg-slate-900/50 border rounded-2xl p-6 transition-all ${tool.comingSoon
                                    ? 'border-slate-800 opacity-60'
                                    : 'border-slate-800 hover:border-orange-500/50 group-hover:shadow-xl group-hover:shadow-orange-500/10'
                                }`}>
                                <div className="text-4xl mb-4">{tool.icon}</div>
                                <h2 className={`text-xl font-bold mb-2 transition-colors ${tool.comingSoon ? 'text-slate-400' : 'text-white group-hover:text-orange-400'
                                    }`}>
                                    {tool.name}
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed">{tool.description}</p>
                                {!tool.comingSoon && (
                                    <div className="mt-4 text-orange-400 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Try it free
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="border-t border-slate-800/50 bg-slate-900/30 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-slate-400 mb-8">Get your personalized weight loss timeline in under 60 seconds.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/25"
                    >
                        Try the Timeline Forecaster
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </main>
    );
}
