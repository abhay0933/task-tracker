'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.token, res.data.user);
      router.push('/tasks');
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — gradient brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-end p-12"
        style={{
          background: 'linear-gradient(135deg, #1e1040 0%, #2d1b69 40%, #1a1040 70%, #0f0828 100%)',
        }}
      >
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

        <div className="relative z-10">
          {/* Logo mark */}
          <div className="w-10 h-10 rounded-xl mb-10 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 8px 24px rgba(139,92,246,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 15 15" fill="none">
              <path d="M1.5 3h12M1.5 7.5h12M1.5 12h7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-white text-2xl font-semibold mb-3">Stay on top of everything.</h2>
          <p className="text-purple-200/60 text-sm leading-relaxed max-w-xs">
            Plan, track, and complete your work without the chaos. Built for people who actually want to get things done.
          </p>
        </div>
      </div>

      {/* Right — glass form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="w-9 h-9 rounded-xl mb-8 flex items-center justify-center lg:hidden"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 6px 20px rgba(139,92,246,0.35)' }}>
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
              <path d="M1.5 3h12M1.5 7.5h12M1.5 12h7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#1a1a2e] dark:text-white mb-1">Welcome back</h1>
          <p className="text-sm text-[#9494bb] dark:text-[#5a5a8a] mb-8">Sign in to your account to continue</p>

          <div className="card p-6 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b6b9a] dark:text-[#7a7aaa] mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" {...register('email')} className="input" placeholder="you@example.com" autoComplete="email" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b6b9a] dark:text-[#7a7aaa] mb-1.5 uppercase tracking-wider">Password</label>
                <input type="password" {...register('password')} className="input" placeholder="••••••••" autoComplete="current-password" />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {serverError && (
                <div className="rounded-lg px-3 py-2.5 text-sm text-red-500 dark:text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {serverError}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 mt-1">
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="text-sm text-center mt-5 text-[#9494bb] dark:text-[#5a5a8a]">
            No account?{' '}
            <Link href="/signup" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
