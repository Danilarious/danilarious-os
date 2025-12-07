// src/apps/CanvasApp/utils/export.js
// Export canvas as PNG with Danilarious watermark

export const exportCanvasToPNG = async (stageRef) => {
  if (!stageRef.current) return;

  try {
    // Get high-res data URL from Konva stage
    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2, // 2x resolution for quality
      mimeType: 'image/png',
    });

    // Create offscreen canvas for watermark
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Load the stage image
    const img = new Image();
    img.src = dataURL;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the stage image
    ctx.drawImage(img, 0, 0);

    // Add watermark text
    const watermarkText = 'danilarious.art';
    const fontSize = Math.max(16, canvas.width / 40);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    // Position watermark in bottom-right
    const padding = fontSize;
    ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danilarious-canvas-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export canvas. Please try again.');
  }
};
