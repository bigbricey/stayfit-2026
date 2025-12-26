'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface SystemNotificationProps {
    message: string;
    type?: 'info' | 'success' | 'warning';
    duration?: number;
    onComplete?: () => void;
    typewriter?: boolean;
}

export function SystemNotification({
    message,
    type = 'info',
    duration = 3000,
    onComplete,
    typewriter = true
}: SystemNotificationProps) {
    const [visible, setVisible] = useState(false);
    const [displayedText, setDisplayedText] = useState('');

    // Slide in
    useEffect(() => {
        setTimeout(() => setVisible(true), 50);
    }, []);

    // Typewriter effect
    useEffect(() => {
        if (!typewriter) {
            setDisplayedText(message);
            return;
        }

        let index = 0;
        const interval = setInterval(() => {
            if (index <= message.length) {
                setDisplayedText(message.slice(0, index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [message, typewriter]);

    // Auto dismiss
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onComplete?.(), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    const colors = {
        info: 'border-cyan-500/50 bg-cyan-500/10',
        success: 'border-green-500/50 bg-green-500/10',
        warning: 'border-orange-500/50 bg-orange-500/10',
    };

    const glowColors = {
        info: 'rgba(34,211,238,0.5)',
        success: 'rgba(74,222,128,0.5)',
        warning: 'rgba(251,146,60,0.5)',
    };

    return (
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        >
            <div
                className={`border ${colors[type]} backdrop-blur-sm px-6 py-3 min-w-[300px]`}
                style={{ boxShadow: `0 0 30px ${glowColors[type]}` }}
            >
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs tracking-[0.2em] uppercase">SYSTEM</span>
                </div>

                {/* Message */}
                <p className="text-white font-medium" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                    {displayedText}
                    {typewriter && displayedText.length < message.length && (
                        <span className="animate-pulse">▊</span>
                    )}
                </p>
            </div>
        </div>
    );
}

// Manager for notification queue
interface NotificationManagerProps {
    notifications: { id: string; message: string; type?: 'info' | 'success' | 'warning' }[];
    onRemove: (id: string) => void;
}

export function NotificationManager({ notifications, onRemove }: NotificationManagerProps) {
    const current = notifications[0];

    if (!current) return null;

    return (
        <SystemNotification
            key={current.id}
            message={current.message}
            type={current.type}
            onComplete={() => onRemove(current.id)}
        />
    );
}
