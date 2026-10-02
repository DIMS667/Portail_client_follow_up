import { useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { BrandLogo } from "../components/brand-logo";
import { usePortal } from "../app/portal-context";
import { DEMO_CREDENTIALS } from "../data/demo-seed";
import { authenticate } from "../services/portal-service";

function AuthFrame({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  const { navigate } = usePortal();
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <button type="button" className="auth-logo-button" onClick={() => navigate("/")} aria-label="FOLLOW-UP INSURANCE, connexion"><BrandLogo className="w-[245px]" /></button>
        <div className="auth-promise"><span className="eyebrow light"><span /> Votre protection, notre suivi</span><h1>L’assurance qui vous accompagne à chaque étape.</h1><p>Suivez vos demandes, comparez les propositions et échangez avec votre conseiller FOLLOW-UP INSURANCE depuis un espace simple et sécurisé.</p><div className="auth-trust"><span><CheckCircle2 size={18} /> Accompagnement personnalisé</span><span><CheckCircle2 size={18} /> Démarches centralisées</span></div></div>
      </div>
      <main className="auth-main"><div className="auth-card"><div className="auth-title"><span className="auth-icon"><LockKeyhole size={22} /></span><h2>{title}</h2><p>{intro}</p></div>{children}</div></main>
    </div>
  );
}

export function LoginPage() {
  const { store, updateStore, navigate, query } = usePortal();
  const [identifier, setIdentifier] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = authenticate(store, identifier, password);
    if (!next) return setError("Email, téléphone ou mot de passe incorrect.");
    updateStore(next);
    navigate(query.get("retour") || "/espace");
  };
  return (
    <AuthFrame title="Heureux de vous revoir" intro="Connectez-vous pour suivre vos assurances.">
      <form className="form-stack" onSubmit={submit}>
        {error && <div className="form-alert error" role="alert">{error}</div>}
        <label>Email ou téléphone<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" required /></label>
        <label>Mot de passe<span className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
        <button className="link-inline align-right" type="button" onClick={() => navigate("/mot-de-passe-oublie")}>Mot de passe oublié ?</button>
        <button className="button button-primary full" type="submit">Se connecter</button>
      </form>
      <div className="demo-credentials"><strong>Compte de démonstration</strong><span>{DEMO_CREDENTIALS.email}</span><span>Mot de passe : {DEMO_CREDENTIALS.password}</span></div>
      <p className="auth-switch">Pas encore de compte ? <button type="button" onClick={() => navigate("/inscription")}>Créer un compte</button></p>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const { navigate } = usePortal();
  const [accepted, setAccepted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirm")) return setError("Les deux mots de passe ne correspondent pas.");
    if (!accepted) return setError("Veuillez accepter les conditions d’utilisation.");
    setError(""); setSuccess(true);
  };
  return (
    <AuthFrame title="Créer mon compte" intro="Quelques informations suffisent pour commencer.">
      {success ? <div className="success-panel"><span><CheckCircle2 size={28} /></span><h3>Votre compte de démonstration est prêt.</h3><p>Vous pouvez maintenant utiliser les identifiants de démonstration pour découvrir le portail.</p><button className="button button-primary full" onClick={() => navigate("/connexion")} type="button">Accéder à la connexion</button></div> :
        <form className="form-stack" onSubmit={submit}>
          {error && <div className="form-alert error" role="alert">{error}</div>}
          <div className="form-grid"><label>Prénom<input name="firstName" required /></label><label>Nom<input name="lastName" required /></label></div>
          <label>Téléphone<input name="phone" type="tel" required /></label><label>Email<input name="email" type="email" required /></label>
          <div className="form-grid"><label>Mot de passe<input name="password" type="password" minLength={8} required /></label><label>Confirmation<input name="confirm" type="password" minLength={8} required /></label></div>
          <label className="check-row"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>J’accepte les conditions d’utilisation et la politique de confidentialité.</span></label>
          <button className="button button-primary full" type="submit">Créer mon compte</button>
        </form>}
      <p className="auth-switch">Déjà inscrit ? <button type="button" onClick={() => navigate("/connexion")}>Se connecter</button></p>
    </AuthFrame>
  );
}

export function ForgotPasswordPage() {
  const { navigate } = usePortal();
  const [sent, setSent] = useState(false);
  return (
    <AuthFrame title="Mot de passe oublié" intro="Cette action est simulée pour la démonstration.">
      {sent ? <div className="success-panel"><span><CheckCircle2 size={28} /></span><h3>Demande enregistrée</h3><p>Dans une vraie version, des instructions seraient envoyées si ce compte existait.</p><button className="button button-primary full" type="button" onClick={() => navigate("/connexion")}>Retour à la connexion</button></div> : <form className="form-stack" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label>Votre adresse email<input type="email" required /></label><button className="button button-primary full" type="submit">Continuer</button></form>}
    </AuthFrame>
  );
}
