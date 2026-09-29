
"use client"

import Link from "next/link";
import { useRef } from "react";
function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconQr() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3M14 21h3M21 14v3M21 21h.01" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function IconRadio() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-8.49a6 6 0 0 0 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  );
}

function IconBot() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 16h.01M16 16h.01" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function HomePage() {
    const heroTextRef = useRef<HTMLElement | null>(null);
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f5f1",
        fontFamily: "'DM Sans', sans-serif",
        color: "#2d2418",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          height: 72,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e0d8",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "#c87941",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 5px 15px rgba(200,121,65,0.25)",
            }}
          >
            <IconRadio />
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.1,
              }}
            >
              Smart Facility
            </div>

            <div
              style={{
                fontSize: 10,
                color: "#9b9184",
                marginTop: 3,
              }}
            >
              IoT Facility Management
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "7px 12px",
            borderRadius: 20,
            background: "#f2eee8",
            color: "#7b6d5b",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          SIMULIERTE PLATTFORM
        </div>
      </header>

      {/* VIDEO HERO */}
      <section
        style={{
          padding: "38px 24px 0",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 8.5",
            minHeight: 300,
            maxHeight: 680,
            borderRadius: 24,
            overflow: "hidden",
            background: "#171411",
            boxShadow: "0 25px 70px rgba(45,36,24,0.18)",
          }}
        >
         <video
  src="/smartFacility.mp4"
  autoPlay
  playsInline
  controls
  onEnded={() => {
    heroTextRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  }}
/>

          {/* Video label */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              padding: "8px 12px",
              borderRadius: 10,
              background: "rgba(20,17,14,0.72)",
              backdropFilter: "blur(8px)",
              color: "white",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.02em",
              pointerEvents: "none",
            }}
          >
            SMART FACILITY · LIVE DEMO
          </div>
        </div>
      </section>

      {/* HERO TEXT */}
      <section
  ref={heroTextRef}
  style={{
    maxWidth: 850,
          margin: "0 auto",
          padding: "70px 24px 45px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 12px",
            borderRadius: 30,
            background: "#eee9e1",
            color: "#8a745a",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginBottom: 22,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#5d9b68",
            }}
          />
          FACILITY MANAGEMENT PLATFORM
        </div>

        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(34px, 6vw, 62px)",
            lineHeight: 1.08,
            letterSpacing: "-0.045em",
            margin: "0 0 22px",
          }}
        >
          Belegung, Reinigung
          <br />
          <span style={{ color: "#c87941" }}>
            und Störungen.
          </span>
          <br />
          Alles in einer Ansicht.
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "#695d4d",
            lineHeight: 1.7,
            maxWidth: 670,
            margin: "0 auto",
          }}
        >
          Sensordaten, Roboter-Disposition und Vor-Ort-Meldungen
          laufen in einem System zusammen — entwickelt für große
          Anlagen wie Flughäfen, Bahnhöfe und Bürogebäude.
        </p>
      </section>

      {/* ACTION BUTTONS */}
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {/* ADMIN */}
          <Link
            href="/admin"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                minHeight: 150,
                padding: 24,
                borderRadius: 18,
                background: "#2d2418",
                color: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 12px 30px rgba(45,36,24,0.16)",
                transition: "transform 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconGrid />
                </div>

                <IconArrowRight />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    marginBottom: 5,
                  }}
                >
                  Admin-Dashboard
                </div>

                <div
                  style={{
                    color: "#bdb4a7",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                  }}
                >
                  Anlagen überwachen, Zonen verwalten und
                  Roboter disponieren.
                </div>
              </div>
            </div>
          </Link>

          {/* CLIENT */}
          <Link
            href="/client"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                minHeight: 150,
                padding: 24,
                borderRadius: 18,
                background: "white",
                border: "1px solid #ded8cf",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 8px 25px rgba(45,36,24,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#f5eee7",
                    color: "#c87941",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconQr />
                </div>

                <IconArrowRight />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    marginBottom: 5,
                  }}
                >
                  Störung melden
                </div>

                <div
                  style={{
                    color: "#807466",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                  }}
                >
                  Problem direkt vor Ort über einen
                  QR-Code melden.
                </div>
              </div>
            </div>
          </Link>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11.5,
            color: "#a19586",
            marginTop: 16,
          }}
        >
          Wähle eine Ansicht, um die Plattform auszuprobieren.
        </p>
      </section>

      {/* FEATURES */}
      <section
        style={{
          background: "#eeeae4",
          borderTop: "1px solid #e2ddd5",
          borderBottom: "1px solid #e2ddd5",
          padding: "75px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              marginBottom: 35,
            }}
          >
            <div
              style={{
                color: "#c87941",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              EIN SYSTEM
            </div>

            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(25px, 4vw, 34px)",
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              Alles, was eine Anlage braucht.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {[
              {
                Icon: IconRadio,
                title: "Sensorik",
                text: "Bewegungs- und Füllstandssensoren liefern Live-Daten je Zone.",
              },
              {
                Icon: IconBot,
                title: "Roboter-Disposition",
                text: "Automatische oder manuelle Steuerung abhängig von der Priorität.",
              },
              {
                Icon: IconTrash,
                title: "Meldungen",
                text: "Füllstände und Vor-Ort-Meldungen fließen direkt in die Priorisierung ein.",
              },
            ].map(({ Icon, title, text }) => (
              <div
                key={title}
                style={{
                  padding: 22,
                  borderRadius: 16,
                  background: "white",
                  border: "1px solid #dfdad2",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#f6eee7",
                    color: "#c87941",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon />
                </div>

                <div
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  {title}
                </div>

                <div
                  style={{
                    fontSize: 12.5,
                    color: "#776b5d",
                    lineHeight: 1.6,
                  }}
                >
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "28px 24px",
          textAlign: "center",
          color: "#9a8f80",
          fontSize: 11.5,
        }}
      >
        Smart Facility · Simuliertes Projekt · Sensor- und Roboterebene
        in Software nachgebildet.
      </footer>
    </main>
  );
}