import { Check, Circle, Clock3, ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
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
  const tone = status === "active" || status === "validated" || status === "succeeded" || status === "completed" || status === "closed"
    ? "success"
    : status === "correction_required" || status === "failed"
      ? "danger"
      : status === "proposals_available" || status === "payment_pending" || status === "eligible"
        ? "blue"
        : "neutral";
  return <span className={`status-badge ${tone}`}><span />{label}</span>;
}

export function Timeline({ items }: { items: StatusEvent[] }) {
  return (
    <ol className="timeline">
      {items.map((item, index) => (
        <li className={item.done ? "done" : item.active ? "active" : ""} key={`${item.label}-${index}`}>
          <span className="timeline-icon">{item.done ? <Check size={15} /> : item.active ? <Clock3 size={15} /> : <Circle size={12} />}</span>
          <div><strong>{item.label}</strong>{item.at && <small>{item.at}</small>}</div>
        </li>
      ))}
    </ol>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="page-header">
      <div>{eyebrow && <span className="page-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}

export function InfoCard({ icon: Icon, label, value, helper, onClick }: { icon: LucideIcon; label: string; value: string; helper?: string; onClick?: () => void }) {
  return (
    <button className="info-card" onClick={onClick} type="button">
      <span className="info-card-icon"><Icon size={22} /></span>
      <span className="info-card-copy"><small>{label}</small><strong>{value}</strong>{helper && <em>{helper}</em>}</span>
      <ChevronRight size={18} />
    </button>
  );
}

export function LinkButton({ to, children, variant = "primary", className = "" }: { to: string; children: ReactNode; variant?: "primary" | "secondary" | "quiet"; className?: string }) {
  const { navigate } = usePortal();
  return <button type="button" className={`button button-${variant} ${className}`} onClick={() => navigate(to)}>{children}</button>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span><Circle size={20} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export { requestLabels, documentLabels };
