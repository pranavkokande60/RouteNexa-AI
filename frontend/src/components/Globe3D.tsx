import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GlobeFallback } from './GlobeFallback';

import {
  FactoryNodeData,
  FACTORY_NODES,
  DESTINATION_HUBS,
  RiskLevel,
  LOGISTICS_CORRIDORS,
  ACTIVE_TRUCKS,
  SelectedEntity
} from '../data/logisticsData';

export type { FactoryNodeData, SelectedEntity, RiskLevel };
export { FACTORY_NODES, DESTINATION_HUBS, LOGISTICS_CORRIDORS, ACTIVE_TRUCKS };


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

// Spherical Linear Interpolation (slerp) for great-circle geodesic curve
export function createGreatCircleCurve(
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
    // Parabolic arc elevation hovering just above the clouds
    const arcHeight = Math.sin(t * Math.PI) * maxArcHeight;
    points.push(vInterp.multiplyScalar(radius + arcHeight));
  }

  return new THREE.CatmullRomCurve3(points);
}

// 5. LIGHTWEIGHT PROCEDURAL 3D FREIGHT TRUCK
interface FreightTruckProps {
  curve: THREE.CatmullRomCurve3;
  speed: number;
  phaseOffset: number;
  isPaused: boolean;
  truckData: (typeof ACTIVE_TRUCKS)[0];
  isSelected: boolean;
  onSelect: () => void;
}

const FreightTruck: React.FC<FreightTruckProps> = ({
  curve,
  speed,
  phaseOffset,
  isPaused,
  truckData,
  isSelected,
  onSelect
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef<number>(phaseOffset);

  useFrame((_, delta) => {
    if (!isPaused) {
      progressRef.current = (progressRef.current + speed * delta) % 1;
    }
    if (!groupRef.current) return;

    const t = progressRef.current;
    const pos = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const normal = pos.clone().normalize(); // Up vector radially from globe center
    const right = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    const up = new THREE.Vector3().crossVectors(right, tangent).normalize();

    // Orient forward along tangent (Three.js group forward is -Z)
    const rotMatrix = new THREE.Matrix4().makeBasis(right, up, tangent.clone().negate());
    groupRef.current.position.copy(pos);
    groupRef.current.quaternion.setFromRotationMatrix(rotMatrix);
  });

  const riskColor =
    truckData.riskLevel === 'HIGH'
      ? '#ef4444'
      : truckData.riskLevel === 'ELEVATED'
      ? '#f59e0b'
      : '#00f0ff';

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Selection Halo Ring when this truck is clicked */}
      {isSelected && (
        <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.035, 0.052, 24]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 1. TRACTOR CAB */}
      {/* Main Cab Body */}
      <mesh position={[0, 0.012, -0.024]}>
        <boxGeometry args={[0.020, 0.020, 0.022]} />
        <meshStandardMaterial color={isSelected ? '#38bdf8' : '#0ea5e9'} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Aerodynamic Wind Deflector Roof */}
      <mesh position={[0, 0.024, -0.021]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.018, 0.006, 0.016]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Windshield & Side Glass */}
      <mesh position={[0, 0.015, -0.0345]}>
        <boxGeometry args={[0.018, 0.010, 0.002]} />
        <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Front Chrome Bumper & Grille */}
      <mesh position={[0, 0.004, -0.035]}>
        <boxGeometry args={[0.020, 0.008, 0.002]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Dual Headlights (glowing cyan / white) */}
      <mesh position={[-0.007, 0.005, -0.036]}>
        <sphereGeometry args={[0.0022, 8, 8]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      <mesh position={[0.007, 0.005, -0.036]}>
        <sphereGeometry args={[0.0022, 8, 8]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* 2. FREIGHT TRAILER CONTAINER */}
      {/* Main Container Body */}
      <mesh position={[0, 0.016, 0.012]}>
        <boxGeometry args={[0.022, 0.026, 0.046]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* RouteNexa Luminous Side Stripes */}
      <mesh position={[0.0112, 0.016, 0.012]}>
        <boxGeometry args={[0.001, 0.004, 0.042]} />
        <meshBasicMaterial color={riskColor} />
      </mesh>
      <mesh position={[-0.0112, 0.016, 0.012]}>
        <boxGeometry args={[0.001, 0.004, 0.042]} />
        <meshBasicMaterial color={riskColor} />
      </mesh>

      {/* Rear Taillights (red emissive) */}
      <mesh position={[-0.008, 0.006, 0.0355]}>
        <sphereGeometry args={[0.0018, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.008, 0.006, 0.0355]}>
        <sphereGeometry args={[0.0018, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* 3. WHEELS (6 wheels total: 2 cab steer, 4 trailer tandem) */}
      <mesh position={[-0.011, 0.0035, -0.026]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.003, 10]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <mesh position={[0.011, 0.0035, -0.026]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.003, 10]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <mesh position={[-0.011, 0.0035, 0.022]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.003, 10]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <mesh position={[0.011, 0.0035, 0.022]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.003, 10]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <mesh position={[-0.011, 0.0035, 0.030]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.003, 10]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <mesh position={[0.011, 0.0035, 0.030]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.003, 10]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
    </group>
  );
};

