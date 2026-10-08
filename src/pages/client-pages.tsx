import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft, Bell, Bike, Building2, CalendarDays, Car, Check, CheckCircle2, ChevronRight,
  CircleAlert, ClipboardList, Clock3, Download, FileCheck2, FileText, Filter, FolderOpen,
  HandCoins, HeartHandshake, HeartPulse, Home, LifeBuoy, Mail, MapPin, MessageCircle, Paperclip,
  LogOut, Phone, Plane, Plus, RefreshCcw, Search, Send, ShieldCheck, Smartphone, Upload, UserRound,
  WalletCards, XCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { usePortal } from "../app/portal-context";
import { EmptyState, InfoCard, LinkButton, PageHeader, StatusBadge, Timeline, documentLabels, requestLabels } from "../components/portal-ui";
import {
  addMessage, formatDate, formatFcfa, markNotificationRead, replaceDocument,
  signOut, simulatePayment, updateProfile,
} from "../services/portal-service";
import type { AutoClaimPerson, AutoClaimVehicle, AutoRequestType, AutoVehicleEnergy, AutoVehicleUsage, ClientDocument, InsuranceProduct, PaymentMethod, PortalStore } from "../types/domain";

const iconForKind: Record<string, typeof Bell> = { proposal: ClipboardList, document: FileCheck2, payment: WalletCards, contract: ShieldCheck, request: FileText, renewal: RefreshCcw, claim: LifeBuoy, message: MessageCircle };
const paymentLabels: Record<PaymentMethod, string> = { mobile_money: "Mobile Money", orange_money: "Orange Money", bank_card: "Carte bancaire", bank_transfer: "Virement" };
const iconForProduct: Record<InsuranceProduct, typeof Car> = { automobile: Car, moto: Bike, sante: HeartPulse, voyage: Plane, habitation: Home, entreprise: Building2 };
const autoRequestTypeLabels: Record<AutoRequestType, string> = { new_vehicle: "Assurer un nouveau véhicule", renewal: "Renouveler mon assurance", switch_insurer: "Changer d’assureur", advice: "Obtenir un conseil", other: "Autre besoin" };
const autoEnergyLabels: Record<AutoVehicleEnergy, string> = { petrol: "Essence", diesel: "Diesel" };
const autoUsageLabels: Record<AutoVehicleUsage, string> = { personal: "Usage personnel", professional: "Usage professionnel", transport: "Transport", other: "Autre" };

