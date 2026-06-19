import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { getToken } from "@/api/session";
import type {
  CreatePoolRequest,
  JoinPoolResponse,
  MemberPrediction,
  MemberPredictionsResponse,
  PoolMemberResponse,
  PoolMembersListResponse,
  PoolResponse,
  PoolsListResponse,
  RankingEntry,
  RankingResponse,
  ScoringRuleInput,
  ScoringRuleResponse,
  ScoringRulesListResponse,
  UpdatePoolRequest,
} from "@/api/types";

export async function getPools(): Promise<PoolResponse[]> {
  const res = await api.get<PoolsListResponse>("/pools");
  return res.data.pools;
}

export function usePools() {
  return useQuery({
    queryKey: ["pools"],
    queryFn: getPools,
    enabled: Boolean(getToken()),
  });
}

export async function createPool(body: CreatePoolRequest): Promise<PoolResponse> {
  const res = await api.post<PoolResponse>("/pools", body);
  return res.data;
}

export function useCreatePool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPool,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pools"] }),
  });
}

export async function joinPool(inviteCode: string): Promise<JoinPoolResponse> {
  const res = await api.post<JoinPoolResponse>("/pools/join", { invite_code: inviteCode });
  return res.data;
}

export function useJoinPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinPool,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pools"] }),
  });
}

export async function updatePool(poolId: string, body: UpdatePoolRequest): Promise<PoolResponse> {
  const res = await api.put<PoolResponse>(`/pools/${poolId}`, body);
  return res.data;
}

export function useUpdatePool(poolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePoolRequest) => updatePool(poolId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pools"] }),
  });
}

export async function leavePool(poolId: string): Promise<void> {
  await api.post(`/pools/${poolId}/leave`);
}

export function useLeavePool(poolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leavePool(poolId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pools"] }),
  });
}

export async function getScoringRules(poolId: string): Promise<ScoringRuleResponse[]> {
  const res = await api.get<ScoringRulesListResponse>(`/pools/${poolId}/scoring-rules`);
  return res.data.rules;
}

export function useScoringRules(poolId: string) {
  return useQuery({
    queryKey: ["scoring-rules", poolId],
    queryFn: () => getScoringRules(poolId),
    enabled: Boolean(poolId),
  });
}

export async function updateScoringRules(
  poolId: string,
  rules: ScoringRuleInput[],
): Promise<ScoringRuleResponse[]> {
  const res = await api.put<ScoringRulesListResponse>(`/pools/${poolId}/scoring-rules`, { rules });
  return res.data.rules;
}

export function useUpdateScoringRules(poolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rules: ScoringRuleInput[]) => updateScoringRules(poolId, rules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scoring-rules", poolId] });
      queryClient.invalidateQueries({ queryKey: ["ranking", poolId] });
    },
  });
}

export async function getMembers(poolId: string): Promise<PoolMemberResponse[]> {
  const res = await api.get<PoolMembersListResponse>(`/pools/${poolId}/members`);
  return res.data.members;
}

export function useMembers(poolId: string) {
  return useQuery({
    queryKey: ["members", poolId],
    queryFn: () => getMembers(poolId),
    enabled: Boolean(poolId),
  });
}

export async function getRanking(poolId: string): Promise<RankingEntry[]> {
  const res = await api.get<RankingResponse>(`/pools/${poolId}/ranking`);
  return res.data.standings;
}

export function useRanking(poolId: string) {
  return useQuery({
    queryKey: ["ranking", poolId],
    queryFn: () => getRanking(poolId),
    enabled: Boolean(poolId),
  });
}

export async function getMemberPredictions(
  poolId: string,
  memberId: string,
): Promise<MemberPrediction[]> {
  const res = await api.get<MemberPredictionsResponse>(
    `/pools/${poolId}/members/${memberId}/predictions`,
  );
  return res.data.predictions;
}

export function useMemberPredictions(poolId: string, memberId: string | null) {
  return useQuery({
    queryKey: ["member-predictions", poolId, memberId],
    queryFn: () => getMemberPredictions(poolId, memberId as string),
    enabled: Boolean(poolId && memberId),
  });
}

export async function removeMember(poolId: string, memberId: string): Promise<void> {
  await api.delete(`/pools/${poolId}/members/${memberId}`);
}

export function useRemoveMember(poolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(poolId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", poolId] }),
  });
}
