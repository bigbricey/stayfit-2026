'use client';

import { useRef, useEffect, useState } from 'react';
import { SendHorizontal, ImageIcon, Mic, Plus, Scan, Camera } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface ChatInputProps {
    input: string;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    // New optional props for multimodal
    onFileSelect?: (file: File) => void;
    selectedImage?: string | null;
    setSelectedImage?: (url: string | null) => void;
    // Barcode scanner props
    onBarcodeScan?: (code: string) => void;
    showSidebar?: boolean;
}

export default function ChatInput({
    input,
    onInputChange,
    onSubmit,
    onFileSelect,
    selectedImage,
    setSelectedImage,
    onBarcodeScan,
    showSidebar = false
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showScanner, setShowScanner] = useState(false);

    // Auto-resize textarea based on content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Max height of 200px
        }
    }, [input]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
    };

    // Handle Enter to submit, Shift+Enter for newline
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() || selectedImage) {
                onSubmit(e as unknown as React.FormEvent);
            }
        }
    };

    return (
        <div className={`
            fixed bottom-0 right-0 p-4 bg-gradient-to-t from-[#0a0b0d] via-[#0a0b0d]/95 to-transparent z-20 
            pb-[calc(1rem+env(safe-area-inset-bottom))] transition-all duration-300 ease-in-out
            ${showSidebar ? 'left-0 md:left-[300px]' : 'left-0 md:left-0'}
        `}>
            <div className="max-w-4xl mx-auto">
                <form onSubmit={onSubmit} className="relative group">
                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="absolute -top-24 left-0 p-2 bg-[#1a1d24] rounded-xl border border-[#2a2d34] animate-in slide-in-from-bottom-2 duration-200">
                            <div className="relative">
                                <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => setSelectedImage?.(null)}
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                    <Plus size={12} className="rotate-45" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={`
                        flex items-end gap-2 bg-[#1a1d24] rounded-xl px-3 py-2 
                        transition-all duration-200 border border-[#2a2d34]
                        ${input.trim() || selectedImage ? 'border-[#22c55e]/50' : 'group-hover:bg-[#22262f]'}
                        focus-within:bg-[#22262f] focus-within:border-[#22c55e]/50
                    `}>
                        {/* Hidden Inputs */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                            className="hidden"
                        />
                        <input
                            type="file"
                            id="cameraInput"
                            capture="environment"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Left actions (Upload/Scanning) */}
                        <div className="flex items-center gap-1 mb-1">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#2a2d34] transition-colors"
                                title="Photo Library"
                            >
                                <ImageIcon size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => document.getElementById('cameraInput')?.click()}
                                className="p-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#2a2d34] transition-colors"
                                title="Take Photo"
                            >
                                <Camera size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="p-2.5 text-gray-400 hover:text-[#22c55e] rounded-lg hover:bg-[#2a2d34] transition-colors"
                                title="Scan Barcode"
                            >
                                <Scan size={20} />
                            </button>
                        </div>

                        {/* Scanner Modal */}
                        {showScanner && (
                            <BarcodeScanner
                                onClose={() => setShowScanner(false)}
                                onScan={(code) => {
                                    setShowScanner(false);
                                    if (onBarcodeScan) onBarcodeScan(code);
                                }}
                            />
                        )}

                        {/* Textarea with word wrapping and auto-resize */}
                        <textarea
                            ref={textareaRef}
                            className="flex-1 bg-transparent border-none text-[16px] text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-2 py-3 resize-none overflow-y-auto"
                            style={{ minHeight: '48px', maxHeight: '200px' }}
                            value={input}
                            onChange={onInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask StayFit Coach..."
                            autoFocus
                            rows={1}
                        />

                        {/* Right actions (Send) */}
                        <div className="flex items-center gap-1 pr-1 mb-1">
                            <button type="button" className="p-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#2a2d34] transition-colors">
                                <Mic size={20} />
                            </button>
                            {(input.trim() || selectedImage) && (
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
