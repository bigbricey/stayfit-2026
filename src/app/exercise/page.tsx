import Link from 'next/link';

const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

export default function ExercisePage() {
    // Mock data - empty for new diary
    const cardioExercises: Array<{ name: string; minutes: number; caloriesBurned: number }> = [];
    const strengthExercises: Array<{ name: string; sets: number; reps: number; weight: number }> = [];

    const totalCardioMinutes = cardioExercises.reduce((sum, e) => sum + e.minutes, 0);
    const totalCaloriesBurned = cardioExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-4">

                {/* Blue Header Bar */}
                <div className="bg-[#0073CF] text-white px-4 py-3 rounded-t-lg">
                    <div className="font-medium">Your Exercise Diary For:</div>
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

                {/* Cardiovascular Section */}
                <div className="bg-white border-x border-b border-gray-200">
                    {/* Section Header */}
                    <div className="bg-[#E8F4FC] px-4 py-2 flex items-center justify-between border-t border-gray-200">
                        <span className="font-semibold text-gray-800">Cardiovascular</span>
                        <div className="flex gap-4 text-sm">
                            <Link href="/exercise/add?type=cardio" className="text-[#0073CF] hover:underline">
                                Add Exercise
                            </Link>
                            <button className="text-[#0073CF] hover:underline">
                                Quick Tools ▼
                            </button>
                        </div>
                    </div>

                    {/* Cardio Table */}
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-2 font-medium text-gray-600 w-1/2">Exercise</th>
                                <th className="text-center px-4 py-2 font-medium text-gray-600">Minutes</th>
                                <th className="text-center px-4 py-2 font-medium text-gray-600">Calories Burned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cardioExercises.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-gray-400 italic text-center">
                                        No cardiovascular exercises logged
                                    </td>
                                </tr>
                            ) : (
                                cardioExercises.map((exercise, idx) => (
                                    <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-2 text-gray-800">{exercise.name}</td>
                                        <td className="text-center px-4 py-2">{exercise.minutes}</td>
                                        <td className="text-center px-4 py-2">{exercise.caloriesBurned}</td>
                                    </tr>
                                ))
                            )}
                            {/* Totals Row */}
                            <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                                <td className="px-4 py-2 text-right text-gray-600">Totals:</td>
                                <td className="text-center px-4 py-2">{totalCardioMinutes} minutes</td>
                                <td className="text-center px-4 py-2">{totalCaloriesBurned}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Strength Training Section */}
                <div className="bg-white border-x border-b border-gray-200 rounded-b-lg">
                    {/* Section Header */}
                    <div className="bg-[#E8F4FC] px-4 py-2 flex items-center justify-between border-t border-gray-200">
                        <span className="font-semibold text-gray-800">Strength Training</span>
                        <div className="flex gap-4 text-sm">
                            <Link href="/exercise/add?type=strength" className="text-[#0073CF] hover:underline">
                                Add Exercise
                            </Link>
                            <button className="text-[#0073CF] hover:underline">
                                Quick Tools ▼
                            </button>
                        </div>
                    </div>

                    {/* Strength Table */}
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-2 font-medium text-gray-600 w-1/2">Exercise</th>
                                <th className="text-center px-4 py-2 font-medium text-gray-600">Sets</th>
                                <th className="text-center px-4 py-2 font-medium text-gray-600">Reps/Set</th>
                                <th className="text-center px-4 py-2 font-medium text-gray-600">Weight/Set</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strengthExercises.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-4 text-gray-400 italic text-center">
                                        No strength training exercises logged
                                    </td>
                                </tr>
                            ) : (
                                strengthExercises.map((exercise, idx) => (
                                    <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-2 text-gray-800">{exercise.name}</td>
                                        <td className="text-center px-4 py-2">{exercise.sets}</td>
                                        <td className="text-center px-4 py-2">{exercise.reps}</td>
                                        <td className="text-center px-4 py-2">{exercise.weight} lbs</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary Card */}
                <div className="mt-4 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-600 text-sm">Total Calories Burned</div>
                            <div className="text-2xl font-bold text-[#0073CF]">{totalCaloriesBurned}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-600 text-sm">Total Exercise Time</div>
                            <div className="text-xl font-semibold text-gray-800">{totalCardioMinutes} min</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-4 justify-center">
                    <button className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors">
                        Complete This Entry
                    </button>
                    <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-300 transition-colors">
                        Print Preview
                    </button>
                </div>
            </div>
        </div>
    );
}
