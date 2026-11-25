"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { profile } from "@/content/profile";

/**
 * Premium visiting card: real extruded geometry (rounded corners, bevelled silver edge), a matte-black
 * brushed-titanium face and embossed silver lettering drawn to a canvas texture from profile.card.
 *
 * Scroll drives one choreography (progress p over the sticky hero):
 *   rest -> lift -> rotate -> approach (fills the viewport) -> entry (surface rushes past the camera).
 * The CSS "portal" in Hero.tsx opens at the end so the next section is revealed seamlessly.
 */

type Pointer = { x: number; y: number };

const W = 1.7; // card width (ISO ID-1 ratio 85.6 x 54 mm)
const H = 1.072;
const R = 0.075; // corner radius
const DEPTH = 0.05;
const BEVEL = 0.012;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function heroProgress(): number {
  const el = document.getElementById("home");
  if (!el) return 0;
  const total = Math.max(1, el.offsetHeight - window.innerHeight);
  return clamp(-el.getBoundingClientRect().top / total);
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Fine horizontal brushing, used as a bump and roughness map. */
function brushedTexture(): THREE.CanvasTexture {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  let seed = 11;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 2600; i++) {
    const y = rnd() * size;
    const len = 60 + rnd() * 380;
    const x = rnd() * size;
    const v = 100 + rnd() * 56;
    g.strokeStyle = `rgba(${v},${v},${v},${0.1 + rnd() * 0.22})`;
    g.lineWidth = 0.5 + rnd() * 1.1;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y);
    g.stroke();
    if (x + len > size) {
      g.beginPath();
      g.moveTo(x - size, y);
      g.lineTo(x - size + len, y);
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1.15, 1.15);
  t.anisotropy = 4;
  return t;
}

function fontFamily(variable: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || fallback;
}

/** Draws the silver lettering on a transparent canvas. Re-run once the web fonts have loaded. */
function drawLettering(canvas: HTMLCanvasElement) {
  const g = canvas.getContext("2d")!;
  const cw = canvas.width;
  const ch = canvas.height;
  g.clearRect(0, 0, cw, ch);

  const sans = fontFamily("--font-sans", "system-ui, sans-serif");
  const serif = fontFamily("--font-serif", "Georgia, serif");
  const c = profile.card;
  const padX = cw * 0.07;
  const silver = "#eceef2";
  const dim = "#b4b8c0";

  g.textBaseline = "alphabetic";
  const spaced = (text: string, x: number, y: number, size: number, spacing: number, color: string, align: CanvasTextAlign = "left") => {
    g.font = `500 ${size}px ${sans}`;
    g.fillStyle = color;
    g.textAlign = "left";
    // Manual tracking: measure each glyph so the letter spacing is exact.
    const chars = [...text];
    const widths = chars.map((ch2) => g.measureText(ch2).width + spacing);
    const total = widths.reduce((a, b) => a + b, 0) - spacing;
    let px = align === "right" ? x - total : x;
    chars.forEach((ch2, i) => {
      g.fillText(ch2, px, y);
      px += widths[i];
    });
  };

  spaced(c.label.toUpperCase(), padX, ch * 0.13, ch * 0.034, ch * 0.007, dim);
  spaced(c.index, cw - padX, ch * 0.13, ch * 0.034, ch * 0.007, dim, "right");

  g.font = `400 ${ch * 0.23}px ${serif}`;
  g.fillStyle = silver;
  g.textAlign = "left";
  g.fillText(c.name, padX, ch * 0.4);

  g.font = `400 ${ch * 0.05}px ${sans}`;
  g.fillStyle = dim;
  g.fillText(c.role, padX, ch * 0.49);

  g.fillStyle = "rgba(217,220,226,0.55)";
  g.fillRect(padX, ch * 0.575, cw - padX * 2, Math.max(1.5, ch * 0.003));

  g.font = `500 ${ch * 0.058}px ${sans}`;
  g.fillStyle = silver;
  g.fillText(c.school, padX, ch * 0.69);
  g.font = `400 ${ch * 0.05}px ${sans}`;
  g.fillStyle = dim;
  g.fillText(c.building, padX, ch * 0.77);

  spaced(profile.name.toUpperCase(), padX, ch * 0.92, ch * 0.034, ch * 0.007, dim);
  spaced(profile.contact.country.toUpperCase(), cw - padX, ch * 0.92, ch * 0.034, ch * 0.007, dim, "right");
}

