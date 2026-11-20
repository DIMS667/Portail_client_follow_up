import type { OfferRcAdjustment, PersonalCoverageCapitals } from "../types/domain";

export function mapPersonalCoverage(value: unknown): PersonalCoverageCapitals | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const capitals = value as Record<string, unknown>;
  const { deces_xaf, invalidite_xaf, frais_traitement_xaf } = capitals;
  if (typeof deces_xaf !== "number" || !Number.isFinite(deces_xaf) || deces_xaf < 0
    || typeof invalidite_xaf !== "number" || !Number.isFinite(invalidite_xaf) || invalidite_xaf < 0
    || typeof frais_traitement_xaf !== "number" || !Number.isFinite(frais_traitement_xaf) || frais_traitement_xaf < 0) return undefined;
  return { death: deces_xaf, disability: invalidite_xaf, treatment: frais_traitement_xaf };
}

export function mapRcAdjustment(value: unknown): OfferRcAdjustment | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const correction = value as Record<string, unknown>;
  const { prime_initiale_xaf, taux_pourcent, montant_xaf, prime_corrigee_xaf } = correction;
  if (correction.base !== "rc"
    || typeof prime_initiale_xaf !== "number" || !Number.isFinite(prime_initiale_xaf)
    || typeof taux_pourcent !== "number" || !Number.isFinite(taux_pourcent)
    || typeof montant_xaf !== "number" || !Number.isFinite(montant_xaf)
    || typeof prime_corrigee_xaf !== "number" || !Number.isFinite(prime_corrigee_xaf)) return undefined;
  return {
    originalPremium: prime_initiale_xaf,
    rate: taux_pourcent,
    adjustment: montant_xaf,
    adjustedPremium: prime_corrigee_xaf,
    reasons: Array.isArray(correction.motifs) ? correction.motifs.filter((motif): motif is string => typeof motif === "string") : [],
    referenceDate: typeof correction.date_reference === "string" ? correction.date_reference : "",
  };
}
