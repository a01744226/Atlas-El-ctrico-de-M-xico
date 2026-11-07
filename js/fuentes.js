/* =====================================================================
   FUENTES Y METODOLOGÍA
   ===================================================================== */
const MF = (() => {
  const DOCS = [
    ["Datos del sector eléctrico", [
      ["CFE", "Informe Anual 2022", "Usuarios, redes y pérdidas de distribución; transmisión 2022", "https://www.cfe.gob.mx/finanzas/reportes-financieros/Informe%20Anual%20Documentos/Informe%20Anual%20Portal.pdf"],
      ["CFE", "Informe Anual 2023", "Generación por tecnología 2022 (anexo), capacidad, distribución y transmisión 2023", "https://www.cfe.gob.mx/finanzas/reportes-financieros/Reportes%20Anuales%20Documentos/Informe%20Anual%202023.pdf"],
      ["CFE", "Informe Anual 2024", "Generación y capacidad por tecnología, centrales, PIE, transmisión y distribución 2024", "https://www.cfe.gob.mx/finanzas/reportes-financieros/Reportes%20Anuales%20Documentos/Informe%20Anual%202024.pdf"],
      ["SENER", "PRODESEN 2023-2037, Capítulo 4", "Generación nacional 2022 por tecnología y energía limpia 2018-2022", null],
      ["SENER", "PRODESEN 2024-2038, Anexos", "Generación neta 2018-2023, capacidad, km por tensión, enlaces, centrales por municipio, redes de distribución", "https://www.gob.mx/sener/es/articulos/programa-de-desarrollo-del-sistema-electrico-nacional-2024-2038?idiom=es"],
      ["SENER", "Plan de Desarrollo del Sector Eléctrico (PLADESE) 2025-2039", "Generación neta, capacidad y km de transmisión 2024; serie de líneas 2010-2024", "https://sidof.segob.gob.mx/notas/docFuente/5770297"],
      ["SENER", "Balance Nacional de Energía 2023 y 2024", "Insumos para generar electricidad, consumo residencial e industrial", null],
    ]],
    ["Marco legal y reforma", [
      ["DOF", "Decreto de reforma constitucional en materia de energía (20/12/2013)", "Arts. 25, 27 y 28", "https://www.dof.gob.mx/nota_detalle.php?codigo=5327463&fecha=20/12/2013"],
      ["DOF", "Edición vespertina del 11/08/2014", "Ley de la Industria Eléctrica y Ley de la CFE", "https://dof.gob.mx/abrirPDF.php?anio=2014&archivo=11082014-VES.pdf&repo=repositorio%2F"],
      ["DOF", "Decreto del 18/03/2025 (Cámara de Diputados)", "Ley de la Empresa Pública del Estado CFE y otras leyes", "https://www.diputados.gob.mx/LeyesBiblio/ref/lpte/LPTE_orig_18mar25.pdf"],
      ["DOF / CENACE", "Ley del Sector Eléctrico (18/03/2025)", "Prevalencia del Estado ≥ 54 %, abrogación de la LIE", "https://www.cenace.gob.mx/Docs/16_MARCOREGULATORIO/Leyes/%28DOF%202025-03-18%20Presidencia%29%20Ley%20del%20Sector%20El%C3%A9ctrico.pdf"],
      ["Gobierno de la República", "Explicación ampliada de la Reforma Energética (2014)", "Objetivos declarados de la reforma", null],
      ["Cámara de Diputados", "Datos relevantes, LXII Legislatura (11/12/2013)", "Votaciones: Diputados 354-134 y Senado 95-28", "https://www.diputados.gob.mx/servicios/datorele/LXII_LEG/1_POS_IIANO/11_dic_13/2.html"],
      ["DOF / SIDOF", "Estatuto Orgánico de CFE Distribución (04/01/2018)", "Lista de las 16 divisiones de distribución", "https://sidof.segob.gob.mx/notas/docFuente/5510072"],
      ["Expansión (prensa)", "Reforma energética en el Senado (10/12/2013)", "Partidos y actores en la votación", "https://expansion.mx/economia/2013/12/10/reforma-energetica-senado-pemex-petroleo"],
      ["IMCO (análisis independiente)", "El PRODESEN 2023-2037 incrementa artificialmente las cifras de energía limpia", "Opinión sobre la metodología", "https://imco.org.mx/el-prodesen-2023-2037-incrementa-artificialmente-las-cifras-de-generacion-de-energia-limpia-en-mexico/"],
    ]],
    ["Ambiental y geográfico", [
      ["IPCC", "AR5 WGIII, Anexo III, Tabla A.III.2", "Factores de emisión directos y de ciclo de vida (gCO₂eq/kWh)", "https://www.ipcc.ch/site/assets/uploads/2018/02/ipcc_wg3_ar5_annex-iii.pdf"],
      ["GeoNames (vía country-state-city 3.2.1)", "Coordenadas de cabeceras municipales y capitales", "Ubicación aproximada de centrales, centros de control y estados", "https://www.geonames.org/"],
      ["Natural Earth (vía world-atlas 2.0.2)", "Contorno de México 1:50m, dominio público", "Respaldo del mapa cuando no hay internet", "https://www.naturalearthdata.com/"],
      ["OpenStreetMap", "Mapa base", "Teselas del mapa (requiere internet)", "https://www.openstreetmap.org/copyright"],
    ]],
  ];
  const METODO = [
    ["Alcance de los datos", "Cada dato lleva una etiqueta: <b>CFE</b> (solo la empresa), <b>NACIONAL</b> (todo el SEN: CFE + privados), <b>CÁLCULO</b> (derivado de tablas oficiales) o <b>INTERNACIONAL</b> (IPCC). No se mezclan alcances en una misma gráfica."],
    ["Generación bruta vs. neta", "CFE reporta generación <b>bruta</b> (en terminales del generador). PRODESEN y PLADESE reportan generación <b>neta inyectada</b> a la red. No son comparables directamente."],
    ["Porcentajes por tipo de recurso", "Fósil = ciclo combinado + vapor convencional + turbogás + turbojet + combustión interna + carboeléctrica. Limpia = renovables + nuclear + cogeneración eficiente (definición legal)."],
    ["Factor de planta", "FP = Energía anual (MWh) / (Capacidad (MW) × horas del año). 2024 tuvo 8,784 h (año bisiesto)."],
    ["Hogares abastecidos", "Hogares = Energía de la central (kWh) / consumo promedio por vivienda. Consumo por vivienda = 281.23 PJ ÷ 3.6 × 10⁹ kWh/PJ ÷ 38 millones de viviendas ≈ 2,056 kWh/año (BNE 2024). Es un valor teórico."],
    ["Simulador de transmisión", "I = P / (√3 · V<sub>L</sub> · cos φ); P<sub>pérdidas</sub> = 3 · I² · R. Sistema trifásico balanceado, solo pérdidas resistivas."],
    ["Simulador de transformador", "Transformador ideal monofásico: V<sub>p</sub>/V<sub>s</sub> = N<sub>p</sub>/N<sub>s</sub>; V<sub>p</sub>·I<sub>p</sub> = V<sub>s</sub>·I<sub>s</sub> = S."],
    ["Conversión de unidades", "1 PJ = 277.78 GWh; 1 GWh = 1,000 MWh = 1,000,000 kWh; 1 kVA = 1,000 VA."],
    ["Verificación", "232 valores tomados de los PDF del proyecto se compararon automáticamente con el texto de la página citada. Los datos 2024 del PLADESE se verificaron contra el texto publicado en SIDOF y contra sus propios totales. Las sumas por tecnología se compararon con los totales oficiales."],
  ];
  const INCONS = [
    "CFE (IA 2024) describe 25.3 % de energía limpia como «del país», pero es sobre la generación de CFE.",
    "Capacidad hidroeléctrica de CFE en 2023: 12,443.6 MW (IA 2023) vs. 12,143.6 MW (IA 2024).",
    "Redes de distribución de CFE: 940 mil km (2022) → 894 mil (2023) → 901 mil (2024); probable cambio de criterio.",
    "PRODESEN 2023-2037: 31.2 % limpia oficial vs. 29.1 % al sumar su Fig. 4.9 (metodología CRE).",
    "Balance Nacional de Energía 2023, p. 48: el texto dice 24.19 % limpia; su propia tabla dice 23.19 %.",
    "Balance Nacional de Energía 2024, Tabla 2.13: presenta como 2024 los km de 2023 y sus subtotales no suman.",
    "Generación nacional 2022: 340,713 GWh (total, PRODESEN 2023-2037) vs. 333,963 GWh (neta, PRODESEN 2024-2038).",
  ];
  const NODISP = [
    "Capacidad individual de Chicoasén, Cerro Prieto y Petacalco (no publicada en las fuentes oficiales consultadas).",
    "Generación individual de los ciclos combinados de Productores Independientes (PIE).",
    "Usuarios, km y pérdidas por división de distribución; límites geográficos oficiales de las divisiones.",
    "Factores de emisión del IPCC para combustóleo, diésel e hidroeléctrica (no verificados en esta versión).",
    "Series comparables de inversión, tarifas, confiabilidad y acceso a la red antes y después de la reforma.",
    "Desglose de votos por partido en la aprobación de la reforma de 2013.",
  ];
  function render() {
    document.getElementById("view").innerHTML = `
      <div class="mod-head"><div class="eyebrow">Referencia</div><h1>Fuentes y metodología</h1>
      <p class="sub">De dónde viene cada dato, cómo se hicieron los cálculos y qué limitaciones tiene el Atlas.</p></div>
      ${DOCS.map(([g, L]) => `<section class="sec"><h2>${g}</h2><div class="src-list" style="margin-top:10px">${L.map(d => `
        <div class="src-item"><b>${d[0]}</b> · ${d[1]}<br><span class="sub" style="font-size:.82rem">Uso en el Atlas: ${d[2]}</span><br>
        ${d[3] ? `<a href="${d[3]}" target="_blank" rel="noopener">${d[3]}</a>` : `<span class="hint">Archivo PDF proporcionado como contexto del proyecto.</span>`}</div>`).join("")}</div></section>`).join("")}
      <section class="sec"><h2>Metodología</h2><div class="grid2" style="margin-top:10px">${METODO.map(m => `<div class="card"><h3>${m[0]}</h3><p class="sub" style="font-size:.86rem;margin-top:4px">${m[1]}</p></div>`).join("")}</div></section>
      <section class="sec"><div class="grid2">
        <div class="card"><h2>Inconsistencias detectadas en las fuentes</h2><ul style="margin:10px 0 0 18px;display:grid;gap:6px;font-size:.86rem">${INCONS.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="card"><h2>Datos no disponibles</h2><ul style="margin:10px 0 0 18px;display:grid;gap:6px;font-size:.86rem">${NODISP.map(x => `<li>${x}</li>`).join("")}</ul></div>
      </div></section>
      <footer>Atlas Eléctrico de México · VERDALUX · Proyecto académico TE1020 Análisis de Circuitos Eléctricos.</footer>`;
  }
  return { render };
})();
