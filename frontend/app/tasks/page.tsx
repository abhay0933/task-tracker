'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Task, TaskFilters, TasksResponse, TaskStatus } from '@/lib/types';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import KanbanBoard from '@/components/KanbanBoard';
import Pagination from '@/components/Pagination';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import Toast from '@/components/Toast';
import clsx from 'clsx';

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

const STATUS_TABS: { label: string; value: TaskStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Todo', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'asc' },
  { label: 'Due Date ↑', sortBy: 'dueDate', sortOrder: 'asc' },
  { label: 'Due Date ↓', sortBy: 'dueDate', sortOrder: 'desc' },
  { label: 'Priority ↑', sortBy: 'priority', sortOrder: 'asc' },
  { label: 'Priority ↓', sortBy: 'priority', sortOrder: 'desc' },
];

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
    <path d="M1.5 3h12M1.5 7.5h12M1.5 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const KanbanIcon = () => (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="2" width="3.5" height="11" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="5.75" y="2" width="3.5" height="7" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="10.5" y="2" width="3.5" height="9" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  const [fetching, setFetching] = useState(true);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [view, setView] = useState<'list' | 'kanban'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('taskView') as 'list' | 'kanban') || 'list';
    }
    return 'list';
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  // Focus search on '/' keypress — wired via window event from tasks page
  useEffect(() => {
    function handleFocusSearch(e: KeyboardEvent) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleFocusSearch);
    return () => document.removeEventListener('keydown', handleFocusSearch);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get<TaskStats>('/tasks/stats');
      setStats(res.data);
    } catch {
      // Stats are optional — don't show error
    }
  }, []);

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
      const res = await api.get<TasksResponse>('/tasks', { params });
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch {
      showToast('Failed to fetch tasks', 'error');
    } finally {
      setFetching(false);
    }
  }, []);

  // For kanban we need all tasks (no pagination / filter by status)
  const fetchAllTasks = useCallback(async () => {
    try {
      const res = await api.get<TasksResponse>('/tasks', { params: { limit: '200' } });
      setAllTasks(res.data.tasks);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks(filters);
      fetchStats();
    }
  }, [filters, user, fetchTasks, fetchStats]);

  useEffect(() => {
    if (user && view === 'kanban') fetchAllTasks();
  }, [view, user, fetchAllTasks]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const search = e.target.value;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search, page: 1 }));
    }, 300);
  }

  async function handleDelete(id: string) {
    const prev = [...tasks];
    setTasks((t) => t.filter((task) => task.id !== id));
    try {
      await api.delete(`/tasks/${id}`);
      showToast('Task deleted', 'success');
      fetchStats();
    } catch {
      setTasks(prev);
      showToast('Failed to delete task', 'error');
    }
  }

  async function handleStatusToggle(id: string, currentStatus: TaskStatus) {
    const next: TaskStatus = currentStatus === 'TODO' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'DONE' : 'TODO';
    const prev = [...tasks];
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: next } : t)));
    try {
      await api.patch(`/tasks/${id}`, { status: next });
      fetchStats();
    } catch {
      setTasks(prev);
      showToast('Failed to update status', 'error');
    }
  }

  async function handleKanbanStatusChange(id: string, newStatus: TaskStatus) {
    await api.patch(`/tasks/${id}`, { status: newStatus });
    setAllTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    // Also update list view tasks if they're loaded
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    fetchStats();
  }

  function toggleView(v: 'list' | 'kanban') {
    setView(v);
    localStorage.setItem('taskView', v);
    if (v === 'kanban') fetchAllTasks();
  }

  if (authLoading) return null;

  const activeSort = SORT_OPTIONS.find(
    (o) => o.sortBy === filters.sortBy && o.sortOrder === filters.sortOrder
  ) || SORT_OPTIONS[0];

  const completePct = stats && stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const circumference = 2 * Math.PI * 14;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{pagination.total} task{pagination.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-xl p-0.5" style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <button
                onClick={() => toggleView('list')}
                className={clsx(
                  'flex items-center justify-center w-8 h-7 rounded-lg transition-all',
                  view === 'list'
                    ? 'text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                )}
                style={view === 'list' ? { background: '#6366f1' } : {}}
                title="List view"
              >
                <ListIcon />
              </button>
              <button
                onClick={() => toggleView('kanban')}
                className={clsx(
                  'flex items-center justify-center w-8 h-7 rounded-lg transition-all',
                  view === 'kanban'
                    ? 'text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                )}
                style={view === 'kanban' ? { background: '#6366f1' } : {}}
                title="Kanban view"
              >
                <KanbanIcon />
              </button>
            </div>

            <Link href="/tasks/new" className="btn-primary">
              <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              New task
            </Link>
          </div>
        </div>

        {/* Summary bar */}
        {stats && (
          <div className="card p-4 sm:px-5 mb-6 flex flex-wrap items-center gap-x-7 gap-y-4">
            {/* Progress ring + total */}
            <div className="flex items-center gap-3 pr-7 sm:border-r border-slate-300/50 dark:border-white/10">
              <div className="relative w-11 h-11 flex-shrink-0">
                <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3.5" />
                  <circle cx="22" cy="22" r="18" fill="none"
                    stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 - (completePct / 100) * 2 * Math.PI * 18}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                  {completePct}%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total tasks</p>
              </div>
            </div>

            {/* Status segments */}
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              {[
                { value: stats.todo, label: 'To do', color: '#6366f1' },
                { value: stats.inProgress, label: 'In progress', color: '#f59e0b' },
                { value: stats.done, label: 'Done', color: '#10b981' },
                { value: stats.overdue, label: 'Overdue', color: '#ef4444', alert: stats.overdue > 0 },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className={clsx('text-lg font-bold leading-none', s.alert ? 'text-red-500' : 'text-slate-900 dark:text-white')}>
                    {s.value}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'list' ? (
          <>
            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]">
                  <path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM9.5 10.207l3.146 3.147" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tasks…"
                  onChange={handleSearch}
                  className="input pl-9"
                />
              </div>
              <select
                value={`${activeSort.sortBy}:${activeSort.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split(':') as [TaskFilters['sortBy'], TaskFilters['sortOrder']];
                  setFilters((f) => ({ ...f, sortBy, sortOrder, page: 1 }));
                }}
                className="input sm:w-44 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={`${o.sortBy}:${o.sortOrder}`} value={`${o.sortBy}:${o.sortOrder}`}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1 mb-4">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilters((f) => ({ ...f, status: tab.value, page: 1 }))}
                  className={clsx(
                    'text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-150',
                    filters.status === tab.value
                      ? 'text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  )}
                  style={filters.status === tab.value
                    ? { background: '#6366f1', boxShadow: '0 2px 8px rgba(79,70,229,0.30)' }
                    : { background: 'transparent' }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Task list */}
            {fetching ? (
              <LoadingSkeleton count={6} />
            ) : tasks.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <svg width="22" height="22" viewBox="0 0 15 15" fill="none" className="text-indigo-500">
                    <path d="M1.5 3h12M1.5 7.5h12M1.5 12h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">No tasks yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Create your first task to get started</p>
                <Link href="/tasks/new" className="btn-primary text-xs px-4 py-2">
                  + Create task
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onDelete={handleDelete} onStatusToggle={handleStatusToggle} />
                ))}
              </div>
            )}

            {!fetching && pagination.totalPages > 1 && (
              <Pagination pagination={pagination} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
            )}
          </>
        ) : (
          <KanbanBoard tasks={allTasks} onStatusChange={handleKanbanStatusChange} />
        )}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
