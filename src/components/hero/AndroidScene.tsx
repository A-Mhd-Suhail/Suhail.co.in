"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * "Lens Android": a refined ovoid head in pearl ceramic with a graphite visor band and two chrome lens
 * apertures. Scroll drives one camera path: distance -> approach -> one aperture -> through the iris ->
 * a tunnel of rings (placeholder for the digital universe). The hero section is 240svh tall with a
 * sticky stage, and progress is read from it. Props match the other hero scenes.
 */

type Pointer = { x: number; y: number };

// Aperture on the head surface (see headProfile): x, y and the surface depth at that point.
const EYE_X = 0.33;
const EYE_Y = 0.12;
const EYE_Z = 0.745;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

function heroProgress(): number {
  const el = document.getElementById("home");
  if (!el) return 0;
  const total = Math.max(1, el.offsetHeight - window.innerHeight);
  return clamp(-el.getBoundingClientRect().top / total);
}

/** Surface of revolution: a smooth ovoid that narrows slightly toward the jaw. */
function headGeometry() {
  const pts: THREE.Vector2[] = [];
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const y = -0.95 + (1.9 * i) / steps;
    const base = Math.sqrt(Math.max(0, 1 - y * y));
    const jaw = y < 0 ? 1 - 0.18 * Math.pow(-y, 1.4) : 1;
    pts.push(new THREE.Vector2(0.82 * base * jaw + 0.0001, y));
  }
  const geo = new THREE.LatheGeometry(pts, 128);
  geo.computeVertexNormals();
  return geo;
}

