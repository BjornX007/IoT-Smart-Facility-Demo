'use client';
import { useState, type JSX } from 'react';
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
  onAssignWorker?: (binId: string, zoneId: string, workerId: string) => void;
}

// --- Icons (inline SVG, no emoji font dependency) ---
function IconBot() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 16h.01M16 16h.01" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const TABS: { id: 'robots' | 'bins' | 'tasks' | 'workers'; label: string; Icon: () => JSX.Element }[] = [
  { id: 'robots',  label: 'Robots',  Icon: IconBot },
  { id: 'bins',    label: 'Bins',    Icon: IconTrash },
  { id: 'tasks',   label: 'Tasks',   Icon: IconClipboard },
  { id: 'workers', label: 'Workers', Icon: IconUsers },
];

type Tab = (typeof TABS)[number]['id'];

export default function Sidebar({
  robots, bins, reports, workers, onMarkResolved,
  onRobotModeToggle, onRobotDispatchClick, dispatchTargetRobotId,
  onMarkBinEmptied, onAssignWorker,
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
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex: 1, padding: '12px 4px', border: 'none',
              borderBottom: `2px solid ${activeTab === id ? '#c87941' : 'transparent'}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              position: 'relative', transition: 'border-color 0.15s',
              color: activeTab === id ? '#c87941' : '#9c9488',
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, fontWeight: 500, color: activeTab === id ? '#c87941' : '#9c9488' }}>
              {label}
            </span>
            {counts[id] > 0 && (
              <span style={{
                position: 'absolute', top: 5, right: 6,
                background: isAlert(id) ? '#e53935' : '#6c7bb5',
                color: 'white', borderRadius: 10, fontSize: 9, fontWeight: 700,
                padding: '1px 5px', lineHeight: 1.4, minWidth: 14, textAlign: 'center',
              }}>
                {counts[id]}
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
            workers={workers}
            onMarkEmptied={onMarkBinEmptied}
            onAssignWorker={onAssignWorker}
          />
        )}
        {activeTab === 'tasks'   && <TaskQueue reports={reports} onMarkResolved={onMarkResolved} />}
        {activeTab === 'workers' && <WorkerStatus workers={workers} />}
      </div>
    </div>
  );
}