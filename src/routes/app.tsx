import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { usePools } from "@/api/pools";
import { getToken } from "@/api/session";
import { useAuthStore } from "@/store/auth-store";
import { initPushNotifications } from "@/lib/fcm";
import { NOTIFICATIONS_KEY } from "@/api/notifications";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

const tournamentId = import.meta.env.VITE_TOURNAMENT_ID;

function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pools = usePools();
  const poolId = useAuthStore((s) => s.poolId);
  const setPoolId = useAuthStore((s) => s.setPoolId);

  useEffect(() => {
    void initPushNotifications(() => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    });
  }, [queryClient]);

  const resolvedPoolId = useMemo(() => {
    const list = pools.data;
    if (!list || list.length === 0) return null;
    if (poolId && list.some((p) => p.id === poolId)) return poolId;
    const byTournament = list.find((p) => p.tournament_id === tournamentId);
    return (byTournament ?? list[0]).id;
  }, [pools.data, poolId]);

  useEffect(() => {
    if (resolvedPoolId && resolvedPoolId !== poolId) setPoolId(resolvedPoolId);
  }, [resolvedPoolId, poolId, setPoolId]);

  useEffect(() => {
    if (pools.isSuccess && pools.data.length === 0) {
      navigate({ to: "/bolao/entrar" });
    }
  }, [pools.isSuccess, pools.data, navigate]);

  if (pools.isPending || !poolId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando seu bolão...</p>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
