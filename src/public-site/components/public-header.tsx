import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "../../components/brand-logo";
import { publicPageLinks } from "../data/public-pages";
import { PublicLink } from "./public-link";

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

interface PublicHeaderProps {
  onHome: () => void;
  onClientSpace: () => void;
  onQuote: () => void;
}

export function PublicHeader({ onClientSpace }: PublicHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = window.location.pathname;

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="public-header">
      <div className="public-container public-header__inner">
        <PublicLink
          href="/"
          className="public-header__logo"
          aria-label="Follow-Up Insurance, retour à l’accueil"
        >
          <BrandLogo className="w-[184px] sm:w-[205px]" />
        </PublicLink>

        <nav className="public-header__nav" aria-label="Navigation principale">
          <span hidden aria-hidden="true" />
          {publicPageLinks.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <PublicLink
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </PublicLink>
            );
          })}
        </nav>

        <div className="public-header__actions">
          <Button
            type="button"
            variant="outline"
            className="public-button public-button--outline public-header__client-button"
            onClick={onClientSpace}
            aria-label="Accéder à l’espace client"
          >
            <UserRound className="sm:hidden" size={19} aria-hidden="true" />
            <span className="hidden sm:inline">Espace client</span>
          </Button>
          <Button
            asChild
            className="public-button public-button--primary hidden xl:inline-flex"
          >
            <PublicLink href="/contact?objet=devis">Demander un devis</PublicLink>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="public-header__menu-button xl:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
        </div>
      </div>

      <div id="public-mobile-menu" className="public-mobile-menu" data-open={menuOpen || undefined}>
        <nav aria-label="Navigation mobile">
          {publicPageLinks.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <PublicLink
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
              >
                {item.label}<ArrowUpRight size={16} aria-hidden="true" />
              </PublicLink>
            );
          })}
        </nav>
        <div className="public-mobile-menu__actions">
          <Button asChild className="public-button public-button--primary">
            <PublicLink href="/contact?objet=devis" onClick={closeMenu}>Demander un devis</PublicLink>
          </Button>
        </div>
      </div>
    </header>
  );
}
