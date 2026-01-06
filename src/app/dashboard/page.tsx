'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface DailySummary {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    meals: number;
}

export default function DashboardPage() {
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const today = new Date().toISOString().split('T')[0];

            // Fetch today's logs
            const { data: logs } = await supabase
                .from('metabolic_logs')
                .select('*')
                .eq('log_type', 'meal')
                .gte('logged_at', `${today}T00:00:00`)
                .lte('logged_at', `${today}T23:59:59`);

            if (logs) {
                const totals = logs.reduce((acc, log) => {
                    const d = log.data_structured || {};
                    return {
                        calories: acc.calories + (d.calories || 0),
                        protein: acc.protein + (d.protein || 0),
                        fat: acc.fat + (d.fat || 0),
                        carbs: acc.carbs + (d.carbs || 0),
                        meals: acc.meals + 1,
                    };
                }, { calories: 0, protein: 0, fat: 0, carbs: 0, meals: 0 });
                setSummary(totals);
            }

            // Fetch goals
            const { data: goalsData } = await supabase
                .from('goals')
                .select('*')
                .eq('status', 'active');
            setGoals(goalsData || []);

            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-gray-400 animate-pulse">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Dashboard
                    </h1>
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                        ← Back to Chat
                    </Link>
                </div>

                {/* Today's Summary */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Today&apos;s Fuel Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-950 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{summary?.calories || 0}</div>
                            <div className="text-gray-500 text-sm">Calories</div>
                        </div>
                        <div className="bg-gray-950 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-emerald-400">{summary?.protein || 0}g</div>
                            <div className="text-gray-500 text-sm">Protein</div>
                        </div>
                        <div className="bg-gray-950 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-yellow-400">{summary?.fat || 0}g</div>
                            <div className="text-gray-500 text-sm">Fat</div>
                        </div>
                        <div className="bg-gray-950 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-red-400">{summary?.carbs || 0}g</div>
                            <div className="text-gray-500 text-sm">Carbs</div>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-gray-500 text-sm">
                        {summary?.meals || 0} meals logged today
                    </div>
                </div>

                {/* Macro Breakdown Visual */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Macro Distribution</h2>
                    <div className="h-8 rounded-full overflow-hidden flex bg-gray-950">
                        {summary && (summary.protein + summary.fat + summary.carbs) > 0 ? (
                            <>
                                <div
                                    className="bg-emerald-500 transition-all"
                                    style={{ width: `${(summary.protein / (summary.protein + summary.fat + summary.carbs)) * 100}%` }}
                                ></div>
                                <div
                                    className="bg-yellow-500 transition-all"
                                    style={{ width: `${(summary.fat / (summary.protein + summary.fat + summary.carbs)) * 100}%` }}
                                ></div>
                                <div
                                    className="bg-red-500 transition-all"
                                    style={{ width: `${(summary.carbs / (summary.protein + summary.fat + summary.carbs)) * 100}%` }}
                                ></div>
                            </>
                        ) : (
                            <div className="w-full bg-gray-800 flex items-center justify-center text-gray-600 text-sm">
                                No data yet
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Protein</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Fat</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Carbs</span>
                    </div>
                </div>

                {/* Active Goals */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">🎯 Active Goals</h2>
                    {goals.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            No goals set. Chat with the AI to create one!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {goals.map((goal) => {
                                const current = summary?.[goal.metric as keyof DailySummary] || 0;
                                const progress = Math.min((current / goal.target_value) * 100, 100);
                                return (
                                    <div key={goal.id} className="bg-gray-950 rounded-xl p-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium capitalize">{goal.metric}</span>
                                            <p className="text-gray-400">You haven&apos;t logged any meals or workouts yet.</p>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
