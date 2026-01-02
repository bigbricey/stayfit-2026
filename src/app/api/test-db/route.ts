import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({
                success: false,
                step: 'AUTH_CHECK',
                error: authError?.message || 'No User Found'
            }, { status: 401 });
        }

        // Attempt 1: Check if profile exists
        const { data: existing, error: fetchError } = await supabase
            .from('users_secure')
            .select('*')
            .eq('id', user.id)
            .single();

        // Attempt 2: Force Upsert (Write Test)
        const testPayload = {
            id: user.id,
            name: 'TEST_USER_MANUAL_' + new Date().getTime().toString().slice(-4),
            diet_mode: 'standard',
            updated_at: new Date().toISOString()
        };

        const { data: upsertData, error: upsertError } = await supabase
            .from('users_secure')
            .upsert(testPayload)
            .select();

        return NextResponse.json({
            success: !upsertError,
            user_id: user.id,
            profile_exists_before: !!existing,
            fetch_error: fetchError?.message || null,
            upsert_attempt: testPayload,
            upsert_error: upsertError?.message || null,
            upsert_result: upsertData,
            timestamp: new Date().toISOString()
        });

    } catch (e: any) {
        return NextResponse.json({
            success: false,
            step: 'Generic Crash',
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
