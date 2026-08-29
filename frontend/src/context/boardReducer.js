import { WEIGHT_COST } from '@/algorithms'
import { GRID_PRESETS, DEFAULT_PRESET } from '@/lib/constants'
import {
  applyWallField,
  clearObstacles,
  clearWalls,
  clearWeights,
  createGrid,
  defaultEndpoints,
  deserializeGrid,
  moveMarker,
  updateCell,
} from '@/lib/grid'

export const findPreset = (presetId) =>
  GRID_PRESETS.find((preset) => preset.id === presetId) ?? GRID_PRESETS[2]

export function createBoardState(presetId = DEFAULT_PRESET) {
  const preset = findPreset(presetId)
  const { start, target } = defaultEndpoints(preset.rows, preset.cols)
  return {
    presetId: preset.id,
    rows: preset.rows,
    cols: preset.cols,
    grid: createGrid(preset.rows, preset.cols, start, target),
    start,
    target,
    mazeType: null,
    // Bumped on every structural change so the visualiser knows to wipe its
    // DOM overlay; it is cheaper than diffing 2 000 cells.
    version: 0,
  }
}

const bump = (state, patch) => ({ ...state, ...patch, version: state.version + 1 })

export function boardReducer(state, action) {
  switch (action.type) {
    case 'SET_PRESET': {
      if (action.presetId === state.presetId) return state
      return createBoardState(action.presetId)
    }

    case 'PAINT': {
      const { row, col, tool, erase } = action
      const cell = state.grid[row][col]
      if (cell.isStart || cell.isTarget) return state

      if (tool === 'weight') {
        const weight = erase ? 1 : WEIGHT_COST
        if (cell.weight === weight && !cell.isWall) return state
        return bump(state, { grid: updateCell(state.grid, row, col, { weight, isWall: false }) })
      }

      const isWall = !erase
      if (cell.isWall === isWall && cell.weight === 1) return state
      return bump(state, { grid: updateCell(state.grid, row, col, { isWall, weight: 1 }) })
    }

    case 'MOVE_MARKER': {
      const { marker, row, col } = action
      const current = marker === 'start' ? state.start : state.target
      const other = marker === 'start' ? state.target : state.start
      if (row === other.row && col === other.col) return state
      if (row === current.row && col === current.col) return state

      const key = marker === 'start' ? 'isStart' : 'isTarget'
      const grid = moveMarker(state.grid, current, { row, col }, key)
      return bump(state, {
        grid,
        [marker]: { row, col },
      })
    }

    case 'SET_WALL_FIELD':
      return bump(state, {
        grid: applyWallField(state.grid, action.walls, state.cols),
        mazeType: action.mazeType ?? null,
      })

    case 'CLEAR_WALLS':
      return bump(state, { grid: clearWalls(state.grid), mazeType: null })

    case 'CLEAR_WEIGHTS':
      return bump(state, { grid: clearWeights(state.grid) })

    case 'CLEAR_BOARD':
      return bump(state, { grid: clearObstacles(state.grid), mazeType: null })

    case 'RESET_BOARD':
      return { ...createBoardState(state.presetId), version: state.version + 1 }

    case 'LOAD_GRID': {
      const { rows, cols } = action.payload
      const start = action.start
      const target = action.target
      // Resolve back to a real preset when the saved board matches one, so the
      // size selector stays in sync after loading.
      const matchingPreset = GRID_PRESETS.find(
        (preset) => preset.rows === rows && preset.cols === cols,
      )
      return {
        presetId: matchingPreset ? matchingPreset.id : state.presetId,
        rows,
        cols,
        grid: deserializeGrid(action.payload, start, target),
        start,
        target,
        mazeType: null,
        version: state.version + 1,
      }
    }

    default:
      return state
  }
}
