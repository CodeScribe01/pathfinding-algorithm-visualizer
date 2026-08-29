/**
 * Static catalogue describing every algorithm the visualiser ships with.
 *
 * Kept separate from the implementations so that UI surfaces (selector, info
 * panel, /algorithms page, comparison table) render from one source of truth
 * and adding an algorithm is a two-file change: implementation + catalogue.
 */

export const ALGORITHM_LIST = [
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    shortName: 'BFS',
    category: 'Unweighted · Uninformed',
    tagline: 'Explores in expanding rings — guarantees the fewest steps.',
    description:
      'BFS sweeps the graph level by level from the start node using a FIFO queue. Because every edge counts the same, the first time it dequeues the target it has already found a path with the minimum number of steps. It is the baseline every other search is measured against.',
    dataStructure: 'Queue (FIFO)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    weighted: false,
    guaranteesShortestPath: true,
    optimalityNote: 'Shortest in number of steps. Ignores cell weights.',
    useCases: [
      'Shortest hop count in unweighted graphs',
      'Social-graph degrees of separation',
      'Flood fill and connected components',
      'Level-order traversal of trees',
    ],
    accent: '#3987e5',
    pseudocode: `queue ← [start]
discovered[start] ← true

while queue is not empty:
    node ← queue.dequeue()
    if node = target:
        return reconstructPath(node)

    for each neighbour of node:
        if not discovered[neighbour]:
            discovered[neighbour] ← true
            parent[neighbour] ← node
            queue.enqueue(neighbour)

return "no path"`,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    shortName: 'DFS',
    category: 'Unweighted · Uninformed',
    tagline: 'Commits to one branch until it dead-ends, then backtracks.',
    description:
      'DFS follows a single branch as deep as it can before backtracking, driven by a LIFO stack. It reaches a target quickly when it guesses the right direction and wanders badly when it does not — the resulting path is almost never short. It is invaluable for connectivity, cycle detection and maze carving.',
    dataStructure: 'Stack (LIFO)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    weighted: false,
    guaranteesShortestPath: false,
    optimalityNote: 'Finds a path, not the shortest one.',
    useCases: [
      'Cycle detection and topological sorting',
      'Maze generation (recursive backtracking)',
      'Exhaustive exploration / backtracking search',
      'Strongly connected components',
    ],
    accent: '#d95926',
    pseudocode: `stack ← [start]

while stack is not empty:
    node ← stack.pop()
    if visited[node]: continue
    visited[node] ← true

    if node = target:
        return reconstructPath(node)

    for each neighbour of node (reverse order):
        if not visited[neighbour]:
            parent[neighbour] ← node
            stack.push(neighbour)

return "no path"`,
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    shortName: 'Dijkstra',
    category: 'Weighted · Uninformed',
    tagline: 'Minimum-cost paths on graphs with non-negative weights.',
    description:
      'Dijkstra repeatedly finalises the unvisited node with the smallest tentative distance, relaxing its outgoing edges as it goes. With non-negative weights the first time a node is finalised its distance is provably optimal. On this board weighted cells cost 5 to enter, so Dijkstra will happily take a longer route to avoid expensive terrain.',
    dataStructure: 'Min-heap priority queue',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    weighted: true,
    guaranteesShortestPath: true,
    optimalityNote: 'Minimum total cost. Requires non-negative weights.',
    useCases: [
      'Road networks and routing engines',
      'Network latency / least-cost routing',
      'Any weighted shortest path without a usable heuristic',
      'Foundation for A*, Johnson and Yen k-shortest paths',
    ],
    accent: '#9085e9',
    pseudocode: `dist[start] ← 0, dist[v] ← ∞ for all other v
priorityQueue ← {(start, 0)}

while priorityQueue is not empty:
    node ← priorityQueue.extractMin()
    if finalized[node]: continue      // stale entry
    finalized[node] ← true

    if node = target:
        return reconstructPath(node)

    for each neighbour of node:
        alt ← dist[node] + weight(neighbour)
        if alt < dist[neighbour]:
            dist[neighbour] ← alt
            parent[neighbour] ← node
            priorityQueue.insert(neighbour, alt)`,
  },
  {
    id: 'astar',
    name: 'A* Search',
    shortName: 'A*',
    category: 'Weighted · Informed',
    tagline: 'Dijkstra guided by a heuristic — optimal and far more focused.',
    description:
      'A* orders its frontier by f(n) = g(n) + h(n): the cost already paid plus an estimate of the cost remaining. With an admissible, consistent heuristic — Manhattan distance on a 4-connected grid — it returns exactly the same optimal path as Dijkstra while expanding a fraction of the nodes. It is the default choice for grid and game pathfinding.',
    dataStructure: 'Min-heap priority queue + heuristic',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    weighted: true,
    guaranteesShortestPath: true,
    optimalityNote: 'Optimal while the heuristic never over-estimates.',
    useCases: [
      'Game AI and NPC navigation',
      'Robotics motion planning on occupancy grids',
      'GPS routing with geographic distance as heuristic',
      'Any search where a good cost estimate exists',
    ],
    accent: '#199e70',
    pseudocode: `g[start] ← 0
f[start] ← h(start, target)
openSet ← {(start, f[start])}

while openSet is not empty:
    node ← openSet.extractMin()      // lowest f
    if finalized[node]: continue
    finalized[node] ← true

    if node = target:
        return reconstructPath(node)

    for each neighbour of node:
        tentative ← g[node] + weight(neighbour)
        if tentative < g[neighbour]:
            g[neighbour] ← tentative
            parent[neighbour] ← node
            openSet.insert(neighbour, tentative + h(neighbour, target))`,
  },
  {
    id: 'greedy',
    name: 'Greedy Best-First Search',
    shortName: 'Greedy',
    category: 'Unweighted · Informed',
    tagline: 'Always steps toward the target — fast, frequently wrong.',
    description:
      'Greedy Best-First uses the same priority queue as A* but ranks nodes by the heuristic alone, ignoring the cost already paid. It races toward the goal and usually gets there with very few expansions, but a single misleading corridor is enough to make the path far from optimal. The contrast with A* is the clearest demonstration of what the g(n) term buys you.',
    dataStructure: 'Min-heap priority queue (heuristic only)',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    weighted: false,
    guaranteesShortestPath: false,
    optimalityNote: 'No optimality guarantee — ignores accumulated cost.',
    useCases: [
      'Fast approximate routing when "good enough" is fine',
      'Real-time systems with a hard frame budget',
      'Heuristic search teaching baseline',
      'First pass before a refinement search',
    ],
    accent: '#c98500',
    pseudocode: `openSet ← {(start, h(start, target))}
discovered[start] ← true

while openSet is not empty:
    node ← openSet.extractMin()      // lowest h only
    if expanded[node]: continue
    expanded[node] ← true

    if node = target:
        return reconstructPath(node)

    for each neighbour of node:
        if not discovered[neighbour]:
            discovered[neighbour] ← true
            parent[neighbour] ← node
            openSet.insert(neighbour, h(neighbour, target))`,
  },
  {
    id: 'bidirectional',
    name: 'Bidirectional BFS',
    shortName: 'Bi-BFS',
    category: 'Unweighted · Uninformed',
    tagline: 'Two frontiers, one meeting point — exponentially less search.',
    description:
      'Bidirectional BFS grows a breadth-first frontier from the start and another from the target, always expanding the smaller of the two, and stops the moment they touch. Each search only has to reach half the depth, which turns O(b^d) into O(2·b^(d/2)) — a huge reduction on open boards for exactly the same optimal step count.',
    dataStructure: 'Two synchronised queues',
    timeComplexity: 'O(b^(d/2))',
    spaceComplexity: 'O(b^(d/2))',
    weighted: false,
    guaranteesShortestPath: true,
    optimalityNote: 'Shortest in steps. Requires a known, reachable target.',
    useCases: [
      'Large unweighted graphs with a known goal',
      'Word-ladder and puzzle state-space search',
      'Social network shortest connection queries',
      'Meet-in-the-middle search strategies',
    ],
    accent: '#d55181',
    pseudocode: `frontierF ← {start},  frontierB ← {target}
seenF[start] ← true,  seenB[target] ← true

while both frontiers are non-empty:
    expand the SMALLER frontier one full level:
        for each node in frontier:
            for each neighbour:
                if already seen on this side: continue
                mark seen, record parent, add to next level
                if seen on the OTHER side:
                    return stitch(parentF, parentB, neighbour)

return "no path"`,
  },
]

export const ALGORITHM_MAP = ALGORITHM_LIST.reduce((acc, algorithm) => {
  acc[algorithm.id] = algorithm
  return acc
}, {})

export const ALGORITHM_IDS = ALGORITHM_LIST.map((algorithm) => algorithm.id)

export const getAlgorithmMeta = (id) => ALGORITHM_MAP[id] ?? ALGORITHM_LIST[0]

export const DEFAULT_ALGORITHM = 'astar'
