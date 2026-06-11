'use client';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Open command palette' },
  { keys: ['N'], label: 'Create new task' },
  { keys: ['C'], label: 'Create new task (alt)' },
  { keys: ['/'], label: 'Focus search' },
  { keys: ['?'], label: 'Show keyboard shortcuts' },
  { keys: ['ESC'], label: 'Close modal / dialog' },
];

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative card w-full max-w-sm mx-4 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[#111] dark:text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="btn-ghost w-7 h-7 p-0 flex items-center justify-center rounded-lg text-[#888]"
          >
            <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
              <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <table className="w-full">
          <tbody>
            {SHORTCUTS.map(({ keys, label }) => (
              <tr key={label} className="border-b border-[#f0f0f0] dark:border-[#1e1e1e] last:border-0">
                <td className="py-2.5 w-28">
                  <div className="flex items-center gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="text-[11px] font-medium text-[#555] dark:text-[#aaa] bg-[#f0f0f0] dark:bg-[#1e1e1e] border border-[#e8e8e8] dark:border-[#333] rounded px-1.5 py-0.5"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </td>
                <td className="py-2.5 text-sm text-[#555] dark:text-[#aaa]">{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
