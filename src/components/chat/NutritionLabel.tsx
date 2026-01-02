export default function NutritionLabel({ data }: { data: any }) {
    if (!data) return null;

    return (
        <div className="my-4 border-2 border-gray-800 bg-black p-4 rounded-lg font-mono max-w-sm">
            <h3 className="text-xl font-black border-b-4 border-gray-800 pb-1 mb-2">Nutrition Facts</h3>
            <div className="flex justify-between text-sm mb-1">
                <span>Analysis Origin</span>
                <span className="font-bold">AI Metabolic</span>
            </div>
            <div className="h-2 bg-gray-800 my-2"></div>

            <div className="flex justify-between text-2xl font-bold mb-2">
                <span>Calories</span>
                <span>{data.calories || '~'}</span>
            </div>

            <div className="h-1 bg-gray-800 my-2"></div>

            <div className="space-y-1 text-sm">
                <div className="flex justify-between border-b border-gray-900 pb-1">
                    <span className="font-bold">Total Fat</span>
                    <span>{data.fat}g</span>
                </div>
                <div className="flex justify-between border-b border-gray-900 pb-1">
                    <span className="font-bold">Total Carbohydrate</span>
                    <span>{data.carbs}g</span>
                </div>
                <div className="flex justify-between border-b border-gray-900 pb-1">
                    <span className="font-bold">Protein</span>
                    <span>{data.protein}g</span>
                </div>
            </div>

            <div className="h-4 bg-gray-800 my-2"></div>

            <div className="flex justify-between items-center text-sm">
                <span className="font-bold uppercase text-gray-400">Insulin Load</span>
                <span className={`px-2 py-0.5 rounded text-black font-bold ${data.insulin_load === 'high' ? 'bg-red-500' :
                        data.insulin_load === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                    }`}>
                    {data.insulin_load?.toUpperCase() || 'UNKNOWN'}
                </span>
            </div>
        </div>
    );
}
