import { AppState, ZoneState, SmartBin, Robot, Zone, Priority, ZoneStatus } from '@/types';
import { tickRobotPosition, checkRobotBattery } from './robotRouter';
import terminalsData from '@/data/terminals.json';
import { Terminal } from '@/types';

const terminals = terminalsData as Terminal[];

export function getAllZones(): Zone[] {
  return terminals.flatMap(t => t.floors.flatMap(f => f.zones));
}

function getZone(zoneId: string): Zone | undefined {
  return getAllZones().find(z => z.id === zoneId);
}

function getPriority(traffic: number, detected: boolean): Priority {
  if (!detected) return 'SKIP';
  if (traffic >= 80) return 'CRITICAL';
  if (traffic >= 60) return 'HIGH';
  if (traffic >= 35) return 'MEDIUM';
  if (traffic >= 15) return 'LOW';
  return 'SKIP';
}

function getStatus(priority: Priority, current: ZoneStatus): ZoneStatus {
  if (current === 'inprogress') return 'inprogress';
  if (priority === 'CRITICAL' || priority === 'HIGH') return 'dirty';
  if (priority === 'SKIP') return 'skip';
  return current === 'dirty' ? 'dirty' : 'clean';
}

function tickBin(bin: SmartBin, trafficLevel: number): SmartBin {
  const fillRate = trafficLevel * 0.04 + Math.random() * 0.8;
  const newFill = Math.min(100, bin.fillLevel + fillRate);
  return { ...bin, fillLevel: parseFloat(newFill.toFixed(1)) };
}

function tickSensor(zoneState: ZoneState, baseTraffic: number) {
  const delta = (Math.random() - 0.44) * 12;
  const newTraffic = Math.max(0, Math.min(100, zoneState.sensor.trafficLevel + delta));
  const threshold = baseTraffic > 50 ? 0.85 : 0.6;
  const detected = Math.random() < threshold;
  const lastMotion = detected ? Math.floor(Math.random() * 10) + 1 : null;
  const totalPassengers = zoneState.sensor.totalPassengers + (detected ? Math.floor(Math.random() * 8) : 0);

  return {
    ...zoneState.sensor,
    trafficLevel: parseFloat(newTraffic.toFixed(1)),
    detected,
    lastMotion,
    totalPassengers,
  };
}

export function buildInitialZoneStates(): Record<string, ZoneState> {
  const states: Record<string, ZoneState> = {};

  terminals.forEach(terminal => {
    terminal.floors.forEach(floor => {
      floor.zones.forEach(zone => {
        const baseTraffic: Record<string, number> = {
          gate: 70, restroom: 75, food: 85, lounge: 55,
          checkin: 80, baggage: 75, security: 70, retail: 45,
          staff: 15, utility: 8, dock: 5, atrium: 65, corridor: 0,
        };
        const traffic = (baseTraffic[zone.type] ?? 40) + (Math.random() - 0.5) * 20;
        const detected = traffic > 15;

        const bins: SmartBin[] = Array.from({ length: zone.binCount }, (_, i) => ({
          id: `${zone.id}-bin-${i + 1}`,
          zoneId: zone.id,
          label: `Bin ${i + 1}`,
          fillLevel: parseFloat((Math.random() * 80).toFixed(0)),
          lastEmptied: '2h ago',
          type: i === 0 ? 'general' : i === 1 ? 'recycling' : 'general',
        }));

        const priority = getPriority(traffic, detected);

        states[zone.id] = {
          zoneId: zone.id,
          status: getStatus(priority, 'clean'),
          priority,
          sensor: {
            id: `sensor-${zone.id}`,
            zoneId: zone.id,
            trafficLevel: parseFloat(traffic.toFixed(1)),
            detected,
            lastMotion: detected ? Math.floor(Math.random() * 30) + 1 : null,
            totalPassengers: Math.floor(traffic * 18 + Math.random() * 200),
          },
          bins,
          lastCleaned: `${Math.floor(Math.random() * 4) + 1}h ago`,
          scheduledClean: Math.random() > 0.7 ? '16:00' : null,
          assignedRobotId: null,
          assignedWorkerId: null,
        };
      });
    });
  });

  return states;
}

export function tickSimulation(state: AppState): AppState {
  const zones = getAllZones();
  const baseTrafficMap: Record<string, number> = {
    gate: 70, restroom: 75, food: 85, lounge: 55,
    checkin: 80, baggage: 75, security: 70, retail: 45,
    staff: 15, utility: 8, dock: 5, atrium: 65,
  };

  let tripsSaved = state.tripsSaved;

  const newZoneStates = Object.fromEntries(
    Object.entries(state.zoneStates).map(([id, zs]) => {
      const zone = zones.find(z => z.id === id);
      if (!zone || zone.type === 'corridor') return [id, zs];

      const base = baseTrafficMap[zone.type] ?? 40;
      const newSensor = tickSensor(zs, base);
      const newBins = zs.bins.map(b => tickBin(b, newSensor.trafficLevel));
      const priority = getPriority(newSensor.trafficLevel, newSensor.detected);

      if (!newSensor.detected && zs.sensor.detected) tripsSaved++;

      const status = zs.assignedRobotId ? 'inprogress' : getStatus(priority, zs.status);

      return [id, {
        ...zs,
        sensor: newSensor,
        bins: newBins,
        priority,
        status,
      }];
    })
  );

  // Tick robot positions
  const newRobots: Robot[] = state.robots.map(robot => {
    let r = robot;
    if (r.status === 'charging') {
      r = { ...r, battery: Math.min(100, r.battery + 2) };
      if (r.battery >= 100) r = { ...r, status: 'docked', currentTask: 'Standby — fully charged' };
      return r;
    }
    if (r.status === 'mopping' || r.status === 'collecting') {
      r = { ...r, battery: Math.max(0, r.battery - 0.8) };
      const done = Math.random() > 0.85;
      if (done) {
        r = {
          ...r,
          status: 'navigating',
          targetZoneId: null,
          currentTask: 'Task complete — returning',
          totalJobsToday: r.totalJobsToday + 1,
          distanceCoveredM: r.distanceCoveredM + Math.floor(Math.random() * 100 + 50),
        };
      }
      return checkRobotBattery(r);
    }
    const targetZone = r.targetZoneId ? zones.find(z => z.id === r.targetZoneId) : undefined;
    r = tickRobotPosition(r, targetZone);
    return checkRobotBattery(r);
  });

  return {
    ...state,
    zoneStates: newZoneStates,
    robots: newRobots,
    simulationTick: state.simulationTick + 1,
    tripsSaved,
    lastUpdated: new Date().toISOString(),
  };
}