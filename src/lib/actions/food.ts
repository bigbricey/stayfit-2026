'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface LogItem {
    name: string;
    weight_g: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    is_estimated: boolean;
}

export async function saveFoodLog(rawInput: string, items: LogItem[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // For MVP/Demo, we might allow anonymous, but ideal is auth.
        // For now, throw error if not logged in.
        // console.warn(\"No user found, proceeding with mock ID for prototype\");
        // const mockUserId = '00000000-0000-0000-0000-000000000000';
        throw new Error('User must be logged in to save logs.');
    }

    // 1. Create the Parent Log
    const { data: logEntry, error: logError } = await supabase
        .from('food_logs')
        .insert({
            user_id: user.id,
            raw_input: rawInput,
        })
        .select()
        .single();

    if (logError) {
        console.error('Error creating food log:', logError);
        throw new Error('Failed to create food log');
    }

    // 2. Create the Items
    if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
            log_id: logEntry.id,
            user_id: user.id,
            name: item.name,
            weight_g: item.weight_g,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            is_estimated: item.is_estimated,
            source: 'ai_estimate', // Hardcoded for Pass 1 MVP
            confidence: 100 // Mock
        }));

        const { error: itemsError } = await supabase
            .from('log_items')
            .insert(itemsToInsert);

        if (itemsError) {
            console.error('Error inserting items:', itemsError);
            // Clean up parent log?
            throw new Error('Failed to log items');
        }
    }

    revalidatePath('/'); // Refresh cache

    // Return structure for UI
    return {
        log_id: logEntry.id,
        items: items,
        total_cals: items.reduce((sum, item) => sum + item.calories, 0)
    };
}
