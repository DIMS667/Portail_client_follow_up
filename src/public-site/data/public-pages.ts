export type PublicCtaTone = "primary" | "secondary" | "text";

export interface PublicCta {
  label: string;
  href: string;
  tone?: PublicCtaTone;
}

export interface PublicImage {
  src: string;
  alt: string;
}

export interface PublicHero {
  eyebrow: string;
  title: string;
  intro: string;
  image: PublicImage;
  primaryCta?: PublicCta;
  secondaryCta?: PublicCta;
}

export interface PublicCard {
  title: string;
  description: string;
  href?: string;
  label?: string;
}

export interface PublicStep {
  number: string;
  title: string;
  description: string;
}

export interface PublicFaqItem {
  question: string;
  answer: string;
}

export interface PublicEditorialSection {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
  cards?: readonly PublicCard[];
  steps?: readonly PublicStep[];
  image?: PublicImage;
  cta?: PublicCta;
  /** Identifie sans ambiguïté un texte provisoire à remplacer avant publication. */
  isPlaceholder?: boolean;
}

export interface PublicLandingPage {
  path: string;
  metaTitle: string;
  metaDescription: string;
  hero: PublicHero;
  sections: readonly PublicEditorialSection[];
  finalCta?: {
    title: string;
    description: string;
    action: PublicCta;
  };
}

export type SolutionSlug =
  | "automobile"
  | "moto"
  | "sante"
  | "habitation"
  | "voyage"
  | "entreprise";

export interface SolutionSummary {
  slug: SolutionSlug;
  path: `/solutions/${SolutionSlug}`;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  image: PublicImage;
  ctaLabel: string;
}

export interface SolutionPageContent extends SolutionSummary {
  metaTitle: string;
  metaDescription: string;
  hero: PublicHero;
  audience: readonly string[];
  coverages: readonly PublicCard[];
  optionalBenefits: readonly string[];
  watchPoints: readonly string[];
  documents: readonly string[];
  brokerSupport: {
    title: string;
    description: string;
    steps: readonly PublicStep[];
  };
  faq: readonly PublicFaqItem[];
  finalCta: {
    title: string;
    description: string;
    action: PublicCta;
  };
}

export type AdviceArticleSlug =
  | "choisir-assurance-automobile"
  | "preparer-assurance-voyage"
  | "proteger-activite-professionnelle";

export interface AdviceArticle {
  slug: AdviceArticleSlug;
  path: `/conseils/${AdviceArticleSlug}`;
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  image: PublicImage;
  introduction: string;
  sections: readonly PublicEditorialSection[];
  takeaway: {
    title: string;
    points: readonly string[];
  };
  cta: PublicCta;
}

export const publicPageLinks = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Nos solutions", href: "/solutions" },
  { label: "Particuliers", href: "/particuliers" },
  { label: "Entreprises", href: "/entreprises" },
  { label: "Sinistres", href: "/sinistres" },
  { label: "Conseils", href: "/conseils" },
  { label: "Contact", href: "/contact" },
] as const;

export const solutionSummaries: readonly SolutionSummary[] = [
  {
    slug: "automobile",
    path: "/solutions/automobile",
    title: "Assurance automobile",
    shortTitle: "Automobile",
    tagline: "Roulez avec les bonnes garanties.",
    description:
      "Une protection adaptée à votre véhicule, à votre usage et aux conducteurs qui prennent le volant.",
    image: {
      src: "/images/insurance-auto.webp",
      alt: "Voiture rouge moderne vue depuis le dessus",
    },
    ctaLabel: "Découvrir l’assurance auto",
  },
  {
    slug: "moto",
    path: "/solutions/moto",
    title: "Assurance moto",
    shortTitle: "Moto",
    tagline: "Gardez votre liberté de mouvement.",
    description:
      "Des garanties pensées selon votre deux-roues, vos trajets et votre niveau d’équipement.",
    image: {
      src: "/images/insurance-moto.webp",
      alt: "Motocycliste équipé circulant sur une route",
    },
    ctaLabel: "Découvrir l’assurance moto",
  },
  {
    slug: "sante",
    path: "/solutions/sante",
    title: "Assurance santé",
    shortTitle: "Santé",
    tagline: "Prenez soin de vous et de vos proches.",
    description:
      "Une couverture choisie à partir de vos besoins de soins, de votre budget et de votre situation familiale.",
    image: {
      src: "/images/insurance-health.webp",
      alt: "Professionnelle de santé échangeant avec une patiente",
    },
    ctaLabel: "Découvrir l’assurance santé",
  },
  {
    slug: "habitation",
    path: "/solutions/habitation",
    title: "Assurance habitation",
    shortTitle: "Habitation",
    tagline: "Protégez votre foyer au quotidien.",
    description:
      "Une réponse adaptée à votre logement, à vos biens et à votre statut d’occupant.",
    image: {
      src: "/images/insurance-home.webp",
      alt: "Maison familiale lumineuse entourée de verdure",
    },
    ctaLabel: "Découvrir l’assurance habitation",
  },
  {
    slug: "voyage",
    path: "/solutions/voyage",
    title: "Assurance voyage",
    shortTitle: "Voyage",
    tagline: "Partez mieux préparé.",
    description:
      "Une protection à étudier selon la destination, la durée du séjour et les activités prévues.",
    image: {
      src: "/images/insurance-travel.webp",
      alt: "Voyageuse préparant une valise avant son départ",
    },
    ctaLabel: "Découvrir l’assurance voyage",
  },
  {
    slug: "entreprise",
    path: "/solutions/entreprise",
    title: "Assurance entreprise",
    shortTitle: "Entreprise",
    tagline: "Sécurisez ce que vous construisez.",
    description:
      "Une lecture globale des risques qui concernent votre activité, vos équipes, vos locaux et vos équipements.",
    image: {
      src: "/images/insurance-business.webp",
      alt: "Équipe de professionnelles réunies autour d’un projet",
    },
    ctaLabel: "Découvrir l’assurance entreprise",
  },
] as const;

const solutionBySlug = Object.fromEntries(
  solutionSummaries.map((solution) => [solution.slug, solution]),
) as Record<SolutionSlug, SolutionSummary>;

