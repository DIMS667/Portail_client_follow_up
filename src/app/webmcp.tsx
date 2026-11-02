import { useEffect, useRef } from "react";
import { usePortal } from "./portal-context";

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
      name: "start_insurance_request",
      title: "Démarrer une demande d’assurance",
      description: "Ouvre le choix du produit pour commencer une nouvelle demande d’assurance.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        portalRef.current.navigate("/espace/demandes/nouvelle");
        return { started: true, route: "/espace/demandes/nouvelle" };
      },
    });

    return () => lifecycle.abort();
  }, []);

  return null;
}
