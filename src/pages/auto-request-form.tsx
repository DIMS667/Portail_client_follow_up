import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  FileText,
  RefreshCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "../components/portal-ui";
import { formatDate, formatFcfa } from "../services/portal-service";
import type {
  AutoCoverageDurationMonths,
  AutomobileInsuranceRequestData,
  AutoRequestType,
  AutoVehicleCategory,
  AutoVehicleEnergy,
  AutoVehicleUsage,
  InsuranceRequest,
} from "../types/domain";

const DRAFT_KEY = "portail-client-demo:auto-request-draft:v1";
const STEP_LABELS = ["Besoin", "Véhicule", "Durée", "Compléments", "Vérification"] as const;
const DURATION_OPTIONS = [2, 4, 6, 8, 12] as const;

const requestOptions: Array<{ value: AutoRequestType; label: string; help: string; icon: LucideIcon }> = [
  { value: "new_vehicle", label: "Assurer un nouveau véhicule", help: "Pour un véhicule récemment acquis", icon: Car },
  { value: "renewal", label: "Renouveler mon assurance", help: "Pour anticiper votre prochaine échéance", icon: RefreshCcw },
  { value: "switch_insurer", label: "Changer d’assureur", help: "Pour étudier de nouvelles solutions", icon: ShieldCheck },
  { value: "advice", label: "Obtenir un conseil", help: "Pour être guidé avant de choisir", icon: CircleHelp },
  { value: "other", label: "Autre besoin", help: "Pour une situation particulière", icon: FileText },
];

const requestLabels: Record<AutoRequestType, string> = {
  new_vehicle: "Assurer un nouveau véhicule",
  renewal: "Renouveler mon assurance",
  switch_insurer: "Changer d’assureur",
  advice: "Obtenir un conseil",
  other: "Autre besoin",
};

const energyLabels: Record<AutoVehicleEnergy, string> = { petrol: "Essence", diesel: "Diesel" };
const usageLabels: Record<AutoVehicleUsage, string> = {
  personal: "Usage personnel",
  professional: "Usage professionnel",
  transport: "Transport",
  other: "Autre",
};

interface AutoRequestFormState {
  requestType: AutoRequestType | "";
  otherNeed: string;
  vehicle: {
    category: AutoVehicleCategory;
    brand: string;
    model: string;
    year: string;
    registration: string;
    energy: AutoVehicleEnergy | "";
    fiscalPower: string;
    usage: AutoVehicleUsage | "";
    estimatedValue: string;
  };
  coverage: {
    durationMonths: AutoCoverageDurationMonths | null;
    desiredStartDate: string;
    startDateUnknown: boolean;
  };
  previousInsurance: {
    hasInsurance: boolean | null;
    insurerName: string;
    expirationDate: string;
    policyNumber: string;
  };
  wantsAdvice: boolean | null;
  comments: string;
}

interface AutoDraft {
  step: number;
  form: AutoRequestFormState;
}

const initialForm: AutoRequestFormState = {
  requestType: "renewal",
  otherNeed: "",
  vehicle: {
    category: "tourism",
    brand: "Toyota",
    model: "Corolla",
    year: "2021",
    registration: "LT-123-AB",
    energy: "petrol",
    fiscalPower: "9",
    usage: "personal",
    estimatedValue: "",
  },
  coverage: { durationMonths: 12, desiredStartDate: "2026-10-15", startDateUnknown: false },
  previousInsurance: {
    hasInsurance: true,
    insurerName: "Compagnie A",
    expirationDate: "2026-10-14",
    policyNumber: "",
  },
  wantsAdvice: true,
  comments: "",
};

function loadDraft(): AutoDraft {
  if (typeof window === "undefined") return { step: 0, form: initialForm };
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? "null") as Partial<AutoDraft> | null;
    const savedForm = saved?.form as Partial<AutoRequestFormState> | undefined;
    return {
      step: typeof saved?.step === "number" && saved.step >= 0 && saved.step < STEP_LABELS.length ? saved.step : 0,
      form: {
        ...initialForm,
        ...savedForm,
        vehicle: { ...initialForm.vehicle, ...savedForm?.vehicle },
        coverage: { ...initialForm.coverage, ...savedForm?.coverage },
        previousInsurance: { ...initialForm.previousInsurance, ...savedForm?.previousInsurance },
      },
    };
  } catch {
    return { step: 0, form: initialForm };
  }
}

