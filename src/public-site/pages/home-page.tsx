import type { ReactNode } from "react";
import {
  ArrowRight,
  Bike,
  Building2,
  CarFront,
  Check,
  ClipboardCheck,
  Ear,
  FileCheck2,
  HandHeart,
  HeartPulse,
  House,
  MessageCircleMore,
  Plane,
  Scale,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePortal } from "../../app/portal-context";
import { PublicLink } from "../components/public-link";
import { PublicPageShell } from "../components/public-page-shell";
import {
  adviceArticles,
  brokerBenefits,
  brokerJourney,
  commitments,
  portalFeatures,
  protectionNeeds,
} from "../data/home-content";
import { siteConfig } from "../data/site-config";
import "../public-site.css";

const needIcons = {
  auto: CarFront,
  moto: Bike,
  health: HeartPulse,
  home: House,
  travel: Plane,
  business: Building2,
} as const;

const commitmentIcons = {
  advice: Scale,
  listening: Ear,
  tailored: Sparkles,
  clarity: FileCheck2,
  support: HandHeart,
  proximity: UsersRound,
} as const;

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`public-reveal ${className}`}>{children}</div>;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="public-kicker"><span aria-hidden="true" />{children}</span>;
}

export function HomePage() {
  const { navigate } = usePortal();
  const goToQuote = () => navigate("/contact?objet=devis");
  const solutionRoutes = { auto: "/solutions/automobile", moto: "/solutions/moto", health: "/solutions/sante", home: "/solutions/habitation", travel: "/solutions/voyage", business: "/solutions/entreprise" } as const;

  return (
    <PublicPageShell className="public-home-page">
        <section className="public-hero" aria-labelledby="public-hero-title">
          <div className="public-container public-hero__grid">
            <div className="public-hero__copy">
              <SectionLabel>Courtier en assurances</SectionLabel>
              <h1 id="public-hero-title">Choisir avec confiance.<span>Avancer en toute quiétude.</span></h1>
              <p>Follow-Up Insurance comprend vos besoins, recherche des solutions adaptées et vous accompagne dans vos choix comme dans leur suivi.</p>
              <div className="public-hero__actions">
                <Button type="button" className="public-button public-button--primary public-button--large" onClick={goToQuote}>
                  Étudier mon besoin <ArrowRight size={17} />
                </Button>
                <Button asChild type="button" variant="outline" className="public-button public-button--outline public-button--large">
                  <PublicLink href="/a-propos">Découvrir Follow-Up</PublicLink>
                </Button>
              </div>
              <p className="public-signature">{siteConfig.signature}</p>
            </div>
            <div className="public-hero__visual">
              <img
                src="/images/public-hero-collage.png"
                alt="Une conseillère échange avec un client tandis qu’un professionnel consulte ses informations sur le terrain"
                width={1600}
                height={1100}
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        <section className="public-needs" id="solutions" aria-label="Besoins d’assurance">
          <div className="public-container public-needs__grid">
            {protectionNeeds.map((need) => {
              const Icon = needIcons[need.id];
              return (
                <button key={need.id} type="button" onClick={() => navigate(solutionRoutes[need.id])} className="public-need">
                  <span className="public-need__number">{need.number}</span>
                  <Icon size={28} strokeWidth={1.7} aria-hidden="true" />
                  <strong>{need.label}</strong>
                  <span>{need.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        <Reveal>
          <section className="public-role public-section" id="notre-role" aria-labelledby="role-title">
            <div className="public-container public-role__grid">
              <div className="public-role__copy">
                <SectionLabel>Notre rôle</SectionLabel>
                <h2 id="role-title">Le conseil fait la différence.</h2>
                <p>Une compagnie présente principalement ses propres contrats. En tant que courtier, nous commençons par comprendre votre situation, puis nous recherchons auprès de plusieurs partenaires une solution cohérente avec vos besoins.</p>
                <Button asChild type="button" variant="outline" className="public-button public-button--outline">
                  <PublicLink href="/a-propos">Comprendre notre démarche <ArrowRight size={16} /></PublicLink>
                </Button>
              </div>
              <figure className="public-role__image">
                <img src="/images/public-role-advisor.png" alt="Une courtière écoute un client et analyse sa situation" width={1484} height={1060} loading="lazy" />
              </figure>
              <div className="public-role__statement">
                <span aria-hidden="true" />
                <p>Des solutions d’assurance étudiées pour votre réalité.</p>
                <strong>Un accompagnement humain, clair et durable.</strong>
              </div>
            </div>
            <div className="public-container public-benefits" aria-label="Les bénéfices de l’accompagnement par un courtier">
              {brokerBenefits.map((benefit, index) => (
                <div key={benefit}>
                  <span>0{index + 1}</span>
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="public-audiences public-section" aria-labelledby="audience-title">
            <div className="public-container">
              <div className="public-section-heading">
                <div><SectionLabel>Vous êtes…</SectionLabel><h2 id="audience-title">Une approche adaptée à votre réalité.</h2></div>
                <p>Chaque situation mérite d’être écoutée avant de chercher une solution.</p>
              </div>
              <div className="public-audiences__grid">
                <article className="public-audience" id="particuliers">
                  <img src="/images/insurance-health.webp" alt="Une famille réunie dans son foyer" width={1200} height={800} loading="lazy" />
                  <div>
                    <SectionLabel>Particuliers</SectionLabel>
                    <h3>Protéger aujourd’hui pour demain.</h3>
                    <p>Des solutions étudiées pour vous, votre famille et les projets qui comptent.</p>
                    <button type="button" onClick={() => navigate("/particuliers")}>Solutions particuliers <ArrowRight size={16} /></button>
                  </div>
                </article>
                <article className="public-audience" id="entreprises">
                  <img src="/images/public-entrepreneur.png" alt="Un entrepreneur travaille sur son ordinateur dans un bureau lumineux" width={1536} height={1024} loading="lazy" />
                  <div>
                    <SectionLabel>Entreprises</SectionLabel>
                    <h3>Assurer vos projets de croissance.</h3>
                    <p>Une lecture structurée des risques pour accompagner durablement votre activité.</p>
                    <button type="button" onClick={() => navigate("/entreprises")}>Solutions entreprises <ArrowRight size={16} /></button>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="public-journey public-section" id="accompagnement" aria-labelledby="journey-title">
            <div className="public-container">
              <SectionLabel>Notre accompagnement</SectionLabel>
              <h2 id="journey-title">Un parcours simple et clair.</h2>
              <ol className="public-journey__steps">
                {brokerJourney.map((step, index) => (
                  <li key={step.number}>
                    <div className="public-journey__topline">
                      <span>{step.number}</span>
                      {index < brokerJourney.length - 1 && <ArrowRight size={26} aria-hidden="true" />}
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </li>
                ))}
              </ol>
              <Button type="button" className="public-button public-button--primary public-journey__cta" onClick={goToQuote}>
                Commencer ma demande <ArrowRight size={17} />
              </Button>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="public-portal public-section" aria-labelledby="portal-title">
            <div className="public-container public-portal__grid">
              <div className="public-portal__copy">
                <SectionLabel>Espace client</SectionLabel>
                <h2 id="portal-title">Tout suivre, simplement.</h2>
                <p>Depuis votre espace sécurisé, suivez vos démarches, consultez les propositions de votre courtier, transmettez vos documents et accédez à vos contrats.</p>
                <PublicLink className="public-text-link" href="/a-propos">Découvrir notre accompagnement <ArrowRight size={16} /></PublicLink>
              </div>
              <figure className="public-portal__preview">
                <img src="/images/portal-dashboard-preview.png" alt="Aperçu du tableau de bord de l’espace client Follow-Up Insurance" width={1265} height={712} loading="lazy" />
              </figure>
              <ul className="public-portal__features">
                <li className="public-portal__features-title">Vos démarches, au même endroit</li>
                {portalFeatures.map((feature) => <li key={feature}><Check size={16} strokeWidth={2.5} />{feature}</li>)}
              </ul>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="public-support public-section" aria-label="Sinistres et engagements">
            <div className="public-container public-support__grid">
              <article className="public-claims" id="sinistres">
                <img src="/images/public-claims-advisor.png" alt="Une conseillère accompagne un client par téléphone" width={1536} height={1024} loading="lazy" />
                <div>
                  <SectionLabel>En cas de sinistre</SectionLabel>
                  <h2>À vos côtés quand cela compte.</h2>
                  <p>Déclarez votre sinistre, transmettez les éléments utiles et suivez les échanges avec l’appui de votre courtier.</p>
                  <Button type="button" variant="outline" className="public-button public-button--outline" onClick={() => navigate("/sinistres")}>
                    Que faire en cas de sinistre ? <ArrowRight size={16} />
                  </Button>
                </div>
              </article>
              <article className="public-commitments">
                <SectionLabel>Nos engagements</SectionLabel>
                <h2>Une relation de confiance, durable.</h2>
                <div className="public-commitments__grid">
                  {commitments.map((commitment) => {
                    const Icon = commitmentIcons[commitment.id];
                    return <div key={commitment.id}><span><Icon size={17} /></span><p>{commitment.label}</p></div>;
                  })}
                </div>
              </article>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="public-advice public-section" id="conseils" aria-labelledby="advice-title">
            <div className="public-container">
              <div className="public-section-heading public-section-heading--advice">
                <div><SectionLabel>Conseils & actualités</SectionLabel><h2 id="advice-title">Des repères pour mieux vous protéger.</h2></div>
                <PublicLink href="/conseils">Voir tous les conseils <ArrowRight size={15} /></PublicLink>
              </div>
              <div className="public-advice__grid" id="liste-conseils">
                {adviceArticles.map((article) => (
                  <article className="public-article" key={article.title}>
                    <img src={article.image} alt={article.imageAlt} width={1200} height={800} loading="lazy" />
                    <div>
                      <span>{article.category}</span>
                      <h3>{article.title}</h3>
                      <p>{article.excerpt}</p>
                      <PublicLink className="public-article__link" href={`/conseils/${article.slug}`}>Lire le conseil <ArrowRight size={14} /></PublicLink>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <section className="public-final-cta" id="contact" aria-labelledby="contact-title">
          <div className="public-container public-final-cta__inner">
            <div>
              <SectionLabel>Un projet ?</SectionLabel>
              <h2 id="contact-title">Parlons de votre besoin.</h2>
              <p>Un conseiller Follow-Up Insurance peut vous accompagner dans la recherche d’une solution adaptée.</p>
            </div>
            <div>
              <Button type="button" className="public-button public-button--light public-button--large" onClick={goToQuote}>
                Demander un devis <ArrowRight size={17} />
              </Button>
              <PublicLink href="/a-propos">Découvrir notre approche</PublicLink>
            </div>
          </div>
        </section>
    </PublicPageShell>
  );
}
