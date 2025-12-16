'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProfileSettingsProps {
    displayName: string | null;
    userEmail: string | null;
}

export default function ProfileSettings({ displayName, userEmail }: ProfileSettingsProps) {
    const [username, setUsername] = useState(displayName || '');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const checkUsernameAvailability = async () => {
        if (!username || username.length < 3) {
            alert('Username must be at least 3 characters');
            return;
        }

        setUsernameStatus('checking');

        try {
            const supabase = createClient();

            // Check if username exists in profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('display_name')
                .ilike('display_name', username)
                .limit(1);

            if (error) {
                console.error('Error checking username:', error);
                setUsernameStatus('idle');
                return;
            }

            // If current user's name matches, it's their own - still available
            if (data && data.length > 0 && data[0].display_name?.toLowerCase() !== displayName?.toLowerCase()) {
                setUsernameStatus('taken');
            } else {
                setUsernameStatus('available');
            }
        } catch (err) {
            console.error('Error:', err);
            setUsernameStatus('idle');
        }
    };

    const handleSave = async () => {
        if (usernameStatus === 'taken') {
            alert('Please choose a different username');
            return;
        }

        setIsSaving(true);
        setSaveMessage('');

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setSaveMessage('Error: Not logged in');
                setIsSaving(false);
                return;
            }

            // Update profile in database
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    display_name: username,
                    email: userEmail,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Error saving profile:', error);
                setSaveMessage('Error saving changes');
            } else {
                setSaveMessage('Changes saved successfully!');
                setUsernameStatus('idle');
            }
        } catch (err) {
            console.error('Error:', err);
            setSaveMessage('Error saving changes');
        }

        setIsSaving(false);
    };

    return (
        <>
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">My Profile Settings</h2>
            </div>
            <div className="p-5 space-y-6">
                {/* Username with availability check */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username / Display Name</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setUsernameStatus('idle');
                            }}
                            className="w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                        />
                        <button
                            onClick={checkUsernameAvailability}
                            disabled={usernameStatus === 'checking'}
                            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            {usernameStatus === 'checking' ? 'Checking...' : 'Check Availability'}
                        </button>
                        {usernameStatus === 'available' && (
                            <span className="text-green-600 flex items-center gap-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Available!
                            </span>
                        )}
                        {usernameStatus === 'taken' && (
                            <span className="text-red-600 flex items-center gap-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Taken
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This is how you&apos;ll appear to other members</p>
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                        placeholder="Tell us about yourself..."
                    ></textarea>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        className="w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                    />
                </div>

                {/* Save Button */}
                <div className="pt-4 flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || usernameStatus === 'taken'}
                        className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    {saveMessage && (
                        <span className={saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}>
                            {saveMessage}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
}
