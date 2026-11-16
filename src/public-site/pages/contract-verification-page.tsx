import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  Fingerprint,
  LoaderCircle,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { usePortal } from "../../app/portal-context";
import { PublicPageShell } from "../components/public-page-shell";
import {
  verifyContract,
  type ContractVerification,
  type ContractVerificationStatus,
} from "../../services/contract-verification-api";

const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });

const statusContent: Record<ContractVerificationStatus, { label: string; icon: typeof CheckCircle2 }> = {
  authentique: { label: "Contrat authentique", icon: BadgeCheck },
  brouillon: { label: "Document authentique en préparation", icon: Clock3 },
  expire: { label: "Contrat authentique expiré", icon: ShieldCheck },
  remplace: { label: "Version remplacée", icon: AlertTriangle },
  invalide: { label: "Vérification impossible", icon: AlertTriangle },
};

function displayDate(value: string) {
  return date.format(new Date(`${value}T12:00:00`));
}

function valueOrDash(value: string) {
  return value.trim() || "—";
}

function Information({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="contract-verification__info"><span>{label}</span><strong>{value}</strong></div>;
}

export function ContractVerificationPage({ code }: { code: string }) {
  const { query } = usePortal();
  const [contract, setContract] = useState<ContractVerification | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void verifyContract(code, query.get("v"), query.get("e"))
      .then((result) => { if (active) setContract(result); })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "La vérification a échoué.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [code, query]);

  return (
    <PublicPageShell className="contract-verification-page">
      <section className="contract-verification">
        <div className="public-container contract-verification__container">
          <div className="contract-verification__intro">
            <span className="public-kicker"><Fingerprint size={16} /> Vérification officielle</span>
            <h1>Authentifier une police d’assurance</h1>
            <p>Les informations ci-dessous proviennent directement du registre sécurisé de FOLLOW-UP INSURANCE.</p>
          </div>

          {loading && <div className="contract-verification__state"><LoaderCircle className="contract-verification__spinner" /><strong>Vérification du contrat…</strong><span>Nous contrôlons le QR code et l’empreinte du document.</span></div>}

          {!loading && error && <div className="contract-verification__state contract-verification__state--error"><AlertTriangle /><strong>QR code non reconnu</strong><span>{error}</span></div>}

          {!loading && contract && <ContractResult contract={contract} />}
        </div>
      </section>
    </PublicPageShell>
  );
}

function ContractResult({ contract }: { contract: ContractVerification }) {
  const status = statusContent[contract.statut];
  const StatusIcon = status.icon;
  const breakdown = [
    ["Prime nette", contract.decomposition_prime.prime_nette_xaf],
    ["Accessoires", contract.decomposition_prime.accessoires_xaf],
    ["Fichier ASAC", contract.decomposition_prime.fichier_asac_xaf],
    ["Taxes", contract.decomposition_prime.taxes_xaf],
    ["Carte CEMAC", contract.decomposition_prime.carte_cemac_xaf],
    ["DTA", contract.decomposition_prime.dta_xaf],
    ["Autres frais", contract.decomposition_prime.autres_frais_xaf],
  ] as const;

  return <div className="contract-verification__result">
    <header className={`contract-verification__status contract-verification__status--${contract.statut}`}>
      <span className="contract-verification__status-icon"><StatusIcon /></span>
      <div><p>{status.label}</p><h2>{contract.numero_police || contract.reference}</h2><span>{contract.message}</span></div>
      <div className="contract-verification__proof"><small>Empreinte</small><strong>{contract.empreinte_courte || "—"}</strong><small>Version {contract.version}</small></div>
    </header>

    <div className="contract-verification__grid">
      <section className="contract-verification__card">
        <h3><ShieldCheck /> Contrat</h3>
        <div className="contract-verification__information-grid">
          <Information label="Référence FOLLOW-UP" value={contract.reference} />
          <Information label="Numéro de police" value={contract.numero_police || "En attente"} />
          <Information label="Produit" value={contract.produit} />
          <Information label="Compagnie" value={contract.assureur} />
          <Information label="Offre retenue" value={contract.offre_reference} />
          <Information label="Prime TTC" value={money.format(contract.prime_ttc_xaf)} />
        </div>
      </section>

      <section className="contract-verification__card">
        <h3><CalendarDays /> Validité</h3>
        <div className="contract-verification__information-grid">
          <Information label="Date d’effet" value={displayDate(contract.date_effet)} />
          <Information label="Date d’expiration" value={displayDate(contract.date_expiration)} />
          <Information label="Durée" value={`${contract.duree_mois} mois`} />
          <Information label="Franchise" value={money.format(contract.franchise_xaf)} />
        </div>
      </section>

      <section className="contract-verification__card">
        <h3><UserRound /> Souscripteur</h3>
        <div className="contract-verification__information-grid">
          <Information label="Nom complet" value={contract.souscripteur.nom_complet} />
          <Information label="Téléphone protégé" value={contract.souscripteur.telephone_masque} />
          <Information label="Ville" value={valueOrDash(contract.souscripteur.ville)} />
        </div>
      </section>

      <section className="contract-verification__card">
        <h3><Car /> Véhicule assuré</h3>
        <div className="contract-verification__information-grid">
          <Information label="Marque et modèle" value={valueOrDash(`${contract.vehicule.marque} ${contract.vehicule.modele}`)} />
          <Information label="Immatriculation" value={valueOrDash(contract.vehicule.immatriculation)} />
          <Information label="Châssis protégé" value={contract.vehicule.numero_chassis_masque} />
          <Information label="Usage" value={valueOrDash(contract.vehicule.usage)} />
          <Information label="Énergie" value={valueOrDash(contract.vehicule.energie)} />
          <Information label="Puissance fiscale" value={valueOrDash(contract.vehicule.puissance_fiscale)} />
        </div>
      </section>
    </div>

    <section className="contract-verification__card contract-verification__card--wide">
      <h3><ReceiptText /> Garanties souscrites</h3>
      <div className="contract-verification__guarantees">
        {contract.garanties.map((guarantee, index) => <div key={`${guarantee.libelle}-${index}`}>
          <span><CheckCircle2 /> <strong>{guarantee.libelle}</strong><small>{guarantee.capital_montant || "Capital selon conditions contractuelles"}{guarantee.franchise ? ` · Franchise : ${guarantee.franchise}` : ""}</small></span>
          <strong>{guarantee.prime_xaf ? money.format(guarantee.prime_xaf) : "Incluse"}</strong>
        </div>)}
      </div>
    </section>

    <section className="contract-verification__card contract-verification__card--wide">
      <h3><ReceiptText /> Décomposition de la prime</h3>
      <div className="contract-verification__breakdown">
        {breakdown.map(([label, amount]) => <Information key={label} label={label} value={money.format(amount)} />)}
        <Information label="Total TTC" value={money.format(contract.prime_ttc_xaf)} />
      </div>
    </section>

    <footer className="contract-verification__author">
      <span><UserRound /></span>
      <div><small>Contrat préparé par</small><strong>{contract.prepare_par.nom_complet}</strong><p>{contract.prepare_par.fonction}{contract.genere_le ? ` · Généré le ${dateTime.format(new Date(contract.genere_le))}` : ""}</p></div>
      {contract.integrite_confirmee && <BadgeCheck className="contract-verification__author-check" />}
    </footer>

    <p className="contract-verification__privacy">Pour protéger le client, le téléphone et le numéro de châssis sont partiellement masqués. Le document papier reste la référence pour les informations personnelles complètes.</p>
  </div>;
}
