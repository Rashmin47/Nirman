import {
  Project,
  Assumption,
  Experiment,
  EvidenceRecord,
  Theme,
  DecisionLog,
  IdeaAnalysisResult,
  EvidenceAnalysisResult,
  RiskLevel,
  AssumptionStatus,
} from '@nirman/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DashboardData {
  project: Project;
  assumptions: Assumption[];
  experiments: Experiment[];
  latest_evidence: EvidenceRecord[];
  themes: Theme[];
  latest_decision?: DecisionLog;
  top_uncertainty?: Assumption;
  total_evidence_count: number;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorDetail = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    return fetchJson<Project[]>('/api/projects');
  },

  async getProject(id: string): Promise<Project> {
    return fetchJson<Project>(`/api/projects/${id}`);
  },

  async createProject(name: string, idea_description: string): Promise<Project> {
    return fetchJson<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, idea_description }),
    });
  },

  async getDashboard(projectId: string): Promise<DashboardData> {
    return fetchJson<DashboardData>(`/api/projects/${projectId}/dashboard`);
  },

  // AI Idea Analysis
  async analyzeIdea(projectId: string): Promise<IdeaAnalysisResult> {
    return fetchJson<IdeaAnalysisResult>(`/api/projects/${projectId}/analyze`, {
      method: 'POST',
    });
  },

  // Assumptions
  async getAssumptions(projectId: string): Promise<Assumption[]> {
    return fetchJson<Assumption[]>(`/api/projects/${projectId}/assumptions`);
  },

  async createAssumption(projectId: string, data: {
    title: string;
    description: string;
    risk: RiskLevel;
    confidence: number;
    status: AssumptionStatus;
    why_it_matters?: string;
  }): Promise<Assumption> {
    return fetchJson<Assumption>(`/api/projects/${projectId}/assumptions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAssumption(assumptionId: string, data: Partial<Assumption>): Promise<Assumption> {
    return fetchJson<Assumption>(`/api/assumptions/${assumptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Experiments
  async getExperiments(projectId: string): Promise<Experiment[]> {
    return fetchJson<Experiment[]>(`/api/projects/${projectId}/experiments`);
  },

  async createExperiment(projectId: string, data: {
    assumption_id?: string;
    type: string;
    title: string;
    objective: string;
    questions: string[];
    success_criteria: string;
  }): Promise<Experiment> {
    return fetchJson<Experiment>(`/api/projects/${projectId}/experiments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generateExperiment(projectId: string, assumptionId?: string) {
    return fetchJson(`/api/projects/${projectId}/experiments/generate`, {
      method: 'POST',
      body: JSON.stringify({ assumption_id: assumptionId }),
    });
  },

  // Evidence
  async getEvidence(projectId: string): Promise<EvidenceRecord[]> {
    return fetchJson<EvidenceRecord[]>(`/api/projects/${projectId}/evidence`);
  },

  async addEvidence(projectId: string, data: {
    source_name: string;
    content: string;
    tags?: string[];
  }): Promise<EvidenceRecord> {
    return fetchJson<EvidenceRecord>(`/api/projects/${projectId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addBatchEvidence(projectId: string, records: Array<{ source_name: string; content: string; tags?: string[] }>) {
    return fetchJson(`/api/projects/${projectId}/evidence/batch`, {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  },

  // AI Evidence Analysis
  async analyzeEvidence(projectId: string): Promise<EvidenceAnalysisResult> {
    return fetchJson<EvidenceAnalysisResult>(`/api/projects/${projectId}/evidence/analyze`, {
      method: 'POST',
    });
  },

  // Decisions
  async getDecisions(projectId: string): Promise<DecisionLog[]> {
    return fetchJson<DecisionLog[]>(`/api/projects/${projectId}/decisions`);
  },

  // LangGraph Pipeline Run
  async runPipeline(projectId: string) {
    return fetchJson<{ status: string; action: string; logs: string[]; decision: any; recommendation: any }>(
      `/api/projects/${projectId}/pipeline/run`,
      { method: 'POST' }
    );
  },
};
