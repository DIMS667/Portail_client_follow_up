import { Suspense, useEffect } from "react";
import { isPortalDeployment } from "./app/base-path";
import { PortalProvider, usePortal } from "./app/portal-context";
import { WebMcpBridge } from "./app/webmcp";
import { PortalRouteView } from "./routes/portal-route-view";
import { PublicRouteView } from "./routes/public-route-view";

function RouteView() {
  const { pathname, store } = usePortal();

  useEffect(() => {
    let active = true;
    void import("./app/seo").then(({ applyRouteSeo }) => {
      if (active) applyRouteSeo(pathname);
    });

    const hashTarget = window.location.hash.slice(1);
    if (hashTarget) {
      window.requestAnimationFrame(() => document.getElementById(hashTarget)?.scrollIntoView());
    } else {
      window.scrollTo({ top: 0, left: 0 });
    }

    return () => {
      active = false;
    };
  }, [pathname]);

  if (!isPortalDeployment && import.meta.env.PROD && pathname === "/connexion") {
    return <BrowserRedirect to={`/login/${window.location.search}`} />;
  }

  if (!isPortalDeployment && import.meta.env.PROD && pathname.startsWith("/espace")) {
    const portalDestination = `/portail-client${pathname}${window.location.search}`;
    return (
      <BrowserRedirect
        to={store.session.authenticated
          ? portalDestination
          : `/login/?retour=${encodeURIComponent(portalDestination)}`}
      />
    );
  }

  const isPortalArea = pathname.startsWith("/espace") || (isPortalDeployment && pathname === "/");
  if (isPortalDeployment || isPortalArea) return <PortalRouteView />;

  return <PublicRouteView />;
}

function BrowserRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
}

function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#fbfdff" }}
    >
      <span className="sr-only">Chargement de la page…</span>
    </div>
  );
}

export function PortalApp() {
  return (
    <PortalProvider>
      <WebMcpBridge />
      <Suspense fallback={<RouteLoadingFallback />}>
        <RouteView />
      </Suspense>
    </PortalProvider>
  );
}
