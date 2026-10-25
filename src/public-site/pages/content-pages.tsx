import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Mail,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePortal } from "../../app/portal-context";
import { PublicLink } from "../components/public-link";
import { PublicPageShell } from "../components/public-page-shell";
import { ResponsivePublicImage } from "../components/responsive-public-image";
import {
  aboutPage,
  adviceArticleBySlug,
  advicePage,
  businessesPage,
  claimsPage,
  contactPage,
  faqPage,
  individualsPage,
  solutionPages,
  solutionSummaries,
  solutionsPage,
  type AdviceArticle,
  type AdviceArticleSlug,
  type PublicCta,
  type PublicEditorialSection,
  type PublicFaqItem,
  type PublicHero,
  type PublicLandingPage,
  type SolutionPageContent,
  type SolutionSlug,
} from "../data/public-pages";
import { privacyPolicy } from "../data/privacy-policy";

function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="public-kicker"><span aria-hidden="true" />{children}</span>;
}

function cleanEditorialText(value: string) {
  return value.replace(/^\[[^\]]+\]\s*/, "");
}

function CtaLink({ cta, light = false }: { cta: PublicCta; light?: boolean }) {
  if (cta.tone === "text") {
    return <PublicLink className="public-text-link" href={cta.href}>{cta.label}<ArrowRight size={16} aria-hidden="true" /></PublicLink>;
  }

  const className = light
    ? "public-button public-button--light"
    : cta.tone === "secondary"
      ? "public-button public-button--outline"
      : "public-button public-button--primary";

  return (
    <Button asChild variant={cta.tone === "secondary" ? "outline" : "default"} className={className}>
      <PublicLink href={cta.href}>{cta.label}<ArrowRight size={16} aria-hidden="true" /></PublicLink>
    </Button>
  );
}