export function DashboardPage() {
  const { store, navigate } = usePortal();
  const openRequests = store.requests.filter((request) => request.scope === "core" && request.status !== "completed").length;
  const activeContracts = store.contracts.filter((contract) => contract.status === "active").length;
  const activeClaims = store.claims.filter((claim) => claim.scope === "core" && claim.status !== "closed").length;
  return (
    <div className="grid gap-6 lg:gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><span className="text-[11px] font-bold uppercase tracking-[.16em] text-brand-red">Vendredi 2 octobre</span><h1 className="mt-1 text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-.045em] text-slate-950">Bonjour {store.client.firstName}</h1><p className="mt-2 text-[15px] text-slate-600">Votre protection est à jour. Une décision vous attend.</p></div>
        <LinkButton to="/espace/demandes/nouvelle"><Plus size={18} /> Nouvelle demande</LinkButton>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#510811_0%,#86101a_60%,#ad151e_100%)] p-5 text-white shadow-[0_22px_60px_rgba(94,10,19,.2)] sm:p-7 lg:grid lg:grid-cols-[1.45fr_.75fr] lg:gap-10">
        <img className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[48%] object-cover object-center opacity-35 mix-blend-luminosity lg:block" src="/images/insurance-auto.webp" alt="" aria-hidden="true" />
        <span className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] bg-gradient-to-r from-[#86101a] via-[#86101a]/60 to-transparent lg:block" />
        <div className="relative z-10"><Badge className="border-white/10 bg-white/10 text-orange-100">Prochaine étape</Badge><h2 className="mt-5 max-w-xl text-2xl font-semibold leading-tight tracking-[-.03em] text-white sm:text-3xl">Vos propositions automobile sont prêtes.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-red-50/75">Votre courtier a retenu trois niveaux de protection. Comparez les garanties et choisissez celle qui correspond à votre situation.</p><Button type="button" size="lg" className="mt-6 h-11 rounded-xl bg-white px-5 font-semibold text-brand-ink hover:bg-brand-soft" onClick={() => navigate("/espace/demandes/DEM-2026-00145/propositions")}>Comparer les 3 propositions <ChevronRight size={17} /></Button></div>
        <div className="relative z-10 mt-7 border-t border-white/10 pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1"><span className="text-[11px] font-bold uppercase tracking-[.14em] text-red-100/60">Dossier DEM-2026-00145</span><div className="mt-4 flex items-end justify-between"><div><strong className="text-3xl font-semibold tabular-nums">3/5</strong><p className="mt-1 text-xs text-red-100/60">étapes finalisées</p></div><span className="text-xs font-semibold text-orange-200">60 %</span></div><Progress value={60} className="mt-4 bg-white/10 [&>div]:bg-brand-orange" /><div className="mt-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white/10 text-xs font-bold">AM</span><div><strong className="block text-xs">Accompagné par Amina</strong><span className="text-[11px] text-red-100/60">Votre conseillère</span></div></div></div>
        <span className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-brand-orange/25 blur-3xl" />
      </section>

      <Card className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_35px_rgba(15,35,65,.05)]" aria-label="Résumé de votre espace">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4"><div><CardTitle className="text-base">Mon portefeuille</CardTitle><CardDescription className="mt-1">L’essentiel en un coup d’œil</CardDescription></div><Badge variant="success">À jour</Badge></CardHeader>
        <CardContent className="grid p-0 sm:grid-cols-2 xl:grid-cols-5">
          <InfoCard icon={ShieldCheck} label="Assurances" value={`${activeContracts} contrats actifs`} onClick={() => navigate("/espace/contrats")} />
          <InfoCard icon={ClipboardList} label="Demandes" value={`${openRequests} dossiers en cours`} onClick={() => navigate("/espace/demandes")} />
          <InfoCard icon={FolderOpen} label="Documents" value={`${store.documents.length} documents`} onClick={() => navigate("/espace/documents")} />
          <InfoCard icon={WalletCards} label="Paiements" value={`${store.payments.length} paiements`} onClick={() => navigate("/espace/paiements")} />
          <InfoCard icon={LifeBuoy} label="Sinistres" value={`${activeClaims} dossier en cours`} onClick={() => navigate("/espace/sinistres")} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="rounded-2xl bg-white shadow-[0_10px_35px_rgba(15,35,65,.04)]"><CardHeader><CardTitle className="text-lg">Actions rapides</CardTitle><CardDescription>Les démarches les plus fréquentes</CardDescription></CardHeader><CardContent className="grid gap-1">
          {[
            { label: "Demander une assurance", help: "Ouvrir un nouveau dossier", icon: Plus, route: "/espace/demandes/nouvelle" },
            { label: "Envoyer un document", help: "Compléter une demande en cours", icon: Upload, route: "/espace/documents" },
            { label: "Déclarer un sinistre", help: "Être accompagné rapidement", icon: LifeBuoy, route: "/espace/sinistres/nouveau" },
            { label: "Renouveler un contrat", help: "Anticiper votre prochaine échéance", icon: RefreshCcw, route: "/espace/renouvellements/POL-2026-00325" },
          ].map(({ label, help, icon: Icon, route }, index) => <div key={label}>{index > 0 && <Separator />}<button type="button" className="group flex w-full items-center gap-4 py-4 text-left" onClick={() => navigate(route)}><Icon size={19} className="text-slate-400 group-hover:text-brand-red" /><div className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{label}</strong><small className="mt-1 block text-xs text-slate-500">{help}</small></div><ChevronRight size={17} className="text-slate-300 group-hover:text-brand-orange" /></button></div>)}
        </CardContent></Card>
        <Card className="rounded-2xl bg-white shadow-[0_10px_35px_rgba(15,35,65,.04)]"><CardHeader><CardTitle className="text-lg">Activité récente</CardTitle><CardDescription>Les dernières évolutions de vos dossiers</CardDescription></CardHeader><CardContent className="grid gap-0">
          {store.activities.map((activity, index) => { const Icon = iconForKind[activity.kind] || Bell; return <div className="relative grid grid-cols-[32px_1fr] gap-3 pb-5 last:pb-0" key={activity.id}>{index < store.activities.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-18px)] w-px bg-slate-200" />}<span className="relative z-10 grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500"><Icon size={15} /></span><button type="button" className="pt-0.5 text-left" onClick={() => navigate(activity.route)}><strong className="block text-sm leading-5 text-slate-800 hover:text-brand-red">{activity.label}</strong><small className="mt-1 block text-xs text-slate-400">{activity.date}</small></button></div>; })}
        </CardContent></Card>
      </div>

      <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 sm:px-6"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">09</span><div className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">Mode présentation</strong><span className="mt-1 block text-xs text-slate-500">Accéder directement aux neuf scénarios de démonstration</span></div><Badge variant="outline">Données fictives</Badge><ChevronRight size={18} className="text-slate-400 transition-transform group-open:rotate-90" /></summary>
        <div className="grid border-t border-slate-200 sm:grid-cols-2 xl:grid-cols-3">{store.scenarios.map((scenario) => <button type="button" className="group flex min-h-[82px] items-center gap-3 border-b border-slate-100 px-5 py-4 text-left last:border-b-0 sm:border-r" key={scenario.id} onClick={() => navigate(scenario.route)}><span className="text-xs font-bold tabular-nums text-brand-red">{String(scenario.number).padStart(2, "0")}</span><div className="min-w-0 flex-1"><strong className="block text-sm text-slate-900 group-hover:text-brand-red">{scenario.title}</strong><small className="mt-1 block text-xs leading-5 text-slate-500">{scenario.description}</small></div></button>)}</div>
      </details>
    </div>
  );
}

export function RequestsPage() {
  const { store, navigate } = usePortal();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const requests = store.requests.filter((request) => request.scope === "core");
  const visibleRequests = requests.filter((request) => {
    const needle = search.trim().toLocaleLowerCase("fr");
    const matchesSearch = !needle || `${request.reference} ${request.productLabel}`.toLocaleLowerCase("fr").includes(needle);
    return matchesSearch && (statusFilter === "all" || request.status === statusFilter);
  });
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Mes dossiers" title="Mes demandes" description="Suivez l’avancement de chaque demande transmise à votre courtier." action={<LinkButton to="/espace/demandes/nouvelle"><Plus size={18} /> Nouvelle demande</LinkButton>} />
      <div className="list-toolbar"><div className="search-box"><Search size={18} /><input aria-label="Rechercher une demande" placeholder="Rechercher par référence ou produit" value={search} onChange={(event) => setSearch(event.target.value)} /></div><label className="filter-select"><Filter size={17} /><span className="sr-only">Filtrer les demandes par statut</span><select aria-label="Filtrer les demandes par statut" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tous les statuts</option><option value="proposals_available">Propositions disponibles</option><option value="under_review">En cours d’analyse</option><option value="completed">Terminée</option></select></label></div>
      {visibleRequests.length > 0 ? <div className="request-list">
        {visibleRequests.map((request) => { const ProductIcon = iconForProduct[request.product]; return <button type="button" className="request-card" key={request.id} onClick={() => navigate(`/espace/demandes/${request.reference}`)}><span className="product-icon"><ProductIcon size={22} /></span><div className="request-main"><span className="reference">{request.reference}</span><strong>{request.productLabel}</strong><small>Créée le {formatDate(request.date)}</small></div><StatusBadge status={request.status} /><ChevronRight size={19} /></button>; })}
      </div> : <EmptyState title="Aucune demande trouvée" description="Modifiez votre recherche ou choisissez un autre statut." />}
    </div>
  );
}

