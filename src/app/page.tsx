'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import NutritionLabel from '@/components/chat/NutritionLabel';
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
    Sparkles,
    LogOut,
    MoreVertical,
    Trash2,
    Pencil
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
    const [debugStatus, setDebugStatus] = useState<string>(''); // DEBUG
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [demoConfig, setDemoConfig] = useState<any>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingConversation, setEditingConversation] = useState<{ id: string; title: string } | null>(null);
    const router = useRouter(); // For redirect after logout

    // Fix: Use ref to track conversation ID for callbacks
    const conversationIdRef = useRef<string | null>(null);
    useEffect(() => {
        conversationIdRef.current = currentConversationId;
    }, [currentConversationId]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Ref for stable message access in callbacks (prevents stale closure bug)
    const messagesRef = useRef<typeof messages>([]);

    // AI Hook
    const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
        maxSteps: 3,
        // Fix: Use function to get fresh conversationId on each request
        body: () => ({ demoConfig, conversationId: conversationIdRef.current }),
        onFinish: async (message) => {
            // Fix: Use ref to get the LATEST conversation ID, not the one from closure capture
            const activeId = conversationIdRef.current;
            console.log('[onFinish] Called with activeId:', activeId, 'userId:', userId);

            if (activeId && userId) {
                // Fix: Pass the current messages from ref, not stale closure
                console.log('[onFinish] Saving messages, count:', messagesRef.current.length);
                await saveMessagesToDb(activeId, messagesRef.current);
                // Refresh list
                loadConversations(userId);
            } else {
                console.warn('[onFinish] Save skipped: missing ID or User', { activeId, userId });
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
            if (saved) {
                const config = JSON.parse(saved);
                setDemoConfig(config);
                if (config.name) setUserName(config.name);
            }

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

    // Watch for tool-based profile updates to persist in Guest Mode
    useEffect(() => {
        if (userId) return; // Authenticated users rely on DB

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.toolInvocations) {
            lastMessage.toolInvocations.forEach((tool: any) => {
                if (tool.toolName === 'update_profile' && tool.args) {
                    const updates = tool.args;
                    const newConfig = { ...demoConfig, ...updates };

                    // Specific handling for nested biometrics
                    if (updates.biometrics && demoConfig?.biometrics) {
                        newConfig.biometrics = { ...demoConfig.biometrics, ...updates.biometrics };
                    }

                    setDemoConfig(newConfig);
                    localStorage.setItem('stayfit_demo_config', JSON.stringify(newConfig));

                    if (updates.name) setUserName(updates.name);
                }
            });
        }
    }, [messages, userId, demoConfig]);

    // Keep messagesRef in sync with messages state (prevents stale closure)
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

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
        setDebugStatus(`Loading: ${conversationId.slice(0, 8)}...`);
        console.log('[loadConversation] Loading conversation:', conversationId);
        setCurrentConversationId(conversationId);

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        console.log('[loadConversation] Query result:', { count: data?.length, error });
        setDebugStatus(`Loaded: ${data?.length || 0} msgs, err: ${error?.message || 'none'}`);

        if (data && data.length > 0) {
            // Convert DB messages to useChat format
            const chatMessages = data.map((m: DbMessage) => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                toolInvocations: m.tool_calls,
            }));
            console.log('[loadConversation] Setting messages:', chatMessages.length);
            setMessages(chatMessages);
        } else {
            console.log('[loadConversation] No messages found, clearing chat');
            setMessages([]);
        }
    };

    // Start new chat
    const handleNewChat = () => {
        setCurrentConversationId(null);
        setMessages([]);
    };

    // Save messages to DB
    // Fix: Accept messages as parameter to avoid stale closure issues
    const saveMessagesToDb = async (conversationId: string, currentMessages: typeof messages) => {
        setDebugStatus(`Saving: ${currentMessages.length} msgs to ${conversationId?.slice(0, 8) || 'null'}...`);

        if (!userId || currentMessages.length === 0) {
            console.warn('[saveMessagesToDb] Skip: no user or no messages', { userId, msgCount: currentMessages.length });
            setDebugStatus(`SKIP SAVE: user=${!!userId}, msgs=${currentMessages.length}`);
            return;
        }

        console.log('[saveMessagesToDb] Saving', currentMessages.length, 'messages to conversation', conversationId);

        // Get existing message IDs for this conversation
        const { data: existingMessages } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conversationId);

        const existingIds = new Set(existingMessages?.map(m => m.id) || []);

        // Filter to only new messages
        const newMessages = currentMessages.filter(m => !existingIds.has(m.id));

        if (newMessages.length === 0) {
            console.log('[saveMessagesToDb] No new messages to save');
            return;
        }

        // Insert new messages
        const toInsert = newMessages.map(m => ({
            id: m.id,
            conversation_id: conversationId,
            role: m.role,
            content: m.content,
            tool_calls: m.toolInvocations || null,
        }));

        setDebugStatus(`Inserting ${toInsert.length} new msgs...`);
        const { error } = await supabase.from('messages').insert(toInsert);
        if (error) {
            console.error('[saveMessagesToDb] Insert error:', error);
            setDebugStatus(`INSERT ERROR: ${error.message}`);
        } else {
            console.log('[saveMessagesToDb] Saved', toInsert.length, 'new messages');
            setDebugStatus(`SAVED: ${toInsert.length} msgs ✓`);
        }

        // Update conversation title if first user message (with date prefix)
        const firstUserMessage = currentMessages.find(m => m.role === 'user');
        if (firstUserMessage) {
            const now = new Date();
            const month = now.getMonth() + 1; // 0-indexed
            const day = now.getDate();
            const weekday = now.toLocaleDateString('en-US', { weekday: 'short' }); // "Fri"
            const snippet = firstUserMessage.content.slice(0, 25) + (firstUserMessage.content.length > 25 ? '...' : '');
            const title = `${month}/${day} ${weekday}.-${snippet}`;
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

        console.log('[onSubmit] Start', { currentConversationId, userId, refValue: conversationIdRef.current });

        // Create conversation if needed
        let convId = currentConversationId;
        if (!convId && userId) {
            console.log('[onSubmit] Creating new conversation...');
            convId = await createNewConversation();
            console.log('[onSubmit] Created conversation:', convId);
            if (convId) {
                setCurrentConversationId(convId);
                // update ref immediately for this cycle
                conversationIdRef.current = convId;
                console.log('[onSubmit] Ref updated to:', conversationIdRef.current);
            }
        }

        console.log('[onSubmit] Calling handleSubmit with convId:', convId, 'ref:', conversationIdRef.current);
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


    // Rename a conversation
    const renameConversation = async (id: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        await supabase.from('conversations').update({ title: newTitle.trim() }).eq('id', id);
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle.trim() } : c));
        setEditingConversation(null);
        setOpenMenuId(null);
    };

    // Delete a conversation
    const deleteConversation = async (id: string) => {
        await supabase.from('conversations').delete().eq('id', id);
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConversationId === id) handleNewChat();
        setOpenMenuId(null);
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

    return (
        <div className="flex h-screen bg-[#0a0b0d] text-[#e5e7eb] font-sans selection:bg-emerald-500/30">
            {/* Sidebar - inlined to prevent re-render issues */}
            <div className={`
                ${showSidebar ? 'w-[300px]' : 'w-0'} 
                bg-[#12141a] flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col overflow-hidden
            `}>
                {/* New Chat & Toggle */}
                <div className="p-4 flex items-center justify-between">
                    <button
                        onClick={() => setShowSidebar(false)}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1d24]"
                    >
                        <PanelLeftClose size={20} />
                    </button>
                    <div onClick={handleNewChat} className="cursor-pointer hover:bg-[#1a1d24] p-2 rounded-lg text-gray-400 hover:text-white">
                        <MessageSquare size={20} />
                    </div>
                </div>

                {/* New Chat Button Large */}
                <div className="px-4 pb-2">
                    <button
                        onClick={handleNewChat}
                        className="w-full bg-[#1a1d24] hover:bg-[#22262f] text-gray-200 py-3 rounded-lg flex items-center gap-3 px-4 transition-colors border border-[#2a2d34]"
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
                                        <div key={conv.id} className="relative group flex items-center">
                                            {editingConversation?.id === conv.id ? (
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={editingConversation.title}
                                                    onChange={(e) => setEditingConversation({ ...editingConversation, title: e.target.value })}
                                                    onBlur={() => renameConversation(conv.id, editingConversation.title)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') renameConversation(conv.id, editingConversation.title);
                                                        if (e.key === 'Escape') setEditingConversation(null);
                                                    }}
                                                    className="flex-1 bg-[#22262f] text-gray-200 text-sm px-3 py-2 rounded-lg border border-[#22c55e] focus:outline-none"
                                                />
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => loadConversation(conv.id)}
                                                        className={`flex-1 text-left px-4 py-2 rounded-lg text-sm truncate transition-colors ${currentConversationId === conv.id
                                                            ? 'bg-[#1a1d24] text-[#22c55e] border-l-2 border-[#22c55e]'
                                                            : 'text-gray-400 hover:bg-[#1a1d24] hover:text-gray-200 border-l-2 border-transparent'
                                                            }`}
                                                    >
                                                        {conv.title || 'New conversation'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === conv.id ? null : conv.id); }}
                                                        className="p-1.5 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[#22262f]"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {openMenuId === conv.id && (
                                                <div className="absolute right-0 top-full mt-1 z-50 bg-[#1a1d24] border border-[#2a2d34] rounded-lg shadow-lg py-1 min-w-[120px]">
                                                    <button
                                                        onClick={() => { setEditingConversation({ id: conv.id, title: conv.title || '' }); setOpenMenuId(null); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#22262f] hover:text-white"
                                                    >
                                                        <Pencil size={14} />
                                                        Rename
                                                    </button>
                                                    <button
                                                        onClick={() => deleteConversation(conv.id)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#22262f] hover:text-red-300"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 mt-auto space-y-2">
                    <Link href="/settings" className="flex items-center gap-3 text-gray-400 hover:text-white px-2 py-2 rounded-lg hover:bg-[#1a1d24] transition-colors text-sm">
                        <Settings size={18} />
                        <span>Settings</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 text-gray-400 hover:text-white px-2 py-2 rounded-lg hover:bg-[#1a1d24] hover:text-red-400 transition-colors text-sm">
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                    <div className="flex items-center gap-3 text-gray-400 px-2 py-2 text-sm border-t border-gray-800 mt-2 pt-4">
                        <div className={`w-2 h-2 rounded-full ${userId ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                        <span className="truncate">{userId ? (userName || 'User') : 'Guest Mode (Not Saving)'}</span>
                    </div>
                </div>
            </div>

            {/* Main Canvas */}
            <main className="flex-1 flex flex-col relative min-w-0">

                {/* Mobile Header / Sidebar Toggle */}
                {!showSidebar && (
                    <div className="absolute top-4 left-4 z-10">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1d24] rounded-lg transition-colors"
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
                            <div className="flex-1 flex flex-col items-start justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700 pl-4">
                                <div className="space-y-2 text-left">
                                    <h1 className="text-3xl font-semibold text-[#e5e7eb]">
                                        Ready to log, {userName?.split(' ')[0] || 'there'}?
                                    </h1>
                                    <p className="text-lg text-[#9ca3af]">
                                        Track meals, plan workouts, or check your macros.
                                    </p>
                                </div>

                                {/* Suggestion Chips */}
                                <div className="flex gap-3 overflow-x-auto max-w-full pb-2 no-scrollbar">
                                    {[
                                        { icon: '🥗', text: 'Log my breakfast' },
                                        { icon: '💪', text: 'Plan a workout' },
                                        { icon: '🥩', text: 'Is this keto safe?' },
                                        { icon: '📊', text: 'Check my macros' }
                                    ].map((chip, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(chip.text)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1d24] hover:bg-[#22262f] rounded-lg text-sm text-gray-200 transition-colors whitespace-nowrap border border-[#2a2d34] hover:border-[#22c55e]/50"
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
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#22c55e] to-[#16a34a] flex items-center justify-center animate-pulse">
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
                                    onChange={handleInputChange}
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
                            {/* DEBUG STATUS */}
                            {debugStatus && (
                                <div className="text-center mt-1 text-[10px] text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                                    🔧 DEBUG: {debugStatus}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

            </main>
        </div>
    );
}
