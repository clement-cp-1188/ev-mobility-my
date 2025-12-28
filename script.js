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

      // -----------------------
      // BRAND DATA (add more brands here and they will auto-render everywhere)
      // -----------------------
      const BRANDS = [
        { name:"Blueshark", category:"EV Motorcycle", focus:"Commercial-first (delivery/fleet oriented)", jvScore:82,
          roles:["Fleet ops partner","Swap ecosystem partner"],
          strengths:["Commercial design","Battery swapping","Uptime narrative"],
          gaps:["Scaling early","Capex higher"],
          fitBadges:[{t:"Fleet-ready",k:"good"},{t:"Swap",k:"good"},{t:"Ops needed",k:"warn"}],
          fleetPricingRM:{range:"RM250–400/month"}, batteryModel:{type:"Swappable"}, notes:"Best for pilots where downtime is measurable."
        },
        { name:"Modenas", category:"E-Scooter", focus:"Malaysia OEM; delivery-capable scooters", jvScore:76,
          roles:["OEM/CKD partner","Fleet anchor","After-sales backbone"],
          strengths:["Local OEM credibility","Parts ecosystem","Compliance pathway"],
          gaps:["Fleet SLA discipline required"],
          fitBadges:[{t:"Local OEM",k:"good"},{t:"Delivery",k:"good"},{t:"SLA required",k:"warn"}],
          fleetPricingRM:{range:"RM180–350/month"}, batteryModel:{type:"Model dependent"}, notes:"Strong MY JV anchor if ops KPIs are enforced."
        },
        { name:"Treeletrik", category:"EV Motorcycle", focus:"Mass commuter + light commercial", jvScore:70,
          roles:["Local distributor","Service network partner"],
          strengths:["Local brand presence","Value pricing potential"],
          gaps:["Fleet ops maturity varies"],
          fitBadges:[{t:"Local presence",k:"good"},{t:"Value",k:"good"},{t:"Dealer variance",k:"warn"}],
          fleetPricingRM:{range:"RM200–350/month"}, batteryModel:{type:"Charging-led"}, notes:"Good if your JV imposes service KPIs."
        },
        { name:"Yadea", category:"EV Motorcycle / E-Scooter / E-Bicycle", focus:"Mass-market, price-led", jvScore:60,
          roles:["Hardware supplier","Distributor program partner"],
          strengths:["Cost scale","Broad SKU range"],
          gaps:["Service quality varies by distributor"],
          fitBadges:[{t:"Cost scale",k:"good"},{t:"Ops-dependent",k:"warn"}],
          fleetPricingRM:{range:"RM160–280/month"}, batteryModel:{type:"SKU dependent"}, notes:"Fleet use only with strict contract terms."
        },
        { name:"NIU", category:"E-Scooter", focus:"Consumer-first; commercial possible with ops overlay", jvScore:62,
          roles:["Hardware supplier","Retail + fleet program partner"],
          strengths:["Brand recognition","Telemetry/app DNA"],
          gaps:["SLA not default"],
          fitBadges:[{t:"Brand",k:"good"},{t:"Ops overlay",k:"warn"}],
          fleetPricingRM:{range:"RM180–300/month"}, batteryModel:{type:"SKU dependent"}, notes:"Works if YOU own uptime ops."
        },
        { name:"QJMOTOR", category:"EV Motorcycle / E-Scooter", focus:"Distributor-backed; EV line growing", jvScore:68,
          roles:["Distributor JV","OEM supplier"],
          strengths:["Distributor strength","Build quality"],
          gaps:["EV portfolio maturing"],
          fitBadges:[{t:"Distributor strength",k:"good"},{t:"EV line evolving",k:"warn"}],
          fleetPricingRM:{range:"RM180–320/month"}, batteryModel:{type:"Fixed (common)"}, notes:"Solid option if after-sales is proven."
        },
        { name:"Ebixon (TAILG)", category:"EV Motorcycle / E-Scooter", focus:"China OEM with MY presence", jvScore:63,
          roles:["Hardware supplier","Value fleet option"],
          strengths:["Aggressive pricing","Commercial SKUs possible"],
          gaps:["Distributor quality critical"],
          fitBadges:[{t:"Value fleet",k:"good"},{t:"Distributor risk",k:"warn"}],
          fleetPricingRM:{range:"RM160–300/month"}, batteryModel:{type:"Fixed (common)"}, notes:"Good TCO if support is real."
        },
        { name:"Beam", category:"E-Bicycle (Shared)", focus:"Shared micromobility (campus/township/city)", jvScore:72,
          roles:["City ops partner","Campus partner"],
          strengths:["Ops discipline","Gov relationships"],
          gaps:["Not delivery rider model"],
          fitBadges:[{t:"Ops-strong",k:"good"},{t:"Not delivery",k:"warn"}],
          notes:"Good for campuses/townships; ops benchmark."
        },
        { name:"Eclimo", category:"EV Motorcycle", focus:"Malaysia-built electric motorcycles; pilot-friendly", jvScore:60,
          roles:["Local tech/vehicle partner","Pilot fleet partner"],
          strengths:["Local presence","JV narrative"],
          gaps:["Scale & service footprint must be proven"],
          fitBadges:[{t:"Local",k:"good"},{t:"Pilot-ready",k:"warn"}],
          notes:"Local angle is strong, but ops must be real."
        },
        { name:"Fiido", category:"E-Bicycle", focus:"Utility/folding e-bikes", jvScore:55,
          roles:["Hardware supplier"],
          strengths:["Affordable","Compact"],
          gaps:["Not SLA-ready by default"],
          fitBadges:[{t:"Affordable",k:"good"},{t:"Service overlay",k:"warn"}],
          notes:"Home or staff mobility; light duty."
        },
        { name:"Engwe", category:"E-Bicycle", focus:"Consumer utility e-bikes; MY availability via retailers", jvScore:54,
          roles:["Hardware supplier via retailers"],
          strengths:["Low price utility SKUs"],
          gaps:["Retail support only"],
          fitBadges:[{t:"Low cost",k:"good"},{t:"Retail-driven",k:"warn"}],
          notes:"Mostly home use unless you run servicing."
        },
        { name:"EFORGE", category:"E-Bicycle", focus:"Malaysia e-bike retailer / house brand", jvScore:50,
          roles:["Retail supplier"],
          strengths:["Local retail support"],
          gaps:["No fleet DNA"],
          fitBadges:[{t:"Local retail",k:"good"},{t:"Fleet weak",k:"bad"}],
          notes:"Home/casual use."
        },
        { name:"Xiaomi HIMO", category:"E-Bicycle", focus:"Consumer e-bike", jvScore:48,
          roles:["Retail product"],
          strengths:["Brand recognition"],
          gaps:["No fleet support"],
          fitBadges:[{t:"Consumer",k:"good"},{t:"Fleet weak",k:"bad"}],
          notes:"Personal mobility only."
        },
      ];

      // Manufacturing + useCases (this is what Mode/Manufacturing filters use)
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

      const TAKEAWAYS = {
        all: [
          "Commercial success is driven by uptime, service, and financing more than specs.",
          "OEM/local helps parts and compliance, but ops maturity still wins.",
          "Outright sales works best after spares + service are stable.",
        ],
        commercial: [
          "Fleet-first accelerates learning and utilization.",
          "Battery strategy must be chosen upfront (swap vs depot vs charging).",
          "Great ops beats great hardware.",
        ],
        home: [
          "Home charging simplicity drives adoption.",
          "EV motorcycles need strong after-sales to avoid ownership friction.",
          "Financing expands reachable market.",
        ],
      };

      const VEHICLE_TYPES = ["EV Motorcycle", "E-Scooter", "E-Bicycle"];
      const USES = ["Commercial", "Home"];

      function vehicleTypeMatchesBrand(vehicleType, brandCategory) {
        const cat = String(brandCategory || "");
        const normalized = cat.replaceAll("E-Bicycle (Shared)", "E-Bicycle");
        return normalized.includes(vehicleType);
      }

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
        const list = BRANDS_ENRICHED.filter(b => brandPassesCommonFilters(b) && brandMatchesMode(b));
        return list.sort((a,b) => {
          if (state.brandSort === "name") return a.name.localeCompare(b.name);
          return (b.jvScore ?? 0) - (a.jvScore ?? 0);
        });
      }

      function brandsFor(useLabel, vehicleType) {
        const useMode = norm(useLabel); // commercial/home
        return BRANDS_ENRICHED
          .filter(b => brandPassesCommonFilters(b))
          .filter(b => (b.useCases || []).map(norm).includes(useMode))
          .filter(b => vehicleTypeMatchesBrand(vehicleType, b.category))
          .filter(b => state.brand === "all" ? true : b.name === state.brand)
          .map(b => b.name);
      }

      function uniqueBrandCountForMode(mode) {
        const set = new Set();
        BRANDS_ENRICHED
          .filter(b => brandPassesCommonFilters(b))
          .filter(b => mode === "all" ? true : (b.useCases || []).map(norm).includes(norm(mode)))
          .filter(b => state.brand === "all" ? true : b.name === state.brand)
          .forEach(b => set.add(b.name));
        return set.size;
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
                <span class="brandMeta">Click card = filter</span>
                <button class="expandBtn" data-expand="1" type="button">Expand</button>
              </div>
            </div>
          `;
        }).join("");

        els.brandLabel.textContent = state.brand === "all" ? "All" : state.brand;
      }

      function renderComparisonTable() {
        // Only 2 rows (Commercial + Home), not 3 or 6 segments.
        const rows = USES
          .filter(u => state.mode === "all" ? true : norm(u) === norm(state.mode));

        els.tbody.innerHTML = rows.map(useLabel => {
          const cells = VEHICLE_TYPES
            .filter(t => state.type === "all" ? true : t === state.type)
            .map(vehicleType => {
              const list = brandsFor(useLabel, vehicleType);
              const chips = list.length
                ? `<div class="brandList">${list.map(n => badge(n, state.brand === n ? "good" : "")).join("")}</div>`
                : `<div class="emptyCell">No brands match</div>`;

              return `
                <td>
                  <div class="cellHead">
                    <div class="cellCount">${list.length} brand${list.length === 1 ? "" : "s"}</div>
                  </div>
                  ${chips}
                </td>
              `;
            });

          // If a type filter is selected, headers still show 3 columns in HTML.
          // We keep layout stable by filling missing columns with empty cells.
          // So we always output 3 cells in order EV Motorcycle, E-Scooter, E-Bicycle.
          const cellByType = {};
          VEHICLE_TYPES.forEach(t => cellByType[t] = `<td><div class="emptyCell">—</div></td>`);
          VEHICLE_TYPES.forEach(t => {
            if (state.type === "all" || state.type === t) {
              const list = brandsFor(useLabel, t);
              const chips = list.length
                ? `<div class="brandList">${list.map(n => badge(n, state.brand === n ? "good" : "")).join("")}</div>`
                : `<div class="emptyCell">No brands match</div>`;
              cellByType[t] = `
                <td>
                  <div class="cellHead">
                    <div class="cellCount">${list.length} brand${list.length === 1 ? "" : "s"}</div>
                  </div>
                  ${chips}
                </td>
              `;
            }
          });

          return `
            <tr>
              <td><b>${escapeHtml(useLabel)}</b></td>
              ${cellByType["EV Motorcycle"]}
              ${cellByType["E-Scooter"]}
              ${cellByType["E-Bicycle"]}
            </tr>
          `;
        }).join("");
      }

      function updateCounts() {
        const commercial = uniqueBrandCountForMode("commercial");
        const home = uniqueBrandCountForMode("home");

        // Total shown respects current mode filter (All/commercial/home)
        const totalShown = uniqueBrandCountForMode(state.mode === "all" ? "all" : state.mode);

        els.countPill.textContent = `Commercial: ${commercial} • Home: ${home} • Total shown: ${totalShown}`;
      }

      function rerenderAll() {
        renderTakeaways();
        renderBrands();
        renderComparisonTable();
        updateCounts();
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
