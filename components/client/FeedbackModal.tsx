"use client";

import { useState } from "react";

interface Props {
  incidentId: string;
  onDismiss: () => void;
  onSubmit?: (feedback: { incidentId: string; rating: number; comment: string; createdAt: number }) => void;
}

export default function FeedbackModal({ incidentId, onDismiss, onSubmit }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  function handleSubmit() {
    if (!rating) return;
    onSubmit?.({ incidentId, rating, comment, createdAt: Date.now() });
    setSubmitted(true);
    setTimeout(onDismiss, 1800);
  }

  // ... rest of JSX unchanged

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,23,20,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 24,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
      >
        {submitted ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
            <h3
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: "#1a1714",
                margin: "0 0 8px",
              }}
            >
              Thanks for your feedback!
            </h3>
            <p style={{ fontSize: 14, color: "#7a7167", margin: 0 }}>
              Your rating helps us improve.
            </p>
          </>
        ) : (
          <>
            <button
              onClick={onDismiss}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#9c9488",
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>

            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#fff8f3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 24,
              }}
            >
              ✦
            </div>

            <h3
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: "#1a1714",
                margin: "0 0 6px",
              }}
            >
              How did we do?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#7a7167",
                margin: "0 0 24px",
              }}
            >
              Rate the response to your report{" "}
              <span style={{ fontWeight: 500, color: "#c87941" }}>
                {incidentId}
              </span>
            </p>

            {/* Star rating */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 32,
                    padding: "0 2px",
                    transition: "transform 0.1s",
                    transform:
                      (hovered ?? rating ?? 0) >= star
                        ? "scale(1.15)"
                        : "scale(1)",
                    color:
                      (hovered ?? rating ?? 0) >= star ? "#f59e0b" : "#e8e4df",
                  }}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Any comments? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #e8e4df",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#1a1714",
                resize: "none",
                height: 72,
                boxSizing: "border-box",
                outline: "none",
                marginBottom: 16,
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={!rating}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background: rating ? "#c87941" : "#e8e4df",
                color: rating ? "white" : "#9c9488",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                cursor: rating ? "pointer" : "default",
                transition: "all 0.15s",
              }}
            >
              Submit rating
            </button>
          </>
        )}
      </div>
    </div>
  );
}