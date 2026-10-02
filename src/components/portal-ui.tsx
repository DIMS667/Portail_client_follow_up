import { Check, Circle, Clock3, ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DocumentStatus, RequestStatus, StatusEvent } from "../types/domain";
import { usePortal } from "../app/portal-context";

const requestLabels: Record<RequestStatus, string> = {
  new: "Nouvelle demande",
  under_review: "En cours d’analyse",
  proposals_available: "Propositions disponibles",
  offer_selected: "Offre sélectionnée",
  documents_required: "Documents à compléter",
  payment_pending: "Paiement à effectuer",
  policy_issuing: "Contrat en préparation",
  policy_available: "Police disponible",
  completed: "Finalisée",
};

const documentLabels: Record<DocumentStatus, string> = {
  required: "À fournir",
  received: "Reçu",
  reviewing: "En vérification",
  validated: "Validé",
  correction_required: "À corriger",
};

export function StatusBadge({ status, children }: { status?: string; children?: ReactNode }) {
  const label = children ?? (status && requestLabels[status as RequestStatus]) ?? (status && documentLabels[status as DocumentStatus]) ?? status;
  const variant = status === "active" || status === "validated" || status === "succeeded" || status === "completed" || status === "closed"
    ? "success"
    : status === "correction_required" || status === "failed"
      ? "destructive"
      : status === "proposals_available" || status === "payment_pending" || status === "eligible"
        ? "info"
        : status === "policy_issuing" || status === "reviewing" || status === "under_review"
          ? "warning"
          : "outline";
  return <Badge variant={variant} className="gap-1.5 whitespace-nowrap"><span className="size-1.5 rounded-full bg-current opacity-70" />{label}</Badge>;
}

export function Timeline({ items }: { items: StatusEvent[] }) {
  return (
    <ol className="relative grid gap-0" aria-label="Progression">
      {items.map((item, index) => (
        <li className="relative grid min-h-[68px] grid-cols-[32px_1fr] gap-3 pb-4 last:min-h-0 last:pb-0" key={`${item.label}-${index}`} aria-current={item.active ? "step" : undefined}>
          {index < items.length - 1 && <span className={cn("absolute left-[15px] top-8 h-[calc(100%-18px)] w-px", item.done ? "bg-blue-400" : "bg-slate-200")} />}
          <span className={cn("relative z-10 grid size-8 place-items-center rounded-full border bg-white", item.done ? "border-blue-600 bg-blue-600 text-white" : item.active ? "border-blue-500 text-blue-600 ring-4 ring-blue-50" : "border-slate-200 text-slate-300")}>
            {item.done ? <Check size={14} strokeWidth={3} /> : item.active ? <Clock3 size={14} /> : <Circle size={9} fill="currentColor" />}
          </span>
          <div className="grid content-start gap-1 pt-1"><strong className={cn("text-sm", item.active || item.done ? "text-slate-900" : "text-slate-400")}>{item.label}</strong>{item.at && <small className="text-xs text-slate-500">{item.at}</small>}</div>
        </li>
      ))}
    </ol>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">{eyebrow && <span className="text-[11px] font-bold uppercase tracking-[.16em] text-blue-600">{eyebrow}</span>}<h1 className="mt-1 text-[clamp(1.8rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-.035em] text-slate-950">{title}</h1>{description && <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-600">{description}</p>}</div>
      {action && <div className="shrink-0 [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  );
}

export function InfoCard({ icon: Icon, label, value, helper, onClick }: { icon: LucideIcon; label: string; value: string; helper?: string; onClick?: () => void }) {
  return (
    <button className="group flex min-h-[74px] min-w-0 items-center gap-3 border-b border-slate-200 px-1 py-3 text-left last:border-b-0 hover:text-blue-700 sm:border-b-0 sm:border-r sm:px-4 sm:last:border-r-0" onClick={onClick} type="button">
      <Icon size={19} className="shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
      <span className="min-w-0 flex-1"><small className="block text-[11px] font-medium text-slate-500">{label}</small><strong className="mt-0.5 block truncate text-sm font-semibold text-slate-900 group-hover:text-blue-700">{value}</strong>{helper && <em className="mt-0.5 block text-xs not-italic text-slate-500">{helper}</em>}</span>
      <ChevronRight size={16} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
    </button>
  );
}

export function LinkButton({ to, children, variant = "primary", className = "" }: { to: string; children: ReactNode; variant?: "primary" | "secondary" | "quiet"; className?: string }) {
  const { navigate } = usePortal();
  const shadcnVariant = variant === "primary" ? "default" : variant === "secondary" ? "outline" : "ghost";
  return <Button type="button" variant={shadcnVariant} size="lg" className={cn("h-11 rounded-xl font-semibold", className)} onClick={() => navigate(to)}>{children}</Button>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <Card className="border-dashed bg-white/70"><CardContent className="grid justify-items-center gap-3 py-12 text-center"><span className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400"><Circle size={20} /></span><h3 className="text-base font-semibold text-slate-900">{title}</h3><p className="max-w-md text-sm leading-6 text-slate-500">{description}</p>{action}</CardContent></Card>;
}

export { requestLabels, documentLabels };
