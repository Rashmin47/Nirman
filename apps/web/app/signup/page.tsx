'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/projects/new');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="font-mono font-bold text-2xl tracking-tight text-[#191817]">
          NIRMAN
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-[#191817]">
          Create your builder account
        </h2>
        <p className="mt-1 text-xs text-[#6F6B65]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#B85C38] hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-8 px-6 border border-[#E5E0D8] rounded-[8px] sm:px-10 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="Alex Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email address"
              type="email"
              required
              placeholder="alex@example.com"
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

            <p className="text-[11px] text-[#6F6B65]">
              By signing up, you agree to validate assumptions with real user evidence before shipping.
            </p>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
              Create Account & Start
            </Button>
          </form>

          <div className="mt-6 border-t border-[#E5E0D8] pt-4 text-center">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-[#6F6B65] hover:text-[#191817] block"
            >
              Skip to Demo Project Workspace →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
