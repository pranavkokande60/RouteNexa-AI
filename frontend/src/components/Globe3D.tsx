import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GlobeFallback } from './GlobeFallback';

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
  color: string;
  accentHex: string;
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
    efficiency: '92.4%',
    color: 'amber',
    accentHex: '#f59e0b'
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
    efficiency: '94.8%',
    color: 'cyan',
    accentHex: '#00f0ff'
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
    efficiency: '88.6%',
    color: 'violet',
    accentHex: '#a855f7'
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
    efficiency: '85.2%',
    color: 'emerald',
    accentHex: '#10b981'
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
    efficiency: '87.1%',
    color: 'rose',
    accentHex: '#f43f5e'
  },
];

export const DESTINATION_HUBS = [
  { id: 'HUB-LAX', name: 'Los Angeles Terminal', lat: 34.052, lon: -118.244, city: 'Los Angeles, CA', region: 'Pacific' },
  { id: 'HUB-SEA', name: 'Seattle Regional Hub', lat: 47.606, lon: -122.332, city: 'Seattle, WA', region: 'Pacific' },
  { id: 'HUB-DFW', name: 'Dallas Cross-Dock', lat: 32.777, lon: -96.797, city: 'Dallas, TX', region: 'Gulf' },
  { id: 'HUB-NYC', name: 'Metro New York DC', lat: 40.713, lon: -74.006, city: 'New York, NY', region: 'Atlantic' },
  { id: 'HUB-MIA', name: 'Miami Gateway', lat: 25.762, lon: -80.192, city: 'Miami, FL', region: 'Atlantic' },
  { id: 'HUB-DEN', name: 'Denver Intermodal', lat: 39.739, lon: -104.990, city: 'Denver, CO', region: 'Interior' },
  { id: 'HUB-CHI', name: 'Chicago Central Depot', lat: 41.878, lon: -87.630, city: 'Chicago, IL', region: 'Interior' },
];

export const LOGISTICS_CORRIDORS = [
  // Wicked Choccy's (Savannah, GA)
  { id: 'SAV-LAX', factoryId: 'FAC-WCK-02', destId: 'HUB-LAX', mode: 'Second Class', isPrimary: true, speed: 0.20 },
  { id: 'SAV-NYC', factoryId: 'FAC-WCK-02', destId: 'HUB-NYC', mode: 'First Class', isPrimary: false, speed: 0.24 },
  { id: 'SAV-MIA', factoryId: 'FAC-WCK-02', destId: 'HUB-MIA', mode: 'Second Class', isPrimary: false, speed: 0.26 },

  // Lot's O' Nuts (Casa Grande, AZ)
  { id: 'CG-DFW', factoryId: 'FAC-LON-01', destId: 'HUB-DFW', mode: 'Same Day', isPrimary: true, speed: 0.22 },
  { id: 'CG-LAX', factoryId: 'FAC-LON-01', destId: 'HUB-LAX', mode: 'Same Day', isPrimary: false, speed: 0.25 },
  { id: 'CG-DEN', factoryId: 'FAC-LON-01', destId: 'HUB-DEN', mode: 'Standard Class', isPrimary: false, speed: 0.22 },

  // The Other Factory (Memphis, TN)
  { id: 'MEM-NYC', factoryId: 'FAC-OTH-05', destId: 'HUB-NYC', mode: 'First Class', isPrimary: true, speed: 0.21 },
  { id: 'MEM-DFW', factoryId: 'FAC-OTH-05', destId: 'HUB-DFW', mode: 'Standard Class', isPrimary: false, speed: 0.24 },
  { id: 'MEM-CHI', factoryId: 'FAC-OTH-05', destId: 'HUB-CHI', mode: 'Second Class', isPrimary: false, speed: 0.25 },

  // Sugar Shack (Thief River Falls, MN)
  { id: 'TRF-CHI', factoryId: 'FAC-SSK-03', destId: 'HUB-CHI', mode: 'Standard Class', isPrimary: true, speed: 0.20 },
  { id: 'TRF-SEA', factoryId: 'FAC-SSK-03', destId: 'HUB-SEA', mode: 'Standard Class', isPrimary: false, speed: 0.19 },
  { id: 'TRF-DEN', factoryId: 'FAC-SSK-03', destId: 'HUB-DEN', mode: 'First Class', isPrimary: false, speed: 0.23 },

  // Secret Factory (Rock Island, IL)
  { id: 'RI-MIA', factoryId: 'FAC-SEC-04', destId: 'HUB-MIA', mode: 'Second Class', isPrimary: true, speed: 0.22 },
  { id: 'RI-NYC', factoryId: 'FAC-SEC-04', destId: 'HUB-NYC', mode: 'First Class', isPrimary: false, speed: 0.24 },
  { id: 'RI-DFW', factoryId: 'FAC-SEC-04', destId: 'HUB-DFW', mode: 'Standard Class', isPrimary: false, speed: 0.23 },
];

