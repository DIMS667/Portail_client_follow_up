import type { AutomobilePartySnapshot, Client, RequestBeneficiary } from "../types/domain";

export function profileParty(client: Client): AutomobilePartySnapshot {
  return { firstName: client.firstName, lastName: client.lastName, phone: client.phone, email: client.email, address: client.address, city: client.city };
}

export function beneficiaryToApi(beneficiary: RequestBeneficiary) {
  const person = beneficiary.insured;
  return { pour_autrui: beneficiary.kind === "other", profil_confirme: true as const, assure: {
    prenom: person.firstName, nom: person.lastName, telephone: person.phone,
    adresse_email: person.email || null, adresse: person.address, ville: person.city,
  } };
}

export type BeneficiaryApi = ReturnType<typeof beneficiaryToApi>;
export function beneficiaryFromApi(value?: BeneficiaryApi | null): RequestBeneficiary | undefined {
  if (!value) return undefined;
  return { kind: value.pour_autrui ? "other" : "self", profileConfirmed: true, insured: {
    firstName: value.assure.prenom, lastName: value.assure.nom, phone: value.assure.telephone || "",
    email: value.assure.adresse_email || "", address: value.assure.adresse || "", city: value.assure.ville || "",
  } };
}
