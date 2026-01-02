'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Chat() {
    const [demoConfig, setDemoConfig] = useState<any>(null);

    useEffect(() => {
        // Load demo config on mount
        const saved = localStorage.getItem('stayfit_demo_config');
        if (saved) setDemoConfig(JSON.parse(saved));
    }, []);

    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
        maxSteps: 3,
        body: { demoConfig }, // Pass config to API
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const supabase = createClient();

    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) setIsDemo(true);
    };

    const loadHistory = async () => {
        if (isDemo) {
            alert("History is disabled in Guest/Demo Mode. Sign in to access the Vault.");
            return;
        }
        setLoadingHistory(true);
        const { data } = await supabase
            .from('metabolic_logs')
            .select('*')
            .order('logged_at', { ascending: false })
            .limit(20);
        setHistory(data || []);
        setLoadingHistory(false);
        setShowHistory(true);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="flex flex-col h-screen bg-black text-gray-100 font-sans">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    StayFitWithAI
                </h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={loadHistory}
                        className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 border border-gray-700 rounded-full hover:border-gray-500"
                    >
                        📜 History
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
                {/* Chat Area */}
                <div className={`flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6 transition-all ${showHistory ? 'pr-80' : ''}`}>
                    {messages.length === 0 && !showHistory && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-70">
                            <div className="text-7xl">🧬</div>
                            <div className="space-y-2">
                                <p className="text-2xl font-light">What did you fuel your body with today?</p>
                                <p className="text-sm text-gray-500">Try: "I had a 10oz ribeye with butter" or "Switch me to Keto mode"</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
                                <button
                                    onClick={() => handleSubmit({ preventDefault: () => { }, target: { elements: { input: { value: 'Show me my macros for today' } } } } as any)}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:bg-gray-800 transition-colors text-left"
                                >
                                    <div className="text-blue-400 mb-1">📊</div>
                                    <div className="font-medium">Today's Macros</div>
                                </button>
                                <button
                                    onClick={() => handleSubmit({ preventDefault: () => { }, target: { elements: { input: { value: 'Set a goal: 150g protein daily' } } } } as any)}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:bg-gray-800 transition-colors text-left"
                                >
                                    <div className="text-emerald-400 mb-1">🎯</div>
                                    <div className="font-medium">Set a Goal</div>
                                </button>
                                <button
                                    onClick={() => handleSubmit({ preventDefault: () => { }, target: { elements: { input: { value: 'What diet mode am I on?' } } } } as any)}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:bg-gray-800 transition-colors text-left"
                                >
                                    <div className="text-yellow-400 mb-1">⚙️</div>
                                    <div className="font-medium">My Profile</div>
                                </button>
                                <button
                                    onClick={loadHistory}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:bg-gray-800 transition-colors text-left"
                                >
                                    <div className="text-purple-400 mb-1">📜</div>
                                    <div className="font-medium">View Vault</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] ${m.role === 'user' ? '' : 'w-full'}`}>
                                <div className={`rounded-2xl px-5 py-3 ${m.role === 'user'
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-transparent text-gray-100 border border-gray-800'
                                    }`}>
                                    {m.content && (
                                        <div className="whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                                            {m.content}
                                        </div>
                                    )}

                                    {m.toolInvocations?.map((toolInvocation) => {
                                        const toolCallId = toolInvocation.toolCallId;
                                        if (toolInvocation.toolName === 'log_activity') {
                                            if (!('result' in toolInvocation)) {
                                                return (
                                                    <div key={toolCallId} className="mt-3 flex items-center gap-2 text-yellow-500 text-sm animate-pulse">
                                                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                                                        VAULTING DATA...
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div key={toolCallId} className="mt-3 flex items-center gap-2 text-emerald-500 text-sm font-mono">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        DATA SECURED IN VAULT
                                                    </div>
                                                );
                                            }
                                        }
                                        if (toolInvocation.toolName === 'update_profile') {
                                            if ('result' in toolInvocation) {
                                                return (
                                                    <div key={toolCallId} className="mt-3 flex items-center gap-2 text-blue-400 text-sm font-mono">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                        </svg>
                                                        PROFILE UPDATED
                                                    </div>
                                                );
                                            }
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3 text-gray-400 text-sm flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                Analyzing metabolism...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* History Sidebar */}
                {showHistory && (
                    <div className="w-80 border-l border-gray-800 bg-gray-950 overflow-y-auto">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-950">
                            <h2 className="font-bold text-lg">📜 Data Vault</h2>
                            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white">✕</button>
                        </div>
                        <div className="p-4 space-y-3">
                            {loadingHistory && <div className="text-gray-500 text-sm animate-pulse">Loading...</div>}
                            {history.map((log) => (
                                <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.log_type === 'meal' ? 'bg-green-900 text-green-300' :
                                            log.log_type === 'workout' ? 'bg-blue-900 text-blue-300' :
                                                'bg-gray-800 text-gray-400'
                                            }`}>
                                            {log.log_type.toUpperCase()}
                                        </span>
                                        <span className="text-gray-600 text-xs">
                                            {new Date(log.logged_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 line-clamp-2">{log.content_raw}</p>
                                    {log.data_structured?.calories && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            {log.data_structured.calories} kcal • {log.data_structured.protein || 0}g P
                                        </div>
                                    )}
                                </div>
                            ))}
                            {history.length === 0 && !loadingHistory && (
                                <div className="text-gray-500 text-sm text-center py-8">
                                    Your vault is empty.<br />Start logging to build your history.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800 bg-black">
                <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full">
                    <input
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-full py-4 px-6 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-lg text-lg placeholder-gray-500"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Log a meal, set a goal, or ask a question..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full hover:from-blue-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
                {error && (
                    <div className="mt-3 bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded-lg text-sm text-center max-w-3xl mx-auto">
                        ⚠️ Error: {error.message || "An error occurred. Please try again."}
                    </div>
                )}
                <div className="text-center mt-3 text-xs text-gray-600">
                    Powered by Metabolic Science • Not Medical Advice • v1.1
                </div>
            </div>
        </div>
    );
}
