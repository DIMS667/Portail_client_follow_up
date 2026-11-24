import {
  AboutPublicPage, AdviceArticlePublicPage, AdvicePublicPage, BusinessesPublicPage,
  ClaimsPublicPage, ContactPublicPage, FaqPublicPage, IndividualsPublicPage,
  LegalPublicPage, PublicNotFoundPage, SolutionDetailPublicPage, SolutionsPublicPage,
} from "../public-site/pages/content-pages";
import type { AdviceArticleSlug, SolutionSlug } from "../public-site/data/public-pages";

const solutionSlugs = new Set<SolutionSlug>([
  "automobile", "sante", "vie-capitalisation", "habitation", "voyage", "entreprise", "caution",
]);
const adviceArticleSlugs = new Set<AdviceArticleSlug>([
  "choisir-assurance-automobile", "preparer-assurance-voyage", "proteger-activite-professionnelle",
]);

export default function PublicContentRoute({ pathname }: { pathname: string }) {
  if (pathname === "/a-propos") return <AboutPublicPage />;
  if (pathname === "/solutions") return <SolutionsPublicPage />;
  if (/^\/solutions\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split("/")[2]) as SolutionSlug;
    return solutionSlugs.has(slug) ? <SolutionDetailPublicPage slug={slug} /> : <PublicNotFoundPage />;
  }
  if (pathname === "/particuliers") return <IndividualsPublicPage />;
  if (pathname === "/entreprises") return <BusinessesPublicPage />;
  if (pathname === "/sinistres") return <ClaimsPublicPage />;
  if (pathname === "/conseils") return <AdvicePublicPage />;
  if (/^\/conseils\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split("/")[2]) as AdviceArticleSlug;
    return adviceArticleSlugs.has(slug) ? <AdviceArticlePublicPage slug={slug} /> : <PublicNotFoundPage />;
  }
  if (pathname === "/contact") return <ContactPublicPage />;
  if (pathname === "/faq") return <FaqPublicPage />;
  if (pathname === "/mentions-legales") return <LegalPublicPage kind="mentions-legales" />;
  if (pathname === "/confidentialite") return <LegalPublicPage kind="confidentialite" />;
  if (pathname === "/conditions-utilisation") return <LegalPublicPage kind="conditions-utilisation" />;
  return <PublicNotFoundPage />;
}
