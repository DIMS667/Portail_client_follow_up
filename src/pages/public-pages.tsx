import { useCallback, useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { usePortal } from "../app/portal-context";
import { BrandLogo } from "../components/brand-logo";
import { GoogleSignInButton } from "../components/google-sign-in-button";
import { localStoragePortalRepository } from "../repositories/portal-repository";
import {
  appliquerCompteAuthentifie,
  connecterParEmail,
  connecterParGoogle,
  demanderOtpMotDePasse,
  ErreurApi,
  inscrireParEmail,
  reinitialiserMotDePasse,
  verifierInscription,
  type CompteClientAuthentifie,
} from "../services/authentication-api";

function AuthFrame({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  const { navigate } = usePortal();
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <button type="button" className="auth-logo-button" onClick={() => navigate("/")} aria-label="FOLLOW-UP INSURANCE, accueil"><BrandLogo className="w-[245px]" /></button>
        <div className="auth-promise"><span className="eyebrow light"><span /> Votre protection, notre suivi</span><h1>L’assurance qui vous accompagne à chaque étape.</h1><p>Suivez vos demandes, comparez les propositions et échangez avec votre conseiller FOLLOW-UP INSURANCE depuis un espace simple et sécurisé.</p><div className="auth-trust"><span><CheckCircle2 size={18} /> Accompagnement personnalisé</span><span><CheckCircle2 size={18} /> Démarches centralisées</span></div></div>
      </div>
      <main className="auth-main"><div className="auth-card"><div className="auth-title"><span className="auth-icon"><LockKeyhole size={22} /></span><h2>{title}</h2><p>{intro}</p></div>{children}</div></main>
    </div>
  );
}

function useTerminerAuthentification() {
  const { store, updateStore, navigate, query } = usePortal();
  return useCallback((compte: CompteClientAuthentifie) => {
    const next = appliquerCompteAuthentifie(store, compte);
    updateStore(next);
    localStoragePortalRepository.save(next);
    if (import.meta.env.DEV) {
      navigate("/espace");
      return;
    }
    const requestedReturn = query.get("retour");
    const destination = requestedReturn?.startsWith("/portail-client/") ? requestedReturn : "/portail-client/";
    window.location.assign(destination);
  }, [navigate, query, store, updateStore]);
}

function messageErreur(error: unknown) {
  if (error instanceof ErreurApi && error.statut === 401) return "Adresse email ou mot de passe incorrect.";
  return error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
}

function SeparateurGoogle() {
  return <div className="auth-divider" aria-hidden="true"><span>ou</span></div>;
}

function BoutonEnvoi({ loading, disabled = false, children }: { loading: boolean; disabled?: boolean; children: React.ReactNode }) {
  return <button className="button button-primary full" type="submit" disabled={loading || disabled}>{loading && <LoaderCircle className="button-spinner" size={18} />}{children}</button>;
}

function TelephoneGoogle({ jeton, onSuccess, onCancel }: { jeton: string; onSuccess: (compte: CompteClientAuthentifie) => void; onCancel: () => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const resultat = await connecterParGoogle(jeton, phone);
      if (resultat.statut === "connecte") onSuccess(resultat.compte);
      else setError(resultat.message);
    } catch (caught) {
      setError(messageErreur(caught));
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="form-alert info">Votre compte Google est reconnu. Ajoutez votre numéro de téléphone pour terminer la création du compte.</div>
      {error && <div className="form-alert error" role="alert">{error}</div>}
      <label>Numéro de téléphone<input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" placeholder="+237 6 90 00 00 00" required /></label>
      <BoutonEnvoi loading={loading}>Terminer la création</BoutonEnvoi>
      <button className="link-inline" type="button" onClick={onCancel}>Utiliser une autre méthode</button>
    </form>
  );
}

export function LoginPage() {
  const { navigate } = usePortal();
  const terminer = useTerminerAuthentification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleToken, setGoogleToken] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const resultat = await connecterParEmail(email, password);
      terminer(resultat.compte);
    } catch (caught) {
      setError(messageErreur(caught));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useCallback(async (credential: string) => {
    setError(""); setLoading(true);
    try {
      const resultat = await connecterParGoogle(credential);
      if (resultat.statut === "telephone_requis") setGoogleToken(credential);
      else terminer(resultat.compte);
    } catch (caught) {
      setError(messageErreur(caught));
    } finally {
      setLoading(false);
    }
  }, [terminer]);

  return (
    <AuthFrame title="Heureux de vous revoir" intro="Connectez-vous pour suivre vos assurances.">
      {googleToken ? <TelephoneGoogle jeton={googleToken} onSuccess={terminer} onCancel={() => setGoogleToken("")} /> : <>
        <GoogleSignInButton onCredential={handleGoogle} disabled={loading} />
        <SeparateurGoogle />
        <form className="form-stack" onSubmit={submit}>
          {error && <div className="form-alert error" role="alert">{error}</div>}
          <label>Adresse email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
          <label>Mot de passe<span className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          <button className="link-inline align-right" type="button" onClick={() => navigate("/mot-de-passe-oublie")}>Mot de passe oublié ?</button>
          <BoutonEnvoi loading={loading}>Se connecter</BoutonEnvoi>
        </form>
        <p className="auth-switch">Pas encore de compte ? <button type="button" onClick={() => navigate("/inscription")}>Créer un compte</button></p>
      </>}
    </AuthFrame>
  );
}

