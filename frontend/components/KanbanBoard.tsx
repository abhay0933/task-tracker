'use client';

import { useEffect, useState } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, rectIntersection,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '@/lib/types';
import clsx from 'clsx';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (id: string, newStatus: TaskStatus) => Promise<void>;
}

const COLUMNS: { id: TaskStatus; label: string; dotClass: string; badgeClass: string }[] = [
  { id: 'TODO',        label: 'Todo',        dotClass: 'bg-slate-400',  badgeClass: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200' },
  { id: 'IN_PROGRESS', label: 'In Progress', dotClass: 'bg-amber-400',  badgeClass: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' },
  { id: 'DONE',        label: 'Done',        dotClass: 'bg-indigo-500', badgeClass: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' },
];

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-emerald-400',
};

function KanbanCard({ task, isDragging = false }: { task: Task; isDragging?: boolean }) {
  const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();
  return (
    <div className={clsx(
      'card p-3 cursor-grab active:cursor-grabbing select-none transition-all',
      isDragging && 'opacity-40 rotate-1 scale-105'
    )}>
      <div className="flex items-start gap-2">
        <span className={clsx('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0', PRIORITY_COLORS[task.priority])} />
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">{task.title}</p>
      </div>
      {task.dueDate && (
        <p className={clsx('text-xs mt-2 ml-3.5', isOverdue ? 'text-rose-500 font-medium' : 'text-slate-500 dark:text-slate-400')}>
          {isOverdue ? '⚠ ' : ''}
          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}

function SortableKanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <KanbanCard task={task} isDragging={isDragging} />
    </div>
  );
}

// Each column owns its own isOver state via useDroppable — avoids parent re-render loop
function DroppableColumn({
  col,
  colTasks,
}: {
  col: typeof COLUMNS[number];
  colTasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id, data: { type: 'column', status: col.id } });

  return (
    <div className="flex flex-col gap-2 min-h-[300px]">
      {/* Column header */}
      <div className="card px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={clsx('w-2 h-2 rounded-full', col.dotClass)} />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {col.label}
          </span>
        </div>
        <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', col.badgeClass)}>
          {colTasks.length}
        </span>
      </div>

      {/* Drop zone — registered with dnd-kit */}
      <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={clsx(
            'flex flex-col gap-2 flex-1 rounded-xl p-1.5 min-h-[200px] transition-colors duration-150',
            isOver
              ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-dashed border-indigo-300 dark:border-indigo-700'
              : 'border border-dashed border-slate-300/60 dark:border-slate-600/40'
          )}
          style={!isOver ? { background: 'rgba(148,163,184,0.06)' } : undefined}
        >
          {colTasks.map((task) => (
            <SortableKanbanCard key={task.id} task={task} />
          ))}
          {colTasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className={clsx('text-xs', isOver ? 'text-indigo-400' : 'text-slate-400 dark:text-slate-500')}>
                {isOver ? 'Release to drop' : 'Drop here'}
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Sync when tasks prop changes from outside (e.g. after API call)
  useEffect(() => {
    if (!activeTask) setLocalTasks(tasks);
  }, [tasks, activeTask]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragStart(event: DragStartEvent) {
    const task = localTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const dragged = localTasks.find((t) => t.id === active.id);
    if (!dragged) return;

    // Destination can be a column droppable or a task inside a column
    const overColDef = COLUMNS.find((c) => c.id === over.id);
    const destStatus: TaskStatus | undefined = overColDef
      ? overColDef.id
      : localTasks.find((t) => t.id === over.id)?.status;

    if (!destStatus || dragged.status === destStatus) return;

    setLocalTasks((prev) =>
      prev.map((t) => (t.id === dragged.id ? { ...t, status: destStatus } : t))
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    setActiveTask(null);

    const movedTask = localTasks.find((t) => t.id === active.id);
    const originalTask = tasks.find((t) => t.id === active.id);
    if (movedTask && originalTask && movedTask.status !== originalTask.status) {
      try {
        await onStatusChange(movedTask.id, movedTask.status);
      } catch {
        setLocalTasks(tasks);
      }
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
    setLocalTasks(tasks);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = localTasks.filter((t) => t.status === col.id);
          return (
            <DroppableColumn
              key={col.id}
              col={col}
              colTasks={colTasks}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