export const solutionPages: Record<SolutionSlug, SolutionPageContent> = {
  automobile: {
    ...solutionBySlug.automobile,
    metaTitle: "Assurance automobile | Follow-Up Insurance",
    metaDescription:
      "Étudiez une assurance automobile adaptée à votre véhicule, à vos conducteurs et à vos habitudes de déplacement.",
    hero: {
      eyebrow: "Assurance automobile",
      title: "Une couverture alignée sur votre façon de conduire.",
      intro:
        "Nous analysons votre véhicule, son usage et votre profil afin de vous aider à choisir des garanties utiles et compréhensibles.",
      image: solutionBySlug.automobile.image,
      primaryCta: {
        label: "Demander une étude auto",
        href: "/contact?motif=automobile",
        tone: "primary",
      },
      secondaryCta: { label: "Voir toutes les solutions", href: "/solutions", tone: "text" },
    },
    audience: [
      "Conducteurs particuliers",
      "Familles avec plusieurs conducteurs",
      "Propriétaires d’un véhicule neuf ou d’occasion",
      "Professionnels utilisant un véhicule dans leur activité",
    ],
    coverages: [
      {
        title: "Responsabilité civile",
        description: "Prend en charge les dommages causés à autrui selon les conditions du contrat.",
      },
      {
        title: "Dommages au véhicule",
        description: "Peut couvrir le vol, l’incendie, le bris de glace ou les dommages tous accidents.",
      },
      {
        title: "Protection du conducteur",
        description: "Prévoit une indemnisation du conducteur blessé dans les limites convenues.",
      },
      {
        title: "Assistance",
        description: "Organise une aide en cas de panne ou d’accident selon le périmètre choisi.",
      },
    ],
    optionalBenefits: [
      "Véhicule de remplacement",
      "Assistance dès le domicile",
      "Protection juridique automobile",
      "Couverture des accessoires déclarés",
    ],
    watchPoints: [
      "Montant de la franchise",
      "Conducteurs autorisés et éventuelles restrictions",
      "Valeur d’indemnisation du véhicule",
      "Territoires dans lesquels la garantie s’applique",
    ],
    documents: [
      "Pièce d’identité",
      "Permis de conduire des conducteurs",
      "Carte grise ou justificatif du véhicule",
      "Historique d’assurance, lorsqu’il est disponible",
    ],
    brokerSupport: {
      title: "Votre besoin, puis les garanties",
      description:
        "Le tarif compte, mais il ne suffit pas. Nous comparons aussi les franchises, les exclusions et les services associés.",
      steps: [
        { number: "01", title: "Comprendre l’usage", description: "Trajets, fréquence et conducteurs sont précisés." },
        { number: "02", title: "Comparer", description: "Les garanties et leurs limites sont mises en regard." },
        { number: "03", title: "Décider", description: "Vous choisissez avec une lecture claire des compromis." },
      ],
    },
    faq: [
      {
        question: "Une formule tous risques couvre-t-elle absolument tout ?",
        answer:
          "Non. Chaque contrat prévoit des plafonds, des franchises et des exclusions. Il faut les examiner avant de souscrire.",
      },
      {
        question: "Puis-je assurer plusieurs conducteurs ?",
        answer:
          "Oui, selon les règles du contrat. Il est important de déclarer les conducteurs réguliers et leur profil réel.",
      },
    ],
    finalCta: {
      title: "Parlons de votre véhicule.",
      description: "Quelques informations suffisent pour lancer une étude adaptée à votre usage.",
      action: { label: "Étudier mon besoin", href: "/contact?motif=automobile", tone: "primary" },
    },
  },
  moto: {
    ...solutionBySlug.moto,
    metaTitle: "Assurance moto | Follow-Up Insurance",
    metaDescription:
      "Choisissez une assurance moto adaptée à votre cylindrée, à vos déplacements et à votre équipement.",
    hero: {
      eyebrow: "Assurance moto",
      title: "Votre deux-roues mérite une protection sur mesure.",
      intro:
        "Usage urbain, loisirs ou déplacements quotidiens : nous cherchons avec vous l’équilibre entre garanties, franchise et budget.",
      image: solutionBySlug.moto.image,
      primaryCta: { label: "Demander une étude moto", href: "/contact?motif=moto", tone: "primary" },
      secondaryCta: { label: "Voir toutes les solutions", href: "/solutions", tone: "text" },
    },
    audience: [
      "Conducteurs de scooter",
      "Motards occasionnels ou réguliers",
      "Propriétaires d’un deux-roues neuf ou d’occasion",
      "Professionnels effectuant des déplacements à moto",
    ],
    coverages: [
      {
        title: "Responsabilité civile",
        description: "Couvre les dommages causés à un tiers dans les limites prévues au contrat.",
      },
      {
        title: "Dommages au deux-roues",
        description: "Peut intervenir après un vol, un incendie ou un accident selon la formule retenue.",
      },
      {
        title: "Protection corporelle",
        description: "Aide à protéger le conducteur, particulièrement exposé en cas d’accident.",
      },
      {
        title: "Équipement",
        description: "Peut inclure le casque, le blouson et certains accessoires déclarés.",
      },
    ],
    optionalBenefits: [
      "Assistance et remorquage",
      "Garantie des accessoires",
      "Protection juridique",
      "Indemnisation renforcée du véhicule",
    ],
    watchPoints: [
      "Cylindrée et usage déclarés",
      "Antivol exigé par l’assureur",
      "Plafond applicable à l’équipement",
      "Conditions de prêt du véhicule",
    ],
    documents: [
      "Pièce d’identité",
      "Permis correspondant à la catégorie du deux-roues",
      "Carte grise ou justificatif d’acquisition",
      "Historique d’assurance, lorsqu’il est disponible",
    ],
    brokerSupport: {
      title: "Une analyse qui tient compte de votre pratique",
      description:
        "Nous ne regardons pas seulement la cylindrée : fréquence, stationnement et équipement influencent aussi le besoin.",
      steps: [
        { number: "01", title: "Décrire", description: "Vous précisez le deux-roues et son utilisation." },
        { number: "02", title: "Sélectionner", description: "Nous retenons les garanties cohérentes avec votre exposition." },
        { number: "03", title: "Expliquer", description: "Vous recevez une proposition lisible avant de choisir." },
      ],
    },
    faq: [
      {
        question: "L’équipement du motard est-il couvert automatiquement ?",
        answer:
          "Pas toujours. La présence de cette garantie, son plafond et les justificatifs requis doivent être vérifiés.",
      },
      {
        question: "Le stationnement influence-t-il l’étude ?",
        answer:
          "Oui. Le lieu et les conditions de stationnement peuvent modifier l’exposition au vol et les conditions proposées.",
      },
    ],
    finalCta: {
      title: "Décrivez-nous votre deux-roues.",
      description: "Nous vous aidons à identifier les garanties vraiment adaptées à votre pratique.",
      action: { label: "Étudier mon besoin", href: "/contact?motif=moto", tone: "primary" },
    },
  },
  sante: {
    ...solutionBySlug.sante,
    metaTitle: "Assurance santé | Follow-Up Insurance",
    metaDescription:
      "Étudiez une couverture santé adaptée à vos priorités de soins, à votre famille et à votre budget.",
    hero: {
      eyebrow: "Assurance santé",
      title: "Une couverture pensée autour de vos priorités de soins.",
      intro:
        "Hospitalisation, consultations, optique ou dentaire : nous vous aidons à hiérarchiser les postes qui comptent pour vous.",
      image: solutionBySlug.sante.image,
      primaryCta: { label: "Demander une étude santé", href: "/contact?motif=sante", tone: "primary" },
      secondaryCta: { label: "Voir toutes les solutions", href: "/solutions", tone: "text" },
    },
    audience: [
      "Personnes seules",
      "Couples et familles",
      "Travailleurs indépendants",
      "Entreprises souhaitant protéger leurs équipes",
    ],
    coverages: [
      {
        title: "Hospitalisation",
        description: "Participe aux frais liés à un séjour hospitalier selon le niveau retenu.",
      },
      {
        title: "Soins courants",
        description: "Concerne notamment les consultations, examens et médicaments prévus au contrat.",
      },
      {
        title: "Optique et dentaire",
        description: "Prévoit des niveaux de prise en charge propres à ces postes souvent coûteux.",
      },
      {
        title: "Prévention et assistance",
        description: "Peut inclure des services d’orientation, de prévention ou d’accompagnement.",
      },
    ],
    optionalBenefits: [
      "Renfort optique ou dentaire",
      "Chambre individuelle",
      "Téléconsultation",
      "Assistance après une hospitalisation",
    ],
    watchPoints: [
      "Délais d’attente éventuels",
      "Plafonds annuels ou par acte",
      "Réseau de professionnels accessible",
      "Conditions applicables aux ayants droit",
    ],
    documents: [
      "Pièce d’identité",
      "Informations sur les personnes à couvrir",
      "Justificatifs demandés selon la solution",
      "Détails de la couverture actuelle, le cas échéant",
    ],
    brokerSupport: {
      title: "Comparer ce qui sera réellement utile",
      description:
        "Nous partons de vos priorités et examinons les plafonds, délais et services, pas uniquement la cotisation.",
      steps: [
        { number: "01", title: "Prioriser", description: "Vous identifiez vos principaux postes de soins." },
        { number: "02", title: "Lire", description: "Nous comparons niveaux, limites et conditions." },
        { number: "03", title: "Ajuster", description: "La solution est mise en cohérence avec votre budget." },
      ],
    },
    faq: [
      {
        question: "Comment choisir le bon niveau de couverture ?",
        answer:
          "En partant des dépenses les plus probables, des besoins familiaux et du budget que vous souhaitez consacrer à votre protection.",
      },
      {
        question: "Puis-je couvrir plusieurs membres de ma famille ?",
        answer:
          "Oui, selon les conditions de la solution. Chaque personne à couvrir doit être déclarée lors de l’étude.",
      },
    ],
    finalCta: {
      title: "Faisons le point sur vos priorités santé.",
      description: "Un échange permet de cibler les niveaux de couverture à comparer.",
      action: { label: "Étudier mon besoin", href: "/contact?motif=sante", tone: "primary" },
    },
  },
  habitation: {
    ...solutionBySlug.habitation,
    metaTitle: "Assurance habitation | Follow-Up Insurance",
    metaDescription:
      "Protégez votre logement, vos biens et votre responsabilité avec une assurance habitation adaptée.",
    hero: {
      eyebrow: "Assurance habitation",
      title: "Votre foyer protégé selon sa réalité.",
      intro:
        "Appartement ou maison, propriétaire ou locataire : nous examinons votre situation pour éviter les garanties mal dimensionnées.",
      image: solutionBySlug.habitation.image,
      primaryCta: {
        label: "Demander une étude habitation",
        href: "/contact?motif=habitation",
        tone: "primary",
      },
      secondaryCta: { label: "Voir toutes les solutions", href: "/solutions", tone: "text" },
    },
    audience: [
      "Locataires",
      "Propriétaires occupants",
      "Propriétaires bailleurs",
      "Familles souhaitant protéger leurs biens",
    ],
    coverages: [
      {
        title: "Dommages au logement",
        description: "Peut couvrir l’incendie, le dégât des eaux et d’autres événements prévus au contrat.",
      },
      {
        title: "Biens mobiliers",
        description: "Protège les biens déclarés dans la limite des capitaux et conditions choisis.",
      },
      {
        title: "Responsabilité civile",
        description: "Intervient pour certains dommages causés involontairement à des tiers.",
      },
      {
        title: "Assistance habitation",
        description: "Peut organiser une intervention ou un relogement après un événement garanti.",
      },
    ],
    optionalBenefits: [
      "Protection des objets de valeur déclarés",
      "Dommages électriques",
      "Protection juridique",
      "Assistance renforcée",
    ],
    watchPoints: [
      "Valeur du mobilier déclaré",
      "Mesures de sécurité demandées",
      "Franchises par type de sinistre",
      "Dépendances et équipements extérieurs inclus ou non",
    ],
    documents: [
      "Pièce d’identité",
      "Adresse et caractéristiques du logement",
      "Justificatif d’occupation ou de propriété",
      "Estimation des biens à protéger",
    ],
    brokerSupport: {
      title: "Décrire précisément le logement",
      description:
        "Surface, occupation et valeur des biens nous permettent de comparer des propositions sur une base cohérente.",
      steps: [
        { number: "01", title: "Inventorier", description: "Le logement, ses dépendances et ses biens sont décrits." },
        { number: "02", title: "Vérifier", description: "Nous examinons plafonds, franchises et exclusions." },
        { number: "03", title: "Protéger", description: "Vous choisissez une solution adaptée à votre foyer." },
      ],
    },
    faq: [
      {
        question: "Comment estimer la valeur de mes biens ?",
        answer:
          "Un inventaire réaliste, accompagné de justificatifs pour les biens importants, aide à choisir un capital adapté.",
      },
      {
        question: "Les dépendances sont-elles toujours incluses ?",
        answer:
          "Non. Garage, annexe ou équipement extérieur doivent être signalés et vérifiés dans les conditions du contrat.",
      },
    ],
    finalCta: {
      title: "Décrivons votre logement.",
      description: "Nous vérifierons ensemble les biens, les risques et les niveaux de protection à comparer.",
      action: { label: "Étudier mon besoin", href: "/contact?motif=habitation", tone: "primary" },
    },
  },
  voyage: {
    ...solutionBySlug.voyage,
    metaTitle: "Assurance voyage | Follow-Up Insurance",
    metaDescription:
      "Préparez votre déplacement avec une assurance voyage adaptée à la destination, à la durée et aux activités prévues.",
    hero: {
      eyebrow: "Assurance voyage",
      title: "Anticipez l’imprévu avant le départ.",
      intro:
        "Chaque séjour est différent. Nous examinons votre destination, votre durée et vos activités pour identifier les garanties pertinentes.",
      image: solutionBySlug.voyage.image,
      primaryCta: { label: "Préparer mon voyage", href: "/contact?motif=voyage", tone: "primary" },
      secondaryCta: { label: "Voir toutes les solutions", href: "/solutions", tone: "text" },
    },
    audience: [
      "Voyageurs individuels",
      "Familles en déplacement",
      "Étudiants ou professionnels en mobilité",
      "Groupes préparant un séjour ponctuel",
    ],
    coverages: [
      {
        title: "Frais médicaux à l’étranger",
        description: "Peut prendre en charge des soins imprévus dans la limite du plafond choisi.",
      },
      {
        title: "Assistance et rapatriement",
        description: "Organise une aide lorsque la situation médicale ou logistique le justifie.",
      },
      {
        title: "Annulation ou interruption",
        description: "Peut couvrir certains motifs précisément prévus par le contrat.",
      },
      {
        title: "Bagages",
        description: "Peut intervenir en cas de perte, vol ou retard selon les conditions applicables.",
      },
    ],
    optionalBenefits: [
      "Couverture de certaines activités sportives",
      "Responsabilité civile à l’étranger",
      "Assistance juridique",
      "Extension pour un long séjour",
    ],
    watchPoints: [
      "Pays couverts et zones exclues",
      "Plafond des frais médicaux",
      "Motifs d’annulation garantis",
      "Activités sportives ou professionnelles déclarées",
    ],
    documents: [
      "Pièce d’identité",
      "Dates et destination du séjour",
      "Informations sur les voyageurs",
      "Justificatifs de réservation lorsque nécessaires",
    ],
    brokerSupport: {
      title: "Une préparation adaptée au séjour",
      description:
        "Nous vérifions la cohérence entre la destination, les garanties et les éventuelles exigences du voyage.",
      steps: [
        { number: "01", title: "Situer", description: "Destination, dates et voyageurs sont renseignés." },
        { number: "02", title: "Anticiper", description: "Les principaux imprévus sont identifiés." },
        { number: "03", title: "Vérifier", description: "Plafonds et exclusions sont lus avant le départ." },
      ],
    },
    faq: [
      {
        question: "Quand faut-il souscrire une assurance voyage ?",
        answer:
          "Le plus tôt possible après la réservation, surtout si une garantie annulation est recherchée. Les délais varient selon les contrats.",
      },
      {
        question: "Toutes les activités sont-elles couvertes ?",
        answer:
          "Non. Certaines activités sportives ou à risque sont exclues ou nécessitent une extension spécifique.",
      },
    ],
    finalCta: {
      title: "Préparons votre prochain départ.",
      description: "Partagez votre destination et vos dates pour cadrer rapidement votre besoin.",
      action: { label: "Étudier mon besoin", href: "/contact?motif=voyage", tone: "primary" },
    },
  },
  entreprise: {
    ...solutionBySlug.entreprise,
    metaTitle: "Assurance entreprise | Follow-Up Insurance",
    metaDescription:
      "Analysez les risques de votre activité et construisez une protection adaptée à votre entreprise.",
    hero: {
      eyebrow: "Assurance entreprise",
      title: "Protégez la continuité de votre activité.",
      intro:
        "Nous cartographions vos risques pour construire une réponse cohérente avec votre métier, votre organisation et vos priorités.",
      image: solutionBySlug.entreprise.image,
      primaryCta: {
        label: "Demander un diagnostic",
        href: "/contact?motif=entreprise",
        tone: "primary",
      },
      secondaryCta: { label: "Découvrir l’offre entreprises", href: "/entreprises", tone: "text" },
    },
    audience: [
      "Entrepreneurs et indépendants",
      "Très petites et moyennes entreprises",
      "Commerces et professions de services",
      "Structures employant une équipe",
    ],
    coverages: [
      {
        title: "Responsabilité professionnelle",
        description: "Protège l’entreprise contre certains dommages causés dans le cadre de son activité.",
      },
      {
        title: "Locaux et équipements",
        description: "Peut couvrir les biens professionnels après un événement garanti.",
      },
      {
        title: "Flotte et déplacements",
        description: "Répond aux besoins liés aux véhicules et à la mobilité professionnelle.",
      },
      {
        title: "Personnes et continuité",
        description: "Peut associer protection des équipes et solutions favorisant la reprise d’activité.",
      },
    ],
    optionalBenefits: [
      "Pertes d’exploitation",
      "Protection juridique professionnelle",
      "Couverture des risques numériques",
      "Santé et prévoyance collectives",
    ],
    watchPoints: [
      "Activités exactement déclarées",
      "Capitaux et chiffres de référence mis à jour",
      "Sous-limites propres à certains risques",
      "Obligations de prévention prévues au contrat",
    ],
    documents: [
      "Documents d’identification de l’entreprise",
      "Description précise des activités",
      "Inventaire des locaux, équipements et véhicules",
      "Historique des sinistres, lorsqu’il est disponible",
    ],
    brokerSupport: {
      title: "Une approche fondée sur vos risques réels",
      description:
        "Nous hiérarchisons les expositions afin de concentrer la protection sur ce qui pourrait réellement fragiliser l’activité.",
      steps: [
        { number: "01", title: "Cartographier", description: "Activités, biens, personnes et dépendances sont recensés." },
        { number: "02", title: "Hiérarchiser", description: "Les risques critiques et leurs impacts sont priorisés." },
        { number: "03", title: "Construire", description: "Les solutions sont comparées et expliquées." },
      ],
    },
    faq: [
      {
        question: "Pourquoi actualiser régulièrement les informations de l’entreprise ?",
        answer:
          "Une évolution des activités, des effectifs ou des équipements peut modifier les risques et rendre les garanties inadaptées.",
      },
      {
        question: "Toutes les entreprises ont-elles besoin des mêmes garanties ?",
        answer:
          "Non. Le métier, la taille, les engagements contractuels et les moyens d’exploitation orientent fortement l’étude.",
      },
    ],
    finalCta: {
      title: "Commençons par vos risques prioritaires.",
      description: "Un premier échange permet de cadrer l’activité et les protections à examiner.",
      action: { label: "Demander un diagnostic", href: "/contact?motif=entreprise", tone: "primary" },
    },
  },
};