export function RequestDetailPage({ reference }: { reference: string }) {
  const { store, navigate } = usePortal();
  const request = store.requests.find((item) => item.reference === reference);
  if (!request) return <NotFoundPage />;
  const proposalAvailable = request.status === "proposals_available";
  const automobileRequest = request.automobileRequest;
  return (
    <div className="page-stack">
      <button className="back-link" type="button" onClick={() => navigate("/espace/demandes")}><ArrowLeft size={17} /> Retour aux demandes</button>
      <PageHeader eyebrow={request.reference} title={request.productLabel} description={`Demande transmise le ${formatDate(request.date)}`} action={<StatusBadge status={request.status} />} />
      {proposalAvailable && <section className="attention-card blue"><span><ClipboardList size={23} /></span><div><strong>3 propositions sont disponibles</strong><p>Votre courtier a comparé plusieurs solutions pour votre assurance automobile.</p></div><LinkButton to={`/espace/demandes/${reference}/propositions`}>Consulter les propositions</LinkButton></section>}
      {request.status === "policy_issuing" && <section className="attention-card success"><span><CheckCircle2 size={23} /></span><div><strong>Paiement reçu. Votre contrat est en cours de finalisation.</strong><p>Vous serez informé dès que la police sera disponible.</p></div></section>}
      <div className="detail-grid">
        <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Progression</span><h2>Suivi du dossier</h2></div></div><Timeline items={request.timeline} /></section>
        <aside className="panel advisor-card"><span className="page-eyebrow">Votre conseiller</span><span className="large-avatar">{store.advisor.initials}</span><h2>{store.advisor.name}</h2><p>Votre interlocutrice pour ce dossier.</p><a href={`tel:${store.advisor.phone}`}><Phone size={17} /> {store.advisor.phone}</a><a href={`mailto:${store.advisor.email}`}><Mail size={17} /> {store.advisor.email}</a><LinkButton to="/espace/messagerie" variant="secondary"><MessageCircle size={17} /> Envoyer un message</LinkButton></aside>
      </div>
      {automobileRequest && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Informations fournies</span><h2>Détails de votre demande automobile</h2></div></div><div className="auto-request-detail-groups">
        <section><h3>Votre besoin</h3><div className="details-grid"><Detail label="Demande" value={autoRequestTypeLabels[automobileRequest.requestType]} />{automobileRequest.otherNeed && <Detail label="Précision" value={automobileRequest.otherNeed} />}</div></section>
        <section><h3>Votre véhicule</h3><div className="details-grid"><Detail label="Type" value="Véhicule de tourisme" /><Detail label="Véhicule" value={`${automobileRequest.vehicle.brand} ${automobileRequest.vehicle.model}`} /><Detail label="Année" value={String(automobileRequest.vehicle.year)} /><Detail label="Immatriculation" value={automobileRequest.vehicle.registration} /><Detail label="Énergie" value={autoEnergyLabels[automobileRequest.vehicle.energy]} /><Detail label="Puissance fiscale" value={`${automobileRequest.vehicle.fiscalPower} CV`} /><Detail label="Usage" value={autoUsageLabels[automobileRequest.vehicle.usage]} />{automobileRequest.vehicle.estimatedValue !== null && <Detail label="Valeur estimée du véhicule" value={formatFcfa(automobileRequest.vehicle.estimatedValue)} />}</div></section>
        <section><h3>Durée et prise d’effet</h3><div className="details-grid"><Detail label="Durée" value={`${automobileRequest.coverage.durationMonths} mois`} /><Detail label="Prise d’effet" value={automobileRequest.coverage.desiredStartDate ? formatDate(automobileRequest.coverage.desiredStartDate) : "Date à confirmer"} /></div></section>
        <section><h3>Informations complémentaires</h3><div className="details-grid"><Detail label="Véhicule déjà assuré" value={automobileRequest.previousInsurance.hasInsurance ? "Oui" : "Non"} />{automobileRequest.previousInsurance.hasInsurance && <><Detail label="Ancien assureur" value={automobileRequest.previousInsurance.insurerName || "Non renseigné"} /><Detail label="Expiration du contrat" value={automobileRequest.previousInsurance.expirationDate ? formatDate(automobileRequest.previousInsurance.expirationDate) : "Non renseignée"} /><Detail label="Numéro de police actuel" value={automobileRequest.previousInsurance.policyNumber || "Non renseigné"} /></>}<Detail label="Conseil souhaité" value={automobileRequest.wantsAdvice ? "Oui" : "Non"} /></div>{automobileRequest.comments && <div className="request-comments"><span>Précisions complémentaires</span><p>{automobileRequest.comments}</p></div>}</section>
      </div></section>}
      {!automobileRequest && request.vehicle && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Informations fournies</span><h2>Véhicule et couverture</h2></div></div><div className="details-grid"><Detail label="Véhicule" value={`${request.vehicle.brand} ${request.vehicle.model}`} /><Detail label="Année" value={request.vehicle.year} /><Detail label="Immatriculation" value={request.vehicle.registration} /><Detail label="Usage" value={request.vehicle.usage} />{request.vehicle.value !== null && <Detail label="Valeur estimée" value={formatFcfa(request.vehicle.value)} />}<Detail label="Couverture" value={request.coverage || "Conseil demandé"} /></div></section>}
      {request.details && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Informations fournies</span><h2>Détails de votre besoin</h2></div></div><div className="details-grid">{Object.entries(request.details).map(([label, value]) => <Detail key={label} label={label} value={value} />)}</div>{request.comments && <div className="request-comments"><span>Précisions complémentaires</span><p>{request.comments}</p></div>}</section>}
    </div>
  );
}

