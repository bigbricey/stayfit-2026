'use client';

import React, { useState, useMemo } from 'react';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
type Goal = 'lose' | 'maintain' | 'gain';

const ACTIVITY_DATA: Record<ActivityLevel, { label: string; multiplier: number }> = {
    sedentary: { label: 'Sedentary (desk job)', multiplier: 1.2 },
    light: { label: 'Light (1-3 days/wk)', multiplier: 1.375 },
    moderate: { label: 'Moderate (3-5 days/wk)', multiplier: 1.55 },
    active: { label: 'Active (6-7 days/wk)', multiplier: 1.725 },
    veryActive: { label: 'Very Active (athlete)', multiplier: 1.9 },
};

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        let startTime: number;
        let animationFrame: number;
        const startValue = displayValue;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / 600, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(startValue + (value - startValue) * easeOut);
            if (progress < 1) animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value]);

    return <>{Math.round(displayValue * Math.pow(10, decimals)) / Math.pow(10, decimals)}</>;
}

export default function CalorieCalculator() {
    const [weight, setWeight] = useState(180);
    const [heightFeet, setHeightFeet] = useState(5);
    const [heightInches, setHeightInches] = useState(8);
    const [age, setAge] = useState(35);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [activity, setActivity] = useState<ActivityLevel>('light');
    const [goal, setGoal] = useState<Goal>('lose');
    const [showResults, setShowResults] = useState(false);

    const bmr = useMemo(() => {
        const weightKg = weight * 0.453592;
        const heightCm = (heightFeet * 12 + heightInches) * 2.54;
        if (gender === 'male') {
            return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
        }
        return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }, [weight, heightFeet, heightInches, age, gender]);

    const tdee = useMemo(() => bmr * ACTIVITY_DATA[activity].multiplier, [bmr, activity]);

    const targetCalories = useMemo(() => {
        switch (goal) {
            case 'lose': return tdee - 500;
            case 'gain': return tdee + 300;
            default: return tdee;
        }
    }, [tdee, goal]);

    const weeklyChange = useMemo(() => {
        const deficit = tdee - targetCalories;
        return (deficit * 7) / 3500; // lbs per week
    }, [tdee, targetCalories]);

    return (
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Calorie Calculator</h2>
                <p className="text-slate-400">Find your daily calorie target for weight loss</p>
            </div>

            {!showResults ? (
                <div className="space-y-6">
                    {/* Weight */}
                    <div className="space-y-2">
                        <label className="flex justify-between text-sm font-medium text-slate-300">
                            <span>Weight</span>
                            <span className="text-orange-400 font-bold">{weight} lbs</span>
                        </label>
                        <input
                            type="range"
                            min="80"
                            max="400"
                            value={weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                    </div>

                    {/* Height & Age */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Height (ft)</label>
                            <select
                                value={heightFeet}
                                onChange={(e) => setHeightFeet(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
                            >
                                {[4, 5, 6, 7].map(ft => <option key={ft} value={ft}>{ft}′</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Height (in)</label>
                            <select
                                value={heightInches}
                                onChange={(e) => setHeightInches(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <option key={i} value={i}>{i}″</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Gender</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['female', 'male'] as const).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setGender(g)}
                                    className={`py-3 rounded-xl font-medium transition-all ${gender === g
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Activity Level</label>
                        <div className="space-y-2">
                            {(Object.entries(ACTIVITY_DATA) as [ActivityLevel, { label: string }][]).map(([key, { label }]) => (
                                <button
                                    key={key}
                                    onClick={() => setActivity(key)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activity === key
                                            ? 'bg-orange-500/20 border-orange-500 border text-orange-300'
                                            : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Goal */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Goal</label>
                        <div className="grid grid-cols-3 gap-2">
                            {([
                                { key: 'lose' as Goal, label: 'Lose', icon: '📉' },
                                { key: 'maintain' as Goal, label: 'Maintain', icon: '⚖️' },
                                { key: 'gain' as Goal, label: 'Gain', icon: '📈' },
                            ]).map(({ key, label, icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setGoal(key)}
                                    className={`py-4 rounded-xl font-medium transition-all ${goal === key
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    <span className="text-xl block">{icon}</span>
                                    <span className="text-sm">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowResults(true)}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-4 rounded-xl mt-4"
                    >
                        Calculate My Calories →
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Main Result */}
                    <div className="text-center">
                        <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">Your Daily Calorie Target</div>
                        <div className="text-7xl font-bold text-orange-400">
                            <AnimatedNumber value={Math.round(targetCalories)} />
                        </div>
                        <div className="text-slate-400 mt-1">calories per day</div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-slate-300">
                                <AnimatedNumber value={Math.round(bmr)} />
                            </div>
                            <div className="text-xs text-slate-500">BMR</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-slate-300">
                                <AnimatedNumber value={Math.round(tdee)} />
                            </div>
                            <div className="text-xs text-slate-500">TDEE</div>
                        </div>
                        <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30">
                            <div className="text-2xl font-bold text-orange-400">
                                <AnimatedNumber value={Math.round(targetCalories)} />
                            </div>
                            <div className="text-xs text-orange-300">Target</div>
                        </div>
                    </div>

                    {/* Macro Suggestion */}
                    <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                        <h3 className="font-bold text-white mb-4">Suggested Macro Split</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Protein', pct: 30, color: 'bg-red-500' },
                                { name: 'Carbs', pct: 40, color: 'bg-amber-500' },
                                { name: 'Fat', pct: 30, color: 'bg-green-500' },
                            ].map((macro) => (
                                <div key={macro.name} className="flex items-center gap-3">
                                    <div className="w-20 text-sm text-slate-400">{macro.name}</div>
                                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${macro.color} transition-all duration-1000`} style={{ width: `${macro.pct}%` }} />
                                    </div>
                                    <div className="w-20 text-right">
                                        <span className="text-white font-bold">{Math.round((targetCalories * macro.pct / 100) / (macro.name === 'Fat' ? 9 : 4))}g</span>
                                        <span className="text-slate-500 text-xs ml-1">({macro.pct}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Projection */}
                    {goal !== 'maintain' && (
                        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-6 border border-orange-500/30">
                            <p className="text-slate-300">
                                At this calorie level, you can expect to {goal === 'lose' ? 'lose' : 'gain'}{' '}
                                <strong className="text-orange-400">{Math.abs(weeklyChange).toFixed(1)} lbs per week</strong>.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => setShowResults(false)}
                        className="w-full text-slate-500 hover:text-white transition-colors py-2"
                    >
                        ← Recalculate
                    </button>
                </div>
            )}
        </div>
    );
}
