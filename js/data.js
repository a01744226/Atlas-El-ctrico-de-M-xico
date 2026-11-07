/* =====================================================================
   ATLAS ELÉCTRICO DE MÉXICO · Datos verificados
   Cada dato lleva su fuente (documento y página). No se inventan valores:
   lo que no existe en las fuentes se marca como null → «Dato no disponible».
   ===================================================================== */

const FUENTES = {
  IA22: { inst: "CFE", doc: "Informe Anual 2022", anio: 2022 },
  IA23: { inst: "CFE", doc: "Informe Anual 2023", anio: 2023 },
  IA24: { inst: "CFE", doc: "Informe Anual 2024", anio: 2024 },
  P2337: { inst: "SENER", doc: "PRODESEN 2023-2037, Cap. 4", anio: 2023 },
  P2438: { inst: "SENER", doc: "PRODESEN 2024-2038, Anexos", anio: 2024 },
  BNE23: { inst: "SENER", doc: "Balance Nacional de Energía 2023", anio: 2025 },
  BNE24: { inst: "SENER", doc: "Balance Nacional de Energía 2024", anio: 2025 },
  IPCC: { inst: "IPCC", doc: "AR5 WGIII, Anexo III, Tabla A.III.2", anio: 2014 },
};
const cita = (k, p) => `${FUENTES[k].inst} · ${FUENTES[k].doc}${p ? ", p. " + p : ""}`;

/* Clasificación por recurso de cada tecnología.
   'fosil' | 'nuclear' | 'renovable'. La cogeneración eficiente es un caso especial. */
const TEC = {
  "Ciclo combinado":     { tipo: "fosil",     combustible: "Gas natural" },
  "Vapor convencional":  { tipo: "fosil",     combustible: "Combustóleo o gas natural" },
  "Turbogás":            { tipo: "fosil",     combustible: "Gas natural o diésel" },
  "Turbojet":            { tipo: "fosil",     combustible: "Diésel / turbosina" },
  "Combustión interna":  { tipo: "fosil",     combustible: "Diésel o combustóleo" },
  "Carboeléctrica":      { tipo: "fosil",     combustible: "Carbón mineral" },
  "Nucleoeléctrica":     { tipo: "nuclear",   combustible: "Uranio" },
  "Hidroeléctrica":      { tipo: "renovable", combustible: "Agua" },
  "Geotermoeléctrica":   { tipo: "renovable", combustible: "Calor geotérmico" },
  "Eoloeléctrica":       { tipo: "renovable", combustible: "Viento" },
  "Solar fotovoltaica":  { tipo: "renovable", combustible: "Radiación solar" },
  "Bioenergía":          { tipo: "renovable", combustible: "Biomasa / biogás" },
  "Híbrido FV-batería":  { tipo: "renovable", combustible: "Radiación solar" },
  "Cogeneración eficiente": { tipo: "cogen",  combustible: "Mayormente gas natural" },
};

/* ---------- Generación bruta de CFE por tecnología (GWh) ----------
   2022: IA CFE 2023, anexo p. 304 (PDF) · 2023 y 2024: IA CFE 2024 p. 29 (PDF) / 26 impresa */
const GEN_CFE = {
  fuente: { 2022: cita("IA23", "304 (anexo)"), 2023: cita("IA24", "26"), 2024: cita("IA24", "26") },
  datos: {
    "Ciclo combinado":    { 2022: 50392, 2023: 58234, 2024: 61490 },
    "Vapor convencional": { 2022: 17657, 2023: 29336, 2024: 28135 },
    "Turbogás":           { 2022: 7332,  2023: 8168,  2024: 8379 },
    "Turbojet":           { 2022: 38,    2023: 124,   2024: 209 },
    "Combustión interna": { 2022: 1157,  2023: 2657,  2024: 2851 },
    "Carboeléctrica":     { 2022: 15186, 2023: 15307, 2024: 14012 },
    "Nucleoeléctrica":    { 2022: 10850, 2023: 12386, 2024: 12307 },
    "Hidroeléctrica":     { 2022: 34110, 2023: 19568, 2024: 22354 },
    "Geotermoeléctrica":  { 2022: 4543,  2023: 4321,  2024: 3692 },
    "Eoloeléctrica":      { 2022: 70,    2023: 86,    2024: 75 },
    "Solar fotovoltaica": { 2022: 7,     2023: 274,   2024: 555 },
  },
  totalOficial: { 2022: 141343, 2023: 150462, 2024: 154059 },
  limpiaOficial: { 2023: { v: 24.7, f: cita("IA23", "18") }, 2024: { v: 25.3, f: cita("IA24", "27") } },
};

