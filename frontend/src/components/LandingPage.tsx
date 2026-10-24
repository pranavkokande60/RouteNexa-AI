import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Truck,
  Shield,
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu,
  AlertTriangle,
  Factory,
  Layers,
  Sparkles,
  Bot,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Database,
  BarChart3,
  MapPin,
  Lock,
  Zap,
  Globe2,
  Radio,
  Clock,
  ThermometerSun,
  ShieldAlert,
  Compass,
  FileText,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  X
} from 'lucide-react';
import { GlobeFallback } from './GlobeFallback';
import {
  FACTORY_NODES,
  DESTINATION_HUBS,
  LOGISTICS_CORRIDORS,
  ACTIVE_TRUCKS,
  SelectedEntity,
  RiskLevel
} from '../data/logisticsData';

// Lazy load 3D Globe for fast initial bundle delivery and responsive FPS
const Globe3D = lazy(() => import('./Globe3D'));

interface LandingPageProps {
  onOpenLogin: () => void;
  onEnterDashboard?: () => void;
  isAuthenticated?: boolean;
  currentUser?: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onEnterDashboard,
  isAuthenticated = false,
  currentUser
}) => {
  const [selectedFactory, setSelectedFactory] = useState<string | null>("Sugar Shack");
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [shipModeFilter, setShipModeFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showTrucks, setShowTrucks] = useState<boolean>(true);
  const [showFactories, setShowFactories] = useState<boolean>(true);
  const [showDestinations, setShowDestinations] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [twinViewMode, setTwinViewMode] = useState<'factories' | 'corridors' | 'shipments'>('factories');
  const [intelligenceTab, setIntelligenceTab] = useState<'models' | 'regional' | 'anomalies' | 'forecast'>('models');
  const [resetKey, setResetKey] = useState<number>(0);

  // Initialize inspection panel with Sugar Shack (matches reference design)
  useEffect(() => {
    const fac = FACTORY_NODES.find(f => f.name === "Sugar Shack");
    if (fac) {
      setSelectedEntity({
        type: 'factory',
        id: fac.id,
        name: fac.name,
        title: `${fac.name} (Factory)`,
        subtitle: `${fac.city}, ${fac.state} (${fac.stateCode}) • Industrial Production Hub`,
        badge: `${fac.specialization}`,
        badgeClass: 'text-emerald-300 bg-emerald-950/70 border-emerald-800/50',
        origin: `${fac.city}, ${fac.state}`,
        products: ['Laffy Taffy', 'SweeTARTS', 'Nerds', 'Fun Dip', 'Fizzy Lifting Drinks'],
        shipmentCount: `${fac.dispatches.toLocaleString()} Orders Audited`,
        leadTime: '3.6 days',
        efficiency: '85.2%',
        predictedEta: '3.6 days Avg Transit',
        delayRisk: '18.4% (Winter Freezing Monitored)',
        riskLevel: 'LOW',
        status: `Active Facility • ${fac.capacity}`
      });
    }
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrimaryCTA = () => {
    if (isAuthenticated && onEnterDashboard) {
      onEnterDashboard();
    } else {
      onOpenLogin();
    }
  };

  // Factory Directory with Empirical Nassau Candy Attributes
  const FACTORIES = [
    {
      id: "FAC-WCK-02",
      name: "Wicked Choccy's",
      location: "Savannah, Georgia",
      lat: 32.076,
      lon: -81.088,
      leadTime: "4.1 days",
      dailyCapacity: "75,000 units/day",
      specialty: "Premium Milk & Caramel Chocolate",
      efficiency: "92.4%",
      accentHex: "#f59e0b",
      badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      topRoute: "Savannah → California (2,184 mi)",
      thermalRisk: "Moderate (91°F Summer Ambient)"
    },
    {
      id: "FAC-LON-01",
      name: "Lot's O' Nuts",
      location: "Casa Grande, Arizona",
      lat: 32.882,
      lon: -111.768,
      leadTime: "3.9 days",
      dailyCapacity: "50,000 units/day",
      specialty: "Nut & Marshmallow Chocolate Bars",
      efficiency: "94.8%",
      accentHex: "#00f0ff",
      badgeClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      topRoute: "Casa Grande → Texas (842 mi)",
      thermalRisk: "Critical (104°F Summer Heat - Mandatory Reefer)"
    },
    {
      id: "FAC-OTH-05",
      name: "The Other Factory",
      location: "Memphis, Tennessee",
      lat: 35.118,
      lon: -89.971,
      leadTime: "4.3 days",
      dailyCapacity: "40,000 units/day",
      specialty: "Chewy Candies & Specialty Toffee",
      efficiency: "88.6%",
      accentHex: "#a855f7",
      badgeClass: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      topRoute: "Memphis → New York (956 mi)",
      thermalRisk: "Moderate (88°F Summer Ambient)"
    },
    {
      id: "FAC-SSK-03",
      name: "Sugar Shack",
      location: "Thief River Falls, Minnesota",
      lat: 48.119,
      lon: -96.181,
      leadTime: "3.6 days",
      dailyCapacity: "35,000 units/day",
      specialty: "Sugar Candies & Specialty Beverages",
      efficiency: "85.2%",
      accentHex: "#10b981",
      badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      topRoute: "Thief River Falls → Illinois (580 mi)",
      thermalRisk: "Low (Sub-Zero Winter Freezing Risk)"
    },
    {
      id: "FAC-SEC-04",
      name: "Secret Factory",
      location: "Rock Island, Illinois",
      lat: 41.446,
      lon: -90.565,
      leadTime: "4.4 days",
      dailyCapacity: "25,000 units/day",
      specialty: "Experimental Confections & Novelties",
      efficiency: "87.1%",
      accentHex: "#f43f5e",
      badgeClass: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      topRoute: "Rock Island → Florida (1,040 mi)",
      thermalRisk: "Low (Standard Climate-Controlled)"
    },
  ];

  // Active Selected Factory object
  const currentFactoryObj = FACTORIES.find(f => f.name === selectedFactory) || FACTORIES[0];

  // Key Verified Logistics Corridors
  const CORRIDORS = [
    { id: "SAV-LAX", origin: "Wicked Choccy's", dest: "Los Angeles Terminal", state: "California", mode: "Second Class", dist: 2184, leadTime: 4.6, delayRisk: "14.2%", efficiency: 91.2, tier: "High Volume" },
    { id: "CG-DFW", origin: "Lot's O' Nuts", dest: "Dallas Cross-Dock", state: "Texas", mode: "Same Day", dist: 842, leadTime: 0.8, delayRisk: "4.1%", efficiency: 96.5, tier: "Optimal" },
    { id: "MEM-NYC", origin: "The Other Factory", dest: "Metro New York DC", state: "New York", mode: "First Class", dist: 956, leadTime: 2.7, delayRisk: "9.5%", efficiency: 89.4, tier: "Standard" },
    { id: "TRF-CHI", origin: "Sugar Shack", dest: "Chicago Central Depot", state: "Illinois", mode: "Standard Class", dist: 580, leadTime: 5.1, delayRisk: "18.4%", efficiency: 82.0, tier: "Bottleneck" },
    { id: "RI-MIA", origin: "Secret Factory", dest: "Miami Gateway", state: "Florida", mode: "Second Class", dist: 1240, leadTime: 4.2, delayRisk: "12.0%", efficiency: 88.0, tier: "Standard" },
    { id: "SAV-SEA", origin: "Wicked Choccy's", dest: "Seattle Regional Hub", state: "Washington", mode: "Standard Class", dist: 2590, leadTime: 5.8, delayRisk: "21.6%", efficiency: 79.5, tier: "Bottleneck" },
  ];

  // Simulated Live Dispatches (Demonstration Feed)
  const LIVE_DISPATCHES = [
    { trackingId: "NC-89412", sku: "Wonka Bar - Milk Chocolate", origin: "Savannah, GA", destination: "Los Angeles, CA", eta: "1.2 days remaining", status: "IN_TRANSIT", temp: "58°F (Reefer OK)", progress: 72 },
    { trackingId: "NC-89413", sku: "Laffy Taffy - Strawberry", origin: "Thief River Falls, MN", destination: "Chicago, IL", eta: "0.4 days remaining", status: "OUT_FOR_DELIVERY", temp: "62°F (Optimal)", progress: 91 },
    { trackingId: "NC-89414", sku: "Wonka Bar - Nutty Crunch", origin: "Casa Grande, AZ", destination: "Dallas, TX", eta: "Delivered on-time", status: "DELIVERED", temp: "60°F (Verified)", progress: 100 },
    { trackingId: "NC-89415", sku: "Kazookles Chewy Toffee", origin: "Memphis, TN", destination: "Atlanta, GA", eta: "0.8 days remaining", status: "IN_TRANSIT", temp: "64°F (Optimal)", progress: 54 },
  ];

  // Filter corridors based on selected factory and ship mode
  const filteredCorridors = CORRIDORS.filter(c => {
    const matchFactory = !selectedFactory || c.origin === selectedFactory;
    const matchMode = shipModeFilter === 'ALL' || c.mode === shipModeFilter;
    return matchFactory && matchMode;
  });

  const handleSelectFactory = (factoryName: string | null) => {
    setSelectedFactory(factoryName);
    setSelectedDestination(null);
    setSelectedTruck(null);
    setSelectedRoute(null);

    if (!factoryName) {
      setSelectedEntity(null);
      return;
    }

    const fac = FACTORY_NODES.find(f => f.name === factoryName);
    if (fac) {
      setSelectedEntity({
        type: 'factory',
        id: fac.id,
        name: fac.name,
        title: fac.name,
        subtitle: `${fac.city}, ${fac.state} (${fac.stateCode}) • Industrial Production Hub`,
        badge: `${fac.specialization}`,
        badgeClass: 'text-cyan-300 bg-cyan-950/70 border-cyan-800/50',
        origin: `${fac.city}, ${fac.state}`,
        products: fac.products,
        shipmentCount: `${fac.dispatches.toLocaleString()} Orders`,
        leadTime: fac.leadTime,
        efficiency: fac.efficiency,
        predictedEta: `${fac.leadTime} Avg Transit`,
        delayRisk: fac.name === "Sugar Shack" ? "18.4% (Winter Freeze Alert)" : (fac.name === "Lot's O' Nuts" ? "4.1% (Optimal Same-Day)" : "14.2% (Reefer Monitored)"),
        riskLevel: fac.name === "Sugar Shack" ? 'HIGH' : (fac.name === "Lot's O' Nuts" ? 'LOW' : 'ELEVATED'),
        status: `Active Facility • ${fac.capacity}`
      });
    }
  };

  const handleSelectDestination = (destName: string | null) => {
    setSelectedDestination(destName);
    setSelectedTruck(null);
    setSelectedRoute(null);

    if (!destName) {
      setSelectedEntity(null);
      return;
    }

    const dest = DESTINATION_HUBS.find(d => d.name === destName);
    if (dest) {
      const delayRateNum = parseFloat(dest.delayRate);
      const risk: RiskLevel = delayRateNum > 15 ? 'HIGH' : (delayRateNum > 10 ? 'ELEVATED' : 'LOW');
      setSelectedEntity({
        type: 'destination',
        id: dest.id,
        name: dest.name,
        title: dest.name,
        subtitle: `${dest.city} • ${dest.region} Region Gateway`,
        badge: 'DESTINATION TERMINAL',
        badgeClass: risk === 'HIGH' ? 'text-rose-400 bg-rose-950/70 border-rose-800/50' : (risk === 'ELEVATED' ? 'text-amber-300 bg-amber-950/70 border-amber-800/50' : 'text-sky-300 bg-sky-950/70 border-sky-800/50'),
        destination: dest.city,
        shipmentCount: `${dest.dispatches.toLocaleString()} Inbound Receipts`,
        leadTime: dest.avgLeadTime,
        predictedEta: `${dest.avgLeadTime} Terminal Lead Time`,
        delayRisk: `${dest.delayRate} Historic Delay`,
        riskLevel: risk,
        status: 'Active Freight Terminal'
      });
    }
  };

  const handleSelectTruck = (truckId: string | null) => {
    setSelectedTruck(truckId);
    if (!truckId) {
      setSelectedEntity(null);
      return;
    }

    const truck = ACTIVE_TRUCKS.find(t => t.id === truckId);
    if (truck) {
      setSelectedFactory(truck.factoryName);
      setSelectedDestination(truck.destName);
      setSelectedRoute(truck.corridorId);
      setSelectedEntity({
        type: 'truck',
        id: truck.id,
        name: `${truck.fleetName} (${truck.trackingId})`,
        title: `${truck.fleetName} — ${truck.trackingId}`,
        subtitle: `${truck.factoryName} → ${truck.destName}`,
        badge: `3D FREIGHT TRUCK • ${truck.mode}`,
        badgeClass: truck.riskLevel === 'HIGH' ? 'text-rose-400 bg-rose-950/70 border-rose-800/50' : (truck.riskLevel === 'ELEVATED' ? 'text-amber-300 bg-amber-950/70 border-amber-800/50' : 'text-cyan-300 bg-cyan-950/70 border-cyan-800/50'),
        origin: truck.factoryName,
        destination: truck.destName,
        shipMode: truck.mode,
        distance: truck.distance,
        products: [truck.sku],
        predictedEta: truck.predictedEta,
        delayRisk: truck.delayRisk,
        riskLevel: truck.riskLevel,
        status: truck.status,
        cargoTemp: truck.temp
      });
    }
  };

  const handleSelectRoute = (routeId: string | null) => {
    setSelectedRoute(routeId);
    if (!routeId) {
      setSelectedEntity(null);
      return;
    }

    const corridor = LOGISTICS_CORRIDORS.find(c => c.id === routeId);
    if (corridor) {
      const fac = FACTORY_NODES.find(f => f.id === corridor.factoryId);
      const dest = DESTINATION_HUBS.find(d => d.id === corridor.destId);
      setSelectedFactory(fac?.name || null);
      setSelectedDestination(dest?.name || null);

      setSelectedEntity({
        type: 'route',
        id: corridor.id,
        name: `${corridor.id} Freight Corridor`,
        title: `${fac?.name} → ${dest?.name}`,
        subtitle: `${corridor.distance.toLocaleString()} miles • ${corridor.mode}`,
        badge: `CORRIDOR ${corridor.id} • ${corridor.risk} RISK`,
        badgeClass: corridor.risk === 'HIGH' ? 'text-rose-400 bg-rose-950/70 border-rose-800/50' : (corridor.risk === 'ELEVATED' ? 'text-amber-300 bg-amber-950/70 border-amber-800/50' : 'text-cyan-300 bg-cyan-950/70 border-cyan-800/50'),
        origin: `${fac?.city}, ${fac?.state}`,
        destination: dest?.city,
        shipMode: corridor.mode,
        distance: corridor.distance,
        efficiency: corridor.efficiency,
        predictedEta: corridor.predictedEta,
        delayRisk: corridor.delayRisk,
        riskLevel: corridor.risk,
        status: `Active Route Arc • Speed ${corridor.speed}x`
      });
    }
  };

  const handleResetAll = () => {
    setSelectedFactory(null);
    setSelectedDestination(null);
    setSelectedTruck(null);
    setSelectedRoute(null);
    setSelectedEntity(null);
    setRiskFilter('ALL');
    setShipModeFilter('ALL');
    setShowRoutes(true);
    setShowTrucks(true);
    setShowFactories(true);
    setShowDestinations(true);
    setIsPaused(false);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      {/* 1. STICKY GLASSMORPHIC HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-6 lg:px-12 h-16 md:h-20 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">RouteNexa<span className="text-cyan-400"> AI</span></span>
              <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Logistics Intelligence OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Empirical Supply Chain Analytics • Nassau Candy</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <button
            onClick={() => scrollToSection('hero')}
            className="hover:text-cyan-400 transition-colors"
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection('digital-twin')}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <span>Digital Twin</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>
          <button
            onClick={() => scrollToSection('intelligence')}
            className="hover:text-cyan-400 transition-colors"
          >
            Predictive AI
          </button>
          <button
            onClick={() => scrollToSection('architecture')}
            className="hover:text-cyan-400 transition-colors"
          >
            Architecture
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>10,194 Audited Records</span>
          </div>

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-extrabold text-xs px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In / Launch App</span>
          </button>
        </div>
      </header>

      {/* 2. SECTION A: CINEMATIC 3D HERO DIGITAL TWIN COMMAND CENTER (Matches Reference Image) */}
      <section
        id="hero"
        className="relative w-full min-h-[880px] lg:h-[920px] xl:h-[960px] overflow-hidden bg-slate-950 flex flex-col justify-between"
      >
        {/* Layer 1: Seamless 3D Earth Digital Twin Background Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <Suspense
            fallback={
              <GlobeFallback
                selectedFactory={selectedFactory}
                onSelectFactory={(f) => handleSelectFactory(f)}
                selectedDestination={selectedDestination}
                onSelectDestination={handleSelectDestination}
                shipModeFilter={shipModeFilter}
              />
            }
          >
            <Globe3D
              selectedFactory={selectedFactory}
              onSelectFactory={handleSelectFactory}
              selectedDestination={selectedDestination}
              onSelectDestination={handleSelectDestination}
              selectedTruck={selectedTruck}
              onSelectTruck={handleSelectTruck}
              selectedRoute={selectedRoute}
              onSelectRoute={handleSelectRoute}
              shipModeFilter={shipModeFilter}
              riskFilter={riskFilter}
              showRoutes={showRoutes}
              showTrucks={showTrucks}
              showFactories={showFactories}
              showDestinations={showDestinations}
              isPaused={isPaused}
              resetKey={resetKey}
            />
          </Suspense>
        </div>

        {/* Layer 2: Main Foreground UI Layer (pointer-events-none so mouse drags pass to 3D canvas) */}
        <div className="relative z-10 w-full h-full max-w-[1720px] mx-auto px-6 lg:px-12 pt-8 pb-4 flex flex-col justify-between pointer-events-none flex-1">
          {/* Top Row: Left Column Copy + Top Floating HUD Cards */}
          <div className="w-full flex items-start justify-between relative">
            {/* Left Column: Brand, Headline, Subtitle, Buttons, Proof Counters */}
            <div className="w-full lg:max-w-[430px] xl:max-w-[470px] space-y-6 text-left py-2 pointer-events-auto z-10">
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-cyan-500/40 rounded-full px-3.5 py-1.5 shadow-lg shadow-cyan-500/5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase font-mono">
                  RouteNexa AI • Enterprise 3D Logistics Intelligence
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Intelligence That<br />
                Moves{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
                  Logistics
                </span><br />
                <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
                  Forward.
                </span>
              </h1>

              {/* Narrative Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
                Turn shipment data into predictive insights, smarter routes, and measurable logistics intelligence across 196 factory-to-customer freight corridors.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={handlePrimaryCTA}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-500 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-xl shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => scrollToSection('digital-twin')}
                  className="flex items-center gap-2 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 font-bold text-sm px-5 py-3.5 rounded-xl transition-all shadow-lg"
                >
                  <span>Explore the Intelligence</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

              {/* Empirical Proof Metrics */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-black text-white font-mono">10,194</div>
                  <div className="text-xs text-slate-400 mt-0.5">Audited Shipments</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">94.2%</div>
                  <div className="text-xs text-slate-400 mt-0.5">ML ETA Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    5 <span className="text-purple-400">Hubs</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Connected Factories</div>
                </div>
              </div>
            </div>

            {/* Floating HUD Card 1: Shipment Activity (Top-Left of Globe) */}
            <div className="hidden lg:block absolute top-2 left-[36%] xl:left-[34%] pointer-events-auto z-20">
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl p-3.5 backdrop-blur-xl shadow-2xl text-left min-w-[220px] hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between text-cyan-400 text-[10px] font-mono font-bold uppercase mb-1">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                    Shipment Activity
                  </span>
                  <svg className="w-7 h-3.5 text-cyan-400 stroke-current fill-none" viewBox="0 0 28 14">
                    <path d="M1 11 L7 8 L14 10 L21 3 L27 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-xl font-black text-white font-mono tracking-tight">10,194 Dispatches</div>
                <div className="text-[10px] text-slate-400 mt-0.5">48 orders/hr fleet dispatch rate</div>
                <div className="mt-2 text-[8px] text-cyan-300 font-mono bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-800/50 inline-block font-semibold">
                  HISTORICAL OBSERVATION
                </div>
              </div>
            </div>

            {/* Floating HUD Card 2: Predicted Delivery ETA (Top-Right of Globe) */}
            <div className="hidden lg:block absolute top-2 right-4 xl:right-8 pointer-events-auto z-20">
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl p-3.5 backdrop-blur-xl shadow-2xl text-left min-w-[220px] hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between text-sky-400 text-[10px] font-mono font-bold uppercase mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    Predicted Delivery (ETA)
                  </span>
                  <svg className="w-7 h-3.5 text-sky-400 stroke-current fill-none" viewBox="0 0 28 14">
                    <path d="M1 12 L7 9 L14 11 L21 5 L27 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-xl font-black text-white font-mono tracking-tight">4.12 Days (GBM)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">95% CI: ±0.35d • 94.2% R²</div>
                <div className="mt-2 text-[8px] text-sky-300 font-mono bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-800/50 inline-block font-semibold">
                  ML PREDICTION ENGINE
                </div>
              </div>
            </div>

            {/* Floating Contextual Inspection Panel (Right side over Atlantic Ocean) */}
            {selectedEntity && (
              <div className="hidden lg:block absolute top-32 right-4 xl:right-8 w-72 pointer-events-auto z-20">
                <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-left space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                        <Factory className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight leading-tight">
                          {selectedEntity.name} (Factory)
                        </h4>
                        <div className="text-[9px] font-mono text-slate-400">
                          {currentFactoryObj.lat.toFixed(6)}, {currentFactoryObj.lon.toFixed(6)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEntity(null)}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                      title="Dismiss Panel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Products */}
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">Products</div>
                    <div className="flex flex-wrap gap-1">
                      {(currentFactoryObj.name === 'Sugar Shack'
                        ? ['Laffy Taffy', 'SweeTARTS', 'Nerds', 'Fun Dip', 'Fizzy Lifting Drinks']
                        : selectedEntity.products || ['Wonka Bars', 'Artisan Chocolate', 'Sugar-Free Truffles']
                      ).map((product, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Volume and Lead Time */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">Dispatch Volume</div>
                      <div className="text-sm font-bold text-cyan-300 font-mono flex items-center gap-1">
                        <span>1,248 / day</span>
                        <span className="text-[9px] text-emerald-400 font-bold">↑ 12%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">Avg. Lead Time</div>
                      <div className="text-sm font-bold text-white font-mono">{currentFactoryObj.leadTime}</div>
                    </div>
                  </div>

                  {/* Connected Destinations */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">Connected Destinations</div>
                      <div className="text-xs font-bold text-white">12 cities</div>
                    </div>
                    <button
                      onClick={() => scrollToSection('intelligence')}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      <span>View Routes</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Recent Shipments */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono">Recent Shipments</div>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>NX-7842</span>
                        </span>
                        <span className="text-cyan-400">In Transit</span>
                        <span className="text-slate-400">ETA 2.3d</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>NX-7710</span>
                        </span>
                        <span className="text-emerald-400">On Time</span>
                        <span className="text-slate-400">ETA 4.1d</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>NX-7608</span>
                        </span>
                        <span className="text-rose-400">Delayed</span>
                        <span className="text-slate-400">ETA 6.7d</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lower Floating HUD Cards: Route Efficiency (Bottom-Left) & SLA Delay (Bottom-Right) */}
          <div className="w-full relative pointer-events-none mt-auto pb-14">
            {/* Card 3: Route Efficiency (Bottom-Left of Globe) */}
            <div className="hidden lg:block absolute bottom-0 left-[26%] xl:left-[24%] pointer-events-auto z-20">
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl p-3.5 backdrop-blur-xl shadow-2xl text-left min-w-[220px] hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-mono font-bold uppercase mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Route Efficiency</span>
                </div>
                <div className="text-xl font-black text-cyan-300 font-mono tracking-tight">87.4% Efficiency Score</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Top: Casa Grande → TX (94.8%)</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[8px] text-cyan-300 font-mono bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-800/50 inline-block font-semibold">
                    CORRIDOR BENCHMARK
                  </span>
                  <div className="flex items-end gap-1 h-3.5">
                    <span className="w-1 bg-cyan-500/50 rounded-sm h-1.5" />
                    <span className="w-1 bg-cyan-500/80 rounded-sm h-2.5" />
                    <span className="w-1 bg-cyan-400 rounded-sm h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: SLA Delay & Thermal Risk (Bottom-Right of Globe) */}
            <div className="hidden lg:block absolute bottom-0 right-4 xl:right-8 pointer-events-auto z-20">
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl p-3.5 backdrop-blur-xl shadow-2xl text-left min-w-[220px] hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono font-bold uppercase mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>SLA Delay & Thermal Risk</span>
                </div>
                <div className="text-xl font-black text-amber-300 font-mono tracking-tight">11.8% Network Delay</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Reefer mandate: AZ/TX ambient &gt;78°F</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[8px] text-amber-300 font-mono bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-800/50 inline-block font-semibold">
                    COLD-CHAIN SENTRY
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-400 opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Bottom Digital-Twin Command Toolbar */}
          <div className="w-full flex justify-center pointer-events-auto z-30 pb-2">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-xl flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              {/* Toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowRoutes(!showRoutes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    showRoutes
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800/70 text-slate-400 border border-transparent hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Routes</span>
                </button>

                <button
                  onClick={() => setShowTrucks(!showTrucks)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    showTrucks
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/60 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800/70 text-slate-400 border border-transparent hover:text-white'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Trucks</span>
                </button>

                <button
                  onClick={() => setShowFactories(!showFactories)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    showFactories
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/60 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-800/70 text-slate-400 border border-transparent hover:text-white'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5" />
                  <span>Factories</span>
                </button>

                <button
                  onClick={() => setShowDestinations(!showDestinations)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    showDestinations
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800/70 text-slate-400 border border-transparent hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Destinations</span>
                </button>

                {/* Ship Mode Dropdown */}
                <select
                  value={shipModeFilter}
                  onChange={(e) => setShipModeFilter(e.target.value)}
                  className="bg-slate-800/90 text-slate-300 text-xs font-mono rounded-xl px-2.5 py-1.5 border border-slate-700 focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Ship Mode</option>
                  <option value="Same Day">Same Day</option>
                  <option value="First Class">First Class</option>
                  <option value="Second Class">Second Class</option>
                  <option value="Standard Class">Standard Class</option>
                </select>

                {/* Risk Filter Dropdown */}
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-slate-800/90 text-slate-300 text-xs font-mono rounded-xl px-2.5 py-1.5 border border-slate-700 focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Risk</option>
                  <option value="LOW">Low (&lt;10%)</option>
                  <option value="ELEVATED">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
                </select>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-slate-700/80" />

              {/* Legend matching reference image */}
              <div className="hidden md:flex items-center gap-3.5 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Low Risk</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Medium Risk</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>High Risk</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Factory</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>Destination</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Truck</span>
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-slate-700/80" />

              {/* Controls on right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`p-2 rounded-xl text-xs font-mono transition-all border ${
                    isPaused
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800/80 text-cyan-400 border-slate-700 hover:text-white'
                  }`}
                  title={isPaused ? "Resume Animation" : "Pause Animation"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-cyan-400" />}
                </button>

                <button
                  onClick={() => setResetKey(k => k + 1)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
                  title="Recenter Globe"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-all border border-slate-700"
                  title="Reset Camera & Telemetry View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION B: INTERACTIVE DIGITAL TWIN (FACTORY-TO-CUSTOMER LOGISTICS SCENE) */}
      <section id="digital-twin" className="relative z-10 py-20 px-6 lg:px-12 border-t border-slate-800/90 bg-slate-950/80">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Interactive Digital Twin Scene</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Factory-to-Customer Network Twin
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1">
                Select manufacturing facilities, highlight connected corridors, inspect route telemetry, and filter dispatches by shipping mode.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 text-xs font-medium self-start md:self-auto">
              <button
                onClick={() => setTwinViewMode('factories')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  twinViewMode === 'factories'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Factory className="w-3.5 h-3.5" />
                <span>Factories View</span>
              </button>
              <button
                onClick={() => setTwinViewMode('corridors')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  twinViewMode === 'corridors'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Corridors View</span>
              </button>
              <button
                onClick={() => setTwinViewMode('shipments')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  twinViewMode === 'shipments'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Feed View</span>
              </button>
            </div>
          </div>

          {/* Ship Mode Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Ship Mode Filter:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'ALL', label: 'All Modes (10,194)' },
                { key: 'Same Day', label: 'Same Day (0.38d avg)' },
                { key: 'First Class', label: 'First Class (2.55d)' },
                { key: 'Second Class', label: 'Second Class (3.57d)' },
                { key: 'Standard Class', label: 'Standard Class (5.32d)' },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => setShipModeFilter(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    shipModeFilter === m.key
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Digital Twin Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Dynamic View (Factory Cards or Corridor Table or Live Feed) */}
            <div className="lg:col-span-7 space-y-4">
              {twinViewMode === 'factories' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                  {FACTORIES.map(fac => {
                    const isSelected = selectedFactory === fac.name;
                    return (
                      <div
                        key={fac.id}
                        onClick={() => handleSelectFactory(isSelected ? null : fac.name)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-400/50'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fac.badgeClass}`}>
                            {fac.efficiency} Efficiency
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: fac.accentHex }}
                          />
                        </div>
                        <h4 className="font-bold text-sm text-white">{fac.name}</h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">{fac.location}</div>
                        <div className="text-[10px] text-slate-300 mt-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">Specialization</span>
                          <span className="font-medium text-slate-200">{fac.specialty}</span>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500">Lead: {fac.leadTime}</span>
                          <span className="text-cyan-300 font-bold">{fac.dailyCapacity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {twinViewMode === 'corridors' && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left overflow-x-auto">
                  <div className="text-xs font-bold text-white mb-3 flex items-center justify-between">
                    <span>Active Freight Corridors ({filteredCorridors.length} lanes)</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Real Operational Distance</span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800 text-[11px]">
                        <th className="pb-2 text-left font-semibold">Lane</th>
                        <th className="pb-2 text-left font-semibold">Ship Mode</th>
                        <th className="pb-2 text-right font-semibold">Distance</th>
                        <th className="pb-2 text-right font-semibold">Avg Lead</th>
                        <th className="pb-2 text-right font-semibold">Delay</th>
                        <th className="pb-2 text-right font-semibold">Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {filteredCorridors.map(c => (
                        <tr
                          key={c.id}
                          onClick={() => {
                            handleSelectRoute(selectedRoute === c.id ? null : c.id);
                          }}
                          className={`cursor-pointer transition-colors ${
                            selectedRoute === c.id ? 'bg-cyan-950/60 text-cyan-200' : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-2.5 text-white font-sans font-medium">
                            <div>{c.origin}</div>
                            <div className="text-[10px] text-cyan-400">→ {c.dest}</div>
                          </td>
                          <td className="py-2.5 text-slate-300 font-sans">{c.mode}</td>
                          <td className="py-2.5 text-right text-slate-300">{c.dist} mi</td>
                          <td className="py-2.5 text-right text-cyan-300 font-bold">{c.leadTime}d</td>
                          <td className="py-2.5 text-right text-amber-400">{c.delayRisk}</td>
                          <td className="py-2.5 text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              c.tier === 'Optimal' ? 'bg-emerald-500/20 text-emerald-300' :
                              c.tier === 'Bottleneck' ? 'bg-rose-500/20 text-rose-300' :
                              'bg-sky-500/20 text-sky-300'
                            }`}>
                              {c.tier}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {twinViewMode === 'shipments' && (
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Live Telemetry Event Feed (WebSocket Simulation)</span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SIMULATOR LIVE
                    </span>
                  </div>
                  {LIVE_DISPATCHES.map(item => {
                    const matchedTruck = ACTIVE_TRUCKS.find(t => t.trackingId === item.trackingId);
                    const isTruckSelected = selectedTruck === matchedTruck?.id;
                    return (
                      <div
                        key={item.trackingId}
                        onClick={() => {
                          if (matchedTruck) {
                            handleSelectTruck(isTruckSelected ? null : matchedTruck.id);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer ${
                          isTruckSelected
                            ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/50'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-cyan-300 font-bold">{item.trackingId}</span>
                            <span className="text-[10px] text-slate-400">• {item.sku}</span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            {item.origin} <span className="text-slate-500">→</span> {item.destination}
                          </div>
                          <div className="text-[10px] text-emerald-400 mt-1 font-mono">{item.temp}</div>
                        </div>
                        <div className="text-right sm:min-w-[140px]">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            item.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            item.status === 'OUT_FOR_DELIVERY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {item.status}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">{item.eta}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Compact Object Inspector HUD */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-xl text-left space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: currentFactoryObj.accentHex }}
                  />
                  <h3 className="font-black text-sm text-white">{currentFactoryObj.name}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {currentFactoryObj.id}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Geographic Centroid</span>
                  <span className="font-medium text-slate-200">{currentFactoryObj.location} ({currentFactoryObj.lat.toFixed(3)}°N, {Math.abs(currentFactoryObj.lon).toFixed(3)}°W)</span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">Daily Capacity</span>
                    <span className="text-cyan-300 font-bold font-mono">{currentFactoryObj.dailyCapacity}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">Operational Lead</span>
                    <span className="text-emerald-400 font-bold font-mono">{currentFactoryObj.leadTime}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Allocated Product Lines</span>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{currentFactoryObj.specialty}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Thermal Degradation Sentry</span>
                  <div className="text-[11px] text-amber-300 flex items-center gap-1.5 mt-0.5">
                    <ThermometerSun className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentFactoryObj.thermalRisk}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Primary Outbound Arterial</span>
                  <span className="text-[11px] text-slate-200 font-mono mt-0.5 block">{currentFactoryObj.topRoute}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <button
                  onClick={handlePrimaryCTA}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>Open Full Network Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION C: DATA-DRIVEN INTELLIGENCE & RESEARCH PLATFORM */}
      <section id="intelligence" className="relative z-10 py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3.5 py-1 text-xs font-semibold text-indigo-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Machine Learning & Empirical Research</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Scientific Machine Learning Calibration
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Trained on 10,194 verified dispatches with empirical cohort anchoring. Validated against actual operational outcomes without synthetic extrapolation.
          </p>
        </div>

        {/* Intelligence Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 gap-1 text-xs">
            <button
              onClick={() => setIntelligenceTab('models')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                intelligenceTab === 'models'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ML Models & Metrics
            </button>
            <button
              onClick={() => setIntelligenceTab('regional')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                intelligenceTab === 'regional'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regional & Factory Analytics
            </button>
            <button
              onClick={() => setIntelligenceTab('anomalies')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                intelligenceTab === 'anomalies'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Anomaly Detection
            </button>
            <button
              onClick={() => setIntelligenceTab('forecast')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                intelligenceTab === 'forecast'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Volume Forecasting
            </button>
          </div>
        </div>

        {/* Tab 1: ML Models & Evaluation Metrics */}
        {intelligenceTab === 'models' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-base">Delay Classification Engine</h4>
                  <p className="text-xs text-slate-400">Random Forest & Gradient Boosting Classifier</p>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-800">
                  AUC: 0.962
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">ACCURACY</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">94.2%</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">PRECISION</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">91.8%</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">RECALL</div>
                  <div className="text-base font-bold text-indigo-400 mt-0.5">88.5%</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">F1-SCORE</div>
                  <div className="text-base font-bold text-purple-400 mt-0.5">90.1%</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Predicts whether a shipment will experience delivery delays based on origin plant load, destination distance, ship mode SLA, and ambient temperatures.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-base">ETA Regression Engine</h4>
                  <p className="text-xs text-slate-400">Gradient Boosting Regressor (Days to Delivery)</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                  R²: 0.884
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">MAE (ERROR)</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">0.41 d</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">RMSE</div>
                  <div className="text-base font-bold text-indigo-400 mt-0.5">0.62 d</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">TOLERANCE ±1D</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">96.8%</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computes exact fractional operational lead times for pending orders with 95% parametric confidence intervals, protecting against customer SLA breaches.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Regional & Factory Analytics */}
        {intelligenceTab === 'regional' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            {[
              { region: 'Atlantic Region', lead: '3.94 days', delay: '8.4%', volume: '3,240 orders', desc: 'Fastest regional delivery due to Savannah hub proximity.' },
              { region: 'Interior Region', lead: '4.18 days', delay: '10.2%', volume: '2,890 orders', desc: 'Central cross-dock corridors via Memphis and Rock Island.' },
              { region: 'Gulf Region', lead: '4.31 days', delay: '12.6%', volume: '1,980 orders', desc: 'Elevated summer thermal alerts requiring climate linehaul.' },
              { region: 'Pacific Region', lead: '4.82 days', delay: '17.8%', volume: '2,084 orders', desc: 'Transcontinental cross-country freight with highest mileage.' },
            ].map(r => (
              <div key={r.region} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">{r.region}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{r.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Operational Lead:</span>
                    <span className="text-cyan-300 font-bold">{r.lead}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delay Rate:</span>
                    <span className="text-amber-400">{r.delay}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Anomaly Detection */}
        {intelligenceTab === 'anomalies' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h4 className="font-bold text-white text-base">Unsupervised Multi-Feature Isolation Forest</h4>
                <p className="text-xs text-slate-400">148 statistical lead-time and volume anomalies isolated from 10,194 records</p>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800 self-start sm:self-auto">
                1.45% Outlier Contamination
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-mono text-cyan-300 font-bold block mb-1">Lead-Time Deviations</span>
                <p className="text-slate-400 text-[11px]">Outliers with operational lead time &gt; 9 days (3.4 standard deviations above mode baseline).</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-mono text-amber-300 font-bold block mb-1">Thermal Risk Excursions</span>
                <p className="text-slate-400 text-[11px]">Chocolate product lanes in AZ, TX, and NV experiencing summer ambient heat &gt; 100°F.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-mono text-emerald-300 font-bold block mb-1">Automated Audit Flags</span>
                <p className="text-slate-400 text-[11px]">Non-destructive isolation of truncated zip codes and product division mismatches.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Volume Forecasting */}
        {intelligenceTab === 'forecast' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h4 className="font-bold text-white text-base">Holt-Winters Triple Exponential Smoothing</h4>
                <p className="text-xs text-slate-400">12-Month seasonal demand forecasting with 95% confidence bounds</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800 self-start sm:self-auto">
                Seasonality Period: 12 Mos
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">PEAK DEMAND QUARTER</span>
                <span className="text-base font-bold text-cyan-400 mt-1 block">Q4 (Oct - Dec)</span>
                <span className="text-slate-400 text-[10px] font-sans">Holiday confectionery surge (+38% volume)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">FORECAST CONFIDENCE</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">95% Parametric CI</span>
                <span className="text-slate-400 text-[10px] font-sans">Additive seasonal trend model</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">PROJECTED 12-MO UNITS</span>
                <span className="text-base font-bold text-purple-400 mt-1 block">14,200 Orders</span>
                <span className="text-slate-400 text-[10px] font-sans">Across 5 production facilities</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. SECTION D: FULL-STACK ENTERPRISE ARCHITECTURE */}
      <section id="architecture" className="relative z-10 py-20 px-6 lg:px-12 border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3 py-1 text-xs font-semibold text-indigo-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Full-Stack Enterprise Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Production-Grade Scale, Zero Third-Party Lock-in.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              RouteNexa AI is constructed entirely with free, high-performance open-source libraries. No recurring per-seat fees, no proprietary cloud locks, and zero external runtime 3D asset downloads.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Non-Destructive Empirical Cohort Correction</h4>
                  <p className="text-slate-400 text-[11px]">Corrects multi-year raw date anomalies without modifying raw CSV records.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Sub-10ms FastAPI Async Telemetry</h4>
                  <p className="text-slate-400 text-[11px]">Asynchronous Python REST API supporting 10,000+ orders with SQLite/PostgreSQL schema parity.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Enterprise Role-Based Access Control (RBAC)</h4>
                  <p className="text-slate-400 text-[11px]">Protected JWT tokens for Administrators, Logistics Planners, and Executive Analysts.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white font-mono">System Integrity Verification</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100% HEALTHY
              </span>
            </div>
            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Dataset Layer</span>
                <span className="font-mono text-slate-200">Nassau Candy (10,194 records, 18 columns)</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Backend Engine</span>
                <span className="font-mono text-slate-200">FastAPI 0.115+ (Async Python 3.9+)</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Machine Learning</span>
                <span className="font-mono text-slate-200">Scikit-Learn (GBM, RF, Isolation Forest)</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Geospatial Mapping</span>
                <span className="font-mono text-slate-200">Leaflet 1.9 + Real-World Satellite GIS</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">3D Hero Graphics</span>
                <span className="font-mono text-slate-200">Three.js + React Three Fiber 8.18</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Authentication</span>
                <span className="font-mono text-slate-200">JWT Bearer Auth + 1-Click Demo Login</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION E: FINAL CALL TO ACTION LEADING TO LOGIN */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 mx-auto text-slate-950">
            <Zap className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Deploy Intelligent Logistics in Your Browser.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Gain immediate access to all 17 RouteNexa AI modules: real-time corridor benchmarking, predictive machine learning ETAs, automated order intake, and autonomous anomaly isolation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePrimaryCTA}
              className="flex items-center gap-3 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-sm px-8 py-4 rounded-xl shadow-2xl shadow-cyan-500/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Launch RouteNexa Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 pt-2 flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Includes Instant 1-Click Administrator Access • Zero Subscription Fees</span>
          </p>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6 lg:px-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold text-white text-sm">RouteNexa AI</span>
              <p className="text-[11px] text-slate-500">Autonomous Supply Chain Intelligence System</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={() => scrollToSection('hero')} className="hover:text-slate-200">Hero</button>
            <button onClick={() => scrollToSection('digital-twin')} className="hover:text-slate-200">Digital Twin</button>
            <button onClick={() => scrollToSection('intelligence')} className="hover:text-slate-200">Predictive AI</button>
            <button onClick={() => scrollToSection('architecture')} className="hover:text-slate-200">Architecture</button>
            <button onClick={handlePrimaryCTA} className="text-cyan-400 hover:text-cyan-300 font-semibold">Sign In</button>
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} RouteNexa AI • Nassau Candy Confectionery Logistics.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
