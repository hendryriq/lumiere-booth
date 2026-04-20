"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePhotoboothStore } from "@/store/photobooth";
import { downloadImage } from "@/lib/utils";

export default function PrintTrayPage() {
  const router = useRouter();
  const { finalImageUrl, photos, selectedLayout, selectedFrame, resetSession } = usePhotoboothStore();
  const [isDeveloped, setIsDeveloped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsDeveloped(true), 3100);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = () => {
    if (finalImageUrl) {
      downloadImage(finalImageUrl, `lumiere-booth-${Date.now()}.png`);
    } else {
      // Fallback: alert if no image
      alert("No image to download. Please go back and develop your prints.");
    }
  };

  const handleRestart = () => {
    resetSession();
    router.push("/");
  };

  // Reconstruct preview if finalImageUrl is null (fallback)
  const borderStyle = {
    "minimalist-mono": { bg: "#FFFFFF", accent: "#1C1B1A" },
    "vintage-floral": { bg: "#E5DCD0", accent: "#8B6F47" },
    "stamp-border": { bg: "#F4F1EA", accent: "#1C1B1A" },
  }[selectedFrame];

  const renderPhoto = (index: number, style: React.CSSProperties) => (
    <div key={index} style={{ ...style, backgroundColor: "#1C1B1A", overflow: "hidden" }}>
      {photos[index] ? (
        <img src={photos[index]} alt={`Photo ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%) contrast(1.1)" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#1C1B1A" }} />
      )}
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F4F1EA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

      {/* Progress bar at top */}
      {!isDeveloped && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "#E5DCD0", zIndex: 50 }}>
          <div className="progress-fill" style={{ height: "100%", backgroundColor: "#D24B36" }} />
        </div>
      )}

      {/* Drying rack wires decoration */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "80px", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "40px", left: 0, right: 0, height: "1px", backgroundColor: "#A8A39B", opacity: 0.4 }} />
        {/* Clothespins */}
        {[20, 40, 60, 80].map((pct) => (
          <div key={pct} style={{ position: "absolute", top: "32px", left: `${pct}%`, width: "8px", height: "18px", backgroundColor: "#A8A39B", opacity: 0.35 }} />
        ))}
      </div>

      {/* The Print */}
      <div
        className={isDeveloped ? "" : "develop-animation"}
        style={{
          transform: "rotate(-1.5deg)",
          boxShadow: "8px 8px 0px 0px rgba(28,27,26,0.85)",
          marginTop: "60px",
          marginBottom: "40px",
        }}
      >
        {finalImageUrl ? (
          <div style={{ backgroundColor: borderStyle.bg, padding: "16px" }}>
            <img
              src={finalImageUrl}
              alt="Your photobooth strip"
              style={{ display: "block", maxHeight: "60vh", maxWidth: "80vw", objectFit: "contain" }}
            />
            <div style={{ textAlign: "center", padding: "8px 0 4px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              LUMIÈRE BOOTH — {new Date().getFullYear()}
            </div>
          </div>
        ) : (
          /* Fallback: reconstruct the strip inline */
          <div style={{ backgroundColor: borderStyle.bg, padding: "16px" }}>
            {selectedLayout === "strip-1x4" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "200px" }}>
                {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: "150px", width: "200px" }))}
                <div style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
                  LUMIÈRE BOOTH — {new Date().getFullYear()}
                </div>
              </div>
            )}
            {selectedLayout === "grid-2x2" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "360px" }}>
                  {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: "175px" }))}
                </div>
                <div style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
                  LUMIÈRE BOOTH — {new Date().getFullYear()}
                </div>
              </div>
            )}
            {selectedLayout === "polaroid-single" && (
              <div style={{ width: "280px" }}>
                {renderPhoto(0, { height: "280px", width: "280px" })}
                <div style={{ padding: "20px 8px 8px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", color: borderStyle.accent, opacity: 0.4 }}>LUMIÈRE</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status text */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        {!isDeveloped ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#A8A39B", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              PRINT DEVELOPING
            </span>
            <span className="blink" style={{ color: "#D24B36", fontFamily: "'Space Mono', monospace" }}>_</span>
          </div>
        ) : (
          <div className="fade-in">
            <p style={{ fontFamily: "'Lora', serif", fontSize: "16px", color: "#A8A39B", margin: "0 0 8px" }}>Your memories are ready.</p>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#A8A39B", letterSpacing: "0.08em", margin: 0 }}>HANDLE WITH CARE — DO NOT EXPOSE TO LIGHT</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {isDeveloped && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <button
            onClick={handleDownload}
            className="btn-press shadow-hard"
            style={{ height: "52px", padding: "0 32px", backgroundColor: "#FFFFFF", border: "2px solid #1C1B1A", color: "#1C1B1A", fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v9M5 8l3 3 3-3M2 13h12" />
            </svg>
            SAVE TO ARCHIVE
          </button>

          <button
            onClick={handleRestart}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#A8A39B", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "underline", padding: "4px 0" }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = "#D24B36"; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = "#A8A39B"; }}
          >
            ↩ SHOOT ANOTHER ROLL
          </button>
        </div>
      )}

      {/* Bottom film strip decoration */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "32px", backgroundColor: "#1C1B1A", display: "flex", alignItems: "center", padding: "0 8px", gap: "8px", overflow: "hidden" }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{ minWidth: "20px", height: "16px", border: "1px solid #A8A39B", opacity: 0.3, flexShrink: 0 }} />
        ))}
      </div>
    </main>
  );
}