function validateStep(step: number, form: AutoRequestFormState) {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!form.requestType) errors["request-type"] = "Choisissez le besoin qui correspond à votre situation.";
    if (form.requestType === "other" && !form.otherNeed.trim()) errors["other-need"] = "Précisez brièvement votre besoin.";
  }
  if (step === 1) {
    const year = Number(form.vehicle.year);
    const fiscalPower = Number(form.vehicle.fiscalPower);
    const estimatedValue = Number(form.vehicle.estimatedValue);
    const latestCoherentYear = new Date().getFullYear() + 1;
    if (!form.vehicle.brand.trim()) errors["vehicle-brand"] = "Renseignez la marque du véhicule.";
    if (!form.vehicle.model.trim()) errors["vehicle-model"] = "Renseignez le modèle du véhicule.";
    if (!Number.isInteger(year) || year < 1950 || year > latestCoherentYear) errors["vehicle-year"] = `Indiquez une année comprise entre 1950 et ${latestCoherentYear}.`;
    if (!form.vehicle.registration.trim()) errors["vehicle-registration"] = "Renseignez l’immatriculation du véhicule.";
    if (!form.vehicle.energy) errors["vehicle-energy"] = "Choisissez l’énergie du véhicule.";
    if (!Number.isInteger(fiscalPower) || fiscalPower <= 0) errors["vehicle-fiscal-power"] = "Indiquez une puissance fiscale entière et positive.";
    if (!form.vehicle.usage) errors["vehicle-usage"] = "Choisissez l’usage du véhicule.";
    if (form.vehicle.estimatedValue && (!Number.isFinite(estimatedValue) || estimatedValue <= 0)) errors["vehicle-estimated-value"] = "Indiquez une valeur positive ou laissez ce champ vide.";
  }
  if (step === 2) {
    if (!form.coverage.durationMonths || !DURATION_OPTIONS.includes(form.coverage.durationMonths)) errors.duration = "Choisissez une durée d’assurance.";
    if (!form.coverage.startDateUnknown && !form.coverage.desiredStartDate) errors["desired-start-date"] = "Choisissez une date de prise d’effet ou indiquez que vous ne la connaissez pas encore.";
  }
  if (step === 3) {
    if (form.previousInsurance.hasInsurance === null) errors["previous-insurance"] = "Indiquez si ce véhicule est déjà assuré.";
    if (form.previousInsurance.hasInsurance) {
      if (!form.previousInsurance.insurerName.trim()) errors["insurer-name"] = "Renseignez le nom de l’assureur actuel.";
      if (!form.previousInsurance.expirationDate) errors["expiration-date"] = "Renseignez la date d’expiration du contrat actuel.";
    }
    if (form.wantsAdvice === null) errors["wants-advice"] = "Indiquez si vous souhaitez être conseillé.";
  }
  return errors;
}

const focusTargets: Record<string, string> = {
  "request-type": "request-type-new_vehicle",
  duration: "duration-2",
  "previous-insurance": "previous-insurance-yes",
  "wants-advice": "wants-advice-yes",
};

