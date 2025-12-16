import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Free Health Tools | StayFitWithAI',
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
        <div className="bg-gray-100 min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-b from-[#E8F4FC] to-gray-100 py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Free Health Tools
                    </h1>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
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
                                <div className="absolute -top-2 -right-2 bg-[#0073CF] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                                    Popular
                                </div>
                            )}
                            {tool.comingSoon && (
                                <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                                    Coming Soon
                                </div>
                            )}
                            <div className={`relative h-full bg-white border rounded-lg p-6 shadow-sm transition-all ${tool.comingSoon
                                ? 'border-gray-200 opacity-60'
                                : 'border-gray-200 hover:border-[#0073CF] hover:shadow-md'
                                }`}>
                                <div className="text-4xl mb-4">{tool.icon}</div>
                                <h2 className={`text-xl font-bold mb-2 transition-colors ${tool.comingSoon ? 'text-gray-400' : 'text-gray-800 group-hover:text-[#0073CF]'
                                    }`}>
                                    {tool.name}
                                </h2>
                                <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                                {!tool.comingSoon && (
                                    <div className="mt-4 text-[#0073CF] text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Try it free →
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
