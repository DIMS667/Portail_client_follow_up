import type { AutoVehicleUsage, AutomobileVehicleKind } from "../types/domain";

export interface RenewableContract {
  id: string;
  reference: string;
  policyNumber?: string;
  expirationDate: string;
  vehicleKind: AutomobileVehicleKind;
  vehicle: Record<string, unknown>;
}

function calendarDay(value: string): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value ? parsed.valueOf() / 86400000 : undefined;
}

export function isRenewalDue(expirationDate: string, today: string): boolean {
  const expiry = calendarDay(expirationDate);
  const current = calendarDay(today);
  return expiry !== undefined && current !== undefined && expiry >= current && expiry - current <= 30;
}

export function mapRenewableContract(value: unknown): RenewableContract | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.reference !== "string"
    || typeof item.date_expiration !== "string" || calendarDay(item.date_expiration) === undefined
    || !["voiture", "moto_deux_trois_roues"].includes(String(item.sous_type_automobile))
    || !item.vehicule || typeof item.vehicule !== "object" || Array.isArray(item.vehicule)) return undefined;
  return {
    id: item.id, reference: item.reference,
    policyNumber: typeof item.numero_police === "string" ? item.numero_police : undefined,
    expirationDate: item.date_expiration,
    vehicleKind: item.sous_type_automobile === "voiture" ? "car" : "moto",
    vehicle: item.vehicule as Record<string, unknown>,
  };
}

const text = (value: unknown) => typeof value === "string" ? value : "";
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? String(value) : "";
const optionalBoolean = (value: unknown) => typeof value === "boolean" ? value : null;
const usages: Record<string, AutoVehicleUsage> = {
  cat1_tourisme: "cat1_tourism", cat1_professionnel: "cat1_tourism",
  cat2_transport_produits: "cat2_product_transport", cat3_transport_marchandises_tiers: "cat3_transport",
  cat4a_taxi_ville: "cat4a_city_taxi", cat4b_transport_urbain: "cat4a_city_taxi",
  cat4b_transport_interurbain: "cat4b_interurban_transport",
  cat4c_transport_personnel_eleves: "cat4c_staff_students_transport", cat7_enseignement_conduite: "cat7_driving_school",
  cat8_location: "cat8_rental", cat9_engins_chantier: "cat9_mobile_construction",
  cat10a_vehicules_speciaux: "cat10a_special", cat10b_collectivites_publiques: "cat10b_public_authorities",
  cat10c_tracteurs_agricoles_forestiers: "cat10c_agricultural_forestry_tractors",
};

function commonVehicle(contract: RenewableContract) {
  const vehicle = contract.vehicle;
  return {
    brand: text(vehicle.marque), model: text(vehicle.modele),
    firstRegistrationDate: text(vehicle.date_premiere_mise_circulation), registration: text(vehicle.immatriculation),
    seatCount: number(vehicle.nombre_places), chassisNumber: text(vehicle.numero_chassis),
    estimatedValue: number(vehicle.valeur_estimee),
    carriesFlammableMaterials: optionalBoolean(vehicle.transporte_matieres_inflammables),
    hasTrailer: optionalBoolean(vehicle.possede_remorque),
  };
}

export function carRenewalVehicle(contract: RenewableContract) {
  return {
    ...commonVehicle(contract), category: "tourism" as const,
    energy: contract.vehicle.energie === "diesel" ? "diesel" as const : contract.vehicle.energie === "essence" ? "petrol" as const : "" as const,
    fiscalPower: number(contract.vehicle.puissance_fiscale),
    circulationArea: text(contract.vehicle.zone_circulation_principale),
    usage: usages[String(contract.vehicle.usage)] ?? "" as const,
  };
}

export function motoRenewalVehicle(contract: RenewableContract) {
  return {
    ...commonVehicle(contract),
    energy: contract.vehicle.energie === "electrique" ? "electric" as const : contract.vehicle.energie === "essence" ? "petrol" as const : "" as const,
    cylinderCapacity: number(contract.vehicle.cylindree_cm3),
    usage: contract.vehicle.usage === "cat5_bis" ? "cat5_bis" as const : contract.vehicle.usage === "cat5" ? "cat5" as const : "" as const,
  };
}
