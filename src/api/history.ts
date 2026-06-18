import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { HistoryResponse } from "@/api/types";

export async function getHistory(poolId: string): Promise<HistoryResponse> {
  const res = await api.get<HistoryResponse>(`/pools/${poolId}/history`);
  return res.data;
}

export function useHistory(poolId: string) {
  return useQuery({
    queryKey: ["history", poolId],
    queryFn: () => getHistory(poolId),
    enabled: Boolean(poolId),
  });
}