export function ProposalsPage({ requestReference }: { requestReference: string }) {
  const { store, navigate } = usePortal();
  const request = store.requests.find((item) => item.reference === requestReference);
  const proposal = store.proposals.find((item) => item.id === request?.proposalId);
  if (!request || !proposal) return <NotFoundPage />;
  const offers = store.offers.filter((offer) => proposal.offerIds.includes(offer.id));
  const recommendedOffer = offers.find((offer) => offer.id === proposal.recommendedOfferId) ?? offers[0];
  const alternatives = offers.filter((offer) => offer.id !== recommendedOffer.id);
  return (
    <div className="grid gap-6 lg:gap-8">
      <Button variant="ghost" className="h-9 w-fit rounded-lg px-2 text-slate-600" type="button" onClick={() => navigate(`/espace/demandes/${requestReference}`)}><ArrowLeft size={17} /> Retour au dossier</Button>
      <PageHeader eyebrow={proposal.reference} title="Comparez vos propositions" description="Trois solutions sélectionnées par votre courtier selon votre besoin automobile." />
      <section className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-brand-soft/80 p-4 sm:items-center sm:p-5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-red text-xs font-bold text-white">{store.advisor.initials}</span><div className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-brand-red-dark">L’avis de votre courtier</span><p className="mt-1 text-sm leading-6 text-brand-ink">{proposal.advice}</p></div></section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="relative overflow-hidden rounded-2xl border-brand-red bg-white shadow-[0_20px_55px_rgba(154,19,28,.13)]">
          <div className="h-1.5 bg-[linear-gradient(90deg,#cd131d,#e5691c)]" />
          <CardHeader className="gap-5 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-brand-red font-bold text-white">{recommendedOffer.provider.slice(-1)}</span><div><Badge variant="info"><CheckCircle2 size={13} /> Recommandée</Badge><CardTitle className="mt-2 text-xl">{recommendedOffer.provider}</CardTitle><CardDescription>{recommendedOffer.product}</CardDescription></div></div><div className="text-left sm:text-right"><strong className="block whitespace-nowrap text-[clamp(1.8rem,4vw,2.55rem)] font-semibold tracking-[-.04em] tabular-nums text-slate-950">{formatFcfa(recommendedOffer.premium)}</strong><span className="text-xs text-slate-500">par an</span></div></div></CardHeader>
          <CardContent className="grid gap-6 p-5 pt-0 sm:p-6 sm:pt-0"><div className="grid grid-cols-2 divide-x divide-slate-200 rounded-xl bg-slate-50 py-4"><div className="px-4"><span className="block text-[11px] text-slate-500">Franchise</span><strong className="mt-1 block text-sm tabular-nums text-slate-900">{formatFcfa(recommendedOffer.deductible)}</strong></div><div className="px-4"><span className="block text-[11px] text-slate-500">Durée</span><strong className="mt-1 block text-sm text-slate-900">{recommendedOffer.duration}</strong></div></div><div><span className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Garanties principales</span><ul className="mt-3 grid gap-2 sm:grid-cols-2">{recommendedOffer.guarantees.map((guarantee) => <li className="flex items-center gap-2 text-sm text-slate-700" key={guarantee}><span className="grid size-5 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={12} strokeWidth={3} /></span>{guarantee}</li>)}</ul></div><div className="grid gap-2 sm:grid-cols-2"><Button variant="outline" size="lg" className="h-11 rounded-xl" type="button" onClick={() => navigate(`/espace/offres/${recommendedOffer.id}`)}>Voir les détails</Button><Button size="lg" className="h-11 rounded-xl" type="button" onClick={() => navigate(`/espace/offres/${recommendedOffer.id}?choisir=1`)}>Choisir cette offre</Button></div></CardContent>
        </Card>

        <div className="grid gap-4">{alternatives.map((offer) => <Card className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,35,65,.04)]" key={offer.id}><CardContent className="grid gap-5 p-5"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">{offer.provider.slice(-1)}</span><div><strong className="block text-sm text-slate-900">{offer.provider}</strong><span className="text-xs text-slate-500">{offer.product}</span></div></div><div className="text-right"><strong className="block whitespace-nowrap text-xl font-semibold tracking-[-.03em] tabular-nums text-slate-950">{formatFcfa(offer.premium)}</strong><span className="text-[11px] text-slate-500">par an</span></div></div><Separator /><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600"><span>Franchise <strong className="ml-1 text-slate-900">{formatFcfa(offer.deductible)}</strong></span><span>{offer.guarantees.length} garanties incluses</span></div><ul className="grid gap-1.5">{offer.guarantees.slice(0, 3).map((guarantee) => <li className="flex items-center gap-2 text-xs text-slate-600" key={guarantee}><Check size={13} className="text-emerald-600" />{guarantee}</li>)}</ul><div className="grid grid-cols-2 gap-2"><Button variant="outline" className="rounded-xl" type="button" onClick={() => navigate(`/espace/offres/${offer.id}`)}>Détails</Button><Button variant="secondary" className="rounded-xl" type="button" onClick={() => navigate(`/espace/offres/${offer.id}?choisir=1`)}>Choisir</Button></div></CardContent></Card>)}</div>
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-500"><CircleAlert size={15} /> Ces propositions sont entièrement fictives et servent uniquement à la démonstration.</p>
    </div>
  );
}

export function DocumentsPage() {
  const { store, updateStore } = usePortal();
  const [filter, setFilter] = useState("Tous");
  const categories = ["Tous", "Identité", "Véhicules", "Polices", "Attestations", "Factures", "Reçus", "Sinistres"];
  const documents = filter === "Tous" ? store.documents : store.documents.filter((document) => document.category === filter);
  const handleFile = (document: ClientDocument, file?: File) => { if (file) updateStore(replaceDocument(store, document.id, file)); };
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Bibliothèque documentaire" title="Mes documents" description="Retrouvez les pièces transmises, les contrats et les reçus de votre espace." />
      <div className="filter-tabs" role="tablist" aria-label="Catégories de documents">{categories.map((category) => <button type="button" role="tab" aria-selected={filter === category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)} key={category}>{category}</button>)}</div>
      <div className="documents-grid">{documents.map((document) => <article className={`document-card ${document.status}`} key={document.id}><div className="document-top"><span className="document-icon"><FileText size={22} /></span><StatusBadge status={document.status}>{documentLabels[document.status]}</StatusBadge></div><h3>{document.title}</h3><p>{document.fileName || "Aucun fichier transmis"}</p>{document.correctionMessage && <div className="correction-message"><CircleAlert size={17} /><span>{document.correctionMessage}</span></div>}<div className="document-footer">{document.downloadUrl ? <a className="button button-secondary" href={document.downloadUrl} download><Download size={17} /> Télécharger</a> : <label className="button button-secondary upload-label"><Upload size={17} /> {document.status === "correction_required" ? "Remplacer le document" : "Sélectionner un fichier"}<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => handleFile(document, event.target.files?.[0])} /></label>}</div></article>)}</div>
      <p className="simulation-note"><CircleAlert size={16} /> Seuls le nom, le type, la date et le statut du fichier sont mémorisés. Aucun contenu de fichier n’est stocké.</p>
    </div>
  );
}

