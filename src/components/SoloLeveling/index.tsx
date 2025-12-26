'use client';

import { ReactNode } from 'react';
import { Plus, Zap, AlertCircle } from 'lucide-react';

// Animated Solo Leveling Background with Lightning Effect
export function SoloLevelingBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: '#050a14' }}>

            {/* LAYER 1: SLOW DRIFTING BLUEPRINT LINES */}
            <div
                className="absolute inset-0 animate-drift opacity-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cdefs%3E%3Cstyle%3E.line%7Bfill:none;stroke:rgba(77,184,255,0.5);stroke-width:1px;%7D.thick%7Bfill:none;stroke:rgba(77,184,255,0.7);stroke-width:1.5px;%7D.faint%7Bfill:none;stroke:rgba(77,184,255,0.25);stroke-width:0.5px;%7D%3C/style%3E%3C/defs%3E%3Cpath class='line' d='M-50,50 L100,150 L50,250 L200,200 M300,50 L400,150 L350,300 M600,-50 L700,100 L650,200 M50,500 L150,450 L250,550 M500,400 L600,500 L550,650' /%3E%3Cpath class='faint' d='M10,10 L790,590 M790,10 L10,590 M100,0 L100,600 M700,0 L700,600 M0,150 L800,150 M0,450 L800,450' /%3E%3Cpath class='line' d='M0,300 C100,250 200,350 300,300 S500,250 600,300 S700,350 800,300 M-100,400 C100,350 200,450 300,400 S500,350 600,400 S800,450 900,400' /%3E%3Crect class='thick' x='120' y='80' width='60' height='40' /%3E%3Crect class='thick' x='600' y='350' width='100' height='80' /%3E%3Cpolyline class='thick' points='50,50 80,50 80,80' /%3E%3Cpolyline class='thick' points='750,550 720,550 720,520' /%3E%3Ccircle class='faint' cx='400' cy='300' r='150' /%3E%3Ccircle class='faint' cx='400' cy='300' r='200' /%3E%3C/svg%3E")`,
                    backgroundSize: '800px 600px',
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* LAYER 2: LIGHTNING SURGE - jerky flashing layer */}
            <div
                className="absolute inset-0 animate-lightning pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cdefs%3E%3Cstyle%3E.bolt%7Bfill:none;stroke:rgba(174,226,255,0.8);stroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Cpath class='bolt' d='M100,0 L150,100 L120,150 L200,250 M400,0 L450,80 L420,120 L500,200 M700,50 L650,150 L700,200 L650,300 M200,400 L250,500 L200,550 M600,350 L550,450 L620,550' /%3E%3Cpath class='bolt' d='M0,200 L100,250 L50,300 L150,400 M300,100 L400,180 L350,250 M500,300 L600,380 L550,450' /%3E%3C/svg%3E")`,
                    backgroundSize: '800px 600px',
                    backgroundRepeat: 'repeat',
                    mixBlendMode: 'color-dodge',
                }}
            />

            {/* LAYER 3: DARK VIGNETTE (shadows at edges) */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 20%, rgba(2, 5, 15, 0.7) 70%, rgba(0, 2, 10, 0.95) 100%)',
                }}
            />

            {/* LAYER 4: TOP GLOW (pulsing light source) */}
            <div
                className="absolute top-0 left-0 right-0 h-3/4 pointer-events-none animate-pulse-glow"
                style={{
                    background: 'radial-gradient(ellipse at top center, rgba(77, 184, 255, 0.25) 0%, transparent 60%)',
                }}
            />

            {/* LAYER 5: Subtle scanlines for "hologram" feel */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.5) 4px)',
                    mixBlendMode: 'overlay',
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
