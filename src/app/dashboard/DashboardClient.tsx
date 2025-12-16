'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import CalorieBudget from '@/components/CalorieBudget';
import FoodDiary from '@/components/FoodDiary';
import ProgressTab from '@/components/ProgressTab';

interface Meal {
    id?: string;
    meal_type: string;
    description?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

interface DashboardProps {
    user: { id: string; email?: string };
    profile: {
        display_name?: string;
        goal_weight?: number;
        start_weight?: number;
        current_weight?: number;
        daily_calorie_goal?: number;
    } | null;
    weightEntries: Array<{ id?: string; date: string; weight: number; notes?: string }>;
    waterToday: { glasses: number } | null;
    streak: { current_streak: number; longest_streak: number } | null;
    mealsToday: Meal[];
}

export default function DashboardClient({
    user,
    profile,
    weightEntries,
    waterToday,
    streak,
    mealsToday
}: DashboardProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'home' | 'food' | 'exercise' | 'progress' | 'settings'>('home');
    const [showProfileSetup, setShowProfileSetup] = useState(!profile?.goal_weight || !profile?.start_weight);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const handleAddWater = async () => {
        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];
        const newGlasses = (waterToday?.glasses || 0) + 1;
        await supabase.from('water_intake').upsert({
            user_id: user.id,
            date: today,
            glasses: newGlasses,
        }, { onConflict: 'user_id,date' });
        router.refresh();
    };

    // Calculate daily totals
    const dailyGoal = profile?.daily_calorie_goal || 2000;
    const caloriesEaten = mealsToday.reduce((sum, m) => sum + (m.calories || 0), 0);
    const proteinTotal = mealsToday.reduce((sum, m) => sum + (m.protein || 0), 0);
    const carbsTotal = mealsToday.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const fatTotal = mealsToday.reduce((sum, m) => sum + (m.fat || 0), 0);
    const remaining = dailyGoal - caloriesEaten;

