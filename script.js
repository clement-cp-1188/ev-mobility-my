// script.js
// Full working interactive page + OEM/local manufactured category
// - Adds manufacturingType + origin via BRAND_META enrichment
// - Adds manufacturing filter dropdown (mfgFilter)
// - Click brand card filters table; Expand button toggles details
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

  // ---------- Data ----------
  const BRANDS = [
    // EV / scooters / bikes available in Malaysia (starter set; expand as you like)
    {
      name: "Blueshark",
      category: "EV Motorcycle",
      focus: "Commercial-first (delivery/fleet oriented)",
      jvScore: 82,
      roles: ["Fleet ops partner", "Swap ecosystem partner"],
      strengths: ["Commercial design", "Battery swapping", "Uptime narrative"],
      gaps: ["Scaling early", "Capex higher"],
      fitBadges: [{ t: "Fleet-ready", k: "good" }, { t: "Swap", k: "good" }, { t: "Ops needed", k: "warn" }],
      serviceFootprint: { count: null, notes: "Confirm MY service points & swap locations." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "Confirm commercial-use clauses." },
      fleetPricingRM: { range: "RM250–400/month", notes: "Bundle dependent." },
      batteryModel: { type: "Swappable", notes: "Key for high-uptime fleets." },
      notes: "Best for pilots where downtime is measurable."
    },
    {
      name: "Modenas",
      category: "E-Scooter",
      focus: "Malaysia OEM; delivery-capable scooters",
      jvScore: 76,
      roles: ["OEM/CKD partner", "Fleet anchor", "After-sales backbone"],
      strengths: ["Local OEM credibility", "Parts ecosystem", "Compliance pathway"],
      gaps: ["Fleet SLA discipline still required"],
      fitBadges: [{ t: "Local OEM", k: "good" }, { t: "Delivery", k: "good" }, { t: "SLA required", k: "warn" }],
      serviceFootprint: { count: null, notes: "Fill in dealer footprint by state." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "RM180–350/month", notes: "Model + bundle dependent." },
      batteryModel: { type: "Model dependent", notes: "Confirm removable battery by SKU." },
      notes: "Strong MY JV anchor if ops KPIs are enforced."
    },
    {
      name: "Treeletrik",
      category: "EV Motorcycle",
      focus: "Mass commuter + light commercial",
      jvScore: 70,
      roles: ["Local distributor", "Service network partner"],
      strengths: ["Local brand presence", "Value pricing potential"],
      gaps: ["Fleet ops maturity varies"],
      fitBadges: [{ t: "Local presence", k: "good" }, { t: "Value", k: "good" }, { t: "Dealer variance", k: "warn" }],
      serviceFootprint: { count: null, notes: "Dealer-led network; verify turnaround time." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "RM200–350/month", notes: "" },
      batteryModel: { type: "Charging-led (common)", notes: "" },
      notes: "Good if your JV imposes service KPIs."
    },
    {
      name: "Yadea",
      category: "EV Motorcycle / E-Scooter / E-Bicycle",
      focus: "Mass-market, price-led",
      jvScore: 60,
      roles: ["Hardware supplier", "Distributor program partner"],
      strengths: ["Cost scale", "Broad SKU range"],
      gaps: ["Service quality varies by distributor"],
      fitBadges: [{ t: "Cost scale", k: "good" }, { t: "Ops-dependent", k: "warn" }],
      serviceFootprint: { count: null, notes: "Distributor quality matters." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "Lock parts SLA for fleets." },
      fleetPricingRM: { range: "RM160–280/month", notes: "Beware price wars." },
      batteryModel: { type: "SKU dependent", notes: "" },
      notes: "Fleet use only with strict contract terms."
    },
    {
      name: "NIU",
      category: "E-Scooter",
      focus: "Consumer-first; commercial possible with ops overlay",
      jvScore: 62,
      roles: ["Hardware supplier", "Retail + fleet program partner"],
      strengths: ["Brand recognition", "Telemetry/app DNA"],
      gaps: ["SLA not default"],
      fitBadges: [{ t: "Brand", k: "good" }, { t: "Ops overlay", k: "warn" }],
      serviceFootprint: { count: null, notes: "Map service centers + parts lead time." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "RM180–300/month", notes: "" },
      batteryModel: { type: "SKU dependent", notes: "" },
      notes: "Works if YOU own uptime ops."
    },
    {
      name: "QJMOTOR",
      category: "EV Motorcycle / E-Scooter",
      focus: "MForce-backed brand; EV line growing",
      jvScore: 68,
      roles: ["Distributor JV", "OEM supplier"],
      strengths: ["Distributor strength", "Build quality"],
      gaps: ["EV portfolio maturing"],
      fitBadges: [{ t: "Distributor strength", k: "good" }, { t: "EV line evolving", k: "warn" }],
      serviceFootprint: { count: null, notes: "Confirm EV-specific spares & technicians." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "RM180–320/month", notes: "" },
      batteryModel: { type: "Fixed (common)", notes: "" },
      notes: "Solid option if after-sales is proven."
    },
    {
      name: "Ebixon (TAILG)",
      category: "EV Motorcycle / E-Scooter",
      focus: "China OEM with MY presence",
      jvScore: 63,
      roles: ["Hardware supplier", "Value fleet option"],
      strengths: ["Aggressive pricing", "Commercial SKUs possible"],
      gaps: ["Distributor quality critical"],
      fitBadges: [{ t: "Value fleet", k: "good" }, { t: "Distributor risk", k: "warn" }],
      serviceFootprint: { count: null, notes: "Confirm distributor SLA & spares policy." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "RM160–300/month", notes: "" },
      batteryModel: { type: "Fixed (common)", notes: "" },
      notes: "Good TCO if support is real."
    },
    {
      name: "BMW Motorrad (CE 04)",
      category: "E-Scooter",
      focus: "Premium urban EV scooter",
      jvScore: 40,
      roles: ["Retail only"],
      strengths: ["Premium brand", "Quality"],
      gaps: ["Not viable delivery TCO"],
      fitBadges: [{ t: "Premium", k: "good" }, { t: "Not fleet", k: "bad" }],
      serviceFootprint: { count: null, notes: "BMW Motorrad dealer network." },
      warranty: { battery: "OEM", motor: "OEM", controller: "OEM", notes: "" },
      fleetPricingRM: { range: "Not viable", notes: "" },
      batteryModel: { type: "Fixed", notes: "" },
      notes: "Home/executive use only."
    },
    {
      name: "Sur-Ron",
      category: "Electric Dirt Bike",
      focus: "Off-road / industrial / security niche",
      jvScore: 52,
      roles: ["Niche fleet supplier"],
      strengths: ["Rugged", "High torque"],
      gaps: ["Not road-focused"],
      fitBadges: [{ t: "Rugged", k: "good" }, { t: "Niche", k: "warn" }],
      serviceFootprint: { count: null, notes: "Specialist dealers; confirm parts." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "Project-based", notes: "" },
      batteryModel: { type: "Removable", notes: "" },
      notes: "Industrial/security niche only."
    },
    {
      name: "Beam",
      category: "E-Bicycle (Shared)",
      focus: "Shared micromobility (campus/township/city)",
      jvScore: 72,
      roles: ["City ops partner", "Campus partner"],
      strengths: ["Ops discipline", "Gov relationships"],
      gaps: ["Not delivery rider model"],
      fitBadges: [{ t: "Ops-strong", k: "good" }, { t: "Not delivery", k: "warn" }],
      serviceFootprint: { count: null, notes: "List operating zones + maintenance model." },
      warranty: { battery: "N/A", motor: "N/A", controller: "N/A", notes: "" },
      fleetPricingRM: { range: "Shared model", notes: "" },
      batteryModel: { type: "Depot charging", notes: "" },
      notes: "Great for campuses/townships; ops benchmark."
    },
    {
      name: "Eclimo",
      category: "EV Motorcycle",
      focus: "Malaysia-built electric motorcycles; pilot-friendly",
      jvScore: 60,
      roles: ["Local tech/vehicle partner", "Pilot fleet partner"],
      strengths: ["Local presence", "JV narrative"],
      gaps: ["Scale & service footprint must be proven"],
      fitBadges: [{ t: "Local", k: "good" }, { t: "Pilot-ready", k: "warn" }],
      serviceFootprint: { count: null, notes: "Confirm operating states + workshop partners." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "RM220–380/month", notes: "" },
      batteryModel: { type: "Charging-led", notes: "" },
      notes: "Local angle is strong, but ops must be real."
    },
    {
      name: "Super Soco",
      category: "EV Motorcycle",
      focus: "Lifestyle/consumer EV motorcycles; MY distribution exists",
      jvScore: 42,
      roles: ["Retail distribution only"],
      strengths: ["Lifestyle appeal"],
      gaps: ["Not fleet/SLA by default"],
      fitBadges: [{ t: "Lifestyle", k: "good" }, { t: "Commercial weak", k: "bad" }],
      serviceFootprint: { count: null, notes: "Verify MY distributor/service partners." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "Not recommended for fleets", notes: "" },
      batteryModel: { type: "Charging-led", notes: "" },
      notes: "Home use only; weak commercial JV base."
    },
    {
      name: "Fiido",
      category: "E-Bicycle",
      focus: "Utility/folding e-bikes; commercial only with service overlay",
      jvScore: 55,
      roles: ["Hardware supplier"],
      strengths: ["Affordable", "Compact"],
      gaps: ["Not SLA-ready by default"],
      fitBadges: [{ t: "Affordable", k: "good" }, { t: "Service overlay", k: "warn" }],
      serviceFootprint: { count: null, notes: "Depends on reseller; require spares stock." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "RM80–160/month", notes: "Light duty only." },
      batteryModel: { type: "Charging-led", notes: "" },
      notes: "Home or staff mobility; light duty."
    },
    {
      name: "Engwe",
      category: "E-Bicycle",
      focus: "Consumer utility e-bikes; MY availability via retailers",
      jvScore: 54,
      roles: ["Hardware supplier via retailers"],
      strengths: ["Low price utility SKUs"],
      gaps: ["Retail support only"],
      fitBadges: [{ t: "Low cost", k: "good" }, { t: "Retail-driven", k: "warn" }],
      serviceFootprint: { count: null, notes: "Verify seller warranty + spares." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "RM70–160/month", notes: "" },
      batteryModel: { type: "Charging-led (model dependent)", notes: "" },
      notes: "Mostly home use unless you run servicing."
    },
    {
      name: "EFORGE",
      category: "E-Bicycle",
      focus: "Malaysia e-bike retailer / house brand",
      jvScore: 50,
      roles: ["Retail supplier"],
      strengths: ["Local retail support"],
      gaps: ["No fleet DNA"],
      fitBadges: [{ t: "Local retail", k: "good" }, { t: "Fleet weak", k: "bad" }],
      serviceFootprint: { count: null, notes: "Confirm workshop + warranty process." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "Home use", notes: "" },
      batteryModel: { type: "Charging-led", notes: "" },
      notes: "Home/casual use."
    },
    {
      name: "Xiaomi HIMO",
      category: "E-Bicycle",
      focus: "Consumer e-bike",
      jvScore: 48,
      roles: ["Retail product"],
      strengths: ["Brand recognition"],
      gaps: ["No fleet support"],
      fitBadges: [{ t: "Consumer", k: "good" }, { t: "Fleet weak", k: "bad" }],
      serviceFootprint: { count: null, notes: "Verify MY warranty/support source." },
      warranty: { battery: "TBD", motor: "TBD", controller: "TBD", notes: "" },
      fleetPricingRM: { range: "Home use", notes: "" },
      batteryModel: { type: "Charging-led", notes: "" },
      notes: "Personal mobility only."
    }
  ];

  // Manufacturing / OEM category mapping (edit as diligence confirms)
  const BRAND_META = {
    "Modenas": { origin: "Local (MY)", manufacturingType: "Local OEM" },
    "Eclimo": { origin: "Local (MY)", manufacturingType: "Local OEM" },
    "Treeletrik": { origin: "Local (MY)", manufacturingType: "Importer/Distributor" }, // change if CKD confirmed
    "EFORGE": { origin: "Local (MY)", manufacturingType: "Retailer/House brand" },

    "Yadea": { origin: "China", manufacturingType: "Importer/Distributor" },
    "NIU": { origin: "China", manufacturingType: "Importer/Distributor" },
    "QJMOTOR": { origin: "China", manufacturingType: "Importer/Distributor" },
    "Ebixon (TAILG)": { origin: "China", manufacturingType: "Importer/Distributor" },
    "Xiaomi HIMO": { origin: "China", manufacturingType: "Importer/Distributor" },
    "Engwe": { origin: "China", manufacturingType: "Importer/Distributor" },
    "Fiido": { origin: "China", manufacturingType: "Importer/Distributor" },
    "Super Soco": { origin: "China", manufacturingType: "Importer/Distributor" },
    "Sur-Ron": { origin: "China", manufacturingType: "Importer/Distributor" },

    "BMW Motorrad (CE 04)": { origin: "Europe", manufacturingType: "Importer/Distributor" },

    "Beam": { origin: "Other", manufacturingType: "Shared Operator" },
    "Blueshark": { origin: "Other", manufacturingType: "Importer/Distributor" }
  };

  const BRANDS_ENRICHED = BRANDS.map(b => ({
    ...b,
    ...(BRAND_META[b.name] || { origin: "Origin TBD", manufacturingType: "TBD" })
  }));

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
      bestFor: "Campus/township fleets, municipal pilots, controlled environments",
      speed: "25–35 km/h",
      payload: "Low–Medium",
      dailyUsage: "20–50 km/day",
      batteryStrategy: "Depot charging is simplest",
      pricing: "Managed fleet / rental",
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
      bestFor: "Lifestyle commuting, short-distance errands",
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
      "OEM/local matters for parts, compliance, and scaling—but ops still wins.",
      "Outright sales work best after service and spares are stable.",
    ],
    commercial: [
      "Fleet-first is the fastest route to real utilization and learning.",
      "Battery strategy (swap vs depot vs charge) must be decided upfront.",
      "A mediocre vehicle + excellent ops beats a great vehicle + weak ops.",
    ],
    home: [
      "Home charging simplicity is why e-bikes and e-scooters are easiest to adopt.",
      "EV motorcycles need good service support to avoid ownership friction.",
      "Financing can expand the home segment significantly.",
    ],
  };

  // ---------- DOM ----------
  const els = {
    mode: document.getElementById("mode"),
    type: document.getElementById("type"),
    q: document.getElementById("q"),
    mfgFilter: document.getElementById("mfgFilter"),
    tbody: document.getElementById("tbody"),
    countPill: document.getElementById("countPill"),
    reset: document.getElementById("reset"),
    takeaways: document.getElementById("takeaways"),
    brandGrid: document.getElementById("brandGrid"),
    brandSort: document.getElementById("brandSort"),
    brandLabel: document.getElementById("brandLabel"),
  };

  const state = {
    mode: "all",
    type: "all",
    q: "",
    brand: "all",
    brandSort: "score",
    mfg: "all",
  };

  // ---------- Helpers ----------
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

  function setActive(container, attr, value) {
    [...container.querySelectorAll("button")].forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute(attr) === value);
    });
  }

  function brandMatchesFilters(b) {
    // Type filter (brand can be multi-category like "EV Motorcycle / E-Scooter / E-Bicycle")
    const typeOk = state.type === "all" || (b.category || "").includes(state.type);

    const modeOk =
      state.mode === "all" ||
      (state.mode === "commercial" && (b.focus || "").toLowerCase().includes("commercial")) ||
      (state.mode === "home" && (b.focus || "").toLowerCase().includes("consumer"));

    // Manufacturing filter
    const mfgOk = state.mfg === "all" || (b.manufacturingType || "TBD") === state.mfg;

    // Search filter
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
      b.notes || "",
    ]
      .join(" ")
      .toLowerCase();
    const qOk = !q || hay.includes(q);

    return typeOk && mfgOk && qOk && modeOk;
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
    const filtered = list.filter(brandMatchesFilters);
    if (state.brandSort === "name") return filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered.sort((a, b) => (b.jvScore ?? 0) - (a.jvScore ?? 0));
  }

  // ---------- Render ----------
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
                  Battery: ${escapeHtml(b.warranty?.battery || "TBD")} •
                  Motor: ${escapeHtml(b.warranty?.motor || "TBD")} •
                  Controller: ${escapeHtml(b.warranty?.controller || "TBD")}
                  <span>${b.warranty?.notes ? "• " + escapeHtml(b.warranty.notes) : ""}</span>
                </div>

                <div class="k">Notes</div>
                <div class="v">${escapeHtml(b.notes || "—")}</div>
              </div>
            </div>

            <div class="expandRow">
              <span class="brandMeta">Click card = filter table</span>
              <button class="expandBtn" data-expand="1" type="button">Expand</button>
            </div>
          </div>
        `;
      })
      .join("");

    els.brandLabel.textContent = state.brand === "all" ? "All" : state.brand;
  }

  // ---------- Actions ----------
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
    state.mfg = "all";

    els.q.value = "";
    els.brandSort.value = "score";
    els.mfgFilter.value = "all";

    setActive(els.mode, "data-mode", "all");
    setActive(els.type, "data-type", "all");

    renderTakeaways();
    renderBrands();
    renderTable();
  }

  // ---------- Events ----------
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

  els.mfgFilter.addEventListener("change", (e) => {
    state.mfg = e.target.value;
    renderBrands();
    // Table stays as use/type/brand/q-based (by design). If you want table to also filter by mfg, tell me.
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

  // ---------- Init ----------
  try {
    resetAll();
  } catch (err) {
    showError(err.stack || String(err));
  }
})();
