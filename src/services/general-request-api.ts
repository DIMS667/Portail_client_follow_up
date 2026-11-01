import type { InsuranceProduct, InsuranceRequest, RequestStatus, StatusEvent } from "../types/domain";

type StatutApi =
  | "nouvelle"
  | "en_analyse"
  | "propositions_disponibles"
  | "offre_selectionnee"
  | "documents_requis"
  | "paiement_en_attente"
  | "contrat_en_preparation"
  | "police_disponible"
  | "finalisee";

type DemandeGeneraleApi = {
  id: string;
  reference: string;
  produit: Exclude<InsuranceProduct, "automobile" | "moto">;
  libelle_produit: string;
  mode_preparation: "saisie_directe" | "delegation_courtier";
  statut: StatutApi;
  donnees: Partial<InsuranceRequest>;
  cree_le: string;
  modifie_le: string;
  historique_statuts: Array<{ statut: StatutApi; cree_le: string }>;
  courtier: null | {
    id: string;
    nom_complet: string;
    adresse_email: string;
    numero_telephone: string;
    role: "gestionnaire" | "admin" | "super_admin";
  };
};

const API_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://api.followupassurance.com/api/v1").replace(/\/$/, "");
const BASE_URL = `${API_URL}/frontoffice/demandes`;

const statuts: Record<StatutApi, RequestStatus> = {
  nouvelle: "new",
  en_analyse: "under_review",
  propositions_disponibles: "proposals_available",
  offre_selectionnee: "offer_selected",
  documents_requis: "documents_required",
  paiement_en_attente: "payment_pending",
  contrat_en_preparation: "policy_issuing",
  police_disponible: "policy_available",
  finalisee: "completed",
};

const chaine: Array<{ statut: StatutApi; libelle: string }> = [
  { statut: "nouvelle", libelle: "Demande envoyée" },
  { statut: "en_analyse", libelle: "Analyse du besoin" },
  { statut: "propositions_disponibles", libelle: "Propositions disponibles" },
  { statut: "offre_selectionnee", libelle: "Offre sélectionnée" },
  { statut: "documents_requis", libelle: "Documents" },
  { statut: "paiement_en_attente", libelle: "Paiement" },
  { statut: "contrat_en_preparation", libelle: "Création du contrat" },
  { statut: "police_disponible", libelle: "Contrat disponible" },
  { statut: "finalisee", libelle: "Dossier finalisé" },
];

function csrfHeaders(): HeadersInit {
  const prefix = `${encodeURIComponent("followup_csrf_client") }=`;
  const cookie = document.cookie.split("; ").find((item) => item.startsWith(prefix));
  return cookie ? { "X-CSRF-Token": decodeURIComponent(cookie.slice(prefix.length)) } : {};
}

async function request<T>(options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(BASE_URL, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...csrfHeaders(),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Le service est momentanément inaccessible. Vérifiez votre connexion puis réessayez.");
  }
  if (!response.ok) {
    let message = "La demande n’a pas pu être traitée.";
    try {
      const body = await response.json() as { erreur?: { message?: string }; detail?: string };
      message = body.erreur?.message ?? body.detail ?? message;
    } catch {
      // La réponse peut ne pas être au format JSON.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

function toPortalRequest(api: DemandeGeneraleApi): InsuranceRequest {
  const currentIndex = Math.max(0, chaine.findIndex((step) => step.statut === api.statut));
  const history = new Map(api.historique_statuts.map((item) => [item.statut, item.cree_le]));
  const timeline: StatusEvent[] = chaine.map((step, index) => ({
    label: step.libelle,
    at: history.has(step.statut) ? new Date(history.get(step.statut)!).toLocaleDateString("fr-FR") : undefined,
    done: index < currentIndex || api.statut === "finalisee",
    active: index === currentIndex && api.statut !== "finalisee",
  }));
  const advisor = api.courtier ? {
    id: api.courtier.id,
    name: api.courtier.nom_complet,
    email: api.courtier.adresse_email,
    phone: api.courtier.numero_telephone,
    initials: api.courtier.nom_complet.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    role: api.courtier.role,
  } : null;
  return {
    ...api.donnees,
    id: api.id,
    reference: api.reference,
    clientId: "",
    product: api.produit,
    productLabel: api.libelle_produit,
    date: api.cree_le.slice(0, 10),
    status: statuts[api.statut],
    advisorId: advisor?.id ?? "",
    advisor,
    timeline,
    scope: "core",
  };
}

export async function creerDemandeGenerale(data: Partial<InsuranceRequest>) {
  const product = data.product;
  if (!product || product === "automobile" || product === "moto") {
    throw new Error("Le produit d’assurance n’est pas valide.");
  }
  const delegated = data.details?.["Mode de préparation"] === "Délégué au courtier";
  const api = await request<DemandeGeneraleApi>({
    method: "POST",
    body: JSON.stringify({
      produit: product,
      libelle_produit: data.productLabel ?? "Demande d’assurance",
      mode_preparation: delegated ? "delegation_courtier" : "saisie_directe",
      donnees: data,
    }),
  });
  return toPortalRequest(api);
}

export async function obtenirDemandesGenerales() {
  return (await request<DemandeGeneraleApi[]>()).map(toPortalRequest);
}