export function PaymentsPage() {
  const { store, updateStore } = usePortal();
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [result, setResult] = useState<"success" | "failed" | null>(null);
  const pay = (success: boolean) => { updateStore(simulatePayment(store, success, method)); setResult(success ? "success" : "failed"); };
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Historique financier" title="Mes paiements" description="Consultez les règlements simulés associés à vos demandes et contrats." />
      <section className="payment-due-card"><span className="payment-due-icon"><HandCoins size={26} /></span><div><span className="page-eyebrow">Dossier prêt</span><h2>Votre dossier est prêt pour le paiement.</h2><p>Assurance automobile · Compagnie A</p></div><strong>{formatFcfa(105000)}</strong>
        <Dialog onOpenChange={(open) => { if (open) setResult(null); }}><DialogTrigger asChild><button className="button button-primary" type="button">Payer maintenant</button></DialogTrigger><DialogContent className="portal-dialog payment-dialog"><DialogHeader><DialogTitle>Simulation de paiement</DialogTitle><DialogDescription>Aucune transaction réelle ne sera effectuée.</DialogDescription></DialogHeader>{result ? <div className={`payment-result ${result}`}><span>{result === "success" ? <CheckCircle2 size={30} /> : <XCircle size={30} />}</span><h3>{result === "success" ? "Paiement effectué avec succès." : "Le paiement simulé a échoué."}</h3><p>{result === "success" ? "Référence PAY-2026-00046 · votre contrat est en préparation." : "Vous pouvez choisir un autre mode et réessayer."}</p></div> : <><div className="payment-summary"><span>Montant à régler</span><strong>{formatFcfa(105000)}</strong><small>Assurance automobile · Compagnie A</small></div><fieldset className="method-grid"><legend>Mode de paiement fictif</legend>{(Object.entries(paymentLabels) as [PaymentMethod, string][]).map(([value, label]) => <label className={method === value ? "selected" : ""} key={value}><input type="radio" name="paymentMethod" checked={method === value} onChange={() => setMethod(value)} /><Smartphone size={19} /><span>{label}</span></label>)}</fieldset><div className="dialog-actions stacked"><button className="button button-primary" type="button" onClick={() => pay(true)}>Simuler un paiement réussi</button><button className="button button-secondary" type="button" onClick={() => pay(false)}>Simuler un paiement échoué</button></div></>}</DialogContent></Dialog>
      </section>
      {result === "success" && <section className="post-payment"><Timeline items={[{ label: "Paiement confirmé", done: true }, { label: "Traitement du dossier", done: false, active: true }, { label: "Police disponible", done: false }]} /></section>}
      <section className="panel table-panel"><div className="panel-heading"><div><span className="page-eyebrow">Toutes les opérations</span><h2>Historique</h2></div></div><div className="responsive-table"><table><thead><tr><th>Référence</th><th>Contrat ou dossier</th><th>Montant</th><th>Date</th><th>Mode</th><th>Statut</th></tr></thead><tbody>{store.payments.map((payment) => <tr key={payment.id}><td><strong>{payment.reference}</strong></td><td>{payment.contractId || payment.requestId}</td><td>{formatFcfa(payment.amount)}</td><td>{formatDate(payment.date)}</td><td>{paymentLabels[payment.method]}</td><td><StatusBadge status={payment.status}>{payment.status === "succeeded" ? "Confirmé" : payment.status === "failed" ? "Échoué" : "En attente"}</StatusBadge></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

export function ContractsPage() {
  const { store, navigate } = usePortal();
  return <div className="page-stack"><PageHeader eyebrow="Vos protections" title="Mes assurances" description="Consultez vos contrats actifs, leurs garanties et leurs prochaines échéances." />
    <section className="renewal-alert"><span><CalendarDays size={22} /></span><div><strong>Votre assurance automobile arrive à échéance dans 30 jours.</strong><p>Anticipez son renouvellement depuis votre espace.</p></div><LinkButton to="/espace/renouvellements/POL-2026-00325" variant="secondary">Voir le renouvellement</LinkButton></section>
    <div className="contracts-grid">{store.contracts.map((contract) => <article className="contract-card" key={contract.id}><div className="contract-visual"><span>{contract.product === "automobile" ? <Car size={29} /> : <Home size={29} />}</span><StatusBadge status={contract.status}>{contract.status === "active" ? "Actif" : "En préparation"}</StatusBadge></div><span className="reference">{contract.policyNumber}</span><h2>{contract.productLabel}</h2><p>{contract.provider}</p><div className="contract-date"><CalendarDays size={18} /><div><small>Expiration</small><strong>{formatDate(contract.expirationDate)}</strong></div></div><div className="contract-actions"><button className="button button-primary" type="button" onClick={() => navigate(`/espace/contrats/${contract.policyNumber}`)}>Voir le contrat</button><button className="button button-secondary" type="button" onClick={() => navigate(`/espace/renouvellements/${contract.policyNumber}`)}>Renouveler</button></div></article>)}</div>
  </div>;
}

export function ContractDetailPage({ policyNumber }: { policyNumber: string }) {
  const { store, navigate } = usePortal();
  const contract = store.contracts.find((item) => item.policyNumber === policyNumber);
  if (!contract) return <NotFoundPage />;
  const documents = store.documents.filter((document) => contract.documentIds.includes(document.id));
  const payments = store.payments.filter((payment) => contract.paymentIds.includes(payment.id));
  const claims = store.claims.filter((claim) => contract.claimIds.includes(claim.id));
  return <div className="page-stack"><button className="back-link" type="button" onClick={() => navigate("/espace/contrats")}><ArrowLeft size={17} /> Retour aux contrats</button><PageHeader eyebrow={contract.policyNumber} title={contract.productLabel} description={contract.provider} action={<StatusBadge status={contract.status}>Actif</StatusBadge>} />
    <section className="policy-hero"><div><span className="policy-icon"><ShieldCheck size={28} /></span><div><small>Votre police d’assurance est disponible.</small><h2>{contract.policyNumber}</h2></div></div><div className="policy-downloads">{documents.slice(0, 3).map((document) => <a className="button button-secondary" href={document.downloadUrl} download key={document.id}><Download size={17} /> {document.type}</a>)}</div></section>
    <Tabs defaultValue="resume" className="contract-tabs"><TabsList className="contract-tabs-list"><TabsTrigger value="resume">Résumé</TabsTrigger><TabsTrigger value="garanties">Garanties</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="paiements">Paiements</TabsTrigger><TabsTrigger value="sinistres">Sinistres</TabsTrigger></TabsList>
      <TabsContent value="resume"><section className="panel"><div className="details-grid"><Detail label="Numéro de police" value={contract.policyNumber} /><Detail label="Produit" value={contract.productLabel} /><Detail label="Compagnie" value={contract.provider} /><Detail label="Date d’effet" value={formatDate(contract.effectiveDate)} /><Detail label="Expiration" value={formatDate(contract.expirationDate)} /><Detail label="Prime annuelle" value={formatFcfa(contract.premium)} /></div></section></TabsContent>
      <TabsContent value="garanties"><section className="panel"><h2>Garanties incluses</h2><ul className="guarantee-list large">{contract.guarantees.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul></section></TabsContent>
      <TabsContent value="documents"><section className="panel mini-list">{documents.map((document) => <a href={document.downloadUrl} download key={document.id}><FileText size={20} /><div><strong>{document.title}</strong><small>{document.fileName || "Document de démonstration"}</small></div><Download size={18} /></a>)}</section></TabsContent>
      <TabsContent value="paiements"><section className="panel mini-list">{payments.map((payment) => <div key={payment.id}><WalletCards size={20} /><div><strong>{payment.reference}</strong><small>{formatDate(payment.date)}</small></div><strong>{formatFcfa(payment.amount)}</strong></div>)}</section></TabsContent>
      <TabsContent value="sinistres"><section className="panel mini-list">{claims.map((claim) => <button type="button" onClick={() => navigate(`/espace/sinistres/${claim.reference}`)} key={claim.id}><LifeBuoy size={20} /><div><strong>{claim.reference}</strong><small>{claim.type}</small></div><ChevronRight size={18} /></button>)}</section></TabsContent>
    </Tabs>
  </div>;
}

export function ClaimsPage() {
  const { store, navigate } = usePortal();
  return <div className="page-stack"><PageHeader eyebrow="Assistance et suivi" title="Mes sinistres" description="Déclarez un événement et suivez l’avancement de son traitement." action={<LinkButton to="/espace/sinistres/nouveau"><Plus size={18} /> Déclarer un sinistre</LinkButton>} /><div className="claim-list">{store.claims.filter((claim) => claim.scope === "core").map((claim) => <button type="button" onClick={() => navigate(`/espace/sinistres/${claim.reference}`)} className="claim-card" key={claim.id}><span className="claim-icon"><LifeBuoy size={22} /></span><div><span className="reference">{claim.reference}</span><strong>{claim.productLabel} · {claim.type}</strong><small>Déclaré le {formatDate(claim.date)}</small></div><StatusBadge status={claim.status}>{claim.status === "closed" ? "Clôturé" : "En traitement"}</StatusBadge><ChevronRight size={18} /></button>)}</div></div>;
}

export function ClaimDetailPage({ reference }: { reference: string }) {
  const { store, navigate } = usePortal();
  const claim = store.claims.find((item) => item.reference === reference);
  if (!claim) return <NotFoundPage />;
  const declaration = claim.autoDeclaration;
  const injuredPeople = declaration ? [...declaration.injuriesInVehicle, ...declaration.otherInjuries] : [];
  const circumstancesA = declaration?.circumstances.filter((item) => item.vehicleA).map((item) => item.label).filter(Boolean) ?? [];
  const circumstancesB = declaration?.circumstances.filter((item) => item.vehicleB).map((item) => item.label).filter(Boolean) ?? [];
  const authority = declaration ? [declaration.policeReportBy, declaration.gendarmerie, declaration.brigade].filter(Boolean).join(" · ") : "";
  const documents = Array.from(new Set([...(claim.attachments ?? []), ...(declaration?.sketchFileName ? [declaration.sketchFileName] : [])]));

  return <div className="page-stack">
    <button className="back-link" type="button" onClick={() => navigate("/espace/sinistres")}><ArrowLeft size={17} /> Retour aux sinistres</button>
    <PageHeader eyebrow={claim.reference} title={`${claim.type} — ${claim.productLabel}`} description={`Déclaré le ${formatDate(claim.date)}`} action={<StatusBadge status={claim.status}>{claim.status === "closed" ? "Clôturé" : "En traitement"}</StatusBadge>} />
    <div className="detail-grid">
      <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Progression</span><h2>Suivi du sinistre</h2></div></div><Timeline items={claim.timeline} /></section>
      <aside className="panel"><span className="page-eyebrow">Détails</span><div className="stack-details"><Detail label="Contrat" value={claim.contractId} /><Detail label="Lieu" value={claim.location} /><Detail label="Description" value={claim.description} /></div></aside>
    </div>

    {declaration && <>
      <section className="panel">
        <div className="panel-heading"><div><span className="page-eyebrow">Déclaration automobile</span><h2>Événement et contrat</h2></div></div>
        <div className="details-grid">
          <Detail label="Date de l’accident" value={formatDate(claim.date)} />
          <Detail label="Heure" value={declaration.accidentTime || "Non renseignée"} />
          <Detail label="Lieu" value={claim.location || "Non renseigné"} />
          <Detail label="Numéro client" value={declaration.clientNumber || "Non renseigné"} />
          <Detail label="Point de vente" value={declaration.pointOfSale || "Non renseigné"} />
          <Detail label="Période du contrat" value={`${formatAutoClaimDate(declaration.policyEffectiveDate)} — ${formatAutoClaimDate(declaration.policyExpiryDate)}`} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><span className="page-eyebrow">Personnes concernées</span><h2>Assuré, conducteur et tiers</h2></div></div>
        <div className="details-grid">
          <Detail label="Assuré" value={formatAutoClaimPerson(declaration.insured)} />
          <Detail label="Conducteur assuré" value={formatAutoClaimPerson(declaration.insuredDriver)} />
          <Detail label="Permis du conducteur" value={[declaration.insuredDriver.licenceNumber, declaration.insuredDriver.licenceCategory].filter(Boolean).join(" · ") || "Non renseigné"} />
          <Detail label="Tiers impliqué" value={declaration.adversePartyInvolved ? "Oui" : "Non"} />
          <Detail label="Tiers" value={formatAutoClaimPerson(declaration.adversary)} />
          <Detail label="Conducteur du tiers" value={formatAutoClaimPerson(declaration.adversaryDriver)} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><span className="page-eyebrow">Constat</span><h2>Véhicules et circonstances</h2></div></div>
        <div className="details-grid">
          <Detail label="Véhicule A" value={formatAutoClaimVehicle(declaration.insuredVehicle)} />
          <Detail label="Véhicule B" value={formatAutoClaimVehicle(declaration.adverseVehicle)} />
          <Detail label="Circonstances A" value={circumstancesA.join(", ") || "Aucune sélection"} />
          <Detail label="Circonstances B" value={circumstancesB.join(", ") || "Aucune sélection"} />
          <Detail label="Point de choc A" value={declaration.impactPointA || "Non renseigné"} />
          <Detail label="Point de choc B" value={declaration.impactPointB || "Non renseigné"} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><span className="page-eyebrow">Conséquences</span><h2>Dommages, blessés et témoins</h2></div></div>
        <div className="details-grid">
          <Detail label="Dommages véhicule A" value={declaration.damageDescriptionA || "Non renseignés"} />
          <Detail label="Dommages véhicule B" value={declaration.damageDescriptionB || "Non renseignés"} />
          <Detail label="Blessés" value={injuredPeople.length ? `${injuredPeople.length} — ${injuredPeople.map((person) => person.name).filter(Boolean).join(", ")}` : "Aucun blessé déclaré"} />
          <Detail label="Témoins" value={declaration.witnesses.length ? `${declaration.witnesses.length} — ${declaration.witnesses.map((witness) => witness.name).filter(Boolean).join(", ")}` : "Aucun témoin déclaré"} />
          <Detail label="Autorités" value={authority || "Non renseignées"} />
          <Detail label="Attestation" value={formatAutoClaimDate(declaration.attestedAt)} />
        </div>
        {declaration.narrative && <div className="request-comments"><span>Déroulement de l’accident</span><p>{declaration.narrative}</p></div>}
      </section>
    </>}

    {documents.length > 0 && <section className="panel">
      <div className="panel-heading"><div><span className="page-eyebrow">Pièces jointes</span><h2>Documents transmis</h2></div></div>
      <ul className="plain-list">{documents.map((document) => <li key={document}><FileText size={16} /><span>{document}</span></li>)}</ul>
    </section>}
  </div>;
}

export function MessagesPage() {
  const { store, updateStore } = usePortal();
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() && !attachment) return;
    const body = [message.trim(), attachment ? `Pièce jointe : ${attachment}` : ""].filter(Boolean).join("\n");
    updateStore(addMessage(store, body));
    setMessage("");
    setAttachment("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 20);
  };
  return <div className="page-stack"><PageHeader eyebrow="Conversation" title="Ma messagerie" description="Échangez directement avec votre courtier depuis votre espace." /><section className="message-layout"><div className="conversation"><div className="conversation-head"><span className="large-avatar">{store.advisor.initials}</span><div><strong>{store.advisor.name}</strong><small><span /> Disponible pour vous accompagner</small></div></div><div className="messages-scroll">{store.messages.map((item) => <div className={`message-bubble ${item.sender}`} key={item.id}><span>{item.body}</span><small>{new Date(item.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</small></div>)}<div ref={endRef} /></div><form className="message-compose" onSubmit={submit}><label className="attach-button" title="Joindre un document"><Paperclip size={19} /><span className="sr-only">Joindre un document</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setAttachment(event.target.files?.[0]?.name || "")} /></label><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Écrivez votre message…" aria-label="Nouveau message" /><button type="submit" aria-label="Envoyer le message"><Send size={19} /></button>{attachment && <span className="message-attachment" aria-live="polite"><FileText size={14} /> {attachment}</span>}</form></div><aside className="panel advisor-compact"><span className="large-avatar">{store.advisor.initials}</span><h2>{store.advisor.name}</h2><p>Conseillère clientèle</p><a href={`tel:${store.advisor.phone}`}><Phone size={17} /> {store.advisor.phone}</a><a href={`mailto:${store.advisor.email}`}><Mail size={17} /> {store.advisor.email}</a></aside></section></div>;
}

export function NotificationsPage() {
  const { store, updateStore, navigate } = usePortal();
  const open = (id: string, route: string) => { updateStore(markNotificationRead(store, id)); navigate(route); };
  return <div className="page-stack"><PageHeader eyebrow="Centre de notifications" title="Mes notifications" description="Retrouvez les mises à jour importantes de vos demandes et contrats." action={<button type="button" className="button button-secondary" onClick={() => updateStore({ ...store, notifications: store.notifications.map((item) => ({ ...item, read: true })) })}>Tout marquer comme lu</button>} /><div className="notifications-list">{store.notifications.map((notification) => { const Icon = iconForKind[notification.kind] || Bell; return <button type="button" className={notification.read ? "read" : "unread"} key={notification.id} onClick={() => open(notification.id, notification.route)}><span className={`notification-icon ${notification.kind}`}><Icon size={20} /></span><div><strong>{notification.title}</strong><p>{notification.body}</p><small>{new Date(notification.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</small></div>{!notification.read && <em>Nouveau</em>}<ChevronRight size={18} /></button>; })}</div></div>;
}

export function ProfilePage() {
  const { store, updateStore, navigate } = usePortal();
  const [draft, setDraft] = useState(store.client);
  const [saved, setSaved] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); updateStore(updateProfile(store, draft)); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return <div className="page-stack"><PageHeader eyebrow="Informations personnelles" title="Mon profil" description="Tenez vos coordonnées et vos préférences de notification à jour." /><form className="profile-layout" onSubmit={submit}><section className="panel"><div className="profile-identity"><span className="profile-avatar">JD</span><div><h2>Jean Dupont</h2><p>Client depuis 2026 · {store.client.id}</p></div></div>{saved && <div className="form-alert success" role="status"><CheckCircle2 size={17} /> Vos modifications ont été enregistrées.</div>}<div className="form-grid"><label>Prénom<input value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} /></label><label>Nom<input value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} /></label><label>Téléphone<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label><label>Email<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><label>Adresse<input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label><label>Ville<input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} /></label></div></section><aside className="panel preferences"><span className="page-eyebrow">Préférences</span><h2>Notifications</h2><p>Choisissez comment vous souhaitez être informé.</p>{([['email','Email'],['sms','SMS'],['whatsapp','WhatsApp'],['inApp','Notification application']] as const).map(([key, label]) => <label className="switch-row" key={key}><span>{label}</span><input type="checkbox" checked={draft.preferences[key]} onChange={(event) => setDraft({ ...draft, preferences: { ...draft.preferences, [key]: event.target.checked } })} /></label>)}<button className="button button-primary full" type="submit">Enregistrer les modifications</button><Button className="mt-3 w-full rounded-xl" variant="outline" type="button" onClick={() => { updateStore(signOut(store)); navigate("/"); }}><LogOut size={16} /> Se déconnecter</Button></aside></form></div>;
}

export function HelpPage() {
  const { store, navigate } = usePortal();
  return <div className="page-stack"><PageHeader eyebrow="Nous sommes là" title="Besoin d’aide ?" description="Votre courtier reste disponible pour répondre à vos questions." /><section className="help-hero"><img className="help-hero-photo" src="/images/advisor-amina.webp" alt="" aria-hidden="true" /><span className="large-avatar">{store.advisor.initials}</span><div><span className="page-eyebrow">Votre conseillère</span><h2>{store.advisor.name}</h2><p>Une question sur une offre, un document ou un sinistre ? Contactez votre interlocutrice dédiée.</p></div><div className="help-actions"><a className="button button-secondary" href={`tel:${store.advisor.phone}`}><Phone size={18} /> Appeler</a><button className="button button-primary" type="button" onClick={() => navigate("/espace/messagerie")}><MessageCircle size={18} /> Envoyer un message</button></div></section><div className="help-grid"><article className="panel"><Phone size={22} /><h3>Téléphone</h3><p>{store.advisor.phone}</p><small>Du lundi au vendredi, de 8h à 17h</small></article><article className="panel"><Mail size={22} /><h3>Email</h3><p>{store.advisor.email}</p><small>Adresse fictive de démonstration</small></article><article className="panel"><MapPin size={22} /><h3>À distance</h3><p>Toutes vos démarches en ligne</p><small>Aucun déplacement nécessaire</small></article></div></div>;
}

export function NotFoundPage() {
  return <div className="not-found"><span>404</span><h1>Cette page n’est pas disponible.</h1><p>Le contenu demandé n’existe pas dans cette démonstration.</p><LinkButton to="/espace">Retour à l’accueil</LinkButton></div>;
}

function formatAutoClaimDate(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return "Non renseigné";

  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(normalized) ? `${normalized}T12:00:00` : normalized);
  if (Number.isNaN(parsed.getTime())) return normalized;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function formatAutoClaimPerson(person?: Partial<AutoClaimPerson> | null) {
  if (!person) return "Non renseigné";

  const identity = [person.firstNames, person.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  const details = [person.profession, person.phone, person.email, person.address]
    .map((value) => value?.trim())
    .filter(Boolean);

  return [identity, ...details].filter(Boolean).join(" · ") || "Non renseigné";
}

function formatAutoClaimVehicle(vehicle?: Partial<AutoClaimVehicle> | null) {
  if (!vehicle) return "Non renseigné";

  const identity = [vehicle.brand, vehicle.type]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  const details = [
    vehicle.registration?.trim() ? `Immatriculation ${vehicle.registration.trim()}` : "",
    vehicle.usage?.trim() ? `Usage ${vehicle.usage.trim()}` : "",
  ].filter(Boolean);

  return [identity, ...details].filter(Boolean).join(" · ") || "Non renseigné";
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="detail-item"><small>{label}</small><strong>{value}</strong></div>; }
