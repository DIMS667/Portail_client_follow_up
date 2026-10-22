import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  FileText,
  Mic,
  RefreshCcw,
  Save,
  Square,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePortal } from "../app/portal-context";
import { PageHeader } from "../components/portal-ui";
import { formatDate, formatFcfa } from "../services/portal-service";
import type {
  AutoCoverageDurationMonths,
  AutoRequestType,
  BrokerDelegatedMotoInsuranceRequestData,
  InsuranceRequest,
  MotoGuarantee,
  MotoVehicleEnergy,
  MotoVehicleUsage,
  SelfServiceMotoInsuranceRequestData,
} from "../types/domain";

const DRAFT_KEY = "portail-client-demo:moto-request-draft:v3";
const STEP_LABELS = ["Besoin", "Personnes", "Moto", "Durée", "Garanties", "Vérification"] as const;
const DURATION_OPTIONS = [2, 4, 6, 8, 12] as const;

const guaranteeOptions: Array<{ value: MotoGuarantee; label: string; mandatory?: boolean }> = [
  { value: "civil_liability", label: "Responsabilité Civile", mandatory: true },
  { value: "ipt", label: "IPT" },
  { value: "defense_and_recours", label: "Défense et Recours", mandatory: true },
  { value: "third_party_collision", label: "Tierce Collision" },
  { value: "all_accident_damage", label: "Dommages Tous Accidents" },
  { value: "fire", label: "Incendie" },
  { value: "robbery", label: "Vol Braquage" },
  { value: "total_theft", label: "Vol Total" },
  { value: "total_partial_theft", label: "Vol Total / Vol Partiel" },
  { value: "repair_assistance", label: "Assistance à Réparation" },
  { value: "advance_on_recours", label: "Avance sur Recours" },
];

const guaranteeLabels = Object.fromEntries(guaranteeOptions.map(({ value, label }) => [value, label])) as Record<MotoGuarantee, string>;

const requestOptions: Array<{ value: AutoRequestType; label: string; help: string; icon: LucideIcon }> = [
  { value: "new_vehicle", label: "Assurer une nouvelle moto", help: "Pour une moto récemment acquise", icon: Bike },
  { value: "renewal", label: "Renouveler mon assurance", help: "Pour anticiper votre prochaine échéance", icon: RefreshCcw },
  { value: "other", label: "Autre besoin", help: "Pour une situation particulière", icon: FileText },
];

const requestLabels: Record<AutoRequestType, string> = {
  new_vehicle: "Assurer une nouvelle moto",
  renewal: "Renouveler mon assurance",
  switch_insurer: "Changer d’assureur",
  advice: "Obtenir un conseil",
  other: "Autre besoin",
};

const energyLabels: Record<MotoVehicleEnergy, string> = { petrol: "Essence", electric: "Électrique" };
const usageLabels: Record<MotoVehicleUsage, string> = {
  cat5: "CAT5 (Véhicules motorisés à deux ou trois roues)",
  cat5_bis: "CAT5 BIS (Véhicules motorisés à deux ou trois roues pour le transport de passagers à titre payant)",
};

interface MotoRequestFormState {
  delegatedMessage: string;
  requestType: AutoRequestType | "";
  otherNeed: string;
  driver: {
    isSubscriber: boolean | null;
    firstNames: string;
    lastName: string;
    birthDate: string;
    phone: string;
    occupation: string;
    licenceNumber: string;
    licenceCategory: string;
    licenceIssuedOn: string;
    licenceValidUntil: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: string;
    registration: string;
    energy: MotoVehicleEnergy | "";
    cylinderCapacity: string;
    seatCount: string;
    chassisNumber: string;
    usage: MotoVehicleUsage | "";
    estimatedValue: string;
    carriesFlammableMaterials: boolean | null;
    hasTrailer: boolean | null;
  };
  coverage: {
    durationMonths: AutoCoverageDurationMonths | null;
    desiredStartDate: string;
    startDateUnknown: boolean;
    guarantees: MotoGuarantee[];
  };
  hasVignette: boolean | null;
}

interface MotoDraft {
  mode: "self" | "broker" | null;
  step: number;
  form: MotoRequestFormState;
}

const initialForm: MotoRequestFormState = {
  delegatedMessage: "",
  requestType: "renewal",
  otherNeed: "",
  driver: { isSubscriber: true, firstNames: "", lastName: "", birthDate: "", phone: "", occupation: "", licenceNumber: "", licenceCategory: "", licenceIssuedOn: "", licenceValidUntil: "" },
  vehicle: {
    brand: "Yamaha",
    model: "NMAX",
    year: "2022",
    registration: "LT-456-MT",
    energy: "petrol",
    cylinderCapacity: "155",
    seatCount: "2",
    chassisNumber: "",
    usage: "cat5",
    estimatedValue: "",
    carriesFlammableMaterials: null,
    hasTrailer: null,
  },
  coverage: { durationMonths: 12, desiredStartDate: "2026-10-15", startDateUnknown: false, guarantees: ["civil_liability", "defense_and_recours"] },
  hasVignette: true,
};

function loadDraft(): MotoDraft {
  if (typeof window === "undefined") return { mode: null, step: 0, form: initialForm };
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? "null") as Partial<MotoDraft> | null;
    const savedForm = saved?.form as Partial<MotoRequestFormState> | undefined;
    return {
      mode: saved?.mode === "self" || saved?.mode === "broker" ? saved.mode : null,
      step: typeof saved?.step === "number" && saved.step >= 0 && saved.step < STEP_LABELS.length ? saved.step : 0,
      form: {
        ...initialForm,
        ...savedForm,
        driver: { ...initialForm.driver, ...savedForm?.driver },
        vehicle: { ...initialForm.vehicle, ...savedForm?.vehicle },
        coverage: {
          ...initialForm.coverage,
          ...savedForm?.coverage,
          guarantees: Array.from(new Set(["civil_liability", "defense_and_recours", ...(savedForm?.coverage?.guarantees ?? initialForm.coverage.guarantees)])) as MotoGuarantee[],
        },
      },
    };
  } catch {
    return { mode: null, step: 0, form: initialForm };
  }
}

