import {
  adviceArticleBySlug,
  publicPageRegistry,
  solutionPages,
  type AdviceArticleSlug,
  type SolutionSlug,
} from "./public-pages.ts";
import { siteConfig } from "./site-config.ts";

export const PUBLIC_ORIGIN = "https://followupassurance.com";
export const PUBLIC_SITE_NAME = "Follow-Up Insurance";

const DEFAULT_SOCIAL_IMAGE = "/images/public-hero-collage.webp";
const SOCIAL_IMAGE_OVERRIDES: Readonly<Record<string, string>> = {
  "/images/public-hero-collage.png": "/images/public-hero-collage.webp",
  "/images/public-claims-advisor.png": "/images/public-claims-advisor.webp",
  "/images/public-entrepreneur.png": "/images/public-entrepreneur.webp",
  "/images/public-role-advisor.png": "/images/public-role-advisor.webp",
};
const ORGANIZATION_ID = `${PUBLIC_ORIGIN}/#organization`;
const WEBSITE_ID = `${PUBLIC_ORIGIN}/#website`;

export interface SeoBreadcrumb {
  name: string;
  path: string;
}

export interface SeoRouteDefinition {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  openGraphType?: "website" | "article";
  canonicalPath?: string;
  indexable?: boolean;
  breadcrumbs?: readonly SeoBreadcrumb[];
}

export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  image: string;
  imageAlt: string;
  openGraphType: "website" | "article";
  jsonLd?: Record<string, unknown>;
}

interface ResolveSeoOptions {
  portal?: boolean;
}

const homeRoute: SeoRouteDefinition = {
  title: "Follow-Up Insurance | Courtier en assurances au Cameroun",
  description:
    "Follow-Up Insurance, courtier en assurances à Yaoundé au Cameroun, vous accompagne pour comparer et choisir vos solutions d’assurance.",
  image: DEFAULT_SOCIAL_IMAGE,
  imageAlt: "Les solutions d’assurance proposées par Follow-Up Insurance",
  breadcrumbs: [{ name: "Accueil", path: "/" }],
};

const landingRoutes = Object.values(publicPageRegistry).map((page) => [
  page.path,
  {
    title: page.metaTitle,
    description: page.metaDescription,
    image: SOCIAL_IMAGE_OVERRIDES[page.hero.image.src] ?? page.hero.image.src,
    imageAlt: page.hero.image.alt,
    breadcrumbs: [
      { name: "Accueil", path: "/" },
      { name: page.hero.eyebrow, path: page.path },
    ],
  } satisfies SeoRouteDefinition,
] as const);

const solutionRoutes = Object.values(solutionPages).map((page) => [
  page.path,
  {
    title: page.metaTitle,
    description: page.metaDescription,
    image: SOCIAL_IMAGE_OVERRIDES[page.hero.image.src] ?? page.hero.image.src,
    imageAlt: page.hero.image.alt,
    breadcrumbs: [
      { name: "Accueil", path: "/" },
      { name: "Nos solutions", path: "/solutions" },
      { name: page.shortTitle, path: page.path },
    ],
  } satisfies SeoRouteDefinition,
] as const);

const articleRoutes = Object.values(adviceArticleBySlug).map((article) => [
  article.path,
  {
    title: `${article.title} | Follow-Up Insurance`,
    description: article.excerpt,
    image: article.image.src,
    imageAlt: article.image.alt,
    openGraphType: "article",
    breadcrumbs: [
      { name: "Accueil", path: "/" },
      { name: "Conseils", path: "/conseils" },
      { name: article.title, path: article.path },
    ],
  } satisfies SeoRouteDefinition,
] as const);

export const PUBLIC_SEO_ROUTE_MANIFEST: Readonly<Record<string, SeoRouteDefinition>> = {
  "/": homeRoute,
  ...Object.fromEntries(landingRoutes),
  ...Object.fromEntries(solutionRoutes),
  ...Object.fromEntries(articleRoutes),
};

export const PUBLIC_INDEXABLE_ROUTES: readonly string[] = Object.freeze(
  Object.keys(PUBLIC_SEO_ROUTE_MANIFEST),
);

