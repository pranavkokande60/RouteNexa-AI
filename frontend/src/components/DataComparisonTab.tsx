import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import {
  Filter, Download, Printer, RefreshCw, BarChart2, TrendingUp,
  Cpu, AlertTriangle, Layers, Calendar, MapPin, Factory as FactoryIcon,
  Truck, DollarSign, CheckCircle2, ChevronDown, Info, ShieldAlert,
  ArrowUpDown, SlidersHorizontal, Activity
} from 'lucide-react';
import { api } from '../api';

export const DataComparisonTab: React.FC = () => {
  // Metadata for filter dropdowns
  const [metadata, setMetadata] = useState<{
    factories: string[];
    regions: string[];
    states: string[];
    products: string[];
    ship_modes: string[];
    min_date: string;
    max_date: string;
  } | null>(null);

  // Active Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedFactory, setSelectedFactory] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [selectedShipMode, setSelectedShipMode] = useState<string>('ALL');
  const [maxLeadTime, setMaxLeadTime] = useState<number>(0); // 0 means no threshold

  // Component Data & UI States
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive View Toggles
  const [routeViewMode, setRouteViewMode] = useState<'top_10_fastest' | 'bottom_10_slowest' | 'top_10_volume' | 'top_10_delay'>('bottom_10_slowest');
  const [mlMetricMode, setMlMetricMode] = useState<'delay' | 'eta'>('delay');

  // Load initial filter metadata
  useEffect(() => {
    api.getVisualizerMetadata()
      .then((meta) => {
        setMetadata(meta);
        if (meta.min_date) setStartDate(meta.min_date);
        if (meta.max_date) setEndDate(meta.max_date);
      })
      .catch((err) => console.error('Failed to load visualizer metadata:', err));
  }, []);

  // Fetch aggregated data whenever filters change
  const fetchData = () => {
    setLoading(true);
    setError(null);

    api.getVisualizerData({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      factory: selectedFactory !== 'ALL' ? selectedFactory : undefined,
      region: selectedRegion !== 'ALL' ? selectedRegion : undefined,
      state: selectedState !== 'ALL' ? selectedState : undefined,
      product: selectedProduct !== 'ALL' ? selectedProduct : undefined,
      ship_mode: selectedShipMode !== 'ALL' ? selectedShipMode : undefined,
      max_lead_time: maxLeadTime > 0 ? maxLeadTime : undefined
    })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching visualizer data:', err);
        setError(err.message || 'Failed to load visualizer analytics data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedFactory, selectedRegion, selectedState, selectedProduct, selectedShipMode, maxLeadTime]);

  const handleResetFilters = () => {
    if (metadata) {
      setStartDate(metadata.min_date);
      setEndDate(metadata.max_date);
    } else {
      setStartDate('');
      setEndDate('');
    }
    setSelectedFactory('ALL');
    setSelectedRegion('ALL');
    setSelectedState('ALL');
    setSelectedProduct('ALL');
    setSelectedShipMode('ALL');
    setMaxLeadTime(0);
  };

  const handleExportCsv = () => {
    const url = api.exportVisualizerCsvUrl({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      factory: selectedFactory !== 'ALL' ? selectedFactory : undefined,
      region: selectedRegion !== 'ALL' ? selectedRegion : undefined,
      state: selectedState !== 'ALL' ? selectedState : undefined,
      product: selectedProduct !== 'ALL' ? selectedProduct : undefined,
      ship_mode: selectedShipMode !== 'ALL' ? selectedShipMode : undefined,
      max_lead_time: maxLeadTime > 0 ? maxLeadTime : undefined
    });
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Custom Dark Tooltip
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 shadow-xl text-xs space-y-1 z-50">
          <p className="font-semibold text-sky-400 border-b border-slate-800 pb-1 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : entry.value}
                {entry.unit ? ` ${entry.unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Data Comparison & Performance Visualizer
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  12 Interactive Modules
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-dimensional comparative analytics, operational SLA distributions, ETA regression residuals, and time-series forecasting.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition border border-slate-700 disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition border border-emerald-500/30 shadow-sm"
            title="Download filtered dataset with verified operational metrics"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Filtered CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition border border-indigo-500/30"
            title="Print or save as PDF report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Global Filter Control Console */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-sky-400" />
            <span>Multi-Dimensional Filter Console</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-sky-400 hover:text-sky-300 hover:underline font-medium"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Factory */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <FactoryIcon className="w-3 h-3 text-slate-500" /> Factory
            </label>
            <select
              value={selectedFactory}
              onChange={(e) => setSelectedFactory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Factories (5)</option>
              {metadata?.factories.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" /> Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All US Regions (4)</option>
              {metadata?.regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Destination State */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" /> Destination State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All US States ({metadata?.states.length || 49})</option>
              {metadata?.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Ship Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3 text-slate-500" /> Ship Mode
            </label>
            <select
              value={selectedShipMode}
              onChange={(e) => setSelectedShipMode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Ship Modes (4)</option>
              {metadata?.ship_modes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Product & Lead Time Slider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" /> Candy Product Line
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Candy Products ({metadata?.products.length || 80})</option>
              {metadata?.products.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-500" /> Max Operational Lead Time Filter:
              </span>
              <span className="text-sky-400 font-bold">
                {maxLeadTime > 0 ? `${maxLeadTime} Days Max` : 'No Cap (All)'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={maxLeadTime}
                onChange={(e) => setMaxLeadTime(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              {maxLeadTime > 0 && (
                <button
                  onClick={() => setMaxLeadTime(0)}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Banner */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Matched Shipments</span>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {kpis.total_shipments.toLocaleString()}
            </div>
            <span className="text-[10px] text-sky-400 font-medium">Reconciled Records</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Filtered Revenue</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
              ${kpis.total_sales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-slate-400">Recorded Sales</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gross Profit</span>
            <div className="text-xl font-extrabold text-indigo-400 mt-0.5">
              ${kpis.total_profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-slate-400">
              {kpis.total_sales ? `${((kpis.total_profit / kpis.total_sales) * 100).toFixed(1)}% margin` : ''}
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Lead Time</span>
            <div className="text-xl font-extrabold text-sky-400 mt-0.5">
              {kpis.avg_lead_time} <span className="text-xs font-normal text-slate-400">days</span>
            </div>
            <span className="text-[10px] text-slate-400">Operational Duration</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">SLA Delay Rate</span>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">
              {kpis.delay_rate_pct}%
            </div>
            <span className="text-[10px] text-slate-400">Delivered Past SLA</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Detected Anomalies</span>
            <div className="text-xl font-extrabold text-rose-400 mt-0.5">
              {kpis.total_anomalies}
            </div>
            <span className="text-[10px] text-slate-400">Lead-Time Outliers</span>
          </div>
        </div>
      )}

      {/* Error / Empty State Handling */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <p className="font-semibold">Unable to fetch visualizer analytics</p>
            <p className="text-rose-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {data && data.total_matched === 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Filter className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Shipment Records Match Filter Criteria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try broadening your date range, resetting the ship mode, or loosening the operational lead-time threshold.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-semibold hover:bg-sky-400 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Main Charts Grid */}
      {data && data.total_matched > 0 && (
        <div className="space-y-6">

          {/* =========================================================================
              CHART 1: ROUTE PERFORMANCE COMPARISON
             ========================================================================= */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  1. Route Performance Comparison
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Top 10 and bottom 10 routes ranked by operational lead time, volume throughput, and SLA delay frequency.
                </p>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setRouteViewMode('bottom_10_slowest')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    routeViewMode === 'bottom_10_slowest'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Slowest (Bottom 10)
                </button>
                <button
                  onClick={() => setRouteViewMode('top_10_fastest')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    routeViewMode === 'top_10_fastest'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fastest (Top 10)
                </button>
                <button
                  onClick={() => setRouteViewMode('top_10_volume')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    routeViewMode === 'top_10_volume'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Top Volume
                </button>
                <button
                  onClick={() => setRouteViewMode('top_10_delay')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    routeViewMode === 'top_10_delay'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  High Delay Rate
                </button>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.route_performance[routeViewMode]}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 'dataMax + 1']}
                  />
                  <YAxis
                    type="category"
                    dataKey="route_label"
                    stroke="#64748b"
                    tick={{ fill: '#e2e8f0', fontSize: 10 }}
                    width={130}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="avg_lead_time"
                    name="Avg Operational Lead Time (Days)"
                    fill={routeViewMode === 'bottom_10_slowest' ? '#f43f5e' : '#38bdf8'}
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="delay_rate_pct"
                    name="Delay Rate (%)"
                    fill="#fbbf24"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* =========================================================================
              CHART 2 & 3: SHIP MODE COMPARISON & MONTHLY SHIPMENT TRENDS
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CHART 2: SHIP MODE COMPARISON */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  2. Ship Mode Comparison & Variability
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Comparison across Same Day, First, Second, and Standard Class with mean, median, standard deviation (variability), and volume.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ship_mode_comparison} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="mode" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="left" dataKey="volume" name="Shipment Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="mean_lead_time" name="Mean Lead Time (Days)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="median_lead_time" name="Median Lead Time (Days)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Variability stats summary table */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                {data.ship_mode_comparison.map((m: any) => (
                  <div key={m.mode} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-300 block truncate">{m.mode}</span>
                    <div className="text-xs font-bold text-sky-400 mt-1">{m.mean_lead_time}d avg</div>
                    <div className="text-[10px] text-slate-500">±{m.std_dev_lead_time}d σ</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{m.volume.toLocaleString()} units</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART 3: SHIPMENT TRENDS (Monthly Volume & Lead Time) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  3. Shipment Trends (Monthly Volume & Lead Time)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dual-axis temporal tracking of monthly shipment throughput alongside average operational lead time.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.shipment_trends} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 8]} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="volume"
                      name="Monthly Shipments"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#volumeGrad)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avg_lead_time"
                      name="Avg Lead Time (Days)"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* =========================================================================
              CHART 4 & 5: FACTORY PERFORMANCE & REGIONAL COMPARISON
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CHART 4: FACTORY PERFORMANCE */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  4. Factory Performance (All 5 Facilities)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cross-facility analysis comparing shipment volume, operational lead times, SLA delay rate, and product breadth.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.factory_performance} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="factory_name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis yAxisId="vol" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="rate" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="vol" dataKey="volume" name="Shipment Volume" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="rate" dataKey="avg_lead_time" name="Avg Lead Time (Days)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="rate" dataKey="delay_rate_pct" name="Delay Rate (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Factory Topology Badges */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                {data.factory_performance.map((f: any) => (
                  <div key={f.factory_name} className="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] flex-1 min-w-[120px]">
                    <span className="font-bold text-slate-200 block truncate">{f.factory_name}</span>
                    <span className="text-[10px] text-slate-400">{f.location} • {f.products_count} products</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART 5: REGIONAL COMPARISON */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  5. Regional Logistics Comparison
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Comparison between Pacific, Atlantic, Interior, and Gulf logistics corridors.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.regional_comparison} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="region" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="left" dataKey="volume" name="Shipment Volume" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="avg_lead_time" name="Avg Lead Time (Days)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="delay_rate_pct" name="Delay Rate (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                {data.regional_comparison.map((r: any) => (
                  <div key={r.region} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-300 block">{r.region}</span>
                    <div className="text-xs font-bold text-purple-400 mt-1">{r.volume.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{r.avg_lead_time}d avg • {r.delay_rate_pct}% delay</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* =========================================================================
              CHART 6 & 7: LEAD-TIME DISTRIBUTION & ROUTE VOLUME VS EFFICIENCY SCATTER
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CHART 6: OPERATIONAL LEAD-TIME DISTRIBUTION */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  6. Operational Lead-Time Distribution Histogram
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Histogram distribution of actual operational fulfillment durations (0-1d Express, 2-3d Fast, 4-5d Standard, 6-7d Extended, 8+d Outliers).
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.lead_time_distribution} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="count" name="Shipment Count" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                      {data.lead_time_distribution.map((entry: any, index: number) => {
                        const colors = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#ef4444'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 7: ROUTE VOLUME VS EFFICIENCY SCATTER PLOT */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  7. Route Volume vs Efficiency (Bottleneck Quadrant)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scatter plot identifying high-volume, low-efficiency routes that represent critical logistics bottlenecks.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      dataKey="avg_lead_time"
                      name="Lead Time (Days)"
                      unit="d"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="volume"
                      name="Shipment Volume"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={renderCustomTooltip} />
                    <ReferenceLine x={4.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "SLA Threshold (4.5d)", fill: "#ef4444", fontSize: 10 }} />
                    <Scatter
                      name="Routes"
                      data={data.route_volume_efficiency}
                      fill="#f43f5e"
                    >
                      {data.route_volume_efficiency.map((entry: any, index: number) => {
                        const isBottleneck = entry.avg_lead_time > 4.5 && entry.volume > 50;
                        return (
                          <Cell
                            key={`scatter-cell-${index}`}
                            fill={isBottleneck ? '#ef4444' : entry.avg_lead_time < 3.5 ? '#10b981' : '#38bdf8'}
                          />
                        );
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> High Efficiency (&lt;3.5d)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Standard Operations
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High-Volume Bottlenecks
                </span>
              </div>
            </div>

          </div>

          {/* =========================================================================
              CHART 8 & 9: PREDICTION VS ACTUAL & ML MODEL BENCHMARK
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CHART 8: PREDICTION VS ACTUAL (ONLY EVALUATED ORDERS) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    8. ETA Prediction vs Actual Delivery Outcomes
                  </h3>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-semibold">
                    {data.prediction_vs_actual.summary.evaluated_count} Verified Orders
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Strictly evaluated on completed orders with confirmed delivery receipts. Excludes pending shipments to prevent synthetic skew.
                </p>
              </div>

              {data.prediction_vs_actual.evaluated_orders.length > 0 ? (
                <>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.prediction_vs_actual.evaluated_orders}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="order_id"
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 9 }}
                          angle={-20}
                          textAnchor="end"
                        />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip content={renderCustomTooltip} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="predicted_lt" name="Predicted ETA (Days)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actual_lt" name="Actual Delivery (Days)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400">Mean Absolute Error (MAE)</span>
                      <div className="text-xs font-bold text-sky-400 mt-0.5">
                        {data.prediction_vs_actual.summary.mae} Days
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400">Root Mean Square Error (RMSE)</span>
                      <div className="text-xs font-bold text-indigo-400 mt-0.5">
                        {data.prediction_vs_actual.summary.rmse} Days
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400">Accuracy Within ±1 Day</span>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">
                        {data.prediction_vs_actual.summary.accuracy_within_1day_pct}%
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-slate-600" />
                  <span>No completed orders with delivery receipts matched current filter.</span>
                </div>
              )}
            </div>

            {/* CHART 9: ML MODEL COMPARISON */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    9. ML Model Benchmark & Comparison
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Evaluation metrics across algorithmic baselines and production champion models.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setMlMetricMode('delay')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      mlMetricMode === 'delay'
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Classification
                  </button>
                  <button
                    onClick={() => setMlMetricMode('eta')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      mlMetricMode === 'eta'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ETA Regression
                  </button>
                </div>
              </div>

              {mlMetricMode === 'delay' ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.ml_models_comparison.delay_classification}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="model" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1.0]} />
                      <Tooltip content={renderCustomTooltip} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="precision" name="Precision" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="recall" name="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="f1_score" name="F1-Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="auc_roc" name="ROC-AUC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.ml_models_comparison.eta_regression}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="model" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip content={renderCustomTooltip} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="mae" name="MAE (Days)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="rmse" name="RMSE (Days)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="r2" name="R² Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>

          {/* =========================================================================
              CHART 10 & 11: ANOMALY TRENDS & HISTORICAL VS FORECAST
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CHART 10: ANOMALY TRENDS */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  10. Detected Logistics Anomaly Trends Over Time
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Monthly time-series of anomalous lead-time events, delivery discrepancies, and operational outlier rates.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.anomaly_trends} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="anomalyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 10]} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="anomalies"
                      name="Anomalies Count"
                      stroke="#f43f5e"
                      fillOpacity={1}
                      fill="url(#anomalyGrad)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="anomaly_rate_pct"
                      name="Anomaly Rate (%)"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 11: HISTORICAL VS FORECAST */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    11. Historical Actuals vs 14-Day Forecast
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                    95% Confidence Band
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Comparison between recent 30-day recorded shipment throughput and 14-day forward forecast projections.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.historical_vs_forecast} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line
                      type="monotone"
                      dataKey="actual_shipments"
                      name="Historical Actuals"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projected_shipments"
                      name="14-Day Forward Forecast"
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidence_upper"
                      name="Confidence Upper (95%)"
                      stroke="transparent"
                      fill="#10b981"
                      fillOpacity={0.12}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* =========================================================================
              CHART 12: SALES, PROFIT, AND PRODUCT MANUFACTURING COST
             ========================================================================= */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  12. Sales, Gross Profit, and Product Cost Analysis
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Monthly comparative financial performance of sales volume, gross profit margin, and manufacturing inventory cost.
                </p>
              </div>

              {/* Data Integrity Disclaimer Notice */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px]">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Accounting Clarification:</strong> Product Cost represents manufacturing wholesale cost (<span className="italic">Sales − Gross Profit</span>), distinct from freight delivery fees.
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.sales_profit_trends.data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="sales" name="Recorded Sales ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gross_profit" name="Gross Profit ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="product_cost" name="Product Wholesale Cost ($)" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
