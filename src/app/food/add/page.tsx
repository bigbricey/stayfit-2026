'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface FoodItem {
    fdcId: number;
    name: string;
    brand: string | null;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sugar: number;
    sodium: number;
}

function AddFoodForm() {
    const searchParams = useSearchParams();
    const meal = searchParams.get('meal') || 'breakfast';
    const mealDisplay = meal.charAt(0).toUpperCase() + meal.slice(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [servings, setServings] = useState('1');
    const [message, setMessage] = useState('');
    const [totalHits, setTotalHits] = useState(0);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setMessage('Please enter a food to search');
            return;
        }

        setIsSearching(true);
        setMessage('');
        setSearchResults([]);

        try {
            const response = await fetch(`/api/food/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data.error) {
                setMessage(data.error);
            } else {
                setSearchResults(data.foods || []);
                setTotalHits(data.totalHits || 0);
                if (data.foods?.length === 0) {
                    setMessage('No foods found. Try a different search term.');
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            setMessage('Error searching foods. Please try again.');
        }

        setIsSearching(false);
    };

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
        setSearchResults([]);
    };

    const handleAddFood = () => {
        if (!selectedFood) {
            setMessage('Please select a food first');
            return;
        }

        // TODO: Save to Supabase meals table
        setMessage(`Added ${servings}x ${selectedFood.name} to ${mealDisplay}!`);
        setSelectedFood(null);
        setServings('1');
    };

    const servingMultiplier = parseFloat(servings || '1');

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="mb-4">
                    <Link href="/food" className="text-[#0073CF] hover:underline">← Back to Food Diary</Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100 bg-[#0073CF] rounded-t-lg">
                        <h1 className="text-xl font-semibold text-white">Add Food to {mealDisplay}</h1>
                    </div>

                    <div className="p-5">
                        {/* Search Section */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search for any food</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="e.g., pizza, grilled chicken, avocado toast..."
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-[#0073CF] focus:outline-none"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="bg-[#0073CF] text-white px-4 py-2 rounded hover:bg-[#005AA7] transition-colors disabled:opacity-50"
                                >
                                    {isSearching ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Powered by USDA FoodData Central - Search millions of foods
                            </p>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-700 mb-2">
                                    Found {totalHits.toLocaleString()} results (showing top 25)
                                </h3>
                                <div className="border border-gray-200 rounded max-h-80 overflow-y-auto">
                                    {searchResults.map((food) => (
                                        <button
                                            key={food.fdcId}
                                            onClick={() => handleSelectFood(food)}
                                            className="w-full text-left px-4 py-3 hover:bg-[#E8F4FC] border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-gray-800 font-medium">{food.name}</div>
                                                    {food.brand && (
                                                        <div className="text-xs text-gray-500">{food.brand}</div>
                                                    )}
                                                </div>
                                                <div className="text-right text-sm">
                                                    <div className="font-medium text-gray-800">{Math.round(food.calories)} cal</div>
                                                    <div className="text-xs text-gray-500">per {food.servingSize}{food.servingUnit}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Food */}
                        {selectedFood && (
                            <div className="mb-6 p-4 bg-[#E8F4FC] rounded-lg border border-[#C5DCE9]">
                                <h3 className="font-medium text-gray-800 mb-1">{selectedFood.name}</h3>
                                {selectedFood.brand && (
                                    <p className="text-sm text-gray-500 mb-3">{selectedFood.brand}</p>
                                )}
                                <div className="grid grid-cols-4 gap-4 text-center text-sm mb-4">
                                    <div>
                                        <div className="text-gray-500">Calories</div>
                                        <div className="font-semibold text-lg">{Math.round(selectedFood.calories * servingMultiplier)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Carbs</div>
                                        <div className="font-semibold">{Math.round(selectedFood.carbs * servingMultiplier)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Fat</div>
                                        <div className="font-semibold">{Math.round(selectedFood.fat * servingMultiplier)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Protein</div>
                                        <div className="font-semibold">{Math.round(selectedFood.protein * servingMultiplier)}g</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500 mb-4">
                                    <div>Fiber: {Math.round(selectedFood.fiber * servingMultiplier)}g</div>
                                    <div>Sugar: {Math.round(selectedFood.sugar * servingMultiplier)}g</div>
                                    <div>Sodium: {Math.round(selectedFood.sodium * servingMultiplier)}mg</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-sm text-gray-600">Servings ({selectedFood.servingSize}{selectedFood.servingUnit} each):</label>
                                    <input
                                        type="number"
                                        min="0.25"
                                        step="0.25"
                                        value={servings}
                                        onChange={(e) => setServings(e.target.value)}
                                        className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Message */}
                        {message && (
                            <div className={`mb-4 p-3 rounded ${message.includes('Added') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                {message}
                            </div>
                        )}

                        {/* Add Button */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddFood}
                                disabled={!selectedFood}
                                className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors disabled:opacity-50"
                            >
                                Add to {mealDisplay}
                            </button>
                            <Link
                                href="/food"
                                className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Add Section */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800">Quick Add (Enter calories manually)</h2>
                    </div>
                    <div className="p-5">
                        <p className="text-sm text-gray-500 mb-3">
                            Can&apos;t find your food? Enter the calories manually.
                        </p>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                placeholder="Calories"
                                className="w-32 border border-gray-300 rounded px-3 py-2"
                            />
                            <span className="text-gray-600">calories</span>
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors">
                                Quick Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AddFoodPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <AddFoodForm />
        </Suspense>
    );
}
