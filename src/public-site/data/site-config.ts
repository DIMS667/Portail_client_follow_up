export interface SiteConfig {
  name: string;
  signature: string;
  phones: readonly {
    label: string;
    href: string;
  }[];
  email: string;
  address: string;
  openingHours: string;
  whatsapp: string;
  facebook: string;
  linkedin: string;
  instagram: string;
}

export const siteConfig: SiteConfig = {
  name: "Follow-Up Insurance",
  signature: "Allez en toute quiétude",
  phones: [
    { label: "+237 694 98 35 65", href: "tel:+237694983565" },
    { label: "+237 699 55 23 99", href: "tel:+237699552399" },
    { label: "+237 677 30 00 65", href: "tel:+237677300065" },
  ],
  email: "",
  address: "12830 Yaoundé, Odza, entrée Koweït",
  openingHours: "",
  whatsapp: "",
  facebook: "",
  linkedin: "",
  instagram: "",
};
