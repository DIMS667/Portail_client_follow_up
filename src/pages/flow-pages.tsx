import { useState, type FormEvent } from "react";
import {
  ArrowLeft, Bike, Building2, Car, Check, CheckCircle2, ChevronLeft, ChevronRight,
  CircleAlert, CircleHelp, FileText, HeartPulse, Home, Landmark, MessageCircle, PiggyBank, Plane, Save, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { assetUrl } from "../app/base-path";
import { usePortal } from "../app/portal-context";
import { PageHeader, StatusBadge, Timeline } from "../components/portal-ui";
import {
  insuranceProductForms,
  type ConfiguredInsuranceProduct,
  type InsuranceFormField,
} from "../data/insurance-product-forms";
import { documentsForProduct } from "../data/document-folders";
import { formatDate, formatFcfa } from "../services/portal-service";
import { creerDemandeAutomobile } from "../services/automobile-request-api";
import { creerDemandeGenerale } from "../services/general-request-api";
import { selectionnerOffre } from "../services/subscription-api";
import type { AutomobileVehicleKind, InsuranceProduct, InsuranceRequest } from "../types/domain";
import { AutoRequestForm, VoiceTextarea } from "./auto-request-form";
import { CautionRequestForm } from "./caution-request-form";
import { HealthRequestForm } from "./health-request-form";
import { MotoRequestForm } from "./moto-request-form";

interface ProductChoice { id: InsuranceProduct; label: string; help: string; image: string; imageWidth: number; imageHeight: number; icon: LucideIcon; }

const productChoices: ProductChoice[] = [
  { id: "automobile", label: "Automobile", help: "Voiture, moto et véhicules à 2 ou 3 roues", image: assetUrl("/images/insurance-auto.webp"), imageWidth: 1200, imageHeight: 1800, icon: Car },
  { id: "sante", label: "Santé", help: "Protection individuelle ou familiale", image: assetUrl("/images/insurance-health.webp"), imageWidth: 1200, imageHeight: 800, icon: HeartPulse },
  { id: "vie_capitalisation", label: "Vie & capitalisation", help: "Protection, épargne et préparation de l’avenir", image: assetUrl("/images/public-role-advisor.webp"), imageWidth: 900, imageHeight: 601, icon: PiggyBank },
  { id: "voyage", label: "Voyage", help: "Déplacements et séjours", image: assetUrl("/images/insurance-travel.webp"), imageWidth: 1200, imageHeight: 1800, icon: Plane },
  { id: "habitation", label: "Habitation", help: "Maison, appartement et biens", image: assetUrl("/images/insurance-home.webp"), imageWidth: 1200, imageHeight: 675, icon: Home },
  { id: "entreprise", label: "Entreprise", help: "Activité et responsabilité", image: assetUrl("/images/insurance-business.webp"), imageWidth: 1200, imageHeight: 800, icon: Building2 },
  { id: "caution", label: "Caution", help: "Soumission, avance, retenue de garantie et bonne fin", image: assetUrl("/images/public-entrepreneur-640.webp"), imageWidth: 640, imageHeight: 427, icon: Landmark },
];

export function NewRequestPage() {
  const { store, updateStore, navigate } = usePortal();
  const [product, setProduct] = useState<InsuranceProduct | null>(null);
  const [vehicleKind, setVehicleKind] = useState<AutomobileVehicleKind | null>(null);
  const [preparationMode, setPreparationMode] = useState<"self" | "broker" | null>(null);
  const [createdReference, setCreatedReference] = useState("");
  const [createdProductLabel, setCreatedProductLabel] = useState("Assurance automobile");
  const [createdVehicleKind, setCreatedVehicleKind] = useState<AutomobileVehicleKind | undefined>();
  const submitRequest = async (data: Partial<InsuranceRequest>) => {
    const requestProduct = data.product ?? product ?? "automobile";
    const dataWithDocuments: Partial<InsuranceRequest> = {
      ...data,
      product: requestProduct,
      documents: documentsForProduct(store.documents, requestProduct),
    };
    const request = dataWithDocuments.product === "automobile"
      ? await creerDemandeAutomobile(dataWithDocuments)
      : await creerDemandeGenerale(dataWithDocuments);
    updateStore((current) => ({
      ...current,
      requests: [request, ...current.requests.filter((item) => item.reference !== request.reference)],
      notifications: [{
        id: `NOT-${Date.now()}`,
        title: "Demande transmise",
        body: `Votre demande ${request.reference} a bien été transmise.`,
        date: new Date().toISOString(),
        route: `/espace/demandes/${request.reference}`,
        read: false,
        kind: "request",
      }, ...current.notifications],
    }));
    setCreatedProductLabel(request.productLabel);
    setCreatedVehicleKind(request.vehicleKind);
    setCreatedReference(request.reference);
  };
  if (createdReference) return <RequestConfirmation reference={createdReference} productLabel={createdProductLabel} vehicleKind={createdVehicleKind} onOpen={() => navigate(`/espace/demandes/${createdReference}`)} />;
  if (!product) return (
    <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate("/espace")}><ArrowLeft size={17} /> Retour à l’accueil</button><PageHeader eyebrow="Nouvelle demande" title={"Quelle assurance recherchez\u2011vous\u00a0?"} description="Chaque assurance ouvre un formulaire adapté aux informations nécessaires à l’étude de votre dossier." /><div className="product-choice-grid">{productChoices.map(({ id, label, help, image, imageWidth, imageHeight, icon: Icon }) => <button type="button" key={id} onClick={() => { setProduct(id); setPreparationMode(null); setVehicleKind(null); }}><span className="product-choice-visual"><img src={image} alt="" width={imageWidth} height={imageHeight} loading="lazy" decoding="async" /><i><Icon size={22} /></i></span><span className="product-choice-copy"><span><strong>Assurance {label.toLowerCase()}</strong><small>{help}</small></span><ChevronRight size={19} /></span></button>)}</div></div>
  );
  if (product === "automobile" && !vehicleKind) return <VehicleKindChoice onBack={() => setProduct(null)} onSelect={setVehicleKind} />;
  if (product === "automobile" && vehicleKind === "car") return <AutoRequestForm backLabel="Changer de véhicule" onBack={() => setVehicleKind(null)} onSubmit={submitRequest} />;
  if (product === "automobile" && vehicleKind === "moto") return <MotoRequestForm backLabel="Changer de véhicule" onBack={() => setVehicleKind(null)} onSubmit={submitRequest} />;
  const selectedProduct = productChoices.find((item) => item.id === product)!;
  if (!preparationMode) return <RequestPreparationChoice product={selectedProduct} onBack={() => setProduct(null)} onSelect={setPreparationMode} />;
  if (preparationMode === "broker") return <BrokerDelegationForm product={selectedProduct} onBack={() => setPreparationMode(null)} onSubmit={submitRequest} />;
  if (product === "sante") return <HealthRequestForm backLabel="Choisir un autre parcours" onBack={() => setPreparationMode(null)} onSubmit={submitRequest} />;
  if (product === "caution") return <CautionRequestForm backLabel="Choisir un autre parcours" onBack={() => setPreparationMode(null)} onSubmit={submitRequest} />;
  return <ProductRequestForm product={selectedProduct} backLabel="Choisir un autre parcours" onBack={() => setPreparationMode(null)} onSubmit={submitRequest} />;
}

