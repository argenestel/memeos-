"use client";

import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Feed } from "./components/Feed";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { arbitrum, base, bsc, mainnet, optimism, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "MemeOS",
  projectId: "YOUR_PROJECT_ID",
  chains: [bsc],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
const queryClient = new QueryClient();

export default function Home() {
  const [activePersona, setActivePersona] = useState("degen");

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <Header
              activePersona={activePersona}
              onPersonaChange={setActivePersona}
            />

            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "flex",
                alignItems: "flex-start",
                minHeight: "calc(100vh - 93px)",
              }}
            >
              {/* Left sidebar */}
              <div
                className="hidden lg:block"
                style={{
                  position: "sticky",
                  top: "93px",
                  height: "fit-content",
                }}
              >
                <Sidebar
                  activePersona={activePersona}
                  onPersonaChange={setActivePersona}
                />
              </div>

              {/* Main feed */}
              <Feed activePersona={activePersona} />

              {/* Right column placeholder for future use */}
              <div
                className="hidden xl:block"
                style={{
                  width: "240px",
                  flexShrink: 0,
                  padding: "24px 24px 24px 0",
                }}
              >
                <StatsPanel />
              </div>
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function StatsPanel() {
  const [fearValue, setFearValue] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/market-stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && typeof data.fearValue === 'number') {
          setFearValue(data.fearValue);
        }
      })
      .catch((err) => console.error("Failed to fetch fear value:", err));
  }, []);

  const getLabel = (val: number) => {
    if (val >= 80) return "Extreme Greed";
    if (val >= 60) return "Greed";
    if (val >= 40) return "Neutral";
    if (val >= 20) return "Fear";
    return "Extreme Fear";
  };

  const val = fearValue ?? 50;
  const label = fearValue !== null ? getLabel(val) : "Loading...";
  const color = val >= 60 ? "var(--green)" : val <= 40 ? "var(--red)" : "var(--orange)";
  const bg = val >= 60 ? "var(--green-bg)" : val <= 40 ? "var(--red-bg)" : "var(--orange-bg)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Market sentiment */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
            marginBottom: "12px",
          }}
        >
          Fear &amp; Greed
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontSize: "40px",
              fontWeight: 800,
              color: color,
              lineHeight: 1,
            }}
          >
            {fearValue !== null ? fearValue : "--"}
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: color,
              background: bg,
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            {label}
          </span>
        </div>
        <div
          style={{
            height: "6px",
            background: "var(--bg-2)",
            borderRadius: "99px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${val}%`,
              background:
                "linear-gradient(to right, #ef4444, #f97316, #22c55e)",
              borderRadius: "99px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            color: "var(--ink-4)",
            marginTop: "6px",
          }}
        >
          <span>Fear</span>
          <span>Greed</span>
        </div>
      </div>

      {/* About */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "14px 16px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--ink)",
            marginBottom: "6px",
          }}
        >
          What is MemeOS?
        </p>
        <p
          style={{ fontSize: "12px", lineHeight: "1.6", color: "var(--ink-3)" }}
        >
          AI-powered commentary on meme coin launches. Four.meme is scanned in
          real time, and our AI personas give you hot takes instantly.
        </p>
      </div>
    </div>
  );
}
