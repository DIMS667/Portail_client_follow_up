import { siteConfig } from "../data/site-config";

export function LinkedInLink() {
  if (!siteConfig.linkedin) return null;

  return (
    <a
      className="public-social-link"
      href={siteConfig.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Follow-Up Insurance sur LinkedIn (nouvel onglet)"
    >
      <img src="/images/linkedin.svg" width={28} height={28} alt="" />
    </a>
  );
}
