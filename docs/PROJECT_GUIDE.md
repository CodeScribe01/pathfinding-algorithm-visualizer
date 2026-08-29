# PathForge — Project & Presentation Guide

*Analysis of Algorithms — pathfinding algorithm visualizer*

A single reference for setting the project up, presenting it, and answering questions about it.

---

## 1. The one-minute pitch

> PathForge is an interactive pathfinding laboratory. You draw a grid — walls, weighted terrain,
> a start and a target — pick one of six search algorithms, and watch it expand node by node in
> real time. Every run is measured, so you can put BFS, Dijkstra and A\* on the *same* board and
> see exactly why A\* reaches the target after expanding a third as many nodes for an identical
> path.
>
> All six algorithms are implemented from scratch — no pathfinding library. They run in the
> browser on a Web Worker so the animation stays smooth, while a Django REST API backed by SQL
> Server handles authentication, run history and analytics.

**If you only say one sentence:** *"It makes algorithm complexity visible instead of theoretical,
and it's a full three-tier application, not a toy."*

---

## 2. Problem statement and objectives

**Problem.** Complexity analysis is taught symbolically. A student can write `O((V+E) log V)` for
Dijkstra and `O((V+E) log V)` for A\* and conclude they are equivalent — the notation hides that
A\* explores dramatically less of the graph in practice. There is no intuition attached to the
symbols.

**Objectives.**

| # | Objective | How it is met |
|---|---|---|
| 1 | Implement classic graph search from first principles | Six algorithms, own min-heap, no external library |
| 2 | Make the *behaviour* of each algorithm observable | Step-by-step animation of the expansion trace |
| 3 | Make comparison empirical, not anecdotal | `/compare` runs N algorithms on one identical board |
| 4 | Demonstrate correct complexity analysis | Measured nodes visited, peak frontier, execution time |
| 5 | Build it as real software | Three-tier architecture, REST API, auth, persistence, tests |

---

## 3. System architecture

```
┌─────────────────────────────── BROWSER ───────────────────────────────┐
│                                                                       │
│   React 18 + Vite                                                     │
│   ┌───────────────┐   ┌──────────────────┐   ┌────────────────────┐   │
│   │  UI layer     │   │  Animation       │   │  Web Worker        │   │
│   │  48 components│──▶│  engine          │◀──│  runs the search   │   │
│   │  6 hooks      │   │  (rAF, direct    │   │  off the main      │   │
│   │               │   │   DOM writes)    │   │  thread            │   │
│   └───────────────┘   └──────────────────┘   └─────────┬──────────┘   │
│                                                        │              │
│                              ┌─────────────────────────▼───────────┐  │
│                              │  algorithms/  (pure JS, no React)   │  │
│                              │  BFS · DFS · Dijkstra · A* ·        │  │
│                              │  Greedy · Bidirectional · MinHeap   │  │
│                              │  maze/  4 generators                │  │
│                              └─────────────────────────────────────┘  │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │  REST + JWT (Bearer)
                                    ▼
┌────────────────────────── DJANGO REST FRAMEWORK ──────────────────────┐
│   accounts/         custom user, register / login / refresh / logout  │
│   visualizations/   runs, saved grids, statistics aggregation         │
│   drf-spectacular   OpenAPI 3 schema + Swagger UI                     │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │  Django ORM (mssql-django + pyodbc)
                                    ▼
┌─────────────────────── MICROSOFT SQL SERVER ──────────────────────────┐
│   pathforge_user · pathforge_visualization_run · pathforge_saved_grid │
│   composite indexes · check constraints · foreign keys                │
└───────────────────────────────────────────────────────────────────────┘
```

**The key architectural decision:** search executes on the *client*, persistence on the *server*.

An animated visualiser needs the full expansion trace locally at 60 fps. Round-tripping ~2,000
steps to a server would add latency without adding correctness. The server owns what a browser
should not: identity, durable storage and cross-run aggregation. Be ready to defend this — it is
the most likely architecture question.

---

## 4. Technology stack

| Layer | Technology | Why this one |
|---|---|---|
| UI | **React 18** | Component model suits a dashboard with many independent controls |
| Build | **Vite** | Instant dev server, native Web Worker and code-splitting support |
| Styling | **Tailwind CSS** | Design tokens in config keep 48 components visually consistent |
| Motion | **Framer Motion** | Declarative transitions; used sparingly, never on the grid itself |
| Charts | **Recharts** | Composable React charts for the comparison and analytics pages |
| API | **Django REST Framework** | Serializers, viewsets and permissions remove boilerplate |
| Auth | **JWT (simplejwt)** | Stateless — no server session store; correct for a SPA |
| Docs | **drf-spectacular** | OpenAPI 3 generated from the code, so docs cannot drift |
| Database | **Microsoft SQL Server** | Accessed purely through the Django ORM |


