import { NextRequest, NextResponse } from 'next/server';

const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `${USDA_API_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=25&api_key=${USDA_API_KEY}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error('USDA API request failed');
        }

        const data = await response.json();

        // Transform USDA response to simpler format
        const foods = data.foods?.map((food: {
            fdcId: number;
            description: string;
            brandName?: string;
            brandOwner?: string;
            servingSize?: number;
            servingSizeUnit?: string;
            foodNutrients?: Array<{
                nutrientId: number;
                nutrientName: string;
                value: number;
                unitName: string;
            }>;
        }) => {
            // Extract key nutrients
            const getNutrient = (id: number) => {
                const nutrient = food.foodNutrients?.find(n => n.nutrientId === id);
                return nutrient?.value || 0;
            };

            return {
                fdcId: food.fdcId,
                name: food.description,
                brand: food.brandName || food.brandOwner || null,
                servingSize: food.servingSize || 100,
                servingUnit: food.servingSizeUnit || 'g',
                calories: getNutrient(1008), // Energy (kcal)
                protein: getNutrient(1003), // Protein
                fat: getNutrient(1004), // Total fat
                carbs: getNutrient(1005), // Carbohydrates
                fiber: getNutrient(1079), // Fiber
                sugar: getNutrient(2000), // Total sugars
                sodium: getNutrient(1093), // Sodium
            };
        }) || [];

        return NextResponse.json({ foods, totalHits: data.totalHits });
    } catch (error) {
        console.error('USDA API error:', error);
        return NextResponse.json(
            { error: 'Failed to search foods' },
            { status: 500 }
        );
    }
}
