import { useEffect, useRef, useState } from 'react';
import { getLensModel } from '../utils/kaleidoscopeLens';

// WebGL mirror renderer (with a 2D fallback if WebGL is unavailable)
export function WebGLMirrorCanvas({
  stageRef,
  sourceLayerRef,
  enabled,
  segments = 6,
  rotationDegrees = 0,
  width,
  height,
  snapshotMs = 900,
  autoSnapshot = true,
  exportCanvasRef,
  hueShift = 0,
  snapshotTrigger = 0,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const textureDirtyRef = useRef(false);
  const glStateRef = useRef(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [fallback2D, setFallback2D] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const debugLens =
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debugLens');
  const previewSector =
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('previewSector');
  const logRef = useRef({ ts: 0 });

  const clampSegments = (value) => {
    const clamped = Math.max(2, Math.min(value, 24));
    return clamped % 2 === 0 ? clamped : clamped - 1;
  };

  const captureSnapshot = () => {
    if (document?.visibilityState === 'hidden') return;
    const stage = stageRef?.current;
    if (!stage) return;
    const sourceLayer = sourceLayerRef?.current;
    let sourceCanvas = null;
    try {
      if (sourceLayer?.toCanvas) {
        const prevVisible = sourceLayer.visible();
        sourceLayer.visible(true);
        sourceCanvas = sourceLayer.toCanvas({ pixelRatio: 1 });
        sourceLayer.visible(prevVisible);
      } else if (stage?.toCanvas) {
        sourceCanvas = stage.toCanvas({ pixelRatio: 1 });
      }
      if (!sourceCanvas) return;
      const url = sourceCanvas.toDataURL('image/png');
      setSnapshotUrl(url);
    } catch (err) {
      console.error('Mirror snapshot failed', err);
    }
  };

  // Capture Konva snapshot periodically
  useEffect(() => {
    if (!enabled) {
      setSnapshotUrl(null);
      setIsReady(false);
      return;
    }

    let cancelled = false;
    const capture = () => {
      try {
        if (!cancelled) captureSnapshot();
      } catch (err) {
        console.error('Mirror snapshot failed', err);
      }
    };

    capture();
    const computeInterval = () => {
      if (!autoSnapshot) return Math.max(250, snapshotMs);
      const area = width * height;
      const areaFactor = Math.min(1.5, Math.max(0.5, area / (1920 * 1080)));
      const segmentFactor = Math.max(0.7, 1.4 - segments * 0.05);
      const base = 900 * areaFactor * segmentFactor;
      return Math.max(280, Math.min(1400, base));
    };

    const interval = setInterval(capture, computeInterval());
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled, stageRef, snapshotMs, autoSnapshot, width, height, segments]);

  useEffect(() => {
    if (!enabled) return;
    captureSnapshot();
  }, [snapshotTrigger, enabled]);

  useEffect(() => {
    if (!enabled || !debugLens) return;
    const model = getLensModel({
      width,
      height,
      segments,
      rotationDegrees,
    });
    console.log('[lens]', {
      segments: model.segments,
      rotationDegrees,
      rotationRadNormalized: model.rotationRadNormalized,
      sectorStartDeg: model.sectorStartDeg,
      sectorEndDeg: model.sectorEndDeg,
      segmentAngleDeg: model.angleDegrees,
      width,
      height,
      dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    });
  }, [enabled, debugLens, width, height, segments, rotationDegrees]);

  useEffect(() => {
    if (!enabled || !debugLens) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    console.log('[lens-canvas]', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
      previewSector,
    });
  }, [enabled, debugLens, width, height, previewSector]);

  // Load snapshot into image for texture upload
  useEffect(() => {
    if (!snapshotUrl) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      textureDirtyRef.current = true;
      setIsReady(true);
    };
    img.src = snapshotUrl;
  }, [snapshotUrl]);

  // Initialize WebGL
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
      }) || canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('WebGL not available, using 2D fallback.');
      setFallback2D(true);
      return;
    }

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
          float wrapped = mod(relTheta, segAngle);
          if (wrapped < 0.0) {
            wrapped += segAngle;
          }
          localTheta = wrapped;
          if (mod(abs(sector), 2.0) >= 1.0) {
            localTheta = segAngle - localTheta;
          }
        }
        float sampleAngle = localTheta + u_sectorStart;
        vec2 dir = vec2(cos(sampleAngle), sin(sampleAngle));
        vec2 mapped = (dir * r + u_center) / u_resolution;

        // discard outside bounds to avoid smearing
        if (mapped.x < 0.0 || mapped.x > 1.0 || mapped.y < 0.0 || mapped.y > 1.0) {
          gl_FragColor = vec4(0.0);
          return;
        }

        vec4 color = texture2D(u_texture, mapped);
        gl_FragColor = color;
      }
    `;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compile(gl.VERTEX_SHADER, vertSrc);
    const fragShader = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vertShader || !fragShader) {
      setFallback2D(true);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      setFallback2D(true);
      return;
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

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    glStateRef.current = {
      gl,
      program,
      buffer,
      texture,
      attribs: { positionLoc },
      uniforms: {
        resolutionLoc,
        centerLoc,
        segmentAngleLoc,
        sectorStartLoc,
        textureLoc,
        previewLoc,
      },
    };

    return () => {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      glStateRef.current = null;
    };
  }, [enabled, width, height]);

  // Render loop
  useEffect(() => {
    if (!enabled || fallback2D) return;
    const state = glStateRef.current;
    if (!state) return;
    const { gl, program, buffer, attribs, uniforms } = state;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId;

    const render = (now) => {
      const model = getLensModel({
        width,
        height,
        segments,
        rotationDegrees,
      });
      const rotationRadians = model.startAngleRad;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const bufferWidth = Math.max(1, Math.round(width * dpr));
      const bufferHeight = Math.max(1, Math.round(height * dpr));
      if (canvasRef.current) {
        canvasRef.current.dataset.rotation = String(rotationRadians);
        canvasRef.current.dataset.segmentAngle = String(
          model.segmentAngleRad
        );
      }

      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
      }
      gl.viewport(0, 0, bufferWidth, bufferHeight);

      if (textureDirtyRef.current && imageRef.current) {
        gl.bindTexture(gl.TEXTURE_2D, state.texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          imageRef.current
        );
        textureDirtyRef.current = false;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(attribs.positionLoc);
      gl.vertexAttribPointer(attribs.positionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uniforms.resolutionLoc, width, height);
      gl.uniform2f(uniforms.centerLoc, width / 2, height / 2);
      gl.uniform1f(uniforms.segmentAngleLoc, model.segmentAngleRad);
      gl.uniform1f(uniforms.sectorStartLoc, rotationRadians);
      gl.uniform1f(uniforms.previewLoc, previewSector ? 1 : 0);

      if (debugLens) {
        const nowTs = performance.now();
        if (nowTs - logRef.current.ts > 250) {
          logRef.current.ts = nowTs;
          console.log('[lens-uniforms]', {
            u_resolution: [width, height],
            u_center: [width / 2, height / 2],
            u_sectorStart: rotationRadians,
            u_segmentAngle: model.segmentAngleRad,
            bufferWidth,
            bufferHeight,
            dpr,
          });
        }
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, state.texture);
      gl.uniform1i(uniforms.textureLoc, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, fallback2D, segments, rotationDegrees, width, height]);

  if (!enabled) return null;

  // 2D fallback if WebGL is unavailable
  if (fallback2D) {
    return (
      <CanvasMirrorFallback
        width={width}
        height={height}
        enabled={enabled}
        stageRef={stageRef}
        segments={segments}
        rotationDegrees={rotationDegrees}
        snapshotMs={snapshotMs}
        autoSnapshot={autoSnapshot}
        exportCanvasRef={exportCanvasRef}
        hueShift={hueShift}
        snapshotTrigger={snapshotTrigger}
      />
    );
  }

  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node;
        if (exportCanvasRef) {
          exportCanvasRef.current = node;
        }
      }}
      width={width}
      height={height}
      data-export-opacity="1"
      data-export-blend="source-over"
      className={`absolute inset-0 pointer-events-none ${
        isReady ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        filter: hueShift ? `hue-rotate(${hueShift}deg)` : 'none',
      }}
    />
  );
}

