import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { getToken } from "@/api/session";
import type {
  Notification,
  NotificationPreference,
  NotificationPreferencesListResponse,
  NotificationsListResponse,
  PreferenceItem,
} from "@/api/types";

export const NOTIFICATIONS_KEY = ["notifications"] as const;

export async function getNotifications(unread = false): Promise<Notification[]> {
  const res = await api.get<NotificationsListResponse>("/notifications", {
    params: unread ? { unread: true } : undefined,
  });
  return res.data.notifications;
}

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => getNotifications(false),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount() {
  const query = useNotifications();
  const count = (query.data ?? []).filter((n) => n.read_at === null).length;
  return { ...query, count };
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const res = await api.patch<Notification>(`/notifications/${id}/read`);
  return res.data;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}

export async function registerDevice(token: string, platform = "web"): Promise<void> {
  await api.post("/notifications/devices", { token, platform });
}

export async function unregisterDevice(token: string): Promise<void> {
  await api.delete(`/notifications/devices/${encodeURIComponent(token)}`);
}

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

const GLOBAL_PREFERENCES_KEY = ["notification-preferences", "global"] as const;

export async function getGlobalNotificationPreferences(): Promise<NotificationPreference[]> {
  const res = await api.get<NotificationPreferencesListResponse>("/notifications/preferences");
  return res.data.preferences;
}

export function useGlobalNotificationPreferences() {
  return useQuery({
    queryKey: GLOBAL_PREFERENCES_KEY,
    queryFn: getGlobalNotificationPreferences,
    enabled: Boolean(getToken()),
  });
}

export async function updateGlobalNotificationPreferences(
  preferences: PreferenceItem[],
): Promise<NotificationPreference[]> {
  const res = await api.put<NotificationPreferencesListResponse>("/notifications/preferences", {
    preferences,
  });
  return res.data.preferences;
}

export function useUpdateGlobalNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: PreferenceItem[]) => updateGlobalNotificationPreferences(preferences),
    onSuccess: (data) => queryClient.setQueryData(GLOBAL_PREFERENCES_KEY, data),
  });
}
