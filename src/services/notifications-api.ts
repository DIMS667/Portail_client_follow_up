import type { Notification } from "../types/domain";
import { ErreurApi } from "./authentication-api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.followupassurance.com"))
  .replace(/\/+$/, "");
const NOTIFICATIONS_BASE_URL = `${API_BASE_URL}/api/v1/frontoffice/notifications`;

type NotificationApi = {
  id: string;
  type_notification: string;
  titre: string;
  message: string;
  route: string;
  lue: boolean;
  cree_le: string;
};

function lireCookie(nom: string) {
  const prefixe = `${encodeURIComponent(nom)}=`;
  const cookie = document.cookie.split("; ").find((valeur) => valeur.startsWith(prefixe));
  return cookie ? decodeURIComponent(cookie.slice(prefixe.length)) : undefined;
}

async function appeler<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const entetes = new Headers(options.headers);
  const jetonCsrf = lireCookie("followup_csrf_client");
  if (jetonCsrf && options.method && options.method !== "GET") {
    entetes.set("X-CSRF-Token", jetonCsrf);
  }
  let reponse: Response;
  try {
    reponse = await fetch(`${NOTIFICATIONS_BASE_URL}${chemin}`, {
      ...options,
      credentials: "include",
      headers: entetes,
    });
  } catch {
    throw new ErreurApi("Le service de notifications est momentanément inaccessible.", 0);
  }
  if (!reponse.ok) {
    throw new ErreurApi("L’opération sur les notifications a échoué.", reponse.status);
  }
  if (reponse.status === 204) return undefined as T;
  return reponse.json() as Promise<T>;
}

function versNotification(item: NotificationApi): Notification {
  return {
    id: item.id,
    title: item.titre,
    body: item.message,
    date: item.cree_le,
    route: item.route,
    read: item.lue,
    kind: item.type_notification,
  };
}

export async function obtenirNotifications() {
  const notifications = await appeler<NotificationApi[]>("");
  return notifications.map(versNotification);
}

export function marquerNotificationLue(notificationId: string) {
  return appeler<void>(`/${encodeURIComponent(notificationId)}/lecture`, { method: "POST" });
}

export function marquerToutesNotificationsLues() {
  return appeler<void>("/lectures", { method: "POST" });
}

export function creerFluxNotifications() {
  return new EventSource(`${NOTIFICATIONS_BASE_URL}/flux`, { withCredentials: true });
}
