"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Users, Wallet, Flame } from "lucide-react";
import { formatCap, formatIncrease, formatProgress, imgUrl, type FourMemeTokenDetail } from "@/lib/fourmeme";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { SimpleHeader } from "@/app/components/SimpleHeader";

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

export default function TokenDetailPage() {
  const params = useParams<{ address: string }>();
  const router = useRouter();
  const address = params.address;

  const [detail, setDetail] = useState<FourMemeTokenDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all 4 persona analyses
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [loadingAnalyses, setLoadingAnalyses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!address) return;
    fetch(`/api/token?address=${address}`)
      .then(res => res.json())
      .then(data => {
        if (data.detail) setDetail(data.detail);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  // Fetch cached analyses for all personas
  useEffect(() => {
    if (!address) return;
    PERSONAS.forEach(p => {
      setLoadingAnalyses(prev => ({ ...prev, [p.id]: true }));
      fetch(`/api/analysis?address=${address}&persona=${p.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.cached && data.take) {
            setAnalyses(prev => ({ ...prev, [p.id]: data.take }));
          }
          setLoadingAnalyses(prev => ({ ...prev, [p.id]: false }));
        })
        .catch(() => setLoadingAnalyses(prev => ({ ...prev, [p.id]: false })));
    });
  }, [address]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <div className="card loading-shimmer" style={{ height: "60px", marginBottom: "24px" }} />
      <div className="card loading-shimmer" style={{ height: "300px" }} />
    </div>
  );

  if (!detail) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px", maxWidth: "900px", margin: "0 auto", textAlign: "center", paddingTop: "80px" }}>
      <p style={{ fontSize: "16px", color: "var(--ink-3)" }}>Token not found</p>
      <button className="btn btn-ghost" style={{ marginTop: "16px" }} onClick={() => router.push("/")}>← Back to Feed</button>
    </div>
  );

  const tp = detail.tokenPrice;
  const progress = formatProgress(tp.progress);
  const bullish = parseFloat(tp.increase) >= 0;

  // Chart data: mock price points for visual
  const chartData = [
    { time: "Launch", value: parseFloat(tp.price) * 0.8 },
    { time: "1h", value: parseFloat(tp.price) * 0.9 },
    { time: "4h", value: parseFloat(tp.price) * (1 + parseFloat(tp.fourHourIncrease || "0")) },
    { time: "24h", value: parseFloat(tp.price) * (1 + parseFloat(tp.dayIncrease || "0")) },
    { time: "Now", value: parseFloat(tp.price) },
  ];

  const metrics = [
    { label: "Market Cap", value: formatCap(tp.marketCap), icon: "💰" },
    { label: "Holders", value: tp.holderCount.toLocaleString(), icon: "👥" },
    { label: "Bonding", value: `${progress}%`, icon: "📊" },
    { label: "24h Change", value: formatIncrease(tp.increase), icon: bullish ? "📈" : "📉" },
    { label: "Volume (24h)", value: `$${parseFloat(tp.dayTrading || "0").toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: "🔄" },
    { label: "Liquidity", value: `$${parseFloat(tp.liquidity || "0").toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: "💧" },
    { label: "Raised", value: `$${parseFloat(tp.raisedAmount || "0").toFixed(2)}`, icon: "🎯" },
    { label: "Dex", value: detail.dexType, icon: "🏪" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SimpleHeader />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Back button */}
        <button className="btn btn-ghost" style={{ width: "fit-content" }} onClick={() => router.push("/")}>
          <ArrowLeft size={14} /> Back to Feed
        </button>

        {/* Header */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {detail.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgUrl(detail.image)} alt={detail.name} style={{ width: 64, height: 64, borderRadius: "12px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: "12px", background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: "24px" }}>
                {detail.shortName.slice(0, 1)}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--ink)", margin: 0 }}>{detail.name}</h1>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                <span style={{ fontSize: "13px", color: "var(--ink-3)", background: "var(--bg-2)", padding: "2px 8px", borderRadius: "99px" }}>${detail.shortName}</span>
                <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>
                  Launched {timeAgo(detail.launchTime)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: bullish ? "var(--green)" : "var(--red)" }}>
                {bullish ? "+" : ""}{formatIncrease(tp.increase)}
              </div>
              <div style={{ fontSize: "12px", color: "var(--ink-4)" }}>24h</div>
            </div>
          </div>

          {/* Developer link */}
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
            <Wallet size={16} style={{ color: "var(--ink-4)" }} />
            <span style={{ fontSize: "13px", color: "var(--ink-3)" }}>Developer:</span>
            <button
              className="btn btn-ghost"
              style={{ fontSize: "12px", padding: "4px 10px" }}
              onClick={() => router.push(`/dev/${detail.userId}`)}
            >
              {detail.userAddress.slice(0, 6)}...{detail.userAddress.slice(-4)}
              <ExternalLink size={12} style={{ marginLeft: "4px" }} />
            </button>
            {detail.twitterUrl && (
              <a href={detail.twitterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: "12px", padding: "4px 10px" }}>
                Twitter <ExternalLink size={12} style={{ marginLeft: "4px" }} />
              </a>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          {metrics.map(m => (
            <div key={m.label} className="card" style={{ padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "var(--ink-4)", marginBottom: "4px" }}>{m.icon} {m.label}</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Price Chart */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "16px" }}>Price Movement</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={bullish ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={bullish ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "var(--ink-4)" }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "var(--ink-4)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v.toExponential(2)}`} />
              <Tooltip
                contentStyle={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value) => [`$${Number(value).toExponential(4)}`, "Price"]}
              />
              <Area type="monotone" dataKey="value" stroke={bullish ? "#22c55e" : "#ef4444"} fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bonding Curve Progress */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>Bonding Curve Progress</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: progress > 80 ? "var(--green)" : "var(--orange)" }}>{progress}%</span>
          </div>
          <div style={{ height: "8px", background: "var(--bg-2)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: progress > 80 ? "var(--green)" : "var(--orange)", borderRadius: "99px", transition: "width 0.6s ease" }} />
          </div>
          <p style={{ fontSize: "12px", color: "var(--ink-4)", marginTop: "8px" }}>
            {progress >= 100 ? "✅ Bonding curve complete! Token is tradeable on DEX." : `At ${progress}%, the token is still in the bonding phase.`}
          </p>
        </div>

        {/* AI Analysis Panel */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "16px" }}>🤖 AI Persona Analysis</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "12px" }}>
            {PERSONAS.map(p => (
              <div key={p.id} style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${p.color}`,
                borderRadius: "8px",
                padding: "14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>{p.emoji}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: p.color }}>{p.label}</span>
                  {loadingAnalyses[p.id] && (
                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--ink-4)" }}>loading…</span>
                  )}
                </div>
                <p style={{ fontSize: "13px", lineHeight: "1.55", color: "var(--ink-2)", margin: 0, minHeight: "36px" }}>
                  {analyses[p.id] || (loadingAnalyses[p.id] ? "…" : "No analysis available.")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Buy Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            href={`https://four.meme/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontSize: "16px", padding: "12px 32px", textDecoration: "none" }}
          >
            Buy on Four.meme <ExternalLink size={16} style={{ marginLeft: "6px" }} />
          </a>
        </div>
      </div>
    </div>
  );
}