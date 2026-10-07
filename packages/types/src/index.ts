export type RiskLevel = 'low' | 'medium' | 'high';

export type AssumptionStatus = 'UNKNOWN' | 'TESTING' | 'SUPPORTED' | 'CONTRADICTED';

export type ProjectStage = 'discovery' | 'validation' | 'pivot' | 'mvp' | 'build';

export type ExperimentType = 'interview' | 'survey' | 'landing_page' | 'prototype_test' | 'manual_test';

export type DecisionAction = 'PROCEED_TO_MVP' | 'VALIDATE_FIRST' | 'CHANGE_DIRECTION' | 'DONT_BUILD_YET';

export interface Project {
  id: string;
  name: string;
  idea_description: string;
  stage: ProjectStage;
  target_users?: string[];
  problem?: string;
  proposed_solution?: string;
  unknowns?: string[];
  recommended_next_action?: string;
  created_at: string;
  updated_at: string;
}

export interface Assumption {
  id: string;
  project_id: string;
  title: string;
  description: string;
  risk: RiskLevel;
  confidence: number; // 0.0 to 1.0
  status: AssumptionStatus;
  evidence_count: number;
  why_it_matters?: string;
  created_at: string;
  updated_at: string;
}

export interface Experiment {
  id: string;
  project_id: string;
  assumption_id?: string;
  type: ExperimentType;
  title: string;
  objective: string;
  questions: string[];
  success_criteria: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface EvidenceRecord {
  id: string;
  project_id: string;
  experiment_id?: string;
  source_name: string;
  content: string;
  tags?: string[];
  supports_assumptions?: string[];
  contradicts_assumptions?: string[];
  created_at: string;
}

export interface Theme {
  id: string;
  project_id: string;
  theme: string;
  count: number;
  percentage: number;
  sample_quotes?: string[];
}

export interface DecisionLog {
  id: string;
  project_id: string;
  decision_number: number;
  action: DecisionAction;
  original_assumption?: string;
  evidence_summary: string;
  key_finding: string;
  decision_text: string;
  next_step: string;
  created_at: string;
}

export interface IdeaAnalysisResult {
  problem: string;
  target_users: string[];
  proposed_solution: string;
  assumptions: Array<{
    title: string;
    description: string;
    risk: RiskLevel;
    confidence: number;
    why_it_matters?: string;
  }>;
  unknowns: string[];
  recommended_next_action: string;
  project_stage: ProjectStage;
  recommended_experiment?: {
    type: ExperimentType;
    title: string;
    objective: string;
    questions: string[];
    success_criteria: string;
  };
}

export interface EvidenceAnalysisResult {
  themes: Theme[];
  assumption_updates: Array<{
    assumption_id: string;
    title?: string;
    previous_confidence: number;
    new_confidence: number;
    status: AssumptionStatus;
    reason: string;
  }>;
  recommendation: {
    action: DecisionAction;
    reason: string;
    suggested_next_step: string;
  };
  summary_findings?: string;
}
