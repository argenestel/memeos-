"use client";

import { useState } from "react";

const PERSONAS = [
  { id: "degen",   emoji: "🦍", name: "The Degen",   desc: "Apes everything. Max risk.",         color: "#f97316", bg: "#fff7ed", calls: 142, win: "68%", roi: "+2.3x" },
  { id: "doomer",  emoji: "📉", name: "The Doomer",  desc: "It's all a rug. Trust nothing.",    color: "#ef4444", bg: "#fef2f2", calls: 98,  win: "41%", roi: "-0.4x" },
  { id: "moonboy", emoji: "🚀", name: "Moonboy",     desc: "1000x minimum. Diamond hands.",     color: "#f59e0b", bg: "#fef3c7", calls: 211, win: "23%", roi: "+8.1x" },
  { id: "boomer",  emoji: "👴", name: "The Boomer",  desc: "What even is a gas fee?",           color: "#3b82f6", bg: "#eff6ff", calls: 54,  win: "55%", roi: "+0.8x" },
];

const TRENDING = [
  { t: "CWH",   ch: "+412%", mc: "$12K",  up: true  },
  { t: "WOJAK", ch: "+88%",  mc: "$22K",  up: true  },
  { t: "BONK2", ch: "+320%", mc: "$180K", up: true  },
  { t: "SHIB3", ch: "+890%", mc: "$45K",  up: true  },
  { t: "FROG",  ch: "+67%",  mc: "$9K",   up: true  },
];

const RUGGED = [
  { t: "RUGPULL", ch: "-97%", lost: "$12K" },
  { t: "NPC",     ch: "-14%", lost: "$2K"  },
  { t: "BBDOGE",  ch: "-22%", lost: "$5K"  },
];

export function Sidebar({
  activePersona,
  onPersonaChange,
}: {
  activePersona: string;
  onPersonaChange: (id: string) => void;
}) {
  return (
    <aside
      style={{
        width: "260px",
        flexShrink: 0,
        padding: "24px 0 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Persona cards */}
      <section>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
            marginBottom: "10px",
          }}
        >
          Personas
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {PERSONAS.map((p) => {
            const active = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPersonaChange(p.id)}
                style={{
                  background: active ? "var(--white)" : "transparent",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  borderRadius: "10px",
                  padding: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  boxShadow: active ? "var(--shadow-sm)" : "none",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.02)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: p.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {p.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: active ? p.color : "var(--ink)",
                      }}
                    >
                      {p.name}
                    </span>
                    {active && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: p.color,
                          background: p.bg,
                          padding: "1px 6px",
                          borderRadius: "99px",
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--ink-4)" }}>{p.desc}</span>
                  {active && (
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      {[["Calls", p.calls], ["Win", p.win], ["ROI", p.roi]].map(([label, val]) => (
                        <div key={label as string}>
                          <div style={{ fontSize: "10px", color: "var(--ink-4)" }}>{label}</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                            {val}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
            marginBottom: "10px",
          }}
        >
          Trending 🔥
        </p>
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {TRENDING.map((t, i) => (
            <div
              key={t.t}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 12px",
                borderBottom: i < TRENDING.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--ink-4)", width: "14px" }}>{i + 1}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>${t.t}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)" }}>{t.ch}</div>
                <div style={{ fontSize: "10px", color: "var(--ink-4)" }}>{t.mc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rugged */}
      <section>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
            marginBottom: "10px",
          }}
        >
          Rugged Today 💀
        </p>
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {RUGGED.map((t, i) => (
            <div
              key={t.t}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 12px",
                borderBottom: i < RUGGED.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--red)" }}>${t.t}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--red)" }}>{t.ch}</div>
                <div style={{ fontSize: "10px", color: "var(--ink-4)" }}>{t.lost} lost</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
