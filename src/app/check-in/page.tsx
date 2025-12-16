import Link from 'next/link';

const measurements = [
    { name: 'Waist', lastValue: '32', lastDate: 'Dec 10, 2024', unit: 'in' },
    { name: 'Hips', lastValue: '38', lastDate: 'Dec 10, 2024', unit: 'in' },
    { name: 'Chest', lastValue: '40', lastDate: 'Dec 10, 2024', unit: 'in' },
    { name: 'Right Arm', lastValue: '13', lastDate: 'Dec 10, 2024', unit: 'in' },
    { name: 'Left Arm', lastValue: '13', lastDate: 'Dec 10, 2024', unit: 'in' },
    { name: 'Right Thigh', lastValue: '22', lastDate: 'Dec 10, 2024', unit: 'in' },
    { name: 'Left Thigh', lastValue: '22', lastDate: 'Dec 10, 2024', unit: 'in' },
    { name: 'Neck', lastValue: '15', lastDate: 'Dec 10, 2024', unit: 'in' },
    { name: 'Body Fat', lastValue: '24', lastDate: 'Dec 10, 2024', unit: '%' },
];

export default function CheckInPage() {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Check-In</h1>
                <p className="text-gray-500 mb-6">{today}</p>

                {/* Weight Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Weight</h2>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-8">
                            <div className="flex-1">
                                <div className="text-sm text-gray-500 mb-1">Last Entry</div>
                                <div className="text-2xl font-bold text-gray-800">172 lbs</div>
                                <div className="text-xs text-gray-400">Dec 14, 2024</div>
                            </div>
                            <div className="text-4xl text-gray-300">→</div>
                            <div className="flex-1">
                                <label className="text-sm text-gray-500 mb-1 block">Today&apos;s Weight</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Enter weight"
                                        className="w-32 border border-gray-300 rounded px-3 py-2 text-lg focus:border-[#0073CF] focus:outline-none"
                                    />
                                    <span className="text-gray-600">lbs</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Starting:</span>
                                    <span className="font-medium text-gray-700 ml-1">180 lbs</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Goal:</span>
                                    <span className="font-medium text-[#0073CF] ml-1">160 lbs</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Progress:</span>
                                    <span className="font-medium text-green-600 ml-1">-8 lbs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Measurements */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Other Measurements</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {/* Header Row */}
                        <div className="grid grid-cols-3 px-5 py-3 bg-gray-50 text-sm font-medium text-gray-600">
                            <div>Measurement</div>
                            <div>Last Entry</div>
                            <div>Today&apos;s Entry</div>
                        </div>
                        {/* Measurement Rows */}
                        {measurements.map((m) => (
                            <div key={m.name} className="grid grid-cols-3 px-5 py-3 items-center">
                                <div className="font-medium text-gray-700">{m.name}</div>
                                <div>
                                    <div className="text-gray-800">{m.lastValue} {m.unit}</div>
                                    <div className="text-xs text-gray-400">{m.lastDate}</div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        placeholder="—"
                                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:border-[#0073CF] focus:outline-none"
                                    />
                                    <span className="text-sm text-gray-500">{m.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Links */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/check-in/measurements" className="text-[#0073CF] text-sm hover:underline">
                        + Track Additional Measurements
                    </Link>
                    <Link href="/check-in/history" className="text-[#0073CF] text-sm hover:underline">
                        Edit Previous Entries
                    </Link>
                </div>

                {/* Save Button */}
                <div className="text-center">
                    <button className="bg-[#0073CF] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#005AA7] transition-colors">
                        Save Check-In
                    </button>
                </div>

                {/* Info Text */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Track your weight and body measurements regularly to monitor your progress.</p>
                    <p className="mt-1">We recommend checking in at least once a week, at the same time of day.</p>
                </div>
            </div>
        </div>
    );
}
