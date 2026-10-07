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
import { EvidenceRecord, Project, EvidenceAnalysisResult } from '@nirman/types';
import {
  Database,
  Plus,
  UploadCloud,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Layers,
  FileText,
} from 'lucide-react';

export default function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EvidenceAnalysisResult | null>(null);

  // Input states
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'csv'>('text');
  const [sourceName, setSourceName] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [csvRawText, setCsvRawText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, evList] = await Promise.all([
        api.getProject(projectId),
        api.getEvidence(projectId),
      ]);
      setProject(p);
      setEvidenceList(evList);
    } catch (err) {
      console.error('Error fetching evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleAddTextEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
      await api.addEvidence(projectId, {
        source_name: sourceName.trim() || 'Participant',
        content: content.trim(),
        tags,
      });
      setSourceName('');
      setContent('');
      setTagInput('');
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      alert(`Error adding evidence: ${err.message}`);
    }
  };

  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvRawText.trim()) return;

    // Parse simple CSV rows
    const lines = csvRawText.trim().split('\n');
    const records: Array<{ source_name: string; content: string; tags: string[] }> = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith('name,') || line.toLowerCase().startsWith('source,')) {
        continue; // header
      }
      const parts = line.split(',');
      if (parts.length >= 2) {
        const name = parts[0].replace(/"/g, '').trim();
        const text = parts.slice(1).join(',').replace(/"/g, '').trim();
        if (text) {
          records.push({ source_name: name || 'Participant', content: text, tags: ['csv_upload'] });
        }
      } else if (line.trim()) {
        records.push({ source_name: 'Interviewee', content: line.trim(), tags: ['pasted_feedback'] });
      }
    }

    if (records.length === 0) {
      alert('Could not parse any valid records. Format: Name,Response');
      return;
    }

    try {
      await api.addBatchEvidence(projectId, records);
      setCsvRawText('');
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      alert(`Error uploading batch: ${err.message}`);
    }
  };

  const handleAnalyzeEvidence = async () => {
    try {
      setAnalyzing(true);
      const res = await api.analyzeEvidence(projectId);
      setAnalysisResult(res);
      await loadData();
    } catch (err: any) {
      alert(`Analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AppShell
      projectId={projectId}
      projectName={project?.name}
      projectStage={project?.stage}
    >
      <div className="space-y-6">
        {/* Header with CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#191817] tracking-tight">Field Evidence Repository</h1>
              <Badge variant="neutral">{evidenceList.length} RECORDS</Badge>
            </div>
            <p className="text-xs text-[#6F6B65] mt-0.5">
              Empirical statements collected from interviews, surveys, and tests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAnalyzeEvidence}
              isLoading={analyzing}
              disabled={evidenceList.length === 0}
            >
              <Sparkles size={14} />
              <span>Analyze Evidence with AI</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(!showAddModal)}
            >
              <Plus size={14} />
              <span>{showAddModal ? 'Close' : 'Add Evidence'}</span>
            </Button>
          </div>
        </div>

        {/* Input Form Drawer */}
        {showAddModal && (
          <Card className="bg-[#FFFFFF] border-[#B85C38]/40">
            <div className="flex items-center gap-3 border-b border-[#E5E0D8] pb-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`text-xs font-mono font-bold uppercase pb-1 border-b-2 transition-colors ${
                  activeTab === 'text'
                    ? 'border-[#B85C38] text-[#B85C38]'
                    : 'border-transparent text-[#6F6B65]'
                }`}
              >
                A. Paste Single Interview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('csv')}
                className={`text-xs font-mono font-bold uppercase pb-1 border-b-2 transition-colors ${
                  activeTab === 'csv'
                    ? 'border-[#B85C38] text-[#B85C38]'
                    : 'border-transparent text-[#6F6B65]'
                }`}
              >
                B. CSV / Batch Rows
              </button>
            </div>

            {activeTab === 'text' ? (
              <form onSubmit={handleAddTextEvidence} className="space-y-4">
                <Input
                  label="INTERVIEWEE / SOURCE"
                  placeholder="e.g. Jordan K. (Freelance Junior Dev)"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                />
                <Textarea
                  label="EXACT QUOTE / RESPONSE"
                  placeholder="Paste direct words from participant..."
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Input
                  label="TAGS (comma-separated)"
                  placeholder="e.g. credibility, escrow, portfolio"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Log Record
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCsvSubmit} className="space-y-4">
                <Textarea
                  label="CSV DATA (name,response)"
                  rows={6}
                  placeholder={`name,response\nUser 1,"I don't know how to prove my experience..."\nUser 2,"Finding clients is difficult..."`}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-[#6F6B65]">
                    Supports standard comma-separated lines.
                  </span>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Upload Batch Records
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        )}

        {/* AI Analysis Output Section */}
        {analysisResult && (
          <div className="space-y-4 border border-[#B85C38] rounded-[8px] bg-[#FFFFFF] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#B85C38] uppercase">
                  AI EVIDENCE SYNTHESIS COMPLETE
                </span>
                <Badge variant={analysisResult.recommendation.action === 'CHANGE_DIRECTION' ? 'danger' : 'accent'}>
                  ROUTING: {analysisResult.recommendation.action}
                </Badge>
              </div>
              <Link href={`/projects/${projectId}/decisions`}>
                <Button size="sm" variant="outline">
                  <span>View Decision Log</span>
                  <ArrowRight size={13} />
                </Button>
              </Link>
            </div>

            <p className="text-xs text-[#191817] leading-relaxed font-medium">
              {analysisResult.summary_findings}
            </p>

            {/* Themes Grid */}
            <div className="pt-2">
              <span className="font-mono text-xs text-[#6F6B65] uppercase block mb-3">
                IDENTIFIED RECURRING THEMES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {analysisResult.themes.map((th) => (
                  <div key={th.theme} className="p-3 bg-[#F7F5F0] rounded-[6px] border border-[#E5E0D8]">
                    <div className="flex justify-between items-start mb-1 text-xs">
                      <span className="font-semibold text-[#191817]">{th.theme}</span>
                      <span className="font-mono text-[#B85C38] font-bold">{th.percentage.toFixed(0)}%</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#6F6B65]">{th.count} mentions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumption Updates Table */}
            {analysisResult.assumption_updates.length > 0 && (
              <div className="pt-3 border-t border-[#E5E0D8]">
                <span className="font-mono text-xs text-[#6F6B65] uppercase block mb-2">
                  CONFIDENCE ADJUSTMENTS
                </span>
                <div className="space-y-2">
                  {analysisResult.assumption_updates.map((up) => (
                    <div
                      key={up.assumption_id}
                      className="p-3 bg-[#F7F5F0] rounded-[6px] border border-[#E5E0D8] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#191817]">{up.title || 'Assumption'}</span>
                          <Badge variant={up.status === 'CONTRADICTED' ? 'danger' : up.status === 'SUPPORTED' ? 'success' : 'neutral'}>
                            {up.status}
                          </Badge>
                        </div>
                        <p className="text-[#6F6B65] text-[11px]">{up.reason}</p>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                        <span className="text-[#6F6B65]">{Math.round(up.previous_confidence * 100)}%</span>
                        <span>→</span>
                        <span className={`font-bold ${up.new_confidence < up.previous_confidence ? 'text-[#A4483F]' : 'text-[#3F6B50]'}`}>
                          {Math.round(up.new_confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Evidence Records List */}
        {loading ? (
          <div className="text-center py-12 text-xs font-mono text-[#6F6B65]">
            Loading evidence records...
          </div>
        ) : evidenceList.length === 0 ? (
          <div className="border border-dashed border-[#E5E0D8] rounded-[8px] p-12 text-center bg-white">
            <Database className="mx-auto text-[#6F6B65] mb-2" size={32} />
            <h3 className="text-sm font-semibold text-[#191817]">No evidence records yet</h3>
            <p className="text-xs text-[#6F6B65] mt-1 mb-4">
              Paste customer interview feedback or upload CSV responses.
            </p>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              Add First Evidence
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {evidenceList.map((ev, index) => (
              <div
                key={ev.id}
                className="p-4 bg-[#FFFFFF] rounded-[6px] border border-[#E5E0D8] text-xs flex flex-col justify-between hover:border-[#6F6B65] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#6F6B65] font-bold">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-semibold text-[#191817]">{ev.source_name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#6F6B65]">
                    {new Date(ev.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-[#191817] leading-relaxed mb-3 font-normal">
                  &ldquo;{ev.content}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E5E0D8]/60">
                  {ev.tags?.map((t) => (
                    <Badge key={t} variant="neutral">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