export function AutoRequestForm({ onBack, onSubmit }: { onBack: () => void; onSubmit: (data: Partial<InsuranceRequest>) => void }) {
  const [draft, setDraft] = useState<AutoDraft>(loadDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { step, form } = draft;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // The form still works when browser storage is unavailable.
    }
  }, [draft]);

  const updateForm = (updater: (current: AutoRequestFormState) => AutoRequestFormState) => {
    setDraft((current) => ({ ...current, form: updater(current.form) }));
  };
  const clearError = (key: string) => setErrors((current) => {
    if (!current[key]) return current;
    const next = { ...current };
    delete next[key];
    return next;
  });
  const updateVehicle = <K extends keyof AutoRequestFormState["vehicle"]>(key: K, value: AutoRequestFormState["vehicle"][K]) => {
    updateForm((current) => ({ ...current, vehicle: { ...current.vehicle, [key]: value } }));
    clearError(`vehicle-${key === "fiscalPower" ? "fiscal-power" : key === "estimatedValue" ? "estimated-value" : key}`);
  };
  const updateCoverage = <K extends keyof AutoRequestFormState["coverage"]>(key: K, value: AutoRequestFormState["coverage"][K]) => {
    updateForm((current) => ({ ...current, coverage: { ...current.coverage, [key]: value } }));
  };
  const updatePreviousInsurance = <K extends keyof AutoRequestFormState["previousInsurance"]>(key: K, value: AutoRequestFormState["previousInsurance"][K]) => {
    updateForm((current) => ({ ...current, previousInsurance: { ...current.previousInsurance, [key]: value } }));
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
  const handleTopBack = () => step === 0 ? onBack() : goToPreviousStep();

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

    const automobileRequest: AutomobileInsuranceRequestData = {
      requestType: form.requestType as AutoRequestType,
      ...(form.requestType === "other" ? { otherNeed: form.otherNeed.trim() } : {}),
      vehicle: {
        category: form.vehicle.category,
        brand: form.vehicle.brand.trim(),
        model: form.vehicle.model.trim(),
        year: Number(form.vehicle.year),
        registration: form.vehicle.registration.trim().toUpperCase(),
        energy: form.vehicle.energy as AutoVehicleEnergy,
        fiscalPower: Number(form.vehicle.fiscalPower),
        usage: form.vehicle.usage as AutoVehicleUsage,
        estimatedValue: form.vehicle.estimatedValue ? Number(form.vehicle.estimatedValue) : null,
      },
      coverage: {
        durationMonths: form.coverage.durationMonths as AutoCoverageDurationMonths,
        desiredStartDate: form.coverage.startDateUnknown ? null : form.coverage.desiredStartDate,
        ...(form.coverage.startDateUnknown ? { startDateUnknown: true } : {}),
      },
      previousInsurance: {
        hasInsurance: Boolean(form.previousInsurance.hasInsurance),
        insurerName: form.previousInsurance.hasInsurance ? form.previousInsurance.insurerName.trim() : null,
        expirationDate: form.previousInsurance.hasInsurance ? form.previousInsurance.expirationDate : null,
        policyNumber: form.previousInsurance.hasInsurance && form.previousInsurance.policyNumber.trim() ? form.previousInsurance.policyNumber.trim() : null,
      },
      wantsAdvice: Boolean(form.wantsAdvice),
      comments: form.comments.trim(),
    };

    try {
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clean up when browser storage is unavailable.
    }

    onSubmit({
      product: "automobile",
      productLabel: "Assurance automobile",
      automobileRequest,
      vehicle: {
        brand: automobileRequest.vehicle.brand,
        model: automobileRequest.vehicle.model,
        year: String(automobileRequest.vehicle.year),
        registration: automobileRequest.vehicle.registration,
        value: automobileRequest.vehicle.estimatedValue,
        usage: usageLabels[automobileRequest.vehicle.usage],
      },
      desiredStartDate: automobileRequest.coverage.desiredStartDate ?? undefined,
      comments: automobileRequest.comments || undefined,
    });
  };

  return (
    <div className="page-stack request-flow-page auto-request-page">
      <button className="back-link" type="button" onClick={handleTopBack}><ArrowLeft size={17} /> {step === 0 ? "Changer d’assurance" : "Étape précédente"}</button>
      <PageHeader eyebrow="Assurance automobile" title="Votre demande en quelques étapes" description="Transmettez les informations utiles à votre courtier. Il analysera ensuite votre besoin et préparera les propositions adaptées." />

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
            <AutoStepHeading number="1" title="Parlez-nous de votre besoin" description="Que souhaitez-vous faire ?" />
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
            {form.requestType === "other" && <label className="auto-request-other" htmlFor="other-need">Précisez votre besoin
              <input id="other-need" value={form.otherNeed} onChange={(event) => {
                updateForm((current) => ({ ...current, otherNeed: event.target.value }));
                clearError("other-need");
              }} aria-invalid={Boolean(errors["other-need"])} aria-describedby={errors["other-need"] ? "other-need-error" : undefined} placeholder="Décrivez votre besoin en quelques mots" />
              <FieldError id="other-need-error" message={errors["other-need"]} />
            </label>}
            <p className="auto-request-helper"><CircleHelp size={17} /> Ces informations permettront à votre courtier de mieux comprendre votre demande.</p>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="auto-request-step-title">
            <AutoStepHeading number="2" title="Informations sur votre véhicule" description="Les caractéristiques essentielles permettent à votre courtier d’analyser correctement votre demande." />
            <div className="auto-request-form-grid">
              <label htmlFor="vehicle-category">Type de véhicule
                <select id="vehicle-category" value={form.vehicle.category} onChange={(event) => updateVehicle("category", event.target.value as AutoVehicleCategory)}><option value="tourism">Véhicule de tourisme</option></select>
                <small className="auto-request-field-help">D’autres catégories pourront être ajoutées ultérieurement.</small>
              </label>
              <label htmlFor="vehicle-brand">Marque <RequiredMark />
                <input id="vehicle-brand" value={form.vehicle.brand} onChange={(event) => updateVehicle("brand", event.target.value)} aria-invalid={Boolean(errors["vehicle-brand"])} aria-describedby={errors["vehicle-brand"] ? "vehicle-brand-error" : undefined} autoComplete="organization" />
                <FieldError id="vehicle-brand-error" message={errors["vehicle-brand"]} />
              </label>
              <label htmlFor="vehicle-model">Modèle <RequiredMark />
                <input id="vehicle-model" value={form.vehicle.model} onChange={(event) => updateVehicle("model", event.target.value)} aria-invalid={Boolean(errors["vehicle-model"])} aria-describedby={errors["vehicle-model"] ? "vehicle-model-error" : undefined} />
                <FieldError id="vehicle-model-error" message={errors["vehicle-model"]} />
              </label>
              <label htmlFor="vehicle-year">Année de mise en circulation <RequiredMark />
                <input id="vehicle-year" type="number" inputMode="numeric" min="1950" max={new Date().getFullYear() + 1} value={form.vehicle.year} onChange={(event) => updateVehicle("year", event.target.value)} aria-invalid={Boolean(errors["vehicle-year"])} aria-describedby={errors["vehicle-year"] ? "vehicle-year-error" : undefined} />
                <FieldError id="vehicle-year-error" message={errors["vehicle-year"]} />
              </label>
              <label htmlFor="vehicle-registration">Immatriculation <RequiredMark />
                <input id="vehicle-registration" value={form.vehicle.registration} onChange={(event) => updateVehicle("registration", event.target.value.toUpperCase())} aria-invalid={Boolean(errors["vehicle-registration"])} aria-describedby={errors["vehicle-registration"] ? "vehicle-registration-error" : undefined} autoCapitalize="characters" />
                <FieldError id="vehicle-registration-error" message={errors["vehicle-registration"]} />
              </label>
              <label htmlFor="vehicle-energy">Énergie <RequiredMark />
                <select id="vehicle-energy" value={form.vehicle.energy} onChange={(event) => updateVehicle("energy", event.target.value as AutoVehicleEnergy | "")} aria-invalid={Boolean(errors["vehicle-energy"])} aria-describedby={errors["vehicle-energy"] ? "vehicle-energy-error" : undefined}>
                  <option value="">Sélectionner</option><option value="petrol">Essence</option><option value="diesel">Diesel</option>
                </select>
                <FieldError id="vehicle-energy-error" message={errors["vehicle-energy"]} />
              </label>
              <label htmlFor="vehicle-fiscal-power">Puissance fiscale (CV) <RequiredMark />
                <input id="vehicle-fiscal-power" type="number" inputMode="numeric" min="1" step="1" value={form.vehicle.fiscalPower} onChange={(event) => updateVehicle("fiscalPower", event.target.value)} aria-invalid={Boolean(errors["vehicle-fiscal-power"])} aria-describedby={errors["vehicle-fiscal-power"] ? "vehicle-fiscal-power-error" : "vehicle-fiscal-power-help"} />
                <small className="auto-request-field-help" id="vehicle-fiscal-power-help">Cette information figure généralement sur la carte grise.</small>
                <FieldError id="vehicle-fiscal-power-error" message={errors["vehicle-fiscal-power"]} />
              </label>
              <label htmlFor="vehicle-usage">Usage du véhicule <RequiredMark />
                <select id="vehicle-usage" value={form.vehicle.usage} onChange={(event) => updateVehicle("usage", event.target.value as AutoVehicleUsage | "")} aria-invalid={Boolean(errors["vehicle-usage"])} aria-describedby={errors["vehicle-usage"] ? "vehicle-usage-error" : undefined}>
                  <option value="">Sélectionner</option><option value="personal">Usage personnel</option><option value="professional">Usage professionnel</option><option value="transport">Transport</option><option value="other">Autre</option>
                </select>
                <FieldError id="vehicle-usage-error" message={errors["vehicle-usage"]} />
              </label>
              <label htmlFor="vehicle-estimated-value">Valeur estimée du véhicule <span className="field-optional">Facultatif</span>
                <input id="vehicle-estimated-value" type="number" inputMode="numeric" min="1" value={form.vehicle.estimatedValue} onChange={(event) => updateVehicle("estimatedValue", event.target.value)} aria-invalid={Boolean(errors["vehicle-estimated-value"])} aria-describedby={errors["vehicle-estimated-value"] ? "vehicle-estimated-value-error" : undefined} placeholder="À renseigner si vous la connaissez" />
                <FieldError id="vehicle-estimated-value-error" message={errors["vehicle-estimated-value"]} />
              </label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="auto-request-step-title">
            <AutoStepHeading number="3" title="Pour quelle période souhaitez-vous être assuré ?" description="Choisissez une durée, puis indiquez la date de prise d’effet souhaitée." />
            <fieldset className="auto-request-duration-grid" aria-describedby={errors.duration ? "duration-error" : undefined}>
              <legend>Durée souhaitée</legend>
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
              <label htmlFor="desired-start-date">Date souhaitée de prise d’effet <RequiredMark />
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
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="auto-request-step-title">
            <AutoStepHeading number="4" title="Quelques informations supplémentaires" description="Ces précisions aident votre courtier à préparer la suite de votre dossier." />
            <BinaryChoice id="previous-insurance" legend="Avez-vous déjà une assurance pour ce véhicule ?" value={form.previousInsurance.hasInsurance} error={errors["previous-insurance"]} onChange={(value) => {
              updatePreviousInsurance("hasInsurance", value);
              clearError("previous-insurance");
            }} />
            {form.previousInsurance.hasInsurance && <div className="auto-request-form-grid auto-request-conditional">
              <label htmlFor="insurer-name">Nom de l’ancien assureur <RequiredMark />
                <input id="insurer-name" value={form.previousInsurance.insurerName} onChange={(event) => {
                  updatePreviousInsurance("insurerName", event.target.value);
                  clearError("insurer-name");
                }} aria-invalid={Boolean(errors["insurer-name"])} aria-describedby={errors["insurer-name"] ? "insurer-name-error" : undefined} />
                <FieldError id="insurer-name-error" message={errors["insurer-name"]} />
              </label>
              <label htmlFor="expiration-date">Date d’expiration du contrat actuel <RequiredMark />
                <input id="expiration-date" type="date" value={form.previousInsurance.expirationDate} onChange={(event) => {
                  updatePreviousInsurance("expirationDate", event.target.value);
                  clearError("expiration-date");
                }} aria-invalid={Boolean(errors["expiration-date"])} aria-describedby={errors["expiration-date"] ? "expiration-date-error" : undefined} />
                <FieldError id="expiration-date-error" message={errors["expiration-date"]} />
              </label>
              <label htmlFor="policy-number">Numéro de police actuel <span className="field-optional">Facultatif</span>
                <input id="policy-number" value={form.previousInsurance.policyNumber} onChange={(event) => updatePreviousInsurance("policyNumber", event.target.value)} />
              </label>
            </div>}
            <BinaryChoice id="wants-advice" legend="Souhaitez-vous être conseillé sur le niveau de couverture ?" value={form.wantsAdvice} error={errors["wants-advice"]} onChange={(value) => {
              updateForm((current) => ({ ...current, wantsAdvice: value }));
              clearError("wants-advice");
            }} />
            <label className="auto-request-comments" htmlFor="auto-request-comments">Informations ou précisions complémentaires <span className="field-optional">Facultatif</span>
              <textarea id="auto-request-comments" rows={5} value={form.comments} onChange={(event) => updateForm((current) => ({ ...current, comments: event.target.value }))} placeholder="Vous pouvez préciser ici toute information utile concernant votre véhicule ou votre besoin." />
            </label>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="auto-request-step-title">
            <AutoStepHeading number="5" title="Vérifiez votre demande" description="Relisez les informations avant de les transmettre à votre courtier." />
            <div className="auto-request-review">
              <ReviewSection title="Votre besoin" items={[["Demande", form.requestType ? requestLabels[form.requestType] : "Non renseigné"], ...(form.requestType === "other" ? [["Précision", form.otherNeed]] as Array<[string, string]> : [])]} />
              <ReviewSection title="Votre véhicule" items={[
                ["Type", "Véhicule de tourisme"], ["Véhicule", `${form.vehicle.brand} ${form.vehicle.model}`], ["Année", form.vehicle.year],
                ["Immatriculation", form.vehicle.registration.toUpperCase()], ["Énergie", form.vehicle.energy ? energyLabels[form.vehicle.energy] : "Non renseignée"],
                ["Puissance fiscale", `${form.vehicle.fiscalPower} CV`], ["Usage", form.vehicle.usage ? usageLabels[form.vehicle.usage] : "Non renseigné"],
                ["Valeur estimée", form.vehicle.estimatedValue ? formatFcfa(Number(form.vehicle.estimatedValue)) : "Non renseignée"],
              ]} />
              <ReviewSection title="Durée et prise d’effet" items={[["Durée", `${form.coverage.durationMonths} mois`], ["Prise d’effet", form.coverage.startDateUnknown ? "Date à confirmer" : formatDate(form.coverage.desiredStartDate)]]} />
              <ReviewSection title="Assurance actuelle" items={form.previousInsurance.hasInsurance ? [["Véhicule déjà assuré", "Oui"], ["Ancien assureur", form.previousInsurance.insurerName], ["Expiration", formatDate(form.previousInsurance.expirationDate)], ["Numéro de police", form.previousInsurance.policyNumber || "Non renseigné"]] : [["Véhicule déjà assuré", "Non"]]} />
              <ReviewSection title="Accompagnement" items={[["Conseil souhaité", form.wantsAdvice ? "Oui" : "Non"], ["Précisions", form.comments || "Aucune précision ajoutée"]]} />
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

function AutoStepHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <header className="flow-heading auto-request-heading"><span>{number}</span><div><small>Étape {number} sur 5</small><h2 id="auto-request-step-title" tabIndex={-1}>{title}</h2><p>{description}</p></div></header>;
}

function RequiredMark() {
  return <span className="auto-request-required" aria-hidden="true">Obligatoire</span>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <small className="auto-request-field-error" id={id}><CircleAlert size={13} /> {message}</small> : null;
}

function BinaryChoice({ id, legend, value, error, onChange }: { id: string; legend: string; value: boolean | null; error?: string; onChange: (value: boolean) => void }) {
  return <fieldset className="auto-request-binary" aria-describedby={error ? `${id}-error` : undefined}>
    <legend>{legend}</legend>
    <div>
      <label className={value === true ? "selected" : ""}><input id={`${id}-yes`} type="radio" name={id} checked={value === true} onChange={() => onChange(true)} /><span>Oui</span>{value === true && <Check size={16} />}</label>
      <label className={value === false ? "selected" : ""}><input id={`${id}-no`} type="radio" name={id} checked={value === false} onChange={() => onChange(false)} /><span>Non</span>{value === false && <Check size={16} />}</label>
    </div>
    <FieldError id={`${id}-error`} message={error} />
  </fieldset>;
}

function ReviewSection({ title, items }: { title: string; items: Array<[string, string]> }) {
  return <section><h3>{title}</h3>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>;
}
