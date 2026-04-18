"use client";

import { useEffect, useRef } from "react";
import { useCompletion } from "@ai-sdk/react";

export type CardData = {
  id: string;
  coinName: string;
  ticker: string;
  launchTime: string;
  marketCap: string;
  liquidity: string;
  persona: string;
  take: string;
  isBullish: boolean;
  needsGeneration?: boolean;
};

const PERSONAS: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  degen:   { emoji: "🦍", label: "Degen",   color: "#f97316", bg: "#fff7ed" },
  doomer:  { emoji: "📉", label: "Doomer",  color: "#ef4444", bg: "#fef2f2" },
  moonboy: { emoji: "🚀", label: "Moonboy", color: "#f59e0b", bg: "#fef3c7" },
  boomer:  { emoji: "👴", label: "Boomer",  color: "#3b82f6", bg: "#eff6ff" },
};

function formatLaunchAge(ts: string) {
  return ts;
}

export function CommentaryCard({ data, index }: { data: CardData; index: number }) {
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/completion",
    body: { persona: data.persona },
  });

  const started = useRef(false);
  useEffect(() => {
    if (data.needsGeneration && !started.current) {
      started.current = true;
      complete(`Coin: ${data.coinName} (${data.ticker}). MC: ${data.marketCap}. Liquidity: ${data.liquidity}. Launch: ${data.launchTime}.`);
    }
  }, [data, complete]);

  const p = PERSONAS[data.persona] ?? PERSONAS.degen!;
  const displayTake = data.needsGeneration ? completion || "" : data.take;

  return (
    <div
      className="card fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "16px 16px 12px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        {/* Coin avatar */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: p.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "18px",
          }}
        >
          {data.ticker.slice(0, 1)}
        </div>

        {/* Coin info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "3px",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--ink)" }}>
              {data.coinName}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--ink-3)",
                background: "var(--bg-2)",
                padding: "1px 6px",
                borderRadius: "4px",
              }}
            >
              ${data.ticker}
            </span>
            <span
              className="tag"
              style={{
                color: data.isBullish ? "var(--green)" : "var(--red)",
                background: data.isBullish ? "var(--green-bg)" : "var(--red-bg)",
                fontSize: "10px",
              }}
            >
              {data.isBullish ? "▲" : "▼"} {data.isBullish ? "Bullish" : "Bearish"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--ink-4)" }}>
            <span>{data.launchTime}</span>
            <span>MC {data.marketCap}</span>
            <span>Liq {data.liquidity}</span>
          </div>
        </div>

        {/* Live dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#22c55e",
            flexShrink: 0,
            marginTop: "4px",
            boxShadow: "0 0 0 2px rgba(34,197,94,0.2)",
          }}
        />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", margin: "0 16px" }} />

      {/* Persona + take */}
      <div style={{ padding: "12px 16px 14px" }}>
        {/* Persona label */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 10px",
            borderRadius: "99px",
            background: p.bg,
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "12px" }}>{p.emoji}</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: p.color }}>{p.label}</span>
        </div>

        {/* AI Commentary */}
        <div style={{ minHeight: "44px" }}>
          {displayTake ? (
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--ink-2)",
                margin: 0,
              }}
            >
              {displayTake}
              {isLoading && (
                <span
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "14px",
                    background: p.color,
                    marginLeft: "2px",
                    verticalAlign: "middle",
                    borderRadius: "1px",
                    animation: "dot-bounce 1s 0s ease-in-out infinite",
                  }}
                />
              )}
            </p>
          ) : (
            <div style={{ display: "flex", gap: "4px", alignItems: "center", paddingTop: "4px" }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "4px",
                    height: "18px",
                    borderRadius: "2px",
                    background: p.color,
                    opacity: 0.5,
                    animation: `dot-bounce 1s ${i * 0.15}s ease-in-out infinite`,
                  }}
                />
              ))}
              <span style={{ fontSize: "13px", color: "var(--ink-4)", marginLeft: "6px" }}>
                Generating take…
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Reactions */}
        <div style={{ display: "flex", gap: "2px" }}>
          {[
            { icon: "💬", count: "12" },
            { icon: "🔁", count: "8"  },
            { icon: "↗", count: "Share" },
          ].map(({ icon, count }) => (
            <button
              key={count}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                color: "var(--ink-4)",
                padding: "5px 8px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "inherit",
                fontWeight: 500,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-2)";
                (e.currentTarget as HTMLElement).style.color = "var(--ink-2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "none";
                (e.currentTarget as HTMLElement).style.color = "var(--ink-4)";
              }}
            >
              <span>{icon}</span>
              <span>{count}</span>
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ fontSize: "12px", padding: "6px 14px" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#ea6c0a"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--orange)"; }}
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