function VehicleKindChoice({ onBack, onSelect }: { onBack: () => void; onSelect: (kind: AutomobileVehicleKind) => void }) {
  return <div className="page-stack request-flow-page auto-request-page">
    <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> Changer d’assurance</button>
    <PageHeader eyebrow="Assurance automobile" title="Quel véhicule souhaitez-vous assurer ?" description="Le formulaire s’adapte aux caractéristiques et aux usages de votre véhicule." />
    <section className="flow-card vehicle-kind-card">
      <div className="vehicle-kind-grid">
        <button type="button" onClick={() => onSelect("car")}><span><Car size={30} /></span><div><strong>Voiture</strong><p>Véhicule personnel, professionnel ou destiné au transport.</p><small>CAT1 · CAT2 · CAT3</small></div><ChevronRight size={20} /></button>
        <button type="button" onClick={() => onSelect("moto")}><span><Bike size={30} /></span><div><strong>Moto / 2–3 roues</strong><p>Véhicule motorisé à deux ou trois roues, avec ou sans transport payant de passagers.</p><small>CAT5 · CAT5 BIS</small></div><ChevronRight size={20} /></button>
      </div>
    </section>
  </div>;
}

function RequestPreparationChoice({ product, onBack, onSelect }: { product: ProductChoice; onBack: () => void; onSelect: (mode: "self" | "broker") => void }) {
  return <div className="page-stack request-flow-page auto-request-page">
    <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> Changer d’assurance</button>
    <PageHeader eyebrow={`Assurance ${product.label.toLowerCase()}`} title="Comment souhaitez-vous préparer votre demande ?" description="Choisissez le parcours qui vous convient. Vous pouvez renseigner les informations vous-même ou confier cette étape à votre courtier." />
    <section className="flow-card auto-request-card auto-request-mode-card">
      <div className="auto-request-mode-grid">
        <button type="button" onClick={() => onSelect("self")}><span><FileText size={25} /></span><div><strong>Remplir moi-même</strong><p>Je complète le formulaire adapté à mon besoin et vérifie les informations avant l’envoi.</p></div><ChevronRight size={20} /></button>
        <button type="button" onClick={() => onSelect("broker")}><span><CircleHelp size={25} /></span><div><strong>Déléguer à mon courtier</strong><p>J’explique librement mon besoin et mon courtier me recontacte pour compléter le dossier.</p></div><ChevronRight size={20} /></button>
      </div>
    </section>
  </div>;
}

