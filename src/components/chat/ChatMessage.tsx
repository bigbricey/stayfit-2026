'use client';

import ReactMarkdown from 'react-markdown';
import { User, Sparkles, Quote, Info } from 'lucide-react';
import NutritionLabel from './NutritionLabel';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
    content: string;
    toolInvocations?: any[];
}

interface ChatMessageProps {
    message: Message;
    userId: string | null;
}

export default function ChatMessage({ message, userId }: ChatMessageProps) {
    return (
        <div className="flex gap-4 group">
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
                {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-[#1a1d24] flex items-center justify-center overflow-hidden border border-[#2a2d34]">
                        {userId ? <User size={16} className="text-gray-300" /> : <span className="text-xs">You</span>}
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#22c55e] to-[#16a34a] flex items-center justify-center animate-in zoom-in duration-300">
                        <Sparkles size={16} className="text-white" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="font-medium text-sm text-gray-400">
                    {message.role === 'user' ? 'You' : 'StayFit Coach'}
                </div>
                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] max-w-none text-[#e3e3e3]">
                    <ReactMarkdown
                        components={{
                            table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4 rounded-xl border border-gray-800">
                                    <table className="w-full text-sm text-left bg-[#1e1f20]" {...props} />
                                </div>
                            ),
                            thead: ({ node, ...props }) => <thead className="bg-[#2e2f30] text-gray-200 font-medium" {...props} />,
                            th: ({ node, ...props }) => <th className="px-5 py-3" {...props} />,
                            td: ({ node, ...props }) => <td className="px-5 py-3 border-t border-gray-800" {...props} />,
                            blockquote: ({ node, children, ...props }) => (
                                <div className="relative my-6 px-6 py-4 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl group/quote">
                                    <div className="absolute -top-3 left-4 bg-[#0a0b0d] px-2 text-emerald-500">
                                        <Quote size={14} className="fill-emerald-500/20" />
                                    </div>
                                    <div className="text-gray-300 italic text-[0.95rem] leading-relaxed">
                                        {children}
                                    </div>
                                </div>
                            ),
                            pre: ({ node, children, ...props }) => {
                                // Check if this is a nutrition code block
                                const codeChild = node?.children?.[0] as any;
                                if (codeChild?.tagName === 'code') {
                                    const className = codeChild.properties?.className?.[0] || '';
                                    if (className === 'language-nutrition') {
                                        // Extract the JSON from the code block
                                        const codeContent = codeChild.children?.[0]?.value || '';
                                        try {
                                            const nutritionData = JSON.parse(codeContent);
                                            return <NutritionLabel data={nutritionData} />;
                                        } catch (e) {
                                            console.error('Failed to parse nutrition data:', e);
                                        }
                                    }
                                }
                                return <pre className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto" {...props}>{children}</pre>;
                            },
                            code: ({ node, ...props }) => {
                                // @ts-ignore
                                const inline = props.inline
                                return inline
                                    ? <code className="bg-[#2e2f30] px-1.5 py-0.5 rounded text-sm font-mono text-pink-300" {...props} />
                                    : <code {...props} />
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Tool Logs */}
                {message.toolInvocations?.map((tool: any) => (
                    <div key={tool.toolCallId} className="mt-2 pl-2 border-l-2 border-gray-800">
                        {tool.toolName === 'log_activity' && 'result' in tool && (
                            <div className="text-xs text-emerald-400 flex items-center gap-1.5 opacity-75">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Log secured
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
