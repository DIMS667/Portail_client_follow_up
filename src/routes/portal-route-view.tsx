import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { isPortalDeployment } from "../app/base-path";
import { usePortal } from "../app/portal-context";

const ClientShell = lazy(() => import("../components/client-shell").then((module) => ({ default: module.ClientShell })));
const ClaimDetailPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.ClaimDetailPage })));
const ClaimsPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.ClaimsPage })));
const ContractDetailPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.ContractDetailPage })));
const ContractsPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.ContractsPage })));
const DashboardPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.DashboardPage })));
const DocumentsPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.DocumentsPage })));
const HelpPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.HelpPage })));
const MessagesPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.MessagesPage })));
const NotFoundPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.NotFoundPage })));
const NotificationsPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.NotificationsPage })));
const PaymentsPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.PaymentsPage })));
const ProfilePage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.ProfilePage })));
const ProposalsPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.ProposalsPage })));
const RequestDetailPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.RequestDetailPage })));
const RequestsPage = lazy(() => import("../pages/client-pages").then((module) => ({ default: module.RequestsPage })));
const NewRequestPage = lazy(() => import("../pages/flow-pages").then((module) => ({ default: module.NewRequestPage })));
const OfferDetailPage = lazy(() => import("../pages/flow-pages").then((module) => ({ default: module.OfferDetailPage })));
const RenewalPage = lazy(() => import("../pages/flow-pages").then((module) => ({ default: module.RenewalPage })));
const NewClaimPage = lazy(() => import("../pages/new-claim-page").then((module) => ({ default: module.NewClaimPage })));
const LoginPage = lazy(() => import("../pages/public-pages").then((module) => ({ default: module.LoginPage })));

export function PortalRouteView() {
  const { pathname, store } = usePortal();
  const isPortalArea = pathname.startsWith("/espace") || (isPortalDeployment && pathname === "/");

  if (!isPortalArea) return isPortalDeployment ? <NotFoundPage /> : null;
  if (!store.session.authenticated) {
    return isPortalDeployment ? <PortalLoginRedirect /> : <LoginPage />;
  }

  let page: ReactNode;
  if (pathname === "/" || pathname === "/espace") page = <DashboardPage />;
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

  return (
    <ClientShell>
      <Suspense fallback={<PortalPageLoadingFallback />}>
        {page}
      </Suspense>
    </ClientShell>
  );
}

function PortalPageLoadingFallback() {
  return <div className="page-stack" role="status" aria-live="polite">Chargement de la page…</div>;
}

function PortalLoginRedirect() {
  useEffect(() => {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const loginUrl = currentPath === "/portail-client/"
      ? "/login/"
      : `/login/?retour=${encodeURIComponent(currentPath)}`;
    window.location.replace(loginUrl);
  }, []);
  return null;
}
