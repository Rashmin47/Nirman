'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { IdeaAnalysisResult } from '@nirman/types';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IdeaAnalysisResult | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const handleCreateAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    try {
      setLoading(true);
      // Step 1: Create Project
      const project = await api.createProject(name.trim(), description.trim());
      setCreatedProjectId(project.id);

      // Step 2: Analyze Idea with AI
      const analysis = await api.analyzeIdea(project.id);
      setAnalysisResult(analysis);
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (createdProjectId) {
      router.push(`/projects/${createdProjectId}/assumptions`);
    }
  };

  return (
    <AppShell projectName={name || 'New Project'}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-[#6F6B65]">STEP 01</span>
            <span className="text-[#E5E0D8]">/</span>
            <span className="font-mono text-xs text-[#B85C38]">IDEA CAPTURE</span>
          </div>
          <h1 className="text-2xl font-bold text-[#191817] tracking-tight">Create New Project</h1>
          <p className="text-xs text-[#6F6B65] mt-1">
            Define your rough concept. Nirman will challenge it, identify what you are taking for granted, and recommend what to test first.
          </p>
        </div>

        {!analysisResult ? (
          <Card className="bg-[#FFFFFF]">
            <form onSubmit={handleCreateAndAnalyze} className="space-y-5">
              <Input
                label="PROJECT NAME"
                placeholder="e.g. Student Freelance Platform"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Textarea
                label="IDEA DESCRIPTION"
                rows={5}
                required
                placeholder="Describe what problem you are solving, for whom, and what you plan to build. Don't worry about making it sound like a polished pitch."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setName('Student Freelance Platform');
                    setDescription(
                      'An app that helps college students find freelance opportunities by connecting them with local and digital SMB clients.'
                    );
                  }}
                  className="text-xs font-mono text-[#6F6B65] hover:text-[#B85C38] underline"
                >
                  Fill with demo idea
                </button>

                <Button type="submit" variant="primary" isLoading={loading}>
                  <Sparkles size={14} />
                  <span>Analyze Idea with AI</span>
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          /* Step 2 Output Review */
          <div className="space-y-6">
            <div className="p-4 bg-[#3F6B50]/10 border border-[#3F6B50]/30 rounded-[8px] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#3F6B50]">
                <CheckCircle2 size={16} />
                <span>Structured extraction completed via Pydantic validation.</span>
              </div>
              <Button size="sm" variant="primary" onClick={handleProceed}>
                <span>Open Assumption Board</span>
                <ArrowRight size={14} />
              </Button>
            </div>

            <Card className="space-y-4">
              <div>
                <span className="font-mono text-xs uppercase text-[#6F6B65] block mb-1">
                  EXTRACTED PROBLEM STATEMENT
                </span>
                <p className="text-sm font-semibold text-[#191817] leading-relaxed">
                  {analysisResult.problem}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E5E0D8]">
                <div>
                  <span className="font-mono text-xs uppercase text-[#6F6B65] block mb-1.5">
                    TARGET AUDIENCES
                  </span>
                  <ul className="space-y-1 text-xs text-[#191817]">
                    {analysisResult.target_users.map((u, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-[#B85C38]">•</span> {u}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-mono text-xs uppercase text-[#6F6B65] block mb-1.5">
                    RECOMMENDED FIRST STEP
                  </span>
                  <p className="text-xs text-[#191817] leading-relaxed font-medium">
                    {analysisResult.recommended_next_action}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] mb-4">
                <span className="font-mono text-xs uppercase text-[#6F6B65]">
                  EXTRACTED ASSUMPTIONS ({analysisResult.assumptions.length})
                </span>
                <Badge variant="accent">UNPROVEN BELIEFS</Badge>
              </div>

              <div className="space-y-3">
                {analysisResult.assumptions.map((a, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#F7F5F0] rounded-[6px] border border-[#E5E0D8] text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className="font-semibold text-[#191817]">{a.title}</span>
                      <Badge variant={a.risk === 'high' ? 'danger' : 'neutral'}>
                        {a.risk.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <p className="text-[#6F6B65] mb-2">{a.description}</p>
                    {a.why_it_matters && (
                      <p className="text-[11px] text-[#191817]/80 italic">
                        Why it matters: {a.why_it_matters}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E0D8] flex justify-end">
                <Button variant="primary" onClick={handleProceed}>
                  <span>Continue to Assumption Board</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
