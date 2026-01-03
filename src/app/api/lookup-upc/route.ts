import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const upc = searchParams.get('upc');

    if (!upc) {
        return NextResponse.json({ error: 'UPC is required' }, { status: 400 });
    }

    try {
        console.log(`[API/LookupUPC] Fetching data for UPC: ${upc}`);
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${upc}.json`);

        if (!response.ok) {
            throw new Error(`Open Food Facts API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 0 || !data.product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const product = data.product;

        // Extract relevant nutritional data
        const nutrition = {
            name: product.product_name || 'Unknown Product',
            brand: product.brands || 'Unknown Brand',
            calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0,
            protein: product.nutriments?.protein_100g || product.nutriments?.protein || 0,
            fat: product.nutriments?.fat_100g || product.nutriments?.fat || 0,
            carbs: product.nutriments?.carbohydrates_100g || product.nutriments?.carbohydrates || 0,
            serving_size: product.serving_size || '100g',
            image: product.image_url,
        };

        return NextResponse.json(nutrition);
    } catch (error: any) {
        console.error('[API/LookupUPC] Error:', error);
        return NextResponse.json({ error: 'Failed to lookup product data' }, { status: 500 });
    }
}
