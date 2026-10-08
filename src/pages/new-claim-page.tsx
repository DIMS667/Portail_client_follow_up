import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Home,
  LifeBuoy,
  MapPin,
  ShieldCheck,
  Upload,
  UserRound,
  UsersRound,
} from "lucide-react";
import { usePortal } from "../app/portal-context";
import { PageHeader } from "../components/portal-ui";
import { createClaim, formatDate } from "../services/portal-service";

type Person = {
  lastName: string;
  firstNames: string;
  profession: string;
  address: string;
  phone: string;
  email: string;
};

type Driver = Person & {
  age: string;
  relationship: string;
  licenceNumber: string;
  licenceCategory: string;
  licenceIssuedOn: string;
  licenceIssuedAt: string;
  licenceValidUntil: string;
  capacityCertificateNumber: string;
  capacityCertificateIssuedOn: string;
  capacityCertificateIssuedAt: string;
  capacityCertificateValidUntil: string;
};

type Adversary = Person & {
  insurer: string;
  broker: string;
  policyNumber: string;
  registration: string;
};

type Vehicle = {
  type: string;
  brand: string;
  registration: string;
  firstRegistrationDate: string;
  technicalInspectionValidUntil: string;
  usage: string;
};

type InjuredPerson = {
  name: string;
  relationship: string;
  injuries: string;
  hospital: string;
  admissionDate: string;
};

type Witness = { name: string; address: string; phone: string };
type CircumstanceSelection = Record<string, { vehicleA: boolean; vehicleB: boolean }>;

type AutoClaimForm = {
  clientNumber: string;
  pointOfSale: string;
  policyEffectiveDate: string;
  policyExpiryDate: string;
  accidentDate: string;
  accidentTime: string;
  location: string;
  insured: Person;
  driverIsInsured: boolean;
  insuredDriver: Driver;
  adversePartyInvolved: boolean;
  adversary: Adversary;
  adversaryDriver: Driver;
  insuredVehicle: Vehicle;
  adverseVehicle: Vehicle;
  circumstances: CircumstanceSelection;
  sketchFileName: string;
  impactPointA: string;
  impactPointB: string;
  damageDescriptionA: string;
  damageDescriptionB: string;
  narrative: string;
  hasInjuries: boolean;
  injuriesInVehicle: InjuredPerson[];
  otherInjuries: InjuredPerson[];
  witnesses: Witness[];
  policeReportBy: string;
  gendarmerie: string;
  brigade: string;
  files: string[];
  attested: boolean;
};

const autoSteps = ["Contrat", "Événement", "Conducteur", "Tiers", "Circonstances", "Dommages", "Récapitulatif"];
const genericSteps = ["Contrat", "Type", "Date et lieu", "Description", "Documents", "Récapitulatif"];

const circumstances = [
  ["1", "Était à l’arrêt ou en stationnement"],
  ["2", "Quittait un stationnement"],
  ["3", "Prenait un stationnement"],
  ["4", "S’arrêtait"],
  ["5", "Avançait ou démarrait"],
  ["6", "Reculait"],
  ["7", "Doublait à gauche ou à droite"],
  ["8", "Croisait un autre véhicule"],
  ["9", "Tournait à gauche ou à droite"],
  ["10", "N’a pas respecté un signal routier"],
  ["11", "Faisait demi-tour"],
  ["12", "Ouvrait une portière"],
  ["13", "Provenait d’une route différente"],
  ["14", "Sortait d’un parking ou d’une station-service"],
] as const;

const emptyPerson = (): Person => ({ lastName: "", firstNames: "", profession: "", address: "", phone: "", email: "" });
const emptyDriver = (): Driver => ({ ...emptyPerson(), age: "", relationship: "", licenceNumber: "", licenceCategory: "", licenceIssuedOn: "", licenceIssuedAt: "", licenceValidUntil: "", capacityCertificateNumber: "", capacityCertificateIssuedOn: "", capacityCertificateIssuedAt: "", capacityCertificateValidUntil: "" });
const emptyVehicle = (): Vehicle => ({ type: "", brand: "", registration: "", firstRegistrationDate: "", technicalInspectionValidUntil: "", usage: "" });
const emptyInjury = (): InjuredPerson => ({ name: "", relationship: "", injuries: "", hospital: "", admissionDate: "" });
const emptyWitness = (): Witness => ({ name: "", address: "", phone: "" });

