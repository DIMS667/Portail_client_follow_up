import type { InsuranceRequest, Payment, PaymentMethod, PaymentSchedule } from "../types/domain";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  mobile_money: "Mobile Money", mtn_momo: "MTN MoMo", orange_money: "Orange Money",
  bank_card: "Carte bancaire", bank_transfer: "Virement", cash: "Espèces",
};

export interface PaymentApiRecord {
  id: string;
  reference: string;
  demande_reference: string;
  offre_id: string;
  montant_xaf: number;
  numero_telephone: string;
  statut: "initialisation" | "en_attente" | "reussi" | "echoue" | "a_verifier";
  operateur?: string | null;
  code_ussd?: string | null;
  contrat_reference?: string | null;
  cree_le: string;
  source?: string;
  mode_paiement?: string | null;
  reference_transaction?: string | null;
  date_paiement?: string | null;
  confirme_le?: string | null;
  fraction_debut_mois?: number | null;
  fraction_duree_mois?: number | null;
  detail_fraction?: Record<string, unknown> | null;
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function mapPaymentSchedule(value: unknown): PaymentSchedule | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const amounts = [record.prime_annuelle_xaf, record.plafond_xaf, record.total_encaisse_xaf, record.solde_plafond_xaf, record.surcout_fractionnement_xaf];
  if (typeof record.offre_id !== "string" || !record.offre_id
    || typeof record.offre_reference !== "string" || !record.offre_reference
    || typeof record.demande_reference !== "string" || !record.demande_reference
    || !isDate(record.annee_debut) || !isDate(record.annee_fin)
    || amounts.some(value => typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    || typeof record.mois_regles !== "number" || !Number.isInteger(record.mois_regles) || record.mois_regles < 0 || record.mois_regles > 12
    || typeof record.termine !== "boolean") return undefined;
  return {
    offerId: record.offre_id, offerReference: record.offre_reference, requestId: record.demande_reference,
    annualStart: record.annee_debut, annualEnd: record.annee_fin,
    annualPremium: record.prime_annuelle_xaf as number, cap: record.plafond_xaf as number,
    paidTotal: record.total_encaisse_xaf as number, capAvailable: record.solde_plafond_xaf as number,
    monthsPaid: record.mois_regles, completed: record.termine, extraCost: record.surcout_fractionnement_xaf as number,
  };
}

function paymentMethod(record: PaymentApiRecord): PaymentMethod {
  switch (record.mode_paiement) {
    case "especes": return "cash";
    case "virement": return "bank_transfer";
    case "mtn_momo": return "mtn_momo";
    case "orange_money": return "orange_money";
    case "bank_card": return "bank_card";
  }
  const operator = record.operateur?.trim().toUpperCase();
  return operator === "MTN" ? "mtn_momo" : operator === "ORANGE" ? "orange_money" : "mobile_money";
}

export function mapPaymentRecord(record: PaymentApiRecord): Payment {
  const startMonth = record.fraction_debut_mois;
  const durationMonths = record.fraction_duree_mois;
  const fraction = typeof startMonth === "number" && Number.isInteger(startMonth) && startMonth >= 0
    && typeof durationMonths === "number" && Number.isInteger(durationMonths) && durationMonths > 0 && startMonth + durationMonths <= 12
    ? {
      startMonth, durationMonths,
      periodStart: isDate(record.detail_fraction?.date_debut) ? record.detail_fraction.date_debut : undefined,
      periodEnd: isDate(record.detail_fraction?.date_fin) ? record.detail_fraction.date_fin : undefined,
    } : undefined;
  return {
    id: record.id,
    reference: record.reference,
    contractId: record.contrat_reference ?? undefined,
    requestId: record.demande_reference,
    amount: record.montant_xaf,
    date: record.date_paiement || record.cree_le.slice(0, 10),
    method: paymentMethod(record),
    status: record.statut === "reussi" ? "succeeded" : record.statut === "echoue" ? "failed" : "pending",
    providerStatus: record.statut,
    phone: record.numero_telephone || undefined,
    operator: record.operateur ?? undefined,
    ussdCode: record.code_ussd ?? undefined,
    source: record.source ?? "campay",
    transactionReference: record.reference_transaction ?? undefined,
    confirmedAt: record.confirme_le ?? undefined,
    fraction,
  };
}

export function isOfferChoiceLocked(request: Pick<InsuranceRequest, "reference" | "status">, payments: readonly Payment[]) {
  return request.status === "policy_available" || request.status === "completed"
    || payments.some((payment) => payment.requestId === request.reference && payment.status === "succeeded");
}
