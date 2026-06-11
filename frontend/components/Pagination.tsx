'use client';

import { Pagination as PaginationType } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: Props) {
  const { page, totalPages } = pagination;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2));

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn-ghost px-3 py-1.5 disabled:opacity-30"
      >
        ← Prev
      </button>

      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        return (
          <span key={p} className="flex items-center gap-1">
            {prev && p - prev > 1 && <span className="px-1 text-[#aaa] text-sm">…</span>}
            <button
              onClick={() => onPageChange(p)}
              className={clsx(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                p === page
                  ? 'bg-[#111] dark:bg-white text-white dark:text-[#111]'
                  : 'text-[#888] hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e] hover:text-[#111] dark:hover:text-white'
              )}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="btn-ghost px-3 py-1.5 disabled:opacity-30"
      >
        Next →
      </button>
    </div>
  );
}
