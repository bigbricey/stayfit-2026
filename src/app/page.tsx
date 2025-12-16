import ChatInterface from '@/components/chat/ChatInterface';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <main className="bg-black min-h-screen">
      <header className="p-4 border-b border-gray-900 flex justify-between items-center">
        <h1 className="text-gray-100 font-bold tracking-tight">Stay Fit with AI</h1>
        {/* Placeholder for User Menu */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
          {user.email?.charAt(0).toUpperCase()}
        </div>
      </header>
      <ChatInterface />
    </main>
  );
}