const legalRoutes: Readonly<Record<string, SeoRouteDefinition>> = {
  "/mentions-legales": {
    title: "Mentions légales | Follow-Up Insurance",
    description: "Informations relatives à l’éditeur et à l’exploitation du site Follow-Up Insurance.",
    image: DEFAULT_SOCIAL_IMAGE,
    imageAlt: "Follow-Up Insurance",
    indexable: false,
  },
  "/confidentialite": {
    title: "Politique de confidentialité | Follow-Up Insurance",
    description: "Découvrez comment Follow-Up Insurance collecte, utilise, protège, conserve et supprime les données personnelles, y compris lors de la connexion Google.",
    image: DEFAULT_SOCIAL_IMAGE,
    imageAlt: "Follow-Up Insurance",
    indexable: false,
  },
  "/conditions-utilisation": {
    title: "Conditions d’utilisation | Follow-Up Insurance",
    description: "Règles générales applicables à la consultation du site Follow-Up Insurance.",
    image: DEFAULT_SOCIAL_IMAGE,
    imageAlt: "Follow-Up Insurance",
    indexable: false,
  },
};

const authRoutes: Readonly<Record<string, SeoRouteDefinition>> = {
  "/login": {
    title: "Connexion à l’espace client | Follow-Up Insurance",
    description: "Connectez-vous à votre espace client Follow-Up Insurance.",
    image: DEFAULT_SOCIAL_IMAGE,
    imageAlt: "Follow-Up Insurance",
    indexable: false,
  },
  "/connexion": {
    title: "Connexion à l’espace client | Follow-Up Insurance",
    description: "Connectez-vous à votre espace client Follow-Up Insurance.",
    image: DEFAULT_SOCIAL_IMAGE,
    imageAlt: "Follow-Up Insurance",
    canonicalPath: "/login",
    indexable: false,
  },
  "/inscription": {
    title: "Créer un compte | Follow-Up Insurance",
    description: "Créez votre espace client Follow-Up Insurance.",
    image: DEFAULT_SOCIAL_IMAGE,
    imageAlt: "Follow-Up Insurance",
    indexable: false,
  },
  "/mot-de-passe-oublie": {
    title: "Mot de passe oublié | Follow-Up Insurance",
    description: "Accédez à la procédure de récupération de votre espace client Follow-Up Insurance.",
    image: DEFAULT_SOCIAL_IMAGE,
    imageAlt: "Follow-Up Insurance",
    indexable: false,
  },
};

const legacyRoutes: Readonly<Record<string, SeoRouteDefinition>> = {
  "/solutions/moto": {
    ...PUBLIC_SEO_ROUTE_MANIFEST["/solutions/automobile"],
    canonicalPath: "/solutions/automobile",
    indexable: false,
  },
};

