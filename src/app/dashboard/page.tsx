'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SoloLevelingPage, SystemPanelWithHeader, SystemPanel } from '@/components/SoloLeveling';
import { Utensils, Dumbbell, Moon, Droplet, Gem, ArrowRight, Lock, Activity } from 'lucide-react';

export default function GameHub() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const modules = [
// ... (modules array remains same, skipped for brevity in tool call, will rely on "modules" already existing in context for mental model, but since this is a REPLACE block I need to be careful not to delete.
// Wait, I can't skip content in ReplacementContent. I must include everything I am replacing or ensure the boundary is safe.
// Let me target specifically the return statement block which is easier.
// BUT I need to import SoloLevelingPage first.


    const modules = [
        {
            id: 'food',
            title: 'FOOD',
            subtitle: 'Log Meals',
            icon: Utensils,
            path: '/dashboard/food',
            color: 'text-orange-400',
            locked: false
        },
        {
            id: 'exercise',
            title: 'EXERCISE',
            subtitle: 'Workouts',
            icon: Dumbbell,
            path: '/dashboard/exercise',
            color: 'text-red-500',
            locked: true // Placeholder for now
        },
        {
            id: 'sleep',
            title: 'SLEEP',
            subtitle: 'Recovery',
            icon: Moon,
            path: '/dashboard/sleep',
            color: 'text-purple-400',
            locked: true // Placeholder
        },
        {
            id: 'water',
            title: 'WATER',
            subtitle: 'Hydration',
            icon: Droplet,
            path: '/dashboard/water',
            color: 'text-blue-400',
            locked: true // Placeholder
        },
        {
            id: 'minerals',
            title: 'MINERALS',
            subtitle: 'Stack',
            icon: Gem,
            path: '/dashboard/minerals',
            color: 'text-emerald-400',
            locked: true // Placeholder
        },
        {
            id: 'analysis',
            title: 'ANALYSIS',
            subtitle: 'Stats',
            icon: Activity,
            path: '/dashboard/analysis',
            color: 'text-cyan-400',
            locked: true // Placeholder for the new 6th box
        }
    ];

    if (!mounted) return null;

    return (
        <SoloLevelingPage>
            <SystemPanelWithHeader title="SYSTEM CONSOLE" className="relative w-full">

                {/* Header Context */}
                <div className="absolute top-5 right-6 flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-white/50 tracking-[0.2em] font-mono">STATUS</p>
                        <p className="text-xs text-cyan-400 font-bold tracking-widest animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.4)]">ONLINE</p>
                    </div>
                </div>

                {/* Back / Exit Button */}
                <div className="absolute top-5 left-6">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] tracking-[0.2em] font-mono uppercase">EXIT</span>
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-white text-xs tracking-[0.3em] uppercase font-light">
                            Select Module
                        </h2>
                    </div>

                    {/* 
                        COMPACT GRID LAYOUT 
                        2 columns x 3 rows (or 3x2 on larger screens)
                        Compact cards to fit in the smaller container
                    */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {modules.map((mod) => (
                            <button
                                key={mod.id}
                                onClick={() => !mod.locked && router.push(mod.path)}
                                disabled={mod.locked}
                                className={`group relative h-32 w-full text-left transition-all duration-300 transform
                                    ${mod.locked ? 'opacity-100' : 'hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,212,255,0.15)]'}
                                `}
                            >
                                <SystemPanel className={`h-full flex flex-col items-center justify-center border overflow-hidden relative transition-all duration-300
                                    ${mod.locked
                                        ? 'border-white/10 bg-black/40' // Same base as active
                                        : 'border-white/10 bg-black/40 group-hover:border-cyan-400/50 group-hover:bg-cyan-900/20'
                                    }
                                `}>
                                    {/* Holographic Scanline - Show for all to maintain look */}
                                    <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

                                    {/* Icon */}
                                    <div className={`mb-3 p-2 rounded-full border backdrop-blur-[1px] transition-colors duration-300
                                        ${mod.locked ? 'border-white/10 bg-white/5' : 'border-white/10 bg-white/5 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10'}
                                    `}>
                                        {/* Use the module color even if locked */}
                                        <mod.icon className={`w-5 h-5 ${mod.color}`} />
                                    </div>

                                    {/* Text */}
                                    <div className="text-center">
                                        <h3 className={`text-sm font-bold tracking-widest uppercase mb-0.5 transition-colors duration-300 text-white/90 group-hover:text-cyan-100`}>
                                            {mod.title}
                                        </h3>
                                        <p className="text-[9px] font-mono text-white/50 tracking-[0.1em] uppercase hidden sm:block">
                                            {mod.subtitle}
                                        </p>
                                    </div>

                                    {/* Lock Icon Overlay - Keep it but make it distinct */}
                                    {mod.locked && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded text-[9px] text-white/40 border border-white/5">
                                            <Lock className="w-2.5 h-2.5" />
                                            <span>LOCKED</span>
                                        </div>
                                    )}

                                    {/* Active Indicator */}
                                    {!mod.locked && (
                                        <div className="absolute top-2 right-2 h-1 w-1 rounded-full bg-cyan-400 shadow-[0_0_4px_cyan] animate-pulse"></div>
                                    )}

                                    {/* Corner Accents */}
                                    {!mod.locked && (
                                        <>
                                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/0 group-hover:border-cyan-500/30 transition-all duration-500"></div>
                                            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/0 group-hover:border-cyan-500/30 transition-all duration-500"></div>
                                        </>
                                    )}

                                </SystemPanel>
                            </button>
                        ))}
                    </div>

                    {/* Footer Status */}
                    <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-3">
                        <span className="text-white/20 text-[9px] tracking-[0.3em] uppercase font-mono">
                            SYS.INTEGRITY: 100%
                        </span>
                        <span className="text-white/20 text-[9px] tracking-[0.3em] uppercase font-mono">
                            v1.5.0
                        </span>
                    </div>

                </div>
            </SystemPanelWithHeader>
        </SoloLevelingPage>
    );
}
