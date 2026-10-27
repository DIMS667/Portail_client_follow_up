import type { ClientDocument, InsuranceProduct, RequestDocumentReference } from "../types/domain";

export type DocumentFolderId =
  | "informations_personnelles"
  | "automobile"
  | "sante"
  | "vie_capitalisation"
  | "habitation"
  | "voyage"
  | "entreprise"
  | "caution"
  | "sinistres";

export interface DocumentSlotDefinition {
  id: string;
  title: string;
  type: string;
}

export const documentSlotsByFolder: Record<DocumentFolderId, readonly DocumentSlotDefinition[]> = {
  informations_personnelles: [
    { id: "identite_cni", title: "Carte nationale d’identité", type: "CNI" },
    { id: "identite_passeport", title: "Passeport", type: "Passeport" },
    { id: "identite_domicile", title: "Justificatif de domicile", type: "Justificatif de domicile" },
  ],
  automobile: [
    { id: "automobile_permis", title: "Permis de conduire", type: "Permis" },
    { id: "automobile_carte_grise", title: "Carte grise", type: "Carte grise" },
    { id: "automobile_photo_vehicule", title: "Photo du véhicule", type: "Photo" },
    { id: "automobile_visite_technique", title: "Visite technique", type: "Visite technique" },
  ],
  sante: [
    { id: "sante_identite_beneficiaires", title: "Pièces d’identité des bénéficiaires", type: "Pièce d’identité" },
    { id: "sante_actes_naissance", title: "Actes de naissance des enfants", type: "Acte de naissance" },
    { id: "sante_justificatif_familial", title: "Justificatif de situation familiale", type: "Justificatif" },
  ],
  vie_capitalisation: [
    { id: "vie_identite_beneficiaire", title: "Pièce d’identité du bénéficiaire", type: "Pièce d’identité" },
    { id: "vie_acte_naissance", title: "Acte de naissance du bénéficiaire", type: "Acte de naissance" },
    { id: "vie_coordonnees_bancaires", title: "Relevé d’identité bancaire", type: "RIB" },
  ],
  habitation: [
    { id: "habitation_titre_bail", title: "Titre de propriété ou bail", type: "Justificatif du logement" },
    { id: "habitation_photos", title: "Photos du logement", type: "Photo" },
    { id: "habitation_inventaire", title: "Inventaire des biens à assurer", type: "Inventaire" },
  ],
  voyage: [
    { id: "voyage_passeport", title: "Passeport", type: "Passeport" },
    { id: "voyage_billet", title: "Billet ou réservation de voyage", type: "Réservation" },
    { id: "voyage_visa", title: "Visa", type: "Visa" },
  ],
  entreprise: [
    { id: "entreprise_registre_commerce", title: "Registre de commerce", type: "Registre de commerce" },
    { id: "entreprise_carte_contribuable", title: "Carte de contribuable", type: "Carte de contribuable" },
    { id: "entreprise_statuts", title: "Statuts de l’entreprise", type: "Statuts" },
    { id: "entreprise_plan_localisation", title: "Plan de localisation", type: "Plan de localisation" },
  ],
  caution: [
    { id: "caution_demande", title: "Demande de caution", type: "Demande" },
    { id: "caution_modele", title: "Modèle de caution", type: "Modèle" },
    { id: "caution_appel_offres", title: "Avis d’appel d’offres", type: "Appel d’offres" },
    { id: "caution_marche", title: "Copie du marché ou contrat", type: "Contrat" },
    { id: "caution_banque", title: "Banque de domiciliation", type: "Justificatif bancaire" },
    { id: "caution_bilans", title: "Bilans des trois dernières années", type: "Bilans" },
  ],
  sinistres: [
    { id: "sinistre_constat", title: "Constat ou déclaration", type: "Constat" },
    { id: "sinistre_photos", title: "Photos du sinistre", type: "Photo" },
    { id: "sinistre_rapport", title: "Rapport des autorités", type: "Rapport" },
    { id: "sinistre_devis", title: "Devis ou factures", type: "Justificatif" },
  ],
};

const productFolders: Record<InsuranceProduct, DocumentFolderId> = {
  automobile: "automobile",
  moto: "automobile",
  sante: "sante",
  vie_capitalisation: "vie_capitalisation",
  habitation: "habitation",
  voyage: "voyage",
  entreprise: "entreprise",
  caution: "caution",
};

export function documentFolderId(document: ClientDocument): DocumentFolderId {
  const category = document.category.toLowerCase();
  const identity = `${document.title} ${document.type}`.toLowerCase();
  if (Object.values(productFolders).includes(category as DocumentFolderId)
    || category === "informations_personnelles") return category as DocumentFolderId;
  if (/cni|passeport|identité|domicile/.test(identity) && !/permis/.test(identity)) {
    return "informations_personnelles";
  }
  if (/santé|medical|médical|maladie/.test(`${category} ${identity}`)) return "sante";
  if (/vie|capitalisation/.test(`${category} ${identity}`)) return "vie_capitalisation";
  if (/habitation|logement|maison/.test(`${category} ${identity}`)) return "habitation";
  if (/voyage|visa|billet/.test(`${category} ${identity}`)) return "voyage";
  if (/entreprise|commerce|patente/.test(`${category} ${identity}`)) return "entreprise";
  if (/caution|marché|soumission/.test(`${category} ${identity}`)) return "caution";
  if (/sinistre|accident|constat|dommage/.test(`${category} ${identity}`)) return "sinistres";
  return "automobile";
}

export function documentsForProduct(
  documents: ClientDocument[],
  product: InsuranceProduct,
): RequestDocumentReference[] {
  const productFolder = productFolders[product];
  return documents
    .filter((document) => Boolean(document.fileName && document.slotId))
    .filter((document) => {
      const folder = documentFolderId(document);
      return folder === "informations_personnelles" || folder === productFolder;
    })
    .map((document) => ({
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      type: document.type,
      folder: documentFolderId(document),
      status: document.status,
      date: document.date,
    }));
}
