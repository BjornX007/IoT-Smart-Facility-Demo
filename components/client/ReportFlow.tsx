"use client";

import { useState } from "react";
import MiniMap from "./MiniMap";
import type { ReportStatus, ReportType, Urgency, Zone } from "@/types";

const ISSUE_TYPES = [
  { id: "spill",    label: "Spill / Wet floor",   icon: "💧" },
  { id: "smell",    label: "Bad smell",            icon: "🌬️" },
  { id: "broken",   label: "Broken equipment",     icon: "🔧" },
  { id: "bin",      label: "Bin overflow",         icon: "🗑️" },
  { id: "restroom", label: "Restroom issue",       icon: "🚻" },
];

interface Props {
  onSubmitted: (trackingId: string) => void;
}

export default function ReportFlow({ onSubmitted }: Props) {
  const [step, setStep]           = useState(1);
  const [terminal, setTerminal]   = useState<"A" | "B" | null>(null);
  const [floor, setFloor]         = useState<0 | 1>(0);
  const [zoneId, setZoneId]       = useState<string | null>(null);
  const [issueType, setIssueType] = useState<string | null>(null);
  const [note, setNote]           = useState("");
  const [trackingId, setTrackingId] = useState("");

  const terminalId = terminal === "A" ? "TMA" : "TMB";

  const canNext =
    (step === 1 && terminal) ||
    (step === 2 && zoneId)   ||
    (step === 3 && issueType);

 function handleSubmit() {
  if (!terminal || !zoneId || !issueType) return;
  const id = "RPT-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  
  const report = {
    id,
    type: issueType as ReportType,
    urgency: "medium" as Urgency,
    zoneId,
    zoneName: zoneId,
    terminalId: terminal === "A" ? "TMA" : "TMB",
    floor: floor,
    description: note || issueType,
    status: "pending" as ReportStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
    assignedRobotId: null,
    assignedWorkerId: null,
    trackingCode: id,
  };

  const existing = JSON.parse(localStorage.getItem("aero_reports") ?? "[]");
  localStorage.setItem("aero_reports", JSON.stringify([...existing, report]));

  setTrackingId(id);
  setStep(4);
  onSubmitted(id);
}

  const stepStyle = (n: number) => ({
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 600,
    background: step >= n ? "#c87941" : "#f0ede8",
    color: step >= n ? "white" : "#9c9488",
    transition: "all 0.2s",
  });

  return (
    <div>
      {/* Progress bar */}
      <div style={{ padding: "18px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
        {["Terminal", "Zone", "Issue", "Done"].map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={stepStyle(i + 1)}>{i + 1}</div>
            <span style={{ fontSize: 12, color: step === i + 1 ? "#1a1714" : "#9c9488", fontWeight: step === i + 1 ? 500 : 400 }}>
              {label}
            </span>
            {i < 3 && (
              <div style={{ flex: 1, height: 1, background: step > i + 1 ? "#c87941" : "#e8e4df", width: 20, transition: "background 0.3s" }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: "24px 24px 28px" }}>

        {/* Step 1 — Terminal */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 600, color: "#1a1714", margin: "0 0 6px" }}>
              Which terminal are you in?
            </h2>
            <p style={{ fontSize: 14, color: "#7a7167", margin: "0 0 24px" }}>
              Select the terminal where the issue is located.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {(["A", "B"] as const).map((t) => (
                <button key={t} onClick={() => setTerminal(t)}
                  style={{ flex: 1, padding: "20px 0", borderRadius: 12,
                    border: `2px solid ${terminal === t ? "#c87941" : "#e8e4df"}`,
                    background: terminal === t ? "#fff8f3" : "white",
                    cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 700, color: terminal === t ? "#c87941" : "#1a1714" }}>
                    {t}
                  </div>
                  <div style={{ fontSize: 12, color: "#9c9488", marginTop: 4 }}>
                    {t === "A" ? "International" : "Domestic"}
                  </div>
                </button>
              ))}
            </div>

            {/* Floor picker */}
            {terminal && (
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                {([0, 1] as const).map((f) => (
                  <button key={f} onClick={() => setFloor(f)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10,
                      border: `1.5px solid ${floor === f ? "#6c7bb5" : "#e8e4df"}`,
                      background: floor === f ? "#f0f2fb" : "white",
                      fontSize: 13, fontWeight: 500,
                      color: floor === f ? "#6c7bb5" : "#7a7167", cursor: "pointer" }}>
                    {f === 0 ? "Departures" : "Arrivals"}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Zone */}
        {step === 2 && terminal && (
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 600, color: "#1a1714", margin: "0 0 6px" }}>
              Where exactly?
            </h2>
            <p style={{ fontSize: 14, color: "#7a7167", margin: "0 0 20px" }}>
              Tap the zone on the map.
            </p>
            <MiniMap
              terminalId={terminalId}
              floor={floor}
              selectedZoneId={zoneId}
              onZoneClick={(zone: Zone) => setZoneId(zone.id)}
            />
          </div>
        )}

        {/* Step 3 — Issue type */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 600, color: "#1a1714", margin: "0 0 6px" }}>
              What's the issue?
            </h2>
            <p style={{ fontSize: 14, color: "#7a7167", margin: "0 0 20px" }}>Choose the best description.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ISSUE_TYPES.map((issue) => (
                <button key={issue.id} onClick={() => setIssueType(issue.id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10,
                    border: `1.5px solid ${issueType === issue.id ? "#c87941" : "#e8e4df"}`,
                    background: issueType === issue.id ? "#fff8f3" : "white",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <span style={{ fontSize: 22 }}>{issue.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: issueType === issue.id ? "#c87941" : "#1a1714" }}>
                    {issue.label}
                  </span>
                </button>
              ))}
            </div>
            <textarea placeholder="Add a note (optional)..." value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: "100%", marginTop: 16, padding: "12px 14px", borderRadius: 10,
                border: "1px solid #e8e4df", fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: "#1a1714", resize: "none", height: 80,
                boxSizing: "border-box", outline: "none" }} />
          </div>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#edf7f1",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 28 }}>✓</div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 600, color: "#1a1714", margin: "0 0 8px" }}>
              Report received
            </h2>
            <p style={{ fontSize: 14, color: "#7a7167", margin: "0 0 20px" }}>
              Our team has been notified and a cleaner is on the way.
            </p>
            <div style={{ display: "inline-block", padding: "10px 20px", background: "#f5f1eb",
              borderRadius: 8, fontFamily: "monospace", fontSize: 18, fontWeight: 700,
              color: "#c87941", letterSpacing: 2 }}>
              {trackingId}
            </div>
            <p style={{ fontSize: 12, color: "#9c9488", marginTop: 10 }}>Your tracking reference</p>
            <button onClick={() => { setStep(1); setTerminal(null); setZoneId(null); setIssueType(null); setNote(""); }}
              style={{ marginTop: 16, padding: "10px 24px", borderRadius: 8,
                border: "1px solid #e8e4df", background: "white", fontSize: 14, color: "#7a7167", cursor: "pointer" }}>
              Report another issue
            </button>
          </div>
        )}

        {/* Nav buttons */}
        {step < 4 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
              style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e8e4df",
                background: "white", fontSize: 14, color: step === 1 ? "#c5bfb8" : "#7a7167",
                cursor: step === 1 ? "default" : "pointer" }}>
              ← Back
            </button>
            <button onClick={() => step === 3 ? handleSubmit() : setStep((s) => s + 1)} disabled={!canNext}
              style={{ padding: "10px 24px", borderRadius: 8, border: "none",
                background: canNext ? "#c87941" : "#e8e4df",
                color: canNext ? "white" : "#9c9488",
                fontSize: 14, fontWeight: 500,
                cursor: canNext ? "pointer" : "default", transition: "all 0.15s" }}>
              {step === 3 ? "Submit report" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}