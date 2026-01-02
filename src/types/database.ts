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
                    diet_mode: 'standard' | 'vegan' | 'keto' | 'carnivore' | 'paleo' | 'mediterranean' | 'fruitarian'
                    safety_flags: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    diet_mode?: 'standard' | 'vegan' | 'keto' | 'carnivore' | 'paleo' | 'mediterranean' | 'fruitarian'
                    safety_flags?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    diet_mode?: 'standard' | 'vegan' | 'keto' | 'carnivore' | 'paleo' | 'mediterranean' | 'fruitarian'
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
        }
    }
}
