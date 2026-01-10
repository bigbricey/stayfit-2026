'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { createClient, supabase } from '@/lib/supabase/client';
import { PanelLeftOpen, Sparkles, X } from 'lucide-react';

// Components
import Sidebar from '@/components/chat/Sidebar';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { resizeImage } from '@/lib/utils';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import PWAInstallPrompt from '@/components/chat/PWAInstallPrompt';
import { logger } from '@/lib/logger';
import { STORAGE_KEYS } from '@/lib/config';

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
    tool_calls: unknown;
    experimental_attachments?: unknown;
    created_at: string;
}

interface UserConfig {
    name?: string;
    biometrics?: Record<string, unknown>;
    [key: string]: unknown;
}

interface ToolInvocation {
    toolName: string;
    args: Record<string, unknown>;
}

// Toast notification component for errors
interface ToastProps {
    message: string;
    onDismiss: () => void;
}

function ErrorToast({ message, onDismiss }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 8000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-red-900/90 border border-red-700 text-red-100 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
                <span className="flex-1 text-sm">{message}</span>
                <button onClick={onDismiss} className="text-red-300 hover:text-white">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

export default function Chat() {
    // State
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(false); // Default to closed for better mobile UX
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [demoConfig, setDemoConfig] = useState<UserConfig | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [radarData, setRadarData] = useState<any>(null);

    // Use the singleton supabase client


    // Responsive initial state
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShowSidebar(window.innerWidth >= 768);
        }
    }, []);

    // Refs
    const conversationIdRef = useRef<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<typeof messages>([]);

    // Sync conversationId ref
    useEffect(() => {
        conversationIdRef.current = currentConversationId;
    }, [currentConversationId]);

    // AI Hook
    const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, setMessages, error, stop, reload } = useChat({
        maxSteps: 3,
        body: () => {

            logger.debug('[useChat] body() called', { convRef: conversationIdRef.current });
            return {
                demoConfig,
                conversationId: conversationIdRef.current,
                clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // e.g. "America/New_York"
            };
        },
        onResponse: (response) => {
            logger.debug('[useChat] onResponse received', { status: response.status, statusText: response.statusText });
        },
        onFinish: async () => {
            if (userId) {
                logger.debug('[onFinish] Refreshing radar and history');
                loadConversations(userId);
                fetchRadarData(userId);
            }
        },
        onError: (e) => {
            logger.error('[useChat] onError', e);
            setErrorMessage(`Chat error: ${e.message}`);
        }
    });

    const handleFileSelect = async (file: File) => {
        logger.debug('[handleFileSelect] File selected', { name: file.name, size: file.size });
        setIsCompressing(true);
        try {
            const compressedDataUrl = await resizeImage(file);
            logger.debug('[handleFileSelect] Compression complete', { length: compressedDataUrl.length });
            setSelectedImage(compressedDataUrl);
            setSelectedFile(file);
        } catch (err) {
            logger.error('[handleFileSelect] Compression failed:', err);
            // Fallback to original reader if compression fails
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setSelectedImage(result);
                setSelectedFile(file);
                logger.debug('[handleFileSelect] Fallback read complete', { length: result.length });
            };
            reader.readAsDataURL(file);
        } finally {
            setIsCompressing(false);
        }
    };

    const fetchRadarData = useCallback(async (uid: string) => {
        logger.debug('[fetchRadarData] Fetching for user', { uid });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        try {
            const { data, error } = await supabase
                .from('metabolic_logs')
                .select('calories, protein, carbs, fat, logged_at')
                .eq('user_id', uid)
                .gte('logged_at', sevenDaysAgo.toISOString())
                .order('logged_at', { ascending: false });

            if (!data || data.length === 0) {
                setRadarData({
                    avg_calories: 0,
                    avg_protein: 0,
                    avg_carbs: 0,
                    avg_fat: 0,
                    raw_logs_count: 0
                });
                return;
            }

            if (data && data.length > 0) {
                logger.debug('[fetchRadarData] Data received', { count: data.length });
                const totals = data.reduce((acc: any, log: any) => ({
                    calories: acc.calories + (log.calories || 0),
                    protein: acc.protein + (log.protein || 0),
                    carbs: acc.carbs + (log.carbs || 0),
                    fat: acc.fat + (log.fat || 0),
                }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

                setRadarData({
                    avg_calories: Math.round(totals.calories / 7),
                    avg_protein: Math.round(totals.protein / 7),
                    avg_carbs: Math.round(totals.carbs / 7),
                    avg_fat: Math.round(totals.fat / 7),
                    raw_logs_count: data.length
                });
            } else {
                logger.debug('[fetchRadarData] No logs found');
                setRadarData({
                    avg_calories: 0,
                    avg_protein: 0,
                    avg_carbs: 0,
                    avg_fat: 0,
                    raw_logs_count: 0
                });
            }
        } catch (err) {
            logger.error('[fetchRadarData] Exception fetching radar data:', err);
            setRadarData(null);
        }
    }, []);

    const handleBarcodeScan = async (code: string) => {
        logger.debug('[handleBarcodeScan] Scanned code', { code });
        try {
            const res = await fetch(`/api/lookup-upc?upc=${code}`);
            if (!res.ok) throw new Error('Product not found');
            const data = await res.json();

            // Format the product info into the chat input
            const productInfo = `I've scanned ${data.brand || ''} ${data.name}. It has ${data.calories} calories, ${data.protein}g protein, ${data.fat}g fat, and ${data.carbs}g carbs per ${data.serving_size}. Please log this for me.`;
            setInput(productInfo);
        } catch (err) {
            logger.error('Barcode lookup failed:', err);
            setInput(`I scanned code ${code}, but couldn't find it in the database. Can you help me log it manually?`);
        }
    };

    // Initialize
    useEffect(() => {
        const init = async () => {
            const saved = localStorage.getItem(STORAGE_KEYS.DEMO_CONFIG);
            if (saved) {
                const config = JSON.parse(saved);
                setDemoConfig(config);
                if (config.name) setUserName(config.name);
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setUserEmail(user.email ?? null);
                const { data: profile } = await supabase
                    .from('users_secure')
                    .select('name')
                    .eq('id', user.id)
                    .single();
                if (profile?.name) setUserName(profile.name);
                await Promise.all([
                    loadConversations(user.id),
                    fetchRadarData(user.id)
                ]);
            }
            setIsLoadingConversations(false);
        };
        init();
    }, []);

    // Watch for tool-based profile updates in Guest Mode
    useEffect(() => {
        if (userId) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.toolInvocations) {
            lastMessage.toolInvocations.forEach((tool: unknown) => {
                const typedTool = tool as ToolInvocation;
                if (typedTool.toolName === 'update_profile' && typedTool.args) {
                    const updates = typedTool.args as UserConfig;
                    const newConfig: UserConfig = { ...(demoConfig || {}), ...updates };

                    if (updates.biometrics && demoConfig?.biometrics) {
                        newConfig.biometrics = { ...demoConfig.biometrics, ...updates.biometrics };
                    }

                    setDemoConfig(newConfig);
                    localStorage.setItem(STORAGE_KEYS.DEMO_CONFIG, JSON.stringify(newConfig));

                    if (updates.name) setUserName(updates.name);
                }
            });
        }
    }, [messages, userId, demoConfig]);

    // Keep messagesRef in sync
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // =========================================================================
    // Conversation CRUD
    // =========================================================================

    const loadConversations = async (uid: string) => {
        const { data } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', uid)
            .order('updated_at', { ascending: false });
        setConversations(data || []);
    };

    const createNewConversation = async (): Promise<string | null> => {
        if (!userId) return null;

        const { data, error } = await supabase
            .from('conversations')
            .insert({ user_id: userId })
            .select()
            .single();

        if (error || !data) {
            logger.error('Failed to create conversation:', error);
            return null;
        }

        setConversations(prev => [data, ...prev]);
        return data.id;
    };

    const loadConversation = async (conversationId: string) => {
        logger.debug('[loadConversation] Loading conversation', { conversationId });
        setCurrentConversationId(conversationId);
        if (typeof window !== 'undefined' && window.innerWidth < 768) setShowSidebar(false);

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        logger.debug('[loadConversation] Query result', { count: data?.length, error });

        if (data && data.length > 0) {
            const chatMessages = data.map((m: DbMessage) => {
                // Defensive checks for JSONB columns which might be objects instead of arrays
                let toolInvocations = m.tool_calls;
                if (toolInvocations && !Array.isArray(toolInvocations)) {
                    logger.warn('[loadConversation] tool_calls is not an array, wrapping', { toolInvocations });
                    toolInvocations = [toolInvocations];
                }

                let attachments = m.experimental_attachments;
                if (attachments && !Array.isArray(attachments)) {
                    logger.warn('[loadConversation] attachments is not an array, wrapping', { attachments });
                    attachments = [attachments];
                }

                return {
                    id: m.id,
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content || '',
                    toolInvocations: (toolInvocations || undefined) as any,
                    experimental_attachments: (attachments || undefined) as any,
                };
            });
            logger.debug('[loadConversation] Setting messages', { count: chatMessages.length });
            setMessages(chatMessages);
        } else {
            logger.debug('[loadConversation] No messages found, clearing chat');
            setMessages([]);
        }
    };

    const handleNewChat = () => {
        setCurrentConversationId(null);
        setMessages([]);
        if (window.innerWidth < 768) setShowSidebar(false);
    };

    const saveMessagesToDb = async (conversationId: string, currentMessages: typeof messages) => {
        if (!userId || currentMessages.length === 0) {
            logger.warn('[saveMessagesToDb] Skip: no user or no messages', { userId, msgCount: currentMessages.length });
            return;
        }

        logger.debug('[saveMessagesToDb] Saving messages', { count: currentMessages.length, conversationId });

        const { data: existingMessages } = await supabase
            .from('messages')
            .select('role, content')
            .eq('conversation_id', conversationId);

        const existingSignatures = new Set(
            existingMessages?.map((m: any) => `${m.role}:${m.content?.slice(0, 100)}`) || []
        );

        const newMessages = currentMessages.filter(m =>
            !existingSignatures.has(`${m.role}:${m.content?.slice(0, 100)}`)
        );

        if (newMessages.length === 0) {
            logger.debug('[saveMessagesToDb] No new messages to save');
            return;
        }

        const toInsert = newMessages.map(m => ({
            id: crypto.randomUUID(),
            conversation_id: conversationId,
            role: m.role,
            content: m.content,
            tool_calls: m.toolInvocations || null,
            experimental_attachments: (m as { experimental_attachments?: unknown }).experimental_attachments || null,
        }));

        const { error } = await supabase.from('messages').insert(toInsert);
        if (error) {
            logger.error('[saveMessagesToDb] Insert error:', error);
        } else {
            logger.debug('[saveMessagesToDb] Saved new messages', { count: toInsert.length });
        }

        // Update conversation title if first user message
        const firstUserMessage = currentMessages.find(m => m.role === 'user');
        if (firstUserMessage) {
            const now = new Date();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const weekday = now.toLocaleDateString('en-US', { weekday: 'short' });
            const snippet = firstUserMessage.content.slice(0, 25) + (firstUserMessage.content.length > 25 ? '...' : '');
            const title = `${month}/${day} ${weekday}.-${snippet}`;
            await supabase
                .from('conversations')
                .update({ title, updated_at: new Date().toISOString() })
                .eq('id', conversationId);

            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, title, updated_at: new Date().toISOString() } : c
            ));
        }
    };

    const renameConversation = async (id: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        await supabase.from('conversations').update({ title: newTitle.trim() }).eq('id', id);
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle.trim() } : c));
    };

    const deleteConversation = async (id: string) => {
        await supabase.from('conversations').delete().eq('id', id);
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConversationId === id) handleNewChat();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const handleEditMessage = async (id: string, newContent: string) => {
        logger.debug('[handleEditMessage] Triggered', { messageId: id, contentSnippet: newContent.slice(0, 50) });

        // 1. Find the index of the message being edited
        const index = messages.findIndex(m => m.id === id);
        if (index === -1) return;

        // 2. Truncate messages to this point
        const updatedMessages = messages.slice(0, index + 1);

        // 3. Update the edited message content
        updatedMessages[index] = {
            ...updatedMessages[index],
            content: newContent
        };

        // 4. Update internal state
        setMessages(updatedMessages);

        // 5. Cleanup database (delete all messages AFTER this one in the same conversation)
        if (currentConversationId && userId) {
            // Get all message IDs that come after this one in the local state
            // (Note: we delete all messages with created_at > edited_message.created_at or similar)
            // But since we use IDs, let's just delete anything from the DB that isn't in our new state
            const remainingIds = updatedMessages.map(m => m.id);

            logger.debug('[handleEditMessage] Cleaning up DB', { conversationId: currentConversationId });

            const { error: deleteError } = await supabase
                .from('messages')
                .delete()
                .eq('conversation_id', currentConversationId)
                .not('id', 'in', `(${remainingIds.join(',')})`);

            if (deleteError) {
                logger.error('[handleEditMessage] DB Cleanup Error:', deleteError);
            }

            // Also update the content of the edited message in DB
            const { error: updateError } = await supabase
                .from('messages')
                .update({ content: newContent })
                .eq('id', id);

            if (updateError) {
                logger.error('[handleEditMessage] DB Update Error:', updateError);
            }
        }

        // 6. Trigger re-generation
        // We use reload() from useChat, but we need to make sure the state is updated first
        // reload() usually uses the current messages state
        setTimeout(() => {
            // append usually sends the last user message, but reload() re-runs the last request
            // If the last message is now a user message (which it should be after truncation), reload() works.
            // If it's an assistant message for some reason, we might need a different approach.
            // But editing is only allowed for user messages.
            reload();
        }, 100);
    };

    // =========================================================================
    // Event Handlers
    // =========================================================================

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        logger.debug('[onSubmit] Triggered', { input: input.trim(), hasImage: !!selectedImage });

        if (!input.trim() && !selectedImage) {
            logger.debug('[onSubmit] Empty submission ignored');
            return;
        }

        logger.debug('[onSubmit] Start', { currentConversationId, userId, refValue: conversationIdRef.current });

        let convId = currentConversationId;
        if (!convId && userId) {
            logger.debug('[onSubmit] Creating new conversation for user', { userId });
            convId = await createNewConversation();
            logger.debug('[onSubmit] Created conversation', { convId });
            if (convId) {
                setCurrentConversationId(convId);
                conversationIdRef.current = convId;
            }
        }

        // SAVE USER MESSAGE IMMEDIATELY for authenticated users
        if (convId && userId) {
            logger.debug('[onSubmit] Saving user message to DB for conv:', { convId });
            const { error: saveError } = await supabase.from('messages').insert({
                id: crypto.randomUUID(),
                conversation_id: convId,
                role: 'user',
                content: input.trim() || "[Attached Image]",
                tool_calls: selectedImage ? { image_attached: true, image_url: selectedImage.slice(0, 50) + '...' } : null,
                experimental_attachments: selectedFile ? [{
                    name: selectedFile.name,
                    type: selectedFile.type,
                    url: selectedImage,
                }] : null
            });
            if (saveError) logger.error('[onSubmit] DB Save Error:', saveError);
        }

        logger.debug('[onSubmit] Preparing options', { hasImage: !!selectedImage, urlLength: selectedImage?.length });

        const options = selectedFile && selectedImage ? {
            experimental_attachments: [{
                name: selectedFile.name,
                contentType: selectedFile.type,
                url: selectedImage,
            }]
        } : {};

        logger.debug('[onSubmit] Calling handleSubmit', { attachmentCount: options.experimental_attachments?.length || 0 });

        try {
            handleSubmit(e, {
                ...options,
                allowEmptySubmit: true,
            });
            logger.debug('[onSubmit] handleSubmit called successfully');
        } catch (err) {
            logger.error('[onSubmit] handleSubmit CRASHED:', err);
        }

        // Reset image
        setSelectedImage(null);
        setSelectedFile(null);
    };



    // =========================================================================
    // Render
    // =========================================================================

    return (
        <div className="flex h-screen bg-[#0a0b0d] text-[#e5e7eb] font-sans selection:bg-emerald-500/30">
            {/* Error Toast */}
            {errorMessage && (
                <ErrorToast
                    message={errorMessage}
                    onDismiss={() => setErrorMessage(null)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                conversations={conversations}
                currentConversationId={currentConversationId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoadingConversations}
                onNewChat={handleNewChat}
                onLoadConversation={loadConversation}
                onRename={renameConversation}
                onDelete={deleteConversation}
                onLogout={handleLogout}
                userId={userId}
                userName={userName}
                userEmail={userEmail}
                radarData={radarData}
            />

            {/* Main Canvas */}
            <main className="flex-1 flex flex-col relative min-w-0">

                {/* Mobile Sidebar Toggle - Always reachable */}
                {!showSidebar && (
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="fixed top-4 left-4 z-40 p-3 text-gray-400 hover:text-[#22c55e] bg-[#12141a]/90 backdrop-blur-md border border-[#2a2d34] rounded-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center pt-[calc(0.75rem+env(safe-area-inset-top))]"
                        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
                    >
                        <PanelLeftOpen size={24} />
                    </button>
                )}

                {/* Chat Scroll Area */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-4xl mx-auto px-4 w-full h-full flex flex-col">

                        {/* Empty State / Welcome */}
                        {messages.length === 0 ? (
                            <WelcomeScreen
                                userName={userName}
                                onQuickLog={(text) => setInput(text)}
                            />
                        ) : (
                            <div className="pt-20 pb-40 space-y-8">
                                {messages.map((m) => (
                                    <ChatMessage
                                        key={m.id}
                                        message={m}
                                        userId={userId}
                                        onEdit={handleEditMessage}
                                    />
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
                <ChatInput
                    input={input}
                    onInputChange={handleInputChange}
                    onSubmit={onSubmit}
                    onFileSelect={handleFileSelect}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    onBarcodeScan={handleBarcodeScan}
                    showSidebar={showSidebar}
                    setInput={setInput}
                    isLoading={isLoading}
                    onStop={stop}
                />

                <PWAInstallPrompt />

            </main>
        </div>
    );
}
