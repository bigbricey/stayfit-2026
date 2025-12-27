import { NextRequest, NextResponse } from 'next/server';

const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

interface USDAFoodNutrient {
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
}

interface USDAFoodMeasure {
    disseminationText?: string;
    gramWeight: number;
    measureUnitName?: string;
    modifier?: string;
}

interface USDAFood {
    fdcId: number;
    description: string;
    dataType?: string;
    brandName?: string;
    brandOwner?: string;
    servingSize?: number;
    servingSizeUnit?: string;
    householdServingFullText?: string;
    foodNutrients: USDAFoodNutrient[];
    foodMeasures?: USDAFoodMeasure[];
}

interface ServingOption {
    label: string;
    grams: number;
}

interface NutritionResult {
    name: string;
    calories: number;      // per 100g
    protein: number;       // per 100g
    carbs: number;         // per 100g
    fat: number;           // per 100g
    fdcId: number;
    servingSize: number;
    servingSizeUnit: string;
    householdServing: string;
    servingOptions: ServingOption[];
    brandName?: string;
}

// Nutrient IDs from USDA
const NUTRIENT_IDS = {
    ENERGY: 1008,       // Calories (kcal)
    PROTEIN: 1003,      // Protein (g)
    CARBS: 1005,        // Carbohydrates (g)
    FAT: 1004,          // Total lipid/fat (g)
};

// Default serving options when USDA doesn't provide measures
const DEFAULT_SERVING_OPTIONS: ServingOption[] = [
    { label: '1 g', grams: 1 },
    { label: '1 oz', grams: 28.35 },
    { label: '100 g', grams: 100 },
    { label: '1 lb', grams: 453.6 },
];

function extractServingOptions(food: USDAFood): ServingOption[] {
    const options: ServingOption[] = [];

    // Add USDA-provided measures if available
    if (food.foodMeasures && food.foodMeasures.length > 0) {
        for (const measure of food.foodMeasures) {
            if (measure.gramWeight > 0) {
                const label = measure.disseminationText ||
                    measure.modifier ||
                    measure.measureUnitName ||
                    `${Math.round(measure.gramWeight)}g`;
                options.push({
                    label: label,
                    grams: measure.gramWeight,
                });
            }
        }
    }

    // Add default serving if USDA provides it
    if (food.servingSize && food.servingSizeUnit) {
        const servingLabel = food.householdServingFullText ||
            `1 serving (${food.servingSize}${food.servingSizeUnit})`;

        // Avoid duplicates
        if (!options.find(o => Math.abs(o.grams - food.servingSize!) < 0.1)) {
            options.unshift({
                label: servingLabel,
                grams: food.servingSize,
            });
        }
    }

    // Always include standard units
    const standardUnits = [
        { label: '1 g', grams: 1 },
        { label: '1 oz', grams: 28.35 },
        { label: '100 g', grams: 100 },
    ];

    for (const unit of standardUnits) {
        if (!options.find(o => o.label === unit.label)) {
            options.push(unit);
        }
    }

    // Sort by gram weight
    return options.sort((a, b) => a.grams - b.grams);
}

function extractNutrients(food: USDAFood): NutritionResult {
    const nutrients = food.foodNutrients || [];

    const findNutrient = (id: number): number => {
        const nutrient = nutrients.find(n => n.nutrientId === id);
        return nutrient?.value ?? 0;
    };

    const servingOptions = extractServingOptions(food);

    // Determine default serving
    const defaultServing = food.servingSize || 100;
    const defaultUnit = food.servingSizeUnit || 'g';
    const householdServing = food.householdServingFullText || `${defaultServing}${defaultUnit}`;

    return {
        name: food.description,
        calories: findNutrient(NUTRIENT_IDS.ENERGY),      // Keep decimals for calculation accuracy
        protein: findNutrient(NUTRIENT_IDS.PROTEIN),
        carbs: findNutrient(NUTRIENT_IDS.CARBS),
        fat: findNutrient(NUTRIENT_IDS.FAT),
        fdcId: food.fdcId,
        servingSize: defaultServing,
        servingSizeUnit: defaultUnit,
        householdServing: householdServing,
        servingOptions: servingOptions,
        brandName: food.brandName || food.brandOwner,
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json(
            { error: 'Missing query parameter "q"' },
            { status: 400 }
        );
    }

    if (!USDA_API_KEY) {
        console.error('USDA_API_KEY not configured');
        return NextResponse.json(
            {
                error: 'Nutrition API not configured',
                debug: {
                    env_key_exists: !!process.env.USDA_API_KEY,
                    key_length: process.env.USDA_API_KEY?.length || 0,
                    node_env: process.env.NODE_ENV,
                }
            },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(
            `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=15`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 86400 }, // Cache for 24 hours
            }
        );

        if (!response.ok) {
            throw new Error(`USDA API error: ${response.status}`);
        }

        const data = await response.json();
        const foods: USDAFood[] = data.foods || [];

        // Priority order for data types (lower = higher priority)
        const dataTypePriority: Record<string, number> = {
            'SR Legacy': 1,           // Standard Reference - whole foods
            'Foundation': 2,          // Foundation foods - detailed whole foods
            'Survey (FNDDS)': 3,      // Survey data - prepared foods
            'Branded': 4,             // Branded products - often seasonings/sauces
        };

        // Sort by data type priority, then filter out obvious non-foods
        const sortedFoods = foods
            .filter(food => {
                // Filter out seasonings/spices that might have misleading names
                const serving = food.servingSize || 100;
                const unit = food.servingSizeUnit || 'g';
                // If serving size is tiny (< 5g) and it's branded, it's likely a seasoning
                if (food.dataType === 'Branded' && serving < 5 && unit === 'g') {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const priorityA = dataTypePriority[a.dataType || 'Branded'] || 5;
                const priorityB = dataTypePriority[b.dataType || 'Branded'] || 5;
                return priorityA - priorityB;
            });

        // Extract nutrition from sorted results
        const results: NutritionResult[] = sortedFoods
            .slice(0, 10)
            .map(extractNutrients);

        return NextResponse.json({
            query,
            results,
            totalHits: data.totalHits || 0,
        });
    } catch (error) {
        console.error('Nutrition API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch nutrition data' },
            { status: 500 }
        );
    }
}
