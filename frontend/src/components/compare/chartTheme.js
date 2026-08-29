/**
 * Shared Recharts theming.
 *
 * Series colours come from each algorithm's identity colour in the catalogue,
 * so the dot beside "Dijkstra" in the UI is the same hue as its bar. The set was
 * validated for the dark chart surface (lightness band, chroma floor, adjacent
 * CVD separation and >=3:1 contrast) rather than picked by eye — and identity is
 * never carried by colour alone: every bar is labelled on the category axis and
 * repeated in the comparison table.
 */
export const CHART_SURFACE = '#0c0e11'

export const AXIS_STYLE = {
  stroke: '#2a3038',
  tick: { fill: '#6b7480', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  tickLine: false,
  axisLine: false,
}

export const GRID_STYLE = {
  stroke: '#1e232a',
  strokeDasharray: '2 4',
  vertical: false,
}

/** Rounded data end anchored to the baseline. */
export const BAR_RADIUS = [4, 4, 0, 0]
