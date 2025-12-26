'use client';

import { ReactNode } from 'react';
import { Plus, Zap, AlertCircle } from 'lucide-react';

// Solo Leveling Background - Traveling Energy Beams
export function SoloLevelingBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: '#02040a' }}>

            {/* LAYER 1: SMOKY ATMOSPHERIC BACKGROUND */}
            <div
                className="absolute animate-smoke-shift"
                style={{
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `
                        radial-gradient(ellipse at 30% 30%, rgba(10, 40, 80, 0.4), transparent 50%),
                        radial-gradient(ellipse at 70% 60%, rgba(5, 25, 50, 0.5), transparent 60%),
                        radial-gradient(ellipse at 50% 80%, rgba(8, 30, 60, 0.3), transparent 40%)
                    `,
                    filter: 'blur(40px)',
                }}
            />

            {/* LAYER 2: FAINT ICE-CRACK / BLUEPRINT LINES (drifting slowly) */}
            <div
                className="absolute inset-0 animate-drift opacity-15"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cpath d='M0,50 L150,0 M50,200 L180,100 L100,250 M300,0 L250,150 L350,200 M500,50 L450,180 L550,150 M700,0 L650,120 L750,100 M100,400 L200,350 L150,500 M400,350 L500,450 L450,550 M600,400 L700,350 L650,550 M0,300 L100,280 L50,400 M750,250 L800,350' stroke='rgba(100,180,255,0.3)' stroke-width='0.8' fill='none'/%3E%3Cpath d='M0,150 C100,120 200,180 300,150 S450,100 550,150 S700,180 800,150' stroke='rgba(100,180,255,0.2)' stroke-width='0.5' fill='none'/%3E%3Cpath d='M0,450 C150,400 300,500 450,450 S600,400 800,450' stroke='rgba(100,180,255,0.2)' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
                    backgroundSize: '800px 600px',
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* LAYER 3: TRAVELING ENERGY BEAMS - Top */}
            <div className="absolute top-[10%] left-0 right-0 h-[3px] overflow-hidden">
                <div
                    className="absolute inset-0 animate-beam-sweep"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, transparent 40%, #00f0ff 50%, #ffffff 52%, #00f0ff 54%, transparent 60%, transparent 100%)',
                        boxShadow: '0 0 20px #00f0ff, 0 0 40px #00f0ff, 0 0 60px rgba(0, 240, 255, 0.5)',
                    }}
                />
                {/* Static glow rail */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(90deg, rgba(0,200,255,0.1) 0%, rgba(0,200,255,0.3) 50%, rgba(0,200,255,0.1) 100%)',
                        boxShadow: '0 0 10px rgba(0, 200, 255, 0.3)',
                    }}
                />
            </div>

            {/* LAYER 3B: TRAVELING ENERGY BEAMS - Bottom */}
            <div className="absolute bottom-[8%] left-0 right-0 h-[4px] overflow-hidden">
                <div
                    className="absolute inset-0 animate-beam-sweep-reverse"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, transparent 40%, #00f0ff 50%, #ffffff 52%, #00f0ff 54%, transparent 60%, transparent 100%)',
                        boxShadow: '0 0 30px #00f0ff, 0 0 60px #00f0ff, 0 0 80px rgba(0, 240, 255, 0.6)',
                    }}
                />
                {/* Static glow rail */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(90deg, rgba(0,200,255,0.15) 0%, rgba(0,200,255,0.4) 50%, rgba(0,200,255,0.15) 100%)',
                        boxShadow: '0 0 15px rgba(0, 200, 255, 0.4)',
                    }}
                />
            </div>

            {/* LAYER 3C: TRAVELING ENERGY BEAMS - Middle subtle */}
            <div className="absolute top-[45%] left-0 right-0 h-[1px] overflow-hidden opacity-40">
                <div
                    className="absolute inset-0 animate-beam-sweep-slow"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, transparent 45%, #00f0ff 50%, #ffffff 51%, #00f0ff 52%, transparent 55%, transparent 100%)',
                        boxShadow: '0 0 15px #00f0ff',
                    }}
                />
            </div>

            {/* LAYER 4: VERTICAL ENERGY ACCENTS (left and right borders) */}
            <div className="absolute left-[5%] top-0 bottom-0 w-[2px] overflow-hidden opacity-60">
                <div
                    className="absolute inset-0 animate-beam-vertical"
                    style={{
                        background: 'linear-gradient(180deg, transparent 0%, transparent 40%, #00f0ff 50%, #ffffff 51%, #00f0ff 52%, transparent 60%, transparent 100%)',
                        boxShadow: '0 0 15px #00f0ff, 0 0 30px rgba(0, 240, 255, 0.5)',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(180deg, rgba(0,200,255,0.05) 0%, rgba(0,200,255,0.2) 50%, rgba(0,200,255,0.05) 100%)',
                    }}
                />
            </div>

            <div className="absolute right-[5%] top-0 bottom-0 w-[2px] overflow-hidden opacity-60">
                <div
                    className="absolute inset-0 animate-beam-vertical-reverse"
                    style={{
                        background: 'linear-gradient(180deg, transparent 0%, transparent 40%, #00f0ff 50%, #ffffff 51%, #00f0ff 52%, transparent 60%, transparent 100%)',
                        boxShadow: '0 0 15px #00f0ff, 0 0 30px rgba(0, 240, 255, 0.5)',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(180deg, rgba(0,200,255,0.05) 0%, rgba(0,200,255,0.2) 50%, rgba(0,200,255,0.05) 100%)',
                    }}
                />
            </div>

            {/* LAYER 5: DARK VIGNETTE */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 2, 8, 0.85) 100%)',
                }}
            />

            {/* LAYER 6: SCANLINES (subtle hologram texture) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.08]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,200,255,0.15) 3px)',
                    backgroundSize: '100% 4px',
                }}
            />
        </div>
    );
}

// White outlined panel box
export function SystemPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative border border-white/40 bg-transparent ${className}`}>
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="relative p-4 md:p-6">
                {children}
            </div>
        </div>
    );
}

// Panel with header title
export function SystemPanelWithHeader({ title, icon: Icon, children, className = '' }: {
    title: string;
    icon?: React.ElementType;
    children: ReactNode;
    className?: string;
}) {
    const IconComponent = Icon || AlertCircle;
    return (
        <div className={`relative border border-white/40 bg-transparent ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/20">
                    <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                        <IconComponent className="w-3 h-3 text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
                    </div>
                    <span className="text-white text-sm tracking-[0.2em] uppercase font-bold" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                        {title}
                    </span>
                </div>
                {/* Content */}
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Glowing number with bloom effect
export function GlowNumber({ value, size = 'lg' }: { value: number | string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-4xl',
        xl: 'text-7xl md:text-8xl'
    };
    return (
        <span
            className={`font-bold text-white ${sizeClasses[size]}`}
            style={{
                textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(100,200,255,0.6), 0 0 40px rgba(100,200,255,0.4)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            {value}
        </span>
    );
}

// Progress bar (HP/MP style)
export function VitalBar({ icon: Icon, label, current, max, color }: {
    icon: React.ElementType;
    label: string;
    current: number;
    max: number;
    color: 'green' | 'blue' | 'orange' | 'purple';
}) {
    const colorMap = {
        green: { bar: 'bg-green-400', shadow: 'rgba(74,222,128,0.5)' },
        blue: { bar: 'bg-cyan-400', shadow: 'rgba(34,211,238,0.5)' },
        orange: { bar: 'bg-orange-400', shadow: 'rgba(251,146,60,0.5)' },
        purple: { bar: 'bg-purple-400', shadow: 'rgba(192,132,252,0.5)' },
    };
    const percent = max > 0 ? (current / max) * 100 : 0;

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col items-center min-w-[40px]">
                <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center" style={{ boxShadow: '0 0 8px rgba(255,255,255,0.3)' }}>
                    <Icon className="w-4 h-4 text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
                </div>
                <span className="text-white text-xs mt-1 font-medium" style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>{label}</span>
            </div>
            <div className="flex-1">
                <div className="h-3 bg-slate-800/50 border border-white/20">
                    <div
                        className={`h-full ${colorMap[color].bar}`}
                        style={{ width: `${percent}%`, boxShadow: `0 0 10px ${colorMap[color].shadow}` }}
                    />
                </div>
                <p className="text-white text-xs text-right mt-1 font-bold" style={{ textShadow: '0 0 8px rgba(255,255,255,0.5)' }}>{current}<span className="text-white/80">/{max}</span></p>
            </div>
        </div>
    );
}

// Simple action button with micro-interactions
export function SystemButton({ children, onClick, className = '', disabled = false }: {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-4 border border-white/40 bg-white/5 text-white font-bold tracking-[0.15em] uppercase
                transition-all duration-150 flex items-center justify-center gap-2 group
                hover:bg-white/10 hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]
                active:scale-[0.98] active:bg-white/15
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5
                ${className}`}
            style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
        >
            {children}
        </button>
    );
}

// Page layout wrapper
export function SoloLevelingLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen relative">
            <SoloLevelingBackground />
            <div className="relative z-10 min-h-screen">
                {children}
            </div>
        </main>
    );
}