function normalizePath(pathname: string) {
  const pathOnly = pathname.split(/[?#]/, 1)[0] || "/";
  if (pathOnly === "/") return "/";
  return `/${pathOnly.replace(/^\/+|\/+$/g, "")}`;
}

function canonicalUrl(path: string) {
  const normalizedPath = normalizePath(path);
  return normalizedPath === "/"
    ? `${PUBLIC_ORIGIN}/`
    : `${PUBLIC_ORIGIN}${normalizedPath}/`;
}

function absoluteAssetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${PUBLIC_ORIGIN}/${path.replace(/^\/+/, "")}`;
}

function portalTitle(pathname: string) {
  if (pathname === "/" || pathname === "/espace") return "Mon espace assurance";
  if (pathname.includes("propositions")) return "Propositions";
  if (pathname.includes("offres")) return "Détail de l’offre";
  if (pathname.includes("demandes/nouvelle")) return "Nouvelle demande";
  if (pathname.includes("demandes")) return "Mes demandes";
  if (pathname.includes("documents")) return "Mes documents";
  if (pathname.includes("paiements")) return "Mes paiements";
  if (pathname.includes("contrats")) return "Mes assurances";
  if (pathname.includes("renouvellements")) return "Renouvellement";
  if (pathname.includes("sinistres")) return "Mes sinistres";
  if (pathname.includes("messagerie")) return "Messagerie";
  if (pathname.includes("notifications")) return "Notifications";
  if (pathname.includes("profil")) return "Mon profil";
  if (pathname.includes("aide")) return "Aide";
  return "Page introuvable";
}

function buildStructuredData(definition: SeoRouteDefinition, canonical: string, image: string) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": ["Organization", "InsuranceAgency"],
      "@id": ORGANIZATION_ID,
      name: PUBLIC_SITE_NAME,
      alternateName: ["Follow Up Insurance", "Followup Insurance", "Follow-Up Assurance"],
      url: `${PUBLIC_ORIGIN}/`,
      logo: {
        "@type": "ImageObject",
        url: `${PUBLIC_ORIGIN}/follow-up-insurance-logo.png`,
      },
      slogan: "Allez en toute quiétude",
      telephone: siteConfig.phones.map((telephone) => telephone.label),
      address: {
        "@type": "PostalAddress",
        streetAddress: "Odza, entrée Koweït",
        postalCode: "12830",
        addressLocality: "Yaoundé",
        addressRegion: "Centre",
        addressCountry: "CM",
      },
      areaServed: {
        "@type": "Country",
        name: "Cameroun",
      },
      contactPoint: siteConfig.phones.map((telephone) => ({
        "@type": "ContactPoint",
        telephone: telephone.label,
        contactType: "service client",
        areaServed: "CM",
        availableLanguage: ["fr"],
      })),
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${PUBLIC_ORIGIN}/`,
      name: PUBLIC_SITE_NAME,
      alternateName: ["Follow Up Insurance", "Followup Insurance"],
      publisher: { "@id": ORGANIZATION_ID },
      inLanguage: "fr-FR",
    },
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: definition.title,
      description: definition.description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORGANIZATION_ID },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: image,
      },
      inLanguage: "fr-FR",
    },
  ];

  if (definition.breadcrumbs && definition.breadcrumbs.length > 1) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: definition.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: canonicalUrl(item.path),
      })),
    });
  }

  if (definition.openGraphType === "article") {
    graph.push({
      "@type": "Article",
      "@id": `${canonical}#article`,
      headline: definition.title.replace(/ \| Follow-Up Insurance$/, ""),
      description: definition.description,
      image,
      mainEntityOfPage: { "@id": `${canonical}#webpage` },
      publisher: { "@id": ORGANIZATION_ID },
      inLanguage: "fr-FR",
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function resolveSeo(pathname: string, options: ResolveSeoOptions = {}): ResolvedSeo {
  const normalizedPath = normalizePath(pathname);

  if (options.portal) {
    const title = `${portalTitle(normalizedPath)} | Follow-Up Insurance`;
    const portalPath = normalizedPath === "/"
      ? "/portail-client"
      : `/portail-client${normalizedPath}`;
    return {
      title,
      description: "Espace client sécurisé Follow-Up Insurance.",
      canonical: canonicalUrl(portalPath),
      robots: "noindex, nofollow, noarchive",
      image: absoluteAssetUrl(DEFAULT_SOCIAL_IMAGE),
      imageAlt: "Follow-Up Insurance",
      openGraphType: "website",
    };
  }

  const definition = PUBLIC_SEO_ROUTE_MANIFEST[normalizedPath]
    ?? legalRoutes[normalizedPath]
    ?? authRoutes[normalizedPath]
    ?? legacyRoutes[normalizedPath];

  if (!definition) {
    const canonical = canonicalUrl(normalizedPath);
    return {
      title: "Page introuvable | Follow-Up Insurance",
      description: "La page demandée n’existe pas ou a été déplacée.",
      canonical,
      robots: "noindex, follow",
      image: absoluteAssetUrl(DEFAULT_SOCIAL_IMAGE),
      imageAlt: "Follow-Up Insurance",
      openGraphType: "website",
    };
  }

  const canonical = canonicalUrl(definition.canonicalPath ?? normalizedPath);
  const image = absoluteAssetUrl(definition.image);
  const indexable = definition.indexable !== false;
  const isLegalRoute = normalizedPath in legalRoutes;

  return {
    title: definition.title,
    description: definition.description,
    canonical,
    robots: indexable
      ? "index, follow"
      : isLegalRoute
        ? "noindex, follow"
        : "noindex, nofollow, noarchive",
    image,
    imageAlt: definition.imageAlt,
    openGraphType: definition.openGraphType ?? "website",
    jsonLd: indexable ? buildStructuredData(definition, canonical, image) : undefined,
  };
}

export function isKnownSolutionSlug(value: string): value is SolutionSlug {
  return value in solutionPages;
}

export function isKnownAdviceArticleSlug(value: string): value is AdviceArticleSlug {
  return value in adviceArticleBySlug;
}
