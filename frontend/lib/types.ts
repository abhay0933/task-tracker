export type Role = 'USER' | 'ADMIN';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  user?: User;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Attachment {
  id: string;
  taskId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface TaskFilters {
  status?: TaskStatus | '';
  search?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
