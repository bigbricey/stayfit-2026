'use client';

import React, { useState, useMemo } from 'react';
import { CONFIG } from '@/config';

// Animated Number Counter
function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        let startTime: number;
        let animationFrame: number;
        const startValue = displayValue;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / 800, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(startValue + (value - startValue) * easeOut);
            if (progress < 1) animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value]);

    return <>{displayValue.toFixed(decimals)}</>;
}

// BMI Gauge with color zones
function BMIGauge({ bmi }: { bmi: number }) {
    const getColor = (bmi: number) => {
        if (bmi < 18.5) return '#3B82F6'; // Underweight - Blue
        if (bmi < 25) return '#22C55E';   // Normal - Green
        if (bmi < 30) return '#F59E0B';   // Overweight - Amber
        return '#EF4444';                  // Obese - Red
    };

    const getCategory = (bmi: number) => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        if (bmi < 35) return 'Obese (Class I)';
        if (bmi < 40) return 'Obese (Class II)';
        return 'Obese (Class III)';
    };

    const percentage = Math.min(Math.max((bmi - 15) / 25, 0), 1);
    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference * (1 - percentage * 0.75);

    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform rotate-[135deg]" viewBox="0 0 160 160">
                {/* Background arc */}
                <circle cx="80" cy="80" r="70" fill="none" stroke="#1E293B" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={circumference * 0.75} strokeDashoffset={0} />
                {/* Colored arc */}
                <circle cx="80" cy="80" r="70" fill="none" stroke={getColor(bmi)} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={circumference * 0.75} strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 12px ${getColor(bmi)}50)` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">
                    <AnimatedNumber value={bmi} />
                </span>
                <span className="text-sm text-slate-400 uppercase tracking-wide mt-1">BMI</span>
                <span className={`text-sm font-medium mt-2`} style={{ color: getColor(bmi) }}>
                    {getCategory(bmi)}
                </span>
            </div>
        </div>
    );
}

// Body visualization
function BodyVisualization({ bmi }: { bmi: number }) {
    const getBodyType = (bmi: number) => {
        if (bmi < 18.5) return '🏃‍♂️';
        if (bmi < 25) return '🧍';
        if (bmi < 30) return '🧍';
        return '🧍';
    };

    return (
        <div className="text-6xl text-center opacity-50">
            {getBodyType(bmi)}
        </div>
    );
}

export default function BMICalculator() {
    const [weight, setWeight] = useState(180);
    const [heightFeet, setHeightFeet] = useState(5);
    const [heightInches, setHeightInches] = useState(8);
    const [showResults, setShowResults] = useState(false);

    const bmi = useMemo(() => {
        const heightTotal = heightFeet * 12 + heightInches;
        return (weight / Math.pow(heightTotal, 2)) * 703;
    }, [weight, heightFeet, heightInches]);

    const idealWeightRange = useMemo(() => {
        const heightTotal = heightFeet * 12 + heightInches;
        const minWeight = (18.5 * Math.pow(heightTotal, 2)) / 703;
        const maxWeight = (24.9 * Math.pow(heightTotal, 2)) / 703;
        return { min: Math.round(minWeight), max: Math.round(maxWeight) };
    }, [heightFeet, heightInches]);

    const weightToLose = useMemo(() => {
        if (bmi <= 24.9) return 0;
        return Math.round(weight - idealWeightRange.max);
    }, [bmi, weight, idealWeightRange]);

    const percentileRank = useMemo(() => {
        // Approximate percentile based on US adult BMI distribution
        if (bmi < 18.5) return 5;
        if (bmi < 20) return 15;
        if (bmi < 22) return 30;
        if (bmi < 24) return 45;
        if (bmi < 26) return 55;
        if (bmi < 28) return 65;
        if (bmi < 30) return 73;
        if (bmi < 35) return 85;
        return 95;
    }, [bmi]);

    return (
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">BMI Calculator</h2>
                <p className="text-slate-400">Calculate your Body Mass Index instantly</p>
            </div>

            {!showResults ? (
                <div className="space-y-8">
                    {/* Weight Slider */}
                    <div className="space-y-3">
                        <label className="flex justify-between text-sm font-medium text-slate-300">
                            <span>Weight</span>
                            <span className="text-orange-400 font-bold text-lg">{weight} lbs</span>
                        </label>
                        <input
                            type="range"
                            min="80"
                            max="400"
                            value={weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>80 lbs</span>
                            <span>400 lbs</span>
                        </div>
                    </div>

                    {/* Height */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">Height (feet)</label>
                            <div className="flex gap-2">
                                {[4, 5, 6, 7].map((ft) => (
                                    <button
                                        key={ft}
                                        onClick={() => setHeightFeet(ft)}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${heightFeet === ft
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {ft}′
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">Height (inches)</label>
                            <select
                                value={heightInches}
                                onChange={(e) => setHeightInches(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inch) => (
                                    <option key={inch} value={inch}>{inch}″</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-400">Your Height</div>
                                <div className="text-2xl font-bold text-white">{heightFeet}′ {heightInches}″</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-400">Current BMI</div>
                                <div className="text-2xl font-bold text-orange-400">
                                    <AnimatedNumber value={bmi} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowResults(true)}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 text-lg group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Calculate My BMI
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* BMI Gauge */}
                    <BMIGauge bmi={bmi} />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white">{heightFeet}′{heightInches}″</div>
                            <div className="text-xs text-slate-400">Height</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white">{weight}</div>
                            <div className="text-xs text-slate-400">lbs</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-orange-400">{Math.round(bmi * 10) / 10}</div>
                            <div className="text-xs text-slate-400">BMI</div>
                        </div>
                    </div>

                    {/* Percentile Bar */}
                    <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>Underweight</span>
                            <span>Normal</span>
                            <span>Overweight</span>
                            <span>Obese</span>
                        </div>
                        <div className="relative h-4 rounded-full overflow-hidden">
                            <div className="absolute inset-0 flex">
                                <div className="w-[12%] bg-blue-500" />
                                <div className="w-[23%] bg-green-500" />
                                <div className="w-[18%] bg-amber-500" />
                                <div className="flex-1 bg-red-500" />
                            </div>
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-white rounded-sm border-2 border-slate-900 shadow-lg transition-all duration-1000"
                                style={{ left: `calc(${Math.min(Math.max((bmi - 15) / 30, 0), 1) * 100}% - 8px)` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>15</span>
                            <span>18.5</span>
                            <span>25</span>
                            <span>30</span>
                            <span>45</span>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="space-y-4">
                        <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <p className="text-slate-300">You rank in the <strong className="text-orange-400">top {100 - percentileRank}%</strong> of American adults by BMI.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🎯</span>
                                <div>
                                    <p className="text-slate-300">Your ideal weight range for this height is <strong className="text-green-400">{idealWeightRange.min} - {idealWeightRange.max} lbs</strong></p>
                                </div>
                            </div>
                        </div>

                        {weightToLose > 0 && (
                            <div className="bg-orange-500/10 rounded-xl p-5 border border-orange-500/30">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">💡</span>
                                    <div>
                                        <p className="text-orange-300">You would need to lose <strong className="text-orange-400">{weightToLose} lbs</strong> to reach the healthy BMI range.</p>
                                        <p className="text-slate-400 text-sm mt-1">Use our Timeline Forecaster to see how long this would take.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    {weightToLose > 0 && (
                        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl p-6 border border-orange-500/30">
                            <h3 className="text-lg font-bold text-orange-400 mb-2">Ready to Reach Your Goal?</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                Use our Timeline Forecaster to see exactly when you could reach {idealWeightRange.max} lbs.
                            </p>
                            <a
                                href="/"
                                className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/25 text-center"
                            >
                                Calculate My Timeline →
                            </a>
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
        </div>
    );
}
