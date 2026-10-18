/* EXE REACTOR engine v1.1.0 · form&soul.exe · © form&soul.exe — licensed for use with a purchased EXE REACTOR widget */
(function () {
  "use strict";
  var me = document.currentScript && document.currentScript.src;
  var BASE = window.DR_ASSET_BASE || (me ? me.replace(/engine\/[^\/]*$/, "") : "");
  window.DR_ASSET_BASE = BASE;
  var IMAGES = {"assets/duck/derived/seated/chairmatched/duck_seated_alarmed_alpha.png": "assets/duck/derived/seated/chairmatched/duck_seated_alarmed_alpha.webp", "assets/duck/derived/seated/chairmatched/duck_seated_coffee_alpha.png": "assets/duck/derived/seated/chairmatched/duck_seated_coffee_alpha.webp", "assets/duck/derived/seated/chairmatched/duck_seated_notice_alpha.png": "assets/duck/derived/seated/chairmatched/duck_seated_notice_alpha.webp", "assets/duck/derived/seated/chairmatched/duck_seated_panic_alpha.png": "assets/duck/derived/seated/chairmatched/duck_seated_panic_alpha.webp", "assets/duck/derived/seated/chairmatched/duck_seated_panic_wings_mid_alpha.png": "assets/duck/derived/seated/chairmatched/duck_seated_panic_wings_mid_alpha.webp", "assets/duck/derived/seated/duck_seated_alarmed_alpha.png": "assets/duck/derived/seated/duck_seated_alarmed_alpha.webp", "assets/duck/derived/seated/duck_seated_coffee_alpha.png": "assets/duck/derived/seated/duck_seated_coffee_alpha.webp", "assets/duck/derived/seated/duck_seated_idle_alpha.png": "assets/duck/derived/seated/duck_seated_idle_alpha.webp", "assets/duck/derived/seated/duck_seated_notice_alpha.png": "assets/duck/derived/seated/duck_seated_notice_alpha.webp", "assets/duck/derived/seated/duck_seated_panic_alpha.png": "assets/duck/derived/seated/duck_seated_panic_alpha.webp", "assets/duck/derived/seated/duck_seated_panic_wings_mid_alpha.png": "assets/duck/derived/seated/duck_seated_panic_wings_mid_alpha.webp", "assets/reactor/reactor_master_clean_v1.png": "assets/reactor/reactor_master_clean_v1.webp"};
  var urls = window.DR_ASSET_URLS = window.DR_ASSET_URLS || {};
  var keys = Object.keys(IMAGES);
  Promise.all(keys.map(function (k) {
    return fetch(BASE + IMAGES[k]).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(function (b) { urls[k] = URL.createObjectURL(b); })
      .catch(function () { urls[k] = BASE + IMAGES[k]; });
  })).then(boot, boot);
  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    if (!document.getElementById("scene")) { console.error("[exe-reactor] #scene not found"); return; }
    try { run(); } catch (e) { console.error("[exe-reactor]", e); }
  }
  function run() {
/* ---- src/i18n.js ---- */
/*
 * Duck Reactor — sistema central de traducciones (etapa 15).
 *
 * Cinco idiomas: en · es · pt-PT · de · fr. Un solo ajuste (memes.lang) elige
 * el idioma del widget y del laboratorio.
 *
 *  - Textos del widget (escena): memes.texts[idioma][clave] en la configuración
 *    (claves estables: gsReply, lvPANIC, scrSoonLines…) y las cinco variantes de
 *    cada entrada del catálogo. Se pueden editar y se guardan con los ajustes.
 *  - Textos del laboratorio: diccionario con identificadores estables
 *    (DR_I18N_LAB: [id, es, en, pt-PT, de, fr]). El código del laboratorio está
 *    escrito en español; las cadenas fijas se traducen al pintarse (capa DOM) y
 *    las que llevan datos usan la plantilla etiquetada L`… ${x} …`.
 *
 * Si falta una traducción se usa la alternativa definida: en → es → resto.
 *
 * window.DR.i18n = { LANGS, NAMES, lang, setLang(l), chain(l), L, t(es), watch(root), onChange(fn), misses }
 */
(function () {
  "use strict";
  const DR = (window.DR = window.DR || {});
  const LANGS = ["en", "es", "pt-PT", "de", "fr"];
  const NAMES = { en: "English", es: "Español", "pt-PT": "Português (Portugal)", de: "Deutsch", fr: "Français" };
  const SHORT = { en: "EN", es: "ES", "pt-PT": "PT", de: "DE", fr: "FR" };
  /* Alternativa cuando falta un texto: el propio idioma, inglés, español y el resto. */
  const chain = (l) => [l, "en", "es"].concat(LANGS).filter((v, i, a) => a.indexOf(v) === i);

  let lang = "es";
  const dict = new Map();   // id → { es, en, pt-PT, de, fr }
  const bySrc = new Map();  // texto fuente (es) → id
  const misses = new Set(); // claves sin traducir vistas (comprobación de cobertura)
  const listeners = new Set();

  function add(rows) {
    (rows || []).forEach((r) => {
      if (!Array.isArray(r) || r.length < 2) return;
      const [id, es, en, pt, de, fr] = r;
      dict.set(id, { es, en, "pt-PT": pt, de, fr });
      if (!bySrc.has(es)) bySrc.set(es, id);
    });
  }

  /* Traducción de un texto fuente conocido (sin espacios de borde). null si no se conoce. */
  function known(src, l) {
    const id = bySrc.get(src);
    if (!id) return null;
    const d = dict.get(id);
    for (const k of chain(l)) if (d[k]) return d[k];
    return src;
  }
  /* Conserva espacios de borde: " · en pausa" → " · paused" */
  function edge(text, fn) {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
    if (!m[2]) return null;
    const r = fn(m[2]);
    return r == null ? null : m[1] + r + m[3];
  }
  const t = (src, l) => { l = l || lang; if (typeof src !== "string") return src; if (l === "es") return src; const r = edge(src, (s) => known(s, l)); return r == null ? src : r; };

  /* Registro de textos producidos por L`…` para volver a traducirlos al cambiar de idioma. */
  const made = new Map();
  function remember(out, ref) {
    if (!out || made.has(out)) return;
    // L`${titulo}${extra}` con extra vacío devuelve el propio dato: no se registra (evita ciclos)
    if (ref.vals.some((v) => v === out)) return;
    made.set(out, ref);
    if (made.size > 4000) made.delete(made.keys().next().value);
  }
  function render(ref, l, depth) {
    depth = (depth || 0) + 1;
    const tpl = l === "es" ? null : known(ref.key, l);
    if (!tpl && l !== "es") misses.add(ref.key);
    const vals = ref.vals.map((v) => tvalue(v, l, depth));
    if (tpl) return tpl.replace(/\{(\d+)\}/g, (m, i) => (vals[+i] == null ? "" : String(vals[+i])));
    return ref.parts.reduce((acc, s, i) => acc + (i ? String(vals[i - 1] == null ? "" : vals[i - 1]) : "") + s, "");
  }
  function tvalue(v, l, depth) {
    if (typeof v !== "string") return v;
    const r = depth > 8 ? null : made.get(v); // red de seguridad contra referencias circulares
    if (r) return render(r, l, depth);
    if (l === "es") return v;
    const k = edge(v, (s) => known(s, l));
    return k == null ? v : k;
  }
  /* Plantilla etiquetada: L`Prueba bloqueada (${nombre}): ${motivo}.` */
  function L(strings) {
    const parts = Array.from(strings);
    const vals = Array.prototype.slice.call(arguments, 1);
    const key = parts.map((s, i) => (i ? "{" + (i - 1) + "}" : "") + s).join("");
    const ref = { key, parts, vals };
    const out = render(ref, lang);
    remember(out, ref);
    return out;
  }

  /* ---------------------------------------------------------- capa DOM */
  const NODE = new WeakMap();   // nodo de texto → { d, out }
  const ATTR = new WeakMap();   // elemento → { attr: { d, out } }
  const ATTRS = ["title", "placeholder", "aria-label"];
  const roots = new Set();
  function describe(text) {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text || "");
    const core = m[2];
    if (!core) return null;
    if (bySrc.has(core)) return { pre: m[1], post: m[3], src: core };
    const r = made.get(core);
    if (r) return { pre: m[1], post: m[3], ref: r };
    return null;
  }
  function outFor(d, l) {
    const core = d.src != null ? (l === "es" ? d.src : known(d.src, l)) : render(d.ref, l);
    return d.pre + core + d.post;
  }
  const skip = (el) => !!(el && el.closest && el.closest("[data-noi18n]"));
  function doText(node) {
    const cur = node.nodeValue;
    const st = NODE.get(node);
    if (st && st.out === cur && st.lang === lang) return;
    const p = node.parentNode;
    if (!p || p.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || skip(p)) return;
    const d = st && st.out === cur ? st.d : describe(cur);
    if (!d) { NODE.delete(node); return; }
    const out = outFor(d, lang);
    NODE.set(node, { d, out, lang });
    if (out !== cur) node.nodeValue = out;
  }
  function doAttrs(el) {
    if (skip(el)) return;
    let m = ATTR.get(el);
    for (const a of ATTRS) {
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      const cur = el.getAttribute(a);
      const st = m && m[a];
      if (st && st.out === cur && st.lang === lang) continue;
      const d = st && st.out === cur ? st.d : describe(cur);
      if (!d) continue;
      const out = outFor(d, lang);
      if (!m) { m = {}; ATTR.set(el, m); }
      m[a] = { d, out, lang };
      if (out !== cur) el.setAttribute(a, out);
    }
  }
  function walkTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || skip(root)) return;
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  const mo = typeof MutationObserver === "function" ? new MutationObserver((list) => {
    for (const r of list) {
      if (r.type === "characterData") doText(r.target);
      else if (r.type === "attributes") doAttrs(r.target);
      else r.addedNodes.forEach(walkTree);
    }
  }) : null;
  /* Traduce y vigila un elemento del laboratorio (nunca la escena del widget). */
  function watch(root) {
    if (!root || roots.has(root)) return;
    roots.add(root);
    walkTree(root);
    if (mo) mo.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function setLang(l) {
    if (!LANGS.includes(l)) l = "en";
    if (l === lang) return;
    lang = l;
    try { document.documentElement.lang = l; } catch (e) { /* nada */ }
    roots.forEach(walkTree);
    listeners.forEach((fn) => { try { fn(l); } catch (e) { console.error("[duck-reactor] i18n listener", e); } });
  }

  DR.i18n = {
    LANGS, NAMES, SHORT, chain, add, L, t, watch, setLang, misses,
    get lang() { return lang; },
    has: (src) => bySrc.has(src),
    size: () => dict.size,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    /* Comprobación: textos visibles del laboratorio que no se reconocen. */
    unknownIn(root) {
      const out = new Set();
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        const p = n.parentNode;
        if (!p || skip(p) || /^(SCRIPT|STYLE|TEXTAREA|OPTION)$/.test(p.tagName) && p.tagName !== "OPTION") continue;
        if (p.closest && p.closest("[hidden]")) continue;
        const s = (n.nodeValue || "").trim();
        if (s && /[a-zà-ÿ]{3,}/i.test(s) && !NODE.get(n)) out.add(s);
      }
      return [...out];
    },
  };
  if (window.DR_I18N_LAB) add(window.DR_I18N_LAB);
})();

;
/* ---- src/config.js ---- */
/*
 * Duck Reactor — configuración por defecto (etapa 3: laboratorio).
 *
 * Es la "configuración original": el panel de ajustes parte de aquí, compara
 * contra ella y "Restablecer" vuelve a estos valores. El panel puede exportar
 * un config.js con la misma forma para sustituir este archivo.
 *
 * Todas las coordenadas están en píxeles del fondo (1376 × 768). La escena
 * entera escala como un bloque. Script clásico: funciona abriendo index.html
 * desde el disco, sin servidor.
 *
 * Los datos del reactor son FICTICIOS: un simulador de juguete para probar
 * el widget, no un modelo físico.
 */
window.DUCK_REACTOR_CONFIG = {
  schemaVersion: 13,

  stage: {
    width: 1376,
    height: 768,
    background: "assets/reactor/reactor_master_clean_v1.png",
  },

  /* ---------------------------------------------------------------- PATO */

  /* Composición aprobada: los cinco composites comparten lienzo y ancla. */
  duck: {
    canvas: 1024,
    anchor: { x: 535, y: 986 },  // centro de la base / apoyo de la rueda delantera (px de composite)
    stageX: 688,
    floorY: 752,
    scale: 0.44,
  },

  /*
   * matched: misma imagen con la silla igualada en tono a IDLE (etapa 8).
   * Sólo cambian píxeles de la silla (máscara por fotograma que excluye al
   * pato, la taza y las alas); alfa, geometría y encuadre son idénticos.
   * Los originales («file») se conservan para comparar antes/después.
   * Generado con tools/chair/match.py.
   */
  states: {
    IDLE:    { file: "assets/duck/derived/seated/duck_seated_idle_alpha.png",    label: "Idle",    offset: { x: 0, y: 0 } },
    COFFEE:  { file: "assets/duck/derived/seated/duck_seated_coffee_alpha.png",  matched: "assets/duck/derived/seated/chairmatched/duck_seated_coffee_alpha.png",  label: "Coffee",  offset: { x: 0, y: 0 } },
    NOTICE:  { file: "assets/duck/derived/seated/duck_seated_notice_alpha.png",  matched: "assets/duck/derived/seated/chairmatched/duck_seated_notice_alpha.png",  label: "Notice",  offset: { x: 0, y: 0 } },
    ALARMED: { file: "assets/duck/derived/seated/duck_seated_alarmed_alpha.png", matched: "assets/duck/derived/seated/chairmatched/duck_seated_alarmed_alpha.png", label: "Alarmed", offset: { x: 0, y: 0 } },
    PANIC:   { file: "assets/duck/derived/seated/duck_seated_panic_alpha.png",   matched: "assets/duck/derived/seated/chairmatched/duck_seated_panic_alpha.png",   label: "Panic",   offset: { x: 0, y: 0 } },
  },
  /*
   * Fotogramas extra (no son estados): variante de PANIC con las alas casi
   * horizontales para el aleteo. Mismo lienzo y encuadre que PANIC; silla,
   * cara y cuerpo verificados sin desplazamiento (ver ASSETS_STATUS.md).
   */
  frames: {
    PANIC_MID: { file: "assets/duck/derived/seated/duck_seated_panic_wings_mid_alpha.png", matched: "assets/duck/derived/seated/chairmatched/duck_seated_panic_wings_mid_alpha.png", base: "PANIC", offset: { x: 0, y: 0 } },
  },
  sequence: ["IDLE", "NOTICE", "ALARMED", "PANIC"],
  independent: ["COFFEE"],
  initialState: "IDLE",

  /*
   * Comportamiento del pato.
   * mode: "auto" = reacciona al nivel del reactor · "manual" = pose bloqueada.
   * reactionDelay: segundos de simulación que el nivel debe mantenerse antes
   * de que el pato cambie de pose. COFFEE sólo aparece en nivel normal y una
   * alarma lo interrumpe.
   */
  behavior: {
    mode: "auto",
    manualPose: "IDLE",
    reactionDelay: 0.6,
    coffee: { auto: true, everyMin: 40, everyMax: 80, duration: 12 },
    /*
     * Aleteo de PANIC: HIGH → MID → HIGH por ciclo, cambio de sprite sin
     * fundido. Se dispara una vez al entrar en PANIC en modo automático y se
     * rearma al salir; al terminar se queda en HIGH. frameMs = duración de
     * cada fotograma: en el disparo automático son ms de simulación (respeta
     * pausa y velocidad); en «Probar aleteo», ms reales.
     */
    /* continuous: en bucle mientras dure CRITICAL (por defecto); false = breve (`cycles` ciclos). */
    flap: { enabled: true, frameMs: 60, cycles: 5, continuous: true },
  },

  /* Sombra de contacto (coordenadas del composite). */
  shadow: {
    enabled: true,
    color: "#140b04",
    base: { cx: 540, cy: 936, rx: 260, ry: 52, opacity: 0.26, blur: 12 },
    wheels: {
      opacity: 0.62, blur: 2.5, rx: 36, ry: 10,
      points: [
        { x: 342, y: 980 },
        { x: 701, y: 986 },
        { x: 276, y: 889 },
        { x: 787, y: 893 },
      ],
    },
  },

  /*
   * Corrección cálida del composite (filtro SVG; los PNG no se tocan). Es
   * global e igual para todos los estados: no hay compensaciones por estado.
   * chairMatch: usa las versiones con la silla igualada a IDLE («matched»).
   */
  grade: { enabled: true, warmth: 0.45, exposure: 1.0, chairMatch: true },

  /* ----------------------------------------------------------- SIMULADOR */

  /*
   * mode: "auto" | "manual" | "scenario". speed: multiplicador del reloj.
   * auto: evolución ficticia. La temperatura tiende a un equilibrio que sube
   * con el calentamiento (+140 °C por punto sobre 1) y con la falta de
   * refrigeración (+230 °C si cae a 0; −110 °C por punto sobre 1), más una
   * deriva lenta (drift, °C), ruido (fluctuation, °C) y un tiempo de
   * respuesta (response, s).
   * manual: valores fijados a mano (la simulación no los toca).
   * thresholds: umbrales de temperatura (°C) para NOTICE / ALARMED / PANIC,
   * histéresis (°C por debajo del umbral para bajar de nivel) y retardos de
   * reacción (s de simulación para subir y para bajar de nivel).
   */
  sim: {
    mode: "auto",
    speed: 1,
    base: { temp: 612, pressure: 14.2, coolant: 87, rods: 62, output: 1180, load: 64 },
    auto: { heating: 1, cooling: 1, fluctuation: 0.6, drift: 6, response: 20 },
    manual: { temp: 612, pressure: 14.2, coolant: 87, rods: 62, output: 1180, load: 64 },
    scenario: "normal",
    thresholds: { notice: 680, alarmed: 750, panic: 820, hysteresis: 8, escalateDelay: 2, recoverDelay: 4 },
  },

  /*
   * Escenarios reproducibles (misma semilla de ruido en cada reinicio).
   * keys: [segundo, calentamiento, refrigeración]; entre claves se interpola.
   * response (opcional): tiempo de respuesta propio del escenario.
   */
  scenarios: {
    normal:   { name: "Funcionamiento normal", description: "Todo en orden durante 2 minutos.", start: 612, duration: 120, keys: [[0, 1, 1], [120, 1, 1]] },
    rise:     { name: "Aumento de temperatura", description: "El calentamiento sube poco a poco: primero aviso (NOTICE) y después alarma (ALARMED).", start: 612, duration: 120, response: 25, keys: [[0, 1, 1], [12, 1, 1], [70, 2.2, 1], [120, 2.2, 1]] },
    coolant:  { name: "Fallo de refrigeración", description: "La refrigeración cae casi a cero a los 10 s y la temperatura sube hasta alarma.", start: 612, duration: 120, response: 22, keys: [[0, 1, 1], [10, 1, 1], [22, 1, 0.15], [120, 1, 0.15]] },
    critical: { name: "Alarma crítica", description: "Calentamiento máximo y refrigeración mínima: pasa por todos los niveles hasta PANIC.", start: 640, duration: 90, response: 18, keys: [[0, 1.4, 0.6], [12, 2, 0.15], [90, 2, 0.15]] },
    recovery: { name: "Recuperación", description: "Parte de una alarma crítica y vuelve a la normalidad bajando de nivel en nivel.", start: 860, duration: 150, response: 45, keys: [[0, 0.9, 1.3], [90, 0.95, 1.15], [150, 1, 1]] },
  },

  /* ------------------------------------------------------------ PANTALLAS */

  /*
   * Superficies HTML. quad = esquinas del cristal [arriba-izq, arriba-der,
   * abajo-der, abajo-izq] en px de escena; width/height = resolución lógica.
   */
  screens: {
    central:      { label: "Pantalla central",         kind: "core",     width: 856, height: 480, quad: [[476, 173], [902, 173], [902, 412], [476, 412]] },
    topLeft:      { label: "Panel superior izquierdo", kind: "status",   width: 380, height: 138, quad: [[473, 52], [661, 52], [661, 121], [473, 121]] },
    topRight:     { label: "Panel superior derecho",   kind: "advisory", width: 392, height: 138, quad: [[703, 52], [899, 52], [899, 121], [703, 121]] },
    monitorRight: { label: "Monitor superior derecho", kind: "soon",     width: 392, height: 272, quad: [[1060, 72], [1251, 37], [1267, 176], [1075, 196]] },
    auxL:  { label: "Aux pupitre izq.",  kind: "auxWave", width: 48, height: 86,  quad: [[201, 463], [224, 461], [240, 499], [221, 504]] },
    auxR:  { label: "Aux pupitre der.",  kind: "auxBars", width: 48, height: 88,  quad: [[1150, 461], [1172, 462], [1155, 504], [1134, 501]] },
    auxFL: { label: "Aux esquina izq.",  kind: "auxText", width: 84, height: 170, quad: [[2, 479], [45, 474], [78, 557], [4, 578]] },
    auxFR: { label: "Aux esquina der.",  kind: "auxMeme", width: 84, height: 150, quad: [[1341, 492], [1374, 496], [1356, 554], [1321, 545]] },
  },

  /*
   * Valores no textuales de las pantallas (unidades y escalas). Los textos de
   * las pantallas (STARTING SOON, títulos, etiquetas, niveles) están en
   * memes.texts[idioma] (etapa 15: cinco idiomas).
   */
  content: {
    core: {
      temp: { unit: "°C", max: 900 },
      readouts: [
        { key: "pressure", unit: "BAR", decimals: 1, max: 20 },
        { key: "coolant",  unit: "%",   decimals: 0, max: 100 },
        { key: "rods",     unit: "%",   decimals: 0, max: 100 },
        { key: "output",   unit: "MW",  decimals: 0, max: 1500 },
      ],
    },
  },

  /*
   * Ritmo de los mensajes. interval y logEvery en segundos de simulación.
   * Con humor activo, 1 de cada jokeEvery avisos es un chiste, pero sólo en
   * nivel normal: en aviso o alarma salen los mensajes de `alerts`.
   */
  messages: {
    humor: true,
    interval: 7,
    jokeEvery: 4,
    logEvery: 5.3,
    // listas de mensajes por idioma: memes.texts[idioma].msg*
  },

  /* Tratamiento CRT y tipografía de las pantallas. */
  crt: {
    phosphor: "#ffb654",
    ok: "#9ce676",
    warn: "#ff5c3a",
    brightness: 1,
    glow: 1,
    scanlines: 0.26,
    scanSpacing: 4,
    roll: 0.05,
    rollPeriod: 9,
    flicker: 0.045,
    cursor: true,
    cursorBlink: 1.1,
    typeSpeed: 38,
  },

  /* --------------------------------------------------------------- LUCES */

  /*
   * Luces sobre botones/LEDs que ya existen en el fondo (px de escena).
   * mode: steady | pulse | blink | flicker · react: none (decorativa) |
   * alarm (avisa en NOTICE/ALARMED/PANIC) | status (verde→ámbar→rojo).
   * En nivel normal todas mantienen su comportamiento decorativo.
   */
  lights: {
    intensity: 1.6,
    halo: 1.65,
    reflection: 1.05,
    colors: { amber: "#ffb24c", orange: "#ff802c", red: "#ff3e26", green: "#96e870" },
    groups: {
      A: { label: "Panel izquierdo", enabled: true, intensity: 1 },
      B: { label: "Panel derecho", enabled: true, intensity: 1 },
      C: { label: "Esquina izquierda", enabled: true, intensity: 1 },
      D: { label: "Esquina derecha", enabled: true, intensity: 1 },
      E: { label: "Consola central", enabled: true, intensity: 1 },
    },
    items: [
      { id: "a-lamp-1", group: "A", enabled: true, x: 331, y: 309, w: 13, h: 13, shape: "round", color: "orange", mode: "pulse",   period: 5.2, delay: 0,    level: 1.5,  halo: 2.2, refl: 1, boost: true,  react: "none" },
      { id: "a-lamp-2", group: "A", enabled: true, x: 393, y: 312, w: 13, h: 13, shape: "round", color: "red",    mode: "pulse",   period: 3.4, delay: -1.1, level: 0.9,  halo: 2.2, refl: 1, boost: true,  react: "alarm" },
      { id: "a-11", group: "A", enabled: true, x: 318, y: 345, w: 9, h: 9, shape: "rect", color: "red",    mode: "steady",  period: 3,   delay: 0,    level: 0.7,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "a-12", group: "A", enabled: true, x: 340, y: 345, w: 9, h: 9, shape: "rect", color: "red",    mode: "flicker", period: 2.3, delay: -0.4, level: 0.8,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "a-13", group: "A", enabled: true, x: 361, y: 345, w: 9, h: 9, shape: "rect", color: "red",    mode: "steady",  period: 3,   delay: 0,    level: 0.45, halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "a-14", group: "A", enabled: true, x: 383, y: 345, w: 9, h: 9, shape: "rect", color: "orange", mode: "pulse",   period: 6.0, delay: -2.0, level: 0.8,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "a-15", group: "A", enabled: true, x: 404, y: 345, w: 9, h: 9, shape: "rect", color: "amber",  mode: "steady",  period: 3,   delay: 0,    level: 0.8,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "a-22", group: "A", enabled: true, x: 340, y: 369, w: 9, h: 9, shape: "rect", color: "amber",  mode: "steady",  period: 3,   delay: 0,    level: 0.75, halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "a-23", group: "A", enabled: true, x: 361, y: 369, w: 9, h: 9, shape: "rect", color: "amber",  mode: "flicker", period: 3.1, delay: -1.2, level: 0.8,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "a-24", group: "A", enabled: true, x: 383, y: 369, w: 9, h: 9, shape: "rect", color: "green",  mode: "steady",  period: 3,   delay: 0,    level: 0.6,  halo: 2.2, refl: 1, boost: false, react: "status" },
      { id: "a-31", group: "A", enabled: true, x: 318, y: 392, w: 9, h: 9, shape: "rect", color: "red",    mode: "blink",   period: 2.8, delay: -0.6, level: 0.85, halo: 2.2, refl: 1, boost: false, react: "alarm" },
      { id: "a-32", group: "A", enabled: true, x: 340, y: 392, w: 9, h: 9, shape: "rect", color: "amber",  mode: "pulse",   period: 7.5, delay: -3.0, level: 0.7,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "b-lamp-1", group: "B", enabled: true, x: 983,  y: 352, w: 12, h: 14, shape: "round", color: "orange", mode: "steady", period: 3,   delay: 0,    level: 0.8,  halo: 2.2, refl: 1, boost: true,  react: "none" },
      { id: "b-lamp-2", group: "B", enabled: true, x: 1046, y: 352, w: 12, h: 14, shape: "round", color: "red",    mode: "blink",  period: 3.6, delay: -1.0, level: 0.9,  halo: 2.2, refl: 1, boost: true,  react: "alarm" },
      { id: "b-win-1",  group: "B", enabled: true, x: 983,  y: 318, w: 30, h: 7,  shape: "rect",  color: "green",  mode: "steady", period: 3,   delay: 0,    level: 0.5,  halo: 2.2, refl: 1, boost: false, react: "status" },
      { id: "b-win-2",  group: "B", enabled: true, x: 1045, y: 318, w: 30, h: 7,  shape: "rect",  color: "amber",  mode: "pulse",  period: 4.4, delay: -0.8, level: 0.65, halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "c-display", group: "C", enabled: true, x: 37, y: 316, w: 44, h: 20, shape: "rect", color: "red",   mode: "pulse",   period: 6.0, delay: -2.5, level: 0.45, halo: 1.5, refl: 1, boost: true,  react: "none" },
      { id: "c-led-1",   group: "C", enabled: true, x: 82, y: 312, w: 7,  h: 7,  shape: "rect", color: "amber", mode: "steady",  period: 3,   delay: 0,    level: 0.75, halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "c-led-2",   group: "C", enabled: true, x: 82, y: 323, w: 7,  h: 7,  shape: "rect", color: "green", mode: "steady",  period: 3,   delay: 0,    level: 0.6,  halo: 2.2, refl: 1, boost: false, react: "status" },
      { id: "c-led-3",   group: "C", enabled: true, x: 100, y: 323, w: 12, h: 7, shape: "rect", color: "red",   mode: "flicker", period: 4.2, delay: -2.0, level: 0.6,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "d-1", group: "D", enabled: true, x: 1271, y: 333, w: 10, h: 7, shape: "rect", color: "orange", mode: "flicker", period: 2.7, delay: -0.8, level: 0.75, halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "d-2", group: "D", enabled: true, x: 1288, y: 333, w: 10, h: 7, shape: "rect", color: "green",  mode: "steady",  period: 3,   delay: 0,    level: 0.5,  halo: 2.2, refl: 1, boost: false, react: "status" },
      { id: "d-3", group: "D", enabled: true, x: 1305, y: 333, w: 10, h: 7, shape: "rect", color: "red",    mode: "pulse",   period: 5.5, delay: -1.5, level: 0.8,  halo: 2.2, refl: 1, boost: false, react: "alarm" },
      { id: "e-1", group: "E", enabled: true, x: 826, y: 456, w: 7, h: 6, shape: "rect", color: "amber", mode: "flicker", period: 1.9, delay: 0,    level: 0.7,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "e-2", group: "E", enabled: true, x: 836, y: 456, w: 7, h: 6, shape: "rect", color: "amber", mode: "flicker", period: 2.6, delay: -0.7, level: 0.7,  halo: 2.2, refl: 1, boost: false, react: "none" },
      { id: "e-3", group: "E", enabled: true, x: 857, y: 456, w: 7, h: 7, shape: "rect", color: "green", mode: "steady",  period: 3,   delay: 0,    level: 0.6,  halo: 2.2, refl: 1, boost: false, react: "status" },
      { id: "e-4", group: "E", enabled: true, x: 857, y: 477, w: 7, h: 7, shape: "rect", color: "red",   mode: "pulse",   period: 4.0, delay: -1.8, level: 0.75, halo: 2.2, refl: 1, boost: false, react: "alarm" },
    ],
    /* Matriz de LEDs del panel derecho. minMs/maxMs = espera entre cambios. */
    matrix: {
      enabled: true,
      cols: [1164.3, 1174.3, 1184.3, 1194.5, 1204.5, 1214.8],
      rows: [[289, 286.5], [298.3, 295.8], [307.8, 305], [317.3, 315], [327.3, 325.3], [337.3, 335.8], [347.5, 346.5], [358.5, 357.5]],
      cell: 7, color: "amber", accent: "red", accentChance: 0.08,
      lit: 7, minMs: 700, maxMs: 1700, reactive: true,
    },
    /* Barra de LEDs: barrido lento en la fila central + fijas dispersas. */
    bar: {
      enabled: true,
      cols: [1107, 1116, 1125.5, 1135, 1145, 1155, 1164.5, 1175, 1185, 1195, 1205, 1216],
      rows: [385.5, 394.5, 404],
      cell: 7, color: "amber", scanRow: 1, scanPeriod: 4.8, sparse: 3,
    },
  },

  /* ------------------------------------------------------------ AMBIENTE */

  ambient: {
    ceiling: {
      intensity: 1,
      breathe: 0.2,  // cuánto baja la luz en la respiración (0 = fija)
      lamps: [
        { x: 278, y: 0, w: 134, h: 19, period: 8.0, delay: 0, dip: false },
        { x: 958, y: 0, w: 136, h: 19, period: 9.5, delay: -3.0, dip: true },
      ],
    },
    spill: {
      intensity: 1,
      items: [
        { id: "central", x: 689, y: 446, rx: 240, ry: 26, color: "#ffaa50", opacity: 0.16 },
        { id: "monitor", x: 1166, y: 222, rx: 96, ry: 16, color: "#ffaa50", opacity: 0.12 },
      ],
    },
  },

  /* Animaciones decorativas (independientes de pausar la simulación). */
  motion: { decor: true },

  /*
   * «Demostración en vivo» (etapa 11): ajustes de la prueba narrativa. Las
   * duraciones son segundos de simulación (la velocidad las acelera). La
   * demostración corre en una sesión temporal: no guarda sus valores de prueba.
   *   calm/coffee/notice/alarmed: duración de cada etapa (las pausas se acortan)
   *   recovery: s para enfriarse hasta la normal al «Finalizar crisis»
   *   speed: velocidad · alarmGlow: rojo tenue en ALARM durante la demo
   *   subscriber: nombre del suscriptor simulado
   */
  demo: { calm: 6, coffee: 9, notice: 10, alarmed: 7, recovery: 12, speed: 1, alarmGlow: 0.3, subscriber: "" },

  /*
   * Vida ambiental (etapa 13): efectos ligados a lo que ocurre.
   *   steam:  vapor del café (sólo con la pose COFFEE). strands: 2–3 hebras.
   *   leak:   escape de vapor en una junta del fondo (x, y en px de escena; angle
   *           en grados: −90 = hacia arriba). burst: duración de cada escape (s);
   *           every: segundos entre escapes en ALARM (en CRITICAL, más seguidos);
   *           critical: multiplicador en CRITICAL; precursor: señal mínima antes de NOTICE.
   *   relays: secuencias de luces (calor, CRITICAL, refrigerante, estabilización).
   *           step: ms entre luces.
   *   preset: sutil · normal · cinematico · custom (sólo informativo).
   */
  life: {
    enabled: true, preset: "normal",
    steam: { enabled: true, intensity: 1, strands: 3 },
    leak: { enabled: true, x: 338, y: 133, angle: -104, intensity: 1, burst: 1.6, every: 6.5, critical: 1.5, precursor: true },
    relays: { enabled: true, intensity: 1, step: 110 },
    // chispas de avería en dos aparatos del fondo (rate: × frecuencia)
    sparks: { enabled: true, intensity: 1, rate: 1 },
  },
  /*
   * Luz de emergencia tipo submarino durante CRITICAL (etapa 10). Capas y
   * mezclas no destructivas: el fondo y los PNG no se tocan.
   *   color:   luz roja profunda.
   *   source:  lámpara de alarma de la sala que hace de fuente (px de escena;
   *            por defecto la lámpara roja «a-lamp-2» del panel izquierdo) y
   *            radius = alcance de la luz (caída suave hasta ahí).
   *   ambient: intensidad del derrame rojo sobre la sala · duck: sobre pato+silla.
   *   darken:  cuánto baja la luz cálida ambiental (0–0.8).
   *   pulse:   periodo (s) y profundidad (0–0.6: nunca se apaga; 0 = fija).
   *   enterMs / exitMs: transición al entrar en CRITICAL y al recuperarse.
   *   still:   intensidad fija con movimiento reducido o animaciones apagadas.
   * Sigue el nivel CRITICAL REAL del simulador (no la duración de un gag).
   */
  emergency: {
    enabled: true,
    color: "#ff2414",
    source: { x: 393, y: 312, radius: 640 },
    ambient: 0.85,
    duck: 0.7,
    darken: 0.42,
    pulse: { period: 2.8, depth: 0.35 },
    enterMs: 600,
    exitMs: 900,
    still: 0.75,
    alarm: 0,   // anticipo rojo tenue y fijo en ALARM (0–0.6; 0 = sólo en CRITICAL)
  },

  /*
   * Vista de la escena.
   * show: temperatura y estado en grande, gráfico pequeño y una franja de
   *       mensajes grandes para el humor. El resto de lecturas no se ve.
   * technical: la pantalla central completa (presión, refrigerante, barras,
   *       potencia, log...). El simulador es el mismo en los dos modos.
   */
  display: { mode: "show" },

  /* ---------------------------------------------------- EVENTOS DEL STREAM */

  /*
   * «Nuevo suscriptor = rescate con café». Todos los orígenes (botón de
   * prueba o una integración real futura) entran por la misma función:
   * duckReactor.stream.subscriber({ name, id }).
   *   drop:        °C que baja la temperatura REAL del simulador por cada suscripción.
   *   coolSeconds: en cuántos s de simulación se reparte el descenso (en pausa: de golpe).
   *   phrase:      s reales que se queda el agradecimiento antes de seguir.
   *   coffee:      s reales de pausa para el café (sólo con el reactor en nivel normal).
   *   waitMax:     s reales máximos esperando a que el reactor quede seguro; si no
   *                llega, termina sin café.
   *   coffeeOverManual: permitir el café con la pose bloqueada a mano.
   */
  stream: {
    subscriber: { enabled: true, testName: "", drop: 200, coolSeconds: 6, phrase: 3.5, coffee: 6, waitMax: 25, coffeeOverManual: false },
  },

  /*
   * «Chat al mando» (etapa 9): el público provoca y resuelve la crisis.
   * Todos los eventos entran por UNA función:
   *   duckReactor.stream.event({ type: "heat" | "coolant" | "subscriber", name, id, source })
   * (stream.subscriber(...) es un atajo de type "subscriber").
   *
   * heat («No tocar»): sube la temperatura REAL.
   *   amount: °C por evento · ramp: s de simulación en que entra (en pausa: de golpe)
   *   max: tope de calor acumulado del chat (°C sobre lo normal)
   *   cooldown: s reales entre dos eventos del MISMO participante
   *   gap: s reales mínimos entre dos eventos de este tipo de cualquiera
   *   phrase: s reales del cartel en la pantalla central
   * coolant («Mandar refrigerante»): baja la temperatura REAL (menos que una suscripción).
   *   amount, seconds (reparto), cooldown, gap, phrase como arriba.
   *   group: s reales en los que eventos seguidos se agrupan en el mismo cartel.
   * recovery: el calor del chat se disipa solo (vida media en s de simulación).
   *   emergency: si CRITICAL dura `after` s de simulación, «INTERVENCIÓN DEL
   *   BECARIO»: enfría poco a poco (`rate` °C/s de simulación) hasta salir de la
   *   crisis. No actúa en los escenarios (son guiones) ni rebaja un valor manual.
   * coffeeAfterCrisis: al volver a nivel normal después de una crisis, café.
   */
  chat: {
    enabled: true,
    heat:    { enabled: true, amount: 240, ramp: 3, max: 380, cooldown: 8, gap: 1.5, phrase: 3.5 },
    coolant: { enabled: true, amount: 70, seconds: 4, cooldown: 5, gap: 0, group: 3, phrase: 3 },
    // selfResolve: la crisis se resuelve sola (disipación natural y becario). Apagado: sigue hasta que el chat o una sub la resuelvan
    recovery: { selfResolve: false, halfLife: 90, emergency: true, after: 45, rate: 6, phrase: 4.5 },
    // ciclo automático: tras `calm` s de calma el reactor se calienta solo y llega a CRITICAL en `rise` s (se repite)
    auto: { enabled: false, calm: 120, rise: 30 },
    // etapa 22 · «enfriar sale caro»: durante CRITICAL un solo !cool no basta. Hacen falta `cools` !cool
    // de personas distintas (una vez cada una) o `follows` follows nuevos (0 = los follows no cuentan).
    // Una sub o un evento de pago (bits, propinas) enfría de golpe, como siempre.
    lock: { enabled: true, cools: 5, follows: 3 },
    coffeeAfterCrisis: true,
  },

  /*
   * Audio (etapa 16). Desactivado en la primera instalación: se activa desde el
   * laboratorio (pestaña Audio). Volúmenes 0–1 por bus; vol de cada sonido 0–1,5
   * sobre su nivel calibrado. ambient: reactor | lab (nunca los dos).
   */
  audio: {
    enabled: true, master: 0.6, ambience: 1, alarms: 0.75, effects: 0.5, ambient: "reactor",
    sounds: {
      ambience_reactor: { on: true, vol: 1 }, ambience_lab: { on: true, vol: 1 },
      caution: { on: true, vol: 1 }, critical: { on: true, vol: 1.2 },
      relay: { on: true, vol: 1 }, leak: { on: true, vol: 1.2 }, coolant: { on: true, vol: 1.05 }, subscribe: { on: true, vol: 1.3 },
      popup: { on: true, vol: 1 }, button: { on: true, vol: 1 }, error: { on: true, vol: 1 }, glitch: { on: true, vol: 1 },
      coffee: { on: true, vol: 1 }, stabilize: { on: false, vol: 1 },
    },
  },

  /* ------------------------------------------------------------- MEMES */

  /*
   * Gags: pequeñas escenas con preparación, reacción y remate. Un solo gag
   * activo a la vez; las alarmas reales tienen prioridad.
   *   thisIsFine: al entrar en CRITICAL (panel de avisos).
   *   coffee:     en funcionamiento normal (franja central + pose COFFEE).
   *   update:     durante ALARM o CRITICAL (ventana en la pantalla central).
   *   button:     al pulsar el botón rojo de la consola derecha.
   *   recovery:   al salir de CRITICAL.
   * Gags visuales (etapa 6): toman la pantalla central con una composición
   * grande y dejan temperatura y estado reales en una franja superior.
   *   fuel:       «el café es el combustible» (nivel normal).
   *   denial:     «negación corporativa» (al entrar en CRITICAL).
   *   supervisor: «viene el supervisor» (nivel normal).
   *   steps: duración de cada etapa en segundos.
   * interval: segundos de simulación entre gags automáticos (coffee, update),
   *   contados desde que termina el anterior. chance: probabilidad (0–1) de
   *   que el gag salga cuando le toca.
   * timing (s): setup = primera frase · pause = pausa entre frases ·
   *   punch = cuánto se queda el remate.
   * poses: los gags pueden cambiar la pose un momento (en modo Automático).
   * posesOverManual: también si la pose está bloqueada a mano.
   * Relojes: las pruebas del laboratorio y el botón usan tiempo real; los
   *   disparos automáticos usan el reloj de simulación (se congelan en pausa).
   */
  memes: {
    enabled: true,
    lang: "en",   // idioma del widget y del laboratorio: en · es · pt-PT · de · fr
    interval: { min: 45, max: 90 },
    timing: { setup: 2.6, pause: 1.4, punch: 4.5 },
    poses: true,
    posesOverManual: false,
    gags: {
      thisIsFine: { enabled: false, chance: 1 },  // etapa 14: fuera del preset de humor seco (opción secundaria)
      coffee:     { enabled: false, chance: 0.8 },
      update:     { enabled: false, chance: 0.7, stall: 3 },
      button:     { enabled: false, pose: "ALARMED", escalate: false },
      recovery:   { enabled: false, chance: 1 },
      fuel:       { enabled: true, chance: 1, steps: { search: 2.2, pause: 1.0, detect: 1.6, fill: 2.0, punch: 3.0 } },
      denial:     { enabled: true, chance: 1, steps: { calm: 1.8, invade: 1.4, loud: 1.4, cover: 1.6, punch: 3.0 } },
      supervisor: { enabled: true, chance: 1, steps: { connect: 1.6, slide: 3.2, disconnect: 1.4, punch: 3.0 } },
    },
    /* Botón rojo (seta) pintado en la consola derecha, px de escena. */
    button: { x: 1347, y: 617, w: 30, h: 22 },
    texts: {
      en: {
        fine: "THIS IS FINE", correction: "CORRECTION:", notFine: "THIS IS NOT FINE",
        coffeeTag: "OPERATOR MEMO", coolantLow: "COOLANT LOW", coffeeNo: "COFFEE DOES NOT COUNT",
        updTitle: "SYSTEM UPDATE", updInstalling: "INSTALLING UPDATE…", updSub: "DO NOT TURN OFF THE REACTOR", updFailed: "UPDATE FAILED SUCCESSFULLY",
        btnTag: "RED BUTTON", doNotPress: "DO NOT PRESS", whyPress: "WHY WOULD YOU DO THAT",
        recTag: "INCIDENT LOG", resolved: "INCIDENT RESOLVED", deleted: "INCIDENT REPORT: DELETED",
        daysLabel: "DAYS WITHOUT INCIDENT", daysValue: "0",
        fuelSearch: "SEARCHING FOR POWER SOURCE", fuelCore: "CORE", fuelTank: "TANK", fuelLow: "NEARLY EMPTY",
        fuelFound: "SOURCE FOUND: MUG", fuelFilling: "REFUELING", fuelPunch: "RENEWABLE ENERGY: ANOTHER COFFEE",
        denialTitle: "calm.exe", denialFine: "All good", denialFineLoud: "ALL GOOD", denialGraph: "CORE TEMPERATURE",
        denialApproved: "APPROVED", denialCard: "Risk: acceptable", denialSign: "Signed: Management", denialPunch: "This meeting could have been an email. 📧",
        supOn: "SUPERVISOR CONNECTED", supOnline: "ONLINE", supOffline: "OFFLINE", supTitle: "SHIFT REPORT",
        supCheck1: "SAFETY", supCheck2: "PRODUCTIVITY", supCheck3: "ATTITUDE", supCurve: "PERFORMANCE",
        supStamp: "EMPLOYEE OF THE MONTH", supFooter: "SLIDESHOW · ILLUSTRATIVE DATA", supOff: "SUPERVISOR DISCONNECTED",
        supPunch: "BACK TO DOING NOTHING",
        subTag: "NEW SUBSCRIBER", subOne: "{name} RENEWED THIS DUCK'S CONTRACT", subMany: "{name} AND {n} MORE RENEWED THIS DUCK'S CONTRACT",
        subAnon: "AN ANONYMOUS HERO", subCooling: "COOLING THE CORE", subWait: "STILL CRITICAL: COFFEE POSTPONED",
        subPunch: "CRISIS CANCELLED. COFFEE AUTHORIZED", subPunchCalm: "COOLANT TO SPARE. COFFEE BREAK.",
        subTagMany: "NEW SUBSCRIBERS", subAnd: "AND", subMore: "{n} MORE", subAnonMany: "{n} ANONYMOUS HEROES",
        popNoResp: "(NOT RESPONDING)", popNoClose: "CAN'T CLOSE: BUSY PANICKING", popCloser: "closer.exe", popClosing: "CLOSING '{win}'…",
        gsTitle: "support@reactor · ticket #4471", gsProblem: "CRITICAL TEMPERATURE", gsCore: "CORE:", gsSent: "Cooling request submitted",
        gsReply: "Estimated response: 3–5 business days", gaTitle: "assistant.exe", gaStart: "Emergency assistant started",
        gaQuestion: "Have you tried restarting the reactor?", gaBtn1: "Not now", gaBtn2: "Not now either", gaRestart: "Perfect. Restarting.", gaDenied: "Permission denied.", gaLucky: "Luckily.",
        gcIncTitle: "INCIDENT MONITOR", gcIncident: "INCIDENT DETECTED", gcProto: "Emergency protocol: ready to start", gcSurveyTitle: "survey.exe",
        gcAsk: "Before continuing, rate your experience", gcThanks: "Thank you. Your feedback is important to us.",
        recShort: "RECOVERY", recLabel: "RECOVERY IN PROGRESS", recActive: "CRITICAL ACTIVE", recSafeIn: "SAFE IN {s} S", recPending: "SAFE STATE PENDING",
        recAdvisory: "COOLING CONFIRMED · AWAITING STABILITY", subRecovering: "RECOVERY IN PROGRESS · SAFE IN {s} S", subRecoveringWait: "RECOVERY IN PROGRESS · SAFE STATE PENDING",
        leakTag: "STEAM LEAK", leakWhere: "JOINT L-2", leakCold: "COOLANT AT L-2",
        chatAnon: "SOMEONE IN CHAT",
        heatTag: "DO NOT TOUCH", heatOne: "{name} SAYS THEY KNOW WHAT THEY ARE DOING", heatMany: "{name} AND {n} MORE SAY THEY KNOW WHAT THEY ARE DOING",
        lockCool: "COOLANT {n}/{t}", lockFollow: "FOLLOWS {n}/{t}", lockPaid: "1 SUB = INSTANT FIX", followOne: "{name} FOLLOWED · VALVE +1",
        coolTag: "COOLANT", coolOne: "{name} SENT COOLANT", coolMany: "{name} AND {n} MORE SENT COOLANT", coolHelp: "+{n} COOLANT FROM CHAT",
        becTag: "EMERGENCY", becMain: "INTERN INTERVENTION", becSub: "MANUAL COOLING IN PROGRESS",
        /* Pantallas (etapa 15). {n} = número · {t} = temperatura · {level} = nivel */
        scrSoonHeader: "BROADCAST.EXE", scrSoonBadge: "STANDBY", scrSoonLines: ["STARTING", "SOON"], scrSoonFooter: "PLEASE STAND BY",
        scrCoreTitle: "REACTOR 03 // CORE MONITOR", scrShift: "SHIFT B", scrReactorLabel: "REACTOR", scrTempLabel: "CORE TEMP",
        scrRoPressure: "PRESSURE", scrRoCoolant: "COOLANT", scrRoRods: "ROD DEPTH", scrRoOutput: "OUTPUT",
        lvNORMAL: "NOMINAL", lvNOTICE: "CAUTION", lvALARMED: "ALARM", lvPANIC: "CRITICAL",
        scrStatusLabel: "CORE STATUS", scrLoadLabel: "LOAD", scrAdvisoryLabel: "ADVISORY", scrAuxRows: ["SYS", "OK", "LOOP", "B-2"],
        scrAuxMemes: ["404/BRAIN/NOT/FOUND", "TRUST/ME/BRO", "SKILL/ISSUE", "QUACK/.EXE", "BUG?/NO,/FEATURE", "WORKS/ON MY/MACHINE", "RAM:/2 KB/ENOUGH", "SEND/COFFEE", ">(.)__/ (___/", "(o_O)", "CTRL+Z/PLS", "TURN IT/OFF AND/ON", "LOADING/▒▒▒▒/99%", "IT'S/FINE", "NOT MY/SHIFT", "PRESS/ANY/KEY", "BRB/LUNCH", "WIFI:/1 BAR", "MOM/I'M ON/TV", "DUCK/LVL 99"],
        scrAuxPanic: ["PANIK", "AAAAA/AAAAA", "THIS/IS/FINE", "PRESS/F", "HELP", "RUN", "(>_<)", "ERROR/ERROR/ERROR", "NOT/AGAIN", "WHO/TOUCHED/IT?", "x_x", "CALL/MOM"],
        scrTrend: "/ 5 S", scrGraph: "TEMP / 60 S", scrAxisPast: "-60 S", scrAxisNow: "NOW", scrAux: "AUX", scrPumps: "PUMPS", scrLimit: "LIMIT {n}",
        logCleared: "ALARM CLEARED ... {t}", logLevel: "{level} LEVEL ..... {t}",
        msgAdvisories: ["CORE TEMP WITHIN LIMITS", "PRESSURE STABLE", "COOLANT LOOP B: NOMINAL", "NEXT INSPECTION: 14:00", "ROD BANK C: HOLDING", "VENT CYCLE COMPLETE"],
        msgJokes: ["OPERATOR: UNDERCAFFEINATED", "COOLANT STATUS: PROBABLY FINE", "SAFETY MANUAL: MISPLACED", "MORALE: WITHIN TOLERANCE", "DAYS WITHOUT INCIDENT: 0"],
        msgAlertsNOTICE: ["CORE TEMP ABOVE NOMINAL", "MONITORING THERMAL DRIFT", "CHECK COOLANT FLOW"],
        msgAlertsALARMED: ["ALARM: CORE TEMP HIGH", "INCREASE COOLANT FLOW", "THERMAL LIMIT EXCEEDED"],
        msgAlertsPANIC: ["CRITICAL: CORE OVERHEAT", "SCRAM RECOMMENDED", "ALL HANDS TO CONSOLE"],
        msgRecovered: "CONDITIONS NORMALIZED",
        msgLog: ["PUMP 2 CHECK ........ OK", "LOOP B FLOW ......... OK", "ROD BANK C .......... HOLD", "VENT CYCLE .......... DONE", "SENSOR SWEEP ........ OK"],
        demoSponsor: "SPONSOR",
      },
      es: {
        fine: "ESTO ESTÁ BIEN", correction: "CORRECCIÓN:", notFine: "ESTO NO ESTÁ BIEN",
        coffeeTag: "NOTA DEL OPERADOR", coolantLow: "REFRIGERANTE BAJO", coffeeNo: "EL CAFÉ NO CUENTA",
        updTitle: "ACTUALIZACIÓN", updInstalling: "INSTALANDO ACTUALIZACIÓN…", updSub: "NO APAGUE EL REACTOR", updFailed: "LA ACTUALIZACIÓN FALLÓ CON ÉXITO",
        btnTag: "BOTÓN ROJO", doNotPress: "NO PULSAR", whyPress: "¿POR QUÉ HARÍAS ESO?",
        recTag: "REGISTRO DE INCIDENTES", resolved: "INCIDENTE RESUELTO", deleted: "INFORME DEL INCIDENTE: ELIMINADO",
        daysLabel: "DÍAS SIN INCIDENTES", daysValue: "0",
        fuelSearch: "BUSCANDO FUENTE DE ENERGÍA", fuelCore: "NÚCLEO", fuelTank: "DEPÓSITO", fuelLow: "CASI VACÍO",
        fuelFound: "FUENTE DETECTADA: TAZA", fuelFilling: "REPOSTANDO", fuelPunch: "ENERGÍA RENOVABLE: OTRO CAFÉ",
        denialTitle: "tranquilidad.exe", denialFine: "Todo bien", denialFineLoud: "TODO BIEN", denialGraph: "TEMPERATURA DEL NÚCLEO",
        denialApproved: "APROBADO", denialCard: "Riesgo: aceptable", denialSign: "Firmado: Dirección", denialPunch: "Esta reunión podría haber sido un email. 📧",
        supOn: "SUPERVISOR CONECTADO", supOnline: "EN LÍNEA", supOffline: "DESCONECTADO", supTitle: "INFORME DE TURNO",
        supCheck1: "SEGURIDAD", supCheck2: "PRODUCTIVIDAD", supCheck3: "ACTITUD", supCurve: "RENDIMIENTO",
        supStamp: "EMPLEADO DEL MES", supFooter: "PRESENTACIÓN · DATOS ILUSTRATIVOS", supOff: "SUPERVISOR DESCONECTADO",
        supPunch: "VOLVIENDO A NO HACER NADA",
        subTag: "NUEVO SUSCRIPTOR", subOne: "{name} HA RENOVADO EL CONTRATO DE ESTE PATO", subMany: "{name} Y {n} MÁS HAN RENOVADO EL CONTRATO DE ESTE PATO",
        subAnon: "UN HÉROE ANÓNIMO", subCooling: "ENFRIANDO EL NÚCLEO", subWait: "SIGUE CRÍTICO: CAFÉ APLAZADO",
        subPunch: "CRISIS CANCELADA. CAFÉ AUTORIZADO", subPunchCalm: "REFRIGERANTE DE SOBRA. PAUSA PARA CAFÉ.",
        subTagMany: "NUEVOS SUSCRIPTORES", subAnd: "Y", subMore: "{n} MÁS", subAnonMany: "{n} HÉROES ANÓNIMOS",
        popNoResp: "(NO RESPONDE)", popNoClose: "NO SE PUEDE CERRAR: ESTÁ OCUPADA", popCloser: "cerrar.exe", popClosing: "CERRANDO «{win}»…",
        gsTitle: "soporte@reactor · ticket #4471", gsProblem: "TEMPERATURA CRÍTICA", gsCore: "NÚCLEO:", gsSent: "Solicitud de enfriamiento enviada",
        gsReply: "Respuesta estimada: 3–5 días hábiles", gaTitle: "asistente.exe", gaStart: "Asistente de emergencia iniciado",
        gaQuestion: "¿Has probado a reiniciar el reactor?", gaBtn1: "Ahora no", gaBtn2: "Ahora tampoco", gaRestart: "Perfecto. Reiniciando.", gaDenied: "Permiso denegado.", gaLucky: "Por suerte.",
        gcIncTitle: "MONITOR DE INCIDENTES", gcIncident: "INCIDENTE DETECTADO", gcProto: "Protocolo de emergencia: listo para iniciar", gcSurveyTitle: "encuesta.exe",
        gcAsk: "Antes de continuar, valora tu experiencia", gcThanks: "Gracias. Tu opinión es importante para nosotros.",
        recShort: "RECUPERACIÓN", recLabel: "RECUPERACIÓN EN CURSO", recActive: "CRÍTICO ACTIVO", recSafeIn: "SEGURO EN {s} S", recPending: "ESTADO SEGURO PENDIENTE",
        recAdvisory: "ENFRIAMIENTO CONFIRMADO · ESPERANDO ESTABILIDAD", subRecovering: "RECUPERACIÓN EN CURSO · SEGURO EN {s} S", subRecoveringWait: "RECUPERACIÓN EN CURSO · SEGURO PENDIENTE",
        leakTag: "FUGA DE VAPOR", leakWhere: "JUNTA L-2", leakCold: "REFRIGERANTE EN L-2",
        chatAnon: "ALGUIEN DEL CHAT",
        heatTag: "NO TOCAR", heatOne: "{name} ASEGURA QUE SABE LO QUE HACE", heatMany: "{name} Y {n} MÁS ASEGURAN QUE SABEN LO QUE HACEN",
        lockCool: "REFRIGERANTE {n}/{t}", lockFollow: "FOLLOWS {n}/{t}", lockPaid: "1 SUB = ARREGLO AL INSTANTE", followOne: "{name} SIGUE EL CANAL · VÁLVULA +1",
        coolTag: "REFRIGERANTE", coolOne: "{name} MANDA REFRIGERANTE", coolMany: "{name} Y {n} MÁS MANDAN REFRIGERANTE", coolHelp: "+{n} DE REFRIGERANTE DEL CHAT",
        becTag: "EMERGENCIA", becMain: "INTERVENCIÓN DEL BECARIO", becSub: "REFRIGERACIÓN MANUAL EN CURSO",
        scrSoonHeader: "EMISIÓN.EXE", scrSoonBadge: "EN ESPERA", scrSoonLines: ["EMPEZAMOS", "EN BREVE"], scrSoonFooter: "NO SE RETIREN",
        scrCoreTitle: "REACTOR 03 // MONITOR DEL NÚCLEO", scrShift: "TURNO B", scrReactorLabel: "REACTOR", scrTempLabel: "TEMP. NÚCLEO",
        scrRoPressure: "PRESIÓN", scrRoCoolant: "REFRIGERANTE", scrRoRods: "PROF. BARRAS", scrRoOutput: "POTENCIA",
        lvNORMAL: "NOMINAL", lvNOTICE: "PRECAUCIÓN", lvALARMED: "ALARMA", lvPANIC: "CRÍTICO",
        scrStatusLabel: "ESTADO DEL NÚCLEO", scrLoadLabel: "CARGA", scrAdvisoryLabel: "AVISOS", scrAuxRows: ["SIS", "OK", "LAZO", "B-2"],
        scrAuxMemes: ["ERROR/404/CEREBRO", "CONFÍA/BRO", "SKILL/ISSUE", "CUAC/.EXE", "¿BUG?/NO,/FEATURE", "EN MI/PC/FUNCIONA", "RAM:/2 KB/SOBRA", "MANDEN/CAFÉ", ">(.)__/ (___/", "(o_O)", "CTRL+Z/PORFA", "APAGA/Y/ENCIENDE", "CARGANDO/▒▒▒▒/99%", "TODO/BIEN", "NO ES/MI/TURNO", "PULSA/UNA/TECLA", "VUELVO/EN 5", "WIFI:/1 RAYA", "MAMÁ/SALGO/EN LA TV", "PATO/NV 99"],
        scrAuxPanic: ["PÁNICO", "AAAAA/AAAAA", "TODO/BIEN/(NO)", "PULSA/F", "AYUDA", "CORRE", "(>_<)", "ERROR/ERROR/ERROR", "OTRA/VEZ/NO", "¿QUIÉN/LO/TOCÓ?", "x_x", "LLAMEN/A MAMÁ"],
        scrTrend: "/ 5 S", scrGraph: "TEMP / 60 S", scrAxisPast: "-60 S", scrAxisNow: "AHORA", scrAux: "AUX", scrPumps: "BOMBAS", scrLimit: "LÍMITE {n}",
        logCleared: "ALARMA DESPEJADA ... {t}", logLevel: "NIVEL {level} ..... {t}",
        msgAdvisories: ["TEMP. DEL NÚCLEO EN LÍMITES", "PRESIÓN ESTABLE", "CIRCUITO B: NOMINAL", "PRÓXIMA INSPECCIÓN: 14:00", "BANCO DE BARRAS C: FIJO", "CICLO DE VENTILACIÓN COMPLETO"],
        msgJokes: ["OPERADOR: FALTO DE CAFEÍNA", "REFRIGERANTE: PROBABLEMENTE BIEN", "MANUAL DE SEGURIDAD: EXTRAVIADO", "MORAL: DENTRO DE TOLERANCIA", "DÍAS SIN INCIDENTES: 0"],
        msgAlertsNOTICE: ["TEMP. DEL NÚCLEO SOBRE LO NOMINAL", "VIGILANDO LA DERIVA TÉRMICA", "REVISAR EL FLUJO DE REFRIGERANTE"],
        msgAlertsALARMED: ["ALARMA: TEMP. DEL NÚCLEO ALTA", "AUMENTAR EL FLUJO DE REFRIGERANTE", "LÍMITE TÉRMICO SUPERADO"],
        msgAlertsPANIC: ["CRÍTICO: NÚCLEO SOBRECALENTADO", "SE RECOMIENDA SCRAM", "TODO EL MUNDO A LA CONSOLA"],
        msgRecovered: "CONDICIONES NORMALIZADAS",
        msgLog: ["BOMBA 2 ............ OK", "FLUJO LAZO B ....... OK", "BANCO BARRAS C ..... FIJO", "CICLO VENTILACIÓN .. HECHO", "BARRIDO SENSORES ... OK"],
        demoSponsor: "PATROCINADOR",
      },
    },
  },
};

;
/* ---- src/i18n_texts.js ---- */
/*
 * Duck Reactor — textos del widget en portugués (Portugal), alemán y francés (etapa 15).
 * Se carga después de config.js: añade memes.texts["pt-PT" | "de" | "fr"] si no
 * existen (un config.js exportado que ya los traiga se respeta). Las claves son
 * las mismas que en inglés y español (config.js). Generado desde las fuentes de
 * traducción; se puede editar a mano.
 */
(function () {
  "use strict";
  const cfg = window.DUCK_REACTOR_CONFIG;
  if (!cfg || !cfg.memes || !cfg.memes.texts) return;
  const T = {
    "pt-PT": {
      fine: "ESTÁ TUDO BEM",
      correction: "CORREÇÃO:",
      notFine: "NÃO ESTÁ NADA BEM",
      coffeeTag: "NOTA DO OPERADOR",
      coolantLow: "REFRIGERANTE BAIXO",
      coffeeNo: "O CAFÉ NÃO CONTA",
      updTitle: "ATUALIZAÇÃO",
      updInstalling: "A INSTALAR ATUALIZAÇÃO…",
      updSub: "NÃO DESLIGUE O REATOR",
      updFailed: "A ATUALIZAÇÃO FALHOU COM ÊXITO",
      btnTag: "BOTÃO VERMELHO",
      doNotPress: "NÃO CARREGAR",
      whyPress: "PORQUE É QUE FARIAS ISSO?",
      recTag: "REGISTO DE INCIDENTES",
      resolved: "INCIDENTE RESOLVIDO",
      deleted: "RELATÓRIO DO INCIDENTE: APAGADO",
      daysLabel: "DIAS SEM INCIDENTES",
      daysValue: "0",
      fuelSearch: "A PROCURAR FONTE DE ENERGIA",
      fuelCore: "NÚCLEO",
      fuelTank: "DEPÓSITO",
      fuelLow: "QUASE VAZIO",
      fuelFound: "FONTE DETETADA: CANECA",
      fuelFilling: "A ABASTECER",
      fuelPunch: "ENERGIA RENOVÁVEL: MAIS UM CAFÉ",
      denialTitle: "calma.exe",
      denialFine: "Tudo bem",
      denialFineLoud: "TUDO BEM",
      denialGraph: "TEMPERATURA DO NÚCLEO",
      denialApproved: "APROVADO",
      denialCard: "Risco: aceitável",
      denialSign: "Assinado: Administração",
      denialPunch: "Esta reunião podia ter sido um email. 📧",
      supOn: "SUPERVISOR LIGADO",
      supOnline: "LIGADO",
      supOffline: "DESLIGADO",
      supTitle: "RELATÓRIO DE TURNO",
      supCheck1: "SEGURANÇA",
      supCheck2: "PRODUTIVIDADE",
      supCheck3: "ATITUDE",
      supCurve: "DESEMPENHO",
      supStamp: "FUNCIONÁRIO DO MÊS",
      supFooter: "APRESENTAÇÃO · DADOS ILUSTRATIVOS",
      supOff: "SUPERVISOR DESLIGADO",
      supPunch: "DE VOLTA A NÃO FAZER NADA",
      subTag: "NOVO SUBSCRITOR",
      subOne: "{name} RENOVOU O CONTRATO DESTE PATO",
      subMany: "{name} E MAIS {n} RENOVARAM O CONTRATO DESTE PATO",
      subAnon: "UM HERÓI ANÓNIMO",
      subCooling: "A ARREFECER O NÚCLEO",
      subWait: "AINDA CRÍTICO: CAFÉ ADIADO",
      subPunch: "CRISE CANCELADA. CAFÉ AUTORIZADO",
      subPunchCalm: "REFRIGERANTE DE SOBRA. PAUSA PARA CAFÉ.",
      subTagMany: "NOVOS SUBSCRITORES",
      subAnd: "E",
      subMore: "MAIS {n}",
      subAnonMany: "{n} HERÓIS ANÓNIMOS",
      popNoResp: "(NÃO RESPONDE)",
      popNoClose: "IMPOSSÍVEL FECHAR: OCUPADA A ENTRAR EM PÂNICO",
      popCloser: "fechar.exe",
      popClosing: "A FECHAR «{win}»…",
      gsTitle: "suporte@reator · pedido #4471",
      gsProblem: "TEMPERATURA CRÍTICA",
      gsCore: "NÚCLEO:",
      gsSent: "Pedido de arrefecimento submetido",
      gsReply: "Prazo de resposta: 3 a 5 dias úteis",
      gaTitle: "assistente.exe",
      gaStart: "Assistente de emergência iniciado",
      gaQuestion: "Já experimentaste reiniciar o reator?",
      gaBtn1: "Agora não",
      gaBtn2: "Agora também não",
      gaRestart: "Perfeito. A reiniciar.",
      gaDenied: "Permissão negada.",
      gaLucky: "Ainda bem.",
      gcIncTitle: "MONITOR DE INCIDENTES",
      gcIncident: "INCIDENTE DETETADO",
      gcProto: "Protocolo de emergência: pronto a iniciar",
      gcSurveyTitle: "inquerito.exe",
      gcAsk: "Antes de continuar, avalie a experiência",
      gcThanks: "Obrigado. A sua opinião é muito importante para nós.",
      recShort: "RECUPERAÇÃO",
      recLabel: "RECUPERAÇÃO EM CURSO",
      recActive: "CRÍTICO ATIVO",
      recSafeIn: "SEGURO EM {s} S",
      recPending: "ESTADO SEGURO PENDENTE",
      recAdvisory: "ARREFECIMENTO CONFIRMADO · A AGUARDAR ESTABILIDADE",
      subRecovering: "RECUPERAÇÃO EM CURSO · SEGURO EM {s} S",
      subRecoveringWait: "RECUPERAÇÃO EM CURSO · SEGURO PENDENTE",
      leakTag: "FUGA DE VAPOR",
      leakWhere: "JUNTA L-2",
      leakCold: "REFRIGERANTE NA L-2",
      chatAnon: "ALGUÉM DO CHAT",
      heatTag: "NÃO MEXER",
      heatOne: "{name} JURA QUE SABE O QUE ESTÁ A FAZER",
      heatMany: "{name} E MAIS {n} JURAM QUE SABEM O QUE ESTÃO A FAZER",
      coolTag: "REFRIGERANTE",
      lockCool: "REFRIGERANTE {n}/{t}", lockFollow: "FOLLOWS {n}/{t}", lockPaid: "1 SUB = SOLUÇÃO IMEDIATA", followOne: "{name} SEGUIU O CANAL · VÁLVULA +1",
      coolOne: "{name} ENVIOU REFRIGERANTE",
      coolMany: "{name} E MAIS {n} ENVIARAM REFRIGERANTE",
      coolHelp: "+{n} DE REFRIGERANTE DO CHAT",
      becTag: "EMERGÊNCIA",
      becMain: "INTERVENÇÃO DO ESTAGIÁRIO",
      becSub: "ARREFECIMENTO MANUAL EM CURSO",
      scrSoonHeader: "EMISSÃO.EXE",
      scrSoonBadge: "EM ESPERA",
      scrSoonLines: ["COMEÇAMOS", "JÁ A SEGUIR"],
      scrSoonFooter: "NÃO SAIAM DAÍ",
      scrCoreTitle: "REATOR 03 // MONITOR DO NÚCLEO",
      scrShift: "TURNO B",
      scrReactorLabel: "REATOR",
      scrTempLabel: "TEMP. NÚCLEO",
      scrRoPressure: "PRESSÃO",
      scrRoCoolant: "REFRIGERANTE",
      scrRoRods: "PROF. BARRAS",
      scrRoOutput: "POTÊNCIA",
      lvNORMAL: "NOMINAL",
      lvNOTICE: "ATENÇÃO",
      lvALARMED: "ALARME",
      lvPANIC: "CRÍTICO",
      scrStatusLabel: "ESTADO DO NÚCLEO",
      scrLoadLabel: "CARGA",
      scrAdvisoryLabel: "AVISOS",
      scrAuxRows: ["SIS", "OK", "CIRC", "B-2"],
        scrAuxMemes: ["ERRO/404/CÉREBRO", "CONFIA/EM/MIM", "SKILL/ISSUE", "QUÁ/.EXE", "BUG?/NÃO,/FEATURE", "NO MEU/PC/FUNCIONA", "RAM:/2 KB/CHEGA", "MANDEM/CAFÉ", ">(.)__/ (___/", "(o_O)", "CTRL+Z/POR/FAVOR", "DESLIGA/E/LIGA", "A CARREGAR/▒▒▒▒/99%", "ESTÁ/TUDO/BEM", "NÃO É/O MEU/TURNO", "PRIME/UMA/TECLA", "VOLTO/JÁ", "WI-FI:/1 BARRA", "MÃE/ESTOU/NA TV", "PATO/NÍV 99"],
        scrAuxPanic: ["PÂNICO", "AAAAA/AAAAA", "ESTÁ/TUDO/BEM", "PRIME/F", "SOCORRO", "FOGE", "(>_<)", "ERRO/ERRO/ERRO", "OUTRA/VEZ/NÃO", "QUEM/MEXEU/NISTO?", "x_x", "LIGUEM/À MÃE"],
      scrTrend: "/ 5 S",
      scrGraph: "TEMP / 60 S",
      scrAxisPast: "-60 S",
      scrAxisNow: "AGORA",
      scrAux: "AUX",
      scrPumps: "BOMBAS",
      scrLimit: "LIMITE {n}",
      logCleared: "ALARME ANULADO ... {t}",
      logLevel: "NÍVEL {level} ..... {t}",
      msgAdvisories: ["TEMP. DO NÚCLEO DENTRO DOS LIMITES", "PRESSÃO ESTÁVEL", "CIRCUITO B: NOMINAL", "PRÓXIMA INSPEÇÃO: 14:00", "BANCO DE BARRAS C: FIXO", "CICLO DE VENTILAÇÃO CONCLUÍDO"],
      msgJokes: ["OPERADOR: CAFEÍNA INSUFICIENTE", "REFRIGERANTE: DEVE ESTAR BEM", "MANUAL DE SEGURANÇA: EXTRAVIADO", "MORAL: DENTRO DA TOLERÂNCIA", "DIAS SEM INCIDENTES: 0"],
      msgAlertsNOTICE: ["TEMP. DO NÚCLEO ACIMA DO NOMINAL", "A MONITORIZAR DESVIO TÉRMICO", "VERIFICAR FLUXO DE REFRIGERANTE"],
      msgAlertsALARMED: ["ALARME: TEMP. DO NÚCLEO ELEVADA", "AUMENTAR FLUXO DE REFRIGERANTE", "LIMITE TÉRMICO EXCEDIDO"],
      msgAlertsPANIC: ["CRÍTICO: NÚCLEO SOBREAQUECIDO", "SCRAM RECOMENDADO", "TODOS À CONSOLA"],
      msgRecovered: "CONDIÇÕES NORMALIZADAS",
      msgLog: ["BOMBA 2 ............. OK", "FLUXO CIRC. B ....... OK", "BANCO BARRAS C ...... FIXO", "CICLO VENTILAÇÃO .... FEITO", "VARRIM. SENSORES .... OK"],
      demoSponsor: "PATROCINADOR",
    },
    "de": {
      fine: "ALLES IN ORDNUNG",
      correction: "KORREKTUR:",
      notFine: "NICHTS IST IN ORDNUNG",
      coffeeTag: "OPERATOR-NOTIZ",
      coolantLow: "KÜHLMITTEL KNAPP",
      coffeeNo: "KAFFEE ZÄHLT NICHT",
      updTitle: "SYSTEMUPDATE",
      updInstalling: "UPDATE WIRD INSTALLIERT…",
      updSub: "SCHALTEN SIE DEN REAKTOR NICHT AUS",
      updFailed: "UPDATE ERFOLGREICH FEHLGESCHLAGEN",
      btnTag: "ROTER KNOPF",
      doNotPress: "NICHT DRÜCKEN",
      whyPress: "WARUM MACHST DU SOWAS?",
      recTag: "STÖRFALLPROTOKOLL",
      resolved: "STÖRFALL BEHOBEN",
      deleted: "STÖRFALLBERICHT: GELÖSCHT",
      daysLabel: "TAGE OHNE STÖRFALL",
      daysValue: "0",
      fuelSearch: "SUCHE ENERGIEQUELLE",
      fuelCore: "KERN",
      fuelTank: "TANK",
      fuelLow: "FAST LEER",
      fuelFound: "QUELLE GEFUNDEN: TASSE",
      fuelFilling: "WIRD BETANKT",
      fuelPunch: "ÖKOSTROM: NOCH EIN KAFFEE",
      denialTitle: "ruhe.exe",
      denialFine: "Alles gut",
      denialFineLoud: "ALLES GUT",
      denialGraph: "KERNTEMPERATUR",
      denialApproved: "GENEHMIGT",
      denialCard: "Risiko: vertretbar",
      denialSign: "Gez. Geschäftsleitung",
      denialPunch: "Dieses Meeting hätte eine E-Mail sein können. 📧",
      supOn: "VORGESETZTER VERBUNDEN",
      supOnline: "ONLINE",
      supOffline: "OFFLINE",
      supTitle: "SCHICHTBERICHT",
      supCheck1: "SICHERHEIT",
      supCheck2: "PRODUKTIVITÄT",
      supCheck3: "EINSTELLUNG",
      supCurve: "LEISTUNG",
      supStamp: "MITARBEITER DES MONATS",
      supFooter: "PRÄSENTATION · BEISPIELDATEN",
      supOff: "VORGESETZTER GETRENNT",
      supPunch: "ZURÜCK ZUM NICHTSTUN",
      subTag: "NEUER ABONNENT",
      subOne: "{name} HAT DEN VERTRAG DIESER ENTE VERLÄNGERT",
      subMany: "{name} UND {n} WEITERE HABEN DEN ENTENVERTRAG VERLÄNGERT",
      subAnon: "EIN ANONYMER HELD",
      subCooling: "KERN WIRD GEKÜHLT",
      subWait: "NOCH KRITISCH: KAFFEE VERSCHOBEN",
      subPunch: "KRISE ABGESAGT. KAFFEE GENEHMIGT",
      subPunchCalm: "KÜHLMITTEL ÜBRIG. KAFFEEPAUSE.",
      subTagMany: "NEUE ABONNENTEN",
      subAnd: "UND",
      subMore: "{n} WEITERE",
      subAnonMany: "{n} ANONYME HELDEN",
      popNoResp: "(KEINE RÜCKMELDUNG)",
      popNoClose: "SCHLIESSEN UNMÖGLICH: SCHIEBT GERADE PANIK",
      popCloser: "beenden.exe",
      popClosing: "SCHLIESSE „{win}“…",
      gsTitle: "support@reaktor · Ticket #4471",
      gsProblem: "KRITISCHE TEMPERATUR",
      gsCore: "KERN:",
      gsSent: "Kühlungsanfrage übermittelt",
      gsReply: "Voraussichtliche Bearbeitungszeit: 3–5 Werktage",
      gaTitle: "assistent.exe",
      gaStart: "Notfallassistent gestartet",
      gaQuestion: "Schon versucht, den Reaktor neu zu starten?",
      gaBtn1: "Jetzt nicht",
      gaBtn2: "Jetzt auch nicht",
      gaRestart: "Perfekt. Neustart wird eingeleitet.",
      gaDenied: "Zugriff verweigert.",
      gaLucky: "Zum Glück.",
      gcIncTitle: "STÖRFALL-MONITOR",
      gcIncident: "STÖRFALL ERKANNT",
      gcProto: "Notfallprotokoll: startbereit",
      gcSurveyTitle: "umfrage.exe",
      gcAsk: "Bevor es weitergeht: Wie zufrieden sind Sie?",
      gcThanks: "Vielen Dank. Ihre Meinung ist uns wichtig.",
      recShort: "ABKÜHLPHASE",
      recLabel: "ABKÜHLPHASE LÄUFT",
      recActive: "WEITERHIN KRITISCH",
      recSafeIn: "SICHER IN {s} S",
      recPending: "SICHERER ZUSTAND AUSSTEHEND",
      recAdvisory: "KÜHLUNG BESTÄTIGT · WARTE AUF STABILITÄT",
      subRecovering: "ABKÜHLPHASE LÄUFT · SICHER IN {s} S",
      subRecoveringWait: "ABKÜHLPHASE LÄUFT · SICHERER ZUSTAND AUSSTEHEND",
      leakTag: "DAMPFLECK",
      leakWhere: "FLANSCH L-2",
      leakCold: "KÜHLMITTEL AN L-2",
      chatAnon: "JEMAND IM CHAT",
      heatTag: "NICHT ANFASSEN",
      heatOne: "{name} SAGT: „ICH WEISS, WAS ICH TUE.“",
      heatMany: "{name} UND {n} WEITERE SAGEN: „WIR WISSEN, WAS WIR TUN.“",
      coolTag: "KÜHLMITTEL",
      lockCool: "KÜHLMITTEL {n}/{t}", lockFollow: "FOLLOWS {n}/{t}", lockPaid: "1 SUB = SOFORT GELÖST", followOne: "{name} FOLGT · VENTIL +1",
      coolOne: "{name} SCHICKT KÜHLMITTEL",
      coolMany: "{name} UND {n} WEITERE SCHICKEN KÜHLMITTEL",
      coolHelp: "+{n} KÜHLMITTEL AUS DEM CHAT",
      becTag: "NOTFALL",
      becMain: "DER PRAKTIKANT GREIFT EIN",
      becSub: "MANUELLE KÜHLUNG LÄUFT",
      scrSoonHeader: "SENDUNG.EXE",
      scrSoonBadge: "STANDBY",
      scrSoonLines: ["GLEICH", "GEHT'S LOS"],
      scrSoonFooter: "BLEIBEN SIE DRAN",
      scrCoreTitle: "REAKTOR 03 // KERNMONITOR",
      scrShift: "SCHICHT B",
      scrReactorLabel: "REAKTOR",
      scrTempLabel: "KERNTEMP.",
      scrRoPressure: "DRUCK",
      scrRoCoolant: "KÜHLMITTEL",
      scrRoRods: "STABTIEFE",
      scrRoOutput: "LEISTUNG",
      lvNORMAL: "NORMAL",
      lvNOTICE: "VORSICHT",
      lvALARMED: "ALARM",
      lvPANIC: "KRITISCH",
      scrStatusLabel: "KERNSTATUS",
      scrLoadLabel: "LAST",
      scrAdvisoryLabel: "HINWEISE",
      scrAuxRows: ["SYS", "OK", "KREIS", "B-2"],
        scrAuxMemes: ["404/HIRN/FEHLT", "VERTRAU/MIR/BRO", "SKILL/ISSUE", "QUAK/.EXE", "BUG?/NEIN,/FEATURE", "BEI MIR/LÄUFT'S", "RAM:/2 KB/REICHT", "MEHR/KAFFEE", ">(.)__/ (___/", "(o_O)", "STRG+Z/BITTE", "AUS- UND/WIEDER/AN", "LÄDT/▒▒▒▒/99%", "ALLES/GUT", "NICHT/MEINE/SCHICHT", "BELIEB./TASTE/DRÜCKEN", "BIN/GLEICH/ZURÜCK", "WLAN:/1 BALKEN", "MAMA,/ICH BIN/IM TV", "ENTE/LVL 99"],
        scrAuxPanic: ["PANIK", "AAAAA/AAAAA", "ALLES/GUT", "DRÜCK/F", "HILFE", "LAUF", "(>_<)", "FEHLER/FEHLER/FEHLER", "NICHT/SCHON/WIEDER", "WER/WAR/DAS?", "x_x", "RUFT/MAMA"],
      scrTrend: "/ 5 S",
      scrGraph: "TEMP / 60 S",
      scrAxisPast: "-60 S",
      scrAxisNow: "JETZT",
      scrAux: "AUX",
      scrPumps: "PUMPEN",
      scrLimit: "GRENZE {n}",
      logCleared: "ALARM AUFGEHOBEN ... {t}",
      logLevel: "STUFE {level} ..... {t}",
      msgAdvisories: ["KERNTEMP. INNERHALB DER GRENZWERTE", "DRUCK STABIL", "KÜHLKREIS B: NORMAL", "NÄCHSTE INSPEKTION: 14:00", "STABBANK C: POSITION GEHALTEN", "LÜFTUNGSZYKLUS ABGESCHLOSSEN"],
      msgJokes: ["OPERATOR: UNTERKOFFEINIERT", "KÜHLMITTEL: VERMUTLICH OK", "SICHERHEITSHANDBUCH: VERLEGT", "MORAL: IM TOLERANZBEREICH", "TAGE OHNE STÖRFALL: 0"],
      msgAlertsNOTICE: ["KERNTEMP. ÜBER NORMALWERT", "THERMISCHE DRIFT WIRD ÜBERWACHT", "KÜHLMITTELFLUSS PRÜFEN"],
      msgAlertsALARMED: ["ALARM: KERNTEMP. ZU HOCH", "KÜHLMITTELFLUSS ERHÖHEN", "THERMISCHES LIMIT ÜBERSCHRITTEN"],
      msgAlertsPANIC: ["KRITISCH: KERN ÜBERHITZT", "SCRAM EMPFOHLEN", "ALLE MANN AN DIE KONSOLE"],
      msgRecovered: "LAGE NORMALISIERT",
      msgLog: ["PUMPE 2 ............. OK", "KREIS B FLUSS ....... OK", "STABBANK C .......... HÄLT", "LÜFTUNGSZYKLUS ...... FERTIG", "SENSORSCAN .......... OK"],
      demoSponsor: "SPONSOR",
    },
    "fr": {
      fine: "TOUT VA BIEN",
      correction: "CORRECTION :",
      notFine: "RIEN NE VA PLUS",
      coffeeTag: "NOTE DE L'OPÉRATEUR",
      coolantLow: "NIVEAU DE RÉFRIGÉRANT BAS",
      coffeeNo: "LE CAFÉ NE COMPTE PAS",
      updTitle: "MISE À JOUR SYSTÈME",
      updInstalling: "INSTALLATION DE LA MISE À JOUR…",
      updSub: "N'ÉTEIGNEZ PAS VOTRE RÉACTEUR",
      updFailed: "MISE À JOUR ÉCHOUÉE AVEC SUCCÈS",
      btnTag: "BOUTON ROUGE",
      doNotPress: "NE PAS APPUYER",
      whyPress: "POURQUOI AVOIR FAIT ÇA ?",
      recTag: "JOURNAL DES INCIDENTS",
      resolved: "INCIDENT RÉSOLU",
      deleted: "RAPPORT D'INCIDENT : SUPPRIMÉ",
      daysLabel: "JOURS SANS INCIDENT",
      daysValue: "0",
      fuelSearch: "RECHERCHE DE SOURCE D'ÉNERGIE",
      fuelCore: "CŒUR",
      fuelTank: "RÉSERVOIR",
      fuelLow: "PRESQUE VIDE",
      fuelFound: "SOURCE TROUVÉE : TASSE",
      fuelFilling: "RAVITAILLEMENT",
      fuelPunch: "ÉNERGIE RENOUVELABLE : LE CAFÉ",
      denialTitle: "zen.exe",
      denialFine: "Tout va bien",
      denialFineLoud: "TOUT VA BIEN",
      denialGraph: "TEMPÉRATURE DU CŒUR",
      denialApproved: "VALIDÉ",
      denialCard: "Risque : acceptable",
      denialSign: "Signé : la Direction",
      denialPunch: "Cette réunion aurait pu être un e-mail. 📧",
      supOn: "SUPERVISEUR CONNECTÉ",
      supOnline: "EN LIGNE",
      supOffline: "HORS LIGNE",
      supTitle: "RAPPORT DE SERVICE",
      supCheck1: "SÉCURITÉ",
      supCheck2: "PRODUCTIVITÉ",
      supCheck3: "ATTITUDE",
      supCurve: "PERFORMANCE",
      supStamp: "EMPLOYÉ DU MOIS",
      supFooter: "DIAPORAMA · DONNÉES INDICATIVES",
      supOff: "SUPERVISEUR DÉCONNECTÉ",
      supPunch: "RETOUR À NE RIEN FAIRE",
      subTag: "NOUVEL ABONNÉ",
      subOne: "{name} A RENOUVELÉ LE CONTRAT DE CE CANARD",
      subMany: "{name} ET {n} DE PLUS ONT RENOUVELÉ LE CONTRAT DU CANARD",
      subAnon: "UN HÉROS ANONYME",
      subCooling: "REFROIDISSEMENT DU CŒUR",
      subWait: "TOUJOURS CRITIQUE : CAFÉ REPORTÉ",
      subPunch: "CRISE ANNULÉE. CAFÉ AUTORISÉ",
      subPunchCalm: "RÉFRIGÉRANT À REVENDRE. PAUSE CAFÉ.",
      subTagMany: "NOUVEAUX ABONNÉS",
      subAnd: "ET",
      subMore: "{n} DE PLUS",
      subAnonMany: "{n} HÉROS ANONYMES",
      popNoResp: "(NE RÉPOND PAS)",
      popNoClose: "FERMETURE IMPOSSIBLE : PANIQUE EN COURS",
      popCloser: "fermer.exe",
      popClosing: "FERMETURE DE « {win} »…",
      gsTitle: "support@reacteur · ticket #4471",
      gsProblem: "TEMPÉRATURE CRITIQUE",
      gsCore: "CŒUR :",
      gsSent: "Demande de refroidissement envoyée",
      gsReply: "Délai de réponse estimé : 3 à 5 jours ouvrés",
      gaTitle: "assistant.exe",
      gaStart: "Assistant d'urgence lancé",
      gaQuestion: "Avez-vous essayé de redémarrer le réacteur ?",
      gaBtn1: "Plus tard",
      gaBtn2: "Encore plus tard",
      gaRestart: "Parfait. Redémarrage en cours.",
      gaDenied: "Accès refusé.",
      gaLucky: "Heureusement.",
      gcIncTitle: "MONITEUR D'INCIDENTS",
      gcIncident: "INCIDENT DÉTECTÉ",
      gcProto: "Protocole d'urgence : prêt à démarrer",
      gcSurveyTitle: "sondage.exe",
      gcAsk: "Avant de continuer, notez votre expérience",
      gcThanks: "Merci. Votre avis compte beaucoup pour nous.",
      recShort: "RÉCUPÉRATION",
      recLabel: "RÉCUPÉRATION EN COURS",
      recActive: "CRITIQUE ACTIF",
      recSafeIn: "SÉCURISÉ DANS {s} S",
      recPending: "ÉTAT SÛR EN ATTENTE",
      recAdvisory: "REFROIDISSEMENT CONFIRMÉ · ATTENTE DE STABILITÉ",
      subRecovering: "RÉCUPÉRATION EN COURS · SÉCURISÉ DANS {s} S",
      subRecoveringWait: "RÉCUPÉRATION EN COURS · ÉTAT SÛR EN ATTENTE",
      leakTag: "FUITE DE VAPEUR",
      leakWhere: "JOINT L-2",
      leakCold: "RÉFRIGÉRANT SUR L-2",
      chatAnon: "QUELQU'UN DU CHAT",
      heatTag: "NE PAS TOUCHER",
      heatOne: "{name} ASSURE QUE TOUT EST SOUS CONTRÔLE",
      heatMany: "{name} ET {n} DE PLUS ASSURENT QUE TOUT EST SOUS CONTRÔLE",
      coolTag: "RÉFRIGÉRANT",
      lockCool: "RÉFRIGÉRANT {n}/{t}", lockFollow: "FOLLOWS {n}/{t}", lockPaid: "1 SUB = RÉPARATION IMMÉDIATE", followOne: "{name} SUIT LA CHAÎNE · VANNE +1",
      coolOne: "{name} A ENVOYÉ DU RÉFRIGÉRANT",
      coolMany: "{name} ET {n} DE PLUS ONT ENVOYÉ DU RÉFRIGÉRANT",
      coolHelp: "+{n} DE RÉFRIGÉRANT VIA LE CHAT",
      becTag: "URGENCE",
      becMain: "INTERVENTION DU STAGIAIRE",
      becSub: "REFROIDISSEMENT MANUEL EN COURS",
      scrSoonHeader: "DIFFUSION.EXE",
      scrSoonBadge: "EN ATTENTE",
      scrSoonLines: ["DÉMARRAGE", "IMMINENT"],
      scrSoonFooter: "VEUILLEZ PATIENTER",
      scrCoreTitle: "RÉACTEUR 03 // MONITEUR DU CŒUR",
      scrShift: "ÉQUIPE B",
      scrReactorLabel: "RÉACTEUR",
      scrTempLabel: "TEMP. CŒUR",
      scrRoPressure: "PRESSION",
      scrRoCoolant: "RÉFRIGÉRANT",
      scrRoRods: "PROF. BARRES",
      scrRoOutput: "PUISSANCE",
      lvNORMAL: "NOMINAL",
      lvNOTICE: "VIGILANCE",
      lvALARMED: "ALARME",
      lvPANIC: "CRITIQUE",
      scrStatusLabel: "ÉTAT DU CŒUR",
      scrLoadLabel: "CHARGE",
      scrAdvisoryLabel: "AVIS",
      scrAuxRows: ["SYS", "OK", "BOUCLE", "B-2"],
        scrAuxMemes: ["404/CERVEAU/INTROUVABLE", "CROIS-/MOI/FRÈRE", "SKILL/ISSUE", "COIN/.EXE", "BUG ?/NON,/FEATURE", "CHEZ/MOI ÇA/MARCHE", "RAM :/2 KO/SUFFIT", "ENVOYEZ/DU CAFÉ", ">(.)__/ (___/", "(o_O)", "CTRL+Z/STP", "ÉTEINS/ET/RALLUME", "CHARGE/▒▒▒▒/99%", "TOUT/VA/BIEN", "PAS MON/SERVICE", "APPUIE/SUR UNE/TOUCHE", "JE/REVIENS", "WIFI :/1 BARRE", "MAMAN,/JE SUIS/À LA TÉLÉ", "CANARD/NIV 99"],
        scrAuxPanic: ["PANIQUE", "AAAAA/AAAAA", "TOUT/VA/BIEN", "APPUIE/SUR F", "À L'AIDE", "COURS", "(>_<)", "ERREUR/ERREUR/ERREUR", "PAS/ENCORE", "QUI A/TOUCHÉ ?", "x_x", "APPELEZ/MAMAN"],
      scrTrend: "/ 5 S",
      scrGraph: "TEMP / 60 S",
      scrAxisPast: "-60 S",
      scrAxisNow: "ACTUEL",
      scrAux: "AUX",
      scrPumps: "POMPES",
      scrLimit: "LIMITE {n}",
      logCleared: "ALARME LEVÉE ... {t}",
      logLevel: "NIVEAU {level} ..... {t}",
      msgAdvisories: ["TEMP. CŒUR DANS LES LIMITES", "PRESSION STABLE", "CIRCUIT RÉFRIGÉRANT B : NOMINAL", "PROCHAINE INSPECTION : 14H00", "BARRES GROUPE C : EN POSITION", "CYCLE DE VENTILATION TERMINÉ"],
      msgJokes: ["OPÉRATEUR : EN MANQUE DE CAFÉINE", "RÉFRIGÉRANT : A PRIORI ÇA VA", "MANUEL DE SÉCURITÉ : ÉGARÉ", "MORAL : DANS LES TOLÉRANCES", "JOURS SANS INCIDENT : 0"],
      msgAlertsNOTICE: ["TEMP. CŒUR AU-DESSUS DU NOMINAL", "DÉRIVE THERMIQUE SOUS SURVEILLANCE", "VÉRIFIER LE DÉBIT DE RÉFRIGÉRANT"],
      msgAlertsALARMED: ["ALARME : TEMP. CŒUR ÉLEVÉE", "AUGMENTER LE DÉBIT DE RÉFRIGÉRANT", "LIMITE THERMIQUE DÉPASSÉE"],
      msgAlertsPANIC: ["CRITIQUE : SURCHAUFFE DU CŒUR", "SCRAM RECOMMANDÉ", "TOUS À LA CONSOLE"],
      msgRecovered: "RETOUR À LA NORMALE",
      msgLog: ["CONTRÔLE POMPE 2 ... OK", "DÉBIT BOUCLE B ..... OK", "BARRES GROUPE C .... MAINTIEN", "CYCLE VENTILATION .. FAIT", "BALAYAGE CAPTEURS .. OK"],
      demoSponsor: "MÉCÈNE",
    },
  };
  Object.keys(T).forEach((l) => {
    const have = cfg.memes.texts[l] || {};
    cfg.memes.texts[l] = Object.assign({}, T[l], have);
  });
})();

;
/* ---- src/catalog_data.js ---- */
/*
 * Duck Reactor — catálogo de memes (etapa 12). Valores por defecto.
 *
 * Se carga después de config.js y añade config.catalog SÓLO si no existe
 * (un config.js exportado desde el laboratorio ya lo trae y se respeta).
 *
 * Cada entrada:
 *   id        identificador estable (las entradas propias empiezan por «u-»)
 *   kind      popup (ventana de crisis) · sub (frase de suscripción) · coffee (remate de café)
 *   family    popups: error · hack · achievement · dialog · progress
 *             frases: gamer · oficina · heroe · pato · equipo · tecnica
 *             café:   cafeina · protocolo · calma
 *   ctx       popups: start (inicio de la crisis) · any · long (crisis larga)
 *             frases: critical (ayuda en progreso) · recovery (salió de CRITICAL) · normal (ya seguro)
 *             café:   after (tras una crisis) · calm (sin crisis) · any
 *   who       frases: one · group · any (para suscripciones agrupadas)
 *   lang      all · es · en (idiomas en los que puede salir)
 *   weight    peso relativo (0–5) · cooldown: segundos mínimos antes de repetirla
 *   on        activada · bar: % donde falla la barra (popups de progreso; >100 desborda)
 *   es / en   textos: title (ventana) · main · sub · btns ("A|B", "A→B" cambia el texto del botón)
 * {name} se sustituye por el nombre (o los nombres) como texto, nunca como HTML.
 * Las variantes de idioma son la MISMA entrada: no cuentan como entradas distintas.
 */
(function () {
  "use strict";
  const cfg = window.DUCK_REACTOR_CONFIG;
  window.DUCK_REACTOR_GENERIC_POPUPS = ["err-fine", "err-surprised", "err-houston", "err-keyboard", "hk-imin", "hk-rabbit", "hk-mainframe", "ach-speedrun", "ach-sauna", "ach-hold", "ach-skill", "ach-emotional", "ach-highscore", "dlg-cook", "dlg-f", "dlg-help", "dlg-sure", "pr-9000", "pr-ram", "pr-coin"];
  if (!cfg || cfg.catalog) return;

  const L = (title, main, sub, btns) => ({ title: title || "", main: main || "", sub: sub || "", btns: btns || "" });
  const P = (id, family, ctx, es, en, o) => Object.assign({ id, kind: "popup", family, ctx, who: "any", lang: "all", weight: 1, cooldown: 150, on: true, bar: 99, custom: false, es, en }, o || {});
  const S = (id, family, ctx, who, es, en, o) => Object.assign({ id, kind: "sub", family, ctx, who, lang: "all", weight: 1, cooldown: 0, on: true, bar: 99, custom: false, es: L("", es), en: L("", en) }, o || {});
  const K = (id, family, ctx, es, en, o) => Object.assign({ id, kind: "coffee", family, ctx, who: "any", lang: "all", weight: 1, cooldown: 0, on: true, bar: 99, custom: false, es: L("", es), en: L("", en) }, o || {});
  const ACH_ES = "LOGRO DESBLOQUEADO", ACH_EN = "ACHIEVEMENT UNLOCKED";

  const entries = [
    /* ===================== POPUPS DE CRISIS (40) ===================== */
    /* ---- Error del sistema ---- */
    P("err-404", "error", "start", L("refrigeracion.sys", "ERROR 404: REFRIGERANTE NOT FOUND", "EL PATO TAMPOCO LO ENCUENTRA", "ACEPTAR"),
      L("coolant.sys", "ERROR 404: COOLANT NOT FOUND", "THE DUCK CAN'T FIND IT EITHER", "OK"), { weight: 1.3 }),
    P("err-fine", "error", "start", L("estado.exe", "THIS IS FINE", "EL PATO DISCREPA", "ACEPTAR"),
      L("status.exe", "THIS IS FINE", "THE DUCK DISAGREES", "OK"), { weight: 1.3 }),
    P("err-onejob", "error", "any", L("turno.log", "YOU HAD ONE JOB", "ERA VIGILAR LA TEMPERATURA", "LO SÉ"),
      L("shift.log", "YOU HAD ONE JOB", "IT WAS WATCHING THE TEMPERATURE", "I KNOW"), { weight: 1.2 }),
    P("err-fatal", "error", "any", L("nucleo.exe", "EXCEPCIÓN FATAL 0xCUACK", "EL NÚCLEO HA REALIZADO UNA OPERACIÓN NO VÁLIDA", "ACEPTAR→ACEPTAR TU DESTINO"),
      L("core.exe", "FATAL EXCEPTION 0xQUACK", "THE CORE PERFORMED AN ILLEGAL OPERATION", "OK→ACCEPT YOUR FATE")),
    P("err-keyboard", "error", "any", L("BIOS", "TECLADO NO DETECTADO", "PULSE F1 PARA ENFRIAR EL NÚCLEO", "F1"),
      L("BIOS", "KEYBOARD NOT DETECTED", "PRESS F1 TO COOL THE CORE", "F1")),
    P("err-feature", "error", "any", L("incidencias.txt", "NO ES UN BUG", "ES CALEFACCIÓN CENTRAL", "CERRAR TICKET"),
      L("tickets.txt", "IT'S NOT A BUG", "IT'S CENTRAL HEATING", "CLOSE TICKET")),
    P("err-surprised", "error", "any", L("procesos", "SURPRISED_PATO.EXE", "RESPUESTA: ALETEAR", "ACEPTAR"),
      L("processes", "SURPRISED_DUCK.EXE", "RESPONSE: FLAP", "OK"), { weight: 1.2 }),
    P("err-houston", "error", "any", L("comunicaciones", "HOUSTON, TENEMOS UN PATO", "Y EL PATO TIENE UN PROBLEMA", "RECIBIDO"),
      L("comms", "HOUSTON, WE HAVE A DUCK", "AND THE DUCK HAS A PROBLEM", "COPY THAT")),
    /* ---- Consola de intrusión ---- */
    P("hk-cuack", "hack", "start", L("root@reactor:~", "HACKING…", "ACCESO DENEGADO: CONTRASEÑA 'CUACK123'"),
      L("root@reactor:~", "HACKING…", "ACCESS DENIED: PASSWORD 'QUACK123'"), { weight: 1.3 }),
    P("hk-sudo", "hack", "any", L("root@reactor:~", "sudo enfriar --nucleo", "EL PATO NO ESTÁ EN SUDOERS. INCIDENTE REPORTADO."),
      L("root@reactor:~", "sudo cool --core", "DUCK IS NOT IN THE SUDOERS FILE. INCIDENT REPORTED.")),
    P("hk-imin", "hack", "any", L("root@reactor:~", "ESTOY DENTRO.", "DENTRO DE LA SALA DE DESCANSO"),
      L("root@reactor:~", "I'M IN.", "IN THE BREAK ROOM")),
    P("hk-rm", "hack", "any", L("root@reactor:~", "rm -rf /calor", "PERMISO DENEGADO: EL CALOR ES DEL SISTEMA"),
      L("root@reactor:~", "rm -rf /heat", "PERMISSION DENIED: HEAT IS A SYSTEM FILE")),
    P("hk-rabbit", "hack", "any", L("root@reactor:~", "SIGUE AL CONEJO BLANCO…", "SÓLO HAY UN PATO, Y ESTÁ EN PÁNICO"),
      L("root@reactor:~", "FOLLOW THE WHITE RABBIT…", "THERE'S ONLY A DUCK, AND IT'S PANICKING")),
    P("hk-firewall", "hack", "any", L("root@reactor:~", "DESACTIVAR CORTAFUEGOS: OK", "AHORA SÓLO QUEDA EL FUEGO"),
      L("root@reactor:~", "DISABLE FIREWALL: OK", "NOW IT'S JUST FIRE")),
    P("hk-mainframe", "hack", "any", L("root@reactor:~", "ACCEDIENDO AL MAINFRAME…", "EL MAINFRAME ES UNA TOSTADORA"),
      L("root@reactor:~", "ACCESSING THE MAINFRAME…", "THE MAINFRAME IS A TOASTER")),
    P("hk-ping", "hack", "long", L("root@reactor:~", "ping refrigerante.local", "TIEMPO AGOTADO. LA PACIENCIA DEL PATO, TAMBIÉN."),
      L("root@reactor:~", "ping coolant.local", "REQUEST TIMED OUT. SO DID THE DUCK'S PATIENCE.")),
    /* ---- Logro desbloqueado ---- */
    P("ach-global", "achievement", "any", L(ACH_ES, "CALENTAMIENTO GLOBAL LOCAL", "SUPERA EL LÍMITE SIN LEVANTARTE DE LA SILLA"),
      L(ACH_EN, "LOCAL GLOBAL WARMING", "BREAK THE LIMIT WITHOUT LEAVING YOUR CHAIR"), { weight: 1.3 }),
    P("ach-speedrun", "achievement", "start", L(ACH_ES, "SPEEDRUN ANY% DE FUSIÓN", "NUEVO RÉCORD PERSONAL"),
      L(ACH_EN, "MELTDOWN ANY% SPEEDRUN", "NEW PERSONAL BEST")),
    P("ach-sauna", "achievement", "any", L(ACH_ES, "SAUNA PROFESIONAL", "LLEGA A CRITICAL CON EL CAFÉ EN LA MANO"),
      L(ACH_EN, "PROFESSIONAL SAUNA", "REACH CRITICAL WITH COFFEE IN HAND")),
    P("ach-hold", "achievement", "any", L(ACH_ES, "SUJÉTAME EL CAFÉ", "INTENTA ARREGLARLO CON LAS ALAS"),
      L(ACH_EN, "HOLD MY COFFEE", "TRY TO FIX IT WITH YOUR WINGS")),
    P("ach-skill", "achievement", "any", L(ACH_ES, "SKILL ISSUE TÉRMICO", "PIERDE CONTRA UN TERMÓMETRO"),
      L(ACH_EN, "THERMAL SKILL ISSUE", "LOSE TO A THERMOMETER")),
    P("ach-emotional", "achievement", "any", L(ACH_ES, "DAÑO EMOCIONAL", "EL NÚCLEO TE HA LLAMADO «BECARIO»"),
      L(ACH_EN, "EMOTIONAL DAMAGE", "THE CORE CALLED YOU 'INTERN'")),
    P("ach-highscore", "achievement", "long", L(ACH_ES, "NUEVO RÉCORD", "TEMPERATURA MÁS ALTA DEL TURNO"),
      L(ACH_EN, "NEW HIGH SCORE", "HIGHEST TEMPERATURE OF THE SHIFT")),
    P("ach-hardmode", "achievement", "long", L(ACH_ES, "MODO DIFÍCIL", "AGUANTA EN CRITICAL MÁS DE LO RECOMENDABLE"),
      L(ACH_EN, "HARD MODE", "STAY IN CRITICAL LONGER THAN ADVISED")),
    /* ---- Diálogo con botones absurdos ---- */
    P("dlg-off", "dialog", "any", L("SOPORTE TÉCNICO", "HAVE YOU TRIED TURNING IT OFF?", "", "APAGAR|ME DA MIEDO"),
      L("TECH SUPPORT", "HAVE YOU TRIED TURNING IT OFF?", "", "TURN OFF|I'M SCARED"), { weight: 1.3 }),
    P("dlg-cook", "dialog", "any", L("cocina.exe", "LET HIM COOK", "NO LITERALMENTE", "DEJARLE|APAGAR EL FUEGO"),
      L("kitchen.exe", "LET HIM COOK", "NOT LITERALLY", "LET HIM|PUT IT OUT"), { weight: 1.2 }),
    P("dlg-f", "dialog", "long", L("homenaje.exe", "PRESS F", "POR EL MANUAL DE SEGURIDAD", "F"),
      L("tribute.exe", "PRESS F", "FOR THE SAFETY MANUAL", "F"), { weight: 1.2 }),
    P("dlg-help", "dialog", "any", L("asistente.exe", "PARECE QUE INTENTAS EVITAR UNA FUSIÓN", "¿QUIERES AYUDA?", "SÍ|NO|ALETEAR"),
      L("assistant.exe", "IT LOOKS LIKE YOU'RE TRYING TO AVOID A MELTDOWN", "WOULD YOU LIKE HELP?", "YES|NO|FLAP")),
    P("dlg-save", "dialog", "any", L("reactor.doc", "¿GUARDAR CAMBIOS ANTES DE FUNDIRSE?", "", "GUARDAR|NO GUARDAR|HUIR"),
      L("reactor.doc", "SAVE CHANGES BEFORE MELTING?", "", "SAVE|DON'T SAVE|RUN")),
    P("dlg-abort", "dialog", "any", L("UNIDAD C:", "ERROR LEYENDO EL NÚCLEO", "", "ANULAR|REINTENTAR|ALETEAR"),
      L("DRIVE C:", "ERROR READING CORE", "", "ABORT|RETRY|FLAP")),
    P("dlg-still", "dialog", "long", L("streaming.exe", "¿SIGUES AHÍ?", "EL REACTOR, SÍ", "SÍ, POR DESGRACIA"),
      L("streaming.exe", "ARE YOU STILL WATCHING?", "THE REACTOR IS", "YES, SADLY")),
    P("dlg-sure", "dialog", "start", L("confirmar.exe", "¿SEGURO QUE QUIERES ENTRAR EN PÁNICO?", "", "SÍ|SÍ, PERO MÁS FUERTE"),
      L("confirm.exe", "ARE YOU SURE YOU WANT TO PANIC?", "", "YES|YES, BUT LOUDER")),
    /* ---- Barra de progreso que falla ---- */
    P("pr-ctrlz", "progress", "any", L("deshacer.exe", "CTRL + Z", "NO DESHACE FÍSICA"),
      L("undo.exe", "CTRL + Z", "IT DOESN'T UNDO PHYSICS"), { bar: 37, weight: 1.2 }),
    P("pr-9000", "progress", "any", L("sensor.exe", "IT'S OVER 9000!", "SENSOR: DRAMÁTICO"),
      L("sensor.exe", "IT'S OVER 9000!", "SENSOR: DRAMATIC"), { bar: 140, weight: 1.2 }),
    P("pr-task", "progress", "any", L("refrigeracion.exe", "ENFRIANDO EL NÚCLEO…", "TASK FAILED SUCCESSFULLY"),
      L("cooling.exe", "COOLING THE CORE…", "TASK FAILED SUCCESSFULLY"), { bar: 100, weight: 1.2 }),
    P("pr-ram", "progress", "any", L("descargas", "DESCARGANDO MÁS RAM…", "AHORA EL PATO ENTRA EN PÁNICO MÁS RÁPIDO"),
      L("downloads", "DOWNLOADING MORE RAM…", "NOW THE DUCK PANICS FASTER"), { bar: 100 }),
    P("pr-patch", "progress", "any", L("actualizar.exe", "PARCHE ANTIPÁNICO…", "REINICIO NECESARIO: EL PATO NO SE APAGA"),
      L("update.exe", "ANTI-PANIC PATCH…", "RESTART REQUIRED: THE DUCK WON'T TURN OFF"), { bar: 99 }),
    P("pr-backup", "progress", "long", L("copia.exe", "COPIA DE SEGURIDAD…", "COPIADO: 1 PATO. FALTA: TODO LO DEMÁS"),
      L("backup.exe", "BACKING UP…", "COPIED: 1 DUCK. MISSING: EVERYTHING ELSE"), { bar: 3 }),
    P("pr-solution", "progress", "any", L("soluciones.exe", "CARGANDO SOLUCIÓN…", "SOLUCIÓN NO ENCONTRADA. CARGANDO EXCUSA…"),
      L("solutions.exe", "LOADING SOLUTION…", "SOLUTION NOT FOUND. LOADING EXCUSE…"), { bar: 99 }),
    P("pr-coin", "progress", "any", L("continuar.exe", "INSERTE CAFÉ PARA CONTINUAR", "SALDO: 0 CAFÉS"),
      L("continue.exe", "INSERT COFFEE TO CONTINUE", "BALANCE: 0 COFFEES"), { bar: 12 }),

    /* ===================== FRASES DE SUSCRIPCIÓN (60) ===================== */
    /* ---- 1 · Ayuda en progreso: sigue CRITICAL (agradece sin anunciar el final) ---- */
    S("s-c01", "tecnica", "critical", "one", "{name} NOS COMPRÓ UNOS SEGUNDOS.", "{name} BOUGHT US A FEW SECONDS."),
    S("s-c02", "tecnica", "critical", "any", "REFRIGERANTE PATROCINADO. MILAGRO PENDIENTE.", "COOLANT SPONSORED. MIRACLE PENDING."),
    S("s-c03", "gamer", "critical", "one", "{name} ACTIVÓ EL PLOT ARMOR.", "{name} ACTIVATED PLOT ARMOR."),
    S("s-c04", "pato", "critical", "any", "EL PATO SIGUE EN MODO PÁNICO.", "THE DUCK IS STILL IN PANIC MODE."),
    S("s-c05", "heroe", "critical", "one", "{name} ENTRÓ EN LA SALA DE MÁQUINAS CON UN CUBO.", "{name} WALKED INTO THE ENGINE ROOM WITH A BUCKET."),
    S("s-c06", "tecnica", "critical", "any", "REFUERZOS RECIBIDOS. EL NÚCLEO NO SE HA ENTERADO.", "REINFORCEMENTS IN. THE CORE HASN'T NOTICED."),
    S("s-c07", "gamer", "critical", "one", "{name} ENTRA EN LA PARTIDA. DIFICULTAD: PESADILLA.", "{name} JOINS THE GAME. DIFFICULTY: NIGHTMARE."),
    S("s-c08", "heroe", "critical", "one", "{name} SUJETA LA PUERTA DEL REACTOR.", "{name} IS HOLDING THE REACTOR DOOR."),
    S("s-c09", "pato", "critical", "any", "AYUDA RECIBIDA. EL PÁNICO, DE MOMENTO, TAMBIÉN.", "HELP RECEIVED. THE PANIC STAYS, FOR NOW."),
    S("s-c10", "heroe", "critical", "one", "{name} HA PAUSADO EL APOCALIPSIS. MÁS O MENOS.", "{name} PAUSED THE APOCALYPSE. SORT OF."),
    S("s-c11", "tecnica", "critical", "one", "{name} TIRÓ DE LA PALANCA CORRECTA. CREEMOS.", "{name} PULLED THE RIGHT LEVER. WE THINK."),
    S("s-c12", "pato", "critical", "any", "EL TERMÓMETRO SE CALMA. EL PATO, NO.", "THE THERMOMETER CALMS DOWN. THE DUCK DOESN'T."),
    S("s-c13", "gamer", "critical", "one", "{name} SE UNE COMO SEGUNDO JUGADOR.", "{name} JOINS AS PLAYER TWO."),
    S("s-c14", "heroe", "critical", "one", "{name} TRAJO EL EXTINTOR BUENO.", "{name} BROUGHT THE GOOD EXTINGUISHER."),
    S("s-cg1", "equipo", "critical", "group", "{name} SE HAN ORGANIZADO. EL PATO, NO.", "{name} GOT ORGANIZED. THE DUCK DIDN'T."),
    S("s-cg2", "equipo", "critical", "group", "EL CHAT FORMA UNA CADENA DE CUBOS.", "CHAT FORMED A BUCKET BRIGADE."),
    S("s-cg3", "tecnica", "critical", "group", "{name} TIRAN TODOS DE LA MISMA PALANCA.", "{name} ARE ALL PULLING THE SAME LEVER."),
    S("s-cg4", "equipo", "critical", "group", "ESFUERZO COLECTIVO. PÁNICO INDIVIDUAL.", "TEAM EFFORT. SOLO PANIC."),
    S("s-cg5", "heroe", "critical", "group", "{name} HAN ABIERTO TODAS LAS VÁLVULAS.", "{name} OPENED EVERY VALVE."),
    S("s-cg6", "gamer", "critical", "group", "RAID DE REFRIGERANTE EN CURSO.", "COOLANT RAID IN PROGRESS."),
    /* ---- 2 · Recuperación: salió de CRITICAL ---- */
    S("s-r01", "gamer", "recovery", "one", "{name} SALVÓ LA RUN.", "{name} SAVED THE RUN."),
    S("s-r02", "gamer", "recovery", "one", "{name} ACABA DE NERFEAR EL REACTOR.", "{name} JUST NERFED THE REACTOR."),
    S("s-r03", "gamer", "recovery", "one", "{name} DESBLOQUEÓ EL FINAL BUENO.", "{name} UNLOCKED THE GOOD ENDING."),
    S("s-r04", "heroe", "recovery", "one", "{name} HIZO LO QUE EL MANUAL NO PUDO.", "{name} DID WHAT THE MANUAL COULDN'T."),
    S("s-r05", "gamer", "recovery", "one", "{name} HIZO UN CLUTCH TÉRMICO.", "{name} PULLED OFF A THERMAL CLUTCH."),
    S("s-r06", "pato", "recovery", "any", "CRISIS CONTENIDA. EL PATO PREFIERE NO HABLAR DEL TEMA.", "CRISIS CONTAINED. THE DUCK WOULD RATHER NOT TALK ABOUT IT."),
    S("s-r07", "tecnica", "recovery", "one", "{name} LE HA BAJADO LA FIEBRE AL NÚCLEO.", "{name} BROKE THE CORE'S FEVER."),
    S("s-r08", "oficina", "recovery", "one", "{name} HA REESCRITO EL INFORME DE INCIDENTES.", "{name} REWROTE THE INCIDENT REPORT."),
    S("s-r09", "oficina", "recovery", "one", "FUSIÓN CANCELADA. GRACIAS, {name}.", "MELTDOWN CANCELLED. THANKS, {name}."),
    S("s-r10", "tecnica", "recovery", "one", "{name} HA ARREGLADO LA FÍSICA.", "{name} FIXED PHYSICS."),
    S("s-r11", "pato", "recovery", "any", "NÚCLEO ESTABLE. PATO, EN REVISIÓN.", "CORE STABLE. DUCK UNDER REVIEW."),
    S("s-r12", "heroe", "recovery", "one", "{name} ES EL HÉROE QUE ESTE TURNO NECESITABA.", "{name} IS THE HERO THIS SHIFT NEEDED."),
    S("s-r13", "tecnica", "recovery", "one", "{name} ENCONTRÓ EL BOTÓN DE ENFRIAR. EXISTÍA.", "{name} FOUND THE COOL-DOWN BUTTON. IT EXISTED."),
    S("s-r14", "gamer", "recovery", "one", "{name} LE HA GANADO LA PARTIDA AL TERMÓMETRO.", "{name} JUST BEAT THE THERMOMETER."),
    S("s-rg1", "gamer", "recovery", "group", "{name} SALVARON LA RUN.", "{name} SAVED THE RUN."),
    S("s-rg2", "pato", "recovery", "group", "VICTORIA COLECTIVA. EL PATO SE APUNTA EL MÉRITO.", "TEAM VICTORY. THE DUCK TAKES THE CREDIT."),
    S("s-rg3", "gamer", "recovery", "group", "{name} HAN NERFEADO EL REACTOR EN EQUIPO.", "{name} NERFED THE REACTOR AS A TEAM."),
    S("s-rg4", "equipo", "recovery", "group", "EL CHAT HIZO UN CLUTCH TÉRMICO.", "CHAT PULLED OFF A THERMAL CLUTCH."),
    S("s-rg5", "gamer", "recovery", "group", "{name} DESBLOQUEARON EL FINAL BUENO.", "{name} UNLOCKED THE GOOD ENDING."),
    S("s-rg6", "oficina", "recovery", "group", "CRISIS RESUELTA POR COMITÉ. POR UNA VEZ, FUNCIONÓ.", "CRISIS SOLVED BY COMMITTEE. FOR ONCE, IT WORKED."),
    /* ---- 3 · Normalidad: el reactor ya estaba seguro ---- */
    S("s-n01", "pato", "normal", "one", "{name} COMPRÓ TIEMPO. EL PATO COMPRÓ CAFÉ.", "{name} BOUGHT TIME. THE DUCK BOUGHT COFFEE."),
    S("s-n02", "oficina", "normal", "one", "{name}: SOPORTE TÉCNICO. EL PATO: SOPORTE EMOCIONAL.", "{name}: TECH SUPPORT. THE DUCK: EMOTIONAL SUPPORT."),
    S("s-n03", "oficina", "normal", "one", "CAFÉ AUTORIZADO POR {name}.", "COFFEE AUTHORIZED BY {name}."),
    S("s-n04", "oficina", "normal", "one", "{name} HA RENOVADO EL CONTRATO DE ESTE PATO.", "{name} RENEWED THIS DUCK'S CONTRACT."),
    S("s-n05", "oficina", "normal", "one", "{name} SE APUNTA AL TURNO DE NOCHE.", "{name} SIGNED UP FOR THE NIGHT SHIFT."),
    S("s-n06", "tecnica", "normal", "any", "MANTENIMIENTO PREVENTIVO: PATROCINADO.", "PREVENTIVE MAINTENANCE: SPONSORED."),
    S("s-n07", "tecnica", "normal", "one", "{name} HA LLENADO LA NEVERA DEL REACTOR.", "{name} STOCKED THE REACTOR FRIDGE."),
    S("s-n08", "pato", "normal", "any", "EL PATO HA SIDO ASCENDIDO A PATO.", "THE DUCK HAS BEEN PROMOTED TO DUCK."),
    S("s-n09", "oficina", "normal", "one", "{name} SE UNE A LA PLANTILLA. TURNO DE CAFÉ: AHORA.", "{name} JOINS THE STAFF. COFFEE SHIFT: NOW."),
    S("s-n10", "oficina", "normal", "one", "{name} YA ES PERSONAL AUTORIZADO.", "{name} IS NOW AUTHORIZED PERSONNEL."),
    S("s-n11", "pato", "normal", "one", "NÚCLEO TRANQUILO. PATO TRANQUILO. {name}, LEGENDARIO.", "CALM CORE. CALM DUCK. LEGENDARY {name}."),
    S("s-n12", "tecnica", "normal", "one", "{name} HA MEJORADO EL AIRE ACONDICIONADO.", "{name} UPGRADED THE AIR CONDITIONING."),
    S("s-n13", "heroe", "normal", "one", "{name} ACABA DE EVITAR UNA CRISIS QUE NO EXISTÍA.", "{name} JUST PREVENTED A CRISIS THAT DIDN'T EXIST."),
    S("s-n14", "oficina", "normal", "one", "{name} SUMA UN DÍA SIN INCIDENTES.", "{name} ADDS ONE DAY WITHOUT INCIDENTS."),
    S("s-ng1", "oficina", "normal", "group", "{name} HAN RENOVADO EL CONTRATO DE ESTE PATO.", "{name} RENEWED THIS DUCK'S CONTRACT."),
    S("s-ng2", "equipo", "normal", "group", "PLANTILLA AMPLIADA. EL PATO YA NO TRABAJA SOLO.", "STAFF EXPANDED. THE DUCK NO LONGER WORKS ALONE."),
    S("s-ng3", "oficina", "normal", "group", "CAFÉ PARA TODA LA PLANTILLA.", "COFFEE FOR THE WHOLE STAFF."),
    S("s-ng4", "equipo", "normal", "group", "{name} SE HAN UNIDO AL TURNO.", "{name} JOINED THE SHIFT."),
    S("s-ng5", "oficina", "normal", "group", "REUNIÓN DE EQUIPO. ÚNICO PUNTO DEL DÍA: CAFÉ.", "TEAM MEETING. ONLY AGENDA ITEM: COFFEE."),
    S("s-ng6", "equipo", "normal", "group", "EL CHAT HA FUNDADO UN DEPARTAMENTO DE REFRIGERACIÓN.", "CHAT JUST FOUNDED A COOLING DEPARTMENT."),

    /* ===================== REMATES DE CAFÉ (15) ===================== */
    K("k01", "cafeina", "after", "CRISIS CANCELADA. CAFÉ AUTORIZADO.", "CRISIS CANCELLED. COFFEE AUTHORIZED."),
    K("k02", "cafeina", "after", "EL REACTOR SE ENFRÍA. EL CAFÉ NO.", "THE REACTOR COOLS DOWN. THE COFFEE DOESN'T."),
    K("k03", "calma", "any", "VOLVIENDO A NO HACER NADA.", "BACK TO DOING NOTHING."),
    K("k04", "cafeina", "after", "OTRO DÍA SALVADO POR LA CAFEÍNA.", "ANOTHER DAY SAVED BY CAFFEINE."),
    K("k05", "protocolo", "after", "INFORME DEL INCIDENTE: MANCHA DE CAFÉ.", "INCIDENT REPORT: COFFEE STAIN."),
    K("k06", "protocolo", "after", "PROTOCOLO POSCRISIS. PASO 1: CAFÉ.", "POST-CRISIS PROTOCOL. STEP 1: COFFEE."),
    K("k07", "protocolo", "after", "PÁNICO ARCHIVADO. CAFÉ SERVIDO.", "PANIC ARCHIVED. COFFEE SERVED."),
    K("k08", "calma", "after", "EL NÚCLEO DESCANSA. EL PATO TAMBIÉN.", "THE CORE RESTS. SO DOES THE DUCK."),
    K("k09", "calma", "after", "AQUÍ NO HA PASADO NADA. NADA.", "NOTHING HAPPENED HERE. NOTHING."),
    K("k10", "cafeina", "calm", "REFRIGERANTE DE SOBRA. PAUSA PARA CAFÉ.", "COOLANT TO SPARE. COFFEE BREAK."),
    K("k11", "calma", "calm", "TODO EN ORDEN. POR SI ACASO, CAFÉ.", "ALL GOOD. COFFEE, JUST IN CASE."),
    K("k12", "calma", "calm", "TURNO TRANQUILO. CAFÉ MERECIDO.", "QUIET SHIFT. WELL-EARNED COFFEE."),
    K("k13", "protocolo", "calm", "MANTENIMIENTO PREVENTIVO: CAFÉ.", "PREVENTIVE MAINTENANCE: COFFEE."),
    K("k14", "cafeina", "calm", "NADA QUE ENFRIAR. SALVO EL CAFÉ.", "NOTHING TO COOL. EXCEPT THE COFFEE."),
    K("k15", "cafeina", "calm", "LA CAFEÍNA CUENTA COMO REFRIGERANTE. SEGÚN EL PATO.", "CAFFEINE COUNTS AS COOLANT. ACCORDING TO THE DUCK."),
  ];

  // Preset principal (humor seco, etapa 14): las entradas genéricas (referencias
  // sueltas a memes) se conservan pero quedan desactivadas por defecto.
  const GENERIC = ["err-fine", "err-surprised", "err-houston", "err-keyboard", "hk-imin", "hk-rabbit", "hk-mainframe", "ach-speedrun", "ach-sauna", "ach-hold", "ach-skill", "ach-emotional", "ach-highscore", "dlg-cook", "dlg-f", "dlg-help", "dlg-sure", "pr-9000", "pr-ram", "pr-coin"];
  entries.forEach((e) => { if (GENERIC.includes(e.id)) e.on = false; });
  window.DUCK_REACTOR_GENERIC_POPUPS = GENERIC;

  cfg.catalog = {
    /*
     * Ventanas de crisis durante CRITICAL (segundos de simulación):
     *   minWindows/maxWindows  ventanas por secuencia (máx. 3 visibles)
     *   stagger    separación entre ventanas · punchAt: cuándo sale el remate de cada una
     *   read       tiempo de lectura tras la última · restMin/restMax: descanso entre secuencias
     *   tricks     probabilidad de un truco (una ventana intenta cerrar otra y falla)
     *   longAfter  a partir de cuántos s de crisis entran las entradas «crisis larga»
     *   firstDelay espera antes de la primera secuencia
     *   mode       guiones (principal: tres secuencias de humor seco) · catalogo (ventanas sueltas del catálogo)
     *   guionRest  segundos de descanso entre dos guiones durante el mismo CRITICAL
     *   preset     sutil · normal · caos · custom
     *   minPx      tamaño mínimo de texto EN PANTALLA (px reales): lo que no se
     *              leería a ese tamaño no sale (menos ventanas o una grande)
     */
    popups: { enabled: true, preset: "normal", minWindows: 2, maxWindows: 3, stagger: 2.4, punchAt: 1.3, read: 5, restMin: 8, restMax: 13, tricks: 0.35, longAfter: 25, firstDelay: 1.2, minPx: 12,
      mode: "guiones", guionRest: 28, guiones: { sop: true, asis: true, corp: true } },
    entries,
  };
})();

;
/* ---- src/i18n_catalog.js ---- */
/*
 * Duck Reactor — catálogo de memes en portugués (Portugal), alemán y francés (etapa 15).
 * Se carga después de catalog_data.js. Completa las variantes que falten de las
 * entradas originales (por id), sin tocar las que ya tengan texto.
 * Formato: id: { idioma: [title, main, sub, btns] }.
 */
(function () {
  "use strict";
  const cfg = window.DUCK_REACTOR_CONFIG;
  if (!cfg || !cfg.catalog || !Array.isArray(cfg.catalog.entries)) return;
  const X = {
    "err-404": {"pt-PT": ["refrigerante.sys", "ERROR 404: REFRIGERANTE NOT FOUND", "O PATO TAMBÉM NÃO O ENCONTRA", "OK"], "de": ["kuehlung.sys", "FEHLER 404: KÜHLMITTEL NICHT GEFUNDEN", "DIE ENTE FINDET ES AUCH NICHT", "OK"], "fr": ["refroidissement.sys", "ERREUR 404 : RÉFRIGÉRANT NOT FOUND", "LE CANARD NE LE TROUVE PAS NON PLUS", "OK"]},
    "err-fine": {"pt-PT": ["estado.exe", "THIS IS FINE", "O PATO DISCORDA", "OK"], "de": ["status.exe", "THIS IS FINE", "DIE ENTE SIEHT DAS ANDERS", "OK"], "fr": ["etat.exe", "THIS IS FINE", "LE CANARD N'EST PAS D'ACCORD", "OK"]},
    "err-onejob": {"pt-PT": ["turno.log", "YOU HAD ONE JOB", "ERA VIGIAR A TEMPERATURA", "EU SEI"], "de": ["schicht.log", "YOU HAD ONE JOB", "UND ZWAR: TEMPERATUR IM AUGE BEHALTEN", "ICH WEISS"], "fr": ["service.log", "YOU HAD ONE JOB", "C'ÉTAIT DE SURVEILLER LA TEMPÉRATURE", "JE SAIS"]},
    "err-fatal": {"pt-PT": ["nucleo.exe", "EXCEÇÃO FATAL 0xQUAQUA", "O NÚCLEO EXECUTOU UMA OPERAÇÃO ILEGAL", "OK→ACEITA O TEU DESTINO"], "de": ["kern.exe", "SCHWERER AUSNAHMEFEHLER 0xQUAK", "DER KERN HAT EINE UNZULÄSSIGE OPERATION DURCHGEFÜHRT", "OK→SCHICKSAL AKZEPTIEREN"], "fr": ["coeur.exe", "EXCEPTION FATALE 0xCOINCOIN", "LE CŒUR A EFFECTUÉ UNE OPÉRATION NON CONFORME", "OK→ACCEPTEZ VOTRE DESTIN"]},
    "err-keyboard": {"pt-PT": ["BIOS", "TECLADO NÃO DETETADO", "PRIMA F1 PARA ARREFECER O NÚCLEO", "F1"], "de": ["BIOS", "TASTATUR NICHT GEFUNDEN", "F1 DRÜCKEN, UM DEN KERN ZU KÜHLEN", "F1"], "fr": ["BIOS", "CLAVIER NON DÉTECTÉ", "APPUYEZ SUR F1 POUR REFROIDIR LE CŒUR", "F1"]},
    "err-feature": {"pt-PT": ["ocorrencias.txt", "NÃO É UM BUG", "É AQUECIMENTO CENTRAL", "FECHAR PEDIDO"], "de": ["tickets.txt", "DAS IST KEIN BUG", "DAS IST FERNWÄRME", "TICKET SCHLIESSEN"], "fr": ["tickets.txt", "CE N'EST PAS UN BUG", "C'EST LE CHAUFFAGE CENTRAL", "FERMER LE TICKET"]},
    "err-surprised": {"pt-PT": ["processos", "SURPRISED_PATO.EXE", "RESPOSTA: ESVOAÇAR", "OK"], "de": ["prozesse", "SURPRISED_ENTE.EXE", "REAKTION: FLATTERN", "OK"], "fr": ["processus", "CANARD_SURPRIS.EXE", "RÉPONSE : BATTRE DES AILES", "OK"]},
    "err-houston": {"pt-PT": ["comunicações", "HOUSTON, TEMOS UM PATO", "E O PATO TEM UM PROBLEMA", "RECEBIDO"], "de": ["funk", "HOUSTON, WIR HABEN EINE ENTE", "UND DIE ENTE HAT EIN PROBLEM", "VERSTANDEN"], "fr": ["transmissions", "HOUSTON, ON A UN CANARD", "ET LE CANARD A UN PROBLÈME", "BIEN REÇU"]},
    "hk-cuack": {"pt-PT": ["root@reactor:~", "HACKING…", "ACESSO NEGADO: PALAVRA-PASSE 'QUAQUA123'", ""], "de": ["root@reactor:~", "HACKING…", "ZUGRIFF VERWEIGERT: PASSWORT 'QUAK123'", ""], "fr": ["root@reactor:~", "HACKING…", "ACCÈS REFUSÉ : MOT DE PASSE « COINCOIN123 »", ""]},
    "hk-sudo": {"pt-PT": ["root@reactor:~", "sudo arrefecer --nucleo", "O PATO NÃO ESTÁ NOS SUDOERS. INCIDENTE REPORTADO.", ""], "de": ["root@reactor:~", "sudo kuehlen --kern", "ENTE IST NICHT IN DER SUDOERS-DATEI. VORFALL WIRD GEMELDET.", ""], "fr": ["root@reactor:~", "sudo refroidir --coeur", "LE CANARD N'EST PAS DANS SUDOERS. INCIDENT SIGNALÉ.", ""]},
    "hk-imin": {"pt-PT": ["root@reactor:~", "ESTOU DENTRO.", "DA SALA DO CAFÉ", ""], "de": ["root@reactor:~", "ICH BIN DRIN.", "IN DER KAFFEEKÜCHE", ""], "fr": ["root@reactor:~", "JE SUIS DEDANS.", "DANS LA SALLE DE PAUSE", ""]},
    "hk-rm": {"pt-PT": ["root@reactor:~", "rm -rf /calor", "PERMISSÃO NEGADA: O CALOR É UM FICHEIRO DE SISTEMA", ""], "de": ["root@reactor:~", "rm -rf /hitze", "ZUGRIFF VERWEIGERT: HITZE IST EINE SYSTEMDATEI", ""], "fr": ["root@reactor:~", "rm -rf /chaleur", "PERMISSION REFUSÉE : LA CHALEUR EST UN FICHIER SYSTÈME", ""]},
    "hk-rabbit": {"pt-PT": ["root@reactor:~", "SEGUE O COELHO BRANCO…", "SÓ HÁ UM PATO, E ESTÁ EM PÂNICO", ""], "de": ["root@reactor:~", "FOLGE DEM WEISSEN KANINCHEN…", "DA IST NUR EINE ENTE. UND DIE HAT PANIK.", ""], "fr": ["root@reactor:~", "SUIS LE LAPIN BLANC…", "IL N'Y A QU'UN CANARD, ET IL PANIQUE", ""]},
    "hk-firewall": {"pt-PT": ["root@reactor:~", "DESATIVAR CORTA-FOGO: OK", "AGORA É SÓ FOGO", ""], "de": ["root@reactor:~", "FIREWALL DEAKTIVIEREN: OK", "DIE WALL IST WEG. DAS FIRE BLEIBT.", ""], "fr": ["root@reactor:~", "DÉSACTIVER LE PARE-FEU : OK", "IL NE RESTE PLUS QUE LE FEU", ""]},
    "hk-mainframe": {"pt-PT": ["root@reactor:~", "A ACEDER AO MAINFRAME…", "O MAINFRAME É UMA TORRADEIRA", ""], "de": ["root@reactor:~", "ZUGRIFF AUF DEN MAINFRAME…", "DER MAINFRAME IST EIN TOASTER", ""], "fr": ["root@reactor:~", "ACCÈS AU MAINFRAME…", "LE MAINFRAME EST UN GRILLE-PAIN", ""]},
    "hk-ping": {"pt-PT": ["root@reactor:~", "ping refrigerante.local", "TEMPO ESGOTADO. A PACIÊNCIA DO PATO TAMBÉM.", ""], "de": ["root@reactor:~", "ping kuehlmittel.local", "ZEITÜBERSCHREITUNG. DIE GEDULD DER ENTE IST AUCH ABGELAUFEN.", ""], "fr": ["root@reactor:~", "ping refrigerant.local", "DÉLAI D'ATTENTE DÉPASSÉ. LA PATIENCE DU CANARD AUSSI.", ""]},
    "ach-global": {"pt-PT": ["CONQUISTA DESBLOQUEADA", "AQUECIMENTO GLOBAL LOCAL", "PASSA O LIMITE SEM TE LEVANTARES DA CADEIRA", ""], "de": ["ERFOLG FREIGESCHALTET", "LOKALE ERDERWÄRMUNG", "SPRENGE DAS LIMIT, OHNE VOM STUHL AUFZUSTEHEN", ""], "fr": ["SUCCÈS DÉVERROUILLÉ", "RÉCHAUFFEMENT GLOBAL LOCAL", "DÉPASSER LA LIMITE SANS QUITTER SA CHAISE", ""]},
    "ach-speedrun": {"pt-PT": ["CONQUISTA DESBLOQUEADA", "SPEEDRUN ANY% DE FUSÃO", "NOVO RECORDE PESSOAL", ""], "de": ["ERFOLG FREIGESCHALTET", "KERNSCHMELZE ANY% SPEEDRUN", "NEUE PERSÖNLICHE BESTZEIT", ""], "fr": ["SUCCÈS DÉVERROUILLÉ", "FUSION DU CŒUR EN SPEEDRUN ANY%", "NOUVEAU RECORD PERSONNEL", ""]},
    "ach-sauna": {"pt-PT": ["CONQUISTA DESBLOQUEADA", "SAUNA PROFISSIONAL", "CHEGA A CRÍTICO COM O CAFÉ NA MÃO", ""], "de": ["ERFOLG FREIGESCHALTET", "PROFI-SAUNA", "ERREICHE STUFE KRITISCH MIT KAFFEE IN DER HAND", ""], "fr": ["SUCCÈS DÉVERROUILLÉ", "SAUNA PROFESSIONNEL", "ATTEINDRE LE NIVEAU CRITIQUE, CAFÉ EN MAIN", ""]},
    "ach-hold": {"pt-PT": ["CONQUISTA DESBLOQUEADA", "SEGURA-ME AQUI O CAFÉ", "TENTA RESOLVER ISTO COM AS ASAS", ""], "de": ["ERFOLG FREIGESCHALTET", "HALT MAL MEINEN KAFFEE", "VERSUCH, ES MIT DEN FLÜGELN ZU REPARIEREN", ""], "fr": ["SUCCÈS DÉVERROUILLÉ", "TIENS MON CAFÉ", "TENTER DE RÉPARER ÇA AVEC SES AILES", ""]},
    "ach-skill": {"pt-PT": ["CONQUISTA DESBLOQUEADA", "SKILL ISSUE TÉRMICO", "PERDE CONTRA UM TERMÓMETRO", ""], "de": ["ERFOLG FREIGESCHALTET", "THERMISCHES SKILL ISSUE", "VERLIERE GEGEN EIN THERMOMETER", ""], "fr": ["SUCCÈS DÉVERROUILLÉ", "SKILL ISSUE THERMIQUE", "PERDRE CONTRE UN THERMOMÈTRE", ""]},
    "ach-emotional": {"pt-PT": ["CONQUISTA DESBLOQUEADA", "DANO EMOCIONAL", "O NÚCLEO CHAMOU-TE «ESTAGIÁRIO»", ""], "de": ["ERFOLG FREIGESCHALTET", "EMOTIONALER SCHADEN", "DER KERN HAT DICH „PRAKTIKANT“ GENANNT", ""], "fr": ["SUCCÈS DÉVERROUILLÉ", "DÉGÂTS ÉMOTIONNELS", "SE FAIRE TRAITER DE « STAGIAIRE » PAR LE CŒUR", ""]},
    "ach-highscore": {"pt-PT": ["CONQUISTA DESBLOQUEADA", "NOVO RECORDE", "TEMPERATURA MAIS ALTA DO TURNO", ""], "de": ["ERFOLG FREIGESCHALTET", "NEUER HIGHSCORE", "HÖCHSTE TEMPERATUR DER SCHICHT", ""], "fr": ["SUCCÈS DÉVERROUILLÉ", "NOUVEAU RECORD", "TEMPÉRATURE LA PLUS ÉLEVÉE DU SERVICE", ""]},
    "ach-hardmode": {"pt-PT": ["CONQUISTA DESBLOQUEADA", "MODO DIFÍCIL", "AGUENTA EM CRÍTICO MAIS DO QUE É RECOMENDÁVEL", ""], "de": ["ERFOLG FREIGESCHALTET", "HARD MODE", "BLEIB LÄNGER AUF KRITISCH ALS EMPFOHLEN", ""], "fr": ["SUCCÈS DÉVERROUILLÉ", "MODE DIFFICILE", "RESTER EN CRITIQUE PLUS LONGTEMPS QUE CONSEILLÉ", ""]},
    "dlg-off": {"pt-PT": ["APOIO TÉCNICO", "HAVE YOU TRIED TURNING IT OFF?", "", "DESLIGAR|TENHO MEDO"], "de": ["TECHNISCHER SUPPORT", "HAVE YOU TRIED TURNING IT OFF?", "", "AUSSCHALTEN|ICH HAB ANGST"], "fr": ["SUPPORT TECHNIQUE", "HAVE YOU TRIED TURNING IT OFF?", "", "ÉTEINDRE|J'AI PEUR"]},
    "dlg-cook": {"pt-PT": ["cozinha.exe", "LET HIM COOK", "NÃO É PARA LEVAR À LETRA", "DEIXA-O|APAGAR O FOGO"], "de": ["kueche.exe", "LET HIM COOK", "NICHT WÖRTLICH", "LASS IHN|LÖSCHEN"], "fr": ["cuisine.exe", "LET HIM COOK", "PAS AU SENS PROPRE", "LE LAISSER|ÉTEINDRE LE FEU"]},
    "dlg-f": {"pt-PT": ["homenagem.exe", "PRESS F", "PELO MANUAL DE SEGURANÇA", "F"], "de": ["gedenken.exe", "PRESS F", "FÜR DAS SICHERHEITSHANDBUCH", "F"], "fr": ["hommage.exe", "PRESS F", "POUR LE MANUEL DE SÉCURITÉ", "F"]},
    "dlg-help": {"pt-PT": ["assistente.exe", "PARECE QUE ESTÁS A TENTAR EVITAR UMA FUSÃO", "QUERES AJUDA?", "SIM|NÃO|ESVOAÇAR"], "de": ["assistent.exe", "SIE WOLLEN ANSCHEINEND EINE KERNSCHMELZE VERHINDERN", "MÖCHTEN SIE HILFE?", "JA|NEIN|FLATTERN"], "fr": ["assistant.exe", "IL SEMBLE QUE VOUS ESSAYIEZ D'ÉVITER UNE FUSION", "VOULEZ-VOUS DE L'AIDE ?", "OUI|NON|BATTRE DES AILES"]},
    "dlg-save": {"pt-PT": ["reator.doc", "GUARDAR ALTERAÇÕES ANTES DE DERRETER?", "", "GUARDAR|NÃO GUARDAR|FUGIR"], "de": ["reaktor.doc", "ÄNDERUNGEN VOR DEM SCHMELZEN SPEICHERN?", "", "SPEICHERN|NICHT SPEICHERN|FLÜCHTEN"], "fr": ["reacteur.doc", "ENREGISTRER LES MODIFICATIONS AVANT DE FONDRE ?", "", "ENREGISTRER|NE PAS ENREGISTRER|FUIR"]},
    "dlg-abort": {"pt-PT": ["UNIDADE C:", "ERRO AO LER O NÚCLEO", "", "ANULAR|REPETIR|ESVOAÇAR"], "de": ["LAUFWERK C:", "FEHLER BEIM LESEN DES KERNS", "", "ABBRECHEN|WIEDERHOLEN|FLATTERN"], "fr": ["LECTEUR C:", "ERREUR DE LECTURE DU CŒUR", "", "ABANDONNER|RECOMMENCER|BATTRE DES AILES"]},
    "dlg-still": {"pt-PT": ["streaming.exe", "AINDA ESTÁS AÍ?", "O REATOR, SIM", "SIM, INFELIZMENTE"], "de": ["streaming.exe", "SCHAUST DU NOCH?", "DER REAKTOR SCHON", "JA, LEIDER"], "fr": ["streaming.exe", "VOUS ÊTES TOUJOURS LÀ ?", "LE RÉACTEUR, OUI", "OUI, HÉLAS"]},
    "dlg-sure": {"pt-PT": ["confirmar.exe", "TENS A CERTEZA DE QUE QUERES ENTRAR EM PÂNICO?", "", "SIM|SIM, MAS MAIS ALTO"], "de": ["bestaetigen.exe", "MÖCHTEN SIE WIRKLICH IN PANIK GERATEN?", "", "JA|JA, ABER LAUTER"], "fr": ["confirmer.exe", "VOULEZ-VOUS VRAIMENT PANIQUER ?", "", "OUI|OUI, MAIS PLUS FORT"]},
    "pr-ctrlz": {"pt-PT": ["anular.exe", "CTRL + Z", "NÃO ANULA A FÍSICA", ""], "de": ["rueckgaengig.exe", "CTRL + Z", "PHYSIK LÄSST SICH NICHT RÜCKGÄNGIG MACHEN", ""], "fr": ["annuler.exe", "CTRL + Z", "ÇA N'ANNULE PAS LA PHYSIQUE", ""]},
    "pr-9000": {"pt-PT": ["sensor.exe", "IT'S OVER 9000!", "SENSOR: DRAMÁTICO", ""], "de": ["sensor.exe", "IT'S OVER 9000!", "SENSOR: DRAMATISCH", ""], "fr": ["capteur.exe", "IT'S OVER 9000!", "CAPTEUR : UN BRIN THÉÂTRAL", ""]},
    "pr-task": {"pt-PT": ["arrefecimento.exe", "A ARREFECER O NÚCLEO…", "TASK FAILED SUCCESSFULLY", ""], "de": ["kuehlung.exe", "KERN WIRD GEKÜHLT…", "TASK FAILED SUCCESSFULLY", ""], "fr": ["refroidissement.exe", "REFROIDISSEMENT DU CŒUR…", "TASK FAILED SUCCESSFULLY", ""]},
    "pr-ram": {"pt-PT": ["transferências", "A TRANSFERIR MAIS RAM…", "AGORA O PATO ENTRA EM PÂNICO MAIS DEPRESSA", ""], "de": ["downloads", "LADE MEHR RAM HERUNTER…", "JETZT HAT DIE ENTE SCHNELLER PANIK", ""], "fr": ["telechargements", "TÉLÉCHARGEMENT DE RAM SUPPLÉMENTAIRE…", "LE CANARD PANIQUE DÉSORMAIS PLUS VITE", ""]},
    "pr-patch": {"pt-PT": ["atualizar.exe", "CORREÇÃO ANTIPÂNICO…", "REINÍCIO NECESSÁRIO: O PATO NÃO SE DESLIGA", ""], "de": ["update.exe", "ANTI-PANIK-PATCH…", "NEUSTART ERFORDERLICH: DIE ENTE LÄSST SICH NICHT AUSSCHALTEN", ""], "fr": ["mise_a_jour.exe", "CORRECTIF ANTIPANIQUE…", "REDÉMARRAGE REQUIS : LE CANARD NE S'ÉTEINT PAS", ""]},
    "pr-backup": {"pt-PT": ["copia.exe", "CÓPIA DE SEGURANÇA…", "COPIADO: 1 PATO. EM FALTA: TUDO O RESTO", ""], "de": ["backup.exe", "BACKUP LÄUFT…", "KOPIERT: 1 ENTE. FEHLT: ALLES ANDERE", ""], "fr": ["sauvegarde.exe", "SAUVEGARDE EN COURS…", "COPIÉ : 1 CANARD. MANQUANT : TOUT LE RESTE", ""]},
    "pr-solution": {"pt-PT": ["solucoes.exe", "A CARREGAR SOLUÇÃO…", "SOLUÇÃO NÃO ENCONTRADA. A CARREGAR DESCULPA…", ""], "de": ["loesungen.exe", "LADE LÖSUNG…", "KEINE LÖSUNG GEFUNDEN. LADE AUSREDE…", ""], "fr": ["solutions.exe", "CHARGEMENT DE LA SOLUTION…", "SOLUTION INTROUVABLE. CHARGEMENT D'UNE EXCUSE…", ""]},
    "pr-coin": {"pt-PT": ["continuar.exe", "INSIRA CAFÉ PARA CONTINUAR", "SALDO: 0 CAFÉS", ""], "de": ["weiter.exe", "KAFFEE EINWERFEN, UM FORTZUFAHREN", "GUTHABEN: 0 KAFFEE", ""], "fr": ["continuer.exe", "INSÉREZ UN CAFÉ POUR CONTINUER", "SOLDE : 0 CAFÉ", ""]},
    "s-c01": {"pt-PT": ["", "{name} GANHOU-NOS MAIS UNS SEGUNDOS.", "", ""], "de": ["", "{name} HAT UNS EIN PAAR SEKUNDEN ERKAUFT.", "", ""], "fr": ["", "{name} NOUS A FAIT GAGNER QUELQUES SECONDES.", "", ""]},
    "s-c02": {"pt-PT": ["", "REFRIGERANTE PATROCINADO. MILAGRE PENDENTE.", "", ""], "de": ["", "KÜHLMITTEL GESPONSERT. WUNDER STEHT NOCH AUS.", "", ""], "fr": ["", "RÉFRIGÉRANT SPONSORISÉ. MIRACLE EN ATTENTE.", "", ""]},
    "s-c03": {"pt-PT": ["", "{name} ATIVOU O PLOT ARMOR.", "", ""], "de": ["", "{name} HAT DIE PLOT ARMOR AKTIVIERT.", "", ""], "fr": ["", "{name} A ACTIVÉ LE PLOT ARMOR.", "", ""]},
    "s-c04": {"pt-PT": ["", "O PATO CONTINUA EM MODO PÂNICO.", "", ""], "de": ["", "DIE ENTE IST WEITERHIN IM PANIKMODUS.", "", ""], "fr": ["", "LE CANARD EST TOUJOURS EN MODE PANIQUE.", "", ""]},
    "s-c05": {"pt-PT": ["", "{name} ENTROU NA SALA DAS MÁQUINAS COM UM BALDE.", "", ""], "de": ["", "{name} IST MIT EINEM EIMER IN DEN MASCHINENRAUM GESTAPFT.", "", ""], "fr": ["", "{name} A DÉBARQUÉ EN SALLE DES MACHINES AVEC UN SEAU.", "", ""]},
    "s-c06": {"pt-PT": ["", "REFORÇOS RECEBIDOS. O NÚCLEO AINDA NÃO DEU POR NADA.", "", ""], "de": ["", "VERSTÄRKUNG IST DA. DER KERN HAT'S NICHT GEMERKT.", "", ""], "fr": ["", "RENFORTS ARRIVÉS. LE CŒUR N'A RIEN REMARQUÉ.", "", ""]},
    "s-c07": {"pt-PT": ["", "{name} ENTRA NO JOGO. DIFICULDADE: PESADELO.", "", ""], "de": ["", "{name} STEIGT EIN. SCHWIERIGKEIT: ALBTRAUM.", "", ""], "fr": ["", "{name} REJOINT LA PARTIE. DIFFICULTÉ : CAUCHEMAR.", "", ""]},
    "s-c08": {"pt-PT": ["", "{name} ESTÁ A SEGURAR A PORTA DO REATOR.", "", ""], "de": ["", "{name} HÄLT DIE REAKTORTÜR ZU.", "", ""], "fr": ["", "{name} RETIENT LA PORTE DU RÉACTEUR.", "", ""]},
    "s-c09": {"pt-PT": ["", "AJUDA RECEBIDA. O PÂNICO, PARA JÁ, FICA.", "", ""], "de": ["", "HILFE IST DA. DIE PANIK BLEIBT. VORERST.", "", ""], "fr": ["", "AIDE REÇUE. LA PANIQUE, ELLE, RESTE. POUR L'INSTANT.", "", ""]},
    "s-c10": {"pt-PT": ["", "{name} PÔS O APOCALIPSE EM PAUSA. MAIS OU MENOS.", "", ""], "de": ["", "{name} HAT DIE APOKALYPSE PAUSIERT. SO HALBWEGS.", "", ""], "fr": ["", "{name} A MIS L'APOCALYPSE EN PAUSE. OU PRESQUE.", "", ""]},
    "s-c11": {"pt-PT": ["", "{name} PUXOU A ALAVANCA CERTA. ACHAMOS NÓS.", "", ""], "de": ["", "{name} HAT DEN RICHTIGEN HEBEL GEZOGEN. GLAUBEN WIR.", "", ""], "fr": ["", "{name} A TIRÉ LE BON LEVIER. NORMALEMENT.", "", ""]},
    "s-c12": {"pt-PT": ["", "O TERMÓMETRO ACALMA. O PATO, NÃO.", "", ""], "de": ["", "DAS THERMOMETER BERUHIGT SICH. DIE ENTE NICHT.", "", ""], "fr": ["", "LE THERMOMÈTRE SE CALME. PAS LE CANARD.", "", ""]},
    "s-c13": {"pt-PT": ["", "{name} ENTRA COMO JOGADOR 2.", "", ""], "de": ["", "{name} STEIGT ALS SPIELER 2 EIN.", "", ""], "fr": ["", "{name} PREND LA DEUXIÈME MANETTE.", "", ""]},
    "s-c14": {"pt-PT": ["", "{name} TROUXE O EXTINTOR QUE FUNCIONA.", "", ""], "de": ["", "{name} HAT DEN GUTEN FEUERLÖSCHER MITGEBRACHT.", "", ""], "fr": ["", "{name} A APPORTÉ LE BON EXTINCTEUR.", "", ""]},
    "s-cg1": {"pt-PT": ["", "{name} ORGANIZARAM-SE. O PATO, NÃO.", "", ""], "de": ["", "{name} HABEN SICH ORGANISIERT. DIE ENTE NICHT.", "", ""], "fr": ["", "{name} SE SONT ORGANISÉS. PAS LE CANARD.", "", ""]},
    "s-cg2": {"pt-PT": ["", "O CHAT FEZ UMA CORRENTE DE BALDES.", "", ""], "de": ["", "DER CHAT HAT EINE EIMERKETTE GEBILDET.", "", ""], "fr": ["", "LE CHAT FAIT LA CHAÎNE AVEC DES SEAUX.", "", ""]},
    "s-cg3": {"pt-PT": ["", "{name} ESTÃO TODOS A PUXAR A MESMA ALAVANCA.", "", ""], "de": ["", "{name} ZIEHEN ALLE AM SELBEN HEBEL.", "", ""], "fr": ["", "{name} TIRENT TOUS SUR LE MÊME LEVIER.", "", ""]},
    "s-cg4": {"pt-PT": ["", "ESFORÇO DE EQUIPA. PÂNICO A SOLO.", "", ""], "de": ["", "TEAMARBEIT. PANIK IM ALLEINGANG.", "", ""], "fr": ["", "EFFORT COLLECTIF. PANIQUE INDIVIDUELLE.", "", ""]},
    "s-cg5": {"pt-PT": ["", "{name} ABRIRAM AS VÁLVULAS TODAS.", "", ""], "de": ["", "{name} HABEN JEDES VENTIL AUFGEDREHT.", "", ""], "fr": ["", "{name} ONT OUVERT TOUTES LES VANNES.", "", ""]},
    "s-cg6": {"pt-PT": ["", "RAID DE REFRIGERANTE EM CURSO.", "", ""], "de": ["", "KÜHLMITTEL-RAID LÄUFT.", "", ""], "fr": ["", "RAID DE RÉFRIGÉRANT EN COURS.", "", ""]},
    "s-r01": {"pt-PT": ["", "{name} SALVOU A RUN.", "", ""], "de": ["", "{name} HAT DEN RUN GERETTET.", "", ""], "fr": ["", "{name} A SAUVÉ LA RUN.", "", ""]},
    "s-r02": {"pt-PT": ["", "{name} ACABOU DE NERFAR O REATOR.", "", ""], "de": ["", "{name} HAT DEN REAKTOR GERADE GENERFT.", "", ""], "fr": ["", "{name} VIENT DE NERFER LE RÉACTEUR.", "", ""]},
    "s-r03": {"pt-PT": ["", "{name} DESBLOQUEOU O FINAL BOM.", "", ""], "de": ["", "{name} HAT DAS GUTE ENDE FREIGESCHALTET.", "", ""], "fr": ["", "{name} A DÉBLOQUÉ LA BONNE FIN.", "", ""]},
    "s-r04": {"pt-PT": ["", "{name} FEZ O QUE O MANUAL NÃO CONSEGUIU.", "", ""], "de": ["", "{name} HAT GESCHAFFT, WAS DAS HANDBUCH NICHT KONNTE.", "", ""], "fr": ["", "{name} A FAIT CE QUE LE MANUEL N'A PAS SU FAIRE.", "", ""]},
    "s-r05": {"pt-PT": ["", "{name} FEZ UM CLUTCH TÉRMICO.", "", ""], "de": ["", "{name} HAT EINEN THERMISCHEN CLUTCH HINGELEGT.", "", ""], "fr": ["", "{name} A RÉUSSI UN CLUTCH THERMIQUE.", "", ""]},
    "s-r06": {"pt-PT": ["", "CRISE CONTIDA. O PATO PREFERE NÃO FALAR DISSO.", "", ""], "de": ["", "KRISE EINGEDÄMMT. DIE ENTE MÖCHTE NICHT DARÜBER REDEN.", "", ""], "fr": ["", "CRISE CONTENUE. LE CANARD PRÉFÈRE NE PAS EN PARLER.", "", ""]},
    "s-r07": {"pt-PT": ["", "{name} BAIXOU A FEBRE AO NÚCLEO.", "", ""], "de": ["", "{name} HAT DAS FIEBER DES KERNS GESENKT.", "", ""], "fr": ["", "{name} A FAIT TOMBER LA FIÈVRE DU CŒUR.", "", ""]},
    "s-r08": {"pt-PT": ["", "{name} REESCREVEU O RELATÓRIO DO INCIDENTE.", "", ""], "de": ["", "{name} HAT DEN STÖRFALLBERICHT UMGESCHRIEBEN.", "", ""], "fr": ["", "{name} A RÉÉCRIT LE RAPPORT D'INCIDENT.", "", ""]},
    "s-r09": {"pt-PT": ["", "FUSÃO CANCELADA. OBRIGADO, {name}.", "", ""], "de": ["", "KERNSCHMELZE ABGESAGT. DANKE, {name}.", "", ""], "fr": ["", "FUSION ANNULÉE. MERCI, {name}.", "", ""]},
    "s-r10": {"pt-PT": ["", "{name} CONSERTOU A FÍSICA.", "", ""], "de": ["", "{name} HAT DIE PHYSIK REPARIERT.", "", ""], "fr": ["", "{name} A RÉPARÉ LA PHYSIQUE.", "", ""]},
    "s-r11": {"pt-PT": ["", "NÚCLEO ESTÁVEL. PATO EM AVALIAÇÃO.", "", ""], "de": ["", "KERN STABIL. ENTE WIRD NOCH GEPRÜFT.", "", ""], "fr": ["", "CŒUR STABLE. CANARD EN COURS D'ÉVALUATION.", "", ""]},
    "s-r12": {"pt-PT": ["", "{name} É O HERÓI DE QUE ESTE TURNO PRECISAVA.", "", ""], "de": ["", "{name} IST DER HELD, DEN DIESE SCHICHT GEBRAUCHT HAT.", "", ""], "fr": ["", "{name} EST LE HÉROS DONT CETTE ÉQUIPE AVAIT BESOIN.", "", ""]},
    "s-r13": {"pt-PT": ["", "{name} ENCONTROU O BOTÃO DE ARREFECER. AFINAL EXISTIA.", "", ""], "de": ["", "{name} HAT DEN ABKÜHLKNOPF GEFUNDEN. ES GIBT IHN WIRKLICH.", "", ""], "fr": ["", "{name} A TROUVÉ LE BOUTON « REFROIDIR ». IL EXISTAIT.", "", ""]},
    "s-r14": {"pt-PT": ["", "{name} ACABOU DE GANHAR AO TERMÓMETRO.", "", ""], "de": ["", "{name} HAT GERADE DAS THERMOMETER BESIEGT.", "", ""], "fr": ["", "{name} VIENT DE BATTRE LE THERMOMÈTRE.", "", ""]},
    "s-rg1": {"pt-PT": ["", "{name} SALVARAM A RUN.", "", ""], "de": ["", "{name} HABEN DEN RUN GERETTET.", "", ""], "fr": ["", "{name} ONT SAUVÉ LA RUN.", "", ""]},
    "s-rg2": {"pt-PT": ["", "VITÓRIA DE EQUIPA. O PATO FICA COM OS LOUROS.", "", ""], "de": ["", "TEAMSIEG. DIE ENTE SCHMÜCKT SICH MIT FREMDEN FEDERN.", "", ""], "fr": ["", "VICTOIRE COLLECTIVE. LE CANARD S'ATTRIBUE TOUT LE MÉRITE.", "", ""]},
    "s-rg3": {"pt-PT": ["", "{name} NERFARAM O REATOR EM EQUIPA.", "", ""], "de": ["", "{name} HABEN DEN REAKTOR IM TEAM GENERFT.", "", ""], "fr": ["", "{name} ONT NERFÉ LE RÉACTEUR EN ÉQUIPE.", "", ""]},
    "s-rg4": {"pt-PT": ["", "O CHAT FEZ UM CLUTCH TÉRMICO.", "", ""], "de": ["", "DER CHAT HAT EINEN THERMISCHEN CLUTCH HINGELEGT.", "", ""], "fr": ["", "LE CHAT A RÉUSSI UN CLUTCH THERMIQUE.", "", ""]},
    "s-rg5": {"pt-PT": ["", "{name} DESBLOQUEARAM O FINAL BOM.", "", ""], "de": ["", "{name} HABEN DAS GUTE ENDE FREIGESCHALTET.", "", ""], "fr": ["", "{name} ONT DÉBLOQUÉ LA BONNE FIN.", "", ""]},
    "s-rg6": {"pt-PT": ["", "CRISE RESOLVIDA EM COMISSÃO. PELA PRIMEIRA VEZ, FUNCIONOU.", "", ""], "de": ["", "KRISE VOM ARBEITSKREIS GELÖST. AUSNAHMSWEISE HAT'S GEKLAPPT.", "", ""], "fr": ["", "CRISE RÉSOLUE EN COMITÉ. POUR UNE FOIS, ÇA A MARCHÉ.", "", ""]},
    "s-n01": {"pt-PT": ["", "{name} COMPROU TEMPO. O PATO COMPROU CAFÉ.", "", ""], "de": ["", "{name} HAT ZEIT GEKAUFT. DIE ENTE KAFFEE.", "", ""], "fr": ["", "{name} OFFRE DU TEMPS. LE CANARD S'OFFRE UN CAFÉ.", "", ""]},
    "s-n02": {"pt-PT": ["", "{name}: APOIO TÉCNICO. O PATO: APOIO EMOCIONAL.", "", ""], "de": ["", "{name}: TECH-SUPPORT. DIE ENTE: SEELSORGE.", "", ""], "fr": ["", "{name} : SUPPORT TECHNIQUE. LE CANARD : SOUTIEN MORAL.", "", ""]},
    "s-n03": {"pt-PT": ["", "CAFÉ AUTORIZADO POR {name}.", "", ""], "de": ["", "KAFFEE GENEHMIGT DURCH {name}.", "", ""], "fr": ["", "CAFÉ AUTORISÉ PAR {name}.", "", ""]},
    "s-n04": {"pt-PT": ["", "{name} RENOVOU O CONTRATO DESTE PATO.", "", ""], "de": ["", "{name} HAT DEN VERTRAG DIESER ENTE VERLÄNGERT.", "", ""], "fr": ["", "{name} A RENOUVELÉ LE CONTRAT DE CE CANARD.", "", ""]},
    "s-n05": {"pt-PT": ["", "{name} OFERECEU-SE PARA O TURNO DA NOITE.", "", ""], "de": ["", "{name} HAT SICH FÜR DIE NACHTSCHICHT EINGETRAGEN.", "", ""], "fr": ["", "{name} SIGNE POUR L'ÉQUIPE DE NUIT.", "", ""]},
    "s-n06": {"pt-PT": ["", "MANUTENÇÃO PREVENTIVA: PATROCINADA.", "", ""], "de": ["", "VORBEUGENDE WARTUNG: GESPONSERT.", "", ""], "fr": ["", "MAINTENANCE PRÉVENTIVE : SPONSORISÉE.", "", ""]},
    "s-n07": {"pt-PT": ["", "{name} ENCHEU O FRIGORÍFICO DO REATOR.", "", ""], "de": ["", "{name} HAT DEN KÜHLSCHRANK DES REAKTORS AUFGEFÜLLT.", "", ""], "fr": ["", "{name} A REMPLI LE FRIGO DU RÉACTEUR.", "", ""]},
    "s-n08": {"pt-PT": ["", "O PATO FOI PROMOVIDO A PATO.", "", ""], "de": ["", "DIE ENTE WURDE ZUR ENTE BEFÖRDERT.", "", ""], "fr": ["", "LE CANARD A ÉTÉ PROMU CANARD.", "", ""]},
    "s-n09": {"pt-PT": ["", "{name} JUNTA-SE À EQUIPA. TURNO DO CAFÉ: JÁ.", "", ""], "de": ["", "{name} IST NEU IM TEAM. KAFFEEDIENST: AB SOFORT.", "", ""], "fr": ["", "{name} REJOINT LE PERSONNEL. PAUSE CAFÉ : MAINTENANT.", "", ""]},
    "s-n10": {"pt-PT": ["", "{name} JÁ É PESSOAL AUTORIZADO.", "", ""], "de": ["", "{name} IST JETZT BEFUGTES PERSONAL.", "", ""], "fr": ["", "{name} FAIT DÉSORMAIS PARTIE DU PERSONNEL AUTORISÉ.", "", ""]},
    "s-n11": {"pt-PT": ["", "NÚCLEO CALMO. PATO CALMO. {name}: UMA LENDA.", "", ""], "de": ["", "KERN RUHIG. ENTE RUHIG. {name}: LEGENDÄR.", "", ""], "fr": ["", "CŒUR CALME. CANARD CALME. {name}, LÉGENDAIRE.", "", ""]},
    "s-n12": {"pt-PT": ["", "{name} MELHOROU O AR CONDICIONADO.", "", ""], "de": ["", "{name} HAT DIE KLIMAANLAGE AUFGERÜSTET.", "", ""], "fr": ["", "{name} A AMÉLIORÉ LA CLIMATISATION.", "", ""]},
    "s-n13": {"pt-PT": ["", "{name} ACABOU DE EVITAR UMA CRISE QUE NÃO EXISTIA.", "", ""], "de": ["", "{name} HAT GERADE EINE KRISE VERHINDERT, DIE ES NIE GAB.", "", ""], "fr": ["", "{name} VIENT D'ÉVITER UNE CRISE QUI N'EXISTAIT PAS.", "", ""]},
    "s-n14": {"pt-PT": ["", "{name} SOMA MAIS UM DIA SEM INCIDENTES.", "", ""], "de": ["", "{name} ZÄHLT EINEN TAG OHNE STÖRFALL HOCH.", "", ""], "fr": ["", "{name} AJOUTE UN JOUR SANS INCIDENT.", "", ""]},
    "s-ng1": {"pt-PT": ["", "{name} RENOVARAM O CONTRATO DESTE PATO.", "", ""], "de": ["", "{name} HABEN DEN VERTRAG DIESER ENTE VERLÄNGERT.", "", ""], "fr": ["", "{name} ONT RENOUVELÉ LE CONTRAT DE CE CANARD.", "", ""]},
    "s-ng2": {"pt-PT": ["", "EQUIPA REFORÇADA. O PATO JÁ NÃO TRABALHA SOZINHO.", "", ""], "de": ["", "BELEGSCHAFT AUFGESTOCKT. DIE ENTE IST NICHT MEHR ALLEIN.", "", ""], "fr": ["", "EFFECTIF RENFORCÉ. LE CANARD NE TRAVAILLE PLUS SEUL.", "", ""]},
    "s-ng3": {"pt-PT": ["", "CAFÉ PARA A EQUIPA TODA.", "", ""], "de": ["", "KAFFEE FÜR DIE GANZE BELEGSCHAFT.", "", ""], "fr": ["", "TOURNÉE DE CAFÉ POUR TOUTE L'ÉQUIPE.", "", ""]},
    "s-ng4": {"pt-PT": ["", "{name} JUNTARAM-SE AO TURNO.", "", ""], "de": ["", "{name} VERSTÄRKEN JETZT DIE SCHICHT.", "", ""], "fr": ["", "{name} REJOIGNENT L'ÉQUIPE DE GARDE.", "", ""]},
    "s-ng5": {"pt-PT": ["", "REUNIÃO DE EQUIPA. ÚNICO PONTO DA ORDEM DE TRABALHOS: CAFÉ.", "", ""], "de": ["", "TEAMMEETING. EINZIGER TAGESORDNUNGSPUNKT: KAFFEE.", "", ""], "fr": ["", "RÉUNION D'ÉQUIPE. SEUL POINT À L'ORDRE DU JOUR : LE CAFÉ.", "", ""]},
    "s-ng6": {"pt-PT": ["", "O CHAT ACABOU DE FUNDAR UM DEPARTAMENTO DE ARREFECIMENTO.", "", ""], "de": ["", "DER CHAT HAT EINE KÜHLABTEILUNG GEGRÜNDET.", "", ""], "fr": ["", "LE CHAT VIENT DE CRÉER UN SERVICE DE REFROIDISSEMENT.", "", ""]},
    "k01": {"pt-PT": ["", "CRISE CANCELADA. CAFÉ AUTORIZADO.", "", ""], "de": ["", "KRISE ABGESAGT. KAFFEE GENEHMIGT.", "", ""], "fr": ["", "CRISE ANNULÉE. CAFÉ AUTORISÉ.", "", ""]},
    "k02": {"pt-PT": ["", "O REATOR ARREFECE. O CAFÉ NÃO.", "", ""], "de": ["", "DER REAKTOR KÜHLT AB. DER KAFFEE NICHT.", "", ""], "fr": ["", "LE RÉACTEUR REFROIDIT. LE CAFÉ, NON.", "", ""]},
    "k03": {"pt-PT": ["", "DE VOLTA A NÃO FAZER NADA.", "", ""], "de": ["", "ZURÜCK ZUM NICHTSTUN.", "", ""], "fr": ["", "RETOUR À NE RIEN FAIRE.", "", ""]},
    "k04": {"pt-PT": ["", "MAIS UM DIA SALVO PELA CAFEÍNA.", "", ""], "de": ["", "WIEDER EIN TAG, VOM KOFFEIN GERETTET.", "", ""], "fr": ["", "ENCORE UNE JOURNÉE SAUVÉE PAR LA CAFÉINE.", "", ""]},
    "k05": {"pt-PT": ["", "RELATÓRIO DO INCIDENTE: NÓDOA DE CAFÉ.", "", ""], "de": ["", "STÖRFALLBERICHT: KAFFEEFLECK.", "", ""], "fr": ["", "RAPPORT D'INCIDENT : TACHE DE CAFÉ.", "", ""]},
    "k06": {"pt-PT": ["", "PROTOCOLO PÓS-CRISE. PASSO 1: CAFÉ.", "", ""], "de": ["", "NACH-KRISEN-PROTOKOLL. SCHRITT 1: KAFFEE.", "", ""], "fr": ["", "PROTOCOLE POST-CRISE. ÉTAPE 1 : CAFÉ.", "", ""]},
    "k07": {"pt-PT": ["", "PÂNICO ARQUIVADO. CAFÉ SERVIDO.", "", ""], "de": ["", "PANIK ABGEHEFTET. KAFFEE SERVIERT.", "", ""], "fr": ["", "PANIQUE ARCHIVÉE. CAFÉ SERVI.", "", ""]},
    "k08": {"pt-PT": ["", "O NÚCLEO DESCANSA. O PATO TAMBÉM.", "", ""], "de": ["", "DER KERN RUHT. DIE ENTE AUCH.", "", ""], "fr": ["", "LE CŒUR SE REPOSE. LE CANARD AUSSI.", "", ""]},
    "k09": {"pt-PT": ["", "AQUI NÃO SE PASSOU NADA. NADA.", "", ""], "de": ["", "HIER IST NICHTS PASSIERT. GAR NICHTS.", "", ""], "fr": ["", "IL NE S'EST RIEN PASSÉ. CIRCULEZ.", "", ""]},
    "k10": {"pt-PT": ["", "REFRIGERANTE DE SOBRA. PAUSA PARA CAFÉ.", "", ""], "de": ["", "KÜHLMITTEL ÜBRIG. KAFFEEPAUSE.", "", ""], "fr": ["", "RÉFRIGÉRANT À REVENDRE. PAUSE CAFÉ.", "", ""]},
    "k11": {"pt-PT": ["", "TUDO EM ORDEM. CAFÉ, PELO SIM, PELO NÃO.", "", ""], "de": ["", "ALLES GUT. KAFFEE, NUR ZUR SICHERHEIT.", "", ""], "fr": ["", "TOUT VA BIEN. UN CAFÉ, PAR PRÉCAUTION.", "", ""]},
    "k12": {"pt-PT": ["", "TURNO TRANQUILO. CAFÉ MAIS QUE MERECIDO.", "", ""], "de": ["", "RUHIGE SCHICHT. VERDIENTER KAFFEE.", "", ""], "fr": ["", "SERVICE TRANQUILLE. CAFÉ BIEN MÉRITÉ.", "", ""]},
    "k13": {"pt-PT": ["", "MANUTENÇÃO PREVENTIVA: CAFÉ.", "", ""], "de": ["", "VORBEUGENDE WARTUNG: KAFFEE.", "", ""], "fr": ["", "MAINTENANCE PRÉVENTIVE : CAFÉ.", "", ""]},
    "k14": {"pt-PT": ["", "NADA A ARREFECER. A NÃO SER O CAFÉ.", "", ""], "de": ["", "NICHTS ZU KÜHLEN. AUSSER DEM KAFFEE.", "", ""], "fr": ["", "RIEN À REFROIDIR. SAUF LE CAFÉ.", "", ""]},
    "k15": {"pt-PT": ["", "A CAFEÍNA CONTA COMO REFRIGERANTE. SEGUNDO O PATO.", "", ""], "de": ["", "KOFFEIN ZÄHLT ALS KÜHLMITTEL. SAGT DIE ENTE.", "", ""], "fr": ["", "LA CAFÉINE COMPTE COMME RÉFRIGÉRANT. SELON LE CANARD.", "", ""]},
  };
  window.DUCK_REACTOR_CATALOG_I18N = X;
  const F = ["title", "main", "sub", "btns"];
  cfg.catalog.entries.forEach((e) => {
    const x = X[e.id];
    if (!x) return;
    Object.keys(x).forEach((l) => {
      const cur = e[l] || {};
      if (cur.main) return;
      e[l] = {};
      F.forEach((f, i) => { e[l][f] = x[l][i] || ""; });
    });
  });
})();

;
/* ---- src/presets.js ---- */
/*
 * Duck Reactor — presets integrados (etapas 6 y 9).
 *
 * Cada preset es un parche: una lista de [ruta, valor] que se aplica sobre la
 * configuración ACTUAL (no la sustituye). Así se conservan luces, CRT y demás
 * ajustes propios. No se guardan junto a los presets del usuario ni pueden
 * sobrescribirlos: viven aquí y sólo se cargan. Etapa 15: no cambian el idioma.
 */
window.DUCK_REACTOR_PRESETS = {
  "Chat al mando": {
    description: "El público provoca y resuelve la crisis: «No tocar» calienta, «Mandar refrigerante» y «Nuevo suscriptor» enfrían, PANIC con aleteo continuo y café al volver a nivel seguro. Recuperación natural y del becario si nadie ayuda. No cambia el idioma elegido.",
    patch: [
      ["display.mode", "show"],
      ["memes.enabled", true],
      ["behavior.flap.enabled", true],
      ["behavior.flap.continuous", true],
      ["chat.enabled", true],
      ["chat.heat.enabled", true],
      ["chat.coolant.enabled", true],
      ["chat.recovery.emergency", true],
      ["chat.coffeeAfterCrisis", true],
      ["stream.subscriber.enabled", true],
      ["memes.texts.es.subOne", "{name} HA RENOVADO EL CONTRATO DE ESTE PATO"],
      ["memes.texts.es.subMany", "{name} Y {n} MÁS HAN RENOVADO EL CONTRATO DE ESTE PATO"],
      ["memes.texts.es.subPunch", "CRISIS CANCELADA. CAFÉ AUTORIZADO"],
      ["memes.texts.en.subOne", "{name} RENEWED THIS DUCK'S CONTRACT"],
      ["memes.texts.en.subMany", "{name} AND {n} MORE RENEWED THIS DUCK'S CONTRACT"],
      ["memes.texts.en.subPunch", "CRISIS CANCELLED. COFFEE AUTHORIZED"],
    ],
  },
  "Humor visual": {
    description: "Los tres gags visuales (café combustible, negación corporativa y supervisor), en el idioma elegido. Los gags anteriores quedan disponibles pero desactivados.",
    patch: [
      ["display.mode", "show"],
      ["memes.enabled", true],
      ["memes.poses", true],
      ["memes.gags.thisIsFine.enabled", false],
      ["memes.gags.coffee.enabled", false],
      ["memes.gags.update.enabled", false],
      ["memes.gags.button.enabled", false],
      ["memes.gags.recovery.enabled", false],
      ["memes.gags.fuel.enabled", true],
      ["memes.gags.fuel.chance", 1],
      ["memes.gags.denial.enabled", true],
      ["memes.gags.denial.chance", 1],
      ["memes.gags.supervisor.enabled", true],
      ["memes.gags.supervisor.chance", 1],
    ],
  },
};

;
/* ---- src/schema.js ---- */
/*
 * Duck Reactor — utilidades y validación de configuración.
 *
 * sanitizeConfig(entrada, porDefecto) recorre la forma de la configuración
 * por defecto y sólo acepta valores con el tipo y el rango esperados.
 * Lo que no encaja se sustituye por el valor por defecto y se anota en
 * `warnings`. Así una importación inválida nunca rompe la escena.
 *
 * window.DR.util / window.DR.schema
 */
(function () {
  "use strict";
  const L = (window.DR && window.DR.i18n) ? window.DR.i18n.L : (s, ...v) => s.reduce((a, x, i) => a + (i ? String(v[i - 1]) : "") + x, ""); // textos del laboratorio (etapa 15)
  const DR = (window.DR = window.DR || {});

  /* ------------------------------------------------------------ util */
  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function getPath(obj, path) {
    if (!path) return obj;
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function setPath(obj, path, value) {
    const ks = path.split(".");
    let o = obj;
    for (let i = 0; i < ks.length - 1; i++) {
      if (o[ks[i]] == null) o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      o = o[ks[i]];
    }
    o[ks[ks.length - 1]] = value;
  }
  /* Hojas de la configuración: arrays de primitivos y quads cuentan como hoja. */
  function flatten(obj, prefix, out) {
    out = out || {};
    const leafArray = (a) => a.every((x) => !isObj(x) && !Array.isArray(x)) || a.every((x) => Array.isArray(x) && x.every((y) => typeof y === "number"));
    if (Array.isArray(obj) && leafArray(obj)) { out[prefix] = obj; return out; }
    if (isObj(obj) || Array.isArray(obj)) {
      for (const k of Object.keys(obj)) flatten(obj[k], prefix ? prefix + "." + k : k, out);
      return out;
    }
    out[prefix] = obj;
    return out;
  }
  function diff(a, b) {
    const fa = flatten(a, ""), fb = flatten(b, "");
    const keys = new Set([...Object.keys(fa), ...Object.keys(fb)]);
    const out = [];
    for (const k of keys) {
      if (JSON.stringify(fa[k]) !== JSON.stringify(fb[k])) out.push({ path: k, from: fa[k], to: fb[k] });
    }
    return out.sort((x, y) => x.path.localeCompare(y.path));
  }
  const HEX = /^#[0-9a-f]{6}$/i;
  function hexToRgb(hex) {
    if (!HEX.test(hex || "")) return "255, 180, 80";
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
  function mixWithWhite(hex, k) {
    const [r, g, b] = hexToRgb(hex).split(",").map((v) => +v);
    const m = (c) => Math.round(c + (255 - c) * k);
    return `${m(r)}, ${m(g)}, ${m(b)}`;
  }
  const cleanText = (s, max) => String(s).replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max);

  /*
   * Ruta de un asset. En el HTML único (tools/build_html.py) los archivos van
   * incrustados en window.DR_ASSETS como data URL; aquí se convierten una sola
   * vez en blob: URL cortas. Con el proyecto en carpetas se usa la ruta tal cual.
   */
  const assetCache = {};
  function asset(path) {
    // Widget alojado (StreamElements, etapa 21): imágenes ya descargadas como blob: URL
    const U = window.DR_ASSET_URLS;
    if (U && U[path]) return U[path];
    const A = window.DR_ASSETS;
    if (!A || !A[path]) return window.DR_ASSET_BASE && /^assets\//.test(path) ? window.DR_ASSET_BASE + path : path;
    if (assetCache[path]) return assetCache[path];
    try {
      const m = /^data:([^;,]+);base64,(.*)$/.exec(A[path]);
      const bin = atob(m[2]);
      const buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      assetCache[path] = URL.createObjectURL(new Blob([buf], { type: m[1] }));
    } catch (e) {
      assetCache[path] = A[path];
    }
    return assetCache[path];
  }

  DR.util = { isObj, clone, clamp, getPath, setPath, flatten, diff, hexToRgb, mixWithWhite, HEX };
  DR.asset = asset;

  /* ------------------------------------------------------------ reglas */
  const LANGS = (DR.i18n && DR.i18n.LANGS) || ["en", "es", "pt-PT", "de", "fr"];
  const LEVELS = ["NORMAL", "NOTICE", "ALARMED", "PANIC"];
  const POSES = ["IDLE", "COFFEE", "NOTICE", "ALARMED", "PANIC"];
  const n = (min, max, opt) => Object.assign({ type: "num", min, max }, opt || {});
  const t = (max) => ({ type: "text", max });
  const list = (maxItems, maxLen) => ({ type: "list", maxItems, maxLen });
  const en = (values) => ({ type: "enum", values });
  const paletteOrHex = { type: "paletteColor" };

  /* Patrones de ruta: * = un segmento cualquiera. */
  const RULES = [
    ["duck.stageX", n(400, 980)], ["duck.floorY", n(600, 768)], ["duck.scale", n(0.25, 0.7)],
    ["shadow.enabled", { type: "bool" }], ["shadow.color", { type: "color" }],
    ["shadow.base.opacity", n(0, 1)], ["shadow.base.blur", n(0, 40)], ["shadow.base.rx", n(40, 500)], ["shadow.base.ry", n(8, 200)],
    ["shadow.base.cx", n(0, 1024)], ["shadow.base.cy", n(0, 1024)],
    ["shadow.wheels.opacity", n(0, 1)], ["shadow.wheels.blur", n(0, 20)], ["shadow.wheels.rx", n(4, 120)], ["shadow.wheels.ry", n(2, 60)],
    ["grade.enabled", { type: "bool" }], ["grade.chairMatch", { type: "bool" }], ["grade.warmth", n(0, 1)], ["grade.exposure", n(0.7, 1.3)],

    ["behavior.mode", en(["auto", "manual"])], ["behavior.manualPose", en(POSES)],
    ["behavior.reactionDelay", n(0, 10)],
    ["behavior.flap.enabled", { type: "bool" }], ["behavior.flap.frameMs", n(60, 300, { int: true })], ["behavior.flap.cycles", n(1, 5, { int: true })], ["behavior.coffee.auto", { type: "bool" }],
    ["behavior.coffee.everyMin", n(5, 600)], ["behavior.coffee.everyMax", n(5, 900)], ["behavior.coffee.duration", n(2, 120)],

    ["sim.mode", en(["auto", "manual", "scenario"])], ["sim.speed", n(0.1, 16)],
    ["sim.*.temp", n(20, 1000)], ["sim.*.pressure", n(0, 30)], ["sim.*.coolant", n(0, 100)],
    ["sim.*.rods", n(0, 100)], ["sim.*.output", n(0, 2000)], ["sim.*.load", n(0, 100)],
    ["sim.auto.heating", n(0, 2.5)], ["sim.auto.cooling", n(0, 2.5)], ["sim.auto.fluctuation", n(0, 10)],
    ["sim.auto.drift", n(0, 30)], ["sim.auto.response", n(2, 120)],
    ["sim.scenario", { type: "scenarioKey" }],
    ["sim.thresholds.notice", n(300, 980)], ["sim.thresholds.alarmed", n(305, 985)], ["sim.thresholds.panic", n(310, 990)],
    ["sim.thresholds.hysteresis", n(0, 60)], ["sim.thresholds.escalateDelay", n(0, 30)], ["sim.thresholds.recoverDelay", n(0, 60)],

    ["screens.*.quad", { type: "quad" }],
    ["content.core.readouts.*.unit", t(5)],
    ["content.core.readouts.*.max", n(1, 100000)], ["content.core.readouts.*.decimals", n(0, 3, { int: true })],
    ["content.core.temp.max", n(100, 2000)], ["content.core.temp.*", t(16)],

    ["messages.humor", { type: "bool" }], ["messages.interval", n(2, 60)], ["messages.jokeEvery", n(1, 20, { int: true })],
    ["messages.logEvery", n(1, 60)],

    ["crt.phosphor", { type: "color" }], ["crt.ok", { type: "color" }], ["crt.warn", { type: "color" }],
    ["crt.brightness", n(0.4, 1.6)], ["crt.glow", n(0, 3)], ["crt.scanlines", n(0, 0.6)], ["crt.scanSpacing", n(2, 10)],
    ["crt.roll", n(0, 0.2)], ["crt.rollPeriod", n(2, 30)], ["crt.flicker", n(0, 0.2)], ["crt.cursor", { type: "bool" }],
    ["crt.cursorBlink", n(0.3, 3)], ["crt.typeSpeed", n(0, 200)],

    ["lights.intensity", n(0, 1.6)], ["lights.halo", n(0, 3)], ["lights.reflection", n(0, 3)],
    ["lights.colors.*", { type: "color" }],
    ["lights.groups.*.enabled", { type: "bool" }], ["lights.groups.*.intensity", n(0, 2)], ["lights.groups.*.label", t(24)],
    ["lights.items.*.x", n(0, 1376)], ["lights.items.*.y", n(0, 768)], ["lights.items.*.w", n(2, 80)], ["lights.items.*.h", n(2, 80)],
    ["lights.items.*.shape", en(["rect", "round"])], ["lights.items.*.color", paletteOrHex],
    ["lights.items.*.mode", en(["steady", "pulse", "blink", "flicker"])],
    ["lights.items.*.period", n(0.2, 30)], ["lights.items.*.delay", n(-30, 30)], ["lights.items.*.level", n(0, 1.5)],
    ["lights.items.*.halo", n(0, 6)], ["lights.items.*.refl", n(0, 4)], ["lights.items.*.boost", { type: "bool" }],
    ["lights.items.*.enabled", { type: "bool" }], ["lights.items.*.react", en(["none", "alarm", "status"])],
    ["lights.items.*.group", en(["A", "B", "C", "D", "E"])], ["lights.items.*.id", t(24)],
    ["lights.matrix.enabled", { type: "bool" }], ["lights.matrix.reactive", { type: "bool" }],
    ["lights.matrix.lit", n(0, 48, { int: true })], ["lights.matrix.color", paletteOrHex], ["lights.matrix.accent", paletteOrHex],
    ["lights.matrix.accentChance", n(0, 1)], ["lights.matrix.minMs", n(100, 10000)], ["lights.matrix.maxMs", n(100, 20000)],
    ["lights.bar.enabled", { type: "bool" }], ["lights.bar.color", paletteOrHex], ["lights.bar.scanPeriod", n(0.5, 20)],
    ["lights.bar.sparse", n(0, 3, { int: true })],

    ["ambient.ceiling.lamps.*.x", n(-50, 1400)], ["ambient.ceiling.lamps.*.y", n(-50, 800)],
    ["ambient.ceiling.lamps.*.w", n(4, 600)], ["ambient.ceiling.lamps.*.h", n(2, 200)],
    ["ambient.spill.items.*.x", n(0, 1376)], ["ambient.spill.items.*.y", n(0, 768)],
    ["ambient.spill.items.*.rx", n(4, 700)], ["ambient.spill.items.*.ry", n(2, 300)],
    ["ambient.ceiling.intensity", n(0, 2)], ["ambient.ceiling.breathe", n(0, 0.8)],
    ["ambient.ceiling.lamps.*.period", n(1, 40)], ["ambient.ceiling.lamps.*.delay", n(-40, 40)], ["ambient.ceiling.lamps.*.dip", { type: "bool" }],
    ["ambient.spill.intensity", n(0, 3)], ["ambient.spill.items.*.opacity", n(0, 0.6)], ["ambient.spill.items.*.color", { type: "color" }],
    ["motion.decor", { type: "bool" }],
    ["demo.calm", n(2, 60)], ["demo.coffee", n(3, 60)], ["demo.notice", n(4, 60)], ["demo.alarmed", n(3, 60)], ["demo.recovery", n(4, 60)],
    ["demo.speed", n(0.25, 4)], ["demo.alarmGlow", n(0, 0.6)], ["demo.subscriber", t(24)],
    ["emergency.enabled", { type: "bool" }], ["emergency.color", { type: "color" }],
    ["emergency.source.x", n(0, 1376)], ["emergency.source.y", n(0, 768)], ["emergency.source.radius", n(120, 1400)],
    ["emergency.ambient", n(0, 1.5)], ["emergency.duck", n(0, 1.5)], ["emergency.darken", n(0, 0.8)],
    ["emergency.pulse.period", n(0.8, 10)], ["emergency.pulse.depth", n(0, 0.6)],
    ["emergency.enterMs", n(0, 3000)], ["emergency.exitMs", n(0, 4000)], ["emergency.still", n(0.2, 1.2)], ["emergency.alarm", n(0, 0.6)],

    ["display.mode", en(["show", "technical"])],
    ["audio.enabled", { type: "bool" }], ["audio.master", n(0, 1)], ["audio.ambience", n(0, 1)], ["audio.alarms", n(0, 1)], ["audio.effects", n(0, 1)],
    ["audio.ambient", en(["reactor", "lab"])], ["audio.sounds.*.on", { type: "bool" }], ["audio.sounds.*.vol", n(0, 1.5)],
    ["memes.enabled", { type: "bool" }], ["memes.lang", en(LANGS)],
    ["memes.interval.min", n(10, 600)], ["memes.interval.max", n(10, 900)],
    ["memes.timing.setup", n(0.5, 15)], ["memes.timing.pause", n(0, 10)], ["memes.timing.punch", n(1, 20)],
    ["memes.poses", { type: "bool" }], ["memes.posesOverManual", { type: "bool" }],
    ["memes.gags.update.stall", n(0.5, 15)],
    ["memes.gags.button.pose", en(["NOTICE", "ALARMED"])], ["memes.gags.button.escalate", { type: "bool" }],
    ["memes.gags.*.enabled", { type: "bool" }], ["memes.gags.*.chance", n(0, 1)], ["memes.gags.*.steps.*", n(0.3, 10)],
    ["memes.texts.*.subOne", t(60)], ["memes.texts.*.subMany", t(60)], ["memes.texts.*.subPunch", t(48)], ["memes.texts.*.subPunchCalm", t(48)],
    ["memes.texts.*.heatOne", t(60)], ["memes.texts.*.heatMany", t(60)], ["memes.texts.*.coolOne", t(60)], ["memes.texts.*.coolMany", t(60)],
    ["memes.texts.*.popClosing", t(48)], ["memes.texts.*.recAdvisory", t(56)], ["memes.texts.*.subRecovering", t(56)], ["memes.texts.*.subRecoveringWait", t(56)],
    ["memes.texts.*.gsReply", t(56)], ["memes.texts.*.gsSent", t(56)], ["memes.texts.*.gsTitle", t(48)], ["memes.texts.*.gaStart", t(56)], ["memes.texts.*.gaQuestion", t(56)],
    ["memes.texts.*.gaWait", t(56)], ["memes.texts.*.gaRestart", t(48)], ["memes.texts.*.gcProto", t(56)], ["memes.texts.*.gcAsk", t(56)], ["memes.texts.*.gcThanks", t(64)], ["memes.texts.*.popNoClose", t(48)], ["memes.texts.*.subAnonMany", t(40)],
    ["memes.texts.*.lockCool", t(32)], ["memes.texts.*.lockFollow", t(32)], ["memes.texts.*.lockPaid", t(40)], ["memes.texts.*.followOne", t(60)],
    ["memes.texts.*.coolHelp", t(48)], ["memes.texts.*.becMain", t(48)], ["memes.texts.*.becSub", t(48)],
    /* pantallas y mensajes por idioma (etapa 15) */
    ["memes.texts.*.scrSoonLines", list(3, 14)], ["memes.texts.*.scrAuxRows", list(6, 6)], ["memes.texts.*.scrAuxMemes", list(40, 32)], ["memes.texts.*.scrAuxPanic", list(24, 32)],
    ["memes.texts.*.msgAdvisories", list(40, 40)], ["memes.texts.*.msgJokes", list(40, 40)], ["memes.texts.*.msgLog", list(40, 34)],
    ["memes.texts.*.msgAlertsNOTICE", list(20, 40)], ["memes.texts.*.msgAlertsALARMED", list(20, 40)], ["memes.texts.*.msgAlertsPANIC", list(20, 40)],
    ["memes.texts.*.msgRecovered", t(40)], ["memes.texts.*.logCleared", t(40)], ["memes.texts.*.logLevel", t(40)], ["memes.texts.*.denialPunch", t(64)],
    ["memes.texts.*.*", t(34)],
    ["behavior.flap.continuous", { type: "bool" }],
    ["stream.subscriber.enabled", { type: "bool" }], ["stream.subscriber.testName", t(24)],
    ["stream.subscriber.drop", n(10, 600)], ["stream.subscriber.coolSeconds", n(0, 60)],
    ["stream.subscriber.phrase", n(1, 15)], ["stream.subscriber.coffee", n(1, 30)], ["stream.subscriber.waitMax", n(3, 120)],
    ["stream.subscriber.coffeeOverManual", { type: "bool" }],
    ["chat.enabled", { type: "bool" }], ["chat.coffeeAfterCrisis", { type: "bool" }],
    ["chat.heat.enabled", { type: "bool" }], ["chat.heat.amount", n(10, 600)], ["chat.heat.ramp", n(0, 30)], ["chat.heat.max", n(20, 900)],
    ["chat.heat.cooldown", n(0, 600)], ["chat.heat.gap", n(0, 120)], ["chat.heat.phrase", n(1, 15)],
    ["chat.coolant.enabled", { type: "bool" }], ["chat.coolant.amount", n(5, 600)], ["chat.coolant.seconds", n(0, 60)],
    ["chat.coolant.cooldown", n(0, 600)], ["chat.coolant.gap", n(0, 120)], ["chat.coolant.group", n(0, 15)], ["chat.coolant.phrase", n(1, 15)],
    ["chat.recovery.selfResolve", { type: "bool" }], ["chat.recovery.halfLife", n(10, 1200)], ["chat.lock.enabled", { type: "bool" }], ["chat.lock.cools", n(1, 50, { int: true })], ["chat.lock.follows", n(0, 50, { int: true })], ["chat.auto.enabled", { type: "bool" }], ["chat.auto.calm", n(10, 3600)], ["chat.auto.rise", n(5, 180)], ["chat.recovery.emergency", { type: "bool" }], ["chat.recovery.after", n(5, 600)],
    ["chat.recovery.rate", n(0.5, 60)], ["chat.recovery.phrase", n(1, 15)],
    ["life.enabled", { type: "bool" }], ["life.preset", en(["sutil", "normal", "cinematico", "custom"])],
    ["life.steam.enabled", { type: "bool" }], ["life.steam.intensity", n(0.2, 1.6)], ["life.steam.strands", n(2, 3, { int: true })],
    ["life.leak.enabled", { type: "bool" }], ["life.leak.x", n(0, 1376)], ["life.leak.y", n(0, 768)], ["life.leak.angle", n(-180, 180)],
    ["life.leak.intensity", n(0.2, 1.6)], ["life.leak.burst", n(0.4, 5)], ["life.leak.every", n(2, 30)], ["life.leak.critical", n(1, 2.5)],
    ["life.leak.precursor", { type: "bool" }],
    ["life.relays.enabled", { type: "bool" }], ["life.relays.intensity", n(0.3, 1.6)], ["life.relays.step", n(50, 300)],
    ["life.sparks.enabled", { type: "bool" }], ["life.sparks.intensity", n(0.4, 1.8)], ["life.sparks.rate", n(0.25, 3)],
    ["catalog.popups.enabled", { type: "bool" }], ["catalog.popups.preset", en(["sutil", "normal", "caos", "custom"])],
    ["catalog.popups.minWindows", n(1, 3, { int: true })], ["catalog.popups.maxWindows", n(1, 3, { int: true })],
    ["catalog.popups.stagger", n(0.8, 6)], ["catalog.popups.punchAt", n(0.3, 4)], ["catalog.popups.read", n(2, 12)],
    ["catalog.popups.restMin", n(1, 60)], ["catalog.popups.restMax", n(1, 90)], ["catalog.popups.tricks", n(0, 1)],
    ["catalog.popups.longAfter", n(5, 300)], ["catalog.popups.minPx", n(8, 24)], ["catalog.popups.mode", en(["guiones", "catalogo"])], ["catalog.popups.guionRest", n(8, 180)],
    ["catalog.popups.guiones.*", { type: "bool" }], ["catalog.popups.firstDelay", n(0, 10)],
    ["catalog.entries", { type: "entries" }],
    ["catalog.entries.*.on", { type: "bool" }], ["catalog.entries.*.weight", n(0, 5)], ["catalog.entries.*.cooldown", n(0, 3600)],
    ["catalog.entries.*.bar", n(0, 150)], ["catalog.entries.*.lang", en(["all"].concat(LANGS))],
    ["catalog.entries.*.who", en(["one", "group", "any"])], ["catalog.entries.*.family", t(16)], ["catalog.entries.*.ctx", t(16)],
    ["catalog.entries.*.*.title", t(28)], ["catalog.entries.*.*.main", t(60)], ["catalog.entries.*.*.sub", t(64)], ["catalog.entries.*.*.btns", t(60)],
  ].map(([p, r]) => [new RegExp("^" + p.replace(/\./g, "\\.").replace(/\*/g, "[^.]+") + "$"), r, p]);

  function ruleFor(path) {
    const norm = path.replace(/\.\d+(?=\.|$)/g, (m) => m); // índices numéricos quedan como segmento
    for (const [re, r] of RULES) if (re.test(norm)) return r;
    return null;
  }

  /* Geometría válida: 4 esquinas finitas, polígono convexo y área mínima. */
  function validQuad(q) {
    if (!Array.isArray(q) || q.length !== 4) return false;
    for (const p of q) {
      if (!Array.isArray(p) || p.length !== 2 || !p.every((v) => Number.isFinite(v))) return false;
      if (p[0] < -60 || p[0] > 1436 || p[1] < -60 || p[1] > 828) return false;
    }
    let sign = 0, area = 0;
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = q[i], [bx, by] = q[(i + 1) % 4], [cx, cy] = q[(i + 2) % 4];
      const cross = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
      if (Math.abs(cross) < 1e-6) return false;
      const s = Math.sign(cross);
      if (sign && s !== sign) return false;
      sign = s;
      area += ax * by - bx * ay;
    }
    return Math.abs(area / 2) >= 40;
  }

  /*
   * Catálogo de memes (etapa 12): lista de entradas con forma fija.
   * Con `defs` (las entradas originales) se migra: las entradas originales que
   * falten se añaden con sus valores por defecto y las existentes conservan lo
   * que el usuario cambió. Las entradas propias (custom) se mantienen.
   */
  const CAT = {
    kinds: ["popup", "sub", "coffee"],
    families: {
      popup: ["error", "hack", "achievement", "dialog", "progress"],
      sub: ["gamer", "oficina", "heroe", "pato", "equipo", "tecnica"],
      coffee: ["cafeina", "protocolo", "calma"],
    },
    ctx: { popup: ["start", "any", "long"], sub: ["critical", "recovery", "normal"], coffee: ["after", "calm", "any"] },
    who: ["one", "group", "any"],
    langs: ["all"].concat(LANGS),
  };
  function sanitizeEntry(e, base) {
    if (!isObj(e)) return null;
    const b = base || {};
    const kind = CAT.kinds.includes(e.kind) ? e.kind : b.kind;
    if (!kind) return null;
    const pickEnum = (v, list, d) => (list.includes(v) ? v : d);
    const num = (v, a, z, d) => (typeof v === "number" && Number.isFinite(v) ? clamp(v, a, z) : d);
    const txt = (o, d) => {
      const src = isObj(o) ? o : {}, def = isObj(d) ? d : {};
      const f = (k, m) => cleanText(typeof src[k] === "string" ? src[k] : (def[k] || ""), m).trim();
      return { title: f("title", 28), main: f("main", 60), sub: f("sub", 64), btns: f("btns", 60) };
    };
    const id = typeof e.id === "string" && /^[a-z0-9][a-z0-9_-]{0,31}$/i.test(e.id) ? e.id : null;
    if (!id) return null;
    const out = {
      id, kind,
      family: pickEnum(e.family, CAT.families[kind], b.family || CAT.families[kind][0]),
      ctx: pickEnum(e.ctx, CAT.ctx[kind], b.ctx || CAT.ctx[kind][1] || CAT.ctx[kind][0]),
      who: pickEnum(e.who, CAT.who, b.who || "any"),
      lang: pickEnum(e.lang, CAT.langs, b.lang || "all"),
      weight: num(e.weight, 0, 5, b.weight != null ? b.weight : 1),
      cooldown: num(e.cooldown, 0, 3600, b.cooldown != null ? b.cooldown : 0),
      on: typeof e.on === "boolean" ? e.on : b.on !== false,
      bar: num(e.bar, 0, 150, b.bar != null ? b.bar : 99),
      custom: base ? false : e.custom === true,
    };
    // cinco variantes de idioma: las que falten quedan vacías (se usa la alternativa al mostrarla)
    LANGS.forEach((lg) => { out[lg] = txt(e[lg], b[lg]); });
    return out;
  }
  function sanitizeEntries(input, defs) {
    const out = [], seen = new Set();
    let dropped = 0;
    const byId = {};
    if (defs) defs.forEach((d) => { byId[d.id] = d; });
    const src = Array.isArray(input) ? input.slice(0, 400) : [];
    const given = {};
    src.forEach((e) => { if (isObj(e) && typeof e.id === "string" && !given[e.id]) given[e.id] = e; });
    // primero las originales, en su orden (con lo que el usuario cambió)
    if (defs) defs.forEach((d) => {
      const r = sanitizeEntry(given[d.id] || d, d);
      if (r) { r.custom = false; out.push(r); seen.add(r.id); }
    });
    // después las demás (propias, o todas si no hay originales)
    src.forEach((e) => {
      if (!isObj(e) || seen.has(e.id)) return;
      if (defs && !byId[e.id] && e.custom !== true && !/^u-/.test(String(e.id))) { dropped++; return; }
      const r = sanitizeEntry(e, null);
      if (!r) { dropped++; return; }
      if (defs) r.custom = true;
      out.push(r); seen.add(r.id);
    });
    return { list: out, note: dropped ? L`${dropped} entradas no válidas descartadas` : undefined };
  }

  /*
   * Valida un valor suelto. Devuelve { ok, value, note }.
   * ctx.palette: claves de color de la paleta; ctx.scenarios: claves válidas.
   */
  function checkValue(path, v, fallback, ctx) {
    const r = ruleFor(path);
    const ok = (value, note) => ({ ok: true, value, note });
    const bad = (note) => ({ ok: false, value: fallback, note });
    if (!r) {
      // Sin regla: mismo tipo que el valor por defecto
      if (typeof fallback === "number") return Number.isFinite(+v) && v !== "" && v !== null ? ok(+v) : bad("número no válido");
      if (typeof fallback === "boolean") return typeof v === "boolean" ? ok(v) : bad("se esperaba sí/no");
      if (typeof fallback === "string") return v == null ? bad("texto vacío") : ok(cleanText(v, 200));
      return bad("valor no editable");
    }
    switch (r.type) {
      case "num": {
        const x = typeof v === "string" ? parseFloat(v.replace(",", ".")) : v;
        if (typeof x !== "number" || !Number.isFinite(x)) return bad("número no válido");
        let y = clamp(x, r.min, r.max);
        if (r.int) y = Math.round(y);
        return ok(y, y !== x ? L`ajustado al rango ${r.min}–${r.max}` : undefined);
      }
      case "bool": return typeof v === "boolean" ? ok(v) : bad("se esperaba sí/no");
      case "enum": return r.values.includes(v) ? ok(v) : bad("opción no válida");
      case "color": return typeof v === "string" && HEX.test(v) ? ok(v.toLowerCase()) : bad("color no válido (#rrggbb)");
      case "paletteColor":
        if (typeof v === "string" && (HEX.test(v) || (ctx && ctx.palette && ctx.palette.includes(v)))) return ok(v);
        return bad("color no válido");
      case "scenarioKey": return ctx && ctx.scenarios && ctx.scenarios.includes(v) ? ok(v) : bad("escenario desconocido");
      case "text": return v == null ? bad("texto vacío") : ok(cleanText(v, r.max));
      case "list": {
        if (!Array.isArray(v)) return bad("se esperaba una lista");
        const items = v.filter((s) => typeof s === "string" || typeof s === "number")
          .map((s) => cleanText(s, r.maxLen).trim()).filter(Boolean).slice(0, r.maxItems);
        if (!items.length) return bad("la lista no puede quedar vacía");
        return ok(items, items.length < v.length ? L`lista recortada a ${items.length} elementos válidos` : undefined);
      }
      case "entries": {
        if (!Array.isArray(v)) return bad("se esperaba una lista de entradas");
        const out = sanitizeEntries(v, null);
        return out.list.length ? ok(out.list, out.note) : bad("el catálogo no puede quedar vacío");
      }
      case "quad": {
        const q = Array.isArray(v) ? v.map((p) => (Array.isArray(p) ? p.map((c) => +c) : p)) : v;
        return validQuad(q) ? ok(q) : bad("geometría no válida (debe ser un cuadrilátero convexo)");
      }
    }
    return bad("valor no válido");
  }

  /* Orden de umbrales y coherencia de rangos. Devuelve notas de ajuste. */
  function enforceInvariants(cfg) {
    const notes = [];
    const th = cfg.sim.thresholds;
    if (th.alarmed < th.notice + 5) { th.alarmed = Math.min(985, th.notice + 5); notes.push("ALARMED subido para quedar por encima de NOTICE"); }
    if (th.panic < th.alarmed + 5) { th.panic = Math.min(990, th.alarmed + 5); notes.push("PANIC subido para quedar por encima de ALARMED"); }
    if (th.alarmed < th.notice + 5) { th.notice = th.alarmed - 5; notes.push("NOTICE bajado para mantener el orden"); }
    const m = cfg.lights.matrix;
    if (m.maxMs < m.minMs) { m.maxMs = m.minMs; notes.push("espera máxima de la matriz igualada a la mínima"); }
    const c = cfg.behavior.coffee;
    if (c.everyMax < c.everyMin) { c.everyMax = c.everyMin; notes.push("intervalo máximo de café igualado al mínimo"); }
    const iv = cfg.memes && cfg.memes.interval;
    if (iv && iv.max < iv.min) { iv.max = iv.min; notes.push("intervalo máximo de los gags igualado al mínimo"); }
    const ch = cfg.chat;
    if (ch && ch.heat.max < ch.heat.amount) { ch.heat.max = ch.heat.amount; notes.push("tope de calor del chat igualado a la subida por evento"); }
    const pp = cfg.catalog && cfg.catalog.popups;
    if (pp && pp.maxWindows < pp.minWindows) { pp.maxWindows = pp.minWindows; notes.push("máximo de ventanas igualado al mínimo"); }
    if (pp && pp.restMax < pp.restMin) { pp.restMax = pp.restMin; notes.push("descanso máximo entre ventanas igualado al mínimo"); }
    return notes;
  }

  /*
   * Migración (etapa 15) antes de validar, para guardados, presets e
   * importaciones antiguos:
   *  - Textos de pantallas y mensajes (content.*, messages.*) → memes.texts[idioma].
   *    Sólo se copian los PERSONALIZADOS (distintos del original de entonces), al
   *    inglés y al idioma elegido, sin pisar lo que ya exista.
   *  - Remate de la negación: el texto original «DON'T LOOK AT THE DUCK» / «NO MIRES
   *    AL PATO» pasa al nuevo; uno personalizado se respeta.
   */
  const LEGACY = [
    ["content.soon.header", "scrSoonHeader", "BROADCAST.EXE"], ["content.soon.badge", "scrSoonBadge", "STANDBY"],
    ["content.soon.lines", "scrSoonLines", ["STARTING", "SOON"]], ["content.soon.footer", "scrSoonFooter", "PLEASE STAND BY"],
    ["content.core.title", "scrCoreTitle", "REACTOR 03 // CORE MONITOR"], ["content.core.shift", "scrShift", "SHIFT B"],
    ["content.core.reactorLabel", "scrReactorLabel", "REACTOR"], ["content.core.temp.label", "scrTempLabel", "CORE TEMP"],
    ["content.core.readouts.0.label", "scrRoPressure", "PRESSURE"], ["content.core.readouts.1.label", "scrRoCoolant", "COOLANT"],
    ["content.core.readouts.2.label", "scrRoRods", "ROD DEPTH"], ["content.core.readouts.3.label", "scrRoOutput", "OUTPUT"],
    ["content.levels.NORMAL", "lvNORMAL", "NOMINAL"], ["content.levels.NOTICE", "lvNOTICE", "CAUTION"],
    ["content.levels.ALARMED", "lvALARMED", "ALARM"], ["content.levels.PANIC", "lvPANIC", "CRITICAL"],
    ["content.status.label", "scrStatusLabel", "CORE STATUS"], ["content.status.loadLabel", "scrLoadLabel", "LOAD"],
    ["content.advisory.label", "scrAdvisoryLabel", "ADVISORY"], ["content.aux.textRows", "scrAuxRows", ["SYS", "OK", "LOOP", "B-2"]],
    ["messages.advisories", "msgAdvisories", ["CORE TEMP WITHIN LIMITS", "PRESSURE STABLE", "COOLANT LOOP B: NOMINAL", "NEXT INSPECTION: 14:00", "ROD BANK C: HOLDING", "VENT CYCLE COMPLETE"]],
    ["messages.jokes", "msgJokes", ["OPERATOR: UNDERCAFFEINATED", "COOLANT STATUS: PROBABLY FINE", "SAFETY MANUAL: MISPLACED", "MORALE: WITHIN TOLERANCE", "DAYS WITHOUT INCIDENT: 0"]],
    ["messages.alerts.NOTICE", "msgAlertsNOTICE", ["CORE TEMP ABOVE NOMINAL", "MONITORING THERMAL DRIFT", "CHECK COOLANT FLOW"]],
    ["messages.alerts.ALARMED", "msgAlertsALARMED", ["ALARM: CORE TEMP HIGH", "INCREASE COOLANT FLOW", "THERMAL LIMIT EXCEEDED"]],
    ["messages.alerts.PANIC", "msgAlertsPANIC", ["CRITICAL: CORE OVERHEAT", "SCRAM RECOMMENDED", "ALL HANDS TO CONSOLE"]],
    ["messages.recovered", "msgRecovered", "CONDITIONS NORMALIZED"],
    ["messages.log", "msgLog", ["PUMP 2 CHECK ........ OK", "LOOP B FLOW ......... OK", "ROD BANK C .......... HOLD", "VENT CYCLE .......... DONE", "SENSOR SWEEP ........ OK"]],
  ];
  const OLD_PUNCH = { en: "DON'T LOOK AT THE DUCK", es: "NO MIRES AL PATO" };
  function migrate(input, defaults) {
    if (!isObj(input)) return { cfg: input, notes: [] };
    const cfg = clone(input), notes = [];
    if (!isObj(cfg.memes)) cfg.memes = {};
    if (!isObj(cfg.memes.texts)) cfg.memes.texts = {};
    const T = cfg.memes.texts;
    const lang = LANGS.includes(cfg.memes.lang) ? cfg.memes.lang : (defaults && defaults.memes && defaults.memes.lang) || "en";
    let moved = 0;
    LEGACY.forEach(([path, key, old]) => {
      const v = getPath(cfg, path);
      if (v === undefined || JSON.stringify(v) === JSON.stringify(old)) return;
      if ((Array.isArray(old) && !Array.isArray(v)) || (!Array.isArray(old) && typeof v !== "string")) return;
      ["en", lang].forEach((lg) => {
        if (!isObj(T[lg])) T[lg] = {};
        if (T[lg][key] === undefined) T[lg][key] = clone(v);
      });
      moved++;
    });
    if (moved) notes.push(L`${moved} texto(s) personalizado(s) de pantallas y mensajes pasados a los textos por idioma`);
    // etapa 17: el cristal de la pantallita de memes (auxFR) se ajustó; la geometría antigua por defecto se actualiza
    const OLD_FR = JSON.stringify([[1334, 482], [1375, 487], [1355, 561], [1307, 549]]);
    if (isObj(cfg.screens) && isObj(cfg.screens.auxFR) && JSON.stringify(cfg.screens.auxFR.quad) === OLD_FR) {
      cfg.screens.auxFR.quad = defaults && defaults.screens ? clone(defaults.screens.auxFR.quad) : cfg.screens.auxFR.quad;
    }
    Object.keys(OLD_PUNCH).forEach((lg) => {
      if (isObj(T[lg]) && T[lg].denialPunch === OLD_PUNCH[lg]) { delete T[lg].denialPunch; notes.push(L`remate de la negación (${lg}) actualizado al nuevo texto`); }
    });
    return { cfg, notes };
  }

  function sanitizeConfig(input, defaults) {
    const warnings = [];
    const mig = migrate(input, defaults);
    input = mig.cfg;
    const ctx = {
      palette: Object.keys(defaults.lights.colors),
      scenarios: Object.keys(defaults.scenarios),
    };

    function walk(inp, def, path) {
      if (isObj(def)) {
        const out = {};
        const src = isObj(inp) ? inp : (inp !== undefined && warnings.push(L`${path || "config"}: estructura no válida, se usa la original`), {});
        for (const k of Object.keys(def)) {
          // Rutas no editables (assets, escenarios) se toman siempre del original
          const p = path ? path + "." + k : k;
          if (FIXED.some((f) => p === f || p.startsWith(f + ".")) || FIXED_RE.some((re) => re.test(p))) { out[k] = clone(def[k]); continue; }
          out[k] = walk(src[k], def[k], p);
        }
        return out;
      }
      if (Array.isArray(def)) {
        if (path === "catalog.entries") {
          const res = sanitizeEntries(inp === undefined ? def : inp, def);
          if (res.note) warnings.push(`catalog.entries: ${res.note}`);
          return res.list;
        }
        const r = ruleFor(path);
        if (r && (r.type === "list" || r.type === "quad")) return leaf(inp, def, path);
        if (path === "lights.items") return walkItems(inp, def);
        if (def.length && isObj(def[0])) {
          // lista de objetos con forma fija (readouts, lamps, spill...)
          const src = Array.isArray(inp) && inp.length === def.length ? inp : (inp !== undefined && warnings.push(L`${path}: lista no válida, se usa la original`), def);
          return def.map((d, i) => walk(src[i], d, path + "." + i));
        }
        return clone(def); // geometría interna (columnas de la matriz, etc.)
      }
      return leaf(inp, def, path);
    }

    function leaf(inp, def, path) {
      if (inp === undefined) return clone(def);
      const res = checkValue(path, inp, clone(def), ctx);
      if (!res.ok) warnings.push(L`${path}: ${res.note}`);
      else if (res.note) warnings.push(L`${path}: ${res.note}`);
      return res.value;
    }

    function walkItems(inp, def) {
      if (!Array.isArray(inp)) { if (inp !== undefined) warnings.push("lights.items: no es una lista"); return clone(def); }
      const tmpl = def[0];
      const byId = Object.fromEntries(def.map((d) => [d.id, d]));
      const seen = new Set();
      const out = [];
      inp.slice(0, 60).forEach((it, i) => {
        if (!isObj(it)) { warnings.push(L`lights.items.${i}: luz no válida`); return; }
        const base = byId[it.id] || tmpl;
        let id = typeof it.id === "string" && it.id.trim() ? cleanText(it.id, 24) : `light-${i + 1}`;
        while (seen.has(id)) id += "-b";
        seen.add(id);
        const o = {};
        for (const k of Object.keys(tmpl)) o[k] = leaf(it[k], base[k] !== undefined ? base[k] : tmpl[k], `lights.items.${i}.${k}`);
        o.id = id;
        out.push(o);
      });
      return out.length ? out : clone(def);
    }

    const cfg = walk(input, defaults, "");
    cfg.schemaVersion = defaults.schemaVersion;
    warnings.push(...enforceInvariants(cfg));
    return { config: cfg, warnings };
  }

  // Partes que no se editan desde el laboratorio (siempre las del original)
  const FIXED = ["stage", "states", "frames", "sequence", "independent", "initialState", "scenarios", "duck.canvas", "duck.anchor", "schemaVersion", "memes.button",
    "shadow.wheels.points", "lights.matrix.cols", "lights.matrix.rows", "lights.matrix.cell", "lights.bar.cols", "lights.bar.rows", "lights.bar.cell", "lights.bar.scanRow"];

  const FIXED_RE = [/^screens\.[^.]+\.(kind|width|height)$/, /^content\.core\.readouts\.\d+\.key$/, /^ambient\.spill\.items\.\d+\.id$/];

  DR.schema = { LANGS, migrate, CAT, sanitizeEntry, sanitizeEntries, LEVELS, POSES, RULES, ruleFor, checkValue, validQuad, sanitizeConfig, enforceInvariants };
})();

;
/* ---- src/store.js ---- */
/*
 * Duck Reactor — almacén de configuración.
 *
 * Una única configuración viva (store.cfg). Todo cambio pasa por set(),
 * replace() o resetSection(), que validan con DR.schema y avisan a los
 * suscriptores con las rutas modificadas, para que cada módulo actualice
 * sólo lo necesario.
 *
 * window.DR.createStore(defaults) → store
 */
(function () {
  "use strict";
  const L = (window.DR && window.DR.i18n) ? window.DR.i18n.L : (s, ...v) => s.reduce((a, x, i) => a + (i ? String(v[i - 1]) : "") + x, ""); // textos del laboratorio (etapa 15)
  const DR = (window.DR = window.DR || {});
  const { clone, getPath, setPath, diff } = DR.util;
  const S = DR.schema;

  function createStore(defaults) {
    const original = clone(defaults);
    let cfg = S.sanitizeConfig(clone(defaults), original).config;
    const listeners = new Set();
    const ctx = () => ({ palette: Object.keys(original.lights.colors), scenarios: Object.keys(original.scenarios) });

    function emit(paths, meta) {
      listeners.forEach((fn) => {
        try { fn(paths, meta || {}); } catch (e) { console.error("[duck-reactor] listener", e); }
      });
    }

    /* Cambia un valor. Devuelve { ok, value, note }. No emite si no cambia. */
    function set(path, value, meta) {
      const fallback = getPath(cfg, path);
      const res = S.checkValue(path, value, fallback, ctx());
      if (!res.ok) return res;
      const before = JSON.stringify(fallback);
      setPath(cfg, path, res.value);
      const notes = S.enforceInvariants(cfg);
      if (notes.length) res.note = [res.note, ...notes].filter(Boolean).join(" · ");
      if (JSON.stringify(res.value) !== before || notes.length) emit(notes.length ? [path, "sim.thresholds", "lights.matrix", "behavior.coffee", "memes.interval"] : [path], meta);
      return res;
    }

    /* Varios cambios de golpe con una sola notificación. */
    function setMany(entries, meta) {
      const paths = [];
      for (const [p, v] of entries) {
        const res = S.checkValue(p, v, getPath(cfg, p), ctx());
        if (res.ok) { setPath(cfg, p, res.value); paths.push(p); }
      }
      S.enforceInvariants(cfg);
      if (paths.length) emit(paths, meta);
    }

    /* Sustituye toda la configuración (preset, importación). */
    function replace(input, meta) {
      const res = S.sanitizeConfig(input, original);
      cfg = res.config;
      emit(["*"], Object.assign({ full: true }, meta));
      return res.warnings;
    }

    function resetSection(prefixes, meta) {
      const list = Array.isArray(prefixes) ? prefixes : [prefixes];
      for (const p of list) setPath(cfg, p, clone(getPath(original, p)));
      S.enforceInvariants(cfg);
      emit(list, Object.assign({ reset: true }, meta));
    }

    function resetAll(meta) { return replace(clone(original), Object.assign({ reset: true }, meta)); }

    return {
      get cfg() { return cfg; },
      original,
      get: (path) => getPath(cfg, path),
      getOriginal: (path) => getPath(original, path),
      set, setMany, replace, resetSection, resetAll,
      diff: () => diff(original, cfg),
      on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      listenerCount: () => listeners.size,
      snapshot: () => clone(cfg),
    };
  }

  /* ---------------------------------------------- guardado local y presets */
  const KEY = "duckReactorLab.v3";
  function createPersist() {
    let mem = { current: null, presets: {} };
    let available = false, lastError = "";
    try {
      const k = "__dr_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      available = true;
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") mem = { current: data.current || null, presets: data.presets || {} };
      }
    } catch (e) {
      available = false;
      lastError = "Este navegador no deja guardar datos locales (habitual al abrir desde disco en algunos navegadores o en modo privado). Usa Exportar JSON para no perder tus ajustes.";
    }
    function write() {
      if (!available) return false;
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ schemaVersion: (mem.current && mem.current.schemaVersion) || 13, current: mem.current, presets: mem.presets }));
        lastError = "";
        return true;
      } catch (e) {
        lastError = "No se pudo guardar en el navegador (espacio lleno o bloqueado). Usa Exportar JSON.";
        return false;
      }
    }
    return {
      get available() { return available; },
      get lastError() { return lastError; },
      loadCurrent: () => mem.current,
      saveCurrent(cfg) { mem.current = cfg; return write(); },
      clearCurrent() { mem.current = null; return write(); },
      listPresets: () => Object.keys(mem.presets).sort().map((name) => ({ name, savedAt: mem.presets[name].savedAt })),
      getPreset: (name) => (mem.presets[name] ? mem.presets[name].config : null),
      savePreset(name, cfg) { mem.presets[name] = { savedAt: new Date().toISOString(), config: cfg }; return write(); },
      deletePreset(name) { delete mem.presets[name]; return write(); },
    };
  }

  /* ---------------------------------------------- exportar / importar */
  const FORMAT = "duck-reactor-config";
  function exportJSON(cfg) {
    return JSON.stringify({ format: FORMAT, schemaVersion: cfg.schemaVersion, exportedAt: new Date().toISOString(), config: cfg }, null, 2);
  }
  function exportConfigJs(cfg) {
    return "/*\n * Duck Reactor — configuración exportada desde el laboratorio (" + new Date().toISOString() + ").\n" +
      " * Sustituye src/config.js por este archivo para usarla como configuración por defecto.\n */\n" +
      "window.DUCK_REACTOR_CONFIG = " + JSON.stringify(cfg, null, 2) + ";\n";
  }
  /* Acepta el envoltorio exportado o un objeto de configuración directo. */
  function parseImport(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error("El texto no es JSON válido."); }
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("El JSON no contiene un objeto de configuración.");
    let cfg = data;
    if (data.format === FORMAT) cfg = data.config;
    else if (data.format) throw new Error(L`Formato desconocido: ${String(data.format).slice(0, 40)}.`);
    if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) throw new Error("Falta el bloque de configuración.");
    const known = ["duck", "sim", "lights", "screens", "content", "messages", "crt", "ambient", "behavior", "shadow", "grade", "memes", "display", "stream", "chat", "emergency", "demo", "catalog", "life", "audio"];
    if (!known.some((k) => k in cfg)) throw new Error("No parece una configuración de Duck Reactor.");
    const version = cfg.schemaVersion || data.schemaVersion || 0;
    return { config: cfg, version };
  }
  /* Descarga un archivo (funciona desde file://). Devuelve false si el navegador lo impide. */
  function download(filename, text, mime) {
    try {
      const blob = new Blob([text], { type: mime || "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
      return true;
    } catch (e) {
      return false;
    }
  }

  /*
   * Guarda un archivo: en una página publicada de claude.ai usa la capacidad
   * `downloads` (con confirmación del usuario); abriendo desde disco, una
   * descarga normal. Devuelve { ok, message }.
   */
  let dlCap;
  async function saveFile(filename, text, mime) {
    if (window.claude && typeof window.claude.use === "function") {
      if (dlCap === undefined) { try { dlCap = await window.claude.use("downloads"); } catch (e) { dlCap = null; } }
      if (dlCap) {
        // .js no está permitido en ese visor: se ofrece como .txt
        const name = /\.(json|txt|md|csv|html)$/i.test(filename) ? filename : filename + ".txt";
        try {
          await dlCap.save({ filename: name, data: text });
          return { ok: true, message: name !== filename ? L`Guardado como ${name} (renómbralo a ${filename}).` : L`Guardado: ${name}.` };
        } catch (e) {
          const code = e && e.code;
          if (code === "declined") return { ok: false, message: "Descarga cancelada." };
          return { ok: false, message: "Este visor no permite descargar: copia el texto de abajo." };
        }
      }
    }
    const ok = download(filename, text, mime);
    return { ok, message: ok ? L`Descarga iniciada: ${filename}.` : "El navegador bloqueó la descarga: copia el texto de abajo." };
  }

  DR.createStore = createStore;
  DR.createPersist = createPersist;
  DR.io = { exportJSON, exportConfigJs, parseImport, download, saveFile, FORMAT };
})();

;
/* ---- src/catalog.js ---- */
/*
 * Duck Reactor — selector del catálogo de memes (etapa 12).
 *
 * Elige entradas de config.catalog.entries con memoria:
 *   - Sin reposición: no repite una entrada hasta haber usado todas las
 *     compatibles (mismo tipo, contexto, idioma y grupo/individual). Al
 *     agotarse se vuelve a llenar ese grupo, sin repetir la última.
 *   - Evita la misma familia dos veces seguidas si hay alternativa.
 *   - Respeta el enfriamiento (cooldown) de cada entrada si hay alternativa.
 *   - Peso relativo de cada entrada.
 * Historial reciente (también para el laboratorio) y reinicio. La memoria se
 * guarda en el navegador si se puede (clave aparte, nunca en los ajustes).
 *
 * window.DuckReactorCatalog.create(store) → {
 *   pick(kind, opts), text(entry, lang), available(entry, lang), get(id), list(),
 *   history(), resetHistory(), onChange(fn), FAMILY_ES, CTX_ES
 * }
 */
(function () {
  "use strict";
  const KEY = "duckReactor.memeMemory.v1";
  const FAMILY_ES = {
    error: "Error del sistema", hack: "Consola de intrusión", achievement: "Logro desbloqueado",
    dialog: "Diálogo con botones absurdos", progress: "Barra de progreso que falla",
    gamer: "Jerga gamer", oficina: "Oficina y turnos", heroe: "Heroicidad", pato: "El pato", equipo: "Esfuerzo colectivo", tecnica: "Técnica",
    cafeina: "Cafeína", protocolo: "Protocolo", calma: "Calma",
  };
  const CTX_ES = {
    popup: { start: "Inicio de la crisis", any: "Durante la crisis", long: "Crisis larga" },
    sub: { critical: "Ayuda en progreso (sigue CRITICAL)", recovery: "Recuperación (salió de CRITICAL)", normal: "Normalidad (ya seguro)" },
    coffee: { after: "Café tras una crisis", calm: "Café sin crisis", any: "Cualquier café" },
  };
  const KIND_ES = { popup: "Popup de crisis", sub: "Frase de suscripción", coffee: "Remate de café" };

  function create(store) {
    const C = () => store.cfg.catalog;
    const listeners = new Set();
    let mem = { used: {}, lastAt: {}, lastFamily: {}, lastId: {}, history: [] };
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === "object") mem = Object.assign(mem, {
          used: d.used || {}, lastAt: d.lastAt || {}, lastFamily: d.lastFamily || {}, lastId: d.lastId || {},
          history: Array.isArray(d.history) ? d.history.slice(-40) : [],
        });
      }
    } catch (e) { /* sin almacenamiento: memoria sólo en esta sesión */ }
    let saveT = 0;
    function save() {
      clearTimeout(saveT);
      saveT = setTimeout(() => { try { window.localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* nada */ } }, 400);
    }
    const emit = () => listeners.forEach((fn) => { try { fn(); } catch (e) { console.error("[duck-reactor] catalog listener", e); } });

    const list = () => (C() && C().entries) || [];
    const get = (id) => list().find((e) => e.id === id) || null;
    /*
     * Variante de idioma de una entrada. Si la entrada no tiene texto en ese
     * idioma (entradas propias a medio traducir), se usa la alternativa definida
     * (inglés → español → resto); nunca se inventa una traducción.
     */
    const chain = (l) => (window.DR && DR.i18n ? DR.i18n.chain(l) : [l, "en", "es"]);
    const variant = (e, lang) => { if (!e) return null; for (const l of chain(lang)) if (e[l] && e[l].main) return l; return null; };
    const available = (e, lang) => !!(e && (e.lang === "all" || e.lang === lang) && variant(e, lang));
    function text(e, lang) {
      if (!available(e, lang)) return null;
      return Object.assign({}, e[variant(e, lang)]);
    }

    /*
     * opts: { ctx: [..], who: "one"|"group", lang, exclude: [ids], source }
     * Devuelve la entrada elegida o null si no hay ninguna compatible.
     */
    function pick(kind, opts) {
      opts = opts || {};
      const lang = opts.lang || "en";
      const ctxs = opts.ctx || null;
      const exclude = new Set(opts.exclude || []);
      const okWho = (e) => kind !== "sub" || !opts.who || e.who === "any" || e.who === opts.who;
      const eligible = list().filter((e) => e.kind === kind && e.on && e.weight > 0 && available(e, lang) &&
        (!ctxs || ctxs.includes(e.ctx)) && okWho(e) && !exclude.has(e.id) && (!opts.filter || opts.filter(e)));
      if (!eligible.length) return null;
      const used = new Set(mem.used[kind] || []);
      let fresh = eligible.filter((e) => !used.has(e.id));
      if (!fresh.length) {
        // grupo agotado: se vuelve a llenar (sin repetir la última si hay más)
        eligible.forEach((e) => used.delete(e.id));
        fresh = eligible.length > 1 ? eligible.filter((e) => e.id !== mem.lastId[kind]) : eligible;
      }
      const now = Date.now();
      const cooled = fresh.filter((e) => !(e.cooldown > 0 && mem.lastAt[e.id] && now - mem.lastAt[e.id] < e.cooldown * 1000));
      let pool = cooled.length ? cooled : fresh;
      const fam = opts.avoidFamily || mem.lastFamily[kind];
      const other = pool.filter((e) => e.family !== fam);
      if (other.length) pool = other;
      let total = pool.reduce((s, e) => s + e.weight, 0), r = Math.random() * total, chosen = pool[pool.length - 1];
      for (const e of pool) { r -= e.weight; if (r <= 0) { chosen = e; break; } }
      used.add(chosen.id);
      mem.used[kind] = [...used];
      mem.lastAt[chosen.id] = now;
      mem.lastFamily[kind] = chosen.family;
      mem.lastId[kind] = chosen.id;
      mem.history.push({ id: chosen.id, kind, family: chosen.family, ctx: chosen.ctx, at: now, source: opts.source || "auto" });
      if (mem.history.length > 40) mem.history.splice(0, mem.history.length - 40);
      save();
      emit();
      return chosen;
    }

    function resetHistory() {
      mem = { used: {}, lastAt: {}, lastFamily: {}, lastId: {}, history: [] };
      save();
      emit();
    }

    function counts() {
      const out = { popup: 0, sub: 0, coffee: 0, on: 0, custom: 0 };
      list().forEach((e) => { out[e.kind]++; if (e.on) out.on++; if (e.custom) out.custom++; });
      return out;
    }

    return {
      pick, text, available, variant, get, list, counts,
      history: () => mem.history.slice(),
      usedCount: (kind) => (mem.used[kind] || []).length,
      resetHistory,
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      FAMILY_ES, CTX_ES, KIND_ES,
    };
  }

  window.DuckReactorCatalog = { create, FAMILY_ES, CTX_ES, KIND_ES };
})();

;
/* ---- src/sim.js ---- */
/*
 * Duck Reactor — simulador ficticio (herramienta de prueba, no un modelo físico).
 *
 * Un único estado compartido: pantallas, luces y pato leen de aquí.
 * Reloj propio de simulación: avanza con la velocidad elegida, se pausa,
 * y puede avanzar paso a paso. El historial guarda marcas de tiempo de ese
 * reloj, así que el gráfico de 60 s y la tendencia de 5 s son correctos a
 * cualquier velocidad.
 *
 * window.DR.createSim(store) → sim
 *   sim.state                       lecturas actuales + nivel
 *   sim.on(fn)                      fn(evento, datos) · eventos: update | level | reset | emergency
 *   sim.play() / pause() / toggle() / step(s) / reset()
 *   sim.history(ventana)            [[t, temp], ...] dentro de la ventana
 *   sim.tempAt(t)                   temperatura interpolada
 */
(function () {
  "use strict";
  const DR = (window.DR = window.DR || {});
  const LEVELS = DR.schema.LEVELS;
  const clamp = DR.util.clamp;

  const SAMPLE = 0.5;      // s de simulación entre muestras del historial
  const KEEP = 70;         // s de historial guardados
  const SUBSTEP = 0.25;    // integración en pasos de como mucho 0,25 s

  /* Efecto de la refrigeración sobre la temperatura de equilibrio. */
  const coolEffect = (c) => (c < 1 ? 230 * (1 - c) : -110 * (c - 1));

  function createSim(store) {
    const listeners = new Set();
    const C = () => store.cfg;
    let running = true;
    let destroyed = false;
    let seedPhases = [0.7, 2.1, 4.4, 1.3, 3.8, 5.2];

    const st = {
      t: 0, temp: 612, pressure: 14.2, coolant: 87, rods: 62, output: 1180, load: 64,
      heating: 1, cooling: 1, level: "NORMAL", levelIndex: 0, mode: "auto",
      pending: null, rec: null, lastSample: 0, core: 612, scenarioEnded: false,
      excursion: null,
      coolLeft: 0, coolRate: 0, manualOffset: 0, cooled: 0,
      // «Chat al mando»: calor añadido por el público (°C sobre lo normal), su
      // entrada repartida, el tiempo en CRITICAL y la intervención del becario
      chatHeat: 0, heatLeft: 0, heatRate: 0, critSince: null, becario: null,
      // Demostración en vivo: desfase sobre el guion de temperatura (enfriamientos reales)
      demoOffset: 0,
    };
    /*
     * Guion de la demostración (demo.js): mientras está puesto, la temperatura
     * base sale de driver.temp(t) en lugar del modo auto/manual/escenario. El
     * resto de lecturas se derivan de ella como en automático, y los niveles
     * siguen los umbrales, la histéresis y los retardos de siempre.
     */
    let driver = null;
    let speedOverride = null;
    const TMIN = 20; // mínimo permitido (regla sim.*.temp)
    let hist = [];

    /* Ruido determinista en función del tiempo de simulación (reproducible). */
    const noise = (t, ch) => {
      const p = seedPhases[ch % seedPhases.length];
      return 0.55 * Math.sin(t / 3.7 + p) + 0.3 * Math.sin(t / 1.9 + p * 2.1) + 0.15 * Math.sin(t / 0.83 + p * 3.3);
    };
    const drift = (t, amp) => amp * (0.65 * Math.sin(t / 23) + 0.35 * Math.sin(t / 9.1 + 1.3));

    function scenario() { return C().scenarios[C().sim.scenario] || C().scenarios.normal; }

    /* Calentamiento/refrigeración vigentes según el modo. */
    function drivers(t) {
      const s = C().sim;
      if (s.mode === "scenario") {
        const sc = scenario(), k = sc.keys;
        let h = k[k.length - 1][1], c = k[k.length - 1][2];
        for (let i = 0; i < k.length - 1; i++) {
          if (t >= k[i][0] && t <= k[i + 1][0]) {
            const f = (t - k[i][0]) / Math.max(1e-6, k[i + 1][0] - k[i][0]);
            h = k[i][1] + (k[i + 1][1] - k[i][1]) * f;
            c = k[i][2] + (k[i + 1][2] - k[i][2]) * f;
            break;
          }
        }
        return { h, c, response: sc.response || s.auto.response, fluct: s.auto.fluctuation, drift: s.auto.drift };
      }
      return { h: s.auto.heating, c: s.auto.cooling, response: s.auto.response, fluct: s.auto.fluctuation, drift: s.auto.drift };
    }

    /*
     * Subida temporal de temperatura (sólo la usa el botón del gag si se
     * configura «escalate»): sube en 3 s, se mantiene y baja en 8 s.
     */
    function excursion() {
      const x = st.excursion;
      if (!x) return 0;
      const e = st.t - x.start;
      if (e < 0) return 0;
      let k = 1;
      if (e < 3) k = e / 3;
      else if (st.t > x.until) {
        k = 1 - (st.t - x.until) / 8;
        if (k <= 0) { st.excursion = null; return 0; }
      }
      return x.amount * k;
    }

    /* Calcula todas las lecturas para el instante actual. */
    function readings(dt) {
      const s = C().sim, b = s.base;
      if (driver) {
        const n = (ch) => noise(st.t, ch);
        const T = driver.temp(st.t);
        st.core = T;
        st.temp = clamp(T + s.auto.fluctuation * n(0) + st.demoOffset + st.chatHeat + excursion(), TMIN, 1000);
        const dT = st.temp - b.temp, up = Math.max(0, dT);
        const h = 1 + up / 280, c = Math.max(0.15, 1 - up / 400);
        st.heating = h; st.cooling = c;
        st.coolant = clamp(b.coolant * Math.min(c, 1.15) + 1.2 * n(1), 0, 100);
        st.pressure = clamp(b.pressure + dT * 0.035 + 0.15 * n(2), 0, 30);
        st.rods = clamp(b.rods - 18 * (h - 1) + 0.5 * n(3), 0, 100);
        st.output = clamp(b.output * (0.75 + 0.25 * h) + 5 * n(4), 0, 2000);
        st.load = clamp(b.load + 22 * (h - 1) + dT * 0.05 + 2 * n(5), 0, 100);
        return;
      }
      if (s.mode === "manual") {
        Object.assign(st, s.manual);
        st.temp = clamp(st.temp + st.manualOffset + st.chatHeat + excursion(), TMIN, 1000);
        st.core = st.temp;
        st.heating = 1; st.cooling = 1;
        return;
      }
      const d = drivers(st.t);
      const target = clamp(b.temp + 140 * (d.h - 1) + coolEffect(d.c), 250, 960) + drift(st.t, d.drift);
      if (dt > 0) st.core += (target - st.core) * (1 - Math.exp(-dt / d.response));
      const n = (ch) => noise(st.t, ch);
      st.heating = d.h; st.cooling = d.c;
      st.temp = clamp(st.core + d.fluct * n(0) + excursion() + st.chatHeat, 20, 1000);
      const dT = st.temp - b.temp;
      st.coolant = clamp(b.coolant * Math.min(d.c, 1.15) + 1.2 * n(1), 0, 100);
      st.pressure = clamp(b.pressure + dT * 0.035 + 0.15 * n(2), 0, 30);
      st.rods = clamp(b.rods - 18 * (d.h - 1) + 0.5 * n(3), 0, 100);
      st.output = clamp(b.output * (0.75 + 0.25 * d.h) + 5 * n(4), 0, 2000);
      st.load = clamp(b.load + 22 * (d.h - 1) + dT * 0.05 + 2 * n(5), 0, 100);
    }

    /* Nivel bruto según la temperatura (sin retardos ni histéresis). */
    function rawLevel(temp) {
      const th = C().sim.thresholds;
      if (temp >= th.panic) return 3;
      if (temp >= th.alarmed) return 2;
      if (temp >= th.notice) return 1;
      return 0;
    }

    /*
     * Subir de nivel: el nivel bruto debe mantenerse escalateDelay segundos.
     * Bajar: la temperatura debe quedar `hysteresis` °C por debajo del umbral
     * del nivel actual durante recoverDelay segundos; se baja de uno en uno.
     */
    function evaluateLevel() {
      const th = C().sim.thresholds;
      const bounds = [-Infinity, th.notice, th.alarmed, th.panic];
      const cur = st.levelIndex, raw = rawLevel(st.temp);
      let dir = null;
      if (raw > cur) dir = "up";
      else if (cur > 0 && st.temp < bounds[cur] - th.hysteresis) dir = "down";
      /*
       * Recuperación en curso (etapa 13): empieza cuando la temperatura queda por
       * debajo del umbral y el nivel sólo espera su retardo (a los 0,3 s, o al
       * momento si hay un enfriamiento real en marcha, para no parpadear con el
       * ruido). Sigue mientras la temperatura baje aunque esté entre dos
       * escalones; termina si deja de bajar, si vuelve a subir o al llegar a normal.
       */
      const falling = st.temp < tempAt(st.t - 2) - 1;
      if (!dir) { st.pending = null; if (!(st.rec && falling)) setRecovery(false); return; }
      if (!st.pending || st.pending.dir !== dir) st.pending = { dir, since: st.t };
      if (dir === "down") { if (!st.rec && (st.t - st.pending.since >= 0.3 || st.coolLeft > 0)) setRecovery(true); }
      else setRecovery(false);
      const wait = dir === "up" ? th.escalateDelay : th.recoverDelay;
      if (st.t - st.pending.since >= wait - 1e-9) {
        setLevel(dir === "up" ? raw : cur - 1);
        st.pending = null;
        if (st.levelIndex === 0) setRecovery(false);
      }
    }
    function tempAt(t) {
      if (!hist.length) return st.temp;
      if (t <= hist[0][0]) return hist[0][1];
      for (let i = hist.length - 1; i > 0; i--) {
        const a = hist[i - 1], b = hist[i];
        if (t >= a[0] && t <= b[0]) return a[1] + (b[1] - a[1]) * ((t - a[0]) / Math.max(1e-9, b[0] - a[0]));
      }
      return st.temp;
    }
    function setRecovery(on) {
      if (!!st.rec === !!on) return;
      st.rec = on ? { since: st.t, from: st.level } : null;
      emit("recovery", { on: !!on, level: st.level });
    }
    /*
     * Estado de la recuperación: nivel que ya sostiene la temperatura (con
     * histéresis), segundos hasta el siguiente escalón y hasta el estado seguro
     * (los retardos de siempre, sin acortarlos ni alargarlos) y tendencia.
     */
    function recoveryInfo() {
      if (!st.rec || st.levelIndex === 0) return null;
      const th = C().sim.thresholds;
      const bounds = [-Infinity, th.notice, th.alarmed, th.panic];
      let target = st.levelIndex;
      while (target > 0 && st.temp < bounds[target] - th.hysteresis) target--;
      const down = st.pending && st.pending.dir === "down";
      const age = down ? st.t - st.pending.since : 0;
      const left = down ? Math.max(0, th.recoverDelay - age) : th.recoverDelay;
      const rate = (st.temp - tempAt(st.t - 3)) / 3;
      // estado seguro: los retardos que faltan y, si aún no está por debajo del
      // umbral normal, el tiempo que tardará en llegar al ritmo actual
      const steps = Math.max(1, st.levelIndex - target);
      const byDelays = left + (st.levelIndex - 1) * th.recoverDelay;
      const toSafe = st.temp > th.notice - th.hysteresis ? (st.temp - (th.notice - th.hysteresis)) / Math.max(0.5, -rate) + th.recoverDelay : 0;
      // Cuenta atrás sólo cuando es segura: la temperatura ya está en la banda
      // normal y sólo faltan los retardos de confirmación. Si aún tiene que
      // bajar, el estado seguro queda «pendiente» (sin inventar una cifra).
      const certain = st.temp < th.notice - th.hysteresis;
      return { from: st.rec.from, level: st.level, target: LEVELS[target], left, steps, rate, since: st.rec.since,
        certain, eta: certain ? byDelays : null, estimate: Math.min(99, Math.max(byDelays, toSafe)), confirming: down };
    }

    function setLevel(i, extra) {
      if (i === st.levelIndex) return;
      const from = st.level;
      st.levelIndex = i;
      st.level = LEVELS[i];
      emit("level", Object.assign({ from, to: st.level }, extra || {}));
    }

    /*
     * Enfriamiento real (evento «nuevo suscriptor»). Es el controlador central:
     * baja la temperatura del propio simulador, no el número de la pantalla.
     *   auto/escenario: baja el núcleo (st.core); después la dinámica normal
     *     sigue actuando (si el equilibrio es alto, puede volver a calentarse).
     *   manual: un desfase sobre el valor manual (se anula si cambias el valor
     *     manual a mano, reinicias o cambias de modo).
     * Nunca baja de TMIN.
     */
    function applyCool(x) {
      const d = Math.max(0, Math.min(x, st.temp - TMIN));
      if (d <= 0) return 0;
      // primero se va el calor que metió el chat (así no vuelve a subir solo)
      const h = Math.min(d, st.chatHeat);
      st.chatHeat -= h;
      if (driver) st.demoOffset -= d - h;
      else if (C().sim.mode === "manual") st.manualOffset -= d - h;
      else st.core -= d - h;
      st.cooled += d;
      return d;
    }
    /*
     * Calor del chat («No tocar»): un término que se suma a la temperatura en
     * todos los modos (en manual, sobre el valor fijado, que no se toca). Sube
     * enseguida, se mantiene y se va al disiparse o al enfriar. Tope: chat.heat.max.
     */
    function applyHeat(x) {
      const room = Math.max(0, Math.min(C().chat.heat.max - st.chatHeat, 1000 - st.temp));
      const a = Math.max(0, Math.min(x, room));
      if (a <= 0) return 0;
      st.chatHeat += a;
      return a;
    }
    /* Disipación natural del calor del chat (vida media en s de simulación). */
    function dissipate(dt) {
      if (st.chatHeat <= 0 || !C().chat.recovery.selfResolve) return; // sin «se resuelve sola», el calor se queda hasta que lo enfríen
      const hl = Math.max(1, C().chat.recovery.halfLife);
      st.chatHeat *= Math.pow(0.5, dt / hl);
      if (st.chatHeat < 0.05) st.chatHeat = 0;
    }
    /*
     * Crisis sin público: si CRITICAL dura chat.recovery.after s de simulación,
     * entra el becario y enfría poco a poco hasta salir de la crisis. No actúa
     * en escenarios (son guiones) y en manual sólo retira el calor del chat.
     */
    function emergency(dt) {
      const R = C().chat.recovery, th = C().sim.thresholds, mode = C().sim.mode;
      if (st.level === "PANIC") { if (st.critSince == null) st.critSince = st.t; }
      else if (!st.becario) st.critSince = null;
      const allowed = C().chat.enabled && R.selfResolve && R.emergency && mode !== "scenario" && !driver; // el guion de la demo manda
      if (!st.becario) {
        if (allowed && st.level === "PANIC" && st.t - st.critSince >= R.after - 1e-9 && (mode !== "manual" || st.chatHeat > 0.5)) {
          st.becario = { since: st.t, cooled: 0 };
          emit("emergency", { on: true });
        }
        return;
      }
      if (!allowed) { stopBecario("desactivado"); return; }
      const x = R.rate * dt;
      const h = Math.min(x, st.chatHeat);
      st.chatHeat -= h;
      let d = h;
      if (mode !== "manual" && x > h) { const c = Math.max(0, Math.min(x - h, st.core - TMIN)); st.core -= c; d += c; }
      st.becario.cooled += d;
      const out = st.temp < th.panic - th.hysteresis - 15 && st.chatHeat < 1;
      if (out || (mode === "manual" && st.chatHeat <= 0.05)) stopBecario(out ? "crisis resuelta" : "sin calor del chat que retirar");
    }
    function stopBecario(why) {
      if (!st.becario) return;
      const b = st.becario;
      st.becario = null;
      st.critSince = st.level === "PANIC" ? st.t : null; // si sigue en crisis, vuelve a contar
      emit("emergency", { on: false, why, cooled: b.cooled });
    }
    /*
     * Nivel recalculado al momento desde la temperatura, con histéresis pero SIN
     * retardos (los retardos se miden en tiempo de simulación). Se usa cuando la
     * simulación está en pausa: baja de uno en uno y emite los mismos eventos
     * de nivel (con instant: true), así luces, pantallas y pato quedan coherentes.
     */
    function settleLevel() {
      const th = C().sim.thresholds;
      const bounds = [-Infinity, th.notice, th.alarmed, th.panic];
      const raw = rawLevel(st.temp);
      if (raw > st.levelIndex) setLevel(raw, { instant: true });
      else while (st.levelIndex > 0 && st.temp < bounds[st.levelIndex] - th.hysteresis) setLevel(st.levelIndex - 1, { instant: true });
      st.pending = null;
      setRecovery(false);
    }

    function sample(force) {
      while (force || st.t >= st.lastSample + SAMPLE - 1e-9) {
        if (!force) st.lastSample += SAMPLE;
        hist.push([force ? st.t : st.lastSample, st.temp]);
        if (force) break;
      }
      const cutoff = st.t - KEEP;
      while (hist.length && hist[0][0] < cutoff) hist.shift();
    }

    function advance(seconds) {
      let left = seconds;
      while (left > 1e-9) {
        const dt = Math.min(SUBSTEP, left);
        st.t += dt;
        left -= dt;
        if (st.heatLeft > 0) {
          const x = Math.min(st.heatLeft, st.heatRate * dt);
          st.heatLeft -= x;
          applyHeat(x);
          if (st.heatLeft < 1e-6) { st.heatLeft = 0; st.heatRate = 0; }
        }
        if (st.coolLeft > 0) {
          const x = Math.min(st.coolLeft, st.coolRate * dt);
          st.coolLeft -= x;
          applyCool(x);
          if (st.coolLeft < 1e-6) { st.coolLeft = 0; st.coolRate = 0; }
        }
        dissipate(dt);
        emergency(dt);
        readings(dt);
        evaluateLevel();
        sample();
      }
      if (C().sim.mode === "scenario") st.scenarioEnded = st.t >= scenario().duration;
      emit("update");
    }

    function reset() {
      const s = C().sim;
      st.t = 0;
      st.lastSample = 0;
      st.pending = null;
      st.rec = null;
      st.scenarioEnded = false;
      st.excursion = null;
      st.coolLeft = 0; st.coolRate = 0; st.manualOffset = 0; st.cooled = 0;
      st.chatHeat = 0; st.heatLeft = 0; st.heatRate = 0; st.critSince = null; st.becario = null; st.demoOffset = 0;
      st.mode = s.mode;
      st.core = driver ? driver.temp(0) : s.mode === "scenario" ? scenario().start : s.mode === "manual" ? s.manual.temp : s.base.temp;
      readings(0);
      // Historial previo plano (con su ruido) para que el gráfico no empiece vacío
      hist = [];
      const fl = s.mode === "manual" && !driver ? 0 : s.auto.fluctuation;
      for (let k = -60; k < 0; k += SAMPLE) hist.push([k, st.core + fl * noise(k, 0)]);
      sample(true);
      // Al reiniciar, el nivel se toma directamente de la temperatura inicial
      const i = rawLevel(st.temp), from = st.level;
      st.levelIndex = i;
      st.level = LEVELS[i];
      emit("reset", { from, to: st.level });
      emit("update");
    }

    function emit(type, data) {
      listeners.forEach((fn) => {
        try { fn(type, data || {}); } catch (e) { console.error("[duck-reactor] sim listener", e); }
      });
    }

    /* Reloj real → reloj de simulación */
    let last = performance.now();
    const ticker = setInterval(() => {
      const now = performance.now();
      const dtReal = Math.min(0.25, (now - last) / 1000);
      last = now;
      if (running && !destroyed) advance(dtReal * (speedOverride != null ? speedOverride : C().sim.speed));
    }, 100);

    /* Reacciones a cambios de configuración */
    const off = store.on((paths, meta) => {
      if (meta.source === "sim") return;
      if (driver && !paths.includes("*")) return; // durante la demostración el guion manda (la configuración se restaura al salir)
      const has = (p) => paths.includes("*") || paths.some((x) => x === p || x.startsWith(p + "."));
      const s = C().sim;
      if (paths.includes("*")) { reset(); return; }
      if (has("sim.mode") && s.mode !== st.mode) {
        const prev = st.mode;
        st.mode = s.mode;
        st.manualOffset = 0;
        if (s.mode === "manual") {
          // Al entrar en manual, partimos de las lecturas actuales (sin salto)
          const r = (v, d) => +v.toFixed(d);
          store.setMany([["sim.manual.temp", r(st.temp - st.chatHeat, 1)], ["sim.manual.pressure", r(st.pressure, 1)], ["sim.manual.coolant", r(st.coolant, 0)],
            ["sim.manual.rods", r(st.rods, 0)], ["sim.manual.output", r(st.output, 0)], ["sim.manual.load", r(st.load, 0)]], { source: "sim" });
          readings(0); emit("update");
        } else if (s.mode === "scenario") {
          reset();
        } else if (prev !== s.mode) {
          st.core = st.temp - st.chatHeat; // continuidad al volver a automático
          emit("update");
        }
        return;
      }
      if (has("sim.scenario") && s.mode === "scenario") { reset(); return; }
      if (has("sim.manual")) st.manualOffset = 0; // el valor manual nuevo manda
      if (has("sim.manual") || has("sim.base") || has("sim.thresholds")) {
        // Recalcular lecturas sin avanzar el reloj (también en pausa)
        if (s.mode === "manual") readings(0);
        if (hist.length) hist[hist.length - 1] = [hist[hist.length - 1][0], st.temp];
        emit("update");
      }
    });

    reset();

    return {
      get state() { return st; },
      get running() { return running; },
      on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      listenerCount: () => listeners.size,
      play() { running = true; last = performance.now(); emit("update"); },
      pause() { running = false; emit("update"); },
      toggle() { running ? this.pause() : this.play(); },
      step(seconds) { advance(seconds || 1); },
      reset,
      rawLevel,
      /* Recuperación en curso (null si no) y nivel que se enseña: durante la
         recuperación, el que ya sostiene la temperatura (el nivel real no cambia). */
      recovery: recoveryInfo,
      shownLevel() { const r = recoveryInfo(); return r ? r.target : st.level; },
      /* Subida temporal de `amount` °C durante `holdS` s de simulación. */
      injectHeat(amount, holdS) {
        st.excursion = { amount: Math.max(0, +amount || 0), start: st.t, until: st.t + 3 + Math.max(0, +holdS || 0) };
        readings(0);
        emit("update");
      },
      get excursion() { return st.excursion ? Object.assign({}, st.excursion) : null; },
      /*
       * Enfría el reactor `delta` °C. En marcha: repartido en `seconds` s de
       * simulación (se acumula si llegan varios). En pausa (o seconds = 0): de
       * golpe y con el nivel recalculado al momento (settleLevel), sin arrancar
       * el reloj. Devuelve { applied, instant, pending }.
       */
      cool(delta, seconds) {
        const want = Math.max(0, +delta || 0);
        if (!running || !(seconds > 0)) {
          const d = applyCool(want);
          readings(0);
          if (hist.length) hist[hist.length - 1] = [hist[hist.length - 1][0], st.temp];
          settleLevel();
          emit("update");
          return { applied: d, instant: true, pending: st.coolLeft };
        }
        const room = Math.max(0, st.temp - TMIN - st.coolLeft);
        st.coolLeft += Math.min(want, room);
        st.coolRate = st.coolLeft / seconds;
        emit("update");
        return { applied: 0, instant: false, pending: st.coolLeft };
      },
      settleLevel() { settleLevel(); emit("update"); },
      /*
       * Calor del chat: sube `delta` °C. En marcha: repartido en `seconds` s de
       * simulación. En pausa (o seconds = 0): de golpe y con el nivel recalculado
       * al momento. Devuelve { applied, instant, pending }.
       */
      heat(delta, seconds) {
        const want = Math.max(0, +delta || 0);
        if (!running || !(seconds > 0)) {
          const d = applyHeat(want);
          readings(0);
          if (hist.length) hist[hist.length - 1] = [hist[hist.length - 1][0], st.temp];
          settleLevel();
          emit("update");
          return { applied: d, instant: true, pending: st.heatLeft };
        }
        st.heatLeft += want;
        st.heatRate = st.heatLeft / seconds;
        emit("update");
        return { applied: 0, instant: false, pending: st.heatLeft };
      },
      /* Demostración en vivo (demo.js) */
      setDriver(d) { driver = d || null; st.demoOffset = 0; },
      get driven() { return !!driver; },
      get demoOffset() { return st.demoOffset; },
      set demoOffset(v) { st.demoOffset = +v || 0; },
      setSpeedOverride(x) { speedOverride = x == null ? null : Math.max(0.1, +x || 1); last = performance.now(); },
      get speed() { return speedOverride != null ? speedOverride : C().sim.speed; },
      /* Foto completa del estado (para restaurarlo tal cual al salir de la demostración). */
      snapshot() { return { st: JSON.parse(JSON.stringify(st)), hist: hist.map((p) => p.slice()), running }; },
      restore(snap) {
        if (!snap) return;
        const from = st.level;
        Object.assign(st, JSON.parse(JSON.stringify(snap.st)));
        hist = snap.hist.map((p) => p.slice());
        running = !!snap.running;
        last = performance.now();
        emit("reset", { from, to: st.level, restored: true });
        emit("update");
      },
      get chat() {
        return { heat: st.chatHeat, heatLeft: st.heatLeft, coolLeft: st.coolLeft,
          critFor: st.critSince == null ? 0 : st.t - st.critSince, becario: st.becario ? Object.assign({}, st.becario) : null };
      },
      get cooling() { return { left: st.coolLeft, cooled: st.cooled, manualOffset: st.manualOffset }; },
      history(windowS) {
        const from = st.t - (windowS || 60);
        return hist.filter((p) => p[0] >= from - 1e-9);
      },
      tempAt,
      scenarioInfo() {
        const sc = scenario();
        return { key: C().sim.scenario, name: sc.name, description: sc.description, duration: sc.duration, progress: Math.min(1, st.t / sc.duration), ended: st.scenarioEnded };
      },
      destroy() { destroyed = true; clearInterval(ticker); off(); listeners.clear(); },
    };
  }

  DR.createSim = createSim;
})();

;
/* ---- src/scene.js ---- */
/*
 * Duck Reactor — escena (etapa 1).
 * Capas, de abajo arriba:
 *   1. fondo            (reactor_master_clean_v1)
 *   2. pantallas        (superficies HTML deformadas con matrix3d; contenido en screens.js)
 *   3. luces de sala    (botones, LEDs, lámparas, derrame de pantallas; lights.js)
 *                        — por debajo del pato, así quedan tapadas donde corresponde
 *   4. sombra           (contacto bajo la base y las ruedas)
 *   5. pato+silla       (composite transparente del estado activo, con
 *                        corrección cálida opcional vía filtro SVG)
 *   6. fx delante       (vacía: reservada para efectos que deban ir sobre el pato)
 *   7. guías            (sólo revisión; ocultas por defecto)
 *
 * Expone window.DuckReactorScene.create(contenedor, store): lee siempre la
 * configuración viva de store.cfg, así que tras un cambio basta con llamar a
 * la actualización concreta (relayout, updateScreen...).
 */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(tag, cls, parent) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }

  function svg(tag, attrs, parent) {
    const n = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* Homografía que lleva el rectángulo (0,0)-(w,h) al quad dado. */
  function rectToQuad(w, h, q) {
    const src = [[0, 0], [w, 0], [w, h], [0, h]];
    const A = [], B = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [u, v] = q[i];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v);
    }
    // Eliminación gaussiana 8×8
    for (let c = 0; c < 8; c++) {
      let p = c;
      for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]];
      for (let r = 0; r < 8; r++) {
        if (r === c) continue;
        const f = A[r][c] / A[c][c];
        for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
        B[r] -= f * B[c];
      }
    }
    const [a, b, c, d, e, f, g, hh] = B.map((v, i) => v / A[i][i]);
    return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
  }

  function create(root, store) {
    let current = null;
    const C = () => store.cfg;

    const viewport = el("div", "dr-viewport", root);
    const stage = el("div", "dr-stage", viewport);

    const bg = el("img", "dr-bg", stage);
    bg.alt = "";
    bg.draggable = false;

    /*
     * Luz de emergencia (etapa 10): capas propias, nunca toca el fondo ni los PNG.
     *   emRoom (sobre el fondo, bajo las pantallas): oscurecimiento + derrame rojo.
     *   emSrc  (sobre las luces de sala): resplandor de la lámpara de alarma.
     *   emDuck (sobre el pato): luz recortada por el alfa del sprite activo.
     * Ninguna crea contexto de apilamiento propio: los modos de mezcla actúan
     * sobre lo que hay debajo. Las pantallas quedan por encima de emRoom.
     */
    const emRoomLayer = el("div", "dr-layer dr-em-room", stage);
    const screensLayer = el("div", "dr-layer dr-screens", stage);
    const roomLayer = el("div", "dr-layer dr-room", stage);
    const emSrcLayer = el("div", "dr-layer dr-em-src", stage);
    const shadowLayer = el("div", "dr-layer dr-shadow", stage);
    const duckLayer = el("div", "dr-layer dr-duck", stage);
    const emDuckLayer = el("div", "dr-layer dr-em-duck", stage);
    const fxLayer = el("div", "dr-layer dr-fx", stage);
    el("div", "dr-effects", fxLayer);  // etapa futura: FX delante del pato
    const guides = svg("svg", { class: "dr-layer dr-guides" }, stage);

    // Filtro de corrección de color (no destructivo) para la capa del pato
    const defs = svg("svg", { class: "dr-defs", width: 0, height: 0, "aria-hidden": "true" }, stage);
    const gradeFilter = svg("filter", { id: "dr-grade", "color-interpolation-filters": "sRGB" }, defs);
    const gradeCT = svg("feComponentTransfer", {}, gradeFilter);
    const gradeFn = {
      R: svg("feFuncR", { type: "gamma" }, gradeCT),
      G: svg("feFuncG", { type: "gamma" }, gradeCT),
      B: svg("feFuncB", { type: "gamma" }, gradeCT),
    };

    const screens = {};
    const duckImgs = {};

    /*
     * Luz de emergencia sobre pato+silla: un grupo por sprite (y variante de
     * silla), con la MISMA imagen como máscara en cada capa de luz. Se muestra
     * sólo el del sprite activo, en el mismo cambio que la imagen (sin desfase),
     * así HIGH y MID reciben exactamente la misma luz. La máscara va en cada
     * capa (no en el grupo) para que su modo de mezcla actúe sobre la escena.
     */
    function emGroup(src, name, variant) {
      const g = el("div", "dr-em-g", emDuckLayer);
      g.dataset.state = name;
      g.dataset.variant = variant;
      // Las máscaras CSS piden la imagen con CORS: con file:// y rutas sueltas (modo
      // desarrollo) el navegador las bloquearía; en el HTML único son blob: propias.
      const maskable = /^(blob:|data:)/.test(src) || location.protocol !== "file:";
      ["em-d-dark", "em-d-tint", "em-d-light"].forEach((c) => {
        const n = el("i", c, g);
        if (!maskable) return;
        const m = `url("${src}")`;
        n.style.webkitMaskImage = m;
        n.style.maskImage = m;
      });
      if (!maskable) g.classList.add("no-mask");
      // versión precalculada (emergency.js): mismas capas ya resueltas, sólo opacidad
      el("canvas", "em-b em-b-dark", g);
      el("canvas", "em-b em-b-lit", g);
      return g;
    }

    function build() {
      const cfg = C();
      const { width: W, height: H } = cfg.stage;
      stage.style.width = W + "px";
      stage.style.height = H + "px";
      bg.src = window.DR.asset(cfg.stage.background);

      // Pantallas
      screensLayer.textContent = "";
      for (const id in cfg.screens) {
        const s = cfg.screens[id];
        const n = el("div", "dr-screen", screensLayer);
        n.dataset.screen = id;
        n.style.width = s.width + "px";
        n.style.height = s.height + "px";
        n.style.transform = rectToQuad(s.width, s.height, s.quad);
        const content = el("div", "dr-screen-content", n);
        screens[id] = { el: n, content };
      }

      // Pato: precarga de los cinco estados apilados para cambiar sin parpadeo.
      // Cada sprite tiene el original y, si existe, la versión con la silla
      // igualada a IDLE («matched»). Las dos quedan cargadas: alternar entre
      // ellas (ajuste o comparación) no recarga nada ni mueve el composite.
      duckLayer.textContent = "";
      emDuckLayer.textContent = "";
      const sprites = Object.assign({}, cfg.states, cfg.frames || {});
      for (const name in sprites) {
        const mk = (file, variant) => {
          const img = el("img", "dr-duck-img", duckLayer);
          img.src = window.DR.asset(file);
          img.alt = "";
          img.draggable = false;
          img.dataset.state = name;
          img.dataset.variant = variant;
          img.em = emGroup(img.src, name, variant);
          return img;
        };
        const orig = mk(sprites[name].file, "orig");
        duckImgs[name] = { orig, matched: sprites[name].matched ? mk(sprites[name].matched, "matched") : null };
      }

      layout();
      const keep = current;
      current = null;
      setState(keep && cfg.states[keep] ? keep : cfg.initialState);
    }

    function updateScreen(id) {
      const s = C().screens[id], n = screens[id];
      if (!s || !n) return;
      n.el.style.transform = rectToQuad(s.width, s.height, s.quad);
      drawGuides();
    }

    /* composite px → escena px */
    function toStage(x, y, offset) {
      const d = C().duck, o = offset || { x: 0, y: 0 };
      return {
        x: d.stageX + (x - d.anchor.x) * d.scale + o.x,
        y: d.floorY + (y - d.anchor.y) * d.scale + o.y,
      };
    }

    function layout() {
      const cfg = C();
      const d = cfg.duck;
      const size = d.canvas * d.scale;
      for (const name in duckImgs) {
        const spr = cfg.states[name] || (cfg.frames || {})[name];
        const p = toStage(0, 0, spr.offset);
        for (const img of [duckImgs[name].orig, duckImgs[name].matched]) {
          if (!img) continue;
          for (const n of [img, img.em]) {
            n.style.left = p.x + "px";
            n.style.top = p.y + "px";
            n.style.width = size + "px";
            n.style.height = size + "px";
          }
        }
      }
      applyVariant();

      // Sombra (sigue al ancla/escala del pato, nunca al estado)
      shadowLayer.textContent = "";
      const sh = cfg.shadow;
      shadowLayer.style.display = sh.enabled ? "" : "none";
      const blob = (cx, cy, rx, ry, opacity, blur, cls) => {
        const c = toStage(cx, cy);
        const n = el("div", "dr-shadow-blob " + cls, shadowLayer);
        const w = rx * 2 * d.scale, h = ry * 2 * d.scale;
        n.style.left = c.x - w / 2 + "px";
        n.style.top = c.y - h / 2 + "px";
        n.style.width = w + "px";
        n.style.height = h + "px";
        const rgb = window.DR.util.hexToRgb(sh.color);
        n.style.background = `radial-gradient(closest-side, rgba(${rgb},${opacity}) 0%, rgba(${rgb},${opacity * 0.6}) 45%, rgba(${rgb},0) 100%)`;
        n.style.filter = `blur(${blur}px)`;
      };
      blob(sh.base.cx, sh.base.cy, sh.base.rx, sh.base.ry, sh.base.opacity, sh.base.blur, "is-base");
      for (const w of sh.wheels.points) blob(w.x, w.y, sh.wheels.rx, sh.wheels.ry, sh.wheels.opacity, sh.wheels.blur, "is-wheel");

      applyGrade();
      drawGuides();
    }

    /*
     * Calidez por curvas gamma: 0 y 1 quedan fijos en cada canal, así que
     * blancos y negros no cambian; sólo se calientan los medios tonos.
     */
    function applyGrade() {
      const g = C().grade || { enabled: false };
      const w = Math.max(0, Math.min(1, g.warmth || 0));
      const amp = g.exposure == null ? 1 : g.exposure;
      const exps = { R: 1 - 0.14 * w, G: 1, B: 1 + 0.24 * w };
      for (const k in gradeFn) {
        gradeFn[k].setAttribute("amplitude", amp);
        gradeFn[k].setAttribute("exponent", exps[k].toFixed(4));
        gradeFn[k].setAttribute("offset", 0);
      }
      duckLayer.style.filter = g.enabled ? "url(#dr-grade)" : "none";
    }

    function drawGuides() {
      const cfg = C();
      const { width: W, height: H } = cfg.stage;
      guides.setAttribute("viewBox", `0 0 ${W} ${H}`);
      guides.textContent = "";
      // Centro de escena y línea de suelo
      svg("line", { x1: W / 2, y1: 0, x2: W / 2, y2: H, class: "g-axis" }, guides);
      svg("line", { x1: 0, y1: cfg.duck.floorY, x2: W, y2: cfg.duck.floorY, class: "g-floor" }, guides);
      svg("text", { x: 8, y: cfg.duck.floorY - 6, class: "g-label g-floor-label" }, guides).textContent = (window.DR && DR.i18n ? DR.i18n.L : String.raw)`suelo ${cfg.duck.floorY}`;

      // Pantallas
      for (const id in cfg.screens) {
        const s = cfg.screens[id];
        svg("polygon", { points: s.quad.map((p) => p.join(",")).join(" "), class: "g-screen" + (id === focusScreen ? " is-focus" : "") }, guides);
        for (const [x, y] of s.quad) svg("circle", { cx: x, cy: y, r: 3, class: "g-corner" }, guides);
        const [x, y] = s.quad[0];
        svg("text", { x: x + 6, y: y + 16, class: "g-label" }, guides).textContent = s.label;
      }

      // Lienzo del composite activo + ancla
      const d = cfg.duck;
      const o = (current && cfg.states[current].offset) || { x: 0, y: 0 };
      const tl = toStage(0, 0, o);
      svg("rect", { x: tl.x, y: tl.y, width: d.canvas * d.scale, height: d.canvas * d.scale, class: "g-canvas" }, guides);
      const a = toStage(d.anchor.x, d.anchor.y, o);
      svg("path", { d: `M${a.x - 10} ${a.y}H${a.x + 10}M${a.x} ${a.y - 10}V${a.y + 10}`, class: "g-anchor" }, guides);

      // Contorno de la sombra
      const sb = cfg.shadow.base, c = toStage(sb.cx, sb.cy);
      svg("ellipse", { cx: c.x, cy: c.y, rx: sb.rx * d.scale, ry: sb.ry * d.scale, class: "g-shadow" }, guides);
    }

    let focusScreen = null;

    function setState(name) {
      if (!C().states[name] || name === current) return;
      current = name;
      sprite = null;
      showSprite(name);
      stage.dataset.state = name;
      drawGuides();
      root.dispatchEvent(new CustomEvent("dr:state", { detail: name }));
    }

    /*
     * Muestra un sprite (estado o fotograma extra como PANIC_MID) sin cambiar
     * el estado lógico. Sólo cambia qué imagen precargada es visible: sin
     * fundido, sin mover ni deformar el composite.
     */
    let sprite = null;
    function showSprite(name) {
      if (!duckImgs[name] || name === sprite) return;
      sprite = name;
      paint();
      stage.dataset.sprite = name;
    }

    /*
     * Silla igualada (etapa 8): «matched» si grade.chairMatch está activo y el
     * sprite tiene versión igualada; si no, el original. La comparación del
     * laboratorio fuerza una variante sin tocar la configuración guardada.
     */
    let compare = null; // null | "orig" | "matched"
    function variant() {
      if (compare) return compare;
      const g = C().grade || {};
      return g.chairMatch === false ? "orig" : "matched";
    }
    function paint() {
      const v = variant();
      for (const k in duckImgs) {
        const d = duckImgs[k];
        const use = v === "matched" && d.matched ? d.matched : d.orig;
        for (const img of [d.orig, d.matched]) {
          if (!img) continue;
          const on = k === sprite && use === img;
          img.classList.toggle("is-active", on);
          img.em.classList.toggle("is-active", on);
        }
      }
      stage.dataset.chair = v;
    }
    function applyVariant() { if (sprite) paint(); else stage.dataset.chair = variant(); }
    function setChairCompare(v) {
      compare = v === "orig" || v === "matched" ? v : null;
      applyVariant();
      root.dispatchEvent(new CustomEvent("dr:chair", { detail: variant() }));
    }

    function setGuides(on) {
      stage.classList.toggle("show-guides", !!on);
    }

    /* Escala la escena completa para caber en el viewport, sin deformar. */
    function fit() {
      const { width: W, height: H } = C().stage;
      const vw = viewport.clientWidth, vh = viewport.clientHeight;
      const k = Math.min(vw / W, vh / H);
      stage.style.transform = `translate(${(vw - W * k) / 2}px, ${(vh - H * k) / 2}px) scale(${k})`;
      stage.dataset.scale = k.toFixed(3);
    }

    new ResizeObserver(fit).observe(viewport);
    build();
    fit();

    /* Coordenadas del ratón → px de escena (tiene en cuenta el escalado). */
    function toStageCoords(clientX, clientY) {
      const r = stage.getBoundingClientRect();
      const k = r.width / C().stage.width;
      return { x: (clientX - r.left) / k, y: (clientY - r.top) / k, scale: k };
    }

    return {
      root, stage, screens,
      layers: { screens: screensLayer, room: roomLayer, shadow: shadowLayer, duck: duckLayer, fx: fxLayer, guides,
        emRoom: emRoomLayer, emSrc: emSrcLayer, emDuck: emDuckLayer },
      /* Caja del composite en px de escena (la misma para todos los sprites). */
      duckBox() { const d = C().duck; const p = toStage(0, 0); return { x: p.x, y: p.y, size: d.canvas * d.scale }; },
      setState, showSprite, setGuides, fit, updateScreen, toStageCoords, drawGuides,
      getSprite: () => sprite,
      setChairCompare,
      getChairVariant: variant,
      getChairCompare: () => compare,
      setFocusScreen(id) { focusScreen = id; drawGuides(); },
      getState: () => current,
      /* Re-aplica posiciones tras cambiar duck / shadow / grade en caliente. */
      relayout: () => { layout(); fit(); },
      /* Reconstruye superficies y pato (cambio completo de configuración). */
      rebuild: () => { build(); fit(); },
    };
  }

  window.DuckReactorScene = { create, rectToQuad };
})();

;
/* ---- src/stage.js ---- */
/*
 * Duck Reactor — escenario de gags visuales en la pantalla central (etapa 6).
 *
 * Mientras dura un gag visual, la pantalla central se entrega a una
 * composición grande (diagrama, ventana o presentación) y la temperatura y
 * el estado REALES quedan en una franja superior. Al terminar, screens.js
 * vuelve a su vista normal con los valores actuales.
 *
 * Cada composición se construye una vez y avanza por etapas: el contenedor
 * recibe las clases at-1…at-N (etapas alcanzadas) y on-N (etapa actual), y el
 * CSS (live.css, «Escenario de gags») decide qué se ve. Las animaciones sólo
 * decoran: cada etapa tiene una composición final estática, así que con
 * movimiento reducido (.dr-still) las etapas se ven igual pero sin moverse.
 * Los textos no se escriben letra a letra: entran de golpe con una
 * transición breve, para que el remate tenga todo su tiempo.
 *
 * Coordenadas en px lógicos de la pantalla central (856 × 480). Lo que queda
 * por debajo de y≈330 lo tapa la cabeza del pato, salvo las esquinas.
 *
 * window.DuckReactorStage.create(parent) → { show(scene, step, texts), hide(), update(o), active }
 */
(function () {
  "use strict";
  const SVG_NS = "http://www.w3.org/2000/svg";

  function E(tag, cls, text, parent) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function S(tag, attrs, parent) {
    const n = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const P = {
    mug: "M4 9h12v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z M16 11h2.5a2.5 2.5 0 0 1 0 5H16 M7 2.5v3.5 M10 2.5v3.5 M13 2.5v3.5",
    smile: "M12 2.5a9.5 9.5 0 1 0 0.01 0z M8.5 9.5v1 M15.5 9.5v1 M7.5 14c1.2 2 2.7 3 4.5 3s3.3-1 4.5-3",
    warn: "M12 2.5 L22.5 20.5 H1.5 Z M12 9v6 M12 17v1.6",
    check: "M5 12.5 l4.5 4.5 l9.5-11",
    avatar: "M12 3.5a4 4 0 1 0 0.01 0z M3.5 21c0.8-4.5 4-7 8.5-7s7.7 2.5 8.5 7 M12 14l-1.3 2.2 1.3 4.3 1.3-4.3z",
    arrowDown: "M12 3v15 M5.5 12.5 L12 19 L18.5 12.5",
  };
  const icon = (d, cls, parent) => {
    const s = S("svg", { class: cls, viewBox: "0 0 24 24", "aria-hidden": "true" }, parent);
    S("path", { d }, s);
    return s;
  };

  /*
   * Tamaño de letra calculado (no medido): VT323 avanza 0,4 em por carácter,
   * más el espaciado. Así el tamaño final no depende de transiciones en curso.
   */
  function fitc(el, text, avail, max, min, k) {
    const len = Math.max(1, String(text).length);
    const f = Math.max(min, Math.min(max, Math.floor(avail / (len * (k || 0.44)))));
    el.style.fontSize = f + "px";
    el.textContent = text;
    return f;
  }

  /*
   * Hasta `maxLines` líneas equilibradas por palabras, con el tamaño más grande
   * que quepa en availW × availH (interlineado 1,05). Prefiere menos líneas si
   * el tamaño es parecido. Texto siempre como textContent (nunca HTML).
   */
  function wrapTo(words, width) {
    const lines = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (t.length <= width || !cur) cur = t;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  /* Cálculo puro (sin DOM): líneas y tamaño. f0 es el tamaño sin el mínimo. */
  function fitPlan(text, availW, availH, max, min, k, maxLines) {
    text = String(text == null ? "" : text).trim().replace(/ (?=\u{1F4E7})/gu, "\u00a0"); // el sobre nunca queda solo en una línea
    k = k || 0.46;
    const words = text.split(/[ \t\n\r]+/).filter(Boolean);
    let best = { lines: [text], f: 0 };
    const longest = words.reduce((m, w) => Math.max(m, w.length), 1);
    for (let L = 1; L <= (maxLines || 2); L++) {
      let lines = null;
      for (let wdt = longest; wdt <= Math.max(longest, text.length); wdt++) {
        const ls = wrapTo(words, wdt);
        if (ls.length <= L) { lines = ls; break; }
      }
      if (!lines) continue;
      const mx = lines.reduce((m, l) => Math.max(m, l.length), 1);
      const f = Math.floor(Math.min(max, availW / (mx * k), availH / (lines.length * 1.05)));
      if (f > best.f * 1.08 || (best.f === 0)) best = { lines, f };
    }
    return { lines: best.lines, f: Math.max(min, best.f), f0: best.f };
  }
  /*
   * El sobre 📧 se dibuja como icono integrado (no depende de que el sistema
   * tenga una fuente de emoji): pequeño, al final y alineado con el texto.
   */
  const MAIL = "\u{1F4E7}";
  function putText(el, text) {
    const parts = String(text).split(MAIL);
    parts.forEach((p, i) => {
      if (i) {
        const sv = S("svg", { class: "dr-ico-mail", viewBox: "0 0 24 24", "aria-label": "email", role: "img" }, el);
        S("path", { d: "M2.5 5.5h19v13h-19z M3 6l9 7.2L21 6" }, sv);
      }
      const q = i < parts.length - 1 ? p.replace(/[\s\u00a0]+$/, "") : p; // el hueco lo pone el margen del icono
      if (q) el.appendChild(document.createTextNode(q));
    });
  }
  function applyFit(el, pl) {
    el.style.fontSize = pl.f + "px";
    el.textContent = "";
    pl.lines.forEach((l) => putText(E("span", null, null, el), l));
    el.dataset.lines = pl.lines.length;
    return pl.f;
  }
  function fitLines(el, text, availW, availH, max, min, k, maxLines) {
    return applyFit(el, fitPlan(text, availW, availH, max, min, k, maxLines));
  }

  /* Gráfico de 60 s (mismo cálculo que la pantalla normal). */
  function drawGraph(G, hist, st, th) {
    const t0 = st.t - 60, H = G.H, W = G.W, pad = 8;
    let lo = Infinity, hi = -Infinity;
    hist.forEach((p) => { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); });
    lo = Math.min(lo, th.alarmed) - 6; hi = Math.max(hi, th.panic) + 8;
    const y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2);
    const pts = hist.map((p) => `${(((p[0] - t0) / 60) * W).toFixed(1)},${y(p[1]).toFixed(1)}`);
    G.line.setAttribute("points", pts.join(" "));
    G.area.setAttribute("d", pts.length ? `M${pts[0].split(",")[0]} ${H} L${pts.join(" L")} L${W} ${H} Z` : "");
    G.head.setAttribute("cy", y(st.temp).toFixed(1));
    G.crit.setAttribute("height", Math.max(0, y(th.panic)).toFixed(1));
    G.thPanic.setAttribute("y1", y(th.panic)); G.thPanic.setAttribute("y2", y(th.panic));
    G.thAlarm.setAttribute("y1", y(th.alarmed)); G.thAlarm.setAttribute("y2", y(th.alarmed));
  }

  /* ================================================== 1 · café combustible */
  function buildFuel(el) {
    const R = {};
    const svg = S("svg", { class: "f-diag", viewBox: "0 0 856 480", preserveAspectRatio: "none", "aria-hidden": "true" }, el);
    // retícula del esquema
    const grid = S("g", { class: "f-grid" }, svg);
    for (let x = 40; x < 830; x += 40) S("line", { x1: x, y1: 116, x2: x, y2: 330 }, grid);
    for (let y = 120; y < 330; y += 40) S("line", { x1: 30, y1: y, x2: 826, y2: y }, grid);
    // núcleo
    const core = S("g", { class: "f-core" }, svg);
    S("circle", { class: "f-core-ring", cx: 175, cy: 232, r: 80 }, core);
    S("circle", { class: "f-core-in", cx: 175, cy: 232, r: 56 }, core);
    for (let a = 0; a < 6; a++) {
      const r = (a * Math.PI) / 3;
      S("line", { class: "f-spoke", x1: 175 + 22 * Math.cos(r), y1: 232 + 22 * Math.sin(r), x2: 175 + 54 * Math.cos(r), y2: 232 + 54 * Math.sin(r) }, core);
    }
    S("circle", { class: "f-hub", cx: 175, cy: 232, r: 14 }, core);
    R.coreLbl = S("text", { class: "f-lbl", x: 175, y: 338, "text-anchor": "middle" }, svg);
    // manómetro
    const g = S("g", { class: "f-gauge" }, svg);
    S("circle", { cx: 340, cy: 162, r: 34, class: "f-gauge-face" }, g);
    S("path", { d: "M313 176 A30 30 0 1 1 367 176", class: "f-gauge-arc" }, g);
    S("line", { x1: 340, y1: 162, x2: 340, y2: 136, class: "f-needle" }, g);
    S("line", { x1: 340, y1: 196, x2: 340, y2: 232, class: "f-pipe-thin" }, svg);
    // tubería núcleo → válvula → depósito
    S("path", { class: "f-pipe", d: "M255 232 H566" }, svg);
    S("path", { class: "f-flow", d: "M255 232 H566" }, svg);
    S("path", { class: "f-valve", d: "M402 214 L438 250 L438 214 L402 250 Z" }, svg);
    // depósito
    S("rect", { class: "f-tank", x: 566, y: 136, width: 116, height: 186, rx: 7 }, svg);
    S("rect", { class: "f-tank-fill", x: 573, y: 143, width: 102, height: 172, rx: 3 }, svg);
    for (let i = 1; i < 4; i++) S("line", { class: "f-tick", x1: 668, x2: 682, y1: 143 + i * 43, y2: 143 + i * 43 }, svg);
    R.tankLbl = S("text", { class: "f-lbl", x: 624, y: 131, "text-anchor": "middle" }, svg);
    R.pct = S("text", { class: "f-pct", x: 624, y: 250, "text-anchor": "middle" }, svg);
    R.low = S("text", { class: "f-low", x: 624, y: 178, "text-anchor": "middle" }, svg);
    // taza detectada + conexión animada (hacia el depósito y hacia la taza real, bajo la pantalla)
    S("path", { class: "f-link", d: "M716 252 C 700 252, 700 214, 684 214" }, svg);
    S("path", { class: "f-link f-link-down", d: "M762 304 C 764 372, 660 405, 630 478" }, svg);
    const cup = S("g", { class: "f-cup" }, svg);
    S("rect", { x: 716, y: 206, width: 94, height: 98, rx: 8, class: "f-cup-box" }, cup);
    const cg = S("g", { transform: "translate(730 220) scale(2.8)" }, cup);
    S("path", { d: P.mug }, cg);
    // barrido de búsqueda
    S("rect", { class: "f-scan", x: 30, y: 116, width: 8, height: 214 }, svg);
    // título y remate
    const title = E("div", "f-title", null, el);
    R.title = E("span", null, null, title);
    E("i", "f-dots", "...", title);
    const punch = E("div", "f-punch", null, el);
    R.punch = E("span", null, null, punch);
    return {
      R,
      text(step, T) {
        const t = step <= 2 ? T.fuelSearch : step === 3 ? T.fuelFound : T.fuelFilling;
        fitc(R.title, t, 700, 50, 26, 0.46);
        fitc(R.punch, T.fuelPunch, 770, 60, 28, 0.44);
        R.coreLbl.textContent = T.fuelCore;
        R.tankLbl.textContent = T.fuelTank;
        R.low.textContent = T.fuelLow;
        R.pct.textContent = step >= 4 ? "100%" : "3%";
      },
    };
  }

  /* ================================================== 2 · negación corporativa */
  function buildDenial(el) {
    const R = {};
    // El diagrama alarmante (datos reales del simulador)
    const gw = E("div", "d-graph", null, el);
    R.graphLbl = E("span", "d-graph-lbl", null, gw);
    const svg = S("svg", { viewBox: "0 0 400 140", preserveAspectRatio: "none", "aria-hidden": "true" }, gw);
    const G = { W: 400, H: 140 };
    G.crit = S("rect", { class: "d-crit", x: 0, y: 0, width: 400, height: 0 }, svg);
    const grid = S("g", { class: "d-gridl" }, svg);
    [28, 56, 84, 112].forEach((y) => S("line", { x1: 0, x2: 400, y1: y, y2: y }, grid));
    G.thAlarm = S("line", { class: "d-th", x1: 0, x2: 400 }, svg);
    G.thPanic = S("line", { class: "d-th d-th-p", x1: 0, x2: 400 }, svg);
    G.area = S("path", { class: "d-area", d: "" }, svg);
    G.line = S("polyline", { class: "d-line", points: "" }, svg);
    G.head = S("circle", { class: "d-head", r: 4, cx: 400, cy: 70 }, svg);
    R.G = G;
    // Ventana de tranquilidad
    const win = E("div", "d-win", null, el);
    const bar = E("div", "d-bar", null, win);
    R.winTitle = E("span", null, null, bar);
    const dots = E("span", "d-bar-dots", null, bar);
    E("i", null, null, dots); E("i", null, null, dots); E("i", null, null, dots);
    const wb = E("div", "d-body", null, win);
    icon(P.smile, "d-smile", wb);
    R.fine = E("span", "d-fine", null, wb);
    const haz = E("div", "d-haz", null, win);
    icon(P.warn, "d-haz-icon", haz);
    // Tarjeta de aprobación (tapa sólo el diagrama)
    const card = E("div", "d-card", null, el);
    icon(P.check, "d-card-check", card);
    R.approved = E("div", "d-stamp", null, card);
    R.cardLine = E("div", "d-card-line", null, card);
    const sign = E("div", "d-sign", null, card);
    const sg = S("svg", { viewBox: "0 0 120 30", "aria-hidden": "true" }, sign);
    S("path", { d: "M4 22 C 14 4, 20 30, 30 16 S 46 4, 52 20 S 70 26, 78 12 S 98 10, 116 18" }, sg);
    R.signLine = E("span", null, null, sign);
    // Remate
    const punch = E("div", "d-punch", null, el);
    R.punch = E("span", "d-punch-text", null, punch);
    return {
      R,
      text(step, T) {
        R.graphLbl.textContent = T.denialGraph;
        R.winTitle.textContent = T.denialTitle;
        if (step >= 3) fitc(R.fine, T.denialFineLoud, 320, 84, 30, 0.42);
        else fitc(R.fine, T.denialFine, 228, 54, 24, 0.42);
        fitc(R.approved, T.denialApproved, 210, 46, 22, 0.5);
        fitc(R.cardLine, T.denialCard, 250, 30, 16, 0.42);
        fitc(R.signLine, T.denialSign, 140, 22, 12, 0.42);
        fitLines(R.punch, T.denialPunch, 760, 118, 60, 24, 0.52, 2);
      },
      update(o) { drawGraph(R.G, o.hist, o.st, o.th); },
    };
  }

  /* ================================================== 3 · viene el supervisor */
  function buildSupervisor(el) {
    const R = {};
    const toast = E("div", "s-toast", null, el);
    icon(P.avatar, "s-avatar", toast);
    const tt = E("div", "s-toast-text", null, toast);
    R.toastTitle = E("div", "s-toast-title", null, tt);
    const pres = E("div", "s-presence", null, tt);
    E("b", "s-dot", null, pres);
    R.presence = E("span", null, null, pres);

    const slide = E("div", "s-slide", null, el);
    const head = E("div", "s-head", null, slide);
    R.slideTitle = E("span", "s-title", null, head);
    const chip = E("span", "s-chip", null, head);
    E("b", "s-dot", null, chip);
    R.chip = E("span", null, null, chip);
    const body = E("div", "s-body", null, slide);
    const ul = E("ul", "s-checks", null, body);
    R.checks = [0, 1, 2].map((i) => {
      const li = E("li", null, null, ul);
      li.style.setProperty("--i", i);
      const box = E("span", "s-box", null, li);
      icon(P.check, "s-check", box);
      return E("span", null, null, li);
    });
    const chart = E("div", "s-chart", null, body);
    R.curveLbl = E("span", "s-chart-lbl", null, chart);
    const cs = S("svg", { viewBox: "0 0 340 170", "aria-hidden": "true" }, chart);
    S("path", { class: "s-axes", d: "M24 8 V150 H332" }, cs);
    // curva sospechosamente perfecta
    let d = "";
    const pt = (k) => [24 + k * 300, 150 - 132 * ((Math.exp(3 * k) - 1) / (Math.exp(3) - 1))];
    for (let i = 0; i <= 60; i++) { const [x, y] = pt(i / 60); d += (i ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
    S("path", { class: "s-curve", d }, cs);
    for (let i = 1; i <= 5; i++) { const [x, y] = pt(i / 5); S("circle", { class: "s-pt", cx: x, cy: y, r: 5 }, cs); }
    R.stamp = E("div", "s-stamp", null, slide);
    R.footer = E("div", "s-footer", null, slide);

    const punch = E("div", "s-punch", null, el);
    R.punch = E("span", null, null, punch);
    return {
      R,
      text(step, T) {
        fitc(R.toastTitle, step >= 3 ? T.supOff : T.supOn, 356, 46, 22, 0.42);
        R.presence.textContent = step >= 3 ? T.supOffline : T.supOnline;
        R.chip.textContent = T.supOnline;
        fitc(R.slideTitle, T.supTitle, 560, 48, 24, 0.48);
        [T.supCheck1, T.supCheck2, T.supCheck3].forEach((t, i) => fitc(R.checks[i], t, 330, 38, 18, 0.43));
        R.curveLbl.textContent = T.supCurve;
        R.stamp.textContent = T.supStamp;
        R.footer.textContent = T.supFooter;
        fitc(R.punch, T.supPunch, 780, 70, 28, 0.44);
      },
    };
  }

  /* ================================================== 4 · nuevo suscriptor (rescate) */
  function buildRescue(el) {
    const R = {};
    const tag = E("div", "r-tag", null, el);
    R.tag = E("span", null, null, tag);
    R.count = E("b", "r-count", null, tag);
    R.help = E("div", "r-help", null, el);
    R.name = E("div", "r-name", null, el);
    R.rest = E("div", "r-rest", null, el);
    const therm = E("div", "r-therm", null, el);
    const track = E("div", "r-track", null, therm);
    R.fill = E("i", "r-fill", null, track);
    R.ticks = ["notice", "alarmed", "panic"].map((k) => E("span", "r-tick r-tick-" + k, null, track));
    R.drop = E("span", "r-drop", null, therm);
    const st = E("div", "r-status", null, el);
    icon("M12 2v20 M3.3 7l17.4 10 M3.3 17l17.4-10 M9 4l3 2 3-2 M9 20l3-2 3 2 M2.5 9.5l3.5 0.5 1-3.4 M21.5 14.5l-3.5-0.5-1 3.4 M2.5 14.5l3.5-0.5 1 3.4 M21.5 9.5l-3.5 0.5-1-3.4", "r-snow", st);
    R.status = E("span", null, null, st);
    const punch = E("div", "r-punch", null, el);
    icon(P.mug, "r-mug", punch);
    const pl = E("div", "r-plines", null, punch);
    R.p1 = E("span", null, null, pl);
    R.p2 = E("span", null, null, pl);
    return {
      R,
      text(step, T, d) {
        d = d || {};
        const count = Math.max(1, d.count || 1);
        const label = groupLabel(d.names, count, T);
        let rest;
        if (d.phrase) {
          // «{name} VERBO…»: el nombre ya va grande encima, no se repite
          rest = /^\{name\}\s/.test(d.phrase) ? d.phrase.replace(/^\{name\}\s+/, "") : d.phrase.split("{name}").join(label);
          rest = rest.split("{n}").join(String(count - 1));
        } else {
          // sin frase del catálogo: plantilla clásica (memes.texts)
          const tpl = count > 1 ? T.subMany : T.subOne;
          const i = tpl.indexOf("{name}");
          rest = (i >= 0 ? tpl.slice(i + 6) : tpl).split("{n}").join(String(count - 1)).trim();
        }
        /*
         * Etapa 15: con la escena pequeña (640 px) la tarjeta pasa a composición
         * compacta: sin etiqueta ni termómetro, frase en dos líneas grandes y
         * remate en un bloque, para que nombre, frase y remate se lean (≥ 12 px).
         */
        const crtEl = el.closest(".crt");
        const sc = crtEl && crtEl.offsetWidth ? crtEl.getBoundingClientRect().width / crtEl.offsetWidth : 1;
        const compact = 40 * sc < 12;
        el.classList.toggle("r-compact", compact);
        fitc(R.name, label, 790, compact ? 72 : 70, 26, 0.44);
        fitLines(R.rest, rest, 790, compact ? 122 : 72, compact ? 58 : 40, 24, 0.45, 2);
        R.tag.textContent = count > 1 ? (T.subTagMany || T.subTag) : T.subTag;
        R.count.textContent = count > 1 ? "×" + count : "";
        R.count.hidden = count < 2;
        R.drop.textContent = "−" + Math.round(d.drop || 0) + " °C";
        R.help.textContent = d.helpers ? T.coolHelp.split("{n}").join(String(d.helpers)) : "";
        R.help.hidden = !d.helpers;
        const crit = step === 2 && d.wait === "critical";
        const recv = d.wait === "recovering";
        el.classList.toggle("r-crit", crit);
        el.classList.toggle("r-recv", recv);
        const recTxt = d.eta >= 0 ? (T.subRecovering || T.subCooling).split("{s}").join(String(Math.ceil(d.eta))) : T.subRecoveringWait || T.subCooling;
        fitc(R.status, crit ? T.subWait : recv ? recTxt : T.subCooling, compact ? 790 : 680, compact ? 52 : 36, 18, 0.46);
        const pt = d.punch || (d.crisis === false ? T.subPunchCalm : T.subPunch);
        if (compact) {
          // remate en un solo bloque de hasta tres líneas, sin la taza
          fitLines(R.p1, pt, 720, 220, 64, 24, 0.46, 3);
          R.p2.textContent = "";
        } else {
          const k = pt.indexOf(". ");
          const a1 = k >= 0 ? pt.slice(0, k + 1) : pt, a2 = k >= 0 ? pt.slice(k + 2) : "";
          fitc(R.p1, a1, 600, 64, 24, 0.44);
          fitc(R.p2, a2, 600, 64, 24, 0.44);
        }
        el.dataset.phrase = d.phraseId || "";
        el.dataset.punch = d.punchId || "";
      },
      update(o) {
        const th = o.th, t = o.st.temp;
        const lo = Math.min(th.notice - 140, t - 20), hi = Math.max(th.panic + 60, t + 10);
        const pos = (v) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100)) + "%";
        R.fill.style.width = pos(t);
        R.ticks[0].style.left = pos(th.notice);
        R.ticks[1].style.left = pos(th.alarmed);
        R.ticks[2].style.left = pos(th.panic);
      },
    };
  }

  /* ================================================== 5 · Chat al mando (etapa 9) */
  /*
   * Cartel de un evento del público con el diagrama del reactor:
   *   heat    «No tocar»: el núcleo se pone al rojo y sube la flecha de calor.
   *   cool    «Mandar refrigerante»: el refrigerante entra por la tubería al núcleo.
   *   becario «Intervención del becario»: alguien llega con un cubo.
   * El dato grande es el cambio pedido (+/− °C); la temperatura y el nivel
   * REALES siguen en la franja superior. Composición final estática: con
   * movimiento reducido se entiende igual, sin animación.
   */
  function buildChat(el) {
    const R = {};
    const tag = E("div", "c-tag", null, el);
    R.tag = E("span", null, null, tag);
    R.count = E("b", "c-count", null, tag);
    R.name = E("div", "c-name", null, el);
    R.rest = E("div", "c-rest", null, el);
    const svg = S("svg", { class: "c-diag", viewBox: "0 0 856 140", "aria-hidden": "true" }, el);
    // depósito de refrigerante
    S("rect", { class: "c-tank", x: 60, y: 22, width: 92, height: 104, rx: 8 }, svg);
    S("rect", { class: "c-tank-fill", x: 67, y: 52, width: 78, height: 67, rx: 3 }, svg);
    for (let i = 1; i < 4; i++) S("line", { class: "c-tick", x1: 138, x2: 152, y1: 22 + i * 26, y2: 22 + i * 26 }, svg);
    // tubería depósito → núcleo, con el flujo de refrigerante
    S("path", { class: "c-pipe", d: "M152 74 H334" }, svg);
    S("path", { class: "c-flow", d: "M152 74 H334" }, svg);
    S("path", { class: "c-valve", d: "M226 58 L258 90 L258 58 L226 90 Z" }, svg);
    // núcleo con barras
    S("rect", { class: "c-vessel", x: 334, y: 10, width: 196, height: 124, rx: 16 }, svg);
    S("rect", { class: "c-core", x: 346, y: 22, width: 172, height: 100, rx: 10 }, svg);
    for (let i = 0; i < 5; i++) S("rect", { class: "c-rod", x: 366 + i * 30, y: 30, width: 12, height: 84, rx: 3 }, svg);
    // calor saliendo (heat)
    const up = S("g", { class: "c-heatup" }, svg);
    [0, 1, 2].forEach((i) => S("path", { class: "c-chev", d: `M548 ${104 - i * 30} l22 -18 l22 18`, style: `--i:${i}` }, up));
    // salida
    S("path", { class: "c-pipe c-out", d: "M530 74 H600" }, svg);
    // becario con su cubo
    const bec = S("g", { class: "c-bec" }, S("g", { transform: "translate(164 0)" }, svg));
    const av = S("g", { transform: "translate(0 2) scale(2.3)" }, bec);
    S("path", { d: P.avatar }, av);
    S("path", { class: "c-bucket", d: "M44 40 h22 l-3 22 h-16 z M44 40 c2 -10 20 -10 22 0" }, bec);
    // dato grande: el cambio pedido
    R.delta = S("text", { class: "c-delta", x: 726, y: 92, "text-anchor": "middle" }, svg);
    return {
      R,
      text(step, T, d) {
        d = d || {};
        const kind = d.kind || "heat";
        ["heat", "cool", "becario"].forEach((k) => el.classList.toggle("k-" + k, k === kind));
        const count = Math.max(1, d.count || 1);
        R.count.textContent = count > 1 ? "×" + count : "";
        R.count.hidden = count < 2;
        if (kind === "becario") {
          R.tag.textContent = T.becTag;
          fitc(R.name, T.becMain, 790, 66, 24, 0.44);
          fitc(R.rest, T.becSub, 790, 36, 18, 0.44);
          R.delta.textContent = "−" + (+d.rate || 0).toFixed(d.rate % 1 ? 1 : 0) + " °C/S";
          return;
        }
        const nm = (d.names && d.names[0]) || T.chatAnon;
        const tpl = kind === "heat" ? (count > 1 ? T.heatMany : T.heatOne) : d.follow && count < 2 && T.followOne ? T.followOne : (count > 1 ? T.coolMany : T.coolOne);
        const i = tpl.indexOf("{name}");
        const l1 = i >= 0 ? (tpl.slice(0, i) + nm).trim() : nm;
        const l2 = (i >= 0 ? tpl.slice(i + 6) : tpl).split("{n}").join(String(count - 1)).trim();
        R.tag.textContent = kind === "heat" ? T.heatTag : T.coolTag;
        fitc(R.name, l1, 790, 66, 24, 0.44);
        fitc(R.rest, l2, 790, 36, 16, 0.44);
        R.delta.textContent = d.lock && kind === "cool" ? d.lock // etapa 22: voto que aún no basta («2/5»)
          : kind === "heat" && !(d.amount >= 0.5) ? "MAX" : (kind === "heat" ? "+" : "−") + Math.round(d.amount || 0) + " °C";
      },
    };
  }

  /*
   * Nombre (o grupo) para la tarjeta: nunca se atribuye todo a una persona.
   *   1 → «MARTA» · 2 → «MARTA Y LUIS» · 3+ → «MARTA, LUIS Y 3 MÁS»
   *   sin nombre → «UN HÉROE ANÓNIMO» · todos anónimos → «4 HÉROES ANÓNIMOS»
   */
  function groupLabel(names, count, T) {
    const and = " " + (T.subAnd || "&") + " ";
    const more = (n) => (T.subMore || "+{n}").split("{n}").join(String(n));
    const known = [];
    (names || []).forEach((n) => { n = String(n || "").trim(); if (n && !known.includes(n)) known.push(n); });
    if (count <= 1) return known[0] || T.subAnon;
    if (!known.length) return (T.subAnonMany || "{n} " + T.subAnon).split("{n}").join(String(count));
    let shown = known.slice(0, 2);
    const label = (sh) => {
      const left = count - sh.length;
      if (left <= 0) return sh.length === 1 ? sh[0] : sh.slice(0, -1).join(", ") + and + sh[sh.length - 1];
      return sh.join(", ") + and + more(left);
    };
    let out = label(shown);
    if (out.length > 34 && shown.length > 1) out = label(shown.slice(0, 1));
    return out;
  }

  /* ================================================== 6 · ventanas de crisis (etapa 12) */
  /*
   * El monitor central pierde el control durante CRITICAL: ventanas de error,
   * consolas, logros, diálogos y barras que fallan. Lo dirige gags.js (gag
   * «crisis»): aquí sólo se pintan las ventanas que llegan en data.wins, cada
   * una con su estado (remate, botón que cambia, intento de cierre). Las
   * ventanas se conservan por clave, así entran de una en una sin reconstruir
   * las anteriores. Composición final estática: con movimiento reducido se ve
   * igual, sin sacudidas ni destellos.
   */
  const GLYPH = {
    error: "M12 2.5a9.5 9.5 0 1 0 0.01 0z M8.2 8.2l7.6 7.6 M15.8 8.2l-7.6 7.6",
    dialog: "M12 2.5a9.5 9.5 0 1 0 0.01 0z M9.3 9.2a2.8 2.8 0 1 1 3.6 2.7c-0.6 0.3-0.9 0.8-0.9 1.5v0.8 M12 16.6v1.2",
    hack: "M3 4.5h18v15H3z M6.5 9l3 3-3 3 M11.5 15.5h5",
    achievement: "M7 3.5h10v5a5 5 0 0 1-10 0z M7 5.5H4v1.5a3 3 0 0 0 3 3 M17 5.5h3v1.5a3 3 0 0 1-3 3 M12 13.5v3.5 M8.5 20.5h7 M9.5 17h5v3.5h-5z",
    progress: "M4 12a8 8 0 1 1 2.3 5.7 M4 18.5V12h6.5",
    closer: "M5 5l14 14 M19 5L5 19",
  };
  const CURSOR = "M2 1 L2 21 L7.5 15.6 L11.2 23.4 L14.6 21.9 L11 14.3 L18.6 14.3 Z";

  /*
   * Plan de tamaños de una ventana (puro): lo usan la pintura y la elección de
   * composición (gags.js), que comprueba con él que todo lo que se enseña se
   * podrá LEER al tamaño real de la escena antes de mostrarlo.
   *   compact: una ventana grande, sin título ni texto decorativo.
   * Devuelve los tamaños y `min` (el menor tamaño de texto que se enseña).
   */
  function planWin(fam, t, W, H, compact, morph) {
    const iw = W - 28, ih = H - 52;
    const P = { compact: !!compact };
    const list = String(t.btns || "").split("|").map((x) => x.trim()).filter(Boolean);
    const showBtns = (fam === "error" || fam === "dialog") && list.length && (!compact || fam === "dialog");
    const k = 0.46;
    if (fam === "hack") {
      if (compact) {
        // sin «C:\REACTOR>» ni puntos: la orden en una línea y el resultado grande
        P.main = fitPlan(t.main, iw, 62, 56, 15, k, 1);
        P.sub = fitPlan(t.sub, iw, ih - P.main.f * 1.05 - 14, 76, 16, k, 3);
      } else {
        P.main = fitPlan(t.main, iw, 48, 26, 15, k, 2);
        const cmdH = P.main.lines.length * P.main.f * 1.05;
        P.sub = fitPlan(t.sub, iw, ih - 20 - cmdH - 22 - 26, 40, 16, k, 4);
      }
    } else if (fam === "progress" || fam === "closer") {
      const barH = compact ? 28 : 40;
      const subH = Math.round((ih - barH) * (compact ? 0.56 : 0.5));
      P.main = fitPlan(t.main, iw, ih - barH - subH - 10, compact ? 96 : 44, 18, k, 3);
      P.sub = fitPlan(t.sub, iw, subH, compact ? 76 : 36, 16, k, 3);
    } else {
      P.btns = showBtns ? list : [];
      const btnH = showBtns ? (compact ? 66 : 38) : 0;
      const subH = t.sub ? Math.round((ih - btnH) * (compact ? 0.45 : 0.42)) : 0;
      P.main = fitPlan(t.main, iw, ih - btnH - subH - 8, compact ? 96 : fam === "achievement" ? 46 : 44, 18, k, 3);
      P.sub = t.sub ? fitPlan(t.sub, iw, subH, compact ? 76 : fam === "achievement" ? 30 : 34, 16, k, 3) : null;
      if (showBtns) {
        const n = list.length, pad = iw < 300 ? 6 : 10;
        const chars = list.reduce((m, x) => { const pr = x.split("→"); return m + (morph && pr[1] ? pr[1] : pr[0]).trim().length; }, 0);
        P.btnPad = pad;
        P.btnF0 = Math.floor((iw - n * (2 * pad + 4) - (n - 1) * 8) / (Math.max(6, chars) * 0.56));
        P.btnF = Math.max(13, Math.min(compact ? 56 : 24, P.btnF0));
      }
    }
    const sizes = [P.main.f0];
    if (P.sub && t.sub) sizes.push(P.sub.f0);
    if (P.btnF0 != null) sizes.push(Math.min(P.btnF0, compact ? 56 : 24));
    P.min = Math.min(...sizes);
    return P;
  }

  function buildCrisis(el) {
    const wins = new Map();
    function make(w) {
      const W = { fam: w.fam, R: {} };
      const root = E("div", "cw cw-" + w.fam, null, el);
      W.root = root;
      const bar = E("div", "cw-bar", null, root);
      icon(GLYPH[w.fam] || GLYPH.error, "cw-ico", bar);
      W.R.title = E("span", "cw-title", null, bar);
      const ctl = E("span", "cw-ctl", null, bar);
      E("i", null, "_", ctl); E("i", null, "□", ctl);
      W.R.x = E("i", "cw-x", "×", ctl);
      const b = E("div", "cw-body", null, root);
      W.R.body = b;
      if (w.fam === "hack") {
        const pr = E("div", "cw-prompt", null, b);
        E("b", null, "C:\\REACTOR>", pr);
        W.R.main = E("span", "cw-cmd", null, pr);
        W.R.dots = E("div", "cw-dots", null, b);
        W.R.sub = E("div", "cw-sub cw-out", null, b);
      } else {
        W.R.main = E("div", "cw-main", null, b);
        if (w.fam === "progress" || w.fam === "closer") {
          const pr = E("div", "cw-prog", null, b);
          const tr = E("div", "cw-track", null, pr);
          W.R.fill = E("i", "cw-fill", null, tr);
          W.R.pct = E("span", "cw-pct", null, pr);
        }
        W.R.sub = E("div", "cw-sub", null, b);
        if (w.fam === "error" || w.fam === "dialog") W.R.btns = E("div", "cw-btnrow", null, b);
      }
      const cur = S("svg", { class: "cw-cursor", viewBox: "0 0 24 24", "aria-hidden": "true" }, root);
      S("path", { d: CURSOR }, cur);
      return W;
    }

    function paint(W, w, T) {
      const R = W.R, t = w.t, root = W.root;
      Object.assign(root.style, { left: w.x + "px", top: w.y + "px", width: w.w + "px", height: w.h + "px", zIndex: 10 + w.z });
      root.classList.toggle("is-punch", !!w.punch);
      root.classList.toggle("is-morph", !!w.morph);
      root.dataset.close = w.close || 0;
      root.dataset.id = w.id;
      // el título entero en la barra (sin cortar): se reduce un poco si hace falta;
      // en ventanas estrechas sólo queda el botón ×, y «NO RESPONDE» sustituye
      // al nombre si no caben los dos
      const narrow = w.w < 320;
      root.classList.toggle("is-narrow", narrow);
      const avail = w.w - (narrow ? 70 : 112);
      const tsize = (txt) => Math.floor(avail / (Math.max(1, txt.length) * 0.58));
      let title = t.title;
      if (w.close >= 2) {
        const both = t.title + " " + (T.popNoResp || "");
        title = tsize(both) >= 15 ? both : T.popNoResp || t.title;
      }
      R.title.textContent = title;
      R.title.style.fontSize = Math.max(12, Math.min(21, tsize(title))) + "px";
      root.classList.toggle("is-compact", !!w.compact);
      const sig = [w.w, w.h, t.title, t.main, t.sub, t.btns, w.morph ? 1 : 0, w.fam, w.compact ? 1 : 0].join("|");
      if (W.sig !== sig) {
        W.sig = sig;
        const P = planWin(w.fam, t, w.w, w.h, w.compact, w.morph);
        root.dataset.min = P.min;
        applyFit(R.main, P.main);
        if (w.fam === "hack") R.dots.textContent = "▒▒▒▒▒▒▒▒▒▒▒▒";
        if (P.sub) applyFit(R.sub, P.sub); else R.sub.textContent = "";
        R.sub.hidden = !t.sub;
        if (R.btns) {
          R.btns.textContent = "";
          const list = P.btns || [];
          R.btns.hidden = !list.length;
          list.forEach((x, i) => {
            const parts = x.split("→");
            const bt = E("span", "cw-btn" + (i === list.length - 1 ? " is-last" : ""), null, R.btns);
            bt.textContent = w.morph && parts[1] ? parts[1].trim() : parts[0].trim();
            if (parts[1]) bt.classList.add("can-morph");
          });
          R.btns.style.setProperty("--bpad", (P.btnPad || 10) + "px");
          if (P.btnF) R.btns.style.fontSize = P.btnF + "px";
        }
      }
      if (R.fill) {
        const v = Math.max(0, Math.min(150, w.bar == null ? 99 : w.bar));
        // la barra avanza hasta su punto de fallo durante la preparación
        if (!W.armed) {
          W.armed = true;
          R.fill.style.transitionDuration = Math.max(0.2, w.fillSec || 1.2) + "s";
          R.fill.style.width = "0%";
          void R.fill.offsetWidth;
        }
        R.fill.style.width = v + "%";
        R.pct.textContent = v > 100 ? "9000+%" : Math.round(v) + "%";
      }
      root.classList.toggle("has-sub", !!t.sub);
    }

    return {
      text(step, T, d) {
        const list = (d && d.wins) || [];
        const want = new Set(list.map((w) => w.key));
        for (const [k, W] of wins) if (!want.has(k)) { W.root.remove(); wins.delete(k); }
        list.forEach((w) => {
          let W = wins.get(w.key);
          if (!W || W.fam !== w.fam) { if (W) W.root.remove(); W = make(w); wins.set(w.key, W); }
          paint(W, w, T);
        });
        el.dataset.count = list.length;
      },
      clear() { for (const [, W] of wins) W.root.remove(); wins.clear(); },
    };
  }

  /* ================================================== 7 · guiones de crisis (etapa 14) */
  /*
   * Tres secuencias de humor seco, burocrático y tecnológico, una por vez:
   *   sop   SOPORTE TÉCNICO: problema → «solicitud enviada» → «3–5 días hábiles»
   *   asis  ASISTENTE DE EMERGENCIA: «¿has probado a reiniciar?», dos botones que
   *         dicen lo mismo; el cursor pulsa «Ahora no» → «Perfecto. Reiniciando.»
   *         → «Permiso denegado. Por suerte.» (sólo pantalla: no toca el simulador)
   *   corp  PRIORIDADES CORPORATIVAS: incidente detectado → encuesta de
   *         satisfacción encima → una estrella → «tu opinión es importante»
   * Cada composición se construye una vez; gags.js decide la etapa (at-N/on-N)
   * con el reloj de la crisis. El cursor y los puntos de espera sólo decoran:
   * con movimiento reducido quedan quietos en su sitio final.
   * La temperatura y el nivel salen del simulador en cada render (update).
   */
  const STAR = "M12 2.8 L14.7 9 L21.4 9.5 L16.3 13.9 L17.9 20.5 L12 17 L6.1 20.5 L7.7 13.9 L2.6 9.5 L9.3 9 Z";
  const CHECK = "M4.5 12.5 L9.5 17.5 L19.5 6.5";
  function buildGuion(el) {
    const comps = {};
    function win(parent, cls, glyph) {
      const root = E("div", "cw gw-win " + cls, null, parent);
      const bar = E("div", "cw-bar", null, root);
      icon(glyph, "cw-ico", bar);
      const title = E("span", "cw-title", null, bar);
      const ctl = E("span", "cw-ctl", null, bar);
      E("i", null, "_", ctl); E("i", null, "□", ctl); E("i", "cw-x", "×", ctl);
      const body = E("div", "gw-body", null, root);
      return { root, title, body };
    }
    const cursor = (parent, cls) => { const c = S("svg", { class: "gw-cursor " + (cls || ""), viewBox: "0 0 24 24", "aria-hidden": "true" }, parent); S("path", { d: CURSOR }, c); return c; };
    const live = [];  // nodos con temperatura/nivel reales
    function build(id) {
      const c = E("div", "gw-comp gw-" + id, null, el);
      const R = { c };
      if (id === "sop") {
        const w = win(c, "gw-main gw-s1", GLYPH.error);
        R.title = w.title;
        R.prob = E("div", "gw-big gw-warn", null, w.body);
        R.temp = E("div", "gw-live", null, w.body);
        const sent = E("div", "gw-line gw-ok gw-s1-sent", null, w.body);
        icon(CHECK, "gw-check", sent);
        R.sent = E("span", null, null, sent);
        R.reply = E("div", "gw-big gw-hot gw-s1-reply", null, w.body);
        live.push(R.temp);
      } else if (id === "asis") {
        const w = win(c, "gw-main gw-s2", GLYPH.dialog);
        R.title = w.title;
        R.start = E("div", "gw-big gw-hot gw-s2-start", null, w.body);
        R.dots = E("div", "gw-dots gw-s2-dots", "▒▒▒▒▒▒▒▒▒▒", w.body);
        R.q = E("div", "gw-big gw-hot gw-s2-q", null, w.body);
        const row = E("div", "gw-btns gw-s2-btns", null, w.body);
        R.b1 = E("span", "gw-btn gw-b1", null, row);
        R.b2 = E("span", "gw-btn gw-b2", null, row);
        // remate: «Perfecto. Reiniciando.» (barra que avanza) → «Permiso denegado. Por suerte.»
        R.rs = E("div", "gw-big gw-hot gw-s2-rs", null, w.body);
        const tr = E("div", "gw-track gw-s2-track", null, w.body);
        E("i", "gw-fill", null, tr);
        R.den = E("div", "gw-big gw-warn gw-s2-den", null, w.body);
        R.luck = E("div", "gw-big gw-hot gw-s2-luck", null, w.body);
        R.cur = cursor(w.root, "gw-s2-cur");
      } else if (id === "corp") {
        const a = win(c, "gw-s3a", GLYPH.error);
        R.ta = a.title;
        R.inc = E("div", "gw-big gw-warn", null, a.body);
        R.temp = E("div", "gw-live", null, a.body);
        R.proto = E("div", "gw-line gw-dim", null, a.body);
        live.push(R.temp);
        const b = win(c, "gw-s3b", GLYPH.achievement);
        R.tb = b.title;
        R.ask = E("div", "gw-mid gw-hot gw-s3-ask", null, b.body);
        const stars = E("div", "gw-stars gw-s3-stars", null, b.body);
        R.stars = [0, 1, 2, 3, 4].map((i) => { const sv = S("svg", { class: "gw-star" + (i === 0 ? " is-first" : ""), viewBox: "0 0 24 24", "aria-hidden": "true" }, stars); S("path", { d: STAR }, sv); return sv; });
        R.thanks = E("div", "gw-mid gw-hot gw-s3-thanks", null, b.body);
        R.cur = cursor(b.root, "gw-s3-cur");
      }
      comps[id] = R;
      return R;
    }
    let lastO = null;
    function paintLive() {
      if (!lastO) return;
      const t = lastO.st.temp.toFixed(1) + " °C";
      live.forEach((n) => { n.textContent = (n._lbl || "") + t + (n._lvl ? " · " + lastO.levelText : ""); });
    }
    return {
      text(step, T, d) {
        d = d || {};
        const id = d.id || "sop";
        const R = comps[id] || build(id);
        for (const k in comps) comps[k].c.hidden = k !== id;
        el.classList.toggle("is-compact", !!d.compact);
        const W = d.compact ? 796 : 660; // ancho útil del texto principal
        if (id === "sop") {
          R.title.textContent = T.gsTitle;
          fitLines(R.prob, T.gsProblem, W, d.compact ? 55 : 56, d.compact ? 52 : 50, 30, 0.46, 1);
          R.temp._lbl = T.gsCore + " ";
          // compacta: la confirmación se lee grande en su etapa y, ya leída, se reduce para dejar sitio al remate
          if (!d.compact) fitLines(R.sent, T.gsSent, W - 50, 40, 34, 24, 0.46, 1);
          else if (step < 3) fitLines(R.sent, T.gsSent, W - 50, 116, 54, 24, 0.46, 2);
          else fitLines(R.sent, T.gsSent, W - 50, 34, 32, 20, 0.46, 1);
          fitLines(R.reply, T.gsReply, W, d.compact ? 114 : 46, d.compact ? 54 : 42, 28, 0.46, d.compact ? 2 : 1);
        } else if (id === "asis") {
          R.title.textContent = T.gaTitle;
          fitLines(R.start, T.gaStart, W, 120, 58, 28, 0.46, 2);
          fitLines(R.q, T.gaQuestion, W, 110, d.compact ? 60 : 52, 28, 0.46, 2);
          R.b1.textContent = T.gaBtn1; R.b2.textContent = T.gaBtn2;
          fitLines(R.rs, T.gaRestart, W, d.compact ? 124 : 64, d.compact ? 60 : 50, 28, 0.46, d.compact ? 2 : 1);
          fitLines(R.den, T.gaDenied, W, 66, d.compact ? 62 : 56, 30, 0.46, 1);
          fitLines(R.luck, T.gaLucky, W, 56, d.compact ? 56 : 46, 28, 0.46, 1);
        } else {
          R.ta.textContent = T.gcIncTitle;
          fitLines(R.inc, T.gcIncident, d.compact ? 796 : 396, 60, 56, 28, 0.46, 1);
          R.temp._lbl = T.gsCore + " "; R.temp._lvl = true;
          fitLines(R.proto, T.gcProto, 396, 58, 26, 16, 0.5, 2);
          R.tb.textContent = T.gcSurveyTitle;
          fitLines(R.ask, T.gcAsk, d.compact ? 560 : 340, d.compact ? 118 : 100, d.compact ? 54 : 38, 22, 0.46, 2);
          fitLines(R.thanks, T.gcThanks, d.compact ? 770 : 340, d.compact ? 118 : 130, d.compact ? 54 : 38, 22, 0.46, d.compact ? 2 : 3);
        }
        // destino del cursor (botón «Ahora no» o primera estrella), en px de la ventana
        const aim = (cur, target) => {
          if (!cur || !target || step < 2) return;
          let x = 0, y = 0, n = target;
          const root = cur.parentNode;
          while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
          if (n !== root) return;
          const tx = target.classList.contains("gw-stars") ? 24 : target.offsetWidth * 0.55;
          cur.style.setProperty("--cx", Math.round(x + tx) + "px");
          cur.style.setProperty("--cy", Math.round(y + target.offsetHeight * 0.6) + "px");
          cur.style.setProperty("--sx", Math.round(root.offsetWidth - 40) + "px");
          cur.style.setProperty("--sy", Math.round(root.offsetHeight - 30) + "px");
        };
        if (id === "asis") aim(R.cur, R.b1);
        if (id === "corp") aim(R.cur, R.stars[0].parentNode); // contenedor HTML: la primera estrella está a su izquierda
        el.dataset.guion = id;
        paintLive();
      },
      update(o) { lastO = o; paintLive(); },
    };
  }

  const BUILD = { guion: buildGuion, fuel: buildFuel, denial: buildDenial, supervisor: buildSupervisor, rescue: buildRescue, chat: buildChat, crisis: buildCrisis };
  const STEPS = { fuel: 5, denial: 5, supervisor: 4, rescue: 3, chat: 1, crisis: 1, guion: 6 };

  function create(parent) {
    const root = E("div", "stg", null, parent);
    root.hidden = true;
    // Franja con la temperatura y el estado reales (siempre visibles)
    const band = E("div", "stg-band", null, root);
    const bl = E("div", "stg-band-l", null, band);
    const bLbl = E("span", "lbl", null, bl);
    const bTemp = E("span", "stg-temp", "000.0", bl);
    const bUnit = E("span", "stg-unit", null, bl);
    // etapa 22: contador de «enfriar sale caro» (sólo en CRITICAL con el bloqueo activo)
    const bLock = E("div", "stg-lock", null, band);
    const bLock1 = E("span", "stg-lock-a", null, bLock);
    const bLock2 = E("span", "stg-lock-b", null, bLock);
    bLock.hidden = true;
    const br = E("div", "stg-band-r lv-text", null, band);
    E("b", "lv-dot", null, br);
    const bLvl = E("span", null, null, br);
    const host = E("div", "stg-host", null, root);
    const scenes = {};
    let cur = null;

    function scene(name) {
      if (!scenes[name]) {
        const el = E("div", "stg-scene sc-" + name, null, host);
        scenes[name] = Object.assign({ el }, BUILD[name](el));
      }
      return scenes[name];
    }

    function show(name, step, T, data) {
      if (!BUILD[name]) return;
      const sc = scene(name);
      root.hidden = false;
      for (const k in scenes) scenes[k].el.hidden = k !== name;
      const n = Math.max(1, Math.min(STEPS[name], step | 0));
      const cls = ["stg-scene", "sc-" + name, "on-" + n];
      for (let i = 1; i <= n; i++) cls.push("at-" + i);
      sc.el.className = cls.join(" ");
      sc.text(n, T, data);
      if (cur !== name) {
        // encendido breve tipo CRT al entrar (sin efecto con movimiento reducido)
        root.classList.remove("is-enter");
        void root.offsetWidth;
        root.classList.add("is-enter");
      }
      root.dataset.scene = name;
      root.dataset.step = n;
      cur = name;
    }

    function hide() {
      if (scenes.crisis && scenes.crisis.clear) scenes.crisis.clear();
      root.hidden = true;
      root.classList.remove("is-enter");
      delete root.dataset.scene;
      delete root.dataset.step;
      cur = null;
    }

    function update(o) {
      bLbl.textContent = o.tempLabel;
      bTemp.textContent = o.st.temp.toFixed(1);
      bUnit.textContent = o.unit;
      bLvl.textContent = o.levelText;
      bLock.hidden = !o.lockA;
      if (o.lockA) { bLock1.textContent = o.lockA; bLock2.textContent = o.lockB || ""; }
      root.classList.toggle("is-rec", !!o.rec);
      if (cur && scenes[cur].update) scenes[cur].update(o);
    }

    return { show, hide, update, root, get active() { return cur; }, get step() { return cur ? +root.dataset.step : 0; } };
  }

  window.DuckReactorStage = { create, STEPS, groupLabel, fitLines, fitPlan, planWin };
})();

;
/* ---- src/screens.js ---- */
/*
 * Duck Reactor — contenido de pantallas (etapa 5).
 * HTML/CSS/SVG dentro de las superficies que crea scene.js. No simula nada:
 * pinta el estado compartido del simulador (DR.createSim). Todo texto de la
 * configuración se inserta con textContent, nunca como HTML.
 *
 * Pantalla central en dos vistas (config.display.mode):
 *   show:      temperatura y estado en grande, gráfico pequeño y una franja
 *              de mensajes grandes (titulares con humor y gags).
 *   technical: la pantalla completa de lecturas, log y barras.
 * Superficies de gag (las maneja gags.js, una sola a la vez):
 *   strip     franja grande de la pantalla central
 *   advisory  panel de avisos superior derecho
 *   window    ventana retro dentro de la pantalla central
 * La temperatura y el estado siguen visibles durante cualquier gag.
 *
 * window.DuckReactorScreens.mount(scene, store, sim) → {
 *   applyTexts(), applyDisplay(), setDecor(bool), next(kind), render(force),
 *   setGag(spec), setGagProgress(p), clearGag(), gagTarget(), destroy()
 * Gags visuales: setGag({ target: "stage", scene, step }) → stage.js.
 * }
 */
(function () {
  "use strict";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const pad = (n) => String(n).padStart(2, "0");

  function E(tag, cls, text, parent) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function S(tag, attrs, parent) {
    const n = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function crt(kind) {
    const root = E("div", `crt crt--${kind}`);
    const body = E("div", "crt-body", null, root);
    E("div", "crt-scan", null, root);
    E("div", "crt-roll", null, root);
    E("div", "crt-glass", null, root);
    return { root, body };
  }
  function wavePath() {
    let d = "M0 50";
    for (let x = 0; x <= 200; x += 2) {
      const y = 50 + 22 * Math.sin((x / 100) * Math.PI * 2) + 8 * Math.sin((x / 25) * Math.PI * 2);
      d += ` L${x} ${y.toFixed(1)}`;
    }
    return d;
  }

  /* Iconos de línea (24×24) coherentes con los CRT. */
  const ICONS = {
    drop: "M12 3 L18 12.5 A6 6 0 1 1 6 12.5 Z",
    mug: "M4 9h12v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z M16 11h2.5a2.5 2.5 0 0 1 0 5H16 M7 2.5v3.5 M10 2.5v3.5 M13 2.5v3.5",
    warn: "M12 2.5 L22.5 20.5 H1.5 Z M12 9v6 M12 17v1.6",
    button: "M3 18h18v3H3z M6 18 a6 5.5 0 0 1 12 0 M9 9.5 l-2-3 M15 9.5 l2-3 M12 8.5v-4",
    check: "M3.5 3.5h17v17h-17z M7.5 12.5 l3 3 l6-7",
    trash: "M4 6.5h16 M9 6.5v-3h6v3 M6 6.5l1.2 14h9.6l1.2-14 M10 10.5v6.5 M14 10.5v6.5",
    download: "M12 3v11 M7 9.5l5 5 5-5 M4 16.5v4h16v-4",
    fine: "M12 21 c-5 0-8-3.5-6.5-8 c1 2 2.5 2.5 2.5 2.5 c-1-5 3-8 6-11 c0 4 4 5 4 10.5 c0 3.5-2.5 6-6 6z",
  };

  /*
   * Ajusta el tamaño de letra para que el texto completo quepa en su caja
   * (se mide con el texto entero antes de escribirlo letra a letra).
   * box: caja de tamaño fijo · inner: bloque que envuelve línea y cursor.
   */
  function fitText(box, inner, line, text, max, min) {
    line.textContent = text;
    const over = () => inner.scrollWidth > inner.clientWidth + 1 || inner.offsetHeight > box.clientHeight + 1 || inner.offsetWidth > box.clientWidth + 1;
    // 1.º en una sola línea, sin bajar de ~65 % del tamaño máximo
    inner.style.whiteSpace = "nowrap";
    let f = max;
    const oneLineMin = Math.max(min, Math.round(max * 0.65));
    box.style.fontSize = f + "px";
    while (f > oneLineMin && over()) { f -= 2; box.style.fontSize = f + "px"; }
    if (!over()) return f;
    // 2.º si no cabe, en dos líneas
    inner.style.whiteSpace = "";
    f = max;
    box.style.fontSize = f + "px";
    while (f > min && over()) { f -= 2; box.style.fontSize = f + "px"; }
    return f;
  }

  function mount(scene, store, sim) {
    const C = () => store.cfg;
    const R = {};             // nodos con nombre
    const typingNodes = new Set();
    let decor = true;
    let destroyed = false;

    /* Etiquetas fijas de las pantallas: se rellenan en applyTexts() con el idioma actual. */
    const fixedNodes = [];
    const fixed = (node, key, suffix) => { fixedNodes.push([node, key, suffix || ""]); return node; };
    const RO_KEY = { pressure: "scrRoPressure", coolant: "scrRoCoolant", rods: "scrRoRods", output: "scrRoOutput" };
    const lvText = (l) => { const T = memeTexts(); return T["lv" + l] || l; };

    /* ---------------- plantillas ---------------- */

    function buildSoon() {
      const { root, body } = crt("soon");
      const top = E("div", "soon-top", null, body);
      R.soonHeader = E("span", null, null, top);
      const badge = E("span", "soon-badge", null, top);
      E("b", null, null, badge);
      R.soonBadge = E("span", null, null, badge);
      const title = E("div", "soon-title", null, body);
      ["tl", "tr", "bl", "br"].forEach((c) => E("span", "corner " + c, null, title));
      R.soonLines = E("div", "soon-lines", null, title);
      const foot = E("div", "soon-foot", null, body);
      R.soonFooter = E("span", null, null, foot);
      const bar = E("span", "soon-bar", null, foot);
      for (let i = 0; i < 12; i++) E("i", null, null, bar).style.setProperty("--i", i);
      return root;
    }

    function buildCore() {
      const { root, body } = crt("core");
      const head = E("header", "core-head", null, body);
      R.coreTitle = E("span", "core-title", null, head);
      const clock = E("span", "core-clock", null, head);
      R.coreShift = E("em", null, null, clock);
      R.clock = E("span", null, "--:--:--", clock);

      const main = E("section", "core-main", null, body);
      // Temperatura
      const tcol = E("div", "core-temp", null, main);
      R.tempLabel = E("div", "lbl", null, tcol);
      const trow = E("div", "temp-row", null, tcol);
      R.temp = E("span", "temp-val lv-num", "000.0", trow);
      R.tempUnit = E("span", "temp-unit", null, trow);
      const trend = E("div", "temp-trend", null, tcol);
      R.arrow = S("svg", { viewBox: "0 0 12 10" }, trend);
      S("path", { d: "M6 1 L11 9 L1 9 Z" }, R.arrow);
      R.delta = E("span", null, "+0.0", trend);
      fixed(E("span", "dim", null, trend), "scrTrend");
      const gauge = E("div", "gauge", null, tcol);
      R.segs = E("div", "gauge-segs", null, gauge);
      for (let i = 0; i < 30; i++) E("i", null, null, R.segs);
      R.limit = E("div", "gauge-limit", null, gauge);
      R.limitLabel = E("span", null, null, R.limit);
      const scale = E("div", "gauge-scale", null, gauge);
      E("span", null, "0", scale);
      R.scaleMax = E("span", null, null, scale);
      // Gráfico
      const gcol = E("div", "core-graph", null, main);
      const glbl = E("div", "lbl", null, gcol);
      fixed(E("span", null, null, glbl), "scrGraph", " ");
      R.range = E("span", "dim", null, glbl);
      R.graph = S("svg", { viewBox: "0 0 300 150", preserveAspectRatio: "none" }, gcol);
      const grid = S("g", { class: "grid" }, R.graph);
      [30, 60, 90, 120].forEach((y) => S("line", { x1: 0, y1: y, x2: 300, y2: y }, grid));
      [50, 100, 150, 200, 250].forEach((x) => S("line", { x1: x, y1: 0, x2: x, y2: 150 }, grid));
      R.thLines = S("g", { class: "th-lines" }, R.graph);
      R.area = S("path", { class: "area", d: "" }, R.graph);
      R.line = S("polyline", { class: "line", points: "" }, R.graph);
      R.halo = S("circle", { class: "head-halo", r: 7, cx: 300, cy: 75 }, R.graph);
      R.head = S("circle", { class: "head", r: 3.2, cx: 300, cy: 75 }, R.graph);
      const axis = E("div", "graph-axis", null, gcol);
      fixed(E("span", null, null, axis), "scrAxisPast");
      fixed(E("span", null, null, axis), "scrAxisNow");
      // Estado y lecturas
      const scol = E("div", "core-status", null, main);
      R.reactorLabel = E("div", "lbl", null, scol);
      const pill = E("div", "pill lv-text lv-box", null, scol);
      E("b", "lv-dot", null, pill);
      R.pillText = E("span", null, null, pill);
      const ul = E("ul", "readouts", null, scol);
      R.readouts = C().content.core.readouts.map(() => {
        const li = E("li", null, null, ul);
        const lbl = E("span", "r-lbl", null, li);
        const val = E("span", "r-val", null, li);
        const num = E("span", null, "--", val);
        val.append(" ");
        const unit = E("small", null, null, val);
        const bar = E("span", "r-bar", null, li);
        const fill = E("i", null, null, bar);
        return { lbl, num, unit, fill };
      });
      R.log = E("section", "core-log", null, body);
      const aux = E("aside", "core-aux", null, body);
      fixed(E("span", "lbl", null, aux), "scrAux");
      const bars = E("span", "aux-bars", null, aux);
      for (let i = 0; i < 5; i++) E("i", null, null, bars).style.setProperty("--i", i);
      const pumps = E("aside", "core-pumps", null, body);
      fixed(E("span", "lbl", null, pumps), "scrPumps");
      const pb = E("span", "pumps", null, pumps);
      R.pumps = [E("b", null, null, pb), E("b", null, null, pb), E("b", "off", null, pb)];

      /* ---- Vista show: temperatura y estado como protagonistas ---- */
      const sh = E("section", "core-show", null, body);
      const st = E("div", "sh-temp", null, sh);
      const shead = E("div", "sh-temp-head", null, st);
      R.shTempLabel = E("span", "lbl", null, shead);
      const strend = E("span", "temp-trend sh-trend", null, shead);
      const srow = E("div", "sh-temp-row", null, st);
      R.shTemp = E("span", "sh-temp-val", "000.0", srow);
      R.shUnit = E("span", "sh-temp-unit", null, srow);
      R.shArrow = S("svg", { viewBox: "0 0 12 10" }, strend);
      S("path", { d: "M6 1 L11 9 L1 9 Z" }, R.shArrow);
      R.shDelta = E("span", null, "+0.0", strend);
      fixed(E("span", "dim", null, strend), "scrTrend");
      const ss = E("div", "sh-state", null, sh);
      R.shReactorLabel = E("div", "lbl", null, ss);
      const spill = E("div", "sh-pill lv-text lv-box", null, ss);
      E("b", "lv-dot", null, spill);
      R.shPill = E("span", null, null, spill);
      // Etapa 13: «CRITICAL ACTIVO» frente a «RECUPERACIÓN EN CURSO» (con cuenta atrás y tendencia)
      R.shRec = E("div", "sh-rec", null, ss);
      R.shRecA = E("span", "sh-rec-a", null, R.shRec);
      R.shRecB = E("span", "sh-rec-b", null, R.shRec);
      const recBar = E("i", "sh-rec-bar", null, R.shRec);
      R.shRecFill = E("b", null, null, recBar);
      const sg = E("div", "sh-graph", null, ss);
      const sgl = E("div", "lbl", null, sg);
      fixed(E("span", null, null, sgl), "scrGraph", " ");
      R.shRange = E("span", "dim", null, sgl);
      R.shGraph = S("svg", { viewBox: "0 0 300 80", preserveAspectRatio: "none" }, sg);
      const sgrid = S("g", { class: "grid" }, R.shGraph);
      [20, 40, 60].forEach((y) => S("line", { x1: 0, y1: y, x2: 300, y2: y }, sgrid));
      R.shTh = S("g", { class: "th-lines" }, R.shGraph);
      R.shArea = S("path", { class: "area", d: "" }, R.shGraph);
      R.shLine = S("polyline", { class: "line", points: "" }, R.shGraph);
      R.shHead = S("circle", { class: "head", r: 3.2, cx: 300, cy: 40 }, R.shGraph);
      const corner = E("div", "sh-corner", null, sh);
      R.shDaysLabel = E("span", "sh-days-label", null, corner);
      R.shDaysValue = E("span", "sh-days-value", null, corner);

      /* ---- Franja de mensajes grandes (titulares y gags) ---- */
      R.gz = E("div", "gz", null, body);
      ["tl", "tr", "bl", "br"].forEach((c) => E("span", "corner " + c, null, R.gz));
      R.gzTag = E("span", "gz-tag", null, R.gz);
      const gzRow = E("div", "gz-row", null, R.gz);
      R.gzIcon = S("svg", { class: "gz-icon", viewBox: "0 0 24 24", "aria-hidden": "true" }, gzRow);
      R.gzIconPath = S("path", { d: "" }, R.gzIcon);
      R.gzBox = E("div", "gz-text", null, gzRow);
      R.gzInner = E("div", "gz-inner", null, R.gzBox);
      R.gzLine = E("span", "gz-line", null, R.gzInner);
      E("i", "cursor", null, R.gzInner);

      /* ---- Ventana retro (gag de la actualización) ---- */
      R.gw = E("div", "gw", null, body);
      R.gw.hidden = true;
      const bar = E("div", "gw-bar", null, R.gw);
      R.gwTitle = E("span", "gw-title", null, bar);
      const btns = E("span", "gw-btns", null, bar);
      E("i", null, "_", btns); E("i", null, "×", btns);
      const gwb = E("div", "gw-body", null, R.gw);
      const gwRow = E("div", "gw-row", null, gwb);
      R.gwIcon = S("svg", { class: "gw-icon", viewBox: "0 0 24 24", "aria-hidden": "true" }, gwRow);
      R.gwIconPath = S("path", { d: "" }, R.gwIcon);
      R.gwBox = E("div", "gw-text", null, gwRow);
      R.gwInner = E("div", "gw-inner", null, R.gwBox);
      R.gwLine = E("span", "gw-line", null, R.gwInner);
      E("i", "cursor", null, R.gwInner);
      const prow = E("div", "gw-progrow", null, gwb);
      R.gwProg = E("div", "gw-prog", null, prow);
      for (let i = 0; i < 25; i++) E("i", null, null, R.gwProg);
      R.gwPct = E("span", "gw-pct", null, prow);
      R.gwSub = E("div", "gw-sub", null, gwb);
      /* ---- Escenario de gags visuales (stage.js) ---- */
      R.stg = window.DuckReactorStage ? window.DuckReactorStage.create(body) : null;
      R.coreRoot = root;
      return root;
    }

    function buildStatus() {
      const { root, body } = crt("status");
      const m = E("div", "st-main", null, body);
      R.statusLabel = E("div", "lbl", null, m);
      const v = E("div", "st-val lv-text", null, m);
      E("b", "ok-dot lv-dot", null, v);
      R.statusValue = E("span", null, null, v);
      const l = E("div", "st-load", null, body);
      R.loadLabel = E("div", "lbl", null, l);
      const pct = E("div", "st-pct", null, l);
      R.load = E("span", null, "--", pct);
      pct.append("%");
      R.loadSegs = E("div", "st-segs", null, l);
      for (let i = 0; i < 10; i++) E("i", null, null, R.loadSegs);
      /* Etapa 13: aviso de la fuga de vapor, señalando la junta real (a la
         izquierda de esta pantalla) con un pequeño esquema de la tubería */
      R.incident = E("div", "st-inc", null, body);
      const isv = S("svg", { class: "st-inc-map", viewBox: "0 0 120 60", "aria-hidden": "true" }, R.incident);
      S("path", { class: "st-inc-pipe", d: "M6 30 H114 M50 22 v16 M58 22 v16" }, isv);
      S("path", { class: "st-inc-arrow", d: "M30 14 L12 30 L30 46 M12 30 H44" }, isv);
      R.incPuff = S("circle", { class: "st-inc-dot", cx: 54, cy: 30, r: 7 }, isv);
      const it = E("div", "st-inc-text", null, R.incident);
      R.incTag = E("b", null, null, it);
      R.incWhere = E("span", null, null, it);
      R.incident.hidden = true;
      return root;
    }

    function buildAdvisory() {
      const { root, body } = crt("advisory");
      R.advRoot = root;
      const top = E("div", "adv-top", null, body);
      R.advLabel = E("span", "lbl", null, top);
      R.advN = E("span", "dim", "01", top);
      const msg = E("div", "adv-msg", null, body);
      R.advMsg = msg;
      E("span", "prompt", ">", msg);
      const txt = E("span", "adv-text", null, msg);
      R.advBox = txt;
      R.adv = E("span", "adv-line", null, txt);
      E("i", "cursor", null, txt);
      return root;
    }

    function buildAux(kind) {
      const { root, body } = crt("aux");
      if (kind === "auxWave") {
        const s = S("svg", { class: "aux-wave", viewBox: "0 0 200 100", preserveAspectRatio: "none" }, body);
        S("path", { d: wavePath() }, s);
      } else if (kind === "auxMeme") {
        // memes de sistema antiguo (etapa 17): rotan solos; en ALARM/CRITICAL, los de pánico
        root.classList.add("crt--meme");
        const box = E("div", "aux-meme", null, body);
        R.auxMeme = { box, inner: E("div", "aux-meme-in", null, box) };
      } else if (kind === "auxBars") {
        const col = E("div", "aux-col", null, body);
        for (let i = 0; i < 4; i++) E("i", null, null, col).style.setProperty("--i", i);
      } else {
        const tx = E("div", "aux-text", null, body);
        R.auxText = R.auxText || [];
        R.auxText.push(tx);
      }
      return root;
    }

    const built = [];
    for (const id in C().screens) {
      const s = C().screens[id], target = scene.screens[id] && scene.screens[id].content;
      if (!target) continue;
      let node = null;
      if (s.kind === "soon") node = buildSoon();
      else if (s.kind === "core") node = buildCore();
      else if (s.kind === "status") node = buildStatus();
      else if (s.kind === "advisory") node = buildAdvisory();
      else if (/^aux/.test(s.kind)) node = buildAux(s.kind);
      if (!node) continue;
      target.textContent = "";
      target.appendChild(node);
      built.push(node);
    }

    /* ---------------- pantallita de memes (etapa 17) ---------------- */
    const meme = { bag: [], bagCrisis: [], last: null, crisis: null, until: 0, timer: 0, glitch: 0 };
    const memeCrisis = () => { const l = sim.shownLevel ? sim.shownLevel() : sim.state.level; return (l === "ALARMED" || l === "PANIC") && !(sim.recovery && sim.recovery()); };
    function memeNext(crisis) {
      const T = memeTexts(), pool = ((crisis ? T.scrAuxPanic : T.scrAuxMemes) || []).filter((x) => x && x.trim());
      if (!pool.length) return "";
      const key = crisis ? "bagCrisis" : "bag";
      // bolsa barajada: no se repite ninguno hasta que salen todos, ni dos seguidos
      if (!meme[key].length) {
        meme[key] = pool.slice().sort(() => Math.random() - 0.5);
        if (meme[key].length > 1 && meme[key][0] === meme.last) meme[key].push(meme[key].shift());
      }
      return (meme.last = meme[key].shift());
    }
    function memePaint(text) {
      const M = R.auxMeme;
      if (!M) return;
      const lines = String(text || "").split("/").map((x) => x.replace(/\s+$/, "")).filter((x) => x.trim()); // se respetan los espacios iniciales (dibujos ASCII)
      M.inner.textContent = "";
      lines.forEach((ln, i) => { const sp = E("span", null, ln, M.inner); if (i === lines.length - 1) E("i", "cursor", null, sp); });
      // el tamaño de letra que quepa (máx. 26 px): líneas cortas, letras grandes
      let f = 26;
      M.box.style.fontSize = f + "px";
      while (f > 9 && (M.inner.scrollWidth > M.box.clientWidth + 1 || M.inner.offsetHeight > M.box.clientHeight + 1)) { f -= 1; M.box.style.fontSize = f + "px"; }
    }
    function memeShow(text) {
      const M = R.auxMeme;
      if (!M) return;
      clearTimeout(meme.glitch);
      if (!decor) { M.box.classList.remove("is-glitch"); memePaint(text); return; }
      // cambio con un fogonazo de estática, como un canal mal sintonizado
      M.box.classList.add("is-glitch");
      const noise = "▒░▓#%@&$?!";
      M.inner.textContent = "";
      for (let i = 0; i < 3; i++) E("span", null, Array.from({ length: 5 }, () => noise[Math.floor(Math.random() * noise.length)]).join(""), M.inner);
      meme.glitch = setTimeout(() => { if (destroyed) return; M.box.classList.remove("is-glitch"); memePaint(text); }, 260);
    }
    function memeTick(force) {
      if (destroyed || !R.auxMeme) return;
      const now = performance.now(), crisis = memeCrisis();
      if (force || crisis !== meme.crisis || now >= meme.until) {
        meme.crisis = crisis;
        memeShow(memeNext(crisis));
        meme.until = now + (crisis ? 4200 + Math.random() * 2300 : 7500 + Math.random() * 4500);
      }
    }
    const memeTimer = R.auxMeme ? setInterval(() => { if (!document.hidden) memeTick(false); }, 400) : 0;

    /* ---------------- textos de configuración ---------------- */

    function applyTexts() {
      const c = C().content, T = memeTexts();
      fixedNodes.forEach(([n, k, suf]) => { n.textContent = (T[k] || "") + suf; });
      if (R.soonHeader) {
        R.soonHeader.textContent = T.scrSoonHeader;
        R.soonBadge.textContent = T.scrSoonBadge;
        R.soonFooter.textContent = T.scrSoonFooter;
        R.soonLines.textContent = "";
        const lines = T.scrSoonLines || [];
        lines.forEach((l, i) => {
          const line = E("span", "soon-line", l, R.soonLines);
          if (i === lines.length - 1) E("i", "cursor", null, line);
        });
        fitSoon();
      }
      if (R.coreTitle) {
        R.coreTitle.textContent = T.scrCoreTitle;
        R.coreShift.textContent = T.scrShift;
        R.tempLabel.textContent = T.scrTempLabel;
        R.tempUnit.textContent = c.core.temp.unit;
        R.scaleMax.textContent = String(c.core.temp.max);
        R.reactorLabel.textContent = T.scrReactorLabel;
        c.core.readouts.forEach((r, i) => {
          const n = R.readouts[i];
          if (!n) return;
          n.lbl.textContent = T[RO_KEY[r.key]] || r.key.toUpperCase();
          n.unit.textContent = r.unit;
        });
      }
      if (R.shTemp) {
        R.shTempLabel.textContent = T.scrTempLabel;
        R.shUnit.textContent = c.core.temp.unit;
        R.shReactorLabel.textContent = T.scrReactorLabel;
        R.shDaysLabel.textContent = T.daysLabel;
        R.shDaysValue.textContent = T.daysValue;
      }
      if (R.statusLabel) { R.statusLabel.textContent = T.scrStatusLabel; R.loadLabel.textContent = T.scrLoadLabel; }
      if (R.advLabel && !(gagState && gagState.target === "advisory")) R.advLabel.textContent = T.scrAdvisoryLabel;
      if (R.auxText) R.auxText.forEach((tx) => {
        tx.textContent = "";
        (T.scrAuxRows || []).forEach((r) => E("span", null, r, tx));
        E("i", "cursor", null, tx);
      });
      if (R.auxMeme) { meme.bag = []; meme.bagCrisis = []; memeTick(true); } // idioma o lista nuevos: se rehace la bolsa
      relocalize();
      applyDisplay();
      render(true);
    }

    /*
     * STARTING SOON: cada línea en una sola fila. Si un idioma la hace más ancha
     * que el monitor, se reduce la letra de todas las líneas por igual.
     */
    /* Etapa 15: palabras largas (RECUPERACIÓN, RÉCUPÉRATION…) caben en la pastilla de estado reduciendo un poco la letra. */
    function fitPill(span) {
      const pill = span.parentNode, box = pill && pill.parentNode;
      if (!box || !span.offsetWidth) return;
      pill.style.fontSize = "";
      const over = pill.offsetWidth - box.clientWidth;
      if (over > 0) pill.style.fontSize = Math.floor(parseFloat(getComputedStyle(pill).fontSize) * (span.offsetWidth - over - 2) / span.offsetWidth) + "px";
    }
    let soonProbe = null;
    function fitSoon() {
      if (!R.soonLines) return;
      const spans = [...R.soonLines.children];
      spans.forEach((sp) => { sp.style.fontSize = ""; });
      // el marco y las líneas miden lo que su texto: el límite es el propio monitor
      const crtEl = R.soonLines.closest(".crt");
      const avail = crtEl ? crtEl.clientWidth - 40 : 352, availH = crtEl ? crtEl.clientHeight * 0.62 : 170;
      if (!avail || !spans.length) return;
      // se mide fuera de la escena (sin perspectiva ni escala), con la misma letra
      const cs = getComputedStyle(spans[0]), f = parseFloat(cs.fontSize) || 82;
      if (!soonProbe) { soonProbe = E("span", null, null, document.body); soonProbe.setAttribute("aria-hidden", "true"); Object.assign(soonProbe.style, { position: "absolute", left: "-9999px", top: "0", whiteSpace: "nowrap", visibility: "hidden" }); }
      Object.assign(soonProbe.style, { fontFamily: cs.fontFamily, fontSize: f + "px", letterSpacing: cs.letterSpacing, fontWeight: cs.fontWeight });
      let k = 1;
      spans.forEach((sp) => { soonProbe.textContent = sp.textContent; const w = soonProbe.offsetWidth; if (w > avail) k = Math.min(k, avail / w); });
      const h = R.soonLines.offsetHeight;
      if (availH && h > availH * 0.96) k = Math.min(k, (availH * 0.96) / h);
      if (k < 1) spans.forEach((sp) => { sp.style.fontSize = Math.floor(f * k) + "px"; });
    }

    /*
     * Cambio de idioma o de textos: el aviso, el titular y el log que se ven
     * pasan al momento al texto nuevo (mismo mensaje), sin volver a escribirse.
     */
    function relocalize() {
      if (R.adv && R.advRef && !(gagState && gagState.target === "advisory")) {
        clearTimeout(R.adv._typing); typingNodes.delete(R.adv);
        const t = refText(R.advRef);
        R.adv.dataset.full = t; R.adv.textContent = t;
      }
      if (R.log) R.log.querySelectorAll(".log-line > span:last-child").forEach((b) => {
        if (!b._ref) return;
        clearTimeout(b._typing); typingNodes.delete(b);
        const t = refText(b._ref);
        b.dataset.full = t; b.textContent = t;
      });
      if (R.gz && !(gagState && (gagState.target === "strip" || gagState.target === "window"))) paintStrip(true);
      // gags visuales en curso: mismo paso, textos del idioma nuevo
      if (gagState && gagState.target === "stage" && R.stg) R.stg.show(gagState.scene, gagState.step, memeTexts(), gagState.data);
      if (incident) paintIncident();
    }

    const memeTexts = () => { const m = C().memes; return m.texts[m.lang] || m.texts.en; };
    const isShow = () => C().display.mode === "show";

    /* Vista show / técnica: sólo cambia qué partes se ven. */
    function applyDisplay() {
      const mode = C().display.mode;
      scene.stage.dataset.display = mode;
      if (R.coreRoot) R.coreRoot.dataset.mode = mode;
      paintStrip();
    }

    /* ---------------- escritura tipo terminal ---------------- */

    function typeInto(node, text) {
      if (!node || destroyed) return;
      clearTimeout(node._typing);
      node.dataset.full = text;
      const speed = C().crt.typeSpeed;
      if (!decor || speed <= 0) { node.textContent = text; typingNodes.delete(node); return; }
      typingNodes.add(node);
      node.textContent = "";
      let i = 0;
      const step = () => {
        if (destroyed || !node.isConnected) { typingNodes.delete(node); return; }
        node.textContent = text.slice(0, ++i);
        if (i < text.length) node._typing = setTimeout(step, speed);
        else typingNodes.delete(node);
      };
      step();
    }
    function finishTyping() {
      typingNodes.forEach((n) => { clearTimeout(n._typing); n.textContent = n.dataset.full || n.textContent; });
      typingNodes.clear();
    }

    /* ---------------- mensajes ---------------- */

    const msg = { count: 0, adv: 0, joke: 0, alert: { NOTICE: 0, ALARMED: 0, PANIC: 0 }, headAlert: { NOTICE: 1, ALARMED: 1, PANIC: 1 },
      log: 0, nextAdv: 0, nextLog: 0, shown: 0 };

    /*
     * Mensajes por referencia (lista + índice o clave): así se pueden volver a
     * pintar en otro idioma. refText(ref) da el texto en el idioma actual.
     */
    const ref = (k, i) => ({ k, i: i || 0 });
    function refText(r) {
      if (!r) return "";
      if (typeof r === "string") return r;
      if (r.fn) return r.fn();
      const v = memeTexts()[r.k];
      if (Array.isArray(v)) return v.length ? v[r.i % v.length] : "";
      return v == null ? "" : String(v);
    }
    const listLen = (k) => { const v = memeTexts()[k]; return Array.isArray(v) ? v.length : 0; };

    /*
     * Avisos del panel superior. En vista show los chistes van a la franja
     * grande (titulares) y el panel sólo muestra avisos y alertas.
     */
    function pickMessage(kind) {
      const M = C().messages, level = sim.state.level;
      if (kind === "joke") return ref("msgJokes", msg.joke++);
      if (kind === "advisory") return ref("msgAdvisories", msg.adv++);
      // recuperación en curso: nada de «SCRAM»; se informa del enfriamiento confirmado
      if (sim.recovery && sim.recovery()) return ref("recAdvisory");
      // automático: en alarma, sólo mensajes coherentes con el nivel
      if (level !== "NORMAL") return ref("msgAlerts" + level, msg.alert[level]++);
      msg.count++;
      if (!isShow() && M.humor && listLen("msgJokes") && msg.count % M.jokeEvery === 0) return ref("msgJokes", msg.joke++);
      return ref("msgAdvisories", msg.adv++);
    }
    function showAdvisory(r) {
      if (!R.adv) return;
      if (gagState && gagState.target === "advisory") return; // el gag manda; al terminar se pide uno nuevo
      R.advRoot.classList.remove("is-gag");
      R.advMsg.style.fontSize = "";
      R.advBox.style.whiteSpace = "";
      R.advRef = r;
      typeInto(R.adv, refText(r));
      msg.shown++;
      R.advN.textContent = pad((msg.shown % 99) || 99);
    }

    /* ---------------- titulares de la franja (vista show) ---------------- */
    let headline = { ref: null, tone: "calm" };
    function headlineFor(level) {
      const M = C().messages;
      if (level !== "NORMAL") return { ref: ref("msgAlerts" + level, msg.headAlert[level]++), tone: level === "NOTICE" ? "notice" : "alarm" };
      if (M.humor && listLen("msgJokes")) return { ref: ref("msgJokes", msg.joke++), tone: "calm" };
      return { ref: ref("msgAdvisories", msg.adv++), tone: "calm" };
    }
    function setHeadline(h) {
      headline = h;
      paintStrip();
    }
    /* Pinta la franja: el gag si lo hay; si no, el titular (sólo en show). instant: sin escribir letra a letra. */
    function paintStrip(instant) {
      if (!R.gz) return;
      const g = gagState && gagState.target === "strip" ? gagState : null;
      const under = gagState && gagState.target === "window";
      R.gz.classList.toggle("is-gag", !!g);
      R.gz.classList.toggle("is-on", !!g || (isShow() && !under));
      R.gz.dataset.tone = g ? g.tone || "calm" : headline.tone;
      R.gzTag.textContent = g ? g.tag || "" : "";
      R.gzTag.hidden = !(g && g.tag);
      const icon = g ? g.icon : headline.tone === "calm" ? "" : "warn";
      R.gzIconPath.setAttribute("d", ICONS[icon] || "");
      R.gzIcon.style.display = icon ? "" : "none";
      const text = g ? g.text || "" : refText(headline.ref);
      if (R.gzLine.dataset.full === text && R.gz.dataset.shown === (g ? "gag" : "head")) return;
      R.gz.dataset.shown = g ? "gag" : "head";
      fitText(R.gzBox, R.gzInner, R.gzLine, text, 62, 26);
      if (instant === true) { clearTimeout(R.gzLine._typing); typingNodes.delete(R.gzLine); R.gzLine.dataset.full = text; R.gzLine.textContent = text; }
      else typeInto(R.gzLine, text);
    }
    function pushLog(r) {
      if (!R.log) return;
      const now = new Date();
      const line = E("div", "log-line", null, R.log);
      E("span", "dim", `> ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} `, line);
      const body = E("span", null, null, line);
      while (R.log.children.length > 2) {
        const old = R.log.firstChild;
        old.querySelectorAll("span").forEach((s) => { clearTimeout(s._typing); typingNodes.delete(s); });
        old.remove();
      }
      body._ref = r;
      typeInto(body, refText(r));
    }
    function scheduleFrom(t) {
      const M = C().messages;
      msg.nextAdv = t + M.interval;
      msg.nextLog = t + M.logEvery;
    }
    function onSimTime() {
      const t = sim.state.t, M = C().messages;
      if (t >= msg.nextAdv) {
        showAdvisory(pickMessage("auto"));
        msg.nextAdv = Math.max(msg.nextAdv + M.interval, t + 0.5);
        msg.headTick = (msg.headTick || 0) + 1;
        if (msg.headTick % M.jokeEvery === 0) setHeadline(headlineFor(sim.state.level));
      }
      if (t >= msg.nextLog) {
        pushLog(ref("msgLog", msg.log++));
        msg.nextLog = Math.max(msg.nextLog + M.logEvery, t + 0.5);
      }
    }

    /* ---------------- render del estado ---------------- */

    /* Gráfico de 60 s (sirve para la vista técnica y la pequeña de show). */
    function drawGraph(G, hist, st, th) {
      const t0 = st.t - 60, H = G.H, pad = G.pad;
      let lo = Infinity, hi = -Infinity;
      hist.forEach((p) => { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); });
      lo = Math.floor(lo - 2); hi = Math.ceil(hi + 2);
      if (hi - lo < 10) { const m = (hi + lo) / 2; lo = Math.floor(m - 5); hi = Math.ceil(m + 5); }
      const y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2);
      const pts = hist.map((p) => `${(((p[0] - t0) / 60) * 300).toFixed(1)},${y(p[1]).toFixed(1)}`);
      G.line.setAttribute("points", pts.join(" "));
      G.area.setAttribute("d", pts.length ? `M${pts[0].split(",")[0]} ${H} L${pts.join(" L")} L300 ${H} Z` : "");
      const hy = y(st.temp).toFixed(1);
      G.head.setAttribute("cy", hy);
      if (G.halo) G.halo.setAttribute("cy", hy);
      G.range.textContent = `${lo}–${hi}`;
      G.th.textContent = "";
      [["notice", th.notice], ["alarmed", th.alarmed], ["panic", th.panic]].forEach(([k, v]) => {
        if (v > lo && v < hi) S("line", { x1: 0, x2: 300, y1: y(v), y2: y(v), class: "th th-" + k }, G.th);
      });
    }

    let lastRender = 0;
    function render(force) {
      if (destroyed) return;
      const now = performance.now();
      if (!force && now - lastRender < 160) return;
      lastRender = now;
      const st = sim.state, cfg = C(), th = cfg.sim.thresholds;
      const rec = sim.recovery ? sim.recovery() : null;
      const T = memeTexts();
      const levelText = rec ? T.recShort || "RECOVERY" : lvText(st.level);
      // etapa 22: «enfriar sale caro» — contador de votos durante CRITICAL
      const lk = sim.lockState ? sim.lockState() : null;
      let lockA = "", lockB = "";
      if (lk && lk.active) {
        const fill = (tpl, n, t) => String(tpl || "").split("{n}").join(String(n)).split("{t}").join(String(t));
        lockA = fill(T.lockCool || "COOLANT {n}/{t}", lk.cool, lk.cools) + (lk.follows > 0 ? " · " + fill(T.lockFollow || "FOLLOWS {n}/{t}", lk.follow, lk.follows) : "");
        lockB = T.lockPaid || "1 SUB = INSTANT FIX";
      }
      scene.stage.dataset.level = st.level;
      scene.stage.dataset.recovery = rec ? "1" : "";
      scene.stage.dataset.shown = rec ? rec.target : st.level;
      if (R.shRec) {
        const dec = (x) => String(Math.ceil(x)); // segundos enteros: la misma cifra en todas las pantallas
        R.shRec.dataset.mode = rec ? "rec" : st.level === "PANIC" ? "active" : "";
        if (rec) {
          R.shRecA.textContent = T.recLabel || "RECOVERY IN PROGRESS";
          const r = Math.round(rec.rate);
          const when = rec.certain ? (T.recSafeIn || "SAFE IN {s} S").split("{s}").join(dec(rec.eta)) : T.recPending || "SAFE STATE PENDING";
          R.shRecB.textContent = when + (r < 0 ? ` · ${r} °C/S`.replace("-", "−") : "");
          // barra: progreso hacia la banda normal y, dentro de ella, la confirmación
          const th2 = cfg.sim.thresholds, top = Math.max(st.temp, th2.panic), lo = th2.notice - th2.hysteresis;
          const prog = rec.certain ? 0.8 + 0.2 * (1 - rec.eta / Math.max(0.1, th2.recoverDelay * Math.max(1, st.levelIndex))) : 0.8 * (1 - (st.temp - lo) / Math.max(1, top - lo));
          R.shRecFill.style.width = Math.max(0, Math.min(100, prog * 100)) + "%";
        } else if (st.level === "PANIC") {
          R.shRecA.textContent = T.recActive || "CRITICAL ACTIVE";
          R.shRecB.textContent = lockA ? lockA + " · " + lockB : "";
        }
      }
      if (R.incident) paintIncident();

      const d = new Date();
      if (R.clock) R.clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      if (R.temp) {
        R.temp.textContent = st.temp.toFixed(1);
        const delta = st.temp - sim.tempAt(st.t - 5);
        R.delta.textContent = (delta >= 0 ? "+" : "") + delta.toFixed(1);
        R.arrow.classList.toggle("down", delta < 0);
        const max = cfg.content.core.temp.max;
        const on = Math.round((st.temp / max) * R.segs.children.length);
        [...R.segs.children].forEach((s, i) => s.classList.toggle("on", i < on));
        R.limit.style.left = Math.min(100, (th.alarmed / max) * 100) + "%";
        R.limitLabel.textContent = (T.scrLimit || "LIMIT {n}").split("{n}").join(String(Math.round(th.alarmed)));
        if (R.pillText.textContent !== levelText) { R.pillText.textContent = levelText; fitPill(R.pillText); }
        // Gráfico con marcas de tiempo reales del reloj de simulación
        const hist = sim.history(60);
        drawGraph({ line: R.line, area: R.area, head: R.head, halo: R.halo, th: R.thLines, range: R.range, H: 150, pad: 10 }, hist, st, th);
        if (R.shTemp) {
          R.shTemp.textContent = st.temp.toFixed(1);
          R.shDelta.textContent = R.delta.textContent;
          R.shArrow.classList.toggle("down", delta < 0);
          if (R.shPill.textContent !== levelText) { R.shPill.textContent = levelText; fitPill(R.shPill); }
          drawGraph({ line: R.shLine, area: R.shArea, head: R.shHead, th: R.shTh, range: R.shRange, H: 80, pad: 6 }, hist, st, th);
        }
        if (R.stg && R.stg.active) R.stg.update({ st, hist, th, rec, levelText: rec && rec.certain ? `${levelText} · ${Math.ceil(rec.eta)} S` : levelText, lockA, lockB, tempLabel: T.scrTempLabel, unit: cfg.content.core.temp.unit });
        cfg.content.core.readouts.forEach((r, i) => {
          const n = R.readouts[i];
          if (!n) return;
          const v = st[r.key];
          n.num.textContent = Number.isFinite(v) ? v.toFixed(r.decimals) : "--";
          n.fill.style.width = Math.max(0, Math.min(100, (v / r.max) * 100)) + "%";
        });
        if (R.pumps) R.pumps[2].classList.toggle("off", st.level === "NORMAL");
      }
      if (R.statusValue) {
        R.statusValue.textContent = rec ? T.recShort || "RECOVERY" : levelText;
        R.load.textContent = Math.round(st.load);
        const on = Math.round(st.load / 10);
        [...R.loadSegs.children].forEach((s, i) => s.classList.toggle("on", i < on));
      }
    }

    /* ---------------- conexión con el simulador ---------------- */

    function startMessages() {
      msg.count = 0; msg.shown = 0; msg.headTick = 0;
      if (R.log) R.log.textContent = "";
      pushLog(ref("msgLog", msg.log++));
      pushLog(ref("msgLog", msg.log++));
      showAdvisory(pickMessage("auto"));
      setHeadline(headlineFor(sim.state.level));
      scheduleFrom(sim.state.t);
    }

    /* ---------------- incidente de refrigeración (lo dirige ambient.js) ---------------- */
    let incident = null; // { mode: "leak" | "cold", level }
    function paintIncident() {
      if (!R.incident) return;
      const T = memeTexts();
      R.incident.hidden = !incident;
      R.incident.parentNode.classList.toggle("has-inc", !!incident);
      if (!incident) return;
      R.incident.dataset.mode = incident.mode;
      R.incTag.textContent = incident.mode === "cold" ? T.leakCold : T.leakTag;
      R.incWhere.textContent = T.leakWhere;
    }
    function setIncident(o) {
      incident = o ? Object.assign({}, o) : null;
      paintIncident();
    }

    /* ---------------- gags (los dirige gags.js) ---------------- */
    let gagState = null;   // { target, tone, tag, icon, text, label, title, sub, progress }

    function setGag(spec) {
      if (destroyed || !spec) return;
      const prev = gagState;
      if (prev && prev.target !== spec.target) releaseTarget(prev.target);
      gagState = Object.assign({}, spec);
      if (spec.target === "strip") paintStrip();
      else if (spec.target === "advisory" && R.adv) {
        R.advRoot.classList.add("is-gag");
        R.advRoot.dataset.tone = spec.tone || "calm";
        R.advLabel.textContent = spec.label || memeTexts().scrAdvisoryLabel;
        if (R.adv.dataset.full !== (spec.text || "") || !prev || prev.target !== "advisory") {
          fitText(R.advMsg, R.advBox, R.adv, spec.text || "", 60, 22);
          typeInto(R.adv, spec.text || "");
        }
      } else if (spec.target === "stage" && R.stg) {
        R.coreRoot.classList.add("is-stage");
        R.stg.show(spec.scene, spec.step, memeTexts(), spec.data);
        render(true);
      } else if (spec.target === "window" && R.gw) {
        R.gw.hidden = false;
        R.gw.dataset.tone = spec.tone || "calm";
        R.gwTitle.textContent = spec.title || "";
        R.gwIconPath.setAttribute("d", ICONS[spec.icon] || "");
        R.gwIcon.style.display = spec.icon ? "" : "none";
        R.gwSub.textContent = spec.sub || "";
        R.gw.classList.toggle("has-prog", spec.progress != null);
        setGagProgress(spec.progress);
        if (R.gwLine.dataset.full !== (spec.text || "")) {
          fitText(R.gwBox, R.gwInner, R.gwLine, spec.text || "", 40, 18);
          typeInto(R.gwLine, spec.text || "");
        }
        paintStrip(); // la franja se oculta mientras está la ventana
      }
    }
    /* Barra de progreso de la ventana (0–1). Se atasca en el 99 %. */
    function setGagProgress(p) {
      if (!R.gwProg || p == null) return;
      const v = Math.max(0, Math.min(0.99, p));
      const n = R.gwProg.children.length, on = Math.round(v * n);
      [...R.gwProg.children].forEach((c, i) => c.classList.toggle("on", i < on));
      R.gwPct.textContent = `${Math.floor(v * 100 + 1e-6)} %`;
    }
    function releaseTarget(target) {
      if (target === "advisory" && R.adv) {
        R.advRoot.classList.remove("is-gag");
        delete R.advRoot.dataset.tone;
        R.advLabel.textContent = memeTexts().scrAdvisoryLabel;
      }
      if (target === "window" && R.gw) R.gw.hidden = true;
      if (target === "stage" && R.stg) { R.stg.hide(); R.coreRoot.classList.remove("is-stage"); }
    }
    /*
     * Quita el gag y restaura desde el estado ACTUAL: aviso y titular nuevos
     * según el nivel de ahora, no los textos de antes del gag.
     */
    function clearGag() {
      if (!gagState) return;
      const t = gagState.target;
      gagState = null;
      releaseTarget(t);
      if (t === "advisory") showAdvisory(pickMessage("auto"));
      if (t === "strip" || t === "window" || t === "stage") setHeadline(currentHeadline());
      paintStrip();
      render(true);
    }
    /* Titular según el estado actual (la recuperación tiene el suyo). */
    function currentHeadline() {
      if (sim.recovery && sim.recovery()) return { ref: ref("recLabel"), tone: "calm" };
      return headlineFor(sim.state.level);
    }

    const offSim = sim.on((type, data) => {
      if (destroyed) return;
      if (type === "reset") { startMessages(); render(true); return; }
      if (type === "recovery") {
        // enfriamiento confirmado: el nivel espera su retardo, sin fingir peligro
        if (data.on) { showAdvisory(ref("recAdvisory")); setHeadline({ ref: ref("recLabel"), tone: "calm" }); }
        else if (sim.state.level !== "NORMAL") setHeadline(headlineFor(sim.state.level));
        render(true);
        return;
      }
      if (type === "level") {
        const recov = sim.recovery && sim.recovery();
        const tt = sim.state.temp.toFixed(0), to = data.to;
        const cleared = { fn: () => (memeTexts().logCleared || "{t}").split("{t}").join(tt) };
        const lvLine = { fn: () => (memeTexts().logLevel || "{level} {t}").split("{level}").join(lvText(to)).split("{t}").join(tt) };
        if (to === "NORMAL") { showAdvisory(ref("msgRecovered")); pushLog(cleared); }
        else if (recov) pushLog(lvLine); // bajando: se mantiene el aviso de recuperación
        else { showAdvisory(pickMessage("auto")); pushLog(lvLine); }
        setHeadline(to === "NORMAL" ? { ref: ref("msgRecovered"), tone: "calm" } : recov ? currentHeadline() : headlineFor(to));
        scheduleFrom(sim.state.t);
        render(true);
        return;
      }
      onSimTime();
      render(!sim.running);
    });

    // Reloj de pared visible aunque la simulación esté en pausa
    const clockTimer = setInterval(() => {
      if (!R.clock || destroyed) return;
      const d = new Date();
      R.clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }, 1000);

    applyTexts();
    startMessages();

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!destroyed) { R.gz && (R.gz.dataset.shown = ""); paintStrip(); fitSoon(); } });

    return {
      applyTexts,
      applyDisplay,
      render,
      setDecor(on) { decor = !!on; if (!decor) finishTyping(); },
      next(kind) {
        if (kind === "log") { pushLog(ref("msgLog", msg.log++)); return; }
        if (kind === "joke" && isShow()) { setHeadline({ ref: ref("msgJokes", msg.joke++), tone: "calm" }); return; }
        showAdvisory(pickMessage(kind));
        scheduleFrom(sim.state.t);
      },
      setGag, setGagProgress, clearGag, setIncident,
      /* Píxeles reales por píxel lógico de la pantalla central (para adaptar la legibilidad). */
      coreScale() { if (!R.coreRoot) return 1; const r = R.coreRoot.getBoundingClientRect(); return Math.min(r.width / 856, r.height / 480) || 1; },
      gagTarget: () => (gagState ? gagState.target : null),
      headline: () => ({ text: refText(headline.ref), tone: headline.tone }),
      debug: () => ({ typing: typingNodes.size, gagScreen: gagState ? 1 : 0 }),
      destroy() {
        destroyed = true;
        offSim();
        clearInterval(clockTimer);
        clearInterval(memeTimer); clearTimeout(meme.glitch);
        finishTyping();
        built.forEach((n) => n.remove());
        if (soonProbe) soonProbe.remove();
      },
    };
  }

  window.DuckReactorScreens = { mount };
})();

;
/* ---- src/lights.js ---- */
/*
 * Duck Reactor — luces de sala y ambiente (etapa 3).
 * Capa scene.layers.room (por debajo del pato).
 *
 * Cada luz se apoya en un botón/LED que ya existe en el fondo:
 *   boost (píxeles del botón realzados) + core + halo + refl (reflejo).
 * El grupo se mezcla en modo "screen" con la imagen.
 *
 * Las luces con react = "alarm" | "status" cambian con el nivel del
 * simulador; en nivel normal conservan su comportamiento decorativo.
 *
 * window.DuckReactorLights.mount(scene, store, sim) → {
 *   applyItem(i), applyAll(), applyGlobals(), rebuildMatrix(), rebuildAmbient(),
 *   setLevel(level), setDecor(bool), nodes(), destroy()
 * }
 * Temporizadores: uno solo para la matriz (se cancela antes de reprogramar).
 */
(function () {
  "use strict";
  const U = window.DR.util;

  function div(cls, parent) {
    const n = document.createElement("div");
    n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }

  /* Comportamiento efectivo según reacción y nivel. */
  function effective(item, level, palette, rec) {
    const col = (k) => U.hexToRgb(palette[k] || k);
    const e = { mode: item.mode, period: item.period, color: col(item.color), mul: 1 };
    if (level === "NORMAL" || item.react === "none") return e;
    // Recuperación en curso (etapa 13): las alarmas se calman (pulso lento, ámbar)
    // mientras el nivel confirma; vuelven a lo normal al llegar a NOMINAL.
    if (rec) {
      if (item.react === "alarm") Object.assign(e, { mode: "pulse", period: 2.6, mul: 0.95 });
      else if (item.react === "status") Object.assign(e, { color: col("amber"), mode: "pulse", period: 2.6 });
      return e;
    }
    if (item.react === "alarm") {
      if (level === "NOTICE") Object.assign(e, { mode: "pulse", period: 1.8, mul: 1.05 });
      if (level === "ALARMED") Object.assign(e, { mode: "blink", period: 1.0, mul: 1.15 });
      if (level === "PANIC") Object.assign(e, { mode: "blink", period: 0.55, mul: 1.3 });
    } else if (item.react === "status") {
      if (level === "NOTICE") Object.assign(e, { color: col("amber"), mode: "steady" });
      if (level === "ALARMED") Object.assign(e, { color: col("red"), mode: "steady", mul: 1.1 });
      if (level === "PANIC") Object.assign(e, { color: col("red"), mode: "blink", period: 1.2, mul: 1.2 });
    }
    return e;
  }

  function mount(scene, store, sim) {
    const C = () => store.cfg;
    const layer = scene.layers.room;
    layer.textContent = "";
    const root = div("rl", layer);
    const ambientEl = div("rl-ambient", root);
    const itemsEl = div("lt-items", root);
    const matrixEl = div("lt-matrix", root);
    const barEl = div("lt-bar", root);
    let level = sim.state.level;
    let recovering = false;
    let decor = true;
    let destroyed = false;
    let matrixTimer = null;     // único temporizador de la matriz
    let nodes = [];
    let cells = [];

    const setVars = (n, vars) => { for (const k in vars) n.style.setProperty(k, vars[k]); };

    function makeLight(parent) {
      const n = div("lt", parent);
      n._boost = div("lt-boost", n);
      div("lt-refl", n);
      div("lt-halo", n);
      div("lt-core", n);
      return n;
    }

    /* Posición, tamaño y aspecto de una luz (sin recrear nodos). */
    function paint(n, o, eff, groupMul) {
      const cfg = C();
      n.style.left = o.x - o.w / 2 + "px";
      n.style.top = o.y - o.h / 2 + "px";
      n.style.width = o.w + "px";
      n.style.height = o.h + "px";
      n.className = `lt lt--${eff.mode} lt--${o.shape}` + (n._extra || "");
      setVars(n, {
        "--c": eff.color, "--lvl": (o.level * eff.mul * groupMul).toFixed(3),
        "--p": eff.period + "s", "--d": (o.delay || 0) + "s",
        "--halo": o.halo, "--refl": o.refl,
      });
      if (o.boost) {
        n._boost.style.display = "";
        n._boost.style.backgroundImage = `url("${window.DR.asset(cfg.stage.background)}")`;
        n._boost.style.backgroundSize = `${cfg.stage.width}px ${cfg.stage.height}px`;
        n._boost.style.backgroundPosition = `${-(o.x - o.w / 2)}px ${-(o.y - o.h / 2)}px`;
      } else n._boost.style.display = "none";
    }

    function applyItem(i) {
      const cfg = C(), o = cfg.lights.items[i], n = nodes[i];
      if (!o || !n) return;
      const g = cfg.lights.groups[o.group] || { enabled: true, intensity: 1 };
      n.style.display = o.enabled && g.enabled ? "" : "none";
      n.dataset.id = o.id;
      n.dataset.index = i;
      paint(n, o, effective(o, level, cfg.lights.colors, recovering), g.intensity);
    }

    function applyAll() {
      const items = C().lights.items;
      // Ajustar número de nodos si cambió la lista (importación)
      while (nodes.length > items.length) nodes.pop().remove();
      while (nodes.length < items.length) nodes.push(makeLight(itemsEl));
      items.forEach((_, i) => applyItem(i));
    }

    function applyGlobals() {
      const L = C().lights, A = C().ambient;
      setVars(root, {
        "--li": L.intensity, "--halo-k": L.halo, "--refl-k": L.reflection,
        "--ceil-i": A.ceiling.intensity, "--ceil-min": (1 - A.ceiling.breathe).toFixed(3),
        "--spill-i": A.spill.intensity,
      });
    }

    /* ---- Matriz de LEDs ---- */
    function rebuildMatrix() {
      clearTimeout(matrixTimer);
      matrixTimer = null;
      matrixEl.textContent = "";
      barEl.textContent = "";
      cells = [];
      const L = C().lights, M = L.matrix, B = L.bar, pal = L.colors;
      const col = (k) => U.hexToRgb(pal[k] || k);
      matrixEl.style.display = M.enabled ? "" : "none";
      barEl.style.display = B.enabled ? "" : "none";
      const cell = (x, y, size, mode, color, lvl, parent) => {
        const n = makeLight(parent);
        paint(n, { x, y, w: size, h: size, shape: "rect", level: lvl, halo: 2.2, refl: 1, delay: 0 }, { mode, period: 3, color, mul: 1 }, 1);
        return n;
      };
      M.rows.forEach((row) => M.cols.forEach((x, ci) => {
        const [yl, yr] = Array.isArray(row) ? row : [row, row];
        const y = yl + (yr - yl) * (ci / (M.cols.length - 1));
        cells.push(cell(x, y, M.cell, "cell", col(M.color), 0.85, matrixEl));
      }));
      // Estado inicial: celdas que el fondo ya pinta encendidas
      [15, 24, 26, 36, 38, 41, 10].slice(0, M.lit).forEach((i) => cells[i] && cells[i].classList.add("on"));
      B.rows.forEach((y, r) => {
        if (r !== B.scanRow) return;
        B.cols.forEach((x, i) => {
          const n = cell(x, y, B.cell, "scan", col(B.color), 0.85, barEl);
          n.style.setProperty("--d", `${(i / B.cols.length) * B.scanPeriod - B.scanPeriod}s`);
          n.style.setProperty("--p", `${B.scanPeriod}s`);
        });
      });
      [[0, 6], [2, 0], [2, 8]].slice(0, B.sparse).forEach(([r, i]) => cell(B.cols[i], B.rows[r], B.cell, "steady", col(B.color), 0.6, barEl));
      scheduleMatrix();
    }

    function tickMatrix() {
      const L = C().lights, M = L.matrix;
      const boost = M.reactive ? { NORMAL: 0, NOTICE: 0.2, ALARMED: 0.45, PANIC: 0.75 }[level] : 0;
      const chance = Math.min(1, M.accentChance + boost);
      const on = cells.filter((c) => c.classList.contains("on"));
      while (on.length > M.lit) on.splice(Math.floor(Math.random() * on.length), 1)[0].classList.remove("on");
      if (on.length >= M.lit && on.length) on[Math.floor(Math.random() * on.length)].classList.remove("on");
      if (M.lit > 0) {
        const off = cells.filter((c) => !c.classList.contains("on"));
        const pick = off[Math.floor(Math.random() * off.length)];
        if (pick) {
          pick.style.setProperty("--c", U.hexToRgb(L.colors[Math.random() < chance ? M.accent : M.color] || M.color));
          pick.classList.add("on");
        }
      }
    }
    function scheduleMatrix() {
      clearTimeout(matrixTimer);
      matrixTimer = null;
      const M = C().lights.matrix;
      if (destroyed || !decor || !M.enabled) return;
      const fast = M.reactive && level !== "NORMAL" ? 0.6 : 1;
      const wait = (M.minMs + Math.random() * (M.maxMs - M.minMs)) * fast;
      matrixTimer = setTimeout(() => { matrixTimer = null; tickMatrix(); scheduleMatrix(); }, wait);
    }

    /* ---- Ambiente ---- */
    function rebuildAmbient() {
      ambientEl.textContent = "";
      const A = C().ambient;
      A.ceiling.lamps.forEach((c) => {
        const n = div("amb-ceiling" + (c.dip ? " has-dip" : ""), ambientEl);
        Object.assign(n.style, { left: c.x + "px", top: c.y + "px", width: c.w + "px", height: c.h + "px" });
        setVars(n, { "--p": c.period + "s", "--d": c.delay + "s" });
        div("amb-cone", n);
      });
      A.spill.items.forEach((s) => {
        const n = div("amb-spill", ambientEl);
        Object.assign(n.style, { left: s.x - s.rx + "px", top: s.y - s.ry + "px", width: s.rx * 2 + "px", height: s.ry * 2 + "px" });
        n.dataset.id = s.id;
        setVars(n, { "--c": U.hexToRgb(s.color), "--o": s.opacity });
      });
      applyGlobals();
    }

    function setLevel(l, rec) {
      if (l === level && !!rec === recovering) return;
      level = l;
      recovering = !!rec;
      C().lights.items.forEach((_, i) => applyItem(i));
      scheduleMatrix();
    }

    /*
     * Secuencia breve sobre luces reales del color dado (gag del café): añade
     * un destello encima de cada una, de izquierda a derecha, y lo retira. No
     * cambia ni apaga la luz de debajo. Sin animaciones decorativas no hace nada.
     */
    let flashTimer = null, flashEls = [];
    function stopFlash() {
      clearTimeout(flashTimer);
      flashTimer = null;
      flashEls.forEach((n) => n.remove());
      flashEls = [];
    }
    function flash(color) {
      stopFlash();
      if (!decor || destroyed) return 0;
      const items = C().lights.items;
      const list = nodes
        .map((n, i) => ({ n, o: items[i] }))
        .filter(({ n, o }) => o && o.enabled && o.color === (color || "amber") && n.style.display !== "none")
        .sort((a, b) => a.o.x - b.o.x);
      list.forEach(({ n }, i) => {
        const f = div("lt-flash", n);
        f.style.setProperty("--fi", i);
        flashEls.push(f);
      });
      const ms = list.length * 120 + 700;
      flashTimer = setTimeout(stopFlash, ms);
      return list.length;
    }

    /*
     * Relés (etapa 13): secuencias cortas sobre luces reales, disparadas por
     * eventos (ambient.js). Una a la vez; se limpian solas. Sin animaciones
     * decorativas no hacen nada (quedan las luces de nivel, que ya informan).
     *   hint      un parpadeo ámbar junto a la junta (señal previa)
     *   heat      ámbar por el panel izquierdo y termina en la lámpara de aviso
     *   critical  ola roja desde la consola y remata en la lámpara de alarma
     *             (de donde sale la luz de emergencia)
     *   coolant   verde azulado en las luces más cercanas a la junta, hacia ella
     *   settle    verde suave por las luces de estado (estado seguro confirmado)
     */
    let seqTimer = null, seqEls = [];
    function stopSequence() {
      clearTimeout(seqTimer);
      seqTimer = null;
      seqEls.forEach((n) => n.remove());
      seqEls = [];
    }
    const cue = (n, d) => { const S = window.DR && window.DR.sound; if (S && S.cue) S.cue(n, d); }; // audio (etapa 16)
    const SEQ_COL = { amber: "255, 178, 76", red: "255, 70, 46", cyan: "120, 226, 255", green: "150, 236, 120" };
    function sequence(kind, o) {
      o = o || {};
      if (!decor || destroyed) return 0;
      stopSequence();
      const items = C().lights.items;
      const list = nodes.map((n, i) => ({ n, o: items[i] })).filter(({ n, o: it }) => it && it.enabled && n.style.display !== "none");
      const by = (id) => list.find((x) => x.o.id === id);
      const dist = (x, px, py) => Math.hypot(x.o.x - px, x.o.y - py);
      const step = Math.max(40, o.step || 110), org = o.origin || { x: 338, y: 133 };
      let seq = [], color = "amber", end = null, k = step, blinks = 3;
      if (kind === "hint") { seq = list.slice().sort((a, b) => dist(a, org.x, org.y) - dist(b, org.x, org.y)).slice(0, 1); blinks = 0; }
      else if (kind === "heat") { seq = list.filter((x) => x.o.group === "A" && !/lamp/.test(x.o.id)).sort((a, b) => a.o.x - b.o.x || a.o.y - b.o.y); end = by("a-lamp-1"); }
      else if (kind === "critical") { color = "red"; k = step * 0.45; seq = list.slice().sort((a, b) => dist(a, 688, 330) - dist(b, 688, 330)); end = by("a-lamp-2"); blinks = 2; }
      else if (kind === "coolant") { color = "cyan"; seq = list.slice().sort((a, b) => dist(a, org.x, org.y) - dist(b, org.x, org.y)).slice(0, 7).reverse(); blinks = 0; }
      else if (kind === "settle") { color = "green"; k = step * 1.6; seq = list.filter((x) => x.o.react === "status").sort((a, b) => a.o.x - b.o.x); blinks = 0; }
      if (!seq.length) return 0;
      cue("relay", { kind, n: seq.length, step: k });
      const add = (x, i, cls) => {
        const f = div("lt-seq" + (cls ? " " + cls : ""), x.n);
        f.style.setProperty("--d", Math.round(i) + "ms");
        f.style.setProperty("--sc", SEQ_COL[color]);
        f.style.setProperty("--si", String(Math.max(0.3, Math.min(1.6, o.intensity || 1))));
        if (kind === "settle") f.classList.add("is-soft");
        seqEls.push(f);
      };
      seq.forEach((x, i) => add(x, i * k));
      if (end && blinks) add(end, seq.length * k + 80, "is-end b" + blinks);
      seqTimer = setTimeout(stopSequence, seq.length * k + 900 + blinks * 380);
      return seq.length;
    }

    const offSim = sim.on((type, data) => {
      if (type === "level" || type === "reset" || type === "recovery") setLevel(sim.state.level, !!(sim.recovery && sim.recovery()));
    });

    rebuildAmbient();
    applyAll();
    rebuildMatrix();

    return {
      applyItem, applyAll, applyGlobals, rebuildMatrix, rebuildAmbient, setLevel,
      flash, stopFlash, sequence, stopSequence,
      setDecor(on) { decor = !!on; if (!decor) { stopFlash(); stopSequence(); } scheduleMatrix(); },
      nodes: () => nodes,
      root,
      debug: () => ({ matrixTimer: matrixTimer ? 1 : 0, lights: nodes.length, cells: cells.length, flashTimer: flashTimer ? 1 : 0, seqTimer: seqTimer ? 1 : 0, seqEls: seqEls.length }),
      destroy() {
        destroyed = true;
        stopFlash();
        stopSequence();
        clearTimeout(matrixTimer);
        matrixTimer = null;
        offSim();
        root.remove();
      },
    };
  }

  window.DuckReactorLights = { mount, effective };
})();

;
/* ---- src/duck.js ---- */
/*
 * Duck Reactor — comportamiento del pato (etapa 3).
 *
 * auto:   la pose sigue al nivel del simulador (NORMAL→IDLE, NOTICE,
 *         ALARMED, PANIC) tras `reactionDelay` s de simulación. COFFEE es
 *         independiente: aparece cada cierto tiempo sólo en nivel normal y
 *         cualquier alarma lo interrumpe.
 * manual: la pose elegida queda bloqueada hasta volver a auto.
 * Pruebas: preview(pose) y sequence() muestran poses durante unos segundos
 *          sin tocar la simulación ni el modo.
 * Aleteo:  en PANIC alterna el sprite original (HIGH) con PANIC_MID:
 *          HIGH → MID → HIGH por ciclo, `frameMs` ms por fotograma.
 *          Continuo (flap.continuous, por defecto): en bucle mientras el pato
 *          esté en PANIC por CRITICAL; se para al salir. Breve: `cycles` ciclos
 *          al entrar en PANIC.
 *          Dos relojes:
 *            - automático: reloj de simulación (se congela en pausa y sigue
 *              la velocidad). Se dispara una vez al entrar en PANIC y se
 *              rearma al salir.
 *            - prueba (flapTest): tiempo real; funciona con la simulación en
 *              pausa sin arrancarla ni tocar sus lecturas.
 *          Un único bucle requestAnimationFrame, cancelado al salir de PANIC,
 *          cambiar de preset, reiniciar o empezar otra prueba.
 *          Sin animaciones decorativas (o con movimiento reducido) no se
 *          reproduce: la prueba queda bloqueada y PANIC se ve con alas altas.
 * Inspección: inspectFrame("PANIC" | "PANIC_MID") muestra un fotograma fijo
 *          (también con movimiento reducido) hasta inspectFrame(null).
 * Sólo poses sentadas; no hay poses de pie, GETTING_UP ni salto de silla.
 *
 * window.DuckReactorDuck.mount(scene, store, sim) → { pose, reason, preview, sequence, coffeeNow,
 *   flapTest, flapStop, flapInfo, canAnimate, inspectFrame, setDecor, update, destroy }
 */
(function () {
  "use strict";
  const L = (window.DR && window.DR.i18n) ? window.DR.i18n.L : (s, ...v) => s.reduce((a, x, i) => a + (i ? String(v[i - 1]) : "") + x, ""); // textos del laboratorio (etapa 15)
  const POSE_FOR = { NORMAL: "IDLE", NOTICE: "NOTICE", ALARMED: "ALARMED", PANIC: "PANIC" };
  /* Gravedad de cada pose: un gag nunca puede mostrar una pose menos grave. */
  const SEV = { IDLE: 0, COFFEE: 0, NOTICE: 1, ALARMED: 2, PANIC: 3 };

  function mount(scene, store, sim) {
    const C = () => store.cfg;
    let pose = null, reason = "";
    let wanted = null, wantedSince = 0;
    let coffeeUntil = -1, nextCoffee = 0;
    let previewTimers = [];
    let previewPose = null;
    const listeners = new Set();

    const rnd = (a, b) => a + Math.random() * Math.max(0, b - a);
    function planCoffee(from) {
      const c = C().behavior.coffee;
      nextCoffee = from + rnd(c.everyMin, c.everyMax);
    }

    /*
     * Pose temporal de un gag (gags.js). No es otro motor de poses: entra en
     * la misma cadena de prioridad que las pruebas y se comprueba en cada
     * cambio. Prioridad: prueba/inspección > gag (si está permitido) > pose
     * base (reacción al nivel, café o bloqueo manual).
     */
    let gag = null;        // { pose, own, overManual }
    let skipDelay = false;
    /* opts.own: pose de un evento del stream (no depende de Memes → poses);
       opts.overManual: puede cambiar una pose bloqueada a mano. */
    function gagBlock(gp, opts) {
      const m = C().memes, b = C().behavior, o = opts || {};
      if (!o.own && !m.poses) return "los gags no cambian la pose (desactivado en Memes)";
      const over = o.own ? !!o.overManual : m.posesOverManual;
      if (b.mode === "manual" && !over) return "tienes la pose bloqueada a mano: se respeta tu elección";
      // Suelo: el nivel real (y la pose bloqueada si la hay). No se usa la pose
      // en curso, que puede ir con retardo de reacción respecto al nivel.
      const floor = Math.max(SEV[POSE_FOR[sim.state.level]] || 0, b.mode === "manual" ? SEV[b.manualPose] || 0 : 0);
      if ((SEV[gp] || 0) < floor) return L`un gag no rebaja la pose actual (${sim.state.level === "PANIC" ? "CRITICAL" : pose})`;
      return null;
    }
    const gagVisible = () => (gag && !gagBlock(gag.pose, gag) ? gag.pose : null);

    let lastVisible = null;
    function show(p, why) {
      const visible = previewPose || gagVisible() || p;
      pose = p;
      if (visible === lastVisible && why === reason) { reconcileFlap(); return; }
      const prevVisible = lastVisible;
      reason = why;
      lastVisible = visible;
      if (visible !== "PANIC" && flap) cancelFlap("salió de PANIC");
      scene.setState(visible);
      // Modo breve: una sola vez al entrar en PANIC por reacción al nivel
      if (!C().behavior.flap.continuous && visible === "PANIC" && prevVisible !== "PANIC" && !previewPose && !gagVisible() && C().behavior.mode === "auto" &&
          sim.state.level === "PANIC" && armed && C().behavior.flap.enabled) {
        armed = false;
        if (decor) startFlap("auto"); // sin animaciones: alas altas, sin reproducción simulada
      }
      reconcileFlap();
      listeners.forEach((fn) => fn(visible, reason));
    }

    /*
     * Aleteo continuo — ÚNICO punto de activación (reconcileFlap).
     * Mientras la pose EFECTIVA (la visible) sea PANIC, con el aleteo y las
     * animaciones activados, hay un bucle HIGH → MID → HIGH. Se llama tras cada
     * cambio de pose, fin de gag o de prueba, preset, cambio de configuración,
     * cambio de nivel y reactivación de animaciones:
     *   - si corresponde y no hay bucle → lo inicia;
     *   - si ya existe el bucle correcto → lo conserva (sin tocar índice ni tiempo);
     *   - si sólo cambia el reloj (p. ej. automático → bloqueado a mano) → cambia el
     *     reloj del mismo bucle, sin reiniciarlo;
     *   - si deja de corresponder → lo cancela.
     * Relojes: reacción automática al nivel → reloj de simulación (pausa y
     * velocidad); PANIC bloqueado a mano, pruebas y eventos → tiempo real.
     * La inspección de fotogramas («Alas altas/intermedias») queda estática.
     */
    function loopClock() {
      const b = C().behavior;
      if (!b.flap.enabled || !b.flap.continuous || !decor || inspecting || lastVisible !== "PANIC") return null;
      if (previewPose === "PANIC") return "real";
      if (gagVisible() === "PANIC") return gag.clock || "sim";
      return b.mode === "manual" ? "real" : "sim";
    }
    function loopBlockReason() {
      const b = C().behavior;
      if (lastVisible !== "PANIC") return null;
      if (!b.flap.enabled) return "aleteo desactivado";
      if (!b.flap.continuous) return "modo breve";
      if (inspecting) return "inspección de fotograma";
      if (!decor) return app_reduced() ? "el sistema pide movimiento reducido" : "animaciones decorativas desactivadas";
      return null;
    }
    function app_reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    function reconcileFlap() {
      const clock = loopClock();
      if (flap && !flap.loop) return;   // prueba o aleteo breve en curso: al terminar se vuelve a llamar
      if (!clock) { if (flap) cancelFlap("fin del aleteo continuo"); return; }
      if (flap) {
        if (flap.clock !== clock) { flap.clock = clock; flap.source = clock === "sim" ? "auto" : "real"; flap.last = performance.now(); flapEmit(); }
        return;
      }
      startFlap(clock === "sim" ? "auto" : "real", clock, true);
    }

    /* ------------------------------------------------------- aleteo */
    let flap = null;      // { frames, idx, acc, last, raf, source, clock }
    let inspecting = null; // fotograma fijo en inspección ("PANIC" | "PANIC_MID")
    let armed = true;     // se rearma al salir de PANIC
    let decor = true;
    const flapListeners = new Set();
    const flapEmit = () => flapListeners.forEach((fn) => fn(flapInfo()));

    function flapInfo() {
      return flap
        ? { active: true, source: flap.source, frame: flap.idx + 1, total: flap.frames.length, sprite: flap.frames[flap.idx], loop: flap.loop, cycle: flap.cycle,
            clock: flap.clock, paused: flap.clock === "sim" && !sim.running, canAnimate: decor, inspecting, blocked: null }
        : { active: false, armed, sprite: scene.getSprite(), canAnimate: decor, inspecting, blocked: loopBlockReason(), continuous: !!C().behavior.flap.continuous };
    }
    /* source: "auto" | "test" | "gag" · clock: "sim" | "real" */
    function startFlap(source, clock, loop) {
      cancelFlap(null, true);
      const f = C().behavior.flap;
      const frames = [];
      // bucle: un ciclo HIGH → MID → HIGH que se repite; breve: `cycles` ciclos
      for (let c = 0; c < (loop ? 1 : f.cycles); c++) frames.push("PANIC", "PANIC_MID", "PANIC");
      flap = { frames, idx: 0, acc: 0, last: performance.now(), source, clock: clock || (source === "test" ? "real" : "sim"), raf: 0, loop: !!loop, cycle: 1 };
      scene.showSprite("PANIC");
      flap.raf = requestAnimationFrame(stepFlap);
      flapEmit();
    }
    function stepFlap(now) {
      if (!flap) return;
      const dt = Math.min(250, Math.max(0, now - flap.last));
      flap.last = now;
      if (flap.clock === "real") flap.acc += dt;                  // prueba: tiempo real
      else if (sim.running) flap.acc += dt * C().sim.speed;      // automático: reloj de simulación
      const ms = C().behavior.flap.frameMs;
      let changed = false;
      while (flap.acc >= ms) {
        flap.acc -= ms;
        flap.idx++;
        changed = true;
        if (flap.idx >= flap.frames.length) {
          if (flap.loop) { flap.idx = 0; flap.cycle++; }
          else { endFlap(); return; }
        }
      }
      if (changed || flap.idx === 0) scene.showSprite(flap.frames[flap.idx]);
      if (changed) flapEmit();
      flap.raf = requestAnimationFrame(stepFlap);
    }
    function endFlap() {
      const wasTest = flap && flap.source === "test";
      if (flap) cancelAnimationFrame(flap.raf);
      flap = null;
      scene.showSprite(lastVisible || "PANIC"); // sostiene HIGH (o la pose visible)
      if (wasTest && previewPose) { previewPose = null; show(pose, "fin de la prueba de aleteo"); update(); }
      reconcileFlap(); // si sigue en PANIC con modo continuo, el bucle continúa
      flapEmit();
    }
    /* Cancela al instante. keepPreview: no restaurar (lo hará quien llama). */
    function cancelFlap(why, keepPreview) {
      if (!flap) return;
      const wasTest = flap.source === "test";
      cancelAnimationFrame(flap.raf);
      flap = null;
      if (wasTest && previewPose && !keepPreview) { previewPose = null; show(pose, why || "aleteo detenido"); }
      scene.showSprite(lastVisible || "PANIC");
      flapEmit();
    }
    /*
     * Prueba (tiempo real): si no está en PANIC, entra temporalmente y luego
     * restaura. Bloqueada sin animaciones: devuelve false y no hace nada.
     */
    function flapTest() {
      if (!decor) { flapEmit(); return false; }
      endInspect();
      clearPreview();
      cancelFlap(null, true);
      if (lastVisible !== "PANIC") { previewPose = "PANIC"; show(pose || "IDLE", "prueba de aleteo"); }
      startFlap("test");
      return true;
    }

    /* Inspección estática de fotogramas (funciona con movimiento reducido). */
    function inspectFrame(frame) {
      if (!frame) { endInspect(true); return; }
      cancelFlap(null, true);
      clearPreview();
      inspecting = frame;
      previewPose = "PANIC";
      show(pose || "IDLE", frame === "PANIC_MID" ? "inspección: alas intermedias" : "inspección: alas altas");
      scene.showSprite(frame);
      flapEmit();
    }
    function endInspect(restore) {
      if (!inspecting) return;
      inspecting = null;
      if (previewPose === "PANIC") previewPose = null;
      if (restore !== false) { show(pose, "fin de la inspección"); update(); scene.showSprite(lastVisible); }
      flapEmit();
    }

    /*
     * Pose temporal de un gag. Devuelve { applied, reason }. Con pose null
     * se quita y la pose se recalcula desde el estado actual (no desde una
     * captura antigua). opts.flap: aletear si la pose es PANIC; opts.clock:
     * "real" (pruebas) o "sim" (disparos automáticos).
     */
    function setGagPose(gp, opts) {
      opts = opts || {};
      if (!gp) {
        const had = !!gag;
        gag = null;
        if (flap && flap.source === "gag") cancelFlap("fin del gag");
        // Sin pasar por la pose antigua: si el nivel ya cambió, la reacción entra
        // al momento (continuidad: COFFEE → PANIC, no COFFEE → IDLE → PANIC).
        if (had) { skipDelay = true; update(); skipDelay = false; show(pose, reason === "gag" ? "fin del gag" : reason); }
        return { applied: false, reason: null };
      }
      const why = gagBlock(gp, opts);
      if (why) { if (gag) setGagPose(null); return { applied: false, reason: why }; }
      gag = { pose: gp, own: !!opts.own, overManual: !!opts.overManual, clock: opts.clock === "real" ? "real" : "sim" };
      show(pose || "IDLE", "gag");
      // modo continuo: el bucle lo gestiona reconcileFlap (llamado desde show);
      // modo breve: aleteo corto del gag
      if (gp === "PANIC" && opts.flap && !C().behavior.flap.continuous) {
        if (decor && !previewPose && !inspecting) startFlap("gag", gag.clock);
      }
      return { applied: true, reason: null };
    }

    function update() {
      const b = C().behavior, st = sim.state;
      if (b.mode === "manual") { show(b.manualPose, "bloqueado a mano"); return; }
      // Café: sólo en nivel normal; una alarma lo interrumpe
      // Regla acordada: el pato sigue el nivel efectivo (también durante la
      // «recuperación en curso»): aletea mientras el nivel sea PANIC.
      let target = POSE_FOR[st.level];
      if (st.level !== "NORMAL") coffeeUntil = -1;
      else {
        if (b.coffee.auto && coffeeUntil < 0 && st.t >= nextCoffee) { coffeeUntil = st.t + b.coffee.duration; }
        // el café termina aunque el automático esté apagado (café pedido a mano, tras una crisis o en la demo)
        if (coffeeUntil >= 0 && st.t >= coffeeUntil) { coffeeUntil = -1; planCoffee(st.t); }
      }
      if (coffeeUntil >= 0 && st.level === "NORMAL") target = "COFFEE";
      if (target !== wanted) { wanted = target; wantedSince = st.t; }
      const delay = skipDelay || target === "COFFEE" || pose === "COFFEE" ? 0 : b.reactionDelay;
      if (pose !== target && st.t - wantedSince >= delay - 1e-9) {
        show(target, target === "COFFEE" ? "pausa para el café" : L`reacción al nivel ${st.level}`);
      } else if (pose == null) show(target, target === "COFFEE" ? "pausa para el café" : L`reacción al nivel ${st.level}`);
    }

    function clearPreview() {
      previewTimers.forEach(clearTimeout);
      previewTimers = [];
      previewPose = null;
    }
    function preview(p, ms) {
      cancelFlap(null, true);
      endInspect(false);
      clearPreview();
      previewPose = p;
      show(pose || "IDLE", "prueba");
      previewTimers.push(setTimeout(() => { previewPose = null; show(pose, "fin de la prueba"); update(); }, ms || 2500));
    }
    function sequence(stepMs) {
      cancelFlap(null, true);
      endInspect(false);
      clearPreview();
      const seq = C().sequence.concat(["IDLE"]);
      const ms = stepMs || 1400;
      seq.forEach((p, i) => previewTimers.push(setTimeout(() => {
        previewPose = i === seq.length - 1 ? null : p;
        show(pose || "IDLE", i === seq.length - 1 ? "fin de la secuencia" : "secuencia de prueba");
        if (i === seq.length - 1) update();
      }, i * ms)));
    }
    function coffeeNow() {
      const st = sim.state;
      if (st.level !== "NORMAL") return false;
      coffeeUntil = st.t + C().behavior.coffee.duration;
      update();
      return true;
    }

    const offSim = sim.on((type, data) => {
      if (type === "reset") {
        cancelFlap("reinicio");
        armed = true;
        wanted = null; coffeeUntil = -1; planCoffee(sim.state.t);
      }
      if (type === "level") {
        // el aleteo breve automático termina al salir de CRITICAL; el bucle lo decide reconcileFlap según la pose visible
        if (data.from === "PANIC") { armed = true; if (flap && flap.source === "auto" && !flap.loop) cancelFlap("salió de PANIC"); }
        if (data.to === "PANIC" && C().behavior.mode === "manual") armed = false; // en manual no se dispara
      }
      // Nivel recalculado al instante (enfriamiento con la simulación en pausa):
      // la reacción entra sin esperar el retardo, que se mide en tiempo de simulación.
      // Reiniciar también es un salto: la pose se ajusta al momento al nuevo estado.
      if ((type === "level" && data.instant) || type === "reset") { skipDelay = true; update(); skipDelay = false; }
      else update();
      reconcileFlap();
    });
    const offStore = store.on((paths) => {
      const full = paths.includes("*");
      if (full) { cancelFlap("cambio de preset"); endInspect(false); }
      if (paths.some((p) => p === "behavior.flap.enabled") && !C().behavior.flap.enabled) cancelFlap("aleteo desactivado");
      if (paths.some((p) => p === "behavior.flap.continuous") && flap && flap.loop && !C().behavior.flap.continuous) cancelFlap("aleteo continuo desactivado");
      const userChange = paths.some((p) => p === "behavior.mode" || p === "behavior.manualPose");
      // Si el usuario cambia de estado durante una prueba, gana su elección (no se restaura)
      if (userChange && flap && flap.source === "test") { cancelAnimationFrame(flap.raf); flap = null; previewPose = null; flapEmit(); }
      if (userChange && inspecting) endInspect(false);
      if (gag && paths.some((p) => p === "*" || p.startsWith("memes") || p.startsWith("behavior"))) show(pose, reason);
      if (full || paths.some((p) => p.startsWith("behavior"))) {
        if (paths.some((p) => p.startsWith("behavior.coffee"))) planCoffee(sim.state.t);
        wanted = null;
        update();
        if (!flap && !inspecting && lastVisible) scene.showSprite(lastVisible);
      }
      reconcileFlap();
    });

    planCoffee(sim.state.t);
    update();

    return {
      get pose() { return previewPose || pose; },
      get reason() { return inspecting ? "inspección de fotograma" : previewPose ? "prueba" : gagVisible() ? "gag" : reason; },
      get gagPose() { return gag ? gag.pose : null; },
      gagVisible,
      gagBlock,
      setGagPose,
      get coffeeIn() { return coffeeUntil >= 0 ? 0 : Math.max(0, nextCoffee - sim.state.t); },
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      preview, sequence, coffeeNow, update,
      // «Detener» corta una prueba; el bucle de PANIC no se puede parar a mano:
      // sigue mientras la pose siga en PANIC (sólo un cambio de estado lo termina).
      flapStop() { cancelFlap("aleteo detenido"); reconcileFlap(); },
      flapInfo,
      reconcileFlap,
      onFlap(fn) { flapListeners.add(fn); return () => flapListeners.delete(fn); },
      /* Con movimiento reducido o animaciones desactivadas: HIGH estático. */
      flapTest,
      inspectFrame,
      canAnimate: () => decor,
      setDecor(on) {
        decor = !!on;
        if (!decor && flap) cancelFlap("animaciones desactivadas"); // deja alas altas
        reconcileFlap();
        flapEmit();
      },
      destroy() { cancelFlap(); inspecting = null; gag = null; clearPreview(); offSim(); offStore(); listeners.clear(); flapListeners.clear(); },
    };
  }

  window.DuckReactorDuck = { mount };
})();

;
/* ---- src/gags.js ---- */
/*
 * Duck Reactor — gags (etapa 5).
 *
 * Pequeñas escenas con preparación → pausa → remate, usando las pantallas
 * y las poses que ya existen. Reglas:
 *   - Un solo gag activo a la vez.
 *   - Las alarmas reales mandan: al entrar en CRITICAL se cancela el gag del
 *     café, del botón o de la actualización y sale la reacción crítica
 *     (THIS IS FINE). Un gag nunca rebaja la pose (lo comprueba duck.js).
 *   - Las poses temporales pasan por el controlador del pato
 *     (duck.setGagPose): no hay un segundo motor de poses. Con la pose
 *     bloqueada a mano no se toca salvo que se active memes.posesOverManual.
 *   - Al terminar o cancelar se restaura desde el estado ACTUAL (aviso y
 *     titular nuevos, pose recalculada), no desde una captura anterior.
 *
 * Relojes:
 *   auto   (eventos y turnos del simulador) → reloj de simulación: en pausa
 *          el gag se queda congelado en su frase y sigue al continuar; la
 *          velocidad lo acelera; reiniciar lo cancela.
 *   test   (botón «Probar» del laboratorio)  → tiempo real: funciona con la
 *          simulación en pausa, sin arrancarla ni cambiar sus lecturas.
 *   button (pulsar el botón rojo de la escena) → tiempo real, como una prueba.
 *
 * Gags: thisIsFine · coffee · update · button · recovery (ver config.memes).
 * Gags visuales (etapa 6): fuel · denial · supervisor. Toman la pantalla
 * central (screens → stage.js) por etapas, con la franja de temperatura y
 * estado reales siempre visible. fuel y supervisor sólo en nivel normal;
 * denial al entrar en CRITICAL (alterna con thisIsFine si ambos están activos).
 * Un único bucle requestAnimationFrame, sólo mientras hay un gag activo.
 *
 * window.DuckReactorGags.mount(scene, store, sim, duck, getScreens) → {
 *   test(id), stop(), press(), info(), onChange(fn), setDecor(bool),
 *   cancel(reason), refreshTexts(), debug(), destroy()
 * }
 */
(function () {
  "use strict";
  const L = (window.DR && window.DR.i18n) ? window.DR.i18n.L : (s, ...v) => s.reduce((a, x, i) => a + (i ? String(v[i - 1]) : "") + x, ""); // textos del laboratorio (etapa 15)
  const IDS = ["fuel", "denial", "supervisor", "thisIsFine", "coffee", "update", "button", "recovery", "crisis"];
  const VISUAL = ["fuel", "denial", "supervisor"];
  const PRIO = { coffee: 1, button: 1, fuel: 1, supervisor: 1, update: 2, recovery: 2, thisIsFine: 3, denial: 3, crisis: 3, preview: 3, chatHeat: 4, chatCool: 4, becario: 4, rescue: 5 };
  /* Carteles de «Chat al mando» (etapa 9): eventos del público y el becario. */
  const CHAT = ["chatHeat", "chatCool", "becario"];
  const NAME = {
    fuel: "El café es el combustible",
    denial: "Negación corporativa",
    supervisor: "Viene el supervisor",
    thisIsFine: "THIS IS FINE",
    coffee: "Café como refrigerante",
    update: "Actualización inoportuna",
    button: "Botón sospechoso",
    recovery: "Recuperación",
    rescue: "Nuevo suscriptor (rescate con café)",
    chatHeat: "No tocar",
    chatCool: "Mandar refrigerante",
    becario: "Intervención del becario",
    crisis: "Ventanas de crisis",
    preview: "Prueba del catálogo de memes",
  };
  const NORMAL_ONLY = ["coffee", "fuel", "supervisor"];
  const PERIODIC = ["coffee", "fuel", "supervisor", "update"];
  const CRITICAL_EVENT = ["thisIsFine", "denial"];
  const LEVEL_TXT = { NORMAL: "NOMINAL", NOTICE: "CAUTION", ALARMED: "ALARM", PANIC: "CRITICAL" };
  const cue = (n, d) => { const S = window.DR && window.DR.sound; if (S && S.cue) S.cue(n, d); }; // audio (etapa 16)

  function mount(scene, store, sim, duck, getScreens, getLights, catalog) {
    const C = () => store.cfg;
    const T = () => { const m = C().memes; return m.texts[m.lang] || m.texts.en; };
    const scr = () => getScreens();
    const listeners = new Set();
    let active = null;        // gag en curso
    let lastGag = null, lastEndT = -Infinity, skipOnce = false;
    let nextSlot = 0;         // próximo turno automático (s de simulación)
    let blocked = null;       // { id, reason, at } último bloqueo (para el laboratorio)
    let lastEnd = null;       // { id, how, reason }
    let decor = true;
    let destroyed = false;
    let demoMode = false;      // demostración en vivo: sin gags periódicos al azar
    let crisis = false;        // hubo CRITICAL desde el último nivel normal
    let pendingRescue = null;  // rescate cuyo café espera a que el reactor esté seguro
    let lastSafe = null;
    let crisisT0 = 0;          // inicio (s de simulación) del CRITICAL actual
    let crisisSeqs = 0;        // secuencias de ventanas mostradas en este CRITICAL
    let lastAnyEnd = -Infinity; // fin del último gag (s de simulación)
    let lastTrick = false;     // la secuencia anterior tuvo «cerrar.exe»

    const rnd = (a, b) => a + Math.random() * Math.max(0, b - a);
    function planNext(from) {
      const iv = C().memes.interval;
      nextSlot = from + rnd(iv.min, iv.max);
    }
    const emit = () => listeners.forEach((fn) => { try { fn(info()); } catch (e) { console.error("[duck-reactor] gags listener", e); } });

    /* ------------------------------------------------ botón de la escena */
    const hot = document.createElement("button");
    hot.type = "button";
    hot.className = "dr-hot";
    hot.setAttribute("aria-label", "Botón rojo (no pulsar)");
    hot.title = "DO NOT PRESS";
    const pressEl = document.createElement("span");
    pressEl.className = "hot-press";
    const glowEl = document.createElement("span");
    glowEl.className = "hot-glow";
    hot.append(glowEl, pressEl);
    scene.layers.fx.appendChild(hot);
    function placeHot() {
      const b = C().memes.button;
      Object.assign(hot.style, { left: b.x - b.w / 2 + "px", top: b.y - b.h / 2 + "px", width: b.w + "px", height: b.h + "px" });
    }
    let pressTimer = null;
    const pressDown = () => { clearTimeout(pressTimer); hot.classList.add("is-pressed"); cue("button"); };
    const pressUp = () => { clearTimeout(pressTimer); pressTimer = setTimeout(() => hot.classList.remove("is-pressed"), 90); };
    hot.addEventListener("pointerdown", pressDown);
    hot.addEventListener("pointerup", pressUp);
    hot.addEventListener("pointerleave", pressUp);
    hot.addEventListener("click", (e) => {
      if (e.detail === 0) { pressDown(); pressUp(); } // teclado
      press();
    });
    const hotLit = (on) => hot.classList.toggle("is-lit", !!on);

    /* ------------------------------------------------ definición de gags */
    /*
     * Cada gag devuelve { beats: [{ at, apply }], end, progress? }.
     * at y end en segundos del reloj del gag.
     */
    function build(id, a) {
      const tm = C().memes.timing, g = C().memes.gags;
      const setup = tm.setup, pause = tm.pause, punch = tm.punch;
      const tx = () => T();
      const strip = (o) => scr().setGag(Object.assign({ target: "strip" }, o));
      const pose = (p, opts) => {
        const r = duck.setGagPose(p, Object.assign({ clock: a.clock }, opts));
        a.poseNote = r.applied ? L`pose temporal ${p}` : L`pose sin cambiar: ${r.reason}`;
      };
      const stage = (scn, step) => scr().setGag({ target: "stage", scene: scn, step });
      const steps = (g[id] && g[id].steps) || {};
      // instantes acumulados de cada etapa
      const at = (keys) => { let t = 0; return keys.map((k) => { const v = t; t += steps[k]; return v; }).concat([t]); };
      switch (id) {
        /* ---- Nuevo suscriptor: rescate con café (eventos del stream) ---- */
        case "rescue": {
          a.phase = a.startPhase || 1; a.p0 = 0; a.key = null; a.helpers = a.helpers || 0;
          const toCoffee = (e) => {
            const S = C().stream.subscriber;
            a.phase = 3; a.p0 = e; crisis = false;
            const r = duck.setGagPose("COFFEE", { own: true, overManual: S.coffeeOverManual, clock: "real" });
            a.poseNote = r.applied ? "pose temporal COFFEE" : L`café sin cambiar la pose: ${r.reason}`;
          };
          if (a.phase === 3) toCoffee(0);
          return {
            beats: [], end: Infinity,
            tick(e) {
              const S = C().stream.subscriber, lvl = sim.state.level;
              if (a.phase === 1 && e - a.p0 >= S.phrase) { a.phase = 2; a.p0 = e; }
              if (a.phase === 2) {
                // la segunda frase (recuperación) también tiene su tiempo de lectura antes del café
                if (lvl === "NORMAL" && (!a.phr || !a.swapped || e - a.phr.at >= 2.4)) toCoffee(e);
                else if (e - a.p0 >= S.waitMax) {
                  // sigue en crisis: el café queda aplazado hasta que el reactor esté seguro
                  pendingRescue = { names: a.names.slice(), count: a.count, drop: a.drop, helpers: a.helpers, phr: a.phr && a.phr.ctx !== "critical" ? Object.assign({}, a.phr) : null };
                  a.endNote = "sigue en crisis: café aplazado hasta nivel seguro";
                  finish(); return;
                }
              }
              if (a.phase === 3 && e - a.p0 >= S.coffee) { finish(); return; }
              const rc = recov();
              const wait = rc ? "recovering" : lvl === "PANIC" ? "critical" : "cool";
              const eta = rc && rc.certain ? Math.ceil(rc.eta) : -1;
              const ph = rescueTexts(a, e);
              const key = a.phase + "|" + wait + "|" + eta + "|" + a.count + "|" + a.helpers + "|" + C().memes.lang + "|" + ph.phraseId + "|" + ph.punchId;
              if (key !== a.key) {
                a.key = key;
                scr().setGag({ target: "stage", scene: "rescue", step: a.phase,
                  data: Object.assign({ names: a.names.slice(), count: a.count, drop: a.drop, crisis: a.crisis, wait, eta, lang: C().memes.lang, helpers: a.helpers }, ph) });
                emit();
              }
            },
          };
        }
        /* ---- Ventanas de crisis (etapa 12): secuencias y descansos durante CRITICAL ---- */
        case "crisis": {
          a.seq = null; a.nseq = 0; a.key = null;
          a.restUntil = a.source === "test" ? 0.25 : C().catalog.popups.firstDelay;
          return {
            beats: [], end: Infinity,
            tick(e) {
              if (a.source === "auto" && (sim.state.level !== "PANIC" || recov())) { finish(); return; }
              if (!a.seq) {
                if (e < a.restUntil) {
                  if (a.key !== "rest") { a.key = "rest"; a.visible = []; scr().clearGag(); emit(); }
                  return;
                }
                if (a.source !== "auto" && a.nseq >= (a.runs || 1)) { finish(); return; }
                a.seq = C().catalog.popups.mode === "guiones" ? planGuion(a, e) : planSeq(a, e);
                a.nseq++;
                if (a.source === "auto") crisisSeqs++;
              }
              const sq = a.seq;
              if (e >= sq.end) {
                const pp = C().catalog.popups;
                const wasGuion = !!sq.guion;
                a.seq = null; a.key = null;
                a.restUntil = e + (a.source !== "auto" ? 0.6 : wasGuion ? rnd(pp.guionRest * 0.85, pp.guionRest * 1.15) : rnd(pp.restMin, pp.restMax));
                tick(); return;
              }
              if (sq.guion) paintGuion(a, e); else paintSeq(a, e);
            },
          };
        }
        /* ---- Pruebas del catálogo (laboratorio): ventanas o tarjetas sin tocar el simulador ---- */
        case "preview": {
          const sp = a.spec || {};
          a.key = null;
          if (sp.type === "guion") {
            a.seq = planGuion(a, 0, sp.id);
            return { beats: [], end: Infinity, tick(e) { if (e >= a.seq.end) { finish(); return; } paintGuion(a, e); } };
          }
          if (sp.type === "popup") {
            // la misma elección de composición y legibilidad que en directo
            if (!sp.entry) sp.entry = catalog.get(sp.id);
            a.seq = sp.entry ? planSeq(a, 0) : { wins: [], end: 0 };
            return { beats: [], end: Infinity, tick(e) { if (e >= a.seq.end) { finish(); return; } paintSeq(a, e, true); } };
          }
          // tarjetas de suscripción: sólo pantalla (no enfría ni cambia el simulador)
          const each = sp.each || 4;
          return {
            beats: [], end: Infinity,
            tick(e) {
              const cards = sp.cards || [];
              const i = Math.floor(e / each);
              if (i >= cards.length) { finish(); return; }
              const c = cards[i], age = e - i * each;
              const step = c.step || (age < each * 0.62 ? 1 : c.ctx === "critical" ? 2 : 3);
              const lang = C().memes.lang;
              const tx = (id) => { const t = catalog.text(lookup(a, id), lang); return t ? t.main : null; };
              const key = i + "|" + step + "|" + lang;
              if (key !== a.key) {
                if (a.cardIdx !== i) cue("subscribe", { preview: true });
                a.key = key; a.cardIdx = i;
                scr().setGag({ target: "stage", scene: "rescue", step,
                  data: { names: c.names.slice(), count: c.names.length || 1, drop: C().stream.subscriber.drop, crisis: c.ctx !== "normal",
                    wait: c.ctx === "critical" ? "critical" : "cool", helpers: 0,
                    phrase: c.phraseId ? tx(c.phraseId) : null, phraseId: c.phraseId || "", punch: c.punchId ? tx(c.punchId) : null, punchId: c.punchId || "" } });
                emit();
              }
            },
          };
        }
        /* ---- «Chat al mando»: carteles de eventos del público y del becario ---- */
        case "chatHeat": case "chatCool": case "becario": {
          const kind = id === "chatHeat" ? "heat" : id === "chatCool" ? "cool" : "becario";
          const phrase = () => (kind === "heat" ? C().chat.heat.phrase : kind === "cool" ? C().chat.coolant.phrase : C().chat.recovery.phrase);
          a.until = phrase(); a.key = null;
          return {
            beats: [], end: Infinity,
            tick(e) {
              if (e >= a.until - 1e-9) { finish(); return; }
              const key = a.count + "|" + Math.round(a.total) + "|" + C().memes.lang + "|" + (a.lock || "") + (a.follow ? "f" : "");
              if (key !== a.key) {
                a.key = key;
                scr().setGag({ target: "stage", scene: "chat", step: 1,
                  data: { kind, names: a.names.slice(), count: a.count, amount: a.total, rate: C().chat.recovery.rate, lock: a.lock || null, follow: !!a.follow } });
                emit();
              }
            },
            onEnd() { const L = getLights && getLights(); if (L && L.stopFlash) L.stopFlash(); },
          };
        }
        /* ---- Gags visuales (etapa 6) ---- */
        case "fuel": {
          const T0 = at(["search", "pause", "detect", "fill", "punch"]);
          return {
            end: T0[5],
            onEnd: () => { const L = getLights && getLights(); if (L && L.stopFlash) L.stopFlash(); },
            beats: [
              { at: T0[0], apply() { stage("fuel", 1); } },
              { at: T0[1], apply() { stage("fuel", 2); pose("COFFEE"); } },
              { at: T0[2], apply() { stage("fuel", 3); } },
              { at: T0[3], apply() { stage("fuel", 4); const L = getLights && getLights(); if (L && L.flash && !refreshing) L.flash("amber"); } },
              { at: T0[4], apply() { stage("fuel", 5); } },
            ],
          };
        }
        case "denial": {
          const T0 = at(["calm", "invade", "loud", "cover", "punch"]);
          return {
            end: T0[5],
            beats: [
              { at: T0[0], apply() {
                stage("denial", 1);
                if (a.source === "auto" && C().behavior.mode === "auto") a.poseNote = "el pato reacciona al nivel: PANIC y aleteo automático";
                else pose("PANIC", { flap: a.source === "auto" ? C().behavior.flap.enabled : true });
              } },
              { at: T0[1], apply() { stage("denial", 2); } },
              { at: T0[2], apply() { stage("denial", 3); } },
              { at: T0[3], apply() { stage("denial", 4); } },
              { at: T0[4], apply() { stage("denial", 5); } },
            ],
          };
        }
        case "supervisor": {
          const T0 = at(["connect", "slide", "disconnect", "punch"]);
          return {
            end: T0[4],
            beats: [
              { at: T0[0], apply() { stage("supervisor", 1); pose("IDLE"); } },
              { at: T0[1], apply() { stage("supervisor", 2); } },
              { at: T0[2], apply() { stage("supervisor", 3); } },
              { at: T0[3], apply() { stage("supervisor", 4); pose("COFFEE"); } },
            ],
          };
        }
        case "thisIsFine": {
          const adv = (o) => scr().setGag(Object.assign({ target: "advisory", label: T().scrAdvisoryLabel }, o));
          return {
            end: setup + pause + punch,
            beats: [
              { at: 0, apply() {
                adv({ tone: "calm", text: tx().fine });
                if (a.source === "auto" && C().behavior.mode === "auto") {
                  a.poseNote = "el pato reacciona al nivel: PANIC y aleteo automático";
                } else {
                  pose("PANIC", { flap: a.source === "auto" ? C().behavior.flap.enabled : true });
                }
              } },
              { at: setup, apply() { adv({ tone: "calm", text: "" }); } },
              { at: setup + pause, apply() { adv({ tone: "alarm", label: tx().correction, text: tx().notFine }); } },
            ],
          };
        }
        case "coffee":
          return {
            end: setup + pause + punch,
            beats: [
              { at: 0, apply() { strip({ tone: "memo", tag: tx().coffeeTag, icon: "drop", text: tx().coolantLow }); } },
              { at: setup, apply() { strip({ tone: "memo", tag: tx().coffeeTag, icon: "mug", text: "" }); pose("COFFEE"); } },
              { at: setup + pause, apply() { strip({ tone: "memo", tag: tx().coffeeTag, icon: "mug", text: tx().coffeeNo }); } },
            ],
          };
        case "update": {
          const stall = g.update.stall;
          const win = (o) => scr().setGag(Object.assign({ target: "window", title: tx().updTitle }, o));
          return {
            end: setup + stall + punch,
            // 0 → 99 % durante setup y se atasca; sin animaciones, directamente 99 %
            progress: (e) => (e >= setup || !decor ? 0.99 : (e / setup) * 0.99),
            beats: [
              { at: 0, apply() { win({ tone: "calm", icon: "download", text: tx().updInstalling, sub: tx().updSub, progress: decor ? 0 : 0.99 }); } },
              { at: setup, apply() { cue("glitch"); } }, // la barra se atasca en el 99 %
              { at: setup + stall, apply() { win({ tone: "joke", icon: "warn", text: tx().updFailed, sub: "", progress: null }); a.progress = null; cue("error"); } },
            ],
          };
        }
        case "button":
          return {
            end: setup + pause + punch,
            onEnd: () => hotLit(false),
            beats: [
              { at: 0, apply() { hotLit(true); strip({ tone: "warn", tag: tx().btnTag, icon: "button", text: tx().doNotPress }); } },
              { at: setup, apply() { strip({ tone: "warn", tag: tx().btnTag, icon: "button", text: "" }); } },
              { at: setup + pause, apply() {
                strip({ tone: "warn", tag: tx().btnTag, icon: "warn", text: tx().whyPress });
                pose(g.button.pose);
                // Sólo si se configura explícitamente: el botón calienta de verdad
                if (g.button.escalate && a.source !== "test") {
                  const th = C().sim.thresholds, need = th.panic + 12 - sim.state.temp;
                  if (need > 0) { sim.injectHeat(need, th.escalateDelay + punch + 6); a.escalated = true; }
                }
              } },
            ],
          };
        case "recovery":
          return {
            end: setup + pause + punch,
            beats: [
              { at: 0, apply() { strip({ tone: "ok", tag: tx().recTag, icon: "check", text: tx().resolved }); } },
              { at: setup, apply() { strip({ tone: "ok", tag: tx().recTag, icon: "check", text: "" }); } },
              { at: setup + pause, apply() { strip({ tone: "joke", tag: tx().recTag, icon: "trash", text: tx().deleted }); } },
            ],
          };
      }
      return null;
    }

    /* ------------------------------------------------ ventanas de crisis */
    /*
     * Composición dentro de la pantalla central (px lógicos 856 × 480): por
     * debajo de la franja reservada (temperatura y CRITICAL, y < 54) y por
     * encima de la cabeza del pato (y < 330). Hasta 3 ventanas, con un poco de
     * desorden para que parezca un ordenador que se le va de las manos.
     */
    const TOP = 60, BOT = 326;
    function layoutFor(n) {
      const r = (a, b) => Math.round(a + Math.random() * (b - a));
      if (n <= 1) { const h = r(214, 236); return [{ x: r(140, 170), y: r(TOP, BOT - h), w: 548, h }]; }
      if (n === 2) {
        const out = [0, 1].map((i) => { const h = r(206, 246); return { x: i ? r(432, 446) : r(16, 30), y: r(TOP, BOT - h), w: 392, h }; });
        return Math.random() < 0.5 ? out : out.reverse();
      }
      const cols = [12, 293, 574].map((x) => { const h = r(206, 262); return { x: x + r(-4, 4), y: r(TOP, BOT - h), w: 270, h }; });
      for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cols[i], cols[j]] = [cols[j], cols[i]]; }
      return cols;
    }

    /* Entrada del catálogo (o la que trae una prueba del laboratorio sin guardar). */
    /* Recuperación en curso (sim.recovery): el CRITICAL ya no está activo. */
    const recov = () => (sim.recovery ? sim.recovery() : null);
    const lookup = (a, id) => (a.spec && a.spec.entry && a.spec.entry.id === id ? a.spec.entry : catalog.get(id));

    /*
     * Legibilidad (etapa 13): antes de enseñar nada se calcula, con el mismo plan
     * de tamaños que usa la pintura (stage.planWin), el texto más pequeño de cada
     * ventana y se multiplica por la escala REAL de la pantalla central. Sólo
     * salen entradas que se leen (≥ catalog.popups.minPx px en pantalla):
     *   3 ventanas → 2 → 1 → una ventana grande «compacta» (sin título ni texto
     *   decorativo y con más tiempo de lectura) → ninguna (se ve la pantalla de CRITICAL).
     */
    const SIZES = { 3: [270, 206], 2: [392, 206], 1: [548, 214], c: [824, 268] };
    function readable(e, size, compact, lang, sc, floor) {
      const ST = window.DuckReactorStage;
      const t = catalog.text(e, lang);
      if (!ST || !t) return false;
      return ST.planWin(e.family, t, size[0], size[1], compact, true).min * sc >= floor;
    }
    function closerReadable(size, T, sc, floor) {
      const ST = window.DuckReactorStage;
      const t = { title: T.popCloser, main: (T.popClosing || "").split("{win}").join("refrigeracion.sys"), sub: T.popNoClose, btns: "" };
      return !!ST && ST.planWin("closer", t, size[0], size[1], false, false).min * sc >= floor;
    }

    function planSeq(a, e) {
      const pp = C().catalog.popups, lang = C().memes.lang;
      const T = (() => { const m = C().memes; return m.texts[lang] || m.texts.en; })();
      const sc = scr().coreScale ? scr().coreScale() : 1, floor = pp.minPx;
      const want = Math.max(1, Math.min(3, Math.round(rnd(pp.minWindows - 0.49, pp.maxWindows + 0.49))));
      const age = sim.state.t - crisisT0;
      const ctx = a.source !== "auto" ? ["start", "any", "long"] : crisisSeqs === 0 ? ["start", "any"] : age >= pp.longAfter ? ["any", "long"] : ["any"];
      const src = a.source === "auto" ? "auto" : "test";
      const one = a.spec && a.spec.entry ? a.spec.entry : null; // prueba de una entrada concreta
      let picks = [], slots = 0, compact = false, trick = false;
      /*
       * Primero una entrada que se lea al menos en una ventana sola; después, el
       * mayor número de ventanas (hasta el deseado) en el que esa entrada sigue
       * leyéndose, y el resto de la secuencia sólo con entradas legibles a ese
       * tamaño. Así salen todas las entradas (las largas, en secuencias de una
       * ventana) y las secuencias de varias ventanas se conservan donde se leen.
       */
      const first = one || catalog.pick("popup", { ctx, lang, source: src, filter: (x) => readable(x, SIZES[1], false, lang, sc, floor) });
      if (first && readable(first, SIZES[1], false, lang, sc, floor)) {
        let k = one ? 1 : want;
        while (k > 1 && !readable(first, SIZES[k], false, lang, sc, floor)) k--;
        const size = SIZES[k];
        trick = !one && (a.force === "trick" ? k >= 2 : (k >= 2 && !lastTrick && Math.random() < pp.tricks && a.force !== "plain")) && closerReadable(size, T, sc, floor);
        const nCat = trick ? Math.max(1, k - 1) : k;
        picks = [first];
        for (let i = 1; i < nCat; i++) {
          const en = catalog.pick("popup", { ctx, lang, exclude: picks.map((x) => x.id), source: src, filter: (x) => readable(x, size, false, lang, sc, floor) });
          if (!en) break;
          picks.push(en);
        }
        slots = k;
      } else if (first && !one) {
        // la elegida no se lee ni sola: se usa en la ventana compacta (abajo) si se lee ahí
        if (readable(first, SIZES.c, true, lang, sc, floor)) { picks = []; compact = "pending"; }
      }
      if (!picks.length) {
        // tamaño reducido: una sola ventana grande y sin texto decorativo
        trick = false;
        if (one) { if (readable(one, SIZES.c, true, lang, sc, floor)) picks = [one]; }
        else if (compact === "pending") picks = [first];
        else {
          const en = catalog.pick("popup", { ctx, lang, source: src, filter: (x) => readable(x, SIZES.c, true, lang, sc, floor) });
          if (en) picks = [en];
        }
        compact = picks.length > 0;
      }
      if (!trick || !picks.length) trick = false;
      if (a.source === "auto") lastTrick = trick;
      const total = picks.length + (trick ? 1 : 0);
      const L = compact ? [{ x: 16, y: 58, w: 824, h: 268 }] : layoutFor(total);
      // más tiempo de lectura cuando la escena es pequeña
      const slow = compact ? 1.6 : slots < want ? 1.25 : 1;
      const sq = { wins: [], end: e + 1, n: total, trick, compact, mode: compact ? "compact" : total ? String(total) : "none",
        punchAt: pp.punchAt * (compact ? 1.5 : 1), scale: sc };
      picks.forEach((en, i) => sq.wins.push({ key: a.nseq + "-" + i + "-" + en.id + (compact ? "-c" : ""), id: en.id, fam: en.family, at: e + (one ? 0.15 : 0) + i * pp.stagger * slow, x: L[i].x, y: L[i].y, w: L[i].w, h: L[i].h, compact }));
      if (trick) {
        const i = picks.length, tgt = Math.floor(Math.random() * picks.length);
        sq.wins.push({ key: a.nseq + "-closer", id: "closer", fam: "closer", closer: true, target: tgt, at: e + i * pp.stagger, x: L[i].x, y: L[i].y, w: L[i].w, h: L[i].h });
      }
      const last = sq.wins.length ? sq.wins[sq.wins.length - 1].at : e;
      sq.end = sq.wins.length ? last + Math.max(pp.read * slow, sq.punchAt + 3) : e + 1;
      return sq;
    }

    /*
     * Guiones de crisis (etapa 14): una secuencia por vez, con sus pausas.
     *   problema → respuesta aparentemente útil → remate
     * Instantes (s) de cada etapa y final. Con la escena pequeña, composición
     * compacta y un 25 % más de tiempo para leer.
     */
    const GUION = {
      sop: { at: [0, 2.4, 5.6], end: 12 },
      asis: { at: [0, 2.4, 4.8, 5.9, 6.6, 8.9], end: 13 },
      corp: { at: [0, 2.6, 5.0, 5.9, 7.4], end: 12.5 },
    };
    /*
     * Elección (preset principal): Soporte técnico y Prioridades son los
     * principales; Asistente es la variante. Cada crisis abre con Soporte
     * técnico; el segundo guion es Prioridades, salvo una de cada tres crisis,
     * en la que entra el Asistente; después alternan los principales. Nunca el
     * mismo guion dos veces seguidas dentro de una crisis. Si alguno está
     * desactivado, toma el siguiente disponible.
     */
    const GUION_ORDER = ["sop", "corp", "asis"];
    let crisisN = 0, epi = null;
    function chooseGuion(a, on) {
      const ok = (k) => on[k] !== false;
      if (!a.ep) {
        // el mismo CRITICAL sigue contando aunque una tarjeta interrumpa y vuelvan los guiones
        const key = a.source === "auto" ? sim.state.critSince : null;
        a.ep = key != null && epi && epi.key === key ? epi : { key, n: 0, last: null, idx: crisisN++ };
        if (key != null) epi = a.ep;
      }
      const E = a.ep, n = E.n, last = E.last;
      const want = n === 0 ? "sop" : n === 1 ? (E.idx % 3 === 2 ? "asis" : "corp") : last === "sop" ? "corp" : "sop";
      if (ok(want) && want !== last) return want;
      return GUION_ORDER.find((k) => ok(k) && k !== last) || (last && ok(last) ? last : null);
    }
    function planGuion(a, e, forced) {
      const pp = C().catalog.popups, on = pp.guiones || {};
      let id = forced;
      if (!id) {
        id = chooseGuion(a, on);
        if (!id) return { wins: [], end: e + 1, mode: "none" };
        a.ep.n++; a.ep.last = id;
      }
      const sc = scr().coreScale ? scr().coreScale() : 1;
      const compact = 40 * sc < pp.minPx;   // el texto principal no llegaría a minPx: composición compacta
      const k = compact ? 1.25 : 1, G = GUION[id];
      return { guion: id, t0: e, at: G.at.map((x) => e + x * k), end: e + G.end * k, compact, mode: "guion-" + id + (compact ? "-c" : ""), scale: sc, wins: [] };
    }
    function paintGuion(a, e) {
      const sq = a.seq, lang = C().memes.lang;
      const step = sq.at.filter((t) => e >= t - 1e-9).length;
      const key = sq.guion + "|" + step + "|" + lang + "|" + (sq.compact ? 1 : 0);
      if (key !== a.key) {
        a.key = key;
        if (a.cueStep !== step) { a.cueStep = step; cue("guion", { id: sq.guion, step }); } // no al cambiar de idioma
        a.visible = [sq.guion + ":" + step];
        scr().setGag({ target: "stage", scene: "guion", step: Math.max(1, step), data: { id: sq.guion, compact: sq.compact } });
        emit();
      }
    }

    /* Estado visible de la secuencia en el instante e → pantalla (sólo si cambia). */
    function paintSeq(a, e, any) {
      const sq = a.seq, pp = C().catalog.popups, lang = C().memes.lang, T = (() => { const m = C().memes; return m.texts[lang] || m.texts.en; })();
      const closer = sq.wins.find((w) => w.closer);
      const out = [];
      sq.wins.forEach((w, i) => {
        if (e < w.at) return;
        const age = e - w.at;
        let t, bar = 99;
        if (w.closer) {
          const tg = sq.wins[w.target], te = tg && catalog.text(catalog.get(tg.id), lang);
          t = { title: T.popCloser, main: (T.popClosing || "").split("{win}").join(te ? te.title : "?"), sub: T.popNoClose, btns: "" };
          bar = 100;
        } else {
          const en = lookup(a, w.id);
          t = catalog.text(en, lang);
          if (!t || (!any && !en.on)) return;
          bar = en.bar;
        }
        const pa = sq.punchAt || pp.punchAt;
        const punch = age >= pa;
        const morph = punch && t.btns.indexOf("→") >= 0 && age >= pa + 1.3;
        let close = 0;
        if (closer && closer.target === i && e >= closer.at) close = e - closer.at < pa ? 1 : 2;
        out.push({ key: w.key, id: w.id, fam: w.fam, x: w.x, y: w.y, w: w.w, h: w.h, z: i, t, punch, morph, close, bar, fillSec: pa * 0.9, compact: !!w.compact });
      });
      const key = out.map((w) => w.key + (w.punch ? "p" : "") + (w.morph ? "m" : "") + w.close).join(",") + "|" + lang;
      if (key !== a.key) {
        a.key = key;
        if (out.length > (a.cueWins || 0)) cue("popup"); // una ventana nueva (no cada línea)
        a.cueWins = out.length;
        a.visible = out.map((w) => w.id);
        if (out.length) scr().setGag({ target: "stage", scene: "crisis", step: 1, data: { wins: out } });
        else scr().clearGag();
        emit();
      }
    }

    /*
     * Frase de la tarjeta de suscripción según el estado REAL, estable durante
     * cada etapa: se elige al empezar (o al agruparse otro suscriptor) y sólo
     * cambia una vez, de «ayuda en progreso» a «recuperación», cuando el
     * reactor sale de CRITICAL. El remate de café se elige al llegar al café.
     */
    function rescueTexts(a, e) {
      const lang = C().memes.lang, lvl = sim.state.level;
      const ctxNow = lvl === "PANIC" && !recov() ? "critical" : a.wasCrit ? "recovery" : "normal";
      // recién llegado: la frase se elige cuando el evento ya aplicó su enfriamiento
      if (a.defer) return { phrase: null, phraseId: "", punch: null, punchId: "", phraseCtx: null };
      const who = a.count > 1 ? "group" : "one";
      const choose = (ctx) => {
        const en = catalog.pick("sub", { ctx: [ctx], who, lang, source: a.source === "event" ? "event" : "test" });
        a.phr = { id: en ? en.id : null, ctx, at: e, n: a.count };
      };
      if (!a.phr || a.phr.n !== a.count) { choose(a.phase === 3 && ctxNow === "critical" ? "recovery" : ctxNow); a.swapped = false; }
      else if (a.phr.ctx === "critical" && ctxNow !== "critical" && !a.swapped && e - a.phr.at >= 2.5) { choose("recovery"); a.swapped = true; }
      if (a.phase === 3 && !a.punchId) {
        const en = catalog.pick("coffee", { ctx: [a.crisis ? "after" : "calm", "any"], lang, source: a.source === "event" ? "event" : "test" });
        a.punchId = en ? en.id : "";
      }
      const txt = (id) => { const t = id && catalog.text(catalog.get(id), lang); return t ? t.main : null; };
      let phrase = txt(a.phr.id);
      if (a.phr.id && !phrase) { choose(a.phr.ctx); phrase = txt(a.phr.id); } // otro idioma sin variante
      return { phrase, phraseId: a.phr.id || "", punch: a.phase === 3 ? txt(a.punchId) : null, punchId: a.phase === 3 ? a.punchId || "" : "", phraseCtx: a.phr.ctx };
    }

    /* Durante CRITICAL y sin otro gag: vuelven las ventanas (también tras una tarjeta). */
    function maybeCrisis() {
      const m = C().memes, pp = C().catalog.popups;
      if (destroyed || active || !m.enabled || !pp.enabled || sim.state.level !== "PANIC" || recov()) return;
      if (sim.state.t - lastAnyEnd < 0.8) return;
      start("crisis", "auto");
    }

    /* ------------------------------------------------ motor */
    function gate(id, source) {
      const lvl = sim.state.level;
      if (NORMAL_ONLY.includes(id) && lvl !== "NORMAL") return L`el reactor está en ${LEVEL_TXT[lvl]}: las alarmas reales tienen prioridad; este gag sólo sale en nivel normal`;
      if (id === "button" && lvl === "PANIC") return "CRITICAL activo: las alarmas reales tienen prioridad sobre el botón";
      if (id === "update" && source === "auto" && lvl !== "ALARMED" && lvl !== "PANIC") return "sólo sale durante ALARM o CRITICAL";
      if (id === "crisis" && source === "auto" && lvl !== "PANIC") return "las ventanas de crisis sólo salen en CRITICAL";
      return null;
    }

    function tryStart(id, source) {
      const m = C().memes;
      if (destroyed || !IDS.includes(id)) return { ok: false, reason: "gag desconocido" };
      const block = (reason) => {
        blocked = { id, reason, at: Date.now(), source };
        emit();
        return { ok: false, reason };
      };
      if (source !== "test" && source !== "demo") {
        if (!m.enabled) return block("los memes están desactivados");
        if (id === "crisis" ? !C().catalog.popups.enabled : !m.gags[id].enabled) return block("este gag está desactivado");
      }
      const g = gate(id, source);
      if (g) return block(g);
      if (active) {
        const canReplace = PRIO[id] >= PRIO[active.id] || (active.source !== "auto" && source !== "auto");
        if (!canReplace) return block(L`hay un gag de más prioridad en curso (${NAME[active.id]})`);
      }
      if (source === "auto" && m.gags[id] && m.gags[id].chance != null && Math.random() >= m.gags[id].chance) return { ok: false, reason: "no tocó (probabilidad)" };
      start(id, source);
      return { ok: true };
    }

    function start(id, source, extra) {
      if (active) cleanup(active, "cancel", L`sustituido por ${NAME[id]}`);
      const a = Object.assign({ id, source, clock: source === "auto" || source === "demo" ? "sim" : "real", t0: sim.state.t, elapsed: 0, last: performance.now(), idx: 0, raf: 0, poseNote: null }, extra || {});
      const def = build(id, a);
      Object.assign(a, def);
      active = a;
      blocked = null;
      if (lastGag !== id) skipOnce = false;
      tick();
      if (active === a) a.raf = requestAnimationFrame(loop);
      emit();
    }

    const elapsedOf = (a) => (a.clock === "sim" ? sim.state.t - a.t0 : a.elapsed);

    function loop(now) {
      const a = active;
      if (!a) return;
      const dt = Math.min(250, Math.max(0, now - a.last));
      a.last = now;
      if (a.clock === "real") a.elapsed += dt / 1000;
      tick();
      if (active === a) a.raf = requestAnimationFrame(loop);
    }

    function tick() {
      const a = active;
      if (!a) return;
      const e = elapsedOf(a);
      if (a.tick) { a.tick(e); return; }
      let changed = false;
      while (active === a && a.idx < a.beats.length && a.beats[a.idx].at <= e + 1e-9) {
        a.beats[a.idx++].apply();
        changed = true;
      }
      if (active !== a) return;
      if (a.progress) scr().setGagProgress(a.progress(e));
      if (e >= a.end - 1e-9) { finish(); return; }
      if (changed) emit();
    }

    /* Limpia pantallas, pose y botón. Restaura desde el estado actual. */
    function cleanup(a, how, reason) {
      cancelAnimationFrame(a.raf);
      if (active === a) active = null;
      const s = scr();
      if (s && s.clearGag) s.clearGag();
      duck.setGagPose(null);
      hotLit(false);
      if (a.onEnd) a.onEnd();
      lastEnd = { id: a.id, how, reason: reason || a.endNote || null };
      lastAnyEnd = sim.state.t;
    }

    function finish() {
      const a = active;
      if (!a) return;
      cleanup(a, "end");
      if (a.source === "auto") { lastGag = a.id; lastEndT = sim.state.t; }
      planNext(sim.state.t); // pausa tranquila después de cualquier gag
      if (CHAT.includes(a.id)) afterCard(a);
      emit();
    }

    /*
     * Al terminar un cartel del chat: si el reactor ya está seguro y había un
     * rescate aplazado, café y remate; si sigue en CRITICAL y entró durante el
     * cartel, la sala reacciona ahora (gag crítico de Memes, si está activado).
     * Nada de esto cambia el estado del reactor.
     */
    function afterCard(a) {
      if (active) return;
      if (sim.state.level === "NORMAL") { onSafe(); return; }
      if (a.critPending && sim.state.level === "PANIC") criticalGag();
    }

    /* Reactor de vuelta a nivel normal (por cualquier vía). */
    function onSafe() {
      if (pendingRescue) {
        if (active) return; // espera a que termine el cartel en curso
        const p = pendingRescue;
        pendingRescue = null;
        // la misma frase de recuperación (si ya la tenía): la tarjeta vuelve coherente para el café
        start("rescue", "event", { names: p.names, count: p.count, drop: p.drop, helpers: p.helpers, crisis: true, wasCrit: true, startPhase: 3, phr: p.phr ? Object.assign({}, p.phr, { at: 0 }) : null });
        return;
      }
      if (active && active.id === "rescue") return; // el rescate pone su propio café
      if (crisis && C().chat.enabled && C().chat.coffeeAfterCrisis) {
        const ok = duck.coffeeNow();
        lastSafe = { at: Date.now(), coffee: ok };
      }
      crisis = false;
    }

    function cancel(reason, filter) {
      const a = active;
      if (!a || (filter && !filter(a))) return false;
      cleanup(a, "cancel", reason);
      if (a.source === "auto") { lastGag = a.id; lastEndT = sim.state.t; }
      planNext(sim.state.t);
      emit();
      return true;
    }

    /* Turno automático: elige entre los gags periódicos que tocan ahora. */
    function periodic() {
      const m = C().memes;
      if (!m.enabled || active || demoMode) return; // en la demostración sólo salen los gags del guion
      if (sim.state.t < nextSlot) return;
      planNext(sim.state.t);
      const ok = PERIODIC.filter((id) => m.gags[id].enabled && !gate(id, "auto"));
      if (!ok.length) return;
      let pool = ok.filter((id) => id !== lastGag);
      if (!pool.length) {
        // sólo queda el mismo: se salta un turno para no repetirlo seguido
        if (!skipOnce) { skipOnce = true; return; }
        skipOnce = false;
        pool = ok;
      }
      tryStart(pool[Math.floor(Math.random() * pool.length)], "auto");
    }

    /* Al entrar en CRITICAL: uno de los gags de CRITICAL activados, alternando. */
    let lastCritical = null;
    function criticalGag() {
      const m = C().memes;
      if (!m.enabled) return;
      const ok = CRITICAL_EVENT.filter((id) => m.gags[id].enabled);
      if (!ok.length) return;
      const pool = ok.length > 1 ? ok.filter((id) => id !== lastCritical) : ok;
      const id = pool[Math.floor(Math.random() * pool.length)];
      const r = tryStart(id, "auto");
      if (r.ok) lastCritical = id;
    }

    /* Gags de evento (CRITICAL y recuperación). */
    function eventGag(id) {
      const m = C().memes;
      if (!m.enabled || !m.gags[id].enabled) return;
      if (lastGag === id && !active && sim.state.t - lastEndT < m.interval.min) return; // no repetir seguido
      tryStart(id, "auto");
    }

    const offSim = sim.on((type, data) => {
      if (destroyed) return;
      if (type === "reset") {
        cancel("reinicio de la simulación", (a) => a.clock === "sim" || a.id === "rescue" || CHAT.includes(a.id));
        lastGag = null; skipOnce = false; lastEndT = -Infinity; lastAnyEnd = -Infinity;
        pendingRescue = null; crisis = sim.state.level === "PANIC";
        crisisT0 = sim.state.t; crisisSeqs = 0;
        planNext(sim.state.t);
        emit();
        return;
      }
      if (type === "emergency") {
        if (data.on) becarioCard();
        emit();
        return;
      }
      if (type === "recovery") {
        // empieza la recuperación: se acaban las ventanas de crisis y las reacciones de CRITICAL
        if (data.on) cancel("recuperación en curso: el CRITICAL ya no está activo", (a) => (a.id === "crisis" && a.source === "auto") || (CRITICAL_EVENT.includes(a.id) && a.source === "auto"));
        else maybeCrisis();
        tick(); emit();
        return;
      }
      if (type === "level") {
        if (data.to === "PANIC") { crisis = true; crisisT0 = sim.state.t; crisisSeqs = 0; }
        // Cartel del chat en curso: es la respuesta al evento que provocó este
        // cambio; no se corta. La reacción crítica sale al terminar el cartel.
        if (active && CHAT.includes(active.id)) {
          if (data.to === "PANIC") active.critPending = true;
          if (data.to === "NORMAL") onSafe();
          tick(); emit();
          return;
        }
        // Rescue en curso: los cambios de nivel son los esperados (el enfriamiento
        // baja el nivel). Sólo una nueva emergencia durante el café lo corta.
        if (active && active.id === "rescue") {
          if (active.phase === 3 && data.to !== "NORMAL") cancel("nueva emergencia: se cancela el café");
          else { tick(); emit(); return; }
        }
        if (data.to !== "NORMAL") cancel("alarma real: este gag sólo es para nivel normal", (a) => NORMAL_ONLY.includes(a.id));
        if (data.to === "PANIC") {
          cancel("CRITICAL: las alarmas reales tienen prioridad", (a) => !CRITICAL_EVENT.includes(a.id));
          criticalGag();
        } else if (data.from === "PANIC") {
          cancel("salió de CRITICAL: se cierran las ventanas", (a) => CRITICAL_EVENT.includes(a.id) || a.id === "update" || (a.id === "crisis" && a.source === "auto"));
          eventGag("recovery");
        }
        if (data.to === "NORMAL") onSafe();
        return;
      }
      periodic();
      maybeCrisis();
      if (active && active.clock === "sim" && !sim.running) emit();
    });

    const offStore = store.on((paths) => {
      const full = paths.includes("*");
      if (full) { cancel("cambio de preset o importación"); placeHot(); planNext(sim.state.t); return; }
      if (paths.some((p) => p === "memes.enabled") && !C().memes.enabled) cancel("memes desactivados", (a) => a.source === "auto");
      if (paths.includes("stream.subscriber.enabled") && !C().stream.subscriber.enabled) { cancel("evento desactivado", (a) => a.id === "rescue"); pendingRescue = null; }
      if (paths.includes("chat.enabled") && !C().chat.enabled) cancel("«Chat al mando» desactivado", (a) => CHAT.includes(a.id));
      if (paths.includes("catalog.popups.enabled") && !C().catalog.popups.enabled) cancel("ventanas de crisis desactivadas", (a) => a.id === "crisis" && a.source === "auto");
      IDS.forEach((id) => {
        if (paths.includes(`memes.gags.${id}.enabled`) && !C().memes.gags[id].enabled) cancel("gag desactivado", (a) => a.id === id && a.source === "auto");
      });
      if (paths.some((p) => p.startsWith("memes.interval"))) planNext(sim.state.t);
      if (paths.some((p) => p === "memes.lang" || p.startsWith("memes.texts"))) refreshTexts();
      if (paths.some((p) => p.startsWith("memes") || p.startsWith("behavior"))) emit();
    });

    /* Idioma o textos cambiados a mitad de un gag: re-aplica la frase actual. */
    let refreshing = false;
    function refreshTexts() {
      const a = active;
      if (!a || !a.idx) return;
      refreshing = true;
      const keep = a.poseNote;
      const b = a.beats[a.idx - 1];
      // re-aplica sólo la parte de pantalla (sin volver a tocar pose ni simulador)
      const realPose = duck.setGagPose;
      const realInject = sim.injectHeat;
      duck.setGagPose = () => ({ applied: !!duck.gagPose, reason: null });
      sim.injectHeat = () => {};
      try { b.apply(); } finally { duck.setGagPose = realPose; sim.injectHeat = realInject; refreshing = false; }
      a.poseNote = keep;
    }

    /*
     * Rescate por nuevo suscriptor (lo llama stream.js, la única entrada del
     * evento). Interrumpe el gag actual. Si ya hay un rescate en curso, agrupa:
     * suma el nombre y el descenso y vuelve a agradecer, sin abrir otro gag.
     * Reloj real (es un evento externo, como el botón).
     */
    function rescue(name, drop) {
      if (destroyed) return { ok: false, reason: "destruido" };
      const a = active;
      if (a && a.id === "rescue") {
        a.names.push(name); a.count++; a.drop += drop;
        a.phr = null; a.punchId = null; // nueva etapa: frase de grupo
        if (a.phase === 3) duck.setGagPose(null);
        a.phase = 1; a.p0 = elapsedOf(a); a.key = null; a.poseNote = null;
        settleRescue(a);
        tick();
        emit();
        return { ok: true, grouped: true, count: a.count };
      }
      blocked = null;
      pendingRescue = null; // este rescate sustituye al aplazado (se agradece el nuevo)
      start("rescue", "event", { names: [name], count: 1, drop, crisis: crisis || sim.state.level !== "NORMAL", wasCrit: crisis || sim.state.level === "PANIC", defer: true });
      if (active && active.id === "rescue") settleRescue(active);
      return { ok: true, grouped: false, count: 1 };
    }
    /*
     * stream.js aplica el enfriamiento justo DESPUÉS de avisar del evento: la
     * frase se elige en cuanto termina ese paso (antes de pintar nada), con el
     * nivel ya recalculado. Así, en pausa, una suscripción que saca al reactor
     * de CRITICAL agradece con una frase de recuperación.
     */
    function settleRescue(a) {
      a.defer = true;
      Promise.resolve().then(() => { if (active === a && a.defer) { a.defer = false; a.key = null; tick(); } });
    }

    /*
     * Cartel de un evento del chat (lo llama stream.js). Un solo cartel a la
     * vez: el mismo tipo seguido se agrupa (nombres, número y total) y alarga el
     * cartel; otro tipo lo sustituye. Durante un rescate, el refrigerante se
     * suma al rescate en vez de abrir otro cartel; «No tocar» lo interrumpe y el
     * café del suscriptor queda aplazado hasta que el reactor esté seguro.
     * Luces: barrido rojo (calor) o verde (refrigerante).
     */
    function chatCard(type, name, amount, extra) {
      // etapa 22: extra = { lock: "2/5" (voto que aún no basta), follow: true (viene de un follow) }
      const lock = extra && extra.lock ? String(extra.lock) : null, follow = !!(extra && extra.follow);
      if (destroyed) return { ok: false, reason: "destruido" };
      const id = type === "heat" ? "chatHeat" : "chatCool";
      const L = getLights && getLights();
      // con los relés de «Vida ambiental» activos, la secuencia la pone ambient.js (una sola)
      const relaysOn = () => C().life && C().life.enabled && C().life.relays.enabled;
      const sweep = () => { if (!relaysOn() && L && L.flash) L.flash(type === "heat" ? "red" : "green"); };
      const a = active;
      if (a && a.id === id && !!a.follow === follow) { // un follow no se agrupa con los !cool (contadores distintos)
        a.names.push(name); a.count++; a.total += amount; a.lock = lock; a.follow = follow;
        const extra = type === "heat" ? C().chat.heat.phrase : Math.max(1, C().chat.coolant.group);
        a.until = Math.max(a.until, elapsedOf(a) + extra);
        sweep(); tick(); emit();
        return { ok: true, grouped: true, count: a.count };
      }
      if (a && a.id === "rescue" && type === "coolant") {
        a.helpers++; a.drop += amount;
        sweep(); tick(); emit();
        return { ok: true, grouped: true, count: a.helpers, into: "rescue" };
      }
      holdRescue();
      blocked = null;
      start(id, "event", { names: [name], count: 1, total: amount, lock, follow });
      sweep();
      return { ok: true, grouped: false, count: 1 };
    }

    /* Un rescate que aún no llegó al café queda aplazado (no se pierde). */
    function holdRescue() {
      const a = active;
      if (a && a.id === "rescue" && a.phase !== 3) pendingRescue = { names: a.names.slice(), count: a.count, drop: a.drop, helpers: a.helpers, phr: a.phr && a.phr.ctx !== "critical" ? Object.assign({}, a.phr) : null };
    }

    /* «INTERVENCIÓN DEL BECARIO»: crisis sin resolver durante demasiado tiempo. */
    function becarioCard() {
      if (destroyed) return;
      holdRescue();
      start("becario", "event", { names: [], count: 1, total: 0 });
      const L = getLights && getLights();
      if (L && L.flash && !(C().life && C().life.enabled && C().life.relays.enabled)) L.flash("amber");
    }

    function info() {
      const a = active;
      return {
        active: a ? {
          id: a.id, name: NAME[a.id], source: a.source, clock: a.clock,
          beat: a.idx, beats: a.beats.length, elapsed: elapsedOf(a), end: a.end,
          paused: a.clock === "sim" && !sim.running, poseNote: a.poseNote, escalated: !!a.escalated,
          phase: a.phase, count: a.count, names: a.names ? a.names.slice() : null, drop: a.drop,
          total: a.total, helpers: a.helpers, left: a.until != null ? Math.max(0, a.until - elapsedOf(a)) : null,
          phrase: a.phr ? a.phr.id : null, phraseCtx: a.phr ? a.phr.ctx : null, punch: a.punchId || null,
          windows: a.id === "crisis" || a.id === "preview" ? (a.visible || []).slice() : null,
          seq: a.id === "crisis" ? a.nseq : null, resting: a.id === "crisis" ? !a.seq : null, trick: a.seq ? !!a.seq.trick : null,
          layout: a.seq ? a.seq.mode : null, scale: a.seq ? a.seq.scale : null,
          card: a.cardIdx != null ? a.cardIdx : null,
        } : null,
        crisisSeqs, crisisAge: sim.state.level === "PANIC" ? sim.state.t - crisisT0 : 0,
        crisis, pendingRescue: pendingRescue ? Object.assign({}, pendingRescue) : null, lastSafe,
        last: lastEnd,
        lastGag,
        blocked,
        nextIn: Math.max(0, nextSlot - sim.state.t),
        enabled: C().memes.enabled,
      };
    }

    placeHot();
    planNext(sim.state.t);

    return {
      IDS, NAME, VISUAL,
      test(id) { return tryStart(id, "test"); },
      rescue,
      chatCard,
      CHAT,
      layoutFor,
      /* Demostración en vivo: gag del guion (reloj de simulación: se pausa con ella). */
      run(id) { return tryStart(id, "demo"); },
      /* Laboratorio «Catálogo de memes»: pruebas en tiempo real, sin tocar el simulador. */
      crisisTest(force) {
        if (active && active.source === "event") return { ok: false, reason: "hay una tarjeta o un cartel real en curso: espera a que termine" };
        blocked = null;
        start("crisis", "test", { force: force || null, runs: 1 });
        return { ok: true };
      },
      preview(spec) {
        if (destroyed) return { ok: false };
        if (active && active.source === "event") return { ok: false, reason: "hay una tarjeta o un cartel real en curso: espera a que termine" };
        blocked = null;
        start("preview", "test", { spec });
        return { ok: true };
      },
      /* Diez tarjetas (o n) para comprobar la variedad. mode: auto · mixed · critical · recovery · normal */
      cardSet(n, mode) {
        const lang = C().memes.lang, clean = (window.DuckReactorStream && window.DuckReactorStream.cleanName) || ((x) => String(x || "").toUpperCase().slice(0, 24));
        const NAMES = [["MARTA"], [""], ["SUPERCALIFRAGILISTICO_99"], ["ANA", "LUIS"], ["KIKO", "LAURA", "DANI", "SOFÍA"],
          ["PATOFAN"], ["", "", ""], ["EL_INGENIERO_DEL_TURNO_DE_NOCHE"], ["BEA"], ["ZOE", "MAX", "IVÁN"]];
        const cyc = ["critical", "recovery", "normal"];
        const real = sim.state.level === "PANIC" ? "critical" : crisis ? "recovery" : "normal";
        const out = [];
        for (let i = 0; i < (n || 10); i++) {
          const names = NAMES[i % NAMES.length].map(clean);
          const ctx = mode === "mixed" ? cyc[i % 3] : mode === "auto" || !mode ? real : mode;
          const ph = catalog.pick("sub", { ctx: [ctx], who: names.length > 1 ? "group" : "one", lang, source: "test" });
          const pu = ctx === "critical" ? null : catalog.pick("coffee", { ctx: [ctx === "normal" ? "calm" : "after", "any"], lang, source: "test" });
          out.push({ names, ctx, phraseId: ph ? ph.id : null, punchId: pu ? pu.id : null });
        }
        return out;
      },
      setDemo(on) { demoMode = !!on; },
      press() { return press(); },
      stop() { blocked = null; pendingRescue = null; const r = cancel("detenido a mano"); emit(); return r; },
      cancel,
      info,
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      setDecor(on) { decor = !!on; },
      refreshTexts,
      hot,
      debug: () => ({ gagActive: active ? 1 : 0, gagRaf: active && active.raf ? 1 : 0 }),
      destroy() {
        destroyed = true;
        if (active) cleanup(active, "cancel", "destruido");
        offSim(); offStore(); listeners.clear();
        clearTimeout(pressTimer);
        hot.remove();
      },
    };

    function press() {
      if (destroyed) return { ok: false, reason: "destruido" };
      return tryStart("button", "button");
    }
  }

  window.DuckReactorGags = { mount, IDS, NAME, VISUAL };
})();

;
/* ---- src/emergency.js ---- */
/*
 * Duck Reactor — luz de emergencia tipo submarino durante CRITICAL (etapa 10).
 *
 * Capas no destructivas (scene.js las crea; el fondo y los PNG no se tocan):
 *   Sala   (emRoom, bajo las pantallas): oscurecimiento suave (multiply), tinte
 *          rojo amplio (soft-light) y luz localizada desde la fuente (color-dodge:
 *          aclara en proporción a lo que ya hay, así los negros siguen negros).
 *   Fuente (emSrc, sobre las luces): halo corto sobre la lámpara de alarma real.
 *   Pato   (emDuck): las mismas dos luces recortadas por el alfa del sprite activo,
 *          con la caída orientada desde la fuente. HIGH y MID comparten capas,
 *          variables y fase: sólo cambia la máscara, en el mismo fotograma.
 * Las pantallas quedan por encima de la sala: su texto no se tiñe ni se duplica
 * el rojo de CRITICAL. La luz cálida del techo baja con --em-warmk.
 *
 * Tiempo: una sola envolvente (entrada `enterMs`, salida `exitMs`, reversible
 * a mitad) y una sola fase de pulsación (`pulse.period`, entre media y alta,
 * nunca a cero) compartidas por sala, fuente y personaje, en tiempo real e
 * independientes del aleteo. Sin animaciones (movimiento reducido o tecla A):
 * luz fija de intensidad `still`, sin transición ni pulsación.
 *
 * Qué la enciende: el nivel CRITICAL REAL del simulador (nunca un gag), la
 * prueba manual del laboratorio o la comparación antes/después.
 *
 * window.DuckReactorEmergency.mount(scene, store, sim, getLights) → {
 *   info(), onChange(fn), test(on), setCompare(mode|null), setDecor(on), debug(), destroy()
 * }
 */
(function () {
  "use strict";

  function mount(scene, store, sim, getLights) {
    const C = () => store.cfg;
    const E = () => C().emergency;
    const U = window.DR.util;
    const stage = scene.stage;
    const div = (cls, parent) => { const n = document.createElement("div"); n.className = cls; parent.appendChild(n); return n; };

    const room = scene.layers.emRoom, srcLayer = scene.layers.emSrc;
    room.textContent = "";
    srcLayer.textContent = "";
    ["em-dark", "em-tint", "em-light"].forEach((c) => div(c, room));
    /*
     * Sala precalculada: el fondo es estático, así que el oscurecimiento y la luz
     * roja se calculan una vez en dos lienzos propios (el fondo original no se
     * toca) y por fotograma sólo cambia su opacidad. Mismas fórmulas que las
     * mezclas CSS (multiply y color-dodge), que quedan como respaldo si el
     * navegador no deja leer los píxeles del fondo.
     */
    const cDark = document.createElement("canvas"), cLit = document.createElement("canvas");
    cDark.className = "em-c em-c-dark"; cLit.className = "em-c em-c-lit";
    room.append(cDark, cLit);
    let bakeTimer = null, bgImg = null;
    /*
     * Cálculo por tramos de filas (sin bloquear la animación): se rehace sólo si
     * cambian color, oscurecimiento, intensidad de sala, fuente o fondo.
     */
    let bakeSig = null, bakeJob = 0;
    function bake() {
      const cfg = C(), e = E(), W = cfg.stage.width, H = cfg.stage.height;
      const sig = JSON.stringify([cfg.stage.background, W, H, e.color, e.darken, e.ambient, e.source]);
      if (sig === bakeSig && stage.classList.contains("em-baked")) return;
      const job = ++bakeJob;
      const go = () => {
        let x, a, o1, o2, dk, lt;
        try {
          const t0 = performance.now();
          const tmp = document.createElement("canvas");
          tmp.width = W; tmp.height = H;
          x = tmp.getContext("2d", { willReadFrequently: true });
          x.drawImage(bgImg, 0, 0, W, H);
          const src = x.getImageData(0, 0, W, H);
          dk = x.createImageData(W, H); lt = x.createImageData(W, H);
          a = src.data; o1 = dk.data; o2 = lt.data;
          const rgb = U.hexToRgb(e.color).split(",").map((v) => +v / 255);
          const lit = [rgb[0] * 0.46, rgb[1] * 0.15, rgb[2] * 0.15].map((L) => Math.min(0.98, L));
          const d = e.darken, R = e.source.radius, R2 = R * 1.8, sx = e.source.x, sy = e.source.y, amb = e.ambient;
          const near = [0.93, 0.96, 1.0].map((c) => Math.min(1, (1 - d * 0.45) * c)), far = [0.88, 0.95, 1.03].map((c) => Math.min(1, (1 - d) * c));
          // perfil de la luz (mismas paradas que .em-light): 1 · 0.55@30% · 0.18@65% · 0@100%
          const prof = (t) => (t >= 1 ? 0 : t < 0.3 ? 1 - (0.45 * t) / 0.3 : t < 0.65 ? 0.55 - (0.37 * (t - 0.3)) / 0.35 : 0.18 * (1 - (t - 0.65) / 0.35));
          let y0 = 0;
          const slice = () => {
            if (job !== bakeJob || destroyed) return;
            const tEnd = performance.now() + 6; // tramos cortos: la animación no se entera
            let y1 = y0;
            for (let yy = y0; yy < H && performance.now() < tEnd; yy++, y1 = yy) {
              const dy = yy - sy;
              for (let xx = 0; xx < W; xx++) {
                const i = (yy * W + xx) * 4, dx = xx - sx;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const td = dist >= R2 ? 1 : dist / R2, k = Math.min(1, prof(dist / R) * amb);
                for (let c = 0; c < 3; c++) {
                  const v = (a[i + c] / 255) * (near[c] + (far[c] - near[c]) * td);
                  o1[i + c] = v * 255;
                  const dodge = Math.min(1, v / (1 - lit[c])); // color-dodge, mezclado como en CSS
                  o2[i + c] = (v + (dodge - v) * k) * 255;
                }
                o1[i + 3] = 255; o2[i + 3] = 255;
              }
            }
            y0 = y1;
            if (y0 < H) { setTimeout(slice, 0); return; }
            [cDark, cLit].forEach((c) => { c.width = W; c.height = H; });
            cDark.getContext("2d").putImageData(dk, 0, 0);
            cLit.getContext("2d").putImageData(lt, 0, 0);
            stage.classList.add("em-baked");
            bakeSig = sig;
            baked = { ms: Math.round(performance.now() - t0) };
            listeners.forEach((fn) => fn(info()));
          };
          slice();
        } catch (err) {
          stage.classList.remove("em-baked"); // respaldo: mezclas CSS
          baked = { error: String((err && err.name) || err) };
          listeners.forEach((fn) => fn(info()));
        }
      };
      if (bgImg && bgImg.dataset.src === cfg.stage.background && bgImg.complete && bgImg.naturalWidth) go();
      else {
        bgImg = new Image();
        bgImg.dataset.src = cfg.stage.background;
        bgImg.onload = go;
        bgImg.onerror = () => { stage.classList.remove("em-baked"); baked = { error: "fondo no disponible" }; };
        bgImg.src = window.DR.asset(cfg.stage.background);
      }
    }
    let baked = null, duckBakeT = null;

    /*
     * Pato+silla precalculado, sprite por sprite (incluye la corrección cálida,
     * que en la escena se aplica a su capa): oscurecimiento, tinte soft-light y
     * luz color-dodge con la caída desde la fuente. El alfa es el del propio
     * sprite, así que no hay rectángulo. Primero el sprite visible y los de
     * PANIC; el resto, poco a poco. Mientras tanto, las capas CSS con máscara.
     */
    let duckSig = null, duckJob = 0, duckQueue = [], duckTimer = null, duckDone = 0;
    const softLight = (b, s) => {
      if (s <= 0.5) return b - (1 - 2 * s) * b * (1 - b);
      const D = b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b);
      return b + (2 * s - 1) * (D - b);
    };
    function duckImgs() { return [...scene.layers.duck.querySelectorAll("img.dr-duck-img")].filter((im) => im.em); }
    function duckSignature() {
      const cfg = C(), e = E(), g = cfg.grade || {};
      return JSON.stringify([e.color, e.darken, e.duck, e.source, cfg.duck, g.enabled, g.warmth, g.exposure]);
    }
    const duckCache = new Map(); // estado|variante → { sig, canvases } (sobrevive a reconstruir la escena)
    function bakeDuck() {
      const sig = duckSignature();
      const imgs = duckImgs();
      if (sig !== duckSig) { duckSig = sig; imgs.forEach((im) => im.em.classList.remove("baked")); duckDone = 0; }
      // mismo resultado ya calculado (p. ej. tras cargar un preset): se reutilizan los lienzos al momento
      imgs.forEach((im) => {
        if (im.em.classList.contains("baked")) return;
        const c = duckCache.get(im.dataset.state + "|" + im.dataset.variant);
        if (!c || c.sig !== sig) return;
        const cur = im.em.querySelectorAll("canvas");
        cur.forEach((n, i) => { if (n !== c.canvases[i]) im.em.replaceChild(c.canvases[i], n); });
        im.em.classList.add("baked");
      });
      const prio = (im) => (im.classList.contains("is-active") ? 0 : /^PANIC/.test(im.dataset.state) ? (im.dataset.variant === (C().grade.chairMatch === false ? "orig" : "matched") ? 1 : 2) : 3);
      duckQueue = imgs.filter((im) => !im.em.classList.contains("baked")).sort((a, b) => prio(a) - prio(b));
      const job = ++duckJob;
      clearTimeout(duckTimer);
      const next = () => {
        if (job !== duckJob || destroyed) return;
        const im = duckQueue.shift();
        if (!im) return;
        if (!im.complete || !im.naturalWidth) { im.addEventListener("load", () => bakeDuck(), { once: true }); duckTimer = setTimeout(next, 0); return; }
        bakeOne(im, job, () => { duckDone++; duckTimer = setTimeout(next, 30); });
      };
      next();
    }
    function bakeOne(im, job, done) {
      const cfg = C(), e = E(), box = scene.duckBox();
      const N = Math.min(1024, Math.round(box.size * 1.5));
      const cv = document.createElement("canvas");
      cv.width = N; cv.height = N;
      let x, px, dk, lt;
      try {
        x = cv.getContext("2d", { willReadFrequently: true });
        x.imageSmoothingQuality = "high";
        x.drawImage(im, 0, 0, N, N);
        px = x.getImageData(0, 0, N, N);
      } catch (err) { done(); return; } // sin acceso a los píxeles: se queda con las capas CSS
      dk = x.createImageData(N, N); lt = x.createImageData(N, N);
      const a = px.data, o1 = dk.data, o2 = lt.data;
      const g = cfg.grade || {}, w = Math.max(0, Math.min(1, g.warmth || 0)), amp = g.exposure == null ? 1 : g.exposure;
      const ex = g.enabled ? [1 - 0.14 * w, 1, 1 + 0.24 * w] : [1, 1, 1], am = g.enabled ? amp : 1;
      // corrección cálida (gamma por canal, como el filtro SVG) en tablas de 256
      const lut = ex.map((e2) => { const t = new Float32Array(256); for (let v = 0; v < 256; v++) t[v] = Math.min(1, am * Math.pow(v / 255, e2)); return t; });
      const rgb = U.hexToRgb(e.color).split(",").map((v) => +v / 255);
      const lit = [rgb[0] * 0.46, rgb[1] * 0.15, rgb[2] * 0.15].map((L) => Math.min(0.98, L));
      const d = e.darken, dd = [0.93, 0.97, 1.01].map((c) => Math.min(1, (1 - d * 0.55) * c));
      const R = e.source.radius, RT = R * 1.25, duck = e.duck;
      // paradas de .em-d-tint y .em-d-light
      const pT = (t) => (t >= 1 ? 0.2 : t < 0.6 ? 0.95 - (0.45 * t) / 0.6 : 0.5 - (0.3 * (t - 0.6)) / 0.4);
      const pL = (t) => (t >= 1 ? 0 : t < 0.35 ? 1 - (0.4 * t) / 0.35 : t < 0.8 ? 0.6 - (0.48 * (t - 0.35)) / 0.45 : 0.12 * (1 - (t - 0.8) / 0.2));
      const k = box.size / N;
      let y0 = 0;
      const slice = () => {
        if (job !== duckJob || destroyed) return;
        const tEnd = performance.now() + 6;
        let y1 = y0;
        for (let yy = y0; yy < N && performance.now() < tEnd; yy++, y1 = yy) {
          const dy = box.y + (yy + 0.5) * k - e.source.y;
          for (let xx = 0; xx < N; xx++) {
            const i = (yy * N + xx) * 4, al = a[i + 3];
            o1[i + 3] = al; o2[i + 3] = al;
            if (!al) continue;
            const dx = box.x + (xx + 0.5) * k - e.source.x, dist = Math.sqrt(dx * dx + dy * dy);
            const aT = Math.min(1, pT(dist / RT) * 0.18 * duck), aL = Math.min(1, pL(dist / R) * duck);
            for (let c = 0; c < 3; c++) {
              const gv = lut[c][a[i + c]];
              const v = gv * dd[c];
              o1[i + c] = v * 255;
              const v1 = v + (softLight(v, rgb[c]) - v) * aT;
              const v2 = v1 + (Math.min(1, v1 / (1 - lit[c])) - v1) * aL;
              o2[i + c] = v2 * 255;
            }
          }
        }
        y0 = y1;
        if (y0 < N) { duckTimer = setTimeout(slice, 0); return; }
        const [cd, cl] = im.em.querySelectorAll("canvas");
        [cd, cl].forEach((c) => { c.width = N; c.height = N; });
        cd.getContext("2d").putImageData(dk, 0, 0);
        cl.getContext("2d").putImageData(lt, 0, 0);
        im.em.classList.add("baked");
        duckCache.set(im.dataset.state + "|" + im.dataset.variant, { sig: duckSignature(), canvases: [cd, cl] });
        done();
      };
      slice();
    }
    const scheduleBake = () => { clearTimeout(bakeTimer); bakeTimer = setTimeout(bake, 120); };
    const halo = div("em-src", srcLayer);
    const badge = div("dr-em-badge", scene.layers.fx);
    badge.hidden = true;

    const listeners = new Set();
    let decor = true, test = false, compare = null;
    let env = 0, epoch = null, last = null, lastTs = 0, raf = 0, k = 0, eased = 0, owned = -1, destroyed = false;
    let lastEmit = 0;

    function reason() {
      if (compare) return compare === "emergency" ? "comparación: emergencia" : "comparación: normal";
      if (test) return "prueba manual";
      const lv = shownLevel();
      if (E().enabled && lv === "PANIC") return "CRITICAL real";
      if (E().enabled && E().alarm > 0 && lv === "ALARMED") return "ALARM (anticipo tenue)";
      return null;
    }
    function wanted() {
      if (compare) return compare === "emergency" ? 1 : 0;
      if (test) return 1;
      if (!E().enabled) return 0;
      const lv = shownLevel();
      if (lv === "PANIC") return 1;
      // anticipo opcional: un rojo tenue y fijo en ALARM (0 = sólo en CRITICAL)
      return lv === "ALARMED" ? Math.max(0, Math.min(0.6, E().alarm || 0)) : 0;
    }
    /* Recuperación en curso: la luz de emergencia se retira (salida gradual) aunque
       el nivel todavía espere su retardo; el peligro no se prolonga. */
    const shownLevel = () => (sim.shownLevel ? sim.shownLevel() : sim.state.level);

    /* Geometría y color: sólo cambian con la configuración. */
    function applyStatic() {
      const e = E(), st = stage.style;
      const rgb = U.hexToRgb(e.color).split(",").map((v) => +v);
      // luz «pura»: sobre todo canal rojo, para que sume rojo sin virar a naranja
      const lit = [Math.round(rgb[0] * 0.46), Math.round(rgb[1] * 0.15), Math.round(rgb[2] * 0.15)].join(",");
      const box = scene.duckBox();
      const d = e.darken;
      const g = (v) => Math.round(255 * v);
      st.setProperty("--em-rgb", rgb.join(","));
      st.setProperty("--em-lit", lit);
      st.setProperty("--em-sx", e.source.x + "px");
      st.setProperty("--em-sy", e.source.y + "px");
      st.setProperty("--em-r", e.source.radius + "px");
      st.setProperty("--em-r2", Math.round(e.source.radius * 1.8) + "px");
      // la luz del pato sale del mismo punto, en coordenadas de su caja
      st.setProperty("--em-lx", (e.source.x - box.x).toFixed(1) + "px");
      st.setProperty("--em-ly", (e.source.y - box.y).toFixed(1) + "px");
      // oscurecimiento: baja la luz cálida y la enfría un poco (lejos de la fuente
      // la sala queda oscura y neutra; cerca, menos oscura). El pato, algo menos.
      const tone = (v, t) => t.map((c) => g(Math.min(1, v * c))).join(",");
      st.setProperty("--em-dark-near", tone(1 - d * 0.45, [0.93, 0.96, 1.0]));
      st.setProperty("--em-dark-far", tone(1 - d, [0.88, 0.95, 1.03]));
      st.setProperty("--em-dark-duck", tone(1 - d * 0.55, [0.93, 0.97, 1.01]));
      Object.assign(halo.style, { left: e.source.x - 36 + "px", top: e.source.y - 36 + "px", width: "72px", height: "72px" });
      // la luz de sala que hay en la propia lámpara cede su lugar a la fuente
      owned = -1;
      let best = 18;
      C().lights.items.forEach((o, i) => { const dd = Math.hypot(o.x - e.source.x, o.y - e.source.y); if (o.enabled && dd < best) { best = dd; owned = i; } });
    }

    /*
     * Variables por fotograma SÓLO en las capas que las usan (no en la escena:
     * una variable en la raíz obligaría a recalcular el estilo de todo).
     */
    const dyn = [room, srcLayer, scene.layers.emDuck];
    const vals = {};
    function setVar(nodes, name, v) {
      const key = (nodes === dyn ? "d" : "r") + name;
      if (vals[key] === v) return;
      vals[key] = v;
      nodes.forEach((n) => n.style.setProperty(name, v));
    }
    const roomVars = [scene.layers.room];
    function write() {
      const e = E();
      setVar(dyn, "--em-dk", eased.toFixed(3));
      setVar(dyn, "--em-room", (k * e.ambient).toFixed(3));
      setVar(dyn, "--em-k", Math.min(1, k).toFixed(3));
      setVar(dyn, "--em-duck", (k * e.duck).toFixed(3));
      setVar(dyn, "--em-src", Math.min(1, k).toFixed(3));
      setVar(roomVars, "--em-warmk", (1 - eased * Math.min(0.9, e.darken * 1.6)).toFixed(3));
      setVar(roomVars, "--em-dk", eased.toFixed(3)); // la lámpara que hace de fuente cede su luz
      const on = eased > 0.001;
      stage.classList.toggle("em-on", on);
      stage.dataset.emergency = on ? (env >= 1 ? "on" : "fade") : "off";
      const L = getLights && getLights();
      if (L && L.nodes) L.nodes().forEach((n, i) => n.classList.toggle("em-owned", on && i === owned));
      const r = reason();
      badge.hidden = !(test || compare);
      const tr = (x) => (window.DR && DR.i18n ? DR.i18n.t(x) : x); // etiqueta del laboratorio (no es parte del widget)
      badge.textContent = tr(compare ? (compare === "emergency" ? "COMPARACIÓN · EMERGENCIA" : "COMPARACIÓN · NORMAL") : "PRUEBA · LUZ DE EMERGENCIA");
      badge.classList.toggle("is-normal", compare === "normal");
      const now = performance.now();
      if (now - lastEmit > 120 || !raf) { lastEmit = now; listeners.forEach((fn) => { try { fn(info()); } catch (err) { console.error("[duck-reactor] emergency listener", err); } }); }
      return r;
    }

    /* Un paso: envolvente → pulsación → variables. */
    function frame(ts) {
      raf = 0;
      if (destroyed) return;
      // un solo reloj (el del fotograma) para envolvente y fase
      const now = typeof ts === "number" ? ts : performance.now();
      if (last == null) last = now;
      const e = E(), tgt = wanted();
      const dt = Math.max(0, Math.min(1000, now - last)); // tiempo real: un fotograma lento no alarga la transición
      last = now;
      if (!decor) env = tgt;
      else if (env < tgt) env = Math.min(tgt, env + dt / Math.max(1, e.enterMs * (tgt < 1 ? 3 : 1))); // el anticipo entra despacio
      else if (env > tgt) env = Math.max(tgt, env - dt / Math.max(1, e.exitMs));
      if (env > 0 && epoch == null) epoch = now;
      if (env === 0 && tgt === 0) epoch = null;
      eased = env * env * (3 - 2 * env);
      let f;
      if (!decor) f = e.still;
      else if (tgt < 1 && env <= tgt + 1e-9) f = 1; // anticipo de ALARM: fijo, sin pulsar
      else {
        const t = epoch == null ? 0 : (now - epoch) / 1000;
        const p = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / Math.max(0.2, e.pulse.period));
        f = 1 - e.pulse.depth * (1 - p); // de media (1 − depth) a alta (1); nunca 0
      }
      k = eased * f;
      lastTs = now;
      write();
      if (decor && (env !== tgt || env > 0)) raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (destroyed) return;
      if (!decor) { if (raf) cancelAnimationFrame(raf); raf = 0; frame(); return; }
      if (!raf) { last = null; raf = requestAnimationFrame(frame); }
    }

    function info() {
      return { env, intensity: k, eased, target: wanted(), reason: reason(), test, compare, still: !decor, baked,
        duckBaked: duckImgs().filter((im) => im.em.classList.contains("baked")).length,
        phase: epoch == null ? null : (((lastTs - epoch) / 1000) % E().pulse.period) / E().pulse.period, owned };
    }

    const offSim = sim.on((type) => { if (type === "level" || type === "reset" || type === "recovery") kick(); });
    const offStore = store.on((paths) => {
      if (paths.includes("*") || paths.some((p) => /^(emergency|duck|lights\.items)(\.|$)/.test(p))) { applyStatic(); kick(); }
      if (!needed()) return;
      if (paths.includes("emergency.enabled")) prepare();
      if (paths.includes("*") || paths.some((p) => /^emergency\.(color|darken|ambient|source)(\.|$)/.test(p) || p === "stage.background")) scheduleBake();
      if (paths.includes("*")) { clearTimeout(duckBakeT); duckBakeT = setTimeout(bakeDuck, 0); }
      else if (paths.some((p) => /^(emergency|duck|grade)(\.|$)/.test(p))) { clearTimeout(duckBakeT); duckBakeT = setTimeout(bakeDuck, 150); }
    });

    applyStatic();
    // el precálculo espera a que la página esté tranquila (no compite con el arranque)
    // y sólo se hace si la luz puede encenderse; mientras, valen las mezclas CSS
    const needed = () => E().enabled || test || compare;
    let idleId = null;
    function prepare() {
      if (!needed() || destroyed) return;
      const run = () => { idleId = null; if (needed() && !destroyed) { bake(); bakeDuck(); } };
      if (idleId != null) return;
      idleId = window.requestIdleCallback ? window.requestIdleCallback(run, { timeout: 3000 }) : setTimeout(run, 1200);
    }
    prepare();
    kick();

    return {
      info,
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      /* Prueba manual: independiente del simulador (no toca temperatura ni nivel). */
      test(on) { test = !!on; prepare(); kick(); listeners.forEach((fn) => fn(info())); return test; },
      /* Comparación antes/después: "normal" | "emergency" | null (según el estado). */
      setCompare(mode) { compare = mode === "normal" || mode === "emergency" ? mode : null; prepare(); kick(); listeners.forEach((fn) => fn(info())); },
      setDecor(on) { decor = !!on; if (decor && env > 0) epoch = null; kick(); },
      refresh() { applyStatic(); kick(); },
      debug: () => ({ emRaf: raf ? 1 : 0 }),
      destroy() { destroyed = true; cancelAnimationFrame(raf); offSim(); offStore(); listeners.clear(); room.textContent = ""; srcLayer.textContent = ""; badge.remove(); },
    };
  }

  window.DuckReactorEmergency = { mount };
})();

;
/* ---- src/stream.js ---- */
/*
 * Duck Reactor — eventos del stream (etapas 7 y 9 · «Chat al mando»).
 *
 * ÚNICA ENTRADA para todos los eventos del público:
 *     duckReactor.stream.event({ type, name, id, source })
 *       type: "heat"       → «No tocar»: sube la temperatura real
 *             "coolant"    → «Mandar refrigerante»: la baja un poco
 *             "subscriber" → «Nuevo suscriptor»: la baja más (rescate con café)
 *     duckReactor.stream.subscriber({ name, id, source }) es un atajo.
 * La usan los botones del laboratorio y cualquier integración real futura.
 * No hay otra vía, así que no puede haber dos reacciones por el mismo evento;
 * si el evento trae `id`, los repetidos se ignoran.
 *
 * Reglas comunes:
 *   - Los efectos son REALES: el controlador del simulador (sim.heat / sim.cool)
 *     cambia la temperatura y el nivel, las luces y el pato siguen sus reglas
 *     (umbrales, histéresis y retardos). Nada fuerza un estado.
 *   - Cooldowns en tiempo real: por participante (mismo nombre) y por tipo
 *     (separación mínima entre eventos de cualquiera). Los rechazados no hacen
 *     nada y devuelven el motivo.
 *   - La presentación va en gags.js (un solo cartel a la vez; los eventos
 *     cercanos del mismo tipo se agrupan).
 *   - Simulación en pausa: el cambio de temperatura se aplica de golpe y el
 *     nivel se recalcula al momento, sin arrancar el reloj.
 *
 * Nuevo suscriptor (etapa 7): agradece, enfría y, con el reactor en nivel
 * normal, café y remate; si sigue en CRITICAL, el pato sigue en PANIC y el café
 * se aplaza hasta que el reactor esté seguro.
 *
 * CONEXIÓN REAL: este archivo NO está conectado a Twitch ni a ningún
 * servicio. Un HTML abierto en local no recibe eventos por sí solo. Quedan
 * preparados dos adaptadores que traducen a la entrada única (sólo
 * suscripciones por ahora):
 *   adapters.streamElements(detail)  → evento `onEventReceived` de un widget
 *                                      personalizado de StreamElements
 *                                      (listener "subscriber-latest").
 *   adapters.twitchEventSub(message) → notificación de Twitch EventSub
 *                                      (channel.subscribe; incluye regaladas).
 * connectStreamElements() registra el listener de StreamElements; no se
 * llama por defecto. Ver README → «Conexión real».
 *
 * window.DuckReactorStream.mount(store, sim, gags) → { event, subscriber, adapters, connectStreamElements, onChange, info, cooldowns }
 */
(function () {
  "use strict";
const cue = (n, d) => { const S = window.DR && window.DR.sound; if (S && S.cue) S.cue(n, d); }; // audio (etapa 16)
  const L = (window.DR && window.DR.i18n) ? window.DR.i18n.L : (s, ...v) => s.reduce((a, x, i) => a + (i ? String(v[i - 1]) : "") + x, ""); // textos del laboratorio (etapa 15)

  /* Nombre como TEXTO: sin caracteres de control, espacios compactados, 24 caracteres. */
  function cleanName(v) {
    if (v == null) return "";
    let s = String(v).replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim();
    if (s.length > 24) s = s.slice(0, 23) + "…";
    return s.toUpperCase();
  }

  function mount(store, sim, gags) {
    const C = () => store.cfg;
    const seen = [];
    const listeners = new Set();
    let last = null;
    const emit = () => listeners.forEach((fn) => { try { fn(info()); } catch (e) { console.error("[duck-reactor] stream listener", e); } });

    const TYPES = ["heat", "coolant", "subscriber", "follower"];
    const lastBy = { heat: new Map(), coolant: new Map(), subscriber: new Map(), follower: new Map() }; // nombre → ms
    const lastAny = { heat: -Infinity, coolant: -Infinity, subscriber: -Infinity, follower: -Infinity };
    const now = () => performance.now();

    /*
     * Etapa 22 · «enfriar sale caro» (chat.lock): durante CRITICAL un !cool suelto
     * no enfría. Cuenta un voto por persona; al llegar a `cools` votos (o a `follows`
     * follows nuevos) entra de golpe el refrigerante de un rescate. Las subs y los
     * eventos de pago no pasan por aquí: enfrían de golpe como siempre.
     * Los contadores se vacían al salir de CRITICAL (o al empezar la recuperación).
     */
    const votes = { cool: new Set(), follow: new Set() };
    function lockOn() {
      const LK = C().chat.lock, rec = sim.recovery ? sim.recovery() : null;
      return !!(LK && LK.enabled && C().chat.enabled && sim.state.level === "PANIC" && !rec && !(sim.state.coolLeft > 0.5)); // mientras entra un rescate no se vota
    }
    function lockInfo() {
      const on = lockOn(), LK = C().chat.lock || {};
      if (!on && (votes.cool.size || votes.follow.size)) { votes.cool.clear(); votes.follow.clear(); }
      return { active: on, cool: votes.cool.size, cools: LK.cools | 0, follow: votes.follow.size, follows: LK.follows | 0 };
    }
    sim.lockState = lockInfo; // las pantallas lo leen para enseñar el contador

    function reject(type, reason, source) {
      last = { ok: false, type, reason, source, at: Date.now() };
      emit();
      return last;
    }

    /* Única entrada de eventos del público. */
    function event(ev) {
      ev = ev || {};
      const type = ev.type;
      const source = ev.source || "test";
      if (!TYPES.includes(type)) return reject(type, "tipo de evento desconocido", source);
      const ch = C().chat;
      lockInfo(); // vacía los contadores si ya no estamos en CRITICAL
      if (type === "follower") { if (!lockOn() || !(C().chat.lock.follows > 0)) return reject(type, "un follow sólo enfría durante CRITICAL", source); }
      else if (type === "subscriber") { if (!C().stream.subscriber.enabled) return reject(type, "el evento está desactivado", source); }
      else if (!ch.enabled) return reject(type, "«Chat al mando» está desactivado", source);
      else if (!ch[type].enabled) return reject(type, "este evento está desactivado", source);
      const id = ev.id != null && ev.id !== "" ? String(ev.id) : null;
      if (id && seen.includes(id)) return reject(type, "evento repetido (mismo id): ignorado", source);
      const name = cleanName(ev.name);
      // cooldowns (tiempo real). Las suscripciones y los eventos de pago (bits, tips, raids) no tienen.
      if (type !== "subscriber" && type !== "follower" && !ev.paid) {
        const cfg = ch[type], t = now();
        if (t - lastAny[type] < cfg.gap * 1000) return reject(type, L`espera entre eventos: faltan ${((cfg.gap * 1000 - (t - lastAny[type])) / 1000).toFixed(1)} s`, source);
        const key = name || "·anónimo·";
        const prev = lastBy[type].get(key);
        if (prev != null && t - prev < cfg.cooldown * 1000) return reject(type, L`${name || "anónimo"} en cooldown: faltan ${((cfg.cooldown * 1000 - (t - prev)) / 1000).toFixed(1)} s`, source);
        lastBy[type].set(key, t);
        if (lastBy[type].size > 500) lastBy[type].delete(lastBy[type].keys().next().value);
        lastAny[type] = t;
      }
      if (id) { seen.push(id); if (seen.length > 200) seen.shift(); }
      let vote = null;
      if (!ev.paid && (type === "coolant" || type === "follower") && lockOn()) {
        const LK = C().chat.lock, box = type === "coolant" ? votes.cool : votes.follow;
        const need = Math.max(1, type === "coolant" ? LK.cools : LK.follows);
        const key = (name || "·anónimo·").toLowerCase();
        if (box.has(key)) return reject(type, L`${name || "anónimo"} ya cuenta para enfriar el núcleo (un voto por persona)`, source);
        box.add(key);
        vote = { n: box.size, t: need, follow: type === "follower", done: box.size >= need };
        if (vote.done) { votes.cool.clear(); votes.follow.clear(); }
      }
      const before = sim.state.temp;
      let g, fx;
      // primero la presentación (así los cambios de nivel ya encuentran el cartel),
      // después el cambio real de temperatura
      if (type === "subscriber") {
        const S = C().stream.subscriber;
        g = gags.rescue(name, S.drop);
        fx = sim.cool(S.drop, S.coolSeconds);
      } else if (vote && !vote.done) {
        // voto que aún no basta: cartel con el contador, sin enfriar
        g = gags.chatCard("coolant", name, 0, { lock: vote.n + "/" + vote.t, follow: vote.follow });
        fx = { instant: true, pending: 0 };
      } else if (type === "coolant" || type === "follower") {
        // con el último voto entra el refrigerante de un rescate de una vez
        const amt = vote ? Math.max(C().stream.subscriber.drop, ch.coolant.amount) : ev.amount > 0 ? +ev.amount : ch.coolant.amount; // etapa 21: cantidad propia (tips, comandos)
        g = gags.chatCard("coolant", name, amt, vote ? { follow: vote.follow } : null);
        fx = sim.cool(amt, vote ? C().stream.subscriber.coolSeconds : ch.coolant.seconds);
      } else {
        // lo que de verdad cabe bajo el tope de calor del chat (lo que se ve en el cartel)
        const c = sim.chat, want = ev.amount > 0 ? +ev.amount : ch.heat.amount; // etapa 21: cantidad propia (bits, raids, comandos)
        const eff = Math.max(0, Math.min(want, ch.heat.max - c.heat - c.heatLeft));
        g = gags.chatCard("heat", name, eff);
        fx = sim.heat(eff, ch.heat.ramp);
      }
      if (vote && !vote.done) cue("button");
      else if (type === "coolant" || type === "follower") cue("coolant", { grouped: g.grouped });
      else if (type === "subscriber") cue("subscribe", { grouped: g.grouped });
      last = { ok: true, type, name: name || null, source, grouped: g.grouped, count: g.count, before, after: sim.state.temp,
        instant: fx.instant, pending: fx.pending, vote, at: Date.now() };
      emit();
      return last;
    }

    function subscriber(ev) { return event(Object.assign({}, ev, { type: "subscriber" })); }

    function cooldowns() {
      const t = now(), ch = C().chat, out = {};
      ["heat", "coolant"].forEach((k) => { out[k] = Math.max(0, ch[k].gap - (t - lastAny[k]) / 1000); });
      return out;
    }
    function clearCooldowns() { TYPES.forEach((k) => { lastBy[k].clear(); lastAny[k] = -Infinity; }); emit(); }

    const adapters = {
      /* StreamElements: window.addEventListener('onEventReceived', e => adapters.streamElements(e.detail)) */
      streamElements(detail) {
        if (!detail || detail.listener !== "subscriber-latest" || !detail.event) return null;
        const e = detail.event;
        return subscriber({ name: e.name || e.displayName, id: e._id || e.activityId || null, source: "streamelements" });
      },
      /* Twitch EventSub (WebSocket o webhook ya verificado por tu servidor). */
      twitchEventSub(msg) {
        const type = msg && (msg.metadata ? msg.metadata.subscription_type : msg.subscription && msg.subscription.type);
        // Sólo suscripciones nuevas (incluye las regaladas: una por destinatario).
        // channel.subscription.gift no se usa para no contar dos veces.
        if (type !== "channel.subscribe") return null;
        const e = (msg.payload && msg.payload.event) || msg.event || {};
        const id = (msg.metadata && msg.metadata.message_id) || null;
        return subscriber({ name: e.user_name || e.user_login, id, source: "twitch" });
      },
    };

    let seHandler = null;
    function connectStreamElements() {
      if (seHandler) return () => {};
      seHandler = (e) => adapters.streamElements(e && e.detail);
      window.addEventListener("onEventReceived", seHandler);
      emit();
      return () => { window.removeEventListener("onEventReceived", seHandler); seHandler = null; emit(); };
    }

    function info() { return { last, connected: seHandler ? "streamelements" : null }; }

    return { event, subscriber, adapters, connectStreamElements, cleanName, cooldowns, clearCooldowns, TYPES,
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }, info };
  }

  window.DuckReactorStream = { mount, cleanName };
})();

;
/* ---- src/cycle.js ---- */
/*
 * Duck Reactor — ciclo automático (etapa 18).
 *
 * Opción del streamer (chat.auto.enabled):
 *   - Apagado: sólo el público mueve el reactor (comandos, subs…). Sin nadie en
 *     el chat, el reactor no se calienta nunca.
 *   - Encendido: tras `calm` s de calma (reloj de simulación) el reactor empieza
 *     a calentarse solo y sube en `rise` s hasta CRITICAL. Se resuelve como
 *     siempre (suscripción, refrigerante del chat y, si la crisis se resuelve
 *     sola, disipación o becario). Al volver a la calma, el contador empieza de
 *     nuevo: ciclo continuo. El chat puede adelantar o resolver la crisis.
 * No actúa durante la demostración, en Manual ni en Escenarios.
 *
 * window.DuckReactorCycle.mount({ store, sim, demo }) → { info(), trigger(), destroy() }
 */
(function () {
  "use strict";
  function mount(o) {
    const { store, sim } = o;
    const C = () => store.cfg;
    let calm = 0, lastT = sim.state.t, phase = "calm", firedAt = null, destroyed = false;
    const listeners = new Set();
    const emit = () => listeners.forEach((fn) => { try { fn(info()); } catch (e) { console.error("[duck-reactor] cycle", e); } });

    const active = () => { const a = C().chat.auto; return !!(a && a.enabled) && C().sim.mode === "auto" && !sim.driven; };
    const quiet = () => {
      const st = sim.state, ch = sim.chat;
      return st.level === "NORMAL" && !(sim.recovery && sim.recovery()) && ch.heat < 1 && ch.heatLeft < 0.5;
    };

    function trigger() {
      const st = sim.state, th = C().sim.thresholds, a = C().chat.auto;
      // lo justo para cruzar CRITICAL con margen, repartido en `rise` s
      let want = Math.max(0, th.panic + 32 - st.temp);
      // si el calor se disipa solo, se compensa lo que se pierde durante la subida
      const R = C().chat.recovery;
      if (R.selfResolve) want *= 1 + (0.69 * Math.max(1, a.rise)) / Math.max(1, R.halfLife);
      const r = sim.heat(want, Math.max(1, a.rise));
      calm = 0; phase = "rising"; firedAt = st.t;
      emit();
      return r;
    }

    const off = sim.on((type) => {
      if (destroyed) return;
      if (type === "reset") { calm = 0; phase = "calm"; lastT = sim.state.t; emit(); return; }
      if (type !== "update") return;
      const t = sim.state.t, dt = Math.max(0, Math.min(2, t - lastT));
      lastT = t;
      if (!active() || !sim.running) return;
      if (quiet()) {
        if (phase !== "calm") { phase = "calm"; calm = 0; }
        calm += dt;
        if (calm >= Math.max(5, C().chat.auto.calm)) trigger();
      } else if (phase === "calm") { phase = "busy"; calm = 0; } // el chat lo calentó: el contador espera a la calma
    });
    const offStore = store.on((paths) => {
      if (paths.includes("*") || paths.some((p) => p.startsWith("chat.auto") || p === "sim.mode")) { calm = 0; emit(); }
    });

    function info() {
      const a = C().chat.auto || {};
      return { enabled: !!a.enabled, active: active(), phase, calm, next: active() && phase === "calm" ? Math.max(0, a.calm - calm) : null, firedAt };
    }
    return {
      info, trigger,
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      destroy() { destroyed = true; off(); offStore(); listeners.clear(); },
    };
  }
  window.DuckReactorCycle = { mount };
})();

;
/* ---- src/ambient.js ---- */
/*
 * Duck Reactor — vida ambiental con propósito (etapa 13).
 *
 * Tres sistemas ligeros ligados a lo que pasa, sin tocar el estado del reactor:
 *   A · Café: dos o tres hebras de vapor nacen de la boca de la taza del sprite
 *       COFFEE (anclado al composite del pato: escala y se mueve con él) y se
 *       disipan. Sólo mientras se ve COFFEE.
 *   B · Incidente de refrigeración: escape de vapor desde una junta real del
 *       fondo (life.leak.x/y, dirección `angle`). En ALARM, escapes breves; en
 *       CRITICAL, algo más fuertes; con refrigerante, pulso frío localizado y el
 *       escape disminuye al recuperarse. CORE STATUS señala esa misma junta.
 *       Antes de NOTICE puede salir una señal mínima (un hilo de vapor).
 *   C · Relés: secuencias cortas sobre las luces que ya existen (lights.sequence):
 *       calor (ámbar que termina en aviso), entrada en CRITICAL (rojo que da paso
 *       a la luz de emergencia), refrigerante (verde azulado localizado) y
 *       estabilización (verde suave al confirmar el estado seguro).
 *   D · Chispas (avería): arcos eléctricos breves en dos aparatos del fondo (la
 *       rejilla del panel izquierdo y el teclado del pupitre derecho). Ráfagas de
 *       2–5 parpadeos con un destello local; más seguidas cuanto peor está el
 *       reactor. Con movimiento reducido no aparecen.
 * Todo se dispara por EVENTOS y cambios de fase (nunca en cada tick).
 * Un único requestAnimationFrame, sólo mientras hay partículas o emisión; tope
 * de partículas; se pausa con la página oculta. Movimiento reducido: sin
 * partículas ni secuencias; quedan señales estáticas (hebras fijas, bruma fija
 * en la junta, aviso en CORE STATUS).
 *
 * window.DuckReactorAmbient.mount({ scene, store, sim, stream, getLights, getScreens, duck, gags }) → {
 *   test(kind), stop(), showGuide(ms), info(), debug(), setDecor(bool), destroy()
 * }
 */
(function () {
  "use strict";
  const MUG = { x: 757, y: 274, w: 70 };   // boca de la taza en el sprite COFFEE (px del composite 1024)
  const MAX_P = 90;                          // tope de partículas
  const LV = { NORMAL: 0, NOTICE: 1, ALARMED: 2, PANIC: 3 };
  const SVGNS = "http://www.w3.org/2000/svg";

  function el(tag, cls, parent) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function sv(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function mount(o) {
    const { scene, store, sim, stream, getLights, getScreens, duck, gags } = o;
    const C = () => store.cfg;
    const L = () => C().life;
    const fx = scene.layers.fx;
    let decor = true, destroyed = false, hidden = !!document.hidden;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

    /* ================================================== A · vapor del café */
    const steam = el("div", "amb-steam", fx);
    const steamSvg = sv("svg", { viewBox: "0 0 100 200", preserveAspectRatio: "none", "aria-hidden": "true" }, steam);
    const strands = [
      "M46 198 C 36 178, 56 160, 46 140 S 36 110, 48 90",
      "M57 198 C 67 176, 49 158, 59 136 S 69 104, 57 82",
      "M51 198 C 45 182, 60 166, 52 148 S 44 122, 54 102",
    ].map((d, i) => sv("path", { d, class: "amb-strand", style: `--si:${i}` }, steamSvg));
    let steamOn = false, steamTest = false;
    function placeSteam() {
      const b = scene.duckBox(), k = b.size / C().duck.canvas;
      const w = 104 * k, h = 200 * k;
      Object.assign(steam.style, { left: b.x + MUG.x * k - w / 2 + "px", top: b.y + MUG.y * k - h + 4 * k + "px", width: w + "px", height: h + "px" });
    }
    function paintSteam() {
      const s = L().steam, want = L().enabled && s.enabled && (steamTest || scene.stage.dataset.state === "COFFEE");
      if (want) placeSteam();
      steam.style.setProperty("--amb-i", s.intensity);
      strands.forEach((p, i) => { p.style.display = i < s.strands ? "" : "none"; });
      steam.classList.toggle("is-on", want);
      steam.classList.toggle("is-still", !decor);
      steamOn = want;
    }
    const mo = new MutationObserver(() => paintSteam());
    mo.observe(scene.stage, { attributes: true, attributeFilter: ["data-state"] });

    /* ================================================== B · fuga en la junta */
    const leakBox = el("div", "amb-leak", fx);
    const canvas = el("canvas", "amb-leak-cv", leakBox);
    const ctx = canvas.getContext("2d");
    const still = el("div", "amb-leak-still", leakBox);   // bruma fija (movimiento reducido)
    const cold = el("div", "amb-cold", leakBox);           // pulso frío
    const guide = el("div", "amb-guide", fx);
    const gArrow = el("i", null, guide);
    const SIZE = 360;
    let res = 1;
    function placeLeak() {
      const lk = L().leak;
      Object.assign(leakBox.style, { left: lk.x - SIZE / 2 + "px", top: lk.y - SIZE / 2 + "px", width: SIZE + "px", height: SIZE + "px" });
      Object.assign(guide.style, { left: lk.x + "px", top: lk.y + "px" });
      gArrow.style.transform = `rotate(${lk.angle}deg)`;
      still.style.transform = `rotate(${lk.angle + 90}deg)`;
      const r = scene.stage.getBoundingClientRect();
      const k = r.width / C().stage.width || 1;
      const want = Math.max(0.5, Math.min(2, k * (window.devicePixelRatio || 1)));
      if (Math.abs(want - res) > 0.05 || canvas.width !== Math.round(SIZE * want)) {
        res = want;
        canvas.width = canvas.height = Math.round(SIZE * res);
      }
    }
    // sprite de bruma (una sola vez)
    const puff = document.createElement("canvas");
    puff.width = puff.height = 64;
    (function () {
      const g = puff.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(236,230,220,0.85)");
      gr.addColorStop(0.45, "rgba(226,218,204,0.4)");
      gr.addColorStop(1, "rgba(220,210,196,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
    })();

    let parts = [];
    let emit = { mode: "off", rate: 0, until: 0, next: 0, acc: 0 };
    const cue = (n, d) => { const S = window.DR && window.DR.sound; if (S && S.cue) S.cue(n, d); }; // audio (etapa 16)
    let suppress = 0;            // 0–1: refrigerante recién recibido (baja el escape)
    let leakTest = null;         // { mode, until } prueba del laboratorio
    let precursorAt = -Infinity;

    /* Estado del escape según el reactor (o la prueba). */
    function leakMode() {
      if (leakTest && performance.now() < leakTest.until) return leakTest.mode;
      if (!L().enabled || !L().leak.enabled) return "off";
      const shown = sim.shownLevel ? sim.shownLevel() : sim.state.level;
      if (shown === "PANIC") return "crit";
      if (shown === "ALARMED") return "alarm";
      if (sim.state.level !== "NORMAL" && sim.recovery && sim.recovery()) return "recover";
      return "off";
    }
    /* Intensidad continua 0–1 según la temperatura real (baja al recuperarse). */
    function heatFactor() {
      const th = C().sim.thresholds, t = sim.state.temp;
      return Math.max(0.15, Math.min(1, (t - th.notice) / Math.max(1, th.panic + 30 - th.notice)));
    }

    function spawn(n, opt) {
      const lk = L().leak, a0 = (lk.angle * Math.PI) / 180;
      opt = opt || {};
      for (let i = 0; i < n && parts.length < MAX_P; i++) {
        const a = a0 + (Math.random() - 0.5) * (opt.spread || 0.42);
        const sp = (opt.speed || 95) * (0.75 + Math.random() * 0.5) * (0.8 + 0.2 * lk.intensity);
        const along = (Math.random() - 0.5) * 7;     // a lo largo de la junta
        parts.push({
          x: SIZE / 2 + Math.cos(a0 + Math.PI / 2) * along, y: SIZE / 2 + Math.sin(a0 + Math.PI / 2) * along,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          r: 1.5 + Math.random() * 1.5, grow: (opt.grow || 22) * (0.8 + Math.random() * 0.5),
          life: (opt.life || 1.7) * (0.75 + Math.random() * 0.5), age: 0,
          a: (opt.alpha || 0.3) * Math.min(1.3, lk.intensity), ph: Math.random() * 6.28,
        });
      }
      kick();
    }

    let raf = 0, lastTs = 0;
    function kick() {
      if (raf || destroyed || hidden || !decor) return;
      lastTs = performance.now();
      raf = requestAnimationFrame(frame);
    }
    let lastFrameTs = -1, dup = 0;   // dos fotogramas con la misma marca = bucle duplicado (no debe pasar)
    function frame(ts) {
      if (ts === lastFrameTs) dup++;
      lastFrameTs = ts;
      raf = -1; // dentro del fotograma: kick() no abre otro bucle
      if (destroyed || hidden || !decor) { raf = 0; return; }
      const dt = Math.min(0.05, Math.max(0, (ts - lastTs) / 1000));
      lastTs = ts;
      const lk = L().leak, now = performance.now();
      // emisión: ráfagas programadas por la fase, no por cada tick del simulador
      const mode = leakMode();
      if (mode !== emit.mode) { emit.mode = mode; emit.next = now + (mode === "off" ? 0 : 300); emit.until = 0; if (mode === "off") cue("leakOff"); }
      suppress = Math.max(0, suppress - dt / 5);
      if (mode !== "off") {
        const crit = mode === "crit", rec = mode === "recover";
        if (now >= emit.next && now > emit.until) {
          const every = lk.every * (crit ? 0.6 : rec ? 1.6 : 1) * (0.8 + Math.random() * 0.4);
          const dur = lk.burst * (crit ? 1.3 : rec ? 0.6 : 1);
          emit.until = now + dur * 1000;
          emit.next = emit.until + every * 1000;
          // sonido de la ráfaga: misma duración e intensidad que el escape visible
          cue("leak", { dur, test: !!(leakTest && now < leakTest.until),
            gain: lk.intensity * (crit ? 1.15 : rec ? 0.55 : 0.9) * (0.35 + 0.65 * heatFactor()) * (1 - 0.75 * suppress) });
        }
        let rate = (now < emit.until ? 38 : crit ? 5 : 0) * lk.intensity * (crit ? lk.critical : 1);
        rate *= (rec ? 0.5 : 1) * (0.35 + 0.65 * heatFactor()) * (1 - 0.75 * suppress);
        emit.acc += rate * dt;
        const n = Math.floor(emit.acc);
        if (n > 0) { emit.acc -= n; spawn(n, { alpha: crit ? 0.42 : 0.34, grow: crit ? 30 : 24, speed: crit ? 150 : 120, life: 1.5 }); }
      } else emit.acc = 0;
      // movimiento: chorro que frena, flota hacia arriba, se ensancha y se disipa
      for (const p of parts) {
        p.age += dt;
        const drag = Math.pow(0.06, dt);
        p.vx *= drag; p.vy *= drag;
        p.vy -= 26 * dt;
        p.vx += Math.sin(p.ph + p.age * 2.4) * 10 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.r += p.grow * dt;
      }
      parts = parts.filter((p) => p.age < p.life);
      ctx.setTransform(res, 0, 0, res, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);
      for (const p of parts) {
        const u = p.age / p.life;
        const al = p.a * Math.min(1, p.age / 0.08) * Math.pow(1 - u, 1.7);   // se disipa antes de amontonarse
        if (al <= 0.003) continue;
        ctx.globalAlpha = al;
        // al salir, rápido y estirado en la dirección del chorro; después, bruma redonda
        const v = Math.hypot(p.vx, p.vy) || 1, st = 1 + Math.min(2.2, v / 45);
        const c = p.vx / v, s2 = p.vy / v;
        ctx.setTransform(res * c * st, res * s2 * st, -res * s2, res * c, res * p.x, res * p.y);
        ctx.drawImage(puff, -p.r, -p.r, p.r * 2, p.r * 2);
      }
      ctx.setTransform(res, 0, 0, res, 0, 0);
      // origen preciso: un hilo fino y tenso pegado a la junta mientras escapa
      if (mode !== "off" && now < emit.until) {
        const a = (lk.angle * Math.PI) / 180, len = 16 + 10 * lk.intensity;
        const gr = ctx.createLinearGradient(SIZE / 2, SIZE / 2, SIZE / 2 + Math.cos(a) * len, SIZE / 2 + Math.sin(a) * len);
        gr.addColorStop(0, "rgba(246,242,234,0.55)");
        gr.addColorStop(1, "rgba(246,242,234,0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = gr;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(SIZE / 2, SIZE / 2);
        ctx.lineTo(SIZE / 2 + Math.cos(a) * len, SIZE / 2 + Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = parts.length || mode !== "off" ? requestAnimationFrame(frame) : 0;
    }

    /* Aviso en CORE STATUS (la misma junta) y bruma fija con movimiento reducido. */
    let lastInc = null;
    function paintIncident() {
      const mode = leakMode(), on = mode === "alarm" || mode === "crit" || mode === "recover";
      const scr = getScreens && getScreens();
      const want = coldUntil > performance.now() ? "cold" : on ? "leak" : null;
      if (want !== lastInc && scr && scr.setIncident) { scr.setIncident(want ? { mode: want } : null); lastInc = want; }
      leakBox.classList.toggle("is-still", !decor);
      still.classList.toggle("is-on", !decor && on);
      still.style.opacity = !decor && on ? String(Math.min(0.55, 0.25 + 0.25 * L().leak.intensity) * (mode === "crit" ? 1.15 : mode === "recover" ? 0.6 : 1)) : "";
      if (on) kick();
    }

    let coldUntil = 0, coldT = [];
    function coldPulse() {
      if (!L().enabled || !L().leak.enabled) return;
      suppress = 1;
      coldUntil = performance.now() + 2600;
      cold.classList.remove("is-on");
      void cold.offsetWidth;
      cold.classList.add("is-on");
      // un solo par de temporizadores: un pulso nuevo sustituye al anterior
      coldT.forEach((id) => { clearTimeout(id); timers.delete(id); });
      coldT = [later(() => cold.classList.remove("is-on"), 2600), later(paintIncident, 2700)];
      paintIncident();
    }

    /* Señal mínima antes de NOTICE: un hilo de vapor y un relé ámbar, una sola vez por subida. */
    function precursor() {
      if (!L().enabled || !L().leak.enabled || !L().leak.precursor) return;
      const now = performance.now();
      if (now - precursorAt < 30000) return;
      precursorAt = now;
      if (decor) spawn(5, { alpha: 0.18, speed: 55, grow: 14, life: 2.2, spread: 0.25 });
      relay("hint");
    }

    /* ================================================== C · relés */
    let lastRelay = {};
    function relay(kind) {
      if (!L().enabled || !L().relays.enabled || !decor) return 0;
      const now = performance.now();
      if (lastRelay[kind] && now - lastRelay[kind] < 1200) return 0;  // nunca en bucle
      lastRelay[kind] = now;
      const Lg = getLights && getLights();
      return Lg && Lg.sequence ? Lg.sequence(kind, { step: L().relays.step, intensity: L().relays.intensity, origin: L().leak }) : 0;
    }

    /* ================================================== D · chispas (avería) */
    // Aparatos del fondo con chispas (px de escena): centro y tamaño aproximado del aparato.
    const SPOTS = [
      { id: "grille", x: 212, y: 292, w: 30, h: 30, every: 1 },     // rejilla del panel izquierdo
      { id: "pad", x: 972, y: 528, w: 100, h: 30, every: 1.35 },    // teclado del pupitre derecho
    ];
    const SP = () => L().sparks || { enabled: false, intensity: 1, rate: 1 };
    const sparkBoxes = SPOTS.map((sp) => {
      const W = sp.w + 90, H = sp.h + 80;
      const box = el("div", "amb-spark", fx);
      Object.assign(box.style, { left: sp.x - W / 2 + "px", top: sp.y - H / 2 + "px", width: W + "px", height: H + "px" });
      const flash = el("i", "amb-spark-flash", box);
      Object.assign(flash.style, { width: sp.w * 1.6 + 24 + "px", height: sp.h * 1.6 + 24 + "px" });
      const svg = sv("svg", { viewBox: `${-W / 2} ${-H / 2} ${W} ${H}`, width: W, height: H, "aria-hidden": "true" }, box);
      return { sp, box, flash, svg, timer: 0, run: [] };
    });
    let sparkTest = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    function sparkAllowed() { return !destroyed && !hidden && decor && L().enabled && SP().enabled; }
    /* Un rayo: zigzag desde un punto del aparato hacia fuera, con alguna rama. */
    function boltPath(sp, k) {
      const ox = rnd(-sp.w / 2, sp.w / 2), oy = rnd(-sp.h / 2, sp.h / 2);
      let a = Math.atan2(oy || rnd(-1, 1), ox || rnd(-1, 1)) + rnd(-0.9, 0.9);
      const len = rnd(12, 30) * k, n = 4 + Math.floor(Math.random() * 4);
      let x = ox, y = oy, d = `M${x.toFixed(1)} ${y.toFixed(1)}`, mid = null;
      let sg = Math.random() < 0.5 ? -1 : 1;
      for (let i = 0; i < n; i++) {
        a += sg * rnd(0.45, 1.05); sg = -sg;   // zigzag marcado, como un arco eléctrico
        a += rnd(-0.15, 0.15);
        const st = len / n * rnd(0.7, 1.3);
        x += Math.cos(a) * st; y += Math.sin(a) * st;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
        if (i === 1) mid = { x, y, a };
      }
      if (mid && Math.random() < 0.55) {   // rama corta
        let bx = mid.x, by = mid.y, ba = mid.a + (Math.random() < 0.5 ? -1 : 1) * rnd(0.6, 1.2);
        d += ` M${bx.toFixed(1)} ${by.toFixed(1)}`;
        for (let i = 0; i < 3; i++) { ba += rnd(-0.8, 0.8); bx += Math.cos(ba) * len * 0.14; by += Math.sin(ba) * len * 0.14; d += ` L${bx.toFixed(1)} ${by.toFixed(1)}`; }
      }
      return { d, tip: { x, y } };
    }
    function drawBolts(b, k) {
      b.svg.textContent = "";
      const n = 1 + Math.floor(Math.random() * (k > 1.1 ? 3 : 2));
      for (let i = 0; i < n; i++) {
        const { d, tip } = boltPath(b.sp, k);
        sv("path", { d, class: "amb-bolt-glow" }, b.svg);
        sv("path", { d, class: "amb-bolt" }, b.svg);
        // chispitas que saltan de la punta
        for (let j = 0; j < 2; j++) sv("circle", { cx: (tip.x + rnd(-4, 4)).toFixed(1), cy: (tip.y + rnd(-4, 4)).toFixed(1), r: rnd(0.6, 1.2).toFixed(2), class: "amb-spark-dot" }, b.svg);
      }
    }
    function sparkClear(b) { b.run.forEach(clearTimeout); b.run = []; b.svg.textContent = ""; b.box.classList.remove("is-on"); b.flash.style.opacity = ""; }
    /* Ráfaga: 2–5 parpadeos de 45–90 ms con apagones cortos entre medias. */
    function burst(b, strong) {
      sparkClear(b);
      const lv = sim.state.level, k = SP().intensity * (strong || lv === "PANIC" ? 1.25 : lv === "ALARMED" ? 1.1 : 0.9);
      const flicks = 2 + Math.floor(Math.random() * (lv === "PANIC" || strong ? 4 : 3));
      let t = 0;
      for (let i = 0; i < flicks; i++) {
        const on = rnd(45, 90), off = rnd(30, 120);
        b.run.push(setTimeout(() => { drawBolts(b, k); b.box.classList.add("is-on"); b.flash.style.opacity = String(Math.min(1, 0.45 + 0.35 * k) * rnd(0.6, 1)); }, t));
        b.run.push(setTimeout(() => { b.box.classList.remove("is-on"); b.svg.textContent = ""; b.flash.style.opacity = "0"; }, t + on));
        t += on + off;
      }
      b.run.push(setTimeout(() => sparkClear(b), t + 20));
    }
    /* Cada aparato chisporrotea por su cuenta; peor reactor = más seguido. */
    function sparkEvery(b) {
      const lv = sim.state.level, rec = sim.recovery && sim.recovery();
      const base = lv === "PANIC" && !rec ? 2.2 : lv === "ALARMED" ? 3.6 : lv === "NOTICE" ? 6 : rec ? 5 : 9;
      return base * b.sp.every / Math.max(0.25, SP().rate) * rnd(0.6, 1.5);
    }
    function sparkSchedule(b, first) {
      clearTimeout(b.timer);
      b.timer = setTimeout(() => {
        if (sparkAllowed() && sim.running) burst(b);
        sparkSchedule(b);
      }, (first ? rnd(1.5, 4) : sparkEvery(b)) * 1000);
    }
    sparkBoxes.forEach((b) => sparkSchedule(b, true));
    function sparksOff() { sparkBoxes.forEach(sparkClear); }

    /* ================================================== eventos */
    let prevLevel = sim.state.level, prevTemp = sim.state.temp, crisisSeen = false;
    const offSim = sim.on((type, data) => {
      if (destroyed) return;
      if (type === "reset") { stop(); prevLevel = sim.state.level; crisisSeen = sim.state.level === "PANIC"; return; }
      if (type === "level") {
        const up = LV[data.to] > LV[data.from];
        if (up && data.to === "NOTICE") relay("heat");
        if (up && data.to === "ALARMED") relay("heat");
        if (up && data.to === "PANIC") { relay("critical"); crisisSeen = true; if (sparkAllowed()) sparkBoxes.forEach((b, i) => setTimeout(() => sparkAllowed() && burst(b, true), 250 + i * 420)); }
        if (data.to === "NORMAL" && LV[data.from] >= 1) { relay("settle"); crisisSeen = false; }
        prevLevel = data.to;
        paintIncident();
        return;
      }
      if (type === "recovery") { paintIncident(); return; }
      if (type === "emergency" && data.on) { coldPulse(); relay("coolant"); return; }
      if (type === "update") {
        // señal previa: la temperatura sube y se acerca a NOTICE estando en normal
        const th = C().sim.thresholds, t = sim.state.temp;
        if (sim.state.level === "NORMAL" && prevTemp < th.notice - 14 && t >= th.notice - 14 && t > prevTemp) precursor();
        prevTemp = t;
        if (leakMode() !== "off") kick();
      }
    });

    let lastEventAt = 0;
    const offStream = stream && stream.onChange ? stream.onChange((info) => {
      const ev = info && info.last;
      if (!ev || !ev.ok || ev.at === lastEventAt) return;
      lastEventAt = ev.at;
      if (ev.type === "heat") relay("heat");
      if (ev.type === "coolant" || ev.type === "subscriber") { relay("coolant"); coldPulse(); }
    }) : () => {};

    const offStore = store.on((paths) => {
      if (destroyed) return;
      if (paths.includes("*")) { stop(); placeLeak(); paintSteam(); return; }
      if (paths.some((p) => p.startsWith("life") || p.startsWith("duck"))) {
        placeLeak(); paintSteam(); paintIncident();
        if (!L().enabled || !SP().enabled) sparksOff();
        if (!L().enabled || !L().leak.enabled) { parts = []; ctx.clearRect(0, 0, canvas.width, canvas.height); }
      }
      if (paths.some((p) => p.startsWith("memes.lang"))) { lastInc = undefined; paintIncident(); }
    });

    function onVis() {
      hidden = !!document.hidden;
      scene.stage.classList.toggle("amb-hidden", hidden);
      if (hidden) sparksOff();
      if (!hidden) kick();
    }
    document.addEventListener("visibilitychange", onVis);
    const onResize = () => placeLeak();
    window.addEventListener("resize", onResize);

    /* ================================================== pruebas y limpieza */
    function stop() {
      clearTimers();
      parts = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      emit = { mode: "off", rate: 0, until: 0, next: 0, acc: 0 };
      suppress = 0; coldUntil = 0; leakTest = null; lastInc = undefined;
      cold.classList.remove("is-on");
      if (steamTest) { steamTest = false; if (duck && duck.setGagPose && testPose) duck.setGagPose(null); }
      testPose = false;
      const Lg = getLights && getLights();
      if (Lg && Lg.stopSequence) Lg.stopSequence();
      lastRelay = {};
      paintSteam(); paintIncident();
    }
    let testPose = false;
    function coffeeTest(ms) {
      // la prueba del vapor pone COFFEE un momento (pose temporal) si no hay otro gag
      const g = gags && gags.info && gags.info();
      if (g && g.active) return false;
      const r = duck.setGagPose("COFFEE", { own: true, overManual: true, clock: "real" });
      testPose = !!(r && r.applied);
      steamTest = true; paintSteam();
      later(() => { steamTest = false; if (testPose) duck.setGagPose(null); testPose = false; paintSteam(); }, ms || 6000);
      return true;
    }
    function test(kind) {
      if (kind !== "full") stopFull();
      switch (kind) {
        case "steam": return coffeeTest(6000);
        case "leakAlarm": leakTest = { mode: "alarm", until: performance.now() + 9000 }; emit.mode = null; paintIncident(); later(paintIncident, 9100); kick(); return true;
        case "leakCrit": leakTest = { mode: "crit", until: performance.now() + 9000 }; emit.mode = null; paintIncident(); later(paintIncident, 9100); kick(); return true;
        case "cold": coldPulse(); relay("coolant"); return true;
        case "precursor": precursorAt = -Infinity; precursor(); return true;
        case "heat": case "critical": case "coolant": case "settle": lastRelay[kind] = 0; return relay(kind) > 0;
        case "full": return full();
        case "sparks": if (!decor) return false; sparkBoxes.forEach((b, i) => setTimeout(() => !destroyed && burst(b, true), i * 380)); return true;
      }
      return false;
    }
    /* Secuencia completa en tiempo real (sólo efectos; no cambia el simulador). */
    let fullOn = false;
    function stopFull() { if (fullOn) { fullOn = false; stop(); } }
    function full() {
      stop();
      fullOn = true;
      const at = (s, fn) => later(() => { if (fullOn) fn(); }, s * 1000);
      at(0, () => { precursorAt = -Infinity; lastRelay.hint = 0; precursor(); });
      at(2.2, () => { lastRelay.heat = 0; relay("heat"); });
      at(3.4, () => { leakTest = { mode: "alarm", until: performance.now() + 5200 }; emit.mode = null; paintIncident(); kick(); });
      at(8.6, () => { lastRelay.critical = 0; relay("critical"); leakTest = { mode: "crit", until: performance.now() + 5200 }; emit.mode = null; paintIncident(); kick(); });
      at(13.8, () => { coldPulse(); lastRelay.coolant = 0; relay("coolant"); leakTest = { mode: "recover", until: performance.now() + 3600 }; emit.mode = null; });
      at(17.6, () => { leakTest = null; lastRelay.settle = 0; relay("settle"); paintIncident(); });
      at(19.4, () => coffeeTest(6500));
      at(26.5, () => { fullOn = false; paintIncident(); });
      return true;
    }
    function showGuide(ms) {
      placeLeak();
      guide.classList.add("is-on");
      clearTimeout(guide._t);
      guide._t = setTimeout(() => guide.classList.remove("is-on"), ms || 6000);
    }

    placeLeak();
    paintSteam();
    paintIncident();

    return {
      test, stop: () => { fullOn = false; stop(); }, showGuide, relay, coldPulse,
      setDecor(on) {
        decor = !!on;
        if (!decor) { sparksOff(); parts = []; ctx.clearRect(0, 0, canvas.width, canvas.height); const Lg = getLights && getLights(); if (Lg && Lg.stopSequence) Lg.stopSequence(); }
        paintSteam(); paintIncident(); kick();
      },
      /* Extensión actual del vapor de la fuga en px de escena (para comprobar que no tapa pantallas ni pato). */
      bounds() {
        if (!parts.length) return null;
        const lk = L().leak, ox = lk.x - SIZE / 2, oy = lk.y - SIZE / 2;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const p of parts) {
          const u = p.age / p.life, al = p.a * Math.min(1, p.age / 0.08) * (1 - u);
          if (al < 0.03) continue;                        // lo casi invisible no cuenta
          const st = 1 + Math.min(2.2, Math.hypot(p.vx, p.vy) / 45), r = p.r * st * 0.7;
          x0 = Math.min(x0, p.x - r); x1 = Math.max(x1, p.x + r); y0 = Math.min(y0, p.y - r); y1 = Math.max(y1, p.y + r);
        }
        return x0 === Infinity ? null : { x0: ox + x0, y0: oy + y0, x1: ox + x1, y1: oy + y1 };
      },
      info: () => ({ steam: steamOn, leak: leakMode(), particles: parts.length, cold: coldUntil > performance.now(), suppress, origin: { x: L().leak.x, y: L().leak.y, angle: L().leak.angle },
        mug: (() => { const b = scene.duckBox(), k = b.size / C().duck.canvas; return { x: b.x + MUG.x * k, y: b.y + MUG.y * k }; })() }),
      debug: () => ({ ambRaf: raf ? 1 : 0, ambDup: dup, ambParticles: parts.length, ambTimers: timers.size, ambSparks: sparkBoxes.filter((b) => b.box.classList.contains("is-on")).length }),
      spots: SPOTS,
      destroy() {
        destroyed = true; stop(); if (raf > 0) cancelAnimationFrame(raf); raf = 0;
        sparkBoxes.forEach((b) => { clearTimeout(b.timer); sparkClear(b); b.box.remove(); });
        mo.disconnect(); offSim(); offStream(); offStore();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("resize", onResize);
        steam.remove(); leakBox.remove(); guide.remove();
      },
    };
  }

  window.DuckReactorAmbient = { mount, MUG, MAX_P };
})();

;
/* ---- src/audio.js ---- */
/*
 * Duck Reactor — audio (etapa 16). Un único gestor conectado a los eventos y
 * estados que ya existen; no reconstruye ningún sistema para sonar.
 *
 *   Ambiente  bucle (reactor o laboratorio, nunca los dos), sube un poco con
 *             la tensión y baja con transiciones suaves.
 *   Alarmas   aviso al entrar en CAUTION (una vez) y la sirena completa en
 *             bucle mientras el CRITICAL efectivo siga activo.
 *   Efectos   relés, fuga L-2, refrigerante, suscripción, ventanas y botones
 *             de los guiones, error, fallo, café y estabilización.
 *
 * Los módulos avisan con DR.sound.cue(nombre, datos); el gestor decide si suena
 * (configuración, pausa, visibilidad, límites para no repetir ni amontonar).
 * Primera instalación: audio desactivado. El navegador puede bloquear el
 * sonido hasta un gesto del usuario: el estado lo dice («bloqueado») y el
 * laboratorio muestra un botón para activarlo; nunca se informa de que suena
 * si el contexto de audio no está en marcha.
 *
 * window.DuckReactorAudio.mount({ store, sim, duck, gags, scene }) → api
 */
(function () {
  "use strict";
  const DR = (window.DR = window.DR || {});

  /* Sonidos: categoría (bus), nivel calibrado (tools/prepare_audio.py) y archivo. */
  const SOUNDS = {
    ambience_reactor: { bus: "ambience", base: 0.231, loop: true },
    ambience_lab:     { bus: "ambience", base: 1.0, loop: true },
    caution:          { bus: "alarms", base: 0.222 },   // etapa 19: original sintetizado, misma sonoridad percibida
    critical:         { bus: "alarms", base: 0.389, loopFull: true },
    relay:            { bus: "effects", base: 1.0 },
    leak:             { bus: "effects", base: 1.0 },
    coolant:          { bus: "effects", base: 0.549 },
    subscribe:        { bus: "effects", base: 0.2 },    // etapa 19: original sintetizado, misma sonoridad percibida
    popup:            { bus: "effects", base: 1.0 },
    button:           { bus: "effects", base: 0.324 },
    error:            { bus: "effects", base: 0.688 },
    glitch:           { bus: "effects", base: 0.373 },
    coffee:           { bus: "effects", base: 1.0 },
    stabilize:        { bus: "effects", base: 0.386 },
  };
  const IDS = Object.keys(SOUNDS);
  /*
   * Procedencia y licencia (auditoría de la etapa 19: páginas de Freesound
   * comprobadas el 13-10-2026; registro completo en assets/audio/LICENCIAS_AUDIO.md).
   * Títulos y autores tal como figuran en Freesound. `changes`: modificaciones
   * hechas para el widget (obligatorio indicarlas en CC BY). `own`: sonido original
   * sintetizado para Duck Reactor (sin grabaciones de terceros).
   * Ningún sonido incluido tiene licencia no comercial.
   */
  const FS = "https://freesound.org/s/";
  const LIC = { "CC0 1.0": "https://creativecommons.org/publicdomain/zero/1.0/", "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/" };
  const CREDITS = {
    ambience_reactor: { fs: 619320, title: "Facility Hum Ambience Loopable", author: "aSuperiorPotato", license: "CC0 1.0", changes: "Loop seam rebuilt with a 0.35 s crossfade; level adjusted; MP3." },
    ambience_lab:     { fs: 864658, title: "Dark Sci-Fi Laboratory Atmosphere – Spaceship Interior Ambience Loop", author: "TommasoMotteran", license: "CC BY 4.0", changes: "Loop seam rebuilt with a 0.5 s crossfade; level adjusted; converted to MP3." },
    caution:          { own: true, title: "Caution alert (original synthesis)", author: "form&soul.exe", license: "Original", changes: "Synthesized for Duck Reactor; no third-party recordings." },
    critical:         { fs: 512371, title: "Siren-1.aiff", author: "AsdfgOrt", license: "CC0 1.0", changes: "Short edge fades; level adjusted; mono MP3; played as a continuous loop." },
    relay:            { fs: 496328, title: "Mechanical Switch", author: "Crinkem", license: "CC0 1.0", changes: "Trimmed to a single click; level adjusted; MP3." },
    leak:             { fs: 803063, title: "AIRHiss-Samsung Galaxy Smartphone, MCU_Wagner SteamCleaner, Steam Hiss_Nicholas Judy_TDC", author: "designerschoice", license: "CC BY 4.0", changes: "Trimmed (0.30–7.60 s); fades; level adjusted; played in short enveloped bursts; converted to MP3." },
    coolant:          { fs: 744171, title: "Custom_starwars_inspired_scifi_corridor_door_sound_short_version", author: "Artninja", license: "CC BY 4.0", changes: "Trimmed to the first action (0.20–1.25 s) with a 160 ms fade-out; level adjusted; converted to MP3." },
    subscribe:        { own: true, title: "Rescue confirmation (original synthesis)", author: "form&soul.exe", license: "Original", changes: "Synthesized for Duck Reactor; no third-party recordings." },
    popup:            { fs: 872718, title: "Panel open (Sci-Fi UI SFX Free)", author: "heyheytheree", license: "CC BY 4.0", changes: "Trimmed (0–0.62 s); level adjusted; mono; converted to MP3." },
    button:           { fs: 861185, title: "mini button pressing", author: "_sinny_", license: "CC0 1.0", changes: "Trimmed; level adjusted; mono MP3." },
    error:            { fs: 713179, title: "User Interface, Beep, Error, 404, Glitch", author: "Vein_Adams", license: "CC0 1.0", changes: "Trimmed to the first buzz; level adjusted; mono MP3." },
    glitch:           { fs: 625091, title: "Glitch021.wav", author: "Zeraora", license: "CC0 1.0", changes: "0.6 s excerpt; level adjusted; mono MP3." },
    coffee:           { fs: 840725, title: "CoffeeSip_WithExhale_V01", author: "StratiAudio", license: "CC BY 4.0", changes: "Trimmed (0.45–4.45 s); level adjusted; converted to MP3." },
    stabilize:        { fs: 238373, title: "CP_Power_Down03_mid.aif", author: "stewdio2003", license: "CC0 1.0", changes: "Short excerpt with a 1 s fade-out; level adjusted; MP3." },
  };
  Object.keys(CREDITS).forEach((k) => {
    const c = CREDITS[k];
    c.url = c.own ? "" : FS + c.fs + "/";
    c.licenseUrl = LIC[c.license] || "";
    c.nc = /NC/.test(c.license); c.by = /BY/.test(c.license);
  });
  const TENSION = { NORMAL: 1, NOTICE: 1.1, ALARMED: 1.22, PANIC: 1.35 };

  // Hasta montar el gestor, los avisos no hacen nada
  DR.sound = DR.sound || { cue() {} };

  function mount(o) {
    const { store, sim, duck } = o;
    const C = () => store.cfg.audio;
    const listeners = new Set();
    let ctx = null, master = null, limiter = null;
    const bus = {};
    const buffers = {};
    let loading = null, loadError = "";
    let destroyed = false;
    let held = false; // «Detener todos los sonidos»: nada continuo vuelve hasta reanudar, reiniciar o tocar el audio

    const now = () => (ctx ? ctx.currentTime : 0);
    const enabled = () => !!(C() && C().enabled);
    const soundOn = (id) => { const s = C().sounds[id]; return !!(s && s.on); };
    // En OBS (y en el widget de StreamElements) la página puede declararse «oculta» aunque la fuente
    // se esté emitiendo: ahí no se silencia por visibilidad (opción ignoreHidden o window.obsstudio).
    const ignoreHidden = () => !!((window.DUCK_REACTOR_OPTIONS || {}).ignoreHidden || window.obsstudio);
    const visible = () => ignoreHidden() || !document.hidden;
    const running = () => !!sim.running;
    const emit = () => listeners.forEach((fn) => { try { fn(info()); } catch (e) { console.error("[duck-reactor] audio listener", e); } });

    /* Registro (comprobaciones del laboratorio y pruebas automáticas). */
    const log = [];
    const counts = {};
    const live = new Set(); // fuentes sonando
    function note(id, extra) {
      counts[id] = (counts[id] || 0) + 1;
      log.push(Object.assign({ id, t: Math.round(performance.now()), sim: +sim.state.t.toFixed(2) }, extra || {}));
      if (log.length > 200) log.splice(0, log.length - 200);
    }

    /* ------------------------------------------------ contexto y buses */
    function ensureCtx() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { loadError = "sin Web Audio"; return null; }
      ctx = new AC();
      limiter = ctx.createDynamicsCompressor(); // red de seguridad: nunca satura aunque coincidan sonidos
      limiter.threshold.value = -10; limiter.knee.value = 6; limiter.ratio.value = 12; limiter.attack.value = 0.003; limiter.release.value = 0.25;
      master = ctx.createGain();
      master.connect(limiter); limiter.connect(ctx.destination);
      ["ambience", "alarms", "effects"].forEach((k) => { bus[k] = ctx.createGain(); bus[k].connect(master); });
      applyLevels(true);
      ctx.onstatechange = () => emit();
      return ctx;
    }
    function applyLevels(instant) {
      if (!ctx) return;
      const a = C(), t = now(), tc = instant ? 0.001 : 0.08;
      master.gain.setTargetAtTime(enabled() ? a.master : 0, t, tc);
      bus.ambience.gain.setTargetAtTime(a.ambience, t, tc);
      bus.alarms.gain.setTargetAtTime(a.alarms, t, tc);
      bus.effects.gain.setTargetAtTime(a.effects, t, tc);
    }

    function b64ToBuf(dataUrl) {
      const m = /^data:[^;,]+;base64,(.*)$/.exec(dataUrl);
      const bin = atob(m[1]);
      const u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return u.buffer;
    }
    /* Decodifica los audios incrustados una sola vez (o los lee de assets/audio en el proyecto). */
    function load() {
      if (loading) return loading;
      if (!ensureCtx()) return Promise.resolve(false);
      const A = window.DR_AUDIO || {};
      loading = Promise.all(IDS.map(async (id) => {
        try {
          const raw = A[id] ? b64ToBuf(A[id]) : await (await fetch((window.DR_ASSET_BASE || "") + "assets/audio/" + id + ".mp3")).arrayBuffer();
          buffers[id] = await new Promise((res, rej) => ctx.decodeAudioData(raw, res, rej));
        } catch (e) { loadError = "no se pudo cargar " + id; console.error("[duck-reactor] audio", id, e); }
      })).then(() => { emit(); sync(); return true; });
      return loading;
    }

    /* ¿Está sonando de verdad? (contexto en marcha, audio activado y página visible) */
    const audible = () => !!(ctx && ctx.state === "running" && enabled() && visible());

    /* ------------------------------------------------ reproducción */
    function play(id, opt) {
      opt = opt || {};
      if (!opt.test && (!audible() || !soundOn(id))) return null;
      if (opt.test && !(ctx && ctx.state === "running")) return null;
      const buf = buffers[id];
      if (!buf) return null;
      const S = SOUNDS[id], vol = (C().sounds[id] || {}).vol;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      if (opt.loop) src.loop = true;
      const g = ctx.createGain();
      const at = now() + (opt.delay || 0);
      const level = S.base * (vol == null ? 1 : vol) * (opt.gain == null ? 1 : opt.gain);
      if (opt.attack) { g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(level, at + opt.attack); }
      else g.gain.setValueAtTime(level, at);
      src.connect(g); g.connect(bus[S.bus]);
      const off = Math.max(0, Math.min(buf.duration - 0.05, opt.offset || 0));
      if (opt.dur) {
        const rel = opt.release || 0.3;
        g.gain.setValueAtTime(level, at + Math.max(opt.attack || 0, opt.dur - rel));
        g.gain.linearRampToValueAtTime(0, at + opt.dur);
        src.start(at, off, opt.dur + 0.02);
      } else src.start(at, off);
      const h = { id, src, g, level, at };
      live.add(h);
      src.onended = () => { live.delete(h); try { src.disconnect(); g.disconnect(); } catch (e) { /* nada */ } };
      note(id, opt.test ? { test: true } : opt.tag ? { tag: opt.tag } : null);
      return h;
    }
    function stopHandle(h, fade) {
      if (!h || !ctx) return;
      const t = now(), f = fade == null ? 0.25 : fade;
      try {
        h.g.gain.cancelScheduledValues(t);
        h.g.gain.setValueAtTime(h.g.gain.value, t);
        h.g.gain.linearRampToValueAtTime(0, t + Math.max(0.01, f));
        h.src.stop(t + Math.max(0.02, f) + 0.02);
      } catch (e) { /* ya parado */ }
    }

    /* ------------------------------------------------ ambiente */
    let amb = null; // { id, h }
    function tension() {
      const st = sim.state, rec = sim.recovery && sim.recovery();
      return rec ? TENSION.NORMAL + 0.1 : TENSION[st.level] || 1;
    }
    function syncAmbience() {
      const want = audible() && running() && !held ? (C().ambient === "lab" ? "ambience_lab" : "ambience_reactor") : null;
      if (want && !soundOn(want)) { if (amb) { stopHandle(amb.h, 0.6); amb = null; } return; }
      if (amb && amb.id !== want) { stopHandle(amb.h, want ? 1.5 : 0.6); amb = null; }
      if (want && !amb && buffers[want]) {
        const h = play(want, { loop: true, attack: 1.2, gain: tension() });
        if (h) amb = { id: want, h, t: tension(), v: (C().sounds[want] || {}).vol };
      } else if (amb) {
        const t = tension();
        const S = SOUNDS[amb.id], vol = (C().sounds[amb.id] || {}).vol, v = vol == null ? 1 : vol;
        if (Math.abs(t - amb.t) > 0.01 || v !== amb.v) {
          const fast = v !== amb.v && Math.abs(t - amb.t) <= 0.01;
          amb.t = t; amb.v = v;
          amb.h.g.gain.setTargetAtTime(S.base * v * t, now(), fast ? 0.1 : 1.2); // transición suave
        }
      }
    }

    /* ------------------------------------------------ sirena de CRITICAL */
    // La sirena entera (sube, sostiene y baja) se repite en bucle mientras dure el
    // CRITICAL efectivo; al salir (recuperación, pausa, reinicio) se apaga con fundido.
    let alarm = { on: false, h: null };
    const criticalNow = () => sim.state.level === "PANIC" && !(sim.recovery && sim.recovery());
    function syncAlarm() {
      const want = audible() && running() && !held && soundOn("critical") && criticalNow() && !!buffers.critical;
      if (want && !alarm.on) {
        alarm.h = play("critical", { loop: true, attack: 0.05 });
        alarm.on = !!alarm.h;
      } else if (!want && alarm.on) {
        alarm.on = false;
        if (alarm.h) stopHandle(alarm.h, 1.2); // sin cortes bruscos
        alarm.h = null;
      } else if (alarm.on && alarm.h) {
        // volumen propio cambiado en el laboratorio: se aplica sin reiniciar el bucle
        const v = (C().sounds.critical || {}).vol, lv = SOUNDS.critical.base * (v == null ? 1 : v);
        if (Math.abs(lv - alarm.h.level) > 1e-4) { alarm.h.level = lv; alarm.h.g.gain.setTargetAtTime(lv, now(), 0.1); }
      }
    }

    /* ------------------------------------------------ fuga de vapor L-2 */
    let leakH = null;
    function leakBurst(d) {
      if ((!running() || held) && !d.test) return;
      if (leakH) stopHandle(leakH, 0.15);
      const buf = buffers.leak;
      if (!buf) return;
      const dur = Math.max(0.6, Math.min(4, (d.dur || 1.6) + 0.35));
      const off = Math.random() * Math.max(0, buf.duration - dur - 0.1);
      leakH = play("leak", { offset: off, dur, attack: 0.12, release: Math.min(0.8, dur * 0.45), gain: Math.max(0.15, Math.min(1.3, d.gain == null ? 1 : d.gain)), test: d.test });
    }
    function leakOff() { if (leakH) { stopHandle(leakH, 0.9); leakH = null; } }

    /* ------------------------------------------------ límites (sin repeticiones ni ráfagas) */
    const lastAt = {};
    function every(id, sec) {
      const t = performance.now();
      if (lastAt[id] && t - lastAt[id] < sec * 1000) return false;
      lastAt[id] = t;
      return true;
    }
    // al volver a una pestaña visible no se recupera nada atrasado
    let quietUntil = 0;
    const quiet = () => performance.now() < quietUntil;

    /* ------------------------------------------------ avisos de los módulos */
    function cue(name, d) {
      d = d || {};
      if (destroyed || !enabled() || quiet()) return;
      if (!d.test && !visible()) return;
      switch (name) {
        case "relay": {
          // unos pocos clics por secuencia (no uno por luz): 1 en avisos sueltos, 2–3 en las secuencias
          if (!every("relay-" + (d.kind || ""), 1)) return;
          const n = d.kind === "hint" ? 1 : d.kind === "critical" ? 3 : 2;
          const span = Math.max(0.15, Math.min(1.4, ((d.n || 4) * (d.step || 110)) / 1000));
          for (let i = 0; i < n; i++) play("relay", { delay: n === 1 ? 0 : (span * i) / (n - 1), gain: 0.85 + Math.random() * 0.25 });
          return;
        }
        case "leak": return leakBurst(d);
        case "leakOff": return leakOff();
        case "coolant":
          // una vez por evento agrupado
          if (every("coolant", Math.max(1.5, (store.cfg.chat.coolant.group || 3)))) play("coolant");
          return;
        case "subscribe":
          // confirmación y, si es un rescate nuevo, el refrigerante entrando justo después
          if (d.preview) { if (every("subscribe", 1.2)) play("subscribe"); return; }
          if (every("subscribe", d.grouped ? 3 : 1.2)) {
            play("subscribe");
            if (!d.grouped) { lastAt.coolant = performance.now(); play("coolant", { delay: 0.55, gain: 0.85 }); }
          }
          return;
        case "guion": {
          const s = d.step;
          if (s === 1 || (d.id === "corp" && s === 2)) { if (every("popup", 0.8)) play("popup"); }
          else if ((d.id === "asis" || d.id === "corp") && s === 4) play("button");
          else if (d.id === "asis" && s === 6) play("error");
          return;
        }
        case "popup": if (every("popup", 1.2)) play("popup"); return;
        case "button": if (every("button", 0.25)) play("button"); return;
        case "error": if (every("error", 1)) play("error"); return;
        case "glitch": if (every("glitch", 4)) play("glitch"); return;
      }
    }

    /* ------------------------------------------------ estados del simulador */
    let lastRunning = running(), hadCrisis = sim.state.level === "PANIC";
    sim.on((type, data) => {
      if (destroyed) return;
      if (type === "level") {
        if (data.to === "PANIC") hadCrisis = true;
        // CAUTION: una vez al entrar desde la normalidad (la histéresis del simulador ya evita el vaivén)
        if (data.to === "NOTICE" && data.from === "NORMAL" && running() && audible() && every("caution", 30)) play("caution");
        if (data.to === "NORMAL" && hadCrisis) {
          hadCrisis = false;
          if (running() && every("stabilize", 20)) play("stabilize", { delay: 0.4 });
        }
        syncAlarm(); syncAmbience();
        return;
      }
      if (type === "recovery") { syncAlarm(); syncAmbience(); return; }
      if (type === "reset") { stopAll(); held = false; hadCrisis = sim.state.level === "PANIC"; sync(); return; }
      if (running() !== lastRunning) {
        lastRunning = running();
        if (!lastRunning) { // pausa: se calla lo continuo; lo puntual termina natural
          if (amb) { stopHandle(amb.h, 0.4); amb = null; }
          leakOff();
          syncAlarm();
        } else { held = false; sync(); }
      }
    });

    /* Café: un sorbo por episodio de COFFEE, cuando la taza ya está en la mano. */
    let coffeeEp = false, coffeeTimer = 0;
    duck.onChange(() => {
      const isCoffee = duck.pose === "COFFEE" || duck.gagPose === "COFFEE"; // pose de COFFEE o remate de café tras la crisis
      const r = String(duck.reason || "");
      const inspecting = r === "prueba" || r === "inspección de fotograma"; // inspección de sprites: sin sonido
      if (isCoffee && !coffeeEp && !inspecting) {
        coffeeEp = true;
        clearTimeout(coffeeTimer);
        coffeeTimer = setTimeout(() => { if ((duck.pose === "COFFEE" || duck.gagPose === "COFFEE") && every("coffee", 8)) play("coffee"); }, 800);
      } else if (!isCoffee) { coffeeEp = false; clearTimeout(coffeeTimer); }
    });

    /* Página oculta (OBS sin mostrar la fuente, otra pestaña): se suspende y no se acumula nada. */
    function onVis() {
      if (!ctx || ignoreHidden()) return;
      if (document.hidden) { stopAll(0); try { ctx.suspend(); } catch (e) { /* nada */ } } // corte seco: al volver no queda ningún resto
      else {
        quietUntil = performance.now() + 600;
        if (enabled()) ctx.resume().then(sync, sync);
      }
      emit();
    }
    document.addEventListener("visibilitychange", onVis);

    /* Primer gesto en la página: si el navegador bloqueó el audio, se reanuda. */
    function unlockGesture() { if (enabled() && (!ctx || ctx.state !== "running") && visible()) resume(); }
    window.addEventListener("pointerdown", unlockGesture, true);
    window.addEventListener("keydown", unlockGesture, true);

    function stopAll(fade) {
      const f = fade == null ? 0.12 : fade;
      live.forEach((h) => {
        if (f > 0) { stopHandle(h, f); return; }
        try { h.g.gain.cancelScheduledValues(now()); h.g.gain.setValueAtTime(0, now()); h.src.stop(); } catch (e) { /* ya parado */ }
        live.delete(h);
      });
      amb = null; leakH = null;
      alarm.on = false; alarm.h = null;
      clearTimeout(coffeeTimer);
    }
    function sync() {
      if (!ctx) return;
      applyLevels();
      if (!audible()) { if (amb) { stopHandle(amb.h, 0.3); amb = null; } syncAlarm(); return; }
      syncAmbience(); syncAlarm();
    }
    function resume() {
      if (!ensureCtx()) return Promise.resolve(false);
      return ctx.resume().then(() => load()).then(() => { sync(); emit(); return ctx.state === "running"; }, () => { emit(); return false; });
    }

    /* Configuración: al activar se intenta arrancar; al desactivar, silencio inmediato. */
    let wasEnabled = enabled();
    store.on((paths) => {
      if (destroyed) return;
      const all = paths.includes("*");
      if (!all && !paths.some((p) => p === "audio" || p.startsWith("audio."))) return;
      held = false;
      if (enabled() && !wasEnabled) { wasEnabled = true; resume(); }
      else if (!enabled() && wasEnabled) {
        wasEnabled = false;
        if (ctx) { master.gain.cancelScheduledValues(now()); master.gain.setValueAtTime(0, now()); stopAll(); }
      }
      if (all && ctx) stopAll(); // preset, importación, demostración: se reconstruye sólo el ambiente que toca
      sync(); emit();
    });

    // ajustes guardados con el audio activado: se intenta al cargar y se reintenta unas veces
    // (algunos navegadores, y fuentes de navegador como la de OBS, no lo dejan arrancar hasta
    // que la página termina de cargar); si el navegador exige un gesto, el estado lo dice
    let retries = 0;
    function startTry() {
      if (destroyed || !enabled() || (ctx && ctx.state === "running")) return;
      resume();
      if (++retries < 6) setTimeout(startTry, 700 * retries);
    }
    if (enabled()) {
      if (document.readyState === "complete") startTry();
      else window.addEventListener("load", startTry, { once: true });
    }

    function info() {
      const st = !enabled() ? "off" : !visible() ? "hidden" : !ctx ? "pending" : ctx.state === "running" ? "running" : "blocked";
      return {
        state: st, ctxState: ctx ? ctx.state : "none", loaded: Object.keys(buffers).length, total: IDS.length, error: loadError,
        ambience: amb ? amb.id : null, alarm: alarm.on, held, playing: [...live].map((h) => h.id), counts: Object.assign({}, counts),
      };
    }

    const api = {
      IDS, SOUNDS, CREDITS, cue,
      info, log: () => log.slice(), clearLog() { log.length = 0; Object.keys(counts).forEach((k) => delete counts[k]); },
      /* Activar desde un gesto (botón del laboratorio). */
      unlock: resume,
      /* Probar un sonido suelto (también con el simulador en pausa). */
      test(id) {
        if (!enabled()) return { ok: false, reason: "audio desactivado" };
        if (!ctx || ctx.state !== "running") { resume(); return { ok: false, reason: "bloqueado por el navegador" }; }
        if (!buffers[id]) return { ok: false, reason: "sin cargar" };
        if (id === "leak") { leakBurst({ dur: 1.8, test: true }); return { ok: true }; }
        const S = SOUNDS[id];
        const long = S.loop || S.loopFull; // prueba de 6–8 s con fundido, no el bucle entero
        const h = play(id, { test: true, dur: S.loop ? 6 : S.loopFull ? 8 : 0, attack: S.loop ? 0.6 : 0, release: long ? 1.2 : 0 });
        return h ? { ok: true } : { ok: false, reason: "no se pudo" };
      },
      stopAll() { held = true; stopAll(); emit(); },
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      debug: () => ({ audioLive: live.size, audioAmb: amb ? 1 : 0, audioAlarm: alarm.on ? 1 : 0 }),
      destroy() {
        destroyed = true; stopAll();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("pointerdown", unlockGesture, true);
        window.removeEventListener("keydown", unlockGesture, true);
        if (ctx) ctx.close();
      },
    };
    DR.sound = api;
    return api;
  }

  window.DuckReactorAudio = { mount, IDS: Object.keys(SOUNDS), SOUNDS, CREDITS };
})();

;
/* ---- src/demo.js ---- */
/*
 * Duck Reactor — «Demostración en vivo» (etapa 11).
 *
 * Una prueba narrativa que coordina pato, pantallas, temperatura, avisos e
 * iluminación desde UN único estado de demostración. No cambia sprites ni
 * mensajes a mano: escribe un guion de TEMPERATURA para el simulador
 * (sim.setDriver) y todo lo demás sale de las reglas de siempre (umbrales,
 * histéresis, retardos de nivel y de reacción del pato, avisos por nivel,
 * luces, luz de emergencia, aleteo y gags).
 *
 *   1 IDLE      normalidad          temperatura base estable
 *   2 COFFEE    falsa seguridad     café (comportamiento independiente) + aviso menor
 *   3 NOTICE    comienza el suspenso  sube por encima de NOTICE · luz ámbar
 *   4 ALARMED   se confirma         sube por encima de ALARMED · avisos · rojo tenue
 *   5 PANIC     culminación         por encima de PANIC · luz de emergencia · aleteo
 *                                   (se mantiene hasta «Simular suscriptor…» o «Finalizar crisis»)
 *   6 alivio    el reactor se enfría y baja de nivel paso a paso · café al estar seguro
 *   7 fin
 * Las pausas se acortan de etapa en etapa para subir la tensión.
 *
 * Sesión temporal: al iniciar se guarda la configuración y el estado del
 * simulador; durante la demostración no se guarda nada en el navegador ni en
 * los presets; al salir se restauran ambos y se cancelan sus gags y eventos.
 * Sólo se conservan los ajustes propios de la demostración (duraciones, etc.).
 *
 * window.DuckReactorDemo.mount({ store, sim, duck, gags, stream, emergency, getLights }) → {
 *   start(stage?), pause(), resume(), restart(), exit(), jumpTo(stage), rescue(), finish(),
 *   info(), onChange(fn), active, STAGES
 * }
 */
(function () {
  "use strict";

  const STAGES = [
    { id: "calm", pose: "IDLE", title: "Normalidad", desc: "Temperatura estable, pantallas NOMINAL y luces cálidas tranquilas." },
    { id: "coffee", pose: "COFFEE", title: "Falsa seguridad", desc: "El pato toma café y sale un aviso menor; el reactor sigue normal." },
    { id: "notice", pose: "NOTICE", title: "Comienza el suspenso", desc: "La temperatura se desvía, la curva sube, CAUTION y una luz ámbar." },
    { id: "alarmed", pose: "ALARMED", title: "El problema se confirma", desc: "Peor tendencia, ALARM, avisos urgentes y un rojo tenue." },
    { id: "panic", pose: "PANIC", title: "Crisis", desc: "CRITICAL: luz de emergencia y aleteo continuo. Espera un rescate." },
    { id: "relief", pose: "COFFEE", title: "Alivio", desc: "Se enfría: el nivel baja paso a paso, vuelve la luz normal y café cuando es seguro." },
    { id: "end", pose: "IDLE", title: "Fin", desc: "Demostración completada. Reinicia o sal para volver a tu sesión." },
  ];
  const LV = { NORMAL: 0, NOTICE: 1, ALARMED: 2, PANIC: 3 };
  const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

  function mount(app) {
    const { store, sim, duck, gags, stream, emergency, getLights } = app;
    const C = () => store.cfg;
    const D = () => C().demo;
    const listeners = new Set();
    let active = false, paused = false, stage = -1, tS = 0, mode = null, rebased = false, session = null;
    let seg = null; // tramo del guion: { t0, dur, from, to }
    let ffwd = false;

    /* ---- guion de temperatura ---- */
    function profileAt(t) {
      if (!seg) return C().sim.base.temp;
      const k = seg.dur > 0 ? smooth((t - seg.t0) / seg.dur) : 1;
      return seg.from + (seg.to - seg.from) * k;
    }
    const driver = { temp: (t) => profileAt(t) };
    function rampTo(to, dur) { const t = sim.state.t; seg = { t0: t, dur: Math.max(0, dur), from: profileAt(t), to }; }
    function targets() {
      const th = C().sim.thresholds, base = C().sim.base.temp;
      return {
        base,
        notice: th.notice + Math.max(18, (th.alarmed - th.notice) * 0.35),
        alarmed: th.alarmed + Math.max(20, (th.panic - th.alarmed) * 0.4),
        panic: th.panic + 50,
      };
    }

    /*
     * Ritmo de bajada compatible con los retardos de recuperación: el nivel baja
     * de uno en uno cuando la temperatura lleva `recoverDelay` s por debajo del
     * umbral, así que si se enfría demasiado deprisa la pantalla diría CRITICAL
     * con lecturas de NOTICE. Se limita la velocidad para que nunca pase.
     */
    function safeRate() {
      const th = C().sim.thresholds;
      const band = Math.min(th.alarmed - th.notice, th.panic - th.alarmed);
      return Math.max(2, (0.7 * band) / Math.max(0.5, th.recoverDelay));
    }

    const emit = () => listeners.forEach((fn) => { try { fn(info()); } catch (e) { console.error("[duck-reactor] demo listener", e); } });

    /* ---- etapas ---- */
    function enter(i) {
      stage = i;
      tS = sim.state.t;
      const id = STAGES[i].id, T = targets(), d = D();
      if (id === "calm") seg = { t0: tS, dur: 0, from: T.base, to: T.base };
      if (id === "coffee") {
        duck.coffeeNow();         // comportamiento independiente: no es un nivel de alarma
        gags.run("coffee");       // aviso menor (franja): el reactor sigue normal
      }
      if (id === "notice") rampTo(T.notice, Math.min(4.5, d.notice * 0.45));
      if (id === "alarmed") rampTo(T.alarmed, Math.min(3, d.alarmed * 0.4));
      if (id === "panic") rampTo(T.panic, 2);
      emit();
    }

    function tick() {
      if (!active) return;
      const e = sim.state.t - tS, d = D(), lv = LV[sim.state.level];
      const id = stage >= 0 ? STAGES[stage].id : null;
      if (id === "calm" && e >= d.calm) enter(1);
      else if (id === "coffee" && e >= d.coffee) enter(2);
      else if (id === "notice" && e >= d.notice && lv >= 1) enter(3);
      else if (id === "alarmed" && e >= d.alarmed && lv >= 2) enter(4);
      else if (id === "relief") {
        // tras el enfriamiento del suscriptor, el guion pasa a la temperatura real
        // (sin salto) y sigue bajando suave hasta la normal
        if (mode === "rescue" && !rebased && sim.cooling.left < 0.5 && e > 0.5) {
          const T = profileAt(sim.state.t) + sim.demoOffset;
          sim.demoOffset = 0;
          seg = { t0: sim.state.t, dur: Math.max(4, d.recovery * 0.6, (1.5 * Math.max(0, T - targets().base)) / safeRate()), from: T, to: targets().base };
          rebased = true;
        }
        const g = gags.info();
        const busy = (g.active && (g.active.id === "rescue" || gags.CHAT.includes(g.active.id))) || g.pendingRescue || duck.pose === "COFFEE";
        if (lv === 0 && !busy && e > 4) enter(6);
      }
      if (!ffwd) emit();
    }

    const offSim = sim.on((type, data) => {
      if (!active) return;
      const relays = C().life && C().life.enabled && C().life.relays.enabled; // los relés ya marcan cada subida
      if (type === "level" && !ffwd && !relays) {
        const L = getLights && getLights();
        if (data.to === "NOTICE" && data.from === "NORMAL" && L && L.flash) L.flash("amber"); // reclama atención
        if (data.to === "ALARMED" && data.from === "NOTICE" && L && L.flash) L.flash("red");
      }
      if (type === "update" || type === "level") tick();
    });

    /* ---- sesión temporal ---- */
    const OVERRIDES = () => [
      ["behavior.mode", "auto"], ["behavior.coffee.auto", false],
      ["behavior.flap.enabled", true], ["behavior.flap.continuous", true],
      ["memes.enabled", true], ["chat.enabled", true], ["chat.coffeeAfterCrisis", true],
      ["stream.subscriber.enabled", true], ["emergency.enabled", true], ["emergency.alarm", D().alarmGlow],
      ["catalog.popups.enabled", true],
    ];
    function openSession() {
      if (active) return;
      session = { config: store.snapshot(), sim: sim.snapshot() };
      active = true;
      gags.stop();
      emergency.test(false);
      emergency.setCompare(null);
      duck.inspectFrame(null);
      store.setMany(OVERRIDES(), { source: "demo" });
      gags.setDemo(true);
      sim.setDriver(driver);
    }

    function start(at) {
      openSession();
      paused = false; mode = null; rebased = false;
      gags.stop();
      sim.setSpeedOverride(D().speed);
      seg = null;
      sim.reset();               // historial plano en la temperatura base y nivel normal
      enter(0);
      if (at > 0) jumpFast(at);
      sim.play();
      emit();
    }

    /* Avanza el guion con la simulación (sin esperar) hasta el comienzo de la etapa `at`. */
    function jumpFast(at) {
      ffwd = true;
      let guard = 0;
      try {
        while (stage < at && guard++ < 2000) sim.step(0.5);
      } finally { ffwd = false; }
      // lo que haya quedado a medias de las etapas saltadas no se arrastra
      if (gags.info().active && gags.info().active.source === "demo") gags.stop();
      emit();
    }

    function pause() { if (!active || paused) return; paused = true; sim.pause(); emit(); }
    function resume() { if (!active || !paused) return; paused = false; sim.play(); emit(); }

    /* Rescate: un suscriptor de verdad por la entrada única (enfría el simulador). */
    function rescue() {
      if (!active || stage < 2 || stage > 4) return false;
      const name = (D().subscriber || "").trim() || (() => { const m = C().memes; return (m.texts[m.lang] || m.texts.en).demoSponsor || "SPONSOR"; })();
      // el enfriamiento del suscriptor, repartido a un ritmo que los niveles puedan seguir
      const S = C().stream.subscriber, secs = Math.max(S.coolSeconds, S.drop / safeRate());
      if (secs !== S.coolSeconds) store.set("stream.subscriber.coolSeconds", Math.min(60, Math.round(secs * 10) / 10), { source: "demo" });
      stream.event({ type: "subscriber", name, source: "demo" });
      mode = "rescue"; rebased = false;
      stage = 5; tS = sim.state.t;
      emit();
      return true;
    }
    /* Finalizar crisis sin rescate: el reactor se enfría poco a poco hasta la normal. */
    function finish() {
      if (!active || stage < 2 || stage > 4) return false;
      mode = "finish";
      const dT = Math.max(0, profileAt(sim.state.t) - targets().base);
      rampTo(targets().base, Math.max(4, D().recovery, (1.5 * dT) / safeRate())); // la rampa suave llega a 1,5× la media
      stage = 5; tS = sim.state.t;
      emit();
      return true;
    }

    function exit() {
      if (!active) return;
      const keep = JSON.parse(JSON.stringify(C().demo));
      gags.stop();
      gags.setDemo(false);
      sim.setDriver(null);
      sim.setSpeedOverride(null);
      const getL = getLights && getLights();
      if (getL && getL.stopFlash) getL.stopFlash();
      active = false; paused = false; stage = -1; seg = null; mode = null;
      const cfg = session.config;
      cfg.demo = keep;                         // los ajustes de la demostración sí se quedan
      cfg.audio = JSON.parse(JSON.stringify(C().audio)); // y los del audio (etapa 16)
      store.replace(cfg, { source: "demo" });  // tu configuración, tal cual estaba
      sim.restore(session.sim);                // y el simulador donde estaba (lecturas, nivel, reloj, pausa)
      session = null;
      emit();
    }

    function info() {
      const s = STAGES[stage] || null;
      return {
        active, paused, stage, n: stage + 1, total: 5,
        id: s ? s.id : null, title: s ? s.title : null, desc: s ? s.desc : null, pose: s ? s.pose : null,
        elapsed: active ? sim.state.t - tS : 0, speed: sim.speed, mode,
        canRescue: active && stage >= 2 && stage <= 4, level: sim.state.level, temp: sim.state.temp,
        scripted: active ? Math.round(profileAt(sim.state.t)) : null,
      };
    }

    return {
      STAGES,
      start: (at) => start(at || 0),
      restart: () => start(0),
      jumpTo: (i) => start(Math.max(0, Math.min(4, i | 0))),
      pause, resume, rescue, finish, exit, info,
      setSpeed(x) { if (active) sim.setSpeedOverride(x); emit(); },
      setAlarmGlow(v) { if (active) store.set("emergency.alarm", v, { source: "demo" }); },
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      get active() { return active; },
      /* Configuración del usuario aunque haya una demostración en curso (para guardar/exportar). */
      userConfig() {
        if (!active) return store.snapshot();
        const c = JSON.parse(JSON.stringify(session.config));
        c.demo = JSON.parse(JSON.stringify(C().demo));
        c.audio = JSON.parse(JSON.stringify(C().audio));
        return c;
      },
      destroy() { offSim(); listeners.clear(); },
    };
  }

  window.DuckReactorDemo = { mount, STAGES };
})();

;
/* ---- src/main.js ---- */
/*
 * Duck Reactor — arranque (etapa 5).
 * Configuración (store) → estado (sim) → render (escena, pantallas, luces, pato).
 * Independiente del laboratorio: sirve tal cual para el widget final.
 *
 * Opciones (antes de cargar este script):
 *   window.DUCK_REACTOR_OPTIONS = { useSaved: true,    // cargar los ajustes guardados del laboratorio
 *                                   startLang: "en" }  // idioma inicial de esta copia (una vez)
 *
 * window.duckReactor = { store, sim, scene, duck, screens, lights, persist, ... }
 */
(function () {
  "use strict";
  const DR = window.DR;
  const opts = window.DUCK_REACTOR_OPTIONS || {};
  const store = DR.createStore(window.DUCK_REACTOR_CONFIG);
  const persist = DR.createPersist();
  let loadNotes = null;
  if (opts.useSaved && persist.loadCurrent()) {
    loadNotes = store.replace(persist.loadCurrent(), { source: "load" });
  }

  /*
   * Idioma de partida de esta copia del HTML (opción startLang): se aplica una
   * sola vez aunque haya ajustes guardados en otro idioma; después manda lo que
   * el usuario elija en el selector (se guarda como siempre).
   */
  if (opts.startLang && DR.schema.LANGS.includes(opts.startLang)) {
    let mark = null;
    try { mark = window.localStorage.getItem("duckReactor.startLang"); } catch (e) { /* sin almacenamiento */ }
    if (mark !== opts.startLang) {
      if (store.cfg.memes.lang !== opts.startLang) {
        store.set("memes.lang", opts.startLang, { source: "load" });
        if (persist.loadCurrent()) persist.saveCurrent(store.snapshot());
      }
      try { window.localStorage.setItem("duckReactor.startLang", opts.startLang); } catch (e) { /* nada */ }
    }
  }

  // Idioma del widget y del laboratorio (etapa 15): un único ajuste, memes.lang
  if (DR.i18n) {
    DR.i18n.setLang(store.cfg.memes.lang);
    store.on(() => { if (store.cfg.memes.lang !== DR.i18n.lang) DR.i18n.setLang(store.cfg.memes.lang); });
  }

  const scene = window.DuckReactorScene.create(document.getElementById("scene"), store);
  const sim = DR.createSim(store);
  let screens = window.DuckReactorScreens.mount(scene, store, sim);
  let lights = window.DuckReactorLights.mount(scene, store, sim);
  const duck = window.DuckReactorDuck.mount(scene, store, sim);
  // Catálogo de memes con memoria (etapa 12): ventanas de crisis y frases de suscripción
  const catalog = window.DuckReactorCatalog.create(store);
  const gags = window.DuckReactorGags.mount(scene, store, sim, duck, () => screens, () => lights, catalog);
  // Luz de emergencia durante CRITICAL (capas no destructivas)
  const emergency = window.DuckReactorEmergency.mount(scene, store, sim, () => lights);
  // Única entrada de eventos del stream (prueba y futura integración real)
  const stream = window.DuckReactorStream.mount(store, sim, gags);
  // Ciclo automático opcional (etapa 18): el reactor se calienta solo tras un rato de calma
  const cycle = window.DuckReactorCycle ? window.DuckReactorCycle.mount({ store, sim }) : null;
  // Vida ambiental (etapa 13): vapor del café, fuga en la junta y relés
  const life = window.DuckReactorAmbient.mount({ scene, store, sim, stream, duck, gags, getLights: () => lights, getScreens: () => screens });
  // Demostración en vivo: guion narrativo en una sesión temporal
  const demo = window.DuckReactorDemo.mount({ store, sim, duck, gags, stream, emergency, getLights: () => lights });
  // Audio (etapa 16): un único gestor; los módulos avisan con DR.sound.cue(...)
  const audio = window.DuckReactorAudio ? window.DuckReactorAudio.mount({ store, sim, duck, gags, scene }) : null;

  const reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const reducedMotion = () => !!(reduce && reduce.matches);

  /* Tratamiento CRT → variables CSS (sin reconstruir nada). */
  function applyCrt() {
    const c = store.cfg.crt, U = DR.util, s = scene.stage.style;
    s.setProperty("--phos", U.hexToRgb(c.phosphor));
    s.setProperty("--phos-hot", U.mixWithWhite(c.phosphor, 0.45));
    s.setProperty("--ok", U.hexToRgb(c.ok));
    s.setProperty("--warn", U.hexToRgb(c.warn));
    s.setProperty("--crt-bright", c.brightness);
    s.setProperty("--glow", c.glow);
    s.setProperty("--scan-a", c.scanlines);
    s.setProperty("--scan-gap", c.scanSpacing + "px");
    s.setProperty("--roll-a", c.roll);
    s.setProperty("--roll-dur", c.rollPeriod + "s");
    s.setProperty("--flick-min", (1 - c.flicker).toFixed(3));
    s.setProperty("--flick-mid", (1 - c.flicker * 0.6).toFixed(3));
    s.setProperty("--cursor-blink", c.cursorBlink + "s");
    scene.stage.classList.toggle("no-cursor", !c.cursor);
  }

  /* Animaciones decorativas: independientes de pausar la simulación. */
  function applyMotion() {
    const on = store.cfg.motion.decor && !reducedMotion();
    scene.stage.classList.toggle("dr-still", !on);
    screens.setDecor(on);
    lights.setDecor(on);
    duck.setDecor(on);
    gags.setDecor(on);
    emergency.setDecor(on);
    life.setDecor(on);
    return on;
  }
  if (reduce && reduce.addEventListener) reduce.addEventListener("change", applyMotion);

  /* Cada cambio de configuración actualiza sólo lo necesario. */
  store.on((paths) => {
    if (paths.includes("*")) {
      scene.rebuild();
      screens.destroy();
      lights.destroy();
      screens = window.DuckReactorScreens.mount(scene, store, sim);
      lights = window.DuckReactorLights.mount(scene, store, sim);
      applyCrt();
      applyMotion();
      duck.update();
      return;
    }
    let relayout = false, texts = false, crt = false, all = false, globals = false, matrix = false, ambient = false, motion = false, render = false, display = false;
    const items = new Set();
    for (const p of paths) {
      if (/^(duck|shadow|grade)(\.|$)/.test(p)) relayout = true;
      else if (/^screens\.([^.]+)\.quad/.test(p)) scene.updateScreen(p.split(".")[1]);
      else if (/^content(\.|$)/.test(p)) texts = true;
      else if (/^crt(\.|$)/.test(p)) crt = true;
      else if (/^lights\.items\.(\d+)/.test(p)) items.add(+p.split(".")[2]);
      else if (p === "lights.items" || /^lights\.(groups)(\.|$)/.test(p)) all = true;
      else if (/^lights\.colors(\.|$)/.test(p)) { all = true; matrix = true; }
      else if (/^lights\.(intensity|halo|reflection)$/.test(p)) globals = true;
      else if (/^lights\.(matrix|bar)(\.|$)/.test(p)) matrix = true;
      else if (/^ambient\.(ceiling\.(intensity|breathe)|spill\.intensity)$/.test(p)) globals = true;
      else if (/^ambient(\.|$)/.test(p)) ambient = true;
      else if (/^motion(\.|$)/.test(p)) motion = true;
      else if (/^sim\.thresholds/.test(p)) render = true;
      else if (/^display(\.|$)/.test(p)) display = true;
      else if (/^memes\.(lang|texts)(\.|$)/.test(p)) texts = true;
    }
    if (relayout) scene.relayout();
    if (texts) screens.applyTexts();
    if (crt) applyCrt();
    if (all) lights.applyAll(); else items.forEach((i) => lights.applyItem(i));
    if (globals) lights.applyGlobals();
    if (matrix) lights.rebuildMatrix();
    if (ambient) lights.rebuildAmbient();
    if (motion) applyMotion();
    if (render) screens.render(true);
    if (display) screens.applyDisplay();
  });

  applyCrt();
  applyMotion();

  window.duckReactor = {
    store, sim, scene, duck, gags, stream, emergency, demo, persist, loadNotes, catalog, life, audio, cycle,
    get screens() { return screens; },
    get lights() { return lights; },
    applyMotion, reducedMotion,
    /* Recuentos para comprobar que no se duplican suscripciones ni temporizadores. */
    debug: () => Object.assign({ storeListeners: store.listenerCount(), simListeners: sim.listenerCount(), flapActive: duck.flapInfo().active ? 1 : 0,
      gagPose: duck.gagPose || null, stageActive: document.querySelector(".stg:not([hidden])") ? 1 : 0 }, lights.debug(), screens.debug(), gags.debug(), emergency.debug(), life.debug(), audio ? audio.debug() : {}),
  };
  // Etapa 21: aviso para integraciones (widget de StreamElements) de que el motor ya está montado
  try { window.dispatchEvent(new Event("duckreactor:ready")); } catch (e) { /* nada */ }
})();

;
  }
})();
