'use client';

import { format } from 'date-fns';
import { ActivityLog } from '@/lib/types';

interface Props {
  logs: ActivityLog[];
}

const actionColors: Record<string, string> = {
  CREATED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  UPDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DELETED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ActivityLogComponent({ logs }: Props) {
  if (logs.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="text-sm border-l-2 border-gray-200 dark:border-gray-600 pl-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}
            >
              {log.action}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              by {log.user?.name || 'Unknown'} &bull;{' '}
              {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
            </span>
          </div>
          {log.oldValues && Object.keys(log.oldValues).length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Object.keys(log.oldValues).map((key) => (
                <span key={key} className="mr-3">
                  <span className="font-medium">{key}:</span>{' '}
                  <span className="line-through text-red-400">
                    {String((log.oldValues as any)[key] ?? '')}
                  </span>
                  {' → '}
                  <span className="text-green-500">
                    {String((log.newValues as any)?.[key] ?? '')}
                  </span>
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
