'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/projects/${resolvedParams.id}/assumptions`);
  }, [resolvedParams.id, router]);

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center text-xs font-mono text-[#6F6B65]">
      Opening project workspace...
    </div>
  );
}