function validateStep(step: number, form: MotoRequestFormState) {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!form.requestType) errors["request-type"] = "Choisissez le besoin qui correspond à votre situation.";
    if (form.requestType === "other" && !form.otherNeed.trim()) errors["other-need"] = "Précisez brièvement votre besoin.";
  }
  if (step === 1) {
    if (form.driver.isSubscriber === null) errors["driver-is-subscriber"] = "Indiquez si le client est également le conducteur.";
    if (form.driver.isSubscriber === false) {
      if (!form.driver.lastName.trim()) errors["driver-last-name"] = "Renseignez le nom du conducteur.";
      if (!form.driver.firstNames.trim()) errors["driver-first-names"] = "Renseignez les prénoms du conducteur.";
      if (!form.driver.birthDate) errors["driver-birth-date"] = "Renseignez la date de naissance du conducteur.";
      if (!form.driver.phone.trim()) errors["driver-phone"] = "Renseignez le téléphone du conducteur.";
      if (!form.driver.occupation.trim()) errors["driver-occupation"] = "Renseignez la profession du conducteur.";
      if (!form.driver.licenceNumber.trim()) errors["driver-licence-number"] = "Renseignez le numéro du permis.";
      if (!form.driver.licenceCategory.trim()) errors["driver-licence-category"] = "Renseignez la catégorie du permis.";
      if (!form.driver.licenceIssuedOn) errors["driver-licence-issued-on"] = "Renseignez la date de délivrance du permis.";
      if (!form.driver.licenceValidUntil) errors["driver-licence-valid-until"] = "Renseignez la date de validité du permis.";
    }
  }
  if (step === 2) {
    const year = Number(form.vehicle.year);
    const cylinderCapacity = Number(form.vehicle.cylinderCapacity);
    const seatCount = Number(form.vehicle.seatCount);
    const estimatedValue = Number(form.vehicle.estimatedValue);
    const latestCoherentYear = new Date().getFullYear() + 1;
    if (!form.vehicle.brand.trim()) errors["vehicle-brand"] = "Renseignez la marque de la moto.";
    if (!form.vehicle.model.trim()) errors["vehicle-model"] = "Renseignez le modèle de la moto.";
    if (!Number.isInteger(year) || year < 1950 || year > latestCoherentYear) errors["vehicle-year"] = `Indiquez une année comprise entre 1950 et ${latestCoherentYear}.`;
    if (!form.vehicle.registration.trim()) errors["vehicle-registration"] = "Renseignez l’immatriculation de la moto.";
    if (!form.vehicle.energy) errors["vehicle-energy"] = "Choisissez l’énergie de la moto.";
    if (!Number.isInteger(cylinderCapacity) || cylinderCapacity <= 0) errors["vehicle-cylinder-capacity"] = "Indiquez une cylindrée entière et positive.";
    if (!Number.isInteger(seatCount) || seatCount <= 0) errors["vehicle-seat-count"] = "Indiquez un nombre de places entier et positif.";
    if (!form.vehicle.chassisNumber.trim()) errors["vehicle-chassis-number"] = "Renseignez le numéro de châssis.";
    if (!form.vehicle.usage) errors["vehicle-usage"] = "Choisissez l’usage de la moto.";
    if (form.vehicle.estimatedValue && (!Number.isFinite(estimatedValue) || estimatedValue <= 0)) errors["vehicle-estimated-value"] = "Indiquez une valeur positive ou laissez ce champ vide.";
    if (form.vehicle.carriesFlammableMaterials === null) errors["vehicle-flammable"] = "Indiquez si la moto transporte des matières inflammables.";
    if (form.vehicle.hasTrailer === null) errors["vehicle-trailer"] = "Indiquez si la moto utilise une remorque.";
  }
  if (step === 3) {
    if (!form.coverage.durationMonths || !DURATION_OPTIONS.includes(form.coverage.durationMonths)) errors.duration = "Choisissez une durée d’assurance.";
    if (!form.coverage.startDateUnknown && !form.coverage.desiredStartDate) errors["desired-start-date"] = "Choisissez une date de prise d’effet ou indiquez que vous ne la connaissez pas encore.";
    if (form.hasVignette === null) errors["has-vignette"] = "Indiquez si vous avez une vignette.";
  }
  return errors;
}

const focusTargets: Record<string, string> = {
  "request-type": "request-type-new_vehicle",
  duration: "duration-2",
  "has-vignette": "has-vignette-yes",
};

