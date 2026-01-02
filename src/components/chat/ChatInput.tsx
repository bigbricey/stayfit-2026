'use client';

import {
    SendHorizontal,
    Mic,
    Image as ImageIcon,
    Plus
} from 'lucide-react';

interface ChatInputProps {
    input: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function ChatInput({ input, onInputChange, onSubmit }: ChatInputProps) {
    return (
        <div className="pb-6 px-4 pt-2 bg-gradient-to-t from-[#0a0b0d] via-[#0a0b0d] to-transparent z-20">
            <div className="max-w-3xl mx-auto">
                <form onSubmit={onSubmit} className="relative group">
                    <div className={`
                        flex items-center gap-2 bg-[#1a1d24] rounded-xl px-3 py-2 
                        transition-all duration-200 border border-[#2a2d34]
                        ${input.trim() ? 'border-[#22c55e]/50' : 'group-hover:bg-[#22262f]'}
                        focus-within:bg-[#22262f] focus-within:border-[#22c55e]/50
                    `}>
                        {/* Left actions (Upload) */}
                        <button type="button" className="p-3 text-gray-400 hover:text-white rounded-lg hover:bg-[#2a2d34] transition-colors">
                            <Plus size={20} />
                        </button>

                        {/* Input */}
                        <input
                            className="flex-1 bg-transparent border-none text-[16px] text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-2 py-3"
                            value={input}
                            onChange={onInputChange}
                            placeholder="Ask StayFit Coach..."
                            autoFocus
                        />

                        {/* Right actions (Mic, Image, Send) */}
                        <div className="flex items-center gap-1 pr-1">
                            <button type="button" className="p-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#2a2d34] transition-colors">
                                <ImageIcon size={20} />
                            </button>
                            <button type="button" className="p-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#2a2d34] transition-colors">
                                <Mic size={20} />
                            </button>
                            {input.trim() && (
                                <button
                                    type="submit"
                                    className="p-2.5 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors ml-1 animate-in zoom-in duration-200"
                                >
                                    <SendHorizontal size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Legal / Disclaimer */}
                    <div className="text-center mt-3 text-[11px] text-gray-500">
                        AI can make mistakes. Check important info.
                    </div>
                </form>
            </div>
        </div>
    );
}
