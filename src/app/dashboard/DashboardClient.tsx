'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

interface DashboardProps {
    user: { id: string; email?: string };
    profile: {
        display_name?: string;
        goal_weight?: number;
        start_weight?: number;
        current_weight?: number;
    } | null;
    weightEntries: Array<{ date: string; weight: number; notes?: string }>;
    waterToday: { glasses: number } | null;
    streak: { current_streak: number; longest_streak: number } | null;
    mealsToday: Array<{ meal_type: string; calories?: number }>;
}

export default function DashboardClient({
    user,
    profile,
    weightEntries,
    waterToday,
    streak,
    mealsToday
}: DashboardProps) {
    const router = useRouter();
    const [weight, setWeight] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'log' | 'progress' | 'feedback'>('overview');

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const handleLogWeight = async () => {
        if (!weight) return;
        setLoading(true);

        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];

        await supabase.from('weight_entries').insert({
            user_id: user.id,
            weight: parseFloat(weight),
            date: today,
        });

        // Update current weight in profile
        await supabase.from('profiles').update({
            current_weight: parseFloat(weight),
        }).eq('id', user.id);

        // Update streak
        await supabase.from('streaks').update({
            current_streak: (streak?.current_streak || 0) + 1,
            last_logged_date: today,
        }).eq('user_id', user.id);

        setWeight('');
        setLoading(false);
        router.refresh();
    };

    const handleAddWater = async () => {
        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];
        const newGlasses = (waterToday?.glasses || 0) + 1;

        await supabase.from('water_intake').upsert({
            user_id: user.id,
            date: today,
            glasses: newGlasses,
        }, { onConflict: 'user_id,date' });

        router.refresh();
    };

    const chartData = [...weightEntries].reverse().map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: e.weight,
    }));

    const currentWeight = profile?.current_weight || weightEntries[0]?.weight || 0;
    const goalWeight = profile?.goal_weight || 160;
    const startWeight = profile?.start_weight || currentWeight;
    const totalToLose = startWeight - goalWeight;
    const lostSoFar = startWeight - currentWeight;
    const progressPercent = totalToLose > 0 ? Math.min((lostSoFar / totalToLose) * 100, 100) : 0;

    const todayCalories = mealsToday.reduce((sum, m) => sum + (m.calories || 0), 0);

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Top Nav */}
            <header className="bg-slate-900/50 border-b border-slate-800 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">SF</span>
                        </div>
                        <span className="font-bold text-white">Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">{user.email}</span>
                        <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-white">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8">
                    {(['overview', 'log', 'progress', 'feedback'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${activeTab === tab
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <div className="text-slate-400 text-sm mb-1">Current Weight</div>
                                <div className="text-3xl font-bold text-white">{currentWeight || '--'}</div>
                                <div className="text-slate-500 text-sm">lbs</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <div className="text-slate-400 text-sm mb-1">Goal</div>
                                <div className="text-3xl font-bold text-orange-400">{goalWeight}</div>
                                <div className="text-slate-500 text-sm">lbs</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <div className="text-slate-400 text-sm mb-1">Progress</div>
                                <div className="text-3xl font-bold text-green-400">{progressPercent.toFixed(0)}%</div>
                                <div className="text-slate-500 text-sm">{lostSoFar.toFixed(1)} lbs lost</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <div className="text-slate-400 text-sm mb-1">Streak</div>
                                <div className="text-3xl font-bold text-amber-400">🔥 {streak?.current_streak || 0}</div>
                                <div className="text-slate-500 text-sm">days</div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Log Weight */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h3 className="font-bold text-white mb-4">📊 Quick Log Weight</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="Enter weight"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    />
                                    <button
                                        onClick={handleLogWeight}
                                        disabled={loading || !weight}
                                        className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                    >
                                        {loading ? '...' : 'Log'}
                                    </button>
                                </div>
                            </div>

                            {/* Water Tracker */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h3 className="font-bold text-white mb-4">💧 Water Today</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                            <div
                                                key={i}
                                                className={`w-6 h-8 rounded-sm ${i <= (waterToday?.glasses || 0) ? 'bg-blue-500' : 'bg-slate-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleAddWater}
                                        className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-lg text-sm"
                                    >
                                        +1
                                    </button>
                                </div>
                                <div className="text-sm text-slate-400 mt-2">{waterToday?.glasses || 0}/8 glasses</div>
                            </div>

                            {/* Today's Calories */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h3 className="font-bold text-white mb-4">🔥 Calories Today</h3>
                                <div className="text-3xl font-bold text-white">{todayCalories}</div>
                                <div className="text-sm text-slate-400">calories logged</div>
                            </div>
                        </div>

                        {/* Weight Chart */}
                        {chartData.length > 0 && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h3 className="font-bold text-white mb-4">📈 Weight Trend</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" domain={['dataMin - 5', 'dataMax + 5']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#F97316"
                                            strokeWidth={2}
                                            dot={{ fill: '#F97316' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <FeedbackForm userId={user.id} />
                )}
            </div>
        </div>
    );
}

function FeedbackForm({ userId }: { userId: string }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'feature' | 'bug' | 'feedback'>('feature');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();
        await supabase.from('feature_requests').insert({
            user_id: userId,
            request_type: type,
            title,
            description,
        });

        setSubmitted(true);
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Thank You!</h3>
                <p className="text-slate-400">Your feedback has been submitted. We read every suggestion!</p>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setTitle('');
                        setDescription('');
                    }}
                    className="mt-4 text-orange-400 hover:text-orange-300"
                >
                    Submit another
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">💡 Share Your Ideas</h2>
            <p className="text-slate-400 mb-6">What features would make this app better for you?</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Type</label>
                    <div className="flex gap-2">
                        {(['feature', 'bug', 'feedback'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-4 py-2 rounded-lg capitalize ${type === t
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                            >
                                {t === 'feature' && '✨ '}
                                {t === 'bug' && '🐛 '}
                                {t === 'feedback' && '💬 '}
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="I wish the app had..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
                    />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">Description (optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Tell us more about your idea..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !title}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
}
