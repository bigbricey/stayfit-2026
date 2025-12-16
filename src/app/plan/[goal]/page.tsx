import React from 'react';
import { notFound } from 'next/navigation';
import goals from '@/data/goals.json';
import TimelineCalculator from '@/components/TimelineCalculator';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{
        goal: string;
    }>;
};

export async function generateStaticParams() {
    return goals.map((g) => ({
        goal: g.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const goalData = goals.find((g) => g.slug === resolvedParams.goal);

    if (!goalData) return { title: 'Not Found' };

    return {
        title: `${goalData.label} | Weight Loss Timeline Calculator`,
        description: `How long does it take to ${goalData.label.toLowerCase()}? Use our science-based timeline forecaster to see your personalized weight loss projection.`,
    };
}

export default async function GoalPage({ params }: Props) {
    const resolvedParams = await params;
    const goalData = goals.find((g) => g.slug === resolvedParams.goal);

    if (!goalData) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-slate-200">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-slate-900 to-black border-b border-slate-800 pt-20 pb-24 px-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-900/30 text-emerald-400 text-sm font-bold border border-emerald-500/20 mb-6">
                        Science-Based Calculator
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                        {goalData.label}: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Your Timeline</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Discover exactly how long it will take you to lose {goalData.pounds} pounds based on your unique metabolism.
                    </p>
                </div>
            </div>

            {/* Calculator Section */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
                <TimelineCalculator
                    defaultCurrentWeight={goalData.defaultCurrent}
                    defaultGoalWeight={goalData.defaultGoal}
                    goalLabel={goalData.label}
                />
            </div>

            {/* Content Section */}
            <div className="max-w-3xl mx-auto px-4 py-24 space-y-12">
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6">How Long Does It Take to {goalData.label}?</h2>
                    <p className="text-lg leading-relaxed text-slate-400">
                        The timeline for losing {goalData.pounds} pounds depends on several factors: your current weight,
                        metabolism, activity level, and consistency. Our calculator uses the Mifflin-St Jeor equation—the
                        gold standard in metabolic science—to give you a realistic projection.
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-white mb-6">The Role of Metabolism</h2>
                    <p className="text-lg leading-relaxed text-slate-400 mb-4">
                        Your metabolism determines how efficiently your body converts food into energy. A sluggish
                        metabolism can add weeks or even months to your weight loss timeline. That's why the
                        calculator shows two projections:
                    </p>
                    <ul className="space-y-3 text-slate-400">
                        <li className="flex items-start gap-3">
                            <span className="text-slate-500 mt-1">●</span>
                            <span><strong className="text-white">Standard Diet (Grey Line):</strong> Based on typical caloric deficit alone.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-emerald-500 mt-1">●</span>
                            <span><strong className="text-emerald-400">Metabolic Support (Green Line):</strong> What's possible with optimized cellular energy production.</span>
                        </li>
                    </ul>
                </section>

                <section className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4">The Science Behind the Calculator</h3>
                    <p className="text-slate-400 leading-relaxed">
                        This tool uses the <strong className="text-white">Mifflin-St Jeor Equation</strong>, which has
                        been shown in clinical studies to be the most accurate predictor of Resting Metabolic Rate (RMR).
                        Combined with your activity level, we calculate your Total Daily Energy Expenditure (TDEE) and
                        project your weight loss based on a safe, sustainable caloric deficit.
                    </p>
                </section>
            </div>
        </main>
    );
}