export function RegisterPage() {
  const { navigate } = usePortal();
  const terminer = useTerminerAuthentification();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [googleToken, setGoogleToken] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    if (!accepted) return setError("Veuillez accepter les conditions d’utilisation et la politique de confidentialité.");
    setError(""); setLoading(true);
    try {
      const email = String(data.get("email") || "");
      await inscrireParEmail({ nom_complet: String(data.get("fullName") || ""), adresse_email: email, numero_telephone: String(data.get("phone") || ""), mot_de_passe: password, confirmation_mot_de_passe: confirm });
      setPendingEmail(email);
    } catch (caught) {
      setError(messageErreur(caught));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const resultat = await verifierInscription(pendingEmail, otp);
      terminer(resultat.compte);
    } catch (caught) {
      setError(messageErreur(caught));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useCallback(async (credential: string) => {
    setError(""); setLoading(true);
    try {
      const resultat = await connecterParGoogle(credential);
      if (resultat.statut === "telephone_requis") setGoogleToken(credential);
      else terminer(resultat.compte);
    } catch (caught) {
      setError(messageErreur(caught));
    } finally {
      setLoading(false);
    }
  }, [terminer]);

  return (
    <AuthFrame title={pendingEmail ? "Vérifiez votre adresse" : "Créer mon compte"} intro={pendingEmail ? `Un code à 6 chiffres a été envoyé à ${pendingEmail}.` : "Créez votre accès sécurisé en quelques instants."}>
      {pendingEmail ? <form className="form-stack" onSubmit={verify}>
        {error && <div className="form-alert error" role="alert">{error}</div>}
        <label>Code de vérification<input className="otp-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" placeholder="000000" required /></label>
        <p className="field-hint">Le code expire après 10 minutes et ne peut être utilisé qu’une fois.</p>
        <BoutonEnvoi loading={loading}>Valider mon compte</BoutonEnvoi>
        <button className="link-inline" type="button" onClick={() => { setPendingEmail(""); setOtp(""); setError(""); }}>Modifier mes informations</button>
      </form> : googleToken ? <TelephoneGoogle jeton={googleToken} onSuccess={terminer} onCancel={() => setGoogleToken("")} /> : <>
        <GoogleSignInButton onCredential={handleGoogle} disabled={loading} />
        <SeparateurGoogle />
        <form className="form-stack" onSubmit={submit}>
          {error && <div className="form-alert error" role="alert">{error}</div>}
          <label>Nom complet<input name="fullName" autoComplete="name" required /></label>
          <label>Adresse email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Numéro de téléphone<input name="phone" type="tel" autoComplete="tel" placeholder="+237 6 90 00 00 00" required /></label>
          <div className="form-grid"><label>Mot de passe<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><label>Confirmation<input name="confirm" type="password" autoComplete="new-password" minLength={10} required /></label></div>
          <p className="field-hint">Utilisez au moins 10 caractères.</p>
          <label className="check-row"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>J’accepte les conditions d’utilisation et la politique de confidentialité.</span></label>
          <BoutonEnvoi loading={loading} disabled={!accepted}>Créer mon compte</BoutonEnvoi>
        </form>
        <p className="auth-switch">Déjà inscrit ? <button type="button" onClick={() => navigate("/login")}>Se connecter</button></p>
      </>}
    </AuthFrame>
  );
}

export function ForgotPasswordPage() {
  const { navigate } = usePortal();
  const [email, setEmail] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      await demanderOtpMotDePasse(email);
      setOtpRequested(true);
    } catch (caught) {
      setError(messageErreur(caught));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setError(""); setLoading(true);
    try {
      await reinitialiserMotDePasse({ adresse_email: email, code: String(data.get("otp") || ""), nouveau_mot_de_passe: password, confirmation_mot_de_passe: confirm });
      setSuccess(true);
    } catch (caught) {
      setError(messageErreur(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame title="Mot de passe oublié" intro={otpRequested ? `Saisissez le code envoyé à ${email}.` : "Recevez un code pour définir un nouveau mot de passe."}>
      {success ? <div className="success-panel"><span><CheckCircle2 size={28} /></span><h3>Mot de passe modifié</h3><p>Votre nouveau mot de passe est actif. Vous pouvez maintenant vous connecter.</p><button className="button button-primary full" type="button" onClick={() => navigate("/login")}>Retour à la connexion</button></div> : otpRequested ? <form className="form-stack" onSubmit={reset}>
        {error && <div className="form-alert error" role="alert">{error}</div>}
        <label>Code de vérification<input className="otp-input" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required /></label>
        <div className="form-grid"><label>Nouveau mot de passe<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><label>Confirmation<input name="confirm" type="password" autoComplete="new-password" minLength={10} required /></label></div>
        <p className="field-hint">Le mot de passe doit contenir au moins 10 caractères.</p>
        <BoutonEnvoi loading={loading}>Modifier mon mot de passe</BoutonEnvoi>
        <button className="link-inline" type="button" onClick={() => { setOtpRequested(false); setError(""); }}>Utiliser une autre adresse</button>
      </form> : <form className="form-stack" onSubmit={requestOtp}>
        {error && <div className="form-alert error" role="alert">{error}</div>}
        <label>Votre adresse email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
        <BoutonEnvoi loading={loading}>Recevoir mon code</BoutonEnvoi>
        <button className="link-inline" type="button" onClick={() => navigate("/login")}>Retour à la connexion</button>
      </form>}
    </AuthFrame>
  );
}
