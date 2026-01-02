'use client';

interface NutritionData {
    food_name?: string;
    serving_size?: string;
    calories?: number;
    fat?: number;
    saturated_fat?: number;
    carbs?: number;
    fiber?: number;
    sugar?: number;
    protein?: number;
    sodium?: number;
    potassium?: number;
    magnesium?: number;
    cholesterol?: number;
    insulin_load?: 'low' | 'medium' | 'high';
    metabolic_grade?: 'A' | 'B' | 'C' | 'D' | 'F';
}

export default function NutritionLabel({ data }: { data: NutritionData }) {
    if (!data) return null;

    const gradeColors: Record<string, string> = {
        'A': 'bg-emerald-500',
        'B': 'bg-green-500',
        'C': 'bg-yellow-500',
        'D': 'bg-orange-500',
        'F': 'bg-red-500',
    };

    const insulinColors: Record<string, string> = {
        'low': 'bg-emerald-500 text-black',
        'medium': 'bg-yellow-500 text-black',
        'high': 'bg-red-500 text-white',
    };

    return (
        <div className="my-4 bg-white text-black p-4 rounded-lg font-sans max-w-xs border-4 border-black">
            {/* Header */}
            <div className="text-3xl font-black leading-tight border-b-8 border-black pb-1">
                Nutrition Facts
            </div>
            
            {/* Food Name */}
            {data.food_name && (
                <div className="text-sm font-bold mt-1 border-b border-gray-400 pb-1">
                    {data.food_name}
                </div>
            )}
            
            {/* Serving Size */}
            <div className="flex justify-between text-xs border-b border-gray-400 py-1">
                <span className="font-bold">Serving Size</span>
                <span>{data.serving_size || '1 serving'}</span>
            </div>
            
            {/* Thick divider */}
            <div className="h-2 bg-black my-1"></div>
            
            {/* Calories - Big and Bold */}
            <div className="flex justify-between items-baseline border-b border-gray-400 py-1">
                <span className="text-xl font-black">Calories</span>
                <span className="text-3xl font-black">{data.calories ?? '~'}</span>
            </div>
            
            {/* Daily Value Header */}
            <div className="text-right text-[10px] border-b border-gray-400 py-0.5">
                % Daily Value*
            </div>
            
            {/* Macros */}
            <div className="space-y-0">
                <NutrientRow label="Total Fat" value={data.fat} unit="g" bold dailyValue={data.fat ? Math.round((data.fat / 78) * 100) : undefined} />
                <NutrientRow label="Saturated Fat" value={data.saturated_fat} unit="g" indent dailyValue={data.saturated_fat ? Math.round((data.saturated_fat / 20) * 100) : undefined} />
                <NutrientRow label="Cholesterol" value={data.cholesterol} unit="mg" bold dailyValue={data.cholesterol ? Math.round((data.cholesterol / 300) * 100) : undefined} />
                <NutrientRow label="Sodium" value={data.sodium} unit="mg" bold dailyValue={data.sodium ? Math.round((data.sodium / 2300) * 100) : undefined} />
                <NutrientRow label="Total Carbs" value={data.carbs} unit="g" bold dailyValue={data.carbs ? Math.round((data.carbs / 275) * 100) : undefined} />
                <NutrientRow label="Dietary Fiber" value={data.fiber} unit="g" indent dailyValue={data.fiber ? Math.round((data.fiber / 28) * 100) : undefined} />
                <NutrientRow label="Total Sugars" value={data.sugar} unit="g" indent />
                <NutrientRow label="Protein" value={data.protein} unit="g" bold />
            </div>
            
            {/* Thick divider before minerals */}
            <div className="h-2 bg-black my-1"></div>
            
            {/* Micronutrients */}
            <div className="space-y-0">
                <NutrientRow label="Potassium" value={data.potassium} unit="mg" dailyValue={data.potassium ? Math.round((data.potassium / 4700) * 100) : undefined} />
                <NutrientRow label="Magnesium" value={data.magnesium} unit="mg" dailyValue={data.magnesium ? Math.round((data.magnesium / 420) * 100) : undefined} />
            </div>
            
            {/* Thick divider */}
            <div className="h-2 bg-black my-1"></div>
            
            {/* Metabolic Indicators */}
            <div className="flex justify-between items-center py-2 gap-2">
                {data.insulin_load && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600">Insulin Load</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${insulinColors[data.insulin_load] || 'bg-gray-400'}`}>
                            {data.insulin_load.toUpperCase()}
                        </span>
                    </div>
                )}
                {data.metabolic_grade && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600">Grade</span>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-sm ${gradeColors[data.metabolic_grade] || 'bg-gray-400'}`}>
                            {data.metabolic_grade}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="text-[9px] text-gray-500 border-t border-gray-300 pt-1 mt-1">
                * AI Metabolic Estimate - Actual values may vary
            </div>
        </div>
    );
}

function NutrientRow({ 
    label, 
    value, 
    unit, 
    bold, 
    indent,
    dailyValue 
}: { 
    label: string; 
    value?: number; 
    unit: string; 
    bold?: boolean;
    indent?: boolean;
    dailyValue?: number;
}) {
    if (value === undefined || value === null) return null;
    
    return (
        <div className={`flex justify-between border-b border-gray-300 py-0.5 text-xs ${indent ? 'pl-4' : ''}`}>
            <span className={bold ? 'font-bold' : ''}>{label} {value}{unit}</span>
            {dailyValue !== undefined && (
                <span className="font-bold">{dailyValue}%</span>
            )}
        </div>
    );
}
