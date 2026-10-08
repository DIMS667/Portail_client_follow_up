import { useEffect } from "react";
import { PortalProvider, usePortal } from "./app/portal-context";
import { WebMcpBridge } from "./app/webmcp";
import { ClientShell } from "./components/client-shell";
import {
  ClaimDetailPage, ClaimsPage, ContractDetailPage, ContractsPage, DashboardPage, DocumentsPage,
  HelpPage, MessagesPage, NotFoundPage, NotificationsPage, PaymentsPage, ProfilePage,
  ProposalsPage, RequestDetailPage, RequestsPage,
} from "./pages/client-pages";
import { NewRequestPage, OfferDetailPage, RenewalPage } from "./pages/flow-pages";
import { NewClaimPage } from "./pages/new-claim-page";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "./pages/public-pages";
import { adviceArticleBySlug, solutionPages, type AdviceArticleSlug, type SolutionSlug } from "./public-site/data/public-pages";
import {
  AboutPublicPage,
  AdviceArticlePublicPage,
  AdvicePublicPage,
  BusinessesPublicPage,
  ClaimsPublicPage,
  ContactPublicPage,
  FaqPublicPage,
  IndividualsPublicPage,
  LegalPublicPage,
  PublicNotFoundPage,
  SolutionDetailPublicPage,
  SolutionsPublicPage,
} from "./public-site/pages/content-pages";
import { HomePage } from "./public-site/pages/home-page";

function RouteView() {
  const { pathname, store } = usePortal();
  useEffect(() => {
    document.title = routeDocumentTitle(pathname);
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  if (pathname === "/") return <HomePage />;
  if (pathname === "/a-propos") return <AboutPublicPage />;
  if (pathname === "/solutions") return <SolutionsPublicPage />;
  if (/^\/solutions\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split("/")[2]) as SolutionSlug;
    return slug in solutionPages ? <SolutionDetailPublicPage slug={slug} /> : <PublicNotFoundPage />;
  }
  if (pathname === "/particuliers") return <IndividualsPublicPage />;
  if (pathname === "/entreprises") return <BusinessesPublicPage />;
  if (pathname === "/sinistres") return <ClaimsPublicPage />;
  if (pathname === "/conseils") return <AdvicePublicPage />;
  if (/^\/conseils\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split("/")[2]) as AdviceArticleSlug;
    return slug in adviceArticleBySlug ? <AdviceArticlePublicPage slug={slug} /> : <PublicNotFoundPage />;
  }
  if (pathname === "/contact") return <ContactPublicPage />;
  if (pathname === "/faq") return <FaqPublicPage />;
  if (pathname === "/mentions-legales") return <LegalPublicPage kind="mentions-legales" />;
  if (pathname === "/confidentialite") return <LegalPublicPage kind="confidentialite" />;
  if (pathname === "/conditions-utilisation") return <LegalPublicPage kind="conditions-utilisation" />;
  if (pathname === "/connexion") return <LoginPage />;
  if (pathname === "/inscription") return <RegisterPage />;
  if (pathname === "/mot-de-passe-oublie") return <ForgotPasswordPage />;

  if (!pathname.startsWith("/espace")) return <PublicNotFoundPage />;

  if (pathname.startsWith("/espace") && !store.session.authenticated) {
    return <LoginPage />;
  }

  let page: React.ReactNode;
  if (pathname === "/espace") page = <DashboardPage />;
  else if (pathname === "/espace/demandes") page = <RequestsPage />;
  else if (pathname === "/espace/demandes/nouvelle") page = <NewRequestPage />;
  else if (/^\/espace\/demandes\/[^/]+\/propositions$/.test(pathname)) page = <ProposalsPage requestReference={decodeURIComponent(pathname.split("/")[3])} />;
  else if (/^\/espace\/demandes\/[^/]+$/.test(pathname)) page = <RequestDetailPage reference={decodeURIComponent(pathname.split("/")[3])} />;
  else if (/^\/espace\/offres\/[^/]+$/.test(pathname)) page = <OfferDetailPage offerId={decodeURIComponent(pathname.split("/")[3])} />;
  else if (pathname === "/espace/documents") page = <DocumentsPage />;
  else if (pathname === "/espace/paiements") page = <PaymentsPage />;
  else if (pathname === "/espace/contrats") page = <ContractsPage />;
  else if (/^\/espace\/contrats\/[^/]+$/.test(pathname)) page = <ContractDetailPage policyNumber={decodeURIComponent(pathname.split("/")[3])} />;
  else if (/^\/espace\/renouvellements\/[^/]+$/.test(pathname)) page = <RenewalPage policyNumber={decodeURIComponent(pathname.split("/")[3])} />;
  else if (pathname === "/espace/sinistres") page = <ClaimsPage />;
  else if (pathname === "/espace/sinistres/nouveau") page = <NewClaimPage />;
  else if (/^\/espace\/sinistres\/[^/]+$/.test(pathname)) page = <ClaimDetailPage reference={decodeURIComponent(pathname.split("/")[3])} />;
  else if (pathname === "/espace/messagerie") page = <MessagesPage />;
  else if (pathname === "/espace/notifications") page = <NotificationsPage />;
  else if (pathname === "/espace/profil") page = <ProfilePage />;
  else if (pathname === "/espace/aide") page = <HelpPage />;
  else page = <NotFoundPage />;

  return <ClientShell>{page}</ClientShell>;
}

