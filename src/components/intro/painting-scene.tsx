"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { FALL_DURATION_MS } from "@/components/intro/intro-constants";

export type IntroPhase = "idle" | "falling" | "done";

export type PaintingSceneProps = {
  phase: IntroPhase;
  /** Static painting (no ripple) and a plain fade instead of the shatter. */
  reducedMotion?: boolean;
  className?: string;
};

const IMAGE_SRC = "/intro/creation-of-adam.jpg";
const SCENE_WIDTH = 6;
const CAMERA_FOV = 45;

const RIPPLE_RADIUS = 1.4;
const RIPPLE_WAVE_NUMBER = 9.0;
const RIPPLE_FREQUENCY = 5.5;
const RIPPLE_AMPLITUDE_Z = 0.12;
const RIPPLE_UV_WARP = 0.018;
const MOUSE_SENTINEL = 9999;
// How fast uStrength eases toward its target (per second) — ~600ms to fade
// out after a finger lifts, instead of the ripple snapping off.
const STRENGTH_EASE = 5;
// Touch screens have no hover, so with no finger down the ripple drifts on
// its own along a slow Lissajous path near the hands.
const AMBIENT_STRENGTH = 0.6;
const AMBIENT_RADIUS_X = 0.55;
const AMBIENT_RADIUS_Y = 0.35;

// Shatter grid density, expressed as shards across the *visible* frame so a
// portrait cover-fit (which only shows a narrow slice of the plane) still
// breaks into many visible pieces.
const SHARDS_VISIBLE_LANDSCAPE = { cols: 10, rows: 5 };
const SHARDS_VISIBLE_PORTRAIT = { cols: 5, rows: 8 };
const MAX_SHARDS = 160;

// Eyeballed UV position of the fingers-almost-touching point in
// creation-of-adam.jpg (three.js UV convention: u=0 left/1 right, v=0
// bottom/1 top). CROP_SCALE keeps u/v equal so the zoomed crop stays
// undistorted (the plane's aspect ratio matches the full image's). This
// crop is chosen so that point lands at UV (0.5, 0.5) of the visible
// frame — i.e. at the plane's local origin, which is also screen-center,
// where the name/caption overlay sits.
const HANDS_U = 0.365;
const HANDS_V = 0.55;
// As large as it can be while still keeping HANDS_U/HANDS_V exactly centered
// (limited by how close the hands sit to the image's left edge — a bigger
// value would clip past u=0 and re-introduce off-center drift).
const CROP_SCALE = 0.7;
const CROP_OFFSET_U = Math.min(Math.max(HANDS_U - CROP_SCALE / 2, 0), 1 - CROP_SCALE);
const CROP_OFFSET_V = Math.min(Math.max(HANDS_V - CROP_SCALE / 2, 0), 1 - CROP_SCALE);

const GLOW_RADIUS = 0.55;
const GLOW_STRENGTH = 0.85;

const VERTEX_SHADER = /* glsl */ `
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uRadius;
  uniform float uWaveNumber;
  uniform float uFrequency;
  uniform float uAmplitudeZ;
  uniform float uStrength;

  varying vec2 vUv;
  varying vec2 vPos;

  void main() {
    vUv = uv;
    vPos = position.xy;
    vec3 pos = position;
    float dist = distance(position.xy, uMouse);
    float falloff = uStrength * exp(-(dist * dist) / uRadius);
    float ripple = sin(dist * uWaveNumber - uTime * uFrequency) * falloff;
    pos.z += ripple * uAmplitudeZ;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Ripple is recomputed per-fragment (not interpolated from the vertex shader) so
// it stays crisp regardless of the plane's vertex density — interpolating a
// sin() output linearly across the grid would show faceting at the segment
// resolution. The pow(2.2) decode counters three.js's automatic output
// colorspace conversion, which would otherwise double-encode the sRGB JPEG.
// uCropOffset/uCropScale zoom the sampled UV into the hands region (see
// HANDS_U/HANDS_V above); the glow term brightens toward white around the
// plane's local origin, which — because of that crop — is the hands, and
// which is also screen-center where the name/caption sits, so the glow
// shows through softened by that panel's own backdrop-blur.
const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uRadius;
  uniform float uWaveNumber;
  uniform float uFrequency;
  uniform float uUvWarp;
  uniform vec2 uCropOffset;
  uniform vec2 uCropScale;
  uniform float uGlowRadius;
  uniform float uGlowStrength;
  uniform float uStrength;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec2 vPos;

  void main() {
    float dist = distance(vPos, uMouse);
    float falloff = uStrength * exp(-(dist * dist) / uRadius);
    float ripple = sin(dist * uWaveNumber - uTime * uFrequency) * falloff;
    vec2 dir = dist > 1e-4 ? (vPos - uMouse) / dist : vec2(0.0);

    vec2 baseUv = uCropOffset + vUv * uCropScale;
    vec2 warpedUv = clamp(
      baseUv + dir * ripple * uUvWarp * uCropScale,
      uCropOffset,
      uCropOffset + uCropScale
    );

    vec4 texel = texture2D(map, warpedUv);
    vec3 linearColor = pow(texel.rgb, vec3(2.2));

    float centerDist = length(vPos);
    float pulse = 0.85 + 0.15 * sin(uTime * 1.6);
    float glow = uGlowStrength * pulse * exp(-(centerDist * centerDist) / uGlowRadius);
    vec3 litColor = mix(linearColor, vec3(1.0), clamp(glow, 0.0, 1.0));

    gl_FragColor = vec4(litColor, uOpacity);
  }
`;

