'use client';

import { JSX, useState } from 'react';
import type { SmartBin, Worker } from '@/types';

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconRecycle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="m9.5 4.5 1.7-1.7A1 1 0 0 1 12.6 3h.001a1 1 0 0 1 .862.485l3.53 6.02" />
      <path d="m10.5 21 1.7-1.7a1 1 0 0 1 .762-.3h.001a1 1 0 0 1 .862.485l3.53 6.02" />
      <path d="M14 16.5 17.5 14l2.5 2.5" />
      <path d="M16.5 9.5 20 12l-2.5 2.5" />
    </svg>
  );
}
function IconAlertTriangle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const TYPE_ICON: Record<string, () => JSX.Element> = {
  general:   IconTrash,
  recycling: IconRecycle,
  hazardous: IconAlertTriangle,
};

function FillBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ height: 6, borderRadius: 3, background: '#f0ece4', overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
    </div>
  );
}

interface BinQueueProps {
  bins: SmartBin[];
  workers?: Worker[];
  onMarkEmptied?: (binId: string) => void;
  onAssignWorker?: (binId: string, zoneId: string, workerId: string) => void;
}

export default function BinQueue({ bins, workers = [], onMarkEmptied, onAssignWorker }: BinQueueProps) {
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);
  const sorted = [...bins].sort((a, b) => b.fillLevel - a.fillLevel);
  const urgent = sorted.filter(b => b.fillLevel >= 70);
  const normal = sorted.filter(b => b.fillLevel < 70);

  const availableWorkers = workers.filter(w => w.status === 'idle' || w.status === 'active');

  const renderBin = (bin: SmartBin) => {
    const isUrgent = bin.fillLevel >= 90;
    const isWarning = bin.fillLevel >= 70 && bin.fillLevel < 90;
    const Icon = TYPE_ICON[bin.type] ?? IconTrash;
    const pickerOpen = pickerOpenFor === bin.id;

    return (
      <div
        key={bin.id}
        className="p-3 bg-white rounded-xl border shadow-sm transition-all"
        style={{ borderColor: isUrgent ? '#fecaca' : isWarning ? '#fed7aa' : '#f1f0ee' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-stone-500"><Icon /></span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-stone-700 truncate">{bin.label}</span>
              <span
                className="text-xs font-bold ml-2 shrink-0"
                style={{ color: bin.fillLevel >= 90 ? '#ef4444' : bin.fillLevel >= 70 ? '#f59e0b' : '#10b981' }}
              >
                {bin.fillLevel}%
              </span>
            </div>
            <FillBar pct={bin.fillLevel} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-stone-400 truncate">{bin.zoneId}</span>
              <span className="text-[10px] text-stone-400">emptied {bin.lastEmptied}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-stone-100">
          <button
            onClick={() => onMarkEmptied?.(bin.id)}
            className="flex-1 text-[10px] font-semibold rounded-md px-2 py-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Mark emptied
          </button>
          {bin.fillLevel >= 70 && (
            <button
              onClick={() => setPickerOpenFor(pickerOpen ? null : bin.id)}
              className="flex-1 text-[10px] font-semibold rounded-md px-2 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
            >
              {pickerOpen ? 'Cancel' : 'Request pickup'}
            </button>
          )}
        </div>

        {/* Worker picker */}
        {pickerOpen && (
          <div className="mt-2 pt-2 border-t border-stone-100 space-y-1">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-stone-400 px-0.5 mb-1">
              Assign worker
            </div>
            {availableWorkers.length === 0 && (
              <p className="text-[10px] text-stone-400 py-1 px-0.5">No available staff right now</p>
            )}
            {availableWorkers.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  onAssignWorker?.(bin.id, bin.zoneId, w.id);
                  setPickerOpenFor(null);
                }}
                className="w-full flex items-center justify-between text-left rounded-md px-2 py-1.5 text-[11px] hover:bg-stone-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[9px] font-bold shrink-0">
                    {w.initials}
                  </span>
                  <span className="text-stone-700 font-medium">{w.name}</span>
                </span>
                <span className="text-stone-400">{w.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {bins.length === 0 && (
        <p className="text-xs text-stone-400 py-4 text-center">No bins tracked</p>
      )}

      {urgent.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-red-600">
              Needs attention
            </span>
            <span className="text-[10px] font-bold bg-red-100 text-red-600 rounded-full px-1.5 py-0.5">
              {urgent.length}
            </span>
          </div>
          <div className="space-y-2">{urgent.map(renderBin)}</div>
        </div>
      )}

      {normal.length > 0 && (
        <div>
          {urgent.length > 0 && (
            <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-2 px-0.5">
              All bins
            </div>
          )}
          <div className="space-y-2">{normal.map(renderBin)}</div>
        </div>
      )}
    </div>
  );
}