export const aboutPage: PublicLandingPage = {
  path: "/a-propos",
  metaTitle: "À propos | Follow-Up Insurance",
  metaDescription:
    "Découvrez le rôle de Follow-Up Insurance : écouter, comparer, expliquer et accompagner chaque assuré dans la durée.",
  hero: {
    eyebrow: "À propos",
    title: "Un courtier engagé à vos côtés.",
    intro:
      "Follow-Up Insurance vous aide à comprendre vos risques, à comparer des solutions et à prendre une décision éclairée.",
    image: {
      src: "/images/public-role-advisor.png",
      alt: "Conseillère Follow-Up Insurance échangeant avec un client",
    },
    primaryCta: { label: "Parler à un conseiller", href: "/contact", tone: "primary" },
    secondaryCta: { label: "Découvrir nos solutions", href: "/solutions", tone: "secondary" },
  },
  sections: [
    {
      id: "notre-role",
      eyebrow: "Notre rôle",
      title: "Le courtier défend la clarté de votre choix.",
      paragraphs: [
        "Nous commençons par votre situation, pas par un catalogue. Cette écoute permet de cibler les risques et d’éviter les garanties inutiles.",
        "Nous rapprochons ensuite les propositions disponibles et attirons votre attention sur leurs différences : plafonds, franchises, exclusions et services.",
      ],
      cards: [
        { title: "Écouter", description: "Comprendre votre situation, vos priorités et vos contraintes." },
        { title: "Comparer", description: "Mettre en regard les garanties et leurs conditions d’application." },
        { title: "Expliquer", description: "Rendre chaque option lisible avant votre décision." },
        { title: "Accompagner", description: "Rester disponible après la souscription et en cas de besoin." },
      ],
    },
    {
      id: "nos-valeurs",
      eyebrow: "Nos repères",
      title: "Une relation simple, humaine et durable.",
      bullets: [
        "Indépendance dans l’analyse",
        "Transparence sur les garanties et leurs limites",
        "Proximité dans les échanges",
        "Réactivité à chaque étape",
      ],
      image: {
        src: "/images/advisor-amina.webp",
        alt: "Portrait d’une conseillère en assurance",
      },
    },
    {
      id: "notre-histoire",
      eyebrow: "Notre histoire",
      title: "Un accompagnement construit dans la durée.",
      paragraphs: [
        "[Contenu éditorial à remplacer] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere, justo non facilisis consequat, sem neque viverra augue, vitae posuere lectus sapien vitae erat.",
        "[Contenu éditorial à remplacer] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ce texte provisoire pourra accueillir l’origine du cabinet, ses étapes clés et son ancrage local.",
      ],
      isPlaceholder: true,
    },
  ],
  finalCta: {
    title: "Votre situation mérite une écoute attentive.",
    description: "Expliquez-nous votre besoin : nous vous aiderons à structurer la suite.",
    action: { label: "Nous contacter", href: "/contact", tone: "primary" },
  },
};

