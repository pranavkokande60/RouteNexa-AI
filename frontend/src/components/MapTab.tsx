import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  MapPin, Factory, AlertTriangle, Layers, Info, X, Compass, Activity, Eye,
  Route as RouteIcon, Package, Truck, DollarSign, Maximize2, Minimize2,
  Play, Pause, FastForward, ThermometerSun, Radio, Search, ShieldAlert,
  Sparkles, Navigation, CheckCircle2, ChevronRight, Wind
} from 'lucide-react';
import L from 'leaflet';
import { api } from '../api';

interface MapTabProps {
  mapData: any;
}

// Confectionery Thermal Degradation Risk States (Ambient summer heat > 78°F requiring Reefer)
const THERMAL_RISK_STATES: Record<string, { temp: number; advisory: string; risk: 'CRITICAL' | 'HIGH' | 'MODERATE' }> = {
  'Arizona': { temp: 104, advisory: 'Critical Heat Zone (Casa Grande plant origin). Mandatory multi-temp reefer (55-65°F) to prevent chocolate softening.', risk: 'CRITICAL' },
  'Nevada': { temp: 101, advisory: 'High Desert Temperature. Direct sun exposure hazard during depot cross-docking.', risk: 'CRITICAL' },
  'Texas': { temp: 96, advisory: 'Subtropical Heat & Humidity. High volume confectionery terminal. Mandatory climate-controlled line-haul.', risk: 'HIGH' },
  'Florida': { temp: 92, advisory: 'Severe Relative Humidity & Heat. Sugar bloom risk on gummy candies and chocolate coatings.', risk: 'HIGH' },
  'Georgia': { temp: 91, advisory: 'Savannah plant origin. Pre-cool trailers to 58°F prior to outbound staging.', risk: 'HIGH' },
  'Louisiana': { temp: 93, advisory: 'High humidity corridor. Rapid condensation hazard during dock transfer.', risk: 'HIGH' },
  'New Mexico': { temp: 94, advisory: 'Arid desert transit lane. Nighttime dispatch strongly advised.', risk: 'MODERATE' },
  'California': { temp: 89, advisory: 'Central Valley heat corridor. Prioritize morning direct deliveries.', risk: 'MODERATE' }
};

// Quadratic Bezier interpolation for curved geodesic flight/freight arcs
function generateCurvedArc(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  numPoints: number = 22,
  curvature: number = 0.16
): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);

  // Perpendicular vector for arching
  const perpLat = -dLng / (dist || 1);
  const perpLng = dLat / (dist || 1);
  const offset = dist * curvature;
  const ctrlLat = midLat + perpLat * offset * 0.4 + Math.abs(offset) * 0.12;
  const ctrlLng = midLng + perpLng * offset * 0.4;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const inv = 1 - t;
    const lat = inv * inv * lat1 + 2 * inv * t * ctrlLat + t * t * lat2;
    const lng = inv * inv * lng1 + 2 * inv * t * ctrlLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

// Point evaluator on the bezier curve at parameter t (0.0 to 1.0)
function getBezierPoint(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  t: number,
  curvature: number = 0.16
): [number, number] {
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  const perpLat = -dLng / (dist || 1);
  const perpLng = dLat / (dist || 1);
  const offset = dist * curvature;
  const ctrlLat = midLat + perpLat * offset * 0.4 + Math.abs(offset) * 0.12;
  const ctrlLng = midLng + perpLng * offset * 0.4;

  const inv = 1 - t;
  const lat = inv * inv * lat1 + 2 * inv * t * ctrlLat + t * t * lat2;
  const lng = inv * inv * lng1 + 2 * inv * t * ctrlLng + t * t * lng2;
  return [lat, lng];
}

