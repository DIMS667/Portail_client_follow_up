import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft, Bell, Bike, Building2, CalendarDays, Car, Check, CheckCircle2, ChevronRight,
  CircleAlert, CircleHelp, ClipboardList, Clock3, Download, Eye, FileCheck2, FileText, Filter, FolderOpen,
  HandCoins, HeartHandshake, HeartPulse, Home, LifeBuoy, Mail, MapPin, MessageCircle, Paperclip,
  LogOut, Phone, Plane, Plus, RefreshCcw, Search, Send, ShieldCheck, Smartphone, Upload, UserRound,
  Trash2, WalletCards, XCircle,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { assetUrl, isPortalDeployment } from "../app/base-path";
import { usePortal } from "../app/portal-context";
import { EmptyState, InfoCard, LinkButton, PageHeader, StatusBadge, Timeline, documentLabels, requestLabels } from "../components/portal-ui";
import { documentFolderId, documentSlotsByFolder, type DocumentFolderId, type DocumentSlotDefinition } from "../data/document-folders";
import {
  appliquerCompteAuthentifie,
  deconnecter,
  mettreAJourMonCompte,
} from "../services/authentication-api";
import {
  obtenirLienConsultation,
  supprimerDocument as supprimerDocumentServeur,
  televerserDocument,
} from "../services/documents-api";
import {
  marquerNotificationLue,
  marquerToutesNotificationsLues,
} from "../services/notifications-api";
import {
  addMessage, formatDate, formatFcfa, markNotificationRead, removeDocument, saveDocumentToSlot,
  signOut, simulatePayment, updateProfile,
} from "../services/portal-service";
import type {
  AutoClaimPerson, AutoClaimVehicle, AutoGuarantee, AutoRequestType, AutoVehicleEnergy, AutoVehicleUsage,
  ClientDocument, InsuranceProduct, InsuranceRequest, MotoGuarantee, MotoVehicleEnergy, MotoVehicleUsage, PaymentMethod,
  PortalStore, SelfServiceAutomobileInsuranceRequestData, SelfServiceMotoInsuranceRequestData,
} from "../types/domain";

const iconForKind: Record<string, typeof Bell> = { proposal: ClipboardList, document: FileCheck2, payment: WalletCards, contract: ShieldCheck, request: FileText, renewal: RefreshCcw, claim: LifeBuoy, message: MessageCircle };
const paymentLabels: Record<PaymentMethod, string> = { mobile_money: "Mobile Money", orange_money: "Orange Money", bank_card: "Carte bancaire", bank_transfer: "Virement" };
const claimStatusLabels: Record<string, string> = {
  submitted: "Déclaration reçue",
  under_review: "En cours d’analyse",
  documents_pending: "Documents attendus",
  documents_verified: "Documents vérifiés",
  sent_to_insurer: "Transmis à l’assureur",
  expertise: "En expertise",
  decision: "Décision en cours",
  indemnification: "Indemnisation en cours",
  indemnified: "Indemnisé",
  closed: "Clôturé",
};
const iconForProduct: Record<InsuranceProduct, typeof Car> = {
  automobile: Car,
  moto: Bike,
  sante: HeartPulse,
  vie_capitalisation: HandCoins,
  voyage: Plane,
  habitation: Home,
  entreprise: Building2,
  caution: ShieldCheck,
};
const documentFolders = [
  { id: "informations_personnelles", label: "Informations personnelles", description: "CNI, passeport et justificatifs personnels", icon: UserRound },
  { id: "automobile", label: "Assurance automobile", description: "Voiture, moto, permis, carte grise et sinistres", icon: Car },
  { id: "sante", label: "Assurance santé", description: "Formulaires et justificatifs liés à la santé", icon: HeartPulse },
  { id: "vie_capitalisation", label: "Vie et capitalisation", description: "Pièces liées à l’épargne et à l’assurance vie", icon: HandCoins },
  { id: "habitation", label: "Assurance habitation", description: "Logement, inventaires et justificatifs du risque", icon: Home },
  { id: "voyage", label: "Assurance voyage", description: "Passeport, réservation et justificatifs de voyage", icon: Plane },
  { id: "entreprise", label: "Assurance entreprise", description: "Documents administratifs et risques professionnels", icon: Building2 },
  { id: "caution", label: "Assurance caution", description: "Marchés, contrats et pièces de l’entreprise", icon: ShieldCheck },
  { id: "sinistres", label: "Sinistres", description: "Constats, photos, rapports et justificatifs de vos déclarations", icon: LifeBuoy },
] as const;
const getRequestVehicleKind = (request: InsuranceRequest) => request.vehicleKind ?? (request.motoRequest || request.product === "moto" ? "moto" : request.automobileRequest || request.product === "automobile" ? "car" : undefined);
const autoRequestTypeLabels: Record<AutoRequestType, string> = { new_vehicle: "Assurer un nouveau véhicule", renewal: "Renouveler mon assurance", switch_insurer: "Changer d’assureur", advice: "Obtenir un conseil", other: "Autre besoin" };
const autoEnergyLabels: Record<AutoVehicleEnergy, string> = { petrol: "Essence", diesel: "Diesel" };
const autoUsageLabels: Record<AutoVehicleUsage, string> = {
  cat1_professional: "CAT1 (Véhicule pour usage professionnel)",
  cat2_product_transport: "CAT2 (Véhicule à usage de transport de produit)",
  cat3_transport: "CAT3 (Véhicules de transport de marchandises appartenant à des tiers)",
  personal: "Usage personnel",
  professional: "Usage professionnel",
  transport: "Transport",
  other: "Autre",
};
const autoGuaranteeLabels: Record<AutoGuarantee, string> = {
  civil_liability: "Responsabilité Civile",
  defense_and_recours: "Défense et Recours",
  glass_all_risk: "Bris de Glaces en cas de TOUT RISQUE",
  glass_outside_all_risk: "Bris de Glaces hors TR",
  glass_and_light_blocks: "Bris de Glaces et Blocs feux",
  third_party_collision: "Tierce Collision",
  all_accident_damage: "Dommages Tous Accidents",
  fire: "Incendie",
  fire_and_electrical_risks: "Incendie et Risques Électriques",
  robbery: "Vol Braquage",
  total_theft: "Vol Total",
  total_partial_theft: "Vol Total / Vol Partiel",
  repair_assistance: "Assistance à Réparation",
  advance_on_recours: "Avance sur Recours",
  ipt: "IPT",
};
const motoEnergyLabels: Record<MotoVehicleEnergy, string> = { petrol: "Essence", electric: "Électrique" };
const motoUsageLabels: Record<MotoVehicleUsage, string> = {
  cat5: "CAT5 (Véhicules motorisés à deux ou trois roues)",
  cat5_bis: "CAT5 BIS (Véhicules motorisés à deux ou trois roues pour le transport de passagers à titre payant)",
};
const motoGuaranteeLabels: Record<MotoGuarantee, string> = {
  civil_liability: "Responsabilité Civile",
  defense_and_recours: "Défense et Recours",
  third_party_collision: "Tierce Collision",
  all_accident_damage: "Dommages Tous Accidents",
  fire: "Incendie",
  robbery: "Vol Braquage",
  total_theft: "Vol Total",
  total_partial_theft: "Vol Total / Vol Partiel",
  repair_assistance: "Assistance à Réparation",
  advance_on_recours: "Avance sur Recours",
  ipt: "IPT",
};

