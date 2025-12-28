// ------------------------
// BRAND DIRECTORY (JV lens)
// ------------------------
// Scoring heuristic (0–100):
// 35% Ops/Service maturity
// 20% Commercial focus & fleet readiness
// 20% Financing/leasing readiness
// 15% Battery strategy fit (swap/depot/charge) for commercial
// 10% JV governance fit (transparency, data sharing, milestone mindset)
//
// NOTE: Treat as internal working assumptions; validate via due diligence.

const BRANDS = [
  {
    name: "Blueshark",
    category: "EV Motorcycle",
    focus: "Commercial-first (delivery/fleet oriented)",
    jvScore: 82,
    roles: ["Fleet ops partner", "Swap ecosystem partner"],
    strengths: ["Commercial design", "Swapping capability", "Potential for SLA-driven fleets"],
    gaps: ["Scaling still early", "Capex higher vs mass China brands"],
    fitBadges: [
      { t: "Fleet-ready", k: "good" },
      { t: "Swap-friendly", k: "good" },
      { t: "Needs strong ops partner", k: "warn" }
    ],
    redFlags: ["If service coverage is thin, fleets will churn fast."],
    notes: "Best used in pilots where uptime + swap turnaround are measurable."
  },
  {
    name: "Treeletrik",
    category: "EV Motorcycle",
    focus: "Mass commuter + light commercial",
    jvScore: 70,
    roles: ["Local distribution", "Service network partner"],
    strengths: ["Local brand presence", "Value pricing potential", "Easier stakeholder alignment"],
    gaps: ["Fleet ops maturity varies", "Battery strategy may be charging-led"],
    fitBadges: [
      { t: "Local presence", k: "good" },
      { t: "Pricing leverage", k: "good" },
      { t: "Fleet ops not proven", k: "warn" }
    ],
    redFlags: ["If dealer-led service is inconsistent, commercial SLAs will break."],
    notes: "Good if your JV is ops-led and you impose service KPIs."
  },
  {
    name: "NIU",
    category: "E-Scooter / Light EV",
    focus: "Consumer-first; commercial possible with program overlay",
    jvScore: 62,
    roles: ["Hardware supplier", "Retail + program partner"],
    strengths: ["Recognized product lines", "Smart features / app DNA"],
    gaps: ["Commercial service SLAs may not be default", "Dealer variation risk"],
    fitBadges: [
      { t: "Brand recognition", k: "good" },
      { t: "Commercial overlay needed", k: "warn" },
      { t: "Dealer variability risk", k: "warn" }
    ],
    redFlags: ["If they won’t share fleet data/telemetry, you can’t manage uptime."],
    notes: "Works if YOU own fleet ops and service discipline."
  },
  {
    name: "Yadea",
    category: "E-Scooter / EV Motorcycle",
    focus: "Mass-market (price-led); ops depends on distributor",
    jvScore: 60,
    roles: ["Hardware supplier", "Distributor program partner"],
    strengths: ["Cost scale", "Broad SKUs"],
    gaps: ["Service quality varies", "Commercial durability depends on spec selection"],
    fitBadges: [
      { t: "Cost scale", k: "good" },
      { t: "Ops-dependent", k: "warn" },
      { t: "Spec drift risk", k: "warn" }
    ],
    redFlags: ["Price wars + weak warranty process can destroy margins."],
    notes: "Viable for fleets only with strict warranty + spares SLA locked."
  },
  {
    name: "RYDE EV",
    category: "E-Scooter / E-Bicycle",
    focus: "Pilot-friendly B2B / controlled fleets",
    jvScore: 64,
    roles: ["Pilot partner", "Ops experimentation partner"],
    strengths: ["JV-friendly posture", "Commercial mindset for pilots"],
    gaps: ["Smaller scale", "May need external financing support"],
    fitBadges: [
      { t: "Pilot-ready", k: "good" },
      { t: "Scale limited", k: "warn" },
      { t: "JV-friendly", k: "good" }
    ],
    redFlags: ["If they can’t finance growth, pilots may stall at 50–200 units."],
    notes: "Good for proof-of-concept; not your national rollout anchor."
  },
  {
    name: "Beam",
    category: "E-Bicycle (shared mobility)",
    focus: "Shared micromobility; city/campus ops",
    jvScore: 72,
    roles: ["City ops partner", "Fleet ops benchmark"],
    strengths: ["Fleet operations discipline", "Government/city engagement"],
    gaps: ["Shared mobility focus (not delivery)", "Different unit economics vs riders"],
    fitBadges: [
      { t: "Ops-strong", k: "good" },
      { t: "City/campus fit", k: "good" },
      { t: "Not delivery-centric", k: "warn" }
    ],
    redFlags: ["If your goal is delivery riders, this may be the wrong channel."],
    notes: "Strong for campuses/townships; use as an ops reference model."
  },
  {
    name: "Moov Mobility",
    category: "E-Bicycle",
    focus: "Utility e-bikes (local support, niche fleets)",
    jvScore: 58,
    roles: ["Utility fleet supplier", "Local service partner"],
    strengths: ["Practical designs", "Local support"],
    gaps: ["Limited tech stack", "Small scale"],
    fitBadges: [
      { t: "Utility niche", k: "good" },
      { t: "Limited scale", k: "warn" },
      { t: "Low tech risk", k: "good" }
    ],
    redFlags: ["If you need telematics + SLA, ensure capability exists."],
    notes: "Good for controlled environments (security/campus)."
  },
  {
    name: "Fiido",
    category: "E-Bicycle",
    focus: "Consumer utility/folding; commercial possible with service overlay",
    jvScore: 55,
    roles: ["Hardware supplier"],
    strengths: ["Affordable utility designs", "Compact / folding options"],
    gaps: ["Consumer servicing assumptions", "Not SLA-ready by default"],
    fitBadges: [
      { t: "Affordable", k: "good" },
      { t: "Service overlay needed", k: "warn" },
      { t: "Light duty only", k: "warn" }
    ],
    redFlags: ["Heavy delivery loads will accelerate wear & warranty claims."],
    notes: "Works for light last-mile or staff mobility; not core delivery."
  },
  {
    name: "ADO",
    category: "E-Bicycle",
    focus: "Consumer urban e-bikes",
    jvScore: 48,
    roles: ["Hardware supplier"],
    strengths: ["Urban commuter appeal"],
    gaps: ["Commercial ops not core", "Service + parts vary by seller"],
    fitBadges: [
      { t: "Consumer fit", k: "good" },
      { t: "Commercial weak", k: "bad" }
    ],
    redFlags: ["Don’t build fleet SLAs on consumer retail support."],
    notes: "Keep as home-use / employee commuting option."
  },
  {
    name: "Eclimo",
    category: "EV Motorcycle",
    focus: "Local engineering-led, premium positioning",
    jvScore: 52,
    roles: ["Tech collaboration", "Limited fleet programs"],
    strengths: ["Engineering-led", "Local IP"],
    gaps: ["Fleet ops not primary", "Scale uncertain vs mass brands"],
    fitBadges: [
      { t: "Local engineering", k: "good" },
      { t: "Fleet unclear", k: "warn" }
    ],
    redFlags: ["Premium focus can conflict with fleet cost/TCO constraints."],
    notes: "Explore as R&D / local compliance partner, not fleet anchor."
  },
  {
    name: "Super Soco",
    category: "EV Motorcycle",
    focus: "Lifestyle / consumer",
    jvScore: 40,
    roles: ["Retail brand only"],
    strengths: ["Lifestyle brand appeal"],
    gaps: ["Commercial uptime not core", "SLA focus unlikely"],
    fitBadges: [
      { t: "Lifestyle", k: "good" },
      { t: "Commercial weak", k: "bad" }
    ],
    redFlags: ["Commercial fleets will churn if parts/service are retail-paced."],
    notes: "Not recommended as a commercial JV base."
  }
];

