import { BrandLogo } from "../../components/brand-logo";
import { publicPageLinks, solutionSummaries } from "../data/public-pages";
import { siteConfig } from "../data/site-config";
import { PublicLink } from "./public-link";
import { LinkedInLink } from "./linkedin-link";

export function PublicFooter() {
  const contactItems = [
    ...siteConfig.phones,
    siteConfig.email && { label: siteConfig.email, href: `mailto:${siteConfig.email}` },
    siteConfig.address && { label: siteConfig.address },
    siteConfig.openingHours && { label: siteConfig.openingHours },
  ].filter(Boolean) as Array<{ label: string; href?: string }>;

  return (
    <footer className="public-footer">
      <div className="public-container public-footer__grid">
        <div className="public-footer__brand">
          <PublicLink href="/" aria-label="Follow-Up Insurance, retour à l’accueil">
            <BrandLogo className="w-[220px]" />
          </PublicLink>
          <p>{siteConfig.signature}</p>
          <span>Conseil, choix et accompagnement pour avancer avec plus de sérénité.</span>
          <LinkedInLink />
        </div>

        <div className="public-footer__column">
          <h2>Découvrir</h2>
          {publicPageLinks.slice(1).map((item) => <PublicLink key={item.href} href={item.href}>{item.label}</PublicLink>)}
        </div>

        <div className="public-footer__column">
          <h2>Nos solutions</h2>
          {solutionSummaries.map((solution) => (
            <PublicLink key={solution.slug} href={solution.path}>{solution.shortTitle}</PublicLink>
          ))}
        </div>

        <div className="public-footer__column public-footer__access">
          <h2><PublicLink href="/contact">Contact</PublicLink></h2>
          {contactItems.length > 0 && (
            <div className="public-footer__contact">
              {contactItems.map((item) => item.href
                ? <a key={item.label} href={item.href}>{item.label}</a>
                : <span key={item.label}>{item.label}</span>)}
            </div>
          )}
        </div>
      </div>
      <div className="public-container public-footer__legal">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <div>
          <PublicLink href="/mentions-legales">Mentions légales</PublicLink>
          <PublicLink href="/confidentialite">Politique de confidentialité</PublicLink>
          <PublicLink href="/conditions-utilisation">Conditions d’utilisation</PublicLink>
        </div>
      </div>
    </footer>
  );
}
