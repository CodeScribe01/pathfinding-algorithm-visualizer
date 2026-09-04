/** Board presets. Odd dimensions keep the lattice maze generators tidy. */
export const GRID_PRESETS = [
  { id: 'small', label: 'Small', rows: 15, cols: 31, hint: '15 × 31' },
  { id: 'medium', label: 'Medium', rows: 21, cols: 45, hint: '21 × 45' },
  { id: 'large', label: 'Large', rows: 27, cols: 59, hint: '27 × 59' },
  { id: 'xlarge', label: 'Extra large', rows: 33, cols: 71, hint: '33 × 71' },
]

export const DEFAULT_PRESET = 'large'

export const NODE_STATE = {
  EMPTY: 'empty',
  WALL: 'wall',
  WEIGHT: 'weight',
  START: 'start',
  TARGET: 'target',
  VISITED: 'visited',
  VISITED_ALT: 'visited-alt',
  FRONTIER: 'frontier',
  PATH: 'path',
}

export const TOOLS = {
  WALL: 'wall',
  WEIGHT: 'weight',
  ERASE: 'erase',
}

/** Animation speed presets: how many search steps are painted per second. */
export const SPEED_PRESETS = [
  { id: 'slow', label: 'Slow', stepsPerSecond: 25 },
  { id: 'normal', label: 'Normal', stepsPerSecond: 120 },
  { id: 'fast', label: 'Fast', stepsPerSecond: 450 },
  { id: 'instant', label: 'Instant', stepsPerSecond: 20000 },
]

export const DEFAULT_SPEED = 'normal'

export const VISUALIZER_STATUS = {
  IDLE: 'idle',
  COMPUTING: 'computing',
  RUNNING: 'running',
  PAUSED: 'paused',
  DONE: 'done',
}

export const STORAGE_KEYS = {
  ACCESS: 'pathforge.access',
  REFRESH: 'pathforge.refresh',
  USER: 'pathforge.user',
  PREFERENCES: 'pathforge.preferences',
}

export const GITHUB_URL =
  import.meta.env.VITE_GITHUB_URL ||
  'https://github.com/CodeScribe01/pathfinding-algorithm-visualizer'

// Static hosts (GitHub Pages) serve the client without the Django API. In that
// build the account-backed routes are hidden rather than left to fail on click.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
