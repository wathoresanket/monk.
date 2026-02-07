
import { MoodType, MOOD_LABELS } from '@/types/monk';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MoodDistributionProps {
    distribution: Record<MoodType, number>;
    totalCount: number;
}

export function MoodDistribution({ distribution }: MoodDistributionProps) {
    const data = [
        { name: 'Clear', count: distribution.clear, fill: 'hsl(var(--monk-clear))', key: 'clear' },
        { name: 'Neutral', count: distribution.neutral, fill: 'hsl(var(--monk-neutral))', key: 'neutral' },
        { name: 'Scattered', count: distribution.scattered, fill: 'hsl(var(--monk-scattered))', key: 'scattered' },
    ];

    if (data.every(d => d.count === 0)) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-muted-foreground text-sm">
                No moods recorded yet
            </div>
        );
    }

    return (
        <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
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
                        formatter={(value: number) => [`${value}`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={48}>
                        {data.map((entry) => (
                            <Cell key={entry.key} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