// 6. 3D CURVED ROUTE TUBE
interface RouteArcProps {
  curve: THREE.CatmullRomCurve3;
  isPrimary: boolean;
  isSelected: boolean;
  isVisible: boolean;
  risk: RiskLevel;
  onSelectRoute: () => void;
}

const RouteArc: React.FC<RouteArcProps> = ({
  curve,
  isPrimary,
  isSelected,
  isVisible,
  risk,
  onSelectRoute
}) => {
  const { tubeGeometry, routeColor, opacity } = useMemo(() => {
    const radius = isSelected ? 0.0075 : (isPrimary ? 0.0055 : 0.0032);
    const tube = new THREE.TubeGeometry(curve, 36, radius, 8, false);

    // Color by risk: Cyan (Low), Amber (Elevated), Red (High)
    let color = '#0284c7';
    if (isSelected) {
      color = risk === 'HIGH' ? '#ef4444' : (risk === 'ELEVATED' ? '#f59e0b' : '#00f0ff');
    } else if (isPrimary) {
      color = risk === 'HIGH' ? '#ef4444' : (risk === 'ELEVATED' ? '#f59e0b' : '#38bdf8');
    }

    const op = isSelected ? 0.95 : (isPrimary ? 0.85 : 0.28);

    return { tubeGeometry: tube, routeColor: color, opacity: op };
  }, [curve, isPrimary, isSelected, risk]);

  if (!isVisible) return null;

  return (
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
  );
};

// 7. PULSING CONCENTRIC RADAR WAVE
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

// 8. PHOTOREALISTIC EARTH & DIGITAL TWIN GRAPH
interface PhotorealisticGlobeProps {
  selectedFactory: string | null;
  onSelectFactory: (name: string) => void;
  selectedDestination: string | null;
  onSelectDestination: (name: string | null) => void;
  selectedTruck: string | null;
  onSelectTruck: (truckId: string | null) => void;
  selectedRoute: string | null;
  onSelectRoute: (routeId: string | null) => void;
  shipModeFilter: string;
  riskFilter: string;
  showRoutes: boolean;
  showTrucks: boolean;
  isPaused: boolean;
}

