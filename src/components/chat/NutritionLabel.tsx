'use client';

interface NutritionData {
    food_name?: string;
    serving_size?: string;
    is_summary?: boolean;
    days_count?: number;
    calories?: number;
    avg_calories?: number;
    fat?: number;
    avg_fat?: number;
    saturated_fat?: number;
    avg_saturated_fat?: number;
    trans_fat?: number;
    avg_trans_fat?: number;
    carbs?: number;
    avg_carbs?: number;
    fiber?: number;
    avg_fiber?: number;
    sugar?: number;
    avg_sugar?: number;
    protein?: number;
    avg_protein?: number;
    sodium?: number;
    avg_sodium?: number;
    potassium?: number;
    avg_potassium?: number;
    magnesium?: number;
    avg_magnesium?: number;
    calcium?: number;
    avg_calcium?: number;
    iron?: number;
    avg_iron?: number;
    vitamin_d?: number;
    avg_vitamin_d?: number;
    cholesterol?: number;
    avg_cholesterol?: number;
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

    const isSummary = data.is_summary || !!data.days_count;

    return (
        <div className="my-4 bg-white text-black p-4 rounded-lg font-sans max-w-sm border-4 border-black shadow-2xl">
            {/* Header */}
            <div className="text-3xl font-black leading-tight border-b-8 border-black pb-1">
                {isSummary ? 'Summary Report' : 'Nutrition Facts'}
            </div>

            {/* Title / Food Name */}
            <div className="text-sm font-bold mt-1 border-b border-gray-400 pb-1">
                {data.food_name === 'Daily Totals' ? 'Personal Daily Totals' : (data.food_name || (isSummary ? `Logs for last ${data.days_count || 7} days` : 'Item Details'))}
            </div>

            {/* Context Line */}
            <div className="flex justify-between text-xs border-b border-gray-400 py-1">
                <span className="font-bold">{isSummary ? 'Duration' : 'Serving Size'}</span>
                <span>{isSummary ? `${data.days_count || 7} days` : (data.serving_size || '1 serving')}</span>
            </div>

            {/* Thick divider */}
            <div className="h-2 bg-black my-1"></div>

            {/* Calories - Handle Summary View */}
            <div className="flex justify-between items-baseline border-b border-gray-400 py-1">
                <div>
                    <span className="text-xl font-black">Calories</span>
                    {isSummary && <div className="text-[10px] text-gray-500 font-bold -mt-1 uppercase">Total Intake</div>}
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black">{data.calories ?? '~'}</span>
                    {data.avg_calories && (
                        <div className="text-xs font-bold text-gray-600">Avg: {Math.round(data.avg_calories)} / day</div>
                    )}
                </div>
            </div>

            {/* Column Headers for Summary */}
            <div className="flex justify-between text-[10px] border-b border-gray-400 py-0.5 font-bold uppercase">
                <span>Nutrient</span>
                <div className="flex gap-4">
                    <span>{isSummary ? 'Total' : 'Amount'}</span>
                    {isSummary && <span className="w-12 text-right text-emerald-600">Daily Avg</span>}
                    {!isSummary && <span>% DV*</span>}
                </div>
            </div>

            {/* Macros */}
            <div className="space-y-0">
                <NutrientRow
                    label="Total Fat"
                    value={data.fat}
                    avg={data.avg_fat}
                    unit="g"
                    bold
                    dailyValue={!isSummary && data.fat ? Math.round((data.fat / 78) * 100) : undefined}
                />
                <NutrientRow
                    label="Saturated Fat"
                    value={data.saturated_fat}
                    avg={data.avg_saturated_fat}
                    unit="g"
                    indent
                    dailyValue={!isSummary && data.saturated_fat ? Math.round((data.saturated_fat / 20) * 100) : undefined}
                />
                <NutrientRow
                    label="Trans Fat"
                    value={data.trans_fat}
                    avg={data.avg_trans_fat}
                    unit="g"
                    indent
                />
                <NutrientRow
                    label="Cholesterol"
                    value={data.cholesterol}
                    avg={data.avg_cholesterol}
                    unit="mg"
                    bold
                    dailyValue={!isSummary && data.cholesterol ? Math.round((data.cholesterol / 300) * 100) : undefined}
                />
                <NutrientRow
                    label="Sodium"
                    value={data.sodium}
                    avg={data.avg_sodium}
                    unit="mg"
                    bold
                    dailyValue={!isSummary && data.sodium ? Math.round((data.sodium / 2300) * 100) : undefined}
                />
                <NutrientRow
                    label="Total Carbs"
                    value={data.carbs}
                    avg={data.avg_carbs}
                    unit="g"
                    bold
                    dailyValue={!isSummary && data.carbs ? Math.round((data.carbs / 275) * 100) : undefined}
                />
                <NutrientRow
                    label="Dietary Fiber"
                    value={data.fiber}
                    avg={data.avg_fiber}
                    unit="g"
                    indent
                    dailyValue={!isSummary && data.fiber ? Math.round((data.fiber / 28) * 100) : undefined}
                />
                <NutrientRow label="Total Sugars" value={data.sugar} avg={data.avg_sugar} unit="g" indent />
                <NutrientRow label="Protein" value={data.protein} avg={data.avg_protein} unit="g" bold />
            </div>

            {/* Thick divider before minerals */}
            <div className="h-2 bg-black my-1"></div>

            {/* Micronutrients */}
            <div className="space-y-0">
                <NutrientRow label="Potassium" value={data.potassium} avg={data.avg_potassium} unit="mg" />
                {data.magnesium !== undefined && <NutrientRow label="Magnesium" value={data.magnesium} avg={data.avg_magnesium} unit="mg" />}
                <NutrientRow label="Calcium" value={data.calcium} avg={data.avg_calcium} unit="mg" />
                <NutrientRow label="Iron" value={data.iron} avg={data.avg_iron} unit="mg" />
                <NutrientRow label="Vitamin D" value={data.vitamin_d} avg={data.avg_vitamin_d} unit="mcg" />
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
                {isSummary ? '* Daily Average = Total / Days logged' : '* AI Metabolic Estimate - Actual values may vary'}
            </div>
        </div>
    );
}

function NutrientRow({
    label,
    value,
    avg,
    unit,
    bold,
    indent,
    dailyValue
}: {
    label: string;
    value?: number;
    avg?: number;
    unit: string;
    bold?: boolean;
    indent?: boolean;
    dailyValue?: number;
}) {
    if (value === undefined || value === null) return null;

    return (
        <div className={`flex justify-between border-b border-gray-300 py-0.5 text-xs ${indent ? 'pl-4' : ''}`}>
            <span className={bold ? 'font-bold' : ''}>{label}</span>
            <div className="flex gap-4">
                <span className="font-bold">{value}{unit}</span>
                {avg !== undefined && (
                    <span className="w-12 text-right font-bold text-emerald-600">{Math.round(avg)}{unit}</span>
                )}
                {dailyValue !== undefined && (
                    <span className="w-10 text-right font-bold">{dailyValue}%</span>
                )}
            </div>
        </div>
    );
}
