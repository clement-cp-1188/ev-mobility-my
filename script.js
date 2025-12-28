// script.js — FIXED
// Fixes:
// - countPill shows BRANDS count (not segments), so you won’t see “6” and think it’s broken
// - manufacturing filter uses normalized comparison (trim + lowercase) so it actually works
// - comparison table auto-derives brands per segment from the brand directory + applies ALL filters

(function () {
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

  document.addEventListener("DOMContentLoaded", () => {
    try {
      const ids = ["mode","type","q","countPill","brandLabel","reset","brandSort","brandGrid","tbody","takeaways","mfgFilter"];
      const missing = ids.filter((id) => !document.getElementById(id));
      if (missing.length) {
        showError("Missing HTML IDs:\n- " + missing.join("\n- "));
        return;
      }

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

      const state = { mode:"all", type:"all", q:"", brand:"all", brandSort:"score", mfg:"all" };

      const norm = (s) => String(s ?? "").trim().toLowerCase();

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

      // ---------------------------
      // Brands (your current set)
      // If you have “much more brands”, paste them into BRANDS and they will show automatically.
      // ---------------------------
      const BRANDS = [
        { name:"Blueshark", category:"EV Motorcycle", focus:"Commercial-first (delivery/fleet oriented)", jvScore:82,
          roles:["Fleet ops partner","Swap ecosystem partner"],
          strengths:["Commercial design","Battery swapping","Uptime narrative"],
          gaps:["Scaling early","Capex higher"],
          fitBadges:[{t:"Fleet-ready",k:"good"},{t:"Swap",k:"good"},{t:"Ops needed",k:"warn"}],
          serviceFootprint:{count:null,notes:"Confirm MY service points & swap locations."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:"Confirm commercial-use clauses."},
          fleetPricingRM:{range:"RM250–400/month",notes:"Bundle dependent."},
          batteryModel:{type:"Swappable",notes:"Key for high-uptime fleets."},
          notes:"Best for pilots where downtime is measurable."
        },
        { name:"Modenas", category:"E-Scooter", focus:"Malaysia OEM; delivery-capable scooters", jvScore:76,
          roles:["OEM/CKD partner","Fleet anchor","After-sales backbone"],
          strengths:["Local OEM credibility","Parts ecosystem","Compliance pathway"],
          gaps:["Fleet SLA discipline required"],
          fitBadges:[{t:"Local OEM",k:"good"},{t:"Delivery",k:"good"},{t:"SLA required",k:"warn"}],
          serviceFootprint:{count:null,notes:"Fill in dealer footprint by state."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"RM180–350/month",notes:"Model + bundle dependent."},
          batteryModel:{type:"Model dependent",notes:"Confirm removable battery by SKU."},
          notes:"Strong MY JV anchor if ops KPIs are enforced."
        },
        { name:"Treeletrik", category:"EV Motorcycle", focus:"Mass commuter + light commercial", jvScore:70,
          roles:["Local distributor","Service network partner"],
          strengths:["Local brand presence","Value pricing potential"],
          gaps:["Fleet ops maturity varies"],
          fitBadges:[{t:"Local presence",k:"good"},{t:"Value",k:"good"},{t:"Dealer variance",k:"warn"}],
          serviceFootprint:{count:null,notes:"Dealer-led network; verify turnaround time."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"RM200–350/month",notes:""},
          batteryModel:{type:"Charging-led (common)",notes:""},
          notes:"Good if your JV imposes service KPIs."
        },
        { name:"Yadea", category:"EV Motorcycle / E-Scooter / E-Bicycle", focus:"Mass-market, price-led", jvScore:60,
          roles:["Hardware supplier","Distributor program partner"],
          strengths:["Cost scale","Broad SKU range"],
          gaps:["Service quality varies by distributor"],
          fitBadges:[{t:"Cost scale",k:"good"},{t:"Ops-dependent",k:"warn"}],
          serviceFootprint:{count:null,notes:"Distributor quality matters."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:"Lock parts SLA for fleets."},
          fleetPricingRM:{range:"RM160–280/month",notes:"Beware price wars."},
          batteryModel:{type:"SKU dependent",notes:""},
          notes:"Fleet use only with strict contract terms."
        },
        { name:"NIU", category:"E-Scooter", focus:"Consumer-first; commercial possible with ops overlay", jvScore:62,
          roles:["Hardware supplier","Retail + fleet program partner"],
          strengths:["Brand recognition","Telemetry/app DNA"],
          gaps:["SLA not default"],
          fitBadges:[{t:"Brand",k:"good"},{t:"Ops overlay",k:"warn"}],
          serviceFootprint:{count:null,notes:"Map service centers + parts lead time."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"RM180–300/month",notes:""},
          batteryModel:{type:"SKU dependent",notes:""},
          notes:"Works if YOU own uptime ops."
        },
        { name:"QJMOTOR", category:"EV Motorcycle / E-Scooter", focus:"MForce-backed brand; EV line growing", jvScore:68,
          roles:["Distributor JV","OEM supplier"],
          strengths:["Distributor strength","Build quality"],
          gaps:["EV portfolio maturing"],
          fitBadges:[{t:"Distributor strength",k:"good"},{t:"EV line evolving",k:"warn"}],
          serviceFootprint:{count:null,notes:"Confirm EV-specific spares & technicians."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"RM180–320/month",notes:""},
          batteryModel:{type:"Fixed (common)",notes:""},
          notes:"Solid option if after-sales is proven."
        },
        { name:"Ebixon (TAILG)", category:"EV Motorcycle / E-Scooter", focus:"China OEM with MY presence", jvScore:63,
          roles:["Hardware supplier","Value fleet option"],
          strengths:["Aggressive pricing","Commercial SKUs possible"],
          gaps:["Distributor quality critical"],
          fitBadges:[{t:"Value fleet",k:"good"},{t:"Distributor risk",k:"warn"}],
          serviceFootprint:{count:null,notes:"Confirm distributor SLA & spares policy."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"RM160–300/month",notes:""},
          batteryModel:{type:"Fixed (common)",notes:""},
          notes:"Good TCO if support is real."
        },
        { name:"Beam", category:"E-Bicycle (Shared)", focus:"Shared micromobility (campus/township/city)", jvScore:72,
          roles:["City ops partner","Campus partner"],
          strengths:["Ops discipline","Gov relationships"],
          gaps:["Not delivery rider model"],
          fitBadges:[{t:"Ops-strong",k:"good"},{t:"Not delivery",k:"warn"}],
          serviceFootprint:{count:null,notes:"List operating zones + maintenance model."},
          warranty:{battery:"N/A",motor:"N/A",controller:"N/A",notes:""},
          fleetPricingRM:{range:"Shared model",notes:""},
          batteryModel:{type:"Depot charging",notes:""},
          notes:"Great for campuses/townships; ops benchmark."
        },
        { name:"Eclimo", category:"EV Motorcycle", focus:"Malaysia-built electric motorcycles; pilot-friendly", jvScore:60,
          roles:["Local tech/vehicle partner","Pilot fleet partner"],
          strengths:["Local presence","JV narrative"],
          gaps:["Scale & service footprint must be proven"],
          fitBadges:[{t:"Local",k:"good"},{t:"Pilot-ready",k:"warn"}],
          serviceFootprint:{count:null,notes:"Confirm operating states + workshop partners."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"RM220–380/month",notes:""},
          batteryModel:{type:"Charging-led",notes:""},
          notes:"Local angle is strong, but ops must be real."
        },
        { name:"Fiido", category:"E-Bicycle", focus:"Utility/folding e-bikes; commercial only with service overlay", jvScore:55,
          roles:["Hardware supplier"],
          strengths:["Affordable","Compact"],
          gaps:["Not SLA-ready by default"],
          fitBadges:[{t:"Affordable",k:"good"},{t:"Service overlay",k:"warn"}],
          serviceFootprint:{count:null,notes:"Depends on reseller; require spares stock."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"RM80–160/month",notes:"Light duty only."},
          batteryModel:{type:"Charging-led",notes:""},
          notes:"Home or staff mobility; light duty."
        },
        { name:"Engwe", category:"E-Bicycle", focus:"Consumer utility e-bikes; MY availability via retailers", jvScore:54,
          roles:["Hardware supplier via retailers"],
          strengths:["Low price utility SKUs"],
          gaps:["Retail support only"],
          fitBadges:[{t:"Low cost",k:"good"},{t:"Retail-driven",k:"warn"}],
          serviceFootprint:{count:null,notes:"Verify seller warranty + spares."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"RM70–160/month",notes:""},
          batteryModel:{type:"Charging-led (model dependent)",notes:""},
          notes:"Mostly home use unless you run servicing."
        },
        { name:"EFORGE", category:"E-Bicycle", focus:"Malaysia e-bike retailer / house brand", jvScore:50,
          roles:["Retail supplier"],
          strengths:["Local retail support"],
          gaps:["No fleet DNA"],
          fitBadges:[{t:"Local retail",k:"good"},{t:"Fleet weak",k:"bad"}],
          serviceFootprint:{count:null,notes:"Confirm workshop + warranty process."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"Home use",notes:""},
          batteryModel:{type:"Charging-led",notes:""},
          notes:"Home/casual use."
        },
        { name:"Xiaomi HIMO", category:"E-Bicycle", focus:"Consumer e-bike", jvScore:48,
          roles:["Retail product"],
          strengths:["Brand recognition"],
          gaps:["No fleet support"],
          fitBadges:[{t:"Consumer",k:"good"},{t:"Fleet weak",k:"bad"}],
          serviceFootprint:{count:null,notes:"Verify MY warranty/support source."},
          warranty:{battery:"TBD",motor:"TBD",controller:"TBD",notes:""},
          fleetPricingRM:{range:"Home use",notes:""},
          batteryModel:{type:"Charging-led",notes:""},
          notes:"Personal mobility only."
        },
      ];

      // Enrichment: manufacturing + use cases
      const BRAND_META = {
        "Modenas": { origin:"Local (MY)", manufacturingType:"Local OEM", useCases:["commercial","home"] },
        "Eclimo": { origin:"Local (MY)", manufacturingType:"Local OEM", useCases:["commercial","home"] },
        "Treeletrik": { origin:"Local (MY)", manufacturingType:"Importer/Distributor", useCases:["commercial","home"] },
        "EFORGE": { origin:"Local (MY)", manufacturingType:"Retailer/House brand", useCases:["home"] },

        "Blueshark": { origin:"Other", manufacturingType:"Importer/Distributor", useCases:["commercial","home"] },
        "Beam": { origin:"Other", manufacturingType:"Shared Operator", useCases:["commercial"] },

        "Yadea": { origin:"China", manufacturingType:"Importer/Distributor", useCases:["commercial","home"] },
        "NIU": { origin:"China", manufacturingType:"Importer/Distributor", useCases:["commercial","home"] },
        "QJMOTOR": { origin:"China", manufacturingType:"Importer/Distributor", useCases:["commercial","home"] },
        "Ebixon (TAILG)": { origin:"China", manufacturingType:"Importer/Distributor", useCases:["commercial","home"] },
        "Fiido": { origin:"China", manufacturingType:"Importer/Distributor", useCases:["commercial","home"] },
        "Engwe": { origin:"China", manufacturingType:"Importer/Distributor", useCases:["home"] },
        "Xiaomi HIMO": { origin:"China", manufacturingType:"Importer/Distributor", useCases:["home"] },
      };

      const BRANDS_ENRICHED = BRANDS.map(b => ({
        ...b,
        ...(BRAND_META[b.name] || { origin:"Origin TBD", manufacturingType:"TBD", useCases:["commercial","home"] })
      }));

      // Segment templates (always 6 segments — that’s OK; brands list inside is the dynamic part)
      const SEGMENTS = [
        { use:"Commercial", vehicleType:"EV Motorcycle", bestFor:"Delivery, fleets, couriers (high utilization)", speed:"60–90 km/h", payload:"High", dailyUsage:"80–150 km/day", batteryStrategy:"Swap / depot charging preferred; charging ok for SMEs", pricing:"Subscription/lease usually best; outright later" },
        { use:"Commercial", vehicleType:"E-Scooter", bestFor:"Urban commute fleets, light delivery, intra-city ops", speed:"40–60 km/h", payload:"Medium", dailyUsage:"40–80 km/day", batteryStrategy:"Charging common; removable battery helps depot ops", pricing:"Lease works if service SLAs enforced" },
        { use:"Commercial", vehicleType:"E-Bicycle", bestFor:"Campus/township fleets, municipal pilots, controlled environments", speed:"25–35 km/h", payload:"Low–Medium", dailyUsage:"20–50 km/day", batteryStrategy:"Depot charging is simplest", pricing:"Managed fleet / rental model" },
        { use:"Home", vehicleType:"EV Motorcycle", bestFor:"Commuting + occasional longer rides", speed:"60–90 km/h", payload:"High", dailyUsage:"10–60 km/day", batteryStrategy:"Home charging; swap is a bonus", pricing:"Outright purchase common; financing helps" },
        { use:"Home", vehicleType:"E-Scooter", bestFor:"Urban commute, short trips", speed:"40–60 km/h", payload:"Medium", dailyUsage:"10–40 km/day", batteryStrategy:"Home charging is easiest", pricing:"Outright purchase; low friction" },
        { use:"Home", vehicleType:"E-Bicycle", bestFor:"Lifestyle commuting, short errands", speed:"25–35 km/h", payload:"Low–Medium", dailyUsage:"5–30 km/day", batteryStrategy:"Home charging", pricing:"Outright purchase; lowest maintenance" },
      ];

      const TAKEAWAYS = {
        all: [
          "Commercial success is driven by uptime, service, and financing more than specs.",
          "OEM/local helps parts and compliance, but ops maturity still wins.",
          "Outright sales work best after spares and service are stable.",
        ],
        commercial: [
          "Fleet-first accelerates learning and utilization.",
          "Battery strategy (swap vs depot vs charge) must be chosen upfront.",
          "Mediocre vehicle + excellent ops beats great vehicle + weak ops.",
        ],
        home: [
          "Home charging simplicity drives adoption (especially e-bikes and e-scooters).",
          "EV motorcycles need strong after-sales to avoid ownership friction.",
          "Financing expands the reachable market significantly.",
        ],
      };

      function vehicleTypeMatchesBrand(vehicleType, brandCategory) {
        const cat = String(brandCategory || "");
        // Treat "E-Bicycle (Shared)" as E-Bicycle
        const normalized = cat.replaceAll("E-Bicycle (Shared)", "E-Bicycle");
        return normalized.includes(vehicleType);
      }

      // Common filter: type + mfg + search
      function brandPassesCommonFilters(b) {
        const typeOk = state.type === "all" || vehicleTypeMatchesBrand(state.type, b.category);

        const mfgVal = norm(state.mfg);
        const bMfg = norm(b.manufacturingType || "tbd");
        const mfgOk = (mfgVal === "all") || (bMfg === mfgVal);

        const q = norm(state.q);
        const hay = norm([
          b.name, b.category, b.focus, b.origin, b.manufacturingType,
          (b.roles||[]).join(" "), (b.strengths||[]).join(" "), (b.gaps||[]).join(" "),
          b.notes || ""
        ].join(" "));
        const qOk = !q || hay.includes(q);

        return typeOk && mfgOk && qOk;
      }

      function brandMatchesMode(b) {
        if (state.mode === "all") return true;
        return (b.useCases || []).map(norm).includes(norm(state.mode));
      }

      function filteredBrandsForDirectory() {
        return BRANDS_ENRICHED
          .filter(b => brandPassesCommonFilters(b) && brandMatchesMode(b))
          .sort((a,b) => {
            if (state.brandSort === "name") return a.name.localeCompare(b.name);
            return (b.jvScore ?? 0) - (a.jvScore ?? 0);
          });
      }

      function brandsForSegment(seg) {
        const segMode = norm(seg.use); // "commercial" / "home"
        return BRANDS_ENRICHED
          .filter(b => brandPassesCommonFilters(b))
          .filter(b => (b.useCases || []).map(norm).includes(segMode))
          .filter(b => vehicleTypeMatchesBrand(seg.vehicleType, b.category))
          .filter(b => state.brand === "all" ? true : b.name === state.brand)
          .map(b => b.name);
      }

      function renderTakeaways() {
        const items = TAKEAWAYS[state.mode] || TAKEAWAYS.all;
        els.takeaways.innerHTML = items.map(x => `<li>${escapeHtml(x)}</li>`).join("");
      }

      function renderBrands() {
        const list = filteredBrandsForDirectory();

        els.brandGrid.innerHTML = list.map((b) => {
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
                <div><b>Use cases:</b> ${escapeHtml((b.useCases||[]).join(", ") || "—")}</div>
                <div style="margin-top:6px"><b>JV roles:</b> ${escapeHtml((b.roles || []).join(", "))}</div>
              </div>

              <div class="details">
                <div class="kv">
                  <div class="k">Fleet pricing</div>
                  <div class="v">${escapeHtml(b.fleetPricingRM?.range || "TBD")}</div>
                  <div class="k">Battery model</div>
                  <div class="v">${escapeHtml(b.batteryModel?.type || "TBD")}</div>
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
        }).join("");

        els.brandLabel.textContent = state.brand === "all" ? "All" : state.brand;
        return list.length;
      }

      function renderTable() {
        const segments = SEGMENTS
          .filter(seg => state.mode === "all" ? true : norm(seg.use) === norm(state.mode))
          .filter(seg => state.type === "all" ? true : seg.vehicleType === state.type);

        els.tbody.innerHTML = segments.map(seg => {
          const brands = brandsForSegment(seg);
          return `
            <tr>
              <td>${badge(seg.use)}</td>
              <td><b>${escapeHtml(seg.vehicleType)}</b></td>
              <td>${escapeHtml(seg.bestFor)}</td>
              <td>${escapeHtml(seg.speed)}</td>
              <td>${escapeHtml(seg.payload)}</td>
              <td>${escapeHtml(seg.dailyUsage)}</td>
              <td>${escapeHtml(seg.batteryStrategy)}</td>
              <td>${escapeHtml(seg.pricing)}</td>
              <td>
                ${brands.length
                  ? brands.map(b => badge(b, state.brand === b ? "good" : "")).join(" ")
                  : `<span style="color:var(--muted)">No brands match filters</span>`
                }
              </td>
            </tr>
          `;
        }).join("");

        return segments.length;
      }

      function updateCounts(brandCount, segmentCount) {
        els.countPill.textContent = `Brands: ${brandCount} • Segments: ${segmentCount}`;
      }

      function rerenderAll() {
        renderTakeaways();
        const brandCount = renderBrands();
        const segmentCount = renderTable();
        updateCounts(brandCount, segmentCount);
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

        rerenderAll();
      }

      // Events
      els.mode.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        state.mode = btn.dataset.mode;
        setActive(els.mode, "data-mode", state.mode);
        // When mode changes, keep brand filter but rerender everything
        rerenderAll();
      });

      els.type.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        state.type = btn.dataset.type;
        setActive(els.type, "data-type", state.type);
        rerenderAll();
      });

      els.q.addEventListener("input", (e) => {
        state.q = e.target.value;
        rerenderAll();
      });

      els.mfgFilter.addEventListener("change", (e) => {
        state.mfg = e.target.value;
        rerenderAll();
      });

      els.brandSort.addEventListener("change", (e) => {
        state.brandSort = e.target.value;
        rerenderAll();
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
        state.brand = (state.brand === b) ? "all" : b;
        rerenderAll();
      });

      els.reset.addEventListener("click", resetAll);

      // Init
      resetAll();
    } catch (err) {
      showError(err.stack || String(err));
    }
  });
})();
