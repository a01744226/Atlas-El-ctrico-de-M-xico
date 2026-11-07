/* =====================================================================
   MÓDULO 0 · AMPLIACIÓN VISUAL: diferencias entre fósiles, nucleares y renovables
   1) Matriz renovable × limpia   2) Cadenas de conversión comparadas
   3) Flujo de energía (Sankey)   4) Capacidad ≠ energía (factor de planta)
   5) Simulador «¿Qué pasa si…?»
   ===================================================================== */
const M0X = (() => {
  const fmt = (n, d = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
  const COL = { fosil: "#6B7176", nuclear: "#B8C0CA", renovable: "#16A34A", cogen: "#A3B18A" };
  const NOM = { fosil: "Fósil", nuclear: "Nuclear", renovable: "Renovable", cogen: "Cogeneración eficiente" };
  const P = PLADESE24, H = P.horas;
  const fp = t => P.tec[t].gwh * 1000 / (P.tec[t].mw * H); // factor de planta (fracción)
  let charts = [];

  /* =================== 1. MATRIZ RENOVABLE × LIMPIA =================== */
  const T2 = [
    { n: "Solar fotovoltaica", r: 1, l: 1, gwh: 18640, dir: 0 }, { n: "Eólica", r: 1, l: 1, gwh: 19987, dir: 0 },
    { n: "Hidroeléctrica", r: 1, l: 1, gwh: 23800, dir: 0 }, { n: "Geotérmica", r: 1, l: 1, gwh: 3576, dir: 0 },
    { n: "Bioenergía", r: 1, l: 1, gwh: 533, dir: 1 }, { n: "Nucleoeléctrica", r: 0, l: 1, gwh: 11978, dir: 0 },
    { n: "Cogeneración eficiente", r: 0, l: 1, gwh: 3912, dir: 1 }, { n: "Ciclo combinado", r: 0, l: 0, gwh: 212819, dir: 1 },
    { n: "Carboeléctrica", r: 0, l: 0, gwh: 12968, dir: 1 }, { n: "Vapor convencional", r: 0, l: 0, gwh: 28228, dir: 1 },
    { n: "Turbogás", r: 0, l: 0, gwh: 12017, dir: 1 }, { n: "Combustión interna", r: 0, l: 0, gwh: 3847, dir: 1 },
  ];
  const FB2 = {
    "Bioenergía": "Renovable (la biomasa se repone) y limpia por ley, pero SÍ tiene emisiones directas al quemarse: el carbono es de origen biológico.",
    "Nucleoeléctrica": "Limpia (0 emisiones directas) pero NO renovable: el uranio es un mineral finito.",
    "Cogeneración eficiente": "Normalmente quema gas natural (fósil, no renovable), pero la ley la considera limpia si aprovecha el calor con alta eficiencia.",
    "Geotérmica": "Renovable si el yacimiento se gestiona; sin combustión.",
  };
  const Q = [[1, 1, "Renovable y limpia"], [0, 1, "No renovable, pero limpia"], [1, 0, "Renovable, pero no limpia"], [0, 0, "Ni renovable ni limpia"]];
  let sel2 = null;
  const sec2x2 = () => `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Matriz de dos ejes: ¿renovable? × ¿limpia?</h2>
    <p class="sub"><b>Renovable</b> es un concepto físico (el recurso se repone). <b>Limpia</b> es un concepto legal (renovables + nuclear + cogeneración eficiente). Coloca cada tecnología en su cuadrante.</p></div>
    <div class="chips"><button class="btn g" id="q2Check">Revisar</button><button class="btn o" id="q2Reset">Reiniciar</button></div></div>
    <div class="pool bin2" data-q="pool" id="q2Pool"></div>
    <div class="q2wrap">
      <div class="q2axis-y"><span>RENOVABLE</span><span>NO RENOVABLE</span></div>
      <div>
        <div class="q2axis-x"><span>LIMPIA (por ley)</span><span>NO LIMPIA</span></div>
        <div class="q2grid">${[[1, 1], [1, 0], [0, 1], [0, 0]].map(([r, l]) => `<div class="q2cell bin2" data-q="${r}${l}" tabindex="0" role="button" aria-label="${Q.find(q => q[0] === r && q[1] === l)[2]}">
          <div class="q2lbl">${Q.find(q => q[0] === r && q[1] === l)[2]}</div><div class="q2share" id="q2s${r}${l}"></div></div>`).join("")}</div>
      </div>
    </div>
    <div class="score" id="q2Score"></div><div class="feedback" id="q2Fb"></div>
    <p class="src">Clasificación legal: LSE (DOF 18/03/2025) y PRODESEN. Generación 2024 por cuadrante: ${P.f}. 🔥 = emisiones directas de CO₂ en la central.</p>
  </section>`;
  function init2x2() {
    document.getElementById("q2Pool").innerHTML = [...T2].sort(() => Math.random() - .5).map(t => `<button class="tcard" draggable="true" data-n="${t.n}">${t.n}${t.dir ? ' <span title="Emisiones directas">🔥</span>' : ""}</button>`).join("");
    document.querySelectorAll(".q2share").forEach(e => e.innerHTML = ""); document.querySelectorAll(".q2cell").forEach(c => c.classList.remove("rev"));
    document.getElementById("q2Score").innerHTML = `<span class="hint">${T2.length} tecnologías por colocar. Pista: hay un cuadrante que la ley deja vacío.</span>`;
    document.getElementById("q2Fb").innerHTML = ""; sel2 = null;
  }
  function bind2x2() {
    const root = document.querySelector(".q2-root");
    root.addEventListener("dragstart", e => { const c = e.target.closest(".tcard"); if (c) e.dataTransfer.setData("text/plain", c.dataset.n); });
    root.querySelectorAll(".bin2").forEach(b => {
      b.addEventListener("dragover", e => { e.preventDefault(); b.classList.add("over"); });
      b.addEventListener("dragleave", () => b.classList.remove("over"));
      b.addEventListener("drop", e => { e.preventDefault(); b.classList.remove("over"); const c = root.querySelector(`.tcard[data-n="${e.dataTransfer.getData("text/plain")}"]`); if (c) { b.appendChild(c); c.classList.remove("ok", "bad", "sel"); } });
      const put = e => { if (sel2 && !e.target.closest(".tcard")) { b.appendChild(sel2); sel2.classList.remove("sel", "ok", "bad"); sel2 = null; } };
      b.addEventListener("click", put);
      b.addEventListener("keydown", e => { if (e.target.closest(".tcard")) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); put(e); } });
    });
    root.addEventListener("click", e => { const c = e.target.closest(".tcard"); if (!c) return; e.stopPropagation();
      if (sel2 === c) { c.classList.remove("sel"); sel2 = null; return; } root.querySelectorAll(".tcard.sel").forEach(x => x.classList.remove("sel")); c.classList.add("sel"); sel2 = c; });
    document.getElementById("q2Reset").onclick = init2x2;
    document.getElementById("q2Check").onclick = () => {
      let ok = 0, bad = 0; const fb = [];
      root.querySelectorAll(".tcard").forEach(c => { const t = T2.find(x => x.n === c.dataset.n), q = c.parentElement.dataset.q; c.classList.remove("ok", "bad");
        if (q === "pool") return; if (q === `${t.r}${t.l}`) { ok++; c.classList.add("ok"); if (FB2[t.n]) fb.push(`<div class="fb ok"><b>${t.n} ✓</b> ${FB2[t.n]}</div>`); }
        else { bad++; c.classList.add("bad"); fb.push(`<div class="fb bad"><b>${t.n}</b> va en «${Q.find(x => x[0] === t.r && x[1] === t.l)[2]}». ${FB2[t.n] || ""}</div>`); } });
      document.getElementById("q2Score").innerHTML = `<div><b style="color:var(--ok)">${ok}</b> aciertos</div><div><b style="color:var(--bad)">${bad}</b> errores</div><div class="hint">${fmt(ok / T2.length * 100)} %</div>`;
      // Revelar participación real 2024 de cada cuadrante
      for (const [r, l] of [[1, 1], [0, 1], [1, 0], [0, 0]]) {
        const g = T2.filter(t => t.r === r && t.l === l).reduce((s, t) => s + t.gwh, 0), pct = g / P.totalGWh * 100;
        document.getElementById(`q2s${r}${l}`).innerHTML = g ? `<b>${fmt(pct, 1)} %</b> de la generación 2024<br><span>${fmt(g)} GWh</span><div class="q2bar"><i style="width:${Math.max(pct, 1)}%"></i></div>` : `<b>0 %</b><br><span>La ley considera limpias a todas las renovables: este cuadrante está vacío.</span>`;
        document.querySelector(`.q2cell[data-q="${r}${l}"]`).classList.add("rev");
      }
      document.getElementById("q2Fb").innerHTML = (bad === 0 && ok === T2.length ? `<div class="fb ok"><b>¡Perfecto!</b> Observa: lo limpio no renovable (nuclear + cogeneración) es solo ${fmt((11978 + 3912) / P.totalGWh * 100, 1)} % de la generación, y el cuadrante «ni renovable ni limpia» domina con ${fmt(269879 / P.totalGWh * 100, 1)} %.</div>` : "") + fb.join("");
    };
  }

  /* =================== 2. CADENAS DE CONVERSIÓN COMPARADAS =================== */
  const COLS = ["Recurso", "Conversión primaria", "Calor", "Vapor (Rankine)", "Turbina", "Generador", "Acondicionamiento", "Electricidad"];
  const FILAS = [
    { r: "Gas natural", t: "fosil", c: ["Gas natural|fuel", "Combustión|co2", "Gases a alta temperatura", "Recuperador de calor → vapor", "Turbina de gas + turbina de vapor", "Generador síncrono", "Transformador elevador", "CA 60 Hz"] },
    { r: "Carbón", t: "fosil", c: ["Carbón mineral|fuel", "Combustión|co2", "Caldera", "Vapor a alta presión", "Turbina de vapor", "Generador síncrono", "Transformador elevador", "CA 60 Hz"] },
    { r: "Uranio", t: "nuclear", c: ["Uranio enriquecido|fuel", "Fisión nuclear", "Reactor", "Vapor", "Turbina de vapor", "Generador síncrono", "Transformador elevador", "CA 60 Hz"] },
    { r: "Calor geotérmico", t: "renovable", c: ["Yacimiento geotérmico", "—", "Calor natural del subsuelo", "Vapor del yacimiento", "Turbina de vapor", "Generador síncrono", "Transformador elevador", "CA 60 Hz"] },
    { r: "Agua", t: "renovable", c: ["Agua en presa", "Caída: potencial → cinética", "—", "—", "Turbina hidráulica", "Generador síncrono", "Transformador elevador", "CA 60 Hz"] },
    { r: "Viento", t: "renovable", c: ["Viento", "Energía cinética del aire", "—", "—", "Rotor del aerogenerador", "Generador", "Convertidor + transformador", "CA 60 Hz"] },
    { r: "Radiación solar", t: "renovable", c: ["Radiación solar", "Efecto fotovoltaico → CD", "—", "—", "—", "— (sin piezas que giren)", "Inversor CD → CA", "CA 60 Hz"] },
  ];
  const LENTES = {
    co2: { t: "¿Dónde se emite CO₂?", d: "Solo donde hay combustión. La nuclear, la geotermia, el agua, el viento y el sol no queman nada al generar (sus emisiones de ciclo de vida provienen de fabricación, construcción y minería).", m: (c, i) => c.endsWith("|co2") },
    fuel: { t: "¿Qué consume combustible?", d: "Fósiles y nuclear consumen un combustible que se agota y hay que extraer, procesar y transportar. Las renovables usan un flujo natural que no se «gasta».", m: (c) => c.endsWith("|fuel") },
    calor: { t: "¿Quién usa calor y vapor?", d: "Gas, carbón, uranio y geotermia comparten el mismo «motor»: calor → vapor → turbina (ciclo Rankine). Cambia solo la fuente de calor. Por eso una nucleoeléctrica se parece más a una carboeléctrica que a un parque solar.", m: (c, i) => (i === 2 || i === 3) && c !== "—" },
    giro: { t: "¿Quién necesita algo que gire?", d: "Todas excepto la fotovoltaica usan una turbina o rotor que mueve un generador por inducción electromagnética. La FV produce corriente directa sin movimiento y necesita un inversor.", m: (c, i) => (i === 4 || i === 5) && !c.startsWith("—") },
  };
  let lente = "calor";
  const secCadenas = () => `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Cadenas de conversión comparadas</h2>
    <p class="sub">Las siete tecnologías alineadas etapa por etapa. Elige una «lente» para ver qué comparten y en qué se diferencian.</p></div></div>
    <div class="chips" id="lentes" style="margin-bottom:10px">${Object.entries(LENTES).map(([k, v]) => `<button class="chip" data-l="${k}" aria-pressed="${k === lente}">${v.t}</button>`).join("")}</div>
    <div class="card"><div class="table-wrap"><table class="chain-tbl" id="chainTbl"><thead><tr><th></th>${COLS.map(c => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${FILAS.map(f => `<tr><th><span class="pill" style="background:${COL[f.t]};${f.t === "nuclear" ? "color:#24282B" : ""}">${NOM[f.t]}</span><br>${f.r}</th>${f.c.map((c, i) => `<td data-i="${i}" class="${c.startsWith("—") ? "na0" : ""}">${c.split("|")[0]}${c.endsWith("|co2") ? " 🔥" : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <div class="explain" id="lenteTxt" aria-live="polite"></div></div>
    <p class="src">Descripción física de cada tecnología; ver glosario: <span class="tip" data-g="rankine">ciclo Rankine</span>, <span class="tip" data-g="fv">efecto fotovoltaico</span>, <span class="tip" data-g="fision">fisión</span>.</p>
  </section>`;
  function pintaLente() {
    const L = LENTES[lente];
    document.querySelectorAll("#chainTbl tbody tr").forEach((tr, r) => tr.querySelectorAll("td").forEach(td => {
      const i = +td.dataset.i; td.classList.toggle("hl", L.m(FILAS[r].c[i], i)); }));
    document.getElementById("lenteTxt").innerHTML = `<b>${L.t}</b><br>${L.d}`;
  }
  function bindCadenas() {
    document.getElementById("lentes").onclick = e => { const b = e.target.closest("[data-l]"); if (!b) return; lente = b.dataset.l;
      document.querySelectorAll("#lentes .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); pintaLente(); };
    pintaLente();
  }

  /* =================== 3. FLUJO DE ENERGÍA (SANKEY) =================== */
  let skGrupo = "tipo", skUni = "PJ";
  const secSankey = () => `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Flujo de energía: de los recursos a la electricidad (2024)</h2>
    <p class="sub">Cuánta energía entra a las centrales y cuánta sale como electricidad. Pasa el cursor o toca cada flujo.</p></div>
    <div class="chips"><span class="chips" id="skG">${[["tipo", "Por tipo de recurso"], ["det", "Por energético"]].map(([k, v]) => `<button class="chip" data-g="${k}" aria-pressed="${k === skGrupo}">${v}</button>`).join("")}</span>
    <span class="chips" id="skU">${["PJ", "TWh"].map(u => `<button class="chip" data-u="${u}" aria-pressed="${u === skUni}">${u}</button>`).join("")}</span></div></div>
    <div class="card"><div id="sankey"></div><div class="explain" id="skInfo" aria-live="polite">Toca un flujo para ver su valor.</div>
      <div class="grid3" style="margin-top:12px">
        <div class="kpi"><span class="scope s-nac">Nacional · 2024</span><div class="v">${fmt(BNE24_INSUMOS.total, 0)} <small>PJ</small></div><div class="q">Energía que entra a las centrales</div></div>
        <div class="kpi"><span class="scope s-nac">Nacional · 2024</span><div class="v">${fmt(BNE24_INSUMOS.electricidad, 0)} <small>PJ</small></div><div class="q">Electricidad producida (383,754 GWh)</div></div>
        <div class="kpi"><span class="scope s-nac">Nacional · 2024</span><div class="v">${BNE24_INSUMOS.eficiencia} <small>%</small></div><div class="q">Eficiencia global del sistema</div><p>= 1,381.52 / 3,405.56 PJ</p></div>
      </div>
      <div class="card" style="border-left:4px solid var(--warn);margin-top:12px;font-size:.83rem">⚠ <b>Nota de método.</b> En los balances energéticos, la energía «primaria» de hidro, eólica y solar se contabiliza por convención (no hay combustible que medir); por ejemplo, la hidráulica aparece con 262.18 PJ ≈ 72,828 GWh, aunque la generación hidroeléctrica neta fue de 23,800 GWh. Por eso las «pérdidas» totales no deben atribuirse por tecnología. La lectura robusta es la de los combustibles: en las centrales térmicas, más de la mitad de la energía del combustible se disipa como calor (segunda ley de la termodinámica).</div>
    </div>
    <p class="src">${BNE24_INSUMOS.f}; generación hidroeléctrica: ${P.f}. 1 PJ = 0.2778 TWh.</p>
  </section>`;
  function pintaSankey() {
    const B = BNE24_INSUMOS, k = skUni === "PJ" ? 1 : 1 / 3.6, u = skUni;
    let nodos = skGrupo === "det" ? B.items.map(x => ({ n: x.n, v: x.pj, t: x.tipo })) :
      ["fosil", "nuclear", "renovable"].map(t => ({ n: NOM[t], v: B.items.filter(x => x.tipo === t).reduce((s, x) => s + x.pj, 0), t }));
    const W = 900, Hh = 430, gap = skGrupo === "det" ? 8 : 14, x0 = 150, x1 = 170, xm = 470, xm2 = 495, xr = 720, xr2 = 740;
    const esc = (Hh - gap * (nodos.length - 1)) / B.total;
    let y = 10, minH = 3; nodos.forEach(nd => { nd.h = Math.max(nd.v * esc, minH); nd.y = y; y += nd.h + gap; });
    const midH = B.total * esc, midY = 10; let my = midY;
    const salE = B.electricidad * esc, salP = (B.total - B.electricidad) * esc;
    const banda = (xa, ya, ha, xb, yb, hb, col, id) => { const c = (xa + xb) / 2;
      return `<path class="skf" data-id="${id}" d="M${xa},${ya} C${c},${ya} ${c},${yb} ${xb},${yb} L${xb},${yb + hb} C${c},${yb + hb} ${c},${ya + ha} ${xa},${ya + ha} Z" fill="${col}" fill-opacity=".45"/>`; };
    let svg = `<svg viewBox="0 0 ${W} ${Hh + 30}" class="sk" role="img" aria-label="Diagrama de flujo de energía de los insumos a la electricidad, 2024">`;
    nodos.forEach((nd, i) => { const hh = nd.v * esc; svg += banda(x1, nd.y, Math.max(hh, .5), xm, my, Math.max(hh, .5), COL[nd.t], "in" + i); nd.my = my; my += hh; });
    svg += banda(xm2, midY, salE, xr, 10, salE, "#16A34A", "out0") + banda(xm2, midY + salE, salP, xr, 10 + salE + 24, salP, "#B91C1C", "out1");
    let ly = -99; nodos.forEach(nd => { const c = Math.max(nd.y + nd.h / 2 + 4, ly + 14); ly = c;
      svg += `<rect x="${x0}" y="${nd.y}" width="20" height="${nd.h}" rx="2" fill="${COL[nd.t]}"/>${Math.abs(c - (nd.y + nd.h / 2 + 4)) > 2 ? `<line x1="${x0 - 4}" y1="${c - 4}" x2="${x0}" y2="${nd.y + nd.h / 2}" stroke="var(--line2)"/>` : ""}<text x="${x0 - 6}" y="${c}" text-anchor="end" class="skt">${nd.n} · ${fmt(nd.v * k, u === "PJ" ? 0 : 1)}</text>`; });
    svg += `<rect x="${xm}" y="${midY}" width="25" height="${midH}" rx="3" fill="var(--g7)"/><text x="${xm + 12}" y="${midY + midH + 18}" text-anchor="middle" class="skt b">Centrales eléctricas</text>`;
    svg += `<rect x="${xr}" y="10" width="20" height="${salE}" rx="2" fill="#16A34A"/><text x="${xr2 + 8}" y="${10 + salE / 2}" class="skt b">Electricidad</text><text x="${xr2 + 8}" y="${10 + salE / 2 + 16}" class="skt">${fmt(B.electricidad * k, u === "PJ" ? 0 : 1)} ${u} (${B.eficiencia} %)</text>`;
    svg += `<rect x="${xr}" y="${10 + salE + 24}" width="20" height="${salP}" rx="2" fill="#B91C1C"/><text x="${xr2 + 8}" y="${10 + salE + 24 + salP / 2}" class="skt b">Pérdidas de conversión</text><text x="${xr2 + 8}" y="${10 + salE + 24 + salP / 2 + 16}" class="skt">${fmt((B.total - B.electricidad) * k, u === "PJ" ? 0 : 1)} ${u} (${fmt(100 - B.eficiencia, 1)} %)</text>`;
    svg += `</svg>`;
    const el = document.getElementById("sankey"); el.innerHTML = svg;
    const info = id => { if (id.startsWith("in")) { const nd = nodos[+id.slice(2)];
        return `<b>${nd.n}</b> → centrales: ${fmt(nd.v * k, u === "PJ" ? 2 : 2)} ${u} = <b>${fmt(nd.v / B.total * 100, 1)} %</b> de los insumos.${nd.t === "renovable" ? " (Energía primaria contabilizada por convención; ver nota.)" : ""}`; }
      return id === "out0" ? `<b>Electricidad producida</b>: ${fmt(B.electricidad * k, 2)} ${u} = ${B.eficiencia} % de la energía de entrada.` : `<b>Pérdidas de conversión</b>: ${fmt((B.total - B.electricidad) * k, 2)} ${u}, principalmente calor disipado en ciclos térmicos (condensadores, gases de escape).`; };
    el.querySelectorAll(".skf").forEach(p => { const f = () => { el.querySelectorAll(".skf").forEach(q => q.setAttribute("fill-opacity", q === p ? ".85" : ".2")); document.getElementById("skInfo").innerHTML = info(p.dataset.id); };
      p.addEventListener("mouseenter", f); p.addEventListener("click", f); });
    el.querySelector("svg").addEventListener("mouseleave", () => el.querySelectorAll(".skf").forEach(q => q.setAttribute("fill-opacity", ".45")));
  }
  function bindSankey() {
    document.getElementById("skG").onclick = e => { const b = e.target.closest("[data-g]"); if (!b) return; skGrupo = b.dataset.g; document.querySelectorAll("#skG .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); pintaSankey(); };
    document.getElementById("skU").onclick = e => { const b = e.target.closest("[data-u]"); if (!b) return; skUni = b.dataset.u; document.querySelectorAll("#skU .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); pintaSankey(); };
    pintaSankey();
  }

  /* =================== 4. CAPACIDAD ≠ ENERGÍA (FACTOR DE PLANTA) =================== */
  let Eobj = 12000, fpSel = ["Nucleoeléctrica", "Ciclo combinado", "Eoloeléctrica", "Solar fotovoltaica", "Hidroeléctrica"];
  const secFP = () => {
    const cat = t => ["fosil", "nuclear", "renovable"].map(k => Object.values(P.tec).filter(x => x.tipo === k).reduce((s, x) => s + x[t], 0));
    const capC = cat("mw"), genC = cat("gwh");
    capC.push(P.cogen.mw); genC.push(P.cogen.gwh); capC[2] += 92; // híbrido FV-baterías en capacidad
    const capT = capC.reduce((a, b) => a + b, 0), genT = genC.reduce((a, b) => a + b, 0);
    const barra = (arr, tot) => `<div class="bar" style="height:30px;width:100%">${arr.map((v, i) => `<span style="width:${v / tot * 100}%;background:${COL[["fosil", "nuclear", "renovable", "cogen"][i]]};${i === 1 ? "color:#24282B" : ""}" title="${NOM[["fosil", "nuclear", "renovable", "cogen"][i]]}: ${fmt(v / tot * 100, 1)} %">${v / tot > .06 ? fmt(v / tot * 100, 1) + " %" : ""}</span>`).join("")}</div>`;
    return `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Capacidad no es lo mismo que energía</h2>
    <p class="sub">Un MW instalado no produce lo mismo en todas las tecnologías. El <span class="tip" data-t="Factor de planta = energía generada en el año / (capacidad × horas del año). Mide qué fracción del tiempo la central opera, en promedio, a plena capacidad.">factor de planta</span> revela la diferencia entre fuentes <span class="tip" data-g="despachable">despachables</span> y variables.</p></div></div>
    <div class="card"><span class="scope s-nac">Nacional · 2024</span><h3 style="margin-top:6px">Misma matriz, dos lecturas</h3>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:10px;align-items:center;margin-top:12px;font-size:.84rem;font-weight:700">
        <span>Capacidad<br><small class="hint">${fmt(capT)} MW</small></span>${barra(capC, capT)}
        <span>Energía<br><small class="hint">${fmt(genT)} GWh</small></span>${barra(genC, genT)}</div>
      <p class="hint" style="margin-top:10px">Las renovables tienen ${fmt(capC[2] / capT * 100, 1)} % de la capacidad pero producen ${fmt(genC[2] / genT * 100, 1)} % de la energía; la nuclear, con ${fmt(capC[1] / capT * 100, 1)} % de la capacidad, produce ${fmt(genC[1] / genT * 100, 1)} %.</p>
      <p class="src">${P.f}. Porcentajes: cálculo.</p></div>
    <div class="grid2" style="margin-top:14px">
      <div class="card"><h3>Factor de planta por tecnología, 2024</h3><div class="chart-box tall"><canvas id="fpCh"></canvas></div>
        <p class="hint">FP = GWh × 1,000 / (MW × 8,784 h). Es un promedio anual: incluye centrales que entraron o salieron durante el año y la disponibilidad de agua, viento y sol.</p><p class="src">${P.f} (cálculo).</p></div>
      <div class="card sim"><h3>¿Cuántos MW necesito para producir…?</h3>
        <label class="simrow"><span>Energía anual objetivo: <b id="eobjV"></b> GWh</span><input type="range" id="eobj" min="1000" max="40000" step="500" value="${Eobj}" aria-label="Energía anual objetivo">
          <span class="chips"><button class="chip" data-e="12000">≈ Laguna Verde (12,000)</button><button class="chip" data-e="2056">Consumo de 1 millón de viviendas (2,056)</button></span></label>
        <div class="chips" id="fpPick" style="margin:6px 0 10px">${Object.keys(P.tec).map(t => `<button class="chip" data-t="${t}" aria-pressed="${fpSel.includes(t)}">${t}</button>`).join("")}</div>
        <div id="fpOut"></div>
        <p class="hint">Cada ■ = 250 MW. Supone el factor de planta nacional 2024 de cada tecnología.</p></div>
    </div>
  </section>`; };
  function pintaFP() {
    document.getElementById("eobjV").textContent = fmt(Eobj);
    const filas = fpSel.map(t => ({ t, f: fp(t), mw: Eobj * 1000 / (fp(t) * H) })).sort((a, b) => a.mw - b.mw);
    const base = filas[0];
    document.getElementById("fpOut").innerHTML = filas.map(x => `<div class="fprow"><div class="fpn"><b>${x.t}</b><br><span class="hint">FP ${fmt(x.f * 100, 1)} %</span></div>
      <div><div class="sq">${("<i style='background:" + COL[P.tec[x.t].tipo] + "'></i>").repeat(Math.min(200, Math.max(1, Math.round(x.mw / 250))))}${x.mw / 250 > 200 ? " <span class='hint'>…</span>" : ""}</div>
      <span class="hint"><b>${fmt(x.mw)} MW</b> = ${fmt(Eobj)} × 1,000 / (${fmt(x.f, 3)} × 8,784)${x !== base ? ` · ${fmt(x.mw / base.mw, 1)}× más que ${base.t}` : ""}</span></div></div>`).join("");
  }
  function bindFP() {
    const ts = Object.keys(P.tec).map(t => ({ t, f: fp(t) })).sort((a, b) => b.f - a.f);
    charts.push(new Chart(document.getElementById("fpCh"), { type: "bar", data: { labels: ts.map(x => x.t), datasets: [{ data: ts.map(x => +(x.f * 100).toFixed(1)), backgroundColor: ts.map(x => COL[P.tec[x.t].tipo]), borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => { const t = ts[c.dataIndex].t; return ` FP ${c.raw} % · ${fmt(P.tec[t].gwh)} GWh / ${fmt(P.tec[t].mw)} MW`; } } } },
        scales: { x: { max: 100, ticks: { callback: v => v + " %" } }, y: { ticks: { font: { size: 10 } } } } } }));
    document.getElementById("eobj").oninput = e => { Eobj = +e.target.value; pintaFP(); };
    document.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { Eobj = +b.dataset.e; document.getElementById("eobj").value = Eobj; pintaFP(); });
    document.getElementById("fpPick").onclick = e => { const b = e.target.closest("[data-t]"); if (!b) return; const t = b.dataset.t;
      if (fpSel.includes(t)) { if (fpSel.length > 1) fpSel = fpSel.filter(x => x !== t); } else fpSel.push(t);
      b.setAttribute("aria-pressed", fpSel.includes(t)); pintaFP(); };
    pintaFP();
  }

  /* =================== 5. SIMULADOR «¿QUÉ PASA SI…?» =================== */
  const EF = { "Carboeléctrica": 820, "Ciclo combinado": 490, "Solar fotovoltaica": 48, "Eoloeléctrica": 11, "Nucleoeléctrica": 12, "Geotermoeléctrica": 38 };
  const sc = { de: "Carboeléctrica", a: "Solar fotovoltaica", x: 6000 };
  const secEsc = () => `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Simulador: ¿qué pasa si sustituimos generación fósil?</h2>
    <p class="sub">Reemplaza parte de la generación fósil de 2024 por una fuente limpia y observa la matriz, las emisiones y la capacidad que haría falta.</p></div></div>
    <div class="grid2">
      <div class="card sim">
        <div class="simrow"><span>Sustituir generación de:</span><span class="chips" id="scDe">${["Carboeléctrica", "Ciclo combinado"].map(t => `<button class="chip" data-v="${t}" aria-pressed="${t === sc.de}">${t}</button>`).join("")}</span></div>
        <div class="simrow"><span>Por:</span><span class="chips" id="scA">${["Solar fotovoltaica", "Eoloeléctrica", "Nucleoeléctrica", "Geotermoeléctrica"].map(t => `<button class="chip" data-v="${t}" aria-pressed="${t === sc.a}">${t}</button>`).join("")}</span></div>
        <label class="simrow"><span>Energía sustituida: <b id="scXV"></b> GWh (<b id="scXP"></b> % de la ${"generación"} de esa tecnología)</span><input type="range" id="scX" min="0" max="12968" step="100" value="${sc.x}" aria-label="Energía sustituida"></label>
        <div id="scOut"></div>
      </div>
      <div class="card"><h3>Matriz nacional 2024: antes y después</h3><div class="chart-box"><canvas id="scCh"></canvas></div>
        <div class="gauge" id="scG"></div></div>
    </div>
    <div class="card" style="margin-top:14px;font-size:.84rem"><h3>Supuestos y limitaciones</h3>
      <ul style="margin:8px 0 0 18px;display:grid;gap:4px">
        <li>Base: generación neta nacional 2024 (${fmt(P.totalGWh)} GWh; ${fmt(P.limpiaGWh)} GWh limpios) — ${P.f}.</li>
        <li>Emisiones: medianas de <b>ciclo de vida</b> del IPCC AR5 (carbón 820, ciclo combinado 490, solar FV de planta 48, eólica 11, nuclear 12, geotermia 38 gCO₂eq/kWh). Son valores internacionales, no medidos en México.</li>
        <li>Capacidad adicional: energía / (factor de planta 2024 × 8,784 h). No incluye almacenamiento, respaldo ni red de transmisión que requieren las fuentes variables.</li>
        <li>Ejercicio didáctico: no considera costos, tiempos de construcción ni restricciones de operación del sistema.</li>
      </ul></div>
  </section>`;
  let scChart;
  function pintaEsc() {
    const max = P.tec[sc.de].gwh, xs = document.getElementById("scX"); xs.max = max; if (sc.x > max) sc.x = max; xs.value = sc.x;
    const x = sc.x, dEF = EF[sc.de] - EF[sc.a], tEv = x * dEF; // t CO2eq = GWh × (g/kWh)
    const mw = x * 1000 / (fp(sc.a) * H), capAct = P.tec[sc.a].mw, nuevaL = (P.limpiaGWh + x) / P.totalGWh * 100, antesL = P.limpiaGWh / P.totalGWh * 100;
    document.getElementById("scXV").textContent = fmt(x); document.getElementById("scXP").textContent = fmt(x / max * 100, 1);
    document.getElementById("scOut").innerHTML = `<div class="kpis" style="grid-template-columns:1fr 1fr;margin-top:8px">
      <div class="kpi"><div class="q">Energía limpia nacional</div><div class="v">${fmt(nuevaL, 1)} <small>%</small></div><p>antes ${fmt(antesL, 1)} % → +${fmt(nuevaL - antesL, 1)} puntos</p></div>
      <div class="kpi"><div class="q">Emisiones evitadas (ciclo de vida)</div><div class="v">${fmt(tEv / 1e6, 2)} <small>Mt CO₂eq/año</small></div><p>${fmt(x)} GWh × (${EF[sc.de]} − ${EF[sc.a]}) g/kWh = ${fmt(tEv)} t</p></div>
      <div class="kpi"><div class="q">Capacidad nueva de ${sc.a.toLowerCase()}</div><div class="v">${fmt(mw)} <small>MW</small></div><p>${fmt(x)} × 1,000 / (${fmt(fp(sc.a), 3)} × 8,784 h)</p></div>
      <div class="kpi"><div class="q">Frente a lo instalado en 2024</div><div class="v">${fmt(mw / capAct * 100, 0)} <small>%</small></div><p>de los ${fmt(capAct)} MW actuales de ${sc.a.toLowerCase()}</p></div></div>`;
    const tipoA = P.tec[sc.a].tipo, base = { fosil: 269879, nuclear: 11978, renovable: 66536, cogen: 3912 };
    const desp = Object.assign({}, base); desp.fosil -= x; desp[tipoA] += x;
    scChart.data.datasets = ["fosil", "cogen", "nuclear", "renovable"].map(k => ({ label: NOM[k], data: [base[k], desp[k]], backgroundColor: COL[k] }));
    scChart.update();
    const ang = Math.min(nuevaL, 100);
    document.getElementById("scG").innerHTML = `<div class="gbar"><span style="width:${antesL}%;background:var(--hoja)"></span><span style="width:${ang - antesL}%;background:var(--lux)"></span></div>
      <p class="hint">Energía limpia: <b>${fmt(antesL, 1)} %</b> en 2024 → <b>${fmt(nuevaL, 1)} %</b> con la sustitución (verde claro).</p>`;
  }
  function bindEsc() {
    scChart = new Chart(document.getElementById("scCh"), { type: "bar", data: { labels: ["2024 real", "Con sustitución"], datasets: [] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw)} GWh (${fmt(c.raw / P.totalGWh * 100, 1)} %)` } } },
        scales: { x: { stacked: true, max: P.totalGWh, ticks: { callback: v => fmt(v / 1000) + " TWh" } }, y: { stacked: true } } } });
    charts.push(scChart);
    const grp = (id, k) => document.getElementById(id).onclick = e => { const b = e.target.closest("[data-v]"); if (!b) return; sc[k] = b.dataset.v;
      document.querySelectorAll(`#${id} .chip`).forEach(c => c.setAttribute("aria-pressed", c === b)); pintaEsc(); };
    grp("scDe", "de"); grp("scA", "a");
    document.getElementById("scX").oninput = e => { sc.x = +e.target.value; pintaEsc(); };
    pintaEsc();
  }

  return {
    sec2x2: () => `<div class="q2-root">${sec2x2()}</div>`, secCadenas, secSankey, secFP, secEsc,
    bind() { charts.forEach(c => c.destroy()); charts = []; init2x2(); bind2x2(); bindCadenas(); bindSankey(); bindFP(); bindEsc(); },
    charts: () => charts,
  };
})();
