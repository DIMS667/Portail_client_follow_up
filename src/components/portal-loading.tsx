import { useEffect, useState, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { portalShellStyles } from "./portal-shell-styles";

/** Le contenu s’affiche dès qu’il est prêt ; seuls les chargements perceptibles montrent un skeleton. */
export function DelayedLoading({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  return visible ? children : null;
}

export function PortalPageSkeleton() {
  return (
    <div className="grid gap-6" role="status" aria-live="polite" aria-label="Chargement de la page">
      <span className="sr-only">Chargement de la page</span>
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid w-full max-w-2xl gap-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-10 w-3/5 max-w-md" /><Skeleton className="h-4 w-full max-w-xl" /></div>
        <Skeleton className="h-11 w-full sm:w-44" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></div>
      <div className="grid gap-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div>
    </div>
  );
}

export function PortalSessionSkeleton() {
  return (
    <div className={portalShellStyles.frame} role="status" aria-live="polite" aria-label="Vérification de la session">
      <span className="sr-only">Vérification de la session</span>
      <aside className={portalShellStyles.sidebar}><Skeleton className="mb-8 h-[58px] w-full rounded-xl bg-white/15" /><div className="grid gap-4">{Array.from({ length: 7 }).map((_, index) => <Skeleton className="h-10 w-full bg-white/10" key={index} />)}</div></aside>
      <div className={portalShellStyles.body}><header className={portalShellStyles.header}><Skeleton className="h-10 w-44" /></header><main className={portalShellStyles.content}><PortalPageSkeleton /></main></div>
    </div>
  );
}

export function RouteLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fbfdff]" role="status" aria-live="polite" aria-label="Chargement">
      <span className="sr-only">Chargement</span>
      <header className="border-b border-slate-100 bg-white"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5"><Skeleton className="h-11 w-44" /><Skeleton className="hidden h-9 w-[480px] md:block" /><Skeleton className="h-10 w-32" /></div></header>
      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-10"><Skeleton className="h-4 w-32" /><Skeleton className="h-12 w-3/5 max-w-xl" /><Skeleton className="h-5 w-full max-w-2xl" /><Skeleton className="mt-4 h-[340px] rounded-3xl" /></main>
    </div>
  );
}
