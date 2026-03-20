from django.contrib import admin
from .models import Project, Task


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'priority', 'status', 'deadline', 'is_overdue']
    list_filter = ['priority', 'status', 'project']
    search_fields = ['title', 'description']
    ordering = ['-created_at']