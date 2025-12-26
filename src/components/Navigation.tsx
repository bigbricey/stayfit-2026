'use client';

import { useState } from 'react';
import { Activity, MessageCircle, Zap } from 'lucide-react';

interface NavigationProps {
    activeTab: 'lifescore' | 'chat';
    onTabChange: (tab: 'lifescore' | 'chat') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
    return (
        <nav className="flex gap-1 p-1 bg-slate-900/50 rounded-lg border border-cyan-500/20">
            <button
                onClick={() => onTabChange('lifescore')}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs tracking-wider uppercase transition-all duration-300
                    ${activeTab === 'lifescore'
                        ? 'bg-gradient-to-r from-cyan-600/50 to-purple-600/50 text-cyan-100 glow-border'
                        : 'text-cyan-400/50 hover:text-cyan-300 hover:bg-slate-800/50'
                    }
                `}
            >
                <Zap size={14} />
                Status
            </button>
            <button
                onClick={() => onTabChange('chat')}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs tracking-wider uppercase transition-all duration-300
                    ${activeTab === 'chat'
                        ? 'bg-gradient-to-r from-cyan-600/50 to-purple-600/50 text-cyan-100 glow-border'
                        : 'text-cyan-400/50 hover:text-cyan-300 hover:bg-slate-800/50'
                    }
                `}
            >
                <MessageCircle size={14} />
                Comms
            </button>
        </nav>
    );
}
