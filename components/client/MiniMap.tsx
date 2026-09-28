"use client";

import { useMemo } from "react";
import terminalsData from "@/data/terminals.json";
import type { Terminal, Zone } from "@/types";

const terminals = terminalsData as Terminal[];

interface MiniMapProps {
  terminalId: string;
  floor: number;
  selectedZoneId: string | null;
  onZoneClick: (zone: Zone) => void;
}

export default function MiniMap({ terminalId, floor, selectedZoneId, onZoneClick }: MiniMapProps) {
  const zones = useMemo(() => {
    const terminal = terminals.find((t) => t.id === terminalId);
    const floorDef = terminal?.floors.find((f) => f.id === floor);
    return floorDef?.zones ?? [];
  }, [terminalId, floor]);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "800/520", background: "#f5f3f0", borderRadius: 10, overflow: "hidden", border: "1px solid #e8e4df" }}>
      <svg viewBox="0 0 800 520" width="100%" height="100%">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          return (
            <g key={zone.id} onClick={() => onZoneClick(zone)} style={{ cursor: "pointer" }}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx={4}
                fill={isSelected ? "#c87941" : "#e8e4df"}
                stroke={isSelected ? "#a0612e" : "#ccc8c0"}
                strokeWidth={isSelected ? 2 : 1}
                opacity={0.9}
              />
              <text
                x={zone.x + zone.w / 2}
                y={zone.y + zone.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(10, zone.w / 5)}
                fill={isSelected ? "white" : "#666"}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {zone.shortName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}