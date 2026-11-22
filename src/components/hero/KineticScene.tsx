"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * "Interlocked Orbits": seven pearl-ceramic and polished-chrome rings, each on its own axis and speed,
 * around a translucent glass core. Rings drift on slow, offset sine paths so the form keeps changing
 * without ever looking random. The pointer tilts the whole assembly; scroll turns it.
 * Props match the previous hero scene so the Hero component can use it unchanged.
 */

type Pointer = { x: number; y: number };

type Ring = {
  radius: number;
  tube: number;
  chrome: boolean;
  axis: THREE.Euler;
  speed: THREE.Vector3;
  phase: number;
};

function makeRings(): Ring[] {
  const specs: [number, number, boolean, number, number, number][] = [
    [2.05, 0.11, false, 0.2, 0.0, 1.0],
    [2.5, 0.09, true, 1.1, 0.7, 0.8],
    [2.9, 0.13, false, 0.4, 1.9, 0.6],
    [3.3, 0.08, true, 1.8, 0.3, 1.2],
    [3.7, 0.12, false, 0.9, 2.4, 0.9],
    [4.1, 0.07, true, 2.4, 1.2, 0.5],
    [4.5, 0.1, false, 1.5, 0.5, 0.7],
  ];
  return specs.map(([radius, tube, chrome, rx, ry, sp], i) => ({
    radius,
    tube,
    chrome,
    axis: new THREE.Euler(rx, ry, i * 0.35),
    speed: new THREE.Vector3(0.11 * sp, 0.17 * sp, 0.07 * sp),
    phase: i * 0.9,
  }));
}

function Assembly({ pointer, reduced, paused }: { pointer: RefObject<Pointer>; reduced: boolean; paused: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const core = useRef<THREE.Mesh>(null!);
  const data = useMemo(makeRings, []);
  const stillFrames = useRef(0);
  const introStart = useRef(-1);
  const { invalidate } = useThree();

  const pearl = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#EEEAE3", roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.18, sheen: 0.2, sheenColor: new THREE.Color("#ffffff") }),
    [],
  );
  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#D7DADF", roughness: 0.12, metalness: 1 }),
    [],
  );
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#f4f1ea", roughness: 0.04, transmission: 1, thickness: 1.2, ior: 1.45, clearcoat: 1, transparent: true, opacity: 0.92 }),
    [],
  );
  const geos = useMemo(() => data.map((r) => new THREE.TorusGeometry(r.radius, r.tube, 24, 160)), [data]);
  const coreGeo = useMemo(() => new THREE.SphereGeometry(0.85, 64, 48), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (introStart.current < 0 && (reduced || paused || t > 4 || document.documentElement.classList.contains("is-loaded"))) {
      introStart.current = reduced || paused ? t - 10 : t;
    }
    const since = reduced || paused ? 99 : introStart.current < 0 ? -1 : t - introStart.current;
    const intro = since < 0 ? 0 : Math.min(1, since / 2.2);
    const e = 1 - Math.pow(1 - intro, 3);
    const still = reduced || paused;
    const scroll = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;

    if (root.current) {
      root.current.rotation.y += ((px * 0.4 + scroll * 1.2) - root.current.rotation.y) * 0.05;
      root.current.rotation.x += ((py * 0.25 + scroll * 0.4) - root.current.rotation.x) * 0.05;
      root.current.scale.setScalar(0.55 + 0.45 * e);
    }
    data.forEach((r, i) => {
      const m = rings.current[i];
      if (!m) return;
      const tt = still ? 0 : t;
      m.rotation.set(
        r.axis.x + Math.sin(tt * r.speed.x + r.phase) * 0.35,
        r.axis.y + tt * r.speed.y,
        r.axis.z + Math.cos(tt * r.speed.z + r.phase) * 0.25,
      );
    });
    if (core.current) {
      const pulse = still ? 0 : Math.sin(t * 0.9) * 0.04;
      core.current.scale.setScalar(1 + pulse);
    }
    if (still && stillFrames.current++ < 6) invalidate();
  });

  return (
    <group ref={root}>
      <mesh ref={core} geometry={coreGeo} material={glass} />
      {data.map((r, i) => (
        <mesh key={i} ref={(el) => void (rings.current[i] = el)} geometry={geos[i]} material={r.chrome ? chrome : pearl} />
      ))}
    </group>
  );
}

function Framing() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.z = aspect < 0.8 ? 24 : aspect < 1.2 ? 19 : 16.5;
    cam.fov = aspect < 0.8 ? 34 : 30;
    cam.updateProjectionMatrix();
  }, [size, camera]);
  return null;
}

export default function KineticScene({
  pointer,
  reduced,
  active,
  paused,
  onReady,
  onLost,
}: {
  pointer: RefObject<Pointer>;
  reduced: boolean;
  active: boolean;
  paused: boolean;
  onReady: () => void;
  onLost: () => void;
}) {
  return (
    <Canvas
      frameloop={!active ? "never" : reduced || paused ? "demand" : "always"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 16.5], fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 0.95;
        gl.domElement.addEventListener("webglcontextlost", () => onLost(), { once: true });
        onReady();
      }}
      aria-hidden
    >
      <color attach="background" args={["#080808"]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} color="#fff3e0" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff7ea" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#ffffff" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[12, 2.2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#e9dcc8" position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[12, 1.6, 1]} />
      </Environment>
      <Framing />
      <Assembly pointer={pointer} reduced={reduced} paused={paused} />
    </Canvas>
  );
}
