'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';
import { Task } from '@/lib/types';
import clsx from 'clsx';

interface CommandItem {
  id: string;
  label: string;
  section: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="text-[#aaa]">
    <path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM9.5 10.207l3.146 3.147" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toggle: toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [taskResults, setTaskResults] = useState<Task[]>([]);
  const [searchingTasks, setSearchingTasks] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const close = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    setTaskResults([]);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced task search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim()) {
      setTaskResults([]);
      return;
    }
    setSearchingTasks(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await api.get('/tasks', { params: { search: query, limit: 5 } });
        setTaskResults(res.data.tasks);
      } catch {
        setTaskResults([]);
      } finally {
        setSearchingTasks(false);
      }
    }, 300);
  }, [query]);

  const staticItems: CommandItem[] = [
    {
      id: 'nav-tasks',
      label: 'Go to Tasks',
      section: 'Navigation',
      shortcut: 'G T',
      icon: (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
          <path d="M1.5 3h12M1.5 7.5h12M1.5 12h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
      action: () => { router.push('/tasks'); close(); },
    },
    {
      id: 'nav-new',
      label: 'Create New Task',
      section: 'Navigation',
      shortcut: 'N',
      icon: (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      action: () => { router.push('/tasks/new'); close(); },
    },
    ...(user?.role === 'ADMIN'
      ? [{
          id: 'nav-admin',
          label: 'Go to Admin',
          section: 'Navigation',
          icon: (
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 13c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          ),
          action: () => { router.push('/admin'); close(); },
        }]
      : []),
    {
      id: 'action-theme',
      label: 'Toggle Dark Mode',
      section: 'Actions',
      icon: (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 1.5a6 6 0 1 0 6 6 4.5 4.5 0 0 1-6-6z" fill="currentColor"/>
        </svg>
      ),
      action: () => { toggleTheme(); close(); },
    },
    {
      id: 'action-signout',
      label: 'Sign Out',
      section: 'Actions',
      icon: (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
          <path d="M5 3H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2M10 10l3-2.5L10 5M5 7.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      action: () => { logout(); router.push('/login'); close(); },
    },
  ];

  const filtered = query
    ? staticItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : staticItems;

  const taskItems: CommandItem[] = taskResults.map((task) => ({
    id: `task-${task.id}`,
    label: task.title,
    section: 'Tasks',
    icon: (
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
        <rect x="2" y="2" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M5 7.5l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    action: () => { router.push(`/tasks/${task.id}`); close(); },
  }));

  const allItems = [...filtered, ...taskItems];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      allItems[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      close();
    }
  }

  if (!open) return null;

  // Group items by section
  const sections: Record<string, CommandItem[]> = {};
  for (const item of allItems) {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  }

  let globalIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 card overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e8e8e8] dark:border-[#1e1e1e]">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands or tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#111] dark:text-white placeholder-[#aaa] outline-none"
          />
          <kbd className="text-[10px] text-[#aaa] border border-[#e8e8e8] dark:border-[#333] rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {allItems.length === 0 && !searchingTasks && (
            <p className="text-sm text-[#888] text-center py-8">No results found</p>
          )}
          {searchingTasks && (
            <p className="text-xs text-[#aaa] px-4 py-2">Searching tasks…</p>
          )}

          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wider px-4 pt-3 pb-1">
                {section}
              </p>
              {items.map((item) => {
                const idx = globalIndex++;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selectedIndex === idx
                        ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e]'
                        : 'hover:bg-[#f8f8f8] dark:hover:bg-[#181818]'
                    )}
                  >
                    <span className="text-[#666] dark:text-[#888] flex-shrink-0">{item.icon}</span>
                    <span className="text-sm text-[#111] dark:text-white flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className="flex items-center gap-1">
                        {item.shortcut.split(' ').map((k) => (
                          <kbd
                            key={k}
                            className="text-[10px] text-[#aaa] border border-[#e8e8e8] dark:border-[#333] rounded px-1.5 py-0.5"
                          >
                            {k}
                          </kbd>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e8e8e8] dark:border-[#1e1e1e] px-4 py-2 flex items-center gap-4 text-[10px] text-[#aaa]">
          <span><kbd className="border border-[#e8e8e8] dark:border-[#333] rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="border border-[#e8e8e8] dark:border-[#333] rounded px-1">↵</kbd> select</span>
          <span><kbd className="border border-[#e8e8e8] dark:border-[#333] rounded px-1">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
