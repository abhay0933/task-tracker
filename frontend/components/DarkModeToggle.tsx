'use client';

import { useTheme } from '@/context/ThemeContext';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
