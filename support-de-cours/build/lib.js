// Bibliothèque de mise en page pour le support de cours Docker (pptxgenjs).
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const THEME = {
  name: "Docker Formation",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0B1B33", lt1: "FFFFFF", dk2: "0B2545", lt2: "EEF3F8",
    accent1: "0F9ED5", accent2: "FF8A3D", accent3: "1FB58F",
    accent4: "7C5CFF", accent5: "E5484D", accent6: "FFC53D",
    hlink: "0F9ED5", folHlink: "7C5CFF",
  },
};

const AUTHOR = "NZEMBOUONG Patrick";
const AUTHOR_ROLE = "Ingénieur DevOps Kubernetes";
const DECK_TITLE = "Docker, du débutant à l'expert";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = AUTHOR;
pres.title = DECK_TITLE;
pres.subject = "Formation Docker complète : conteneurs, images, Compose, sécurité, CI/CD, orchestration";
const C = pres.SchemeColor;
const SHAPE = pres.ShapeType;

// ---------- icônes ----------
const iconCache = {};
async function loadIcons(names) {
  for (const n of [...new Set(names)]) {
    const Comp = fa[n];
    if (!Comp) throw new Error("Icône inconnue: " + n);
    const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#FFFFFF", size: "256" }));
    const buf = await sharp(Buffer.from(svg)).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    iconCache[n] = "image/png;base64," + buf.toString("base64");
  }
}
const ICON_ALT = {"FaBalanceScale": "balance", "FaBolt": "éclair", "FaBook": "livre", "FaBoxOpen": "boîte ouverte", "FaBoxes": "boîtes empilées", "FaBug": "bogue", "FaCertificate": "certificat", "FaChartLine": "courbe de métriques", "FaCheckCircle": "coche de validation", "FaCloud": "nuage", "FaCodeBranch": "branches de code", "FaCopy": "copie", "FaCube": "cube", "FaDatabase": "base de données", "FaDesktop": "ordinateur", "FaExclamationTriangle": "avertissement", "FaExpandArrowsAlt": "flèches d'agrandissement", "FaEye": "œil", "FaFileAlt": "document", "FaFileCode": "fichier de code", "FaFilter": "filtre", "FaFlask": "fiole de labo", "FaFolderOpen": "dossier ouvert", "FaGlobe": "globe", "FaGraduationCap": "toque de diplômé", "FaHeartbeat": "battement de santé", "FaKey": "clé", "FaLayerGroup": "couches", "FaLightbulb": "ampoule", "FaLock": "cadenas", "FaMemory": "mémoire", "FaMicrochip": "puce", "FaNetworkWired": "réseau", "FaPlay": "lecture", "FaProjectDiagram": "diagramme", "FaRocket": "fusée", "FaRoute": "itinéraire", "FaSearch": "loupe", "FaServer": "serveur", "FaShieldAlt": "bouclier", "FaSitemap": "arborescence", "FaSkullCrossbones": "tête de mort", "FaSlidersH": "curseurs", "FaSyncAlt": "flèches de synchronisation", "FaTachometerAlt": "compteur", "FaTag": "étiquette", "FaTerminal": "terminal", "FaTimesCircle": "croix", "FaToggleOn": "interrupteur", "FaTrash": "corbeille", "FaUnlock": "cadenas ouvert", "FaUpload": "envoi", "FaUserShield": "utilisateur protégé", "FaUsers": "personnes", "FaVial": "éprouvette"};
const ico = (n) => {
  if (!iconCache[n]) throw new Error("Icône non préchargée: " + n);
  return iconCache[n];
};

const onFill = (f) => (f === C.accent6 ? C.text2 : C.background1);
const shadow = () => ({ type: "outer", color: "000000", blur: 6, offset: 2, angle: 90, opacity: 0.12 });

