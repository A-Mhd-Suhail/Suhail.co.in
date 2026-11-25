"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { makeEarthTexture, makeMoonDetail, makeMoonTexture } from "./textures";

export interface JourneyCtl {
  /** Phase values written by Journey.tsx on scroll: pullback, travel and exit (all 0 to 1). */
  u1: number;
  u2: number;
  u3: number;
  /** Set by the canvas so the scroll handler can ask for a redraw (the loop only runs on demand). */
  invalidate?: () => void;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Earth sits at the origin, the Moon behind the camera. The camera pulls back from Earth, then flies over the Moon. */
const EARTH_Z0 = 5.3;
const MOON_Z = 21;
const MOON_R = 30;
const CAM_END_Z = 22.4;

const atmosphere = {
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying vec3 vN; varying vec3 vV; uniform float uOpacity;
    void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 4.2); gl_FragColor = vec4(0.42, 0.6, 0.92, f * 0.3 * uOpacity); }`,
};

function Planets({ ctl }: { ctl: JourneyCtl }) {
  const earth = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);
  const stars = useRef<THREE.Points>(null);
  const atmo = useRef<THREE.ShaderMaterial>(null);
  const [tex, setTex] = useState<{ earth: THREE.Texture; moon: THREE.Texture; detail: THREE.Texture } | null>(null);

  // Textures are drawn once, after mount, and disposed with the scene.
  useEffect(() => {
    const t = { earth: makeEarthTexture(), moon: makeMoonTexture(), detail: makeMoonDetail() };
    setTex(t);
    ctl.invalidate?.();
    return () => {
      t.earth.dispose();
      t.moon.dispose();
      t.detail.dispose();
    };
  }, [ctl]);

  const starGeo = useMemo(() => {
    const n = 650;
    const pos = new Float32Array(n * 3);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const r = 90 + rnd() * 110;
      const th = rnd() * Math.PI * 2;
      const ph = Math.acos(2 * rnd() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph);
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useEffect(() => () => starGeo.dispose(), [starGeo]);

  useFrame(({ camera }) => {
    const { u1, u2, u3 } = ctl;
    const j = smooth(u2);
    const x = smooth(u3);

    // Camera: pull back from Earth, fly over the Moon looking back at Earth, then rise away.
    camera.position.set(0, lerp(0, 0.9, j) + x * 7, lerp(EARTH_Z0, CAM_END_Z, j));
    camera.rotation.set(-0.24 * smooth(Math.max(0, (u2 - 0.35) / 0.65)) * (1 - x), 0, 0);

    if (earth.current) {
      const s = smooth(u1) * (1 - Math.min(1, x * 3.5));
      earth.current.visible = s > 0.002;
      earth.current.scale.setScalar(Math.max(0.0001, s));
      earth.current.rotation.y = -1.9 + u1 * 0.5 + u2 * 0.6;
    }
    if (moon.current) {
      moon.current.visible = u2 > 0.2 && x < 0.999;
      moon.current.position.set(0, -MOON_R - x * 16, MOON_Z);
    }
    if (atmo.current) atmo.current.uniforms.uOpacity.value = smooth(u1);
    if (stars.current) {
      (stars.current.material as THREE.PointsMaterial).opacity = 0.75 * smooth(Math.min(1, u1 * 1.4));
      stars.current.rotation.y = u1 * 0.12 + u2 * 0.18;
    }
  });

  // Nothing is drawn until the planet textures exist, so a late mount never flashes untextured spheres.
  if (!tex) return null;

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3.2, 2.5]} intensity={3.1} color="#fff6e8" />

      <points ref={stars} geometry={starGeo}>
        <pointsMaterial color="#d6dae4" size={1.25} sizeAttenuation={false} transparent opacity={0} depthWrite={false} />
      </points>

      <group ref={earth} visible={false}>
        <mesh rotation={[0.18, 0, 0.06]}>
          <sphereGeometry args={[1, 96, 64]} />
          <meshStandardMaterial map={tex?.earth ?? null} color={tex ? "#ffffff" : "#0b2a4a"} roughness={0.88} metalness={0} />
        </mesh>
        <mesh scale={1.05}>
          <sphereGeometry args={[1, 64, 48]} />
          <shaderMaterial ref={atmo} args={[{ ...atmosphere, uniforms: { uOpacity: { value: 0 } } }]} side={THREE.BackSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      <group ref={moon} visible={false} position={[0, -MOON_R, MOON_Z]}>
        <mesh rotation={[Math.PI / 2, 0, 2.4]}>
          <sphereGeometry args={[MOON_R, 160, 96]} />
          <meshStandardMaterial map={tex?.moon ?? null} bumpMap={tex?.detail ?? null} bumpScale={2.2} color={tex ? "#ffffff" : "#77756f"} roughness={1} metalness={0} />
        </mesh>
      </group>
    </>
  );
}

export default function JourneyScene({ ctl }: { ctl: JourneyCtl }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: 35, near: 0.1, far: 400, position: [0, 0, EARTH_Z0] }}
      gl={{ alpha: true, antialias: true, powerPreference: "default" }}
      onCreated={({ invalidate }) => {
        ctl.invalidate = invalidate;
        invalidate();
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Planets ctl={ctl} />
    </Canvas>
  );
}
