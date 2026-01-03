import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { METABOLIC_COACH_PROMPT } from '@/lib/prompts';
import { getKnowledgeItem } from '@/lib/knowledge';

// Allow streaming responses up to 60 seconds for complex reasoning
// Allow streaming responses up to 5 minutes (300s) for complex reasoning models
export const maxDuration = 300;

// Basic in-memory rate limiter for Demo Mode
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20; // 20 requests per hour for guest mode

const RequestSchema = z.object({
    messages: z.array(z.any()),
    conversationId: z.string().uuid().optional(),
    demoConfig: z.object({
        diet_mode: z.string().optional(),
        active_coach: z.string().optional(),
        name: z.string().optional(),
        biometrics: z.any().optional(),
    }).optional(),
});

export async function POST(req: Request) {
    const body = await req.json();
    const result_validate = RequestSchema.safeParse(body);

    if (!result_validate.success) {
        return new Response(JSON.stringify({ error: 'Invalid Request Data', details: result_validate.error.format() }), { status: 400 });
    }

    const { messages, demoConfig, conversationId } = result_validate.data;
    const supabase = await createClient();

    // CHECK: API Key Existence
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('placeholder')) {
        return new Response('System Alert: OpenRouter API Key is missing. Please edit .env.local and add your key.', { status: 500 });
    }

    // 1. Authenticate User (Optional for Demo)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 1.5 Rate Limiting for Demo Mode (Unauthenticated)
    if (!user) {
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const now = Date.now();
        const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

        if (now - record.lastReset > RATE_LIMIT_WINDOW) {
            record.count = 0;
            record.lastReset = now;
        }

        if (record.count >= MAX_REQUESTS) {
            return new Response('Rate limit exceeded for Guest Mode. Please sign in for unlimited access.', { status: 429 });
        }

        record.count++;
        rateLimitMap.set(ip, record);
    }

    // DIAGNOSTIC LOGGING
    console.log('[API/Chat] Request processed', {
        hasUser: !!user,
        userId: user?.id,
        authError: authError?.message
    });

    // 2. Fetch User Profile
    let userProfile: { diet_mode: string; safety_flags: Record<string, boolean>; active_coach?: string;[key: string]: any } = { diet_mode: 'standard', safety_flags: {}, active_coach: 'fat_loss' };
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

    // 5. Load Domain Knowledge (The Knowledge Vault)
    const constitution = await getKnowledgeItem('constitutions', userProfile.diet_mode || 'standard');
    const specialist = await getKnowledgeItem('specialists', userProfile.active_coach || 'fat_loss');

    const result = await streamText({
        model: openrouter(modelId),
        system: METABOLIC_COACH_PROMPT(userProfile, activeGoals ?? undefined, constitution, specialist),
        messages,
        onFinish: async (event) => {
            if (user && conversationId) {
                // Server-Side Persistence: Fallback/Primary mechanism
                // We trust the client to save the USER message, but we secure the ASSISTANT message here.
                try {
                    const { error } = await supabase.from('messages').insert({
                        conversation_id: conversationId,
                        role: 'assistant',
                        content: event.text,
                        tool_calls: event.toolCalls && event.toolCalls.length > 0 ? event.toolCalls : null,
                    });
                    if (error) console.error('[API/Chat] Server Save Error:', error);
                    else console.log('[API/Chat] Server Saved Assistant Message');
                } catch (e) {
                    console.error('[API/Chat] Server Save Exception:', e);
                }
            } else {
                console.log('[API/Chat] Skip Save: No User or ConversationId', { hasUser: !!user, conversationId });
            }
        },
        tools: {
            get_profile: tool({
                description: 'Get the user\'s profile, diet mode, and safety flags',
                parameters: z.object({}),
                execute: async () => {
                    return JSON.stringify(userProfile);
                },
            }),
            update_profile: tool({
                description: 'Update the user\'s profile, name, diet mode, or biometrics. Use when user says "My name is X", "I weigh Y", "Switch me to keto", etc. Changes are logged to history for future queries. For "low carb" use keto mode.',
                parameters: z.object({
                    diet_mode: z.enum(['standard', 'vegan', 'keto', 'carnivore', 'paleo', 'mediterranean', 'fruitarian', 'modified_keto']).optional().describe('The dietary approach. Use "keto" for low-carb or "modified_keto" for performance keto. Changes are logged to history.'),
                    active_coach: z.enum(['hypertrophy', 'fat_loss', 'longevity']).optional().describe('The specialist coach mode. Hypertrophy=Builder, Fat Loss=Shredder, Longevity=Healthspan.'),
                    safety_flags: z.record(z.boolean()).optional(),
                    name: z.string().optional(),
                    biometrics: z.object({
                        weight: z.number().optional().describe('Body weight (logged to history for tracking)'),
                        weight_unit: z.enum(['lbs', 'kg']).optional(),
                        height: z.number().optional().describe('Height in inches or cm'),
                        height_unit: z.enum(['in', 'cm']).optional(),
                        age: z.number().optional().describe('Age in years'),
                        birthdate: z.string().optional().describe('Birthday as YYYY-MM-DD string'),
                        sex: z.enum(['male', 'female', 'other']).optional(),
                        waist: z.number().optional(),
                        goal_weight: z.number().optional(),
                        activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
                        goals: z.array(z.string()).optional().describe('Fitness goals like "lose fat", "gain muscle"'),
                    }).passthrough().optional().describe('Body metrics - weight changes are logged to history'),
                }),
                execute: async ({ diet_mode, active_coach, safety_flags, name, biometrics }) => {
                    if (!user) {
                        console.warn('[API/Chat] Blocked Tool Execution (Demo Mode): update_profile');
                        return `[DEMO MODE] Profile update simulated: Name=${name}, Mode=${diet_mode}`;
                    }

                    // Fetch current profile for comparison and merging
                    const { data: currentProfile } = await supabase
                        .from('users_secure')
                        .select('diet_mode, active_coach, biometrics, name')
                        .eq('id', user.id)
                        .single();

                    const updates: any = {};
                    const loggedEvents: string[] = [];

                    // Handle diet mode change - LOG AS HISTORICAL EVENT
                    if (diet_mode && diet_mode !== currentProfile?.diet_mode) {
                        updates.diet_mode = diet_mode;
                        // Log diet switch to history
                        await supabase.from('metabolic_logs').insert({
                            user_id: user.id,
                            log_type: 'note',
                            content_raw: `Switched diet to ${diet_mode}`,
                            data_structured: {
                                event_type: 'diet_change',
                                old_mode: currentProfile?.diet_mode || 'standard',
                                new_mode: diet_mode,
                            }
                        });
                        loggedEvents.push(`diet → ${diet_mode}`);
                    }

                    // Handle active_coach change
                    if (active_coach && active_coach !== currentProfile?.active_coach) {
                        updates.active_coach = active_coach;
                        loggedEvents.push(`coach → ${active_coach}`);
                    }

                    if (safety_flags) updates.safety_flags = safety_flags;
                    if (name) updates.name = name;

                    if (biometrics) {
                        const existing = currentProfile?.biometrics || {};
                        updates.biometrics = { ...existing, ...biometrics };

                        // Handle weight change - LOG AS HISTORICAL EVENT
                        if (biometrics.weight) {
                            const unit = biometrics.weight_unit || 'lbs';
                            await supabase.from('metabolic_logs').insert({
                                user_id: user.id,
                                log_type: 'biometric',
                                content_raw: `Weighed ${biometrics.weight} ${unit}`,
                                data_structured: {
                                    event_type: 'weight_check',
                                    weight: biometrics.weight,
                                    unit: unit,
                                    previous_weight: existing.weight || null,
                                }
                            });
                            loggedEvents.push(`weight: ${biometrics.weight} ${unit}`);
                        }

                        // Handle waist measurement - LOG AS HISTORICAL EVENT
                        if (biometrics.waist) {
                            await supabase.from('metabolic_logs').insert({
                                user_id: user.id,
                                log_type: 'biometric',
                                content_raw: `Waist measurement: ${biometrics.waist} inches`,
                                data_structured: {
                                    event_type: 'waist_check',
                                    waist: biometrics.waist,
                                    previous_waist: existing.waist || null,
                                }
                            });
                            loggedEvents.push(`waist: ${biometrics.waist}"`);
                        }
                    }

                    // Only update if there are changes
                    if (Object.keys(updates).length === 0) {
                        return 'No changes detected.';
                    }

                    const { error } = await supabase
                        .from('users_secure')
                        .upsert({ id: user.id, ...updates })
                        .select();

                    if (error) return `Error: ${error.message}`;

                    const summary = loggedEvents.length > 0
                        ? `Profile updated and logged: ${loggedEvents.join(', ')}`
                        : 'Profile updated successfully.';
                    return summary;
                },
            }),
            log_activity: tool({
                description: 'Log a meal, workout, or biometric data to the Data Vault. EXECUTE THIS SILENTLY AND IMMEDIATELY when data is detected. DO NOT ASK FOR CONFIRMATION.',
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
                    if (!user) {
                        console.warn('[API/Chat] Blocked Tool Execution (Demo Mode): log_activity');
                        return `[DEMO MODE] Item NOT saved to Vault (Sign in to save). Analysis: ${JSON.stringify(data_structured)}`;
                    }

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
            delete_log: tool({
                description: 'Delete a logged entry from the Data Vault. Use when user says they didn\'t eat something, made a mistake, or wants to remove an entry. Can search by description or delete most recent entry of a type.',
                parameters: z.object({
                    log_id: z.string().optional().describe('Specific log ID to delete if known'),
                    search_text: z.string().optional().describe('Text to search for in the log content (e.g., "steak", "lunch")'),
                    log_type: z.enum(['meal', 'workout', 'blood_work', 'biometric', 'note']).optional(),
                    date: z.string().optional().describe('Date to search (YYYY-MM-DD format). Defaults to today if not specified.'),
                    delete_most_recent: z.boolean().optional().describe('If true, delete the most recent matching entry'),
                }),
                execute: async ({ log_id, search_text, log_type, date, delete_most_recent }) => {
                    if (!user) return '[DEMO MODE] Cannot delete logs. Sign in to enable data management.';

                    // If specific ID provided, delete directly
                    if (log_id) {
                        const { error } = await supabase
                            .from('metabolic_logs')
                            .delete()
                            .eq('id', log_id)
                            .eq('user_id', user.id);
                        return error ? `Error deleting: ${error.message}` : 'Entry deleted from Data Vault.';
                    }

                    // Otherwise, search for matching entries
                    const searchDate = date || new Date().toISOString().split('T')[0];
                    let query = supabase
                        .from('metabolic_logs')
                        .select('id, log_type, content_raw, data_structured, logged_at')
                        .eq('user_id', user.id)
                        .gte('logged_at', `${searchDate}T00:00:00`)
                        .lte('logged_at', `${searchDate}T23:59:59`)
                        .order('logged_at', { ascending: false });

                    if (log_type) query = query.eq('log_type', log_type);

                    const { data: logs, error: searchError } = await query;
                    if (searchError) return `Error searching: ${searchError.message}`;
                    if (!logs || logs.length === 0) return 'No matching entries found to delete.';

                    // Filter by search text if provided
                    let matches = logs;
                    if (search_text) {
                        const searchLower = search_text.toLowerCase();
                        matches = logs.filter(log =>
                            log.content_raw?.toLowerCase().includes(searchLower) ||
                            JSON.stringify(log.data_structured)?.toLowerCase().includes(searchLower)
                        );
                    }

                    if (matches.length === 0) return `No entries matching "${search_text}" found.`;

                    // Delete the most recent match (or first match)
                    const toDelete = matches[0];
                    console.log('[delete_log] Attempting to delete:', { id: toDelete.id, user_id: user.id, content: toDelete.content_raw?.substring(0, 30) });

                    const { error: deleteError, count } = await supabase
                        .from('metabolic_logs')
                        .delete()
                        .eq('id', toDelete.id)
                        .eq('user_id', user.id);  // CRITICAL: Must include user_id for RLS

                    console.log('[delete_log] Delete result:', { error: deleteError?.message, count });

                    if (deleteError) return `Error deleting: ${deleteError.message}`;
                    return `Deleted entry: "${toDelete.content_raw?.substring(0, 50)}..." (${toDelete.log_type} from ${new Date(toDelete.logged_at).toLocaleTimeString()})`;
                },
            }),
            update_log: tool({
                description: 'Update/correct an existing log entry. Use when user wants to fix a mistake like wrong portion size or calories.',
                parameters: z.object({
                    log_id: z.string().optional().describe('Specific log ID to update if known'),
                    search_text: z.string().optional().describe('Text to search for to find the log to update'),
                    date: z.string().optional().describe('Date to search (YYYY-MM-DD). Defaults to today.'),
                    updates: z.object({
                        calories: z.number().optional(),
                        protein: z.number().optional(),
                        fat: z.number().optional(),
                        carbs: z.number().optional(),
                        fiber: z.number().optional(),
                        notes: z.string().optional(),
                    }).describe('The corrected values'),
                }),
                execute: async ({ log_id, search_text, date, updates }) => {
                    if (!user) return '[DEMO MODE] Cannot update logs. Sign in to enable data management.';

                    let targetId = log_id;

                    // If no ID, search for the entry
                    if (!targetId && search_text) {
                        const searchDate = date || new Date().toISOString().split('T')[0];
                        const { data: logs } = await supabase
                            .from('metabolic_logs')
                            .select('id, content_raw, data_structured')
                            .eq('user_id', user.id)
                            .gte('logged_at', `${searchDate}T00:00:00`)
                            .lte('logged_at', `${searchDate}T23:59:59`)
                            .order('logged_at', { ascending: false });

                        const searchLower = search_text.toLowerCase();
                        const match = logs?.find(log =>
                            log.content_raw?.toLowerCase().includes(searchLower) ||
                            JSON.stringify(log.data_structured)?.toLowerCase().includes(searchLower)
                        );

                        if (!match) return `No entry matching "${search_text}" found.`;
                        targetId = match.id;
                    }

                    if (!targetId) return 'Please specify which entry to update (by description or ID).';

                    // Fetch current data to merge
                    const { data: current } = await supabase
                        .from('metabolic_logs')
                        .select('data_structured')
                        .eq('id', targetId)
                        .single();

                    const mergedData = { ...(current?.data_structured || {}), ...updates };

                    const { error } = await supabase
                        .from('metabolic_logs')
                        .update({ data_structured: mergedData })
                        .eq('id', targetId)
                        .eq('user_id', user.id);

                    return error ? `Error updating: ${error.message}` : `Entry updated with new values: ${JSON.stringify(updates)}`;
                },
            }),
            query_logs: tool({
                description: 'Query historical logs by date range. Use for "show me meals from last week", "what did I eat yesterday", "list my workouts this month".',
                parameters: z.object({
                    log_type: z.enum(['meal', 'workout', 'blood_work', 'biometric', 'note', 'all']).describe('Type of logs to retrieve, or "all" for everything'),
                    start_date: z.string().describe('Start date (YYYY-MM-DD format)'),
                    end_date: z.string().describe('End date (YYYY-MM-DD format)'),
                    limit: z.number().optional().describe('Maximum entries to return (default 50)'),
                }),
                execute: async ({ log_type, start_date, end_date, limit = 50 }) => {
                    if (!user) return JSON.stringify({ message: '[DEMO MODE] No history available. Sign in to access your data.' });

                    let query = supabase
                        .from('metabolic_logs')
                        .select('id, log_type, content_raw, data_structured, logged_at')
                        .eq('user_id', user.id)
                        .gte('logged_at', `${start_date}T00:00:00`)
                        .lte('logged_at', `${end_date}T23:59:59`)
                        .order('logged_at', { ascending: false })
                        .limit(limit);

                    if (log_type !== 'all') query = query.eq('log_type', log_type);

                    const { data: logs, error } = await query;
                    if (error) return JSON.stringify({ error: error.message });

                    return JSON.stringify({
                        count: logs?.length || 0,
                        date_range: { start: start_date, end: end_date },
                        entries: logs?.map(log => ({
                            id: log.id,
                            type: log.log_type,
                            description: log.content_raw,
                            data: log.data_structured,
                            logged_at: log.logged_at,
                        })) || [],
                    });
                },
            }),
            get_statistics: tool({
                description: 'Calculate statistics over a time period. Use for "average protein this month", "total calories this week", "how many workouts this year".',
                parameters: z.object({
                    metric: z.enum(['calories', 'protein', 'fat', 'carbs', 'fiber', 'meals_count', 'workouts_count']).describe('What to calculate'),
                    aggregation: z.enum(['sum', 'average', 'max', 'min', 'count']).describe('Type of calculation'),
                    start_date: z.string().describe('Start date (YYYY-MM-DD)'),
                    end_date: z.string().describe('End date (YYYY-MM-DD)'),
                }),
                execute: async ({ metric, aggregation, start_date, end_date }) => {
                    if (!user) return JSON.stringify({ message: '[DEMO MODE] No statistics available. Sign in to track your data.' });

                    // For count-based metrics
                    if (metric === 'meals_count' || metric === 'workouts_count') {
                        const logType = metric === 'meals_count' ? 'meal' : 'workout';
                        const { count, error } = await supabase
                            .from('metabolic_logs')
                            .select('*', { count: 'exact', head: true })
                            .eq('user_id', user.id)
                            .eq('log_type', logType)
                            .gte('logged_at', `${start_date}T00:00:00`)
                            .lte('logged_at', `${end_date}T23:59:59`);

                        if (error) return JSON.stringify({ error: error.message });
                        return JSON.stringify({
                            metric,
                            value: count || 0,
                            period: { start: start_date, end: end_date },
                        });
                    }

                    // For nutrition metrics, fetch all meals and calculate
                    const { data: logs, error } = await supabase
                        .from('metabolic_logs')
                        .select('data_structured, logged_at')
                        .eq('user_id', user.id)
                        .eq('log_type', 'meal')
                        .gte('logged_at', `${start_date}T00:00:00`)
                        .lte('logged_at', `${end_date}T23:59:59`)
                        .limit(1000); // Safety limit to prevent OOM

                    if (error) return JSON.stringify({ error: error.message });
                    if (!logs || logs.length === 0) return JSON.stringify({ message: 'No data found for this period.', value: 0 });

                    // Extract values for the metric
                    const values = logs
                        .map(log => log.data_structured?.[metric])
                        .filter(v => typeof v === 'number') as number[];

                    if (values.length === 0) return JSON.stringify({ message: `No ${metric} data logged in this period.`, value: 0 });

                    let result: number;
                    switch (aggregation) {
                        case 'sum':
                            result = values.reduce((a, b) => a + b, 0);
                            break;
                        case 'average':
                            result = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                            break;
                        case 'max':
                            result = Math.max(...values);
                            break;
                        case 'min':
                            result = Math.min(...values);
                            break;
                        case 'count':
                            result = values.length;
                            break;
                    }

                    // Calculate daily average if requested for sum (more useful)
                    const days = Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    const dailyAverage = aggregation === 'sum' ? Math.round(result / days) : undefined;

                    return JSON.stringify({
                        metric,
                        aggregation,
                        value: result,
                        unit: metric === 'calories' ? 'kcal' : 'g',
                        entries_count: values.length,
                        days_in_period: days,
                        daily_average: dailyAverage,
                        period: { start: start_date, end: end_date },
                    });
                },
            }),
            get_profile_history: tool({
                description: 'Query historical profile changes. Use for "how many days on keto", "show my weight history", "when did I switch diets", "what diets have I tried".',
                parameters: z.object({
                    query_type: z.enum(['diet_history', 'weight_history', 'waist_history', 'all']).describe('Type of profile history to retrieve'),
                    start_date: z.string().describe('Start date (YYYY-MM-DD format)'),
                    end_date: z.string().describe('End date (YYYY-MM-DD format)'),
                }),
                execute: async ({ query_type, start_date, end_date }) => {
                    if (!user) return JSON.stringify({ message: '[DEMO MODE] No history available. Sign in to track your data.' });

                    // Build query based on type
                    let query = supabase
                        .from('metabolic_logs')
                        .select('id, log_type, content_raw, data_structured, logged_at')
                        .eq('user_id', user.id)
                        .gte('logged_at', `${start_date}T00:00:00`)
                        .lte('logged_at', `${end_date}T23:59:59`)
                        .order('logged_at', { ascending: true });

                    // Filter by event type
                    if (query_type === 'diet_history') {
                        query = query.eq('log_type', 'note');
                    } else if (query_type === 'weight_history' || query_type === 'waist_history') {
                        query = query.eq('log_type', 'biometric');
                    }

                    const { data: logs, error } = await query;
                    if (error) return JSON.stringify({ error: error.message });

                    // Filter and process based on query type
                    let results: any[] = [];

                    if (query_type === 'diet_history' || query_type === 'all') {
                        const dietChanges = logs?.filter(l => l.data_structured?.event_type === 'diet_change') || [];

                        // Calculate days on each diet
                        const dietDays: Record<string, number> = {};
                        for (let i = 0; i < dietChanges.length; i++) {
                            const current = dietChanges[i];
                            const nextChange = dietChanges[i + 1];
                            const startTime = new Date(current.logged_at).getTime();
                            const endTime = nextChange
                                ? new Date(nextChange.logged_at).getTime()
                                : new Date(`${end_date}T23:59:59`).getTime();
                            const days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
                            const mode = current.data_structured?.new_mode || 'standard';
                            dietDays[mode] = (dietDays[mode] || 0) + days;
                        }

                        results.push({
                            type: 'diet_history',
                            changes: dietChanges.map(d => ({
                                date: new Date(d.logged_at).toLocaleDateString(),
                                from: d.data_structured?.old_mode,
                                to: d.data_structured?.new_mode,
                            })),
                            days_per_diet: dietDays,
                        });
                    }

                    if (query_type === 'weight_history' || query_type === 'all') {
                        const weightChecks = logs?.filter(l => l.data_structured?.event_type === 'weight_check') || [];
                        const weights = weightChecks.map(w => ({
                            date: new Date(w.logged_at).toLocaleDateString(),
                            weight: w.data_structured?.weight,
                            unit: w.data_structured?.unit || 'lbs',
                        }));

                        // Calculate weight change
                        let weightChange = null;
                        if (weights.length >= 2) {
                            const first = weights[0].weight;
                            const last = weights[weights.length - 1].weight;
                            weightChange = {
                                start: first,
                                end: last,
                                change: +(last - first).toFixed(1),
                                unit: weights[0].unit,
                            };
                        }

                        results.push({
                            type: 'weight_history',
                            entries: weights,
                            weight_change: weightChange,
                            count: weights.length,
                        });
                    }

                    if (query_type === 'waist_history' || query_type === 'all') {
                        const waistChecks = logs?.filter(l => l.data_structured?.event_type === 'waist_check') || [];
                        results.push({
                            type: 'waist_history',
                            entries: waistChecks.map(w => ({
                                date: new Date(w.logged_at).toLocaleDateString(),
                                waist: w.data_structured?.waist,
                            })),
                            count: waistChecks.length,
                        });
                    }

                    return JSON.stringify({
                        period: { start: start_date, end: end_date },
                        results,
                    });
                },
            }),
        },
    });

    return result.toDataStreamResponse();
}
