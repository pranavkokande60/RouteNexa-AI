/**
 * RouteNexa AI — Logistics Digital Twin Ground Truth Data
 * =======================================================
 * Verified factory nodes, destination gateways, freight corridors, and active convoys.
 */

export interface FactoryNodeData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
  stateCode: string;
  specialization: string;
  capacity: string;
  leadTime: string;
  efficiency: string;
  color: string;
  accentHex: string;
  products: string[];
  dispatches: number;
}

// 1. FIVE VERIFIED FACTORIES WITH DATA-MAPPED PRODUCTS & COORDINATES
export const FACTORY_NODES: FactoryNodeData[] = [
  {
    id: 'FAC-WCK-02',
    name: "Wicked Choccy's",
    lat: 32.076176,
    lon: -81.088371,
    city: 'Savannah',
    state: 'Georgia',
    stateCode: 'GA',
    specialization: 'Premium Milk & Caramel Chocolate',
    capacity: '75,000 units/day',
    leadTime: '4.1 days',
    efficiency: '92.4%',
    color: 'amber',
    accentHex: '#f59e0b',
    products: ['Wonka Bar - Milk Chocolate', 'Wonka Bar - Triple Dazzle Caramel'],
    dispatches: 3140
  },
  {
    id: 'FAC-LON-01',
    name: "Lot's O' Nuts",
    lat: 32.881893,
    lon: -111.768036,
    city: 'Casa Grande',
    state: 'Arizona',
    stateCode: 'AZ',
    specialization: 'Nut & Marshmallow Chocolate Bars',
    capacity: '50,000 units/day',
    leadTime: '3.9 days',
    efficiency: '94.8%',
    color: 'cyan',
    accentHex: '#00f0ff',
    products: ['Wonka Bar - Nutty Crunch Surprise', 'Wonka Bar - Fudge Mallows', 'Wonka Bar - Scrumdiddlyumptious'],
    dispatches: 2480
  },
  {
    id: 'FAC-OTH-05',
    name: "The Other Factory",
    lat: 35.117500,
    lon: -89.971107,
    city: 'Memphis',
    state: 'Tennessee',
    stateCode: 'TN',
    specialization: 'Chewy Candies & Specialty Toffee',
    capacity: '40,000 units/day',
    leadTime: '4.3 days',
    efficiency: '88.6%',
    color: 'violet',
    accentHex: '#a855f7',
    products: ['Hair Toffee', 'Kazookles'],
    dispatches: 1820
  },
  {
    id: 'FAC-SSK-03',
    name: "Sugar Shack",
    lat: 48.119140,
    lon: -96.181150,
    city: 'Thief River Falls',
    state: 'Minnesota',
    stateCode: 'MN',
    specialization: 'Sugar Candies & Specialty Beverages',
    capacity: '35,000 units/day',
    leadTime: '4.8 days',
    efficiency: '85.2%',
    color: 'emerald',
    accentHex: '#10b981',
    products: ['Laffy Taffy', 'SweeTARTS', 'Nerds', 'Fun Dip', 'Fizzy Lifting Drinks'],
    dispatches: 1540
  },
  {
    id: 'FAC-SEC-04',
    name: "Secret Factory",
    lat: 41.446333,
    lon: -90.565487,
    city: 'Rock Island',
    state: 'Illinois',
    stateCode: 'IL',
    specialization: 'Experimental Confections & Novelties',
    capacity: '25,000 units/day',
    leadTime: '4.4 days',
    efficiency: '87.1%',
    color: 'rose',
    accentHex: '#f43f5e',
    products: ['Everlasting Gobstopper', 'Lickable Wallpaper', 'Wonka Gum'],
    dispatches: 1214
  },
];

