import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const NODE_COUNT = 28;
const EDGE_DISTANCE = 2.8;
const SPREAD = 6;

function Nodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const { size, viewport } = useThree();

  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      pos.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * SPREAD,
          (Math.random() - 0.5) * SPREAD * 0.7,
          (Math.random() - 0.5) * SPREAD * 0.5
        )
      );
    }
    return pos;
  }, []);

  const velocities = useMemo(
    () =>
      positions.map(
        () =>
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.003,
            (Math.random() - 0.5) * 0.003,
            (Math.random() - 0.5) * 0.002
          )
      ),
    [positions]
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color('#34E7E7'), []);
  const dimColor = useMemo(() => new THREE.Color('#1B2740'), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / size.width) * 2 - 1;
      mouseRef.current.y = -(e.clientY / size.height) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [size]);

  useFrame(() => {
    if (!meshRef.current || !edgesRef.current) return;

    const mouseWorld = new THREE.Vector3(
      mouseRef.current.x * (viewport.width / 2),
      mouseRef.current.y * (viewport.height / 2),
      0
    );

    for (let i = 0; i < NODE_COUNT; i++) {
      const p = positions[i];
      const v = velocities[i];
      p.add(v);

      if (Math.abs(p.x) > SPREAD / 2) v.x *= -1;
      if (Math.abs(p.y) > SPREAD * 0.35) v.y *= -1;
      if (Math.abs(p.z) > SPREAD * 0.25) v.z *= -1;

      const distToMouse = p.distanceTo(mouseWorld);
      const scale = distToMouse < 2 ? 1.5 + (1 - distToMouse / 2) * 1.5 : 1.5;

      dummy.position.copy(p);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const nodeColor = distToMouse < 2.5
        ? color.clone().lerp(dimColor, distToMouse / 2.5)
        : dimColor;
      meshRef.current.setColorAt(i, nodeColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    const edgePositions: number[] = [];
    const edgeColors: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < EDGE_DISTANCE) {
          const alpha = 1 - dist / EDGE_DISTANCE;
          edgePositions.push(
            positions[i].x, positions[i].y, positions[i].z,
            positions[j].x, positions[j].y, positions[j].z
          );
          edgeColors.push(
            0.2, 0.55, 0.94, alpha * 0.4,
            0.2, 0.55, 0.94, alpha * 0.15
          );
        }
      }
    }

    const geo = edgesRef.current.geometry;
    geo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(edgeColors, 4));
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <lineSegments ref={edgesRef}>
        <bufferGeometry />
        <lineBasicMaterial vertexColors transparent opacity={0.5} toneMapped={false} />
      </lineSegments>
    </>
  );
}

function FloatingRing({ radius, speed, color, yOffset }: {
  radius: number; speed: number; color: string; yOffset: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.3 + 0.5;
    ref.current.rotation.y = t;
    ref.current.position.y = yOffset + Math.sin(t * 0.7) * 0.15;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 16, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} toneMapped={false} />
    </mesh>
  );
}

export default function HeroScene() {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    const hover = window.matchMedia('(hover: hover)');
    if (!hover.matches) return;

    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Nodes />
        <FloatingRing radius={1.8} speed={0.3} color="#34E7E7" yOffset={0.2} />
        <FloatingRing radius={2.2} speed={0.2} color="#5B8DEF" yOffset={-0.3} />
        <FloatingRing radius={1.2} speed={0.4} color="#9B8CFF" yOffset={0.1} />
      </Canvas>
    </div>
  );
}
