import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { isPortalDeployment } from "../app/base-path";
import { usePortal } from "../app/portal-context";
import { DelayedLoading, PortalPageSkeleton, PortalSessionSkeleton } from "../components/portal-loading";

const ClientShell = lazy(() => import("../components/client-shell").then((module) => ({ default: module.ClientShell })));
const ConversationPage = lazy(() => import("../pages/conversation-page").then((module) => ({ default: module.ConversationPage })));
const NewClaimPage = lazy(() => import("../pages/new-claim-page").then((module) => ({ default: module.NewClaimPage })));

const ClientPageRoute = lazy(() => import("./client-page-route"));
const RequestPageRoute = lazy(() => import("./request-page-route"));
const AuthPageRoute = lazy(() => import("./auth-page-route"));

export function PortalRouteView() {
  const { authenticationReady, pathname, store } = usePortal();
  const isPortalArea = pathname.startsWith("/espace") || (isPortalDeployment && pathname === "/");

  if (!isPortalArea) return isPortalDeployment ? <ClientPageRoute pathname={pathname} /> : null;
  if (!authenticationReady) return <PortalSessionLoadingFallback />;
  if (!store.session.authenticated) {
    return isPortalDeployment ? <PortalLoginRedirect /> : <AuthPageRoute pathname={pathname} />;
  }

  let page: ReactNode;
  if (pathname === "/espace/demandes/nouvelle" || /^\/espace\/offres\/[^/]+$/.test(pathname)) page = <RequestPageRoute pathname={pathname} />;
  else if (/^\/espace\/demandes\/[^/]+\/discussion$/.test(pathname)) page = <ConversationPage requestReference={decodeURIComponent(pathname.split("/")[3])} />;
  else if (pathname === "/espace/sinistres/nouveau") page = <NewClaimPage />;
  else page = <ClientPageRoute pathname={pathname} />;

  return (
    <Suspense fallback={<PortalSessionLoadingFallback />}>
      <ClientShell>
        <Suspense fallback={<PortalPageLoadingFallback />}>
          {page}
        </Suspense>
      </ClientShell>
    </Suspense>
  );
}

function PortalSessionLoadingFallback() {
  return <DelayedLoading><PortalSessionSkeleton /></DelayedLoading>;
}

function PortalPageLoadingFallback() {
  return <DelayedLoading><PortalPageSkeleton /></DelayedLoading>;
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
