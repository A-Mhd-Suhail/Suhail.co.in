"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * Hero scene in the Lusion manner: a dense, tumbling cluster of glossy jointed "cross" pieces
 * (three fused arms each), in white, black and electric blue. The cluster turns with the pointer,
 * and scroll drives it through a second rotation. Entrance: pieces fly in from the centre.
 * Props match the previous scene so the Hero component can swap it in.
 */

type Pointer = { x: number; y: number };

const COUNT = 46;
const ARM_LEN = 1.7;
const ARM_R = 0.34;
const SPREAD = 3.5;

// Seeded so the cluster looks the same on every load.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Piece = {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  spin: THREE.Vector3;
  mat: 0 | 1 | 2; // 0 white, 1 black, 2 blue
  delay: number;
};

function makePieces(): Piece[] {
  const r = rng(7);
  return Array.from({ length: COUNT }, () => {
    const roll = r();
    return {
      pos: new THREE.Vector3((r() - 0.5) * SPREAD * 2, (r() - 0.5) * SPREAD * 2.3, (r() - 0.5) * SPREAD * 0.9),
      rot: new THREE.Euler(r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2),
      spin: new THREE.Vector3((r() - 0.5) * 0.35, (r() - 0.5) * 0.35, (r() - 0.5) * 0.35),
      mat: roll < 0.42 ? 0 : roll < 0.7 ? 1 : 2,
      delay: r() * 0.6,
    };
  });
}

function Cluster({ pointer, reduced, paused }: { pointer: RefObject<Pointer>; reduced: boolean; paused: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const pieces = useRef<(THREE.Group | null)[]>([]);
  const data = useMemo(makePieces, []);
  const introStart = useRef(-1);
  const scrollSmooth = useRef(0);
  const { invalidate, size } = useThree();
  const stillFrames = useRef(0);

  // One cross = three arms fused at the centre. Shared geometry and materials keep this cheap.
  const arm = useMemo(() => new THREE.CapsuleGeometry(ARM_R, ARM_LEN, 8, 24), []);
  const mats = useMemo(
    () => [
      new THREE.MeshPhysicalMaterial({ color: "#f2f1ee", roughness: 0.22, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.08 }),
      new THREE.MeshPhysicalMaterial({ color: "#0b0b0d", roughness: 0.3, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.1 }),
      new THREE.MeshPhysicalMaterial({ color: "#1f3dff", roughness: 0.18, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.05 }),
    ],
    [],
  );
  const axes = useMemo(
    () => [new THREE.Euler(0, 0, 0), new THREE.Euler(0, 0, Math.PI / 2), new THREE.Euler(Math.PI / 2, 0, 0)],
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (introStart.current < 0 && (reduced || paused || t > 4 || document.documentElement.classList.contains("is-loaded"))) {
      introStart.current = reduced || paused ? t - 10 : t;
    }
    const since = reduced || paused ? 99 : introStart.current < 0 ? -1 : t - introStart.current;
    const scroll = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    scrollSmooth.current += (scroll - scrollSmooth.current) * 0.08;
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;

    if (root.current) {
      // Phone-width screens: sit the cluster below the headline so the type stays readable.
      const narrow = size.width / size.height < 0.8;
      root.current.position.y += ((narrow ? -2.6 : 0) - root.current.position.y) * 0.1;
      root.current.rotation.y += ((px * 0.35 + scrollSmooth.current * 1.4) - root.current.rotation.y) * 0.06;
      root.current.rotation.x += ((py * 0.22 + scrollSmooth.current * 0.5) - root.current.rotation.x) * 0.06;
    }

    data.forEach((p, i) => {
      const g = pieces.current[i];
      if (!g) return;
      const local = since < 0 ? 0 : Math.min(1, Math.max(0, (since - p.delay) / 1.4));
      const e = 1 - Math.pow(1 - local, 3);
      // Pieces start clustered at the centre, then fly out to their places.
      g.position.copy(p.pos).multiplyScalar(0.15 + 0.85 * e);
      g.rotation.set(
        p.rot.x + (reduced || paused ? 0 : t * p.spin.x),
        p.rot.y + (reduced || paused ? 0 : t * p.spin.y),
        p.rot.z + (reduced || paused ? 0 : t * p.spin.z),
      );
      g.scale.setScalar(0.4 + 0.6 * e);
    });

    if ((paused || reduced) && stillFrames.current++ < 6) invalidate();
    void delta;
  });

  return (
    <group ref={root}>
      {data.map((p, i) => (
        <group key={i} ref={(el) => void (pieces.current[i] = el)}>
          {axes.map((a, k) => (
            <mesh key={k} geometry={arm} material={mats[p.mat]} rotation={a} />
          ))}
        </group>
      ))}
    </group>
  );
}

function Framing() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    // Narrow (phone) screens: pull back so the cluster reads as an object behind the headline, not a wall.
    camera.position.z = aspect < 0.8 ? 38 : aspect < 1.2 ? 24 : 19;
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = aspect < 0.8 ? 34 : 30;
    cam.updateProjectionMatrix();
  }, [size, camera]);
  return null;
}

export default function CrossScene({
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
      camera={{ position: [0, 0, 19], fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener("webglcontextlost", () => onLost(), { once: true });
        onReady();
      }}
      aria-hidden
    >
      <color attach="background" args={["#e9e7f2"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.2} color="#ffffff" />
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#dfe6ff" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[12, 2.2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[12, 1.6, 1]} />
      </Environment>
      <Framing />
      <Cluster pointer={pointer} reduced={reduced} paused={paused} />
    </Canvas>
  );
}
