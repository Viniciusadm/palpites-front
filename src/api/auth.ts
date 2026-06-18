import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { getToken } from "@/api/session";
import type { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from "@/api/types";

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", body);
  return res.data;
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", body);
  return res.data;
}

export async function getMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/auth/me");
  return res.data;
}

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: Boolean(getToken()),
  });
}