/* ---------- Generación NETA nacional inyectada a la red (GWh) ----------
   PRODESEN 2024-2038, Anexos, Cuadro A1.11, p. 201 impresa (49 PDF) */
const GEN_NAC = {
  fuente: cita("P2438", "201, Cuadro A1.11"),
  nota: "Generación neta inyectada a la red. Incluye CFE y privados. No es comparable directamente con la generación bruta de CFE.",
  anios: [2018, 2019, 2020, 2021, 2022, 2023],
  datos: {
    "Ciclo combinado":     [163877, 175506, 185638, 186715, 198355, 205598],
    "Vapor convencional":  [39345, 38020, 22405, 22196, 20001, 30358],
    "Turbogás":            [9508, 10904, 8664, 11150, 10471, 12336],
    "Combustión interna":  [2589, 3187, 2841, 2121, 1834, 3621],
    "Carboeléctrica":      [27347, 21611, 12525, 8704, 14194, 14230],
    "Nucleoeléctrica":     [13200, 10881, 10864, 11606, 10539, 12043],
    "Cogeneración eficiente": [2310, 3259, 4188, 3349, 1376, 4136],
    "Hidroeléctrica":      [32234, 23602, 26817, 34717, 35561, 20609],
    "Geotermoeléctrica":   [5065, 5061, 4575, 4243, 4412, 4161],
    "Eoloeléctrica":       [12435, 16727, 19703, 21075, 20314, 20700],
    "Solar fotovoltaica":  [2176, 8394, 13528, 17069, 16278, 18147],
    "Bioenergía":          [600, 669, 600, 582, 617, 499],
    "Híbrido FV-batería":  [0, 0, 0, 0, 12, 63],
  },
  total: [310685, 317820, 312348, 323526, 333963, 346504],
  limpiaPct: [21.89, 21.58, 25.70, 28.63, 26.68, 23.19],
};

/* ---------- Factores de emisión (gCO2eq/kWh), IPCC AR5 Anexo III ----------
   Valores internacionales, no medidos en México. null = la tabla no incluye esa tecnología
   o no se verificó en esta etapa. */
const EMISIONES = {
  fuente: "IPCC · AR5 WGIII, Anexo III, Tabla A.III.2",
  "Carbón (carboeléctrica)":   { directa: [670, 760, 870], ciclo: [740, 820, 910] },
  "Gas natural (ciclo combinado)": { directa: [350, 370, 490], ciclo: [410, 490, 650] },
  "Biomasa dedicada":          { directa: null,           ciclo: [130, 230, 420] },
  "Geotermia":                 { directa: [0, 0, 0],      ciclo: [6, 38, 79] },
  "Nuclear":                   { directa: [0, 0, 0],      ciclo: [3.7, 12, 110] },
  "Solar FV (planta)":         { directa: [0, 0, 0],      ciclo: [18, 48, 180] },
  "Eólica terrestre":          { directa: [0, 0, 0],      ciclo: [7, 11, 56] },
  "Hidroeléctrica":            { directa: null,           ciclo: null },
  "Combustóleo (vapor conv.)": { directa: null,           ciclo: null },
  "Diésel (comb. interna)":    { directa: null,           ciclo: null },
};

/* ---------- Otros indicadores ---------- */
const OTROS = {
  insumosGas2024: { v: 64.2, u: "% de los insumos para generar electricidad fueron gas seco", f: cita("BNE24", "45-46") },
  limpiaNac2022P2337: { v: 31.2, f: cita("P2337", "59"), nota: "Con la metodología de la CRE (Acuerdo A/018/2023). La suma de la Fig. 4.9 da 29.1 %." },
};