---

## 5. Algorithms implemented

V = walkable cells (vertices), E = edges (at most 4V on a 4-connected grid), b = branching
factor, d = solution depth.

| Algorithm | Strategy | Data structure | Time | Space | Optimal? |
|---|---|---|---|---|---|
| **BFS** | Expand in rings, level by level | Queue (FIFO) | `O(V + E)` | `O(V)` | Yes — fewest **steps** |
| **DFS** | Follow one branch to a dead end, backtrack | Stack (LIFO) | `O(V + E)` | `O(V)` | No |
| **Dijkstra** | Always finalise the cheapest known node | Min-heap | `O((V + E) log V)` | `O(V)` | Yes — lowest **cost** |
| **A\*** | Dijkstra ordered by `f = g + h` | Min-heap + heuristic | `O((V + E) log V)` | `O(V)` | Yes, if `h` is admissible |
| **Greedy Best-First** | Order by `h` alone, ignore cost paid | Min-heap | `O((V + E) log V)` | `O(V)` | No |
| **Bidirectional BFS** | Two frontiers, stop when they meet | Two queues | `O(b^(d/2))` | `O(b^(d/2))` | Yes — fewest steps |

**What each one is in the project to demonstrate:**

- **BFS vs DFS** — same complexity class, wildly different behaviour. DFS finds *a* path, often
  three times longer.
- **BFS vs Dijkstra** — identical on an unweighted board; the moment you paint weighted terrain
  they diverge, because BFS minimises steps and Dijkstra minimises cost.
- **Dijkstra vs A\*** — identical *result*, very different *work done*. This is the headline: same
  asymptotic complexity, a fraction of the nodes expanded.
- **A\* vs Greedy** — what the `g(n)` term actually buys. Greedy is faster and frequently wrong.
- **BFS vs Bidirectional** — `b^d` collapsing to `2·b^(d/2)`.

### Maze generation

| Generator | Method | Property |
|---|---|---|
| Random Obstacles | Independent per-cell probability | May be unsolvable — used to demo the "no path" state |
| Recursive Division | Recursively bisect, leave one gap per wall | Always solvable by construction |
| Recursive Backtracking | Randomised DFS carving on an odd lattice | Perfect maze — exactly one route between any two cells |
| Randomized Prim's | Grow a corridor tree from random frontier cells | Many short dead ends; hardest board for DFS |

---

## 6. Key design decisions (the engineering depth)

**Graph representation — implicit, not an adjacency list.**
Every walkable cell is a vertex; edges join 4-adjacent cells. Building an adjacency list would
cost `O(V + E)` memory and thousands of allocations per run. Instead the board lives in flat
typed arrays and neighbours are derived arithmetically:

```
index = row * cols + col
walls   = Uint8Array(rows * cols)    // 1 = impassable
weights = Uint8Array(rows * cols)    // entry cost: 1, or 5 for weighted terrain
```

**Weights are node entry costs.** Stepping onto cell `n` costs `weights[n]`. Two bytes per cell
still gives Dijkstra and A\* a genuinely weighted graph.

**Own binary min-heap, no decrease-key.** Keys and priorities live in parallel `Int32Array` /
`Float64Array` buffers, so no wrapper object is allocated per push. Relaxing an edge pushes a
*second* entry rather than decreasing a key (lazy deletion); the stale entry is discarded on pop
because that vertex is already finalised. This trades a little extra heap traffic for dropping the
index-tracking table entirely, and every operation stays `O(log V)`.

**Manhattan heuristic — admissible and consistent.** On a 4-connected grid where the cheapest step
costs 1, Manhattan distance can never overestimate the true remaining cost. That is exactly the
condition under which A\* is guaranteed optimal. No tie-breaking multiplier is applied, because
scaling `h` upward trades the optimality guarantee for speed.

**One uniform result envelope.** Every algorithm returns the same shape, which is what keeps the
visualiser, the comparison page and the API decoupled from search internals:

```js
{
  visitedOrder: [{ row, col, frontierSize, side? }],  // drives the animation
  path: [{ row, col }],
  pathCost, pathLength, nodesVisited,
  maxFrontier, operations, executionTime, found
}
```