export function MotoRequestForm({ onBack, onSubmit, backLabel = "Changer d’assurance" }: { onBack: () => void; onSubmit: (data: Partial<InsuranceRequest>) => void; backLabel?: string }) {
  const { store } = usePortal();
  const [draft, setDraft] = useState<MotoDraft>(loadDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mode, step, form } = draft;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // The form still works when browser storage is unavailable.
    }
  }, [draft]);

  const updateForm = (updater: (current: MotoRequestFormState) => MotoRequestFormState) => {
    setDraft((current) => ({ ...current, form: updater(current.form) }));
  };
  const clearError = (key: string) => setErrors((current) => {
    if (!current[key]) return current;
    const next = { ...current };
    delete next[key];
    return next;
  });
  const updateVehicle = <K extends keyof MotoRequestFormState["vehicle"]>(key: K, value: MotoRequestFormState["vehicle"][K]) => {
    updateForm((current) => ({ ...current, vehicle: { ...current.vehicle, [key]: value } }));
    clearError(`vehicle-${String(key).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);
  };
  const updateDriver = <K extends keyof MotoRequestFormState["driver"]>(key: K, value: MotoRequestFormState["driver"][K]) => {
    updateForm((current) => ({ ...current, driver: { ...current.driver, [key]: value } }));
    clearError(`driver-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);
  };
  const updateCoverage = <K extends keyof MotoRequestFormState["coverage"]>(key: K, value: MotoRequestFormState["coverage"][K]) => {
    updateForm((current) => ({ ...current, coverage: { ...current.coverage, [key]: value } }));
  };
  const toggleGuarantee = (guarantee: MotoGuarantee) => {
    if (guarantee === "civil_liability" || guarantee === "defense_and_recours") return;
    updateForm((current) => {
      const selected = current.coverage.guarantees.includes(guarantee);
      return {
        ...current,
        coverage: {
          ...current.coverage,
          guarantees: selected
            ? current.coverage.guarantees.filter((item) => item !== guarantee)
            : [...current.coverage.guarantees, guarantee],
        },
      };
    });
  };
  const focusFirstError = (nextErrors: Record<string, string>) => {
    const first = Object.keys(nextErrors)[0];
    if (!first) return;
    window.requestAnimationFrame(() => document.getElementById(focusTargets[first] ?? first)?.focus());
  };
  const goToPreviousStep = () => {
    setErrors({});
    setDraft((current) => ({ ...current, step: Math.max(0, current.step - 1) }));
  };
  const chooseMode = (nextMode: "self" | "broker") => {
    setErrors({});
    setDraft((current) => ({ ...current, mode: nextMode, step: 0 }));
  };
  const returnToModeSelection = () => {
    setErrors({});
    setDraft((current) => ({ ...current, mode: null, step: 0 }));
  };
  const handleTopBack = () => step === 0 ? returnToModeSelection() : goToPreviousStep();
  const clearSavedDraft = () => {
    try {
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clean up when browser storage is unavailable.
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < STEP_LABELS.length - 1) {
      const nextErrors = validateStep(step, form);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        focusFirstError(nextErrors);
        return;
      }
      setDraft((current) => ({ ...current, step: current.step + 1 }));
      window.requestAnimationFrame(() => document.getElementById("auto-request-step-title")?.focus());
      return;
    }

    for (let index = 0; index < STEP_LABELS.length - 1; index += 1) {
      const nextErrors = validateStep(index, form);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        setDraft((current) => ({ ...current, step: index }));
        focusFirstError(nextErrors);
        return;
      }
    }

    const clientSnapshot = {
      firstName: store.client.firstName,
      lastName: store.client.lastName,
      phone: store.client.phone,
      email: store.client.email,
      address: store.client.address,
      city: store.client.city,
    };
    const motoRequest: SelfServiceMotoInsuranceRequestData = {
      completionMode: "self_service",
      requestType: form.requestType as AutoRequestType,
      ...(form.requestType === "other" ? { otherNeed: form.otherNeed.trim() } : {}),
      subscriber: clientSnapshot,
      insured: clientSnapshot,
      driver: form.driver.isSubscriber ? { isSubscriber: true } : {
        isSubscriber: false,
        firstNames: form.driver.firstNames.trim(),
        lastName: form.driver.lastName.trim(),
        birthDate: form.driver.birthDate,
        phone: form.driver.phone.trim(),
        occupation: form.driver.occupation.trim(),
        licenceNumber: form.driver.licenceNumber.trim().toUpperCase(),
        licenceCategory: form.driver.licenceCategory.trim().toUpperCase(),
        licenceIssuedOn: form.driver.licenceIssuedOn,
        licenceValidUntil: form.driver.licenceValidUntil,
      },
      vehicle: {
        brand: form.vehicle.brand.trim(),
        model: form.vehicle.model.trim(),
        year: Number(form.vehicle.year),
        registration: form.vehicle.registration.trim().toUpperCase(),
        energy: form.vehicle.energy as MotoVehicleEnergy,
        cylinderCapacity: Number(form.vehicle.cylinderCapacity),
        seatCount: Number(form.vehicle.seatCount),
        chassisNumber: form.vehicle.chassisNumber.trim().toUpperCase(),
        usage: form.vehicle.usage as MotoVehicleUsage,
        estimatedValue: form.vehicle.estimatedValue ? Number(form.vehicle.estimatedValue) : null,
        carriesFlammableMaterials: Boolean(form.vehicle.carriesFlammableMaterials),
        hasTrailer: Boolean(form.vehicle.hasTrailer),
      },
      coverage: {
        durationMonths: form.coverage.durationMonths as AutoCoverageDurationMonths,
        desiredStartDate: form.coverage.startDateUnknown ? null : form.coverage.desiredStartDate,
        ...(form.coverage.startDateUnknown ? { startDateUnknown: true } : {}),
        guarantees: Array.from(new Set(["civil_liability", "defense_and_recours", ...form.coverage.guarantees])) as MotoGuarantee[],
      },
      hasVignette: Boolean(form.hasVignette),
    };

    clearSavedDraft();

    onSubmit({
      product: "automobile",
      productLabel: "Assurance automobile",
      vehicleKind: "moto",
      motoRequest,
      vehicle: {
        brand: motoRequest.vehicle.brand,
        model: motoRequest.vehicle.model,
        year: String(motoRequest.vehicle.year),
        registration: motoRequest.vehicle.registration,
        value: motoRequest.vehicle.estimatedValue,
        usage: usageLabels[motoRequest.vehicle.usage],
      },
      desiredStartDate: motoRequest.coverage.desiredStartDate ?? undefined,
    });
  };

  const submitDelegatedRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = form.delegatedMessage.trim();
    if (!message) {
      const nextErrors = { "delegated-message": "Décrivez brièvement votre besoin avant de transmettre la demande." };
      setErrors(nextErrors);
      window.requestAnimationFrame(() => document.getElementById("delegated-message")?.focus());
      return;
    }
    const motoRequest: BrokerDelegatedMotoInsuranceRequestData = {
      completionMode: "broker_delegation",
      delegatedMessage: message,
    };
    clearSavedDraft();
    onSubmit({
      product: "automobile",
      productLabel: "Assurance automobile",
      vehicleKind: "moto",
      motoRequest,
      comments: message,
    });
  };

  if (mode === null) {
    return <div className="page-stack request-flow-page auto-request-page">
      <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={17} /> {backLabel}</button>
      <PageHeader eyebrow="Assurance moto" title="Comment souhaitez-vous préparer votre demande ?" description="Choisissez le parcours qui vous convient. Vous pourrez remplir les informations vous-même ou confier cette étape à votre courtier." />
      <section className="flow-card auto-request-card auto-request-mode-card">
        <div className="auto-request-mode-grid">
          <button type="button" onClick={() => chooseMode("self")}>
            <span><FileText size={25} /></span><div><strong>Remplir moi-même</strong><p>Je renseigne ma moto, la durée et les garanties souhaitées.</p></div><ChevronRight size={20} />
          </button>
          <button type="button" onClick={() => chooseMode("broker")}>
            <span><CircleHelp size={25} /></span><div><strong>Déléguer à mon courtier</strong><p>J’explique librement mon besoin et mon courtier me recontacte pour compléter le dossier.</p></div><ChevronRight size={20} />
          </button>
        </div>
      </section>
    </div>;
  }

  if (mode === "broker") {
    return <div className="page-stack request-flow-page auto-request-page">
      <button className="back-link" type="button" onClick={returnToModeSelection}><ArrowLeft size={17} /> Choisir un autre parcours</button>
      <PageHeader eyebrow="Assurance moto" title="Déléguez votre demande à votre courtier" description="Expliquez votre besoin avec vos propres mots. Votre courtier vous recontactera pour recueillir les informations nécessaires." />
      <form className="flow-card auto-request-card auto-request-delegated-card" onSubmit={submitDelegatedRequest} noValidate>
        <header><span><CircleHelp size={25} /></span><div><h2>Que souhaitez-vous confier à votre courtier ?</h2><p>Vous pouvez écrire ou utiliser le microphone pour dicter votre demande.</p></div></header>
        <VoiceTextarea id="delegated-message" label="Décrivez librement votre besoin" value={form.delegatedMessage} onChange={(value) => {
          updateForm((current) => ({ ...current, delegatedMessage: value }));
          clearError("delegated-message");
        }} error={errors["delegated-message"]} placeholder="Exemple : je souhaite assurer ma moto et être accompagné pour choisir les garanties adaptées…" required rows={8} />
        <div className="auto-request-helper"><CircleHelp size={17} /> Votre courtier pourra vous demander des précisions ou des documents avant de préparer ses propositions.</div>
        <div className="auto-request-save"><Save size={15} /><span>Brouillon enregistré automatiquement pendant cette session</span></div>
        <div className="flow-actions auto-request-actions"><button className="button button-secondary" type="button" onClick={returnToModeSelection}>Retour</button><button className="button button-primary" type="submit">Transmettre au courtier <ChevronRight size={18} /></button></div>
      </form>
    </div>;
  }

  return (
    <div className="page-stack request-flow-page auto-request-page">
      <button className="back-link" type="button" onClick={handleTopBack}><ArrowLeft size={17} /> {step === 0 ? "Choisir un autre parcours" : "Étape précédente"}</button>
      <PageHeader eyebrow="Assurance moto" title="Votre demande en quelques étapes" description="Transmettez les informations utiles à votre courtier. Il analysera ensuite votre besoin et préparera les propositions adaptées." />

      <div className="auto-request-progress">
        <ol className="stepper auto-request-stepper" aria-label="Progression de la demande">
          {STEP_LABELS.map((label, index) => (
            <li className={index < step ? "done" : index === step ? "active" : ""} aria-current={index === step ? "step" : undefined} key={label}>
              <span>{index < step ? <Check size={15} /> : index + 1}</span><small>{label}</small>
            </li>
          ))}
        </ol>
        <p className="auto-request-progress-copy">Étape {step + 1} sur {STEP_LABELS.length} <span>·</span> <strong>{STEP_LABELS[step]}</strong></p>
      </div>

      <form className="flow-card auto-request-card" onSubmit={handleSubmit} noValidate>
        {step === 0 && (
          <section aria-labelledby="auto-request-step-title">
            <MotoStepHeading number="1" title="Parlez-nous de votre besoin" description="Que souhaitez-vous faire ?" />
            <fieldset className="auto-request-choice-grid" aria-describedby={errors["request-type"] ? "request-type-error" : undefined}>
              <legend className="sr-only">Que souhaitez-vous faire ?</legend>
              {requestOptions.map(({ value, label, help, icon: Icon }) => (
                <label className={form.requestType === value ? "selected" : ""} key={value}>
                  <input id={`request-type-${value}`} type="radio" name="request-type" value={value} checked={form.requestType === value} onChange={() => {
                    updateForm((current) => ({ ...current, requestType: value }));
                    clearError("request-type");
                  }} />
                  <span className="auto-request-choice-icon"><Icon size={21} /></span>
                  <span><strong>{label}</strong><small>{help}</small></span>
                  <CheckCircle2 className="auto-request-choice-check" size={18} aria-hidden="true" />
                </label>
              ))}
            </fieldset>
            <FieldError id="request-type-error" message={errors["request-type"]} />
            {form.requestType === "other" && <VoiceTextField className="auto-request-other" id="other-need" label="Précisez votre besoin" value={form.otherNeed} onChange={(value) => {
                updateForm((current) => ({ ...current, otherNeed: value }));
                clearError("other-need");
              }} error={errors["other-need"]} required inputProps={{ placeholder: "Décrivez votre besoin en quelques mots" }} />}
            <p className="auto-request-helper"><CircleHelp size={17} /> Ces informations permettront à votre courtier de mieux comprendre votre demande.</p>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="auto-request-step-title">
            <MotoStepHeading number="2" title="Souscripteur, assuré et conducteur" description="Le souscripteur et l’assuré correspondent au client connecté. Indiquez ensuite qui conduira la moto." />
            <div className="auto-request-parties-grid">
              <PartySummary title="Souscripteur" badge="Paie la cotisation" name={`${store.client.firstName} ${store.client.lastName}`} phone={store.client.phone} email={store.client.email} />
              <PartySummary title="Assuré" badge="Personne couverte" name={`${store.client.firstName} ${store.client.lastName}`} phone={store.client.phone} email={store.client.email} />
            </div>
            <div className="auto-request-driver-block">
              <BinaryChoice id="driver-is-subscriber" legend="Le souscripteur est-il également le conducteur ?" value={form.driver.isSubscriber} error={errors["driver-is-subscriber"]} onChange={(value) => {
                updateDriver("isSubscriber", value);
                clearError("driver-is-subscriber");
              }} required />
              {form.driver.isSubscriber === false && <div className="auto-request-driver-fields"><h3>Informations sur le conducteur</h3><div className="auto-request-form-grid">
                <VoiceTextField id="driver-last-name" label="Nom" value={form.driver.lastName} onChange={(value) => updateDriver("lastName", value)} error={errors["driver-last-name"]} required />
                <VoiceTextField id="driver-first-names" label="Prénoms" value={form.driver.firstNames} onChange={(value) => updateDriver("firstNames", value)} error={errors["driver-first-names"]} required />
                <label htmlFor="driver-birth-date"><span className="auto-request-label-text">Date de naissance <RequiredMark /></span><input id="driver-birth-date" type="date" value={form.driver.birthDate} onChange={(event) => updateDriver("birthDate", event.target.value)} aria-invalid={Boolean(errors["driver-birth-date"])} /><FieldError id="driver-birth-date-error" message={errors["driver-birth-date"]} /></label>
                <VoiceTextField id="driver-phone" label="Téléphone" value={form.driver.phone} onChange={(value) => updateDriver("phone", value)} error={errors["driver-phone"]} required inputProps={{ type: "tel" }} />
                <VoiceTextField id="driver-occupation" label="Profession" value={form.driver.occupation} onChange={(value) => updateDriver("occupation", value)} error={errors["driver-occupation"]} required />
                <VoiceTextField id="driver-licence-number" label="Numéro du permis" value={form.driver.licenceNumber} onChange={(value) => updateDriver("licenceNumber", value.toUpperCase())} error={errors["driver-licence-number"]} required />
                <VoiceTextField id="driver-licence-category" label="Catégorie du permis" value={form.driver.licenceCategory} onChange={(value) => updateDriver("licenceCategory", value.toUpperCase())} error={errors["driver-licence-category"]} required />
                <label htmlFor="driver-licence-issued-on"><span className="auto-request-label-text">Date de délivrance du permis <RequiredMark /></span><input id="driver-licence-issued-on" type="date" value={form.driver.licenceIssuedOn} onChange={(event) => updateDriver("licenceIssuedOn", event.target.value)} aria-invalid={Boolean(errors["driver-licence-issued-on"])} /><FieldError id="driver-licence-issued-on-error" message={errors["driver-licence-issued-on"]} /></label>
                <label htmlFor="driver-licence-valid-until"><span className="auto-request-label-text">Permis valable jusqu’au <RequiredMark /></span><input id="driver-licence-valid-until" type="date" value={form.driver.licenceValidUntil} onChange={(event) => updateDriver("licenceValidUntil", event.target.value)} aria-invalid={Boolean(errors["driver-licence-valid-until"])} /><FieldError id="driver-licence-valid-until-error" message={errors["driver-licence-valid-until"]} /></label>
              </div></div>}
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="auto-request-step-title">
            <MotoStepHeading number="3" title="Informations sur votre moto" description="Les caractéristiques essentielles permettent à votre courtier d’analyser correctement votre demande." />
            <div className="auto-request-form-grid">
              <VoiceTextField id="vehicle-brand" label="Marque" value={form.vehicle.brand} onChange={(value) => updateVehicle("brand", value)} error={errors["vehicle-brand"]} required inputProps={{ autoComplete: "organization" }} />
              <VoiceTextField id="vehicle-model" label="Modèle" value={form.vehicle.model} onChange={(value) => updateVehicle("model", value)} error={errors["vehicle-model"]} required />
              <label htmlFor="vehicle-year"><span className="auto-request-label-text">Année de mise en circulation <RequiredMark /></span>
                <input id="vehicle-year" type="number" inputMode="numeric" min="1950" max={new Date().getFullYear() + 1} value={form.vehicle.year} onChange={(event) => updateVehicle("year", event.target.value)} aria-invalid={Boolean(errors["vehicle-year"])} aria-describedby={errors["vehicle-year"] ? "vehicle-year-error" : undefined} />
                <FieldError id="vehicle-year-error" message={errors["vehicle-year"]} />
              </label>
              <VoiceTextField id="vehicle-registration" label="Immatriculation" value={form.vehicle.registration} onChange={(value) => updateVehicle("registration", value.toUpperCase())} error={errors["vehicle-registration"]} required inputProps={{ autoCapitalize: "characters" }} />
              <label htmlFor="vehicle-energy"><span className="auto-request-label-text">Énergie <RequiredMark /></span>
                <select id="vehicle-energy" value={form.vehicle.energy} onChange={(event) => updateVehicle("energy", event.target.value as MotoVehicleEnergy | "")} aria-invalid={Boolean(errors["vehicle-energy"])} aria-describedby={errors["vehicle-energy"] ? "vehicle-energy-error" : undefined}>
                  <option value="">Sélectionner</option><option value="petrol">Essence</option><option value="electric">Électrique</option>
                </select>
                <FieldError id="vehicle-energy-error" message={errors["vehicle-energy"]} />
              </label>
              <label htmlFor="vehicle-cylinder-capacity"><span className="auto-request-label-text">Cylindrée (cm³) <RequiredMark /></span>
                <input id="vehicle-cylinder-capacity" type="number" inputMode="numeric" min="1" step="1" value={form.vehicle.cylinderCapacity} onChange={(event) => updateVehicle("cylinderCapacity", event.target.value)} aria-invalid={Boolean(errors["vehicle-cylinder-capacity"])} aria-describedby={errors["vehicle-cylinder-capacity"] ? "vehicle-cylinder-capacity-error" : "vehicle-cylinder-capacity-help"} />
                <small className="auto-request-field-help" id="vehicle-cylinder-capacity-help">Cette information figure généralement sur la carte grise.</small>
                <FieldError id="vehicle-cylinder-capacity-error" message={errors["vehicle-cylinder-capacity"]} />
              </label>
              <label htmlFor="vehicle-seat-count"><span className="auto-request-label-text">Nombre de places <RequiredMark /></span>
                <input id="vehicle-seat-count" type="number" inputMode="numeric" min="1" step="1" value={form.vehicle.seatCount} onChange={(event) => updateVehicle("seatCount", event.target.value)} aria-invalid={Boolean(errors["vehicle-seat-count"])} />
                <FieldError id="vehicle-seat-count-error" message={errors["vehicle-seat-count"]} />
              </label>
              <VoiceTextField id="vehicle-chassis-number" label="Numéro de châssis" value={form.vehicle.chassisNumber} onChange={(value) => updateVehicle("chassisNumber", value.toUpperCase())} error={errors["vehicle-chassis-number"]} required inputProps={{ autoCapitalize: "characters" }} />
              <label htmlFor="vehicle-usage"><span className="auto-request-label-text">Usage de la moto <RequiredMark /></span>
                <select id="vehicle-usage" value={form.vehicle.usage} onChange={(event) => updateVehicle("usage", event.target.value as MotoVehicleUsage | "")} aria-invalid={Boolean(errors["vehicle-usage"])} aria-describedby={errors["vehicle-usage"] ? "vehicle-usage-error" : undefined}>
                  <option value="">Sélectionner</option><option value="cat5">CAT5 (VÉHICULES MOTORISÉS À DEUX OU TROIS ROUES)</option><option value="cat5_bis">CAT5 BIS (VÉHICULES MOTORISÉS À DEUX OU TROIS ROUES POUR LE TRANSPORT DE PASSAGERS À TITRE PAYANT)</option>
                </select>
                <FieldError id="vehicle-usage-error" message={errors["vehicle-usage"]} />
              </label>
              <label htmlFor="vehicle-estimated-value">Valeur estimée de la moto <span className="field-optional">Facultatif</span>
                <input id="vehicle-estimated-value" type="number" inputMode="numeric" min="1" value={form.vehicle.estimatedValue} onChange={(event) => updateVehicle("estimatedValue", event.target.value)} aria-invalid={Boolean(errors["vehicle-estimated-value"])} aria-describedby={errors["vehicle-estimated-value"] ? "vehicle-estimated-value-error" : undefined} placeholder="À renseigner si vous la connaissez" />
                <FieldError id="vehicle-estimated-value-error" message={errors["vehicle-estimated-value"]} />
              </label>
            </div>
            <div className="auto-request-vehicle-questions">
              <BinaryChoice id="vehicle-flammable" legend="La moto transporte-t-elle des matières inflammables ?" value={form.vehicle.carriesFlammableMaterials} error={errors["vehicle-flammable"]} onChange={(value) => { updateVehicle("carriesFlammableMaterials", value); clearError("vehicle-flammable"); }} required />
              <BinaryChoice id="vehicle-trailer" legend="La moto utilise-t-elle une remorque ?" value={form.vehicle.hasTrailer} error={errors["vehicle-trailer"]} onChange={(value) => { updateVehicle("hasTrailer", value); clearError("vehicle-trailer"); }} required />
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="auto-request-step-title">
            <MotoStepHeading number="4" title="Pour quelle période souhaitez-vous être assuré ?" description="Choisissez une durée, puis indiquez la date de prise d’effet souhaitée." />
            <fieldset className="auto-request-duration-grid" aria-describedby={errors.duration ? "duration-error" : undefined}>
              <legend>Durée souhaitée <RequiredMark /></legend>
              {DURATION_OPTIONS.map((duration) => <label className={form.coverage.durationMonths === duration ? "selected" : ""} key={duration}>
                <input id={`duration-${duration}`} type="radio" name="duration" value={duration} checked={form.coverage.durationMonths === duration} onChange={() => {
                  updateCoverage("durationMonths", duration);
                  clearError("duration");
                }} />
                <CalendarDays size={19} /><strong>{duration} mois</strong>{form.coverage.durationMonths === duration && <Check size={17} />}
              </label>)}
            </fieldset>
            <FieldError id="duration-error" message={errors.duration} />
            <div className="auto-request-date-block">
              <label htmlFor="desired-start-date"><span className="auto-request-label-text">Date souhaitée de prise d’effet <RequiredMark /></span>
                <input id="desired-start-date" type="date" value={form.coverage.desiredStartDate} disabled={form.coverage.startDateUnknown} onChange={(event) => {
                  updateCoverage("desiredStartDate", event.target.value);
                  clearError("desired-start-date");
                }} aria-invalid={Boolean(errors["desired-start-date"])} aria-describedby={errors["desired-start-date"] ? "desired-start-date-error" : undefined} />
                <FieldError id="desired-start-date-error" message={errors["desired-start-date"]} />
              </label>
              <label className="auto-request-inline-check" htmlFor="start-date-unknown"><input id="start-date-unknown" type="checkbox" checked={form.coverage.startDateUnknown} onChange={(event) => {
                updateCoverage("startDateUnknown", event.target.checked);
                clearError("desired-start-date");
              }} /> Je ne connais pas encore la date exacte</label>
            </div>
            <div className="auto-request-duration-vignette">
              <BinaryChoice id="has-vignette" legend="Avez-vous une vignette ?" value={form.hasVignette} error={errors["has-vignette"]} onChange={(value) => {
                updateForm((current) => ({ ...current, hasVignette: value }));
                clearError("has-vignette");
              }} required />
            </div>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="auto-request-step-title">
            <MotoStepHeading number="5" title="Choisissez vos garanties" description="La Responsabilité Civile et la Défense et Recours sont obligatoires. Sélectionnez ensuite les garanties complémentaires qui correspondent à votre besoin." />
            <div className="auto-request-guarantee-note"><CheckCircle2 size={19} /><div><strong>Deux garanties obligatoires incluses</strong><span>La Responsabilité Civile et la Défense et Recours sont automatiquement sélectionnées et ne peuvent pas être retirées.</span></div></div>
            <fieldset className="auto-request-guarantee-grid">
              <legend className="sr-only">Garanties souhaitées</legend>
              {guaranteeOptions.map(({ value, label, mandatory }) => {
                const selected = form.coverage.guarantees.includes(value);
                return <label className={`${selected ? "selected" : ""} ${mandatory ? "mandatory" : ""}`.trim()} key={value}>
                  <input type="checkbox" value={value} checked={selected} disabled={mandatory} onChange={() => toggleGuarantee(value)} />
                  <span className="auto-request-guarantee-check">{selected && <Check size={15} />}</span>
                  <span><strong>{label}</strong><small>{mandatory ? "Obligatoire" : "Facultative"}</small></span>
                </label>;
              })}
            </fieldset>
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="auto-request-step-title">
            <MotoStepHeading number="6" title="Vérifiez votre demande" description="Relisez les informations avant de les transmettre à votre courtier." />
            <div className="auto-request-review">
              <ReviewSection title="Votre besoin" items={[["Demande", form.requestType ? requestLabels[form.requestType] : "Non renseigné"], ...(form.requestType === "other" ? [["Précision", form.otherNeed]] as Array<[string, string]> : [])]} />
              <ReviewSection title="Souscripteur et assuré" items={[["Souscripteur", `${store.client.firstName} ${store.client.lastName}`], ["Assuré", `${store.client.firstName} ${store.client.lastName}`], ["Conducteur", form.driver.isSubscriber ? "Le souscripteur" : `${form.driver.firstNames} ${form.driver.lastName}`], ...(form.driver.isSubscriber ? [] : [["Permis", `${form.driver.licenceNumber} · catégorie ${form.driver.licenceCategory}`]] as Array<[string, string]>)]} />
              <ReviewSection title="Votre moto" items={[
                ["Moto", `${form.vehicle.brand} ${form.vehicle.model}`], ["Année", form.vehicle.year],
                ["Immatriculation", form.vehicle.registration.toUpperCase()], ["Énergie", form.vehicle.energy ? energyLabels[form.vehicle.energy] : "Non renseignée"],
                ["Cylindrée", `${form.vehicle.cylinderCapacity} cm³`], ["Nombre de places", form.vehicle.seatCount], ["Numéro de châssis", form.vehicle.chassisNumber.toUpperCase()], ["Usage", form.vehicle.usage ? usageLabels[form.vehicle.usage] : "Non renseigné"],
                ["Matières inflammables", form.vehicle.carriesFlammableMaterials ? "Oui" : "Non"], ["Remorque", form.vehicle.hasTrailer ? "Oui" : "Non"],
                ["Valeur estimée", form.vehicle.estimatedValue ? formatFcfa(Number(form.vehicle.estimatedValue)) : "Non renseignée"],
              ]} />
              <ReviewSection title="Durée et prise d’effet" items={[["Durée", `${form.coverage.durationMonths} mois`], ["Prise d’effet", form.coverage.startDateUnknown ? "Date à confirmer" : formatDate(form.coverage.desiredStartDate)]]} />
              <ReviewSection title="Garanties choisies" items={[["Obligatoires", `${guaranteeLabels.civil_liability} · ${guaranteeLabels.defense_and_recours}`], ["Complémentaires", form.coverage.guarantees.filter((item) => item !== "civil_liability" && item !== "defense_and_recours").map((item) => guaranteeLabels[item]).join(" · ") || "Aucune garantie complémentaire"]]} />
              <ReviewSection title="Vignette" items={[["Le client possède une vignette", form.hasVignette ? "Oui" : "Non"]]} />
            </div>
            <div className="auto-request-doc-note"><FileText size={20} /><div><strong>Documents à fournir ultérieurement</strong><p>Certains documents pourront être demandés ultérieurement pour finaliser votre dossier. Vous pourrez les déposer dans le module Documents de votre espace client.</p></div></div>
          </section>
        )}

        {Object.keys(errors).length > 0 && <div className="form-alert error auto-request-error-summary" role="alert"><CircleAlert size={18} /><span>Vérifiez les champs signalés avant de continuer.</span></div>}
        <div className="auto-request-save"><Save size={15} /><span>Brouillon enregistré automatiquement pendant cette session</span></div>
        <div className="flow-actions auto-request-actions">
          {step > 0 && <button className="button button-secondary" type="button" onClick={goToPreviousStep}><ChevronLeft size={18} /> Précédent</button>}
          <button className="button button-primary" type="submit">{step === STEP_LABELS.length - 1 ? "Envoyer ma demande" : "Continuer"}{step < STEP_LABELS.length - 1 && <ChevronRight size={18} />}</button>
        </div>
      </form>
    </div>
  );
}

function MotoStepHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <header className="flow-heading auto-request-heading"><span>{number}</span><div><small>Étape {number} sur {STEP_LABELS.length}</small><h2 id="auto-request-step-title" tabIndex={-1}>{title}</h2><p>{description}</p></div></header>;
}

interface SpeechRecognitionResultEventLike {
  results: ArrayLike<{ 0?: { transcript?: string } }>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type VoiceEnabledWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function appendDictation(current: string, transcript: string) {
  const normalized = transcript.trim();
  if (!normalized) return current;
  return current.trim() ? `${current.trimEnd()} ${normalized}` : normalized;
}

function VoiceDictationButton({ fieldLabel, onTranscript }: { fieldLabel: string; onTranscript: (transcript: string) => void }) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    recognitionRef.current?.abort();
  }, []);

  const toggleListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      setMessage("Écoute arrêtée.");
      return;
    }

    const speechWindow = window as VoiceEnabledWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage("La dictée vocale n’est pas disponible dans ce navigateur.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ").trim();
      if (transcript) onTranscript(transcript);
      setMessage(transcript ? "Texte ajouté." : "Aucune parole reconnue.");
    };
    recognition.onerror = (event) => {
      const permissionDenied = event.error === "not-allowed" || event.error === "service-not-allowed";
      setMessage(permissionDenied ? "Autorisation du microphone refusée." : "La dictée n’a pas pu être effectuée.");
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);
    setMessage("Écoute en cours…");
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setMessage("Impossible de démarrer la dictée vocale.");
    }
  };

  return <div className="auto-request-voice-action">
    <button className={listening ? "listening" : ""} type="button" onClick={toggleListening} aria-pressed={listening} aria-label={`${listening ? "Arrêter la dictée" : "Dicter"} — ${fieldLabel}`} title={`${listening ? "Arrêter la dictée" : "Dicter"} pour ${fieldLabel}`}>
      {listening ? <Square size={15} fill="currentColor" /> : <Mic size={17} />}<span>{listening ? "Arrêter" : "Dicter"}</span>
    </button>
    {message && <small className={listening ? "listening" : ""} aria-live="polite">{message}</small>}
  </div>;
}

