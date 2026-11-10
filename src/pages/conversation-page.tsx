import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LoaderCircle, MessageCircle, Send, ShieldCheck } from "lucide-react";

import { usePortal } from "../app/portal-context";
import { PageHeader } from "../components/portal-ui";
import { fusionnerDemandesAutomobile, obtenirDemandesAutomobile } from "../services/automobile-request-api";
import {
  creerFluxMessages,
  envoyerMessage,
  listerMessages,
  type MessageConversation,
} from "../services/messages-api";

function heureMessage(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationPage({ requestReference }: { requestReference: string }) {
  const { store, updateStore, navigate } = usePortal();
  const request = store.requests.find((item) => item.reference === requestReference);
  const [messages, setMessages] = useState<MessageConversation[]>([]);
  const [contenu, setContenu] = useState("");
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const finRef = useRef<HTMLDivElement>(null);

  const actualiser = async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    try {
      const conversation = await listerMessages(requestReference);
      setMessages(conversation);
      if (conversation.length > 0) {
        void obtenirDemandesAutomobile().then((demandes) => {
          updateStore((current) => ({
            ...current,
            requests: fusionnerDemandesAutomobile(current.requests, demandes),
          }));
        }).catch(() => undefined);
      }
      setErreur("");
    } catch (cause) {
      if (!silencieux) setErreur(cause instanceof Error ? cause.message : "La discussion n’a pas pu être chargée.");
    } finally {
      if (!silencieux) setChargement(false);
    }
  };

  useEffect(() => { void actualiser(); }, [requestReference]);

  useEffect(() => {
    const flux = creerFluxMessages();
    const recevoir = (evenement: Event) => {
      try {
        const donnees = JSON.parse((evenement as MessageEvent<string>).data) as { demande_reference?: string };
        if (donnees.demande_reference === requestReference) void actualiser(true);
      } catch {
        // Un événement illisible est ignoré ; la reconnexion SSE assurera la suite.
      }
    };
    flux.addEventListener("message", recevoir);
    return () => {
      flux.removeEventListener("message", recevoir);
      flux.close();
    };
  }, [requestReference]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (!request) return null;

  const envoyer = async () => {
    const texte = contenu.trim();
    if (!texte || envoi) return;
    setEnvoi(true);
    setErreur("");
    try {
      const message = await envoyerMessage(requestReference, texte);
      setMessages((courants) => courants.some((item) => item.id === message.id)
        ? courants
        : [...courants, message]);
      setContenu("");
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Le message n’a pas pu être envoyé.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="page-stack">
      <button className="back-link" type="button" onClick={() => navigate(`/espace/demandes/${requestReference}`)}>
        <ArrowLeft size={17} /> Retour au dossier
      </button>
      <PageHeader
        eyebrow={request.reference}
        title="Discussion avec votre courtier"
        description={`Échangez en temps réel au sujet de votre ${request.productLabel.toLocaleLowerCase("fr")}.`}
      />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,35,65,.06)]">
        <header className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-red"><MessageCircle size={22} /></span>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-sm text-slate-900">{request.advisor?.name || "En attente de prise en charge"}</strong>
            {request.advisor
              ? <span className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" /> Discussion disponible</span>
              : <span className="mt-0.5 flex items-center gap-1.5 text-xs text-amber-700"><span className="size-2 rounded-full bg-amber-500" /> Attribution du gestionnaire en cours</span>}
          </div>
        </header>
        <div className="h-[min(56vh,580px)] overflow-y-auto bg-[#fbfaf9] px-4 py-5 sm:px-6" aria-live="polite">
          {chargement ? (
            <div className="grid h-full place-items-center text-sm text-slate-500"><span className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={18} /> Chargement de la discussion…</span></div>
          ) : messages.length ? (
            <div className="grid gap-3">
              {messages.map((message) => {
                const client = message.type_auteur === "client";
                return <article className={`flex ${client ? "justify-end" : "justify-start"}`} key={message.id}>
                  <div className={`max-w-[86%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[72%] ${client ? "rounded-br-md bg-brand-red text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
                    <strong className={`block text-[11px] ${client ? "text-red-100" : "text-brand-red"}`}>{client ? "Vous" : message.auteur_nom}</strong>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.contenu}</p>
                    <time className={`mt-1.5 block text-right text-[10px] ${client ? "text-red-100/80" : "text-slate-400"}`}>{heureMessage(message.cree_le)}</time>
                  </div>
                </article>;
              })}
              <div ref={finRef} />
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div className="max-w-sm"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-brand-red shadow-sm"><MessageCircle size={25} /></span><h2 className="mt-4 text-lg font-semibold text-slate-900">Commencez la discussion</h2><p className="mt-2 text-sm leading-6 text-slate-500">Posez vos questions sur les propositions reçues. Votre courtier vous répondra directement ici.</p></div>
            </div>
          )}
        </div>
        <footer className="border-t border-slate-100 bg-white p-3 sm:p-4">
          {erreur && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{erreur}</p>}
          <div className="flex items-end gap-2">
            <textarea
              className="min-h-12 max-h-36 flex-1 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
              value={contenu}
              maxLength={4000}
              rows={1}
              placeholder="Écrivez votre message…"
              aria-label="Votre message"
              onChange={(event) => setContenu(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void envoyer();
                }
              }}
            />
            <button className="button button-primary min-h-12" type="button" disabled={!contenu.trim() || envoi} onClick={() => { void envoyer(); }}>
              {envoi ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />} <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck size={13} /> Cette conversation est rattachée uniquement à ce dossier.</p>
        </footer>
      </section>
    </div>
  );
}
