'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const DIET_MODES = ['standard', 'vegan', 'keto', 'carnivore', 'paleo', 'mediterranean', 'fruitarian', 'modified_keto'];

const SAFETY_FLAGS = [
    { key: 'warn_seed_oils', label: 'Warn about Seed Oils (Linoleic Acid)', description: 'Alert when foods contain soybean, canola, or corn oil.' },
    { key: 'warn_sugar', label: 'Warn about Added Sugars', description: 'Alert when foods contain sucrose, HFCS, or maltodextrin.' },
    { key: 'warn_gluten', label: 'Warn about Gluten', description: 'Alert when foods contain wheat, barley, or rye.' },
];

const COACH_MODES = [
    { mode: 'hypertrophy', label: 'Mass Architect', desc: 'Focus on muscle growth & progressive overload' },
    { mode: 'fat_loss', label: 'Recomp Specialist', desc: 'Focus on fat usage & muscle preservation' },
    { mode: 'longevity', label: 'Healthspan', desc: 'Focus on inflammation, vitality & blood markers' },
];

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [dietMode, setDietMode] = useState('standard');
    const [activeCoach, setActiveCoach] = useState('fat_loss');
    const [safetyFlags, setSafetyFlags] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Password Reset State
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            loadProfile(user);
        } else {
            // DEMO MODE: Load from LocalStorage
            const saved = localStorage.getItem('stayfit_demo_config');
            if (saved) {
                const config = JSON.parse(saved);
                setDietMode(config.diet_mode || 'standard');
                setActiveCoach(config.active_coach || 'fat_loss');
                setSafetyFlags(config.safety_flags || {});
            }
            setLoading(false);
        }
    };

    const loadProfile = async (currentUser: any) => {
        const { data } = await supabase
            .from('users_secure')
            .select('diet_mode, active_coach, safety_flags')
            .eq('id', currentUser.id)
            .single();
        if (data) {
            setDietMode(data.diet_mode || 'standard');
            setActiveCoach(data.active_coach || 'fat_loss');
            setSafetyFlags(data.safety_flags || {});
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const updates = {
            diet_mode: dietMode,
            active_coach: activeCoach,
            safety_flags: safetyFlags,
        };

        if (user) {
            const { error } = await supabase
                .from('users_secure')
                .upsert({ id: user.id, ...updates });
            if (error) alert('Error saving settings');
            else alert('Settings saved successfully');
        } else {
            // DEMO MODE: Save to LocalStorage
            localStorage.setItem('stayfit_demo_config', JSON.stringify(updates));
            alert('Settings saved (Demo Mode)');
        }
        setSaving(false);
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }
        setPasswordLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            alert(`Error updating password: ${error.message}`);
        } else {
            alert("✅ Password updated successfully!");
            setNewPassword('');
        }
        setPasswordLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-gray-400 animate-pulse">Loading Settings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">⚙️ Settings</h1>
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                        ← Back to Chat
                    </Link>
                </div>

                {/* Coach Persona (Specialist) */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Coach Specialist</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {COACH_MODES.map((coach) => (
                                <button
                                    key={coach.mode}
                                    onClick={() => setActiveCoach(coach.mode)}
                                    className={`p-4 rounded-xl text-left transition-all border ${activeCoach === coach.mode
                                        ? 'bg-blue-600/20 border-blue-500 text-white'
                                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="font-bold">{coach.label}</div>
                                    <div className="text-xs text-gray-400 mt-1 leading-tight">{coach.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Diet Mode */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Diet Mode</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        This adjusts how the AI analyzes your food. It won't judge you—it just optimizes for your framework.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {DIET_MODES.map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setDietMode(mode)}
                                className={`px-4 py-3 rounded-xl capitalize transition-all ${dietMode === mode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Safety Flags (Truth Watchdog) */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-2">🛡️ Truth Watchdog</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Opt-in to automatic chemical alerts based on metabolic science.
                    </p>
                    <div className="space-y-4">
                        {SAFETY_FLAGS.map((flag) => (
                            <div key={flag.key} className="flex items-start gap-4 bg-gray-950 p-4 rounded-xl">
                                <button
                                    onClick={() => setSafetyFlags({
                                        ...safetyFlags,
                                        [flag.key]: !safetyFlags?.[flag.key],
                                    })}
                                    className={`w-12 h-7 rounded-full transition-all flex items-center ${safetyFlags?.[flag.key]
                                        ? 'bg-emerald-600 justify-end'
                                        : 'bg-gray-700 justify-start'
                                        }`}
                                >
                                    <div className="w-5 h-5 bg-white rounded-full m-1 shadow"></div>
                                </button>
                                <div>
                                    <div className="font-medium">{flag.label}</div>
                                    <div className="text-gray-500 text-sm">{flag.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Account Security (Password Reset) */}
            <div className="max-w-2xl mx-auto space-y-8 mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">🔐 Account Security</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                onClick={handleUpdatePassword}
                                disabled={passwordLoading || !newPassword}
                                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {passwordLoading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                            If you just reset your password via email, enter your new desired password here to finalize the change.
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="max-w-2xl mx-auto mt-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>

    );
}
