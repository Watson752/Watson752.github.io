"use client";

import { useEffect, useRef } from "react";
import { onIntroDone } from "@/components/intro/intro-session";
import { readTheme, subscribeTheme } from "@/lib/theme/theme";

/** How long the snake takes to draw from the page top to past the bottom. */
const DRAW_MS = 24000;
/** Soft fade length (CSS px) between the lit trail and the undrawn page below the head. */
const HEAD_FADE_PX = 140;
/** Half-width (CSS px) of the solid white-hot core; the glow falls off beyond it. */
const CORE_PX = 22.5;
/** How far the glow halo spreads past the core (CSS px). Bigger = wider, softer line. */
const HALO_PX = 3;

// A vertical neon line in *document* coordinates: the canvas is fixed to the
// viewport, so each pixel is mapped back to its page y via the scroll offset.
// x is a function of y, so the path can only ever travel downward.
// Glow is the reference pen's inverse-distance falloff, sampled per channel at
// slightly offset y to keep the spectral fringe toward the edges.
const FRAG = `
precision highp float;
uniform vec2 uViewport;   // CSS px
uniform float uPxRatio;   // drawing-buffer px per CSS px
uniform float uScrollY;
uniform float uHead;      // head position, document px
uniform float uSpark;     // 0..1, head bloom while drawing
uniform float uTime;
uniform vec3 uAmp;        // fractions of viewport width
uniform vec3 uFreq;       // radians per viewport height
uniform vec3 uPhase;
uniform vec3 uSpeed;
uniform float uCenter;    // fraction of width
uniform float uLight;     // 1 = light theme: black gradient instead of neon

float pathX(float y) {
  float yn = y / uViewport.y;
  float x = uCenter
    + uAmp.x * sin(uFreq.x * yn + uPhase.x + uSpeed.x * uTime)
    + uAmp.y * sin(uFreq.y * yn + uPhase.y + uSpeed.y * uTime)
    + uAmp.z * sin(uFreq.z * yn + uPhase.z + uSpeed.z * uTime);
  return x * uViewport.x;
}

// Distance from the curve, corrected for slope so the line keeps one thickness.
float curveDist(vec2 p, float y) {
  float cx = pathX(y);
  float slope = (pathX(y + 1.0) - pathX(y - 1.0)) * 0.5;
  return abs(p.x - cx) / sqrt(1.0 + slope * slope);
}

// White-hot core out to CORE_PX, then the neon glow falls off beyond it.
float glow(vec2 p, float y) {
  float d = curveDist(p, y);
  return (2.0 * ${HALO_PX.toFixed(1)}) / (max(d - ${CORE_PX.toFixed(1)}, 0.0) + ${HALO_PX.toFixed(1)});
}

void main() {
  vec2 frag = gl_FragCoord.xy / uPxRatio;
  float docY = uScrollY + (uViewport.y - frag.y);
  vec2 p = vec2(frag.x, docY);

  // Fringe grows toward the screen edges, but shrinks where the path runs
  // shallow so the channels don't fan out into wide bands.
  float slope = (pathX(docY + 1.0) - pathX(docY - 1.0)) * 0.5;
  float off = (9.0 + 0.03 * abs(frag.x - uViewport.x * 0.5)) / (1.0 + abs(slope));
  vec3 c = vec3(glow(p, docY + off), glow(p, docY), glow(p, docY - off));

  float mask = 1.0 - smoothstep(uHead - ${HEAD_FADE_PX.toFixed(1)}, uHead, docY);
  mask *= smoothstep(0.0, 60.0, docY);
  c *= mask;

  vec2 headPt = vec2(pathX(uHead - 10.0), uHead - 10.0);
  c += uSpark * vec3(1.0, 0.96, 0.92) * 34.0 / (length(p - headPt) + 24.0);

  vec3 col = 1.0 - exp(-c * 0.9);
  float a = max(col.r, max(col.g, col.b));

  if (uLight < 0.5) {
    gl_FragColor = vec4(col, a);
    return;
  }

  // Light theme: the same neon, with the white-hot core turned solid black.
  // The white part of each pixel (what all three channels share) becomes
  // black ink; the spectral fringe, where the channels split apart, keeps its
  // color. The canvas is fully opaque in light mode, so the 45% softness the
  // dark theme gets from CSS is applied here to the glow and fringe only,
  // leaving the core at full strength. Output is premultiplied.
  float white = min(col.r, min(col.g, col.b));
  // Core ink strength: 1.0 is solid black; 0.7 keeps it black but softer.
  float core = smoothstep(0.55, 0.8, white) * 0.7;
  float ink = max(core, white * 0.45);
  vec3 fringe = (col - white) * 0.45;
  float fringeA = max(fringe.r, max(fringe.g, fringe.b));
  gl_FragColor = vec4(fringe * (1.0 - ink), ink + fringeA * (1.0 - ink));
}
`;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function sign() {
  return Math.random() < 0.5 ? -1 : 1;
}

