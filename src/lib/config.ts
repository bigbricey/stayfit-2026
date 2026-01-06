/**
 * Centralized Application Configuration
 * 
 * This file contains all app-wide configuration constants.
 * Edit this file to add/remove admins or change app settings.
 */

// ============================================================================
// ADMIN CONFIGURATION
// ============================================================================

/**
 * Users with full admin access to the platform.
 * These users can:
 * - Access the Admin Dashboard
 * - Approve/reject new user registrations
 * - Bypass API rate limits
 * - Access AI-powered suggestion analysis
 */
export const ADMIN_EMAILS = [
    'bigbricey@gmail.com',      // Brice - Founder
    'tonygarrett@comcast.net',  // Tony - Co-founder
] as const;

/**
 * Check if an email has admin privileges
 */
export function isAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email as typeof ADMIN_EMAILS[number]);
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Rate limit configuration for guest/unauthenticated users
 */
export const RATE_LIMIT = {
    /** Time window in milliseconds (1 hour) */
    WINDOW_MS: 60 * 60 * 1000,
    /** Maximum requests per window for guest users */
    MAX_GUEST_REQUESTS: 20,
    /** Supabase table for rate limit tracking */
    TABLE_NAME: 'rate_limits',
} as const;

// ============================================================================
// AI MODEL CONFIGURATION
// ============================================================================

/**
 * Default AI model for the Metabolic Truth Engine
 */
export const AI_CONFIG = {
    /** Default model ID (can be overridden by OPENAI_MODEL env var) */
    DEFAULT_MODEL: 'x-ai/grok-4.1-fast',
    /** Maximum streaming duration in seconds */
    MAX_DURATION: 300,
    /** Maximum tool call steps per interaction */
    MAX_STEPS: 3,
} as const;

// ============================================================================
// MEMORY CONFIGURATION
// ============================================================================

/**
 * Tiered memory system configuration
 */
export const MEMORY_CONFIG = {
    /** Maximum messages in the sliding window (episodic memory) */
    MAX_EPISODIC_MESSAGES: 10,
    /** Maximum tokens for memory summary */
    SUMMARY_TOKEN_CAP: 500,
    /** Trigger summarization every N messages */
    SUMMARIZE_INTERVAL: 3,
} as const;

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

/**
 * LocalStorage keys for client-side persistence
 */
export const STORAGE_KEYS = {
    DEMO_CONFIG: 'stayfit_demo_config',
} as const;
