import { createInitialStore } from "../data/initial-store";
import type { PortalStore } from "../types/domain";

const STORAGE_KEY = "portail-client-demo:v1:db";

export interface PortalRepository {
  load(): PortalStore;
  save(store: PortalStore): void;
}

function initialStore() {
  return structuredClone(createInitialStore());
}

export const localStoragePortalRepository: PortalRepository = {
  load() {
    localStorage.removeItem(STORAGE_KEY);
    return initialStore();
  },
  save(_store) {
    // Les donnees metier proviennent de l'API et ne sont jamais remplacees par un cache local.
  },
};

export { STORAGE_KEY };