function BrokerDelegationForm({ product, onBack, onSubmit }: { product: ProductChoice; onBack: () => void; onSubmit: (data: Partial<InsuranceRequest>) => void }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedMessage = message.trim();
    if (!normalizedMessage) {
      setError("Décrivez brièvement votre besoin avant de transmettre la demande.");
      window.requestAnimationFrame(() => document.getElementById(`${product.id}-delegated-message`)?.focus());
      return;
    }
    onSubmit({
      product: product.id,
      productLabel: `Assurance ${product.label.toLowerCase()}`,
      comments: normalizedMessage,
      details: { "Mode de préparation": "Délégué au courtier" },
    });
  };
  return <div className="page-stack request-flow-page auto-request-page">
    <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> Choisir un autre parcours</button>
    <PageHeader eyebrow={`Assurance ${product.label.toLowerCase()}`} title="Déléguez votre demande à votre courtier" description="Expliquez votre besoin avec vos propres mots. Votre courtier vous recontactera pour recueillir les informations nécessaires." />
    <form className="flow-card auto-request-card auto-request-delegated-card" onSubmit={submit} noValidate>
      <header><span><CircleHelp size={25} /></span><div><h2>Que souhaitez-vous confier à votre courtier ?</h2><p>Vous pouvez écrire ou utiliser le microphone pour dicter votre demande.</p></div></header>
      <VoiceTextarea id={`${product.id}-delegated-message`} label="Décrivez librement votre besoin" value={message} onChange={(value) => { setMessage(value); setError(""); }} error={error} placeholder={`Exemple : je souhaite être accompagné pour préparer ma demande d’assurance ${product.label.toLowerCase()}…`} required rows={8} />
      <div className="auto-request-helper"><CircleHelp size={17} /> Votre courtier pourra vous demander des précisions ou des documents avant de préparer ses propositions.</div>
      <div className="auto-request-save"><Save size={15} /><span>Votre message reste modifiable jusqu’à sa transmission</span></div>
      <div className="flow-actions auto-request-actions"><button className="button button-secondary" type="button" onClick={onBack}>Retour</button><button className="button button-primary" type="submit">Transmettre au courtier <ChevronRight size={18} /></button></div>
    </form>
  </div>;
}

