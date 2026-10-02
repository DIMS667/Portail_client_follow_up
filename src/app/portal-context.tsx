import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { localStoragePortalRepository } from "../repositories/portal-repository";
import type { PortalStore } from "../types/domain";

type StoreUpdater = PortalStore | ((current: PortalStore) => PortalStore);

interface PortalContextValue {
  store: PortalStore;
  route: string;
  pathname: string;
  query: URLSearchParams;
  updateStore: (updater: StoreUpdater) => void;
  navigate: (path: string) => void;
  resetDemo: () => void;
}

const PortalContext = createContext<PortalContextValue | null>(null);

function currentRoute() {
  return `${window.location.pathname}${window.location.search}`;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState(() => localStoragePortalRepository.load());
  const [route, setRoute] = useState(currentRoute);

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
      updateStore: (updater) => setStore((current) => typeof updater === "function" ? updater(current) : updater),
      navigate: (path) => {
        window.history.pushState({}, "", path);
        setRoute(currentRoute());
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      resetDemo: () => setStore(localStoragePortalRepository.reset()),
    };
  }, [route, store]);

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal doit être utilisé dans PortalProvider");
  return context;
}
