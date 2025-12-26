'use client';

import { ReactNode } from 'react';
import { Plus, Zap, AlertCircle } from 'lucide-react';

// Solo Leveling Background - "Notification / Necromancer" Style (Energy Current & Mana Storm)
export function SoloLevelingBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#02050c]">
            {/* 
                V6 CONCEPT: "Mana Infused System"
                - Background: A chaotic "Mana Storm" texture (Turbulence + ColorMatrix) representing the raw magic.
                - Lines: "Energy Currents" that flow continuously (using animated stroke-dasharray and gradients).
                - Feel: Not just "eroded" (v5) or "technical" (v4), but "Magical Digital" - alive and flowing.
            */}

            <svg className="absolute w-0 h-0">
                <defs>
                    {/* FILTER 1: Mana Storm (The "Background Lightning/Energy") 
                        Creates a swirling, localized distortion that looks like magical energy clouds.
                    */}
                    <filter id="mana-storm">
                        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="warp">
                            <animate attributeName="baseFrequency" values="0.015;0.018;0.015" dur="10s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  1 0 1 0 0  0 0 0 16 -6" in="warp" result="coloredWarp" />
                        <feGaussianBlur stdDeviation="8" in="coloredWarp" result="blurWarp" />
                        <feComposite operator="in" in="blurWarp" in2="SourceGraphic" />
                    </filter>

                    {/* FILTER 2: Energy Flow (The "Current")
                        Makes lines glow intensely and slightly distort as energy passes.
                    */}
                    <filter id="energy-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0.6 0 0 0  0 0 1 0 0  0 0 0 18 -7" in="blur" result="blueGlow" />
                        <feMerge>
                            <feMergeNode in="blueGlow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* GRADIENT: "Data Stream"
                        Used for the flowing lines to simulate pulses of energy.
                    */}
                    <linearGradient id="data-stream" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(0, 100, 255, 0)" />
                        <stop offset="50%" stopColor="rgba(0, 200, 255, 0.8)" />
                        <stop offset="100%" stopColor="rgba(0, 100, 255, 0)" />
                        <animate attributeName="x1" values="-100%;100%" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="x2" values="0%;200%" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="y1" values="-100%;100%" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="y2" values="0%;200%" dur="3s" repeatCount="indefinite" />
                    </linearGradient>
                </defs>
            </svg>

            {/* LAYER 1: The Mana Storm (Background Energy) 
                Chaotic blue energy clouds swirling in the deep background.
            */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen">
                <svg width="100%" height="100%">
                    <rect width="100%" height="100%" filter="url(#mana-storm)" fill="#003366" opacity="0.6">
                        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="6s" repeatCount="indefinite" />
                    </rect>
                </svg>
            </div>

            {/* LAYER 2: Energy Circuit Lines (The "Digital System") 
                Lines that have a "flowing" look, pulsing with the gradient defined above.
            */}
            <svg className="absolute inset-0 w-full h-full" style={{ filter: 'url(#energy-glow)' }}>
                {/* Large Diagonal Cuts - mimicking the "Notification" box fractures */}
                <line x1="-10%" y1="60%" x2="60%" y2="-10%" stroke="url(#data-stream)" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="stroke-dashoffset" values="1000;0" dur="4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
                </line>

                <line x1="20%" y1="110%" x2="110%" y2="20%" stroke="rgba(0, 140, 255, 0.3)" strokeWidth="1">
                    <animate attributeName="stroke-width" values="1;2;1" dur="3s" repeatCount="indefinite" />
                </line>

                {/* Random "Lightning" Cracks - thin, sharp lines that appear and disappear */}
                <path d="M 100 200 L 150 250 L 120 300 L 200 400" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="1" fill="none" opacity="0">
                    <animate attributeName="opacity" values="0;1;0" dur="5s" repeatCount="indefinite" begin="0s" />
                    <animate attributeName="d" values="M 100 200 L 150 250 L 120 300 L 200 400; M 105 205 L 140 240 L 130 310 L 210 390" dur="0.2s" repeatCount="indefinite" />
                </path>

                <path d="M 800 600 L 750 650 L 780 700 L 700 800" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="1" fill="none" opacity="0">
                    <animate attributeName="opacity" values="0;1;0" dur="7s" repeatCount="indefinite" begin="2s" />
                </path>
            </svg>

            {/* LAYER 3: Complex "Magic Circle" Runic Rings (Subtle)
                The "Necromancer" screen often has these faint rotating rings.
            */}
            <svg className="absolute inset-0 w-full h-full animate-slow-rotate opacity-20 pointer-events-none" viewBox="0 0 1000 1000">
                <circle cx="50%" cy="50%" r="300" stroke="rgba(50, 100, 255, 0.3)" strokeWidth="1" strokeDasharray="10 20 5 30" fill="none" />
                <circle cx="50%" cy="50%" r="450" stroke="rgba(50, 100, 255, 0.2)" strokeWidth="2" strokeDasharray="50 50" fill="none" />
            </svg>

            {/* LAYER 4: Deep Vignette & Texture Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#02050c_90%)]" />

            {/* Fine Grain/Noise Overlay for "Texture" */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
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
