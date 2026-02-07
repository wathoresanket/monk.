import { MomentStats, TimeScope } from '@/types/monk';
import { DAY_NAMES, getDateString, getStartOfWeek, getStartOfMonth } from '@/lib/utils';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RhythmChartProps {
    stats: MomentStats;
    scope: TimeScope;
}

export function RhythmChart({ stats, scope }: RhythmChartProps) {
    const data = useMemo(() => {
        const dailyMinutes = stats.dailyMinutes;
        const now = new Date();

        if (scope === 'week') {
            const weekStart = getStartOfWeek(now);
            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                const dateStr = getDateString(d);
                days.push({
                    label: DAY_NAMES[d.getDay()],
                    minutes: dailyMinutes[dateStr] || 0,
                    date: dateStr,
                    isToday: dateStr === getDateString(now),
                });
            }
            return days;
        }

        if (scope === 'month') {
            const monthStart = getStartOfMonth(now);
            const days = [];
            const tempDate = new Date(monthStart);
            while (tempDate.getMonth() === monthStart.getMonth()) {
                const dateStr = getDateString(tempDate);
                days.push({
                    label: tempDate.getDate().toString(),
                    minutes: dailyMinutes[dateStr] || 0,
                    date: dateStr,
                    isToday: dateStr === getDateString(now),
                });
                tempDate.setDate(tempDate.getDate() + 1);
            }
            return days;
        }

        // All time: explicit dates from the stats range
        const dates = Object.keys(dailyMinutes).sort();
        if (dates.length === 0) return [];

        const start = new Date(dates[0]);
        const end = new Date(); // up to today
        const days = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = getDateString(d);
            days.push({
                label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                minutes: dailyMinutes[dateStr] || 0,
                date: dateStr,
                isToday: dateStr === getDateString(now),
            });
        }
        return days;
    }, [stats.dailyMinutes, scope]);

    if (data.length === 0) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data yet
            </div>
        );
    }

    return (
        <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        interval={scope === 'month' ? 2 : scope === 'all' ? 'preserveStartEnd' : 0}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                        formatter={(value: number) => [`${value} min`, 'Focus']}
                    />
                    <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
