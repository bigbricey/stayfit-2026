// Debug endpoint to check metabolic_logs directly
// Access at: /api/debug-logs

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Not authenticated', authError }, { status: 401 });
        }

        // Get last 10 logs for this user
        const { data: logs, error: logsError } = await supabase
            .from('metabolic_logs')
            .select('id, log_type, content_raw, data_structured, logged_at')
            .eq('user_id', user.id)
            .order('logged_at', { ascending: false })
            .limit(10);

        if (logsError) {
            return NextResponse.json({ error: 'Failed to fetch logs', logsError }, { status: 500 });
        }

        return NextResponse.json({
            user_id: user.id,
            user_email: user.email,
            total_logs: logs?.length || 0,
            logs: logs?.map(log => ({
                id: log.id,
                type: log.log_type,
                content: log.content_raw?.substring(0, 50),
                calories: log.data_structured?.calories,
                logged_at: log.logged_at,
            }))
        });
    } catch (e) {
        return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
    }
}