Adding a seventh algorithm is one module plus one catalogue entry — no UI change.

**Three performance decisions** for a 2,343-cell board:

1. **Search runs on a Web Worker** — computing a trace never blocks input, and `/compare` can run
   six algorithms without freezing the UI. A synchronous fallback covers browsers without workers.
2. **The animation bypasses React** — the engine writes `data-state` directly onto cell DOM nodes
   and CSS owns the transition, so the component tree does not re-render during playback. Only a
   throttled stats readout touches React state.
3. **Editing uses structural sharing** — painting a wall copies one row and one cell, so memoised
   cells elsewhere skip re-rendering. Pointer handling is delegated to the board container instead
   of bound to 2,000 individual cells.

Playback is **time-based, not frame-based**: each frame consumes `dt × stepsPerSecond` from a
budget, so it runs at the same speed on 60 Hz and 144 Hz displays and speed changes apply mid-run.

---

## 7. Database design

Three tables, third normal form, indexed for the two queries that actually run.

**`pathforge_user`** — custom user model, swapped in from the start via `AUTH_USER_MODEL`
(retrofitting one later is painful).

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | PK |
| `username` | nvarchar(150) | unique |
| `email` | nvarchar(254) | unique, indexed |
| `password` | nvarchar(128) | PBKDF2-SHA256, 720,000 iterations |
| `created_at` | datetimeoffset | indexed |

**`pathforge_visualization_run`** — one row per completed search.

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | PK |
| `user_id` | bigint | FK, cascade delete |
| `algorithm` | nvarchar(20) | constrained to the six choices, indexed |
| `grid_rows`, `grid_columns` | smallint | check constraint `>= 2` |
| `nodes_visited`, `path_length`, `path_cost` | int | |
| `execution_time` | decimal(12,3) | milliseconds |
| `path_found` | bit | |
| `max_frontier_size` | int | peak queue size — the space-complexity proxy |
| `maze_type`, `heuristic` | nvarchar(20) | nullable |
| `created_at` | datetimeoffset | indexed |

**`pathforge_saved_grid`** — a board the user kept.

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | PK |
| `user_id` | bigint | FK, cascade delete |
| `name` | nvarchar(160) | unique **per user** |
| `grid_data` | nvarchar(max) | JSON, with an `isjson()` check constraint |
| `start_position`, `target_position` | nvarchar(max) | JSON `{row, col}` |
| `created_at` | datetimeoffset | indexed |

**Indexing rationale** — indexes exist for queries the application actually makes, not decoration:

| Index | Serves |
|---|---|
| `run_user_created_idx` on `(user, -created_at)` | history list: "my newest runs" |
| `run_user_algorithm_idx` on `(user, algorithm)` | analytics: "group my runs by algorithm" |
| `grid_user_created_idx` on `(user, -created_at)` | saved-board list |
| `user_email_idx` on `(email)` | login and uniqueness checks |

**Storage choice worth mentioning:** `grid_data` stores walls and weights as *flat indices*
(`[100, 101, 102]`) rather than a 2-D matrix. A 33×71 board becomes a few hundred bytes instead of
a few thousand.

---

## 8. Setup

Requires **Node.js 18+**, **Python 3.10+**, and SQL Server (or SQLite — see below).

### Frontend

```powershell
cd frontend
npm install
npm run dev            # http://localhost:5173
```

The visualiser, algorithms page and comparison all work **without the backend running** — the
searches are client-side. Only sign-in, history and analytics need the API.

### Backend

Windows PowerShell 5.1 does not support `&&`, so run these one line at a time:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Then edit `.env`. **For SQL Server** — create the database first in SSMS, then:

```
DB_ENGINE=mssql
DB_NAME=PathForgeDB
DB_HOST=localhost\SQLEXPRESS01     # your instance name
DB_USER=                          # blank = Windows integrated authentication
DB_PASSWORD=
```

**To run without SQL Server**, set `DB_ENGINE=sqlite` — nothing else changes.

```powershell
python manage.py makemigrations accounts visualizations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver        # http://127.0.0.1:8000
```

| URL | |
|---|---|
| `http://localhost:5173/` | the application |
| `http://127.0.0.1:8000/api/docs/` | Swagger UI |
| `http://127.0.0.1:8000/admin/` | Django admin |

### Tests

```powershell
cd frontend
npm test               # 114 assertions
npm run lint
```

---

## 9. Demo script (about 7 minutes)

