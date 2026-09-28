'use client';

import { AppState } from '@/types';

interface StatsBarProps {
  state: AppState;
  onSimulateTick: () => void;
  isAutoRunning: boolean;
  onToggleAuto: () => void;
}

function IconPlay() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function IconFastForward() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 5v14l8-7zM13 5v14l8-7z" />
    </svg>
  );
}
function IconTrendUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export default function StatsBar({ state, onSimulateTick, isAutoRunning, onToggleAuto }: StatsBarProps) {
  const zoneList = Object.values(state.zoneStates);
  const critical = zoneList.filter(z => z.priority === 'CRITICAL').length;
  const high = zoneList.filter(z => z.priority === 'HIGH').length;
  const inprogress = zoneList.filter(z => z.status === 'inprogress').length;
  const criticalBins = zoneList.flatMap(z => z.bins).filter(b => b.fillLevel >= 85).length;
  const activeRobots = state.robots.filter(r => ['mopping', 'navigating', 'collecting'].includes(r.status)).length;
  const totalRobots = state.robots.length;

  const needsAttention = critical + high + criticalBins;

  return (
    <div className="border-b border-stone-200 bg-white px-5 py-3">
      <div className="flex items-center gap-6">

        {/* URGENT STRIP — the only thing with real color weight */}
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-['Sora'] text-2xl font-bold tabular-nums ${critical > 0 ? 'text-red-600' : 'text-stone-300'}`}>
              {critical}
            </span>
            <span className="text-[11px] font-medium text-stone-400">critical</span>
          </div>

          <div className="h-6 w-px bg-stone-150" />

          <div className="flex items-baseline gap-1.5">
            <span className={`font-['Sora'] text-2xl font-bold tabular-nums ${high > 0 ? 'text-amber-600' : 'text-stone-300'}`}>
              {high}
            </span>
            <span className="text-[11px] font-medium text-stone-400">high priority</span>
          </div>

          <div className="h-6 w-px bg-stone-150" />

          <div className="flex items-baseline gap-1.5">
            <span className={`font-['Sora'] text-2xl font-bold tabular-nums ${criticalBins > 0 ? 'text-orange-600' : 'text-stone-300'}`}>
              {criticalBins}
            </span>
            <span className="text-[11px] font-medium text-stone-400">bins full</span>
          </div>

          {needsAttention > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500">
              {needsAttention} need attention
            </span>
          )}
        </div>

        <div className="h-8 w-px bg-stone-150" />

        {/* QUIET SECONDARY STATUS — smaller, muted, informational not urgent */}
        <div className="flex items-center gap-4 text-stone-500">
          <div className="flex items-baseline gap-1">
            <span className="font-['Sora'] text-sm font-semibold tabular-nums text-stone-700">{inprogress}</span>
            <span className="text-[11px]">in progress</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-['Sora'] text-sm font-semibold tabular-nums text-stone-700">{activeRobots}</span>
            <span className="text-[11px]">/ {totalRobots} robots active</span>
          </div>
        </div>

        {/* TRIPS SAVED — the headline business-value metric, visually distinct */}
        <div className="ml-auto flex items-center gap-2.5 rounded-lg bg-emerald-50 px-3.5 py-1.5">
          <IconTrendUp />
          <div className="flex items-baseline gap-1.5">
            <span className="font-['Sora'] text-lg font-bold tabular-nums text-emerald-700">
              {state.tripsSaved.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-emerald-600">cleaning trips avoided</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-2">
          <button
            onClick={onSimulateTick}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50"
          >
            <IconPlay />
            Tick
          </button>
          <button
            onClick={onToggleAuto}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition-all ${
              isAutoRunning
                ? 'border-stone-700 bg-stone-800 text-white'
                : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {isAutoRunning ? <IconPause /> : <IconFastForward />}
            {isAutoRunning ? 'Auto' : 'Auto'}
          </button>
        </div>
      </div>
    </div>
  );
}