export function NewClaimPage() {
  const { store, updateStore, navigate } = usePortal();
  const initialContract = store.contracts.find((contract) => contract.product === "automobile") ?? store.contracts[0];
  const initialVehicle = store.requests.find((request) => request.product === "automobile" && request.vehicle)?.vehicle;
  const [contractId, setContractId] = useState(initialContract?.policyNumber ?? "");
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [generic, setGeneric] = useState({ type: "Dégât des eaux", date: "2026-10-08", location: "Douala", description: "", files: [] as string[] });
  const [auto, setAuto] = useState<AutoClaimForm>(() => ({
    clientNumber: store.client.id,
    pointOfSale: "Agence de Douala",
    policyEffectiveDate: initialContract?.effectiveDate ?? "",
    policyExpiryDate: initialContract?.expirationDate ?? "",
    accidentDate: "2026-10-08",
    accidentTime: "09:30",
    location: "Douala, Bonanjo",
    insured: {
      lastName: store.client.lastName,
      firstNames: store.client.firstName,
      profession: "Cadre commercial",
      address: `${store.client.address}, ${store.client.city}`,
      phone: store.client.phone,
      email: store.client.email,
    },
    driverIsInsured: true,
    insuredDriver: {
      lastName: store.client.lastName,
      firstNames: store.client.firstName,
      profession: "Cadre commercial",
      address: `${store.client.address}, ${store.client.city}`,
      phone: store.client.phone,
      email: store.client.email,
      age: "38",
      relationship: "Assuré",
      licenceNumber: "CMR-DL-458721",
      licenceCategory: "B",
      licenceIssuedOn: "2018-03-14",
      licenceIssuedAt: "Douala",
      licenceValidUntil: "2028-03-14",
      capacityCertificateNumber: "",
      capacityCertificateIssuedOn: "",
      capacityCertificateIssuedAt: "",
      capacityCertificateValidUntil: "",
    },
    adversePartyInvolved: true,
    adversary: { ...emptyPerson(), insurer: "", broker: "", policyNumber: "", registration: "" },
    adversaryDriver: emptyDriver(),
    insuredVehicle: {
      type: "Véhicule particulier",
      brand: initialVehicle ? `${initialVehicle.brand} ${initialVehicle.model}` : "Toyota RAV4",
      registration: initialVehicle?.registration ?? "LT 458 AA",
      firstRegistrationDate: "2022-02-18",
      technicalInspectionValidUntil: "2027-02-18",
      usage: initialVehicle?.usage ?? "Personnel",
    },
    adverseVehicle: emptyVehicle(),
    circumstances: Object.fromEntries(circumstances.map(([code]) => [code, { vehicleA: false, vehicleB: false }])),
    sketchFileName: "",
    impactPointA: "Avant droit",
    impactPointB: "",
    damageDescriptionA: "",
    damageDescriptionB: "",
    narrative: "",
    hasInjuries: false,
    injuriesInVehicle: [emptyInjury()],
    otherInjuries: [emptyInjury()],
    witnesses: [emptyWitness(), emptyWitness()],
    policeReportBy: "",
    gendarmerie: "",
    brigade: "",
    files: [],
    attested: false,
  }));

  const selectedContract = store.contracts.find((contract) => contract.policyNumber === contractId);
  const isAutomobile = selectedContract?.product === "automobile";
  const steps = isAutomobile ? autoSteps : genericSteps;

  const selectedCircumstances = useMemo(() => circumstances.flatMap(([code, label]) => {
    const selected = auto.circumstances[code];
    if (!selected) return [];
    return selected.vehicleA || selected.vehicleB ? [{ code, label, vehicleA: selected.vehicleA, vehicleB: selected.vehicleB }] : [];
  }), [auto.circumstances]);

  const chooseContract = (policyNumber: string) => {
    const contract = store.contracts.find((item) => item.policyNumber === policyNumber);
    setContractId(policyNumber);
    if (contract?.product === "automobile") {
      setAuto((current) => ({ ...current, policyEffectiveDate: contract.effectiveDate, policyExpiryDate: contract.expirationDate }));
    }
  };

  const updateAuto = <K extends keyof AutoClaimForm>(key: K, value: AutoClaimForm[K]) => setAuto((current) => ({ ...current, [key]: value }));
  const updateNested = <S extends "insured" | "insuredDriver" | "adversary" | "adversaryDriver" | "insuredVehicle" | "adverseVehicle">(
    section: S,
    field: keyof AutoClaimForm[S],
    value: string,
  ) => setAuto((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));

  const toggleCircumstance = (code: string, vehicle: "vehicleA" | "vehicleB", checked: boolean) => {
    setAuto((current) => ({
      ...current,
      circumstances: {
        ...current.circumstances,
        [code]: { ...current.circumstances[code], [vehicle]: checked },
      },
    }));
  };

  const updateInjury = (group: "injuriesInVehicle" | "otherInjuries", index: number, field: keyof InjuredPerson, value: string) => {
    setAuto((current) => ({ ...current, [group]: current[group].map((person, itemIndex) => itemIndex === index ? { ...person, [field]: value } : person) }));
  };

  const updateWitness = (index: number, field: keyof Witness, value: string) => {
    setAuto((current) => ({ ...current, witnesses: current.witnesses.map((witness, itemIndex) => itemIndex === index ? { ...witness, [field]: value } : witness) }));
  };

  const isStepValid = () => {
    if (step === 0) return Boolean(selectedContract);
    if (!isAutomobile) {
      if (step === 1) return Boolean(generic.type);
      if (step === 2) return Boolean(generic.date && generic.location.trim());
      if (step === 3) return generic.description.trim().length >= 12;
      return true;
    }
    if (step === 1) return Boolean(auto.accidentDate && auto.accidentTime && auto.location.trim() && auto.insuredVehicle.registration.trim());
    if (step === 2) return Boolean(auto.insured.lastName.trim() && auto.insured.phone.trim() && auto.insuredDriver.lastName.trim() && auto.insuredDriver.licenceNumber.trim());
    if (step === 3) return !auto.adversePartyInvolved || Boolean(auto.adversary.lastName.trim() && auto.adversary.registration.trim() && auto.adversaryDriver.lastName.trim());
    if (step === 4) return auto.narrative.trim().length >= 20;
    if (step === 5) return auto.damageDescriptionA.trim().length >= 5;
    if (step === 6) return auto.attested;
    return true;
  };

  const next = () => {
    if (!isStepValid()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((current) => Math.min(steps.length - 1, current + 1));
  };

  const previous = () => {
    setShowErrors(false);
    setStep((current) => Math.max(0, current - 1));
  };

  const submit = () => {
    if (!isStepValid() || !selectedContract) {
      setShowErrors(true);
      return;
    }

    if (!isAutomobile) {
      const result = createClaim(store, {
        contractId,
        type: generic.type,
        date: generic.date,
        location: generic.location,
        description: generic.description,
      });
      updateStore(result.store);
      setCreated(result.claim.reference);
      return;
    }

    const result = createClaim(store, {
      contractId,
      type: "Accident automobile",
      date: auto.accidentDate,
      location: auto.location,
      description: auto.narrative,
      attachments: auto.files,
      autoDeclaration: {
        clientNumber: auto.clientNumber,
        pointOfSale: auto.pointOfSale,
        policyEffectiveDate: auto.policyEffectiveDate,
        policyExpiryDate: auto.policyExpiryDate,
        accidentTime: auto.accidentTime,
        insured: auto.insured,
        insuredDriver: auto.insuredDriver,
        adversePartyInvolved: auto.adversePartyInvolved,
        adversary: auto.adversePartyInvolved ? auto.adversary : undefined,
        adversaryDriver: auto.adversePartyInvolved ? auto.adversaryDriver : undefined,
        insuredVehicle: auto.insuredVehicle,
        adverseVehicle: auto.adversePartyInvolved ? auto.adverseVehicle : undefined,
        circumstances: selectedCircumstances,
        sketchFileName: auto.sketchFileName || undefined,
        impactPointA: auto.impactPointA,
        impactPointB: auto.impactPointB,
        damageDescriptionA: auto.damageDescriptionA,
        damageDescriptionB: auto.damageDescriptionB,
        narrative: auto.narrative,
        injuriesInVehicle: auto.hasInjuries ? auto.injuriesInVehicle.filter((person) => person.name.trim()) : [],
        otherInjuries: auto.hasInjuries ? auto.otherInjuries.filter((person) => person.name.trim()) : [],
        witnesses: auto.witnesses.filter((witness) => witness.name.trim()),
        policeReportBy: auto.policeReportBy,
        gendarmerie: auto.gendarmerie,
        brigade: auto.brigade,
        attestedAt: new Date().toISOString(),
      },
    });
    updateStore(result.store);
    setCreated(result.claim.reference);
  };

  if (!store.contracts.length) {
    return <div className="page-stack"><PageHeader eyebrow="Nouvelle déclaration" title="Déclarer un sinistre" description="Aucun contrat actif n’est disponible pour cette déclaration." /><section className="panel auto-claim-empty"><ShieldCheck size={28} /><h2>Aucun contrat à sélectionner</h2><p>Contactez votre courtier afin de vérifier vos contrats.</p><button type="button" className="button button-secondary" onClick={() => navigate("/espace/messagerie")}>Contacter mon courtier</button></section></div>;
  }

  if (created) {
    return <div className="confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={38} /></span><span className="page-eyebrow">Déclaration transmise</span><h1>Votre déclaration a bien été enregistrée.</h1><p>Votre courtier vérifiera les informations et vous contactera si une pièce complémentaire est nécessaire.</p><div className="confirmation-reference"><small>Référence du sinistre</small><strong>{created}</strong><span>{isAutomobile ? "Accident automobile" : generic.type} · {contractId}</span></div><button className="button button-primary" type="button" onClick={() => navigate(`/espace/sinistres/${created}`)}>Suivre mon sinistre</button></div>;
  }

  return <div className="page-stack request-flow-page auto-claim-form" data-testid="auto-claim-form">
    <button className="back-link" type="button" onClick={() => step === 0 ? navigate("/espace/sinistres") : previous()}><ArrowLeft size={17} /> {step === 0 ? "Retour aux sinistres" : "Étape précédente"}</button>
    <PageHeader eyebrow="Nouvelle déclaration" title={isAutomobile ? "Déclarer un accident automobile" : "Déclarer un sinistre"} description={isAutomobile ? "Un parcours complet, conforme aux informations demandées par la déclaration automobile GMC." : "Transmettez les premières informations. Votre courtier vous accompagnera ensuite."} />
    <ol className={`stepper auto-claim-stepper ${isAutomobile ? "seven" : "six"}`} aria-label="Progression de la déclaration">{steps.map((name, index) => <li className={index < step ? "done" : index === step ? "active" : ""} aria-current={index === step ? "step" : undefined} key={name}><span>{index < step ? <Check size={15} /> : index + 1}</span><small>{name}</small></li>)}</ol>
    <section className="flow-card auto-claim-card">
      {step === 0 && <ContractStep contracts={store.contracts} contractId={contractId} onChange={chooseContract} />}
      {!isAutomobile && step > 0 && <GenericClaimStep step={step} generic={generic} update={(key, value) => setGeneric((current) => ({ ...current, [key]: value }))} />}
      {isAutomobile && step === 1 && <EventStep auto={auto} contractId={contractId} onAutoChange={updateAuto} onNestedChange={updateNested} />}
      {isAutomobile && step === 2 && <PeopleStep auto={auto} onAutoChange={updateAuto} onNestedChange={updateNested} />}
      {isAutomobile && step === 3 && <AdversaryStep auto={auto} onAutoChange={updateAuto} onNestedChange={updateNested} />}
      {isAutomobile && step === 4 && <CircumstancesStep auto={auto} onAutoChange={updateAuto} onToggle={toggleCircumstance} />}
      {isAutomobile && step === 5 && <DamageStep auto={auto} onAutoChange={updateAuto} onInjuryChange={updateInjury} onWitnessChange={updateWitness} />}
      {isAutomobile && step === 6 && <ReviewStep auto={auto} contractId={contractId} selectedCircumstances={selectedCircumstances} onAutoChange={updateAuto} />}

      {showErrors && <div className="form-alert error auto-claim-error" role="alert"><CircleAlert size={18} /> Complétez les champs essentiels de cette étape avant de continuer.</div>}
      <div className="flow-actions">
        {step > 0 && <button className="button button-secondary" type="button" onClick={previous}><ChevronLeft size={18} /> Précédent</button>}
        <button className="button button-primary" type="button" onClick={step === steps.length - 1 ? submit : next}>{step === steps.length - 1 ? "Envoyer ma déclaration" : "Continuer"}{step < steps.length - 1 && <ChevronRight size={18} />}</button>
      </div>
    </section>
  </div>;
}

function ContractStep({ contracts, contractId, onChange }: { contracts: ReturnType<typeof usePortal>["store"]["contracts"]; contractId: string; onChange: (value: string) => void }) {
  return <><FlowHeading number="1" icon={<ShieldCheck size={18} />} title="Choisir le contrat concerné" description="Le formulaire automobile détaillé s’affiche automatiquement pour un contrat auto." /><fieldset className="choice-list"><legend className="sr-only">Contrat</legend>{contracts.map((contract) => <label className={contractId === contract.policyNumber ? "selected" : ""} key={contract.id}><input type="radio" name="claim-contract" checked={contractId === contract.policyNumber} onChange={() => onChange(contract.policyNumber)} /><span>{contract.product === "automobile" ? <Car size={20} /> : <Home size={20} />}</span><div><strong>{contract.productLabel}</strong><small>{contract.policyNumber} · {contract.provider}</small></div>{contractId === contract.policyNumber && <CheckCircle2 size={19} />}</label>)}</fieldset></>;
}

function EventStep({ auto, contractId, onAutoChange, onNestedChange }: StepProps) {
  return <><FlowHeading number="2" icon={<MapPin size={18} />} title="Accident et véhicule assuré" description="Renseignez les références du contrat, la date, l’heure et le lieu exact de l’accident." /><div className="auto-source-note"><FileText size={20} /><div><strong>Informations déjà connues</strong><span>Les références du client et de la police sont préremplies depuis votre espace.</span></div></div><div className="auto-claim-grid three"><TextField label="N° client" value={auto.clientNumber} onChange={(value) => onAutoChange("clientNumber", value)} readOnly /><TextField label="Point de vente" value={auto.pointOfSale} onChange={(value) => onAutoChange("pointOfSale", value)} /><TextField label="N° de police" value={contractId ?? ""} onChange={() => undefined} readOnly /><TextField label="Date d’effet" value={auto.policyEffectiveDate} onChange={(value) => onAutoChange("policyEffectiveDate", value)} type="date" readOnly /><TextField label="Date de terme" value={auto.policyExpiryDate} onChange={(value) => onAutoChange("policyExpiryDate", value)} type="date" readOnly /><TextField label="Immatriculation" value={auto.insuredVehicle.registration} onChange={(value) => onNestedChange("insuredVehicle", "registration", value)} required /><TextField label="Date du sinistre" value={auto.accidentDate} onChange={(value) => onAutoChange("accidentDate", value)} type="date" required /><TextField label="Heure" value={auto.accidentTime} onChange={(value) => onAutoChange("accidentTime", value)} type="time" required /><TextField label="Lieu exact de l’accident" value={auto.location} onChange={(value) => onAutoChange("location", value)} required /></div><FormSection icon={<Car size={19} />} title="Caractéristiques du véhicule A" description="Véhicule couvert par la police sélectionnée."><VehicleFields vehicle={auto.insuredVehicle} onChange={(field, value) => onNestedChange("insuredVehicle", field, value)} /></FormSection></>;
}

function PeopleStep({ auto, onAutoChange, onNestedChange }: StepProps) {
  const syncDriver = (checked: boolean) => {
    onAutoChange("driverIsInsured", checked);
    if (checked) onAutoChange("insuredDriver", { ...auto.insuredDriver, ...auto.insured, relationship: "Assuré" });
  };
  return <><FlowHeading number="3" icon={<UserRound size={18} />} title="Assuré et conducteur" description="Vérifiez l’identité de l’assuré puis complétez les informations du conducteur." /><div className="auto-party-grid"><FormSection icon={<ShieldCheck size={19} />} title="A · Assuré" description="Titulaire du contrat automobile."><PersonFields person={auto.insured} onChange={(field, value) => onNestedChange("insured", field, value)} /></FormSection><FormSection icon={<UserRound size={19} />} title="A · Conducteur" description="Personne au volant au moment de l’accident."><label className="check-row auto-inline-check"><input type="checkbox" checked={auto.driverIsInsured} onChange={(event) => syncDriver(event.target.checked)} /><span>Le conducteur est l’assuré</span></label><DriverFields driver={auto.insuredDriver} onChange={(field, value) => onNestedChange("insuredDriver", field, value)} readOnlyIdentity={auto.driverIsInsured} /></FormSection></div></>;
}

function AdversaryStep({ auto, onAutoChange, onNestedChange }: StepProps) {
  return <><FlowHeading number="4" icon={<UsersRound size={18} />} title="Adversaire et conducteur B" description="Indiquez si un autre véhicule est impliqué, puis saisissez les informations disponibles." /><fieldset className="auto-binary-choice"><legend>Un véhicule adverse est-il impliqué ?</legend><label className={auto.adversePartyInvolved ? "selected" : ""}><input type="radio" name="adverse-party" checked={auto.adversePartyInvolved} onChange={() => onAutoChange("adversePartyInvolved", true)} /><UsersRound size={19} /><span><strong>Oui</strong><small>Je renseigne le tiers et son véhicule</small></span></label><label className={!auto.adversePartyInvolved ? "selected" : ""}><input type="radio" name="adverse-party" checked={!auto.adversePartyInvolved} onChange={() => onAutoChange("adversePartyInvolved", false)} /><Car size={19} /><span><strong>Non</strong><small>Aucun autre véhicule identifié</small></span></label></fieldset>{!auto.adversePartyInvolved ? <div className="auto-empty-state"><CheckCircle2 size={22} /><div><strong>Aucun tiers à renseigner</strong><p>Vous pourrez toujours joindre un constat ou des photos à l’étape suivante.</p></div></div> : <div className="auto-party-grid"><FormSection icon={<UsersRound size={19} />} title="B · Adversaire" description="Propriétaire ou assuré du véhicule adverse."><PersonFields person={auto.adversary} onChange={(field, value) => onNestedChange("adversary", field, value)} /><div className="auto-claim-grid"><TextField label="Compagnie d’assurance" value={auto.adversary.insurer} onChange={(value) => onNestedChange("adversary", "insurer", value)} /><TextField label="Courtier ou agence" value={auto.adversary.broker} onChange={(value) => onNestedChange("adversary", "broker", value)} /><TextField label="N° de police" value={auto.adversary.policyNumber} onChange={(value) => onNestedChange("adversary", "policyNumber", value)} /><TextField label="Immatriculation" value={auto.adversary.registration} onChange={(value) => onNestedChange("adversary", "registration", value)} required /></div></FormSection><FormSection icon={<UserRound size={19} />} title="B · Conducteur" description="Conducteur du véhicule adverse."><DriverFields driver={auto.adversaryDriver} onChange={(field, value) => onNestedChange("adversaryDriver", field, value)} compact /></FormSection><FormSection className="full" icon={<Car size={19} />} title="Caractéristiques du véhicule B" description="Complétez les informations visibles ou communiquées."><VehicleFields vehicle={auto.adverseVehicle} onChange={(field, value) => onNestedChange("adverseVehicle", field, value)} /></FormSection></div>}</>;
}

function CircumstancesStep({ auto, onAutoChange, onToggle }: { auto: AutoClaimForm; onAutoChange: <K extends keyof AutoClaimForm>(key: K, value: AutoClaimForm[K]) => void; onToggle: (code: string, vehicle: "vehicleA" | "vehicleB", checked: boolean) => void }) {
  return <><FlowHeading number="5" icon={<ClipboardCheck size={18} />} title="Circonstances et récit" description="Cochez ce qui décrit chaque véhicule puis racontez précisément le déroulement de l’accident." /><div className="circumstance-table" role="group" aria-label="Circonstances de l’accident"><div className="circumstance-head"><span>Situation au moment de l’accident</span><strong>Véhicule A</strong><strong>Véhicule B</strong></div>{circumstances.map(([code, label]) => <div className="circumstance-row" key={code}><span><em>{code}</em>{label}</span><label><input type="checkbox" checked={auto.circumstances[code]?.vehicleA ?? false} onChange={(event) => onToggle(code, "vehicleA", event.target.checked)} /><span className="sr-only">Véhicule A : {label}</span></label><label><input type="checkbox" checked={auto.circumstances[code]?.vehicleB ?? false} onChange={(event) => onToggle(code, "vehicleB", event.target.checked)} /><span className="sr-only">Véhicule B : {label}</span></label></div>)}</div><div className="auto-impact-grid"><SelectField label="Point de choc initial · véhicule A" value={auto.impactPointA} onChange={(value) => onAutoChange("impactPointA", value)} options={["Avant", "Avant droit", "Avant gauche", "Côté droit", "Côté gauche", "Arrière", "Toit / dessous"]} /><SelectField label="Point de choc initial · véhicule B" value={auto.impactPointB} onChange={(value) => onAutoChange("impactPointB", value)} options={["", "Avant", "Avant droit", "Avant gauche", "Côté droit", "Côté gauche", "Arrière", "Toit / dessous"]} /></div><label className="auto-textarea">Dites brièvement mais exactement comment l’accident est arrivé<textarea rows={7} value={auto.narrative} onChange={(event) => onAutoChange("narrative", event.target.value)} placeholder="Ex. : je circulais sur… lorsque le véhicule B…" required /></label><label className="drop-zone auto-sketch-upload"><Upload size={27} /><strong>Joindre un croquis de l’accident</strong><span>Photo ou scan du schéma — facultatif</span><input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => onAutoChange("sketchFileName", event.target.files?.[0]?.name ?? "")} /></label>{auto.sketchFileName && <p className="auto-file-chip"><FileText size={15} /> {auto.sketchFileName}</p>}</>;
}

