'use client';

import { Droplets, Scale, Utensils, Activity } from 'lucide-react';

interface WelcomeScreenProps {
    userName: string | null;
    onQuickLog: (text: string) => void;
}

export default function WelcomeScreen({ userName, onQuickLog }: WelcomeScreenProps) {
    const chips = [
        { label: 'Log Water', icon: <Droplets size={14} />, text: 'Log 500ml of water' },
        { label: 'Log Weight', icon: <Scale size={14} />, text: 'My current weight is ' },
        { label: 'Quick Meal', icon: <Utensils size={14} />, text: 'Log my last meal: ' },
        { label: 'Log Activity', icon: <Activity size={14} />, text: 'Log my workout: ' },
    ];

    return (
        <div className="flex-1 flex flex-col items-start justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700 pl-4">
            <div className="space-y-2 text-left">
                <h1 className="text-4xl font-black text-[#e5e7eb] tracking-tight">
                    Ready to log, {userName?.split(' ')[0] || 'there'}?
                </h1>
                <p className="text-xl text-[#9ca3af] font-medium">
                    Track meals, plan workouts, or check your macros.
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                {chips.map((chip, i) => (
                    <button
                        key={i}
                        onClick={() => onQuickLog(chip.text)}
                        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#1a1d24] border border-[#2a2d34] text-gray-300 hover:border-emerald-500/50 hover:text-white hover:bg-emerald-500/5 transition-all duration-300 shadow-sm"
                    >
                        <span className="text-emerald-500">{chip.icon}</span>
                        <span className="text-sm font-semibold">{chip.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
