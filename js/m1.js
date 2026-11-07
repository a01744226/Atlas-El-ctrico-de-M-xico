/* =====================================================================
   MÓDULO 1 · GENERACIÓN ELÉCTRICA
   ===================================================================== */
const M1 = (() => {
  const fmt = (n, d = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
  const TCOL = { "Nucleoeléctrica": "#8C949D", "Hidroeléctrica": "#0F766E", "Geotermoeléctrica": "#65A30D", "Solar fotovoltaica": "#16A34A", "Ciclo combinado": "#3F4448" };
  const TIP = { "Nucleoeléctrica": "nuclear", "Hidroeléctrica": null, "Geotermoeléctrica": null, "Solar fotovoltaica": "fv", "Ciclo combinado": "ciclocombinado" };
  let charts = [], mapa = null, capa = null, filtroTec = "Todas", anio = 2024, alcance = "CFE";

  /* ---------- Cálculos ---------- */
  const ANIOS_CFE = [2022, 2023, 2024];
  const totCFE = a => Object.values(GEN_CFE.datos).reduce((s, v) => s + v[a], 0);
  const limpia = t => ["nuclear", "renovable", "cogen"].includes(TEC[t].tipo);
  function serie(alc) {
    if (alc === "CFE") return { anios: ANIOS_CFE, datos: Object.fromEntries(Object.entries(GEN_CFE.datos).map(([t, v]) => [t, ANIOS_CFE.map(a => v[a])])), fuente: `${GEN_CFE.fuente[2022]}; ${GEN_CFE.fuente[2024]}`, tipo: "bruta" };
    return { anios: GEN_NAC.anios, datos: GEN_NAC.datos, fuente: GEN_NAC.fuente, tipo: "neta" };
  }

  /* ---------- Mapa ---------- */
  function radio(mw) { return mw ? 6 + Math.sqrt(mw) / 3.2 : 7; }
  function pintarMapa() {
    if (!mapa) return;
    if (capa) capa.remove();
    capa = L.layerGroup().addTo(mapa);
    const usados = {};
    const visibles = CENTRALES.filter(c => filtroTec === "Todas" || c.t === filtroTec);
    visibles.forEach(c => {
      // Si dos centrales comparten municipio, se separa ligeramente el marcador para que ambos sean visibles.
      const k = c.lat + "," + c.lon; usados[k] = (usados[k] || 0) + 1;
      const off = (usados[k] - 1) * 0.12;
      const m = L.circleMarker([c.lat + off, c.lon + off], { radius: radio(c.mw), color: "#fff", weight: 1.5, fillColor: TCOL[c.t], fillOpacity: .88 });
      m.bindTooltip(`<b>${c.n}</b><br>${c.t}`, { direction: "top" });
      m.on("click", () => ficha(c));
      m.addTo(capa);
    });
    document.getElementById("mpCount").textContent = `${visibles.length} centrales · ${new Set(visibles.map(c => c.ent)).size} entidades`;
  }
  function ficha(c) {
    const na = '<span class="na">Dato no disponible</span>';
    document.getElementById("mpFicha").innerHTML = `
      <span class="pill" style="background:${TCOL[c.t]}">${c.t}</span> <span class="scope ${c.op === "CFE" ? "s-cfe" : "s-nac"}">${c.op === "CFE" ? "CFE" : "Productor Independiente (PIE)"}</span>
      <h3 style="margin:8px 0 2px">${c.n}</h3>
      <p class="sub" style="font-size:.85rem">📍 ${c.mun}, ${c.ent}</p>
      <div class="grid2" style="margin-top:12px;gap:10px">
        <div class="kpi"><div class="q">Capacidad</div><div class="v" style="font-size:1.5rem">${c.mw ? fmt(c.mw, c.mw % 1 ? 2 : 0) + " <small>MW</small>" : na}</div></div>
        <div class="kpi"><div class="q">Generación 2024</div><div class="v" style="font-size:1.5rem">${c.gwh ? fmt(c.gwh, 1) + " <small>GWh</small>" : na}</div></div>
      </div>
      ${c.mw && c.gwh ? `<p class="hint">Factor de planta (cálculo): ${fmt(c.gwh * 1000 / (c.mw * 8784) * 100, 1)} % = GWh·1000 / (MW · 8,784 h del año 2024).${c.n.includes("Peñasco") ? " No es representativo: la capacidad de 300 MW solo operó desde septiembre." : ""}</p>` : ""}
      <p class="src">Ubicación: SENER, PRODESEN 2024-2038, Anexos, Cuadro A1.9 (municipio); coordenadas de la cabecera municipal (GeoNames). Capacidad: ${c.fmw}. Generación: ${c.fg}.</p>`;
  }

  /* ---------- HTML ---------- */
  function html() {
    const tecs = ["Todas", ...Object.keys(TCOL)];
    return `
    <div class="mod-head"><div class="eyebrow">Módulo 1</div><h1>Generación eléctrica</h1>
    <p class="sub">¿Dónde se produce la electricidad y con qué tecnologías? Mapa de centrales y estadísticas oficiales de CFE y del Sistema Eléctrico Nacional.</p></div>

    <section class="sec">
      <div class="sec-head"><div><h2><span class="num">1</span>Mapa de centrales eléctricas</h2>
      <p class="sub">Toca un círculo para ver su ficha. El tamaño es proporcional a la capacidad instalada.</p></div>
      <span class="hint" id="mpCount"></span></div>
      <div class="chips" id="mpTec" style="margin-bottom:10px">${tecs.map(t => `<button class="chip" data-t="${t}" aria-pressed="${t === filtroTec}">${t !== "Todas" ? `<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${TCOL[t]};margin-right:5px"></i>` : ""}${t}</button>`).join("")}</div>
      <div class="map-wrap">
        <div id="mapa" class="map" role="region" aria-label="Mapa de centrales eléctricas de México"></div>
        <div class="card map-side" id="mpFicha"><p class="hint">Selecciona una central en el mapa.</p>
          <p class="hint" style="margin-top:12px">Glosario: <span class="tip" data-g="ciclocombinado">ciclo combinado</span> · <span class="tip" data-g="vapor">vapor convencional</span> · <span class="tip" data-g="rankine">ciclo Rankine</span> · <span class="tip" data-g="turbogas">turbogás</span> · <span class="tip" data-g="combint">combustión interna</span> · <span class="tip" data-g="nuclear">nucleoeléctrica</span></p></div>
      </div>
      <p class="src">Municipio: SENER, PRODESEN 2024-2038, Anexos, Cuadro A1.9 (p. 195-198). Coordenadas: cabecera municipal según GeoNames, no la ubicación exacta de cada central. Capacidad y generación: CFE, Informe Anual 2024. Mapa base © OpenStreetMap.</p>
    </section>

    <section class="sec">
      <div class="sec-head"><div><h2><span class="num">2</span>Estadísticas de generación</h2>
      <p class="sub">Elige el alcance. <b>CFE</b>: <span class="tip" data-g="bruta">generación bruta</span> 2022-2024. <b>Nacional</b>: <span class="tip" data-g="neta">generación neta inyectada</span> 2018-2024 (CFE + privados). No se mezclan en una misma gráfica.</p></div>
      <div class="chips" id="gAlc">${["CFE", "Nacional"].map(a => `<button class="chip" data-a="${a}" aria-pressed="${a === alcance}">${a}</button>`).join("")}</div></div>
      <div class="kpis" id="gKpis"></div>
      <div class="grid2" style="margin-top:14px">
        <div class="card"><h3>Generación anual (GWh)</h3><div class="chart-box"><canvas id="g1"></canvas></div><p class="src gsrc"></p></div>
        <div class="card"><h3>Participación por tecnología</h3>
          <div class="chips" id="gYr" style="margin:8px 0"></div>
          <div class="chart-box"><canvas id="g2"></canvas></div><p class="src gsrc"></p></div>
      </div>
      <div class="grid2" style="margin-top:14px">
        <div class="card"><h3>Variación interanual por tecnología</h3><p class="hint" id="g3lbl"></p><div class="chart-box"><canvas id="g3"></canvas></div><p class="src gsrc"></p></div>
        <div class="card"><h3>Fuentes fósiles vs. limpias</h3><div class="chart-box"><canvas id="g4"></canvas></div>
          <p class="hint">Limpias = renovables + nuclear + <span class="tip" data-g="cogen">cogeneración eficiente</span>. Porcentaje calculado con las tablas por tecnología.</p><p class="src gsrc"></p></div>
      </div>
      <div class="card" style="margin-top:14px">
        <h3><span class="tip" data-g="ciclocombinado">Ciclo combinado</span> vs. <span class="tip" data-g="vapor">vapor convencional</span></h3>
        <p class="hint">Ambos son fósiles, pero el ciclo combinado aprovecha el calor de escape en un segundo ciclo (<span class="tip" data-g="rankine">Rankine</span>) y por eso usa menos combustible por kWh.</p>
        <div class="grid2"><div class="chart-box"><canvas id="g5"></canvas></div><div id="g5txt" style="font-size:.88rem;align-self:center"></div></div>
        <p class="src gsrc"></p>
      </div>
    </section>
    <footer>Atlas Eléctrico de México · VERDALUX · TE1020. Los porcentajes y variaciones son cálculos sobre tablas oficiales.</footer>`;
  }

  /* ---------- Gráficas ---------- */
  function graficas() {
    charts.forEach(c => c.destroy()); charts = [];
    const S = serie(alcance), A = S.anios, tecs = Object.keys(S.datos);
    if (!A.includes(anio)) anio = A[A.length - 1];
    const tot = A.map((_, i) => tecs.reduce((s, t) => s + S.datos[t][i], 0));
    const totOf = alcance === "CFE" ? A.map(a => GEN_CFE.totalOficial[a]) : GEN_NAC.total; // total oficial (difiere por redondeo)
    document.querySelectorAll(".gsrc").forEach(e => e.textContent = S.fuente + (alcance === "Nacional" ? ". " + GEN_NAC.nota : ""));
    const sc = alcance === "CFE" ? "s-cfe" : "s-nac";

    // KPIs
    const i = A.indexOf(anio), ip = i - 1;
    const cc = S.datos["Ciclo combinado"][i] / tot[i] * 100;
    const lim = tecs.filter(limpia).reduce((s, t) => s + S.datos[t][i], 0) / tot[i] * 100;
    document.getElementById("gKpis").innerHTML = [
      [`${alcance} · ${anio}`, fmt(totOf[i]), "GWh", `Generación ${S.tipo} anual`],
      [`${alcance} · ${anio} · cálculo`, ip >= 0 ? (totOf[i] >= totOf[ip] ? "+" : "") + fmt((totOf[i] / totOf[ip] - 1) * 100, 1) : "—", "%", ip >= 0 ? `Variación vs ${A[ip]}` : "Sin año previo en la serie"],
      [`${alcance} · ${anio} · cálculo`, fmt(cc, 1), "%", "Ciclo combinado: la tecnología que más genera"],
    ].map(k => `<div class="kpi"><span class="scope ${k[0].includes("cálculo") ? "s-calc" : sc}">${k[0]}</span><div class="v">${k[1]} <small>${k[2]}</small></div><div class="q">${k[3]}</div></div>`).join("") +
      `<div class="kpi"><span class="scope s-calc">${alcance} · ${anio} · cálculo</span><div class="v">${fmt(lim, 1)} <small>% limpia</small></div><div class="q">Participación de fuentes limpias</div></div>`;
    document.getElementById("gKpis").style.gridTemplateColumns = "repeat(auto-fit,minmax(200px,1fr))";

    // años para dona
    document.getElementById("gYr").innerHTML = A.map(a => `<button class="chip" data-a="${a}" aria-pressed="${a === anio}">${a}</button>`).join("");

    const base = extra => Object.assign({ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 11, font: { size: 10 } } } } }, extra);
    // g1 total anual
    charts.push(new Chart(document.getElementById("g1"), { type: "bar", data: { labels: A, datasets: [{ label: "GWh", data: totOf, backgroundColor: A.map(a => a === anio ? "#16A34A" : "#3F4448"), borderRadius: 6 }] },
      options: base({ plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${fmt(c.raw)} GWh` } } }, scales: { y: { ticks: { callback: v => fmt(v / 1000) + " TWh" } } } }) }));
    // g2 dona por tecnología
    const filas = tecs.map(t => [t, S.datos[t][i]]).filter(f => f[1] > 0).sort((a, b) => b[1] - a[1]);
    const COLS = { "Ciclo combinado": "#3F4448", "Vapor convencional": "#6B7176", "Turbogás": "#8A9096", "Turbojet": "#A7ADB2", "Combustión interna": "#C3C8CC", "Carboeléctrica": "#24282B", "Nucleoeléctrica": "#B8C0CA", "Hidroeléctrica": "#0F766E", "Geotermoeléctrica": "#65A30D", "Eoloeléctrica": "#4ADE80", "Solar fotovoltaica": "#16A34A", "Bioenergía": "#14532D", "Híbrido FV-batería": "#86EFAC", "Cogeneración eficiente": "#A3B18A" };
    charts.push(new Chart(document.getElementById("g2"), { type: "doughnut", data: { labels: filas.map(f => f[0]), datasets: [{ data: filas.map(f => f[1]), backgroundColor: filas.map(f => COLS[f[0]]), borderWidth: 1 }] },
      options: base({ cutout: "55%", plugins: { legend: { position: "right", labels: { boxWidth: 10, font: { size: 10 } } }, tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.raw)} GWh (${fmt(c.raw / tot[i] * 100, 1)} %)` } } } }) }));
    // g3 variación interanual
    const iv = ip >= 0 ? i : 1, ivp = iv - 1;
    document.getElementById("g3lbl").textContent = `${A[ivp]} → ${A[iv]} (cambio en GWh). Tecnologías con más de 100 GWh.`;
    const varr = tecs.map(t => [t, S.datos[t][iv] - S.datos[t][ivp], S.datos[t][ivp]]).filter(v => Math.max(S.datos[v[0]][iv], v[2]) > 100).sort((a, b) => b[1] - a[1]);
    charts.push(new Chart(document.getElementById("g3"), { type: "bar", data: { labels: varr.map(v => v[0]), datasets: [{ data: varr.map(v => v[1]), backgroundColor: varr.map(v => v[1] >= 0 ? "#16A34A" : "#B91C1C"), borderRadius: 4 }] },
      options: base({ indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw >= 0 ? "+" : ""}${fmt(c.raw)} GWh (${varr[c.dataIndex][2] ? fmt(c.raw / varr[c.dataIndex][2] * 100, 1) + " %" : "—"})` } } },
        scales: { x: { ticks: { callback: v => fmt(v) } }, y: { ticks: { font: { size: 10 } } } } }) }));
    // g4 fósil vs limpia
    const fos = A.map((_, k) => tecs.filter(t => !limpia(t)).reduce((s, t) => s + S.datos[t][k], 0) / tot[k] * 100);
    charts.push(new Chart(document.getElementById("g4"), { type: "bar", data: { labels: A, datasets: [
        { label: "Fósil", data: fos.map(v => +v.toFixed(1)), backgroundColor: "#6B7176" },
        { label: "Limpia", data: fos.map(v => +(100 - v).toFixed(1)), backgroundColor: "#16A34A" }] },
      options: base({ scales: { x: { stacked: true }, y: { stacked: true, max: 100, ticks: { callback: v => v + " %" } } }, plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw, 1)} %` } } } }) }));
    // g5 CC vs vapor
    const ccS = S.datos["Ciclo combinado"], vcS = S.datos["Vapor convencional"];
    charts.push(new Chart(document.getElementById("g5"), { type: "line", data: { labels: A, datasets: [
        { label: "Ciclo combinado", data: ccS, borderColor: "#3F4448", backgroundColor: "#3F4448", tension: .3 },
        { label: "Vapor convencional", data: vcS, borderColor: "#B8C0CA", backgroundColor: "#B8C0CA", tension: .3 }] },
      options: base({ plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw)} GWh` } } }, scales: { y: { ticks: { callback: v => fmt(v / 1000) + " TWh" } } } }) }));
    const r = ccS[i] / vcS[i];
    let txt = `<p>En <b>${anio}</b> (${alcance}) el ciclo combinado generó <b>${fmt(ccS[i])} GWh</b> y el vapor convencional <b>${fmt(vcS[i])} GWh</b>: <b>${fmt(r, 1)} veces más</b> (cálculo).</p>`;
    if (alcance === "CFE") txt += `<p style="margin-top:8px">Capacidad CFE 2024: ciclo combinado propio <b>10,912.4 MW</b> + PIE <b>15,990.5 MW</b>; vapor convencional <b>9,697.6 MW</b> (IA CFE 2024 p. 21).</p>`;
    else txt += `<p style="margin-top:8px">El vapor convencional nacional bajó de 39,345 GWh (2018) a 20,001 GWh (2022) y repuntó a 30,358 GWh en 2023, cuando la sequía redujo la hidroeléctrica.</p>`;
    document.getElementById("g5txt").innerHTML = txt;
  }

  function render() {
    charts.forEach(c => c.destroy()); charts = [];
    if (mapa) { mapa.remove(); mapa = null; }
    document.getElementById("view").innerHTML = html();
    // Mapa
    mapa = L.map("mapa", { scrollWheelZoom: false }).setView([23.5, -102], 5);
    capaBase(mapa);
    pintarMapa();
    ficha(CENTRALES[0]);
    document.getElementById("mpTec").onclick = e => { const b = e.target.closest("[data-t]"); if (!b) return; filtroTec = b.dataset.t;
      document.querySelectorAll("#mpTec .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); pintarMapa(); };
    document.getElementById("gAlc").onclick = e => { const b = e.target.closest("[data-a]"); if (!b) return; alcance = b.dataset.a;
      document.querySelectorAll("#gAlc .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); anio = 2024; graficas(); };
    document.getElementById("gYr").onclick = e => { const b = e.target.closest("[data-a]"); if (!b) return; anio = +b.dataset.a; graficas(); };
    graficas();
  }
  return { render };
})();