function DamageStep({ auto, onAutoChange, onInjuryChange, onWitnessChange }: { auto: AutoClaimForm; onAutoChange: <K extends keyof AutoClaimForm>(key: K, value: AutoClaimForm[K]) => void; onInjuryChange: (group: "injuriesInVehicle" | "otherInjuries", index: number, field: keyof InjuredPerson, value: string) => void; onWitnessChange: (index: number, field: keyof Witness, value: string) => void }) {
  const addInjury = (group: "injuriesInVehicle" | "otherInjuries") => onAutoChange(group, [...auto[group], emptyInjury()]);
  return <><FlowHeading number="6" icon={<HeartPulse size={18} />} title="Dommages, blessés et témoins" description="Décrivez les dommages et ajoutez les éléments utiles au traitement du dossier." /><div className="auto-party-grid"><label className="auto-textarea">Dommages au véhicule assuré A<textarea rows={5} value={auto.damageDescriptionA} onChange={(event) => onAutoChange("damageDescriptionA", event.target.value)} placeholder="Pièces touchées, état du véhicule, possibilité de rouler…" required /></label><label className="auto-textarea">Dommages au véhicule adverse B<textarea rows={5} value={auto.damageDescriptionB} onChange={(event) => onAutoChange("damageDescriptionB", event.target.value)} placeholder="Dommages observés sur le véhicule adverse" /></label></div><fieldset className="auto-binary-choice compact"><legend>Y a-t-il des dommages corporels ?</legend><label className={auto.hasInjuries ? "selected" : ""}><input type="radio" name="injuries" checked={auto.hasInjuries} onChange={() => onAutoChange("hasInjuries", true)} /><HeartPulse size={19} /><span><strong>Oui</strong><small>Je renseigne les personnes blessées</small></span></label><label className={!auto.hasInjuries ? "selected" : ""}><input type="radio" name="injuries" checked={!auto.hasInjuries} onChange={() => onAutoChange("hasInjuries", false)} /><CheckCircle2 size={19} /><span><strong>Non</strong><small>Aucun blessé déclaré</small></span></label></fieldset>{auto.hasInjuries && <div className="auto-party-grid"><InjuryGroup title="Dans le véhicule assuré" people={auto.injuriesInVehicle} onChange={(index, field, value) => onInjuryChange("injuriesInVehicle", index, field, value)} onAdd={() => addInjury("injuriesInVehicle")} /><InjuryGroup title="Autres que dans le véhicule assuré" people={auto.otherInjuries} onChange={(index, field, value) => onInjuryChange("otherInjuries", index, field, value)} onAdd={() => addInjury("otherInjuries")} /></div>}<FormSection icon={<UsersRound size={19} />} title="Témoins de l’accident" description="Deux témoins peuvent être enregistrés."><div className="auto-witness-grid">{auto.witnesses.map((witness, index) => <div className="auto-repeat-card" key={index}><strong>Témoin {index + 1}{index === 1 && <small> facultatif</small>}</strong><TextField label="Nom et prénoms" value={witness.name} onChange={(value) => onWitnessChange(index, "name", value)} /><TextField label="Adresse" value={witness.address} onChange={(value) => onWitnessChange(index, "address", value)} /><TextField label="Téléphone" value={witness.phone} onChange={(value) => onWitnessChange(index, "phone", value)} type="tel" /></div>)}</div></FormSection><FormSection icon={<ClipboardCheck size={19} />} title="Autorités" description="Complétez cette partie uniquement si un constat officiel a été établi."><div className="auto-claim-grid three"><TextField label="Rapport de police établi par" value={auto.policeReportBy} onChange={(value) => onAutoChange("policeReportBy", value)} /><TextField label="P.V. / Gendarmerie" value={auto.gendarmerie} onChange={(value) => onAutoChange("gendarmerie", value)} /><TextField label="Brigade" value={auto.brigade} onChange={(value) => onAutoChange("brigade", value)} /></div></FormSection><label className="drop-zone"><Upload size={28} /><strong>Ajouter photos et justificatifs</strong><span>Constat, photos, permis, carte grise ou rapport — métadonnées uniquement</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => onAutoChange("files", Array.from(event.target.files || []).map((file) => file.name))} /></label>{auto.files.length > 0 && <ul className="selected-files">{auto.files.map((file) => <li key={file}><FileText size={16} /> {file}</li>)}</ul>}</>;
}

