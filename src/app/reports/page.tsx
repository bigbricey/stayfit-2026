'use client';

import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock weight data
const weightData = [
    { date: 'Dec 1', weight: 180 },
    { date: 'Dec 5', weight: 179.5 },
    { date: 'Dec 10', weight: 179 },
    { date: 'Dec 15', weight: 178.5 },
];

export default function ReportsPage() {
    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            {/* Secondary Navigation */}
            <div className="bg-[#E8F4FC] border-b border-[#C5DCE9]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-6 text-sm">
                        <Link href="/reports" className="py-2.5 text-[#0073CF] font-medium border-b-2 border-[#0073CF]">Charts</Link>
                        <Link href="/reports/export" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Export Data</Link>
                        <Link href="/reports/weekly" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Weekly Digest</Link>
                        <Link href="/reports/printable" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Printable Diary</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Charts and Reports</h1>

                {/* Weight Chart - Free */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm text-gray-600">Choose a report:</label>
                            <select className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
                                <option>Weight</option>
                            </select>
                        </div>
                        <button className="text-[#0073CF] hover:underline text-sm flex items-center gap-1">
                            Export
                        </button>
                    </div>

                    <div className="px-4 py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600 mr-4">Reporting period:</span>
                        <div className="inline-flex gap-2 text-sm">
                            <button className="text-gray-600 hover:text-[#0073CF]">Last 7 days</button>
                            <span className="text-gray-300">|</span>
                            <button className="text-[#0073CF] font-medium">Last 30 days</button>
                            <span className="text-gray-300">|</span>
                            <button className="text-gray-600 hover:text-[#0073CF]">Last 90 days</button>
                            <span className="text-gray-300">|</span>
                            <button className="text-gray-600 hover:text-[#0073CF]">Last 6 months</button>
                            <span className="text-gray-300">|</span>
                            <button className="text-gray-600 hover:text-[#0073CF]">Last year</button>
                        </div>
                    </div>

                    <div className="p-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weightData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#0073CF"
                                    strokeWidth={2}
                                    dot={{ fill: '#0073CF', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Net Calories - Premium */}
                <PremiumLockedSection title="Net Calories" />

                {/* Nutrients - Premium */}
                <PremiumLockedSection title="Nutrients" />

                {/* Measurements - Premium */}
                <PremiumLockedSection title="Measurements" />

                {/* Steps - Premium */}
                <PremiumLockedSection title="Steps" />
            </div>
        </div>
    );
}

function PremiumLockedSection({ title }: { title: string }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 relative overflow-hidden">
            {/* Premium Overlay */}
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center gap-1 bg-[#FFD700] text-gray-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                        <span>👑</span>
                        <span>Premium</span>
                    </div>
                    <p className="text-gray-700 font-medium">Unlock {title} with Premium</p>
                    <Link href="/premium" className="text-[#0073CF] hover:underline text-sm mt-1 inline-block">
                        Unlock Now →
                    </Link>
                </div>
            </div>

            {/* Background content (blurred/grayed) */}
            <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-400">{title}</h2>
            </div>
            <div className="p-4 h-48 bg-gray-50"></div>
        </div>
    );
}
