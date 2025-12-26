'use client';

import { ReactNode } from 'react';
import { Plus, Zap, AlertCircle } from 'lucide-react';

// SoloLeveling Background - "Level 18 / System Interface" Style (RESTORED v5: Ciphering/Data Erosion)
export function SoloLevelingBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#02050c]">
            {/* 
                RESTORED CONCEPT: "Ciphering / Data Erosion" (v5)
                - Requested by user: "Save this thing... I might want to use it."
                - Features: 
                    1. Electric Distortion: SVG Turbulence for "eroded" lines.
                    2. Murky Smoke: Fluid noise background.
                    3. Floating Particles: "Ciphering off" data effect.
            */}
            <svg className="absolute w-0 h-0">
                <defs>
                    {/* FILTER 1: Electric Distortion (The "Ciphering" Effect) 
                        Creates the gritty, jagged, eroding edges.
                    */}
                    <filter id="electric-distortion">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="warp">
                            {/* Slowly animate the noise to make edges ripple like smoke */}
                            <animate attributeName="baseFrequency" values="0.04;0.041;0.04" dur="8s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="4" in="SourceGraphic" in2="warp" />
                    </filter>

                    {/* FILTER 2: Smoke Noise (The "Murky" Background)
                        Creates the swirling, liquid-like atmosphere.
                    */}
                    <filter id="smoke-noise">
                        <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="5" result="turbulence">
                            <animate attributeName="baseFrequency" values="0.01;0.012;0.01" dur="15s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" in="turbulence" result="smoke" />
                        <feComposite in="smoke" in2="SourceGraphic" operator="in" />
                    </filter>

                    {/* FILTER 3: Heavy Bloom (The "Energy" Glow) */}
                    <filter id="heavy-bloom" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            {/* LAYER 1: The Murky Background (Fluid Smoke) */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen">
                <svg width="100%" height="100%">
                    <rect width="100%" height="100%" filter="url(#smoke-noise)" fill="#003366" opacity="0.5" />
                </svg>
            </div>

            {/* LAYER 2: Ciphering "Data Lines" (Eroded Structures) */}
            <div className="absolute inset-0 pointer-events-none" style={{ filter: "url(#electric-distortion)" }}>
                <svg width="100%" height="100%">
                    {/* Large "System" Arcs - Eroded */}
                    <path
                        d="M -100 200 Q 300 100 600 -100"
                        stroke="rgba(0, 119, 255, 0.4)"
                        strokeWidth="2"
                        fill="none"
                    />
                    <path
                        d="M -100 400 Q 400 300 800 -100"
                        stroke="rgba(0, 119, 255, 0.3)"
                        strokeWidth="3"
                        fill="none"
                    />

                    {/* Vertical "Data Rain" Lines */}
                    <line x1="85%" y1="0" x2="85%" y2="100%" stroke="rgba(0, 150, 255, 0.2)" strokeWidth="1" />
                    <line x1="15%" y1="0" x2="15%" y2="100%" stroke="rgba(0, 150, 255, 0.2)" strokeWidth="1" />

                    {/* Tech Decor */}
                    <rect x="83%" y="15%" width="4%" height="10%" stroke="rgba(0, 180, 255, 0.3)" fill="none" />
                    <rect x="13%" y="75%" width="4%" height="5%" stroke="rgba(0, 180, 255, 0.3)" fill="none" />
                </svg>
            </div>

            {/* LAYER 3: Floating Data Particles (The "Ciphering Off" Effect) */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: 'radial-gradient(#00aaff 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
                    animation: 'cipher-float 8s linear infinite'
                }}
            />

            {/* LAYER 4: Deep Vignette (Central Focus) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#02050c_90%)]" />
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
// Panel with header title
export function SystemPanelWithHeader({
    title,
    icon: Icon,
    children,
    className = '',
    backButton,
    rightElement
}: {
    title: string;
    icon?: React.ElementType;
    children: ReactNode;
    className?: string;
    backButton?: ReactNode;
    rightElement?: ReactNode;
}) {
    const IconComponent = Icon || AlertCircle;
    return (
        <div className={`relative border border-white/40 bg-transparent flex flex-col ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Header - Fixed at top */}
            <div className="relative shrink-0 z-20">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {backButton && (
                            <div className="mr-2">
                                {backButton}
                            </div>
                        )}
                        <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                            <IconComponent className="w-3 h-3 text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
                        </div>
                        <span className="text-white text-sm tracking-[0.2em] uppercase font-bold" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                            {title}
                        </span>
                    </div>
                    {rightElement && (
                        <div>
                            {rightElement}
                        </div>
                    )}
                </div>
            </div>

            {/* Content - Scrollable area filling remaining space */}
            <div className="relative flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 z-10">
                {children}
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

// RESTORED CONCEPT: "Standardized Game Console" (v7.0)
// This wrapper enforces the "Video Game Screen" look on EVERY page.
// - Fixed max-width (max-w-2xl)
// - FIXED HEIGHT (600px) - matches user's Welcome page expectation.
// - Centered in viewport
// - "Extreme Legibility" text defaults
// - Internal scrolling for overflow content
export function SoloLevelingPage({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <SoloLevelingLayout>
            <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
                {/* 
                    FIXED DIMENSIONS:
                    w-full max-w-2xl (width)
                    h-[600px] (height) -> This matches the user's "Welcome Page" preference closely (~571px) 
                                         and forces consistency.
                */}
                <div className={`w-full max-w-2xl h-[600px] flex flex-col animate-in fade-in zoom-in duration-500 ${className}`}>
                    {/* 
                        Enforce "Extreme Legibility" by default for all children 
                        unless overridden.
                        The outer container has fixed dimensions.
                        Content inside scrolls if it overflows.
                        h-full ensures the backgrounds/borders stretch to fill the 600px even if content is small.
                    */}
                    <div className="text-white [&_*]:text-shadow-legibility flex-1 h-full overflow-hidden flex flex-col relative pointer-events-auto">
                        {/* 
                           Wrapper passes full height to children.
                           Scrolling is now handled INSIDE SystemPanelWithHeader to keep borders fixed.
                        */}
                        <div className="w-full h-full flex flex-col">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </SoloLevelingLayout>
    );
}
