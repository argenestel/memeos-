"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  formatCap,
  formatIncrease,
  formatProgress,
  imgUrl,
  type FourMemeToken,
} from "@/lib/fourmeme";
import {
  TrendingUp,
  TrendingDown,
  Share2,
  Users,
  RefreshCw,
  ExternalLink,
  Wallet,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";

const PERSONAS = [
  { id: "degen",   emoji: "🦍", label: "The Degen",  color: "var(--orange)" },
  { id: "doomer",  emoji: "📉", label: "The Doomer", color: "var(--red)"    },
  { id: "moonboy", emoji: "🚀", label: "Moonboy",    color: "#f59e0b"       },
  { id: "boomer",  emoji: "👴", label: "The Boomer", color: "#3b82f6"       },
];

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
  const p = PERSONAS.find(p => p.id === persona) ?? PERSONAS[0];
  const bullish = parseFloat(token.increase) >= 0;
  const progress = formatProgress(token.progress);
  const router = useRouter();

  // All 4 takes
  const [takes, setTakes] = useState<Record<string, string>>({});
  const [loadingTakes, setLoadingTakes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAllTakes, setShowAllTakes] = useState(false);

  // Dev roasts
  const [roasts, setRoasts] = useState<Record<string, string>>({});
  const [loadingRoasts, setLoadingRoasts] = useState(false);
  const [showAllRoasts, setShowAllRoasts] = useState(false);

  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Step 1: Check Supabase for all 4 cached takes
    const checks = PERSONAS.map(pp =>
      fetch(`/api/analysis?address=${encodeURIComponent(token.tokenAddress)}&persona=${pp.id}`)
        .then(res => res.json())
        .then(data => ({ persona: pp.id, take: data.cached ? data.take : null }))
        .catch(() => ({ persona: pp.id, take: null }))
    );

    Promise.all(checks).then(results => {
      const cached: Record<string, string> = {};
      const missing: string[] = [];

      results.forEach(r => {
        if (r.take) cached[r.persona] = r.take;
        else missing.push(r.persona);
      });

      setTakes(cached);

      if (missing.length > 0) {
        // Step 2: Generate all 4 takes at once
        setGenerating(true);
        const ctx = [
          `Name: ${token.name} (${token.shortName})`,
          `Market Cap: ${formatCap(token.cap)}`,
          `24h change: ${formatIncrease(token.increase)}`,
          `Holders: ${token.hold}`,
          `Bonding curve: ${progress}%`,
          `Volume: $${parseFloat(token.day1Vol ?? "0").toFixed(0)}`,
        ].join(", ");

        fetch("/api/analysis-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: ctx, tokenAddress: token.tokenAddress }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.takes) {
              setTakes(prev => ({ ...prev, ...data.takes }));
            }
          })
          .finally(() => {
            setGenerating(false);
            setLoadingTakes(false);
          });
      } else {
        setLoadingTakes(false);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoastAll = () => {
    setLoadingRoasts(true);
    setShowAllRoasts(true);
    fetch("/api/roast-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenAddress: token.tokenAddress }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.roasts) setRoasts(data.roasts);
      })
      .finally(() => setLoadingRoasts(false));
  };

  const activeTake = takes[persona] || "";
  const hasAnyTake = Object.keys(takes).length > 0;
  const isLoading = loadingTakes || generating;

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
        <div
          style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
          onClick={() => router.push(`/token/${token.tokenAddress}`)}
        >
          {token.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl(token.img)}
              alt={token.name}
              width={44}
              height={44}
              style={{ width: 44, height: 44, borderRadius: "10px", objectFit: "cover", background: "var(--bg-2)" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
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

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span
              style={{ fontWeight: 700, fontSize: "15px", color: "var(--ink)", cursor: "pointer" }}
              onClick={() => router.push(`/token/${token.tokenAddress}`)}
            >
              {token.name}
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "var(--ink-3)",
              background: "var(--bg-2)", padding: "1px 6px", borderRadius: "99px",
            }}>
              ${token.shortName}
            </span>
            <span className="tag" style={{ background: "var(--green-bg)", color: "var(--green)", marginLeft: "auto" }}>
              LIVE
            </span>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "4px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>
              MC <strong style={{ color: "var(--ink-2)" }}>{formatCap(token.cap)}</strong>
            </span>
            <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>
              Vol <strong style={{ color: "var(--ink-2)" }}>
                ${parseFloat(token.day1Vol ?? "0").toLocaleString("en", { maximumFractionDigits: 0 })}
              </strong>
            </span>
            <span style={{ fontSize: "12px", color: "var(--ink-4)", display: "flex", alignItems: "center", gap: "2px" }}>
              <Users size={11} /> {token.hold}
            </span>
            <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>
              {timeAgo(parseInt(token.createDate))}
            </span>
            <button
              style={{
                display: "flex", alignItems: "center", gap: "3px",
                fontSize: "11px", color: "var(--ink-4)", background: "none",
                border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: "4px",
              }}
              onClick={() => router.push(`/dev/${token.userAddress}`)}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--orange)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-4)")}
            >
              <Wallet size={10} /> Dev
            </button>
          </div>
        </div>

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
          <span style={{ fontSize: "11px", fontWeight: 600, color: progress > 80 ? "var(--green)" : "var(--ink-3)" }}>
            {progress}%
          </span>
        </div>
        <div style={{ height: "4px", background: "var(--bg-2)", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: progress > 80 ? "var(--green)" : "var(--orange)",
            borderRadius: "99px", transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* ── Active Persona Take ─ */}
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
          {isLoading && !activeTake && (
            <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--ink-4)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "99px", background: p.color, animation: "dot-bounce 1.2s ease-in-out infinite" }} />
              thinking…
            </span>
          )}
        </div>
        <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--ink-2)", minHeight: "36px" }}>
          {activeTake || (isLoading ? (
            <span style={{ display: "inline-flex", gap: "3px", verticalAlign: "middle" }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "inline-block", width: "4px", height: "14px",
                  background: "var(--border-2)", borderRadius: "2px",
                  animation: `dot-bounce 1.0s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </span>
          ) : "—")}
        </p>
      </div>

      {/* ── View All 4 Takes ─ */}
      {hasAnyTake && (
        <div>
          <button
            onClick={() => setShowAllTakes(!showAllTakes)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "12px", fontWeight: 600, color: "var(--ink-3)",
              background: "none", border: "none", cursor: "pointer", padding: "4px 0",
              width: "100%",
            }}
          >
            {showAllTakes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showAllTakes ? "Hide" : "View"} all 4 persona takes
            {generating && <span style={{ fontSize: "10px", color: "var(--ink-4)" }}>(generating…)</span>}
          </button>

          <AnimatePresence>
            {showAllTakes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  {PERSONAS.map(pp => (
                    <div key={pp.id} style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderLeft: `3px solid ${pp.color}`,
                      borderRadius: "8px",
                      padding: "10px 12px",
                      opacity: pp.id === persona ? 1 : 0.85,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px" }}>{pp.emoji}</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: pp.color }}>{pp.label}</span>
                      </div>
                      <p style={{ fontSize: "12px", lineHeight: "1.5", color: "var(--ink-2)", margin: 0 }}>
                        {takes[pp.id] || (generating ? "Generating…" : "—")}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Actions ─ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "11px", padding: "5px 10px", color: "var(--red)" }}
            onClick={handleRoastAll}
            disabled={loadingRoasts}
          >
            <Flame size={12} /> Analyze Dev
          </button>
          <button className="btn btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }}>
            <Share2 size={13} /> Share
          </button>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: "12px", padding: "6px 14px" }}
          onClick={() => router.push(`/token/${token.tokenAddress}`)}
        >
          <ExternalLink size={13} /> View Details
        </button>
      </div>

      {/* ── Developer Roasts ─ */}
      <AnimatePresence>
        {showAllRoasts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {loadingRoasts && (
                <div style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  borderRadius: "8px", padding: "12px",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <span style={{ fontSize: "14px" }}>🔥</span>
                  <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>Roasting developer…</span>
                  <span style={{ display: "inline-flex", gap: "3px" }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        display: "inline-block", width: "4px", height: "12px",
                        background: "var(--border-2)", borderRadius: "2px",
                        animation: `dot-bounce 1.0s ease-in-out ${i * 0.15}s infinite`,
                      }} />
                    ))}
                  </span>
                </div>
              )}
              {Object.keys(roasts).length > 0 && PERSONAS.map(pp => (
                <div key={pp.id} style={{
                  background: "var(--red-bg)",
                  border: "1px solid var(--red)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px" }}>{pp.emoji}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: pp.color }}>{pp.label}</span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: "1.5", color: "var(--ink-2)", margin: 0 }}>
                    {roasts[pp.id] || "…"}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [feedType, setFeedType] = useState<"NEW" | "HOT" | "VOL">("NEW");

  const load = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`/api/tokens?page=1&size=40&type=${feedType}`);
      if (!res.ok) return;
      const { tokens: incoming }: { tokens: FourMemeToken[] } = await res.json();
      if (!incoming?.length) {
        if (showLoader) setTokens([]);
        return;
      }

      const fresh = incoming.filter(t => !seenIds.current.has(t.tokenId));
      fresh.forEach(t => seenIds.current.add(t.tokenId));

      if (fresh.length > 0) {
        setTokens(prev => [...fresh, ...prev].slice(0, 40));
      }
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [feedType]);

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)" }}>Live Feed</h1>
          {lastRefresh && (
            <p style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "2px" }}>
              Updated {timeAgo(lastRefresh.getTime())} · {tokens.length} tokens
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Feed type tabs */}
          <div style={{ display: "flex", gap: "4px", background: "var(--bg-2)", padding: "3px", borderRadius: "8px" }}>
            {[
              { id: "NEW" as const, label: "🆕 New" },
              { id: "HOT" as const, label: "🔥 Featured" },
              { id: "VOL" as const, label: "📊 Volume" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setFeedType(tab.id);
                  seenIds.current.clear();
                  setTokens([]); // Clear current tokens immediately on tab switch
                }}
                style={{
                  padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                  background: feedType === tab.id ? "var(--white)" : "transparent",
                  color: feedType === tab.id ? "var(--ink)" : "var(--ink-3)",
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  boxShadow: feedType === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { seenIds.current.clear(); load(true); }}
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

      {loading && tokens.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card loading-shimmer" style={{ height: "190px", borderRadius: "12px" }} />
          ))}
        </div>
      )}

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