'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { LifeScoreDashboard } from '@/components/LifeScore';
import ChatInterface from '@/components/chat/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Zap } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'lifescore' | 'chat'>('lifescore');

  return (
    <main className="bg-[#0a0a0f] min-h-screen">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 p-4 border-b border-cyan-500/20">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap size={24} className="text-cyan-400" />
            <h1 className="text-lg font-black text-cyan-100 tracking-wider uppercase">
              Stay<span className="text-cyan-400">Fit</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto">
        {activeTab === 'lifescore' ? (
          <LifeScoreDashboard />
        ) : (
          <ChatInterface />
        )}
      </div>
    </main>
  );
}
