import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// ─── Theme ──────────────────────────────────────────────
function useTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    function update() {
      setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    }
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

// ─── Planet config ──────────────────────────────────────
const PLANETS = [
  { name: 'Mercury', orbit: 1.0,  r: 0.06, speed: 2.0, color: '#B5A99A', emissive: '#3D3328' },
  { name: 'Venus',   orbit: 1.4,  r: 0.10, speed: 1.4, color: '#E6C88A', emissive: '#5C4820' },
  { name: 'Earth',   orbit: 1.8,  r: 0.11, speed: 1.0, color: '#4A90D9', emissive: '#1A3550' },
  { name: 'Mars',    orbit: 2.2,  r: 0.08, speed: 0.75, color: '#C1440E', emissive: '#4A1A05' },
  { name: 'Jupiter', orbit: 2.7,  r: 0.22, speed: 0.4, color: '#C88B3A', emissive: '#4A3315' },
  { name: 'Saturn',  orbit: 3.2,  r: 0.18, speed: 0.28, color: '#D4B87A', emissive: '#4A3F20', ring: true },
];

// ─── Draggable Planet with spring-back ──────────────────
function Planet({ orbit, r, speed, color, emissive, ring, index }: {
  orbit: number; r: number; speed: number; color: string;
  emissive: string; ring?: boolean; index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const angle = useRef(index * 1.05);
  const pos = useRef(new THREE.Vector3());
  const dragPos = useRef(new THREE.Vector3());
  const vel = useRef(new THREE.Vector3());
  const { camera, gl } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), -0.4), 0), []);

  const getOrbitXZ = useCallback((a: number) => {
    return new THREE.Vector3(Math.cos(a) * orbit, 0, Math.sin(a) * orbit);
  }, [orbit]);

  useEffect(() => {
    pos.current.copy(getOrbitXZ(angle.current));
  }, [getOrbitXZ]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const cdt = Math.min(dt, 0.04);

    if (!isDragging) {
      angle.current += speed * cdt;
      const target = getOrbitXZ(angle.current);
      const dx = target.x - pos.current.x;
      const dy = target.y - pos.current.y;
      const dz = target.z - pos.current.z;
      vel.current.set(
        vel.current.x * 0.88 + dx * 6 * cdt,
        vel.current.y * 0.88 + dy * 6 * cdt,
        vel.current.z * 0.88 + dz * 6 * cdt,
      );
      pos.current.add(vel.current.clone().multiplyScalar(cdt));
    }

    groupRef.current.position.copy(pos.current);
    groupRef.current.children.forEach(c => {
      if ((c as THREE.Mesh).isMesh) c.rotation.y += cdt * 1.5;
    });
  });

  const onDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    (gl.domElement as any).setPointerCapture?.(e.nativeEvent.pointerId);
  };

  const onMove = (e: any) => {
    if (!isDragging) return;
    const ndc = new THREE.Vector2(
      (e.nativeEvent.offsetX / gl.domElement.clientWidth) * 2 - 1,
      -(e.nativeEvent.offsetY / gl.domElement.clientHeight) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    const flatPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    ray.ray.intersectPlane(flatPlane, hit);
    if (hit) {
      pos.current.set(hit.x, hit.y, 0);
      vel.current.set(0, 0, 0);
    }
  };

  const onUp = (e: any) => {
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
    (gl.domElement as any).releasePointerCapture?.(e.nativeEvent.pointerId);
    const closest = Math.atan2(pos.current.z, pos.current.x);
    angle.current = closest;
  };

  return (
    <group ref={groupRef}>
      {/* Invisible larger hitbox for easier clicking */}
      <mesh
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerOver={() => { gl.domElement.style.cursor = 'pointer'; }}
        onPointerOut={() => { if (!isDragging) gl.domElement.style.cursor = 'grab'; }}
      >
        <sphereGeometry args={[Math.max(r * 2.5, 0.2), 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      {/* Visible planet */}
      <mesh>
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.3}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      {ring && (
        <mesh rotation={[1.3, 0.2, 0]}>
          <torusGeometry args={[r * 1.7, r * 0.12, 2, 48]} />
          <meshStandardMaterial color={color} emissive={emissive} transparent opacity={0.7} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

// ─── Orbit Ring ─────────────────────────────────────────
function OrbitRing({ radius, color }: { radius: number; color: string }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line>
      <primitive object={geo} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={0.3} toneMapped={false} />
    </line>
  );
}

// ─── Solar System (Light) ───────────────────────────────
function SolarScene() {
  const sceneRef = useRef<THREE.Group>(null);

  return (
    <group ref={sceneRef} rotation={[0.4, 0.2, 0]}>
      {/* Directional light from "sun" */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" distance={10} />
      <ambientLight intensity={0.4} />

      {/* Sun */}
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color="#FDB813" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.15} toneMapped={false} />
      </mesh>

      {/* Orbit rings */}
      {PLANETS.map(p => <OrbitRing key={p.name + '-ring'} radius={p.orbit} color="#B5A99A" />)}

      {/* Planets */}
      {PLANETS.map((p, i) => (
        <Planet key={p.name} {...p} index={i} />
      ))}

      {/* Distant stars */}
      <Stars color="#A8A29E" />
    </group>
  );
}

// ─── Earth + Moon (Dark) ────────────────────────────────
function EarthScene() {
  const sceneRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (sceneRef.current) sceneRef.current.rotation.y += dt * 0.05;
  });

  return (
    <group ref={sceneRef} rotation={[0.3, 0, 0]}>
      <pointLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
      <ambientLight intensity={0.2} />

      {/* Earth */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#4A90D9" emissive="#1A3550" emissiveIntensity={0.2} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.82, 16, 16]} />
        <meshBasicMaterial color="#34E7E7" transparent opacity={0.04} toneMapped={false} />
      </mesh>
      {/* Land wireframe hint */}
      <mesh>
        <icosahedronGeometry args={[0.72, 2]} />
        <meshBasicMaterial color="#2D6A4F" wireframe transparent opacity={0.15} toneMapped={false} />
      </mesh>

      {/* Moon orbit */}
      <OrbitRing radius={1.6} color="#2A3A5C" />

      {/* Moon */}
      <Planet orbit={1.6} r={0.2} speed={0.7} color="#D1D5DB" emissive="#3A3A3A" index={0} />

      {/* Outer shell */}
      <mesh>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#5B8DEF" wireframe transparent opacity={0.06} toneMapped={false} />
      </mesh>

      <Stars color="#34E7E7" />
    </group>
  );
}

// ─── Stars ──────────────────────────────────────────────
function Stars({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 60;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.5 + Math.random() * 1;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.02} transparent opacity={0.35} sizeAttenuation toneMapped={false} />
    </points>
  );
}

// ─── Export ─────────────────────────────────────────────
export default function InteractiveCube() {
  const theme = useTheme();

  return (
    <div style={{
      width: '100%',
      height: '440px',
      cursor: 'grab',
      position: 'relative',
      zIndex: 5,
    }}>
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 36 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {theme === 'light' ? <SolarScene /> : <EarthScene />}
      </Canvas>
    </div>
  );
}
