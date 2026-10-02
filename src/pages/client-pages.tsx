import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft, Bell, Building2, CalendarDays, Car, Check, CheckCircle2, ChevronRight,
  CircleAlert, ClipboardList, Clock3, Download, FileCheck2, FileText, Filter, FolderOpen,
  HandCoins, HeartHandshake, Home, LifeBuoy, Mail, MapPin, MessageCircle, Paperclip,
  Phone, Plus, RefreshCcw, Search, Send, ShieldCheck, Smartphone, Upload, UserRound,
  WalletCards, XCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortal } from "../app/portal-context";
import { InfoCard, LinkButton, PageHeader, StatusBadge, Timeline, documentLabels, requestLabels } from "../components/portal-ui";
import {
  addMessage, formatDate, formatFcfa, markNotificationRead, replaceDocument,
  simulatePayment, updateProfile,
} from "../services/portal-service";
import type { ClientDocument, PaymentMethod, PortalStore } from "../types/domain";

const iconForKind: Record<string, typeof Bell> = { proposal: ClipboardList, document: FileCheck2, payment: WalletCards, contract: ShieldCheck, request: FileText, renewal: RefreshCcw, claim: LifeBuoy, message: MessageCircle };
const paymentLabels: Record<PaymentMethod, string> = { mobile_money: "Mobile Money", orange_money: "Orange Money", bank_card: "Carte bancaire", bank_transfer: "Virement" };

export function DashboardPage() {
  const { store, navigate } = usePortal();
  const openRequests = store.requests.filter((request) => request.scope === "core" && request.status !== "completed").length;
  const activeContracts = store.contracts.filter((contract) => contract.status === "active").length;
  const activeClaims = store.claims.filter((claim) => claim.scope === "core" && claim.status !== "closed").length;
  return (
    <div className="page-stack dashboard-page">
      <section className="welcome-strip">
        <div><span className="page-eyebrow">Votre espace personnel</span><h1>Bonjour {store.client.firstName}</h1><p>Voici l’essentiel de vos assurances et les prochaines actions à réaliser.</p></div>
        <LinkButton to="/espace/demandes/nouvelle">Demander une assurance <Plus size={18} /></LinkButton>
      </section>

      <section className="stats-grid" aria-label="Résumé de votre espace">
        <InfoCard icon={ShieldCheck} label="Mes assurances" value={`${activeContracts} contrats actifs`} onClick={() => navigate("/espace/contrats")} />
        <InfoCard icon={ClipboardList} label="Mes demandes" value={`${openRequests} dossiers en cours`} onClick={() => navigate("/espace/demandes")} />
        <InfoCard icon={FolderOpen} label="Mes documents" value={`${store.documents.length} documents`} onClick={() => navigate("/espace/documents")} />
        <InfoCard icon={WalletCards} label="Mes paiements" value={`${store.payments.length} paiements`} onClick={() => navigate("/espace/paiements")} />
        <InfoCard icon={LifeBuoy} label="Mes sinistres" value={`${activeClaims} dossier en cours`} onClick={() => navigate("/espace/sinistres")} />
      </section>

      <div className="dashboard-grid">
        <section className="panel quick-panel"><div className="panel-heading"><div><span className="page-eyebrow">À portée de main</span><h2>Actions rapides</h2></div></div>
          <div className="quick-grid">
            {[
              { label: "Demander une assurance", help: "Démarrer un nouveau dossier", icon: Plus, route: "/espace/demandes/nouvelle" },
              { label: "Envoyer un document", help: "Compléter un dossier", icon: Upload, route: "/espace/documents" },
              { label: "Déclarer un sinistre", help: "Être accompagné rapidement", icon: LifeBuoy, route: "/espace/sinistres/nouveau" },
              { label: "Renouveler un contrat", help: "Anticiper une échéance", icon: RefreshCcw, route: "/espace/renouvellements/POL-2026-00325" },
            ].map(({ label, help, icon: Icon, route }) => <button type="button" className="quick-action" key={label} onClick={() => navigate(route)}><span><Icon size={20} /></span><div><strong>{label}</strong><small>{help}</small></div><ChevronRight size={18} /></button>)}
          </div>
        </section>
        <section className="panel activity-panel"><div className="panel-heading"><div><span className="page-eyebrow">Dernières nouvelles</span><h2>Activité récente</h2></div></div>
          <div className="activity-list">{store.activities.map((activity) => { const Icon = iconForKind[activity.kind] || Bell; return <button type="button" key={activity.id} onClick={() => navigate(activity.route)}><span className={`activity-icon ${activity.kind}`}><Icon size={18} /></span><div><strong>{activity.label}</strong><small>{activity.date}</small></div></button>; })}</div>
        </section>
      </div>

      <section className="panel scenarios-panel"><div className="panel-heading"><div><span className="page-eyebrow">Mode démonstration</span><h2>Explorer les 9 scénarios</h2><p>Passez directement à une situation pour présenter le parcours au Directeur Général.</p></div><span className="demo-chip">Données fictives</span></div>
        <div className="scenario-grid">{store.scenarios.map((scenario) => <button type="button" key={scenario.id} onClick={() => navigate(scenario.route)}><span>{scenario.number}</span><div><strong>{scenario.title}</strong><small>{scenario.description}</small></div><ChevronRight size={17} /></button>)}</div>
      </section>
    </div>
  );
}

