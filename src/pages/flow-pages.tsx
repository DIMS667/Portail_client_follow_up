import { useState, type FormEvent } from "react";
import {
  ArrowLeft, Bike, Building2, Car, Check, CheckCircle2, ChevronLeft, ChevronRight,
  CircleAlert, FileText, HeartPulse, Home, LifeBuoy, Plane, ShieldCheck, Upload,
} from "lucide-react";
import { usePortal } from "../app/portal-context";
import { PageHeader, StatusBadge, Timeline } from "../components/portal-ui";
import {
  createClaim, createInsuranceRequest, formatDate, formatFcfa, requestRenewal, selectOffer,
} from "../services/portal-service";

const productChoices = [
  { id: "automobile", label: "Automobile", help: "Voiture personnelle ou professionnelle", icon: Car },
  { id: "moto", label: "Moto", help: "Deux-roues et scooters", icon: Bike },
  { id: "sante", label: "Santé", help: "Protection individuelle ou familiale", icon: HeartPulse },
  { id: "voyage", label: "Voyage", help: "Déplacements et séjours", icon: Plane },
  { id: "habitation", label: "Habitation", help: "Maison, appartement et biens", icon: Home },
  { id: "entreprise", label: "Entreprise", help: "Activité et responsabilité", icon: Building2 },
];

const stepNames = ["Vos informations", "Le véhicule", "La couverture", "Compléments", "Récapitulatif"];

