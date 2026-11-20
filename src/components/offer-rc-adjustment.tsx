import { formatFcfa } from "../services/portal-service";
import type { OfferRcAdjustment } from "../types/domain";

export function OfferRcAdjustmentDetails({ adjustment }: { adjustment?: OfferRcAdjustment }) {
  if (!adjustment) return null;
  if (adjustment.rate === 0) return <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><h3 className="font-semibold text-slate-900">RC au tarif normal</h3><strong className="tabular-nums">{formatFcfa(adjustment.adjustedPremium)}</strong></div>
    {adjustment.reasons.length > 0 && <p className="mt-1 text-xs text-slate-600">{adjustment.reasons.join(" · ")}</p>}
  </div>;
  const isIncrease = adjustment.rate > 0;
  return <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
    <h3 className="text-sm font-semibold text-slate-900">Ajustement de la responsabilité civile</h3>
    {adjustment.reasons.length > 0 && <p className="mt-1 text-xs text-slate-600">{adjustment.reasons.join(" · ")}</p>}
    <dl className="mt-3 grid gap-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-slate-600">RC avant ajustement</dt><dd className="font-semibold tabular-nums">{formatFcfa(adjustment.originalPremium)}</dd></div>
      <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-slate-600">{isIncrease ? "Majoration" : "Réduction"} de {Math.abs(adjustment.rate).toLocaleString("fr-FR")} %</dt><dd className="font-semibold tabular-nums">{isIncrease ? "+" : "−"}{formatFcfa(Math.abs(adjustment.adjustment))}</dd></div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2"><dt className="font-semibold text-slate-900">RC retenue dans l’offre</dt><dd className="font-semibold tabular-nums">{formatFcfa(adjustment.adjustedPremium)}</dd></div>
    </dl>
    <p className="mt-3 text-xs text-slate-500">Cet ajustement est déjà compris dans le prix de la garantie responsabilité civile affiché ci-dessus.</p>
  </div>;
}