const GLOBE_RADIUS = 2.05;

// Convert Lat/Lon to 3D Cartesian coordinates on sphere
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate smooth, geographically accurate great-circle curved path along Earth's surface
function createGreatCircleCurve(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  maxArcHeight: number
): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const segments = 28;
  const vStart = start.clone().normalize();
  const vEnd = end.clone().normalize();
  const angle = Math.max(0.001, vStart.angleTo(vEnd));
  const sinAngle = Math.sin(angle);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let vInterp: THREE.Vector3;
    if (sinAngle < 0.002) {
      vInterp = vStart.clone().lerp(vEnd, t).normalize();
    } else {
      const w1 = Math.sin((1 - t) * angle) / sinAngle;
      const w2 = Math.sin(t * angle) / sinAngle;
      vInterp = new THREE.Vector3()
        .addScaledVector(vStart, w1)
        .addScaledVector(vEnd, w2)
        .normalize();
    }
    // Smooth sinusoidal arc elevation skimming above cloud layer
    const arcHeight = Math.sin(t * Math.PI) * maxArcHeight;
    points.push(vInterp.multiplyScalar(radius + arcHeight));
  }

  return new THREE.CatmullRomCurve3(points);
}

// 3D Curved Great-Circle Arc with Volumetric Tube & Traveling Shipment Marker
interface RouteArcProps {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  speed: number;
  isPrimary: boolean;
  isSelected: boolean;
  isVisible: boolean;
  onSelectRoute: () => void;
}

