/* Navegación entre módulos y tooltips accesibles */
const MODULOS = {
  inicio: () => MI.render(),
  recursos: () => M0.render(),
  generacion: () => M1.render(),
  transmision: () => M2.render(),
  distribucion: () => M3.render(),
  sabias: () => M4.render(),
  fuentes: () => MF.render(),
};
function pendiente(t) {
  document.getElementById("view").innerHTML =
    `<div class="mod-head"><div class="eyebrow">En desarrollo</div><h1>${t}</h1></div>
     <div class="placeholder">Este módulo se construirá en la siguiente etapa del proyecto.</div>`;
}
const ORDEN = [["inicio", "Inicio"], ["recursos", "Recursos energéticos"], ["generacion", "Generación"], ["transmision", "Transmisión"], ["distribucion", "Distribución"], ["sabias", "¿Sabías que?"], ["fuentes", "Fuentes y metodología"]];
function ir() {
  let id = (location.hash || "#inicio").slice(1);
  if (!MODULOS[id]) id = "inicio";
  document.querySelectorAll("nav a").forEach(a => a.classList.toggle("on", a.dataset.mod === id));
  MODULOS[id]();
  if (id !== "inicio") { construirIndice(); navSiguiente(id); } else quitarIndice();
  window.scrollTo(0, 0);
}

