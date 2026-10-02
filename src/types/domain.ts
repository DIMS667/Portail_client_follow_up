export type InsuranceProduct = "automobile" | "moto" | "sante" | "voyage" | "habitation" | "entreprise";
export type RequestStatus = "new" | "under_review" | "proposals_available" | "offer_selected" | "documents_required" | "payment_pending" | "policy_issuing" | "policy_available" | "completed";
export type DocumentStatus = "required" | "received" | "reviewing" | "validated" | "correction_required";
export type PaymentStatus = "pending" | "succeeded" | "failed";
export type ContractStatus = "preparing" | "active" | "expired";
export type ClaimStatus = "submitted" | "under_review" | "documents_verified" | "sent_to_insurer" | "expertise" | "decision" | "indemnification" | "closed";
export type PaymentMethod = "mobile_money" | "orange_money" | "bank_card" | "bank_transfer";

export interface StatusEvent { label: string; at?: string; done: boolean; active?: boolean; }
export interface Client { id: string; firstName: string; lastName: string; phone: string; email: string; address: string; city: string; preferences: { email: boolean; sms: boolean; whatsapp: boolean; inApp: boolean }; }
export interface Advisor { id: string; name: string; phone: string; email: string; initials: string; }
export interface InsuranceRequest {
  id: string; reference: string; clientId: string; product: InsuranceProduct; productLabel: string; date: string; status: RequestStatus; advisorId: string;
  vehicle?: { brand: string; model: string; year: string; registration: string; value: number; usage: string };
  coverage?: string; desiredStartDate?: string; comments?: string; proposalId?: string; selectedOfferId?: string; timeline: StatusEvent[]; scope?: "core" | "scenario";
}
export interface Proposal { id: string; reference: string; requestId: string; offerIds: string[]; recommendedOfferId: string; advice: string; }
export interface Offer { id: string; reference: string; proposalId: string; provider: string; product: string; premium: number; duration: string; effectiveDate: string; deductible: number; guarantees: string[]; options: string[]; exclusions: string[]; requiredDocuments: string[]; }
export interface ClientDocument { id: string; title: string; category: string; type: string; ownerId: string; status: DocumentStatus; fileName?: string; date?: string; correctionMessage?: string; downloadUrl?: string; }
export interface Payment { id: string; reference: string; contractId?: string; requestId?: string; amount: number; date: string; method: PaymentMethod; status: PaymentStatus; }
export interface Contract { id: string; policyNumber: string; clientId: string; product: InsuranceProduct; productLabel: string; provider: string; effectiveDate: string; expirationDate: string; premium: number; status: ContractStatus; guarantees: string[]; documentIds: string[]; paymentIds: string[]; claimIds: string[]; }
export interface Renewal { id: string; reference: string; contractId: string; expirationDate: string; currentPremium: number; status: "eligible" | "requested"; choice?: "same" | "change" | "new_offers"; }
export interface Claim { id: string; reference: string; contractId: string; productLabel: string; type: string; date: string; location: string; description: string; status: ClaimStatus; timeline: StatusEvent[]; scope?: "core" | "scenario"; }
export interface Message { id: string; sender: "client" | "advisor"; body: string; sentAt: string; }
export interface Notification { id: string; title: string; body: string; date: string; route: string; read: boolean; kind: string; }
export interface Activity { id: string; label: string; date: string; route: string; kind: string; }
export interface DemoScenario { id: string; number: number; title: string; description: string; route: string; }

export interface PortalStore {
  version: 1;
  session: { authenticated: boolean; clientId?: string };
  credentials: { email: string; phone: string; password: string };
  client: Client;
  advisor: Advisor;
  requests: InsuranceRequest[];
  proposals: Proposal[];
  offers: Offer[];
  documents: ClientDocument[];
  payments: Payment[];
  contracts: Contract[];
  renewals: Renewal[];
  claims: Claim[];
  messages: Message[];
  notifications: Notification[];
  activities: Activity[];
  scenarios: DemoScenario[];
}
