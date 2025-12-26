'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyCheckIn, calculateDailyScore } from './types';
import { TrendingUp } from 'lucide-react';

interface TrendChartProps {
    checkIns: DailyCheckIn[];
}

export function TrendChart({ checkIns }: TrendChartProps) {
    const chartData = useMemo(() => {
        const last7Days: { date: string; score: number | null; label: string }[] = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const checkIn = checkIns.find(c => c.date === dateStr);

            last7Days.push({
                date: dateStr,
                score: checkIn ? calculateDailyScore(checkIn) : null,
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            });
        }

        return last7Days;
    }, [checkIns]);

    const hasData = chartData.some(d => d.score !== null);

    if (!hasData) {
        return (
            <div className="panel-bg glow-border rounded-xl p-6 text-center">
                <TrendingUp size={32} className="text-cyan-500/30 mx-auto mb-2" />
                <p className="text-cyan-400/50 text-sm">No historical data</p>
                <p className="text-cyan-400/30 text-xs mt-1">
                    Complete daily check-ins to track your progress
                </p>
            </div>
        );
    }

    return (
        <div className="panel-bg glow-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <TrendingUp size={14} />
                Power Level History
            </h3>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="label"
                            tick={{ fill: '#67e8f9', fontSize: 10, fontWeight: 'bold' }}
                            axisLine={{ stroke: 'rgba(0, 212, 255, 0.2)' }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fill: '#67e8f9', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(0, 212, 255, 0.2)' }}
                            tickLine={false}
                            width={30}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="notification-panel px-4 py-3 rounded-lg">
                                            <p className="font-black text-xl text-cyan-100">{data.score ?? '—'}</p>
                                            <p className="text-cyan-400/60 text-xs">{data.date}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#00d4ff"
                            strokeWidth={3}
                            fill="url(#scoreGradient)"
                            connectNulls={false}
                            dot={{ fill: '#00d4ff', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#00d4ff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
