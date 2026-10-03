import type { Claim, InsuranceRequest, PaymentMethod, PortalStore } from "../types/domain";

export const formatFcfa = (amount: number) => `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
export const formatDate = (date: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));

export function authenticate(store: PortalStore, identifier: string, password: string) {
  const normalized = identifier.trim().toLowerCase();
  if ((normalized === store.credentials.email || identifier.trim() === store.credentials.phone) && password === store.credentials.password) {
    return { ...store, session: { authenticated: true, clientId: store.client.id } };
  }
  return null;
}

export function signOut(store: PortalStore): PortalStore {
  return { ...store, session: { authenticated: false } };
}

export function createInsuranceRequest(store: PortalStore, data: Partial<InsuranceRequest>): { store: PortalStore; request: InsuranceRequest } {
  const sequence = store.requests.filter((item) => item.scope !== "scenario").length + 146;
  const reference = `DEM-2026-${String(sequence).padStart(5, "0")}`;
  const request: InsuranceRequest = {
    id: `REQ-${Date.now()}`, reference, clientId: store.client.id, product: data.product ?? "automobile", productLabel: data.productLabel ?? "Assurance automobile",
    date: new Date().toISOString().slice(0, 10), status: "new", advisorId: store.advisor.id, vehicle: data.vehicle,
    details: data.details, coverage: data.coverage, desiredStartDate: data.desiredStartDate, comments: data.comments,
    timeline: [{ label: "Demande envoyée", done: true, at: "Aujourd’hui" }, { label: "Analyse du besoin", done: false, active: true }, { label: "Préparation des propositions", done: false }, { label: "Propositions disponibles", done: false }, { label: "Choix de l’offre", done: false }, { label: "Documents", done: false }, { label: "Paiement", done: false }, { label: "Police disponible", done: false }], scope: "core",
  };
  return {
    request,
    store: {
      ...store,
      requests: [request, ...store.requests],
      notifications: [{ id: `NOT-${Date.now()}`, title: "Demande enregistrée", body: `Votre demande ${reference} a bien été enregistrée.`, date: new Date().toISOString(), route: `/espace/demandes/${reference}`, read: false, kind: "request" }, ...store.notifications],
    },
  };
}

export function selectOffer(store: PortalStore, requestReference: string, offerId: string): PortalStore {
  return {
    ...store,
    requests: store.requests.map((request) => request.reference === requestReference ? { ...request, selectedOfferId: offerId, status: "documents_required" as const } : request),
    notifications: [{ id: `NOT-${Date.now()}`, title: "Offre sélectionnée", body: "Votre choix a été enregistré. Vous pouvez transmettre les documents demandés.", date: new Date().toISOString(), route: "/espace/documents", read: false, kind: "proposal" }, ...store.notifications],
  };
}

export function replaceDocument(store: PortalStore, documentId: string, file: File): PortalStore {
  return { ...store, documents: store.documents.map((document) => document.id === documentId ? { ...document, fileName: file.name, type: file.type || document.type, date: new Date().toISOString().slice(0, 10), status: "received" as const, correctionMessage: undefined } : document) };
}

export function simulatePayment(store: PortalStore, success: boolean, method: PaymentMethod): PortalStore {
  if (!success) return store;
  const exists = store.payments.some((payment) => payment.reference === "PAY-2026-00046");
  if (exists) return store;
  return {
    ...store,
    payments: [{ id: "PAY-004", reference: "PAY-2026-00046", requestId: "REQ-005", amount: 105000, date: new Date().toISOString().slice(0, 10), method, status: "succeeded" }, ...store.payments],
    requests: store.requests.map((request) => request.id === "REQ-005" ? { ...request, status: "policy_issuing" as const } : request),
    notifications: [{ id: `NOT-${Date.now()}`, title: "Paiement effectué avec succès", body: "Votre paiement de 105 000 FCFA est confirmé. Le contrat est en préparation.", date: new Date().toISOString(), route: "/espace/paiements", read: false, kind: "payment" }, ...store.notifications],
  };
}

export function addMessage(store: PortalStore, body: string): PortalStore {
  return { ...store, messages: [...store.messages, { id: `MSG-${Date.now()}`, sender: "client", body, sentAt: new Date().toISOString() }] };
}

export function markNotificationRead(store: PortalStore, id: string): PortalStore {
  return { ...store, notifications: store.notifications.map((notification) => notification.id === id ? { ...notification, read: true } : notification) };
}

export function updateProfile(store: PortalStore, client: PortalStore["client"]): PortalStore {
  return { ...store, client };
}

export function requestRenewal(store: PortalStore, contractId: string, choice: "same" | "change" | "new_offers"): PortalStore {
  return { ...store, renewals: store.renewals.map((renewal) => renewal.contractId === contractId ? { ...renewal, choice, status: "requested" as const } : renewal) };
}

export function createClaim(store: PortalStore, input: Pick<Claim, "contractId" | "type" | "date" | "location" | "description">): { store: PortalStore; claim: Claim } {
  const claim: Claim = { id: `CLAIM-${Date.now()}`, reference: `SIN-2026-${String(store.claims.length + 19).padStart(5, "0")}`, productLabel: store.contracts.find((contract) => contract.policyNumber === input.contractId)?.productLabel ?? "Assurance", status: "submitted", timeline: [{ label: "Déclaration reçue", done: true }, { label: "Analyse du dossier", done: false, active: true }, { label: "Documents vérifiés", done: false }, { label: "Transmis à la compagnie", done: false }, { label: "Expertise", done: false }, { label: "Décision", done: false }, { label: "Indemnisation", done: false }, { label: "Clôture", done: false }], scope: "core", ...input };
  return { claim, store: { ...store, claims: [claim, ...store.claims], notifications: [{ id: `NOT-${Date.now()}`, title: "Déclaration enregistrée", body: `Votre déclaration ${claim.reference} a bien été enregistrée.`, date: new Date().toISOString(), route: `/espace/sinistres/${claim.reference}`, read: false, kind: "claim" }, ...store.notifications] } };
}
