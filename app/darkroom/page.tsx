"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePhotoboothStore, LayoutType, FrameType, FilmFilterType } from "@/store/photobooth";
import { applyAnalogFilter, FILTER_CSS } from "@/lib/utils";
import { composePhotoStrip } from "@/lib/composer";
import { useIsMobile } from "@/lib/hooks";

function DarkroomPhotoFrame({ index, style, filterCss, photoUrl, videoUrl, selectedFrame }: { index: number, style: React.CSSProperties, filterCss: string, photoUrl: string | undefined, videoUrl: string | undefined, selectedFrame: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const swapPhotos = usePhotoboothStore(s => s.swapPhotos);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!photoUrl) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const srcIndexStr = e.dataTransfer.getData("text/plain");
    const srcIndex = parseInt(srcIndexStr, 10);
    if (!isNaN(srcIndex) && srcIndex !== index) {
      swapPhotos(srcIndex, index);
    }
  };

  return (
    <div 
      draggable={!!photoUrl}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        ...style,
        backgroundColor: "#1C1B1A",
        overflow: "hidden",
        position: "relative",
        cursor: photoUrl ? "grab" : "default",
        outline: selectedFrame === "stamp-border" ? "3px dashed #A8A39B" : (isDragOver ? "3px solid #D24B36" : "none"),
        outlineOffset: "-4px",
        transform: isDragOver ? "scale(0.95)" : "scale(1)",
        transition: "transform 150ms ease, opacity 150ms ease",
        opacity: isDragOver ? 0.8 : 1,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(e) => { if (photoUrl) e.currentTarget.style.cursor = "grabbing"; }}
      onMouseUp={(e) => { if (photoUrl) e.currentTarget.style.cursor = "grab"; }}
    >
      {photoUrl ? (
        <>
          <div style={{ width: "100%", height: "100%", backgroundImage: `url(${photoUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: filterCss, position: "absolute", inset: 0, zIndex: 1, opacity: isHovered && videoUrl ? 0 : 1, transition: "opacity 300ms ease", pointerEvents: "none" }} />
          {videoUrl && (
            <video 
              ref={videoRef}
              src={videoUrl} 
              muted 
              loop 
              playsInline 
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: filterCss, position: "absolute", inset: 0, zIndex: 2, opacity: isHovered ? 1 : 0, transition: "opacity 300ms ease", transform: "scaleX(-1)", pointerEvents: "none" }} 
            />
          )}
        </>
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #444", position: "absolute", inset: 0 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", pointerEvents: "none" }}>
            DRAG NEGATIVE<br/>HERE
          </span>
        </div>
      )}
    </div>
  );
}

// --- Preview Canvas ---
function PreviewCanvas({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  const { photos, videos, selectedLayout, selectedFrame, selectedFilter, customText } = usePhotoboothStore();
  const isMobile = useIsMobile();

  const borderStyle = {
    "minimalist-mono": { bg: "#FFFFFF", border: "8px solid #FFFFFF", accent: "#1C1B1A" },
    "vintage-floral": { bg: "#E5DCD0", border: "12px solid #E5DCD0", accent: "#8B6F47" },
    "stamp-border": { bg: "#F4F1EA", border: "8px solid #F4F1EA", accent: "#1C1B1A" },
  }[selectedFrame];

  const renderPhoto = (index: number, style: React.CSSProperties) => (
    <DarkroomPhotoFrame key={index} index={index} style={style} filterCss={FILTER_CSS[selectedFilter]} photoUrl={photos[index]} videoUrl={videos[index]} selectedFrame={selectedFrame} />
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: isMobile ? "24px 16px" : "40px" }}>
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
              {customText}
            </div>
          </div>
        )}

        {selectedLayout === "grid-2x2" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "360px" }}>
              {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: "175px" }))}
            </div>
            <div style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              {customText}
            </div>
          </div>
        )}

        {selectedLayout === "polaroid-single" && (
          <div style={{ width: "280px" }}>
            {renderPhoto(0, { height: "280px", width: "280px" })}
            <div style={{ padding: "20px 8px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ height: "1px", backgroundColor: borderStyle.accent, opacity: 0.15, marginBottom: "8px" }} />
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", color: borderStyle.accent, opacity: 0.4, textAlign: "center" }}>
                {customText}
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
              {customText}
            </div>
          </div>
        )}

        {selectedLayout === "strip-4x1" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "600px", maxWidth: "80vw" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: isMobile ? "90px" : "150px", flex: 1 }))}
            </div>
            <div style={{ textAlign: "center", padding: "4px 0 0", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              {customText}
            </div>
          </div>
        )}

        {selectedLayout === "cinematic-reel" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "280px" }}>
            {[0, 1, 2, 3].map((i) => renderPhoto(i, { height: "120px", width: "280px" }))}
            <div style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: borderStyle.accent, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>
              {customText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function DarkroomPage() {
  const router = useRouter();
  const { photos, videos, selectedLayout, selectedFrame, selectedFilter, setFinalImageUrl, customText, setCustomText } = usePhotoboothStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (photos.length === 0) {
      router.replace("/");
    }
  }, [photos.length, router]);

  const handleDevelop = async () => {
    try {
      const dataUrl = await composePhotoStrip(
        photos,
        selectedLayout,
        selectedFrame,
        selectedFilter,
        customText
      );
      setFinalImageUrl(dataUrl);
      router.push("/print-tray");
    } catch (e) {
      console.error("Failed to compose photo strip", e);
      router.push("/print-tray");
    }
  };

  return (
    <main style={{
      backgroundColor: "#F4F1EA",
      display: "flex",
      flexDirection: "column",
      overflow: isMobile ? "auto" : "hidden",
      height: isMobile ? "auto" : "100vh",
      minHeight: "100vh",
    }}>
      {/* Top header bar */}
      <div style={{
        minHeight: "64px",
        borderBottom: "2px solid #1C1B1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "12px 16px" : "0 32px",
        flexShrink: 0,
        flexWrap: isMobile ? "wrap" : "nowrap",
        gap: "8px",
        position: isMobile ? "sticky" : "static",
        top: 0,
        backgroundColor: "#F4F1EA",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "24px" }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: isMobile ? "18px" : "22px", color: "#1C1B1A", letterSpacing: "-0.01em" }}>LUMIÈRE BOOTH</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px" }}>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "16px" }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#A8A39B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                TEXT:
              </span>
              <input
                type="text"
                value={usePhotoboothStore.getState().customText}
                onChange={(e) => usePhotoboothStore.getState().setCustomText(e.target.value)}
                maxLength={40}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #A8A39B",
                  color: "#1C1B1A",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "11px",
                  padding: "4px 8px",
                  width: "180px",
                  outline: "none"
                }}
              />
            </div>
          )}
          {!isMobile && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#A8A39B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {photos.length}/4 FRAMES
            </span>
          )}
          <button
            onClick={() => {
              usePhotoboothStore.getState().clearPhotos();
              router.push("/viewfinder");
            }}
            style={{ height: isMobile ? "40px" : "40px", padding: "0 16px", backgroundColor: "transparent", border: "1px solid #A8A39B", color: "#A8A39B", fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1C1B1A"; e.currentTarget.style.borderColor = "#1C1B1A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#A8A39B"; e.currentTarget.style.borderColor = "#A8A39B"; }}
          >
            ↩ RETAKE
          </button>
          <button
            onClick={handleDevelop}
            className="btn-press"
            style={{ height: isMobile ? "40px" : "40px", padding: "0 24px", backgroundColor: "#D24B36", border: "2px solid #1C1B1A", color: "#FFFFFF", fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", boxShadow: "3px 3px 0 #1C1B1A" }}
          >
            PRINTS →
          </button>
        </div>
      </div>
      
      {isMobile && (
        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#A8A39B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            CUSTOM TEXT
          </span>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            maxLength={40}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #A8A39B",
              color: "#1C1B1A",
              fontFamily: "'Space Mono', monospace",
              fontSize: "12px",
              padding: "8px 12px",
              width: "100%",
              outline: "none",
              borderRadius: 0
            }}
          />
        </div>
      )}

      {/* Body: Fullscreen canvas */}
      <div style={{
        display: "flex",
        flex: 1,
        overflow: "auto",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
      }}>
        <PreviewCanvas ref={previewRef} />
      </div>
    </main>
  );
}
