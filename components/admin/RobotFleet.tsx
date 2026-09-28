'use client';

import { Robot } from '@/types';

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  docked:     { label: 'Docked',     color: 'text-stone-500', dot: 'bg-stone-400' },
  navigating: { label: 'En Route',   color: 'text-blue-600',  dot: 'bg-blue-500' },
  mopping:    { label: 'Mopping',    color: 'text-indigo-600',dot: 'bg-indigo-500' },
  collecting: { label: 'Collecting', color: 'text-violet-600',dot: 'bg-violet-500' },
  returning:  { label: 'Returning',  color: 'text-amber-600', dot: 'bg-amber-500' },
  charging:   { label: 'Charging',   color: 'text-amber-600', dot: 'bg-amber-400' },
};

function clampPct(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function BatteryRing({ pct }: { pct: number }) {
  const safePct = clampPct(pct);
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - safePct / 100);
  const color = safePct <= 15 ? '#ef4444' : safePct <= 40 ? '#f59e0b' : '#10b981';

  return (
    <svg width={46} height={46} viewBox="0 0 46 46" className="rotate-[-90deg]">
      <circle cx={23} cy={23} r={r} fill="none" stroke="#f0ece4" strokeWidth={4} />
      <circle
        cx={23} cy={23} r={r} fill="none"
        stroke={color} strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={23} y={27}
        textAnchor="middle"
        fill={color}
        fontSize={10}
        fontWeight={700}
        fontFamily="Sora, sans-serif"
        style={{ transform: 'rotate(90deg)', transformOrigin: '23px 23px' }}
      >
        {safePct}%
      </text>
    </svg>
  );
}

interface RobotFleetProps {
  robots: Robot[];
  onModeToggle?: (robotId: string) => void;
  onDispatchClick?: (robotId: string) => void;
  dispatchTargetRobotId?: string | null; // robot currently "armed" for manual dispatch
}

export default function RobotFleet({
  robots,
  onModeToggle,
  onDispatchClick,
  dispatchTargetRobotId,
}: RobotFleetProps) {
  return (
    <div className="space-y-2">
      {robots.map(robot => {
        const meta = STATUS_META[robot.status] || STATUS_META.docked;
        const mode = robot.mode ?? 'auto';
        const isArmed = dispatchTargetRobotId === robot.id;

        return (
          <div
            key={robot.id}
            className="p-3 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-stone-200 transition-all"
            style={isArmed ? { borderColor: '#6c7bb5', boxShadow: '0 0 0 2px rgba(108,123,181,0.15)' } : undefined}
          >
            <div className="flex items-center gap-3">
              <BatteryRing pct={robot.battery} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-stone-800 font-['Sora']">{robot.name}</span>
                  <div className={`w-2 h-2 rounded-full ${meta.dot} animate-pulse`} />
                </div>
                <div className={`text-xs font-medium ${meta.color}`}>{meta.label}</div>
                <div className="text-xs text-stone-400 mt-0.5 truncate">{robot.currentTask}</div>
              </div>
              <div className="text-right shrink-0">
                {robot.eta !== null && robot.eta > 0 && (
                  <div className="text-xs font-semibold text-stone-600">{robot.eta}m</div>
                )}
                <div className="text-[10px] text-stone-400">{robot.totalJobsToday} jobs</div>
                <div className="text-[10px] text-stone-400">{robot.distanceCoveredM}m</div>
              </div>
            </div>

            {/* Mode toggle + manual dispatch controls */}
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-stone-100">
              <button
                onClick={() => onModeToggle?.(robot.id)}
                className="flex items-center gap-1.5 text-[10px] font-semibold rounded-md px-2 py-1 transition-colors"
                style={{
                  background: mode === 'auto' ? '#eef2ff' : '#fff7ed',
                  color: mode === 'auto' ? '#4338ca' : '#c2410c',
                }}
              >
                {mode === 'auto' ? 'AUTO' : 'MANUAL'}
                <span className="text-stone-400 font-normal">
                  {mode === 'auto' ? '— sensor-driven' : '— dispatcher-controlled'}
                </span>
              </button>

              {mode === 'manual' && (
                <button
                  onClick={() => onDispatchClick?.(robot.id)}
                  disabled={robot.status !== 'docked' && robot.status !== 'returning'}
                  className="text-[10px] font-semibold rounded-md px-2.5 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: isArmed ? '#6c7bb5' : '#f0ece4',
                    color: isArmed ? 'white' : '#57534e',
                  }}
                >
                  {isArmed ? 'Click a zone…' : 'Dispatch to zone'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}