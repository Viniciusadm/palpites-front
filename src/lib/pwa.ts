import { registerSW } from "virtual:pwa-register";

let registered = false;

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (registered) return;
  registered = true;

  registerSW({ immediate: true });
}
