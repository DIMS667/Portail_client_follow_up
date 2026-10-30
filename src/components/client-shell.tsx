import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell, ChevronRight, CircleHelp, ClipboardList, FileText, FolderOpen, Home, LifeBuoy,
  LogOut, MessageCircle, RefreshCcw, ShieldCheck, UserRound, WalletCards,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";
import { isPortalDeployment } from "../app/base-path";
import { usePortal } from "../app/portal-context";
import { marquerNotificationLue } from "../services/notifications-api";
import { markNotificationRead, signOut } from "../services/portal-service";
import { deconnecter } from "../services/authentication-api";
import type { Notification } from "../types/domain";

const primaryNav = [
  { label: "Accueil", route: "/espace", icon: Home },
  { label: "Mes demandes", route: "/espace/demandes", icon: ClipboardList },
  { label: "Mes contrats", route: "/espace/contrats", icon: ShieldCheck },
  { label: "Mes documents", route: "/espace/documents", icon: FolderOpen },
  { label: "Mes paiements", route: "/espace/paiements", icon: WalletCards },
  { label: "Mes sinistres", route: "/espace/sinistres", icon: LifeBuoy },
];

const secondaryNav = [
  { label: "Messagerie", route: "/espace/messagerie", icon: MessageCircle },
  { label: "Notifications", route: "/espace/notifications", icon: Bell },
  { label: "Mon profil", route: "/espace/profil", icon: UserRound },
  { label: "Aide", route: "/espace/aide", icon: CircleHelp },
];

const notificationIcons: Record<string, typeof Bell> = {
  proposal: ClipboardList,
  document: FileText,
  payment: WalletCards,
  contract: ShieldCheck,
  request: ClipboardList,
  claim: LifeBuoy,
  message: MessageCircle,
};

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isActive(pathname: string, route: string) {
  if (route === "/espace") return pathname === route;
  return pathname.startsWith(route);
}

