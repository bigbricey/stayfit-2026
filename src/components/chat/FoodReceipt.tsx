'use client';

import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface FoodItem {
    name: string;
    weight_g: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    is_estimated: boolean;
}

interface FoodReceiptProps {
    data: {
        log_id: string;
        items: FoodItem[];
        total_cals: number;
    };
    status?: string;
}

export function FoodReceipt({ data }: FoodReceiptProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 my-2 max-w-sm w-full mx-auto md:mx-0 shadow-lg">
            <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 size={18} />
                    <span className="font-medium text-sm">Saved to Journal</span>
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Receipt</span>
            </div>

            <div className="space-y-2">
                {data.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm group">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-200">{item.name}</span>
                            {item.is_estimated && (
                                <span title="Estimated portion" className="text-yellow-500 cursor-help">
                                    <AlertTriangle size={12} />
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-xs">{item.calories} cal</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-2 border-t border-gray-800 flex justify-between items-center">
                <span className="text-gray-400 text-sm font-medium">Total</span>
                <span className="text-white font-bold">{data.total_cals} kcal</span>
            </div>

            {/* Visual Macro Bar */}
            <div className="mt-2 flex h-1.5 w-full rounded-full overflow-hidden bg-gray-800">
                <div className="bg-blue-500 w-[40%]" title="Protein" />
                <div className="bg-green-500 w-[30%]" title="Carbs" />
                <div className="bg-red-500 w-[30%]" title="Fat" />
            </div>
        </div>
    );
}