export function NewRequestPage() {
  const { store, updateStore, navigate } = usePortal();
  const [product, setProduct] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [createdReference, setCreatedReference] = useState("");
  const [form, setForm] = useState({
    firstName: store.client.firstName, lastName: store.client.lastName, phone: store.client.phone, email: store.client.email, city: store.client.city,
    brand: "Toyota", model: "RAV4", year: "2022", registration: "LT 458 AA", value: "18000000", usage: "Personnel",
    coverage: "Je souhaite être conseillé", formerInsurer: "", desiredStartDate: "2026-10-12", comments: "",
  });
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const next = () => setStep((current) => Math.min(4, current + 1));
  const previous = () => setStep((current) => Math.max(0, current - 1));
  const submit = () => {
    const result = createInsuranceRequest(store, {
      vehicle: { brand: form.brand, model: form.model, year: form.year, registration: form.registration, value: Number(form.value), usage: form.usage },
      coverage: form.coverage, desiredStartDate: form.desiredStartDate, comments: form.comments,
    });
    updateStore(result.store); setCreatedReference(result.request.reference);
  };
  if (createdReference) return <RequestConfirmation reference={createdReference} onOpen={() => navigate(`/espace/demandes/${createdReference}`)} />;
  if (!product) return (
    <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate("/espace")}><ArrowLeft size={17} /> Retour à l’accueil</button><PageHeader eyebrow="Nouvelle demande" title="Quelle assurance recherchez-vous ?" description="Choisissez un besoin. Le parcours automobile est entièrement détaillé dans cette démonstration." /><div className="product-choice-grid">{productChoices.map(({ id, label, help, icon: Icon }) => <button type="button" key={id} onClick={() => setProduct(id)}><span><Icon size={28} /></span><div><strong>Assurance {label.toLowerCase()}</strong><small>{help}</small></div><ChevronRight size={19} /></button>)}</div></div>
  );
  if (product !== "automobile") return <GenericRequest product={productChoices.find((item) => item.id === product)!} onBack={() => setProduct(null)} onSubmit={() => { const result = createInsuranceRequest(store, { coverage: "Conseil demandé", comments: `Demande ${product}` }); updateStore(result.store); setCreatedReference(result.request.reference); }} />;
  return (
    <div className="page-stack request-flow-page"><button className="back-link" type="button" onClick={() => step === 0 ? setProduct(null) : previous()}><ArrowLeft size={17} /> {step === 0 ? "Changer d’assurance" : "Étape précédente"}</button><PageHeader eyebrow="Assurance automobile" title="Votre demande en quelques étapes" description="Vos informations sont enregistrées uniquement dans cette démonstration." />
      <ol className="stepper">{stepNames.map((name, index) => <li className={index < step ? "done" : index === step ? "active" : ""} key={name}><span>{index < step ? <Check size={15} /> : index + 1}</span><small>{name}</small></li>)}</ol>
      <section className="flow-card">
        {step === 0 && <><FlowHeading number="1" title="Informations personnelles" description="Vérifiez vos coordonnées avant de continuer." /><div className="form-grid"><Field label="Nom" value={form.lastName} onChange={(value) => update("lastName", value)} /><Field label="Prénom" value={form.firstName} onChange={(value) => update("firstName", value)} /><Field label="Téléphone" value={form.phone} onChange={(value) => update("phone", value)} type="tel" /><Field label="Email" value={form.email} onChange={(value) => update("email", value)} type="email" /><Field label="Ville" value={form.city} onChange={(value) => update("city", value)} /></div></>}
        {step === 1 && <><FlowHeading number="2" title="Informations sur le véhicule" description="Décrivez le véhicule que vous souhaitez assurer." /><div className="form-grid"><Field label="Marque" value={form.brand} onChange={(value) => update("brand", value)} /><Field label="Modèle" value={form.model} onChange={(value) => update("model", value)} /><Field label="Année" value={form.year} onChange={(value) => update("year", value)} /><Field label="Immatriculation" value={form.registration} onChange={(value) => update("registration", value)} /><Field label="Valeur estimée en FCFA" value={form.value} onChange={(value) => update("value", value)} type="number" /><label>Usage<select value={form.usage} onChange={(event) => update("usage", event.target.value)}><option>Personnel</option><option>Professionnel</option><option>Transport</option></select></label></div></>}
        {step === 2 && <><FlowHeading number="3" title="Couverture souhaitée" description="Votre courtier pourra vous conseiller avant toute décision." /><fieldset className="choice-list"><legend className="sr-only">Couverture souhaitée</legend>{["Responsabilité civile", "RC + Vol", "RC + Incendie", "Tous risques", "Je souhaite être conseillé"].map((choice) => <label className={form.coverage === choice ? "selected" : ""} key={choice}><input type="radio" name="coverage" checked={form.coverage === choice} onChange={() => update("coverage", choice)} /><span><ShieldCheck size={20} /></span><strong>{choice}</strong>{form.coverage === choice && <CheckCircle2 size={19} />}</label>)}</fieldset></>}
        {step === 3 && <><FlowHeading number="4" title="Informations complémentaires" description="Précisez la date souhaitée et les informations utiles à votre courtier." /><div className="form-grid"><Field label="Ancien assureur" value={form.formerInsurer} onChange={(value) => update("formerInsurer", value)} placeholder="Facultatif" /><Field label="Date souhaitée de prise d’effet" value={form.desiredStartDate} onChange={(value) => update("desiredStartDate", value)} type="date" /><label className="full-span">Commentaires<textarea rows={5} value={form.comments} onChange={(event) => update("comments", event.target.value)} placeholder="Ajoutez toute précision utile…" /></label></div></>}
        {step === 4 && <><FlowHeading number="5" title="Récapitulatif" description="Relisez votre demande avant de la transmettre au courtier." /><div className="summary-sections"><SummarySection title="Vous" items={[["Nom", `${form.firstName} ${form.lastName}`], ["Téléphone", form.phone], ["Email", form.email], ["Ville", form.city]]} /><SummarySection title="Votre véhicule" items={[["Véhicule", `${form.brand} ${form.model}`], ["Année", form.year], ["Immatriculation", form.registration], ["Valeur", formatFcfa(Number(form.value))], ["Usage", form.usage]]} /><SummarySection title="Votre besoin" items={[["Couverture", form.coverage], ["Prise d’effet", formatDate(form.desiredStartDate)], ["Ancien assureur", form.formerInsurer || "Non renseigné"]]} /></div><div className="form-alert info"><CircleAlert size={18} /> L’envoi crée une demande fictive. Aucun assureur ne sera contacté.</div></>}
        <div className="flow-actions">{step > 0 && <button className="button button-secondary" type="button" onClick={previous}><ChevronLeft size={18} /> Précédent</button>}<button className="button button-primary" type="button" onClick={step === 4 ? submit : next}>{step === 4 ? "Envoyer ma demande" : "Continuer"}{step < 4 && <ChevronRight size={18} />}</button></div>
      </section>
    </div>
  );
}

