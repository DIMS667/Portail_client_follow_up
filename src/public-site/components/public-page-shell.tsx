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
  const goToClientSpace = () => navigate(store.session.authenticated ? "/espace" : "/connexion");
  const goToQuote = () => navigate("/contact?objet=devis");

  return (
    <div className={`public-site public-page-site ${className}`.trim()}>
      <a className="public-skip-link" href="#contenu">Aller au contenu</a>
      <PublicHeader onHome={() => navigate("/")} onClientSpace={goToClientSpace} onQuote={goToQuote} />
      <main id="contenu">{children}</main>
      <PublicFooter onClientSpace={goToClientSpace} onQuote={goToQuote} />
    </div>
  );
}
