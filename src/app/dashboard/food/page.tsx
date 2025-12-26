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
    const [selectedType, setSelectedType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
    const [mealName, setMealName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');

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

    const handleSubmit = async () => {
        if (!calories) return;

        const calorieValue = parseInt(calories) || 0;
        const xpGain = Math.floor(calorieValue / 50) + 10; // Base 10 XP + 1 per 50 cal

        setIsPending(true);

        // Simulate a brief delay for effect
        await new Promise(resolve => setTimeout(resolve, 300));

        // Create new meal (local state only for now)
        const newMeal: Meal = {
            id: Date.now().toString(),
            name: mealName || selectedType.charAt(0).toUpperCase() + selectedType.slice(1),
            calories: calorieValue,
            protein: parseInt(protein) || 0,
            carbs: parseInt(carbs) || 0,
            fat: parseInt(fat) || 0,
            meal_type: selectedType,
            created_at: new Date().toISOString(),
        };

        setMeals(prev => [...prev, newMeal]);

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
        setIsPending(false);
    };

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
                className="min-h-full"
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

                    {/* Log Meal Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-2">
                            <Plus className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-bold tracking-widest text-white">LOG MEAL</h3>
                        </div>

                        {/* Meal Type Selector */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {mealTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`py-3 border text-center transition-all duration-150 active:scale-95 ${selectedType === type.id
                                        ? 'border-white bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                        : 'border-white/40 text-white/80 hover:border-white/60 hover:text-white'
                                        }`}
                                    style={{ textShadow: selectedType === type.id ? '0 0 10px rgba(255,255,255,0.5)' : '0 0 5px rgba(255,255,255,0.3)' }}
                                >
                                    <type.icon className="w-5 h-5 mx-auto mb-1" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
                                    <span className="text-xs tracking-wider uppercase font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-white text-xs tracking-wider uppercase mb-2 block font-medium" style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>Meal Name (optional)</label>
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
                                    <label className="text-white text-xs tracking-wider uppercase mb-2 block font-medium" style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>Calories</label>
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
                                    <label className="text-white text-xs tracking-wider uppercase mb-2 block font-medium" style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>Protein (g)</label>
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
                                    <label className="text-white text-xs tracking-wider uppercase mb-2 block font-medium" style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>Carbs (g)</label>
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
                                    <label className="text-white text-xs tracking-wider uppercase mb-2 block font-medium" style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>Fat (g)</label>
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
                    </div>

                    {/* Today's Meals */}
                    {meals.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-2">
                                <Apple className="w-4 h-4 text-green-400" />
                                <h3 className="text-sm font-bold tracking-widest text-white">TODAY'S LOG</h3>
                            </div>
                            <div className="space-y-3">
                                {meals.map((meal) => (
                                    <div key={meal.id} className="flex items-center justify-between border-b border-white/10 pb-3 
                                        hover:bg-white/5 -mx-2 px-2 transition-colors">
                                        <div>
                                            <p className="text-white font-bold" style={{ textShadow: '0 0 8px rgba(255,255,255,0.5)' }}>{meal.name}</p>
                                            <p className="text-white/80 text-xs uppercase tracking-wider font-medium" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>{meal.meal_type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold" style={{ textShadow: '0 0 8px rgba(255,255,255,0.5)' }}>
                                                {meal.calories} cal
                                            </p>
                                            <p className="text-white/90 text-xs font-medium" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
                                                P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-center text-white text-xs tracking-[0.3em] py-4 font-medium" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                        [ NUTRITION SYSTEM ONLINE ]
                    </p>
                </div>
            </SystemPanelWithHeader>
        </SoloLevelingPage>
    );
}
