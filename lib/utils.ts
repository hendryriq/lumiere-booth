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
export function applyAnalogFilter(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Grayscale
    const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    // Slight contrast boost
    const contrast = 1.2;
    const boosted = ((avg / 255 - 0.5) * contrast + 0.5) * 255;
    const clamped = Math.max(0, Math.min(255, boosted));

    data[i] = clamped;
    data[i + 1] = clamped;
    data[i + 2] = clamped;
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
