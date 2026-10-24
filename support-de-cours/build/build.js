// Génère Docker-du-debutant-a-l-expert.pptx
// Usage: NODE_PATH=<node_modules> node build.js [sortie.pptx]
const fs = require("fs");
const path = require("path");
const L = require("./lib");
const SKILL = process.env.PPTX_SKILL_DIR || "/root/.claude/skills/synced/9d7d7b63-0e71-4933-84fd-c6c71e451e96_ebb7aba5-11da-46cf-9f2f-d7dbe291d98d/pptx";
const { applyTheme } = require(path.join(SKILL, "scripts/apply_theme.js"));

(async () => {
  const src = ["lib.js", "part1.js", "part2.js", "part3.js"].map((f) => fs.readFileSync(path.join(__dirname, f), "utf8")).join("\n");
  const names = [...src.matchAll(/"(Fa[A-Za-z0-9]+)"/g)].map((m) => m[1]);
  await L.loadIcons(names);
  L.setup();
  require("./part1")(L);
  require("./part2")(L);
  require("./part3")(L);
  const out = process.argv[2] || path.join(__dirname, "..", "Docker-du-debutant-a-l-expert.pptx");
  await L.pres.writeFile({ fileName: out });
  await applyTheme(out, L.THEME);
  console.log("OK", out);
})().catch((e) => { console.error(e); process.exit(1); });
