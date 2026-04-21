"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Users, Wallet, Flame, ExternalLink, BarChart3, Shield, Zap, Eye } from "lucide-react";
import { formatCap, formatIncrease, imgUrl } from "@/lib/fourmeme";

const PERSONAS = [
  { id: "degen",   emoji: "🦍", label: "The Degen",  color: "var(--orange)", desc: "Risk appetite: MAXIMUM" },
  { id: "doomer",  emoji: "📉", label: "The Doomer", color: "var(--red)",    desc: "Trust level: ZERO" },
  { id: "moonboy", emoji: "🚀", label: "Moonboy",    color: "#f59e0b",       desc: "Conviction: DELUSIONAL" },
  { id: "boomer",  emoji: "👴", label: "The Boomer", color: "#3b82f6",       desc: "Understanding: MINIMAL" },
];

type TokenDetail = {
  id: number;
  address: string;
  image: string;
  name: string;
  shortName: string;
  descr: string;
  twitterUrl: string;
  totalAmount: string;
  saleAmount: string;
  launchTime: number;
  status: string;
  raisedAmount: string;
  networkCode: string;
  label: string;
  dexType: string;
  userId: number;
  userAddress: string;
  userName: string;
  tokenPrice: {
    price: string;
    maxPrice: string;
    increase: string;
    marketCap: string;
    trading: string;
    dayIncrease: string;
    hourIncrease: string;
    fourHourIncrease: string;
    dayTrading: string;
    raisedAmount: string;
    progress: string;
    liquidity: string;
    holderCount: number;
  };
};

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

