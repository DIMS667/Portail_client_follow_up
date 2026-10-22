import { lazy, useEffect } from "react";
import { toBrowserPath } from "../app/base-path";
import { usePortal } from "../app/portal-context";
import type { AdviceArticleSlug, SolutionSlug } from "../public-site/data/public-pages";

const HomePage = lazy(() => import("../public-site/pages/home-page").then((module) => ({ default: module.HomePage })));
const AboutPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.AboutPublicPage })));
const AdviceArticlePublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.AdviceArticlePublicPage })));
const AdvicePublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.AdvicePublicPage })));
const BusinessesPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.BusinessesPublicPage })));
const ClaimsPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.ClaimsPublicPage })));
const ContactPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.ContactPublicPage })));
const FaqPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.FaqPublicPage })));
const IndividualsPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.IndividualsPublicPage })));
const LegalPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.LegalPublicPage })));
const PublicNotFoundPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.PublicNotFoundPage })));
const SolutionDetailPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.SolutionDetailPublicPage })));
const SolutionsPublicPage = lazy(() => import("../public-site/pages/content-pages").then((module) => ({ default: module.SolutionsPublicPage })));
const ForgotPasswordPage = lazy(() => import("../pages/public-pages").then((module) => ({ default: module.ForgotPasswordPage })));
const LoginPage = lazy(() => import("../pages/public-pages").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("../pages/public-pages").then((module) => ({ default: module.RegisterPage })));

const solutionSlugs = new Set<SolutionSlug>([
  "automobile",
  "sante",
  "vie-capitalisation",
  "habitation",
  "voyage",
  "entreprise",
  "caution",
]);

const adviceArticleSlugs = new Set<AdviceArticleSlug>([
  "choisir-assurance-automobile",
  "preparer-assurance-voyage",
  "proteger-activite-professionnelle",
]);

export function PublicRouteView() {
  const { pathname } = usePortal();

  if (pathname === "/") return <HomePage />;
  if (pathname === "/a-propos") return <AboutPublicPage />;
  if (pathname === "/solutions") return <SolutionsPublicPage />;
  if (pathname === "/solutions/moto") return <LegacyMotoSolutionRedirect />;
  if (/^\/solutions\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split("/")[2]) as SolutionSlug;
    return solutionSlugs.has(slug) ? <SolutionDetailPublicPage slug={slug} /> : <PublicNotFoundPage />;
  }
  if (pathname === "/particuliers") return <IndividualsPublicPage />;
  if (pathname === "/entreprises") return <BusinessesPublicPage />;
  if (pathname === "/sinistres") return <ClaimsPublicPage />;
  if (pathname === "/conseils") return <AdvicePublicPage />;
  if (/^\/conseils\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split("/")[2]) as AdviceArticleSlug;
    return adviceArticleSlugs.has(slug) ? <AdviceArticlePublicPage slug={slug} /> : <PublicNotFoundPage />;
  }
  if (pathname === "/contact") return <ContactPublicPage />;
  if (pathname === "/faq") return <FaqPublicPage />;
  if (pathname === "/mentions-legales") return <LegalPublicPage kind="mentions-legales" />;
  if (pathname === "/confidentialite") return <LegalPublicPage kind="confidentialite" />;
  if (pathname === "/conditions-utilisation") return <LegalPublicPage kind="conditions-utilisation" />;
  if (pathname === "/login" || pathname === "/connexion") return <LoginPage />;
  if (pathname === "/inscription") return <RegisterPage />;
  if (pathname === "/mot-de-passe-oublie") return <ForgotPasswordPage />;

  return <PublicNotFoundPage />;
}

function LegacyMotoSolutionRedirect() {
  useEffect(() => {
    window.history.replaceState({}, "", toBrowserPath("/solutions/automobile#deux-trois-roues"));
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);
  return null;
}
