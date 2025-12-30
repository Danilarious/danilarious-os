// src/apps/CanvasApp/utils/export.js
// Export composited canvas output as PNG (no UI chrome).
import { getLensModel } from './kaleidoscopeLens';

const toBlob = (canvas) =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadDataUrl = (dataUrl, filename) => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const getNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const clampEvenSegments = (value) => {
  const raw = Number(value) || 2;
  const clamped = Math.max(2, Math.min(raw, 24));
  return clamped % 2 === 0 ? clamped : clamped - 1;
};

const getContentRadius = (stage, pixelRatio = 1) => {
  try {
    if (!stage || typeof stage.find !== 'function') return null;
    const nodes = stage.find('Image');
    if (!nodes.length) return null;
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const centerX = (stageWidth / 2) * pixelRatio;
    const centerY = (stageHeight / 2) * pixelRatio;
    let maxRadius = 0;

    nodes.each((node) => {
      try {
        const rect = node.getClientRect({ skipStroke: false });
        if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return;
        const corners = [
          [rect.x, rect.y],
          [rect.x + rect.width, rect.y],
          [rect.x, rect.y + rect.height],
          [rect.x + rect.width, rect.y + rect.height],
        ];
        corners.forEach(([x, y]) => {
          const dx = x * pixelRatio - centerX;
          const dy = y * pixelRatio - centerY;
          const dist = Math.hypot(dx, dy);
          if (dist > maxRadius) maxRadius = dist;
        });
      } catch (_err) {
        // Ignore nodes that fail to report bounds.
      }
    });

    return maxRadius || null;
  } catch (_err) {
    return null;
  }
};

const getStageCanvas = ({ stage, pixelRatio }) => {
  if (!stage) return null;
  const lensLayer = stage.findOne?.('#kaleidoscope-lens-layer');
  const prevClip = lensLayer?.clipFunc?.();
  if (lensLayer && prevClip) {
    lensLayer.clipFunc(null);
  }
  let canvas;
  try {
    canvas = stage.toCanvas({ pixelRatio });
  } finally {
    if (lensLayer && prevClip) {
      lensLayer.clipFunc(prevClip);
    }
  }
  return canvas;
};

const drawMirrorFallback = ({
  ctx,
  source,
  size,
  segments,
  sectorStartRad = 0,
  previewSector = false,
}) => {
  const safeSegments = clampEvenSegments(segments);
  const angle = (2 * Math.PI) / safeSegments;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;
  const scale = Math.max(size / source.width, size / source.height);
  const drawWidth = source.width * scale;
  const drawHeight = source.height * scale;

  const segmentCount = previewSector ? 1 : safeSegments;
  if (!previewSector) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sectorStartRad);
    for (let i = 0; i < segmentCount; i++) {
      ctx.save();
      ctx.rotate(i * angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, angle);
      ctx.closePath();
      ctx.clip();
      if (i % 2 === 1) ctx.scale(-1, 1);
      ctx.drawImage(
        source,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sectorStartRad);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, angle);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      source,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  }
  if (!previewSector) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sectorStartRad);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, angle);
    ctx.closePath();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
  }
};

