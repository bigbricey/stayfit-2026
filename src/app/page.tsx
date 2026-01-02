'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import {
    SendHorizontal,
    Mic,
    Image as ImageIcon,
    Plus,
    MessageSquare,
    Settings,
    Search,
    PanelLeftClose,
    PanelLeftOpen,
    User,
    User,
    Sparkles,
    LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types
interface Conversation {
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
}

interface DbMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    tool_calls: any;
    created_at: string;
}

export default function Chat() {
    // State
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [demoConfig, setDemoConfig] = useState<any>(null);
    const router = useRouter(); // For redirect after logout

    // Fix: Use ref to track conversation ID for callbacks
    const conversationIdRef = useRef<string | null>(null);
    useEffect(() => {
        conversationIdRef.current = currentConversationId;
    }, [currentConversationId]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // AI Hook
    const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
        maxSteps: 3,
        body: { demoConfig, conversationId: currentConversationId },
        onFinish: async (message) => {
            // Fix: Use ref to get the LATEST conversation ID, not the one from closure capture
            const activeId = conversationIdRef.current;

            if (activeId && userId) {
                await saveMessagesToDb(activeId);
                // Refresh list
                loadConversations(userId);
            } else {
                console.warn('Save skipped: missing ID or User', { activeId, userId });
            }
        },
        onError: (e) => {
            console.error('Chat error:', e);
        }
    });

    // Initialize
    useEffect(() => {
        const init = async () => {
            const saved = localStorage.getItem('stayfit_demo_config');
            if (saved) setDemoConfig(JSON.parse(saved));

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Fetch user name
                const { data: profile } = await supabase
                    .from('users_secure')
                    .select('name')
                    .eq('id', user.id)
                    .single();
                if (profile?.name) setUserName(profile.name);
                await loadConversations(user.id);
            }
            setIsLoadingConversations(false);
        };
        init();
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load conversations
    const loadConversations = async (uid: string) => {
        const { data } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', uid)
            .order('updated_at', { ascending: false });
        setConversations(data || []);
    };

    // Create new conversation
    const createNewConversation = async (): Promise<string | null> => {
        if (!userId) return null;

        const { data, error } = await supabase
            .from('conversations')
            .insert({ user_id: userId })
            .select()
            .single();

        if (error || !data) {
            console.error('Failed to create conversation:', error);
            return null;
        }

        setConversations(prev => [data, ...prev]);
        return data.id;
    };

    // Load messages for a conversation
    const loadConversation = async (conversationId: string) => {
        setCurrentConversationId(conversationId);

        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (data) {
            // Convert DB messages to useChat format
            const chatMessages = data.map((m: DbMessage) => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                toolInvocations: m.tool_calls,
            }));
            setMessages(chatMessages);
        }
    };

    // Start new chat
    const handleNewChat = () => {
        setCurrentConversationId(null);
        setMessages([]);
    };

    // Save messages to DB
    const saveMessagesToDb = async (conversationId: string) => {
        if (!userId || messages.length === 0) return;

        // Get existing message IDs for this conversation
        const { data: existingMessages } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conversationId);

        const existingIds = new Set(existingMessages?.map(m => m.id) || []);

        // Filter to only new messages
        const newMessages = messages.filter(m => !existingIds.has(m.id));

        if (newMessages.length === 0) return;

        // Insert new messages
        const toInsert = newMessages.map(m => ({
            id: m.id,
            conversation_id: conversationId,
            role: m.role,
            content: m.content,
            tool_calls: m.toolInvocations || null,
        }));

        await supabase.from('messages').insert(toInsert);

        // Update conversation title if first user message
        const firstUserMessage = messages.find(m => m.role === 'user');
        if (firstUserMessage) {
            const title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
            await supabase
                .from('conversations')
                .update({ title, updated_at: new Date().toISOString() })
                .eq('id', conversationId);

            // Update local state
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, title, updated_at: new Date().toISOString() } : c
            ));
        }
    };

    // Custom submit handler
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Create conversation if needed
        let convId = currentConversationId;
        if (!convId && userId) {
            convId = await createNewConversation();
            if (convId) {
                setCurrentConversationId(convId);
                // update ref immediately for this cycle
                conversationIdRef.current = convId;
            }
        }

        handleSubmit(e);
    };

    // Suggestion chips handler
    const handleSuggestionClick = (text: string) => {
        setInput(text);
        // We can't automatically submit here easily because useChat hooks don't expose a 'submit custom text' easily without hacking input state. 
        // But setting input allows user to just hit enter. 
        // Actually, we can just call append if we want to bypass input, but let's stick to standard flow.
        // Or better, let's auto focus and let them hit enter? Or mock the event. 
        // For now, just set input is safer UXwise so they can edit.
    };


    // Logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Force server re-render
        router.push('/login');
    };

    // Group conversations by time (unchanged logic)
    const groupConversations = (convs: Conversation[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 86400000);
        const weekAgo = new Date(today.getTime() - 7 * 86400000);
        const monthAgo = new Date(today.getTime() - 30 * 86400000);

        const groups: Record<string, Conversation[]> = {
            'Today': [],
            'Yesterday': [],
            'Previous 7 days': [],
            'Previous 30 days': [],
            'Older': [],
        };

        convs.forEach(conv => {
            const date = new Date(conv.updated_at);
            if (date >= today) groups['Today'].push(conv);
            else if (date >= yesterday) groups['Yesterday'].push(conv);
            else if (date >= weekAgo) groups['Previous 7 days'].push(conv);
            else if (date >= monthAgo) groups['Previous 30 days'].push(conv);
            else groups['Older'].push(conv);
        });

        return groups;
    };

    const filteredConversations = searchQuery
        ? conversations.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()))
        : conversations;

    const groupedConversations = groupConversations(filteredConversations);

    // Sidebar Component
    const Sidebar = () => (
        <div className={`
            ${showSidebar ? 'w-[300px]' : 'w-0'} 
            bg-[#1e1f20] flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col overflow-hidden
        `}>
            {/* New Chat & Toggle */}
            <div className="p-4 flex items-center justify-between">
                <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#2e2f30]"
                >
                    <PanelLeftClose size={20} />
                </button>
                <div onClick={handleNewChat} className="cursor-pointer hover:bg-[#2e2f30] p-2 rounded-full text-gray-400 hover:text-white">
                    <MessageSquare size={20} />
                </div>
            </div>

            {/* New Chat Button Large */}
            <div className="px-4 pb-2">
                <button
                    onClick={handleNewChat}
                    className="w-full bg-[#2e2f30] hover:bg-[#3e3f40] text-gray-200 py-3 rounded-full flex items-center gap-3 px-4 transition-colors"
                >
                    <Plus size={18} />
                    <span className="text-sm font-medium">New Chat</span>
                </button>
            </div>

            {/* Search */}
            <div className="px-4 py-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none text-gray-200 placeholder-gray-500 pl-10 focus:ring-0 focus:outline-none text-sm"
                    />
                </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
                {isLoadingConversations ? (
                    <div className="text-center text-gray-600 text-xs py-4">Loading...</div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center text-gray-600 text-xs py-4">No recent chats</div>
                ) : (
                    Object.entries(groupedConversations).map(([group, convs]) => (
                        convs.length > 0 && (
                            <div key={group} className="mb-4">
                                <div className="text-[11px] font-medium text-gray-500 px-4 py-2 uppercase tracking-wide">
                                    {group}
                                </div>
                                {convs.map(conv => (
                                    <button
                                        key={conv.id}
                                        onClick={() => loadConversation(conv.id)}
                                        className={`w-full text-left px-4 py-2 rounded-full text-sm truncate transition-colors ${currentConversationId === conv.id
                                            ? 'bg-[#004a77] text-blue-100'
                                            : 'text-gray-400 hover:bg-[#2e2f30] hover:text-gray-200'
                                            }`}
                                    >
                                        {conv.title || 'New conversation'}
                                    </button>
                                ))}
                            </div>
                        )
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 mt-auto space-y-2">
                <Link href="/settings" className="flex items-center gap-3 text-gray-400 hover:text-white px-2 py-2 rounded-lg hover:bg-[#2e2f30] transition-colors text-sm">
                    <Settings size={18} />
                    <span>Settings</span>
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 text-gray-400 hover:text-white px-2 py-2 rounded-lg hover:bg-[#2e2f30] hover:text-red-400 transition-colors text-sm">
                    <LogOut size={18} />
                    <span>Log Out</span>
                </button>
                <div className="flex items-center gap-3 text-gray-400 px-2 py-2 text-sm border-t border-gray-800 mt-2 pt-4">
                    <div className={`w-2 h-2 rounded-full ${userId ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                    <span className="truncate">{userId ? (userName || 'User') : 'Guest Mode (Not Saving)'}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans selection:bg-blue-500/30">
            <Sidebar />

            {/* Main Canvas */}
            <main className="flex-1 flex flex-col relative min-w-0">

                {/* Mobile Header / Sidebar Toggle */}
                {!showSidebar && (
                    <div className="absolute top-4 left-4 z-10">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-[#2e2f30] rounded-full transition-colors"
                        >
                            <PanelLeftOpen size={24} />
                        </button>
                    </div>
                )}

                {/* Chat Scroll Area */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-4xl mx-auto px-4 w-full h-full flex flex-col">

                        {/* Empty State / Welcome */}
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700">
                                <div className="space-y-2 text-center">
                                    <h1 className="text-5xl font-medium tracking-tight bg-gradient-to-br from-[#4285f4] to-[#d96570] bg-clip-text text-transparent pb-1">
                                        Hello, {userName?.split(' ')[0] || 'Friend'}
                                    </h1>
                                    <p className="text-2xl text-[#c4c7c5] font-light">
                                        How can I help you optimize today?
                                    </p>
                                </div>

                                {/* Suggestion Chips */}
                                <div className="flex gap-3 overflow-x-auto max-w-full pb-2 px-2 no-scrollbar">
                                    {[
                                        { icon: '🥗', text: 'Log my breakfast' },
                                        { icon: '💪', text: 'Plan a workout' },
                                        { icon: '🥩', text: 'Is this keto safe?' },
                                        { icon: '📊', text: 'Check my macros' }
                                    ].map((chip, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(chip.text)}
                                            className="flex items-center gap-2 px-5 py-3 bg-[#1e1f20] hover:bg-[#2e2f30] rounded-xl text-sm text-gray-200 transition-colors whitespace-nowrap border border-transparent hover:border-gray-700"
                                        >
                                            <span>{chip.icon}</span>
                                            <span>{chip.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="pt-20 pb-40 space-y-8">
                                {messages.map((m) => (
                                    <div key={m.id} className="flex gap-4 group">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0 mt-1">
                                            {m.role === 'user' ? (
                                                <div className="w-8 h-8 rounded-full bg-[#2e2f30] flex items-center justify-center overflow-hidden">
                                                    {userId ? <User size={16} className="text-gray-300" /> : <span className="text-xs">You</span>}
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285f4] to-[#9b72cb] flex items-center justify-center animate-in zoom-in duration-300">
                                                    <Sparkles size={16} className="text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="font-medium text-sm text-gray-400">
                                                {m.role === 'user' ? 'You' : 'StayFit Coach'}
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
                                                        code: ({ node, ...props }) => {
                                                            // @ts-ignore
                                                            const inline = props.inline
                                                            return inline
                                                                ? <code className="bg-[#2e2f30] px-1.5 py-0.5 rounded text-sm font-mono text-pink-300" {...props} />
                                                                : <code {...props} />
                                                        }
                                                    }}
                                                >
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Tool Logs */}
                                            {m.toolInvocations?.map((tool: any) => (
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
                                ))}
                                {isLoading && (
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285f4] to-[#9b72cb] flex items-center justify-center animate-pulse">
                                            <Sparkles size={16} className="text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 h-8">
                                            <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce"></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce [animation-delay:-.3s]"></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce [animation-delay:-.5s]"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Input Area */}
                <div className="pb-6 px-4 pt-2 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent z-20">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={onSubmit} className="relative group">
                            <div className={`
                                flex items-center gap-2 bg-[#1e1f20] rounded-[28px] px-2 py-2 
                                transition-all duration-200 border border-transparent
                                ${input.trim() ? 'ring-1 ring-gray-700' : 'group-hover:bg-[#2e2f30]'}
                                focus-within:bg-[#2e2f30] focus-within:ring-1 focus-within:ring-gray-600
                            `}>
                                {/* Left actions (Upload) */}
                                <button type="button" className="p-3 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors">
                                    <Plus size={20} />
                                </button>

                                {/* Input */}
                                <input
                                    className="flex-1 bg-transparent border-none text-[16px] text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-2 py-3"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask StayFit Coach..."
                                    autoFocus
                                />

                                {/* Right actions (Mic, Image, Send) */}
                                <div className="flex items-center gap-1 pr-1">
                                    <button type="button" className="p-2.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors">
                                        <ImageIcon size={20} />
                                    </button>
                                    <button type="button" className="p-2.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors">
                                        <Mic size={20} />
                                    </button>
                                    {input.trim() && (
                                        <button
                                            type="submit"
                                            className="p-2.5 bg-white text-black rounded-full hover:opacity-90 transition-opacity ml-1 animate-in zoom-in duration-200"
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

            </main>
        </div>
    );
}