function ReviewStep({ auto, contractId, selectedCircumstances, onAutoChange }: { auto: AutoClaimForm; contractId: string; selectedCircumstances: { code: string; label: string; vehicleA: boolean; vehicleB: boolean }[]; onAutoChange: <K extends keyof AutoClaimForm>(key: K, value: AutoClaimForm[K]) => void }) {
  const injuryCount = auto.hasInjuries ? [...auto.injuriesInVehicle, ...auto.otherInjuries].filter((person) => person.name.trim()).length : 0;
  return <><FlowHeading number="7" icon={<CheckCircle2 size={18} />} title="Vérifier et déclarer" description="Relisez la synthèse avant de transmettre votre déclaration à votre courtier." /><div className="auto-review-grid"><ReviewCard title="Accident" items={[["Contrat", contractId], ["Date", safeDate(auto.accidentDate)], ["Heure", auto.accidentTime], ["Lieu", auto.location]]} /><ReviewCard title="Véhicule A" items={[["Véhicule", auto.insuredVehicle.brand], ["Immatriculation", auto.insuredVehicle.registration], ["Conducteur", `${auto.insuredDriver.firstNames} ${auto.insuredDriver.lastName}`.trim()], ["Permis", auto.insuredDriver.licenceNumber]]} /><ReviewCard title="Tiers" items={auto.adversePartyInvolved ? [["Adversaire", `${auto.adversary.firstNames} ${auto.adversary.lastName}`.trim()], ["Immatriculation", auto.adversary.registration], ["Conducteur B", `${auto.adversaryDriver.firstNames} ${auto.adversaryDriver.lastName}`.trim()], ["Assureur", auto.adversary.insurer || "Non renseigné"]] : [["Véhicule adverse", "Aucun tiers impliqué"]]} /><ReviewCard title="Circonstances" items={[["Cases cochées", selectedCircumstances.length ? selectedCircumstances.map((item) => `${item.code}${item.vehicleA ? "A" : ""}${item.vehicleB ? "B" : ""}`).join(", ") : "Aucune"], ["Point de choc A", auto.impactPointA], ["Croquis", auto.sketchFileName || "Non joint"]]} /><ReviewCard title="Dommages" items={[["Véhicule A", auto.damageDescriptionA], ["Véhicule B", auto.damageDescriptionB || "Non renseigné"], ["Blessés", String(injuryCount)]]} /><ReviewCard title="Pièces" items={[["Documents", auto.files.length ? `${auto.files.length} fichier(s)` : "Aucun fichier"], ["Témoins", String(auto.witnesses.filter((witness) => witness.name.trim()).length)], ["Autorités", auto.policeReportBy || auto.gendarmerie || "Non renseigné"]]} /></div><div className="auto-narrative-review"><strong>Votre récit</strong><p>{auto.narrative}</p></div><div className="form-alert info"><CircleAlert size={18} /> La partie « réservée au rédacteur » du document papier sera complétée par le courtier ou la compagnie. Cette démonstration ne transmet aucune donnée réelle.</div><label className="check-row auto-attestation"><input type="checkbox" checked={auto.attested} onChange={(event) => onAutoChange("attested", event.target.checked)} /><span>Je certifie que les informations fournies sont exactes et j’autorise leur utilisation pour l’instruction de ce sinistre fictif.</span></label></>;
}

