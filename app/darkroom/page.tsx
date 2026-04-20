"use client";

import { useRef, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { usePhotoboothStore, LayoutType, FrameType } from "@/store/photobooth";
import { applyAnalogFilter } from "@/lib/utils";

const LAYOUTS: { id: LayoutType; label: string; description: string; icon: React.ReactNode }[] = [
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
];

const FRAMES: { id: FrameType; label: string; description: string; color: string }[] = [
  { id: "minimalist-mono", label: "Minimalist Mono", description: "Clean white borders, no decoration", color: "#FFFFFF" },
  { id: "vintage-floral", label: "Vintage Floral", description: "Warm sepia with botanical corners", color: "#E5DCD0" },
  { id: "stamp-border", label: "Stamp Border", description: "Perforated edge, post office chic", color: "#F4F1EA" },
];

// --- Preview Canvas ---
const PreviewCanvas = forwardRef<HTMLDivElement>(function PreviewCanvas(_, ref) {
  const { photos, selectedLayout, selectedFrame } = usePhotoboothStore();

  const borderStyle = {
    "minimalist-mono": { bg: "#FFFFFF", border: "8px solid #FFFFFF", accent: "#1C1B1A" },
    "vintage-floral": { bg: "#E5DCD0", border: "12px solid #E5DCD0", accent: "#8B6F47" },
    "stamp-border": { bg: "#F4F1EA", border: "8px solid #F4F1EA", accent: "#1C1B1A" },
  }[selectedFrame];

  const renderPhoto = (index: number, style: React.CSSProperties) => (
    <div
      key={index}
      style={{
        ...style,
        backgroundColor: "#1C1B1A",
        overflow: "hidden",
        position: "relative",
        outline: selectedFrame === "stamp-border" ? "3px dashed #A8A39B" : "none",
        outlineOffset: "-4px",
      }}
    >
      {photos[index] ? (
        <img
          src={photos[index]}
          alt={`Photo ${index + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%) contrast(1.1)" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #444" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            DRAG NEGATIVE HERE
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: "40px" }}>
      <div
        ref={ref}
        style={{
          backgroundColor: borderStyle.bg,
          padding: "16px",
          boxShadow: "8px 8px 0px 0px rgba(28,27,26,1)",
          position: "relative",
        }}
      >
        {/* Vintage floral corner decorations */}
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
            <div style={{ padding: "20px 8px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ height: "1px", backgroundColor: borderStyle.accent, opacity: 0.15, marginBottom: "8px" }} />
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", color: borderStyle.accent, opacity: 0.4, textAlign: "center" }}>
                LUMIÈRE
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// --- Sidebar ---
function Sidebar() {
  const { selectedLayout, selectedFrame, setLayout, setFrame } = usePhotoboothStore();
  const [openSection, setOpenSection] = useState<"layouts" | "frames">("layouts");

  return (
    <div style={{ width: "320px", flexShrink: 0, borderRight: "2px solid #1C1B1A", backgroundColor: "#F4F1EA", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Layouts section */}
      <div>
        <button
          onClick={() => setOpenSection(openSection === "layouts" ? "frames" : "layouts")}
          style={{ width: "100%", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "transparent", border: "none", borderBottom: "2px solid #1C1B1A", cursor: "pointer" }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1C1B1A" }}>
            01 — LAYOUT
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#A8A39B" }}>
            {openSection === "layouts" ? "−" : "+"}
          </span>
        </button>

        {openSection === "layouts" && (
          <div style={{ padding: "16px" }}>
            {LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setLayout(layout.id)}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  backgroundColor: selectedLayout === layout.id ? "#E5DCD0" : "#FFFFFF",
                  border: selectedLayout === layout.id ? "2px solid #1C1B1A" : "1px solid #A8A39B",
                  cursor: "pointer",
                  boxShadow: selectedLayout === layout.id ? "3px 3px 0 #1C1B1A" : "none",
                  textAlign: "left",
                  transition: "all 80ms",
                }}
              >
                <div style={{ color: "#1C1B1A", flexShrink: 0 }}>{layout.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, color: "#1C1B1A", letterSpacing: "0.05em", marginBottom: "4px" }}>{layout.label}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "13px", color: "#A8A39B" }}>{layout.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Frames section */}
      <div>
        <button
          onClick={() => setOpenSection(openSection === "frames" ? "layouts" : "frames")}
          style={{ width: "100%", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "transparent", border: "none", borderBottom: "2px solid #1C1B1A", cursor: "pointer" }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1C1B1A" }}>
            02 — CARD FRAME
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#A8A39B" }}>
            {openSection === "frames" ? "−" : "+"}
          </span>
        </button>

        {openSection === "frames" && (
          <div style={{ padding: "16px" }}>
            {FRAMES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setFrame(frame.id)}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  backgroundColor: selectedFrame === frame.id ? "#E5DCD0" : "#FFFFFF",
                  border: selectedFrame === frame.id ? "2px solid #1C1B1A" : "1px solid #A8A39B",
                  cursor: "pointer",
                  boxShadow: selectedFrame === frame.id ? "3px 3px 0 #1C1B1A" : "none",
                  textAlign: "left",
                  transition: "all 80ms",
                }}
              >
                <div style={{ width: "32px", height: "32px", backgroundColor: frame.color, border: "1px solid #A8A39B", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, color: "#1C1B1A", letterSpacing: "0.05em", marginBottom: "4px" }}>{frame.label}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "13px", color: "#A8A39B" }}>{frame.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Film info at bottom */}
      <div style={{ marginTop: "auto", padding: "24px", borderTop: "1px solid #E5DCD0" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#A8A39B", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 2 }}>
          <div>ROLL NO. 001</div>
          <div>4 FRAMES EXPOSED</div>
          <div>ISO 400 — 35MM</div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function DarkroomPage() {
  const router = useRouter();
  const { photos } = usePhotoboothStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const { setFinalImageUrl } = usePhotoboothStore();

  const handleDevelop = async () => {
    // Use html2canvas to capture the preview
    if (typeof window !== "undefined") {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(previewRef.current!, {
          backgroundColor: "#F4F1EA",
          scale: 2,
          useCORS: true,
        });
        applyAnalogFilter(canvas);
        const dataUrl = canvas.toDataURL("image/png");
        setFinalImageUrl(dataUrl);
        router.push("/print-tray");
      } catch {
        // Fallback: route without image
        router.push("/print-tray");
      }
    }
  };

  return (
    <main style={{ height: "100vh", backgroundColor: "#F4F1EA", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top header bar */}
      <div style={{ height: "64px", borderBottom: "2px solid #1C1B1A", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", color: "#1C1B1A", letterSpacing: "-0.01em" }}>LUMIÈRE BOOTH</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#A8A39B", letterSpacing: "0.1em", textTransform: "uppercase" }}>/ THE DARKROOM</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#A8A39B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {photos.length}/4 FRAMES LOADED
          </span>
          <button
            onClick={handleDevelop}
            className="btn-press"
            style={{ height: "40px", padding: "0 24px", backgroundColor: "#D24B36", border: "2px solid #1C1B1A", color: "#FFFFFF", fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", boxShadow: "3px 3px 0 #1C1B1A" }}
          >
            DEVELOP PRINTS →
          </button>
        </div>
      </div>

      {/* Body: sidebar + canvas */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: "auto", display: "flex" }}>
          <PreviewCanvas ref={previewRef} />
        </div>
      </div>
    </main>
  );
}
