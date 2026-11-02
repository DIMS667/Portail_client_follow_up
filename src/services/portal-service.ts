import type { PortalStore } from "../types/domain";

export const formatFcfa = (amount: number) => `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
export const formatDate = (date: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));

export function signOut(store: PortalStore): PortalStore {
  return { ...store, session: { authenticated: false } };
}

export function removeDocument(store: PortalStore, documentId: string): PortalStore {
  return { ...store, documents: store.documents.filter((document) => document.id !== documentId) };
}

export function markNotificationRead(store: PortalStore, id: string): PortalStore {
  return { ...store, notifications: store.notifications.map((notification) => notification.id === id ? { ...notification, read: true } : notification) };
}

export function updateProfile(store: PortalStore, client: PortalStore["client"]): PortalStore {
  return { ...store, client };
}