export const solutionsPage: PublicLandingPage = {
  path: "/solutions",
  metaTitle: "Nos solutions d’assurance | Follow-Up Insurance",
  metaDescription:
    "Découvrez les solutions automobile, moto, santé, habitation, voyage et entreprise proposées par Follow-Up Insurance.",
  hero: {
    eyebrow: "Nos solutions",
    title: "Une protection construite autour de votre réalité.",
    intro:
      "Choisissez un besoin pour comprendre les garanties à examiner et les informations utiles à préparer.",
    image: {
      src: "/images/public-hero-collage.png",
      alt: "Composition illustrant plusieurs besoins d’assurance du quotidien",
    },
    primaryCta: { label: "Trouver ma solution", href: "/contact?motif=orientation", tone: "primary" },
  },
  sections: [
    {
      id: "catalogue",
      eyebrow: "Six domaines de protection",
      title: "Explorez la solution qui correspond à votre besoin.",
      cards: solutionSummaries.map((solution) => ({
        title: solution.title,
        description: solution.description,
        href: solution.path,
        label: solution.ctaLabel,
      })),
    },
    {
      id: "methode",
      eyebrow: "Notre méthode",
      title: "Comparer sur des critères qui comptent vraiment.",
      steps: [
        { number: "01", title: "Votre situation", description: "Nous recueillons les informations utiles à l’étude." },
        { number: "02", title: "Les priorités", description: "Nous distinguons les garanties essentielles des options." },
        { number: "03", title: "La comparaison", description: "Nous examinons garanties, plafonds, franchises et exclusions." },
        { number: "04", title: "Votre décision", description: "Vous choisissez avec une lecture claire des propositions." },
      ],
    },
  ],
  finalCta: {
    title: "Vous hésitez entre plusieurs protections ?",
    description: "Décrivez votre situation et laissez-nous vous orienter vers le bon point de départ.",
    action: { label: "Être orienté", href: "/contact?motif=orientation", tone: "primary" },
  },
};

