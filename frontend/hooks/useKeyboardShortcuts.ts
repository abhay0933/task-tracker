'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Options {
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onFocusSearch?: () => void;
}

export function useKeyboardShortcuts({ onOpenCommandPalette, onOpenShortcuts, onFocusSearch }: Options) {
  const router = useRouter();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

      // Cmd+K / Ctrl+K — always
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      if (isInput) return;

      if (e.key === 'n' || e.key === 'c') {
        router.push('/tasks/new');
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        onFocusSearch?.();
        return;
      }

      if (e.key === '?') {
        onOpenShortcuts();
        return;
      }
    }

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [router, onOpenCommandPalette, onOpenShortcuts, onFocusSearch]);
}
