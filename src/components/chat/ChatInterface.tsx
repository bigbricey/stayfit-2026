'use client';

import { useChat } from 'ai/react';
import { FoodReceipt } from './FoodReceipt';
import { useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';

export default function ChatInterface() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        maxSteps: 5,
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-black text-gray-100 mx-auto max-w-2xl w-full">

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <h2 className="text-2xl font-bold mb-2">Stay Fit with AI</h2>
                        <p className="text-sm mb-8">The ChatGPT of Dieting</p>
                        <div className="grid grid-cols-2 gap-4 text-xs text-left max-w-sm">
                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                                "I had 3 scrambled eggs and avocado toast"
                            </div>
                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                                "Graph my protein for the last week"
                            </div>
                        </div>
                    </div>
                )}

                {messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`text-xs mb-1 text-gray-500 ${m.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                            {m.role === 'user' ? 'You' : 'AI Coach'}
                        </div>

                        {m.content && (
                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] leading-relaxed ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                                }`}>
                                {m.content}
                            </div>
                        )}

                        <div className="w-full">
                            {m.toolInvocations?.map((tool) => {
                                if (tool.toolName === 'log_food') {
                                    if (tool.state === 'call') {
                                        return (
                                            <div key={tool.toolCallId} className="animate-pulse bg-gray-900 border border-gray-800 h-24 w-64 rounded-xl m-2" />
                                        );
                                    }
                                    if (tool.state === 'result') {
                                        return <FoodReceipt key={tool.toolCallId} data={tool.result} />;
                                    }
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="text-xs text-gray-500 animate-pulse ml-2">Thinking...</div>
                )}
            </div>

            <div className="p-4 bg-black border-t border-gray-900">
                <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-900 p-2 rounded-full border border-gray-800 focus-within:border-blue-500 transition-colors">
                    <input
                        className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-white placeholder-gray-500"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Log food or ask a question..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
