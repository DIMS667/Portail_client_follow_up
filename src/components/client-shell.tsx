import type { ReactNode } from "react";
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
import { usePortal } from "../app/portal-context";
import { signOut } from "../services/portal-service";

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

function isActive(pathname: string, route: string) {
  if (route === "/espace") return pathname === route;
  return pathname.startsWith(route);
}

export function ClientShell({ children }: { children: ReactNode }) {
  const { store, pathname, navigate, updateStore, resetDemo } = usePortal();
  const unread = store.notifications.filter((notification) => !notification.read).length;
  const logout = () => { updateStore(signOut(store)); navigate("/"); };
  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-hidden bg-[#08182d] px-4 py-5 text-slate-200 shadow-[18px_0_45px_rgba(8,24,45,.08)] lg:flex">
        <button className="mb-8 flex items-center gap-3 rounded-xl px-2 py-1.5 text-left" type="button" onClick={() => navigate("/espace")}>
          <span className="grid size-10 place-items-center rounded-[12px_12px_12px_4px] bg-blue-500 text-white shadow-[0_10px_30px_rgba(36,107,253,.32)]"><ShieldCheck size={21} /></span>
          <span className="grid gap-0.5"><strong className="text-[15px] tracking-[-.01em] text-white">Espace Client</strong><small className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Portail assurances</small></span>
        </button>
        <nav className="grid gap-1" aria-label="Navigation de l’espace client">
          <span className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Mon espace</span>
          {primaryNav.map(({ label, route, icon: Icon }) => {
            const active = isActive(pathname, route);
            return <button type="button" onClick={() => navigate(route)} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors", active ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:bg-white/[.06] hover:text-white")} key={route} aria-current={active ? "page" : undefined}><Icon size={18} className={active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-300"} /><span className="flex-1">{label}</span>{active && <span className="size-1.5 rounded-full bg-blue-600" />}</button>;
          })}
          <span className="mt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Communication</span>
          {secondaryNav.map(({ label, route, icon: Icon }) => {
            const active = isActive(pathname, route);
            return <button type="button" onClick={() => navigate(route)} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors", active ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:bg-white/[.06] hover:text-white")} key={route} aria-current={active ? "page" : undefined}><Icon size={18} className={active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-300"} /><span className="flex-1">{label}</span>{route.includes("notifications") && unread > 0 && <span className={cn("grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold", active ? "bg-blue-600 text-white" : "bg-blue-500/20 text-blue-300")}>{unread}</span>}</button>;
          })}
        </nav>
        <div className="mt-auto grid gap-3">
          <div className="rounded-2xl border border-white/[.08] bg-white/[.05] p-3">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400/15 text-sm font-bold text-emerald-300">AM</span><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-white">Votre conseillère</strong><span className="block text-[11px] text-slate-500">Disponible aujourd’hui</span></div><ChevronRight size={16} className="text-slate-600" /></div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button type="button" variant="ghost" className="h-9 justify-start px-2 text-xs text-slate-500 hover:bg-white/[.06] hover:text-slate-200"><RefreshCcw size={15} /> Réinitialiser la démonstration</Button></AlertDialogTrigger>
            <AlertDialogContent className="portal-dialog">
              <AlertDialogHeader><AlertDialogTitle>Réinitialiser la démonstration ?</AlertDialogTitle><AlertDialogDescription>Les modifications effectuées dans ce portail seront supprimées. Le back-office et ses données ne seront jamais touchés.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel className="dialog-cancel">Annuler</AlertDialogCancel><AlertDialogAction className="dialog-confirm" onClick={() => { resetDemo(); navigate("/"); }}>Réinitialiser</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button type="button" className="flex items-center gap-3 rounded-2xl border border-white/[.08] bg-white/[.04] p-2.5 text-left transition-colors hover:bg-white/[.08]" onClick={() => navigate("/espace/profil")}><span className="grid size-9 place-items-center rounded-xl bg-blue-500 text-xs font-bold text-white">JD</span><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-white">Jean Dupont</strong><small className="text-[10px] text-slate-500">Client · CL-001</small></div><ChevronRight size={15} className="text-slate-600" /></button>
        </div>
      </aside>

      <div className="min-h-screen pb-20 lg:ml-[248px] lg:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl lg:h-[72px] lg:px-10">
          <div className="flex items-center gap-2 lg:hidden"><span className="grid size-9 place-items-center rounded-[11px_11px_11px_4px] bg-[#08182d] text-white"><ShieldCheck size={18} /></span><strong className="text-sm tracking-tight text-slate-950">Espace Client</strong></div>
          <div className="hidden gap-0.5 lg:grid"><span className="text-[11px] font-semibold uppercase tracking-[.14em] text-slate-400">Espace personnel</span><strong className="text-[15px] text-slate-900">Bonjour {store.client.firstName}</strong></div>
          <div className="flex items-center gap-1.5">
            <Button type="button" variant="ghost" size="icon" className="relative rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={() => navigate("/espace/notifications")} aria-label={`${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`}><Bell size={18} />{unread > 0 && <span className="absolute -right-1 -top-1 grid size-[18px] place-items-center rounded-full border-2 border-white bg-rose-500 text-[9px] font-bold text-white">{unread}</span>}</Button>
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
        ].map(({ label, route, icon: Icon }) => { const active = isActive(pathname, route); return <button type="button" key={route} onClick={() => navigate(route)} className={cn("relative grid min-w-0 place-items-center content-center gap-1 rounded-xl text-[11px] font-semibold transition-colors", active ? "text-blue-600" : "text-slate-400")} aria-current={active ? "page" : undefined}><span className={cn("relative grid size-8 place-items-center rounded-xl", active && "bg-blue-50")}><Icon size={20} />{route.includes("notifications") && unread > 0 && <em className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[8px] not-italic text-white">{unread}</em>}</span><small className="text-[11px] leading-none">{label}</small></button>; })}
      </nav>
    </div>
  );
}
