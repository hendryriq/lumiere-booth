import { FilmFilterType } from "@/store/photobooth";

export const FILTER_CSS: Record<FilmFilterType, string> = {
  "ilford-hp5": "grayscale(100%) contrast(1.2)",
  "kodak-portra": "sepia(30%) contrast(1.1) saturate(1.2) brightness(1.05) hue-rotate(-10deg)",
  "fuji-superia": "contrast(1.15) saturate(1.1) hue-rotate(10deg) brightness(0.95)",
};

/**
 * Capture a frame from a video element and return it as a base64 data URL.
 */
export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 800;
  canvas.height = video.videoHeight || 600;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Flip horizontally (mirror effect for selfie)
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}

/**
 * Apply grayscale + contrast filter to a canvas.
 * (Analog film look is mainly handled via CSS, but this can be used for export.)
 */
export function applyAnalogFilter(canvas: HTMLCanvasElement, filterType: FilmFilterType = "ilford-hp5"): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (filterType === "ilford-hp5") {
      // Grayscale + high contrast
      const avg = 0.299 * r + 0.587 * g + 0.114 * b;
      const contrast = 1.25;
      const v = Math.max(0, Math.min(255, ((avg / 255 - 0.5) * contrast + 0.5) * 255));
      r = g = b = v;
    } else if (filterType === "kodak-portra") {
      // Warm tones + slight sepia
      const tr = (0.393 * r + 0.769 * g + 0.189 * b) * 0.9;
      const tg = (0.349 * r + 0.686 * g + 0.168 * b) * 0.9;
      const tb = (0.272 * r + 0.534 * g + 0.131 * b) * 0.9;
      
      const sepiaFactor = 0.3;
      r = r * (1 - sepiaFactor) + tr * sepiaFactor;
      g = g * (1 - sepiaFactor) + tg * sepiaFactor;
      b = b * (1 - sepiaFactor) + tb * sepiaFactor;

      // Brightness + contrast
      r = ((r / 255 - 0.5) * 1.1 + 0.5) * 255 * 1.05;
      g = ((g / 255 - 0.5) * 1.1 + 0.5) * 255 * 1.05;
      b = ((b / 255 - 0.5) * 1.1 + 0.5) * 255 * 1.05;

      // Tone shifts (more red, less blue)
      r += 10;
      b -= 10;
      
      // Fine warm grain
      const noise = (Math.random() - 0.5) * 10;
      r += noise; g += noise; b += noise;

    } else if (filterType === "fuji-superia") {
      // Cool tones, green shift
      r = r * 0.95;
      g = g * 1.05;
      b = b * 1.10;

      // Contrast
      r = ((r / 255 - 0.5) * 1.15 + 0.5) * 255 * 0.95;
      g = ((g / 255 - 0.5) * 1.15 + 0.5) * 255 * 0.95;
      b = ((b / 255 - 0.5) * 1.15 + 0.5) * 255 * 0.95;
      
      // Coarse grain
      const noise = (Math.random() - 0.5) * 18;
      r += noise; g += noise; b += noise;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Download a data URL as a PNG file.
 */
export function downloadImage(dataUrl: string, filename: string = "lumiere-booth.png"): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

/**
 * Format the film counter display.
 */
export function formatFilmCounter(count: number, total: number = 4): string {
  return `EXP: ${count}/${total}`;
}
