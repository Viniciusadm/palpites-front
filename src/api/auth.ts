import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { getToken } from "@/api/session";
import type {
  AuthResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  UpdateUserPreferencesRequest,
} from "@/api/types";

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

export async function updateUserPreferences(
  body: UpdateUserPreferencesRequest,
): Promise<MeResponse> {
  const res = await api.put<MeResponse>("/auth/me/preferences", body);
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

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
