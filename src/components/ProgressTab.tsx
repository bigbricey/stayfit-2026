'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ProgressTabProps {
    profile: {
        start_weight?: number;
        current_weight?: number;
        goal_weight?: number;
    } | null;
    weightEntries: Array<{ date: string; weight: number }>;
    streak: { current_streak: number; longest_streak: number } | null;
}

export default function ProgressTab({ profile, weightEntries, streak }: ProgressTabProps) {
    const startWeight = profile?.start_weight || 0;
    const currentWeight = profile?.current_weight || weightEntries[0]?.weight || 0;
    const goalWeight = profile?.goal_weight || 160;

    const totalToLose = startWeight - goalWeight;
    const lostSoFar = startWeight - currentWeight;
    const progressPercent = totalToLose > 0 ? Math.min((lostSoFar / totalToLose) * 100, 100) : 0;
    const poundsToGo = currentWeight - goalWeight;

    const chartData = [...weightEntries].reverse().map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: e.weight,
    }));

    // Progress ring calculations
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
        <div className="space-y-6">
            {/* Progress Ring */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 flex items-center justify-center">
                <div className="relative">
                    <svg width="200" height="200" className="transform -rotate-90">
                        <circle cx="100" cy="100" r={radius} stroke="#1e293b" strokeWidth="12" fill="none" />
                        <circle
                            cx="100" cy="100" r={radius}
                            stroke="url(#gradient)" strokeWidth="12" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#fbbf24" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{progressPercent.toFixed(0)}%</span>
                        <span className="text-slate-400 text-sm">to goal</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{startWeight || '--'}</div>
                    <div className="text-sm text-slate-400">Start</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">{currentWeight || '--'}</div>
                    <div className="text-sm text-slate-400">Current</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{goalWeight}</div>
                    <div className="text-sm text-slate-400">Goal</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{poundsToGo > 0 ? poundsToGo.toFixed(1) : '0'}</div>
                    <div className="text-sm text-slate-400">lbs to go</div>
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
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="weight" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Streak Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">🔥 Streaks</h3>
                <div className="flex gap-8">
                    <div>
                        <div className="text-3xl font-bold text-amber-400">{streak?.current_streak || 0}</div>
                        <div className="text-sm text-slate-400">Current streak</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-orange-400">{streak?.longest_streak || 0}</div>
                        <div className="text-sm text-slate-400">Longest streak</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