// ---------- layouts ----------
function defineLayouts() {
  const containers = (x0, y0, sz, gap) => {
    const cols = [C.accent1, C.accent2, C.accent3, C.accent4, C.accent6, C.accent1];
    const objs = [];
    const grid = [
      [0, 2, 0], [1, 2, 1], [2, 2, 2],
      [0, 1, 3], [1, 1, 4],
      [0, 0, 5],
    ];
    grid.forEach(([cx, cy, ci]) => {
      objs.push({
        rect: {
          x: x0 + cx * (sz + gap), y: y0 + cy * (sz * 0.6 + gap), w: sz, h: sz * 0.6,
          fill: { color: cols[ci], transparency: ci % 2 ? 0 : 15 },
        },
      });
    });
    return objs;
  };

  pres.defineSlideMaster({
    title: "TITLE",
    objects: [
      { rect: { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.text2 } } },
      ...containers(6.55, 3.0, 0.95, 0.12),
      { text: { text: DECK_TITLE + " · " + AUTHOR, options: { x: 0.7, y: 5.15, w: 7, h: 0.3, fontSize: 10, color: C.background2, margin: 0 } } },
      {
        placeholder: {
          options: { name: "title", type: "title", x: 0.7, y: 1.0, w: 5.7, h: 1.8, fontSize: 40, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 },
          text: "",
        },
      },
      {
        placeholder: {
          options: { name: "subtitle", type: "body", x: 0.7, y: 2.95, w: 5.8, h: 0.9, fontSize: 20, color: C.accent1, valign: "top", margin: 0 },
          text: "",
        },
      },
    ],
  });

  pres.defineSlideMaster({
    title: "SECTION",
    objects: [
      { rect: { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.text2 } } },
      ...containers(7.2, 3.35, 0.7, 0.1),
      { text: { text: DECK_TITLE + " · " + AUTHOR, options: { x: 0.9, y: 5.15, w: 7, h: 0.3, fontSize: 10, color: C.background2, margin: 0 } } },
      {
        placeholder: {
          options: { name: "title", type: "title", x: 0.9, y: 1.9, w: 6.4, h: 1.3, fontSize: 38, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 },
          text: "",
        },
      },
      {
        placeholder: {
          options: { name: "subtitle", type: "body", x: 0.9, y: 3.3, w: 6.0, h: 1.1, fontSize: 18, color: C.background2, valign: "top", margin: 0 },
          text: "",
        },
      },
    ],
  });

}

// Layout CONTENT avec placeholder de titre (défini séparément pour garder les objets lisibles)
function defineContentWithTitle() {
  pres.defineSlideMaster({
    title: "CONTENT_T",
    objects: [
      {
        placeholder: {
          options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9.0, h: 0.8, fontSize: 30, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 },
          text: "",
        },
      },
      { text: { text: DECK_TITLE + " · " + AUTHOR, options: { x: 0.5, y: 5.22, w: 7.5, h: 0.3, fontSize: 10, color: C.text2, margin: 0 } } },
    ],
    slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.3, fontSize: 10, color: C.text2, align: "right" },
  });
}

function setup() {
  defineLayouts();
  defineContentWithTitle();
}

// ---------- slides ----------
let sectionNo = 0;
let currentSection = "Introduction";
function newSection(title) {
  currentSection = title;
  pres.addSection({ title });
}

function titleSlide(title, subtitle, extra) {
  const s = pres.addSlide({ masterName: "TITLE", sectionTitle: currentSection });
  s.addText(title, { placeholder: "title" });
  s.addText(subtitle, { placeholder: "subtitle" });
  if (extra) extra(s);
  return s;
}

function sectionSlide(num, title, subtitle, notes) {
  sectionNo = num;
  const s = pres.addSlide({ masterName: "SECTION", sectionTitle: currentSection });
  s.addText(String(num).padStart(2, "0"), {
    x: 0.9, y: 0.9, w: 3, h: 1.0, fontSize: 60, bold: true, color: C.accent1, margin: 0, isTextBox: true, objectName: "Numéro de module",
  });
  s.addText(title, { placeholder: "title" });
  s.addText(subtitle, { placeholder: "subtitle" });
  if (notes) s.addNotes(notes);
  return s;
}

function slide(title, notes) {
  const s = pres.addSlide({ masterName: "CONTENT_T", sectionTitle: currentSection });
  s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
}

// ---------- composants ----------
function circleIcon(s, name, x, y, d, color, nameObj) {
  s.addShape(SHAPE.ellipse, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 }, objectName: (nameObj || "Pastille") + " " + name });
  const p = d * 0.22;
  s.addImage({ data: ico(name), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: "Icône " + name, altText: "Icône : " + (ICON_ALT[name] || name) });
}

// puces : string | [gras, reste]
function bullets(s, items, o = {}) {
  const { x = 0.5, y = 1.3, w = 9, h = 3.6, fontSize = 16, color = C.text1, gap = 7 } = o;
  const runs = [];
  items.forEach((it, i) => {
    const last = i === items.length - 1;
    if (Array.isArray(it)) {
      runs.push({ text: it[0] + " ", options: { bold: true, bullet: { indent: 16 }, color, paraSpaceAfter: gap } });
      runs.push({ text: it[1], options: { breakLine: !last, color } });
    } else {
      runs.push({ text: it, options: { bullet: { indent: 16 }, breakLine: !last, color, paraSpaceAfter: gap } });
    }
  });
  s.addText(runs, { x, y, w, h, fontSize, valign: "top", margin: 0, isTextBox: true, objectName: "Liste à puces" });
}