Have both servers running **before** you walk in. Rehearse this order — it builds an argument
rather than just showing features.

**1 · Landing page (20 s).**
"The grid in the hero isn't a video — it's running the real algorithms on a generated maze."
Scroll to the comparison table: "those numbers are computed when the page loads."

**2 · A\* on an empty board (30 s).**
Visualizer → **Visualize**. "It walks almost straight to the target — that's the heuristic. About
41 nodes expanded for a 40-step path."

**3 · BFS on a maze, slow speed (60 s).**
**Generate maze** → speed **Slow** → algorithm **BFS** → **Visualize**.
"BFS expands in rings — everything at distance 1, then distance 2. That's why it's guaranteed to
find the fewest steps, and why it explores so much." Point at **Frontier** in the right panel:
"that's the live queue length."

**4 · A\* on the same maze (45 s).** *This is the money shot.*
Switch to **A\*** → **Visualize**. "Same board, same path length — now look at nodes visited."
Point at the stats bar. "Identical `O((V+E) log V)` complexity, a fraction of the work. The
notation hides that. The board doesn't."

**5 · Weighted terrain (60 s).**
Tool → **Weight**, paint a band across the middle. Run **BFS**, note the path cost. Run
**Dijkstra**. "Same number of steps is no longer the same cost. BFS charges straight through the
expensive terrain; Dijkstra routes around it. That's unweighted versus weighted shortest path."

**6 · Compare page (90 s).**
Select all six → **Run comparison**. "Identical board for every algorithm — no cherry-picking."
Walk the table: DFS's path length, Greedy's low expansion count but higher cost, A\* winning on
efficiency. Then the explored-area thumbnails: "you can *see* the difference in search shape."