/* ---------- Comparador de recursos (cualitativo + datos) ---------- */
const RECURSOS = {
  "Gas natural": { tipo: "fosil", renovable: "No", disponibilidad: "Despachable: se genera cuando se necesita", combustible: "Gas natural (en gran parte importado; el gas seco es el principal energético que se importa, BNE 2024 p. 47)", conversion: "Combustión → turbina de gas + recuperación de calor → turbina de vapor (ciclo combinado)", emis: "Gas natural (ciclo combinado)", tecs: ["Ciclo combinado", "Turbogás"] },
  "Carbón mineral": { tipo: "fosil", renovable: "No", disponibilidad: "Despachable", combustible: "Carbón mineral", conversion: "Combustión → caldera → vapor → turbina (ciclo Rankine)", emis: "Carbón (carboeléctrica)", tecs: ["Carboeléctrica"] },
  "Combustóleo / diésel": { tipo: "fosil", renovable: "No", disponibilidad: "Despachable", combustible: "Derivados del petróleo", conversion: "Combustión → vapor → turbina, o motor de combustión interna", emis: "Combustóleo (vapor conv.)", tecs: ["Vapor convencional", "Combustión interna", "Turbojet"] },
  "Uranio": { tipo: "nuclear", renovable: "No (recurso mineral finito)", disponibilidad: "Despachable, opera como carga base", combustible: "Uranio enriquecido", conversion: "Fisión → calor → vapor → turbina", emis: "Nuclear", tecs: ["Nucleoeléctrica"] },
  "Radiación solar": { tipo: "renovable", renovable: "Sí", disponibilidad: "Variable: depende del día, la hora y la nubosidad", combustible: "Ninguno", conversion: "Efecto fotovoltaico → corriente directa → inversor → corriente alterna", emis: "Solar FV (planta)", tecs: ["Solar fotovoltaica"] },
  "Viento": { tipo: "renovable", renovable: "Sí", disponibilidad: "Variable: depende de la velocidad del viento", combustible: "Ninguno", conversion: "Energía cinética → rotor → generador", emis: "Eólica terrestre", tecs: ["Eoloeléctrica"] },
  "Agua (hidráulica)": { tipo: "renovable", renovable: "Sí", disponibilidad: "Gestionable con embalse, pero depende de la lluvia (2023 fue año seco)", combustible: "Ninguno", conversion: "Energía potencial → caída de agua → turbina → generador", emis: "Hidroeléctrica", tecs: ["Hidroeléctrica"] },
  "Calor geotérmico": { tipo: "renovable", renovable: "Sí (si se gestiona el yacimiento)", disponibilidad: "Despachable, opera como carga base", combustible: "Ninguno", conversion: "Vapor del subsuelo → turbina → generador", emis: "Geotermia", tecs: ["Geotermoeléctrica"] },
  "Biomasa / biogás": { tipo: "renovable", renovable: "Sí, si la biomasa se repone", disponibilidad: "Despachable según disponibilidad de residuos", combustible: "Bagazo de caña, residuos, biogás", conversion: "Combustión o digestión → vapor o motor → generador", emis: "Biomasa dedicada", tecs: ["Bioenergía"] },
};

/* ---------- Centrales para el mapa (Módulo 1) ----------
   Ubicación: municipio según PRODESEN 2024-2038, Anexos, Cuadro A1.9 (p. 195-198).
   Coordenadas: cabecera municipal (GeoNames, vía paquete country-state-city 3.2.1). No es la ubicación exacta de la central.
   Capacidad (MW): IA CFE 2024 p. 24 impresa (hidroeléctricas en modernización), p. 51 (PIE de ciclo combinado,
   capacidad neta demostrada), p. 21-22 (nuclear y Puerto Peñasco Sec. II).
   Generación 2024 (GWh): IA CFE 2024, tablas por central (p. 32-60). null = no reportada. */
