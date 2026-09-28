'use client';

import { useRef, useCallback, useState, JSX } from 'react';
import { Zone, Corridor, ZoneState, Robot, MapLayers } from '@/types';
import { useFloorPlanDraw } from './useFloorPlanDraw';

interface FloorPlanProps {
  zones: Zone[];
  corridors: Corridor[];
  zoneStates: Record<string, ZoneState>;
  robots: Robot[];
  terminalId: string;
  floor: number;
  selectedZoneId: string | null;
  onZoneClick: (zone: Zone) => void;
  layers: MapLayers;
  onLayerToggle: (key: keyof MapLayers) => void;
  tickCount: number;
}

// --- Icons (inline SVG, no emoji font dependency) ---
function IconThermometer() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}
function IconRadio() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-8.49a6 6 0 0 0 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconBot() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 16h.01M16 16h.01" />
    </svg>
  );
}

const LAYER_LABELS: { key: keyof MapLayers; label: string; Icon: () => JSX.Element }[] = [
  { key: 'heatmap',  label: 'Heatmap',  Icon: IconThermometer },
  { key: 'sensors',  label: 'Sensors',  Icon: IconRadio },
  { key: 'priority', label: 'Priority', Icon: IconAlert },
  { key: 'bins',     label: 'Bins',     Icon: IconTrash },
  { key: 'robots',   label: 'Robots',   Icon: IconBot },
];

export default function FloorPlan({
  zones,
  corridors,
  zoneStates,
  robots,
  terminalId,
  floor,
  selectedZoneId,
  onZoneClick,
  layers,
  onLayerToggle,
  tickCount,
}: FloorPlanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [legendOpen, setLegendOpen] = useState(true);

  useFloorPlanDraw(
    canvasRef,
    zones,
    corridors,
    zoneStates,
    robots,
    layers,
    selectedZoneId,
    terminalId,
    floor,
    tickCount
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 520 / rect.height;

      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      for (const zone of zones) {
        if (zone.type === 'corridor') continue;

        if (
          mx >= zone.x &&
          mx <= zone.x + zone.w &&
          my >= zone.y &&
          my <= zone.y + zone.h
        ) {
          onZoneClick(zone);
          return;
        }
      }
    },
    [zones, onZoneClick]
  );

  return (
    // isolate: creates its own stacking context so nothing inside here
    // can be pierced by, or accidentally sit above, a parent's fixed/sticky bar
    <div className="flex flex-col w-full h-full gap-3 isolate">

      {/* TOOLBAR — static row, in normal document flow, no absolute/fixed positioning */}
      <div className="relative z-0 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap gap-1.5">
          {LAYER_LABELS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => onLayerToggle(key)}
              aria-pressed={layers[key]}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                layers[key]
                  ? 'border-stone-800 bg-stone-800 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setLegendOpen((v) => !v)}
          className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:border-stone-300 hover:bg-stone-50"
        >
          {legendOpen ? 'Hide legend' : 'Show legend'}
        </button>
      </div>

      {/* CANVAS ROW */}
      <div className="relative z-0 flex min-h-0 flex-1 gap-3">
        <div className="flex-1 overflow-hidden rounded-xl border border-stone-200 bg-[#faf8f5] shadow-sm">
          <canvas
            ref={canvasRef}
            width={800}
            height={520}
            onClick={handleClick}
            className="block h-full w-full cursor-crosshair"
            style={{ aspectRatio: '800 / 520' }}
          />
        </div>

        {legendOpen && (
          <div className="h-fit w-44 shrink-0 space-y-1.5 rounded-lg border border-stone-200 bg-white p-3 text-xs shadow-sm">
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-stone-400">
              Legend
            </div>

            {[
              { color: 'bg-red-500', label: 'Critical' },
              { color: 'bg-orange-400', label: 'High' },
              { color: 'bg-amber-400', label: 'Medium' },
              { color: 'bg-green-500', label: 'Low / Clean' },
              { color: 'bg-stone-300', label: 'No signal' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-stone-600">
                <div className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                {label}
              </div>
            ))}

            <div className="flex items-center gap-2 border-t border-stone-100 pt-1.5 text-stone-600">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Robot
            </div>
          </div>
        )}
      </div>
    </div>
  );
}