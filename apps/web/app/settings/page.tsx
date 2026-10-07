'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, Server, Key, Database, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');
  const [saved, setSaved] = useState(false);

  const checkHealth = async () => {
    try {
      setHealthStatus('checking');
      const res = await fetch(`${apiUrl}/health`);
      if (res.ok) {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('offline');
      }
    } catch {
      setHealthStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
  }, [apiUrl]);

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        <div className="border-b border-[#E5E0D8] pb-4">
          <h1 className="text-xl font-bold text-[#191817] tracking-tight">Workspace Settings</h1>
          <p className="text-xs text-[#6F6B65] mt-0.5">
            Configure system endpoints, AI orchestration providers, and persistent project memory.
          </p>
        </div>

        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-[#6F6B65]" />
              <span className="text-sm font-semibold text-[#191817]">FastAPI Backend Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={healthStatus === 'healthy' ? 'success' : 'danger'}>
                {healthStatus.toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm" onClick={checkHealth}>
                <RefreshCw size={12} />
              </Button>
            </div>
          </div>

          <Input
            label="API BASE URL"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
          />

          <p className="text-xs text-[#6F6B65]">
            Points to your FastAPI service hosting LangGraph workflows and database endpoints.
          </p>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <Key size={16} className="text-[#6F6B65]" />
            <span className="text-sm font-semibold text-[#191817]">AI Provider Configuration</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-[6px] bg-[#F7F5F0] border border-[#E5E0D8]">
              <div>
                <span className="font-semibold text-[#191817] block">Google Gemini Provider</span>
                <span className="text-[#6F6B65]">Structured extraction & evidence reasoning using Gemini 2.5 Flash</span>
              </div>
              <Badge variant="accent">CONFIGURED IN BACKEND</Badge>
            </div>

            <div className="p-3 rounded-[6px] bg-[#F7F5F0] border border-[#E5E0D8]">
              <span className="font-mono text-[#6F6B65] uppercase block mb-1">ZERO-FAILURE LOCAL FALLBACK</span>
              <p className="text-[#191817]">
                When <code>GOOGLE_API_KEY</code> is omitted, Nirman automatically uses high-fidelity deterministic reasoning models to prevent blocking local development or offline evaluation.
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
            <Database size={16} className="text-[#6F6B65]" />
            <span className="text-sm font-semibold text-[#191817]">Database & Vector Storage</span>
          </div>

          <div className="space-y-2 text-xs text-[#6F6B65]">
            <p>
              Primary store: <strong className="text-[#191817]">PostgreSQL / SQLite via SQLAlchemy Async</strong>
            </p>
            <p>
              Supabase schema: <strong className="text-[#191817]">supabase/migrations/20250101_initial_schema.sql</strong>
            </p>
            <p>
              Embeddings & similarity: <strong className="text-[#191817]">pgvector ready</strong>
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
