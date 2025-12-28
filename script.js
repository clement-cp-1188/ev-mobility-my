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
      const required = [
        "mode","type","q","countPill","brandLabel","reset","brandSort",
        "brandGrid","tbody","takeaways","mfgFilter",
        "selectedBar","selectedChips","clearSelected",
        "brandCompareBody"
      ];
      const missing = required.filter(id => !document.getElementById(id));
      if (missing.length) {
        showError("Missing HTML IDs:\n- " + missing.join("\n- "));
        return;
      }

      const els = {
        mode: document.getElementById("mode"),
        type: document.getElementById("type"),
        q: document.getElementById("q"),
        mfgFilter: document.getElementById("mfgFilter"),
        countPill: document.getElementById("countPill"),
        brandLabel: document.getElementById("brandLabel"),
        reset: document.getElementById("reset"),
        brandSort: document.getElementById("brandSort"),
        brandGrid: document.getElementById("brandGrid"),
        tbody: document.getElementById("tbody"),
        takeaways: document.getElementById("takeaways"),
        selectedBar: document.getElementById("selectedBar"),
        selectedChips: document.getElementById("selectedChips"),
        clearSelected: document.getElementById("clearSelected"),
        brandCompareBody: document.getElementById("brandCompareBody"),
      };

      const state = {
        mode: "all",
        type: "all",
        mfg: "all",
        q: "",
        brandSort: "score",
        selected: new Set(),
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

      // ---------- DATA ----------
      const BRANDS = [
        { name:"Blueshark", category:"EV Motorcycle", focus:"Commercial-first (delivery/fleet)", jvScore:82, roles:["Fleet ops partner","Swap ecosystem partner"], notes:"Best for pilots where downtime is measurable." },
        { name:"Modenas", category:"E-Scooter", focus:"Malaysia OEM; delivery-capable scooters", jvScore:76, roles:["OEM/CKD partner","Fleet anchor"], notes:"Strong MY JV anchor if ops KPIs are enforced." },
        { name:"Treeletrik", category:"EV Motorcycle", focus:"Mass commuter + light commercial", jvScore:70, roles:["Local distributor","Service network partner"], notes:"Good if your JV imposes service KPIs." },
        { name:"Yadea", category:"EV Motorcycle / E-Scooter / E-Bicycle", focus:"Mass-market, price-led", jvScore:60, roles:["Hardware supplier"], notes:"Fleet use only with strict contract terms." },
        { name:"NIU", category:"E-Scooter", focus:"Consumer-first; commercial possible", jvScore:62, roles:["Hardware supplier"], notes:"Works if YOU own uptime ops." },
        { name:"QJMOTOR", category:"EV Motorcycle / E-Scooter", focus:"Distributor-backed; EV line growing", jvScore:68, roles:["Distributor JV"], notes:"Solid option if after-sales is proven." },
        { name:"Ebixon (TAILG)", category:"EV Motorcycle / E-Scooter", focus:"China OEM with MY presence", jvScore:63, roles:["Hardware supplier"], notes:"Good TCO if support is real." },
        { name:"Beam", category:"E-Bicycle (Shared)", focus:"Shared micromobility operator", jvScore:72, roles:["City ops partner","Campus partner"], notes:"Good for campuses/townships; ops benchmark." },
        { name:"Eclimo", category:"EV Motorcycle", focus:"Malaysia-built electric motorcycles", jvScore:60, roles:["Local tech/vehicle partner"], notes:"Local angle is strong, but ops must be real." },
        { name:"Fiido", category:"E-Bicycle", focus:"Utility/folding e-bikes", jvScore:55, roles:["Hardware supplier"], notes:"Home or staff mobility; light duty." },
        { name:"Engwe", category:"E-Bicycle", focus:"Consumer utility e-bikes", jvScore:54, roles:["Hardware supplier"], notes:"Mostly home use unless you run servicing." },
        { name:"EFORGE", category:"E-Bicycle", focus:"Malaysia e-bike retailer / house brand", jvScore:50, roles:["Retail supplier"], notes:"Home/casual use." },
        { name:"Xiaomi HIMO", category:"E-Bicycle", focus:"Consumer e-bike", jvScore:48, roles:["Retail product"], notes:"Personal mobility only." },
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

      const VEHICLE_TYPES = ["EV Motorcycle","E-Scooter","E-Bicycle"];
      const USES = ["Commercial","Home"];

      // ---------- FILTERING ----------
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
          (b.roles||[]).join(" "), b.notes || ""
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

      // brands to compare = selected brands if any; else all filtered-by-controls brands
      function brandsToCompare() {
        if (state.selected.size > 0) {
          return BRANDS_ENRICHED
            .filter(b => state.selected.has(b.name))
            .filter(b => brandPassesCommon(b) && brandMatchesMode(b)); // keep consistent with filters
        }
        return BRANDS_ENRICHED
          .filter(b => brandPassesCommon(b) && brandMatchesMode(b));
      }

      // ---------- RENDER ----------
      function renderTakeaways() {
        const items = TAKEAWAYS[state.mode] || TAKEAWAYS.all;
        els.takeaways.innerHTML = items.map(x => `<li>${esc(x)}</li>`).join("");
      }

      function renderSelectedBar() {
        const names = [...state.selected].sort((a,b)=>a.localeCompare(b));
        els.selectedBar.style.display = names.length ? "flex" : "none";
        els.brandLabel.textContent = names.length ? `${names.length} selected` : "All";

        const titleEl = els.selectedBar.querySelector(".selectedTitle");
        if (titleEl) titleEl.innerHTML = `<span class="dot"></span> Selected brands`;

        els.selectedChips.innerHTML = names.map(n => `
          <div class="selChip" title="${esc(n)}">
            <span class="selChipName">${esc(n)}</span>
            <span class="selChipRemove" data-remove="${esc(n)}" aria-label="Remove">×</span>
          </div>
        `).join("");

        els.clearSelected.classList.add("clearSelectedBtn");
      }

      function renderDirectory() {
        const list = directoryList();
        els.brandGrid.innerHTML = list.map(b => {
          const active = state.selected.has(b.name) ? "active" : "";
          const col = scoreColor(b.jvScore ?? 0);
          const fillW = Math.max(0, Math.min(100, b.jvScore ?? 0));

          return `
            <div class="brandCard ${active}" data-brand="${esc(b.name)}">
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
                  <div class="k">Notes</div>
                  <div class="v">${esc(b.notes || "—")}</div>
                </div>
              </div>

              <div class="expandRow">
                <span class="brandMeta">Click card = toggle select</span>
                <button class="expandBtn" data-expand="1" type="button">Expand</button>
              </div>
            </div>
          `;
        }).join("");
      }

      function renderCoverageTable() {
        const rows = USES.filter(u => state.mode === "all" ? true : norm(u) === norm(state.mode));

        function cell(useLabel, type) {
          if (state.type !== "all" && state.type !== type) {
            return `<td><div class="emptyCell">—</div></td>`;
          }
          const list = brandsFor(useLabel, type);
          if (!list.length) {
            return `<td><div class="cellHead"><div class="cellCount">0 brands</div></div><div class="emptyCell">No brands match</div></td>`;
          }
          return `
            <td>
              <div class="cellHead"><div class="cellCount">${list.length} brand${list.length===1?"":"s"}</div></div>
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

        if (!list.length) {
          els.brandCompareBody.innerHTML = `
            <tr>
              <td colspan="8" style="color:#9aa4b2; padding:14px 10px;">
                No brands to compare (current filters removed all results).
              </td>
            </tr>
          `;
          return;
        }

        function chips(arr, kind="info") {
          const items = (arr || []).filter(Boolean);
          if (!items.length) return `<span style="color:#9aa4b2">—</span>`;
          return `<div class="brandGridInCell">${items.map(x => `<span class="badge ${kind}">${esc(x)}</span>`).join("")}</div>`;
        }

        list.forEach(b => {
          // derive vehicle types list from category string
          const vt = String(b.category || "")
            .replaceAll("E-Bicycle (Shared)", "E-Bicycle")
            .split("/")
            .map(x => x.trim())
            .filter(Boolean);

          // normalize use cases title-case
          const uc = (b.useCases || []).map(x => {
            const t = String(x || "");
            return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;
          });

          const roles = (b.roles || []);

          els.brandCompareBody.innerHTML = list.map(row => {
            const vts = String(row.category || "")
              .replaceAll("E-Bicycle (Shared)", "E-Bicycle")
              .split("/")
              .map(x => x.trim())
              .filter(Boolean);

            const ucs = (row.useCases || []).map(x => {
              const t = String(x || "");
              return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;
            });

            const roleList = (row.roles || []);

            return `
              <tr>
                <td><b>${esc(row.name)}</b></td>
                <td>${esc(row.origin || "—")}</td>
                <td>${esc(row.manufacturingType || "—")}</td>
                <td>${chips(vts, "info")}</td>
                <td>${chips(ucs, "info")}</td>
                <td><span class="badge ${((row.jvScore ?? 0) >= 75) ? "good" : ((row.jvScore ?? 0) >= 55 ? "warn" : "bad")}">${esc(row.jvScore ?? 0)}</span></td>
                <td>${roleList.length ? esc(roleList.join(", ")) : `<span style="color:#9aa4b2">—</span>`}</td>
                <td>${row.notes ? esc(row.notes) : `<span style="color:#9aa4b2">—</span>`}</td>
              </tr>
            `;
          }).join("");
        });
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

        const name = card.getAttribute("data-brand");
        if (!name) return;

        if (state.selected.has(name)) state.selected.delete(name);
        else state.selected.add(name);

        rerenderAll();
      });

      els.selectedChips.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-remove]");
        if (!rm) return;
        const name = rm.getAttribute("data-remove");
        state.selected.delete(name);
        rerenderAll();
      });

      els.clearSelected.addEventListener("click", () => {
        state.selected.clear();
        rerenderAll();
      });

      els.reset.addEventListener("click", () => {
        state.mode = "all";
        state.type = "all";
        state.mfg = "all";
        state.q = "";
        state.brandSort = "score";
        state.selected.clear();

        els.q.value = "";
        els.brandSort.value = "score";
        els.mfgFilter.value = "all";
        setActive(els.mode, "data-mode", "all");
        setActive(els.type, "data-type", "all");

        rerenderAll();
      });

      // Init
      rerenderAll();
    } catch (err) {
      showError(err.stack || String(err));
    }
  });
})();
