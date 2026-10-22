import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  Landmark,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { formatDate, formatFcfa } from "../services/portal-service";
import type { InsuranceRequest } from "../types/domain";
import { PageHeader } from "../components/portal-ui";
import { VoiceTextarea } from "./auto-request-form";

type CautionType = "soumission" | "bonne_fin" | "retenue_garantie" | "avance_demarrage";

interface CautionRequestFormProps {
  backLabel?: string;
  onBack: () => void;
  onSubmit: (data: Partial<InsuranceRequest>) => void;
}

interface RequiredDocument {
  id: string;
  category: "Marché" | "Entreprise" | "Références";
  label: string;
  appliesTo: readonly CautionType[];
}

const allCautionTypes: readonly CautionType[] = ["soumission", "bonne_fin", "retenue_garantie", "avance_demarrage"];
const executionCautionTypes: readonly CautionType[] = ["bonne_fin", "retenue_garantie", "avance_demarrage"];

const cautionTypes: readonly {
  id: CautionType;
  abbreviation: string;
  label: string;
  description: string;
}[] = [
  {
    id: "soumission",
    abbreviation: "SOUM",
    label: "Caution de soumission",
    description: "Accompagne votre réponse à un appel d’offres.",
  },
  {
    id: "avance_demarrage",
    abbreviation: "AVD",
    label: "Avance de démarrage",
    description: "Garantit l’avance accordée pour démarrer le marché.",
  },
  {
    id: "retenue_garantie",
    abbreviation: "RTG",
    label: "Retenue de garantie",
    description: "Remplace la retenue appliquée sur les décomptes.",
  },
  {
    id: "bonne_fin",
    abbreviation: "BFN",
    label: "Caution de bonne fin",
    description: "Garantit la bonne exécution des obligations du marché.",
  },
];

const requiredDocuments: readonly RequiredDocument[] = [
  { id: "request", category: "Marché", label: "Demande adressée à la compagnie", appliesTo: allCautionTypes },
  { id: "bond-model", category: "Marché", label: "Modèle de caution", appliesTo: allCautionTypes },
  { id: "tender-notice", category: "Marché", label: "Avis d’appel d’offres", appliesTo: ["soumission"] },
  { id: "contract-copy", category: "Marché", label: "Copie du marché (contrat)", appliesTo: executionCautionTypes },
  { id: "bank", category: "Marché", label: "Banque de domiciliation", appliesTo: executionCautionTypes },
  { id: "company-statutes", category: "Entreprise", label: "Statuts de la société", appliesTo: executionCautionTypes },
  { id: "business-license", category: "Entreprise", label: "Patente", appliesTo: executionCautionTypes },
  { id: "trade-register", category: "Entreprise", label: "Registre de commerce", appliesTo: executionCautionTypes },
  { id: "taxpayer-card", category: "Entreprise", label: "Carte de contribuable", appliesTo: executionCautionTypes },
  { id: "location-plan", category: "Entreprise", label: "Plan de localisation", appliesTo: executionCautionTypes },
  { id: "financial-statements", category: "Entreprise", label: "Bilans des 3 dernières années (tableaux uniquement)", appliesTo: executionCautionTypes },
  { id: "manager-id", category: "Entreprise", label: "Photocopie de la CNI du principal dirigeant", appliesTo: executionCautionTypes },
  { id: "achievements", category: "Références", label: "Tableau des réalisations des 5 dernières années", appliesTo: executionCautionTypes },
  { id: "contract-pages", category: "Références", label: "Pages pertinentes des contrats (photocopies)", appliesTo: executionCautionTypes },
  { id: "acceptance-reports", category: "Références", label: "Procès-verbaux de réception des contrats concernés", appliesTo: executionCautionTypes },
  {
    id: "assets-proof",
    category: "Références",
    label: "Justificatifs du patrimoine (titre foncier et cartes grises du matériel)",
    appliesTo: ["retenue_garantie", "avance_demarrage"],
  },
];

const initialValues = {
  companyName: "",
  registrationNumber: "",
  taxpayerNumber: "",
  companyAddress: "",
  marketObject: "",
  beneficiary: "",
  tenderReference: "",
  contractNumber: "",
  marketAmount: "",
  cautionAmount: "",
  bankName: "",
  desiredStartDate: "",
};

function RequiredMark() {
  return <span className="required-mark" aria-hidden="true">*</span>;
}