function GenericClaimStep({ step, generic, update }: { step: number; generic: { type: string; date: string; location: string; description: string; files: string[] }; update: (key: string, value: string | string[]) => void }) {
  if (step === 1) return <><FlowHeading number="2" icon={<LifeBuoy size={18} />} title="Type de sinistre" description="Choisissez la situation qui correspond le mieux." /><fieldset className="choice-grid"><legend className="sr-only">Type de sinistre</legend>{["Incendie", "Dégât des eaux", "Vol", "Autre"].map((type) => <label className={generic.type === type ? "selected" : ""} key={type}><input type="radio" name="generic-claim-type" checked={generic.type === type} onChange={() => update("type", type)} /><LifeBuoy size={21} /><strong>{type}</strong></label>)}</fieldset></>;
  if (step === 2) return <><FlowHeading number="3" icon={<MapPin size={18} />} title="Date et lieu" description="Indiquez quand et où l’événement s’est produit." /><div className="form-grid"><TextField label="Date du sinistre" value={generic.date} onChange={(value) => update("date", value)} type="date" required /><TextField label="Lieu" value={generic.location} onChange={(value) => update("location", value)} required /></div></>;
  if (step === 3) return <><FlowHeading number="4" icon={<FileText size={18} />} title="Description" description="Décrivez les circonstances aussi clairement que possible." /><label>Description de l’événement<textarea rows={7} value={generic.description} onChange={(event) => update("description", event.target.value)} placeholder="Que s’est-il passé ? Quels dommages avez-vous constatés ?" /></label></>;
  if (step === 4) return <><FlowHeading number="5" icon={<Upload size={18} />} title="Photos et documents" description="Les fichiers ne seront pas réellement stockés dans cette démonstration." /><label className="drop-zone"><Upload size={28} /><strong>Sélectionner des fichiers</strong><span>Photos, constat ou justificatifs — métadonnées uniquement</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => update("files", Array.from(event.target.files || []).map((file) => file.name))} /></label>{generic.files.length > 0 && <ul className="selected-files">{generic.files.map((file) => <li key={file}><FileText size={16} /> {file}</li>)}</ul>}</>;
  return <><FlowHeading number="6" icon={<CheckCircle2 size={18} />} title="Récapitulatif" description="Vérifiez les informations avant d’envoyer votre déclaration." /><div className="auto-review-grid"><ReviewCard title="Sinistre" items={[["Type", generic.type], ["Date", safeDate(generic.date)], ["Lieu", generic.location], ["Description", generic.description]]} /><ReviewCard title="Documents" items={[["Fichiers", generic.files.length ? `${generic.files.length} fichier(s)` : "Aucun fichier"]]} /></div><div className="form-alert info"><CircleAlert size={18} /> Cette déclaration est fictive et ne sera transmise à aucune compagnie.</div></>;
}

