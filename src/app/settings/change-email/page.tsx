'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChangeEmailPage() {
    const [currentEmail, setCurrentEmail] = useState<string | null>(null);
    const [newEmail, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentEmail(user.email || null);
            }
            setIsLoading(false);
        }
        loadUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newEmail) {
            setMessage('Please enter a new email address');
            return;
        }

        setIsSaving(true);
        setMessage('');

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.updateUser({
                email: newEmail
            });

            if (error) {
                setMessage(error.message);
            } else {
                setMessage('Check your new email for a confirmation link!');
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred');
        }

        setIsSaving(false);
    };

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="mb-4">
                    <Link href="/settings" className="text-[#0073CF] hover:underline">← Back to Settings</Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h1 className="text-xl font-semibold text-gray-800">Change Email Address</h1>
                    </div>
                    <div className="p-5">
                        {isLoading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Email</label>
                                    <div className="text-gray-600">{currentEmail}</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Email Address</label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full max-w-md border border-gray-300 rounded px-3 py-2 focus:border-[#0073CF] focus:outline-none"
                                        placeholder="Enter new email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full max-w-md border border-gray-300 rounded px-3 py-2 focus:border-[#0073CF] focus:outline-none"
                                        placeholder="Confirm your password"
                                    />
                                </div>

                                {message && (
                                    <p className={message.includes('Check') ? 'text-green-600' : 'text-red-600'}>
                                        {message}
                                    </p>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Updating...' : 'Update Email'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
