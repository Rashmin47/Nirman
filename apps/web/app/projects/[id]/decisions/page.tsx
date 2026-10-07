'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { DecisionLog, Project } from '@nirman/types';
import { GitBranch, Database, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

export default function DecisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [decisions, setDecisions] = useState<DecisionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [p, dList] = await Promise.all([
          api.getProject(projectId),
          api.getDecisions(projectId),
        ]);
        setProject(p);
        setDecisions(dList);
      } catch (err) {
        console.error('Error fetching decisions:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  return (
    <AppShell
      projectId={projectId}
      projectName={project?.name}
      projectStage={project?.stage}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#191817] tracking-tight">Strategic Decision Log</h1>
            <p className="text-xs text-[#6F6B65] mt-0.5">
              An immutable record of product direction pivots, why they occurred, and what empirical evidence justified them.
            </p>
          </div>

          <Link href={`/projects/${projectId}/evidence`}>
            <Button variant="outline" size="sm">
              <Database size={13} />
              <span>Inspect Supporting Evidence</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs font-mono text-[#6F6B65]">
            Loading decision history...
          </div>
        ) : decisions.length === 0 ? (
          <div className="border border-dashed border-[#E5E0D8] rounded-[8px] p-12 text-center bg-white">
            <GitBranch className="mx-auto text-[#6F6B65] mb-2" size={32} />
            <h3 className="text-sm font-semibold text-[#191817]">No strategic decisions logged yet</h3>
            <p className="text-xs text-[#6F6B65] mt-1 mb-4">
              Gather evidence and run the AI analysis to record direction checkpoints.
            </p>
            <Link href={`/projects/${projectId}/evidence`}>
              <Button variant="primary" size="sm">
                Add Evidence to Trigger Decision
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {decisions.map((dec) => (
              <Card key={dec.id} className="border-[#E5E0D8] bg-[#FFFFFF] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#191817]">
                      DECISION #{String(dec.decision_number).padStart(2, '0')}
                    </span>
                    <Badge variant={dec.action === 'CHANGE_DIRECTION' ? 'danger' : 'accent'}>
                      {dec.action}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#6F6B65]">
                    <Clock size={12} />
                    <span>{new Date(dec.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    {dec.original_assumption && (
                      <div>
                        <span className="font-mono text-[#6F6B65] uppercase block mb-1">
                          ORIGINAL ASSUMPTION
                        </span>
                        <p className="text-[#191817] font-medium leading-relaxed bg-[#F7F5F0] p-2.5 rounded-[4px] border border-[#E5E0D8]">
                          {dec.original_assumption}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="font-mono text-[#6F6B65] uppercase block mb-1">
                        EVIDENCE ANALYZED
                      </span>
                      <p className="text-[#191817] leading-relaxed">
                        {dec.evidence_summary}
                      </p>
                    </div>

                    <div>
                      <span className="font-mono text-[#6F6B65] uppercase block mb-1">
                        KEY FINDING
                      </span>
                      <p className="text-[#191817] leading-relaxed">
                        {dec.key_finding}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#B85C38]/5 border border-[#B85C38]/20 p-3.5 rounded-[6px]">
                      <span className="font-mono text-xs text-[#B85C38] uppercase font-bold block mb-1">
                        STRATEGIC DECISION
                      </span>
                      <p className="text-xs text-[#191817] font-medium leading-relaxed">
                        {dec.decision_text}
                      </p>
                    </div>

                    <div className="bg-[#F7F5F0] border border-[#E5E0D8] p-3.5 rounded-[6px]">
                      <span className="font-mono text-xs text-[#6F6B65] uppercase font-semibold block mb-1">
                        NEXT ACTION
                      </span>
                      <p className="text-xs text-[#191817] leading-relaxed">
                        {dec.next_step}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#6F6B65]">
                    Recorded in Nirman Project Memory
                  </span>
                  <Link
                    href={`/projects/${projectId}/evidence`}
                    className="text-xs font-medium text-[#B85C38] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Grounding Evidence</span>
                    <ArrowRight size={12} />
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
