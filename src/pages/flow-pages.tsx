import { useState, type FormEvent } from "react";
import {
  ArrowLeft, Bike, Building2, Car, Check, CheckCircle2, ChevronLeft, ChevronRight,
  CircleAlert, FileText, HeartPulse, Home, LifeBuoy, Plane, ShieldCheck, Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePortal } from "../app/portal-context";
import { PageHeader, StatusBadge, Timeline } from "../components/portal-ui";
import {
  insuranceProductForms,
  type InsuranceFormField,
  type NonAutomobileInsuranceProduct,
} from "../data/insurance-product-forms";
import {
  createClaim, createInsuranceRequest, formatDate, formatFcfa, requestRenewal, selectOffer,
} from "../services/portal-service";
import type { InsuranceProduct, InsuranceRequest } from "../types/domain";
import { AutoRequestForm } from "./auto-request-form";

interface ProductChoice { id: InsuranceProduct; label: string; help: string; image: string; icon: LucideIcon; }

const productChoices: ProductChoice[] = [
  { id: "automobile", label: "Automobile", help: "Voiture personnelle ou professionnelle", image: "/images/insurance-auto.webp", icon: Car },
  { id: "moto", label: "Moto", help: "Deux-roues et scooters", image: "/images/insurance-moto.webp", icon: Bike },
  { id: "sante", label: "Santé", help: "Protection individuelle ou familiale", image: "/images/insurance-health.webp", icon: HeartPulse },
  { id: "voyage", label: "Voyage", help: "Déplacements et séjours", image: "/images/insurance-travel.webp", icon: Plane },
  { id: "habitation", label: "Habitation", help: "Maison, appartement et biens", image: "/images/insurance-home.webp", icon: Home },
  { id: "entreprise", label: "Entreprise", help: "Activité et responsabilité", image: "/images/insurance-business.webp", icon: Building2 },
];

export function NewRequestPage() {
  const { store, updateStore, navigate } = usePortal();
  const [product, setProduct] = useState<InsuranceProduct | null>(null);
  const [createdReference, setCreatedReference] = useState("");
  const [createdProductLabel, setCreatedProductLabel] = useState("Assurance automobile");
  const submitRequest = (data: Partial<InsuranceRequest>) => {
    const result = createInsuranceRequest(store, data);
    updateStore(result.store);
    setCreatedProductLabel(result.request.productLabel);
    setCreatedReference(result.request.reference);
  };
  if (createdReference) return <RequestConfirmation reference={createdReference} productLabel={createdProductLabel} onOpen={() => navigate(`/espace/demandes/${createdReference}`)} />;
  if (!product) return (
    <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate("/espace")}><ArrowLeft size={17} /> Retour à l’accueil</button><PageHeader eyebrow="Nouvelle demande" title={"Quelle assurance recherchez\u2011vous\u00a0?"} description="Chaque assurance ouvre un formulaire adapté aux informations nécessaires à l’étude de votre dossier." /><div className="product-choice-grid">{productChoices.map(({ id, label, help, image, icon: Icon }) => <button type="button" key={id} onClick={() => setProduct(id)}><span className="product-choice-visual"><img src={image} alt="" loading="lazy" decoding="async" /><i><Icon size={22} /></i></span><span className="product-choice-copy"><span><strong>Assurance {label.toLowerCase()}</strong><small>{help}</small></span><ChevronRight size={19} /></span></button>)}</div></div>
  );
  if (product !== "automobile") return <ProductRequestForm product={productChoices.find((item) => item.id === product)!} onBack={() => setProduct(null)} onSubmit={submitRequest} />;
  return <AutoRequestForm onBack={() => setProduct(null)} onSubmit={submitRequest} />;
}

