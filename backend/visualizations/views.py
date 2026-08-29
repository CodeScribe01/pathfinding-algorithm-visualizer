from django.db.models import Avg, Count, ExpressionWrapper, F, FloatField, Q
from django.db.models.functions import TruncDate
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Algorithm, SavedGrid, VisualizationRun
from .serializers import (
    SavedGridSerializer,
    StatisticsSerializer,
    VisualizationRunSerializer,
)


class OwnedModelViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    List / create / retrieve / destroy, always scoped to the requesting user.

    Ownership is enforced in the queryset rather than in a permission check, so
    an object belonging to somebody else is a 404 and never leaks its
    existence. Update is deliberately not exposed: runs are immutable records.
    """

    permission_classes = [IsAuthenticated]
    model = None

    def get_queryset(self):
        # `self.request` is absent during schema generation.
        user = getattr(self.request, 'user', None)
        if user is None or not user.is_authenticated:
            return self.model.objects.none()
        return self.model.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(
    list=extend_schema(
        tags=['runs'],
        summary='List visualisation runs',
        parameters=[
            OpenApiParameter(
                name='algorithm',
                description='Filter by algorithm id (bfs, dfs, dijkstra, astar, greedy, bidirectional).',
                required=False,
                type=str,
                enum=[choice.value for choice in Algorithm],
            ),
            OpenApiParameter(
                name='path_found',
                description='Filter to runs that did (true) or did not (false) reach the target.',
                required=False,
                type=bool,
            ),
        ],
    ),
    create=extend_schema(tags=['runs'], summary='Record a completed run'),
    retrieve=extend_schema(tags=['runs'], summary='Retrieve a single run'),
    destroy=extend_schema(tags=['runs'], summary='Delete a run'),
)
class VisualizationRunViewSet(OwnedModelViewSet):
    serializer_class = VisualizationRunSerializer
    model = VisualizationRun

    def get_queryset(self):
        queryset = super().get_queryset()
        params = getattr(self.request, 'query_params', {})

        algorithm = params.get('algorithm')
        if algorithm:
            queryset = queryset.filter(algorithm=algorithm)

        path_found = params.get('path_found')
        if path_found in {'true', 'false'}:
            queryset = queryset.filter(path_found=path_found == 'true')

        return queryset


@extend_schema_view(
    list=extend_schema(tags=['grids'], summary='List saved boards'),
    create=extend_schema(tags=['grids'], summary='Save a board'),
    retrieve=extend_schema(tags=['grids'], summary='Retrieve a saved board'),
    destroy=extend_schema(tags=['grids'], summary='Delete a saved board'),
)
class SavedGridViewSet(OwnedModelViewSet):
    serializer_class = SavedGridSerializer
    model = SavedGrid


def _as_float(value, digits=3):
    """Aggregates over DecimalField come back as Decimal; JSON wants a number."""
    return None if value is None else round(float(value), digits)


@extend_schema(
    tags=['statistics'],
    summary='Aggregate analytics for the current user',
    responses=StatisticsSerializer,
)
class StatisticsView(APIView):
    """
    Dashboard aggregates, computed in SQL rather than in Python.

    Everything is scoped to the requesting user and derived from real recorded
    runs — when the user has no history the response is a zeroed skeleton and
    the client renders an empty state rather than sample data.

    "Best performing" is ranked by *board coverage* (nodes visited divided by
    board area) across runs that actually found a path, so a small board cannot
    win the title simply by being small.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = StatisticsSerializer

    def get(self, request):
        runs = VisualizationRun.objects.filter(user=request.user)
        total_runs = runs.count()
        total_grids = SavedGrid.objects.filter(user=request.user).count()

        if total_runs == 0:
            return Response(
                {
                    'total_runs': 0,
                    'total_grids': total_grids,
                    'average_nodes_visited': None,
                    'average_execution_time': None,
                    'average_path_length': None,
                    'most_used_algorithm': None,
                    'best_performing_algorithm': None,
                    'by_algorithm': [],
                    'runs_per_day': [],
                    'recent_runs': [],
                }
            )

        totals = runs.aggregate(
            avg_nodes=Avg('nodes_visited'),
            avg_time=Avg('execution_time'),
            avg_length=Avg('path_length', filter=Q(path_found=True)),
        )

        per_algorithm = (
            runs.values('algorithm')
            .annotate(
                runs=Count('id'),
                avg_nodes_visited=Avg('nodes_visited'),
                avg_execution_time=Avg('execution_time'),
                avg_path_length=Avg('path_length', filter=Q(path_found=True)),
                avg_path_cost=Avg('path_cost', filter=Q(path_found=True)),
                successes=Count('id', filter=Q(path_found=True)),
            )
            .order_by('-runs')
        )

        by_algorithm = [
            {
                'algorithm': row['algorithm'],
                'runs': row['runs'],
                'avg_nodes_visited': _as_float(row['avg_nodes_visited'], 1) or 0.0,
                'avg_execution_time': _as_float(row['avg_execution_time']) or 0.0,
                'avg_path_length': _as_float(row['avg_path_length'], 1) or 0.0,
                'avg_path_cost': _as_float(row['avg_path_cost'], 1) or 0.0,
                'success_rate': round(row['successes'] / row['runs'], 3) if row['runs'] else 0.0,
            }
            for row in per_algorithm
        ]

        most_used = by_algorithm[0] if by_algorithm else None

        # Coverage normalises expansion count by board area so algorithms stay
        # comparable across the different grid presets.
        coverage = ExpressionWrapper(
            F('nodes_visited') * 1.0 / (F('grid_rows') * F('grid_columns')),
            output_field=FloatField(),
        )
        performance = (
            runs.filter(path_found=True)
            .annotate(coverage=coverage)
            .values('algorithm')
            .annotate(
                runs=Count('id'),
                average_nodes_visited=Avg('nodes_visited'),
                average_coverage=Avg('coverage'),
            )
            .order_by('average_coverage')
        )
        best = performance.first()

        per_day = (
            runs.annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(runs=Count('id'), avg_execution_time=Avg('execution_time'))
            .order_by('date')
        )

        return Response(
            {
                'total_runs': total_runs,
                'total_grids': total_grids,
                'average_nodes_visited': _as_float(totals['avg_nodes'], 1),
                'average_execution_time': _as_float(totals['avg_time']),
                'average_path_length': _as_float(totals['avg_length'], 1),
                'most_used_algorithm': (
                    {'algorithm': most_used['algorithm'], 'count': most_used['runs']}
                    if most_used
                    else None
                ),
                'best_performing_algorithm': (
                    {
                        'algorithm': best['algorithm'],
                        'runs': best['runs'],
                        'average_nodes_visited': _as_float(best['average_nodes_visited'], 1),
                        'average_coverage': _as_float(best['average_coverage'], 4),
                    }
                    if best
                    else None
                ),
                'by_algorithm': by_algorithm,
                # The dashboard charts the trailing fortnight of activity.
                'runs_per_day': [
                    {
                        'date': entry['date'].isoformat() if entry['date'] else None,
                        'runs': entry['runs'],
                        'avg_execution_time': _as_float(entry['avg_execution_time']),
                    }
                    for entry in list(per_day)[-14:]
                ],
                'recent_runs': VisualizationRunSerializer(runs[:10], many=True).data,
            }
        )
