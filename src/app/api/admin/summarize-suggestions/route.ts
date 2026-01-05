import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Verify admin
        const { data: { user } } = await supabase.auth.getUser();
        const adminEmails = ['bigbricey@gmail.com', 'tonygarrett@comcast.net'];
        if (!user || (user.email && !adminEmails.includes(user.email))) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 2. Fetch all suggestions
        const { data: suggestions, error } = await supabase
            .from('suggestions')
            .select('content, status');

        if (error) throw error;
        if (!suggestions || suggestions.length === 0) {
            return NextResponse.json({ summary: "No suggestions to analyze yet." });
        }

        // 3. Prepare prompt
        const contentList = suggestions.map(s => `- ${s.content} (Status: ${s.status})`).join('\n');
        const prompt = `
            You are an expert product manager AI. Below is a list of user suggestions for "Stay Fit with AI".
            Your goal is to:
            1. Group similar suggestions into categories.
            2. Identify the top 3 most requested features based on frequency and impact.
            3. Provide a concise executive summary for the administrator.

            Suggestions:
            ${contentList}

            Format the response as clear, professional markdown. Use bullet points.
        `;

        // 4. Generate AI Summary
        const { text } = await generateText({
            model: openai('gpt-4o'),
            prompt: prompt,
        });

        return NextResponse.json({ summary: text });

    } catch (error: any) {
        console.error('AI Summary Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
