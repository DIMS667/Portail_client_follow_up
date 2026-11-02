import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fromBrowserPath, isPortalDeployment, toBrowserPath } from "./base-path";
import { localStoragePortalRepository } from "../repositories/portal-repository";
import { appliquerCompteAuthentifie, obtenirMonCompte } from "../services/authentication-api";
import { fusionnerDemandesAutomobile, obtenirDemandesAutomobile } from "../services/automobile-request-api";
import { obtenirDemandesGenerales } from "../services/general-request-api";
import { obtenirSinistres } from "../services/claims-api";
import { creerFluxDocuments, fusionnerDocumentsServeur, obtenirDocuments } from "../services/documents-api";
import { creerFluxNotifications, obtenirNotifications } from "../services/notifications-api";
import { appliquerSouscriptions, obtenirSouscriptions } from "../services/subscription-api";
import { initialiserAlerteSonore, jouerAlerteSonore } from "../services/notification-sound";
import type { PortalStore } from "../types/domain";

type StoreUpdater = PortalStore | ((current: PortalStore) => PortalStore);

interface PortalContextValue {
  store: PortalStore;
  route: string;
  pathname: string;
  query: URLSearchParams;
  authenticationReady: boolean;
  updateStore: (updater: StoreUpdater) => void;
  navigate: (path: string) => void;
}

const PortalContext = createContext<PortalContextValue | null>(null);

function currentRoute() {
  return `${fromBrowserPath(window.location.pathname)}${window.location.search}`;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState(() => localStoragePortalRepository.load());
  const [route, setRoute] = useState(currentRoute);
  const [authenticationReady, setAuthenticationReady] = useState(!isPortalDeployment);

  useEffect(() => initialiserAlerteSonore(), []);

  useEffect(() => {
    if (!isPortalDeployment) return;
    let active = true;
    void obtenirMonCompte()
      .then(async (compte) => {
        const [demandesAutomobile, demandesGenerales, sinistres, documents, notifications, souscriptions] = await Promise.all([
          obtenirDemandesAutomobile().catch(() => []),
          obtenirDemandesGenerales().catch(() => []),
          obtenirSinistres().catch(() => []),
          obtenirDocuments(compte.id).catch(() => []),
          obtenirNotifications().catch(() => []),
          obtenirSouscriptions().catch(() => ({ offers: [], proposals: [], payments: [], contracts: [] })),
        ]);
        if (active) setStore((current) => {
          const authentifie = appliquerCompteAuthentifie(current, compte);
          const donneesMetier = {
            ...authentifie,
            requests: fusionnerDemandesAutomobile(authentifie.requests, [...demandesAutomobile, ...demandesGenerales]),
            claims: sinistres,
            documents: fusionnerDocumentsServeur(authentifie.documents, documents),
            notifications,
          };
          return appliquerSouscriptions(donneesMetier, souscriptions);
        });
      })
      .catch(() => {
        if (active) setStore((current) => ({ ...current, session: { authenticated: false } }));
      })
      .finally(() => {
        if (active) setAuthenticationReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isPortalDeployment || !store.session.authenticated || !store.client.id) return;
    let active = true;
    const flux = creerFluxDocuments();
    const actualiser = () => {
      void obtenirDocuments(store.client.id).then((documents) => {
        if (!active) return;
        setStore((current) => ({
          ...current,
          documents: fusionnerDocumentsServeur(current.documents, documents),
        }));
      }).catch(() => undefined);
    };
    flux.addEventListener("document", actualiser);
    return () => {
      active = false;
      flux.removeEventListener("document", actualiser);
      flux.close();
    };
  }, [store.client.id, store.session.authenticated]);

  useEffect(() => {
    if (!isPortalDeployment || !store.session.authenticated || !store.client.id) return;
    let active = true;
    let synchronisationEnCours = false;
    const flux = creerFluxNotifications();
    const actualiser = async () => {
      if (synchronisationEnCours) return;
      synchronisationEnCours = true;
      try {
        const [notifications, demandesAutomobile, demandesGenerales, souscriptions, sinistres, documents] = await Promise.all([
          obtenirNotifications().catch(() => null),
          obtenirDemandesAutomobile().catch(() => null),
          obtenirDemandesGenerales().catch(() => null),
          obtenirSouscriptions().catch(() => null),
          obtenirSinistres().catch(() => null),
          obtenirDocuments(store.client.id).catch(() => null),
        ]);
        if (!active) return;
        setStore((current) => {
          const notificationsConnues = new Set(current.notifications.map((item) => item.id));
          if (notifications?.some((item) => !notificationsConnues.has(item.id))) {
            void jouerAlerteSonore();
          }
          const demandesVehiculesActuelles = current.requests.filter((item) => (
            item.product === "automobile" || item.product === "moto"
          ));
          const demandesGeneralesActuelles = current.requests.filter((item) => (
            item.product !== "automobile" && item.product !== "moto"
          ));
          const donneesActualisees = {
            ...current,
            notifications: notifications ?? current.notifications,
            requests: fusionnerDemandesAutomobile(current.requests, [
              ...(demandesAutomobile ?? demandesVehiculesActuelles),
              ...(demandesGenerales ?? demandesGeneralesActuelles),
            ]),
            claims: sinistres ?? current.claims,
            documents: documents
              ? fusionnerDocumentsServeur(current.documents, documents)
              : current.documents,
          };
          return souscriptions
            ? appliquerSouscriptions(donneesActualisees, souscriptions)
            : donneesActualisees;
        });
      } finally {
        synchronisationEnCours = false;
      }
    };
    const demanderActualisation = () => { void actualiser(); };
    const actualiserSiVisible = () => {
      if (document.visibilityState === "visible") demanderActualisation();
    };
    flux.addEventListener("notification", demanderActualisation);
    flux.addEventListener("open", demanderActualisation);
    flux.addEventListener("error", demanderActualisation);
    document.addEventListener("visibilitychange", actualiserSiVisible);
    window.addEventListener("focus", demanderActualisation);
    window.addEventListener("online", demanderActualisation);
    const controlePeriodique = window.setInterval(actualiserSiVisible, 15_000);
    demanderActualisation();
    return () => {
      active = false;
      window.clearInterval(controlePeriodique);
      flux.removeEventListener("notification", demanderActualisation);
      flux.removeEventListener("open", demanderActualisation);
      flux.removeEventListener("error", demanderActualisation);
      document.removeEventListener("visibilitychange", actualiserSiVisible);
      window.removeEventListener("focus", demanderActualisation);
      window.removeEventListener("online", demanderActualisation);
      flux.close();
    };
  }, [store.client.id, store.session.authenticated]);

  useEffect(() => {
    const handlePopState = () => setRoute(currentRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    localStoragePortalRepository.save(store);
  }, [store]);

  const value = useMemo<PortalContextValue>(() => {
    const url = new URL(route, window.location.origin);
    return {
      store,
      route,
      pathname: url.pathname,
      query: url.searchParams,
      authenticationReady,
      updateStore: (updater) => setStore((current) => typeof updater === "function" ? updater(current) : updater),
      navigate: (path) => {
        window.history.pushState({}, "", toBrowserPath(path));
        setRoute(currentRoute());
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    };
  }, [authenticationReady, route, store]);

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal doit être utilisé dans PortalProvider");
  return context;
}
