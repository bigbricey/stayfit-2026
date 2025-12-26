'use client';

import { useState, useEffect } from 'react';
import { CharacterSheet } from './CharacterSheet';
import { StatEntryWizard } from './StatEntryWizard';
import { LevelUpModal } from './LevelUpModal';
import { loadPlayerData, PlayerData, getTodayCheckIn, DailyCheckIn } from './types';
import { Swords, Loader2 } from 'lucide-react';

type ViewState = 'character' | 'wizard';

export function LifeScoreDashboard() {
    const [view, setView] = useState<ViewState>('character');
    const [player, setPlayer] = useState<PlayerData | null>(null);
    const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpInfo, setLevelUpInfo] = useState({ oldLevel: 1, newLevel: 2 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = () => {
            const playerData = loadPlayerData();
            const checkIn = getTodayCheckIn();
            setPlayer(playerData);
            setTodayCheckIn(checkIn);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleStartWizard = () => {
        setView('wizard');
    };

    const handleWizardComplete = (xpGained: number, leveledUp: boolean, newPlayer: PlayerData) => {
        const oldLevel = player?.progress.level ?? 1;
        setPlayer(newPlayer);
        setTodayCheckIn(getTodayCheckIn());
        setView('character');

        if (leveledUp) {
            setLevelUpInfo({ oldLevel, newLevel: newPlayer.progress.level });
            setShowLevelUp(true);
        }
    };

    const handleWizardCancel = () => {
        setView('character');
    };

    const handleLevelUpClose = () => {
        setShowLevelUp(false);
    };

    if (isLoading || !player) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            </div>
        );
    }

    // Wizard View
    if (view === 'wizard') {
        return (
            <StatEntryWizard
                player={player}
                existingCheckIn={todayCheckIn}
                onComplete={handleWizardComplete}
                onCancel={handleWizardCancel}
            />
        );
    }

    // Character View (Main Screen)
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#020408] via-[#0a1628] to-[#020408]">
            {/* Character Sheet */}
            <div className="p-4">
                <CharacterSheet player={player} />
            </div>

            {/* Action Button */}
            <div className="p-4 pb-8">
                <button
                    onClick={handleStartWizard}
                    className="w-full py-5 rounded-xl font-black text-xl tracking-wider uppercase
                               bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 
                               hover:from-amber-500 hover:via-orange-400 hover:to-red-400 
                               text-white transition-all duration-300 
                               flex items-center justify-center gap-4"
                    style={{ boxShadow: '0 0 40px rgba(251, 146, 60, 0.5)' }}
                >
                    <Swords size={28} />
                    <span>{todayCheckIn ? 'Update Today' : 'Log Today'}</span>
                    <Swords size={28} />
                </button>

                {todayCheckIn && (
                    <p className="text-center text-cyan-400/50 text-sm mt-3">
                        Already logged today • Tap to update
                    </p>
                )}
            </div>

            {/* Level Up Modal */}
            {showLevelUp && (
                <LevelUpModal
                    oldLevel={levelUpInfo.oldLevel}
                    newLevel={levelUpInfo.newLevel}
                    onClose={handleLevelUpClose}
                />
            )}
        </div>
    );
}
