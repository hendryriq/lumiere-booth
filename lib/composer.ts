import { LayoutType, FrameType, FilmFilterType } from "@/store/photobooth";
import { applyAnalogFilterRect } from "./utils";

const SCALE = 6; // High-res print quality

// Load a base64 dataURL as an HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Removed applyGrayscaleContrast in favor of applyAnalogFilterRect from utils
function drawPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  filter: FilmFilterType
) {
  const scale = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  applyAnalogFilterRect(ctx, filter, dx, dy, dw, dh);
}

// Draw empty placeholder box
function drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#1C1B1A";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#444444";
  ctx.lineWidth = 1 * SCALE;
  ctx.setLineDash([4 * SCALE, 4 * SCALE]);
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.setLineDash([]);
}

// Draw stamp border perforations
function drawStampBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = 4 * SCALE;
  const step = 14 * SCALE;

  ctx.fillStyle = "#F4F1EA";

  // Top & bottom
  for (let px = x + step; px < x + w - r; px += step) {
    ctx.beginPath();
    ctx.arc(px, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, y + h, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Left & right
  for (let py = y + step; py < y + h - r; py += step) {
    ctx.beginPath();
    ctx.arc(x, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw floral corner decorations
function drawFloralCorners(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const size = 18 * SCALE;
  const corners = [
    [x + 8 * SCALE, y + 8 * SCALE],
    [x + w - 8 * SCALE, y + 8 * SCALE],
    [x + 8 * SCALE, y + h - 8 * SCALE],
    [x + w - 8 * SCALE, y + h - 8 * SCALE],
  ];
  ctx.fillStyle = "rgba(139, 111, 71, 0.35)";
  for (const [cx, cy] of corners) {
    // Simple 4-petal cross shape
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(angle) * size * 0.3,
        cy + Math.sin(angle) * size * 0.3,
        size * 0.28,
        size * 0.15,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

// Draw label text at bottom
function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string
) {
  ctx.font = `${10 * SCALE}px 'Space Mono', monospace`;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

// ─── Main export ───────────────────────────────────────────────────────────────

export async function composePhotoStrip(
  photos: string[],
  layout: LayoutType,
  frame: FrameType,
  filter: FilmFilterType,
  customText: string
): Promise<string> {
  const images = await Promise.all(
    photos.map((src) => (src ? loadImage(src) : Promise.resolve(null)))
  );

  const frameColors: Record<FrameType, { bg: string; accent: string }> = {
    "minimalist-mono": { bg: "#FFFFFF", accent: "#1C1B1A" },
    "vintage-floral":  { bg: "#E5DCD0", accent: "#8B6F47" },
    "stamp-border":    { bg: "#F4F1EA", accent: "#1C1B1A" },
  };
  const { bg, accent } = frameColors[frame];

  const label = customText || `LUMIÈRE BOOTH — ${new Date().getFullYear()}`;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // ── Strip 1×4 ──────────────────────────────────────────────────
  if (layout === "strip-1x4") {
    const photoW = 200 * SCALE;
    const photoH = 150 * SCALE;
    const gap = 6 * SCALE;
    const pad = 16 * SCALE;
    const labelH = 28 * SCALE;
    const totalH = pad + (photoH + gap) * 4 - gap + labelH + pad;

    canvas.width = photoW + pad * 2;
    canvas.height = totalH;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frame === "stamp-border") drawStampBorder(ctx, 0, 0, canvas.width, canvas.height);
    if (frame === "vintage-floral") drawFloralCorners(ctx, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 4; i++) {
      const x = pad;
      const y = pad + i * (photoH + gap);
      if (images[i]) drawPhoto(ctx, images[i]!, x, y, photoW, photoH, filter);
      else drawPlaceholder(ctx, x, y, photoW, photoH);
    }

    drawLabel(ctx, label, canvas.width / 2, pad + 4 * (photoH + gap) - gap + labelH * 0.7, accent);
  }

  // ── Grid 2×2 ───────────────────────────────────────────────────
  else if (layout === "grid-2x2") {
    const photoW = 175 * SCALE;
    const photoH = 175 * SCALE;
    const gap = 6 * SCALE;
    const pad = 16 * SCALE;
    const labelH = 28 * SCALE;

    canvas.width = photoW * 2 + gap + pad * 2;
    canvas.height = photoH * 2 + gap + pad * 2 + labelH;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frame === "stamp-border") drawStampBorder(ctx, 0, 0, canvas.width, canvas.height);
    if (frame === "vintage-floral") drawFloralCorners(ctx, 0, 0, canvas.width, canvas.height);

    const positions = [
      [0, 0], [1, 0], [0, 1], [1, 1],
    ];
    for (let i = 0; i < 4; i++) {
      const [col, row] = positions[i];
      const x = pad + col * (photoW + gap);
      const y = pad + row * (photoH + gap);
      if (images[i]) drawPhoto(ctx, images[i]!, x, y, photoW, photoH, filter);
      else drawPlaceholder(ctx, x, y, photoW, photoH);
    }

    drawLabel(ctx, label, canvas.width / 2, pad + 2 * (photoH + gap) - gap + labelH * 0.8, accent);
  }

  // ── Polaroid Single ────────────────────────────────────────────
  else if (layout === "polaroid-single"){
    const photoW = 280 * SCALE;
    const photoH = 280 * SCALE;
    const pad = 16 * SCALE;
    const bottomPad = 72 * SCALE;

    canvas.width = photoW + pad * 2;
    canvas.height = photoH + pad + bottomPad;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frame === "stamp-border") drawStampBorder(ctx, 0, 0, canvas.width, canvas.height);
    if (frame === "vintage-floral") drawFloralCorners(ctx, 0, 0, canvas.width, canvas.height);

    if (images[0]) drawPhoto(ctx, images[0]!, pad, pad, photoW, photoH, filter);
    else drawPlaceholder(ctx, pad, pad, photoW, photoH);

    // Divider line
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1 * SCALE;
    ctx.beginPath();
    ctx.moveTo(pad, photoH + pad + 16 * SCALE);
    ctx.lineTo(canvas.width - pad, photoH + pad + 16 * SCALE);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Brand text
    ctx.font = `${22 * SCALE}px 'Fraunces', serif`;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.35;
    ctx.textAlign = "center";
    ctx.fillText(label, canvas.width / 2, photoH + pad + 50 * SCALE);
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  // ── Hero Collage ────────────────────────────────────────────────
  else if (layout === "hero-collage") {
    const heroW = 240 * SCALE;
    const heroH = 180 * SCALE;
    const smallW = 76 * SCALE;
    const smallH = 100 * SCALE;
    const gap = 6 * SCALE;
    const pad = 16 * SCALE;
    const labelH = 28 * SCALE;

    canvas.width = heroW + pad * 2;
    canvas.height = pad + heroH + gap + smallH + pad + labelH;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frame === "stamp-border") drawStampBorder(ctx, 0, 0, canvas.width, canvas.height);
    if (frame === "vintage-floral") drawFloralCorners(ctx, 0, 0, canvas.width, canvas.height);

    if (images[0]) drawPhoto(ctx, images[0]!, pad, pad, heroW, heroH, filter);
    else drawPlaceholder(ctx, pad, pad, heroW, heroH);

    for (let i = 1; i < 4; i++) {
        const x = pad + (i - 1) * (smallW + gap);
        const y = pad + heroH + gap;
        if (images[i]) drawPhoto(ctx, images[i]!, x, y, smallW, smallH, filter);
        else drawPlaceholder(ctx, x, y, smallW, smallH);
    }
    
    drawLabel(ctx, label, canvas.width / 2, canvas.height - pad, accent);
  }

  // ── Horizontal Strip 4x1 ─────────────────────────────────────────
  else if (layout === "strip-4x1") {
    const photoW = 200 * SCALE;
    const photoH = 150 * SCALE;
    const gap = 6 * SCALE;
    const pad = 16 * SCALE;
    const labelH = 28 * SCALE;

    canvas.width = pad * 2 + photoW * 4 + gap * 3;
    canvas.height = pad * 2 + photoH + labelH;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frame === "stamp-border") drawStampBorder(ctx, 0, 0, canvas.width, canvas.height);
    if (frame === "vintage-floral") drawFloralCorners(ctx, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 4; i++) {
      const x = pad + i * (photoW + gap);
      const y = pad;
      if (images[i]) drawPhoto(ctx, images[i]!, x, y, photoW, photoH, filter);
      else drawPlaceholder(ctx, x, y, photoW, photoH);
    }
    
    drawLabel(ctx, label, canvas.width / 2, canvas.height - pad, accent);
  }

  // ── Cinematic Reel ──────────────────────────────────────────────
  else if (layout === "cinematic-reel") {
    const photoW = 280 * SCALE;
    const photoH = 120 * SCALE;
    const gap = 6 * SCALE;
    const pad = 16 * SCALE;
    const labelH = 28 * SCALE;

    canvas.width = photoW + pad * 2;
    canvas.height = pad + (photoH + gap) * 4 - gap + pad + labelH;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frame === "stamp-border") drawStampBorder(ctx, 0, 0, canvas.width, canvas.height);
    if (frame === "vintage-floral") drawFloralCorners(ctx, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 4; i++) {
      const x = pad;
      const y = pad + i * (photoH + gap);
      if (images[i]) drawPhoto(ctx, images[i]!, x, y, photoW, photoH, filter);
      else drawPlaceholder(ctx, x, y, photoW, photoH);
    }
    
    drawLabel(ctx, label, canvas.width / 2, canvas.height - pad, accent);
  }

  return canvas.toDataURL("image/png");
}
