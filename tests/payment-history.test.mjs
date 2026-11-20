import assert from "node:assert/strict";
import test from "node:test";
import { isOfferChoiceLocked, mapPaymentRecord, mapPaymentSchedule } from "../src/services/payment-history.ts";

const record = { id: "pay-1", reference: "PAY-TEST", demande_reference: "DEM-TEST", offre_id: "off-1", montant_xaf: 99000, numero_telephone: "", statut: "reussi", cree_le: "2026-11-19T14:00:00Z" };

test("un paiement manuel conserve sa date réelle, son moyen et sa référence sans inventer de contrat", () => {
  const payment = mapPaymentRecord({ ...record, source: "manuel", mode_paiement: "especes", date_paiement: "2026-11-17", reference_transaction: "RECU-123", confirme_le: record.cree_le });
  assert.equal(payment.date, "2026-11-17");
  assert.equal(payment.method, "cash");
  assert.equal(payment.transactionReference, "RECU-123");
  assert.equal(payment.confirmedAt, record.cree_le);
  assert.equal(payment.contractId, undefined);
  assert.equal(payment.status, "succeeded");
});

test("les modes manuels et les anciennes transactions Mobile Money restent identifiables", () => {
  for (const [mode, expected] of [["especes", "cash"], ["virement", "bank_transfer"], ["mtn_momo", "mtn_momo"], ["orange_money", "orange_money"]]) {
    assert.equal(mapPaymentRecord({ ...record, source: "manuel", mode_paiement: mode }).method, expected);
  }
  assert.equal(mapPaymentRecord({ ...record, operateur: "ORANGE" }).method, "orange_money");
  assert.equal(mapPaymentRecord({ ...record, operateur: "MTN" }).method, "mtn_momo");
  assert.equal(mapPaymentRecord(record).date, "2026-11-19");
});

test("seul un paiement confirmé du dossier bloque le changement de choix", () => {
  const request = { reference: "DEM-TEST", status: "offer_selected" };
  assert.equal(isOfferChoiceLocked(request, []), false);
  assert.equal(isOfferChoiceLocked(request, [mapPaymentRecord({ ...record, statut: "en_attente" })]), false);
  assert.equal(isOfferChoiceLocked(request, [mapPaymentRecord({ ...record, statut: "echoue" })]), false);
  assert.equal(isOfferChoiceLocked(request, [mapPaymentRecord({ ...record, demande_reference: "AUTRE" })]), false);
  assert.equal(isOfferChoiceLocked(request, [mapPaymentRecord(record)]), true);
  assert.equal(isOfferChoiceLocked({ ...request, status: "policy_available" }, []), true);
});

test("une fraction conserve sa période sans transformer son reçu en suivi annuel actuel", () => {
  const payment = mapPaymentRecord({ ...record, montant_xaf: 33000, fraction_debut_mois: 3, fraction_duree_mois: 3, detail_fraction: { date_debut: "2027-02-20", date_fin: "2027-05-20", total_encaisse_xaf: 66000, termine: false } });
  assert.deepEqual(payment.fraction, { startMonth: 3, durationMonths: 3, periodStart: "2027-02-20", periodEnd: "2027-05-20" });
  assert.equal(payment.amount, 33000);
  assert.equal(payment.paidTotal, undefined);
  assert.equal(payment.completed, undefined);
  assert.equal(mapPaymentRecord(record).fraction, undefined);
  assert.equal(mapPaymentRecord({ ...record, fraction_debut_mois: 10, fraction_duree_mois: 4 }).fraction, undefined);
});

const schedule = { offre_id: "off-1", offre_reference: "OFF-TEST", demande_reference: "DEM-TEST", annee_debut: "2026-11-20", annee_fin: "2027-11-20", prime_annuelle_xaf: 100000, plafond_xaf: 105000, total_encaisse_xaf: 66000, solde_plafond_xaf: 39000, mois_regles: 6, termine: false, surcout_fractionnement_xaf: 0 };

test("le suivi reprend le cumul et le plafond du serveur sans prétendre que la marge est une dette", () => {
  assert.deepEqual(mapPaymentSchedule(schedule), {
    offerId: "off-1", offerReference: "OFF-TEST", requestId: "DEM-TEST",
    annualStart: "2026-11-20", annualEnd: "2027-11-20", annualPremium: 100000,
    cap: 105000, paidTotal: 66000, capAvailable: 39000, monthsPaid: 6, completed: false, extraCost: 0,
  });
  const settled = mapPaymentSchedule({ ...schedule, total_encaisse_xaf: 100000, solde_plafond_xaf: 5000, mois_regles: 12, termine: true });
  assert.equal(settled.completed, true);
  assert.equal(settled.capAvailable, 5000);
  assert.equal(settled.extraCost, 0);
});

test("un suivi absent ou incomplet ne reçoit aucun prix annuel inventé", () => {
  for (const value of [null, [], {}, { ...schedule, prime_annuelle_xaf: undefined }, { ...schedule, total_encaisse_xaf: "66000" }, { ...schedule, total_encaisse_xaf: -1 }, { ...schedule, mois_regles: 13 }, { ...schedule, demande_reference: undefined }]) {
    assert.equal(mapPaymentSchedule(value), undefined);
  }
});
