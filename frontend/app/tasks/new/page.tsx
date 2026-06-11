'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TaskForm from '@/components/TaskForm';
import api from '@/lib/api';

export default function NewTaskPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  async function handleSubmit(data: any) {
    await api.post('/tasks', data);
    router.push('/tasks');
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a1030] dark:text-white">New Task</h1>
          <p className="text-sm text-[#9090b8] dark:text-[#a0a0d0] mt-1">Add a new task to your list</p>
        </div>
        <div className="card p-6">
          <TaskForm onSubmit={handleSubmit} submitLabel="Create Task" />
        </div>
      </main>
    </div>
  );
}
