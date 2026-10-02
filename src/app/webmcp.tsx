import { useEffect, useRef } from "react";
import { usePortal } from "./portal-context";
import { addMessage } from "../services/portal-service";

interface WebMcpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute(input: unknown): unknown | Promise<unknown>;
}

declare global {
  interface Document {
    modelContext?: {
      registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): void | Promise<void>;
    };
  }
}

export function WebMcpBridge() {
  const portal = usePortal();
  const portalRef = useRef(portal);
  portalRef.current = portal;

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: WebMcpTool) => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);

    void register({
      name: "list_demo_scenarios",
      title: "Lister les scénarios de démonstration",
      description: "Retourne les neuf situations disponibles dans le portail client sans modifier les données.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        return portalRef.current.store.scenarios.map(({ id, number, title, description }) => ({ id, number, title, description }));
      },
    });

    void register({
      name: "open_demo_scenario",
      title: "Ouvrir un scénario",
      description: "Ouvre l’un des neuf scénarios de démonstration dans l’interface visible.",
      inputSchema: { type: "object", properties: { scenarioId: { type: "string" } }, required: ["scenarioId"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const scenarioId = typeof input === "object" && input && "scenarioId" in input ? String((input as { scenarioId: unknown }).scenarioId) : "";
        const scenario = portalRef.current.store.scenarios.find((item) => item.id === scenarioId);
        if (!scenario) throw new Error("Scénario inconnu");
        portalRef.current.navigate(scenario.route);
        return { opened: true, scenarioId, route: scenario.route };
      },
    });

    void register({
      name: "start_insurance_request",
      title: "Démarrer une demande d’assurance",
      description: "Ouvre le choix du produit pour commencer une nouvelle demande simulée.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        portalRef.current.navigate("/espace/demandes/nouvelle");
        return { started: true, route: "/espace/demandes/nouvelle" };
      },
    });

    void register({
      name: "send_demo_message_to_broker",
      title: "Envoyer un message de démonstration",
      description: "Ajoute un message local à la conversation fictive avec le courtier.",
      inputSchema: { type: "object", properties: { body: { type: "string", minLength: 1, maxLength: 500 } }, required: ["body"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const body = typeof input === "object" && input && "body" in input ? String((input as { body: unknown }).body).trim() : "";
        if (!body || body.length > 500) throw new Error("Le message doit contenir entre 1 et 500 caractères");
        portalRef.current.updateStore((current) => addMessage(current, body));
        portalRef.current.navigate("/espace/messagerie");
        return { sent: true, length: body.length };
      },
    });

    return () => lifecycle.abort();
  }, []);

  return null;
}
