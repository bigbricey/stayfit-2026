'use client';

import { useState, useEffect } from 'react';
import { Share, Plus, X, Smartphone, Download, Chrome } from 'lucide-react';

export default function InstallPrompt() {
    const [isMobile, setIsMobile] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Detect if mobile
        const userAgent = window.navigator.userAgent.toLowerCase();
        const mobile = /iphone|ipad|ipod|android/.test(userAgent);
        setIsMobile(mobile);

        // Detect if already installed (standalone)
        const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(standalone);

        // Check if user has previously dismissed
        const dismissed = localStorage.getItem('pwa_prompt_dismissed');
        if (dismissed) setIsDismissed(true);

        // Listen for manual trigger
        const handleManualTrigger = () => {
            setIsDismissed(false); // Temporarily override dismissal
            setShowModal(true);
        };

        window.addEventListener('show-pwa-install-prompt', handleManualTrigger);
        return () => window.removeEventListener('show-pwa-install-prompt', handleManualTrigger);
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isMobile || isStandalone || isDismissed) return null;

    return (
        <>
            {/* Pulsing Floating Button */}
            <div className="fixed bottom-24 right-4 z-50 animate-bounce">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#22c55e] text-white px-4 py-3 rounded-full shadow-2xl hover:bg-[#16a34a] transition-all transform hover:scale-105 active:scale-95 border border-white/20"
                >
                    <Download size={20} />
                    <span className="font-semibold text-sm">Install App</span>
                </button>
            </div>

            {/* Installation Instructions Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-[#1a1d24] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#2a2d34] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
                        {/* Header */}
                        <div className="p-6 flex items-start justify-between border-b border-[#2a2d34]">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white">Add to Home Screen</h3>
                                <p className="text-sm text-gray-400">Install StayFit as an app for the best experience.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-[#2a2d34] rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8">
                            {/* Step 1 */}
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <span className="text-emerald-500 font-bold">1</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white font-medium">Open the Share Menu</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2d34] rounded-lg">
                                            <Share size={16} className="text-blue-400" />
                                            <span>Safari</span>
                                        </div>
                                        <span className="text-gray-600">or</span>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2d34] rounded-lg">
                                            <Chrome size={16} className="text-[#22c55e]" />
                                            <span>Chrome</span>
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-gray-500 italic">Tap the square icon with the up arrow at the bottom or in the address bar.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <span className="text-emerald-500 font-bold">2</span>
                                </div>
                                <div className="space-y-2 text-white">
                                    <p className="font-medium">Scroll down and tap</p>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-[#2a2d34] rounded-xl border border-white/5 inline-flex">
                                        <Plus size={18} />
                                        <span className="font-semibold">Add to Home Screen</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <span className="text-emerald-500 font-bold">3</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white font-medium">Tap "Add" in the top right</p>
                                    <p className="text-xs text-gray-500">StayFit will appear on your home screen like a normal app!</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-[#12141a]/50 flex gap-3">
                            <button
                                onClick={handleDismiss}
                                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                            >
                                Don't show again
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-[#22c55e] text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
