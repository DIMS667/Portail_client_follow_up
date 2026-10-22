import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Check, ChevronRight, CircleAlert, HeartPulse, Plus, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { usePortal } from "../app/portal-context";
import { PageHeader } from "../components/portal-ui";
import type {
  HealthAnswer, HealthInsuredPerson, HealthInsuranceRequestData, HealthRelationship, InsuranceRequest,
} from "../types/domain";

const STEP_LABELS = ["Dossier", "Bénéficiaires", "Santé", "Antécédents", "Déclaration"];

const medicalQuestions = [
  { key: "respiratory", label: "Affection de l’appareil respiratoire (asthme, bronchite, poumons…)" },
  { key: "circulatory", label: "Affection du cœur, du sang ou de la circulation" },
  { key: "digestive", label: "Affection de l’appareil digestif ou du foie" },
  { key: "urogenital", label: "Affection urinaire, génitale ou des organes féminins" },
  { key: "musculoskeletal", label: "Affection des os, articulations, muscles ou rhumatismes" },
  { key: "nervous", label: "Affection du système nerveux ou trouble psychique" },
  { key: "senses", label: "Affection des organes des sens, hors yeux" },
  { key: "eyes", label: "Affection des yeux ou port de verres correcteurs" },
  { key: "other_disease", label: "Autre maladie : peau, glandes, diabète, maladie contagieuse…" },
  { key: "operation", label: "Opération chirurgicale passée ou programmée" },
  { key: "accident", label: "Accident ayant laissé des séquelles" },
  { key: "hospitalization", label: "Séjour en sanatorium, établissement psychiatrique ou autre centre de soins" },
  { key: "chronic", label: "Maladie chronique, infirmité ou défaut corporel (hernie, goitre…)" },
  { key: "dental", label: "Prothèse dentaire, dents manquantes ou soins dentaires en cours" },
  { key: "hiv", label: "Test VIH déjà effectué" },
  { key: "tuberculosis", label: "Tuberculose" },
  { key: "cancer", label: "Cancer ou tumeur" },
  { key: "medication", label: "Traitement médicamenteux ou régime suivi régulièrement" },
  { key: "work_stop", label: "Arrêt de travail de plus de 15 jours pour maladie durant les 12 derniers mois" },
  { key: "tobacco", label: "Consommation de tabac" },
  { key: "occupational_risk", label: "Exposition professionnelle à des produits toxiques, inflammables, corrosifs, explosifs ou à des charges lourdes" },
  { key: "work_vehicle", label: "Utilisation permanente d’un véhicule pour le travail" },
  { key: "sport", label: "Pratique régulière d’un sport" },
  { key: "blood_donation", label: "Don de sang déjà effectué", detailsRequired: false },
  { key: "child_conditions", label: "Pour un enfant : scoliose, luxation de hanche, rachitisme ou paralysie infantile" },
  { key: "pregnancy", label: "Pour une femme : grossesse en cours ou antécédent d’accouchement non normal" },
  { key: "breast_condition", label: "Pour une femme : affection actuelle ou passée des seins" },
  { key: "other_wives", label: "Pour un homme : autres épouses à déclarer" },
] as const;

type MedicalQuestionKey = typeof medicalQuestions[number]["key"];
type MedicalAnswers = HealthInsuranceRequestData["medicalAnswers"];

const relationshipLabels: Record<HealthRelationship, string> = {
  principal: "Assuré principal",
  spouse: "Conjoint(e)",
  child: "Enfant",
};

function emptyPerson(id: string, relationship: HealthRelationship): HealthInsuredPerson {
  return { id, relationship, lastName: "", firstNames: "", sex: "", birthDate: "", city: "", occupation: "", desiredStartDate: "" };
}

