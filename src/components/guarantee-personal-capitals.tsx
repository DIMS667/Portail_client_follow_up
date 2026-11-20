import { formatFcfa } from "../services/portal-service";
import type { PersonalCoverageCapitals } from "../types/domain";

export function GuaranteePersonalCapitals({ capitals }: { capitals: PersonalCoverageCapitals }) {
  return <dl className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs" aria-label="Capitaux assurés">
    <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-slate-600">Décès</dt><dd className="font-semibold tabular-nums">{formatFcfa(capitals.death)}</dd></div>
    <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-slate-600">Invalidité</dt><dd className="font-semibold tabular-nums">{formatFcfa(capitals.disability)}</dd></div>
    <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-slate-600">Frais de traitement</dt><dd className="font-semibold tabular-nums">{formatFcfa(capitals.treatment)}</dd></div>
  </dl>;
}
