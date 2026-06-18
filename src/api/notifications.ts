import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type {
  NotificationPreference,
  NotificationPreferencesListResponse,
  PreferenceItem,
} from "@/api/types";

export async function getNotificationPreferences(
  poolId: string,
): Promise<NotificationPreference[]> {
  const res = await api.get<NotificationPreferencesListResponse>(
    `/pools/${poolId}/notification-preferences`,
  );
  return res.data.preferences;
}

export function useNotificationPreferences(poolId: string) {
  return useQuery({
    queryKey: ["notification-preferences", poolId],
    queryFn: () => getNotificationPreferences(poolId),
    enabled: Boolean(poolId),
  });
}

export async function updateNotificationPreferences(
  poolId: string,
  preferences: PreferenceItem[],
): Promise<NotificationPreference[]> {
  const res = await api.put<NotificationPreferencesListResponse>(
    `/pools/${poolId}/notification-preferences`,
    { preferences },
  );
  return res.data.preferences;
}

export function useUpdateNotificationPreferences(poolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: PreferenceItem[]) =>
      updateNotificationPreferences(poolId, preferences),
    onSuccess: (data) => queryClient.setQueryData(["notification-preferences", poolId], data),
  });
}
