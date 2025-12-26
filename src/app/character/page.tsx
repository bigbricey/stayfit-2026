'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SoloLevelingLayout, SystemPanel, GlowNumber, VitalBar } from '@/components/SoloLeveling';
import { Plus, Heart, Zap, Brain, Dumbbell, Wind, Eye, ChevronRight, ArrowLeft } from 'lucide-react';

// Stat row with icon
function StatRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
    return (
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
            <span className="text-white/70 text-sm">{label}:</span>
            <GlowNumber value={value} size="lg" />
        </div>
    );
}

export default function CharacterPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTimeout(() => setShowContent(true), 100);
    }, []);

    if (!mounted) return null;

    return (
        <SoloLevelingLayout>
            <div className="min-h-screen flex flex-col">
                {/* Back Button */}
                <header className="p-4">
                    <button
                        onClick={() => router.push('/')}
                        className="w-10 h-10 border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                    <div className={`w-full max-w-3xl transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                        {/* Header: Level + Job/Title */}
                        <div className="flex items-end justify-center gap-8 mb-6">
                            {/* Level Number */}
                            <div className="text-center">
                                <GlowNumber value="1" size="xl" />
                                <p className="text-white/60 text-sm tracking-[0.3em] uppercase mt-1">LEVEL</p>
                            </div>

                            {/* Job & Title */}
                            <div className="pb-4 text-left">
                                <p className="text-white/70 text-sm">
                                    <span className="text-white/50">JOB:</span>{' '}
                                    <span className="text-white font-semibold">Beginner</span>
                                </p>
                                <p className="text-white/70 text-sm">
                                    <span className="text-white/50">TITLE:</span>{' '}
                                    <span className="text-white font-semibold">Fitness Hunter</span>
                                </p>
                            </div>
                        </div>

                        {/* Upper Panel: Vitals (HP, XP, Fatigue) */}
                        <SystemPanel className="mb-4">
                            <div className="grid grid-cols-3 gap-6 items-center">
                                <VitalBar icon={Plus} label="HP" current={100} max={100} color="green" />
                                <VitalBar icon={Zap} label="XP" current={0} max={100} color="blue" />
                                <div className="flex items-center justify-end gap-2">
                                    <div className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white/80 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                                    </div>
                                    <span className="text-white/70 text-sm">FATIGUE:</span>
                                    <GlowNumber value="0" size="sm" />
                                </div>
                            </div>
                        </SystemPanel>

                        {/* Lower Panel: Attributes Grid */}
                        <SystemPanel className="mb-6">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                                {/* Left Column */}
                                <StatRow icon={Dumbbell} label="STR" value={10} />
                                <StatRow icon={Heart} label="VIT" value={10} />

                                <StatRow icon={Wind} label="AGI" value={10} />
                                <StatRow icon={Brain} label="INT" value={10} />

                                <StatRow icon={Eye} label="PER" value={10} />

                                {/* Ability Points - Bottom Right */}
                                <div className="flex items-center justify-end gap-3">
                                    <div className="text-right">
                                        <p className="text-white/50 text-xs">Available</p>
                                        <p className="text-white/50 text-xs">Ability Points:</p>
                                    </div>
                                    <GlowNumber value="0" size="lg" />
                                </div>
                            </div>
                        </SystemPanel>

                        {/* Start Button */}
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full py-5 border border-white/40 bg-white/5 text-white font-bold text-lg tracking-[0.2em] uppercase
                hover:bg-white/10 hover:border-white/60 
                transition-all duration-300 flex items-center justify-center gap-3 group"
                            style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                        >
                            <span>START TRACKING</span>
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>

                        <p className="text-center text-white/30 text-xs mt-4 tracking-[0.3em]">
                            [ CHARACTER STATUS ]
                        </p>
                    </div>
                </div>
            </div>
        </SoloLevelingLayout>
    );
}
