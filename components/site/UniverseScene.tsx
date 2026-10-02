"use client";

// The persistent 3D backdrop's actual <Canvas> contents — split into its own
// file so it can be code-split behind a client-only dynamic import (see
// Universe.tsx) without that import boundary changing the outer wrapper's
// shape after mount (the lesson from this session's earlier
// "insertBefore … not a child of this node" crash: a slow async subtree
// swap sitting next to anything GSAP reparents is dangerous — Universe.tsx
// keeps its own shape constant from first paint, only this inner piece
// loads in later).
import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { ProgressRef } from "./Universe";

const ACCENT = "#8ab4ff";

/** Camera path: one gentle drifting control point per chapter, in an
 * abstract 3D space unrelated to DOM pixel scroll distance. */
function buildPath(stops: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < stops; i++) {
    const t = i / Math.max(1, stops - 1);
    points.push(
      new THREE.Vector3(
        Math.sin(t * Math.PI * 1.6) * 2.2,
        Math.cos(t * Math.PI * 1.1) * 0.6,
        -t * 14
      )
    );
  }
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
}

function Structure({ mobile }: { mobile: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.06;
    group.current.rotation.x += delta * 0.015;
    // Idle bob so it never reads as a static prop.
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.4;
  });

  return (
    <group ref={group} position={[0, 0, -6]}>
      <mesh scale={mobile ? 2.4 : 3.2}>
        <icosahedronGeometry args={[1, 6]} />
        <MeshDistortMaterial color="#14141a" wireframe distort={0.28} speed={0.8} />
      </mesh>
      <mesh scale={mobile ? 1.1 : 1.4} position={[0, 0, 0.2]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function Rig({ progress, curve, reduced }: { progress: ProgressRef; curve: THREE.CatmullRomCurve3; reduced: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());

  useFrame(() => {
    if (reduced) {
      camera.position.lerp(new THREE.Vector3(0, 0.4, 6), 0.05);
      camera.lookAt(0, 0, -6);
      return;
    }
    const t = THREE.MathUtils.clamp(progress.value, 0, 1);
    const point = curve.getPointAt(t);
    const ahead = curve.getPointAt(Math.min(1, t + 0.02));
    camera.position.lerp(new THREE.Vector3(point.x, point.y + 0.3, point.z + 6), 0.06);
    look.current.lerp(ahead, 0.06);
    camera.lookAt(look.current);
  });

  return null;
}

export default function UniverseScene({
  progress,
  mobile,
  reduced,
  stops,
}: {
  progress: ProgressRef;
  mobile: boolean;
  reduced: boolean;
  stops: number;
}) {
  const curve = buildPath(stops);

  return (
    <Canvas
      dpr={[1, mobile ? 1.2 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ position: [0, 0.4, 6], fov: mobile ? 62 : 50 }}
    >
      <color attach="background" args={["#08080a"]} />
      <fog attach="fog" args={["#08080a", 6, 22]} />
      <ambientLight intensity={0.6} />
      <Rig progress={progress} curve={curve} reduced={reduced} />
      <Structure mobile={mobile} />
      {!reduced && (
        <Sparkles
          count={mobile ? 60 : 140}
          scale={[10, 6, 22]}
          size={1.1}
          speed={0.15}
          color={ACCENT}
          opacity={0.4}
        />
      )}
    </Canvas>
  );
}
