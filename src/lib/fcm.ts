import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from "firebase/messaging";
import { registerDevice } from "@/api/notifications";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const vapidKey = import.meta.env.VITE_FCM_VAPID_KEY;

function isConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey,
  );
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let started = false;

async function resolveMessaging(): Promise<Messaging | null> {
  if (!isConfigured()) return null;
  if (!(await isSupported().catch(() => false))) return null;
  if (!app) app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  if (!messaging) messaging = getMessaging(app);
  return messaging;
}

/**
 * Requests notification permission, registers the FCM service worker, persists
 * the device token on the backend, and wires foreground message handling.
 * No-op when Firebase env vars are absent or the browser lacks support, so the
 * feature stays dormant until configured.
 */
export async function initPushNotifications(onForegroundMessage?: () => void): Promise<void> {
  if (started) return;
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("Notification" in window)
  ) {
    return;
  }

  const fcm = await resolveMessaging();
  if (!fcm) return;
  started = true;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // The service worker reads the Firebase config from its query string so the
    // static file in /public does not need build-time env injection.
    const swUrl = `/firebase-messaging-sw.js?${new URLSearchParams({
      apiKey: firebaseConfig.apiKey ?? "",
      authDomain: firebaseConfig.authDomain ?? "",
      projectId: firebaseConfig.projectId ?? "",
      messagingSenderId: firebaseConfig.messagingSenderId ?? "",
      appId: firebaseConfig.appId ?? "",
    }).toString()}`;
    const registration = await navigator.serviceWorker.register(swUrl);

    const token = await getToken(fcm, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (token) {
      await registerDevice(token, "web");
    }

    onMessage(fcm, () => {
      onForegroundMessage?.();
    });
  } catch (error) {
    started = false;
    console.warn("Falha ao inicializar notificações push", error);
  }
}
