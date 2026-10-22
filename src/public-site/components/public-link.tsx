import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

import { fromBrowserPath, toBrowserPath } from "../../app/base-path";
import { usePortal } from "../../app/portal-context";

export interface PublicLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

function canonicalPublicHref(href: string) {
  if (!href.startsWith("/") || href === "/") return href;
  const match = href.match(/^([^?#]*)([?#].*)?$/);
  if (!match) return href;
  const pathname = match[1];
  const suffix = match[2] ?? "";
  if (pathname.endsWith("/") || /\.[^/]+$/.test(pathname)) return href;
  return `${pathname}/${suffix}`;
}

/**
 * Lien interne accessible qui conserve le comportement natif d’une ancre
 * (nouvel onglet, copie de l’URL, clic modifié) tout en utilisant le routeur SPA
 * pour les clics simples vers une page de l’application.
 */
export const PublicLink = forwardRef<HTMLAnchorElement, PublicLinkProps>(function PublicLink(
  { href, onClick, target, download, ...props },
  ref,
) {
  const { navigate } = usePortal();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || download !== undefined
      || (target && target !== "_self")
      || href.startsWith("#")
    ) return;

    const canonicalHref = canonicalPublicHref(href);
    const browserHref = canonicalHref.startsWith("/") ? toBrowserPath(canonicalHref) : canonicalHref;
    const destination = new URL(browserHref, window.location.href);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    navigate(`${fromBrowserPath(destination.pathname)}${destination.search}${destination.hash}`);
  };

  const canonicalHref = canonicalPublicHref(href);
  const browserHref = canonicalHref.startsWith("/") ? toBrowserPath(canonicalHref) : canonicalHref;
  return <a ref={ref} href={browserHref} target={target} download={download} onClick={handleClick} {...props} />;
});
