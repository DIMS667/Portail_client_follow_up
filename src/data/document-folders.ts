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
    .filter((document) => Boolean(document.fileName))
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
