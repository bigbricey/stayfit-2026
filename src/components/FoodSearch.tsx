'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface FoodItem {
    fdcId: number;
    description: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

interface FoodSearchProps {
    userId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    onFoodAdded?: () => void;
}

export default function FoodSearch({ userId, mealType, onFoodAdded }: FoodSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [servings, setServings] = useState('1');
    const [adding, setAdding] = useState(false);

    const searchFood = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchQuery)}&pageSize=6&dataType=Foundation,SR%20Legacy&api_key=DEMO_KEY`
            );
            const data = await res.json();
            const foods: FoodItem[] = (data.foods || []).map((f: Record<string, unknown>) => {
                const nutrients = (f.foodNutrients as Array<{ nutrientName: string; value: number }>) || [];
                return {
                    fdcId: f.fdcId as number,
                    description: f.description as string,
                    calories: Math.round(nutrients.find(n => n.nutrientName === 'Energy')?.value || 0),
                    protein: Math.round(nutrients.find(n => n.nutrientName === 'Protein')?.value || 0),
                    carbs: Math.round(nutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0),
                    fat: Math.round(nutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0),
                };
            });
            setResults(foods);
        } catch (err) {
            console.error('Food search error:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchFood(query), 300);
        return () => clearTimeout(timer);
    }, [query, searchFood]);

    const handleAddFood = async () => {
        if (!selectedFood) return;
        setAdding(true);
        const supabase = createClient();
        const multiplier = parseFloat(servings) || 1;
        const today = new Date().toISOString().split('T')[0];

        await supabase.from('meals').insert({
            user_id: userId,
            date: today,
            meal_type: mealType,
            description: selectedFood.description,
            calories: Math.round((selectedFood.calories || 0) * multiplier),
            protein: Math.round((selectedFood.protein || 0) * multiplier * 10) / 10,
            carbs: Math.round((selectedFood.carbs || 0) * multiplier * 10) / 10,
            fat: Math.round((selectedFood.fat || 0) * multiplier * 10) / 10,
        });

        setQuery('');
        setResults([]);
        setSelectedFood(null);
        setServings('1');
        setAdding(false);
        onFoodAdded?.();
        router.refresh();
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#0073CF]/30 focus:border-[#0073CF] outline-none text-sm"
            />
            {loading && <div className="absolute right-3 top-2.5 text-gray-400 text-xs">...</div>}

            {results.length > 0 && !selectedFood && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-64 overflow-y-auto">
                    {results.map((food) => (
                        <button
                            key={food.fdcId}
                            onClick={() => setSelectedFood(food)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                        >
                            <div className="text-gray-800 font-medium truncate">{food.description}</div>
                            <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                                <span className="text-[#0073CF]">{food.calories} cal</span>
                                <span>P:{food.protein}g</span>
                                <span>C:{food.carbs}g</span>
                                <span>F:{food.fat}g</span>
                                <span className="text-gray-400">/ 100g</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {selectedFood && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="text-gray-800 font-medium text-sm mb-2">{selectedFood.description}</div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500">Servings (100g)</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={servings}
                                onChange={(e) => setServings(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-[#0073CF]">
                                {Math.round((selectedFood.calories || 0) * (parseFloat(servings) || 1))}
                            </div>
                            <div className="text-xs text-gray-500">cal</div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => { setSelectedFood(null); setQuery(''); }}
                            className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded text-sm hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddFood}
                            disabled={adding}
                            className="flex-1 bg-[#0073CF] text-white py-1.5 rounded text-sm hover:bg-[#005AA7] disabled:opacity-50"
                        >
                            {adding ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
