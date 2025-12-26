'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SoloLevelingLayout, SystemPanelWithHeader, SystemPanel } from '@/components/SoloLeveling';
import { Utensils, Dumbbell, Moon, Droplet, Gem, ArrowRight, Lock, Activity } from 'lucide-react';

export default function GameHub() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const modules = [
        {
            id: 'food',
            title: 'FOOD',
            subtitle: 'Log Meals & Macros',
            icon: Utensils,
            path: '/dashboard/food',
            color: 'text-orange-400',
            locked: false
        },
        {
            id: 'exercise',
            title: 'EXERCISE',
            subtitle: 'Track Workouts',
            icon: Dumbbell,
            path: '/dashboard/exercise',
            color: 'text-red-500',
            locked: true // Placeholder for now
        },
        {
            id: 'sleep',
            title: 'SLEEP',
            subtitle: 'Recovery Data',
            icon: Moon,
            path: '/dashboard/sleep',
            color: 'text-purple-400',
            locked: true // Placeholder
        },
        {
            id: 'water',
            title: 'WATER',
            subtitle: 'Hydration Levels',
            icon: Droplet,
            path: '/dashboard/water',
            color: 'text-blue-400',
            locked: true // Placeholder
        },
        {
            id: 'minerals',
            title: 'MINERALS',
            subtitle: 'Supplement Stack',
            icon: Gem,
            path: '/dashboard/minerals',
            color: 'text-emerald-400',
            locked: true // Placeholder
        },
        {
            id: 'analysis',
            title: 'ANALYSIS',
            subtitle: 'Stats & Improvement',
            icon: Activity,
            path: '/dashboard/analysis',
            color: 'text-cyan-400',
            locked: true // Placeholder for the new 6th box
        }
    ];

    if (!mounted) return null;

    return (
        <SoloLevelingLayout>
            <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">

                {/* 
                    MAIN SYSTEM WINDOW CONTAINER 
                    Redesigned: Translucent Glassmorphism
                */}
                <div className="relative w-full max-w-6xl animate-in fade-in zoom-in duration-500">

                    {/* Holographic Glow behind the container */}
                    <div className="absolute -inset-1 bg-cyan-500/10 rounded-xl blur-xl opacity-50"></div>

                    {/* 
                        Window Content 
                        - bg-black/30 -> High translucency
                        - backdrop-blur-md -> Frosted glass effect (not too heavy to hide background)
                        - border-white/10 -> Thin, subtle borders
                    */}
                    <SystemPanelWithHeader title="SYSTEM CONSOLE" className="relative w-full bg-black/30 backdrop-blur-sm border border-white/10 shadow-2xl">

                        {/* Header Context */}
                        <div className="absolute top-6 right-6 flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] text-white/50 tracking-[0.2em] font-mono">PLAYER STATUS</p>
                                <p className="text-xs text-cyan-400 font-bold tracking-widest animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.4)]">ONLINE</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-10">
                            <div className="mb-6">
                                <h2 className="text-white/40 text-xs tracking-[0.3em] uppercase font-light">
                                    Select Module to Initialize
                                </h2>
                            </div>

                            {/* 
                                UNIFIED GRID LAYOUT 
                                High transparency cards
                            */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {modules.map((mod) => (
                                    <button
                                        key={mod.id}
                                        onClick={() => !mod.locked && router.push(mod.path)}
                                        disabled={mod.locked}
                                        className={`group relative h-48 w-full text-left transition-all duration-300 transform
                                            ${mod.locked ? 'opacity-40 grayscale blur-[0.5px]' : 'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]'}
                                        `}
                                    >
                                        <SystemPanel className={`h-full flex flex-col justify-between border overflow-hidden relative transition-all duration-300
                                            ${mod.locked
                                                ? 'border-white/5 bg-black/10' // Almost invisible when locked
                                                : 'border-white/10 bg-black/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-900/10'
                                            }
                                        `}>
                                            {/* Holographic Scanline for active cards */}
                                            {!mod.locked && (
                                                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                                            )}

                                            {/* Header */}
                                            <div className="relative z-10 flex justify-between items-start">
                                                <div className={`p-3 rounded-lg border backdrop-blur-[2px] transition-colors duration-300
                                                    ${mod.locked ? 'border-white/5 bg-white/5' : 'border-white/10 bg-white/5 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10'}
                                                `}>
                                                    <mod.icon className={`w-6 h-6 ${mod.locked ? 'text-white/20' : mod.color}`} />
                                                </div>

                                                {mod.locked ? (
                                                    <Lock className="w-4 h-4 text-white/10" />
                                                ) : (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan] animate-pulse"></div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-10 mt-2 pl-1">
                                                <h3 className={`text-xl font-bold tracking-widest uppercase mb-1 transition-colors duration-300
                                                    ${mod.locked ? 'text-white/20' : 'text-white/90 group-hover:text-cyan-100'}
                                                `}>
                                                    {mod.title}
                                                </h3>
                                                <p className="text-[10px] font-mono text-white/30 tracking-[0.1em] uppercase">
                                                    {mod.subtitle}
                                                </p>
                                            </div>

                                            {/* Decorative Corner Accents (Holographic feel) */}
                                            {!mod.locked && (
                                                <>
                                                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-500/0 group-hover:border-cyan-500/30 transition-all duration-500"></div>
                                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-cyan-500/0 group-hover:border-cyan-500/30 transition-all duration-500"></div>
                                                </>
                                            )}

                                            {/* Subdued Hover Action */}
                                            {!mod.locked && (
                                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                    <ArrowRight className="w-4 h-4 text-cyan-400/80" />
                                                </div>
                                            )}

                                        </SystemPanel>
                                    </button>
                                ))}
                            </div>

                            {/* Footer Status */}
                            <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-3">
                                <span className="text-white/10 text-[9px] tracking-[0.3em] uppercase font-mono">
                                    SYS.INTEGRITY: 100%
                                </span>
                                <span className="text-white/10 text-[9px] tracking-[0.3em] uppercase font-mono">
                                    VER 1.5.0
                                </span>
                            </div>

                        </div>
                    </SystemPanelWithHeader>
                </div>
            </div>
        </SoloLevelingLayout>
    );
}
