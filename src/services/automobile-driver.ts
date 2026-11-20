import type { AutomobileDriver, AutomobileDriverOccupationCategory } from "../types/domain";

export const driverOccupationOptions: ReadonlyArray<{ value: AutomobileDriverOccupationCategory; label: string }> = [
  { value: "delegue_medical", label: "Délégué médical" },
  { value: "delegue_inspecteur_commercial", label: "Délégué ou inspecteur commercial" },
  { value: "publicite", label: "Publiciste, agence ou agent de publicité" },
  { value: "agent_attache_delegue_commercial", label: "Agent, attaché ou délégué commercial" },
  { value: "inspecteur_voyageur_commerce", label: "Inspecteur commercial ou voyageur de commerce" },
  { value: "representant_inspecteur_ventes", label: "Représentant commercial ou inspecteur des ventes" },
  { value: "photographe_reporter", label: "Photographe reporter" },
  { value: "gardiennage_securite", label: "Société de gardiennage ou de sécurité" },
  { value: "boulangerie", label: "Boulangerie" },
  { value: "clerge", label: "Membre du clergé" },
  { value: "autre", label: "Autre profession" },
];

export function driverOccupationLabel(category: AutomobileDriverOccupationCategory | "", occupation: string) {
  if (!category || category === "autre") return occupation.trim();
  return driverOccupationOptions.find((option) => option.value === category)?.label ?? "";
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateAutomobileDriver(
  driver: Omit<AutomobileDriver, "isSubscriber" | "occupationCategory"> & {
    isSubscriber: boolean | null;
    occupationCategory: AutomobileDriverOccupationCategory | "";
  },
  today: string,
) {
  const errors: Record<string, string> = {};
  if (driver.isSubscriber === null) {
    errors["driver-is-subscriber"] = "Indiquez si le souscripteur est également le conducteur habituel.";
  }
  if (driver.isSubscriber === false) {
    if (!driver.lastName?.trim()) errors["driver-last-name"] = "Renseignez le nom du conducteur.";
    if (!driver.firstNames?.trim()) errors["driver-first-names"] = "Renseignez les prénoms du conducteur.";
    if (!driver.phone?.trim()) errors["driver-phone"] = "Renseignez le téléphone du conducteur.";
  }
  const birth = driver.birthDate ?? "";
  const issued = driver.licenceIssuedOn ?? "";
  const validity = driver.licenceValidUntil ?? "";
  if (!isCalendarDate(birth) || birth >= today) {
    errors["driver-birth-date"] = "Indiquez une date de naissance valide, antérieure à aujourd’hui.";
  }
  if (!driverOccupationOptions.some((option) => option.value === driver.occupationCategory)) {
    errors["driver-occupation-category"] = "Choisissez la profession du conducteur habituel.";
  } else if (driver.occupationCategory === "autre") {
    if (!driver.occupation?.trim()) errors["driver-occupation"] = "Précisez le métier réellement exercé.";
    else if (driver.occupation.trim().length > 120) errors["driver-occupation"] = "Le métier doit contenir au maximum 120 caractères.";
  }
  if (!driver.licenceNumber?.trim()) errors["driver-licence-number"] = "Renseignez le numéro du permis.";
  if (!driver.licenceCategory?.trim()) errors["driver-licence-category"] = "Renseignez la catégorie du permis.";
  if (!isCalendarDate(issued) || issued > today) {
    errors["driver-licence-issued-on"] = "Indiquez une date d’obtention du permis valide, au plus tard aujourd’hui.";
  } else if (isCalendarDate(birth) && issued <= birth) {
    errors["driver-licence-issued-on"] = "Le permis doit avoir été obtenu après la naissance du conducteur.";
  }
  if (!isCalendarDate(validity)) {
    errors["driver-licence-valid-until"] = "Indiquez une date de validité du permis valide.";
  } else if (isCalendarDate(issued) && validity < issued) {
    errors["driver-licence-valid-until"] = "La validité du permis ne peut pas précéder sa date d’obtention.";
  }
  return errors;
}
