from django.contrib import admin

from .models import SavedGrid, VisualizationRun


@admin.register(VisualizationRun)
class VisualizationRunAdmin(admin.ModelAdmin):
    list_display = (
        'algorithm',
        'user',
        'board',
        'nodes_visited',
        'path_length',
        'path_cost',
        'execution_time',
        'path_found',
        'created_at',
    )
    list_filter = ('algorithm', 'path_found', 'maze_type', 'created_at')
    search_fields = ('user__username', 'user__email')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)
    list_select_related = ('user',)

    @admin.display(description='Board')
    def board(self, obj):
        return f'{obj.grid_rows}x{obj.grid_columns}'


@admin.register(SavedGrid)
class SavedGridAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username')
    readonly_fields = ('created_at',)
    list_select_related = ('user',)
