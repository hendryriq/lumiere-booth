"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePhotoboothStore, LayoutType, FrameType, FilmFilterType } from "@/store/photobooth";
import { useIsMobile } from "@/lib/hooks";
import { FILTER_CSS } from "@/lib/utils";

// --- Live Preview Components ---
function LivePhotoFrame({ style, filterCss, stream, selectedFrame }: { style: React.CSSProperties, filterCss: string, stream: MediaStream | null, selectedFrame: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{
      ...style,
      backgroundColor: "#1C1B1A",
      overflow: "hidden",
      position: "relative",
      outline: selectedFrame === "stamp-border" ? "3px dashed #A8A39B" : "none",
      outlineOffset: "-4px",
    }}>
      {stream ? (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: filterCss, transform: "scaleX(-1)" }} 
        />
      ) : (
        <div style={{ width: "100%", height: "100%", border: "1px dashed #444", display: "flex", alignItems: "center", justifyContent: "center" }} />
      )}
    </div>
  );
}

function LivePreviewCanvas({ stream }: { stream: MediaStream | null }) {
  const { selectedLayout, selectedFrame, selectedFilter } = usePhotoboothStore();
  const isMobile = useIsMobile();

  const borderStyle = {
    "minimalist-mono": { bg: "#FFFFFF", border: "8px solid #FFFFFF", accent: "#1C1B1A" },
    "vintage-floral": { bg: "#E5DCD0", border: "12px solid #E5DCD0", accent: "#8B6F47" },
    "stamp-border": { bg: "#F4F1EA", border: "8px solid #F4F1EA", accent: "#1C1B1A" },
  }[selectedFrame] || { bg: "#FFFFFF", border: "8px solid #FFFFFF", accent: "#1C1B1A" };

  const renderPhoto = (index: number, style: React.CSSProperties) => (
    <LivePhotoFrame key={index} style={style} filterCss={FILTER_CSS[selectedFilter]} stream={stream} selectedFrame={selectedFrame} />
  );

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      width: "100%", 
      height: "100%", 
      transform: isMobile && selectedLayout === "strip-4x1" ? "scale(0.55)" : (isMobile ? "scale(0.85)" : "scale(1)"),
      transition: "transform 300ms ease"
    }}>
      <div style={{
        backgroundColor: borderStyle.bg,
        padding: "16px",
        boxShadow: "8px 8px 0px 0px rgba(28,27,26,1)",
        position: "relative",
      }}>
        {selectedFrame === "vintage-floral" && (
          <>
            {[{ top: 4, left: 4 }, { top: 4, right: 4 }, { bottom: 4, left: 4 }, { bottom: 4, right: 4 }].map((pos, i) => (
              <div key={i} style={{ position: "absolute", ...pos, width: "16px", height: "16px", opacity: 0.5 }}>
                <svg viewBox="0 0 16 16" fill={borderStyle.accent}><path d="M8 0 C8 4 4 8 0 8 C4 8 8 12 8 16 C8 12 12 8 16 8 C12 8 8 4 8 0Z" /></svg>
              </div>
            ))}
          </>
        )}

        {selectedLayout === "strip-1x4" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "200px" }}>
            {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: "150px", width: "200px" }))}
            <div style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              LUMIÈRE BOOTH — PREVIEW
            </div>
          </div>
        )}

        {selectedLayout === "grid-2x2" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "360px" }}>
              {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: "175px" }))}
            </div>
            <div style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              LUMIÈRE BOOTH — PREVIEW
            </div>
          </div>
        )}

        {selectedLayout === "polaroid-single" && (
          <div style={{ width: "280px" }}>
            {renderPhoto(0, { height: "280px", width: "280px" })}
            <div style={{ padding: "20px 8px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ height: "1px", backgroundColor: borderStyle.accent, opacity: 0.15, marginBottom: "8px" }} />
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", color: borderStyle.accent, opacity: 0.4, textAlign: "center" }}>
                LUMIÈRE
              </div>
            </div>
          </div>
        )}

        {selectedLayout === "hero-collage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "240px" }}>
            {renderPhoto(0, { height: "180px", width: "240px" })}
            <div style={{ display: "flex", gap: "6px", width: "100%" }}>
              {[1, 2, 3].map((i) => renderPhoto(i, { height: "100px", flex: 1 }))}
            </div>
            <div style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              LUMIÈRE BOOTH — PREVIEW
            </div>
          </div>
        )}

        {selectedLayout === "strip-4x1" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "600px", maxWidth: "80vw" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: isMobile ? "90px" : "150px", flex: 1 }))}
            </div>
            <div style={{ textAlign: "center", padding: "4px 0 0", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              LUMIÈRE BOOTH — PREVIEW
            </div>
          </div>
        )}

        {selectedLayout === "cinematic-reel" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "280px" }}>
            {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: "120px", width: "280px" }))}
            <div style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              LUMIÈRE BOOTH — PREVIEW
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const LAYOUTS: { id: LayoutType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "strip-1x4",
    label: "Classic Strip 1×4",
    description: "Traditional photobooth strip",
    icon: (
      <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
        {[0, 12, 24, 36].map((y) => (
          <rect key={y} x="2" y={y} width="28" height="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
        ))}
      </svg>
    ),
  },
  {
    id: "grid-2x2",
    label: "Grid 2×2",
    description: "Square grid of four",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        {[[2, 2], [21, 2], [2, 21], [21, 21]].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="17" height="17" stroke="currentColor" strokeWidth="1.5" fill="none" />
        ))}
      </svg>
    ),
  },
  {
    id: "polaroid-single",
    label: "Polaroid Single",
    description: "One photo, big moment",
    icon: (
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
        <rect x="2" y="2" width="32" height="40" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="6" y="6" width="24" height="24" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "hero-collage",
    label: "Hero Collage",
    description: "1 featured, 3 small",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="2" y="2" width="36" height="22" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="2" y="26" width="10" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="15" y="26" width="10" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="28" y="26" width="10" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: "strip-4x1",
    label: "Horizontal 4×1",
    description: "Widescreen film strip",
    icon: (
      <svg width="44" height="24" viewBox="0 0 44 24" fill="none">
        {[2, 12, 22, 32].map((x) => (
          <rect key={x} x={x} y="2" width="10" height="20" stroke="currentColor" strokeWidth="1.5" fill="none" />
        ))}
      </svg>
    ),
  },
  {
    id: "cinematic-reel",
    label: "Cinematic Reel",
    description: "Stacked widescreen cuts",
    icon: (
      <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
        {[2, 14, 26, 38].map((y) => (
          <rect key={y} x="2" y={y} width="28" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        ))}
      </svg>
    ),
  },
];

