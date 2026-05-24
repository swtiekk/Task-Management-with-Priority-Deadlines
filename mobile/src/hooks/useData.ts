import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Project, Task } from '../types';

// Projects
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get<Project[]>('/projects/');
      return response.data;
    },
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const response = await api.post<Project>('/projects/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Tasks
export const useTasks = (projectId?: number) => {
  return useQuery({
    queryKey: projectId ? ['tasks', projectId] : ['tasks'],
    queryFn: async () => {
      const url = projectId ? `/tasks/?project=${projectId}` : '/tasks/';
      const response = await api.get<Task[]>(url);
      return response.data;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await api.post<Task>('/tasks/', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables.project) {
        queryClient.invalidateQueries({ queryKey: ['projects', variables.project] });
      }
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: number }) => {
      const response = await api.patch<Task>(`/tasks/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.project] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