const RouteArc: React.FC<RouteArcProps> = ({
  startPos,
  endPos,
  speed,
  isPrimary,
  isSelected,
  isVisible,
  onSelectRoute
}) => {
  const particleRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<number>(Math.random());

  // Generate elevated 3D great-circle arc geometry
  const { curve, tubeGeometry, tubeRadius, routeColor, opacity } = useMemo(() => {
    // Keep arcs close to planet curvature: 0.055 to 0.075 radius height
    const maxAltitude = isSelected ? 0.075 : (isPrimary ? 0.065 : 0.05);
    const greatCircleCurve = createGreatCircleCurve(startPos, endPos, GLOBE_RADIUS, maxAltitude);

    const radius = isSelected ? 0.007 : (isPrimary ? 0.0055 : 0.0032);
    const tube = new THREE.TubeGeometry(greatCircleCurve, 36, radius, 8, false);

    // Primary route: brilliant cyan (#00f0ff). Secondary: deep restrained cyan (#0284c7)
    const color = isSelected ? '#00f0ff' : (isPrimary ? '#38bdf8' : '#0284c7');
    const op = isSelected ? 0.95 : (isPrimary ? 0.85 : 0.28);

    return {
      curve: greatCircleCurve,
      tubeGeometry: tube,
      tubeRadius: radius,
      routeColor: color,
      opacity: op
    };
  }, [startPos, endPos, isPrimary, isSelected]);

  // Traveling shipment indicator
  useFrame((_, delta) => {
    if (!isVisible) return;
    pulseRef.current = (pulseRef.current + speed * delta) % 1;
    if (particleRef.current) {
      const pos = curve.getPoint(pulseRef.current);
      particleRef.current.position.copy(pos);
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      {/* 3D Curved Route Tube with Click Interaction */}
      <mesh
        geometry={tubeGeometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelectRoute();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <meshBasicMaterial
          color={routeColor}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* Smooth Traveling Shipment Marker (on primary or selected route) */}
      {(isPrimary || isSelected) && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[isSelected ? 0.024 : 0.018, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

// Pulsing Concentric Radar Wave around Factory Nodes
interface PulseRingProps {
  position: THREE.Vector3;
  color: string;
  isHighlighted: boolean;
}

const PulseRing: React.FC<PulseRingProps> = ({ position, color, isHighlighted }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const scaleRef = useRef<number>(1);

  useFrame((_, delta) => {
    scaleRef.current += delta * (isHighlighted ? 1.4 : 0.9);
    if (scaleRef.current > (isHighlighted ? 1.8 : 1.5)) {
      scaleRef.current = 1.0;
    }
    if (ringRef.current) {
      ringRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
    }
    if (matRef.current) {
      const alpha = 1.0 - (scaleRef.current - 1.0) / (isHighlighted ? 0.8 : 0.5);
      matRef.current.opacity = Math.max(0, alpha * (isHighlighted ? 0.7 : 0.35));
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
      <ringGeometry args={[0.016, 0.028, 24]} />
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Photorealistic Earth Sphere with NASA Day/Night Textures & Separate Rotating Cloud Sphere
interface PhotorealisticGlobeProps {
  selectedFactory: string | null;
  onSelectFactory: (name: string) => void;
  selectedDestination: string | null;
  onSelectDestination: (name: string | null) => void;
  shipModeFilter: string;
}

const PhotorealisticGlobe: React.FC<PhotorealisticGlobeProps> = ({
  selectedFactory,
  onSelectFactory,
  selectedDestination,
  onSelectDestination,
  shipModeFilter
}) => {
  const earthGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load NASA Textures locally from /textures/...
  const [dayMap, lightsMap, cloudsMap, specMap, normalMap] = useTexture([
    '/textures/earth_day_2048.jpg',
    '/textures/earth_lights_2048.png',
    '/textures/earth_clouds_1024.png',
    '/textures/earth_specular_2048.jpg',
    '/textures/earth_normal_2048.jpg',
  ]);

  // Ensure color space calibration
  useEffect(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    lightsMap.colorSpace = THREE.SRGBColorSpace;
    cloudsMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.needsUpdate = true;
    lightsMap.needsUpdate = true;
    cloudsMap.needsUpdate = true;
  }, [dayMap, lightsMap, cloudsMap]);

  // Atmosphere Rayleigh Limb Glow Shader
  const atmosphereShader = useMemo(() => {
    return {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.18, 0.65, 1.0, 1.0) * intensity;
        }
      `,
    };
  }, []);

  // Compute 3D vectors for factories and destination hubs
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

  // Connected freight corridors mapped to real factory and hub locations
  const shippingRoutes = useMemo(() => {
    return LOGISTICS_CORRIDORS.map((corridor) => {
      const fac = factoryVectors.find((f) => f.id === corridor.factoryId) || factoryVectors[0];
      const dest = destinationVectors.find((d) => d.id === corridor.destId) || destinationVectors[0];

      return {
        id: corridor.id,
        start: fac.pos,
        end: dest.pos,
        factoryName: fac.name,
        destName: dest.name,
        shipMode: corridor.mode,
        isPrimary: corridor.isPrimary,
        speed: corridor.speed
      };
    });
  }, [factoryVectors, destinationVectors]);

  // Smooth orbital sway: keeps North American logistics network centered in daylight
  useFrame((state, delta) => {
    if (earthGroupRef.current) {
      // Gentle harmonic sway around North American logistics center (±8 degrees)
      earthGroupRef.current.rotation.y = 0.04 + Math.sin(state.clock.elapsedTime * 0.12) * 0.14;
    }
    if (cloudsRef.current) {
      // Realistic atmospheric cloud drift
      cloudsRef.current.rotation.y += delta * 0.012;
    }
  });

  return (
    // Rotated to center North America (Savannah, Casa Grande, Memphis, Rock Island, Thief River Falls) facing the camera
    <group ref={earthGroupRef} rotation={[0.24, 0.04, 0]}>
      {/* 1. PHOTOREALISTIC EARTH CORE SURFACE */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          roughnessMap={specMap}
          roughness={0.65}
          metalness={0.05}
          emissiveMap={lightsMap}
          emissive="#ffeedd"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* 2. SEPARATE ROTATING REALISTIC CLOUD SPHERE */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.012, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* 3. ATMOSPHERIC LIMB SCATTERING GLOW */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.036, 48, 48]} />
        <shaderMaterial
          vertexShader={atmosphereShader.vertexShader}
          fragmentShader={atmosphereShader.fragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {/* 4. RESTRAINED GEODESIC LOGISTICS ARCS */}
      {shippingRoutes.map((route) => {
        const matchesFactory = !selectedFactory || route.factoryName === selectedFactory;
        const matchesDest = selectedDestination === route.destName;
        const matchesMode = shipModeFilter === 'ALL' || route.shipMode === shipModeFilter;

        // If a specific destination is chosen, only that route is highlighted
        const isSelected = matchesFactory && matchesDest;
        const isPrimaryActive = matchesFactory && !selectedDestination && route.isPrimary;
        const isVisible = matchesMode && matchesFactory;

        return (
          <RouteArc
            key={route.id}
            startPos={route.start}
            endPos={route.end}
            speed={route.speed}
            isPrimary={isPrimaryActive}
            isSelected={isSelected}
            isVisible={isVisible}
            onSelectRoute={() => onSelectDestination(route.destName)}
          />
        );
      })}

      {/* 5. CUSTOMER DESTINATION TERMINAL MARKERS */}
      {destinationVectors.map((dest) => {
        const isSelected = selectedDestination === dest.name;
        return (
          <group key={dest.id} position={dest.pos}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectDestination(isSelected ? null : dest.name);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[isSelected ? 0.022 : 0.014, 14, 14]} />
              <meshBasicMaterial color={isSelected ? '#00f0ff' : '#cbd5e1'} />
            </mesh>
          </group>
        );
      })}

      {/* 6. 5 PRIMARY MANUFACTURING HUB BEACONS */}
      {factoryVectors.map((fac) => {
        const isSelected = selectedFactory === fac.name;

        return (
          <group key={fac.id}>
            <PulseRing position={fac.pos} color={fac.accentHex} isHighlighted={isSelected} />

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
              <sphereGeometry args={[isSelected ? 0.032 : 0.022, 16, 16]} />
              <meshBasicMaterial color={fac.accentHex} />
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
  selectedDestination?: string | null;
  onSelectDestination?: (name: string | null) => void;
  shipModeFilter?: string;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  selectedFactory,
  onSelectFactory,
  selectedDestination = null,
  onSelectDestination = () => {},
  shipModeFilter = 'ALL'
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !isWebGLAvailable()) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <GlobeFallback
        selectedFactory={selectedFactory}
        onSelectFactory={onSelectFactory}
      />
    );
  }

  return (
    <div className="relative w-full aspect-square max-w-[580px] mx-auto select-none overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-cyan-950/20">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial from-cyan-500/10 via-slate-950/70 to-slate-950 blur-3xl -z-10 pointer-events-none" />

      {/* 3D Canvas with High-Performance Settings & Suspense */}
      <Suspense
        fallback={
          <GlobeFallback
            selectedFactory={selectedFactory}
            onSelectFactory={onSelectFactory}
          />
        }
      >
        <Canvas
          camera={{ position: [0, 0.32, 5.7], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Natural Sunlight Illuminating North America in Full Daylight */}
          <directionalLight position={[3, 5, 7]} intensity={2.8} color="#fffdf6" />
          <directionalLight position={[-6, -2, -3]} intensity={0.4} color="#0c2044" />
          <ambientLight intensity={0.75} />

          {/* Deep Space Background Stars */}
          <Stars radius={30} depth={20} count={500} factor={3} saturation={0} fade speed={0.5} />

          {/* Realistic 3D Globe with Atmosphere and Corridors */}
          <PhotorealisticGlobe
            selectedFactory={selectedFactory}
            onSelectFactory={onSelectFactory}
            selectedDestination={selectedDestination}
            onSelectDestination={onSelectDestination}
            shipModeFilter={shipModeFilter}
          />

          {/* Smooth OrbitControls for Manual Exploration */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            rotateSpeed={0.55}
            minPolarAngle={Math.PI * 0.28}
            maxPolarAngle={Math.PI * 0.72}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Globe3D;
