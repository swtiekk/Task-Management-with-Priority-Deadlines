from rest_framework import serializers
from django.utils import timezone
from .models import Project, Task, KnowledgeBase, ChatMessage


class TaskSerializer(serializers.ModelSerializer):
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
            'updated_at',
            'is_overdue',
        ]

    def get_is_overdue(self, obj):
        return obj.is_overdue

    def validate_deadline(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "Deadline cannot be in the past."
            )
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value.strip()

    def validate_project(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if value.owner_id != request.user.id:
                raise serializers.ValidationError(
                    "Project does not belong to the current user."
                )
        return value

    def validate_priority(self, value):
        valid = ['Low', 'Medium', 'High']
        if value not in valid:
            raise serializers.ValidationError(
                f"Priority must be one of: {', '.join(valid)}"
            )
        return value

    def validate_status(self, value):
        valid = ['Pending', 'In Progress', 'Completed']
        if value not in valid:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(valid)}"
            )
        return value


class ProjectSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    total_tasks = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    overdue_tasks = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'owner',
            'name',
            'description',
            'color',
            'created_at',
            'updated_at',
            'tasks',
            'total_tasks',
            'completed_tasks',
            'overdue_tasks',
            'completion_percentage',
        ]
        read_only_fields = ['owner']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Project name cannot be blank.")
        return value.strip()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['owner'] = request.user
        return super().create(validated_data)

    def get_total_tasks(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='Completed').count()

    def get_overdue_tasks(self, obj):
        return obj.tasks.filter(
            deadline__lt=timezone.now().date()
        ).exclude(status='Completed').count()

    def get_completion_percentage(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        completed = obj.tasks.filter(status='Completed').count()
        return round((completed / total) * 100)


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBase
        fields = '__all__'


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
