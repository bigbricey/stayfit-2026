'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        console.log("Attempting Magic Link for:", email);

        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            console.error("Magic Link Error:", error);
            setErrorMsg(error.message);
        } else {
            console.log("Magic Link sent.");
            setSuccessMsg('Check your email for the login link!');
        }
        setLoading(false);
    };

    const handlePasswordLogin = async () => {
        setLoading(true);
        setErrorMsg(null);

        // Try Login First
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            // If login fails, try Sign Up
            console.log("Login failed, trying signup...", signInError.message);
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                setErrorMsg(signUpError.message);
            } else {
                setSuccessMsg("Account created! Check email if confirmation is needed.");
            }
        } else {
            // Login Success
            router.push('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
            <div className="w-full max-w-md space-y-8">
                {/* Header Omitted for brevity, assumed same */}
                <div className="text-center">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500 mb-2">
                        StayFitWithAI
                    </h1>
                    <p className="text-gray-400 text-lg">The Metabolic Truth Engine</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
                    {/* Error/Success Feedback */}
                    {errorMsg && (
                        <div id="error-message" className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm">
                            ⚠️ {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div id="success-message" className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded text-sm">
                            ✅ {successMsg}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password (Optional for Magic Link)</label>
                            <input
                                type="password"
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleMagicLink}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all"
                            >
                                {loading ? 'Processing...' : '✨ Magic Link Login'}
                            </button>

                            <button
                                onClick={handlePasswordLogin}
                                disabled={loading || !password}
                                className="w-full bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                            >
                                🔑 Password Login / Sign Up
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-800"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-600 text-xs">OR</span>
                                <div className="flex-grow border-t border-gray-800"></div>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold py-3 px-4 rounded-lg transition-all hover:text-white"
                            >
                                👀 Just Looking? Try Demo Mode
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        By entering, you agree to the <span className="underline cursor-pointer">Science Protocols</span>.
                    </div>
                </div>
            </div>
        </div>
    );
}
