"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft, ExternalLink, Flame, Wallet } from "lucide-react";
import { formatCap, formatIncrease, imgUrl } from "@/lib/fourmeme";
import { SimpleHeader } from "@/app/components/SimpleHeader";

const PERSONAS = [
  { id: "degen",   emoji: "🦍", label: "The Degen",  color: "var(--orange)" },
  { id: "doomer",  emoji: "📉", label: "The Doomer", color: "var(--red)"    },
  { id: "moonboy", emoji: "🚀", label: "Moonboy",    color: "#f59e0b"       },
  { id: "boomer",  emoji: "👴", label: "The Boomer", color: "#3b82f6"       },
];

type DevToken = {
  tokenId: number;
  tokenName: string;
  tokenAddress: string;
  shortName: string;
  image: string;
  marketCap: string;
  increase: string;
  price: string;
  status: string;
  progress: string;
  userName: string;
};

function timeAgo(ms: number): string {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function DevDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params.userId;

  const [tokens, setTokens] = useState<DevToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [roasts, setRoasts] = useState<Record<string, string>>({});
  const [roastLoading, setRoastLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user-tokens?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.tokens) setTokens(data.tokens);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const latestToken = tokens[0];
  useEffect(() => {
    if (!latestToken) return;
    setRoastLoading(Object.fromEntries(PERSONAS.map(p => [p.id, true])));
    fetch("/api/roast-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenAddress: latestToken.tokenAddress }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.roasts) setRoasts(data.roasts);
      })
      .finally(() => setRoastLoading(Object.fromEntries(PERSONAS.map(p => [p.id, false]))));
  }, [latestToken]);

  const totalTokens = tokens.length;
  const avgMC = totalTokens > 0
    ? (tokens.reduce((acc, t) => acc + parseFloat(t.marketCap || "0"), 0) / totalTokens)
    : 0;
  const greenCount = tokens.filter(t => parseFloat(t.increase) >= 0).length;
  const redCount = totalTokens - greenCount;

  const chartData = tokens.slice(0, 10).map(t => ({
    name: `$${t.shortName}`,
    increase: parseFloat(t.increase) * 100,
  })).reverse();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <div className="card loading-shimmer" style={{ height: "60px", marginBottom: "24px" }} />
      <div className="card loading-shimmer" style={{ height: "300px" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SimpleHeader />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <button className="btn btn-ghost" style={{ width: "fit-content" }} onClick={() => router.push("/")}>
          <ArrowLeft size={14} /> Back to Feed
        </button>

        {/* Developer Profile Header */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg,#f97316,#ef4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px",
            }}>👤</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--ink)", margin: 0 }}>Developer Profile</h1>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                <Wallet size={14} style={{ color: "var(--ink-4)" }} />
                <span style={{ fontSize: "13px", color: "var(--ink-3)", fontFamily: "monospace" }}>
                  {tokens[0]?.userName || userId}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginTop: "20px" }}>
            <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", color: "var(--ink-4)" }}>📦 Tokens Created</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--ink)" }}>{totalTokens}</div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", color: "var(--ink-4)" }}>💰 Avg Market Cap</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--ink)" }}>{formatCap(String(avgMC))}</div>
            </div>
            <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", color: "var(--ink-4)" }}>📊 Win / Loss</div>
              <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--green)" }}>{greenCount}W</span>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--red)" }}>{redCount}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Roasts */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Flame size={16} style={{ color: "var(--red)" }} /> AI Persona Roasts
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "12px" }}>
            {PERSONAS.map(p => (
              <div key={p.id} style={{
                background: "var(--red-bg)",
                border: "1px solid var(--red)",
                borderRadius: "8px",
                padding: "14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>{p.emoji}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: p.color }}>{p.label}</span>
                  {roastLoading[p.id] && (
                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--ink-4)" }}>roasting…</span>
                  )}
                </div>
                <p style={{ fontSize: "13px", lineHeight: "1.55", color: "var(--ink-2)", margin: 0, minHeight: "36px" }}>
                  {roasts[p.id] || (roastLoading[p.id] ? "…" : "—")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Token History Chart */}
        {chartData.length > 0 && (
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "16px" }}>Token Performance (24h Change %)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--ink-4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ink-4)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, "24h Change"]}
                />
                <Bar dataKey="increase" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.increase >= 0 ? "#22c55e" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Token History List */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "16px" }}>All Tokens by this Developer ({totalTokens})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tokens.map(t => {
              const isGreen = parseFloat(t.increase) >= 0;
              return (
                <div
                  key={t.tokenId}
                  className="card"
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                  onClick={() => router.push(`/token/${t.tokenAddress}`)}
                >
                  {t.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl(t.image)} alt={t.tokenName} style={{ width: 36, height: 36, borderRadius: "8px", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: "8px", background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "14px" }}>
                      {t.shortName.slice(0, 1)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>{t.tokenName}</div>
                    <div style={{ fontSize: "11px", color: "var(--ink-4)" }}>
                      MC {formatCap(t.marketCap)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: isGreen ? "var(--green)" : "var(--red)" }}>
                      {isGreen ? "+" : ""}{formatIncrease(t.increase)}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--ink-4)" }}>24h</div>
                  </div>
                  <ExternalLink size={14} style={{ color: "var(--ink-4)" }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}