function Card({ pointer, reduced }: { pointer: RefObject<Pointer>; reduced: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const shadow = useRef<THREE.Mesh>(null!);

  const body = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(W - BEVEL * 2, H - BEVEL * 2, R), {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 4,
      curveSegments: 28,
    });
    geo.translate(0, 0, -DEPTH / 2);
    return geo;
  }, []);

  const brushed = useMemo(() => brushedTexture(), []);
  const lettering = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1700;
    c.height = 1072;
    drawLettering(c);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { canvas: c, texture: t };
  }, []);

  // Redraw with the real fonts once they are available.
  useEffect(() => {
    let alive = true;
    const sans = fontFamily("--font-sans", "sans-serif");
    const serif = fontFamily("--font-serif", "serif");
    Promise.all([document.fonts.load(`400 40px ${serif}`), document.fonts.load(`500 40px ${sans}`), document.fonts.ready])
      .catch(() => undefined)
      .then(() => {
        if (!alive) return;
        drawLettering(lettering.canvas);
        lettering.texture.needsUpdate = true;
      });
    return () => {
      alive = false;
    };
  }, [lettering]);

  const mats = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({
      color: "#101113",
      metalness: 0.78,
      roughness: 0.46,
      roughnessMap: brushed,
      bumpMap: brushed,
      bumpScale: 0.6,
      anisotropy: 0.7,
      clearcoat: 0.12,
      clearcoatRoughness: 0.6,
    });
    const edge = new THREE.MeshStandardMaterial({ color: "#cfd2d8", metalness: 1, roughness: 0.2 });
    const text = new THREE.MeshStandardMaterial({
      map: lettering.texture,
      bumpMap: lettering.texture,
      bumpScale: 1.4,
      color: "#ffffff",
      metalness: 0.55,
      roughness: 0.35,
      emissive: new THREE.Color("#9a9ea6"),
      emissiveMap: lettering.texture,
      emissiveIntensity: 0.4,
      transparent: true,
      depthWrite: false,
    });
    return { face, edge, text, array: [face, edge] as THREE.Material[] };
  }, [brushed, lettering]);

  const shadowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(0,0,0,0.85)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useEffect(
    () => () => {
      body.dispose();
      brushed.dispose();
      lettering.texture.dispose();
      shadowTex.dispose();
      mats.face.dispose();
      mats.edge.dispose();
      mats.text.dispose();
    },
    [body, brushed, lettering, shadowTex, mats],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = heroProgress();
    const vw = state.viewport.width;
    const vh = state.viewport.height;
    const portrait = vw / vh < 0.95;

    // Resting size and position: right column on desktop, below the copy on phones.
    const restWidth = portrait ? vw * 0.8 : vw * 0.35;
    const s0 = restWidth / W;
    const x0 = portrait ? 0 : vw * 0.205;
    const y0 = portrait ? -vh * 0.2 : -vh * 0.02;
    const sFill = Math.max(vw / W, vh / H) * 1.18;

    // Keyframes: [progress, x, y, z, rotX, rotY, rotZ, scale]
    const keys: number[][] = [
      [0.0, x0, y0, 0, -0.8, -0.38, 0.06, s0],
      [0.2, x0 * 0.85, y0 + vh * 0.1, 0.35, -0.45, -0.22, 0.05, s0 * 1.04],
      [0.42, x0 * 0.4, y0 + vh * 0.12, 0.8, -0.12, 0.5, -0.04, s0 * 1.25],
      [0.68, 0, 0, 1.0, 0, 0, 0, sFill],
      [1.0, 0, 0, 1.0, 0, 0, 0, sFill * 2.6],
    ];
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const k = smooth(clamp((p - a[0]) / (b[0] - a[0])));
    const g = root.current;
    const calm = reduced ? 0 : 1;
    const rest = 1 - smooth(clamp(p / 0.16)); // idle float and pointer fade as the scroll begins
    const px = (pointer.current?.x ?? 0) * calm;
    const py = (pointer.current?.y ?? 0) * calm;

    g.position.set(lerp(a[1], b[1], k), lerp(a[2], b[2], k) + Math.sin(t * 0.9) * 0.035 * rest * calm, lerp(a[3], b[3], k));
    g.rotation.set(
      lerp(a[4], b[4], k) - py * 0.07 * rest + Math.sin(t * 0.6) * 0.015 * rest * calm,
      lerp(a[5], b[5], k) + px * 0.12 * rest + Math.cos(t * 0.5) * 0.02 * rest * calm,
      lerp(a[6], b[6], k),
    );
    g.scale.setScalar(lerp(a[7], b[7], k));

    // Soft contact shadow on the resting surface, gone once the card lifts.
    if (shadow.current) {
      const m = shadow.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.75 * (1 - smooth(clamp(p / 0.2)));
      shadow.current.position.set(x0, y0 - H * s0 * 0.5 - 0.02, -0.2);
      shadow.current.scale.set(s0 * W * 1.3, s0 * 0.55, 1);
    }
  });

  const frontZ = DEPTH / 2 + BEVEL + 0.0015;
  return (
    <>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <group ref={root}>
        <mesh geometry={body} material={mats.array} />
        <mesh position={[0, 0, frontZ]} material={mats.text}>
          <planeGeometry args={[W, H]} />
        </mesh>
      </group>
    </>
  );
}

export default function CardScene({
  pointer,
  reduced,
  active,
  onReady,
  onLost,
}: {
  pointer: RefObject<Pointer>;
  reduced: boolean;
  active: boolean;
  onReady: () => void;
  onLost: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", () => onLost(), { once: true });
        onReady();
      }}
      aria-hidden
    >
      <ambientLight intensity={0.12} />
      <directionalLight position={[-3, 4, 5]} intensity={0.9} color="#fff4e6" />
      <Environment resolution={256} frames={1}>
        {/* A tall softbox and two thin strips: they sweep across the brushed face and the silver edge as the card turns. */}
        <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[-4, 3, 3]} rotation={[0, 0.7, 0.4]} scale={[3, 9, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#f1ece3" position={[5, 1, 2]} rotation={[0, -1.1, 0]} scale={[1.4, 8, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#dfe6f2" position={[0, 6, -1]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, -4, 3]} rotation={[-Math.PI / 2, 0, 0]} scale={[8, 1.2, 1]} />
      </Environment>
      <Card pointer={pointer} reduced={reduced} />
    </Canvas>
  );
}
