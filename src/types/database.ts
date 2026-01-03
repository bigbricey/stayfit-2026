export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users_secure: {
                Row: {
                    id: string
                    diet_mode: 'standard' | 'vegan' | 'keto' | 'carnivore' | 'paleo' | 'mediterranean' | 'fruitarian' | 'modified_keto'
                    name: string | null
                    biometrics: Json
                    safety_flags: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    diet_mode?: 'standard' | 'vegan' | 'keto' | 'carnivore' | 'paleo' | 'mediterranean' | 'fruitarian'
                    name?: string | null
                    biometrics?: Json
                    safety_flags?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    diet_mode?: 'standard' | 'vegan' | 'keto' | 'carnivore' | 'paleo' | 'mediterranean' | 'fruitarian'
                    name?: string | null
                    biometrics?: Json
                    safety_flags?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            metabolic_logs: {
                Row: {
                    id: string
                    user_id: string
                    log_type: 'meal' | 'workout' | 'blood_work' | 'biometric' | 'note'
                    content_raw: string | null
                    data_structured: Json
                    logged_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    log_type: 'meal' | 'workout' | 'blood_work' | 'biometric' | 'note'
                    content_raw?: string | null
                    data_structured?: Json
                    logged_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    log_type?: 'meal' | 'workout' | 'blood_work' | 'biometric' | 'note'
                    content_raw?: string | null
                    data_structured?: Json
                    logged_at?: string
                    created_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    user_id: string
                    title: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    tool_calls: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    tool_calls?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    role?: 'user' | 'assistant' | 'system'
                    content?: string
                    tool_calls?: Json | null
                    created_at?: string
                }
            }
        }
    }
}

