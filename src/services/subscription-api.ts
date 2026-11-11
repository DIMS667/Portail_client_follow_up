import type { Contract, InsuranceProduct, Offer, Payment, PortalStore, Proposal } from "../types/domain";
import { ErreurApi } from "./authentication-api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");
const BASE_URL = `${API_BASE_URL}/api/v1/frontoffice/souscriptions`;

interface OffreApi {
  id: string;
  reference: string;
  demande_reference: string;
  produit: InsuranceProduct;
  libelle_produit: string;
  prime_xaf: number;
  duree_mois: number;
  date_effet: string;
  franchise_xaf: number;
  garanties: string[];
  options: string[];
  exclusions: string[];
  documents_requis: string[];
  recommandee: boolean;
  conseil: string;
  selectionnee: boolean;
}

interface PaiementApi {
  id: string;
  reference: string;
  demande_reference: string;
  offre_id: string;
  montant_xaf: number;
  numero_telephone: string;
  statut: "initialisation" | "en_attente" | "reussi" | "echoue" | "a_verifier";
  operateur?: string | null;
  code_ussd?: string | null;
  contrat_reference?: string | null;
  cree_le: string;
}

interface ContratApi {
  id: string;
  reference: string;
  numero_police?: string | null;
  demande_reference: string;
  offre_reference: string;
  paiement_id?: string | null;
  produit: InsuranceProduct;
  libelle_produit: string;
  prime_xaf: number;
  duree_mois: number;
  franchise_xaf: number;
  statut: "en_preparation" | "actif" | "expire";
  date_effet: string;
  date_expiration: string;
  garanties: string[];
  options: string[];
  exclusions: string[];
  documents_requis: string[];
}

function csrfHeader(): HeadersInit {
  const prefix = `${encodeURIComponent("followup_csrf_client") }=`;
  const cookie = document.cookie.split("; ").find((value) => value.startsWith(prefix));
  return cookie ? { "X-CSRF-Token": decodeURIComponent(cookie.slice(prefix.length)) } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ErreurApi("Le service de souscription est momentanément inaccessible.", 0);
  }
  if (!response.ok) {
    let message = "L’opération n’a pas pu être traitée.";
    try {
      const payload = await response.json() as {
        detail?: string;
        erreur?: { message?: string; details?: Array<{ message?: string }> };
      };
      message = payload.detail
        || payload.erreur?.details?.find((detail) => detail.message)?.message
        || payload.erreur?.message
        || message;
    } catch {
      // Un proxy indisponible peut renvoyer une réponse sans JSON.
    }
    throw new ErreurApi(message, response.status);
  }
  return response.json() as Promise<T>;
}

function mapOffer(item: OffreApi): Offer {
  return {
    id: item.id,
    reference: item.reference,
    proposalId: `PROP-${item.demande_reference}`,
    product: item.libelle_produit,
    premium: item.prime_xaf,
    duration: `${item.duree_mois} mois`,
    effectiveDate: item.date_effet,
    deductible: item.franchise_xaf,
    guarantees: item.garanties,
    options: item.options,
    exclusions: item.exclusions,
    requiredDocuments: item.documents_requis,
    requestReference: item.demande_reference,
    recommended: item.recommandee,
    selected: item.selectionnee,
    advice: item.conseil,
  };
}

function mapPayment(item: PaiementApi): Payment {
  return {
    id: item.id,
    reference: item.reference,
    contractId: item.contrat_reference ?? undefined,
    requestId: item.demande_reference,
    amount: item.montant_xaf,
    date: item.cree_le.slice(0, 10),
    method: "mobile_money",
    status: item.statut === "reussi" ? "succeeded" : item.statut === "echoue" ? "failed" : "pending",
    providerStatus: item.statut,
    phone: item.numero_telephone,
    operator: item.operateur ?? undefined,
    ussdCode: item.code_ussd ?? undefined,
  };
}

