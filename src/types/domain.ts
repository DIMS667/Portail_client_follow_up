export type InsuranceProduct =
  | "automobile"
  | "moto"
  | "sante"
  | "vie_capitalisation"
  | "voyage"
  | "habitation"
  | "entreprise"
  | "caution";
export type RequestStatus = "new" | "under_review" | "proposals_available" | "offer_selected" | "documents_required" | "payment_pending" | "policy_issuing" | "policy_available" | "completed";
export type DocumentStatus = "required" | "received" | "reviewing" | "validated" | "correction_required";
export type PaymentStatus = "pending" | "succeeded" | "failed";
export type ContractStatus = "preparing" | "active" | "expired";
export type ClaimStatus = "submitted" | "under_review" | "documents_pending" | "documents_verified" | "sent_to_insurer" | "expertise" | "decision" | "indemnification" | "indemnified" | "closed";
export type PaymentMethod = "mobile_money" | "orange_money" | "bank_card" | "bank_transfer";
export type AutomobileVehicleKind = "car" | "moto";

export type AutoRequestType = "new_vehicle" | "renewal" | "switch_insurer" | "advice" | "other";
export type AutoVehicleCategory = "tourism";
export type AutoVehicleEnergy = "petrol" | "diesel";
export type AutoVehicleUsage =
  | "cat1_professional"
  | "cat2_product_transport"
  | "cat3_transport"
  | "personal"
  | "professional"
  | "transport"
  | "other";
export type AutoCoverageDurationMonths = 2 | 4 | 6 | 8 | 12;
export interface AutomobilePartySnapshot {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}
export interface AutomobileDriver {
  isSubscriber: boolean;
  firstNames?: string;
  lastName?: string;
  birthDate?: string;
  phone?: string;
  occupation?: string;
  licenceNumber?: string;
  licenceCategory?: string;
  licenceIssuedOn?: string;
  licenceValidUntil?: string;
}
export type AutoGuarantee =
  | "civil_liability"
  | "defense_and_recours"
  | "glass_all_risk"
  | "glass_outside_all_risk"
  | "glass_and_light_blocks"
  | "third_party_collision"
  | "all_accident_damage"
  | "fire"
  | "fire_and_electrical_risks"
  | "robbery"
  | "total_theft"
  | "total_partial_theft"
  | "repair_assistance"
  | "advance_on_recours"
  | "ipt";

export interface SelfServiceAutomobileInsuranceRequestData {
  completionMode: "self_service";
  requestType: AutoRequestType;
  otherNeed?: string;
  subscriber: AutomobilePartySnapshot;
  insured: AutomobilePartySnapshot;
  driver: AutomobileDriver;
  vehicle: {
    category: AutoVehicleCategory;
    brand: string;
    model: string;
    year: number;
    registration: string;
    energy: AutoVehicleEnergy;
    fiscalPower: number;
    seatCount: number;
    chassisNumber: string;
    usage: AutoVehicleUsage;
    estimatedValue: number | null;
    carriesFlammableMaterials: boolean;
    hasTrailer: boolean;
  };
  coverage: {
    durationMonths: AutoCoverageDurationMonths;
    desiredStartDate: string | null;
    startDateUnknown?: boolean;
    guarantees: AutoGuarantee[];
  };
  hasVignette: boolean;
}

export interface BrokerDelegatedAutomobileInsuranceRequestData {
  completionMode: "broker_delegation";
  delegatedMessage: string;
}

export type AutomobileInsuranceRequestData =
  | SelfServiceAutomobileInsuranceRequestData
  | BrokerDelegatedAutomobileInsuranceRequestData;

export type MotoVehicleEnergy = "petrol" | "electric";
export type MotoVehicleUsage = "cat5" | "cat5_bis";
export type MotoGuarantee =
  | "civil_liability"
  | "defense_and_recours"
  | "third_party_collision"
  | "all_accident_damage"
  | "fire"
  | "robbery"
  | "total_theft"
  | "total_partial_theft"
  | "repair_assistance"
  | "advance_on_recours"
  | "ipt";

export interface SelfServiceMotoInsuranceRequestData {
  completionMode: "self_service";
  requestType: AutoRequestType;
  otherNeed?: string;
  subscriber: AutomobilePartySnapshot;
  insured: AutomobilePartySnapshot;
  driver: AutomobileDriver;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    registration: string;
    energy: MotoVehicleEnergy;
    cylinderCapacity: number;
    seatCount: number;
    chassisNumber: string;
    usage: MotoVehicleUsage;
    estimatedValue: number | null;
    carriesFlammableMaterials: boolean;
    hasTrailer: boolean;
  };
  coverage: {
    durationMonths: AutoCoverageDurationMonths;
    desiredStartDate: string | null;
    startDateUnknown?: boolean;
    guarantees: MotoGuarantee[];
  };
  hasVignette: boolean;
}

export interface BrokerDelegatedMotoInsuranceRequestData {
  completionMode: "broker_delegation";
  delegatedMessage: string;
}

export type MotoInsuranceRequestData =
  | SelfServiceMotoInsuranceRequestData
  | BrokerDelegatedMotoInsuranceRequestData;

export type HealthRelationship = "principal" | "spouse" | "child";
export type HealthSex = "female" | "male";
export type HealthAnswer = "yes" | "no";

export interface HealthInsuredPerson {
  id: string;
  relationship: HealthRelationship;
  lastName: string;
  firstNames: string;
  maidenName?: string;
  sex: HealthSex | "";
  birthDate: string;
  city: string;
  occupation: string;
  desiredStartDate: string;
}

export interface HealthQuestionAnswer {
  answer: HealthAnswer | "";
  details?: string;
}

