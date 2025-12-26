'use client';

import { useState, useEffect } from 'react';
import { Crown, Sparkles, Zap } from 'lucide-react';

interface LevelUpModalProps {
    isOpen: boolean;
    newLevel: number;
    newTitle: string;
    titleColor: string;
    xpGained: number;
    onClose: () => void;
}

export function LevelUpModal({ isOpen, newLevel, newTitle, titleColor, xpGained, onClose }: LevelUpModalProps) {
    const [animationPhase, setAnimationPhase] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setAnimationPhase(1);
            const timer1 = setTimeout(() => setAnimationPhase(2), 500);
            const timer2 = setTimeout(() => setAnimationPhase(3), 1000);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
                relative notification-panel rounded-2xl p-8 text-center
                transform transition-all duration-500
                ${animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
            `}>
                {/* Sparkle Effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    <Sparkles
                        size={24}
                        className={`absolute top-4 left-4 text-amber-400 transition-all duration-500 ${animationPhase >= 2 ? 'opacity-100 animate-pulse' : 'opacity-0'
                            }`}
                    />
                    <Sparkles
                        size={20}
                        className={`absolute top-8 right-6 text-cyan-400 transition-all duration-500 ${animationPhase >= 2 ? 'opacity-100 animate-pulse' : 'opacity-0'
                            }`}
                    />
                    <Sparkles
                        size={16}
                        className={`absolute bottom-6 left-8 text-purple-400 transition-all duration-500 ${animationPhase >= 2 ? 'opacity-100 animate-pulse' : 'opacity-0'
                            }`}
                    />
                </div>

                {/* Header */}
                <div className={`
                    flex items-center justify-center gap-2 text-amber-400 mb-4
                    transition-all duration-500 delay-300
                    ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
                `}>
                    <Zap size={20} className="animate-pulse" />
                    <span className="text-sm font-black tracking-[0.3em] uppercase">Level Up!</span>
                    <Zap size={20} className="animate-pulse" />
                </div>

                {/* Level Number */}
                <div className={`
                    text-8xl font-black text-white glow-text mb-2
                    transition-all duration-700 delay-500
                    ${animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}
                `}>
                    {newLevel}
                </div>

                {/* Title */}
                <p className={`
                    text-xl font-black tracking-wider mb-6 ${titleColor}
                    transition-all duration-500 delay-700
                    ${animationPhase >= 3 ? 'opacity-100' : 'opacity-0'}
                `}>
                    {newTitle}
                </p>

                {/* XP Gained */}
                <p className={`
                    text-cyan-400/60 text-sm mb-6
                    transition-all duration-500 delay-900
                    ${animationPhase >= 3 ? 'opacity-100' : 'opacity-0'}
                `}>
                    +{xpGained} XP earned
                </p>

                {/* Continue Button */}
                <button
                    onClick={onClose}
                    className={`
                        px-8 py-3 rounded-xl font-bold tracking-wider uppercase
                        bg-gradient-to-r from-cyan-600 to-purple-600 
                        hover:from-cyan-500 hover:to-purple-500 
                        text-white transition-all duration-300
                        transform hover:scale-105
                        ${animationPhase >= 3 ? 'opacity-100' : 'opacity-0'}
                    `}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
