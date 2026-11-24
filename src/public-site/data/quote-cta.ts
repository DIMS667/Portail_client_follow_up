/** Les demandes de devis commencent dans la navigation, les liens d’assistance restent disponibles. */
export function isQuoteCta(href: string): boolean {
  const [pathname, search = ""] = href.split("?");
  if (pathname.replace(/\/$/, "") !== "/contact") return false;
  const motif = new URLSearchParams(search).get("motif");
  return !["sinistre", "question", "conseil"].includes(motif ?? "");
}
