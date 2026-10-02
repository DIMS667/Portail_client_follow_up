import { useState, type FormEvent } from "react";
import {
  Bike, Building2, Car, CheckCircle2, ChevronRight, Eye, EyeOff, FileCheck2,
  HeartPulse, Home, LockKeyhole, MessageCircleMore, Plane, ShieldCheck, Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    <header className="mx-auto flex h-[76px] w-[min(1240px,calc(100%-32px))] items-center justify-between">
      <button className="flex items-center gap-3" onClick={() => navigate("/")} type="button" aria-label="Espace Client, accueil">
        <span className="grid size-10 place-items-center rounded-[12px_12px_12px_4px] bg-[#08182d] text-white"><ShieldCheck size={20} /></span><span className="text-[15px] font-bold tracking-tight text-slate-950">Espace Client</span>
      </button>
      <nav className="flex items-center gap-2" aria-label="Navigation principale">
        <Button variant="ghost" className="hidden rounded-xl text-slate-600 sm:inline-flex" onClick={() => document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth", block: "start" })} type="button">Nos solutions</Button>
        <Button variant="outline" className="rounded-xl border-slate-300 bg-white" onClick={() => navigate("/connexion")} type="button">Se connecter</Button>
      </nav>
    </header>
  );
}

export function LandingPage() {
  const { navigate } = usePortal();
  const benefits = ["Plus besoin de vous déplacer", "Plusieurs propositions adaptées", "Documents accessibles en ligne", "Paiement et suivi à distance"];
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f8fa]">
      <PublicHeader />
      <main className="pb-16">
        <section className="relative mx-auto grid min-h-[610px] w-[min(1240px,calc(100%-32px))] overflow-hidden rounded-[28px_28px_28px_8px] bg-[#08182d] px-6 py-12 text-white shadow-[0_35px_90px_rgba(8,24,45,.20)] sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16 lg:px-16 lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <Badge className="border-white/10 bg-white/10 text-blue-100">Votre courtier, toujours à vos côtés</Badge>
            <h1 className="mt-7 text-[clamp(2.65rem,6vw,5.35rem)] font-semibold leading-[.98] tracking-[-.06em] text-white">L’assurance qui suit<br /><span className="text-blue-400">votre rythme.</span></h1>
            <p className="mt-7 max-w-xl text-[clamp(1rem,1.7vw,1.18rem)] leading-8 text-slate-300">Un seul espace pour demander une couverture, comparer les conseils de votre courtier et garder chaque document à portée de main.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12 rounded-xl bg-blue-500 px-6 font-semibold hover:bg-blue-400" onClick={() => navigate("/inscription")} type="button">Démarrer une demande</Button>
              <Button size="lg" variant="outline" className="h-12 rounded-xl border-white/20 bg-white/[.06] px-6 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("/connexion")} type="button">Accéder à mon espace</Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400"><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Conseiller dédié</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Suivi transparent</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Documents centralisés</span></div>
          </div>
          <div className="relative z-10 mt-12 lg:mt-0">
            <div className="overflow-hidden rounded-[22px_22px_22px_7px] border border-white/15 bg-white text-slate-950 shadow-[0_30px_70px_rgba(0,0,0,.24)]">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6"><div><span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Dossier automobile</span><strong className="mt-1 block text-base">DEM-2026-00145</strong></div><Badge variant="success">En bonne voie</Badge></div>
              <div className="px-5 py-5 sm:px-6"><div className="flex items-end justify-between"><div><span className="text-xs text-slate-500">Progression</span><strong className="mt-1 block text-2xl font-semibold tracking-tight">3 étapes sur 5</strong></div><span className="text-sm font-semibold text-blue-600">60 %</span></div><Progress value={60} className="mt-4" /></div>
              <div className="px-5 pb-2 sm:px-6">
                {[
                  { title: "Demande analysée", help: "Votre besoin a été vérifié", icon: FileCheck2, done: true },
                  { title: "3 propositions disponibles", help: "À comparer maintenant", icon: MessageCircleMore, current: true },
                  { title: "Choix et paiement", help: "Étape suivante", icon: Smartphone },
                ].map(({ title, help, icon: Icon, done, current }, index) => <div className={`grid grid-cols-[38px_1fr_auto] items-center gap-3 py-4 ${index > 0 ? "border-t border-slate-100" : ""}`} key={title}><span className={`grid size-9 place-items-center rounded-xl ${current ? "bg-blue-600 text-white" : done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><Icon size={17} /></span><div><strong className="block text-sm">{title}</strong><small className="mt-0.5 block text-xs text-slate-500">{help}</small></div>{done ? <CheckCircle2 size={17} className="text-emerald-600" /> : current ? <Badge variant="info">À consulter</Badge> : null}</div>)}
              </div>
              <div className="m-3 flex items-center gap-3 rounded-xl bg-slate-950 p-4 text-white"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">AM</span><div><small className="font-semibold text-blue-300">Le mot de votre courtier</small><p className="mt-1 text-xs leading-5 text-slate-300">« J’ai sélectionné trois protections adaptées à votre usage. »</p></div></div>
            </div>
          </div>
          <span className="pointer-events-none absolute -right-28 -top-28 size-[420px] rounded-full bg-blue-500/15 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-36 left-[35%] size-[360px] rounded-full bg-emerald-400/10 blur-3xl" />
        </section>
        <section className="mx-auto w-[min(1120px,calc(100%-32px))] py-20" id="solutions">
          <div className="grid gap-5 border-b border-slate-200 pb-8 lg:grid-cols-[1fr_.7fr] lg:items-end"><div><span className="text-[11px] font-bold uppercase tracking-[.16em] text-blue-600">Vos besoins</span><h2 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight tracking-[-.05em] text-slate-950">Une protection pour chaque étape de vie.</h2></div><p className="text-[15px] leading-7 text-slate-600">Choisissez un besoin. Votre courtier clarifie les garanties, compare les solutions et vous accompagne jusqu’au contrat.</p></div>
          <div className="grid md:grid-cols-2">
            {categories.map(({ label, icon: Icon }, index) => <button type="button" className={`group flex min-h-[96px] items-center gap-4 border-b border-slate-200 py-5 text-left ${index % 2 === 0 ? "md:border-r md:pr-8" : "md:pl-8"}`} onClick={() => navigate("/inscription")} key={label}><Icon size={22} className="text-slate-400 transition-colors group-hover:text-blue-600" /><strong className="min-w-0 flex-1 text-base font-medium text-slate-800 group-hover:text-blue-700">Assurance {label.toLowerCase()}</strong><ChevronRight size={17} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" /></button>)}
          </div>
        </section>
        <section className="mx-auto grid w-[min(1120px,calc(100%-32px))] gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">{benefits.map((benefit, index) => <div className="bg-white p-6" key={benefit}><span className="text-xs font-bold tabular-nums text-blue-600">0{index + 1}</span><p className="mt-5 text-sm font-semibold leading-6 text-slate-800">{benefit}</p></div>)}</section>
      </main>
      <footer className="mx-auto flex min-h-[110px] w-[min(1120px,calc(100%-32px))] flex-col items-start justify-center gap-3 border-t border-slate-200 py-6 sm:flex-row sm:items-center sm:justify-between"><button type="button" className="flex items-center gap-2 font-semibold text-slate-900" onClick={() => navigate("/")}><span className="grid size-8 place-items-center rounded-lg bg-[#08182d] text-white"><ShieldCheck size={16} /></span><span>Espace Client</span></button><p className="text-xs text-slate-500">Démonstration interactive — aucune transaction réelle.</p></footer>
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
