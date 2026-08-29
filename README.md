<div align="center">

# PathForge

**Pathfinding Algorithm Visualizer**

*Understand Algorithms. See Them Think.*

An interactive laboratory for exploring BFS, DFS, Dijkstra, A\*, Greedy Best-First and
Bidirectional BFS — six search algorithms implemented from scratch, instrumented step by step,
and rendered live on an editable grid.

React · Vite · Tailwind CSS · Framer Motion · Recharts · Django REST Framework · JWT · Microsoft SQL Server

</div>

---

> **Presenting this project?** [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) has the setup steps,
> architecture, design rationale, a rehearsed demo script and the questions an examiner is likely
> to ask, with answers.

## What it does

| | |
|---|---|
| **Visualize** | Draw walls and weighted terrain on a grid up to 33 × 71, drag the start and target markers, generate mazes, then watch any of six searches expand node by node with pause / resume / stop and four playback speeds. |
| **Compare** | Run several algorithms against *the same* board and read the trade-offs from a results table, three charts and a per-algorithm map of the region each one explored. |
| **Learn** | A reference page for every algorithm — complexity, data structure, optimality guarantee, best use cases and pseudocode — plus a technical write-up of how the whole thing is built. |
| **Track** | Sign in and every run is recorded: history, per-algorithm aggregates, activity over time and saved boards, served by a documented Django REST API. |

The searches themselves execute **in the browser on a Web Worker**, which is what makes the
animation smooth and interactive. Django owns identity, persistence and aggregation.

---

## Algorithms

Every implementation is a pure function over a flat typed-array encoding of the board, with no
external pathfinding library involved.

| Algorithm | Category | Time | Space | Shortest path |
|---|---|---|---|---|
| Breadth-First Search | Unweighted · Uninformed | `O(V + E)` | `O(V)` | Yes — in steps |
| Depth-First Search | Unweighted · Uninformed | `O(V + E)` | `O(V)` | No |
| Dijkstra's Algorithm | Weighted · Uninformed | `O((V + E) log V)` | `O(V)` | Yes — minimum cost |
| A\* Search | Weighted · Informed | `O((V + E) log V)` | `O(V)` | Yes — with an admissible heuristic |
| Greedy Best-First | Unweighted · Informed | `O((V + E) log V)` | `O(V)` | No |
| Bidirectional BFS | Unweighted · Uninformed | `O(b^(d/2))` | `O(b^(d/2))` | Yes — in steps |

Each returns the same execution envelope, which is what keeps the UI generic:

```js
{
  visitedOrder: [{ row, col, frontierSize, side? }],  // expansion trace, drives the animation
  path:         [{ row, col }],                       // reconstructed route
  pathCost, pathLength, nodesVisited,
  maxFrontier, operations, executionTime, found,
}
```

**Maze generators:** Random Obstacles, Recursive Division, Recursive Backtracking and
Randomized Prim's — all writing into the same wall field the searches read.

---

## Quick start

### Prerequisites

- **Node.js 18+** (developed on 22)
- **Python 3.10+** — for the API. On Windows `python` often resolves to a Microsoft Store
  placeholder that only prints an install prompt; `winget install Python.Python.3.12` installs a
  real interpreter (open a new terminal afterwards so PATH refreshes)
- **Microsoft SQL Server** with the *ODBC Driver 18 for SQL Server* — or set `DB_ENGINE=sqlite`
  to run the API without it

### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # optional: the defaults already point at 127.0.0.1:8000
npm run dev               # http://localhost:5173
```

The visualiser, algorithm reference and comparison page work **without the backend running** —
everything computes client side. Sign-in, history and analytics need the API.

### 2. Backend

**Windows PowerShell** — `&&` is not a valid separator in Windows PowerShell 5.1, so run these
one line at a time:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env          # then edit the DB_* values

python manage.py makemigrations accounts visualizations
python manage.py migrate
python manage.py createsuperuser     # optional, for /admin
python manage.py runserver           # http://127.0.0.1:8000
```

**macOS / Linux**

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env

