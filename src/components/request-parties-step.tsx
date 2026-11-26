import { useState, type FormEvent } from "react";
import { usePortal } from "../app/portal-context";
import { mettreAJourMonCompte } from "../services/authentication-api";
import { profileParty } from "../services/request-beneficiary";
import type { RequestBeneficiary } from "../types/domain";
import { PageHeader } from "./portal-ui";

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
  const saveProfile = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!firstName.trim() || !lastName.trim() || !/^\d{8,15}$/.test(phone.replace(/\D/g, ""))) { setError("Vérifiez votre prénom, votre nom et votre numéro de contact."); return; }
    setSaving(true);
    try {
      const account = await mettreAJourMonCompte({ nomComplet: `${firstName.trim()} ${lastName.trim()}`, numeroTelephone: phone, adresse: store.client.address, ville: store.client.city, preferences: store.client.preferences });
      updateStore(current => ({ ...current, client: { ...current.client, firstName: firstName.trim(), lastName: lastName.trim(), phone: account.numero_telephone } }));
      setEditing(false); setConfirmed(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Le profil n’a pas pu être enregistré."); }
    finally { setSaving(false); }
  };
  if (!kind) return <div className="page-stack"><PageHeader eyebrow="Nouvelle demande" title="Qui souhaitez-vous assurer ?" description="Votre compte vous permet de souscrire pour vous-même ou pour une autre personne." /><div className="grid gap-4 sm:grid-cols-2">{([["self", "Je m’assure", "Utiliser les informations de mon profil."], ["other", "J’assure une autre personne", "Renseigner la personne qui sera couverte."]] as const).map(([value, title, description]) => <button className="panel text-left" type="button" key={value} onClick={() => setKind(value)}><strong>{title}</strong><p>{description}</p></button>)}</div></div>;
  return <div className="page-stack"><button className="back-link" type="button" onClick={() => setKind(null)}>Changer de choix</button><PageHeader eyebrow="Personnes concernées" title={kind === "self" ? "Vérifiez votre profil" : "Renseignez la personne à assurer"} description={kind === "self" ? "Votre nom et votre téléphone seront repris sans ressaisie dans la demande." : "Vous restez le souscripteur et suivez le dossier depuis votre compte."} />
    {error && <div role="alert" className="form-alert error">{error}</div>}
    {editing || !profileValid ? <form className="panel form-stack max-w-xl" onSubmit={saveProfile}><h2>Mon profil</h2><label>Prénom(s)<input value={firstName} onChange={event => setFirstName(event.target.value)} required maxLength={80} autoComplete="given-name" /></label><label>Nom<input value={lastName} onChange={event => setLastName(event.target.value)} required maxLength={80} autoComplete="family-name" /></label><label>Numéro de contact<input type="tel" value={phone} onChange={event => setPhone(event.target.value)} required maxLength={32} autoComplete="tel" /></label><button className="button button-primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer mon profil"}</button></form>
      : <section className="panel"><h2>{kind === "self" ? "Mes informations" : "Souscripteur du dossier"}</h2><p>{store.client.firstName} {store.client.lastName}</p><p>{store.client.phone}</p><button className="link-inline" type="button" onClick={() => setEditing(true)}>Modifier mon profil</button>{kind === "self" && <label className="check-row"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span>Je confirme que mon nom et mon numéro de téléphone sont corrects.</span></label>}</section>}
    {kind === "other" && <form id="insured-person" className="panel form-stack max-w-2xl" onSubmit={event => { event.preventDefault(); if (!insured.firstName.trim() || !insured.lastName.trim()) { setError("Renseignez le nom et le prénom de la personne assurée."); return; } if (profileValid && !editing) onConfirm({ kind, insured: { ...insured, firstName: insured.firstName.trim(), lastName: insured.lastName.trim() }, profileConfirmed: true }); }}><h2>Personne assurée</h2><div className="form-grid">{([["firstName", "Prénom(s)", "text"], ["lastName", "Nom", "text"], ["phone", "Téléphone (facultatif)", "tel"], ["email", "E-mail (facultatif)", "email"], ["address", "Adresse (facultatif)", "text"], ["city", "Ville (facultatif)", "text"]] as const).map(([field, label, type]) => <label key={field}>{label}<input type={type} value={insured[field]} onChange={event => setInsured(current => ({ ...current, [field]: event.target.value }))} required={field === "firstName" || field === "lastName"} maxLength={field === "phone" ? 32 : field === "address" ? 255 : 100} /></label>)}</div><div className="form-alert info">Après l’envoi de la demande, déposez les justificatifs de cette personne dans « Mes documents », en sélectionnant son dossier.</div></form>}
    <button className="button button-primary w-fit" type={kind === "other" ? "submit" : "button"} form={kind === "other" ? "insured-person" : undefined} disabled={!profileValid || editing || (kind === "self" && !confirmed)} onClick={() => { if (kind === "self") onConfirm({ kind, insured: profileParty(store.client), profileConfirmed: true }); }}>Continuer ma demande</button>
  </div>;
}