const CENTRALES = [
  { n: "Laguna Verde", t: "Nucleoeléctrica", ent: "Veracruz", mun: "Alto Lucero de Gutiérrez Barrios", lat: 20.95361, lon: -97.44194, mw: 1608.0, gwh: 12307, op: "CFE", fmw: "IA CFE 2024 p. 21 (capacidad nucleoeléctrica total)", fg: "IA CFE 2024 p. 26" },
  { n: "Manuel Moreno Torres (Chicoasén)", t: "Hidroeléctrica", ent: "Chiapas", mun: "Chicoasén", lat: 16.96528, lon: -93.10472, mw: null, gwh: 3337.8, op: "CFE", fmw: "—", fg: "IA CFE 2024 p. 60" },
  { n: "Infiernillo", t: "Hidroeléctrica", ent: "Michoacán", mun: "Arteaga", lat: 18.35779, lon: -102.29122, mw: 1200, gwh: 2902.7, op: "CFE", fmw: "IA CFE 2024 p. 24", fg: "IA CFE 2024 p. 32" },
  { n: "Malpaso", t: "Hidroeléctrica", ent: "Chiapas", mun: "Tecpatán", lat: 17.13676, lon: -93.31133, mw: 1080, gwh: 2182.5, op: "CFE", fmw: "IA CFE 2024 p. 24", fg: "IA CFE 2024 p. 60" },
  { n: "Belisario Domínguez (Angostura)", t: "Hidroeléctrica", ent: "Chiapas", mun: "Venustiano Carranza", lat: 16.32314, lon: -92.55844, mw: 900, gwh: 1315.1, op: "CFE", fmw: "IA CFE 2024 p. 24", fg: "IA CFE 2024 p. 60" },
  { n: "Carlos Ramírez Ulloa (El Caracol)", t: "Hidroeléctrica", ent: "Guerrero", mun: "Apaxtla", lat: 18.13127, lon: -99.93255, mw: 600, gwh: 1143.0, op: "CFE", fmw: "IA CFE 2024 p. 24", fg: "IA CFE 2024 p. 32" },
  { n: "Ángel Albino Corzo (Peñitas)", t: "Hidroeléctrica", ent: "Chiapas", mun: "Ostuacán", lat: 17.40664, lon: -93.33643, mw: 420, gwh: 1153.2, op: "CFE", fmw: "IA CFE 2024 p. 24", fg: "IA CFE 2024 p. 60" },
  { n: "La Villita", t: "Hidroeléctrica", ent: "Michoacán", mun: "Lázaro Cárdenas", lat: 17.97066, lon: -102.22124, mw: 320, gwh: 1178.0, op: "CFE", fmw: "IA CFE 2024 p. 24", fg: "IA CFE 2024 p. 32" },
  { n: "Fernando Hiriart Balderrama (Zimapán)", t: "Hidroeléctrica", ent: "Hidalgo", mun: "Zimapán", lat: 20.73814, lon: -99.38180, mw: 292, gwh: 1379.2, op: "CFE", fmw: "IA CFE 2024 p. 24 (+12 MW en dic. 2024)", fg: "IA CFE 2024 p. 32" },
  { n: "Cerro Prieto", t: "Geotermoeléctrica", ent: "Baja California", mun: "Mexicali", lat: 32.50513, lon: -115.14771, mw: null, gwh: 1801.3, op: "CFE", fmw: "—", fg: "IA CFE 2024 p. 41" },
  { n: "Puerto Peñasco (Rafael Galván Maldonado)", t: "Solar fotovoltaica", ent: "Sonora", mun: "Puerto Peñasco", lat: 31.31716, lon: -113.53799, mw: 300, gwh: 406.6, op: "CFE", fmw: "IA CFE 2024 p. 21-22 (solo Secuencia II, en operación desde 11/09/2024)", fg: "IA CFE 2024 p. 41" },
  { n: "Tamazunchale", t: "Ciclo combinado", ent: "San Luis Potosí", mun: "Tamazunchale", lat: 21.25993, lon: -98.78935, mw: 1135, gwh: null, op: "PIE", fmw: "IA CFE 2024 p. 51", fg: "—" },
  { n: "Altamira V", t: "Ciclo combinado", ent: "Tamaulipas", mun: "Altamira", lat: 22.39215, lon: -97.93867, mw: 1121, gwh: null, op: "PIE", fmw: "IA CFE 2024 p. 51", fg: "—" },
  { n: "Tuxpan III y IV", t: "Ciclo combinado", ent: "Veracruz", mun: "Tuxpan", lat: 20.94633, lon: -97.42603, mw: 983, gwh: null, op: "PIE", fmw: "IA CFE 2024 p. 51", fg: "—" },
  { n: "Topolobampo III", t: "Ciclo combinado", ent: "Sinaloa", mun: "Ahome", lat: 25.91985, lon: -109.17320, mw: 765.76, gwh: null, op: "PIE", fmw: "IA CFE 2024 p. 51 (operación comercial desde 01/12/2023)", fg: "—" },
  { n: "Río Bravo IV", t: "Ciclo combinado", ent: "Tamaulipas", mun: "Valle Hermoso", lat: 25.67207, lon: -97.81313, mw: 500, gwh: null, op: "PIE", fmw: "IA CFE 2024 p. 51", fg: "—" },
  { n: "Mexicali", t: "Ciclo combinado", ent: "Baja California", mun: "Mexicali", lat: 32.50513, lon: -115.14771, mw: 489, gwh: null, op: "PIE", fmw: "IA CFE 2024 p. 51", fg: "—" },
  { n: "Mérida III", t: "Ciclo combinado", ent: "Yucatán", mun: "Mérida", lat: 20.97537, lon: -89.61696, mw: 484, gwh: null, op: "PIE", fmw: "IA CFE 2024 p. 51", fg: "—" },
  { n: "Norte Durango", t: "Ciclo combinado", ent: "Durango", mun: "Durango", lat: 24.02032, lon: -104.65756, mw: 450, gwh: null, op: "PIE", fmw: "IA CFE 2024 p. 51", fg: "—" },
];

