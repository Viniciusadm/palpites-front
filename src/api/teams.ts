import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type {
  CreateTeamRequest,
  TeamResponse,
  TeamsListResponse,
  UpdateTeamRequest,
} from "@/api/types";

export async function getTeams(): Promise<TeamResponse[]> {
  const res = await api.get<TeamsListResponse>("/teams");
  return res.data.teams;
}

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });
}

export async function createTeam(body: CreateTeamRequest): Promise<TeamResponse> {
  const res = await api.post<TeamResponse>("/teams", body);
  return res.data;
}

export async function updateTeam(id: string, body: UpdateTeamRequest): Promise<TeamResponse> {
  const res = await api.put<TeamResponse>(`/teams/${id}`, body);
  return res.data;
}

export async function deleteTeam(id: string): Promise<void> {
  await api.delete(`/teams/${id}`);
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: UpdateTeamRequest }) => updateTeam(vars.id, vars.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}
