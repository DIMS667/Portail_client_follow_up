import type { ClientDocument, DocumentStatus } from "../types/domain";
import { ErreurApi } from "./authentication-api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");
const DOCUMENTS_BASE_URL = `${API_BASE_URL}/api/v1/frontoffice/documents`;

type DocumentApi = {
  id: string;
  rubrique_id: string;
  dossier: string;
  titre: string;
  type_document: string;
  nom_fichier: string;
  type_mime: string;
  taille_octets: number;
  statut: string;
  motif_correction: string | null;
  commentaire_correction: string | null;
  version: number;
  cree_le: string;
  modifie_le: string;
};

const statutsDepuisApi: Record<string, DocumentStatus> = {
  requis: "required",
  recu: "received",
  en_verification: "reviewing",
  valide: "validated",
  correction_requise: "correction_required",
};

const motifsCorrection: Record<string, string> = {
  illisible: "Le document est illisible.",
  mauvais_document: "Le fichier ne correspond pas au document demandé.",
  incomplet: "Le document transmis est incomplet.",
  expire: "Le document transmis est expiré.",
  informations_non_concordantes: "Certaines informations ne concordent pas.",
  autre: "Le document doit être remplacé.",
};

function lireCookie(nom: string) {
  const prefixe = `${encodeURIComponent(nom)}=`;
  const cookie = document.cookie.split("; ").find((valeur) => valeur.startsWith(prefixe));
  return cookie ? decodeURIComponent(cookie.slice(prefixe.length)) : undefined;
}

async function appeler<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const entetes = new Headers(options.headers);
  const jetonCsrf = lireCookie("followup_csrf_client");
  if (jetonCsrf && options.method && options.method !== "GET") {
    entetes.set("X-CSRF-Token", jetonCsrf);
  }
  let reponse: Response;
  try {
    reponse = await fetch(`${DOCUMENTS_BASE_URL}${chemin}`, {
      ...options,
      credentials: "include",
      headers: entetes,
    });
  } catch {
    throw new ErreurApi("Le service documentaire est momentanément inaccessible.", 0);
  }
  if (!reponse.ok) {
    let message = "L’opération sur le document a échoué.";
    try {
      const payload = await reponse.json() as { detail?: string; erreur?: { message?: string } };
      message = payload.erreur?.message || payload.detail || message;
    } catch {
      // La réponse peut ne pas contenir de JSON.
    }
    throw new ErreurApi(message, reponse.status);
  }
  if (reponse.status === 204) return undefined as T;
  return reponse.json() as Promise<T>;
}

function versDocumentClient(documentApi: DocumentApi, ownerId: string): ClientDocument {
  const motif = documentApi.motif_correction
    ? motifsCorrection[documentApi.motif_correction] ?? "Le document doit être remplacé."
    : "";
  const correctionMessage = [motif, documentApi.commentaire_correction]
    .filter(Boolean)
    .join(" ");
  return {
    id: documentApi.id,
    title: documentApi.titre,
    category: documentApi.dossier,
    type: documentApi.type_document,
    ownerId,
    status: statutsDepuisApi[documentApi.statut] ?? "received",
    slotId: documentApi.rubrique_id,
    fileName: documentApi.nom_fichier,
    date: documentApi.modifie_le.slice(0, 10),
    correctionMessage: correctionMessage || undefined,
  };
}

export async function obtenirDocuments(ownerId: string) {
  const documents = await appeler<DocumentApi[]>("");
  return documents.map((document) => versDocumentClient(document, ownerId));
}

export async function televerserDocument(rubriqueId: string, fichier: File, ownerId: string) {
  const corps = new FormData();
  corps.append("fichier", fichier);
  const document = await appeler<DocumentApi>(`/${encodeURIComponent(rubriqueId)}`, {
    method: "PUT",
    body: corps,
  });
  return versDocumentClient(document, ownerId);
}

export function supprimerDocument(documentId: string) {
  return appeler<void>(`/${encodeURIComponent(documentId)}`, { method: "DELETE" });
}

export function obtenirLienConsultation(documentId: string) {
  return appeler<{ url: string; expire_dans_secondes: number }>(
    `/${encodeURIComponent(documentId)}/consultation`,
  );
}

export function creerFluxDocuments() {
  return new EventSource(`${DOCUMENTS_BASE_URL}/flux`, { withCredentials: true });
}

export function fusionnerDocumentsServeur(
  documentsLocaux: ClientDocument[],
  documentsServeur: ClientDocument[],
) {
  return [
    ...documentsServeur,
    ...documentsLocaux.filter((document) => document.downloadUrl || !document.slotId),
  ];
}
