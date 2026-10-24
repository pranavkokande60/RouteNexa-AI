import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GlobeFallback } from './GlobeFallback';
import { Factory, ShieldCheck, MapPin, Truck, Sparkles, Navigation } from 'lucide-react';

export interface FactoryNodeData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
  specialization: string;
  capacity: string;
}

export const FACTORY_NODES: FactoryNodeData[] = [
  {
    id: 'FAC-WCK-02',
    name: "Wicked Choccy's",
    lat: 32.076,
    lon: -81.088,
    city: 'Savannah',
    state: 'Georgia',
    specialization: 'Premium Milk & Caramel Chocolate',
    capacity: '75,000 units/day'
  },
  {
    id: 'FAC-LON-01',
    name: "Lot's O' Nuts",
    lat: 32.882,
    lon: -111.768,
    city: 'Casa Grande',
    state: 'Arizona',
    specialization: 'Nut & Marshmallow Chocolate Bars',
    capacity: '50,000 units/day'
  },
  {
    id: 'FAC-OTH-05',
    name: "The Other Factory",
    lat: 35.118,
    lon: -89.971,
    city: 'Memphis',
    state: 'Tennessee',
    specialization: 'Chewy Candies & Specialty Toffee',
    capacity: '40,000 units/day'
  },
  {
    id: 'FAC-SSK-03',
    name: "Sugar Shack",
    lat: 48.119,
    lon: -96.181,
    city: 'Thief River Falls',
    state: 'Minnesota',
    specialization: 'Sugar Candies & Specialty Beverages',
    capacity: '35,000 units/day'
  },
  {
    id: 'FAC-SEC-04',
    name: "Secret Factory",
    lat: 41.446,
    lon: -90.565,
    city: 'Rock Island',
    state: 'Illinois',
    specialization: 'Experimental Confections & Novelties',
    capacity: '25,000 units/day'
  },
];

export const DESTINATION_HUBS = [
  { name: 'Los Angeles Terminal', lat: 34.052, lon: -118.244, city: 'Los Angeles, CA' },
  { name: 'Seattle Regional Hub', lat: 47.606, lon: -122.332, city: 'Seattle, WA' },
  { name: 'Dallas Cross-Dock', lat: 32.777, lon: -96.797, city: 'Dallas, TX' },
  { name: 'Metro New York DC', lat: 40.713, lon: -74.006, city: 'New York, NY' },
  { name: 'Miami Gateway', lat: 25.762, lon: -80.192, city: 'Miami, FL' },
  { name: 'Denver Intermodal', lat: 39.739, lon: -104.990, city: 'Denver, CO' },
  { name: 'Chicago Central Depot', lat: 41.878, lon: -87.630, city: 'Chicago, IL' },
  { name: 'Atlanta Distribution', lat: 33.749, lon: -84.388, city: 'Atlanta, GA' },
];

const GLOBE_RADIUS = 2.4;

