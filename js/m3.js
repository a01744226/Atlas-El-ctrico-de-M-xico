/* =====================================================================
   MÓDULO 3 · DISTRIBUCIÓN ELÉCTRICA
   ===================================================================== */
const M3 = (() => {
  const fmt = (n, d = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
  const PAL = ["#14532D", "#16A34A", "#4ADE80", "#0F766E", "#65A30D", "#3F4448", "#6B7176", "#8A9096", "#B8C0CA", "#A3B18A", "#B45309", "#2B4C7E", "#7C3AED", "#0E7490", "#BE185D", "#CA8A04"];
  const DIVS = ["Baja California", "Noroeste", "Norte", "Golfo Norte", "Jalisco", "Bajío", "Centro Occidente", "Golfo Centro", "Centro Oriente", "Centro Sur", "Oriente", "Sureste", "Peninsular", "Valle de México Norte", "Valle de México Centro", "Valle de México Sur"];
  const colDiv = d => PAL[DIVS.indexOf(d.split(" / ")[0])] || "#999";
  let charts = [], mapa = null, trChart = null, filtroDiv = "Todas";
  const tr = { Vp: 13200, a: 55, S: 75 };

  function html() {
    const D = DIST.cfe, R = DIST.redes2023, Cn = DIST.consumo2024;
    const resGWh = Cn.resPJ / 3.6 * 1000, indGWh = Cn.indPJ / 3.6 * 1000;
    return `
    <div class="mod-head"><div class="eyebrow">Módulo 3</div><h1>Distribución eléctrica</h1>
    <p class="sub">Las Redes Generales de Distribución reducen la tensión y llevan la electricidad a casas, comercios e industrias.</p></div>

    <section class="sec">
      <div class="sec-head"><div><h2><span class="num">1</span>Divisiones de distribución de CFE</h2>
      <p class="sub">CFE Distribución opera <b>${DIST.divisiones.v} divisiones</b> y <b>${DIST.divisiones.zonas} zonas</b> (${DIST.divisiones.f}). Cada círculo es la capital de un estado, coloreada por su división principal.</p></div></div>
      <div class="card" style="border-left:4px solid var(--warn);margin-bottom:12px;font-size:.84rem">⚠ <b>Versión preliminar.</b> Las divisiones no siguen los límites estatales y varios estados se reparten entre dos o más divisiones. Los marcadores con borde sólido están confirmados por el Estatuto Orgánico de CFE Distribución (art. 26); los de borde punteado son una <b>aproximación</b>.</div>
      <div class="chips" id="dvF" style="margin-bottom:10px"><button class="chip" data-d="Todas" aria-pressed="true">Todas</button>${DIVS.map(d => `<button class="chip" data-d="${d}" aria-pressed="false"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${colDiv(d)};margin-right:5px"></i>${d}</button>`).join("")}</div>
      <div class="map-wrap"><div id="mapaD" class="map" role="region" aria-label="Mapa de divisiones de distribución"></div><div class="card map-side" id="dFicha"></div></div>
      <p class="src">Lista de divisiones: Estatuto Orgánico de CFE Distribución, DOF 04/01/2018, art. 5 (consultado en SIDOF/Segob). Ámbito por estado: art. 26 (parcial) y aproximación propia. Coordenadas: capital estatal (GeoNames). Mapa base © OpenStreetMap.</p>
    </section>

    <section class="sec">
      <div class="sec-head"><div><h2><span class="num">2</span>Indicadores de distribución</h2>
      <p class="sub">Todos son <b>nacionales</b>: no se reparten por división porque las fuentes no publican esas cifras.</p></div></div>
      <div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        <div class="kpi"><span class="scope s-cfe">CFE · 2024</span><div class="v">${fmt(D.usuarios[2], 1)} <small>millones</small></div><div class="q">Usuarios atendidos</div><p>Electrificación nacional 2023: ${fmt(DIST.electrif2023.v, 2)} %.</p></div>
        <div class="kpi"><span class="scope s-cfe">CFE · 2024</span><div class="v">${fmt(D.km[2])} <small>mil km</small></div><div class="q">Longitud de redes de distribución</div><p>Unas ${fmt(D.km[2] / 111.138, 1)} veces la red de transmisión (cálculo).</p></div>
        <div class="kpi"><span class="scope s-cfe">CFE · 2024</span><div class="v">${fmt(D.perdAT[2], 2)} <small>%</small></div><div class="q"><span class="tip" data-t="Pérdidas: energía que entra a la red y no se factura. Incluye pérdidas técnicas (calentamiento de conductores y transformadores) y no técnicas (usos ilícitos, errores de medición).">Pérdidas de energía</span></div><p>Incluye alta tensión. Solo media + baja tensión: ${fmt(D.perdMTBT[2], 2)} %.</p></div>
        <div class="kpi"><span class="scope s-cfe">CFE · 2024</span><div class="v">${fmt(D.saidi[2], 1)} <small>min</small></div><div class="q"><span class="tip" data-t="SAIDI: minutos promedio al año que un usuario se queda sin servicio.">Continuidad (SAIDI)</span></div><p>Bajó desde ${fmt(D.saidi[0], 1)} min en 2022.</p></div>
      </div>
      <div class="grid2" style="margin-top:14px">
        <div class="card"><span class="scope s-cfe">CFE · 2022-2024</span><h3 style="margin-top:6px">Usuarios y pérdidas</h3><div class="chart-box"><canvas id="d1"></canvas></div><p class="src">${D.f}</p></div>
        <div class="card"><span class="scope s-nac">Nacional · 2023</span><h3 style="margin-top:6px">Redes de media y baja tensión</h3><div class="chart-box"><canvas id="d2"></canvas></div>
          <p class="hint">MT + BT = ${fmt(R.mt + R.bt)} km: coincide con los 894 mil km que reporta CFE para 2023. ${fmt(R.trafos)} transformadores MT/BT.</p><p class="src">${R.f}</p></div>
      </div>
      <div class="card" style="margin-top:14px"><span class="scope s-nac">Nacional · 2024</span><h3 style="margin-top:6px">Consumo eléctrico residencial vs. industrial</h3>
        <div class="grid2"><div class="chart-box" style="height:240px"><canvas id="d3"></canvas></div>
        <div style="font-size:.88rem;align-self:center">
          <p>Industria: <b>${fmt(Cn.indPJ, 2)} PJ</b> ≈ ${fmt(indGWh)} GWh · Hogares: <b>${fmt(Cn.resPJ, 2)} PJ</b> ≈ ${fmt(resGWh)} GWh.</p>
          <p style="margin-top:8px">La industria consume <b>${fmt(indGWh / resGWh, 1)} veces</b> más electricidad que los hogares.</p>
          <p style="margin-top:8px">Por vivienda: ${fmt(resGWh)} GWh ÷ ${Cn.viviendas} millones ≈ <b>${fmt(resGWh * 1e6 / (Cn.viviendas * 1e6))} kWh/año</b> (≈ ${fmt(resGWh * 1e6 / (Cn.viviendas * 1e6) / 12)} kWh al mes).</p>
          <p class="hint">Conversión: 1 PJ = 277.8 GWh. Todos los GWh son cálculo.</p></div></div>
        <p class="src">${Cn.f}</p></div>
    </section>

    <section class="sec">
      <div class="sec-head"><div><h2><span class="num">3</span>Simulador de transformador</h2>
      <p class="sub">¿Cómo se reduce la tensión antes de llegar a tu casa? Un transformador de distribución baja la media tensión a baja tensión.</p></div></div>
      <div class="grid2">
        <div class="card sim">
          <label class="simrow"><span>Tensión primaria V<sub>p</sub>: <b id="tvVp"></b> V</span><input type="range" id="tVp" min="2400" max="34500" step="100" value="${tr.Vp}" aria-label="Tensión primaria">
            <span class="chips">${[13200, 23000, 34500].map(v => `<button class="chip" data-vp="${v}">${fmt(v / 1000, 1)} kV</button>`).join("")}</span></label>
          <label class="simrow"><span>Relación de espiras N<sub>p</sub>/N<sub>s</sub>: <b id="tva"></b></span><input type="range" id="ta" min="5" max="300" step="1" value="${tr.a}" aria-label="Relación de espiras"></label>
          <label class="simrow"><span>Potencia aparente S: <b id="tvS"></b> kVA</span><input type="range" id="tS" min="5" max="500" step="5" value="${tr.S}" aria-label="Potencia aparente">
            <span class="chips">${[25, 37.5, 50, 75, 112.5].map(v => `<button class="chip" data-s="${v}">${v} kVA</button>`).join("")}</span></label>
          <button class="btn o" id="trReset">Valores por defecto</button>
          <svg viewBox="0 0 300 120" style="width:100%;margin-top:12px" aria-hidden="true">
            <rect x="120" y="15" width="60" height="90" rx="6" fill="none" stroke="#3F4448" stroke-width="5"/>
            <path d="M120 35 h-30 M120 85 h-30" stroke="#16A34A" stroke-width="3"/><path d="M180 45 h30 M180 75 h30" stroke="#0F766E" stroke-width="3"/>
            ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M115 ${32 + i * 10} a6 5 0 0 1 10 0" fill="none" stroke="#16A34A" stroke-width="2.5"/>`).join("")}
            ${[0, 1, 2].map(i => `<path d="M175 ${48 + i * 10} a6 5 0 0 0 10 0" fill="none" stroke="#0F766E" stroke-width="2.5"/>`).join("")}
            <text x="60" y="64" font-size="11" text-anchor="middle" fill="#16A34A" font-weight="700">Primario</text><text x="245" y="64" font-size="11" text-anchor="middle" fill="#0F766E" font-weight="700">Secundario</text>
          </svg>
        </div>
        <div class="card"><div id="trOut"></div></div>
      </div>
      <div class="card" style="margin-top:14px"><h3>Tensión y corriente del secundario según la relación de espiras</h3><p class="hint">Con la misma V<sub>p</sub> y S: al aumentar N<sub>p</sub>/N<sub>s</sub> baja V<sub>s</sub> y sube I<sub>s</sub>.</p><div class="chart-box"><canvas id="trCh"></canvas></div></div>
      <div class="card" style="margin-top:14px;font-size:.86rem"><h3>Supuestos del transformador ideal</h3>
        <ul style="margin:8px 0 0 18px;display:grid;gap:4px">
          <li>Sin pérdidas: eficiencia de 100 % (sin pérdidas en el cobre ni en el núcleo), por eso V<sub>p</sub>·I<sub>p</sub> = V<sub>s</sub>·I<sub>s</sub>.</li>
          <li>Acoplamiento magnético perfecto (sin flujo de dispersión) y corriente de magnetización despreciable.</li>
          <li>Se modela <b>monofásico</b>: S = V·I. Para un trifásico se usaría S = √3·V<sub>L</sub>·I<sub>L</sub>.</li>
          <li>Unidades: V en volts, I en amperes y S en volt-amperes (1 kVA = 1,000 VA).</li>
          <li>Los transformadores reales tienen eficiencias altas, pero no de 100 %; parte de las pérdidas técnicas de distribución ocurre en ellos.</li>
        </ul></div>
    </section>
    <footer>Atlas Eléctrico de México · VERDALUX · TE1020.</footer>`;
  }

  function ficha(e) {
    document.getElementById("dFicha").innerHTML = `<span class="pill" style="background:${colDiv(e.d)}">${e.d}</span>
      <h3 style="margin:8px 0 2px">${e.e}</h3><p class="sub" style="font-size:.85rem">📍 Marcador: ${e.c}</p>
      <p style="font-size:.86rem;margin-top:10px">División principal: <b>${e.d}</b><br>${e.ver ? "✅ Confirmado en el Estatuto (art. 26)." : "⚠ Aproximación: no se pudo verificar el ámbito territorial de esta división."}</p>
      <p class="hint">Usuarios, km de red y pérdidas por división: <span class="na">Dato no disponible</span>.</p>`;
  }
  function pintarMapa() {
    if (mapa._capa) mapa._capa.remove();
    mapa._capa = L.layerGroup().addTo(mapa);
    DIV_ESTADOS.filter(e => filtroDiv === "Todas" || e.d.includes(filtroDiv)).forEach(e =>
      L.circleMarker([e.lat, e.lon], { radius: 11, color: e.ver ? "#fff" : "#24282B", weight: 2, dashArray: e.ver ? null : "3 3", fillColor: colDiv(e.d), fillOpacity: .9 })
        .bindTooltip(`<b>${e.e}</b><br>${e.d}`).on("click", () => ficha(e)).addTo(mapa._capa));
  }

  function actualizaTr() {
    const { Vp, a, S } = tr, Svas = S * 1000;
    const Vs = Vp / a, Ip = Svas / Vp, Is = Svas / Vs;
    document.getElementById("tvVp").textContent = fmt(Vp);
    document.getElementById("tva").textContent = a;
    document.getElementById("tvS").textContent = fmt(S, S % 1 ? 1 : 0);
    document.getElementById("trOut").innerHTML = `
      <div class="kpis" style="grid-template-columns:1fr 1fr">
        <div class="kpi"><div class="q">Tensión secundaria</div><div class="v">${fmt(Vs, 1)} <small>V</small></div></div>
        <div class="kpi"><div class="q">Corriente secundaria</div><div class="v">${fmt(Is, 1)} <small>A</small></div><p>Corriente primaria: ${fmt(Ip, 2)} A</p></div>
      </div>
      <div class="explain" style="margin-top:12px;font-size:.84rem;line-height:1.7">
        <b>Paso 1 · Tensión:</b> V<sub>p</sub>/V<sub>s</sub> = N<sub>p</sub>/N<sub>s</sub> → V<sub>s</sub> = V<sub>p</sub> / a<br>
        V<sub>s</sub> = ${fmt(Vp)} V / ${a} = <b>${fmt(Vs, 2)} V</b><br>
        <b>Paso 2 · Corriente primaria:</b> I<sub>p</sub> = S / V<sub>p</sub> = ${fmt(Svas)} VA / ${fmt(Vp)} V = <b>${fmt(Ip, 3)} A</b><br>
        <b>Paso 3 · Corriente secundaria:</b> V<sub>p</sub>·I<sub>p</sub> = V<sub>s</sub>·I<sub>s</sub> → I<sub>s</sub> = S / V<sub>s</sub> = ${fmt(Svas)} / ${fmt(Vs, 2)} = <b>${fmt(Is, 2)} A</b><br>
        <b>Comprobación:</b> V<sub>p</sub>·I<sub>p</sub> = ${fmt(Vp * Ip, 0)} VA = V<sub>s</sub>·I<sub>s</sub> = ${fmt(Vs * Is, 0)} VA ✓
      </div>
      <p class="hint">La tensión baja ${a} veces y la corriente sube ${a} veces: la potencia se conserva. Por eso el secundario usa conductores más gruesos.</p>`;
    const as = [10, 25, 50, 55, 75, 100, 150, 200, 300];
    trChart.data.labels = as.map(x => "a = " + x);
    trChart.data.datasets[0].data = as.map(x => +(Vp / x).toFixed(1));
    trChart.data.datasets[1].data = as.map(x => +(Svas / (Vp / x)).toFixed(1));
    trChart.update();
  }

  function render() {
    charts.forEach(c => c.destroy()); charts = [];
    if (mapa) { mapa.remove(); mapa = null; }
    document.getElementById("view").innerHTML = html();
    const base = extra => Object.assign({ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 11 } } } }, extra);

    mapa = L.map("mapaD", { scrollWheelZoom: false }).setView([23.5, -102], 5);
    capaBase(mapa);
    pintarMapa(); ficha(DIV_ESTADOS[0]);
    document.getElementById("dvF").onclick = e => { const b = e.target.closest("[data-d]"); if (!b) return; filtroDiv = b.dataset.d;
      document.querySelectorAll("#dvF .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); pintarMapa(); };

    const D = DIST.cfe;
    charts.push(new Chart(document.getElementById("d1"), { data: { labels: D.anios, datasets: [
      { type: "bar", label: "Usuarios (millones)", data: D.usuarios, backgroundColor: "#3F4448", yAxisID: "y", borderRadius: 5 },
      { type: "line", label: "Pérdidas con AT (%)", data: D.perdAT, borderColor: "#B91C1C", backgroundColor: "#B91C1C", yAxisID: "y2", tension: .3 },
      { type: "line", label: "Pérdidas MT+BT (%)", data: D.perdMTBT, borderColor: "#B45309", backgroundColor: "#B45309", borderDash: [5, 4], yAxisID: "y2", tension: .3 }] },
      options: base({ scales: { y: { min: 45, title: { display: true, text: "millones" } }, y2: { position: "right", min: 8, max: 15, grid: { display: false }, ticks: { callback: v => v + " %" } } } }) }));
    const R = DIST.redes2023;
    charts.push(new Chart(document.getElementById("d2"), { type: "doughnut", data: { labels: ["Media tensión (2.4-34 kV)", "Baja tensión (< 2.4 kV)"], datasets: [{ data: [R.mt, R.bt], backgroundColor: ["#14532D", "#4ADE80"] }] },
      options: base({ cutout: "55%", plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: c => ` ${fmt(c.raw)} km` } } } }) }));
    const Cn = DIST.consumo2024;
    charts.push(new Chart(document.getElementById("d3"), { type: "bar", data: { labels: ["Industrial", "Residencial"], datasets: [{ data: [Cn.indPJ / 3.6 * 1000, Cn.resPJ / 3.6 * 1000].map(v => Math.round(v)), backgroundColor: ["#3F4448", "#16A34A"], borderRadius: 6 }] },
      options: base({ indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${fmt(c.raw)} GWh (cálculo)` } } }, scales: { x: { ticks: { callback: v => fmt(v) } } } }) }));

    trChart = new Chart(document.getElementById("trCh"), { data: { labels: [], datasets: [
      { type: "bar", label: "Vs (V)", data: [], backgroundColor: "#16A34A", yAxisID: "y", borderRadius: 4 },
      { type: "line", label: "Is (A)", data: [], borderColor: "#24282B", backgroundColor: "#24282B", yAxisID: "y2", tension: .3 }] },
      options: base({ scales: { y: { type: "logarithmic", title: { display: true, text: "Vs (V, escala log)" } }, y2: { position: "right", grid: { display: false }, title: { display: true, text: "Is (A)" } } } }) });
    charts.push(trChart);
    [["tVp", "Vp"], ["ta", "a"], ["tS", "S"]].forEach(([id, k]) => document.getElementById(id).oninput = e => { tr[k] = +e.target.value; actualizaTr(); });
    document.querySelectorAll("[data-vp]").forEach(b => b.onclick = () => { tr.Vp = +b.dataset.vp; document.getElementById("tVp").value = tr.Vp; actualizaTr(); });
    document.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { tr.S = +b.dataset.s; document.getElementById("tS").value = tr.S; actualizaTr(); });
    document.getElementById("trReset").onclick = () => { Object.assign(tr, { Vp: 13200, a: 55, S: 75 }); document.getElementById("tVp").value = 13200; document.getElementById("ta").value = 55; document.getElementById("tS").value = 75; actualizaTr(); };
    actualizaTr();
  }
  return { render };
})();
