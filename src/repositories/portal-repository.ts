import { createDemoSeed } from "../data/demo-seed";
import type { PortalStore } from "../types/domain";

const STORAGE_KEY = "portail-client-demo:v1:db";

export interface PortalRepository {
  load(): PortalStore;
  save(store: PortalStore): void;
  reset(): PortalStore;
}

function cloneSeed() {
  return structuredClone(createDemoSeed());
}

export const localStoragePortalRepository: PortalRepository = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneSeed();
      const parsed = JSON.parse(raw) as PortalStore;
      return parsed.version === 1 ? parsed : cloneSeed();
    } catch {
      return cloneSeed();
    }
  },
  save(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    return cloneSeed();
  },
};

export { STORAGE_KEY };
