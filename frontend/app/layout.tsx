import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import GlobalShortcuts from '@/components/GlobalShortcuts';
import Background from '@/components/Background';

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'A clean task management application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <Background />
            <GlobalShortcuts />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
