const PENDING_INVITE_KEY = "palpites:pending-invite";

export function setPendingInvite(code: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_INVITE_KEY, code);
}

export function getPendingInvite(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(PENDING_INVITE_KEY);
}

export function clearPendingInvite(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_INVITE_KEY);
}

export function buildInviteUrl(code: string): string {
  return `${window.location.origin}/bolao/entrar?code=${encodeURIComponent(code)}`;
}
