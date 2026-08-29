import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '@/components/ui'
import { ChartTooltip } from './ChartTooltip'
import { AXIS_STYLE, BAR_RADIUS, GRID_STYLE } from './chartTheme'
import { formatMs, formatNumber } from '@/lib/format'

function MetricChart({ title, description, data, dataKey, formatter, unit }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 4 }} barCategoryGap={14}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="name" {...AXIS_STYLE} interval={0} />
            <YAxis {...AXIS_STYLE} width={46} tickFormatter={(value) => formatNumber(value)} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.035)' }}
              content={<ChartTooltip formatter={formatter} unit={unit} />}
            />
            <Bar dataKey={dataKey} radius={BAR_RADIUS} maxBarSize={54} isAnimationActive={false}>
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

/**
 * Three single-measure charts rather than one dual-axis chart: nodes visited,
 * execution time and path cost live on completely different scales, and
 * overlaying them would make the comparison unreadable.
 */
export function ComparisonCharts({ rows }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <MetricChart
        title="Nodes visited"
        description="Lower means less of the board was expanded"
        data={rows}
        dataKey="nodesVisited"
        formatter={formatNumber}
        unit="nodes"
      />
      <MetricChart
        title="Execution time"
        description="Search only — excludes animation"
        data={rows}
        dataKey="executionTime"
        formatter={(value) => formatMs(value)}
      />
      <MetricChart
        title="Path cost"
        description="Sum of entry costs along the returned path"
        data={rows}
        dataKey="pathCost"
        formatter={formatNumber}
        unit="cost"
      />
    </div>
  )
}

export default ComparisonCharts