function CanvasMirrorFallback({
  width,
  height,
  enabled,
  stageRef,
  segments,
  rotationDegrees,
  snapshotMs,
  autoSnapshot,
  exportCanvasRef,
  hueShift = 0,
  snapshotTrigger = 0,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const previewSector =
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('previewSector');

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const capture = () => {
      if (document?.visibilityState === 'hidden') return;
      const stage = stageRef?.current;
      if (!stage) return;
      try {
        const url = stage.toDataURL({ pixelRatio: 1 });
        if (!cancelled) setSnapshotUrl(url);
      } catch (err) {
        console.error('Mirror snapshot failed', err);
      }
    };
    capture();
    const computeInterval = () => {
      if (!autoSnapshot) return Math.max(250, snapshotMs);
      const area = width * height;
      const areaFactor = Math.min(1.5, Math.max(0.5, area / (1920 * 1080)));
      const segmentFactor = Math.max(0.7, 1.4 - segments * 0.05);
      const base = 900 * areaFactor * segmentFactor;
      return Math.max(280, Math.min(1400, base));
    };
    const interval = setInterval(capture, computeInterval());
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled, stageRef, snapshotMs, autoSnapshot, width, height, segments]);

  useEffect(() => {
    if (!enabled) return;
    const stage = stageRef?.current;
    if (!stage) return;
    try {
      const url = stage.toDataURL({ pixelRatio: 1 });
      setSnapshotUrl(url);
    } catch (err) {
      console.error('Mirror snapshot failed', err);
    }
  }, [snapshotTrigger, enabled]);

  useEffect(() => {
    if (!snapshotUrl) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setIsReady(true);
    };
    img.src = snapshotUrl;
  }, [snapshotUrl]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const render = (now) => {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const bufferWidth = Math.max(1, Math.round(width * dpr));
      const bufferHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const model = getLensModel({
        width,
        height,
        segments,
        rotationDegrees,
      });
      const rotation = model.startAngleRad;
      if (canvasRef.current) {
        canvasRef.current.dataset.rotation = String(rotation);
        canvasRef.current.dataset.segmentAngle = String(
          model.segmentAngleRad
        );
      }
      ctx.clearRect(0, 0, width, height);
      const img = imageRef.current;
      if (img) {
        const seg = model.segments;
        const angle = model.segmentAngleRad;
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.max(width, height);
        const startAngle = rotation;
        if (previewSector) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(startAngle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, 0, angle);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, -cx, -cy, width, height);
          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(startAngle);
          for (let i = 0; i < seg; i++) {
            ctx.save();
            ctx.rotate(i * angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, 0, angle);
            ctx.closePath();
            ctx.clip();
            if (i % 2 === 1) ctx.scale(-1, 1);
            ctx.drawImage(img, -cx, -cy, width, height);
            ctx.restore();
          }
          ctx.restore();
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(startAngle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, 0, angle);
          ctx.closePath();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = '#000';
          ctx.fill();
          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, width, height, segments, rotationDegrees]);

  if (!enabled) return null;
  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node;
        if (exportCanvasRef) {
          exportCanvasRef.current = node;
        }
      }}
      width={width}
      height={height}
      data-export-opacity="1"
      data-export-blend="source-over"
      className={`absolute inset-0 pointer-events-none ${
        isReady ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        filter: hueShift ? `hue-rotate(${hueShift}deg)` : 'none',
      }}
    />
  );
}