export function RequestsPage() {
  const { store, navigate } = usePortal();
  const requests = store.requests.filter((request) => request.scope === "core");
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Mes dossiers" title="Mes demandes" description="Suivez l’avancement de chaque demande transmise à votre courtier." action={<LinkButton to="/espace/demandes/nouvelle"><Plus size={18} /> Nouvelle demande</LinkButton>} />
      <div className="list-toolbar"><div className="search-box"><Search size={18} /><input aria-label="Rechercher une demande" placeholder="Rechercher par référence ou produit" /></div><button type="button" className="filter-button"><Filter size={17} /> Tous les statuts</button></div>
      <div className="request-list">
        {requests.map((request) => <button type="button" className="request-card" key={request.id} onClick={() => navigate(`/espace/demandes/${request.reference}`)}><span className="product-icon">{request.product === "automobile" ? <Car size={22} /> : request.product === "habitation" ? <Home size={22} /> : <HeartHandshake size={22} />}</span><div className="request-main"><span className="reference">{request.reference}</span><strong>{request.productLabel}</strong><small>Créée le {formatDate(request.date)}</small></div><StatusBadge status={request.status} /><ChevronRight size={19} /></button>)}
      </div>
    </div>
  );
}

export function RequestDetailPage({ reference }: { reference: string }) {
  const { store, navigate } = usePortal();
  const request = store.requests.find((item) => item.reference === reference);
  if (!request) return <NotFoundPage />;
  const proposalAvailable = request.status === "proposals_available";
  return (
    <div className="page-stack">
      <button className="back-link" type="button" onClick={() => navigate("/espace/demandes")}><ArrowLeft size={17} /> Retour aux demandes</button>
      <PageHeader eyebrow={request.reference} title={request.productLabel} description={`Demande transmise le ${formatDate(request.date)}`} action={<StatusBadge status={request.status} />} />
      {proposalAvailable && <section className="attention-card blue"><span><ClipboardList size={23} /></span><div><strong>3 propositions sont disponibles</strong><p>Votre courtier a comparé plusieurs solutions pour votre assurance automobile.</p></div><LinkButton to={`/espace/demandes/${reference}/propositions`}>Consulter les propositions</LinkButton></section>}
      {request.status === "policy_issuing" && <section className="attention-card success"><span><CheckCircle2 size={23} /></span><div><strong>Paiement reçu. Votre contrat est en cours de finalisation.</strong><p>Vous serez informé dès que la police sera disponible.</p></div></section>}
      <div className="detail-grid">
        <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Progression</span><h2>Suivi du dossier</h2></div></div><Timeline items={request.timeline} /></section>
        <aside className="panel advisor-card"><span className="page-eyebrow">Votre conseiller</span><span className="large-avatar">{store.advisor.initials}</span><h2>{store.advisor.name}</h2><p>Votre interlocutrice pour ce dossier.</p><a href={`tel:${store.advisor.phone}`}><Phone size={17} /> {store.advisor.phone}</a><a href={`mailto:${store.advisor.email}`}><Mail size={17} /> {store.advisor.email}</a><LinkButton to="/espace/messagerie" variant="secondary"><MessageCircle size={17} /> Envoyer un message</LinkButton></aside>
      </div>
      {request.vehicle && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Informations fournies</span><h2>Véhicule et couverture</h2></div></div><div className="details-grid"><Detail label="Véhicule" value={`${request.vehicle.brand} ${request.vehicle.model}`} /><Detail label="Année" value={request.vehicle.year} /><Detail label="Immatriculation" value={request.vehicle.registration} /><Detail label="Usage" value={request.vehicle.usage} /><Detail label="Valeur estimée" value={formatFcfa(request.vehicle.value)} /><Detail label="Couverture" value={request.coverage || "Conseil demandé"} /></div></section>}
    </div>
  );
}