type StepProps = {
  auto: AutoClaimForm;
  contractId?: string;
  onAutoChange: <K extends keyof AutoClaimForm>(key: K, value: AutoClaimForm[K]) => void;
  onNestedChange: <S extends "insured" | "insuredDriver" | "adversary" | "adversaryDriver" | "insuredVehicle" | "adverseVehicle">(section: S, field: keyof AutoClaimForm[S], value: string) => void;
};

function FlowHeading({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) { return <div className="flow-heading auto-flow-heading"><span>{icon}</span><div><small>Étape {number}</small><h2>{title}</h2><p>{description}</p></div></div>; }

function FormSection({ icon, title, description, className = "", children }: { icon: React.ReactNode; title: string; description: string; className?: string; children: React.ReactNode }) { return <section className={`auto-form-section ${className}`}><header><span>{icon}</span><div><h3>{title}</h3><p>{description}</p></div></header>{children}</section>; }

function TextField({ label, value, onChange, type = "text", required = false, readOnly = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; readOnly?: boolean }) { return <label>{label}{required && <small className="auto-required">Requis</small>}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} readOnly={readOnly} /></label>; }

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option || "empty"} value={option}>{option || "Non renseigné"}</option>)}</select></label>; }

function PersonFields({ person, onChange }: { person: Person; onChange: (field: keyof Person, value: string) => void }) { return <div className="auto-claim-grid"><TextField label="Nom" value={person.lastName} onChange={(value) => onChange("lastName", value)} required /><TextField label="Prénoms" value={person.firstNames} onChange={(value) => onChange("firstNames", value)} /><TextField label="Profession" value={person.profession} onChange={(value) => onChange("profession", value)} /><TextField label="Téléphone" value={person.phone} onChange={(value) => onChange("phone", value)} type="tel" /><TextField label="Adresse" value={person.address} onChange={(value) => onChange("address", value)} /><TextField label="E-mail" value={person.email} onChange={(value) => onChange("email", value)} type="email" /></div>; }

