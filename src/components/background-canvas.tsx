'use client';

import { useEffect, useRef } from 'react';

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec4 aVertexPosition;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = aVertexPosition;
        v_texCoord = aVertexPosition.xy * 0.5 + 0.5;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;

      float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
      }

      void main() {
          vec2 uv = v_texCoord;
          vec2 p = uv * 2.0 - 1.0;
          p.x *= u_resolution.x / u_resolution.y;
          vec3 color = vec3(0.043, 0.051, 0.063);
          float scanPos = fract(u_time * 0.15);
          float scanLine = smoothstep(0.02, 0.0, abs(uv.y - scanPos));
          color += vec3(0.788, 0.659, 0.416) * scanLine * 0.15;
          float grain = hash(uv + u_time * 0.01) * 0.03;
          color += grain;
          float dist = length(p);
          float pulse = sin(u_time * 0.5 - dist * 4.0) * 0.5 + 0.5;
          color += vec3(0.788, 0.659, 0.416) * pulse * 0.02 * (1.0 - smoothstep(0.5, 1.0, dist));
          float vignette = 1.0 - smoothstep(0.4, 1.5, length(uv - 0.5));
          color *= vignette;
          gl_FragColor = vec4(color, 1.0);
      }
    `;

    const initShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = initShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = initShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(aVertexPosition);
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

    const u_time = gl.getUniformLocation(shaderProgram, 'u_time');
    const u_resolution = gl.getUniformLocation(shaderProgram, 'u_resolution');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u_resolution, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let raf = 0;
    const render = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(u_time, t);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      aria-hidden
    />
  );
}