export function ProposalsPage({ requestReference }: { requestReference: string }) {
  const { store, navigate } = usePortal();
  const request = store.requests.find((item) => item.reference === requestReference);
  const proposal = store.proposals.find((item) => item.id === request?.proposalId);
  if (!request || !proposal) return <NotFoundPage />;
  const offers = store.offers.filter((offer) => proposal.offerIds.includes(offer.id));
  return (
    <div className="page-stack">
      <button className="back-link" type="button" onClick={() => navigate(`/espace/demandes/${requestReference}`)}><ArrowLeft size={17} /> Retour au dossier</button>
      <PageHeader eyebrow={proposal.reference} title="Comparez vos propositions" description="Trois solutions sélectionnées par votre courtier selon votre besoin automobile." />
      <section className="broker-advice"><span className="large-avatar">{store.advisor.initials}</span><div><span>Conseil de votre courtier</span><h2>Notre recommandation</h2><p>{proposal.advice}</p></div></section>
      <div className="offers-grid">{offers.map((offer) => { const recommended = offer.id === proposal.recommendedOfferId; return <article className={`offer-card ${recommended ? "recommended" : ""}`} key={offer.id}>{recommended && <div className="recommended-ribbon"><CheckCircle2 size={16} /> Recommandée par votre courtier</div>}<div className="offer-provider"><span>{offer.provider.slice(-1)}</span><div><small>Proposition</small><strong>{offer.provider}</strong></div></div><div className="offer-price"><strong>{formatFcfa(offer.premium)}</strong><span>/ an</span></div><div className="offer-meta"><span>Franchise <strong>{formatFcfa(offer.deductible)}</strong></span><span>Durée <strong>{offer.duration}</strong></span></div><ul className="guarantee-list">{offer.guarantees.map((guarantee) => <li key={guarantee}><Check size={16} /> {guarantee}</li>)}</ul><div className="offer-actions"><button type="button" className="button button-secondary" onClick={() => navigate(`/espace/offres/${offer.id}`)}>Voir les détails</button><button type="button" className="button button-primary" onClick={() => navigate(`/espace/offres/${offer.id}?choisir=1`)}>Choisir cette offre</button></div></article>; })}</div>
      <p className="simulation-note"><CircleAlert size={16} /> Ces propositions sont entièrement fictives et servent uniquement à la démonstration.</p>
    </div>
  );
}

export function DocumentsPage() {
  const { store, updateStore } = usePortal();
  const [filter, setFilter] = useState("Tous");
  const categories = ["Tous", "Identité", "Véhicules", "Polices", "Attestations", "Factures", "Reçus", "Sinistres"];
  const documents = filter === "Tous" ? store.documents : store.documents.filter((document) => document.category === filter);
  const handleFile = (document: ClientDocument, file?: File) => { if (file) updateStore(replaceDocument(store, document.id, file)); };
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Bibliothèque documentaire" title="Mes documents" description="Retrouvez les pièces transmises, les contrats et les reçus de votre espace." />
      <div className="filter-tabs" role="tablist" aria-label="Catégories de documents">{categories.map((category) => <button type="button" role="tab" aria-selected={filter === category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)} key={category}>{category}</button>)}</div>
      <div className="documents-grid">{documents.map((document) => <article className={`document-card ${document.status}`} key={document.id}><div className="document-top"><span className="document-icon"><FileText size={22} /></span><StatusBadge status={document.status}>{documentLabels[document.status]}</StatusBadge></div><h3>{document.title}</h3><p>{document.fileName || "Aucun fichier transmis"}</p>{document.correctionMessage && <div className="correction-message"><CircleAlert size={17} /><span>{document.correctionMessage}</span></div>}<div className="document-footer">{document.downloadUrl ? <a className="button button-secondary" href={document.downloadUrl} download><Download size={17} /> Télécharger</a> : <label className="button button-secondary upload-label"><Upload size={17} /> {document.status === "correction_required" ? "Remplacer le document" : "Sélectionner un fichier"}<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => handleFile(document, event.target.files?.[0])} /></label>}</div></article>)}</div>
      <p className="simulation-note"><CircleAlert size={16} /> Seuls le nom, le type, la date et le statut du fichier sont mémorisés. Aucun contenu de fichier n’est stocké.</p>
    </div>
  );
}

