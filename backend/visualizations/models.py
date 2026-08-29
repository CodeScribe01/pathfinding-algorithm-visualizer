from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Algorithm(models.TextChoices):
    """Mirrors the frontend algorithm catalogue ids."""

    BFS = 'bfs', 'Breadth-First Search'
    DFS = 'dfs', 'Depth-First Search'
    DIJKSTRA = 'dijkstra', "Dijkstra's Algorithm"
    ASTAR = 'astar', 'A* Search'
    GREEDY = 'greedy', 'Greedy Best-First Search'
    BIDIRECTIONAL = 'bidirectional', 'Bidirectional BFS'


class MazeType(models.TextChoices):
    RANDOM = 'random', 'Random Obstacles'
    DIVISION = 'division', 'Recursive Division'
    BACKTRACKING = 'backtracking', 'Recursive Backtracking'
    PRIMS = 'prims', "Randomized Prim's"


class VisualizationRun(models.Model):
    """
    One completed search, recorded for history and analytics.

    Metrics are stored as produced by the client's execution envelope: nodes
    visited (vertices dequeued), path length in steps, path cost as the summed
    entry cost, and the wall-clock duration of the search itself in
    milliseconds. Storing derived numbers rather than the whole expansion trace
    keeps rows small and makes aggregation a pure SQL job.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='runs',
    )
    algorithm = models.CharField(max_length=20, choices=Algorithm.choices, db_index=True)

    grid_rows = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2), MaxValueValidator(500)]
    )
    grid_columns = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2), MaxValueValidator(500)]
    )

    nodes_visited = models.PositiveIntegerField()
    path_length = models.PositiveIntegerField(default=0)
    path_cost = models.PositiveIntegerField(default=0)
    execution_time = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        help_text='Search duration in milliseconds, excluding animation.',
    )

    path_found = models.BooleanField(default=True)
    max_frontier_size = models.PositiveIntegerField(default=0)
    maze_type = models.CharField(
        max_length=20, choices=MazeType.choices, null=True, blank=True
    )
    heuristic = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'pathforge_visualization_run'
        ordering = ['-created_at']
        indexes = [
            # History listing: newest first for one user.
            models.Index(fields=['user', '-created_at'], name='run_user_created_idx'),
            # Analytics: group by algorithm within one user.
            models.Index(fields=['user', 'algorithm'], name='run_user_algorithm_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(grid_rows__gte=2) & models.Q(grid_columns__gte=2),
                name='run_board_min_size',
            ),
        ]

    def __str__(self):
        return f'{self.get_algorithm_display()} · {self.grid_rows}x{self.grid_columns}'


class SavedGrid(models.Model):
    """
    A board the user chose to keep.

    ``grid_data`` holds the compact serialisation the frontend produces —
    dimensions plus flat indices of walls and weighted cells — which is far
    smaller than a full 2-D matrix and reloads without conversion.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grids',
    )
    name = models.CharField(max_length=80)
    grid_data = models.JSONField(
        help_text='{"rows": int, "cols": int, "walls": [int], "weights": [int]}'
    )
    start_position = models.JSONField(help_text='{"row": int, "col": int}')
    target_position = models.JSONField(help_text='{"row": int, "col": int}')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'pathforge_saved_grid'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_grid_name_per_user'),
        ]
        indexes = [
            models.Index(fields=['user', '-created_at'], name='grid_user_created_idx'),
        ]

    def __str__(self):
        return self.name