/* ---------- Transmisión (Módulo 2) ---------- */
const TRANS = {
  kmTension: { // SENER, PRODESEN 2024-2038, Anexos, Cuadro A1.1, p. 156 (datos de CENACE)
    anios: [2021, 2022, 2023],
    datos: { "400 kV": [26098, 26125, 26135], "230 kV": [29723, 29743, 29743], "161 kV": [521, 521, 531],
             "138 kV": [1620, 1620, 1620], "115 kV": [48496, 48584, 48725], "85 kV": [1756, 1757, 1757], "69 kV": [2335, 2335, 2335] },
    total: [110549, 110685, 110846], f: "SENER · PRODESEN 2024-2038, Anexos, Cuadro A1.1, p. 156" },
  transfRNT: { anios: [2021, 2022, 2023], rnt: [114807, 116082, 113688], rgd: [76331, 77056, 79812], f: "SENER · PRODESEN 2024-2038, Anexos, Cuadro A1.2, p. 157" },
  cfe: { anios: [2022, 2023, 2024], km: [110449, 110559, 111138], subest: [2279, 2302, 2317], mva: [165541, 164992, 168981], saidi: [3.471, 11.976, 10.812],
    f: "CFE · Informe Anual 2022 p. 124; 2023 p. 116; 2024 p. 76 y 82 (SAIDI)" },
  // Sistemas y centros de control: PRODESEN 2024-2038, Anexos, p. 155 y 158. Coordenadas: ciudad sede (GeoNames).
  centros: [
    { n: "Central", c: "Ciudad de México", lat: 19.42847, lon: -99.12766, s: "SIN" },
    { n: "Oriental", c: "Puebla", lat: 19.03793, lon: -98.20346, s: "SIN" },
    { n: "Occidental", c: "Guadalajara", lat: 20.67667, lon: -103.3475, s: "SIN" },
    { n: "Noroeste", c: "Hermosillo", lat: 29.1026, lon: -110.97732, s: "SIN" },
    { n: "Norte", c: "Gómez Palacio", lat: 25.56985, lon: -103.49588, s: "SIN" },
    { n: "Noreste", c: "Monterrey", lat: 25.67507, lon: -100.31847, s: "SIN" },
    { n: "Peninsular", c: "Mérida", lat: 20.97537, lon: -89.61696, s: "SIN" },
    { n: "Baja California", c: "Mexicali", lat: 32.50513, lon: -115.14771, s: "SIBC" },
    { n: "Baja California Sur", c: "La Paz", lat: 24.14437, lon: -110.3005, s: "SIBCS" },
    { n: "Mulegé", c: "Santa Rosalía", lat: 27.34045, lon: -112.26761, s: "SIMUL" },
  ],
  // Interconexiones internacionales: PRODESEN 2024-2038, Anexos, Fig. A1.4 y p. 158 (2023). Coordenadas: ciudad mexicana más cercana (GeoNames).
  internac: [
    { n: "Tijuana–Miguel y La Rosita–Imperial Valley", kv: "230 kV (2 líneas)", cap: "+800 MW exportación / −600 MW (verano), −408 MW (invierno) importación", lat: 32.50223, lon: -116.97212, s: "SIBC", nota: "Enlaces síncronos del SIBC con el WECC (oeste de EE. UU.)" },
    { n: "Anapra–Diablo y Ribereña–Ascárate", kv: "69/115 kV", cap: "±100 MW cada uno", lat: 31.72024, lon: -106.46084, s: "SIN", nota: "Enlaces de emergencia con carga aislada (Cd. Juárez–El Paso)" },
    { n: "Ojinaga–Presidio", kv: null, cap: "±6 MW", lat: 29.31371, lon: -104.4484, s: "SIN", nota: "" },
    { n: "Nuevo Laredo–Laredo", kv: "138 kV", cap: "±100 MW", lat: 27.47629, lon: -99.51639, s: "SIN", nota: "Asíncrono: transformador de frecuencia variable" },
    { n: "Cumbres F.–Railroad", kv: "138 kV", cap: "±2×150 MW", lat: 26.08061, lon: -98.28835, s: "SIN", nota: "Asíncrono: dos Back-to-Back LCC (región Reynosa)" },
    { n: "Matamoros–Brownsville y Matamoros–Military", kv: "69 y 138 kV", cap: "+25/−24 MW y +80/−176 MW", lat: 25.72171, lon: -97.60135, s: "SIN", nota: "Operan con carga aislada" },
    { n: "Xul-Ha–West (Belice)", kv: "115 kV", cap: "+55/−50 MW", lat: 18.51413, lon: -88.30381, s: "SIN", nota: "Interconexión con Belice" },
    { n: "Tapachula–Los Brillantes (Guatemala)", kv: "400 kV", cap: "±240 MW", lat: 14.90385, lon: -92.25749, s: "SIN", nota: "Interconexión con Guatemala" },
  ],
};

