'use client';

import { Activity, Zap, Droplets, Utensils } from 'lucide-react';

interface RadarData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    raw_logs_count: number;
}

export default function ActiveRadarWidget({ data }: { data: RadarData | null }) {
    if (!data) return (
        <div className="px-4 py-3 bg-[#1a1d24]/50 rounded-xl border border-[#2a2d34] animate-pulse">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-gray-700 rounded-full"></div>
                <div className="h-3 w-20 bg-gray-700 rounded"></div>
            </div>
            <div className="h-8 w-full bg-gray-800/50 rounded-lg"></div>
        </div>
    );

    return (
        <div className="px-4 py-4 bg-[#1a1d24] rounded-xl border border-[#2a2d34] group hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1 px-1.5 bg-emerald-500/10 rounded flex items-center justify-center">
                        <Activity size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Radar</span>
                </div>
                <span className="text-[9px] text-gray-500 bg-gray-800/50 px-1.5 py-0.5 rounded-full font-medium">Today</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                        <Zap size={10} className="text-yellow-500" /> CALS
                    </div>
                    <div className="text-lg font-black text-gray-100 tracking-tight leading-none">
                        {data.calories}
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                        <Utensils size={10} className="text-emerald-500" /> PRO
                    </div>
                    <div className="text-lg font-black text-gray-100 tracking-tight leading-none">
                        {data.protein}g
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                        <Droplets size={10} className="text-blue-500" /> CARBS
                    </div>
                    <div className="text-lg font-black text-gray-100 tracking-tight leading-none">
                        {data.carbs}g
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                        <div className="w-2 h-2 rounded-full bg-orange-500" /> FAT
                    </div>
                    <div className="text-lg font-black text-gray-100 tracking-tight leading-none">
                        {data.fat}g
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-800/50 flex items-center justify-between">
                <span className="text-[9px] text-gray-600 font-medium uppercase">{data.raw_logs_count} Entries</span>
                <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-1 h-3 rounded-full ${i < (data.raw_logs_count > 0 ? 3 : 0) ? 'bg-emerald-500/20' : data.raw_logs_count > 0 ? 'bg-emerald-500' : 'bg-gray-800'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