export default function AnalysisPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"token" | "dev">("token");
  const [loading, setLoading] = useState(false);
  const [tokenDetail, setTokenDetail] = useState<TokenDetail | null>(null);
  const [devTokens, setDevTokens] = useState<DevToken[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [roasts, setRoasts] = useState<Record<string, string>>({});
  const [genLoading, setGenLoading] = useState(false);
  const [roastLoading, setRoastLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "personas" | "dev">("overview");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setTokenDetail(null);
    setDevTokens([]);
    setAnalyses({});
    setRoasts({});

    try {
      if (searchType === "token") {
        const res = await fetch(`/api/token?address=${searchQuery.trim()}`);
        const data = await res.json();
        if (data.detail) {
          setTokenDetail(data.detail);
          setActiveTab("overview");
        }
      } else {
        const res = await fetch(`/api/user-tokens?userId=${searchQuery.trim()}`);
        const data = await res.json();
        if (data.tokens) {
          setDevTokens(data.tokens);
          setActiveTab("overview");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyses = async () => {
    if (!tokenDetail) return;
    setGenLoading(true);
    const tp = tokenDetail.tokenPrice;
    const ctx = [
      `Name: ${tokenDetail.name} ($${tokenDetail.shortName})`,
      `Market Cap: ${formatCap(tp.marketCap)}`,
      `24h change: ${formatIncrease(tp.increase)}`,
      `Holders: ${tp.holderCount}`,
      `Bonding curve: ${Math.round(parseFloat(tp.progress) * 100)}%`,
      `Volume: $${parseFloat(tp.dayTrading || "0").toFixed(0)}`,
      `Liquidity: $${parseFloat(tp.liquidity || "0").toFixed(0)}`,
      `Dex: ${tokenDetail.dexType}`,
      `Description: ${tokenDetail.descr || "N/A"}`,
    ].join(", ");

    try {
      const res = await fetch("/api/analysis-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: ctx, tokenAddress: tokenDetail.address }),
      });
      const data = await res.json();
      if (data.takes) setAnalyses(data.takes);
    } finally {
      setGenLoading(false);
    }
  };

  const generateDevAnalysis = async () => {
    if (devTokens.length === 0) return;
    setRoastLoading(true);
    try {
      const res = await fetch("/api/roast-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress: devTokens[0].tokenAddress }),
      });
      const data = await res.json();
      if (data.roasts) setRoasts(data.roasts);
    } finally {
      setRoastLoading(false);
    }
  };

  const tp = tokenDetail?.tokenPrice;
  const bullish = tp ? parseFloat(tp.increase) >= 0 : false;
  const progress = tp ? Math.round(parseFloat(tp.progress) * 100) : 0;

  const metrics = tokenDetail ? [
    { label: "Market Cap", value: formatCap(tp!.marketCap), icon: "💰" },
    { label: "Holders", value: tp!.holderCount.toLocaleString(), icon: "👥" },
    { label: "Bonding", value: `${progress}%`, icon: "📊" },
    { label: "24h Change", value: formatIncrease(tp!.increase), icon: bullish ? "📈" : "📉" },
    { label: "Volume (24h)", value: `$${parseFloat(tp!.dayTrading || "0").toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: "🔄" },
    { label: "Liquidity", value: `$${parseFloat(tp!.liquidity || "0").toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: "💧" },
    { label: "Raised", value: `$${parseFloat(tp!.raisedAmount || "0").toFixed(2)}`, icon: "🎯" },
    { label: "Dex", value: tokenDetail.dexType, icon: "🏪" },
  ] : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        <button className="btn btn-ghost" style={{ width: "fit-content" }} onClick={() => router.push("/")}>
          ← Back to Feed
        </button>

        {/* Search */}
        <div className="card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)", marginBottom: "16px" }}>
            🔍 Interactive Analysis
          </h2>
          <p style={{ fontSize: "13px", color: "var(--ink-3)", marginBottom: "16px" }}>
            Search any token address or developer ID to get a full AI-powered analysis from all 4 personas.
          </p>
          
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              onClick={() => setSearchType("token")}
              style={{
                padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                background: searchType === "token" ? "var(--ink)" : "var(--bg-2)",
                color: searchType === "token" ? "var(--white)" : "var(--ink-3)",
                border: "none", cursor: "pointer",
              }}
            >
              Token Address
            </button>
            <button
              onClick={() => setSearchType("dev")}
              style={{
                padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                background: searchType === "dev" ? "var(--ink)" : "var(--bg-2)",
                color: searchType === "dev" ? "var(--white)" : "var(--ink-3)",
                border: "none", cursor: "pointer",
              }}
            >
              Developer ID
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={searchType === "token" ? "Enter token address (0x...)" : "Enter developer ID or address"}
                style={{
                  width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px",
                  border: "1px solid var(--border)", background: "var(--bg)",
                  fontSize: "13px", color: "var(--ink)", outline: "none",
                }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching…" : "Analyze"}
            </button>
          </div>
        </div>

        {/* Results */}
        {tokenDetail && (
          <>
            {/* Token Header */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                {tokenDetail.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgUrl(tokenDetail.image)} alt={tokenDetail.name} style={{ width: 64, height: 64, borderRadius: "12px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: "12px", background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: "24px" }}>
                    {tokenDetail.shortName.slice(0, 1)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--ink)", margin: 0 }}>{tokenDetail.name}</h1>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <span style={{ fontSize: "13px", color: "var(--ink-3)", background: "var(--bg-2)", padding: "2px 8px", borderRadius: "99px" }}>${tokenDetail.shortName}</span>
                    <span style={{ fontSize: "12px", color: "var(--ink-4)" }}>Launched {timeAgo(tokenDetail.launchTime)}</span>
                    <span style={{ fontSize: "11px", color: "var(--ink-4)", background: "var(--bg-2)", padding: "2px 6px", borderRadius: "4px" }}>{tokenDetail.networkCode}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: bullish ? "var(--green)" : "var(--red)" }}>
                    {bullish ? "+" : ""}{formatIncrease(tp!.increase)}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink-4)" }}>24h</div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "4px", marginTop: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
                {[
                  { id: "overview" as const, label: "Overview", icon: <BarChart3 size={14} /> },
                  { id: "personas" as const, label: "AI Personas", icon: <Eye size={14} /> },
                  { id: "dev" as const, label: "Developer", icon: <Wallet size={14} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 16px", fontSize: "13px", fontWeight: 600,
                      background: "none", border: "none", cursor: "pointer",
                      color: activeTab === tab.id ? "var(--ink)" : "var(--ink-4)",
                      borderBottom: activeTab === tab.id ? "2px solid var(--orange)" : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  {/* Metrics Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                    {metrics.map(m => (
                      <div key={m.label} className="card" style={{ padding: "16px" }}>
                        <div style={{ fontSize: "11px", color: "var(--ink-4)", marginBottom: "4px" }}>{m.icon} {m.label}</div>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)" }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bonding Curve */}
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

                  {/* Token Details */}
                  <div className="card" style={{ padding: "24px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "12px" }}>Token Details</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[
                        ["Total Supply", parseFloat(tokenDetail.totalAmount).toLocaleString("en", { maximumFractionDigits: 0 })],
                        ["Sale Amount", parseFloat(tokenDetail.saleAmount).toLocaleString("en", { maximumFractionDigits: 0 })],
                        ["Max Price", `$${parseFloat(tp!.maxPrice).toExponential(4)}`],
                        ["Current Price", `$${parseFloat(tp!.price).toExponential(4)}`],
                        ["Label", tokenDetail.label],
                        ["Status", tokenDetail.status],
                      ].map(([label, value]) => (
                        <div key={label as string} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "11px", color: "var(--ink-4)" }}>{label as string}</div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>{value as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  {tokenDetail.descr && (
                    <div className="card" style={{ padding: "24px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>Description</h3>
                      <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--ink-2)" }}>{tokenDetail.descr}</p>
                    </div>
                  )}

                  {/* Links */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <a href={`https://four.meme/token/${tokenDetail.address}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: "none" }}>
                      Buy on Four.meme <ExternalLink size={14} />
                    </a>
                    {tokenDetail.twitterUrl && (
                      <a href={tokenDetail.twitterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                        Twitter <ExternalLink size={14} />
                      </a>
                    )}
                    <button className="btn btn-ghost" onClick={() => { setActiveTab("personas"); generateAnalyses(); }}>
                      <Eye size={14} /> Generate AI Analysis
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "personas" && (
                <motion.div
                  key="personas"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>🤖 AI Persona Analysis</h3>
                    <button className="btn btn-primary" onClick={generateAnalyses} disabled={genLoading} style={{ fontSize: "12px", padding: "6px 14px" }}>
                      <Zap size={14} /> {genLoading ? "Generating…" : "Generate All 4 Takes"}
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "12px" }}>
                    {PERSONAS.map(p => (
                      <div key={p.id} style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderLeft: `3px solid ${p.color}`,
                        borderRadius: "8px",
                        padding: "16px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "20px" }}>{p.emoji}</span>
                          <div>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: p.color }}>{p.label}</span>
                            <div style={{ fontSize: "10px", color: "var(--ink-4)" }}>{p.desc}</div>
                          </div>
                        </div>
                        <p style={{ fontSize: "13px", lineHeight: "1.55", color: "var(--ink-2)", marginTop: "8px", minHeight: "40px" }}>
                          {analyses[p.id] || (genLoading ? "Generating…" : "Click 'Generate All 4 Takes' to analyze.")}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "dev" && (
                <motion.div
                  key="dev"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <div className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "linear-gradient(135deg,#f97316,#ef4444)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
                      }}>👤</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>Developer</div>
                        <div style={{ fontSize: "12px", color: "var(--ink-3)", fontFamily: "monospace" }}>{tokenDetail.userName || tokenDetail.userAddress}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={() => router.push(`/dev/${tokenDetail.userId}`)}>
                        View Full Profile <ExternalLink size={12} />
                      </button>
                      <button className="btn btn-ghost" style={{ fontSize: "12px", color: "var(--red)" }} onClick={generateDevAnalysis} disabled={roastLoading}>
                        <Flame size={12} /> {roastLoading ? "Analyzing…" : "Analyze Dev"}
                      </button>
                    </div>
                  </div>

                  {/* Dev Analysis */}
                  {Object.keys(roasts).length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "12px" }}>
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
                          </div>
                          <p style={{ fontSize: "12px", lineHeight: "1.5", color: "var(--ink-2)", margin: 0 }}>
                            {roasts[p.id]}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Dev Results */}
        {devTokens.length > 0 && (
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)", marginBottom: "16px" }}>
              Developer: {devTokens[0]?.userName} ({devTokens.length} tokens)
            </h3>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button className="btn btn-primary" onClick={generateDevAnalysis} disabled={roastLoading} style={{ fontSize: "12px" }}>
                <Flame size={14} /> {roastLoading ? "Analyzing…" : "Analyze Developer"}
              </button>
              <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={() => router.push(`/dev/${devTokens[0]?.userName}`)}>
                Full Profile <ExternalLink size={12} />
              </button>
            </div>

            {Object.keys(roasts).length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "12px", marginBottom: "16px" }}>
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
                    </div>
                    <p style={{ fontSize: "12px", lineHeight: "1.5", color: "var(--ink-2)", margin: 0 }}>
                      {roasts[p.id]}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {devTokens.map(t => {
                const isGreen = parseFloat(t.increase) >= 0;
                return (
                  <div
                    key={t.tokenId}
                    className="card"
                    style={{
                      padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px",
                      cursor: "pointer", transition: "border-color 0.15s",
                    }}
                    onClick={() => { setSearchQuery(t.tokenAddress); setSearchType("token"); handleSearch(); }}
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
                      <div style={{ fontSize: "11px", color: "var(--ink-4)" }}>MC {formatCap(t.marketCap)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: isGreen ? "var(--green)" : "var(--red)" }}>
                        {isGreen ? "+" : ""}{formatIncrease(t.increase)}
                      </div>
                    </div>
                    <ExternalLink size={14} style={{ color: "var(--ink-4)" }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}