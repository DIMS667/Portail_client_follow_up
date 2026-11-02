import type { PortalStore } from "../types/domain";

export function createInitialStore(): PortalStore {
  return {
    version: 1,
    session: { authenticated: false },
    credentials: { email: "", phone: "", password: "" },
    client: {
      id: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      preferences: { email: true, whatsapp: false, inApp: true },
    },
    advisor: {
      id: "followup-team",
      name: "Equipe Follow-Up",
      phone: "+237694983565",
      email: "",
      initials: "FU",
    },
    requests: [],
    proposals: [],
    offers: [],
    documents: [],
    payments: [],
    contracts: [],
    renewals: [],
    claims: [],
    messages: [],
    notifications: [],
    activities: [],
  };
}
