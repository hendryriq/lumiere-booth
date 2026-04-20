"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePhotoboothStore } from "@/store/photobooth";
import { captureFrame, formatFilmCounter } from "@/lib/utils";

const TOTAL_PHOTOS = 4;

export default function ViewfinderPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const { photos, addPhoto, clearPhotos } = usePhotoboothStore();
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

  const handleShutter = useCallback(() => {
    if (!videoRef.current || photoCount >= TOTAL_PHOTOS || isFlashing) return;
    setIsFlashing(true);
    const dataUrl = captureFrame(videoRef.current);
    addPhoto(dataUrl);
    setTimeout(() => setIsFlashing(false), 350);
  }, [photoCount, isFlashing, addPhoto]);

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
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(100%) contrast(1.2)", transform: "scaleX(-1)", border: "2px solid #333" }}
          />
        )}

        {/* Thumbnail strip on right */}
        <div style={{ position: "absolute", right: "-80px", top: 0, bottom: 0, display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
          {Array.from({ length: TOTAL_PHOTOS }).map((_, i) => (
            <div key={i} style={{ width: "64px", height: "48px", border: photos[i] ? "1px solid #666" : "1px solid #333", overflow: "hidden", backgroundColor: "#111", flexShrink: 0 }}>
              {photos[i] ? (
                <img src={photos[i]} alt={`Frame ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#444" }}>{i + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shutter */}
      <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        {photoCount < TOTAL_PHOTOS ? (
          <button
            onClick={handleShutter}
            disabled={isFlashing}
            style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: isFlashing ? "#a83828" : "#D24B36", border: "4px solid #FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 150ms" }}
          >
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)" }} />
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#A8A39B", letterSpacing: "0.1em" }}>DEVELOPING</span>
            <span className="blink" style={{ color: "#D24B36", fontFamily: "'Space Mono', monospace", fontSize: "12px" }}>_</span>
          </div>
        )}
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {photoCount < TOTAL_PHOTOS
            ? `${TOTAL_PHOTOS - photoCount} EXPOSURE${TOTAL_PHOTOS - photoCount !== 1 ? "S" : ""} REMAINING`
            : "ROUTING TO DARKROOM..."}
        </span>
      </div>
    </main>
  );
}
