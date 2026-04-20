"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePhotoboothStore, FilmFilterType } from "@/store/photobooth";
import { captureFrame, formatFilmCounter, FILTER_CSS } from "@/lib/utils";

const TOTAL_PHOTOS = 4;

export default function ViewfinderPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [isAutoShooting, setIsAutoShooting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerDuration, setTimerDuration] = useState<number>(3);
  const { photos, addPhoto, clearPhotos, selectedFilter, setFilter } = usePhotoboothStore();
  const photoCount = photos.length;

  useEffect(() => {
    clearPhotos();
    navigator.mediaDevices
      .getUserMedia({ video: { width: 800, height: 600, facingMode: "user" } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setPermissionDenied(true));

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (photoCount >= TOTAL_PHOTOS && !isRouting) {
      setIsRouting(true);
      stopCamera();
      setTimeout(() => router.push("/darkroom"), 2000);
    }
  }, [photoCount, isRouting, router, stopCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || photoCount >= TOTAL_PHOTOS) return;
    setIsFlashing(true);
    const dataUrl = captureFrame(videoRef.current);
    addPhoto(dataUrl);
    setTimeout(() => setIsFlashing(false), 350);
  }, [photoCount, addPhoto]);

  useEffect(() => {
    if (!isAutoShooting || photoCount >= TOTAL_PHOTOS) return;

    if (countdown === null) {
      setCountdown(timerDuration);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      takePhoto();
      setCountdown(null);
    }
  }, [isAutoShooting, photoCount, countdown, takePhoto, timerDuration]);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#1C1B1A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {isFlashing && (
        <div className="flash-animate" style={{ position: "fixed", inset: 0, backgroundColor: "#FFFFFF", zIndex: 100, pointerEvents: "none" }} />
      )}
      {isRouting && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", zIndex: 200, animation: "fade-in 1s ease-out forwards" }} />
      )}

      {/* Top HUD */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333" }}>
        <div style={{ display: "flex", gap: "24px" }}>
          {["LUMIÈRE BOOTH", "ISO 400", "f/1.8"].map((t) => (
            <span key={t} style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#A8A39B", letterSpacing: "0.12em", textTransform: "uppercase" }}>{t}</span>
          ))}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "22px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.05em" }}>
          {formatFilmCounter(photoCount)}
        </div>
      </div>

      {/* Camera area */}
      <div style={{ position: "relative", width: "800px", maxWidth: "85vw", aspectRatio: "4/3" }}>
        {/* Vignette */}
        <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)" }} />

        {/* Reticle */}
        <div style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "60px", height: "60px", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", backgroundColor: "rgba(255,255,255,0.45)" }} />
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", backgroundColor: "rgba(255,255,255,0.45)" }} />
            <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(255,255,255,0.25)" }} />
          </div>
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && countdown > 0 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 12, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", backgroundColor: "rgba(0,0,0,0.2)" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "160px", color: "#FFFFFF", textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
              {countdown}
            </span>
          </div>
        )}

        {permissionDenied ? (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px solid #333", gap: "16px" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", color: "#A8A39B", textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 2 }}>
              LENS CAP ON.<br />PLEASE ALLOW CAMERA.
            </span>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: FILTER_CSS[selectedFilter], transform: "scaleX(-1)", border: "2px solid #333" }}
          />
        )}

        {/* Thumbnail strip on right */}
        <div style={{ position: "absolute", right: "-116px", top: 0, bottom: 0, display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
          {Array.from({ length: TOTAL_PHOTOS }).map((_, i) => (
            <div key={i} style={{ width: "96px", height: "72px", border: photos[i] ? "1px solid #666" : "1px solid #333", overflow: "hidden", backgroundColor: "#111", flexShrink: 0 }}>
              {photos[i] ? (
                <img src={photos[i]} alt={`Frame ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", filter: FILTER_CSS[selectedFilter] }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", color: "#444" }}>{i + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shutter */}
      <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        {photoCount === 0 && !isAutoShooting && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              {[3, 5, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => setTimerDuration(val)}
                  style={{
                    backgroundColor: timerDuration === val ? "#D24B36" : "transparent",
                    border: `1px solid ${timerDuration === val ? "#D24B36" : "#555"}`,
                    color: timerDuration === val ? "#FFF" : "#A8A39B",
                    padding: "4px 16px",
                    borderRadius: "16px",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 150ms"
                  }}
                >
                  {val}S
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {(Object.keys(FILTER_CSS) as FilmFilterType[]).map((f) => {
                const isSelected = selectedFilter === f;
                const labels: Record<FilmFilterType, string> = { "ilford-hp5": "HP5 (B&W)", "kodak-portra": "PORTRA (WARM)", "fuji-superia": "SUPERIA (COOL)" };
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      backgroundColor: isSelected ? "#A8A39B" : "transparent",
                      border: `1px solid ${isSelected ? "#A8A39B" : "#555"}`,
                      color: isSelected ? "#1C1B1A" : "#A8A39B",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "10px",
                      fontWeight: isSelected ? 700 : 400,
                      cursor: "pointer",
                      transition: "all 150ms"
                    }}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {photoCount < TOTAL_PHOTOS ? (
          <button
            onClick={() => setIsAutoShooting(true)}
            disabled={isAutoShooting || permissionDenied}
            style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: (isAutoShooting || permissionDenied) ? "#555" : "#D24B36", border: "4px solid #FFFFFF", cursor: (isAutoShooting || permissionDenied) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 150ms" }}
          >
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)" }} />
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#A8A39B", letterSpacing: "0.1em" }}>DEVELOPING</span>
            <span className="blink" style={{ color: "#D24B36", fontFamily: "'Space Mono', monospace", fontSize: "12px" }}>_</span>
          </div>
        )}
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}>
          {photoCount < TOTAL_PHOTOS
            ? (isAutoShooting ? `SHOOTING... ${TOTAL_PHOTOS - photoCount} REMAINING` : "CLICK TO START AUTO SHOOTING")
            : "ROUTING TO DARKROOM..."}
        </span>
      </div>
    </main>
  );
}
