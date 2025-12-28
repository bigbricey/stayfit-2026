'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SoloLevelingPage, SystemPanelWithHeader, SystemButton } from '@/components/SoloLeveling';
import { Sparkles, Target, TrendingUp, Trophy, ChevronRight } from 'lucide-react';

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
    <SoloLevelingPage>
      <div className={`transition-all duration-700 h-full ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Main Welcome Panel */}
        <SystemPanelWithHeader title="SYSTEM NOTIFICATION" icon={Sparkles} className="h-full">
          <div className="text-center py-8">
            <p className="text-white text-lg mb-2 font-medium">Welcome to</p>
            <h1
              className="text-4xl md:text-5xl font-black text-white mb-4 tracking-wide"
            >
              STAY FIT WITH AI
            </h1>
            <p className="text-white text-sm tracking-widest font-medium">
              [ FITNESS TRACKING SYSTEM ]
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 my-8 border-t border-b border-white/20 py-6">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto text-white mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }} />
              <p className="text-white text-sm font-bold">Track Macros</p>
              <p className="text-white/90 text-xs">Log your nutrition</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-white mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }} />
              <p className="text-white text-sm font-bold">Level Up</p>
              <p className="text-white/90 text-xs">Gain XP daily</p>
            </div>
            <div className="text-center">
              <Trophy className="w-8 h-8 mx-auto text-white mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }} />
              <p className="text-white text-sm font-bold">Compete</p>
              <p className="text-white/90 text-xs">Leaderboards (soon)</p>
            </div>
          </div>

          {/* Enter Button */}
          <SystemButton onClick={() => router.push('/login')}>
            <span>ENTER SYSTEM</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </SystemButton>

          <p className="text-center text-white text-xs mt-6 tracking-widest font-medium">
            [ NO ACCOUNT REQUIRED ]
          </p>
        </SystemPanelWithHeader>
      </div>
    </SoloLevelingPage>
  );
}