export function ClientShell({ children }: { children: ReactNode }) {
  const { store, pathname, navigate, updateStore, resetDemo } = usePortal();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const unread = store.notifications.filter((notification) => !notification.read).length;
  const newNotifications = [...store.notifications]
    .filter((notification) => !notification.read)
    .sort((first, second) => {
      const firstDate = new Date(first.date).getTime();
      const secondDate = new Date(second.date).getTime();
      return (Number.isNaN(secondDate) ? 0 : secondDate) - (Number.isNaN(firstDate) ? 0 : firstDate);
    })
    .slice(0, 5);
  const clientName = `${store.client.firstName} ${store.client.lastName}`.trim();
  const clientInitials = `${store.client.firstName[0] || ""}${store.client.lastName[0] || ""}`.toUpperCase() || "CL";

  useEffect(() => {
    if (!notificationsOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  useEffect(() => setNotificationsOpen(false), [pathname]);

  const openNotification = (notification: Notification) => {
    updateStore((current) => markNotificationRead(current, notification.id));
    setNotificationsOpen(false);
    if (isPortalDeployment) void marquerNotificationLue(notification.id).catch(() => undefined);
    navigate(notification.route.startsWith("/espace") ? notification.route : "/espace/notifications");
  };

  const openAllNotifications = () => {
    setNotificationsOpen(false);
    navigate("/espace/notifications");
  };

  const logout = async () => {
    try {
      await deconnecter();
    } finally {
      const next = signOut(store);
      updateStore(next);
      if (import.meta.env.PROD) window.location.assign("/login/");
      else navigate("/");
    }
  };
  return (
    <div className="min-h-screen bg-[#fbf8f7] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-hidden bg-[linear-gradient(180deg,#4a0710_0%,#710d17_58%,#98131d_100%)] px-4 py-5 text-red-50 shadow-[18px_0_45px_rgba(94,10,19,.12)] lg:flex">
        <button className="mb-8 flex min-h-[58px] items-center rounded-xl bg-white px-3 py-2 text-left shadow-[0_12px_35px_rgba(40,0,5,.18)]" type="button" onClick={() => navigate("/espace")} aria-label="FOLLOW-UP INSURANCE, accueil de l’espace client"><BrandLogo className="w-[180px]" /></button>
        <nav className="grid gap-1" aria-label="Navigation de l’espace client">
          <span className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-orange-200/70">Mon espace</span>
          {primaryNav.map(({ label, route, icon: Icon }) => {
            const active = isActive(pathname, route);
            return <button type="button" onClick={() => navigate(route)} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors", active ? "bg-white text-slate-950 shadow-sm" : "text-red-100/70 hover:bg-white/[.08] hover:text-white")} key={route} aria-current={active ? "page" : undefined}><Icon size={18} className={active ? "text-brand-red" : "text-red-200/60 group-hover:text-white"} /><span className="flex-1">{label}</span>{active && <span className="size-1.5 rounded-full bg-brand-orange" />}</button>;
          })}
          <span className="mt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-orange-200/70">Communication</span>
          {secondaryNav.map(({ label, route, icon: Icon }) => {
            const active = isActive(pathname, route);
            return <button type="button" onClick={() => navigate(route)} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors", active ? "bg-white text-slate-950 shadow-sm" : "text-red-100/70 hover:bg-white/[.08] hover:text-white")} key={route} aria-current={active ? "page" : undefined}><Icon size={18} className={active ? "text-brand-red" : "text-red-200/60 group-hover:text-white"} /><span className="flex-1">{label}</span>{route.includes("notifications") && unread > 0 && <span className={cn("grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold", active ? "bg-brand-red text-white" : "bg-brand-orange/25 text-orange-100")}>{unread}</span>}</button>;
          })}
        </nav>
        <div className="mt-auto grid gap-3">
          <div className="rounded-2xl border border-white/[.08] bg-white/[.05] p-3">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-brand-orange/20 text-sm font-bold text-orange-100">AM</span><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-white">Votre conseillère</strong><span className="block text-[11px] text-red-100/55">Disponible aujourd’hui</span></div><ChevronRight size={16} className="text-red-100/40" /></div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button type="button" variant="ghost" className="h-9 justify-start px-2 text-xs text-red-100/55 hover:bg-white/[.08] hover:text-white"><RefreshCcw size={15} /> Réinitialiser la démonstration</Button></AlertDialogTrigger>
            <AlertDialogContent className="portal-dialog">
              <AlertDialogHeader><AlertDialogTitle>Réinitialiser la démonstration ?</AlertDialogTitle><AlertDialogDescription>Les modifications effectuées dans ce portail seront supprimées. Le back-office et ses données ne seront jamais touchés.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel className="dialog-cancel">Annuler</AlertDialogCancel><AlertDialogAction className="dialog-confirm" onClick={() => { resetDemo(); navigate("/"); }}>Réinitialiser</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button type="button" className="flex items-center gap-3 rounded-2xl border border-white/[.1] bg-white/[.06] p-2.5 text-left transition-colors hover:bg-white/[.1]" onClick={() => navigate("/espace/profil")}><span className="grid size-9 place-items-center rounded-xl bg-brand-orange text-xs font-bold text-white">{clientInitials}</span><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-white">{clientName}</strong><small className="text-[10px] text-red-100/55">Client · {store.client.id}</small></div><ChevronRight size={15} className="text-red-100/40" /></button>
        </div>
      </aside>

      <div className="min-h-screen pb-20 lg:ml-[248px] lg:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl lg:h-[72px] lg:px-10">
          <button type="button" className="flex min-w-0 items-center lg:hidden" onClick={() => navigate("/espace")} aria-label="FOLLOW-UP INSURANCE, accueil"><BrandLogo className="w-[150px]" /></button>
          <div className="hidden gap-0.5 lg:grid"><span className="text-[11px] font-semibold uppercase tracking-[.14em] text-slate-400">Espace personnel</span><strong className="text-[15px] text-slate-900">Bonjour {store.client.firstName}</strong></div>
          <div className="flex items-center gap-1.5">
            <div className="relative" ref={notificationsRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("relative rounded-xl border bg-white text-slate-600 hover:bg-slate-50", notificationsOpen ? "border-brand-red bg-brand-soft text-brand-red" : "border-slate-200")}
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label={`${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`}
                aria-haspopup="dialog"
                aria-expanded={notificationsOpen}
                aria-controls="notifications-popover"
              >
                <Bell size={18} />
                {unread > 0 && <span className="absolute -right-1 -top-1 grid size-[18px] place-items-center rounded-full border-2 border-white bg-rose-500 text-[9px] font-bold text-white">{unread}</span>}
              </Button>
              {notificationsOpen && (
                <section
                  id="notifications-popover"
                  role="dialog"
                  aria-label="Nouvelles notifications"
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-[0_22px_60px_rgba(15,23,42,.18)]"
                >
                  <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <strong className="block text-sm text-slate-900">Nouvelles notifications</strong>
                      <span className="mt-0.5 block text-xs text-slate-400">{unread ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Vous êtes à jour"}</span>
                    </div>
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-red"><Bell size={18} /></span>
                  </header>
                  {newNotifications.length ? (
                    <div className="max-h-[360px] overflow-y-auto p-2">
                      {newNotifications.map((notification) => {
                        const Icon = notificationIcons[notification.kind] || Bell;
                        const date = formatNotificationDate(notification.date);
                        return (
                          <button
                            type="button"
                            key={notification.id}
                            className="group grid w-full grid-cols-[42px_minmax(0,1fr)_18px] gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40"
                            onClick={() => openNotification(notification)}
                          >
                            <span className="grid size-[42px] place-items-center rounded-xl bg-brand-soft text-brand-red"><Icon size={19} /></span>
                            <span className="min-w-0">
                              <strong className="block truncate text-sm text-slate-900 group-hover:text-brand-red">{notification.title}</strong>
                              <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">{notification.body}</span>
                              {date && <small className="mt-1.5 block text-[10px] font-medium uppercase tracking-wide text-slate-400">{date}</small>}
                            </span>
                            <ChevronRight size={17} className="mt-3 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-red" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid justify-items-center px-6 py-10 text-center">
                      <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Bell size={22} /></span>
                      <strong className="mt-3 text-sm text-slate-800">Aucune nouvelle notification</strong>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Les prochaines mises à jour de vos dossiers apparaîtront ici.</p>
                    </div>
                  )}
                  <button type="button" className="flex min-h-12 w-full items-center justify-center gap-2 border-t border-slate-100 px-4 text-sm font-bold text-brand-red transition-colors hover:bg-brand-soft" onClick={openAllNotifications}>
                    Afficher toutes les notifications<ChevronRight size={17} />
                  </button>
                </section>
              )}
            </div>
            <Button type="button" variant="ghost" size="icon" className="hidden rounded-xl text-slate-500 hover:bg-slate-100 lg:inline-flex" onClick={logout} aria-label="Se déconnecter"><LogOut size={18} /></Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(68px+env(safe-area-inset-bottom))] grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_35px_rgba(8,24,45,.08)] backdrop-blur-xl lg:hidden" aria-label="Navigation mobile">
        {[
          { label: "Accueil", route: "/espace", icon: Home },
          { label: "Demandes", route: "/espace/demandes", icon: ClipboardList },
          { label: "Contrats", route: "/espace/contrats", icon: FileText },
          { label: "Notifications", route: "/espace/notifications", icon: Bell },
          { label: "Profil", route: "/espace/profil", icon: UserRound },
        ].map(({ label, route, icon: Icon }) => { const active = isActive(pathname, route); return <button type="button" key={route} onClick={() => navigate(route)} className={cn("relative grid min-w-0 place-items-center content-center gap-1 rounded-xl text-[11px] font-semibold transition-colors", active ? "text-brand-red" : "text-slate-400")} aria-current={active ? "page" : undefined}><span className={cn("relative grid size-8 place-items-center rounded-xl", active && "bg-brand-soft")}><Icon size={20} />{route.includes("notifications") && unread > 0 && <em className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-brand-orange text-[8px] not-italic text-white">{unread}</em>}</span><small className="text-[11px] leading-none">{label}</small></button>; })}
      </nav>
    </div>
  );
}
