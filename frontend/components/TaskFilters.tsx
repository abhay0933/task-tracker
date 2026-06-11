'use client';

import { useState } from 'react';
import { TaskFilters, TaskStatus } from '@/lib/types';

interface Props {
  filters: TaskFilters;
  onSearch: (s: string) => void;
  onStatusFilter: (s: TaskStatus | '') => void;
  onSort: (sortBy: TaskFilters['sortBy'], sortOrder: TaskFilters['sortOrder']) => void;
}

const statusTabs: { label: string; value: TaskStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Todo', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
];

export default function TaskFiltersComponent({ filters, onSearch, onStatusFilter, onSort }: Props) {
  const [searchVal, setSearchVal] = useState('');

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchVal(e.target.value);
    onSearch(e.target.value);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [sortBy, sortOrder] = e.target.value.split(':') as [TaskFilters['sortBy'], TaskFilters['sortOrder']];
    onSort(sortBy, sortOrder);
  }

  const currentSortValue = `${filters.sortBy || 'createdAt'}:${filters.sortOrder || 'desc'}`;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchVal}
          onChange={handleSearchChange}
          placeholder="Search tasks..."
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <select
          value={currentSortValue}
          onChange={handleSortChange}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt:desc">Newest First</option>
          <option value="createdAt:asc">Oldest First</option>
          <option value="dueDate:asc">Due Date (Soonest)</option>
          <option value="dueDate:desc">Due Date (Latest)</option>
          <option value="priority:desc">Priority (High-Low)</option>
          <option value="priority:asc">Priority (Low-High)</option>
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (filters.status || '') === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
