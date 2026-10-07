import React from 'react';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 mb-6">
      <div>
        <h2 className="text-base font-semibold text-[#191817] tracking-tight">{title}</h2>
        {description && <p className="text-xs text-[#6F6B65] mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatusIndicator({ status }: { status: 'UNKNOWN' | 'TESTING' | 'SUPPORTED' | 'CONTRADICTED' }) {
  const styles = {
    UNKNOWN: 'bg-[#6F6B65]/40 text-[#6F6B65]',
    TESTING: 'bg-[#A66A2C]/20 text-[#A66A2C]',
    SUPPORTED: 'bg-[#3F6B50]/20 text-[#3F6B50]',
    CONTRADICTED: 'bg-[#A4483F]/20 text-[#A4483F]',
  };

  const dotStyles = {
    UNKNOWN: 'bg-[#6F6B65]',
    TESTING: 'bg-[#A66A2C]',
    SUPPORTED: 'bg-[#3F6B50]',
    CONTRADICTED: 'bg-[#A4483F]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-mono uppercase tracking-wider ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} />
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[8px] border border-dashed border-[#E5E0D8] p-8 text-center bg-[#FFFFFF]/50">
      <h3 className="text-sm font-semibold text-[#191817]">{title}</h3>
      <p className="text-xs text-[#6F6B65] mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