export function PaymentsPage() {
  const { store, updateStore } = usePortal();
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [result, setResult] = useState<"success" | "failed" | null>(null);
  const pay = (success: boolean) => { updateStore(simulatePayment(store, success, method)); setResult(success ? "success" : "failed"); };
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Historique financier" title="Mes paiements" description="Consultez les règlements simulés associés à vos demandes et contrats." />
      <section className="payment-due-card"><span className="payment-due-icon"><HandCoins size={26} /></span><div><span className="page-eyebrow">Dossier prêt</span><h2>Votre dossier est prêt pour le paiement.</h2><p>Assurance automobile · Compagnie A</p></div><strong>{formatFcfa(105000)}</strong>
        <Dialog onOpenChange={(open) => { if (open) setResult(null); }}><DialogTrigger asChild><button className="button button-primary" type="button">Payer maintenant</button></DialogTrigger><DialogContent className="portal-dialog payment-dialog"><DialogHeader><DialogTitle>Simulation de paiement</DialogTitle><DialogDescription>Aucune transaction réelle ne sera effectuée.</DialogDescription></DialogHeader>{result ? <div className={`payment-result ${result}`}><span>{result === "success" ? <CheckCircle2 size={30} /> : <XCircle size={30} />}</span><h3>{result === "success" ? "Paiement effectué avec succès." : "Le paiement simulé a échoué."}</h3><p>{result === "success" ? "Référence PAY-2026-00046 · votre contrat est en préparation." : "Vous pouvez choisir un autre mode et réessayer."}</p></div> : <><div className="payment-summary"><span>Montant à régler</span><strong>{formatFcfa(105000)}</strong><small>Assurance automobile · Compagnie A</small></div><fieldset className="method-grid"><legend>Mode de paiement fictif</legend>{(Object.entries(paymentLabels) as [PaymentMethod, string][]).map(([value, label]) => <label className={method === value ? "selected" : ""} key={value}><input type="radio" name="paymentMethod" checked={method === value} onChange={() => setMethod(value)} /><Smartphone size={19} /><span>{label}</span></label>)}</fieldset><div className="dialog-actions stacked"><button className="button button-primary" type="button" onClick={() => pay(true)}>Simuler un paiement réussi</button><button className="button button-secondary" type="button" onClick={() => pay(false)}>Simuler un paiement échoué</button></div></>}</DialogContent></Dialog>
      </section>
      {result === "success" && <section className="post-payment"><Timeline items={[{ label: "Paiement confirmé", done: true }, { label: "Traitement du dossier", done: false, active: true }, { label: "Police disponible", done: false }]} /></section>}
      <section className="panel table-panel"><div className="panel-heading"><div><span className="page-eyebrow">Toutes les opérations</span><h2>Historique</h2></div></div><div className="responsive-table"><table><thead><tr><th>Référence</th><th>Contrat ou dossier</th><th>Montant</th><th>Date</th><th>Mode</th><th>Statut</th></tr></thead><tbody>{store.payments.map((payment) => <tr key={payment.id}><td><strong>{payment.reference}</strong></td><td>{payment.contractId || payment.requestId}</td><td>{formatFcfa(payment.amount)}</td><td>{formatDate(payment.date)}</td><td>{paymentLabels[payment.method]}</td><td><StatusBadge status={payment.status}>{payment.status === "succeeded" ? "Confirmé" : payment.status === "failed" ? "Échoué" : "En attente"}</StatusBadge></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

export function ContractsPage() {
  const { store, navigate } = usePortal();
  return <div className="page-stack"><PageHeader eyebrow="Vos protections" title="Mes assurances" description="Consultez vos contrats actifs, leurs garanties et leurs prochaines échéances." />
    <section className="renewal-alert"><span><CalendarDays size={22} /></span><div><strong>Votre assurance automobile arrive à échéance dans 30 jours.</strong><p>Anticipez son renouvellement depuis votre espace.</p></div><LinkButton to="/espace/renouvellements/POL-2026-00325" variant="secondary">Voir le renouvellement</LinkButton></section>
    <div className="contracts-grid">{store.contracts.map((contract) => <article className="contract-card" key={contract.id}><div className="contract-visual"><span>{contract.product === "automobile" ? <Car size={29} /> : <Home size={29} />}</span><StatusBadge status={contract.status}>{contract.status === "active" ? "Actif" : "En préparation"}</StatusBadge></div><span className="reference">{contract.policyNumber}</span><h2>{contract.productLabel}</h2><p>{contract.provider}</p><div className="contract-date"><CalendarDays size={18} /><div><small>Expiration</small><strong>{formatDate(contract.expirationDate)}</strong></div></div><div className="contract-actions"><button className="button button-primary" type="button" onClick={() => navigate(`/espace/contrats/${contract.policyNumber}`)}>Voir le contrat</button><button className="button button-secondary" type="button" onClick={() => navigate(`/espace/renouvellements/${contract.policyNumber}`)}>Renouveler</button></div></article>)}</div>
  </div>;
}

export function ContractDetailPage({ policyNumber }: { policyNumber: string }) {
  const { store, navigate } = usePortal();
  const contract = store.contracts.find((item) => item.policyNumber === policyNumber);
  if (!contract) return <NotFoundPage />;
  const documents = store.documents.filter((document) => contract.documentIds.includes(document.id));
  const payments = store.payments.filter((payment) => contract.paymentIds.includes(payment.id));
  const claims = store.claims.filter((claim) => contract.claimIds.includes(claim.id));
  return <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate("/espace/contrats")}><ArrowLeft size={17} /> Retour aux contrats</button><PageHeader eyebrow={contract.policyNumber} title={contract.productLabel} description={contract.provider} action={<StatusBadge status={contract.status}>Actif</StatusBadge>} />
    <section className="policy-hero"><div><span className="policy-icon"><ShieldCheck size={28} /></span><div><small>Votre police d’assurance est disponible.</small><h2>{contract.policyNumber}</h2></div></div><div className="policy-downloads">{documents.slice(0, 3).map((document) => <a className="button button-secondary" href={document.downloadUrl} download key={document.id}><Download size={17} /> {document.type}</a>)}</div></section>
    <Tabs defaultValue="resume" className="contract-tabs"><TabsList className="contract-tabs-list"><TabsTrigger value="resume">Résumé</TabsTrigger><TabsTrigger value="garanties">Garanties</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="paiements">Paiements</TabsTrigger><TabsTrigger value="sinistres">Sinistres</TabsTrigger></TabsList>
      <TabsContent value="resume"><section className="panel"><div className="details-grid"><Detail label="Numéro de police" value={contract.policyNumber} /><Detail label="Produit" value={contract.productLabel} /><Detail label="Compagnie" value={contract.provider} /><Detail label="Date d’effet" value={formatDate(contract.effectiveDate)} /><Detail label="Expiration" value={formatDate(contract.expirationDate)} /><Detail label="Prime annuelle" value={formatFcfa(contract.premium)} /></div></section></TabsContent>
      <TabsContent value="garanties"><section className="panel"><h2>Garanties incluses</h2><ul className="guarantee-list large">{contract.guarantees.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul></section></TabsContent>
      <TabsContent value="documents"><section className="panel mini-list">{documents.map((document) => <a href={document.downloadUrl} download key={document.id}><FileText size={20} /><div><strong>{document.title}</strong><small>{document.fileName || "Document de démonstration"}</small></div><Download size={18} /></a>)}</section></TabsContent>
      <TabsContent value="paiements"><section className="panel mini-list">{payments.map((payment) => <div key={payment.id}><WalletCards size={20} /><div><strong>{payment.reference}</strong><small>{formatDate(payment.date)}</small></div><strong>{formatFcfa(payment.amount)}</strong></div>)}</section></TabsContent>
      <TabsContent value="sinistres"><section className="panel mini-list">{claims.map((claim) => <button type="button" onClick={() => navigate(`/espace/sinistres/${claim.reference}`)} key={claim.id}><LifeBuoy size={20} /><div><strong>{claim.reference}</strong><small>{claim.type}</small></div><ChevronRight size={18} /></button>)}</section></TabsContent>
    </Tabs>
  </div>;
}

export function ClaimsPage() {
  const { store, navigate } = usePortal();
  return <div className="page-stack"><PageHeader eyebrow="Assistance et suivi" title="Mes sinistres" description="Déclarez un événement et suivez l’avancement de son traitement." action={<LinkButton to="/espace/sinistres/nouveau"><Plus size={18} /> Déclarer un sinistre</LinkButton>} /><div className="claim-list">{store.claims.filter((claim) => claim.scope === "core").map((claim) => <button type="button" onClick={() => navigate(`/espace/sinistres/${claim.reference}`)} className="claim-card" key={claim.id}><span className="claim-icon"><LifeBuoy size={22} /></span><div><span className="reference">{claim.reference}</span><strong>{claim.productLabel} · {claim.type}</strong><small>Déclaré le {formatDate(claim.date)}</small></div><StatusBadge status={claim.status}>{claim.status === "closed" ? "Clôturé" : "En traitement"}</StatusBadge><ChevronRight size={18} /></button>)}</div></div>;
}

export function ClaimDetailPage({ reference }: { reference: string }) {
  const { store, navigate } = usePortal();
  const claim = store.claims.find((item) => item.reference === reference);
  if (!claim) return <NotFoundPage />;
  return <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate("/espace/sinistres")}><ArrowLeft size={17} /> Retour aux sinistres</button><PageHeader eyebrow={claim.reference} title={`${claim.type} — ${claim.productLabel}`} description={`Déclaré le ${formatDate(claim.date)}`} action={<StatusBadge status={claim.status}>{claim.status === "closed" ? "Clôturé" : "En traitement"}</StatusBadge>} /><div className="detail-grid"><section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Progression</span><h2>Suivi du sinistre</h2></div></div><Timeline items={claim.timeline} /></section><aside className="panel"><span className="page-eyebrow">Détails</span><div className="stack-details"><Detail label="Contrat" value={claim.contractId} /><Detail label="Lieu" value={claim.location} /><Detail label="Description" value={claim.description} /></div></aside></div></div>;
}

export function MessagesPage() {
  const { store, updateStore } = usePortal();
  const [message, setMessage] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!message.trim()) return; updateStore(addMessage(store, message.trim())); setMessage(""); setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 20); };
  return <div className="page-stack"><PageHeader eyebrow="Conversation" title="Ma messagerie" description="Échangez directement avec votre courtier depuis votre espace." /><section className="message-layout"><div className="conversation"><div className="conversation-head"><span className="large-avatar">{store.advisor.initials}</span><div><strong>{store.advisor.name}</strong><small><span /> Disponible pour vous accompagner</small></div></div><div className="messages-scroll">{store.messages.map((item) => <div className={`message-bubble ${item.sender}`} key={item.id}><span>{item.body}</span><small>{new Date(item.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</small></div>)}<div ref={endRef} /></div><form className="message-compose" onSubmit={submit}><button type="button" aria-label="Joindre un document"><Paperclip size={19} /></button><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Écrivez votre message…" aria-label="Nouveau message" /><button type="submit" aria-label="Envoyer le message"><Send size={19} /></button></form></div><aside className="panel advisor-compact"><span className="large-avatar">{store.advisor.initials}</span><h2>{store.advisor.name}</h2><p>Conseillère clientèle</p><a href={`tel:${store.advisor.phone}`}><Phone size={17} /> {store.advisor.phone}</a><a href={`mailto:${store.advisor.email}`}><Mail size={17} /> {store.advisor.email}</a></aside></section></div>;
}

export function NotificationsPage() {
  const { store, updateStore, navigate } = usePortal();
  const open = (id: string, route: string) => { updateStore(markNotificationRead(store, id)); navigate(route); };
  return <div className="page-stack"><PageHeader eyebrow="Centre de notifications" title="Mes notifications" description="Retrouvez les mises à jour importantes de vos demandes et contrats." action={<button type="button" className="button button-secondary" onClick={() => updateStore({ ...store, notifications: store.notifications.map((item) => ({ ...item, read: true })) })}>Tout marquer comme lu</button>} /><div className="notifications-list">{store.notifications.map((notification) => { const Icon = iconForKind[notification.kind] || Bell; return <button type="button" className={notification.read ? "read" : "unread"} key={notification.id} onClick={() => open(notification.id, notification.route)}><span className={`notification-icon ${notification.kind}`}><Icon size={20} /></span><div><strong>{notification.title}</strong><p>{notification.body}</p><small>{new Date(notification.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</small></div>{!notification.read && <em>Nouveau</em>}<ChevronRight size={18} /></button>; })}</div></div>;
}

export function ProfilePage() {
  const { store, updateStore } = usePortal();
  const [draft, setDraft] = useState(store.client);
  const [saved, setSaved] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); updateStore(updateProfile(store, draft)); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return <div className="page-stack"><PageHeader eyebrow="Informations personnelles" title="Mon profil" description="Tenez vos coordonnées et vos préférences de notification à jour." /><form className="profile-layout" onSubmit={submit}><section className="panel"><div className="profile-identity"><span className="profile-avatar">JD</span><div><h2>Jean Dupont</h2><p>Client depuis 2026 · {store.client.id}</p></div></div>{saved && <div className="form-alert success" role="status"><CheckCircle2 size={17} /> Vos modifications ont été enregistrées.</div>}<div className="form-grid"><label>Prénom<input value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} /></label><label>Nom<input value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} /></label><label>Téléphone<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label><label>Email<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><label>Adresse<input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label><label>Ville<input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} /></label></div></section><aside className="panel preferences"><span className="page-eyebrow">Préférences</span><h2>Notifications</h2><p>Choisissez comment vous souhaitez être informé.</p>{([['email','Email'],['sms','SMS'],['whatsapp','WhatsApp'],['inApp','Notification application']] as const).map(([key, label]) => <label className="switch-row" key={key}><span>{label}</span><input type="checkbox" checked={draft.preferences[key]} onChange={(event) => setDraft({ ...draft, preferences: { ...draft.preferences, [key]: event.target.checked } })} /></label>)}<button className="button button-primary full" type="submit">Enregistrer les modifications</button></aside></form></div>;
}

