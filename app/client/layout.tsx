import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AeroClean — Report an Issue",
  description: "Quick and easy facility reporting for passengers.",
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #f0ede8",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8, background: "#c87941",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontSize: 16 }}>✦</span>
          </div>
          <span
            style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 600,
              fontSize: 16, color: "#1a1714", letterSpacing: "-0.3px",
            }}
          >
            AeroClean
          </span>
        </div>
        <span
          style={{
            fontSize: 12, color: "#9c9488", fontWeight: 500,
            letterSpacing: "0.5px", textTransform: "uppercase",
          }}
        >
          Passenger Services
        </span>
      </header>

      {children}
    </>
  );
}