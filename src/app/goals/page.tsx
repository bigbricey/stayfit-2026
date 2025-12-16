'use client';

import Link from 'next/link';
import { useUserData } from '@/context/UserDataContext';

const micronutrients = [
    { name: 'Sodium', value: '2,300', unit: 'mg' },
    { name: 'Potassium', value: '3,500', unit: 'mg' },
    { name: 'Cholesterol', value: '300', unit: 'mg' },
    { name: 'Fiber', value: '25', unit: 'g' },
    { name: 'Sugar', value: '50', unit: 'g' },
    { name: 'Vitamin A', value: '900', unit: 'mcg' },
    { name: 'Vitamin C', value: '90', unit: 'mg' },
    { name: 'Calcium', value: '1,000', unit: 'mg' },
    { name: 'Iron', value: '18', unit: 'mg' },
    { name: 'Vitamin D', value: '600', unit: 'IU' },
    { name: 'Saturated Fat', value: '22', unit: 'g' },
    { name: 'Polyunsaturated Fat', value: '22', unit: 'g' },
];

export default function GoalsPage() {
    const { userData, getWeightProgress } = useUserData();
    const progress = getWeightProgress();

    // Calculate macro percentages
    const totalMacroCals = (userData.nutritionGoals.protein * 4) +
        (userData.nutritionGoals.carbs * 4) +
        (userData.nutritionGoals.fat * 9);

    const carbsPct = Math.round((userData.nutritionGoals.carbs * 4 / totalMacroCals) * 100);
    const fatPct = Math.round((userData.nutritionGoals.fat * 9 / totalMacroCals) * 100);
    const proteinPct = Math.round((userData.nutritionGoals.protein * 4 / totalMacroCals) * 100);

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Goals</h1>

                {/* Daily Nutrition Goals */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Daily Nutrition Goals</h2>
                        <Link href="/goals/nutrition" className="text-[#0073CF] text-sm hover:underline">Edit</Link>
                    </div>
                    <div className="p-5">
                        {/* Calories */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-700 font-medium">Calories</span>
                                <span className="text-gray-800 font-semibold">{userData.nutritionGoals.calories.toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-gray-500">Net calories consumed</div>
                        </div>

                        {/* Macros */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-[#4CAF50] flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-800">{carbsPct}%</span>
                                </div>
                                <div className="text-sm font-medium text-gray-700">Carbohydrates</div>
                                <div className="text-xs text-gray-500">{userData.nutritionGoals.carbs}g</div>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-[#FF9800] flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-800">{fatPct}%</span>
                                </div>
                                <div className="text-sm font-medium text-gray-700">Fat</div>
                                <div className="text-xs text-gray-500">{userData.nutritionGoals.fat}g</div>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-[#2196F3] flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-800">{proteinPct}%</span>
                                </div>
                                <div className="text-sm font-medium text-gray-700">Protein</div>
                                <div className="text-xs text-gray-500">{userData.nutritionGoals.protein}g</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Micronutrients */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Micronutrients</h2>
                        <Link href="/goals/micronutrients" className="text-[#0073CF] text-sm hover:underline">Edit</Link>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {micronutrients.map((nutrient) => (
                                <div key={nutrient.name} className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">{nutrient.name}</span>
                                    <span className="text-sm font-medium text-gray-800">{nutrient.value} {nutrient.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calories by Meal - Premium */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 relative overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-800">Calories by Meal</h2>
                            <span className="bg-[#FFD700] text-xs px-2 py-0.5 rounded font-medium">👑 Premium</span>
                        </div>
                    </div>
                    <div className="p-5 relative">
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🔒</div>
                                <div className="text-gray-600 mb-2">Customize your calorie goals by meal</div>
                                <Link href="/premium" className="inline-block bg-[#0073CF] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#005AA7]">
                                    Upgrade to Premium
                                </Link>
                            </div>
                        </div>
                        <div className="opacity-50 blur-sm">
                            <div className="grid grid-cols-4 gap-4">
                                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal, i) => (
                                    <div key={meal} className="text-center p-3 bg-gray-50 rounded">
                                        <div className="text-sm text-gray-600">{meal}</div>
                                        <div className="font-semibold">{[400, 600, 700, 300][i]} cal</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fitness Goals */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Fitness Goals</h2>
                        <Link href="/goals/fitness" className="text-[#0073CF] text-sm hover:underline">Edit</Link>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E8F4FC] rounded-full flex items-center justify-center text-xl">🔥</div>
                                <div>
                                    <div className="text-sm text-gray-500">Calories Burned/Week</div>
                                    <div className="text-lg font-semibold text-gray-800">{userData.fitnessGoals.caloriesBurnedPerWeek.toLocaleString()} cal</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E8F4FC] rounded-full flex items-center justify-center text-xl">🏋️</div>
                                <div>
                                    <div className="text-sm text-gray-500">Workouts/Week</div>
                                    <div className="text-lg font-semibold text-gray-800">{userData.fitnessGoals.workoutsPerWeek} workouts</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E8F4FC] rounded-full flex items-center justify-center text-xl">⏱️</div>
                                <div>
                                    <div className="text-sm text-gray-500">Exercise Minutes/Week</div>
                                    <div className="text-lg font-semibold text-gray-800">{userData.fitnessGoals.exerciseMinutesPerWeek} min</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weight Goal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Weight Goal</h2>
                        <Link href="/goals/weight" className="text-[#0073CF] text-sm hover:underline">Edit</Link>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Starting Weight</div>
                                <div className="text-xl font-semibold text-gray-800">{userData.startingWeight} lbs</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Current Weight</div>
                                <div className="text-xl font-semibold text-gray-800">{userData.currentWeight} lbs</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Goal Weight</div>
                                <div className="text-xl font-semibold text-[#0073CF]">{userData.goalWeight} lbs</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{progress.lost} lbs lost • {progress.toGo} lbs to go</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-[#4CAF50] h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Goal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Weekly Goal</h2>
                        <Link href="/goals/weekly" className="text-[#0073CF] text-sm hover:underline">Edit</Link>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-lg font-semibold text-gray-800">Lose {userData.weeklyWeightLossGoal} lb per week</div>
                                <div className="text-sm text-gray-500">Recommended for sustainable weight loss</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Daily calorie deficit</div>
                                <div className="text-lg font-semibold text-[#0073CF]">-{userData.weeklyWeightLossGoal * 500} cal</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
