import { useEffect, useRef, useState } from 'react';

// WebGL mirror renderer (with a 2D fallback if WebGL is unavailable)
export function WebGLMirrorCanvas({
  stageRef,
  enabled,
  segments = 6,
  rotationSpeed = 0.2, // degrees per second
  width,
  height,
  snapshotMs = 900,
  autoSnapshot = true,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const textureDirtyRef = useRef(false);
  const glStateRef = useRef(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [fallback2D, setFallback2D] = useState(false);

  const clampSegments = (value) => Math.max(2, Math.min(value, 24));

  // Capture Konva snapshot periodically
  useEffect(() => {
    if (!enabled) {
      setSnapshotUrl(null);
      return;
    }

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

  // Load snapshot into image for texture upload
  useEffect(() => {
    if (!snapshotUrl) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      textureDirtyRef.current = true;
    };
    img.src = snapshotUrl;
  }, [snapshotUrl]);

  // Initialize WebGL
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true }) ||
      canvas.getContext('experimental-webgl');

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
      uniform float u_segments;
      uniform float u_rotation;
      void main() {
        float seg = max(2.0, u_segments);
        float segAngle = 6.28318530718 / seg;

        // center with aspect correction
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        vec2 p = (v_uv - 0.5) * aspect;
        float r = length(p);
        float theta = atan(p.y, p.x) + u_rotation;
        float sector = floor(theta / segAngle);
        float localTheta = mod(theta, segAngle);
        if (mod(sector, 2.0) >= 1.0) {
          localTheta = segAngle - localTheta;
        }
        vec2 dir = vec2(cos(localTheta), sin(localTheta));
        vec2 mapped = dir * r;
        mapped = mapped / aspect + 0.5;

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
    const segmentsLoc = gl.getUniformLocation(program, 'u_segments');
    const rotationLoc = gl.getUniformLocation(program, 'u_rotation');
    const textureLoc = gl.getUniformLocation(program, 'u_texture');

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
      uniforms: { resolutionLoc, segmentsLoc, rotationLoc, textureLoc },
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
    const start = performance.now();

    const render = (now) => {
      const elapsed = (now - start) / 1000;
      const rotationRadians = rotationSpeed * (Math.PI / 180) * elapsed;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);

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
      gl.uniform1f(uniforms.segmentsLoc, clampSegments(segments));
      gl.uniform1f(uniforms.rotationLoc, rotationRadians);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, state.texture);
      gl.uniform1i(uniforms.textureLoc, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, fallback2D, segments, rotationSpeed, width, height]);

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
        rotationSpeed={rotationSpeed}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none mix-blend-screen opacity-75"
    />
  );
}

function CanvasMirrorFallback({
  width,
  height,
  enabled,
  stageRef,
  segments,
  rotationSpeed,
  snapshotMs,
  autoSnapshot,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);

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
    if (!snapshotUrl) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = snapshotUrl;
  }, [snapshotUrl]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    const start = performance.now();

    const render = (now) => {
      const rotation = (rotationSpeed * Math.PI) / 180 * ((now - start) / 1000);
      ctx.clearRect(0, 0, width, height);
      const img = imageRef.current;
      if (img) {
        const seg = Math.max(2, Math.min(segments, 24));
        const angle = (2 * Math.PI) / seg;
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.max(width, height);
        for (let i = 0; i < seg; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(i * angle + rotation);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, -angle / 2, angle / 2);
          ctx.closePath();
          ctx.clip();
          if (i % 2 === 1) ctx.scale(-1, 1);
          ctx.drawImage(img, -cx, -cy, width, height);
          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, width, height, segments, rotationSpeed]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
    />
  );
}