python manage.py makemigrations accounts visualizations
python manage.py migrate
python manage.py runserver
```

> Once the virtual environment is active, prefer `python -m pip` over a bare `pip` — it
> guarantees the install lands in the venv rather than a global interpreter.

> Migrations are generated on first setup rather than committed, so the schema is always
> produced by the installed Django version against your database.

### SQL Server notes

The default configuration targets SQL Server. Two things are worth knowing.

**Named instances.** SQL Server Express normally installs as a named instance, so point `DB_HOST`
at the instance rather than a port. `settings.py` drops `DB_PORT` automatically when it sees a
backslash, because supplying both makes the driver ignore the instance name:

```
DB_ENGINE=mssql
DB_NAME=PathForgeDB
DB_HOST=localhost\SQLEXPRESS01
DB_USER=                 # leave blank for Windows integrated authentication
DB_PASSWORD=
```

Create the database itself first — in SSMS, or:

```powershell
sqlcmd -S "localhost\SQLEXPRESS01" -E -Q "create database PathForgeDB"
```

Django creates the tables; it never creates the database.

**simplejwt on SQL Server.** The `token_blacklist` app ships migration `0008`, which `ALTER`s a
column that a unique constraint depends on. SQL Server rejects that outright (error 4922), so
migrating fails partway through. Rather than drop token blacklisting, `MIGRATION_MODULES` points
that app at `pathforge/migrations/token_blacklist/` — one generated migration that creates the
same tables in their final shape, with no `ALTER` to trip over. Model state is identical on every
backend (`makemigrations --check` reports no drift) and logout still blacklists refresh tokens.


### 3. API documentation

| URL | What |
|---|---|
| `http://127.0.0.1:8000/api/docs/` | Swagger UI |
| `http://127.0.0.1:8000/api/redoc/` | ReDoc |
| `http://127.0.0.1:8000/api/schema/` | Raw OpenAPI 3 schema |
| `http://127.0.0.1:8000/admin/` | Django admin |

---

## API reference

All endpoints are prefixed with `/api/`. Everything except registration, login and token refresh
requires an `Authorization: Bearer <access token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register/` | Create an account, returns the user plus a JWT pair |
| `POST` | `/auth/login/` | Obtain an access/refresh pair |
| `POST` | `/auth/refresh/` | Exchange a refresh token for a new access token |
| `POST` | `/auth/logout/` | Blacklist a refresh token |
| `GET` | `/auth/me/` | The authenticated user |
| `GET` | `/runs/` | List runs — supports `?algorithm=` and `?path_found=` |
| `POST` | `/runs/` | Record a completed run |
| `GET` | `/runs/{id}/` | Retrieve one run |
| `DELETE` | `/runs/{id}/` | Delete one run |
| `GET` | `/grids/` | List saved boards |
| `POST` | `/grids/` | Save a board |
| `GET` | `/grids/{id}/` | Retrieve one board |
| `DELETE` | `/grids/{id}/` | Delete one board |
| `GET` | `/statistics/` | Aggregated analytics for the current user |

Ownership is enforced in the queryset, so another user's object is a `404` rather than a `403` —
the API never confirms that it exists.

---

## Database schema

Three tables, normalised, with indexes chosen for the two queries that actually run: "this
user's newest runs" and "this user's runs grouped by algorithm".

**`pathforge_user`** — custom user model, swapped in from the start via `AUTH_USER_MODEL`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | PK |
| `username` | varchar(150) | unique |
| `email` | varchar(254) | unique, indexed |
| `password` | varchar(128) | PBKDF2 hash |
| `created_at` | datetime | indexed |

**`pathforge_visualization_run`** — one row per completed search

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | PK |
| `user_id` | bigint | FK → user, `ON DELETE CASCADE` |
| `algorithm` | varchar(20) | choice field, indexed |
| `grid_rows`, `grid_columns` | smallint | check constraint ≥ 2 |
| `nodes_visited`, `path_length`, `path_cost` | int | |
| `execution_time` | decimal(12,3) | milliseconds |
| `path_found` | bit | |
| `max_frontier_size` | int | peak queue size |
| `maze_type`, `heuristic` | varchar(20) | nullable |
| `created_at` | datetime | indexed |

Composite indexes: `(user, -created_at)` for the history list, `(user, algorithm)` for analytics.

**`pathforge_saved_grid`** — a board the user kept

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | PK |
| `user_id` | bigint | FK → user, `ON DELETE CASCADE` |
| `name` | varchar(80) | unique per user |
| `grid_data` | json | `{rows, cols, walls: [index], weights: [index]}` |
| `start_position`, `target_position` | json | `{row, col}` |
| `created_at` | datetime | indexed |

Storing walls and weights as flat indices rather than a full matrix keeps a 33 × 71 board at a
few hundred bytes instead of a few thousand.

---

## Project structure

