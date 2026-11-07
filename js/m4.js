/* =====================================================================
   MÓDULO 4 · ¿SABÍAS QUE?  +  REFORMA ENERGÉTICA
   ===================================================================== */
const M4 = (() => {
  const fmt = (n, d = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
  let charts = [], tema = "Todos";
  const N = GEN_NAC, i23 = N.anios.indexOf(2023), g = t => N.datos[t][i23];
  const ren23 = ["Hidroeléctrica", "Geotermoeléctrica", "Eoloeléctrica", "Solar fotovoltaica", "Bioenergía", "Híbrido FV-batería"].reduce((s, t) => s + g(t), 0);
  const kWhViv = DIST.consumo2024.resPJ / 3.6 * 1e9 / (DIST.consumo2024.viviendas * 1e6); // kWh por vivienda
  const loss = v => M2.calcula(300, v, 5, 1).Pp / 1e6;
  const P23 = "SENER · PRODESEN 2024-2038, Anexos, Cuadro A1.11, p. 201";
  const B = (x = {}) => Object.assign({ responsive: true, maintainAspectRatio: false }, x, { plugins: Object.assign({ legend: { display: false } }, x.plugins || {}) });

  /* Cada hallazgo: tema, pregunta, indicador, unidad, ámbito, explicación, fuente, visual (config Chart.js) */
  const H = [
    // ---------- RECURSOS ----------
    { t: "Recursos", q: "¿Qué porcentaje de la electricidad mexicana se genera con combustibles fósiles?", v: fmt(N.limpiaPct[i23] ? 100 - N.limpiaPct[i23] : 0, 2), u: "%", s: "s-nac", sl: "Nacional 2023",
      e: "Más de tres de cada cuatro kWh inyectados a la red provienen de ciclo combinado, térmica convencional, turbogás, combustión interna o carbón.", f: P23,
      c: () => ({ type: "doughnut", data: { labels: ["Fósil", "Limpia"], datasets: [{ data: [100 - N.limpiaPct[i23], N.limpiaPct[i23]], backgroundColor: ["#6B7176", "#16A34A"] }] }, options: B({ cutout: "60%", plugins: { legend: { display: true, position: "right" }, tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.raw, 2)} %` } } } }) }) },
    { t: "Recursos", q: "¿Qué diferencias hay en las emisiones de CO₂eq por kWh entre tecnologías?", v: "820 vs 11", u: "gCO₂eq/kWh", s: "s-int", sl: "Internacional · IPCC",
      e: "Medianas de ciclo de vida: el carbón emite unas 75 veces más que la eólica por cada kWh. Las emisiones directas de eólica, solar, nuclear y geotermia son cero; las de ciclo de vida no.", f: EMISIONES.fuente,
      c: () => { const k = ["Carbón (carboeléctrica)", "Gas natural (ciclo combinado)", "Biomasa dedicada", "Solar FV (planta)", "Geotermia", "Nuclear", "Eólica terrestre"];
        return { type: "bar", data: { labels: ["Carbón", "Gas CC", "Biomasa", "Solar FV", "Geotermia", "Nuclear", "Eólica"], datasets: [
          { label: "Directas", data: k.map(x => EMISIONES[x].directa ? EMISIONES[x].directa[1] : null), backgroundColor: "#6B7176" },
          { label: "Ciclo de vida", data: k.map(x => EMISIONES[x].ciclo[1]), backgroundColor: "#16A34A" }] }, options: B({ plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 10 } } } }) }; } },
    { t: "Recursos", q: "¿Por qué la energía nuclear puede considerarse limpia, pero no renovable?", v: fmt(g("Nucleoeléctrica")), u: "GWh limpios", s: "s-nac", sl: "Nacional 2023",
      e: "El uranio es un mineral finito (no renovable), pero la fisión no emite CO₂ al generar; su ciclo de vida es de 12 gCO₂eq/kWh (mediana IPCC). Por eso la ley la incluye entre las limpias. Aportó " + fmt(g("Nucleoeléctrica") / N.total[i23] * 100, 1) + " % del total (cálculo).", f: P23 + "; " + EMISIONES.fuente,
      c: () => ({ type: "bar", data: { labels: ["Nuclear", "Eólica", "Gas CC", "Carbón"], datasets: [{ data: [12, 11, 490, 820], backgroundColor: ["#B8C0CA", "#4ADE80", "#6B7176", "#24282B"] }] },
        options: B({ indexAxis: "y", plugins: { tooltip: { callbacks: { label: c => ` ${c.raw} gCO₂eq/kWh (ciclo de vida, mediana)` } } } }) }) },
    { t: "Recursos", q: "¿Qué participación tienen solar, eólica, hidráulica y geotermia dentro de la generación renovable?", v: fmt(ren23), u: "GWh renovables", s: "s-calc", sl: "Nacional 2023 · cálculo",
      e: "En 2023 la eólica y la hidroeléctrica empataron (≈32 % cada una) porque la sequía redujo la hidro; la solar ya aporta 28 %.", f: P23,
      c: () => { const ts = ["Eoloeléctrica", "Hidroeléctrica", "Solar fotovoltaica", "Geotermoeléctrica", "Bioenergía"]; return { type: "doughnut", data: { labels: ["Eólica", "Hidráulica", "Solar FV", "Geotermia", "Bioenergía"], datasets: [{ data: ts.map(g), backgroundColor: ["#4ADE80", "#0F766E", "#16A34A", "#65A30D", "#14532D"] }] },
        options: B({ cutout: "55%", plugins: { legend: { display: true, position: "right", labels: { boxWidth: 10 } }, tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.raw / ren23 * 100, 1)} %` } } } }) }; } },
    { t: "Recursos", q: "¿Qué recursos dependen del clima y cuáles permiten generar cuando se necesita?", v: fmt((g("Eoloeléctrica") + g("Solar fotovoltaica") + g("Híbrido FV-batería")) / N.total[i23] * 100, 1), u: "% variable", s: "s-calc", sl: "Nacional 2023 · cálculo",
      e: "Eólica y solar son variables: dependen del viento y del sol. La hidroeléctrica con presa es gestionable, pero depende de la lluvia. Ciclo combinado, carbón, nuclear y geotermia son despachables.", f: P23,
      c: () => ({ type: "bar", data: { labels: ["Variable (eólica + solar)", "Hidráulica", "Despachable (resto)"], datasets: [{ data: [g("Eoloeléctrica") + g("Solar fotovoltaica") + g("Híbrido FV-batería"), g("Hidroeléctrica"), N.total[i23] - g("Eoloeléctrica") - g("Solar fotovoltaica") - g("Híbrido FV-batería") - g("Hidroeléctrica")], backgroundColor: ["#4ADE80", "#0F766E", "#3F4448"] }] },
        options: B({ indexAxis: "y", plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw)} GWh` } } } }) }) },
    // ---------- GENERACIÓN ----------
    { t: "Generación", q: "¿Qué tecnología produce más electricidad en México?", v: fmt(g("Ciclo combinado") / N.total[i23] * 100, 1), u: "% ciclo combinado", s: "s-calc", sl: "Nacional 2023 · cálculo",
      e: `El ciclo combinado generó ${fmt(g("Ciclo combinado"))} GWh, más que todas las demás tecnologías juntas.`, f: P23,
      c: () => { const f = Object.keys(N.datos).map(t => [t, g(t)]).sort((a, b) => b[1] - a[1]).slice(0, 6); return { type: "bar", data: { labels: f.map(x => x[0]), datasets: [{ data: f.map(x => x[1]), backgroundColor: f.map((x, j) => j ? "#B8C0CA" : "#16A34A") }] },
        options: B({ indexAxis: "y", plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw)} GWh` } } } }) }; } },
    { t: "Generación", q: "¿Cuál es la central de mayor capacidad instalada?", v: "1,608", u: "MW · Laguna Verde", s: "s-cfe", sl: "CFE 2024",
      e: "Entre las centrales del Atlas con capacidad verificada, Laguna Verde es la mayor. Las fuentes consultadas no publican la capacidad individual de Chicoasén ni de Petacalco, así que la comparación no es exhaustiva.", f: "CFE · Informe Anual 2024, p. 21, 24 y 51",
      c: () => { const f = CENTRALES.filter(x => x.mw).sort((a, b) => b.mw - a.mw).slice(0, 6); return { type: "bar", data: { labels: f.map(x => x.n.split(" (")[0]), datasets: [{ data: f.map(x => x.mw), backgroundColor: f.map((x, j) => j ? "#B8C0CA" : "#16A34A") }] },
        options: B({ indexAxis: "y", plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw, 0)} MW` } } } }) }; } },
    { t: "Generación", q: "¿Cuánta electricidad produce una central nuclear?", v: "12,307", u: "GWh en 2024", s: "s-cfe", sl: "CFE 2024",
      e: `Laguna Verde aportó ${fmt(12307 / 154059 * 100, 1)} % de la generación de CFE. Su factor de planta fue de ${fmt(12307 * 1000 / (1608 * 8784) * 100, 1)} %: = 12,307,000 MWh / (1,608 MW × 8,784 h) (cálculo).`, f: "CFE · Informe Anual 2024, p. 21 y 26",
      c: () => ({ type: "doughnut", data: { labels: ["Energía generada", "Capacidad no utilizada"], datasets: [{ data: [87.1, 12.9], backgroundColor: ["#B8C0CA", "#EEF1F4"] }] }, options: B({ cutout: "65%", plugins: { legend: { display: true, position: "bottom" }, tooltip: { callbacks: { label: c => ` ${c.raw} %` } } } }) }) },
    { t: "Generación", q: "¿Cómo ha evolucionado la generación solar y eólica?", v: "×" + fmt(g("Solar fotovoltaica") / N.datos["Solar fotovoltaica"][0], 1), u: "solar desde 2018", s: "s-nac", sl: "Nacional 2018-2023",
      e: `Solar: de ${fmt(N.datos["Solar fotovoltaica"][0])} a ${fmt(g("Solar fotovoltaica"))} GWh. Eólica: de ${fmt(N.datos["Eoloeléctrica"][0])} a ${fmt(g("Eoloeléctrica"))} GWh (×${fmt(g("Eoloeléctrica") / N.datos["Eoloeléctrica"][0], 1)}).`, f: P23,
      c: () => ({ type: "line", data: { labels: N.anios, datasets: [{ label: "Solar FV", data: N.datos["Solar fotovoltaica"], borderColor: "#16A34A", backgroundColor: "#16A34A", tension: .3 }, { label: "Eólica", data: N.datos["Eoloeléctrica"], borderColor: "#0F766E", backgroundColor: "#0F766E", tension: .3 }] },
        options: B({ plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 10 } } } }) }) },
    { t: "Generación", q: "¿Cuántos hogares podrían abastecerse con la energía anual de una central?", v: fmt(12307e6 / kWhViv / 1e6, 1), u: "millones de hogares", s: "s-calc", sl: "Cálculo teórico",
      e: `Laguna Verde (12,307 GWh en 2024) ÷ consumo promedio por vivienda (${fmt(kWhViv)} kWh/año) ≈ ${fmt(12307e6 / kWhViv / 1e6, 2)} millones. Es teórico: ignora pérdidas de red y la variación del consumo entre regiones.`, f: "CFE · IA 2024 p. 26; SENER · BNE 2024 p. 62",
      c: () => { const f = CENTRALES.filter(x => x.gwh).sort((a, b) => b.gwh - a.gwh).slice(0, 5); return { type: "bar", data: { labels: f.map(x => x.n.split(" (")[0]), datasets: [{ data: f.map(x => +(x.gwh * 1e6 / kWhViv / 1e6).toFixed(2)), backgroundColor: "#16A34A" }] },
        options: B({ indexAxis: "y", plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw, 2)} millones de hogares` } } } }) }; } },
    // ---------- TRANSMISIÓN ----------
    { t: "Transmisión", q: "¿Cuántos kilómetros tiene la red nacional de transmisión?", v: fmt(TRANS.kmTension.total[TRANS.kmTension.total.length - 1]), u: "km", s: "s-nac", sl: "Nacional " + TRANS.kmTension.anios[TRANS.kmTension.anios.length - 1],
      e: `Equivale a ${fmt(TRANS.kmTension.total[TRANS.kmTension.total.length - 1] / 40075, 1)} vueltas a la Tierra por el ecuador (40,075 km; cálculo). El 44 % son líneas de 115 kV.`, f: TRANS.kmTension.f,
      c: () => ({ type: "doughnut", data: { labels: Object.keys(TRANS.kmTension.datos), datasets: [{ data: Object.values(TRANS.kmTension.datos).map(x => x[x.length - 1]), backgroundColor: ["#14532D", "#16A34A", "#4ADE80", "#0F766E", "#B8C0CA", "#6B7176", "#3F4448"] }] },
        options: B({ cutout: "55%", plugins: { legend: { display: true, position: "right", labels: { boxWidth: 10 } } } }) }) },
    { t: "Transmisión", q: "¿Por qué se utilizan líneas de 400 kV?", v: fmt(loss(115) / loss(400), 1) + "×", u: "menos pérdidas que a 115 kV", s: "s-calc", sl: "Simulador · cálculo",
      e: `Para transmitir 300 MW con R = 5 Ω por fase: a 115 kV se pierden ${fmt(loss(115), 1)} MW; a 400 kV, ${fmt(loss(400), 2)} MW. La razón es (400/115)² ≈ 12.1, porque las pérdidas dependen de I².`, f: "Cálculo con el modelo del Módulo 2 (I = P/√3·V·cos φ; P = 3·I²·R)",
      c: () => ({ type: "bar", data: { labels: ["115 kV", "230 kV", "400 kV"], datasets: [{ data: [115, 230, 400].map(v => +loss(v).toFixed(2)), backgroundColor: ["#B91C1C", "#B45309", "#16A34A"] }] }, options: B({ plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw, 2)} MW perdidos` } } } }) }) },
    { t: "Transmisión", q: "¿Qué sistemas eléctricos no están conectados al Sistema Interconectado Nacional?", v: "3", u: "sistemas aislados del SIN", s: "s-nac", sl: "Nacional",
      e: "Baja California (SIBC) se conecta a EE. UU. por dos líneas de 230 kV, pero no al SIN. Baja California Sur (SIBCS) y Mulegé (SIMUL) están aislados de todo.", f: "SENER · PRODESEN 2024-2038, Anexos, p. 155",
      c: () => ({ type: "bar", data: { labels: ["SIN", "SIBC", "SIBCS", "SIMUL"], datasets: [{ data: [7, 1, 1, 1], backgroundColor: ["#16A34A", "#0F766E", "#6B7176", "#B45309"] }] }, options: B({ plugins: { tooltip: { callbacks: { label: c => [" 7 regiones interconectadas", " Conectado al WECC (EE. UU.)", " Aislado", " Aislado"][c.dataIndex] } } }, scales: { y: { title: { display: true, text: "regiones de control" } } } }) }) },
    { t: "Transmisión", q: "¿Qué distancias recorre la electricidad entre regiones?", v: "290", u: "km-circuito", s: "s-cfe", sl: "CFE 2024",
      e: "La central solar de Puerto Peñasco (Sonora), Secuencia II de 300 MW, requirió una red de transmisión asociada de 290 km-circuito para interconectarse al Sistema Eléctrico de Baja California.", f: "CFE · Informe Anual 2024, p. 22",
      c: () => ({ type: "bar", data: { labels: ["Red asociada Puerto Peñasco", "Red nacional ÷ 100"], datasets: [{ data: [290, TRANS.kmTension.total[TRANS.kmTension.total.length - 1] / 100], backgroundColor: ["#16A34A", "#B8C0CA"] }] }, options: B({ indexAxis: "y", plugins: { tooltip: { callbacks: { label: c => c.dataIndex ? ` ${fmt(c.raw * 100)} km en total` : " 290 km-circuito" } } } }) }) },
    { t: "Transmisión", q: "¿Cómo cambian las pérdidas al aumentar la tensión?", v: "¼", u: "al duplicar la tensión", s: "s-calc", sl: "Simulador · cálculo",
      e: `Al pasar de 115 a 230 kV (el doble), las pérdidas bajan de ${fmt(loss(115), 1)} a ${fmt(loss(230), 1)} MW: exactamente la cuarta parte, porque I se reduce a la mitad e I² a la cuarta parte.`, f: "Cálculo con el modelo del Módulo 2",
      c: () => { const V = [69, 115, 138, 230, 400]; return { type: "line", data: { labels: V.map(v => v + " kV"), datasets: [{ data: V.map(v => +loss(v).toFixed(2)), borderColor: "#B91C1C", backgroundColor: "#B91C1C", tension: .35, fill: false }] }, options: B({ plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw, 2)} MW` } } } }) }; } },
    // ---------- DISTRIBUCIÓN ----------
    { t: "Distribución", q: "¿Cuántos usuarios reciben electricidad por las redes de distribución?", v: "49.1", u: "millones", s: "s-cfe", sl: "CFE 2024",
      e: `Son ${fmt((49.1 / 47.4 - 1) * 100, 1)} % más que en 2022 (47.4 millones; cálculo). La cobertura de electrificación nacional fue de 99.43 % en 2023.`, f: DIST.cfe.f,
      c: () => ({ type: "bar", data: { labels: DIST.cfe.anios, datasets: [{ data: DIST.cfe.usuarios, backgroundColor: "#16A34A" }] }, options: B({ scales: { y: { min: 46 } }, plugins: { tooltip: { callbacks: { label: c => ` ${c.raw} millones` } } } }) }) },
    { t: "Distribución", q: "¿Cuántos kilómetros de redes de distribución existen?", v: "901", u: "mil km", s: "s-cfe", sl: "CFE 2024",
      e: `Unas ${fmt(901 / 111.138, 1)} veces la red de transmisión de CFE y ${fmt(901000 / 40075, 1)} vueltas a la Tierra (cálculo). En 2023: ${fmt(DIST.redes2023.mt)} km en media tensión y ${fmt(DIST.redes2023.bt)} km en baja tensión.`, f: DIST.cfe.f + "; " + DIST.redes2023.f,
      c: () => ({ type: "bar", data: { labels: ["Transmisión", "Distribución"], datasets: [{ data: [111.138, 901], backgroundColor: ["#B8C0CA", "#16A34A"] }] }, options: B({ plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw, 1)} mil km` } } } }) }) },
    { t: "Distribución", q: "¿Qué porcentaje de energía se pierde en la distribución?", v: "10.69", u: "%", s: "s-cfe", sl: "CFE 2024",
      e: "Incluye pérdidas técnicas (calor en conductores y transformadores) y no técnicas (usos ilícitos, errores de medición). En media y baja tensión el indicador es de 12.88 %. Ambos bajaron desde 2022.", f: DIST.cfe.f,
      c: () => ({ type: "line", data: { labels: DIST.cfe.anios, datasets: [{ label: "Con AT", data: DIST.cfe.perdAT, borderColor: "#B91C1C", backgroundColor: "#B91C1C" }, { label: "MT + BT", data: DIST.cfe.perdMTBT, borderColor: "#B45309", backgroundColor: "#B45309", borderDash: [5, 4] }] },
        options: B({ plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 10 } } }, scales: { y: { ticks: { callback: v => v + " %" } } } }) }) },
    { t: "Distribución", q: "¿Cómo se reduce la tensión antes de llegar a una vivienda?", v: fmt(DIST.redes2023.trafos / 1e6, 2), u: "millones de transformadores", s: "s-nac", sl: "Nacional 2023",
      e: "Las subestaciones bajan la tensión de transmisión a media tensión (2.4–34 kV) y los transformadores de distribución la bajan a baja tensión. Ejemplo ideal: 13,200 V ÷ 55 = 240 V (simulador del Módulo 3).", f: DIST.redes2023.f,
      c: () => ({ type: "bar", data: { labels: ["400 kV", "115 kV", "13.2 kV", "240 V"], datasets: [{ data: [400000, 115000, 13200, 240], backgroundColor: ["#14532D", "#16A34A", "#4ADE80", "#B8C0CA"] }] },
        options: B({ scales: { y: { type: "logarithmic", ticks: { callback: v => [240, 1000, 10000, 100000, 400000].includes(v) ? fmt(v) + " V" : "" } } }, plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw)} V` } } } }) }) },
    { t: "Distribución", q: "¿Qué diferencias hay entre el consumo residencial e industrial?", v: fmt(DIST.consumo2024.indPJ / DIST.consumo2024.resPJ, 1) + "×", u: "más consume la industria", s: "s-calc", sl: "Nacional 2024 · cálculo",
      e: `Industria: ${fmt(DIST.consumo2024.indPJ, 2)} PJ de electricidad; hogares: ${fmt(DIST.consumo2024.resPJ, 2)} PJ. Por vivienda ≈ ${fmt(kWhViv)} kWh/año, unos ${fmt(kWhViv / 12)} kWh al mes.`, f: DIST.consumo2024.f,
      c: () => ({ type: "bar", data: { labels: ["Industrial", "Residencial"], datasets: [{ data: [DIST.consumo2024.indPJ, DIST.consumo2024.resPJ], backgroundColor: ["#3F4448", "#16A34A"] }] }, options: B({ plugins: { tooltip: { callbacks: { label: c => ` ${fmt(c.raw, 2)} PJ` } } } }) }) },
  ];

  /* ---------- Reforma ---------- */
  const EVENTOS = [
    { p: "pre", fecha: "Antes de 2013", tit: "Servicio público a cargo del Estado", txt: "Bajo la Ley del Servicio Público de Energía Eléctrica (LSPEE), CFE prestaba el servicio público. Los privados participaban en modalidades como autoabasto, cogeneración y productor independiente (PIE) que vende a CFE.", f: "SENER · PRODESEN 2024-2038, Anexos, p. 160 (modalidades LSPEE)" },
    { p: "2013", fecha: "Diciembre 2013", tit: "Presentación y discusión", txt: "Durante el gobierno de Enrique Peña Nieto se discutió la reforma constitucional. En el Senado, la aprobaron PRI, PVEM y la mayoría del PAN; las bancadas de izquierda votaron en contra. Destacaron David Penchyna (PRI), presidente de la Comisión de Energía, y Dolores Padierna (PRD), en contra.", f: "Expansión, 10/12/2013 (prensa)" },
    { p: "2013", fecha: "10 dic 2013", tit: "Aprobación en el Senado", txt: "95 votos a favor y 28 en contra.", f: "Cámara de Diputados · Datos Relevantes LXII Leg., proceso legislativo" },
    { p: "2013", fecha: "11 dic 2013", tit: "Aprobación en la Cámara de Diputados", txt: "354 votos a favor y 134 en contra (en lo general).", f: "Cámara de Diputados · Datos Relevantes LXII Leg." },
    { p: "2013", fecha: "20 dic 2013", tit: "Publicación del decreto constitucional", txt: "Se reforman los artículos 25, 27 y 28. La planeación y el control del SEN y el servicio público de transmisión y distribución quedan como exclusivos de la Nación; se permite contratar con particulares.", f: "DOF 20/12/2013, art. 27 párr. 6" },
    { p: "2013", fecha: "11 ago 2014", tit: "Leyes secundarias", txt: "Se expiden la Ley de la Industria Eléctrica (LIE) y la Ley de la CFE. Se crea el Mercado Eléctrico Mayorista operado por el CENACE y se ordena la estricta separación legal de CFE.", f: "DOF 11/08/2014 ed. vespertina, p. 44, 46, 49 y 219" },
    { p: "2013", fecha: "2014 en adelante", tit: "Implementación", txt: "CFE se reorganiza en empresas productivas subsidiarias por actividad (generación, transmisión, distribución, suministro) y el CENACE opera el sistema y el mercado de manera independiente.", f: "Gobierno de la República · Explicación ampliada de la Reforma Energética (2014); DOF 11/08/2014" },
    { p: "2025", fecha: "18 mar 2025", tit: "Nueva Ley del Sector Eléctrico", txt: "Abroga la LIE de 2014. El Estado debe mantener al menos 54 % de la energía inyectada a la red; la CFE vuelve a ser empresa pública del Estado; la Comisión Nacional de Energía sustituye a la CRE.", f: "DOF 18/03/2025 · LSE arts. 12 fr. VI y transitorio Segundo, p. 15 y 52; BNE 2024 p. 25 (nota 13)" },
  ];
  const CAMBIOS = [
    ["🏭", "Participación privada", "Los particulares pueden generar y vender en el mercado (generación y comercialización abiertas)."],
    ["🧩", "Separación de actividades", "CFE se divide legalmente por actividad: generación, transmisión, distribución y suministro."],
    ["📈", "Mercado Eléctrico Mayorista", "Mercado donde generadores, suministradores y usuarios calificados compran y venden energía."],
    ["🏛️", "Transformación de CFE", "De organismo público a Empresa Productiva del Estado (2014); en 2025, empresa pública del Estado."],
    ["🎛️", "Papel del CENACE", "Organismo independiente que controla la operación del SEN y opera el mercado."],
    ["🔌", "Transmisión y distribución", "Siguen reservadas al Estado: servicio público exclusivo de la Nación (art. 27)."],
  ];
  const CAP = PROD_CAP;

  function html() {
    const temas = ["Todos", "Recursos", "Generación", "Transmisión", "Distribución"];
    return `
    <div class="mod-head"><div class="eyebrow">Módulo 4</div><h1>¿Sabías que?</h1>
    <p class="sub">20 hallazgos sobre los recursos energéticos y el sistema eléctrico mexicano, cada uno con su fuente.</p></div>
    <div class="chips" id="hTemas" style="margin-bottom:16px">${temas.map(t => `<button class="chip" data-t="${t}" aria-pressed="${t === tema}">${t}</button>`).join("")}</div>
    <h2 class="idx-only" data-idx="20 hallazgos">20 hallazgos</h2><div class="hgrid" id="hGrid">${H.map((h, k) => `
      <article class="hcard" data-t="${h.t}">
        <div class="hhead"><span class="htag">${h.t} · ${String(k + 1).padStart(2, "0")}</span><span class="scope ${h.s}">${h.sl}</span></div>
        <h3>${h.q}</h3>
        <div class="hv">${h.v} <small>${h.u}</small></div>
        <div class="chart-box" style="height:170px"><canvas id="hc${k}"></canvas></div>
        <p class="he">${h.e}</p>
        <p class="src">${h.f}</p>
      </article>`).join("")}</div>

    <section class="sec reforma" id="reforma">
      <div class="eyebrow">Apartado especial</div>
      <h1 style="font-size:1.6rem">La reforma energética de 2013: ¿cómo cambió el sector eléctrico mexicano?</h1>
      <p class="sub">Se distinguen <b>hechos</b> (leyes, votaciones, cifras), <b>objetivos declarados</b> y <b>opiniones</b>. Ningún cambio estadístico se atribuye automáticamente a la reforma.</p>

      <h2 style="margin-top:22px"><span class="num">1</span>Línea de tiempo</h2>
      <div class="tl" id="tl">${EVENTOS.map((e, k) => `<button class="tl-ev p-${e.p}" data-k="${k}"><span class="tl-d">${e.fecha}</span><span class="tl-t">${e.tit}</span></button>`).join("")}</div>
      <div class="explain" id="tlDet" aria-live="polite"></div>
      <div class="chips" style="margin-top:8px"><span class="chip" style="cursor:default"><i class="dot p-pre"></i>Antes de 2013</span><span class="chip" style="cursor:default"><i class="dot p-2013"></i>Reforma 2013-2014</span><span class="chip" style="cursor:default"><i class="dot p-2025"></i>Cambios 2024-2025</span></div>

      <h2 style="margin-top:28px"><span class="num">2</span>Cambios estructurales</h2>
      <div class="grid3" style="margin-top:10px">${CAMBIOS.map(c => `<div class="card"><div style="font-size:1.5rem">${c[0]}</div><h3>${c[1]}</h3><p class="sub" style="font-size:.85rem;margin-top:4px">${c[2]}</p></div>`).join("")}</div>
      <p class="src">DOF 20/12/2013; DOF 11/08/2014 (LIE y Ley de la CFE); Gobierno de la República, Explicación ampliada de la Reforma Energética (2014); DOF 18/03/2025.</p>

      <h2 style="margin-top:28px"><span class="num">3</span>Repercusiones documentadas</h2>
      <div class="card" style="border-left:4px solid var(--warn);font-size:.84rem;margin:10px 0">⚠ Las series de generación y capacidad empiezan en <b>2018</b>. La única serie con años previos a la reforma es la de líneas de transmisión (2010-2024, gráfica 6). Estas gráficas muestran <b>resultados observados</b>, no un efecto causal demostrado de la reforma.</div>
      <div class="grid2">
        <div class="card"><h3>1 · Capacidad por tipo de operador (2023)</h3><div class="chart-box"><canvas id="rf1"></canvas></div>
          <p class="hint">CFE conserva la mitad de la capacidad; los privados (fuera de PIE) suman 30 %.</p><p class="src">SENER · PRODESEN 2024-2038, Anexos, Fig. A1.7, p. 163</p></div>
        <div class="card"><h3>2 · Evolución de la capacidad instalada</h3><div class="chart-box"><canvas id="rf2"></canvas></div>
          <p class="hint">De ${fmt(CAP.total[0])} a ${fmt(CAP.total[CAP.total.length - 1])} MW (+${fmt((CAP.total[CAP.total.length - 1] / CAP.total[0] - 1) * 100, 1)} %, cálculo).</p><p class="src">SENER · PRODESEN 2024-2038, Anexos, Cuadro A1.7, p. 186 (2018-2023); PLADESE 2025-2039, Tabla 2.1 (2024)</p></div>
        <div class="card"><h3>3 · Desarrollo de energías limpias</h3><div class="chart-box"><canvas id="rf3"></canvas></div>
          <p class="hint">La capacidad solar pasó de ${fmt(CAP.fv[0])} a ${fmt(CAP.fv[CAP.fv.length - 1])} MW; la participación limpia en la generación, de ${N.limpiaPct[0]} % (2018) a ${N.limpiaPct[N.limpiaPct.length - 1]} % (2024).</p><p class="src">PRODESEN 2024-2038, Anexos, Cuadros A1.7 (p. 186) y A1.11 (p. 201); PLADESE 2025-2039, Tablas 2.1 y 2.2 (2024)</p></div>
        <div class="card"><h3>4 · Organización del mercado</h3>
          <div class="table-wrap"><table class="cmp-table" style="margin-top:8px"><thead><tr><th></th><th>Antes de 2013</th><th>2013-2014</th><th>2025</th></tr></thead><tbody>
            <tr><td>Generación</td><td>CFE + modalidades privadas</td><td>Abierta, compite en el MEM</td><td>Estado ≥ 54 % de la energía</td></tr>
            <tr><td>Operador</td><td>CFE</td><td>CENACE independiente</td><td>CENACE</td></tr>
            <tr><td>Regulador</td><td>CRE</td><td>CRE como órgano coordinado</td><td>Comisión Nacional de Energía</td></tr>
            <tr><td>Transmisión y distribución</td><td>Estado</td><td>Estado</td><td>Estado</td></tr>
            <tr><td>CFE</td><td>Organismo público</td><td>Empresa Productiva del Estado</td><td>Empresa pública del Estado</td></tr>
          </tbody></table></div>
          <p class="src">DOF 11/08/2014; Explicación ampliada (2014), sección IV; LSE DOF 18/03/2025; BNE 2024 p. 25, nota 13</p></div>
      </div>
      <div class="card" style="margin-top:14px"><h3>6 · Líneas de 400 y 230 kV, 2010-2024 (antes y después de 2013)</h3>
        <div class="chart-box"><canvas id="rf4"></canvas></div>
        <p class="hint">400 kV: ${fmt(KM_HIST.kv400[0])} km (2010) → ${fmt(KM_HIST.kv400[3])} km (2013) → ${fmt(KM_HIST.kv400[14])} km (2024). Crecimiento 2010-2013: +${fmt((KM_HIST.kv400[3] / KM_HIST.kv400[0] - 1) * 100, 1)} %; 2013-2024: +${fmt((KM_HIST.kv400[14] / KM_HIST.kv400[3] - 1) * 100, 1)} % (cálculo). La transmisión siguió siendo actividad del Estado antes y después de la reforma.</p>
        <p class="src">${KM_HIST.f}</p></div>
      <div class="card" style="margin-top:14px"><h3>5 · Resultados y controversias: tres miradas</h3>
        <div class="grid3" style="margin-top:10px">
          <div class="view"><span class="scope s-cfe">Objetivo declarado · 2014</span><p>El gobierno que impulsó la reforma planteó modernizar el sector «sin privatizar» a CFE y lograr el «abasto de energéticos a precios competitivos».</p><p class="src">Gobierno de la República · Explicación ampliada de la Reforma Energética, secc. I-II</p></div>
          <div class="view"><span class="scope s-nac">Cambio legal · 2025</span><p>La nueva ley establece que el Estado mantenga al menos 54 % de la energía inyectada a la red y reorganiza la planeación del sector.</p><p class="src">LSE, DOF 18/03/2025, art. 12 fr. VI</p></div>
          <div class="view"><span class="scope s-calc">Opinión · análisis independiente</span><p>El IMCO sostiene que el cambio de metodología del PRODESEN 2023-2037 «incrementa artificialmente» la cifra de energía limpia (31.2 % oficial frente a 29.1 % sumando la Fig. 4.9).</p><p class="src">IMCO (análisis del PRODESEN 2023-2037); PRODESEN 2023-2037 p. 59</p></div>
        </div>
        <p class="hint" style="margin-top:10px">Sobre <b>inversión, tarifas, confiabilidad y acceso a la red</b>, los documentos del Atlas no contienen series comparables: <span class="na">Dato no disponible</span>. La legislación vigente en 2025 difiere de la aprobada en 2013-2014.</p>
      </div>
    </section>
    <footer>Atlas Eléctrico de México · VERDALUX · TE1020. Hallazgos marcados como «cálculo» se derivan de tablas oficiales.</footer>`;
  }

  function render() {
    charts.forEach(c => c.destroy()); charts = [];
    document.getElementById("view").innerHTML = html();
    H.forEach((h, k) => charts.push(new Chart(document.getElementById("hc" + k), h.c())));
    const filtra = () => document.querySelectorAll(".hcard").forEach(c => c.style.display = tema === "Todos" || c.dataset.t === tema ? "" : "none");
    document.getElementById("hTemas").onclick = e => { const b = e.target.closest("[data-t]"); if (!b) return; tema = b.dataset.t;
      document.querySelectorAll("#hTemas .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); filtra(); };
    filtra();
    const det = k => { const e = EVENTOS[k]; document.querySelectorAll(".tl-ev").forEach(b => b.classList.toggle("on", +b.dataset.k === k));
      document.getElementById("tlDet").innerHTML = `<b>${e.fecha} · ${e.tit}</b><br>${e.txt}<p class="src">${e.f}</p>`; };
    document.getElementById("tl").onclick = e => { const b = e.target.closest(".tl-ev"); if (b) det(+b.dataset.k); };
    det(4);
    const Bx = (x = {}) => Object.assign({ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } } } }, x);
    charts.push(new Chart(document.getElementById("rf1"), { type: "doughnut", data: { labels: ["CFE", "PIE (venden a CFE)", "Privados", "Pemex"], datasets: [{ data: [44680, 16664, 26744, 921], backgroundColor: ["#14532D", "#16A34A", "#6B7176", "#B8C0CA"] }] },
      options: Bx({ cutout: "55%", plugins: { legend: { position: "right", labels: { boxWidth: 10 } }, tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.raw)} MW (${fmt(c.raw / 89009 * 100, 1)} %)` } } } }) }));
    charts.push(new Chart(document.getElementById("rf2"), { type: "bar", data: { labels: CAP.anios, datasets: [{ label: "Limpia", data: CAP.limpia, backgroundColor: "#16A34A" }, { label: "Fósil", data: CAP.total.map((t, k) => t - CAP.limpia[k]), backgroundColor: "#6B7176" }] },
      options: Bx({ scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => fmt(v) } } } }) }));
    charts.push(new Chart(document.getElementById("rf4"), { type: "line", data: { labels: KM_HIST.anios, datasets: [
      { label: "400 kV", data: KM_HIST.kv400, borderColor: "#14532D", backgroundColor: "#14532D", tension: .2 },
      { label: "230 kV", data: KM_HIST.kv230, borderColor: "#4ADE80", backgroundColor: "#4ADE80", tension: .2 }] },
      options: Bx({ scales: { y: { ticks: { callback: v => fmt(v) } } } }), plugins: [{ id: "marca2013", afterDraw(ch) { const x = ch.scales.x.getPixelForValue(3), a = ch.chartArea, c = ch.ctx;
        c.save(); c.strokeStyle = "#B45309"; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(x, a.top); c.lineTo(x, a.bottom); c.stroke(); c.fillStyle = "#B45309"; c.font = "11px Inter"; c.fillText("Reforma 2013", x + 4, a.top + 12); c.restore(); } }] }));
    charts.push(new Chart(document.getElementById("rf3"), { data: { labels: CAP.anios, datasets: [
      { type: "bar", label: "Capacidad solar FV (MW)", data: CAP.fv, backgroundColor: "#4ADE80", yAxisID: "y" },
      { type: "bar", label: "Capacidad eólica (MW)", data: CAP.eol, backgroundColor: "#0F766E", yAxisID: "y" },
      { type: "line", label: "% limpia en la generación", data: N.limpiaPct, borderColor: "#14532D", backgroundColor: "#14532D", yAxisID: "y2", tension: .3 }] },
      options: Bx({ scales: { y: { ticks: { callback: v => fmt(v) } }, y2: { position: "right", min: 0, max: 40, grid: { display: false }, ticks: { callback: v => v + " %" } } } }) }));
  }
  return { render, H };
})();
