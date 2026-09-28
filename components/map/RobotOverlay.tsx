"use client";

import { useEffect, useRef } from "react";
import type { Robot, RobotStatus } from "@/types";

const CW = 800;
const CH = 520;

// Covers all 6 RobotStatus values from your types
const STATUS_COLOR: Record<RobotStatus, string> = {
  docked:     "#94a3b8",
  navigating: "#3b82f6",
  mopping:    "#10b981",
  collecting: "#8b5cf6",
  returning:  "#f59e0b",
  charging:   "#06b6d4",
};

const STATUS_LABEL: Record<RobotStatus, string> = {
  docked:     "Docked",
  navigating: "En route",
  mopping:    "Cleaning",
  collecting: "Collecting",
  returning:  "Returning",
  charging:   "Charging",
};

const TRAIL_LENGTH = 10;

interface Props {
  robots: Robot[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Only render robots on the currently viewed floor */
  floor: number;
  terminalId: string;
}

export default function RobotOverlay({ robots, canvasRef, floor, terminalId }: Props) {
  const trailsRef    = useRef<Map<string, { x: number; y: number }[]>>(new Map());
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let overlay = parent.querySelector<HTMLCanvasElement>(".robot-overlay");
    if (!overlay) {
      overlay = document.createElement("canvas");
      overlay.className = "robot-overlay";
      overlay.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
      parent.style.position = "relative";
      parent.appendChild(overlay);
    }

    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    overlay.width  = rect.width  * dpr;
    overlay.height = rect.height * dpr;

    const scaleX = (rect.width  / CW) * dpr;
    const scaleY = (rect.height / CH) * dpr;
    const ctx    = overlay.getContext("2d")!;

    // Filter to visible floor+terminal, exclude docked robots from overlay
    const visibleRobots = robots.filter(
      (r) => r.position.terminalId === terminalId &&
             r.position.floor === floor &&
             r.status !== "docked"
    );

    // Seed smooth positions from robot.position (nested RobotPosition)
    visibleRobots.forEach((r) => {
      if (!positionsRef.current.has(r.id)) {
        positionsRef.current.set(r.id, { x: r.position.x, y: r.position.y });
      }
    });

    function draw() {
      ctx.clearRect(0, 0, overlay!.width, overlay!.height);

      visibleRobots.forEach((robot) => {
        // Lerp toward robot.position (nested object)
        const target  = { x: robot.position.x, y: robot.position.y };
        const current = positionsRef.current.get(robot.id) ?? target;
        const lx = current.x + (target.x - current.x) * 0.12;
        const ly = current.y + (target.y - current.y) * 0.12;
        positionsRef.current.set(robot.id, { x: lx, y: ly });

        // Trail
        const trail = trailsRef.current.get(robot.id) ?? [];
        trail.push({ x: lx, y: ly });
        if (trail.length > TRAIL_LENGTH) trail.shift();
        trailsRef.current.set(robot.id, trail);

        const color = STATUS_COLOR[robot.status] ?? "#3b82f6";
        const px    = lx * scaleX;
        const py    = ly * scaleY;
        const scale = Math.min(scaleX, scaleY);

        // ── Trail line (navigating only) ──────────────────────────────────
        if (robot.status === "navigating" && trail.length > 1) {
          for (let i = 1; i < trail.length; i++) {
            const alpha = (i / trail.length) * 0.3;
            ctx.beginPath();
            ctx.moveTo(trail[i - 1].x * scaleX, trail[i - 1].y * scaleY);
            ctx.lineTo(trail[i].x     * scaleX, trail[i].y     * scaleY);
            ctx.strokeStyle = hexAlpha(color, alpha);
            ctx.lineWidth   = 2 * dpr;
            ctx.lineCap     = "round";
            ctx.stroke();
          }
        }

        // ── Pulse ring (active statuses) ──────────────────────────────────
        if (robot.status === "mopping" || robot.status === "navigating" || robot.status === "collecting") {
          const pulse = (Date.now() % 1600) / 1600;
          const r     = (10 + pulse * 14) * scale;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = hexAlpha(color, (1 - pulse) * 0.25);
          ctx.fill();
        }

        // ── White halo ────────────────────────────────────────────────────
        const radius = 9 * scale;
        ctx.beginPath();
        ctx.arc(px, py, radius + 2.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fill();

        // ── Battery arc ───────────────────────────────────────────────────
        const battColor = robot.battery < 15 ? "#ef4444" : robot.battery < 35 ? "#f59e0b" : "#10b981";
        ctx.beginPath();
        ctx.arc(px, py, radius + 2.5 * dpr, -Math.PI / 2,
          -Math.PI / 2 + (robot.battery / 100) * Math.PI * 2);
        ctx.strokeStyle = battColor;
        ctx.lineWidth   = 2.5 * dpr;
        ctx.stroke();

        // ── Inner dot ─────────────────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Robot emoji
        ctx.font         = `${Math.round(radius * 1.1)}px serif`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🤖", px, py);

        // ── Label pill ────────────────────────────────────────────────────
        const labelText = `${robot.name} · ${STATUS_LABEL[robot.status]}`;
        const labelSize = Math.round(9.5 * dpr);
        ctx.font = `${labelSize}px 'DM Sans', sans-serif`;
        const tw    = ctx.measureText(labelText).width;
        const pillW = tw + 12 * dpr;
        const pillH = 15 * dpr;
        const labelY = py + (radius + 14) * dpr;

        ctx.fillStyle = "rgba(255,255,255,0.93)";
        ctx.beginPath();
        ctx.roundRect(px - pillW / 2, labelY, pillW, pillH, 4 * dpr);
        ctx.fill();
        ctx.strokeStyle = hexAlpha(color, 0.4);
        ctx.lineWidth   = 1 * dpr;
        ctx.stroke();

        ctx.fillStyle    = color;
        ctx.textAlign    = "center";
        ctx.textBaseline = "top";
        ctx.fillText(labelText, px, labelY + 2 * dpr);

        // Battery %
        ctx.font      = `bold ${Math.round(8 * dpr)}px 'DM Sans', sans-serif`;
        ctx.fillStyle = battColor;
        ctx.fillText(`${Math.round(robot.battery)}%`, px, labelY + pillH + 2 * dpr);
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      overlay?.remove();
    };
  }, [robots, canvasRef, floor, terminalId]);

  return null;
}

function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}