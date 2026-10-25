export interface PrivacyPolicySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const privacyPolicy = {
  title: "Politique de confidentialité",
  intro: "Cette politique explique de manière transparente comment FOLLOW-UP INSURANCE collecte, utilise, conserve, protège et partage les données personnelles utilisées sur son site et dans son espace client.",
  updatedAt: "25 octobre 2026",
  sections: [
    {
      title: "1. Responsable du traitement",
      paragraphs: [
        "FOLLOW-UP INSURANCE est responsable des traitements de données réalisés au moyen du site followupassurance.com et de l’espace client associé. Cette politique concerne notamment la création de compte, l’authentification, les demandes d’assurance, le suivi des contrats et des sinistres, ainsi que les échanges avec le courtier.",
        "Pour toute question relative à vos données personnelles ou pour exercer vos droits, vous pouvez contacter FOLLOW-UP INSURANCE depuis la page Contact du site.",
      ],
    },
    {
      title: "2. Données que nous collectons",
      paragraphs: ["Selon les fonctionnalités que vous utilisez, nous pouvons traiter les catégories de données suivantes :"],
      bullets: [
        "données d’identification et de contact : nom complet, adresse email et numéro de téléphone ;",
        "données de compte : identifiant interne, mode de connexion, état du compte et informations nécessaires à la gestion de la session ;",
        "données liées à vos besoins d’assurance : informations communiquées dans une demande, un dossier, un contrat ou une déclaration de sinistre ;",
        "documents que vous choisissez de transmettre pour l’étude ou le suivi d’un dossier ;",
        "données techniques et de sécurité : adresse IP utilisée lors de certaines opérations, journaux de sécurité, cookies de session et jeton de protection CSRF.",
      ],
    },
    {
      title: "3. Données obtenues avec “Continuer avec Google”",
      paragraphs: [
        "Si vous choisissez l’authentification Google, Google transmet à FOLLOW-UP INSURANCE un identifiant unique de compte Google, votre adresse email vérifiée et votre nom. Le numéro de téléphone demandé lors de la première connexion est fourni directement à FOLLOW-UP INSURANCE : il ne provient pas de Google.",
        "FOLLOW-UP INSURANCE ne reçoit jamais votre mot de passe Google et ne demande aucun accès à vos emails Gmail, contacts, fichiers Google Drive, calendrier, photos ou autres contenus de votre compte Google.",
        "Le jeton d’identité Google est envoyé à notre serveur uniquement afin d’en vérifier l’authenticité. Il n’est pas utilisé pour appeler d’autres API Google ni pour accéder à d’autres données Google.",
      ],
    },
    {
      title: "4. Utilisation de vos données",
      paragraphs: ["Nous utilisons les données collectées uniquement pour les finalités suivantes :"],
      bullets: [
        "créer et sécuriser votre compte client ;",
        "vous authentifier et maintenir votre session ;",
        "répondre à vos demandes et permettre leur suivi ;",
        "préparer, administrer et suivre les services d’assurance que vous sollicitez ;",
        "échanger avec vous au sujet de votre compte ou de vos dossiers ;",
        "prévenir la fraude, les abus et les accès non autorisés ;",
        "respecter les obligations légales, réglementaires et contractuelles applicables.",
      ],
    },
    {
      title: "5. Engagement particulier concernant les données Google",
      paragraphs: [
        "Les données reçues de Google servent uniquement à créer ou retrouver votre compte FOLLOW-UP INSURANCE et à vous connecter de façon sécurisée.",
        "Nous ne vendons pas les données Google, ne les utilisons pas pour la publicité ciblée, ne les transmettons pas à des courtiers en données et ne les utilisons pas pour entraîner des modèles d’intelligence artificielle ou d’apprentissage automatique.",
      ],
    },
    {
      title: "6. Partage et destinataires",
      paragraphs: [
        "Vos données sont accessibles uniquement aux personnes autorisées de FOLLOW-UP INSURANCE qui en ont besoin pour assurer le service demandé.",
        "Elles peuvent être communiquées, dans la stricte mesure nécessaire, à nos prestataires techniques agissant pour notre compte, aux assureurs ou partenaires indispensables au traitement d’un dossier, ainsi qu’aux autorités lorsque la loi l’exige. Ces destinataires ne sont pas autorisés à utiliser les données Google pour leurs propres finalités publicitaires.",
        "Nous ne vendons ni ne louons vos données personnelles.",
      ],
    },
    {
      title: "7. Conservation et suppression",
      paragraphs: [
        "Les données du compte, y compris l’identifiant Google, le nom et l’adresse email, sont conservées pendant la durée d’utilisation du compte. Lorsque vous demandez la suppression de votre compte, elles sont supprimées ou anonymisées après traitement de la demande, sauf lorsqu’une conservation limitée reste nécessaire pour respecter une obligation légale, défendre un droit ou gérer un dossier contractuel en cours.",
        "Les codes de vérification à usage unique expirent après 10 minutes. Les cookies de session expirent au plus tard après 14 jours. Les données liées aux demandes, contrats et sinistres sont conservées pendant la durée nécessaire à leur gestion puis pendant les délais imposés ou autorisés par les obligations applicables.",
      ],
    },
    {
      title: "8. Sécurité",
      paragraphs: [
        "FOLLOW-UP INSURANCE met en œuvre des mesures techniques et organisationnelles destinées à protéger les données contre l’accès non autorisé, la perte, l’altération ou la divulgation. Elles comprennent notamment les communications HTTPS, le hachage des mots de passe, des cookies de session sécurisés et non accessibles au JavaScript, une protection CSRF, des contrôles d’accès et la journalisation des événements de sécurité.",
        "Les mots de passe et codes de vérification ne sont pas conservés en clair. Les données médicales sensibles ne doivent pas apparaître dans les journaux techniques.",
      ],
    },
    {
      title: "9. Cookies",
      paragraphs: [
        "L’espace client utilise des cookies strictement nécessaires à l’authentification, au maintien de la session et à la protection contre les requêtes frauduleuses. Ces cookies ne sont pas utilisés à des fins publicitaires. La connexion Google peut également nécessiter des éléments techniques gérés par Google conformément à ses propres règles de confidentialité.",
      ],
    },
    {
      title: "10. Vos choix et vos droits",
      paragraphs: [
        "Vous pouvez demander l’accès, la rectification ou la suppression de vos données, ainsi que la limitation d’un traitement lorsque cela est applicable. Vous pouvez également cesser d’utiliser la connexion Google et révoquer l’accès accordé à FOLLOW-UP INSURANCE depuis les paramètres de sécurité de votre compte Google.",
        "Pour demander la suppression de votre compte et des données Google associées, contactez-nous depuis la page Contact en indiquant l’adresse email du compte concerné. Une vérification d’identité peut être demandée afin d’éviter la suppression frauduleuse du compte d’un tiers.",
      ],
    },
    {
      title: "11. Modifications de cette politique",
      paragraphs: [
        "Cette politique peut être mise à jour lorsque nos services ou nos pratiques évoluent. La date de dernière mise à jour est indiquée en haut de la page. Toute modification importante concernant l’utilisation des données Google sera publiée sur cette page avant sa prise d’effet.",
      ],
    },
  ] satisfies PrivacyPolicySection[],
} as const;
