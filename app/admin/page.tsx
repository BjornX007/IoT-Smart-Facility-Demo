"use client";

import { useState, useEffect, useCallback } from "react";
import FloorPlan from "@/components/map/FloorPlan";
import Sidebar from "@/components/admin/Sidebar";
import StatsBar from "@/components/admin/StatsBar";
import type { AppState, Zone, MapLayers, SmartBin } from "@/types";
import terminalsData from "@/data/terminals.json";
import type { Terminal } from "@/types";
import { INITIAL_ROBOTS, INITIAL_WORKERS } from "@/src/data/initialState";
import {
  buildInitialZoneStates,
  tickSimulation,
  toggleRobotMode,
  dispatchRobotToZone,
  getAllZones,
} from "@/lib/store";

const terminals = terminalsData as Terminal[];

export default function AdminPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [dispatchTargetRobotId, setDispatchTargetRobotId] = useState<string | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [layers, setLayers] = useState<MapLayers>({
    heatmap: true, sensors: true, priority: true, bins: true, robots: true,
  });
  const [selectedFloor, setSelectedFloor] = useState<{
    terminal: "A" | "B";
    floor: 0 | 1;
  }>({ terminal: "A", floor: 0 });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("aero_reports") ?? "[]");
    setState({
      zoneStates: buildInitialZoneStates(),
      robots: INITIAL_ROBOTS,
      workers: INITIAL_WORKERS,
      reports: saved,
      reviews: [],
      flights: [],
      serviceRequests: [],
      simulationTick: 0,
      tripsSaved: 0,
      lastUpdated: new Date().toISOString(),
    });
  }, []);

  const handleTick = useCallback(() => {
    setState((prev) => prev ? tickSimulation(prev) : prev);
  }, []);

  useEffect(() => {
    if (!isAutoRunning) return;
    const id = setInterval(handleTick, 2000);
    return () => clearInterval(id);
  }, [isAutoRunning, handleTick]);

  if (!state) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#faf9f7", color: "#9c9488", fontFamily: "'DM Sans', sans-serif" }}>
      Loading…
    </div>
  );

  const terminalId = selectedFloor.terminal === "A" ? "TMA" : "TMB";
  const terminalDef = terminals.find((t) => t.id === terminalId);
  const floorDef = terminalDef?.floors.find((f) => f.id === selectedFloor.floor);
  const zones = (floorDef?.zones ?? []) as Zone[];
  const corridors = floorDef?.corridors ?? [];
  const bins: SmartBin[] = Object.values(state.zoneStates).flatMap((zs) => zs.bins);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#faf9f7", overflow: "hidden" }}>

      <StatsBar
        state={state}
        onSimulateTick={handleTick}
        isAutoRunning={isAutoRunning}
        onToggleAuto={() => setIsAutoRunning((p) => !p)}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div
          style={{
            flex: "0 0 65%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRight: "1px solid #e8e4df",
          }}
        >
          <div
            style={{
              flex: "0 0 auto",
              display: "flex",
              gap: 8,
              padding: "12px 16px",
              borderBottom: "1px solid #e8e4df",
              background: "#faf9f7",
            }}
          >
            {(["A", "B"] as const).map((t) => (
              <button key={t} onClick={() => setSelectedFloor((p) => ({ ...p, terminal: t }))}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "1px solid",
                  borderColor: selectedFloor.terminal === t ? "#c87941" : "#ddd8d0",
                  background: selectedFloor.terminal === t ? "#c87941" : "white",
                  color: selectedFloor.terminal === t ? "white" : "#555",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>
                Terminal {t}
              </button>
            ))}
            {([0, 1] as const).map((f) => (
              <button key={f} onClick={() => setSelectedFloor((p) => ({ ...p, floor: f }))}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "1px solid",
                  borderColor: selectedFloor.floor === f ? "#6c7bb5" : "#ddd8d0",
                  background: selectedFloor.floor === f ? "#6c7bb5" : "white",
                  color: selectedFloor.floor === f ? "white" : "#555",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>
                {f === 0 ? "Departures" : "Arrivals"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, position: "relative", overflow: "hidden", padding: "12px 16px" }}>
            <FloorPlan
              zones={zones}
              corridors={corridors}
              zoneStates={state.zoneStates}
              robots={state.robots}
              terminalId={terminalId}
              floor={selectedFloor.floor}
              selectedZoneId={selectedZoneId}
              onZoneClick={(zone) => {
                if (dispatchTargetRobotId) {
                  setState((prev) => prev ? dispatchRobotToZone(prev, dispatchTargetRobotId, zone.id) : prev);
                  setDispatchTargetRobotId(null);
                  return;
                }
                setSelectedZoneId((p) => (p === zone.id ? null : zone.id));
              }}
              layers={layers}
              onLayerToggle={(key) => setLayers((p) => ({ ...p, [key]: !p[key] }))}
              tickCount={state.simulationTick}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <Sidebar
            robots={state.robots}
            bins={bins}
            reports={state.reports}
            workers={state.workers}
            onRobotModeToggle={(robotId) => {
              setState((prev) => prev ? toggleRobotMode(prev, robotId) : prev);
              setDispatchTargetRobotId((p) => (p === robotId ? null : p));
            }}
            onRobotDispatchClick={(robotId) => {
              setDispatchTargetRobotId((p) => (p === robotId ? null : robotId));
            }}
            dispatchTargetRobotId={dispatchTargetRobotId}
            onMarkBinEmptied={(binId) => {
              setState((prev) => {
                if (!prev) return prev;
                const zoneStates = { ...prev.zoneStates };
                for (const zid in zoneStates) {
                  zoneStates[zid] = {
                    ...zoneStates[zid],
                    bins: zoneStates[zid].bins.map((b) =>
                      b.id === binId ? { ...b, fillLevel: 0, lastEmptied: "just now" } : b
                    ),
                  };
                }
                return { ...prev, zoneStates };
              });
            }}
            onAssignWorker={(binId, zoneId, workerId) => {
              setState((prev) => {
                if (!prev) return prev;
                const zone = getAllZones().find((z) => z.id === zoneId);
                return {
                  ...prev,
                  workers: prev.workers.map((w) =>
                    w.id === workerId
                      ? { ...w, status: "transit", zoneId, currentTask: `Bin pickup — ${zone?.name ?? zoneId}` }
                      : w
                  ),
                };
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}