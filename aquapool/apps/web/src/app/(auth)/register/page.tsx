'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useState } from 'react';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v, 'You must accept the terms'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      const res = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, phone: data.phone }),
      });
      const json = await res.json() as { success: boolean; error?: { message: string } };
      if (!json.success) { setError(json.error?.message ?? 'Registration failed'); return; }
      setSuccess(true);
      setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Account created!</h2>
          <p className="text-muted">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">Aquapool</Link>
          <h1 className="text-2xl font-semibold mt-4 mb-2">Create your account</h1>
          <p className="text-muted">No bank account required</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { name: 'password' as const, label: 'Password', type: 'password', placeholder: '••••••••' },
              { name: 'confirmPassword' as const, label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
              { name: 'phone' as const, label: 'Phone (optional)', type: 'tel', placeholder: '+1 234 567 8900' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  {...register(name)}
                  type={type}
                  placeholder={placeholder}
                  className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                />
                {errors[name] && <p className="text-error text-xs mt-1">{errors[name]?.message}</p>}
              </div>
            ))}

            <label className="flex items-start gap-3 cursor-pointer">
              <input {...register('acceptTerms')} type="checkbox" className="mt-0.5 accent-primary" />
              <span className="text-sm text-muted">
                I accept the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptTerms && <p className="text-error text-xs">{errors.acceptTerms.message}</p>}

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
