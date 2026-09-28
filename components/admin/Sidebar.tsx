'use client';
import { useState } from 'react';
import RobotFleet from './RobotFleet';
import BinQueue from './BinQueue';
import TaskQueue from './TaskQueue';
import WorkerStatus from './WorkerStatus';
import type { Robot, SmartBin, Report, Worker } from '@/types';

interface Props {
  robots: Robot[];
  bins: SmartBin[];
  reports: Report[];
  workers: Worker[];
  onMarkResolved?: (reportId: string, zoneId: string) => void;
  onRobotModeToggle?: (robotId: string) => void;
  onRobotDispatchClick?: (robotId: string) => void;
  dispatchTargetRobotId?: string | null;
  onMarkBinEmptied?: (binId: string) => void;
  onRequestBinPickup?: (binId: string, zoneId: string) => void;
}

const TABS = [
  { id: 'robots',  label: 'Robots',  icon: '🤖' },
  { id: 'bins',    label: 'Bins',    icon: '🗑️' },
  { id: 'tasks',   label: 'Tasks',   icon: '📋' },
  { id: 'workers', label: 'Workers', icon: '👷' },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function Sidebar({
  robots, bins, reports, workers, onMarkResolved,
  onRobotModeToggle, onRobotDispatchClick, dispatchTargetRobotId,
  onMarkBinEmptied, onRequestBinPickup,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('robots');

  const counts: Record<Tab, number> = {
    robots:  robots.filter((r) => r.status !== 'docked').length,
    bins:    bins.filter((b) => b.fillLevel >= 90).length,
    tasks:   reports.filter((r) => r.status === 'pending').length,
    workers: workers.filter((w) => w.status === 'idle').length,
  };

  const isAlert = (id: Tab) => id === 'bins' || id === 'tasks';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#faf9f7' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #e8e4df', background: 'white', flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '12px 4px', border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#c87941' : 'transparent'}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              position: 'relative', transition: 'border-color 0.15s',
            }}
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: activeTab === tab.id ? '#c87941' : '#9c9488' }}>
              {tab.label}
            </span>
            {counts[tab.id] > 0 && (
              <span style={{
                position: 'absolute', top: 5, right: 6,
                background: isAlert(tab.id) ? '#e53935' : '#6c7bb5',
                color: 'white', borderRadius: 10, fontSize: 9, fontWeight: 700,
                padding: '1px 5px', lineHeight: 1.4, minWidth: 14, textAlign: 'center',
              }}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'robots' && (
          <RobotFleet
            robots={robots}
            onModeToggle={onRobotModeToggle}
            onDispatchClick={onRobotDispatchClick}
            dispatchTargetRobotId={dispatchTargetRobotId}
          />
        )}
        {activeTab === 'bins' && (
          <BinQueue
            bins={bins}
            onMarkEmptied={onMarkBinEmptied}
            onRequestPickup={onRequestBinPickup}
          />
        )}
        {activeTab === 'tasks'   && <TaskQueue reports={reports} onMarkResolved={onMarkResolved} />}
        {activeTab === 'workers' && <WorkerStatus workers={workers} />}
      </div>
    </div>
  );
}