const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");

export interface DemandeContact {
  nom_complet: string;
  adresse_email: string;
  numero_telephone: string;
  objet: string;
  message: string;
  consentement: true;
  site_web: string;
}

interface ErreurApiPayload {
  erreur?: {
    message?: string;
    details?: Array<{ message?: string }>;
  };
}

export async function envoyerDemandeContact(demande: DemandeContact): Promise<void> {
  let reponse: Response;
  try {
    reponse = await fetch(`${API_BASE_URL}/api/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(demande),
    });
  } catch {
    throw new Error("Le service de contact est momentanément inaccessible. Vérifiez votre connexion puis réessayez.");
  }

  if (!reponse.ok) {
    let payload: ErreurApiPayload | null = null;
    try {
      payload = await reponse.json() as ErreurApiPayload;
    } catch {
      // Le proxy peut renvoyer une réponse sans corps JSON.
    }
    const detailValidation = payload?.erreur?.details?.find((detail) => detail.message)?.message;
    throw new Error(
      detailValidation
      || payload?.erreur?.message
      || "Votre message n’a pas pu être envoyé. Veuillez réessayer.",
    );
  }
}