function ProductRequestForm({ product, onBack, onSubmit }: { product: ProductChoice; onBack: () => void; onSubmit: (data: Partial<InsuranceRequest>) => void }) {
  const config = insuranceProductForms[product.id as NonAutomobileInsuranceProduct];
  const fields = config.sections.flatMap((section) => section.fields);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.key, field.defaultValue])));
  const [coverage, setCoverage] = useState(config.coverageOptions.at(-1) ?? config.coverageOptions[0]);
  const [comments, setComments] = useState("");
  const Icon = product.icon;
  const updateValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const details = Object.fromEntries([
      ...fields.map((field) => [field.label, formatProductField(field, values[field.key])] as const),
      ["Couverture souhaitée", coverage] as const,
    ]);
    onSubmit({
      product: product.id,
      productLabel: `Assurance ${product.label.toLowerCase()}`,
      coverage,
      desiredStartDate: values[config.startDateKey],
      comments: comments.trim() || undefined,
      details,
    });
  };

  return <div className="page-stack product-request-page">
    <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> Changer d’assurance</button>
    <PageHeader eyebrow="Nouvelle demande" title={`Assurance ${product.label.toLowerCase()}`} description="Renseignez les informations essentielles pour permettre à votre courtier d’étudier votre dossier." />
    <form className="flow-card product-request" onSubmit={submit}>
      <header className="product-request-hero"><span className="generic-product-icon"><Icon size={30} /></span><div><span className="product-form-tag">Formulaire personnalisé</span><h2>{config.title}</h2><p>{config.intro}</p></div></header>
      {config.sections.map((section, sectionIndex) => <section className="product-form-section" key={section.title}>
        <div className="product-form-heading"><span>{sectionIndex + 1}</span><div><h3>{section.title}</h3>{section.description && <p>{section.description}</p>}</div></div>
        <div className="form-grid">{section.fields.map((field) => <label className={field.full ? "full-span" : undefined} key={field.key}>{field.label}{!field.required && <small className="field-optional">Facultatif</small>}{field.type === "select" ? <select value={values[field.key]} onChange={(event) => updateValue(field.key, event.target.value)} required={field.required}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type} value={values[field.key]} onChange={(event) => updateValue(field.key, event.target.value)} placeholder={field.placeholder} min={field.min} required={field.required} inputMode={field.type === "number" ? "numeric" : undefined} />}</label>)}</div>
      </section>)}
      <section className="product-form-section">
        <div className="product-form-heading"><span>{config.sections.length + 1}</span><div><h3>Protection recherchée</h3><p>Choisissez le niveau qui se rapproche le plus de votre besoin. Votre courtier pourra l’ajuster avec vous.</p></div></div>
        <fieldset className="coverage-choice-grid"><legend className="sr-only">Protection recherchée</legend>{config.coverageOptions.map((option) => <label className={coverage === option ? "selected" : ""} key={option}><input type="radio" name={`${product.id}-coverage`} value={option} checked={coverage === option} onChange={() => setCoverage(option)} /><span><ShieldCheck size={19} /></span><strong>{option}</strong>{coverage === option && <CheckCircle2 size={18} />}</label>)}</fieldset>
      </section>
      <section className="product-form-section product-form-comments">
        <div><h3>Précisions complémentaires <small>Facultatif</small></h3><p>Ajoutez uniquement une information qui n’apparaît pas déjà dans le formulaire.</p></div>
        <label className="sr-only" htmlFor={`${product.id}-comments`}>Précisions complémentaires</label><textarea id={`${product.id}-comments`} rows={4} value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Une contrainte, une échéance ou une information utile…" />
      </section>
      <div className="form-alert info"><CircleAlert size={18} /> Cette demande est fictive et ne sera transmise à aucune compagnie d’assurance.</div>
      <div className="flow-actions"><button className="button button-secondary" type="button" onClick={onBack}>Changer d’assurance</button><button className="button button-primary" type="submit">Envoyer ma demande <ChevronRight size={18} /></button></div>
    </form>
  </div>;
}

function formatProductField(field: InsuranceFormField, value: string) {
  if (!value) return "Non renseigné";
  if (field.format === "fcfa") return formatFcfa(Number(value));
  if (field.format === "date") return formatDate(value);
  return value;
}

function RequestConfirmation({ reference, productLabel, onOpen }: { reference: string; productLabel: string; onOpen: () => void }) {
  const isAutomobile = reference.startsWith("DEM-AUTO-");
  const timeline = isAutomobile
    ? [{ label: "Demande envoyée", done: true }, { label: "Analyse par le courtier", done: false, active: true }, { label: "Préparation des propositions", done: false }, { label: "Propositions disponibles", done: false }, { label: "Choix de l’offre", done: false }, { label: "Documents", done: false }, { label: "Paiement", done: false }, { label: "Contrat disponible", done: false }]
    : [{ label: "Demande envoyée", done: true }, { label: "Analyse du besoin", done: false, active: true }, { label: "Préparation des propositions", done: false }, { label: "Propositions disponibles", done: false }, { label: "Choix de l’offre", done: false }, { label: "Documents", done: false }, { label: "Paiement", done: false }, { label: "Police disponible", done: false }];
  return <div className="confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={38} /></span><span className="page-eyebrow">Demande transmise</span><h1>{isAutomobile ? "Votre demande a bien été transmise." : "Votre demande a bien été enregistrée."}</h1><p>{isAutomobile ? "Votre courtier va analyser les informations transmises et préparer les propositions adaptées à votre besoin." : "Votre courtier va analyser votre besoin et préparer les propositions adaptées."}</p><div className="confirmation-reference"><small>Référence de votre dossier</small><strong>{reference}</strong><span>{productLabel} · Nouvelle demande</span></div>{isAutomobile && <p className="confirmation-follow-up">Vous pourrez suivre l’évolution de votre demande depuis votre espace client.</p>}<Timeline items={timeline} /><button className="button button-primary" type="button" onClick={onOpen}>{isAutomobile ? "Suivre ma demande" : "Voir le suivi de ma demande"}</button></div>;
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