function ProductRequestForm({ product, onBack, onSubmit, backLabel = "Changer d’assurance" }: { product: ProductChoice; onBack: () => void; onSubmit: (data: Partial<InsuranceRequest>) => void; backLabel?: string }) {
  const config = insuranceProductForms[product.id as ConfiguredInsuranceProduct];
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
    <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> {backLabel}</button>
    <PageHeader eyebrow="Nouvelle demande" title={`Assurance ${product.label.toLowerCase()}`} description="Renseignez les informations essentielles pour permettre à votre courtier d’étudier votre dossier." />
    <form className="flow-card product-request" onSubmit={submit}>
      <header className="product-request-hero"><span className="generic-product-icon"><Icon size={30} /></span><div><span className="product-form-tag">Formulaire personnalisé</span><h2>{config.title}</h2><p>{config.intro}</p></div></header>
      {config.sections.map((section, sectionIndex) => <section className="product-form-section" key={section.title}>
        <div className="product-form-heading"><span>{sectionIndex + 1}</span><div><h3>{section.title}</h3>{section.description && <p>{section.description}</p>}</div></div>
        <div className="form-grid">{section.fields.map((field) => <label className={field.full ? "full-span" : undefined} key={field.key}>{field.label}{field.required && <span className="required-mark" aria-hidden="true">*</span>}{!field.required && <small className="field-optional">Facultatif</small>}{field.type === "select" ? <select value={values[field.key]} onChange={(event) => updateValue(field.key, event.target.value)} required={field.required}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type} value={values[field.key]} onChange={(event) => updateValue(field.key, event.target.value)} placeholder={field.placeholder} min={field.min} required={field.required} inputMode={field.type === "number" ? "numeric" : undefined} />}</label>)}</div>
      </section>)}
      <section className="product-form-section">
        <div className="product-form-heading"><span>{config.sections.length + 1}</span><div><h3>Protection recherchée</h3><p>Choisissez le niveau qui se rapproche le plus de votre besoin. Votre courtier pourra l’ajuster avec vous.</p></div></div>
        <fieldset className="coverage-choice-grid"><legend className="sr-only">Protection recherchée</legend>{config.coverageOptions.map((option) => <label className={coverage === option ? "selected" : ""} key={option}><input type="radio" name={`${product.id}-coverage`} value={option} checked={coverage === option} onChange={() => setCoverage(option)} /><span><ShieldCheck size={19} /></span><strong>{option}</strong>{coverage === option && <CheckCircle2 size={18} />}</label>)}</fieldset>
      </section>
      <section className="product-form-section product-form-comments">
        <div><h3>Précisions complémentaires <small>Facultatif</small></h3><p>Ajoutez uniquement une information qui n’apparaît pas déjà dans le formulaire.</p></div>
        <label className="sr-only" htmlFor={`${product.id}-comments`}>Précisions complémentaires</label><textarea id={`${product.id}-comments`} rows={4} value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Une contrainte, une échéance ou une information utile…" />
      </section>
      <div className="form-alert info"><CircleAlert size={18} /> Votre demande sera transmise à votre gestionnaire pour étude avant toute proposition.</div>
      <div className="flow-actions"><button className="button button-secondary" type="button" onClick={onBack}>{backLabel}</button><button className="button button-primary" type="submit">Envoyer ma demande <ChevronRight size={18} /></button></div>
    </form>
  </div>;
}

function formatProductField(field: InsuranceFormField, value: string) {
  if (!value) return "Non renseigné";
  if (field.format === "fcfa") return formatFcfa(Number(value));
  if (field.format === "date") return formatDate(value);
  return value;
}

function RequestConfirmation({ reference, productLabel, vehicleKind, onOpen }: { reference: string; productLabel: string; vehicleKind?: AutomobileVehicleKind; onOpen: () => void }) {
  const isVehicleRequest = reference.startsWith("DEM-AUTO-") || reference.startsWith("DEM-MOTO-");
  const timeline = isVehicleRequest
    ? [{ label: "Demande envoyée", done: true }, { label: "Analyse par le courtier", done: false, active: true }, { label: "Préparation des propositions", done: false }, { label: "Propositions disponibles", done: false }, { label: "Choix de l’offre", done: false }, { label: "Échange avec le courtier", done: false }, { label: "Contrat disponible", done: false }]
    : [{ label: "Demande envoyée", done: true }, { label: "Analyse du besoin", done: false, active: true }, { label: "Préparation des propositions", done: false }, { label: "Propositions disponibles", done: false }, { label: "Choix de l’offre", done: false }, { label: "Échange avec le courtier", done: false }, { label: "Police disponible", done: false }];
  return <div className="confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={38} /></span><span className="page-eyebrow">Demande transmise</span><h1>{isVehicleRequest ? "Votre demande a bien été transmise." : "Votre demande a bien été enregistrée."}</h1><p>{isVehicleRequest ? "Votre courtier va analyser les informations transmises et préparer les propositions adaptées à votre besoin." : "Votre courtier va analyser votre besoin et préparer les propositions adaptées."}</p><div className="confirmation-reference"><small>Référence de votre dossier</small><strong>{reference}</strong><span>{productLabel} · Nouvelle demande</span>{vehicleKind && <em className="vehicle-kind-tag">{vehicleKind === "moto" ? "Moto / 2–3 roues" : "Voiture"}</em>}</div>{isVehicleRequest && <p className="confirmation-follow-up">Vous pourrez suivre l’évolution de votre demande depuis votre espace client.</p>}<Timeline items={timeline} /><button className="button button-primary" type="button" onClick={onOpen}>{isVehicleRequest ? "Suivre ma demande" : "Voir le suivi de ma demande"}</button></div>;
}

