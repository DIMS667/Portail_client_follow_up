import type { PortalStore } from "../types/domain";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");

const AUTH_BASE_URL = `${API_BASE_URL}/api/v1/frontoffice/authentification`;

export interface CompteClientAuthentifie {
  id: string;
  nom_complet: string;
  adresse_email: string;
  numero_telephone: string;
}

export interface ProfilClientAuthentifie extends CompteClientAuthentifie {
  adresse: string;
  ville: string;
  preferences_notifications: {
    email: boolean;
    whatsapp: boolean;
    application: boolean;
  };
}

function estProfilClient(compte: CompteClientAuthentifie): compte is ProfilClientAuthentifie {
  return "adresse" in compte && "ville" in compte && "preferences_notifications" in compte;
}

interface AuthentificationReussie {
  statut: "connecte";
  compte: CompteClientAuthentifie;
}

export type ConnexionGoogleResultat = AuthentificationReussie | {
  statut: "telephone_requis";
  message: string;
};

interface ErreurApiPayload {
  erreur?: {
    code?: string;
    message?: string;
    details?: Array<{ message?: string }>;
  };
}

export class ErreurApi extends Error {
  constructor(
    message: string,
    public readonly statut: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ErreurApi";
  }
}

async function envoyer<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  let reponse: Response;
  try {
    reponse = await fetch(`${AUTH_BASE_URL}${chemin}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ErreurApi("Le service est momentanément inaccessible. Vérifiez votre connexion puis réessayez.", 0);
  }

  if (!reponse.ok) {
    let payload: ErreurApiPayload | null = null;
    try {
      payload = await reponse.json() as ErreurApiPayload;
    } catch {
      // La réponse peut ne pas contenir de JSON (proxy indisponible, par exemple).
    }
    const detailValidation = payload?.erreur?.details?.find((detail) => detail.message)?.message;
    throw new ErreurApi(
      detailValidation || payload?.erreur?.message || "La demande n’a pas pu être traitée.",
      reponse.status,
      payload?.erreur?.code,
    );
  }

  if (reponse.status === 204) return undefined as T;
  return reponse.json() as Promise<T>;
}

export function inscrireParEmail(entree: {
  nom_complet: string;
  adresse_email: string;
  numero_telephone: string;
  mot_de_passe: string;
  confirmation_mot_de_passe: string;
}) {
  return envoyer<{ message: string }>("/inscriptions/email", {
    method: "POST",
    body: JSON.stringify(entree),
  });
}

export function verifierInscription(adresseEmail: string, code: string) {
  return envoyer<AuthentificationReussie>("/inscriptions/email/verifications", {
    method: "POST",
    body: JSON.stringify({ adresse_email: adresseEmail, code }),
  });
}

export function connecterParEmail(adresseEmail: string, motDePasse: string) {
  return envoyer<AuthentificationReussie>("/connexions/email", {
    method: "POST",
    body: JSON.stringify({ adresse_email: adresseEmail, mot_de_passe: motDePasse }),
  });
}

export function connecterParGoogle(jetonIdentite: string, numeroTelephone?: string) {
  return envoyer<ConnexionGoogleResultat>("/connexions/google", {
    method: "POST",
    body: JSON.stringify({
      jeton_identite: jetonIdentite,
      ...(numeroTelephone ? { numero_telephone: numeroTelephone } : {}),
    }),
  });
}

export function demanderOtpMotDePasse(adresseEmail: string) {
  return envoyer<{ message: string }>("/mots-de-passe/otp", {
    method: "POST",
    body: JSON.stringify({ adresse_email: adresseEmail }),
  });
}

export function reinitialiserMotDePasse(entree: {
  adresse_email: string;
  code: string;
  nouveau_mot_de_passe: string;
  confirmation_mot_de_passe: string;
}) {
  return envoyer<void>("/mots-de-passe/reinitialisations", {
    method: "POST",
    body: JSON.stringify(entree),
  });
}

export function obtenirMonCompte() {
  return envoyer<ProfilClientAuthentifie>("/moi");
}

export function mettreAJourMonCompte(entree: {
  nomComplet: string;
  numeroTelephone: string;
  adresse: string;
  ville: string;
  preferences: { email: boolean; whatsapp: boolean; inApp: boolean };
}) {
  return envoyer<ProfilClientAuthentifie>("/moi", {
    method: "PATCH",
    headers: enteteCsrf(),
    body: JSON.stringify({
      nom_complet: entree.nomComplet,
      numero_telephone: entree.numeroTelephone,
      adresse: entree.adresse,
      ville: entree.ville,
      preferences_notifications: {
        email: entree.preferences.email,
        whatsapp: entree.preferences.whatsapp,
        application: entree.preferences.inApp,
      },
    }),
  });
}

export function deconnecter() {
  return envoyer<void>("/deconnexion", {
    method: "POST",
    headers: enteteCsrf(),
  });
}

function enteteCsrf(): HeadersInit {
  const jetonCsrf = lireCookie("followup_csrf_client");
  return jetonCsrf ? { "X-CSRF-Token": jetonCsrf } : {};
}

function lireCookie(nom: string) {
  const prefixe = `${encodeURIComponent(nom)}=`;
  const cookie = document.cookie.split("; ").find((valeur) => valeur.startsWith(prefixe));
  return cookie ? decodeURIComponent(cookie.slice(prefixe.length)) : undefined;
}

export function appliquerCompteAuthentifie(store: PortalStore, compte: CompteClientAuthentifie): PortalStore {
  const morceauxNom = compte.nom_complet.trim().split(/\s+/);
  const firstName = morceauxNom.shift() || compte.nom_complet;
  const lastName = morceauxNom.join(" ");
  return {
    ...store,
    session: { authenticated: true, clientId: compte.id },
    client: {
      ...store.client,
      id: compte.id,
      firstName,
      lastName,
      email: compte.adresse_email,
      phone: compte.numero_telephone,
      ...(estProfilClient(compte) ? {
        address: compte.adresse,
        city: compte.ville,
        preferences: {
          email: compte.preferences_notifications.email,
          whatsapp: compte.preferences_notifications.whatsapp,
          inApp: compte.preferences_notifications.application,
        },
      } : {}),
    },
  };
}
