import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Database, GitBranch, FlaskConical, Target } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#191817] flex flex-col selection:bg-[#B85C38] selection:text-white">
      {/* Navigation */}
      <header className="border-b border-[#E5E0D8] bg-[#FFFFFF] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold tracking-tight text-lg text-[#191817]">
              NIRMAN
            </span>
            <span className="text-xs font-mono text-[#6F6B65] hidden sm:inline">
              / evidence-to-execution
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-[#6F6B65] hover:text-[#191817] transition-colors"
            >
              Demo Workspace
            </Link>
            <Link
              href="/login"
              className="text-xs font-medium text-[#191817] hover:text-[#B85C38] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/projects/new"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#B85C38] hover:bg-[#A04D2D] rounded-[6px] shadow-sm transition-colors"
            >
              Start Building
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-6 border-b border-[#E5E0D8]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-[#6F6B65]">From idea to something real.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#191817] leading-[1.1] mb-6">
            Turn ideas into clear decisions and actionable next steps.
          </h1>

          <p className="text-lg sm:text-xl text-[#6F6B65] max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Nirman challenges your assumptions, validates them with field evidence,
            and routes your team toward the smallest real version worth shipping.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/projects/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#B85C38] hover:bg-[#A04D2D] rounded-[6px] shadow-sm transition-colors"
            >
              <span>Start building</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-[#191817] bg-[#FFFFFF] border border-[#E5E0D8] hover:bg-[#F7F5F0] rounded-[6px] transition-colors"
            >
              <span>Explore live demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The Evidence Loop */}
      <section className="py-16 px-6 border-b border-[#E5E0D8] bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono uppercase text-[#B85C38] tracking-wider mb-2">
              THE WORKFLOW LOOP
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191817]">
              Don&apos;t optimize the plan. Optimize the direction.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'IDEA', desc: 'State your problem & proposed solution.', icon: Target },
              { step: '02', title: 'ASSUMPTIONS', desc: 'AI isolates what you are taking for granted.', icon: CheckCircle2 },
              { step: '03', title: 'EXPERIMENT', desc: 'Generate laser-focused interviews & tests.', icon: FlaskConical },
              { step: '04', title: 'EVIDENCE', desc: 'Ingest raw quotes, CSVs, and feedback.', icon: Database },
              { step: '05', title: 'DECISION', desc: 'Data updates confidence and next action.', icon: GitBranch },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-5 rounded-[8px] border border-[#E5E0D8] bg-[#F7F5F0] relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-[#B85C38] font-bold">{item.step}</span>
                      <Icon size={16} className="text-[#6F6B65]" />
                    </div>
                    <h3 className="font-mono font-bold text-sm text-[#191817] mb-1">{item.title}</h3>
                    <p className="text-xs text-[#6F6B65] leading-relaxed">{item.desc}</p>
                  </div>
                  {idx < 4 && (
                    <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-[#E5E0D8] z-10">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Decision Workspace Preview */}
      <section className="py-20 px-6 border-b border-[#E5E0D8]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-mono uppercase text-[#6F6B65] tracking-wider">
                DECISION WORKSPACE
              </p>
              <h2 className="text-xl font-bold text-[#191817] mt-1">
                The interface answers: &quot;What do we need to do next?&quot;
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-mono text-[#B85C38] hover:underline"
            >
              Open workspace →
            </Link>
          </div>

          {/* Realistic Dashboard Mockup */}
          <div className="rounded-[10px] border border-[#E5E0D8] bg-[#FFFFFF] shadow-sm overflow-hidden">
            {/* Window bar */}
            <div className="bg-[#292522] text-[#F7F5F0] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#A4483F]/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#A66A2C]/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#3F6B50]/80 inline-block" />
                <span className="ml-2 opacity-75">Nirman Decision Console — Student Freelance Platform</span>
              </div>
              <Badge variant="warning">STAGE: PIVOT</Badge>
            </div>

            {/* Workspace Content Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FFFFFF]">
              <div className="border border-[#E5E0D8] rounded-[6px] p-5 bg-[#F7F5F0]">
                <div className="text-[11px] font-mono text-[#6F6B65] uppercase tracking-wider mb-2">
                  TOP UNCERTAINTY
                </div>
                <h4 className="text-sm font-semibold text-[#191817] mb-2">
                  Can students prove their capability to clients?
                </h4>
                <div className="flex items-center justify-between text-xs font-mono text-[#6F6B65]">
                  <span>Confidence:</span>
                  <span className="font-bold text-[#A4483F]">22% (Low)</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E5E0D8] text-xs text-[#6F6B65]">
                  35 interviews analyzed. Portfolio trust is the primary bottleneck.
                </div>
              </div>

              <div className="border border-[#E5E0D8] rounded-[6px] p-5 bg-[#F7F5F0]">
                <div className="text-[11px] font-mono text-[#6F6B65] uppercase tracking-wider mb-2">
                  LATEST FIELD EVIDENCE
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#191817]">Portfolio credibility</span>
                    <span className="font-mono font-bold text-[#B85C38]">45.0%</span>
                  </div>
                  <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#B85C38] h-full" style={{ width: '45%' }} />
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-medium text-[#191817]">Payment / Escrow fear</span>
                    <span className="font-mono text-[#6F6B65]">22.5%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#191817]">Job discovery</span>
                    <span className="font-mono text-[#6F6B65]">17.5%</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#B85C38]/30 rounded-[6px] p-5 bg-[#B85C38]/5">
                <div className="text-[11px] font-mono text-[#B85C38] uppercase font-bold tracking-wider mb-2">
                  NIRMAN RECOMMENDS
                </div>
                <div className="text-xs font-mono font-bold text-[#A4483F] mb-1">
                  CHANGE DIRECTION
                </div>
                <p className="text-xs text-[#191817] leading-relaxed mb-3">
                  Don&apos;t build a marketplace job board yet. Pivot to a proof-of-skill profile and micro-escrow concept.
                </p>
                <Link
                  href="/projects/00000000-0000-0000-0000-000000000001/decisions"
                  className="text-xs font-mono font-medium text-[#B85C38] hover:underline"
                >
                  View Decision #01 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-6 bg-[#292522] text-[#F7F5F0]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Test before you build.
          </h2>
          <p className="text-sm text-[#E5E0D8]/80 mb-8 max-w-xl mx-auto leading-relaxed">
            Create your project in 30 seconds. Get an immediate assumption breakdown,
            uncertainty risk scoring, and a concrete experiment to validate.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/projects/new"
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#B85C38] hover:bg-[#A04D2D] rounded-[6px] shadow-sm transition-colors"
            >
              Create New Project
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 text-sm font-medium text-[#F7F5F0] border border-[#E5E0D8]/30 hover:bg-[#FFFFFF]/10 rounded-[6px] transition-colors"
            >
              View Decision Board
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E0D8] bg-[#FFFFFF] py-6 px-6 text-xs text-[#6F6B65]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-[#191817]">NIRMAN</span>
            <span>—</span>
            <span>From idea to something real.</span>
          </div>
          <div>Built for builders, creators, and product teams.</div>
        </div>
      </footer>
    </div>
  );
}
