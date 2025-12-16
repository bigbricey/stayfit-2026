import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { saveFoodLog } from '@/lib/actions/food';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // The System Prompt (Pass 1: Neutral Clerk)
    const systemPrompt = `
You are a Nutrition Data Clerk for 'Stay Fit with AI'. 

CORE RESPONSIBILITY:
Your ONLY job is to extract food items from user text and log them using the 'log_food' tool.
You are the FIRST STEP in a data pipeline.

RULES:
1. Extract: Identify food items, quantities, and units.
2. Estimate (Fuzzy Logic): If user says 'a handful of nuts', estimate standard USDA serving (28g) and set is_estimated: true.
3. Normalize: Convert all quantities to metric (grams) for database consistency.
4. Macros: Use your internal knowledge to calculate calories, protein, carbs, and fat for each item.
5. Silence: If the user says "I ate X", DO NOT reply with text. IMMEDIATELY call the 'log_food' tool.
6. Queries: If the user asks a question ("How much protein is in egg?"), answer normally with text.

DO NOT hallucinate API calls. Just use your internal knowledge for now (MVP).`;

    const result = await streamText({
        model: openai('gpt-4o'), // Or standard-llm via OpenRouter if configured
        system: systemPrompt,
        messages,
        tools: {
            log_food: tool({
                description: 'Logs food items to the database when the user says they ate something.',
                parameters: z.object({
                    items: z.array(z.object({
                        name: z.string().describe('Name of the food item, e.g. "Scrambled Eggs"'),
                        weight_g: z.number().describe('Estimated weight in grams'),
                        calories: z.number(),
                        protein: z.number(),
                        carbs: z.number(),
                        fat: z.number(),
                        is_estimated: z.boolean().describe('True if the quantity was vague/guessed'),
                    })),
                }),
                execute: async ({ items }) => {
                    // 1. Get the original user text (last message) - *Simplified for MVP*
                    // Ideally we pass context, but here we just process the tool args.
                    const rawInput = messages[messages.length - 1].content;

                    try {
                        // 2. Call the Server Action
                        const savedLog = await saveFoodLog(rawInput, items);
                        return savedLog; // This JSON returns to the client to render <FoodReceipt />
                    } catch (e) {
                        console.error(e);
                        return { error: 'Failed to save log. Please try again.' };
                    }
                },
            }),
        },
    });

    return result.toDataStreamResponse();
}
