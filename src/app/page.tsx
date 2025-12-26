'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { LifeScoreDashboard } from '@/components/LifeScore';
import ChatInterface from '@/components/chat/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animation: `floatUp ${8 + Math.random() * 12}s linear infinite`,
          }}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <div
          key={`large-${i}`}
          className="absolute w-2 h-2 bg-purple-500 rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${12 + Math.random() * 8}s`,
            animation: `floatUp ${12 + Math.random() * 8}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020408] via-[#0a1628] to-[#020408]" />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
                        linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
                    `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'lifescore' | 'chat'>('lifescore');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen relative scanline">
      <AnimatedBackground />
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-10 p-4 border-b border-cyan-500/20">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-wider text-cyan-100 glow-text">
            LIFE SCORE
          </h1>
          <div className="flex items-center gap-3">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {mounted && (
          activeTab === 'lifescore' ? (
            <LifeScoreDashboard />
          ) : (
            <ChatInterface />
          )
        )}
      </div>
    </main>
  );
}
