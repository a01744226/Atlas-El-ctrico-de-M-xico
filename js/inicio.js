/* =====================================================================
   INICIO · La ruta de la electricidad: del recurso al consumidor
   Solo presenta datos ya verificados en los módulos (no agrega cifras nuevas).
   ===================================================================== */
const MI = (() => {
  const fmt = (n, d = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
  const kWhViv = DIST.consumo2024.resPJ / 3.6 * 1e9 / (DIST.consumo2024.viviendas * 1e6);
  const kmT = TRANS.kmTension, iK = kmT.anios.length - 1;
  const ETAPAS = [
    { id: "recursos", n: "0", ic: "⛽", t: "Recursos energéticos", q: "¿Con qué se produce?", v: fmt(BNE24_INSUMOS.items[0].pj / BNE24_INSUMOS.total * 100, 1) + " %", u: "de los insumos para generar fue gas seco", s: "s-nac", sl: "Nacional 2024", f: "SENER · BNE 2024, p. 45-46" },
    { id: "generacion", n: "1", ic: "🏭", t: "Generación", q: "¿Dónde y cuánto se genera?", v: fmt(PLADESE24.totalGWh), u: "GWh netos inyectados a la red", s: "s-nac", sl: "Nacional 2024", f: "SENER · PLADESE 2025-2039, Tabla 2.2" },
    { id: "transmision", n: "2", ic: "🗼", t: "Transmisión", q: "¿Cómo viaja en alta tensión?", v: fmt(kmT.total[iK]), u: "km de líneas de 69 a 400 kV", s: "s-nac", sl: "Nacional " + kmT.anios[iK], f: "SENER · PLADESE 2025-2039, Tabla 2.3" },
    { id: "distribucion", n: "3", ic: "🔌", t: "Distribución", q: "¿Cómo llega a cada usuario?", v: fmt(DIST.cfe.usuarios[2], 1) + " M", u: "de usuarios atendidos por CFE", s: "s-cfe", sl: "CFE 2024", f: "CFE · Informe Anual 2024, p. 95" },
    { id: "sabias", n: "?", ic: "🏠", t: "Consumidor", q: "¿Cuánto usa un hogar?", v: "≈ " + fmt(kWhViv), u: "kWh al año por vivienda (cálculo)", s: "s-calc", sl: "Nacional 2024 · cálculo", f: "SENER · BNE 2024, p. 62" },
  ];
  function render() {
    document.getElementById("view").innerHTML = `
    <section class="hero-in">
      <img src="assets/logo.svg" alt="Logo VERDALUX" class="hero-logo">
      <div>
        <div class="eyebrow">VERDALUX · Proyecto TE1020</div>
        <h1 class="hero-t">Atlas Eléctrico de México</h1>
        <p class="hero-s">De los recursos energéticos al consumidor: un recorrido interactivo por el sistema eléctrico mexicano con datos oficiales de CFE, SENER e IPCC.</p>
        <div class="hero-cta"><a class="btn g" href="#recursos">Comenzar el recorrido →</a><a class="btn o" href="#sabias">Ir a «¿Sabías que?»</a></div>
      </div>
    </section>

    <section class="sec">
      <h2>La ruta de la electricidad</h2>
      <p class="sub">Cinco etapas, un módulo para cada una. Toca una etapa para explorarla.</p>
      <ol class="ruta" aria-label="Ruta de la electricidad, del recurso al consumidor">
        ${ETAPAS.map((e, i) => `<li class="etapa">
          <a href="#${e.id}" class="etapa-card" aria-label="${e.t}: ${e.v} ${e.u}">
            <span class="etapa-n">${e.n}</span>
            <span class="etapa-ic" aria-hidden="true">${e.ic}</span>
            <span class="etapa-t">${e.t}</span>
            <span class="etapa-q">${e.q}</span>
            <span class="etapa-v">${e.v}</span>
            <span class="etapa-u">${e.u}</span>
            <span class="scope ${e.s}">${e.sl}</span>
            <span class="etapa-f">${e.f}</span>
          </a>${i < ETAPAS.length - 1 ? `<span class="ruta-flecha" aria-hidden="true"><i></i></span>` : ""}</li>`).join("")}
      </ol>
    </section>

    <section class="sec">
      <h2>Qué encontrarás</h2>
      <div class="grid3" style="margin-top:12px">
        <a class="card in-card" href="#recursos"><b>🧩 Actividades</b><span>Clasificador, matriz renovable × limpia y preguntas de reflexión con retroalimentación.</span></a>
        <a class="card in-card" href="#transmision"><b>🎛️ Simuladores</b><span>Pérdidas en líneas de transmisión, transformador de distribución y sustitución de generación fósil.</span></a>
        <a class="card in-card" href="#generacion"><b>🗺️ Tres mapas</b><span>Centrales eléctricas, sistemas interconectados y divisiones de distribución.</span></a>
        <a class="card in-card" href="#sabias"><b>💡 20 hallazgos</b><span>Datos sorprendentes con su gráfica y su fuente, más la historia de la reforma energética.</span></a>
        <a class="card in-card" href="#fuentes"><b>📚 Fuentes y metodología</b><span>Documentos, fórmulas, inconsistencias detectadas y datos no disponibles.</span></a>
        <div class="card in-card"><b>🏷️ Cómo leer los datos</b><span><span class="scope s-cfe">CFE</span> solo la empresa · <span class="scope s-nac">Nacional</span> CFE + privados · <span class="scope s-calc">Cálculo</span> derivado de tablas oficiales · <span class="scope s-int">IPCC</span> internacional</span></div>
      </div>
    </section>
    <footer>Atlas Eléctrico de México · VERDALUX · Proyecto académico TE1020 Análisis de Circuitos Eléctricos. Las cifras de esta página provienen de los módulos y conservan su fuente.</footer>`;
  }
  return { render };
})();
