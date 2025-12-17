'use client';

import { Suspense, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const urlError = searchParams.get('error');

    useEffect(() => {
        // Debug: Log all URL parameters when login page loads
        console.log('Login page loaded with params:', {
            error: urlError,
            redirect: searchParams.get('redirect'),
            v: searchParams.get('v'),
            detail: searchParams.get('detail'),
            debug: searchParams.get('debug'),
            fullUrl: typeof window !== 'undefined' ? window.location.href : 'SSR'
        });

        if (urlError === 'auth_error') {
            setError('Authentication failed. Please try again or use email/password.');
        } else if (urlError === 'missing_verifier') {
            setError('Session cookies missing. Please clear cookies and try again.');
        } else if (urlError === 'exchange_failed') {
            setError(`Failed to complete login: ${searchParams.get('detail') || 'Unknown error'}`);
        } else if (urlError) {
            setError(`Login error: ${urlError}`);
        }
    }, [urlError, searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push(redirect);
            router.refresh();
        }
    };

    const handleGoogleLogin = async () => {
        const supabase = createClient();
        const redirectTo = `${window.location.origin}/auth/callback`;
        console.log('OAuth redirectTo:', redirectTo);
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <Link href="/" className="inline-block mb-6">
                    <span className="text-2xl font-bold text-[#0073CF]">stayfitwithai</span>
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                <p className="text-gray-600 mt-2">Log in to track your progress</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                {/* Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-all mb-6"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or</span>
                    </div>
                </div>

                {/* Email Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0073CF]/30 focus:border-[#0073CF]"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0073CF]/30 focus:border-[#0073CF]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0073CF] hover:bg-[#005AA7] text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-[#0073CF] hover:underline">
                        Sign up free
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4 py-12">
            <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
