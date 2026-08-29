from rest_framework import serializers

from .models import SavedGrid, VisualizationRun


class VisualizationRunSerializer(serializers.ModelSerializer):
    algorithm_display = serializers.CharField(source='get_algorithm_display', read_only=True)

    class Meta:
        model = VisualizationRun
        fields = (
            'id',
            'algorithm',
            'algorithm_display',
            'grid_rows',
            'grid_columns',
            'nodes_visited',
            'path_length',
            'path_cost',
            'execution_time',
            'path_found',
            'max_frontier_size',
            'maze_type',
            'heuristic',
            'created_at',
        )
        read_only_fields = ('id', 'algorithm_display', 'created_at')

    def validate(self, attrs):
        # A run that found no path cannot claim a path length or cost.
        if not attrs.get('path_found', True):
            attrs['path_length'] = 0
            attrs['path_cost'] = 0
        return attrs


class PositionField(serializers.JSONField):
    """A {"row": int, "col": int} pair."""

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        if not isinstance(value, dict) or 'row' not in value or 'col' not in value:
            raise serializers.ValidationError('Expected an object with "row" and "col" keys.')
        try:
            return {'row': int(value['row']), 'col': int(value['col'])}
        except (TypeError, ValueError):
            raise serializers.ValidationError('"row" and "col" must be integers.')


class SavedGridSerializer(serializers.ModelSerializer):
    start_position = PositionField()
    target_position = PositionField()

    class Meta:
        model = SavedGrid
        fields = (
            'id',
            'name',
            'grid_data',
            'start_position',
            'target_position',
            'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError('Give the board a name.')
        request = self.context.get('request')
        if request and SavedGrid.objects.filter(user=request.user, name__iexact=name).exists():
            raise serializers.ValidationError('You already have a board with this name.')
        return name

    def validate_grid_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('grid_data must be an object.')
        for key in ('rows', 'cols'):
            if not isinstance(value.get(key), int) or value[key] < 2:
                raise serializers.ValidationError(f'grid_data.{key} must be an integer >= 2.')

        cell_count = value['rows'] * value['cols']
        for key in ('walls', 'weights'):
            indices = value.get(key, [])
            if not isinstance(indices, list):
                raise serializers.ValidationError(f'grid_data.{key} must be a list of indices.')
            if any(not isinstance(i, int) or i < 0 or i >= cell_count for i in indices):
                raise serializers.ValidationError(
                    f'grid_data.{key} contains an index outside the board.'
                )
        return value


class AlgorithmStatSerializer(serializers.Serializer):
    """Per-algorithm aggregate row used by the analytics dashboard."""

    algorithm = serializers.CharField()
    runs = serializers.IntegerField()
    avg_nodes_visited = serializers.FloatField()
    avg_execution_time = serializers.FloatField()
    avg_path_length = serializers.FloatField()
    avg_path_cost = serializers.FloatField()
    success_rate = serializers.FloatField()


class StatisticsSerializer(serializers.Serializer):
    """Response shape of /api/statistics/ — declared so the OpenAPI schema is exact."""

    total_runs = serializers.IntegerField()
    total_grids = serializers.IntegerField()
    average_nodes_visited = serializers.FloatField(allow_null=True)
    average_execution_time = serializers.FloatField(allow_null=True)
    average_path_length = serializers.FloatField(allow_null=True)
    most_used_algorithm = serializers.DictField(allow_null=True)
    best_performing_algorithm = serializers.DictField(allow_null=True)
    by_algorithm = AlgorithmStatSerializer(many=True)
    runs_per_day = serializers.ListField(child=serializers.DictField())
    recent_runs = VisualizationRunSerializer(many=True)
