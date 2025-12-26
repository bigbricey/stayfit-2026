'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Target, TrendingUp, Trophy, ChevronRight, Dumbbell } from 'lucide-react';

// Solo Leveling System Window Component
function SystemWindow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer glow */}
      <div className="absolute -inset-2 bg-cyan-500/20 blur-2xl" />

      {/* Main panel - no corner accents, just clean border */}
      <div className="relative border border-cyan-500/50 bg-slate-950/90 backdrop-blur-sm p-8">
        {children}
      </div>
    </div>
  );
}

// System Notification Header
function NotificationHeader({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-500/30">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-cyan-400" />
      </div>
      <span className="text-cyan-100 text-lg tracking-[0.2em] uppercase font-medium">
        {text}
      </span>
    </div>
  );
}

// Background with tech pattern
function TechBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 200, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 200, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Diagonal lines pattern (like Solo Leveling) */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(0, 200, 255, 0.5) 35px,
              rgba(0, 200, 255, 0.5) 36px
            )
          `,
        }}
      />

      {/* Ambient glow in corners */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.5) 2px, rgba(0, 0, 0, 0.5) 4px)',
        }}
      />
    </div>
  );
}

const features = [
  { icon: Target, label: 'TRACK MACROS', desc: 'Protein • Carbs • Fat' },
  { icon: TrendingUp, label: 'LEVEL UP', desc: 'XP rewards for goals' },
  { icon: Trophy, label: 'COMPETE', desc: 'Leaderboards (soon)' },
];

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
    <main className="min-h-screen relative flex items-center justify-center p-6">
      <TechBackground />

      {/* Main System Window - BIG, takes up most of screen */}
      <div className={`relative z-10 w-full max-w-3xl transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <SystemWindow>
          <NotificationHeader text="SYSTEM" />

          {/* Main Message */}
          <div className="text-center mb-8">
            <p className="text-cyan-100/80 text-lg mb-2">Welcome to</p>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
              STAY FIT WITH AI
            </h1>
            <p className="text-cyan-400/60 text-sm">
              [Fitness Tracking System Activated]
            </p>
          </div>

          {/* Stats Preview Box */}
          <SystemWindow className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-100 text-sm tracking-wider">YOUR STATS</span>
              </div>
              <span className="text-cyan-400/60 text-xs">LV. 1</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              {features.map((feature) => (
                <div key={feature.label} className="space-y-1">
                  <feature.icon className="w-6 h-6 mx-auto text-cyan-400" />
                  <p className="text-xs text-cyan-100 font-medium">{feature.label}</p>
                  <p className="text-[10px] text-cyan-500/60">{feature.desc}</p>
                </div>
              ))}
            </div>
          </SystemWindow>

          {/* Action Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 border border-cyan-500/50 bg-cyan-500/10 text-cyan-100 font-bold tracking-wider uppercase
              hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20
              transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>START TRACKING</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-cyan-500/40 text-xs mt-4 tracking-wide">
            [No account required]
          </p>
        </SystemWindow>
      </div>
    </main>
  );
}