export const FRAMES: { id: FrameType; label: string; description: string; color: string }[] = [
  { id: "minimalist-mono", label: "Minimalist Mono", description: "Clean white borders, no decoration", color: "#FFFFFF" },
  { id: "vintage-floral", label: "Vintage Floral", description: "Warm sepia with botanical corners", color: "#E5DCD0" },
  { id: "stamp-border", label: "Stamp Border", description: "Perforated edge, post office chic", color: "#F4F1EA" },
];

export default function SetupPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { selectedLayout, setLayout, selectedFrame, setFrame, selectedFilter, setFilter } = usePhotoboothStore();
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 800 },
          height: { ideal: 600 },
          aspectRatio: { ideal: 4 / 3 },
          facingMode: "user",
        },
      })
      .then((stream) => {
        activeStream = stream;
        setMediaStream(stream);
      })
      .catch((err) => {
        console.error(err);
        setPermissionDenied(true);
      });

    return () => {
      activeStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleNext = () => {
    router.push("/viewfinder");
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1C1B1A", borderBottom: "2px solid #1C1B1A", paddingBottom: "8px", marginBottom: "16px" }}>
      {title}
    </h2>
  );

  return (
    <main style={{ height: "100vh", backgroundColor: "#F4F1EA", display: "flex", flexDirection: "column" }}>
      {/* Top header bar */}
      <div style={{ flexShrink: 0, minHeight: "64px", borderBottom: "2px solid #1C1B1A", display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "12px 16px" : "0 32px", backgroundColor: "#F4F1EA", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "24px" }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: isMobile ? "18px" : "22px", color: "#1C1B1A", letterSpacing: "-0.01em" }}>LUMIÈRE BOOTH</span>
          {!isMobile && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#A8A39B", letterSpacing: "0.1em", textTransform: "uppercase" }}>/ SETUP</span>}
        </div>
        <button
          onClick={handleNext}
          className="btn-press"
          style={{ height: "40px", padding: "0 24px", backgroundColor: "#D24B36", border: "2px solid #1C1B1A", color: "#FFFFFF", fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", boxShadow: "3px 3px 0 #1C1B1A" }}
        >
          ENTER BOOTH →
        </button>
      </div>

      {/* Split Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: isMobile ? "column" : "row" }}>
        
        {/* Left pane: Smart Mirror Live Layout Preview */}
        <div style={{ 
          flex: 1, 
          backgroundColor: "#111", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          borderRight: isMobile ? "none" : "2px solid #1C1B1A",
          borderBottom: isMobile ? "2px solid #1C1B1A" : "none",
          flexShrink: 0,
          position: "relative",
          minHeight: isMobile ? "50vh" : "auto"
        }}>
           {permissionDenied ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", color: "#A8A39B", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 2 }}>LENS CAP ON.<br />PLEASE ALLOW CAMERA.</span>
              </div>
           ) : (
             <LivePreviewCanvas stream={mediaStream} />
           )}
            
           {/* Live mirror watermark */}
           <div style={{ position: "absolute", top: "16px", left: "24px", pointerEvents: "none", zIndex: 20 }}>
             <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#A8A39B", letterSpacing: "0.15em", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
               ● LIVE PREVIEW
             </span>
           </div>
        </div>

        {/* Right pane: Setup Options */}
        <div style={{ flex: isMobile ? "none" : 1, width: isMobile ? "100%" : "500px", maxWidth: isMobile ? "none" : "600px", overflowY: "auto", padding: isMobile ? "24px 16px" : "40px 32px", backgroundColor: "#F4F1EA" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          
          {/* Step 1: Filter */}
          <section>
            <SectionTitle title="01 — FILM STOCK (FILTER)" />
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {(Object.keys(FILTER_CSS) as FilmFilterType[]).map((f) => {
                const isActive = selectedFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      width: isMobile ? "80px" : "100px",
                      height: isMobile ? "80px" : "100px",
                      backgroundColor: isActive ? "#D24B36" : "#222",
                      border: `2px solid ${isActive ? "#1C1B1A" : "#444"}`,
                      borderRadius: "50%",
                      color: isActive ? "#FFF" : "#A8A39B",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: isMobile ? "10px" : "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "pre-line",
                      transition: "all 150ms",
                      textTransform: "uppercase",
                      lineHeight: 1.2,
                      boxShadow: isActive ? "3px 3px 0 #1C1B1A" : "none"
                    }}
                  >
                    {f.replace("-", "\n")}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Layout */}
          <section>
            <SectionTitle title="02 — LAYOUT" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
              {LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setLayout(layout.id)}
                  style={{
                    padding: "16px",
                    backgroundColor: selectedLayout === layout.id ? "#E5DCD0" : "#FFFFFF",
                    border: selectedLayout === layout.id ? "2px solid #1C1B1A" : "1px solid #A8A39B",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 150ms",
                    boxShadow: selectedLayout === layout.id ? "3px 3px 0 #1C1B1A" : "none",
                  }}
                >
                  <div style={{ color: selectedLayout === layout.id ? "#1C1B1A" : "#A8A39B" }}>{layout.icon}</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, color: "#1C1B1A", letterSpacing: "0.05em", marginBottom: "4px" }}>{layout.label}</div>
                    {!isMobile && <div style={{ fontFamily: "'Lora', serif", fontSize: "11px", color: "#A8A39B" }}>{layout.description}</div>}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Step 3: Frame */}
          <section>
            <SectionTitle title="03 — CARD FRAME" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
              {FRAMES.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setFrame(frame.id)}
                  style={{
                    padding: "16px",
                    backgroundColor: selectedFrame === frame.id ? "#E5DCD0" : "#FFFFFF",
                    border: selectedFrame === frame.id ? "2px solid #1C1B1A" : "1px solid #A8A39B",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 150ms",
                    boxShadow: selectedFrame === frame.id ? "3px 3px 0 #1C1B1A" : "none",
                  }}
                >
                  <div style={{ width: "32px", height: "32px", backgroundColor: frame.color, border: "1px solid #1C1B1A" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, color: "#1C1B1A", letterSpacing: "0.05em", marginBottom: "4px" }}>{frame.label}</div>
                    {!isMobile && <div style={{ fontFamily: "'Lora', serif", fontSize: "11px", color: "#A8A39B" }}>{frame.description}</div>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
      </div>
    </main>
  );
}
