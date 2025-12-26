'use client';

import { useRouter } from 'next/navigation';
import { SoloLevelingPage, SystemPanelWithHeader } from '@/components/SoloLeveling';
import { ArrowLeft, Moon } from 'lucide-react';

export default function SleepPage() {
    const router = useRouter();

    return (
        <SoloLevelingPage>
            <SystemPanelWithHeader
                title="SLEEP TRACKER"
                icon={Moon}
                backButton={
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] tracking-[0.2em] font-mono uppercase">BACK</span>
                    </button>
                }
            >
                <div className="text-center py-12">
                    <Moon className="w-16 h-16 mx-auto mb-4 text-purple-400" style={{ filter: 'drop-shadow(0 0 15px rgba(167,139,250,0.5))' }} />
                    <h2 className="text-xl font-bold tracking-widest mb-2">COMING SOON</h2>
                    <p className="text-white/60 text-sm">Track your sleep and recovery</p>
                </div>
            </SystemPanelWithHeader>
        </SoloLevelingPage>
    );
}
