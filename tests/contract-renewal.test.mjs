import assert from "node:assert/strict";
import test from "node:test";
import { carRenewalVehicle, isRenewalDue, mapRenewableContract, motoRenewalVehicle } from "../src/services/contract-renewal.ts";

test("le renouvellement est limité aux échéances entre aujourd'hui et trente jours inclus", () => {
  assert.equal(isRenewalDue("2026-11-20", "2026-11-20"), true);
  assert.equal(isRenewalDue("2026-12-20", "2026-11-20"), true);
  assert.equal(isRenewalDue("2026-12-21", "2026-11-20"), false);
  assert.equal(isRenewalDue("2026-11-19", "2026-11-20"), false);
  assert.equal(isRenewalDue("2026-02-30", "2026-02-01"), false);
  assert.equal(isRenewalDue("", "2026-11-20"), false);
});

test("un contrat à renouveler conserve sa vraie identité et son véhicule", () => {
  const contract = mapRenewableContract({
    id: "contrat-client", reference: "CTR-2026-00001", numero_police: "ROY-001",
    date_expiration: "2026-12-01", sous_type_automobile: "voiture",
    vehicule: { marque: "Renault", modele: "Clio", immatriculation: "LT 456 CD", numero_chassis: "ABCDEFGHIJKLMNOPQ",
      date_premiere_mise_circulation: "2020-06-02", energie: "diesel", puissance_fiscale: 7,
      nombre_places: 5, usage: "cat1_tourisme", zone_circulation_principale: "B", possede_remorque: false },
  });
  assert.ok(contract);
  assert.equal(contract.id, "contrat-client");
  assert.equal(contract.vehicleKind, "car");
  const vehicle = carRenewalVehicle(contract);
  assert.equal(vehicle.brand, "Renault");
  assert.equal(vehicle.fiscalPower, "7");
  assert.equal(vehicle.chassisNumber, "ABCDEFGHIJKLMNOPQ");
  assert.equal(vehicle.energy, "diesel");
  assert.equal(vehicle.circulationArea, "B");
  assert.equal(vehicle.estimatedValue, "");
  assert.equal(vehicle.carriesFlammableMaterials, null);
  assert.equal(vehicle.hasTrailer, false);
});

test("une moto conserve ses données sans leur substituer des valeurs d'exemple", () => {
  const contract = mapRenewableContract({ id: "moto", reference: "CTR-MOTO", date_expiration: "2026-12-01",
    sous_type_automobile: "moto_deux_trois_roues", vehicule: { marque: "Honda", cylindree_cm3: 110, usage: "cat5_bis" } });
  assert.ok(contract);
  assert.equal(contract.vehicleKind, "moto");
  const vehicle = motoRenewalVehicle(contract);
  assert.equal(vehicle.brand, "Honda");
  assert.equal(vehicle.cylinderCapacity, "110");
  assert.equal(vehicle.usage, "cat5_bis");
  assert.equal(vehicle.energy, "");
  assert.equal(vehicle.seatCount, "");
});

test("des contrats mal formés ne deviennent pas des choix de renouvellement", () => {
  assert.equal(mapRenewableContract(null), undefined);
  assert.equal(mapRenewableContract({ id: "absent" }), undefined);
  assert.equal(mapRenewableContract({ id: "id", reference: "ref", date_expiration: "2026-12-01",
    sous_type_automobile: "sante", vehicule: {} }), undefined);
});
