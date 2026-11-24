import { lazy, useEffect } from "react";
import { toBrowserPath } from "../app/base-path";
import { usePortal } from "../app/portal-context";
const HomePage = lazy(() => import("../public-site/pages/home-page").then((module) => ({ default: module.HomePage })));
const PublicContentRoute = lazy(() => import("./public-content-route"));
const AuthPageRoute = lazy(() => import("./auth-page-route"));
const ContractVerificationPage = lazy(() => import("../public-site/pages/contract-verification-page").then((module) => ({ default: module.ContractVerificationPage })));

export function PublicRouteView() {
  const { pathname } = usePortal();

  if (pathname === "/") return <HomePage />;
  if (pathname === "/solutions/moto") return <LegacyMotoSolutionRedirect />;
  if (["/login", "/connexion", "/inscription", "/mot-de-passe-oublie"].includes(pathname)) return <AuthPageRoute pathname={pathname} />;
  if (/^\/verifier-contrat\/[^/]+$/.test(pathname)) {
    const code = decodeURIComponent(pathname.split("/")[2]);
    return <ContractVerificationPage code={code} />;
  }
  return <PublicContentRoute pathname={pathname} />;
}

function LegacyMotoSolutionRedirect() {
  useEffect(() => {
    window.history.replaceState({}, "", toBrowserPath("/solutions/automobile#deux-trois-roues"));
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);
  return null;
}
