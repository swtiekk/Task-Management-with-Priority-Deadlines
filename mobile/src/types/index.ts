export interface Project {
  id: number;
  name: string;
  description: string;
  color: number;
  created_at: string;
  updated_at: string;
  tasks: Task[];
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_percentage: number;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: number;
  project: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}
