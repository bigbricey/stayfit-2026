'use client';

import { useState } from 'react';
import { DIMENSIONS, DimensionKey, calculateDailyScore, getTodayString, processCheckIn, DailyCheckIn, PlayerData, calculateXPEarned } from './types';
import { CircularDial } from './CircularDial';
import { Zap, Shield, Swords, Crown } from 'lucide-react';

interface CheckInFormProps {
    existingCheckIn: DailyCheckIn | null;
    onCheckInSaved: (xpGained: number, leveledUp: boolean, newPlayer: PlayerData) => void;
    player: PlayerData;
}

export function CheckInForm({ existingCheckIn, onCheckInSaved, player }: CheckInFormProps) {
    const [scores, setScores] = useState<Record<DimensionKey, number>>({
        nutrition: existingCheckIn?.nutrition ?? 5,
        fitness: existingCheckIn?.fitness ?? 5,
        work: existingCheckIn?.work ?? 5,
        social: existingCheckIn?.social ?? 5,
        safety: existingCheckIn?.safety ?? 5,
        health: existingCheckIn?.health ?? 5,
    });
    const [notes, setNotes] = useState(existingCheckIn?.notes ?? '');
    const [showSaveAnim, setShowSaveAnim] = useState(false);

    const handleScoreChange = (dimension: DimensionKey, value: number) => {
        setScores(prev => ({ ...prev, [dimension]: value }));
    };

    const handleSave = () => {
        const checkIn: DailyCheckIn = {
            date: getTodayString(),
            ...scores,
            notes: notes.trim() || undefined,
            createdAt: new Date().toISOString(),
        };

        setShowSaveAnim(true);

        setTimeout(() => {
            const result = processCheckIn(checkIn);
            setShowSaveAnim(false);
            onCheckInSaved(result.xpGained, result.leveledUp, result.player);
        }, 1500);
    };

    const previewScore = calculateDailyScore(scores);
    const previewXP = calculateXPEarned(previewScore, player.currentStreak);

    const getRankFromScore = (score: number) => {
        if (score >= 95) return { rank: 'S', color: 'rank-s', title: 'MONARCH' };
        if (score >= 85) return { rank: 'A', color: 'rank-a', title: 'ELITE' };
        if (score >= 70) return { rank: 'B', color: 'rank-b', title: 'HUNTER' };
        if (score >= 55) return { rank: 'C', color: 'rank-c', title: 'WARRIOR' };
        if (score >= 40) return { rank: 'D', color: 'rank-d', title: 'TRAINEE' };
        return { rank: 'E', color: 'rank-e', title: 'CIVILIAN' };
    };

    const rankInfo = getRankFromScore(previewScore);

    return (
        <div className="space-y-5 p-4">
            {/* Header Panel */}
            <div className="notification-panel rounded-xl p-5 text-center corner-decoration">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Crown className="text-amber-400 w-5 h-5" />
                    <span className="text-xs font-black tracking-[0.3em] text-cyan-300 uppercase">
                        Daily Status Report
                    </span>
                    <Crown className="text-amber-400 w-5 h-5" />
                </div>
                <p className="text-cyan-400/70 text-xs tracking-wider">
                    LEVEL {player.progress.level} • {player.progress.title} • STREAK: {player.currentStreak} DAYS
                </p>
            </div>

            {/* Power Level Display */}
            <div className="notification-panel rounded-xl p-6 text-center animate-glow">
                <p className="text-[10px] font-bold tracking-[0.4em] text-cyan-400/60 uppercase mb-3">
                    Projected Power Level
                </p>

                <div className="flex items-center justify-center gap-6">
                    <span className={`text-8xl font-black ${rankInfo.color}`}>
                        {rankInfo.rank}
                    </span>
                    <div className="text-left">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white glow-text">{previewScore}</span>
                            <span className="text-cyan-400/50">/100</span>
                        </div>
                        <p className={`text-sm font-bold tracking-wider ${rankInfo.color}`}>
                            {rankInfo.title}
                        </p>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-cyan-500/20">
                    <span className="text-emerald-400 font-black text-lg glow-text">
                        +{previewXP} XP
                    </span>
                </div>
            </div>

            {/* Circular Dial Grid */}
            <div className="panel-bg glow-border rounded-xl p-6">
                <p className="text-center text-xs font-bold tracking-[0.3em] text-cyan-400/60 uppercase mb-6">
                    Drag Dials to Set Stats
                </p>
                <div className="grid grid-cols-3 gap-4">
                    {DIMENSIONS.map((dim) => (
                        <CircularDial
                            key={dim.key}
                            value={scores[dim.key]}
                            onChange={(val) => handleScoreChange(dim.key, val)}
                            label={dim.label}
                            fullLabel={dim.fullLabel}
                            emoji={dim.emoji}
                        />
                    ))}
                </div>
            </div>

            {/* Notes Section */}
            <div className="panel-bg glow-border rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-bold text-cyan-400 tracking-wider uppercase mb-3">
                    <span className="text-xl">📜</span>
                    Battle Log
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Record your victories and lessons..."
                    className="w-full p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30
                               text-cyan-100 placeholder-cyan-400/30 text-sm
                               focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
                               resize-none transition-all"
                    rows={2}
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSave}
                disabled={showSaveAnim}
                className={`
                    relative w-full py-5 rounded-xl font-black text-lg tracking-wider uppercase
                    flex items-center justify-center gap-4
                    transition-all duration-300 overflow-hidden
                    ${showSaveAnim
                        ? 'bg-cyan-500/30 text-white'
                        : 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-purple-500 text-white'
                    }
                `}
                style={{
                    boxShadow: showSaveAnim ? 'none' : '0 0 40px rgba(0, 212, 255, 0.6), 0 0 80px rgba(0, 212, 255, 0.3)'
                }}
            >
                {showSaveAnim ? (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                        <Zap size={24} className="animate-bounce" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <Swords size={24} />
                        <span>Submit Report</span>
                        <Swords size={24} />
                    </>
                )}
            </button>
        </div>
    );
}