const renderWebGLMirror = ({
  source,
  size,
  segments,
  sectorStartRad = 0,
  previewSector = false,
}) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const gl =
    canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
    }) || canvas.getContext('experimental-webgl');

  if (!gl) return null;

  const vertSrc = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform vec2 u_center;
    uniform float u_segmentAngle;
    uniform float u_sectorStart;
    uniform float u_preview;
    void main() {
      const float PI = 3.141592653589793;
      const float TWO_PI = 6.283185307179586;
      float segAngle = u_segmentAngle;

      vec2 p = vec2(
        v_uv.x * u_resolution.x - u_center.x,
        u_center.y - v_uv.y * u_resolution.y
      );
      float r = length(p);
      float theta = atan(p.y, p.x);
      float relTheta = theta - u_sectorStart;
      if (relTheta < 0.0) {
        relTheta += TWO_PI;
      }
      if (u_preview < 0.5) {
        if (relTheta >= 0.0 && relTheta <= segAngle) {
          gl_FragColor = vec4(0.0);
          return;
        }
      }
      float localTheta = 0.0;
      if (u_preview > 0.5) {
        if (relTheta < 0.0 || relTheta > segAngle) {
          gl_FragColor = vec4(0.0);
          return;
        }
        localTheta = relTheta;
      } else {
        float sector = floor(relTheta / segAngle);
        float localWrap = mod(relTheta, segAngle);
        if (localWrap < 0.0) {
          localWrap += segAngle;
        }
        localTheta = localWrap;
        if (mod(abs(sector), 2.0) >= 1.0) {
          localTheta = segAngle - localTheta;
        }
      }
      float sampleAngle = localTheta + u_sectorStart;
      vec2 dir = vec2(cos(sampleAngle), sin(sampleAngle));
      vec2 mapped = (dir * r + u_center) / u_resolution;

      if (mapped.x < 0.0 || mapped.x > 1.0 || mapped.y < 0.0 || mapped.y > 1.0) {
        gl_FragColor = vec4(0.0);
        return;
      }

      vec4 color = texture2D(u_texture, mapped);
      gl_FragColor = color;
    }
  `;

  const compile = (type, sourceCode) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertShader = compile(gl.VERTEX_SHADER, vertSrc);
  const fragShader = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vertShader || !fragShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return null;
  }

  const positionLoc = gl.getAttribLocation(program, 'a_position');
  const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
  const centerLoc = gl.getUniformLocation(program, 'u_center');
  const segmentAngleLoc = gl.getUniformLocation(program, 'u_segmentAngle');
  const sectorStartLoc = gl.getUniformLocation(program, 'u_sectorStart');
  const textureLoc = gl.getUniformLocation(program, 'u_texture');
  const previewLoc = gl.getUniformLocation(program, 'u_preview');

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]),
    gl.STATIC_DRAW
  );

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

  gl.viewport(0, 0, size, size);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(resolutionLoc, size, size);
  gl.uniform2f(centerLoc, size / 2, size / 2);
  const segmentAngleRad = (2 * Math.PI) / clampEvenSegments(segments);
  gl.uniform1f(segmentAngleLoc, segmentAngleRad);
  gl.uniform1f(sectorStartLoc, sectorStartRad);
  gl.uniform1f(previewLoc, previewSector ? 1 : 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(textureLoc, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return canvas;
};

export const exportCanvasToPNG = async ({
  stageRef,
  sourceLayerRef,
  mirrorCanvas,
  mirrorEnabled = false,
  hueShift = 0,
  rotationDegrees = 0,
  pixelRatio = window.devicePixelRatio || 1,
  filename = 'canvas-export.png',
  segments,
}) => {
  if (!stageRef?.current) return null;

  try {
    const stage = stageRef.current;
    let stageCanvas;
    if (sourceLayerRef?.current?.toCanvas) {
      const sourceLayer = sourceLayerRef.current;
      const prevVisible = sourceLayer.visible();
      sourceLayer.visible(true);
      stageCanvas = sourceLayer.toCanvas({ pixelRatio });
      sourceLayer.visible(prevVisible);
    } else if (typeof stage.toCanvas === 'function') {
      stageCanvas = getStageCanvas({ stage, pixelRatio });
    } else {
      const dataURL = stage.toDataURL({
        pixelRatio,
        mimeType: 'image/png',
      });
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataURL;
      });
      stageCanvas = document.createElement('canvas');
      stageCanvas.width = img.width;
      stageCanvas.height = img.height;
      stageCanvas.getContext('2d').drawImage(img, 0, 0);
    }

  const width = stageCanvas.width;
  const height = stageCanvas.height;

    const contentRadius = mirrorEnabled
      ? getContentRadius(stage, pixelRatio)
      : null;
    const fallbackRadius = Math.hypot(width / 2, height / 2);
    const radius = contentRadius || fallbackRadius;
    const paddingScale = mirrorEnabled ? 1.08 : 1;
    const baseSize = Math.max(width, height);
    const outputSize = mirrorEnabled
      ? Math.max(baseSize, Math.ceil(radius * 2 * paddingScale))
      : width;
    const offsetX = Math.floor((outputSize - width) / 2);
    const offsetY = Math.floor((outputSize - height) / 2);

    const composite = document.createElement('canvas');
    composite.width = mirrorEnabled ? outputSize : width;
    composite.height = mirrorEnabled ? outputSize : height;
    const ctx = composite.getContext('2d');

    if (!mirrorEnabled) {
      ctx.drawImage(stageCanvas, 0, 0);
    } else {
      const blend = 'source-over';
      const opacity = getNumber(mirrorCanvas?.dataset?.exportOpacity, 1);
      const model = getLensModel({
        width: outputSize,
        height: outputSize,
        segments,
        rotationDegrees,
      });
      const rotation = model.startAngleRad;
      const debugLens =
        import.meta.env.DEV &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).has('debugLens');
      if (debugLens) {
        console.log('[lens-export]', {
          segments: model.segments,
          rotationDegrees,
          sectorStartDeg: model.sectorStartDeg,
          sectorEndDeg: model.sectorEndDeg,
          segmentAngleDeg: model.angleDegrees,
          width,
          height,
          u_resolution: [width, height],
          u_center: [width / 2, height / 2],
        });
      }
      let sourceCanvas = stageCanvas;
      if (hueShift) {
        const hueCanvas = document.createElement('canvas');
        hueCanvas.width = stageCanvas.width;
        hueCanvas.height = stageCanvas.height;
        const hueCtx = hueCanvas.getContext('2d');
        hueCtx.filter = `hue-rotate(${hueShift}deg)`;
        hueCtx.drawImage(stageCanvas, 0, 0);
        hueCtx.filter = 'none';
        sourceCanvas = hueCanvas;
      }

      const paddedSource = document.createElement('canvas');
      paddedSource.width = outputSize;
      paddedSource.height = outputSize;
      const paddedCtx = paddedSource.getContext('2d');
      paddedCtx.drawImage(sourceCanvas, offsetX, offsetY, width, height);

      const cx = outputSize / 2;
      const cy = outputSize / 2;
      const wedgeRadius = outputSize / 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(
        cx,
        cy,
        wedgeRadius,
        rotation,
        rotation + model.segmentAngleRad
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(paddedSource, 0, 0);
      ctx.restore();
      const previewSector =
        import.meta.env.DEV &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).has('previewSector');
      const webglCanvas = renderWebGLMirror({
        source: paddedSource,
        size: outputSize,
        segments,
        sectorStartRad: rotation,
        previewSector,
      });

      ctx.save();
      ctx.globalCompositeOperation = blend;
      ctx.globalAlpha = opacity;
      if (webglCanvas) {
        ctx.drawImage(webglCanvas, 0, 0);
      } else {
        drawMirrorFallback({
          ctx,
          source: paddedSource,
          size: outputSize,
          segments,
          sectorStartRad: rotation,
          previewSector,
        });
      }
      ctx.restore();
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = composite.width;
    finalCanvas.height = composite.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (hueShift && !mirrorEnabled) {
      finalCtx.filter = `hue-rotate(${hueShift}deg)`;
    }
    finalCtx.drawImage(composite, 0, 0);
    finalCtx.filter = 'none';

    const blob = await toBlob(finalCanvas);
    if (blob) {
      downloadBlob(blob, filename);
      return blob;
    }

    const dataURL = finalCanvas.toDataURL('image/png');
    if (dataURL) {
      downloadDataUrl(dataURL, filename);
      return true;
    }
    return null;
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export canvas. Please try again.');
    return null;
  }
};
