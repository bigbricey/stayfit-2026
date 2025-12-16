import Link from 'next/link';
import goals from '@/data/goals.json';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Weight Loss Goals | StayFitWithAI',
    description: 'Browse 100+ weight loss goal timelines. Find your specific goal and get a science-based projection of when you\'ll reach it.',
};

export default function GoalsPage() {
    return (
        <div className="bg-gray-100 min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        All Weight Loss Goals
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Select your goal to see a personalized weight loss timeline based on your metabolism.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.map((goal) => (
                        <Link
                            key={goal.slug}
                            href={`/plan/${goal.slug}`}
                            className="block p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#0073CF] hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 group-hover:text-[#0073CF] transition-colors">{goal.label}</span>
                                <span className="text-gray-400 text-sm">→</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-2">{goal.pounds} lbs to lose</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
