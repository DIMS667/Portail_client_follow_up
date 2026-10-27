import { createDemoSeed } from "../data/demo-seed";
import type { PortalStore } from "../types/domain";

const STORAGE_KEY = "portail-client-demo:v1:db";
const FAKE_DOCUMENT_IDS = new Set(["DOC-001", "DOC-002", "DOC-003", "DOC-004", "DOC-005"]);

export interface PortalRepository {
  load(): PortalStore;
  save(store: PortalStore): void;
  reset(): PortalStore;
}

function cloneSeed() {
  return structuredClone(createDemoSeed());
}

function migrateStore(store: PortalStore): PortalStore {
  return {
    ...store,
    documents: store.documents.filter((document) => !FAKE_DOCUMENT_IDS.has(document.id)),
  };
}

export const localStoragePortalRepository: PortalRepository = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneSeed();
      const parsed = JSON.parse(raw) as PortalStore;
      return parsed.version === 1 ? migrateStore(parsed) : cloneSeed();
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
