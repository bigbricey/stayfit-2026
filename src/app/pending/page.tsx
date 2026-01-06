'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';

export default function PendingPage() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white font-sans">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
                        <Clock className="text-emerald-500 w-12 h-12 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">
                    Access Pending
                </h1>

                <div className="space-y-3 text-gray-400">
                    <p className="text-lg">Your account has been created successfully!</p>
                    <p className="text-sm">
                        To maintain a high-quality experience, new accounts require manual approval from the admin.
                    </p>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center gap-3 text-left">
                        <ShieldAlert className="text-blue-500 shrink-0" size={20} />
                        <span className="text-xs">Once approved, you will have full access to the Metabolic Truth Engine.</span>
                    </div>
                </div>

                <div className="pt-4 space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-all"
                    >
                        Check Status
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-transparent hover:bg-gray-800 text-gray-400 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-600">
                You will be notified via email once your account is active.
            </p>
        </div>
    );
}