// 2. INTERACTIVE DESTINATION HUBS DERIVED FROM AUDITED RECORDS
export const DESTINATION_HUBS = [
  { id: 'HUB-LAX', name: 'Los Angeles Terminal', lat: 34.052, lon: -118.244, city: 'Los Angeles, CA', region: 'Pacific', dispatches: 2190, avgLeadTime: '4.2 days', delayRate: '8.4%' },
  { id: 'HUB-SEA', name: 'Seattle Regional Hub', lat: 47.606, lon: -122.332, city: 'Seattle, WA', region: 'Pacific', dispatches: 1140, avgLeadTime: '5.4 days', delayRate: '18.2%' },
  { id: 'HUB-DFW', name: 'Dallas Cross-Dock', lat: 32.777, lon: -96.797, city: 'Dallas, TX', region: 'Gulf', dispatches: 1980, avgLeadTime: '1.4 days', delayRate: '4.8%' },
  { id: 'HUB-NYC', name: 'Metro New York DC', lat: 40.713, lon: -74.006, city: 'New York, NY', region: 'Atlantic', dispatches: 2260, avgLeadTime: '2.9 days', delayRate: '9.2%' },
  { id: 'HUB-MIA', name: 'Miami Gateway', lat: 25.762, lon: -80.192, city: 'Miami, FL', region: 'Atlantic', dispatches: 1050, avgLeadTime: '3.6 days', delayRate: '10.5%' },
  { id: 'HUB-DEN', name: 'Denver Intermodal', lat: 39.739, lon: -104.990, city: 'Denver, CO', region: 'Interior', dispatches: 890, avgLeadTime: '3.1 days', delayRate: '11.8%' },
  { id: 'HUB-CHI', name: 'Chicago Central Depot', lat: 41.878, lon: -87.630, city: 'Chicago, IL', region: 'Interior', dispatches: 1840, avgLeadTime: '3.8 days', delayRate: '14.0%' },
];

export type RiskLevel = 'LOW' | 'ELEVATED' | 'HIGH';