/* ===== Índice de secciones fijo + progreso de lectura ===== */
let espia = null;
function quitarIndice() { if (espia) { espia.disconnect(); espia = null; } document.getElementById("btnArriba")?.classList.remove("show"); }
function construirIndice() {
  quitarIndice();
  const view = document.getElementById("view");
  const heads = [...view.querySelectorAll(".grp, .sec h2, h2[data-idx]")].filter(h => !h.closest(".hcard") && !h.classList.contains("grp-t"));
  if (heads.length < 2) return;
  const items = heads.map((h, i) => {
    const grupo = h.classList.contains("grp");
    const objetivo = grupo ? h : (h.closest(".sec") && h.closest(".sec").querySelector("h2") === h && !h.closest(".reforma") ? h.closest(".sec") : h);
    objetivo.id = objetivo.id || "s" + i; objetivo.classList.add("ancla");
    const txt = grupo ? h.dataset.grp : (h.dataset.idx || h.textContent.replace(/^\s*\d+\s*/, "").split(":")[0]).trim();
    return { el: objetivo, txt, grupo, k: grupo ? h.querySelector(".grp-k").textContent : "" };
  });
  const bar = document.createElement("nav");
  bar.className = "idx"; bar.setAttribute("aria-label", "Secciones de esta página");
  bar.innerHTML = `<div class="idx-prog" aria-hidden="true"><i></i></div><div class="idx-list">${items.map((it, i) =>
    `<button type="button" class="${it.grupo ? "idx-g" : "idx-i"}" data-i="${i}">${it.grupo ? `<b>${it.k}</b> ${it.txt}` : it.txt}</button>`).join("")}</div>`;
  const head = view.querySelector(".mod-head");
  head ? head.after(bar) : view.prepend(bar);
  bar.querySelector(".idx-list").onclick = e => { const b = e.target.closest("[data-i]"); if (!b) return;
    items[+b.dataset.i].el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); };
  const botones = [...bar.querySelectorAll("[data-i]")];
  const activar = i => { botones.forEach((b, j) => { b.classList.toggle("on", j === i); if (j === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    const b = botones[i], L = bar.querySelector(".idx-list"); if (b) L.scrollTo({ left: b.offsetLeft - L.clientWidth / 2 + b.clientWidth / 2, behavior: "smooth" }); };
  const visibles = new Map();
  espia = new IntersectionObserver(ents => {
    ents.forEach(e => visibles.set(e.target, e.isIntersecting ? e.boundingClientRect.top : null));
    let mejor = -1, top = Infinity;
    items.forEach((it, i) => { const t = visibles.get(it.el); if (t != null && t < top) { top = t; mejor = i; } });
    if (mejor >= 0) activar(mejor);
  }, { rootMargin: "-90px 0px -55% 0px" });
  items.forEach(it => espia.observe(it.el));
  activar(0); progreso();
}
function progreso() {
  const p = document.querySelector(".idx-prog i"); const max = document.documentElement.scrollHeight - innerHeight;
  if (p) p.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + "%";
  document.getElementById("btnArriba")?.classList.toggle("show", scrollY > 700 && !!document.querySelector(".idx"));
}
window.addEventListener("scroll", progreso, { passive: true });

/* ===== Anterior / siguiente módulo ===== */
function navSiguiente(id) {
  const i = ORDEN.findIndex(o => o[0] === id); if (i < 0) return;
  const ant = ORDEN[i - 1], sig = ORDEN[i + 1];
  const html = `<nav class="pasos" aria-label="Recorrido">
    ${ant ? `<a href="#${ant[0]}" class="paso ant"><small>← Anterior</small><b>${ant[1]}</b></a>` : "<span></span>"}
    ${sig ? `<a href="#${sig[0]}" class="paso sig"><small>Siguiente →</small><b>${sig[1]}</b></a>` : `<a href="#inicio" class="paso sig"><small>Fin del recorrido</small><b>Volver al inicio ⌂</b></a>`}</nav>`;
  const f = document.querySelector("#view > footer, #view footer");
  f ? f.insertAdjacentHTML("beforebegin", html) : document.getElementById("view").insertAdjacentHTML("beforeend", html);
}
window.addEventListener("hashchange", ir);
document.addEventListener("DOMContentLoaded", ir);

/* ---- Tooltips: hover con ratón, toque/foco en móvil y teclado ---- */
const pop = document.getElementById("tipPop");
function textoTip(el) { return el.dataset.t || GLOSARIO[el.dataset.g] || ""; }
function mostrar(el) {
  const t = textoTip(el); if (!t) return;
  pop.textContent = t; pop.classList.add("show");
  const r = el.getBoundingClientRect(), w = Math.min(280, innerWidth - 24);
  pop.style.maxWidth = w + "px";
  let x = Math.min(Math.max(12, r.left), innerWidth - w - 12);
  let y = r.bottom + 8;
  pop.style.left = x + "px"; pop.style.top = y + "px";
  const h = pop.offsetHeight;
  if (y + h > innerHeight - 8) pop.style.top = (r.top - h - 8) + "px";
}
function ocultar() { pop.classList.remove("show"); }
document.addEventListener("mouseover", e => { const el = e.target.closest(".tip"); el ? mostrar(el) : ocultar(); });
document.addEventListener("focusin", e => { const el = e.target.closest(".tip"); if (el) mostrar(el); });
document.addEventListener("focusout", ocultar);
document.addEventListener("click", e => { const el = e.target.closest(".tip"); if (el) { mostrar(el); e.stopPropagation(); } else ocultar(); });
window.addEventListener("scroll", () => { const f = document.activeElement; f && f.classList && f.classList.contains("tip") ? mostrar(f) : ocultar(); }, { passive: true });
/* Hace enfocables los términos con tooltip */
new MutationObserver(() => document.querySelectorAll(".tip:not([tabindex])").forEach(t => t.setAttribute("tabindex", "0")))
  .observe(document.body, { childList: true, subtree: true });

/* ===== Tema claro / oscuro ===== */
function temaOscuro() {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}
const MAPA_OSCURO = { "#3F4448": "#8C959C", "#24282B": "#C9CED6", "#14532D": "#2F9E5B", "#6B7176": "#8A9096" };
Chart.register({ id: "temaVerdalux", beforeUpdate(ch) {
  if (!temaOscuro()) return;
  const m = c => typeof c === "string" && MAPA_OSCURO[c] ? MAPA_OSCURO[c] : c;
  ch.data.datasets.forEach(d => { ["backgroundColor", "borderColor"].forEach(k => { if (Array.isArray(d[k])) d[k] = d[k].map(m); else d[k] = m(d[k]); }); });
} });
function aplicarTemaGraficas() {
  const d = temaOscuro();
  Chart.defaults.color = d ? "#C9CED6" : "#3F4448";
  Chart.defaults.borderColor = d ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.08)";
}
function cambiarTema() {
  const nuevo = temaOscuro() ? "light" : "dark";
  document.documentElement.dataset.theme = nuevo;
  try { localStorage.setItem("atlas-tema", nuevo); } catch (e) {}
  actualizarBotonTema(); aplicarTemaGraficas(); ir();
}
function actualizarBotonTema() { const b = document.getElementById("btnTema"); if (b) b.textContent = temaOscuro() ? "☀ Modo claro" : "☾ Modo oscuro"; }
try { const t = localStorage.getItem("atlas-tema"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
aplicarTemaGraficas();
document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("beforeend", `<button type="button" id="btnArriba" aria-label="Volver arriba" title="Volver arriba">↑</button>`);
  document.getElementById("btnArriba").onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  actualizarBotonTema();
  document.getElementById("btnTema").onclick = cambiarTema;
  document.getElementById("btnPdf").onclick = () => {
    document.querySelectorAll(".print-head").forEach(e => e.remove());
    const h = document.querySelector(".mod-head h1");
    document.getElementById("view").insertAdjacentHTML("afterbegin", `<div class="print-head"><img src="assets/logo.svg" alt=""><b>VERDALUX · Atlas Eléctrico de México</b><span style="margin-left:auto;font-size:.8rem">${h ? h.textContent : ""} · ${new Date().toLocaleDateString("es-MX")}</span></div>`);
    setTimeout(() => window.print(), 300);
  };
});
window.addEventListener("beforeprint", () => Object.values(Chart.instances).forEach(c => c.resize()));
window.addEventListener("afterprint", () => Object.values(Chart.instances).forEach(c => c.resize()));

/* ===== Mapa base: teselas OSM + contorno de México (funciona sin internet) ===== */
function capaBase(mapa) {
  L.geoJSON(MEXICO_CONTORNO, { interactive: false, style: { color: temaOscuro() ? "#8A9096" : "#6B7176", weight: 1.2, fillColor: temaOscuro() ? "#262C30" : "#E7F3EB", fillOpacity: .55 } }).addTo(mapa);
  const t = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 12, attribution: "© OpenStreetMap · contorno: Natural Earth", opacity: temaOscuro() ? .55 : 1 });
  t.addTo(mapa);
  return t;
}
