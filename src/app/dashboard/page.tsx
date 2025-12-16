import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch recent weight entries
    const { data: weightEntries } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

    // Fetch today's water intake
    const today = new Date().toISOString().split('T')[0];
    const { data: waterToday } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

    // Fetch streak
    const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Fetch today's meals
    const { data: mealsToday } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

    return (
        <DashboardClient
            user={user}
            profile={profile}
            weightEntries={weightEntries || []}
            waterToday={waterToday}
            streak={streak}
            mealsToday={mealsToday || []}
        />
    );
}