interface VoiceTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange">;
}

function VoiceTextField({ id, label, value, onChange, error, required, optional, className = "", inputProps }: VoiceTextFieldProps) {
  return <div className={`auto-request-field ${className}`.trim()}>
    <label htmlFor={id}><span className="auto-request-label-text">{label}{required && <RequiredMark />}</span>{optional && <span className="field-optional">Facultatif</span>}</label>
    <div className="auto-request-voice-shell">
      <input {...inputProps} id={id} value={value} onChange={(event) => onChange(event.target.value)} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      <VoiceDictationButton fieldLabel={label} onTranscript={(transcript) => onChange(appendDictation(value, transcript))} />
    </div>
    <FieldError id={`${id}-error`} message={error} />
  </div>;
}

function VoiceTextarea({ id, label, value, onChange, error, required, optional, placeholder, rows = 5 }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; required?: boolean; optional?: boolean; placeholder?: string; rows?: number }) {
  return <div className="auto-request-field auto-request-voice-textarea">
    <label htmlFor={id}><span className="auto-request-label-text">{label}{required && <RequiredMark />}</span>{optional && <span className="field-optional">Facultatif</span>}</label>
    <div className="auto-request-voice-shell">
      <textarea id={id} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      <VoiceDictationButton fieldLabel={label} onTranscript={(transcript) => onChange(appendDictation(value, transcript))} />
    </div>
    <FieldError id={`${id}-error`} message={error} />
  </div>;
}