export function DashboardPage() {
  const { store, navigate } = usePortal();
  const requests = store.requests.filter((request) => request.scope === "core");
  const claims = store.claims.filter((claim) => claim.scope === "core");
  const documents = store.documents.filter((document) => Boolean(document.slotId));
  const openRequests = requests.filter((request) => request.status !== "completed");
  const activeClaims = claims.filter((claim) => claim.status !== "closed");
  const correctionDocuments = documents.filter((document) => document.status === "correction_required");
  const currentRequest = [...openRequests].sort((a, b) => b.date.localeCompare(a.date))[0];
  const currentClaim = [...activeClaims].sort((a, b) => b.date.localeCompare(a.date))[0];
  const correctionDocument = correctionDocuments[0];
  const currentAdvisor = currentRequest?.advisor ?? currentClaim?.advisor ?? null;
  const requestSteps = currentRequest?.timeline.length ?? 0;
  const completedRequestSteps = currentRequest?.timeline.filter((item) => item.done).length ?? 0;
  const requestProgress = requestSteps ? Math.round((completedRequestSteps / requestSteps) * 100) : 0;
  const recentActivities = [
    ...requests.map((request) => ({
      id: `demande-${request.id}`,
      label: `${request.productLabel} · ${requestLabels[request.status]}`,
      date: request.date,
      route: `/espace/demandes/${request.reference}`,
      kind: "request",
    })),
    ...claims.map((claim) => ({
      id: `sinistre-${claim.id}`,
      label: `${claim.reference} · ${claimStatusLabels[claim.status] ?? "Sinistre en cours"}`,
      date: claim.date,
      route: `/espace/sinistres/${claim.reference}`,
      kind: "claim",
    })),
    ...documents.filter((document) => document.date).map((document) => ({
      id: `document-${document.id}`,
      label: `${document.title} · ${documentLabels[document.status]}`,
      date: document.date!,
      route: "/espace/documents",
      kind: "document",
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  const priority = correctionDocument
    ? {
        badge: "Action requise",
        title: `Remplacez le document « ${correctionDocument.title} »`,
        description: correctionDocument.correctionMessage || "Votre courtier demande une nouvelle version de ce document.",
        button: "Ouvrir mes documents",
        route: "/espace/documents",
        reference: "Document à corriger",
        progress: 0,
      }
    : currentRequest
      ? {
          badge: "Demande en cours",
          title: `${currentRequest.productLabel} : ${requestLabels[currentRequest.status]}`,
          description: currentRequest.advisor
            ? `${currentRequest.advisor.name} suit actuellement votre demande.`
            : "Votre demande est dans la file commune et sera prochainement prise en charge.",
          button: "Suivre ma demande",
          route: `/espace/demandes/${currentRequest.reference}`,
          reference: currentRequest.reference,
          progress: requestProgress,
        }
      : currentClaim
        ? {
            badge: "Sinistre en cours",
            title: `${currentClaim.reference} : ${claimStatusLabels[currentClaim.status]}`,
            description: currentClaim.advisor
              ? `${currentClaim.advisor.name} suit actuellement votre déclaration.`
              : "Votre déclaration est enregistrée et son attribution est en cours.",
            button: "Suivre mon sinistre",
            route: `/espace/sinistres/${currentClaim.reference}`,
            reference: currentClaim.reference,
            progress: Math.round((currentClaim.timeline.filter((item) => item.done).length / Math.max(1, currentClaim.timeline.length)) * 100),
          }
        : {
            badge: "Espace à jour",
            title: "Aucune action n’est requise pour le moment.",
            description: "Vous pouvez créer une demande ou déclarer un sinistre depuis votre espace sécurisé.",
            button: "Faire une demande",
            route: "/espace/demandes/nouvelle",
            reference: "Aucun dossier en attente",
            progress: 100,
          };
  return (
    <div className="grid gap-6 lg:gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><span className="text-[11px] font-bold uppercase tracking-[.16em] text-brand-red">{today}</span><h1 className="mt-1 text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-.045em] text-slate-950">Bonjour {store.client.firstName}</h1><p className="mt-2 text-[15px] text-slate-600">Retrouvez l’état réel de vos démarches et documents.</p></div>
        <LinkButton to="/espace/demandes/nouvelle"><Plus size={18} /> Nouvelle demande</LinkButton>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#510811_0%,#86101a_60%,#ad151e_100%)] p-5 text-white shadow-[0_22px_60px_rgba(94,10,19,.2)] sm:p-7 lg:grid lg:grid-cols-[1.45fr_.75fr] lg:gap-10">
        <div className="relative z-10"><Badge className="border-white/10 bg-white/10 text-orange-100">{priority.badge}</Badge><h2 className="mt-5 max-w-xl text-2xl font-semibold leading-tight tracking-[-.03em] text-white sm:text-3xl">{priority.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-red-50/75">{priority.description}</p><Button type="button" size="lg" className="mt-6 h-11 rounded-xl bg-white px-5 font-semibold text-brand-ink hover:bg-brand-soft" onClick={() => navigate(priority.route)}>{priority.button} <ChevronRight size={17} /></Button></div>
        <div className="relative z-10 mt-7 border-t border-white/10 pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1"><span className="text-[11px] font-bold uppercase tracking-[.14em] text-red-100/60">{priority.reference}</span><div className="mt-4 flex items-end justify-between"><div><strong className="text-3xl font-semibold tabular-nums">{priority.progress} %</strong><p className="mt-1 text-xs text-red-100/60">progression actuelle</p></div></div><Progress value={priority.progress} className="mt-4 bg-white/10 [&>div]:bg-brand-orange" />{currentAdvisor?<div className="mt-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white/10 text-xs font-bold">{currentAdvisor.initials}</span><div><strong className="block text-xs">Suivi par {currentAdvisor.name}</strong><span className="text-[11px] text-red-100/60">Responsable du dossier</span></div></div>:<div className="mt-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white/10"><Clock3 size={16}/></span><div><strong className="block text-xs">Suivi de votre dossier</strong><span className="text-[11px] text-red-100/60">Attribution automatique après prise en charge</span></div></div>}</div>
        <span className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-brand-orange/25 blur-3xl" />
      </section>

      <Card className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_35px_rgba(15,35,65,.05)]" aria-label="Résumé de votre espace">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4"><div><CardTitle className="text-base">Mon espace</CardTitle><CardDescription className="mt-1">Données enregistrées dans votre compte</CardDescription></div><Badge variant="success">Données réelles</Badge></CardHeader>
        <CardContent className="grid p-0 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard icon={ClipboardList} label="Demandes" value={`${openRequests.length} dossier${openRequests.length > 1 ? "s" : ""} en cours`} onClick={() => navigate("/espace/demandes")} />
          <InfoCard icon={FolderOpen} label="Documents" value={`${documents.length} fichier${documents.length > 1 ? "s" : ""} transmis`} onClick={() => navigate("/espace/documents")} />
          <InfoCard icon={CircleAlert} label="À corriger" value={`${correctionDocuments.length} document${correctionDocuments.length > 1 ? "s" : ""}`} onClick={() => navigate("/espace/documents")} />
          <InfoCard icon={LifeBuoy} label="Sinistres" value={`${activeClaims.length} dossier${activeClaims.length > 1 ? "s" : ""} en cours`} onClick={() => navigate("/espace/sinistres")} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="rounded-2xl bg-white shadow-[0_10px_35px_rgba(15,35,65,.04)]"><CardHeader><CardTitle className="text-lg">Actions rapides</CardTitle><CardDescription>Les démarches les plus fréquentes</CardDescription></CardHeader><CardContent className="grid gap-1">
          {[
            { label: "Demander une assurance", help: "Ouvrir un nouveau dossier", icon: Plus, route: "/espace/demandes/nouvelle" },
            { label: "Envoyer un document", help: "Compléter une demande en cours", icon: Upload, route: "/espace/documents" },
            { label: "Déclarer un sinistre", help: "Être accompagné rapidement", icon: LifeBuoy, route: "/espace/sinistres/nouveau" },
          ].map(({ label, help, icon: Icon, route }, index) => <div key={label}>{index > 0 && <Separator />}<button type="button" className="group flex w-full items-center gap-4 py-4 text-left" onClick={() => navigate(route)}><Icon size={19} className="text-slate-400 group-hover:text-brand-red" /><div className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{label}</strong><small className="mt-1 block text-xs text-slate-500">{help}</small></div><ChevronRight size={17} className="text-slate-300 group-hover:text-brand-orange" /></button></div>)}
        </CardContent></Card>
        <Card className="rounded-2xl bg-white shadow-[0_10px_35px_rgba(15,35,65,.04)]"><CardHeader><CardTitle className="text-lg">Activité récente</CardTitle><CardDescription>Les dernières évolutions de vos dossiers</CardDescription></CardHeader><CardContent className="grid gap-0">
          {recentActivities.length ? recentActivities.map((activity, index) => { const Icon = iconForKind[activity.kind] || Bell; return <div className="relative grid grid-cols-[32px_1fr] gap-3 pb-5 last:pb-0" key={activity.id}>{index < recentActivities.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-18px)] w-px bg-slate-200" />}<span className="relative z-10 grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500"><Icon size={15} /></span><button type="button" className="pt-0.5 text-left" onClick={() => navigate(activity.route)}><strong className="block text-sm leading-5 text-slate-800 hover:text-brand-red">{activity.label}</strong><small className="mt-1 block text-xs text-slate-400">{formatDate(activity.date)}</small></button></div>; }):<div className="py-8 text-center text-sm text-slate-500">Votre activité apparaîtra ici après votre première démarche.</div>}
        </CardContent></Card>
      </div>

      {!isPortalDeployment && <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 sm:px-6"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">09</span><div className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">Mode présentation</strong><span className="mt-1 block text-xs text-slate-500">Accéder directement aux neuf scénarios de démonstration</span></div><Badge variant="outline">Données fictives</Badge><ChevronRight size={18} className="text-slate-400 transition-transform group-open:rotate-90" /></summary>
        <div className="grid border-t border-slate-200 sm:grid-cols-2 xl:grid-cols-3">{store.scenarios.map((scenario) => <button type="button" className="group flex min-h-[82px] items-center gap-3 border-b border-slate-100 px-5 py-4 text-left last:border-b-0 sm:border-r" key={scenario.id} onClick={() => navigate(scenario.route)}><span className="text-xs font-bold tabular-nums text-brand-red">{String(scenario.number).padStart(2, "0")}</span><div className="min-w-0 flex-1"><strong className="block text-sm text-slate-900 group-hover:text-brand-red">{scenario.title}</strong><small className="mt-1 block text-xs leading-5 text-slate-500">{scenario.description}</small></div></button>)}</div>
      </details>}
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
        {visibleRequests.map((request) => { const ProductIcon = iconForProduct[request.product]; const vehicleKind = getRequestVehicleKind(request); return <button type="button" className="request-card" key={request.id} onClick={() => navigate(`/espace/demandes/${request.reference}`)}><span className="product-icon"><ProductIcon size={22} /></span><div className="request-main"><span className="reference">{request.reference}</span><strong>{request.productLabel}</strong>{vehicleKind && <em className="vehicle-kind-tag">{vehicleKind === "moto" ? "Moto / 2–3 roues" : "Voiture"}</em>}<small>Créée le {formatDate(request.date)}</small><small>{request.advisor?`Gérée par ${request.advisor.name}`:"En attente d’affectation"}</small></div><StatusBadge status={request.status} /><ChevronRight size={19} /></button>; })}
      </div> : <EmptyState title="Aucune demande trouvée" description="Modifiez votre recherche ou choisissez un autre statut." />}
    </div>
  );
}

export function RequestDetailPage({ reference }: { reference: string }) {
  const { store, navigate } = usePortal();
  const request = store.requests.find((item) => item.reference === reference);
  if (!request) return <NotFoundPage />;
  const vehicleKind = getRequestVehicleKind(request);
  const proposalAvailable = request.status === "proposals_available";
  const automobileRequest = request.automobileRequest;
  const delegatedAutomobileRequest = automobileRequest?.completionMode === "broker_delegation" ? automobileRequest : null;
  const selfServiceAutomobileRequest = automobileRequest && automobileRequest.completionMode !== "broker_delegation"
    ? automobileRequest as SelfServiceAutomobileInsuranceRequestData
    : null;
  const selectedGuarantees: AutoGuarantee[] = selfServiceAutomobileRequest?.coverage.guarantees?.length ? Array.from(new Set(["civil_liability", "defense_and_recours", ...selfServiceAutomobileRequest.coverage.guarantees])) : ["civil_liability", "defense_and_recours"];
  const motoRequest = request.motoRequest;
  const delegatedMotoRequest = motoRequest?.completionMode === "broker_delegation" ? motoRequest : null;
  const selfServiceMotoRequest = motoRequest && motoRequest.completionMode !== "broker_delegation"
    ? motoRequest as SelfServiceMotoInsuranceRequestData
    : null;
  const selectedMotoGuarantees: MotoGuarantee[] = selfServiceMotoRequest?.coverage.guarantees?.length ? Array.from(new Set(["civil_liability", "defense_and_recours", ...selfServiceMotoRequest.coverage.guarantees])) : ["civil_liability", "defense_and_recours"];
  const healthRequest = request.healthRequest;
  const requestAdvisor = request.advisor;
  const advisorRole = requestAdvisor?.role === "courtier" ? "Courtier responsable" : requestAdvisor ? "Responsable du dossier" : "En attente d’affectation";
  return (
    <div className="page-stack">
      <button className="back-link" type="button" onClick={() => navigate("/espace/demandes")}><ArrowLeft size={17} /> Retour aux demandes</button>
      <PageHeader eyebrow={request.reference} title={request.productLabel} description={`Demande transmise le ${formatDate(request.date)}`} action={<div className="request-header-tags">{vehicleKind && <em className="vehicle-kind-tag">{vehicleKind === "moto" ? "Moto / 2–3 roues" : "Voiture"}</em>}<StatusBadge status={request.status} /></div>} />
      {proposalAvailable && <section className="attention-card blue"><span><ClipboardList size={23} /></span><div><strong>3 propositions sont disponibles</strong><p>Votre courtier a comparé plusieurs solutions pour votre assurance automobile.</p></div><LinkButton to={`/espace/demandes/${reference}/propositions`}>Consulter les propositions</LinkButton></section>}
      {request.status === "policy_issuing" && <section className="attention-card success"><span><CheckCircle2 size={23} /></span><div><strong>Paiement reçu. Votre contrat est en cours de finalisation.</strong><p>Vous serez informé dès que la police sera disponible.</p></div></section>}
      <div className="detail-grid">
        <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Progression</span><h2>Suivi du dossier</h2></div></div><Timeline items={request.timeline} /></section>
        <aside className="panel advisor-card"><span className="page-eyebrow">Courtier chargé du dossier</span>{requestAdvisor?<><span className="large-avatar">{requestAdvisor.initials}</span><h2>{requestAdvisor.name}</h2><p>{advisorRole}. Il suit personnellement l’avancement de cette demande.</p>{requestAdvisor.phone&&<a href={`tel:${requestAdvisor.phone}`}><Phone size={17} /> {requestAdvisor.phone}</a>}<a href={`mailto:${requestAdvisor.email}`}><Mail size={17} /> {requestAdvisor.email}</a><LinkButton to="/espace/messagerie" variant="secondary"><MessageCircle size={17} /> Envoyer un message</LinkButton></>:<><span className="large-avatar"><Clock3 size={20}/></span><h2>Aucun courtier affecté</h2><p>Votre demande est encore dans la file commune. Les coordonnées du responsable apparaîtront ici dès sa prise en charge.</p></>}</aside>
      </div>
      {delegatedAutomobileRequest && <section className="panel auto-request-delegated-detail"><div className="panel-heading"><div><span className="page-eyebrow">Demande déléguée</span><h2>Votre message au courtier</h2></div></div><div className="request-comments"><span>Besoin exprimé librement</span><p>{delegatedAutomobileRequest.delegatedMessage}</p></div><p className="auto-request-detail-note"><CircleHelp size={17} /> Votre courtier vous recontactera pour compléter les informations nécessaires et préparer votre dossier.</p></section>}
      {selfServiceAutomobileRequest && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Informations fournies</span><h2>Détails de votre demande automobile</h2></div></div><div className="auto-request-detail-groups">
        <section><h3>Votre besoin</h3><div className="details-grid"><Detail label="Demande" value={autoRequestTypeLabels[selfServiceAutomobileRequest.requestType]} />{selfServiceAutomobileRequest.otherNeed && <Detail label="Précision" value={selfServiceAutomobileRequest.otherNeed} />}</div></section>
        <section><h3>Personnes liées au contrat</h3><div className="details-grid"><Detail label="Souscripteur" value={selfServiceAutomobileRequest.subscriber ? `${selfServiceAutomobileRequest.subscriber.firstName} ${selfServiceAutomobileRequest.subscriber.lastName}` : `${store.client.firstName} ${store.client.lastName}`} /><Detail label="Assuré" value={selfServiceAutomobileRequest.insured ? `${selfServiceAutomobileRequest.insured.firstName} ${selfServiceAutomobileRequest.insured.lastName}` : `${store.client.firstName} ${store.client.lastName}`} /><Detail label="Conducteur" value={!selfServiceAutomobileRequest.driver || selfServiceAutomobileRequest.driver.isSubscriber ? "Le souscripteur" : `${selfServiceAutomobileRequest.driver.firstNames} ${selfServiceAutomobileRequest.driver.lastName}`} />{selfServiceAutomobileRequest.driver && !selfServiceAutomobileRequest.driver.isSubscriber && <><Detail label="Téléphone du conducteur" value={selfServiceAutomobileRequest.driver.phone || "Non renseigné"} /><Detail label="Profession du conducteur" value={selfServiceAutomobileRequest.driver.occupation || "Non renseignée"} /><Detail label="Permis" value={`${selfServiceAutomobileRequest.driver.licenceNumber || "Non renseigné"} · catégorie ${selfServiceAutomobileRequest.driver.licenceCategory || "non renseignée"}`} /></>}</div></section>
        <section><h3>Votre véhicule</h3><div className="details-grid"><Detail label="Véhicule" value={`${selfServiceAutomobileRequest.vehicle.brand} ${selfServiceAutomobileRequest.vehicle.model}`} /><Detail label="Année" value={String(selfServiceAutomobileRequest.vehicle.year)} /><Detail label="Immatriculation" value={selfServiceAutomobileRequest.vehicle.registration} /><Detail label="Numéro de châssis" value={selfServiceAutomobileRequest.vehicle.chassisNumber || "Non renseigné"} /><Detail label="Nombre de places" value={selfServiceAutomobileRequest.vehicle.seatCount ? String(selfServiceAutomobileRequest.vehicle.seatCount) : "Non renseigné"} /><Detail label="Énergie" value={autoEnergyLabels[selfServiceAutomobileRequest.vehicle.energy]} /><Detail label="Puissance fiscale" value={`${selfServiceAutomobileRequest.vehicle.fiscalPower} CV`} /><Detail label="Usage" value={autoUsageLabels[selfServiceAutomobileRequest.vehicle.usage]} /><Detail label="Transport de matières inflammables" value={typeof selfServiceAutomobileRequest.vehicle.carriesFlammableMaterials === "boolean" ? (selfServiceAutomobileRequest.vehicle.carriesFlammableMaterials ? "Oui" : "Non") : "Non renseigné"} /><Detail label="Remorque" value={typeof selfServiceAutomobileRequest.vehicle.hasTrailer === "boolean" ? (selfServiceAutomobileRequest.vehicle.hasTrailer ? "Oui" : "Non") : "Non renseigné"} />{selfServiceAutomobileRequest.vehicle.estimatedValue !== null && <Detail label="Valeur estimée du véhicule" value={formatFcfa(selfServiceAutomobileRequest.vehicle.estimatedValue)} />}</div></section>
        <section><h3>Durée et prise d’effet</h3><div className="details-grid"><Detail label="Durée" value={`${selfServiceAutomobileRequest.coverage.durationMonths} mois`} /><Detail label="Prise d’effet" value={selfServiceAutomobileRequest.coverage.desiredStartDate ? formatDate(selfServiceAutomobileRequest.coverage.desiredStartDate) : "Date à confirmer"} /></div></section>
        <section><h3>Garanties choisies</h3><div className="details-grid"><Detail label="Garanties obligatoires" value={`${autoGuaranteeLabels.civil_liability} · ${autoGuaranteeLabels.defense_and_recours}`} /><Detail label="Garanties complémentaires" value={selectedGuarantees.filter((item) => item !== "civil_liability" && item !== "defense_and_recours").map((item) => autoGuaranteeLabels[item]).join(" · ") || "Aucune garantie complémentaire"} /></div></section>
        <section><h3>Vignette</h3><div className="details-grid"><Detail label="Le client possède une vignette" value={typeof selfServiceAutomobileRequest.hasVignette === "boolean" ? (selfServiceAutomobileRequest.hasVignette ? "Oui" : "Non") : "Non renseignée"} /></div></section>
      </div></section>}
      {delegatedMotoRequest && <section className="panel auto-request-delegated-detail"><div className="panel-heading"><div><span className="page-eyebrow">Demande déléguée</span><h2>Votre message au courtier</h2></div></div><div className="request-comments"><span>Besoin moto exprimé librement</span><p>{delegatedMotoRequest.delegatedMessage}</p></div><p className="auto-request-detail-note"><CircleHelp size={17} /> Votre courtier vous recontactera pour compléter les informations nécessaires et préparer votre dossier.</p></section>}
      {selfServiceMotoRequest && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Informations fournies</span><h2>Détails de votre demande moto</h2></div></div><div className="auto-request-detail-groups">
        <section><h3>Votre besoin</h3><div className="details-grid"><Detail label="Demande" value={autoRequestTypeLabels[selfServiceMotoRequest.requestType]} />{selfServiceMotoRequest.otherNeed && <Detail label="Précision" value={selfServiceMotoRequest.otherNeed} />}</div></section>
        <section><h3>Personnes liées au contrat</h3><div className="details-grid"><Detail label="Souscripteur" value={selfServiceMotoRequest.subscriber ? `${selfServiceMotoRequest.subscriber.firstName} ${selfServiceMotoRequest.subscriber.lastName}` : `${store.client.firstName} ${store.client.lastName}`} /><Detail label="Assuré" value={selfServiceMotoRequest.insured ? `${selfServiceMotoRequest.insured.firstName} ${selfServiceMotoRequest.insured.lastName}` : `${store.client.firstName} ${store.client.lastName}`} /><Detail label="Conducteur" value={!selfServiceMotoRequest.driver || selfServiceMotoRequest.driver.isSubscriber ? "Le souscripteur" : `${selfServiceMotoRequest.driver.firstNames} ${selfServiceMotoRequest.driver.lastName}`} />{selfServiceMotoRequest.driver && !selfServiceMotoRequest.driver.isSubscriber && <><Detail label="Téléphone du conducteur" value={selfServiceMotoRequest.driver.phone || "Non renseigné"} /><Detail label="Profession du conducteur" value={selfServiceMotoRequest.driver.occupation || "Non renseignée"} /><Detail label="Permis" value={`${selfServiceMotoRequest.driver.licenceNumber || "Non renseigné"} · catégorie ${selfServiceMotoRequest.driver.licenceCategory || "non renseignée"}`} /></>}</div></section>
        <section><h3>Votre moto</h3><div className="details-grid"><Detail label="Moto" value={`${selfServiceMotoRequest.vehicle.brand} ${selfServiceMotoRequest.vehicle.model}`} /><Detail label="Année" value={String(selfServiceMotoRequest.vehicle.year)} /><Detail label="Immatriculation" value={selfServiceMotoRequest.vehicle.registration} /><Detail label="Numéro de châssis" value={selfServiceMotoRequest.vehicle.chassisNumber || "Non renseigné"} /><Detail label="Nombre de places" value={selfServiceMotoRequest.vehicle.seatCount ? String(selfServiceMotoRequest.vehicle.seatCount) : "Non renseigné"} /><Detail label="Énergie" value={motoEnergyLabels[selfServiceMotoRequest.vehicle.energy]} /><Detail label="Cylindrée" value={`${selfServiceMotoRequest.vehicle.cylinderCapacity} cm³`} /><Detail label="Usage" value={motoUsageLabels[selfServiceMotoRequest.vehicle.usage]} /><Detail label="Transport de matières inflammables" value={typeof selfServiceMotoRequest.vehicle.carriesFlammableMaterials === "boolean" ? (selfServiceMotoRequest.vehicle.carriesFlammableMaterials ? "Oui" : "Non") : "Non renseigné"} /><Detail label="Remorque" value={typeof selfServiceMotoRequest.vehicle.hasTrailer === "boolean" ? (selfServiceMotoRequest.vehicle.hasTrailer ? "Oui" : "Non") : "Non renseigné"} />{selfServiceMotoRequest.vehicle.estimatedValue !== null && <Detail label="Valeur estimée de la moto" value={formatFcfa(selfServiceMotoRequest.vehicle.estimatedValue)} />}</div></section>
        <section><h3>Durée et prise d’effet</h3><div className="details-grid"><Detail label="Durée" value={`${selfServiceMotoRequest.coverage.durationMonths} mois`} /><Detail label="Prise d’effet" value={selfServiceMotoRequest.coverage.desiredStartDate ? formatDate(selfServiceMotoRequest.coverage.desiredStartDate) : "Date à confirmer"} /></div></section>
        <section><h3>Garanties choisies</h3><div className="details-grid"><Detail label="Garanties obligatoires" value={`${motoGuaranteeLabels.civil_liability} · ${motoGuaranteeLabels.defense_and_recours}`} /><Detail label="Garanties complémentaires" value={selectedMotoGuarantees.filter((item) => item !== "civil_liability" && item !== "defense_and_recours").map((item) => motoGuaranteeLabels[item]).join(" · ") || "Aucune garantie complémentaire"} /></div></section>
        <section><h3>Vignette</h3><div className="details-grid"><Detail label="Le client possède une vignette" value={typeof selfServiceMotoRequest.hasVignette === "boolean" ? (selfServiceMotoRequest.hasVignette ? "Oui" : "Non") : "Non renseignée"} /></div></section>
      </div></section>}
      {!automobileRequest && !motoRequest && request.vehicle && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Informations fournies</span><h2>Véhicule et couverture</h2></div></div><div className="details-grid"><Detail label="Véhicule" value={`${request.vehicle.brand} ${request.vehicle.model}`} /><Detail label="Année" value={request.vehicle.year} /><Detail label="Immatriculation" value={request.vehicle.registration} /><Detail label="Usage" value={request.vehicle.usage} />{request.vehicle.value !== null && <Detail label="Valeur estimée" value={formatFcfa(request.vehicle.value)} />}<Detail label="Couverture" value={request.coverage || "Conseil demandé"} /></div></section>}
      {healthRequest && <section className="panel health-request-detail"><div className="panel-heading"><div><span className="page-eyebrow">Questionnaire Santé</span><h2>Résumé de la demande d’adhésion</h2></div><span className="health-confidential-tag"><ShieldCheck size={14} /> Confidentiel</span></div><div className="details-grid"><Detail label="Souscripteur" value={healthRequest.subscriberName} /><Detail label="Assuré principal" value={healthRequest.insuredName || healthRequest.subscriberName} /><Detail label="Bénéficiaires" value={`${healthRequest.insuredPeople.length} personne${healthRequest.insuredPeople.length > 1 ? "s" : ""}`} /><Detail label="Déclaration signée par" value={healthRequest.signedBy} /><Detail label="Lieu et date" value={`${healthRequest.signedIn}, le ${formatDate(healthRequest.signedAt)}`} /><Detail label="Date d’effet souhaitée" value={healthRequest.insuredPeople[0]?.desiredStartDate ? formatDate(healthRequest.insuredPeople[0].desiredStartDate) : "À confirmer"} /></div><p className="auto-request-detail-note"><ShieldCheck size={17} /> Les réponses médicales détaillées ne sont pas affichées dans ce résumé. Elles doivent rester accessibles uniquement aux personnes habilitées.</p></section>}
      {request.details && !healthRequest && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Informations fournies</span><h2>Détails de votre besoin</h2></div></div><div className="details-grid">{Object.entries(request.details).map(([label, value]) => <Detail key={label} label={label} value={value} />)}</div>{request.comments && <div className="request-comments"><span>Précisions complémentaires</span><p>{request.comments}</p></div>}</section>}
      {request.documents && request.documents.length > 0 && <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Pièces transmises</span><h2>Documents rattachés à cette demande</h2><p>Seules les pièces personnelles et celles du produit concerné ont été ajoutées.</p></div><Badge variant="outline">{request.documents.length} document{request.documents.length > 1 ? "s" : ""}</Badge></div><div className="grid gap-2 sm:grid-cols-2">{request.documents.map((document) => <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3" key={document.id}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand-red"><FileText size={17} /></span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900">{document.title}</strong><small className="mt-0.5 block truncate text-xs text-slate-500">{document.fileName ?? document.type}</small></div><StatusBadge status={document.status}>{documentLabels[document.status]}</StatusBadge></div>)}</div></section>}
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
  const { store, updateStore, query } = usePortal();
  const dossierDemande = query.get("dossier") as DocumentFolderId | null;
  const dossierInitial = documentFolders.some((item) => item.id === dossierDemande) ? dossierDemande : null;
  const [folderId, setFolderId] = useState<DocumentFolderId | null>(dossierInitial);
  const [previewDocument, setPreviewDocument] = useState<ClientDocument | null>(null);
  const [operationEnCours, setOperationEnCours] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState("");
  const folder = documentFolders.find((item) => item.id === folderId);
  const libraryDocuments = store.documents.filter((document) => !document.downloadUrl);
  const slots = folderId ? documentSlotsByFolder[folderId] : [];
  const documentForSlot = (slotId: string) => libraryDocuments.find((document) => document.slotId === slotId);
  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const handleFile = async (slot: DocumentSlotDefinition, file?: File) => {
    if (!file || !folderId) return;
    setOperationEnCours(slot.id);
    setDocumentError("");
    try {
      if (isPortalDeployment) {
        const document = await televerserDocument(slot.id, file, store.client.id);
        updateStore((current) => ({
          ...current,
          documents: [document, ...current.documents.filter((item) => item.slotId !== slot.id)],
        }));
      } else {
        const contentUrl = await fileToDataUrl(file);
        updateStore((current) => saveDocumentToSlot(current, {
          slotId: slot.id,
          title: slot.title,
          category: folderId,
          type: slot.type,
          file,
          contentUrl,
        }));
      }
    } catch (caught) {
      setDocumentError(caught instanceof Error ? caught.message : "Le document n’a pas pu être envoyé.");
    } finally {
      setOperationEnCours(null);
    }
  };
  const deleteDocument = async (documentId: string) => {
    setOperationEnCours(documentId);
    setDocumentError("");
    try {
      if (isPortalDeployment) await supprimerDocumentServeur(documentId);
      updateStore((current) => removeDocument(current, documentId));
      if (previewDocument?.id === documentId) setPreviewDocument(null);
    } catch (caught) {
      setDocumentError(caught instanceof Error ? caught.message : "Le document n’a pas pu être supprimé.");
    } finally {
      setOperationEnCours(null);
    }
  };
  const preview = async (document: ClientDocument) => {
    setDocumentError("");
    try {
      if (isPortalDeployment) {
        const lien = await obtenirLienConsultation(document.id);
        setPreviewDocument({ ...document, contentUrl: lien.url });
      } else {
        setPreviewDocument(document);
      }
    } catch (caught) {
      setDocumentError(caught instanceof Error ? caught.message : "Le document ne peut pas être affiché.");
    }
  };

  if (!folder) return (
    <div className="page-stack">
      <PageHeader eyebrow="Pièces justificatives" title="Mes documents" description="Classez chaque pièce dans la rubrique prévue afin qu’elle soit utilisée dans les bonnes démarches." />
      <div className="document-folders-grid">
        {documentFolders.map((item) => {
          const itemSlots = documentSlotsByFolder[item.id];
          const count = itemSlots.filter((slot) => Boolean(documentForSlot(slot.id)?.fileName)).length;
          return <button className="document-folder-card" type="button" onClick={() => setFolderId(item.id)} key={item.id}><span className="document-folder-icon"><item.icon size={25} /></span><div><h2>{item.label}</h2><p>{item.description}</p><small>{count} sur {itemSlots.length} pièce{itemSlots.length > 1 ? "s" : ""} ajoutée{count > 1 ? "s" : ""}</small></div><ChevronRight size={20} /></button>;
        })}
      </div>
    </div>
  );

  return (
    <div className="page-stack">
      <button className="back-link" type="button" onClick={() => setFolderId(null)}><ArrowLeft size={17} /> Retour aux dossiers</button>
      <PageHeader eyebrow="Dossier documentaire" title={folder.label} description={folder.description} />
      {documentError && <div className="form-alert error" role="alert"><CircleAlert size={17} /> {documentError}</div>}
      <div className="document-guidance"><ShieldCheck size={20} /><div><strong>Ajoutez uniquement les pièces indiquées ci-dessous.</strong><span>Chaque fichier sera automatiquement classé et proposé dans les démarches concernées.</span></div></div>
      <div className="documents-grid">{slots.map((slot) => {
        const document = documentForSlot(slot.id);
        const hasFile = Boolean(document?.fileName);
        const disabled = operationEnCours === slot.id || operationEnCours === document?.id;
        return <article className={`document-card ${document?.status ?? "required"}`} key={slot.id}><div className="document-top"><span className="document-icon"><FileText size={22} /></span><StatusBadge status={document?.status ?? "required"}>{document ? documentLabels[document.status] : "À fournir"}</StatusBadge></div><h3>{slot.title}</h3><p>{document?.fileName || "Aucun fichier transmis"}</p>{document?.correctionMessage && <div className="correction-message"><CircleAlert size={17} /><span>{document.correctionMessage}</span></div>}<div className="document-footer">{hasFile && document ? <button className="button button-secondary" type="button" disabled={disabled} onClick={() => { void preview(document); }}><Eye size={17} /> Voir</button> : null}<label className={`button ${hasFile ? "button-secondary" : "button-primary"} upload-label ${disabled ? "is-disabled" : ""}`}><Upload size={17} /> {disabled ? "Traitement…" : hasFile ? "Remplacer" : "Ajouter le document"}<input type="file" disabled={disabled} accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => { void handleFile(slot, event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>{hasFile && document && <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="ghost" disabled={disabled} className="document-delete-button"><Trash2 size={16} /> Supprimer</Button></AlertDialogTrigger><AlertDialogContent className="portal-dialog"><AlertDialogHeader><AlertDialogTitle>Supprimer ce fichier ?</AlertDialogTitle><AlertDialogDescription>« {document.fileName} » sera retiré. La rubrique « {slot.title} » restera disponible pour un nouvel envoi.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { void deleteDocument(document.id); }}>Supprimer le fichier</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div></article>;
      })}</div>
      <p className="simulation-note"><CircleAlert size={16} /> Formats acceptés : PDF, JPG et PNG. Les fichiers restent classés dans la rubrique choisie.</p>
      <Dialog open={Boolean(previewDocument)} onOpenChange={(open) => { if (!open) setPreviewDocument(null); }}>
        <DialogContent className="portal-dialog document-preview-dialog">
          <DialogHeader><DialogTitle>{previewDocument?.title}</DialogTitle><DialogDescription>{previewDocument?.fileName}</DialogDescription></DialogHeader>
          <div className="document-preview-frame">{previewDocument?.contentUrl?.startsWith("data:image/") ? <img src={previewDocument.contentUrl} alt={previewDocument.title} /> : previewDocument?.contentUrl ? <iframe src={previewDocument.contentUrl} title={previewDocument.title} /> : null}</div>
        </DialogContent>
      </Dialog>
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
    <section className="policy-hero"><div><span className="policy-icon"><ShieldCheck size={28} /></span><div><small>Votre police d’assurance est disponible.</small><h2>{contract.policyNumber}</h2></div></div><div className="policy-downloads">{documents.slice(0, 3).map((document) => <a className="button button-secondary" href={assetUrl(document.downloadUrl || "")} download key={document.id}><Download size={17} /> {document.type}</a>)}</div></section>
    <Tabs defaultValue="resume" className="contract-tabs"><TabsList className="contract-tabs-list"><TabsTrigger value="resume">Résumé</TabsTrigger><TabsTrigger value="garanties">Garanties</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="paiements">Paiements</TabsTrigger><TabsTrigger value="sinistres">Sinistres</TabsTrigger></TabsList>
      <TabsContent value="resume"><section className="panel"><div className="details-grid"><Detail label="Numéro de police" value={contract.policyNumber} /><Detail label="Produit" value={contract.productLabel} /><Detail label="Compagnie" value={contract.provider} /><Detail label="Date d’effet" value={formatDate(contract.effectiveDate)} /><Detail label="Expiration" value={formatDate(contract.expirationDate)} /><Detail label="Prime annuelle" value={formatFcfa(contract.premium)} /></div></section></TabsContent>
      <TabsContent value="garanties"><section className="panel"><h2>Garanties incluses</h2><ul className="guarantee-list large">{contract.guarantees.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul></section></TabsContent>
      <TabsContent value="documents"><section className="panel mini-list">{documents.map((document) => <a href={assetUrl(document.downloadUrl || "")} download key={document.id}><FileText size={20} /><div><strong>{document.title}</strong><small>{document.fileName || "Document de démonstration"}</small></div><Download size={18} /></a>)}</section></TabsContent>
      <TabsContent value="paiements"><section className="panel mini-list">{payments.map((payment) => <div key={payment.id}><WalletCards size={20} /><div><strong>{payment.reference}</strong><small>{formatDate(payment.date)}</small></div><strong>{formatFcfa(payment.amount)}</strong></div>)}</section></TabsContent>
      <TabsContent value="sinistres"><section className="panel mini-list">{claims.map((claim) => <button type="button" onClick={() => navigate(`/espace/sinistres/${claim.reference}`)} key={claim.id}><LifeBuoy size={20} /><div><strong>{claim.reference}</strong><small>{claim.type}</small></div><ChevronRight size={18} /></button>)}</section></TabsContent>
    </Tabs>
  </div>;
}

export function ClaimsPage() {
  const { store, navigate } = usePortal();
  const claims = store.claims.filter((claim) => claim.scope === "core");
  const activeClaims = claims.filter((claim) => claim.status !== "closed").length;
  const closedClaims = claims.length - activeClaims;
  const claimDocuments = store.documents.filter((document) => documentFolderId(document) === "sinistres" && Boolean(document.fileName || document.downloadUrl)).length;

  return <div className="grid gap-6 lg:gap-8">
    <PageHeader eyebrow="Assistance et suivi" title="Mes sinistres" description="Déclarez un événement, retrouvez vos pièces et suivez chaque étape du traitement." />

    <aside className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-[0_8px_28px_rgba(120,53,15,.05)] sm:grid-cols-[auto_1fr] sm:items-center sm:p-6" role="note" aria-label="Conseil en cas d’accident">
      <span className="grid size-12 place-items-center rounded-2xl bg-white text-amber-700 shadow-sm"><HeartHandshake size={23} aria-hidden="true" /></span>
      <div><span className="text-[11px] font-bold uppercase tracking-[.14em] text-amber-700">Sensibilisation</span><h2 className="mt-1 text-lg font-semibold text-slate-950">En cas d’accident, gardez votre calme</h2><p className="mt-1 text-sm leading-6 text-slate-700">Un accident n’est pas un acte prémédité. N’agressez pas l’autre personne impliquée, quelle que soit sa responsabilité.</p></div>
    </aside>

    <section className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <Card className="relative overflow-hidden border-0 bg-[linear-gradient(120deg,#6f0912_0%,#b8141e_64%,#e5691c_135%)] text-white shadow-[0_22px_55px_rgba(108,12,20,.18)]">
        <CardContent className="relative z-10 grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
          <div className="max-w-2xl"><span className="text-[11px] font-bold uppercase tracking-[.16em] text-orange-100/80">Assistance immédiate</span><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-white sm:text-3xl">Un incident vient de se produire ?</h2><p className="mt-3 max-w-xl text-sm leading-6 text-red-50/80">Décrivez la situation et transmettez les premiers justificatifs. Votre courtier suit ensuite le dossier avec vous.</p></div>
          <LinkButton to="/espace/sinistres/nouveau" className="border-0 bg-white text-brand-red shadow-sm hover:bg-orange-50"><Plus size={18} /> Déclarer un sinistre</LinkButton>
        </CardContent>
        <span className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full border-[42px] border-white/5" />
      </Card>

      <Card className="rounded-2xl bg-white shadow-[0_10px_35px_rgba(15,35,65,.04)]">
        <CardContent className="grid divide-y divide-slate-100 p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
          {[{ label: "En cours", value: activeClaims, icon: Clock3 }, { label: "Pièces classées", value: claimDocuments, icon: FolderOpen }, { label: "Clôturés", value: closedClaims, icon: CheckCircle2 }].map(({ label, value, icon: Icon }) => <div className="flex min-h-[92px] min-w-0 items-center gap-3 px-4 py-4 xl:min-h-0" key={label}><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-red"><Icon size={18} /></span><div className="min-w-0"><strong className="block text-xl font-semibold tabular-nums text-slate-950">{value}</strong><span className="block truncate text-xs text-slate-500">{label}</span></div></div>)}
        </CardContent>
      </Card>
    </section>

    <section className="grid gap-4">
      <div className="flex items-end justify-between gap-4"><div><span className="text-[11px] font-bold uppercase tracking-[.15em] text-brand-red">Vos dossiers</span><h2 className="mt-1 text-xl font-semibold tracking-[-.025em] text-slate-950">Suivi des déclarations</h2></div><Badge variant="outline">{claims.length} dossier{claims.length > 1 ? "s" : ""}</Badge></div>
      {claims.length > 0 ? <div className="grid gap-3">{claims.map((claim) => {
        const completedSteps = claim.timeline.filter((step) => step.done).length;
        const progress = claim.status === "closed" ? 100 : Math.round((completedSteps / Math.max(claim.timeline.length, 1)) * 100);
        const currentStep = claim.timeline.find((step) => step.active)?.label ?? (claim.status === "closed" ? "Dossier clôturé" : "Déclaration reçue");
        return <button type="button" onClick={() => navigate(`/espace/sinistres/${claim.reference}`)} className="group grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_8px_28px_rgba(15,35,65,.035)] transition hover:border-red-200 hover:shadow-[0_14px_34px_rgba(94,10,19,.08)] sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-center" key={claim.id}>
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-red"><LifeBuoy size={22} /></span>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">{claim.reference}</span><StatusBadge status={claim.status}>{claimStatusLabels[claim.status] ?? claim.status}</StatusBadge></div><strong className="mt-2 block text-[15px] font-semibold text-slate-950 group-hover:text-brand-red">{claim.productLabel} · {claim.type}</strong><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span><CalendarDays size={13} className="mr-1 inline" />{formatDate(claim.date)}</span><span><MapPin size={13} className="mr-1 inline" />{claim.location}</span><span>{claim.advisor ? `Suivi par ${claim.advisor.name}` : "Attribution en cours"}</span></div><div className="mt-4 flex items-center gap-3"><Progress value={progress} className="h-1.5 max-w-sm bg-slate-100 [&>div]:bg-brand-orange" /><span className="shrink-0 text-[11px] font-semibold text-slate-500">{currentStep}</span></div></div>
          <span className="hidden size-9 place-items-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-brand-red group-hover:text-brand-red sm:grid"><ChevronRight size={17} /></span>
        </button>;
      })}</div> : <Card className="overflow-hidden rounded-2xl border-dashed bg-white/80"><CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-start"><span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-red"><LifeBuoy size={25} /></span><div><h3 className="text-lg font-semibold text-slate-950">Aucun dossier pour le moment</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Lorsqu’un sinistre sera déclaré, vous retrouverez ici son statut, votre interlocuteur et l’avancement du traitement.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["01", "Déclarez", "Renseignez l’événement"], ["02", "Transmettez", "Ajoutez les justificatifs"], ["03", "Suivez", "Consultez chaque évolution"]].map(([number, title, help]) => <div className="rounded-xl border border-slate-100 bg-slate-50 p-4" key={number}><span className="text-xs font-bold text-brand-red">{number}</span><strong className="mt-2 block text-sm text-slate-900">{title}</strong><small className="mt-1 block text-xs text-slate-500">{help}</small></div>)}</div></div></CardContent></Card>}
    </section>
  </div>;
}

export function ClaimDetailPage({ reference }: { reference: string }) {
  const { store, navigate } = usePortal();
  const claim = store.claims.find((item) => item.reference === reference);
  if (!claim) return <NotFoundPage />;
  const declaration = claim.autoDeclaration;
  const injuredPeople = declaration ? [...declaration.injuriesInVehicle, ...declaration.otherInjuries] : [];
  const circumstancesA = declaration?.circumstances.filter((item) => item.vehicleA).map((item) => item.label).filter(Boolean) ?? [];
  const circumstancesB = declaration?.circumstances.filter((item) => item.vehicleB).map((item) => item.label).filter(Boolean) ?? [];
  const documents = store.documents.filter((document) => documentFolderId(document) === "sinistres" && Boolean(document.fileName || document.downloadUrl));

  return <div className="page-stack">
    <button className="back-link" type="button" onClick={() => navigate("/espace/sinistres")}><ArrowLeft size={17} /> Retour aux sinistres</button>
    <PageHeader eyebrow={claim.reference} title={`${claim.type} — ${claim.productLabel}`} description={`Déclaré le ${formatDate(claim.date)}`} action={<StatusBadge status={claim.status}>{claim.status === "closed" ? "Clôturé" : "En traitement"}</StatusBadge>} />
    <div className="detail-grid">
      <section className="panel"><div className="panel-heading"><div><span className="page-eyebrow">Progression</span><h2>Suivi du sinistre</h2></div></div><Timeline items={claim.timeline} /></section>
      <aside className="panel"><span className="page-eyebrow">Détails</span><div className="stack-details"><Detail label="Contrat" value={claim.contractId} /><Detail label="Lieu" value={claim.location} /><Detail label="Description" value={claim.description} /><Detail label="Interlocuteur" value={claim.advisor?.name ?? "En attente de prise en charge"} />{claim.advisor && <><Detail label="Téléphone" value={claim.advisor.phone} /><Detail label="Email" value={claim.advisor.email} /></>}</div></aside>
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
          <Detail label="Attestation" value={formatAutoClaimDate(declaration.attestedAt)} />
        </div>
        {declaration.narrative && <div className="request-comments"><span>Déroulement de l’accident</span><p>{declaration.narrative}</p></div>}
      </section>
    </>}

    <section className="panel">
      <div className="panel-heading"><div><span className="page-eyebrow">Dossier documentaire</span><h2>Justificatifs du sinistre</h2></div><button className="button button-secondary" type="button" onClick={() => navigate("/espace/documents?dossier=sinistres")}>{documents.length ? "Gérer les documents" : "Ajouter des documents"}</button></div>
      {documents.length > 0 ? <ul className="plain-list">{documents.map((document) => <li key={document.id}><FileText size={16} /><span>{document.title}{document.fileName ? ` · ${document.fileName}` : ""}</span></li>)}</ul> : <p className="text-sm text-slate-500">Aucun justificatif n’a encore été déposé dans le dossier « Sinistres ».</p>}
    </section>
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
  const open = (id: string, route: string) => { updateStore(markNotificationRead(store, id)); if (isPortalDeployment) void marquerNotificationLue(id); navigate(route); };
  const toutMarquerCommeLu = () => { updateStore({ ...store, notifications: store.notifications.map((item) => ({ ...item, read: true })) }); if (isPortalDeployment) void marquerToutesNotificationsLues(); };
  return <div className="page-stack"><PageHeader eyebrow="Centre de notifications" title="Mes notifications" description="Retrouvez en temps réel les mises à jour importantes de vos demandes, documents et sinistres." action={store.notifications.some((item)=>!item.read)?<button type="button" className="button button-secondary" onClick={toutMarquerCommeLu}>Tout marquer comme lu</button>:undefined} />{store.notifications.length?<div className="notifications-list">{store.notifications.map((notification) => { const Icon = iconForKind[notification.kind] || Bell; return <button type="button" className={notification.read ? "read" : "unread"} key={notification.id} onClick={() => open(notification.id, notification.route)}><span className={`notification-icon ${notification.kind}`}><Icon size={20} /></span><div><strong>{notification.title}</strong><p>{notification.body}</p><small>{new Date(notification.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</small></div>{!notification.read && <em>Nouveau</em>}<ChevronRight size={18} /></button>; })}</div>:<EmptyState icon={Bell} title="Aucune notification" text="Les mises à jour de vos dossiers apparaîtront ici."/>}</div>;
}

export function ProfilePage() {
  const { store, updateStore, navigate } = usePortal();
  const [draft, setDraft] = useState(store.client);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fullName = `${store.client.firstName} ${store.client.lastName}`.trim();
  const initials = `${store.client.firstName[0] || ""}${store.client.lastName[0] || ""}`.toUpperCase() || "CL";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const compte = await mettreAJourMonCompte({
        nomComplet: `${draft.firstName} ${draft.lastName}`.trim(),
        numeroTelephone: draft.phone,
        adresse: draft.address,
        ville: draft.city,
        preferences: draft.preferences,
      });
      const storeAuthentifie = appliquerCompteAuthentifie(store, compte);
      updateStore(updateProfile(storeAuthentifie, {
        ...draft,
        firstName: storeAuthentifie.client.firstName,
        lastName: storeAuthentifie.client.lastName,
        email: compte.adresse_email,
        phone: compte.numero_telephone,
      }));
      setDraft((current) => ({
        ...current,
        firstName: storeAuthentifie.client.firstName,
        lastName: storeAuthentifie.client.lastName,
        email: compte.adresse_email,
        phone: compte.numero_telephone,
      }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La mise à jour du profil a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      await deconnecter();
    } finally {
      updateStore(signOut(store));
      if (import.meta.env.PROD) window.location.assign("/login/");
      else navigate("/");
    }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Informations personnelles" title="Mon profil" description="Tenez vos coordonnées et vos préférences de notification à jour." />
      <form className="profile-layout" onSubmit={submit}>
        <section className="panel">
          <div className="profile-identity">
            <span className="profile-avatar">{initials}</span>
            <div><h2>{fullName}</h2><p>Compte client · {store.client.id}</p></div>
          </div>
          {saved && <div className="form-alert success" role="status"><CheckCircle2 size={17} /> Vos modifications ont été enregistrées.</div>}
          {error && <div className="form-alert error" role="alert">{error}</div>}
          <div className="form-grid">
            <label>Prénom<input value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} required /></label>
            <label>Nom<input value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} /></label>
            <label>Téléphone<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} type="tel" autoComplete="tel" required /></label>
            <label>Email<input type="email" value={draft.email} readOnly aria-readonly="true" /><small className="field-hint">L’adresse liée à votre mode de connexion ne peut pas être modifiée ici.</small></label>
            <label>Adresse<input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label>
            <label>Ville<input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} /></label>
          </div>
        </section>
        <aside className="panel preferences">
          <span className="page-eyebrow">Préférences</span>
          <h2>Notifications</h2>
          <p>Choisissez comment vous souhaitez être informé.</p>
          {([['email','Email'],['whatsapp','WhatsApp'],['inApp','Notification application']] as const).map(([key, label]) => <label className="switch-row" key={key}><span>{label}</span><input type="checkbox" checked={draft.preferences[key]} onChange={(event) => setDraft({ ...draft, preferences: { ...draft.preferences, [key]: event.target.checked } })} /></label>)}
          <button className="button button-primary full" type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer les modifications"}</button>
          <Button className="mt-3 w-full rounded-xl" variant="outline" type="button" onClick={logout}><LogOut size={16} /> Se déconnecter</Button>
        </aside>
      </form>
    </div>
  );
}

export function HelpPage() {
  const { store, navigate } = usePortal();
  return <div className="page-stack"><PageHeader eyebrow="Nous sommes là" title="Besoin d’aide ?" description="Votre courtier reste disponible pour répondre à vos questions." /><section className="help-hero"><img className="help-hero-photo" src={assetUrl("/images/advisor-amina.webp")} alt="" aria-hidden="true" /><span className="large-avatar">{store.advisor.initials}</span><div><span className="page-eyebrow">Votre conseillère</span><h2>{store.advisor.name}</h2><p>Une question sur une offre, un document ou un sinistre ? Contactez votre interlocutrice dédiée.</p></div><div className="help-actions"><a className="button button-secondary" href={`tel:${store.advisor.phone}`}><Phone size={18} /> Appeler</a><button className="button button-primary" type="button" onClick={() => navigate("/espace/messagerie")}><MessageCircle size={18} /> Envoyer un message</button></div></section><div className="help-grid"><article className="panel"><Phone size={22} /><h3>Téléphone</h3><p>{store.advisor.phone}</p><small>Du lundi au vendredi, de 8h à 17h</small></article><article className="panel"><Mail size={22} /><h3>Email</h3><p>{store.advisor.email}</p><small>Adresse fictive de démonstration</small></article><article className="panel"><MapPin size={22} /><h3>À distance</h3><p>Toutes vos démarches en ligne</p><small>Aucun déplacement nécessaire</small></article></div></div>;
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
