import { Message } from 'ai';

/**
 * ContextManager: Orchestrates the Tiered Memory system.
 * 
 * Hierarchy:
 * 1. System Prompt (Frozen/Cached)
 * 2. Semantic Memory (Metabolic Truths - Dynamic but slow-changing)
 * 3. Episodic Memory (Recent chat history - Fast-sliding window)
 */
export class ContextManager {
    // Configurable thresholds for optimal cost/memory balance
    static readonly MAX_EPISODIC_MESSAGES = 10;
    static readonly SUMMARY_TOKEN_CAP = 500;

    /**
     * Prepares messages for the LLM request.
     * Injects the metabolic summary into the system role and slices the history.
     */
    static processContext(
        fullSystemPrompt: string,
        memorySummary: string | null,
        messages: Message[]
    ): Message[] {
        // 1. Prepare Semantic Layer
        const semanticTruth = memorySummary
            ? `\n\n[USER METABOLIC TRUTHS - PERSISTENT CONTEXT]\n${memorySummary}`
            : '\n\n[No existing metabolic summary for this user yet. Start learning about them.]';

        // 2. Prepare System Layer (Static Prompt + Semantic Truth)
        // We combine the high-volume static prompt with the dense dynamic truth.
        const systemContent = fullSystemPrompt + semanticTruth;

        // 3. Sliding Window (Episodic Memory)
        // We only send the last N messages to keep the token growth capped (flat cost scaling).
        // Note: We skip the first element if it's already a system message in the input.
        const userAndAssistantHistory = messages.filter(m => m.role !== 'system');
        const slidingWindow = userAndAssistantHistory.slice(-this.MAX_EPISODIC_MESSAGES);

        // 4. Sliding Window (Episodic Memory)
        // We separate the last message to inject the Temporal Guardian with maximum saliency
        const history = [...slidingWindow];
        const lastMessage = history.pop();

        const finalMessages: Message[] = [
            {
                id: 'system-context-root',
                role: 'system',
                content: systemContent,
            },
        ];

        // 5. Build History with Recency-Injected Guardian
        finalMessages.push(...history);

        // TEMPORAL GUARDIAN (Absolute Recency)
        const now = new Date();
        if (now.getFullYear() < 2026) now.setFullYear(2026);

        finalMessages.push({
            id: 'system-temporal-guardian',
            role: 'system',
            content: `[SYSTEM DATE]: **${now.getFullYear()}** (${now.toLocaleDateString()}). 
[CRITICAL PROTOCOL]: You are a Data Accountant. 
- MUTATIONS (log/delete/update) MUST call a tool. 
- PROHIBITED: Lying about database actions.
- MANDATORY: Tool confirms action -> Then you confirm to user.`,
        });

        if (lastMessage) {
            finalMessages.push(lastMessage);
        }

        return finalMessages;
    }

    /**
     * Generates the prompt used for recursive background fact extraction.
     */
    static getExtractionPrompt(currentSummary: string | null, newInteraction: Message[]): string {
        const historyText = newInteraction
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n');

        return `
You are the "Metabolic Knowledge Vault" for a high-performance fitness AI.
Your task is to update the USER PERSISTENT CONTEXT with new "Metabolic Truths" found in the latest chat.

CURRENT PERSISTENT CONTEXT:
${currentSummary || 'None recorded yet.'}

LATEST INTERACTION:
${historyText}

INSTRUCTIONS:
1. Identify NEW critical facts: (e.g. "User is allergic to eggs", "Current goal is benching 100kg", "User just ate 500kcal of steak").
2. Merge with existing facts. Remove contradictions if user updated their info.
3. Keep it extremely concise and scannable (bullets).
4. Do NOT include chat pleasantries or temporary states. Only core truths.
5. Limit to ~300 words maximum.

OUTPUT FORMAT:
Bullet points only. No conversational wrapper.
    `.trim();
    }
}
