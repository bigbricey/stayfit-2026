'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
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

export default function TimelineCalculator({
    defaultCurrentWeight = 200,
    defaultGoalWeight = 160,
    goalLabel = "Your Weight Loss Goal"
}: TimelineCalculatorProps) {
    const [currentWeight, setCurrentWeight] = useState(defaultCurrentWeight);
    const [goalWeight, setGoalWeight] = useState(defaultGoalWeight);
    const [age, setAge] = useState(35);
    const [heightFeet, setHeightFeet] = useState(5);
    const [heightInches, setHeightInches] = useState(8);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [activity, setActivity] = useState<ActivityLevel>('light');
    const [showResults, setShowResults] = useState(false);

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

    const projectionData = useMemo(() => {
        if (!showResults) return [];

        const tdee = calculateBMR(currentWeight) * ACTIVITY_MULTIPLIERS[activity];
        const dailyDeficit = 500; // Standard 500 cal deficit = ~1lb/week
        const metabolicBoost = 0.15; // 15% more efficient with "metabolic support"

        const data = [];
        let standardWeight = currentWeight;
        let boostedWeight = currentWeight;

        // Project 24 weeks
        for (let week = 0; week <= 24; week++) {
            data.push({
                week: week,
                standard: Math.max(goalWeight, Math.round(standardWeight * 10) / 10),
                accelerated: Math.max(goalWeight, Math.round(boostedWeight * 10) / 10),
                goal: goalWeight,
            });

            // Weekly weight loss calculation
            // 3500 calories = 1 lb
            const weeklyDeficit = dailyDeficit * 7;
            standardWeight -= weeklyDeficit / 3500;
            boostedWeight -= (weeklyDeficit * (1 + metabolicBoost)) / 3500;
        }

        return data;
    }, [showResults, currentWeight, goalWeight, age, heightFeet, heightInches, gender, activity]);

    const weeksToGoalStandard = useMemo(() => {
        return projectionData.findIndex(d => d.standard <= goalWeight) || projectionData.length;
    }, [projectionData, goalWeight]);

    const weeksToGoalAccelerated = useMemo(() => {
        return projectionData.findIndex(d => d.accelerated <= goalWeight) || projectionData.length;
    }, [projectionData, goalWeight]);

    const weeksSaved = weeksToGoalStandard - weeksToGoalAccelerated;

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">{goalLabel}</h2>
            <p className="text-slate-400 text-center mb-8">See exactly when you'll reach your target weight</p>

            {!showResults ? (
                <div className="space-y-6">
                    {/* Weight Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Current Weight (lbs)</label>
                            <input
                                type="number"
                                value={currentWeight}
                                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Goal Weight (lbs)</label>
                            <input
                                type="number"
                                value={goalWeight}
                                onChange={(e) => setGoalWeight(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Height & Age */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Height (ft)</label>
                            <select
                                value={heightFeet}
                                onChange={(e) => setHeightFeet(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {[4, 5, 6, 7].map(ft => <option key={ft} value={ft}>{ft} ft</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Height (in)</label>
                            <select
                                value={heightInches}
                                onChange={(e) => setHeightInches(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inch => <option key={inch} value={inch}>{inch} in</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Gender & Activity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Gender</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Activity Level</label>
                            <select
                                value={activity}
                                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="sedentary">Sedentary (Office Job)</option>
                                <option value="light">Light (1-2 days/week)</option>
                                <option value="moderate">Moderate (3-5 days/week)</option>
                                <option value="active">Active (6-7 days/week)</option>
                                <option value="veryActive">Very Active (Athlete)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowResults(true)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-lg"
                    >
                        Generate My Timeline →
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-3xl font-bold text-white">{currentWeight - goalWeight}</div>
                            <div className="text-sm text-slate-400">lbs to lose</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="text-3xl font-bold text-slate-400">{weeksToGoalStandard}</div>
                            <div className="text-sm text-slate-500">weeks (standard)</div>
                        </div>
                        <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-700">
                            <div className="text-3xl font-bold text-emerald-400">{weeksToGoalAccelerated}</div>
                            <div className="text-sm text-emerald-500">weeks (accelerated)</div>
                        </div>
                    </div>

                    {/* The Graph */}
                    <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Weight Loss Projection</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={projectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="week"
                                    stroke="#64748b"
                                    tickFormatter={(w) => `W${w}`}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    domain={[goalWeight - 5, currentWeight + 5]}
                                    tickFormatter={(w) => `${w} lbs`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                    }}
                                    labelFormatter={(w) => `Week ${w}`}
                                />
                                <Legend />
                                <ReferenceLine y={goalWeight} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#10b981', position: 'right' }} />
                                <Line
                                    type="monotone"
                                    dataKey="standard"
                                    name="Standard Diet"
                                    stroke="#64748b"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="accelerated"
                                    name="Metabolic Support"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Analysis Box */}
                    <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-6 border border-emerald-800">
                        <h3 className="text-lg font-bold text-emerald-400 mb-3">📊 Analysis</h3>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Based on your metabolic profile, you could reach your goal <strong className="text-emerald-400">{weeksSaved} weeks faster</strong> by
                            optimizing your mitochondrial function. The green line shows your projected results with enhanced cellular energy production.
                        </p>
                        <p className="text-slate-400 text-sm mb-6">
                            Your metabolism might be the bottleneck. To achieve the accelerated timeline, consider supporting your body's natural fat-burning processes at the cellular level.
                        </p>

                        <div className="text-xs text-center text-slate-500 mb-2 uppercase tracking-widest">Sponsored Option</div>
                        <button
                            onClick={() => window.open(CONFIG.AFFILIATE_LINK, '_blank')}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-lg animate-pulse hover:animate-none"
                        >
                            Activate Metabolic Support →
                        </button>
                        <p className="text-xs text-center text-slate-600 mt-2">Natural mitochondrial optimization supplement</p>
                    </div>

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
