'use client';

import { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import CommandPalette from './CommandPalette';
import ShortcutsModal from './ShortcutsModal';

export default function GlobalShortcuts() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useKeyboardShortcuts({
    onOpenCommandPalette: () => setCmdOpen(true),
    onOpenShortcuts: () => setShortcutsOpen(true),
  });

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  );
}
