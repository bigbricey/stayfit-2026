
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
        acc[key.trim()] = value.trim();
    }
    return acc;
}, {} as Record<string, string>);

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

// Use Service Role Key to bypass RLS for the initial search to see EVERYTHING
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function debugDeletion() {
    console.log('--- STARTING DELETION DEBUG ---');

    // 1. Search for the problematic logs
    console.log('Searching for logs containing "Brice"...');
    const { data: logs, error } = await supabaseAdmin
        .from('metabolic_logs')
        .select('id, user_id, content_raw, logged_at, created_at')
        .ilike('content_raw', '%Brice%')
        .order('logged_at', { ascending: false });

    if (error) {
        console.error('Error searching logs:', error);
        return;
    }

    console.log(`Found ${logs.length} matching logs:`);
    logs.forEach(log => {
        console.log(`- ID: ${log.id}`);
        console.log(`  User: ${log.user_id}`);
        console.log(`  Content: "${log.content_raw}"`);
        console.log(`  Logged At: ${log.logged_at}`);
        console.log(`  Created At: ${log.created_at}`);
        console.log('---');
    });

    if (logs.length === 0) {
        console.log('No logs found. If the user sees them in the UI, there might be a mismatch in search terms or user ID.');
        return;
    }

    // 2. Attempt to delete the first one using the SAME logic as the app

    const targetLog = logs[0];
    console.log(`\nAttempting to delete Log ID: ${targetLog.id} (User: ${targetLog.user_id})`);

    // Perform Delete
    const { error: deleteError, count } = await supabaseAdmin
        .from('metabolic_logs')
        .delete()
        .eq('id', targetLog.id);

    if (deleteError) {
        console.error('DELETE ERROR:', deleteError);
    } else {
        console.log('Delete command executed. Rows affected:', count);
    }

    // 3. Verify if it's actually gone
    const { data: afterCheck } = await supabaseAdmin
        .from('metabolic_logs')
        .select('id')
        .eq('id', targetLog.id)
        .single();

    if (afterCheck) {
        console.error('CRITICAL FAILURE: Log STILL EXISTS after delete command!');
    } else {
        console.log('SUCCESS: Log is confirmed gone from the database.');
    }
}

debugDeletion();