// ------------------------
// COMPARISON TABLE (use lens)
// ------------------------
const DATA = [
  // COMMERCIAL
  {
    use: "Commercial",
    vehicleType: "EV Motorcycle",
    bestFor: "Delivery, fleets, couriers (high utilization)",
    speed: "60–90 km/h",
    payload: "High",
    dailyUsage: "80–150 km/day",
    batteryStrategy: "Swap / depot charging (best), or home charging for some SMEs",
    pricing: "Best as subscription/lease; outright later after service maturity",
    brands: ["Blueshark", "Treeletrik", "NIU", "Yadea"]
  },
  {
    use: "Commercial",
    vehicleType: "E-Scooter",
    bestFor: "Urban commute fleets, light delivery, intra-city ops",
    speed: "40–60 km/h",
    payload: "Medium",
    dailyUsage: "40–80 km/day",
    batteryStrategy: "Charge (common); swap possible if ecosystem exists",
    pricing: "Lease works; must control uptime + service",
    brands: ["NIU", "RYDE EV", "Yadea"]
  },
  {
    use: "Commercial",
    vehicleType: "E-Bicycle",
    bestFor: "Campus/township fleets, last-mile in dense zones, municipal pilots",
    speed: "25–35 km/h",
    payload: "Low–Medium",
    dailyUsage: "20–50 km/day",
    batteryStrategy: "Charge only (simple); battery management still matters",
    pricing: "Rental / managed fleet; low capex but lower income use-cases",
    brands: ["Beam", "RYDE EV", "Moov Mobility"]
  },

  // HOME
  {
    use: "Home",
    vehicleType: "EV Motorcycle",
    bestFor: "Commuting with motorcycle preference; occasional long rides",
    speed: "60–90 km/h",
    payload: "High",
    dailyUsage: "10–60 km/day",
    batteryStrategy: "Home charging (common); swap is a bonus",
    pricing: "Outright purchase more common; financing helpful",
    brands: ["Eclimo", "Super Soco", "NIU", "Yadea"]
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
    brands: ["NIU", "Yadea"]
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
    brands: ["Fiido", "ADO", "Polygon (e-bike lines)"]
  }
];

