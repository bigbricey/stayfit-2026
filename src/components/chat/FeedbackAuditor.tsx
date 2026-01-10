'use client';

import { useState, useRef } from 'react';
import { MessageSquarePlus, X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

const CATEGORIES = [
    { id: 'bug', label: 'Bug Report', icon: '🐛', color: 'text-red-400' },
    { id: 'feature', label: 'Feature Idea', icon: '✨', color: 'text-blue-400' },
    { id: 'ux', label: 'UX Papercut', icon: '📐', color: 'text-emerald-400' },
    { id: 'praise', label: 'Praise', icon: '❤️', color: 'text-pink-400' },
];

export default function FeedbackAuditor() {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<string>('ux');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const supabase = createClient();
    const modalRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setStatus('idle');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    user_id: user?.id || null,
                    category,
                    content: content.trim(),
                    metadata: {
                        url: typeof window !== 'undefined' ? window.location.href : '',
                        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
                    }
                });

            if (error) throw error;

            setStatus('success');
            setContent('');
            logger.info('[FeedbackAuditor] Feedback submitted successfully');

            // Auto close after 2 seconds on success
            setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
            }, 2500);

        } catch (err) {
            logger.error('[FeedbackAuditor] Submission failed:', err);
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-[100] p-4 bg-[#12141a]/80 backdrop-blur-xl border border-[#2a2d34] text-gray-400 hover:text-white hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-full transition-all duration-300 active:scale-95 group flex items-center gap-2 overflow-hidden"
            >
                <MessageSquarePlus size={24} className="group-hover:scale-110 transition-transform" />
                <span className="max-w-0 group-hover:max-w-[100px] transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 font-medium overflow-hidden whitespace-nowrap">
                    Feedback
                </span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div
                        ref={modalRef}
                        className="bg-[#0a0b0d]/90 border border-[#2a2d34] w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                    <MessageSquarePlus size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">System Feedback</h2>
                                    <p className="text-xs text-gray-400">Directly audited by Antigravity AI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {status === 'success' ? (
                                <div className="py-12 flex flex-col items-center text-center animate-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 size={40} className="text-emerald-500 animate-in bounce-in duration-700" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Feedback Secured</h3>
                                    <p className="text-gray-400 max-w-[280px]">Your message has been encrypted and sent to the lab for auditing.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Category Selector */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-400">What are you reporting?</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(cat.id)}
                                                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 text-sm ${category === cat.id
                                                            ? 'bg-white/10 border-white/20 text-white translate-y-[-2px] shadow-lg'
                                                            : 'bg-[#12141a]/50 border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <span>{cat.icon}</span>
                                                    <span>{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Textarea */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-400">Details</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="What's on your mind? The more specific, the better the AI can audit it."
                                            className="w-full bg-[#12141a] border border-white/5 rounded-2xl p-4 min-h-[160px] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-gray-600 resize-none text-[15px] leading-relaxed"
                                            required
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                            <AlertCircle size={16} />
                                            <span>Something went wrong. Please try again.</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !content.trim()}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 font-bold shadow-xl shadow-emerald-900/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>Auditing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>Submit Feedback</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-[#0a0b0d] border-t border-white/5 text-center flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
                                Private Direct-Audit Tunnel Active
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
