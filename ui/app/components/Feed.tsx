"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  formatCap,
  formatIncrease,
  formatProgress,
  imgUrl,
  type FourMemeToken,
} from "@/lib/fourmeme";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Share2,
  Users,
  RefreshCw,
} from "lucide-react";

// ── Persona meta ─────────────────────────────────────────────────────────────

const PERSONA_META: Record<string, { emoji: string; label: string; color: string }> = {
  degen:   { emoji: "🦍", label: "The Degen",  color: "var(--orange)" },
  doomer:  { emoji: "📉", label: "The Doomer", color: "var(--red)"    },
  moonboy: { emoji: "🚀", label: "Moonboy",    color: "#f59e0b"       },
  boomer:  { emoji: "👴", label: "The Boomer", color: "#3b82f6"       },
};

function timeAgo(ms: number): string {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── Single token card ─────────────────────────────────────────────────────────

function TokenCard({
  token,
  persona,
}: {
  token: FourMemeToken;
  persona: string;
}) {
  const p = PERSONA_META[persona] ?? PERSONA_META.degen;
  const bullish = parseFloat(token.increase) >= 0;
  const progress = formatProgress(token.progress);

  const { object, submit, isLoading, error } = useObject({
    api: "/api/completion",
    schema: z.object({
      take: z.string(),
    }),
  });

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const ctx = [
      `Name: ${token.name} (${token.shortName})`,
      `Market Cap: ${formatCap(token.cap)}`,
      `24h change: ${formatIncrease(token.increase)}`,
      `Holders: ${token.hold}`,
      `Bonding curve: ${progress}%`,
      `Volume: $${parseFloat(token.day1Vol ?? "0").toFixed(0)}`,
    ].join(", ");
    submit({ persona, prompt: ctx });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="card"
      style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* ── Header ─ */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {token.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl(token.img)}
              alt={token.name}
              width={44}
              height={44}
              style={{
                width: 44, height: 44, borderRadius: "10px",
                objectFit: "cover", background: "var(--bg-2)",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: "10px",
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, color: "white", fontSize: "16px",
            }}>
              {token.shortName.slice(0, 1)}
            </div>
          )}
          <span style={{
            position: "absolute", bottom: -4, right: -4,
            fontSize: "9px", fontWeight: 700,
            background: "#f0b90b", color: "#000",
            padding: "1px 4px", borderRadius: "4px",
          }}>BSC</span>
        </div>

        {/* Name + stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center",
            gap: "6px", flexWrap: "wrap",
          }}>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--ink)" }}>
              {token.name}
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "var(--ink-3)",
              background: "var(--bg-2)", padding: "1px 6px", borderRadius: "99px",
            }}>
              ${token.shortName}
            </span>
            <span
              className="tag"
              style={{ background: "var(--green-bg)", color: "var(--green)", marginLeft: "auto" }}
            >
              LIVE
            </span>
          </div>
          <div style={{
            display: "flex", gap: "12px", marginTop: "4px", flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>
              MC{" "}
              <strong style={{ color: "var(--ink-2)" }}>{formatCap(token.cap)}</strong>
            </span>
            <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>
              Vol{" "}
              <strong style={{ color: "var(--ink-2)" }}>
                ${parseFloat(token.day1Vol ?? "0").toLocaleString("en", { maximumFractionDigits: 0 })}
              </strong>
            </span>
            <span style={{
              fontSize: "12px", color: "var(--ink-4)",
              display: "flex", alignItems: "center", gap: "2px",
            }}>
              <Users size={11} /> {token.hold}
            </span>
            <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>
              {timeAgo(parseInt(token.createDate))}
            </span>
          </div>
        </div>

        {/* Price change */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            justifyContent: "flex-end", fontSize: "14px", fontWeight: 700,
            color: bullish ? "var(--green)" : "var(--red)",
          }}>
            {bullish ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {formatIncrease(token.increase)}
          </div>
          <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "2px" }}>24h</div>
        </div>
      </div>

      {/* ── Bonding progress ─ */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "11px", color: "var(--ink-4)" }}>Bonding curve</span>
          <span style={{
            fontSize: "11px", fontWeight: 600,
            color: progress > 80 ? "var(--green)" : "var(--ink-3)",
          }}>
            {progress}%
          </span>
        </div>
        <div style={{
          height: "4px", background: "var(--bg-2)",
          borderRadius: "99px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: progress > 80 ? "var(--green)" : "var(--orange)",
            borderRadius: "99px", transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* ── AI Take ─ */}
      <div style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${p.color}`,
        borderRadius: "8px",
        padding: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <span style={{ fontSize: "16px" }}>{p.emoji}</span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: p.color }}>{p.label}</span>
          {isLoading && (
            <span style={{
              marginLeft: "auto", fontSize: "10px", color: "var(--ink-4)",
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span style={{
                display: "inline-block", width: "6px", height: "6px",
                borderRadius: "99px", background: p.color,
                animation: "dot-bounce 1.2s ease-in-out infinite",
              }} />
              thinking…
            </span>
          )}
        </div>
        <p style={{
          fontSize: "13px", lineHeight: "1.6",
          color: "var(--ink-2)", minHeight: "36px",
        }}>
          {error
            ? "⚠️ Failed to generate take."
            : object?.take || (isLoading
              ? (
                <span style={{ display: "inline-flex", gap: "3px", verticalAlign: "middle" }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      display: "inline-block", width: "4px", height: "14px",
                      background: "var(--border-2)", borderRadius: "2px",
                      animation: `dot-bounce 1.0s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </span>
              )
              : "—"
            )
          }
        </p>
      </div>

      {/* ── Actions ─ */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", paddingTop: "4px",
      }}>
        <button className="btn btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }}>
          <Share2 size={13} /> Share
        </button>
        <a
          href={`https://four.meme/token/${token.tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ fontSize: "12px", padding: "6px 14px", textDecoration: "none" }}
        >
          <ShoppingCart size={13} /> Buy on Four.meme
        </a>
      </div>
    </motion.div>
  );
}

// ── Feed ──────────────────────────────────────────────────────────────────────

const POLL_MS = 30_000;

export function Feed({ activePersona }: { activePersona: string }) {
  const [tokens, setTokens] = useState<FourMemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const seenIds = useRef<Set<number>>(new Set());

  const load = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch("/api/tokens?page=1&size=40&type=NEW");
      if (!res.ok) return;
      const { tokens: incoming }: { tokens: FourMemeToken[] } = await res.json();
      if (!incoming?.length) return;

      const fresh = incoming.filter(t => !seenIds.current.has(t.tokenId));
      fresh.forEach(t => seenIds.current.add(t.tokenId));

      if (fresh.length > 0) {
        setTokens(prev => [...fresh, ...prev].slice(0, 40));
      }
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(true); }, [load]);
  useEffect(() => {
    const id = setInterval(() => load(false), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  return (
    <main style={{
      flex: 1, minWidth: 0, padding: "24px",
      display: "flex", flexDirection: "column", gap: "16px", maxWidth: "720px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)" }}>Live Feed</h1>
          {lastRefresh && (
            <p style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "2px" }}>
              Updated {timeAgo(lastRefresh.getTime())} · {tokens.length} tokens
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="btn btn-ghost"
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            <RefreshCw size={12} style={{ animation: loading ? "ticker-scroll 1s linear infinite" : "none" }} />
            Refresh
          </button>
          <span style={{
            display: "flex", alignItems: "center", gap: "6px", fontSize: "12px",
            color: "var(--green)", background: "var(--green-bg)",
            padding: "4px 10px", borderRadius: "99px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "99px",
              background: "var(--green)", display: "inline-block",
              animation: "dot-bounce 1.5s ease-in-out infinite",
            }} />
            Four.meme
          </span>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && tokens.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card loading-shimmer" style={{ height: "190px", borderRadius: "12px" }} />
          ))}
        </div>
      )}

      {/* Token cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <AnimatePresence mode="popLayout">
          {tokens.map(token => (
            <TokenCard key={token.tokenId} token={token} persona={activePersona} />
          ))}
        </AnimatePresence>
      </div>

      {!loading && tokens.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--ink-4)", padding: "60px 0" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <p style={{ fontWeight: 600, color: "var(--ink-2)" }}>No launches detected yet</p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>Polling every 30s…</p>
        </div>
      )}
    </main>
  );
}