export function CautionRequestForm({ backLabel = "Choisir un autre parcours", onBack, onSubmit }: CautionRequestFormProps) {
  const [cautionType, setCautionType] = useState<CautionType>("soumission");
  const [values, setValues] = useState(initialValues);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [comments, setComments] = useState("");
  const selectedType = cautionTypes.find((item) => item.id === cautionType)!;
  const visibleDocuments = useMemo(
    () => requiredDocuments.filter((document) => document.appliesTo.includes(cautionType)),
    [cautionType],
  );
  const documentGroups = useMemo(
    () => ["Marché", "Entreprise", "Références"].map((category) => ({
      category,
      documents: visibleDocuments.filter((document) => document.category === category),
    })).filter((group) => group.documents.length > 0),
    [visibleDocuments],
  );
  const updateValue = (key: keyof typeof initialValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };
  const updateFile = (documentId: string, file?: File) => {
    setFiles((current) => {
      const next = { ...current };
      if (file) next[documentId] = file;
      else delete next[documentId];
      return next;
    });
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const attachedDocuments = visibleDocuments
      .filter((document) => files[document.id])
      .map((document) => `${document.label} (${files[document.id].name})`);
    onSubmit({
      product: "caution",
      productLabel: "Assurance caution",
      coverage: selectedType.label,
      desiredStartDate: values.desiredStartDate,
      comments: comments.trim() || undefined,
      details: {
        "Type de caution": selectedType.label,
        "Raison sociale": values.companyName,
        "Registre de commerce": values.registrationNumber,
        "Numéro de contribuable": values.taxpayerNumber,
        "Adresse de l’entreprise": values.companyAddress,
        "Objet du marché": values.marketObject,
        "Maître d’ouvrage / bénéficiaire": values.beneficiary,
        "Référence de l’appel d’offres": values.tenderReference || "Non renseignée",
        "Numéro du marché": values.contractNumber || "Non renseigné",
        "Montant du marché": formatFcfa(Number(values.marketAmount)),
        "Montant de la caution": formatFcfa(Number(values.cautionAmount)),
        "Banque de domiciliation": values.bankName || "Non renseignée",
        "Date d’émission souhaitée": formatDate(values.desiredStartDate),
        "Pièces à fournir": visibleDocuments.map((document) => document.label).join(" · "),
        "Pièces déjà jointes": attachedDocuments.length > 0 ? attachedDocuments.join(" · ") : "À transmettre depuis l’espace Documents",
      },
    });
  };

  return (
    <div className="page-stack product-request-page caution-request-page">
      <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> {backLabel}</button>
      <PageHeader
        eyebrow="Nouvelle demande"
        title="Assurance caution"
        description="Choisissez d’abord la nature de la caution. Le formulaire adapte automatiquement les pièces à fournir."
      />
      <form className="flow-card product-request caution-request" onSubmit={submit}>
        <header className="product-request-hero">
          <span className="generic-product-icon"><Landmark size={30} /></span>
          <div><span className="product-form-tag">Cautions des marchés</span><h2>Préparez votre demande de caution</h2><p>Renseignez le marché, l’entreprise et les justificatifs correspondant à la garantie recherchée.</p></div>
        </header>

        <section className="product-form-section">
          <div className="product-form-heading"><span>1</span><div><h3>Quel type de caution recherchez-vous ? <RequiredMark /></h3><p>Ce choix détermine immédiatement les documents nécessaires à l’étude.</p></div></div>
          <fieldset className="caution-type-grid"><legend className="sr-only">Type de caution</legend>
            {cautionTypes.map((item) => (
              <label className={cautionType === item.id ? "selected" : ""} key={item.id}>
                <input type="radio" name="caution-type" value={item.id} checked={cautionType === item.id} onChange={() => setCautionType(item.id)} />
                <span>{item.abbreviation}</span>
                <div><strong>{item.label}</strong><small>{item.description}</small></div>
                {cautionType === item.id && <CheckCircle2 size={19} />}
              </label>
            ))}
          </fieldset>
        </section>

        <section className="product-form-section">
          <div className="product-form-heading"><span>2</span><div><h3>Informations sur l’entreprise</h3><p>Identifiez la structure qui sollicite la caution.</p></div></div>
          <div className="form-grid">
            <label>Raison sociale <RequiredMark /><input value={values.companyName} onChange={(event) => updateValue("companyName", event.target.value)} placeholder="Nom de l’entreprise" required /></label>
            <label>Registre de commerce <RequiredMark /><input value={values.registrationNumber} onChange={(event) => updateValue("registrationNumber", event.target.value)} placeholder="N° RCCM" required /></label>
            <label>Numéro de contribuable <RequiredMark /><input value={values.taxpayerNumber} onChange={(event) => updateValue("taxpayerNumber", event.target.value)} placeholder="N° contribuable" required /></label>
            <label>Adresse de l’entreprise <RequiredMark /><input value={values.companyAddress} onChange={(event) => updateValue("companyAddress", event.target.value)} placeholder="Ville et quartier" required /></label>
          </div>
        </section>

        <section className="product-form-section">
          <div className="product-form-heading"><span>3</span><div><h3>Informations sur le marché</h3><p>Indiquez les références et montants figurant dans les documents du marché.</p></div></div>
          <div className="form-grid">
            <label className="full-span">Objet du marché <RequiredMark /><input value={values.marketObject} onChange={(event) => updateValue("marketObject", event.target.value)} placeholder="Ex. Construction et équipement d’un bâtiment" required /></label>
            <label>Maître d’ouvrage / bénéficiaire <RequiredMark /><input value={values.beneficiary} onChange={(event) => updateValue("beneficiary", event.target.value)} placeholder="Organisme bénéficiaire" required /></label>
            <label>Référence de l’appel d’offres <small className="field-optional">Facultatif</small><input value={values.tenderReference} onChange={(event) => updateValue("tenderReference", event.target.value)} placeholder="N° de l’appel d’offres" /></label>
            <label>Numéro du marché <small className="field-optional">Facultatif</small><input value={values.contractNumber} onChange={(event) => updateValue("contractNumber", event.target.value)} placeholder="N° du contrat ou marché" /></label>
            <label>Montant du marché (FCFA) <RequiredMark /><input type="number" min="0" inputMode="numeric" value={values.marketAmount} onChange={(event) => updateValue("marketAmount", event.target.value)} placeholder="Ex. 150 000 000" required /></label>
            <label>Montant de la caution (FCFA) <RequiredMark /><input type="number" min="0" inputMode="numeric" value={values.cautionAmount} onChange={(event) => updateValue("cautionAmount", event.target.value)} placeholder="Ex. 15 000 000" required /></label>
            <label>Banque de domiciliation <small className="field-optional">Facultatif</small><input value={values.bankName} onChange={(event) => updateValue("bankName", event.target.value)} placeholder="Nom de la banque" /></label>
            <label>Date d’émission souhaitée <RequiredMark /><input type="date" value={values.desiredStartDate} onChange={(event) => updateValue("desiredStartDate", event.target.value)} required /></label>
          </div>
        </section>

        <section className="product-form-section">
          <div className="product-form-heading"><span>4</span><div><h3>Pièces à fournir pour la {selectedType.label.toLowerCase()}</h3><p>{visibleDocuments.length} document{visibleDocuments.length > 1 ? "s" : ""} identifié{visibleDocuments.length > 1 ? "s" : ""}. Vous pouvez les ajouter maintenant ou compléter le dossier plus tard.</p></div></div>
          <div className="caution-documents">
            {documentGroups.map((group) => (
              <section key={group.category}>
                <h4>{group.category === "Marché" ? "Documents sur le marché" : group.category === "Entreprise" ? "Informations sur l’entreprise" : "Références de l’entreprise"}</h4>
                <div>
                  {group.documents.map((document) => (
                    <article className={files[document.id] ? "attached" : ""} key={document.id}>
                      <span className="caution-document-index">{String(requiredDocuments.findIndex((item) => item.id === document.id) + 1).padStart(2, "0")}</span>
                      <span className="caution-document-status">{files[document.id] ? <Check size={17} /> : <FileCheck2 size={17} />}</span>
                      <div><strong>{document.label}</strong><small>{files[document.id]?.name ?? "Document à transmettre"}</small></div>
                      <label className="caution-document-upload">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => updateFile(document.id, event.target.files?.[0])} />
                        <Upload size={15} /> {files[document.id] ? "Remplacer" : "Ajouter"}
                      </label>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="product-form-section product-form-comments">
          <div><h3>Précisions complémentaires <small>Facultatif</small></h3><p>Ajoutez une échéance, une exigence du bénéficiaire ou toute information utile.</p></div>
          <VoiceTextarea id="caution-comments" label="Précisions complémentaires" value={comments} onChange={setComments} placeholder="Ex. Le dossier de soumission doit être déposé avant le…" rows={5} />
        </section>

        <div className="form-alert info"><CircleAlert size={18} /> Les pièces ajoutées sont conservées uniquement dans cette démonstration frontend. Leur envoi sécurisé sera relié au backend.</div>
        <div className="auto-request-save"><Save size={15} /><span>Type sélectionné : {selectedType.label} · {Object.keys(files).filter((id) => visibleDocuments.some((document) => document.id === id)).length}/{visibleDocuments.length} pièce(s) ajoutée(s)</span></div>
        <div className="flow-actions"><button className="button button-secondary" type="button" onClick={onBack}>{backLabel}</button><button className="button button-primary" type="submit"><ShieldCheck size={17} /> Envoyer ma demande <ChevronRight size={18} /></button></div>
      </form>
    </div>
  );
}