function DriverFields({ driver, onChange, readOnlyIdentity = false, compact = false }: { driver: Driver; onChange: (field: keyof Driver, value: string) => void; readOnlyIdentity?: boolean; compact?: boolean }) { return <div className="auto-claim-grid"><TextField label="Nom" value={driver.lastName} onChange={(value) => onChange("lastName", value)} readOnly={readOnlyIdentity} required /><TextField label="Prénoms" value={driver.firstNames} onChange={(value) => onChange("firstNames", value)} readOnly={readOnlyIdentity} /><TextField label="Âge" value={driver.age} onChange={(value) => onChange("age", value)} type="number" /><TextField label={compact ? "Profession" : "Qualité par rapport à l’assuré"} value={compact ? driver.profession : driver.relationship} onChange={(value) => onChange(compact ? "profession" : "relationship", value)} /><TextField label="Téléphone" value={driver.phone} onChange={(value) => onChange("phone", value)} type="tel" /><TextField label="Adresse" value={driver.address} onChange={(value) => onChange("address", value)} /><TextField label="N° de permis" value={driver.licenceNumber} onChange={(value) => onChange("licenceNumber", value)} required /><TextField label="Catégorie" value={driver.licenceCategory} onChange={(value) => onChange("licenceCategory", value)} /><TextField label="Permis délivré le" value={driver.licenceIssuedOn} onChange={(value) => onChange("licenceIssuedOn", value)} type="date" /><TextField label="Délivré à" value={driver.licenceIssuedAt} onChange={(value) => onChange("licenceIssuedAt", value)} /><TextField label="Validité du permis" value={driver.licenceValidUntil} onChange={(value) => onChange("licenceValidUntil", value)} type="date" />{!compact && <><TextField label="N° certificat de capacité" value={driver.capacityCertificateNumber} onChange={(value) => onChange("capacityCertificateNumber", value)} /><TextField label="Certificat délivré le" value={driver.capacityCertificateIssuedOn} onChange={(value) => onChange("capacityCertificateIssuedOn", value)} type="date" /><TextField label="Certificat délivré à" value={driver.capacityCertificateIssuedAt} onChange={(value) => onChange("capacityCertificateIssuedAt", value)} /><TextField label="Validité du certificat" value={driver.capacityCertificateValidUntil} onChange={(value) => onChange("capacityCertificateValidUntil", value)} type="date" /></>}</div>; }

