'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { StatusIndicator } from '@/components/ui/SectionHeader';
import { api } from '@/lib/api';
import { Assumption, Project } from '@nirman/types';
import {
  AlertTriangle,
  FlaskConical,
  Plus,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function AssumptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [assumptions, setAssumptions] = useState<Assumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New assumption state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newWhy, setNewWhy] = useState('');
  const [newRisk, setNewRisk] = useState<'low' | 'medium' | 'high'>('high');

  const loadData = async () => {
    try {
      setLoading(true);
      const proj = await api.getProject(projectId);
      setProject(proj);
      const list = await api.getAssumptions(projectId);
      setAssumptions(list);
    } catch (err) {
      console.error('Error fetching assumptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleAddAssumption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createAssumption(projectId, {
        title: newTitle.trim(),
        description: newDesc.trim(),
        risk: newRisk,
        confidence: 0.45,
        status: 'UNKNOWN',
        why_it_matters: newWhy.trim() || undefined,
      });
      setNewTitle('');
      setNewDesc('');
      setNewWhy('');
      setShowAddForm(false);
      await loadData();
    } catch (err: any) {
      alert(`Error creating assumption: ${err.message}`);
    }
  };

  // Find top risk assumption
  const highRisks = assumptions.filter((a) => a.risk === 'high');
  const topToProve = highRisks.sort((a, b) => a.confidence - b.confidence)[0] || assumptions[0];

  return (
    <AppShell
      projectId={projectId}
      projectName={project?.name}
      projectStage={project?.stage}
    >
      <div className="space-y-8">
        {/* Top Validation Recommendation Banner */}
        {topToProve && (
          <div className="border border-[#B85C38]/40 bg-[#FFFFFF] rounded-[8px] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] mb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B85C38] uppercase tracking-wider">
                <AlertTriangle size={15} />
                <span>WHAT SHOULD WE PROVE FIRST?</span>
              </div>
              <Badge variant="danger">HIGHEST SENSITIVITY</Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <h3 className="text-base font-semibold text-[#191817]">
                  {topToProve.title}
                </h3>
                <p className="text-xs text-[#6F6B65] leading-relaxed">
                  {topToProve.why_it_matters || topToProve.description}
                </p>
                <div className="text-[11px] font-mono text-[#6F6B65] pt-1">
                  Current confidence: <span className="font-bold text-[#191817]">{Math.round(topToProve.confidence * 100)}%</span> · Evidence count: {topToProve.evidence_count}
                </div>
              </div>

              <Link href={`/projects/${projectId}/experiments`}>
                <Button variant="primary" size="sm">
                  <FlaskConical size={14} />
                  <span>Test this Assumption</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#191817] tracking-tight">Assumption Board</h1>
            <p className="text-xs text-[#6F6B65] mt-0.5">
              Every premise your product relies upon. Nirman tracks changes in confidence as field evidence arrives.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={14} />
            <span>{showAddForm ? 'Cancel' : 'Add Assumption'}</span>
          </Button>
        </div>

        {/* Add Assumption Inline Form */}
        {showAddForm && (
          <Card className="bg-[#FFFFFF] border-[#B85C38]/40">
            <form onSubmit={handleAddAssumption} className="space-y-4">
              <div className="text-xs font-mono font-bold text-[#191817] uppercase">
                New Assumption Premise
              </div>
              <Input
                label="TITLE"
                placeholder="e.g. Clients will pay for junior developer deliverables"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                label="DESCRIPTION"
                placeholder="What specifically are you taking for granted?"
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <Input
                label="WHY IT MATTERS"
                placeholder="If this assumption is false, what part of the product direction changes?"
                value={newWhy}
                onChange={(e) => setNewWhy(e.target.value)}
              />
              <div className="flex items-center gap-4">
                <label className="text-xs font-mono text-[#6F6B65]">RISK LEVEL:</label>
                {(['high', 'medium', 'low'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRisk(r)}
                    className={`px-3 py-1 rounded-[4px] text-xs font-mono uppercase ${
                      newRisk === r
                        ? 'bg-[#B85C38] text-white'
                        : 'bg-[#F7F5F0] text-[#6F6B65] border border-[#E5E0D8]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Assumption
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Assumptions Grid */}
        {loading ? (
          <div className="text-center py-12 text-xs font-mono text-[#6F6B65]">
            Loading assumptions...
          </div>
        ) : assumptions.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#E5E0D8] rounded-[8px] bg-white">
            <p className="text-xs text-[#6F6B65]">No assumptions recorded for this project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assumptions.map((a) => (
              <Card key={a.id} className="flex flex-col justify-between hover:border-[#6F6B65] transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <StatusIndicator status={a.status} />
                    <Badge variant={a.risk === 'high' ? 'danger' : a.risk === 'medium' ? 'warning' : 'neutral'}>
                      {a.risk.toUpperCase()} RISK
                    </Badge>
                  </div>

                  <h3 className="text-sm font-semibold text-[#191817] leading-snug mb-1.5">
                    {a.title}
                  </h3>

                  <p className="text-xs text-[#6F6B65] leading-relaxed mb-3">
                    {a.description}
                  </p>

                  {a.why_it_matters && (
                    <div className="p-2.5 rounded-[4px] bg-[#F7F5F0] border border-[#E5E0D8] text-[11px] mb-3">
                      <span className="font-mono font-semibold text-[#191817] block mb-0.5">Why it matters:</span>
                      <span className="text-[#6F6B65]">{a.why_it_matters}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#6F6B65]">
                      Confidence: <strong className="text-[#191817]">{Math.round(a.confidence * 100)}%</strong>
                    </span>
                    <span className="text-[#E5E0D8]">·</span>
                    <span className="text-[#6F6B65]">
                      Evidence: <strong className="text-[#191817]">{a.evidence_count}</strong>
                    </span>
                  </div>

                  <Link href={`/projects/${projectId}/experiments`}>
                    <Button variant="ghost" size="sm" className="text-xs text-[#B85C38] hover:text-[#A04D2D]">
                      <span>Test this →</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