export interface HealthInsuranceRequestData {
  subscriberName: string;
  insuredName: string;
  adhesionFor: "employee" | "family" | "other";
  insuredPeople: HealthInsuredPerson[];
  medicalAnswers: Record<string, Record<string, HealthQuestionAnswer>>;
  familyHistory?: string;
  previousInsurance?: string;
  socialCoverage?: string;
  otherChildren?: string;
  additionalMedicalInformation?: string;
  declarationAccepted: boolean;
  signedBy: string;
  signedAt: string;
  signedIn: string;
}

export interface StatusEvent { label: string; at?: string; done: boolean; active?: boolean; }
export interface Client { id: string; firstName: string; lastName: string; phone: string; email: string; address: string; city: string; preferences: { email: boolean; whatsapp: boolean; inApp: boolean }; }
export interface Advisor { id: string; name: string; phone: string; email: string; initials: string; role?: "courtier" | "admin" | "super_admin"; }
export interface RequestDocumentReference { id: string; title: string; fileName?: string; type: string; folder: string; status: DocumentStatus; date?: string; }
export interface InsuranceRequest {
  id: string; reference: string; clientId: string; product: InsuranceProduct; productLabel: string; date: string; status: RequestStatus; advisorId: string;
  advisor?: Advisor | null;
  vehicleKind?: AutomobileVehicleKind;
  vehicle?: { brand: string; model: string; year: string; registration: string; value: number | null; usage: string };
  automobileRequest?: AutomobileInsuranceRequestData;
  motoRequest?: MotoInsuranceRequestData;
  healthRequest?: HealthInsuranceRequestData;
  documents?: RequestDocumentReference[];
  details?: Record<string, string>;
  coverage?: string; desiredStartDate?: string; comments?: string; proposalId?: string; selectedOfferId?: string; timeline: StatusEvent[]; scope?: "core" | "scenario";
}
export interface Proposal { id: string; reference: string; requestId: string; offerIds: string[]; recommendedOfferId: string; advice: string; }
export interface Offer { id: string; reference: string; proposalId: string; provider: string; product: string; premium: number; duration: string; effectiveDate: string; deductible: number; guarantees: string[]; options: string[]; exclusions: string[]; requiredDocuments: string[]; }
export interface ClientDocument { id: string; title: string; category: string; type: string; ownerId: string; status: DocumentStatus; fileName?: string; date?: string; correctionMessage?: string; downloadUrl?: string; }
export interface Payment { id: string; reference: string; contractId?: string; requestId?: string; amount: number; date: string; method: PaymentMethod; status: PaymentStatus; }
export interface Contract { id: string; policyNumber: string; clientId: string; product: InsuranceProduct; productLabel: string; provider: string; effectiveDate: string; expirationDate: string; premium: number; status: ContractStatus; guarantees: string[]; documentIds: string[]; paymentIds: string[]; claimIds: string[]; }
export interface Renewal { id: string; reference: string; contractId: string; expirationDate: string; currentPremium: number; status: "eligible" | "requested"; choice?: "same" | "change" | "new_offers"; }

export interface AutoClaimPerson {
  lastName: string;
  firstNames: string;
  profession: string;
  address: string;
  phone: string;
  email: string;
}

export interface AutoClaimDriver extends AutoClaimPerson {
  age: string;
  relationship: string;
  licenceNumber: string;
  licenceCategory: string;
  licenceIssuedOn: string;
  licenceIssuedAt: string;
  licenceValidUntil: string;
  capacityCertificateNumber: string;
  capacityCertificateIssuedOn: string;
  capacityCertificateIssuedAt: string;
  capacityCertificateValidUntil: string;
}

export interface AutoClaimAdversary extends AutoClaimPerson {
  insurer: string;
  broker: string;
  policyNumber: string;
  registration: string;
}

export interface AutoClaimVehicle {
  type: string;
  brand: string;
  registration: string;
  firstRegistrationDate: string;
  technicalInspectionValidUntil: string;
  usage: string;
}

export interface AutoClaimInjuredPerson {
  name: string;
  relationship: string;
  injuries: string;
  hospital: string;
  admissionDate: string;
}

export interface AutoClaimWitness {
  name: string;
  address: string;
  phone: string;
}

export interface AutoClaimCircumstance {
  code: string;
  label: string;
  vehicleA: boolean;
  vehicleB: boolean;
}

export interface AutoClaimDeclaration {
  clientNumber: string;
  pointOfSale: string;
  policyEffectiveDate: string;
  policyExpiryDate: string;
  accidentTime: string;
  insured: AutoClaimPerson;
  insuredDriver: AutoClaimDriver;
  adversePartyInvolved: boolean;
  adversary?: AutoClaimAdversary;
  adversaryDriver?: AutoClaimDriver;
  insuredVehicle: AutoClaimVehicle;
  adverseVehicle?: AutoClaimVehicle;
  circumstances: AutoClaimCircumstance[];
  sketchFileName?: string;
  impactPointA: string;
  impactPointB: string;
  damageDescriptionA: string;
  damageDescriptionB: string;
  narrative: string;
  injuriesInVehicle: AutoClaimInjuredPerson[];
  otherInjuries: AutoClaimInjuredPerson[];
  witnesses: AutoClaimWitness[];
  policeReportBy: string;
  gendarmerie: string;
  brigade: string;
  attestedAt: string;
}

export interface Claim {
  id: string;
  reference: string;
  contractId: string;
  productLabel: string;
  type: string;
  date: string;
  location: string;
  description: string;
  status: ClaimStatus;
  timeline: StatusEvent[];
  scope?: "core" | "scenario";
  autoDeclaration?: AutoClaimDeclaration;
  attachments?: string[];
  advisor?: Advisor | null;
}
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
