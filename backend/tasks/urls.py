from django.urls import path
from .views import (
    ProjectListView,
    ProjectDetailView,
    TaskListView,
    TaskDetailView,
    OverdueTasksView,
)

urlpatterns = [
    # Project endpoints — list/create and retrieve/update/delete
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),

    # Task endpoints — overdue must come before <int:pk> to avoid URL conflict
    path('tasks/', TaskListView.as_view(), name='task-list'),
    path('tasks/overdue/', OverdueTasksView.as_view(), name='task-overdue'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
]