function VehicleFields({ vehicle, onChange }: { vehicle: Vehicle; onChange: (field: keyof Vehicle, value: string) => void }) { return <div className="auto-claim-grid three"><TextField label="Type" value={vehicle.type} onChange={(value) => onChange("type", value)} /><TextField label="Marque et modèle" value={vehicle.brand} onChange={(value) => onChange("brand", value)} /><TextField label="Immatriculation" value={vehicle.registration} onChange={(value) => onChange("registration", value)} /><TextField label="1re mise en circulation" value={vehicle.firstRegistrationDate} onChange={(value) => onChange("firstRegistrationDate", value)} type="date" /><TextField label="Validité visite technique" value={vehicle.technicalInspectionValidUntil} onChange={(value) => onChange("technicalInspectionValidUntil", value)} type="date" /><TextField label="Usage au moment de l’accident" value={vehicle.usage} onChange={(value) => onChange("usage", value)} /></div>; }

function InjuryGroup({ title, people, onChange, onAdd }: { title: string; people: InjuredPerson[]; onChange: (index: number, field: keyof InjuredPerson, value: string) => void; onAdd: () => void }) { return <FormSection icon={<HeartPulse size={19} />} title={title} description="Dommages corporels déclarés.">{people.map((person, index) => <div className="auto-repeat-card" key={index}><strong>Personne {index + 1}</strong><div className="auto-claim-grid"><TextField label="Nom et prénoms" value={person.name} onChange={(value) => onChange(index, "name", value)} /><TextField label="Qualité / lien" value={person.relationship} onChange={(value) => onChange(index, "relationship", value)} /><TextField label="Description des blessures" value={person.injuries} onChange={(value) => onChange(index, "injuries", value)} /><TextField label="Lieu d’hospitalisation" value={person.hospital} onChange={(value) => onChange(index, "hospital", value)} /><TextField label="Date d’entrée" value={person.admissionDate} onChange={(value) => onChange(index, "admissionDate", value)} type="date" /></div></div>)}{people.length < 2 && <button className="button button-secondary auto-add-button" type="button" onClick={onAdd}>Ajouter une personne</button>}</FormSection>; }

function ReviewCard({ title, items }: { title: string; items: string[][] }) { return <section><h3>{title}</h3>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || "Non renseigné"}</strong></div>)}</section>; }

function safeDate(value: string) { return value ? formatDate(value) : "Non renseignée"; }