```
frontend/
  src/
    algorithms/      six search modules + MinHeap, heuristics, catalogue  (no React)
    maze/            four generators over a shared wall field             (no React)
    workers/         pathfinder.worker.js — search off the main thread
    hooks/           useVisualizerEngine (rAF playback), usePathfinder, useAsync, …
    context/         BoardContext (shared board), AuthContext, ToastContext
    services/        apiClient (JWT + refresh) and one module per resource
    components/      ui/ layout/ visualizer/ compare/ analytics/ landing/ algorithms/
    pages/           one file per route
    lib/             grid model, constants, formatting
  tests/
    algorithms.test.mjs   algorithm invariants under Node
    dom/                  full-app integration tests under jsdom

backend/
  pathforge/         settings, urls, wsgi/asgi
  accounts/          custom user, JWT auth endpoints
  visualizations/    runs, saved grids, statistics aggregation
```

---

## Tests

```bash
cd frontend
npm test              # both suites
npm run test:algorithms
npm run test:ui
npm run lint
```

**`test:algorithms`** verifies the properties that matter rather than fixed outputs: that every
returned path is contiguous, wall-free and correctly terminated; that BFS, Dijkstra, A\* and
Bidirectional BFS agree on the optimal step count; that Dijkstra and A\* agree on cost over
weighted terrain while BFS pays more; that A\* expands strictly fewer nodes than Dijkstra; that
all four maze generators produce solvable boards; and that unreachable targets and degenerate
inputs are handled.

**`test:ui`** bundles the real application, renders it in jsdom and drives it: every route
renders error-free, protected routes redirect anonymous visitors, maze generation paints walls
without disturbing the markers, running a search paints visited nodes and a path onto the board,
reset clears the overlay, and the comparison page produces distinct per-algorithm results.

---

## Engineering notes

**Graph representation.** The board is an implicit graph — walkable cells are vertices, edges
join 4-adjacent cells. No adjacency list is materialised; neighbours are derived arithmetically
from `Uint8Array` wall and weight fields with `index = row * cols + col`. Weights are node entry
costs (1 normally, 5 for weighted terrain), which keeps the encoding at two bytes per cell while
still giving Dijkstra and A\* a genuinely weighted graph.

**Priority queue.** A hand-written binary min-heap with keys and priorities in parallel typed
arrays, so no wrapper object is allocated per push. There is no decrease-key: relaxing an edge
pushes a second entry and the stale one is discarded on pop (lazy deletion), which drops the
index-tracking table while keeping every operation at `O(log V)`.

**Heuristic.** Manhattan distance — admissible *and* consistent on a 4-connected grid where the
cheapest step costs 1, so A\* returns exactly Dijkstra's optimal cost while expanding a fraction
of the vertices. Euclidean and Chebyshev are selectable to show the cost of a weaker estimate. No
tie-breaking multiplier is applied, since scaling `h` upward trades the optimality guarantee for
speed.

**Rendering performance.** Three decisions keep a 2 343-cell board smooth:

- *Search runs on a Web Worker*, so computing a trace never blocks input — with a synchronous
  fallback where workers are unavailable (which the jsdom suite exercises).
- *Animation bypasses React.* The engine writes `data-state` directly onto cell DOM nodes and CSS
  owns the transition, so the component tree does not re-render during playback; only a throttled
  stats readout touches React state.
- *Editing uses structural sharing.* Painting a wall copies one row and one cell, so memoised
  cells elsewhere skip re-rendering, and pointer handling is delegated to the board container
  rather than bound to 2 000 individual cells.

Playback is time-based, not frame-based: each frame consumes `dt × stepsPerSecond` from a budget,
so the animation runs at the same speed on 60 Hz and 144 Hz displays and speed changes apply
mid-run.

**Chart colours** are validated rather than eyeballed — the six algorithm identity colours clear
the dark-surface lightness band, a chroma floor, adjacent-pair colour-vision-deficiency
separation and 3:1 contrast. Identity is never carried by colour alone: every bar is labelled on
the category axis and repeated in the results table.

---

## Accessibility & UX

- Keyboard shortcuts: <kbd>Space</kbd> play/pause · <kbd>Esc</kbd> stop · <kbd>R</kbd> reset ·
  <kbd>M</kbd> maze · <kbd>W</kbd>/<kbd>G</kbd> switch tool
- Skip-to-content link, focus-visible rings, ARIA grid semantics on the board, labelled controls
  and tooltips bound via `aria-describedby`
- Loading, empty and error states on every data-backed screen, with confirmation dialogs before
  destructive actions
- `prefers-reduced-motion` disables the cell animations
- Responsive from mobile up; the board is the visual centrepiece on desktop

---

## Licence

Built as an Analysis of Algorithms coursework project. Free to read, run and learn from.