const TAKEAWAYS = {
  all: [
    "Commercial success is driven by uptime, service, and financing more than specs.",
    "E-bikes are a complement (campus/last-mile), not a replacement for delivery motorcycles.",
    "Outright sales work best after you’ve proven operations and parts availability."
  ],
  commercial: [
    "Fleet-first is usually the fastest route to real utilization and learning.",
    "Battery strategy (swap vs depot vs charge) must be decided upfront.",
    "A mediocre vehicle + excellent ops beats a great vehicle + weak ops."
  ],
  home: [
    "Home charging simplicity is why e-bikes and e-scooters are easiest to adopt.",
    "EV motorcycles need good service support to avoid ownership friction.",
    "Financing can expand the addressable home segment significantly."
  ]
};

const state = {
  mode: "all",
  type: "all",
  q: "",
  brand: "all",     // selected brand filter
  brandSort: "score"
};

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
  brandLabel: document.getElementById("brandLabel")
};

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setActive(container, selectorAttr, value) {
  [...container.querySelectorAll("button")].forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute(selectorAttr) === value);
  });
}

function scoreColor(score){
  if (score >= 75) return "var(--good)";
  if (score >= 55) return "var(--warn)";
  return "var(--bad)";
}

function badge(text, kind){
  const k = kind ? ` ${kind}` : "";
  return `<span class="badge${k}">${escapeHtml(text)}</span>`;
}

function brandMatchesGlobalFilters(b){
  // mode/type filter should affect brand visibility in a reasonable way
  const typeOk =
    state.type === "all" ||
    (b.category || "").includes(state.type);

  const modeOk =
    state.mode === "all" ||
    (state.mode === "commercial" ? /commercial|fleet|shared|b2b/i.test(b.focus) : true) ||
    (state.mode === "home" ? /consumer|lifestyle|commut/i.test(b.focus) : true);

  const q = state.q.trim().toLowerCase();
  const hay = [b.name, b.category, b.focus, (b.roles||[]).join(" "), (b.strengths||[]).join(" "), (b.gaps||[]).join(" ")].join(" ").toLowerCase();
  const qOk = !q || hay.includes(q);

  return typeOk && modeOk && qOk;
}

function rowMatches(row){
  const modeOk =
    state.mode === "all" ||
    row.use.toLowerCase() === state.mode;

  const typeOk =
    state.type === "all" ||
    row.vehicleType === state.type;

  const brandOk =
    state.brand === "all" ||
    row.brands.includes(state.brand);

  const q = state.q.trim().toLowerCase();
  const hay = [
    row.use, row.vehicleType, row.bestFor, row.speed, row.payload,
    row.dailyUsage, row.batteryStrategy, row.pricing, row.brands.join(" ")
  ].join(" ").toLowerCase();
  const qOk = !q || hay.includes(q);

  return modeOk && typeOk && brandOk && qOk;
}

