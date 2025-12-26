'use client';

import { ReactNode } from 'react';
import { Plus, Zap, AlertCircle } from 'lucide-react';

// Solo Leveling Background - "Level 18 / System Interface" Style (Holographic Map & Lightning)
export function SoloLevelingBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-black">
            {/* 
                V7 CONCEPT: "Holographic Dungeon Map"
                - Background: Pitch black (#000000) for max contrast.
                - Texture: A "Dungeon Grid" or "Architectural Schematic" (angled, rectilinear).
                - Energy: "Lightning" arcs and "Currents" traveling along the grid lines.
                - Color: Ice Blue / Cyan (#00FFFF to #0088FF) + White Bloom.
            */}

            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    {/* GLOW FILTER: Intense "Ice Blue" Bloom */}
                    <filter id="ice-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0   0 0.8 0 0 1   0 1 1 0 1  0 0 0 1 0" in="blur" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* PATTERN: The "Dungeon Grid" (Complex tech map) 
                        Represents the "blueprint" of the world often seen in the background.
                    */}
                    <pattern id="dungeon-grid" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
                        {/* Main Grid Lines */}
                        <path d="M 0 100 L 400 100 M 0 200 L 400 200 M 0 300 L 400 300" stroke="rgba(0, 200, 255, 0.15)" strokeWidth="1" fill="none" />
                        <path d="M 100 0 L 100 400 M 200 0 L 200 400 M 300 0 L 300 400" stroke="rgba(0, 200, 255, 0.15)" strokeWidth="1" fill="none" />

                        {/* Detailed "Rooms" / Geometry */}
                        <rect x="50" y="50" width="50" height="50" stroke="rgba(0, 200, 255, 0.1)" strokeWidth="1" fill="rgba(0, 100, 255, 0.05)" />
                        <rect x="250" y="150" width="100" height="50" stroke="rgba(0, 200, 255, 0.1)" strokeWidth="1" fill="none" />
                        <path d="M 150 250 L 180 250 L 180 280 L 150 280 Z" stroke="rgba(0, 200, 255, 0.1)" strokeWidth="1" fill="none" />

                        {/* "Nav Points" */}
                        <circle cx="200" cy="200" r="2" fill="rgba(0, 255, 255, 0.3)" />
                        <circle cx="100" cy="300" r="2" fill="rgba(0, 255, 255, 0.3)" />
                        <circle cx="300" cy="100" r="2" fill="rgba(0, 255, 255, 0.3)" />
                    </pattern>

                    {/* GRADIENT: "Lightning Pulse" for the active currents */}
                    <linearGradient id="current-pulse" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                        <stop offset="50%" stopColor="#00FFFF" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                    </linearGradient>
                </defs>

                {/* LAYER 1: The "Dungeon Map" Background 
                    Covers the whole screen, angled, static but detailed.
                */}
                <rect width="100%" height="100%" fill="url(#dungeon-grid)" />
            </svg>

            {/* LAYER 2: "Energy Currents" (Traveling Lines) 
                These are the "energy kind of going in the background".
                They trace specific parts of the screen.
            */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'url(#ice-glow)' }}>
                {/* Horizontal fast currents */}
                <path d="M -100 150 L 2000 150" stroke="url(#current-pulse)" strokeWidth="2" fill="none" strokeDasharray="200 2000">
                    <animate attributeName="stroke-dashoffset" values="2200;0" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                </path>

                <path d="M -200 600 L 2000 600" stroke="url(#current-pulse)" strokeWidth="1.5" fill="none" strokeDasharray="300 2500">
                    <animate attributeName="stroke-dashoffset" values="2800;0" dur="3.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;0.7;0" dur="3.5s" repeatCount="indefinite" />
                </path>

                {/* Diagonal fast currents */}
                <path d="M 0 800 L 1000 -200" stroke="url(#current-pulse)" strokeWidth="1" fill="none" strokeDasharray="100 1500">
                    <animate attributeName="stroke-dashoffset" values="1600;0" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
                </path>
            </svg>

            {/* LAYER 3: "Lightning" (Electric Arcs) 
                Random jagged lines that flash in and out.
             */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'url(#ice-glow)' }}>
                <path d="M 100 100 L 120 150 L 90 200 L 130 250" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0">
                    {/* Flash sequence: wait 3s, falsh, wait... */}
                    <animate attributeName="opacity" values="0;1;0;0" dur="4s" keyTimes="0;0.02;0.05;1" repeatCount="indefinite" />
                    <animate attributeName="d" values="M 100 100 L 120 150 L 90 200 L 130 250; M 105 105 L 115 145 L 95 205 L 135 245" dur="0.1s" repeatCount="indefinite" />
                </path>

                <path d="M 800 500 L 850 520 L 820 560 L 860 600" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0">
                    <animate attributeName="opacity" values="0;0;1;0;0" dur="6s" keyTimes="0;0.5;0.52;0.55;1" repeatCount="indefinite" />
                    <animate attributeName="d" values="M 800 500 L 850 520 L 820 560 L 860 600; M 805 505 L 845 525 L 825 555 L 865 605" dur="0.1s" repeatCount="indefinite" />
                </path>
            </svg>

            {/* LAYER 4: Heavy Vignette and Blue Tint Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,10,30,0.8)_80%,#000000_100%)]" />
            <div className="absolute inset-0 bg-[#001133] opacity-20 mix-blend-overlay" />
        </div>
    );
}

// Global Animation Styles for "Ciphering Off"
// Note: This needs to be in globals.css for valid CSS, but adding strictly required keyframes here 
// via a style tag if not present in globals.css is a fallback pattern, or relying on globals.css update.
// We will update globals.css separately to ensure 'cipher-float' exists.

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
