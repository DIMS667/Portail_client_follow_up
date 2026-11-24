import type { ReactNode } from "react";
import { usePortal } from "../../app/portal-context";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import "../public-site.css";

interface PublicPageShellProps {
  children: ReactNode;
  className?: string;
}

export function PublicPageShell({ children, className = "" }: PublicPageShellProps) {
  const { navigate, store } = usePortal();
  const goToClientSpace = () => {
    if (import.meta.env.DEV) {
      navigate(store.session.authenticated ? "/espace" : "/login");
      return;
    }
    window.location.assign(store.session.authenticated ? "/portail-client/" : "/login/");
  };

  return (
    <div className={`public-site public-page-site ${className}`.trim()}>
      <a className="public-skip-link" href="#contenu">Aller au contenu</a>
      <PublicHeader onClientSpace={goToClientSpace} />
      <main id="contenu">{children}</main>
      <PublicFooter />
    </div>
  );
}
