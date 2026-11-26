import { metierDuProfil, trouverMetier } from "./metiers";
import type { AutomobileDriver, AutomobileDriverOccupationCategory } from "../types/domain";

export const carLicenceCategories = ["B", "C", "D", "E", "F", "G"] as const;

export function driverOccupationLabel(category: AutomobileDriverOccupationCategory | "", occupation: string) {
  return metierDuProfil(occupation, category)?.libelle ?? occupation.trim();
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
  const metier = trouverMetier(driver.occupation);
  if (!metier || metier.categorie !== driver.occupationCategory) {
    errors["driver-occupation-category"] = "Choisissez le métier du conducteur habituel dans la liste.";
  }
  if (!driver.licenceNumber?.trim()) errors["driver-licence-number"] = "Renseignez le numéro du permis.";
  if (!carLicenceCategories.some(category => category === driver.licenceCategory)) errors["driver-licence-category"] = "Choisissez une catégorie de permis de B à G.";
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
