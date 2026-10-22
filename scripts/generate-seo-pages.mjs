import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  adviceArticleBySlug,
  adviceArticles,
  faqPage,
  publicPageLinks,
  publicPageRegistry,
  solutionPages,
  solutionSummaries,
} from "../src/public-site/data/public-pages.ts";
import {
  PUBLIC_INDEXABLE_ROUTES,
  PUBLIC_ORIGIN,
  PUBLIC_SITE_NAME,
  resolveSeo,
} from "../src/public-site/data/seo.ts";

const outputDirectory = path.resolve("dist");
const templatePath = path.join(outputDirectory, "index.html");
const template = await readFile(templatePath, "utf8");

const legalRoutes = ["/mentions-legales", "/confidentialite", "/conditions-utilisation"];
const authRoutes = ["/login", "/inscription", "/mot-de-passe-oublie"];
const generatedRoutes = [...PUBLIC_INDEXABLE_ROUTES, ...legalRoutes, ...authRoutes];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

function renderLink(href, label) {
  const match = href.startsWith("/") && href !== "/"
    ? href.match(/^([^?#]*)([?#].*)?$/)
    : null;
  const canonicalHref = match && !match[1].endsWith("/") && !/\.[^/]+$/.test(match[1])
    ? `${match[1]}/${match[2] ?? ""}`
    : href;
  return `<a href="${escapeHtml(canonicalHref)}">${escapeHtml(label)}</a>`;
}

function renderList(items) {
  if (!items?.length) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderCards(cards) {
  if (!cards?.length) return "";
  return `<div>${cards.map((card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.description)}</p>${card.href ? renderLink(card.href, card.label ?? "En savoir plus") : ""}</article>`).join("")}</div>`;
}

function renderSteps(steps) {
  if (!steps?.length) return "";
  return `<ol>${steps.map((step) => `<li><strong>${escapeHtml(step.number)} — ${escapeHtml(step.title)}</strong><p>${escapeHtml(step.description)}</p></li>`).join("")}</ol>`;
}

function renderSection(section) {
  return `<section id="${escapeHtml(section.id)}">
    ${section.eyebrow ? `<p>${escapeHtml(section.eyebrow)}</p>` : ""}
    <h2>${escapeHtml(section.title)}</h2>
    ${section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ""}
    ${(section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    ${renderList(section.bullets)}
    ${renderCards(section.cards)}
    ${renderSteps(section.steps)}
    ${section.cta ? renderLink(section.cta.href, section.cta.label) : ""}
  </section>`;
}

function renderHeader() {
  return `<header><a href="/" aria-label="${PUBLIC_SITE_NAME}">${PUBLIC_SITE_NAME}</a><nav aria-label="Navigation principale">${publicPageLinks.map((item) => renderLink(item.href, item.label)).join(" ")}</nav></header>`;
}

function renderFooter() {
  return `<footer><p>${PUBLIC_SITE_NAME} — Courtier en assurances.</p><nav aria-label="Informations">${renderLink("/mentions-legales", "Mentions légales")} ${renderLink("/confidentialite", "Confidentialité")} ${renderLink("/conditions-utilisation", "Conditions d’utilisation")}</nav></footer>`;
}

function renderHero(hero) {
  return `<section><p>${escapeHtml(hero.eyebrow)}</p><h1>${escapeHtml(hero.title)}</h1><p>${escapeHtml(hero.intro)}</p>${hero.primaryCta ? renderLink(hero.primaryCta.href, hero.primaryCta.label) : ""}${hero.secondaryCta ? ` ${renderLink(hero.secondaryCta.href, hero.secondaryCta.label)}` : ""}</section>`;
}

function renderLandingPage(page) {
  let additionalContent = "";
  if (page.path === "/faq") {
    additionalContent = faqPage.categories.map((category) => `<section id="${escapeHtml(category.id)}"><h2>${escapeHtml(category.title)}</h2>${category.items.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}</section>`).join("");
  }

  return `${renderHeader()}<main>${renderHero(page.hero)}${page.sections.map(renderSection).join("")}${additionalContent}${page.finalCta ? `<section><h2>${escapeHtml(page.finalCta.title)}</h2><p>${escapeHtml(page.finalCta.description)}</p>${renderLink(page.finalCta.action.href, page.finalCta.action.label)}</section>` : ""}</main>${renderFooter()}`;
}

function renderSolutionPage(page) {
  return `${renderHeader()}<main>${renderHero(page.hero)}
    <section><h2>À qui s’adresse cette assurance ?</h2>${renderList(page.audience)}</section>
    <section><h2>Les garanties à examiner</h2>${renderCards(page.coverages)}</section>
    <section><h2>Options à considérer</h2>${renderList(page.optionalBenefits)}</section>
    <section><h2>Points de vigilance</h2>${renderList(page.watchPoints)}</section>
    <section><h2>Documents utiles</h2>${renderList(page.documents)}</section>
    <section><h2>${escapeHtml(page.brokerSupport.title)}</h2><p>${escapeHtml(page.brokerSupport.description)}</p>${renderSteps(page.brokerSupport.steps)}</section>
    <section><h2>Questions fréquentes</h2>${page.faq.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}</section>
    <section><h2>${escapeHtml(page.finalCta.title)}</h2><p>${escapeHtml(page.finalCta.description)}</p>${renderLink(page.finalCta.action.href, page.finalCta.action.label)}</section>
  </main>${renderFooter()}`;
}

function renderArticle(article) {
  return `${renderHeader()}<main><article><p>${escapeHtml(article.category)} · ${escapeHtml(article.readingTime)}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.introduction)}</p>${article.sections.map(renderSection).join("")}<aside><h2>${escapeHtml(article.takeaway.title)}</h2>${renderList(article.takeaway.points)}${renderLink(article.cta.href, article.cta.label)}</aside></article></main>${renderFooter()}`;
}

function renderHome() {
  return `${renderHeader()}<main><section><p>Courtier en assurances</p><h1>Choisir avec confiance. Allez en toute quiétude.</h1><p>Follow-Up Insurance comprend vos besoins, recherche des solutions adaptées et vous accompagne dans vos choix comme dans leur suivi.</p>${renderLink("/contact?objet=devis", "Étudier mon besoin")} ${renderLink("/a-propos", "Découvrir Follow-Up")}</section><section><h2>Nos solutions d’assurance</h2>${solutionSummaries.map((solution) => `<article><h3>${escapeHtml(solution.title)}</h3><p>${escapeHtml(solution.description)}</p>${renderLink(solution.path, solution.ctaLabel)}</article>`).join("")}</section><section><h2>Conseils pratiques</h2>${adviceArticles.map((article) => `<article><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.excerpt)}</p>${renderLink(article.path, "Lire le guide")}</article>`).join("")}</section></main>${renderFooter()}`;
}

const legalContent = {
  "/mentions-legales": ["Mentions légales", "Informations relatives à l’éditeur et à l’exploitation du site."],
  "/confidentialite": ["Politique de confidentialité", "Principes appliqués au traitement des informations transmises sur ce site."],
  "/conditions-utilisation": ["Conditions d’utilisation", "Règles générales applicables à la consultation de cette démonstration."],
};

function renderLegal(route) {
  const [title, intro] = legalContent[route];
  return `${renderHeader()}<main><article><h1>${escapeHtml(title)}</h1><p>${escapeHtml(intro)}</p><h2>Informations en cours de validation</h2><p>Cette page est en cours de validation. Les informations définitives seront publiées après confirmation des éléments relatifs à l’éditeur, à l’hébergement et, selon la page, au traitement des données.</p>${renderLink("/contact", "Nous contacter")}</article></main>${renderFooter()}`;
}

function renderAuth(route) {
  const content = {
    "/login": ["Connexion à l’espace client", "Accédez à votre espace sécurisé Follow-Up Insurance."],
    "/inscription": ["Créer mon espace client", "Créez votre accès personnel Follow-Up Insurance."],
    "/mot-de-passe-oublie": ["Mot de passe oublié", "Demandez la réinitialisation de votre accès."],
  }[route];
  return `<main><h1>${escapeHtml(content[0])}</h1><p>${escapeHtml(content[1])}</p></main>`;
}

function renderNotFound() {
  return `${renderHeader()}<main><h1>Cette page n’existe pas.</h1><p>Le lien a peut-être changé. Retrouvez nos solutions ou revenez à l’accueil.</p>${renderLink("/", "Revenir à l’accueil")} ${renderLink("/solutions", "Voir nos solutions")}</main>${renderFooter()}`;
}

function renderRouteContent(route) {
  if (route === "/") return renderHome();
  if (legalRoutes.includes(route)) return renderLegal(route);
  if (authRoutes.includes(route)) return renderAuth(route);
  if (route.startsWith("/solutions/") && route !== "/solutions/moto") {
    const slug = route.split("/").at(-1);
    return renderSolutionPage(solutionPages[slug]);
  }
  if (route.startsWith("/conseils/")) {
    const slug = route.split("/").at(-1);
    return renderArticle(adviceArticleBySlug[slug]);
  }
  const page = Object.values(publicPageRegistry).find((candidate) => candidate.path === route);
  if (!page) throw new Error(`No static content renderer for ${route}`);
  return renderLandingPage(page);
}

function removeMeta(html, key, value) {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(`<meta\\s+[^>]*${key}=["']${escapedValue}["'][^>]*>\\s*`, "gi"), "");
}

function injectHead(html, seo) {
  let result = html.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  for (const name of ["description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]) {
    result = removeMeta(result, "name", name);
  }
  for (const property of ["og:title", "og:description", "og:type", "og:url", "og:image", "og:image:alt", "og:site_name", "og:locale"]) {
    result = removeMeta(result, "property", property);
  }
  result = result
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<script\s+[^>]*id=["']follow-up-seo-structured-data["'][^>]*>[\s\S]*?<\/script>\s*/gi, "")
    .replace(/<style\s+[^>]*id=["']follow-up-prerender-style["'][^>]*>[\s\S]*?<\/style>\s*/gi, "");

  const structuredData = seo.jsonLd
    ? `<script id="follow-up-seo-structured-data" type="application/ld+json">${JSON.stringify(seo.jsonLd).replaceAll("<", "\\u003c")}</script>`
    : "";
  const imagePreload = seo.robots === "index, follow"
    ? seo.canonical === `${PUBLIC_ORIGIN}/`
      ? '<link rel="preload" as="image" type="image/webp" href="/images/public-hero-collage-960.webp" imagesrcset="/images/public-hero-collage-640.webp 640w, /images/public-hero-collage-960.webp 960w, /images/public-hero-collage.webp 1504w" imagesizes="(max-width: 760px) 100vw, 50vw" fetchpriority="high" />'
      : `<link rel="preload" as="image" href="${escapeHtml(seo.image)}" fetchpriority="high" />`
    : "";
  const head = `<title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <meta name="robots" content="${escapeHtml(seo.robots)}" />
    <link rel="canonical" href="${escapeHtml(seo.canonical)}" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:type" content="${escapeHtml(seo.openGraphType)}" />
    <meta property="og:url" content="${escapeHtml(seo.canonical)}" />
    <meta property="og:image" content="${escapeHtml(seo.image)}" />
    <meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}" />
    <meta property="og:site_name" content="${PUBLIC_SITE_NAME}" />
    <meta property="og:locale" content="fr_FR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <meta name="twitter:image" content="${escapeHtml(seo.image)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(seo.imageAlt)}" />
    ${imagePreload}
    ${structuredData}
    <style id="follow-up-prerender-style">.seo-prerender{max-width:1180px;margin:0 auto;padding:2rem;font-family:Arial,sans-serif;line-height:1.6;color:#242424}.seo-prerender header,.seo-prerender footer{display:flex;gap:1rem;justify-content:space-between;flex-wrap:wrap;padding:1rem 0}.seo-prerender nav{display:flex;gap:.8rem;flex-wrap:wrap}.seo-prerender main>section,.seo-prerender article>section{padding:1.5rem 0}.seo-prerender a{color:#b5121b}.seo-prerender h1{font-size:clamp(2rem,5vw,4.5rem);line-height:1.05}</style>`;
  return result.replace("</head>", `    ${head}\n  </head>`);
}

function injectContent(html, content) {
  return html.replace(
    /<body(?:\s[^>]*)?>[\s\S]*<\/body>/i,
    `<body>\n    <div id="root"><div class="seo-prerender">${content}</div></div>\n  </body>`,
  );
}

function outputPathForRoute(route) {
  if (route === "/") return templatePath;
  return path.join(outputDirectory, ...route.slice(1).split("/"), "index.html");
}

async function writeRoute(route, content, seo = resolveSeo(route)) {
  const outputPath = outputPathForRoute(route);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const html = injectContent(injectHead(template, seo), content);
  await writeFile(outputPath, html, "utf8");
}

for (const route of generatedRoutes) {
  await writeRoute(route, renderRouteContent(route));
}

const notFoundHtml = injectContent(
  injectHead(template, resolveSeo("/page-introuvable")),
  renderNotFound(),
);
await writeFile(path.join(outputDirectory, "404.html"), notFoundHtml, "utf8");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_INDEXABLE_ROUTES.map((route) => `  <url><loc>${escapeXml(resolveSeo(route).canonical)}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap, "utf8");

const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${PUBLIC_ORIGIN}/sitemap.xml
`;
await writeFile(path.join(outputDirectory, "robots.txt"), robots, "utf8");

console.log(`Generated ${generatedRoutes.length} route pages, a 404 page, robots.txt and sitemap.xml.`);
