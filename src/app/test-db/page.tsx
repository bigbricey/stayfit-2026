'use client';

import { useState } from 'react';

export default function TestDbPage() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch('/api/test-db', { method: 'POST' });
            const data = await res.json();
            setStatus(data);
        } catch (e: any) {
            setStatus({ error: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Manual Persistence Test</h1>
            <p className="text-gray-400">
                This page bypasses the AI and attempts to write directly to the database using your current session.
                Check the console for the &quot;Connection successful&quot; message.
                It verifies if &quot;Silent Failures&quot; are happening at the database level.
            </p>

            <button
                onClick={runTest}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test Database Write'}
            </button>

            {status && (
                <div className="mt-4 p-4 rounded bg-gray-900 border border-gray-700 overflow-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                        {JSON.stringify(status, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
