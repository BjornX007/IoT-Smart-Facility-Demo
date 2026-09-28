'use client';

import { Report } from '@/types';

const URGENCY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'CRITICAL', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
  high:     { label: 'HIGH',     color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium:   { label: 'MED',      color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  low:      { label: 'LOW',      color: 'text-stone-600',  bg: 'bg-stone-50',  border: 'border-stone-200' },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending',     color: 'text-stone-500' },
  inprogress: { label: 'In Progress', color: 'text-blue-600' },
  resolved:   { label: 'Resolved',    color: 'text-emerald-600' },
  dismissed:  { label: 'Dismissed',   color: 'text-stone-400' },
};

const TYPE_ICON: Record<string, string> = {
  spill: '💧', smell: '💨', broken: '🔧', bin_overflow: '🗑', restroom: '🚻', other: '⚠',
};

interface TaskQueueProps {
  reports: Report[];
  workers?: never; // was mistakenly passed before — not needed here
  onMarkResolved?: (reportId: string, zoneId: string) => void;
}

export default function TaskQueue({ reports, onMarkResolved }: TaskQueueProps) {
  const sorted = [...reports].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
  });

  return (
    <div className="space-y-2">
      {sorted.length === 0 && (
        <p className="text-xs text-stone-400 py-4 text-center">No active reports</p>
      )}
      {sorted.map(report => {
        const um = URGENCY_META[report.urgency] ?? URGENCY_META.low;
        const sm = STATUS_META[report.status] ?? STATUS_META.pending;
        const icon = TYPE_ICON[report.type] ?? '⚠';

        return (
          <div key={report.id} className="p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="text-lg mt-0.5">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold text-stone-700 truncate">{report.zoneName}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${um.bg} ${um.color} border ${um.border}`}>
                    {um.label}
                  </span>
                  <span className={`text-[10px] font-medium ${sm.color}`}>{sm.label}</span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-1">{report.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-stone-400 font-mono">{report.trackingCode}</span>
                  {report.assignedRobotId && (
                    <span className="text-[10px] text-indigo-500">🤖 {report.assignedRobotId}</span>
                  )}
                </div>
              </div>
              {report.status !== 'resolved' && onMarkResolved && (
                <button
                  onClick={() => onMarkResolved(report.id, report.zoneId)}
                  className="text-[10px] font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-all shrink-0"
                >
                  ✓ Done
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}