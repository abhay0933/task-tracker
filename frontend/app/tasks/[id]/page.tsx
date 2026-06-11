'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TaskForm from '@/components/TaskForm';
import ActivityLogComponent from '@/components/ActivityLog';
import api from '@/lib/api';
import { Task, ActivityLog } from '@/lib/types';

export default function EditTaskPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      try {
        const [taskRes, logsRes] = await Promise.all([
          api.get(`/tasks/${id}`),
          api.get(`/tasks/${id}/activity`),
        ]);
        setTask(taskRes.data.task);
        setLogs(logsRes.data.logs);
      } catch {
        setError('Task not found or access denied');
      } finally {
        setFetching(false);
      }
    })();
  }, [user, id]);

  async function handleSubmit(data: any) {
    await api.patch(`/tasks/${id}`, data);
    router.push('/tasks');
  }

  if (authLoading || fetching) return null;

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
          {task && (
            <TaskForm
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
              defaultValues={{
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
              }}
            />
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
          <ActivityLogComponent logs={logs} />
        </div>
      </main>
    </div>
  );
}
