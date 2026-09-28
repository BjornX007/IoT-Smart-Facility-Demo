import { useEffect, RefObject } from 'react';
import { Zone, Corridor, ZoneState, Robot, SmartBin, MapLayers } from '@/types';

const C = {
  bg: '#faf8f5',
  corridorFill: '#ede9e0',
  corridorStroke: 'rgba(160,140,110,0.25)',
  wallOuter: '#8a7560',
  wallInner: 'rgba(140,120,90,0.4)',
  gridLine: 'rgba(160,140,110,0.07)',
  textPrimary: '#2d2418',
  textSecondary: '#7a6a50',
  textLight: '#a89880',
  clean: '#f0ece3',
  cleanStroke: 'rgba(140,120,90,0.3)',
  heatCritical: '#c8452a',
  heatHigh: '#d4772a',
  heatMedium: '#c8a245',
  heatLow: '#7a9e5a',
  heatSkip: '#ddd8ce',
  heatCriticalFill: 'rgba(200,69,42,0.18)',
  heatHighFill: 'rgba(212,119,42,0.16)',
  heatMediumFill: 'rgba(200,162,69,0.14)',
  heatLowFill: 'rgba(122,158,90,0.12)',
  priorityCritical: '#c8452a',
  priorityHigh: '#d4772a',
  priorityMedium: '#c8a245',
  priorityLow: '#7a9e5a',
  prioritySkip: '#aaa090',
  binGreen: '#5a9a5a',
  binAmber: '#c8922a',
  binRed: '#c8452a',
  robotColor: '#3a7abf',
  robotNav: '#5aa0df',
  robotMop: '#3a7abf',
  robotCharge: '#c8922a',
  selectedStroke: '#3a6abf',
  dock: '#b8d4f0',
};

function typeBaseFill(type: string): string {
  const m: Record<string, string> = {
    gate: '#f5f0e8', restroom: '#edf2f5', food: '#fdf5ec',
    lounge: '#f5f0ec', checkin: '#f0f5f0', baggage: '#f0edf5',
    security: '#f5f0e8', retail: '#faf5f0', staff: '#eeeeea',
    utility: '#e8e8e4', dock: '#eaf2f8', atrium: '#f8f5ee',
    corridor: C.corridorFill,
  };
  return m[type] || '#f0ece4';
}

function zoneHeatFill(traffic: number, detected: boolean, type: string): string {
  if (type === 'dock') return C.dock;
  if (!detected) return C.heatSkip;
  if (traffic >= 88) return C.heatCriticalFill;
  if (traffic >= 70) return C.heatHighFill;
  if (traffic >= 45) return C.heatMediumFill;
  return C.heatLowFill;
}

function zoneBaseFill(traffic: number, detected: boolean, type: string, useHeat: boolean): string {
  if (useHeat) return zoneHeatFill(traffic, detected, type);
  return typeBaseFill(type);
}

function zoneBorderColor(priority: string): string {
  const m: Record<string, string> = {
    CRITICAL: C.priorityCritical, HIGH: C.priorityHigh,
    MEDIUM: C.priorityMedium, LOW: C.priorityLow, SKIP: C.prioritySkip,
  };
  return m[priority] || C.wallInner;
}

function binColor(fill: number): string {
  if (fill >= 85) return C.binRed;
  if (fill >= 60) return C.binAmber;
  return C.binGreen;
}

function robotStatusColor(status: string): string {
  const m: Record<string, string> = {
    docked: '#888', navigating: C.robotNav, mopping: C.robotMop,
    collecting: '#7a4abf', returning: C.robotCharge, charging: C.robotCharge,
  };
  return m[status] || C.robotColor;
}

