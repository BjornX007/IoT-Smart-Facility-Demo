'use client';

import { Worker } from '@/types';

const STATUS_META: Record<string, { dot: string; label: string; color: string }> = {
  active:  { dot: 'bg-emerald-500', label: 'Active',  color: 'text-emerald-600' },
  transit: { dot: 'bg-blue-500',    label: 'Transit', color: 'text-blue-600' },
  break:   { dot: 'bg-amber-400',   label: 'Break',   color: 'text-amber-600' },
  idle:    { dot: 'bg-stone-400',   label: 'Idle',    color: 'text-stone-500' },
};

export default function WorkerStatus({ workers }: { workers: Worker[] }) {
  return (
    <div className="space-y-2">
      {workers.map(w => {
        const meta = STATUS_META[w.status] || STATUS_META.idle;
        const effColor = w.efficiency >= 90 ? 'text-emerald-600' : w.efficiency >= 75 ? 'text-amber-600' : 'text-red-500';

        return (
          <div key={w.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100">
            <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-sm font-bold text-stone-600 font-['Sora'] shrink-0">
              {w.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-stone-800 font-['Sora']">{w.name}</span>
                <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
              </div>
              <div className="text-xs text-stone-400 truncate">{w.currentTask}</div>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-sm font-bold ${effColor}`}>{w.efficiency}%</div>
              <div className="text-[10px] text-stone-400">{w.jobsToday} jobs</div>
              <div className="text-[10px] text-stone-400">{w.avgResponseMin}m avg</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}