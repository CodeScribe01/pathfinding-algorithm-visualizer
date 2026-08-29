import { randomObstacles } from './randomObstacles.js'
import { recursiveDivision } from './recursiveDivision.js'
import { recursiveBacktracking } from './recursiveBacktracking.js'
import { randomizedPrims } from './prims.js'
import { openArea } from './mazeUtils.js'

/** Catalogue rendered by the maze dropdown and the technical write-up. */
export const MAZE_LIST = [
  {
    id: 'random',
    name: 'Random Obstacles',
    description: 'Independent per-cell scatter. May be unsolvable — useful for testing failure states.',
    solvable: false,
  },
  {
    id: 'division',
    name: 'Recursive Division',
    description: 'Bisects the board into chambers, always leaving one gap per wall. Always solvable.',
    solvable: true,
  },
  {
    id: 'backtracking',
    name: 'Recursive Backtracking',
    description: 'Randomised DFS carving. Long winding corridors, exactly one route between cells.',
    solvable: true,
  },
  {
    id: 'prims',
    name: "Randomized Prim's",
    description: 'Grows a corridor tree from random frontier cells. Dense, short dead ends.',
    solvable: true,
  },
]

export const MAZE_MAP = MAZE_LIST.reduce((acc, maze) => {
  acc[maze.id] = maze
  return acc
}, {})

const GENERATORS = {
  random: randomObstacles,
  division: recursiveDivision,
  backtracking: recursiveBacktracking,
  prims: randomizedPrims,
}

/** Generators that carve an odd/odd lattice and therefore need explicit
 *  openings so the start and target are never walled in. */
const LATTICE_GENERATORS = new Set(['backtracking', 'prims'])

/**
 * Build a wall field for the given board.
 *
 * @param {string} mazeId  entry from MAZE_LIST
 * @param {{rows:number, cols:number, source:number, target:number,
 *          density?:number, rng?:Function}} config
 * @returns {Uint8Array} wall field (1 = wall), start/target guaranteed open
 */
export function generateMaze(mazeId, { rows, cols, source, target, density, rng = Math.random }) {
  const generator = GENERATORS[mazeId]
  if (!generator) throw new Error(`Unknown maze generator: ${mazeId}`)

  const isProtected = (index) => index === source || index === target
  const walls = generator({ rows, cols, isProtected, density, rng })

  if (LATTICE_GENERATORS.has(mazeId)) {
    openArea(walls, rows, cols, Math.trunc(source / cols), source % cols)
    openArea(walls, rows, cols, Math.trunc(target / cols), target % cols)
  }

  walls[source] = 0
  walls[target] = 0
  return walls
}
