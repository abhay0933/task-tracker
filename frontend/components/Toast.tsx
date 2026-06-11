'use client';

interface Props {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: Props) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg border text-sm font-medium bg-white dark:bg-[#1a1a1a] border-[#e8e8e8] dark:border-[#2a2a2a] text-[#111] dark:text-white">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${type === 'success' ? 'bg-green-500' : 'bg-[#e5484d]'}`} />
      {message}
    </div>
  );
}
