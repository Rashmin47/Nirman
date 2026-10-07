'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating quick auth / session initialization for demo
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="font-mono font-bold text-2xl tracking-tight text-[#191817]">
          NIRMAN
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-[#191817]">
          Sign in to your workspace
        </h2>
        <p className="mt-1 text-xs text-[#6F6B65]">
          Or{' '}
          <Link href="/signup" className="text-[#B85C38] hover:underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-8 px-6 border border-[#E5E0D8] rounded-[8px] sm:px-10 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              required
              placeholder="founder@nirman.build"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#6F6B65]">
                <input type="checkbox" className="rounded border-[#E5E0D8] text-[#B85C38] focus:ring-[#B85C38]" />
                Remember me
              </label>
              <a href="#" className="text-[#B85C38] hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 border-t border-[#E5E0D8] pt-4 text-center">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-[#6F6B65] hover:text-[#191817] block"
            >
              Continue to Demo Workspace without account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
