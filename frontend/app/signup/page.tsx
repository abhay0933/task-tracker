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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError('');
    try {
      const res = await api.post('/auth/signup', data);
      login(res.data.token, res.data.user);
      router.push('/tasks');
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Signup failed');
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#111] dark:bg-[#0a0a0a] items-end p-12">
        <div>
          <div className="w-8 h-8 bg-white rounded-lg mb-12" />
          <blockquote className="text-white/70 text-sm leading-relaxed max-w-xs">
            "Built for people who actually want to get things done."
          </blockquote>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#f8f8f8] dark:bg-[#0d0d0d]">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="w-7 h-7 bg-[#111] dark:bg-white rounded-md mb-8 lg:hidden" />
            <h1 className="text-2xl font-semibold text-[#111] dark:text-white">Create account</h1>
            <p className="text-sm text-[#888] mt-1">Free forever. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1.5 uppercase tracking-wide">Name</label>
              <input type="text" {...register('name')} className="input" placeholder="Your name" autoComplete="name" />
              {errors.name && <p className="text-[#e5484d] text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" {...register('email')} className="input" placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-[#e5484d] text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1.5 uppercase tracking-wide">Password</label>
              <input type="password" {...register('password')} className="input" placeholder="Min. 8 characters" autoComplete="new-password" />
              {errors.password && <p className="text-[#e5484d] text-xs mt-1">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                <p className="text-[#e5484d] text-sm">{serverError}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 mt-2">
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-[#888]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#111] dark:text-white font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