function GenericRequest({ product, onBack, onSubmit }: { product: (typeof productChoices)[number]; onBack: () => void; onSubmit: () => void }) {
  const Icon = product.icon;
  return <div className="page-stack"><button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> Changer d’assurance</button><PageHeader eyebrow="Nouvelle demande" title={`Assurance ${product.label.toLowerCase()}`} description="Parcours simplifié de démonstration : votre courtier précisera ensuite votre besoin." /><section className="flow-card generic-request"><span className="generic-product-icon"><Icon size={32} /></span><h2>Parlez-nous de votre projet</h2><p>Indiquez une date souhaitée et un commentaire. Votre courtier vous recontactera pour compléter l’analyse.</p><div className="form-grid"><label>Date souhaitée<input type="date" defaultValue="2026-10-15" /></label><label className="full-span">Votre besoin<textarea rows={6} placeholder="Décrivez brièvement votre situation…" /></label></div><div className="flow-actions"><button className="button button-primary" type="button" onClick={onSubmit}>Envoyer ma demande</button></div></section></div>;
}

function RequestConfirmation({ reference, onOpen }: { reference: string; onOpen: () => void }) {
  return <div className="confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={38} /></span><span className="page-eyebrow">Demande transmise</span><h1>Votre demande a bien été enregistrée.</h1><p>Votre courtier va analyser votre besoin et préparer les propositions adaptées.</p><div className="confirmation-reference"><small>Référence de votre dossier</small><strong>{reference}</strong><span>Assurance automobile · Nouvelle demande</span></div><Timeline items={[{ label: "Demande envoyée", done: true }, { label: "Analyse du besoin", done: false, active: true }, { label: "Préparation des propositions", done: false }, { label: "Propositions disponibles", done: false }, { label: "Choix de l’offre", done: false }, { label: "Documents", done: false }, { label: "Paiement", done: false }, { label: "Police disponible", done: false }]} /><button className="button button-primary" type="button" onClick={onOpen}>Voir le suivi de ma demande</button></div>;
}