export function HealthRequestForm({ onBack, onSubmit, backLabel = "Changer d’assurance" }: { onBack: () => void; onSubmit: (data: Partial<InsuranceRequest>) => void; backLabel?: string }) {
  const { store } = usePortal();
  const [step, setStep] = useState(0);
  const subscriberName = `${store.client.firstName} ${store.client.lastName}`;
  const [adhesionFor, setAdhesionFor] = useState<HealthInsuranceRequestData["adhesionFor"]>("employee");
  const [people, setPeople] = useState<HealthInsuredPerson[]>(() => [{
    ...emptyPerson("principal", "principal"),
    lastName: store.client.lastName,
    firstNames: store.client.firstName,
    city: store.client.city,
  }]);
  const [activePersonId, setActivePersonId] = useState("principal");
  const [medicalAnswers, setMedicalAnswers] = useState<MedicalAnswers>({});
  const [familyHistory, setFamilyHistory] = useState("");
  const [previousInsurance, setPreviousInsurance] = useState("");
  const [socialCoverage, setSocialCoverage] = useState("");
  const [otherChildren, setOtherChildren] = useState("");
  const [additionalMedicalInformation, setAdditionalMedicalInformation] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [signedBy, setSignedBy] = useState("");
  const [signedAt, setSignedAt] = useState(new Date().toISOString().slice(0, 10));
  const [signedIn, setSignedIn] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const activePerson = people.find((person) => person.id === activePersonId) ?? people[0];
  const answeredCount = useMemo(() => medicalQuestions.filter((question) => medicalAnswers[activePerson?.id]?.[question.key]?.answer).length, [activePerson?.id, medicalAnswers]);

  const updatePerson = (id: string, key: keyof HealthInsuredPerson, value: string) => {
    setPeople((current) => current.map((person) => person.id === id ? { ...person, [key]: value } : person));
  };

  const addPerson = (relationship: "spouse" | "child") => {
    if (relationship === "spouse" && people.some((person) => person.relationship === "spouse")) return;
    if (relationship === "child" && people.filter((person) => person.relationship === "child").length >= 5) return;
    const id = `${relationship}-${Date.now()}`;
    setPeople((current) => [...current, emptyPerson(id, relationship)]);
    setActivePersonId(id);
  };

  const removePerson = (id: string) => {
    setPeople((current) => current.filter((person) => person.id !== id));
    setMedicalAnswers((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setActivePersonId("principal");
  };

  const updateMedicalAnswer = (personId: string, key: MedicalQuestionKey, answer: HealthAnswer | "", details?: string) => {
    setMedicalAnswers((current) => ({
      ...current,
      [personId]: {
        ...current[personId],
        [key]: { answer, details: details ?? current[personId]?.[key]?.details ?? "" },
      },
    }));
  };

  const validateStep = (index: number) => {
    const nextErrors: string[] = [];
    if (index === 1) {
      people.forEach((person) => {
        const name = relationshipLabels[person.relationship];
        if (!person.lastName.trim() || !person.firstNames.trim() || !person.sex || !person.birthDate || !person.city.trim() || !person.occupation.trim() || !person.desiredStartDate) {
          nextErrors.push(`Complétez tous les champs obligatoires pour : ${name}.`);
        }
      });
    }
    if (index === 2) {
      people.forEach((person) => {
        const unanswered = medicalQuestions.filter((question) => !medicalAnswers[person.id]?.[question.key]?.answer);
        const missingDetails = medicalQuestions.filter((question) => (!("detailsRequired" in question) || question.detailsRequired !== false) && medicalAnswers[person.id]?.[question.key]?.answer === "yes" && !medicalAnswers[person.id]?.[question.key]?.details?.trim());
        if (unanswered.length) nextErrors.push(`${relationshipLabels[person.relationship]} : répondez aux ${unanswered.length} question(s) restante(s).`);
        if (missingDetails.length) nextErrors.push(`${relationshipLabels[person.relationship]} : précisez ${missingDetails.length} réponse(s) positive(s).`);
      });
    }
    if (index === 4) {
      if (!declarationAccepted) nextErrors.push("Vous devez accepter la déclaration sur l’exactitude des informations.");
      if (!signedBy.trim() || !signedAt || !signedIn.trim()) nextErrors.push("Renseignez le nom du déclarant, le lieu et la date.");
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateStep(step);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    if (step < STEP_LABELS.length - 1) {
      setStep((current) => current + 1);
      window.requestAnimationFrame(() => document.getElementById("health-step-title")?.focus());
      return;
    }
    const healthRequest: HealthInsuranceRequestData = {
      subscriberName, insuredName: subscriberName, adhesionFor, insuredPeople: people,
      medicalAnswers, ...(familyHistory.trim() ? { familyHistory: familyHistory.trim() } : {}),
      ...(previousInsurance.trim() ? { previousInsurance: previousInsurance.trim() } : {}),
      ...(socialCoverage.trim() ? { socialCoverage: socialCoverage.trim() } : {}),
      ...(otherChildren.trim() ? { otherChildren: otherChildren.trim() } : {}),
      ...(additionalMedicalInformation.trim() ? { additionalMedicalInformation: additionalMedicalInformation.trim() } : {}),
      declarationAccepted, signedBy: signedBy.trim(), signedAt, signedIn: signedIn.trim(),
    };
    onSubmit({
      product: "sante", productLabel: "Assurance santé", healthRequest,
      desiredStartDate: people[0]?.desiredStartDate,
      details: {
        "Souscripteur": healthRequest.subscriberName,
        "Assuré principal": healthRequest.insuredName,
        "Adhésion demandée pour": adhesionFor === "employee" ? "Le salarié" : adhesionFor === "family" ? "Le salarié et sa famille" : "Autre composition",
        "Bénéficiaires": `${people.length} personne${people.length > 1 ? "s" : ""}`,
      },
    });
  };

  const goBack = () => {
    setErrors([]);
    if (step === 0) onBack(); else setStep((current) => current - 1);
  };

  return <div className="page-stack request-flow-page health-request-page">
    <button className="back-link" type="button" onClick={goBack}><ArrowLeft size={17} /> {step === 0 ? backLabel : "Étape précédente"}</button>
    <PageHeader eyebrow="Assurance santé" title="Questionnaire-proposition santé" description="Constituez la demande d’adhésion de l’assuré principal et de ses bénéficiaires dans un parcours confidentiel." />
    <div className="health-privacy-note"><ShieldCheck size={19} /><div><strong>Données médicales confidentielles</strong><p>Les réponses affichées dans cette démonstration restent dans votre navigateur. En production, elles devront être chiffrées et transmises par un canal sécurisé.</p></div></div>
    <div className="auto-request-progress health-request-progress"><ol className="stepper auto-request-stepper" aria-label="Progression du questionnaire santé">{STEP_LABELS.map((label, index) => <li className={index < step ? "done" : index === step ? "active" : ""} aria-current={index === step ? "step" : undefined} key={label}><span>{index < step ? <Check size={15} /> : index + 1}</span><small>{label}</small></li>)}</ol><p className="auto-request-progress-copy">Étape {step + 1} sur {STEP_LABELS.length} <span>·</span> <strong>{STEP_LABELS[step]}</strong></p></div>
    <form className="flow-card health-request-card" onSubmit={handleSubmit} noValidate>
      {step === 0 && <section><HealthHeading number="1" title="Informations sur le dossier" description="Le client connecté est à la fois le souscripteur et l’assuré principal." />
        <div className="auto-request-parties-grid health-parties-grid"><HealthPartySummary title="Souscripteur" badge="Paie la cotisation" name={subscriberName} phone={store.client.phone} email={store.client.email} /><HealthPartySummary title="Assuré principal" badge="Personne couverte" name={subscriberName} phone={store.client.phone} email={store.client.email} /></div>
        <div className="health-form-grid">
          <HealthField label="L’adhésion est demandée pour" required><select value={adhesionFor} onChange={(event) => setAdhesionFor(event.target.value as HealthInsuranceRequestData["adhesionFor"])}><option value="employee">Le salarié</option><option value="family">Le salarié et sa famille</option><option value="other">Autre composition</option></select></HealthField>
        </div>
      </section>}

      {step === 1 && <section><HealthHeading number="2" title="Personnes à assurer" description="Ajoutez le conjoint et jusqu’à cinq enfants si nécessaire." />
        <div className="health-member-actions"><button className="button button-secondary" type="button" disabled={people.some((person) => person.relationship === "spouse")} onClick={() => addPerson("spouse")}><Plus size={16} /> Ajouter le conjoint</button><button className="button button-secondary" type="button" disabled={people.filter((person) => person.relationship === "child").length >= 5} onClick={() => addPerson("child")}><Plus size={16} /> Ajouter un enfant</button></div>
        <div className="health-person-list">{people.map((person, index) => <article className="health-person-card" key={person.id}><header><span><UsersRound size={19} /></span><div><strong>{relationshipLabels[person.relationship]}</strong><small>{person.relationship === "child" ? `Enfant ${people.filter((item) => item.relationship === "child").findIndex((item) => item.id === person.id) + 1}` : index === 0 ? "Même personne que le souscripteur" : "Bénéficiaire"}</small></div>{person.relationship !== "principal" && <button type="button" onClick={() => removePerson(person.id)} aria-label={`Retirer ${relationshipLabels[person.relationship]}`}><Trash2 size={17} /></button>}</header><PersonFields person={person} update={updatePerson} lockIdentity={person.relationship === "principal"} /></article>)}</div>
      </section>}

      {step === 2 && <section><HealthHeading number="3" title="Questionnaire médical individuel" description="Répondez pour chaque personne. Toute réponse positive doit être précisée." />
        <div className="health-person-tabs" role="tablist" aria-label="Bénéficiaires">{people.map((person) => <button type="button" role="tab" aria-selected={activePerson?.id === person.id} className={activePerson?.id === person.id ? "active" : ""} onClick={() => setActivePersonId(person.id)} key={person.id}><span>{relationshipLabels[person.relationship]}</span><small>{medicalQuestions.filter((question) => medicalAnswers[person.id]?.[question.key]?.answer).length}/{medicalQuestions.length}</small></button>)}</div>
        {activePerson && <div className="health-medical-panel"><header><div><span className="page-eyebrow">Questionnaire de {activePerson.firstNames || relationshipLabels[activePerson.relationship]}</span><h3>{answeredCount} réponse{answeredCount > 1 ? "s" : ""} sur {medicalQuestions.length}</h3></div><HeartPulse size={24} /></header><div className="health-question-list">{medicalQuestions.map((question, index) => { const response = medicalAnswers[activePerson.id]?.[question.key]; return <article className="health-question" key={question.key}><div className="health-question-copy"><span>{String(index + 1).padStart(2, "0")}</span><strong>{question.label}</strong></div><div className="health-question-answer"><label className={response?.answer === "yes" ? "selected" : ""}><input type="radio" name={`${activePerson.id}-${question.key}`} checked={response?.answer === "yes"} onChange={() => updateMedicalAnswer(activePerson.id, question.key, "yes")} /> Oui</label><label className={response?.answer === "no" ? "selected" : ""}><input type="radio" name={`${activePerson.id}-${question.key}`} checked={response?.answer === "no"} onChange={() => updateMedicalAnswer(activePerson.id, question.key, "no", "")} /> Non</label></div>{response?.answer === "yes" && <textarea rows={2} value={response.details ?? ""} onChange={(event) => updateMedicalAnswer(activePerson.id, question.key, "yes", event.target.value)} placeholder={("detailsRequired" in question && question.detailsRequired === false) ? "Précision facultative" : "Précisez : date, diagnostic, traitement, séquelles ou situation actuelle…"} />}</article>; })}</div></div>}
      </section>}

      {step === 3 && <section><HealthHeading number="4" title="Antécédents et protections existantes" description="Complétez les informations familiales, assurantielles et sociales prévues par le formulaire santé." />
        <div className="health-long-fields"><HealthField label="Autres enfants non inscrits dans la liste"><textarea rows={3} value={otherChildren} onChange={(event) => setOtherChildren(event.target.value)} placeholder="Nom, lien et motif, si concerné" /></HealthField><HealthField label="Antécédents familiaux"><textarea rows={4} value={familyHistory} onChange={(event) => setFamilyHistory(event.target.value)} placeholder="Tuberculose, trouble mental, lèpre, hépatite, diabète, insuffisance rénale… Précisez le lien de parenté." /></HealthField><HealthField label="Assurances antérieures ou demandes refusées/aménagées"><textarea rows={4} value={previousInsurance} onChange={(event) => setPreviousInsurance(event.target.value)} placeholder="Compagnie, date, refus, surprime, exclusion ou résiliation après sinistre" /></HealthField><HealthField label="Protection sociale et garanties déjà acquises"><textarea rows={4} value={socialCoverage} onChange={(event) => setSocialCoverage(event.target.value)} placeholder="Assurance sociale, frais médicaux, individuelle accident, pension, invalidité…" /></HealthField><HealthField label="Informations médicales ou familiales complémentaires"><textarea rows={4} value={additionalMedicalInformation} onChange={(event) => setAdditionalMedicalInformation(event.target.value)} placeholder="Toute précision utile non encore mentionnée" /></HealthField></div>
      </section>}

      {step === 4 && <section><HealthHeading number="5" title="Déclaration du proposant" description="Relisez la portée de votre déclaration avant de transmettre le questionnaire." />
        <div className="health-declaration"><ShieldCheck size={26} /><div><h3>Exactitude des réponses</h3><p>Je certifie que les réponses sont complètes et sincères, y compris pour les personnes à assurer. Je reconnais que toute fausse déclaration ou omission peut entraîner les conséquences prévues par le Code CIMA et j’accepte de fournir, à la demande de l’assureur, les justificatifs ou certificats médicaux nécessaires.</p></div></div>
        <label className="health-consent"><input type="checkbox" checked={declarationAccepted} onChange={(event) => setDeclarationAccepted(event.target.checked)} /><span>Je confirme l’exactitude des informations et j’autorise leur transmission sécurisée pour l’étude de la demande. <RequiredMark /></span></label>
        <div className="health-form-grid"><HealthField label="Nom du déclarant" required><input value={signedBy} onChange={(event) => setSignedBy(event.target.value)} /></HealthField><HealthField label="Fait à" required><input value={signedIn} onChange={(event) => setSignedIn(event.target.value)} /></HealthField><HealthField label="Date" required><input type="date" value={signedAt} onChange={(event) => setSignedAt(event.target.value)} /></HealthField></div>
      </section>}

      {errors.length > 0 && <div className="health-error-summary" role="alert"><CircleAlert size={19} /><div><strong>Vérifiez les informations suivantes :</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div></div>}
      <div className="flow-actions health-request-actions"><button className="button button-secondary" type="button" onClick={goBack}>{step === 0 ? backLabel : "Retour"}</button><button className="button button-primary" type="submit">{step === STEP_LABELS.length - 1 ? "Transmettre le questionnaire" : "Continuer"} <ChevronRight size={18} /></button></div>
    </form>
  </div>;
}

function HealthHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="health-heading"><span>{number}</span><div><h2 id="health-step-title" tabIndex={-1}>{title}</h2><p>{description}</p></div></div>;
}

function RequiredMark() { return <span className="health-required" aria-label="obligatoire">*</span>; }

function HealthField({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return <label className={full ? "health-field full" : "health-field"}><span>{label} {required && <RequiredMark />}</span>{children}</label>;
}

function HealthPartySummary({ title, badge, name, phone, email }: { title: string; badge: string; name: string; phone: string; email: string }) {
  return <article className="auto-request-party-card"><header><strong>{title}</strong><span>{badge}</span></header><h3>{name}</h3><p>{phone}</p><p>{email}</p><small>Informations issues du profil client</small></article>;
}

function PersonFields({ person, update, lockIdentity = false }: { person: HealthInsuredPerson; update: (id: string, key: keyof HealthInsuredPerson, value: string) => void; lockIdentity?: boolean }) {
  return <div className="health-form-grid"><HealthField label="Nom" required><input value={person.lastName} readOnly={lockIdentity} onChange={(event) => update(person.id, "lastName", event.target.value)} />{lockIdentity && <small className="health-locked-note">Repris du profil client</small>}</HealthField><HealthField label="Prénoms" required><input value={person.firstNames} readOnly={lockIdentity} onChange={(event) => update(person.id, "firstNames", event.target.value)} />{lockIdentity && <small className="health-locked-note">Repris du profil client</small>}</HealthField><HealthField label="Sexe" required><select value={person.sex} onChange={(event) => update(person.id, "sex", event.target.value)}><option value="">Sélectionner</option><option value="female">Femme</option><option value="male">Homme</option></select></HealthField><HealthField label="Nom de jeune fille"><input value={person.maidenName ?? ""} onChange={(event) => update(person.id, "maidenName", event.target.value)} /></HealthField><HealthField label="Date de naissance" required><input type="date" value={person.birthDate} onChange={(event) => update(person.id, "birthDate", event.target.value)} /></HealthField><HealthField label="Résidence / ville" required><input value={person.city} onChange={(event) => update(person.id, "city", event.target.value)} /></HealthField><HealthField label="Profession" required><input value={person.occupation} onChange={(event) => update(person.id, "occupation", event.target.value)} /></HealthField><HealthField label="Date d’adhésion souhaitée" required><input type="date" value={person.desiredStartDate} onChange={(event) => update(person.id, "desiredStartDate", event.target.value)} /></HealthField></div>;
}
