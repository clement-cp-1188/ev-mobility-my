// script.js
// Malaysia Electric Mobility — FULL BRAND LANDSCAPE (Commercial + Home)
// Includes ALL Malaysia-present brands discussed

// ============================================================
// BRAND DIRECTORY (JV viability lens)
// ============================================================

const BRANDS = [
  // ================= CORE COMMERCIAL =================
  {
    name: "Blueshark",
    category: "EV Motorcycle",
    focus: "Commercial-first (delivery/fleet oriented)",
    jvScore: 82,
    roles: ["Fleet ops partner", "Swap ecosystem partner"],
    strengths: ["Commercial design", "Battery swapping", "Fleet uptime focus"],
    gaps: ["Scaling early", "Higher capex"],
    fitBadges: [
      { t: "Fleet-ready", k: "good" },
      { t: "Battery swap", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "Confirm MY service points & swap locations." },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "Confirm fleet usage clauses." },
    fleetPricingRM: { range: "RM250–400/month", notes: "Subscription model." },
    batteryModel: { type: "Swappable", notes: "Critical differentiator for fleets." },
    evidence: [],
    redFlags: ["Needs strong ops partner to scale"],
    notes: "Top-tier commercial JV candidate."
  },

  {
    name: "Treeletrik",
    category: "EV Motorcycle",
    focus: "Mass commuter + light commercial",
    jvScore: 70,
    roles: ["Local distributor", "Service network partner"],
    strengths: ["Local brand", "Government alignment"],
    gaps: ["Fleet ops maturity"],
    fitBadges: [
      { t: "Local", k: "good" },
      { t: "Value pricing", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "Dealer-led network." },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "RM200–350/month", notes: "" },
    batteryModel: { type: "Fixed", notes: "" },
    evidence: [],
    redFlags: ["Dealer service inconsistency"],
    notes: "Works if JV enforces SLA."
  },

  {
    name: "Modenas",
    category: "E-Scooter",
    focus: "Malaysia OEM, delivery-capable scooters",
    jvScore: 76,
    roles: ["OEM partner", "Fleet anchor"],
    strengths: ["Local OEM", "Compliance-ready", "Parts ecosystem"],
    gaps: ["Needs fleet SLA discipline"],
    fitBadges: [
      { t: "OEM", k: "good" },
      { t: "Delivery-ready", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "Nationwide dealer network." },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "RM180–350/month", notes: "" },
    batteryModel: { type: "Removable (model dependent)", notes: "" },
    evidence: [],
    redFlags: ["Slow parts = downtime"],
    notes: "Very strong MY JV anchor."
  },

  // ================= MASS IMPORT / CHINA =================
  {
    name: "Yadea",
    category: "EV Motorcycle / E-Scooter / E-Bicycle",
    focus: "Mass-market, price-led",
    jvScore: 60,
    roles: ["Hardware supplier"],
    strengths: ["Cost scale", "Wide SKU range"],
    gaps: ["Service quality varies"],
    fitBadges: [
      { t: "Low cost", k: "good" },
      { t: "Ops risk", k: "warn" }
    ],
    serviceFootprint: { count: null, notes: "" },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "RM160–280/month", notes: "" },
    batteryModel: { type: "Fixed", notes: "" },
    evidence: [],
    redFlags: ["Price wars destroy margins"],
    notes: "Only works with strict contract control."
  },

  {
    name: "NIU",
    category: "E-Scooter",
    focus: "Consumer-first, fleet overlay possible",
    jvScore: 62,
    roles: ["Hardware supplier"],
    strengths: ["Smart app", "Brand recognition"],
    gaps: ["Dealer variability"],
    fitBadges: [
      { t: "Smart tech", k: "good" },
      { t: "Needs ops overlay", k: "warn" }
    ],
    serviceFootprint: { count: null, notes: "" },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "RM180–300/month", notes: "" },
    batteryModel: { type: "Fixed / removable variants", notes: "" },
    evidence: [],
    redFlags: ["Data access must be guaranteed"],
    notes: "JV only if ops owned by you."
  },

  {
    name: "Ebixon (TAILG)",
    category: "EV Motorcycle / E-Scooter",
    focus: "China OEM with MY presence",
    jvScore: 63,
    roles: ["Hardware supplier", "Value fleet option"],
    strengths: ["Aggressive pricing", "Commercial SKUs"],
    gaps: ["Brand recognition"],
    fitBadges: [
      { t: "Value fleet", k: "good" },
      { t: "OEM scale", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "Confirm distributor capability." },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "RM160–300/month", notes: "" },
    batteryModel: { type: "Fixed", notes: "" },
    evidence: [],
    redFlags: ["Distributor quality critical"],
    notes: "Good price–performance option."
  },

  {
    name: "QJMOTOR",
    category: "EV Motorcycle / E-Scooter",
    focus: "MForce-backed China OEM",
    jvScore: 68,
    roles: ["OEM supplier", "Distributor JV"],
    strengths: ["Strong MY distributor", "Good build quality"],
    gaps: ["EV portfolio still growing"],
    fitBadges: [
      { t: "Strong distributor", k: "good" },
      { t: "Growing EV line", k: "warn" }
    ],
    serviceFootprint: { count: null, notes: "Via MForce dealer network." },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "RM180–320/month", notes: "" },
    batteryModel: { type: "Fixed", notes: "" },
    evidence: [],
    redFlags: ["Ensure EV-specific spare parts"],
    notes: "Solid mid-tier JV option."
  },

  // ================= PREMIUM / NICHE =================
  {
    name: "BMW Motorrad (CE 04)",
    category: "E-Scooter",
    focus: "Premium urban electric scooter",
    jvScore: 40,
    roles: ["Retail only"],
    strengths: ["Premium brand", "Build quality"],
    gaps: ["Too expensive for fleets"],
    fitBadges: [
      { t: "Premium", k: "good" },
      { t: "Not fleet", k: "bad" }
    ],
    serviceFootprint: { count: null, notes: "BMW Motorrad MY." },
    warranty: { battery: "OEM", motor: "OEM", controller: "OEM", notes: "" },
    fleetPricingRM: { range: "Not viable", notes: "" },
    batteryModel: { type: "Fixed", notes: "" },
    evidence: [],
    redFlags: ["TCO unsuitable for delivery"],
    notes: "Home / executive use only."
  },

  {
    name: "Sur-Ron",
    category: "Electric Dirt Bike",
    focus: "Off-road / industrial / security",
    jvScore: 52,
    roles: ["Niche fleet supplier"],
    strengths: ["High torque", "Rugged"],
    gaps: ["Not road-focused"],
    fitBadges: [
      { t: "Rugged", k: "good" },
      { t: "Niche", k: "warn" }
    ],
    serviceFootprint: { count: null, notes: "Specialist dealers." },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "Project-based", notes: "" },
    batteryModel: { type: "Removable", notes: "" },
    evidence: [],
    redFlags: ["Regulatory limitations"],
    notes: "Security / plantation / industrial only."
  },

  // ================= E-BICYCLES =================
  {
    name: "Beam",
    category: "E-Bicycle (Shared)",
    focus: "Shared micromobility",
    jvScore: 72,
    roles: ["City partner"],
    strengths: ["Ops excellence", "Gov relationships"],
    gaps: ["Not delivery"],
    fitBadges: [
      { t: "Ops strong", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "" },
    warranty: { battery: "N/A", motor: "N/A", controller: "N/A", notes: "" },
    fleetPricingRM: { range: "Shared revenue model", notes: "" },
    batteryModel: { type: "Depot charging", notes: "" },
    evidence: [],
    redFlags: [],
    notes: "Campus & township only."
  },

  {
    name: "Fiido",
    category: "E-Bicycle",
    focus: "Utility / folding",
    jvScore: 55,
    roles: ["Hardware supplier"],
    strengths: ["Affordable", "Compact"],
    gaps: ["Not SLA-ready"],
    fitBadges: [
      { t: "Affordable", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "" },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "RM80–160/month", notes: "" },
    batteryModel: { type: "Charging-led", notes: "" },
    evidence: [],
    redFlags: [],
    notes: "Light-duty only."
  },

  {
    name: "Engwe",
    category: "E-Bicycle",
    focus: "Consumer utility",
    jvScore: 54,
    roles: ["Hardware supplier"],
    strengths: ["Low price"],
    gaps: ["Retail support only"],
    fitBadges: [
      { t: "Low cost", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "" },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "RM70–160/month", notes: "" },
    batteryModel: { type: "Charging-led", notes: "" },
    evidence: [],
    redFlags: [],
    notes: "Home or staff mobility."
  },

  {
    name: "EFORGE",
    category: "E-Bicycle",
    focus: "Malaysia retailer / house brand",
    jvScore: 50,
    roles: ["Retail supplier"],
    strengths: ["Local retail support"],
    gaps: ["No fleet DNA"],
    fitBadges: [
      { t: "Local retail", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "" },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "Home use", notes: "" },
    batteryModel: { type: "Charging-led", notes: "" },
    evidence: [],
    redFlags: [],
    notes: "Home use focus."
  },

  {
    name: "Xiaomi HIMO",
    category: "E-Bicycle",
    focus: "Consumer e-bike",
    jvScore: 48,
    roles: ["Retail product"],
    strengths: ["Brand recognition"],
    gaps: ["No fleet support"],
    fitBadges: [
      { t: "Consumer", k: "good" }
    ],
    serviceFootprint: { count: null, notes: "" },
    warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
    fleetPricingRM: { range: "Home use", notes: "" },
    batteryModel: { type: "Charging-led", notes: "" },
    evidence: [],
    redFlags: [],
    notes: "Personal mobility only."
  }
];

