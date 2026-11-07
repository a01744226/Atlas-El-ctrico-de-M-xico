# Atlas Eléctrico de México · VERDALUX

App web del proyecto TE1020. Versión actual: **Módulo 0 (Recursos energéticos)**.

## Publicar en GitHub Pages
Sube el CONTENIDO de esta carpeta a la raíz del repositorio (index.html debe quedar en la raíz) y activa Settings → Pages → rama main, carpeta / (root).

## Estructura
- index.html · css/style.css
- js/data.js — datos oficiales con su fuente (CFE, SENER, IPCC)
- js/glosario.js — definiciones de los tooltips
- js/m0.js — Módulo 0 · js/app.js — navegación
- js/m1.js — Módulo 1 (mapa y estadísticas de generación)
- js/m2.js — Módulo 2 (sistemas, red y simulador de transmisión)
- js/m3.js — Módulo 3 (divisiones, indicadores y simulador de transformador)
- js/m4.js — Módulo 4 (20 hallazgos y reforma energética)
- js/fuentes.js — Fuentes y metodología
- js/inicio.js — Página de inicio (ruta de la electricidad)
- js/m0x.js — Ampliación visual del Módulo 0
- js/mexico-contorno.js — contorno de México (Natural Earth) para ver el mapa sin internet
- vendor/ — Chart.js 4.4.1 y Leaflet 1.9.4 incluidos (el mapa base de OpenStreetMap sí requiere internet)
