export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  pinned: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags: string[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  pinned?: boolean;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
}

export interface TaskFilter {
  completed?: boolean;
  pinned?: boolean;
  priority?: Priority;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  search?: string;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  hasMore: boolean;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  pinnedTasks: number;
  todayTasks: number;
  overdueTasks: number;
}