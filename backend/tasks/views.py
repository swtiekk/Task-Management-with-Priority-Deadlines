import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from django.utils import timezone
from .models import Project, Task, KnowledgeBase, ChatMessage
from .serializers import (
    ProjectSerializer,
    TaskSerializer,
    KnowledgeBaseSerializer,
    ChatMessageSerializer
)


# ── Project Views ──────────────────────────────────────────

class ProjectListView(APIView):

    def get(self, request):
        projects = Project.objects.all().order_by('-created_at')
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(APIView):

    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return None

    def get(self, request, pk):
        project = self.get_object(pk)
        if project is None:
            return Response(
                {"error": "Project not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, pk):
        project = self.get_object(pk)
        if project is None:
            return Response(
                {"error": "Project not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        project = self.get_object(pk)
        if project is None:
            return Response(
                {"error": "Project not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProjectSerializer(
            project, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk)
        if project is None:
            return Response(
                {"error": "Project not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        project.delete()
        return Response(
            {"message": "Project deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# ── Task Views ─────────────────────────────────────────────

class TaskListView(APIView):

    def get(self, request):
        tasks = Task.objects.all().order_by('-created_at')

        priority = request.query_params.get('priority')
        if priority:
            tasks = tasks.filter(priority=priority)

        task_status = request.query_params.get('status')
        if task_status:
            tasks = tasks.filter(status=task_status)

        project_id = request.query_params.get('project')
        if project_id:
            tasks = tasks.filter(project=project_id)

        deadline = request.query_params.get('deadline')
        if deadline:
            tasks = tasks.filter(deadline=deadline)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):

    def get_object(self, pk):
        try:
            return Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return None

    def get(self, request, pk):
        task = self.get_object(pk)
        if task is None:
            return Response(
                {"error": "Task not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, pk):
        task = self.get_object(pk)
        if task is None:
            return Response(
                {"error": "Task not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = TaskSerializer(
            task, data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        task = self.get_object(pk)
        if task is None:
            return Response(
                {"error": "Task not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = TaskSerializer(
            task, data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = self.get_object(pk)
        if task is None:
            return Response(
                {"error": "Task not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        task.delete()
        return Response(
            {"message": "Task deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class OverdueTasksView(APIView):

    def get(self, request):
        today = timezone.now().date()
        overdue_tasks = Task.objects.filter(
            deadline__lt=today
        ).exclude(status='Completed')

        priority = request.query_params.get('priority')
        if priority:
            overdue_tasks = overdue_tasks.filter(priority=priority)

        serializer = TaskSerializer(overdue_tasks, many=True)
        return Response(serializer.data)


# ── Chatbot Views ──────────────────────────────────────────

class ChatbotView(ListCreateAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def create(self, request, *args, **kwargs):
        user_message = request.data.get("message")

        # save user message
        user_chat = ChatMessage.objects.create(
            role='user',
            message=user_message
        )

        # get knowledge
        knowledge = KnowledgeBase.objects.all()
        context = ""
        for item in knowledge:
            if item.text_content:
                context += item.text_content + "\n"

        prompt = f"""
You are a helpful assistant.

Knowledge:
{context}

User:
{user_message}
"""

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5:0.5b",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30
            )
            data = response.json()
            ai_response = data.get("response", "No response from AI.")
        except requests.exceptions.RequestException as e:
            ai_response = f"Error connecting to AI service: {str(e)}"

        # save AI response
        ai_chat = ChatMessage.objects.create(
            role='assistant',
            message=ai_response
        )

        return Response({
            "user": ChatMessageSerializer(user_chat).data,
            "assistant": ChatMessageSerializer(ai_chat).data
        }, status=status.HTTP_201_CREATED)


class KnowledgeBaseView(ListCreateAPIView):
    queryset = KnowledgeBase.objects.all()
    serializer_class = KnowledgeBaseSerializer