function card(s, o) {
  const { x, y, w, h, icon, color = C.accent1, title, text, fs = 14, tfs = 16, fill = C.background2 } = o;
  s.addShape(SHAPE.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill, width: 0 }, shadow: shadow(), objectName: "Carte " + title });
  let ty = y + 0.15;
  let tx = x + 0.2;
  let tw = w - 0.4;
  if (icon) {
    circleIcon(s, icon, x + 0.2, y + 0.18, 0.5, color, "Pastille");
    s.addText(title, { x: x + 0.82, y: y + 0.15, w: w - 1.0, h: 0.56, fontSize: tfs, bold: true, color: C.text2, valign: "middle", margin: 0, isTextBox: true });
    ty = y + 0.82;
  } else {
    s.addText(title, { x: tx, y: ty, w: tw, h: 0.4, fontSize: tfs, bold: true, color: C.text2, valign: "middle", margin: 0, isTextBox: true });
    ty = y + 0.6;
  }
  s.addText(text, { x: tx, y: ty, w: tw, h: h - (ty - y) - 0.1, fontSize: fs, color: C.text1, valign: "top", margin: 0, isTextBox: true, objectName: "Texte carte" });
}

function cards(s, list, o = {}) {
  const { cols = list.length, y = 1.35, h = 3.5, x0 = 0.5, w = 9, gap = 0.25, fs, tfs } = o;
  const cw = (w - gap * (cols - 1)) / cols;
  list.forEach((c, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    card(s, { x: x0 + col * (cw + gap), y: y + row * (h + gap), w: cw, h, fs, tfs, ...c });
  });
}

function code(s, txt, o = {}) {
  const { x = 0.5, y = 1.3, w = 9, h: hMax = 3.6, fs = 11, label } = o;
  const lines = txt.replace(/\n+$/, "").split("\n");
  const maxChars = Math.floor((w - 0.36) / ((0.6 * fs) / 72));
  lines.forEach((ln) => { if (ln.length > maxChars) console.warn(`[code trop large] ${ln.length}>${maxChars} : ${ln.slice(0, 50)}`); });
  const need = lines.length * ((fs * 1.2) / 72) + 0.34;
  if (need > hMax + 0.02) console.warn(`[code trop haut] ${need.toFixed(2)}>${hMax} : ${lines[0].slice(0, 40)}`);
  const h = Math.min(hMax, Math.max(0.7, need));
  s.addShape(SHAPE.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: C.text2 }, line: { color: C.text2, width: 0 }, objectName: "Fond du code" });
  const runs = [];
  lines.forEach((ln, i) => {
    const br = i < lines.length - 1;
    const full = /^\s*(#|\/\/)/.test(ln);
    const m = !full && ln.match(/^(.*?\S)(\s+#\s.*)$/);
    if (full) {
      runs.push({ text: ln || " ", options: { color: C.accent3, breakLine: br } });
    } else if (m) {
      runs.push({ text: m[1], options: { color: C.background1 } });
      runs.push({ text: m[2], options: { color: C.accent3, breakLine: br } });
    } else {
      const pr = ln.startsWith("$ ");
      if (pr) {
        runs.push({ text: "$ ", options: { color: C.accent2, bold: true } });
        runs.push({ text: ln.slice(2) || " ", options: { color: C.background1, breakLine: br } });
      } else {
        runs.push({ text: ln || " ", options: { color: C.background1, breakLine: br } });
      }
    }
  });
  s.addText(runs, { x: x + 0.18, y: y + 0.14, w: w - 0.36, h: h - 0.28, fontFace: "Courier New", fontSize: fs, valign: "top", margin: 0, isTextBox: true, objectName: "Code" + (label ? " " + label : "") });
}

function callout(s, kind, text, o = {}) {
  const { x = 0.5, y = 4.45, w = 9, h = 0.65, fs = 14 } = o;
  const map = {
    tip: { c: C.accent3, i: "FaLightbulb", l: "Astuce" },
    warn: { c: C.accent5, i: "FaExclamationTriangle", l: "Attention" },
    key: { c: C.accent1, i: "FaCheckCircle", l: "À retenir" },
    lab: { c: C.accent2, i: "FaFlask", l: "Labo" },
  };
  const k = map[kind];
  s.addShape(SHAPE.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: k.c, transparency: 86 }, line: { color: k.c, width: 0 }, objectName: "Encadré " + k.l });
  circleIcon(s, k.i, x + 0.15, y + (h - 0.4) / 2, 0.4, k.c, "Pastille encadré");
  s.addText([{ text: k.l + " : ", options: { bold: true, color: C.text2 } }, { text, options: { color: C.text1 } }], {
    x: x + 0.7, y, w: w - 0.85, h, fontSize: fs, valign: "middle", margin: 0, isTextBox: true, objectName: "Texte encadré",
  });
}

