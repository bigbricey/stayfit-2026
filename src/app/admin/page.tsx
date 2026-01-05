'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, UserX, Search, ArrowLeft, Loader2, Trash2, Clock } from 'lucide-react';

const ADMIN_EMAIL = 'bigbricey@gmail.com'; // Hardcoded for privacy

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.push('/');
                return;
            }
            setCurrentUser(user);
            await loadUsers();
        };
        checkAdmin();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        // We fetch from RPC to get emails securely
        const { data, error } = await supabase.rpc('get_users_with_emails');

        if (error) {
            console.error('Error loading users:', error);
            // Fallback if RPC fails (e.g. if permissions aren't ready)
            const { data: fallbackData } = await supabase.from('users_secure').select('*');
            setUsers(fallbackData || []);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const toggleApproval = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('users_secure')
            .update({ is_approved: !currentStatus })
            .eq('id', userId);

        if (error) {
            alert('Error updating user: ' + error.message);
        } else {
            loadUsers();
        }
    };

    const deleteUser = async (userId: string, name: string) => {
        if (!confirm(`Are you absolutely sure you want to delete ${name || 'this user'}? This will remove them from the database.`)) return;

        const { error } = await supabase
            .from('users_secure')
            .delete()
            .eq('id', userId);

        if (error) {
            alert('Error deleting user: ' + error.message);
        } else {
            loadUsers();
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Note: In Supabase, creating an auth user manually via client is restricted.
        // We can however add a placeholder invite or just a record in users_secure if we want them to "pre-approve"
        // But for a real "Add User", they should sign up.
        // If the user wants to "Add" them, we'll just insert a record or we can use the bypass.
        // Let's assume "Add" means pre-approving an ID.

        alert("To add a new user, they should sign up at /login. You can then approve them here. Or, if they are already signed up but not showing, search by their ID.");
        setIsAddingUser(false);
        setLoading(false);
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && !users.length) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ShieldCheck className="text-emerald-500" />
                            Admin Console
                        </h1>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                        <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total</div>
                        <div className="text-3xl font-bold mt-1 text-white">{users.length}</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                        <div className="text-emerald-500 text-sm font-medium uppercase tracking-wider">Approved</div>
                        <div className="text-3xl font-bold mt-1">{users.filter(u => u.is_approved).length}</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                        <div className="text-yellow-500 text-sm font-medium uppercase tracking-wider">Pending</div>
                        <div className="text-3xl font-bold mt-1">{users.filter(u => !u.is_approved).length}</div>
                    </div>
                    <button
                        onClick={() => setIsAddingUser(!isAddingUser)}
                        className="bg-emerald-600 hover:bg-emerald-500 p-6 rounded-2xl text-white font-bold transition-all text-center flex flex-col justify-center items-center gap-1"
                    >
                        <UserCheck size={20} />
                        <span>Add VIP</span>
                    </button>
                </div>

                {isAddingUser && (
                    <div className="bg-gray-900 border-2 border-emerald-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-lg font-bold mb-4">Add or Pre-Approve User</h3>
                        <p className="text-sm text-gray-400 mb-4">Ideally, the user joins via the signup page. This console is for managing them once they exist.</p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="User Name (Optional)"
                                className="flex-1 bg-black border border-gray-800 rounded-lg px-4 py-2"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                            />
                            <button
                                onClick={handleAddUser}
                                className="bg-emerald-600 px-6 py-2 rounded-lg font-bold"
                            >
                                Send Invitation
                            </button>
                            <button onClick={() => setIsAddingUser(false)} className="text-gray-500">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Search & Actions */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Users List */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-950/50 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-200">{user.name || 'Anonymous User'}</div>
                                            <div className="text-sm text-blue-400 font-medium">{user.email || 'No Email Found'}</div>
                                            <div className="text-[10px] text-gray-600 font-mono mt-1 uppercase tracking-tighter opacity-50">{user.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_approved ? (
                                                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Approved</span>
                                            ) : (
                                                <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest px-2 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => toggleApproval(user.id, !!user.is_approved)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${user.is_approved
                                                    ? 'bg-gray-800 text-gray-400 hover:text-white'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-900/20'
                                                    }`}
                                            >
                                                {user.is_approved ? 'Revoke' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id, user.name)}
                                                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-900/40 text-red-500 hover:bg-red-900/60 border border-red-500/20 transition-all hover:scale-105"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
