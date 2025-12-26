'use client';

import { ReactNode } from 'react';
import { Plus, Zap, AlertCircle } from 'lucide-react';

// Exact Solo Leveling Blueprint Background
export function SoloLevelingBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: '#001f3f' }}>
            {/* Technical blueprint lines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Cracked ice / blueprint pattern */}
                    <pattern id="cracks" width="200" height="200" patternUnits="userSpaceOnUse">
                        <path d="M 0 50 L 80 0 M 20 200 L 100 80 L 180 120 M 150 0 L 100 80 M 100 80 L 50 150 L 0 180"
                            stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
                        <path d="M 200 20 L 150 80 L 180 150 M 0 100 L 60 120 L 80 200"
                            stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
                    </pattern>
                    {/* Star dots */}
                    <pattern id="stars" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="25" r="1" fill="rgba(255,255,255,0.2)" />
                        <circle cx="75" cy="15" r="0.5" fill="rgba(255,255,255,0.15)" />
                        <circle cx="45" cy="65" r="0.8" fill="rgba(255,255,255,0.18)" />
                        <circle cx="85" cy="80" r="0.6" fill="rgba(255,255,255,0.12)" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#stars)" />
                <rect width="100%" height="100%" fill="url(#cracks)" />
            </svg>

            {/* Subtle blue glow in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
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
                    <div className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center">
                        <IconComponent className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white/80 text-sm tracking-[0.2em] uppercase font-medium">
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
                <div className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80 text-xs mt-1">{label}</span>
            </div>
            <div className="flex-1">
                <div className="h-3 bg-slate-800/50 border border-white/20">
                    <div
                        className={`h-full ${colorMap[color].bar}`}
                        style={{ width: `${percent}%`, boxShadow: `0 0 10px ${colorMap[color].shadow}` }}
                    />
                </div>
                <p className="text-white/60 text-xs text-right mt-1">{current}<span className="text-white/40">/{max}</span></p>
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