/** One random snake per mount: a long main sway with two smaller wiggles on top. */
function randomPath() {
  const amp = [rand(0.16, 0.26), rand(0.05, 0.1), rand(0.015, 0.035)];
  const total = amp[0] + amp[1] + amp[2];
  const center = rand(-0.08, 0.08);
  const room = 0.42 - Math.abs(center);
  const k = total > room ? room / total : 1;
  return {
    amp: amp.map((a) => a * k),
    // Radians per screen height: ~0.5–0.8 long sways, plus smaller ripples.
    freq: [rand(3, 5), rand(7, 10), rand(13, 18)],
    phase: [rand(0, Math.PI * 2), rand(0, Math.PI * 2), rand(0, Math.PI * 2)],
    speed: [sign() * rand(0.025, 0.06), sign() * rand(0.04, 0.09), sign() * rand(0.06, 0.12)],
    center: 0.5 + center,
  };
}

// Gentle sine ease: peaks at ~1.6x the average speed mid-page (a cubic would hit 3x).
function easeInOut(t: number) {
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("neon-flow shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// One snake per page load, shared by every NeonFlow mount. Client-side
// navigation (landing -> case study -> back) remounts the component, but
// module state survives, so the same path keeps swaying and the draw-in
// carries on (or stays finished) instead of starting over. A real reload
// gets a fresh module and a new random snake.
const session: {
  path: ReturnType<typeof randomPath> | null;
  drawStart: number | null;
  timeOrigin: number | null;
} = { path: null, drawStart: null, timeOrigin: null };

export type NeonFlowProps = {
  /** Hold the draw-in until the intro splash is gone (landing page). Elsewhere it starts at once. */
  waitForIntro?: boolean;
};

/**
 * Page background: a neon line that snakes down the whole document,
 * drawn in once, then left swaying as a living trail.
 * Fixed full-viewport canvas, decorative only.
 */
export function NeonFlow({ waitForIntro = false }: NeonFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("neon-flow program:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // One oversized triangle covers the viewport.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uViewport = u("uViewport");
    const uPxRatio = u("uPxRatio");
    const uScrollY = u("uScrollY");
    const uHead = u("uHead");
    const uSpark = u("uSpark");
    const uTime = u("uTime");
    const uLight = u("uLight");
    let light = readTheme() === "light";

    session.path ??= randomPath();
    const path = session.path;
    gl.uniform3fv(u("uAmp"), path.amp);
    gl.uniform3fv(u("uFreq"), path.freq);
    gl.uniform3fv(u("uPhase"), path.phase);
    gl.uniform3fv(u("uSpeed"), path.speed);
    gl.uniform1f(u("uCenter"), path.center);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vw = 0;
    let vh = 0;
    let docH = 0;
    // A soft glow doesn't need full resolution.
    const pxRatio = Math.max(0.6, Math.min(window.devicePixelRatio || 1, 2) * 0.5);

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      docH = document.documentElement.scrollHeight;
      canvas.width = Math.round(vw * pxRatio);
      canvas.height = Math.round(vh * pxRatio);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    measure();

    session.timeOrigin ??= performance.now();
    const timeOrigin = session.timeOrigin;
    let raf = 0;

    const render = (now: number) => {
      const drawStart = session.drawStart;
      const time = reduceMotion ? 0 : (now - timeOrigin) / 1000;

      const end = docH + vh;
      let head = -HEAD_FADE_PX;
      let spark = 0;
      if (reduceMotion) {
        head = end + HEAD_FADE_PX;
      } else if (drawStart !== null) {
        const t = Math.min((now - drawStart) / DRAW_MS, 1);
        head = easeInOut(t) * (end + HEAD_FADE_PX);
        spark = t < 1 ? Math.min(t * 8, 1) : 0;
      }

      gl.uniform2f(uViewport, vw, vh);
      gl.uniform1f(uPxRatio, pxRatio);
      gl.uniform1f(uScrollY, window.scrollY);
      gl.uniform1f(uHead, head);
      gl.uniform1f(uSpark, spark);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uLight, light ? 1 : 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      render(now);
      raf = requestAnimationFrame(loop);
    };

    // Reduced motion: a static, fully drawn path, re-rendered only when the view changes.
    const redraw = () => render(performance.now());

    const onResize = () => {
      measure();
      if (reduceMotion) redraw();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => {
      docH = document.documentElement.scrollHeight;
      if (reduceMotion) redraw();
    });
    ro.observe(document.body);

    const stopTheme = subscribeTheme(() => {
      light = readTheme() === "light";
      if (reduceMotion) redraw();
    });

    let stopIntro = () => {};
    if (reduceMotion) {
      window.addEventListener("scroll", redraw, { passive: true });
      redraw();
    } else {
      const start = () => {
        session.drawStart ??= performance.now();
      };
      if (waitForIntro) stopIntro = onIntroDone(start);
      else start();
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      stopIntro();
      stopTheme();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", redraw);
      // Free resources but keep the context: StrictMode re-runs this effect
      // on the same canvas, and a lost context can't be revived.
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [waitForIntro]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-45 [[data-theme=light]_&]:opacity-100"
    />
  );
}