function mapContract(item: ContratApi): Contract {
  return {
    id: item.id,
    policyNumber: item.numero_police || item.reference,
    clientId: "",
    product: item.produit,
    productLabel: item.libelle_produit,
    effectiveDate: item.date_effet,
    expirationDate: item.date_expiration,
    premium: item.prime_xaf,
    status: item.statut === "actif" ? "active" : item.statut === "expire" ? "expired" : "preparing",
    guarantees: item.garanties,
    documentIds: [],
    paymentIds: item.paiement_id ? [item.paiement_id] : [],
    claimIds: [],
    requestId: item.demande_reference,
    offerReference: item.offre_reference,
  };
}

export async function obtenirSouscriptions() {
  const [offresApi, paiementsApi, contratsApi] = await Promise.all([
    request<OffreApi[]>("/offres"),
    request<PaiementApi[]>("/paiements"),
    request<ContratApi[]>("/contrats"),
  ]);
  const offers = offresApi.map(mapOffer);
  const grouped = new Map<string, Offer[]>();
  offers.forEach((offer) => grouped.set(
    offer.requestReference!,
    [...(grouped.get(offer.requestReference!) ?? []), offer],
  ));
  const proposals: Proposal[] = [...grouped.entries()].map(([requestReference, items]) => ({
    id: `PROP-${requestReference}`,
    reference: `PROPOSITION-${requestReference}`,
    requestId: requestReference,
    offerIds: items.map((offer) => offer.id),
    recommendedOfferId: items.find((offer) => offer.recommended)?.id,
    advice: items.find((offer) => offer.recommended)?.advice
      || items.find((offer) => offer.advice)?.advice
      || "Comparez les garanties et le coût avant de confirmer votre choix.",
  }));
  return {
    offers,
    proposals,
    payments: paiementsApi.map(mapPayment),
    contracts: contratsApi.map(mapContract),
  };
}

export async function selectionnerOffre(referenceDemande: string, offreId: string) {
  return mapOffer(await request<OffreApi>(`/demandes/${encodeURIComponent(referenceDemande)}/selection`, {
    method: "POST",
    headers: csrfHeader(),
    body: JSON.stringify({ offre_id: offreId }),
  }));
}

export async function initialiserPaiement(referenceDemande: string, numeroTelephone: string, operateur: "MTN" | "ORANGE") {
  return mapPayment(await request<PaiementApi>("/paiements", {
    method: "POST",
    headers: csrfHeader(),
    body: JSON.stringify({
      demande_reference: referenceDemande,
      numero_telephone: numeroTelephone,
      operateur,
    }),
  }));
}

export async function verifierPaiement(paiementId: string) {
  return mapPayment(await request<PaiementApi>(`/paiements/${paiementId}/verification`, {
    method: "POST",
    headers: csrfHeader(),
  }));
}

export function appliquerSouscriptions(
  store: PortalStore,
  data: Awaited<ReturnType<typeof obtenirSouscriptions>>,
): PortalStore {
  const selectedByRequest = new Map(
    data.offers.filter((offer) => offer.selected).map((offer) => [offer.requestReference, offer.id]),
  );
  const proposalByRequest = new Map(data.proposals.map((proposal) => [proposal.requestId, proposal.id]));
  return {
    ...store,
    offers: data.offers,
    proposals: data.proposals,
    payments: data.payments,
    contracts: data.contracts,
    requests: store.requests.map((item) => {
      const selectedOfferId = selectedByRequest.get(item.reference);
      const paymentSucceeded = data.payments.some((payment) => (
        payment.requestId === item.reference && payment.status === "succeeded"
      ));
      const contractExists = data.contracts.some((contract) => contract.requestId === item.reference);
      const statusBeforeContract = selectedOfferId
        && item.status === "proposals_available"
        ? "offer_selected"
        : item.status;
      const status = (contractExists || paymentSucceeded)
        && ["proposals_available", "offer_selected", "documents_required", "payment_pending"].includes(statusBeforeContract)
        ? "policy_issuing"
        : statusBeforeContract;
      return {
        ...item,
        status,
        proposalId: proposalByRequest.get(item.reference),
        selectedOfferId,
      };
    }),
  };
}
