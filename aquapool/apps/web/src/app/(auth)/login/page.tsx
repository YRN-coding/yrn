'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthStore } from '@/lib/store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  totpCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [requireTotp, setRequireTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const res = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json() as { success: boolean; data: { requireTotp?: boolean; accessToken: string; refreshToken: string; user: { id: string; email: string; kycTier: string } }; error?: { message: string } };

      if (!json.success) { setError(json.error?.message ?? 'Login failed'); return; }
      if (json.data.requireTotp) { setRequireTotp(true); return; }

      login(json.data.accessToken, json.data.refreshToken, json.data.user);
      window.location.href = '/dashboard';
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">Aquapool</Link>
          <h1 className="text-2xl font-semibold mt-4 mb-2">Welcome back</h1>
          <p className="text-muted">Sign in to your account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
              />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
              />
              {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
            </div>

            {requireTotp && (
              <div>
                <label className="block text-sm font-medium mb-1">2FA Code</label>
                <input
                  {...register('totpCode')}
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-dark border border-primary/50 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none tracking-widest text-center"
                />
              </div>
            )}

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs text-muted bg-surface px-3">or</div>
          </div>

          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full py-3 bg-surface border border-white/10 rounded-lg font-medium text-sm hover:border-primary/50 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>

        <p className="text-center text-muted text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
