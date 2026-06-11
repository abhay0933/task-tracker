'use client';

import Link from 'next/link';
import { format, isPast, isToday } from 'date-fns';
import clsx from 'clsx';
import { Task, TaskStatus } from '@/lib/types';

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  onStatusToggle: (id: string, currentStatus: TaskStatus) => void;
}

const priorityConfig: Record<string, { label: string; dot: string; accent: string }> = {
  LOW: { label: 'Low', dot: 'bg-emerald-500', accent: '#10b981' },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-500', accent: '#f59e0b' },
  HIGH: { label: 'High', dot: 'bg-rose-500', accent: '#f43f5e' },
};

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: 'Todo', className: 'badge-todo' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-progress' },
  DONE: { label: 'Done', className: 'badge-done' },
};

export default function TaskCard({ task, onDelete, onStatusToggle }: Props) {
  const isDone = task.status === 'DONE';
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isDone && !isToday(new Date(task.dueDate));
  const priority = priorityConfig[task.priority] ?? priorityConfig.MEDIUM;
  const status = statusConfig[task.status];

  return (
    <div
      className={clsx(
        'group card relative overflow-hidden pl-5 pr-4 py-3.5 flex items-center gap-3.5 transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/25 dark:hover:shadow-black/40',
        isDone && 'opacity-60'
      )}
    >
      {/* Priority accent bar — the single ambient priority signal */}
      <span
        aria-label={`${priority.label} priority`}
        title={`${priority.label} priority`}
        className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
        style={{ background: isDone ? 'transparent' : priority.accent, opacity: isDone ? 0 : 0.85 }}
      />

      {/* Status circle */}
      <button
        onClick={() => onStatusToggle(task.id, task.status)}
        title="Cycle status"
        className={clsx(
          'shrink-0 w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all duration-200',
          isDone
            ? 'border-transparent'
            : task.status === 'IN_PROGRESS'
            ? 'border-amber-500 bg-amber-400/15'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-500/10'
        )}
        style={isDone ? { background: '#6366f1' } : {}}
      >
        {isDone && (
          <svg width="10" height="10" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {task.status === 'IN_PROGRESS' && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'text-sm font-semibold truncate',
              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
            )}
          >
            {task.title}
          </span>
        </div>
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{task.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        {/* Due date — quiet unless overdue */}
        {task.dueDate && (
          <span
            className={clsx(
              'inline-flex items-center gap-1.5 text-xs font-medium',
              isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
            )}
            title={isOverdue ? 'Overdue' : 'Due date'}
          >
            <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
              <rect x="2" y="3" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
              <path d="M2 6h11M5 1.5v2M10 1.5v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}

        {/* Status badge — the primary status signal */}
        <span className={clsx('badge', status.className)}>{status.label}</span>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
        <Link href={`/tasks/${task.id}`} className="btn-ghost w-7 h-7 p-0 rounded-lg" title="Edit">
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
            <path
              d="M11.854 1.146a.5.5 0 0 0-.707 0L3.5 8.793V11.5h2.707l7.647-7.647a.5.5 0 0 0 0-.707l-2-2zM4.5 10.5v-1.293l5.5-5.5 1.293 1.293-5.5 5.5H4.5z"
              fill="currentColor"
            />
          </svg>
        </Link>
        <button
          onClick={() => onDelete(task.id)}
          className="btn-ghost w-7 h-7 p-0 rounded-lg !text-rose-500 hover:!bg-rose-50 dark:hover:!bg-rose-500/15"
          title="Delete"
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
            <path
              d="M5.5 1h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1zM2 4h11v1H2V4zm1.5 1.5h8l-.867 7.8a.5.5 0 0 1-.497.45H4.864a.5.5 0 0 1-.497-.45L3.5 5.5z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
