'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Heart, Zap, Brain, Dumbbell, Wind, Eye, ChevronRight } from 'lucide-react';

// Exact Solo Leveling Blueprint Background
function SoloLevelingBackground() {
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
function SystemPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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

// Glowing number with bloom effect
function GlowNumber({ value, size = 'lg' }: { value: number | string; size?: 'sm' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'text-2xl',
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
function VitalBar({ icon: Icon, label, current, max, color }: {
  icon: React.ElementType;
  label: string;
  current: number;
  max: number;
  color: 'green' | 'blue';
}) {
  const barColor = color === 'green' ? 'bg-green-400' : 'bg-cyan-400';
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-white/80 text-xs mt-1">{label}</span>
      </div>
      <div className="flex-1">
        <div className="h-3 bg-slate-800/50 border border-white/20">
          <div className={`h-full ${barColor}`} style={{ width: '100%', boxShadow: `0 0 10px ${color === 'green' ? 'rgba(74,222,128,0.5)' : 'rgba(34,211,238,0.5)'}` }} />
        </div>
        <p className="text-white/60 text-xs text-right mt-1">{current}/{max}</p>
      </div>
    </div>
  );
}

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

export default function WelcomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setShowContent(true), 100);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-8">
      <SoloLevelingBackground />

      <div className={`relative z-10 w-full max-w-3xl transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

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
          [ SYSTEM ACTIVATED ]
        </p>
      </div>
    </main>
  );
}
