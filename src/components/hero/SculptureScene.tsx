"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * "The Spire": a monumental identity structure.
 * - 11 pearl-ceramic drums (rounded octagonal prisms) twist slowly around a core.
 * - Polished silver rings seat each joint.
 * - Between the drums, light from the core leaks out; a pulse of light travels up it (custom shader).
 * - 5 translucent glass plates with technical tick marks orbit the column at different speeds.
 */

type Pointer = { x: number; y: number };

const N = 16;
const DRUM_H = 0.98;
const GAP = 0.19;
const PITCH = DRUM_H + GAP;
const SPAN = N * PITCH;

const PLATES = [
  { y: -4.4, r: 3.1, tilt: 0.05, speed: 0.07 },
  { y: -2.1, r: 3.9, tilt: -0.04, speed: -0.05 },
  { y: 0.35, r: 3.3, tilt: 0.03, speed: 0.06 },
  { y: 2.35, r: 4.3, tilt: -0.05, speed: -0.045 },
  { y: 5.0, r: 3.2, tilt: 0.04, speed: 0.08 },
] as const;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const ease3 = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

function roundedOctagon(R: number) {
  const s = new THREE.Shape();
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    return new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R);
  });
  pts.forEach((p, i) => {
    const prev = pts[(i + 7) % 8];
    const next = pts[(i + 1) % 8];
    const a = p.clone().lerp(prev, 0.22);
    const b = p.clone().lerp(next, 0.22);
    if (i === 0) s.moveTo(a.x, a.y);
    else s.lineTo(a.x, a.y);
    s.quadraticCurveTo(p.x, p.y, b.x, b.y);
  });
  s.closePath();
  return s;
}

