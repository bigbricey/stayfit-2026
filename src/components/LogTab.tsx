'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface LogTabProps {
    userId: string;
    weightEntries: Array<{ id?: string; date: string; weight: number; notes?: string }>;
    mealsToday: Array<{ id?: string; meal_type: string; description?: string; calories?: number }>;
}

export default function LogTab({ userId, weightEntries, mealsToday }: LogTabProps) {
    const router = useRouter();
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [mealDesc, setMealDesc] = useState('');
    const [calories, setCalories] = useState('');
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const todayEntries = weightEntries.filter(e => e.date === today);

    const handleLogWeight = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight) return;
        setLoading(true);

        const supabase = createClient();
        await supabase.from('weight_entries').insert({
            user_id: userId,
            weight: parseFloat(weight),
            date: today,
            notes: notes || null,
        });

        await supabase.from('profiles').update({
            current_weight: parseFloat(weight),
        }).eq('id', userId);

        setWeight('');
        setNotes('');
        setLoading(false);
        router.refresh();
    };

    const handleLogMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mealDesc) return;
        setLoading(true);

        const supabase = createClient();
        await supabase.from('meals').insert({
            user_id: userId,
            date: today,
            meal_type: mealType,
            description: mealDesc,
            calories: calories ? parseInt(calories) : null,
        });

        setMealDesc('');
        setCalories('');
        setLoading(false);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* Log Weight Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">📊 Log Weight</h3>
                <form onSubmit={handleLogWeight} className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Weight (lbs)"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        />
                        <button
                            type="submit"
                            disabled={loading || !weight}
                            className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                        >
                            Log
                        </button>
                    </div>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes (optional)"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                </form>
            </div>

            {/* Log Meal Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">🍽️ Log Meal</h3>
                <form onSubmit={handleLogMeal} className="space-y-3">
                    <div className="flex gap-2">
                        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setMealType(t)}
                                className={`px-3 py-1 rounded-lg text-sm capitalize ${mealType === t ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={mealDesc}
                        onChange={(e) => setMealDesc(e.target.value)}
                        placeholder="What did you eat?"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            placeholder="Calories (optional)"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        />
                        <button
                            type="submit"
                            disabled={loading || !mealDesc}
                            className="bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>

            {/* Today's Log */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">📅 Today&apos;s Log</h3>

                {todayEntries.length > 0 && (
                    <div className="mb-4">
                        <div className="text-sm text-slate-400 mb-2">Weight Entries</div>
                        {todayEntries.map((e, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                                <span className="text-white font-medium">{e.weight} lbs</span>
                                {e.notes && <span className="text-slate-400 text-sm">{e.notes}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {mealsToday.length > 0 && (
                    <div>
                        <div className="text-sm text-slate-400 mb-2">Meals</div>
                        {mealsToday.map((m, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                                <div>
                                    <span className="text-orange-400 capitalize text-sm">{m.meal_type}</span>
                                    <span className="text-white ml-2">{m.description}</span>
                                </div>
                                {m.calories && <span className="text-slate-400">{m.calories} cal</span>}
                            </div>
                        ))}
                    </div>
                )}

                {todayEntries.length === 0 && mealsToday.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No entries yet today. Start logging above!</p>
                )}
            </div>
        </div>
    );
}
