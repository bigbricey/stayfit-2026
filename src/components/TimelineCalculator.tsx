'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { CONFIG } from '@/config';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
};

interface TimelineCalculatorProps {
    defaultCurrentWeight?: number;
    defaultGoalWeight?: number;
    goalLabel?: string;
}

// Animated Number Counter Component
function AnimatedNumber({ value, suffix = '', prefix = '', duration = 1000 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;
        const startValue = displayValue;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (value - startValue) * easeOut;

            setDisplayValue(Math.round(current * 10) / 10);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <span>{prefix}{displayValue.toFixed(value % 1 === 0 ? 0 : 1)}{suffix}</span>;
}

// Circular Gauge Component
function CircularGauge({ value, max, min = 0, label, color = '#F97316' }: { value: number; max: number; min?: number; label: string; color?: string }) {
    const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference * (1 - percentage);

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">
                    <AnimatedNumber value={value} />
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
            </div>
        </div>
    );
}

// Percentile Bar Component
function PercentileBar({ percentile, label }: { percentile: number; label: string }) {
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Slower</span>
                <span>{label}</span>
                <span>Faster</span>
            </div>
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 opacity-30"
                    style={{ width: '100%' }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg transition-all duration-1000 ease-out"
                    style={{ left: `calc(${percentile}% - 8px)` }}
                />
            </div>
            <div className="text-center mt-2">
                <span className="text-orange-400 font-bold">Top {100 - percentile}%</span>
                <span className="text-slate-400 text-sm"> of metabolism efficiency</span>
            </div>
        </div>
    );
}

