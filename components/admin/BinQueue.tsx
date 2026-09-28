'use client';

import type { SmartBin } from '@/types';

const TYPE_ICON: Record<string, string> = {
  general:   '🗑',
  recycling: '♻️',
  hazardous: '⚠️',
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
  onMarkEmptied?: (binId: string) => void;
  onRequestPickup?: (binId: string, zoneId: string) => void;
}

export default function BinQueue({ bins, onMarkEmptied, onRequestPickup }: BinQueueProps) {
  const sorted = [...bins].sort((a, b) => b.fillLevel - a.fillLevel);
  const urgent = sorted.filter(b => b.fillLevel >= 70);
  const normal = sorted.filter(b => b.fillLevel < 70);

  const renderBin = (bin: SmartBin) => {
    const isUrgent = bin.fillLevel >= 90;
    const isWarning = bin.fillLevel >= 70 && bin.fillLevel < 90;

    return (
      <div
        key={bin.id}
        className="p-3 bg-white rounded-xl border shadow-sm transition-all"
        style={{ borderColor: isUrgent ? '#fecaca' : isWarning ? '#fed7aa' : '#f1f0ee' }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: 18 }}>{TYPE_ICON[bin.type] ?? '🗑'}</span>
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
              onClick={() => onRequestPickup?.(bin.id, bin.zoneId)}
              className="flex-1 text-[10px] font-semibold rounded-md px-2 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
            >
              Request pickup
            </button>
          )}
        </div>
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