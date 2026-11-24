import {
  ClaimDetailPage, ClaimsPage, ContractDetailPage, ContractsPage, DashboardPage,
  DocumentsPage, NotFoundPage, NotificationsPage, PaymentsPage, ProfilePage,
  ProposalsPage, RequestDetailPage, RequestsPage,
} from "../pages/client-pages";

/** Une seule frontière de chargement pour les pages livrées dans le même fichier. */
export default function ClientPageRoute({ pathname }: { pathname: string }) {
  if (pathname === "/" || pathname === "/espace") return <DashboardPage />;
  if (pathname === "/espace/demandes") return <RequestsPage />;
  if (/^\/espace\/demandes\/[^/]+\/propositions$/.test(pathname)) return <ProposalsPage requestReference={decodeURIComponent(pathname.split("/")[3])} />;
  if (/^\/espace\/demandes\/[^/]+$/.test(pathname)) return <RequestDetailPage reference={decodeURIComponent(pathname.split("/")[3])} />;
  if (pathname === "/espace/documents") return <DocumentsPage />;
  if (pathname === "/espace/paiements") return <PaymentsPage />;
  if (pathname === "/espace/contrats") return <ContractsPage />;
  if (/^\/espace\/contrats\/[^/]+$/.test(pathname)) return <ContractDetailPage policyNumber={decodeURIComponent(pathname.split("/")[3])} />;
  if (pathname === "/espace/sinistres") return <ClaimsPage />;
  if (/^\/espace\/sinistres\/[^/]+$/.test(pathname)) return <ClaimDetailPage reference={decodeURIComponent(pathname.split("/")[3])} />;
  if (pathname === "/espace/notifications") return <NotificationsPage />;
  if (pathname === "/espace/profil") return <ProfilePage />;
  return <NotFoundPage />;
}
