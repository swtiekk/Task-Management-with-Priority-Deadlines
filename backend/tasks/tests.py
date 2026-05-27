from datetime import date

from django.urls import reverse
from rest_framework.test import APITestCase

from user.models import User
from .models import Project, Task


class TaskOwnershipTests(APITestCase):
    def setUp(self):
        self.user_one = User.objects.create_user(
            email='one@example.com',
            password='pass12345',
            name='One User',
        )
        self.user_two = User.objects.create_user(
            email='two@example.com',
            password='pass12345',
            name='Two User',
        )
        self.project_one = Project.objects.create(
            owner=self.user_one,
            name='One Project',
            description='Owned by first user',
            color=1,
        )
        self.project_two = Project.objects.create(
            owner=self.user_two,
            name='Two Project',
            description='Owned by second user',
            color=2,
        )
        self.task_one = Task.objects.create(
            project=self.project_one,
            title='First task',
            description='',
            priority='Low',
            status='Pending',
            deadline=date(2099, 1, 1),
        )
        Task.objects.create(
            project=self.project_two,
            title='Second task',
            description='',
            priority='Low',
            status='Pending',
            deadline=date(2099, 1, 1),
        )

    def test_project_list_is_user_scoped(self):
        self.client.force_authenticate(user=self.user_one)
        response = self.client.get(reverse('project-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'One Project')

    def test_task_list_is_user_scoped(self):
        self.client.force_authenticate(user=self.user_one)
        response = self.client.get(reverse('task-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'First task')

    def test_other_users_project_returns_404(self):
        self.client.force_authenticate(user=self.user_one)
        response = self.client.get(reverse('project-detail', args=[self.project_two.id]))

        self.assertEqual(response.status_code, 404)
