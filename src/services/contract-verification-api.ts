const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");

export type ContractVerificationStatus = "authentique" | "brouillon" | "expire" | "remplace" | "invalide";

export interface ContractVerification {
  statut: ContractVerificationStatus;
  integrite_confirmee: boolean;
  message: string;
  reference: string;
  numero_police: string | null;
  version: number;
  empreinte_courte: string;
  produit: string;
  assureur: string;
  offre_reference: string;
  date_effet: string;
  date_expiration: string;
  duree_mois: number;
  prime_ttc_xaf: number;
  franchise_xaf: number;
  souscripteur: {
    nom_complet: string;
    telephone_masque: string;
    ville: string;
  };
  vehicule: {
    marque: string;
    modele: string;
    immatriculation: string;
    numero_chassis_masque: string;
    usage: string;
    energie: string;
    puissance_fiscale: string;
  };
  garanties: Array<{
    libelle: string;
    capital_montant: string;
    franchise: string;
    prime_xaf: number;
  }>;
  decomposition_prime: {
    prime_nette_xaf: number;
    accessoires_xaf: number;
    fichier_asac_xaf: number;
    taxes_xaf: number;
    carte_cemac_xaf: number;
    dta_xaf: number;
    autres_frais_xaf: number;
  };
  prepare_par: {
    nom_complet: string;
    fonction: string;
  };
  genere_le: string | null;
}

export async function verifyContract(code: string, version: string | null, fingerprint: string | null) {
  const query = new URLSearchParams();
  if (version) query.set("v", version);
  if (fingerprint) query.set("e", fingerprint);
  const response = await fetch(
    `${API_BASE_URL}/api/v1/verification/contrats/${encodeURIComponent(code)}?${query.toString()}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error(response.status === 404
      ? "Ce QR code ne correspond à aucun contrat FOLLOW-UP INSURANCE."
      : "La vérification est momentanément indisponible.");
  }
  return response.json() as Promise<ContractVerification>;
}
