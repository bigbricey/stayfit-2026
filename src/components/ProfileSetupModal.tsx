'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileSetupModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileSetupModal({ userId, isOpen, onClose }: ProfileSetupModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        startWeight: '',
        goalWeight: '',
        heightFeet: '5',
        heightInches: '8',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();
        await supabase.from('profiles').update({
            start_weight: parseFloat(formData.startWeight),
            current_weight: parseFloat(formData.startWeight),
            goal_weight: parseFloat(formData.goalWeight),
            height_feet: parseInt(formData.heightFeet),
            height_inches: parseInt(formData.heightInches),
        }).eq('id', userId);

        setLoading(false);
        onClose();
        router.refresh();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-white mb-2">👋 Welcome!</h2>
                <p className="text-slate-400 mb-6">Let&apos;s set up your fitness goals.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Current Weight (lbs)</label>
                        <input
                            type="number"
                            required
                            value={formData.startWeight}
                            onChange={(e) => setFormData({ ...formData, startWeight: e.target.value })}
                            placeholder="e.g., 200"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Goal Weight (lbs)</label>
                        <input
                            type="number"
                            required
                            value={formData.goalWeight}
                            onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                            placeholder="e.g., 160"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Height</label>
                        <div className="flex gap-2">
                            <select
                                value={formData.heightFeet}
                                onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                            >
                                {[4, 5, 6, 7].map(ft => (
                                    <option key={ft} value={ft}>{ft} ft</option>
                                ))}
                            </select>
                            <select
                                value={formData.heightInches}
                                onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inches => (
                                    <option key={inches} value={inches}>{inches} in</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3 rounded-xl mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Start My Journey 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
}