export function OfferDetailPage({ offerId }: { offerId: string }) {
  const { store, updateStore, navigate, query } = usePortal();
  const offer = store.offers.find((item) => item.id === offerId);
  const proposal = store.proposals.find((item) => item.id === offer?.proposalId);
  const request = store.requests.find((item) => item.id === proposal?.requestId);
  const [accepted, setAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  if (!offer || !proposal || !request) return null;
  const recommended = proposal.recommendedOfferId === offer.id;
  const confirm = () => { if (!accepted) return; updateStore(selectOffer(store, request.reference, offer.id)); setConfirmed(true); };
  if (confirmed) return <div className="confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={38} /></span><span className="page-eyebrow">Choix enregistré</span><h1>Votre offre a été sélectionnée.</h1><p>Vous pouvez maintenant transmettre les documents nécessaires à la finalisation du dossier.</p><div className="confirmation-reference"><small>Offre retenue</small><strong>{offer.provider} · {formatFcfa(offer.premium)}</strong><span>{offer.product}</span></div><button className="button button-primary" type="button" onClick={() => navigate("/espace/documents")}>Continuer vers les documents</button></div>;
  return <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate(`/espace/demandes/${request.reference}/propositions`)}><ArrowLeft size={17} /> Retour aux propositions</button><PageHeader eyebrow={offer.reference} title={offer.product} description={`${offer.provider} · assurance automobile`} action={recommended ? <StatusBadge status="proposals_available">Recommandée par votre courtier</StatusBadge> : undefined} /><section className="offer-detail-hero"><div><span>Prime annuelle</span><strong>{formatFcfa(offer.premium)}</strong><small>{offer.duration}</small></div><div><span>Franchise</span><strong>{formatFcfa(offer.deductible)}</strong><small>selon les conditions</small></div><div><span>Date d’effet</span><strong>{formatDate(offer.effectiveDate)}</strong><small>durée de 12 mois</small></div></section>{recommended && <section className="broker-advice compact"><span className="large-avatar">{store.advisor.initials}</span><div><span>Conseil de votre courtier</span><p>{proposal.advice}</p></div></section>}<div className="offer-detail-grid"><section className="panel"><h2>Garanties incluses</h2><ul className="guarantee-list large">{offer.guarantees.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul></section><section className="panel"><h2>Garanties optionnelles</h2><ul className="guarantee-list large muted">{offer.options.map((item) => <li key={item}><PlusMark /> {item}</li>)}</ul></section><section className="panel"><h2>Exclusions principales</h2><ul className="plain-list">{offer.exclusions.map((item) => <li key={item}><CircleAlert size={16} /> {item}</li>)}</ul></section><section className="panel"><h2>Documents nécessaires</h2><ul className="plain-list">{offer.requiredDocuments.map((item) => <li key={item}><FileText size={16} /> {item}</li>)}</ul></section></div><section className={`acceptance-card ${query.get("choisir") ? "highlight" : ""}`}><div><span className="page-eyebrow">Confirmation</span><h2>Choisir cette proposition</h2><p>Vous pourrez encore échanger avec votre courtier avant le paiement simulé.</p></div><label className="check-row"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>Je confirme avoir pris connaissance des informations relatives à cette proposition.</span></label><button className="button button-primary" type="button" disabled={!accepted} onClick={confirm}>Confirmer mon choix</button></section></div>;
}

export function RenewalPage({ policyNumber }: { policyNumber: string }) {
  const { store, updateStore, navigate } = usePortal();
  const contract = store.contracts.find((item) => item.policyNumber === policyNumber);
  const renewal = store.renewals.find((item) => item.contractId === policyNumber);
  const [choice, setChoice] = useState<"same" | "change" | "new_offers">(renewal?.choice || "same");
  const [submitted, setSubmitted] = useState(renewal?.status === "requested");
  if (!contract || !renewal) return null;
  const submit = () => { updateStore(requestRenewal(store, policyNumber, choice)); setSubmitted(true); };
  if (submitted) return <div className="confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={38} /></span><span className="page-eyebrow">Renouvellement</span><h1>Votre demande de renouvellement a bien été enregistrée.</h1><p>Votre courtier reviendra vers vous avec la prochaine étape.</p><button className="button button-primary" type="button" onClick={() => navigate(`/espace/contrats/${policyNumber}`)}>Retour au contrat</button></div>;
  return <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate(`/espace/contrats/${policyNumber}`)}><ArrowLeft size={17} /> Retour au contrat</button><PageHeader eyebrow="Échéance dans 30 jours" title="Renouveler mon assurance automobile" description={`${policyNumber} · expiration le ${formatDate(contract.expirationDate)}`} /><section className="renewal-summary"><span><RefreshIcon /></span><div><small>Prime actuelle</small><strong>{formatFcfa(contract.premium)}</strong><p>{contract.provider} · {contract.guarantees.length} garanties</p></div></section><section className="flow-card"><FlowHeading number="1" title="Comment souhaitez-vous continuer ?" description="Votre courtier analysera votre choix avant de finaliser le renouvellement." /><fieldset className="choice-list renewal-choices"><legend className="sr-only">Choix de renouvellement</legend>{[
    { id: "same", title: "Conserver les mêmes garanties", help: "Renouveler sur une base identique" }, { id: "change", title: "Modifier mes garanties", help: "Adapter le niveau de protection" }, { id: "new_offers", title: "Recevoir de nouvelles propositions", help: "Comparer de nouvelles solutions" },
  ].map((item) => <label className={choice === item.id ? "selected" : ""} key={item.id}><input type="radio" name="renewal" checked={choice === item.id} onChange={() => setChoice(item.id as typeof choice)} /><span><ShieldCheck size={20} /></span><div><strong>{item.title}</strong><small>{item.help}</small></div>{choice === item.id && <CheckCircle2 size={19} />}</label>)}</fieldset><div className="flow-actions"><button className="button button-secondary" type="button" onClick={() => navigate("/espace/messagerie")}>Contacter mon courtier</button><button className="button button-primary" type="button" onClick={submit}>Valider mon choix</button></div></section></div>;
}

