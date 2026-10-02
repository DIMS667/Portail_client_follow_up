import type { ReactNode } from "react";
import {
  Bell, CircleHelp, ClipboardList, FileText, FolderOpen, HandCoins, Home, LifeBuoy,
  LogOut, MessageCircle, RefreshCcw, ShieldCheck, UserRound, WalletCards,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
    <div className="client-shell">
      <aside className="desktop-sidebar">
        <button className="brand brand-button sidebar-brand" type="button" onClick={() => navigate("/espace")}><span className="brand-mark"><ShieldCheck size={22} /></span><span>Espace Client</span></button>
        <nav className="sidebar-nav" aria-label="Navigation de l’espace client">
          <span className="nav-caption">Mon espace</span>
          {primaryNav.map(({ label, route, icon: Icon }) => <button type="button" onClick={() => navigate(route)} className={isActive(pathname, route) ? "active" : ""} key={route} aria-current={isActive(pathname, route) ? "page" : undefined}><Icon size={19} /><span>{label}</span></button>)}
          <span className="nav-caption secondary">Communication</span>
          {secondaryNav.map(({ label, route, icon: Icon }) => <button type="button" onClick={() => navigate(route)} className={isActive(pathname, route) ? "active" : ""} key={route} aria-current={isActive(pathname, route) ? "page" : undefined}><Icon size={19} /><span>{label}</span>{route.includes("notifications") && unread > 0 && <em>{unread}</em>}</button>)}
        </nav>
        <div className="sidebar-footer">
          <AlertDialog>
            <AlertDialogTrigger asChild><button type="button" className="reset-button"><RefreshCcw size={16} /> Réinitialiser la démonstration</button></AlertDialogTrigger>
            <AlertDialogContent className="portal-dialog">
              <AlertDialogHeader><AlertDialogTitle>Réinitialiser la démonstration ?</AlertDialogTitle><AlertDialogDescription>Les modifications effectuées dans ce portail seront supprimées. Le back-office et ses données ne seront jamais touchés.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel className="dialog-cancel">Annuler</AlertDialogCancel><AlertDialogAction className="dialog-confirm" onClick={() => { resetDemo(); navigate("/"); }}>Réinitialiser</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button type="button" className="sidebar-user" onClick={() => navigate("/espace/profil")}><span>JD</span><div><strong>Jean Dupont</strong><small>CL-001</small></div></button>
        </div>
      </aside>

      <div className="client-main">
        <header className="client-topbar">
          <div className="mobile-brand"><span className="brand-mark"><ShieldCheck size={19} /></span><strong>Espace Client</strong></div>
          <div className="topbar-copy"><span>Espace personnel</span><strong>Bonjour {store.client.firstName}</strong></div>
          <div className="topbar-actions">
            <button type="button" className="icon-button" onClick={() => navigate("/espace/notifications")} aria-label={`${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`}><Bell size={20} />{unread > 0 && <span>{unread}</span>}</button>
            <button type="button" className="icon-button logout" onClick={logout} aria-label="Se déconnecter"><LogOut size={20} /></button>
          </div>
        </header>
        <main className="client-content">{children}</main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        {[
          { label: "Accueil", route: "/espace", icon: Home },
          { label: "Demandes", route: "/espace/demandes", icon: ClipboardList },
          { label: "Contrats", route: "/espace/contrats", icon: FileText },
          { label: "Notifications", route: "/espace/notifications", icon: Bell },
          { label: "Profil", route: "/espace/profil", icon: UserRound },
        ].map(({ label, route, icon: Icon }) => <button type="button" key={route} onClick={() => navigate(route)} className={isActive(pathname, route) ? "active" : ""} aria-current={isActive(pathname, route) ? "page" : undefined}><span className="mobile-nav-icon"><Icon size={21} />{route.includes("notifications") && unread > 0 && <em>{unread}</em>}</span><small>{label}</small></button>)}
      </nav>
    </div>
  );
}
