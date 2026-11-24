import { NewRequestPage, OfferDetailPage } from "../pages/flow-pages";

export default function RequestPageRoute({ pathname }: { pathname: string }) {
  return pathname === "/espace/demandes/nouvelle"
    ? <NewRequestPage />
    : <OfferDetailPage offerId={decodeURIComponent(pathname.split("/")[3])} />;
}
