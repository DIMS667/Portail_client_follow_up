import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fromBrowserPath, isPortalDeployment, toBrowserPath } from "./base-path";
import { localStoragePortalRepository } from "../repositories/portal-repository";
import { appliquerCompteAuthentifie, obtenirMonCompte } from "../services/authentication-api";
import { fusionnerDemandesAutomobile, obtenirDemandesAutomobile } from "../services/automobile-request-api";
import { obtenirSinistres } from "../services/claims-api";
import { creerFluxDocuments, fusionnerDocumentsServeur, obtenirDocuments } from "../services/documents-api";
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
  resetDemo: () => void;
}

const PortalContext = createContext<PortalContextValue | null>(null);

function currentRoute() {
  return `${fromBrowserPath(window.location.pathname)}${window.location.search}`;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState(() => localStoragePortalRepository.load());
  const [route, setRoute] = useState(currentRoute);
  const [authenticationReady, setAuthenticationReady] = useState(!isPortalDeployment);

  useEffect(() => {
    if (!isPortalDeployment) return;
    let active = true;
    void obtenirMonCompte()
      .then(async (compte) => {
        const [demandes, sinistres, documents] = await Promise.all([
          obtenirDemandesAutomobile().catch(() => []),
          obtenirSinistres().catch(() => []),
          obtenirDocuments(compte.id).catch(() => []),
        ]);
        if (active) setStore((current) => {
          const authentifie = appliquerCompteAuthentifie(current, compte);
          return {
            ...authentifie,
            requests: fusionnerDemandesAutomobile(authentifie.requests, demandes),
            claims: sinistres,
            documents: fusionnerDocumentsServeur(authentifie.documents, documents),
          };
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
      resetDemo: () => setStore(localStoragePortalRepository.reset()),
    };
  }, [authenticationReady, route, store]);

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal doit être utilisé dans PortalProvider");
  return context;
}
