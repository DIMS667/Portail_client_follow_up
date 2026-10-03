import type { InsuranceProduct } from "../types/domain";

export type NonAutomobileInsuranceProduct = Exclude<InsuranceProduct, "automobile">;

export type InsuranceFormFieldType = "text" | "number" | "date" | "select";
export type InsuranceFormFieldFormat = "fcfa" | "date";

export interface InsuranceFormField {
  key: string;
  label: string;
  type: InsuranceFormFieldType;
  defaultValue: string;
  options?: string[];
  placeholder?: string;
  min?: number;
  required?: boolean;
  full?: boolean;
  format?: InsuranceFormFieldFormat;
}

export interface InsuranceFormSection {
  title: string;
  description?: string;
  fields: InsuranceFormField[];
}

export interface InsuranceProductFormConfig {
  title: string;
  intro: string;
  sections: InsuranceFormSection[];
  coverageOptions: string[];
  startDateKey: string;
}

export const insuranceProductForms: Record<
  NonAutomobileInsuranceProduct,
  InsuranceProductFormConfig
> = {
  moto: {
    title: "Votre moto et son usage",
    intro:
      "Quelques informations ciblées nous permettront de rechercher une protection adaptée à votre deux-roues.",
    sections: [
      {
        title: "Le véhicule",
        description: "Renseignez les caractéristiques principales de la moto à assurer.",
        fields: [
          {
            key: "brand",
            label: "Marque",
            type: "text",
            defaultValue: "",
            placeholder: "Ex. Yamaha",
            required: true,
          },
          {
            key: "model",
            label: "Modèle",
            type: "text",
            defaultValue: "",
            placeholder: "Ex. MT-07",
            required: true,
          },
          {
            key: "engineCapacity",
            label: "Cylindrée (cm³)",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 700",
            min: 1,
            required: true,
          },
          {
            key: "year",
            label: "Année de mise en circulation",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 2023",
            min: 1950,
            required: true,
          },
          {
            key: "registration",
            label: "Immatriculation",
            type: "text",
            defaultValue: "",
            placeholder: "Si elle est déjà connue",
          },
          {
            key: "vehicleValue",
            label: "Valeur estimée",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 3 500 000",
            min: 0,
            required: true,
            format: "fcfa",
          },
        ],
      },
      {
        title: "Votre usage",
        description: "Ces éléments aident à évaluer le niveau d'exposition au risque.",
        fields: [
          {
            key: "usage",
            label: "Usage principal",
            type: "select",
            defaultValue: "Personnel",
            options: ["Personnel", "Trajets domicile-travail", "Professionnel", "Livraison"],
            required: true,
          },
          {
            key: "parking",
            label: "Stationnement habituel",
            type: "select",
            defaultValue: "Garage fermé",
            options: ["Garage fermé", "Cour sécurisée", "Parking collectif", "Voie publique"],
            required: true,
          },
          {
            key: "city",
            label: "Ville de circulation principale",
            type: "text",
            defaultValue: "",
            placeholder: "Ex. Douala",
            required: true,
          },
          {
            key: "desiredStartDate",
            label: "Date de prise d'effet souhaitée",
            type: "date",
            defaultValue: "",
            required: true,
            format: "date",
          },
        ],
      },
    ],
    coverageOptions: [
      "Responsabilité civile",
      "Vol et incendie",
      "Tous risques",
      "Je souhaite être conseillé",
    ],
    startDateKey: "desiredStartDate",
  },

  sante: {
    title: "Votre couverture santé",
    intro:
      "Indiquez la composition du foyer et le niveau de couverture recherché, sans fournir de données médicales sensibles.",
    sections: [
      {
        title: "Les personnes à couvrir",
        description: "Nous adaptons la recherche au profil et à la taille de votre foyer.",
        fields: [
          {
            key: "insuredProfile",
            label: "Profil à assurer",
            type: "select",
            defaultValue: "Individuel",
            options: ["Individuel", "Couple", "Famille", "Salariés d'une entreprise"],
            required: true,
          },
          {
            key: "adultsCount",
            label: "Nombre d'adultes",
            type: "number",
            defaultValue: "1",
            min: 1,
            required: true,
          },
          {
            key: "childrenCount",
            label: "Nombre d'enfants",
            type: "number",
            defaultValue: "0",
            min: 0,
            required: true,
          },
          {
            key: "primaryInsuredAge",
            label: "Âge du titulaire principal",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 38",
            min: 18,
            required: true,
          },
        ],
      },
      {
        title: "Vos préférences",
        description: "Précisez la zone de soins et votre enveloppe mensuelle indicative.",
        fields: [
          {
            key: "coverageArea",
            label: "Zone de couverture",
            type: "select",
            defaultValue: "Cameroun",
            options: ["Cameroun", "Afrique centrale", "Afrique", "International"],
            required: true,
          },
          {
            key: "monthlyBudget",
            label: "Budget mensuel indicatif",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 50 000",
            min: 0,
            format: "fcfa",
          },
          {
            key: "desiredStartDate",
            label: "Date de prise d'effet souhaitée",
            type: "date",
            defaultValue: "",
            required: true,
            format: "date",
          },
        ],
      },
    ],
    coverageOptions: [
      "Hospitalisation",
      "Hospitalisation et soins courants",
      "Couverture complète",
      "Je souhaite être conseillé",
    ],
    startDateKey: "desiredStartDate",
  },

  voyage: {
    title: "Votre prochain voyage",
    intro:
      "Décrivez votre séjour en quelques choix pour obtenir des garanties adaptées à la destination et à la durée.",
    sections: [
      {
        title: "Le séjour",
        description: "Dates, destination et nombre de voyageurs définissent le périmètre du contrat.",
        fields: [
          {
            key: "destination",
            label: "Destination principale",
            type: "text",
            defaultValue: "",
            placeholder: "Ex. France",
            required: true,
            full: true,
          },
          {
            key: "departureDate",
            label: "Date de départ",
            type: "date",
            defaultValue: "",
            required: true,
            format: "date",
          },
          {
            key: "returnDate",
            label: "Date de retour",
            type: "date",
            defaultValue: "",
            required: true,
            format: "date",
          },
          {
            key: "travelersCount",
            label: "Nombre de voyageurs",
            type: "number",
            defaultValue: "1",
            min: 1,
            required: true,
          },
        ],
      },
      {
        title: "Le contexte du voyage",
        description: "Le motif et les formalités influencent les garanties recommandées.",
        fields: [
          {
            key: "travelPurpose",
            label: "Motif du voyage",
            type: "select",
            defaultValue: "Tourisme",
            options: ["Tourisme", "Affaires", "Études", "Visite familiale", "Pèlerinage"],
            required: true,
          },
          {
            key: "visaCertificate",
            label: "Attestation pour visa nécessaire",
            type: "select",
            defaultValue: "Oui",
            options: ["Oui", "Non", "Je ne sais pas"],
            required: true,
          },
          {
            key: "sportsActivities",
            label: "Activités sportives prévues",
            type: "select",
            defaultValue: "Aucune activité particulière",
            options: [
              "Aucune activité particulière",
              "Sports de loisir",
              "Sports d'hiver",
              "Sports à risque",
            ],
            required: true,
            full: true,
          },
        ],
      },
    ],
    coverageOptions: [
      "Assistance médicale et rapatriement",
      "Multirisque voyage",
      "Annulation et multirisque",
      "Je souhaite être conseillé",
    ],
    startDateKey: "departureDate",
  },

  habitation: {
    title: "Votre logement",
    intro:
      "Renseignez les caractéristiques du bien afin d'identifier les garanties habitation réellement utiles.",
    sections: [
      {
        title: "Le bien à assurer",
        description: "Ces informations permettent d'estimer le niveau de protection nécessaire.",
        fields: [
          {
            key: "occupancyStatus",
            label: "Votre situation",
            type: "select",
            defaultValue: "Locataire",
            options: ["Locataire", "Propriétaire occupant", "Propriétaire non occupant"],
            required: true,
          },
          {
            key: "propertyType",
            label: "Type de logement",
            type: "select",
            defaultValue: "Appartement",
            options: ["Appartement", "Maison", "Studio", "Immeuble"],
            required: true,
          },
          {
            key: "city",
            label: "Ville",
            type: "text",
            defaultValue: "",
            placeholder: "Ex. Yaoundé",
            required: true,
          },
          {
            key: "surfaceArea",
            label: "Surface approximative (m²)",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 95",
            min: 1,
            required: true,
          },
          {
            key: "roomsCount",
            label: "Nombre de pièces principales",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 4",
            min: 1,
            required: true,
          },
          {
            key: "contentsValue",
            label: "Valeur estimée du mobilier",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 5 000 000",
            min: 0,
            format: "fcfa",
          },
        ],
      },
      {
        title: "Sécurité et prise d'effet",
        description: "Les dispositifs de sécurité peuvent influer sur les conditions proposées.",
        fields: [
          {
            key: "security",
            label: "Dispositif de sécurité principal",
            type: "select",
            defaultValue: "Porte renforcée",
            options: ["Porte renforcée", "Gardiennage", "Alarme", "Aucun", "Plusieurs dispositifs"],
            required: true,
          },
          {
            key: "desiredStartDate",
            label: "Date de prise d'effet souhaitée",
            type: "date",
            defaultValue: "",
            required: true,
            format: "date",
          },
        ],
      },
    ],
    coverageOptions: [
      "Responsabilité civile locative",
      "Multirisque habitation",
      "Multirisque habitation étendue",
      "Je souhaite être conseillé",
    ],
    startDateKey: "desiredStartDate",
  },

  entreprise: {
    title: "Votre activité professionnelle",
    intro:
      "Présentez la structure de votre entreprise pour orienter la recherche vers des garanties professionnelles adaptées.",
    sections: [
      {
        title: "L'entreprise",
        description: "Les caractéristiques de votre activité déterminent les principaux risques à couvrir.",
        fields: [
          {
            key: "companyName",
            label: "Raison sociale",
            type: "text",
            defaultValue: "",
            placeholder: "Nom de l'entreprise",
            required: true,
          },
          {
            key: "legalForm",
            label: "Forme juridique",
            type: "select",
            defaultValue: "SARL",
            options: ["Entreprise individuelle", "SARL", "SA", "SAS", "Association", "Autre"],
            required: true,
          },
          {
            key: "industry",
            label: "Secteur d'activité",
            type: "text",
            defaultValue: "",
            placeholder: "Ex. Conseil informatique",
            required: true,
          },
          {
            key: "employeesCount",
            label: "Nombre de salariés",
            type: "number",
            defaultValue: "1",
            min: 0,
            required: true,
          },
          {
            key: "annualRevenue",
            label: "Chiffre d'affaires annuel estimé",
            type: "number",
            defaultValue: "",
            placeholder: "Ex. 50 000 000",
            min: 0,
            required: true,
            format: "fcfa",
          },
          {
            key: "city",
            label: "Ville principale d'activité",
            type: "text",
            defaultValue: "",
            placeholder: "Ex. Douala",
            required: true,
          },
        ],
      },
      {
        title: "Vos locaux et votre besoin",
        description: "Précisez l'exposition matérielle de votre activité et la date souhaitée.",
        fields: [
          {
            key: "premises",
            label: "Locaux professionnels",
            type: "select",
            defaultValue: "Bureaux loués",
            options: [
              "Aucun local dédié",
              "Bureaux loués",
              "Bureaux détenus",
              "Commerce ou atelier",
              "Entrepôt",
            ],
            required: true,
          },
          {
            key: "desiredStartDate",
            label: "Date de prise d'effet souhaitée",
            type: "date",
            defaultValue: "",
            required: true,
            format: "date",
          },
        ],
      },
    ],
    coverageOptions: [
      "Responsabilité civile professionnelle",
      "Multirisque professionnelle",
      "Protection complète de l'activité",
      "Je souhaite être conseillé",
    ],
    startDateKey: "desiredStartDate",
  },
};
