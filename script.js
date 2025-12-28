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

  document.addEventListener("DOMContentLoaded", () => {
    try {
      // IDs that must exist
      const required = [
        "mode","type","mfgFilter","q","countPill","brandLabel","reset","brandSort",
        "brandGrid","tbody",
        "selectedBar","selectedChips","clearSelected",
        "brandCompareBody","comparePill",
        "takeawaysAll","takeawaysCommercial","takeawaysHome"
      ];
      const missing = required.filter(id => !document.getElementById(id));
      if (missing.length) {
        showError("Missing HTML IDs:\n- " + missing.join("\n- "));
        return;
      }

      const els = {
        mode: document.getElementById("mode"),
        type: document.getElementById("type"),
        mfgFilter: document.getElementById("mfgFilter"),
        q: document.getElementById("q"),
        countPill: document.getElementById("countPill"),
        brandLabel: document.getElementById("brandLabel"),
        reset: document.getElementById("reset"),
        brandSort: document.getElementById("brandSort"),
        brandGrid: document.getElementById("brandGrid"),
        tbody: document.getElementById("tbody"),
        selectedBar: document.getElementById("selectedBar"),
        selectedChips: document.getElementById("selectedChips"),
        clearSelected: document.getElementById("clearSelected"),
        brandCompareBody: document.getElementById("brandCompareBody"),
        comparePill: document.getElementById("comparePill"),
        takeAll: document.getElementById("takeawaysAll"),
        takeCom: document.getElementById("takeawaysCommercial"),
        takeHome: document.getElementById("takeawaysHome"),
      };

      const state = {
        mode: "all",
        type: "all",
        mfg: "all",
        q: "",
        brandSort: "score",
        selected: new Set(),
        expanded: new Set(),
      };

      const norm = (s) => String(s ?? "").trim().toLowerCase();
      const esc = (s) => String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

      function scoreColor(score) {
        if (score >= 75) return "var(--good)";
        if (score >= 55) return "var(--warn)";
        return "var(--bad)";
      }
      function setActive(container, attr, value) {
        [...container.querySelectorAll("button")].forEach(btn => {
          btn.classList.toggle("active", btn.getAttribute(attr) === value);
        });
      }

      // ---------- TAKEAWAYS (always render all 3) ----------
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
          "Financing expands the reachable market.",
        ],
      };

      // ---------- DATA ----------
      const BRANDS = [
        {
          name:"Blueshark",
          category:"EV Motorcycle",
          focus:"Commercial-first (delivery/fleet)",
          jvScore:82,
          roles:["Fleet ops partner","Swap ecosystem partner"],
          pricingCommercial:"RM250–400/month (fleet/subscription) — TBD by plan",
          pricingHome:"Outright / financing via partners — TBD",
          batteryStrategy:"Swappable ecosystem (where available) + depot/home charging",
          serviceAfterSales:"Fleet SLA-focused service + planned spares; verify workshop coverage",
          warranty:"TBD (verify years / battery terms)",
          financing:"TBD (partner financing / lease options)",
          jvRisks:"Swap infra capex; dependency on network density; SLA enforcement needed",
          notes:"Best for pilots where downtime is measurable."
        },
        {
          name:"Modenas",
          category:"E-Scooter",
          focus:"Malaysia OEM; delivery-capable scooters",
          jvScore:76,
          roles:["OEM/CKD partner","Fleet anchor"],
          pricingCommercial:"Lease/subscription possible (fleet) — TBD",
          pricingHome:"Outright + financing common — TBD",
          batteryStrategy:"Mostly charging-led; model dependent",
          serviceAfterSales:"Potential advantage: local OEM supply chain; verify parts lead time",
          warranty:"TBD (verify battery vs vehicle warranty separation)",
          financing:"Likely strong local ecosystem; verify partners",
          jvRisks:"If fleet KPIs not enforced, uptime fails; procurement cycles can be slow",
          notes:"Strong MY JV anchor if ops KPIs are enforced."
        },
        {
          name:"Beam",
          category:"E-Bicycle (Shared)",
          focus:"Shared micromobility operator",
          jvScore:72,
          roles:["City ops partner","Campus partner"],
          pricingCommercial:"Revenue-share / operator contract — TBD",
          pricingHome:"Not primary (shared operator model)",
          batteryStrategy:"Operator managed charging & swaps (ops-managed)",
          serviceAfterSales:"Strong ops processes; maintenance teams; city compliance heavy",
          warranty:"N/A (operator-owned assets); verify supplier contracts",
          financing:"Operator capex; potential JV capex sharing",
          jvRisks:"Regulatory + permits; vandalism/theft; utilization volatility",
          notes:"Good for campuses/townships; ops benchmark."
        },
        {
          name:"Treeletrik",
          category:"EV Motorcycle",
          focus:"Mass commuter + light commercial",
          jvScore:70,
          roles:["Local distributor","Service network partner"],
          pricingCommercial:"Fleet pricing possible — TBD",
          pricingHome:"Outright purchase common — TBD",
          batteryStrategy:"Charging-led; swap optional depending on SKU/network",
          serviceAfterSales:"Distributor service network; verify nationwide coverage + parts stocking",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Support quality varies by dealer; JV must mandate service standards",
          notes:"Good if your JV imposes service KPIs."
        },
        {
          name:"QJMOTOR",
          category:"EV Motorcycle / E-Scooter",
          focus:"Distributor-backed; EV line growing",
          jvScore:68,
          roles:["Distributor JV"],
          pricingCommercial:"Value fleet option — TBD",
          pricingHome:"Outright + financing — TBD",
          batteryStrategy:"Fixed battery (common); charging-led",
          serviceAfterSales:"Distributor-managed; check workshop readiness for EV diagnostics",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Parts lead time; reliance on distributor performance; model maturity",
          notes:"Solid option if after-sales is proven."
        },
        {
          name:"Ebixon (TAILG)",
          category:"EV Motorcycle / E-Scooter",
          focus:"China OEM with MY presence",
          jvScore:63,
          roles:["Hardware supplier"],
          pricingCommercial:"Low TCO candidate — TBD",
          pricingHome:"Budget purchase — TBD",
          batteryStrategy:"Fixed battery; charging-led",
          serviceAfterSales:"Verify MY service capability + spare parts stocking",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Service depth + parts availability; weak SLAs kill fleets",
          notes:"Good TCO if support is real."
        },
        {
          name:"NIU",
          category:"E-Scooter",
          focus:"Consumer-first; commercial possible",
          jvScore:62,
          roles:["Hardware supplier"],
          pricingCommercial:"Possible fleet program — TBD",
          pricingHome:"Retail purchase — TBD",
          batteryStrategy:"Fixed battery; charging-led",
          serviceAfterSales:"Retail network varies; fleets need extra maintenance program",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Not fleet-first by default; you may need to own uptime operations",
          notes:"Works if YOU own uptime ops."
        },
        {
          name:"Yadea",
          category:"EV Motorcycle / E-Scooter / E-Bicycle",
          focus:"Mass-market, price-led",
          jvScore:60,
          roles:["Hardware supplier"],
          pricingCommercial:"Aggressive pricing; fleet support varies — TBD",
          pricingHome:"Price-led retail — TBD",
          batteryStrategy:"SKU dependent; mostly charging-led",
          serviceAfterSales:"Dealer dependent; validate SLA + parts",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"If after-sales is weak, fleets fail; ensure contractual guarantees",
          notes:"Fleet use only with strict contract terms."
        },
        {
          name:"Eclimo",
          category:"EV Motorcycle",
          focus:"Malaysia-built electric motorcycles",
          jvScore:60,
          roles:["Local tech/vehicle partner"],
          pricingCommercial:"Pilot pricing — TBD",
          pricingHome:"Outright — TBD",
          batteryStrategy:"Charging-led",
          serviceAfterSales:"Local build advantage; validate scaling ability + spares",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Scaling manufacturing + service coverage; supply chain maturity",
          notes:"Local angle is strong, but ops must be real."
        },
        {
          name:"Fiido",
          category:"E-Bicycle",
          focus:"Utility/folding e-bikes",
          jvScore:55,
          roles:["Hardware supplier"],
          pricingCommercial:"Staff mobility / light duty — TBD",
          pricingHome:"Retail purchase — TBD",
          batteryStrategy:"Charging-led",
          serviceAfterSales:"Retail warranty process; check local support partners",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Not designed for heavy fleet duty; maintenance burden if used commercially",
          notes:"Home or staff mobility; light duty."
        },
        {
          name:"Engwe",
          category:"E-Bicycle",
          focus:"Consumer utility e-bikes",
          jvScore:54,
          roles:["Hardware supplier"],
          pricingCommercial:"Not primary — TBD",
          pricingHome:"Retail purchase — TBD",
          batteryStrategy:"Charging-led",
          serviceAfterSales:"Retail support varies; confirm local warranty handling",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Home-focused; fleet uptime not guaranteed",
          notes:"Mostly home use unless you run servicing."
        },
        {
          name:"EFORGE",
          category:"E-Bicycle",
          focus:"Malaysia e-bike retailer / house brand",
          jvScore:50,
          roles:["Retail supplier"],
          pricingCommercial:"Not primary — TBD",
          pricingHome:"Retail purchase — TBD",
          batteryStrategy:"Charging-led",
          serviceAfterSales:"Local retailer support; validate parts availability",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Limited fleet suitability; depends on retailer service capability",
          notes:"Home/casual use."
        },
        {
          name:"Xiaomi HIMO",
          category:"E-Bicycle",
          focus:"Consumer e-bike",
          jvScore:48,
          roles:["Retail product"],
          pricingCommercial:"Not suitable — TBD",
          pricingHome:"Retail purchase — TBD",
          batteryStrategy:"Charging-led",
          serviceAfterSales:"Retail support; may be limited for commercial operations",
          warranty:"TBD",
          financing:"TBD",
          jvRisks:"Not for fleets; service coverage uncertain",
          notes:"Personal mobility only."
        },
      ];

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

      const USES = ["Commercial","Home"];

      // ---------- FILTER HELPERS ----------
      function vehicleTypeMatchesBrand(vehicleType, brandCategory) {
        const cat = String(brandCategory || "");
        const normalized = cat.replaceAll("E-Bicycle (Shared)", "E-Bicycle");
        return normalized.includes(vehicleType);
      }

      function selectedPass(name) {
        return state.selected.size === 0 || state.selected.has(name);
      }

      function brandPassesCommon(b) {
        const typeOk = state.type === "all" || vehicleTypeMatchesBrand(state.type, b.category);
        const mfgOk = (norm(state.mfg) === "all") || (norm(b.manufacturingType) === norm(state.mfg));

        const q = norm(state.q);
        const hay = norm([
          b.name, b.category, b.focus, b.origin, b.manufacturingType,
          (b.roles||[]).join(" "),
          b.pricingCommercial, b.pricingHome, b.batteryStrategy, b.serviceAfterSales, b.warranty, b.financing,
          b.jvRisks, b.notes
        ].join(" "));
        const qOk = !q || hay.includes(q);

        return typeOk && mfgOk && qOk;
      }

      function brandMatchesMode(b) {
        if (state.mode === "all") return true;
        return (b.useCases || []).map(norm).includes(norm(state.mode));
      }

      function directoryList() {
        const list = BRANDS_ENRICHED.filter(b => brandPassesCommon(b) && brandMatchesMode(b));
        return list.sort((a,b) => {
          if (state.brandSort === "name") return a.name.localeCompare(b.name);
          return (b.jvScore ?? 0) - (a.jvScore ?? 0);
        });
      }

      function brandsFor(useLabel, vehicleType) {
        const useMode = norm(useLabel);
        return BRANDS_ENRICHED
          .filter(b => brandPassesCommon(b))
          .filter(b => (b.useCases||[]).map(norm).includes(useMode))
          .filter(b => vehicleTypeMatchesBrand(vehicleType, b.category))
          .filter(b => selectedPass(b.name))
          .map(b => b.name);
      }

      function uniqueBrandCount(mode) {
        const set = new Set();
        BRANDS_ENRICHED
          .filter(b => brandPassesCommon(b))
          .filter(b => mode === "all" ? true : (b.useCases||[]).map(norm).includes(norm(mode)))
          .filter(b => selectedPass(b.name))
          .forEach(b => set.add(b.name));
        return set.size;
      }

      function brandsToCompare() {
        if (state.selected.size > 0) {
          return BRANDS_ENRICHED
            .filter(b => state.selected.has(b.name))
            .filter(b => brandPassesCommon(b) && brandMatchesMode(b));
        }
        return BRANDS_ENRICHED
          .filter(b => brandPassesCommon(b) && brandMatchesMode(b));
      }

      // ---------- RENDER ----------
      function renderTakeaways() {
        els.takeAll.innerHTML = TAKEAWAYS.all.map(x => `<li>${esc(x)}</li>`).join("");
        els.takeCom.innerHTML = TAKEAWAYS.commercial.map(x => `<li>${esc(x)}</li>`).join("");
        els.takeHome.innerHTML = TAKEAWAYS.home.map(x => `<li>${esc(x)}</li>`).join("");
      }

      function renderSelectedBar() {
        const names = [...state.selected].sort((a,b)=>a.localeCompare(b));
        els.selectedBar.style.display = names.length ? "flex" : "none";
        els.brandLabel.textContent = names.length ? `${names.length} selected` : "All";

        els.selectedChips.innerHTML = names.map(n => `
          <div class="selChip" title="${esc(n)}">
            <span class="selChipName">${esc(n)}</span>
            <span class="selChipRemove" data-remove="${esc(n)}" aria-label="Remove">×</span>
          </div>
        `).join("");
      }

      function renderDirectory() {
        const list = directoryList();
        els.brandGrid.innerHTML = list.map(b => {
          const active = state.selected.has(b.name) ? "active" : "";
          const expanded = state.expanded.has(b.name) ? "expanded" : "";
          const col = scoreColor(b.jvScore ?? 0);
          const fillW = Math.max(0, Math.min(100, b.jvScore ?? 0));

          return `
            <div class="brandCard ${active} ${expanded}" data-brand="${esc(b.name)}">
              <div class="brandTop">
                <div>
                  <div class="brandName">${esc(b.name)}</div>
                  <div class="brandMeta">${esc(b.category)} • ${esc(b.focus)}</div>
                </div>
                <div class="score">
                  <div class="scoreNum">${esc(b.jvScore ?? 0)}</div>
                  <div class="scoreBar">
                    <div class="scoreFill" style="width:${fillW}%; background:${col};"></div>
                  </div>
                </div>
              </div>

              <div class="badges">
                <span class="badge info">${esc(b.manufacturingType || "TBD")}</span>
                <span class="badge info">${esc(b.origin || "Origin TBD")}</span>
                <span class="badge">${esc((b.useCases||[]).join(", ") || "—")}</span>
              </div>

              <div class="smallText">
                <div><b>JV roles:</b> ${esc((b.roles || []).join(", ") || "—")}</div>
              </div>

              <div class="details">
                <div class="kv">
                  <div class="k">Pricing (Commercial)</div><div class="v">${esc(b.pricingCommercial || "TBD")}</div>
                  <div class="k">Pricing (Home)</div><div class="v">${esc(b.pricingHome || "TBD")}</div>
                  <div class="k">Battery strategy</div><div class="v">${esc(b.batteryStrategy || "TBD")}</div>
                  <div class="k">Service / after-sales</div><div class="v">${esc(b.serviceAfterSales || "TBD")}</div>
                  <div class="k">Warranty</div><div class="v">${esc(b.warranty || "TBD")}</div>
                  <div class="k">Financing</div><div class="v">${esc(b.financing || "TBD")}</div>
                  <div class="k">JV risks</div><div class="v">${esc(b.jvRisks || "TBD")}</div>
                  <div class="k">Notes</div><div class="v">${esc(b.notes || "—")}</div>
                </div>
              </div>

              <div class="expandRow">
                <span class="brandMeta">Click card = toggle select</span>
                <button class="expandBtn" type="button">${state.expanded.has(b.name) ? "Collapse" : "Expand"}</button>
              </div>
            </div>
          `;
        }).join("");
      }

      function renderCoverageTable() {
        const rows = USES.filter(u => state.mode === "all" ? true : norm(u) === norm(state.mode));

        function cell(useLabel, type) {
          if (state.type !== "all" && state.type !== type) {
            return `<td>—</td>`;
          }
          const list = brandsFor(useLabel, type);
          if (!list.length) {
            return `<td><span style="color:#9aa4b2">No brands match</span></td>`;
          }
          return `
            <td>
              <div class="brandGridInCell">
                ${list.map(n => `<span class="badge info">${esc(n)}</span>`).join("")}
              </div>
            </td>
          `;
        }

        els.tbody.innerHTML = rows.map(useLabel => `
          <tr>
            <td><b>${esc(useLabel)}</b></td>
            ${cell(useLabel, "EV Motorcycle")}
            ${cell(useLabel, "E-Scooter")}
            ${cell(useLabel, "E-Bicycle")}
          </tr>
        `).join("");
      }

      function renderBrandComparisonTable() {
        const list = brandsToCompare()
          .slice()
          .sort((a,b) => (b.jvScore ?? 0) - (a.jvScore ?? 0) || a.name.localeCompare(b.name));

        els.comparePill.textContent = `Comparing: ${list.length}`;

        if (!list.length) {
          els.brandCompareBody.innerHTML = `
            <tr>
              <td colspan="15" style="color:#9aa4b2; padding:14px 10px;">
                No brands to compare (current filters removed all results).
              </td>
            </tr>
          `;
          return;
        }

        const badgeForScore = (s) => {
          const v = Number(s ?? 0);
          const cls = v >= 75 ? "good" : (v >= 55 ? "warn" : "bad");
          return `<span class="badge ${cls}">${esc(v)}</span>`;
        };

        const chips = (arr) => {
          const items = (arr || []).map(x => String(x||"").trim()).filter(Boolean);
          if (!items.length) return `<span style="color:#9aa4b2">—</span>`;
          return `<div class="brandGridInCell">${items.map(x => `<span class="badge info">${esc(x)}</span>`).join("")}</div>`;
        };

        const longCell = (value) => {
          const text = String(value ?? "").trim();
          return esc(text || "TBD");
        };

        els.brandCompareBody.innerHTML = list.map(b => {
          const vts = String(b.category || "")
            .replaceAll("E-Bicycle (Shared)", "E-Bicycle")
            .split("/")
            .map(x => x.trim())
            .filter(Boolean);

          const ucs = (b.useCases || []).map(x => {
            const t = String(x || "");
            return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;
          });

          return `
            <tr>
              <td class="stickyCol"><b>${esc(b.name)}</b></td>
              <td>${esc(b.origin || "—")}</td>
              <td>${esc(b.manufacturingType || "—")}</td>
              <td>${chips(vts)}</td>
              <td>${chips(ucs)}</td>
              <td>${badgeForScore(b.jvScore)}</td>
              <td>${(b.roles && b.roles.length) ? esc(b.roles.join(", ")) : `<span style="color:#9aa4b2">—</span>`}</td>
              <td>${longCell(b.pricingCommercial)}</td>
              <td>${longCell(b.pricingHome)}</td>
              <td>${longCell(b.batteryStrategy)}</td>
              <td>${longCell(b.serviceAfterSales)}</td>
              <td>${longCell(b.warranty)}</td>
              <td>${longCell(b.financing)}</td>
              <td>${longCell(b.jvRisks)}</td>
              <td>${longCell(b.notes || "—")}</td>
            </tr>
          `;
        }).join("");
      }

      function updateCounts() {
        const commercial = uniqueBrandCount("commercial");
        const home = uniqueBrandCount("home");
        const total = uniqueBrandCount(state.mode === "all" ? "all" : state.mode);
        els.countPill.textContent = `Commercial: ${commercial} • Home: ${home} • Total shown: ${total}`;
      }

      function rerenderAll() {
        renderTakeaways();
        renderSelectedBar();
        renderDirectory();
        renderCoverageTable();
        renderBrandComparisonTable();
        updateCounts();
      }

      // ---------- EVENTS ----------
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

      // Directory click: expand vs select
      els.brandGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".brandCard");
        if (!card) return;

        const name = card.getAttribute("data-brand");
        if (!name) return;

        const expandBtn = e.target.closest(".expandBtn");
        if (expandBtn) {
          e.preventDefault();
          e.stopPropagation();
          if (state.expanded.has(name)) state.expanded.delete(name);
          else state.expanded.add(name);
          rerenderAll();
          return;
        }

        if (state.selected.has(name)) state.selected.delete(name);
        else state.selected.add(name);

        rerenderAll();
      });

      // Remove chip
      els.selectedChips.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-remove]");
        if (!rm) return;
        const name = rm.getAttribute("data-remove");
        state.selected.delete(name);
        rerenderAll();
      });

      // Clear selection
      els.clearSelected.addEventListener("click", () => {
        state.selected.clear();
        rerenderAll();
      });

      // Reset all
      els.reset.addEventListener("click", () => {
        state.mode = "all";
        state.type = "all";
        state.mfg = "all";
        state.q = "";
        state.brandSort = "score";
        state.selected.clear();
        state.expanded.clear();

        els.q.value = "";
        els.brandSort.value = "score";
        els.mfgFilter.value = "all";
        setActive(els.mode, "data-mode", "all");
        setActive(els.type, "data-type", "all");

        rerenderAll();
      });

      // Initial render
      rerenderAll();
    } catch (err) {
      showError(err.stack || String(err));
    }
  });
})();
