import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GlobeFallback } from './GlobeFallback';
import { Factory, Activity, Zap, Compass } from 'lucide-react';

export interface FactoryNodeData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
  specialization: string;
  capacity: string;
  leadTime: string;
  efficiency: string;
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
    capacity: '75,000 units/day',
    leadTime: '4.1 days',
    efficiency: '92.4%'
  },
  {
    id: 'FAC-LON-01',
    name: "Lot's O' Nuts",
    lat: 32.882,
    lon: -111.768,
    city: 'Casa Grande',
    state: 'Arizona',
    specialization: 'Nut & Marshmallow Chocolate Bars',
    capacity: '50,000 units/day',
    leadTime: '3.9 days',
    efficiency: '94.8%'
  },
  {
    id: 'FAC-OTH-05',
    name: "The Other Factory",
    lat: 35.118,
    lon: -89.971,
    city: 'Memphis',
    state: 'Tennessee',
    specialization: 'Chewy Candies & Specialty Toffee',
    capacity: '40,000 units/day',
    leadTime: '4.3 days',
    efficiency: '88.6%'
  },
  {
    id: 'FAC-SSK-03',
    name: "Sugar Shack",
    lat: 48.119,
    lon: -96.181,
    city: 'Thief River Falls',
    state: 'Minnesota',
    specialization: 'Sugar Candies & Specialty Beverages',
    capacity: '35,000 units/day',
    leadTime: '4.8 days',
    efficiency: '85.2%'
  },
  {
    id: 'FAC-SEC-04',
    name: "Secret Factory",
    lat: 41.446,
    lon: -90.565,
    city: 'Rock Island',
    state: 'Illinois',
    specialization: 'Experimental Confections & Novelties',
    capacity: '25,000 units/day',
    leadTime: '4.4 days',
    efficiency: '87.1%'
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
];

const GLOBE_RADIUS = 1.95;

