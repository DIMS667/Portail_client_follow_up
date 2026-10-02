import type { PortalStore } from "../types/domain";

export const DEMO_CREDENTIALS = { email: "jean.dupont@demo.com", phone: "+237 6 99 00 11 22", password: "demo1234" };

export function createDemoSeed(): PortalStore {
  return {
    version: 1,
    session: { authenticated: false },
    credentials: DEMO_CREDENTIALS,
    client: {
      id: "CL-001", firstName: "Jean", lastName: "Dupont", phone: "+237 6 99 00 11 22", email: DEMO_CREDENTIALS.email,
      address: "Quartier Bonapriso", city: "Douala", preferences: { email: true, sms: true, whatsapp: false, inApp: true },
    },
    advisor: { id: "ADV-001", name: "Aminata Mballa", phone: "+237 6 55 10 20 30", email: "aminata.mballa@demo.local", initials: "AM" },
    requests: [
      {
        id: "REQ-001", reference: "DEM-2026-00145", clientId: "CL-001", product: "automobile", productLabel: "Assurance automobile", date: "2026-09-26", status: "proposals_available", advisorId: "ADV-001", proposalId: "PROP-001",
        vehicle: { brand: "Toyota", model: "RAV4", year: "2022", registration: "LT 458 AA", value: 18000000, usage: "Personnel" }, coverage: "Tous risques", desiredStartDate: "2026-10-12",
        timeline: [
          { label: "Demande reçue", at: "26 sept. 2026", done: true }, { label: "Besoin analysé", at: "28 sept. 2026", done: true },
          { label: "Propositions préparées", at: "30 sept. 2026", done: true }, { label: "En attente de votre choix", done: false, active: true },
          { label: "Documents", done: false }, { label: "Paiement", done: false }, { label: "Émission de la police", done: false },
        ], scope: "core",
      },
      { id: "REQ-002", reference: "DEM-2026-00118", clientId: "CL-001", product: "voyage", productLabel: "Assurance voyage", date: "2026-09-19", status: "under_review", advisorId: "ADV-001", timeline: [{ label: "Demande reçue", at: "19 sept. 2026", done: true }, { label: "Analyse du besoin", done: false, active: true }, { label: "Préparation des propositions", done: false }, { label: "Propositions disponibles", done: false }], scope: "core" },
      { id: "REQ-003", reference: "DEM-2026-00092", clientId: "CL-001", product: "habitation", productLabel: "Assurance habitation", date: "2026-08-03", status: "completed", advisorId: "ADV-001", timeline: [{ label: "Demande reçue", done: true }, { label: "Offre choisie", done: true }, { label: "Documents validés", done: true }, { label: "Police disponible", done: true }], scope: "core" },
      { id: "REQ-004", reference: "DEM-2026-00132", clientId: "CL-001", product: "automobile", productLabel: "Assurance automobile", date: "2026-09-23", status: "documents_required", advisorId: "ADV-001", timeline: [{ label: "Demande reçue", done: true }, { label: "Offre choisie", done: true }, { label: "Documents à compléter", done: false, active: true }], scope: "scenario" },
      { id: "REQ-005", reference: "DEM-2026-00127", clientId: "CL-001", product: "automobile", productLabel: "Assurance automobile", date: "2026-09-21", status: "payment_pending", advisorId: "ADV-001", timeline: [{ label: "Demande reçue", done: true }, { label: "Documents validés", done: true }, { label: "Paiement à effectuer", done: false, active: true }], scope: "scenario" },
      { id: "REQ-006", reference: "DEM-2026-00121", clientId: "CL-001", product: "automobile", productLabel: "Assurance automobile", date: "2026-09-20", status: "policy_issuing", advisorId: "ADV-001", timeline: [{ label: "Paiement confirmé", done: true }, { label: "Traitement du dossier", done: false, active: true }, { label: "Police disponible", done: false }], scope: "scenario" },
    ],
    proposals: [{ id: "PROP-001", reference: "PROP-2026-0087", requestId: "REQ-001", offerIds: ["OFF-001", "OFF-002", "OFF-003"], recommendedOfferId: "OFF-001", advice: "Au regard de votre profil et du niveau de couverture recherché, cette proposition présente un bon équilibre entre garanties, franchise et coût annuel." }],
    offers: [
      { id: "OFF-001", reference: "OFF-001", proposalId: "PROP-001", provider: "Compagnie A", product: "Auto Sérénité", premium: 105000, duration: "12 mois", effectiveDate: "2026-10-12", deductible: 50000, guarantees: ["Responsabilité civile", "Vol", "Incendie", "Assistance"], options: ["Bris de glace", "Véhicule de remplacement"], exclusions: ["Conduite sans permis valide", "Usage en compétition"], requiredDocuments: ["CNI", "Carte grise", "Permis de conduire", "Ancienne attestation", "Photo du véhicule"] },
      { id: "OFF-002", reference: "OFF-002", proposalId: "PROP-001", provider: "Compagnie B", product: "Auto Confort", premium: 120000, duration: "12 mois", effectiveDate: "2026-10-12", deductible: 75000, guarantees: ["Responsabilité civile", "Dommages", "Vol", "Incendie", "Assistance"], options: ["Protection du conducteur"], exclusions: ["Usure mécanique", "Conduite non autorisée"], requiredDocuments: ["CNI", "Carte grise", "Permis de conduire", "Photo du véhicule"] },
      { id: "OFF-003", reference: "OFF-003", proposalId: "PROP-001", provider: "Compagnie C", product: "Auto Essentiel", premium: 98500, duration: "12 mois", effectiveDate: "2026-10-12", deductible: 100000, guarantees: ["Responsabilité civile", "Vol", "Assistance"], options: ["Incendie"], exclusions: ["Dommages propres", "Accessoires non déclarés"], requiredDocuments: ["CNI", "Carte grise", "Permis de conduire"] },
    ],
    documents: [
      { id: "DOC-001", title: "Carte nationale d’identité", category: "Identité", type: "CNI", ownerId: "CL-001", status: "validated", fileName: "cni-jean-dupont.pdf", date: "2026-09-27" },
      { id: "DOC-002", title: "Carte grise", category: "Véhicules", type: "Carte grise", ownerId: "REQ-001", status: "correction_required", fileName: "carte-grise.jpg", date: "2026-09-28", correctionMessage: "Le document transmis est difficilement lisible. Merci d’envoyer une nouvelle copie." },
      { id: "DOC-003", title: "Permis de conduire", category: "Identité", type: "Permis", ownerId: "REQ-001", status: "validated", fileName: "permis.pdf", date: "2026-09-28" },
      { id: "DOC-004", title: "Ancienne attestation", category: "Attestations", type: "Attestation", ownerId: "REQ-001", status: "received", fileName: "ancienne-attestation.pdf", date: "2026-09-29" },
      { id: "DOC-005", title: "Photo du véhicule", category: "Véhicules", type: "Photo", ownerId: "REQ-001", status: "required" },
      { id: "DOC-006", title: "Police automobile", category: "Polices", type: "Police", ownerId: "POL-2026-00325", status: "validated", date: "2026-08-15", downloadUrl: "/documents-demo/police-auto-demo.pdf" },
      { id: "DOC-007", title: "Attestation automobile", category: "Attestations", type: "Attestation", ownerId: "POL-2026-00325", status: "validated", date: "2026-08-15", downloadUrl: "/documents-demo/attestation-auto-demo.pdf" },
      { id: "DOC-008", title: "Reçu PAY-2026-00045", category: "Reçus", type: "Reçu", ownerId: "PAY-2026-00045", status: "validated", date: "2026-08-14", downloadUrl: "/documents-demo/recu-paiement-demo.pdf" },
    ],
    payments: [
      { id: "PAY-001", reference: "PAY-2026-00045", contractId: "POL-2026-00325", requestId: "REQ-006", amount: 105000, date: "2026-08-14", method: "mobile_money", status: "succeeded" },
      { id: "PAY-002", reference: "PAY-2026-00031", contractId: "POL-2026-00291", amount: 85000, date: "2026-06-20", method: "bank_card", status: "succeeded" },
      { id: "PAY-003", reference: "PAY-2026-00019", requestId: "REQ-002", amount: 45000, date: "2026-04-02", method: "orange_money", status: "succeeded" },
    ],
    contracts: [
      { id: "CON-001", policyNumber: "POL-2026-00325", clientId: "CL-001", product: "automobile", productLabel: "Assurance automobile", provider: "Compagnie A", effectiveDate: "2026-10-12", expirationDate: "2027-10-12", premium: 105000, status: "active", guarantees: ["Responsabilité civile", "Vol", "Incendie", "Assistance"], documentIds: ["DOC-006", "DOC-007", "DOC-008"], paymentIds: ["PAY-001"], claimIds: ["CLAIM-001"] },
      { id: "CON-002", policyNumber: "POL-2026-00291", clientId: "CL-001", product: "habitation", productLabel: "Assurance habitation", provider: "Compagnie B", effectiveDate: "2026-06-21", expirationDate: "2028-06-20", premium: 85000, status: "active", guarantees: ["Incendie", "Dégâts des eaux", "Vol", "Responsabilité civile"], documentIds: [], paymentIds: ["PAY-002"], claimIds: ["CLAIM-002"] },
    ],
    renewals: [{ id: "REN-001", reference: "REN-2027-00012", contractId: "POL-2026-00325", expirationDate: "2027-10-12", currentPremium: 105000, status: "eligible" }],
    claims: [
      { id: "CLAIM-001", reference: "SIN-2026-00018", contractId: "POL-2026-00325", productLabel: "Automobile", type: "Accident", date: "2026-09-14", location: "Douala, Bonanjo", description: "Collision légère à un carrefour, sans blessé.", status: "sent_to_insurer", timeline: [{ label: "Déclaration reçue", done: true }, { label: "Analyse du dossier", done: true }, { label: "Documents vérifiés", done: true }, { label: "Transmis à la compagnie", done: false, active: true }, { label: "Expertise", done: false }, { label: "Décision", done: false }, { label: "Indemnisation", done: false }, { label: "Clôture", done: false }], scope: "core" },
      { id: "CLAIM-002", reference: "SIN-2026-00007", contractId: "POL-2026-00291", productLabel: "Habitation", type: "Dégât des eaux", date: "2026-05-08", location: "Douala", description: "Fuite d’eau dans la cuisine.", status: "closed", timeline: [{ label: "Déclaration reçue", done: true }, { label: "Expertise", done: true }, { label: "Décision", done: true }, { label: "Indemnisation", done: true }, { label: "Clôture", done: true }], scope: "core" },
    ],
    messages: [
      { id: "MSG-001", sender: "client", body: "Bonjour, je voudrais savoir si ma carte grise a été validée.", sentAt: "2026-10-01T09:18:00" },
      { id: "MSG-002", sender: "advisor", body: "Bonjour Jean, elle est désormais validée. Votre dossier peut continuer.", sentAt: "2026-10-01T09:31:00" },
    ],
    notifications: [
      { id: "NOT-001", title: "3 propositions disponibles", body: "Consultez les offres préparées pour votre assurance automobile.", date: "2026-10-01T11:30:00", route: "/espace/demandes/DEM-2026-00145/propositions", read: false, kind: "proposal" },
      { id: "NOT-002", title: "Document à remplacer", body: "Votre carte grise est difficilement lisible.", date: "2026-09-30T14:10:00", route: "/espace/documents", read: false, kind: "document" },
      { id: "NOT-003", title: "Paiement confirmé", body: "Votre paiement de 105 000 FCFA a été confirmé.", date: "2026-09-29T10:00:00", route: "/espace/paiements", read: true, kind: "payment" },
      { id: "NOT-004", title: "Police disponible", body: "Votre police automobile est disponible au téléchargement.", date: "2026-09-28T16:25:00", route: "/espace/contrats/POL-2026-00325", read: true, kind: "contract" },
      { id: "NOT-005", title: "Demande enregistrée", body: "Votre demande d’assurance voyage a bien été enregistrée.", date: "2026-09-19T08:45:00", route: "/espace/demandes/DEM-2026-00118", read: true, kind: "request" },
      { id: "NOT-006", title: "Dossier en analyse", body: "Votre courtier analyse actuellement votre besoin.", date: "2026-09-20T08:00:00", route: "/espace/demandes/DEM-2026-00118", read: true, kind: "request" },
      { id: "NOT-007", title: "Échéance dans 30 jours", body: "Votre contrat automobile pourra bientôt être renouvelé.", date: "2027-09-12T08:00:00", route: "/espace/renouvellements/POL-2026-00325", read: false, kind: "renewal" },
      { id: "NOT-008", title: "Sinistre mis à jour", body: "Votre dossier a été transmis à la compagnie.", date: "2026-09-25T15:40:00", route: "/espace/sinistres/SIN-2026-00018", read: true, kind: "claim" },
    ],
    activities: [
      { id: "ACT-001", label: "Votre proposition automobile est disponible.", date: "Aujourd’hui, 11:30", route: "/espace/demandes/DEM-2026-00145/propositions", kind: "proposal" },
      { id: "ACT-002", label: "Votre carte grise a été validée.", date: "Hier, 14:10", route: "/espace/documents", kind: "document" },
      { id: "ACT-003", label: "Votre paiement de 105 000 FCFA a été confirmé.", date: "29 sept., 10:00", route: "/espace/paiements", kind: "payment" },
      { id: "ACT-004", label: "Votre police d’assurance est disponible.", date: "28 sept., 16:25", route: "/espace/contrats/POL-2026-00325", kind: "contract" },
    ],
    scenarios: [
      { id: "scenario-1", number: 1, title: "Nouvelle demande", description: "Démarrer le parcours automobile", route: "/espace/demandes/nouvelle" },
      { id: "scenario-2", number: 2, title: "Dossier en analyse", description: "Suivre l’étude d’un besoin voyage", route: "/espace/demandes/DEM-2026-00118" },
      { id: "scenario-3", number: 3, title: "Trois propositions", description: "Comparer les offres du courtier", route: "/espace/demandes/DEM-2026-00145/propositions" },
      { id: "scenario-4", number: 4, title: "Documents à compléter", description: "Remplacer une carte grise", route: "/espace/documents?scenario=correction" },
      { id: "scenario-5", number: 5, title: "Paiement à effectuer", description: "Simuler un paiement à distance", route: "/espace/paiements?scenario=pending" },
      { id: "scenario-6", number: 6, title: "Contrat en préparation", description: "Voir le traitement après paiement", route: "/espace/demandes/DEM-2026-00121" },
      { id: "scenario-7", number: 7, title: "Contrat actif", description: "Consulter police et garanties", route: "/espace/contrats/POL-2026-00325" },
      { id: "scenario-8", number: 8, title: "Renouvellement", description: "Choisir la suite du contrat", route: "/espace/renouvellements/POL-2026-00325" },
      { id: "scenario-9", number: 9, title: "Sinistre en traitement", description: "Suivre la transmission du dossier", route: "/espace/sinistres/SIN-2026-00018" },
    ],
  };
}
