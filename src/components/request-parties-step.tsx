import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, FileText, Mail, PencilLine, Phone, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { usePortal } from "../app/portal-context";
import { mettreAJourMonCompte } from "../services/authentication-api";
import { profileParty } from "../services/request-beneficiary";
import type { RequestBeneficiary } from "../types/domain";
import { PageHeader } from "./portal-ui";
import "./request-parties-step.css";

export function RequestPartiesStep({ onConfirm }: { onConfirm: (value: RequestBeneficiary) => void }) {
  const { store, updateStore } = usePortal();
  const [kind, setKind] = useState<"self" | "other" | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(store.client.firstName);
  const [lastName, setLastName] = useState(store.client.lastName);
  const [phone, setPhone] = useState(store.client.phone);
  const [insured, setInsured] = useState({ firstName: "", lastName: "", phone: "", email: "", address: "", city: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const profileValid = Boolean(store.client.firstName.trim() && store.client.lastName.trim() && store.client.phone.trim());
  const editingProfile = editing || !profileValid;
  const fullName = `${store.client.firstName} ${store.client.lastName}`.trim();
  const initials = `${store.client.firstName.charAt(0)}${store.client.lastName.charAt(0)}`.toUpperCase();

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !/^\d{8,15}$/.test(phone.replace(/\D/g, ""))) {
      setError("Vérifiez votre prénom, votre nom et votre numéro de contact.");
      return;
    }
    setSaving(true);
    try {
      const account = await mettreAJourMonCompte({ nomComplet: `${firstName.trim()} ${lastName.trim()}`, numeroTelephone: phone, adresse: store.client.address, ville: store.client.city, preferences: store.client.preferences });
      updateStore(current => ({ ...current, client: { ...current.client, firstName: firstName.trim(), lastName: lastName.trim(), phone: account.numero_telephone } }));
      setEditing(false);
      setConfirmed(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le profil n’a pas pu être enregistré.");
    } finally {
      setSaving(false);
    }
  };

  const confirmOther = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!insured.firstName.trim() || !insured.lastName.trim()) {
      setError("Renseignez le nom et le prénom de la personne assurée.");
      return;
    }
    if (profileValid && !editing) {
      onConfirm({ kind: "other", insured: { ...insured, firstName: insured.firstName.trim(), lastName: insured.lastName.trim() }, profileConfirmed: true });
    }
  };

  if (!kind) return (
    <div className="page-stack beneficiary-page">
      <PageHeader eyebrow="Nouvelle demande" title="Qui souhaitez-vous assurer ?" description="Choisissez la personne à couvrir. Nous adapterons la demande à votre situation." />
      <section className="beneficiary-choice-surface" aria-label="Choisir la personne assurée">
        <div className="beneficiary-choice-heading"><span><UserRound size={18} aria-hidden="true" /> Personne assurée</span><small>Première étape de votre demande</small></div>
        <div className="beneficiary-choices">
          <button className="beneficiary-option" type="button" onClick={() => setKind("self")}>
            <span className="beneficiary-option-icon"><UserRound size={28} strokeWidth={1.7} aria-hidden="true" /></span>
            <span className="beneficiary-option-copy"><strong>Je m’assure</strong><span>Une assurance pour moi, avec les informations de mon profil.</span></span>
            <span className="beneficiary-option-action">Vérifier mes informations <ArrowRight size={18} aria-hidden="true" /></span>
          </button>
          <button className="beneficiary-option beneficiary-option--other" type="button" onClick={() => setKind("other")}>
            <span className="beneficiary-option-icon"><UsersRound size={28} strokeWidth={1.7} aria-hidden="true" /></span>
            <span className="beneficiary-option-copy"><strong>J’assure une autre personne</strong><span>Une assurance pour un proche, dont je suivrai le dossier depuis mon compte.</span></span>
            <span className="beneficiary-option-action">Renseigner ses informations <ArrowRight size={18} aria-hidden="true" /></span>
          </button>
        </div>
        <p className="beneficiary-reassurance"><ShieldCheck size={18} aria-hidden="true" /><span>Vous pourrez vérifier toutes les informations avant d’envoyer votre demande.</span></p>
      </section>
    </div>
  );

  return (
    <div className="page-stack beneficiary-page">
      <button className="back-link beneficiary-back" type="button" disabled={saving} onClick={() => { setKind(null); setError(""); setConfirmed(false); setEditing(false); setFirstName(store.client.firstName); setLastName(store.client.lastName); setPhone(store.client.phone); }}><ArrowLeft size={17} aria-hidden="true" /> Changer de choix</button>
      <PageHeader eyebrow="Personne assurée" title={kind === "self" ? "Vérifiez vos informations" : "Qui est la personne à assurer ?"} description={kind === "self" ? "Votre nom et votre numéro de contact seront repris dans votre demande, sans ressaisie." : "Renseignez son identité. Vous restez le souscripteur et suivez le dossier depuis votre compte."} />
      {error && <div role="alert" className="form-alert error">{error}</div>}
      <div className={`beneficiary-details${kind === "other" ? " beneficiary-details--other" : ""}`}>
        <section className={`beneficiary-account${editingProfile ? " is-editing" : ""}`} aria-labelledby="beneficiary-account-title">
          <div className="beneficiary-section-heading">
            <span className="beneficiary-avatar" aria-hidden="true">{initials || <UserRound size={23} />}</span>
            <div><small>Votre compte</small><h2 id="beneficiary-account-title">{kind === "self" ? "Mes informations" : "Souscripteur du dossier"}</h2></div>
            {!editingProfile && <button className="beneficiary-edit" type="button" aria-label="Modifier mon profil" onClick={() => { setEditing(true); setConfirmed(false); setError(""); }}><PencilLine size={16} aria-hidden="true" /><span>Modifier mon profil</span></button>}
          </div>
          {editingProfile ? (
            <form className="beneficiary-profile-form" onSubmit={saveProfile}>
              {!profileValid && <p className="beneficiary-profile-notice">Complétez votre nom et votre téléphone pour que votre gestionnaire puisse vous contacter.</p>}
              <fieldset className="beneficiary-fields" disabled={saving}>
                <legend className="sr-only">Mes coordonnées</legend>
                <label htmlFor="beneficiary-profile-firstname"><span>Prénom(s) <span className="beneficiary-required" aria-hidden="true">*</span></span><input id="beneficiary-profile-firstname" value={firstName} onChange={event => setFirstName(event.target.value)} required maxLength={80} autoComplete="given-name" /></label>
                <label htmlFor="beneficiary-profile-lastname"><span>Nom <span className="beneficiary-required" aria-hidden="true">*</span></span><input id="beneficiary-profile-lastname" value={lastName} onChange={event => setLastName(event.target.value)} required maxLength={80} autoComplete="family-name" /></label>
                <label className="beneficiary-field-full" htmlFor="beneficiary-profile-phone"><span>Numéro de contact <span className="beneficiary-required" aria-hidden="true">*</span></span><input id="beneficiary-profile-phone" type="tel" value={phone} onChange={event => setPhone(event.target.value)} required maxLength={32} autoComplete="tel" /></label>
              </fieldset>
              <div className="beneficiary-profile-actions">
                {profileValid && <button className="button button-ghost" type="button" disabled={saving} onClick={() => { setEditing(false); setError(""); setFirstName(store.client.firstName); setLastName(store.client.lastName); setPhone(store.client.phone); }}>Annuler</button>}
                <button className="button button-primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer mon profil"}</button>
              </div>
            </form>
          ) : (
            <>
              <dl className="beneficiary-contact-details">
                <div className="beneficiary-contact-name"><dt>Nom complet</dt><dd>{fullName}</dd></div>
                <div><dt><Phone size={14} aria-hidden="true" /> Téléphone</dt><dd>{store.client.phone}</dd></div>
                <div><dt><Mail size={14} aria-hidden="true" /> E-mail</dt><dd>{store.client.email}</dd></div>
              </dl>
              {kind === "self" && <label className={`beneficiary-confirmation${confirmed ? " is-confirmed" : ""}`}><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span>Je confirme que mon nom et mon numéro de téléphone sont corrects.</span>{confirmed && <Check size={18} aria-hidden="true" />}</label>}
            </>
          )}
        </section>
        {kind === "other" && (
          <form id="insured-person" className="beneficiary-insured-form" autoComplete="off" onSubmit={confirmOther}>
            <div className="beneficiary-section-heading"><span className="beneficiary-form-icon"><UsersRound size={23} aria-hidden="true" /></span><div><small>La personne qui sera couverte</small><h2>Personne assurée</h2></div></div>
            <p className="beneficiary-form-help">Renseignez les noms tels qu’ils figurent sur sa pièce d’identité. <span>* Champs obligatoires</span></p>
            <div className="beneficiary-fields">
              {([["firstName", "Prénom(s)", "text"], ["lastName", "Nom", "text"], ["phone", "Téléphone", "tel"], ["email", "E-mail", "email"], ["address", "Adresse", "text"], ["city", "Ville", "text"]] as const).map(([field, label, type]) => {
                const required = field === "firstName" || field === "lastName";
                return <label htmlFor={`beneficiary-insured-${field}`} key={field}><span>{label} {required ? <span className="beneficiary-required" aria-hidden="true">*</span> : <small>(facultatif)</small>}</span><input id={`beneficiary-insured-${field}`} type={type} value={insured[field]} onChange={event => setInsured(current => ({ ...current, [field]: event.target.value }))} required={required} maxLength={field === "phone" ? 32 : field === "address" ? 255 : 100} /></label>;
              })}
            </div>
            <div className="beneficiary-document-note"><FileText size={21} aria-hidden="true" /><div><strong>Les justificatifs de cette personne</strong><p>Après l’envoi de la demande, déposez ses documents dans « Mes documents », en sélectionnant son dossier.</p></div></div>
          </form>
        )}
      </div>
      <div className="beneficiary-footer">
        <p><ShieldCheck size={17} aria-hidden="true" /> {kind === "self" ? "La suite : choisir votre assurance." : "Votre profil et celui de la personne assurée restent distincts."}</p>
        <button className="button button-primary" type={kind === "other" ? "submit" : "button"} form={kind === "other" ? "insured-person" : undefined} disabled={!profileValid || editing || (kind === "self" && !confirmed)} onClick={() => { if (kind === "self") onConfirm({ kind, insured: profileParty(store.client), profileConfirmed: true }); }}>Continuer ma demande <ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </div>
  );
}
