'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import CommandPalette from './CommandPalette';
import ShortcutsModal from './ShortcutsModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <>
      <nav className="glass-panel sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between" style={{ height: '52px' }}>
          <div className="flex items-center gap-6">
            <Link href="/tasks" className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#6366f1' }}>
                <svg width="11" height="11" viewBox="0 0 15 15" fill="none">
                  <path d="M3 7.5l3 3 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Tasks
            </Link>
            {user && (
              <div className="flex items-center gap-1">
                <Link
                  href="/tasks"
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    pathname.startsWith('/tasks')
                      ? 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                  }`}
                >
                  My Tasks
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                      pathname === '/admin'
                        ? 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => setCmdOpen(true)}
                className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg transition-all hover:text-indigo-600 dark:hover:text-indigo-400"
                style={{
                  background: 'rgba(148,163,184,0.10)',
                  border: '1px solid rgba(148,163,184,0.18)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
                  <path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM9.5 10.207l3.146 3.147" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span>Search</span>
                <kbd className="text-[10px] px-1 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.18)' }}>⌘K</kbd>
              </button>
            )}

            <button
              onClick={toggle}
              className="btn-ghost w-8 h-8 p-0 rounded-lg"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1.5a6 6 0 1 0 6 6 4.5 4.5 0 0 1-6-6z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="2.5" fill="currentColor"/>
                  <path d="M7.5 1v1M7.5 13v1M1 7.5h1M13 7.5h1M3.05 3.05l.7.7M11.25 11.25l.7.7M11.25 3.75l-.7.7M3.75 11.25l-.7.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            <button
              onClick={() => setShortcutsOpen(true)}
              className="btn-ghost w-8 h-8 p-0 rounded-lg text-sm font-semibold"
              title="Keyboard shortcuts"
            >?</button>

            {user && (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-300/50 dark:border-slate-600/30">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ background: '#6366f1' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300 hidden sm:block font-medium">{user.name}</span>
                <button onClick={handleLogout} className="btn-ghost text-xs px-2 py-1">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  );
}