// Convert Lat/Lon to 3D Cartesian coordinates on sphere of given radius
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate procedural cyber-matrix texture for Earth landmasses & coordinate grid
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Deep navy background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, width, height);

  // Latitudinal & longitudinal coordinate grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;

  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw Equator & Prime Meridian with distinct intensity
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Procedural continental dot matrix & stylized land outlines
  const continents: [number, number, number, number][] = [
    // [centerLon, centerLat, radiusLon, radiusLat]
    [-100, 45, 45, 25],   // North America
    [-60, -15, 30, 35],   // South America
    [15, 50, 30, 20],     // Europe
    [20, 10, 35, 35],     // Africa
    [90, 45, 60, 30],     // Asia
    [135, -25, 25, 20],   // Australia
  ];

  ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
  for (let lon = -175; lon <= 175; lon += 3) {
    for (let lat = -75; lat <= 75; lat += 3) {
      // Check if point lies inside any continent bounding ellipse
      let isLand = false;
      for (const [cLon, cLat, rLon, rLat] of continents) {
        const dx = (lon - cLon) / rLon;
        const dy = (lat - cLat) / rLat;
        if (dx * dx + dy * dy <= 1.0) {
          isLand = true;
          break;
        }
      }

      if (isLand) {
        const x = ((lon + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Subtle landmass glow halos
  continents.forEach(([cLon, cLat, rLon, rLat]) => {
    const x = ((cLon + 180) / 360) * width;
    const y = ((90 - cLat) / 180) * height;
    const rx = (rLon / 360) * width;
    const ry = (rLat / 180) * height;
    const grad = ctx.createRadialGradient(x, y, 5, x, y, Math.max(rx, ry));
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 3D Curved Great-Circle Arc Route Component with Traveling Packet Pulses
interface RouteArcProps {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  speed: number;
  phaseOffset: number;
}

const RouteArc: React.FC<RouteArcProps> = ({ startPos, endPos, speed, phaseOffset }) => {
  const particleRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<number>(phaseOffset);

  // Generate 3D curved arc geometry
  const { curve, lineGeometry } = useMemo(() => {
    const distance = startPos.distanceTo(endPos);
    const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    // Arc elevation based on distance
    const elevation = 1 + distance * 0.18;
    const controlPoint = mid.clone().normalize().multiplyScalar(GLOBE_RADIUS * elevation);

    const quadCurve = new THREE.QuadraticBezierCurve3(startPos, controlPoint, endPos);
    const points = quadCurve.getPoints(36);
    const geom = new THREE.BufferGeometry().setFromPoints(points);

    return { curve: quadCurve, lineGeometry: geom };
  }, [startPos, endPos]);

  // Traveling packet pulse along the 3D arc
  useFrame((_, delta) => {
    pulseRef.current = (pulseRef.current + speed * delta) % 1;
    if (particleRef.current) {
      const pos = curve.getPoint(pulseRef.current);
      particleRef.current.position.copy(pos);
    }
  });

  const lineObject = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#00f0ff'),
      transparent: true,
      opacity: 0.55,
      linewidth: 1.5,
    });
    return new THREE.Line(lineGeometry, mat);
  }, [lineGeometry]);

  return (
    <group>
      {/* 3D Arc Path */}
      <primitive object={lineObject} />

      {/* Moving Shipment Packet Particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.038, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

// Radar pulse ring for factory nodes
interface PulseRingProps {
  position: THREE.Vector3;
  color: string;
}

const PulseRing: React.FC<PulseRingProps> = ({ position, color }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const scaleRef = useRef<number>(1);

  useFrame((_, delta) => {
    scaleRef.current += delta * 1.5;
    if (scaleRef.current > 3.0) {
      scaleRef.current = 1.0;
    }
    if (ringRef.current) {
      ringRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
    }
    if (matRef.current) {
      const alpha = 1.0 - (scaleRef.current - 1.0) / 2.0;
      matRef.current.opacity = Math.max(0, alpha * 0.7);
    }
  });

  // Align ring orientation with sphere surface normal
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return q;
  }, [normal]);

  return (
    <mesh ref={ringRef} position={position} quaternion={quaternion}>
      <ringGeometry args={[0.04, 0.07, 24]} />
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Inner 3D Interactive Globe Scene
interface GlobeSceneProps {
  selectedFactory: string | null;
  onSelectFactory: (name: string) => void;
  hoveredFactory: string | null;
  setHoveredFactory: (name: string | null) => void;
}

const GlobeScene: React.FC<GlobeSceneProps> = ({
  selectedFactory,
  onSelectFactory,
  hoveredFactory,
  setHoveredFactory
}) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const earthTexture = useMemo(() => createProceduralEarthTexture(), []);

  // Compute 3D positions for factories and destination hubs
  const factoryVectors = useMemo(() => {
    return FACTORY_NODES.map((f) => ({
      ...f,
      pos: latLonToVector3(f.lat, f.lon, GLOBE_RADIUS),
    }));
  }, []);

  const destinationVectors = useMemo(() => {
    return DESTINATION_HUBS.map((d) => ({
      ...d,
      pos: latLonToVector3(d.lat, d.lon, GLOBE_RADIUS),
    }));
  }, []);

  // Shipping routes connecting factories to multiple hubs
  const shippingRoutes = useMemo(() => {
    const routes: Array<{
      start: THREE.Vector3;
      end: THREE.Vector3;
      speed: number;
      phase: number;
      id: string;
    }> = [];

    factoryVectors.forEach((fac, facIdx) => {
      // Connect each factory to 2-3 regional destinations
      destinationVectors.forEach((dest, destIdx) => {
        if ((facIdx + destIdx) % 3 === 0 || (facIdx * 2 + destIdx) % 5 === 0) {
          routes.push({
            start: fac.pos,
            end: dest.pos,
            speed: 0.35 + (facIdx * 0.05),
            phase: (facIdx * 0.2 + destIdx * 0.15) % 1,
            id: `${fac.id}-${dest.name}`,
          });
        }
      });
    });

    return routes;
  }, [factoryVectors, destinationVectors]);

  // Gentle auto-rotation
  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={globeGroupRef} rotation={[0.3, -Math.PI * 0.32, 0]}>
      {/* 1. Base Earth Core Sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.2}
          color="#0b1739"
          emissive="#030816"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* 2. Atmospheric Outer Glow Sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.025, 48, 48]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Shipping Route 3D Arcs */}
      {shippingRoutes.map((route) => (
        <RouteArc
          key={route.id}
          startPos={route.start}
          endPos={route.end}
          speed={route.speed}
          phaseOffset={route.phase}
        />
      ))}

      {/* 4. Customer Destination Hub Markers */}
      {destinationVectors.map((dest) => (
        <group key={dest.name} position={dest.pos}>
          <mesh>
            <sphereGeometry args={[0.024, 12, 12]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        </group>
      ))}

      {/* 5. 5 Primary Manufacturing Hub Nodes */}
      {factoryVectors.map((fac) => {
        const isSelected = selectedFactory === fac.name;
        const isHovered = hoveredFactory === fac.name;
        const nodeColor = isSelected ? '#f43f5e' : '#00f0ff';

        return (
          <group key={fac.id}>
            {/* Pulsing Radar Wave */}
            <PulseRing position={fac.pos} color={nodeColor} />

            {/* Glowing Factory Sphere */}
            <mesh
              position={fac.pos}
              onClick={(e) => {
                e.stopPropagation();
                onSelectFactory(fac.name);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredFactory(fac.name);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHoveredFactory(null);
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[isSelected || isHovered ? 0.065 : 0.05, 16, 16]} />
              <meshBasicMaterial color={nodeColor} />
            </mesh>

            {/* Floating HTML Badge for Selected / Hovered Factory */}
            {(isSelected || isHovered) && (
              <Html position={fac.pos} distanceFactor={8} zIndexRange={[100, 0]}>
                <div className="bg-slate-900/95 border border-sky-400 text-slate-100 p-2.5 rounded-xl shadow-2xl backdrop-blur-md w-52 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 text-left">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                    <Factory className="w-3.5 h-3.5 text-sky-400" />
                    <span>{fac.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium mt-0.5">{fac.city}, {fac.state}</div>
                  <div className="text-[9px] text-slate-400 mt-1 leading-snug">{fac.specialization}</div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[9px] flex justify-between text-slate-400 font-mono">
                    <span>Capacity:</span>
                    <span className="text-sky-300 font-semibold">{fac.capacity}</span>
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Check WebGL availability safely
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

interface Globe3DProps {
  selectedFactory: string | null;
  onSelectFactory: (name: string) => void;
}

export const Globe3D: React.FC<Globe3DProps> = ({ selectedFactory, onSelectFactory }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [hoveredFactory, setHoveredFactory] = useState<string | null>(null);

  useEffect(() => {
    // Detect WebGL support and user reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !isWebGLAvailable()) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <GlobeFallback selectedFactory={selectedFactory} onSelectFactory={onSelectFactory} />;
  }

  return (
    <div className="relative w-full aspect-square max-w-[620px] mx-auto select-none">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial from-sky-500/15 via-indigo-950/20 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* 3D Canvas */}
      <Suspense fallback={<GlobeFallback selectedFactory={selectedFactory} onSelectFactory={onSelectFactory} />}>
        <Canvas
          camera={{ position: [0, 0, 5.8], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          {/* Subtle Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 4, 5]} intensity={1.4} color="#e0f2fe" />
          <pointLight position={[-6, -4, -3]} intensity={0.5} color="#38bdf8" />

          {/* Deep Space Dust / Starfield */}
          <Stars radius={40} depth={25} count={800} factor={3} saturation={0} fade speed={0.8} />

          {/* The Globe Scene */}
          <GlobeScene
            selectedFactory={selectedFactory}
            onSelectFactory={onSelectFactory}
            hoveredFactory={hoveredFactory}
            setHoveredFactory={setHoveredFactory}
          />

          {/* Restrained Camera Orbit Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
            minPolarAngle={Math.PI * 0.25}
            maxPolarAngle={Math.PI * 0.75}
          />
        </Canvas>
      </Suspense>

      {/* 3D Telemetry Overlay Controls */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-300 backdrop-blur-md shadow-xl pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-semibold text-cyan-300">5 Production Nodes</span>
        <span className="text-slate-600">•</span>
        <span className="text-[11px] text-slate-400">Drag to rotate 3D Earth</span>
      </div>
    </div>
  );
};

export default Globe3D;