type ShardVelocity = {
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
};

/**
 * Renders `IMAGE_SRC` as a full-color textured plane (three.js, no
 * @react-three/fiber — a one-shot, manually-driven scene doesn't need a
 * declarative reconciler). Idle: a shader-based ripple follows the cursor.
 * `phase === "falling"`: the plane is replaced by a grid of shard meshes that
 * tumble outward with gravity and fade out. Silently renders nothing if
 * WebGL is unavailable or the image fails to load — IntroGate still shows
 * the name/caption/button in that case.
 */
export function PaintingScene({ phase, reducedMotion = false, className }: PaintingSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<IntroPhase>(phase);
  const fallStartRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "falling" && fallStartRef.current === null) {
      fallStartRef.current = performance.now();
    }
  }, [phase]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    let disposed = false;
    let rafId = 0;
    const sceneDims = { width: SCENE_WIDTH, height: SCENE_WIDTH * 0.45 };
    // World-space size of what the camera actually shows at the plane (z=0).
    const visible = { width: SCENE_WIDTH, height: SCENE_WIDTH * 0.45 };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    function fitCamera(clientWidth: number, clientHeight: number) {
      const aspect = clientWidth / clientHeight;
      const fovRad = (camera.fov * Math.PI) / 180;
      const tanHalf = Math.tan(fovRad / 2);
      // Portrait (phones): cover-fit — the plane fills the screen height and
      // overflows sideways, staying centered on the hands. Landscape keeps a
      // contain-fit with a margin so the whole crop is visible.
      const portrait = aspect < 1;
      const margin = portrait ? 1 : 1.2;
      const zForHeight = (sceneDims.height * margin) / (2 * tanHalf);
      const zForWidth = (sceneDims.width * margin) / (2 * tanHalf * aspect);
      camera.position.z = Math.max(
        portrait ? Math.min(zForHeight, zForWidth) : Math.max(zForHeight, zForWidth),
        0.5,
      );
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      visible.height = 2 * tanHalf * camera.position.z;
      visible.width = visible.height * aspect;
    }

    function resize() {
      const clientWidth = container?.clientWidth ?? 0;
      const clientHeight = container?.clientHeight ?? 0;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
      fitCamera(clientWidth, clientHeight);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    function onPointerMove(event: PointerEvent) {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      pointerRef.current.active = true;
    }
    function onPointerEnd(event: PointerEvent) {
      // A lifted finger keeps its last position so the ripple fades in place.
      if (event.pointerType !== "mouse" || event.type === "pointerleave") {
        pointerRef.current.active = false;
      }
    }
    container.addEventListener("pointerdown", onPointerMove, { passive: true });
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerup", onPointerEnd, { passive: true });
    container.addEventListener("pointercancel", onPointerEnd, { passive: true });
    container.addEventListener("pointerleave", onPointerEnd, { passive: true });

    let idleGeometry: THREE.PlaneGeometry | null = null;
    let idleMaterial: THREE.ShaderMaterial | null = null;
    let idleMesh: THREE.Mesh | null = null;
    let texture: THREE.Texture | null = null;

    let shardGroup: THREE.Group | null = null;
    let shardMaterial: THREE.MeshBasicMaterial | null = null;
    let shardVelocities: ShardVelocity[] = [];
    let shatterBuilt = false;

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const uniforms = {
      map: { value: null as THREE.Texture | null },
      uMouse: { value: new THREE.Vector2(MOUSE_SENTINEL, MOUSE_SENTINEL) },
      uTime: { value: 0 },
      uRadius: { value: RIPPLE_RADIUS },
      uWaveNumber: { value: RIPPLE_WAVE_NUMBER },
      uFrequency: { value: RIPPLE_FREQUENCY },
      uAmplitudeZ: { value: RIPPLE_AMPLITUDE_Z },
      uUvWarp: { value: RIPPLE_UV_WARP },
      uCropOffset: { value: new THREE.Vector2(CROP_OFFSET_U, CROP_OFFSET_V) },
      uCropScale: { value: new THREE.Vector2(CROP_SCALE, CROP_SCALE) },
      uGlowRadius: { value: GLOW_RADIUS },
      uGlowStrength: { value: GLOW_STRENGTH },
      uStrength: { value: 0 },
      uOpacity: { value: 1 },
    };

    const isTouchOnly = window.matchMedia("(hover: none)").matches;

    const loader = new THREE.TextureLoader();
    loader.load(
      IMAGE_SRC,
      (loadedTexture) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }
        texture = loadedTexture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const { width, height } = texture.image as HTMLImageElement;
        sceneDims.height = SCENE_WIDTH * (height / width);
        resize();

        uniforms.map.value = texture;

        const segX = 128;
        const segY = Math.max(1, Math.round(128 * (height / width)));
        idleGeometry = new THREE.PlaneGeometry(SCENE_WIDTH, sceneDims.height, segX, segY);
        idleMaterial = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          side: THREE.FrontSide,
          transparent: true,
        });
        idleMesh = new THREE.Mesh(idleGeometry, idleMaterial);
        scene.add(idleMesh);
      },
      undefined,
      () => {
        // Image failed to load — gate still shows name/caption/button.
      },
    );

    function buildShatter() {
      if (shatterBuilt || !texture || !idleMesh) return;
      shatterBuilt = true;
      idleMesh.visible = false;

      // Size shards from the visible frame, then tile the whole plane with
      // them (off-screen ones are cheap and fly in from the edges).
      const target = visible.width < visible.height ? SHARDS_VISIBLE_PORTRAIT : SHARDS_VISIBLE_LANDSCAPE;
      const frameW = Math.min(visible.width, sceneDims.width);
      const frameH = Math.min(visible.height, sceneDims.height);
      let cols = Math.max(1, Math.round((sceneDims.width / frameW) * target.cols));
      let rows = Math.max(1, Math.round((sceneDims.height / frameH) * target.rows));
      if (cols * rows > MAX_SHARDS) {
        const scale = Math.sqrt(MAX_SHARDS / (cols * rows));
        cols = Math.max(1, Math.floor(cols * scale));
        rows = Math.max(1, Math.floor(rows * scale));
      }
      const shardW = sceneDims.width / cols;
      const shardH = sceneDims.height / rows;

      shardMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      shardGroup = new THREE.Group();
      shardVelocities = [];

      let index = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Same crop mapping as the idle shader's uCropOffset/uCropScale, so
          // the shatter shows the same zoomed-in region rather than snapping
          // back to the full uncropped image.
          const u0 = CROP_OFFSET_U + (col / cols) * CROP_SCALE;
          const u1 = CROP_OFFSET_U + ((col + 1) / cols) * CROP_SCALE;
          const v0 = CROP_OFFSET_V + (1 - (row + 1) / rows) * CROP_SCALE;
          const v1 = CROP_OFFSET_V + (1 - row / rows) * CROP_SCALE;
          const centerX = -sceneDims.width / 2 + (col + 0.5) * shardW;
          const centerY = sceneDims.height / 2 - (row + 0.5) * shardH;

          const geometry = new THREE.PlaneGeometry(shardW, shardH);
          const uvAttr = geometry.getAttribute("uv") as THREE.BufferAttribute;
          for (let i = 0; i < uvAttr.count; i++) {
            uvAttr.setXY(
              i,
              u0 + uvAttr.getX(i) * (u1 - u0),
              v0 + uvAttr.getY(i) * (v1 - v0),
            );
          }
          uvAttr.needsUpdate = true;

          const mesh = new THREE.Mesh(geometry, shardMaterial);
          mesh.position.set(centerX, centerY, index * 0.0005);
          shardGroup.add(mesh);

          const offsetLength = Math.hypot(centerX, centerY) || 1;
          const dirX = centerX / offsetLength;
          const dirY = centerY / offsetLength;
          const radialSpeed = 0.6 + Math.random() * 1.0;

          shardVelocities.push({
            vx: dirX * radialSpeed + (Math.random() - 0.5) * 0.3,
            vy: dirY * radialSpeed + (Math.random() - 0.5) * 0.3,
            vz: (Math.random() - 0.5) * 0.4,
            rx: (Math.random() - 0.5) * 4,
            ry: (Math.random() - 0.5) * 4,
            rz: (Math.random() - 0.5) * 6,
          });

          index++;
        }
      }

      scene.add(shardGroup);
    }

    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      if (!container) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      uniforms.uTime.value += delta;

      if (phaseRef.current === "idle" && idleMesh) {
        let targetStrength = 0;
        if (reducedMotion) {
          targetStrength = 0;
        } else if (pointerRef.current.active) {
          const rect = container.getBoundingClientRect();
          const ndcX = ((pointerRef.current.x - rect.left) / rect.width) * 2 - 1;
          const ndcY = -(((pointerRef.current.y - rect.top) / rect.height) * 2 - 1);
          ndc.set(ndcX, ndcY);
          raycaster.setFromCamera(ndc, camera);
          const hits = raycaster.intersectObject(idleMesh, false);
          if (hits.length > 0) {
            uniforms.uMouse.value.set(hits[0].point.x, hits[0].point.y);
            targetStrength = 1;
          }
        } else if (isTouchOnly) {
          const t = uniforms.uTime.value;
          const ambientX = Math.sin(t * 0.37) * AMBIENT_RADIUS_X * Math.min(visible.width, sceneDims.width) * 0.5;
          const ambientY = Math.sin(t * 0.53 + 1.1) * AMBIENT_RADIUS_Y * Math.min(visible.height, sceneDims.height) * 0.5;
          uniforms.uMouse.value.set(ambientX, ambientY);
          targetStrength = AMBIENT_STRENGTH;
        }
        // Ease toward the target; once fully faded, park the ripple far away.
        const current = uniforms.uStrength.value;
        uniforms.uStrength.value =
          current + (targetStrength - current) * Math.min(1, delta * STRENGTH_EASE);
        if (uniforms.uStrength.value < 0.01 && targetStrength === 0) {
          uniforms.uMouse.value.set(MOUSE_SENTINEL, MOUSE_SENTINEL);
        }
      } else if (phaseRef.current === "falling" && reducedMotion) {
        const elapsed = fallStartRef.current ? performance.now() - fallStartRef.current : 0;
        uniforms.uStrength.value = 0;
        uniforms.uOpacity.value = Math.max(0, 1 - elapsed / FALL_DURATION_MS);
      } else if (phaseRef.current === "falling") {
        buildShatter();

        if (shardGroup && shardMaterial) {
          const gravity = 2.2;
          shardGroup.children.forEach((child, i) => {
            const mesh = child as THREE.Mesh;
            const velocity = shardVelocities[i];
            if (!velocity) return;
            velocity.vy -= gravity * delta;
            mesh.position.x += velocity.vx * delta;
            mesh.position.y += velocity.vy * delta;
            mesh.position.z += velocity.vz * delta;
            mesh.rotation.x += velocity.rx * delta;
            mesh.rotation.y += velocity.ry * delta;
            mesh.rotation.z += velocity.rz * delta;
          });

          const elapsed = fallStartRef.current ? performance.now() - fallStartRef.current : 0;
          shardMaterial.opacity = Math.max(0, 1 - elapsed / FALL_DURATION_MS);
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerMove);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerEnd);
      container.removeEventListener("pointercancel", onPointerEnd);
      container.removeEventListener("pointerleave", onPointerEnd);

      texture?.dispose();
      idleGeometry?.dispose();
      idleMaterial?.dispose();
      shardGroup?.children.forEach((child) => {
        (child as THREE.Mesh).geometry.dispose();
      });
      shardMaterial?.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  // touch-action: none — the intro is a fixed modal with nothing to scroll,
  // so finger drags should feed the ripple instead of panning the page.
  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full touch-none", className)}
      aria-hidden
    />
  );
}
