import { useEffect } from "react";
import { PortalProvider, usePortal } from "./app/portal-context";
import { WebMcpBridge } from "./app/webmcp";
import { ClientShell } from "./components/client-shell";
import {
  ClaimDetailPage, ClaimsPage, ContractDetailPage, ContractsPage, DashboardPage, DocumentsPage,
  HelpPage, MessagesPage, NotFoundPage, NotificationsPage, PaymentsPage, ProfilePage,
  ProposalsPage, RequestDetailPage, RequestsPage,
} from "./pages/client-pages";
import { NewClaimPage, NewRequestPage, OfferDetailPage, RenewalPage } from "./pages/flow-pages";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "./pages/public-pages";

function RouteView() {
  const { pathname, store } = usePortal();
  useEffect(() => {
    const title = pathname === "/" ? "Connexion — FOLLOW-UP INSURANCE" : `${routeTitle(pathname)} — FOLLOW-UP INSURANCE`;
    document.title = title;
  }, [pathname]);

  if (pathname === "/") return <LoginPage />;
  if (pathname === "/connexion") return <LoginPage />;
  if (pathname === "/inscription") return <RegisterPage />;
  if (pathname === "/mot-de-passe-oublie") return <ForgotPasswordPage />;

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

function routeTitle(pathname: string) {
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
