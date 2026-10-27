import type {
  AutoGuarantee,
  AutoRequestType,
  AutoVehicleUsage,
  AutomobileInsuranceRequestData,
  InsuranceRequest,
  MotoGuarantee,
  MotoInsuranceRequestData,
  RequestStatus,
  StatusEvent,
} from "../types/domain";
import { ErreurApi } from "./authentication-api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");
const DEMANDES_BASE_URL = `${API_BASE_URL}/api/v1/frontoffice/demandes/automobile`;

const besoinsVersApi: Record<AutoRequestType, string> = {
  new_vehicle: "nouveau_vehicule",
  renewal: "renouvellement",
  other: "autre",
  switch_insurer: "autre",
  advice: "autre",
};
const besoinsDepuisApi: Record<string, AutoRequestType> = {
  nouveau_vehicule: "new_vehicle",
  renouvellement: "renewal",
  autre: "other",
};
const usagesVoitureVersApi: Record<AutoVehicleUsage, string> = {
  cat1_professional: "cat1_professionnel",
  cat2_product_transport: "cat2_transport_produits",
  cat3_transport: "cat3_transport_marchandises_tiers",
  personal: "cat1_professionnel",
  professional: "cat1_professionnel",
  transport: "cat3_transport_marchandises_tiers",
  other: "cat1_professionnel",
};
const usagesVoitureDepuisApi: Record<string, AutoVehicleUsage> = {
  cat1_professionnel: "cat1_professional",
  cat2_transport_produits: "cat2_product_transport",
  cat3_transport_marchandises_tiers: "cat3_transport",
};
const garantiesVersApi: Record<AutoGuarantee | MotoGuarantee, string> = {
  civil_liability: "responsabilite_civile",
  ipt: "ipt",
  defense_and_recours: "defense_et_recours",
  glass_all_risk: "bris_glaces_tous_risques",
  glass_outside_all_risk: "bris_glaces_hors_tous_risques",
  glass_and_light_blocks: "bris_glaces_blocs_feux",
  third_party_collision: "tierce_collision",
  all_accident_damage: "dommages_tous_accidents",
  fire: "incendie",
  fire_and_electrical_risks: "incendie_risques_electriques",
  robbery: "vol_braquage",
  total_theft: "vol_total",
  total_partial_theft: "vol_total_partiel",
  repair_assistance: "assistance_reparation",
  advance_on_recours: "avance_sur_recours",
};
const garantiesDepuisApi = Object.fromEntries(
  Object.entries(garantiesVersApi).map(([portail, api]) => [api, portail]),
) as Record<string, AutoGuarantee>;
const statutsDepuisApi: Record<string, RequestStatus> = {
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

interface PersonneApi {
  prenom: string;
  nom: string;
  telephone: string;
  adresse_email: string;
  adresse: string;
  ville: string;
}

interface DocumentDemandeApi {
  id: string;
  titre: string;
  nom_fichier?: string | null;
  type: string;
  dossier: string;
  statut: "requis" | "recu" | "en_verification" | "valide" | "correction_requise";
  date?: string | null;
}

const statutsDocumentsVersApi = {
  required: "requis",
  received: "recu",
  reviewing: "en_verification",
  validated: "valide",
  correction_required: "correction_requise",
} as const;
const statutsDocumentsDepuisApi = Object.fromEntries(
  Object.entries(statutsDocumentsVersApi).map(([portail, api]) => [api, portail]),
) as Record<DocumentDemandeApi["statut"], "required" | "received" | "reviewing" | "validated" | "correction_required">;

interface DemandeAutomobileApi {
  id: string;
  reference: string;
  sous_type_automobile: "voiture" | "moto_deux_trois_roues";
  mode_preparation: "saisie_directe" | "delegation_courtier";
  message_delegation?: string | null;
  type_besoin?: string | null;
  precision_autre_besoin?: string | null;
  souscripteur?: PersonneApi | null;
  assure?: PersonneApi | null;
  conducteur?: {
    est_souscripteur: boolean;
    prenoms?: string | null;
    nom?: string | null;
    date_naissance?: string | null;
    telephone?: string | null;
    profession?: string | null;
    numero_permis?: string | null;
    categorie_permis?: string | null;
    permis_delivre_le?: string | null;
    permis_valide_jusqu_au?: string | null;
  } | null;
  vehicule?: Record<string, unknown> | null;
  couverture?: {
    duree_mois: 2 | 4 | 6 | 8 | 12;
    date_effet_souhaitee?: string | null;
    date_effet_inconnue: boolean;
    garanties: string[];
  } | null;
  possede_vignette?: boolean | null;
  documents: DocumentDemandeApi[];
  statut: string;
  cree_le: string;
  historique_statuts: Array<{ statut: string; cree_le: string }>;
  courtier?: {
    id: string;
    nom_complet: string;
    adresse_email: string;
    numero_telephone: string;
    role: "courtier" | "admin" | "super_admin";
  } | null;
}

const chaineStatuts: Array<{ statut: string; libelle: string }> = [
  { statut: "nouvelle", libelle: "Demande envoyée" },
  { statut: "en_analyse", libelle: "Analyse du dossier" },
  { statut: "propositions_disponibles", libelle: "Propositions disponibles" },
  { statut: "offre_selectionnee", libelle: "Offre sélectionnée" },
  { statut: "documents_requis", libelle: "Informations à compléter" },
  { statut: "paiement_en_attente", libelle: "Paiement en attente" },
  { statut: "contrat_en_preparation", libelle: "Contrat en préparation" },
  { statut: "police_disponible", libelle: "Police disponible" },
  { statut: "finalisee", libelle: "Demande terminée" },
];

function personneVersApi(personne: {
  firstName: string; lastName: string; phone: string; email: string; address: string; city: string;
}): PersonneApi {
  return {
    prenom: personne.firstName,
    nom: personne.lastName || personne.firstName,
    telephone: personne.phone,
    adresse_email: personne.email,
    adresse: personne.address,
    ville: personne.city,
  };
}

function personneDepuisApi(personne: PersonneApi) {
  return {
    firstName: personne.prenom,
    lastName: personne.nom,
    phone: personne.telephone,
    email: personne.adresse_email,
    address: personne.adresse,
    city: personne.ville,
  };
}

function conducteurVersApi(conducteur: {
  isSubscriber: boolean; firstNames?: string; lastName?: string; birthDate?: string; phone?: string;
  occupation?: string; licenceNumber?: string; licenceCategory?: string; licenceIssuedOn?: string;
  licenceValidUntil?: string;
}) {
  return {
    est_souscripteur: conducteur.isSubscriber,
    prenoms: conducteur.firstNames,
    nom: conducteur.lastName,
    date_naissance: conducteur.birthDate,
    telephone: conducteur.phone,
    profession: conducteur.occupation,
    numero_permis: conducteur.licenceNumber,
    categorie_permis: conducteur.licenceCategory,
    permis_delivre_le: conducteur.licenceIssuedOn,
    permis_valide_jusqu_au: conducteur.licenceValidUntil,
  };
}

function conducteurDepuisApi(conducteur: NonNullable<DemandeAutomobileApi["conducteur"]>) {
  return conducteur.est_souscripteur ? { isSubscriber: true } : {
    isSubscriber: false,
    firstNames: conducteur.prenoms ?? "",
    lastName: conducteur.nom ?? "",
    birthDate: conducteur.date_naissance ?? "",
    phone: conducteur.telephone ?? "",
    occupation: conducteur.profession ?? "",
    licenceNumber: conducteur.numero_permis ?? "",
    licenceCategory: conducteur.categorie_permis ?? "",
    licenceIssuedOn: conducteur.permis_delivre_le ?? "",
    licenceValidUntil: conducteur.permis_valide_jusqu_au ?? "",
  };
}

function documentsVersApi(data: Partial<InsuranceRequest>): DocumentDemandeApi[] {
  return (data.documents ?? []).map((document) => ({
    id: document.id,
    titre: document.title,
    nom_fichier: document.fileName,
    type: document.type,
    dossier: document.folder,
    statut: statutsDocumentsVersApi[document.status],
    date: document.date,
  }));
}

function construireEntree(data: Partial<InsuranceRequest>) {
  const estMoto = data.vehicleKind === "moto";
  const demande = estMoto ? data.motoRequest : data.automobileRequest;
  if (!demande) throw new Error("Les informations de la demande automobile sont incomplètes.");
  if (demande.completionMode === "broker_delegation") {
    return {
      sous_type_automobile: estMoto ? "moto_deux_trois_roues" : "voiture",
      mode_preparation: "delegation_courtier",
      message_delegation: demande.delegatedMessage,
      documents: documentsVersApi(data),
    };
  }
  const base = {
    sous_type_automobile: estMoto ? "moto_deux_trois_roues" : "voiture",
    mode_preparation: "saisie_directe",
    type_besoin: besoinsVersApi[demande.requestType],
    precision_autre_besoin: demande.otherNeed,
    souscripteur: personneVersApi(demande.subscriber),
    assure: personneVersApi(demande.insured),
    conducteur: conducteurVersApi(demande.driver),
    couverture: {
      duree_mois: demande.coverage.durationMonths,
      date_effet_souhaitee: demande.coverage.desiredStartDate,
      date_effet_inconnue: demande.coverage.startDateUnknown ?? false,
      garanties: demande.coverage.guarantees.map((garantie) => garantiesVersApi[garantie]),
    },
    possede_vignette: demande.hasVignette,
    documents: documentsVersApi(data),
  };
  if (estMoto) {
    const moto = demande as Extract<MotoInsuranceRequestData, { completionMode: "self_service" }>;
    return {
      ...base,
      vehicule: {
        type_vehicule: "moto_deux_trois_roues",
        marque: moto.vehicle.brand,
        modele: moto.vehicle.model,
        annee: moto.vehicle.year,
        immatriculation: moto.vehicle.registration,
        energie: moto.vehicle.energy === "electric" ? "electrique" : "essence",
        cylindree_cm3: moto.vehicle.cylinderCapacity,
        nombre_places: moto.vehicle.seatCount,
        numero_chassis: moto.vehicle.chassisNumber,
        usage: moto.vehicle.usage,
        valeur_estimee: moto.vehicle.estimatedValue,
        transporte_matieres_inflammables: moto.vehicle.carriesFlammableMaterials,
        possede_remorque: moto.vehicle.hasTrailer,
      },
    };
  }
  const auto = demande as Extract<AutomobileInsuranceRequestData, { completionMode: "self_service" }>;
  return {
    ...base,
    vehicule: {
      type_vehicule: "voiture",
      marque: auto.vehicle.brand,
      modele: auto.vehicle.model,
      annee: auto.vehicle.year,
      immatriculation: auto.vehicle.registration,
      energie: auto.vehicle.energy === "diesel" ? "diesel" : "essence",
      puissance_fiscale: auto.vehicle.fiscalPower,
      nombre_places: auto.vehicle.seatCount,
      numero_chassis: auto.vehicle.chassisNumber,
      usage: usagesVoitureVersApi[auto.vehicle.usage],
      valeur_estimee: auto.vehicle.estimatedValue,
      transporte_matieres_inflammables: auto.vehicle.carriesFlammableMaterials,
      possede_remorque: auto.vehicle.hasTrailer,
    },
  };
}

function versDemandePortail(api: DemandeAutomobileApi): InsuranceRequest {
  const estMoto = api.sous_type_automobile === "moto_deux_trois_roues";
  let automobileRequest: AutomobileInsuranceRequestData | undefined;
  let motoRequest: MotoInsuranceRequestData | undefined;
  if (api.mode_preparation === "delegation_courtier") {
    const delegation = { completionMode: "broker_delegation" as const, delegatedMessage: api.message_delegation ?? "" };
    if (estMoto) motoRequest = delegation;
    else automobileRequest = delegation;
  } else if (api.souscripteur && api.assure && api.conducteur && api.vehicule && api.couverture) {
    const vehicule = api.vehicule;
    const commun = {
      brand: String(vehicule.marque),
      model: String(vehicule.modele),
      year: Number(vehicule.annee),
      registration: String(vehicule.immatriculation),
      seatCount: Number(vehicule.nombre_places),
      chassisNumber: String(vehicule.numero_chassis),
      estimatedValue: vehicule.valeur_estimee == null ? null : Number(vehicule.valeur_estimee),
      carriesFlammableMaterials: Boolean(vehicule.transporte_matieres_inflammables),
      hasTrailer: Boolean(vehicule.possede_remorque),
    };
    const couverture = {
      durationMonths: api.couverture.duree_mois,
      desiredStartDate: api.couverture.date_effet_souhaitee ?? null,
      ...(api.couverture.date_effet_inconnue ? { startDateUnknown: true } : {}),
      guarantees: api.couverture.garanties.map((garantie) => garantiesDepuisApi[garantie]),
    };
    const base = {
      completionMode: "self_service" as const,
      requestType: besoinsDepuisApi[api.type_besoin ?? "autre"] ?? "other",
      ...(api.precision_autre_besoin ? { otherNeed: api.precision_autre_besoin } : {}),
      subscriber: personneDepuisApi(api.souscripteur),
      insured: personneDepuisApi(api.assure),
      driver: conducteurDepuisApi(api.conducteur),
      hasVignette: Boolean(api.possede_vignette),
    };
    if (estMoto) {
      motoRequest = {
        ...base,
        vehicle: {
          ...commun,
          energy: vehicule.energie === "electrique" ? "electric" : "petrol",
          cylinderCapacity: Number(vehicule.cylindree_cm3),
          usage: vehicule.usage === "cat5_bis" ? "cat5_bis" : "cat5",
        },
        coverage: { ...couverture, guarantees: couverture.guarantees as MotoGuarantee[] },
      };
    } else {
      automobileRequest = {
        ...base,
        vehicle: {
          category: "tourism",
          ...commun,
          energy: vehicule.energie === "diesel" ? "diesel" : "petrol",
          fiscalPower: Number(vehicule.puissance_fiscale),
          usage: usagesVoitureDepuisApi[String(vehicule.usage)] ?? "cat1_professional",
        },
        coverage: { ...couverture, guarantees: couverture.guarantees as AutoGuarantee[] },
      };
    }
  }
  const demandeDirecte = estMoto ? motoRequest : automobileRequest;
  const vehicule = demandeDirecte?.completionMode === "self_service" ? demandeDirecte.vehicle : undefined;
  const indexStatut = Math.max(0, chaineStatuts.findIndex((etape) => etape.statut === api.statut));
  const historiqueParStatut = new Map(api.historique_statuts.map((evenement) => [evenement.statut, evenement.cree_le]));
  const timeline: StatusEvent[] = chaineStatuts.map((etape, index) => ({
    label: etape.libelle,
    at: historiqueParStatut.has(etape.statut)
      ? new Date(historiqueParStatut.get(etape.statut)!).toLocaleDateString("fr-FR")
      : undefined,
    done: index < indexStatut || api.statut === "finalisee",
    active: index === indexStatut && api.statut !== "finalisee",
  }));
  const courtier = api.courtier ? {
    id: api.courtier.id,
    name: api.courtier.nom_complet,
    phone: api.courtier.numero_telephone,
    email: api.courtier.adresse_email,
    initials: api.courtier.nom_complet.split(/\s+/).filter(Boolean).map((partie) => partie[0]).join("").slice(0, 2).toUpperCase(),
    role: api.courtier.role,
  } : null;
  return {
    id: api.id,
    reference: api.reference,
    clientId: "",
    product: "automobile",
    productLabel: "Assurance automobile",
    date: api.cree_le.slice(0, 10),
    status: statutsDepuisApi[api.statut] ?? "new",
    advisorId: courtier?.id ?? "",
    advisor: courtier,
    vehicleKind: estMoto ? "moto" : "car",
    automobileRequest,
    motoRequest,
    documents: (api.documents ?? []).map((document) => ({
      id: document.id,
      title: document.titre,
      fileName: document.nom_fichier ?? undefined,
      type: document.type,
      folder: document.dossier,
      status: statutsDocumentsDepuisApi[document.statut],
      date: document.date ?? undefined,
    })),
    ...(vehicule ? {
      vehicle: {
        brand: vehicule.brand,
        model: vehicule.model,
        year: String(vehicule.year),
        registration: vehicule.registration,
        value: vehicule.estimatedValue,
        usage: vehicule.usage,
      },
      desiredStartDate: demandeDirecte?.completionMode === "self_service"
        ? demandeDirecte.coverage.desiredStartDate ?? undefined
        : undefined,
    } : {}),
    comments: demandeDirecte?.completionMode === "broker_delegation"
      ? demandeDirecte.delegatedMessage
      : undefined,
    timeline,
    scope: "core",
  };
}

async function envoyer<T>(chemin = "", options: RequestInit = {}): Promise<T> {
  let reponse: Response;
  try {
    reponse = await fetch(`${DEMANDES_BASE_URL}${chemin}`, {
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
    let message = "La demande n’a pas pu être traitée.";
    try {
      const payload = await reponse.json() as { erreur?: { message?: string; details?: Array<{ message?: string }> } };
      message = payload.erreur?.details?.find((detail) => detail.message)?.message
        || payload.erreur?.message
        || message;
    } catch {
      // Une réponse de proxy peut ne pas contenir de JSON.
    }
    throw new ErreurApi(message, reponse.status);
  }
  return reponse.json() as Promise<T>;
}

function enteteCsrf(): HeadersInit {
  const prefixe = `${encodeURIComponent("followup_csrf_client") }=`;
  const cookie = document.cookie.split("; ").find((valeur) => valeur.startsWith(prefixe));
  return cookie ? { "X-CSRF-Token": decodeURIComponent(cookie.slice(prefixe.length)) } : {};
}

export async function creerDemandeAutomobile(data: Partial<InsuranceRequest>) {
  const resultat = await envoyer<DemandeAutomobileApi>("", {
    method: "POST",
    headers: enteteCsrf(),
    body: JSON.stringify(construireEntree(data)),
  });
  return versDemandePortail(resultat);
}

export async function obtenirDemandesAutomobile() {
  const resultats = await envoyer<DemandeAutomobileApi[]>();
  return resultats.map(versDemandePortail);
}

export function fusionnerDemandesAutomobile(
  _existantes: InsuranceRequest[],
  persistantes: InsuranceRequest[],
) {
  return persistantes;
}
