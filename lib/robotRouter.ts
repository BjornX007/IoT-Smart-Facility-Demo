import { Robot, Zone, RobotStatus } from '@/types';

function distance(
  x1: number, y1: number,
  x2: number, y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

const AVAILABLE_STATUSES: RobotStatus[] = ['docked', 'navigating'];

export function findNearestRobot(
  zone: Zone,
  robots: Robot[],
  minBattery = 20
): Robot | null {
  const available = robots.filter(
    r =>
      r.terminalId === zone.terminalId &&
      r.battery >= minBattery &&
      (AVAILABLE_STATUSES.includes(r.status) ||
        (r.status === 'navigating' && !r.targetZoneId))
  );

  if (available.length === 0) return null;

  const zoneCenterX = zone.x + zone.w / 2;
  const zoneCenterY = zone.y + zone.h / 2;

  return available.reduce((closest, robot) => {
    const dRobot = distance(robot.position.x, robot.position.y, zoneCenterX, zoneCenterY);
    const dClosest = distance(closest.position.x, closest.position.y, zoneCenterX, zoneCenterY);
    return dRobot < dClosest ? robot : closest;
  });
}

export function dispatchRobot(
  robot: Robot,
  zone: Zone,
  taskType: 'mopping' | 'collecting'
): Robot {
  const eta = Math.ceil(
    distance(robot.position.x, robot.position.y, zone.x + zone.w / 2, zone.y + zone.h / 2) / 60
  );

  return {
    ...robot,
    status: 'navigating',
    targetZoneId: zone.id,
    currentTask: taskType === 'mopping'
      ? `Mopping — ${zone.shortName}`
      : `Bin collection — ${zone.shortName}`,
    eta: Math.max(1, eta),
  };
}

export function tickRobotPosition(robot: Robot, zone: Zone | undefined): Robot {
  if (!zone || robot.status === 'docked' || robot.status === 'charging') return robot;

  const targetX = zone.x + zone.w / 2;
  const targetY = zone.y + zone.h / 2;

  const dx = targetX - robot.position.x;
  const dy = targetY - robot.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const SPEED = 18;

  if (dist < SPEED) {
    // Arrived
    const newStatus: RobotStatus =
      robot.status === 'navigating' || robot.status === 'mopping'
        ? 'mopping'
        : 'collecting';

    return {
      ...robot,
      position: { ...robot.position, x: targetX, y: targetY },
      status: newStatus,
      eta: 0,
      battery: Math.max(0, robot.battery - 0.5),
    };
  }

  const nx = robot.position.x + (dx / dist) * SPEED;
  const ny = robot.position.y + (dy / dist) * SPEED;

  return {
    ...robot,
    position: { ...robot.position, x: nx, y: ny },
    battery: Math.max(0, robot.battery - 0.3),
    eta: Math.max(0, (robot.eta ?? 5) - 1),
  };
}

export function checkRobotBattery(robot: Robot): Robot {
  if (robot.battery <= 15 && robot.status !== 'charging' && robot.status !== 'returning') {
    return {
      ...robot,
      status: 'returning',
      targetZoneId: null,
      currentTask: 'Returning to dock — low battery',
      eta: null,
    };
  }
  return robot;
}