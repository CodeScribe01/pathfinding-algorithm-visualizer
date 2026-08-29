from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SavedGridViewSet, StatisticsView, VisualizationRunViewSet

app_name = 'visualizations'

router = DefaultRouter()
router.register('runs', VisualizationRunViewSet, basename='run')
router.register('grids', SavedGridViewSet, basename='grid')

urlpatterns = [
    path('statistics/', StatisticsView.as_view(), name='statistics'),
    path('', include(router.urls)),
]