    const mealsWithId = mealsToday.map((m, i) => ({ ...m, id: m.id || String(i) }));
    const userName = user.email?.split('@')[0] || 'User';

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Header - MFP Style Blue Bar */}
            <header className="bg-[#0073CF] text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-tight">stayfitwithai</span>
                        </Link>

                        {/* User Info */}
                        <div className="flex items-center gap-4 text-sm">
                            <span>Hi, <strong>{userName}</strong></span>
                            <button className="hover:underline">Help</button>
                            <button onClick={() => setActiveTab('settings')} className="hover:underline">Settings</button>
                            <button onClick={handleLogout} className="hover:underline">Log Out</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Navigation Tabs - MFP Style */}
            <nav className="bg-[#005AA7]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex">
                        {[
                            { id: 'home', label: 'MY HOME' },
                            { id: 'food', label: 'FOOD' },
                            { id: 'exercise', label: 'EXERCISE' },
                            { id: 'progress', label: 'REPORTS' },
                            { id: 'settings', label: 'SETTINGS' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-[#004080] text-white'
                                        : 'text-white/90 hover:bg-[#004080]/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Secondary Nav - Subtabs */}
            <div className="bg-[#E8F4FC] border-b border-[#B8D4E8]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-6 text-sm">
                        <button className="py-2.5 text-[#0073CF] font-medium border-b-2 border-[#0073CF]">Home</button>
                        <button className="py-2.5 text-gray-600 hover:text-[#0073CF]">Goals</button>
                        <button className="py-2.5 text-gray-600 hover:text-[#0073CF]">Check-In</button>
                        <button className="py-2.5 text-gray-600 hover:text-[#0073CF]">Profile</button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'home' && (
                    <div className="space-y-6">
                        {/* Today Header with Streak */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xl">
                                    👤
                                </div>
                                <h1 className="text-2xl font-semibold text-gray-800">Today</h1>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-gray-800">{streak?.current_streak || 0}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Day Streak</div>
                            </div>
                        </div>

                        {/* Calories and Macros Row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Calories Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-1">Calories</h2>
                                <p className="text-sm text-gray-500 mb-4">Remaining = Goal - Food + Exercise</p>

                                <div className="flex items-center gap-8">
                                    {/* Calorie Ring */}
                                    <div className="relative">
                                        <svg width="120" height="120" className="transform -rotate-90">
                                            <circle cx="60" cy="60" r="50" stroke="#E5E7EB" strokeWidth="10" fill="none" />
                                            <circle
                                                cx="60" cy="60" r="50"
                                                stroke="#3B9FD8"
                                                strokeWidth="10"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={2 * Math.PI * 50}
                                                strokeDashoffset={2 * Math.PI * 50 * (1 - Math.min(caloriesEaten / dailyGoal, 1))}
                                                className="transition-all duration-700"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-gray-800">{remaining}</span>
                                            <span className="text-xs text-gray-500">Remaining</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400">🎯</span>
                                            <div>
                                                <div className="text-gray-500">Base Goal</div>
                                                <div className="font-semibold text-gray-800">{dailyGoal}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-green-500">🍽️</span>
                                            <div>
                                                <div className="text-gray-500">Food</div>
                                                <div className="font-semibold text-gray-800">{caloriesEaten}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-orange-500">🔥</span>
                                            <div>
                                                <div className="text-gray-500">Exercise</div>
                                                <div className="font-semibold text-gray-800">0</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Macros Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Macros</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <MacroCircle label="Carbs" current={Math.round(carbsTotal)} goal={Math.round(dailyGoal * 0.45 / 4)} color="#4ECDC4" />
                                    <MacroCircle label="Fat" current={Math.round(fatTotal)} goal={Math.round(dailyGoal * 0.30 / 9)} color="#FF6B6B" />
                                    <MacroCircle label="Protein" current={Math.round(proteinTotal)} goal={Math.round(dailyGoal * 0.25 / 4)} color="#45B7D1" />
                                </div>
                            </div>
                        </div>

                        {/* Water Tracker */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💧</span>
                                    <div>
                                        <div className="font-medium text-gray-800">Water</div>
                                        <div className="text-sm text-gray-500">{waterToday?.glasses || 0} of 8 glasses</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className={`w-5 h-7 rounded-sm ${i <= (waterToday?.glasses || 0) ? 'bg-blue-400' : 'bg-gray-200'}`} />
                                    ))}
                                    <button onClick={handleAddWater} className="ml-2 bg-[#0073CF] text-white w-8 h-8 rounded-full font-bold hover:bg-[#005AA7] transition-colors">
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'food' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Food Diary</h2>
                        <FoodDiary userId={user.id} meals={mealsWithId} />
                    </div>
                )}

                {activeTab === 'exercise' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Exercise</h2>
                        <p className="text-gray-500">Exercise logging coming soon...</p>
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <ProgressTab profile={profile} weightEntries={weightEntries} streak={streak} />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>
                        <div className="space-y-4 max-w-md">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Start Weight</span>
                                <span className="font-medium">{profile?.start_weight || '--'} lbs</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Goal Weight</span>
                                <span className="font-medium">{profile?.goal_weight || '--'} lbs</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Current Weight</span>
                                <span className="font-medium">{profile?.current_weight || '--'} lbs</span>
                            </div>
                            <button
                                onClick={() => setShowProfileSetup(true)}
                                className="mt-4 bg-[#0073CF] text-white px-6 py-2 rounded hover:bg-[#005AA7] transition-colors"
                            >
                                Update Goals
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <ProfileSetupModal userId={user.id} isOpen={showProfileSetup} onClose={() => setShowProfileSetup(false)} />
        </div>
    );
}

function MacroCircle({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) {
    const percent = Math.min((current / goal) * 100, 100);
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="text-center">
            <div className="relative inline-block">
                <svg width="90" height="90" className="transform -rotate-90">
                    <circle cx="45" cy="45" r={radius} stroke="#E5E7EB" strokeWidth="8" fill="none" />
                    <circle
                        cx="45" cy="45" r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">{current}</span>
                    <span className="text-xs text-gray-400">/{goal}g</span>
                </div>
            </div>
            <div className="mt-1 text-sm text-gray-600">{label}</div>
        </div>
    );
}
