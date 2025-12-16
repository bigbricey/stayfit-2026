import BMICalculator from '@/components/BMICalculator';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'BMI Calculator | Free Body Mass Index Tool',
    description: 'Calculate your Body Mass Index (BMI) instantly with our free, science-based calculator. See your health category and ideal weight range.',
};

export default function BMIPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
            {/* Hero */}
            <div className="relative pt-16 pb-24 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-orange-400 text-sm font-medium">Free Health Tool</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        BMI <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto">
                        Find out your Body Mass Index and see where you stand on the health scale.
                    </p>
                </div>
            </div>

            {/* Calculator */}
            <div className="max-w-xl mx-auto px-4 -mt-8 relative z-20 mb-20">
                <BMICalculator />
            </div>

            {/* Info Section */}
            <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">What is BMI?</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Body Mass Index (BMI) is a measurement of a person's weight relative to their height.
                        It's used by healthcare professionals as a quick screening tool to assess whether someone
                        is underweight, normal weight, overweight, or obese.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">BMI Categories</h2>
                    <div className="grid gap-3">
                        {[
                            { range: 'Below 18.5', category: 'Underweight', color: 'text-blue-400' },
                            { range: '18.5 - 24.9', category: 'Normal Weight', color: 'text-green-400' },
                            { range: '25.0 - 29.9', category: 'Overweight', color: 'text-amber-400' },
                            { range: '30.0 and Above', category: 'Obese', color: 'text-red-400' },
                        ].map((item) => (
                            <div key={item.category} className="flex justify-between items-center bg-slate-800/50 rounded-xl px-5 py-4">
                                <span className="text-slate-300">{item.range}</span>
                                <span className={`font-medium ${item.color}`}>{item.category}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Limitations of BMI</h2>
                    <p className="text-slate-400 leading-relaxed">
                        While BMI is a useful screening tool, it doesn't directly measure body fat and may not
                        be accurate for athletes, elderly individuals, or those with high muscle mass. For a
                        complete health assessment, consult with a healthcare professional.
                    </p>
                </section>
            </div>

            {/* Cross-sell */}
            <div className="border-t border-slate-800/50 bg-slate-900/30 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to Take Action?</h2>
                    <p className="text-slate-400 mb-8">See exactly when you could reach your ideal weight.</p>
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
