import Link from 'next/link';

export default function GoalsPage() {
    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            {/* Secondary Navigation */}
            <div className="bg-[#E8F4FC] border-b border-[#C5DCE9]">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex gap-6 text-sm">
                        <Link href="/" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Home</Link>
                        <Link href="/goals" className="py-2.5 text-[#0073CF] font-medium border-b-2 border-[#0073CF]">Goals</Link>
                        <Link href="/check-in" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Check-In</Link>
                    </div>
                </div>
            </div>

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
                                <span className="text-gray-800 font-semibold">2,000</span>
                            </div>
                            <div className="text-sm text-gray-500">Net calories consumed</div>
                        </div>

                        {/* Macros */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-[#4CAF50] flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-800">50%</span>
                                </div>
                                <div className="text-sm font-medium text-gray-700">Carbohydrates</div>
                                <div className="text-xs text-gray-500">250g</div>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-[#FF9800] flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-800">30%</span>
                                </div>
                                <div className="text-sm font-medium text-gray-700">Fat</div>
                                <div className="text-xs text-gray-500">67g</div>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-[#2196F3] flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-800">20%</span>
                                </div>
                                <div className="text-sm font-medium text-gray-700">Protein</div>
                                <div className="text-xs text-gray-500">100g</div>
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
                            {[
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
                            ].map((nutrient) => (
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
                        {/* Premium Overlay */}
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🔒</div>
                                <div className="text-gray-600 mb-2">Customize your calorie goals by meal</div>
                                <Link href="/premium" className="inline-block bg-[#0073CF] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#005AA7]">
                                    Upgrade to Premium
                                </Link>
                            </div>
                        </div>
                        {/* Blurred content */}
                        <div className="opacity-50 blur-sm">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-600">Breakfast</div>
                                    <div className="font-semibold">400 cal</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-600">Lunch</div>
                                    <div className="font-semibold">600 cal</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-600">Dinner</div>
                                    <div className="font-semibold">700 cal</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-600">Snacks</div>
                                    <div className="font-semibold">300 cal</div>
                                </div>
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
                                <div className="w-12 h-12 bg-[#E8F4FC] rounded-full flex items-center justify-center text-xl">
                                    🔥
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Calories Burned/Week</div>
                                    <div className="text-lg font-semibold text-gray-800">2,500 cal</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E8F4FC] rounded-full flex items-center justify-center text-xl">
                                    🏋️
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Workouts/Week</div>
                                    <div className="text-lg font-semibold text-gray-800">5 workouts</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E8F4FC] rounded-full flex items-center justify-center text-xl">
                                    ⏱️
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Exercise Minutes/Week</div>
                                    <div className="text-lg font-semibold text-gray-800">150 min</div>
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
                                <div className="text-xl font-semibold text-gray-800">180 lbs</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Current Weight</div>
                                <div className="text-xl font-semibold text-gray-800">172 lbs</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Goal Weight</div>
                                <div className="text-xl font-semibold text-[#0073CF]">160 lbs</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>8 lbs lost • 12 lbs to go</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div className="bg-[#4CAF50] h-3 rounded-full" style={{ width: '40%' }}></div>
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
                                <div className="text-lg font-semibold text-gray-800">Lose 1 lb per week</div>
                                <div className="text-sm text-gray-500">Recommended for sustainable weight loss</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Daily calorie deficit</div>
                                <div className="text-lg font-semibold text-[#0073CF]">-500 cal</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