// Haversine distance in miles
function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const MapTab: React.FC<MapTabProps> = ({ mapData: initialMapData }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayerRef = useRef<L.TileLayer | null>(null);

  const [mapData, setMapData] = useState<any>(initialMapData);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedFactory, setSelectedFactory] = useState<string | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<any | null>(null);
  const [stateAnalytics, setStateAnalytics] = useState<any | null>(null);
  const [factoryAnalytics, setFactoryAnalytics] = useState<any | null>(null);
  const [loadingState, setLoadingState] = useState(false);

  // Layer & Visual Controls
  const [mapMode, setMapMode] = useState<'risk' | 'volume' | 'lead_time'>('risk');
  const [basemap, setBasemap] = useState<'satellite' | 'google_streets' | 'topo' | 'dark' | 'osm'>('satellite');
  const [showCorridors, setShowCorridors] = useState(true);
  const [showCurvedArcs, setShowCurvedArcs] = useState(true);
  const [showThermalRisk, setShowThermalRisk] = useState(false);
  const [showIsochrones, setShowIsochrones] = useState(false);
  const [factoryFilter, setFactoryFilter] = useState<string>('ALL');
  const [corridorTierFilter, setCorridorTierFilter] = useState<'ALL' | 'BOTTLENECK' | 'HIGH_PERF' | 'HIGH_VOLUME'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Moving Particle Simulation Controls
  const [isSimPlaying, setIsSimPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const activeParticlesRef = useRef<any[]>([]);
  const particleMarkersRef = useRef<L.CircleMarker[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Real-world and Google Maps style basemap tile definitions
  const BASEMAPS = {
    satellite: {
      name: 'Real World Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics'
    },
    google_streets: {
      name: 'Google Streets',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; StreetMap contributors'
    },
    topo: {
      name: 'Physical Terrain',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; USGS, NOAA'
    },
    dark: {
      name: 'Cyber Dark',
      url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB & OpenStreetMap contributors'
    },
    osm: {
      name: 'OpenStreetMap',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    }
  };

  // Auto-fetch if not provided
  useEffect(() => {
    if (initialMapData && initialMapData.states && initialMapData.states.length > 0) {
      setMapData(initialMapData);
    } else {
      api.getMapData()
        .then(res => setMapData(res))
        .catch(err => console.error("Failed to load map data:", err));
    }
  }, [initialMapData]);

  // Compute Network Statistics
  const networkStats = useMemo(() => {
    if (!mapData) return { totalShipments: 0, avgLeadTime: 0, bottlenecks: 0, totalRoutes: 0, totalSales: 0 };
    const routes = mapData.routes || [];
    const states = mapData.states || [];
    const bottlenecks = routes.filter((r: any) => r.is_bottleneck || r.efficiency_score < 50).length;
    const totalShipments = states.reduce((sum: number, s: any) => sum + (s.total_shipments || 0), 0);
    const totalSales = states.reduce((sum: number, s: any) => sum + (s.total_sales || 0), 0);
    const avgLeadTime = states.length > 0
      ? (states.reduce((sum: number, s: any) => sum + (s.avg_operational_lead_time || 0), 0) / states.length).toFixed(2)
      : '4.29';

    return {
      totalShipments,
      avgLeadTime,
      bottlenecks,
      totalRoutes: routes.length,
      totalSales
    };
  }, [mapData]);

  // Filtered Routes
  const filteredRoutes = useMemo(() => {
    if (!mapData?.routes) return [];
    return mapData.routes.filter((r: any) => {
      // Factory Filter
      if (factoryFilter !== 'ALL' && r.factory_name !== factoryFilter) return false;
      // Corridor Tier Filter
      if (corridorTierFilter === 'BOTTLENECK' && !r.is_bottleneck && r.efficiency_score >= 50) return false;
      if (corridorTierFilter === 'HIGH_PERF' && r.efficiency_score < 75) return false;
      if (corridorTierFilter === 'HIGH_VOLUME' && r.shipments_count < 100) return false;
      return true;
    });
  }, [mapData, factoryFilter, corridorTierFilter]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [38.5, -96.5],
      zoom: 4,
      minZoom: 3,
      maxZoom: 11,
      zoomControl: false
    });

    // Add Zoom Control to Top Left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    const initialTiles = L.tileLayer(BASEMAPS[basemap].url, {
      attribution: BASEMAPS[basemap].attribution,
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = initialTiles;

    if (basemap === 'satellite') {
      const overlayTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      }).addTo(map);
      overlayLayerRef.current = overlayTiles;
    }

    map.fitBounds([
      [24.5, -124.8],
      [49.4, -66.9]
    ], { padding: [20, 20] });

    mapInstanceRef.current = map;

    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (overlayLayerRef.current) {
      map.removeLayer(overlayLayerRef.current);
      overlayLayerRef.current = null;
    }

    const newTiles = L.tileLayer(BASEMAPS[basemap].url, {
      attribution: BASEMAPS[basemap].attribution,
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = newTiles;

    // For satellite mode, add transparent highway and boundary labels overlay (Google Maps Satellite Hybrid style)
    if (basemap === 'satellite') {
      const overlayTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      }).addTo(map);
      overlayLayerRef.current = overlayTiles;
    }
  }, [basemap]);

  // Render Core Layers: Corridors, Factories, States, Thermal Risk, Isochrones
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapData) return;

    map.invalidateSize();

    // Clear dynamic non-tile layers
    map.eachLayer((layer) => {
      if (
        layer instanceof L.Marker ||
        layer instanceof L.CircleMarker ||
        layer instanceof L.Polyline ||
        layer instanceof L.Circle
      ) {
        map.removeLayer(layer);
      }
    });

    // 1. Factory Isochrones / SLA Reach Radii Rings
    if (showIsochrones && mapData.factories) {
      mapData.factories.forEach((f: any) => {
        // 24h Express Horizon: 350 miles (~563,000 meters)
        L.circle([f.lat, f.lng], {
          radius: 563000,
          color: '#10b981',
          weight: 1.2,
          fillColor: '#10b981',
          fillOpacity: 0.04,
          dashArray: '4, 6'
        }).addTo(map).bindTooltip(`24h SLA Horizon: ${f.name} (350 mi)`, { direction: 'top' });

        // 48h Standard Horizon: 800 miles (~1,287,000 meters)
        L.circle([f.lat, f.lng], {
          radius: 1287000,
          color: '#38bdf8',
          weight: 1.2,
          fillColor: '#38bdf8',
          fillOpacity: 0.03,
          dashArray: '6, 8'
        }).addTo(map).bindTooltip(`48h SLA Horizon: ${f.name} (800 mi)`, { direction: 'top' });

        // 72h Extended Horizon: 1,400 miles (~2,253,000 meters)
        L.circle([f.lat, f.lng], {
          radius: 2253000,
          color: '#818cf8',
          weight: 1,
          fillColor: '#818cf8',
          fillOpacity: 0.02,
          dashArray: '8, 12'
        }).addTo(map).bindTooltip(`72h SLA Horizon: ${f.name} (1,400 mi)`, { direction: 'top' });
      });
    }

    // 2. Perishable Confectionery Thermal Hazard Circles
    if (showThermalRisk && mapData.states) {
      mapData.states.forEach((s: any) => {
        const hazard = THERMAL_RISK_STATES[s.state_name];
        if (hazard) {
          const color = hazard.risk === 'CRITICAL' ? '#ef4444' : (hazard.risk === 'HIGH' ? '#f97316' : '#eab308');
          const circle = L.circle([s.lat, s.lng], {
            radius: 220000,
            color: color,
            weight: 2,
            fillColor: color,
            fillOpacity: 0.18,
            dashArray: '5, 5'
          }).addTo(map);

          circle.bindTooltip(`
            <div style="font-family: inherit; font-size: 11px; max-width: 240px; padding: 4px;">
              <div style="font-weight: 800; color: ${color}; display: flex; items-center; gap: 4px;">
                <span>🌡️ ${hazard.risk} THERMAL RISK</span>
                <span style="margin-left: auto;">${hazard.temp}°F</span>
              </div>
              <div style="color: #cbd5e1; margin-top: 4px; line-height: 1.3;">
                ${hazard.advisory}
              </div>
            </div>
          `, { direction: 'top' });
        }
      });
    }

    // 3. Shipping Corridors (Curved Geodesic Arcs)
    if (showCorridors && filteredRoutes) {
      filteredRoutes.forEach((r: any) => {
        const isCorridorSelected = selectedCorridor && selectedCorridor.route_id === r.route_id;
        const isHighlighted = isCorridorSelected ||
                              (selectedFactory && r.factory_name === selectedFactory) ||
                              (selectedState && r.destination_state === selectedState);

        // Color coding by health and state
        let strokeColor = '#38bdf8';
        let customClass = 'leaflet-flow-active';

        if (r.is_bottleneck || r.efficiency_score < 50) {
          strokeColor = '#ef4444';
          customClass = 'leaflet-flow-bottleneck';
        } else if (r.efficiency_score >= 80) {
          strokeColor = '#10b981';
          customClass = 'leaflet-flow-fast';
        } else {
          strokeColor = basemap === 'voyager' ? '#0284c7' : '#38bdf8';
        }

        if (isHighlighted) {
          strokeColor = '#38bdf8';
          customClass = 'leaflet-flow-highlighted';
        }

        const opacity = isHighlighted ? 0.95 : (isCorridorSelected ? 1.0 : (basemap === 'voyager' ? 0.25 : 0.28));
        const weight = isHighlighted ? 3.8 : (r.is_bottleneck ? 2.4 : 1.5);

        let pathCoords: [number, number][];
        if (showCurvedArcs) {
          pathCoords = generateCurvedArc(r.origin_lat, r.origin_lng, r.dest_lat, r.dest_lng);
        } else {
          pathCoords = [[r.origin_lat, r.origin_lng], [r.dest_lat, r.dest_lng]];
        }

        const polyline = L.polyline(pathCoords, {
          color: strokeColor,
          weight: weight,
          opacity: opacity,
          className: customClass
        }).addTo(map);

        const distMiles = getDistanceMiles(r.origin_lat, r.origin_lng, r.dest_lat, r.dest_lng);

        polyline.bindTooltip(`
          <div style="font-family: inherit; font-size: 11px; padding: 4px; min-width: 190px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 12px; margin-bottom: 2px;">
              ${r.factory_name} &rarr; ${r.destination_state}
            </div>
            <div style="color: #94a3b8; font-size: 10px;">Corridor Distance: <strong>${distMiles} miles</strong></div>
            <div style="margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; border-top: 1px solid #334155; padding-top: 4px;">
              <div>Volume: <strong>${r.shipments_count}</strong></div>
              <div>Lead Time: <strong>${r.avg_lead_time}d</strong></div>
              <div>Score: <strong>${r.efficiency_score}/100</strong></div>
              <div style="color: ${r.efficiency_score < 50 ? '#ef4444' : '#10b981'}; font-weight: 700;">
                ${r.performance_tier}
              </div>
            </div>
            <div style="margin-top: 4px; font-size: 9px; color: #38bdf8;">
              &rarr; Click to open Corridor Telemetry Crosshair
            </div>
          </div>
        `, { direction: 'top' });

        polyline.on('click', () => {
          setSelectedCorridor({
            ...r,
            distance_miles: distMiles
          });
          setSelectedFactory(null);
          setSelectedState(null);
        });
      });
    }

    // 4. Manufacturing Hub Icons with Animated Radar Ping
    const factoryIcon = L.divIcon({
      className: 'custom-factory-hub',
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div class="radar-ping-ring" style="color: #0284c7;"></div>
          <div style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; width: 34px; height: 34px; border-radius: 10px; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(2,132,199,0.8); cursor: pointer;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2z"/></svg>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    if (mapData.factories) {
      mapData.factories.forEach((f: any) => {
        const marker = L.marker([f.lat, f.lng], { icon: factoryIcon }).addTo(map);

        marker.bindTooltip(`
          <div style="font-family: inherit; font-size: 12px; min-width: 220px; padding: 3px;">
            <div style="font-weight: 800; color: #0284c7; font-size: 13px;">${f.name}</div>
            <div style="color: #64748b; font-size: 11px;">${f.city}, ${f.state} (${f.id})</div>
            <div style="margin-top: 5px; font-weight: 600; color: #0369a1; background: #e0f2fe; padding: 2px 7px; border-radius: 4px; display: inline-block; font-size: 10px;">
              ${f.specialization}
            </div>
            <div style="margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 5px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #0f172a;">
              <div>Volume: <strong>${f.total_shipments?.toLocaleString() || 'N/A'}</strong></div>
              <div>Units: <strong>${f.total_units?.toLocaleString() || 'N/A'}</strong></div>
              <div>Lead Time: <strong>${f.avg_operational_lead_time ? f.avg_operational_lead_time + 'd' : 'N/A'}</strong></div>
              <div>Delay Rate: <strong>${f.delay_rate_pct !== undefined ? f.delay_rate_pct + '%' : 'N/A'}</strong></div>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #0284c7; font-weight: 700;">
              &rarr; Click facility to inspect active outbound corridors
            </div>
          </div>
        `, { direction: 'top' });

        marker.on('click', () => {
          handleFactoryClick(f);
        });
      });
    }

    // 5. Destination State Markers
    if (mapData.states) {
      mapData.states.forEach((s: any) => {
        if (!s.lat || !s.lng) return;

        let color = '#0284c7';
        let radius = 7;

        if (mapMode === 'risk') {
          color = s.delay_rate_pct >= 25 ? '#ef4444' : (s.delay_rate_pct >= 15 ? '#f59e0b' : '#10b981');
        } else if (mapMode === 'volume') {
          radius = Math.max(6, Math.min(22, (s.total_shipments / 1200) * 22));
          color = '#6366f1';
        } else if (mapMode === 'lead_time') {
          color = s.avg_operational_lead_time >= 5.0 ? '#ef4444' : (s.avg_operational_lead_time >= 4.0 ? '#0284c7' : '#10b981');
        }

        const isStateSelected = selectedState === s.state_name;

        const circle = L.circleMarker([s.lat, s.lng], {
          radius: isStateSelected ? radius + 4 : radius,
          fillColor: color,
          color: isStateSelected ? '#38bdf8' : '#ffffff',
          weight: isStateSelected ? 3.5 : 2,
          opacity: 0.95,
          fillOpacity: 0.85
        }).addTo(map);

        circle.bindTooltip(`
          <div style="font-family: inherit; font-size: 12px; padding: 3px;">
            <strong style="font-size: 13px; color: #0284c7;">${s.state_name} (${s.code})</strong><br/>
            Volume: <strong>${s.total_shipments?.toLocaleString()}</strong> orders<br/>
            Avg Lead Time: <strong>${s.avg_operational_lead_time} days</strong><br/>
            Delay Rate: <strong>${s.delay_rate_pct}%</strong> (${s.risk_level})<br/>
            <span style="font-size: 10px; color: #0284c7; font-weight: 700;">&rarr; Click to open State Analytics</span>
          </div>
        `, { direction: 'top' });

        circle.on('click', () => {
          handleStateClick(s.state_name);
        });
      });
    }

    // 6. Initialize In-Motion Freight Particles
    if (mapData.routes && mapData.routes.length > 0) {
      // Pick top 20 representative corridors for live motion
      const representative = mapData.routes
        .filter((r: any) => r.shipments_count >= 40)
        .slice(0, 20);

      activeParticlesRef.current = representative.map((r: any, idx: number) => ({
        id: idx,
        route: r,
        t: (idx / 20), // stagger start positions
        speed: 0.003 + (idx % 4) * 0.001
      }));

      // Create Leaflet circle markers for the particles
      particleMarkersRef.current.forEach(m => map.removeLayer(m));
      particleMarkersRef.current = activeParticlesRef.current.map(p => {
        const pt = getBezierPoint(p.route.origin_lat, p.route.origin_lng, p.route.dest_lat, p.route.dest_lng, p.t);
        const marker = L.circleMarker(pt, {
          radius: 4.5,
          fillColor: '#38bdf8',
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(map);

        marker.bindTooltip(`
          <div style="font-size: 10px; font-family: inherit;">
            <div style="font-weight: 700; color: #38bdf8;">🚚 In-Transit Freight Unit #${p.id + 101}</div>
            <div>${p.route.factory_name} &rarr; ${p.route.destination_state}</div>
            <div style="color: #94a3b8;">Avg Lead Time: ${p.route.avg_lead_time}d</div>
          </div>
        `, { direction: 'top' });

        return marker;
      });
    }

  }, [
    mapData, filteredRoutes, mapMode, basemap, showCorridors, showCurvedArcs,
    showThermalRisk, showIsochrones, selectedFactory, selectedState, selectedCorridor
  ]);

  // Particle Animation Loop
  useEffect(() => {
    if (!isSimPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const animateParticles = () => {
      const particles = activeParticlesRef.current;
      const markers = particleMarkersRef.current;

      if (particles.length > 0 && markers.length === particles.length) {
        particles.forEach((p, i) => {
          p.t += p.speed * simSpeed;
          if (p.t > 1.0) p.t = 0.0;

          const pt = getBezierPoint(
            p.route.origin_lat, p.route.origin_lng,
            p.route.dest_lat, p.route.dest_lng,
            p.t
          );
          if (markers[i]) {
            markers[i].setLatLng(pt);
          }
        });
      }

      animFrameRef.current = requestAnimationFrame(animateParticles);
    };

    animFrameRef.current = requestAnimationFrame(animateParticles);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSimPlaying, simSpeed]);

  // Handler for Factory Click
  const handleFactoryClick = (f: any) => {
    if (selectedFactory === f.name) {
      setSelectedFactory(null);
      setFactoryAnalytics(null);
    } else {
      setSelectedFactory(f.name);
      setFactoryAnalytics(f);
      setSelectedState(null);
      setStateAnalytics(null);
      setSelectedCorridor(null);

      // Smoothly zoom in to the factory
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([f.lat, f.lng], 6, { duration: 1.2 });
      }
    }
  };

  // Handler for State Click
  const handleStateClick = async (stateName: string) => {
    setSelectedState(stateName);
    setSelectedFactory(null);
    setFactoryAnalytics(null);
    setSelectedCorridor(null);
    setLoadingState(true);

    try {
      const res = await api.getStateAnalytics(stateName);
      setStateAnalytics(res);
      // Center on state
      const stateObj = mapData?.states?.find((s: any) => s.state_name === stateName);
      if (stateObj && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([stateObj.lat, stateObj.lng], 6, { duration: 1.2 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingState(false);
    }
  };

  // Quick Fly-To Handler
  const handleFlyTo = (lat: number, lng: number, zoom: number, factoryObj?: any) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.4 });
    if (factoryObj) {
      handleFactoryClick(factoryObj);
    }
  };

  // Reset to Continental US
  const handleResetBounds = () => {
    if (!mapInstanceRef.current) return;
    setSelectedFactory(null);
    setSelectedState(null);
    setSelectedCorridor(null);
    setFactoryAnalytics(null);
    setStateAnalytics(null);
    mapInstanceRef.current.flyToBounds([
      [24.5, -124.8],
      [49.4, -66.9]
    ], { padding: [20, 20], duration: 1.4 });
  };

  // Search Jump Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapData) return;
    const q = searchQuery.toLowerCase().trim();

    // Check factories
    const factoryMatch = mapData.factories?.find((f: any) =>
      f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q)
    );
    if (factoryMatch) {
      handleFlyTo(factoryMatch.lat, factoryMatch.lng, 6, factoryMatch);
      setSearchQuery('');
      return;
    }

    // Check states
    const stateMatch = mapData.states?.find((s: any) =>
      s.state_name.toLowerCase().includes(q) || s.code.toLowerCase() === q
    );
    if (stateMatch) {
      handleStateClick(stateMatch.state_name);
      setSearchQuery('');
      return;
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Floating Heads-Up Display (HUD) Telemetry Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Manufacturing Hubs</div>
            <div className="text-base font-extrabold text-white">5 Facilities</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
            <RouteIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Monitored Corridors</div>
            <div className="text-base font-extrabold text-white">{networkStats.totalRoutes} Active Lanes</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">National Lead Time</div>
            <div className="text-base font-extrabold text-emerald-400">{networkStats.avgLeadTime} days</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Bottlenecks Identified</div>
            <div className="text-base font-extrabold text-rose-400">{networkStats.bottlenecks} Corridors</div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">In-Motion Simulator</div>
            <div className="text-base font-extrabold text-amber-300">20 Live Pulses</div>
          </div>
        </div>
      </div>

      {/* Main Map Navigation Control & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3">
        {/* Row 1: Search & Camera Quick-Fly Hub Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search State, Factory, or City (e.g. Arizona, Texas, Savannah)..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-20 py-2 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold rounded-lg transition-colors"
            >
              Jump
            </button>
          </form>

          {/* Quick-Fly Hub Camera Station */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Fly-To Hub:
            </span>
            <button
              onClick={handleResetBounds}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500 text-slate-300 hover:text-white font-medium text-xs transition-all"
            >
              🇺🇸 USA Overview
            </button>
            {mapData?.factories?.map((f: any) => (
              <button
                key={f.id}
                onClick={() => handleFlyTo(f.lat, f.lng, 6, f)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  selectedFactory === f.name
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {f.name.split(' ')[0]} ({f.state})
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Advanced Visualization Filters, Modes, and Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800 text-xs">
          {/* Basemap Style */}
          {/* Basemap Style */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-500" />
              Map View:
            </span>
            <button
              onClick={() => setBasemap('satellite')}
              className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all flex items-center gap-1 ${basemap === 'satellite' ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Real-World High-Resolution Satellite & Aerial Earth View"
            >
              <span>🛰️ Satellite</span>
            </button>
            <button
              onClick={() => setBasemap('google_streets')}
              className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all flex items-center gap-1 ${basemap === 'google_streets' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Google Maps-Style Real World Highway, Cities & Street Navigation"
            >
              <span>🗺️ Google Streets</span>
            </button>
            <button
              onClick={() => setBasemap('topo')}
              className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all flex items-center gap-1 ${basemap === 'topo' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Physical Mountain & Geographic Relief Terrain Map"
            >
              <span>🏔️ Terrain</span>
            </button>
            <button
              onClick={() => setBasemap('dark')}
              className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all flex items-center gap-1 ${basemap === 'dark' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Cyber Dark Night-Mode Telemetry Map"
            >
              <span>🌌 Cyber Dark</span>
            </button>
            <button
              onClick={() => setBasemap('osm')}
              className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all flex items-center gap-1 ${basemap === 'osm' ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Standard OpenStreetMap"
            >
              <span>🌐 OpenStreet</span>
            </button>
          </div>

          {/* Metric Mode */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" />
              Heat:
            </span>
            <button
              onClick={() => setMapMode('risk')}
              className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all ${mapMode === 'risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              SLA Risk
            </button>
            <button
              onClick={() => setMapMode('volume')}
              className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all ${mapMode === 'volume' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Volume
            </button>
            <button
              onClick={() => setMapMode('lead_time')}
              className={`px-2 py-0.5 rounded font-medium text-[11px] transition-all ${mapMode === 'lead_time' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Lead Time
            </button>
          </div>

          {/* Extraordinary Feature Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Curved Arcs Toggle */}
            <button
              onClick={() => setShowCurvedArcs(!showCurvedArcs)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                showCurvedArcs ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              {showCurvedArcs ? 'Curved Arcs: ON' : 'Straight Lines'}
            </button>

            {/* Perishable Confectionery Thermal Alert Toggle */}
            <button
              onClick={() => setShowThermalRisk(!showThermalRisk)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                showThermalRisk ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <ThermometerSun className="w-3 h-3 text-amber-400" />
              {showThermalRisk ? '🌡️ Melt Risk: ON' : '🌡️ Melt Risk: OFF'}
            </button>

            {/* Isochrones Radii Rings Toggle */}
            <button
              onClick={() => setShowIsochrones(!showIsochrones)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                showIsochrones ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3 text-emerald-400" />
              {showIsochrones ? '📡 SLA Rings: ON' : '📡 SLA Rings'}
            </button>

            {/* Corridor Tier Filter */}
            <select
              value={corridorTierFilter}
              onChange={(e) => setCorridorTierFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Corridors ({networkStats.totalRoutes})</option>
              <option value="BOTTLENECK">⚠️ Bottlenecks Only (&lt;50)</option>
              <option value="HIGH_PERF">✨ High Efficiency (&gt;75)</option>
              <option value="HIGH_VOLUME">📦 High Volume (&gt;100 Orders)</option>
            </select>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-white text-slate-400 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas and Interactive Overlays */}
      <div
        ref={mapWrapperRef}
        className="relative rounded-2xl border border-slate-800 overflow-hidden shadow-2xl h-[650px] bg-slate-950"
      >
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} className="z-0" />

        {/* Floating Top-Right Live Freight Simulator Controller */}
        <div className="absolute top-4 left-14 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Transit:
          </div>

          <button
            onClick={() => setIsSimPlaying(!isSimPlaying)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            title={isSimPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isSimPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>

          <div className="flex items-center gap-1 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${simSpeed === s ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-xs shadow-xl space-y-2 max-w-xs">
          <div className="font-bold text-slate-200 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              RouteNexa Logistics Radar
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-md bg-sky-600 border border-white"></div>
            <span className="text-slate-300 text-[11px] font-medium">5 Confectionery Plants (Radar Hubs)</span>
          </div>

          {showCorridors && (
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-emerald-400"></div>
                <span className="text-slate-400 text-[10px]">Optimal Corridor (Score &ge; 80)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-sky-400"></div>
                <span className="text-slate-400 text-[10px]">Standard Corridor (Score 50–79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-rose-500"></div>
                <span className="text-slate-400 text-[10px]">⚠️ Bottleneck Corridor (Score &lt; 50)</span>
              </div>
            </div>
          )}

          {showIsochrones && (
            <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-emerald-400"></div>
                <span className="text-slate-400">24-Hour Express SLA (350 mi)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-sky-400"></div>
                <span className="text-slate-400">48-Hour Standard SLA (800 mi)</span>
              </div>
            </div>
          )}

          {showThermalRisk && (
            <div className="pt-1 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1.5">
              <ThermometerSun className="w-3 h-3 text-amber-400" />
              <span>Confectionery Melt Risk Active (&gt;78°F)</span>
            </div>
          )}
        </div>

        {/* 1. CORRIDOR TELEMETRY CARD (WHEN A CORRIDOR ARC IS CLICKED) */}
        {selectedCorridor && (
          <div className="absolute top-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-sky-500/40 rounded-2xl p-5 w-88 sm:w-96 shadow-2xl animate-in slide-in-from-right duration-200 max-h-[580px] overflow-y-auto">
            <button
              onClick={() => setSelectedCorridor(null)}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold">
                <RouteIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Corridor Telemetry</span>
                <h3 className="font-extrabold text-sm text-white leading-tight">
                  {selectedCorridor.factory_name} &rarr; {selectedCorridor.destination_state}
                </h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Corridor Health Status Banner */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                selectedCorridor.efficiency_score < 50
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2">
                  {selectedCorridor.efficiency_score < 50 ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="font-bold">{selectedCorridor.performance_tier}</span>
                </div>
                <div className="font-mono font-extrabold text-sm">
                  {selectedCorridor.efficiency_score}/100
                </div>
              </div>

              {/* Corridor Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Corridor Distance</span>
                  <div className="font-extrabold text-slate-200 mt-0.5">{selectedCorridor.distance_miles?.toLocaleString()} miles</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Historical Shipments</span>
                  <div className="font-extrabold text-slate-200 mt-0.5">{selectedCorridor.shipments_count?.toLocaleString()} consignments</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Mean Lead Time</span>
                  <div className="font-extrabold text-sky-400 mt-0.5">{selectedCorridor.avg_lead_time} days</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Bottleneck Flag</span>
                  <div className={`font-extrabold mt-0.5 ${selectedCorridor.is_bottleneck ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedCorridor.is_bottleneck ? 'CRITICAL BOTTLENECK' : 'NORMAL FLOW'}
                  </div>
                </div>
              </div>

              {/* AI Dispatch Recommendation */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-sky-950/50 to-indigo-950/50 border border-sky-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  RouteNexa AI Dispatch Advisory
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedCorridor.efficiency_score < 50
                    ? 'Transit variance exceeds acceptable threshold. Recommend enforcing morning dispatch (07:00-09:00) and utilizing dedicated regional cross-dock consolidation.'
                    : 'Corridor operating within nominal efficiency parameters. Standard carrier routing compliant with customer SLA bounds.'}
                </p>
                {selectedCorridor.distance_miles > 1200 && (
                  <div className="text-[10px] text-amber-300 flex items-center gap-1 pt-1 border-t border-sky-800/40">
                    <ThermometerSun className="w-3 h-3 text-amber-400" />
                    Long-haul transit (&gt;1,200 mi). Ensure trailer pre-cooling protocol is logged.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. STATE DETAIL FLYOUT DRAWER */}
        {selectedState && (
          <div className="absolute top-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-5 w-84 sm:w-88 shadow-2xl animate-in slide-in-from-right duration-200 max-h-[580px] overflow-y-auto">
            <button
              onClick={() => { setSelectedState(null); setStateAnalytics(null); }}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs">
                {stateAnalytics?.code || selectedState.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{selectedState}</h3>
                <span className="text-[10px] text-slate-400">{stateAnalytics?.region || 'United States'} Shipping Destination</span>
              </div>
            </div>

            {loadingState ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                Loading state analytics telemetry...
              </div>
            ) : stateAnalytics ? (
              <div className="space-y-3.5 text-xs">
                {/* Thermal Warning in State Drawer if applicable */}
                {THERMAL_RISK_STATES[selectedState] && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />
                      Thermal Advisory: {THERMAL_RISK_STATES[selectedState].temp}°F
                    </div>
                    <div className="text-slate-300 leading-tight">
                      {THERMAL_RISK_STATES[selectedState].advisory}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Total Volume</span>
                    <div className="font-extrabold text-slate-200 mt-0.5">{stateAnalytics.total_shipments?.toLocaleString()} orders</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Delay Rate</span>
                    <div className={`font-extrabold mt-0.5 ${stateAnalytics.delay_rate_pct > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {stateAnalytics.delay_rate_pct}%
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Operational Lead Time:</span>
                    <span className="font-extrabold text-sky-400">{stateAnalytics.avg_operational_lead_time} days</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Total Revenue:</span>
                    <span className="font-extrabold text-emerald-400">${stateAnalytics.total_sales?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Dominant Ship Mode:</span>
                    <span className="font-bold text-slate-200">{stateAnalytics.most_used_ship_mode || 'Standard Class'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Highest Demand Products
                  </div>
                  <div className="space-y-1.5">
                    {stateAnalytics.top_products?.slice(0, 3).map((tp: any) => (
                      <div key={tp.product} className="flex items-center justify-between text-[11px] bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850">
                        <span className="text-slate-300 truncate max-w-[180px]">{tp.product}</span>
                        <span className="text-sky-400 font-mono font-bold">{tp.orders} ord</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 3. FACTORY DETAIL FLYOUT DRAWER */}
        {selectedFactory && factoryAnalytics && (
          <div className="absolute top-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-5 w-88 sm:w-92 shadow-2xl animate-in slide-in-from-right duration-200 max-h-[580px] overflow-y-auto">
            <button
              onClick={() => { setSelectedFactory(null); setFactoryAnalytics(null); }}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-lg shadow-sky-500/30">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{factoryAnalytics.name}</h3>
                <span className="text-[10px] text-sky-400 font-semibold">{factoryAnalytics.city}, {factoryAnalytics.state} ({factoryAnalytics.id})</span>
              </div>
            </div>

            <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 px-3 py-1.5 rounded-xl text-xs font-semibold mb-3">
              {factoryAnalytics.specialization}
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Volume</span>
                  <div className="font-extrabold text-slate-200 mt-0.5">{factoryAnalytics.total_shipments?.toLocaleString()} orders</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Units</span>
                  <div className="font-extrabold text-slate-200 mt-0.5">{factoryAnalytics.total_units?.toLocaleString()} units</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Mean Lead Time</span>
                  <div className="font-extrabold text-sky-400 mt-0.5">{factoryAnalytics.avg_operational_lead_time} days</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Delay Rate</span>
                  <div className={`font-extrabold mt-0.5 ${factoryAnalytics.delay_rate_pct > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {factoryAnalytics.delay_rate_pct}%
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total Gross Revenue:</span>
                  <span className="font-extrabold text-emerald-400">${factoryAnalytics.total_sales?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Gross Realized Profit:</span>
                  <span className="font-extrabold text-emerald-300">${factoryAnalytics.total_profit?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Active Outbound Lanes:</span>
                  <span className="font-extrabold text-sky-300">{factoryAnalytics.active_routes_count || 'N/A'} states</span>
                </div>
              </div>

              {factoryAnalytics.products && factoryAnalytics.products.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Manufactured Product Lines
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {factoryAnalytics.products.map((p: string) => (
                      <span key={p} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-[10px] text-sky-400 flex items-center gap-1.5 border-t border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Outbound corridors from {factoryAnalytics.name} highlighted with cyan glow.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
