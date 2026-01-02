import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { METABOLIC_COACH_PROMPT } from '@/lib/prompts';

// Allow streaming responses up to 60 seconds for complex reasoning
export const maxDuration = 60;

export async function POST(req: Request) {
    const { messages, demoConfig } = await req.json();
    const supabase = await createClient();

    // CHECK: API Key Existence
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('placeholder')) {
        return new Response('System Alert: OpenRouter API Key is missing. Please edit .env.local and add your key.', { status: 500 });
    }

    // 1. Authenticate User (Optional for Demo)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Fetch User Profile
    let userProfile = { diet_mode: 'standard', safety_flags: {} };
    let activeGoals: any[] = [];

    if (user) {
        const { data: profile } = await supabase
            .from('users_secure')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profile) userProfile = profile;

        const { data: goals } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active');
        if (goals) activeGoals = goals;
    } else if (demoConfig) {
        // Apply Demo Config to System Prompt
        userProfile = { ...userProfile, ...demoConfig };
    }

    // 4. Initialize The Brain
    // Explicitly configure OpenRouter to prevent SDK from defaulting to OpenAI
    const openrouter = createOpenAI({
        baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Model is configurable via OPENAI_MODEL env var (e.g., "google/gemini-2.5-pro")
    // Model is configurable via OPENAI_MODEL env var
    const modelId = process.env.OPENAI_MODEL || 'x-ai/grok-4.1-fast';

    const result = await streamText({
        model: openrouter(modelId),
        system: METABOLIC_COACH_PROMPT(userProfile, activeGoals ?? undefined),
        messages,
        tools: {
            get_profile: tool({
                description: 'Get the user\'s profile, diet mode, and safety flags',
                parameters: z.object({}),
                execute: async () => {
                    return JSON.stringify(userProfile);
                },
            }),
            update_profile: tool({
                description: 'Update the user\'s diet mode or preferences. Examples: "I\'m going Keto", "Switch me to Carnivore", "Enable seed oil warnings"',
                parameters: z.object({
                    diet_mode: z.enum(['standard', 'vegan', 'keto', 'carnivore', 'paleo', 'mediterranean', 'fruitarian']).optional(),
                    safety_flags: z.record(z.boolean()).optional(),
                }),
                execute: async ({ diet_mode, safety_flags }) => {
                    if (!user) return `[DEMO MODE] Profile update simulated: Mode=${diet_mode}, Flags=${JSON.stringify(safety_flags)}`;

                    const updates: any = {};
                    if (diet_mode) updates.diet_mode = diet_mode;
                    if (safety_flags) updates.safety_flags = safety_flags;

                    const { error } = await supabase
                        .from('users_secure')
                        .upsert({ id: user.id, ...updates })
                        .select();
                    return error ? `Error: ${error.message}` : 'Profile updated. I have adjusted my metabolic parameters accordingly.';
                },
            }),
            log_activity: tool({
                description: 'Log a meal, workout, or biometric data to the Data Vault. Call this ONLY after user confirms.',
                parameters: z.object({
                    log_type: z.enum(['meal', 'workout', 'blood_work', 'biometric', 'note']),
                    content_raw: z.string().describe('The original text input from user'),
                    data_structured: z.object({
                        calories: z.number().optional(),
                        protein: z.number().optional(),
                        fat: z.number().optional(),
                        carbs: z.number().optional(),
                        fiber: z.number().optional(),
                        items: z.array(z.string()).optional(),
                        notes: z.string().optional(),
                        insulin_load: z.enum(['high', 'medium', 'low', 'zero']).optional(),
                    }).describe('The AI-extracted JSON data'),
                }),
                execute: async ({ log_type, content_raw, data_structured }) => {
                    if (!user) return `[DEMO MODE] Item NOT saved to Vault (Sign in to save). Analysis: ${JSON.stringify(data_structured)}`;

                    const { error } = await supabase
                        .from('metabolic_logs')
                        .insert({
                            user_id: user.id,
                            log_type,
                            content_raw,
                            data_structured,
                        });
                    return error ? `Error logging data: ${error.message}` : 'Item secured in Data Vault.';
                },
            }),
            set_goal: tool({
                description: 'Set a new fitness or nutrition goal for the user. Examples: "I want to eat 150g protein daily", "My target is 2000 calories"',
                parameters: z.object({
                    metric: z.string().describe('The metric to track: "protein", "calories", "carbs", "fat", "weight"'),
                    target_value: z.number().describe('The target value to achieve'),
                    period: z.enum(['daily', 'weekly', 'monthly']).describe('How often this goal resets'),
                }),
                execute: async ({ metric, target_value, period }) => {
                    if (!user) return `[DEMO MODE] Goal simulated: ${target_value} ${metric}`;

                    // Deactivate existing goals for the same metric
                    await supabase
                        .from('goals')
                        .update({ status: 'archived' })
                        .eq('user_id', user.id)
                        .eq('metric', metric)
                        .eq('status', 'active');

                    // Create new goal
                    const { error } = await supabase
                        .from('goals')
                        .insert({
                            user_id: user.id,
                            metric,
                            target_value,
                            period,
                            status: 'active',
                        });
                    return error ? `Error creating goal: ${error.message}` : `Goal set: ${target_value}${metric === 'calories' ? '' : 'g'} ${metric} (${period}). I will track your progress.`;
                },
            }),
            get_daily_summary: tool({
                description: 'Get a summary of today\'s logged meals and progress toward goals.',
                parameters: z.object({}),
                execute: async () => {
                    if (!user) return JSON.stringify({ message: '[DEMO MODE] No history available.', totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } });

                    const today = new Date().toISOString().split('T')[0];

                    const { data: logs } = await supabase
                        .from('metabolic_logs')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('log_type', 'meal')
                        .gte('logged_at', `${today}T00:00:00`)
                        .lte('logged_at', `${today}T23:59:59`);

                    if (!logs || logs.length === 0) {
                        return JSON.stringify({ message: 'No meals logged today yet.', totals: { calories: 0, protein: 0, fat: 0, carbs: 0 }, goals: activeGoals });
                    }

                    const totals = logs.reduce((acc, log) => {
                        const d = log.data_structured || {};
                        return {
                            calories: acc.calories + (d.calories || 0),
                            protein: acc.protein + (d.protein || 0),
                            fat: acc.fat + (d.fat || 0),
                            carbs: acc.carbs + (d.carbs || 0),
                        };
                    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

                    return JSON.stringify({ totals, meals_count: logs.length, goals: activeGoals });
                },
            }),
        },
    });

    return result.toDataStreamResponse();
}
