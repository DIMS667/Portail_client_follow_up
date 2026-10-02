import { useState, type FormEvent } from "react";
import {
  Bike, Building2, Car, CheckCircle2, ChevronRight, Eye, EyeOff, FileCheck2,
  HeartPulse, Home, LockKeyhole, MessageCircleMore, Plane, ShieldCheck, Smartphone,
} from "lucide-react";
import { usePortal } from "../app/portal-context";
import { DEMO_CREDENTIALS } from "../data/demo-seed";
import { authenticate } from "../services/portal-service";

const categories = [
  { label: "Automobile", icon: Car }, { label: "Moto", icon: Bike }, { label: "Santé", icon: HeartPulse },
  { label: "Voyage", icon: Plane }, { label: "Habitation", icon: Home }, { label: "Entreprise", icon: Building2 },
];

function PublicHeader() {
  const { navigate } = usePortal();
  return (
    <header className="site-header">
      <button className="brand brand-button" onClick={() => navigate("/")} type="button" aria-label="Espace Client, accueil">
        <span className="brand-mark"><ShieldCheck size={22} /></span><span>Espace Client</span>
      </button>
      <nav className="header-actions" aria-label="Navigation principale">
        <button className="text-link" onClick={() => navigate("/#solutions")} type="button">Nos solutions</button>
        <button className="button button-ghost" onClick={() => navigate("/connexion")} type="button">Se connecter</button>
      </nav>
    </header>
  );
}

export function LandingPage() {
  const { navigate } = usePortal();
  const benefits = ["Plus besoin de vous déplacer", "Plusieurs propositions adaptées", "Documents accessibles en ligne", "Paiement et suivi à distance"];
  return (
    <div className="public-shell">
      <PublicHeader />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span /> Votre courtier, toujours à vos côtés</span>
            <h1>Votre assurance,<br /><em>simplement et à distance</em></h1>
            <p className="hero-lede">Demandez une assurance, recevez les propositions de votre courtier, transmettez vos documents, payez et suivez vos contrats en ligne.</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => navigate("/inscription")} type="button">Demander une assurance <ChevronRight size={18} /></button>
              <button className="button button-secondary" onClick={() => navigate("/connexion")} type="button">Se connecter</button>
            </div>
            <div className="confidence-row"><span><CheckCircle2 size={17} /> Accompagnement humain</span><span><CheckCircle2 size={17} /> Démarches sécurisées</span></div>
          </div>
          <div className="journey-visual">
            <div className="journey-topline"><div><span className="micro-label">Votre demande</span><strong>Assurance automobile</strong></div><span className="status-pill">En bonne voie</span></div>
            <div className="journey-progress"><span style={{ width: "62%" }} /></div>
            <div className="journey-steps">
              <div className="journey-step done"><span><FileCheck2 size={18} /></span><div><strong>Demande reçue</strong><small>Votre besoin a été transmis</small></div><CheckCircle2 size={19} /></div>
              <div className="journey-step current"><span><MessageCircleMore size={18} /></span><div><strong>Propositions disponibles</strong><small>3 offres comparées par votre courtier</small></div><span className="step-badge">À consulter</span></div>
              <div className="journey-step"><span><Smartphone size={18} /></span><div><strong>Choix et paiement</strong><small>La prochaine étape de votre parcours</small></div></div>
            </div>
            <div className="advisor-note"><span className="advisor-avatar">AM</span><div><small>Le conseil de votre courtier</small><p>« Je vous accompagne pour choisir la couverture la plus adaptée. »</p></div></div>
          </div>
        </section>
        <section className="solutions" id="solutions">
          <div className="section-heading"><div><span className="eyebrow"><span /> Vos besoins</span><h2>Une protection pour chaque projet</h2></div><p>Commencez votre demande en quelques minutes. Votre courtier étudie ensuite votre situation.</p></div>
          <div className="category-grid">
            {categories.map(({ label, icon: Icon }) => <button type="button" className="category-card" onClick={() => navigate("/inscription")} key={label}><span><Icon size={24} /></span><strong>Assurance {label.toLowerCase()}</strong><ChevronRight size={18} /></button>)}
          </div>
        </section>
        <section className="benefit-band"><div><span className="benefit-number">6</span><span>types d’assurance<br />accessibles en ligne</span></div><div className="benefit-list">{benefits.map((benefit) => <span key={benefit}><CheckCircle2 size={17} /> {benefit}</span>)}</div></section>
      </main>
      <footer><button type="button" className="brand brand-button" onClick={() => navigate("/")}><span className="brand-mark"><ShieldCheck size={20} /></span><span>Espace Client</span></button><p>Démonstration interactive — aucune transaction réelle.</p></footer>
    </div>
  );
}

function AuthFrame({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  const { navigate } = usePortal();
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <button type="button" className="brand brand-button auth-brand" onClick={() => navigate("/")}><span className="brand-mark"><ShieldCheck size={22} /></span><span>Espace Client</span></button>
        <div className="auth-promise"><span className="eyebrow light"><span /> Un espace pensé pour vous</span><h1>Votre courtier reste proche, même à distance.</h1><p>Suivez chaque étape, retrouvez vos documents et échangez avec votre conseiller depuis un espace simple et sécurisé.</p><div className="auth-trust"><span><CheckCircle2 size={18} /> Données de démonstration</span><span><CheckCircle2 size={18} /> Aucun paiement réel</span></div></div>
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