const PhotorealisticGlobe: React.FC<PhotorealisticGlobeProps> = ({
  selectedFactory,
  onSelectFactory,
  selectedDestination,
  onSelectDestination,
  selectedTruck,
  onSelectTruck,
  selectedRoute,
  onSelectRoute,
  shipModeFilter,
  riskFilter,
  showRoutes,
  showTrucks,
  isPaused
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

  // Calibration of texture color space
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

  // Pre-calculate Great-Circle curves for each corridor
  const corridorCurves = useMemo(() => {
    const map = new Map<string, { curve: THREE.CatmullRomCurve3; corridor: (typeof LOGISTICS_CORRIDORS)[0] }>();

    LOGISTICS_CORRIDORS.forEach((corridor) => {
      const fac = factoryVectors.find((f) => f.id === corridor.factoryId) || factoryVectors[0];
      const dest = destinationVectors.find((d) => d.id === corridor.destId) || destinationVectors[0];
      const maxAltitude = corridor.isPrimary ? 0.065 : 0.052;
      const curve = createGreatCircleCurve(fac.pos, dest.pos, GLOBE_RADIUS, maxAltitude);
      map.set(corridor.id, { curve, corridor });
    });

    return map;
  }, [factoryVectors, destinationVectors]);

  // Smooth orbital sway: keeps North American logistics network centered in daylight
  useFrame((state, delta) => {
    if (!isPaused) {
      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.y = 0.04 + Math.sin(state.clock.elapsedTime * 0.12) * 0.14;
      }
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += delta * 0.012;
      }
    }
  });

  return (
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
      {showRoutes &&
        Array.from(corridorCurves.entries()).map(([id, { curve, corridor }]) => {
          const fac = factoryVectors.find((f) => f.id === corridor.factoryId);
          const dest = destinationVectors.find((d) => d.id === corridor.destId);
          const factoryName = fac?.name || '';
          const destName = dest?.name || '';

          const matchesFactory = !selectedFactory || factoryName === selectedFactory;
          const matchesDest = selectedDestination === destName;
          const matchesMode = shipModeFilter === 'ALL' || corridor.mode === shipModeFilter;
          const matchesRisk = riskFilter === 'ALL' || corridor.risk === riskFilter;

          const isSelected = selectedRoute === id || (matchesFactory && matchesDest);
          const isPrimaryActive = matchesFactory && !selectedDestination && corridor.isPrimary;
          const isVisible = matchesMode && matchesRisk && matchesFactory;

          return (
            <RouteArc
              key={id}
              curve={curve}
              isPrimary={isPrimaryActive}
              isSelected={isSelected}
              isVisible={isVisible}
              risk={corridor.risk}
              onSelectRoute={() => onSelectRoute(id)}
            />
          );
        })}

      {/* 5. ANIMATED 3D FREIGHT TRUCKS */}
      {showTrucks &&
        ACTIVE_TRUCKS.map((truck) => {
          const corridorData = corridorCurves.get(truck.corridorId);
          if (!corridorData) return null;

          const matchesFactory = !selectedFactory || truck.factoryName === selectedFactory;
          const matchesDest = !selectedDestination || truck.destName === selectedDestination;
          const matchesMode = shipModeFilter === 'ALL' || truck.mode === shipModeFilter;
          const matchesRisk = riskFilter === 'ALL' || truck.riskLevel === riskFilter;

          if (!matchesFactory || !matchesDest || !matchesMode || !matchesRisk) return null;

          const isTruckSelected = selectedTruck === truck.id;

          return (
            <FreightTruck
              key={truck.id}
              curve={corridorData.curve}
              speed={truck.speed}
              phaseOffset={truck.phase}
              isPaused={isPaused}
              truckData={truck}
              isSelected={isTruckSelected}
              onSelect={() => onSelectTruck(truck.id)}
            />
          );
        })}

      {/* 6. CUSTOMER DESTINATION TERMINAL MARKERS */}
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
              <sphereGeometry args={[isSelected ? 0.024 : 0.015, 14, 14]} />
              <meshBasicMaterial color={isSelected ? '#00f0ff' : '#cbd5e1'} />
            </mesh>
          </group>
        );
      })}

      {/* 7. 5 PRIMARY MANUFACTURING HUB BEACONS */}
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
              <sphereGeometry args={[isSelected ? 0.034 : 0.024, 16, 16]} />
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

export interface Globe3DProps {
  selectedFactory: string | null;
  onSelectFactory: (name: string) => void;
  selectedDestination?: string | null;
  onSelectDestination?: (name: string | null) => void;
  selectedTruck?: string | null;
  onSelectTruck?: (truckId: string | null) => void;
  selectedRoute?: string | null;
  onSelectRoute?: (routeId: string | null) => void;
  shipModeFilter?: string;
  riskFilter?: string;
  showRoutes?: boolean;
  showTrucks?: boolean;
  isPaused?: boolean;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  selectedFactory,
  onSelectFactory,
  selectedDestination = null,
  onSelectDestination = () => {},
  selectedTruck = null,
  onSelectTruck = () => {},
  selectedRoute = null,
  onSelectRoute = () => {},
  shipModeFilter = 'ALL',
  riskFilter = 'ALL',
  showRoutes = true,
  showTrucks = true,
  isPaused = false
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

          {/* Realistic 3D Globe with Atmosphere, 3D Trucks, and Corridors */}
          <PhotorealisticGlobe
            selectedFactory={selectedFactory}
            onSelectFactory={onSelectFactory}
            selectedDestination={selectedDestination}
            onSelectDestination={onSelectDestination}
            selectedTruck={selectedTruck}
            onSelectTruck={onSelectTruck}
            selectedRoute={selectedRoute}
            onSelectRoute={onSelectRoute}
            shipModeFilter={shipModeFilter}
            riskFilter={riskFilter}
            showRoutes={showRoutes}
            showTrucks={showTrucks}
            isPaused={isPaused}
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
