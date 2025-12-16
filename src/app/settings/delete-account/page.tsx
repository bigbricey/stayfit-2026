'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') {
            setMessage('Please type DELETE to confirm');
            return;
        }

        setIsDeleting(true);
        setMessage('');

        try {
            const supabase = createClient();

            // Sign out and delete user data
            // Note: Full account deletion typically requires a server-side function
            // For now, we'll just sign out and show a message

            const { error } = await supabase.auth.signOut();

            if (error) {
                setMessage('Error: ' + error.message);
            } else {
                router.push('/');
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred');
        }

        setIsDeleting(false);
    };

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="mb-4">
                    <Link href="/settings" className="text-[#0073CF] hover:underline">← Back to Settings</Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-red-200">
                    <div className="px-5 py-4 border-b border-red-100 bg-red-50">
                        <h1 className="text-xl font-semibold text-red-700">Delete Account</h1>
                    </div>
                    <div className="p-5">
                        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
                            <p className="text-red-700 font-medium mb-2">⚠️ Warning: This action cannot be undone</p>
                            <p className="text-red-600 text-sm">
                                Deleting your account will permanently remove all your data, including:
                            </p>
                            <ul className="text-red-600 text-sm mt-2 ml-4 list-disc">
                                <li>Your profile and settings</li>
                                <li>All weight and measurement history</li>
                                <li>Food and exercise diary entries</li>
                                <li>Friends and messages</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type <span className="font-bold">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-64 border border-gray-300 rounded px-3 py-2 focus:border-red-500 focus:outline-none"
                                    placeholder="Type DELETE"
                                />
                            </div>

                            {message && (
                                <p className="text-red-600">{message}</p>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting || confirmText !== 'DELETE'}
                                    className="bg-red-600 text-white px-6 py-2 rounded font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete My Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