function RequiredMark() {
  return <><span className="auto-request-required" aria-hidden="true">*</span><span className="sr-only"> obligatoire</span></>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <small className="auto-request-field-error" id={id}><CircleAlert size={13} /> {message}</small> : null;
}

function BinaryChoice({ id, legend, value, error, onChange, required = false }: { id: string; legend: string; value: boolean | null; error?: string; onChange: (value: boolean) => void; required?: boolean }) {
  return <fieldset className="auto-request-binary" aria-describedby={error ? `${id}-error` : undefined}>
    <legend>{legend}{required && <RequiredMark />}</legend>
    <div>
      <label className={value === true ? "selected" : ""}><input id={`${id}-yes`} type="radio" name={id} checked={value === true} onChange={() => onChange(true)} /><span>Oui</span>{value === true && <Check size={16} />}</label>
      <label className={value === false ? "selected" : ""}><input id={`${id}-no`} type="radio" name={id} checked={value === false} onChange={() => onChange(false)} /><span>Non</span>{value === false && <Check size={16} />}</label>
    </div>
    <FieldError id={`${id}-error`} message={error} />
  </fieldset>;
}

function PartySummary({ title, badge, name, phone, email }: { title: string; badge: string; name: string; phone: string; email: string }) {
  return <article className="auto-request-party-card"><header><strong>{title}</strong><span>{badge}</span></header><h3>{name}</h3><p>{phone}</p><p>{email}</p><small>Informations issues du profil client</small></article>;
}

function ReviewSection({ title, items }: { title: string; items: Array<[string, string]> }) {
  return <section><h3>{title}</h3>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>;
}