/* ---------- Distribución (Módulo 3) ---------- */
/* Divisiones: Estatuto Orgánico de CFE Distribución, DOF 04/01/2018, art. 5 (lista oficial de 16).
   Asignación estado → división principal: PRELIMINAR. ver=true cuando el art. 26 del Estatuto lo confirma;
   ver=false = aproximación por nombre. Varios estados se reparten entre divisiones.
   Coordenadas: capital estatal (GeoNames, vía country-state-city 3.2.1). */
const DIV_ESTADOS = [{"e": "Baja California", "d": "Baja California", "ver": true, "c": "Mexicali", "lat": 32.50513, "lon": -115.14771}, {"e": "Baja California Sur", "d": "Baja California", "ver": true, "c": "La Paz", "lat": 24.14437, "lon": -110.3005}, {"e": "Sonora", "d": "Noroeste", "ver": false, "c": "Hermosillo", "lat": 29.1026, "lon": -110.97732}, {"e": "Sinaloa", "d": "Noroeste", "ver": false, "c": "Culiacán", "lat": 24.79032, "lon": -107.38782}, {"e": "Chihuahua", "d": "Norte", "ver": false, "c": "Chihuahua", "lat": 28.82669, "lon": -106.19876}, {"e": "Durango", "d": "Norte", "ver": false, "c": "Victoria de Durango", "lat": 24.02032, "lon": -104.65756}, {"e": "Coahuila", "d": "Golfo Norte", "ver": false, "c": "Saltillo", "lat": 25.42321, "lon": -101.0053}, {"e": "Nuevo León", "d": "Golfo Norte", "ver": false, "c": "Monterrey", "lat": 25.67507, "lon": -100.31847}, {"e": "Tamaulipas", "d": "Golfo Norte", "ver": false, "c": "Ciudad Victoria", "lat": 23.74174, "lon": -99.14599}, {"e": "Jalisco", "d": "Jalisco", "ver": false, "c": "Guadalajara", "lat": 20.67667, "lon": -103.3475}, {"e": "Nayarit", "d": "Jalisco", "ver": false, "c": "Tepic", "lat": 21.50951, "lon": -104.89569}, {"e": "Colima", "d": "Centro Occidente", "ver": true, "c": "Villa de Álvarez (zona conurbada de Colima)", "lat": 19.26722, "lon": -103.73778}, {"e": "Michoacán", "d": "Centro Occidente", "ver": true, "c": "Morelia", "lat": 19.70078, "lon": -101.18443}, {"e": "Guanajuato", "d": "Bajío", "ver": true, "c": "Guanajuato", "lat": 21.01858, "lon": -101.2591}, {"e": "Querétaro", "d": "Bajío", "ver": true, "c": "Santiago de Querétaro", "lat": 20.58806, "lon": -100.38806}, {"e": "Aguascalientes", "d": "Bajío", "ver": true, "c": "Aguascalientes", "lat": 21.88333, "lon": -102.3}, {"e": "Zacatecas", "d": "Bajío", "ver": true, "c": "Zacatecas", "lat": 22.76843, "lon": -102.58141}, {"e": "San Luis Potosí", "d": "Golfo Centro", "ver": false, "c": "San Luis Potosí", "lat": 22.14982, "lon": -100.97916}, {"e": "Hidalgo", "d": "Centro Oriente", "ver": true, "c": "Pachuca de Soto", "lat": 20.11697, "lon": -98.73329}, {"e": "Puebla", "d": "Centro Oriente", "ver": true, "c": "Puebla", "lat": 19.03793, "lon": -98.20346}, {"e": "Tlaxcala", "d": "Centro Oriente", "ver": true, "c": "Tlaxcala", "lat": 19.31905, "lon": -98.19982}, {"e": "Morelos", "d": "Centro Sur", "ver": true, "c": "Cuernavaca", "lat": 18.95532, "lon": -99.24002}, {"e": "Guerrero", "d": "Centro Sur", "ver": true, "c": "Chilpancingo", "lat": 17.5506, "lon": -99.50578}, {"e": "Estado de México", "d": "Valle de México Norte / Valle de México Sur", "ver": false, "c": "Toluca", "lat": 19.3278, "lon": -99.66024}, {"e": "Ciudad de México", "d": "Valle de México Centro", "ver": false, "c": "Ciudad de México", "lat": 19.42847, "lon": -99.12766}, {"e": "Veracruz", "d": "Oriente", "ver": false, "c": "Xalapa de Enríquez", "lat": 19.53124, "lon": -96.91589}, {"e": "Oaxaca", "d": "Sureste", "ver": false, "c": "Oaxaca", "lat": 17.06542, "lon": -96.72365}, {"e": "Chiapas", "d": "Sureste", "ver": false, "c": "Tuxtla", "lat": 16.75973, "lon": -93.11308}, {"e": "Tabasco", "d": "Sureste", "ver": false, "c": "Villahermosa", "lat": 17.98689, "lon": -92.93028}, {"e": "Campeche", "d": "Peninsular", "ver": false, "c": "Campeche", "lat": 19.84386, "lon": -90.52554}, {"e": "Yucatán", "d": "Peninsular", "ver": false, "c": "Mérida", "lat": 20.97537, "lon": -89.61696}, {"e": "Quintana Roo", "d": "Peninsular", "ver": false, "c": "Chetumal", "lat": 18.51413, "lon": -88.30381}];
const DIST = {
  cfe: { anios: [2022, 2023, 2024], usuarios: [47.4, 48.2, 49.1], km: [940, 894, 901], perdAT: [11.05, 10.86, 10.69], perdMTBT: [13.22, 12.88, 12.88], saidi: [19.248, 17.788, 16.708],
    f: "CFE · Informe Anual 2022 p. 140; 2023 p. 132-133; 2024 p. 95-96" },
  electrif2023: { v: 99.43, f: "CFE · Informe Anual 2023 p. 132" },
  divisiones: { v: 16, zonas: 150, f: "CFE · Informe Anual 2024 p. 95" },
  redes2023: { mt: 551465, bt: 342741, trafos: 1640728, mva: 60010, circMT: 12358, f: "SENER · PRODESEN 2024-2038, Anexos, Cuadro A1.3, p. 157" },
  consumo2024: { resPJ: 281.23, indPJ: 705.12, viviendas: 38, f: "SENER · Balance Nacional de Energía 2024, p. 57 y 62" },
};

