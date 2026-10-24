import React, { useState, lazy, Suspense } from 'react';
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
  ExternalLink,
  Lock,
  Zap,
  Globe2,
  RefreshCw,
  Compass,
  Radio
} from 'lucide-react';
import { GlobeFallback } from './GlobeFallback';

// Lazy load 3D Globe to optimize initial bundle delivery and maintain smooth FPS
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
  const [selectedFactory, setSelectedFactory] = useState<string | null>("Wicked Choccy's");
  const [activeTab, setActiveTab] = useState<'network' | 'ml' | 'simulator'>('network');

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

  const FACTORIES = [
    {
      name: "Wicked Choccy's",
      location: "Savannah, Georgia",
      lat: 32.076,
      lon: -81.088,
      leadTime: "4.1 days",
      dailyCapacity: "75,000 units/day",
      specialty: "Premium Milk & Caramel Chocolate",
      efficiency: "92.4%",
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/40",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      name: "Lot's O' Nuts",
      location: "Casa Grande, Arizona",
      lat: 32.882,
      lon: -111.768,
      leadTime: "3.9 days",
      dailyCapacity: "50,000 units/day",
      specialty: "Nut & Marshmallow Confections",
      efficiency: "94.8%",
      color: "from-sky-500/20 to-blue-500/20",
      borderColor: "border-sky-500/40",
      badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    },
    {
      name: "The Other Factory",
      location: "Memphis, Tennessee",
      lat: 35.118,
      lon: -89.971,
      leadTime: "4.3 days",
      dailyCapacity: "40,000 units/day",
      specialty: "Chewy Candies & Specialty Toffee",
      efficiency: "88.6%",
      color: "from-indigo-500/20 to-purple-500/20",
      borderColor: "border-indigo-500/40",
      badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    },
    {
      name: "Sugar Shack",
      location: "Thief River Falls, Minnesota",
      lat: 48.119,
      lon: -96.181,
      leadTime: "4.8 days",
      dailyCapacity: "35,000 units/day",
      specialty: "Sugar Candies & Specialty Beverages",
      efficiency: "85.2%",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/40",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      name: "Secret Factory",
      location: "Rock Island, Illinois",
      lat: 41.446,
      lon: -90.565,
      leadTime: "4.4 days",
      dailyCapacity: "25,000 units/day",
      specialty: "Experimental Confections & Novelties",
      efficiency: "87.1%",
      color: "from-rose-500/20 to-pink-500/20",
      borderColor: "border-rose-500/40",
      badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
  ];

  const CAPABILITY_CARDS = [
    {
      icon: Cpu,
      title: "Dual-Engine ML ETA Prediction",
      tag: "GBM & Random Forest",
      description:
        "High-precision estimated transit time engine trained on operational lead times, predicting delivery dates with confidence intervals and early/late classification.",
      stat: "94.2% Prediction Accuracy",
      accent: "border-cyan-500/30 hover:border-cyan-400/60 shadow-cyan-500/10",
      iconColor: "text-cyan-400 bg-cyan-500/10",
    },
    {
      icon: Globe2,
      title: "196-Corridor Route Intelligence",
      tag: "Geodesic Arcs & Optimization",
      description:
        "Dynamic nationwide corridor performance evaluation, automatic lead-time outlier detection, and factory-to-destination load reallocation recommendations.",
      stat: "196 Active Freight Corridors",
      accent: "border-blue-500/30 hover:border-blue-400/60 shadow-blue-500/10",
      iconColor: "text-blue-400 bg-blue-500/10",
    },
    {
      icon: AlertTriangle,
      title: "Isolation Forest Anomaly Sentry",
      tag: "Automated Quarantine",
      description:
        "Unsupervised anomaly detection scanning 10,000+ shipment vectors, isolating lead-time discrepancies, carrier bottlenecks, and thermal risk corridors.",
      stat: "148 Operational Anomalies Isolated",
      accent: "border-amber-500/30 hover:border-amber-400/60 shadow-amber-500/10",
      iconColor: "text-amber-400 bg-amber-500/10",
    },
    {
      icon: TrendingUp,
      title: "Holt-Winters Demand Forecasting",
      tag: "Triple Exponential Smoothing",
      description:
        "Time-series freight volume prediction capturing seasonality, manufacturing ramp-ups, and regional retail demand across all 5 production facilities.",
      stat: "12-Month Proactive Horizons",
      accent: "border-emerald-500/30 hover:border-emerald-400/60 shadow-emerald-500/10",
      iconColor: "text-emerald-400 bg-emerald-500/10",
    },
    {
      icon: Sliders,
      title: "Multi-Scenario What-If Simulator",
      tag: "Dynamic Stress Testing",
      description:
        "Simulate fuel surcharge spikes, carrier strikes, severe weather deviations, and factory capacity reallocations to quantify lead-time impact before dispatch.",
      stat: "Sub-Second Simulation Run",
      accent: "border-indigo-500/30 hover:border-indigo-400/60 shadow-indigo-500/10",
      iconColor: "text-indigo-400 bg-indigo-500/10",
    },
    {
      icon: Bot,
      title: "Autonomous AI Logistics Copilot",
      tag: "Natural Language Analytics",
      description:
        "Direct natural-language logistics reasoning. Ask 'Which routes from Savannah to California face delays?' and receive actionable prescriptive solutions.",
      stat: "Zero-Latency Natural Language",
      accent: "border-purple-500/30 hover:border-purple-400/60 shadow-purple-500/10",
      iconColor: "text-purple-400 bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      {/* 1. STICKY GLASSMORPHIC HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-6 lg:px-12 h-18 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">RouteNexa<span className="text-cyan-400"> AI</span></span>
              <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Enterprise OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Logistics Analytics & ML Routing</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <button
            onClick={() => scrollToSection('network')}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <span>3D Network</span>
          </button>
          <button
            onClick={() => scrollToSection('capabilities')}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <span>Capabilities</span>
          </button>
          <button
            onClick={() => scrollToSection('metrics')}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <span>Telemetry</span>
          </button>
          <button
            onClick={() => scrollToSection('architecture')}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <span>Architecture</span>
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Live</span>
          </div>

          {isAuthenticated ? (
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In / Launch App</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. 3D HERO SECTION */}
      <section className="relative z-10 pt-10 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-cyan-500/30 rounded-full px-3.5 py-1.5 shadow-lg shadow-cyan-500/5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">
                RouteNexa AI • Autonomous Logistics Intelligence
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12] text-white">
              Intelligence That Moves{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Logistics Forward.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Transform shipment data into smarter routes, more accurate delivery predictions, and actionable logistics intelligence across 196 nationwide freight corridors.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handlePrimaryCTA}
                className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => scrollToSection('capabilities')}
                className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
              >
                <span>Discover Capabilities</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Key Trust & Architecture Highlights */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">10,194+</div>
                <div className="text-xs text-slate-400 mt-0.5">Audited Shipments</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono">94.2%</div>
                <div className="text-xs text-slate-400 mt-0.5">ML ETA Accuracy</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">5 Hubs</div>
                <div className="text-xs text-slate-400 mt-0.5">Factory Production</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Hero Globe */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* 3D Canvas Box */}
            <div className="w-full relative rounded-3xl bg-slate-900/40 border border-slate-800/80 p-3 sm:p-5 backdrop-blur-xl shadow-2xl shadow-cyan-950/30 overflow-hidden">
              {/* Globe Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs px-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] ml-1">geodesic_earth_mesh.glb</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px]">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Interactive 3D WebGL</span>
                </div>
              </div>

              {/* 3D Globe with Suspense & Dynamic Fallback */}
              <div className="relative min-h-[420px] sm:min-h-[480px] flex items-center justify-center">
                <Suspense
                  fallback={
                    <GlobeFallback
                      selectedFactory={selectedFactory}
                      onSelectFactory={(f) => setSelectedFactory(f)}
                    />
                  }
                >
                  <Globe3D
                    selectedFactory={selectedFactory}
                    onSelectFactory={(f) => setSelectedFactory(f)}
                  />
                </Suspense>
              </div>

              {/* Quick Factory Switcher Tabs below 3D Earth */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto">
                {FACTORIES.map((f) => {
                  const isSel = selectedFactory === f.name;
                  return (
                    <button
                      key={f.name}
                      onClick={() => setSelectedFactory(f.name)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span>{f.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 1: ANIMATED KEY METRICS STRIP */}
      <section id="metrics" className="relative z-10 border-y border-slate-800/90 bg-slate-900/50 backdrop-blur py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
              <div className="text-2xl lg:text-3xl font-black text-cyan-400 font-mono">10,194</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Total Shipments</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Audited Historical Records</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
              <div className="text-2xl lg:text-3xl font-black text-sky-400 font-mono">196</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Freight Corridors</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Nationwide Connected Lanes</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
              <div className="text-2xl lg:text-3xl font-black text-emerald-400 font-mono">94.2%</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">ETA Accuracy</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Gradient Boosting Classifier</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
              <div className="text-2xl lg:text-3xl font-black text-indigo-400 font-mono">87.4%</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Efficiency Score</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Corridor Route Benchmark</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
              <div className="text-2xl lg:text-3xl font-black text-purple-400 font-mono">4.38 d</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Avg Lead Time</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Operational Dispatch Speed</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left">
              <div className="text-2xl lg:text-3xl font-black text-amber-400 font-mono">$1.2M+</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Freight Savings</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Mode & Route Optimization</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: CORE CAPABILITIES & ENTERPRISE MODULES */}
      <section id="capabilities" className="relative z-10 py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3.5 py-1 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>End-to-End Decision Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Six Intelligent Modules. One Unified Command Center.
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineered specifically to solve high-friction confectionery supply chain challenges: shelf-life sensitivity, thermal risk in transit, and multi-facility balancing.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITY_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-7 rounded-3xl bg-slate-900/60 border transition-all duration-300 hover:-translate-y-1 text-left flex flex-col justify-between ${card.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{card.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-300 font-semibold">{card.stat}</span>
                  <button
                    onClick={handlePrimaryCTA}
                    className="text-slate-400 hover:text-white flex items-center gap-1 font-medium group text-[11px]"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. SECTION 3: FACTORY-TO-CUSTOMER NETWORK */}
      <section id="network" className="relative z-10 py-20 px-6 lg:px-12 border-t border-slate-800/90 bg-slate-950/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="text-left space-y-2">
              <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-3 py-1 text-xs font-semibold text-sky-400">
                <Factory className="w-3.5 h-3.5" />
                <span>Geospatial Manufacturing Footprint</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                5 Dedicated Confectionery Hubs
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Real-time capacity, product lines, and operational lead times calibrated against Nassau Candy's nationwide production grid.
              </p>
            </div>

            <button
              onClick={handlePrimaryCTA}
              className="self-start md:self-auto flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-xl transition-all"
            >
              <span>Explore Real-World US Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Factories Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {FACTORIES.map((fac) => {
              const isSelected = selectedFactory === fac.name;
              return (
                <div
                  key={fac.name}
                  onClick={() => setSelectedFactory(fac.name)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between ${
                    isSelected
                      ? `bg-slate-900 ${fac.borderColor} shadow-xl shadow-cyan-950/30 scale-[1.02]`
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fac.badgeColor}`}>
                        {fac.efficiency} Eff.
                      </span>
                      <MapPin className="w-4 h-4 text-slate-500" />
                    </div>

                    <h4 className="text-sm font-bold text-white mb-0.5">{fac.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium mb-3">{fac.location}</p>

                    <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Specialization</div>
                      <div className="font-medium text-slate-200 mt-0.5">{fac.specialty}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Lead Time</span>
                    <span className="text-cyan-300 font-bold">{fac.leadTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SECTION 4: ENTERPRISE ARCHITECTURE & GOVERNANCE */}
      <section id="architecture" className="relative z-10 py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3 py-1 text-xs font-semibold text-indigo-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Full-Stack Enterprise Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Built for Scale, Security, and Sub-10ms Latency.
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              RouteNexa AI delivers enterprise-grade performance without external telemetry dependencies, proprietary cloud lock-in, or costly per-seat API subscriptions.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Role-Based Access Control (RBAC)</h4>
                  <p className="text-[11px] text-slate-400">Granular permissions for Administrators, Logistics Planners, and Executive Analysts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">FastAPI Async Telemetry Engine</h4>
                  <p className="text-[11px] text-slate-400">Asynchronous Python backend with SQLite/PostgreSQL persistence processing 10,000+ records in milliseconds.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">100% Free & Open-Source Stack</h4>
                  <p className="text-[11px] text-slate-400">Procedural 3D Three.js, React Three Fiber, Leaflet Geographic GIS, and Tailwind CSS.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-xs font-bold text-white font-mono">System Integrity Verification</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100% HEALTHY
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Database Layer</span>
                <span className="font-mono text-slate-200">SQLite / PostgreSQL (10,194 records)</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">API Server</span>
                <span className="font-mono text-slate-200">FastAPI 0.115+ (Async Python)</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Machine Learning</span>
                <span className="font-mono text-slate-200">Scikit-Learn (GBM, RF, Isolation Forest)</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Geospatial Mapping</span>
                <span className="font-mono text-slate-200">Leaflet 1.9 + Esri World Satellite Tiles</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">3D Hero Graphics</span>
                <span className="font-mono text-slate-200">Three.js + React Three Fiber 8.18</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Authentication</span>
                <span className="font-mono text-slate-200">JWT Bearer Auth + Demo Auto-Login</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 5: FINAL HIGH-CONVERTING CTA */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 mx-auto text-slate-950">
            <Zap className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Accelerate Your Logistics Intelligence?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience real-time route optimization, predictive machine learning ETAs, and autonomous bottleneck detection right inside your browser.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePrimaryCTA}
              className="flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-sm px-8 py-4 rounded-xl shadow-2xl shadow-cyan-500/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Launch RouteNexa Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 pt-2 flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Includes 1-Click System Administrator Access • Zero Subscription Fees</span>
          </p>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6 lg:px-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold text-white text-sm">RouteNexa AI</span>
              <p className="text-[11px] text-slate-500">Autonomous Supply Chain & Logistics Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={() => scrollToSection('network')} className="hover:text-slate-200">Network</button>
            <button onClick={() => scrollToSection('capabilities')} className="hover:text-slate-200">Capabilities</button>
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
