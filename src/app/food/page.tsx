import Link from 'next/link';

// Get formatted date
const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const dailyGoals = {
    calories: 2000,
    carbs: 250,
    fat: 67,
    protein: 100,
    sodium: 2300,
    sugar: 50,
};

export default function FoodPage() {
    // All zeros for empty diary
    const mealTotals = {
        Breakfast: { calories: 0, carbs: 0, fat: 0, protein: 0, sodium: 0, sugar: 0 },
        Lunch: { calories: 0, carbs: 0, fat: 0, protein: 0, sodium: 0, sugar: 0 },
        Dinner: { calories: 0, carbs: 0, fat: 0, protein: 0, sodium: 0, sugar: 0 },
        Snacks: { calories: 0, carbs: 0, fat: 0, protein: 0, sodium: 0, sugar: 0 },
    };

    const totals = {
        calories: 0,
        carbs: 0,
        fat: 0,
        protein: 0,
        sodium: 0,
        sugar: 0,
    };

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-4">

                {/* Blue Header Bar */}
                <div className="bg-[#0073CF] text-white px-4 py-3 rounded-t-lg">
                    <div className="font-medium">Your Food Diary For:</div>
                    <div className="text-sm text-blue-100">{formattedDate}</div>
                </div>

                {/* Date Selector */}
                <div className="bg-white border-x border-gray-200 px-4 py-3 flex items-center justify-between">
                    <button className="text-[#0073CF] hover:underline text-sm flex items-center gap-1">
                        <span>◀</span> Previous Day
                    </button>
                    <div className="font-medium text-gray-800">{formattedDate}</div>
                    <button className="text-[#0073CF] hover:underline text-sm flex items-center gap-1">
                        Next Day <span>▶</span>
                    </button>
                </div>

                {/* Food Diary Table */}
                <div className="bg-white border border-gray-200 rounded-b-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                            {meals.map((meal) => (
                                <MealSection key={meal} mealName={meal} totals={mealTotals[meal as keyof typeof mealTotals]} />
                            ))}

                            {/* Totals Row */}
                            <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                                <td className="px-4 py-2 text-gray-800">Totals</td>
                                <td className="text-center py-2">{totals.calories}</td>
                                <td className="text-center py-2">{totals.carbs}</td>
                                <td className="text-center py-2">{totals.fat}</td>
                                <td className="text-center py-2">{totals.protein}</td>
                                <td className="text-center py-2">{totals.sodium}</td>
                                <td className="text-center py-2">{totals.sugar}</td>
                            </tr>

                            {/* Daily Goal Row */}
                            <tr className="border-t border-gray-200">
                                <td className="px-4 py-2 text-gray-600">Your Daily Goal</td>
                                <td className="text-center py-2 text-gray-600">{dailyGoals.calories}</td>
                                <td className="text-center py-2 text-gray-600">{dailyGoals.carbs}</td>
                                <td className="text-center py-2 text-gray-600">{dailyGoals.fat}</td>
                                <td className="text-center py-2 text-gray-600">{dailyGoals.protein}</td>
                                <td className="text-center py-2 text-gray-600">{dailyGoals.sodium}</td>
                                <td className="text-center py-2 text-gray-600">{dailyGoals.sugar}</td>
                            </tr>

                            {/* Remaining Row */}
                            <tr className="border-t border-gray-200 font-semibold text-green-600">
                                <td className="px-4 py-2">Remaining</td>
                                <td className="text-center py-2">{dailyGoals.calories - totals.calories}</td>
                                <td className="text-center py-2">{dailyGoals.carbs - totals.carbs}</td>
                                <td className="text-center py-2">{dailyGoals.fat - totals.fat}</td>
                                <td className="text-center py-2">{dailyGoals.protein - totals.protein}</td>
                                <td className="text-center py-2">{dailyGoals.sodium - totals.sodium}</td>
                                <td className="text-center py-2">{dailyGoals.sugar - totals.sugar}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Complete Diary Button */}
                <div className="mt-4 text-center">
                    <button className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors">
                        Complete This Entry
                    </button>
                </div>
            </div>
        </div>
    );
}

interface NutrientTotals {
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
    sodium: number;
    sugar: number;
}

function MealSection({ mealName, totals }: { mealName: string; totals: NutrientTotals }) {
    return (
        <>
            {/* Meal Header */}
            <tr className="bg-[#F6F6F6] border-t border-gray-200">
                <td className="px-4 py-2 font-semibold text-gray-800 w-1/3">{mealName}</td>
                <td className="text-center py-2 text-gray-600 text-xs w-[10%]">
                    <div>Calories</div>
                    <div className="text-gray-400">kcal</div>
                </td>
                <td className="text-center py-2 text-gray-600 text-xs w-[10%]">
                    <div>Carbs</div>
                    <div className="text-gray-400">g</div>
                </td>
                <td className="text-center py-2 text-gray-600 text-xs w-[10%]">
                    <div>Fat</div>
                    <div className="text-gray-400">g</div>
                </td>
                <td className="text-center py-2 text-gray-600 text-xs w-[10%]">
                    <div>Protein</div>
                    <div className="text-gray-400">g</div>
                </td>
                <td className="text-center py-2 text-gray-600 text-xs w-[10%]">
                    <div>Sodium</div>
                    <div className="text-gray-400">mg</div>
                </td>
                <td className="text-center py-2 text-gray-600 text-xs w-[10%]">
                    <div>Sugar</div>
                    <div className="text-gray-400">g</div>
                </td>
            </tr>

            {/* Empty entries placeholder */}
            <tr className="border-t border-gray-100">
                <td colSpan={7} className="px-4 py-4 text-gray-400 italic text-center">
                    No foods logged for {mealName.toLowerCase()}
                </td>
            </tr>

            {/* Meal Totals + Add Food Row */}
            <tr className="border-t border-gray-200 bg-gray-50">
                <td className="px-4 py-2">
                    <div className="flex justify-between items-center">
                        <Link href={`/food/add?meal=${mealName.toLowerCase()}`} className="text-[#0073CF] hover:underline text-sm">
                            Add Food
                        </Link>
                        <button className="text-[#0073CF] hover:underline text-sm">
                            Quick Tools ▼
                        </button>
                    </div>
                </td>
                <td className="text-center py-2 text-gray-600">{totals.calories}</td>
                <td className="text-center py-2 text-gray-600">{totals.carbs}</td>
                <td className="text-center py-2 text-gray-600">{totals.fat}</td>
                <td className="text-center py-2 text-gray-600">{totals.protein}</td>
                <td className="text-center py-2 text-gray-600">{totals.sodium}</td>
                <td className="text-center py-2 text-gray-600">{totals.sugar}</td>
            </tr>
        </>
    );
}