export default function TimelineCalculator({
    defaultCurrentWeight = 200,
    defaultGoalWeight = 160,
    goalLabel = "Weight Loss Timeline Forecaster"
}: TimelineCalculatorProps) {
    const [currentWeight, setCurrentWeight] = useState(defaultCurrentWeight);
    const [goalWeight, setGoalWeight] = useState(defaultGoalWeight);
    const [age, setAge] = useState(35);
    const [heightFeet, setHeightFeet] = useState(5);
    const [heightInches, setHeightInches] = useState(8);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [activity, setActivity] = useState<ActivityLevel>('light');
    const [showResults, setShowResults] = useState(false);
    const [addWalking, setAddWalking] = useState(false);
    const [metabolicSupport, setMetabolicSupport] = useState(false);

    // Mifflin-St Jeor Equation
    const calculateBMR = (weightLbs: number) => {
        const weightKg = weightLbs * 0.453592;
        const heightCm = (heightFeet * 12 + heightInches) * 2.54;

        if (gender === 'male') {
            return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
        } else {
            return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
        }
    };

    const tdee = useMemo(() => {
        return calculateBMR(currentWeight) * ACTIVITY_MULTIPLIERS[activity];
    }, [currentWeight, age, heightFeet, heightInches, gender, activity]);

    const metabolicAge = useMemo(() => {
        // Simulated metabolic age based on activity and BMI
        const bmi = (currentWeight / Math.pow((heightFeet * 12 + heightInches), 2)) * 703;
        const activityBonus = { sedentary: 5, light: 2, moderate: 0, active: -3, veryActive: -5 };
        const bmiPenalty = bmi > 25 ? (bmi - 25) * 0.5 : 0;
        return Math.round(age + activityBonus[activity] + bmiPenalty);
    }, [age, currentWeight, heightFeet, heightInches, activity]);

    const projectionData = useMemo(() => {
        if (!showResults) return [];

        const dailyDeficit = 500 + (addWalking ? 150 : 0);
        const metabolicBoost = metabolicSupport ? 0.18 : 0;

        const data = [];
        let standardWeight = currentWeight;
        let boostedWeight = currentWeight;

        for (let week = 0; week <= 24; week++) {
            data.push({
                week: week,
                standard: Math.max(goalWeight, Math.round(standardWeight * 10) / 10),
                accelerated: Math.max(goalWeight, Math.round(boostedWeight * 10) / 10),
                goal: goalWeight,
            });

            const weeklyDeficit = dailyDeficit * 7;
            standardWeight -= weeklyDeficit / 3500;
            boostedWeight -= (weeklyDeficit * (1 + metabolicBoost)) / 3500;
        }

        return data;
    }, [showResults, currentWeight, goalWeight, addWalking, metabolicSupport]);

    const weeksToGoalStandard = useMemo(() => {
        const idx = projectionData.findIndex(d => d.standard <= goalWeight);
        return idx > 0 ? idx : projectionData.length;
    }, [projectionData, goalWeight]);

    const weeksToGoalAccelerated = useMemo(() => {
        const idx = projectionData.findIndex(d => d.accelerated <= goalWeight);
        return idx > 0 ? idx : projectionData.length;
    }, [projectionData, goalWeight]);

    const weeksSaved = weeksToGoalStandard - weeksToGoalAccelerated;
    const metabolicPercentile = useMemo(() => {
        // Based on activity level and age
        const base = { sedentary: 25, light: 45, moderate: 65, active: 80, veryActive: 92 };
        return base[activity] - Math.max(0, (age - 30) * 0.5);
    }, [activity, age]);

    return (
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl shadow-orange-900/10">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{goalLabel}</h2>
                <p className="text-slate-400">Science-based predictions using the Mifflin-St Jeor equation</p>
            </div>

            {!showResults ? (
                <div className="space-y-8">
                    {/* Weight Inputs with Live Preview */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex justify-between text-sm font-medium text-slate-300">
                                <span>Current Weight</span>
                                <span className="text-orange-400 font-bold">{currentWeight} lbs</span>
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="400"
                                value={currentWeight}
                                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <input
                                type="number"
                                value={currentWeight}
                                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex justify-between text-sm font-medium text-slate-300">
                                <span>Goal Weight</span>
                                <span className="text-orange-400 font-bold">{goalWeight} lbs</span>
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="300"
                                value={goalWeight}
                                onChange={(e) => setGoalWeight(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <input
                                type="number"
                                value={goalWeight}
                                onChange={(e) => setGoalWeight(Number(e.target.value))}
                                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Live Stats Preview */}
                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-3xl font-bold text-orange-400">
                                    <AnimatedNumber value={currentWeight - goalWeight} suffix=" lbs" />
                                </div>
                                <div className="text-sm text-slate-400">to lose</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">
                                    <AnimatedNumber value={Math.round(tdee)} />
                                </div>
                                <div className="text-sm text-slate-400">daily calories</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-amber-400">
                                    <AnimatedNumber value={Math.round((currentWeight - goalWeight) / 1.5)} suffix=" wks" />
                                </div>
                                <div className="text-sm text-slate-400">estimated</div>
                            </div>
                        </div>
                    </div>

                    {/* Height & Age */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Height (ft)</label>
                            <select
                                value={heightFeet}
                                onChange={(e) => setHeightFeet(Number(e.target.value))}
                                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            >
                                {[4, 5, 6, 7].map(ft => <option key={ft} value={ft}>{ft} ft</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Height (in)</label>
                            <select
                                value={heightInches}
                                onChange={(e) => setHeightInches(Number(e.target.value))}
                                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inch => <option key={inch} value={inch}>{inch} in</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Gender & Activity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['female', 'male'] as const).map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setGender(g)}
                                        className={`py-3 px-4 rounded-xl font-medium transition-all ${gender === g
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Activity Level</label>
                            <select
                                value={activity}
                                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            >
                                <option value="sedentary">Sedentary (Desk Job)</option>
                                <option value="light">Light (1-2 days/week)</option>
                                <option value="moderate">Moderate (3-5 days)</option>
                                <option value="active">Active (6-7 days)</option>
                                <option value="veryActive">Athlete Level</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowResults(true)}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 text-lg group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Generate My Timeline
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Gauges Row */}
                    <div className="flex justify-center gap-8 flex-wrap">
                        <CircularGauge value={currentWeight - goalWeight} max={100} label="lbs to lose" color="#F97316" />
                        <CircularGauge value={weeksToGoalAccelerated} max={24} label="weeks" color="#22C55E" />
                        <CircularGauge value={metabolicAge} max={80} min={20} label="metab. age" color={metabolicAge > age ? '#EF4444' : '#22C55E'} />
                    </div>

                    {/* Metabolic Age Insight */}
                    {metabolicAge > age && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <p className="text-red-400 font-medium">Your metabolism is running {metabolicAge - age} years older than your actual age.</p>
                                    <p className="text-slate-400 text-sm mt-1">This is often caused by mitochondrial inefficiency and can significantly slow weight loss.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Percentile Bar */}
                    <PercentileBar percentile={metabolicPercentile} label="Your Metabolism" />

                    {/* What-If Toggles */}
                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-4">🔮 What If Scenarios</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all group">
                                <span className="text-slate-300 group-hover:text-white transition-colors">Add 30-min daily walk (+150 cal burn)</span>
                                <div className={`w-12 h-6 rounded-full transition-all ${addWalking ? 'bg-orange-500' : 'bg-slate-600'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${addWalking ? 'translate-x-6' : ''}`} />
                                </div>
                                <input type="checkbox" checked={addWalking} onChange={(e) => setAddWalking(e.target.checked)} className="sr-only" />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl cursor-pointer hover:from-orange-500/20 hover:to-amber-500/20 transition-all group">
                                <span className="text-orange-300 group-hover:text-orange-200 transition-colors">Activate Metabolic Support (+18% efficiency)</span>
                                <div className={`w-12 h-6 rounded-full transition-all ${metabolicSupport ? 'bg-orange-500' : 'bg-slate-600'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${metabolicSupport ? 'translate-x-6' : ''}`} />
                                </div>
                                <input type="checkbox" checked={metabolicSupport} onChange={(e) => setMetabolicSupport(e.target.checked)} className="sr-only" />
                            </label>
                        </div>
                    </div>

                    {/* The Graph */}
                    <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Weight Loss Projection</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={projectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAccelerated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="week" stroke="#64748b" tickFormatter={(w) => `W${w}`} />
                                <YAxis stroke="#64748b" domain={[goalWeight - 5, currentWeight + 5]} tickFormatter={(w) => `${w}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    labelFormatter={(w) => `Week ${w}`}
                                />
                                <Legend />
                                <ReferenceLine y={goalWeight} stroke="#22C55E" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#22C55E', position: 'right' }} />
                                <Area type="monotone" dataKey="standard" name="Standard" stroke="#64748B" fill="url(#colorStandard)" strokeWidth={2} />
                                <Area type="monotone" dataKey="accelerated" name="Accelerated" stroke="#F97316" fill="url(#colorAccelerated)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Results Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-slate-400">
                                <AnimatedNumber value={weeksToGoalStandard} suffix=" wks" />
                            </div>
                            <div className="text-sm text-slate-500">Standard Path</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-orange-400">
                                <AnimatedNumber value={weeksToGoalAccelerated} suffix=" wks" />
                            </div>
                            <div className="text-sm text-orange-300">Accelerated Path</div>
                            {weeksSaved > 0 && <div className="text-xs text-green-400 mt-1">Save {weeksSaved} weeks!</div>}
                        </div>
                    </div>

                    {/* CTA Box */}
                    {metabolicSupport && (
                        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl p-6 border border-orange-500/30">
                            <h3 className="text-xl font-bold text-orange-400 mb-3">📊 Your Accelerated Plan</h3>
                            <p className="text-slate-300 leading-relaxed mb-4">
                                With metabolic optimization, you could reach your goal <strong className="text-orange-400">{weeksSaved} weeks faster</strong>.
                                The key is supporting your mitochondria—the powerhouses of your cells that convert food into energy.
                            </p>
                            <p className="text-xs text-center text-slate-500 mb-3 uppercase tracking-widest">Recommended Supplement</p>
                            <button
                                onClick={() => window.open(CONFIG.AFFILIATE_LINK, '_blank')}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 text-lg"
                            >
                                Get Mitolyn (Metabolic Support) →
                            </button>
                            <p className="text-xs text-center text-slate-600 mt-3">Natural mitochondrial optimization • 90-day guarantee</p>
                        </div>
                    )}

                    <button
                        onClick={() => setShowResults(false)}
                        className="w-full text-slate-500 hover:text-white transition-colors py-2 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Recalculate
                    </button>
                </div>
            )}

            {/* Science Footer */}
            <details className="mt-8 text-sm">
                <summary className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">
                    How is this calculated?
                </summary>
                <div className="mt-3 p-4 bg-slate-800/30 rounded-xl text-slate-400 space-y-2">
                    <p><strong className="text-slate-300">Mifflin-St Jeor Equation (1990):</strong></p>
                    <p className="font-mono text-xs">Men: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5</p>
                    <p className="font-mono text-xs">Women: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161</p>
                    <p className="mt-2">This equation has been validated as the most accurate predictor of Resting Metabolic Rate in clinical studies.</p>
                </div>
            </details>
        </div>
    );
}