function renderTakeaways(){
  const key = state.mode;
  const items = TAKEAWAYS[key] || TAKEAWAYS.all;
  els.takeaways.innerHTML = items.map(x => `<li>${escapeHtml(x)}</li>`).join("");
}

function renderTable(){
  const rows = DATA.filter(rowMatches);
  els.tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${badge(r.use)}</td>
      <td><b>${escapeHtml(r.vehicleType)}</b></td>
      <td>${escapeHtml(r.bestFor)}</td>
      <td>${escapeHtml(r.speed)}</td>
      <td>${escapeHtml(r.payload)}</td>
      <td>${escapeHtml(r.dailyUsage)}</td>
      <td>${escapeHtml(r.batteryStrategy)}</td>
      <td>${escapeHtml(r.pricing)}</td>
      <td>${r.brands.map(b => badge(b, state.brand === b ? "good" : "")).join(" ")}</td>
    </tr>
  `).join("");
  els.countPill.textContent = `${rows.length} result${rows.length === 1 ? "" : "s"}`;
}

function sortedBrands(list){
  const filtered = list.filter(brandMatchesGlobalFilters);
  if (state.brandSort === "name") {
    return filtered.sort((a,b)=>a.name.localeCompare(b.name));
  }
  return filtered.sort((a,b)=>b.jvScore - a.jvScore);
}

function renderBrands(){
  const list = sortedBrands([...BRANDS]);
  els.brandGrid.innerHTML = list.map(b => {
    const active = state.brand === b.name ? "active" : "";
    const col = scoreColor(b.jvScore);
    const fillW = Math.max(0, Math.min(100, b.jvScore));
    return `
      <div class="brandCard ${active}" data-brand="${escapeHtml(b.name)}" role="button" tabindex="0">
        <div class="brandTop">
          <div>
            <div class="brandName">${escapeHtml(b.name)}</div>
            <div class="brandMeta">${escapeHtml(b.category)} • ${escapeHtml(b.focus)}</div>
          </div>
          <div class="score">
            <div class="scoreNum">${b.jvScore}</div>
            <div class="scoreBar">
              <div class="scoreFill" style="width:${fillW}%; background:${col};"></div>
            </div>
          </div>
        </div>

        <div class="badges">
          ${(b.fitBadges||[]).slice(0,4).map(x => badge(x.t, x.k)).join("")}
        </div>

        <div class="smallText">
          <div><b>JV roles:</b> ${escapeHtml((b.roles||[]).join(", "))}</div>
          <div style="margin-top:6px"><b>Strengths:</b> ${escapeHtml((b.strengths||[]).slice(0,2).join(" • "))}</div>
          <div style="margin-top:6px"><b>Gaps:</b> ${escapeHtml((b.gaps||[]).slice(0,2).join(" • "))}</div>
          <div style="margin-top:6px"><b>Red flag:</b> ${escapeHtml((b.redFlags||[])[0] || "—")}</div>
        </div>
      </div>
    `;
  }).join("");

  els.brandLabel.textContent = state.brand === "all" ? "All" : state.brand;
}

function setMode(mode){
  state.mode = mode;
  setActive(els.mode, "data-mode", mode);
  renderTakeaways();
  renderBrands();
  renderTable();
}

function setType(type){
  state.type = type;
  setActive(els.type, "data-type", type);
  renderBrands();
  renderTable();
}

function setBrand(brand){
  state.brand = brand;
  els.brandLabel.textContent = brand === "all" ? "All" : brand;
  renderBrands();
  renderTable();
}

function resetAll(){
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

// Events
els.mode.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if (!btn) return;
  setMode(btn.dataset.mode);
});

els.type.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if (!btn) return;
  setType(btn.dataset.type);
});

els.q.addEventListener("input", (e)=>{
  state.q = e.target.value;
  renderBrands();
  renderTable();
});

els.brandSort.addEventListener("change", (e)=>{
  state.brandSort = e.target.value;
  renderBrands();
});

els.brandGrid.addEventListener("click", (e)=>{
  const card = e.target.closest(".brandCard");
  if (!card) return;
  const b = card.dataset.brand;
  setBrand(state.brand === b ? "all" : b);
});

els.reset.addEventListener("click", resetAll);

// Init
resetAll();