export const individualsPage: PublicLandingPage = {
  path: "/particuliers",
  metaTitle: "Assurances pour particuliers | Follow-Up Insurance",
  metaDescription:
    "Protégez votre mobilité, votre santé, votre logement et vos projets avec un accompagnement personnalisé.",
  hero: {
    eyebrow: "Particuliers",
    title: "Protégez ce qui compte dans votre quotidien.",
    intro:
      "Votre situation évolue. Nous vous aidons à construire des protections cohérentes pour vous, votre famille et vos biens.",
    image: {
      src: "/images/insurance-health.webp",
      alt: "Échange rassurant autour des besoins de santé d’une famille",
    },
    primaryCta: { label: "Étudier mon besoin", href: "/contact?profil=particulier", tone: "primary" },
    secondaryCta: { label: "Voir les solutions", href: "/solutions", tone: "secondary" },
  },
  sections: [
    {
      id: "besoins",
      eyebrow: "Vos besoins",
      title: "Des solutions pour chaque étape de vie.",
      cards: [
        { title: "Se déplacer", description: "Automobile et moto adaptées à votre usage.", href: "/solutions/automobile", label: "Voir la mobilité" },
        { title: "Prendre soin", description: "Santé individuelle ou familiale selon vos priorités.", href: "/solutions/sante", label: "Voir la santé" },
        { title: "Protéger son foyer", description: "Logement, biens et responsabilité au quotidien.", href: "/solutions/habitation", label: "Voir l’habitation" },
        { title: "Préparer un départ", description: "Voyage étudié selon la destination et la durée.", href: "/solutions/voyage", label: "Voir le voyage" },
      ],
    },
    {
      id: "moments-de-vie",
      eyebrow: "Moments de vie",
      title: "Réexaminer sa protection quand la situation change.",
      bullets: [
        "Acquisition d’un véhicule ou d’un logement",
        "Évolution de la composition familiale",
        "Départ en voyage ou installation à l’étranger",
        "Changement d’activité ou de budget",
      ],
      image: {
        src: "/images/insurance-home.webp",
        alt: "Maison familiale représentant un nouveau projet de vie",
      },
    },
    {
      id: "temoignage-a-remplacer",
      eyebrow: "Parole d’assuré",
      title: "Une relation qui simplifie les décisions.",
      paragraphs: [
        "[Témoignage à remplacer] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ce texte est volontairement provisoire et devra être remplacé par un témoignage réel, validé et attribué avec accord.",
      ],
      isPlaceholder: true,
    },
  ],
  finalCta: {
    title: "Faisons le point sur votre situation.",
    description: "Un premier échange permet de déterminer les protections à examiner en priorité.",
    action: { label: "Parler à un conseiller", href: "/contact?profil=particulier", tone: "primary" },
  },
};

