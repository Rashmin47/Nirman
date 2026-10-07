'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api, DashboardData } from '@/lib/api';
import {
  AlertTriangle,
  ArrowRight,
  Sparkles,
  GitBranch,
  Play,
  RotateCw,
  Clock,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch list of projects first
      const projects = await api.getProjects();
      if (projects.length > 0) {
        const dashboard = await api.getDashboard(projects[0].id);
        setData(dashboard);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunPipeline = async () => {
    if (!data?.project.id) return;
    try {
      setRunningPipeline(true);
      const res = await api.runPipeline(data.project.id);
      setPipelineLogs(res.logs);
      await loadData();
    } catch (err: any) {
      alert(`Pipeline execution error: ${err.message}`);
    } finally {
      setRunningPipeline(false);
    }
  };

  if (loading && !data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#B85C38] border-r-transparent" />
            <p className="text-xs font-mono text-[#6F6B65]">Loading decision workspace...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const project = data?.project;
  const topUncertainty = data?.top_uncertainty;
  const latestDecision = data?.latest_decision;
  const themes = data?.themes || [];
  const totalEvidence = data?.total_evidence_count || 0;

  return (
    <AppShell
      projectId={project?.id}
      projectName={project?.name}
      projectStage={project?.stage}
    >
      <div className="space-y-8">
        {/* Header Alert / Direction Statement */}
        <div className="border border-[#E5E0D8] bg-[#FFFFFF] rounded-[8px] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6F6B65]">
                  PROJECT CONSOLE
                </span>
                <span className="text-[#E5E0D8]">/</span>
                <Badge variant={project?.stage === 'pivot' ? 'warning' : 'accent'}>
                  {project?.stage?.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-[#191817] tracking-tight">
                {project?.name || 'Student Freelance Platform'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
              >
                <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunPipeline}
                isLoading={runningPipeline}
              >
                <Play size={14} />
                <span>Run AI Pipeline</span>
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-mono text-[#6F6B65] uppercase block mb-1">PROBLEM STATEMENT</span>
              <p className="text-[#191817] leading-relaxed">
                {project?.problem || project?.idea_description}
              </p>
            </div>
            <div>
              <span className="font-mono text-[#6F6B65] uppercase block mb-1">RECOMMENDED DIRECTION</span>
              <p className="text-[#B85C38] font-medium leading-relaxed">
                {project?.recommended_next_action || 'Validate high-risk assumptions with real user evidence.'}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Decision Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Top Uncertainty */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] mb-4">
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#A4483F] uppercase tracking-wider font-semibold">
                  <AlertTriangle size={14} />
                  <span>TOP UNCERTAINTY</span>
                </div>
                {topUncertainty && (
                  <Badge variant="danger">
                    {Math.round((topUncertainty.confidence || 0) * 100)}% CONFIDENCE
                  </Badge>
                )}
              </div>

              {topUncertainty ? (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-[#191817] leading-snug">
                    {topUncertainty.title}
                  </h3>
                  <p className="text-xs text-[#6F6B65] leading-relaxed">
                    {topUncertainty.description}
                  </p>
                  {topUncertainty.why_it_matters && (
                    <div className="bg-[#F7F5F0] border border-[#E5E0D8] p-3 rounded-[6px] text-xs">
                      <span className="font-mono font-medium text-[#191817] block mb-0.5">Why it matters:</span>
                      <span className="text-[#6F6B65]">{topUncertainty.why_it_matters}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#6F6B65]">No high-risk assumptions tracked yet.</p>
              )}
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E0D8] flex items-center justify-between">
              <span className="text-xs font-mono text-[#6F6B65]">
                {data?.assumptions?.length || 0} assumptions tracked
              </span>
              <Link
                href={`/projects/${project?.id}/assumptions`}
                className="text-xs font-medium text-[#B85C38] hover:underline inline-flex items-center gap-1"
              >
                <span>Assumption Board</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>

          {/* Column 2: Latest Evidence Aggregation */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] mb-4">
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#6F6B65] uppercase tracking-wider font-semibold">
                  <Layers size={14} />
                  <span>LATEST FIELD EVIDENCE</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#191817]">
                  {totalEvidence} RECORDS
                </span>
              </div>

              {themes.length > 0 ? (
                <div className="space-y-3.5">
                  {themes.slice(0, 4).map((th) => (
                    <div key={th.theme} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#191817] font-medium truncate max-w-[200px]">
                          {th.theme}
                        </span>
                        <span className="font-mono font-semibold text-[#B85C38]">
                          {th.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#B85C38] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, th.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6F6B65]">No synthesized evidence themes yet.</p>
              )}
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E0D8] flex items-center justify-between">
              <span className="text-xs font-mono text-[#6F6B65]">
                {themes.length} recurring themes
              </span>
              <Link
                href={`/projects/${project?.id}/evidence`}
                className="text-xs font-medium text-[#B85C38] hover:underline inline-flex items-center gap-1"
              >
                <span>Manage Evidence</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>

          {/* Column 3: Nirman Recommends / Latest Decision */}
          <Card className="flex flex-col justify-between border-[#B85C38]/40 bg-[#FFFFFF]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] mb-4">
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#B85C38] uppercase tracking-wider font-bold">
                  <GitBranch size={14} />
                  <span>NIRMAN RECOMMENDS</span>
                </div>
                {latestDecision && (
                  <Badge variant={latestDecision.action === 'CHANGE_DIRECTION' ? 'danger' : 'accent'}>
                    DECISION #{latestDecision.decision_number}
                  </Badge>
                )}
              </div>

              {latestDecision ? (
                <div className="space-y-3">
                  <div className="text-sm font-mono font-bold text-[#A4483F]">
                    {latestDecision.action}
                  </div>
                  <p className="text-xs text-[#191817] font-medium leading-relaxed">
                    {latestDecision.decision_text}
                  </p>
                  <div className="bg-[#F7F5F0] p-3 rounded-[6px] border border-[#E5E0D8] text-xs">
                    <span className="font-mono font-bold text-[#6F6B65] uppercase block mb-1">
                      NEXT STEP:
                    </span>
                    <p className="text-[#191817]">{latestDecision.next_step}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-[#191817] leading-relaxed">
                    Nirman recommends running your validation experiment to challenge the top uncertainty.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E0D8] flex items-center justify-between">
              <span className="text-xs font-mono text-[#6F6B65]">Grounding in data</span>
              <Link
                href={`/projects/${project?.id}/decisions`}
                className="text-xs font-medium text-[#B85C38] hover:underline inline-flex items-center gap-1"
              >
                <span>View Decision Log</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        </div>

        {/* Live LangGraph Pipeline Execution Logs Drawer / Card */}
        {pipelineLogs && (
          <div className="rounded-[8px] border border-[#E5E0D8] bg-[#292522] text-[#F7F5F0] p-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#3F6B50] animate-pulse" />
                <span className="font-bold text-white">LangGraph Autonomous Pipeline Trajectory</span>
              </div>
              <button
                onClick={() => setPipelineLogs(null)}
                className="text-[#6F6B65] hover:text-white"
              >
                Dismiss ✕
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {pipelineLogs.map((log, index) => (
                <div key={index} className="text-[#E5E0D8]/90 flex items-start gap-2">
                  <span className="text-[#B85C38] select-none">[{index + 1}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Evidence Snippets */}
        <div className="border border-[#E5E0D8] rounded-[8px] bg-[#FFFFFF] p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8] mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#191817]">Recent Grounding Quotes</h3>
              <p className="text-xs text-[#6F6B65]">Field interview statements powering the current recommendation.</p>
            </div>
            <Link
              href={`/projects/${project?.id}/evidence`}
              className="text-xs font-mono text-[#B85C38] hover:underline"
            >
              + Add Evidence
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data?.latest_evidence || []).slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-[6px] border border-[#E5E0D8] bg-[#F7F5F0] flex flex-col justify-between"
              >
                <p className="text-xs text-[#191817] italic leading-relaxed mb-3">
                  &ldquo;{ev.content}&rdquo;
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#6F6B65]">
                  <span>{ev.source_name}</span>
                  {ev.tags && ev.tags.length > 0 && (
                    <Badge variant="neutral">{ev.tags[0]}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
