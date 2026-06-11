'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TaskFiltersComponent from '@/components/TaskFilters';
import Pagination from '@/components/Pagination';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import api from '@/lib/api';
import { Task, TaskFilters, TasksResponse, TaskStatus, User } from '@/lib/types';
import { format } from 'date-fns';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'tasks' | 'users'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.replace('/login');
      else if (user.role !== 'ADMIN') router.replace('/tasks');
    }
  }, [user, authLoading, router]);

  const fetchTasks = useCallback(async (f: TaskFilters) => {
    setFetching(true);
    try {
      const params: Record<string, string> = {
        page: String(f.page || 1),
        limit: String(f.limit || 10),
        sortBy: f.sortBy || 'createdAt',
        sortOrder: f.sortOrder || 'desc',
      };
      if (f.status) params.status = f.status;
      if (f.search) params.search = f.search;
      const res = await api.get<TasksResponse>('/admin/tasks', { params });
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } finally {
      setFetching(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setFetching(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    if (activeTab === 'tasks') fetchTasks(filters);
    else fetchUsers();
  }, [activeTab, filters, user, fetchTasks, fetchUsers]);

  const statusColors: Record<string, string> = {
    TODO: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    DONE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            All Users
          </button>
        </div>

        {activeTab === 'tasks' && (
          <>
            <TaskFiltersComponent
              filters={filters}
              onSearch={(s) => setFilters((f) => ({ ...f, search: s, page: 1 }))}
              onStatusFilter={(s) => setFilters((f) => ({ ...f, status: s, page: 1 }))}
              onSort={(sortBy, sortOrder) => setFilters((f) => ({ ...f, sortBy, sortOrder, page: 1 }))}
            />
            {fetching ? (
              <LoadingSkeleton count={5} />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3">Title</th>
                      <th className="text-left px-4 py-3">User</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Priority</th>
                      <th className="text-left px-4 py-3">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tasks.map((task) => (
                      <tr key={task.id} className="bg-white dark:bg-gray-900">
                        <td className="px-4 py-3 font-medium">{task.title}</td>
                        <td className="px-4 py-3 text-gray-500">{task.user?.name || task.userId}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">{task.priority}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tasks.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No tasks found.</p>
                )}
              </div>
            )}
            {!fetching && pagination.totalPages > 1 && (
              <Pagination pagination={pagination} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
            )}
          </>
        )}

        {activeTab === 'users' && (
          fetching ? (
            <LoadingSkeleton count={5} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Tasks</th>
                    <th className="text-left px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u: any) => (
                    <tr key={u.id} className="bg-white dark:bg-gray-900">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u._count?.tasks ?? 0}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-center py-8 text-gray-500">No users found.</p>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
