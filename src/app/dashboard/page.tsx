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
                    wraps everything to look like a single "Game Screen" / HUD interface 
                */}
                <div className="relative w-full max-w-6xl animate-in fade-in zoom-in duration-500">

                    {/* Outer Glow/Border for the "Window" */}
                    <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/20 to-blue-600/5 rounded-xl blur-md"></div>

                    <SystemPanelWithHeader title="SYSTEM CONSOLE" className="relative w-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">

                        {/* Header Context */}
                        <div className="absolute top-6 right-6 flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-white/40 tracking-[0.2em]">PLAYER STATUS</p>
                                <p className="text-sm text-cyan-400 font-bold tracking-widest animate-pulse">ONLINE</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-10">
                            <div className="mb-8">
                                <h2 className="text-white/60 text-sm tracking-[0.3em] uppercase">
                                    Select Module to Initialize
                                </h2>
                            </div>

                            {/* 
                                UNIFIED GRID LAYOUT 
                                3 columns x 2 rows = 6 perfect boxes
                            */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {modules.map((mod) => (
                                    <button
                                        key={mod.id}
                                        onClick={() => !mod.locked && router.push(mod.path)}
                                        disabled={mod.locked}
                                        className={`group relative h-56 w-full text-left transition-all duration-300 transform
                                            ${mod.locked ? 'opacity-60 grayscale' : 'hover:-translate-y-1 hover:scale-[1.02]'}
                                        `}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none`}></div>

                                        <SystemPanel className={`h-full flex flex-col justify-between border-2 overflow-hidden relative
                                            ${mod.locked
                                                ? 'border-white/5 bg-black/40' // Darker, less visible when locked
                                                : 'border-white/10 bg-black/60 group-hover:border-cyan-400/50 group-hover:bg-cyan-900/10 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]'
                                            }
                                        `}>
                                            {/* Background Tech Noise for active cards */}
                                            {!mod.locked && (
                                                <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay"></div>
                                            )}

                                            {/* Card Header */}
                                            <div className="relative z-10 flex justify-between items-start">
                                                <div className={`p-4 rounded-lg border backdrop-blur-sm transition-colors duration-300
                                                    ${mod.locked ? 'border-white/10 bg-white/5' : 'border-white/20 bg-white/10 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10'}
                                                `}>
                                                    <mod.icon className={`w-8 h-8 ${mod.locked ? 'text-white/20' : mod.color}`} />
                                                </div>

                                                {mod.locked ? (
                                                    <Lock className="w-5 h-5 text-white/20" />
                                                ) : (
                                                    <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan] animate-pulse"></div>
                                                )}
                                            </div>

                                            {/* Card Content */}
                                            <div className="relative z-10 mt-4">
                                                <h3 className={`text-2xl font-black tracking-widest uppercase mb-1 transition-colors duration-300
                                                    ${mod.locked ? 'text-white/30' : 'text-white group-hover:text-cyan-200'}
                                                `}>
                                                    {mod.title}
                                                </h3>
                                                <p className="text-xs font-mono text-white/40 tracking-[0.1em] uppercase">
                                                    {mod.subtitle}
                                                </p>
                                            </div>

                                            {/* Decorative Tech Lines */}
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                            {!mod.locked && (
                                                <div className="absolute bottom-0 left-0 w-0 h-1 bg-cyan-400 group-hover:w-full transition-all duration-500 ease-out"></div>
                                            )}

                                            {/* Hover Action */}
                                            {!mod.locked && (
                                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                    <ArrowRight className="w-5 h-5 text-cyan-400" />
                                                </div>
                                            )}

                                        </SystemPanel>
                                    </button>
                                ))}
                            </div>

                            {/* System Status Line */}
                            <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-4">
                                <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase">
                                    System Integrity: 100%
                                </span>
                                <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase">
                                    v1.5.0
                                </span>
                            </div>

                        </div>
                    </SystemPanelWithHeader>
                </div>
            </div>
        </SoloLevelingLayout>
    );
}
