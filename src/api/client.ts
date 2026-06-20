import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { clearQueryCache } from "@/lib/query-persister";

export const AUTH_TOKEN_KEY = "palpites:token";
export const SESSION_EXPIRED_KEY = "palpites:session-expired";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let redirecting = false;

function handleUnauthorized() {
  if (typeof window === "undefined" || redirecting) return;

  if (window.location.pathname.startsWith("/login")) return;
  redirecting = true;

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  useAuthStore.getState().clear();
  void clearQueryCache();
  window.sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");

  window.location.assign("/login");
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const url = error.config?.url ?? "";
    const isAuthRequest = url.includes("/auth/login") || url.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthRequest) {
      handleUnauthorized();
    }
    const message =
      error.response?.data?.message ?? error.message ?? "Erro inesperado na requisição.";
    return Promise.reject(new Error(message));
  },
);
