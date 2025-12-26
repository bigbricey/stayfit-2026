'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    SoloLevelingPage,
    SystemPanelWithHeader,
    SystemButton
} from '@/components/SoloLeveling';
import { AnimatedNumber } from '@/components/SoloLeveling/AnimatedNumber';
import { XPPopup } from '@/components/SoloLeveling/XPPopup';
import { NotificationManager } from '@/components/SoloLeveling/SystemNotification';
import {
    ArrowLeft,
    Utensils,
    Apple,
    Flame,
    Beef,
    Wheat,
    Droplet,
    Coffee,
    Sun,
    Moon,
    Cookie,
    Plus
} from 'lucide-react';
import Link from 'next/link';

const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'lunch', label: 'Lunch', icon: Sun },
    { id: 'dinner', label: 'Dinner', icon: Moon },
    { id: 'snack', label: 'Snack', icon: Cookie },
] as const;

interface Meal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal_type: string;
    created_at: string;
}



// Animated stat display
function AnimatedStat({ value, icon: Icon, label, color }: {
    value: number;
    icon: React.ElementType;
    label: string;
    color: string;
}) {
    return (
        <div className="text-center">
            <Icon className={`w-8 h-8 mx-auto ${color} mb-2`} style={{ filter: `drop-shadow(0 0 8px currentColor)` }} />
            <div className="font-bold text-white text-4xl" style={{ textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(100,200,255,0.6)' }}>
                <AnimatedNumber value={value} duration={600} />
            </div>
            <p className="text-white text-xs mt-1 tracking-wider font-medium" style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>{label}</p>
        </div>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [isPending, setIsPending] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Animation states
    const [xpPopups, setXpPopups] = useState<{ id: string; amount: number }[]>([]);
    const [notifications, setNotifications] = useState<{ id: string; message: string; type?: 'info' | 'success' | 'warning' }[]>([]);

    // Form state


    useEffect(() => {
        setMounted(true);
        // Load from localStorage
        const saved = localStorage.getItem('stayfit_meals_today');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const today = new Date().toISOString().split('T')[0];
                if (parsed.date === today) {
                    setMeals(parsed.meals || []);
                }
            } catch (e) {
                console.error('Error loading saved meals:', e);
            }
        }
    }, []);

    // Save to localStorage whenever meals change
    useEffect(() => {
        if (mounted && meals.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('stayfit_meals_today', JSON.stringify({ date: today, meals }));
        }
    }, [meals, mounted]);

    const totals = meals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Add XP popup
    const showXPGain = useCallback((amount: number) => {
        const id = Date.now().toString();
        setXpPopups(prev => [...prev, { id, amount }]);
    }, []);

    // Add notification
    const showNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'success') => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, message, type }]);
    }, []);

    // Remove XP popup
    const removeXPPopup = useCallback((id: string) => {
        setXpPopups(prev => prev.filter(p => p.id !== id));
    }, []);

    // Remove notification
    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);



    if (!mounted) return null;

    return (
        <SoloLevelingPage>
            {/* XP Popups */}
            {xpPopups.map((popup) => (
                <XPPopup
                    key={popup.id}
                    amount={popup.amount}
                    onComplete={() => removeXPPopup(popup.id)}
                />
            ))}

            {/* System Notifications */}
            <NotificationManager
                notifications={notifications}
                onRemove={removeNotification}
            />

            <SystemPanelWithHeader
                title="FUEL TRACKER"
                icon={Utensils}
                className="h-full"
                backButton={
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] tracking-[0.2em] font-mono uppercase">BACK</span>
                    </button>
                }
            >
                <div className="space-y-6">

                    {/* Daily Stats Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-2">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <h3 className="text-sm font-bold tracking-widest text-white">DAILY STATS</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <AnimatedStat value={totals.calories} icon={Flame} label="CALORIES" color="text-orange-400" />
                            <AnimatedStat value={totals.protein} icon={Beef} label="PROTEIN" color="text-red-400" />
                            <AnimatedStat value={totals.carbs} icon={Wheat} label="CARBS" color="text-yellow-400" />
                            <AnimatedStat value={totals.fat} icon={Droplet} label="FAT" color="text-blue-400" />
                        </div>
                    </div>

                    {/* Meal Selection - Navigation to "Quest" Pages */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-2">
                            <Plus className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-bold tracking-widest text-white">SELECT MEAL TO LOG</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {mealTypes.map((type) => (
                                <Link
                                    key={type.id}
                                    href={`/dashboard/food/${type.id}`}
                                    className="group relative border border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/60 transition-all p-4 flex flex-col items-center justify-center gap-2"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <type.icon className="w-8 h-8 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }} />
                                    <span className="text-sm tracking-widest uppercase font-bold text-white group-hover:text-cyan-300 transition-colors" style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                                        {type.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-white text-xs tracking-[0.3em] py-4 font-medium" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                        [ NUTRITION SYSTEM ONLINE ]
                    </p>
                </div>
            </SystemPanelWithHeader>
        </SoloLevelingPage>
    );
}