export function useFloorPlanDraw(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  zones: Zone[],
  corridors: Corridor[],
  zoneStates: Record<string, ZoneState>,
  robots: Robot[],
  layers: MapLayers,
  selectedZoneId: string | null,
  terminalId: string,
  floor: number,
  tickCount: number
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.save();
    for (let gx = 0; gx < W; gx += 20) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H);
      ctx.strokeStyle = C.gridLine; ctx.lineWidth = 0.5; ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 20) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy);
      ctx.strokeStyle = C.gridLine; ctx.lineWidth = 0.5; ctx.stroke();
    }
    ctx.restore();

    // Corridors
    corridors.forEach(c => {
      ctx.fillStyle = C.corridorFill;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = C.corridorStroke;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      // Dashed centerline
      ctx.save();
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = 'rgba(160,140,110,0.18)';
      ctx.lineWidth = 0.6;
      const isH = c.w > c.h;
      if (isH) {
        const my = c.y + c.h / 2;
        ctx.beginPath(); ctx.moveTo(c.x, my); ctx.lineTo(c.x + c.w, my); ctx.stroke();
      } else {
        const mx = c.x + c.w / 2;
        ctx.beginPath(); ctx.moveTo(mx, c.y); ctx.lineTo(mx, c.y + c.h); ctx.stroke();
      }
      ctx.restore();
    });

    // Zones
    zones.forEach(zone => {
      const zs = zoneStates[zone.id];
      if (!zs) return;

      const isSel = selectedZoneId === zone.id;
      const isDock = zone.type === 'dock';

      // Base fill
      const fill = zoneBaseFill(zs.sensor.trafficLevel, zs.sensor.detected, zone.type, layers.heatmap);
      ctx.fillStyle = fill;
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

      // Floor tile texture
      if (!isDock) {
        ctx.save();
        ctx.strokeStyle = 'rgba(140,120,90,0.06)';
        ctx.lineWidth = 0.4;
        for (let lx = zone.x + 10; lx < zone.x + zone.w; lx += 10) {
          ctx.beginPath(); ctx.moveTo(lx, zone.y); ctx.lineTo(lx, zone.y + zone.h); ctx.stroke();
        }
        for (let ly = zone.y + 10; ly < zone.y + zone.h; ly += 10) {
          ctx.beginPath(); ctx.moveTo(zone.x, ly); ctx.lineTo(zone.x + zone.w, ly); ctx.stroke();
        }
        ctx.restore();
      }

      // Priority border
      const borderColor = layers.priority
        ? zoneBorderColor(zs.priority)
        : isSel ? C.selectedStroke : C.wallInner;
      const borderWidth = zs.priority === 'CRITICAL' && layers.priority ? 2.5
        : isSel ? 2 : 1;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

      // Selected highlight
      if (isSel) {
        ctx.strokeStyle = C.selectedStroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x + 1, zone.y + 1, zone.w - 2, zone.h - 2);
      }

      // Dock hatching
      if (isDock) {
        ctx.save();
        ctx.strokeStyle = 'rgba(58,122,191,0.15)';
        ctx.lineWidth = 1;
        for (let d = -zone.h; d < zone.w + zone.h; d += 12) {
          ctx.beginPath();
          ctx.moveTo(zone.x + d, zone.y);
          ctx.lineTo(zone.x + d + zone.h, zone.y + zone.h);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Zone name
      if (zone.w >= 50 && zone.h >= 28) {
        ctx.fillStyle = C.textPrimary;
        ctx.font = `600 ${zone.w > 130 ? 10 : 9}px 'Sora', sans-serif`;
        const maxW = zone.w - 10;
        let label = zone.name;
        while (ctx.measureText(label).width > maxW && label.length > 4) {
          label = label.slice(0, -1);
        }
        if (label !== zone.name) label = label.slice(0, -1) + '…';
        ctx.fillText(label, zone.x + 5, zone.y + 13, maxW);
      }

      // Gate code badge
      if (zone.gateCode && zone.w >= 50 && zone.h >= 50) {
        ctx.fillStyle = 'rgba(58,122,191,0.12)';
        ctx.fillRect(zone.x + 4, zone.y + 16, 28, 14);
        ctx.fillStyle = '#3a6abf';
        ctx.font = 'bold 9px "Sora", sans-serif';
        ctx.fillText(zone.gateCode, zone.x + 7, zone.y + 26);
      }

      // Traffic % (heatmap)
      if (layers.heatmap && zone.w >= 50 && zone.h >= 36) {
        const tc = zs.sensor.detected
          ? (zs.sensor.trafficLevel >= 80 ? C.heatCritical
            : zs.sensor.trafficLevel >= 60 ? C.heatHigh
              : zs.sensor.trafficLevel >= 35 ? C.heatMedium : C.heatLow)
          : C.prioritySkip;
        ctx.fillStyle = tc;
        ctx.font = `700 ${zone.w > 100 ? 10 : 9}px 'Sora', sans-serif`;
        if (zs.sensor.detected) {
          ctx.fillText(`${Math.round(zs.sensor.trafficLevel)}%`, zone.x + 5, zone.y + zone.h - 6);
        } else {
          ctx.fillStyle = C.prioritySkip;
          ctx.font = '8px "Sora", sans-serif';
          ctx.fillText('no signal', zone.x + 5, zone.y + zone.h - 6);
        }
      }

      // Priority label
      if (layers.priority && zs.priority !== 'LOW' && zone.w >= 60 && zone.h >= 44) {
        const bc = zoneBorderColor(zs.priority);
        ctx.fillStyle = bc + '22';
        const lblW = 56;
        ctx.fillRect(zone.x + zone.w - lblW - 3, zone.y + zone.h - 14, lblW, 12);
        ctx.fillStyle = bc;
        ctx.font = '700 8px "Sora", sans-serif';
        ctx.fillText(zs.priority, zone.x + zone.w - lblW, zone.y + zone.h - 5);
      }

      // Sensor dots
      if (layers.sensors && zs.sensor.detected && zone.sensors > 0 && zone.w >= 40) {
        for (let si = 0; si < Math.min(zone.sensors, 3); si++) {
          const sx = zone.x + zone.w - 8 - si * 12;
          const sy = zone.y + 8;
          const sc = zs.sensor.trafficLevel >= 80 ? C.heatCritical
            : zs.sensor.trafficLevel >= 60 ? C.heatHigh : C.heatLow;
          ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = sc; ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8; ctx.stroke();
          // Pulse ring
          ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2);
          ctx.strokeStyle = sc + '55'; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }

      // Smart bins
      if (layers.bins && zs.bins.length > 0 && zone.w >= 40 && zone.h >= 36) {
        zs.bins.slice(0, 3).forEach((bin, bi) => {
          const bx = zone.x + 5 + bi * 13;
          const by = zone.y + zone.h - 18;
          const bc = binColor(bin.fillLevel);
          const bh = Math.round(10 * (bin.fillLevel / 100));

          // Bin outline
          ctx.strokeStyle = bc;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, 10, 13);

          // Fill bar
          ctx.fillStyle = bc + '99';
          ctx.fillRect(bx, by + 13 - bh, 10, bh);

          // Critical pulse
          if (bin.fillLevel >= 85) {
            ctx.beginPath(); ctx.arc(bx + 5, by - 3, 3, 0, Math.PI * 2);
            ctx.fillStyle = C.binRed; ctx.fill();
          }
        });
      }
    });

    // Robots
    if (layers.robots) {
      const floorRobots = robots.filter(
        r => r.terminalId === terminalId && r.position.floor === floor
      );
      floorRobots.forEach(robot => {
        const { x, y } = robot.position;
        const rc = robotStatusColor(robot.status);

        // Shadow
        ctx.beginPath();
        ctx.arc(x, y + 2, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = rc;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pulse ring for active robots
        if (robot.status === 'mopping' || robot.status === 'navigating' || robot.status === 'collecting') {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.strokeStyle = rc + '66';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Robot label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px "Sora", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(robot.name.split('-')[1] || 'R', x, y + 3);
        ctx.textAlign = 'left';

        // Status dot
        const dotC = robot.status === 'charging' ? '#fbbf24'
          : robot.status === 'docked' ? '#9ca3af'
            : robot.status === 'mopping' || robot.status === 'collecting' ? '#34d399'
              : '#60a5fa';
        ctx.beginPath();
        ctx.arc(x + 7, y - 7, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = dotC; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8; ctx.stroke();
      });
    }

    // Compass
    ctx.fillStyle = C.textSecondary;
    ctx.font = '10px "Sora", sans-serif';
    ctx.fillText('N', W - 16, 14);
    ctx.beginPath(); ctx.moveTo(W - 12, 17); ctx.lineTo(W - 12, 30);
    ctx.strokeStyle = C.textSecondary; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 17, 22); ctx.lineTo(W - 12, 17); ctx.lineTo(W - 7, 22);
    ctx.stroke();

  }, [canvasRef, zones, corridors, zoneStates, robots, layers, selectedZoneId, terminalId, floor, tickCount]);
}