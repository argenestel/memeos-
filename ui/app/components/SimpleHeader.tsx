"use client";

import { useRouter } from "next/navigation";

export function SimpleHeader() {
  const router = useRouter();

  return (
    <header style={{
      background: "var(--white)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{
            width: "32px", height: "32px", background: "var(--orange)",
            borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "white", fontSize: "16px", lineHeight: 1 }}>🐸</span>
          </div>
          <span
            style={{ fontSize: "18px", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            MemeOS
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 600, color: "var(--orange)",
            background: "var(--orange-bg)", padding: "2px 7px", borderRadius: "99px",
          }}>
            LIVE
          </span>
        </div>

        <nav style={{ display: "flex", gap: "4px" }}>
          {[
            { path: "/", label: "Feed" },
            { path: "/analysis", label: "Analysis" },
          ].map(link => (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              style={{
                padding: "6px 14px", borderRadius: "7px", border: "none",
                background: "var(--bg-2)", color: "var(--ink-3)",
                fontFamily: "inherit", fontSize: "13px", fontWeight: 500,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}