// ============================================================
// COMPARISON TABLE (kept clean)
// ============================================================
const DATA = [
  { use:"Commercial", vehicleType:"EV Motorcycle", bestFor:"Delivery fleets", speed:"60–90 km/h", payload:"High", dailyUsage:"80–150 km/day", batteryStrategy:"Swap / depot charging", pricing:"Subscription / lease", brands:["Blueshark","Treeletrik","Yadea"] },
  { use:"Commercial", vehicleType:"E-Scooter", bestFor:"Urban delivery", speed:"40–60 km/h", payload:"Medium", dailyUsage:"40–80 km/day", batteryStrategy:"Charging", pricing:"Lease", brands:["Modenas","NIU","QJMOTOR"] },
  { use:"Commercial", vehicleType:"E-Bicycle", bestFor:"Campus / township", speed:"25–35 km/h", payload:"Low", dailyUsage:"20–50 km/day", batteryStrategy:"Charging", pricing:"Rental", brands:["Beam","Fiido","EFORGE"] },
  { use:"Home", vehicleType:"EV Motorcycle", bestFor:"Personal commute", speed:"60–90 km/h", payload:"High", dailyUsage:"10–60 km/day", batteryStrategy:"Home charging", pricing:"Outright", brands:["Blueshark","Eclimo","Super Soco"] },
  { use:"Home", vehicleType:"E-Scooter", bestFor:"Urban home use", speed:"40–60 km/h", payload:"Medium", dailyUsage:"10–40 km/day", batteryStrategy:"Home charging", pricing:"Outright", brands:["Modenas","NIU","Yadea"] },
  { use:"Home", vehicleType:"E-Bicycle", bestFor:"Lifestyle commute", speed:"25–35 km/h", payload:"Low", dailyUsage:"5–30 km/day", batteryStrategy:"Home charging", pricing:"Outright", brands:["Fiido","Engwe","Xiaomi HIMO"] }
];

// (Rendering + filtering logic remains exactly the same as your current version)