function flow(s, steps, o = {}) {
  const { y = 2.2, h = 1.0, x0 = 0.5, w = 9, colors, fs = 14, sub } = o;
  const n = steps.length;
  const aw = 0.32;
  const bw = (w - aw * (n - 1) - 0.1 * (n - 1)) / n;
  const cols = colors || [C.accent1, C.accent4, C.accent3, C.accent2, C.accent1, C.accent4];
  steps.forEach((t, i) => {
    const x = x0 + i * (bw + aw + 0.1);
    s.addShape(SHAPE.roundRect, { x, y, w: bw, h, rectRadius: 0.08, fill: { color: cols[i % cols.length] }, line: { color: cols[i % cols.length], width: 0 }, shadow: shadow(), objectName: "Étape " + t });
    s.addText(t, { x: x + 0.05, y, w: bw - 0.1, h, fontSize: fs, bold: true, color: onFill(cols[i % cols.length]), align: "center", valign: "middle", margin: 0, isTextBox: true });
    if (sub && sub[i]) {
      s.addText(sub[i], { x: x - 0.05, y: y + h + 0.08, w: bw + 0.1, h: 0.9, fontSize: 12, color: C.text1, align: "center", valign: "top", margin: 0, isTextBox: true });
    }
    if (i < n - 1) {
      s.addShape(SHAPE.rightArrow, { x: x + bw + 0.06, y: y + h / 2 - 0.13, w: aw, h: 0.26, fill: { color: C.text2 }, line: { color: C.text2, width: 0 }, objectName: "Flèche" });
    }
  });
}

function table(s, rows, o = {}) {
  const { x = 0.5, y = 1.3, w = 9, colW, fs = 13, rowH } = o;
  const hdr = rows[0].map((t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const body = rows.slice(1).map((r, i) =>
    r.map((t, j) => ({ text: t, options: { color: C.text1, bold: j === 0, fill: { color: i % 2 ? C.background1 : C.background2 } } }))
  );
  s.addTable([hdr, ...body], {
    x, y, w, colW, fontSize: fs, valign: "middle", margin: [0.05, 0.1, 0.05, 0.1],
    border: { type: "solid", pt: 0.5, color: "D5DEE8" }, rowH, objectName: "Tableau",
  });
}

function stat(s, x, y, w, big, label, color = C.accent1) {
  s.addText(big, { x, y, w, h: 0.9, fontSize: 48, bold: true, color, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "Chiffre clé" });
  s.addText(label, { x, y: y + 0.9, w, h: 0.6, fontSize: 14, color: C.text1, align: "center", valign: "top", margin: 0, isTextBox: true });
}

function tag(s, text, x, y, w, color = C.accent1, fs = 12) {
  s.addShape(SHAPE.roundRect, { x, y, w, h: 0.3, rectRadius: 0.15, fill: { color }, line: { color, width: 0 } });
  s.addText(text, { x, y, w, h: 0.3, fontSize: fs, bold: true, color: onFill(color), align: "center", valign: "middle", margin: 0, isTextBox: true });
}

function box(s, o) {
  const { x, y, w, h, text, fill = C.accent1, color = onFill(fill), fs = 13, bold = true, align = "center" } = o;
  s.addShape(SHAPE.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: "Bloc " + (typeof text === "string" ? text.slice(0, 20) : "") });
  s.addText(text, { x: x + 0.05, y, w: w - 0.1, h, fontSize: fs, bold, color, align, valign: "middle", margin: 0, isTextBox: true });
}

module.exports = {
  pres, C, SHAPE, THEME, AUTHOR, AUTHOR_ROLE, DECK_TITLE,
  loadIcons, ico, setup, newSection, titleSlide, sectionSlide, slide,
  circleIcon, bullets, card, cards, code, callout, flow, table, stat, tag, box, shadow,
};
