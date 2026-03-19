from rest_framework import serializers
from django.utils import timezone
from .models import Project, Task


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model. Includes computed is_overdue field."""

    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id',
            'project',
            'title',
            'description',
            'priority',
            'status',
            'deadline',
            'created_at',
            'is_overdue',
        ]

    def get_is_overdue(self, obj):
        """Computes whether a task has passed its deadline."""
        return obj.is_overdue()

    def validate_deadline(self, value):
        """Ensures deadline is not set in the past on create."""
        if self.instance is None and value < timezone.now().date():
            raise serializers.ValidationError(
                "Deadline cannot be in the past."
            )
        return value


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model. Includes nested tasks and computed counts."""

    tasks = TaskSerializer(many=True, read_only=True)
    total_tasks = serializers.SerializerMethodField()
    overdue_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'created_at',
            'tasks',
            'total_tasks',
            'overdue_tasks',
        ]

    def get_total_tasks(self, obj):
        """Returns the total number of tasks in this project."""
        return obj.tasks.count()

    def get_overdue_tasks(self, obj):
        """Returns the number of overdue tasks in this project."""
        return obj.tasks.filter(
            deadline__lt=timezone.now().date()
        ).exclude(status='Completed').count()