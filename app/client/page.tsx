"use client";

import { useState } from "react";
import ReportFlow from "@/components/client/ReportFlow";
import FeedbackModal from "@/components/client/FeedbackModal";

export default function ClientPage() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [resolvedIncidentId, setResolvedIncidentId] = useState<string | null>(
    null
  );

  const handleReportSubmitted = (trackingId: string) => {
    // Store tracking ID so feedback modal can reference it
    setResolvedIncidentId(trackingId);
  };

  const handleFeedbackDismiss = () => {
    setShowFeedback(false);
    setResolvedIncidentId(null);
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 61px)",
        background: "linear-gradient(180deg, #ffffff 0%, #faf8f5 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px 80px",
      }}
    >
      {/* Hero heading */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 40,
          maxWidth: 480,
        }}
      >
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: "#1a1714",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
            lineHeight: 1.25,
          }}
        >
          Report a facility issue
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#7a7167",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Our team will respond within minutes. Track your report with a
          confirmation code.
        </p>
      </div>

      {/* Step-by-step report wizard */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #ede9e3",
          boxShadow: "0 2px 24px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <ReportFlow onSubmitted={handleReportSubmitted} />
      </div>

      {/* Step indicator legend */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {["Terminal", "Zone", "Issue", "Confirm"].map((label, i) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#f0ede8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "#9c9488",
              }}
            >
              {i + 1}
            </div>
            <span style={{ fontSize: 12, color: "#9c9488" }}>{label}</span>
            {i < 3 && (
              <span style={{ color: "#d4cfc8", fontSize: 12 }}>—</span>
            )}
          </div>
        ))}
      </div>

      {/* Feedback modal — shown after a resolved incident */}
      {showFeedback && resolvedIncidentId && (
        <FeedbackModal
          incidentId={resolvedIncidentId}
          onDismiss={handleFeedbackDismiss}
        />
      )}
    </main>
  );
}