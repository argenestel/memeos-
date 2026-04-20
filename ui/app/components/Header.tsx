"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const TICKERS = [
  { t: "CWH", v: "+412%", up: true },
  { t: "PGAINS", v: "-8%", up: false },
  { t: "SDM", v: "+2100%", up: true },
  { t: "WOJAK", v: "+88%", up: true },
  { t: "NPC", v: "-14%", up: false },
  { t: "BONK2", v: "+320%", up: true },
  { t: "FROG", v: "+67%", up: true },
  { t: "BBDOGE", v: "-22%", up: false },
  { t: "SHIB3", v: "+890%", up: true },
];

export function Header({
  activePersona,
  onPersonaChange,
}: {
  activePersona: string;
  onPersonaChange: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => setMounted(true), []);

  const doubled = [...TICKERS, ...TICKERS];

  return (
    <header
      style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Main nav */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "var(--orange)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontSize: "16px", lineHeight: 1 }}>
              🐸
            </span>
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
            }}
          >
            MemeOS
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--orange)",
              background: "var(--orange-bg)",
              padding: "2px 7px",
              borderRadius: "99px",
            }}
          >
            LIVE
          </span>
        </div>

        {/* Persona pills — center */}
        <nav
          style={{
            display: "flex",
            gap: "4px",
            background: "var(--bg-2)",
            padding: "4px",
            borderRadius: "10px",
          }}
        >
          {[
            { id: "all", label: "All", emoji: "" },
            { id: "degen", label: "Degen", emoji: "🦍" },
            { id: "doomer", label: "Doomer", emoji: "📉" },
            { id: "moonboy", label: "Moonboy", emoji: "🚀" },
            { id: "boomer", label: "Boomer", emoji: "👴" },
          ].map((p) => {
            const active = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPersonaChange(p.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "7px",
                  border: "none",
                  background: active ? "var(--white)" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-3)",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {p.emoji && <span style={{ fontSize: "13px" }}>{p.emoji}</span>}
                {p.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <ConnectButton />
          {/* <button */}
          {/*   onClick={() => setConnected((c) => !c)} */}
          {/*   className="btn" */}
          {/*   style={{ */}
          {/*     background: connected ? "var(--orange-bg)" : "var(--orange)", */}
          {/*     color: connected ? "var(--orange)" : "white", */}
          {/*     border: connected ? "1px solid rgba(249,115,22,0.25)" : "none", */}
          {/*     fontSize: "13px", */}
          {/*     padding: "7px 16px", */}
          {/*   }} */}
          {/* > */}
          {/*   {connected ? "0xDEAD…BEEF" : "Connect Wallet"} */}
          {/* </button> */}
        </div>
      </div>

      {/* Ticker strip */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          overflow: "hidden",
          height: "32px",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "48px",
            background: "linear-gradient(to right, var(--bg), transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "48px",
            background: "linear-gradient(to left, var(--bg), transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div
          className="ticker"
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            height: "100%",
          }}
        >
          {doubled.map((c, i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "0 18px",
                fontSize: "12px",
                height: "100%",
                borderRight: "1px solid var(--border)",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>
                ${c.t}
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: c.up ? "var(--green)" : "var(--red)",
                  fontSize: "11px",
                }}
              >
                {c.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
