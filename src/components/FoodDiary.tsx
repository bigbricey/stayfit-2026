'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import FoodSearch from './FoodSearch';

interface Meal {
    id: string;
    meal_type: string;
    description?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

interface FoodDiaryProps {
    userId: string;
    meals: Meal[];
    onUpdate?: () => void;
}

const mealConfig = {
    breakfast: { icon: '🌅', label: 'Breakfast' },
    lunch: { icon: '☀️', label: 'Lunch' },
    dinner: { icon: '🌙', label: 'Dinner' },
    snack: { icon: '🍎', label: 'Snacks' }
};

export default function FoodDiary({ userId, meals, onUpdate }: FoodDiaryProps) {
    const router = useRouter();
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

    const handleDelete = async (mealId: string) => {
        const supabase = createClient();
        await supabase.from('meals').delete().eq('id', mealId);
        onUpdate?.();
        router.refresh();
    };

    const getMealCalories = (type: string) => {
        return meals.filter(m => m.meal_type === type).reduce((sum, m) => sum + (m.calories || 0), 0);
    };

    return (
        <div className="space-y-1">
            {mealTypes.map((type) => {
                const typeMeals = meals.filter(m => m.meal_type === type);
                const mealCals = getMealCalories(type);
                const config = mealConfig[type];

                return (
                    <div key={type} className="border-b border-gray-200 last:border-0">
                        {/* Meal Header */}
                        <div className="flex items-center justify-between py-3 bg-gray-50 px-4 -mx-6">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{config.icon}</span>
                                <span className="font-medium text-gray-800">{config.label}</span>
                            </div>
                            <span className="text-[#0073CF] font-medium">{mealCals}</span>
                        </div>

                        {/* Foods in this meal */}
                        <div className="divide-y divide-gray-100">
                            {typeMeals.length === 0 && (
                                <div className="py-3 px-4 text-gray-400 text-sm italic">
                                    No foods logged
                                </div>
                            )}

                            {typeMeals.map((meal) => (
                                <div
                                    key={meal.id}
                                    className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-gray-800">{meal.description || 'Unnamed food'}</div>
                                        <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                                            <span>P: {meal.protein || 0}g</span>
                                            <span>C: {meal.carbs || 0}g</span>
                                            <span>F: {meal.fat || 0}g</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600">{meal.calories || 0}</span>
                                        <button
                                            onClick={() => handleDelete(meal.id)}
                                            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-all text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Food */}
                            <div className="py-3 px-4">
                                <FoodSearch
                                    userId={userId}
                                    mealType={type}
                                    onFoodAdded={onUpdate}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
