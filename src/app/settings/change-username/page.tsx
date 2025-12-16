'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChangeUsernamePage() {
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUsername(user.user_metadata?.full_name || user.email?.split('@')[0] || null);
            }
            setIsLoading(false);
        }
        loadUser();
    }, []);

    const checkAvailability = async () => {
        if (!newUsername || newUsername.length < 3) {
            setMessage('Username must be at least 3 characters');
            return;
        }

        setIsChecking(true);
        setMessage('');

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .select('display_name')
                .ilike('display_name', newUsername)
                .limit(1);

            if (error) {
                setMessage('Error checking availability');
                setUsernameStatus('idle');
            } else if (data && data.length > 0 && data[0].display_name?.toLowerCase() !== currentUsername?.toLowerCase()) {
                setUsernameStatus('taken');
            } else {
                setUsernameStatus('available');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error checking availability');
        }

        setIsChecking(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (usernameStatus !== 'available') {
            setMessage('Please check username availability first');
            return;
        }

        setIsSaving(true);
        setMessage('');

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setMessage('Not logged in');
                setIsSaving(false);
                return;
            }

            // Update profile in database
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    display_name: newUsername,
                    email: user.email,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Supabase error:', error);
                setMessage(`Error: ${error.message || 'Could not update. Database may not be set up.'}`);
            } else {
                setMessage('Username updated successfully!');
                setCurrentUsername(newUsername);
                setNewUsername('');
                setUsernameStatus('idle');
            }
        } catch (err) {
            console.error(err);
            setMessage('An unexpected error occurred');
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
                        <h1 className="text-xl font-semibold text-gray-800">Change Username</h1>
                    </div>
                    <div className="p-5">
                        {isLoading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Username</label>
                                    <div className="text-gray-600">{currentUsername}</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Username</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => {
                                                setNewUsername(e.target.value);
                                                setUsernameStatus('idle');
                                            }}
                                            className="w-64 border border-gray-300 rounded px-3 py-2 focus:border-[#0073CF] focus:outline-none"
                                            placeholder="Enter new username"
                                        />
                                        <button
                                            type="button"
                                            onClick={checkAvailability}
                                            disabled={isChecking}
                                            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            {isChecking ? 'Checking...' : 'Check Availability'}
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        {usernameStatus === 'available' && (
                                            <span className="text-green-600 flex items-center gap-1">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Username is available!
                                            </span>
                                        )}
                                        {usernameStatus === 'taken' && (
                                            <span className="text-red-600 flex items-center gap-1">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Username is already taken
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {message && (
                                    <p className={message.includes('success') ? 'text-green-600' : 'text-red-600'}>
                                        {message}
                                    </p>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving || usernameStatus !== 'available'}
                                        className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Updating...' : 'Update Username'}
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
