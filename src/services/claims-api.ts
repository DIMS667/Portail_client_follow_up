import type {
  Advisor,
  AutoClaimDeclaration,
  Claim,
  ClaimStatus,
  InsuranceProduct,
  StatusEvent,
} from "../types/domain";
import { ErreurApi } from "./authentication-api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");
const SINISTRES_BASE_URL = `${API_BASE_URL}/api/v1/frontoffice/sinistres`;

type StatutSinistreApi =
  | "declare"
  | "en_analyse"
  | "documents_en_attente"
  | "documents_verifies"
  | "transmis_assureur"
  | "expertise"
  | "decision"
  | "indemnisation_en_cours"
  | "indemnise"
  | "cloture";

interface SinistreApi {
  id: string;
  reference: string;
  contrat_reference: string;
  produit: string;
  libelle_produit: string;
  type_sinistre: string;
  date_sinistre: string;
  lieu: string;
  description: string;
  declaration_automobile?: AutoClaimDeclaration | null;
  pieces_jointes: string[];
  statut: StatutSinistreApi;
  cree_le: string;
  historique_statuts: Array<{ statut: StatutSinistreApi; cree_le: string }>;
  courtier?: {
    id: string;
    nom_complet: string;
    adresse_email: string;
    numero_telephone: string;
    role: "courtier" | "admin" | "super_admin";
  } | null;
}

export interface NouveauSinistre {
  contractId: string;
  product: InsuranceProduct;
  productLabel: string;
  type: string;
  date: string;
  location: string;
  description: string;
  autoDeclaration?: AutoClaimDeclaration;
  attachments?: string[];
}

const statutsPortail: Record<StatutSinistreApi, ClaimStatus> = {
  declare: "submitted",
  en_analyse: "under_review",
  documents_en_attente: "documents_pending",
  documents_verifies: "documents_verified",
  transmis_assureur: "sent_to_insurer",
  expertise: "expertise",
  decision: "decision",
  indemnisation_en_cours: "indemnification",
  indemnise: "indemnified",
  cloture: "closed",
};

const chaineStatuts: Array<{ statut: StatutSinistreApi; libelle: string }> = [
  { statut: "declare", libelle: "Déclaration transmise" },
  { statut: "en_analyse", libelle: "Analyse du dossier" },
  { statut: "documents_en_attente", libelle: "Documents en attente" },
  { statut: "documents_verifies", libelle: "Documents vérifiés" },
  { statut: "transmis_assureur", libelle: "Transmis à l’assureur" },
  { statut: "expertise", libelle: "Expertise" },
  { statut: "decision", libelle: "Décision de l’assureur" },
  { statut: "indemnisation_en_cours", libelle: "Indemnisation en cours" },
  { statut: "indemnise", libelle: "Indemnisé" },
  { statut: "cloture", libelle: "Sinistre clôturé" },
];

function enteteCsrf(): HeadersInit {
  const prefixe = `${encodeURIComponent("followup_csrf_client") }=`;
  const cookie = document.cookie.split("; ").find((valeur) => valeur.startsWith(prefixe));
  return cookie ? { "X-CSRF-Token": decodeURIComponent(cookie.slice(prefixe.length)) } : {};
}

async function envoyer<T>(options: RequestInit = {}): Promise<T> {
  let reponse: Response;
  try {
    reponse = await fetch(SINISTRES_BASE_URL, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ErreurApi("Le service des sinistres est momentanément inaccessible.", 0);
  }
  if (!reponse.ok) {
    let message = "Le sinistre n’a pas pu être enregistré.";
    try {
      const corps = await reponse.json() as { erreur?: { message?: string; details?: Array<{ message?: string }> } };
      message = corps.erreur?.details?.find((detail) => detail.message)?.message
        || corps.erreur?.message
        || message;
    } catch {
      // Le proxy peut renvoyer une réponse non JSON.
    }
    throw new ErreurApi(message, reponse.status);
  }
  return reponse.json() as Promise<T>;
}

function versCourtier(api: SinistreApi): Advisor | null {
  if (!api.courtier) return null;
  return {
    id: api.courtier.id,
    name: api.courtier.nom_complet,
    phone: api.courtier.numero_telephone,
    email: api.courtier.adresse_email,
    initials: api.courtier.nom_complet.split(/\s+/).filter(Boolean)
      .map((partie) => partie[0]).join("").slice(0, 2).toUpperCase(),
    role: api.courtier.role,
  };
}

function versSinistrePortail(api: SinistreApi): Claim {
  const indexActuel = chaineStatuts.findIndex((etape) => etape.statut === api.statut);
  const historique = new Map(api.historique_statuts.map((item) => [item.statut, item.cree_le]));
  const timeline: StatusEvent[] = chaineStatuts.map((etape, index) => ({
    label: etape.libelle,
    at: historique.has(etape.statut)
      ? new Date(historique.get(etape.statut)!).toLocaleDateString("fr-FR")
      : undefined,
    done: index < indexActuel || api.statut === "cloture",
    active: index === indexActuel && api.statut !== "cloture",
  }));
  return {
    id: api.id,
    reference: api.reference,
    contractId: api.contrat_reference,
    productLabel: api.libelle_produit,
    type: api.type_sinistre,
    date: api.date_sinistre,
    location: api.lieu,
    description: api.description,
    status: statutsPortail[api.statut],
    timeline,
    scope: "core",
    autoDeclaration: api.declaration_automobile ?? undefined,
    attachments: api.pieces_jointes,
    advisor: versCourtier(api),
  };
}

export async function creerSinistre(entree: NouveauSinistre) {
  const resultat = await envoyer<SinistreApi>({
    method: "POST",
    headers: enteteCsrf(),
    body: JSON.stringify({
      contrat_reference: entree.contractId,
      produit: entree.product,
      libelle_produit: entree.productLabel,
      type_sinistre: entree.type,
      date_sinistre: entree.date,
      lieu: entree.location,
      description: entree.description,
      declaration_automobile: entree.autoDeclaration,
      pieces_jointes: entree.attachments ?? [],
    }),
  });
  return versSinistrePortail(resultat);
}

export async function obtenirSinistres() {
  const resultats = await envoyer<SinistreApi[]>();
  return resultats.map(versSinistrePortail);
}
