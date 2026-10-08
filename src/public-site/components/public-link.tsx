import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

import { usePortal } from "../../app/portal-context";

export interface PublicLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
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

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    navigate(`${destination.pathname}${destination.search}${destination.hash}`);
  };

  return <a ref={ref} href={href} target={target} download={download} onClick={handleClick} {...props} />;
});