const coreVert = /* glsl */ `
  varying float vY;
  void main() {
    vY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const coreFrag = /* glsl */ `
  precision highp float;
  uniform float uPulse;
  uniform float uIntro;
  varying float vY;
  void main() {
    float d = vY - uPulse;
    float pulse = exp(-d * d * 1.1);
    vec3 warm = vec3(1.0, 0.93, 0.8);
    vec3 col = warm * (1.05 + pulse * 2.4) * uIntro;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Sculpture({ pointer, reduced, paused }: { pointer: RefObject<Pointer>; reduced: boolean; paused: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const drums = useRef<(THREE.Group | null)[]>([]);
  const plates = useRef<(THREE.Group | null)[]>([]);
  const light = useRef<THREE.PointLight>(null!);
  const coreMat = useRef<THREE.ShaderMaterial>(null!);
  const time = useRef(0);
  const introStart = useRef(-1);
  const { camera, invalidate } = useThree();
  const stillFrames = useRef(0);

  const drumGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedOctagon(1), {
      depth: DRUM_H - 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 6,
    });
    g.rotateX(-Math.PI / 2);
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    g.translate(0, -(bb.min.y + bb.max.y) / 2, 0);
    return g;
  }, []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(1, 0.034, 16, 72), []);
  const plateGeo = useMemo(() => new THREE.CylinderGeometry(1, 1, 0.05, 96), []);
  const rimGeo = useMemo(() => new THREE.TorusGeometry(1, 0.011, 10, 160), []);
  const tickGeo = useMemo(() => new THREE.BoxGeometry(0.016, 0.02, 0.15), []);
  const seamGeo = useMemo(() => new THREE.BoxGeometry(0.032, DRUM_H * 0.62, 0.02), []);
  const engraveGeo = useMemo(() => new THREE.TorusGeometry(1, 0.006, 6, 160), []);
  const profile = useMemo(() => Array.from({ length: N }, (_, i) => 1.5 + 0.32 * Math.sin(i * 0.62 + 0.9)), []);
  const coreUniforms = useMemo(() => ({ uPulse: { value: -SPAN }, uIntro: { value: 0 } }), []);

  useLayoutEffect(
    () => () => {
      drumGeo.dispose();
      ringGeo.dispose();
      plateGeo.dispose();
      rimGeo.dispose();
      tickGeo.dispose();
      seamGeo.dispose();
      engraveGeo.dispose();
    },
    [drumGeo, ringGeo, plateGeo, rimGeo, tickGeo, seamGeo, engraveGeo],
  );

  // Place tick marks around each plate's rim (once).
  const tickRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const pos = new THREE.Vector3();
    const sc = new THREE.Vector3();
    tickRefs.current.forEach((mesh, pi) => {
      if (!mesh) return;
      const count = 96;
      const rr = PLATES[pi].r * 1.06;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        pos.set(Math.cos(a) * rr, 0, Math.sin(a) * rr);
        e.set(0, Math.PI / 2 - a, 0);
        q.setFromEuler(e);
        const long = i % 6 === 0 ? 1.9 : i % 2 === 0 ? 1.1 : 0.6;
        sc.set(1, 1, long);
        m.compose(pos, q, sc);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    time.current += dt;
    const t = time.current;

    // The entrance starts when the loader has lifted.
    // Start once the loader has lifted, or after 4s regardless so a loader problem can never hide the scene.
    if (introStart.current < 0 && (reduced || paused || t > 4 || document.documentElement.classList.contains("is-loaded"))) {
      // Reduced motion or paused before the entrance: show the finished sculpture instead of an empty frame.
      introStart.current = reduced || paused ? t - 10 : t;
    }
    const since = reduced || paused ? 99 : introStart.current < 0 ? -1 : t - introStart.current;

    const p = pointer.current;
    root.current.rotation.y = reduced ? 0.5 : 0.35 + t * 0.1;
    root.current.rotation.x += (p.y * 0.06 - root.current.rotation.x) * Math.min(1, dt * 2);

    drums.current.forEach((g, i) => {
      if (!g) return;
      const local = ease3((since - Math.abs(i - (N - 1) / 2) * 0.1) / 1.25);
      g.visible = local > 0.002;
      g.scale.setScalar(Math.max(local, 0.0001));
      g.position.y = (i - (N - 1) / 2) * PITCH - (1 - local) * 2.4;
      g.rotation.y = i * 0.23 + (reduced ? 0 : Math.sin(t * 0.35 + i * 0.55) * 0.16);
    });

    plates.current.forEach((g, i) => {
      if (!g) return;
      const local = ease3((since - 0.55 - i * 0.18) / 1.5);
      g.visible = local > 0.002;
      g.scale.set(Math.max(local, 0.0001), 1, Math.max(local, 0.0001));
      if (!reduced) g.rotation.y += dt * PLATES[i].speed;
      g.rotation.x = PLATES[i].tilt + (reduced ? 0 : Math.sin(t * 0.3 + i) * 0.02);
    });

    // Light pulse travelling up the core, with a real light that leans on the nearby metal.
    const cycle = reduced ? 0.5 : (t * 0.1) % 1.35;
    const pulseY = cycle * SPAN - SPAN * 0.62;
    // Update through the material itself (R3F can copy the uniforms object it was given).
    const intro = ease3((since - 0.9) / 1.4);
    coreMat.current.uniforms.uPulse.value = pulseY;
    coreMat.current.uniforms.uIntro.value = intro;
    light.current.position.set(0, pulseY, 0.9);
    light.current.intensity = 16 * intro;

    // Camera parallax
    camera.position.x += (p.x * 0.75 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (-p.y * 0.4 - camera.position.y) * Math.min(1, dt * 2);
    camera.lookAt(0, 0, 0);

    // On-demand rendering (paused or reduced motion): request a few frames so the scene settles into its
    // finished still state (entrance resolved, environment lit), then stop rendering.
    if ((paused || reduced) && stillFrames.current++ < 6) invalidate();
  });

  return (
    <group ref={root}>
      {/* Glowing core, visible in the gaps between the drums */}
      <mesh>
        <cylinderGeometry args={[1.0, 1.0, SPAN + 8, 32, 1, true]} />
        <shaderMaterial ref={coreMat} vertexShader={coreVert} fragmentShader={coreFrag} uniforms={coreUniforms} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={light} color="#ffe2b8" distance={4.2} decay={2} />

      {profile.map((r, i) => (
        <group
          key={i}
          ref={(el) => {
            drums.current[i] = el;
          }}
        >
          <mesh geometry={drumGeo} scale={[r, 1, r]}>
            <meshPhysicalMaterial
              color="#c9c5bc"
              roughness={0.34}
              clearcoat={0.9}
              clearcoatRoughness={0.22}
              sheen={1}
              sheenRoughness={0.5}
              sheenColor="#ffffff"
              iridescence={0.4}
              iridescenceIOR={1.25}
              iridescenceThicknessMinimum={120}
              iridescenceThicknessMaximum={420}
              envMapIntensity={0.85}
            />
          </mesh>
          {[0, 2, 4, 6].map((k) => {
            const a = (k * Math.PI) / 4;
            const apothem = r * (Math.cos(Math.PI / 8) + 0.046);
            return (
              <mesh key={k} geometry={seamGeo} position={[Math.cos(a) * apothem, 0, -Math.sin(a) * apothem]} rotation={[0, a + Math.PI / 2, 0]}>
                <meshBasicMaterial color={[1.5, 1.28, 0.95]} toneMapped={false} />
              </mesh>
            );
          })}
          <mesh geometry={ringGeo} scale={[r * 1.1, 1, r * 1.1]} position={[0, DRUM_H / 2 + GAP / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#e2e5ea" metalness={1} roughness={0.15} envMapIntensity={1.6} />
          </mesh>
        </group>
      ))}

      {PLATES.map((pl, i) => (
        <group
          key={i}
          position={[0, pl.y, 0]}
          ref={(el) => {
            plates.current[i] = el;
          }}
        >
          <mesh geometry={plateGeo} scale={[pl.r, 1, pl.r]}>
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={1}
              thickness={0.4}
              roughness={0.02}
              ior={1.42}
              dispersion={0.22}
              attenuationColor="#dfe9f0"
              attenuationDistance={4}
              envMapIntensity={0.8}
            />
          </mesh>
          <mesh geometry={rimGeo} scale={[pl.r, pl.r, pl.r]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#dfe2e8" metalness={1} roughness={0.14} envMapIntensity={1.5} />
          </mesh>
          {[0.84, 0.6].map((f) => (
            <mesh key={f} geometry={engraveGeo} scale={[pl.r * f, pl.r * f, pl.r * f]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#cfd4dc" metalness={1} roughness={0.2} transparent opacity={0.55} />
            </mesh>
          ))}
          <instancedMesh
            ref={(el) => {
              tickRefs.current[i] = el;
            }}
            args={[tickGeo, undefined, 96]}
          >
            <meshStandardMaterial color="#cfd3da" metalness={1} roughness={0.25} />
          </instancedMesh>
        </group>
      ))}
    </group>
  );
}

function Framing() {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    // Taller than the viewport on desktop; pulled back on narrow screens so the spire still reads.
    const aspect = size.width / size.height;
    camera.position.z = aspect < 0.8 ? 26 : aspect < 1.2 ? 21 : 16.5;
    camera.fov = aspect < 0.8 ? 32 : 30;
    camera.updateProjectionMatrix();
  }, [size, camera]);
  return null;
}

export default function SculptureScene({
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
      // Off-screen / hidden tab: no rendering. Paused or reduced motion: a still frame, no continuous rendering.
      frameloop={!active ? "never" : reduced || paused ? "demand" : "always"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 16.5], fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 0.82;
        gl.domElement.addEventListener("webglcontextlost", () => onLost(), { once: true });
        onReady();
      }}
      aria-hidden
    >
      <color attach="background" args={["#08080a"]} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} color="#fff1dc" />
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff4e4" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={2.1} color="#ffffff" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[12, 2.2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#e4ecff" position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[12, 1.6, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#ffffff" position={[0, 0, -7]} scale={[14, 6, 1]} />
        <Lightformer form="ring" intensity={0.7} color="#ffffff" position={[0, -2, 8]} scale={4} />
      </Environment>
      <Framing />
      <Sculpture pointer={pointer} reduced={reduced} paused={paused} />
    </Canvas>
  );
}
