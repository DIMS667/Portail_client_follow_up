export interface TermsOfUseSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const termsOfUse = {
  title: "Conditions d’utilisation",
  intro:
    "Les présentes conditions encadrent l’accès au site followupassurance.com et l’utilisation des services numériques proposés par Follow-Up Insurance.",
  updatedAt: "30 octobre 2026",
  sections: [
    {
      title: "1. Objet et acceptation",
      paragraphs: [
        "En consultant le site ou en utilisant l’espace client, vous reconnaissez avoir pris connaissance des présentes conditions et vous engagez à les respecter. Si vous créez un compte pour le compte d’une autre personne ou d’une organisation, vous déclarez être autorisé à agir en son nom.",
        "Ces conditions portent uniquement sur l’utilisation du site et de ses fonctionnalités. Les garanties, exclusions, franchises, plafonds, délais et autres conditions propres à une assurance sont définis exclusivement dans les documents contractuels correspondants.",
      ],
    },
    {
      title: "2. Services proposés",
      paragraphs: [
        "Le site permet notamment de découvrir les solutions présentées par Follow-Up Insurance, de créer un espace client, de transmettre une demande d’assurance, de déposer des documents, de suivre le traitement d’un dossier, de consulter les coordonnées du gestionnaire affecté et de déclarer ou suivre un sinistre.",
        "Follow-Up Insurance intervient en qualité de courtier et accompagne le client dans l’étude de ses besoins et la recherche de solutions. Le dépôt d’une demande, la réception d’une proposition ou un échange avec un gestionnaire ne vaut ni acceptation par un assureur, ni conclusion immédiate d’un contrat, ni prise d’effet d’une garantie.",
      ],
    },
    {
      title: "3. Création et utilisation du compte",
      paragraphs: [
        "L’accès à certaines fonctionnalités nécessite un compte personnel. Vous devez fournir des informations exactes, complètes et à jour, utiliser une adresse email et un numéro de téléphone auxquels vous avez légitimement accès, et maintenir vos coordonnées à jour.",
        "Le compte est strictement personnel. Vous êtes responsable de la confidentialité de vos identifiants, de votre mot de passe et des opérations réalisées depuis votre session. Vous devez avertir Follow-Up Insurance sans délai si vous soupçonnez un accès non autorisé ou une compromission de votre compte.",
        "La connexion peut être effectuée avec une adresse email et un mot de passe ou, lorsqu’elle est proposée, au moyen de Google. L’utilisation de Google reste également soumise aux conditions propres à ce service.",
      ],
    },
    {
      title: "4. Obligations de l’utilisateur",
      paragraphs: ["Lorsque vous utilisez le site, vous vous engagez notamment à :"],
      bullets: [
        "communiquer des informations sincères, pertinentes et suffisamment précises pour permettre l’étude de votre demande ;",
        "ne pas usurper l’identité d’un tiers et ne pas utiliser un compte sans autorisation ;",
        "ne pas transmettre de contenu illicite, trompeur, malveillant ou sans rapport avec le dossier concerné ;",
        "ne pas tenter de contourner les mesures de sécurité, de perturber le service ou d’accéder à des données qui ne vous sont pas destinées ;",
        "respecter les droits de propriété intellectuelle et la vie privée des personnes concernées par les informations transmises.",
      ],
    },
    {
      title: "5. Demandes et informations d’assurance",
      paragraphs: [
        "Les informations et contenus accessibles sur le site ont une vocation générale et d’orientation. Ils ne remplacent ni une analyse personnalisée, ni les documents remis par l’assureur, ni les obligations de déclaration qui vous incombent avant et pendant le contrat.",
        "Vous devez vérifier les informations figurant dans une proposition avant de l’accepter et signaler toute erreur ou évolution de votre situation. La disponibilité d’une solution, son tarif et ses conditions dépendent notamment des informations communiquées, de l’analyse du risque et de la décision de l’assureur concerné.",
      ],
    },
    {
      title: "6. Documents transmis",
      paragraphs: [
        "Les rubriques documentaires servent uniquement à transmettre les pièces nécessaires aux démarches d’assurance, aux contrats et aux sinistres. Elles ne constituent pas un espace de stockage personnel destiné à conserver tout type de fichier.",
        "Vous devez déposer chaque document dans la rubrique appropriée, vous assurer qu’il est lisible, complet, à jour et qu’il correspond bien à la pièce demandée. Un gestionnaire peut signaler un document illisible, incomplet ou non conforme et vous demander de le remplacer.",
        "Vous ne devez transmettre que des documents que vous êtes autorisé à communiquer. La suppression d’un fichier depuis l’espace client peut être limitée lorsqu’une conservation demeure nécessaire pour traiter un dossier en cours ou respecter une obligation applicable.",
      ],
    },
    {
      title: "7. Déclarations de sinistre",
      paragraphs: [
        "La rubrique Sinistres permet de transmettre une déclaration et de suivre son traitement. Elle ne remplace pas les services d’urgence, les autorités compétentes ni les démarches imposées par le contrat d’assurance. En cas d’urgence, contactez directement les services compétents.",
        "Vous devez déclarer le sinistre dans les délais applicables, fournir des informations exactes et conserver les justificatifs utiles. L’enregistrement de la déclaration sur le site ne garantit pas sa prise en charge : celle-ci dépend du contrat, des circonstances, des pièces fournies et de la décision de l’assureur.",
      ],
    },
    {
      title: "8. Données sensibles",
      paragraphs: [
        "Certaines démarches, notamment en assurance santé, peuvent nécessiter des informations sensibles. Ne transmettez ces données que lorsqu’elles sont demandées dans un champ ou une rubrique sécurisée prévue à cet effet et qu’elles sont nécessaires à l’étude ou au suivi du dossier.",
        "N’inscrivez pas de données médicales, bancaires ou de mots de passe dans les champs de message général, les noms de fichiers ou toute zone qui ne leur est pas destinée.",
      ],
    },
    {
      title: "9. Disponibilité et évolution du service",
      paragraphs: [
        "Follow-Up Insurance s’efforce de maintenir le site accessible et sécurisé. Des interruptions peuvent toutefois survenir pour maintenance, mise à jour, incident technique, contrainte de sécurité ou événement indépendant de notre volonté.",
        "Les fonctionnalités et contenus peuvent évoluer afin d’améliorer le service, de renforcer sa sécurité ou de répondre à des exigences opérationnelles ou réglementaires. Lorsqu’une modification affecte sensiblement vos droits, une information adaptée est publiée ou communiquée lorsque cela est nécessaire.",
      ],
    },
    {
      title: "10. Suspension ou fermeture d’un compte",
      paragraphs: [
        "Follow-Up Insurance peut restreindre ou suspendre l’accès à un compte en cas d’utilisation frauduleuse, de tentative d’intrusion, de violation des présentes conditions, de risque pour la sécurité ou d’obligation légale. Lorsque la situation le permet, l’utilisateur est informé du motif et des démarches permettant de régulariser son accès.",
        "Vous pouvez demander la fermeture de votre compte depuis les canaux de contact du site. Certaines données liées à des dossiers, contrats ou sinistres peuvent néanmoins être conservées pendant la durée nécessaire à leur traitement ou au respect d’une obligation applicable.",
      ],
    },
    {
      title: "11. Propriété intellectuelle",
      paragraphs: [
        "Le site, sa structure, son identité visuelle, ses textes, illustrations, logos, marques, interfaces et éléments logiciels sont protégés. Sauf autorisation préalable ou exception prévue par la loi, ils ne peuvent pas être reproduits, modifiés, distribués ou exploités à des fins commerciales.",
        "Vous conservez les droits que vous détenez sur les informations et documents transmis. Vous autorisez Follow-Up Insurance à les utiliser uniquement dans la mesure nécessaire au service demandé, au traitement du dossier et au respect de ses obligations.",
      ],
    },
    {
      title: "12. Responsabilité",
      paragraphs: [
        "Follow-Up Insurance met en œuvre des moyens raisonnables pour fournir des informations exactes et un service sécurisé. Sa responsabilité ne peut toutefois être engagée pour une décision prise sur la base d’informations générales sans analyse personnalisée, pour une erreur provenant d’informations inexactes ou incomplètes fournies par l’utilisateur, ni pour une interruption indépendante de sa volonté.",
        "L’utilisateur reste responsable de son équipement, de sa connexion, de la protection de ses identifiants et du respect des délais ou formalités prévus par son contrat. Aucune disposition des présentes conditions n’a pour objet d’écarter une responsabilité qui ne pourrait pas être exclue en vertu des règles applicables.",
      ],
    },
    {
      title: "13. Données personnelles",
      paragraphs: [
        "Le traitement des données personnelles et l’utilisation des cookies strictement nécessaires sont expliqués dans la Politique de confidentialité accessible depuis le pied de page du site. Cette politique précise notamment les catégories de données traitées, leurs finalités, leur durée de conservation et les modalités d’exercice de vos droits.",
      ],
    },
    {
      title: "14. Droit applicable et règlement des différends",
      paragraphs: [
        "Les présentes conditions sont régies par le droit applicable au Cameroun. En cas de difficulté relative à l’utilisation du site, nous vous invitons à contacter d’abord Follow-Up Insurance afin de rechercher une solution amiable.",
        "À défaut de résolution amiable, le différend relève des juridictions compétentes, sous réserve des règles impératives applicables et des voies de recours particulières éventuellement prévues pour le service concerné.",
      ],
    },
    {
      title: "15. Contact",
      paragraphs: [
        "Pour toute question concernant ces conditions ou l’utilisation du site, vous pouvez utiliser la page Contact ou joindre Follow-Up Insurance aux coordonnées publiées sur le site.",
      ],
    },
  ] satisfies TermsOfUseSection[],
} as const;
