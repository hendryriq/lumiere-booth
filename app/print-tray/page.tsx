"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePhotoboothStore } from "@/store/photobooth";
import { downloadImage, FILTER_CSS, applyAnalogFilterRect } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks";

function PhotoFrame({ index, style, filterCss, photoUrl, videoUrl }: { index: number, style: React.CSSProperties, filterCss: string, photoUrl: string | undefined, videoUrl: string | undefined }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <div 
      style={{ ...style, backgroundColor: "#1C1B1A", overflow: "hidden", position: "relative", cursor: videoUrl ? "pointer" : "default" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {photoUrl ? (
        <>
          <img src={photoUrl} alt={`Photo ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", filter: filterCss, position: "absolute", inset: 0, zIndex: 1, opacity: isHovered && videoUrl ? 0 : 1, transition: "opacity 300ms ease" }} />
          {videoUrl && (
            <video 
              ref={videoRef}
              src={videoUrl} 
              muted 
              loop 
              playsInline 
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: filterCss, position: "absolute", inset: 0, zIndex: 2, opacity: isHovered ? 1 : 0, transition: "opacity 300ms ease", transform: "scaleX(-1)" }} 
            />
          )}
        </>
      ) : (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#1C1B1A" }} />
      )}
    </div>
  );
}

export default function PrintTrayPage() {
  const router = useRouter();
  const { finalImageUrl, photos, videos, selectedLayout, selectedFrame, selectedFilter, resetSession } = usePhotoboothStore();
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const t = setTimeout(() => setIsDeveloped(true), 3100);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = () => {
    if (finalImageUrl) {
      downloadImage(finalImageUrl, `lumiere-booth-${Date.now()}.png`);
    } else {
      alert("No image to download");
    }
  };

  const exportMotionLayout = async () => {
    if (!videos || !videos.length) return alert("No motion clips to export.");
    setIsExportingVideo(true);

    try {
      // 1. Create hidden video players
      const videoElements = videos.map(src => {
        const v = document.createElement("video");
        v.src = src;
        v.muted = true;
        v.playsInline = true;
        v.crossOrigin = "anonymous";
        v.loop = true;
        return v;
      });
      await Promise.all(videoElements.map(v => v.play().catch(() => {})));

      // 2. Setup canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No 2d context");

      const frameConfig = {
        "minimalist-mono": { bg: "#FFFFFF", text: "#1C1B1A" },
        "vintage-floral": { bg: "#E5DCD0", text: "#8B6F47" },
        "stamp-border": { bg: "#F4F1EA", text: "#1C1B1A" },
      }[selectedFrame];

      let cw = 0, ch = 0;
      const drawItems: { v: HTMLVideoElement, x: number, y: number, w: number, h: number }[] = [];
      const textItems: { text: string, font: string, x: number, y: number, color: string }[] = [];

      const copyright = `LUMIÈRE BOOTH — ${new Date().getFullYear()}`;

      if (selectedLayout === "strip-1x4") {
        cw = 232; ch = 675;
        for (let i = 0; i < 4; i++) {
          if (videoElements[i]) drawItems.push({ v: videoElements[i], x: 16, y: 16 + i * (150 + 6), w: 200, h: 150 });
        }
        textItems.push({ text: copyright, font: "9px 'Space Mono', monospace", x: cw / 2, y: ch - 12, color: frameConfig.text });
      } else if (selectedLayout === "grid-2x2") {
        cw = 392; ch = 413;
        if (videoElements[0]) drawItems.push({ v: videoElements[0], x: 16, y: 16, w: 177, h: 175 });
        if (videoElements[1]) drawItems.push({ v: videoElements[1], x: 16 + 177 + 6, y: 16, w: 177, h: 175 });
        if (videoElements[2]) drawItems.push({ v: videoElements[2], x: 16, y: 16 + 175 + 6, w: 177, h: 175 });
        if (videoElements[3]) drawItems.push({ v: videoElements[3], x: 16 + 177 + 6, y: 16 + 175 + 6, w: 177, h: 175 });
        textItems.push({ text: copyright, font: "9px 'Space Mono', monospace", x: cw / 2, y: ch - 12, color: frameConfig.text });
      } else if (selectedLayout === "polaroid-single") {
        cw = 312; ch = 352;
        if (videoElements[0]) drawItems.push({ v: videoElements[0], x: 16, y: 16, w: 280, h: 280 });
        textItems.push({ text: "LUMIÈRE", font: "18px 'Fraunces', serif", x: cw / 2, y: ch - 18, color: frameConfig.text });
      } else if (selectedLayout === "hero-collage") {
        cw = 272; ch = 343;
        if (videoElements[0]) drawItems.push({ v: videoElements[0], x: 16, y: 16, w: 240, h: 180 });
        if (videoElements[1]) drawItems.push({ v: videoElements[1], x: 16, y: 16 + 180 + 6, w: 76, h: 100 });
        if (videoElements[2]) drawItems.push({ v: videoElements[2], x: 16 + 76 + 6, y: 16 + 180 + 6, w: 76, h: 100 });
        if (videoElements[3]) drawItems.push({ v: videoElements[3], x: 16 + 76 * 2 + 6 * 2, y: 16 + 180 + 6, w: 76, h: 100 });
        textItems.push({ text: copyright, font: "9px 'Space Mono', monospace", x: cw / 2, y: ch - 12, color: frameConfig.text });
      } else if (selectedLayout === "strip-4x1") {
        cw = 850; ch = 207;
        for (let i = 0; i < 4; i++) {
          if (videoElements[i]) drawItems.push({ v: videoElements[i], x: 16 + i * (200 + 6), y: 16, w: 200, h: 150 });
        }
        textItems.push({ text: copyright, font: "9px 'Space Mono', monospace", x: cw / 2, y: ch - 12, color: frameConfig.text });
      } else if (selectedLayout === "cinematic-reel") {
        cw = 312; ch = 555;
        for (let i = 0; i < 4; i++) {
          if (videoElements[i]) drawItems.push({ v: videoElements[i], x: 16, y: 16 + i * (120 + 6), w: 280, h: 120 });
        }
        textItems.push({ text: copyright, font: "9px 'Space Mono', monospace", x: cw / 2, y: ch - 12, color: frameConfig.text });
      }

      const scale = 2;
      canvas.width = cw * scale;
      canvas.height = ch * scale;
      ctx.scale(scale, scale);

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm';
      let extension = 'webm';
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        extension = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      }

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      let animationId: number;

      const drawLoop = () => {
        ctx.fillStyle = frameConfig.bg;
        ctx.fillRect(0, 0, cw, ch);
        
        drawItems.forEach(item => {
          ctx.save();
          ctx.translate(item.x + item.w, item.y);
          ctx.scale(-1, 1);

          // Cover-fit: crop source video to fill target slot without stretching.
          // Same logic as CSS objectFit:"cover" — mirrors what the DOM preview shows.
          const vw = item.v.videoWidth;
          const vh = item.v.videoHeight;
          if (vw && vh) {
            const scaleFactor = Math.max(item.w / vw, item.h / vh);
            const sw = item.w / scaleFactor;
            const sh = item.h / scaleFactor;
            const sx = (vw - sw) / 2;
            const sy = (vh - sh) / 2;
            ctx.drawImage(item.v, sx, sy, sw, sh, 0, 0, item.w, item.h);
          } else {
            ctx.drawImage(item.v, 0, 0, item.w, item.h);
          }

          ctx.restore();

          // Apply analog filter directly on pixels to fix Safari/iOS ignoring ctx.filter
          applyAnalogFilterRect(
            ctx, 
            selectedFilter, 
            Math.floor(item.x * scale), 
            Math.floor(item.y * scale), 
            Math.ceil(item.w * scale), 
            Math.ceil(item.h * scale)
          );
        });

        if (selectedFrame === "stamp-border") {
          ctx.strokeStyle = "#A8A39B";
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          drawItems.forEach(item => {
            ctx.strokeRect(item.x - 2, item.y - 2, item.w + 4, item.h + 4);
          });
        }

        ctx.textAlign = "center";
        
        textItems.forEach(item => {
          ctx.fillStyle = item.color;
          ctx.font = item.font;
          ctx.globalAlpha = 0.6;
          ctx.fillText(item.text, item.x, item.y);
          ctx.globalAlpha = 1.0;
        });

        animationId = requestAnimationFrame(drawLoop);
      };

      drawLoop();
      recorder.start();

      setTimeout(() => {
        recorder.onstop = () => {
          cancelAnimationFrame(animationId);
          videoElements.forEach(v => v.pause());
          const blob = new Blob(chunks, { type: mimeType });
          downloadImage(URL.createObjectURL(blob), `lumiere-motion-layout-${Date.now()}.${extension}`);
          setIsExportingVideo(false);
        };
        recorder.stop();
      }, 10000);

    } catch (e) {
      console.error(e);
      alert("Failed to export motion layout");
      setIsExportingVideo(false);
    }
  };

  const handleRestart = (destination: string = "/") => {
    resetSession();
    router.push(destination);
  };

  // Reconstruct preview if finalImageUrl is null (fallback)
  const borderStyle = {
    "minimalist-mono": { bg: "#FFFFFF", accent: "#1C1B1A" },
    "vintage-floral": { bg: "#E5DCD0", accent: "#8B6F47" },
    "stamp-border": { bg: "#F4F1EA", accent: "#1C1B1A" },
  }[selectedFrame];

  const renderPhoto = (index: number, style: React.CSSProperties) => (
    <PhotoFrame key={index} index={index} style={style} filterCss={FILTER_CSS[selectedFilter]} photoUrl={photos[index]} videoUrl={videos[index]} />
  );

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F4F1EA", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "auto", paddingTop: isMobile ? "48px" : "80px", paddingBottom: "60px" }}>

      {/* Progress bar at top */}
      {!isDeveloped && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "#E5DCD0", zIndex: 50 }}>
          <div className="progress-fill" style={{ height: "100%", backgroundColor: "#D24B36" }} />
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: isMobile ? "32px" : "80px", maxWidth: "1200px", width: "100%", zIndex: 10, padding: isMobile ? "0 16px" : "0" }}>
        
        {/* The Print */}
        <div
          className={isDeveloped ? "" : "develop-animation"}
          style={{
            transform: "rotate(-1.5deg)",
            boxShadow: "8px 8px 0px 0px rgba(28,27,26,0.85)",
            marginBottom: "40px",
          }}
        >
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
        </div>

        {/* Right Side: Status and Actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "40px" }}>
          {/* Status text */}
          <div>
            {!isDeveloped ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#A8A39B", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  PRINT
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
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px" }}>
              <div style={{ display: "flex", gap: "16px", flexWrap: isMobile ? "wrap" : "nowrap", width: isMobile ? "100%" : "auto" }}>
                <button
                  onClick={handleDownload}
                  className="btn-press shadow-hard"
                  style={{ height: "52px", padding: "0 24px", backgroundColor: "#FFFFFF", border: "2px solid #1C1B1A", color: "#1C1B1A", fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flex: isMobile ? 1 : "none" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2v9M5 8l3 3 3-3M2 13h12" />
                  </svg>
                  SAVE PNG
                </button>

                <button
                  onClick={exportMotionLayout}
                  disabled={isExportingVideo}
                  className="btn-press shadow-hard"
                  style={{ height: "52px", padding: "0 24px", backgroundColor: isExportingVideo ? "#555" : "#E5DCD0", border: `2px solid ${isExportingVideo ? "#555" : "#1C1B1A"}`, color: isExportingVideo ? "#A8A39B" : "#1C1B1A", fontFamily: "'Space Mono', monospace", fontSize: isMobile ? "11px" : "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: isExportingVideo ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 150ms", flex: isMobile ? 1 : "none" }}
                >
                  {isExportingVideo ? (
                    <span className="blink">RENDERING...</span>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="m10 8-4 3V5l4 3Z" />
                        <circle cx="8" cy="8" r="6" />
                      </svg>
                      SAVE MOTION (MP4/WEBM)
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => handleRestart("/viewfinder")}
                className="btn-press shadow-hard"
                style={{ height: "52px", padding: "0 32px", backgroundColor: "#1C1B1A", border: "2px solid #1C1B1A", color: "#F4F1EA", fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: isMobile ? "100%" : "auto" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none" />
                </svg>
                NEW ROLL
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom film strip decoration */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "32px", backgroundColor: "#1C1B1A", display: "flex", alignItems: "center", padding: "0 8px", gap: "8px", overflow: "hidden" }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{ minWidth: "20px", height: "16px", border: "1px solid #A8A39B", opacity: 0.3, flexShrink: 0 }} />
        ))}
      </div>
    </main>
  );
}
