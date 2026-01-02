'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const clearMessages = () => {
        setErrorMsg(null);
        setSuccessMsg(null);
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setErrorMsg("Please enter your email address first.");
            return;
        }
        setLoading(true);
        clearMessages();
        console.log("Requesting password reset for:", email);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/auth/callback?next=/settings',
        });

        if (error) {
            console.error("Reset Password Error:", error);
            setErrorMsg(error.message);
        } else {
            setSuccessMsg('✅ Password reset email sent. Click the link in the email to set a new password.');
        }
        setLoading(false);
    };

    const handleLogin = async () => {
        setLoading(true);
        clearMessages();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Login Error:", error);
            setErrorMsg(error.message === 'Invalid login credentials'
                ? 'Invalid email or password. Do you need to create an account?'
                : error.message);
        } else {
            router.push('/');
        }
        setLoading(false);
    };

    const handleSignUp = async () => {
        setLoading(true);
        clearMessages();

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error("Signup Error:", error);
            setErrorMsg(error.message);
        } else {
            setSuccessMsg("🎉 Account created! Loging you in...");
            // Supabase sometimes logs in immediately after signup if email confirm is off
            // Let's check session or try standard login just to be safe/speedy
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/');
            } else {
                setSuccessMsg("Account created! Please check your email for a confirmation link.");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white font-sans">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500 mb-2 font-tracking-tighter">
                        StayFitWithAI
                    </h1>
                    <p className="text-gray-400 text-lg">The Metabolic Truth Engine</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl overflow-hidden relative">
                    {/* Tab Headers */}
                    <div className="flex border-b border-gray-800 mb-6">
                        <button
                            onClick={() => { setView('login'); clearMessages(); }}
                            className={`flex-1 pb-3 text-lg font-semibold transition-colors ${view === 'login'
                                ? 'text-blue-500 border-b-2 border-blue-500'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => { setView('signup'); clearMessages(); }}
                            className={`flex-1 pb-3 text-lg font-semibold transition-colors ${view === 'signup'
                                ? 'text-emerald-500 border-b-2 border-emerald-500'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Error/Success Feedback */}
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-900/40 border border-red-800 text-red-200 rounded text-sm flex items-center gap-2">
                            ⚠️ <span>{errorMsg}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-4 p-3 bg-green-900/40 border border-green-800 text-green-200 rounded text-sm flex items-center gap-2">
                            ✅ <span>{successMsg}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={(e) => {
                        e.preventDefault();
                        view === 'login' ? handleLogin() : handleSignUp();
                    }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {view === 'login' && (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center text-gray-400 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="mr-2 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500" />
                                    Remember me
                                </label>
                                <button type="button" onClick={handleForgotPassword} className="text-blue-400 hover:text-blue-300">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className={`w-full font-bold py-3.5 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 ${view === 'login'
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)]'
                                }`}
                        >
                            {loading ? 'Processing...' : (view === 'login' ? 'Log In' : 'Create Account')}
                        </button>
                    </form>

                    {/* Footer / Demo Mode */}
                    <div className="mt-8 pt-6 border-t border-gray-800 text-center">

                        <button
                            type="button"
                            onClick={() => router.push('/')} // Middleware might block this if not logged in, but useful for explicit demo intent if we enable it
                            className="text-gray-500 hover:text-gray-300 text-xs mt-2"
                        >
                            Just looking? Ask for Demo Access
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-gray-600">
                Protected by Supabase Auth and Netlify Edge.
            </div>
        </div>
        </div >
    );
}