export function HelpPage() {
  const { store, navigate } = usePortal();
  return <div className="page-stack"><PageHeader eyebrow="Nous sommes là" title="Besoin d’aide ?" description="Votre courtier reste disponible pour répondre à vos questions." /><section className="help-hero"><span className="large-avatar">{store.advisor.initials}</span><div><span className="page-eyebrow">Votre conseillère</span><h2>{store.advisor.name}</h2><p>Une question sur une offre, un document ou un sinistre ? Contactez votre interlocutrice dédiée.</p></div><div className="help-actions"><a className="button button-secondary" href={`tel:${store.advisor.phone}`}><Phone size={18} /> Appeler</a><button className="button button-primary" type="button" onClick={() => navigate("/espace/messagerie")}><MessageCircle size={18} /> Envoyer un message</button></div></section><div className="help-grid"><article className="panel"><Phone size={22} /><h3>Téléphone</h3><p>{store.advisor.phone}</p><small>Du lundi au vendredi, de 8h à 17h</small></article><article className="panel"><Mail size={22} /><h3>Email</h3><p>{store.advisor.email}</p><small>Adresse fictive de démonstration</small></article><article className="panel"><MapPin size={22} /><h3>À distance</h3><p>Toutes vos démarches en ligne</p><small>Aucun déplacement nécessaire</small></article></div></div>;
}

export function NotFoundPage() {
  return <div className="not-found"><span>404</span><h1>Cette page n’est pas disponible.</h1><p>Le contenu demandé n’existe pas dans cette démonstration.</p><LinkButton to="/espace">Retour à l’accueil</LinkButton></div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="detail-item"><small>{label}</small><strong>{value}</strong></div>; }