export const businessesPage: PublicLandingPage = {
  path: "/entreprises",
  metaTitle: "Assurances pour entreprises | Follow-Up Insurance",
  metaDescription:
    "Identifiez les risques de votre entreprise et protégez votre activité, vos équipements, vos véhicules et vos équipes.",
  hero: {
    eyebrow: "Entreprises",
    title: "Une protection à la mesure de votre activité.",
    intro:
      "Votre métier crée des risques spécifiques. Nous les hiérarchisons pour vous aider à protéger la continuité de votre entreprise.",
    image: {
      src: "/images/public-entrepreneur.png",
      alt: "Entrepreneure travaillant dans son environnement professionnel",
    },
    primaryCta: { label: "Échanger sur mes risques", href: "/contact?profil=entreprise", tone: "primary" },
    secondaryCta: { label: "Voir l’assurance entreprise", href: "/solutions/entreprise", tone: "secondary" },
  },
  sections: [
    {
      id: "risques",
      eyebrow: "Cartographie des risques",
      title: "Observer l’entreprise dans son ensemble.",
      cards: [
        { title: "Responsabilité", description: "Les dommages que l’activité pourrait causer à des clients ou à des tiers." },
        { title: "Biens", description: "Les locaux, stocks, outils, équipements et données nécessaires à l’activité." },
        { title: "Mobilité", description: "Les véhicules, missions et déplacements professionnels." },
        { title: "Personnes", description: "Les dirigeants et équipes dont dépend la continuité de l’organisation." },
      ],
    },
    {
      id: "diagnostic",
      eyebrow: "Notre démarche",
      title: "Du diagnostic au suivi.",
      steps: [
        { number: "01", title: "Comprendre le métier", description: "Activités, clients et moyens d’exploitation sont décrits." },
        { number: "02", title: "Mesurer l’exposition", description: "Les scénarios capables de perturber l’activité sont priorisés." },
        { number: "03", title: "Comparer les réponses", description: "Nous vérifions garanties, limites et obligations de prévention." },
        { number: "04", title: "Actualiser", description: "La protection est revue lorsque l’entreprise évolue." },
      ],
    },
    {
      id: "cas-client-a-remplacer",
      eyebrow: "Cas client",
      title: "Illustrer un accompagnement concret.",
      paragraphs: [
        "[Cas client à remplacer] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ce contenu secondaire accueillera plus tard un cas anonymisé décrivant le contexte, l’analyse et la solution retenue.",
      ],
      isPlaceholder: true,
    },
  ],
  finalCta: {
    title: "Chaque entreprise a ses propres points de fragilité.",
    description: "Présentez-nous votre activité pour démarrer une première cartographie des risques.",
    action: { label: "Demander un diagnostic", href: "/contact?profil=entreprise", tone: "primary" },
  },
};

export const claimsPage: PublicLandingPage & { faq: readonly PublicFaqItem[] } = {
  path: "/sinistres",
  metaTitle: "Que faire en cas de sinistre ? | Follow-Up Insurance",
  metaDescription:
    "Retrouvez les premiers réflexes, les documents à préparer et les étapes utiles après un sinistre.",
  hero: {
    eyebrow: "Sinistres",
    title: "Les bons réflexes, au bon moment.",
    intro:
      "Mettez les personnes en sécurité, limitez les dommages sans vous exposer, puis rassemblez les éléments utiles à la déclaration.",
    image: {
      src: "/images/public-claims-advisor.png",
      alt: "Conseillère accompagnant un client après un sinistre",
    },
    primaryCta: { label: "Signaler un sinistre", href: "/contact?motif=sinistre", tone: "primary" },
  },
  sections: [
    {
      id: "urgence",
      eyebrow: "Avant toute démarche",
      title: "Commencez par sécuriser la situation.",
      bullets: [
        "Protégez les personnes et contactez les secours lorsqu’une urgence l’exige.",
        "Prenez des mesures raisonnables pour empêcher l’aggravation des dommages.",
        "Conservez les biens endommagés et ne lancez pas de réparation définitive sans accord lorsqu’un constat est nécessaire.",
        "Photographiez la situation et notez les faits pendant qu’ils sont encore précis.",
      ],
    },
    {
      id: "par-type",
      eyebrow: "Selon la situation",
      title: "Préparez les éléments les plus utiles.",
      cards: [
        { title: "Accident automobile", description: "Constat, photos, coordonnées des parties et témoignages éventuels." },
        { title: "Dégât des eaux", description: "Origine présumée, photos, mesures prises et coordonnées des personnes concernées." },
        { title: "Vol", description: "Liste des biens, justificatifs disponibles et dépôt de plainte lorsque requis." },
        { title: "Incident professionnel", description: "Chronologie, contrats concernés, dommages observés et mesures de continuité." },
      ],
    },
    {
      id: "etapes",
      eyebrow: "Le parcours",
      title: "De la déclaration au suivi.",
      steps: [
        { number: "01", title: "Signaler", description: "Transmettez les premiers faits dès que possible." },
        { number: "02", title: "Documenter", description: "Rassemblez photos, justificatifs et échanges utiles." },
        { number: "03", title: "Compléter", description: "Répondez aux demandes d’information ou d’expertise." },
        { number: "04", title: "Suivre", description: "Gardez les références du dossier et les décisions reçues." },
      ],
    },
    {
      id: "delais",
      eyebrow: "Point de vigilance",
      title: "Les délais dépendent du contrat et de l’événement.",
      paragraphs: [
        "Consultez vos conditions contractuelles dès que possible : elles précisent le délai de déclaration, le canal à utiliser et les justificatifs attendus. En cas de doute, contactez votre conseiller sans attendre.",
      ],
    },
  ],
  faq: [
    {
      question: "Puis-je commencer des réparations immédiatement ?",
      answer:
        "Les mesures d’urgence destinées à éviter une aggravation peuvent être nécessaires. Pour les réparations définitives, conservez les preuves et vérifiez d’abord les consignes applicables à votre dossier.",
    },
    {
      question: "Que faire si je n’ai pas tous les documents ?",
      answer:
        "Signalez tout de même la situation dans les délais et indiquez les pièces manquantes. Elles pourront être complétées selon les indications reçues.",
    },
    {
      question: "Comment faciliter le traitement du dossier ?",
      answer:
        "Une chronologie concise, des photos lisibles, des justificatifs classés et des coordonnées exactes réduisent les échanges inutiles.",
    },
  ],
  finalCta: {
    title: "Vous venez de subir un sinistre ?",
    description: "Expliquez brièvement la situation pour être orienté vers la prochaine étape.",
    action: { label: "Signaler la situation", href: "/contact?motif=sinistre", tone: "primary" },
  },
};

