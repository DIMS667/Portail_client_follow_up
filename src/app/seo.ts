import { isPortalDeployment } from "./base-path";
import { resolveSeo } from "../public-site/data/seo";

const JSON_LD_SCRIPT_ID = "follow-up-seo-structured-data";

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

function updateStructuredData(value?: Record<string, unknown>) {
  const existing = document.getElementById(JSON_LD_SCRIPT_ID);
  if (!value) {
    existing?.remove();
    return;
  }

  const script = existing instanceof HTMLScriptElement
    ? existing
    : document.createElement("script");
  script.id = JSON_LD_SCRIPT_ID;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(value);
  if (!script.isConnected) document.head.appendChild(script);
}

export function applyRouteSeo(pathname: string) {
  const seo = resolveSeo(pathname, { portal: isPortalDeployment });

  document.title = seo.title;
  upsertCanonical(seo.canonical);
  upsertMeta('meta[name="description"]', { name: "description", content: seo.description });
  upsertMeta('meta[name="robots"]', { name: "robots", content: seo.robots });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: seo.openGraphType });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: seo.canonical });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: seo.image });
  upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: seo.imageAlt });
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Follow-Up Insurance" });
  upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "fr_FR" });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: seo.image });
  upsertMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: seo.imageAlt });
  updateStructuredData(seo.jsonLd);

  return seo;
}
