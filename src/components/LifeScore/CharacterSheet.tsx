'use client';

import { PlayerData, DIMENSIONS, calculateDailyScore } from './types';
import { Flame, Trophy, Crown, Shield, Zap, Heart, Brain, Sword, MessageCircle, Target } from 'lucide-react';

interface CharacterSheetProps {
    player: PlayerData;
}

export function CharacterSheet({ player }: CharacterSheetProps) {
    const { progress, stats, bars, currentStreak, longestStreak } = player;

    // Calculate fatigue color
    const fatigueColor = bars.fatigue <= 30 ? 'bg-green-500'
        : bars.fatigue <= 60 ? 'bg-yellow-500'
            : bars.fatigue <= 90 ? 'bg-orange-500'
                : 'bg-red-500';

    const statIcons: Record<string, React.ReactNode> = {
        str: <Sword size={16} className="text-red-400" />,
        vit: <Heart size={16} className="text-pink-400" />,
        int: <Brain size={16} className="text-purple-400" />,
        cha: <MessageCircle size={16} className="text-cyan-400" />,
        def: <Shield size={16} className="text-blue-400" />,
        sta: <Zap size={16} className="text-yellow-400" />,
    };

    return (
        <div className="space-y-4">
            {/* Main Status Panel */}
            <div className="notification-panel rounded-xl p-5 animate-glow">
                {/* Header */}
                <div className="flex items-center justify-center gap-2 text-cyan-300/60 text-[10px] tracking-[0.3em] uppercase mb-3">
                    <Shield size={12} />
                    <span>Status Window</span>
                    <Shield size={12} />
                </div>

                {/* Level and Title */}
                <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-6xl font-black text-white glow-text">
                            {progress.level}
                        </span>
                        <div className="text-left">
                            <p className="text-cyan-400/60 text-xs tracking-wider">LEVEL</p>
                            <p className={`font-black tracking-wider ${progress.titleColor}`}>
                                {progress.classModifier ? `${progress.classModifier} ` : ''}{progress.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* HP / MP / Fatigue Bars */}
                <div className="space-y-2 mb-4">
                    {/* HP Bar */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-400 w-8">HP</span>
                        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden border border-red-500/30">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                                style={{ width: `${(bars.hp.current / bars.hp.max) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-cyan-100 w-20 text-right">
                            {bars.hp.current}/{bars.hp.max}
                        </span>
                    </div>

                    {/* MP Bar */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 w-8">MP</span>
                        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden border border-blue-500/30">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                                style={{ width: `${(bars.mp.current / bars.mp.max) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-cyan-100 w-20 text-right">
                            {bars.mp.current}/{bars.mp.max}
                        </span>
                    </div>

                    {/* Fatigue Bar */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-8">FTG</span>
                        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden border border-gray-500/30">
                            <div
                                className={`h-full transition-all duration-500 ${fatigueColor}`}
                                style={{ width: `${bars.fatigue}%` }}
                            />
                        </div>
                        <span className="text-xs text-cyan-100 w-20 text-right">
                            {bars.fatigue}/100
                        </span>
                    </div>
                </div>

                {/* Stat Grid - 3x2 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {DIMENSIONS.map((dim) => {
                        const statValue = stats[dim.stat as keyof typeof stats];
                        return (
                            <div
                                key={dim.stat}
                                className="bg-slate-900/50 rounded-lg p-2 border border-cyan-500/10 flex items-center gap-2"
                            >
                                {statIcons[dim.stat]}
                                <span className="text-xs font-bold text-cyan-400">{dim.label}</span>
                                <span className="text-sm font-black text-white ml-auto">{statValue}</span>
                            </div>
                        );
                    })}
                </div>

                {/* XP Bar */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400/60">XP to Level {progress.level + 1}</span>
                        <span className="text-cyan-100">{progress.currentXP} / {progress.xpToNextLevel}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${(progress.currentXP / progress.xpToNextLevel) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Streak Panel */}
            <div className="panel-bg glow-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Flame size={24} className={currentStreak > 0 ? "text-orange-400 animate-pulse" : "text-gray-600"} />
                    <div>
                        <p className="text-2xl font-black text-white">{currentStreak}</p>
                        <p className="text-xs text-cyan-400/60 uppercase tracking-wider">Day Streak</p>
                    </div>
                </div>

                {longestStreak > 0 && (
                    <div className="flex items-center gap-2 text-amber-400/70">
                        <Trophy size={18} />
                        <div className="text-right">
                            <p className="text-lg font-bold">{longestStreak}</p>
                            <p className="text-[10px] uppercase tracking-wider">Best</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Decay Warning */}
            {bars.fatigue > 30 && (
                <div className={`panel-bg rounded-xl p-4 border-2 ${bars.fatigue > 60 ? 'border-red-500/50 bg-red-500/10' : 'border-yellow-500/50 bg-yellow-500/10'
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{bars.fatigue > 60 ? '⚠️' : '💤'}</span>
                        <div>
                            <p className={`font-bold ${bars.fatigue > 60 ? 'text-red-400' : 'text-yellow-400'}`}>
                                {bars.fatigue > 60 ? 'Critical Fatigue!' : 'Rising Fatigue'}
                            </p>
                            <p className="text-xs text-cyan-100/60">
                                {bars.fatigue > 60
                                    ? 'Stats are actively decaying. Log high scores to recover!'
                                    : 'Keep logging to prevent stat decay.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