export const adviceArticles: readonly AdviceArticle[] = [
  {
    slug: "choisir-assurance-automobile",
    path: "/conseils/choisir-assurance-automobile",
    category: "Automobile",
    title: "Comment choisir son assurance automobile ?",
    excerpt: "Quatre critères concrets pour comparer les formules au-delà du prix.",
    readingTime: "5 min de lecture",
    image: {
      src: "/images/insurance-auto.webp",
      alt: "Voiture rouge moderne vue depuis le dessus",
    },
    introduction:
      "Une assurance automobile se choisit d’abord en fonction de l’usage du véhicule et des conséquences financières que vous pouvez assumer en cas d’accident.",
    sections: [
      {
        id: "usage",
        title: "1. Décrivez votre usage réel",
        paragraphs: [
          "Kilométrage, trajets quotidiens, stationnement et conducteurs habituels modifient le niveau d’exposition. Une description exacte évite qu’une garantie importante repose sur une information incomplète.",
        ],
        bullets: ["Usage privé ou professionnel", "Conducteurs réguliers", "Lieu de stationnement", "Valeur et âge du véhicule"],
      },
      {
        id: "formule",
        title: "2. Choisissez ce que vous voulez protéger",
        paragraphs: [
          "La responsabilité civile protège les tiers. Les formules plus larges peuvent ajouter le vol, l’incendie, le bris de glace ou les dommages au véhicule. Le bon niveau dépend notamment de la valeur du véhicule et de votre capacité à financer son remplacement.",
        ],
      },
      {
        id: "comparaison",
        title: "3. Comparez les limites, pas seulement les garanties",
        paragraphs: [
          "Deux offres portant le même nom peuvent prévoir des franchises, plafonds et exclusions différents. Vérifiez aussi les conditions de l’assistance et du véhicule de remplacement.",
        ],
        bullets: ["Franchise après sinistre", "Valeur d’indemnisation", "Exclusions", "Assistance et services"],
      },
      {
        id: "mise-a-jour",
        title: "4. Mettez votre contrat à jour",
        paragraphs: [
          "Un changement de conducteur, d’usage ou de véhicule doit être signalé. Une revue régulière aide à conserver une protection cohérente avec la situation actuelle.",
        ],
      },
    ],
    takeaway: {
      title: "À retenir",
      points: [
        "Déclarez l’usage et les conducteurs avec précision.",
        "Arbitrez selon la valeur du véhicule et le risque que vous pouvez supporter.",
        "Lisez franchises, plafonds et exclusions avant de comparer les prix.",
      ],
    },
    cta: { label: "Étudier mon assurance auto", href: "/contact?motif=automobile", tone: "primary" },
  },
  {
    slug: "preparer-assurance-voyage",
    path: "/conseils/preparer-assurance-voyage",
    category: "Voyage",
    title: "Pourquoi préparer son assurance avant le départ ?",
    excerpt: "Les vérifications utiles pour voyager avec une couverture adaptée.",
    readingTime: "6 min de lecture",
    image: {
      src: "/images/insurance-travel.webp",
      alt: "Voyageuse préparant une valise avant son départ",
    },
    introduction:
      "Une couverture voyage pertinente dépend autant de la destination que de la durée, des voyageurs et des activités prévues.",
    sections: [
      {
        id: "destination",
        title: "1. Partez de la destination",
        paragraphs: [
          "Le coût des soins, les formalités d’entrée et l’accès local aux services médicaux diffèrent fortement d’un pays à l’autre. Vérifiez également les zones géographiques exclues.",
        ],
      },
      {
        id: "garanties",
        title: "2. Vérifiez les garanties essentielles",
        paragraphs: [
          "Frais médicaux, assistance, rapatriement, annulation et bagages ne répondent pas au même risque. Examinez leur plafond et les circonstances précises dans lesquelles elles interviennent.",
        ],
        bullets: ["Frais médicaux", "Assistance et rapatriement", "Annulation ou interruption", "Bagages et responsabilité civile"],
      },
      {
        id: "activites",
        title: "3. Déclarez les activités particulières",
        paragraphs: [
          "Certains sports, déplacements professionnels ou séjours de longue durée nécessitent une extension. Une activité non couverte peut laisser une dépense importante à votre charge.",
        ],
      },
      {
        id: "documents",
        title: "4. Gardez les informations accessibles",
        paragraphs: [
          "Conservez le numéro d’assistance, les références du contrat et la marche à suivre hors de vos bagages principaux. En cas d’urgence, contactez l’assistance avant d’engager une dépense importante lorsque cela est possible.",
        ],
      },
    ],
    takeaway: {
      title: "Avant de fermer la valise",
      points: [
        "Confirmez que la destination et toute la durée sont couvertes.",
        "Vérifiez les plafonds médicaux et les exclusions d’activité.",
        "Enregistrez le contact de l’assistance dans votre téléphone.",
      ],
    },
    cta: { label: "Préparer ma couverture voyage", href: "/contact?motif=voyage", tone: "primary" },
  },
  {
    slug: "proteger-activite-professionnelle",
    path: "/conseils/proteger-activite-professionnelle",
    category: "Entreprise",
    title: "Quels risques anticiper pour protéger son activité ?",
    excerpt: "Une méthode simple pour hiérarchiser les vulnérabilités de l’entreprise.",
    readingTime: "7 min de lecture",
    image: {
      src: "/images/insurance-business.webp",
      alt: "Équipe de professionnelles réunies autour d’un projet",
    },
    introduction:
      "Une entreprise ne se protège pas avec une liste standard de garanties. Il faut d’abord identifier ce qui pourrait interrompre son activité ou engager sa responsabilité.",
    sections: [
      {
        id: "cartographie",
        title: "1. Cartographiez les dépendances critiques",
        paragraphs: [
          "Interrogez-vous sur les locaux, les outils, les données, les fournisseurs et les personnes sans lesquels l’activité ralentirait fortement. Cette cartographie met en évidence les priorités.",
        ],
        bullets: ["Locaux et équipements", "Données et systèmes", "Fournisseurs clés", "Compétences indispensables"],
      },
      {
        id: "responsabilite",
        title: "2. Mesurez les responsabilités liées au métier",
        paragraphs: [
          "Une erreur, un retard, un produit ou une intervention peut causer un dommage à un client ou à un tiers. Décrivez précisément vos activités afin que la couverture étudiée corresponde à la réalité.",
        ],
      },
      {
        id: "continuite",
        title: "3. Préparez la continuité",
        paragraphs: [
          "L’indemnisation d’un bien ne suffit pas toujours à faire repartir l’entreprise. Délais de remplacement, perte de chiffre d’affaires et communication de crise doivent aussi être envisagés.",
        ],
      },
      {
        id: "revision",
        title: "4. Révisez la protection à chaque évolution",
        paragraphs: [
          "Nouveau local, recrutement, investissement, nouvelle activité ou contrat majeur : chaque changement peut modifier l’exposition et les capitaux à déclarer.",
        ],
      },
    ],
    takeaway: {
      title: "À revoir au moins une fois par an",
      points: [
        "Les activités et responsabilités déclarées",
        "La valeur des biens et les chiffres de référence",
        "Les dépendances critiques et le plan de continuité",
      ],
    },
    cta: { label: "Évaluer les risques de mon activité", href: "/contact?motif=entreprise", tone: "primary" },
  },
] as const;

export const advicePage: PublicLandingPage & { articles: readonly AdviceArticle[] } = {
  path: "/conseils",
  metaTitle: "Conseils en assurance | Follow-Up Insurance",
  metaDescription:
    "Des guides clairs pour mieux comprendre vos garanties et préparer vos décisions d’assurance.",
  hero: {
    eyebrow: "Conseils",
    title: "Mieux comprendre pour mieux choisir.",
    intro:
      "Des repères pratiques pour préparer vos démarches, poser les bonnes questions et lire une proposition avec recul.",
    image: {
      src: "/images/auth-advisor.webp",
      alt: "Conseillère préparant des recommandations pour un client",
    },
    primaryCta: {
      label: "Lire le guide automobile",
      href: "/conseils/choisir-assurance-automobile",
      tone: "primary",
    },
  },
  sections: [
    {
      id: "articles",
      eyebrow: "Guides pratiques",
      title: "Trois sujets pour commencer.",
      cards: adviceArticles.map((article) => ({
        title: article.title,
        description: article.excerpt,
        href: article.path,
        label: `Lire — ${article.readingTime}`,
      })),
    },
    {
      id: "ligne-editoriale",
      eyebrow: "Prochainement",
      title: "De nouveaux décryptages au fil de vos questions.",
      paragraphs: [
        "[Contenu éditorial à remplacer] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cet emplacement pourra présenter les thèmes à venir ou une courte note de la rédaction.",
      ],
      isPlaceholder: true,
    },
  ],
  articles: adviceArticles,
  finalCta: {
    title: "Une question reste sans réponse ?",
    description: "Présentez votre situation à un conseiller pour obtenir une orientation personnalisée.",
    action: { label: "Poser ma question", href: "/contact?motif=conseil", tone: "primary" },
  },
};

