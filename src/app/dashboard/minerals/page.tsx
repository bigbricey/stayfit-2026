'use client';

import { useRouter } from 'next/navigation';
import { SoloLevelingPage, SystemPanelWithHeader } from '@/components/SoloLeveling';
import { ArrowLeft, Gem } from 'lucide-react';

export default function MineralsPage() {
    const router = useRouter();

    return (
        <SoloLevelingPage>
            <SystemPanelWithHeader
                title="MINERAL STACK"
                icon={Gem}
                className="min-h-full"
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
                    <Gem className="w-16 h-16 mx-auto mb-4 text-emerald-400" style={{ filter: 'drop-shadow(0 0 15px rgba(52,211,153,0.5))' }} />
                    <h2 className="text-xl font-bold tracking-widest mb-2">COMING SOON</h2>
                    <p className="text-white/60 text-sm">Track your vitamin and mineral intake</p>
                </div>
            </SystemPanelWithHeader>
        </SoloLevelingPage>
    );
}
