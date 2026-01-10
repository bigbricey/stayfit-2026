'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    MessageSquare,
    Settings,
    Search,
    PanelLeftClose,
    LogOut,
    MoreVertical,
    Trash2,
    Pencil,
    ShieldCheck,
    X
} from 'lucide-react';
import { isAdmin } from '@/lib/config';

// Types
interface Conversation {
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
}

interface SidebarProps {
    showSidebar: boolean;
    setShowSidebar: (show: boolean) => void;
    conversations: Conversation[];
    currentConversationId: string | null;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    isLoading: boolean;
    onNewChat: () => void;
    onLoadConversation: (id: string) => void;
    onRename: (id: string, title: string) => void;
    onDelete: (id: string) => void;
    onLogout: () => void;
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
}

export default function Sidebar({
    showSidebar,
    setShowSidebar,
    conversations,
    currentConversationId,
    searchQuery,
    setSearchQuery,
    isLoading,
    onNewChat,
    onLoadConversation,
    onRename,
    onDelete,
    onLogout,
    userId,
    userName,
    userEmail
}: SidebarProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingConversation, setEditingConversation] = useState<{ id: string; title: string } | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Group conversations by time
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

    const handleRename = (id: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        onRename(id, newTitle.trim());
        setEditingConversation(null);
        setOpenMenuId(null);
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(id);
        setOpenMenuId(null);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            onDelete(confirmDeleteId);
            setConfirmDeleteId(null);
        }
    };

    return (
        <>
            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
                    <div className="bg-[#1a1d24] border border-[#2a2d34] rounded-xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-2">Delete Conversation?</h3>
                        <p className="text-gray-400 text-sm mb-6">This action cannot be undone. All messages in this conversation will be permanently deleted.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-[#22262f] transition-colors">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Backdrop - closes dropdown when clicking outside */}
            {openMenuId && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
            )}

            {/* Backdrop for mobile */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            <aside className={`
                fixed md:relative inset-y-0 left-0 z-50
                bg-[#12141a] flex-shrink-0 transition-transform duration-300 ease-in-out flex flex-col
                border-r border-[#2a2d34]
                ${showSidebar ? 'translate-x-0 w-[300px]' : '-translate-x-full w-[300px] md:w-0 md:hidden'} 
                pb-[env(safe-area-inset-bottom)]
            `}>
                {/* Header with Close Toggle */}
                <div className="p-4 flex items-center justify-between pt-[env(safe-area-inset-top)] md:pt-4">
                    <button
                        onClick={() => setShowSidebar(false)}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1d24]"
                    >
                        <PanelLeftClose size={20} />
                    </button>
                    <div onClick={onNewChat} className="cursor-pointer hover:bg-[#1a1d24] p-2 rounded-lg text-gray-400 hover:text-white">
                        <MessageSquare size={20} />
                    </div>
                </div>

                {/* New Chat Button Large */}
                <div className="px-4 pb-2">
                    <button
                        onClick={onNewChat}
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
                            className="w-full bg-transparent border-none text-gray-200 placeholder-gray-500 pl-10 pr-10 focus:ring-0 focus:outline-none text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-2 py-2">
                    {isLoading ? (
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
                                                    onBlur={() => handleRename(conv.id, editingConversation.title)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleRename(conv.id, editingConversation.title);
                                                        if (e.key === 'Escape') setEditingConversation(null);
                                                    }}
                                                    className="flex-1 bg-[#22262f] text-gray-200 text-sm px-3 py-2 rounded-lg border border-[#22c55e] focus:outline-none"
                                                />
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => onLoadConversation(conv.id)}
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
                                                        onClick={() => handleDelete(conv.id)}
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
                    {/* VIP Admin Link - Only for admins */}
                    {userId && isAdmin(userEmail) && (
                        <Link href="/admin" className="flex items-center gap-3 text-emerald-500 hover:text-emerald-400 px-2 py-2 rounded-lg hover:bg-[#1a1d24] transition-colors text-sm group">
                            <ShieldCheck size={18} className="group-hover:animate-pulse" />
                            <span>VIP Admin Dashboard</span>
                        </Link>
                    )}
                    <button onClick={onLogout} className="w-full flex items-center gap-3 text-gray-400 hover:text-white px-2 py-2 rounded-lg hover:bg-[#1a1d24] hover:text-red-400 transition-colors text-sm">
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                    <div className="flex flex-col gap-1 border-t border-gray-800 mt-2 pt-4 px-2">
                        <div className="flex items-center gap-3 text-gray-400 py-1 text-sm">
                            <div className={`w-2 h-2 rounded-full ${userId ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <span className="truncate">{userId ? (userName || 'User') : 'Guest Mode (Not Saving)'}</span>
                        </div>
                        {!userId && (
                            <Link href="/login" className="text-xs text-[#22c55e] hover:underline ml-5">
                                Sign in to sync your history
                            </Link>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
