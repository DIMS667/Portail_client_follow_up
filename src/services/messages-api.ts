import { ErreurApi } from "./authentication-api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");
const BASE_URL = `${API_BASE_URL}/api/v1/frontoffice/messagerie`;

export type MessageConversation = {
  id: string;
  demande_reference: string;
  type_auteur: "client" | "courtier";
  auteur_nom: string;
  contenu: string;
  cree_le: string;
};

function csrfHeader(): HeadersInit {
  const prefix = `${encodeURIComponent("followup_csrf_client") }=`;
  const cookie = document.cookie.split("; ").find((value) => value.startsWith(prefix));
  return cookie ? { "X-CSRF-Token": decodeURIComponent(cookie.slice(prefix.length)) } : {};
}

async function requete<T>(path: string, options: RequestInit = {}): Promise<T> {
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
    throw new ErreurApi("La discussion est momentanément inaccessible.", 0);
  }
  if (!response.ok) {
    let message = "Le message n’a pas pu être traité.";
    try {
      const payload = await response.json() as { detail?: string };
      message = payload.detail || message;
    } catch {
      // La réponse peut ne pas contenir de JSON en cas d'incident réseau.
    }
    throw new ErreurApi(message, response.status);
  }
  return response.json() as Promise<T>;
}

export function listerMessages(reference: string) {
  return requete<MessageConversation[]>(`/${encodeURIComponent(reference)}`);
}

export function envoyerMessage(reference: string, contenu: string) {
  return requete<MessageConversation>(`/${encodeURIComponent(reference)}`, {
    method: "POST",
    headers: csrfHeader(),
    body: JSON.stringify({ contenu }),
  });
}

export function creerFluxMessages() {
  return new EventSource(`${BASE_URL}/flux`, { withCredentials: true });
}
