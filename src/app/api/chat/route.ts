import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText, tool, Message } from 'ai';
import { z } from 'zod';
import { toZonedTime, fromZonedTime } from 'date-fns-tz'; // New imports
import { createClient } from '@/lib/supabase/server';
import { METABOLIC_COACH_PROMPT } from '@/lib/prompts';
import { getKnowledgeItem } from '@/lib/knowledge';
import { ContextManager } from '@/lib/memory/context-manager';
import { isAdmin, RATE_LIMIT } from '@/lib/config';

// Production-safe logging (suppressed in production unless explicitly enabled)
const isLoggingEnabled = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';
const log = (...args: unknown[]) => { if (isLoggingEnabled) console.log(...args); };
const logWarn = (...args: unknown[]) => { if (isLoggingEnabled) console.warn(...args); };

// Allow streaming responses up to 5 minutes (300s) for complex reasoning models
export const maxDuration = 300;

// Rate limiter structure for Demo Mode
// NOTE: In-memory rate limiting is stateless on serverless. For persistent rate limiting,
// migrate to Supabase using RATE_LIMIT.TABLE_NAME from config.ts
interface RateLimitRecord {
    count: number;
    lastReset: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW = RATE_LIMIT.WINDOW_MS;
const MAX_REQUESTS = RATE_LIMIT.MAX_GUEST_REQUESTS;

const RequestSchema = z.object({
    messages: z.array(z.any()),
    conversationId: z.string().uuid().optional(),
    clientTimezone: z.string().optional().default('UTC'), // New field
    demoConfig: z.object({
        diet_mode: z.string().optional(),
        active_coach: z.string().optional(),
        preferred_language: z.string().optional(),
        name: z.string().optional(),
        biometrics: z.any().optional(),
        cooldowns: z.record(z.string()).optional(),
    }).optional(),
}).passthrough();

export async function POST(req: Request) {
    const body = await req.json();

    // LOG RAW BODY FOR DEBUGGING
    log('[API/Chat] Received body keys:', Object.keys(body));

    const result_validate = RequestSchema.safeParse(body);

    if (!result_validate.success) {
        logWarn('[API/Chat] Validation Error:', result_validate.error);
        return new Response(JSON.stringify({ error: 'Invalid Request Data', details: result_validate.error.format() }), { status: 400 });
    }

    const { messages, demoConfig, conversationId, clientTimezone } = result_validate.data;
    const attachments = (body as any).attachments || (body as any).experimental_attachments || [];
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
    log('[API/Chat] Request processed', {
        hasUser: !!user,
        userId: user?.id,
        authError: authError?.message
    });

    // 2. Fetch User Profile & Memory Summary
    let userProfile: {
        diet_mode: string;
        safety_flags: Record<string, boolean>;
        active_coach?: string;
        preferred_language?: string;
        cooldowns?: Record<string, string>;
        active_radar?: any;
        [key: string]: any
    } = { diet_mode: 'standard', safety_flags: {}, active_coach: 'fat_loss', preferred_language: 'en' };
    let activeGoals: any[] = [];
    let memorySummary: string | null = null;

    if (user) {
        // Parallel fetch for profile, goals, and conversation memory
        const [profileRes, goalsRes, convRes] = await Promise.all([
            supabase.from('users_secure').select('*').eq('id', user.id).single(),
            supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
            conversationId ? supabase.from('conversations').select('memory_summary').eq('id', conversationId).single() : Promise.resolve({ data: null })
        ]);

        if (profileRes.data) userProfile = profileRes.data;
        if (goalsRes.data) activeGoals = goalsRes.data;
        if (convRes.data) memorySummary = convRes.data.memory_summary;

        // Fetch "Active Radar" (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: radarData } = await supabase
            .from('metabolic_logs')
            .select('calories, protein, carbs, fat, logged_at')
            .eq('user_id', user.id)
            .gte('logged_at', sevenDaysAgo.toISOString())
            .order('logged_at', { ascending: false });

        // Calculate 7-day averages for the prompt injection
        if (radarData && radarData.length > 0) {
            const totals = radarData.reduce((acc: any, log: any) => ({
                calories: acc.calories + (log.calories || 0),
                protein: acc.protein + (log.protein || 0),
                carbs: acc.carbs + (log.carbs || 0),
                fat: acc.fat + (log.fat || 0),
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            const daysCount = 7;
            userProfile.active_radar = {
                avg_calories: Math.round(totals.calories / daysCount),
                avg_protein: Math.round(totals.protein / daysCount),
                avg_carbs: Math.round(totals.carbs / daysCount),
                avg_fat: Math.round(totals.fat / daysCount),
                raw_logs_count: radarData.length
            };
        }

        // SECURITY: Block unapproved users (VIP Whitelist)
        // Admin always bypasses
        if (!userProfile.is_approved && !isAdmin(user.email)) {
            logWarn('[API/Chat] Blocked Access: User not approved', user.email);
            return new Response('Access Denied: Your account is pending approval by Brice.', { status: 403 });
        }
    } else if (demoConfig) {
        // Apply Demo Config to System Prompt
        userProfile = { ...userProfile, ...demoConfig };
    }

    // 4. Initialize The Brain
    const openrouter = createOpenAI({
        baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Use a vision-capable, cost-optimized model for metabolic auditing
    const modelId = process.env.OPENAI_MODEL || 'x-ai/grok-4.1-fast';

    // 5. Load Domain Knowledge (The Knowledge Vault)
    const constitution = await getKnowledgeItem('constitutions', userProfile.diet_mode || 'standard');
    const specialist = await getKnowledgeItem('specialists', userProfile.active_coach || 'fat_loss');

    // 6. Multimodal Processing: Append attachments to the last message
    const processedMessages = [...messages];
    if (attachments.length > 0 && processedMessages.length > 0) {
        const lastIndex = processedMessages.length - 1;
        const lastMessage = processedMessages[lastIndex];
        if (lastMessage.role === 'user') {
            processedMessages[lastIndex] = {
                ...lastMessage,
                experimental_attachments: attachments,
            };
        }
    }

    // 6. Dynamic Age Calculation for Prompt
    if (userProfile.biometrics?.birthdate) {
        const birthDate = new Date(userProfile.biometrics.birthdate);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
        }
        userProfile.biometrics.age = calculatedAge;
    }

    // 7. Context management (Episodic + Semantic Tiers)
    const tieredMessages = ContextManager.processContext(
        METABOLIC_COACH_PROMPT(userProfile, activeGoals ?? undefined, constitution, specialist, new Date().toISOString()),
        memorySummary,
        processedMessages
    );

    // 8. Intent Detection & Operational Mandate Injection
    const lastMessage = tieredMessages[tieredMessages.length - 1];
    const userContent = lastMessage?.role === 'user' ? String(lastMessage.content).toLowerCase() : '';
    const mutationIntents = ['delete', 'remove', 'update', 'fix', "didn't eat", "wasn't me", 'log', 'recorded', 'add'];
    const isMutationIntent = mutationIntents.some(intent => userContent.includes(intent));

    if (isMutationIntent && lastMessage && lastMessage.role === 'user') {
        console.log('[API/Chat] MUTATION INTENT DETECTED - INJECTING OPERATIONAL MANDATE');
        // We inject a final, unavoidable operational instruction directly into the last message's context
        // This is a "Master-Level" pattern for models that try to bypass system instructions.
        lastMessage.content = `${lastMessage.content}\n\n[OPERATIONAL MANDATE: DO NOT CONFIRM SUCCESS UNLESS YOU CALL A TOOL FIRST. IF YOU DO NOT HAVE PARAMS, CALL QUERY_LOGS TO FIND THEM.]`;
    }

    console.log('[API/Chat] CONTEXT SEQUENCE:', tieredMessages.map(m => m.role));

    const result = await streamText({
        model: openrouter(modelId),
        maxSteps: 5,
        toolChoice: 'auto', // Back to auto for stability
        messages: tieredMessages,
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
                        experimental_attachments: (event as any).attachments && (event as any).attachments.length > 0 ? (event as any).attachments : null,
                    });
                    if (error) logWarn('[API/Chat] Server Save Error:', error);
                    else log('[API/Chat] Server Saved Assistant Message');

                    // Tiered Memory: Recursive Background Summarization
                    // We trigger an extraction if the conversation is ongoing (multiples of 3 messages)
                    // This ensures "Metabolic Truths" stay fresh without firing every turn.
                    if (messages.length > 2 && messages.length % 3 === 0) {
                        try {
                            const extractionPrompt = ContextManager.getExtractionPrompt(
                                memorySummary,
                                [
                                    ...messages.slice(-2),
                                    { role: 'assistant', content: event.text } as Message
                                ]
                            );

                            const { text: newSummary } = await generateText({
                                model: openrouter(modelId),
                                prompt: extractionPrompt,
                            });

                            if (newSummary && newSummary.length > 10) {
                                await supabase
                                    .from('conversations')
                                    .update({ memory_summary: newSummary })
                                    .eq('id', conversationId);
                                log('[API/Chat] Memory Summary Updated');
                            }
                        } catch (summaryErr) {
                            logWarn('[API/Chat] background-summarization error:', summaryErr);
                        }
                    }
                } catch (e) {
                    logWarn('[API/Chat] Server Save Exception:', e);
                }
            } else {
                log('[API/Chat] Skip Save: No User or ConversationId', { hasUser: !!user, conversationId });
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
                    preferred_language: z.string().optional().describe('The user\'s preferred language (e.g., "en", "pt", "es"). Use this to tailor all future responses.'),
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
                    cooldowns: z.record(z.string(), z.string()).optional().describe('Internal advocacy state cooldowns (ISO timestamps)'),
                    date: z.string().optional().describe('The date of the update (YYYY-MM-DD). Defaults to today if not provided.'),
                }),
                execute: async ({ diet_mode, preferred_language, active_coach, safety_flags, name, biometrics, cooldowns, date }) => {
                    if (!user) {
                        logWarn('[API/Chat] Blocked Tool Execution (Demo Mode): update_profile');
                        return `[DEMO MODE] Profile update simulated: Name=${name}, Mode=${diet_mode}, Language=${preferred_language}`;
                    }

                    let targetDate = date || new Date().toISOString().split('T')[0];

                    // Smart Year Resolver: Auto-correct 2024/2025 fallback to 2026 if system is in 2026
                    if (targetDate.match(/^202[45]-/) && new Date().getFullYear() === 2026) {
                        logWarn(`[API/Chat] update_profile: Correcting Year Drift ${targetDate.substring(0, 4)} -> 2026`);
                        targetDate = targetDate.replace(/^202[45]-/, '2026-');
                    }

                    const timestamp = targetDate.includes('T') ? targetDate : `${targetDate}T12:00:00Z`;

                    // Fetch current profile for comparison and merging
                    const { data: currentProfile } = await supabase
                        .from('users_secure')
                        .select('diet_mode, active_coach, biometrics, name, preferred_language, cooldowns')
                        .eq('id', user.id)
                        .single();

                    const updates: any = {};
                    const loggedEvents: string[] = [];

                    // Handle cooldown updates
                    if (cooldowns) {
                        const existingCooldowns = currentProfile?.cooldowns || {};
                        updates.cooldowns = { ...existingCooldowns, ...cooldowns };
                        loggedEvents.push('cooldowns updated');
                    }

                    // Handle language change
                    if (preferred_language && preferred_language !== currentProfile?.preferred_language) {
                        updates.preferred_language = preferred_language;
                        loggedEvents.push(`language → ${preferred_language}`);
                    }

                    // Handle diet mode change - LOG AS HISTORICAL EVENT
                    if (diet_mode && diet_mode !== currentProfile?.diet_mode) {
                        updates.diet_mode = diet_mode;
                        // Log diet switch to history
                        await supabase.from('metabolic_logs').insert({
                            user_id: user.id,
                            log_type: 'note',
                            content_raw: `Switched diet to ${diet_mode}`,
                            logged_at: timestamp,
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
                                logged_at: timestamp,
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
                                logged_at: timestamp,
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
                description: 'The Universal Logger. Use "core" for standard metrics. Use "flexible" for EVERYTHING else (symptoms, pain levels, stress context).',
                parameters: z.object({
                    log_type: z.enum(['meal', 'workout', 'symptom', 'biometric', 'environment', 'note']),
                    content_raw: z.string().describe('The original text input from user'),
                    core: z.object({
                        calories: z.number().optional(),
                        protein: z.number().optional(),
                        fat: z.number().optional(),
                        carbs: z.number().optional(),
                        fiber: z.number().optional(),
                        sugar_g: z.number().optional(),
                        magnesium_mg: z.number().optional().describe("Estimate using USDA data if missing"),
                        potassium_mg: z.number().optional(),
                        zinc_mg: z.number().optional(),
                        sodium_mg: z.number().optional(),
                        vitamin_d_iu: z.number().optional(),
                        vitamin_b12_ug: z.number().optional(),
                        items: z.array(z.string()).optional(),
                    }).optional().describe('Standardized metabolic metrics'),
                    flexible: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                        .optional()
                        .describe('Mandatory for non-mineral context. If user specifies a feeling, pain level, or symptom, put it here.'),
                    is_estimated: z.boolean().default(false).describe('True if this is a guess/restaraunt meal'),
                    confidence_score: z.number().min(0).max(1).default(1).describe('0.0 to 1.0 (1.0 = Measured, 0.7 = Guesstimated)'),
                    date: z.string().optional().describe('The date (YYYY-MM-DD). Defaults to now.'),
                }),
                execute: async ({ log_type, content_raw, core, flexible, is_estimated, confidence_score, date }) => {
                    log('[log_activity] Tool called:', {
                        log_type,
                        content_raw: content_raw?.substring(0, 50),
                        date,
                        hasCore: !!core,
                        calories: core?.calories
                    });

                    if (!user) {
                        logWarn('[log_activity] Blocked: Demo Mode');
                        return `[DEMO MODE] Item NOT saved to Vault. Analysis: ${JSON.stringify({ core, flexible })}`;
                    }

                    // HARD-LOCK: Enforce biometrics onboarding
                    const { data: profile, error: profileError } = await supabase
                        .from('users_secure')
                        .select('biometrics')
                        .eq('id', user.id)
                        .single();

                    if (profileError) {
                        logWarn('[log_activity] Profile fetch error:', profileError);
                    }

                    const bio = profile?.biometrics || {};
                    if (!bio.weight || !bio.height || !bio.sex) {
                        log('[log_activity] Blocked: Incomplete biometrics', bio);
                        return "SYSTEM ERROR: Log BLOCKED. User profile is incomplete. You MUST ask the user for Height, Weight, and Biological Sex before I can perform metabolic calculations.";
                    }

                    // Build timestamp - use timezone-aware logic for retroactive dates
                    let timestamp: string;
                    if (date) {
                        // Retroactive: Snap to Noon in user's timezone, converted to UTC
                        try {
                            const noonLocal = new Date(`${date}T12:00:00`);
                            timestamp = fromZonedTime(noonLocal, clientTimezone).toISOString();
                            log('[log_activity] Retroactive timestamp:', { date, clientTimezone, timestamp });
                        } catch (e) {
                            // Fallback to UTC noon
                            timestamp = `${date}T12:00:00Z`;
                            logWarn('[log_activity] Timezone conversion failed, using UTC:', timestamp);
                        }
                    } else {
                        // Live: Exact current time
                        timestamp = new Date().toISOString();
                    }

                    // Put all nutritional data into data_structured JSONB column
                    // (The table schema only has: id, user_id, log_type, content_raw, data_structured, logged_at)
                    const insertData = {
                        user_id: user.id,
                        log_type,
                        content_raw,
                        data_structured: {
                            // Core metrics
                            calories: core?.calories,
                            protein: core?.protein,
                            fat: core?.fat,
                            carbs: core?.carbs,
                            fiber: core?.fiber,
                            sugar_g: core?.sugar_g,
                            // Minerals
                            magnesium_mg: core?.magnesium_mg,
                            potassium_mg: core?.potassium_mg,
                            zinc_mg: core?.zinc_mg,
                            sodium_mg: core?.sodium_mg,
                            vitamin_d_iu: core?.vitamin_d_iu,
                            vitamin_b12_ug: core?.vitamin_b12_ug,
                            // Items array
                            items: core?.items,
                            // Flexible data (symptoms, feelings, etc)
                            ...flexible,
                            // Confidence metadata
                            is_estimated,
                            confidence_score,
                        },
                        logged_at: timestamp,
                    };


                    log('[log_activity] Inserting:', {
                        user_id: user.id,
                        log_type,
                        content_raw: content_raw?.substring(0, 30),
                        calories: core?.calories,
                        logged_at: timestamp
                    });


                    const { data: insertedData, error } = await supabase
                        .from('metabolic_logs')
                        .insert(insertData)
                        .select('id, logged_at')
                        .single();

                    if (error) {
                        logWarn('[log_activity] Insert ERROR:', error);
                        return `Error logging data: ${error.message}`;
                    }

                    if (!insertedData) {
                        logWarn('[log_activity] CRITICAL: Insert returned no data (likely RLS issue)');
                        return `Error: Log operation failed silently. Your entry was not saved. This may be a permissions issue - please try again or contact support.`;
                    }

                    log('[log_activity] SUCCESS:', {
                        id: insertedData.id,
                        logged_at: insertedData.logged_at
                    });

                    // Build user-friendly response
                    const logDate = new Date(insertedData.logged_at);
                    const dateStr = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const timeStr = logDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                    return `✓ Logged for ${dateStr}: ${core?.calories ? `${core.calories} cal` : content_raw?.substring(0, 30)}`;
                },
            }),

            repair_log_entry: tool({
                description: 'Refine or repair an existing log entry with precise USDA chemical data. Use when a log is missing minerals or needs macro corrections.',
                parameters: z.object({
                    log_id: z.string().describe('The ID of the log to repair'),
                    updates: z.object({
                        calories: z.number().optional(),
                        protein: z.number().optional(),
                        fat: z.number().optional(),
                        carbs: z.number().optional(),
                        fiber: z.number().optional(),
                        sugar_g: z.number().optional(),
                        magnesium_mg: z.number().optional(),
                        potassium_mg: z.number().optional(),
                        zinc_mg: z.number().optional(),
                        sodium_mg: z.number().optional(),
                        vitamin_d_iu: z.number().optional(),
                        vitamin_b12_ug: z.number().optional(),
                        flexible_data: z.record(z.string(), z.any()).optional(),
                    }),
                }),
                execute: async ({ log_id, updates }) => {
                    if (!user) return '[DEMO MODE] Repair simulated.';
                    const { error } = await supabase
                        .from('metabolic_logs')
                        .update(updates)
                        .eq('id', log_id)
                        .eq('user_id', user.id);
                    return error ? `Error repairing log: ${error.message}` : `Log ${log_id} repaired with updated chemical profile.`;
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
                    if (!user) return JSON.stringify({ message: '[DEMO MODE] No summary available.' });

                    // TIMEZONE AWARE 'TODAY'
                    // Calculate 'Today' relative to client timezone
                    const nowUtc = new Date();
                    const nowLocal = toZonedTime(nowUtc, clientTimezone);
                    const todayStr = nowLocal.toISOString().split('T')[0]; // "2026-01-07"

                    const startLocal = new Date(`${todayStr}T00:00:00`);
                    const endLocal = new Date(`${todayStr}T23:59:59.999`);
                    const utcStart = fromZonedTime(startLocal, clientTimezone).toISOString();
                    const utcEnd = fromZonedTime(endLocal, clientTimezone).toISOString();

                    const { data: logs } = await supabase
                        .from('metabolic_logs')
                        .select('*, id, log_type, content_raw, data_structured, flexible_data, logged_at')
                        .eq('user_id', user.id)
                        .eq('log_type', 'meal')
                        .gte('logged_at', utcStart)
                        .lte('logged_at', utcEnd);

                    if (!logs || logs.length === 0) {
                        return JSON.stringify({ message: 'No meals logged today yet.', totals: { calories: 0, protein: 0, fat: 0, carbs: 0 }, goals: activeGoals });
                    }

                    // Macros are stored in data_structured JSONB column
                    const totals = logs.reduce((acc, log) => {
                        const d = log.data_structured || {};
                        return {
                            calories: acc.calories + (d.calories || 0),
                            protein: acc.protein + (d.protein || 0),
                            fat: acc.fat + (d.fat || 0),
                            carbs: acc.carbs + (d.carbs || 0),
                            fiber: acc.fiber + (d.fiber || 0),
                            sugar: acc.sugar + (d.sugar_g || 0),
                        };
                    }, { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0 });

                    return JSON.stringify({ totals, meals_count: logs.length, goals: activeGoals, logs });
                },
            }),

            delete_log: tool({
                description: 'Delete a logged entry from the Data Vault. Use when user says they didn\'t eat something, made a mistake, or wants to remove an entry. Can search by description or delete most recent entry of a type.',
                parameters: z.object({
                    log_id: z.string().optional().describe('Specific log ID to delete if known'),
                    search_text: z.string().optional().describe('Text to search for in the log content (e.g., "steak", "lunch", "eggs")'),
                    log_type: z.enum(['meal', 'workout', 'blood_work', 'biometric', 'note']).optional(),
                    date: z.string().optional().describe('Date to search (YYYY-MM-DD format). Defaults to today if not specified.'),
                    delete_most_recent: z.boolean().optional().describe('If true, delete the most recent matching entry across all dates'),
                }),
                execute: async ({ log_id, search_text, log_type, date, delete_most_recent }) => {
                    if (!user) return '[DEMO MODE] Cannot delete logs. Sign in to enable data management.';

                    log('[delete_log] Tool called with:', { log_id, search_text, log_type, date, delete_most_recent });

                    // If specific ID provided, delete directly
                    if (log_id) {
                        log('[delete_log] Direct ID delete:', log_id);
                        const { error, count } = await supabase
                            .from('metabolic_logs')
                            .delete()
                            .eq('id', log_id)
                            .eq('user_id', user.id);

                        if (error) {
                            logWarn('[delete_log] Direct delete error:', error);
                            return `Error deleting: ${error.message}`;
                        }
                        return 'Entry deleted from Data Vault.';
                    }

                    // Timezone-aware search window
                    const nowLocal = toZonedTime(new Date(), clientTimezone);
                    const searchDate = date || nowLocal.toISOString().split('T')[0];
                    const startLocal = new Date(`${searchDate}T00:00:00`);
                    const endLocal = new Date(`${searchDate}T23:59:59.999`);
                    const utcStart = fromZonedTime(startLocal, clientTimezone).toISOString();
                    const utcEnd = fromZonedTime(endLocal, clientTimezone).toISOString();

                    log('[delete_log] Search window:', { searchDate, utcStart, utcEnd, clientTimezone });

                    // Build query - if delete_most_recent, search last 7 days
                    let queryStart = utcStart;
                    let queryEnd = utcEnd;

                    if (delete_most_recent) {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        queryStart = weekAgo.toISOString();
                        queryEnd = new Date().toISOString();
                    }

                    let query = supabase
                        .from('metabolic_logs')
                        .select('id, log_type, content_raw, data_structured, flexible_data, logged_at')
                        .eq('user_id', user.id)
                        .gte('logged_at', queryStart)
                        .lte('logged_at', queryEnd)
                        .order('logged_at', { ascending: false });

                    if (log_type) query = query.eq('log_type', log_type);

                    const { data: logs, error: searchError } = await query;
                    if (searchError) {
                        logWarn('[delete_log] Search error:', searchError);
                        return `Error searching: ${searchError.message}`;
                    }

                    log('[delete_log] Found logs:', { count: logs?.length || 0 });

                    if (!logs || logs.length === 0) {
                        // Helpful message with context
                        const dateStr = date ? `on ${date}` : 'today';
                        return `No ${log_type || 'entries'} found ${dateStr} to delete. Try specifying a different date (e.g., "delete yesterday's lunch") or searching by item name.`;
                    }

                    // Filter by search text if provided - search content_raw AND data_structured
                    let matches = logs;
                    if (search_text) {
                        const searchLower = search_text.toLowerCase();
                        console.log(`[delete_log] searching for ${searchLower}...`);
                        matches = logs.filter(logEntry => {
                            const raw = (logEntry.content_raw || '').toLowerCase();
                            const ds = JSON.stringify(logEntry.data_structured || {}).toLowerCase();
                            return raw.includes(searchLower) || ds.includes(searchLower);
                        });
                        console.log(`[delete_log] matches: ${matches.length}`);
                    }


                    if (matches.length === 0) {
                        // If no match on specific date, try expanded 7-day search
                        if (!delete_most_recent && !date) {
                            log('[delete_log] No match today, trying 7-day search');
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);

                            const { data: extendedLogs } = await supabase
                                .from('metabolic_logs')
                                .select('id, log_type, content_raw, data_structured, flexible_data, logged_at')
                                .eq('user_id', user.id)
                                .gte('logged_at', weekAgo.toISOString())
                                .order('logged_at', { ascending: false })
                                .limit(50);

                            if (extendedLogs && search_text) {
                                const searchLower = search_text.toLowerCase();
                                const extendedMatches = extendedLogs.filter(logEntry =>
                                    logEntry.content_raw?.toLowerCase().includes(searchLower) ||
                                    JSON.stringify(logEntry.data_structured)?.toLowerCase().includes(searchLower)
                                );


                                if (extendedMatches.length > 0) {
                                    const found = extendedMatches[0];
                                    const foundDate = new Date(found.logged_at).toLocaleDateString();
                                    return `No "${search_text}" found today, but I found one from ${foundDate}: "${found.content_raw?.substring(0, 40)}...". Say "delete ${search_text} from ${foundDate.split('/').join('-')}" to remove it.`;
                                }
                            }
                        }
                        return `No entries matching "${search_text}" found. Please verify the item name or try "show today" to see what's logged.`;
                    }

                    // Delete the most recent match (or first match)
                    const toDelete = matches[0];
                    log('[delete_log] Deleting:', {
                        id: toDelete.id,
                        content: toDelete.content_raw?.substring(0, 50),
                        logged_at: toDelete.logged_at
                    });

                    const { error: deleteError } = await supabase
                        .from('metabolic_logs')
                        .delete()
                        .eq('id', toDelete.id)
                        .eq('user_id', user.id);

                    if (deleteError) {
                        logWarn('[delete_log] Delete error:', deleteError);
                        return `Error deleting: ${deleteError.message}`;
                    }

                    // VERIFICATION: Confirm the row is actually gone
                    const { data: verifyGone } = await supabase
                        .from('metabolic_logs')
                        .select('id')
                        .eq('id', toDelete.id)
                        .maybeSingle();  // Use maybeSingle to avoid error on no rows

                    if (verifyGone) {
                        logWarn('[delete_log] CRITICAL: Delete reported success but row still exists!', { id: toDelete.id });
                        return `Error: Delete operation failed silently. The entry could not be removed. This may be a database permissions issue - please contact support.`;
                    }

                    log('[delete_log] Delete verified successful');
                    const deletedTime = new Date(toDelete.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    const deletedDate = new Date(toDelete.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return `✓ Deleted: "${toDelete.content_raw?.substring(0, 50)}..." (${toDelete.log_type}, ${deletedDate} at ${deletedTime})`;
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
                        // Timezone-aware search window
                        const nowLocal = toZonedTime(new Date(), clientTimezone);
                        const searchDate = date || nowLocal.toISOString().split('T')[0];
                        const startLocal = new Date(`${searchDate}T00:00:00`);
                        const endLocal = new Date(`${searchDate}T23:59:59.999`);
                        const utcStart = fromZonedTime(startLocal, clientTimezone).toISOString();
                        const utcEnd = fromZonedTime(endLocal, clientTimezone).toISOString();

                        const { data: logs } = await supabase
                            .from('metabolic_logs')
                            .select('id, content_raw, data_structured, flexible_data')
                            .eq('user_id', user.id)
                            .gte('logged_at', utcStart)
                            .lte('logged_at', utcEnd)
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
                        .select('data_structured, flexible_data')
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
                description: 'Query historical logs. Uses precise local-time boundaries to find logs. Use for "what did I eat yesterday", "history check".',
                parameters: z.object({
                    log_type: z.enum(['meal', 'workout', 'blood_work', 'biometric', 'note', 'all']).describe('Type of logs to retrieve, or "all" for everything'),
                    start_date: z.string().describe('Start date (YYYY-MM-DD format)'),
                    end_date: z.string().describe('End date (YYYY-MM-DD format)'),
                    limit: z.number().optional().describe('Maximum entries to return (default 50)'),
                }),
                execute: async ({ log_type, start_date, end_date, limit = 50 }) => {
                    if (!user) return JSON.stringify({ message: '[DEMO MODE] No history available. Sign in to access your data.' });

                    // TIMEZONE AWARE QUERY LOGIC
                    // Convert Local Day Start/End -> UTC Timestamps
                    // E.g. "2026-01-07" in NY -> 2026-01-07 05:00 UTC to 2026-01-08 05:00 UTC
                    let utcStart: string, utcEnd: string;

                    try {
                        const startLocal = new Date(`${start_date}T00:00:00`);
                        const endLocal = new Date(`${end_date}T23:59:59.999`);
                        // fromZonedTime takes a Local Date and a Timezone, returns UTC Date
                        utcStart = fromZonedTime(startLocal, clientTimezone).toISOString();
                        utcEnd = fromZonedTime(endLocal, clientTimezone).toISOString();
                    } catch (e) {
                        logWarn('Timezone conversion failed, falling back to simple UTC', e);
                        utcStart = `${start_date}T00:00:00.000Z`;
                        utcEnd = `${end_date}T23:59:59.999Z`;
                    }

                    let query = supabase
                        .from('metabolic_logs')
                        .select('*') // Simplify to avoid schema mismatches (e.g. if a column was renamed or type changed)
                        .eq('user_id', user.id)
                        .gte('logged_at', utcStart)
                        .lte('logged_at', utcEnd)
                        .order('logged_at', { ascending: false })
                        .limit(limit);

                    if (log_type !== 'all') query = query.eq('log_type', log_type);

                    const { data: logs, error } = await query;
                    if (error) return JSON.stringify({ error: error.message });

                    return JSON.stringify({
                        count: logs?.length || 0,
                        query_window: {
                            client_timezone: clientTimezone,
                            start_utc: utcStart,
                            end_utc: utcEnd
                        },
                        entries: logs?.map(log => ({
                            id: log.id,
                            type: log.log_type,
                            description: log.content_raw,
                            calories: log.calories,
                            protein: log.protein,
                            fat: log.fat,
                            carbs: log.carbs,
                            fiber: log.fiber,
                            sugar_g: log.sugar_g,
                            minerals: {
                                magnesium_mg: log.magnesium_mg,
                                potassium_mg: log.potassium_mg,
                                zinc_mg: log.zinc_mg,
                                sodium_mg: log.sodium_mg,
                                vitamin_d_iu: log.vitamin_d_iu,
                                vitamin_b12_ug: log.vitamin_b12_ug,
                            },
                            flexible: log.flexible_data,
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
                        .select('calories, protein, fat, carbs, fiber, logged_at')
                        .eq('user_id', user.id)
                        .eq('log_type', 'meal')
                        .gte('logged_at', `${start_date}T00:00:00`)
                        .lte('logged_at', `${end_date}T23:59:59`)
                        .limit(1000); // Safety limit to prevent OOM

                    if (error) return JSON.stringify({ error: error.message });
                    if (!logs || logs.length === 0) return JSON.stringify({ message: 'No data found for this period.', value: 0 });

                    // Extract values for the metric from dedicated columns
                    const values = logs
                        .map(log => (log as Record<string, unknown>)[metric])
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
