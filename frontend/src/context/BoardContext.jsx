import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import { boardReducer, createBoardState } from './boardReducer'
import { generateMaze } from '@/maze'
import { encodeGrid, toIndex } from '@/lib/grid'
import { DEFAULT_PRESET } from '@/lib/constants'

const BoardContext = createContext(null)

/**
 * Shared board state.
 *
 * Lifting the grid above the router is what lets /compare run every algorithm
 * against *the same* board the user just drew in the visualiser — the headline
 * feature of the comparison page.
 */
export function BoardProvider({ children }) {
  const [board, dispatch] = useReducer(boardReducer, DEFAULT_PRESET, createBoardState)

  const actions = useMemo(
    () => ({
      setPreset: (presetId) => dispatch({ type: 'SET_PRESET', presetId }),
      paint: (row, col, tool, erase) => dispatch({ type: 'PAINT', row, col, tool, erase }),
      moveMarker: (marker, row, col) => dispatch({ type: 'MOVE_MARKER', marker, row, col }),
      clearWalls: () => dispatch({ type: 'CLEAR_WALLS' }),
      clearWeights: () => dispatch({ type: 'CLEAR_WEIGHTS' }),
      clearBoard: () => dispatch({ type: 'CLEAR_BOARD' }),
      resetBoard: () => dispatch({ type: 'RESET_BOARD' }),
      loadGrid: (payload, start, target) =>
        dispatch({ type: 'LOAD_GRID', payload, start, target }),
    }),
    [],
  )

  const generate = useCallback(
    (mazeId, options = {}) => {
      const walls = generateMaze(mazeId, {
        rows: board.rows,
        cols: board.cols,
        source: toIndex(board.cols, board.start),
        target: toIndex(board.cols, board.target),
        ...options,
      })
      dispatch({ type: 'SET_WALL_FIELD', walls, mazeType: mazeId })
    },
    [board.rows, board.cols, board.start, board.target],
  )

  /** Typed-array snapshot handed to the search layer / worker. */
  const encode = useCallback(
    () => ({
      encoded: encodeGrid(board.grid),
      source: toIndex(board.cols, board.start),
      target: toIndex(board.cols, board.target),
    }),
    [board.grid, board.cols, board.start, board.target],
  )

  const value = useMemo(
    () => ({ board, ...actions, generate, encode }),
    [board, actions, generate, encode],
  )

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

export function useBoard() {
  const context = useContext(BoardContext)
  if (!context) throw new Error('useBoard must be used inside <BoardProvider>')
  return context
}