**7 · Full stack (90 s).**
Register → run one visualisation → **History** ("that run was just persisted") → **Analytics**
("aggregated in SQL, not in the browser — and empty for a new account rather than showing fake
data").

**8 · Proof it's real (60 s).**
- **SSMS** → `PathForgeDB` → `select * from pathforge_visualization_run` → "there's the row."
- **Swagger UI** → "the API documents itself from the code."
- Terminal → `npm test` → "114 assertions, including that A\* and Dijkstra always agree on cost."

**Close:** "Six algorithms from scratch, a measured comparison, and a three-tier stack where every
layer is tested."

### If something goes wrong

| Problem | Fix |
|---|---|
| Port 5173 busy | Vite auto-picks 5174 — read the URL it prints |
| API unreachable | The visualiser still works fully; say so and carry on. Only history/analytics need it |
| CORS error after a port change | Add the new origin to `CORS_ALLOWED_ORIGINS` in `backend/.env`, restart Django |
| SQL Server won't connect | Check the SQL Server + SQL Browser services are running; verify the instance name |
| Total backend failure | Set `DB_ENGINE=sqlite`, re-run `migrate` — a working demo in 30 seconds |

---

## 10. Likely questions — and answers

**Q. Why do the algorithms run in the browser instead of on the server?**
The visualiser needs the full expansion trace locally at 60 fps. Sending ~2,000 steps over HTTP per
run adds latency without adding correctness, and makes the animation depend on network conditions.
The server owns what a browser cannot do safely: identity, durable storage, and aggregation across
runs.

**Q. A\* and Dijkstra have the same time complexity. Why is A\* faster?**
Complexity is a worst-case bound on the same input; it doesn't describe which nodes get expanded.
Dijkstra spreads outward in every direction because it only knows cost-so-far. A\* orders by
`g + h`, so nodes pointing away from the target sink in the queue and are often never popped. Same
bound, far fewer expansions — and that gap is exactly what the comparison page measures.

**Q. What makes your heuristic admissible, and what if it weren't?**
Movement is 4-directional and the cheapest step costs 1, so Manhattan distance can never exceed the
true remaining cost — that is the definition of admissible, and it's the condition under which A\*
is guaranteed optimal. An overestimating heuristic could finalise the target through a suboptimal
route: A\* would get *faster* and stop being correct.

**Q. What's the difference between BFS and Dijkstra here?**
On an unweighted board, none — BFS *is* Dijkstra with every weight equal to 1. Paint weighted cells
and they diverge: BFS minimises the number of edges, Dijkstra minimises accumulated cost. Show it
live; it's the clearest 30 seconds in the project.

**Q. Why does DFS produce such a long path?**
DFS follows one branch until it dead-ends. It has no notion of distance, so the first path it finds
is whatever its traversal order produced. It's included precisely to make that contrast visible —
it's excellent for connectivity and maze carving, wrong for shortest paths.

**Q. Why is there no decrease-key in your heap?**
Decrease-key needs a table mapping each vertex to its heap position, maintained on every swap.
Instead I push a second entry with the better priority and skip stale entries on pop, since that
vertex is already finalised. Slightly more heap traffic, no bookkeeping table, still `O(log V)`.

**Q. How does bidirectional search help?**
One BFS explores `O(b^d)`. Two searches each reaching depth `d/2` explore `O(2·b^(d/2))` —
exponentially smaller. It works because the target is known and edges are undirected. My
implementation always expands the *smaller* frontier, so neither side runs away from the other.

**Q. How do you animate 2,000+ cells without React lagging?**
I don't animate through React. The engine writes `data-state` directly onto the cell DOM nodes and
CSS handles the transition, so the component tree never re-renders during playback. React state is
touched only by a stats readout throttled to about 12 updates per second.

**Q. Why a Web Worker?**
JavaScript is single-threaded. Computing a full trace on a large board — or six of them on the
comparison page — would block the main thread and freeze input. The worker keeps the UI responsive,
with a synchronous fallback where workers aren't available.

**Q. Why JWT instead of Django sessions?**
The frontend is a separate origin from the API, so cookie sessions would mean CSRF handling and
cross-site cookie rules. JWT is stateless: no server-side session store. Logout blacklists the
refresh token so it can't be reused afterwards.

**Q. How do you stop one user reading another's data?**
Ownership is enforced in the **queryset**, not in a permission check — every list and detail view
filters by `request.user` first. Another user's record returns **404, not 403**, so the API never
confirms it exists. There's a test for exactly that.

**Q. Why those particular indexes?**
Each matches a query the app makes. `(user, -created_at)` serves the history list; `(user,
algorithm)` serves the analytics `GROUP BY`. Without them SQL Server would scan the whole table per
user. I deliberately didn't index columns nothing queries — every index costs write time.

**Q. What was the hardest problem you hit?**
Two, both real. A rendering bug first: React 18 StrictMode runs effect cleanups without
re-attaching refs, so clearing my cell registry on unmount emptied it permanently — the search ran
correctly and painted nothing. I moved the reset into the render phase, keyed on board dimensions.
Then migrating onto SQL Server: the JWT library ships a migration that `ALTER`s a column a unique
constraint depends on, which SQL Server rejects outright (error 4922). Rather than drop token
blacklisting, I used Django's `MIGRATION_MODULES` to point that app at a locally generated
migration that creates the same tables in their final shape — no `ALTER`, and zero model drift.

**Q. How do you know the algorithms are correct?**
Property-based tests rather than fixed expected outputs: every returned path must be contiguous,
wall-free and correctly terminated; BFS, Dijkstra, A\* and Bidirectional must agree on the optimal
step count; Dijkstra and A\* must agree on cost over weighted terrain; A\* must expand no more nodes
than Dijkstra; all four maze generators must produce solvable boards. Those hold for *any* board,
not one I hand-picked.

**Q. What would you add next?**
Weighted A\* with a tunable epsilon, to show the speed/optimality trade-off numerically; diagonal
movement with an octile heuristic; and Django-side tests so `manage.py test` covers the API the way
`npm test` covers the client.

---

## 11. Project metrics

| | |
|---|---|
| Frontend source | 105 files · ~8,000 lines |
| React components | 48 |
| Custom hooks | 6 |
| Backend source | 20 Python files · ~1,000 lines |
| Algorithms implemented from scratch | 6 |
| Maze generators | 4 |
| REST endpoints | 14 |
| Database tables | 3 application tables · 4 custom indexes · 4 check constraints |
| Automated tests | 114 assertions (algorithm correctness + full-app integration) |
| External pathfinding libraries used | **0** |

---

## 12. Honest limitations

Worth stating before an examiner finds them — it reads as engineering maturity, not weakness.

- **No backend test suite in the repo.** The API was verified with 45 assertions during
  development, but they aren't committed as `manage.py test` cases. The frontend suite is committed.
- **Movement is 4-directional only.** Diagonal movement would need an octile heuristic to stay
  admissible.
- **Not deployed.** It runs locally; there's no hosted instance.
- **Execution time includes trace recording.** The measured milliseconds cover building the
  `visitedOrder` array as well as the search, so treat the figures as comparative between
  algorithms rather than absolute.
