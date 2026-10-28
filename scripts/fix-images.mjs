/** Completa imágenes faltantes o insuficientes del catálogo de demostración. */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const OUT = path.join(ROOT, "public", "images");
const VEH = path.join(OUT, "vehicles");
const UA = "AutoVerticeDemo/1.0 (proyecto academico; contacto: demo@autovertice.local)";
const BLOCK = /(logo|emblem|badge|icon|steering|dashboard|interior|engine|seat|wheel|tire|manual|brochure|diagram|chart|map|flag|seal|signature|coat of arms|plant|factory|assembly|line drawing|sketch|poster|collage)/i;
const OK_EXT = /\.(jpe?g|png)$/i;
const TARGET = 3;

const FIXES = {
  "renault-logan-expression-2022": "Renault Logan",
  "ford-ranger-xlt-2020": "Ford Ranger pickup truck",
  "toyota-sw4-sr5-2020": "Toyota Fortuner",
  "akt-nkd-125-2023": "AKT motocicleta",
  "bajaj-boxer-100-2023": "Bajaj Boxer motorcycle",
  "yamaha-nmax-160-2022": "Yamaha NMAX",
  "renault-duster-prestige-2021": "Renault Duster 2021",
  "bajaj-pulsar-ns160-2023": "Bajaj Pulsar NS160 motorcycle",
  "honda-cb190r-2022": "Honda CB190R motorcycle",
  "yamaha-xmax-250-2023": "Yamaha XMAX 250 motorcycle",
  "kawasaki-versys-650-2021": "Kawasaki Versys 650",
  "mazda-3-touring-2021": "Mazda 3 hatchback 2021",
  "harley-iron883-2019": "Harley-Davidson Sportster",
  "suzuki-gixxer-250-2022": "Suzuki Gixxer 250",
  "yamaha-tenere-700-2022": "Yamaha Ténéré 700",
};

async function commonsImages(query, count = 6) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    "&generator=search&gsrnamespace=6&gsrlimit=30&gsrsearch=" +
    encodeURIComponent(query) +
    "&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=1400";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  const pages = Object.values(json?.query?.pages ?? {});
  const picked = [];
  for (const page of pages) {
    if (picked.length >= count) break;
    const title = page.title ?? "";
    if (!OK_EXT.test(title) || BLOCK.test(title)) continue;
    const info = page.imageinfo?.[0];
    if (!info || (info.width ?? 0) < 800 || (info.height ?? 0) < 500) continue;
    picked.push({
      title,
      url: info.thumburl ?? info.url,
      page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
      license: info.extmetadata?.LicenseShortName?.value ?? "ver en Commons",
      artist: (info.extmetadata?.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim(),
    });
  }
  return picked;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

await mkdir(VEH, { recursive: true });
let credits = [];
try {
  credits = JSON.parse(await readFile(path.join(OUT, "credits.json"), "utf8"));
} catch {
  credits = [];
}

for (const [slug, query] of Object.entries(FIXES)) {
  const existing = credits.filter((c) => c.file.startsWith(`images/vehicles/${slug}-`));
  const has = new Set(existing.map((c) => Number(c.file.match(/-(\d+)\.jpg$/)?.[1] ?? 0)));
  let next = 1;
  while (has.has(next)) next += 1;
  if (next > TARGET) continue;
  try {
    const imgs = await commonsImages(query, 8);
    for (const img of imgs) {
      if (next > TARGET) break;
      const dest = path.join(VEH, `${slug}-${next}.jpg`);
      const bytes = await download(img.url, dest);
      credits = credits.filter((c) => c.file !== `images/vehicles/${slug}-${next}.jpg`);
      credits.push({ file: `images/vehicles/${slug}-${next}.jpg`, ...img, bytes });
      console.log(`${slug}-${next}.jpg (${(bytes / 1024) | 0} KB) <- ${img.title}`);
      next += 1;
    }
    if (next === 1) console.warn(`SIN RESULTADOS: ${slug} (${query})`);
  } catch (err) {
    console.warn(`FALLO ${slug}: ${err.message}`);
  }
}

await writeFile(path.join(OUT, "credits.json"), JSON.stringify(credits, null, 2));
console.log(`\nCredits totales: ${credits.length}`);
