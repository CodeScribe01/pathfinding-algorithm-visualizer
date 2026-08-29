import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardHeader, EmptyState } from '@/components/ui'
import { ChartTooltip } from '@/components/compare/ChartTooltip'
import { AXIS_STYLE, BAR_RADIUS, GRID_STYLE } from '@/components/compare/chartTheme'
import { getAlgorithmMeta } from '@/algorithms'
import { formatMs, formatNumber } from '@/lib/format'

/** Runs per algorithm — colour repeats the identity already on the axis label. */
export function AlgorithmUsageChart({ byAlgorithm }) {
  const data = byAlgorithm.map((entry) => {
    const meta = getAlgorithmMeta(entry.algorithm)
    return {
      id: entry.algorithm,
      name: meta.shortName,
      accent: meta.accent,
      runs: entry.runs,
      avgNodes: Math.round(entry.avg_nodes_visited ?? 0),
    }
  })

  return (
    <Card>
      <CardHeader title="Runs per algorithm" description="Which strategies you reach for" />
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 4 }} barCategoryGap={16}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="name" {...AXIS_STYLE} interval={0} />
            <YAxis {...AXIS_STYLE} width={36} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.035)' }}
              content={<ChartTooltip formatter={formatNumber} unit="runs" />}
            />
            <Bar dataKey="runs" radius={BAR_RADIUS} maxBarSize={48} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.accent} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/** Average nodes expanded per algorithm — the efficiency read-out. */
export function EfficiencyChart({ byAlgorithm }) {
  const data = byAlgorithm.map((entry) => {
    const meta = getAlgorithmMeta(entry.algorithm)
    return {
      id: entry.algorithm,
      name: meta.shortName,
      accent: meta.accent,
      avgNodes: Math.round(entry.avg_nodes_visited ?? 0),
      avgTime: entry.avg_execution_time ?? 0,
    }
  })

  return (
    <Card>
      <CardHeader
        title="Average nodes visited"
        description="Lower is leaner — averaged across your runs"
      />
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 4 }} barCategoryGap={16}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="name" {...AXIS_STYLE} interval={0} />
            <YAxis {...AXIS_STYLE} width={44} tickFormatter={formatNumber} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.035)' }}
              content={<ChartTooltip formatter={formatNumber} unit="nodes" />}
            />
            <Bar dataKey="avgNodes" radius={BAR_RADIUS} maxBarSize={48} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.accent} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/** Daily run volume. Single series, so the title names it and no legend is needed. */
export function ActivityChart({ runsPerDay }) {
  if (!runsPerDay || runsPerDay.length === 0) {
    return (
      <Card>
        <CardHeader title="Activity" description="Runs recorded per day" />
        <EmptyState
          compact
          title="Not enough history yet"
          description="Daily activity appears once you have runs across more than one day."
        />
      </Card>
    )
  }

  const data = runsPerDay.map((entry) => ({
    date: entry.date?.slice(5) ?? '',
    runs: entry.runs,
    avgTime: entry.avg_execution_time ?? 0,
  }))

  return (
    <Card>
      <CardHeader title="Activity" description="Runs recorded per day" />
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3987e5" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3987e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="date" {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} width={32} allowDecimals={false} />
            <Tooltip
              cursor={{ stroke: '#2a3038', strokeWidth: 1 }}
              content={<ChartTooltip formatter={formatNumber} unit="runs" />}
            />
            <Area
              type="monotone"
              dataKey="runs"
              stroke="#3987e5"
              strokeWidth={2}
              fill="url(#activityFill)"
              isAnimationActive={false}
              dot={{ r: 2.5, fill: '#3987e5', strokeWidth: 0 }}
              activeDot={{ r: 4, stroke: '#0c0e11', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export const formatAverageTime = (value) => formatMs(Number(value ?? 0))
