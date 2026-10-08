export const protectionNeeds = [
  { id: "auto", number: "01", label: "Auto", description: "Roulez l’esprit tranquille" },
  { id: "moto", number: "02", label: "Moto", description: "Avancez en toute liberté" },
  { id: "health", number: "03", label: "Santé", description: "Protégez ce qui compte" },
  { id: "home", number: "04", label: "Habitation", description: "Préservez votre foyer" },
  { id: "travel", number: "05", label: "Voyage", description: "Partez plus sereinement" },
  { id: "business", number: "06", label: "Entreprise", description: "Sécurisez vos ambitions" },
] as const;

export const brokerBenefits = [
  "Analyse de votre situation et de vos priorités",
  "Recherche de solutions adaptées auprès de partenaires",
  "Conseil clair pour vous aider à choisir",
  "Accompagnement après la souscription",
] as const;

export const brokerJourney = [
  { number: "01", title: "Votre besoin", description: "Vous nous expliquez votre situation et vos priorités." },
  { number: "02", title: "Notre analyse", description: "Nous étudions votre profil et les points à protéger." },
  { number: "03", title: "La recherche", description: "Nous comparons les solutions auprès de nos partenaires." },
  { number: "04", title: "Le suivi", description: "Nous vous accompagnons dans la souscription et dans la durée." },
] as const;

export const portalFeatures = [
  "Suivre vos demandes",
  "Consulter les propositions",
  "Transmettre vos documents",
  "Retrouver vos paiements",
  "Accéder à vos contrats",
  "Déclarer et suivre vos sinistres",
] as const;

export const commitments = [
  { id: "advice", label: "Un conseil indépendant" },
  { id: "listening", label: "Une écoute attentive" },
  { id: "tailored", label: "Des solutions adaptées" },
  { id: "clarity", label: "Une information claire" },
  { id: "support", label: "Un accompagnement dans la durée" },
  { id: "proximity", label: "Une relation humaine et réactive" },
] as const;

export const adviceArticles = [
  {
    slug: "choisir-assurance-automobile",
    category: "Auto",
    title: "Comment choisir son assurance automobile ?",
    excerpt: "Les points essentiels à examiner avant de souscrire.",
    body: "Commencez par votre usage réel du véhicule, les conducteurs concernés et votre capacité à faire face à un imprévu. Votre courtier vous aide ensuite à lire les différences entre les solutions proposées.",
    image: "/images/insurance-auto.webp",
    imageAlt: "Voiture rouge moderne vue depuis le dessus",
  },
  {
    slug: "preparer-assurance-voyage",
    category: "Voyage",
    title: "Pourquoi préparer son assurance avant le départ ?",
    excerpt: "Anticipez les situations qui pourraient perturber votre voyage.",
    body: "Destination, durée, activités et situation de chaque voyageur influencent le besoin. Une étude en amont permet de poser les bonnes questions avant de partir.",
    image: "/images/insurance-travel.webp",
    imageAlt: "Voyageuse préparant une valise",
  },
  {
    slug: "proteger-activite-professionnelle",
    category: "Entreprise",
    title: "Quels risques anticiper pour protéger son activité ?",
    excerpt: "Une lecture simple des expositions de votre entreprise.",
    body: "Locaux, responsabilité, personnes, véhicules, matériel et continuité d’activité méritent une analyse globale. Le rôle du courtier est de vous aider à hiérarchiser ces risques.",
    image: "/images/insurance-business.webp",
    imageAlt: "Équipe de professionnelles africaines en réunion",
  },
] as const;

export const footerSolutionLinks = [
  "Automobile",
  "Moto",
  "Santé",
  "Habitation",
  "Voyage",
  "Assurance entreprise",
] as const;
