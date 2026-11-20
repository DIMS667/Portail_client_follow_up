import assert from "node:assert/strict";
import test from "node:test";
import { driverOccupationLabel, validateAutomobileDriver } from "../src/services/automobile-driver.ts";

const today = "2026-11-19";
const driver = {
  isSubscriber: true,
  birthDate: "1990-02-28",
  occupationCategory: "autre",
  occupation: "Enseignant",
  licenceNumber: "LT-001",
  licenceCategory: "B",
  licenceIssuedOn: "2010-06-01",
  licenceValidUntil: "2030-06-01",
};

test("les informations professionnelles et le permis sont requis même pour le souscripteur", () => {
  assert.deepEqual(validateAutomobileDriver(driver, today), {});
  const errors = validateAutomobileDriver({ ...driver, birthDate: "", licenceIssuedOn: "", occupationCategory: "" }, today);
  assert.ok(errors["driver-birth-date"]);
  assert.ok(errors["driver-licence-issued-on"]);
  assert.ok(errors["driver-occupation-category"]);
});

test("Autre exige le métier réel et le conserve", () => {
  assert.ok(validateAutomobileDriver({ ...driver, occupation: "   " }, today)["driver-occupation"]);
  assert.equal(driverOccupationLabel("autre", "  Mécanicien automobile  "), "Mécanicien automobile");
  assert.equal(driverOccupationLabel("clerge", "Enseignant"), "Membre du clergé");
  assert.deepEqual(validateAutomobileDriver({ ...driver, occupationCategory: "clerge", occupation: "" }, today), {});
});

test("le conducteur distinct doit fournir sa propre identité", () => {
  const errors = validateAutomobileDriver({ ...driver, isSubscriber: false }, today);
  assert.ok(errors["driver-first-names"]);
  assert.ok(errors["driver-last-name"]);
  assert.ok(errors["driver-phone"]);
  assert.deepEqual(validateAutomobileDriver({ ...driver, isSubscriber: false, firstNames: "Alice", lastName: "Test", phone: "690000000" }, today), {});
});

test("les dates impossibles, futures ou contradictoires sont refusées", () => {
  for (const birthDate of ["2026-02-30", today, "2027-01-01"]) {
    assert.ok(validateAutomobileDriver({ ...driver, birthDate }, today)["driver-birth-date"]);
  }
  for (const licenceIssuedOn of ["2026-02-30", "2027-01-01", driver.birthDate, "1980-01-01"]) {
    assert.ok(validateAutomobileDriver({ ...driver, licenceIssuedOn }, today)["driver-licence-issued-on"]);
  }
  assert.ok(validateAutomobileDriver({ ...driver, licenceValidUntil: "2009-01-01" }, today)["driver-licence-valid-until"]);
  assert.deepEqual(validateAutomobileDriver({ ...driver, birthDate: "1992-02-29" }, today), {});
});
