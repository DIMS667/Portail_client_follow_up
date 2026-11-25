import { useState, type FormEvent } from "react";
import { usePortal } from "../app/portal-context";
import { mettreAJourMonCompte } from "../services/authentication-api";
import { PageHeader } from "./portal-ui";

export function RequestContactDetails() {
  const { store, updateStore, navigate } = usePortal();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\d{8,15}$/.test(phone.replace(/\D/g, ""))) {
      setError("Indiquez un numéro de téléphone valide, entre 8 et 15 chiffres.");
      return;
    }
    setSaving(true);
    try {
      const account = await mettreAJourMonCompte({
        nomComplet: `${store.client.firstName} ${store.client.lastName}`.trim(),
        numeroTelephone: phone, adresse: store.client.address, ville: store.client.city,
        preferences: store.client.preferences,
      });
      updateStore(current => ({ ...current, client: { ...current.client, phone: account.numero_telephone } }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le numéro n’a pas pu être enregistré.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="page-stack">
    <PageHeader eyebrow="Votre demande d’assurance" title="Comment pouvons-nous vous joindre ?" description="Ajoutez un numéro de contact pour que votre gestionnaire puisse vous accompagner dans votre demande." />
    <form className="panel form-stack max-w-xl" onSubmit={submit}>
      {error && <div className="form-alert error" role="alert">{error}</div>}
      <label>Numéro de contact<input type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} maxLength={32} required /></label>
      <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Continuer ma demande"}</button>
      <button className="button button-secondary" type="button" onClick={() => navigate("/espace")}>Retour à mon espace</button>
    </form>
  </div>;
}
