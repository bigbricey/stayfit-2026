import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        const cookieHeader = req.headers.get('cookie');

        return NextResponse.json({
            user_id: user?.id || 'null',
            s_user: !!user,
            auth_error: error?.message || null,
            cookies_present: !!cookieHeader,
            cookie_length: cookieHeader?.length || 0,
            cookie_preview: cookieHeader?.substring(0, 30) || 'none',
            timestamp: new Date().toISOString()
        });
    } catch (e: any) {
        return NextResponse.json({
            error: 'Crash in debug endpoint',
            details: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