export function NewClaimPage() {
  const { store, updateStore, navigate } = usePortal();
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState("");
  const [form, setForm] = useState({ contractId: store.contracts[0].policyNumber, type: "Accident", date: "2026-10-01", location: "Douala", description: "", files: [] as string[] });
  const names = ["Contrat", "Type", "Date et lieu", "Description", "Documents", "Récapitulatif"];
  const update = (key: string, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => { const result = createClaim(store, { contractId: form.contractId, type: form.type, date: form.date, location: form.location, description: form.description || "Description fournie dans la démonstration." }); updateStore(result.store); setCreated(result.claim.reference); };
  if (created) return <div className="confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={38} /></span><span className="page-eyebrow">Déclaration transmise</span><h1>Votre déclaration a bien été enregistrée.</h1><p>Votre courtier analysera le dossier et vous informera de chaque évolution.</p><div className="confirmation-reference"><small>Référence du sinistre</small><strong>{created}</strong><span>{form.type} · {form.contractId}</span></div><button className="button button-primary" type="button" onClick={() => navigate(`/espace/sinistres/${created}`)}>Suivre mon sinistre</button></div>;
  return <div className="page-stack request-flow-page"><button className="back-link" type="button" onClick={() => step === 0 ? navigate("/espace/sinistres") : setStep(step - 1)}><ArrowLeft size={17} /> {step === 0 ? "Retour aux sinistres" : "Étape précédente"}</button><PageHeader eyebrow="Nouvelle déclaration" title="Déclarer un sinistre" description="Transmettez les premières informations. Votre courtier vous accompagnera ensuite." /><ol className="stepper six">{names.map((name, index) => <li className={index < step ? "done" : index === step ? "active" : ""} key={name}><span>{index < step ? <Check size={15} /> : index + 1}</span><small>{name}</small></li>)}</ol><section className="flow-card">
    {step === 0 && <><FlowHeading number="1" title="Choisir le contrat" description="Sélectionnez le contrat concerné par l’événement." /><fieldset className="choice-list"><legend className="sr-only">Contrat</legend>{store.contracts.map((contract) => <label className={form.contractId === contract.policyNumber ? "selected" : ""} key={contract.id}><input type="radio" checked={form.contractId === contract.policyNumber} onChange={() => update("contractId", contract.policyNumber)} /><span>{contract.product === "automobile" ? <Car size={20} /> : <Home size={20} />}</span><div><strong>{contract.productLabel}</strong><small>{contract.policyNumber} · {contract.provider}</small></div>{form.contractId === contract.policyNumber && <CheckCircle2 size={19} />}</label>)}</fieldset></>}
    {step === 1 && <><FlowHeading number="2" title="Type de sinistre" description="Choisissez la situation qui correspond le mieux." /><fieldset className="choice-grid"><legend className="sr-only">Type de sinistre</legend>{["Accident", "Vol", "Incendie", "Bris de glace", "Dégât des eaux", "Autre"].map((type) => <label className={form.type === type ? "selected" : ""} key={type}><input type="radio" checked={form.type === type} onChange={() => update("type", type)} /><LifeBuoy size={21} /><strong>{type}</strong></label>)}</fieldset></>}
    {step === 2 && <><FlowHeading number="3" title="Date et lieu" description="Indiquez quand et où l’événement s’est produit." /><div className="form-grid"><Field label="Date du sinistre" value={form.date} onChange={(value) => update("date", value)} type="date" /><Field label="Lieu" value={form.location} onChange={(value) => update("location", value)} /></div></>}
    {step === 3 && <><FlowHeading number="4" title="Description" description="Décrivez les circonstances aussi clairement que possible." /><label>Description de l’événement<textarea rows={7} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Que s’est-il passé ? Quels dommages avez-vous constatés ?" /></label></>}
    {step === 4 && <><FlowHeading number="5" title="Photos et documents" description="Les fichiers ne seront pas réellement stockés dans cette démonstration." /><label className="drop-zone"><Upload size={28} /><strong>Sélectionner des fichiers</strong><span>Photos, constat ou justificatifs — métadonnées uniquement</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => update("files", Array.from(event.target.files || []).map((file) => file.name))} /></label>{form.files.length > 0 && <ul className="selected-files">{form.files.map((file) => <li key={file}><FileText size={16} /> {file}</li>)}</ul>}</>}
    {step === 5 && <><FlowHeading number="6" title="Récapitulatif" description="Vérifiez les informations avant d’envoyer votre déclaration." /><div className="summary-sections"><SummarySection title="Sinistre" items={[["Contrat", form.contractId], ["Type", form.type], ["Date", formatDate(form.date)], ["Lieu", form.location]]} /><SummarySection title="Informations" items={[["Description", form.description || "Non renseignée"], ["Documents", form.files.length ? `${form.files.length} fichier(s)` : "Aucun fichier"]]} /></div><div className="form-alert info"><CircleAlert size={18} /> Cette déclaration est fictive et ne sera transmise à aucune compagnie.</div></>}
    <div className="flow-actions">{step > 0 && <button className="button button-secondary" type="button" onClick={() => setStep(step - 1)}><ChevronLeft size={18} /> Précédent</button>}<button className="button button-primary" type="button" onClick={() => step === 5 ? submit() : setStep(step + 1)}>{step === 5 ? "Envoyer ma déclaration" : "Continuer"}{step < 5 && <ChevronRight size={18} />}</button></div>
  </section></div>;
}

function FlowHeading({ number, title, description }: { number: string; title: string; description: string }) { return <div className="flow-heading"><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></div>; }
function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <label>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required /></label>; }
function SummarySection({ title, items }: { title: string; items: string[][] }) { return <section><h3>{title}</h3>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>; }
function PlusMark() { return <span className="plus-mark">+</span>; }
function RefreshIcon() { return <ShieldCheck size={28} />; }
