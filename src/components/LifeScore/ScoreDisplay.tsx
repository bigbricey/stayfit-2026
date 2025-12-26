'use client';

import { getLetterGrade, DailyCheckIn, calculateDailyScore, DIMENSIONS } from './types';
import { Flame, Trophy, Crown, Swords, Shield, Target } from 'lucide-react';

interface ScoreDisplayProps {
    checkIn: DailyCheckIn;
    currentStreak: number;
    longestStreak: number;
}

export function ScoreDisplay({ checkIn, currentStreak, longestStreak }: ScoreDisplayProps) {
    const score = calculateDailyScore(checkIn);

    const getRankInfo = (score: number) => {
        if (score >= 95) return { rank: 'S', title: 'MONARCH', color: 'text-amber-400', glow: 'glow-text-gold', borderClass: 'glow-border-gold', icon: Crown };
        if (score >= 85) return { rank: 'A', title: 'ELITE', color: 'text-purple-400', glow: '', borderClass: 'glow-border-purple', icon: Trophy };
        if (score >= 70) return { rank: 'B', title: 'HUNTER', color: 'text-cyan-400', glow: 'glow-text', borderClass: 'glow-border', icon: Swords };
        if (score >= 55) return { rank: 'C', title: 'WARRIOR', color: 'text-green-400', glow: '', borderClass: 'glow-border', icon: Shield };
        if (score >= 40) return { rank: 'D', title: 'TRAINEE', color: 'text-yellow-400', glow: '', borderClass: 'glow-border', icon: Target };
        return { rank: 'E', title: 'CIVILIAN', color: 'text-red-400', glow: '', borderClass: 'glow-border', icon: Shield };
    };

    const rankInfo = getRankInfo(score);
    const RankIcon = rankInfo.icon;

    return (
        <div className="space-y-6">
            {/* Main Score Card - Solo Leveling Style */}
            <div className={`notification-panel rounded-xl p-6 animate-glow`}>
                {/* Header */}
                <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs tracking-[0.3em] uppercase mb-4 pb-3 border-b border-cyan-500/30">
                    <Shield size={14} />
                    <span>Status Window</span>
                    <Shield size={14} />
                </div>

                {/* Rank and Score */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center gap-4 mb-2">
                        <div className={`text-8xl font-black ${rankInfo.color} ${rankInfo.glow}`}>
                            {rankInfo.rank}
                        </div>
                        <RankIcon size={40} className={rankInfo.color} />
                    </div>
                    <p className={`text-lg font-bold tracking-[0.2em] ${rankInfo.color}`}>
                        {rankInfo.title}
                    </p>
                </div>

                {/* Power Level */}
                <div className="panel-bg rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-cyan-400/60 text-xs tracking-wider uppercase">Power Level</span>
                        <span className="text-cyan-100 text-sm">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white glow-text">{score}</span>
                        <span className="text-cyan-400/60 text-xl">/ 100</span>
                    </div>
                    {/* XP Bar */}
                    <div className="mt-3 h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000 rounded-full"
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>

                {/* Streak Display */}
                {currentStreak > 0 && (
                    <div className="flex items-center justify-center gap-6 py-4 border-t border-cyan-500/30">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                                <Flame size={24} className="animate-pulse" />
                                <span className="text-3xl font-black">{currentStreak}</span>
                            </div>
                            <p className="text-xs text-cyan-400/60 uppercase tracking-wider">Day Streak</p>
                        </div>

                        {longestStreak > currentStreak && (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-amber-400/60 mb-1">
                                    <Trophy size={20} />
                                    <span className="text-2xl font-bold">{longestStreak}</span>
                                </div>
                                <p className="text-xs text-cyan-400/40 uppercase tracking-wider">Best</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Grid - RPG Style */}
            <div className={`panel-bg ${rankInfo.borderClass} rounded-xl p-4`}>
                <h3 className="text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                    <Target size={14} />
                    Combat Statistics
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {DIMENSIONS.map((dim) => {
                        const value = checkIn[dim.key as keyof typeof checkIn] as number;
                        const percentage = value * 10;

                        return (
                            <div
                                key={dim.key}
                                className="bg-slate-900/50 rounded-lg p-3 text-center border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
                            >
                                <span className="text-2xl block mb-1">{dim.emoji}</span>

                                {/* Mini bar */}
                                <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${value >= 8 ? 'bg-emerald-500' :
                                                value >= 6 ? 'bg-cyan-500' :
                                                    value >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <p className="text-[10px] text-cyan-400/50 uppercase tracking-wider">{dim.label}</p>
                                <p className={`text-lg font-black ${value >= 8 ? 'text-emerald-400' :
                                        value >= 6 ? 'text-cyan-400' :
                                            value >= 4 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Notes - Quest Log Style */}
            {checkIn.notes && (
                <div className="panel-bg glow-border rounded-xl p-4">
                    <p className="text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase mb-2">📜 Quest Log</p>
                    <p className="text-cyan-100/80 leading-relaxed">{checkIn.notes}</p>
                </div>
            )}
        </div>
    );
}
