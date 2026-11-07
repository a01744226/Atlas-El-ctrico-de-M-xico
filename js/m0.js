/* =====================================================================
   MÓDULO 0 · RECURSOS ENERGÉTICOS
   ===================================================================== */
const M0 = (() => {
  const COLOR = { fosil: "#6B7176", nuclear: "#B8C0CA", renovable: "#16A34A", cogen: "#A3B18A" };
  const NOMBRE = { fosil: "Fósil", nuclear: "Nuclear", renovable: "Renovable", cogen: "Cogeneración eficiente" };
  const TEC_COLOR = {
    "Ciclo combinado": "#3F4448", "Vapor convencional": "#6B7176", "Turbogás": "#8A9096", "Turbojet": "#A7ADB2",
    "Combustión interna": "#C3C8CC", "Carboeléctrica": "#24282B", "Nucleoeléctrica": "#B8C0CA",
    "Hidroeléctrica": "#0F766E", "Geotermoeléctrica": "#65A30D", "Eoloeléctrica": "#4ADE80",
    "Solar fotovoltaica": "#16A34A", "Bioenergía": "#14532D", "Híbrido FV-batería": "#86EFAC", "Cogeneración eficiente": "#A3B18A",
  };
  const fmt = (n, d = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
  let charts = [];

  /* ---------- Cálculos a partir de los datos oficiales ---------- */
  function cfePorTipo(anio) {
    const r = { fosil: 0, nuclear: 0, renovable: 0 };
    for (const [t, v] of Object.entries(GEN_CFE.datos)) r[TEC[t].tipo] += v[anio];
    const tot = r.fosil + r.nuclear + r.renovable;
    return { ...r, tot, pct: k => r[k] / tot * 100 };
  }
  function nacPorTipo(i) {
    const r = { fosil: 0, nuclear: 0, renovable: 0, cogen: 0 };
    for (const [t, v] of Object.entries(GEN_NAC.datos)) r[TEC[t].tipo] += v[i];
    return r;
  }

  /* ---------- 1. Clasificación ---------- */
  const secClasificacion = () => `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Clasificación de los recursos</h2>
    <p class="sub">Del recurso a la electricidad hay cinco eslabones distintos. No hay que confundir el combustible con la tecnología que lo convierte.</p></div></div>
    <div class="card">
      <div class="chain">
        <span class="tip" data-g="primario">Recurso primario</span><em>→</em>
        <span class="tip" data-g="combustible">Fuente o combustible</span><em>→</em>
        <span class="tip" data-g="conversion">Proceso de conversión</span><em>→</em>
        <span class="tip" data-g="tecnologia">Tecnología</span><em>→</em>
        <span class="tip" data-g="electricidad">Electricidad</span>
      </div>
      <p class="hint">Ejemplo: gas natural (recurso) → gas natural (combustible) → combustión (conversión) → <span class="tip" data-g="ciclocombinado">ciclo combinado</span> (tecnología) → GWh.</p>
    </div>
    <div class="grid3" style="margin-top:14px">
      <div class="cat f"><h3>Recursos fósiles</h3>
        <p>Se queman para producir calor. Son finitos y emiten CO₂ directamente.</p>
        <ul><li>Gas natural</li><li>Carbón mineral</li><li>Combustóleo</li><li>Diésel y derivados</li></ul>
        <p><b>Tecnologías:</b> ciclo combinado, carboeléctrica, vapor convencional, turbogás, combustión interna.</p>
        <p style="font-size:.78rem">⚠ Una misma tecnología puede usar distintos combustibles: el vapor convencional quema combustóleo <i>o</i> gas; el turbogás, gas <i>o</i> diésel.</p></div>
      <div class="cat n"><h3>Recursos nucleares</h3>
        <p>El uranio no se quema: sus núcleos se dividen (<span class="tip" data-g="fision" style="border-color:#fff">fisión</span>) y liberan calor.</p>
        <ul><li>Uranio</li><li>Fisión nuclear</li><li>Nucleoeléctrica</li></ul>
        <p>Calor → vapor → turbina → generador. Es <b>no renovable</b>, pero la ley mexicana la clasifica como <b>limpia</b>.</p></div>
      <div class="cat r"><h3>Recursos renovables</h3>
        <p>La naturaleza los repone; no se consume combustible.</p>
        <ul><li>Radiación solar</li><li>Viento</li><li>Energía hidráulica</li><li>Calor geotérmico</li><li>Biomasa y biogás</li></ul>
        <p><b>Tecnologías:</b> solar fotovoltaica, eólica, hidroeléctrica, geotérmica y bioenergía.</p></div>
    </div>
    <div class="vs">
      <div class="card"><h3>Renovable</h3><p class="sub" style="font-size:.86rem;margin-top:4px">Concepto <b>físico</b>: el recurso se repone a escala humana. Sol, viento, agua, calor geotérmico, biomasa.</p></div>
      <div class="card l2"><h3>Limpia</h3><p class="sub" style="font-size:.86rem;margin-top:4px">Concepto <b>legal</b>: las renovables <b>más</b> la nuclear y la <span class="tip" data-g="cogen">cogeneración eficiente</span>. Toda renovable es limpia, pero no toda limpia es renovable.</p></div>
    </div>
  </section>`;

  /* ---------- 2. Clasificador interactivo ---------- */
  const TARJETAS = [
    { n: "Gas natural", k: "Recurso", ok: "fosil", fb: "Combustible fósil: se quema en ciclos combinados y turbogás." },
    { n: "Carbón mineral", k: "Recurso", ok: "fosil", fb: "Fósil sólido; se usa en carboeléctricas como Petacalco." },
    { n: "Combustóleo", k: "Recurso", ok: "fosil", fb: "Derivado pesado del petróleo; alimenta centrales de vapor convencional." },
    { n: "Diésel", k: "Recurso", ok: "fosil", fb: "Derivado del petróleo; se usa en combustión interna y turbogás." },
    { n: "Uranio", k: "Recurso", ok: "nuclear", fb: "Recurso nuclear: no se quema, se fisiona. Es finito, por eso no es renovable." },
    { n: "Radiación solar", k: "Recurso", ok: "renovable", fb: "Renovable; se convierte por efecto fotovoltaico." },
    { n: "Viento", k: "Recurso", ok: "renovable", fb: "Renovable; su energía cinética mueve el rotor del aerogenerador." },
    { n: "Agua (hidráulica)", k: "Recurso", ok: "renovable", fb: "Renovable, aunque depende de la lluvia: en 2023, año seco, la hidroeléctrica nacional cayó 42 %." },
    { n: "Calor geotérmico", k: "Recurso", ok: "renovable", fb: "Renovable si se gestiona el yacimiento; vapor del subsuelo mueve turbinas." },
    { n: "Bagazo de caña", k: "Recurso", ok: "renovable", fb: "Biomasa: renovable si se repone. Se quema, pero el carbono es de origen biológico." },
    { n: "Biogás", k: "Recurso", ok: "renovable", fb: "Renovable: proviene de la descomposición de residuos orgánicos." },
    { n: "Ciclo combinado", k: "Tecnología", ok: "fosil", fb: "Tecnología que usa gas natural (fósil). Es la que más electricidad produce en México." },
    { n: "Carboeléctrica", k: "Tecnología", ok: "fosil", fb: "Tecnología que quema carbón mineral." },
    { n: "Vapor convencional", k: "Tecnología", ok: "fosil", mixto: "Es fósil, pero OJO: puede quemar combustóleo o gas natural según su diseño. La tecnología no define un solo combustible." },
    { n: "Turbogás", k: "Tecnología", ok: "fosil", mixto: "Fósil: puede operar con gas natural o con diésel." },
    { n: "Nucleoeléctrica", k: "Tecnología", ok: "nuclear", fb: "Tecnología nuclear: Laguna Verde, Veracruz." },
    { n: "Fotovoltaica", k: "Tecnología", ok: "renovable", fb: "Tecnología renovable que convierte radiación solar." },
    { n: "Hidroeléctrica", k: "Tecnología", ok: "renovable", fb: "Tecnología renovable: Chicoasén, Malpaso, Infiernillo." },
    { n: "Cogeneración eficiente", k: "Tecnología", ok: "fosil", mixto: "Caso especial: normalmente quema gas natural (fósil), pero la ley la clasifica como LIMPIA si es eficiente. No es renovable." },
  ];
  let seleccion = null;
  const secClasificador = () => `
  <section class="sec" id="cfSec">
    <div class="sec-head"><div><h2><span class="num"></span>Clasificador interactivo</h2>
    <p class="sub">Arrastra cada tarjeta a su categoría. En celular o con teclado: toca una tarjeta y luego la categoría.</p></div>
    <div class="chips"><button class="btn g" id="cfCheck">Revisar</button><button class="btn o" id="cfReset">Reiniciar</button></div></div>
    <div class="pool bin" data-bin="pool" id="cfPool" aria-label="Tarjetas sin clasificar"></div>
    <div class="sorter">
      <div class="bin" data-bin="fosil" tabindex="0" role="button" aria-label="Categoría fósiles"><h4><i style="background:${COLOR.fosil}"></i>Fósiles</h4></div>
      <div class="bin" data-bin="nuclear" tabindex="0" role="button" aria-label="Categoría nucleares"><h4><i style="background:${COLOR.nuclear}"></i>Nucleares</h4></div>
      <div class="bin" data-bin="renovable" tabindex="0" role="button" aria-label="Categoría renovables"><h4><i style="background:${COLOR.renovable}"></i>Renovables</h4></div>
    </div>
    <div class="score" id="cfScore"></div>
    <div class="feedback" id="cfFb"></div>
  </section>`;

  function initClasificador() {
    const pool = document.getElementById("cfPool");
    const barajadas = [...TARJETAS].sort(() => Math.random() - .5);
    pool.innerHTML = barajadas.map(t =>
      `<button class="tcard" draggable="true" data-n="${t.n}" aria-label="${t.n}, ${t.k}"><small>${t.k}</small>${t.n}</button>`).join("");
    document.getElementById("cfScore").innerHTML = `<span class="hint">${TARJETAS.length} tarjetas por clasificar.</span>`;
    document.getElementById("cfFb").innerHTML = "";
    seleccion = null;
  }
  function mover(card, bin) {
    card.classList.remove("ok", "bad", "mixed", "sel");
    bin.appendChild(card);
    seleccion = null;
  }
  function bindClasificador() {
    const root = document.getElementById("view");
    root.ondragstart = (e => { const c = e.target.closest(".tcard"); if (c) { e.dataTransfer.setData("text/plain", c.dataset.n); } });
    document.querySelectorAll("#cfSec .bin").forEach(bin => {
      bin.addEventListener("dragover", e => { e.preventDefault(); bin.classList.add("over"); });
      bin.addEventListener("dragleave", () => bin.classList.remove("over"));
      bin.addEventListener("drop", e => {
        e.preventDefault(); bin.classList.remove("over");
        const c = document.querySelector(`#cfSec .tcard[data-n="${e.dataTransfer.getData("text/plain")}"]`); if (c) mover(c, bin);
      });
      const elegir = e => { if (seleccion && !e.target.closest(".tcard")) mover(seleccion, bin); };
      bin.addEventListener("click", elegir);
      bin.addEventListener("keydown", e => { if (e.target.closest(".tcard")) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(e); } });
    });
    root.onclick = (e => {
      const c = e.target.closest(".tcard"); if (!c) return;
      e.stopPropagation();
      if (seleccion === c) { c.classList.remove("sel"); seleccion = null; return; }
      document.querySelectorAll("#cfSec .tcard.sel").forEach(x => x.classList.remove("sel"));
      c.classList.add("sel"); seleccion = c;
    });
    document.getElementById("cfReset").onclick = initClasificador;
    document.getElementById("cfCheck").onclick = () => {
      let ok = 0, bad = 0, pend = 0; const fbs = [];
      document.querySelectorAll("#cfSec .tcard").forEach(c => {
        const t = TARJETAS.find(x => x.n === c.dataset.n);
        const bin = c.parentElement.dataset.bin;
        c.classList.remove("ok", "bad", "mixed");
        if (bin === "pool") { pend++; return; }
        if (bin === t.ok) {
          ok++;
          if (t.mixto) { c.classList.add("mixed"); fbs.push(`<div class="fb mixed"><b>${t.n} ✓ con matiz:</b> ${t.mixto}</div>`); }
          else c.classList.add("ok");
        } else {
          bad++; c.classList.add("bad");
          fbs.push(`<div class="fb bad"><b>${t.n}</b> no es ${NOMBRE[bin].toLowerCase()}: va en <b>${NOMBRE[t.ok]}</b>. ${t.fb || t.mixto}</div>`);
        }
      });
      const total = TARJETAS.length;
      document.getElementById("cfScore").innerHTML =
        `<div><b style="color:var(--ok)">${ok}</b> aciertos</div><div><b style="color:var(--bad)">${bad}</b> errores</div><div><b>${pend}</b> sin clasificar</div>
         <div class="hint">Calificación: ${fmt(ok / total * 100)} %</div>`;
      document.getElementById("cfFb").innerHTML = fbs.join("") || (pend ? "" : `<div class="fb ok"><b>¡Perfecto!</b> Clasificaste todo correctamente.</div>`);
    };
  }

  /* ---------- 3. Diagramas de conversión ---------- */
  const FLUJOS = {
    "Gas natural": [
      ["🔥", "Gas natural", "Química", "Recurso fósil extraído del subsuelo; en México gran parte se importa. Es el principal insumo para generar electricidad: 64.2 % en 2024 (SENER, BNE 2024 p. 45-46)."],
      ["💥", "Combustión", "Química → térmica", "El gas se quema con aire comprimido; los gases calientes se expanden a alta temperatura."],
      ["🌀", "Turbina de gas", "Térmica → mecánica", "Los gases mueven la turbina de gas, que gira un generador."],
      ["♨️", "Recuperador de calor", "Térmica", "En el <b>ciclo combinado</b>, el calor de los gases de escape produce vapor para una segunda turbina (ciclo Rankine). Por eso aprovecha mejor el combustible."],
      ["⚡", "Electricidad", "Mecánica → eléctrica", "El generador convierte el giro en electricidad por inducción electromagnética. Ciclo combinado nacional 2023: 205,598 GWh netos (PRODESEN 2024-2038 p. 201)."]],
    "Carbón": [
      ["⛏️", "Carbón mineral", "Química", "Recurso fósil sólido."],
      ["💥", "Combustión", "Química → térmica", "Se pulveriza y quema en una caldera."],
      ["♨️", "Vapor", "Térmica", "El calor evapora agua a alta presión (ciclo Rankine)."],
      ["🌀", "Turbina", "Térmica → mecánica", "El vapor se expande en la turbina y la hace girar; luego se condensa y regresa a la caldera."],
      ["⚡", "Electricidad", "Mecánica → eléctrica", "Carboeléctricas de CFE en 2024: 14,012 GWh brutos (IA CFE 2024 p. 26)."]],
    "Uranio": [
      ["☢️", "Uranio", "Nuclear", "Combustible de uranio enriquecido en barras dentro del reactor."],
      ["⚛️", "Fisión", "Nuclear → térmica", "Un neutrón divide un núcleo de U-235: se libera energía y más neutrones que sostienen la reacción en cadena controlada."],
      ["🌡️", "Calor", "Térmica", "La energía de fisión calienta el agua del reactor."],
      ["♨️", "Vapor", "Térmica", "Se produce vapor (ciclo Rankine), igual que en una central térmica, pero sin combustión."],
      ["🌀", "Turbina", "Térmica → mecánica", "El vapor mueve la turbina."],
      ["⚡", "Electricidad", "Mecánica → eléctrica", "Laguna Verde (CFE) generó 12,307 GWh en 2024 (IA CFE 2024 p. 26)."]],
    "Radiación solar": [
      ["☀️", "Radiación solar", "Radiante", "Energía del Sol que llega a la superficie terrestre."],
      ["🔲", "Efecto fotovoltaico", "Radiante → eléctrica", "Los fotones liberan electrones en el silicio de la celda: se produce corriente directa (CD). No hay piezas que giren."],
      ["🔁", "Inversor", "CD → CA", "Convierte la corriente directa en corriente alterna a 60 Hz para la red."],
      ["⚡", "Electricidad", "Eléctrica", "Fotovoltaica nacional 2023: 18,147 GWh netos (PRODESEN 2024-2038 p. 201)."]],
    "Viento": [
      ["💨", "Viento", "Cinética", "Masa de aire en movimiento, originada por el calentamiento desigual de la Tierra."],
      ["🌬️", "Energía cinética", "Cinética → mecánica", "El viento empuja las aspas; la potencia crece con el cubo de la velocidad del viento."],
      ["🌀", "Aerogenerador", "Mecánica → eléctrica", "El rotor gira un generador, a veces con caja multiplicadora."],
      ["⚡", "Electricidad", "Eléctrica", "Eólica nacional 2023: 20,700 GWh netos (PRODESEN 2024-2038 p. 201)."]],
    "Agua": [
      ["💧", "Agua", "Potencial", "Agua almacenada en una presa a cierta altura."],
      ["⬇️", "Caída", "Potencial → cinética", "Al bajar por la tubería, la energía potencial (m·g·h) se convierte en cinética."],
      ["🌀", "Turbina hidráulica", "Cinética → mecánica", "El chorro de agua hace girar la turbina."],
      ["⚡", "Electricidad", "Mecánica → eléctrica", "Hidroeléctrica nacional: 35,561 GWh en 2022 y 20,609 GWh en 2023, año seco (PRODESEN 2024-2038 p. 201)."]],
  };
  let flujoActual = "Gas natural";
  const secDiagramas = () => `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Diagramas de transformación energética</h2>
    <p class="sub">Elige un recurso y toca cada etapa para ver qué ocurre con la energía.</p></div></div>
    <div class="card">
      <div class="flowtabs chips" id="flTabs">${Object.keys(FLUJOS).map(k => `<button class="chip" aria-pressed="${k === flujoActual}" data-f="${k}">${k}</button>`).join("")}</div>
      <div class="flow" id="flFlow"></div>
      <div class="explain" id="flExp" aria-live="polite"></div>
    </div>
  </section>`;
  function pintarFlujo() {
    const pasos = FLUJOS[flujoActual];
    document.getElementById("flFlow").innerHTML = pasos.map((p, i) =>
      (i ? `<div class="arrow" aria-hidden="true">→</div>` : "") +
      `<button class="stage${i === 0 ? " on" : ""}" data-i="${i}"><span class="ic" aria-hidden="true">${p[0]}</span><span class="lb">${p[1]}</span><span class="en">${p[2]}</span></button>`).join("");
    explicar(0);
  }
  function explicar(i) {
    const p = FLUJOS[flujoActual][i];
    document.querySelectorAll("#flFlow .stage").forEach(s => s.classList.toggle("on", +s.dataset.i === i));
    document.getElementById("flExp").innerHTML = `<b>${i + 1}. ${p[1]}</b> · <i>${p[2]}</i><br>${p[3]}`;
  }
  function bindDiagramas() {
    document.getElementById("flTabs").onclick = e => {
      const b = e.target.closest("[data-f]"); if (!b) return;
      flujoActual = b.dataset.f;
      document.querySelectorAll("#flTabs .chip").forEach(c => c.setAttribute("aria-pressed", c === b));
      pintarFlujo();
    };
    document.getElementById("flFlow").onclick = e => { const s = e.target.closest(".stage"); if (s) explicar(+s.dataset.i); };
    pintarFlujo();
  }

  /* ---------- 4. Matriz energética ---------- */
  let anioCFE = 2024, anioNac = GEN_NAC.anios[GEN_NAC.anios.length - 1];
  const secMatriz = () => `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Matriz energética por recurso</h2>
    <p class="sub">Datos oficiales. Se separan los de <b>CFE</b> (<span class="tip" data-g="bruta">generación bruta</span>) de los <b>nacionales</b> (<span class="tip" data-g="neta">generación neta</span>, CFE + privados).</p></div></div>
    <div class="grid2">
      <div class="card"><span class="scope s-cfe">CFE</span><h3 style="margin-top:6px">Participación por tipo de recurso, 2022-2024</h3>
        <div class="chart-box"><canvas id="chCfeTipo"></canvas></div>
        <p class="hint">2023 fue un <span class="tip" data-g="estiaje">año seco</span>: la hidroeléctrica de CFE cayó de 34,110 a 19,568 GWh.</p>
        <p class="src">${GEN_CFE.fuente[2022]}; ${GEN_CFE.fuente[2024]}. Porcentajes: cálculo.</p></div>
      <div class="card"><span class="scope s-cfe">CFE</span><h3 style="margin-top:6px">Generación por tecnología</h3>
        <div class="chips" id="yrCfe" style="margin:8px 0">${[2022, 2023, 2024].map(a => `<button class="chip" data-a="${a}" aria-pressed="${a === anioCFE}">${a}</button>`).join("")}</div>
        <div class="chart-box"><canvas id="chCfeTec"></canvas></div>
        <p class="src" id="srcCfeTec"></p></div>
    </div>
    <div class="grid2" style="margin-top:14px">
      <div class="card"><span class="scope s-nac">Nacional</span><h3 style="margin-top:6px">Evolución ${GEN_NAC.anios[0]}-${GEN_NAC.anios[GEN_NAC.anios.length - 1]} por tipo de recurso (GWh) y % limpia</h3>
        <div class="chart-box tall"><canvas id="chNacEvo"></canvas></div>
        <p class="src">${GEN_NAC.fuente}. ${GEN_NAC.nota}</p></div>
      <div class="card"><span class="scope s-nac">Nacional</span><h3 style="margin-top:6px">Tecnologías más importantes</h3>
        <div class="chips" id="yrNac" style="margin:8px 0">${GEN_NAC.anios.map(a => `<button class="chip" data-a="${a}" aria-pressed="${a === anioNac}">${a}</button>`).join("")}</div>
        <div class="chart-box tall"><canvas id="chNacTec"></canvas></div>
        <p class="src">${GEN_NAC.fuente}</p></div>
    </div>
    <div class="card" style="margin-top:14px;font-size:.85rem">
      <b>Participación de energías limpias (oficial):</b>
      <span class="scope s-nac">Nacional</span> ${GEN_NAC.anios.map((a, i) => `${a}: <b>${fmt(GEN_NAC.limpiaPct[i], 2)} %</b>`).join(" · ")}
      &nbsp;|&nbsp; <span class="scope s-cfe">CFE</span> 2023: <b>24.7 %</b> · 2024: <b>25.3 %</b>
      <p class="src">${GEN_NAC.fuente}; ${GEN_CFE.limpiaOficial[2023].f}; ${GEN_CFE.limpiaOficial[2024].f}. Para 2024 no hay dato nacional neto comparable.</p>
    </div>
  </section>`;

  function opcionesBase(extra = {}) {
    return Object.assign({
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { family: "Inter", size: 11 }, boxWidth: 12 } },
        tooltip: { callbacks: {} } },
      scales: {},
    }, extra);
  }
  function graficasMatriz() {
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";

    // a) CFE por tipo, % apilado
    const anios = [2022, 2023, 2024], calc = anios.map(cfePorTipo);
    charts.push(new Chart(document.getElementById("chCfeTipo"), {
      type: "bar",
      data: { labels: anios, datasets: ["fosil", "nuclear", "renovable"].map(k => ({
        label: NOMBRE[k], backgroundColor: COLOR[k], data: calc.map(c => +c.pct(k).toFixed(1)),
        gwh: calc.map(c => c[k]) })) },
      options: opcionesBase({ indexAxis: "y",
        scales: { x: { stacked: true, max: 100, ticks: { callback: v => v + " %" } }, y: { stacked: true } },
        plugins: { legend: { position: "bottom" }, tooltip: { callbacks: {
          label: c => ` ${c.dataset.label}: ${fmt(c.raw, 1)} % (${fmt(c.dataset.gwh[c.dataIndex])} GWh)` } } } }),
    }));
    // b) CFE por tecnología (barra horizontal)
    const cTec = new Chart(document.getElementById("chCfeTec"), { type: "bar", data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      options: opcionesBase({ indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${fmt(c.raw)} GWh` } } },
        scales: { x: { ticks: { callback: v => fmt(v) } } } }) });
    charts.push(cTec);
    const pintaCfe = () => {
      const filas = Object.entries(GEN_CFE.datos).map(([t, v]) => [t, v[anioCFE]]).sort((a, b) => b[1] - a[1]);
      cTec.data.labels = filas.map(f => f[0]); cTec.data.datasets[0].data = filas.map(f => f[1]);
      cTec.data.datasets[0].backgroundColor = filas.map(f => TEC_COLOR[f[0]]); cTec.update();
      document.getElementById("srcCfeTec").textContent = `${GEN_CFE.fuente[anioCFE]}. Total oficial: ${fmt(GEN_CFE.totalOficial[anioCFE])} GWh.`;
    };
    document.getElementById("yrCfe").onclick = e => { const b = e.target.closest("[data-a]"); if (!b) return; anioCFE = +b.dataset.a;
      document.querySelectorAll("#yrCfe .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); pintaCfe(); };
    pintaCfe();
    // c) Nacional evolución apilada + línea % limpia
    const tipos = GEN_NAC.anios.map((_, i) => nacPorTipo(i));
    charts.push(new Chart(document.getElementById("chNacEvo"), {
      data: { labels: GEN_NAC.anios, datasets: [
        ...["fosil", "cogen", "nuclear", "renovable"].map(k => ({ type: "bar", label: NOMBRE[k], backgroundColor: COLOR[k], stack: "g", yAxisID: "y", data: tipos.map(t => t[k]) })),
        { type: "line", label: "% limpia (oficial)", data: GEN_NAC.limpiaPct, borderColor: "#14532D", backgroundColor: "#14532D", yAxisID: "y2", tension: .3, pointRadius: 4 }] },
      options: opcionesBase({ plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: c => c.dataset.yAxisID === "y2" ? ` % limpia: ${fmt(c.raw, 2)} %` : ` ${c.dataset.label}: ${fmt(c.raw)} GWh` } } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => fmt(v / 1000) + " TWh" } },
          y2: { position: "right", min: 0, max: 40, grid: { display: false }, ticks: { callback: v => v + " %" } } } }),
    }));
    // d) Nacional por tecnología (dona)
    const cNac = new Chart(document.getElementById("chNacTec"), { type: "doughnut", data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 1 }] },
      options: opcionesBase({ cutout: "55%", plugins: { legend: { position: "right", labels: { font: { size: 10 }, boxWidth: 10 } },
        tooltip: { callbacks: { label: c => { const t = c.dataset.data.reduce((a, b) => a + b, 0); return ` ${c.label}: ${fmt(c.raw)} GWh (${fmt(c.raw / t * 100, 1)} %)`; } } } } }) });
    charts.push(cNac);
    const pintaNac = () => {
      const i = GEN_NAC.anios.indexOf(anioNac);
      const filas = Object.entries(GEN_NAC.datos).map(([t, v]) => [t, v[i]]).filter(f => f[1] > 0).sort((a, b) => b[1] - a[1]);
      cNac.data.labels = filas.map(f => f[0]); cNac.data.datasets[0].data = filas.map(f => f[1]);
      cNac.data.datasets[0].backgroundColor = filas.map(f => TEC_COLOR[f[0]]); cNac.update();
    };
    document.getElementById("yrNac").onclick = e => { const b = e.target.closest("[data-a]"); if (!b) return; anioNac = +b.dataset.a;
      document.querySelectorAll("#yrNac .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); pintaNac(); };
    pintaNac();
  }

  /* ---------- 5. Comparador ---------- */
  let elegidos = ["Gas natural", "Radiación solar", "Uranio"];
  const secComparador = () => `
  <section class="sec">
    <div class="sec-head"><div><h2><span class="num"></span>Comparador energético</h2>
    <p class="sub">Elige dos o más recursos. Las emisiones distinguen <span class="tip" data-g="directas">directas</span> y de <span class="tip" data-g="ciclovida">ciclo de vida</span>.</p></div></div>
    <div class="card">
      <div class="cmp-pick chips" id="cmpPick">${Object.keys(RECURSOS).map(r => `<button class="chip" data-r="${r}" aria-pressed="${elegidos.includes(r)}">${r}</button>`).join("")}</div>
      <div class="table-wrap" id="cmpTable"></div>
      <div class="chart-box" style="margin-top:16px"><canvas id="chEmis"></canvas></div>
      <p class="src">Emisiones: ${EMISIONES.fuente} (medianas internacionales, no medidas en México). Generación nacional: ${GEN_NAC.fuente}.</p>
    </div>
  </section>`;
  function bindComparador() {
    const ch = new Chart(document.getElementById("chEmis"), { type: "bar", data: { labels: [], datasets: [] },
      options: opcionesBase({ plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: c => c.raw == null ? " Dato no disponible" : ` ${c.dataset.label}: ${fmt(c.raw, 1)} gCO₂eq/kWh` } } },
        scales: { y: { title: { display: true, text: "gCO₂eq/kWh (mediana)" } } } }) });
    charts.push(ch);
    const i23 = GEN_NAC.anios.length - 1, a23 = GEN_NAC.anios[i23], tot23 = GEN_NAC.total[i23];
    const pinta = () => {
      if (elegidos.length < 2) { document.getElementById("cmpTable").innerHTML = `<p class="hint">Selecciona al menos dos recursos.</p>`; }
      const filas = elegidos.map(r => {
        const d = RECURSOS[r], e = EMISIONES[d.emis];
        const gwh = d.tecs.reduce((s, t) => s + (GEN_NAC.datos[t] ? GEN_NAC.datos[t][i23] : 0), 0);
        return { r, d, e, gwh };
      });
      const em = (x, k) => x.e && x.e[k] ? `${fmt(x.e[k][1], x.e[k][1] < 20 && x.e[k][1] % 1 ? 1 : 0)} <small>(${fmt(x.e[k][0], 1)}–${fmt(x.e[k][2], 0)})</small>` : `<span class="na">Dato no disponible</span>`;
      if (elegidos.length >= 2) document.getElementById("cmpTable").innerHTML = `<table class="cmp-table"><thead><tr><th>Criterio</th>${filas.map(f => `<th>${f.r}</th>`).join("")}</tr></thead><tbody>
        <tr><td>Categoría</td>${filas.map(f => `<td><span class="pill" style="background:${COLOR[f.d.tipo]};${f.d.tipo === "nuclear" ? "color:#24282B" : ""}">${NOMBRE[f.d.tipo]}</span></td>`).join("")}</tr>
        <tr><td>¿Renovable?</td>${filas.map(f => `<td>${f.d.renovable}</td>`).join("")}</tr>
        <tr><td>Disponibilidad</td>${filas.map(f => `<td>${f.d.disponibilidad}</td>`).join("")}</tr>
        <tr><td>Combustible</td>${filas.map(f => `<td>${f.d.combustible}</td>`).join("")}</tr>
        <tr><td>Conversión</td>${filas.map(f => `<td>${f.d.conversion}</td>`).join("")}</tr>
        <tr><td>Emisiones directas<br><small>gCO₂eq/kWh</small></td>${filas.map(f => `<td>${em(f, "directa")}</td>`).join("")}</tr>
        <tr><td>Emisiones ciclo de vida<br><small>gCO₂eq/kWh</small></td>${filas.map(f => `<td>${em(f, "ciclo")}</td>`).join("")}</tr>
        <tr><td>Peso en la matriz nacional ${a23}</td>${filas.map(f => `<td><b>${fmt(f.gwh)} GWh</b><br>${fmt(f.gwh / tot23 * 100, 1)} % <small>(cálculo)</small></td>`).join("")}</tr>
      </tbody></table>`;
      ch.data.labels = filas.map(f => f.r);
      ch.data.datasets = [
        { label: "Directas", backgroundColor: "#6B7176", data: filas.map(f => f.e && f.e.directa ? f.e.directa[1] : null) },
        { label: "Ciclo de vida", backgroundColor: "#16A34A", data: filas.map(f => f.e && f.e.ciclo ? f.e.ciclo[1] : null) }];
      ch.update();
    };
    document.getElementById("cmpPick").onclick = e => {
      const b = e.target.closest("[data-r]"); if (!b) return;
      const r = b.dataset.r;
      elegidos = elegidos.includes(r) ? elegidos.filter(x => x !== r) : [...elegidos, r];
      b.setAttribute("aria-pressed", elegidos.includes(r)); pinta();
    };
    pinta();
  }

  /* ---------- 6. Indicadores de conciencia energética ---------- */
  function secIndicadores() {
    const c24 = cfePorTipo(2024);
    const i23 = GEN_NAC.anios.length - 1, aU = GEN_NAC.anios[i23], n23 = nacPorTipo(i23), t23 = GEN_NAC.total[i23];
    const sol18 = GEN_NAC.datos["Solar fotovoltaica"][0], sol23 = GEN_NAC.datos["Solar fotovoltaica"][i23];
    const h22 = GEN_NAC.datos["Hidroeléctrica"][4], h23 = GEN_NAC.datos["Hidroeléctrica"][5];
    const K = [
      { s: "s-calc", sl: "CFE 2024 · cálculo", q: "Dependencia de combustibles fósiles", v: fmt(c24.pct("fosil"), 1), u: "%", c: COLOR.fosil, m: c24.pct("fosil"),
        p: `Tres de cada cuatro GWh de CFE provienen de gas, combustóleo, diésel o carbón. Fuente: ${cita("IA24", "26")}.` },
      { s: "s-calc", sl: `Nacional ${aU} · cálculo`, q: "Participación de recursos renovables", v: fmt(n23.renovable / t23 * 100, 1), u: "%", c: COLOR.renovable, m: n23.renovable / t23 * 100,
        p: `Hidro, geotermia, eólica, solar y bioenergía suman ${fmt(n23.renovable)} GWh de ${fmt(t23)}. Fuente: ${GEN_NAC.fuente}.` },
      { s: "s-calc", sl: `Nacional ${aU} · cálculo`, q: "Participación de la energía nuclear", v: fmt(n23.nuclear / t23 * 100, 1), u: "%", c: COLOR.nuclear, m: n23.nuclear / t23 * 100,
        p: `Una sola central (Laguna Verde) aporta ${fmt(n23.nuclear)} GWh: es limpia, pero no renovable. Fuente: ${GEN_NAC.fuente}.` },
      { s: "s-nac", sl: `Nacional 2018→${aU}`, q: "Evolución de la solar fotovoltaica", v: "×" + fmt(sol23 / sol18, 1), u: "", c: COLOR.renovable, m: 100,
        p: `Pasó de ${fmt(sol18)} a ${fmt(sol23)} GWh entre 2018 y ${aU}: la tecnología de mayor crecimiento. Fuente: ${GEN_NAC.fuente}.` },
      { s: "s-nac", sl: "Nacional 2022→2023", q: "Vulnerabilidad al clima", v: fmt((h23 / h22 - 1) * 100, 0), u: "% hidro", c: "#0F766E", m: Math.abs((h23 / h22 - 1) * 100),
        p: `Por la sequía, la hidroeléctrica cayó de ${fmt(h22)} a ${fmt(h23)} GWh y el hueco se cubrió con fósiles. Lo renovable también tiene riesgos. Fuente: ${GEN_NAC.fuente}.` },
      { s: "s-nac", sl: "Nacional 2024", q: "Gas seco en los insumos de generación", v: fmt(OTROS.insumosGas2024.v, 1), u: "%", c: COLOR.fosil, m: OTROS.insumosGas2024.v,
        p: `Dos de cada tres unidades de energía que entran a las centrales son gas seco, el principal energético importado. Fuente: ${OTROS.insumosGas2024.f}.` },
    ];
    return `<section class="sec">
      <div class="sec-head"><div><h2><span class="num"></span>Indicadores de conciencia energética</h2>
      <p class="sub">Seis datos para reflexionar sobre de dónde viene nuestra electricidad.</p></div></div>
      <div class="kpis">${K.map(k => `<div class="kpi"><span class="scope ${k.s}">${k.sl}</span><div class="v">${k.v} <small>${k.u}</small></div><div class="q">${k.q}</div>
        <div class="meter"><span style="width:${Math.min(100, k.m)}%;background:${k.c}"></span></div><p>${k.p}</p></div>`).join("")}</div>
    </section>`;
  }

  /* ---------- 7. Reflexión ---------- */
  const PREGUNTAS = [
    { t: "En la gráfica de CFE, la participación renovable bajó de 27.4 % (2022) a 16.1 % (2023). ¿Cuál es la explicación que respaldan los datos?",
      d: "CFE hidroeléctrica: 34,110 GWh (2022) → 19,568 GWh (2023). Fotovoltaica: 7 → 274 GWh.",
      o: ["Se cerraron parques solares", "Un año seco redujo la generación hidroeléctrica", "Laguna Verde dejó de operar", "La reforma de 2025 prohibió las renovables"], ok: 1,
      fb: "La hidroeléctrica perdió 14,542 GWh por el estiaje; la solar incluso creció. Además, la ley de 2025 es posterior a 2023, así que no puede explicar ese cambio." },
    { t: "Según la evolución nacional, ¿aproximadamente cuántas veces creció la generación solar fotovoltaica entre 2018 y 2023?",
      d: "Fotovoltaica nacional: 2,176 GWh (2018) → 18,147 GWh (2023).",
      o: ["×2", "×4", "×8", "×20"], ok: 2,
      fb: "18,147 ÷ 2,176 ≈ 8.3. Creció más de ocho veces, pero en 2023 todavía era solo 5.2 % de la generación nacional (18,147 ÷ 346,504)." },
    { t: "Con el comparador: si 1 GWh generado con carbón se sustituye por 1 GWh de ciclo combinado, ¿cuánto se evita en emisiones de ciclo de vida (medianas IPCC)?",
      d: "Carbón: 820 gCO₂eq/kWh · Ciclo combinado: 490 gCO₂eq/kWh. 1 GWh = 1,000,000 kWh.",
      o: ["33 toneladas de CO₂eq", "330 toneladas de CO₂eq", "3,300 toneladas de CO₂eq", "No se evita nada, ambos son fósiles"], ok: 1,
      fb: "(820 − 490) g/kWh × 1,000,000 kWh = 330,000,000 g = 330 t CO₂eq. Ambos son fósiles, pero el ciclo combinado emite menos por kWh." },
    { t: "¿Por qué la nucleoeléctrica aparece como «limpia» en las cifras oficiales pero no en la suma de renovables?",
      o: ["Porque emite tanto como el carbón", "Porque su recurso (uranio) es finito, pero sus emisiones directas son nulas", "Porque México importa toda su electricidad nuclear", "Es un error de los informes"], ok: 1,
      fb: "Renovable es un concepto físico (el recurso se repone); limpia es legal (bajas emisiones). El uranio es un mineral finito, pero la fisión no emite CO₂ directo: ciclo de vida de 12 gCO₂eq/kWh (mediana IPCC)." },
    { t: "CFE reporta 25.3 % de energía limpia en 2024 y el país 23.19 % en 2023. ¿Se puede concluir que CFE es «más limpia» que el país?",
      d: "CFE: generación bruta, solo CFE, 2024. Nacional: generación neta inyectada, CFE + privados, 2023.",
      o: ["Sí, 25.3 > 23.19", "No: son años, alcances y bases de medición distintos", "Sí, porque CFE tiene Laguna Verde", "No, porque CFE no reporta energía limpia"], ok: 1,
      fb: "Para comparar hay que usar el mismo año, el mismo alcance y la misma base (bruta o neta). Comparar cifras con bases distintas es un error frecuente al leer estadísticas energéticas." },
  ];
  const secReflexion = () => `
  <section class="sec quiz">
    <div class="sec-head"><div><h2><span class="num"></span>Actividad de reflexión</h2>
    <p class="sub">Cinco preguntas para interpretar las gráficas y comparar recursos. <span id="qzScore"></span></p></div></div>
    ${PREGUNTAS.map((q, i) => `<div class="q" data-q="${i}"><p class="t">${i + 1}. ${q.t}</p>${q.d ? `<div class="qdata">📊 ${q.d}</div>` : ""}
      <div class="opts">${q.o.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}) ${o}</button>`).join("")}</div>
      <div class="qfb" aria-live="polite"></div></div>`).join("")}
  </section>`;
  function bindReflexion() {
    let ok = 0, resp = 0;
    document.querySelectorAll(".quiz .q").forEach(qe => {
      const q = PREGUNTAS[+qe.dataset.q];
      qe.querySelector(".opts").onclick = e => {
        const b = e.target.closest(".opt"); if (!b || b.disabled) return;
        const j = +b.dataset.j, bien = j === q.ok;
        qe.querySelectorAll(".opt").forEach(x => { x.disabled = true; if (+x.dataset.j === q.ok) x.classList.add("ok"); });
        if (!bien) b.classList.add("bad");
        resp++; if (bien) ok++;
        const fb = qe.querySelector(".qfb");
        fb.innerHTML = `<div class="fb ${bien ? "ok" : "bad"}"><b>${bien ? "¡Correcto!" : "No exactamente."}</b> ${q.fb}</div>`; fb.classList.add("show");
        document.getElementById("qzScore").innerHTML = `<b>Puntaje: ${ok}/${resp}</b>${resp === PREGUNTAS.length ? " · ¡completado!" : ""}`;
      };
    });
  }

  /* ---------- Render ---------- */
  function render() {
    charts.forEach(c => c.destroy()); charts = [];
    document.getElementById("view").innerHTML = `
      <div class="mod-head"><div class="eyebrow">Módulo 0</div><h1>Recursos energéticos</h1>
      <p class="sub">¿Con qué se produce la electricidad de México? Del recurso primario al kWh, con datos oficiales de CFE y SENER.</p></div>
      <div class="m0"><div class="grp" data-grp="Comprender"><span class="grp-k">A</span><div><h2 class="grp-t">Comprender</h2><p class="sub">Qué distingue a cada recurso y cómo se convierte en electricidad.</p></div></div>${secClasificacion()}${secDiagramas()}${M0X.secCadenas()}<div class="grp" data-grp="Explorar datos"><span class="grp-k">B</span><div><h2 class="grp-t">Explorar datos</h2><p class="sub">Cuánto aporta cada recurso en México, con cifras oficiales.</p></div></div>${M0X.secSankey()}${secMatriz()}${M0X.secFP()}${secComparador()}${secIndicadores()}<div class="grp" data-grp="Practicar"><span class="grp-k">C</span><div><h2 class="grp-t">Practicar</h2><p class="sub">Pon a prueba lo aprendido con actividades y simuladores.</p></div></div>${secClasificador()}${M0X.sec2x2()}${M0X.secEsc()}${secReflexion()}</div>
      <footer>Atlas Eléctrico de México · VERDALUX · Proyecto académico TE1020 Análisis de Circuitos Eléctricos.<br>
      Datos: CFE (Informes Anuales 2022-2024), SENER (PRODESEN 2023-2037 y 2024-2038; Balance Nacional de Energía 2024), IPCC AR5 WGIII Anexo III. Los porcentajes marcados como «cálculo» se obtuvieron de las tablas oficiales.</footer>`;
    initClasificador(); bindClasificador(); bindDiagramas(); graficasMatriz(); bindComparador(); bindReflexion(); M0X.bind();
  }
  return { render, cfePorTipo, nacPorTipo };
})();
