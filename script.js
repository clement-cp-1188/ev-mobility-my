// script.js (FULL WORKING + OEM/LOCAL CATEGORY ADDED)
// - Adds "origin" + "manufacturingType" (Local OEM / Local Assembly/CKD / Importer/Distributor / Retailer/House brand / Shared Operator)
// - Shows these as badges on each brand card
// - Keeps your existing UI + filters working
// - Defensive: shows an on-page error panel if anything crashes

(function () {
  // ---------- On-page error panel ----------
  function showError(msg) {
    const panel = document.createElement("div");
    panel.style.cssText =
      "position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;" +
      "background:#2a0f14;border:1px solid #ff6b6b;color:#ffd0d0;" +
      "padding:12px 12px;border-radius:12px;font-family:ui-sans-serif,system-ui;" +
      "box-shadow:0 10px 30px rgba(0,0,0,.35);white-space:pre-wrap";
    panel.textContent = "❌ Website error:\n\n" + msg;
    document.body.appendChild(panel);
  }

  window.addEventListener("error", (e) => {
    showError(e.message + (e.filename ? `\n\nFile: ${e.filename}:${e.lineno}:${e.colno}` : ""));
  });

  window.addEventListener("unhandledrejection", (e) => {
    showError("Unhandled Promise Rejection:\n\n" + (e.reason?.stack || e.reason || e));
  });

  console.log("script.js loaded ✅");

  document.addEventListener("DOMContentLoaded", () => {
    try {
      // ---------- required DOM IDs ----------
      const REQUIRED_IDS = [
        "mode",
        "type",
        "q",
        "countPill",
        "brandLabel",
        "reset",
        "brandSort",
        "brandGrid",
        "tbody",
        "takeaways",
      ];
      const missing = REQUIRED_IDS.filter((id) => !document.getElementById(id));
      if (missing.length) {
        showError("Missing HTML IDs:\n- " + missing.join("\n- "));
        return;
      }

      // ============================================================
      // BRAND DIRECTORY (base objects)
      // ============================================================
      const BRANDS = [
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
            { t: "Battery swap", k: "good" },
            { t: "Ops discipline needed", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Confirm MY service points & swap locations." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "Confirm fleet usage clauses." },
          fleetPricingRM: { range: "RM250–400/month", notes: "Bundle dependent." },
          batteryModel: { type: "Swappable", notes: "Key for high-uptime fleets." },
          evidence: [],
          redFlags: ["If swap/service density is low, fleets will churn."],
          notes: "Strong commercial JV candidate.",
        },
        {
          name: "Treeletrik",
          category: "EV Motorcycle",
          focus: "Mass commuter + light commercial",
          jvScore: 70,
          roles: ["Local distributor", "Service network partner"],
          strengths: ["Local brand", "Potential stakeholder alignment"],
          gaps: ["Fleet ops maturity varies"],
          fitBadges: [
            { t: "Local presence", k: "good" },
            { t: "Value pricing", k: "good" },
            { t: "Dealer variance", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Dealer-led network; verify turnaround time." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "RM200–350/month", notes: "" },
          batteryModel: { type: "Fixed / charging-led", notes: "Confirm removability by SKU." },
          evidence: [],
          redFlags: ["Inconsistent dealer service breaks commercial SLAs."],
          notes: "Works if your JV enforces SLA & spares stock.",
        },
        {
          name: "Modenas",
          category: "E-Scooter",
          focus: "Malaysia OEM; delivery-capable scooters",
          jvScore: 76,
          roles: ["OEM / CKD partner", "Fleet anchor", "After-sales backbone"],
          strengths: ["Local OEM credibility", "Compliance pathway", "Parts ecosystem"],
          gaps: ["Fleet SLA discipline required"],
          fitBadges: [
            { t: "Local OEM", k: "good" },
            { t: "Delivery-oriented", k: "good" },
            { t: "SLA required", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Fill in dealer footprint by state." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "RM180–350/month", notes: "Model + bundle dependent." },
          batteryModel: { type: "Model dependent; some removable variants", notes: "" },
          evidence: [],
          redFlags: ["Slow parts turnaround = fleet downtime."],
          notes: "Strong MY JV anchor if ops KPIs are enforced.",
        },
        {
          name: "Yadea",
          category: "EV Motorcycle / E-Scooter / E-Bicycle",
          focus: "Mass-market, price-led",
          jvScore: 60,
          roles: ["Hardware supplier", "Distributor program partner"],
          strengths: ["Cost scale", "Wide SKU range"],
          gaps: ["Service quality varies by distributor"],
          fitBadges: [
            { t: "Cost scale", k: "good" },
            { t: "Ops-dependent", k: "warn" },
            { t: "Spec drift risk", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Distributor quality matters." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "Lock warranty + parts SLA for fleets." },
          fleetPricingRM: { range: "RM160–280/month", notes: "Beware price wars." },
          batteryModel: { type: "Mostly fixed (SKU dependent)", notes: "" },
          evidence: [],
          redFlags: ["Price wars + weak warranty can destroy margins."],
          notes: "Fleet use only with strict contract terms.",
        },
        {
          name: "NIU",
          category: "E-Scooter",
          focus: "Consumer-first; commercial possible with ops overlay",
          jvScore: 62,
          roles: ["Hardware supplier", "Retail + fleet program partner"],
          strengths: ["Brand recognition", "Telemetry DNA"],
          gaps: ["Dealer variation", "SLA not default"],
          fitBadges: [
            { t: "Brand recognition", k: "good" },
            { t: "Needs ops overlay", k: "warn" },
            { t: "Dealer variability", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Map service centers + parts lead time." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "RM180–300/month", notes: "" },
          batteryModel: { type: "Fixed / removable variants (SKU dependent)", notes: "" },
          evidence: [],
          redFlags: ["If data access is blocked, uptime ops will fail."],
          notes: "Good hardware; you must run fleet discipline.",
        },
        {
          name: "Ebixon (TAILG)",
          category: "EV Motorcycle / E-Scooter",
          focus: "China OEM with MY presence",
          jvScore: 63,
          roles: ["Hardware supplier", "Value fleet option"],
          strengths: ["Aggressive pricing", "Commercial SKUs possible"],
          gaps: ["Distributor quality critical"],
          fitBadges: [
            { t: "Value fleet", k: "good" },
            { t: "OEM scale", k: "good" },
            { t: "Distributor risk", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Confirm distributor SLA & spares policy." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "RM160–300/month", notes: "" },
          batteryModel: { type: "Fixed (common)", notes: "Confirm removable variants by SKU." },
          evidence: [],
          redFlags: ["If distributor is weak, warranty becomes a nightmare."],
          notes: "Good TCO if support is real.",
        },
        {
          name: "QJMOTOR",
          category: "EV Motorcycle / E-Scooter",
          focus: "MForce-backed brand; EV line growing",
          jvScore: 68,
          roles: ["Distributor JV", "OEM supplier"],
          strengths: ["Distributor strength", "Build quality"],
          gaps: ["EV portfolio maturing"],
          fitBadges: [
            { t: "Distributor strength", k: "good" },
            { t: "Mid-tier value", k: "good" },
            { t: "EV line evolving", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Confirm EV-specific spares & technicians." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "RM180–320/month", notes: "" },
          batteryModel: { type: "Fixed (common)", notes: "" },
          evidence: [],
          redFlags: ["EV spare parts readiness must be confirmed."],
          notes: "Solid option if EV after-sales is proven.",
        },
        {
          name: "BMW Motorrad (CE 04)",
          category: "E-Scooter",
          focus: "Premium urban EV scooter",
          jvScore: 40,
          roles: ["Retail only"],
          strengths: ["Premium brand", "Quality"],
          gaps: ["Not viable for delivery TCO"],
          fitBadges: [
            { t: "Premium", k: "good" },
            { t: "Not fleet", k: "bad" },
          ],
          serviceFootprint: { count: null, notes: "BMW Motorrad dealer network." },
          warranty: { battery: "OEM", motor: "OEM", controller: "OEM", notes: "" },
          fleetPricingRM: { range: "Not viable", notes: "" },
          batteryModel: { type: "Fixed", notes: "" },
          evidence: [],
          redFlags: ["Commercial economics won’t work."],
          notes: "Home/executive use only.",
        },
        {
          name: "Sur-Ron",
          category: "Electric Dirt Bike",
          focus: "Off-road / industrial / security niche",
          jvScore: 52,
          roles: ["Niche fleet supplier"],
          strengths: ["Rugged", "High torque"],
          gaps: ["Not road-focused"],
          fitBadges: [
            { t: "Rugged", k: "good" },
            { t: "Niche", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Specialist dealers; confirm parts." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "Project-based", notes: "" },
          batteryModel: { type: "Removable", notes: "" },
          evidence: [],
          redFlags: ["Road legality / regulation constraints."],
          notes: "Industrial/security niche only.",
        },
        {
          name: "Beam",
          category: "E-Bicycle (Shared)",
          focus: "Shared micromobility (campus/township/city)",
          jvScore: 72,
          roles: ["City ops partner", "Campus partner"],
          strengths: ["Ops discipline", "Gov relationships"],
          gaps: ["Not delivery rider model"],
          fitBadges: [
            { t: "Ops-strong", k: "good" },
            { t: "City/campus", k: "good" },
            { t: "Not delivery", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "List operating zones + maintenance model." },
          warranty: { battery: "N/A", motor: "N/A", controller: "N/A", notes: "" },
          fleetPricingRM: { range: "Shared model", notes: "" },
          batteryModel: { type: "Depot charging", notes: "" },
          evidence: [],
          redFlags: ["Wrong segment if your target is delivery."],
          notes: "Good for campuses/townships; ops benchmark.",
        },
        {
          name: "Fiido",
          category: "E-Bicycle",
          focus: "Utility/folding e-bikes; commercial only with service overlay",
          jvScore: 55,
          roles: ["Hardware supplier"],
          strengths: ["Affordable", "Compact"],
          gaps: ["Not SLA-ready by default"],
          fitBadges: [
            { t: "Affordable", k: "good" },
            { t: "Service overlay", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Depends on reseller; require spares stock." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "RM80–160/month", notes: "Light duty only." },
          batteryModel: { type: "Charging-led", notes: "" },
          evidence: [],
          redFlags: ["Heavy loads spike failures/warranty."],
          notes: "Home or staff mobility; light duty.",
        },
        {
          name: "Engwe",
          category: "E-Bicycle",
          focus: "Consumer utility e-bikes; MY availability via retailers",
          jvScore: 54,
          roles: ["Hardware supplier via retailers"],
          strengths: ["Low price utility SKUs"],
          gaps: ["Retail support only"],
          fitBadges: [
            { t: "Low cost", k: "good" },
            { t: "Retail-driven", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Verify seller warranty + spares." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "RM70–160/month", notes: "" },
          batteryModel: { type: "Charging-led (model dependent)", notes: "" },
          evidence: [],
          redFlags: ["Consumer retail support ≠ fleet uptime."],
          notes: "Mostly home use unless you run servicing.",
        },
        {
          name: "EFORGE",
          category: "E-Bicycle",
          focus: "Malaysia e-bike retailer / house brand",
          jvScore: 50,
          roles: ["Retail supplier"],
          strengths: ["Local retail support"],
          gaps: ["No fleet DNA"],
          fitBadges: [
            { t: "Local retail", k: "good" },
            { t: "Fleet weak", k: "bad" },
          ],
          serviceFootprint: { count: null, notes: "Confirm workshop + warranty process." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "Home use", notes: "" },
          batteryModel: { type: "Charging-led", notes: "" },
          evidence: [],
          redFlags: ["Not designed for SLA fleets."],
          notes: "Home/casual use.",
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
            { t: "Consumer", k: "good" },
            { t: "Fleet weak", k: "bad" },
          ],
          serviceFootprint: { count: null, notes: "Verify MY warranty/support source." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "Home use", notes: "" },
          batteryModel: { type: "Charging-led", notes: "" },
          evidence: [],
          redFlags: ["Not suitable for SLA fleets."],
          notes: "Personal mobility only.",
        },
        {
          name: "Eclimo",
          category: "EV Motorcycle",
          focus: "Malaysia-built electric motorcycles; pilot-friendly",
          jvScore: 60,
          roles: ["Local tech/vehicle partner", "Pilot fleet partner"],
          strengths: ["Local presence", "JV narrative"],
          gaps: ["Scale & service footprint must be proven"],
          fitBadges: [
            { t: "Local", k: "good" },
            { t: "Pilot-ready", k: "warn" },
          ],
          serviceFootprint: { count: null, notes: "Confirm operating states + workshop partners." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "RM220–380/month", notes: "" },
          batteryModel: { type: "Charging-led", notes: "" },
          evidence: [],
          redFlags: ["Support thin = fleet churn."],
          notes: "Local angle is strong, but ops must be real.",
        },
        {
          name: "Super Soco",
          category: "EV Motorcycle",
          focus: "Lifestyle/consumer EV motorcycles; MY distribution exists",
          jvScore: 42,
          roles: ["Retail distribution only"],
          strengths: ["Lifestyle appeal"],
          gaps: ["Not fleet/SLA by default"],
          fitBadges: [
            { t: "Lifestyle", k: "good" },
            { t: "Commercial weak", k: "bad" },
          ],
          serviceFootprint: { count: null, notes: "Verify MY distributor/service partners." },
          warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
          fleetPricingRM: { range: "Not recommended for fleets", notes: "" },
          batteryModel: { type: "Charging-led", notes: "" },
          evidence: [],
          redFlags: ["Retail-paced service hurts fleets."],
          notes: "Home use only; weak commercial JV base.",
        },
      ];

      // ============================================================
      // NEW: OEM / Local Manufacturing Metadata Layer
      // ============================================================
      // You can refine these as you do diligence. For now it’s a useful first-pass segmentation.
      const BRAND_META = {
        // Malaysia-local / local entity
        "Modenas": { origin: "Local (MY)", manufacturingType: "Local OEM" },
        "Eclimo": { origin: "Local (MY)", manufacturingType: "Local OEM" },
        "Treeletrik": { origin: "Local (MY)", manufacturingType: "Importer/Distributor" }, // update if proven CKD/assembly
        "EFORGE": { origin: "Local (MY)", manufacturingType: "Retailer/House brand" },

        // China-origin (typically distributed/imported into MY)
        "Yadea": { origin: "China", manufacturingType: "Importer/Distributor" },
        "NIU": { origin: "China", manufacturingType: "Importer/Distributor" },
        "Ebixon (TAILG)": { origin: "China", manufacturingType: "Importer/Distributor" },
        "QJMOTOR": { origin: "China", manufacturingType: "Importer/Distributor" },
        "Xiaomi HIMO": { origin: "China", manufacturingType: "Importer/Distributor" },
        "Engwe": { origin: "China", manufacturingType: "Importer/Distributor" },
        "Fiido": { origin: "China", manufacturingType: "Importer/Distributor" },
        "Super Soco": { origin: "China", manufacturingType: "Importer/Distributor" },
        "Sur-Ron": { origin: "China", manufacturingType: "Importer/Distributor" },

        // Europe-origin
        "BMW Motorrad (CE 04)": { origin: "Europe", manufacturingType: "Importer/Distributor" },

        // Others
        "Beam": { origin: "Other", manufacturingType: "Shared Operator" },
        "Blueshark": { origin: "Other", manufacturingType: "Importer/Distributor" }, // update if you confirm MY manufacturing/assembly
      };

      const BRANDS_ENRICHED = BRANDS.map((b) => ({
        ...b,
        ...(BRAND_META[b.name] || { origin: "Origin TBD", manufacturingType: "TBD" }),
      }));

      // ============================================================
      // COMPARISON TABLE (kept readable)
      // ============================================================
      const DATA = [
        {
          use: "Commercial",
          vehicleType: "EV Motorcycle",
          bestFor: "Delivery, fleets, couriers (high utilization)",
          speed: "60–90 km/h",
          payload: "High",
          dailyUsage: "80–150 km/day",
          batteryStrategy: "Swap / depot charging (best), or home charging for some SMEs",
          pricing: "Best as subscription/lease; outright later after service maturity",
          brands: ["Blueshark", "Treeletrik", "Yadea"],
        },
        {
          use: "Commercial",
          vehicleType: "E-Scooter",
          bestFor: "Urban commute fleets, light delivery, intra-city ops",
          speed: "40–60 km/h",
          payload: "Medium",
          dailyUsage: "40–80 km/day",
          batteryStrategy: "Charge (common); removable battery variants help depot ops",
          pricing: "Lease works; must control uptime + service",
          brands: ["Modenas", "NIU", "QJMOTOR"],
        },
        {
          use: "Commercial",
          vehicleType: "E-Bicycle",
          bestFor: "Campus/township fleets, last-mile in dense zones, municipal pilots",
          speed: "25–35 km/h",
          payload: "Low–Medium",
          dailyUsage: "20–50 km/day",
          batteryStrategy: "Charge only; depot charging is simplest",
          pricing: "Rental / managed fleet; low capex but lower income use-cases",
          brands: ["Beam", "Fiido", "EFORGE"],
        },
        {
          use: "Home",
          vehicleType: "EV Motorcycle",
          bestFor: "Commuting with motorcycle preference; occasional longer rides",
          speed: "60–90 km/h",
          payload: "High",
          dailyUsage: "10–60 km/day",
          batteryStrategy: "Home charging; swap is a bonus if available",
          pricing: "Outright purchase more common; financing helpful",
          brands: ["Blueshark", "Eclimo", "Super Soco"],
        },
        {
          use: "Home",
          vehicleType: "E-Scooter",
          bestFor: "Urban commute, short trips, easy ownership",
          speed: "40–60 km/h",
          payload: "Medium",
          dailyUsage: "10–40 km/day",
          batteryStrategy: "Home charging (easy)",
          pricing: "Outright purchase; simpler maintenance",
          brands: ["Modenas", "NIU", "Yadea"],
        },
        {
          use: "Home",
          vehicleType: "E-Bicycle",
          bestFor: "Lifestyle commuting, short-distance errands, fitness-friendly mobility",
          speed: "25–35 km/h",
          payload: "Low–Medium",
          dailyUsage: "5–30 km/day",
          batteryStrategy: "Home charging (very easy)",
          pricing: "Outright purchase common; lowest maintenance",
          brands: ["Fiido", "Engwe", "Xiaomi HIMO"],
        },
      ];

      const TAKEAWAYS = {
        all: [
          "Commercial success is driven by uptime, service, and financing more than specs.",
          "E-bikes are a complement (campus/last-mile), not a replacement for delivery motorcycles.",
          "Outright sales work best after you’ve proven operations and parts availability.",
        ],
        commercial: [
          "Fleet-first is usually the fastest route to real utilization and learning.",
          "Battery strategy (swap vs depot vs charge) must be decided upfront.",
          "A mediocre vehicle + excellent ops beats a great vehicle + weak ops.",
        ],
        home: [
          "Home charging simplicity is why e-bikes and e-scooters are easiest to adopt.",
          "EV motorcycles need good service support to avoid ownership friction.",
          "Financing can expand the addressable home segment significantly.",
        ],
      };

      // ============================================================
      // UI / STATE
      // ============================================================
      const state = { mode: "all", type: "all", q: "", brand: "all", brandSort: "score" };

      const els = {
        mode: document.getElementById("mode"),
        type: document.getElementById("type"),
        q: document.getElementById("q"),
        tbody: document.getElementById("tbody"),
        countPill: document.getElementById("countPill"),
        reset: document.getElementById("reset"),
        takeaways: document.getElementById("takeaways"),
        brandGrid: document.getElementById("brandGrid"),
        brandSort: document.getElementById("brandSort"),
        brandLabel: document.getElementById("brandLabel"),
      };

      function escapeHtml(s) {
        return String(s ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }

      function badge(text, kind) {
        const k = kind ? ` ${kind}` : "";
        return `<span class="badge${k}">${escapeHtml(text)}</span>`;
      }

      function scoreColor(score) {
        if (score >= 75) return "var(--good)";
        if (score >= 55) return "var(--warn)";
        return "var(--bad)";
      }

      function brandMatchesGlobalFilters(b) {
        // Vehicle type filter: allow contains (brand can be multi-category)
        const typeOk = state.type === "all" || (b.category || "").includes(state.type);

        const q = state.q.trim().toLowerCase();
        const hay = [
          b.name,
          b.category,
          b.focus,
          b.origin,
          b.manufacturingType,
          (b.roles || []).join(" "),
          (b.strengths || []).join(" "),
          (b.gaps || []).join(" "),
          JSON.stringify(b.serviceFootprint || {}),
          JSON.stringify(b.warranty || {}),
          JSON.stringify(b.fleetPricingRM || {}),
          JSON.stringify(b.batteryModel || {}),
        ]
          .join(" ")
          .toLowerCase();

        const qOk = !q || hay.includes(q);
        return typeOk && qOk;
      }

      function rowMatches(row) {
        const modeOk = state.mode === "all" || row.use.toLowerCase() === state.mode;
        const typeOk = state.type === "all" || row.vehicleType === state.type;
        const brandOk = state.brand === "all" || row.brands.includes(state.brand);

        const q = state.q.trim().toLowerCase();
        const hay = [
          row.use,
          row.vehicleType,
          row.bestFor,
          row.speed,
          row.payload,
          row.dailyUsage,
          row.batteryStrategy,
          row.pricing,
          row.brands.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        const qOk = !q || hay.includes(q);
        return modeOk && typeOk && brandOk && qOk;
      }

      function sortedBrands(list) {
        const filtered = list.filter(brandMatchesGlobalFilters);
        if (state.brandSort === "name") return filtered.sort((a, b) => a.name.localeCompare(b.name));
        return filtered.sort((a, b) => (b.jvScore ?? 0) - (a.jvScore ?? 0));
      }

      function renderTakeaways() {
        const items = TAKEAWAYS[state.mode] || TAKEAWAYS.all;
        els.takeaways.innerHTML = items.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
      }

      function renderTable() {
        const rows = DATA.filter(rowMatches);
        els.tbody.innerHTML = rows
          .map(
            (r) => `
          <tr>
            <td>${badge(r.use)}</td>
            <td><b>${escapeHtml(r.vehicleType)}</b></td>
            <td>${escapeHtml(r.bestFor)}</td>
            <td>${escapeHtml(r.speed)}</td>
            <td>${escapeHtml(r.payload)}</td>
            <td>${escapeHtml(r.dailyUsage)}</td>
            <td>${escapeHtml(r.batteryStrategy)}</td>
            <td>${escapeHtml(r.pricing)}</td>
            <td>${r.brands.map((b) => badge(b, state.brand === b ? "good" : "")).join(" ")}</td>
          </tr>
        `
          )
          .join("");

        els.countPill.textContent = `${rows.length} result${rows.length === 1 ? "" : "s"}`;
      }

      function renderBrands() {
        const list = sortedBrands([...BRANDS_ENRICHED]);

        els.brandGrid.innerHTML = list
          .map((b) => {
            const active = state.brand === b.name ? "active" : "";
            const col = scoreColor(b.jvScore ?? 0);
            const fillW = Math.max(0, Math.min(100, b.jvScore ?? 0));

            return `
            <div class="brandCard ${active}" data-brand="${escapeHtml(b.name)}">
              <div class="brandTop">
                <div>
                  <div class="brandName">${escapeHtml(b.name)}</div>
                  <div class="brandMeta">${escapeHtml(b.category)} • ${escapeHtml(b.focus)}</div>
                </div>
                <div class="score">
                  <div class="scoreNum">${escapeHtml(b.jvScore ?? 0)}</div>
                  <div class="scoreBar">
                    <div class="scoreFill" style="width:${fillW}%; background:${col};"></div>
                  </div>
                </div>
              </div>

              <!-- NEW: Manufacturing badges -->
              <div class="badges">
                ${badge(b.manufacturingType || "TBD", "info")}
                ${badge(b.origin || "Origin TBD", "info")}
                ${(b.fitBadges || []).slice(0, 4).map((x) => badge(x.t, x.k)).join("")}
              </div>

              <div class="smallText">
                <div><b>JV roles:</b> ${escapeHtml((b.roles || []).join(", "))}</div>
                <div style="margin-top:6px"><b>Strengths:</b> ${escapeHtml((b.strengths || []).slice(0, 2).join(" • "))}</div>
                <div style="margin-top:6px"><b>Gaps:</b> ${escapeHtml((b.gaps || []).slice(0, 2).join(" • "))}</div>
              </div>

              <div class="details">
                <div class="kv">
                  <div class="k">Service footprint</div>
                  <div class="v">${b.serviceFootprint?.count == null ? "TBD" : escapeHtml(b.serviceFootprint.count)}
                    <span>${b.serviceFootprint?.notes ? "• " + escapeHtml(b.serviceFootprint.notes) : ""}</span>
                  </div>

                  <div class="k">Fleet pricing</div>
                  <div class="v">${escapeHtml(b.fleetPricingRM?.range || "TBD")}
                    <span>${b.fleetPricingRM?.notes ? "• " + escapeHtml(b.fleetPricingRM.notes) : ""}</span>
                  </div>

                  <div class="k">Battery model</div>
                  <div class="v">${escapeHtml(b.batteryModel?.type || "TBD")}
                    <span>${b.batteryModel?.notes ? "• " + escapeHtml(b.batteryModel.notes) : ""}</span>
                  </div>

                  <div class="k">Warranty</div>
                  <div class="v">
                    Battery: ${escapeHtml(b.warranty?.battery || "TBD")} • Motor: ${escapeHtml(b.warranty?.motor || "TBD")} • Controller: ${escapeHtml(b.warranty?.controller || "TBD")}
                    <span>${b.warranty?.notes ? "• " + escapeHtml(b.warranty.notes) : ""}</span>
                  </div>
                </div>
              </div>

              <div class="expandRow">
                <span class="brandMeta">Click card = filter table by brand</span>
                <button class="expandBtn" data-expand="1" type="button">Expand</button>
              </div>
            </div>
          `;
          })
          .join("");

        els.brandLabel.textContent = state.brand === "all" ? "All" : state.brand;
      }

      function setActive(container, attr, value) {
        [...container.querySelectorAll("button")].forEach((btn) => {
          btn.classList.toggle("active", btn.getAttribute(attr) === value);
        });
      }

      function setMode(mode) {
        state.mode = mode;
        setActive(els.mode, "data-mode", mode);
        renderTakeaways();
        renderBrands();
        renderTable();
      }

      function setType(type) {
        state.type = type;
        setActive(els.type, "data-type", type);
        renderBrands();
        renderTable();
      }

      function setBrand(brand) {
        state.brand = brand;
        renderBrands();
        renderTable();
      }

      function resetAll() {
        state.mode = "all";
        state.type = "all";
        state.q = "";
        state.brand = "all";
        state.brandSort = "score";

        els.q.value = "";
        els.brandSort.value = "score";

        setActive(els.mode, "data-mode", "all");
        setActive(els.type, "data-type", "all");

        renderTakeaways();
        renderBrands();
        renderTable();
      }

      // ============================================================
      // EVENTS
      // ============================================================
      els.mode.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        setMode(btn.dataset.mode);
      });

      els.type.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        setType(btn.dataset.type);
      });

      els.q.addEventListener("input", (e) => {
        state.q = e.target.value;
        renderBrands();
        renderTable();
      });

      els.brandSort.addEventListener("change", (e) => {
        state.brandSort = e.target.value;
        renderBrands();
      });

      els.brandGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".brandCard");
        if (!card) return;

        const expandBtn = e.target.closest("button[data-expand='1']");
        if (expandBtn) {
          e.stopPropagation();
          card.classList.toggle("expanded");
          expandBtn.textContent = card.classList.contains("expanded") ? "Collapse" : "Expand";
          return;
        }

        const b = card.dataset.brand;
        setBrand(state.brand === b ? "all" : b);
      });

      els.reset.addEventListener("click", resetAll);

      // ============================================================
      // INIT
      // ============================================================
      resetAll();
    } catch (err) {
      showError(err.stack || String(err));
    }
  });
})();
