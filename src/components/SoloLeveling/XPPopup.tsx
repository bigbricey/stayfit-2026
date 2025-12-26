'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface XPPopupProps {
    amount: number;
    onComplete?: () => void;
}

export function XPPopup({ amount, onComplete }: XPPopupProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onComplete?.(), 300);
        }, 1500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-50 pointer-events-none
        transition-all duration-500 ease-out
        ${visible ? 'opacity-100 -translate-y-20' : 'opacity-0 -translate-y-40'}`}
        >
            <div className="flex items-center gap-2 text-2xl font-black text-cyan-400"
                style={{ textShadow: '0 0 20px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.5)' }}>
                <Zap className="w-8 h-8" />
                <span>+{amount} XP</span>
            </div>
        </div>
    );
}

// Manager for multiple XP popups
interface XPPopupManagerProps {
    popups: { id: string; amount: number }[];
    onRemove: (id: string) => void;
}

export function XPPopupManager({ popups, onRemove }: XPPopupManagerProps) {
    return (
        <>
            {popups.map((popup, index) => (
                <div
                    key={popup.id}
                    style={{ transform: `translateY(${index * 40}px)` }}
                >
                    <XPPopup
                        amount={popup.amount}
                        onComplete={() => onRemove(popup.id)}
                    />
                </div>
            ))}
        </>
    );
}
