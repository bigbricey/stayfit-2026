'use client';

import { ReactNode } from 'react';
import { Plus, Zap, AlertCircle } from 'lucide-react';

// Solo Leveling Background - "Level 18 / System Interface" Style (Shattered Circuitry & Flowing Shadows)
export function SoloLevelingBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#000510]">
            {/* 
                V8 CONCEPT: "Shattered Circuitry & Flowing Shadows"
                - Background: Deep Electric Blue/Black (#000510 to #001030).
                - Texture: "Shattered Circuitry" - dense, jagged, diagonal debris. Not a clean grid.
                - Motion: "Dark Masses Moving" - A dynamic noise mask that hides/reveals parts of the circuitry 
                  to simulate energy flowing/shadows drifting.
            */}

            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    {/* FILTER: "Flowing Shadow Mask" (The "Dark Masses") 
                        Generates a moving cloudy noise texture to mask the background lines.
                    */}
                    <filter id="shadow-flow">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise">
                            <animate attributeName="baseFrequency" values="0.01;0.015;0.01" dur="15s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -9" in="noise" result="highContrastNoise" />
                        <feComposite operator="in" in="SourceGraphic" in2="highContrastNoise" />
                    </filter>

                    {/* PATTERN: "Shattered Debris" (Dense, jagged lines) 
                        Simulates the "corrupted tech" or "broken glass" look.
                    */}
                    <pattern id="shattered-tech" x="0" y="0" width="600" height="600" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
                        {/* Dense, scratchy background lines */}
                        <path d="M 0 50 L 50 100 L 100 50 L 150 100" stroke="rgba(0, 100, 255, 0.1)" strokeWidth="1" fill="none" />
                        <path d="M 200 0 L 250 50 L 200 100 L 250 150" stroke="rgba(0, 100, 255, 0.1)" strokeWidth="1" fill="none" />
                        <path d="M 0 300 L 600 300" stroke="rgba(0, 100, 255, 0.05)" strokeWidth="0.5" fill="none" />

                        {/* "Shards" - broken geometric shapes */}
                        <path d="M 50 200 L 100 200 L 120 250 L 30 250 Z" stroke="rgba(0, 150, 255, 0.15)" strokeWidth="1" fill="rgba(0, 100, 255, 0.05)" />
                        <path d="M 300 400 L 320 380 L 350 400 L 330 420 Z" stroke="rgba(0, 150, 255, 0.15)" strokeWidth="1" fill="rgba(0, 100, 255, 0.05)" />

                        {/* "Circuitry" Traces - erratic lines */}
                        <path d="M 10 10 L 40 10 L 40 40 L 80 40" stroke="rgba(0, 200, 255, 0.2)" strokeWidth="1" fill="none" />
                        <path d="M 400 500 L 400 450 L 450 450 L 450 400" stroke="rgba(0, 200, 255, 0.2)" strokeWidth="1" fill="none" />
                        <path d="M 500 100 L 520 120 L 500 140" stroke="rgba(0, 200, 255, 0.2)" strokeWidth="1" fill="none" />
                    </pattern>

                    {/* GLOW: Electric Blue Bloom */}
                    <filter id="electric-bloom">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* LAYER 1: The "Shattered" Background Pattern 
                    The base layer of complex, broken tech geometry.
                */}
                <rect width="100%" height="100%" fill="url(#shattered-tech)" />

                {/* LAYER 2: "Flowing Energy" Masked by "Dark Masses"
                    This is the key to the "masses moving around" effect.
                    We render the debris pattern again, BRIGHTER, but mask it with moving noise.
                */}
                <g filter="url(#shadow-flow)">
                    <rect width="100%" height="100%" fill="url(#shattered-tech)" stroke="rgba(0, 255, 255, 0.5)" strokeWidth="2" />
                    {/* Added extra distinct "currents" that get masked */}
                    <path d="M -100 500 L 2000 500" stroke="#00FFFF" strokeWidth="2" strokeDasharray="100 1000">
                        <animate attributeName="stroke-dashoffset" values="1100;0" dur="5s" repeatCount="indefinite" />
                    </path>
                </g>
            </svg>

            {/* LAYER 3: "Active" Circuit Traces (Foreground)
                 Bright, unmasked lines that zip across to show active power.
            */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'url(#electric-bloom)' }}>
                <path d="M -100 200 L 200 200 L 250 250 L 1000 250" stroke="#00FFFF" strokeWidth="1.5" fill="none" opacity="0.6" strokeDasharray="100 1500">
                    <animate attributeName="stroke-dashoffset" values="1600;0" dur="4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
                </path>

                <path d="M 500 800 L 500 600 L 550 550 L 550 0" stroke="#0088FF" strokeWidth="1.5" fill="none" opacity="0.6" strokeDasharray="150 1200">
                    <animate attributeName="stroke-dashoffset" values="1350;0" dur="6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;0.8;0" dur="6s" repeatCount="indefinite" />
                </path>
            </svg>

            {/* LAYER 4: Deep Blue / Vignette Overlay 
                Sets the "Deep Blue" tone of the whole screen.
            */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#000510] via-transparent to-[#000a20] opacity-80" />
            <div className="absolute inset-0 bg-[#001144] opacity-20 mix-blend-overlay" />
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
