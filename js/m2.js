/* =====================================================================
   MÓDULO 2 · TRANSMISIÓN ELÉCTRICA
   ===================================================================== */
const M2 = (() => {
  const fmt = (n, d = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
  const SCOL = { SIN: "#16A34A", SIBC: "#0F766E", SIBCS: "#6B7176", SIMUL: "#B45309" };
  const SNOM = { SIN: "Sistema Interconectado Nacional", SIBC: "Sistema Interconectado Baja California", SIBCS: "Sistema Interconectado Baja California Sur", SIMUL: "Sistema Interconectado Mulegé" };
  let charts = [], mapa = null, simChart = null;
  const sim = { P: 300, V: 230, R: 5, fp: 1 };

  /* ---------- Diagrama esquemático de conexiones (SVG) ---------- */
  const esquema = () => `
  <svg viewBox="0 0 520 250" role="img" aria-label="Esquema de conexión de los cuatro sistemas eléctricos" style="width:100%;height:auto;font-family:Inter,sans-serif">
    <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#0F766E"/></marker></defs>
    <rect x="12" y="20" width="118" height="54" rx="10" fill="#E8EEF8" stroke="#2B4C7E"/><text x="71" y="44" text-anchor="middle" font-size="12" font-weight="700" fill="#2B4C7E">WECC (EE. UU.)</text><text x="71" y="61" text-anchor="middle" font-size="10" fill="#2B4C7E">red del oeste</text>
    <rect x="12" y="110" width="118" height="54" rx="10" fill="${SCOL.SIBC}"/><text x="71" y="134" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">SIBC</text><text x="71" y="151" text-anchor="middle" font-size="10" fill="#fff">Baja California</text>
    <line x1="71" y1="76" x2="71" y2="108" stroke="#0F766E" stroke-width="3" marker-start="url(#ar)" marker-end="url(#ar)"/><text x="80" y="96" font-size="10" fill="#0F766E">2 líneas 230 kV</text>
    <rect x="150" y="110" width="110" height="54" rx="10" fill="${SCOL.SIMUL}"/><text x="205" y="134" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">SIMUL</text><text x="205" y="151" text-anchor="middle" font-size="10" fill="#fff">Mulegé (aislado)</text>
    <rect x="150" y="180" width="110" height="54" rx="10" fill="${SCOL.SIBCS}"/><text x="205" y="204" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">SIBCS</text><text x="205" y="221" text-anchor="middle" font-size="10" fill="#fff">BCS (aislado)</text>
    <rect x="300" y="60" width="205" height="174" rx="12" fill="${SCOL.SIN}"/><text x="402" y="86" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">SIN</text>
    <text x="402" y="104" text-anchor="middle" font-size="10" fill="#E7F3EB">7 regiones interconectadas</text>
    ${["Central", "Oriental", "Occidental", "Noroeste", "Norte", "Noreste", "Peninsular"].map((r, i) => `<rect x="${314 + (i % 2) * 92}" y="${114 + Math.floor(i / 2) * 28}" width="84" height="22" rx="6" fill="rgba(255,255,255,.18)"/><text x="${356 + (i % 2) * 92}" y="${129 + Math.floor(i / 2) * 28}" text-anchor="middle" font-size="10" fill="#fff">${r}</text>`).join("")}
    <line x1="280" y1="40" x2="280" y2="240" stroke="#B91C1C" stroke-width="2" stroke-dasharray="5 5"/><text x="280" y="30" text-anchor="middle" font-size="10" fill="#B91C1C">✕ sin conexión eléctrica con el SIN</text>
  </svg>`;

  function html() {
    const T = TRANS.kmTension, i = T.anios.length - 1, aT = T.anios[i];
    return `
    <div class="mod-head"><div class="eyebrow">Módulo 2</div><h1>Transmisión eléctrica</h1>
    <p class="sub">La Red Nacional de Transmisión lleva la energía en alta tensión (69 a 400 kV) desde las centrales hasta las redes de distribución.</p></div>

    <section class="sec">
      <div class="sec-head"><div><h2><span class="num">1</span>Los cuatro sistemas eléctricos</h2>
      <p class="sub">La península de Baja California tiene tres sistemas que operan aislados entre sí y del SIN.</p></div></div>
      <div class="map-wrap">
        <div id="mapaT" class="map" role="region" aria-label="Mapa de sistemas eléctricos y centros de control"></div>
        <div class="card map-side" id="tFicha"></div>
      </div>
      <div class="chips" style="margin-top:10px">${Object.keys(SCOL).map(s => `<span class="chip" style="cursor:default"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${SCOL[s]};margin-right:6px"></i>${s}</span>`).join("")}
        <span class="chip" style="cursor:default">◆ Interconexión internacional</span></div>
      <p class="hint">Los círculos marcan la ciudad sede de cada centro de control regional y los rombos, las interconexiones internacionales. <b>No se dibujan trayectorias de líneas</b>: las fuentes no publican su geometría.</p>
      <div class="card" style="margin-top:12px"><h3>Esquema de conexiones</h3>${esquema()}
        <p class="src">SENER · PRODESEN 2024-2038, Anexos, p. 155 (conformación del SEN) y p. 158-159 (enlaces internacionales, Fig. A1.4). Coordenadas: ciudad sede (GeoNames). Mapa base © OpenStreetMap.</p></div>
    </section>

    <section class="sec">
      <div class="sec-head"><div><h2><span class="num">2</span>Indicadores de la red</h2>
      <p class="sub">Datos nacionales de CENACE (vía PRODESEN) y de la red de CFE Transmisión.</p></div></div>
      <div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        <div class="kpi"><span class="scope s-nac">Nacional · ${aT}</span><div class="v">${fmt(T.total[i])} <small>km</small></div><div class="q">Longitud de la RNT</div><p>${T.f}</p></div>
        <div class="kpi"><span class="scope s-nac">Nacional · ${aT}</span><div class="v">${fmt(T.datos["400 kV"][i])} <small>km</small></div><div class="q">Líneas de 400 kV</div><p>La «autopista» del sistema: ${fmt(T.datos["400 kV"][i] / T.total[i] * 100, 1)} % de la red (cálculo).</p></div>
        <div class="kpi"><span class="scope s-cfe">CFE · 2024</span><div class="v">${fmt(TRANS.cfe.mva[2])} <small>MVA</small></div><div class="q">Capacidad de transformación</div><p>${fmt(TRANS.cfe.subest[2])} subestaciones. ${TRANS.cfe.f}.</p></div>
        <div class="kpi"><span class="scope s-cfe">CFE · 2024</span><div class="v">${fmt(TRANS.cfe.saidi[2], 1)} <small>min</small></div><div class="q"><span class="tip" data-t="SAIDI: tiempo promedio de interrupción del sistema, en minutos al año.">SAIDI</span> de transmisión</div><p>2022: ${fmt(TRANS.cfe.saidi[0], 1)} · 2023: ${fmt(TRANS.cfe.saidi[1], 1)} min.</p></div>
      </div>
      <div class="grid2" style="margin-top:14px">
        <div class="card"><span class="scope s-nac">Nacional · ${aT}</span><h3 style="margin-top:6px">Longitud por nivel de tensión</h3><div class="chart-box"><canvas id="t1"></canvas></div><p class="src">${T.f}</p></div>
        <div class="card"><span class="scope s-cfe">CFE · 2022-2024</span><h3 style="margin-top:6px">Crecimiento de la red de CFE</h3><div class="chart-box"><canvas id="t2"></canvas></div>
          <p class="hint">En 2023 CFE reportó 110,559 km y CENACE 110,846 km (cada fuente cuenta activos distintos). En 2024 ambas coinciden: 111,138 km (CFE y PLADESE).</p><p class="src">${TRANS.cfe.f}</p></div>
      </div>
      <div class="card" style="margin-top:14px"><span class="scope s-nac">Nacional · 2021-2023</span><h3 style="margin-top:6px">Capacidad de transformación (MVA)</h3><div class="chart-box" style="height:240px"><canvas id="t3"></canvas></div><p class="src">${TRANS.transfRNT.f}</p></div>
    </section>

    <section class="sec">
      <div class="sec-head"><div><h2><span class="num">3</span>Simulador de transmisión</h2>
      <p class="sub">¿Por qué se transmite en alta tensión? Mueve los controles y observa la corriente y las pérdidas.</p></div></div>
      <div class="grid2">
        <div class="card sim">
          ${ctrl("P", "Potencia transmitida P", 10, 1000, 10, "MW")}
          ${ctrl("V", "Tensión entre líneas V<sub>L</sub>", 69, 400, 1, "kV", [69, 115, 138, 230, 400])}
          ${ctrl("R", "Resistencia equivalente por fase R", 0.5, 30, 0.5, "Ω")}
          ${ctrl("fp", "Factor de potencia cos φ", 0.7, 1, 0.01, "")}
          <button class="btn o" id="simReset" style="margin-top:6px">Valores por defecto</button>
        </div>
        <div class="card"><div id="simOut"></div></div>
      </div>
      <div class="card" style="margin-top:14px"><h3>Pérdidas y corriente según la tensión</h3><p class="hint">Mismos P, R y cos φ, variando solo la tensión de 69 a 400 kV.</p>
        <div class="chart-box"><canvas id="simCh"></canvas></div></div>
      <div class="card" style="margin-top:14px;font-size:.86rem">
        <h3>Supuestos y limitaciones del modelo</h3>
        <ul style="margin:8px 0 0 18px;display:grid;gap:4px">
          <li>Sistema trifásico <b>balanceado</b>; P es la potencia activa total de las tres fases.</li>
          <li>Solo se calculan pérdidas <b>resistivas</b> (efecto Joule, 3·I²·R). Se ignoran reactancia, capacitancia, efecto corona y caída de tensión.</li>
          <li>R es la resistencia equivalente de <b>una fase de toda la línea</b>. En la realidad R depende del conductor y la longitud: una línea de 400 kV suele usar haces de conductores y tener otra R.</li>
          <li>La tensión se considera constante a lo largo de la línea.</li>
          <li>Es un modelo didáctico; no sirve para diseñar líneas reales.</li>
        </ul>
      </div>
    </section>
    <footer>Atlas Eléctrico de México · VERDALUX · TE1020.</footer>`;
  }
  function ctrl(k, lbl, min, max, step, u, marcas) {
    return `<label class="simrow"><span>${lbl}: <b id="v_${k}">${sim[k]}</b> ${u}</span>
      <input type="range" id="r_${k}" min="${min}" max="${max}" step="${step}" value="${sim[k]}" aria-label="${lbl.replace(/<[^>]+>/g, "")}">
      ${marcas ? `<span class="chips">${marcas.map(m => `<button class="chip" data-vk="${m}">${m} kV</button>`).join("")}</span>` : ""}</label>`;
  }

  /* ---------- Cálculo físico ---------- */
  function calcula(P_MW, V_kV, R, fp) {
    const P = P_MW * 1e6, V = V_kV * 1e3;
    const I = P / (Math.sqrt(3) * V * fp);       // A
    const Pp = 3 * I * I * R;                      // W
    return { I, Pp, pct: Pp / P * 100 };
  }
  function actualiza() {
    const { P, V, R, fp } = sim, r = calcula(P, V, R, fp);
    ["P", "V", "R", "fp"].forEach(k => document.getElementById("v_" + k).textContent = k === "fp" ? fp.toFixed(2) : fmt(sim[k], k === "R" ? 1 : 0));
    const den = Math.sqrt(3) * V * 1e3 * fp;
    document.getElementById("simOut").innerHTML = `
      <div class="kpis" style="grid-template-columns:1fr 1fr">
        <div class="kpi"><div class="q">Corriente por fase</div><div class="v">${fmt(r.I, 0)} <small>A</small></div></div>
        <div class="kpi"><div class="q">Pérdidas resistivas</div><div class="v">${fmt(r.Pp / 1e6, 2)} <small>MW</small></div><p>${fmt(r.pct, 2)} % de la potencia transmitida</p></div>
      </div>
      <div class="explain" style="margin-top:12px;font-size:.84rem;line-height:1.7">
        <b>Paso 1 · Corriente:</b> I = P / (√3 · V · cos φ)<br>
        I = ${fmt(P * 1e6)} W / (1.732 × ${fmt(V * 1e3)} V × ${fp.toFixed(2)}) = ${fmt(P * 1e6)} / ${fmt(den)} = <b>${fmt(r.I, 1)} A</b><br>
        <b>Paso 2 · Pérdidas:</b> P<sub>pérdidas</sub> = 3 · I² · R<br>
        = 3 × (${fmt(r.I, 1)} A)² × ${fmt(R, 1)} Ω = 3 × ${fmt(r.I * r.I, 0)} × ${fmt(R, 1)} = <b>${fmt(r.Pp, 0)} W = ${fmt(r.Pp / 1e6, 3)} MW</b><br>
        <b>Paso 3 · Porcentaje:</b> ${fmt(r.Pp / 1e6, 3)} / ${fmt(P)} MW × 100 = <b>${fmt(r.pct, 2)} %</b>
      </div>
      <p class="hint">Si se duplica la tensión, la corriente se reduce a la mitad y las pérdidas a la <b>cuarta parte</b> (dependen de I²).</p>`;
    const Vs = [69, 85, 115, 138, 161, 230, 300, 400];
    simChart.data.labels = Vs.map(v => v + " kV");
    simChart.data.datasets[0].data = Vs.map(v => +(calcula(P, v, R, fp).Pp / 1e6).toFixed(3));
    simChart.data.datasets[1].data = Vs.map(v => +calcula(P, v, R, fp).I.toFixed(1));
    simChart.data.datasets[0].backgroundColor = Vs.map(v => v === V ? "#16A34A" : "#B8C0CA");
    simChart.update();
  }

  function render() {
    charts.forEach(c => c.destroy()); charts = [];
    if (mapa) { mapa.remove(); mapa = null; }
    document.getElementById("view").innerHTML = html();
    const base = extra => Object.assign({ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 11 } } } }, extra);

    // Mapa
    mapa = L.map("mapaT", { scrollWheelZoom: false }).setView([24, -103], 5);
    capaBase(mapa);
    const fichaS = c => document.getElementById("tFicha").innerHTML = `<span class="pill" style="background:${SCOL[c.s]}">${c.s}</span>
      <h3 style="margin:8px 0 2px">Centro de control ${c.n}</h3><p class="sub" style="font-size:.85rem">📍 ${c.c}</p>
      <p style="font-size:.86rem;margin-top:10px">${SNOM[c.s]}. ${c.s === "SIN" ? "Comparte recursos y reservas con las otras seis regiones del SIN." : c.s === "SIBC" ? "Interconectado con el oeste de EE. UU. (WECC) por dos líneas de 230 kV; no está conectado al SIN." : "Opera eléctricamente aislado del SIN y de los demás sistemas."}</p>
      <p class="src">SENER · PRODESEN 2024-2038, Anexos, p. 155.</p>`;
    TRANS.centros.forEach(c => L.circleMarker([c.lat, c.lon], { radius: 11, color: "#fff", weight: 2, fillColor: SCOL[c.s], fillOpacity: .9 })
      .bindTooltip(`<b>${c.n}</b> (${c.s})<br>${c.c}`).on("click", () => fichaS(c)).addTo(mapa));
    TRANS.internac.forEach(x => L.marker([x.lat, x.lon], { icon: L.divIcon({ className: "", html: `<div class="rombo" style="background:${SCOL[x.s]}"></div>`, iconSize: [14, 14] }) })
      .bindTooltip(`<b>${x.n}</b>`).on("click", () => document.getElementById("tFicha").innerHTML = `<span class="pill" style="background:#2B4C7E">Interconexión internacional</span>
        <h3 style="margin:8px 0 2px">${x.n}</h3><p style="font-size:.86rem;margin-top:8px"><b>Tensión:</b> ${x.kv || '<span class="na">Dato no disponible</span>'}<br><b>Capacidad:</b> ${x.cap}<br>${x.nota}</p>
        <p class="src">SENER · PRODESEN 2024-2038, Anexos, Fig. A1.4 y p. 158 (2023). Ubicación aproximada: ciudad fronteriza mexicana.</p>`).addTo(mapa));
    fichaS(TRANS.centros[7]);

    // Gráficas
    const T = TRANS.kmTension, niv = Object.keys(T.datos), iL = T.anios.length - 1;
    charts.push(new Chart(document.getElementById("t1"), { type: "bar", data: { labels: niv, datasets: [{ data: niv.map(n => T.datos[n][iL]), backgroundColor: niv.map(n => n === "400 kV" ? "#14532D" : n === "230 kV" ? "#16A34A" : "#B8C0CA"), borderRadius: 5 }] },
      options: base({ plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${fmt(c.raw)} km (${fmt(c.raw / T.total[iL] * 100, 1)} %)` } } }, scales: { y: { ticks: { callback: v => fmt(v) } } } }) }));
    const C = TRANS.cfe;
    charts.push(new Chart(document.getElementById("t2"), { data: { labels: C.anios, datasets: [
      { type: "bar", label: "Km de líneas", data: C.km, backgroundColor: "#3F4448", yAxisID: "y", borderRadius: 5 },
      { type: "line", label: "Subestaciones", data: C.subest, borderColor: "#16A34A", backgroundColor: "#16A34A", yAxisID: "y2", tension: .3 }] },
      options: base({ scales: { y: { min: 109000, ticks: { callback: v => fmt(v) } }, y2: { position: "right", grid: { display: false } } } }) }));
    const TR = TRANS.transfRNT;
    charts.push(new Chart(document.getElementById("t3"), { type: "bar", data: { labels: TR.anios, datasets: [
      { label: "Bancos de la RNT", data: TR.rnt, backgroundColor: "#3F4448" }, { label: "Bancos de las RGD del MEM", data: TR.rgd, backgroundColor: "#16A34A" }] },
      options: base({ indexAxis: "y", scales: { x: { stacked: true, ticks: { callback: v => fmt(v) } }, y: { stacked: true } } }) }));

    // Simulador
    simChart = new Chart(document.getElementById("simCh"), { data: { labels: [], datasets: [
      { type: "bar", label: "Pérdidas (MW)", data: [], yAxisID: "y", borderRadius: 5 },
      { type: "line", label: "Corriente (A)", data: [], borderColor: "#14532D", backgroundColor: "#14532D", yAxisID: "y2", tension: .3 }] },
      options: base({ scales: { y: { title: { display: true, text: "Pérdidas (MW)" } }, y2: { position: "right", grid: { display: false }, title: { display: true, text: "Corriente (A)" } } } }) });
    charts.push(simChart);
    ["P", "V", "R", "fp"].forEach(k => document.getElementById("r_" + k).oninput = e => { sim[k] = +e.target.value; actualiza(); });
    document.querySelectorAll("[data-vk]").forEach(b => b.onclick = () => { sim.V = +b.dataset.vk; document.getElementById("r_V").value = sim.V; actualiza(); });
    document.getElementById("simReset").onclick = () => { Object.assign(sim, { P: 300, V: 230, R: 5, fp: 1 }); ["P", "V", "R", "fp"].forEach(k => document.getElementById("r_" + k).value = sim[k]); actualiza(); };
    actualiza();
  }
  return { render, calcula };
})();
