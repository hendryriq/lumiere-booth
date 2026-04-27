"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/lib/hooks";

export default function LobbyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const isMobile = useIsMobile();

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsFlashing(true);
      setTimeout(() => router.push("/setup"), 600);
    }, 1200);
  };

  const pad = isMobile ? "16px" : "32px";

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F4F1EA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isMobile ? "32px" : "48px", padding: pad, position: "relative", overflow: "hidden" }}>
      {isFlashing && (
        <div className="screen-flash" style={{ position: "fixed", inset: 0, backgroundColor: "#FFFFFF", zIndex: 1000 }} />
      )}

      <div style={{ textAlign: "center", maxWidth: "600px", width: "100%" }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 400, letterSpacing: "-0.02em", color: "#1C1B1A", lineHeight: 1, margin: 0 }}>LUMIÈRE</h1>
        <p style={{ fontFamily: "'Lora', serif", fontSize: isMobile ? "15px" : "16px", color: "#A8A39B", lineHeight: "1.6", marginBottom: "48px" }}>
          Analog memories, digitally preserved.<br />Four frames. One roll. Yours forever.
        </p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="btn-press shadow-hard"
            style={{ width: "min(280px, 100%)", height: "56px", backgroundColor: "#FFFFFF", border: "2px solid #1C1B1A", cursor: isLoading ? "default" : "pointer", fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1C1B1A", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {isLoading ? (<>WARMING UP TUBE<span className="blink" style={{ color: "#D24B36" }}>_</span></>) : "START"}
          </button>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", color: "#A8A39B", textTransform: "uppercase" }}>⚠ REQUIRES WEBCAM ACCESS</span>
        </div>
      </div>
      {/* Bottom rule / Watermark */}
      <div style={{ position: "absolute", bottom: pad, left: pad, right: pad, display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ flex: 1, height: "2px", backgroundColor: "#1C1B1A" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", letterSpacing: "0.15em", color: "#A8A39B", textTransform: "uppercase", whiteSpace: "nowrap" }}>by Ariq and "friend"</span>
        <div style={{ flex: 1, height: "2px", backgroundColor: "#1C1B1A" }} />
      </div>
    </main>
  );
}