/* ---------- Capacidad interconectada nacional (MW) ----------
   SENER, PRODESEN 2024-2038, Anexos, Cuadro A1.7, p. 186 (excluye centrales en pruebas) */
const PROD_CAP = {
  anios: [2018, 2019, 2020, 2021, 2022, 2023],
  total: [72958, 78447, 83121, 86153, 87130, 89008],
  limpia: [23946, 26900, 29506, 30812, 31369, 32449],
  fv: [1878, 3646, 5149, 5955, 6515, 7437],
  eol: [4866, 6050, 6504, 6977, 6921, 7055],
};

/* =====================================================================
   ACTUALIZACIÓN 2024 · SENER, Plan de Desarrollo del Sector Eléctrico (PLADESE) 2025-2039,
   Acuerdo publicado en el DOF (oct. 2025), consultado en SIDOF/Segob (docFuente 5770297).
   Tabla 2.1 (capacidad dic. 2024), Tabla 2.2 (generación neta inyectada 2024), Tabla 2.3 (km de transmisión).
   ===================================================================== */
FUENTES.PLADESE = { inst: "SENER", doc: "PLADESE 2025-2039 (DOF, oct. 2025)", anio: 2025 };
(() => {
  const g24 = { "Ciclo combinado": 212819, "Vapor convencional": 28228, "Turbogás": 12017, "Combustión interna": 3847, "Carboeléctrica": 12968,
    "Nucleoeléctrica": 11978, "Cogeneración eficiente": 3912, "Hidroeléctrica": 23800, "Geotermoeléctrica": 3576, "Eoloeléctrica": 19987,
    "Solar fotovoltaica": 18640, "Bioenergía": 533, "Híbrido FV-batería": 0 /* no se reporta por separado en la Tabla 2.2 */ };
  GEN_NAC.anios.push(2024);
  for (const t in GEN_NAC.datos) GEN_NAC.datos[t].push(g24[t]);
  GEN_NAC.total.push(352305);
  GEN_NAC.limpiaPct.push(23.4);
  GEN_NAC.fuente = "SENER · PRODESEN 2024-2038, Anexos, Cuadro A1.11, p. 201 (2018-2023); PLADESE 2025-2039, Tabla 2.2 (2024)";
  // Transmisión 2024 (Tabla 2.3)
  const k24 = { "400 kV": 26451, "230 kV": 29749, "161 kV": 520, "138 kV": 1603, "115 kV": 48717, "85 kV": 1764, "69 kV": 2335 };
  TRANS.kmTension.anios.push(2024);
  for (const n in TRANS.kmTension.datos) TRANS.kmTension.datos[n].push(k24[n]);
  TRANS.kmTension.total.push(111138); // 56,720 + 54,418 (subtotales oficiales)
  TRANS.kmTension.f = "SENER · PRODESEN 2024-2038, Anexos, Cuadro A1.1, p. 156 (2021-2023); PLADESE 2025-2039, Tabla 2.3 (2024)";
  // Capacidad 2024 (Tabla 2.1)
  PROD_CAP.anios.push(2024); PROD_CAP.total.push(90543); PROD_CAP.limpia.push(33441); PROD_CAP.fv.push(7961); PROD_CAP.eol.push(7512);
})();
/* Serie histórica de líneas de 400 y 230 kV (km), PLADESE 2025-2039, Tabla 2.3. Permite ver 2010-2013 (antes de la reforma). */
const KM_HIST = { anios: [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
  kv400: [22272,22880,24018,24026,24031,24697,24714,24746,25455,25921,26097,26098,26125,26135,26451],
  kv230: [27317,26867,27924,28240,28785,28518,28566,29096,29115,29425,29722,29723,29743,29743,29749],
  f: "SENER · PLADESE 2025-2039, Tabla 2.3" };

/* ---------- Capacidad y generación nacional 2024 por tecnología ----------
   SENER, PLADESE 2025-2039: Tabla 2.1 (capacidad instalada a dic. 2024, MW) y Tabla 2.2 (generación neta inyectada 2024, GWh). */
const PLADESE24 = {
  f: "SENER · PLADESE 2025-2039, Tablas 2.1 y 2.2",
  horas: 8784, // 2024 fue bisiesto
  tec: {
    "Nucleoeléctrica":    { mw: 1608,  gwh: 11978,  tipo: "nuclear" },
    "Ciclo combinado":    { mw: 35669, gwh: 212819, tipo: "fosil" },
    "Combustión interna": { mw: 717,   gwh: 3847,   tipo: "fosil" },
    "Geotermoeléctrica":  { mw: 976,   gwh: 3576,   tipo: "renovable" },
    "Turbogás":           { mw: 3953,  gwh: 12017,  tipo: "fosil" },
    "Eoloeléctrica":      { mw: 7512,  gwh: 19987,  tipo: "renovable" },
    "Vapor convencional": { mw: 11300, gwh: 28228,  tipo: "fosil" },
    "Carboeléctrica":     { mw: 5463,  gwh: 12968,  tipo: "fosil" },
    "Solar fotovoltaica": { mw: 7961,  gwh: 18640,  tipo: "renovable" }, // capacidad sin incluir 92 MW de híbrido FV-baterías
    "Hidroeléctrica":     { mw: 12612, gwh: 23800,  tipo: "renovable" },
    "Bioenergía":         { mw: 387,   gwh: 533,    tipo: "renovable" },
  },
  cogen: { mw: 2293, gwh: 3912 }, // limpia por ley, combustible fósil
  totalGWh: 352305, limpiaGWh: 82426,
};

/* ---------- Insumos energéticos para generar electricidad, 2024 (PJ) ----------
   SENER, Balance Nacional de Energía 2024, p. 45-46. */
const BNE24_INSUMOS = {
  f: "SENER · Balance Nacional de Energía 2024, p. 45-46",
  total: 3405.56, electricidad: 1381.52, eficiencia: 40.6,
  items: [
    { n: "Gas seco", pj: 2186.18, tipo: "fosil" },
    { n: "Carbón mineral", pj: 147.47, tipo: "fosil" },
    { n: "Combustóleo", pj: 47.09, tipo: "fosil" },
    { n: "Diésel", pj: 33.43, tipo: "fosil" },
    { n: "Coque de petróleo", pj: 17.77, tipo: "fosil" },
    { n: "Nuclear", pj: 129.51, tipo: "nuclear" },
    { n: "Hidráulica", pj: 262.18, tipo: "renovable" },
    { n: "Eólica", pj: 220.18, tipo: "renovable" },
    { n: "Solar", pj: 205.70, tipo: "renovable" },
    { n: "Geoenergía", pj: 91.32, tipo: "renovable" },
    { n: "Bagazo de caña", pj: 61.50, tipo: "renovable" },
    { n: "Biogás", pj: 3.25, tipo: "renovable" },
  ],
};
