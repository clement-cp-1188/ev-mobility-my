// Data model: each row represents a "use mode + vehicle type" combination
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
    brands: ["Blueshark", "Treeletrik", "NIU", "Yadea"],
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
    brands: ["NIU", "RYDE EV", "Yadea"],
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
    brands: ["Beam", "RYDE EV", "Moov Mobility"],
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
    brands: ["Eclimo", "Super Soco", "NIU", "Yadea"],
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
    brands: ["NIU", "Yadea"],
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
    brands: ["Fiido", "ADO", "Polygon (e-bike lines)"],
  },
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
    "A mediocre bike + excellent ops beats a great bike + weak ops."
  ],
  home: [
    "Home charging simplicity is why e-bikes and e-scooters are easiest to adopt.",
    "EV motorcycles need good service support to avoid ownership friction.",
    "Financing can expand the addressable home segment significantly."
  ]
};

const state = {
  mode: "all",        // all | commercial | home
  type: "all",        // all | EV Motorcycle | E-Scooter | E-Bicycle
  q: ""
};

const els = {
  mode: document.getElementById("mode"),
  type: document.getElementById("type"),
  q: document.getElementById("q"),
  tbody: document.getElementById("tbody"),
  countPill: document.getElementById("countPill"),
  reset: document.getElementById("reset"),
  takeaways: document.getElementById("takeaways")
};

function setActive(container, selectorAttr, value) {
  [...container.querySelectorAll("button")].forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute(selectorAttr) === value);
  });
}

function matches(row) {
  const modeOk =
    state.mode === "all" ||
    row.use.toLowerCase() === state.mode;

  const typeOk =
    state.type === "all" ||
    row.vehicleType === state.type;

  const q = state.q.trim().toLowerCase();
  const hay = [
    row.use, row.vehicleType, row.bestFor, row.speed, row.payload,
    row.dailyUsage, row.batteryStrategy, row.pricing, row.brands.join(" ")
  ].join(" ").toLowerCase();

  const qOk = !q || hay.includes(q);

  return modeOk && typeOk && qOk;
}

function badge(text) {
  return `<span class="badge">${escapeHtml(text)}</span>`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTable() {
  const rows = DATA.filter(matches);

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
      <td>${r.brands.map(b => badge(b)).join(" ")}</td>
    </tr>
  `).join("");

  els.countPill.textContent = `${rows.length} result${rows.length === 1 ? "" : "s"}`;
}

function renderTakeaways() {
  const key = state.mode;
  const items = TAKEAWAYS[key] || TAKEAWAYS.all;
  els.takeaways.innerHTML = items.map(x => `<li>${escapeHtml(x)}</li>`).join("");
}

function setMode(mode) {
  state.mode = mode;
  setActive(els.mode, "data-mode", mode);
  renderTakeaways();
  renderTable();
}

function setType(type) {
  state.type = type;
  setActive(els.type, "data-type", type);
  renderTable();
}

function resetAll() {
  state.mode = "all";
  state.type = "all";
  state.q = "";
  els.q.value = "";
  setActive(els.mode, "data-mode", "all");
  setActive(els.type, "data-type", "all");
  renderTakeaways();
  renderTable();
}

// Event wiring
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
  renderTable();
});

els.reset.addEventListener("click", resetAll);

// Initial render
resetAll();
