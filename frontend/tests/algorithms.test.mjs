import { runAlgorithm, ALGORITHM_IDS } from '../src/algorithms/index.js'
import { generateMaze, MAZE_LIST } from '../src/maze/index.js'

let failures = 0
const check = (name, cond, extra = '') => {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.log(`  FAIL  ${name} ${extra}`) }
}

const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function makeGrid(rows, cols, walls, weights) {
  return { rows, cols, walls: walls ?? new Uint8Array(rows * cols), weights: weights ?? new Uint8Array(rows * cols).fill(1) }
}

// Validate a returned path is contiguous, wall-free and correctly terminated.
function validatePath(grid, result, source, target) {
  if (!result.found) return 'not found'
  const { cols, walls } = grid
  const p = result.path
  if (p.length === 0) return 'empty path'
  if (p[0].row * cols + p[0].col !== source) return 'wrong start'
  if (p[p.length - 1].row * cols + p[p.length - 1].col !== target) return 'wrong end'
  for (let i = 0; i < p.length; i++) {
    const idx = p[i].row * cols + p[i].col
    if (walls[idx]) return `path crosses wall at ${i}`
    if (i > 0) {
      const d = Math.abs(p[i].row - p[i-1].row) + Math.abs(p[i].col - p[i-1].col)
      if (d !== 1) return `non-adjacent step at ${i}`
    }
  }
  if (result.pathLength !== p.length - 1) return 'pathLength mismatch'
  return null
}

console.log('\n== 1. Open board: optimality relationships ==')
{
  const rows = 21, cols = 41
  const grid = makeGrid(rows, cols)
  const source = 10 * cols + 3
  const target = 10 * cols + 37
  const results = Object.fromEntries(ALGORITHM_IDS.map(id => [id, runAlgorithm(id, grid, source, target)]))

  for (const id of ALGORITHM_IDS) {
    const err = validatePath(grid, results[id], source, target)
    check(`${id}: valid path`, err === null, err ?? '')
  }
  const optimal = results.bfs.pathLength
  check('bfs optimal step count = 34', optimal === 34, `got ${optimal}`)
  check('dijkstra matches bfs length', results.dijkstra.pathLength === optimal, `${results.dijkstra.pathLength}`)
  check('astar matches bfs length', results.astar.pathLength === optimal, `${results.astar.pathLength}`)
  check('bidirectional matches bfs length', results.bidirectional.pathLength === optimal, `${results.bidirectional.pathLength}`)
  check('astar expands fewer nodes than dijkstra', results.astar.nodesVisited < results.dijkstra.nodesVisited,
    `astar=${results.astar.nodesVisited} dijkstra=${results.dijkstra.nodesVisited}`)
  check('bidirectional expands fewer than bfs', results.bidirectional.nodesVisited < results.bfs.nodesVisited,
    `bi=${results.bidirectional.nodesVisited} bfs=${results.bfs.nodesVisited}`)
  check('dfs path is not shorter than optimal', results.dfs.pathLength >= optimal, `${results.dfs.pathLength}`)
  console.log('   stats:', Object.fromEntries(ALGORITHM_IDS.map(id => [id, `${results[id].nodesVisited}v/${results[id].pathLength}L/${results[id].pathCost}c`])))
}

console.log('\n== 2. Weighted board: cost optimality ==')
{
  const rows = 21, cols = 41
  const weights = new Uint8Array(rows * cols).fill(1)
  // Wall of expensive terrain down the middle.
  for (let r = 0; r < rows; r++) for (let c = 18; c <= 22; c++) weights[r * cols + c] = 5
  const grid = makeGrid(rows, cols, null, weights)
  const source = 10 * cols + 3
  const target = 10 * cols + 37
  const dijkstra = runAlgorithm('dijkstra', grid, source, target)
  const astar = runAlgorithm('astar', grid, source, target)
  const bfs = runAlgorithm('bfs', grid, source, target)
  check('dijkstra cost = astar cost (both optimal)', dijkstra.pathCost === astar.pathCost, `${dijkstra.pathCost} vs ${astar.pathCost}`)
  check('bfs cost >= dijkstra cost', bfs.pathCost >= dijkstra.pathCost, `bfs=${bfs.pathCost} dij=${dijkstra.pathCost}`)
  check('astar expands fewer than dijkstra (weighted)', astar.nodesVisited <= dijkstra.nodesVisited,
    `${astar.nodesVisited} vs ${dijkstra.nodesVisited}`)
  console.log(`   dijkstra cost=${dijkstra.pathCost} visited=${dijkstra.nodesVisited} | astar cost=${astar.pathCost} visited=${astar.nodesVisited} | bfs cost=${bfs.pathCost}`)
}

console.log('\n== 3. Mazes are solvable and every algorithm agrees ==')
for (const maze of MAZE_LIST) {
  const rows = 27, cols = 59
  const source = 13 * cols + 5
  const target = 13 * cols + 53
  const rng = mulberry32(maze.id.length * 7919 + 13)
  const walls = generateMaze(maze.id, { rows, cols, source, target, rng, density: 0.2 })
  const grid = makeGrid(rows, cols, walls)
  const results = ALGORITHM_IDS.map(id => ({ id, r: runAlgorithm(id, grid, source, target) }))
  const foundSet = new Set(results.map(x => x.r.found))
  check(`${maze.id}: all algorithms agree on reachability`, foundSet.size === 1,
    JSON.stringify(results.map(x => `${x.id}=${x.r.found}`)))
  if (maze.solvable) check(`${maze.id}: solvable as documented`, results[0].r.found)
  for (const { id, r } of results) {
    const err = validatePath(grid, r, source, target)
    if (r.found) check(`${maze.id}/${id}: valid path`, err === null, err ?? '')
  }
  if (results[0].r.found) {
    const opt = results.find(x => x.id === 'bfs').r.pathLength
    const bi = results.find(x => x.id === 'bidirectional').r.pathLength
    const astar = results.find(x => x.id === 'astar').r.pathLength
    check(`${maze.id}: bidirectional optimal`, bi === opt, `${bi} vs ${opt}`)
    check(`${maze.id}: astar optimal`, astar === opt, `${astar} vs ${opt}`)
  }
}

console.log('\n== 4. Unreachable target handled ==')
{
  const rows = 11, cols = 21
  const walls = new Uint8Array(rows * cols)
  for (let r = 0; r < rows; r++) walls[r * cols + 10] = 1
  const grid = makeGrid(rows, cols, walls)
  const source = 5 * cols + 2
  const target = 5 * cols + 18
  for (const id of ALGORITHM_IDS) {
    const r = runAlgorithm(id, grid, source, target)
    check(`${id}: reports no path`, r.found === false && r.path.length === 0 && r.pathCost === 0)
  }
}

console.log('\n== 5. Degenerate inputs ==')
{
  const grid = makeGrid(5, 5)
  for (const id of ALGORITHM_IDS) {
    const same = runAlgorithm(id, grid, 12, 12)
    check(`${id}: start === target`, same.found && same.pathLength === 0 && same.pathCost === 0,
      JSON.stringify({ found: same.found, len: same.pathLength }))
    const adj = runAlgorithm(id, grid, 12, 13)
    // DFS is non-optimal by design: it can reach an adjacent target the long way round.
    const ok = id === 'dfs' ? adj.found : adj.found && adj.pathLength === 1;
    check(`${id}: adjacent target`, ok, `len=${adj.pathLength}`)
  }
}

console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' FAILURE(S)'}\n`)
process.exit(failures === 0 ? 0 : 1)