function routeDocumentTitle(pathname: string) {
  if (pathname === "/") return "Follow-Up Insurance | Courtier en assurances";
  if (/^\/solutions\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split("/")[2]) as SolutionSlug;
    if (slug in solutionPages) return solutionPages[slug].metaTitle;
  }
  if (/^\/conseils\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split("/")[2]) as AdviceArticleSlug;
    if (slug in adviceArticleBySlug) return `${adviceArticleBySlug[slug].title} | Follow-Up Insurance`;
  }
  return `${routeTitle(pathname)} — FOLLOW-UP INSURANCE`;
}

function routeTitle(pathname: string) {
  if (pathname === "/a-propos") return "À propos";
  if (pathname.startsWith("/solutions")) return "Nos solutions";
  if (pathname === "/particuliers") return "Particuliers";
  if (pathname === "/entreprises") return "Entreprises";
  if (pathname === "/sinistres") return "Sinistres";
  if (pathname.startsWith("/conseils")) return "Conseils";
  if (pathname === "/contact") return "Contact";
  if (pathname === "/faq") return "Questions fréquentes";
  if (pathname === "/mentions-legales") return "Mentions légales";
  if (pathname === "/confidentialite") return "Politique de confidentialité";
  if (pathname === "/conditions-utilisation") return "Conditions d’utilisation";
  if (pathname.includes("propositions")) return "Propositions";
  if (pathname.includes("offres")) return "Détail de l’offre";
  if (pathname.includes("demandes/nouvelle")) return "Nouvelle demande";
  if (pathname.includes("demandes")) return "Mes demandes";
  if (pathname.includes("documents")) return "Mes documents";
  if (pathname.includes("paiements")) return "Mes paiements";
  if (pathname.includes("contrats")) return "Mes assurances";
  if (pathname.includes("renouvellements")) return "Renouvellement";
  if (pathname.includes("sinistres")) return "Mes sinistres";
  if (pathname.includes("messagerie")) return "Messagerie";
  if (pathname.includes("notifications")) return "Notifications";
  if (pathname.includes("profil")) return "Mon profil";
  if (pathname.includes("aide")) return "Aide";
  if (pathname.includes("connexion")) return "Connexion";
  return "Mon espace assurance";
}

export function PortalApp() {
  return <PortalProvider><WebMcpBridge /><RouteView /></PortalProvider>;
}
