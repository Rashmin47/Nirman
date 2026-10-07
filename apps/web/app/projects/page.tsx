'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Project } from '@nirman/types';
import { ArrowRight, FolderGit2, Plus } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getProjects();
        setProjects(list);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#191817] tracking-tight">All Projects</h1>
            <p className="text-xs text-[#6F6B65] mt-0.5">
              Select a project workspace to inspect assumptions and field evidence.
            </p>
          </div>
          <Link href="/projects/new">
            <Button variant="primary" size="sm">
              <Plus size={14} />
              <span>New Project</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs font-mono text-[#6F6B65]">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-dashed border-[#E5E0D8] rounded-[8px] p-12 text-center bg-white">
            <FolderGit2 className="mx-auto text-[#6F6B65] mb-3" size={32} />
            <h3 className="text-sm font-semibold text-[#191817]">No projects yet</h3>
            <p className="text-xs text-[#6F6B65] mt-1 mb-4">
              Create your first project idea to break it down into testable assumptions.
            </p>
            <Link href="/projects/new">
              <Button variant="primary" size="sm">
                Create First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Card key={p.id} className="flex flex-col justify-between hover:border-[#B85C38] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-semibold text-[#191817] truncate max-w-[240px]">
                      {p.name}
                    </span>
                    <Badge variant={p.stage === 'pivot' ? 'warning' : 'accent'}>
                      {p.stage.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6F6B65] line-clamp-3 mb-4 leading-relaxed">
                    {p.problem || p.idea_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#6F6B65]">
                    Updated {new Date(p.updated_at).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/projects/${p.id}/assumptions`}
                    className="text-xs font-medium text-[#B85C38] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Console</span>
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
