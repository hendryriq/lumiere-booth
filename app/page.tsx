"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsFlashing(true);
      setTimeout(() => router.push("/viewfinder"), 600);
    }, 1200);
  };

  return (
    <main style={{ minHeight:"100vh", backgroundColor:"#F4F1EA", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"48px", padding:"32px", position:"relative", overflow:"hidden" }}>
      {isFlashing && (
        <div className="screen-flash" style={{ position:"fixed", inset:0, backgroundColor:"#FFFFFF", zIndex:1000 }} />
      )}

      {/* Top rule */}
      <div style={{ position:"absolute", top:"32px", left:"32px", right:"32px", display:"flex", alignItems:"center", gap:"16px" }}>
        <div style={{ flex:1, height:"2px", backgroundColor:"#1C1B1A" }} />
        <span style={{ fontFamily:"'Space Mono', monospace", fontSize:"11px", letterSpacing:"0.15em", color:"#A8A39B", textTransform:"uppercase", whiteSpace:"nowrap" }}>EST. 1972</span>
        <div style={{ flex:1, height:"2px", backgroundColor:"#1C1B1A" }} />
      </div>

      <div style={{ textAlign:"center", maxWidth:"600px" }}>
        <div style={{ fontFamily:"'Space Mono', monospace", fontSize:"11px", letterSpacing:"0.2em", color:"#A8A39B", textTransform:"uppercase", marginBottom:"12px" }}>Atelier de Photographie</div>
        <h1 style={{ fontFamily:"'Fraunces', serif", fontSize:"clamp(48px, 8vw, 80px)", fontWeight:400, letterSpacing:"-0.02em", color:"#1C1B1A", lineHeight:1, margin:0 }}>LUMIÈRE</h1>
        <h1 style={{ fontFamily:"'Fraunces', serif", fontSize:"clamp(48px, 8vw, 80px)", fontWeight:400, letterSpacing:"-0.02em", color:"#1C1B1A", lineHeight:1, marginBottom:"32px" }}>BOOTH</h1>
        <p style={{ fontFamily:"'Lora', serif", fontSize:"16px", color:"#A8A39B", lineHeight:"1.6", marginBottom:"48px" }}>
          Analog memories, digitally preserved.<br />Four frames. One roll. Yours forever.
        </p>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="btn-press shadow-hard"
            style={{ width:"280px", height:"56px", backgroundColor:"#FFFFFF", border:"2px solid #1C1B1A", cursor:isLoading?"default":"pointer", fontFamily:"'Space Mono', monospace", fontSize:"13px", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#1C1B1A", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
          >
            {isLoading ? (<>WARMING UP TUBE<span className="blink" style={{ color:"#D24B36" }}>_</span></>) : "INSERT COIN / START"}
          </button>
          <span style={{ fontFamily:"'Space Mono', monospace", fontSize:"11px", letterSpacing:"0.1em", color:"#A8A39B", textTransform:"uppercase" }}>⚠ REQUIRES WEBCAM ACCESS</span>
        </div>
      </div>

      {/* Film strip bottom */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40px", backgroundColor:"#1C1B1A", display:"flex", alignItems:"center", padding:"0 8px", gap:"8px", overflow:"hidden" }}>
        {Array.from({length:40}).map((_,i) => (
          <div key={i} style={{ minWidth:"24px", height:"20px", border:"1px solid #A8A39B", opacity:0.4, flexShrink:0 }} />
        ))}
      </div>

      {/* Bottom metadata */}
      <div style={{ position:"absolute", bottom:"56px", left:"32px", right:"32px", display:"flex", justifyContent:"space-between" }}>
        {["ISO 400","35MM ANALOG","f/1.4"].map(t => (
          <span key={t} style={{ fontFamily:"'Space Mono', monospace", fontSize:"10px", color:"#A8A39B", letterSpacing:"0.1em" }}>{t}</span>
        ))}
      </div>
    </main>
  );
}
