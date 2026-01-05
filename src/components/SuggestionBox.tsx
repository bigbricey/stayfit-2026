'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, X, ThumbsUp, ThumbsDown, Send, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Suggestion {
    id: string;
    user_id: string;
    title: string | null;
    content: string;
    status: string;
    created_at: string;
    upvotes: number;
    downvotes: number;
    user_vote: number | null;
    user_name: string | null;
}

export default function SuggestionBox() {
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [newSuggestion, setNewSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email === 'bigbricey@gmail.com') {
                setIsAdmin(true);
            }
        };
        checkAdmin();
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadSuggestions();
        }
    }, [isOpen]);

    const loadSuggestions = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.rpc('get_suggestions_with_votes');
        if (error) {
            console.error('Error loading suggestions:', error);
        } else {
            setSuggestions(data || []);
        }
        setIsLoading(false);
    };

    const handleVote = async (suggestionId: string, voteType: 1 | -1) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to vote!');
            return;
        }

        // Optimistic UI update
        const currentSuggestion = suggestions.find(s => s.id === suggestionId);
        if (currentSuggestion?.user_vote === voteType) {
            // Already voted this way? Toggle off (implied logic, but for simplicity let's just re-apply)
            // For now, assume simple toggle logic
        }

        const { error } = await supabase
            .from('suggestion_votes')
            .upsert({
                suggestion_id: suggestionId,
                user_id: user.id,
                vote: voteType
            });

        if (error) {
            console.error('Error voting:', error);
        } else {
            loadSuggestions();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSuggestion.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to submit a suggestion!');
            return;
        }

        setIsSubmitting(true);
        const { error } = await supabase
            .from('suggestions')
            .insert({
                user_id: user.id,
                content: newSuggestion.trim(),
            });

        if (error) {
            alert('Error submitting: ' + error.message);
        } else {
            setNewSuggestion('');
            loadSuggestions();
        }
        setIsSubmitting(false);
    };

    const runAiAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/admin/summarize-suggestions');
            if (res.ok) {
                const data = await res.json();
                setAiSummary(data.summary);
            } else {
                setAiSummary("Failed to generate AI summary. Ensure you are logged in as admin.");
            }
        } catch (err) {
            console.error('AI Analysis failed:', err);
            setAiSummary("An error occurred during AI analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[100] p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all active:scale-95 group flex items-center gap-2"
                title="Suggestion Box"
            >
                <Lightbulb size={24} className="group-hover:animate-pulse" />
                <span className="hidden group-hover:block font-medium pr-1">Suggest</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#12141a] border border-[#2a2d34] w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#2a2d34] bg-[#12141a]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                    <MessageSquare size={20} />
                                </div>
                                <h2 className="text-xl font-bold">Suggestion Box</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Submit New */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <label className="text-sm font-medium text-gray-400">Share your thoughts with the developers</label>
                                <div className="relative">
                                    <textarea
                                        value={newSuggestion}
                                        onChange={(e) => setNewSuggestion(e.target.value)}
                                        placeholder="I think the app should have..."
                                        className="w-full bg-[#0a0b0d] border border-[#2a2d34] rounded-xl p-4 min-h-[100px] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-gray-600 resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !newSuggestion.trim()}
                                        className="absolute bottom-3 right-3 p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-lg transition-all active:scale-95"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    </button>
                                </div>
                            </form>

                            {/* AI Insights for Admin */}
                            {isAdmin && (
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                            <Sparkles size={18} />
                                            <span>Admin Insight Panel</span>
                                        </div>
                                        <button
                                            onClick={runAiAnalysis}
                                            disabled={isAnalyzing}
                                            className="text-xs px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition-all"
                                        >
                                            {isAnalyzing ? "Analyzing..." : "Group & Summarize Ideas"}
                                        </button>
                                    </div>
                                    {aiSummary && (
                                        <div className="text-sm text-emerald-100/80 leading-relaxed bg-black/30 p-3 rounded-lg border border-emerald-500/10">
                                            {aiSummary}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Feed */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Suggestions</h3>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                                    </div>
                                ) : suggestions.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-[#2a2d34] rounded-2xl text-gray-500">
                                        No suggestions yet. Be the first!
                                    </div>
                                ) : (
                                    suggestions.map((s) => (
                                        <div key={s.id} className="p-4 bg-[#1a1d24] border border-[#2a2d34] rounded-xl space-y-3 group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-white leading-relaxed">{s.content}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>By {s.user_name || 'Anonymous User'}</span>
                                                        <span>•</span>
                                                        <span>{new Date(s.created_at).toLocaleDateString()}</span>
                                                        {s.status !== 'pending' && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 capitalize">{s.status.replace('-', ' ')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Voting */}
                                                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                                    <button
                                                        onClick={() => handleVote(s.id, 1)}
                                                        className={`p-1.5 rounded-lg transition-all ${s.user_vote === 1 ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500 hover:bg-[#2a2d34] hover:text-white'}`}
                                                    >
                                                        <ThumbsUp size={18} fill={s.user_vote === 1 ? "currentColor" : "none"} />
                                                    </button>
                                                    <span className={`text-xs font-bold ${s.upvotes - s.downvotes > 0 ? 'text-emerald-500' : s.upvotes - s.downvotes < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                                        {s.upvotes - s.downvotes}
                                                    </span>
                                                    <button
                                                        onClick={() => handleVote(s.id, -1)}
                                                        className={`p-1.5 rounded-lg transition-all ${s.user_vote === -1 ? 'bg-red-500/20 text-red-500' : 'text-gray-500 hover:bg-[#2a2d34] hover:text-white'}`}
                                                    >
                                                        <ThumbsDown size={18} fill={s.user_vote === -1 ? "currentColor" : "none"} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-[#0a0b0d] border-t border-[#2a2d34] text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                            Powered by Antigravity AI Grouping Logic
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