function Head({ pointer, reduced, paused }: { pointer: RefObject<Pointer>; reduced: boolean; paused: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const irisRef = useRef<THREE.Group[]>([]);
  const glow = useRef<THREE.MeshBasicMaterial>(null!);
  const stillFrames = useRef(0);
  const { invalidate, camera } = useThree();

  const head = useMemo(() => headGeometry(), []);
  const ceramic = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#EEEAE3", roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.15, sheenColor: new THREE.Color("#ffffff") }),
    [],
  );
  const graphite = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1b1b1e", roughness: 0.45, metalness: 0.5 }), []);
  const visor = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0c0c0e", roughness: 0.12, metalness: 0.2, clearcoat: 1 }), []);
  const chrome = useMemo(() => new THREE.MeshStandardMaterial({ color: "#D7DADF", roughness: 0.14, metalness: 1 }), []);
  const blade = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a2a2e", roughness: 0.35, metalness: 0.9 }), []);
  const dark = useMemo(() => new THREE.MeshBasicMaterial({ color: "#000000" }), []);
  const champagne = useMemo(() => new THREE.MeshBasicMaterial({ color: "#B49A7B", transparent: true, opacity: 0.9 }), []);
  const tunnel = useMemo(() => new THREE.MeshBasicMaterial({ color: "#B49A7B", transparent: true, opacity: 0.3 }), []);
  const bore = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0d0d10", roughness: 0.7, side: THREE.BackSide }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const still = reduced || paused;
    const p = heroProgress();
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;

    // Camera path: one continuous move from full view, to the aperture, through it.
    const start = new THREE.Vector3(0, 0.05, 6.2);
    const mid = new THREE.Vector3(0.1, 0.1, 3.4);
    const eyeFront = new THREE.Vector3(EYE_X, EYE_Y, EYE_Z + 0.9);
    const inside = new THREE.Vector3(EYE_X, EYE_Y, EYE_Z - 0.5);
    const look = new THREE.Vector3();
    const pos = new THREE.Vector3();
    if (p < 0.35) {
      pos.lerpVectors(start, mid, smooth(p / 0.35));
      look.set(0, 0.05, 0);
    } else if (p < 0.7) {
      const k = smooth((p - 0.35) / 0.35);
      pos.lerpVectors(mid, eyeFront, k);
      look.lerpVectors(new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(EYE_X, EYE_Y, EYE_Z), k);
    } else {
      const k = smooth(clamp((p - 0.7) / 0.25));
      pos.lerpVectors(eyeFront, inside, k);
      look.set(EYE_X, EYE_Y, EYE_Z - 1.2);
    }
    const par = still ? 0 : 1;
    pos.x += px * 0.12 * par;
    pos.y += -py * 0.08 * par + (still ? 0 : Math.sin(t * 0.8) * 0.02);
    camera.position.copy(pos);
    camera.lookAt(look);

    // Gentle turn of the whole head towards the visitor.
    if (root.current) {
      root.current.rotation.y += (px * 0.14 - root.current.rotation.y) * 0.05;
      root.current.rotation.x += (-py * 0.06 - root.current.rotation.x) * 0.05;
    }
    // Irises turn slowly in opposite directions; the glow breathes.
    irisRef.current.forEach((g, i) => {
      if (g) g.rotation.z = still ? 0 : t * (i ? -0.12 : 0.12);
    });
    if (glow.current) glow.current.opacity = still ? 0.8 : 0.7 + Math.sin(t * 1.1) * 0.2;
    if (still && stillFrames.current++ < 6) invalidate();
  });

  const lens = (side: 1 | -1) => {
    const x = side * EYE_X;
    // Yaw so each aperture faces outward along the head surface.
    const yaw = Math.asin(x / 0.82);
    return (
      <group position={[x, EYE_Y, EYE_Z]} rotation={[0, yaw, 0]}>
        {/* graphite housing ring */}
        <mesh material={graphite} position={[0, 0, -0.02]}>
          <cylinderGeometry args={[0.2, 0.22, 0.05, 96]} />
        </mesh>
        {/* chrome lens rim */}
        <mesh material={chrome} position={[0, 0, 0.005]}>
          <torusGeometry args={[0.16, 0.014, 24, 128]} />
        </mesh>
        {/* dark aperture disc */}
        <mesh material={dark} position={[0, 0, 0.0]}>
          <circleGeometry args={[0.16, 96]} />
        </mesh>
        {/* iris blades */}
        <group ref={(el) => void (irisRef.current[side === 1 ? 0 : 1] = el!)} position={[0, 0, 0.012]}>
          {Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} material={blade} rotation={[0, 0, (k * Math.PI) / 3]} position={[0.085, 0, 0]}>
              <boxGeometry args={[0.16, 0.035, 0.01]} />
            </mesh>
          ))}
        </group>
        {/* champagne inner ring, the glow you see deeper in */}
        <mesh material={champagne} position={[0, 0, 0.014]}>
          <ringGeometry args={[0.035, 0.05, 64]} />
        </mesh>
        {/* bore leading into the head, so the entry has depth */}
        <mesh material={bore} position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.7, 64, 1, true]} />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={root}>
      {/* ovoid head */}
      <mesh geometry={head} material={ceramic} />
      {/* chrome seam around the crown */}
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} material={chrome}>
        <torusGeometry args={[0.72, 0.008, 12, 160]} />
      </mesh>
      {lens(1)}
      {lens(-1)}
      {/* neck: tapered graphite column with a chrome collar */}
      <mesh position={[0, -1.25, 0]} material={graphite}>
        <cylinderGeometry args={[0.42, 0.5, 1.0, 96]} />
      </mesh>
      <mesh position={[0, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]} material={chrome}>
        <torusGeometry args={[0.5, 0.012, 16, 160]} />
      </mesh>
      {/* tunnel of rings: placeholder for the digital universe, shown once the camera is through */}
      <TunnelRings material={tunnel} />
    </group>
  );
}

function TunnelRings({ material }: { material: THREE.Material }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.visible = heroProgress() > 0.82;
    group.current.children.forEach((c, i) => {
      c.position.z = -((t * 1.2 + i * 2.4) % 28) - 1.5;
    });
  });
  return (
    <group ref={group} position={[EYE_X, EYE_Y, 0]} visible={false}>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} material={material} position={[0, 0, -i * 2.4 - 1.5]}>
          <torusGeometry args={[0.55 + i * 0.12, 0.008, 8, 96]} />
        </mesh>
      ))}
    </group>
  );
}

export default function AndroidScene({
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
      camera={{ position: [0, 0.05, 6.2], fov: 30, near: 0.01, far: 80 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        gl.toneMappingExposure = 1.0;
        scene.background = new THREE.Color("#080808");
        gl.domElement.addEventListener("webglcontextlost", () => onLost(), { once: true });
        onReady();
      }}
      aria-hidden
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 5, 6]} intensity={1.2} color="#fff3e0" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff7ea" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[12, 2.2, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#e9dcc8" position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[12, 1.6, 1]} />
      </Environment>
      <Head pointer={pointer} reduced={reduced} paused={paused} />
    </Canvas>
  );
}