function Breadcrumbs({ items }: { items: readonly { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d’Ariane">
      <ol className="public-breadcrumbs">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="contents">
            {index > 0 && <ChevronRight size={13} aria-hidden="true" />}
            {item.href ? <PublicLink href={item.href}>{item.label}</PublicLink> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PublicHeroBlock({ hero, breadcrumbs }: {
  hero: PublicHero;
  breadcrumbs: readonly { label: string; href?: string }[];
}) {
  return (
    <section className="public-subhero" aria-labelledby="public-page-title">
      <div className="public-container public-subhero__grid">
        <div className="public-subhero__copy">
          <Breadcrumbs items={breadcrumbs} />
          <SectionLabel>{hero.eyebrow}</SectionLabel>
          <h1 id="public-page-title">{hero.title}</h1>
          <p>{hero.intro}</p>
          {(hero.primaryCta || hero.secondaryCta) && (
            <div className="public-subhero__actions">
              {hero.primaryCta && <CtaLink cta={hero.primaryCta} />}
              {hero.secondaryCta && <CtaLink cta={hero.secondaryCta} />}
            </div>
          )}
        </div>
        <figure className="public-subhero__visual">
          <ResponsivePublicImage src={hero.image.src} alt={hero.image.alt} fallbackWidth={1200} fallbackHeight={900} sizes="(max-width: 760px) 100vw, 50vw" loading="eager" />
        </figure>
      </div>
    </section>
  );
}

function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className="public-check-list">
      {items.map((item) => <li key={item}><Check size={18} strokeWidth={2.4} aria-hidden="true" /><span>{item}</span></li>)}
    </ul>
  );
}

function ProcessList({ steps }: { steps: NonNullable<PublicEditorialSection["steps"]> }) {
  return (
    <ol className="public-process-list">
      {steps.map((step) => (
        <li key={`${step.number}-${step.title}`}>
          <span>{step.number}</span>
          <div><h3>{step.title}</h3><p>{step.description}</p></div>
        </li>
      ))}
    </ol>
  );
}

function EditorialSection({ section, index }: { section: PublicEditorialSection; index: number }) {
  const paragraphs = section.paragraphs?.map(cleanEditorialText);
  const sectionClass = `public-page-section${index % 2 ? " public-page-section--soft" : ""}`;

  if (section.image) {
    return (
      <section className={sectionClass} aria-labelledby={`${section.id}-title`}>
        <div className="public-container public-editorial-grid">
          <figure><ResponsivePublicImage src={section.image.src} alt={section.image.alt} fallbackWidth={1100} fallbackHeight={900} sizes="(max-width: 900px) 100vw, 42vw" loading="lazy" /></figure>
          <div className="public-editorial-copy">
            {section.eyebrow && <SectionLabel>{section.eyebrow}</SectionLabel>}
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.intro && <p>{section.intro}</p>}
            {paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && <Checklist items={section.bullets} />}
            {section.cta && <CtaLink cta={section.cta} />}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} aria-labelledby={`${section.id}-title`}>
      <div className="public-container">
        <div className="public-page-heading">
          {section.eyebrow && <SectionLabel>{section.eyebrow}</SectionLabel>}
          <h2 id={`${section.id}-title`}>{section.title}</h2>
          {section.intro && <p>{section.intro}</p>}
          {paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        {section.cards && (
          <div className="public-values-grid">
            {section.cards.map((card, cardIndex) => (
              <article className="public-value" key={card.title}>
                <span aria-hidden="true">{String(cardIndex + 1).padStart(2, "0")}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                {card.href && <PublicLink className="public-text-link" href={card.href}>{card.label ?? "Découvrir"}<ArrowRight size={15} /></PublicLink>}
              </article>
            ))}
          </div>
        )}
        {section.bullets && <Checklist items={section.bullets} />}
        {section.steps && <ProcessList steps={section.steps} />}
        {section.cta && <CtaLink cta={section.cta} />}
      </div>
    </section>
  );
}

function FinalCta({ content }: { content: NonNullable<PublicLandingPage["finalCta"]> }) {
  return (
    <section className="public-quote-band" aria-label="Nous contacter">
      <div className="public-container public-quote-band__inner">
        <div><h2>{content.title}</h2><p>{content.description}</p></div>
        <div className="public-quote-band__actions"><CtaLink cta={content.action} light /></div>
      </div>
    </section>
  );
}

function GenericLandingPage({ page }: { page: PublicLandingPage }) {
  return (
    <PublicPageShell>
      <PublicHeroBlock hero={page.hero} breadcrumbs={[{ label: "Accueil", href: "/" }, { label: page.hero.eyebrow }]} />
      {page.sections.map((section, index) => <EditorialSection key={section.id} section={section} index={index} />)}
      {page.finalCta && <FinalCta content={page.finalCta} />}
    </PublicPageShell>
  );
}

export function AboutPublicPage() {
  return <GenericLandingPage page={aboutPage} />;
}

export function IndividualsPublicPage() {
  return <GenericLandingPage page={individualsPage} />;
}

export function BusinessesPublicPage() {
  return <GenericLandingPage page={businessesPage} />;
}

export function SolutionsPublicPage() {
  const method = solutionsPage.sections.find((section) => section.id === "methode");
  return (
    <PublicPageShell>
      <PublicHeroBlock hero={solutionsPage.hero} breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Nos solutions" }]} />
      <section className="public-page-section" aria-labelledby="solutions-list-title">
        <div className="public-container">
          <div className="public-page-heading public-page-heading--split">
            <div><SectionLabel>Sept domaines de protection</SectionLabel><h2 id="solutions-list-title">Explorez la solution qui vous ressemble.</h2></div>
            <p>Chaque page vous présente les garanties à examiner, les points de vigilance et les documents utiles avant une étude.</p>
          </div>
          <div className="public-solutions-grid">
            {solutionSummaries.map((solution) => (
              <article className="public-solution-card" key={solution.slug}>
                <div className="public-solution-card__image"><ResponsivePublicImage src={solution.image.src} alt={solution.image.alt} fallbackWidth={900} fallbackHeight={600} sizes="(max-width: 760px) 100vw, 33vw" loading="lazy" /></div>
                <div className="public-solution-card__body">
                  {solution.tags && <div className="public-solution-tags" aria-label="Catégories incluses">{solution.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
                  <span className="public-solution-card__tagline">{solution.tagline}</span><h2>{solution.shortTitle}</h2><p>{solution.description}</p>
                  <PublicLink href={solution.path}>{solution.ctaLabel}<ArrowRight size={15} /></PublicLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      {method && <EditorialSection section={method} index={1} />}
      {solutionsPage.finalCta && <FinalCta content={solutionsPage.finalCta} />}
    </PublicPageShell>
  );
}

function FaqList({ items }: { items: readonly PublicFaqItem[] }) {
  return (
    <div className="public-faq-list">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}<Plus size={19} aria-hidden="true" /></summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

const solutionAdviceLinks: Partial<Record<SolutionSlug, { href: string; label: string }>> = {
  automobile: {
    href: "/conseils/choisir-assurance-automobile",
    label: "Lire le guide pour choisir son assurance automobile",
  },
  voyage: {
    href: "/conseils/preparer-assurance-voyage",
    label: "Lire le guide pour préparer son assurance voyage",
  },
  entreprise: {
    href: "/conseils/proteger-activite-professionnelle",
    label: "Lire le guide pour protéger son activité",
  },
  caution: {
    href: "/conseils/proteger-activite-professionnelle",
    label: "Lire le guide sur les risques de l’entreprise",
  },
};

const articleSolutionLinks: Record<AdviceArticleSlug, { href: string; label: string }> = {
  "choisir-assurance-automobile": {
    href: "/solutions/automobile",
    label: "Découvrir l’assurance automobile",
  },
  "preparer-assurance-voyage": {
    href: "/solutions/voyage",
    label: "Découvrir l’assurance voyage",
  },
  "proteger-activite-professionnelle": {
    href: "/solutions/entreprise",
    label: "Découvrir l’assurance entreprise",
  },
};

export function SolutionDetailPublicPage({ slug }: { slug: SolutionSlug }) {
  const page: SolutionPageContent = solutionPages[slug];
  const relatedAdvice = solutionAdviceLinks[slug];
  return (
    <PublicPageShell>
      <PublicHeroBlock
        hero={page.hero}
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Nos solutions", href: "/solutions" }, { label: page.shortTitle }]}
      />
      {page.variants && <section className="public-vehicle-types public-page-section" id="types-vehicules" aria-labelledby="vehicle-types-title">
        <div className="public-container">
          <div className="public-page-heading public-page-heading--split">
            <div><SectionLabel>Une assurance, deux catégories</SectionLabel><h2 id="vehicle-types-title">Quel véhicule souhaitez-vous assurer ?</h2></div>
            <p>La catégorie choisie permet d’adapter les informations demandées, les usages et les garanties à examiner.</p>
          </div>
          <div className="public-vehicle-types__grid">
            {page.variants.map((variant) => <article className="public-vehicle-type" id={variant.id} key={variant.id}>
              <div className="public-vehicle-type__image"><img src={variant.image.src} alt={variant.image.alt} width={900} height={600} loading="lazy" /><span>{variant.tag}</span></div>
              <div className="public-vehicle-type__body"><h3>{variant.title}</h3><p>{variant.description}</p><Checklist items={variant.highlights} /><CtaLink cta={variant.cta} /></div>
            </article>)}
          </div>
        </div>
      </section>}
      <section className="public-page-section">
        <div className="public-container public-detail-layout">
          <aside className="public-detail-aside">
            <SectionLabel>Pour qui ?</SectionLabel>
            <h2>Cette solution peut vous concerner si…</h2>
            <Checklist items={page.audience} />
          </aside>
          <div className="public-detail-content">
            <section className="public-detail-section" aria-labelledby="coverages-title">
              <h2 id="coverages-title">Les garanties à examiner</h2>
              <p>Le contenu exact dépend toujours de la formule et des conditions contractuelles proposées.</p>
              <div className="public-values-grid">
                {page.coverages.map((coverage, index) => <article className="public-value" key={coverage.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{coverage.title}</h3><p>{coverage.description}</p></article>)}
              </div>
            </section>
            <section className="public-detail-section"><h2>Options à considérer</h2><Checklist items={page.optionalBenefits} /></section>
            <section className="public-detail-section"><h2>Points de vigilance</h2><Checklist items={page.watchPoints} /></section>
            <section className="public-detail-section"><h2>Documents utiles</h2><Checklist items={page.documents} /></section>
            <section className="public-detail-section">
              <h2>{page.brokerSupport.title}</h2><p>{page.brokerSupport.description}</p><ProcessList steps={page.brokerSupport.steps} />
            </section>
            {relatedAdvice && (
              <section className="public-detail-section">
                <h2>Pour aller plus loin</h2>
                <PublicLink className="public-text-link" href={relatedAdvice.href}>{relatedAdvice.label}<ArrowRight size={16} aria-hidden="true" /></PublicLink>
              </section>
            )}
          </div>
        </div>
      </section>
      <section className="public-page-section public-page-section--soft" aria-labelledby="solution-faq-title">
        <div className="public-container"><div className="public-page-heading"><SectionLabel>Questions fréquentes</SectionLabel><h2 id="solution-faq-title">Avant de choisir</h2></div><FaqList items={page.faq} /></div>
      </section>
      <FinalCta content={page.finalCta} />
    </PublicPageShell>
  );
}

export function ClaimsPublicPage() {
  const { navigate, store } = usePortal();
  const startClaim = () => {
    if (import.meta.env.DEV) {
      navigate(store.session.authenticated ? "/espace/sinistres/nouveau" : "/login");
      return;
    }
    const destination = store.session.authenticated
      ? "/portail-client/espace/sinistres/nouveau"
      : "/login/?retour=%2Fportail-client%2Fespace%2Fsinistres%2Fnouveau";
    window.location.assign(destination);
  };
  return (
    <PublicPageShell>
      <PublicHeroBlock hero={claimsPage.hero} breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Sinistres" }]} />
      {claimsPage.sections.map((section, index) => <EditorialSection key={section.id} section={section} index={index} />)}
      <section className="public-page-section public-page-section--soft" aria-labelledby="claims-faq-title">
        <div className="public-container">
          <div className="public-page-heading"><SectionLabel>Questions fréquentes</SectionLabel><h2 id="claims-faq-title">Après un événement</h2></div>
          <FaqList items={claimsPage.faq} />
          <PublicLink className="public-text-link" href="/faq#sinistre">Voir toutes les questions sur les sinistres<ArrowRight size={16} aria-hidden="true" /></PublicLink>
        </div>
      </section>
      <section className="public-quote-band">
        <div className="public-container public-quote-band__inner">
          <div><h2>Votre déclaration, guidée étape par étape.</h2><p>Accédez au formulaire détaillé et conservez le suivi de votre dossier dans votre espace sécurisé.</p></div>
          <div className="public-quote-band__actions"><Button type="button" className="public-button public-button--light" onClick={startClaim}>Déclarer un sinistre<ArrowRight size={16} /></Button></div>
        </div>
      </section>
    </PublicPageShell>
  );
}

export function AdvicePublicPage() {
  return (
    <PublicPageShell>
      <PublicHeroBlock hero={advicePage.hero} breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Conseils" }]} />
      <section className="public-page-section" aria-labelledby="advice-list-title">
        <div className="public-container">
          <div className="public-page-heading"><SectionLabel>Guides pratiques</SectionLabel><h2 id="advice-list-title">Des repères utiles avant de décider.</h2></div>
          <div className="public-advice-list">
            {advicePage.articles.map((article) => (
              <PublicLink className="public-advice-row" href={article.path} key={article.slug}>
                <img src={article.image.src} alt={article.image.alt} width={680} height={420} loading="lazy" />
                <div className="public-advice-row__copy"><span>{article.category} · {article.readingTime}</span><h2>{article.title}</h2><p>{article.excerpt}</p></div>
                <ArrowRight size={22} aria-hidden="true" />
              </PublicLink>
            ))}
          </div>
        </div>
      </section>
      {advicePage.sections.filter((section) => section.id !== "articles").map((section, index) => <EditorialSection section={section} index={index + 1} key={section.id} />)}
      {advicePage.finalCta && <FinalCta content={advicePage.finalCta} />}
    </PublicPageShell>
  );
}

export function AdviceArticlePublicPage({ slug }: { slug: AdviceArticleSlug }) {
  const article = adviceArticleBySlug[slug] as AdviceArticle;
  const relatedSolution = articleSolutionLinks[slug];
  return (
    <PublicPageShell>
      <PublicHeroBlock
        hero={{ eyebrow: `${article.category} · ${article.readingTime}`, title: article.title, intro: article.introduction, image: article.image }}
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Conseils", href: "/conseils" }, { label: article.category }]}
      />
      <article className="public-page-section">
        <div className="public-container public-article-layout">
          <div className="public-article-body">
            {article.sections.map((section) => (
              <section key={section.id} aria-labelledby={`${section.id}-article-title`}>
                <h2 id={`${section.id}-article-title`}>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{cleanEditorialText(paragraph)}</p>)}
                {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
              </section>
            ))}
          </div>
          <aside className="public-article-aside">
            <SectionLabel>À retenir</SectionLabel><h2>{article.takeaway.title}</h2><Checklist items={article.takeaway.points} /><CtaLink cta={article.cta} />
            <PublicLink className="public-text-link" href={relatedSolution.href}>{relatedSolution.label}<ArrowRight size={16} aria-hidden="true" /></PublicLink>
          </aside>
        </div>
      </article>
    </PublicPageShell>
  );
}

function initialSubject() {
  const query = new URLSearchParams(window.location.search);
  const candidate = query.get("motif") ?? query.get("objet") ?? query.get("profil") ?? "orientation";
  if (candidate === "devis" || candidate === "particulier") return "orientation";
  if (candidate === "automobile") return "automobile_voiture";
  if (candidate === "moto") return "automobile_moto";
  return contactPage.formSubjects.some((subject) => subject.value === candidate) ? candidate : "autre";
}

export function ContactPublicPage() {
  const [sent, setSent] = useState(false);
  const subject = useMemo(initialSubject, []);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  const channels = [
    { icon: Phone, title: "Téléphone", text: "Un échange direct pendant les horaires d’ouverture." },
    { icon: Mail, title: "E-mail", text: "Une demande générale avec vos coordonnées de rappel." },
    { icon: MapPin, title: "Rendez-vous", text: "Un temps dédié pour approfondir votre situation." },
  ];

  return (
    <PublicPageShell>
      <PublicHeroBlock hero={contactPage.hero} breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Contact" }]} />
      <section className="public-page-section">
        <div className="public-container public-contact-layout">
          <div className="public-contact-details">
            <div className="public-page-heading"><SectionLabel>À votre écoute</SectionLabel><h2>Choisissez le canal qui vous convient.</h2><p>Ne transmettez pas de données médicales ou bancaires dans ce premier message.</p></div>
            {channels.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon size={21} aria-hidden="true" /></span><h2>{title}</h2><p>{text}</p></article>)}
          </div>
          <form className="public-contact-form" onSubmit={submit}>
            <h2>Décrivez votre besoin</h2><p>Les champs marqués d’un astérisque sont obligatoires.</p>
            <div className="public-contact-form__grid">
              <label>Nom complet *<input name="name" autoComplete="name" required /></label>
              <label>Téléphone *<input name="phone" type="tel" autoComplete="tel" required /></label>
              <label className="full">E-mail *<input name="email" type="email" autoComplete="email" required /></label>
              <label className="full">Objet de la demande *<select name="subject" defaultValue={subject} required>{contactPage.formSubjects.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
              <label className="full">Votre message *<textarea name="message" rows={6} required placeholder="Indiquez les informations utiles à une première orientation." /></label>
              <label className="full public-contact-consent"><input name="consent" type="checkbox" required /><span>J’accepte que mes informations soient utilisées pour répondre à cette demande. *</span></label>
              <div className="full"><Button type="submit" className="public-button public-button--primary">Envoyer ma demande<ArrowRight size={16} /></Button></div>
            </div>
            {sent && <div className="public-contact-form__success" role="status"><CheckCircle2 size={21} /><div><strong>Message non envoyé — mode démonstration.</strong><p>Le formulaire est prêt, mais il n’est pas encore relié à un canal de contact. Aucune donnée n’a été transmise.</p></div></div>}
          </form>
        </div>
      </section>
    </PublicPageShell>
  );
}

export function FaqPublicPage() {
  return (
    <PublicPageShell>
      <PublicHeroBlock hero={faqPage.hero} breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "FAQ" }]} />
      <section className="public-page-section">
        <div className="public-container">
          <div className="public-page-heading"><SectionLabel>Questions fréquentes</SectionLabel><h2>Des réponses organisées par thème.</h2><p>Les conditions exactes applicables figurent toujours dans les documents contractuels.</p></div>
          {faqPage.categories.map((category) => <section className="public-faq-category" key={category.id} aria-labelledby={`${category.id}-title`}><h2 id={`${category.id}-title`}>{category.title}</h2><FaqList items={category.items} /></section>)}
        </div>
      </section>
      {faqPage.finalCta && <FinalCta content={faqPage.finalCta} />}
    </PublicPageShell>
  );
}

const legalContent = {
  "mentions-legales": { title: "Mentions légales", intro: "Informations relatives à l’éditeur et à l’exploitation du site." },
  confidentialite: { title: "Politique de confidentialité", intro: "Principes appliqués au traitement des informations transmises sur ce site." },
  "conditions-utilisation": { title: "Conditions d’utilisation", intro: "Règles générales applicables à la consultation de cette démonstration." },
} as const;

export type LegalPageKind = keyof typeof legalContent;

export function LegalPublicPage({ kind }: { kind: LegalPageKind }) {
  if (kind === "confidentialite") return <PrivacyPolicyPage />;
  const content = legalContent[kind];
  return (
    <PublicPageShell>
      <section className="public-page-section">
        <div className="public-container public-legal-copy">
          <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: content.title }]} />
          <SectionLabel>Informations</SectionLabel><h1>{content.title}</h1><p>{content.intro}</p>
          <h2>Informations en cours de validation</h2><p>Cette page est en cours de validation. Les informations définitives seront publiées après confirmation des éléments relatifs à l’éditeur, à l’hébergement et, selon la page, au traitement des données.</p>
          <h2>Contact</h2><p>Pour toute question relative à cette page, utilisez le formulaire de contact afin d’être orienté vers l’interlocuteur compétent.</p>
          <PublicLink className="public-text-link" href="/contact">Nous contacter<ArrowRight size={16} /></PublicLink>
        </div>
      </section>
    </PublicPageShell>
  );
}

function PrivacyPolicyPage() {
  return (
    <PublicPageShell>
      <section className="public-page-section">
        <article className="public-container public-legal-copy">
          <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: privacyPolicy.title }]} />
          <SectionLabel>Protection des données</SectionLabel>
          <h1>{privacyPolicy.title}</h1>
          <p className="public-legal-copy__intro">{privacyPolicy.intro}</p>
          <p className="public-legal-copy__updated"><strong>Dernière mise à jour :</strong> {privacyPolicy.updatedAt}</p>
          {privacyPolicy.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
            </section>
          ))}
          <div className="public-legal-copy__contact">
            <h2>Nous contacter au sujet de vos données</h2>
            <p>Utilisez la page Contact pour adresser une demande relative à votre compte ou à vos données personnelles.</p>
            <PublicLink className="public-text-link" href="/contact">Accéder à la page Contact<ArrowRight size={16} /></PublicLink>
          </div>
        </article>
      </section>
    </PublicPageShell>
  );
}

export function PublicNotFoundPage() {
  return (
    <PublicPageShell>
      <section className="public-page-section public-empty-state">
        <div className="public-container">
          <CircleHelp size={34} aria-hidden="true" /><SectionLabel>Erreur 404</SectionLabel><h1>Cette page n’existe pas.</h1><p>Le lien a peut-être changé. Retrouvez nos solutions ou revenez à l’accueil.</p>
          <div className="public-subhero__actions"><Button asChild className="public-button public-button--primary"><PublicLink href="/">Revenir à l’accueil</PublicLink></Button><Button asChild variant="outline" className="public-button public-button--outline"><PublicLink href="/solutions">Voir nos solutions</PublicLink></Button></div>
        </div>
      </section>
    </PublicPageShell>
  );
}