// 3. CURATED FREIGHT CORRIDORS WITH PREDICTIVE RISK RATINGS
export const LOGISTICS_CORRIDORS = [
  // Wicked Choccy's (Savannah, GA)
  { id: 'SAV-LAX', factoryId: 'FAC-WCK-02', destId: 'HUB-LAX', mode: 'Second Class', distance: 2184, isPrimary: true, speed: 0.18, risk: 'ELEVATED' as RiskLevel, delayRisk: '14.2%', predictedEta: '4.6 days', efficiency: '91.2%' },
  { id: 'SAV-NYC', factoryId: 'FAC-WCK-02', destId: 'HUB-NYC', mode: 'First Class', distance: 740, isPrimary: false, speed: 0.22, risk: 'LOW' as RiskLevel, delayRisk: '7.8%', predictedEta: '2.4 days', efficiency: '94.0%' },
  { id: 'SAV-MIA', factoryId: 'FAC-WCK-02', destId: 'HUB-MIA', mode: 'Second Class', distance: 480, isPrimary: false, speed: 0.24, risk: 'LOW' as RiskLevel, delayRisk: '6.2%', predictedEta: '1.8 days', efficiency: '95.1%' },
  { id: 'SAV-SEA', factoryId: 'FAC-WCK-02', destId: 'HUB-SEA', mode: 'Standard Class', distance: 2590, isPrimary: false, speed: 0.16, risk: 'HIGH' as RiskLevel, delayRisk: '21.6%', predictedEta: '5.8 days', efficiency: '79.5%' },

  // Lot's O' Nuts (Casa Grande, AZ)
  { id: 'CG-DFW', factoryId: 'FAC-LON-01', destId: 'HUB-DFW', mode: 'Same Day', distance: 842, isPrimary: true, speed: 0.22, risk: 'LOW' as RiskLevel, delayRisk: '4.1%', predictedEta: '0.8 days', efficiency: '96.5%' },
  { id: 'CG-LAX', factoryId: 'FAC-LON-01', destId: 'HUB-LAX', mode: 'Same Day', distance: 420, isPrimary: false, speed: 0.24, risk: 'LOW' as RiskLevel, delayRisk: '3.8%', predictedEta: '0.7 days', efficiency: '97.1%' },
  { id: 'CG-DEN', factoryId: 'FAC-LON-01', destId: 'HUB-DEN', mode: 'Standard Class', distance: 650, isPrimary: false, speed: 0.20, risk: 'ELEVATED' as RiskLevel, delayRisk: '13.5%', predictedEta: '3.4 days', efficiency: '88.2%' },

  // The Other Factory (Memphis, TN)
  { id: 'MEM-NYC', factoryId: 'FAC-OTH-05', destId: 'HUB-NYC', mode: 'First Class', distance: 956, isPrimary: true, speed: 0.20, risk: 'LOW' as RiskLevel, delayRisk: '9.5%', predictedEta: '2.7 days', efficiency: '89.4%' },
  { id: 'MEM-DFW', factoryId: 'FAC-OTH-05', destId: 'HUB-DFW', mode: 'Standard Class', distance: 450, isPrimary: false, speed: 0.22, risk: 'LOW' as RiskLevel, delayRisk: '8.2%', predictedEta: '2.1 days', efficiency: '91.0%' },
  { id: 'MEM-CHI', factoryId: 'FAC-OTH-05', destId: 'HUB-CHI', mode: 'Second Class', distance: 530, isPrimary: false, speed: 0.23, risk: 'LOW' as RiskLevel, delayRisk: '8.9%', predictedEta: '2.2 days', efficiency: '92.3%' },

  // Sugar Shack (Thief River Falls, MN)
  { id: 'TRF-CHI', factoryId: 'FAC-SSK-03', destId: 'HUB-CHI', mode: 'Standard Class', distance: 580, isPrimary: true, speed: 0.18, risk: 'HIGH' as RiskLevel, delayRisk: '18.4%', predictedEta: '5.1 days', efficiency: '82.0%' },
  { id: 'TRF-SEA', factoryId: 'FAC-SSK-03', destId: 'HUB-SEA', mode: 'Standard Class', distance: 1220, isPrimary: false, speed: 0.17, risk: 'ELEVATED' as RiskLevel, delayRisk: '15.6%', predictedEta: '4.8 days', efficiency: '84.5%' },
  { id: 'TRF-DEN', factoryId: 'FAC-SSK-03', destId: 'HUB-DEN', mode: 'First Class', distance: 780, isPrimary: false, speed: 0.21, risk: 'LOW' as RiskLevel, delayRisk: '9.1%', predictedEta: '2.8 days', efficiency: '90.2%' },

  // Secret Factory (Rock Island, IL)
  { id: 'RI-MIA', factoryId: 'FAC-SEC-04', destId: 'HUB-MIA', mode: 'Second Class', distance: 1240, isPrimary: true, speed: 0.20, risk: 'ELEVATED' as RiskLevel, delayRisk: '12.0%', predictedEta: '4.2 days', efficiency: '88.0%' },
  { id: 'RI-NYC', factoryId: 'FAC-SEC-04', destId: 'HUB-NYC', mode: 'First Class', distance: 890, isPrimary: false, speed: 0.22, risk: 'LOW' as RiskLevel, delayRisk: '8.5%', predictedEta: '2.6 days', efficiency: '91.8%' },
  { id: 'RI-DFW', factoryId: 'FAC-SEC-04', destId: 'HUB-DFW', mode: 'Standard Class', distance: 720, isPrimary: false, speed: 0.21, risk: 'LOW' as RiskLevel, delayRisk: '9.4%', predictedEta: '2.9d', efficiency: '90.5%' },
];

