import { useEffect, useRef, useState } from "react";

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  disabled?: boolean;
}

export function GoogleSignInButton({ onCredential, disabled = false }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || disabled) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !containerRef.current || !window.google) return;
      containerRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => onCredential(credential),
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        locale: "fr",
        width: Math.min(400, containerRef.current.clientWidth || 400),
      });
    };

    if (window.google) {
      render();
      return () => { cancelled = true; };
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing || document.createElement("script");
    const handleError = () => !cancelled && setUnavailable(true);
    script.addEventListener("load", render);
    script.addEventListener("error", handleError);
    if (!existing) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      script.removeEventListener("load", render);
      script.removeEventListener("error", handleError);
    };
  }, [clientId, disabled, onCredential]);

  if (!clientId) {
    return <p className="google-unavailable">La connexion Google sera disponible après sa configuration.</p>;
  }
  if (unavailable) {
    return <p className="google-unavailable">Google est momentanément indisponible.</p>;
  }
  return <div className="google-button" ref={containerRef} aria-busy={disabled} />;
}