// Convert Lat/Lon to 3D Cartesian coordinates on sphere
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate high-resolution procedural cybernetic Earth map
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Midnight Ocean Base
  ctx.fillStyle = '#030816';
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean wave gradients
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, 'rgba(2, 6, 23, 0.95)');
  oceanGrad.addColorStop(0.5, 'rgba(8, 25, 55, 0.6)');
  oceanGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper to map lat/lon to canvas x/y
  const mapPoint = (lat: number, lon: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // Helper to draw a filled & glowing continent polygon
  const drawContinent = (points: [number, number][]) => {
    if (points.length === 0) return;
    ctx.beginPath();
    const [startX, startY] = mapPoint(points[0][0], points[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < points.length; i++) {
      const [px, py] = mapPoint(points[i][0], points[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Fill continent with rich navy-slate
    ctx.fillStyle = '#0c1e3d';
    ctx.fill();

    // Glowing cyan coastline
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner subtle glow
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Stylized Continental Polygons (lat, lon)
  // 1. North America
  drawContinent([
    [70, -165], [72, -135], [68, -100], [60, -65], [48, -55],
    [44, -66], [32, -80], [25, -80], [28, -90], [22, -97],
    [15, -92], [18, -104], [28, -114], [34, -120], [48, -125],
    [58, -140], [62, -165]
  ]);

  // 2. South America
  drawContinent([
    [12, -75], [8, -60], [-5, -35], [-20, -40], [-35, -55],
    [-55, -68], [-52, -75], [-30, -72], [-15, -76], [0, -80]
  ]);

  // 3. Europe
  drawContinent([
    [71, 25], [68, 45], [55, 38], [42, 28], [36, -5],
    [44, -9], [50, 2], [58, 8], [62, 5]
  ]);

  // 4. Africa
  drawContinent([
    [36, -5], [37, 10], [31, 32], [12, 51], [-5, 40],
    [-34, 26], [-34, 18], [-10, 12], [5, 2], [15, -17], [25, -15]
  ]);

  // 5. Asia
  drawContinent([
    [75, 100], [70, 170], [60, 160], [40, 140], [30, 122],
    [20, 108], [10, 105], [10, 80], [25, 65], [30, 48],
    [40, 50], [55, 60], [65, 80]
  ]);

  // 6. Australia
  drawContinent([
    [-12, 130], [-15, 145], [-25, 152], [-38, 145],
    [-35, 118], [-22, 114]
  ]);

  // 2. Cybernetic Continental Data Dots
  ctx.fillStyle = '#38bdf8';
  for (let lat = -65; lat <= 65; lat += 2.5) {
    for (let lon = -175; lon <= 175; lon += 2.5) {
      // Check if coordinate is approximately over land
      let isLand = false;
      // North America
      if (lat >= 15 && lat <= 70 && lon >= -160 && lon <= -55) isLand = true;
      // South America
      else if (lat >= -55 && lat <= 12 && lon >= -80 && lon <= -35) isLand = true;
      // Europe
      else if (lat >= 36 && lat <= 70 && lon >= -10 && lon <= 45) isLand = true;
      // Africa
      else if (lat >= -35 && lat <= 36 && lon >= -18 && lon <= 50) isLand = true;
      // Asia
      else if (lat >= 10 && lat <= 72 && lon >= 50 && lon <= 150) isLand = true;
      // Australia
      else if (lat >= -40 && lat <= -12 && lon >= 114 && lon <= 152) isLand = true;

      if (isLand) {
        const [x, y] = mapPoint(lat, lon);
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Crisp Coordinate Grid Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const [, y] = mapPoint(lat, 0);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const [x] = mapPoint(0, lon);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Equator & Prime Meridian
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
  ctx.lineWidth = 2;
  const [, eqY] = mapPoint(0, 0);
  ctx.beginPath();
  ctx.moveTo(0, eqY);
  ctx.lineTo(width, eqY);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 3D Curved Great-Circle Arc with Neon Tube Geometry & Traveling Pulse
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
  const { curve, tubeGeometry } = useMemo(() => {
    const distance = startPos.distanceTo(endPos);
    const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    // Dynamic arch height proportional to route distance
    const elevation = 1 + distance * 0.16;
    const controlPoint = mid.clone().normalize().multiplyScalar(GLOBE_RADIUS * elevation);

    const quadCurve = new THREE.QuadraticBezierCurve3(startPos, controlPoint, endPos);
    // Smooth 3D neon tube geometry for visible glowing depth from all camera angles
    const tube = new THREE.TubeGeometry(quadCurve, 32, 0.014, 8, false);

    return { curve: quadCurve, tubeGeometry: tube };
  }, [startPos, endPos]);

  // Traveling shipment packet
  useFrame((_, delta) => {
    pulseRef.current = (pulseRef.current + speed * delta) % 1;
    if (particleRef.current) {
      const pos = curve.getPoint(pulseRef.current);
      particleRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* 3D Glowing Arc Tube */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.65} />
      </mesh>

      {/* Traveling Shipment Pulse */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.042, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

// Concentric radar wave around factory nodes
interface PulseRingProps {
  position: THREE.Vector3;
  color: string;
}

const PulseRing: React.FC<PulseRingProps> = ({ position, color }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const scaleRef = useRef<number>(1);

  useFrame((_, delta) => {
    scaleRef.current += delta * 1.6;
    if (scaleRef.current > 3.2) {
      scaleRef.current = 1.0;
    }
    if (ringRef.current) {
      ringRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
    }
    if (matRef.current) {
      const alpha = 1.0 - (scaleRef.current - 1.0) / 2.2;
      matRef.current.opacity = Math.max(0, alpha * 0.7);
    }
  });

  const normal = useMemo(() => position.clone().normalize(), [position]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return q;
  }, [normal]);

  return (
    <mesh ref={ringRef} position={position} quaternion={quaternion}>
      <ringGeometry args={[0.035, 0.065, 24]} />
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
};

// 3D Scene Container
interface GlobeSceneProps {
  selectedFactory: string | null;
  onSelectFactory: (name: string) => void;
}

const GlobeScene: React.FC<GlobeSceneProps> = ({ selectedFactory, onSelectFactory }) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const earthTexture = useMemo(() => createProceduralEarthTexture(), []);

  // Compute 3D vectors
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

  // Shipping routes connecting factories to destination hubs
  const shippingRoutes = useMemo(() => {
    const routes: Array<{
      start: THREE.Vector3;
      end: THREE.Vector3;
      speed: number;
      phase: number;
      id: string;
    }> = [];

    factoryVectors.forEach((fac, facIdx) => {
      destinationVectors.forEach((dest, destIdx) => {
        if ((facIdx + destIdx) % 2 === 0 || (facIdx * 2 + destIdx) % 3 === 0) {
          routes.push({
            start: fac.pos,
            end: dest.pos,
            speed: 0.32 + (facIdx * 0.05),
            phase: (facIdx * 0.22 + destIdx * 0.17) % 1,
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
      globeGroupRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    // Rotated initially to show North America and the 5 factory nodes prominently
    <group ref={globeGroupRef} rotation={[0.35, -Math.PI * 0.42, 0]}>
      {/* 1. Base Earth Core Sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.5}
          metalness={0.15}
          color="#ffffff"
          emissive="#061226"
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* 2. Atmospheric Outer Glow Sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.035, 48, 48]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.09}
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
        <mesh key={dest.name} position={dest.pos}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      ))}

      {/* 5. 5 Primary Manufacturing Hub Nodes */}
      {factoryVectors.map((fac) => {
        const isSelected = selectedFactory === fac.name;
        const nodeColor = isSelected ? '#ff3366' : '#00f0ff';

        return (
          <group key={fac.id}>
            {/* Concentric Radar Ring */}
            <PulseRing position={fac.pos} color={nodeColor} />

            {/* Glowing Factory Beacon */}
            <mesh
              position={fac.pos}
              onClick={(e) => {
                e.stopPropagation();
                onSelectFactory(fac.name);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[isSelected ? 0.065 : 0.05, 16, 16]} />
              <meshBasicMaterial color={nodeColor} />
            </mesh>
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

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !isWebGLAvailable()) {
      setHasWebGL(false);
    }
  }, []);

  // Find the currently active factory for the floating 2D Telemetry HUD Card
  const activeFactory = useMemo(() => {
    return FACTORY_NODES.find((f) => f.name === selectedFactory) || FACTORY_NODES[0];
  }, [selectedFactory]);

  if (!hasWebGL) {
    return <GlobeFallback selectedFactory={selectedFactory} onSelectFactory={onSelectFactory} />;
  }

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto select-none overflow-hidden rounded-2xl">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial from-cyan-500/10 via-slate-950/60 to-slate-950 blur-2xl -z-10 pointer-events-none" />

      {/* Floating 2D Telemetry HUD Card (Clean, perfectly positioned, never clipped) */}
      {activeFactory && (
        <div className="absolute top-3 left-3 z-20 max-w-[260px] bg-slate-900/90 border border-cyan-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none text-left transition-all">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <h4 className="font-bold text-xs text-white truncate">{activeFactory.name}</h4>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
              {activeFactory.efficiency}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium">{activeFactory.city}, {activeFactory.state}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{activeFactory.specialization}</div>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
            <div>
              <span className="text-slate-500 text-[9px] block">Capacity</span>
              <span className="text-cyan-300 font-bold">{activeFactory.capacity.split(" ")[0]} u/d</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[9px] block">Avg Lead Time</span>
              <span className="text-emerald-400 font-bold">{activeFactory.leadTime}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas with High-Performance Settings */}
      <Suspense fallback={<GlobeFallback selectedFactory={selectedFactory} onSelectFactory={onSelectFactory} />}>
        <Canvas
          camera={{ position: [0, 0.4, 5.8], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Subtle Stage Lighting */}
          <ambientLight intensity={1.4} />
          <directionalLight position={[6, 5, 5]} intensity={2.0} color="#e0f2fe" />
          <directionalLight position={[-6, -3, -3]} intensity={0.9} color="#0284c7" />
          <pointLight position={[0, 4, 3]} intensity={1.2} color="#38bdf8" />

          {/* Space Dust Particles */}
          <Stars radius={30} depth={20} count={600} factor={3} saturation={0} fade speed={0.6} />

          {/* The Globe Scene */}
          <GlobeScene selectedFactory={selectedFactory} onSelectFactory={onSelectFactory} />

          {/* Smooth Orbit Controls with Strict Bounds */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.55}
            minPolarAngle={Math.PI * 0.28}
            maxPolarAngle={Math.PI * 0.72}
          />
        </Canvas>
      </Suspense>

      {/* Bottom Telemetry Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-[10px] text-slate-300 backdrop-blur-sm shadow-lg pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-semibold text-cyan-300">5 Production Nodes</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-400">Drag to rotate</span>
      </div>
    </div>
  );
};

export default Globe3D;