export const contactPage: PublicLandingPage & {
  formSubjects: readonly { value: string; label: string }[];
  contactChannels: readonly PublicCard[];
} = {
  path: "/contact",
  metaTitle: "Contact | Follow-Up Insurance",
  metaDescription:
    "Contactez Follow-Up Insurance pour une étude, une question sur vos garanties ou un accompagnement après sinistre.",
  hero: {
    eyebrow: "Contact",
    title: "Parlons de votre besoin.",
    intro:
      "Expliquez-nous votre situation en quelques lignes. Un conseiller pourra vous orienter vers la prochaine étape.",
    image: {
      src: "/images/advisor-amina.webp",
      alt: "Conseillère Follow-Up Insurance disponible pour un échange",
    },
  },
  sections: [
    {
      id: "formulaire",
      eyebrow: "Votre demande",
      title: "Quelques informations pour bien vous orienter.",
      paragraphs: [
        "Indiquez votre nom, vos coordonnées, le motif de votre demande et le moyen par lequel vous préférez être recontacté. Ne transmettez pas de données médicales ou bancaires dans ce premier message.",
      ],
    },
    {
      id: "coordonnees",
      eyebrow: "Coordonnées",
      title: "Choisissez le canal qui vous convient.",
      paragraphs: [
        "Les coordonnées, horaires et liens sociaux affichés sur cette page proviennent de la configuration officielle du site. Toute valeur encore vide doit être complétée avant la mise en production.",
      ],
    },
  ],
  formSubjects: [
    { value: "orientation", label: "Être orienté vers une solution" },
    { value: "automobile", label: "Assurance automobile" },
    { value: "moto", label: "Assurance moto" },
    { value: "sante", label: "Assurance santé" },
    { value: "habitation", label: "Assurance habitation" },
    { value: "voyage", label: "Assurance voyage" },
    { value: "entreprise", label: "Assurance entreprise" },
    { value: "sinistre", label: "Signaler un sinistre" },
    { value: "autre", label: "Autre demande" },
  ],
  contactChannels: [
    { title: "Téléphone", description: "Pour un échange direct pendant les horaires d’ouverture." },
    { title: "E-mail", description: "Pour transmettre une demande générale et être recontacté." },
    { title: "Rendez-vous", description: "Pour approfondir une situation personnelle ou professionnelle." },
  ],
};

export const faqPage: PublicLandingPage & {
  categories: readonly { id: string; title: string; items: readonly PublicFaqItem[] }[];
} = {
  path: "/faq",
  metaTitle: "Questions fréquentes | Follow-Up Insurance",
  metaDescription:
    "Retrouvez des réponses claires sur le rôle du courtier, les études, les contrats, les documents et les sinistres.",
  hero: {
    eyebrow: "Questions fréquentes",
    title: "Les réponses essentielles, sans détour.",
    intro:
      "Comprenez notre rôle, préparez votre demande et repérez rapidement les informations à vérifier.",
    image: {
      src: "/images/public-role-advisor.png",
      alt: "Conseillère répondant aux questions d’un client",
    },
    primaryCta: { label: "Poser une autre question", href: "/contact?motif=question", tone: "primary" },
  },
  sections: [
    {
      id: "mode-emploi",
      title: "Retrouvez les réponses par thème.",
      paragraphs: [
        "Les réponses restent générales. Les conditions exactes applicables à une assurance figurent toujours dans les documents contractuels correspondants.",
      ],
    },
  ],
  categories: [
    {
      id: "courtier",
      title: "Le rôle du courtier",
      items: [
        {
          question: "Quelle est la différence entre un courtier et une compagnie d’assurance ?",
          answer:
            "La compagnie porte le risque et émet le contrat. Le courtier analyse votre besoin, recherche des solutions auprès de partenaires et vous accompagne dans votre choix.",
        },
        {
          question: "Le courtier choisit-il à ma place ?",
          answer:
            "Non. Il vous présente les options et leurs différences afin que vous puissiez prendre une décision éclairée.",
        },
      ],
    },
    {
      id: "etude",
      title: "Étude et souscription",
      items: [
        {
          question: "Quelles informations faut-il fournir pour une étude ?",
          answer:
            "Cela dépend du risque. Votre identité, votre situation, le bien ou l’activité à protéger et vos antécédents pertinents sont généralement nécessaires.",
        },
        {
          question: "Pourquoi les informations doivent-elles être exactes ?",
          answer:
            "Elles servent à évaluer le risque et à établir la proposition. Une déclaration incomplète ou inexacte peut avoir des conséquences sur les garanties.",
        },
        {
          question: "Une demande d’étude m’engage-t-elle ?",
          answer:
            "Non. Vous restez libre d’accepter ou non la proposition qui vous est présentée, sauf engagement distinct clairement indiqué.",
        },
      ],
    },
    {
      id: "contrat",
      title: "Contrat et paiement",
      items: [
        {
          question: "Que dois-je vérifier avant de signer ?",
          answer:
            "Vérifiez les personnes et biens couverts, les garanties, les plafonds, les franchises, les exclusions, la durée et les modalités de paiement.",
        },
        {
          question: "Quand faut-il signaler un changement de situation ?",
          answer:
            "Dès qu’un changement peut modifier le risque : déménagement, nouvel usage, nouveau conducteur, évolution d’activité ou acquisition d’un équipement important.",
        },
      ],
    },
    {
      id: "sinistre",
      title: "Sinistres",
      items: [
        {
          question: "Que faire immédiatement après un sinistre ?",
          answer:
            "Sécurisez les personnes, évitez l’aggravation des dommages sans vous mettre en danger, documentez les faits et consultez les modalités de déclaration du contrat.",
        },
        {
          question: "Quels documents conserver ?",
          answer:
            "Gardez les photos, constats, factures, preuves de propriété, échanges et toute pièce permettant d’établir la chronologie et l’étendue des dommages.",
        },
      ],
    },
  ],
  finalCta: {
    title: "Vous ne trouvez pas votre réponse ?",
    description: "Envoyez-nous votre question avec le minimum d’informations nécessaires.",
    action: { label: "Nous écrire", href: "/contact?motif=question", tone: "primary" },
  },
};

export const publicPageRegistry = {
  about: aboutPage,
  solutions: solutionsPage,
  individuals: individualsPage,
  businesses: businessesPage,
  claims: claimsPage,
  advice: advicePage,
  contact: contactPage,
  faq: faqPage,
} as const;

export const adviceArticleBySlug = Object.fromEntries(
  adviceArticles.map((article) => [article.slug, article]),
) as Record<AdviceArticleSlug, AdviceArticle>;
