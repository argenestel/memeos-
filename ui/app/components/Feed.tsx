"use client";

import { useEffect, useState } from "react";
import { CommentaryCard, type CardData } from "./CommentaryCard";

const COIN_POOL: Omit<CardData, "id">[] = [
  { coinName: "CatWifHat",    ticker: "CWH",    launchTime: "Just now", marketCap: "$12K",  liquidity: "$4K",  persona: "degen",   take: "", isBullish: true,  needsGeneration: true },
  { coinName: "PepeGains",    ticker: "PGAINS", launchTime: "2m ago",   marketCap: "$8K",   liquidity: "$2K",  persona: "doomer",  take: "", isBullish: false, needsGeneration: true },
  { coinName: "SafeDogeMoon", ticker: "SDM",    launchTime: "5m ago",   marketCap: "$50K",  liquidity: "$1K",  persona: "moonboy", take: "", isBullish: false, needsGeneration: true },
  { coinName: "WojakFinance", ticker: "WOJAK",  launchTime: "8m ago",   marketCap: "$22K",  liquidity: "$6K",  persona: "boomer",  take: "", isBullish: true,  needsGeneration: true },
  { coinName: "NPC Coin",     ticker: "NPC",    launchTime: "11m ago",  marketCap: "$3K",   liquidity: "$800", persona: "degen",   take: "", isBullish: true,  needsGeneration: true },
];

export function Feed({ activePersona }: { activePersona: string }) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [scanning, setScanning] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    let idx = 0;
    const id = setInterval(() => {
      if (idx < COIN_POOL.length) {
        const raw = COIN_POOL[idx]!;
        setCards((prev) => [{ ...raw, id: String(Date.now() + idx) }, ...prev]);
        setScanCount((c) => c + 1);
        idx++;
      } else {
        setScanning(false);
        clearInterval(id);
      }
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const filtered =
    activePersona === "all"
      ? cards
      : cards.filter((c) => c.persona === activePersona);

  return (
    <div style={{ flex: 1, minWidth: 0, padding: "24px" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "2px",
            }}
          >
            Live Feed
          </h2>
          <p style={{ fontSize: "12px", color: "var(--ink-4)" }}>
            {scanning ? (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--green)",
                    display: "inline-block",
                    animation: "dot-bounce 1s ease-in-out infinite",
                  }}
                />
                Scanning Four.meme…
              </span>
            ) : (
              `${cards.length} coins scanned`
            )}
          </p>
        </div>

        <span
          style={{
            fontSize: "12px",
            color: "var(--ink-3)",
            background: "var(--bg-2)",
            padding: "4px 10px",
            borderRadius: "6px",
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((card, i) => (
          <CommentaryCard key={card.id} data={card} index={i} />
        ))}

        {cards.length === 0 && (
          <EmptyState />
        )}

        {cards.length > 0 && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "var(--ink-4)",
              fontSize: "14px",
            }}
          >
            No takes from <strong>{activePersona}</strong> yet. Check back soon.
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div style={{ fontSize: "36px" }}>🔍</div>
      <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink-2)" }}>
        Scanning for new launches…
      </p>
      <p style={{ fontSize: "13px", color: "var(--ink-4)", maxWidth: "280px" }}>
        Our AI is monitoring Four.meme in real time. Coins will appear as they launch.
      </p>
    </div>
  );
}
