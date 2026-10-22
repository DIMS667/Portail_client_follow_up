import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

import {
  PUBLIC_INDEXABLE_ROUTES,
  resolveSeo,
} from "../src/public-site/data/seo.ts";

const outputDirectory = path.resolve("dist");
const failures = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const seenCanonicals = new Map();

function routeFile(route) {
  return route === "/"
    ? path.join(outputDirectory, "index.html")
    : path.join(outputDirectory, ...route.slice(1).split("/"), "index.html");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function extract(html, pattern) {
  return html.match(pattern)?.[1] ?? "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

for (const route of PUBLIC_INDEXABLE_ROUTES) {
  const seo = resolveSeo(route);
  let html = "";
  try {
    html = await readFile(routeFile(route), "utf8");
  } catch {
    failures.push(`${route}: fichier HTML absent`);
    continue;
  }

  assert(html.includes(`<title>${escapeHtml(seo.title)}</title>`), `${route}: title incorrect`);
  assert(html.includes(`content="${escapeHtml(seo.description)}"`), `${route}: description incorrecte`);
  assert(html.includes(`rel="canonical" href="${seo.canonical}"`), `${route}: canonical incorrecte`);
  assert(html.includes('name="robots" content="index, follow"'), `${route}: directive robots incorrecte`);
  assert(html.includes(`property="og:url" content="${seo.canonical}"`), `${route}: og:url absent ou incorrect`);
  assert(/property="og:image" content="https:\/\//.test(html), `${route}: image Open Graph non absolue`);
  assert(html.includes('name="twitter:card"'), `${route}: Twitter Card absente`);
  assert(!html.includes('<div id="root"></div>'), `${route}: contenu pré-rendu absent`);
  assert((html.match(/<h1(?:\s|>)/g) ?? []).length === 1, `${route}: la page pré-rendue doit contenir exactement un H1`);
  assert(!/Lorem ipsum|contenu éditorial à remplacer|témoignage à remplacer|cas client à remplacer/i.test(html), `${route}: contenu factice détecté`);

  for (const [map, value, label] of [
    [seenTitles, seo.title, "title"],
    [seenDescriptions, seo.description, "description"],
    [seenCanonicals, seo.canonical, "canonical"],
  ]) {
    const existingRoute = map.get(value);
    assert(!existingRoute, `${route}: ${label} dupliqué avec ${existingRoute}`);
    map.set(value, route);
  }

  const jsonLdText = extract(html, /<script id="follow-up-seo-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  try {
    const jsonLd = JSON.parse(jsonLdText);
    assert(jsonLd["@context"] === "https://schema.org", `${route}: contexte JSON-LD incorrect`);
  } catch {
    failures.push(`${route}: JSON-LD absent ou invalide`);
  }
}

for (const route of ["/login", "/inscription", "/mot-de-passe-oublie", "/mentions-legales", "/confidentialite", "/conditions-utilisation"]) {
  const html = await readFile(routeFile(route), "utf8");
  assert(/name="robots" content="noindex,[^"]+"/.test(html), `${route}: noindex absent`);
}

const notFoundHtml = await readFile(path.join(outputDirectory, "404.html"), "utf8");
assert(notFoundHtml.includes('name="robots" content="noindex, follow"'), "404.html: noindex absent");

const portalHtml = await readFile(path.join(outputDirectory, "portail-client", "index.html"), "utf8");
const portalHtaccess = await readFile(path.join(outputDirectory, "portail-client", ".htaccess"), "utf8");
assert(portalHtml.includes('name="robots" content="noindex, nofollow, noarchive"'), "Portail: meta noindex absente");
assert(portalHtaccess.includes('X-Robots-Tag "noindex, nofollow, noarchive"'), "Portail: X-Robots-Tag absent");
assert(portalHtaccess.includes("RewriteRule ^ index.html [L]"), "Portail: fallback SPA absent");

for (const [label, html] of [["site public", await readFile(path.join(outputDirectory, "index.html"), "utf8")], ["portail", portalHtml]]) {
  const entryUrl = extract(html, /<script[^>]+type="module"[^>]+src="([^"]+)"/i);
  assert(Boolean(entryUrl), `${label}: bundle JavaScript initial introuvable`);
  if (entryUrl) {
    const entryFile = path.join(outputDirectory, ...entryUrl.replace(/^\/+/, "").split("/"));
    const gzipBytes = gzipSync(await readFile(entryFile)).byteLength;
    assert(gzipBytes <= 100 * 1024, `${label}: bundle JavaScript initial trop lourd (${gzipBytes} octets gzip)`);
  }
}

for (const imageName of [
  "public-hero-collage.webp",
  "public-claims-advisor.webp",
  "public-entrepreneur.webp",
  "public-role-advisor.webp",
]) {
  const imageStats = await stat(path.join(outputDirectory, "images", imageName));
  assert(imageStats.size <= 250 * 1024, `${imageName}: image optimisée supérieure à 250 Kio`);
}

const sitemap = await readFile(path.join(outputDirectory, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = PUBLIC_INDEXABLE_ROUTES.map((route) => resolveSeo(route).canonical);
assert(JSON.stringify(sitemapUrls) === JSON.stringify(expectedUrls), "sitemap.xml ne correspond pas au manifeste indexable");
assert(!sitemap.includes("/login/"), "sitemap.xml contient une page de connexion");
assert(!sitemap.includes("/portail-client/"), "sitemap.xml contient le portail privé");

for (const requiredFile of ["robots.txt", "sitemap.xml", ".htaccess"]) {
  try {
    assert((await stat(path.join(outputDirectory, requiredFile))).size > 0, `${requiredFile}: fichier vide`);
  } catch {
    failures.push(`${requiredFile}: fichier absent`);
  }
}

if (failures.length) {
  console.error(`SEO output check failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SEO output check passed for ${PUBLIC_INDEXABLE_ROUTES.length} indexable routes plus private and error pages.`);
