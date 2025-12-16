'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProfileSettings from '@/components/ProfileSettings';

const settingsCategories = [
    { id: 'account', label: 'Account Settings' },
    { id: 'profile', label: 'My Profile Settings' },
    { id: 'privacy', label: 'My Profile Privacy' },
    { id: 'password', label: 'Change Password' },
    { id: 'email', label: 'Change Email Address' },
    { id: 'username', label: 'Change Username' },
    { id: 'diary', label: 'Diary Settings' },
    { id: 'food', label: 'Food Settings' },
    { id: 'exercise', label: 'Exercise Settings' },
    { id: 'sharing', label: 'Sharing & Privacy' },
    { id: 'notifications', label: 'Notification Settings' },
    { id: 'apps', label: 'Application Settings' },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('account');
    const [weightUnit, setWeightUnit] = useState('lbs');
    const [heightUnit, setHeightUnit] = useState('ft/in');
    const [distanceUnit, setDistanceUnit] = useState('miles');
    const [dateFormat, setDateFormat] = useState('mm/dd/yyyy');
    const [timezone, setTimezone] = useState('America/New_York');
    const [language, setLanguage] = useState('en');

    // User data from Supabase
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserEmail(user.email || null);
                setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
            }
            setIsLoading(false);
        }
        loadUser();
    }, []);

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="w-56 flex-shrink-0">
                        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {settingsCategories.map((cat, idx) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveSection(cat.id)}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${idx < settingsCategories.length - 1 ? 'border-b border-gray-100' : ''
                                        } ${activeSection === cat.id
                                            ? 'bg-[#E8F4FC] text-[#0073CF] font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                            <div className="border-t border-gray-200">
                                <Link
                                    href="/settings/delete-account"
                                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Delete Account
                                </Link>
                            </div>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {/* Account Settings */}
                            {activeSection === 'account' && (
                                <>
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <h2 className="text-lg font-semibold text-gray-800">Account Settings</h2>
                                    </div>
                                    <div className="p-5 space-y-6">
                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-600">{isLoading ? 'Loading...' : (userEmail || 'Not set')}</span>
                                                <Link href="/settings/change-email" className="text-[#0073CF] text-sm hover:underline">Change</Link>
                                            </div>
                                        </div>

                                        {/* Username */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-600">{isLoading ? 'Loading...' : (displayName || 'Not set')}</span>
                                                <Link href="/settings/change-username" className="text-[#0073CF] text-sm hover:underline">Change</Link>
                                            </div>
                                        </div>

                                        {/* Units */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                                                <select
                                                    value={weightUnit}
                                                    onChange={(e) => setWeightUnit(e.target.value)}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                                                >
                                                    <option value="lbs">Pounds (lbs)</option>
                                                    <option value="kg">Kilograms (kg)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                                                <select
                                                    value={heightUnit}
                                                    onChange={(e) => setHeightUnit(e.target.value)}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                                                >
                                                    <option value="ft/in">Feet/Inches</option>
                                                    <option value="cm">Centimeters</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                                                <select
                                                    value={distanceUnit}
                                                    onChange={(e) => setDistanceUnit(e.target.value)}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                                                >
                                                    <option value="miles">Miles</option>
                                                    <option value="km">Kilometers</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Date Format */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                                            <select
                                                value={dateFormat}
                                                onChange={(e) => setDateFormat(e.target.value)}
                                                className="w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                                            >
                                                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                            </select>
                                        </div>

                                        {/* Timezone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                                            <select
                                                value={timezone}
                                                onChange={(e) => setTimezone(e.target.value)}
                                                className="w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                                            >
                                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                                <option value="America/Chicago">Central Time (US & Canada)</option>
                                                <option value="America/Denver">Mountain Time (US & Canada)</option>
                                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                                <option value="UTC">UTC</option>
                                            </select>
                                        </div>

                                        {/* Language */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="de">Deutsch</option>
                                            </select>
                                        </div>

                                        {/* Save Button */}
                                        <div className="pt-4">
                                            <button className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors">
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Profile Settings */}
                            {activeSection === 'profile' && (
                                <ProfileSettings
                                    displayName={displayName}
                                    userEmail={userEmail}
                                />
                            )}

                            {/* Privacy Settings */}
                            {activeSection === 'privacy' && (
                                <>
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <h2 className="text-lg font-semibold text-gray-800">My Profile Privacy</h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        {[
                                            { label: 'Make my profile public', desc: 'Allow others to view your profile' },
                                            { label: 'Show my diary to friends', desc: 'Let friends see your food diary' },
                                            { label: 'Allow friend requests', desc: 'Let users send you friend requests' },
                                            { label: 'Show in member search', desc: 'Appear in community member searches' },
                                        ].map((setting, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100">
                                                <div>
                                                    <div className="font-medium text-gray-700">{setting.label}</div>
                                                    <div className="text-sm text-gray-500">{setting.desc}</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0073CF]"></div>
                                                </label>
                                            </div>
                                        ))}
                                        <div className="pt-4">
                                            <button className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors">
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Notification Settings */}
                            {activeSection === 'notifications' && (
                                <>
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <h2 className="text-lg font-semibold text-gray-800">Notification Settings</h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        {[
                                            { label: 'Email notifications', desc: 'Receive emails for important updates' },
                                            { label: 'Friend requests', desc: 'Notify when someone adds you' },
                                            { label: 'Messages', desc: 'Notify when you receive a message' },
                                            { label: 'Community activity', desc: 'Updates from groups and forums' },
                                            { label: 'Weekly progress report', desc: 'Summary of your weekly stats' },
                                            { label: 'Reminders to log', desc: 'Daily reminders to log food/exercise' },
                                        ].map((setting, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100">
                                                <div>
                                                    <div className="font-medium text-gray-700">{setting.label}</div>
                                                    <div className="text-sm text-gray-500">{setting.desc}</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0073CF]"></div>
                                                </label>
                                            </div>
                                        ))}
                                        <div className="pt-4">
                                            <button className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors">
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Change Password */}
                            {activeSection === 'password' && (
                                <>
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                            <input type="password" className="w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <input type="password" className="w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                            <input type="password" className="w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0073CF] focus:outline-none" />
                                        </div>
                                        <div className="pt-4">
                                            <button className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors">
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Other sections - placeholder */}
                            {!['account', 'profile', 'privacy', 'notifications', 'password'].includes(activeSection) && (
                                <>
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            {settingsCategories.find(c => c.id === activeSection)?.label}
                                        </h2>
                                    </div>
                                    <div className="p-5 text-gray-500">
                                        Settings for this section coming soon.
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
