import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type {
  PredictionResponse,
  PredictionsListResponse,
  UpsertPredictionRequest,
} from "@/api/types";

export async function getMyPredictions(poolId: string): Promise<PredictionResponse[]> {
  const res = await api.get<PredictionsListResponse>(`/pools/${poolId}/predictions`);
  return res.data.predictions;
}

export function useMyPredictions(poolId: string) {
  return useQuery({
    queryKey: ["predictions", poolId],
    queryFn: () => getMyPredictions(poolId),
    enabled: Boolean(poolId),
  });
}

export async function savePrediction(
  poolId: string,
  matchId: string,
  body: UpsertPredictionRequest,
): Promise<PredictionResponse> {
  const res = await api.put<PredictionResponse>(
    `/pools/${poolId}/matches/${matchId}/prediction`,
    body,
  );
  return res.data;
}

export function useSavePrediction(poolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { matchId: string; body: UpsertPredictionRequest }) =>
      savePrediction(poolId, vars.matchId, vars.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions", poolId] });
      queryClient.invalidateQueries({ queryKey: ["history", poolId] });
      queryClient.invalidateQueries({ queryKey: ["ranking", poolId] });
    },
  });
}
