import Link from 'next/link';
import goals from '@/data/goals.json';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Weight Loss Goals | Timeline Calculator',
    description: 'Browse 100+ weight loss goal timelines. Find your specific goal and get a science-based projection of when you\'ll reach it.',
};

export default function GoalsPage() {
    return (
        <main className="min-h-screen bg-black text-slate-200 p-8 md:p-24">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white mb-6">
                        All Weight Loss <span className="text-emerald-500">Goals</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Select your goal to see a personalized weight loss timeline based on your metabolism.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.map((goal) => (
                        <Link
                            key={goal.slug}
                            href={`/plan/${goal.slug}`}
                            className="block p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500 transition-colors group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-white group-hover:text-emerald-400 transition-colors">{goal.label}</span>
                                <span className="text-slate-600 text-sm">→</span>
                            </div>
                            <div className="text-sm text-slate-500 mt-2">{goal.pounds} lbs to lose</div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
