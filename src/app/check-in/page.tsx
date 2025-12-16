'use client';

import Link from 'next/link';
import { useUserData } from '@/context/UserDataContext';
import { useState } from 'react';

const measurementNames = [
    'Waist', 'Waist (Flexed)',
    'Right Arm', 'Right Arm (Flexed)',
    'Left Arm', 'Left Arm (Flexed)',
    'Right Forearm', 'Right Forearm (Flexed)',
    'Left Forearm', 'Left Forearm (Flexed)',
    'Right Thigh', 'Right Thigh (Flexed)',
    'Left Thigh', 'Left Thigh (Flexed)',
    'Right Calf', 'Right Calf (Flexed)',
    'Left Calf', 'Left Calf (Flexed)',
    'Chest', 'Chest (Flexed)',
];

export default function CheckInPage() {
    const { userData, updateWeight, updateMeasurement } = useUserData();
    const [weightInput, setWeightInput] = useState('');
    const [measurementInputs, setMeasurementInputs] = useState<Record<string, string>>({});

    const handleSave = () => {
        // Save weight if entered
        if (weightInput) {
            updateWeight(parseFloat(weightInput));
        }

        // Save measurements
        Object.entries(measurementInputs).forEach(([name, value]) => {
            if (value) {
                updateMeasurement(name, parseFloat(value));
            }
        });

        // Clear inputs
        setWeightInput('');
        setMeasurementInputs({});

        alert('Check-in saved successfully!');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const lastWeightEntry = userData.weightHistory[userData.weightHistory.length - 1];

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Check-In</h1>

                {/* Weight Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-5">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Enter today&apos;s weight:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weightInput}
                                    onChange={(e) => setWeightInput(e.target.value)}
                                    placeholder={String(userData.currentWeight)}
                                    className="w-24 border border-gray-300 rounded px-3 py-2 text-lg focus:border-[#0073CF] focus:outline-none"
                                />
                                <span className="text-gray-600">lbs</span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Last recorded weight: <span className="font-medium text-gray-700">{lastWeightEntry?.weight} lbs</span> on {formatDate(lastWeightEntry?.date)}
                        </div>
                        <div className="mt-3 flex gap-4 text-sm">
                            <span className="text-gray-500">Starting: <span className="font-medium text-gray-700">{userData.startingWeight} lbs</span></span>
                            <span className="text-gray-500">Goal: <span className="font-medium text-[#0073CF]">{userData.goalWeight} lbs</span></span>
                            <span className="text-gray-500">Progress: <span className="font-medium text-green-600">-{userData.startingWeight - userData.currentWeight} lbs</span></span>
                        </div>
                    </div>
                </div>

                {/* Other Measurements */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Other Measurements</h2>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-600">Measurement</div>
                        <div className="text-sm font-medium text-gray-600">Last Entry</div>
                        <div className="text-sm font-medium text-gray-600">Today&apos;s Entry</div>
                    </div>

                    {/* Measurement Rows */}
                    <div className="divide-y divide-gray-100">
                        {measurementNames.map((name) => {
                            const measurement = userData.measurements[name];
                            return (
                                <div key={name} className="grid grid-cols-3 px-5 py-3 items-center hover:bg-gray-50">
                                    <div className="text-gray-700">{name}</div>
                                    <div>
                                        {measurement ? (
                                            <>
                                                <span className="text-gray-800">{measurement.value} in</span>
                                                <span className="text-xs text-gray-400 ml-2">{formatDate(measurement.date)}</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurementInputs[name] || ''}
                                            onChange={(e) => setMeasurementInputs(prev => ({ ...prev, [name]: e.target.value }))}
                                            placeholder=""
                                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:border-[#0073CF] focus:outline-none"
                                        />
                                        <span className="text-sm text-gray-500">in</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-4 mb-6 text-sm">
                    <Link href="/check-in/additional" className="text-[#0073CF] hover:underline">
                        Track Additional Measurements
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/check-in/history" className="text-[#0073CF] hover:underline">
                        Edit Previous Entries
                    </Link>
                </div>

                {/* Save Button */}
                <div>
                    <button
                        onClick={handleSave}
                        className="bg-[#0073CF] text-white px-6 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
