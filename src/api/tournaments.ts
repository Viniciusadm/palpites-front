import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { TournamentDetailResponse } from "@/api/types";

export async function getTournamentDetail(id: string): Promise<TournamentDetailResponse> {
  const res = await api.get<TournamentDetailResponse>(`/tournaments/${id}`);
  return res.data;
}

export function useTournamentDetail(id: string) {
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: () => getTournamentDetail(id),
    enabled: Boolean(id),
  });
}
