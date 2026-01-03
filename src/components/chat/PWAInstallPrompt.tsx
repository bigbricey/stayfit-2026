'use client';

import { useState, useEffect } from 'react';
import { Share, Plus, X, Download } from 'lucide-react';

export default function PWAInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other' | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // 1. Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        if (isStandalone) return;

        // 2. Check if user dismissed it recently
        const dismissed = localStorage.getItem('pwa_prompt_dismissed');
        const lastDismissed = dismissed ? parseInt(dismissed) : 0;
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (Date.now() - lastDismissed < oneWeek) return;

        // 3. Detect platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
            // Show iOS prompt after a small delay
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        } else if (/android/.test(userAgent)) {
            setPlatform('android');

            const handleBeforeInstallPrompt = (e: any) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setShowPrompt(true);
            };

            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-[#1a1d24]/95 backdrop-blur-xl border border-[#2a2d34] rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
                {/* Progress bar background */}
                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 w-full" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <Download className="text-emerald-500" size={24} />
                    </div>

                    <div className="flex-1 pr-6">
                        <h4 className="font-semibold text-white mb-1">Install StayFit App</h4>

                        {platform === 'ios' ? (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400">
                                    Get the full experience on your home screen:
                                </p>
                                <div className="flex items-center gap-2 text-[13px] bg-black/40 p-2 rounded-lg text-emerald-400">
                                    <span>Tap</span>
                                    <div className="p-1 bg-[#2a2d34] rounded">
                                        <Share size={14} className="text-blue-400" />
                                    </div>
                                    <span>then</span>
                                    <div className="p-1 bg-[#2a2d34] rounded flex items-center gap-1">
                                        <Plus size={14} />
                                        <span className="text-[10px] font-bold">Add to Home Screen</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-400 mb-3">
                                    Add StayFit to your home screen for faster tracking and offline access.
                                </p>
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Install Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
