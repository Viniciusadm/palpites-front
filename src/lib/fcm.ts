import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from "firebase/messaging";
import { registerDevice, unregisterDevice } from "@/api/notifications";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const vapidKey = import.meta.env.VITE_FCM_VAPID_KEY;

const PUSH_FLAG_KEY = "palpites:push";

export type PushEnableResult = "granted" | "denied" | "unsupported";

function isConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey,
  );
}

/** Whether the browser can deliver push notifications and Firebase is configured. */
export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "Notification" in window &&
    isConfigured()
  );
}

/** Current browser-level notification permission. */
export function pushPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  return Notification.permission;
}

export function getPushFlag(): "on" | "off" | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(PUSH_FLAG_KEY);
  return value === "on" || value === "off" ? value : null;
}

function setPushFlag(value: "on" | "off"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PUSH_FLAG_KEY, value);
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

/** Resolves the current FCM token without prompting (permission must already be granted). */
async function currentToken(fcm: Messaging): Promise<string | null> {
  const swUrl = `/firebase-messaging-sw.js?${new URLSearchParams({
    apiKey: firebaseConfig.apiKey ?? "",
    authDomain: firebaseConfig.authDomain ?? "",
    projectId: firebaseConfig.projectId ?? "",
    messagingSenderId: firebaseConfig.messagingSenderId ?? "",
    appId: firebaseConfig.appId ?? "",
  }).toString()}`;

  // The service worker reads the Firebase config from its query string so the
  // static file in /public does not need build-time env injection.
  const registration = await navigator.serviceWorker.register(swUrl, {
    scope: "/firebase-cloud-messaging-push-scope",
  });

  return getToken(fcm, { vapidKey, serviceWorkerRegistration: registration });
}

/** Registers the SW, persists the device token, and wires foreground handling. */
async function registerCurrentDevice(
  fcm: Messaging,
  onForegroundMessage?: () => void,
): Promise<void> {
  const token = await currentToken(fcm);
  if (token) {
    await registerDevice(token, "web");
  }
  onMessage(fcm, () => {
    onForegroundMessage?.();
  });
}

/**
 * Re-attaches push on app load WITHOUT ever prompting the user. Only proceeds
 * when the browser permission is already granted and the user has not opted out,
 * keeping previously-enabled users working while staying dormant for everyone else.
 */
export async function resumePush(onForegroundMessage?: () => void): Promise<void> {
  if (started) return;
  if (!pushSupported()) return;
  if (pushPermission() !== "granted") return;
  if (getPushFlag() === "off") return;

  const fcm = await resolveMessaging();
  if (!fcm) return;
  started = true;
  try {
    await registerCurrentDevice(fcm, onForegroundMessage);
  } catch (error) {
    started = false;
    console.warn("Falha ao retomar notificações push", error);
  }
}

/**
 * Turns push on from an explicit user action: requests permission on demand,
 * registers the device, and records the opt-in flag.
 */
export async function enablePush(onForegroundMessage?: () => void): Promise<PushEnableResult> {
  if (!pushSupported()) return "unsupported";

  const fcm = await resolveMessaging();
  if (!fcm) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  try {
    await registerCurrentDevice(fcm, onForegroundMessage);
    setPushFlag("on");
    started = true;
    return "granted";
  } catch (error) {
    console.warn("Falha ao ativar notificações push", error);
    return "unsupported";
  }
}

/** Turns push off: records the opt-out flag and removes this device's token. */
export async function disablePush(): Promise<void> {
  setPushFlag("off");
  if (!pushSupported() || pushPermission() !== "granted") return;
  try {
    const fcm = await resolveMessaging();
    if (!fcm) return;
    const token = await currentToken(fcm);
    if (token) {
      await unregisterDevice(token);
    }
  } catch (error) {
    console.warn("Falha ao desativar notificações push", error);
  }
}
