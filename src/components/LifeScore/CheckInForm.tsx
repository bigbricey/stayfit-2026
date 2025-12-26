'use client';

import { useState } from 'react';
import { DIMENSIONS, DimensionKey, calculateDailyScore, getTodayString, processCheckIn, DailyCheckIn, PlayerData, calculateXPEarned } from './types';
import { Zap, Shield, Swords } from 'lucide-react';

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
        if (score >= 95) return { rank: 'S', color: 'text-amber-400 glow-text-gold', bg: 'from-amber-500/20 to-amber-600/10' };
        if (score >= 85) return { rank: 'A', color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/10' };
        if (score >= 70) return { rank: 'B', color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-600/10' };
        if (score >= 55) return { rank: 'C', color: 'text-green-400', bg: 'from-green-500/20 to-green-600/10' };
        if (score >= 40) return { rank: 'D', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-600/10' };
        return { rank: 'E', color: 'text-red-400', bg: 'from-red-500/20 to-red-600/10' };
    };

    const rankInfo = getRankFromScore(previewScore);

    return (
        <div className="space-y-6">
            {/* Notification Panel Header */}
            <div className="notification-panel rounded-lg p-4 text-center animate-glow">
                <div className="flex items-center justify-center gap-2 text-cyan-300 text-sm tracking-widest uppercase mb-2">
                    <Shield size={16} />
                    <span>Daily Combat Report</span>
                    <Shield size={16} />
                </div>
                <p className="text-cyan-100/70 text-xs">
                    Current Level: {player.progress.level} | Streak: {player.currentStreak} days
                </p>
            </div>

            {/* Live Score Preview with XP */}
            <div className={`panel-bg glow-border rounded-xl p-6 text-center bg-gradient-to-br ${rankInfo.bg}`}>
                <p className="text-cyan-400/60 text-xs tracking-wider uppercase mb-2">Projected Power Level</p>
                <div className="flex items-center justify-center gap-4 mb-2">
                    <span className={`text-7xl font-black ${rankInfo.color}`}>
                        {rankInfo.rank}
                    </span>
                    <div className="text-left">
                        <span className="text-4xl font-bold text-white glow-text">{previewScore}</span>
                        <p className="text-cyan-400/60 text-xs">/ 100</p>
                    </div>
                </div>
                <p className="text-emerald-400 text-sm font-bold">
                    +{previewXP} XP {existingCheckIn ? '(update)' : ''}
                </p>
            </div>

            {/* Stat Sliders */}
            <div className="space-y-4">
                {DIMENSIONS.map((dim, index) => {
                    const value = scores[dim.key];
                    const percentage = value * 10;

                    return (
                        <div
                            key={dim.key}
                            className="panel-bg rounded-lg p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{dim.emoji}</span>
                                    <div>
                                        <span className="font-bold text-cyan-100 tracking-wide">
                                            {dim.label}
                                        </span>
                                        <span className="text-xs text-cyan-400/50 ml-2">({dim.fullLabel})</span>
                                        <p className="text-xs text-cyan-400/50">{dim.description}</p>
                                    </div>
                                </div>
                                <div className={`
                                    w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl
                                    ${value >= 8 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                                        value >= 6 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' :
                                            value >= 4 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                                'bg-red-500/20 text-red-400 border border-red-500/50'}
                                `}>
                                    {value}
                                </div>
                            </div>

                            {/* Progress bar behind slider */}
                            <div className="relative">
                                <div className="absolute inset-0 h-2 mt-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${value >= 8 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                                                value >= 6 ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                                                    value >= 4 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                                                        'bg-gradient-to-r from-red-600 to-red-400'
                                            }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={value}
                                    onChange={(e) => handleScoreChange(dim.key, parseInt(e.target.value))}
                                    className="relative z-10 w-full"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Notes */}
            <div className="panel-bg glow-border rounded-xl p-4">
                <label className="text-sm font-bold text-cyan-400 tracking-wider uppercase mb-2 block">
                    📜 Battle Log (Optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Record your victories and lessons learned..."
                    className="w-full p-3 rounded-lg bg-slate-900/50 border border-cyan-500/30
                               text-cyan-100 placeholder-cyan-400/30
                               focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
                               resize-none transition-all"
                    rows={3}
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSave}
                disabled={showSaveAnim}
                className={`
                    relative w-full py-5 rounded-xl font-black text-lg tracking-wider uppercase
                    flex items-center justify-center gap-3
                    transition-all duration-300 overflow-hidden
                    ${showSaveAnim
                        ? 'bg-cyan-500/30 text-white'
                        : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white glow-border animate-glow'
                    }
                `}
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
                        <span>Submit Combat Report</span>
                    </>
                )}
            </button>
        </div>
    );
}
