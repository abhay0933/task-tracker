'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  submitLabel?: string;
  defaultValues?: Partial<FormData>;
}

export default function TaskForm({ onSubmit, submitLabel = 'Save', defaultValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'TODO', priority: 'MEDIUM', ...defaultValues },
  });

  async function submit(data: FormData) {
    setServerError('');
    try {
      await onSubmit(data);
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.response?.data?.errors?.[0]?.message || 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1.5 uppercase tracking-wide">
          Title <span className="text-[#e5484d]">*</span>
        </label>
        <input type="text" {...register('title')} className="input" placeholder="What needs to be done?" />
        {errors.title && <p className="text-[#e5484d] text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1.5 uppercase tracking-wide">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="input resize-none"
          placeholder="Add more details…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1.5 uppercase tracking-wide">Status</label>
          <select {...register('status')} className="input cursor-pointer">
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1.5 uppercase tracking-wide">Priority</label>
          <select {...register('priority')} className="input cursor-pointer">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1.5 uppercase tracking-wide">Due Date</label>
        <input type="date" {...register('dueDate')} className="input" />
      </div>

      {serverError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
          <p className="text-[#e5484d] text-sm">{serverError}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-2.5">
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost flex-1 py-2.5 border border-[#e8e8e8] dark:border-[#222]">
          Cancel
        </button>
      </div>
    </form>
  );
}
