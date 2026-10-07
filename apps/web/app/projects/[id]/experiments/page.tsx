'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/lib/api';
import { Experiment, Project, Assumption } from '@nirman/types';
import {
  FlaskConical,
  Plus,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Database,
} from 'lucide-react';

export default function ExperimentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [assumptions, setAssumptions] = useState<Assumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [criteria, setCriteria] = useState('');
  const [questionsText, setQuestionsText] = useState('');
  const [selectedAssumptionId, setSelectedAssumptionId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, expList, aList] = await Promise.all([
        api.getProject(projectId),
        api.getExperiments(projectId),
        api.getAssumptions(projectId),
      ]);
      setProject(p);
      setExperiments(expList);
      setAssumptions(aList);
      if (aList.length > 0) setSelectedAssumptionId(aList[0].id);
    } catch (err) {
      console.error('Error fetching experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleAiGenerate = async () => {
    try {
      setGenerating(true);
      const res: any = await api.generateExperiment(projectId, selectedAssumptionId || undefined);
      setTitle(res.title || 'Validation Interview Experiment');
      setObjective(res.objective || '');
      setCriteria(res.success_criteria || '');
      setQuestionsText((res.questions || []).join('\n'));
      setShowForm(true);
    } catch (err: any) {
      alert(`AI generation error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !objective.trim()) return;

    const questions = questionsText
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean);

    try {
      await api.createExperiment(projectId, {
        assumption_id: selectedAssumptionId || undefined,
        type: 'interview',
        title: title.trim(),
        objective: objective.trim(),
        questions,
        success_criteria: criteria.trim() || 'At least 5 respondents confirm the core premise.',
      });
      setTitle('');
      setObjective('');
      setCriteria('');
      setQuestionsText('');
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      alert(`Error saving experiment: ${err.message}`);
    }
  };

  return (
    <AppShell
      projectId={projectId}
      projectName={project?.name}
      projectStage={project?.stage}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#191817] tracking-tight">Validation Experiments</h1>
            <p className="text-xs text-[#6F6B65] mt-0.5">
              Structured tests designed to produce factual evidence before building features.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAiGenerate}
              isLoading={generating}
            >
              <Sparkles size={14} />
              <span>AI Generate Test</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={14} />
              <span>{showForm ? 'Cancel' : 'New Experiment'}</span>
            </Button>
          </div>
        </div>

        {/* Create / Generate Form */}
        {showForm && (
          <Card className="bg-[#FFFFFF] border-[#B85C38]/40">
            <form onSubmit={handleCreateExperiment} className="space-y-4">
              <div className="text-xs font-mono font-bold text-[#191817] uppercase">
                Define Validation Experiment
              </div>

              {assumptions.length > 0 && (
                <div>
                  <label className="block text-xs font-mono font-medium text-[#6F6B65] uppercase tracking-wider mb-1.5">
                    TARGET ASSUMPTION
                  </label>
                  <select
                    value={selectedAssumptionId}
                    onChange={(e) => setSelectedAssumptionId(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-[6px] border border-[#E5E0D8] bg-[#FFFFFF] text-[#191817]"
                  >
                    {assumptions.map((a) => (
                      <option key={a.id} value={a.id}>
                        [{a.risk.toUpperCase()}] {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Input
                label="EXPERIMENT TITLE"
                placeholder="e.g. Discovery Interview: Finding Jobs vs. Proving Skill"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Textarea
                label="CORE OBJECTIVE"
                placeholder="What specific truth or behavior does this test seek to prove or disprove?"
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />

              <Textarea
                label="INTERVIEW QUESTIONS (One per line)"
                rows={4}
                placeholder="1. How do you currently find freelance work?&#10;2. What happens when you pitch a client?&#10;3. What was the biggest obstacle in your last gig?"
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
              />

              <Input
                label="SUCCESS CRITERIA"
                placeholder="e.g. At least 40% of respondents identify portfolio credibility as a major obstacle."
                required
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Experiment
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Experiments List */}
        {loading ? (
          <div className="text-center py-12 text-xs font-mono text-[#6F6B65]">
            Loading experiments...
          </div>
        ) : experiments.length === 0 ? (
          <div className="border border-dashed border-[#E5E0D8] rounded-[8px] p-12 text-center bg-white">
            <FlaskConical className="mx-auto text-[#6F6B65] mb-2" size={32} />
            <h3 className="text-sm font-semibold text-[#191817]">No experiments created yet</h3>
            <p className="text-xs text-[#6F6B65] mt-1 mb-4">
              Design a lean interview experiment to validate your highest-risk assumption.
            </p>
            <Button variant="primary" size="sm" onClick={handleAiGenerate}>
              Generate Interview Experiment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {experiments.map((exp, idx) => (
              <Card key={exp.id} className="space-y-4 border-[#E5E0D8]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#B85C38]">
                      EXPERIMENT #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <Badge variant={exp.status === 'completed' ? 'success' : 'neutral'}>
                      {exp.status.toUpperCase()}
                    </Badge>
                    <Badge variant="neutral">{exp.type.toUpperCase()}</Badge>
                  </div>
                  <Link href={`/projects/${projectId}/evidence`}>
                    <Button variant="outline" size="sm">
                      <Database size={13} />
                      <span>Log Evidence Records →</span>
                    </Button>
                  </Link>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#191817] mb-1">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-[#6F6B65] leading-relaxed">
                    <strong className="text-[#191817]">Goal: </strong>
                    {exp.objective}
                  </p>
                </div>

                {exp.questions && exp.questions.length > 0 && (
                  <div className="p-4 bg-[#F7F5F0] rounded-[6px] border border-[#E5E0D8]">
                    <span className="font-mono text-xs uppercase text-[#191817] font-semibold block mb-2">
                      Validation Questions ({exp.questions.length})
                    </span>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#191817]">
                      {exp.questions.map((q, qIdx) => (
                        <li key={qIdx} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-[#E5E0D8]">
                  <div className="text-[#6F6B65]">
                    <strong className="text-[#191817]">Success Criteria: </strong>
                    {exp.success_criteria}
                  </div>
                  <span className="font-mono text-[11px] text-[#6F6B65]">
                    Created {new Date(exp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
