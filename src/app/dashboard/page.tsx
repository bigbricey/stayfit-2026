'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    SoloLevelingLayout,
    SystemPanelWithHeader,
    SystemButton
} from '@/components/SoloLeveling';
import { AnimatedNumber } from '@/components/SoloLeveling/AnimatedNumber';
import { XPPopup } from '@/components/SoloLeveling/XPPopup';
import { SystemNotification, NotificationManager } from '@/components/SoloLeveling/SystemNotification';
import { saveMeal, getTodaysMeals } from '@/lib/actions/meals';
import {
    ArrowLeft,
    Utensils,
    Apple,
    Flame,
    Beef,
    Wheat,
    Droplet,
    Plus,
    Coffee,
    Sun,
    Moon,
    Cookie
} from 'lucide-react';

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

const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'lunch', label: 'Lunch', icon: Sun },
    { id: 'dinner', label: 'Dinner', icon: Moon },
    { id: 'snack', label: 'Snack', icon: Cookie },
] as const;

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
            <p className="text-white/50 text-xs mt-1 tracking-wider">{label}</p>
        </div>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);

    // Animation states
    const [xpPopups, setXpPopups] = useState<{ id: string; amount: number }[]>([]);
    const [notifications, setNotifications] = useState<{ id: string; message: string; type?: 'info' | 'success' | 'warning' }[]>([]);

    // Form state
    const [selectedType, setSelectedType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
    const [mealName, setMealName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');

    useEffect(() => {
        setMounted(true);
        loadMeals();
    }, []);

    const loadMeals = async () => {
        try {
            const todaysMeals = await getTodaysMeals();
            setMeals(todaysMeals);
        } catch (error) {
            console.error('Error loading meals:', error);
        }
    };

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

    const handleSubmit = async () => {
        if (!calories) return;

        const calorieValue = parseInt(calories) || 0;
        const xpGain = Math.floor(calorieValue / 50) + 10; // Base 10 XP + 1 per 50 cal

        startTransition(async () => {
            try {
                await saveMeal({
                    name: mealName || selectedType,
                    calories: calorieValue,
                    protein: parseInt(protein) || 0,
                    carbs: parseInt(carbs) || 0,
                    fat: parseInt(fat) || 0,
                    meal_type: selectedType,
                });
                await loadMeals();

                // Show animations!
                showXPGain(xpGain);
                setTimeout(() => {
                    showNotification(`Nutrition data recorded. +${xpGain} XP acquired.`, 'success');
                }, 500);

                // Reset form
                setMealName('');
                setCalories('');
                setProtein('');
                setCarbs('');
                setFat('');
            } catch (error) {
                console.error('Error saving meal:', error);
                showNotification('Failed to log meal. Try again.', 'warning');
            }
        });
    };

    if (!mounted) return null;

    return (
        <SoloLevelingLayout>
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

            {/* Header */}
            <header className="border-b border-white/20 p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="w-10 h-10 border border-white/40 flex items-center justify-center 
                            hover:bg-white/10 hover:border-white/60 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex items-center gap-3">
                        <Utensils className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }} />
                        <h1 className="text-white font-bold text-xl tracking-[0.15em] uppercase"
                            style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                            FUEL TRACKER
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-4 space-y-4">

                {/* Daily Stats Panel - Now Animated! */}
                <SystemPanelWithHeader title="DAILY STATS" icon={Flame}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <AnimatedStat value={totals.calories} icon={Flame} label="CALORIES" color="text-orange-400" />
                        <AnimatedStat value={totals.protein} icon={Beef} label="PROTEIN" color="text-red-400" />
                        <AnimatedStat value={totals.carbs} icon={Wheat} label="CARBS" color="text-yellow-400" />
                        <AnimatedStat value={totals.fat} icon={Droplet} label="FAT" color="text-blue-400" />
                    </div>
                </SystemPanelWithHeader>

                {/* Log Meal Panel */}
                <SystemPanelWithHeader title="LOG MEAL" icon={Plus}>
                    {/* Meal Type Selector */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {mealTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`py-3 border text-center transition-all duration-150 active:scale-95 ${selectedType === type.id
                                    ? 'border-white/80 bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                    : 'border-white/20 text-white/50 hover:border-white/40 hover:text-white/80'
                                    }`}
                            >
                                <type.icon className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs tracking-wider uppercase">{type.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Input Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-white/50 text-xs tracking-wider uppercase mb-2 block">Meal Name (optional)</label>
                            <input
                                type="text"
                                value={mealName}
                                onChange={(e) => setMealName(e.target.value)}
                                placeholder="e.g. Grilled Chicken Salad"
                                className="w-full bg-transparent border border-white/30 text-white px-4 py-3 placeholder-white/30 
                                    focus:border-white/60 focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 block">Calories</label>
                                <input
                                    type="number"
                                    value={calories}
                                    onChange={(e) => setCalories(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-transparent border border-white/30 text-white text-center text-2xl font-bold px-4 py-3 placeholder-white/30 
                                        focus:border-white/60 focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                                    style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                                />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 block">Protein (g)</label>
                                <input
                                    type="number"
                                    value={protein}
                                    onChange={(e) => setProtein(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-transparent border border-white/30 text-white text-center text-xl px-4 py-3 placeholder-white/30 
                                        focus:border-white/60 focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 block">Carbs (g)</label>
                                <input
                                    type="number"
                                    value={carbs}
                                    onChange={(e) => setCarbs(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-transparent border border-white/30 text-white text-center text-xl px-4 py-3 placeholder-white/30 
                                        focus:border-white/60 focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 block">Fat (g)</label>
                                <input
                                    type="number"
                                    value={fat}
                                    onChange={(e) => setFat(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-transparent border border-white/30 text-white text-center text-xl px-4 py-3 placeholder-white/30 
                                        focus:border-white/60 focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6">
                        <SystemButton onClick={handleSubmit} disabled={isPending || !calories}>
                            {isPending ? 'LOGGING...' : 'LOG MEAL'}
                        </SystemButton>
                    </div>
                </SystemPanelWithHeader>

                {/* Today's Meals */}
                {meals.length > 0 && (
                    <SystemPanelWithHeader title="TODAY'S LOG" icon={Apple}>
                        <div className="space-y-3">
                            {meals.map((meal) => (
                                <div key={meal.id} className="flex items-center justify-between border-b border-white/10 pb-3 
                                    hover:bg-white/5 -mx-2 px-2 transition-colors">
                                    <div>
                                        <p className="text-white font-medium">{meal.name}</p>
                                        <p className="text-white/40 text-xs uppercase tracking-wider">{meal.meal_type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold" style={{ textShadow: '0 0 8px rgba(255,255,255,0.5)' }}>
                                            {meal.calories} cal
                                        </p>
                                        <p className="text-white/40 text-xs">
                                            P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SystemPanelWithHeader>
                )}

                <p className="text-center text-white/30 text-xs tracking-[0.3em] py-4">
                    [ NUTRITION SYSTEM ONLINE ]
                </p>
            </div>
        </SoloLevelingLayout>
    );
}