// 4. ANIMATED FREIGHT FLEET CONVOYS
export const ACTIVE_TRUCKS = [
  {
    id: 'TRK-89412',
    fleetName: 'Fleet Alpha-1',
    trackingId: 'NC-89412',
    corridorId: 'SAV-LAX',
    factoryName: "Wicked Choccy's",
    destName: 'Los Angeles Terminal',
    sku: 'Wonka Bar - Milk Chocolate (75 cases)',
    mode: 'Second Class',
    distance: 2184,
    predictedEta: '4.12 days',
    delayRisk: '14.2%',
    riskLevel: 'ELEVATED' as RiskLevel,
    temp: '58°F (Optimal Reefer)',
    status: 'IN_TRANSIT (Simulated Telemetry Feed)',
    speed: 0.17,
    phase: 0.42
  },
  {
    id: 'TRK-89414',
    fleetName: 'Fleet Beta-4',
    trackingId: 'NC-89414',
    corridorId: 'CG-DFW',
    factoryName: "Lot's O' Nuts",
    destName: 'Dallas Cross-Dock',
    sku: 'Wonka Bar - Nutty Crunch Surprise (120 cases)',
    mode: 'Same Day',
    distance: 842,
    predictedEta: '0.82 days',
    delayRisk: '4.1%',
    riskLevel: 'LOW' as RiskLevel,
    temp: '60°F (Verified OK)',
    status: 'IN_TRANSIT (Simulated Telemetry Feed)',
    speed: 0.22,
    phase: 0.68
  },
  {
    id: 'TRK-89415',
    fleetName: 'Fleet Gamma-2',
    trackingId: 'NC-89415',
    corridorId: 'MEM-NYC',
    factoryName: 'The Other Factory',
    destName: 'Metro New York DC',
    sku: 'Kazookles Chewy Toffee (90 cases)',
    mode: 'First Class',
    distance: 956,
    predictedEta: '2.68 days',
    delayRisk: '9.5%',
    riskLevel: 'LOW' as RiskLevel,
    temp: '64°F (Dry Freight OK)',
    status: 'IN_TRANSIT (Simulated Telemetry Feed)',
    speed: 0.20,
    phase: 0.25
  },
  {
    id: 'TRK-89413',
    fleetName: 'Fleet Delta-7',
    trackingId: 'NC-89413',
    corridorId: 'TRF-CHI',
    factoryName: 'Sugar Shack',
    destName: 'Chicago Central Depot',
    sku: 'Laffy Taffy - Strawberry Batch (150 cases)',
    mode: 'Standard Class',
    distance: 580,
    predictedEta: '5.14 days',
    delayRisk: '18.4%',
    riskLevel: 'HIGH' as RiskLevel,
    temp: '62°F (Optimal)',
    status: 'IN_TRANSIT (Simulated Telemetry Feed)',
    speed: 0.16,
    phase: 0.55
  },
  {
    id: 'TRK-89416',
    fleetName: 'Fleet Echo-9',
    trackingId: 'NC-89416',
    corridorId: 'RI-MIA',
    factoryName: 'Secret Factory',
    destName: 'Miami Gateway',
    sku: 'Everlasting Gobstopper Novelty (80 cases)',
    mode: 'Second Class',
    distance: 1240,
    predictedEta: '4.22 days',
    delayRisk: '12.0%',
    riskLevel: 'ELEVATED' as RiskLevel,
    temp: '66°F (Ambient Monitored)',
    status: 'IN_TRANSIT (Simulated Telemetry Feed)',
    speed: 0.19,
    phase: 0.12
  }
];

export interface SelectedEntity {
  type: 'factory' | 'truck' | 'route' | 'destination';
  id: string;
  name: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  origin?: string;
  destination?: string;
  shipMode?: string;
  distance?: number;
  products?: string[];
  shipmentCount?: number | string;
  leadTime?: string;
  efficiency?: string;
  predictedEta?: string;
  delayRisk?: string;
  riskLevel: RiskLevel;
  status?: string;
  cargoTemp?: string;
}
