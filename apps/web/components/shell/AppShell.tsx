'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckCircle2,
  FlaskConical,
  Database,
  GitBranch,
  Settings,
  FolderGit2,
  ChevronRight,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface AppShellProps {
  children: React.ReactNode;
  projectId?: string;
  projectName?: string;
  projectStage?: string;
}

export function AppShell({
  children,
  projectId = '00000000-0000-0000-0000-000000000001',
  projectName = 'Student Freelance Platform',
  projectStage = 'PIVOT',
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: 'Overview',
      href: `/dashboard`,
      icon: LayoutDashboard,
      active: pathname === '/dashboard' || pathname === `/projects/${projectId}`,
    },
    {
      name: 'Assumptions',
      href: `/projects/${projectId}/assumptions`,
      icon: CheckCircle2,
      active: pathname.includes('/assumptions'),
    },
    {
      name: 'Evidence',
      href: `/projects/${projectId}/evidence`,
      icon: Database,
      active: pathname.includes('/evidence'),
    },
    {
      name: 'Experiments',
      href: `/projects/${projectId}/experiments`,
      icon: FlaskConical,
      active: pathname.includes('/experiments'),
    },
    {
      name: 'Decisions',
      href: `/projects/${projectId}/decisions`,
      icon: GitBranch,
      active: pathname.includes('/decisions'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0]">
      {/* Top Header */}
      <header className="h-14 border-b border-[#E5E0D8] bg-[#FFFFFF] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#6F6B65] hover:text-[#191817] p-1"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono font-bold tracking-tight text-base text-[#191817]">
              NIRMAN
            </span>
          </Link>
          <span className="text-[#E5E0D8] hidden sm:inline">/</span>
          <Link
            href="/projects"
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#6F6B65] hover:text-[#191817] transition-colors"
          >
            <FolderGit2 size={13} />
            <span>Projects</span>
          </Link>
          {projectName && (
            <>
              <ChevronRight size={12} className="text-[#6F6B65]/40 hidden sm:inline" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#191817] truncate max-w-[180px] sm:max-w-[260px]">
                  {projectName}
                </span>
                <Badge variant="accent">{projectStage.toUpperCase()}</Badge>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#B85C38] hover:bg-[#A04D2D] rounded-[6px] shadow-sm transition-colors"
          >
            <span>+ New Project</span>
          </Link>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="w-56 border-r border-[#E5E0D8] bg-[#FFFFFF] flex-col justify-between hidden md:flex p-3 sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-mono uppercase text-[#6F6B65] tracking-wider">
              WORKSPACE
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-[6px] transition-colors ${
                    item.active
                      ? 'bg-[#B85C38]/10 text-[#B85C38] font-semibold'
                      : 'text-[#6F6B65] hover:text-[#191817] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[#E5E0D8] pt-2 space-y-1">
            <Link
              href="/projects"
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-[6px] transition-colors ${
                pathname === '/projects'
                  ? 'bg-[#B85C38]/10 text-[#B85C38]'
                  : 'text-[#6F6B65] hover:text-[#191817] hover:bg-[#F7F5F0]'
              }`}
            >
              <Compass size={15} />
              <span>All Projects</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-[6px] transition-colors ${
                pathname === '/settings'
                  ? 'bg-[#B85C38]/10 text-[#B85C38]'
                  : 'text-[#6F6B65] hover:text-[#191817] hover:bg-[#F7F5F0]'
              }`}
            >
              <Settings size={15} />
              <span>Settings</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden flex" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-64 bg-white h-full border-r border-[#E5E0D8] p-4 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                <div className="px-3 py-2 text-[11px] font-mono uppercase text-[#6F6B65] tracking-wider">
                  WORKSPACE
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-[6px] ${
                        item.active
                          ? 'bg-[#B85C38]/10 text-[#B85C38] font-semibold'
                          : 'text-[#6F6B65] hover:text-[#191817] hover:bg-[#F7F5F0]'
                      }`}
                    >
                      <Icon size={15} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="border-t border-[#E5E0D8] pt-2 space-y-1">
                <Link
                  href="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#6F6B65]"
                >
                  <Compass size={15} />
                  <span>All Projects</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#6F6B65]"
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
