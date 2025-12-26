'use client';

import { ReactNode } from 'react';
import { Plus, Zap, AlertCircle } from 'lucide-react';

// Solo Leveling Background - Plasma Tendrils / Energy Veins
export function SoloLevelingBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: '#02040a' }}>

            {/* LAYER 1: Deep atmospheric base */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 50% 30%, rgba(10, 40, 80, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(5, 25, 60, 0.4) 0%, transparent 60%)',
                }}
            />

            {/* LAYER 2: PLASMA TENDRILS - Organic branching energy pattern */}
            <svg
                className="absolute inset-0 w-full h-full animate-plasma-pulse"
                viewBox="0 0 1000 800"
                preserveAspectRatio="xMidYMid slice"
                style={{ opacity: 0.4 }}
            >
                <defs>
                    {/* Glow filter for energy effect */}
                    <filter id="plasma-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main energy tendrils - organic branching paths */}
                <g filter="url(#plasma-glow)" className="animate-tendril-flow">
                    {/* Central cluster spreading outward */}
                    <path d="M500,400 Q450,350 400,320 Q350,290 280,260 Q220,230 150,220" stroke="rgba(0,200,255,0.6)" strokeWidth="2" fill="none" />
                    <path d="M280,260 Q260,240 220,250 Q180,260 130,280" stroke="rgba(0,200,255,0.4)" strokeWidth="1.5" fill="none" />
                    <path d="M400,320 Q380,280 350,240 Q320,200 280,160" stroke="rgba(0,200,255,0.5)" strokeWidth="1.5" fill="none" />
                    <path d="M350,240 Q330,220 340,180 Q350,140 380,100" stroke="rgba(0,200,255,0.3)" strokeWidth="1" fill="none" />

                    <path d="M500,400 Q550,350 600,320 Q650,290 720,260 Q780,230 850,220" stroke="rgba(0,200,255,0.6)" strokeWidth="2" fill="none" />
                    <path d="M720,260 Q740,240 780,250 Q820,260 870,280" stroke="rgba(0,200,255,0.4)" strokeWidth="1.5" fill="none" />
                    <path d="M600,320 Q620,280 650,240 Q680,200 720,160" stroke="rgba(0,200,255,0.5)" strokeWidth="1.5" fill="none" />

                    <path d="M500,400 Q480,450 450,500 Q420,550 380,600 Q340,650 280,700" stroke="rgba(0,200,255,0.6)" strokeWidth="2" fill="none" />
                    <path d="M450,500 Q420,520 400,560 Q380,600 340,650" stroke="rgba(0,200,255,0.4)" strokeWidth="1.5" fill="none" />
                    <path d="M380,600 Q350,620 360,670 Q370,720 350,780" stroke="rgba(0,200,255,0.3)" strokeWidth="1" fill="none" />

                    <path d="M500,400 Q520,450 550,500 Q580,550 620,600 Q660,650 720,700" stroke="rgba(0,200,255,0.6)" strokeWidth="2" fill="none" />
                    <path d="M550,500 Q580,520 600,560 Q620,600 660,650" stroke="rgba(0,200,255,0.4)" strokeWidth="1.5" fill="none" />
                </g>
            </svg>

            {/* LAYER 3: Secondary tendril network (offset, different timing) */}
            <svg
                className="absolute inset-0 w-full h-full animate-plasma-pulse-delayed"
                viewBox="0 0 1000 800"
                preserveAspectRatio="xMidYMid slice"
                style={{ opacity: 0.3 }}
            >
                <defs>
                    <filter id="plasma-glow-2" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <g filter="url(#plasma-glow-2)" className="animate-tendril-flow-reverse">
                    {/* Upper left cluster */}
                    <path d="M200,200 Q250,180 300,150 Q350,120 420,80 Q490,40 560,20" stroke="rgba(100,180,255,0.5)" strokeWidth="1.5" fill="none" />
                    <path d="M300,150 Q320,120 360,90 Q400,60 450,30" stroke="rgba(100,180,255,0.3)" strokeWidth="1" fill="none" />
                    <path d="M200,200 Q180,250 150,300 Q120,350 80,420" stroke="rgba(100,180,255,0.4)" strokeWidth="1.5" fill="none" />

                    {/* Lower right cluster */}
                    <path d="M800,600 Q750,580 700,550 Q650,520 580,480 Q510,440 440,420" stroke="rgba(100,180,255,0.5)" strokeWidth="1.5" fill="none" />
                    <path d="M700,550 Q680,520 640,490 Q600,460 550,430" stroke="rgba(100,180,255,0.3)" strokeWidth="1" fill="none" />
                    <path d="M800,600 Q820,650 850,700 Q880,750 920,820" stroke="rgba(100,180,255,0.4)" strokeWidth="1.5" fill="none" />

                    {/* Scattered smaller branches */}
                    <path d="M100,500 Q150,480 200,440 Q250,400 320,360" stroke="rgba(100,180,255,0.3)" strokeWidth="1" fill="none" />
                    <path d="M900,300 Q850,320 800,360 Q750,400 680,440" stroke="rgba(100,180,255,0.3)" strokeWidth="1" fill="none" />
                </g>
            </svg>

            {/* LAYER 4: Bright core energy pulses (traveling along paths) */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1000 800"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <filter id="intense-glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Bright energy nodes that pulse */}
                <circle className="animate-node-pulse" cx="500" cy="400" r="8" fill="rgba(150,220,255,0.8)" filter="url(#intense-glow)" />
                <circle className="animate-node-pulse-delayed" cx="280" cy="260" r="4" fill="rgba(150,220,255,0.6)" filter="url(#intense-glow)" />
                <circle className="animate-node-pulse" cx="720" cy="260" r="4" fill="rgba(150,220,255,0.6)" filter="url(#intense-glow)" />
                <circle className="animate-node-pulse-delayed" cx="380" cy="600" r="5" fill="rgba(150,220,255,0.6)" filter="url(#intense-glow)" />
                <circle className="animate-node-pulse" cx="620" cy="600" r="5" fill="rgba(150,220,255,0.6)" filter="url(#intense-glow)" />
            </svg>

            {/* LAYER 5: DARK VIGNETTE */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0, 2, 8, 0.7) 70%, rgba(0, 0, 5, 0.95) 100%)',
                }}
            />

            {/* LAYER 6: Subtle scanlines */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,200,255,0.1) 3px)',
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
