import assert from "node:assert/strict";
import test from "node:test";
import { mapPersonalCoverage, mapRcAdjustment } from "../src/services/offer-pricing.ts";

test("les trois capitaux de l’IPT sont conservés indépendamment de sa prime", () => {
  assert.deepEqual(mapPersonalCoverage({ deces_xaf: 1000000, invalidite_xaf: 1000000, frais_traitement_xaf: 100000 }), {
    death: 1000000, disability: 1000000, treatment: 100000,
  });
});

test("une ancienne offre ou des capitaux incomplets ne reçoivent aucune valeur inventée", () => {
  assert.equal(mapPersonalCoverage(undefined), undefined);
  assert.equal(mapPersonalCoverage({ deces_xaf: 1000000 }), undefined);
  assert.equal(mapPersonalCoverage({ deces_xaf: -1, invalidite_xaf: 1000000, frais_traitement_xaf: 100000 }), undefined);
});

test("les anciennes offres sans correction restent lisibles", () => {
  assert.equal(mapRcAdjustment(undefined), undefined);
  assert.equal(mapRcAdjustment(null), undefined);
  assert.equal(mapRcAdjustment({ base: "prime_nette" }), undefined);
});

test("une majoration et une réduction gardent leur signe et les montants du serveur", () => {
  for (const taux of [-10, 10]) {
    const adjustment = mapRcAdjustment({
      base: "rc", date_reference: "2026-12-01", prime_initiale_xaf: 60000,
      taux_pourcent: taux, montant_xaf: taux * 600, prime_corrigee_xaf: 60000 + taux * 600,
      motifs: ["Profession du conducteur", null],
    });
    assert.equal(adjustment.rate, taux);
    assert.equal(adjustment.adjustment, taux * 600);
    assert.equal(adjustment.adjustedPremium, 60000 + taux * 600);
    assert.deepEqual(adjustment.reasons, ["Profession du conducteur"]);
  }
});

test("une correction incomplète ne produit pas de montants fictifs", () => {
  assert.equal(mapRcAdjustment({ base: "rc", prime_initiale_xaf: 60000, taux_pourcent: 10, montant_xaf: 6000 }), undefined);
});

test("le tarif normal conserve la RC sans ajouter de majoration ou de réduction", () => {
  const adjustment = mapRcAdjustment({
    base: "rc", date_reference: "2026-12-01", prime_initiale_xaf: 60000,
    taux_pourcent: 0, montant_xaf: 0, prime_corrigee_xaf: 60000,
    motifs: ["Membre du clergé : tarif normal"],
  });
  assert.equal(adjustment.rate, 0);
  assert.equal(adjustment.adjustment, 0);
  assert.equal(adjustment.originalPremium, adjustment.adjustedPremium);
});
