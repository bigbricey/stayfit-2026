'use client';

import { useState } from 'react';
import { DIMENSIONS, DimensionKey, calculateDailyScore, getTodayString, processCheckIn, DailyCheckIn, PlayerData, calculateXPEarned } from './types';
import { CircularDial } from './CircularDial';
import { ChevronRight, ChevronLeft, Zap, Trophy, TrendingUp, Flame, Sparkles } from 'lucide-react';

interface StatEntryWizardProps {
    player: PlayerData;
    existingCheckIn: DailyCheckIn | null;
    onComplete: (xpGained: number, leveledUp: boolean, newPlayer: PlayerData) => void;
    onCancel: () => void;
}

type WizardStep = 'intro' | number | 'summary';

export function StatEntryWizard({ player, existingCheckIn, onComplete, onCancel }: StatEntryWizardProps) {
    const [step, setStep] = useState<WizardStep>('intro');
    const [scores, setScores] = useState<Record<DimensionKey, number>>({
        nutrition: existingCheckIn?.nutrition ?? 5,
        fitness: existingCheckIn?.fitness ?? 5,
        work: existingCheckIn?.work ?? 5,
        social: existingCheckIn?.social ?? 5,
        safety: existingCheckIn?.safety ?? 5,
        health: existingCheckIn?.health ?? 5,
    });
    const [result, setResult] = useState<{ xpGained: number; leveledUp: boolean; newPlayer: PlayerData } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleScoreChange = (dimension: DimensionKey, value: number) => {
        setScores(prev => ({ ...prev, [dimension]: value }));
    };

    const handleNext = () => {
        if (step === 'intro') {
            setStep(0);
        } else if (typeof step === 'number') {
            if (step < DIMENSIONS.length - 1) {
                setStep(step + 1);
            } else {
                // Process and go to summary
                setIsProcessing(true);
                setTimeout(() => {
                    const checkIn: DailyCheckIn = {
                        date: getTodayString(),
                        ...scores,
                        createdAt: new Date().toISOString(),
                    };
                    const processResult = processCheckIn(checkIn);
                    setResult({
                        xpGained: processResult.xpGained,
                        leveledUp: processResult.leveledUp,
                        newPlayer: processResult.player,
                    });
                    setIsProcessing(false);
                    setStep('summary');
                }, 1500);
            }
        }
    };

    const handleBack = () => {
        if (typeof step === 'number') {
            if (step > 0) {
                setStep(step - 1);
            } else {
                setStep('intro');
            }
        }
    };

    const handleFinish = () => {
        if (result) {
            onComplete(result.xpGained, result.leveledUp, result.newPlayer);
        }
    };

    // Intro Screen
    if (step === 'intro') {
        const previewScore = calculateDailyScore(scores);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#020408] via-[#0a1628] to-[#020408]">
                <div className="notification-panel rounded-2xl p-8 max-w-md w-full text-center animate-glow">
                    <div className="mb-6">
                        <Flame className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                        <h1 className="text-2xl font-black tracking-wider text-cyan-100 mb-2">
                            DAILY STATUS REPORT
                        </h1>
                        <p className="text-cyan-400/60 text-sm">
                            Level {player.progress.level} • {player.progress.title}
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <p className="text-cyan-300/80 text-sm">
                            Rate your performance in 6 life dimensions
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {DIMENSIONS.map(dim => (
                                <span
                                    key={dim.key}
                                    className="px-3 py-1 rounded-full border border-cyan-500/30 text-xs text-cyan-400"
                                >
                                    {dim.emoji} {dim.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full py-4 rounded-xl font-black text-lg tracking-wider uppercase
                                   bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 
                                   hover:from-cyan-500 hover:via-cyan-400 hover:to-purple-500 
                                   text-white transition-all duration-300 flex items-center justify-center gap-3"
                        style={{ boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)' }}
                    >
                        <span>Begin Entry</span>
                        <ChevronRight size={24} />
                    </button>

                    <button
                        onClick={onCancel}
                        className="mt-4 text-cyan-400/50 hover:text-cyan-400 text-sm transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Processing Screen
    if (isProcessing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#020408] via-[#0a1628] to-[#020408]">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
                    <h2 className="text-xl font-black text-cyan-100 tracking-wider animate-pulse">
                        CALCULATING RESULTS...
                    </h2>
                </div>
            </div>
        );
    }

    // Summary Screen
    if (step === 'summary' && result) {
        const dailyScore = calculateDailyScore(scores);
        const oldLevel = player.progress.level;
        const newLevel = result.newPlayer.progress.level;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#020408] via-[#0a1628] to-[#020408]">
                <div className="notification-panel rounded-2xl p-8 max-w-md w-full text-center animate-glow">
                    {/* Header */}
                    <div className="mb-6">
                        {result.leveledUp ? (
                            <Trophy className="w-20 h-20 mx-auto text-amber-400 animate-bounce" />
                        ) : (
                            <Sparkles className="w-16 h-16 mx-auto text-cyan-400" />
                        )}
                        <h1 className="text-2xl font-black tracking-wider text-cyan-100 mt-4">
                            {result.leveledUp ? 'LEVEL UP!' : 'MISSION COMPLETE'}
                        </h1>
                    </div>

                    {/* Score */}
                    <div className="panel-bg glow-border rounded-xl p-6 mb-6">
                        <p className="text-xs tracking-widest text-cyan-400/60 uppercase mb-2">Daily Score</p>
                        <p className="text-5xl font-black text-white glow-text">{dailyScore}</p>
                        <p className="text-cyan-400/60 text-sm mt-1">/100</p>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="panel-bg rounded-xl p-4 text-center">
                            <Zap className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
                            <p className="text-2xl font-black text-emerald-400">+{result.xpGained}</p>
                            <p className="text-xs text-cyan-400/60 uppercase tracking-wider">XP Earned</p>
                        </div>
                        <div className="panel-bg rounded-xl p-4 text-center">
                            <TrendingUp className="w-6 h-6 mx-auto text-purple-400 mb-2" />
                            <p className="text-2xl font-black text-purple-400">
                                {result.leveledUp ? (
                                    <span>{oldLevel} → {newLevel}</span>
                                ) : (
                                    <span>Lv. {newLevel}</span>
                                )}
                            </p>
                            <p className="text-xs text-cyan-400/60 uppercase tracking-wider">Level</p>
                        </div>
                    </div>

                    {/* Stat Breakdown */}
                    <div className="panel-bg rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-6 gap-2">
                            {DIMENSIONS.map(dim => (
                                <div key={dim.key} className="text-center">
                                    <span className="text-xl">{dim.emoji}</span>
                                    <p className="text-lg font-bold text-cyan-100">{scores[dim.key]}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleFinish}
                        className="w-full py-4 rounded-xl font-black text-lg tracking-wider uppercase
                                   bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600 
                                   hover:from-emerald-500 hover:via-emerald-400 hover:to-cyan-500 
                                   text-white transition-all duration-300"
                        style={{ boxShadow: '0 0 40px rgba(34, 197, 94, 0.5)' }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // Stat Entry Step
    if (typeof step === 'number') {
        const dim = DIMENSIONS[step];
        const currentScore = scores[dim.key];

        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#020408] via-[#0a1628] to-[#020408]">
                {/* Progress Bar */}
                <div className="p-4">
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-xs text-cyan-400/60 mb-2">
                            <span>Step {step + 1} of {DIMENSIONS.length}</span>
                            <span>{Math.round(((step + 1) / DIMENSIONS.length) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${((step + 1) / DIMENSIONS.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="text-center mb-8">
                        <span className="text-6xl mb-4 block">{dim.emoji}</span>
                        <h2 className="text-3xl font-black tracking-wider text-cyan-100 mb-2">
                            {dim.fullLabel.toUpperCase()}
                        </h2>
                        <p className="text-cyan-400/60">{dim.description}</p>
                    </div>

                    {/* Big Dial */}
                    <div className="transform scale-150 mb-12">
                        <CircularDial
                            value={currentScore}
                            onChange={(val) => handleScoreChange(dim.key, val)}
                            label={dim.label}
                            fullLabel=""
                            emoji=""
                        />
                    </div>

                    {/* Value Display */}
                    <div className="text-center mb-8">
                        <p className="text-xs tracking-widest text-cyan-400/60 uppercase mb-2">Rating</p>
                        <p className="text-4xl font-black text-white glow-text">{currentScore}/10</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-6">
                    <div className="max-w-md mx-auto flex gap-4">
                        <button
                            onClick={handleBack}
                            className="flex-1 py-4 rounded-xl font-bold tracking-wider uppercase
                                       bg-slate-800 hover:bg-slate-700 text-cyan-100
                                       transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={20} />
                            <span>Back</span>
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-2 py-4 px-8 rounded-xl font-black tracking-wider uppercase
                                       bg-gradient-to-r from-cyan-600 to-purple-600 
                                       hover:from-cyan-500 hover:to-purple-500 
                                       text-white transition-all duration-300 flex items-center justify-center gap-2"
                            style={{ boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' }}
                        >
                            <span>{step === DIMENSIONS.length - 1 ? 'Finish' : 'Next'}</span>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
