import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, Smartphone } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { assetUrl } from "../app/base-path";
import { usePortal } from "../app/portal-context";
import { formatFcfa } from "../services/portal-service";
import {
  appliquerSouscriptions,
  initialiserPaiement,
  obtenirSouscriptions,
  verifierPaiement,
} from "../services/subscription-api";
import type { Offer, PortalStore } from "../types/domain";

export function PaymentDialog({ offer, trigger }: { offer: Offer; trigger?: ReactNode }) {
  const { store, updateStore } = usePortal();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(store.client.phone);
  const [operator, setOperator] = useState<"MTN" | "ORANGE">("MTN");
  const [operation, setOperation] = useState(false);
  const [error, setError] = useState("");
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const currentPayment = store.payments.find((payment) => payment.id === currentPaymentId);

  const replacePayment = (payment: PortalStore["payments"][number]) => {
    updateStore((current) => ({
      ...current,
      payments: [payment, ...current.payments.filter((item) => item.id !== payment.id)],
      requests: payment.status === "succeeded"
        ? current.requests.map((item) => item.reference === payment.requestId
          ? { ...item, status: "policy_issuing" }
          : item)
        : current.requests,
    }));
  };

  const checkPayment = async (paymentId: string, quiet = false) => {
    if (!quiet) setOperation(true);
    setError("");
    try {
      const payment = await verifierPaiement(paymentId);
      replacePayment(payment);
      if (payment.status === "succeeded") {
        const subscriptions = await obtenirSouscriptions();
        updateStore((current) => appliquerSouscriptions(current, subscriptions));
      }
    } catch (caught) {
      if (!quiet) setError(caught instanceof Error ? caught.message : "Le statut n’a pas pu être vérifié.");
    } finally {
      if (!quiet) setOperation(false);
    }
  };

  useEffect(() => {
    if (!open || !currentPaymentId) return;
    const payment = store.payments.find((item) => item.id === currentPaymentId);
    if (!payment || payment.status !== "pending" || payment.providerStatus === "a_verifier") return;
    const timer = window.setInterval(() => { void checkPayment(currentPaymentId, true); }, 6000);
    return () => window.clearInterval(timer);
  }, [currentPaymentId, open, store.payments]);

  const startPayment = async () => {
    if (!offer.requestReference) return;
    setOperation(true);
    setError("");
    try {
      const payment = await initialiserPaiement(offer.requestReference, phone, operator);
      replacePayment(payment);
      setCurrentPaymentId(payment.id);
      if (payment.status === "failed") {
        setError("Le paiement n’a pas pu être initié. Vérifiez le numéro puis réessayez.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Le paiement n’a pas pu être lancé.");
    } finally {
      setOperation(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) return;
    setError("");
    setCurrentPaymentId(
      store.payments.find((payment) => payment.requestId === offer.requestReference && payment.status === "pending")?.id
        ?? null,
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <button className="button button-primary" type="button">Régler maintenant</button>}
      </DialogTrigger>
      <DialogContent className="portal-dialog payment-dialog">
        <DialogHeader>
          <DialogTitle>Paiement Mobile Money</DialogTitle>
          <DialogDescription>Choisissez l’opérateur associé au numéro qui effectuera le règlement.</DialogDescription>
        </DialogHeader>
        <div className="payment-summary">
          <span>Montant à régler</span>
          <strong>{formatFcfa(offer.premium)}</strong>
          <small>{offer.product} · dossier {offer.requestReference}</small>
        </div>
        {error && <div className="form-alert error" role="alert"><CircleAlert size={17} /> {error}</div>}
        {currentPayment ? (
          <div className={`payment-result ${currentPayment.status === "succeeded" ? "success" : currentPayment.status === "failed" ? "failed" : "pending"}`}>
            <span>{currentPayment.status === "succeeded" ? <CheckCircle2 size={30} /> : <Smartphone size={30} />}</span>
            <h3>{currentPayment.status === "succeeded" ? "Paiement confirmé." : currentPayment.providerStatus === "a_verifier" ? "Paiement en cours de vérification." : currentPayment.status === "failed" ? "Le paiement a échoué." : "Confirmez la demande sur votre téléphone."}</h3>
            <p>{currentPayment.status === "succeeded" ? `${currentPayment.reference} · votre contrat est maintenant en préparation.` : currentPayment.providerStatus === "a_verifier" ? "Ne relancez pas le paiement. Notre équipe vérifie d’abord la transaction." : currentPayment.ussdCode ? `Si nécessaire, utilisez le code ${currentPayment.ussdCode}.` : `Référence ${currentPayment.reference}. Le statut se met à jour automatiquement.`}</p>
            {currentPayment.status === "pending" && currentPayment.providerStatus !== "a_verifier" && (
              <button className="button button-secondary" type="button" disabled={operation} onClick={() => { void checkPayment(currentPayment.id); }}>
                {operation ? "Vérification…" : "Vérifier maintenant"}
              </button>
            )}
          </div>
        ) : (
          <>
            <fieldset className="payment-operator-grid">
              <legend>Choisissez votre opérateur</legend>
              <label className={operator === "MTN" ? "selected mtn" : "mtn"}>
                <input type="radio" name="payment-operator" value="MTN" checked={operator === "MTN"} onChange={() => setOperator("MTN")} />
                <img src={assetUrl("/images/payment-operators/mtn-logo.png")} alt="MTN Mobile Money" />
                <strong>MTN Mobile Money</strong>
                {operator === "MTN" && <CheckCircle2 size={18} />}
              </label>
              <label className={operator === "ORANGE" ? "selected orange" : "orange"}>
                <input type="radio" name="payment-operator" value="ORANGE" checked={operator === "ORANGE"} onChange={() => setOperator("ORANGE")} />
                <img src={assetUrl("/images/payment-operators/orange-logo.svg")} alt="Orange Money" />
                <strong>Orange Money</strong>
                {operator === "ORANGE" && <CheckCircle2 size={18} />}
              </label>
            </fieldset>
            <label className="form-field">
              <span>Numéro {operator === "MTN" ? "MTN Mobile Money" : "Orange Money"}</span>
              <input type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="6 99 00 00 00" autoComplete="tel" />
            </label>
            <button className="button button-primary" type="button" disabled={operation || phone.trim().length < 9} onClick={() => { void startPayment(); }}>
              {operation ? "Initialisation…" : `Payer ${formatFcfa(offer.premium)}`}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
