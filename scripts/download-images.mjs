/**
 * Descarga de imágenes de demostración.
 *
 * - Fotografías de vehículos: Wikimedia Commons (licencias libres), buscadas por
 *   modelo para que cada anuncio tenga fotos que corresponden al vehículo.
 * - Imágenes de portada y categorías: Unsplash (uso gratuito), descargadas localmente
 *   para que la aplicación funcione sin conexión.
 *
 * Uso:  node scripts/download-images.mjs
 * Salida: public/images/  +  public/images/credits.json
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const OUT = path.join(ROOT, "public", "images");
const VEH = path.join(OUT, "vehicles");

const UA = "AutoVerticeDemo/1.0 (proyecto academico; contacto: demo@autovertice.local)";

const BLOCK = /(logo|emblem|badge|icon|steering|dashboard|interior|engine|seat|wheel|tire|manual|brochure|diagram|chart|map|flag|seal|signature|coat of arms|plant|factory|assembly|line drawing|sketch)/i;
const OK_EXT = /\.(jpe?g|png)$/i;

/** slug -> consulta de búsqueda en Wikimedia Commons */
const VEHICLE_IMAGES = {
  "renault-logan-expression-2022": "Renault Logan third generation",
  "renault-kwid-zen-2023": "Renault Kwid",
  "mazda-3-touring-2021": "Mazda 3 BP hatchback",
  "toyota-corolla-cross-xli-2023": "Toyota Corolla Cross",
  "chevrolet-tracker-ls-2022": "Chevrolet Tracker second generation",
  "renault-duster-prestige-2021": "Renault Duster second generation",
  "nissan-versa-sense-2023": "Nissan Versa N18",
  "kia-picanto-ex-2022": "Kia Picanto JA",
  "chevrolet-onix-plus-2021": "Chevrolet Onix Plus",
  "ford-ranger-xlt-2020": "Ford Ranger PX3",
  "toyota-hilux-d4d-2019": "Toyota Hilux GUN125",
  "renault-alaskan-prestige-2021": "Renault Alaskan",
  "mazda-cx5-grand-touring-2021": "Mazda CX-5 KF",
  "vw-golf-gti-2019": "Volkswagen Golf GTI Mk7",
  "chevrolet-camaro-2lt-2019": "Chevrolet Camaro sixth generation",
  "bmw-320i-sport-2020": "BMW 3 Series G20",
  "toyota-sw4-sr5-2020": "Toyota SW4 GUN145",
  "kia-sportage-ex-2022": "Kia Sportage NQ5",
  "renault-clio-zen-2021": "Renault Clio V",
  "hyundai-accent-active-2021": "Hyundai Accent HC",
  "changan-cs35-plus-2023": "Changan CS35 Plus",
  "kia-rio-lx-2021": "Kia Rio YB",
  "yamaha-fz20-2022": "Yamaha FZ 2.0",
  "yamaha-mt07-2021": "Yamaha MT-07",
  "bajaj-pulsar-ns160-2023": "Bajaj Pulsar NS160",
  "honda-cb190r-2022": "Honda CB190R",
  "kawasaki-ninja-400-2021": "Kawasaki Ninja 400",
  "royal-enfield-himalayan-2022": "Royal Enfield Himalayan",
  "yamaha-xmax-250-2023": "Yamaha XMAX 250",
  "honda-pcx160-2023": "Honda PCX 160",
  "suzuki-gixxer-250-2022": "Suzuki Gixxer 250",
  "yamaha-tenere-700-2022": "Yamaha Tenere 700",
  "akt-nkd-125-2023": "AKT NKD 125",
  "bajaj-boxer-100-2023": "Bajaj Boxer 100",
  "harley-iron883-2019": "Harley-Davidson Iron 883",
  "honda-africa-twin-2021": "Honda CRF1000L Africa Twin",
  "yamaha-nmax-160-2022": "Yamaha NMAX 160",
  "kawasaki-versys-650-2021": "Kawasaki Versys 650",
};

const SECTIONS = {
  "hero-car": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=2000&q=80",
  "hero-moto": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=2000&q=80",
  "section-sell": "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1600&q=80",
  "section-finder": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80",
  "category-familiar": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
  "category-suv": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
  "category-sedan": "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80",
  "category-hatchback": "https://images.unsplash.com/photo-1471479917193-f00955256257?auto=format&fit=crop&w=1200&q=80",
  "category-deportivo": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  "category-pickup": "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
  "category-moto-urbana": "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1200&q=80",
  "category-moto-deportiva": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
  "category-moto-touring": "https://images.unsplash.com/photo-1517672651691-24622a91b550?auto=format&fit=crop&w=1200&q=80",
  "category-moto-doble": "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=80",
  "category-scooter": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80",
  "category-moto-trabajo": "https://images.unsplash.com/photo-1600717535275-0b18ede2f7fc?auto=format&fit=crop&w=1200&q=80",
  "guide-1": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
  "guide-2": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  "guide-3": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80",
  "guide-4": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
  "guide-5": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  "guide-6": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80",
  "og-cover": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
};

async function commonsImages(query, count = 3) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    "&generator=search&gsrnamespace=6&gsrlimit=20&gsrsearch=" +
    encodeURIComponent(query) +
    "&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=1400";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`API ${res.status} para "${query}"`);
  const json = await res.json();
  const pages = Object.values(json?.query?.pages ?? {});
  const picked = [];
  for (const page of pages) {
    if (picked.length >= count) break;
    const title = page.title ?? "";
    if (!OK_EXT.test(title)) continue;
    if (BLOCK.test(title)) continue;
    const info = page.imageinfo?.[0];
    if (!info) continue;
    if ((info.width ?? 0) < 800) continue;
    if ((info.height ?? 0) < 500) continue;
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
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

const credits = [];

await mkdir(VEH, { recursive: true });

let i = 0;
for (const [slug, query] of Object.entries(VEHICLE_IMAGES)) {
  i += 1;
  try {
    const imgs = await commonsImages(query, 3);
    if (imgs.length === 0) throw new Error("sin resultados útiles");
    for (let n = 0; n < imgs.length; n += 1) {
      const dest = path.join(VEH, `${slug}-${n + 1}.jpg`);
      const bytes = await download(imgs[n].url, dest);
      credits.push({ file: `images/vehicles/${slug}-${n + 1}.jpg`, ...imgs[n], bytes });
      console.log(`[${i}/${Object.keys(VEHICLE_IMAGES).length}] ${slug}-${n + 1}.jpg (${(bytes / 1024) | 0} KB)`);
    }
  } catch (err) {
    console.warn(`FALLO ${slug}: ${err.message}`);
  }
}

for (const [name, url] of Object.entries(SECTIONS)) {
  try {
    const dest = path.join(OUT, `${name}.jpg`);
    const bytes = await download(url, dest);
    credits.push({ file: `images/${name}.jpg`, title: name, page: url, license: "Unsplash License", bytes });
    console.log(`${name}.jpg (${(bytes / 1024) | 0} KB)`);
  } catch (err) {
    console.warn(`FALLO sección ${name}: ${err.message}`);
  }
}

await writeFile(path.join(OUT, "credits.json"), JSON.stringify(credits, null, 2));
console.log(`\nListo: ${credits.length} imágenes descargadas.`);
