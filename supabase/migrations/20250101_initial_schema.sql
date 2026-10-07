-- Nirman Supabase / PostgreSQL Schema with pgvector
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name TEXT NOT NULL,
    idea_description TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'validation',
    problem TEXT,
    target_users JSONB DEFAULT '[]'::jsonb,
    proposed_solution TEXT,
    unknowns JSONB DEFAULT '[]'::jsonb,
    recommended_next_action TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Assumptions table
CREATE TABLE IF NOT EXISTS assumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    risk TEXT NOT NULL DEFAULT 'medium' CHECK (risk IN ('low', 'medium', 'high')),
    confidence FLOAT NOT NULL DEFAULT 0.5 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    status TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (status IN ('UNKNOWN', 'TESTING', 'SUPPORTED', 'CONTRADICTED')),
    evidence_count INTEGER NOT NULL DEFAULT 0,
    why_it_matters TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assumptions_project ON assumptions(project_id);

-- 3. Experiments table
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assumption_id UUID REFERENCES assumptions(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'interview' CHECK (type IN ('interview', 'survey', 'landing_page', 'prototype_test', 'manual_test')),
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    success_criteria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_experiments_project ON experiments(project_id);

-- 4. Evidence table (with optional vector embeddings)
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL,
    source_name TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(768),
    tags JSONB DEFAULT '[]'::jsonb,
    supports_assumptions JSONB DEFAULT '[]'::jsonb,
    contradicts_assumptions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_evidence_project ON evidence(project_id);

-- 5. Evidence Themes
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    theme TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    percentage FLOAT NOT NULL DEFAULT 0.0,
    sample_quotes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_themes_project ON themes(project_id);

-- 6. Decision Log
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    decision_number INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('PROCEED_TO_MVP', 'VALIDATE_FIRST', 'CHANGE_DIRECTION', 'DONT_BUILD_YET')),
    original_assumption TEXT,
    evidence_summary TEXT NOT NULL,
    key_finding TEXT NOT NULL,
    decision_text TEXT NOT NULL,
    next_step TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id);

-- Row Level Security (RLS) setup
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for development / authenticated users
CREATE POLICY "Allow access to projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow access to assumptions" ON assumptions FOR ALL USING (true);
CREATE POLICY "Allow access to experiments" ON experiments FOR ALL USING (true);
CREATE POLICY "Allow access to evidence" ON evidence FOR ALL USING (true);
CREATE POLICY "Allow access to themes" ON themes FOR ALL USING (true);
CREATE POLICY "Allow access to decisions" ON decisions FOR ALL USING (true);
