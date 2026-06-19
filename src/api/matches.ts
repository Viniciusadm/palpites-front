import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type {
  CreateMatchRequest,
  EnterResultRequest,
  MatchResponse,
  MatchesListResponse,
  UpdateMatchRequest,
} from "@/api/types";

export async function getMatches(tournamentId: string): Promise<MatchResponse[]> {
  const res = await api.get<MatchesListResponse>(`/tournaments/${tournamentId}/matches`);
  return res.data.matches;
}

export function useMatches(tournamentId: string) {
  return useQuery({
    queryKey: ["matches", tournamentId],
    queryFn: () => getMatches(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export async function createMatch(
  tournamentId: string,
  body: CreateMatchRequest,
): Promise<MatchResponse> {
  const res = await api.post<MatchResponse>(`/tournaments/${tournamentId}/matches`, body);
  return res.data;
}

export async function updateMatch(
  matchId: string,
  body: UpdateMatchRequest,
): Promise<MatchResponse> {
  const res = await api.put<MatchResponse>(`/matches/${matchId}`, body);
  return res.data;
}

export async function deleteMatch(matchId: string): Promise<void> {
  await api.delete(`/matches/${matchId}`);
}

export async function enterResult(
  matchId: string,
  body: EnterResultRequest,
): Promise<MatchResponse> {
  const res = await api.put<MatchResponse>(`/matches/${matchId}/result`, body);
  return res.data;
}

export function useCreateMatch(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMatchRequest) => createMatch(tournamentId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] }),
  });
}

export function useUpdateMatch(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { matchId: string; body: UpdateMatchRequest }) =>
      updateMatch(vars.matchId, vars.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] }),
  });
}

export function useDeleteMatch(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMatch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] }),
  });
}

export function useEnterResult(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { matchId: string; body: EnterResultRequest }) =>
      enterResult(vars.matchId, vars.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] }),
  });
}
