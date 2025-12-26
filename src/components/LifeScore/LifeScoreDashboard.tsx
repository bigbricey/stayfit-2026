'use client';

import { useState, useEffect } from 'react';
import { CheckInForm } from './CheckInForm';
import { CharacterSheet } from './CharacterSheet';
import { LevelUpModal } from './LevelUpModal';
import { TrendChart } from './TrendChart';
import { loadPlayerData, getTodayCheckIn, PlayerData, processCheckIn, DailyCheckIn, getTodayString } from './types';
import { Plus, ChevronRight, Swords } from 'lucide-react';

export function LifeScoreDashboard() {
    const [player, setPlayer] = useState<PlayerData | null>(null);
    const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Level up modal state
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpData, setLevelUpData] = useState({ level: 1, title: '', titleColor: '', xpGained: 0 });

    const refreshData = () => {
        const loaded = loadPlayerData();
        setPlayer(loaded);
        setTodayCheckIn(getTodayCheckIn());
    };

    useEffect(() => {
        refreshData();
        setIsLoading(false);
    }, []);

    const handleCheckInSaved = (xpGained: number, leveledUp: boolean, newPlayer: PlayerData) => {
        if (leveledUp) {
            setLevelUpData({
                level: newPlayer.progress.level,
                title: newPlayer.progress.title,
                titleColor: newPlayer.progress.titleColor,
                xpGained,
            });
            setShowLevelUp(true);
        }
        refreshData();
        setShowForm(false);
    };

    if (isLoading || !player) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-cyan-400 animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                    <span className="text-sm tracking-wider uppercase">Initializing System...</span>
                </div>
            </div>
        );
    }

    // No check-in today - show form
    if (!todayCheckIn || showForm) {
        return (
            <div className="max-w-lg mx-auto p-4">
                {todayCheckIn && (
                    <button
                        onClick={() => setShowForm(false)}
                        className="mb-4 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                        <ChevronRight size={16} className="rotate-180" />
                        <span className="tracking-wider uppercase">Back to Status</span>
                    </button>
                )}
                <CheckInForm
                    existingCheckIn={todayCheckIn}
                    onCheckInSaved={handleCheckInSaved}
                    player={player}
                />

                <LevelUpModal
                    isOpen={showLevelUp}
                    newLevel={levelUpData.level}
                    newTitle={levelUpData.title}
                    titleColor={levelUpData.titleColor}
                    xpGained={levelUpData.xpGained}
                    onClose={() => setShowLevelUp(false)}
                />
            </div>
        );
    }

    // Has today's check-in - show Character Sheet
    return (
        <div className="max-w-lg mx-auto p-4 space-y-4">
            <CharacterSheet player={player} />

            {/* Update Button */}
            <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 rounded-xl border-2 border-dashed border-cyan-500/30
                           text-cyan-400/70 font-bold tracking-wider uppercase
                           hover:border-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-500/5
                           transition-all duration-300 flex items-center justify-center gap-2"
            >
                <Swords size={18} />
                Update Combat Report
            </button>

            {/* Trend Chart */}
            <TrendChart checkIns={player.checkIns} />

            <LevelUpModal
                isOpen={showLevelUp}
                newLevel={levelUpData.level}
                newTitle={levelUpData.title}
                titleColor={levelUpData.titleColor}
                xpGained={levelUpData.xpGained}
                onClose={() => setShowLevelUp(false)}
            />
        </div>
    );
}