export function OfferDetailPage({ offerId }: { offerId: string }) {
  const { store, updateStore, navigate, query } = usePortal();
  const offer = store.offers.find((item) => item.id === offerId);
  const proposal = store.proposals.find((item) => item.id === offer?.proposalId);
  const request = store.requests.find((item) => item.id === proposal?.requestId || item.reference === proposal?.requestId);
  const [accepted, setAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  if (!offer || !proposal || !request) return null;
  const recommended = proposal.recommendedOfferId === offer.id;
  const confirm = async () => {
    if (!accepted || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const selectedOffer = await selectionnerOffre(request.reference, offer.id);
      updateStore((current) => ({
        ...current,
        offers: current.offers.map((item) => ({
          ...item,
          selected: item.id === selectedOffer.id,
        })),
        requests: current.requests.map((item) => item.reference === request.reference
          ? { ...item, selectedOfferId: selectedOffer.id, status: "offer_selected" }
          : item),
      }));
      setConfirmed(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Votre choix n’a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  };
  if (confirmed || offer.selected) return <div className="confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={38} /></span><span className="page-eyebrow">Choix enregistré</span><h1>Votre offre a été sélectionnée.</h1><p>Discutez avec votre courtier pour convenir des prochaines étapes et des modalités de règlement.</p><div className="confirmation-reference"><small>Offre retenue</small><strong>{formatFcfa(offer.premium)}</strong><span>{offer.product} · dossier {request.reference}</span></div><button className="button button-primary" type="button" onClick={() => navigate(`/espace/demandes/${request.reference}/discussion`)}><MessageCircle size={17} /> Discuter avec mon courtier</button></div>;
  return <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate(`/espace/demandes/${request.reference}/propositions`)}><ArrowLeft size={17} /> Retour aux propositions</button><PageHeader eyebrow={offer.reference} title={offer.product} description="Proposition personnalisée" action={recommended ? <StatusBadge status="proposals_available">Recommandée par votre gestionnaire</StatusBadge> : undefined} /><section className="offer-detail-hero"><div><span>Prime</span><strong>{formatFcfa(offer.premium)}</strong><small>{offer.duration}</small></div><div><span>Franchise</span><strong>{formatFcfa(offer.deductible)}</strong><small>selon les conditions</small></div><div><span>Date d’effet</span><strong>{formatDate(offer.effectiveDate)}</strong><small>{offer.duration}</small></div></section>{recommended && <section className="broker-advice compact"><span className="large-avatar">{store.advisor.initials}</span><div><span>Conseil de votre gestionnaire</span><p>{proposal.advice}</p></div></section>}<div className="offer-detail-grid"><section className="panel"><h2>Garanties incluses</h2><ul className="guarantee-list large">{offer.guarantees.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul></section><section className="panel"><h2>Garanties optionnelles</h2><ul className="guarantee-list large muted">{offer.options.length ? offer.options.map((item) => <li key={item}><PlusMark /> {item}</li>) : <li>Aucune option supplémentaire.</li>}</ul></section><section className="panel"><h2>Exclusions principales</h2><ul className="plain-list">{offer.exclusions.length ? offer.exclusions.map((item) => <li key={item}><CircleAlert size={16} /> {item}</li>) : <li>Aucune exclusion communiquée.</li>}</ul></section><section className="panel"><h2>Documents nécessaires</h2><ul className="plain-list">{offer.requiredDocuments.length ? offer.requiredDocuments.map((item) => <li key={item}><FileText size={16} /> {item}</li>) : <li>Aucune pièce supplémentaire demandée.</li>}</ul></section></div><section className={`acceptance-card ${query.get("choisir") ? "highlight" : ""}`}><div><span className="page-eyebrow">Confirmation</span><h2>Choisir cette proposition</h2><p>Votre choix sera enregistré et vous pourrez ensuite échanger directement avec votre courtier.</p></div>{error && <div className="form-alert error" role="alert"><CircleAlert size={17} /> {error}</div>}<label className="check-row"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>Je confirme avoir pris connaissance des informations relatives à cette proposition.</span></label><button className="button button-primary" type="button" disabled={!accepted || submitting} onClick={() => { void confirm(); }}>{submitting ? "Enregistrement…" : "Confirmer mon choix"}</button></section></div>;
}

function FlowHeading({ number, title, description }: { number: string; title: string; description: string }) { return <div className="flow-heading"><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></div>; }
function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <label>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required /></label>; }
function SummarySection({ title, items }: { title: string; items: string[][] }) { return <section><h3>{title}</h3>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>; }
function PlusMark() { return <span className="plus-mark">+</span>; }
