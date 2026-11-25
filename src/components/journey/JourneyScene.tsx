"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Tier } from "@/lib/deviceTier";
import { makeDetailBump, makeEarthMaps, makeGasTexture, makeRingTexture, makeRockTexture, makeSpaceBackdrop, type EarthMaps } from "./textures";

export interface JourneyCtl {
  /** Map pull-back into Earth, 0 to 1. */
  u1: number;
  /** Camera position along the route: 0 Earth, 1 first project world, 2 second, 3 third. */
  s: number;
  /** Set by the canvas so the scroll handler can request a redraw (the loop only runs on demand). */
  invalidate?: () => void;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** One sun for the whole scene, from the upper right. */
const SUN = new THREE.Vector3(4, 1.6, 2.2).normalize();
const EARTH_Z0 = 5.3;

/** The three project worlds. Radius is in Earth radii; positions are a composition, not a claim about anything. */
const WORLDS = [
  { pos: new THREE.Vector3(9, 1.2, -28), r: 1.25, view: new THREE.Vector3(-0.28, 0.1, 1).normalize(), bulge: new THREE.Vector3(4.5, 1.2, 0) },
  { pos: new THREE.Vector3(-8, -1.5, -56), r: 1.75, view: new THREE.Vector3(0.3, 0.12, 1).normalize(), bulge: new THREE.Vector3(-3, 0.3, 0) },
  { pos: new THREE.Vector3(7, 0.8, -86), r: 1.35, view: new THREE.Vector3(-0.25, -0.08, 1).normalize(), bulge: new THREE.Vector3(3, 0, 0) },
];

/* ───────────── Shaders ───────────── */

const earthVert = /* glsl */ `
varying vec2 vUv; varying vec3 vNW; varying vec3 vPW;
void main(){
  vUv = uv;
  vNW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const earthFrag = /* glsl */ `
uniform sampler2D uDay; uniform sampler2D uNight; uniform sampler2D uCloud;
uniform vec3 uSun; uniform float uFade; uniform float uShift;
varying vec2 vUv; varying vec3 vNW; varying vec3 vPW;
void main(){
  vec3 N = normalize(vNW);
  vec3 V = normalize(cameraPosition - vPW);
  float ndl = dot(N, uSun);
  float diff = clamp(ndl * 1.1 + 0.08, 0.0, 1.0);
  vec3 day = texture2D(uDay, vUv).rgb;
  vec4 nm = texture2D(uNight, vUv);
  float cl = texture2D(uCloud, vUv + vec2(uShift, 0.0)).r;

  day *= 1.0 - cl * 0.16;                                    // cloud shadow, softly
  vec3 col = day * (0.010 + 1.25 * diff * diff);
  // Warm light at the terminator.
  float tw = smoothstep(-0.12, 0.02, ndl) * (1.0 - smoothstep(0.02, 0.3, ndl));
  col *= mix(vec3(1.0), vec3(1.0, 0.74, 0.56), tw * 0.8);
  // Clouds, lit by the same sun.
  vec3 cloudCol = vec3(0.96, 0.97, 1.0) * (0.02 + 1.15 * diff * diff);
  col = mix(col, cloudCol, cl * 0.88);
  // Sun glint on open water.
  vec3 H = normalize(uSun + V);
  float sp = pow(max(dot(N, H), 0.0), 80.0) * nm.g * (1.0 - cl) * step(0.0, ndl) * 0.55;
  // City lights on the night side.
  vec3 city = nm.r * (1.0 - smoothstep(-0.14, 0.08, ndl)) * (1.0 - cl * 0.75) * vec3(1.0, 0.74, 0.44) * 0.85;
  // Limb scattering: pale blue on the day side only.
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.2);
  vec3 limb = vec3(0.30, 0.55, 1.0) * fres * (0.04 + 0.96 * smoothstep(-0.15, 0.55, ndl)) * 0.95;
  gl_FragColor = vec4(col + city + limb + sp * vec3(1.0, 0.94, 0.85), uFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const atmoVert = /* glsl */ `
varying vec3 vN; varying vec3 vPW;
void main(){
  vN = normalize(normalMatrix * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const atmoFrag = /* glsl */ `
uniform vec3 uSun; uniform vec3 uCenter; uniform vec3 uColor; uniform float uFade; uniform float uStrength;
varying vec3 vN; varying vec3 vPW;
void main(){
  float rim = pow(max(0.58 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.2);
  vec3 radial = normalize(vPW - uCenter);
  float sd = dot(radial, uSun);
  float sunF = smoothstep(-0.3, 0.6, sd);
  float tw = (1.0 - smoothstep(0.0, 0.4, abs(sd + 0.05)));
  vec3 col = mix(uColor, vec3(1.0, 0.62, 0.42), tw * 0.35);
  gl_FragColor = vec4(col, rim * sunF * uStrength * uFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const starVert = /* glsl */ `
attribute float aSize; attribute vec3 aColor; uniform float uScale;
varying vec3 vC;
void main(){
  vC = aColor;
  gl_PointSize = aSize * uScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const starFrag = /* glsl */ `
uniform float uOpacity; varying vec3 vC;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = exp(-d * d * 3.4);
  gl_FragColor = vec4(vC, a * uOpacity);
}`;

/* ───────────── Pieces ───────────── */

const SIZES = {
  high: { earth: 2048, rock: 1024, gas: 1024, sky: 1024 },
  mid: { earth: 1024, rock: 512, gas: 512, sky: 512 },
  low: { earth: 768, rock: 256, gas: 256, sky: 256 },
} as const;

function useAssets(tier: Tier) {
  const [assets, setAssets] = useState<null | {
    earth: EarthMaps;
    backdrop: THREE.Texture;
    rock0: THREE.Texture;
    rock2: THREE.Texture;
    gas: THREE.Texture;
    ring: THREE.Texture;
    bump: THREE.Texture;
  }>(null);
  useEffect(() => {
    let cancelled = false;
    const made: THREE.Texture[] = [];
    (async () => {
      const z = SIZES[tier];
      const earth = await makeEarthMaps(z.earth);
      made.push(earth.day, earth.night, earth.cloud);
      const backdrop = await makeSpaceBackdrop(z.sky);
      const rock0 = await makeRockTexture({ tint: [150, 148, 144], mare: 1, craters: 420, seed: 5, size: z.rock });
      const rock2 = await makeRockTexture({ tint: [168, 136, 86], mare: 0.4, craters: 160, seed: 41, size: z.rock });
      const gas = await makeGasTexture(["#1f3f58", "#2f5b77", "#7fa6ba", "#294f6c", "#a9c4d0", "#315f7e"], 9, z.gas);
      const ring = makeRingTexture();
      const bump = makeDetailBump();
      made.push(backdrop, rock0, rock2, gas, ring, bump);
      if (cancelled) {
        made.forEach((t) => t.dispose());
        return;
      }
      setAssets({ earth, backdrop, rock0, rock2, gas, ring, bump });
    })();
    return () => {
      cancelled = true;
      made.forEach((t) => t.dispose());
    };
  }, [tier]);
  return assets;
}

function makeStars(count: number) {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const col = new Float32Array(count * 3);
  let s = 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const tints = [
    [0.78, 0.86, 1.0],
    [1.0, 1.0, 1.0],
    [1.0, 0.93, 0.8],
    [1.0, 0.82, 0.66],
  ];
  for (let i = 0; i < count; i++) {
    const r = 80 + rnd() * 180;
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(2 * rnd() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    const m = rnd();
    // Many faint stars, a handful of bright ones.
    const bright = m > 0.985 ? 1 : m > 0.93 ? 0.55 : 0.18 + rnd() * 0.22;
    size[i] = m > 0.985 ? 5.2 : m > 0.93 ? 3.0 : 1.5 + rnd() * 0.9;
    const t = tints[Math.floor(rnd() * tints.length)];
    col[i * 3] = t[0] * bright;
    col[i * 3 + 1] = t[1] * bright;
    col[i * 3 + 2] = t[2] * bright;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  return g;
}

function ringGeometry(inner: number, outer: number) {
  const g = new THREE.RingGeometry(inner, outer, 128, 1);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
  }
  return g;
}

function Scene({ ctl, tier }: { ctl: JourneyCtl; tier: Tier }) {
  const assets = useAssets(tier);
  const { invalidate, gl, setDpr } = useThree();
  const seg = tier === "high" ? 1 : tier === "mid" ? 0.75 : 0.5;
  const frameMs = useRef({ avg: 16, n: 0, lowered: false });

  const backdrop = useRef<THREE.Mesh>(null);
  const stars = useRef<THREE.Points>(null);
  const earth = useRef<THREE.Group>(null);
  const worlds = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const orbit = useRef<THREE.Line>(null);

  const starGeo = useMemo(() => makeStars(tier === "high" ? 1700 : tier === "mid" ? 900 : 450), [tier]);
  const starMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starVert,
        fragmentShader: starFrag,
        uniforms: { uOpacity: { value: 0 }, uScale: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const mats = useMemo(() => {
    if (!assets) return null;
    const earthMat = new THREE.ShaderMaterial({
      vertexShader: earthVert,
      fragmentShader: earthFrag,
      uniforms: {
        uDay: { value: assets.earth.day },
        uNight: { value: assets.earth.night },
        uCloud: { value: assets.earth.cloud },
        uSun: { value: SUN.clone() },
        uFade: { value: 0 },
        uShift: { value: 0 },
      },
      transparent: true,
    });
    const atmo = (color: THREE.Color, strength: number) =>
      new THREE.ShaderMaterial({
        vertexShader: atmoVert,
        fragmentShader: atmoFrag,
        uniforms: {
          uSun: { value: SUN.clone() },
          uCenter: { value: new THREE.Vector3() },
          uColor: { value: color },
          uFade: { value: 0 },
          uStrength: { value: strength },
        },
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    return {
      earth: earthMat,
      earthAtmo: atmo(new THREE.Color(0.3, 0.55, 1.0), 1.15),
      gasAtmo: atmo(new THREE.Color(0.45, 0.75, 0.95), 0.7),
      amberAtmo: atmo(new THREE.Color(0.95, 0.72, 0.38), 0.55),
    };
  }, [assets]);

  const ringGeo = useMemo(() => ringGeometry(WORLDS[1].r * 1.45, WORLDS[1].r * 2.05), []);
  const orbitLine = useMemo(() => {
    const pts = [
      WORLDS[0].pos,
      WORLDS[0].pos.clone().lerp(WORLDS[1].pos, 0.5).add(new THREE.Vector3(2, 4, 3)),
      WORLDS[1].pos,
      WORLDS[1].pos.clone().lerp(WORLDS[2].pos, 0.5).add(new THREE.Vector3(-2, -3, 3)),
      WORLDS[2].pos,
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160));
    const mat = new THREE.LineDashedMaterial({ color: "#a9bfdc", dashSize: 0.55, gapSize: 0.42, transparent: true, opacity: 0, depthWrite: false });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    return line;
  }, []);

  useEffect(() => {
    starMat.uniforms.uScale.value = gl.getPixelRatio();
    invalidate();
  }, [assets, gl, invalidate, starMat]);

  useEffect(
    () => () => {
      starGeo.dispose();
      starMat.dispose();
      ringGeo.dispose();
      orbitLine.geometry.dispose();
      (orbitLine.material as THREE.Material).dispose();
      if (mats) Object.values(mats).forEach((m) => m.dispose());
    },
    [starGeo, starMat, ringGeo, orbitLine, mats],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const follow = useMemo(() => new THREE.Vector3(), []);
  const p0 = useMemo(() => new THREE.Vector3(), []);
  const p1 = useMemo(() => new THREE.Vector3(), []);
  const l0 = useMemo(() => new THREE.Vector3(), []);
  const l1 = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }, delta) => {
    if (!assets || !mats) return;
    // Runtime guard: if frames are consistently slow, drop the pixel ratio once. Quality steps down, nothing switches off.
    const fm = frameMs.current;
    fm.avg += (delta * 1000 - fm.avg) * 0.15;
    if (++fm.n > 14 && !fm.lowered && fm.avg > 46) {
      fm.lowered = true;
      setDpr(1);
    }
    const cam = camera as THREE.PerspectiveCamera;
    const { u1, s } = ctl;
    const portrait = size.width / size.height < 0.95;
    const fly = Math.min(1, s);

    // ── Camera route: Earth, then each project world in turn.
    const dist = (i: number) => (WORLDS[i].r / 0.107) * (portrait ? 1.3 : 1);
    const waypoint = (i: number, outP: THREE.Vector3, outL: THREE.Vector3) => {
      if (i === 0) {
        outP.set(0, 0, EARTH_Z0 * (portrait ? 1.5 : 1));
        outL.set(0, 0, 0);
      } else {
        const w = WORLDS[i - 1];
        outP.copy(w.pos).addScaledVector(w.view, dist(i - 1));
        outL.copy(w.pos);
      }
    };
    const seg = clamp(Math.floor(s), 0, 2);
    const f = smooth(clamp(s - seg));
    waypoint(seg, p0, l0);
    waypoint(seg + 1, p1, l1);
    cam.position.lerpVectors(p0, p1, f).addScaledVector(WORLDS[seg].bulge, Math.sin(Math.PI * f));
    look.lerpVectors(l0, l1, f);
    cam.fov = portrait ? 40 : 35;
    cam.lookAt(look);

    // Planet appears to the right (left on phones) of centre once we are underway.
    const k = smooth(clamp((fly - 0.18) / 0.82));
    const sx = (portrait ? -0.14 : 0.16) * size.width * k;
    const sy = (portrait ? -0.2 : -0.1) * size.height * k;
    cam.setViewOffset(size.width, size.height, -sx, -sy, size.width, size.height);
    cam.updateMatrixWorld();

    // ── Sky: faint nebulae and stars, arriving as Earth leaves the frame.
    if (backdrop.current) {
      backdrop.current.position.copy(cam.position);
      backdrop.current.rotation.y = s * 0.07;
      (backdrop.current.material as THREE.MeshBasicMaterial).opacity = smooth(clamp((u1 - 0.25) / 0.7));
    }
    if (stars.current) {
      stars.current.position.copy(cam.position).multiplyScalar(0.8);
      starMat.uniforms.uOpacity.value = 0.95 * smooth(clamp(u1 * 1.3));
    }

    // ── Earth: a full disc first, then a small distant world that stays in the corner of the sky.
    if (earth.current) {
      const fade = smooth(clamp((u1 - 0.4) / 0.55));
      const e = smooth(clamp((fly - 0.22) / 0.78));
      follow.set(portrait ? -2.3 : -4.7, portrait ? 3.1 : -2.8, -14);
      cam.localToWorld(follow);
      earth.current.position.lerpVectors(tmp.set(0, 0, 0), follow, e);
      earth.current.scale.setScalar(lerp(1, 0.3, e));
      earth.current.rotation.y = -1.95 + u1 * 0.22 + fly * 0.5;
      earth.current.visible = fade > 0.002;
      mats.earth.uniforms.uFade.value = fade;
      mats.earth.uniforms.uShift.value = u1 * 0.012 + fly * 0.02;
      mats.earthAtmo.uniforms.uFade.value = fade;
      mats.earthAtmo.uniforms.uCenter.value.copy(earth.current.position);
    }

    // ── Project worlds appear once we are on our way, and turn slowly with the scroll.
    worlds.forEach((r, i) => {
      const g = r.current;
      if (!g) return;
      const show = smooth(clamp((fly - 0.22) / 0.3));
      g.visible = show > 0.002;
      g.scale.setScalar(Math.max(0.001, show));
      g.rotation.y = i * 1.7 + s * 0.35;
    });
    mats.gasAtmo.uniforms.uFade.value = 1;
    mats.amberAtmo.uniforms.uFade.value = 1;
    mats.gasAtmo.uniforms.uCenter.value.copy(WORLDS[1].pos);
    mats.amberAtmo.uniforms.uCenter.value.copy(WORLDS[2].pos);

    // Orbital path joining the worlds.
    (orbitLine.material as THREE.LineDashedMaterial).opacity = 0.32 * smooth(clamp((fly - 0.55) / 0.45));
  });

  if (!assets || !mats) return null;

  return (
    <>
      <ambientLight intensity={0.05} />
      <directionalLight position={SUN.clone().multiplyScalar(100)} intensity={3.3} color="#fff4e6" />

      <mesh ref={backdrop} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[250, 48, 32]} />
        <meshBasicMaterial map={assets.backdrop} side={THREE.BackSide} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <points ref={stars} geometry={starGeo} material={starMat} renderOrder={-9} frustumCulled={false} />

      <group ref={earth} visible={false}>
        <mesh>
          <sphereGeometry args={[1, Math.round(128 * seg), Math.round(96 * seg)]} />
          <primitive object={mats.earth} attach="material" />
        </mesh>
        <mesh scale={1.075}>
          <sphereGeometry args={[1, Math.round(64 * seg), Math.round(48 * seg)]} />
          <primitive object={mats.earthAtmo} attach="material" />
        </mesh>
      </group>

      {/* 1. MoonNav: a grey, cratered world */}
      <group ref={worlds[0]} position={WORLDS[0].pos} visible={false}>
        <mesh>
          <sphereGeometry args={[WORLDS[0].r, Math.round(96 * seg), Math.round(64 * seg)]} />
          <meshStandardMaterial map={assets.rock0} bumpMap={assets.bump} bumpScale={1.4} roughness={1} metalness={0} />
        </mesh>
      </group>

      {/* 2. Naji Learning: a calm blue giant with a thin ring */}
      <group ref={worlds[1]} position={WORLDS[1].pos} visible={false}>
        <mesh>
          <sphereGeometry args={[WORLDS[1].r, Math.round(96 * seg), Math.round(64 * seg)]} />
          <meshStandardMaterial map={assets.gas} roughness={0.95} metalness={0} />
        </mesh>
        <mesh scale={1.05}>
          <sphereGeometry args={[WORLDS[1].r, 48, 32]} />
          <primitive object={mats.gasAtmo} attach="material" />
        </mesh>
        <mesh geometry={ringGeo} rotation={[Math.PI / 2 - 0.42, 0, 0.2]}>
          <meshBasicMaterial map={assets.ring} transparent side={THREE.DoubleSide} depthWrite={false} opacity={0.85} />
        </mesh>
      </group>

      {/* 3. United Medication: a dark bronze world */}
      <group ref={worlds[2]} position={WORLDS[2].pos} visible={false}>
        <mesh>
          <sphereGeometry args={[WORLDS[2].r, Math.round(96 * seg), Math.round(64 * seg)]} />
          <meshStandardMaterial map={assets.rock2} bumpMap={assets.bump} bumpScale={0.9} roughness={0.92} metalness={0.05} />
        </mesh>
        <mesh scale={1.05}>
          <sphereGeometry args={[WORLDS[2].r, 48, 32]} />
          <primitive object={mats.amberAtmo} attach="material" />
        </mesh>
      </group>

      <primitive object={orbitLine} ref={orbit} />
    </>
  );
}

export default function JourneyScene({ ctl, tier }: { ctl: JourneyCtl; tier: Tier }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={tier === "high" ? [1, 1.75] : tier === "mid" ? [1, 1.35] : [1, 1]}
      camera={{ fov: 35, near: 0.1, far: 600, position: [0, 0, EARTH_Z0] }}
      gl={{ alpha: true, antialias: tier !== "low", powerPreference: "default" }}
      onCreated={({ invalidate }) => {
        ctl.invalidate = invalidate;
        invalidate();
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Scene ctl={ctl} tier={tier} />
    </Canvas>
  );
}
